import test from "node:test";
import assert from "node:assert/strict";
import {
  REPORT_FORMAT,
  assessInstitutePreviewReadiness,
  readInstitutePreviewSnapshot
} from "../scripts/ops/anevum-institute-preview-readiness.mjs";

// Entirely synthetic records. These are not live Cloudflare IDs or credentials.
const appId="11111111-1111-4111-8111-111111111111";
const workerTag="a".repeat(32);
const otherWorker="b".repeat(32);
const account="c".repeat(32);
const token="synthetic-readonly-test-token";
const ownerPolicy=()=>({
  decision:"allow",
  include:[{email:{email:"id@devonakins.com"}}],
  exclude:[],
  require:[]
});
const sample=()=>({
  workers:[{id:"anevum-web-nextgen",tag:workerTag},{id:"unrelated-app",tag:otherWorker}],
  subdomain:{previews_enabled:true,enabled:false},
  accessApps:[{id:appId,name:"Synthetic ANEVUM owner preview",type:"self_hosted",
    destinations:[{type:"preview_worker",worker_id:workerTag}]}],
  policies:[ownerPolicy()],
  pinnedAppId:appId,
  pinnedWorkerTag:workerTag
});
const inspect=overrides=>assessInstitutePreviewReadiness({...sample(),...overrides});

test("complete synthetic owner-only preview remains read-only, never a release approval",()=>{
  const result=inspect();
  assert.deepEqual(result,{
    format:REPORT_FORMAT,
    target:"anevum-web-nextgen",
    readyForProtectedReview:true,
    blockedBy:[],
    changesMade:false,
    releaseApproved:false,
    realDeviceVerified:false
  });
  const redacted=JSON.stringify(result);
  for(const sensitive of [workerTag,otherWorker,appId,account,token,"id@devonakins.com"]){
    assert.ok(!redacted.includes(sensitive),"Diagnostic leaked a raw identity or credential");
  }
});

test("disabled remote preview and absent owner-only app are separately identified",()=>{
  const result=inspect({subdomain:{previews_enabled:false},accessApps:[],policies:null,pinnedAppId:"",pinnedWorkerTag:""});
  assert.equal(result.readyForProtectedReview,false);
  assert.deepEqual(result.blockedBy,[
    "WORKER_PREVIEWS_DISABLED",
    "OWNER_ONLY_PREVIEW_APP_MISSING",
    "PINNED_ACCESS_APP_ID_MISSING",
    "PINNED_WORKER_TAG_MISSING"
  ]);
});

test("missing, ambiguous, or mismatched Worker and Access identities never pass",()=>{
  const cases=[
    [{workers:[]},["TARGET_WORKER_UNVERIFIED"]],
    [{workers:[{id:"anevum-web-nextgen",tag:"bad"}]},["TARGET_WORKER_UNVERIFIED"]],
    [{workers:{items:[{id:"anevum-web-nextgen",tag:otherWorker}]}},["OWNER_ONLY_PREVIEW_APP_MISSING","PINNED_WORKER_TAG_MISMATCH"]],
    [{workers:null},["TARGET_WORKER_UNVERIFIED"]],
    [{accessApps:undefined},["ACCESS_INVENTORY_UNAVAILABLE"]],
    [{pinnedWorkerTag:otherWorker},["PINNED_WORKER_TAG_MISMATCH"]],
    [{pinnedAppId:"22222222-2222-4222-8222-222222222222"},["PINNED_ACCESS_APP_MISMATCH"]],
    [{accessApps:[...sample().accessApps,structuredClone(sample().accessApps[0])]},["MULTIPLE_PREVIEW_APPS_FOR_TARGET"]],
    [{policies:null},["OWNER_POLICY_UNVERIFIED"]]
  ];
  for(const [changed,expected] of cases){
    const state=inspect(changed);
    assert.equal(state.readyForProtectedReview,false,JSON.stringify(changed));
    for(const name of expected)assert.ok(state.blockedBy.includes(name),JSON.stringify({name,state}));
    assert.equal(state.changesMade,false);
  }
});

test("bypass, domain allow, unrelated email, and multi-destination Access are rejected",()=>{
  const cases=[
    {policies:[{...ownerPolicy(),decision:"bypass"}]},
    {policies:[{...ownerPolicy(),include:[{everyone:{}}]}]},
    {policies:[{...ownerPolicy(),include:[{email_domain:{domain:"anevum.com"}}]}]},
    {policies:[{...ownerPolicy(),include:[{email:{email:"different@example.test"}}]}]},
    {policies:[ownerPolicy(),ownerPolicy()]},
    {accessApps:[{...sample().accessApps[0],destinations:[...sample().accessApps[0].destinations,{type:"public",uri:"anevum.com"}]}]}
  ];
  for(const changed of cases){
    const result=inspect(changed);
    assert.equal(result.readyForProtectedReview,false,JSON.stringify(changed));
    assert.ok(result.blockedBy.some(x=>["UNSAFE_ACCESS_DECISIONS","ACCESS_ALLOW_NOT_OWNER_ONLY","PREVIEW_NOT_BOUND_TO_PINNED_WORKER"].includes(x)));
  }
});

