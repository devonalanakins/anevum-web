import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CFP_101} from "../apps/anevum-institute-preview/curriculum.mjs";
import previewWorker from "../apps/anevum-institute-preview/worker.mjs";
import {makeInstitutePublicCandidate} from "../apps/anevum-institute-preview/public-candidate-adapter.mjs";

const ORIGIN="https://anevum.com";
const MEDIA=new Set([
  "observatory-review-desktop.webp",
  "observatory-review-mobile.webp",
  "facility-concept-v2-desktop.webp",
  "facility-concept-v2-mobile.webp"
]);
const dir=new URL("../apps/anevum-institute-preview/media/",import.meta.url);
const worker=makeInstitutePublicCandidate({loadReviewMedia:async name=>
  MEDIA.has(name)?new Uint8Array(await readFile(new URL(name,dir))):null
});
const req=(path,init)=>worker.fetch(new Request(ORIGIN+path,init));
const INDEXABLE=[
  "/institute","/institute/academy","/institute/academy/cfp-101",
  "/institute/research","/institute/recognition",
  ...CFP_101.units.map(unit=>"/institute"+unit.lessonPath),
  "/institute/laboratory/and-gate",
  "/institute/laboratory/cluster-scheduling",
  "/institute/laboratory/neuron-dynamics"
];
const LOCAL_ONLY=["/institute/dossier","/institute/studio","/institute/profile"];

test("public release candidate retains review-only status and no routes, secrets, permissions or deployment triggers",async()=>{
  const raw=await readFile(new URL("../wrangler.institute-public-candidate.jsonc",import.meta.url),"utf8");
  const cfg=JSON.parse(raw);
  assert.equal(cfg.name,"anevum-institute-public-candidate");
  assert.equal(cfg.main,"./apps/anevum-institute-preview/public-candidate-worker.mjs");
  assert.equal(cfg.workers_dev,false);
  assert.equal(cfg.preview_urls,false);
  assert.deepEqual(cfg.previews,{});
  assert.deepEqual(cfg.rules,[{type:"Data",globs:["**/*.webp"],fallthrough:true}]);
  for(const field of ["routes","route","d1_databases","kv_namespaces","r2_buckets",
    "durable_objects","assets","vars","secrets","services","triggers"]){
    assert.equal(Object.hasOwn(cfg,field),false,"Candidate must not inherit "+field);
  }
  const entry=await readFile(new URL("../apps/anevum-institute-preview/public-candidate-worker.mjs",import.meta.url),"utf8");
  assert.match(entry,/makeInstitutePublicCandidate/);
  assert.doesNotMatch(entry,/import .+hosted-worker|wrangler deploy/);
  assert.throws(()=>makeInstitutePublicCandidate({}),/media loader/);
});

