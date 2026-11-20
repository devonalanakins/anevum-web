// Public Institute production CANDIDATE entrypoint, for dry-run packaging only.
// No production routes, deployments, DNS changes, or Access changes are authorized
// by this source file. Independent content/rights review and owner Safari acceptance
// must be satisfied before a separately approved production deployment.
import observatoryDesktop from "./media/observatory-review-desktop.webp";
import observatoryMobile from "./media/observatory-review-mobile.webp";
import facilityDesktop from "./media/facility-concept-v2-desktop.webp";
import facilityMobile from "./media/facility-concept-v2-mobile.webp";
import {makeInstitutePublicCandidate} from "./public-candidate-adapter.mjs";

const MEDIA=Object.freeze({
  "observatory-review-desktop.webp":observatoryDesktop,
  "observatory-review-mobile.webp":observatoryMobile,
  "facility-concept-v2-desktop.webp":facilityDesktop,
  "facility-concept-v2-mobile.webp":facilityMobile
});
// SHA-1 Git blob hashes for the existing reviewed in-repo media (not security tokens).
const GIT_BLOB_HASHES=Object.freeze({
  "observatory-review-desktop.webp":"af1e38f88853c67a1c98b0d6b01ff83f8f192bb5",
  "observatory-review-mobile.webp":"408331d10e3e618ca10be55ce8e85925cafe3051",
  "facility-concept-v2-desktop.webp":"75724819a8243e72c71a3ca807cdbe70d04bc2d6",
  "facility-concept-v2-mobile.webp":"7991d4919788079f56f05e94a132cd46f3be5592"
});
const encoder=new TextEncoder();
const verified=new Map();
async function loadReviewMedia(name){
  if(!Object.hasOwn(MEDIA,name)||!Object.hasOwn(GIT_BLOB_HASHES,name))return null;
  const source=MEDIA[name];
  const bytes=source instanceof ArrayBuffer?new Uint8Array(source):
    source instanceof Uint8Array?source:null;
  if(!bytes||bytes.length<4096||bytes.length>2097152)return null;
  if(!verified.has(name)){
    const prefix=encoder.encode("blob "+bytes.length+"\0");
    const data=new Uint8Array(prefix.length+bytes.length);
    data.set(prefix);data.set(bytes,prefix.length);
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1",data))).map(x=>x.toString(16).padStart(2,"0")).join("");
    if(digest!==GIT_BLOB_HASHES[name])throw new Error("Institute review asset integrity mismatch");
    verified.set(name,true);
  }
  return bytes;
}
export default makeInstitutePublicCandidate({loadReviewMedia});
