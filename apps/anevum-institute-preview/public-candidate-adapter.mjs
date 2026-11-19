// Source-only public release candidate. NOT deployed and NOT an Access bypass.
// Production release requires owner acceptance, external reviews, routing and rollback.
import institute from "./worker.mjs";
import {CFP_101} from "./curriculum.mjs";

const ORIGIN="https://anevum.com";
const PUBLIC="/institute";
const INTERNAL="/institute-preview";
const NONINDEX=new Set(["/dossier","/studio","/profile"]);
const PUBLIC_PAGES=Object.freeze([
  "/", "/academy", "/academy/cfp-101", "/research", "/recognition",
  ...CFP_101.units.filter(unit=>unit.availability==="preview").map(unit=>unit.lessonPath),
  "/laboratory/and-gate", "/laboratory/cluster-scheduling",
  "/laboratory/neuron-dynamics"
]);
const SAFE_DENIAL=Object.freeze({
  "Content-Type":"text/plain; charset=utf-8",
  "Cache-Control":"no-store",
  "X-Content-Type-Options":"nosniff",
  "X-Robots-Tag":"noindex, nofollow, noarchive",
  "Content-Security-Policy":"default-src 'none'; frame-ancestors 'none'"
});
const escapeXml=value=>value.replaceAll("&","&amp;").replaceAll("<","&lt;")
  .replaceAll(">","&gt;").replaceAll('"',"&quot;");

function isInstitutePath(path){
  return path===PUBLIC||path.startsWith(PUBLIC+"/");
}
function canonicalPath(path){
  return path===PUBLIC+"/"?PUBLIC:path;
}
function sitemap(){
  const urls=PUBLIC_PAGES.map(path=>
    "  <url><loc>"+escapeXml(ORIGIN+PUBLIC+(path==="/"? "":path))+"</loc></url>"
  ).join("\n");
  return '<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls+'\n</urlset>\n';
}
function publicHtml(html,path){
  const canonical=ORIGIN+canonicalPath(path);
  // Preview links are all fixed, root-relative and same-origin. No external fetches.
  let result=html.replaceAll(INTERNAL,PUBLIC);
  result=result.replace(
    '<meta name="robots" content="noindex,nofollow,noarchive">',
    '<meta name="robots" content="'+(NONINDEX.has(path.slice(PUBLIC.length))?"noindex,nofollow":"index,follow")+'"><link rel="canonical" href="'+canonical+'">'
  );
  result=result.replace(
    '<meta name="description" content="ANEVUM design preview: free scientific learning, independent experiments, and evidence-based recognition.">',
    '<meta name="description" content="Independent, non-accredited scientific education: eight introductory computing lessons, interactive simulations, and local study tools.">'
  );
  result=result.replaceAll(" — ANEVUM Open Institute (Design Preview)"," — ANEVUM Open Institute");
  result=result.replace(
    /<div class="preview-ribbon"><strong>Design review:<\/strong>[^<]*<\/div>/,
    '<div class="preview-ribbon"><strong>Independent education:</strong> ANEVUM is non-accredited. Lessons and simulations are introductory; no degrees, clinical services, academic credit, external review, or credential issuance are provided.</div>'
  );
  result=result.replace(
    "accessing this private review requires owner authentication through Cloudflare Access.",
    "these browser-local learning tools do not require accounts and do not synchronize personal notes."
  );
  result=result.replace("Isolated design review / Not a public launch",
    "Independent education / Non-accredited");
  return result;
}

export function makeInstitutePublicCandidate({loadReviewMedia}={}){
  if(typeof loadReviewMedia!=="function")throw new TypeError("Reviewed media loader required");
  return {
    async fetch(request){
      let url;
      try{url=new URL(request.url);}catch{return new Response("Not found",{status:404,headers:SAFE_DENIAL});}
      if(url.protocol!=="https:"||url.hostname!=="anevum.com"||url.port
        ||!isInstitutePath(url.pathname)){
        return new Response("Not found",{status:404,headers:SAFE_DENIAL});
      }
      if(request.method!=="GET"&&request.method!=="HEAD")
        return new Response(null,{status:405,headers:{...SAFE_DENIAL,Allow:"GET, HEAD"}});
      const attribution=url.search==="?utm_source=chatgpt.com";
      if(url.search&&!attribution)return new Response("Not found",{status:404,headers:SAFE_DENIAL});
      if(url.pathname===PUBLIC+"/sitemap.xml"){
        if(attribution)return new Response(null,{status:302,headers:{...SAFE_DENIAL,Location:ORIGIN+url.pathname}});
        const xml=sitemap();
        const headers=new Headers(SAFE_DENIAL);
        // Robots directives apply to pages, not the submitted sitemap itself.
        headers.delete("X-Robots-Tag");
        headers.set("Content-Type","application/xml; charset=utf-8");
        headers.set("X-Anevum-Surface","open-institute-public-candidate-v1");
        return new Response(request.method==="HEAD"?null:xml,{headers});
      }
      const subpath=url.pathname.slice(PUBLIC.length);
      const internalPath=INTERNAL+(subpath===""?"":subpath);
      const upstream=await institute.fetch(new Request(ORIGIN+internalPath,{
        method:request.method
      }),{loadReviewMedia});
      if(upstream.status!==200)return new Response("Not found",{status:404,headers:SAFE_DENIAL});
      if(attribution)return new Response(null,{status:302,headers:{
        ...SAFE_DENIAL,Location:ORIGIN+canonicalPath(url.pathname)
      }});
      const headers=new Headers(upstream.headers);
      headers.delete("Content-Length");
      headers.set("X-Anevum-Surface","open-institute-public-candidate-v1");
      const kind=headers.get("Content-Type")||"";
      if(kind.startsWith("text/html")){
        const noindex=NONINDEX.has(subpath);
        if(noindex)headers.set("X-Robots-Tag","noindex, nofollow");
        else headers.delete("X-Robots-Tag");
        const html=publicHtml(await upstream.text(),url.pathname);
        return new Response(request.method==="HEAD"?null:html,{status:200,headers});
      }
      if(kind.startsWith("text/javascript")||kind.startsWith("text/css")){
        const body=(await upstream.text()).replaceAll(INTERNAL,PUBLIC);
        return new Response(request.method==="HEAD"?null:body,{status:200,headers});
      }
      // Image and JSON bodies remain unchanged; no preview secrets or server data.
      return new Response(request.method==="HEAD"?null:upstream.body,{status:200,headers});
    }
  };
}
