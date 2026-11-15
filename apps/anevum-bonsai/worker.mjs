import {SPECIMENS, SPECIES, EVENTS, JOURNAL, MEDIA, STUDIES, specimenById, visibleMedia, assertContentIntegrity} from "./records.mjs";
import {STYLES} from "./style.mjs";

/**
 * ANEVUM — The Living Atlas.
 * Independent, review-only, zero-binding public Worker.
 * This script intentionally does not replace the apex route or touch the
 * existing original-works, member, staff, auth or API applications.
 */
const SITE = "https://anevum.com";
const SURFACE = "anevum-bonsai-living-atlas-review-v1";
const PATHS = ["", "collection", "chronicle", "journal", "atelier", "practice", "about"];
const HEADERS = Object.freeze({
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; media-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cache-Control": "private, no-store",
  "X-Anevum-Surface": SURFACE
});
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const route = path => "/" + path;
const a = (href, label, cls = "") => '<a href="' + esc(href) + '"' + (cls ? ' class="' + esc(cls) + '"' : "") + '>' + label + '</a>';
const action = (href, label, ghost = false) => a(href, esc(label) + '<span class="arrow" aria-hidden="true">↗</span>', "action" + (ghost ? " ghost" : ""));
const eyebrow = title => '<p class="eyebrow">' + esc(title) + '</p>';

function placeholder(title = "A specimen in time", category = "Photography awaiting approval", specimen = null) {
  const asset = specimen ? visibleMedia(specimen.mediaIds)[0] : null;
  if (asset) return '<figure class="gallery-pending"><img loading="lazy" src="' + esc(asset.src) + '" alt="' + esc(asset.alt) + '"><figcaption class="pending-copy">' + esc(asset.caption) + '</figcaption></figure>';
  return '<div class="gallery-pending" role="img" aria-label="' + esc(category) + '"><div class="pending-copy"><span class="kicker">' + esc(category) + '</span><strong>' + esc(title) + '</strong><span>Authentic collection imagery will appear after source and public-use review.</span></div></div>';
}

function navigation(path, mobile = false) {
  const items = [
    ["/", "Home"], ["/collection", "Collection"], ["/chronicle", "Chronicle"],
    ["/atelier", "Atelier"], ["/journal", "Journal"], ["/practice", "Practice"], ["/about", "About"]
  ];
  return '<nav aria-label="' + (mobile ? "Mobile navigation" : "Primary navigation") + '">' +
    items.map(([href,label]) => '<a href="' + href + '"' + (path === href ? ' aria-current="page"' : "") + '>' + label + '</a>').join("") +
    '</nav>';
}

function shell(path, title, description, content) {
  const nav = navigation(path);
  // No external JS, third-party fonts or connections. Text is accessible
  // before hydration because there is no hydration.
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<meta name="theme-color" content="#0c1711"><meta name="robots" content="noindex,nofollow,noarchive">' +
    '<meta name="description" content="' + esc(description) + '">' +
    '<meta property="og:site_name" content="ANEVUM"><meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(description) + '">' +
    '<title>' + esc(title) + ' — ANEVUM, A Living Atlas</title><style>' + STYLES + '</style></head><body class="motion-active">' +
    '<a class="skip" href="#main">Skip to content</a>' +
    '<header class="header"><div class="shell header-inner"><a href="/" class="identity" aria-label="ANEVUM, home"><strong>ANEVUM</strong><small>A Living Atlas</small></a>' +
    '<div class="top-nav">' + nav + '</div>' +
    '<details class="menu"><summary>Explore</summary>' + navigation(path,true) + '</details></div></header>' +
    '<main id="main" tabindex="-1">' + content + '</main>' +
    '<footer class="site-footer"><div class="shell"><div class="footer-grid"><div><div class="footer-brand">ANEVUM</div><p class="fine">A living atlas of trees, time, and the art of becoming.</p></div>' +
    '<nav aria-label="Footer navigation"><a href="/collection">Collection</a><a href="/chronicle">Chronicle</a><a href="/atelier">Atelier</a><a href="/journal">Journal</a><a href="/practice">Practice</a><a href="/about">About</a></nav></div>' +
    '<div class="footer-bottom"><span>Time is the medium.</span><span>Independent cultivation archive · 2026 onward</span></div></div></footer>' +
    '</body></html>';
}

function pageHero(section, title, intro) {
  return '<section class="page-hero"><div class="shell">' + eyebrow(section) + '<h1>' + esc(title) + '</h1><p class="lede">' + esc(intro) + '</p></div></section>';
}

