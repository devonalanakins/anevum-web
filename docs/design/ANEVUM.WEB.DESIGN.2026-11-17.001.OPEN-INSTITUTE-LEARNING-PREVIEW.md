# ANEVUM Open Institute — Learning Preview

Session: `ANEVUM.WEB.DESIGN.2026-11-17.001.OPEN-INSTITUTE-LEARNING-PREVIEW`
Status: **DRAFT / REVIEW-ONLY / NO DEPLOYMENT**
Owner: Devon Alan Akins
Repository: `devonalanakins/anevum-web`
Source: `apps/anevum-institute-preview/`

## Purpose

Preserve the cinematic Living Laboratory direction and demonstrate a real educational journey: Institute -> Academy -> CFP-101 -> transistor lesson -> Boolean logic lesson -> working AND-gate experiment. This proposal supersedes the previous bonsai-as-apex *direction* for future consideration, but does **not** delete the bonsai implementation, botanical records, or protected original-works releases.

ANEVUM is described truthfully as an independent, non-accredited open educational and research project. The lessons and experiment are prototype content. Remaining schools, academic programs, Commons, research and learner accounts are *not* implemented or live.

## Routes, isolated prefix only

| Path | Capability |
| --- | --- |
| `/institute-preview` | Cinematic institute entrance, destinations, founding course |
| `/institute-preview/academy` | School overview and truthful catalog |
| `/institute-preview/academy/cfp-101` | Course syllabus with one linked published preview lesson, seven roadmap units |
| `/institute-preview/learn/cfp-101/transistor-switching` | Introductory transistor/CMOS inverter explanation, interactive ideal inverter, knowledge check and original references |
| `/institute-preview/learn/cfp-101/logic-gates` | Introduction to Boolean AND, CMOS distinction, truth table, interactive assessment (preserved URL) |
| `/institute-preview/laboratory/and-gate` | Deterministic two-input model, all four truth-table combinations, reset and feedback |
| `/institute-preview/curriculum/cfp-101.json` | Portable versioned curriculum manifest: 8 proposed units, 2 currently available lessons, explicit prerequisites and editorial states |

Assets: allowlisted, same-origin `/institute-preview/assets/*.webp` from already-reviewed and versioned `apps/anevum-public-studio/living-laboratory-art.mjs`. Images are visual concepts, not real scientific measurements or evidence.

The server-only Worker module accepts `GET`/`HEAD` on exact routes on `https://anevum.com` and returns `404` for any other route or origin. `POST` is rejected. Strict CSP, noindex, noarchive, frame protection and no third-party runtime requests apply. No private or protected service is referenced.

## Learning behavior

- The AND truth table is exact: 00 -> 0, 01 -> 0, 10 -> 0, 11 -> 1.
- A simple quiz provides feedback for incorrect and correct answers.
- Experiments track which of the four input configurations has been visited, with reset.
- Minimal three-activity learning progress is recorded **only in device-local storage**, not in a server database, transcript, user account or externally shared account. When storage is unavailable, learning still functions but persistence is not guaranteed.
- The ideal Boolean simulation is **not a transistor-level electronic simulation**.
- Course enrollment, certificates, learner identities, community contributions, research publication and accreditation are not claimed.

## Development boundary

The new preview is isolated and additive. It does not edit:

- `apps/anevum-public-studio/worker.mjs`, its deployed Worker, or the apex root;
- `anevum.com/*` catch-all Worker or Cloudflare routes;
- legacy `/original-works*` content;
- Command, member, staff, API, authentication, D1/R2, secrets, account permissions, or DNS;
- PR #813 cinematic preview, #814 bonsai design or #815 bonsai implementation;
- original creative, botanical, family or unpublished publication content.

The existing production site and routes are not changed by this PR. The preview paths are source-level only unless a future, separately authorized route owner is created. `/institute-preview` is **not advertised as a publicly accessible preview URL**.

