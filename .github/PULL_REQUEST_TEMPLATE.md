## What changed

<!-- One paragraph. If the diff needs a second paragraph to explain, it is probably two PRs. -->

## Why

<!-- The user-visible problem, or the bug. Link issues with "Fixes #123". -->

## How to test

```bash
bun install
bun run verify
bun run test:e2e   # if the change touches a route or the UI
```

<!-- Describe the manual check too, especially for anything visual. -->

## Checklist

- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run test` passes
- [ ] `bun run build` passes (92 routes, 0 errors)
- [ ] Numbers that changed are explained (score, risk, dataset counts)
- [ ] No secrets, tokens, or personal inventory added
- [ ] If the dataset changed: a public source is included and the version note is updated

## Screenshots

<!-- Required for visual changes. Dark and light, desktop and mobile. -->
