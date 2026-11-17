import test from "node:test";
import assert from "node:assert/strict";
import {Script} from "node:vm";
import {LAB_ART} from "../apps/anevum-public-studio/living-laboratory-art.mjs";
import worker from "../apps/anevum-institute-preview/worker.mjs";

const BASE="https://anevum.com/institute-preview";
const PATHS=["","/academy","/academy/cfp-101","/learn/cfp-101/logic-gates","/laboratory/and-gate"];
const req=(path="",init={})=>worker.fetch(new Request(BASE+path,init));

test("five isolated pages have accurate titles, landmarks, and noindex headers",async()=>{
  for(const path of PATHS){
    const response=await req(path);
    assert.equal(response.status,200,path);
    assert.equal(response.headers.get("Content-Type"),"text/html; charset=utf-8");
    assert.equal(response.headers.get("X-Anevum-Surface"),"open-institute-design-review-v1");
    assert.match(response.headers.get("Content-Security-Policy"),/default-src 'none'/);
    assert.match(response.headers.get("Content-Security-Policy"),/connect-src 'none'/);
    assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
    const html=await response.text();
    assert.match(html,/<html lang="en">/);
    assert.match(html,/<meta name="viewport"/);
    assert.match(html,/<main id="main" tabindex="-1"/);
    assert.match(html,/<a class="skip" href="#main">Skip to main content/);
    assert.match(html,/<nav class="desk-nav" aria-label="Primary navigation">/);
    assert.match(html,/<details class="mobile-menu">/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,"Exactly one H1: "+path);
    assert.match(html,/independent, non-accredited open-education and research project/i);
    assert.match(html,/Not a public launch/);
    assert.doesNotMatch(html,/<iframe|<form\b|onload=|onclick=|<script(?! defer src=)/i);
    assert.doesNotMatch(html,/patient records|OpenAI API key|university degrees awarded/i);
  }
});

test("every relative institute navigation link resolves within the preview",async()=>{
  const known=new Set(PATHS.map(path=>"/institute-preview"+path));
  known.add("/institute-preview/");
  for(const path of PATHS){
    const html=await(await req(path)).text();
    const links=[...html.matchAll(/<a[^>]*\bhref="(\/institute-preview(?:\/[^"#]*)?)"/g)].map(m=>m[1]);
    assert.ok(links.length>=6,"No meaningful links in "+path);
    for(const link of links){
      assert.ok(known.has(link),"Unreachable link on "+path+": "+link);
    }
  }
});

test("course availability and educational boundaries are explicit",async()=>{
  const catalog=await(await req("/academy")).text();
  const course=await(await req("/academy/cfp-101")).text();
  const lesson=await(await req("/learn/cfp-101/logic-gates")).text();
  assert.match(catalog,/The first unit includes a complete explanation/i);
  assert.match(catalog,/not operational faculties/i);
  assert.match(course,/curriculum in development/i);
  assert.equal((course.match(/Study this lesson/g)||[]).length,1);
  assert.match(lesson,/Q = A ∧ B/);
  assert.match(lesson,/2² = 4/);
  assert.match(lesson,/N = NOT\(A AND B\)/);
  assert.match(lesson,/Q = NOT\(N\) = A AND B/);
  assert.match(lesson,/data-answer="and"/);
  assert.match(lesson,/data-local-progress/);
  assert.match(lesson,/not a transistor-level SPICE simulation/);
});

test("logic laboratory exposes four correct truth-table rows and accessible controls",async()=>{
  const html=await(await req("/laboratory/and-gate")).text();
  const rows=[...html.matchAll(/<tr data-bits="([01]{2})"><td>([01])<\/td><td>([01])<\/td><td>([01])<\/td><\/tr>/g)];
  assert.deepEqual(rows.map(m=>[m[1],Number(m[2]),Number(m[3]),Number(m[4])]),[
    ["00",0,0,0],["01",0,1,0],["10",1,0],["11",1,1]
  ]);
  assert.match(html,/data-and-lab/);
  assert.match(html,/data-input="a" aria-pressed="false"/);
  assert.match(html,/data-input="b" aria-pressed="false"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/data-lab-progress/);
  assert.match(html,/data-reset/);
  assert.match(html,/browser simulation evaluates the ideal Boolean function/);
});

test("preview client parses, and uses only local browser state",async()=>{
  const response=await req("/client.js");
  assert.equal(response.status,200);
  assert.match(response.headers.get("Content-Type"),/javascript/);
  const source=await response.text();
  assert.doesNotThrow(()=>new Script(source));
  assert.match(source,/localStorage\.setItem/);
  assert.match(source,/visited\.size===4/);
  assert.doesNotMatch(source,/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|navigator\.serviceWorker/);
});

test("styles are complete, mobile responsive and reduced-motion safe",async()=>{
  const response=await req("/styles.css");
  assert.equal(response.status,200);
  assert.match(response.headers.get("Content-Type"),/text\/css/);
  const css=await response.text();
  assert.match(css,/@media\(max-width:750px\)/);
  assert.match(css,/@media\(max-width:470px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/a:focus-visible/);
  assert.match(css,/\/institute-preview\/assets\/lab-hero-v1\.webp/);
  assert.doesNotMatch(css,/https?:\/\//);
});

test("reviewed same-origin images decode and all other binary assets fail closed",async()=>{
  for(const name of ["lab-hero-v1.webp","lab-archive-v1.webp","research-generation-v1.webp","research-computation-v1.webp","research-worlds-v1.webp","rhen-generative-v1.webp"]){
    const response=await req("/assets/"+name);
    assert.equal(response.status,200,name);
    assert.equal(response.headers.get("Content-Type"),"image/webp");
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.toString("ascii",0,4),"RIFF");
    assert.equal(bytes.toString("ascii",8,12),"WEBP");
    assert.deepEqual(bytes,Buffer.from(LAB_ART[name],"base64"));
  }
  assert.equal((await req("/assets/private.webp")).status,404);
});

test("unowned routes, origins, methods and data endpoints are rejected",async()=>{
  for(const path of ["/staff","/command","/api","/about","/archive","/../../staff","/assets/private.webp"]){
    assert.equal((await req(path)).status,404,path);
  }
  for(const url of ["https://example.com/institute-preview","https://backstage.anevum.com/institute-preview","http://anevum.com/institute-preview","https://anevum.com/institute-preview?debug=1"]){
    assert.equal((await worker.fetch(new Request(url))).status,404,url);
  }
  const post=await req("",{method:"POST",body:"x"});
  assert.equal(post.status,405);
  assert.equal(post.headers.get("Allow"),"GET, HEAD");
  for(const path of ["","/academy","/academy/cfp-101","/learn/cfp-101/logic-gates","/laboratory/and-gate","/styles.css","/client.js","/assets/lab-hero-v1.webp"]){
    const get=await req(path),head=await req(path,{method:"HEAD"});
    assert.equal(head.status,200,path);
    assert.equal((await head.arrayBuffer()).byteLength,0);
    assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(get.headers));
  }
});
