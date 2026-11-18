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
  assert.match(original,/Three converging tapered pathways/);
  assert.match(original,/<circle /);
  assert.ok(exported.includes(original.trim()),"Existing source-coupled identity must not change without owner approval");
  const revised=source("open-aperture-refined-color.svg");
  assert.doesNotMatch(revised,/<circle|stroke-width="[0-4](?:\.|")/);
  assert.equal((revised.match(/<path /g)||[]).length,4);
});
