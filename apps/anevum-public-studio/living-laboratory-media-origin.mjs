/**
 * ANEVUM.WEB.BUILD.2026-11-14.011.EXACT-CINEMATIC-MEDIA-ORIGIN
 * Serve only approved, checksum-verified media from optional private R2.
 * Missing bindings, empty approvals and unknown paths all fail closed.
 */
import {APPROVED_CINEMATIC_MOTION,approvedCinematicAsset} from "./living-laboratory-cinema.mjs";

const PREFIX="/original-works/assets/motion/";
const BASE_HEADERS=Object.freeze({
 "Cache-Control":"public, max-age=31536000, immutable",
 "X-Content-Type-Options":"nosniff",
 "X-Robots-Tag":"noindex, nofollow, noarchive",
 "Cross-Origin-Resource-Policy":"same-origin",
 "Referrer-Policy":"no-referrer",
 "Accept-Ranges":"bytes"
});

function deny(status,extra={}){
 return new Response(null,{status,headers:{
  "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
  "X-Robots-Tag":"noindex, nofollow, noarchive",...extra
 }});
}
function shaHex(value){
 if(!(value instanceof ArrayBuffer)||value.byteLength!==32)return null;
 return [...new Uint8Array(value)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
function metadataMatches(object,asset){
 return !!object && object.key===asset.key &&
  typeof object.version==="string" && object.version.length>0 &&
  Number.isSafeInteger(object.size) && object.size===asset.bytes &&
  object.httpMetadata?.contentType===asset.contentType &&
  !object.httpMetadata?.contentEncoding &&
  shaHex(object.checksums?.sha256)===asset.sha256;
}
function parseRange(header,size){
 if(!header)return null;
 const m=/^bytes=(\d*)-(\d*)$/.exec(header);
 if(!m||(!m[1]&&!m[2]))return false;
 let start,end;
 if(!m[1]){
  const n=Number(m[2]);
  if(!Number.isSafeInteger(n)||n<1)return false;
  start=Math.max(0,size-n);end=size-1;
 }else{
  start=Number(m[1]);end=m[2]?Number(m[2]):size-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end))return false;
  end=Math.min(end,size-1);
 }
 if(start<0||start>=size||end<start)return false;
 return {offset:start,length:end-start+1,end};
}

export async function serveApprovedCinematicMotion(request,env,pathname,{
 registry=APPROVED_CINEMATIC_MOTION
}={}){
 if(request.method!=="GET"&&request.method!=="HEAD")
  return deny(405,{"Allow":"GET, HEAD"});
 if(typeof pathname!=="string"||!pathname.startsWith(PREFIX))return deny(404);
 let url;
 try{url=new URL(request.url)}catch{return deny(404)}
 if(url.search||url.pathname!==pathname)return deny(404);

 const asset=approvedCinematicAsset(pathname,registry);
 const bucket=env?.ANEVUM_CINEMATIC_MEDIA;
 if(!asset||!bucket||typeof bucket.head!=="function"||
    typeof bucket.get!=="function")return deny(404);
 let object;
 try{object=await bucket.head(asset.key)}
 catch{return deny(503,{"Retry-After":"30"})}
 if(!metadataMatches(object,asset))return deny(404);

 const etag='"'+asset.sha256+'"';
 const base={...BASE_HEADERS,"Content-Type":asset.contentType,"ETag":etag};
 const notModified=request.headers.get("if-none-match");
 if(notModified?.split(",").map(v=>v.trim()).some(v=>
    v===etag||v==="*"||v==="W/"+etag)){
  return new Response(null,{status:304,headers:base});
 }
 // HEAD is always the full representation; Range applies to GET alone.
 if(request.method==="HEAD")return new Response(null,{status:200,
  headers:{...base,"Content-Length":String(asset.bytes)}});

 const wanted=request.headers.get("range");
 const shouldRange=!!wanted&&
  (!request.headers.has("if-range")||request.headers.get("if-range")===etag);
 const range=shouldRange?parseRange(wanted,asset.bytes):null;
 if(range===false)return deny(416,{
  "Content-Range":"bytes */"+asset.bytes,"Accept-Ranges":"bytes"
 });
 let body;
 try{
  const options={onlyIf:{etagMatches:object.etag}};
  if(range)options.range={offset:range.offset,length:range.length};
  body=await bucket.get(asset.key,options);
 }catch{return deny(503,{"Retry-After":"30"})}
 if(!body?.body||!metadataMatches(body,asset)||
    body.version!==object.version)return deny(404);
 const headers={...base,"Content-Length":String(range?range.length:asset.bytes)};
 if(range)headers["Content-Range"]="bytes "+range.offset+"-"+range.end+"/"+asset.bytes;
 return new Response(body.body,{status:range?206:200,headers});
}
