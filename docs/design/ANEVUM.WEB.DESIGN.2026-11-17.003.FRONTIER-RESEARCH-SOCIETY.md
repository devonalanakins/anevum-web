# ANEVUM.WEB.DESIGN.2026-11-17.003 — Frontier Research Society

Status: ACTIVE DESIGN CANDIDATE / NOT OWNER-APPROVED BRAND LAUNCH  
Session: ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION  
Repository: devonalanakins/anevum-web; draft PR #816  
Effective direction: 2026-11-17

## Positioning

ANEVUM is envisioned as a **free, open, independent research and continuing-learning society**, not a simulated university campus, a generic MOOC, or a claim to operate physical facilities. The atmosphere should feel like a serious frontier research operation: monumental instrumentation, underground architecture, scientific precision and independent experimentation. Inspiration may include the discipline of AI compute laboratories and the fictional dramatic scale of Black Mesa, but no borrowed trademarks, logos, diagrams, building designs or specific fictional identity.

Working public language for design review: **ANEVUM — Open Research Society**. This is a candidate descriptor, not a registered legal name or claim of incorporation. The prior **Open Institute** visual/curriculum work, bonsai archive, Living Atlas and original fiction are preserved. The soft observatory-as-university-homepage direction is SUPERSEDED as the primary landing page, but the source and assets remain in the repository for archive and design provenance.

Foundational proposition: Learn free; understand through doing; publish only claims supported by method and evidence; give durable credit for original work and reproducibility, not attendance or follower counts.

**Free forever is an institutional intent** for core educational material, subject to a sustainable operational funding model; do not represent long-term funded delivery as legally guaranteed or currently endowed.

## Experience

1. **Society / Discovery**: cinematic frontier laboratory imagery and atmospheric MP4/light effects behind a real semantic page; clear entry into an actual learning task. Current isolated implementation uses previously reviewed same-origin artwork as a source-level fallback. The new high-resolution cavern scene is a separate owner-review asset and is not yet in the GitHub branch. No live model viewer, WebGL requirement, or static poster used as a fake application.
2. **Academy / Working Mode**: preserve CFP-101 transistor lesson, Boolean logic lesson, progress flags, local notes and laboratory. Comfortable paper reading mode, quiet interaction.
3. **Evidence standard**: a reviewable explanation of independent practice, reproducible artifacts, critique, and reproduction. Distinct evidence categories, not a gamified level ladder.
4. **Personal research workspace (future)**: adults can register with a secure identity, private-by-default study records, learning paths, notes and bookmarks. Account-free learning remains possible. A profile is optional/public only after explicit consent and publishes attributable artifacts rather than private notes.
5. **Research and Commons (future)**: authored methodology, versioned materials, moderation, reviewer accountability, error correction, appeal and reproducible computational evidence. All external claims remain unissued until independently reviewed.

## Evidence-based recognition design (proposed, not operational)

**Practice trace:** local or authenticated record indicating a specific assessed activity occurred against an identified content version. Not a qualification.

**Demonstrated artifact:** a source-linked project with documented objectives, origin, methods, reproducibility environment, license, controls and known limitations. Evaluation is rubric-based and transparent.

**Independent critique:** written findings from a reviewer with scoped permission and disclosed conflicts. Review may be negative or conditional; a positive icon cannot replace review text. Author and reviewer retain distinct attribution.

**Independent reproduction:** a separate person's documented rerun of the same conditions with comparable result or an explicit non-replication. Reviewers may update or retract conclusions; permanent history preserves revisions.

Recognition is represented by evidence-led **Proof Objects** with canonical identifiers, artifact/version linkage, assessment rubric, reviewer identity and disclosures, signature/attestation when designed, published scope/limitations, expiration or revocation semantics where appropriate, and audit trail. No paid tier buys recognition. A proof object does **not** constitute a college degree, accreditation, professional license, peer-reviewed scientific publication, or medical/scientific competence certificate. The source-code and trust model must be independently security reviewed before public issuance.

Metrics should not collapse unlike accomplishments into one universal score. A learner may be accomplished at research reproduction while early in a different discipline; the dossier should show multidimensional verified capabilities, dissent, and what has not been reviewed.

