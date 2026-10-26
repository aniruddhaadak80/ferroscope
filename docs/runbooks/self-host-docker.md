# Runbook — self-host with Docker

The image is a standalone Next.js server: no database, no external services, no secrets. It runs
happily on a 512 MB machine.

---

## Build and run

```bash
docker build -t ferroscope:local .
docker run --rm -p 3000:3000 --name ferroscope ferroscope:local
```

Or with Compose:

```bash
docker compose up --build
curl -fsS http://127.0.0.1:3000/api/healthz
```

First build takes 3–5 minutes (dependencies, Next build, prune). Rebuilds with a warm layer cache take
under a minute.

## What is in the image

```
/app/apps/web/server.js          standalone server
/app/apps/web/.next/static       client assets
/app/apps/web/public             icons, banner, screenshots
/app/node_modules                only traced dependencies
```

- Base: `node:22-alpine`
- User: `nextjs` (uid 1001), not root
- Port: `3000`
- Healthcheck: `GET /api/healthz` every 30 s

The build stage sets `FERROSCOPE_STANDALONE=1`. That flag exists because Windows sessions cannot
create the symlinks Next needs for traced output; on Linux it is safe and required.

## Configuration

| Variable               | Default      | Notes                                                    |
| ---------------------- | ------------ | -------------------------------------------------------- |
| `PORT`                 | `3000`       | Change if the host requires it                           |
| `HOSTNAME`             | `0.0.0.0`    | Must stay `0.0.0.0` inside a container                   |
| `NEXT_PUBLIC_SITE_URL` | compile-time | Canonical URLs. **Rebuild** to change it — it is inlined |
| `NEXT_PUBLIC_SIM_SEED` | `2718`       | Also inlined; rebuild to change                          |

`NEXT_PUBLIC_*` values are baked at build time. Setting them at runtime does nothing. If you need a
different public origin, pass a build arg or edit the Compose file and rebuild.

## Behind a reverse proxy

Caddy:

```
ferroscope.example.com {
    reverse_proxy 127.0.0.1:3000
    encode zstd gzip
}
```

nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name ferroscope.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

The app does not redirect HTTP to HTTPS itself. Terminate TLS at the proxy.

## Updating

```bash
git pull
docker compose build
docker compose up -d
docker image prune -f
```

Because there is no database, an update cannot corrupt state. The only state lives in each visitor's
browser.

## Fly.io

```bash
fly launch --no-deploy --copy-config --name ferroscope
fly deploy
fly open
```

`fly.toml` sets `primary_region = "bom"`, auto-stop when idle, and a health check on
`/api/healthz`. Change the region to the one nearest your users; there is no data residency concern,
only latency.

## Render

Push the repository, then **New → Blueprint** and select `render.yaml`. The free plan sleeps after
inactivity; the first request afterwards takes a few seconds.

## Troubleshooting

| Symptom                               | Cause                              | Fix                                                                                 |
| ------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `Cannot find module '/app/server.js'` | Standalone output flattened        | Ensure `outputFileTracingRoot` is set to the repo root (it is, in `next.config.ts`) |
| Container exits immediately           | `HOSTNAME` unset or `localhost`    | Set `HOSTNAME=0.0.0.0`                                                              |
| Static assets 404                     | `.next/static` not copied          | Check the `COPY` lines in the runner stage                                          |
| Healthcheck fails but the site works  | Probe hits before the server binds | Raise `start-period` to 30 s                                                        |
| Build fails on Windows                | Symlink privileges                 | Build inside Docker, not on the host                                                |
| `next build` OOM on a 512 MB host     | Build needs more than runtime      | Build elsewhere and push the image                                                  |

## Verifying a deployment

```bash
curl -fsS http://HOST:3000/api/healthz | jq
curl -fsS -o /dev/null -w "%{http_code}\n" http://HOST:3000/atlas/emudhra
curl -fsS -o /dev/null -w "%{http_code}\n" http://HOST:3000/og
docker inspect --format '{{.State.Health.Status}}' ferroscope
```

Expected: `ok`, `200`, `200`, `healthy`.
