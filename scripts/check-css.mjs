#!/usr/bin/env bun
/**
 * Guards the Tailwind v4 source graph.
 *
 * Two failure modes have bitten this repo:
 *   1. An `@source` path that silently resolves to nothing, so utilities used
 *      only by a workspace package (`@ferroscope/ui`) disappear from the
 *      production stylesheet while the local build still looks fine.
 *   2. A build environment without `.git`, where Tailwind's automatic content
 *      detection cannot walk up to the monorepo root.
 *
 * Usage: bun scripts/check-css.mjs   (after `next build`)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const cssDir = join(root, "apps", "web", ".next", "static", "css");
const globals = join(root, "apps", "web", "app", "globals.css");

if (!existsSync(cssDir)) {
  console.error(`check-css: no compiled CSS at ${cssDir}. Run \`next build\` first.`);
  process.exit(1);
}

const problems = [];

// 1. Every @source must exist relative to globals.css.
const sourceLines = readFileSync(globals, "utf8").match(/^\s*@source\s+"([^"]+)"/gm) ?? [];
const uiSource = resolve(dirname(globals), "../../../packages/ui/src");

for (const line of sourceLines) {
  const spec = line.match(/"([^"]+)"/)?.[1] ?? "";
  const base = resolve(dirname(globals), spec.replace(/\/\*\*.*$/, ""));
  if (!existsSync(base)) problems.push(`@source "${spec}" does not exist (resolved to ${base})`);
}

if (!sourceLines.some((line) => line.includes("packages/ui/src"))) {
  problems.push("globals.css no longer declares @source for packages/ui/src");
}
if (!existsSync(uiSource)) {
  problems.push(`packages/ui/src is missing at ${uiSource}`);
}

// 2. The compiled stylesheet must carry utilities that only packages/ui uses.
const css = readdirSync(cssDir)
  .filter((file) => file.endsWith(".css"))
  .map((file) => readFileSync(join(cssDir, file), "utf8"))
  .join("\n");

const required = [
  { needle: ".fixed{position:fixed", why: "Noise layer would fall into flow and add 150px" },
  { needle: ".z-50{", why: "fixed overlays would stack under content" },
  { needle: "position:absolute", why: "corner ticks and grid backdrops would not position" },
];

for (const { needle, why } of required) {
  if (!css.includes(needle)) problems.push(`compiled CSS is missing \`${needle}\` — ${why}`);
}

if (problems.length > 0) {
  console.error("check-css: FAILED");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `check-css: ok — ${sourceLines.length} @source paths resolve, required utilities present`,
);
