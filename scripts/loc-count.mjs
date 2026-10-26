#!/usr/bin/env bun
/**
 * Honest line counter.
 *
 * Reports three numbers per workspace: total lines, blank lines, and comment
 * lines. It never inflates the count with generated output, lockfiles, or
 * node_modules. If the number here is small, the number everywhere else should
 * be small too.
 *
 *   bun run loc          # summary table
 *   bun run loc --json   # machine-readable
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const root = join(import.meta.dir, "..");

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
  "playwright-report",
  "test-results",
  ".git",
  ".vercel",
  "generated",
  "__pycache__",
  ".venv",
]);

const CODE_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".py",
  ".go",
  ".rs",
  ".rb",
  ".pl",
  ".sh",
  ".sql",
  ".json",
  ".jsonc",
  ".yml",
  ".yaml",
  ".toml",
  ".md",
  ".mdx",
  ".html",
  ".svg",
]);

const COMMENT_PREFIXES = ["//", "#", "--", "/*", "*", "*/", "<!--"];

const isComment = (line) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return COMMENT_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
};

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full)));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (!CODE_EXT.has(ext)) continue;
      if (entry.name.endsWith(".lock") || entry.name === "bun.lock") continue;
      if (entry.name.endsWith(".svg") && !full.includes("docs")) continue;
      out.push(full);
    }
  }
  return out;
}

const GROUPS = [
  { name: "apps/web", path: "apps/web" },
  { name: "packages/core", path: "packages/core" },
  { name: "packages/seed", path: "packages/seed" },
  { name: "packages/ui", path: "packages/ui" },
  { name: "packages/sdk", path: "packages/sdk" },
  { name: "packages/config", path: "packages/config" },
  { name: "scripts", path: "scripts" },
  { name: "e2e", path: "e2e" },
  { name: "docs", path: "docs" },
  { name: ".github", path: ".github" },
];

async function measure(files) {
  let total = 0;
  let blank = 0;
  let comments = 0;
  let bytes = 0;

  for (const file of files) {
    const text = await readFile(file, "utf8");
    bytes += Buffer.byteLength(text);
    const lines = text.split(/\r?\n/);
    if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    total += lines.length;
    for (const line of lines) {
      if (!line.trim()) blank += 1;
      else if (isComment(line)) comments += 1;
    }
  }

  return { total, blank, comments, code: total - blank - comments, files: files.length, bytes };
}

const results = [];
for (const group of GROUPS) {
  const files = await walk(join(root, group.path));
  if (files.length === 0) continue;
  results.push({ name: group.name, ...(await measure(files)) });
}

const rootFiles = [];
for (const name of [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "CHANGELOG.md",
]) {
  const full = join(root, name);
  try {
    await stat(full);
    rootFiles.push(full);
  } catch {
    /* not written yet */
  }
}
if (rootFiles.length > 0) {
  results.push({ name: "root docs", ...(await measure(rootFiles)) });
}

const totals = results.reduce(
  (accumulator, row) => ({
    total: accumulator.total + row.total,
    blank: accumulator.blank + row.blank,
    comments: accumulator.comments + row.comments,
    code: accumulator.code + row.code,
    files: accumulator.files + row.files,
    bytes: accumulator.bytes + row.bytes,
  }),
  { total: 0, blank: 0, comments: 0, code: 0, files: 0, bytes: 0 },
);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ groups: results, totals }, null, 2));
} else {
  const pad = (value, width) => String(value).padStart(width);
  console.log("");
  console.log("  ferroscope · line count");
  console.log("");
  console.log("  workspace            files    total     code   blank  comment");
  console.log("  ────────────────────────────────────────────────────────────────");
  for (const row of results) {
    console.log(
      `  ${row.name.padEnd(20)} ${pad(row.files, 5)} ${pad(row.total, 8)} ${pad(row.code, 8)} ${pad(row.blank, 7)} ${pad(row.comments, 8)}`,
    );
  }
  console.log("  ────────────────────────────────────────────────────────────────");
  console.log(
    `  ${"total".padEnd(20)} ${pad(totals.files, 5)} ${pad(totals.total, 8)} ${pad(totals.code, 8)} ${pad(totals.blank, 7)} ${pad(totals.comments, 8)}`,
  );
  console.log("");
  console.log(`  ${(totals.bytes / 1024).toFixed(1)} KiB of text across ${totals.files} files.`);
  console.log("  Excludes node_modules, .next, dist, lockfiles, and generated output.");
  console.log("");
}

if (totals.code === 0) {
  console.error("no source lines found — check the paths in scripts/loc-count.mjs");
  process.exit(1);
}