function home() {
  const hero = '<section class="hero"><div class="scene" aria-hidden="true"><div class="ring"></div><div class="caption">Atmospheric study / not specimen imagery</div></div>' +
    '<div class="shell hero-body"><p class="kicker">ANEVUM / A Living Atlas</p><h1>Time is<br>the medium.</h1>' +
    '<p class="lede">A living atlas of trees, time, and the art of becoming.</p>' +
    '<div class="cta-row">' + action("/collection", "Enter the Collection") + action("/chronicle", "Explore the Chronicle", true) + '</div></div>' +
    '<div class="scroll-cue">Scroll to explore · 01 / 05</div></section>';
  const introduction = '<section class="chapter shell"><div class="chapter-head"><div>' + eyebrow("01 / A beginning") +
    '<h2>Five lives.<br>One beginning.</h2></div>' +
    '<p>Five red maples, raised from seed in 2026. Their story starts before they resemble finished bonsai. Nothing here needs to pretend that time has already passed.</p></div>' +
    '<div class="feature-specimen">' + placeholder("The first maple", "Tree 01 · actual photo pending") +
    '<div class="feature-copy">' + eyebrow("Specimen 01 / Acer rubrum") + '<h3>The first experiment.</h3>' +
    '<p>A seed-grown red maple and an emerging root-over-rock composition. Stone selection and root work remain future decisions.</p>' +
    action("/collection/tree-01", "Meet Tree 01") + '</div></div></section>';
  const chronicle = '<section class="paper"><div class="shell editorial-grid"><div>' + eyebrow("02 / The Chronicle") +
    '<h2>A different kind<br>of calendar.</h2><p>Not a simulation of growth, but a record of real changes: dated observations, decisions, seasons, and the patience between them.</p>' +
    action("/chronicle", "Follow the timeline") + '</div><div class="engraving" aria-hidden="true">2026</div></div></section>';
  const collection = '<section class="chapter shell">' + eyebrow("03 / The Collection") + '<div class="chapter-head"><h2>Individual worlds.</h2>' +
    '<p>Five seedlings, five records. Each specimen will acquire a character and history through authentic evidence rather than invented milestones.</p></div>' +
    '<div class="index-rows">' + SPECIMENS.map(specimen =>
      a("/collection/" + specimen.id,
        '<span class="kicker">' + esc(specimen.scientificName) + '</span><span class="big-number">' + String(specimen.number).padStart(2,"0") + '</span><div><h3>' + esc(specimen.title) + '</h3><p>' + esc(specimen.styling || "Individual history developing") + '</p></div>',
        "index-row")).join("") + '</div></section>';
  const atelier = '<section class="paper"><div class="shell editorial-grid"><div>' + eyebrow("04 / The Living Atelier") + '<h2>Imagine.<br>Observe.<br>Then act.</h2><p>The first root-over-rock study exists as a design direction, not a completed intervention. Explore alternatives while the tree remains the authority.</p>' +
    action("/atelier", "Enter the Atelier") + '</div>' + placeholder("A working study", "Proposed composition · no stone selected") + '</div></section>';
  return hero + introduction + chronicle + collection + atelier;
}

function collection() {
  const rows = SPECIMENS.map(specimen => '<article class="chapter collection-line"><div class="shell"><div class="folio"><strong>Specimen ' + String(specimen.number).padStart(2,"0") + ' / 05</strong><span>Seed-grown · 2026</span></div>' +
    '<div class="feature-specimen">' + placeholder(specimen.title, "Owner photograph pending", specimen) + '<div class="feature-copy">' +
    eyebrow("Acer rubrum / Red maple") + '<h2>' + esc(specimen.title) + '</h2>' +
    '<p>' + esc(specimen.notes) + '</p>' + action("/collection/" + specimen.id, "Open specimen") + '</div></div></div></article>').join("");
  return pageHero("The Collection / 01–05", "Five trees. Five futures.",
    "Each seed-grown red maple has its own record. Only documented measurements, photographs, and interventions become part of the archive.") + rows;
}

function meta(specimen) {
  const fields = [
    ["Specimen ID",specimen.id],["Botanical name",specimen.scientificName],["Common name",specimen.commonName],
    ["Origin",specimen.origin],["Germination date","Not recorded"],
    ["Current measurements","Not recorded"],
    ["Design direction",specimen.styling || "Not established"],
    ["Actual interventions","None documented"]
  ];
  return '<dl class="metadata">' + fields.map(([key,value])=>'<div><dt>' + esc(key) + '</dt><dd>' + esc(value) + '</dd></div>').join("") + '</dl>';
}

