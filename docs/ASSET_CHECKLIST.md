# WORLDFARM — asset handoff

## Foundation kit v0.1

Implemented as procedural concept recipes in the separate Three.js lab: market shell, upper mass, roof/cornice, canopy, window bay, road, curb, planter, box-canopy tree, bench, lamp and compact car.

The three market approaches share a 6 × 4.2 unit main footprint and common scene camera. They are experiments, not approved production meshes.

## Asset contract

Every module needs a stable asset ID, version, footprint, ground pivot, bounds, material slots and compatible variants.

Proposed production units: meters; Y up; X/Z ground plane. UI rotations in degrees, stored rotations in radians. Confirm before production geometry.

Prefer versioned kit assets and snapshot scene states. Preserve original state data when duplicating. No cross-project runtime dependency is introduced.

## Matched output

WF-PREVIEW-FOUNDATION / CONNECTED: 2560 × 1440 PNG with shared Gameplay A camera, aspect, crop, exposure and lighting.

WF-KIT thumbnails: 512 × 512 PNG, same camera and neutral background. WF-EXPORT-COMPARE: 2560 × 1440 sheet with consistent state ordering and labels.

Figma export screens simulate results. The Three.js lab offers current-view PNG output; browser download automation did not complete verification.

## Later implementation

The complete workbench, real placement transforms, versioned scene save/load, undo/redo, reliable exports and missing-asset recovery remain future application work.

ImageFarm is inspiration only. Its source has not been audited; no code-reuse commitment has been made.
