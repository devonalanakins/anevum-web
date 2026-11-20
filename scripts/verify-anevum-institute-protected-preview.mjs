/** Anonymous-only Institute preview route check. Never logs URLs or tokens. */
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {parsePreviewOrigin,assertAnonymousAccessDenial} from "./verify-original-works-protected-preview.mjs";

export const INSTITUTE_PATHS=Object.freeze([
  "/institute-preview",
  "/institute-preview/academy",
  "/institute-preview/academy/cfp-101",
  "/institute-preview/learn/cfp-101/transistor-switching",
  "/institute-preview/laboratory/and-gate",
  "/institute-preview/laboratory/cluster-scheduling",
  "/institute-preview/laboratory/neuron-dynamics",
  "/institute-preview/dossier",
  "/institute-preview/studio",
  "/institute-preview/profile",
  "/institute-preview/curriculum/cfp-101.json",
  "/institute-preview/styles.css",
  "/institute-preview/client.js",
  "/institute-preview/neuron-lif-model.js",
  "/institute-preview/evidence-schema.js",
  "/institute-preview/media/observatory-review-mobile.webp"
]);
export async function verifyInstitutePreviewDenied(rawUrl,fetchImpl=fetch){
  const origin=parsePreviewOrigin(rawUrl);
  const results=[];
  for(const path of INSTITUTE_PATHS){
    const requestUrl=origin+path;
    let response;
    try{
      response=await fetchImpl(requestUrl,{
        method:"GET",
        credentials:"omit",
        redirect:"manual",
        headers:{Accept:"*/*","Cache-Control":"no-store"},
        signal:AbortSignal.timeout(15000)
      });
    }catch{
      throw new Error("INSTITUTE_ACCESS_PROBE_UNAVAILABLE");
    }
    try{
      assertAnonymousAccessDenial({
        status:response?.status,
        location:response?.headers?.get?.("location"),
        requestUrl,
        expectedOrigin:origin
      });
    }finally{
      if(response?.body?.cancel)await response.body.cancel();
    }
    results.push({path,status:response.status});
  }
  return results;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const results=await verifyInstitutePreviewDenied(process.env.BASE_URL||"");
    for(const result of results)console.log("INSTITUTE_PROTECTED "+result.path+": "+result.status);
    console.log("ANEVUM_INSTITUTE_ANONYMOUS_DENIAL_PASS: "+results.length+
      " actual Institute paths protected; authenticated Safari still pending.");
  }catch(error){
    const codes=new Set(["INVALID_OWNER_PREVIEW_ORIGIN","PREVIEW_ROUTE_NOT_ACCESS_PROTECTED","INSTITUTE_ACCESS_PROBE_UNAVAILABLE"]);
    console.error("Institute preview BLOCKED: "+(codes.has(error?.message)?error.message:"INSTITUTE_ACCESS_PROBE_UNAVAILABLE"));
    process.exitCode=1;
  }
}
