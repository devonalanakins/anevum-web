# ANEVUM — Learning Platforms and Member Experience Research

Canonical session: `ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION`  
Research checkpoint: 2026-11-17 (official vendor and project documentation consulted)  
Status: **RESEARCHED DESIGN INPUT**, not an approved product release or a claim of completed functionality.

## Product thesis

Build a continuing-education and open-research society with two complementary modes:

1. **Discovery / community**: original cinematic scientific architecture, accessible free education, optional profiles, original authored submissions, and evidence-linked reputation.
2. **Working / learning**: an academically rigorous, distraction-free LMS workflow with a course home, syllabus, modules, learning objectives, exercises, notes, assessment feedback, progress, and reproducibility notebooks.

A new user can read and run a meaningful lesson without registering. An account is an enhancement for syncing private progress and optionally publishing an independently reviewed body of work. **Never conflate browser-local self-reported completion with peer review or a credential.**

## Comparative review (official primary sources)

| Platform | Distinct capability | ANEVUM transfer | Avoid |
|---|---|---|---|
| **Canvas / UCF Webcourses** | Course dashboard, task list, modules, assignments, submission feedback, rubrics, communication, mobile access | Course-centric workspace with a focused next step; clear course content lifecycle; assignments whose feedback is inspectable | Opaque institutional menus, mandatory term-based deadlines for self-study, fake gradebook |
| **Open edX** | Open-source LMS + Studio authoring, course/progress dashboard, assessments, discussion and skills metadata | Versioned course authoring separate from learner UI; exportable enrollment/progress model | Large platform replacement before verified requirements |
| **Moodle** | Competency frameworks, learning plans, peer/self assessment, badge governance | Explicit competency evidence and review criteria; staged recognition | Automatic badge inflation |
| **Brightspace** | Portfolio of work with reflection and learning outcomes | Projects and methodology linked to course outcomes; private evidence first | Fake institutional transcript |
| **Brilliant** | Practice-first interactive concepts, feedback and guided paths | Prediction → action → observation → explanation → self-assessment | Engagement optimized for streaks rather than depth |
| **Khan Academy** | Skill/mastery progress and learner queue | Readable next-actions and differentiated practice status | Treating points as proof of mastery |
| **Newgrounds** | Free distinctive creator profiles, user pages, original submissions, following, reviews and medals | Memorable member identity and creator-owned artifact collections, contextual review; creative community culture | Popularity/vote rank mistaken for scientific correctness |
| **MIT OCW** | Free no-signup coursework across disciplines without credit issuance | Unrestricted lessons, clear syllabus, references and source licensing | Invented credentials or access barriers |
| **The Odin Project** | Public no-signup curated lessons, optional progress account, genuinely portfolio-worthy projects | Projects and original builds as primary evidence, contributor pathways and open-source governance | Importing third-party curriculum without a license |
| **Coursera / commercial MOOCs** | Polished course discovery, certificates, professional specialization | Discoverable learning objectives, guided study pathways | Monetized learning gates or fabricated certification |

### Primary source links

- UCF Webcourses is Canvas: https://fctl.ucf.edu/technology/webcourses-tips-guides-tutorials/
- UCF student tour and dashboard: https://cdl.ucf.edu/support/student/knights-online/using-webcoursesucf/
- Canvas dashboard: https://community.instructure.com/en/instructure/kb/articles/664620
- Canvas student role permissions: https://community.instructure.com/en/instructure/kb/articles/662733-what-is-the-student-role
- Canvas Student ePortfolios *legacy retirement scheduled 2026-12-30*: https://community.instructure.com/en/instructure/kb/canvas-student-pathways-eportfolios-eportoflios-guide
- Open edX platform: https://openedx.org/platform/
- Open edX architecture: https://docs.openedx.org/en/latest/developers/references/developer_guide/architecture.html
- Moodle feature tour: https://docs.moodle.org/501/en/Features_tour
- Brightspace learning portfolio: https://community.d2l.com/brightspace/kb/articles/5496-about-portfolio
- Brilliant guided learning paths: https://brilliant.org/help/features/what-are-learning-paths/
- Khan Academy student dashboard: https://support.khanacademy.org/hc/en-us/articles/46935588089997-How-do-I-use-the-student-dashboard-in-Khan-Academy
- Newgrounds account/user page: https://www.newgrounds.com/wiki/help-information/user-accounts
- Newgrounds medal behavior: https://www.newgrounds.com/wiki/help-information/user-accounts/medals
- MIT OpenCourseWare no-signup model: https://ocw.mit.edu/pages/get-started/
- The Odin Project no-signup and portfolios: https://www.theodinproject.com/faq

