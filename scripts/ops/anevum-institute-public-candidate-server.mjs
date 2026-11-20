// Loopback-only public Institute candidate for browser QA. Never deploy or bind publicly.
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {makeInstitutePublicCandidate} from "../../apps/anevum-institute-preview/public-candidate-adapter.mjs";
const host="127.0.0.1",port=4184;
const mediaDir=new URL("../../apps/anevum-institute-preview/media/",import.meta.url);
const REVIEW_BLOBS=Object.freeze({
  "observatory-review-desktop.webp":"af1e38f88853c67a1c98b0d6b01ff83f8f192bb5",
  "observatory-review-mobile.webp":"408331d10e3e618ca10be55ce8e85925cafe3051",
  "facility-concept-v2-desktop.webp":"75724819a8243e72c71a3ca807cdbe70d04bc2d6",
  "facility-concept-v2-mobile.webp":"7991d4919788079f56f05e94a132cd46f3be5592"
});
async function loadReviewMedia(name){
  if(!Object.hasOwn(REVIEW_BLOBS,name))return null;
  const bytes=await readFile(new URL(name,mediaDir));
  const actual=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
  if(actual!==REVIEW_BLOBS[name])throw new Error("Review asset blob integrity mismatch");
  return new Uint8Array(bytes);
}
const worker=makeInstitutePublicCandidate({loadReviewMedia});
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||"/","https://anevum.com");
    const response=await worker.fetch(new Request(url,{method:req.method}));
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){
    res.writeHead(500,{"Content-Type":"text/plain"});
    res.end("Public candidate QA server error");
    console.error("INSTITUTE_PUBLIC_CANDIDATE_LOOPBACK_ERROR",error?.message);
  }
});
server.listen(port,host,()=>console.log("ANEVUM_INSTITUTE_PUBLIC_CANDIDATE_LOOPBACK http://"+host+":"+port));
