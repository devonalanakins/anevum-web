/**
 * ANEVUM.WEB.RESEARCH.2026-11-12.001 — review-only research directions.
 * Every entry states an open question; public links are context, not evidence
 * of validated findings. No private content, client JS, or fabricated status.
 */
import {LAB_STYLES, LAB_BRAND} from "./living-laboratory-home.mjs";

const BASE="/original-works";
const AREAS=Object.freeze([
 {id:"generation",index:"01",name:"Generative systems",art:"research-generation-v1.webp",eyebrow:"Emergence & rules",summary:"What kinds of structure can emerge from simple computational rules?",question:"When does a system produce useful complexity rather than decorative randomness?",evidence:"Exploratory direction. No public study or validated finding is claimed.",links:[]},
 {id:"representation",index:"02",name:"Representation & computation",art:"research-computation-v1.webp",eyebrow:"Language & information",summary:"How might a representation change what it costs to describe, store or compute something?",question:"What can be measured independently, and what information would a reversible representation need to preserve?",evidence:"Related source repositories are early work, not evidence of a proven compression or programming result.",links:[{name:"INVARIANT source",href:"https://github.com/devonalanakins/invariant"},{name:"Rhen source",href:"https://github.com/devonalanakins/rhen"}]},
 {id:"interaction",index:"03",name:"Interactive worlds",art:"research-worlds-v1.webp",eyebrow:"Interface & behavior",summary:"How should an environment reveal its rules through interaction rather than explanation?",question:"Can a new visitor understand the first meaningful action without guidance?",evidence:"Brandle is a related public source project. No measured usability or user-study result is claimed.",links:[{name:"Brandle source",href:"https://github.com/devonalanakins/brandle"}]},
 {id:"imagination",index:"04",name:"Speculative imagination",art:"research-imagination-v1.webp",eyebrow:"Worldbuilding & fiction",summary:"How do invented worlds help us explore unfamiliar assumptions?",question:"What makes an imagined system internally coherent and worth revisiting?",evidence:"Original Works is preserved editorial material, not scientific evidence or a scheduled new release.",links:[{name:"Explore Original Works",href:"/original-works/archive"}]}
]);
const CSS=[
".lab-res-hero{position:relative;isolation:isolate;overflow:hidden;min-height:370px;display:flex;align-items:center;border-bottom:1px solid #836a8277;background:#110c18}",
".lab-res-hero::before{content:'';position:absolute;z-index:-2;inset:0;background:url('/original-works/assets/lab-hero-v1.webp') 64% center/cover no-repeat;opacity:.76}",
".lab-res-hero::after{content:'';position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,#09070dfb 0%,#0b0912e6 35%,#120b19b3 58%,#09070d47),linear-gradient(0deg,#09070de8 0%,transparent 56%)}",
".lab-res-hero-inner{padding-block:62px 67px}",
".lab-res-breadcrumb{display:flex;gap:12px;align-items:center;font-size:10px;letter-spacing:.19em;text-transform:uppercase;color:#dfb398}",
".lab-res-breadcrumb a{text-decoration:underline;text-underline-offset:6px}",
".lab-res-heading{margin:20px 0 17px;font:normal clamp(54px,7.7vw,105px)/.96 var(--display);letter-spacing:.16em;text-transform:uppercase}",
".lab-res-hero-lead{font:italic clamp(20px,3vw,34px)/1.38 var(--display);max-width:700px;color:#ebdce9;margin:0}",
".lab-res-main{padding-top:45px;padding-bottom:84px}",
".lab-res-preface{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:end;padding-bottom:27px;border-bottom:1px solid #725e6e76}",
".lab-res-preface h2{margin:0;font:normal clamp(30px,3.2vw,46px)/1.15 var(--display)}",
".lab-res-preface p{margin:0;font:15px/1.75 var(--display);color:#c9bdcc}",
".lab-res-index{display:flex;gap:13px;flex-wrap:wrap;margin:20px 0 33px}",
".lab-res-index a{display:inline-flex;align-items:center;justify-content:center;min-height:47px;padding:10px 15px;border:1px solid #92758c99;color:#e1cbdc;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}",
".lab-res-index a:hover{border-color:#eeb69c;color:#f9d6bb;background:#30202e}",
".lab-res-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:19px}",
".lab-res-card{min-width:0;border:1px solid #aa8da076;background:#18111f;overflow:hidden;scroll-margin-top:24px}",
".lab-res-media{height:218px;position:relative;overflow:hidden;background:#23182b}",
".lab-res-media img{display:block;width:100%;height:100%;object-fit:cover}",
".lab-res-media::after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,#17111de8,transparent 50%);pointer-events:none}",
".lab-res-card-number{position:absolute;top:22px;left:24px;font-size:10px;letter-spacing:.2em;color:#f1c6b2;font-weight:750}",
".lab-res-card-copy{padding:25px 28px 28px}",
".lab-res-card-label{display:block;color:#dcaf9a;font-size:10px;letter-spacing:.18em;text-transform:uppercase;font-weight:700}",
".lab-res-card h3{font:italic normal clamp(27px,3vw,42px)/1.15 var(--display);margin:8px 0 14px}",
".lab-res-card-copy>p{font:15px/1.65 var(--display);color:#e2d8e4;margin:0 0 22px;min-height:48px}",
".lab-res-details{border-top:1px solid #8d738987}",
".lab-res-details summary{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:51px;cursor:pointer;font-size:11px;letter-spacing:.13em;text-transform:uppercase;font-weight:700;color:#ecc1aa;list-style:none}",
".lab-res-details summary::-webkit-details-marker{display:none}",
".lab-res-details summary::after{content:'+';font:normal 24px/1 var(--display)}",
".lab-res-details[open] summary::after{content:'−'}",
".lab-res-detail-copy{padding-bottom:4px}",
".lab-res-detail-copy strong{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#e6b393;margin:10px 0 5px}",
".lab-res-detail-copy p{margin:0 0 15px;color:#cbbdcd;font:14px/1.7 var(--display)}",
".lab-res-detail-links{display:flex;gap:10px;flex-wrap:wrap;margin:0;padding:3px 0 14px;list-style:none}",
".lab-res-detail-links a{display:inline-flex;align-items:center;min-height:44px;padding:10px 14px;border:1px solid #927688a0;color:#e9c8b5;font-size:11px;line-height:1.5}",
".lab-res-detail-links a:hover{border-color:#dfad91}",
".lab-res-policy{display:grid;grid-template-columns:.9fr 1.1fr;gap:45px;margin-top:51px;padding:37px 0 0;border-top:1px solid #806c7b80}",
".lab-res-policy h2{margin:0;font:normal clamp(27px,3vw,39px)/1.15 var(--display)}",
".lab-res-policy p{margin:0 0 14px;font:15px/1.75 var(--display);color:#d3c6d5}",
".lab-res-policy a{color:#f0c3ab;text-decoration:underline;text-underline-offset:5px}",
"@media(max-width:800px){.lab-res-grid{grid-template-columns:1fr}.lab-res-preface,.lab-res-policy{grid-template-columns:1fr;gap:17px}.lab-res-heading{font-size:clamp(52px,8vw,76px)}.lab-res-media{height:230px}}",
"@media(max-width:530px){.lab-res-hero{min-height:325px}.lab-res-hero-inner{padding-block:47px 49px}.lab-res-heading{font-size:clamp(42px,10vw,59px);letter-spacing:.08em}.lab-res-hero-lead{font-size:22px}.lab-res-hero::before{background-position:55% center}.lab-res-main{padding-block:30px 60px}.lab-res-index{gap:9px;margin-bottom:25px}.lab-res-index a{padding:9px 12px;font-size:9px;min-height:44px}.lab-res-media{height:175px}.lab-res-card-copy{padding:21px}.lab-res-card-copy>p{min-height:0}.lab-res-policy{margin-top:35px}}",
"@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}"
].join("\n");
function card(p){
 const links=p.links.length?'<ul class="lab-res-detail-links">'+p.links.map(x=>'<li><a href="'+x.href+'">'+x.name+' <span aria-hidden="true">↗</span></a></li>').join("")+'</ul>':"";
 return '<article class="lab-res-card" id="research-'+p.id+'" aria-labelledby="research-title-'+p.id+'">'+
 '<div class="lab-res-media"><img src="'+BASE+'/assets/'+p.art+'" alt="" loading="lazy" width="560" height="360"><span class="lab-res-card-number">'+p.index+' / RESEARCH DIRECTION</span></div>'+
 '<div class="lab-res-card-copy"><span class="lab-res-card-label">'+p.eyebrow+'</span><h3 id="research-title-'+p.id+'">'+p.name+'</h3><p>'+p.summary+'</p>'+
 '<details class="lab-res-details"><summary>Open questions &amp; sources</summary><div class="lab-res-detail-copy"><strong>Question</strong><p>'+p.question+'</p><strong>Evidence status</strong><p>'+p.evidence+'</p>'+links+'</div></details></div></article>';
}
export function renderLaboratoryResearch(){
 const navResearch=BASE+"/research",navExperiments=BASE+"/experiments";
 const header='<header class="lab-header"><div class="lab-wrap lab-head-inner"><a class="lab-brand" href="/" aria-label="ANEVUM home">'+LAB_BRAND+'<span>ANEVUM</span></a>'+
 '<nav class="lab-nav" aria-label="Primary navigation"><a href="'+navExperiments+'">Experiments</a><a href="'+navResearch+'" aria-current="page">Research</a><a href="/#experiences">Experiences</a><a href="/original-works/archive">Archive</a><a href="/#contact">Contact</a></nav>'+
 '<details class="lab-mobile"><summary>Menu</summary><nav aria-label="Mobile navigation"><a href="'+navExperiments+'">Experiments</a><a href="'+navResearch+'" aria-current="page">Research</a><a href="/#experiences">Experiences</a><a href="/original-works/archive">Archive</a><a href="/#contact">Contact</a></nav></details></div></header>';
 const hero='<section class="lab-res-hero" aria-labelledby="research-heading"><div class="lab-wrap lab-res-hero-inner"><nav class="lab-res-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Research</span></nav><h1 id="research-heading" class="lab-res-heading">Research</h1><p class="lab-res-hero-lead">Questions before claims. Experiments before conclusions.</p></div></section>';
 const index='<nav class="lab-res-index" aria-label="Explore research directions">'+AREAS.map(p=>'<a href="#research-'+p.id+'">'+p.name+'</a>').join("")+'</nav>';
 const main='<main id="main" tabindex="-1">'+hero+'<div class="lab-wrap lab-res-main"><section aria-labelledby="directions-heading"><div class="lab-res-preface"><h2 id="directions-heading">Directions worth exploring</h2><p>This is a living index of questions, not a bibliography of completed studies. An available source repository is not a published or validated scientific result.</p></div>'+index+'<div class="lab-res-grid">'+AREAS.map(card).join("")+'</div></section>'+
 '<section class="lab-res-policy" id="evidence" aria-labelledby="evidence-heading"><h2 id="evidence-heading">The evidence standard</h2><div><p>Questions, prototypes, measurements and conclusions are different stages. ANEVUM will not label an idea a discovery, or repository activity a reproducible study.</p><p>Source pointers appear in individual directions when a public artifact exists. For tangible software, visit the <a href="'+navExperiments+'">Experiments directory</a>. Earlier creative material remains in <a href="/original-works/archive">Original Works</a>.</p></div></section></div></main>';
 const footer='<footer class="lab-footer" id="contact"><div class="lab-wrap lab-footer-inner"><p>ANEVUM — A laboratory for the possible. · Independent exploration</p><p>Created by <a href="https://devonakins.com">Devon Akins</a> · <a href="https://github.com/devonalanakins">Public work &amp; contact</a></p></div></footer>';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#09070d"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="ANEVUM Research: four exploratory questions in computation, systems, interaction and imagination. No unverified results."><title>Research | ANEVUM Living Laboratory</title><style>'+LAB_STYLES+CSS+'</style></head><body><a class="lab-skip" href="#main">Skip to content</a>'+header+main+footer+'</body></html>';
}
