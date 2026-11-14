import test from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {approvedCinematicScene,hasApprovedCinematicMotion,APPROVED_CINEMATIC_MOTION,
 renderCinematicPoster} from '../apps/anevum-public-studio/living-laboratory-cinema.mjs';
import {renderLivingLaboratoryHome} from '../apps/anevum-public-studio/living-laboratory-home.mjs';
import {approvedCinematicScript} from '../apps/anevum-public-studio/living-laboratory-cinema-controller.mjs';
import worker from '../apps/anevum-public-studio/worker.mjs';

import {createHash} from 'node:crypto';
const proof=(name,ext)=>{
 const bytes=Buffer.from(name.repeat(30));
 const sha256=createHash('sha256').update(bytes).digest('hex');
 return {path:'/original-works/assets/motion/'+sha256.slice(0,24)+'.'+ext,integrity:{sha256,bytes:bytes.length}};
};
const media=name=>proof(name,'mp4').path.slice(0,-4);
const mp4=proof('a','mp4'),webm=proof('b','webm'),
 mobileMp4=proof('c','mp4'),mobileWebm=proof('d','webm');
const valid={
 ownerApproved:true,rightsCleared:true,qcPassed:true,poster:'lab-hero-v1.webp',
 mp4:mp4.path,webm:webm.path,mobileMp4:mobileMp4.path,mobileWebm:mobileWebm.path,
 integrity:{mp4:mp4.integrity,webm:webm.integrity,
  mobileMp4:mobileMp4.integrity,mobileWebm:mobileWebm.integrity}
};
const approved=Object.freeze({hero:Object.freeze(valid)});

test('production manifest remains empty and script-free with default homepage CSP',async()=>{
 assert.deepEqual(Object.keys(APPROVED_CINEMATIC_MOTION),[]);
 assert.equal(hasApprovedCinematicMotion(),false);
 const response=await worker.fetch(new Request('https://anevum.com/'));
 const html=await response.text();
 assert.equal((html.match(/<video\b/g)||[]).length,0);
 assert.equal((html.match(/<script\b/g)||[]).length,0);
 assert.equal((html.match(/data-cinema-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(response.headers.get('content-security-policy'),/script-src|media-src/);
});

test('validated future hero emits video without src and exact tested controller bootstrap',()=>{
 assert.equal(hasApprovedCinematicMotion(approved),true);
 assert.equal(approvedCinematicScene('hero',approved),valid);
 const html=renderLivingLaboratoryHome({registry:approved});
 const markup=html.split('<script type="module"')[0];
 assert.equal((markup.match(/<video\b/g)||[]).length,1);
 assert.equal((markup.match(/data-cinema-approved="true"/g)||[]).length,1);
 assert.equal((html.match(/<script\b/g)||[]).length,1);
 assert.equal((markup.match(/loading="eager"/g)||[]).length,1);
 assert.equal((markup.match(/data-cinema-ready="true"/g)||[]).length,1);
 assert.equal((html.match(/data-cinema-ready="false"/g)||[]).length,4);
 assert.ok(markup.includes('data-cinema-mobile-mp4="'+mobileMp4.path+'"'));
 assert.ok(markup.includes('data-cinema-mobile-webm="'+mobileWebm.path+'"'));
 assert.match(markup,/muted loop playsinline preload="none"/);
 assert.doesNotMatch(markup,/<video[^>]*\s+src=/);
 assert.doesNotMatch(markup,/<source\b|autoplay\b|https?:\/\/example/);
 assert.match(html,/\.lab-cinema-video\.is-playing\{opacity:1\}/);
 assert.match(html,/@media\(prefers-reduced-motion:reduce\)\{\.lab-cinema-video\{display:none/);
 new Script(approvedCinematicScript(),{filename:'approved-cinema-bootstrap.js'});
 assert.ok(html.includes(approvedCinematicScript()));
});

test('every manifest entry must pass rights, owner, codec pair, poster and provenance gate',()=>{
 const invalid=[
  {...valid,ownerApproved:false},{...valid,rightsCleared:false},
  {...valid,qcPassed:false},{...valid,poster:'research-worlds-v1.webp'},
  {...valid,webm:'https://example.org/movie.webm'},
  {...valid,mp4:'/original-works/assets/motion/../../secret.mp4'},
  {...valid,mp4:'/original-works/assets/motion/a.mp4'},
  {...valid,mobileMp4:undefined},{...valid,mobileWebm:undefined},
  {...valid,mp4:media('e')+'.webm'},null,[],{},'approved'
 ];
 for(const candidate of invalid){
  const registry={hero:candidate};
  assert.throws(()=>approvedCinematicScene('hero',registry),/Unapproved|Unverified|Missing/);
  assert.throws(()=>renderLivingLaboratoryHome({registry}),/Unapproved|Unverified|Missing/);
 }
 assert.throws(()=>approvedCinematicScene('__proto__',{}),/Unrecognized/);
 assert.throws(()=>approvedCinematicScene('hero',[]),/Invalid cinematic manifest/);
 const stray={experiments:{...valid,poster:'rhen-generative-v1.webp',mobileMp4:media('f')+'.mp4',integrity:{mp4:mp4.integrity,webm:webm.integrity}}};
 assert.throws(()=>approvedCinematicScene('experiments',stray),/Unreviewed destination mobile/);
});

test('unapproved film cannot modify any original public routes',async()=>{
 const old=await (await worker.fetch(new Request('https://anevum.com/original-works'))).text();
 assert.match(old,/Somewhere,/);
 for(const path of [
  '/original-works/assets/motion/'+('a'.repeat(24))+'.mp4',
  '/original-works/assets/motion/'+('b'.repeat(24))+'.webm',
  '/original-works/private-cinema','/member'
 ])assert.equal((await worker.fetch(new Request('https://anevum.com'+path))).status,404,path);
 assert.equal(renderCinematicPoster('hero').includes('<video'),false);
});
