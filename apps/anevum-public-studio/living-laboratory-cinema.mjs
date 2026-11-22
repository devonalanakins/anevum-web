/**
 * ANEVUM.WEB.BUILD.2026-11-14.008.IMAGE-LED-CINEMA-SURFACES
 *
 * Production home scene artwork: explicit, same-origin, poster-first media.
 * No video asset has been visually/legally accepted for the public site.
 * Future motion must pass the separate release and media provenance gates.
 *
 * Keep this module server-only: no client scripting, remote image domains,
 * synthetic canvas rings, inline binary payloads or new authentication.
 */
import {LAB_ART} from "./living-laboratory-art.mjs";

const SCENE_POSTERS=Object.freeze({
 hero:"lab-hero-v1.webp",
 experiments:"rhen-generative-v1.webp",
 research:"research-computation-v1.webp",
 experiences:"research-worlds-v1.webp",
 archive:"lab-archive-v1.webp"
});
export const CINEMATIC_POSTER_SCENES=Object.freeze(Object.keys(SCENE_POSTERS));
export const APPROVED_CINEMATIC_MOTION=Object.freeze({}); // no film approved for public routing
const MOTION_PATH=/^\/original-works\/assets\/motion\/[a-f0-9]{24}\.(?:mp4|webm)$/;
const SHA256=/^[a-f0-9]{64}$/;
const MAX_MEDIA_BYTES=128*1024*1024;
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);

export function approvedCinematicScene(scene,registry=APPROVED_CINEMATIC_MOTION){
 if(!own(SCENE_POSTERS,scene))throw new TypeError("Unrecognized ANEVUM scene");
 if(!registry||typeof registry!=="object"||Array.isArray(registry))throw new TypeError("Invalid cinematic manifest");
 if(!own(registry,scene))return null;
 const film=registry[scene];
 if(!film||typeof film!=="object"||Array.isArray(film)||
    film.ownerApproved!==true||film.rightsCleared!==true||film.qcPassed!==true||
    film.poster!==SCENE_POSTERS[scene])throw new Error("Unapproved cinematic scene: "+scene);
 const variants=scene==="hero"?["mp4","webm","mobileMp4","mobileWebm"]:["mp4","webm"];
 if(!film.integrity||typeof film.integrity!=="object"||Array.isArray(film.integrity)||
    Object.keys(film.integrity).length!==variants.length){
   throw new Error("Missing cinematic integrity inventory: "+scene);
 }
 const used=new Set();
 for(const variant of variants){
  const ext=variant==="mp4"||variant==="mobileMp4"?"mp4":"webm";
  const path=film[variant],proof=film.integrity[variant];
  if(typeof path!=="string"||!MOTION_PATH.test(path)||!path.endsWith("."+ext)||used.has(path)){
   throw new Error("Unverified cinematic URL: "+scene+" "+variant);
  }
  if(!proof||typeof proof!=="object"||Array.isArray(proof)||
     !SHA256.test(proof.sha256)||!Number.isSafeInteger(proof.bytes)||
     proof.bytes<16||proof.bytes>MAX_MEDIA_BYTES||
     path.split("/").at(-1).slice(0,24)!==proof.sha256.slice(0,24)){
   throw new Error("Unverified cinematic integrity: "+scene+" "+variant);
  }
  used.add(path);
 }
 if(scene!=="hero"&&(own(film,"mobileMp4")||own(film,"mobileWebm"))){
  throw new Error("Unreviewed destination mobile variant");
 }
 return film;
}

/**
 * Server-authoritative allowlist. A matching filename alone never opens a
 * storage object: exact scene approval and the full SHA-256 must also match.
 */
export function approvedCinematicAsset(pathname,registry=APPROVED_CINEMATIC_MOTION){
 if(typeof pathname!=="string"||!MOTION_PATH.test(pathname))return null;
 let result=null;
 for(const scene of Object.keys(SCENE_POSTERS)){
  const film=approvedCinematicScene(scene,registry);
  if(!film)continue;
  const variants=scene==="hero"?["mp4","webm","mobileMp4","mobileWebm"]:["mp4","webm"];
  for(const variant of variants){
   if(film[variant]!==pathname)continue;
   if(result)throw new Error("Duplicate cinematic asset registration");
   const {sha256,bytes}=film.integrity[variant];
   const ext=pathname.endsWith(".mp4")?"mp4":"webm";
   result=Object.freeze({
    scene,variant,sha256,bytes,
    contentType:ext==="mp4"?"video/mp4":"video/webm",
    key:"cinema/"+sha256+"."+ext
   });
  }
 }
 return result;
}

export function hasApprovedCinematicMotion(registry=APPROVED_CINEMATIC_MOTION){
 return CINEMATIC_POSTER_SCENES.some(scene=>approvedCinematicScene(scene,registry)!==null);
}

export function renderCinematicPoster(scene,{priority=false,card=false,registry=APPROVED_CINEMATIC_MOTION}={}){
 if(!Object.prototype.hasOwnProperty.call(SCENE_POSTERS,scene))throw new TypeError("Unrecognized ANEVUM scene");
 const file=SCENE_POSTERS[scene];
 if(!Object.prototype.hasOwnProperty.call(LAB_ART,file))throw new Error("Unregistered ANEVUM poster");
 if(typeof priority!=="boolean"||typeof card!=="boolean")throw new TypeError("Invalid image-loading options");
 if(card&&priority)throw new Error("Only the hero may receive loading priority");
 // Poster stays visible even when media is blocked, unavailable or reduced.
 // The media gate is intentionally false and no video tags are emitted.
 const name=card?"lab-world-poster":"lab-hero-poster";
 const motion=approvedCinematicScene(scene,registry);
 const poster='<img class="'+name+'" data-cinema-scene="'+scene+'" data-cinema-ready="'+(motion?"true":"false")+'"'+
  ' src="/original-works/assets/'+file+'" alt="" aria-hidden="true"'+
  ' width="1536" height="864" loading="'+(priority?"eager":"lazy")+'"'+
  ' decoding="async"'+(priority?' fetchpriority="high"':'')+'>';
 if(!motion)return poster;
 // Browser controller adds the verified URL only when eligible and visible.
 // No source, autoplay or preload request is generated by server-side markup.
 const portrait=scene==="hero" ?
  ' data-cinema-mobile-mp4="'+motion.mobileMp4+'" data-cinema-mobile-webm="'+motion.mobileWebm+'"' : '';
 const layer=card?"lab-cinema-video lab-world-video":"lab-cinema-video lab-hero-video";
 return poster+'<video class="'+layer+'" data-cinema-approved="true" data-cinema-scene="'+scene+'"'+
  ' data-cinema-mp4="'+motion.mp4+'" data-cinema-webm="'+motion.webm+'"'+portrait+
  ' muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video>';
}
