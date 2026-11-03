# WorldFarm — roadmap and decisions

## Confirmed

Separate product/pitch and repo; modular worlds/objects/lighting; evaluate ImageFarm ideas; native Figma wireframes first; owner-generated local images; Stack City's game wireframes are the higher priority.

## Proposed

Desktop browser, curated GLB kit, roughly twelve modules, three lighting presets, snapshot scene states, scene JSON portability, two cameras, and PNG/comparison export.

## Sequence

1. Complete Stack City's first game wireframe/prototype pass.
2. Build WorldFarm's separate wireframes and connected workflow.
3. Validate assembly, selection, state comparison, and export mental models.
4. Inspect ImageFarm source if available and document evidenced reuse.
5. Implement a constrained composition workbench when requested.
6. Validate save/load, undo/redo, camera continuity, and export.
7. Produce the first reusable Stack City block and presentation views.

The original documentation-only pass has been followed by the 2026-11-03 implementation milestone.

## First app acceptance

Curated kit loads; objects can be composed and edited; lighting presets work; independent state snapshots compare at matched cameras; save/load round trip succeeds; PNG output matches the requested view. Known limits are documented.

## Risks

- Becoming a general engine: constrain tools to the first composition/export workflow.
- Generation promises outrun usable assets: distinguish references from validated geometry.
- ImageFarm reuse assumed: audit source before architectural commitment.
- Inconsistent state cameras: enforce shared comparison camera.
- Browser persistence mistaken for durable storage: offer explicit export/recovery behavior.
- Scope delays game pitch: preserve Stack City's first milestone.

## Decisions to resolve

Target devices, real kit source, renderer, projection, import scope, save model, image dimensions, renderer performance, generation integration, and asset licensing.

## Review log

Append changes with date, reason, document impact, and Figma/app links. Mark proposals as confirmed only when supported by the owner or incoming brief.

## 2026-11-03 implementation milestone

Confirmed by owner: Three.js for both projects; no game-engine migration requirement; two new native Figma files in aklein personal; cube-led, slightly older environmental styling; concepts before detailed modeling; main-branch delivery.

Completed: native Figma foundation/components/flows/prototype/handoff; browser foundation kit and three-market concept comparison lab. See [milestone recap](MILESTONE_2026-11-03.md) for validation and remaining work.

The premise, educational approach and loop remain reviewable. Camera, palette, scenario amounts and specific architecture variants are provisional design decisions rather than owner-approved final direction.
