# ImageFarm source review and WorldFarm setup

Reviewed November 5, 2026 against the local ImageFarm checkout at `/Users/arthurklein/Documents/Work/AK_Tools/ImageFarm`. This replaces the earlier assumption in `IMAGEFARM_REUSE.md` that source was unavailable. ImageFarm files and its running service were not changed. No secret values were read or copied.

## What ImageFarm actually uses

- `studio/package.json`: React/Next conventions with Vinext, Vite and Cloudflare Wrangler.
- `studio/build/sites-worker.ts`: the production entrypoint sends every request through `gate()` before serving assets or application routes; local development bypasses sign-in.
- `studio/build/auth-gate.ts`: owner password, HMAC-signed session cookies, same-origin mutations, a login rate limiter, and fail-closed behavior when sign-in secrets are absent.
- `studio/build/guest-gate.ts` and `guest-access.ts`: separate guest invitations, expiration, generation budgets and guest permissions.
- `studio/vite.config.ts`: Cloudflare custom-domain route, D1, R2, login/guest limiters, logs/traces, and `assets.run_worker_first: true`.
- `studio/README.md`: a public read-only sample plus protected workspaces, local development instructions, and the fact that a GitHub push alone does not deploy the Worker.

These findings are source evidence, not an audit of ImageFarm's live account configuration. WorldFarm does not need ImageFarm's full backend or framework simply to test this workflow.

## WorldFarm implementation decisions

Use a self-contained static browser app and a small Cloudflare Worker gate. Keep the same *security pattern*, with a new password and independent session secret. Protect the whole site rather than adding a public sample. Individual accounts and guest invitation quotas can be added when needed; they are not silently simulated as real authentication.

The local preview is deliberately password-free and restricted to loopback. Production has no environment flag that bypasses authentication. Its Worker checks sign-in before every static file. Sessions expire after seven days, and changing the member password or signing secret invalidates existing tokens. Secrets are never sent to the browser. Sign-out uses a same-origin POST.

The new app has no third-party runtime requests beyond its own session endpoint. The first dependency choice mirrored ImageFarm's older Wrangler; the registry audit reported issues in that development-tool chain. WorldFarm was moved to the verified current Wrangler 4.158.0, with a lockfile and zero audit findings at installation. This did not upgrade ImageFarm.

## Repository isolation

The original project source remains in place. The app lives in `studio/`; the build reads `studio/public/` only. There are no runtime references to the foundation lab, market kit, parent documents or neighboring ImageFarm checkout. The running Worker has no repository token or GitHub integration.

For **zero hosting-provider repository permission**, use local Wrangler deployment without installing the Cloudflare GitHub integration. For automated GitHub builds later, create a separate website-only private repository from `npm run package:site` and authorize only that repository. A subfolder build root reduces build scope, not GitHub read permission. See [Cloudflare's repository access guidance](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/).

## Current Figma source and edits carried through

Source: file `iQF4XWbgrY5q2pPO7FTR7w`, page `40:680`, main workflow `40:698`.

| Step | Figma node | Implemented interaction |
| --- | --- | --- |
| 01 Start a building family | 40:704 | Family naming and editable-template start |
| 02 Define shared style | 40:814 | Live palette/trim/softness/window/roof controls; save v1 |
| 03 Describe building | 40:952 | Type, description, footprint, height and awning; simulated generation |
| 04 Choose candidate | 40:1028 | Three samples, retries and explicit acceptance |
| 05 Customize pieces | 40:1178 | Building/Windows/Doors/Roof, bounded controls, reset and pins |
| 06 Save reusable building | 40:1312 | Baseline, style link, overrides and collection saved together |
| 07 Building family | 40:1399 | Repeat generation, edit saved buildings, place linked copies |
| 08 Assemble block | 40:1520 | Fixed plots; move, rotate, duplicate, remove, undo and draft overlap |
| 09 Review/export | 40:1640 | Small-screen schematic review, project import/export, PNG and sample GLB |
| 10 Revise style | 40:1727 | Isolated draft without changing saved buildings |
| 11 Preview affected buildings | 40:1824 | Matched before/after preview, selection scope and pin preservation |
| 12 Apply revision | 40:1880 | Selected versions advance; linked copies update, transforms remain |

The added piece-control explanation and matched before/after previews are included. This is the 01.B shared-family workflow, not the older six-look single-market journey. Appearance follows the paper/forest palette, typography, panel layout and schematic building language in the current Figma responses.

## What remains for hosting

Choose the Cloudflare account, deploy the separate Worker, set new `WORLDFARM_PASSWORD` and `SESSION_SECRET` secrets, then verify sign-in before attaching a custom domain. No Vercel account, D1 database, R2 bucket or paid generator is required for this version. Hosting has not been created or connected. [Full setup instructions](../studio/README.md).

## Verification completed

- Syntax checks, all 12 workflow/auth/export tests, the isolated build, and Cloudflare's deployment dry-run passed.
- The actual Wrangler local Worker passed unsigned asset/API rejection, password sign-in, authenticated app delivery, server-source exclusion, and POST sign-out using disposable test credentials. That test server was stopped; no credentials were saved to the app.
- Browser walkthrough covered all 12 steps, simulated generation failure/retry, piece edits, saved buildings, placement/rotation/duplication, occupied-plot rejection, remove/undo, selective version changes, project and GLB downloads, PNG export, and importing the exported project.
- The imported test project retained two buildings on versions 2 and 1, a pinned window-width edit, and three placed copies. The 390-pixel mobile layout had no document-level horizontal overflow. No browser warnings/errors were recorded during the tested flow.
- `deliverables/worldfarm-studio-source.zip` contains 26 allowlisted files for a separate site repository; parent documents, model source, secrets, Git metadata and dependencies are absent.
- The screenshot in `previews/worldfarm-studio.jpg` shows the tested local assembly screen. Preview geometry and generation limitations remain as described in the studio README.
