# WorldFarm — Figma wireframe specification

## Priority

Build after Stack City's first game wireframe/prototype pass. Keep a separate native Figma file. This document is a specification, not evidence that a file exists.

## Starting canvas and pages

Desktop workbench proposed at 1440 × 900 logical pixels. Preserve usable center viewport space and test a narrower window.

Pages: Start Here, Flow Map, Foundations, Components, Wireframes, Prototype, Asset/Scene Handoff, Review Log.

## Views

| ID | View | Essential elements |
| --- | --- | --- |
| WF-01 | Projects / new project | Name, kit, reference placeholders, create/open |
| WF-02 | Workbench, empty | Library left, viewport center, inspector right, top project/state/export bar |
| WF-03 | Kit browser | Category/search, thumbnails, selected asset, footprint, variants, place action |
| WF-04 | Workbench, selected object | Selection outline, transform fields, snap, duplicate, delete, material variant |
| WF-05 | Look development | Lighting presets, key light direction/intensity, environment level, atmosphere, camera |
| WF-06 | States | Named thumbnails, duplicate, rename, dirty marker, save state |
| WF-07 | Comparison | Same camera, side-by-side states, labeled differences, return to editing |
| WF-08 | Export | State/camera, dimensions, transparent option if supported, file naming, output preview |
| WF-09 | Export result | Success/file information, export again, return |
| WF-10 | Recovery / project settings | Unsaved changes, missing assets, import errors, save/load choices |

Dialogs and overlays can share components instead of becoming independent full-screen layouts.

## Prototype route

Create project → choose kit → place building → add tree/car → select and rotate building → change lighting → save Foundation → duplicate Connected → add decor → compare matched camera → choose export → simulated export success.

Add alternate routes for canceling a destructive action, editing an unsaved state, and encountering a missing module.

## Workbench layout

- Top: project name, save status, undo/redo, active state, camera, export.
- Left: kit categories/search and module grid; asset detail opens contextually.
- Center: scene with navigation hints and a compact placement toolbar.
- Right: inspector for selected object; lighting/camera panels when selected.
- Bottom or secondary rail: saved states and comparison action.

Avoid crowding the initial screen with generation controls. The first job is composition.

## Components and states

Asset tile (loading/ready/missing/selected), inspector field, transform input, segmented control, preset card, state thumbnail (saved/dirty/current), selection toolbar, save indicator, modal, export card, toast.

Important states: no project, no selection, object selected, placing, invalid placement if applicable, dirty state, saved, missing asset, export in progress, export failed, export complete.

Explain recovery and preserve unsaved work on failure.

## Prototype honesty

A native Figma prototype may swap prepared scene images to simulate placement and rotation. Label those actions as simulated in the file's notes. UI controls remain editable. No claim of actual geometry manipulation, file download, or rendering until implemented in the app.

## Accessibility

Keyboard focus and shortcut notes for the future app, labeled controls, readable numeric units, non-color-only selection, clear destructive-action copy. Distinguish object transform from camera navigation.

## Acceptance

Complete connected route; cancel/recovery branches; editable components and auto layout; placeholder IDs ready for local artwork; consistent project/state naming; direct editor and prototype links; list of simulated interactions and unresolved requirements.
