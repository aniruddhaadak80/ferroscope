#!/usr/bin/env bun
/**
 * Deterministic asset generation.
 *
 * Every SVG in public/ is produced from this file so the brand cannot drift
 * between the logo, the banner, the screenshots, and the README. Run with
 * `bun run assets`. No network, no dependencies, no binary blobs.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = join(import.meta.dir, "..");
const pub = join(root, "apps", "web", "public");
const docs = join(root, "docs", "assets");

const INK = "#08090b";
const BONE = "#f2eee4";
const AMBER = "#f0a63c";
const RUST = "#e5644a";
const MOSS = "#8fb996";
const MUTED = "#9a9b9e";
const LINE = "#24282e";

const write = async (path, content) => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
  console.log(`wrote ${path.replace(root, ".")}`);
};

/* ------------------------------------------------------------------ mark */

const mark = (
  size,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" role="img" aria-label="Ferroscope mark">
  <rect width="32" height="32" fill="${INK}"/>
  <rect x="0.5" y="0.5" width="31" height="31" stroke="${BONE}" stroke-opacity="0.28"/>
  <circle cx="16" cy="16" r="10.5" stroke="${BONE}" stroke-opacity="0.18"/>
  <circle cx="16" cy="16" r="6" stroke="${AMBER}" stroke-width="1.4"/>
  <circle cx="16" cy="16" r="1.6" fill="${AMBER}"/>
  <path d="M16 2.5V9M16 23v6.5M2.5 16H9M23 16h6.5" stroke="${AMBER}" stroke-width="1.4"/>
</svg>
`;

/* ---------------------------------------------------------------- banner */

const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="620" viewBox="0 0 1600 620" fill="none" role="img" aria-label="Ferroscope — map your blast radius before the breach does">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" stroke="${BONE}" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="1600" height="620" fill="${INK}"/>
  <rect width="1600" height="620" fill="url(#grid)"/>
  <circle cx="1310" cy="300" r="330" fill="url(#glow)"/>

  <g opacity="0.9">
    <circle cx="1308" cy="306" r="150" stroke="${BONE}" stroke-opacity="0.1"/>
    <circle cx="1308" cy="306" r="90" stroke="${AMBER}" stroke-opacity="0.5"/>
    <circle cx="1308" cy="306" r="14" fill="${AMBER}"/>
    <path d="M1308 156v60M1308 456v-60M1158 306h60M1458 306h-60" stroke="${AMBER}" stroke-width="2"/>
    ${[
      [1400, 200],
      [1428, 360],
      [1250, 430],
      [1206, 210],
      [1370, 456],
    ]
      .map(
        ([x, y], index) =>
          `<g><line x1="1308" y1="306" x2="${x}" y2="${y}" stroke="${AMBER}" stroke-opacity="0.35" stroke-dasharray="4 5"/><circle cx="${x}" cy="${y}" r="${10 + index * 2}" fill="${index % 2 ? RUST : AMBER}" fill-opacity="0.18" stroke="${index % 2 ? RUST : AMBER}"/></g>`,
      )
      .join("\n    ")}
  </g>

  <g transform="translate(96 92)">
    <rect x="0.5" y="0.5" width="43" height="43" stroke="${BONE}" stroke-opacity="0.28"/>
    <circle cx="22" cy="22" r="14" stroke="${BONE}" stroke-opacity="0.18"/>
    <circle cx="22" cy="22" r="8" stroke="${AMBER}" stroke-width="1.6"/>
    <circle cx="22" cy="22" r="2.2" fill="${AMBER}"/>
    <path d="M22 3v8M22 33v8M3 22h8M33 22h8" stroke="${AMBER}" stroke-width="1.6"/>
    <text x="62" y="29" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="19" letter-spacing="9">FERROSCOPE</text>
  </g>

  <text x="96" y="268" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="16" letter-spacing="7">EXPOSURE OBSERVATORY</text>

  <text x="94" y="368" fill="${BONE}" font-family="Georgia, 'Times New Roman', serif" font-size="84" letter-spacing="-3">Map your blast radius</text>
  <text x="94" y="456" fill="${AMBER}" font-family="Georgia, 'Times New Roman', serif" font-size="84" letter-spacing="-3">before the breach does.</text>

  <text x="96" y="524" fill="${MUTED}" font-family="'Manrope', system-ui, sans-serif" font-size="23">27 incidents. One personal intersection. Fixes ranked by risk removed per minute.</text>

  <g transform="translate(96 560)" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="3">
    <text fill="${MUTED}">SEED 2718</text>
    <text x="150" fill="${MUTED}">ZERO API KEYS</text>
    <text x="350" fill="${MUTED}">OFFLINE-FIRST</text>
    <text x="540" fill="${MUTED}">NEXT.JS 15</text>
  </g>
</svg>
`;

/* ------------------------------------------------------------------- og */

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none" role="img" aria-label="Ferroscope">
  <rect width="1200" height="630" fill="${INK}"/>
  <defs>
    <radialGradient id="og-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="1040" cy="240" r="300" fill="url(#og-glow)"/>
  <circle cx="1040" cy="240" r="120" stroke="${AMBER}" stroke-opacity="0.35"/>
  <circle cx="1040" cy="240" r="200" stroke="${BONE}" stroke-opacity="0.07"/>

  <g transform="translate(72 64)">
    <rect x="0.5" y="0.5" width="35" height="35" stroke="${BONE}" stroke-opacity="0.3"/>
    <circle cx="18" cy="18" r="9" stroke="${AMBER}" stroke-width="1.5"/>
    <circle cx="18" cy="18" r="2" fill="${AMBER}"/>
    <text x="52" y="25" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="17" letter-spacing="8">FERROSCOPE</text>
  </g>

  <text x="72" y="200" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="15" letter-spacing="6">BLACK OCTOBER / SEED 2718</text>
  <text x="70" y="300" fill="${BONE}" font-family="Georgia, serif" font-size="76" letter-spacing="-3">Map your blast radius</text>
  <text x="70" y="380" fill="${AMBER}" font-family="Georgia, serif" font-size="76" letter-spacing="-3">before the breach does.</text>
  <text x="72" y="444" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="21">27 incidents. Declare your stack. Rank the fixes by risk removed per minute.</text>

  <g transform="translate(72 500)" font-family="'JetBrains Mono', monospace">
    <rect width="1056" height="1" fill="${LINE}"/>
    ${[
      ["27", "INCIDENTS"],
      ["2", "IN PATH"],
      ["3 MIN", "FIRST FIX"],
      ["0", "API KEYS"],
    ]
      .map(
        ([value, label], index) =>
          `<g transform="translate(${index * 264} 28)"><text fill="${BONE}" font-size="34">${value}</text><text y="26" fill="#6b6d72" font-size="11" letter-spacing="3">${label}</text></g>`,
      )
      .join("")}
  </g>
</svg>
`;

/* -------------------------------------------------------------- favicon */

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Ferroscope">
  <rect width="64" height="64" rx="10" fill="${INK}"/>
  <circle cx="32" cy="32" r="17" stroke="${BONE}" stroke-opacity="0.22"/>
  <circle cx="32" cy="32" r="10" stroke="${AMBER}" stroke-width="2.6"/>
  <circle cx="32" cy="32" r="2.8" fill="${AMBER}"/>
  <path d="M32 6v13M32 45v13M6 32h13M45 32h13" stroke="${AMBER}" stroke-width="2.6"/>
</svg>
`;

const apple = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Ferroscope">
  <rect width="180" height="180" fill="${INK}"/>
  <rect x="0.5" y="0.5" width="179" height="179" stroke="${BONE}" stroke-opacity="0.22"/>
  <circle cx="90" cy="90" r="51" stroke="${BONE}" stroke-opacity="0.2"/>
  <circle cx="90" cy="90" r="30" stroke="${AMBER}" stroke-width="4"/>
  <circle cx="90" cy="90" r="8" fill="${AMBER}"/>
  <path d="M90 15v30M90 135v30M15 90h30M135 90h30" stroke="${AMBER}" stroke-width="4"/>
</svg>
`;

/* --------------------------------------------------------- screenshots */

const frame = (
  title,
  subtitle,
  body,
  accent = AMBER,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960" fill="none" role="img" aria-label="${title}">
  <rect width="1440" height="960" fill="${INK}"/>
  <rect y="0" width="1440" height="64" fill="#0f1114"/>
  <rect y="63.5" width="1440" height="1" fill="${LINE}"/>
  <circle cx="28" cy="32" r="5" fill="${RUST}" fill-opacity="0.7"/>
  <circle cx="46" cy="32" r="5" fill="${AMBER}" fill-opacity="0.7"/>
  <circle cx="64" cy="32" r="5" fill="${MOSS}" fill-opacity="0.7"/>
  <text x="150" y="37" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="6">FERROSCOPE</text>
  <text x="420" y="37" fill="${MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">ATLAS</text>
  <text x="505" y="37" fill="${MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">BLAST RADIUS</text>
  <text x="640" y="37" fill="${MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">PLANNER</text>
  <text x="740" y="37" fill="${MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">LEDGER</text>
  <text x="820" y="37" fill="${MUTED}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">PLAYBOOKS</text>
  <rect x="1268" y="18" width="144" height="28" fill="none" stroke="${LINE}"/>
  <text x="1282" y="37" fill="${MUTED}" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="2">SEARCH  ⌘K</text>

  <g transform="translate(56 128)">
    <text fill="${accent}" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="5">${subtitle}</text>
    <text y="76" fill="${BONE}" font-family="Georgia, serif" font-size="58" letter-spacing="-2">${title}</text>
  </g>

  ${body}

  <rect y="930" width="1440" height="30" fill="#0f1114"/>
  <text x="56" y="950" fill="#6b6d72" font-family="'JetBrains Mono', monospace" font-size="10" letter-spacing="3">MIT © 2026 ANIRUDDHA ADAK · SEED 2718 · NO TELEMETRY</text>
</svg>
`;

const card = (x, y, width, height, fill = "#0f1114") =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${LINE}"/>`;

const label = (x, y, text, color = "#6b6d72", size = 10) =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="'JetBrains Mono', monospace" font-size="${size}" letter-spacing="3">${text}</text>`;

const screenshotHero = frame(
  "Map your blast radius before the breach does.",
  "BLACK OCTOBER / EXPOSURE OBSERVATORY",
  `
  <g transform="translate(56 300)">
    <text fill="${MUTED}" font-family="system-ui, sans-serif" font-size="18">Twenty-seven incidents landed in forty-eight hours.</text>
    <text y="28" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="18">Most cannot touch you. Two can.</text>
    <rect y="64" width="196" height="44" fill="${AMBER}"/>
    <text x="26" y="92" fill="${INK}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">DECLARE YOUR STACK</text>
    <rect x="212" y="64" width="196" height="44" fill="none" stroke="${LINE}"/>
    <text x="238" y="92" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="11" letter-spacing="3">READ THE 27</text>
  </g>

  <g transform="translate(800 120)">
    ${card(0, 0, 584, 520)}
    <rect x="0.5" y="0.5" width="583" height="52" fill="none" stroke="${LINE}"/>
    ${label(24, 32, "DEFAULT PROFILE / THIS LAPTOP")}
    <rect x="470" y="14" width="92" height="24" fill="${RUST}" fill-opacity="0.12" stroke="${RUST}" stroke-opacity="0.4"/>
    <text x="484" y="30" fill="${RUST}" font-family="'JetBrains Mono', monospace" font-size="9" letter-spacing="2">EXPOSED</text>

    <circle cx="110" cy="170" r="64" stroke="${LINE}"/>
    <circle cx="110" cy="170" r="64" stroke="${AMBER}" stroke-width="6" stroke-dasharray="268 402" transform="rotate(-90 110 170)"/>
    <text x="110" y="180" fill="${BONE}" font-family="Georgia, serif" font-size="42" text-anchor="middle">44</text>
    <text x="110" y="204" fill="#6b6d72" font-family="'JetBrains Mono', monospace" font-size="9" letter-spacing="2" text-anchor="middle">SAFETY</text>

    <text x="216" y="148" fill="${BONE}" font-family="Georgia, serif" font-size="26">2 incidents intersect</text>
    <text x="216" y="174" fill="${BONE}" font-family="Georgia, serif" font-size="26">this stack.</text>
    <text x="216" y="200" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="12">Nothing is confirmed breached.</text>

    <rect x="216" y="222" width="330" height="6" fill="${LINE}"/>
    <rect x="216" y="222" width="185" height="6" fill="${RUST}"/>
    ${label(216, 250, "EXPOSURE 56 / 100", "#6b6d72", 9)}

    <rect x="0.5" y="286" width="583" height="1" fill="${LINE}"/>
    ${label(24, 316, "LARGEST CONTRIBUTORS")}
    <text x="24" y="350" fill="${BONE}" font-family="system-ui, sans-serif" font-size="13">eMudhra root keys</text>
    <text x="520" y="350" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="12">+43</text>
    <rect x="24" y="366" width="536" height="1" fill="${LINE}"/>
    <text x="24" y="396" fill="${BONE}" font-family="system-ui, sans-serif" font-size="13">State Bank of India</text>
    <text x="520" y="396" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="12">+13</text>
    <rect x="24" y="412" width="536" height="1" fill="${LINE}"/>

    <circle cx="292" cy="470" r="6" fill="${AMBER}"/>
    <circle cx="292" cy="470" r="58" stroke="${BONE}" stroke-opacity="0.12"/>
    <circle cx="220" cy="446" r="4" fill="none" stroke="${LINE}"/>
    <circle cx="356" cy="438" r="4" fill="none" stroke="${LINE}"/>
    <line x1="292" y1="470" x2="356" y2="438" stroke="${AMBER}" stroke-opacity="0.5" stroke-dasharray="3 4"/>
    <line x1="292" y1="470" x2="220" y2="446" stroke="${AMBER}" stroke-opacity="0.5" stroke-dasharray="3 4"/>
    <circle cx="356" cy="438" r="14" fill="${RUST}" fill-opacity="0.18" stroke="${RUST}"/>
    <circle cx="220" cy="446" r="14" fill="${AMBER}" fill-opacity="0.18" stroke="${AMBER}"/>
  </g>

  <g transform="translate(56 760)">
    ${card(0, 0, 198, 96)}
    <text x="20" y="42" fill="${BONE}" font-family="Georgia, serif" font-size="32">27</text>
    ${label(20, 66, "INCIDENTS")}
    ${card(206, 0, 198, 96)}
    <text x="226" y="42" fill="${BONE}" font-family="Georgia, serif" font-size="32">2</text>
    ${label(226, 66, "IN YOUR PATH")}
    ${card(412, 0, 198, 96)}
    <text x="432" y="42" fill="${AMBER}" font-family="Georgia, serif" font-size="32">44</text>
    ${label(432, 66, "SAFETY SCORE")}
    ${card(618, 0, 198, 96)}
    <text x="638" y="42" fill="${MOSS}" font-family="Georgia, serif" font-size="32">3 MIN</text>
    ${label(638, 66, "FIRST FIX")}
  </g>
`,
);

const screenshotAtlas = frame(
  "27 incidents. A very small number of them are yours.",
  "THE ATLAS",
  `
  <g transform="translate(56 260)">
    ${[0, 1, 2]
      .map((row) =>
        [0, 1, 2, 3]
          .map((col) => {
            const x = col * 336;
            const y = row * 196;
            const colors = [RUST, AMBER, MOSS, AMBER];
            return `
        ${card(x, y, 320, 180)}
        <rect x="${x + 20}" y="${y + 20}" width="64" height="20" fill="${colors[(row + col) % 4]}" fill-opacity="0.12" stroke="${colors[(row + col) % 4]}" stroke-opacity="0.4"/>
        ${label(x + 30, y + 34, ["CRITICAL", "HIGH", "MEDIUM", "LOW"][(row + col) % 4], colors[(row + col) % 4], 8)}
        <text x="${x + 20}" y="${y + 82}" fill="${BONE}" font-family="Georgia, serif" font-size="24">${
          [
            "PHP2Shell",
            "eMudhra roots",
            "Railway",
            "LiteLLM",
            "GitLab Onigmo",
            "SBI",
            "Plex",
            "Tor relays",
            "Signal",
            "AOMEI",
            "Meta Muse",
            "nginx",
          ][row * 4 + col]
        }</text>
        <text x="${x + 20}" y="${y + 108}" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="11">${
          [
            "A hole in the runtime behind most of the web",
            "The keys that prove a site is real were cracked",
            "Customer secret keys stolen from a host",
            "An AI package downloaded 3.4M times a day, poisoned",
            "A 10-out-of-10 hole in every self-managed version",
            "India's biggest bank confirms a data breach",
            "Attackers are breaking into home media servers",
            "333 relays hijacked to steal logins",
            "A bug could leave your mic on after you hang up",
            "Backup software handed out a backdoor",
            "An AI agent exposed personal secrets",
            "Three critical holes running a third of the web",
          ][row * 4 + col]
        }</text>
        <rect x="${x + 20}" y="${y + 148}" width="280" height="1" fill="${LINE}"/>
        ${label(x + 20, y + 168, "OPEN FILE →", "#6b6d72", 8)}
      `;
          })
          .join(""),
      )
      .join("")}
  </g>
`,
);

const screenshotPlanner = frame(
  "Fix the cheapest thing first.",
  "PLANNER / RISK REMOVED PER MINUTE",
  `
  <g transform="translate(56 260)">
    ${card(0, 0, 940, 600)}
    ${[0, 1, 2, 3, 4]
      .map((row) => {
        const y = 92 + row * 98;
        return `
      <rect x="0" y="${y - 30}" width="940" height="1" fill="${LINE}"/>
      <rect x="20" y="${y - 10}" width="18" height="18" fill="${row < 2 ? MOSS : "none"}" stroke="${row < 2 ? MOSS : LINE}"/>
      <text x="66" y="${y + 6}" fill="${row < 2 ? "#6b6d72" : BONE}" font-family="system-ui, sans-serif" font-size="15">${
        [
          "Refresh the Python CA bundle",
          "Turn on phishing-resistant 2FA",
          "Install every pending Windows update",
          "Rotate SBI credentials and UPI PIN",
          "Audit GitHub Actions across your repos",
        ][row]
      }</text>
      <text x="66" y="${y + 28}" fill="#6b6d72" font-family="system-ui, sans-serif" font-size="11">${
        [
          "3 minutes · 85% covered",
          "12 minutes · 60% covered",
          "15 minutes · 55% covered",
          "10 minutes · 80% covered",
          "30 minutes · 60% covered",
        ][row]
      }</text>
      <rect x="640" y="${y - 2}" width="120" height="4" fill="${LINE}"/>
      <rect x="640" y="${y - 2}" width="${[104, 72, 66, 58, 44][row]}" height="4" fill="${AMBER}"/>
      <text x="640" y="${y + 24}" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="9">${["3.53/min", "2.1/min", "1.6/min", "1.3/min", "0.9/min"][row]}</text>
      <text x="820" y="${y + 6}" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="13">−${[12, 9, 7, 6, 4][row]} pts</text>
      `;
      })
      .join("")}
  </g>

  <g transform="translate(1020 260)">
    ${card(0, 0, 364, 260)}
    ${label(24, 32, "RESIDUAL RISK")}
    <circle cx="100" cy="140" r="54" stroke="${LINE}"/>
    <circle cx="100" cy="140" r="54" stroke="${RUST}" stroke-width="5" stroke-dasharray="${(56 / 100) * 339} 339" transform="rotate(-90 100 140)"/>
    <text x="100" y="150" fill="${BONE}" font-family="Georgia, serif" font-size="34" text-anchor="middle">19</text>
    ${label(196, 122, "BASELINE 56")}
    <text x="196" y="156" fill="${MOSS}" font-family="Georgia, serif" font-size="30">−37</text>
    ${label(196, 180, "POINTS REMOVED")}
    <rect x="24" y="218" width="316" height="1" fill="${LINE}"/>
    ${label(24, 242, "34 MIN OF WORK LEFT")}

    ${card(0, 280, 364, 320)}
    ${label(24, 312, "COVERAGE")}
    ${[0, 1, 2, 3, 4]
      .map(
        (row) => `
      <text x="24" y="${350 + row * 44}" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="12">${["eMudhra", "SBI breach", "PHP2Shell", "LiteLLM", "GitLab RCE"][row]}</text>
      <text x="310" y="${350 + row * 44}" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">${[3, 3, 1, 2, 1][row]}</text>
      <rect x="24" y="${360 + row * 44}" width="316" height="1" fill="${LINE}"/>
    `,
      )
      .join("")}
  </g>
`,
);

const screenshotBlast = frame(
  "The shortest honest explanation of why.",
  "BLAST RADIUS / DETERMINISTIC LAYOUT",
  `
  <g transform="translate(56 260)">
    ${card(0, 0, 950, 620)}
    ${Array.from({ length: 14 })
      .map(
        (_, index) =>
          `<line x1="${index * 72}" y1="0" x2="${index * 72}" y2="620" stroke="${BONE}" stroke-opacity="0.04"/>`,
      )
      .join("")}
    ${Array.from({ length: 9 })
      .map(
        (_, index) =>
          `<line x1="0" y1="${index * 72}" x2="950" y2="${index * 72}" stroke="${BONE}" stroke-opacity="0.04"/>`,
      )
      .join("")}

    <circle cx="475" cy="310" r="190" fill="${AMBER}" fill-opacity="0.05"/>
    <circle cx="475" cy="310" r="120" stroke="${BONE}" stroke-opacity="0.1"/>
    <circle cx="475" cy="310" r="230" stroke="${BONE}" stroke-opacity="0.06"/>

    ${[
      [475, 310, 340, 140],
      [475, 310, 620, 200],
      [475, 310, 590, 430],
      [475, 310, 340, 480],
      [475, 310, 220, 220],
      [475, 310, 250, 400],
      [475, 310, 700, 320],
    ]
      .map(
        ([x1, y1, x2, y2]) =>
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${AMBER}" stroke-opacity="0.4" stroke-dasharray="4 6"/>`,
      )
      .join("")}

    ${[
      [340, 140, "eMudhra", RUST],
      [620, 200, "SBI", RUST],
      [590, 430, "PHP2Shell", AMBER],
      [340, 480, "LiteLLM", AMBER],
      [220, 220, "Edge", MUTED],
      [250, 400, "Python", MUTED],
      [700, 320, "GitHub", MUTED],
    ]
      .map(
        ([x, y, name, color]) =>
          `<g><circle cx="${x}" cy="${y}" r="22" fill="${color}" fill-opacity="0.16" stroke="${color}"/><circle cx="${x}" cy="${y}" r="5" fill="${color}"/><text x="${x}" y="${y - 34}" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="12" text-anchor="middle">${name}</text></g>`,
      )
      .join("")}

    <rect x="455" y="290" width="40" height="40" fill="${INK}" stroke="${AMBER}" stroke-width="2"/>
    <rect x="469" y="304" width="12" height="12" fill="${AMBER}"/>
    ${label(475 - 18, 358, "YOU", BONE, 10)}
  </g>

  <g transform="translate(1030 260)">
    ${card(0, 0, 354, 300)}
    ${label(24, 32, "EXPOSURE")}
    <text x="24" y="100" fill="${BONE}" font-family="Georgia, serif" font-size="56">2 / 27</text>
    <text x="24" y="130" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="12">incidents intersect your stack.</text>
    <rect x="24" y="154" width="306" height="1" fill="${LINE}"/>
    ${label(24, 184, "DECLARED", "#6b6d72", 9)}
    <text x="330" y="184" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="13" text-anchor="end">14</text>
    ${label(24, 218, "NEAR MISS", "#6b6d72", 9)}
    <text x="330" y="218" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="13" text-anchor="end">5</text>
    ${label(24, 252, "EDGES", "#6b6d72", 9)}
    <text x="330" y="252" fill="${BONE}" font-family="'JetBrains Mono', monospace" font-size="13" text-anchor="end">23</text>

    ${card(0, 320, 354, 300)}
    ${label(24, 352, "MATCHED")}
    ${["eMudhra root keys", "State Bank of India"]
      .map(
        (name, index) => `
      <text x="24" y="${392 + index * 44}" fill="${BONE}" font-family="system-ui, sans-serif" font-size="13">${name}</text>
      <text x="320" y="${392 + index * 44}" fill="${AMBER}" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">+${[43, 13][index]}</text>
      <rect x="24" y="${404 + index * 44}" width="306" height="1" fill="${LINE}"/>
    `,
      )
      .join("")}
    <text x="24" y="500" fill="${MUTED}" font-family="system-ui, sans-serif" font-size="11">Click a node to isolate its edges.</text>
    <rect x="24" y="528" width="140" height="36" fill="none" stroke="${LINE}"/>
    ${label(46, 551, "EDIT STACK", BONE, 9)}
  </g>
`,
);

/* ------------------------------------------------------------------- run */

await write(join(pub, "favicon.svg"), favicon);
await write(join(pub, "apple-touch-icon.svg"), apple);
await write(
  join(pub, "logo.svg"),
  mark(64).replace('width="64" height="64"', 'width="512" height="512"'),
);
await write(join(pub, "banner.svg"), banner);
await write(join(pub, "og.svg"), og);
await write(join(pub, "screenshots", "hero.svg"), screenshotHero);
await write(join(pub, "screenshots", "atlas.svg"), screenshotAtlas);
await write(join(pub, "screenshots", "planner.svg"), screenshotPlanner);
await write(join(pub, "screenshots", "blast-radius.svg"), screenshotBlast);

await write(join(docs, "logo.svg"), mark(64));
await write(join(docs, "banner.svg"), banner);
await write(join(docs, "og.svg"), og);

console.log("\nassets generated");
