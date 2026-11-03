# WorldFarm — scene and asset contract

## Status

Proposed implementation contract for the future app. No runtime/schema has been implemented. Use this to align wireframes, module production, and later architecture.

## Coordinate convention

Propose meters, Y-up, X/Z ground plane, radians stored for rotation, and positive unit scale. The UI may display rotation in degrees. Confirm the target renderer/importer before shipping. Keep units and conversions explicit.

Kit assets declare footprint, bounds, pivot convention, grid compatibility, material slots, and version. Buildings generally use a ground-level pivot; variants share footprints and pivots.

## Scene document

| Field | Purpose |
| --- | --- |
| schemaVersion | Enables validation and future migration |
| projectId / name | Stable identity and user-facing title |
| kitId / kitVersion | Exact module kit dependency |
| assets | Stable asset IDs and version references |
| states | Named saved configurations |
| cameras | Stable camera definitions and projection |
| activeStateId / activeCameraId | Editor selection |
| exportSettings | Output dimensions and naming |
| metadata | Created/updated timestamps and notes |

State data: id, name, object instances, material selections, lighting settings, camera references, and optional progression notes. Object instances include stable instanceId, assetId/version, transform, visibility, and permitted variant selection.

Prefer snapshot states for the first version. Their simplicity is more useful than a premature inheritance/diff system. Duplicated states preserve instance IDs for comparison; new placed objects receive new IDs.

## Camera matching

Comparison uses the same camera definition, viewport aspect, render settings, and output dimensions. Lock projection and crop for progression output. Store a separate presentation camera.

## Starter kit proposal

1. Road straight.
2. Road corner/intersection.
3. Sidewalk/plaza.
4. Home.
5. Market.
6. Utility service building.
7. Garage.
8. Downtown landmark.
9. Tree/planter set.
10. Lamp/sign set.
11. Car.
12. Decorative prop set.

This is a proposed list, not an existing library.

## Asset formats

Propose GLB/glTF for the curated app kit, PNG/WebP for previews, and PNG for initial exports. Validate real assets for scale, missing textures, material behavior, polygon/texture budgets, and licensing before use.

Generated concept images are reference assets. They do not satisfy geometry, topology, UV, collision, or performance requirements.

## State fidelity and editing

Save transforms, materials, lighting, and camera references. Record scene edits in undo history. Clarify whether undo history persists; MVP can keep it session-only. Failed loads preserve the current scene. Missing assets show a labeled stand-in and recoverable replacement path.

## Storage proposal

A versioned downloadable scene JSON is a useful first portability format. Browser-local recovery may supplement it, but must not be described as durable cloud storage. Authentication and shared cloud projects are later decisions.

## Export contract

PNG: selected state + camera + width/height.
Comparison: labeled matched views, consistent ordering and dimensions.
Optional manifest: scene/kit versions, state and camera IDs, module dependencies, filenames.

The manifest is not an engine-ready world package. Export controls must reflect actual renderer limits. Transparent background is only offered when supported and previewed correctly.

## Manual validation for the first app

- Save/load round trip preserves scene appearance and identifiers.
- Duplicate state, edit one object, and verify original remains unchanged.
- Undo/redo place, move, rotate, duplicate, and delete.
- Compare states with identical camera/crop.
- Missing assets produce an actionable recovery state.
- Export uses intended dimensions and background.
- Inspect responsiveness using the real curated kit before setting performance budgets.

## Local art handoff

Art supplies reference renders and thumbnails. Maintain asset ID, source, rights/usage notes, revision, dimensions, camera, and state in a Markdown manifest. Keep editable source scenes separate from final images.
