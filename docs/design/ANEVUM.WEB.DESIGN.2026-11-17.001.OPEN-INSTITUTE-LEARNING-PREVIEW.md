# ANEVUM Open Institute — Learning Preview

Session: `ANEVUM.WEB.DESIGN.2026-11-17.001.OPEN-INSTITUTE-LEARNING-PREVIEW`
Status: **DRAFT / REVIEW-ONLY / NO DEPLOYMENT**
Owner: Devon Alan Akins
Repository: `devonalanakins/anevum-web`
Source: `apps/anevum-institute-preview/`

## Purpose

Preserve the cinematic Living Laboratory direction and demonstrate a real educational journey: Institute -> Academy -> CFP-101 -> Boolean logic lesson -> working AND-gate experiment. This proposal supersedes the previous bonsai-as-apex *direction* for future consideration, but does **not** delete the bonsai implementation, botanical records, or protected original-works releases.

ANEVUM is described truthfully as an independent, non-accredited open educational and research project. The first lesson and experiment are prototype content. Remaining schools, academic programs, Commons, research and learner accounts are *not* implemented or live.

## Routes, isolated prefix only

| Path | Capability |
| --- | --- |
| `/institute-preview` | Cinematic institute entrance, destinations, founding course |
| `/institute-preview/academy` | School overview and truthful catalog |
| `/institute-preview/academy/cfp-101` | Course syllabus with one linked published preview lesson, seven roadmap units |
| `/institute-preview/learn/cfp-101/logic-gates` | Introduction to Boolean AND, CMOS distinction, truth table, interactive assessment |
| `/institute-preview/laboratory/and-gate` | Deterministic two-input model, all four truth-table combinations, reset and feedback |

Assets: allowlisted, same-origin `/institute-preview/assets/*.webp` from already-reviewed and versioned `apps/anevum-public-studio/living-laboratory-art.mjs`. Images are visual concepts, not real scientific measurements or evidence.

The server-only Worker module accepts `GET`/`HEAD` on exact routes on `https://anevum.com` and returns `404` for any other route or origin. `POST` is rejected. Strict CSP, noindex, noarchive, frame protection and no third-party runtime requests apply. No private or protected service is referenced.

## Learning behavior

- The AND truth table is exact: 00 -> 0, 01 -> 0, 10 -> 0, 11 -> 1.
- A simple quiz provides feedback for incorrect and correct answers.
- Experiments track which of the four input configurations has been visited, with reset.
- Minimal learning progress is recorded **only in device-local storage**, not in a server database, transcript, user account or externally shared account. When storage is unavailable, learning still functions but persistence is not guaranteed.
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
