# WorldFarm

A Three.js foundation lab comparing three cube-based approaches to the same market building, plus a native Figma prototype for the future environment studio.

**Current milestone: 2026-11-03.** Working browser prototype and editable Figma file delivered. Figma owner team: **aklein personal**.

## Market assets

[Six market styles: native Three.js + Blender, embedded-texture GLBs](market-kit-v1/README.md) · [Complete download](deliverables/worldfarm-market-kit-v1.zip)

## Preview

- [Working browser preview](https://worldfarm-foundation-lab.aklein00.chatgpt.site) — owner-private; sign in with the owning account.
- [Figma editor](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w)
- [Figma click-through prototype](https://www.figma.com/proto/iQF4XWbgrY5q2pPO7FTR7w?node-id=5-2&starting-point-node-id=5%3A2)
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
