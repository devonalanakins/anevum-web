import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 LEARNER_PROFILE_PATH,learnerProfilePreviewEnabled,learnerProfileSchemaReady,
 validatePrivateLearnerUpdate,memberLearningProfileEndpoint
} from "../src/server/member-learning-profile.mjs";
import {blankMemberCard} from "../apps/anevum-institute-preview/local-member-schema.mjs";

const stage="https://anevum-member-staging.devonakins.workers.dev";
const prod="https://anevum.com";
const enabled={
 ANEVUM_MEMBER_PREVIEW_ENABLED:"true",
 ANEVUM_LEARNING_PROFILE_PREVIEW_ENABLED:"true",
 MEMBER_PREVIEW_ORIGIN:stage
};
function dbSimulator(table=true){
 const rows=new Map(),queries=[];
 return {
  rows,queries,
  prepare(sql){
   queries.push(sql);
   const bound=(args=[])=>({
    first:async()=>{
      if(sql.includes("sqlite_master"))return table?{name:"member_learning_profiles"}:null;
      if(sql.startsWith("SELECT revision"))return rows.get(args[0])??null;
      throw new Error("Unexpected SELECT");
    },
    run:async()=>{
      if(sql.startsWith("INSERT OR IGNORE")){
        const [userId,revision,display_name,tagline,interests_json]=args;
        if(rows.has(userId))return {meta:{changes:0}};
        rows.set(userId,{revision,display_name,tagline,interests_json});
        return {meta:{changes:1}};
      }
      if(sql.startsWith("UPDATE member_learning_profiles")){
        const [revision,display_name,tagline,interests_json,userId,expected]=args;
        const current=rows.get(userId);
        if(!current||current.revision!==expected)return {meta:{changes:0}};
        rows.set(userId,{revision,display_name,tagline,interests_json});
        return {meta:{changes:1}};
      }
      if(sql.startsWith("DELETE FROM member_learning_profiles")){
        rows.delete(args[0]);return {meta:{changes:1}};
      }
      throw new Error("Unrecognized mutation");
    }
   });
   return {first:()=>bound().first(),bind:(...values)=>bound(values)};
  }
 };
}
const request=(method="GET",body,other={})=>new Request(stage+LEARNER_PROFILE_PATH,{
 method,headers:{...(method!=="GET"?{Origin:stage}:{}),...(method==="PUT"?{"Content-Type":"application/json"}:{}),...other},
 ...(body!==undefined?{body:typeof body==="string"?body:JSON.stringify(body)}:{})
});
const call=async(db,user,method="GET",body,headers={},flags=enabled)=>{
 const res=await memberLearningProfileEndpoint(request(method,body,headers),{...flags,MEMBER_DB:db},user,stage);
 return {res,result:await res.json()};
};
const payload=(expectedRevision=0,overrides={})=>({expectedRevision,profile:{...blankMemberCard(),...overrides}});

