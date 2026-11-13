import {readFileSync} from "node:fs";
import {LAB_ART} from "../apps/anevum-public-studio/living-laboratory-art.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import worker from "../apps/anevum-public-studio/worker.mjs";

const root="https://anevum.com/original-works";
const pages=["","/works","/reply","/transcosmic","/wiki","/journal","/about"];
const req=(path="",init={})=>worker.fetch(new Request(root+path,init));
const internalLinks=html=>[...html.matchAll(/href="(\/original-works(?:\/[a-z-]+)?)"/g)].map(m=>m[1]);

test("public Worker deployment config stays route-free, binding-free and pinned",()=>{
 const config=JSON.parse(readFileSync(new URL("../wrangler.anevum-public-studio.jsonc",import.meta.url),"utf8"));
 assert.deepEqual(config,{
  name:"anevum-original-works-public",
  main:"./apps/anevum-public-studio/worker.mjs",
  compatibility_date:"2026-10-28",
  workers_dev:false,
  preview_urls:false
 });
 // Any new Cloudflare routes, secrets, bindings, cron or assets require review.
});

test("approved image assets are byte-identical to reviewed source WebP and served by same-origin Worker",async()=>{
 const names=["lab-hero","rhen-generative","brandle-interactive","original-worlds","research-generation","research-computation","research-worlds","research-imagination","lab-archive"].map(x=>x+"-v1.webp");
 assert.deepEqual(Object.keys(LAB_ART).sort(),names.slice().sort());
 for(const name of names){
  const actual=Buffer.from(LAB_ART[name],"base64");
  const file=readFileSync(new URL("../apps/anevum-public-studio/art/"+name,import.meta.url));
  assert.deepEqual(actual,file,"Generated Worker image differs from source "+name);
  assert.equal(actual.toString("ascii",0,4),"RIFF");
  assert.equal(actual.toString("ascii",8,12),"WEBP");
  const url="https://anevum.com/original-works/assets/"+name;
  const response=await worker.fetch(new Request(url));
  assert.equal(response.status,200,name);
  assert.equal(response.headers.get("Content-Type"),"image/webp");
  assert.match(response.headers.get("Cache-Control"),/immutable/);
  assert.equal(response.headers.get("X-Content-Type-Options"),"nosniff");
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),actual);
  const head=await worker.fetch(new Request(url,{method:"HEAD"}));
  assert.equal(head.status,200);
  assert.equal((await head.arrayBuffer()).byteLength,0);
  assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(response.headers));
 }
 for(const url of ["https://anevum.com/original-works/assets/missing.webp","https://anevum.com/original-works/assets/../staff","https://example.com/original-works/assets/lab-hero-v1.webp","http://anevum.com/original-works/assets/lab-hero-v1.webp"]){
  assert.equal((await worker.fetch(new Request(url))).status,404,url);
 }
 assert.equal((await worker.fetch(new Request("https://anevum.com/original-works/assets/lab-hero-v1.webp",{method:"POST",body:"x"}))).status,405);
});

test("all seven V2 routes contain one accessible editorial page, correct links and security headers",async()=>{
 for(const path of pages){
  const response=await req(path);
  assert.equal(response.status,200,path);
  assert.equal(response.headers.get("Content-Type"),"text/html; charset=utf-8");
  assert.equal(response.headers.get("X-Anevum-Surface"),"anevum-original-works-public-v3-root");
  assert.match(response.headers.get("X-Robots-Tag"),/noindex.*noarchive/);
  assert.match(response.headers.get("Content-Security-Policy"),/default-src 'none'/);
  const body=await response.text();
  assert.match(body,/<html lang="en">/);
  assert.match(body,/<main id="main" tabindex="-1">/);
  assert.equal((body.match(/<h1\b/g)||[]).length,1,path);
  assert.match(body,/<nav class="nav navigation desktop-nav" aria-label="Primary navigation">/);
  assert.match(body,/<details class="mobile-menu"><summary>Menu<\/summary>/);
  assert.match(body,/href="\/original-works\/reply"/);
  assert.doesNotMatch(body,/<script\b|<iframe\b|<form\b|<input\b|\bonclick=|\bonload=/i);
  assert.doesNotMatch(body,/Ovara|Nali Solan|Merva|Skygate|staff\/command|api\/v1\/member/i);
  for(const href of internalLinks(body)){
   const route=href.slice("/original-works".length);
   assert.ok(pages.includes(route),path+" contains broken link "+href);
  }
 }
});

