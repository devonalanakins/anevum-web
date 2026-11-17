# ANEVUM — THE LIVING ATLAS / AAA Design Review

Session: ANEVUM.WEB.BUILD.2026-11-15.001.BONSAI-LIVING-ARCHIVE
Design iteration: November 16, 2026
Owner: Devon Alan Akins

## Purpose

High-fidelity, cinematic HTML-first prototype of the public ANEVUM bonsai and penjing collection. The site is complete as a **reviewable concept experience**. It is **not** the production site, final photography, or approved release. Existing protected ANEVUM Command, member, original-works and API routes are outside this prototype and must be preserved.

## Open it

- For the simplest self-contained review, open the separate `ANEVUM-Living-Atlas-Interactive-Review.html` file in a modern browser. It includes all assets and 14 navigable views using local hash routes; no installation or network connection needed.
- For the clean static multi-page site, open `index.html`. Links are ordinary relative `.html` files and work offline. You may alternatively run `python3 -m http.server 8900` from the directory and visit `http://localhost:8900`.

## Story architecture

- `/`: Cinematic arrival, the five-tree collection, method, Chronicle, Atelier and Journal.
- `/collection`: Five actual seed-grown `Acer rubrum` record entries, plus a separate provisional acorn note.
- `/collection/tree-01` through `/collection/tree-05`: Distinct records, photography provenance, metadata, and five-way navigation.
- `/chronicle`: Recorded timeline with functional observed/planned/completed filters.
- `/atelier`: Tree 01 root-over-rock study with three functional, distinctly drawn hypothetical stone/root compositions.
- `/journal` and `/journal/time-is-the-medium`: Journal index and inaugural editorial draft.
- `/practice`, `/about`: Philosophy, practice, family collection and long-term observation.
- `/field-notes/acorn-01`: A transplanted family acorn as a **provisional** field observation, never a sixth established maple.

## Content integrity

Only five actual red maples are established. They were grown from seed in 2026. Tree 01 root-over-rock is a future design direction, not a completed intervention. **All plant imagery in this preview is AI-generated illustrative atmosphere and is not documentation of those five specimens.** The candidate stones and drawn root trajectories are likewise illustrative. The acorn species and survival are unverified.

Media provenance is retained in `media/PROVENANCE.json`. Actual specimen photographs are deliberately absent. On publication, replace concept derivatives via the media manifest, preserve original camera metadata privately, and use public crops with location metadata removed. Never repurpose concept art as growth evidence.

## Design system

Dark Pine `#0B1710`, Canopy `#12231A`, Mineral Olive `#27372A`, Warm Bone `#F2ECDD`, Muted Copper `#B47D58`, Honey `#D5AC75`. Native editorial serif and restrained sans. Image-first staging, museum-like asymmetry, high-contrast native HTML, captioned illustrations, warm paper chapter interludes, subtle motion with reduced-motion fallback, accessible semantic links and controls.

## Code

`build_site.py` generates 14 static HTML pages. `assets/site.css` contains the responsive editorial system; `assets/site.js` provides optional Atelier and Chronicle interactions. `scripts/standalone_bundle.py` builds the single-file 14-view offline review. `scripts/static_qa.py` checks pages, routes, assets, links, species and provenance. For source regeneration, run `python build_site.py` then `python scripts/static_qa.py`.

## Verification

- Static QA executed: **14 routes, 322 links, 6 optimized visual derivatives, JavaScript syntax, semantic landmark checks and provenance assertions passed**.
- Browser test runner is included, but Chromium in this execution environment returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` for local URLs and files. Therefore **no real browser responsive acceptance** was claimed for this new static review. Existing PR #815 browser verification applies to the preceding public Worker, not this design revision.
- Native iPhone Safari, WebKit, Core Web Vitals and full accessibility audit remain unverified.

## Production integration

The single-file review can be hosted on the isolated preview Worker for review without touching the apex. It is intentionally media-inline for portability. **Production should instead serve versioned `.webp` responsive images independently from same-origin static assets, not ship the entire inline review payload on every page.** Before production: review owner photographs and provenance, optimize image derivatives, run Chromium and WebKit responsive QA, keyboard and WCAG checks, inspect LCP/INP/CLS and verify protected Worker route precedence and rollback. No publication without owner acceptance.
