import test from 'node:test';
import assert from 'node:assert/strict';
import {LAB_ART} from '../apps/anevum-public-studio/living-laboratory-art.mjs';
import {CINEMATIC_POSTER_SCENES,APPROVED_CINEMATIC_MOTION,renderCinematicPoster} from '../apps/anevum-public-studio/living-laboratory-cinema.mjs';
import worker from '../apps/anevum-public-studio/worker.mjs';

test('cinematic scenes use explicit approved image allowlist with inactive motion',()=>{
 assert.deepEqual(CINEMATIC_POSTER_SCENES,['hero','experiments','research','experiences','archive']);
 assert.deepEqual(Object.keys(APPROVED_CINEMATIC_MOTION),[]);
 assert.ok(Object.isFrozen(APPROVED_CINEMATIC_MOTION));
 assert.throws(()=>renderCinematicPoster('__proto__'),/Unrecognized/);
 assert.throws(()=>renderCinematicPoster('hero',{priority:true,card:true}),/Only the hero/);
 assert.throws(()=>renderCinematicPoster('hero',{priority:'yes'}),/Invalid image-loading/);
 for(const scene of CINEMATIC_POSTER_SCENES){
  const html=renderCinematicPoster(scene,{card:scene!=='hero',priority:scene==='hero'});
  const file=html.match(/\/original-works\/assets\/([^"]+)/)?.[1];
  assert.ok(Object.hasOwn(LAB_ART,file),'poster not in production image allowlist '+scene);
  assert.match(html,new RegExp('data-cinema-scene="'+scene+'"'));
  assert.match(html,/data-cinema-ready="false"/);
  assert.match(html,/alt="" aria-hidden="true"/);
  assert.match(html,/decoding="async"/);
  assert.doesNotMatch(html,/<video|data:|https?:|onerror=|onload=/i);
 }
});

test('homepage prioritizes one real poster and lazy-loads all four destinations without scripts',async()=>{
 const response=await worker.fetch(new Request('https://anevum.com/'));
 assert.equal(response.status,200);
 const html=await response.text();
 assert.equal((html.match(/data-cinema-ready="false"/g)||[]).length,5);
 assert.equal((html.match(/class="lab-hero-poster"/g)||[]).length,1);
 assert.equal((html.match(/class="lab-world-poster"/g)||[]).length,4);
 assert.equal((html.match(/fetchpriority="high"/g)||[]).length,1);
 assert.equal((html.match(/loading="eager"/g)||[]).length,1);
 assert.equal((html.match(/loading="lazy"/g)||[]).length,8); // 4 scene posters + 4 research direction images
 assert.match(html,/<nav class="lab-worlds-grid" aria-label="Explore the four ANEVUM destinations">/);
 assert.match(html,/\.lab-world:hover \.lab-world-poster/);
 assert.match(html,/\.lab-art\{position:absolute/);
 assert.match(html,/\.lab-hero-poster\{display:block/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.doesNotMatch(html,/<script\b|<video\b|<iframe\b|<canvas\b|@HERO_POSTER@|@POSTER_/i);
 assert.match(response.headers.get('content-security-policy'),/default-src 'none'/);
 assert.match(response.headers.get('x-robots-tag'),/noindex/);
 const scenes=[...html.matchAll(/data-cinema-scene="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(scenes,CINEMATIC_POSTER_SCENES);
 for(const path of [...html.matchAll(/src="(\/original-works\/assets\/[^"]+)"/g)].map(x=>x[1])){
  const r=await worker.fetch(new Request('https://anevum.com'+path));
  assert.equal(r.status,200,path);
  assert.equal(r.headers.get('content-type'),'image/webp',path);
 }
});

test('public poster route remains fail-closed for unreviewed motion and private paths',async()=>{
 for(const path of ['/original-works/assets/hero-desktop.mp4','/original-works/assets/hero-mobile.webm','/original-works/assets/experiences.mp4','/original-works/private-cinema','/staff']){
  const r=await worker.fetch(new Request('https://anevum.com'+path));
  assert.equal(r.status,404,path);
 }
});
