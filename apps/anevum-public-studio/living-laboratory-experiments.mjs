import {LAB_STYLES,LAB_BRAND} from "./living-laboratory-home.mjs";
const PATH="/original-works/experiments";
const FILTERS=[["all","All work"],["software","Software"],["interactive","Interactive"],["archive","Archive"]];
const PROJECTS=[
 {name:"Rhen language",group:"software",type:"Experimental software",description:"An exploratory programming language examining how software can be expressed and developed.",image:"rhen-generative-v1.webp",url:"https://github.com/devonalanakins/rhen",action:"View source repository"},
 {name:"Brandle",group:"interactive",type:"Interactive system",description:"A five-letter browser word game: an exercise in accessible interaction and interface design.",image:"brandle-interactive-v1.webp",url:"https://github.com/devonalanakins/brandle",action:"View source repository"},
 {name:"Original Works",group:"archive",type:"Preserved creative work",description:"An earlier fictional universe and editorial material preserved in ANEVUM's public archive.",image:"original-worlds-v1.webp",url:"/original-works",action:"Visit the archive"}
];
const CSS=[
".lab-exp-hero{position:relative;isolation:isolate;overflow:hidden;min-height:335px;display:flex;align-items:center;border-bottom:1px solid var(--line);background:#100b17}",
".lab-exp-hero::before{content:'';position:absolute;inset:0;z-index:-2;background:center 44%/cover no-repeat url('/original-works/assets/lab-hero-v1.webp');opacity:.78}",
".lab-exp-hero::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#09070df7,#09070ddf 43%,#09070d35),linear-gradient(0deg,#09070d,transparent 59%)}",
".lab-exp-hero-inner{padding-block:55px 65px}",
".lab-exp-crumb{display:flex;gap:13px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#cda79d}",
".lab-exp-crumb a{text-decoration:underline;text-underline-offset:5px}",
".lab-exp-hero h1{font:normal clamp(47px,6.5vw,92px)/1 var(--display);letter-spacing:.13em;text-transform:uppercase;margin:20px 0 12px}",
".lab-exp-hero p{font:italic clamp(21px,2.5vw,31px)/1.4 var(--display);max-width:740px;margin:0;color:#e6d9e4}",
".lab-exp-main{padding-block:45px 90px}",
".lab-exp-summary{display:flex;justify-content:space-between;align-items:start;gap:20px;margin-bottom:24px}",
".lab-exp-summary p{font:15px/1.75 var(--display);max-width:740px;color:#d0c3d2;margin:0}",
".lab-exp-count{font-size:10px;letter-spacing:.17em;text-transform:uppercase;white-space:nowrap;color:#f1b99b}",
".lab-exp-filters{display:flex;flex-wrap:wrap;gap:9px;padding-bottom:23px;margin-bottom:26px;border-bottom:1px solid #87678075}",
".lab-exp-filter{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border:1px solid #89718a;padding:10px 18px;font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:700;color:#dccadf;transition:background .2s}",
".lab-exp-filter:hover{background:#3d2b40}",
".lab-exp-filter[aria-current='page']{border-color:#e2ae92;background:#3b2534;color:#f9ddca}",
".lab-exp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}",
".lab-exp-card{isolation:isolate;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;min-height:335px;padding:25px;border:1px solid #a28da073;background:#15101b;transition:transform .2s,border-color .2s}",
".lab-exp-card:hover{transform:translateY(-3px);border-color:#e8b596}",
".lab-exp-card::before{content:'';z-index:-2;position:absolute;inset:0;background:var(--art) center/cover no-repeat}",
".lab-exp-card::after{content:'';z-index:-1;position:absolute;inset:0;background:linear-gradient(0deg,#0b0810 0%,#0b0810d9 32%,#0b081070 62%,transparent)}",
".lab-exp-kind{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:#efb598;font-weight:700}",
".lab-exp-card h2{font:italic normal clamp(29px,2.8vw,42px)/1.13 var(--display);margin:10px 0}",
".lab-exp-card p{font:14px/1.65 var(--display);color:#e1d4e2;min-height:67px;margin:0}",
".lab-exp-go{margin-top:18px;padding-top:14px;border-top:1px solid #c9aec06c;display:flex;justify-content:space-between;align-items:center;color:#f5cbb3;font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:700}",
".lab-exp-go span{font-size:22px}",
".lab-exp-disclaimer{border-top:1px solid var(--line);padding-top:26px;margin-top:41px;font-size:13px;line-height:1.7;color:#c0b0c0}",
".lab-exp-disclaimer a{color:#f2c3a8;text-decoration:underline;text-underline-offset:4px}",
"@media(max-width:960px){.lab-exp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}",
"@media(max-width:650px){.lab-exp-hero{min-height:290px}.lab-exp-hero-inner{padding-block:40px}.lab-exp-hero h1{letter-spacing:.06em;font-size:clamp(39px,10vw,60px)}.lab-exp-summary{display:block}.lab-exp-count{display:block;margin-top:15px}.lab-exp-filter{font-size:9px;padding:9px 13px}.lab-exp-grid{grid-template-columns:1fr}.lab-exp-card{min-height:310px}.lab-exp-card p{min-height:0}.lab-exp-main{padding-block:34px 60px}}",
"@media(prefers-reduced-motion:reduce){.lab-exp-card,.lab-exp-filter{transition:none}}"
].join("\n");
function card(p){
 return '<a class="lab-exp-card" href="'+p.url+'" style="--art:url('+"'"+'/original-works/assets/'+p.image+"'"+')" aria-label="'+p.name+': '+p.action+'"><span class="lab-exp-kind">'+p.type+'</span><h2>'+p.name+'</h2><p>'+p.description+'</p><span class="lab-exp-go">'+p.action+' <span aria-hidden="true">→</span></span></a>';
}
export function renderLaboratoryExperiments(filter="all"){
 const active=FILTERS.some(f=>f[0]===filter)?filter:"all";
 const items=active==="all"?PROJECTS:PROJECTS.filter(x=>x.group===active);
 const label=FILTERS.find(x=>x[0]===active)[1];
 const nav=FILTERS.map(f=>'<a class="lab-exp-filter" href="'+PATH+(f[0]==="all"?"":"?theme="+f[0])+'"'+(f[0]===active?' aria-current="page"':"")+'>'+f[1]+'</a>').join("");
 const header='<header class="lab-header"><div class="lab-wrap lab-head-inner"><a class="lab-brand" href="/" aria-label="ANEVUM home">'+LAB_BRAND+'<span>ANEVUM</span></a><nav class="lab-nav" aria-label="Primary navigation"><a href="'+PATH+'" aria-current="page">Experiments</a><a href="/#research">Research</a><a href="/#experiences">Experiences</a><a href="/original-works">Archive</a><a href="/#contact">Contact</a></nav><details class="lab-mobile"><summary>Menu</summary><nav aria-label="Mobile navigation"><a href="'+PATH+'" aria-current="page">Experiments</a><a href="/#research">Research</a><a href="/#experiences">Experiences</a><a href="/original-works">Archive</a><a href="/#contact">Contact</a></nav></details></div></header>';
 const hero='<section class="lab-exp-hero" aria-labelledby="experiments-title"><div class="lab-wrap lab-exp-hero-inner"><nav class="lab-exp-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Experiments</span></nav><h1 id="experiments-title">Experiments</h1><p>Selected exploratory work across software, interactive systems and imagined worlds.</p></div></section>';
 const main='<main id="main" tabindex="-1">'+hero+'<section class="lab-wrap lab-exp-main" aria-label="Experiments collection"><div class="lab-exp-summary"><p>Real projects and preserved creative work. Entries appear only when there is a public project or archive to visit.</p><span class="lab-exp-count" role="status">'+items.length+' '+(items.length===1?"entry":"entries")+' · '+label+'</span></div><nav class="lab-exp-filters" aria-label="Filter experiments">'+nav+'</nav><div class="lab-exp-grid">'+items.map(card).join("")+'</div><p class="lab-exp-disclaimer">Artwork is illustrative and is not a product screenshot. <a href="https://github.com/devonalanakins">Browse public source</a> or <a href="/">return to ANEVUM</a>.</p></section></main>';
 const footer='<footer id="contact" class="lab-footer"><div class="lab-wrap lab-footer-inner"><p>ANEVUM · A laboratory for the possible.</p><p>Created by <a href="https://devonakins.com">Devon Akins</a> · <a href="https://github.com/devonalanakins">Source &amp; contact</a></p></div></footer>';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#09070d"><meta name="robots" content="noindex,nofollow,noarchive"><title>Experiments | ANEVUM</title><meta name="description" content="Selected ANEVUM experimental software, interactive systems and preserved creative work."><style>'+LAB_STYLES+CSS+'</style></head><body><a class="lab-skip" href="#main">Skip to content</a>'+header+main+footer+'</body></html>';
}