test("visual publication stays separated from reader canon and manuscript",async()=>{
 const wiki=await (await req("/wiki")).text();
 assert.match(wiki,/Canon articles remain under editorial review/);
 assert.match(wiki,/Articles not yet published/i);
 assert.doesNotMatch(wiki,/22 articles|408 entries|chronology|in-world written records/i);
 const reply=await (await req("/reply")).text();
 assert.match(reply,/Revision in progress|author revision/i);
 assert.doesNotMatch(reply,/purchase now|preorder now|buy now/i);
});

test("strict host, route, method isolation preserves current apex and APIs",async()=>{
 for(const p of ["/foo","-private","/api","/wiki/ovara","/../../staff"]){
  assert.equal((await req(p)).status,404,p);
 }
 for(const url of ["https://anevum.com/staff","https://backstage.anevum.com/original-works","https://example.com/original-works","http://anevum.com/original-works"]){
  assert.equal((await worker.fetch(new Request(url))).status,404,url);
 }
 const post=await req("",{method:"POST",body:"test"});
 assert.equal(post.status,405);
 assert.equal(post.headers.get("Allow"),"GET, HEAD");
});

test("HEAD responses are bodyless and have the same headers as GET",async()=>{
 for(const path of pages){
  const head=await req(path,{method:"HEAD"});
  const get=await req(path);
  assert.equal(head.status,200);
  assert.equal(await head.text(),"");
  assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(get.headers));
 }
});

