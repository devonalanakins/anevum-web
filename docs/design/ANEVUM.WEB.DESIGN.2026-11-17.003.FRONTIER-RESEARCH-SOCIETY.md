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
