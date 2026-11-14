import test from "node:test";
import assert from "node:assert/strict";
import worker from "../apps/anevum-public-studio/worker.mjs";

const base="https://anevum.com";
const go=(pathname,method="GET")=>worker.fetch(new Request(base+pathname,{method}));

test("four Living Laboratory destinations have real accessible public routes",async()=>{
 const names=[
  ["/original-works/experiments","Experiments"],
  ["/original-works/research","Research"],
  ["/original-works/experiences","Experiences"],
  ["/original-works/archive","Archive"]
 ];
 for(const [path,label] of names){
  const response=await go(path);
  assert.equal(response.status,200,path);
  assert.match(response.headers.get("content-security-policy"),/default-src 'none'/);
  assert.match(response.headers.get("x-robots-tag"),/noindex/);
  const html=await response.text();
  assert.match(html,new RegExp("<h1\\b[^>]*>"+label+"<\\/h1>"),path);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
  assert.match(html,/<a class="lab-skip" href="#main">Skip to content<\/a>|<a href="#main" class="lab-skip">Skip to content<\/a>/);
  assert.match(html,/<main id="main" tabindex="-1">/);
  assert.match(html,/<details class="lab-mobile"><summary>Menu<\/summary>/);
  assert.match(html,/<nav class="lab-nav" aria-label="Primary navigation">/);
  assert.match(html,/<a href="\/original-works\/experiences"/);
  assert.doesNotMatch(html,/<script\b|<iframe\b|<form\b|onload=|onclick=/);
 }
});
test("real Experiences contains exactly three grounded visits and has no invented live deployment",async()=>{
 const response=await go("/original-works/experiences");
 const html=await response.text();
 assert.match(html,/<title>Experiences \| ANEVUM Living Laboratory<\/title>/);
 assert.equal((html.match(/class="lab-x-card"/g)||[]).length,3);
 for(const href of ["https://github.com/devonalanakins/brandle","/original-works","/original-works/wiki"]){
  assert.ok(html.includes('href="'+href+'"'),href);
 }
 assert.match(html,/not a verified live game/);
 assert.match(html,/not a newly published manuscript/);
 assert.match(html,/not a complete or approved canon/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.match(html,/forced-colors:active/);
 assert.doesNotMatch(html,/data-video-ready="true"|<video\b|<script\b/);
 const head=await go("/original-works/experiences","HEAD");
 assert.equal(head.status,200);assert.equal(await head.text(),"");
 assert.equal((await go("/original-works/experiences","POST")).status,405);
 assert.equal((await go("/original-works/experiences/private")).status,404);
});
test("home provides four image-led navigable destinations without adding client JS",async()=>{
 const response=await go("/");
 const html=await response.text();
 assert.match(html,/<nav class="lab-worlds-grid" aria-label="Explore the four ANEVUM destinations">/);
 assert.equal((html.match(/class="lab-world"/g)||[]).length,4);
 for(const path of ["experiments","research","experiences","archive"]){
  assert.match(html,new RegExp('class="lab-world" href="/original-works/'+path+'"'));
 }
 assert.match(html,/lab-world:focus-visible/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(html,/<script\b|<iframe\b|<video\b/);
 const hrefs=[...html.matchAll(/<a class="lab-world" href="([^"]+)"/g)].map(x=>x[1]);
 for(const href of hrefs)assert.equal((await go(href)).status,200,href);
});