test("indexable public Institute and all eight lessons have canonical SEO, working navigation and no owner preview claims",async()=>{
  assert.equal(CFP_101.units.length,8);
  assert.equal(INDEXABLE.length,16);
  for(const path of INDEXABLE){
    const r=await req(path);
    assert.equal(r.status,200,path);
    assert.equal(r.headers.get("X-Robots-Tag"),null,"Public content must not be forced noindex: "+path);
    assert.match(r.headers.get("Content-Type"),/text\/html/);
    assert.match(r.headers.get("Content-Security-Policy"),/connect-src 'none'/);
    assert.equal(r.headers.get("X-Anevum-Surface"),"open-institute-public-candidate-v1");
    const html=await r.text();
    assert.ok(html.includes('<link rel="canonical" href="'+ORIGIN+path+'">'),"No canonical: "+path);
    assert.match(html,/<meta name="robots" content="index,follow">/);
    assert.match(html,/ANEVUM Open Institute/);
    assert.match(html,/Independent education:/);
    assert.match(html,/non-accredited/i);
    assert.doesNotMatch(html,/institute-preview|Not a public launch|Cloudflare Access|Design Preview/i);
    assert.match(html,/href="\/institute/);
    assert.match(html,/src="\/institute\/client.js"/);
    assert.match(html,/href="\/institute\/styles.css"/);
  }
});

test("Research Desk and browser-only learner tools are available but noindex, without server identity or transport",async()=>{
  for(const path of LOCAL_ONLY){
    const r=await req(path);
    assert.equal(r.status,200,path);
    assert.match(r.headers.get("X-Robots-Tag"),/noindex/);
    const html=await r.text();
    assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
    assert.match(html,/link rel="canonical"/);
    assert.doesNotMatch(html,/institute-preview|Cloudflare Access|Not a public launch/);
    assert.match(html,/browser-local|device-only|local storage|browser profile|this browser/i);
  }
  const preview=await previewWorker.fetch(new Request(ORIGIN+"/institute-preview/academy"));
  assert.equal(preview.status,200);
  assert.match(preview.headers.get("X-Robots-Tag"),/noindex/);
  assert.match(await preview.text(),/Not a public launch/);
});

test("only literal, valid Institute GET/HEAD routes allow clean tracking redirects",async()=>{
  for(const path of ["/institute","/institute/academy","/institute/dossier",
    "/institute/learn/cfp-101/eight-bit-computer"]){
    const tagged=await req(path+"?utm_source=chatgpt.com");
    assert.equal(tagged.status,302,path);
    assert.equal(tagged.headers.get("Location"),ORIGIN+path);
    assert.match(tagged.headers.get("Cache-Control"),/no-store/);
    assert.equal(await tagged.text(),"");
    assert.equal((await req(path)).status,200);
  }
  const head=await req("/institute/academy?utm_source=chatgpt.com",{method:"HEAD"});
  assert.equal(head.status,302);
  assert.equal(head.headers.get("Location"),ORIGIN+"/institute/academy");
  const clean=await req("/institute/academy",{method:"HEAD"});
  assert.equal(clean.status,200);
  assert.equal(await clean.text(),"");
});

test("public candidate never proxies unowned routes or arbitrary query strings",async()=>{
  for(const path of [
    "/","/command","/staff","/member","/api/v1/member",
    "/original-works/archive","/institute-preview",
    "/institutefake","/institute-evil",
    "/institute/does-not-exist",
    "/institute/does-not-exist?utm_source=chatgpt.com",
    "/institute/../api/v1/member",
    "/institute?search=academy",
    "/institute?utm_source=chatgpt.com&next=/command",
    "/institute?utm_source=chatgpt.com&utm_source=chatgpt.com",
    "/institute?utm_source=evil.example",
    "/institute?utm_source=chatgpt.com&"
  ]){
    const response=await req(path);
    assert.equal(response.status,404,path);
    assert.equal(response.headers.get("Location"),null);
    assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
  }
  for(const url of [
    "https://evil.example/institute",
    "http://anevum.com/institute",
    "https://sub.anevum.com/institute",
    "https://anevum.com:444/institute",
    "https://anevum.com.attacker.example/institute"
  ]){
    const result=await worker.fetch(new Request(url));
    assert.equal(result.status,404,url);
    assert.equal(result.headers.get("Location"),null);
  }
  const r=await req("/institute",{method:"POST"});
  assert.equal(r.status,405);
  assert.equal(r.headers.get("Allow"),"GET, HEAD");
});

test("scripts and styles resolve at public namespace; binary media remain byte-exact",async()=>{
  for(const path of [
    "/institute/styles.css","/institute/client.js",
    "/institute/evidence-schema.js","/institute/evidence-workbench.js",
    "/institute/local-member-client.js","/institute/cpu-capstone-client.js"
  ]){
    const r=await req(path);
    assert.equal(r.status,200,path);
    const body=await r.text();
    assert.ok(body.length>50,path);
    assert.ok(!body.includes("/institute-preview"),"Stale preview import: "+path);
    assert.match(r.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  }
  const manifest=await req("/institute/curriculum/cfp-101.json");
  assert.equal(manifest.status,200);
  const data=await manifest.json();
  assert.equal(data.id,"CFP-101");
  assert.equal(data.units.length,8);
  assert.equal(data.accreditation,"none");
  for(const name of MEDIA){
    const r=await req("/institute/media/"+name);
    assert.equal(r.status,200,name);
    assert.equal(r.headers.get("Content-Type"),"image/webp");
    const bytes=new Uint8Array(await r.arrayBuffer());
    const original=new Uint8Array(await readFile(new URL(name,dir)));
    assert.deepEqual(bytes,original,"Source image altered: "+name);
  }
  assert.equal((await req("/institute/media/secret.webp")).status,404);
});

test("public sitemap enumerates only indexable reachable pages, never private, staff or historical routes",async()=>{
  const r=await req("/institute/sitemap.xml");
  assert.equal(r.status,200);
  assert.match(r.headers.get("Content-Type"),/application\/xml/);
  const xml=await r.text();
  const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
  assert.equal(urls.length,16);
  assert.deepEqual(new Set(urls),new Set(INDEXABLE.map(p=>ORIGIN+p)));
  assert.doesNotMatch(xml,/preview|dossier|studio|profile|member|staff|command|original-works/);
  for(const url of urls){
    const u=new URL(url);
    assert.equal((await req(u.pathname)).status,200,url);
  }
  const tagged=await req("/institute/sitemap.xml?utm_source=chatgpt.com");
  assert.equal(tagged.status,302);
  assert.equal(tagged.headers.get("Location"),ORIGIN+"/institute/sitemap.xml");
  const head=await req("/institute/sitemap.xml",{method:"HEAD"});
  assert.equal(head.status,200);
  assert.equal(await head.text(),"");
});
