# Anevum — Canonical Homepage Cutover

Session: ANEVUM.WEB.OPS.2026-11-03.027.CANONICAL-ORIGINAL-WORKS-LAUNCH

## Objective

Make the reviewed Original Works creative-studio design the **public Anevum.com homepage**, with no need for a finished revised REPLY edition or publication of private Transcosmic articles.

This is a **homepage-only routing change**. Preserve all existing member, staff, API, game, staging, and backstage routes and their existing Workers.

## Source of truth

- Repository: `devonalanakins/anevum-web`
- Static public source: `apps/anevum-public-studio/worker.mjs`
- Public Worker service: `anevum-original-works-public`
- Existing public paths: `anevum.com/original-works*`
- Existing root path: `anevum.com/`
- Previous root Worker: `anevum-profile-staff-access-v001`
- Root entry must be served directly, **not via a redirect**.
- No new D1, KV, service or environment bindings; `workers_dev` and preview URLs remain disabled.

## Required safety checks

1. Review the current Cloudflare zone route inventory and snapshot the exact existing `anevum.com/` root-to-Worker association and current public Worker deployment version. Do not modify `anevum.com/*` catch-all or any more-specific route.
2. Verify exact PR head passed existing production build, public-studio Node checks, and 35 page/viewport Chromium checks plus **canonical root at 390px and 1440px**. Cover valid `GET`/`HEAD`, non-root rejections, proper mobile nav, no horizontal overflow, no client JavaScript, noindex, and public-safe content boundaries.
3. Merge with expected-head guard. Deploy the exact merged source to **only** `anevum-original-works-public`, retaining no bindings. Verify the existing `/original-works*` pages still respond and root-ready source serves `/` in the direct Worker tests.
4. Change **only** the existing exact `anevum.com/` route to `anevum-original-works-public`; retain its existing route pattern and ID. Do not delete or replace the previous root Worker.
5. Verify live `https://anevum.com/` renders Anevum / Original Works, old software-studio title absent. Verify `/original-works/reply`, `/original-works/wiki`, `/member`, `/staff` and unaffected API route mappings.
6. If homepage fails, immediately restore the original exact-root route to `anevum-profile-staff-access-v001`; if the public Worker build itself regresses, restore the preceding deployed Worker version. Verify rollback endpoints rather than only trusting mutation responses.

## Content and discovery

- REPLY remains a work in author revision. Typographic cover is explicitly a **concept**, not an approved publication cover.
- The encyclopedia remains a public-safe status/preview page. No private canon entries, unpublished manuscripts, future retail claims, release dates or new commerce endpoints are to be exposed.
- `noindex, nofollow, noarchive` remains until **separate editorial/SEO authorization**. Publicly accessible is not equivalent to indexed. Publishing approved book or article assets and search discovery are later independent changes.
- The old `/original-works` landing path remains supported for bookmarks, but navigation home should point to `/`.
- A Cloudflare exact-root route may not match every query-string URL; inspect and verify separately after release before claiming campaign URL compatibility.

## Release status

Prepared in source as a reversible, gated change. Mark LIVE only after confirmed Worker upload, exact-root route switch and independent live smoke tests.

---

## November 12, 2026 addendum — Living Laboratory release review

This addendum records **draft PR #812**, which supersedes the proposed creative-homepage *content* in the historical runbook above. The prior exact-root cutover has already occurred. Do not repeat its root-route mutation, and do not represent this draft as a deployed release.

### Confirmed Cloudflare routing (read-only check, November 12)

| Route pattern | Existing Worker |
| --- | --- |
| `anevum.com/` | `anevum-original-works-public` |
| `anevum.com/original-works*` | `anevum-original-works-public` |
| `anevum.com/*` | `anevum-native-frame-policy-v001` |

Numerous specific member, staff, API and other routes also exist and have independent Worker owners. Any future change to the public studio **must retain** their precedence and routing. No DNS, routes, Access or Worker deployments are authorized by this addendum.

### Current draft content and URL contract

The reviewed public studio serves exactly the homepage and the following pages on routes already owned by the public Worker:

