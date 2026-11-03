# WorldFarm — product brief

## Pitch

“Grow a world from a reusable kit.”

WorldFarm helps an art director assemble environment modules, explore materials and lighting, compare progression states, and export consistent views for visual development and game pitches.

## Confirmed intent

- Separate product and separate pitch from Stack City.
- A small app for modular world/environment objects and lighting.
- Explore applicable ideas from ImageFarm.
- Create native Figma wireframes before implementing the app.
- Stack City's game wireframes and prototype have higher priority.
- Current deliverables are Markdown; Art generates images on his computer.

## Working product scope

Desktop/browser creative workbench. Begin with curated reusable 3D modules and a small scene. Generation can eventually help produce concepts or candidates, but arbitrary image-to-production-3D is not an assumed capability.

Users: initially Art, then potentially small art teams needing repeatable environment studies. Multi-user workflows are deferred.

## Core workflow

Create project → choose a kit/reference → assemble scene → adjust selected objects → explore look/lighting → save a state → duplicate and alter it → compare matched cameras → export.

## First use case

A Stack City neighborhood with a home, market, utility destination, road, car, and props. Produce three matched progression views and a presentation camera image.

Use neutral project/kit concepts so another game world can use the same tool without finance-specific logic.

## MVP proposal

- One scene with approximately twelve curated reusable modules.
- Library categories and thumbnails.
- Select, place, move, rotate, duplicate, delete, and grid snap.
- A constrained set of compatible material variants.
- Three lighting presets with a small number of useful controls.
- Three scene states with stable IDs and duplicate-from-current.
- Gameplay camera and presentation camera.
- Save/load a scene document.
- PNG export and a simple comparison sheet.
- Undo/redo for core scene edits.

## Product principles

1. Composition remains visible while editing.
2. A selected object has clear identity and controls.
3. Saved states preserve cameras and deliberate differences.
4. The workflow should still work without generation services.
5. Export is predictable and traceable to a scene/state/camera.
6. Style presets are coordinated systems, not random per-object changes.

## Outside the first app

Full game engine, city simulation, terrain sculpting, procedural continents, rigging/animation tools, multiplayer editing, marketplaces, real-money purchases, arbitrary asset ingestion, production mesh generation, and engine-specific live sync.

## Success criteria

An art director can assemble a recognizable block, vary its lighting, duplicate a progression state, and export aligned views without manually rebuilding the composition. Measure ease, scene continuity, and export usefulness before expanding features.

## Figma versus app

Figma demonstrates the workbench and its interactions using editable UI and representative scene images/blockouts. It is not a real 3D editor. The later app owns geometry, transforms, persistence, and rendering.

## Open decisions

Runtime stack, import strategy, persistence model, precise module kit, camera projection, supported hardware, export resolution limits, generation providers, and whether ImageFarm code is accessible and reusable.
