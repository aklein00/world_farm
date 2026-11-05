# World Farm guided wireframes — proposal for review

Created November 3, 2026. This is a design proposal, not approval to implement or a claim that the browser app has these capabilities.

[Start the guided prototype](https://www.figma.com/proto/iQF4XWbgrY5q2pPO7FTR7w?node-id=15-7316&starting-point-node-id=15%3A7316) · [Start from a saved asset](https://www.figma.com/proto/iQF4XWbgrY5q2pPO7FTR7w?node-id=15-8265&starting-point-node-id=15%3A8265) · [Edit the wireframes](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=14-548)

## Reviewable workflow

Start with a building → explore six look directions → adjust shape, detail, lighting and palette → compare → save asset → choose a block layout → place saved asset → rotate and duplicate instances → correct overlaps → add surroundings → check phone readability → save block → export.

Secondary states cover removing one instance, undo, unsaved changes, style adjustments, output compatibility, and separate output types. The initial saved-asset example is Corner Market; it demonstrates the reusable-source/placed-instance relationship.

## Design intent

- Non-artists start from a curated look and see concise guidance beside the relevant control.
- The primary workflow produces a reusable building, then an editable block. Tutorial text lives within the task UI.
- A shared source asset is distinct from a placed instance. Removing an instance must not delete the source.
- Style factors include chunkiness, edge softness, detail, decoration density, lighting direction, shadow softness, palette, saturation, contrast, surface finish, outlines, irregularity and camera.
- A fixed sample path explores Warm miniature. The other five looks have visual preview states; the prototype does not preserve every possible combination of settings.
- Exports distinguish a selected asset, a block of separate objects, a World Farm project file, and a PNG preview. GLB/glTF settings cover units, origin, materials and object separation. Outline treatment explicitly needs checking in the destination renderer.

## Figma organization

The first page is `01 World Farm • Guided wireframes`. All eight previous pages retain their contents under `Archive / …`, including the previous wireframe/prototype iteration. No old material was deleted. Components remain available to the new screens.

The archived overview, flow explanations, foundations, handoff and review notes remain reference material for a future website or accompanying deck. They are not onboarding destinations in the new prototype. Existing local documentation is retained.

## Validation and limits

56 connected screen states; 610 navigation links; no broken destinations or unreachable screens in the final graph audit. Text bounds checked, product typography retained, and key onboarding, style, assembly, phone and export layouts visually reviewed. A clipped device-size label was corrected after visual inspection.

This is a native Figma click-through wireframe, not a functioning 3D editor. Sliders use clickable sampled values; input fields use example values. Placement, save/load, undo and exports are simulated state transitions. No real files are generated and no device-performance result is claimed. Continuous slider interaction, arbitrary combinations, freeform placement, asset import, engine import checks and actual file export must be implemented and tested after approval. The existing browser preview was not changed.

Native Figma is the current review artifact. Figma Make could later test coded UI interactions, but actual 3D behavior and export fidelity belong in the existing World Farm implementation.

Node IDs and validation counts are in `GUIDED_WIREFRAMES_STATE.json`. Earlier milestone documents describe the previous iteration and should be read as history when they conflict with this proposal.