test("no third party URLs, sessions, automatic scripts or indexing until editorial approval",async()=>{
 const body=await (await req()).text();
 assert.doesNotMatch(body,/<link[^>]+rel="canonical"|<script\b|https?:\/\/[^\s"'<>]+/i);
 assert.doesNotMatch(body,/\bauth\b|\bsecret\b|\btoken\b|\bcookie\b|purchase now|preorder now/i);
 assert.match(body,/Public design edition/);
 assert.match(body,/<meta name="robots" content="noindex,nofollow,noarchive"/);
});


test("the entire public experience has a real, accessible editorial reading path",async()=>{
 const slugs=["","/works","/reply","/transcosmic","/wiki","/journal","/about"];
 for(let index=0;index<slugs.length;index++){
  const html=await (await req(slugs[index])).text();
  const journey=html.match(/<nav class="journey" aria-label="Continue exploring">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(journey,"Missing reading-path landmark for "+slugs[index]);
  const next=journey.match(/<a class="journey-next" href="([^"]+)"/)?.[1];
  const expected=index===slugs.length-1?"/":root.replace("https://anevum.com","")+slugs[index+1];
  assert.equal(next,expected,"The next destination must always be a real public page");
  const previous=journey.match(/<a class="journey-prev" href="([^"]+)"/)?.[1];
  if(index===0)assert.equal(previous,undefined,"First page should not invent a previous chapter");
  else assert.equal(previous,index===1?"/":"/original-works"+slugs[index-1]);
  assert.match(journey,new RegExp('role="img" aria-label="Section '+(index+1)+' of 7"'));
  assert.equal((journey.match(/class="now"/g)||[]).length,1,"Exactly one current section marker");
  assert.equal((journey.match(/class="past"/g)||[]).length,index,"Earlier markers only");
  assert.equal((journey.match(/class="upcoming"/g)||[]).length,6-index,"Future markers only");
  for(const href of internalLinks(journey)){
   const route=href.slice("/original-works".length);
   assert.ok(slugs.includes(route),"The reading path links to an unavailable route: "+href);
  }
  assert.doesNotMatch(journey,/Ovara|Nali Solan|Skygate|manuscript|retailer available/i);
 }
});

test("the reading path preserves server-only rendering and noindex publishing boundaries",async()=>{
 const response=await req("/about");
 const html=await response.text();
 assert.match(html,/<nav class="journey" aria-label="Continue exploring">/);
 assert.match(html,/Back to the beginning/);
 assert.match(html,/href="\/"/);
 assert.doesNotMatch(html,/<script\b|onkeydown=|onclick=|aria-live=/i);
 assert.equal(response.headers.get("X-Anevum-Surface"),"anevum-original-works-public-v3-root");
 assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
});


test("REPLY editorial page presents approved work context, genuine on-page navigation and labelled concept art",async()=>{
 const response=await req("/reply");
 const html=await response.text();
 assert.equal(response.status,200);
 assert.match(html,/<section class="page active reply-page" data-page="reply" aria-label="REPLY novel">/);
 assert.match(html,/<h1 class="display">A signal\.<br><em>A human answer\.<\/em><\/h1>/);
 const nav=html.match(/<nav class="reply-quick-nav" aria-label="Explore REPLY on this page">([\s\S]*?)<\/nav>/)?.[1];
 assert.ok(nav,"REPLY must offer a useful page-local reading index");
 const destinations=[...nav.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(destinations,["reply-work","reply-edition","reply-universe"]);
 for(const id of destinations){
  assert.match(html,new RegExp('id="'+id+'"'),"Missing on-page anchor "+id);
 }
 assert.match(html,/<figure class="reply-art">/);
 assert.match(html,/class="book-3d reply-book" role="img" aria-label="REPLY typographic book cover concept\. This is not an approved final publication cover\."/);
 assert.match(html,/<figcaption>Art direction study[\s\S]*?Not a final approved cover<\/figcaption>/);
 assert.match(html,/<dl class="reply-facts" aria-label="About the novel">/);
 assert.match(html,/<dt>Author<\/dt><dd>Devon Akins<\/dd>/);
 assert.match(html,/<dt>Universe<\/dt><dd>The Transcosmic<\/dd>/);
 assert.match(html,/<dt>Placement<\/dt><dd>Book one<\/dd>/);
 assert.match(html,/<section class="reply-edition-panel" id="reply-edition" aria-labelledby="reply-edition-heading">/);
 assert.match(html,/A revised-edition release date and purchasing details have not been confirmed/);
 assert.match(html,/<section class="reply-universe" id="reply-universe" aria-labelledby="reply-universe-heading">/);
 assert.doesNotMatch(html,/preorder|buy now|available to purchase|ISBN|retailer/i);
 assert.doesNotMatch(html,/Ovara|Nali Solan|Skygate|Merva|staff\/command|api\/v1\/member/i);
 assert.doesNotMatch(html,/<script\b|<iframe\b|<form\b|<input\b|onload=|onclick=/i);
});

test("REPLY edition/illustration update leaves all other pages and publication security boundaries intact",async()=>{
 const home=await (await req("")).text();
 assert.doesNotMatch(home,/<nav class="reply-quick-nav"|class="reply-edition-panel"|class="reply-art-stage"/);
 for(const slug of ["","/works","/reply","/transcosmic","/wiki","/journal","/about"]){
  const response=await req(slug);
  const html=await response.text();
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.match(html,/aria-label="Continue exploring"/);
  assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
  assert.match(response.headers.get("Content-Security-Policy"),/default-src 'none'/);
  for(const href of internalLinks(html)){
   const relative=href.slice("/original-works".length);
   assert.ok(pages.includes(relative),"Broken public page route: "+href);
  }
 }
});


test("laboratory apex is a truthful independent studio while legacy reader home stays intact",async()=>{
 const rootRes=await worker.fetch(new Request("https://anevum.com/"));
 const legacyRes=await req("");
 assert.equal(rootRes.status,200);
 assert.equal(legacyRes.status,200);
 assert.equal(rootRes.headers.get("X-Anevum-Surface"),"anevum-original-works-public-v3-root");
 assert.match(rootRes.headers.get("X-Robots-Tag"),/noindex/);
 assert.match(rootRes.headers.get("Content-Security-Policy"),/default-src 'none'/);
 const rootHtml=await rootRes.text(), legacyHtml=await legacyRes.text();
 assert.notEqual(rootHtml,legacyHtml,"The new apex must not overwrite archived Original Works");
 assert.match(legacyHtml,/<title>Anevum \| Original Works &amp; The Transcosmic<\/title>/);
 assert.match(legacyHtml,/Somewhere,/);
 assert.match(rootHtml,/<title>ANEVUM \| A laboratory for the possible<\/title>/);
 assert.match(rootHtml,/<h1 id="lab-home-title" class="lab-heading">ANEVUM<\/h1>/);
 assert.match(rootHtml,/A laboratory for the possible/);
 assert.match(rootHtml,/Created by Devon Akins/);
 assert.match(rootHtml,/<nav class="lab-nav" aria-label="Primary navigation">/);
 assert.match(rootHtml,/<details class="lab-mobile"><summary>Menu<\/summary>/);
 assert.match(rootHtml,/href="\/original-works\/archive"/);
 assert.match(rootHtml,/href="\/original-works\/experiments"/);
 assert.match(rootHtml,/href="\/original-works\/research"/);
 assert.match(rootHtml,/href="https:\/\/github.com\/devonalanakins\/rhen"/);
 assert.match(rootHtml,/prefers-reduced-motion:reduce/);
 assert.match(rootHtml,/original-works\/assets\/lab-hero-v1\.webp/);
 assert.match(rootHtml,/original-works\/assets\/rhen-generative-v1\.webp/);
 assert.match(rootHtml,/original-works\/assets\/brandle-interactive-v1\.webp/);
 assert.match(rootHtml,/original-works\/assets\/original-worlds-v1\.webp/);
 assert.match(rootHtml,/research-imagination-v1\.webp/);
 assert.equal((rootHtml.match(/<h1\b/g)||[]).length,1);
 const links=[...rootHtml.matchAll(/href="#([a-z-]+)"/g)].map(m=>m[1]);
 for(const anchor of links)assert.match(rootHtml,new RegExp('id="'+anchor+'"'),"Missing local anchor "+anchor);
 assert.doesNotMatch(rootHtml,/<script\b|<iframe\b|<form\b|<input\b|onload=|onclick=/i);
 assert.doesNotMatch(rootHtml,/Skygate|Nali Solan|Ovara|manuscript|medical records|fake metrics/i);
});


test("real Experiments route filters a small verified public catalog with no client scripts",async()=>{
 const experiments="/original-works/experiments";
 const response=await worker.fetch(new Request("https://anevum.com"+experiments));
 assert.equal(response.status,200);
 assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
 assert.match(response.headers.get("Content-Security-Policy"),/default-src 'none'/);
 const body=await response.text();
 assert.match(body,/<h1 id="experiments-title">Experiments<\/h1>/);
 assert.match(body,/3 entries · All work/);
 assert.equal((body.match(/class="lab-exp-card"/g)||[]).length,3);
 for(const name of ["Rhen language","Brandle","Original Works"])assert.match(body,new RegExp(name));
 assert.match(body,/aria-label="Filter experiments"/);
 assert.match(body,/aria-current="page">All work<\/a>/);
 assert.match(body,/Artwork is illustrative and is not a product screenshot/);
 assert.doesNotMatch(body,/<script\b|<iframe\b|<form\b|onload=|onclick=/i);
 const groups={software:"Rhen language",interactive:"Brandle",archive:"Original Works"};
 for(const [key,title] of Object.entries(groups)){
  const res=await worker.fetch(new Request("https://anevum.com"+experiments+"?theme="+key));
  assert.equal(res.status,200);
  const html=await res.text();
  assert.match(html,new RegExp(title));
  assert.equal((html.match(/class="lab-exp-card"/g)||[]).length,1);
  assert.match(html,/1 entry ·/);
  assert.match(html,new RegExp('href="'+experiments+'\\?theme='+key+'" aria-current="page"'));
  for(const other of Object.values(groups).filter(n=>n!==title))assert.doesNotMatch(html,new RegExp('<h2>'+other+'</h2>'));
  assert.equal((await worker.fetch(new Request("https://anevum.com"+experiments+"?theme="+key,{method:"HEAD"}))).status,200);
 }
 const malicious=await (await worker.fetch(new Request("https://anevum.com"+experiments+"?theme=%3Cscript%3E"))).text();
 assert.match(malicious,/3 entries · All work/);
 assert.doesNotMatch(malicious,/<script>|%3Cscript%3E/);
 const extra=await worker.fetch(new Request("https://anevum.com"+experiments+"/private"));
 assert.equal(extra.status,404);
 assert.equal((await worker.fetch(new Request("https://anevum.com"+experiments,{method:"POST",body:"x"}))).status,405);
 const header=await worker.fetch(new Request("https://anevum.com"+experiments,{method:"HEAD"}));
 assert.equal((await header.text()).length,0);
 assert.deepEqual(Object.fromEntries(header.headers),Object.fromEntries(response.headers));
});

test("public Research directory is evidence-honest, accessible and isolated from legacy routes",async()=>{
 const path="/original-works/research";
 const res=await worker.fetch(new Request("https://anevum.com"+path));
 assert.equal(res.status,200);
 assert.match(res.headers.get("X-Robots-Tag"),/noindex/);
 assert.match(res.headers.get("Content-Security-Policy"),/default-src 'none'/);
 assert.equal(res.headers.get("X-Anevum-Surface"),"anevum-original-works-public-v3-root");
 const html=await res.text();
 assert.match(html,/<title>Research \| ANEVUM Living Laboratory<\/title>/);
 assert.match(html,/<h1 id="research-heading" class="lab-res-heading">Research<\/h1>/);
 assert.match(html,/Questions before claims/);
 assert.match(html,/No public study or validated finding is claimed/);
 assert.match(html,/Evidence status/);
 assert.match(html,/aria-label="Explore research directions"/);
 assert.match(html,/aria-label="Primary navigation"/);
 assert.match(html,/aria-label="Mobile navigation"/);
 assert.match(html,/aria-current="page">Research<\/a>/);
 const ids=["generation","representation","interaction","imagination"];
 assert.equal((html.match(/class="lab-res-card"/g)||[]).length,ids.length);
 assert.equal((html.match(/class="lab-res-details"/g)||[]).length,ids.length);
 for(const id of ids){
  assert.match(html,new RegExp('id="research-'+id+'"'));
  assert.match(html,new RegExp('href="#research-'+id+'"'));
 }
 for(const asset of ["research-generation","research-computation","research-worlds","research-imagination"]){
  assert.match(html,new RegExp('/original-works/assets/'+asset+'-v1\\.webp'));
 }
 for(const source of ["https://github.com/devonalanakins/invariant","https://github.com/devonalanakins/rhen","https://github.com/devonalanakins/brandle"]){
  assert.ok(html.includes('href="'+source+'"'),"Missing verified public pointer "+source);
 }
 assert.match(html,/href="\/original-works\/archive"/);
 assert.match(html,/href="\/original-works\/experiments"/);
 assert.match(html,/An available source repository is not a published or validated scientific result/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.doesNotMatch(html,/<script\b|<iframe\b|<form\b|onload=|onclick=|onerror=/i);
 assert.doesNotMatch(html,/clinical patient|medical record|research participant data|peer.reviewed publication|proven compression result/i);
 const getWithQuery=await (await worker.fetch(new Request("https://anevum.com"+path+"?topic=%3Cscript%3E"))).text();
 assert.equal(getWithQuery,html,"Untrusted query strings must not affect research content");
 const head=await worker.fetch(new Request("https://anevum.com"+path,{method:"HEAD"}));
 assert.equal(head.status,200);
 assert.equal((await head.arrayBuffer()).byteLength,0);
 assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(res.headers));
 assert.equal((await worker.fetch(new Request("https://anevum.com"+path,{method:"POST",body:"x"}))).status,405);
 for(const unknown of [path+"/draft",path+"/private","/research"]){
  assert.equal((await worker.fetch(new Request("https://anevum.com"+unknown))).status,404,unknown);
 }
});

test("Archive index links to all seven preserved Original Works routes without rewriting them",async()=>{
 const route="/original-works/archive";
 const res=await worker.fetch(new Request("https://anevum.com"+route));
 assert.equal(res.status,200);
 assert.match(res.headers.get("X-Robots-Tag"),/noindex/);
 assert.match(res.headers.get("Content-Security-Policy"),/default-src 'none'/);
 assert.equal(res.headers.get("X-Anevum-Surface"),"anevum-original-works-public-v3-root");
 const html=await res.text();
 assert.match(html,/<title>Archive \| ANEVUM Living Laboratory<\/title>/);
 assert.match(html,/<h1 class="lab-arc-heading" id="archive-heading">Archive<\/h1>/);
 assert.match(html,/Preserved, not republished/);
 assert.match(html,/7 public sections/);
 assert.match(html,/Original Works \/ preserved public edition/);
 assert.match(html,/Imagery on this page is illustrative design artwork/);
 assert.match(html,/aria-current="page">Archive<\/a>/);
 assert.equal((html.match(/class="lab-arc-entry"/g)||[]).length,7);
 assert.equal((html.match(/class="lab-arc-feature"/g)||[]).length,2);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const expected=["/original-works","/original-works/works","/original-works/reply","/original-works/transcosmic","/original-works/wiki","/original-works/journal","/original-works/about"];
 const links=[...html.matchAll(/class="lab-arc-entry" href="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(links,expected);
 assert.match(html,/original-worlds-v1\.webp/);
 assert.match(html,/lab-archive-v1\.webp/);
 assert.doesNotMatch(html,/<script\b|<iframe\b|<form\b|onload=|onclick=|onerror=/i);
 for(const path of expected){
  const legacy=await worker.fetch(new Request("https://anevum.com"+path));
  assert.equal(legacy.status,200,"Preserved legacy page missing "+path);
  assert.equal(legacy.headers.get("X-Anevum-Surface"),res.headers.get("X-Anevum-Surface"));
  const body=await legacy.text();
  assert.match(body,/data-page="/,"Legacy editorial rendering changed: "+path);
  assert.doesNotMatch(body,/lab-arc-hero/,"Archive markup leaked into original page "+path);
 }
 const oldHome=await (await worker.fetch(new Request("https://anevum.com/original-works"))).text();
 assert.match(oldHome,/Somewhere,/);
 assert.notEqual(html,oldHome);
 const q=await worker.fetch(new Request("https://anevum.com"+route+"?redirect=%3Cscript%3E"));
 assert.equal(q.status,200);
 assert.equal(await q.text(),html);
 const head=await worker.fetch(new Request("https://anevum.com"+route,{method:"HEAD"}));
 assert.equal(head.status,200);
 assert.equal((await head.arrayBuffer()).byteLength,0);
 assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(res.headers));
 assert.equal((await worker.fetch(new Request("https://anevum.com"+route,{method:"POST",body:"x"}))).status,405);
 for(const bad of [route+"/draft",route+"/private","/archive","/staff/archive","/original-works/archive/../../member"]){
  assert.equal((await worker.fetch(new Request("https://anevum.com"+bad))).status,404,"Unreviewed route served: "+bad);
 }
});

test("Living Laboratory links resolve to public routes and real fragment targets",async()=>{
 const routes=["/","/original-works/experiments","/original-works/research","/original-works/archive"];
 const cached=new Map();
 async function read(url,referrer){
  const key=url.origin+url.pathname+url.search;
  if(!cached.has(key)){
   const response=await worker.fetch(new Request(key));
   assert.equal(response.status,200,"Broken public navigation from "+referrer+" to "+key);
   assert.equal(response.headers.get("Content-Type"),"text/html; charset=utf-8","Wrong link target content type: "+key);
   assert.equal(response.headers.get("X-Anevum-Surface"),"anevum-original-works-public-v3-root");
   cached.set(key,await response.text());
  }
  return cached.get(key);
 }
 for(const route of routes){
  const base=new URL("https://anevum.com"+route),html=await read(base,route);
  assert.equal((html.match(/<main\b/g)||[]).length,1,"One main landmark expected: "+route);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,"One main heading expected: "+route);
  assert.match(html,/<a\b[^>]*class="lab-skip"[^>]*href="#main"|<a\b[^>]*href="#main"[^>]*class="lab-skip"/,"Missing skip link: "+route);
  assert.match(html,/<main id="main" tabindex="-1">/,"Missing focusable main: "+route);
  assert.match(html,/aria-label="Primary navigation"/,"Missing desktop nav label: "+route);
  assert.match(html,/aria-label="Mobile navigation"/,"Missing mobile nav label: "+route);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,"Duplicate HTML IDs: "+route);
  const links=[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m=>m[1]);
  assert.ok(links.length>=12,"Unexpectedly incomplete navigation: "+route);
  for(const dest of routes)assert.ok(links.includes(dest),"Missing main navigation route "+dest+" from "+route);
  for(const href of links){
   const target=new URL(href,base);
   if(target.origin!==base.origin)continue;
   assert.ok(target.pathname==="/"||target.pathname==="/original-works"||target.pathname.startsWith("/original-works/"),
    "Internal link crosses unapproved route boundary: "+route+" -> "+href);
   const targetHTML=await read(target,route);
   if(target.hash){
    const id=decodeURIComponent(target.hash.slice(1));
    assert.ok(id&&targetHTML.includes('id="'+id+'"'),"Broken fragment "+route+" -> "+href);
   }
  }
 }
});

test("root launch is method-safe and cannot intercept staff, member or API routes",async()=>{
 const head=await worker.fetch(new Request("https://anevum.com/",{method:"HEAD"}));
 assert.equal(head.status,200);
 assert.equal(await head.text(),"");
 const get=await worker.fetch(new Request("https://anevum.com/"));
 assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(get.headers));
 for(const pathname of ["/member","/member/","/staff","/staff/","/api/v1/member/status","/play","/join","/creator","/original-works/private","/unknown"]){
  const response=await worker.fetch(new Request("https://anevum.com"+pathname));
  assert.equal(response.status,404,"Public studio must not serve "+pathname);
 }
 const denied=await worker.fetch(new Request("https://anevum.com/",{method:"POST",body:"x"}));
 assert.equal(denied.status,405);
 assert.equal(denied.headers.get("Allow"),"GET, HEAD");
});
