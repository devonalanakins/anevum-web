# ANEVUM — The Living Atlas (isolated preview)

Session: ANEVUM.WEB.BUILD.2026-11-15.001.BONSAI-LIVING-ARCHIVE

## Boundaries

This is a standalone HTML-first Cloudflare Worker at \`apps/anevum-bonsai/worker.mjs\`. It does not import, overwrite, or call any of the legacy public website, Command, member, APIs, databases or authentication code. The separate \`wrangler.anevum-bonsai-preview.jsonc\` contains no route, custom domain, bindings or secrets. Its Worker name is unique and preview-only. **Do not deploy with an apex route, and do not edit the production route map.** The root Vite application and original-works public Worker remain unchanged.

## Local verification

From repository root, using Node 22+:

\`\`\`sh
node --check apps/anevum-bonsai/records.mjs
node --check apps/anevum-bonsai/style.mjs
node --check apps/anevum-bonsai/worker.mjs
node --test tests/anevum-bonsai.test.mjs
npx wrangler deploy --config wrangler.anevum-bonsai-preview.jsonc --dry-run
\`\`\`

For a local HTTP review (no Cloudflare credentials), import the Worker module in a Node HTTP adaptor or use Wrangler dev:

\`\`\`sh
npx wrangler dev --config wrangler.anevum-bonsai-preview.jsonc
\`\`\`

**Preview-release gate:** Before uploading the Worker, review the config to confirm no routes, bindings, scheduled triggers or domain attachments; independently inspect the target Cloudflare account and any existing same-named Worker. Deploy preview only by an authorized operator to its **separate** workers.dev endpoint. Never attach a route to anevum.com until separate owner approval and protected-route testing.

## Content editing

The sole canonical record file for this preview is \`apps/anevum-bonsai/records.mjs\`. Add new \`SPECIMENS\` with stable IDs, verified species and origin. Add \`EVENTS\` with precise date **and** \`precision\` (year/day), \`state\` observed/planned/completed, and correct \`specimenId\`. Add \`JOURNAL\` entries with unique slug and date. A public media record requires source, permission, capture date when available, accurate alt text, and an authentic/illustrative kind. An illustrative image cannot be evidence of biological change. Keep unapproved media \`approved:false\`, \`src:null\`.

\`assertContentIntegrity()\` fails on unlinked records or unapproved publication URLs, but human source review and image licensing remain required.

## Working design scope

Implemented as source: home, five-tree collection, five specimen pages, Chronicle, Atelier, Journal index/detail, Practice and About. Native HTML links and \`details\` affordances work without JavaScript. Motion is limited to subtle CSS lighting/mist on an **abstract atmospheric placeholder**. There are **no** final photos, WebM/MP4 masters, accurate tree models, or dated photographic comparisons. There is no completed root-over-rock horticultural work. No false photos are emitted, and all pages are noindex until a separate release contract.

## Acceptance work still required

- Obtain and approve authentic Tree 01 photography and information for Tree 02–05; document provenance.
- Produce distinct high-resolution text-free landscape and mobile masters; label any generative art as illustrative.
- Add motion only after media QC, visibility, Save-Data, reduced-motion and decode tests.
- Run real mobile/desktop and Safari/WebKit screenshots, keyboard audit, overflow checks, Core Web Vitals.
- Verify the production Worker cascade and all protected routes with release owner; inventory rollback.
- Change metadata/indexing and release to apex **only after** visual/content and deployment approval.

## Rollback

Preview rollback: delete or roll back only the uniquely named preview Worker after confirming it owns no route. Production rollback: **not yet specified**; inspect Cloudflare route precedence, current apex Worker deployed version and any existing release process before scheduling a cutover. Existing archives and original-works routes must remain reachable.
