# WorldFarm

## Proposal draft — November 10, 2026

[Proposal and publishing register](docs/PROPOSAL_PUBLISHING_2026-11-10.md) · [Local proposal preview](http://127.0.0.1:4318/proposal.html)

The proposal is prepared as the public homepage, with the studio moved to `/workspace` behind the member gate. This access change is prepared on a review branch, not deployed to production. The register links current and earlier Figma workflows, records the verified hosting status, and separates review decisions from remaining launch checks. The live domain is configured; the older preparation notes below predate that deployment.

## New: 01.B workflow studio — November 5, 2026

[Open the local workflow preview](http://127.0.0.1:4318) · [Studio instructions](studio/README.md) · [Vercel publishing setup](studio/PUBLISHING.md)

The edited **01.B Shared style → building kit** flow is now implemented in `studio/`: shared styles, bounded procedural generation, piece edits, saved buildings, block assembly, selective style revisions, and project/PNG/sample-GLB exports. The studio now uses interactive 3D previews with orbit, zoom and part selection. Generate is available immediately and turns supported descriptions into editable kit models without AI or provider calls. See [the generation contract and verification limits](studio/GENERATION.md). Vercel publishing is prepared for `worldfarm.utilityinfielder.com`; no deployment or DNS changes have been made. Start it with `cd studio` then `npm run dev` (Node.js 22+); no hosting account or API key is needed.

The deployment boundary is `studio/` with only `studio/public/` copied into browser assets. Blender files, design documents and prior experiments remain outside it. A server-side Cloudflare password gate is prepared; no new hosting account, deployment or domain has been configured. Use the studio README for current scope and the ImageFarm source review below; older milestones describe the prior lab.

[ImageFarm source review and WorldFarm setup decisions](docs/IMAGEFARM_REVIEW_2026-11-05.md)

---

A Three.js foundation lab comparing three cube-based approaches to the same market building, plus a native Figma prototype for the future environment studio.

**Current milestone: 2026-11-03.** Working browser prototype and editable Figma file delivered. Figma owner team: **aklein personal**.

## Market assets

[Six market styles: native Three.js + Blender, embedded-texture GLBs](market-kit-v1/README.md) · [Complete download](deliverables/worldfarm-market-kit-v1.zip)

## Preview

- [Working browser preview](https://worldfarm-foundation-lab.aklein00.chatgpt.site) — owner-private; sign in with the owning account.
- [Figma editor](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w)
- [Figma guided prototype — start here](https://www.figma.com/proto/iQF4XWbgrY5q2pPO7FTR7w?node-id=15-7316&starting-point-node-id=15%3A7316)
- [Saved building → city block](https://www.figma.com/proto/iQF4XWbgrY5q2pPO7FTR7w?node-id=15-8265&starting-point-node-id=15%3A8265)
- [Guided wireframe design proposal](docs/GUIDED_WIREFRAMES_2026-11-03.md) — pending review; browser implementation unchanged.
- [Milestone, decisions and validation](docs/MILESTONE_2026-11-03.md)
- [Asset handoff](docs/ASSET_CHECKLIST.md)

## Run from a fresh checkout

Requires Python 3. No package installation or build step is needed.

```sh
cd foundation-lab
python3 -m http.server 4317 --directory dist
```

Open `http://localhost:4317`. The same server is available through `npm run dev`. Serve over HTTP; opening `index.html` directly does not support module loading. Three.js r181 and its MIT license are vendored under `dist/vendor/three`. Fonts use Google Fonts with local fallbacks.

With Node.js installed, `npm run check` checks JavaScript syntax.

## Design and implementation

- [Figma specification and current coverage](docs/FIGMA_WIREFRAMES.md)
- [Roadmap](docs/ROADMAP.md)
- [Figma node ledger](docs/FIGMA_STATE.json)
- [Curated Figma scenario definitions](docs/PROTOTYPE_SCREENS.json)

The kit recipes live in `foundation-lab/dist/kit.js`; viewer and lighting controls live in `app.js`. Three market concepts share a footprint and camera. The full placement/save/load/comparison studio is a Figma simulation, not an implemented application. The lab is independent of Stack City's runtime.

Earlier planning documents are retained for context; this milestone and current source describe implemented scope. Final production art, broader device testing, and user research remain future work.
