# Runbook — deploy to Vercel

Production is a single Vercel project connected to `main`. There is no database, no cron, and no
environment secret required.

---

## Prerequisites

```bash
gh auth status
vercel whoami
```

Both should return the `aniruddhaadak80` account. The repository must already exist on GitHub.

## First deployment

From the repository root:

```bash
vercel link            # create/link the project, root directory: repository root
vercel --prod
```

`vercel.json` uses the **services** layout, which is what makes a Turborepo work without setting a
root directory in the dashboard:

```json
{
  "services": {
    "web": {
      "root": "apps/web",
      "installCommand": "cd ../.. && bun install --frozen-lockfile",
      "buildCommand": "cd ../.. && bunx turbo run build --filter=@ferroscope/web --force",
      "outputDirectory": ".next"
    }
  },
  "rewrites": [{ "source": "/(.*)", "destination": { "service": "web" } }]
}
```

If a build fails with "No Next.js version detected", the `services.web.root` value is wrong — it must
point at `apps/web`, not the repository root.

Two constraints come with the services layout, and both have already cost one deploy each:
- **No Edge Functions.** A route with `export const runtime = "edge"` fails the deploy with
  "Edge Runtime is not supported in services". `/og` therefore runs on the Node runtime; `ImageResponse`
  behaves the same there.
- **No local browser binaries in the upload.** The CLI ships the working tree, so `.vercelignore` must
  exclude `.playwright-browsers/`, `.next/`, and `node_modules/`, otherwise the upload trips the 100 MB
  per-file limit.

## Verify

```bash
URL="$(vercel ls ferroscope --prod --json | jq -r '.[0].url')"

curl -fsS "https://$URL/api/healthz"
# {"status":"ok","incidents":27,"seed":2718,"version":"2026.10.23","uptime":"static"}

curl -fsS -o /dev/null -w "%{http_code}\n" "https://$URL/atlas/emudhra"   # 200
curl -fsS -o /dev/null -w "%{http_code}\n" "https://$URL/roadmap"        # 200
curl -fsS "https://$URL/sitemap.xml" | grep -o "<loc>" | wc -l      # 56: 21 static + 27 incidents + 8 playbooks
```

Then check the four things a status code cannot tell you:
1. **Dark and light** — toggle in the header; both palettes must be legible.
2. **A full interaction** — `/profile`, toggle a component, watch the declared count change.
3. **A reload** — the profile persists (localStorage).
4. **The OG image** — `https://$URL/og` returns a PNG, not an error page.

And one thing only the network can tell you: the deployed stylesheet must contain the utilities used by
`@ferroscope/ui`. The Vercel build has no `.git` directory, so Tailwind's automatic content detection
cannot walk up to the monorepo root and relies entirely on the explicit `@source` lines in
`apps/web/app/globals.css`.

```bash
CSS=$(curl -fsS "https://$URL/" | grep -o '/_next/static/css/[^"]*\.css' | head -1)
curl -fsS "https://$URL$CSS" | grep -c '\.fixed{position:fixed'   # must be 1
```

`bun run check:css` performs the same check locally against `apps/web/.next`.

## Environment variables

Only two are meaningful, and neither is a secret:

| Name                   | Value                           | Why                                                  |
| ---------------------- | ------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SIM_SEED` | `2718`                          | Printed in the footer and returned by `/api/healthz` |
| `NEXT_PUBLIC_SITE_URL` | `https://ferroscope.vercel.app` | Canonical URLs in sitemap and robots                 |

Both are set in `vercel.json`, so a fresh project needs no dashboard work. If you attach a custom
domain, change `NEXT_PUBLIC_SITE_URL` in `vercel.json` and redeploy.

## Rollback

```bash
vercel ls ferroscope            # find the previous deployment URL
vercel promote <deployment-url>
```

The dataset and the app version travel together. A rollback also rolls back the incident snapshot,
which is the correct behaviour: reports name the dataset version they used.

## Common failures

| Symptom                                                       | Cause                                                           | Fix                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| `No Next.js version detected`                                 | `services.web.root` wrong                                       | Set it to `apps/web`                        |
| `Edge Runtime is not supported in services`                   | A route declares `runtime = "edge"`                             | Use the Node runtime (`/og` does)           |
| `File size limit exceeded (100 MB)`                           | Local browsers or caches were uploaded                          | Extend `.vercelignore`                      |
| Header sits 150px down, grain layer scrolls with the page     | `@source` path missing, so `packages/ui` utilities were dropped | Fix the path, then `bun run check:css`      |
| `bun: command not found`                                      | Install command runs outside the repo                           | Keep the `cd ../..` prefix                  |
| Build succeeds, 404 on every route                            | Rewrites missing                                                | Restore the `rewrites` block                |
| Prerender crash on `/compare`                                 | Something reads `window` at module scope                        | Guard with a mount flag, see `lib/store.ts` |
| `Cannot read properties of undefined (reading 'hasHydrated')` | Calling `persist.hasHydrated()` during prerender                | Use `useProfileHydrated()`                  |
| Slow cold start                                               | Standalone output accidentally enabled on Vercel                | `FERROSCOPE_STANDALONE` must be unset there |

## After deploying a dataset change

1. Confirm `/api/healthz` still reports 27 incidents and seed 2718.
2. Open `/changelog` and check the new entry renders.
3. Compare `/stats` totals against the PR description.
4. Update the live URL in `README.md` only if the domain changed.
