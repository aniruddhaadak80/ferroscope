# Vendored fonts

These files are served from the app bundle instead of Google's CDN so that
`next build` is reproducible offline and on locked-down CI runners.

| File                                | Family           | Axis / weights    | Source                                             |
| ----------------------------------- | ---------------- | ----------------- | -------------------------------------------------- |
| `manrope-latin.woff2`               | Manrope          | variable, 200–800 | https://fonts.google.com/specimen/Manrope          |
| `instrument-serif-400.woff2`        | Instrument Serif | 400 normal        | https://fonts.google.com/specimen/Instrument+Serif |
| `instrument-serif-400-italic.woff2` | Instrument Serif | 400 italic        | https://fonts.google.com/specimen/Instrument+Serif |
| `jetbrains-mono-latin.woff2`        | JetBrains Mono   | variable, 100–800 | https://fonts.google.com/specimen/JetBrains+Mono   |

All three families are licensed under the SIL Open Font License 1.1, which
permits bundling and redistribution with the license notice retained. The
license text is available at https://openfontlicense.org/open-font-license-official-text/
and in each upstream repository.

Regenerate with:

```bash
bun scripts/vendor-fonts.mjs
```

The script downloads the Latin subset (unicode-range `U+0000-00FF`) from the
Google Fonts CSS API and writes the `.woff2` payloads into this directory.
`apps/web/app/layout.tsx` loads them through `next/font/local`.
