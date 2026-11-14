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
- Five review-only compressed WebP poster fixtures are now versioned under `apps/anevum-public-studio/review/assets/`, derived by temporary darkening/cropping of the owner's 1536×864 concept. The exact branch HTML references these relative assets for reproducible review. The visible concept screenshot contains baked interface elements; masking is imperfect. These posters **must not be promoted as textless production art**, do not establish approved 4K masters and are not the pre-existing live site images.
- No authenticated application changes, real media master approvals, Cloudflare deployment, release or live QA are claimed.

Next build slice: author production-quality, textless hero motion and poster, register it behind a preview-only gate, independently inspect moving desktop/mobile behavior, then repeat for the four destinations.


## V9 text-free Observatory film candidate — November 13, 2026

Session: ANEVUM.WEB.BUILD.2026-11-13.011.TEXT-FREE-OBSERVATORY-HERO.

**ARTWORK CREATED, LOCAL-REVIEW ONLY:** A new original 1672×941 pixel text-free Observatory plate was generated. Relative to the temporary baked-UI screenshot, this is a source illustration suitable for real DOM overlays and responsive crops. The composition preserves the monumental orb/armillary, mountain windows, copper/indigo lighting, stone/glass hall and reflections. The source plate is not a native 4K frame and has not been accepted as a final cinematic master.

**FIRST REAL ENCODED HERO CANDIDATE:** Deterministic offline Python/OpenCV + FFmpeg source renders independent illumination on existing copper rings, seeded small motes, subtle fog and floor reflections, without morphing the underlying architecture. It deliberately does **not** demonstrate a physically rotating 3D armillary; genuine 3D/cinematic 4K footage remains an open visual acceptance requirement. Review derivatives: desktop 1600×900 and phone 720×1126; 6 seconds at 24 fps, no audio, H.264 MP4 and VP9 WebM, distinct desktop/phone WebP posters. The phone movie is a reframed source crop, not separate 3D scene photography. This remains a candidate, not approved production footage.

**INDEPENDENT LOCAL EVIDENCE:** ffprobe reported 6s video-only H.264/VP9 at both resolutions, and OpenCV successfully decoded 144 frames for all four files. Exact procedural source phase loop closure was verified; encoded first-to-last-frame differences were measured as low but not strictly zero. Self-contained Chromium offline review with explicitly local inlined media selected actual 1600×900 playback at 1440 and 1920 px viewport widths, and 720×1126 at 390 and 320 px. Playback position advanced, decoder readyState was 4, no page JS exceptions, no horizontal overflow, and no external HTTP requests. Reduced-motion yielded static poster, paused movie, and hidden procedural canvas. Native iPhone Safari and genuine production route loads remain **unverified**.

**SOURCE CHANGE:** PR #813 updates preview-only orbital movie handoff so a playing video suppresses the overlaid procedural ring, restores it when the movie pauses/errors, and allows bounded poster-specific orb center/radius calibration without changing the default design. Regression tests enforce this handoff; all five committed video-ready=false flags remain off and the public Worker is unchanged. The V9 image, media, test logs, renderer source and offline single-file HTML are conversation review artifacts; **their binary content was not silently committed or published** to GitHub, R2 or production.

**Next acceptance gates:** Owner compares the moving Observatory and mobile text/orb framing; re-render coherent physical armillary motion with source-grade masters as warranted; commit reviewed and legally clear media to an allowlisted hosting pipeline; run real Safari/Chromium playback, media failure fallback and performance checks; keep no merge/deploy until all required acceptance and rollback gates pass.


## V10 rigid three-dimensional armillary study — November 13, 2026

Session: ANEVUM.WEB.BUILD.2026-11-13.012.ARMILLARY-3D-ROTATION.

**New original offline review media, not deployed:** A clean, textless, static 1672x941 Observatory plate with the central space empty was used as a backdrop for a new original Python/OpenCV/NumPy geometric 3D armillary. Three rings have physical XYZ centerlines and rigid 3D rotation matrices, coherent perspective projection, changing depth/occlusion relative to a shaded procedurally textured orb, metallic copper highlight bands and a subtle light reflection on the floor. Depth compositing is painter-group approximate; this is a true rotating **geometric model** but not a photoreal PBR 3D mesh render, actual 4K master, final physically-correct material treatment, or an original independently photographed portrait scene.

**Video artifacts are review-only conversation downloads, not GitHub production binaries:** 6s at 24 fps; desktop 1600x900 MP4 (H.264) + WebM (VP9), cropped portrait 720x1126 MP4 + WebM; text-free posters, four-pose visual contact sheet, complete offline single-file HTML review, Python source, metadata, codec QA and compressed GIF. Owner review package: ANEVUM_V10_3D_Armillary_Review_2026-11-13.zip.

**Observed verification:** Exact source function frame at phase 0 equals at 2*pi, with maximum world-coordinate endpoint error below 1e-12 and visible nonzero 3D displacement at quarter phase. ffprobe and independent OpenCV decoded all four derivatives at **144 frames each**. Source first/loop-end frame equality passed. Encoded first-last frame seam MAE/median ordinary adjacent-frame ratio: 1.337 desktop MP4, 1.198 desktop VP9, 1.316 mobile MP4, 1.251 mobile VP9; temporal QA beyond these metrics is still needed. Chromium actually played both desktop codecs as isolated video controls and displayed the integrated scene at 320x700 and 390x844 from an in-memory offline media test without external HTTP traffic or JS errors; 390px reduced-motion rendered a static poster with hidden ring canvas. A 1440px screenshot was produced, but the combined desktop end-to-end test timed out; **do not assert complete desktop integration QA**. Native WebKit/iPhone Safari is unavailable/unverified.

**Source review-only runtime improvement:** PR #813 adjusts existing in-browser procedural ringCoordinate from small orientation oscillations to full periodic physical 3D yaw rotation; rings have integer winding speeds and a source contract test verifies changed XYZ depth and seamless 2*pi pose. All five committed video-ready=false flags remain unchanged. The rendered V10 binaries and source Python are in the owner review archive; they have not been silently uploaded to Cloudflare, R2, main or the public worker.

**Status:** RELEASE NO GO. The visual acceptance target is still the monumental cinematic concept. Needed: high-quality physically based and source-grade orbital mechanics, true portrait art direction rather than cropping, reviewed image licensing and provenance, same-origin delivery allowlist, native Safari/motion QA, owner moving-preview approval and existing route/security/rollback gates.
