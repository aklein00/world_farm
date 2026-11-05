# Publish World Farm to worldfarm.utilityinfielder.com

Prepared November 5, 2026. Nothing has been deployed or connected to DNS. The GitHub repository is [aklein00/world_farm](https://github.com/aklein00/world_farm). The deployable website is in `studio/`; the repository also contains design and Blender work. Set the Vercel Root Directory to `studio`.

## GitHub and Vercel setup

1. Use the existing **aklein00/world_farm** GitHub repository. The local workspace retains its history and `origin` remote. Push the prepared commit when you are ready to make it available to Vercel.
2. In Vercel, import **aklein00/world_farm**. Grant the GitHub integration access to **only this selected repository**. Vercel can read the full repository for builds, including its history; setting `studio` as the root does not restrict GitHub read permission to that folder. If you require the hosting service to have no access to design/Blender sources, use a separate website-only repository populated from `npm run package:site`, or deploy the locally built artifact without connecting GitHub. The running website itself receives only the guarded function and its browser assets.
3. Framework: **Other**. Root directory: **studio** (or `.` only if using the optional website-only source repository). Node.js: **22.x**. Install command: `npm ci`. Build command comes from `vercel.json`: `npm run check && npm test && npm run build:vercel`. Leave the Output Directory override **off**. The build produces Vercel Build Output API files in `.vercel/output`; do not select `public/` or `dist/` as a static deployment.
4. Set the server environment variables below before the first usable deployment. The app returns 503 while configuration is absent. Configure Preview separately if previews are wanted. Set Production Branch to `main`.
5. Add **worldfarm.utilityinfielder.com** under the Vercel project's Domains settings. Copy the exact DNS record and value Vercel displays to the DNS provider for `utilityinfielder.com`. Do not guess a shared CNAME/IP value. Remove conflicting records for this subdomain only; preserve other subdomains and mail records. If Cloudflare hosts DNS, start with DNS-only for this new record while Vercel verifies it and issues HTTPS.
6. Run the launch checks below before sharing the address. No production deployment has been validated yet.

## Server environment variables

Set values in Vercel's encrypted environment settings. `.env.example` lists names only; never commit populated files or reuse ImageFarm secrets.

| Variable | Production setting |
| --- | --- |
| `APP_ORIGIN` | `https://worldfarm.utilityinfielder.com` (no trailing slash) |
| `WORLDFARM_PASSWORD` | New member password, 12–256 characters |
| `SESSION_SECRET` | New cryptographically random secret, at least 32 characters |
| `UPSTASH_REDIS_REST_URL` | HTTPS REST endpoint for a dedicated Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | Its write-capable REST token |

Create the Redis database through your existing Upstash account or Vercel Marketplace when setting up hosting. It holds only a short-lived login counter, not projects or generation data. No resource has been created by this preparation. Sign-in allows five attempts per 60-second window **across the deployment**, shared between instances and client addresses. A burst can temporarily block new owner sign-ins. Rate-limit failures block login. Production and Preview should use separate Redis databases and secrets. For Preview, omit `APP_ORIGIN` to use the generated `VERCEL_URL` for that build; a fixed Production origin must not be copied into Preview settings.

## How protection is packaged

Every application URL is routed to one Node.js function. Browser files are private function resources; `.vercel/output/static` is intentionally absent. The function reuses the existing password/session checks, secure cookies, sign-out and security headers. Generated `.vercel.app` URLs receive the same gate. No repository credentials or generation keys are included. The original Cloudflare deployment remains available as an alternative; Vercel hosting does not require a Cloudflare Worker.

All studio pages and assets are authenticated dynamic requests, so hosting usage includes asset requests. The runtime reads only its bundled browser assets. Projects still live in the browser, with JSON backup/import; this is a shared-password prototype, not individual user accounts. Export your local project and import it on the new domain because browser storage does not transfer from localhost.

## Checks before sharing

- With no environment variables, `/`, `/modules/app.js` and `/api/session` are locked (503).
- Once configured, signed-out `/` and `/modules/app.js` redirect to `/login`; `/api/session` returns 401. Check the custom domain and generated deployment URL.
- Incorrect password fails; the sixth rapid attempt is rate-limited. After the window expires, sign in with the correct password. Confirm the browser receives a Secure, HttpOnly session cookie and the studio loads with its scripts, fonts and 3D previews.
- Reload, open 01 Style family, select a starter, save/load style JSON, generate placeholders, assemble and export. Check sign-out protects assets again. Password/session-secret rotation invalidates existing sessions.
- `/worker/index.js`, `/server/vercel.mjs`, `/.env` and `/package.json` must never return source contents, even after login.
- Check Vercel logs for startup errors and verify HTTPS/domain status in the dashboard.

## Local preparation checks

Run `npm ci`, `npm run check`, `npm test`, and `npm run build:vercel`. Tests exercise the adapter, auth flow, rate-limit failures, private assets, and generated artifact. They do not replace an actual Vercel deployment/domain test. `npm run dev` continues to be the convenient local workflow preview without sign-in.

References: [Vercel Build Output API](https://vercel.com/docs/build-output-api), [private function resources and runtime configuration](https://vercel.com/docs/build-output-api/primitives), [Upstash REST commands](https://upstash.com/docs/redis/features/restapi).
