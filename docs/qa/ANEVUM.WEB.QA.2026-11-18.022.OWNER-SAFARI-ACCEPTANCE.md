# ANEVUM — Owner iPhone Safari Acceptance

Session: `ANEVUM.WEB.QA.2026-11-18.022.OWNER-SAFARI-ACCEPTANCE`  
Owning repository: `devonalanakins/anevum-web`  
Owning PR: [#816](https://github.com/devonalanakins/anevum-web/pull/816)  
State: **OWNER ACTION PENDING / PROTECTED PREVIEW ONLY / RELEASE NO-GO**

## Intended product, not merely an illustration

ANEVUM Open Institute is an **independent, non-accredited educational preview**, not a university, staffed research facility, clinical evaluation service, verified academic program or physical GPU cluster.

Current working scope: 19 routes, CFP-101 introductory lessons U01–U08, ideal AND logic, ideal half-adder, simulated GPU scheduling and leaky integrate-and-fire neuron, local note/bookmark and personal evidence-record workflows, with no recognized credentials or actual measured hardware/neural data. Unit 08 computer simulator is a browser-only introductory preview and is not graded or verified.

**Protected preview** (requires the existing owner-only Cloudflare Access login):

`https://institute-pr-816-anevum-web-nextgen.devonakins.workers.dev/institute-preview`

This URL is **not** anevum.com and is **not** a public production site. Do not change Access policy, preview visibility, worker routes, DNS, member-staging login or data to perform these checks.

## Preflight

1. On the actual iPhone, open the URL in the **Safari app**, not an embedded browser, and authenticate with the preexisting owner identity. Do not post login screenshots, tokens, one-time codes or Access cookies.
2. Confirm Safari shows the protected Institute and not a 404, a stale site, or a generic Cloudflare error. If Access denies entry, record only the generic denial and stop; never weaken the policy to obtain a pass.
3. Note device model, iOS version, Safari version (where available), calendar date, and the exact PR commit being reviewed. The source revision from CI is not sufficient evidence of the actual deployed preview version unless independently matched.
4. Use only **synthetic exercise input**. Do not enter client/patient records, private business information, financial/account details or real personal information into local notes, learner cards or research records.

## Phone acceptance: check each item, do not assume a pass

- [ ] **Institute:** Entrance renders quickly, copy is readable, mark and navigation fit the screen with no horizontal swipe, text overlap or blank sections. Motion is nonessential; zoom at 200% and inspect focus/readability.
- [ ] **Navigation:** Open the mobile menu via touch, choose Academy, Research, Recognition and Practice/Study destinations. Close the menu; verify touch targets and VoiceOver labels, and that a skipped or invalid route cannot look like the real Institute.
- [ ] **Academy:** Eight introductory CFP-101 lesson links are actionable, including Unit 08. Explore all eight available lessons; independent assessment and credentials remain unavailable.
- [ ] **Lesson 01 / 02:** Read lesson content, use an exercise and save a harmless short note; reload and verify restoration. Bookmark and remove the bookmark. Export notes to Files or Downloads, where Safari permits it.
- [ ] **Lesson 03 / Half-adder:** Visit all four A/B combinations and verify correct sum/carry results for `00`, `01`, `10`, `11`; the transfer button is disabled before full coverage and enabled only after the fourth unique combination.
- [ ] **Lesson 04 / Registers:** Set the four-bit D input (for example, 1010), confirm Q stays at 0000 until tapping Clock ↑, confirm it captures 1010, then change D again and confirm Q holds. Check reset, self-check, export labeling and local notebook persistence. Confirm this is an ideal teaching model, not measured hardware.
- [ ] **Lesson 05 / Addressed memory:** Select address 2, enter 1010 and press Write; select address 1, enter 0101 and Write. Return to address 2 and verify it still reads 1010. Test that changing input bits without pressing Write leaves storage unchanged. Inspect export labeling, self-check, reset, and note reload. The model is not physical RAM, instruction execution, or verified research.
- [ ] **Lesson 06 / Machine code and assembly:** Enter LOAD 2 and confirm 0010; enter STORE 1 and confirm 0101; enter ADD 3 and confirm 1011; enter HALT and confirm 1100. Decode 0110 as STORE 2, reject reserved 1111 and malformed input without losing the previous valid result, and confirm export labels all conversions as unverified. Check keyboard Enter, note persistence and mobile layout. This is a fictional ISA and does not execute instructions.
- [ ] **Lesson 07 / Computer systems and software:** Verify the round-robin six-turn sequence A → B → C → A → C → C. A should return to the queue after its first turn, B finish after one, and all three finish after six. Confirm the Advance button disables when complete, reset restores the original queue, JSON export says it is unverified toy scheduling data, self-check responds appropriately, and local notes survive reload. No real application, CPU or operating system is executed.
- [ ] **Lesson 08 / Eight-bit computer:** Load the default program 37 11 34 21 12 F0. Step once and confirm A=07; run to HALT and confirm six steps, A=0B, RAM[1]=07 and RAM[2]=0B. Verify Step/Run disable on HALT. Select the conditional-jump example: verify the explanation changes without altering the editor or machine, then copy it into the editor and explicitly Load. Confirm the ROM decodes JZ 3 and running halts in three steps with A=00. Edit custom bytes, attempt to copy another example, cancel the overwrite confirmation and verify no changes; accept and verify the machine is still unchanged until Load. Enter invalid hex and confirm the prior machine is unchanged. Load 40, run and confirm a 32-step cutoff instead of a hung tab. Reset, answer the self-check, export unverified JSON, and save/reload/delete synthetic Lesson 08 notes. Confirm no real hardware, grading or course credit is claimed.
- [ ] **Research Desk:** From the half-adder, tap **Review in Research Desk**. Verify the panel opens, explains ideal-model limitations, and does **not** change saved drafts before selecting **Apply**. After Apply, the result remains **unsaved** until explicit Save.
- [ ] **Persistence and export:** Save a synthetic personal evidence draft, reload, confirm its title/checksum displays, export to Files/Downloads, and validate that the exported file can be re-imported without claiming independent review. Delete the synthetic draft after this test.
- [ ] **Other laboratories:** Confirm the ideal AND-gate, simulated GPU scheduling and teaching neuron controls behave and do not claim physical measurements or clinical inference. Check any export→Research Desk paths that are presented.
- [ ] **Local Studio / Profile:** Confirm private preview labeling is accurate; the local learner card is not presented as a real authenticated member account. Delete synthetic test data as needed.
- [ ] **Phone ergonomics:** Check portrait and landscape, both system light/dark settings where relevant, keyboard/focus while a textarea is open, scroll restoration, 200% zoom, iPhone notch/safe areas and reduced-motion accessibility settings. Text must not be clipped and no horizontal content should become inaccessible.
- [ ] **Privacy boundary:** No unexpected external form submission, automatic research publication, credentials, credit award, payment or personal-data sync is implied or observed.
- [ ] **Re-entry:** Close the Safari tab and return to the protected URL. Confirm the experience still requires the configured owner Access policy and any browser-local data behaves according to Safari storage settings.

## Non-phone gates and evidence

The repo's Chromium and **Linux Playwright WebKit** suites exercise routes and simulated mobile/desktop viewports. They do **not** substitute for this physical Safari checklist, nor prove the preview's exact deployed revision. Do not mark the above items complete merely because the Actions workflows are green.

Safe evidence: exact PR SHA, run URLs, generic screenshots with dummy data, actual device/browser versions, which checklist items passed or failed, exact visible error text excluding login/session details, and verified preview build identifier if available. Avoid storing sensitive user input, secrets, cookies, personal email identities or Access policy details in issue comments.

When an item fails: record the specific interaction/path and visible outcome, file a narrowly scoped defect in PR #816, correct it on the draft branch, rerun Node/Chromium/WebKit/relevant release gates and repeat the failing iPhone step. No unapproved public rollout.

## Release decision

| Gate | Current state |
| --- | --- |
| Educational source and preview build | Implemented in PR #816; verify exact-head CI |
| Owner-only Cloudflare Access + anonymous denial | Verified by hosted-preview CI; retain exact policy |
| Chromium and Linux WebKit interaction suites | CI evidence required for final SHA |
| Actual owner-authenticated iPhone Safari walkthrough | **PENDING** |
| Academic/brand/rights/editorial claims | Independent review required before public marketing |
| V5 separate beta workers.dev availability | **BLOCKED**; unrelated to protected Institute preview |
| Production `anevum.com` route merge, DNS, Worker release | **NOT AUTHORIZED / NOT PERFORMED** |

Release remains **NO-GO** until the actual owner acceptance, source-to-preview revision confirmation and separately approved release procedure are complete. Existing public site, historical original-works/bonsai assets, Auth/Access, D1 and V5 beta must remain unchanged.
