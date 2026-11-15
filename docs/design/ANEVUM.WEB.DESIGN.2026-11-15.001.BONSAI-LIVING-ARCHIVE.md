# ANEVUM — Bonsai Living Archive design contract

Session: ANEVUM.WEB.DESIGN.2026-11-15.001.BONSAI-LIVING-ARCHIVE
Date: 2026-11-15
Status: OWNER-DIRECTED PIVOT / DESIGN REVIEW / NOT PRODUCTION

## Decision and purpose

ANEVUM and anevum.com are being reimagined as Devon's personal bonsai and penjing website: a living, photographic archive of seed-grown trees and their patient cultivation over years and generations. The previous public fictional-universe/Living Laboratory positioning is superseded as the current homepage direction, **not** deleted from source history.

Core editorial proposition: **Time is the medium.**

This should feel like an exceptionally crafted botanical museum rather than a commerce site, ordinary plant-care blog, artificial 3D model viewer, or generic template. The most important on-page task is to enter the collection and follow each real tree's evolving story.

## Grounded starting collection

- Five red maples, Acer rubrum, grown from seed in 2026.
- Tree 01 of five is Devon's first bonsai experiment.
- On November 15, 2026, Tree 01's proposed design direction became root-over-rock (ishitsuki / sekijoju design study).
- Stone selection, actual root inspection, and repotting remain future steps. Do not claim the roots have been worked, placed over stone, or photographed when they have not.
- Trees 02–05 exist but their individual formal styling and detailed media records are not established here.

Never substitute a generated mature maple for a factual photo of Devon's young tree. Generated scenic art must be labeled concept visualization.

## Public experience

1. **Arrival** — cinematic photographic hero, independent ANEVUM identity, headline “Time is the medium,” clear CTA into the real collection, native accessible text.
2. **Collection** — five tree records, each with truthful species, origin, actual status, dated media and independently evolving identity.
3. **Specimen page** — detailed photography, origin, intended vs executed design, observations, cultivation and measured changes only when documented.
4. **Chronicle** — timeline of actual cultivation events and authentic images; no invented before/after time travel.
5. **Field journal** — genuine process writing, photographic evidence, methods, uncertainties, successes and setbacks.
6. **Practice and about** — observation, deliberate intervention, stewardship, penjing/bonsai sensibility and intergenerational horizon.

Proposed routes: /, /collection, /collection/tree-01 through tree-05, /journal, /practice, /about. These are proposed public routes, not claims of a deployed router.

## Visual identity

- Dark pine #0C1711; deep canopy #14241A; mineral olive #27372A.
- Warm bone paper #F2ECDD; muted copper #A9714F; honey light #C9A673.
- Editorial serif typography with unusually large thoughtful headings, paired with legible small data labels.
- Museum-grade asymmetrical composition, text-free authentic botanical art, negative space, refined natural materials and a custom restrained branch-ring mark.
- Scroll through alternating deep-forest immersive sections and warm paper journal sections to preserve contrast and rhythm.
- No obvious AI-art artifacts, low-poly bonsai, default emoji navigation, gratuitous floating UI or fake interactive mechanics.

## Cinematic engine: image-led, not model-led

1. Capture and preserve original iPhone tree photography/video and date/source metadata.
2. Produce a text-free photographic master with authentic material detail; prepare wide and separately framed portrait variants.
3. Use short real-footage or image-to-video cinematic loops with subtle camera drift, volumetric light, physically plausible movement and seamless continuity. Do not morph botanical structure.
4. Use image-derived depth masks, composited foreground/background, gentle pointer parallax and optionally scroll-scrub sequences when they improve the actual story.
5. Keep all copy, links, controls and metadata as accessible HTML. Motion never becomes the only way to read the content.
6. Deliver responsive MP4/WebM plus WebP/AVIF poster, same-origin hosting, no accidental unreviewed media release.
7. Honor reduced motion and data saving; pause on hidden/offscreen pages and cap simultaneous decoding. Use still posters on failure.

True on-demand 3D/photogrammetry may be investigated only after adequate imagery and a fidelity/performance review. Do not expand low-poly modeling by default.

## Content integrity

Separate observed, planned and completed events at the data-model level. Every media item should have specimen association, caption, provenance (real owner photo/video vs concept), capture date when known, public-use approval and alt text. Journal entries must carry dates and category. A future 3D cinematic interpolation is illustration, not historical evidence.

Start with versioned, reviewable JSON/MDX in the existing React/TypeScript repository if it fits the established architecture. Do not introduce a CMS, public accounts, additional vendors or new private data flows merely for five trees.

## Existing systems and cutover boundaries

The owning web repository is devonalanakins/anevum-web; it includes a Cloudflare Worker, protected Command/member history, existing routes and release controls. The old cinematic preview is draft PR #813. This new bonsai design is a separate direction and must not silently merge or reinterpret PR #813.

Before any public cutover: inventory existing routes, protected identities, Worker bindings, DNS, dependencies and archives; retain a rollback path; choose an explicit preservation plan for older fiction/creative work; independently verify no protected data or applications are exposed or broken. **Do not deploy by merging a design PR.**

## Acceptance checkpoints

- Design: original, text-free art, authentic-looking lighting, unmistakable botanical subject and clear first task; owner visual review.
- Content: actual Tree 01 photos approved for public use; all five cards have honest records; no false interventions.
- Interaction: collection keyboard and touch support, coherent narrative routes, no dead navigation, accessible focus and contrast.
- Responsive: 320 / 390 / 768 / 1440 / 1920 screens, no horizontal overflow and sensible crop/typographic layout.
- Motion: inspect actual temporal frames and loop seams, mobile and desktop video, still fallback, reduced-motion, Save-Data and network failure.
- Performance: measure p75 mobile LCP, CLS and INP; aspirational goals LCP <= 2.5s, CLS <= .1, INP <= 200ms (not yet measured).
- Launch: hosted preview review, native iPhone Safari test, repository CI, protection/route check, release preflight, rollback and explicit production acceptance.

## Design study produced in originating session

An isolated one-page HTML concept was created with a generated high-resolution photographic concept plate (not Tree 01), 6-second quiet 2.5D MP4 desktop/mobile studies, interactive five-tree selector, actual timeline labels and a photo/journal narrative. Screenshots and source are conversation artifacts, not uploaded to this public repo. Chromium checks passed for no horizontal overflow and functional tabs at five viewport widths; reduced-motion bypassed the film; embedded MP4 decoded in Chromium. Native Safari, a deployed preview, and photo authenticity replacement remain pending.

**Status: design study implemented and locally reviewed; not integrated, merged, deployed or certified as a photoreal 3D final release.**
