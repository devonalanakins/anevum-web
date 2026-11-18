// Loopback-only preview server. Never deploy to Cloudflare or bind a public interface.
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import worker from "../../apps/anevum-institute-preview/worker.mjs";
const host="127.0.0.1",port=4183;
const mediaDir=new URL("../../apps/anevum-institute-preview/media/",import.meta.url);
const REVIEW_BLOBS=Object.freeze({
  "observatory-review-desktop.webp":"af1e38f88853c67a1c98b0d6b01ff83f8f192bb5",
  "observatory-review-mobile.webp":"408331d10e3e618ca10be55ce8e85925cafe3051"
});
async function loadReviewMedia(name){
  if(!Object.hasOwn(REVIEW_BLOBS,name))return null;
  const bytes=await readFile(new URL(name,mediaDir));
  const actual=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
  if(actual!==REVIEW_BLOBS[name])throw new Error("Review asset blob integrity mismatch");
  return new Uint8Array(bytes);
}
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||"/","https://anevum.com");
    const response=await worker.fetch(new Request(url,{method:req.method}),{loadReviewMedia});
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){
    res.writeHead(500,{"Content-Type":"text/plain"});
    res.end("Preview server error");
    console.error("INSTITUTE_PREVIEW_LOOPBACK_ERROR",error?.message);
  }
});
server.listen(port,host,()=>console.log("ANEVUM_INSTITUTE_PREVIEW_LOOPBACK http://"+host+":"+port));
