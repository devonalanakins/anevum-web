// ANEVUM Institute protected-review host adapter. Never used by production worker.
// Exact-name Worker Preview and Deployment hosts only; no arbitrary origin proxy.
import institute from "./worker.mjs";

const SUFFIX="-anevum-web-nextgen.devonakins.workers.dev";
const PREFIX=/^[a-z0-9](?:[a-z0-9-]{0,60}[a-z0-9])?$/;
const SAFE_HEADERS={
  "Content-Type":"text/plain; charset=utf-8",
  "Cache-Control":"no-store",
  "X-Content-Type-Options":"nosniff",
  "X-Robots-Tag":"noindex, nofollow, noarchive",
  "Content-Security-Policy":"default-src 'none'; frame-ancestors 'none'"
};
export function isInstituteReviewHost(hostname){
  if(typeof hostname!=="string"||!hostname.endsWith(SUFFIX))return false;
  const prefix=hostname.slice(0,-SUFFIX.length);
  return prefix.length>=3&&PREFIX.test(prefix)&&!prefix.includes("--");
}
export function makeInstituteHostedReview({loadReviewMedia}={}){
  if(typeof loadReviewMedia!=="function")throw new TypeError("Verified review media loader is required");
  return {
    async fetch(request){
      let url;
      try{url=new URL(request.url);}catch(_){return new Response("Not found",{status:404,headers:SAFE_HEADERS});}
      if(url.protocol!=="https:"||url.port||!isInstituteReviewHost(url.hostname)){
        return new Response("Not found",{status:404,headers:SAFE_HEADERS});
      }
      // The core preview deliberately accepts only aneuvum.com internally.
      // Rewrite the request in memory ONLY: never fetch the public origin.
      // Keep the original method/path/query for its fail-closed route contract.
      const internal=new Request("https://anevum.com"+url.pathname+url.search,{
        method:request.method
      });
      return institute.fetch(internal,{loadReviewMedia});
    }
  };
}
