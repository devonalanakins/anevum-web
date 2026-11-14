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

export function renderCinematicPoster(scene,{priority=false,card=false}={}){
 if(!Object.prototype.hasOwnProperty.call(SCENE_POSTERS,scene))throw new TypeError("Unrecognized ANEVUM scene");
 const file=SCENE_POSTERS[scene];
 if(!Object.prototype.hasOwnProperty.call(LAB_ART,file))throw new Error("Unregistered ANEVUM poster");
 if(typeof priority!=="boolean"||typeof card!=="boolean")throw new TypeError("Invalid image-loading options");
 if(card&&priority)throw new Error("Only the hero may receive loading priority");
 // Poster stays visible even when media is blocked, unavailable or reduced.
 // The media gate is intentionally false and no video tags are emitted.
 const name=card?"lab-world-poster":"lab-hero-poster";
 return '<img class="'+name+'" data-cinema-scene="'+scene+'" data-cinema-ready="false"'+
  ' src="/original-works/assets/'+file+'" alt="" aria-hidden="true"'+
  ' width="1536" height="864" loading="'+(priority?"eager":"lazy")+'"'+
  ' decoding="async"'+(priority?' fetchpriority="high"':'')+'>';
}