## Verification

Dedicated tests:
```sh
node --check apps/anevum-institute-preview/worker.mjs
node --test tests/anevum-institute-preview.test.mjs
node scripts/ops/verify-anevum-institute-preview-browser.mjs
```

The browser verifier serves only the isolated Worker on loopback, renders five routes at 320, 390, 768, 1024 and 1440px, exercises keyboard focus, mobile disclosure, quiz, local progress, four-state circuit logic, responsive overflow and image decoding, and captures mobile/desktop screenshots. Dedicated CI intentionally lacks any deployment command.

Passing isolated tests is **not** evidence of production readiness. Full repository integration, visual owner acceptance, content accuracy review, subject-matter editorial review, publication/license review, full-suite CI, security review and independent deployment/rollback gates remain necessary.

## Next approved decision

Review desktop/mobile screenshots and the functioning educational journey. If accepted, design the production route integration and content authoring workflow as a separate PR; preserve the existing isolated deployment and the earlier ANEVUM source and route boundaries until an explicit publication/cutover decision.

## November 17 — Identity and experience redesign v2 (review candidate, not final brand approval)

Session: `ANEVUM.WEB.DESIGN.2026-11-17.002.OPEN-APERTURE-IDENTITY-EXPERIENCE`

### Strategic intent

ANEVUM should be recognizable independently of any hero image, physical-building metaphor or software project. The open institute is an education-first product, not a simulated university with claims of a real campus. Deliver two deliberate modes: **Discovery** (architectural, atmospheric, cinematic) and **Study** (quiet editorial text, accurate calculations, precise controls, no visual interference).

### Original vector mark

`apps/anevum-institute-preview/mark.svg` defines the **Open Aperture** symbol:

- Three rising tapered paths converge within an unfinished orbital arc, representing learning, experimentation and discovery that remains open to revision. It should remain legible at favicon scale and without accompanying text.
- The asymmetrical open arc distinguishes it from the former generic circled-A placeholder; the shape is a distinctive proposal, not a claim of formal trademark clearance.
- Paired wordmark: **ANEVUM** in an editorial serif, wide tracking. Descriptor: **THE OPEN INSTITUTE** in concise readable sans.
- Suggested clear space: at least 25% of the mark's diameter on all sides. Minimum interactive target 44px. Do not crop the arc, rotate the mark to simulate activity, or distort its proportions.
- Keep original SVG as editable master. The Worker serves this from a source-coupled `artwork.mjs` module on exact allowed paths. No remote images, font services or inline JavaScript inside SVG.
- Monochrome, print, light-background, signage and 16/24/32px variants require separate visual acceptance; the color vector is **not yet final approved institutional branding**.

### Design tokens and typography

| Role | Proposed value | Usage |
| --- | --- | --- |
| Obsidian Midnight | `#071016` | Campus and reading/navigation shell |
| Mineral Teal | `#315D61` | Laboratory scientific interfaces and secondary accents |
| Antique Brass | `#D9B17A` | Primary actions and meaningful active states only |
| Porcelain Paper | `#F4F1E8` | Long-form high-comfort reading canvas |
| Living Sage | `#95B9AB` | Measured progress and explanatory annotations |
| Dark Study Ink | `#1D3035` | Reading content on light paper |

Display uses a refined serif fallback such as Georgia; general UI uses an accessible humanist/system sans; mathematics and experimental measurements use monospace. Asset licenses, font hosting, widths and text contrast must be reviewed before choosing any third-party font.

### Experience and navigation