function timeline(events) {
  if (!events.length) return '<p class="muted">No individual dated observations have been published. New records will appear after verification.</p>';
  return '<ol class="timeline">' + events.map(event => '<li><time datetime="' + esc(event.date) + '">' + esc(event.precision === "year" ? event.date : "15 November 2026") + '</time>' +
    '<div><h3>' + esc(event.title) + '</h3><p class="muted">' + esc(event.description) + '</p></div>' +
    '<span class="tag ' + esc(event.state) + '">' + esc(event.state) + '</span></li>').join("") + '</ol>';
}

function specimenPage(id) {
  const specimen = specimenById(id);
  if (!specimen) return null;
  const ownEvents = EVENTS.filter(e => e.specimenId === specimen.id || e.specimenId === null);
  return pageHero("The Collection / Specimen " + String(specimen.number).padStart(2,"0"), specimen.title,
    "Acer rubrum. Seed-grown in 2026. A living record, not a finished portrait.") +
    '<section class="shell chapter"><div class="specimen-stage">' + placeholder(specimen.title, "Documentary photograph pending", specimen) +
    '<div class="stage-info">' + eyebrow("Specimen record") + '<h2>Becoming,<br>slowly.</h2>' + meta(specimen) +
    action("/chronicle", "Explore recorded time") + '</div></div><div class="observations"><div>' +
    eyebrow("The current record") + '<h2>What we<br>know.</h2><p>' + esc(specimen.notes) + '</p></div><div>' +
    eyebrow("What remains open") + '<p>Exact germination dates, measurements, soil, pot, health assessments, and individual photographic histories are not established in this public record. These gaps are intentional.</p>' +
    (specimen.number === 1 ? action("/atelier", "Examine the design study") : "") + '</div></div></section>' +
    '<section class="paper"><div class="shell">' + eyebrow("Development record") + '<h2>Time, documented.</h2><p class="fine">Year-level records are not assigned invented calendar days.</p>' +
    '<div class="metadata">' + ownEvents.map(e=>'<div><dt>' + esc(e.date) + '</dt><dd>' + esc(e.title) + ' · ' + esc(e.state) + '</dd></div>').join("") + '</div>' +
    action("/collection", "Return to collection") + '</div></section>';
}

function chronicle() {
  return pageHero("The Chronicle / Recorded time","The years will speak.",
    "A growing timeline of observed facts, design intentions, and completed work. None of these categories is interchangeable.") +
    '<section class="shell chapter">' + eyebrow("Record / 2026 onward") + timeline(EVENTS) +
    '<div class="editorial-grid"><div>' + eyebrow("Authentic comparison") + '<h2>Before and after<br>must be real.</h2>' +
    '<p class="muted">Side-by-side comparison will be enabled when two owner-approved photographs of the same specimen have distinct verified capture dates.</p>' +
    action("/collection/tree-01", "Return to the first tree") + '</div>' + placeholder("Not yet photographed twice", "Comparison awaiting two dated originals") + '</div></section>';
}

function atelier() {
  const study = STUDIES[0];
  return pageHero("The Living Atelier / Design Study 001","Root over rock.",
    "An exploration of possible compositions for Tree 01. Nothing shown here represents completed root placement.") +
    '<section class="shell chapter"><div class="editorial-grid"><div>' + eyebrow("Tree 01 / Acer rubrum") +
    '<h2>The stone<br>comes first.</h2><p class="lede">' + esc(study.known) + '</p>' +
    '<p class="muted">' + esc(study.unknown) + '</p><span class="tag">Planned · Not installed</span></div>' +
    placeholder("Composition study", "Proposal only · no selected stone") + '</div></section>' +
    '<section class="paper"><div class="shell">' + eyebrow("Three studies / No intervention") +
    '<h2>Shapes to consider.</h2><p>These are written composition alternatives, not 3D reconstructions or evidence of the tree’s roots. Expand each study.</p>' +
    '<div class="study-options">' + study.alternatives.map((option,index) =>
      '<details><summary><span class="study-number">' + String(index+1).padStart(2,"0") + '</span><span><h3>' + esc(option.title) + '</h3><span class="expand">Explore study +</span></span></summary><p>' + esc(option.note) + '</p></details>').join("") +
    '</div>' + action("/collection/tree-01", "View the authentic record") + '</div></section>';
}

function journal() {
  return pageHero("Field Journal / 01","Notes from<br>the beginning.",
    "Original observations, decisions, and reflections. The archive grows with the trees.") +
    '<section class="shell chapter">' + JOURNAL.map(entry =>
      a("/journal/" + entry.slug,
        '<time datetime="' + esc(entry.date) + '">15 Nov 2026</time><div><h3>' + esc(entry.title) + '</h3><p>' + esc(entry.summary) + '</p></div><span class="arrow" aria-hidden="true">↗</span>',
        "journal-entry")).join("") + '</section>';
}

