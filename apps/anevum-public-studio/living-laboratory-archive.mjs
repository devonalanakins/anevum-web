/**
 * ANEVUM.WEB.ARCHIVE.2026-11-12.001 — standalone public Archive index.
 * Navigation points only to seven reviewed Original Works routes. All legacy
 * pages keep their original content and are not duplicated into this index.
 * Decorative artwork is from approved, repository-hosted image references.
 */
import {LAB_STYLES,LAB_BRAND} from "./living-laboratory-home.mjs";

const ROOT="/original-works";
const INDEX=ROOT+"/archive";
const LEGACY=Object.freeze([
 {slug:"",name:"Original Works",index:"01",category:"Start here",description:"The original editorial entrance to REPLY and The Transcosmic."},
 {slug:"works",name:"Works",index:"02",category:"Collection",description:"An intentionally small collection, led by one featured novel."},
 {slug:"reply",name:"REPLY",index:"03",category:"Featured novel",description:"The first novel of The Transcosmic. An author revision is in progress."},
 {slug:"transcosmic",name:"The Transcosmic",index:"04",category:"Imagined universe",description:"The public introduction to a fictional setting connecting stories."},
 {slug:"wiki",name:"Encyclopedia",index:"05",category:"Reference preview",description:"A reader-first reference area under editorial review."},
 {slug:"journal",name:"Studio Journal",index:"06",category:"Process",description:"A look at writing, research and worldbuilding in progress."},
 {slug:"about",name:"About the studio",index:"07",category:"Origins",description:"The independent studio behind the earlier creative work."}
]);
const href=slug=>slug?ROOT+"/"+slug:ROOT;
const CSS=[
".lab-arc-hero{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;min-height:390px;background:#0e0b15;border-bottom:1px solid #987b9170}",
".lab-arc-hero::before{content:'';position:absolute;inset:0;z-index:-2;background:url('/original-works/assets/lab-archive-v1.webp') center 42%/cover no-repeat;opacity:.93}",
".lab-arc-hero::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#0b0810fa 0%,#100c17ec 34%,#0b081090 70%,#0c09104c),linear-gradient(0deg,#09070df9 0%,transparent 65%)}",
".lab-arc-hero-inner{padding-block:65px 72px}",
".lab-arc-breadcrumb{display:flex;gap:11px;align-items:center;color:#e7b59d;font-size:10px;letter-spacing:.2em;text-transform:uppercase}",
".lab-arc-breadcrumb a{text-decoration:underline;text-underline-offset:5px}",
".lab-arc-hero h1{font:normal clamp(50px,7vw,100px)/.97 var(--display);letter-spacing:.14em;text-transform:uppercase;margin:24px 0 15px}",
".lab-arc-hero p{font:italic clamp(23px,2.8vw,37px)/1.35 var(--display);max-width:740px;color:#eadce7;margin:0}",
".lab-arc-main{padding-block:43px 84px}",
".lab-arc-intro{display:grid;grid-template-columns:1fr 1fr;gap:45px;padding-bottom:25px;border-bottom:1px solid #87698288}",
".lab-arc-intro h2{font:normal clamp(30px,3.5vw,45px)/1.1 var(--display);margin:0}",
".lab-arc-intro p{font:15px/1.75 var(--display);margin:0;color:#d4c5d5}",
".lab-arc-label{display:block;color:#e3b196;font-size:10px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;margin-bottom:14px}",
".lab-arc-highlights{display:grid;grid-template-columns:1.2fr 1fr;gap:18px;margin:33px 0 54px}",
".lab-arc-feature{position:relative;isolation:isolate;overflow:hidden;min-width:0;min-height:375px;border:1px solid #a78aa187;display:flex;flex-direction:column;justify-content:flex-end;padding:27px 31px;background:#231b28;transition:transform .22s,border-color .22s}",
".lab-arc-feature::before{content:'';position:absolute;inset:0;z-index:-2;background:var(--art) center/cover no-repeat}",
".lab-arc-feature::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,#09070dfb 0%,#0b0810e3 30%,#0b08106a 66%,transparent 95%)}",
".lab-arc-feature:hover{transform:translateY(-3px);border-color:#e8b096}",
".lab-arc-feature h3{font:italic normal clamp(38px,4.1vw,62px)/1.1 var(--display);margin:8px 0 10px}",
".lab-arc-feature p{font:15px/1.7 var(--display);color:#e7dce8;max-width:440px;margin:0 0 21px}",
".lab-arc-link{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #cfb2c369;padding-top:15px;color:#f3c2a6;text-transform:uppercase;font-size:10px;letter-spacing:.16em;font-weight:750}",
".lab-arc-link span{font-size:21px;line-height:1}",
".lab-arc-feature:focus-visible,.lab-arc-entry:focus-visible{outline:2px solid #f2c3a2;outline-offset:5px}",
".lab-arc-section-head{display:flex;justify-content:space-between;gap:25px;align-items:end;margin:0 0 20px}",
".lab-arc-section-head h2{font:normal clamp(30px,3.1vw,46px)/1.1 var(--display);margin:0}",
".lab-arc-section-head p{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#d4af9d;margin:0;white-space:nowrap}",
".lab-arc-list{list-style:none;margin:0;padding:0;border-top:1px solid #957b8e72}",
".lab-arc-entry{display:grid;grid-template-columns:45px minmax(0,1.05fr) minmax(0,1.55fr) 30px;gap:23px;align-items:center;min-height:100px;padding:22px 12px;border-bottom:1px solid #957b8e72;transition:background .2s}",
".lab-arc-entry:hover{background:#2b1d2a8c}",
".lab-arc-number{color:#e7b29a;font-size:11px;letter-spacing:.13em}",
".lab-arc-entry-title{font:normal clamp(20px,2.1vw,29px)/1.14 var(--display)}",
".lab-arc-entry-copy{color:#c7b9c8;font:13px/1.5 var(--display);margin:0}",
".lab-arc-entry-copy strong{font:700 9px/1.5 var(--sans);text-transform:uppercase;letter-spacing:.17em;color:#ddb69e;display:block;margin-bottom:5px}",
".lab-arc-entry-arrow{font-size:22px;color:#edbc9c;text-align:right}",
".lab-arc-note{display:grid;grid-template-columns:1fr 1.2fr;gap:35px;padding:36px 0 0;margin-top:46px;border-top:1px solid #967e9280}",
".lab-arc-note h2{font:normal clamp(27px,2.8vw,38px)/1.2 var(--display);margin:0}",
".lab-arc-note p{font:14px/1.75 var(--display);color:#cfc0d1;margin:0 0 14px}",
".lab-arc-note a{color:#f0c0aa;text-decoration:underline;text-underline-offset:5px}",
"@media(max-width:860px){.lab-arc-intro,.lab-arc-note{grid-template-columns:1fr;gap:18px}.lab-arc-highlights{grid-template-columns:1fr 1fr}.lab-arc-feature{min-height:320px;padding:22px}.lab-arc-entry{grid-template-columns:35px 1fr 32px;gap:14px}.lab-arc-entry-copy{grid-column:2;grid-row:2}.lab-arc-entry-arrow{grid-column:3;grid-row:1 / span 2}}",
"@media(max-width:620px){.lab-arc-hero{min-height:330px}.lab-arc-hero-inner{padding-block:47px 50px}.lab-arc-hero h1{letter-spacing:.085em;font-size:clamp(42px,10.5vw,63px)}.lab-arc-hero p{font-size:clamp(21px,5.2vw,28px)}.lab-arc-main{padding-block:30px 62px}.lab-arc-highlights{grid-template-columns:1fr;margin:25px 0 39px}.lab-arc-feature{min-height:315px}.lab-arc-feature h3{font-size:40px}.lab-arc-section-head h2{font-size:31px}.lab-arc-section-head p{font-size:9px}.lab-arc-entry{min-height:90px;padding-inline:3px}.lab-arc-entry-title{font-size:23px}.lab-arc-entry-copy{font-size:12px}}",
"@media(prefers-reduced-motion:reduce){.lab-arc-feature,.lab-arc-entry{transition:none}}"
].join("\n");
function spotlight(slug,name,caption,text,art,cta){
 return '<a class="lab-arc-feature" href="'+href(slug)+'" style="--art:url('+"'"+ROOT+'/assets/'+art+"'"+')" aria-label="'+cta+' — '+name+'">'+
 '<span class="lab-arc-label">'+caption+'</span><h3>'+name+'</h3><p>'+text+'</p>'+
 '<span class="lab-arc-link">'+cta+' <span aria-hidden="true">↗</span></span></a>';
}
function entry(item){
 return '<li><a class="lab-arc-entry" href="'+href(item.slug)+'"><span class="lab-arc-number">'+item.index+'</span>'+
 '<span class="lab-arc-entry-title">'+item.name+'</span><p class="lab-arc-entry-copy"><strong>'+item.category+'</strong>'+item.description+'</p><span class="lab-arc-entry-arrow" aria-hidden="true">↗</span></a></li>';
}
export function renderLivingLaboratoryArchive(){
 const navIndex=ROOT+"/archive";
 const header='<header class="lab-header"><div class="lab-wrap lab-head-inner"><a class="lab-brand" href="/" aria-label="ANEVUM home">'+LAB_BRAND+'<span>ANEVUM</span></a>'+
 '<nav class="lab-nav" aria-label="Primary navigation"><a href="'+ROOT+'/experiments">Experiments</a><a href="'+ROOT+'/research">Research</a><a href="/#experiences">Experiences</a><a href="'+navIndex+'" aria-current="page">Archive</a><a href="/#contact">Contact</a></nav>'+
 '<details class="lab-mobile"><summary>Menu</summary><nav aria-label="Mobile navigation"><a href="'+ROOT+'/experiments">Experiments</a><a href="'+ROOT+'/research">Research</a><a href="/#experiences">Experiences</a><a href="'+navIndex+'" aria-current="page">Archive</a><a href="/#contact">Contact</a></nav></details></div></header>';
 const hero='<section class="lab-arc-hero" aria-labelledby="archive-heading"><div class="lab-wrap lab-arc-hero-inner"><nav aria-label="Breadcrumb" class="lab-arc-breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Archive</span></nav><h1 class="lab-arc-heading" id="archive-heading">Archive</h1><p>Earlier worlds. Preserved paths. An open door to the work that came before.</p></div></section>';
 const featured='<div class="lab-arc-highlights" aria-label="Featured original works">'+
 spotlight("reply","REPLY","Featured work / novel","The first novel of The Transcosmic. The public preview is available; an author revision is in progress.","original-worlds-v1.webp","Explore the novel")+
 spotlight("transcosmic","The Transcosmic","Imagined universe","A public introduction to the fictional universe behind the original stories.","lab-archive-v1.webp","Enter the universe")+'</div>';
 const main='<main id="main" tabindex="-1">'+hero+'<div class="lab-wrap lab-arc-main"><section class="lab-arc-intro" aria-labelledby="archive-intro-title"><div><span class="lab-arc-label">Original Works / preserved public edition</span><h2 id="archive-intro-title">The record remains.</h2></div><p>ANEVUM now explores software, computation and creative systems. Its earlier literary world is still accessible here: the original public pages, preserved as a separate editorial edition—not rewritten as new releases.</p></section>'+featured+
 '<section aria-labelledby="archive-index-title"><div class="lab-arc-section-head"><h2 id="archive-index-title">Explore the original edition</h2><p>'+LEGACY.length+' public sections</p></div><ol class="lab-arc-list">'+LEGACY.map(entry).join("")+'</ol></section>'+
 '<section class="lab-arc-note" aria-labelledby="archive-note-title"><h2 id="archive-note-title">Preserved, not republished.</h2><div><p>These links open the previous Original Works experience. The novel, encyclopedia and universe remain subject to the editorial notes shown on their own pages; this index does not certify a finished manuscript, complete canon or publication date.</p><p>Imagery on this page is illustrative design artwork, not canonical story art. <a href="/">Return to the Living Laboratory</a> or explore the <a href="'+ROOT+'/experiments">Experiments directory</a>.</p></div></section></div></main>';
 const footer='<footer class="lab-footer" id="contact"><div class="lab-wrap lab-footer-inner"><p>ANEVUM — Original Works archive · An independent studio</p><p>Created by <a href="https://devonakins.com">Devon Akins</a> · <a href="'+ROOT+'">Original edition</a></p></div></footer>';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#09070d"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="description" content="Navigate the seven preserved ANEVUM Original Works pages: REPLY, The Transcosmic, studio journal and more."><title>Archive | ANEVUM Living Laboratory</title><style>'+LAB_STYLES+CSS+'</style></head><body><a href="#main" class="lab-skip">Skip to content</a>'+header+main+footer+'</body></html>';
}