- **Global navigation:** Institute, Academy, Laboratory. Everything in the navigation works in this preview. Course and Classroom are contextual destinations reached through the Academy, lesson breadcrumbs, and direct CTAs. Research, Commons and other subjects remain visibly proposed; do not create dead links or false enrollment screens.
- **Entrance:** Original `observatory.svg` source depicts a conceptual dome, illuminated orbital instrument and science campus. It is **fictional interface artwork**, not an image of a real facility. Content must remain legible without motion or imagery.
- **Academy:** A published course is visually distinct from future curricula. Show a clear syllabus, subject, level, availability and immediate reading action rather than fabricated enrollment numbers.
- **Classroom:** Light ivory study surface inside a dark institute shell; anchored lesson outline, explicit evidence caveats, type at readable line lengths, intuitive self-test and a direct path into the lab. On phones, the lesson precedes optional outline furniture.
- **Laboratory:** Dark instrument panel, real two-input model, four-row truth table, highlighted current state, observed output, reset and evidence-aware model explanation. No fake instrument readings, external uploads or implied transistor-level computation.
- **Motion:** Only decor and spatial context may animate. Functional meaning cannot depend on 3D, pointer movement, parallax or video. Respect `prefers-reduced-motion`; never autoplay an educational step required for understanding.
- **Privacy:** The prototype stores only two Boolean completion flags in device-local storage. No user accounts, tracking, server-side records, grades or published learner performance.

### Implementation now in the isolated draft

The five-page preview has a custom vector mark and favicon, new SVG observatory, more concise global nav, direct lesson CTA, explicit non-accreditation notice, dark campus / light classroom / dark lab contrast, mobile-responsive layout and exact static asset allowlists. Source files are in `apps/anevum-institute-preview/`, with no production route, authorization, database, DNS, Worker service or payment change.

### Remaining genuine redesign work

1. Review 320/390/768/1024/1440 screenshots and compare with the high-fidelity campus direction; iterate on hierarchy, copy, balance and dark/light contrast.
2. Produce approved monochrome/small-format mark assets and a formal full trademark/copyright/asset license review before public branding.
3. Expand Academy information architecture and author a complete first course; test against actual nontechnical learners.
4. Build research/Commons workflows only when real moderation, governance, attribution and reproducibility infrastructure exists.
5. Preserve PRs #813–815 and all botanical/fictional work. No automatic conversion of the new mark or conceptual visual into production branding.

**Release gate remains NO-GO** pending owner visual acceptance, full CI reconciliation, authenticated route ownership/rollback review, production security checks and explicitly authorized publication.

## Experimental notebook v3 — preview-only, 2026-11-17

Session: `ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION`

The isolated Boolean AND laboratory now records each distinct input pair encountered during a session in a deterministic, in-memory observation list and offers **Export notebook (JSON)**. The export schema uses `schemaVersion: 1`, `experimentId: CFP-101-AND-001`, the exact ideal Boolean model identifier, ordered `inputA`, `inputB`, `outputQ` records, coverage metadata and explicit simulation limitations. No account, network upload, API or database is involved. Export occurs only after the learner clicks the button; the browser handles the download.

The initial `00` state is an observation. Input switches reveal the other three states, and Restart discards the session notebook and creates a fresh initial `00` record. Locally stored lesson/experiment completion remains a separate device-only preview flag, not a durable laboratory record. The notebook export is not research evidence from physical devices, does not record measured voltages, and does not imply certified assessment or institutional publication.

Verification requirement: dedicated Node contract tests, Chromium export/JSON/coverage/reset journey at representative phone viewport, UI overflow at all five existing widths, review of exact-head GitHub Actions checks. The existing owner-only Cloudflare preview gate must remain fail-closed; **no production route changes, external deployment, brand-publication decision or user account changes** are made by this increment.

## CFP-101 transistors-first curricular integration v4 — preview-only, 2026-11-17

Session: `ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION`

The eight-unit syllabus now begins with **semiconductors and transistor switching**, followed by **binary logic and gates**. Two original introductory lessons are available in the isolated preview; the remaining six units remain explicitly unimplemented. The original Boolean lesson and working AND-gate laboratory URLs are preserved unchanged. Institute, Academy and syllabus entrypoints now point to the transistor-first beginning.

