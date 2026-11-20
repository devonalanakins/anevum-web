# ANEVUM Open Institute — CFP-101 Unit 08 Source and Claim Preflight

Session: `ANEVUM.WEB.QA.2026-11-18.023.CFP-101-U08-EDITORIAL-PREFLIGHT`  
Repository: `devonalanakins/anevum-web`  
Owning PR: https://github.com/devonalanakins/anevum-web/pull/816  
Date: November 18, 2026 (Eastern Time)  
Disposition: **TECHNICAL EDITORIAL PREFLIGHT ONLY — RELEASE NO-GO**

## Audit scope and claim boundaries

This preflight examines Unit 08's on-page reading references, teaching-computer provenance, and the sample-only knowledge check. It is not an external pedagogical review, accreditation judgment, original-content rights opinion, browser acceptance on a physical iPhone, or endorsement by any referenced educator.

### Observed issue — medium — worked-example versus custom-program self-check

- Location: `apps/anevum-institute-preview/cpu-capstone-ui.mjs` and `cpu-capstone-client.mjs`.
- Earlier behavior: the self-check asked about RAM[2] "after the sample halts" and marked 0B correct even after the user compiled, loaded and ran a different program. Correctness applied only to the fixed example, not the current CPU.
- Remediation: explicitly identify the six-byte addition example, provide a persistent sample-only scope note and screen-reader description, and describe the feedback as correct for that example. Do not present quiz answers as custom-program assessment. No execution state or export semantics change.
- Regression evidence: exact-head route/content checks, Chromium and WebKit custom-program-before-quiz checks. **Actual CI result must be recorded in PR after completion.**

### Primary-source cross-check

| External resource | Checked claim | Independent finding | Source |
| --- | --- | --- | --- |
| Nand2Tetris, official Project 05 | Constructs the Hack CPU/computer and executes Hack machine-language programs | Official course material; **not** this lesson's fictional 8-bit ISA | https://www.nand2tetris.org/project05 |
| MIT OpenCourseWare 6.004, Spring 2009 | Develops digital systems from transistors through computers; includes design of a processor | Official MIT course archive; **not** this lesson's fictional 8-bit ISA | https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/ |
| MIT OCW 6.004 course resources | Includes instruction-set and Beta-focused materials | Useful comparator only, not validation or affiliation | https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/resources/lecture-notes/ |

The two existing outbound links are genuine official learning references, not sources of the design of ANEVUM's independent teaching ISA. Lesson text must avoid suggesting either course validates, evaluates, awards credit for, or endorses Unit 08.

### Remaining checks — not claimed complete

- [ ] Independent qualified educational/editorial review of **all eight** lessons and exercises; verify learning objectives and assessment appropriateness
- [ ] Appropriate human review for brand/source/rights statements, attribution and affiliation boundaries
- [ ] Owner-authenticated **physical iPhone Safari** review with VoiceOver, keyboard focus, zoom, reduced motion and screenshot evidence; the Linux WebKit CI runner is not a substitute
- [ ] Explicit authorized release routing, rollback rehearsal and source-to-deployment verification before any public launch

**Release gate:** PR #816 remains draft, protected, unmerged; no modification of Cloudflare Access, DNS, production worker, authentication, credentials or saved clinical data.
