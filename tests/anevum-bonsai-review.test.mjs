import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import worker from "../apps/anevum-bonsai/worker.mjs";
import {REVIEW_GZIP_BASE64,REVIEW_SCRIPT_SHA256} from "../apps/anevum-bonsai/review-packed.mjs";

const get=(path,init={})=>worker.fetch(new Request("https://anevum.com"+path,init));

test("AAA art-directed design review is isolated, compressed and non-indexed",async()=>{
  const res=await get("/design-review");
  assert.equal(res.status,200);
  assert.equal(res.headers.get("Content-Encoding"),null);
  assert.equal(res.headers.get("X-Anevum-Design-Review"),"illustrative-only");
  assert.match(res.headers.get("X-Robots-Tag"),/noindex/);
  assert.match(res.headers.get("Content-Security-Policy"),/default-src 'none'/);
  assert.match(res.headers.get("Content-Security-Policy"),/script-src 'sha256-/);
  assert.doesNotMatch(res.headers.get("Content-Security-Policy"),/script-src 'unsafe-inline'/);
  const html=await res.text();
  const templates=[...html.matchAll(/<template data-route="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(templates.length,14);
  for(const path of ["/","/collection","/collection/tree-01","/collection/tree-02","/collection/tree-03","/collection/tree-04","/collection/tree-05","/chronicle","/atelier","/journal","/journal/time-is-the-medium","/practice","/about","/field-notes/acorn-01"]){
    assert.ok(templates.includes(path),"Missing high-fidelity route "+path);
  }
  assert.match(html,/Time is/);
  assert.match(html,/Acer rubrum/);
  assert.match(html,/The Acorn Experiment/);
  assert.match(html,/ILLUSTRATIVE|Illustrative/);
  assert.match(html,/Root-over-rock/);
  assert.doesNotMatch(html,/Samuel|Acer palmatum|rock installed|root placement completed/i);
  assert.doesNotMatch(html,/<script src=|<link rel="stylesheet" href="http/i);
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.equal(createHash("sha256").update(script).digest("base64"),REVIEW_SCRIPT_SHA256);
});
test("AAA design review HEAD and invalid variants fail closed",async()=>{
  const head=await get("/design-review",{method:"HEAD"});
  assert.equal(head.status,200);
  assert.equal(await head.text(),"");
  assert.equal(head.headers.get("Content-Encoding"),null);
  for(const p of ["/design-review?token=x","/design-review-api","/private","/command"]){
    assert.equal((await get(p)).status,404,p);
  }
});
test("review bundle remains a bounded, standalone browser artifact",()=>{
 const buf=Buffer.from(REVIEW_GZIP_BASE64,"base64");
 assert.ok(buf.length>100000,"Missing design media");
 assert.ok(buf.length<2000000,"Inline review exceeds 2 MB compressed budget");
});
