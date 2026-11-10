# World Farm proposal: version and publishing register

Checked 10 November 2026. This is a proposal draft and a public/private route split. Deployment of the public proposal and protected workspace was explicitly approved. Confirm the actual deployment result before treating it as live.

## Start here

- Proposed page: `studio/public/proposal.html` (local preview: http://127.0.0.1:4318/proposal.html).
- Current studio: https://worldfarm.utilityinfielder.com/ (member-password gate).
- Current source of design decisions: [01.B Shared style → building kit](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=40-680).
- Code source: [aklein00/world_farm](https://github.com/aklein00/world_farm), website folder `studio/`.
- [Vercel project](https://vercel.com/aklein00s-projects/worldfarm).

Following the updated request, the branch prepares the proposal as the public `/` homepage (also `/proposal.html`), and moves the studio to `/workspace` behind the existing member-password gate. Only the proposal HTML, CSS, icon and three fonts are allowlisted publicly. Application modules, other assets and `/api/*` remain protected. Query strings and session cookies cannot turn the public page into a private-data view. Production access, DNS, environment values and Figma sharing have not changed.

## Workflow versions

| Version | Use | Verified link |
| --- | --- | --- |
| 01.B | Current twelve-screen shared-style journey; source for this proposal | [Edit 01.B](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=40-680) |
| 01 | Earlier guided wireframes, retained as history | [Edit 01](https://www.figma.com/design/iQF4XWbgrY5q2pPO7FTR7w?node-id=14-548) |
| Earlier interactive prototype | Guided start from a new style; not the latest implementation | [Play earlier flow](https://www.figma.com/proto/iQF4XWbgrY5q2pPO7FTR7w?node-id=15-7316&starting-point-node-id=15%3A7316) |
| Studio baseline | Production source at inspection, commit `5471d0f34f7eb31f74caffd50423c96118a490a5` | [Pinned code](https://github.com/aklein00/world_farm/tree/5471d0f34f7eb31f74caffd50423c96118a490a5/studio) |

The Figma node/page names and current 01.B content were checked with the connected account. Page links are living documents, not immutable Figma version-history permalinks. They may require Figma sign-in or permission; anonymous visitor access is not confirmed. Do not broaden sharing just to make these links work.

For the next edit: save a named version in Figma first, such as `01.B reviewed — YYYY-MM-DD`; record its copied version link here if Figma offers one. Then edit the live workflow. A named version was not created by this draft.

## What happened to the blocker?

The previous launch investigation stopped because Vercel required team SSO authorization before exposing deployment settings and domain status. That read-access blocker is no longer present: the current connector can inspect this project and deployment.

Current evidence:

- Vercel project `worldfarm`, ID `prj_IlQR24nhpf55w9j9xZwYqrN3nx8c`.
- Production deployment `dpl_E5rfxFYY7rHS4qn3DnLSB29UyX8f`, READY, from `main` commit `5471d0f` (Support Vercel Marketplace Redis credentials).
- `worldfarm.utilityinfielder.com` is verified. DNS configuration reports `misconfigured: false`; Cloudflare nameservers and a Vercel CNAME are present. No DNS repair is currently indicated.
- Required production environment-variable names are present: `APP_ORIGIN`, `WORLDFARM_PASSWORD`, `SESSION_SECRET`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`. Values were not decrypted. Source supports Vercel Marketplace KV aliases in addition to direct Upstash names.
- Unauthenticated HTTPS `/` returns 303 to `/login`; `/login` is available. This is the intentional member gate, not evidence of a broken deployment. Successful member login, Redis connectivity during login, and the hosted authenticated studio were not tested.
- Variables are scoped to Production. The prepared public proposal can render on a branch Preview, but its private workspace stays locked without its own Preview configuration. Do not copy production secrets into Preview or weaken the gate to obtain a preview.

The older `studio/PUBLISHING.md` is the setup guide; its historical “nothing deployed” statements predate the verified deployment above. Use this dated status for what is already done, and the guide for configuration requirements.

## Prepared branch status

The initial proposal-only draft is saved on `dot/worldfarm-proposal-2026-11-10`. Its Vercel preview built successfully at commit `7048b29`; that first draft retains the original whole-site member gate. The newer public-homepage/private-workspace change passed syntax checks, all 29 tests and the Vercel build. Deployment and a draft pull request are approved. The production release is being built from the exact reviewed branch commit, without merging the draft PR. Reconcile this branch with `main` before a later main-branch release to avoid overwriting it. Record the final deployment and PR links after verification.

## Hand work and decisions

1. **Review the draft.** Use the local preview or the source branch. Confirm the narrative and one demonstration example.
2. **Edit and name the Figma revision.** Save a named version and note changed screens. Figma changes do not automatically update the website.
3. **Verify the approved access change.** The proposal should load without sign-in, while `/workspace`, application modules and APIs stay protected. Generation remains a sample prototype, without ticket spending.
4. **Confirm a real member sign-in.** Use the password you already configured. Do not paste it into chat or commit it. Check one complete studio flow and export a backup.
5. **Keep the release and source in sync.** After reviewing the draft PR, merge the branch when ready. The existing Vercel project uses Git deployments from `main`; merging can trigger a production deployment. Check its exact commit/deployment afterward. No manual DNS work is currently required.

## Simple update loop

Figma 01.B → named design revision → short change note → `proposal.html`/`proposal.css` and relevant studio modules → tests → review → production deployment.

Keep current implemented capabilities separate from future features. Sample generation, browser saves, piece edits and exports are implemented. AI generation, cloud storage, individual accounts and collaboration are future work. Revalidate intended asset exports in their destination engine before claiming production readiness.

## Invite tickets: next implementation boundary

The requested name is ImageFarm’s existing **room tickets**. WorldFarm currently has no invite ledger or paid generation provider. Shared tickets are planned, not implemented or tested. Sample candidate generation must remain free and must never debit a real balance. One authoritative balance service, app-specific access, atomic reservations/refunds and a defined WorldFarm journey allowance are required before shared spending can be enabled. Do not share owner passwords, session secrets, project storage or broad database access between the apps.
