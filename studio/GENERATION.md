# Bounded procedural generation

This implements the generation beat of WorldFarm's [01.B workflow](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=40-952). It is a local, rule-based building generator. It is not an AI model, and it does not call a provider, require a key, spend credits, or send descriptions off the device.

## Brief contract

Building type (bakery, shop, townhouse or workshop), footprint (1×2, 2×2 or 3×2 plots), height (1–3 floors) and the awning checkbox are fixed constraints. They win over conflicting prose, with a visible warning.

The small English grammar recognizes:

- Broad/wide or narrow/compact building, shopfront, facade or frontage.
- Left, right or centered entrance; wide or narrow entrance.
- Wide or narrow windows, and 1–4 front windows per upper floor.
- Flat, pitched, sloped or hip roof; an explicit roof pitch from 0° to 45°.
- Solid/plain or striped awning, when an awning is enabled on a shop or bakery.

Example: “Broad shopfront, entrance on the left, three windows per floor, 35 degree pitched roof, solid awning.”

The interface lists what was interpreted. Unlisted prose, materials, colors and mood stay as notes and do not alter the geometry or random seed. Shared materials stay with the selected style. Certain known unsupported forms (such as towers, floating structures, interiors or domes), conflicting directives and out-of-range requests fail with a suggested supported alternative. This is intentionally not a general-purpose natural-language interpreter. A window count applies to upper floors, not shop display glazing.

## Recipe and editability

Three candidates are built from the brief and a deterministic round seed. Explicit supported requirements remain fixed; unspecified facade proportions, door widths, opening rhythm and depth vary. Regeneration does not mutate saved buildings or an existing editing draft. Accepting a candidate copies it to a draft; replacing another draft requires confirmation.

The original Market Kit 01 provides the shared visual family, materials, body, roof detailing and side/rear anatomy. Generated front facades are reflowed from parameters, not chosen from three preset layouts. Openings have separate names and roles. Building width/depth/floors, upper-window count/proportion, frame thickness, entrance width/position, roof pitch/overhang, awning visibility and pattern remain editable. Front openings reserve slots, and all parameters stay within the bounded kit envelope. This is not arbitrary topology, boolean openings, structural validation or production game-asset certification.

The portable source is tagged `procedural-kit-v1`, with the engine, seed, round, original description, interpreted details, warnings, parameters and overrides. Project JSON validates and preserves it together with style versions, pinned overrides, placements and drafts. Schema 1 legacy `mock-kit` projects still load without changing their original shapes or colors. The legacy wireframe example shortcut is still explicitly labeled as examples.

GLB uses exactly the same geometry builder as the viewport. It exports named meshes and role tags, plus source recipe/style metadata on building roots. Use project JSON to reopen the full WorldFarm workflow. PNG remains a camera image. Authentication, credit APIs and production access settings are unchanged.

## Verification

Run from `studio/`:

```
npm run check
npm test
npm run build:vercel
```

Generation tests cover deterministic seeds, supported/unsupported language, constraint precedence, independent candidates, non-mutating regeneration, all 216 style/type/floor/footprint combinations, finite geometry, plot bounds, non-overlapping front openings, piece edits, pinned revisions, legacy import, hostile/malformed project fields and GLB recipe preservation.

Browser interaction QA covers generation, accept, edits, save/reload, failure/retry and preservation of saved buildings. The current cloud browser cannot initialize WebGL, so its visual rendering is not a passed browser check. Exported models were separately rendered and visually inspected in Blender; the shared viewport/export geometry and bounds are tested in Node. A WebGL-capable device should complete orbit/zoom/part-picking and PNG visual review before calling the entire studio production-ready.
