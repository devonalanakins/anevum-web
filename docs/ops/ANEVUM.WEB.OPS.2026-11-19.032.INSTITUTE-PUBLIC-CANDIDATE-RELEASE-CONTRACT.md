# ANEVUM — Open Institute public candidate release contract

Session: `ANEVUM.WEB.OPS.2026-11-19.032.INSTITUTE-PUBLIC-CANDIDATE-RELEASE-CONTRACT`  
Owning repository: `devonalanakins/anevum-web`  
Owning PR: `#816` (draft, review-only, unmerged)  
Disposition: **SOURCE + DRY-RUN ONLY / PRODUCTION NO-GO**  
Date: November 19, 2026

## Target and scope

The current working Open Institute remains an **owner-only, Cloudflare Access-protected** design and educational preview on a separate Worker Preview host. That host and `wrangler.institute-preview.jsonc` **must not** be made public.

A new, independent, explicitly **unrouted** production candidate uses:

- `apps/anevum-institute-preview/public-candidate-adapter.mjs` — converts the existing source-controlled Institute content to a future public, namespaced experience.
- `apps/anevum-institute-preview/public-candidate-worker.mjs` — self-contained, reviewed-media, production-candidate entry point.
- `wrangler.institute-public-candidate.jsonc` — `workers_dev: false`, `preview_urls: false`, no `routes`, custom domains, D1, KV, R2, auth, secrets, vars or deployment workflows.
- `tests/anevum-institute-public-candidate.test.mjs` — route/SEO/sitemap/security/media boundary tests.
- `scripts/ops/anevum-institute-public-candidate-server.mjs` and `scripts/ops/verify-anevum-institute-public-candidate-webkit.mjs` — loopback-only real-browser checks.

**No production deployment is requested or implied by these source files.** No database or authenticated learner platform is activated.

### Exact future public namespace

Primary namespace: `https://anevum.com/institute` (not yet routed).

The candidate serves the Institute entrance, Academy, course overview, eight CFP-101 introductory lessons, Research & Methods, recognition policy, three standalone teaching laboratories, a browser-local Research Desk and browser-local Studio/Profile. Every route uses the original educational implementation, not a second rebuilt curriculum.

Indexable public informational pages have a self-canonical URL, accurate introductory/non-accredited disclosures and `index,follow` metadata. Personal device-only tools are `noindex,nofollow`, not falsely presented as server-authenticated member accounts. The generated sitemap includes only informational pages.

Static CSS/JavaScript import paths are rewritten from `/institute-preview` to `/institute`. Reviewed binary media are forwarded without alteration. Other API, member, Command, staff, archive, and non-Institute routes return 404 from this candidate Worker rather than proxying to existing services.

Only the exact `?utm_source=chatgpt.com` tracking suffix is stripped by same-origin 302 on valid existing routes; arbitrary or duplicate parameters remain rejected. This handles accidental appended attribution without weakening the owner preview or authorizing an open redirect.

### Observed Cloudflare production ownership before candidate rollout

A read-only Cloudflare API inventory on November 19, 2026 found:

| Existing route | Worker owner | Treatment |
| --- | --- | --- |
| `anevum.com/` | `anevum-original-works-public` | Preserve until separate approved homepage cutover |
| `anevum.com/original-works*` | `anevum-original-works-public` | Preserve historical portfolio and original works |
| `anevum.com/*` | `anevum-native-frame-policy-v001` | Preserve existing wildcard/guard |
| Existing specific `/staff*`, `/member*`, `/api*`, `/alpha*`, `/play/*` and other specific routes | Various existing Workers | Preserve all non-Institute ownership |

The observed `anevum-original-works-public` deployment was `e432ca25-558f-444f-b277-298f933ae489` with 100% version `460e1334-3d44-49e2-b236-350a01f99ebe`, recorded November 13, 2026. **This is a historical observed baseline, not a guarantee that it remains the active release. Re-read before launch.**

### Release implementation and immutable safety boundaries

1. **Before human approval:** Run `node --test tests/anevum-institute-public-candidate.test.mjs`, full Institute verification and Linux WebKit browser QA, plus `npx wrangler deploy --config wrangler.institute-public-candidate.jsonc --dry-run --outdir <temporary-dir>`. Never remove `--dry-run` in CI. A verified bundle or successful PR does not publish anything.
2. **Human release gates:** Owner-authenticated **physical iPhone Safari** walkthrough against a verified exact preview version (no actual user/patient data); independent qualified review for scientific/editorial correctness, accessibility/assistive technology, brand, provenance, content rights and source attribution. Outstanding marks must remain pending, not AI-certified.
3. **Release planning after signoff:** Re-read actual Cloudflare routes, Access, Worker deployment/version history, hosted preview identity and storage boundaries; record exact existing route IDs, current deployed versions and a tested rollback. Backups/source provenance must be verified. The separate V5 beta workers.dev safeguard must remain fail-closed.
4. **Future **narrow** namespace exposure:** After explicit launch authorization and the above gates, only the exact `anevum.com/institute` and `anevum.com/institute/*` patterns may be proposed for association with the isolated candidate Worker. Never substitute `anevum.com/*`, change root `anevum.com/`, modify DNS, relax Cloudflare Access, or route `/command`, `/staff`, `/member`, `/api`, `/original-works`, or a private preview endpoint to this Worker. Any actual route change must be separately verified at the provider and audited for interactions with the existing wildcard.
5. **Post-release live checks (not yet executed):** Verify real public 200s for Academy/all eight lessons, simulators, local notes, import/export, responsive pages, sitemap/canonicals and media; run 404/405/host/query/security negatives; confirm existing historical routes and protected staff/member endpoints retain their previous owner; inspect Worker errors and logs; record exact candidate deployed version, deployment ID, route IDs and public observation time.

### Rollback contract — pending rehearsal

Before any actual release, capture the **exact existing Cloudflare route inventory** and target release version. For an initial namespace-only rollout, rollback means reverting **only** the two newly approved `/institute` route bindings to their pre-release state, checking the prior Original Works homepage, archive, staff and member paths, and verifying that no new exposure remains. A previously active candidate version may also be restored if a reviewed in-place deployment was replacing it. Never delete or migrate historical data as a rollback shortcut.

Rollback **has not been rehearsed** on production and no new route IDs or deployed release ID are known. The existing Original Works Worker version recorded above is reference evidence only, not the candidate rollback version.

### Release disposition

**NOT LIVE.** PR #816 remains draft/unmerged until exact-head CI, human owner Safari, independent reviews, production-specific route/rollback approval and real post-deploy verification. Initial Institute namespace launch and future Institute-first homepage cutover are separate changes. The initial publishing gate must not be weakened to make continuous curriculum development convenient.

After launch: add courses through the versioned curriculum/module architecture; record scientific source/editorial review before each publication; maintain dependency/security CI and incident recovery; treat accounts, progress synchronization, grading and recognition as future authenticated-platform capabilities, not launch claims.
