# ANEVUM Frontier Society — isolated review imagery provenance

Status: REVIEW ONLY · NOT PRODUCTION OR OWNER-ACCEPTED FINAL BRAND ART  
Source PR: https://github.com/devonalanakins/anevum-web/pull/813  
Destination draft: https://github.com/devonalanakins/anevum-web/pull/816

Two binary WebP stills were copied **by exact Git blob identity**, without merging unrelated PR #813 files or histories. Their source is ANEVUM's November 13, 2026 cinematic Living Laboratory exploratory imagery, art-directed as an original research observatory. The source design document says the architectural reference was owner-directed, but visual acceptance of the resulting implementation was pending. Neither is a photograph of a real facility or a claim of actual university infrastructure.

| Destination | Original source path (PR #813) | Git blob SHA-1 | Image size |
| --- | --- | --- | --- |
| `observatory-review-desktop.webp` | `apps/anevum-public-studio/review/assets/hero.webp` | `af1e38f88853c67a1c98b0d6b01ff83f8f192bb5` | 1536×864 WebP |
| `observatory-review-mobile.webp` | `apps/anevum-public-studio/review/assets/hero-mobile.webp` | `408331d10e3e618ca10be55ce8e85925cafe3051` | 720×1126 WebP |

These are **interim high-definition preview assets** and not ANEVUM's final 2026-11-17 Frontier Research Society campus art. The separate original cavern stills and atmospheric MP4 developed for the newer concept remain outside the GitHub repo until secure binary ingestion/owner visual approval. None of these assets may automatically replace the root production website.

Rendering contract:
- Desktop uses the sharp desktop image; mobile uses the separately composed portrait WebP via `<picture>`
- Real semantic links, learning tools and text are never baked into the image
- WebGL1 renders only an optional transparent fog/light shader over the image (no 3D models or GPU dependency for core functionality)
- Reduced-motion, Save-Data, WebGL failure, context loss or tab visibility must degrade to usable static art
- Loopback-only test server loads files from this fixed directory, validates Git blob hashes, and injects an allowlisted binding into the isolated review Worker
- No external network requests, external CDN, or production route changes; keep artwork review/noindex restrictions until an authorized release

A final image/artwork originality, attribution, licensing and trademark check and the owner's visual signoff remain mandatory before public brand use.

## New frontier facility design candidate — supersedes orbital imagery for the active draft

Owner feedback on November 17, 2026 explicitly rejected the glowing-orb/observatory hero and its background. The earlier artwork remains preserved above as project history but is **not selected** by the active Society homepage.

A new original, high-resolution **fictional underground research facility** concept was generated for this source-level review. It depicts monumental industrial machinery, control rooms and computing infrastructure, copper/teal practical lighting, rock, steel, glass, and atmospheric depth. It is a digital art-direction metaphor, not a depiction of ANEVUM's physical facilities.

| Asset | Dimensions | File bytes | SHA-256 | Git blob |
| --- | --- | ---: | --- | --- |
| `facility-concept-v2-desktop.webp` | 1672 × 941 | 189,628 | `721c18176b5b392f6f785bbc1ffd177d2d3a293713005db174331d0ab232588a` | `75724819a8243e72c71a3ca807cdbe70d04bc2d6` |
| `facility-concept-v2-mobile.webp` | 720 × 1126 | 130,592 | `a81a7e1e6ef5ccca4a264ee24f9419eca1d1c9551c1e757097d00aad8ac3acd9` | `7991d4919788079f56f05e94a132cd46f3be5592` |

The source generated image was `a_cinematic_ultra_detailed_sci_fi_industrial_rese.png` (1672 × 941 pixels). WebP encodings and separate mobile cropping were produced without flattening any interface controls into the visual.

The active draft now uses an HTML `<picture>` element, a responsive task-first hero, a real optional WebGL atmosphere overlay, and a CSS fallback. All navigation, course, laboratory and dossier actions remain semantic markup. Small-screen text overlays are separate from the imagery.

**Approval boundary:** this design is IMPLEMENTED FOR REVIEW and subject to owner acceptance; it is not a final certified or trademark-reviewed institutional identity. Do not deploy public DNS/root routes, publish a brand change, or merge the PR without the existing release gates.
