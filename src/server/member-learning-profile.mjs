// ANEVUM Open Institute: private, preview-only, session-bound learner profile.
// This module is never an alternate login, public profile, award issuer, or Command role.
import {validateMemberCard} from "../../apps/anevum-institute-preview/local-member-schema.mjs";

export const LEARNER_PROFILE_PATH="/api/member/learning/profile";
const TABLE="member_learning_profiles";
const PRODUCTION="https://anevum.com";
const HEADERS={
  "Cache-Control":"private, no-store",
  "X-Content-Type-Options":"nosniff",
  "X-Robots-Tag":"noindex, nofollow, noarchive"
};
function response(data,status=200){return Response.json(data,{status,headers:HEADERS});}
export function learnerProfilePreviewEnabled(env,origin){
  if(env?.ANEVUM_LEARNING_PROFILE_PREVIEW_ENABLED!=="true" ||
     env?.ANEVUM_MEMBER_PREVIEW_ENABLED!=="true" ||
     !origin || origin===PRODUCTION)return false;
  try{
    const configured=new URL(String(env.MEMBER_PREVIEW_ORIGIN||""));
    const host=configured.hostname.toLowerCase();
    const allowedHost=host.endsWith(".anevum.com")||host.endsWith(".workers.dev");
    return allowedHost && configured.protocol==="https:" && !configured.port &&
      configured.pathname==="/" && !configured.search && !configured.hash &&
      configured.origin===origin;
  }catch{return false;}
}
export async function learnerProfileSchemaReady(db){
  if(!db||typeof db.prepare!=="function")return false;
  try{
    const exists=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='member_learning_profiles'").first();
    return exists?.name===TABLE;
  }catch{return false;}
}
export function validatePrivateLearnerUpdate(value){
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Invalid private learner update.");
  if(Object.keys(value).sort().join(",")!=="expectedRevision,profile")throw new Error("Only revision and learner profile are accepted.");
  if(!Number.isSafeInteger(value.expectedRevision)||value.expectedRevision<0||value.expectedRevision>1000000)throw new Error("Invalid profile revision.");
  const issues=validateMemberCard(value.profile);
  if(issues.length)throw new Error(issues.join("; "));
  // No role, public visibility, reviewer status or credential fields are supported.
  return {expectedRevision:value.expectedRevision,profile:{
    version:1,displayName:value.profile.displayName,
    tagline:value.profile.tagline,interests:[...value.profile.interests]
  }};
}
async function readSmallJSON(request){
  if(request.headers.get("content-type")?.split(";")[0].trim().toLowerCase()!=="application/json")
    throw new Error("JSON body required.");
  if(!request.body)throw new Error("JSON body required.");
  const reader=request.body.getReader();const chunks=[];let size=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      if(!(value instanceof Uint8Array))throw new Error("Invalid body stream.");
      size+=value.byteLength;
      if(size>2048)throw new Error("Profile request exceeds 2 KiB.");
      chunks.push(value);
    }
  }finally{try{await reader.cancel();}catch{}try{reader.releaseLock();}catch{}}
  if(size===0)throw new Error("JSON body required.");
  const joined=new Uint8Array(size);let offset=0;
  for(const item of chunks){joined.set(item,offset);offset+=item.byteLength;}
  try{return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(joined));}
  catch{throw new Error("Invalid JSON encoding.");}
}
function storedCard(row){
  if(!row)return null;
  const value={version:1,displayName:row.display_name,tagline:row.tagline,interests:JSON.parse(row.interests_json)};
  if(validateMemberCard(value).length)throw new Error("Saved card failed validation.");
  return value;
}
async function selectOwn(db,userId){
  return db.prepare("SELECT revision, display_name, tagline, interests_json FROM member_learning_profiles WHERE user_id=?")
    .bind(userId).first();
}
export async function memberLearningProfileEndpoint(request,env,user,verifiedOrigin){
  if(!learnerProfilePreviewEnabled(env,verifiedOrigin))return response({message:"Learning profiles are unavailable."},503);
  if(!user?.id||typeof user.id!=="string"||user.id.length>128)return response({message:"Sign in required."},401);
  const url=new URL(request.url);
  if(url.origin!==verifiedOrigin)return response({message:"Untrusted request origin."},403);
  if(url.pathname!==LEARNER_PROFILE_PATH||url.search)return response({message:"Profile selection is not supported."},400);
  if(!["GET","PUT","DELETE"].includes(request.method))return response({message:"Method not allowed."},405);
  if(request.method!=="GET"){
    if(request.headers.get("Origin")!==verifiedOrigin)return response({message:"Same-origin request required."},403);
    if(request.headers.has("X-ANEVUM-EXPECTED-MEMBER-ID")&&
       request.headers.get("X-ANEVUM-EXPECTED-MEMBER-ID")!==user.id)
      return response({message:"Authenticated member changed. Reload."},409);
  }
  const db=env.MEMBER_DB;
  if(!await learnerProfileSchemaReady(db))return response({message:"Private learner storage is not ready."},503);
  try{
    if(request.method==="GET"){
      const row=await selectOwn(db,user.id);
      return response({available:true,visibility:"private",revision:row?.revision??0,profile:storedCard(row)});
    }
    if(request.method==="DELETE"){
      await db.prepare("DELETE FROM member_learning_profiles WHERE user_id=?").bind(user.id).run();
      return response({available:true,visibility:"private",revision:0,profile:null});
    }
    let update;
    try{update=validatePrivateLearnerUpdate(await readSmallJSON(request));}
    catch(error){return response({message:error instanceof Error?error.message:"Invalid learner data."},400);}
    const {expectedRevision,profile}=update;
    const revision=expectedRevision+1;
    const command=expectedRevision===0?
      db.prepare("INSERT OR IGNORE INTO member_learning_profiles (user_id,revision,display_name,tagline,interests_json) VALUES (?,?,?,?,?)")
        .bind(user.id,revision,profile.displayName,profile.tagline,JSON.stringify(profile.interests)):
      db.prepare("UPDATE member_learning_profiles SET revision=?,display_name=?,tagline=?,interests_json=?,updated_at=datetime('now') WHERE user_id=? AND revision=?")
        .bind(revision,profile.displayName,profile.tagline,JSON.stringify(profile.interests),user.id,expectedRevision);
    const result=await command.run();
    if(result?.meta?.changes!==1)return response({message:"Profile revision changed. Reload before saving."},409);
    const saved=await selectOwn(db,user.id);
    if(saved?.revision!==revision)throw new Error("Missing saved revision");
    return response({available:true,visibility:"private",revision,profile:storedCard(saved)});
  }catch{
    return response({message:"Private learner storage is unavailable."},503);
  }
}