This comparison is of interaction patterns. It is **not** authorization to copy source code, copyrighted artwork, trademarks, course content, or existing institutional branding. License and originality reviews remain separately required.

## Concrete information architecture

Public: **Society / Academy / Course / Lesson / Laboratory / Research Observatory / Commons / Archive**. Private member: **My Studio** (course progress, next action, bookmarked work, notebook, drafts) and **Member Dossier** (editable profile, contributions, portfolio and evidence provenance). The profile becomes publicly discoverable **only after authenticated consent and reviewed privacy/moderation design**.

**Learning Course UI** inspired by Canvas, but original:
- Course home: purpose, prerequisites, version, objectives, outline, progress and exact availability.
- Lesson: structured prose, linked source, testable figure, assessment feedback, notes, bookmarks, next lesson.
- Lab: named model and assumptions, predictions, parameters, deterministic results, JSON export.
- Assessment: distinguish personal practice, graded course exercise, independently reviewed claim.
- Working mode: mobile reading-first, no hero video distraction, free without account.
- Progress cannot represent unpublished units as completed; never advertise CFP-101 completion before full editorial review.

**Member identity** inspired by Newgrounds' expressive ownership, but grounded:
- **Private Studio**: display name/handle draft, subject interests, working course and upcoming action. Course progress stays private by default.
- **Member Dossier**: creator-like nameplate, optional bio, authored projects, experimental notebooks, methods, accessible work history, and verified attribution once an account backend exists.
- **Four provenance statuses**: personal practice; documented artifact; independently reviewed; independently reproduced. Each status requires different evidence and none is automatically issued from local activity flags.
- No purchasable reputation, pay-to-win rewards, institutional titles, grades or verified claims generated by a local UI.
- Public publishing and member-to-member interactions require adult-only account controls, moderation, abuse response, versioned consent, and attribution.

## Existing ANEVUM engineering boundary

The canonical repository already contains Better Auth and ANEVUM membership pages under `src/member/` and `src/server/member.mjs`, historically implemented for a **different, RHEN-focused member/Command domain**. Its account authorization and D1 schema must be reviewed before any educational write; **do not create a second Better Auth tenant or reuse financial/reward entitlements as learning achievements**.

The independent `apps/anevum-institute-preview/` Worker intentionally has **no auth, network, API or production DB**. It has verified browser-local CFP-101 assessment flags, per-lesson notes/bookmarks and an unsigned, locally saved evidence draft. A first bounded UI slice can build a genuinely working browser-local Studio and editable private Profile **reusing these exact records**, while refusing public profile URLs, issued awards or server claims.

The second slice requires a separate identity/data design and review: bind the new learning tables to canonical ANEVUM member IDs with separate least-privilege authorization, consent and revision rules; encrypted backups; private learner records; export/deletion; and approval for any production migration. This architectural decision is **proposed**, not implemented merely by presenting a browser-local profile.

## Core acceptance journeys

1. Open first course, read, and run a lab without signup.
2. Visit My Studio; see only real completion checks and only currently published learning opportunities.
3. Bookmark a lesson and return; bookmark survives and points to the correct route.
4. Customize a *local preview* identity. Reload and verify saved fields. Export, re-import and delete without changing notes or progress.
5. Create an actual Research Desk evidence draft; show its title/status as private, unreviewed work, not an award.
6. Try malformed or forged profile payload: reject without persistent mutation or XSS.
7. No public member profile or cross-member leakage without real session-bound identity.
8. Native iPhone/desktop reading UX, 320px minimum layout, keyboard, reduced motion and no horizontal overflow.

## Decision for this implementation window

Develop one coherent **My Studio + Member Dossier** vertical slice within the existing isolated Worker, backed only by validated local draft data and real progress keys. The work must be tested in Chromium and unambiguously labeled *private device-only preview*. It must not claim to implement live member accounts, public submissions, grades or verified awards.

Owner approval and a subsequent identity-security review are required for migrating it into a public, authenticated community.
