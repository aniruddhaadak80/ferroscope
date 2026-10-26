/**
 * Vendors the three OFL font families into apps/web/fonts so `next build` never
 * depends on fonts.googleapis.com at build time.
 *
 * Each family is downloaded once, as a variable font where the family has one
 * (Manrope 200-800, JetBrains Mono 100-800) and as static faces where it does
 * not (Instrument Serif 400 normal/italic).
 *
 * Usage: bun scripts/vendor-fonts.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(import.meta.dir, "..", "apps", "web", "fonts");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Latin subset only; the UI ships English copy. */
const LATIN = /unicode-range:\s*U\+0000-00FF/;

const FONTS = [
  {
    file: "manrope-latin.woff2",
    css: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
    style: "normal",
  },
  {
    file: "instrument-serif-400.woff2",
    css: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
    style: "normal",
  },
  {
    file: "instrument-serif-400-italic.woff2",
    css: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
    style: "italic",
  },
  {
    file: "jetbrains-mono-latin.woff2",
    css: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap",
    style: "normal",
  },
];

const cssCache = new Map();

async function getCss(url) {
  if (!cssCache.has(url)) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`CSS ${res.status} for ${url}`);
    cssCache.set(url, await res.text());
  }
  return cssCache.get(url);
}

function latinFaceUrl(css, style) {
  for (const block of css.split("@font-face").slice(1)) {
    if (!LATIN.test(block)) continue;
    const blockStyle = block.match(/font-style:\s*(\w+)/)?.[1] ?? "normal";
    if (blockStyle !== style) continue;
    const url = block.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1];
    if (url) return url;
  }
  return null;
}

await mkdir(OUT, { recursive: true });

for (const font of FONTS) {
  const url = latinFaceUrl(await getCss(font.css), font.style);
  if (!url) throw new Error(`no latin ${font.style} face for ${font.file}`);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`font ${res.status} for ${font.file}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  await writeFile(join(OUT, font.file), bytes);
  console.log(`${font.file} <- ${(bytes.byteLength / 1024).toFixed(1)} KiB`);
}
