# World Farm Studio — 01.B workflow preview

## Proposal route draft — November 10, 2026

The review branch prepares `/` as a public proposal and `/workspace` as the password-protected studio. This route/access change is not deployed to production. [Current status and hand-work register](../docs/PROPOSAL_PUBLISHING_2026-11-10.md) supersedes older deployment-status statements below. Local preview starts at `/`; use `/workspace` for the interactive studio. Shared ImageFarm room tickets are planned, not connected, and procedural generation spends no credits.

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
2. Use Generate immediately with the default style, or save your own style v1. Describe a supported building, and generate three **procedural** candidates. The interpretation panel lists recognized details and any conflicts. Unsupported requests produce an actionable error without changing saved buildings. See [the generation contract](GENERATION.md).
3. Accept a candidate, then edit Building, Windows, Doors and Roof. Pin overrides or reset a role to shared defaults.
4. Save the reusable building. Generate additional types using the same shared style. An empty library offers the three wireframe examples as a shortcut.
5. Add copies to six reserved plots. Move, rotate, duplicate, remove and undo. Occupied plots keep a placement as a draft; review is blocked until you place or cancel it.
6. Review the block at full or phone-preview width. Export a World Farm project, current-camera 3D PNG, or building-kit GLB.
7. Edit the shared style from My buildings. Preview a draft, compare each building, select update targets, then apply. Unchecked buildings retain their version; pinned edits and all copy transforms survive. Previous versions remain selectable per building.

**Persistence:** drafts and saved work stay in this browser's local storage. Import/export uses validated versioned JSON and retains recipes, styles, overrides, placements and in-progress drafts. Export a backup before changing browser or starting a new family. Signing out does not erase browser-local projects. This is a single-owner prototype, not isolated multi-user storage.

**Generation:** a small local grammar turns supported description details into editable building recipes. It changes facade layout, openings, roof shape, frontage and awning pattern within the controls and shared style. Unlisted prose stays as notes. This is procedural generation, not AI; no provider, key or credits are used. All building previews and block assembly use interactive Three.js scenes. Drag to orbit, scroll to zoom, and use arrow keys when a viewport is focused. Click parts to select an editing role or block plots to select/place copies. The original Market Kit 01 supplies the visual families and named architectural pieces. Viewport and GLB use the same beveled geometry, sloped awnings, shaped roofs and materials. GLB includes source recipe/style metadata; project JSON reopens the complete editing workflow. Legacy sample projects retain their shapes and colors.

**Limits:** the kit has fixed plot envelopes and bounded front-opening slots. Production topology, boolean openings, structural/entrance-clearance validation, freeform roads, arbitrary architecture, destination-engine performance validation and cloud project storage remain future work. No claim of game-engine-ready output is made. See [GENERATION.md](GENERATION.md) for supported wording, reproducibility and verification limits.

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

## Current: Style graybox workflow — November 12, 2026

The workspace now follows the [02 Style graybox approval flow](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=86-692). Earlier sections describe the retained **Previous studio**, available at `/legacy.html` behind the same sign-in gate. Its local storage is untouched.

Current sequence: choose theme/starter → guided style fields → review and approve constrained prompt → review one cube sample → approve style → create and save buildings/decorations → assemble 4×4 world → stage/apply plot heights or preview/apply replacement → review → export project, GLB or PNG.

The geometry is exclusively cube/cuboid primitives. Nine themes, three starter palettes, shape/proportion/detail controls and bounded building dimensions drive deterministic recipes. **No AI service is connected.** Style blurbs, object descriptions and moods are saved direction notes, not semantic generation inputs. The organized prompt explicitly discloses this before approval. This is an interactive procedural workflow implementation, not the full proposed AI product.

Projects use a separate `worldfarm-graybox-v1` browser storage key and validated versioned JSON. Source assets are copied into placements by reference; replacement preserves position/rotation. Terrain remains staged until Apply. Existing projects from the previous studio are opened there, not silently migrated. JSON retains editing data; GLB contains cube geometry, terrain, materials and part labels; PNG is the current camera view.

Not implemented: arbitrary free-text interpretation, automatic roads/entrance-clearance validation, AI provider, shared credits, individual identity, cloud synchronization, production topology/performance validation. No provider calls, paid dependencies or security settings were added. The existing production authentication boundary continues to guard `/workspace`, `/legacy.html` and all application modules.
