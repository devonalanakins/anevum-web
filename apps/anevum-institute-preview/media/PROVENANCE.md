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
