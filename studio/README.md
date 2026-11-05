# World Farm Studio — 01.B workflow preview

Implements the November 5 review of **01.B World Farm · Shared style → building kit** in [the Figma source](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=40-680). This is the new studio; the older foundation lab is retained separately.

## Publishing target

The prepared production target is **https://worldfarm.utilityinfielder.com on Vercel**. See [PUBLISHING.md](PUBLISHING.md) for the GitHub repository boundary, Vercel settings, password protection, server secrets and domain setup. The existing `aklein00/world_farm` repository contains this `studio/` website folder. Configure Vercel Root Directory as `studio`. Its GitHub integration can read the full selected repository; see the publishing guide for stricter source-isolation options. Hosting accounts, resources and DNS are not created by preparation.

## Try it locally

Requires Node.js 22 or newer. No installation, hosting account, password or generation key is needed for the local workflow preview.

```sh
cd /Users/arthurklein/Documents/Work/2026Nov/WorldFarm/studio
npm run dev
```

Open [World Farm](http://127.0.0.1:4318). The server binds only to your computer and serves `public/`, never the parent project folder. You can change its port with `WORLDFARM_PORT`.

## What you can test

1. Name a family and choose an original Market Kit 01 style: Peach Modern, Rose Twilight, Honey Corners, Soft Blocks, Copper Rooftops or Amber Afterglow. Adjust its palette, windows, roof treatment, trim and softness. The reference-color button restores the selected palette without changing saved versions until you apply the revision.
2. Use Generate immediately with the default style, or save your own style v1. Describe a supported building, and generate three **sample** candidates. A checkbox lets you test generation failure and retry.
3. Accept a candidate, then edit Building, Windows, Doors and Roof. Pin overrides or reset a role to shared defaults.
4. Save the reusable building. Generate additional types using the same shared style. An empty library offers the three wireframe examples as a shortcut.
5. Add copies to six reserved plots. Move, rotate, duplicate, remove and undo. Occupied plots keep a placement as a draft; review is blocked until you place or cancel it.
6. Review the block at full or phone-preview width. Export a World Farm project, current-camera 3D PNG, or sample-kit GLB.
7. Edit the shared style from My buildings. Preview a draft, compare each building, select update targets, then apply. Unchecked buildings retain their version; pinned edits and all copy transforms survive. Previous versions remain selectable per building.

**Persistence:** drafts and saved work stay in this browser's local storage. Import/export uses validated versioned JSON and retains recipes, styles, overrides, placements and in-progress drafts. Export a backup before changing browser or starting a new family. Signing out does not erase browser-local projects. This is a single-owner prototype, not isolated multi-user storage.

**Placeholders:** no AI service interprets prompts or generates art/models. Candidates are deterministic kit samples driven by type, footprint, height and awning choices. Descriptions are retained for future generation. All building previews and block assembly use interactive Three.js 3D scenes. Drag to orbit, scroll to zoom, and use arrow keys when a viewport is focused. Click building parts to select an editing role or click block plots to select/place copies. The studio now reuses the original Market Kit 01 recipes, preserving the reference proportions and architectural details. Orthographic cameras avoid perspective distortion. Viewport and GLB share beveled geometry, sloped awnings, shaped roofs, materials and named parts. These remain editable placeholders, without production topology or boolean openings. Existing project colors are preserved; choose a preset or Restore reference colors in a style draft to recover the original palette. Fixed plot reservations prevent occupied-slot collisions; arbitrary geometry/entrance-clearance validation, freeform roads, performance validation and cloud project storage remain future work. No claim of game-engine-ready production output is made.

## Reusable styles

The sidebar offers three starters: Peach Modern, Honey Corners and Soft Blocks. Choosing one opens a style draft. Existing buildings still use the normal preview/select/apply revision flow. Style family also opens before any building is saved, including after generating candidates; saving at that point updates candidate and building-draft style links while retaining local edits.

**Save JSON** downloads a `.worldfarm-style.json` file containing `format: "worldfarm-style"`, `schemaVersion: 1`, a name and the style settings: base market template, palette, trim weight, edge softness, window family and roof treatment. It exports the current style draft when one is open. **Load JSON** validates a file (64 KB maximum) and stages it for preview before saving/applying. These files reuse the built-in geometry templates; they do not contain meshes or entire projects. Use Project export for buildings, placements and version history.

## Files and deployment boundary

```text
studio/
  public/          Explicit browser-deliverable files only
    assets/        Local Figma icons, sample house and fonts
    modules/       UI, recipe state, original market recipes, shared geometry and exports
    vendor/        Self-contained Three.js runtime and MIT license
  worker/          Server-only member password gate
  scripts/         Local preview, build, checks and website-only packaging
  tests/           Workflow, export and authentication checks
  dist/            Generated public assets; only public/ is copied here
  release/         Generated website-only source copy; ignored by Git
  wrangler.jsonc   WorldFarm-only Worker, asset and rate-limit bindings
```

The Worker and built assets have no GitHub credentials, repository API, directory listing or parent-project filesystem access. `docs/`, `market-kit-v1/`, Blender source, deliverables and the old foundation lab are not runtime inputs and are not uploaded by the studio deployment. Server-side source is not in `dist/`. The deployable app is independent of ImageFarm; no ImageFarm secrets, account IDs, database IDs, domains or storage buckets were copied.

## Cloudflare alternative reference

The prepared Vercel path is documented above. As an alternative, the retained **Cloudflare Workers** configuration follows ImageFarm's server-side gate with a much smaller static application behind it. Cloudflare supports routing every asset request through a Worker first with [`run_worker_first: true`](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/), which this configuration sets. Do not deploy `dist/` alone to an unprotected static host: the password protection lives in the Worker.

There are three distinct access boundaries:

| Boundary | What controls it |
| --- | --- |
| What visitors download | `public/` → `dist/`, after Worker authentication |
| What the running site can access | Only its deployed code, ASSETS and LOGIN_LIMITER; no repository binding |
| What a hosting build service can read | Its GitHub installation permissions; a subfolder is not a repository permission boundary |

**Recommended for your stated privacy preference:** deploy locally with Wrangler, without connecting GitHub to Cloudflare. Cloudflare receives the built browser files and bundled Worker, and needs no GitHub repository permission. If you later want automatic GitHub builds, use a new private repository containing only the website source. The [Cloudflare GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) grants access to selected repositories, not selected folders. Select **Only select repositories** and grant access solely to the website repository. A build root or watch-path setting does not restrict read permission to that folder.

Prepare the website-only source with:

```sh
npm run package:site
```

This writes `release/worldfarm-site/` using an explicit allowlist. It includes no Git history, `.env`, `.dev.vars`, `.wrangler`, parent source folders, databases, local projects or `node_modules`. You can make that folder the contents of a separate repository later. Nothing is pushed automatically.

## When you are ready to put it online

These are instructions, not actions already performed. No Cloudflare/Vercel project or DNS route has been created by this implementation.

1. Choose the Cloudflare account and a Worker name (`worldfarm-studio` is the prepared name). Keep it separate from ImageFarm's Worker and storage. For account access, use your normal local Cloudflare login or a scoped account API token stored outside this project; do not put credentials in Git or chat.
2. From `studio/`, install the pinned tools with `npm ci`, then run `npm run deploy:check`. This builds and checks the package without uploading it.
3. Run `npm run deploy` when ready. The first deployment **stays locked with HTTP 503 until secrets exist**. This allows the Worker to be created without exposing the app.
4. Set **two new secrets**, using Cloudflare's dashboard secret fields or the interactive commands below. Choose a unique member password of 12–256 characters and an independently generated session secret of at least 32 random characters. Do not reuse ImageFarm's values.

   ```sh
   npx wrangler secret put WORLDFARM_PASSWORD
   npx wrangler secret put SESSION_SECRET
   ```

   Enter values at the prompts, not as command arguments. [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/) stay server-side. Secret changes create/deploy a new Worker version; the first secret alone leaves the app locked.
5. Test the resulting HTTPS address while signed out: both `/` and `/modules/app.js` must require sign-in; `/api/session` must return 401. Sign in, reload, sign out, and verify the same routes are protected again. Add a custom domain after these checks. Preserve `assets.run_worker_first: true` on every deployment. Preview URLs are disabled in the prepared config.

The member gate includes seven-day signed HttpOnly/Secure/SameSite cookies, same-origin sign-in/sign-out, bounded request bodies, security headers, no-store responses and five login attempts per minute per IP through a [Cloudflare rate-limit binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). It fails closed if password/session secrets or the login limiter are missing. Password or session-secret rotation invalidates existing sessions. The rate limiter is Cloudflare's distributed best-effort limiter, not a global account lockout. Individual identities, guest invites, password recovery and per-user data are not included in this owner prototype.

## Later, when real generation is approved

Add server-only generation endpoints behind the existing gate. Store provider keys as Worker secrets. Add D1 for projects/jobs and R2 for uploaded/generated assets as needed, with ownership checks and explicit quotas before inviting guests. Replace `candidatesFor()` with a provider adapter returning the same versioned recipe contract, and add production geometry validation. Add durable asynchronous jobs if the chosen generator needs them. The app should still have no GitHub token or repository read capability.

## Checks

```sh
npm run check
npm test
npm run build
npm run deploy:check
```

Node tests cover auth failures, session tampering/expiry/rotation, login rate limits, candidate acceptance, selective style updates, pinned edits, overlap rejection, import validation, project round trips and GLB structure. Regression tests also compare all six default templates against their original recipe dimensions and check exported bevels, awning rotations and legacy project compatibility. The local browser workflow is checked separately. Deployment and live account/domain behavior must be verified after hosting setup.

Typography is DM Sans and Space Grotesk (SIL Open Font License). Icons and the retained townhouse asset were downloaded from the supplied Figma design. Interactive previews use locally bundled Three.js r181 (MIT license).
