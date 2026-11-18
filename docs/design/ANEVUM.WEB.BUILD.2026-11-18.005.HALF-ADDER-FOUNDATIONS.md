# CFP-101 Unit 03 — Half-Adder Foundations

Session: `ANEVUM.WEB.BUILD.2026-11-18.005.HALF-ADDER-FOUNDATIONS`
Status: Source preview; independent subject-matter review, hosted preview acceptance, and public release pending.

## New educational slice
Original Unit 03 introductory lesson at `/institute-preview/learn/cfp-101/half-adders`. The learning path derives `S = A XOR B` and `C = A AND B` from positional binary addition, then verifies each of the four possible input combinations in an ideal Boolean half-adder workbench. The simulator offers accessible binary inputs, simultaneous sum/carry output readouts, visited-state truth table, progress, reset, incorrect/correct self-assessment feedback, JSON observation export, and the existing local notes/bookmark controls.

The pure `evaluateHalfAdder` function is independently unit-tested, including rejecting non-binary inputs. Browser QA exercises all four combinations, event handling, export contents, reset and responsive layouts.

## Honesty and persistence boundaries
The browser model is not electrical hardware, transistor timing, semiconductor measurement, an authenticated provenance system, a verified certificate, an enrollment, or an academic qualification. Observations are in-memory for the active page session; export is opt-in. Existing device-local study notes are supported. The founding three-activity local progress meter is not redefined by this new unit; it explicitly labels those activities as foundational checkpoints and offers Unit 03 as an ungraded next step.

The AND-gate Research Desk importer is not broadened: Unit 03 JSON remains a separately documented simulator record and is not falsely described as supported by the importer. No new backend, credentials, API, D1/R2, signup, paid GPU access, or production route.

The eight-unit syllabus remains a draft; three lessons have introductory previews, five units are planned.

## Grounding
- MIT OpenCourseWare, Computation Structures (6.004): https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/
- Nand2Tetris, Project 02: Boolean Arithmetic: https://www.nand2tetris.org/project02

## Required acceptance
- `node --check apps/anevum-institute-preview/worker.mjs`
- `node --check apps/anevum-institute-preview/half-adder-lesson.mjs`
- `node --test tests/anevum-institute-preview.test.mjs`
- `node scripts/ops/verify-anevum-institute-preview-browser.mjs`
- Review CI screenshots at 320, 390, 768, 1024 and 1440 pixels.
- Protected hosted origin/iPhone Safari/qualified editorial review remain independent gates.

No production deployment, DNS, Access policy or permission modification is authorized by this document.
