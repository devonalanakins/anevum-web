# ANEVUM — Living Laboratory cinematic production contract

Session: `ANEVUM.WEB.DESIGN.2026-11-13.002.CINEMATIC-LABORATORY-PRODUCTION`
Date: 2026-11-13
Status: OWNER DIRECTION LOCKED · IMPLEMENTATION IN PROGRESS · NOT VISUALLY ACCEPTED · NOT DEPLOYED

## Authority and source

The owner-approved reference is the monumental stone-and-glass laboratory concept supplied in the November 13 discussion: panoramic dusk mountains, a suspended illuminated armillary orb, expansive architectural portal, copper and deep-blue reflected light, real-world material fidelity, clean uppercase ANEVUM wordmark, accessible native controls, and four independent animated destinations. Owner asked to proceed with full development.

The isolated implementation candidate is `apps/anevum-public-studio/review/cinematic-laboratory.html`. This is a **review artifact**, not a replacement for the production homepage. Current live baseline remains the static release from PR #812. Its public Worker, existing `/` and `/original-works*` routes, all legacy editorial routes, noindex controls, and unrelated staff/member/API Workers must remain unchanged.

## Target composition

- One panoramic, image-first observatory. The orbital apparatus and surrounding architecture must retain stable geometry from frame to frame.
- Native DOM-based hero wordmark, tagline, short intro, CTAs, navigation, tab focus and mobile menu, never flattened into footage.
- Destinations: Experiments = spiral galaxy and experimental engineering; Research = blue glowing computational terrain; Experiences = verdant ancient arch and immersive worlds; Archive = warm illuminated books and preserved works.
- One consistent art direction; do not substitute generic SaaS cards, unrelated stock imagery, fabricated research results, or the legacy creative platform's membership features.

## Motion asset acceptance

| Scene | Proposed files | Master duration | Motion acceptance |
| --- | --- | --- | --- |
| Hero desktop | `hero-desktop.webm`, `hero-desktop.mp4` | 8–12s | Subtle armillary motion, volumetric light, clouds/reflections; seamless, stable architecture |
| Hero phone | `hero-mobile.webm`, `hero-mobile.mp4` | 8–12s | Separately framed portrait composition, central apparatus and copy safe zone |
| Experiments | `experiments.webm`, `experiments.mp4` | 4–8s | True galactic rotation and particle depth |
| Research | `research.webm`, `research.mp4` | 4–8s | Stable computational terrain with genuinely flowing structures |
| Experiences | `experiences.webm`, `experiences.mp4` | 4–8s | Atmospheric ruins, movement in fog and foliage |
| Archive | `archive.webm`, `archive.mp4` | 4–8s | Stable library/book geometry, nuanced light and particles |

All media must be textless, muted, self-hosted, reviewed at multiple temporal frames, correctly licensed, and accompanied by distinct high-resolution posters. 4K quality refers to production masters, not forcing 4K playback on phones. Set exact bitrates, resolutions and LCP budget only after measurement. No dummy MP4s, morphing objects, obvious loop seams, aliasing or frame drops may be labeled accepted.

## Runtime contract

- Each `data-scene` is registered with an optional video manifest and stable poster. `data-video-ready="false"` MUST remain until actual approved footage and image content are present at tested, same-origin URLs.
- A bounded viewport-based controller initializes eligible video sources only when visible. Target maximum simultaneous video decodes: two. Hide/pause on page visibility change, reduced-motion, or Save-Data.
- Native anchors and site copy must remain functional with JavaScript disabled, all media absent, or unsupported codecs.
- Keep valid desktop and mobile navigation; 44px+ touch areas where appropriate; keyboard focus and forced-colors fallbacks.
- Frame-extracted scroll scrubbing is OPTIONAL and must be introduced only after measurable scene benefit and interaction/accessibility acceptance. A moving poster alone is not the approved cinematic-media deliverable.
- A source with no production-approved motion media may demonstrate **interface and lighting only**, never claim completion of cinematic animation.

## Release gates

1. Verify media provenance, original frame fidelity, continuity, seam, compression and responsive framing. Obtain owner approval after inspecting actual moving 1440px and 390px browser previews.
2. Add approved media to a separate explicit same-origin allowlist or asset pipeline. No automatic publication of unreviewed files or uncontrolled media prefixes.
3. Exercise motion playback in Chromium and WebKit/Safari as available, mobile touch, reduced motion and Save-Data, keyboard, contrast, fallback network errors, performance and layout stability.
4. Adapt existing exact-homepage/worker security tests only after visual approval. Keep routes and authenticated tenant boundaries unchanged.
5. Perform CI, bundle, deployment preflight and rollback comparison. No production deployment without required gates.

## Evidence to date

- Isolated review HTML with living interface, desktop/mobile layout, five poster placeholders and optional source manifest; source intentionally ships with `data-video-ready="false"`.
- Local source injected into Chromium through `set_content`; four viewport captures (320, 390, 1440, 1920) had no horizontal overflow, no page errors, and all poster fixtures decoded. Reduced-motion state was observed as `still`. This did not test actual video playback or production Worker integration.
- Local screenshot fixtures were temporary darkened/cropped derivatives of the owner's 1536×864 concept for art-direction comparison. They do not establish approved 4K masters and are not the pre-existing live site images.
- No authenticated application changes, real media master approvals, Cloudflare deployment, release or live QA are claimed.

Next build slice: author production-quality, textless hero motion and poster, register it behind a preview-only gate, independently inspect moving desktop/mobile behavior, then repeat for the four destinations.
