import test from "node:test";
import assert from "node:assert/strict";
import {INSTITUTE_PATHS,verifyInstitutePreviewDenied} from "../scripts/verify-anevum-institute-protected-preview.mjs";

const url="https://institute-pr-816-anevum-web-nextgen.devonakins.workers.dev";
const login="https://owner-login.cloudflareaccess.com/cdn-cgi/access/login";

test("probes 16 exact Institute pages, scripts and media, without public routes",()=>{
  assert.equal(INSTITUTE_PATHS.length,16);
  assert.equal(new Set(INSTITUTE_PATHS).size,16);
  assert.ok(Object.isFrozen(INSTITUTE_PATHS));
  for(const path of INSTITUTE_PATHS)assert.match(path,/^\/institute-preview(?:\/[a-z0-9./-]+)?$/);
  for(const required of ["/institute-preview","/institute-preview/dossier",
    "/institute-preview/laboratory/neuron-dynamics",
    "/institute-preview/laboratory/cluster-scheduling",
    "/institute-preview/media/observatory-review-mobile.webp"]){
    assert.ok(INSTITUTE_PATHS.includes(required));
  }
});

test("all actual Institute routes accept authentic Access redirects without following them",async()=>{
  const calls=[];
  const list=await verifyInstitutePreviewDenied(url,async(input,options)=>{
    calls.push({input,options});
    return {status:302,headers:new Headers({location:login}),body:{cancel:async()=>{}}};
  });
  assert.equal(list.length,16);
  for(let i=0;i<list.length;i++){
    assert.equal(calls[i].input,url+INSTITUTE_PATHS[i]);
    assert.equal(calls[i].options.credentials,"omit");
    assert.equal(calls[i].options.redirect,"manual");
    assert.equal(calls[i].options.method,"GET");
  }
});

test("unprotected responses and arbitrary redirects abort on the first path",async()=>{
  const bad=[
    {status:200,headers:new Headers()},
    {status:204,headers:new Headers()},
    {status:302,headers:new Headers()},
    {status:302,headers:new Headers({location:"https://example.com/cdn-cgi/access/login"})},
    {status:302,headers:new Headers({location:"https://owner-login.cloudflareaccess.com/wrong"})},
    {status:500,headers:new Headers()}
  ];
  for(const response of bad){
    let count=0;
    await assert.rejects(()=>verifyInstitutePreviewDenied(url,async()=>{count++;return response;}),/PREVIEW_ROUTE_NOT_ACCESS_PROTECTED/);
    assert.equal(count,1);
  }
});

test("unavailable requests and forged preview host fail closed",async()=>{
  await assert.rejects(()=>verifyInstitutePreviewDenied(url,async()=>{throw Error("secret");}),/INSTITUTE_ACCESS_PROBE_UNAVAILABLE/);
  let called=0;
  for(const invalid of ["https://anevum.com","http://institute-pr-816-anevum-web-nextgen.devonakins.workers.dev",
    "https://institute-pr-816-anevum-web-nextgen.devonakins.workers.dev.attacker.invalid"]){
    await assert.rejects(()=>verifyInstitutePreviewDenied(invalid,async()=>{called++;return null;}),/INVALID_OWNER_PREVIEW_ORIGIN/);
  }
  assert.equal(called,0);
});

test("401 and 403 count as denial, never as functioning authorized pages",async()=>{
  for(const status of [401,403]){
    const list=await verifyInstitutePreviewDenied(url,async()=>({status,headers:new Headers()}));
    assert.equal(list.length,16);
    assert.ok(list.every(x=>x.status===status));
  }
});