test("private learning route remains disabled without dedicated staging controls, even in production",async()=>{
 const db=dbSimulator();
 assert.equal(learnerProfilePreviewEnabled({},stage),false);
 assert.equal(learnerProfilePreviewEnabled(enabled,stage),true);
 assert.equal(learnerProfilePreviewEnabled(enabled,prod),false);
 assert.equal(learnerProfilePreviewEnabled({...enabled,ANEVUM_MEMBER_PREVIEW_ENABLED:"false"},stage),false);
 assert.equal(learnerProfilePreviewEnabled({...enabled,ANEVUM_LEARNING_PROFILE_PREVIEW_ENABLED:"false"},stage),false);
 assert.equal(learnerProfilePreviewEnabled({...enabled,MEMBER_PREVIEW_ORIGIN:"https://evil.example"},stage),false);
 assert.equal(learnerProfilePreviewEnabled({...enabled,MEMBER_PREVIEW_ORIGIN:stage+"/other"},stage),false);
 assert.equal(await learnerProfileSchemaReady(db),true);
 assert.equal(await learnerProfileSchemaReady(dbSimulator(false)),false);
 const denied=await memberLearningProfileEndpoint(
   new Request(prod+LEARNER_PROFILE_PATH),{...enabled,MEMBER_DB:db},{id:"A"},prod);
 assert.equal(denied.status,503);
 const off=await call(db,{id:"A"},"GET",undefined,{}, {...enabled,ANEVUM_LEARNING_PROFILE_PREVIEW_ENABLED:"false"});
 assert.equal(off.res.status,503);
 assert.equal(db.queries.length,1,"Feature-off must not read learner records");
 const noUser=await call(db,null);
 assert.equal(noUser.res.status,401);
});
test("authenticated private profile is member-owned, versioned, and can be deleted without affecting others",async()=>{
 const db=dbSimulator();const A={id:"member-A"},B={id:"member-B"};
 let a=await call(db,A);
 assert.equal(a.res.status,200);assert.equal(a.result.profile,null);assert.equal(a.result.revision,0);
 const card=payload(0,{displayName:"Ada Experimenter",tagline:"Reproducing numerical evidence",interests:["Mathematics","Physics"]});
 a=await call(db,A,"PUT",card);
 assert.equal(a.res.status,200);
 assert.equal(a.result.revision,1);
 assert.equal(a.result.visibility,"private");
 assert.deepEqual(a.result.profile,card.profile);
 assert.equal(a.res.headers.get("cache-control"),"private, no-store");
 assert.equal(a.res.headers.get("access-control-allow-origin"),null);
 const b=await call(db,B);
 assert.equal(b.result.profile,null,"Member B cannot read A's private row");
 assert.equal(b.result.revision,0);
 const stale=await call(db,A,"PUT",payload(0,{displayName:"Stale value"}));
 assert.equal(stale.res.status,409);
 assert.equal((await call(db,A)).result.profile.displayName,"Ada Experimenter");
 const updated=await call(db,A,"PUT",payload(1,{displayName:"Ada Scholar"}));
 assert.equal(updated.res.status,200);
 assert.equal(updated.result.revision,2);
 assert.equal(updated.result.profile.displayName,"Ada Scholar");
 const bsaved=await call(db,B,"PUT",payload(0,{displayName:"Other Member"}));
 assert.equal(bsaved.result.revision,1);
 const deleted=await call(db,A,"DELETE");
 assert.equal(deleted.res.status,200);
 assert.equal(deleted.result.profile,null);
 assert.equal((await call(db,A)).result.revision,0);
 assert.equal((await call(db,B)).result.profile.displayName,"Other Member");
 assert.ok(db.queries.every(q=>!q.includes("member_entitlements")&&!q.includes("member_profiles ")&&!q.includes("member_rhen")),"Learning operations must stay in own table");
});
test("refuses forged roles, account selectors, invalid curriculum awards, malformed input, and CSRF",async()=>{
 const db=dbSimulator();const user={id:"member-A"};
 assert.throws(()=>validatePrivateLearnerUpdate({...payload(),role:"moderator"}),/Only revision/);
 assert.throws(()=>validatePrivateLearnerUpdate(payload(0,{awards:["scientist"]})),/Unrecognized/);
 assert.throws(()=>validatePrivateLearnerUpdate(payload(0,{memberId:"member-B"})),/Unrecognized/);
 assert.throws(()=>validatePrivateLearnerUpdate(payload(0,{interests:["Physics","Physics"]})),/up to five/);
 assert.throws(()=>validatePrivateLearnerUpdate(payload(-1)),/revision/);
 let r=await call(db,user,"PUT",{...payload(),published:true});assert.equal(r.res.status,400);
 r=await call(db,user,"PUT",payload(),{Origin:prod});assert.equal(r.res.status,403);
 r=await call(db,user,"PUT",payload(),{"X-ANEVUM-EXPECTED-MEMBER-ID":"member-B"});assert.equal(r.res.status,409);
 r=await call(db,user,"PUT",payload(),{"Content-Type":"text/plain"});assert.equal(r.res.status,400);
 r=await call(db,user,"PUT","x".repeat(2100));assert.equal(r.res.status,400);
 r=await call(db,user,"PUT","invalid json");assert.equal(r.res.status,400);
 r=await call(db,user,"PUT",payload(0,{displayName:"<svg onload=alert(1)>\n"}));assert.equal(r.res.status,400);
 assert.equal(db.rows.size,0,"No invalid mutation may reach persistence");
 const post=await call(db,user,"POST");assert.equal(post.res.status,405);
 const unsupported=await memberLearningProfileEndpoint(new Request(stage+LEARNER_PROFILE_PATH+"?user_id=member-B"),{...enabled,MEMBER_DB:db},user,stage);
 assert.equal(unsupported.status,400);
 const unavailable=await call(dbSimulator(false),user);
 assert.equal(unavailable.res.status,503);
});
test("staging migration is isolated, user-scoped, cascades account deletion, and production route uses verified session",()=>{
 const sql=readFileSync(new URL("../migrations-learning-preview/0001_private_learner_profile.sql",import.meta.url),"utf8");
 assert.match(sql,/user_id TEXT PRIMARY KEY NOT NULL REFERENCES "user"\("id"\) ON DELETE CASCADE/);
 assert.match(sql,/revision INTEGER NOT NULL/);
 const executableSQL=sql.split("\n").filter(line=>!line.trimStart().startsWith("--")).join("\n");
 assert.doesNotMatch(executableSQL,/CREATE TABLE IF NOT EXISTS member_profiles\b|CREATE TABLE IF NOT EXISTS member_entitlements\b|award|credential|public_url|role/i);
 const server=readFileSync(new URL("../src/server/member.mjs",import.meta.url),"utf8");
 assert.match(server,/const session = await auth\.api\.getSession/);
 assert.ok(server.indexOf("const session = await auth.api.getSession")<server.indexOf("return memberLearningProfileEndpoint(request,env,user,verifiedOrigin)"));
 assert.match(server,/if \(!user\?\.id\) return reply\(\{ message: "Sign in required\." \}, 401\)/);
 assert.match(server,/!safeMutation\(request, verifiedOrigin\)/);
 assert.doesNotMatch(server,/createAuthClient|LEARNING_PROFILE_PREVIEW_ENABLED\s*=\s*"true"/);
});