function journalEntry(slug) {
  const entry = JOURNAL.find(j => j.slug === slug);
  if (!entry) return null;
  return pageHero("Field Journal / " + entry.date, entry.title, entry.summary) +
    '<section class="shell chapter reading-grid"><aside class="aside-panel">' + eyebrow("Record / Published entry") +
    '<p>15 November 2026</p><p class="fine">Editorial record. No inferred growth milestones.</p></aside>' +
    '<article class="text-block">' + entry.paragraphs.map(p=>'<p>' + esc(p) + '</p>').join("") +
    action("/journal", "Return to journal") + '</article></section>';
}

function practice() {
  return pageHero("The Practice / Stewardship","A practice of attention.",
    "Bonsai asks for observation before intervention. The archive will record decisions alongside the reasons and uncertainties behind them.") +
    '<section class="shell chapter"><div class="editorial-grid"><div>' + eyebrow("Method / 01") + '<h2>Look longer.</h2>' +
    '<p class="lede">Every specimen begins with its actual form, growing conditions, and time. Artistic direction is a question to test against biological reality.</p>' +
    '<p class="muted">For Tree 01, that means studying stone proportions and eventual root placement without claiming that the tree is already mounted.</p>' +
    action("/atelier", "Explore the first study") + '</div>' + placeholder("Observation before intervention", "Documentary practice / photo pending") + '</div></section>';
}

function about() {
  return pageHero("About / ANEVUM","An archive<br>in the making.",
    "An independently maintained collection and botanical journal by Devon Alan Akins.") +
    '<section class="paper"><div class="shell editorial-grid"><div>' + eyebrow("Time is the medium.") +
    '<h2>Not an exhibition<br>of finished trees.</h2><p>Five red maples grown from seed in 2026 are the beginning. Their records will evolve through actual photography, measured observations, careful interventions, and written reflection.</p>' +
    '<p>Earlier ANEVUM creative and software work is preserved separately; this botanical atlas is the current public direction.</p>' +
    action("/collection", "Explore the collection") + '</div><div class="engraving" aria-hidden="true">05</div></div></section>';
}

function render(path) {
  if (path === "/") return ["Home", "Time is the medium. A living atlas of trees, time, and the art of becoming.",home()];
  if (path === "/collection") return ["The Collection", "Five seed-grown Acer rubrum specimens, recorded truthfully.", collection()];
  if (path.startsWith("/collection/")) {
    const id = path.slice("/collection/".length);
    const html = specimenPage(id);
    return html ? ["Specimen " + id.slice(-2), "A documented seed-grown red maple.", html] : null;
  }
  if (path === "/chronicle") return ["The Chronicle", "Observed events, plans and completed work through time.",chronicle()];
  if (path === "/atelier") return ["The Living Atelier", "Root-over-rock design explorations for Tree 01, not a completed intervention.",atelier()];
  if (path === "/journal") return ["Field Journal", "An archive of original cultivation writing.",journal()];
  if (path.startsWith("/journal/")) {
    const slug=path.slice("/journal/".length);
    const html=journalEntry(slug);
    return html ? ["Journal — " + slug, "A dated ANEVUM field journal entry.",html] : null;
  }
  if (path === "/practice") return ["The Practice","Observation, stewardship and responsible experimentation.",practice()];
  if (path === "/about") return ["About","An independent collection and botanical journal by Devon Alan Akins.",about()];
  return null;
}

assertContentIntegrity();

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const acceptHost = url.hostname === "anevum.com" || url.hostname.endsWith(".workers.dev");
    if (!acceptHost || url.protocol !== "https:") return new Response("Not found", {status:404});
    if (!["GET","HEAD"].includes(request.method)) return new Response("Method not allowed", {status:405,headers:{"Allow":"GET, HEAD"}});
    if (url.search || url.hash) {
      // Hash anchors are client side and are not normally sent to a server.
      if (url.search) return new Response("Not found", {status:404});
    }
    const entry=render(url.pathname.replace(/\/+$/, "") || "/");
    if (!entry) return new Response("Not found", {status:404,headers:{"X-Robots-Tag":"noindex, nofollow, noarchive"}});
    const [title,description,body]=entry;
    const html=shell(url.pathname,title,description,body);
    return new Response(request.method === "HEAD" ? null : html, {status:200,headers:HEADERS});
  }
};
