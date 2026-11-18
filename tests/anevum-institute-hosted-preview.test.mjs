import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {isInstituteReviewHost,makeInstituteHostedReview} from "../apps/anevum-institute-preview/hosted-adapter.mjs";

const ROOT="https://pr-816-anevum-web-nextgen.devonakins.workers.dev";
const src=new URL("../apps/anevum-institute-preview/media/",import.meta.url);
const files=new Set([
  "observatory-review-desktop.webp",
  "observatory-review-mobile.webp",
  "facility-concept-v2-desktop.webp",
  "facility-concept-v2-mobile.webp"
]);
const worker=makeInstituteHostedReview({loadReviewMedia:async name=>{
  if(!files.has(name))return null;
  return new Uint8Array(await readFile(new URL(name,src)));
}});
function req(path,options){return worker.fetch(new Request(ROOT+path,options));}

test("host adapter accepts only exact target Worker Preview URL names",()=>{
  assert.equal(isInstituteReviewHost("pr-816-anevum-web-nextgen.devonakins.workers.dev"),true);
  assert.equal(isInstituteReviewHost("3274dc93-anevum-web-nextgen.devonakins.workers.dev"),true);
  for(const unsafe of ["","anevum.com","anevum-web-nextgen.devonakins.workers.dev",
    "pr-816-anevum-other-worker.devonakins.workers.dev",
    "pr-816-anevum-web-nextgen.devonakins.workers.dev.attacker.invalid",
    "evil.pr-816-anevum-web-nextgen.devonakins.workers.dev",
    "a--b-anevum-web-nextgen.devonakins.workers.dev",
    "pr_816-anevum-web-nextgen.devonakins.workers.dev",
    "anevum-institute-review-no-production.devonakins.workers.dev"]){
    assert.equal(isInstituteReviewHost(unsafe),false,"unexpected accepted host: "+unsafe);
  }
  assert.throws(()=>makeInstituteHostedReview({}),/loader/);
});

test("exact-host preview rewrites in memory and preserves strict isolated routes",async()=>{
  const page=await req("/institute-preview");
  assert.equal(page.status,200);
  assert.match(await page.text(),/ANEVUM/);
  assert.match(page.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  assert.match(page.headers.get("X-Robots-Tag"),/noindex/);
  assert.equal(page.headers.get("Cache-Control"),"no-store");
  for(const path of ["/institute-preview/academy","/institute-preview/dossier",
    "/institute-preview/laboratory/cluster-scheduling",
    "/institute-preview/laboratory/neuron-dynamics"]){
    const r=await req(path);
    assert.equal(r.status,200,path);
    assert.match(r.headers.get("Content-Type"),/text\/html/);
  }
  const js=await req("/institute-preview/neuron-lif-model.js");
  assert.equal(js.status,200);
  assert.match(js.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  const head=await req("/institute-preview",{method:"HEAD"});
  assert.equal(head.status,200);
  assert.equal(await head.text(),"");
  for(const path of ["/","/api/command","/command","/institute-preview/not-a-route",
    "/institute-preview?cmd=on","/institute-preview/../api/public/trading/live"]){
    const r=await req(path);
    assert.equal(r.status,404,"strict host review leaked path "+path);
  }
  const denied=await req("/institute-preview",{method:"POST"});
  assert.equal(denied.status,405);
});

test("host restriction denies public origin, spoofed host and port without media or application routing",async()=>{
  let reads=0;
  const denied=makeInstituteHostedReview({loadReviewMedia:async()=>{reads++;return new Uint8Array(5000)}});
  const urls=[
    "https://anevum.com/institute-preview",
    "http://pr-816-anevum-web-nextgen.devonakins.workers.dev/institute-preview",
    "https://pr-816-anevum-web-nextgen.devonakins.workers.dev:444/institute-preview",
    "https://pr-816-anevum-other-worker.devonakins.workers.dev/institute-preview",
    "https://pr-816-anevum-web-nextgen.devonakins.workers.dev.attacker.invalid/institute-preview"
  ];
  for(const url of urls){
    const r=await denied.fetch(new Request(url));
    assert.equal(r.status,404,url);
    assert.match(r.headers.get("X-Robots-Tag"),/noindex/);
  }
  assert.equal(reads,0);
});

test("four reviewed image assets decode from local repo bytes and arbitrary assets do not",async()=>{
  for(const name of files){
    const r=await req("/institute-preview/media/"+name);
    assert.equal(r.status,200,name);
    assert.equal(r.headers.get("Content-Type"),"image/webp");
    assert.ok(Number(r.headers.get("Content-Length"))>4096);
    assert.equal(new Uint8Array(await r.arrayBuffer()).length,Number(r.headers.get("Content-Length")));
  }
  assert.equal((await req("/institute-preview/media/secret.webp")).status,404);
  // URL parsing normalizes dot segments; a private unowned route must still fail.
  assert.equal((await req("/institute-preview/media/../../private")).status,404);
});

test("separate Wrangler file never inherits production routes, D1 or credentials",async()=>{
  const raw=await readFile(new URL("../wrangler.institute-preview.jsonc",import.meta.url),"utf8");
  const conf=JSON.parse(raw);
  assert.equal(conf.name,"anevum-institute-review-no-production");
  assert.equal(conf.main,"./apps/anevum-institute-preview/hosted-worker.mjs");
  assert.equal(conf.workers_dev,false);
  assert.equal(conf.preview_urls,true);
  assert.deepEqual(conf.previews,{});
  assert.deepEqual(conf.rules,[{type:"Data",globs:["**/*.webp"],fallthrough:true}]);
  for(const forbidden of ["routes","route","d1_databases","kv_namespaces",
    "r2_buckets","durable_objects","assets","vars","secrets"]){
    assert.equal(Object.hasOwn(conf,forbidden),false,"Never bind "+forbidden+" in isolated educational review");
  }
});
