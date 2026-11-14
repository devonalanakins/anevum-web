/**
 * ANEVUM.WEB.BUILD.2026-11-14.007.LIVING-EXPERIENCES-ROUTE
 * Genuine public Experiences destination: no fabricated releases or playback.
 * No client scripts, additional privileges, or private state.
 */
import {LAB_STYLES,LAB_BRAND} from "./living-laboratory-home.mjs";
const ROOT="/original-works";
const ITEMS=Object.freeze([
 {no:"01",name:"Brandle",kind:"Interactive system",art:"brandle-interactive-v1.webp",
  description:"A five-letter browser game explored through source code and interaction design.",
  status:"Source repository, not a verified live game.",href:"https://github.com/devonalanakins/brandle",cta:"View source"},
 {no:"02",name:"Original Works",kind:"Editorial journey",art:"original-worlds-v1.webp",
  description:"Walk through the earlier ANEVUM literary universe, preserved in its original public edition.",
  status:"Public editorial experience, not a newly published manuscript.",href:"/original-works",cta:"Enter Original Works"},
 {no:"03",name:"Transcosmic Encyclopedia",kind:"Reader exploration",art:"research-worlds-v1.webp",
  description:"Explore the public reference preview for the imagined Transcosmic universe.",
  status:"Reader preview, not a complete or approved canon.",href:"/original-works/wiki",cta:"Explore encyclopedia"}
]);
const CSS=[
".lab-x-hero{position:relative;isolation:isolate;overflow:hidden;min-height:410px;display:flex;align-items:center;background:#0a0812;border-bottom:1px solid var(--line)}",
".lab-x-hero::before{content:'';position:absolute;inset:0;z-index:-2;background:url('/original-works/assets/research-worlds-v1.webp') center/cover no-repeat;opacity:.83}",
".lab-x-hero::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#09060dfc,#110a1ae5 42%,#0e0a1880),linear-gradient(0deg,#09070d,transparent 75%)}",
".lab-x-hero .lab-wrap{padding-block:73px 85px}",
".lab-x-crumb{display:flex;gap:13px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#efc2a7}",
".lab-x-crumb a{text-decoration:underline;text-underline-offset:5px}",
".lab-x-hero h1{font:normal clamp(49px,8vw,110px)/.96 var(--display);letter-spacing:.1em;margin:24px 0 18px}",
".lab-x-hero p{font:italic clamp(21px,3vw,35px)/1.35 var(--display);margin:0;max-width:670px;color:#f3e5ee}",
".lab-x-main{padding-block:53px 88px}",
".lab-x-intro{display:grid;grid-template-columns:.9fr 1.1fr;gap:40px;align-items:end;padding-bottom:28px;border-bottom:1px solid var(--line)}",
".lab-x-intro h2{font:normal clamp(30px,3.6vw,52px)/1.1 var(--display);margin:12px 0 0}",
".lab-x-intro p,.lab-x-note p{font:15px/1.75 var(--display);color:#cfc1d3;margin:0}",
".lab-x-grid{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:17px;margin-top:32px}",
".lab-x-card{position:relative;isolation:isolate;min-width:0;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;min-height:455px;padding:27px;border:1px solid #ac8da27e;background:#18111f;transition:transform .25s,border-color .25s}",
".lab-x-card::before{content:'';position:absolute;inset:0;z-index:-2;background:var(--art) center/cover no-repeat;transition:transform .6s}",
".lab-x-card::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,#09070dfd,#100a17e8 41%,#100a1783 67%,transparent)}",
".lab-x-card:hover,.lab-x-card:focus-visible{transform:translateY(-4px);border-color:#ecc3a5}",
".lab-x-card:hover::before,.lab-x-card:focus-visible::before{transform:scale(1.04)}",
".lab-x-number{font-size:10px;letter-spacing:.2em;color:#efc1a8;margin-bottom:auto}",
".lab-x-kind{font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:700;color:#eac3ad}",
".lab-x-card h3{font:italic normal clamp(32px,3.5vw,49px)/1.08 var(--display);margin:10px 0 15px;text-wrap:balance}",
".lab-x-card p{font:14px/1.65 var(--display);color:#e2d6e4;margin:0 0 12px}",
".lab-x-status{font-size:11px;line-height:1.55;color:#bbaabb}",
".lab-x-go{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px solid #d6b4c066;color:#f1c4a9;font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:700}",
".lab-x-go span{font-size:22px}",
".lab-x-note{display:grid;grid-template-columns:1fr 1.25fr;gap:36px;margin-top:48px;padding-top:34px;border-top:1px solid var(--line)}",
".lab-x-note h2{font:normal clamp(28px,3vw,41px)/1.1 var(--display);margin:0}",
".lab-x-note a{color:#f1bea6;text-decoration:underline;text-underline-offset:4px}",
"@media(max-width:980px){.lab-x-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lab-x-card:first-child{grid-column:1/-1;min-height:360px}}",
"@media(max-width:650px){.lab-x-hero{min-height:325px}.lab-x-hero .lab-wrap{padding-block:48px 55px}.lab-x-hero h1{font-size:clamp(40px,10vw,63px);letter-spacing:.06em}.lab-x-intro,.lab-x-note{grid-template-columns:1fr;gap:19px}.lab-x-main{padding-block:34px 65px}.lab-x-grid{grid-template-columns:1fr;margin-top:24px}.lab-x-card,.lab-x-card:first-child{grid-column:auto;min-height:360px;padding:22px}}",
"@media(prefers-reduced-motion:reduce){.lab-x-card,.lab-x-card::before{transition:none!important;transform:none!important}}",
"@media(forced-colors:active){.lab-x-card{border:1px solid CanvasText}}"
].join("\n");
function renderCard(p){
 return '<a class="lab-x-card" href="'+p.href+'" style="--art:url('+"'"+ROOT+'/assets/'+p.art+"'"+')" aria-label="'+p.name+': '+p.cta+'">'+
 '<span class="lab-x-number">'+p.no+' / EXPERIENCE</span><span class="lab-x-kind">'+p.kind+'</span>'+
 '<h3>'+p.name+'</h3><p>'+p.description+'</p><span class="lab-x-status">'+p.status+'</span>'+
 '<span class="lab-x-go">'+p.cta+' <span aria-hidden="true">↗</span></span></a>';
}
export function renderLivingLaboratoryExperiences(){
 const links='<a href="'+ROOT+'/experiments">Experiments</a><a href="'+ROOT+'/research">Research</a>'+
 '<a href="'+ROOT+'/experiences" aria-current="page">Experiences</a><a href="'+ROOT+'/archive">Archive</a><a href="/#contact">Contact</a>';
 const header='<header class="lab-header"><div class="lab-wrap lab-head-inner"><a class="lab-brand" href="/" aria-label="ANEVUM home">'+LAB_BRAND+'<span>ANEVUM</span></a>'+
 '<nav class="lab-nav" aria-label="Primary navigation">'+links+'</nav><details class="lab-mobile"><summary>Menu</summary><nav aria-label="Mobile navigation">'+links+'</nav></details></div></header>';
 const hero='<section class="lab-x-hero" aria-labelledby="experiences-heading"><div class="lab-wrap"><nav class="lab-x-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Experiences</span></nav>'+
 '<h1 id="experiences-heading">Experiences</h1><p>Explore the work, not just the description.</p></div></section>';
 const main='<main id="main" tabindex="-1">'+hero+'<div class="lab-wrap lab-x-main"><section aria-labelledby="experiences-index-heading">'+
 '<div class="lab-x-intro"><div><span class="lab-micro">ANEVUM / Independent studio</span><h2 id="experiences-index-heading">Places you can enter.</h2></div>'+
 '<p>Software, fiction and reference worlds take different forms. Every destination below links to a real public artifact. Source code is distinguished from playable experiences.</p></div>'+
 '<div class="lab-x-grid">'+ITEMS.map(renderCard).join('')+'</div></section>'+
 '<section class="lab-x-note" aria-labelledby="experiences-note-heading"><h2 id="experiences-note-heading">Made, not imagined as finished.</h2>'+
 '<p>Not every experiment is a launched product. ANEVUM separates available source, reader previews and finished releases. For software, visit <a href="'+ROOT+'/experiments">Experiments</a>; for preserved literature, visit <a href="'+ROOT+'/archive">Archive</a>.</p></section></div></main>';
 const footer='<footer id="contact" class="lab-footer"><div class="lab-wrap lab-footer-inner"><p>ANEVUM — Experiences · An independent studio</p><p>Created by <a href="https://devonakins.com">Devon Akins</a> · <a href="https://github.com/devonalanakins">Public work &amp; contact</a></p></div></footer>';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#09070d"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="Explore real ANEVUM interactive source, editorial journeys and reader reference previews."><title>Experiences | ANEVUM Living Laboratory</title><style>'+LAB_STYLES+CSS+'</style></head><body><a class="lab-skip" href="#main">Skip to content</a>'+header+main+footer+'</body></html>';
}
