# ANEVUM / identity refinement — owner-review candidates

> **Owner direction update — November 18, 2026:** The earlier wedge/three-path aperture design is **REJECTED**, as it resembles sportswear branding. The owner selected **The Confluence** as ANEVUM's new lead identity concept. See [CONFLUENCE.md](./CONFLUENCE.md) and six new `confluence-*.svg` source files. Selection authorizes source-level refinement only; do not change the served mark or public brand without a separate approval.


Session: `ANEVUM.WEB.DESIGN.2026-11-17.005.OPEN-APERTURE-MARK-REVIEW`  
Parent engineering session: `ANEVUM.WEB.BUILD.2026-11-17.003.OPEN-INSTITUTE-FULL-IMPLEMENTATION`  
Status: **READY FOR OWNER REVIEW** — none of these new symbols is approved or public. Draft PR #816 only.

## Context

The November 17 Open Aperture symbol `../mark.svg` remains the active **draft** mark, source-coupled to `../artwork.mjs`. This iteration does **not** replace it; site header, favicons, primary icon, CSS, public routes and production branding remain untouched.

The original symbol contains tiny detached strokes, a dot, very fine orbital arcs and tapered forms that disappear when reduced. Its visual language also remains tightly associated with the earlier observatory metaphor.

## Three original pure-vector concepts

| Candidate | Why it exists | Risk |
| --- | --- | --- |
| **Open Aperture refined** (rejected / archived) | Retains the established three-path DNA and open discovery theme; one bolder structural arc, no stray dot, no overlapping lower orbit, fewer micro details; typography and palette can evolve independently | May still suggest topography rather than frontier scientific research and needs independent small-scale human recognition |
| **Axiom** | Extremely readable A-derived structure at 16–32px, technical and architectural | Simple letter-A mark could collide with unrelated institutional identities; requires stronger differentiation |
| **Gate** | References a monumental open research facility without a generic university crest or circular orbital decoration | Can be interpreted as an N or doorway at small sizes; less obvious tie to ANEVUM initial |

All candidates have one full-color source and both monochrome paper/dark variants. They use only `<path>` shapes, no typefaces, images, scripts, foreign objects or CDN requests. Palette: Ivory `#F4F1E8`, Brass `#D9B17A`, Sage `#95B9AB`, Ink `#071016`. SVGs use a stable 160×160 viewBox, title/desc and exact vector coordinates.

A companion offline visual review sheet, transparent 1024px sample, 16/24/32/64px checks, SVG-only horizontal wordmark prototypes and a ZIP of editable masters were produced as local artifacts. The 16px comparison is a *visual check*, not a usability study or trademark clearance.

## Optical / production criteria

- A recognisable and consistent silhouette at 16 and 24px without needing gradients or glow; test color and high-contrast one-ink on dark and paper
- No invented heraldic accreditation, university status, faculty, physical campus, or issued credentials
- Icon is recognizable without any surrounding text; avoid hidden reliance on an app background
- Confirm transparent bleed/clear space, light and dark variants, print stamping and responsive navigation
- Letter outlines in the separately generated vector wordmark use Lato Heavy/Medium outlines (Lato is OFL-1.1; no font files bundled or shared). Font ownership/license and final optical kerning require a separate approval checkpoint
- Do not publish or replace institutional marks before owner approval, appropriate originality / trademark review, and separate release verification

## Exact next action

Owner selects or rejects a mark direction after seeing the actual size tests. Only then bring the selected master into `mark.svg`, keep `artwork.mjs` source-coupled, render the 16/32/180/512px app/favicon suite, execute existing 11-route responsive QA and separately authorize any production roll-out. Preserve the original mark file in history and do not merge unrelated design PRs.
