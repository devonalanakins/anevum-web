# ANEVUM cinematic Living Laboratory — isolated source review

Session: `ANEVUM.WEB.BUILD.2026-11-13.002.CINEMATIC-LABORATORY-PREVIEW`

**Status:** Owner's cinematic direction is LOCKED and an isolated implementation review is in source. **Actual cinematic video masters remain unproduced, unapproved and unintegrated.** This PR is not a production release.

## What is implemented

- `apps/anevum-public-studio/review/cinematic-laboratory.html`: self-contained HTML/CSS/JS concept implementation, separate from the live Worker route table. Uses the established public `/original-works/assets/` poster paths and navigation to the real Experiments, Research and Archive destinations; Experiences is a same-page editorial anchor until real experiences are offered.
- One video-capable hero and four independent video-capable destination scenes. All `data-video-ready` values are **false** until actual art-directed videos exist and pass QA.
- Mobile/desktop responsive composition, meaningful HTML links and landmark semantics, keyboard-visible skip link, reduced-motion/static poster mode, Save-Data handling when exposed by the browser, hidden-page/offscreen pausing, and a maximum two-video decode budget. A low-motion CSS atmosphere is preliminary, **not a replacement for real motion media**.
- `tests/anevum-cinematic-preview.test.mjs`: static source tests for media gating, accessible structure, public boundary preservation and motion handling.

## Known gaps

1. Source-grade text-free, video-friendly laboratory plate faithful to owner's screenshot; unique plates for the galaxy, computational terrain, garden and archive.
2. Real coherent seamless 8–12s hero and four distinct 4–8s 4K-master motion scenes, encoded to optimized desktop/mobile WebM/MP4 with independent, responsive posters.
3. Media allowance/delivery integration with existing `anevum-original-works-public` Worker without broadening routes, scopes or bindings; actual media loading, Safari decode, network and pause tests.
4. Fidelity comparisons against the owner's screenshot and real moving desktop/phone acceptance, including font, composition, transition smoothness and multiple video frames.
5. Baseline public integration, exact Worker regression tests, noindex and original-works preservation, cross-browser mobile acceptance, release rollback check.

Do not enable video attributes merely to make UI tests pass; enabling requires valid local assets and actual decodability/playback evidence. Do not use Ken Burns-only loops as a substitute for requested animation or silently fetch third-party videos.

## Local validation of current independent prototype (2026-11-13)

The downloadable local design review package (shared with owner in conversation) was rendered in Chromium at **320x700, 390x844, 1440x900, 1920x1080**; all five locally supplied poster images loaded, zero horizontal overflow, zero JS page exceptions, four destinations present, and no video source requests. Reduced-motion returned static mode. The package uses temporary, darkened crops of the owner's supplied concept for layout review; these are **not** the same as the repository's current image assets and are not final production artwork.

Source-contract check: `node --test tests/anevum-cinematic-preview.test.mjs`.

**Release boundary:** The preview file is not imported by the Worker and does not alter `anevum.com/`, `/original-works*`, `/member`, `/staff`, API, Cloudflare or database services. The existing PR #812 release continues unchanged. Production deployment requires independent owner approval of the actual moving experience and full release gates.