## Privacy and governance

Adult-focused, privacy-first; anonymous public course access with no sign-in wall. Planned profile includes pseudonymous public display when appropriate, explicit attribution controls, private-by-default raw learning events, content version tracking, consented publication, retention/deletion/export, strong sessions, CSRF and XSS defenses, rate limiting, roles and audit events. Public submissions require review and moderation. Never publish children's information or clinical records, nor import identities from Nona Neuropsychology or unrelated projects.

Institutional review authority must not be an arbitrary developer role; separate authors, reviewers, moderators, operators and administrators. Award issuance requires transparent rubric, evidence checks, revocation/appeal policy, conflict handling and audit-backed transitions.

## Source changes in this draft increment

- `apps/anevum-institute-preview/frontier-society.mjs`: new discovery homepage and recognition protocol view, under isolated `/institute-preview` URLs, with explicit preview/proposed distinction.
- `apps/anevum-institute-preview/worker.mjs`: new Society/Recognition navigation, separate home/recognition routes; no account or public issuance route.
- `apps/anevum-institute-preview/styles.mjs`: component-level dark cinematic system, responsive layouts, calmer working-mode preservation and reduced-motion fallback.
- `apps/anevum-institute-preview/client.mjs`: a genuine read-only `0/3` to `3/3` practice trace drawn from existing browser-local CFP-101 flags; never claim external review.
- `tests/anevum-institute-preview.test.mjs` and Chromium QA: seven route/5 width review, empty and populated evidence states, named active vs proposed surfaces, route security and mobile experience.
- Existing curriculum, notes, laboratory, open-aperture image candidate, observatory vector, and historical work remain untouched by the new media direction.

## Visual media pipeline

Pre-rendered, carefully art-directed imagery, not live 3D models: high-quality source image with independent compressed mobile/desktop derivatives; masked MP4/WebM atmospheric layers (fog, light, rain or caustics) separated from page markup; CSS gradients only for readability and fallback. Every media element must have verified provenance/licensing, responsive crop, low-bandwidth poster, and reduced-motion/Save-Data static treatment. Target 1672×941 authored concept, not native 4K. Review 390px and 1440px compositions before adoption. Do not claim production artwork or final owner approval until review is complete.

## Acceptance and release gates

Draft source is allowed; no production routing, DNS, Access policies, merges, deployments or public brand replacement. CI must check schema, route isolation, test paths, actual Chromium interaction and 320/390/768/1024/1440 widths. Hosted preview Cloudflare Access pinned application/Worker identifiers remain owner-only configuration and must not be bypassed to produce a green release.

## Personal evidence workbench implementation — 2026-11-17

**Scope:** isolated review-only route `/institute-preview/dossier` with the existing Worker and no production binding. This is an interactive *personal research desk*, not a member profile or scientific-award service. The new route is deliberately separated from the existing protected member/Command identity systems; it does not register accounts, publish artifacts, change Cloudflare, or expose a write API.

### Actual user capability

A learner can produce a personal draft with a title, research question, reproducible method, observations, limitations, and up to eight HTTPS references. A shared Node/browser validation module enforces the same versioned portable schema. The learner can save to browser-local storage, revisit the draft, export a JSON document with SHA-256 checksum, import a previously exported record with strict structure/digest checks, and delete the saved record after a two-click confirmation. Personal drafts never become reviewed, credentialed, or publicly attributable by changing labels.

The workbench also accepts the existing `CFP-101-AND-001` laboratory JSON. It validates schema, exact ideal Boolean model, row coverage, distinct 0/1 input pairs, and mathematically correct outputs. It first **stages** the content; the learner must explicitly apply it to the editor and separately save or export. Observation text, limitations, and provenance distinguish a browser simulation from a hardware measurement and from independently reviewed findings. A determined actor can forge both an unsigned source notebook and its SHA checksum; **neither is a digital signature, authentication, or an institutional attestation**.

The portal's JavaScript loads the workbench module only on the dossier route using same-origin code and a strict CSP. No external network requests or user-code execution are added. Content is displayed through native textarea values and textContent, not untrusted HTML. The educational site remains accessible without registration.