**Lesson 01** (`/institute-preview/learn/cfp-101/transistor-switching`): physical-vs-digital model distinctions, MOSFET channel control, conceptual CMOS inverter functional diagram, steady-state `Q=NOT(A)` truth table, interactive input toggle, correct/incorrect feedback, worked reasoning, limitations, source attribution and extension exercises. This is an ideal steady-state model, not SPICE, device physics calculation or an electrical measurement. Scientific background: MIT OpenCourseWare 6.012, *Microelectronic Devices and Circuits*, MOSFET and CMOS lecture notes, https://ocw.mit.edu/courses/6-012-microelectronic-devices-and-circuits-spring-2009/pages/lecture-notes/ . The explanation and figure were authored for this project and do not reproduce course material.

**Lesson 02** retains the `logic-gates` URL and its AND-gate assessment; the lab retains exact Boolean outcomes and offline JSON notebook export. In the device-only preview, the existing `anevum.institute.cfp101.preview.v1` localStorage key is retained and extended with a third Boolean flag (`transistor`), preserving previously recorded `lesson` and `experiment` values. All three activities remain independent; there are no grades, enrollment or server-side records.

**Verification scope:** source parse, six preview routes × five viewport widths, inverter high/low simulation and assessment, AND-gate all four states, JSON export/reset, preservation of prior URLs, no horizontal overflow, keyboard/nav controls, noindex/CSP and fail-closed origin/method/route behavior. Formal subject-matter editorial review, external content-license review, iPhone Safari, self-hosting, persistence and production integration remain required before release. No production or Cloudflare changes are made in this draft.

## Source-controlled curriculum manifest v5 — review-only, 2026-11-17

Session: `ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION`.

`apps/anevum-institute-preview/curriculum.mjs` now owns a single versioned CFP-101 curriculum metadata model (`schemaVersion=1`, `version=0.2.0`, `editorialStatus=draft`, `status=preview`, `accreditation=none`). Its eight units have stable IDs, sequential indices, availability, lesson-path ownership and prerequisite dependencies. The syllabus view is rendered from this data instead of a second hardcoded unit list. The Worker additionally serves the exact, allowlisted path `/institute-preview/curriculum/cfp-101.json` as an offline-readable/downloadable JSON representation with the existing CSP/noindex/HEAD restrictions.

`validateCurriculum` checks course identity/version, unit count, sequence, unique IDs and paths, prereqs referring only to earlier units, and fail-closed lesson availability. The CI must test negative records: unlinked preview lesson, forward prerequisite, duplicate URL and missing unit ID.

This establishes **only a portable metadata foundation**. It is not a complete education engine, course authoring interface, production route, enrollment system, or self-hosting acceptance. Missing lesson bodies and unreviewed content must remain unavailable until independently validated.

## Device-local Learning Studio notes v6 — isolated draft, 2026-11-17

Session: `ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION`.

Both preview lessons now embed the reusable `apps/anevum-institute-preview/study-tools.mjs` interface: keyed, independent notes and bookmarks in browser localStorage (`anevum.institute.study.v1.CFP-101-U01` and `CFP-101-U02`), explicit Save Notes, downloadable plain-text export, and **two-click** confirmation before removing saved local notes and bookmark. Notes are stored as text values, never inserted as HTML. Limits: 8,000 characters per lesson, no networking or server storage, and no claim of encryption, remote backup, access-controlled privacy, or learner accounts. The UI explicitly warns against entering sensitive personal information.

Source and browser tests must verify note isolation between lessons, persistence across route reloads, bookmark restore, exported text content, confirmation-before-delete, and no stale records after deletion. Review appearance and navigation across 320–1440px in existing CI, with full-height desktop/mobile lesson captures.

This work supports **only local notes and bookmarks in the first two prototype lessons**. It is not the requested full learner workspace, secure identity system, transcript, server progress, or editorial administration. All still require separate design/security/approval reviews and independent release tests.
