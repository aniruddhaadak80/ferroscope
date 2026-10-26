#!/usr/bin/env bun
/**
 * Reads the build output and prints the routes Next actually emitted. Useful in
 * CI as a guard: if a refactor silently drops a page, the count changes and the
 * log says so.
 *
 * "Addressable URLs" is the number we publish: every prerendered path plus the
 * server-rendered routes. Dynamic route *patterns* are not counted, because
 * `/atlas/[slug]` is 27 URLs, not one.
 *
 *   bun scripts/count-routes.mjs           # summary
 *   bun scripts/count-routes.mjs --strict  # fail if the total is not 95
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const EXPECTED_TOTAL = 95;

const root = join(import.meta.dir, "..");
const nextDir = join(root, "apps", "web", ".next");

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
};

const appRoutes = await readJson(join(nextDir, "app-path-routes-manifest.json"));
const prerender = await readJson(join(nextDir, "prerender-manifest.json"));
const routesManifest = await readJson(join(nextDir, "routes-manifest.json"));

if (!appRoutes) {
  console.error("No app-path-routes-manifest.json found. Run `bun run build` first.");
  process.exit(1);
}

const patterns = Object.keys(appRoutes)
  .filter((route) => !route.startsWith("/_"))
  .map((route) => (route === "/page" ? "/" : route.replace(/\/(page|route)$/, "")))
  .sort();
const prerendered = Object.keys(prerender?.routes ?? {}).sort();

// A pattern is server-rendered when it is static (concrete) and was not
// prerendered. Dynamic patterns such as `/atlas/[slug]` were expanded into
// concrete prerendered paths above, so they are already counted there.
const isDynamic = (route) => route.includes("[");
const serverRendered = patterns.filter(
  (route) => !isDynamic(route) && !prerendered.includes(route),
);

const html = prerendered.filter(
  (route) =>
    !route.startsWith("/api/") &&
    !["/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/_not-found"].includes(route),
);
const apiPrerendered = prerendered.filter((route) => route.startsWith("/api/"));
const apiDynamic = serverRendered.filter((route) => route.startsWith("/api/"));
const total = prerendered.length + serverRendered.length;

console.log("");
console.log(`  route patterns    ${patterns.length}`);
console.log(`  prerendered       ${prerendered.length}`);
console.log(`  server-rendered   ${serverRendered.length}`);
console.log(`  addressable URLs  ${total}`);
console.log(`  html pages        ${html.length}`);
console.log(`  api endpoints     ${apiPrerendered.length + apiDynamic.length}`);
console.log(`  redirects         ${routesManifest?.redirects?.length ?? 0}`);
console.log("");

if (serverRendered.length > 0) {
  console.log("  server-rendered");
  for (const route of serverRendered) console.log(`    ${route}`);
  console.log("");
}

if (prerendered.length === 0) {
  console.error("route manifest is empty — the build is not what you think it is");
  process.exit(1);
}

if (process.argv.includes("--strict") && total !== EXPECTED_TOTAL) {
  console.error(
    `expected ${EXPECTED_TOTAL} addressable URLs, found ${total}. ` +
      "Update README.md, CONTRIBUTING.md, and EXPECTED_TOTAL together if the change is intended.",
  );
  process.exit(1);
}