### Boundaries

- One *device-only draft* in a browser profile, unencrypted. No multi-user identity, collaboration, database, backed-up research archive, reviewer assignment, role permissions, signed awards, security-reviewed publication, or full self-hosting acceptance.
- Import limits and explicit failure feedback protect against malformed JSON and overwriting saved work without an intentional action.
- The workbench is subordinate to the published lesson and reproducible artifact, never to a points, streak, or popularity score.
- Historical ANEVUM creative, botanical, and institutional design code remains preserved.
- Full site launch, new public branding, imagery and video adoption, Access configuration, production merge, and any award issuance continue to require separate approval and verification.

### Verification

Dedicated Node contracts and real Chromium browser checks cover responsive layouts at widths 320, 390, 768, 1024, and 1440, working input validation, local persistence and reload, exported and imported record checks, counterfeit and malformed payload rejection, confirmed deletion, and staging a real AND-lab output. The workbench's first editable field must be visible in the initial 390px/1440px viewport; working surfaces are deliberately task-first rather than cinematic wrappers. Record exact-head GitHub Actions links and results in PR #816, not as assumptions here.

## Cinematic WebGL review implementation — 2026-11-17

**Session owner:** ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION  
**Scope:** isolated draft preview only; NO production/public identity rollout or release approval.

The Frontier Society home now runs a real WebGL 1 transparent shader over authored high-resolution still artwork. It simulates restrained drifting atmospheric haze, cyan and copper light, wide diffusion, and subtle pointer-responsive light direction. The shader does not pretend to model a physical facility, simulate scientific measurements or render live 3D meshes. All actual course, laboratory, navigation, dossier, and review controls remain ordinary accessible HTML.

**Implemented components:**
- `apps/anevum-institute-preview/frontier-gl.mjs`: independent same-origin shader, bounded GPU pixel area (approximately 1.05 million pixels), low-power context, approximately 24 FPS cap, page-visibility pause, intersection pause, dynamic resize, context-loss detection/recovery, reduced-motion and Save-Data bypass, and fail-closed static-art fallback.
- `frontier-society.mjs` and `styles.mjs`: an integrated semantic-safe canvas behind the content and over the poster; no user-facing input hidden in graphics. Responsive poster composition and deliberate readability overlays on 390px phones.
- `client.mjs` and `worker.mjs`: lazy same-origin module load on the Discovery page only, with strict CSP and no external WebGL dependencies.
- **Provisional visual review art:** two original high-definition WebP blobs copied by identical SHA from historic cinematic draft PR #813 into `apps/anevum-institute-preview/media/`. Preserving original source history rather than merging the older PR. See `media/PROVENANCE.md`.
- `scripts/ops/anevum-institute-preview-server.mjs`: loopback-only allowlisted art loader with Git blob integrity verification. Direct Worker requests fail closed unless the intentionally scoped media binding is supplied. This is a review-server capability, not a production asset deployment claim.
- Browser QA now checks eight pages at 320/390/768/1024/1440px and adds actual *active WebGL* desktop/mobile frame screenshots, runtime reduced-motion toggling and a forced missing-GPU context with correct static fallback. A high-resolution poster must decode at the intended 1536px desktop / 720px phone widths.

**Review limitations:** These stills preserve the earlier illuminated orbital laboratory identity as a sharper interim visual candidate; the new original November 17 cavern/facility art and six-second MP4 remain separate owner-review files and **are not the assets shown in this GitHub preview**. Their transfer, owner approval, originality/trademark review, licensing, accessibility, sustained FPS/thermal performance on iPhone Safari, final desktop composition, and production route integration remain outstanding. Do not call this a final AAA-approved public experience merely because the current renderer passes Chromium automation.

The following stronger release gates remain mandatory: human visual acceptance; WCAG 2.2 AA review with actual assistive technology; performance on real iOS Safari and low-memory Android; proper self-hosted binary assets and caching; WebGL2/WebGPU compatibility only if it materially improves the result; full repo's owner-only Cloudflare Access checks; and separate owner production publication authorization.
