import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import worker from "../apps/anevum-bonsai/worker.mjs";
import {SPECIES, SPECIMENS, EVENTS, MEDIA, JOURNAL, STUDIES, assertContentIntegrity} from "../apps/anevum-bonsai/records.mjs";
const origin = "https://anevum.com";
const paths = ["/","/collection","/chronicle","/journal","/journal/time-is-the-medium","/atelier","/practice","/about",...SPECIMENS.map(s=>"/collection/"+s.id)];
const get = (path, init={})=>worker.fetch(new Request(origin+path,init));

test("isolated Worker config has no production routes, secrets, bindings, or live deploys",()=>{
  const config=JSON.parse(readFileSync(new URL("../wrangler.anevum-bonsai-preview.jsonc",import.meta.url),"utf8"));
  assert.deepEqual(config,{
    name:"anevum-bonsai-living-atlas-preview",
    main:"./apps/anevum-bonsai/worker.mjs",
    compatibility_date:"2026-11-15",
    workers_dev:true,
    preview_urls:true
  });
});

test("five independent verified-origin red-maple records, with no fabricated interventions",()=>{
  assert.equal(SPECIMENS.length,5);
  assert.equal(SPECIES.scientific,"Acer rubrum");
  assert.deepEqual(SPECIMENS.map(s=>s.id),["tree-01","tree-02","tree-03","tree-04","tree-05"]);
  assert.equal(assertContentIntegrity(),true);
  for(const s of SPECIMENS){
    assert.equal(s.scientificName,"Acer rubrum");
    assert.equal(s.originYear,2026);
    assert.equal(s.germinationDate,null);
    assert.equal(s.measurements,null);
    assert.equal(s.healthAssessment,null);
  }
  assert.equal(SPECIMENS[0].stylingState,"planned");
  assert.equal(EVENTS.find(e=>e.type==="design").state,"planned");
  assert.equal(EVENTS.find(e=>e.type==="origin").precision,"year");
  assert.equal(STUDIES[0].state,"planned");
  assert.ok(MEDIA.every(m=>!m.approved && !m.src));
  assert.equal(JOURNAL.length,1);
});

test("all public story routes serve accessible, index-blocked standalone HTML",async()=>{
  for(const path of paths){
    const res=await get(path);
    assert.equal(res.status,200,path);
    assert.match(res.headers.get("Content-Type"),/text\/html/);
    assert.match(res.headers.get("X-Robots-Tag"),/noindex/i);
    assert.match(res.headers.get("Content-Security-Policy"),/default-src 'none'/);
    assert.equal(res.headers.get("X-Anevum-Surface"),"anevum-bonsai-living-atlas-review-v1");
    const html=await res.text();
    assert.match(html,/<html lang="en">/);
    assert.match(html,/<main id="main" tabindex="-1">/);
    assert.match(html,/<a class="skip" href="#main">Skip to content<\/a>/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
    assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive">/);
    assert.doesNotMatch(html,/<script\b|<iframe\b|<form\b|<input\b|<canvas\b/i);
    assert.doesNotMatch(html,/https?:\/\/(?:[^"'\s]*\.)?(?:unsplash|googleapis|fonts\.google|youtube|cdn)/i);
    assert.doesNotMatch(html,/Acer palmatum|repotting completed|rock installed|roots installed/i);
    for(const [, href] of html.matchAll(/href="(\/[^"]*)"/g)){
      // #main excluded. Native footer links, collection links and journal all real.
      assert.ok(paths.includes(href),"Dead destination "+href+" from "+path);
    }
  }
});

test("Chronicle distinguishes observed year precision and planned day precision",async()=>{
  const html=await (await get("/chronicle")).text();
  assert.match(html,/<time datetime="2026">2026<\/time>/);
  assert.match(html,/<time datetime="2026-11-15">15 November 2026<\/time>/);
  assert.match(html,/class="tag observed">observed<\/span>/);
  assert.match(html,/class="tag planned">planned<\/span>/);
});

test("Atelier is an accessible, interactive, disclosed planning study",async()=>{
  const html=await (await get("/atelier")).text();
  assert.equal((html.match(/<details>/g)||[]).length,3);
  assert.equal((html.match(/<summary>/g)||[]).length,4); // Three studies plus the shared mobile navigation disclosure.
  assert.match(html,/Planned · Not installed/);
  assert.match(html,/no selected stone/i);
});

test("unknown and protected paths fail closed, nothing forwards to existing systems",async()=>{
  for(const path of ["/command","/command/rhen/operate","/api","/api/v1/member","/me","/studio","/staff","/original-works","/collection/tree-99","/journal/fake","/favicon.ico","/assets/foo"]){
    assert.equal((await get(path)).status,404,path);
  }
  for(const url of ["https://example.com/","http://anevum.com/","https://backstage.anevum.com/"]){
    assert.equal((await worker.fetch(new Request(url))).status,404,url);
  }
  assert.equal((await get("/",{method:"POST",body:"x"})).status,405);
  assert.equal((await get("/?token=bad")).status,404);
});

test("HEAD is bodyless and retains headers for all pages",async()=>{
  for(const path of paths){
    const head=await get(path,{method:"HEAD"});
    const getRes=await get(path);
    assert.equal(head.status,200);
    assert.equal(await head.text(),"");
    assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(getRes.headers));
  }
});

test("all media states block unapproved or absent master footage",async()=>{
  for(const path of ["/","/collection","/collection/tree-01","/chronicle","/atelier"]){
    const html=await (await get(path)).text();
    assert.doesNotMatch(html,/<video\b|<source\b|<img\b[^>]*src=/);
    assert.match(html,/pending|awaiting|recorded|time/i);
  }
});

test("Save-Data preference disables atmospheric motion without suppressing content",async()=>{
 const normal=await (await get("/")).text();
 const saved=await (await get("/",{headers:{"Save-Data":"on"}})).text();
 assert.match(normal,/<body class="motion-active">/);
 assert.match(saved,/<body>/);
 assert.doesNotMatch(saved,/<body class="motion-active">/);
 assert.match(saved,/Time is/);
});

test("all five specimens have explicit connected wayfinding and correct active public navigation",async()=>{
  for(const specimen of SPECIMENS){
    const html=await (await get("/collection/"+specimen.id)).text();
    const nav=html.match(/<nav aria-label="Browse specimen records">([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav,"Missing specimen wayfinding for "+specimen.id);
    assert.equal((nav.match(/<li>/g)||[]).length,5);
    for(const item of SPECIMENS)assert.match(nav,new RegExp('href="/collection/'+item.id+'"'));
    assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
    assert.match(nav,new RegExp('href="/collection/'+specimen.id+'" aria-current="page"'));
    assert.match(html,/<nav aria-label="Primary navigation">[\s\S]*?<a href="\/collection" aria-current="page">Collection<\/a>/);
  }
});

test("editorial page headings render as semantic text, never escaped HTML fragments",async()=>{
  for(const route of ["/journal","/about"]){
    const html=await (await get(route)).text();
    const h1=html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1];
    assert.ok(h1);
    assert.doesNotMatch(h1,/&lt;br&gt;|<br\b/i);
  }
});
