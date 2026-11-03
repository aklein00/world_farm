# WorldFarm — foundation kit milestone

Delivered 2026-11-03. The working Three.js concept lab and separate native Figma studio prototype are linked from the README.

## Decisions made while Art was away

- Use cube-led architecture with substantial forms, deliberate rooflines and lighting; no spherical building vocabulary.
- Compare one market at a shared 6 × 4.2 main footprint and matched orthographic camera: Warm corner (terracotta/teal canopy), Stacked garden (cream stepped volumes/planting), and City frame (blue structural frame/mustard infill).
- Keep this first implementation focused on the foundation kit and concept comparison. The full environment studio is represented in Figma for review before implementation.
- Use procedural Three.js recipes so proportions, palettes and details remain easy to change. No detailed Blender modeling or image generation was performed.
- Keep WorldFarm a separate product and repository, without a runtime dependency on Stack City.
- Figma belongs to aklein personal. The linked account's team was verified as Pro; existing files were already in the requested team.

## Implemented in the browser

Three market variants, hero viewer, matched-camera thumbnails, orbit/zoom, golden/day/blue lighting, sun direction, exposure, clay view, street-detail toggle and camera reset. A current-view PNG control is implemented, but its completed download was not verified by browser automation.

Kit recipes cover building mass, upper mass, roof/cornice, canopy, window bay, road, sidewalk/curb, planter, box-canopy tree, bench, lamp, sign and compact car. These are concept recipes rather than approved production GLB assets.

## Figma studio scope

23 connected curated states and 73 navigation links, three named starts, ten main review frames, native editable controls and reusable components. Create → choose kit → place → rotate → light → save Foundation → duplicate Connected → decorate → compare → export simulation. Includes unsaved changes, delete cancellation, missing assets, export failure and retry.

All states are reachable from named starts, and navigation targets resolve. The review copies match the final prototype's lighting, state labels and comparison layouts. Figma simulates geometry manipulation, persistence and exports; these are not implemented in the browser lab.

## Validation completed

- Syntax checks passed for app and kit modules.
- Browser review checked the three concepts, blue-hour lighting, clay view, street context and matched-camera reset; desktop and narrow layout were viewed.
- Figma comparison and lighting views were visually reviewed; navigation graph checked after final fixes.
- Proof images: `docs/review/foundation-lab.png` (actual Three.js app) and `docs/review/figma-comparison.png` (editable studio design).
- Owner-private Sites deployment succeeded; the signed-out deployed page shows the expected sign-in gate. Functional checks used the same source locally.

## Remaining work

Choose the preferred architecture direction before detailed modeling. The full placement workbench, real undo/redo, scene save/load, independent snapshot states, missing-asset recovery and dependable export verification remain future work. No formal accessibility audit or broad browser/device performance audit has been completed.

The PNG browser download attempt timed out, so treat output export as unverified until manually checked. ImageFarm source has not been audited; no reuse claim is made. The proposed asset contract is in `ASSET_CHECKLIST.md` and existing scene documentation.

Private preview requires the owner account. Sharing permissions were not made public. The lab can run elsewhere from main with Python 3 and no package installation.

## Change points

- `foundation-lab/dist/kit.js`: primitive module recipes, proportions and materials.
- `foundation-lab/dist/app.js`: viewer, cameras, variants and lighting controls.
- `docs/PROTOTYPE_SCREENS.json`: curated Figma scenario content, not a scene persistence format.
- `docs/FIGMA_STATE.json`: known native Figma node IDs and file references.

Three.js r181 is vendored with its MIT license. Final production art is pending concept review.