function mockCloudflare({apps=sample().accessApps,workers=sample().workers,subdomain=sample().subdomain,policies=sample().policies,accessPages=1,workerPages=1,policyPages=1,badStatus=false}={}){
  const requests=[];
  async function fetchImpl(url,init){
    requests.push({url,method:init.method,redirect:init.redirect,token:init.headers.Authorization});
    let result, pages=1;
    if(url.endsWith("/workers/scripts?per_page=200")){result=workers;pages=workerPages;}
    else if(url.endsWith("/workers/scripts/anevum-web-nextgen/subdomain"))result=subdomain;
    else if(url.endsWith("/access/apps?page=1&per_page=100")){result=apps;pages=accessPages;}
    else if(url.endsWith("/access/apps/"+appId+"/policies")){result=policies;pages=policyPages;}
    else throw new Error("UNEXPECTED_MOCK_ROUTE");
    return {ok:!badStatus,json:async()=>({success:!badStatus,result,result_info:{total_pages:pages}})};
  }
  return {fetchImpl,requests};
}

test("read-only remote diagnostics use only GET and do not expose credentials in URLs",async()=>{
  const fake=mockCloudflare();
  const result=await readInstitutePreviewSnapshot({accountId:account,token,fetchImpl:fake.fetchImpl});
  assert.equal(fake.requests.length,4);
  assert.deepEqual(result.workers,sample().workers);
  assert.deepEqual(result.policies,sample().policies);
  for(const request of fake.requests){
    assert.equal(request.method,"GET");
    assert.equal(request.redirect,"error");
    assert.equal(request.token,"Bearer "+token);
    assert.ok(request.url.startsWith("https://api.cloudflare.com/client/v4/accounts/"+account+"/"));
    assert.ok(!request.url.includes(token));
  }
  assert.equal(assessInstitutePreviewReadiness({...result,pinnedAppId:appId,pinnedWorkerTag:workerTag}).readyForProtectedReview,true);
});

test("absent matching Access app reads no policies and returns blocked, with no write",async()=>{
  const fake=mockCloudflare({apps:[{id:"33333333-3333-4333-8333-333333333333",destinations:[{type:"preview_worker",worker_id:otherWorker}]}]});
  const state=await readInstitutePreviewSnapshot({accountId:account,token,fetchImpl:fake.fetchImpl});
  assert.equal(fake.requests.length,3);
  assert.equal(state.policies,null);
  assert.ok(inspect({accessApps:state.accessApps,policies:state.policies}).blockedBy.includes("OWNER_ONLY_PREVIEW_APP_MISSING"));
});

test("partial inventories and remote errors fail closed without making any writes",async()=>{
  for(const change of [{accessPages:2},{workerPages:2},{policyPages:2}]){
    const fake=mockCloudflare(change);
    await assert.rejects(
      ()=>readInstitutePreviewSnapshot({accountId:account,token,fetchImpl:fake.fetchImpl}),
      /_PAGINATION_UNVERIFIED/
    );
    assert.ok(fake.requests.every(x=>x.method==="GET"));
  }
  const remote=mockCloudflare({badStatus:true});
  await assert.rejects(
    ()=>readInstitutePreviewSnapshot({accountId:account,token,fetchImpl:remote.fetchImpl}),
    /CLOUDFLARE_READ_DENIED_OR_UNAVAILABLE/
  );
  for(const bad of ["", "not-a-tag", "1".repeat(31)]){
    let count=0;
    await assert.rejects(
      ()=>readInstitutePreviewSnapshot({accountId:bad,token,fetchImpl:async()=>{count++;throw Error("unexpected request");}}),
      /READONLY_CREDENTIALS_MISSING_OR_INVALID/
    );
    assert.equal(count,0);
  }
});


test("retired ANEVUM owner mailbox is denied even when a reusable policy remains syntactically valid",()=>{
  const input=sample();
  input.policies=[{...ownerPolicy(),include:[{email:{email:"devon@anevum.com"}}]}];
  const outcome=assessInstitutePreviewReadiness(input);
  assert.equal(outcome.readyForProtectedReview,false);
  assert.ok(outcome.blockedBy.includes("ACCESS_ALLOW_NOT_OWNER_ONLY"));
  assert.equal(outcome.releaseApproved,false);
});