- `/` — Living Laboratory homepage.
- `/original-works/experiments` — documented project links with native categories.
- `/original-works/research` — research questions with explicit evidence limitations.
- `/original-works/archive` — navigation to the **seven preserved editorial pages**, without replacing `/original-works` or their content.

The home and new editorial pages use the approved local image-backed style; all reviewed source media is same-origin and allowlisted. The content is deliberately `noindex, nofollow, noarchive` until a **separate editorial/SEO approval**. Do not remove the crawl controls as an accidental consequence of launch.

Clean paths (`/experiments`, `/research`, `/archive`) are **not** part of the present PR or deployment. The catch-all Worker owns them today. They require a separate collision/route-ownership inventory, a carefully reviewed targeted route or redirect proposal, explicit owner authorization, and post-change checks. Do not extend the public Worker to the global `/*` catch-all, and do not silently redirect existing private or legacy application paths.

### Release acceptance gates for PR #812

1. Confirm the exact PR head SHA and **both** repository workflows pass. Specifically require static Worker route/method/host/content-security tests, internal-link and fragment validation, keyboard/landmark focus checks, responsiveness at phone/tablet/desktop widths, original editorial preservation, and asset decoding.
2. Independently review the current full-page desktop/mobile screenshots and obtain owner acceptance of the visual/copy experience. The artwork is illustrative; it is not a screenshot of a working scientific result or a publication-cover promise.
3. Reconcile the identical historical `vesper-legacy` pinned schema fix in PR #811 without dropping its branch/commit/blob checks. Keep any protected application preview gates intact.
4. Inventory the current `anevum-original-works-public` deployed version and route ownership **immediately before** the controlled release. Record a verified previous Worker version/rollback target. Do not change `anevum.com/` route mapping; it already points to the public Worker.
5. Merge only after appropriate explicit publication authorization. Deploy the exact approved merged source to the existing public Worker **with no added bindings or unreviewed routes**. Stop on changed route owners or unexpected Worker configuration.
6. Verify the *live* homepage, Experiments (including filter links), Research, Archive, all seven historical editorial routes, public asset content types, unsupported-method rejection, and unaffected member/staff/API owners. Check actual browser behavior and logs before marking LIVE.
7. If a regression is observed, restore the previous verified Worker version using the established rollback procedure; confirm restored live behavior. Never roll back private Workers to fix a public-page bug.

### Read-only routing and rollback preflight — November 12, 2026

Observed through the live Cloudflare API; this is a dated snapshot, not permission to change routing. The anevum.com zone is active with 47 Worker route patterns. The exact root pattern `anevum.com/` and `anevum.com/original-works*` both point to `anevum-original-works-public`. The catch-all `anevum.com/*` remains assigned to `anevum-native-frame-policy-v001`.

No separate route currently owns `/experiments`, `/research`, or `/archive` for the public studio. Those clean paths must not be advertised as working. Do not widen or replace the catch-all as a shortcut. The existing `/original-works/experiments`, `/original-works/research`, and `/original-works/archive` routes remain the reviewed public URLs.

Cloudflare reports the latest deployment of `anevum-original-works-public` as deployment `2aa3aee2-436c-4339-bc66-f75ab39951b8` (November 4, 2026), serving **100% Worker version 5** (`e041ca80-646f-4f39-b3a3-5145b508ed72`). Version 4 (`dec5586e-ab40-42a8-8ad6-8911dec8e925`) is a historical rollback **candidate**, not a tested restoration. Re-read routes and deployments immediately before any authorized release; stop on route-owner or deployed-version drift.

Clean aliases require a separate exact-route ownership proposal, associated Worker handler behavior, negative path tests, owner approval, and post-change verification. No Cloudflare mutation is part of PR #812.

### Click-through journey acceptance

The isolated Chromium suite must follow real anchor clicks from Home to Experiments (including Interactive and All filters), then Research, Archive, preserved REPLY, and back to the Living Laboratory. It must also verify Experiences/Contact fragments and a mobile Archive menu link. This complements static URL checks and does not require external browser services.
Current status: **DRAFT / UNMERGED / UNDEPLOYED / RELEASE_NO_GO**. Passing CI is a source-level acceptance checkpoint, not permission to publish.
