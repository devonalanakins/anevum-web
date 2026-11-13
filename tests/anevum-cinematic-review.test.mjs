// Isolated review contract; intentionally does not certify final motion footage.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../apps/anevum-public-studio/review/cinematic-laboratory.html',import.meta.url),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
const styles=html.match(/<style>([\s\S]*?)<\/style>/)?.[1];

test('cinematic review retains owner-approved public boundaries',()=>{
 assert.match(html,/<title>ANEVUM/);
 assert.match(html,/<meta name="robots" content="noindex,nofollow,noarchive">/);
 assert.equal((html.match(/<main\b/g)||[]).length,1);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/<a class="skip" href="#main">/);
 assert.match(html,/href="\/" aria-label="ANEVUM home"/);
 assert.match(html,/href="\/original-works\/experiments"/);
 assert.match(html,/href="\/original-works\/research"/);
 assert.match(html,/href="\/original-works\/archive"/);
 for(const anchor of [...html.matchAll(/href="#([a-z0-9-]+)"/g)]){
   assert.match(html,new RegExp('id="'+anchor[1]+'"'));
 }
 assert.doesNotMatch(html,/<form\b|\/member\b|\/staff\b|\/api\b/i);
});

test('all five independent media zones fail closed without approved video',()=>{
 assert.equal((html.match(/data-scene="(?:hero|experiments|research|experiences|archive)"/g)||[]).length,5);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.equal((html.match(/<video class="scene-video"/g)||[]).length,5);
 assert.doesNotMatch(html,/<video[^>]*\bautoplay\b/i);
 assert.doesNotMatch(html,/<video[^>]*\bsrc=/i);
 const paths=[...html.matchAll(/data-(?:video|mobile)-(?:webm|mp4)="([^"]+)"/g)];
 assert.equal(paths.length,12);
 for(const [,url] of paths) assert.match(url,/^\/original-works\/assets\/motion\/[a-z0-9-]+\.(webm|mp4)$/);
 assert.equal((html.match(/class="scene-poster/g)||[]).length,5);
});

test('review uses five exact same-branch visual references (never live assets)',()=>{
 const matches=[...html.matchAll(/<img class="scene-poster[^"]*" src="\.\/assets\/([a-z-]+\.webp)"/g)];
 const actual=matches.map(x=>x[1]).sort();
 const expected=['hero.webp','experiments.webp','research.webp','experiences.webp','archive.webp'].sort();
 assert.deepEqual(actual,expected);
 assert.match(html,/href="\.\/assets\/hero\.webp"/);
 for(const name of expected){
   const bytes=readFileSync(new URL('../apps/anevum-public-studio/review/assets/'+name,import.meta.url));
   assert.ok(bytes.byteLength>8000,'review image is not meaningful: '+name);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
 }
});

test('runtime has bounded playback, session visibility, and accessible still-mode fallbacks',()=>{
 assert.ok(script && styles,'inline resources must exist for independent review');
 new Script(script,{filename:'cinematic-laboratory.js'});
 assert.match(script,/IntersectionObserver/);
 assert.match(script,/remaining=2/);
 assert.match(script,/document\.visibilityState === 'visible'/);
 assert.match(script,/connection\?\.saveData === true/);
 assert.match(script,/prefers-reduced-motion: reduce/);
 assert.match(script,/scene\.dataset\.videoReady !== 'true'/);
 assert.match(script,/video\.muted = true/);
 assert.match(script,/video\.playsInline = true/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(styles,/@media\(forced-colors:active\)/);
 assert.match(html,/aria-label="Primary navigation"/);
 assert.match(html,/aria-label="Mobile navigation"/);
 assert.match(html,/loading="lazy"/);
});


test('review-only clip inspector is operable but cannot activate unapproved network media',()=>{
 assert.match(html,/id="review-media-tools"/);
 assert.match(html,/id="review-scene"/);
 assert.match(html,/id="review-file" type="file" accept="video\/mp4,video\/webm"/);
 assert.match(html,/id="review-clear"/);
 assert.match(html,/id="review-pause" aria-pressed="false"/);
 assert.match(html,/role="status" aria-live="polite"/);
 assert.match(script,/URL\.createObjectURL\(file\)/);
 assert.match(script,/URL\.revokeObjectURL/);
 assert.match(script,/\['video\/mp4','video\/webm'\]\.includes\(file\.type\)/);
 assert.match(script,/40 \* 1024 \* 1024/);
 assert.match(script,/state\.localUrl/);
 assert.match(script,/state\.listenersBound/);
 assert.match(script,/reviewPaused/);
 assert.match(script,/scene\.dataset\.videoReady='false'/);
 assert.doesNotMatch(script,/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});

test('procedural orbital study respects passive motion and accessibility boundaries',()=>{
 assert.match(html,/<canvas class="hero-orbit-canvas" aria-hidden="true" tabindex="-1"><\/canvas>/);
 assert.match(styles,/html\[data-orbital-motion=still\] \.hero-orbit-canvas\{display:none!important\}/);
 assert.match(script,/function drawOrbitalRing\(/);
 assert.match(script,/function renderOrbitalFrame\(/);
 assert.match(script,/function stopOrbitalMotion\(/);
 assert.match(script,/function syncOrbitalMotion\(/);
 assert.match(script,/cancelAnimationFrame\(orbitalHandle\)/);
 assert.match(script,/!isActive\(\) \|\| !visible\.has\(orbitalScene\)/);
 assert.match(script,/Math\.sqrt\(1800000 \/ \(rect\.width \* rect\.height\)\)/);
 assert.match(script,/syncOrbitalMotion\(\);/);
 assert.doesNotMatch(script,/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});

test('research terrain canvas adds true moving geometry without changing editorial links or approved-media gates',()=>{
 assert.match(html,/<a class="scene destination destination-research"[^>]+href="\/original-works\/research"/);
 assert.match(html,/<canvas class="research-flow-canvas" aria-hidden="true" tabindex="-1"><\/canvas>/);
 assert.equal((html.match(/class="research-flow-canvas"/g)||[]).length,1);
 assert.match(styles,/\.destination-research \.research-flow-canvas/);
 assert.match(styles,/\.destination-research\.is-playing \.research-flow-canvas\{opacity:0\}/);
 assert.match(styles,/html\[data-motion=still\] \.research-flow-canvas\{display:none!important\}/);
 assert.match(script,/const researchScene = document\.querySelector\('\.destination-research'\)/);
 assert.match(script,/const terrainHeight = /);
 assert.match(script,/function renderResearchFrame\(/);
 assert.match(script,/function syncResearchFlow\(/);
 assert.match(script,/function stopResearchFlow\(/);
 assert.match(script,/!isActive\(\) \|\| !visible\.has\(researchScene\)/);
 assert.match(script,/Math\.sqrt\(250000\/\(box\.width\*box\.height\)\)/);
 assert.match(script,/cancelAnimationFrame\(researchHandle\)/);
 assert.match(script,/syncResearchFlow\(\);/);
 assert.match(script,/video\.addEventListener\('playing',[^\n]*syncResearchFlow\(\)/);
 assert.match(script,/video\.addEventListener\('pause',[^\n]*syncResearchFlow\(\)/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});

test('experiments galaxy canvas preserves review-only motion gates',()=>{
 assert.match(html,/<a class="scene destination destination-experiments"[^>]*href="\/original-works\/experiments"/);
 assert.match(html,/<canvas class="experiments-vortex-canvas" aria-hidden="true" tabindex="-1"><\/canvas>/);
 assert.equal((html.match(/class="experiments-vortex-canvas"/g)||[]).length,1);
 assert.match(styles,/\.destination-experiments \.experiments-vortex-canvas/);
 assert.match(styles,/\.destination-experiments\.is-playing \.experiments-vortex-canvas\{opacity:0\}/);
 assert.match(styles,/html\[data-motion=still\] \.experiments-vortex-canvas\{display:none!important\}/);
 assert.match(script,/const experimentsScene = document\.querySelector\('\.destination-experiments'\)/);
 assert.match(script,/function spiralPoint\(/);
 assert.match(script,/function renderExperimentsFrame\(/);
 assert.match(script,/function syncExperimentsFlow\(/);
 assert.match(script,/function stopExperimentsFlow\(/);
 assert.match(script,/!isActive\(\) \|\| !visible\.has\(experimentsScene\)/);
 assert.match(script,/cancelAnimationFrame\(experimentsHandle\)/);
 assert.match(script,/syncExperimentsFlow\(\);/);
 assert.match(script,/video\.addEventListener\('playing',[^\n]*syncExperimentsFlow\(\)/);
 assert.match(script,/video\.addEventListener\('pause',[^\n]*syncExperimentsFlow\(\)/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});


test('Experiences portal motion remains passive and fail-closed',()=>{
 assert.match(html,/<a class="scene destination destination-experiences"[^>]+href="#experiences"/);
 assert.match(html,/<canvas class="experiences-atmosphere-canvas" aria-hidden="true" tabindex="-1"><\/canvas>/);
 assert.equal((html.match(/class="experiences-atmosphere-canvas"/g)||[]).length,1);
 assert.match(styles,/\.destination-experiences\.is-playing \.experiences-atmosphere-canvas\{opacity:0\}/);
 assert.match(styles,/html\[data-motion=still\] \.experiences-atmosphere-canvas\{display:none!important\}/);
 for(const token of [
  "const experiencesScene = document.querySelector('.destination-experiences')",
  "function sizeExperiencesCanvas()",
  "function renderExperiencesFrame(timestamp)",
  "function stopExperiencesAtmosphere()",
  "function syncExperiencesAtmosphere()",
  "Math.sqrt(210000/(rect.width*rect.height))",
  "!visible.has(experiencesScene)",
  "experiencesScene.classList.contains('is-playing')",
  "cancelAnimationFrame(experiencesHandle)",
  "window.addEventListener('pagehide',stopExperiencesAtmosphere)",
  "syncExperiencesAtmosphere();"
 ]) assert.ok(script.includes(token),'missing Experiences motion contract: '+token);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});


test('Archive illumination remains passive and fail-closed',()=>{
 assert.match(html,/<a class="scene destination destination-archive"[^>]*href="\/original-works\/archive"/);
 assert.match(html,/<canvas class="archive-illumination-canvas" aria-hidden="true" tabindex="-1"><\/canvas>/);
 assert.equal((html.match(/class="archive-illumination-canvas"/g)||[]).length,1);
 assert.match(styles,/\.destination-archive\.is-playing \.archive-illumination-canvas\{opacity:0\}/);
 assert.match(styles,/html\[data-motion=still\] \.archive-illumination-canvas\{display:none!important\}/);
 for(const token of [
  "const archiveScene = document.querySelector('.destination-archive')",
  "function sizeArchiveCanvas()",
  "function renderArchiveFrame(timestamp)",
  "function stopArchiveIllumination()",
  "function syncArchiveIllumination()",
  "Math.sqrt(215000/(rect.width*rect.height))",
  "!visible.has(archiveScene)",
  "archiveScene.classList.contains('is-playing')",
  "cancelAnimationFrame(archiveHandle)",
  "window.addEventListener('pagehide',stopArchiveIllumination)",
  "syncArchiveIllumination();"
 ]) assert.ok(script.includes(token),'missing Archive contract: '+token);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});

test('motion governor limits concurrent procedural rendering and prioritizes interaction',()=>{
 assert.match(script,/ANEVUM\.WEB\.BUILD\.2026-11-13\.010\.PROCEDURAL-MOTION-GOVERNOR/);
 assert.match(script,/const proceduralActive = new Set\(\)/);
 assert.match(script,/function refreshProceduralBudget\(\)/);
 assert.match(script,/const limit = innerWidth < 720 \? 1 : innerWidth < 1100 \? 2 : 3/);
 assert.match(script,/Math\.min\(rect\.right,vw\)-Math\.max\(rect\.left,0\)/);
 assert.match(script,/scene\.contains\(document\.activeElement\)/);
 assert.match(script,/scene\.matches\(':hover'\)/);
 assert.match(script,/candidates\.slice\(0,limit\)/);
 for(const scene of ['orbitalScene','researchScene','experimentsScene','experiencesScene','archiveScene']){
   assert.equal(script.split('!proceduralAllowed('+scene+')').length-1,2,'frame and start guards required: '+scene);
 }
 assert.match(script,/scene\.addEventListener\('pointerenter',syncPlayback/);
 assert.match(script,/scene\.addEventListener\('focusin',syncPlayback/);
 assert.match(script,/function scrollMotion\(\)[^\n]*syncPlayback\(\)/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});


test('procedural orbit yields to approved local film playback without changing media gates',()=>{
 assert.match(styles,/\.hero-scene\.is-playing \.hero-orbit-canvas\{display:none!important\}/);
 assert.match(script,/video\.addEventListener\('playing',[^\n]*syncOrbitalMotion\(\)/);
 assert.match(script,/video\.addEventListener\('pause',[^\n]*syncOrbitalMotion\(\)/);
 assert.match(script,/video\.addEventListener\('error',[^\n]*syncOrbitalMotion\(\)/);
 assert.match(script,/orbitalScene\.classList\.contains\('is-playing'\)/);
 for(const attribute of ['orbit-x','orbit-y','orbit-radius','orbit-cutoff']){
   assert.match(html,new RegExp('data-'+attribute+'="[0-9.]+"'));
 }
 assert.match(script,/function orbitalCenter\(\)/);
 assert.match(script,/Number\.isFinite\(parsed\)/);
 assert.match(script,/Math\.max\(orbitalCanvasWidth \/ naturalWidth, orbitalCanvasHeight \/ naturalHeight\)/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.equal((html.match(/data-video-ready="true"/g)||[]).length,0);
 new Script(script,{filename:'cinematic-laboratory.js'});
});


test('cinematic orbital accents are bounded and preserve the image-led scene',()=>{
 assert.match(script,/const tilt = ring\.tilt \+ \.13 \* Math\.sin\(phase \+ ring\.phase\)/);
 assert.match(script,/const spin = ring\.spin \+ \.18 \* Math\.sin\(phase - ring\.phase\)/);
 assert.match(script,/const yaw = ring\.yaw \+ \.09 \* Math\.cos\(phase \+ ring\.phase\)/);
 assert.doesNotMatch(script,/ring\.yaw \+ phase \* ring\.speed/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 const part=script.match(/function ringCoordinate\([\s\S]*?\n\}/)?.[0];
 assert.ok(part,'image-led orbital overlay remains independent');
 const coordinate=new Script('('+part.trim()+')',{filename:'ringCoordinate.js'}).runInNewContext({Math});
 const ring={radius:1,tilt:.73,spin:.24,yaw:.34,phase:.1};
 const first=coordinate(.83,0,ring,320,210,170);
 const quarter=coordinate(.83,Math.PI/2,ring,320,210,170);
 const closed=coordinate(.83,2*Math.PI,ring,320,210,170);
 assert.ok(Math.hypot(first.x-quarter.x,first.y-quarter.y)>1,'subtle orbital motion remains visible');
 assert.ok(Math.abs(first.x-closed.x)<1e-8 && Math.abs(first.y-closed.y)<1e-8 && Math.abs(first.z-closed.z)<1e-8,'accents loop without a pose jump');
 new Script(script,{filename:'cinematic-laboratory.js'});
});

test('cinematic preview handles invalid or unsupported video without repeated retries',()=>{
 assert.match(script,/if \(state\.initialized \|\| state\.failed\) return;/);
 assert.match(script,/sceneStates\.set\(scene,\{initialized:false,localUrl:null,listenersBound:false,failed:false\}\)/);
 assert.match(script,/const eligible = visible\.has\(scene\) && remaining > 0 && scene\.dataset\.videoReady === 'true' && !sceneStates\.get\(scene\)\.failed/);
 assert.match(script,/video\.addEventListener\('error',\(\)=>\{state\.failed=true;scene\.classList\.remove\('is-playing'\)/);
 assert.match(script,/video\.play\(\)\.catch\(\(\)=>\{/);
 assert.match(script,/if\(state\)state\.failed=true;/);
 assert.match(script,/state\.initialized=false;state\.failed=false/);
 assert.match(script,/state\.localUrl=null;state\.initialized=false;state\.failed=false/);
 assert.match(script,/video\.addEventListener\('playing',\(\)=>\{state\.failed=false;/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 new Script(script,{filename:'cinematic-laboratory.js'});
});


test('Experiments spiral avoids expensive software-rendered stroke shadows',()=>{
 const segment=script.split('function renderExperimentsFrame(timestamp)')[1]?.split('function syncExperimentsFlow()')[0];
 assert.ok(segment,'renderExperimentsFrame is available');
 // Software Chromium spent multiple seconds on blurred stroked Paths. Keep
 // native path movement, particles, gradient bloom and text fade instead.
 assert.match(segment,/const spine=new Path2D\(\)/);
 assert.match(segment,/c\.shadowBlur=0;\s*c\.stroke\(spine\);/);
 assert.doesNotMatch(segment,/c\.shadowBlur\s*=\s*[1-9]/);
 assert.match(segment,/c\.createRadialGradient\(/);
 assert.match(segment,/c\.fillRect\(0,0,w,h\)/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 new Script(script,{filename:'cinematic-laboratory.js'});
});


test('image-led specular accents never redraw baked metal and mobile review stays unobtrusive',()=>{
 const segment=script.split('function drawOrbitalRing(ctx, ring, phase, center) {')[1]?.split('function renderOrbitalFrame(timestamp)')[0];
 assert.ok(segment,'glint helper is present');
 assert.match(segment,/ctx\.createRadialGradient\(/);
 assert.match(segment,/const angle=2\*Math\.PI\*\(\(progress\+ring\.phase\+j\*\.51\)%1\)/); // complete-period wrap
 assert.match(segment,/ctx\.fillStyle=glow/);
 assert.doesNotMatch(segment,/Path2D|\.stroke\(|\.strokeStyle|ctx\.shadowBlur/);
 assert.match(script,/const reflectedY=Math\.min\(h\*\.84,center\.y\+center\.radius\*1\.55\)/);
 assert.match(script,/const reflectedAlpha=\.025\+\.008\*Math\.sin\(phase\)/);
 assert.match(styles,/@media\(max-width:720px\)\{\.review-media-tools\{position:relative;right:auto;bottom:auto/);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,5);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
 new Script(script,{filename:'cinematic-laboratory.js'});
});
