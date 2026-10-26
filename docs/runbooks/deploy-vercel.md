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

## Verify

```bash
URL="$(vercel ls ferroscope --prod --json | jq -r '.[0].url')"

curl -fsS "https://$URL/api/healthz"
# {"status":"ok","incidents":27,"seed":2718,"version":"0.1.0","uptime":"static"}

curl -fsS -o /dev/null -w "%{http_code}\n" "https://$URL/atlas/emudhra"   # 200
curl -fsS -o /dev/null -w "%{http_code}\n" "https://$URL/roadmap"        # 200
curl -fsS "https://$URL/sitemap.xml" | grep -o "<url>" | wc -l      # 56: 21 static + 27 incidents + 8 playbooks
```

Then check the four things a status code cannot tell you:
1. **Dark and light** — toggle in the header; both palettes must be legible.
2. **A full interaction** — `/profile`, toggle a component, watch the declared count change.
3. **A reload** — the profile persists (localStorage).
4. **The OG image** — `https://$URL/og` returns a PNG, not an error page.

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

| Symptom                                                       | Cause                                            | Fix                                         |
| ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| `No Next.js version detected`                                 | `services.web.root` wrong                        | Set it to `apps/web`                        |
| `bun: command not found`                                      | Install command runs outside the repo            | Keep the `cd ../..` prefix                  |
| Build succeeds, 404 on every route                            | Rewrites missing                                 | Restore the `rewrites` block                |
| Prerender crash on `/compare`                                 | Something reads `window` at module scope         | Guard with a mount flag, see `lib/store.ts` |
| `Cannot read properties of undefined (reading 'hasHydrated')` | Calling `persist.hasHydrated()` during prerender | Use `useProfileHydrated()`                  |
| Slow cold start                                               | Standalone output accidentally enabled on Vercel | `FERROSCOPE_STANDALONE` must be unset there |

## After deploying a dataset change

1. Confirm `/api/healthz` still reports 27 incidents and seed 2718.
2. Open `/changelog` and check the new entry renders.
3. Compare `/stats` totals against the PR description.
4. Update the live URL in `README.md` only if the domain changed.
