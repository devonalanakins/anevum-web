/**
 * ANEVUM.WEB.OPS.2026-11-12.029 — read-only production HTTP smoke.
 * Runs without credentials, browser automation services, or mutation.
 */
import assert from "node:assert/strict";

const base=process.env.ANEVUM_LIVE_BASE??"https://anevum.com";
const surface="anevum-original-works-public-v3-root";
const timeoutMs=15_000;
const results=[];

async function request(path,method="GET"){
 const url=new URL(path,base);
 assert.equal(url.origin,new URL(base).origin,"Cross-origin request refused");
 const response=await fetch(url,{method,redirect:"manual",signal:AbortSignal.timeout(timeoutMs),headers:{"user-agent":"ANEVUM-public-release-smoke/1.0"}});
 const bytes=method==="HEAD"?new Uint8Array(await response.arrayBuffer()):new Uint8Array(await response.arrayBuffer());
 const text=response.headers.get("content-type")?.includes("text/html")?new TextDecoder().decode(bytes):"";
 results.push({path,method,status:response.status,bytes:bytes.length,surface:response.headers.get("x-anevum-surface")});
 return {response,bytes,text};
}

function publicPage(result,path,markers){
 assert.equal(result.response.status,200,path+" did not return HTTP 200");
 assert.equal(result.response.headers.get("x-anevum-surface"),surface,path+" has wrong Worker identity");
 assert.match(result.response.headers.get("content-type")??"",/text\/html/i,path+" is not HTML");
 assert.match(result.response.headers.get("x-robots-tag")??"",/noindex/i,path+" indexing guard absent");
 assert.match(result.response.headers.get("content-security-policy")??"",/default-src 'none'/i,path+" CSP absent");
 for(const marker of markers)assert.ok(result.text.includes(marker),path+" missing expected public marker "+marker);
 assert.doesNotMatch(result.text,/<script\b|<iframe\b|onload=|onclick=/i,path+" unexpectedly includes active script");
}

publicPage(await request("/"),"/",['id="lab-home-title"','<h1 id="lab-home-title" class="lab-heading">ANEVUM</h1>','/original-works/experiments','/original-works/research','/original-works/archive']);
publicPage(await request("/original-works/experiments"),"/original-works/experiments",['3 entries · All work','Rhen language','Brandle','Original Works']);
publicPage(await request("/original-works/experiments?theme=interactive"),"/original-works/experiments?theme=interactive",['1 entry · Interactive','Brandle','aria-current="page">Interactive</a>']);
publicPage(await request("/original-works/research"),"/original-works/research",['Questions before claims.','Evidence status','research-imagination-v1.webp']);
publicPage(await request("/original-works/archive"),"/original-works/archive",['7 public sections','REPLY','The Transcosmic','Preserved, not republished.']);

const legacy=["","/works","/reply","/transcosmic","/wiki","/journal","/about"];
for(const path of legacy){
 const url="/original-works"+path;
 publicPage(await request(url),url,['data-page="','href="/original-works/reply"']);
}
const asset=await request("/original-works/assets/lab-hero-v1.webp");
assert.equal(asset.response.status,200,"Hero image failed");
assert.equal(asset.response.headers.get("content-type"),"image/webp");
assert.ok(asset.bytes.length>=100_000,"Hero image unexpectedly short");
assert.equal(new TextDecoder().decode(asset.bytes.slice(0,4)),"RIFF");
assert.equal(new TextDecoder().decode(asset.bytes.slice(8,12)),"WEBP");
const missing=await request("/original-works/assets/unreviewed.webp");
assert.equal(missing.response.status,404,"Unreviewed image unexpectedly served");
const head=await request("/original-works/research","HEAD");
assert.equal(head.response.status,200,"HEAD request failed");
assert.equal(head.bytes.length,0,"HEAD response had a body");
const unsupported=await request("/original-works/research","POST");
assert.equal(unsupported.response.status,405,"Unsupported method not denied");
for(const path of ["/member","/staff"]){
 const r=await request(path);
 assert.notEqual(r.response.headers.get("x-anevum-surface"),surface,path+" was unexpectedly routed to the public studio");
}
console.log("ANEVUM_LIVE_RELEASE_SMOKE_PASS "+JSON.stringify({checks:results.length,paths:results.map(x=>({path:x.path,method:x.method,status:x.status})),publicWorkerVersion:"6"}));
