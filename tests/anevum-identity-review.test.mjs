import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const folder=new URL("../apps/anevum-institute-preview/identity-review/",import.meta.url);
const source=(file)=>readFileSync(new URL(file,folder),"utf8");
const choices=["open-aperture-refined","axiom","gate"];
const variants=["color","mono-ivory","mono-ink"];
test("identity review masters are accessible vector-only drafts, not published marks",()=>{
  for(const choice of choices)for(const variant of variants){
    const svg=source(choice+"-"+variant+".svg");
    assert.match(svg,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(svg,/viewBox="0 0 160 160"/);
    assert.match(svg,/<title id="title">ANEVUM /);
    assert.match(svg,/<desc id="desc">/);
    assert.match(svg,/not an approved public mark/);
    assert.match(svg,/<path /);
    const withoutRequiredSvgNamespace=svg.replace("http://www.w3.org/2000/svg","");
    assert.doesNotMatch(withoutRequiredSvgNamespace,/<(?:script|image|foreignObject|text|use|style)\b|\b(?:href|onload|onclick)=|url\(|https?:\/\//i,
      "Review vectors may not include active, remote, external, font-dependent or embedded content");
    const paints=[...svg.matchAll(/(?:stroke|fill)="(#[a-fA-F0-9]{6})"/g)].map(m=>m[1].toUpperCase());
    assert.ok(paints.length>=2);
    assert.ok(paints.every(p=>["#F4F1E8","#D9B17A","#95B9AB","#071016"].includes(p)));
    if(variant==="mono-ivory")assert.deepEqual([...new Set(paints)],["#F4F1E8"]);
    if(variant==="mono-ink")assert.deepEqual([...new Set(paints)],["#071016"]);
  }
});
test("refinement removes fragile detail while leaving currently served identity untouched",()=>{
  const original=readFileSync(new URL("../apps/anevum-institute-preview/mark.svg",import.meta.url),"utf8");
  const exported=readFileSync(new URL("../apps/anevum-institute-preview/artwork.mjs",import.meta.url),"utf8");
  assert.match(original,/The Confluence/);
  assert.doesNotMatch(original,/Three converging tapered pathways/);
  assert.ok(exported.includes(original.trim()),"Approved Confluence mark and embedded output must match");
  const archive=source("open-aperture-original-archived.svg");
  assert.match(archive,/Three converging tapered pathways/);
  assert.match(archive,/<circle /);
  const revised=source("open-aperture-refined-color.svg");
  assert.doesNotMatch(revised,/<circle|stroke-width="[0-4](?:\.|")/);
  assert.equal((revised.match(/<path /g)||[]).length,4);
});


test("owner-selected Confluence vector suite has full, compact and true one-ink variants",()=>{
  for(const variant of ["full","small"])for(const mode of ["color","mono-ivory","mono-ink"]){
    const svg=source("confluence-"+variant+"-"+mode+".svg");
    assert.match(svg,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(svg,/viewBox="0 0 160 160"/);
    assert.match(svg,/<title id="title">ANEVUM/);
    assert.match(svg,/The Confluence/);
    assert.match(svg,/not an approved public mark/);
    assert.match(svg,/translate\(160 0\) scale\(-1 1\)/,"left/right fields must retain paired symmetry");
    assert.doesNotMatch(svg.replace("http://www.w3.org/2000/svg",""),/<(?:script|image|foreignObject|text|use|style)\b|\b(?:href|onload|onclick)=|url\(|https?:\/\//i);
    const paints=[...svg.matchAll(/(?:stroke|fill)="(#[A-Fa-f0-9]{6})"/g)].map(m=>m[1].toUpperCase());
    assert.ok(paints.length>=3,"Vector must expose real geometry");
    assert.ok(paints.every(p=>["#F4F1E8","#D9B17A","#95B9AB","#071016"].includes(p)));
    if(mode==="mono-ivory")assert.deepEqual([...new Set(paints)],["#F4F1E8"]);
    if(mode==="mono-ink")assert.deepEqual([...new Set(paints)],["#071016"]);
    if(variant==="small"){
      assert.doesNotMatch(svg,/<circle|stroke-width="(?:1\.|2\.|3\.)/,"small icon must avoid micro-detail");
      assert.match(svg,/stroke-width="7"/);
    }else{
      assert.match(svg,/M80 11 V147/,"full mark retains calibrated axis");
      assert.match(svg,/<circle cx="80" cy="85"/,"full mark retains shared discovery point");
    }
  }
  const served=readFileSync(new URL("../apps/anevum-institute-preview/mark.svg",import.meta.url),"utf8");
  assert.match(served,/The Confluence/,"Draft should serve owner-approved Confluence");
  assert.doesNotMatch(served,/Three converging tapered pathways/);
  const small=readFileSync(new URL("../apps/anevum-institute-preview/mark-small.svg",import.meta.url),"utf8");
  assert.match(small,/Confluence/);
  const artwork=readFileSync(new URL("../apps/anevum-institute-preview/artwork.mjs",import.meta.url),"utf8");
  assert.ok(artwork.includes(small.trim()),"The compact favicon must be source-coupled too");
});
