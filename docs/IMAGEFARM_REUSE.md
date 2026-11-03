# WorldFarm — ImageFarm applicability and reuse assessment

## Evidence available

The [ImageFarm public preview](https://imagefarm.utilityinfielder.com/) presents a room-design journey: Concept → Furniture → Arrange → optional Material study → Lighting → Final renders. It describes a sample preview and invite-based workspaces.

The [Product Studio page](https://www.artkleinart.com/prototypes.html) also describes ImageFarm's room workflow.

No ImageFarm source repository was identified or audited during this planning. No private workspace, generation service, or underlying 3D capability was verified. The mappings below are product/workflow opportunities.

## Workflow mapping

| ImageFarm concept | WorldFarm opportunity |
| --- | --- |
| Furnished room direction | Environment mood and world direction |
| Furniture selection | Building, road, vegetation, vehicle, and prop selection |
| Room arrangement | Modular scene composition |
| Material study | Coordinated material families and palette variants |
| Lighting exploration | Named reproducible lighting rigs |
| Final variations | Saved scene states and matched-camera exports |

## Candidate code reuse — requires source inspection

If present and appropriately licensed: project navigation, reference upload, asset gallery, job status UI, revision selection, storage wrappers, export naming, and reusable controls.

Do not assume these components exist from the preview. Do not promise code transfer before reviewing source structure, dependencies, data contracts, and ownership.

## WorldFarm-specific additions

True modular geometry and transforms; asset scale/pivots; camera persistence; scene-state snapshots; undo/redo; reproducible lighting; matched state comparison; versioned scene persistence.

A room-render generation workflow alone does not establish any of those capabilities.

## Carry forward selectively

Preserve clear stages and explicit user decisions. Keep composition fluid rather than forcing every action through a linear wizard. Allow users to revisit lighting and module choices.

Do not copy invite-ticket quotas or room-specific business rules by default. WorldFarm's initial audience is the creator; its commercial model is open.

## Source audit checklist for later

1. Obtain the correct source repository or local path from Art if unavailable.
2. Read project instructions and identify architecture.
3. Inventory implemented capabilities with file-level evidence.
4. Compare schemas and rendering approach against WorldFarm needs.
5. Identify safe reusable units and required adaptations.
6. Decide shared package versus independent fork based on actual coupling.
7. Document license, credentials setup, and migration risks without copying secrets.

Until then, describe WorldFarm as inspired by ImageFarm's workflow, not implemented on a verified shared codebase.
