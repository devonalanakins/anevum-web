/**
 * ANEVUM.WEB.BUILD.2026-11-14.015.FIVE-SCENE-CINEMATIC-ASSEMBLY
 * Combine existing V23 owner-review imagery and already-rendered, explicitly
 * supplied Experiments/Experiences/Archive codecs. No model generation,
 * network requests, credential use, approval, or production source changes.
 */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync,mkdirSync,rmSync,renameSync,copyFileSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const STATUS='REVIEW_ONLY_NOT_PRODUCTION_APPROVED';
const ADDITIONS=['experiments','experiences','archive'];
const VALID=/^(?:assets\/[a-f0-9]{24}\.webp|media\/[a-f0-9]{24}\.(?:mp4|webm))$/;
const digest=b=>createHash('sha256').update(b).digest('hex');
function check(condition,message){if(!condition)throw Error(message)}
function magic(bytes,ext){
 if(ext==='webp')return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 if(ext==='mp4')return bytes.toString('ascii',4,8)==='ftyp';
 if(ext==='webm')return bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
 return false;
}
function verifyRow(root,row){
 check(typeof row.path==='string'&&VALID.test(row.path),'Unexpected review path');
 check(Number.isSafeInteger(row.bytes)&&row.bytes>16&&/^[a-f0-9]{64}$/.test(row.sha256),'Invalid review row');
 check(row.path.split('/')[1].startsWith(row.sha256.slice(0,24)),'Filename not content addressed');
 const bytes=readFileSync(join(root,row.path));
 check(bytes.length===row.bytes&&digest(bytes)===row.sha256,'Review asset checksum failed: '+row.path);
 check(magic(bytes,row.path.split('.').at(-1)),'Invalid review media signature: '+row.path);
 return bytes;
}
function readValidatedBase(base){
 const manifest=JSON.parse(readFileSync(join(base,'manifest.json'),'utf8'));
 check(manifest.status===STATUS&&manifest.published===false&&manifest.owner_accepted===false&&manifest.rights_verified===false,'Base review must remain unapproved');
 check(Array.isArray(manifest.files)&&manifest.files.length===12,'Expected exact V23 12-file inventory');
 const assets=manifest.files.filter(x=>x.path.endsWith('.webp'));
 const movies=manifest.files.filter(x=>/\.(?:mp4|webm)$/.test(x.path));
 check(assets.length===6&&movies.length===6,'Unexpected V23 codec inventory');
 const paths=new Set();
 for(const entry of manifest.files){check(!paths.has(entry.path),'Duplicate base media');paths.add(entry.path);verifyRow(base,entry)}
 const html=readFileSync(join(base,'index.html'),'utf8');
 check(html.length>1000&&html.length<180000&&!html.includes('base64,'),'Unexpected embedded media');
 check((html.match(/data-scene="(?:hero|experiments|research|experiences|archive)"/g)||[]).length===5,'Expected five exact scene identifiers');
 check((html.match(/data-video-ready="true"/g)||[]).length===2 && (html.match(/data-video-ready="false"/g)||[]).length===3,'Expected only Hero and Research review-enabled');
 check(html.includes("!/^\\.\\/media\\/[a-f0-9]{24}\\.(?:webm|mp4)$/.test(src)"),'Review-only media URL allowlist missing');
 return {html,manifest};
}
function mediaFromUser(dir,name,ext){
 const bytes=readFileSync(join(dir,name+'.'+ext));
 check(bytes.length>1000&&bytes.length<30*1024*1024&&magic(bytes,ext),'Missing or invalid '+name+'.'+ext);
 const hash=digest(bytes);
 return {bytes,path:'media/'+hash.slice(0,24)+'.'+ext,bytesLength:bytes.length,sha256:hash};
}
function rewriteScene(html,scene,mp4,webm){
 const pattern=new RegExp('<a\\b[^>]*\\bdata-scene="'+scene+'"[^>]*>','g');
 const tags=[...html.matchAll(pattern)];
 check(tags.length===1,'Expected exactly one '+scene+' anchor');
 const original=tags[0][0];
 check(original.includes('data-video-ready="false"'),'Original scene must fail closed: '+scene);
 const expectedMp4='/original-works/assets/motion/'+scene+'.mp4';
 const expectedWebm='/original-works/assets/motion/'+scene+'.webm';
 check(original.includes('data-video-mp4="'+expectedMp4+'"')&&original.includes('data-video-webm="'+expectedWebm+'"'),'Unexpected original scene URLs');
 const updated=original.replace('data-video-ready="false"','data-video-ready="true"')
  .replace(expectedMp4,'./'+mp4.path).replace(expectedWebm,'./'+webm.path);
 return html.replace(original,updated);
}
export function assembleFiveSceneReview(baseDirectory,extraDirectory,outputDirectory){
 const base=resolve(baseDirectory),input=resolve(extraDirectory),output=resolve(outputDirectory);
 check(!existsSync(output),'Never overwrite or merge an existing review bundle');
 const {html:original,manifest:prior}=readValidatedBase(base);
 let html=original;
 const added=[];
 for(const name of ADDITIONS){
  const mp4=mediaFromUser(input,name,'mp4'),webm=mediaFromUser(input,name,'webm');
  check(mp4.sha256!==webm.sha256,'Codecs must be distinct');
  html=rewriteScene(html,name,mp4,webm);
  added.push(mp4,webm);
 }
 // In the V23 source, the first visible DOM scenes always occupy the two decoders.
 // With all five movies available this can starve Archive even when centered on
 // screen. Keep the two-decoder budget, but prefer actual viewport coverage,
 // pointer attention and keyboard focus. The public Worker remains unchanged.
 const originalScheduler=`  // Budget two simultaneously decoded videos, prioritizing the hero scene.
  let remaining=2;
  for (const scene of scenes) {
    const eligible = visible.has(scene) && remaining > 0 && scene.dataset.videoReady === 'true';
    if (!eligible) { stopVideo(scene); continue; }
    setupVideo(scene);
    const video = scene.querySelector('video');
    if (!sceneStates.get(scene).initialized || !video) continue;
    remaining -= 1;
    if (video.paused) video.play().catch(()=>scene.classList.remove('is-playing'));
  }`;
 const focusedScheduler=`  // Two active film decoders at most. Offscreen/prefetched candidates are
  // ignored, and actually viewed/hovered/focused scenes take precedence.
  const vw=window.innerWidth,vh=window.innerHeight;
  const ranked=scenes.filter(scene=>visible.has(scene)&&scene.dataset.videoReady==='true')
    .map(scene=>{
      const r=scene.getBoundingClientRect();
      const x=Math.max(0,Math.min(r.right,vw)-Math.max(0,r.left));
      const y=Math.max(0,Math.min(r.bottom,vh)-Math.max(0,r.top));
      if(x*y<1)return {scene,score:-Infinity};
      const ratio=x*y/Math.max(1,r.width*r.height);
      const center=(Math.max(0,r.top)+Math.min(vh,r.bottom))/2;
      const attention=(scene.contains(document.activeElement)?100:0)+(scene.matches(':hover')?10:0);
      return {scene,score:attention+4*ratio-Math.abs(center-vh/2)/Math.max(1,vh)};
    }).filter(candidate=>Number.isFinite(candidate.score))
    .sort((a,b)=>b.score-a.score||scenes.indexOf(a.scene)-scenes.indexOf(b.scene));
  const playing=new Set(ranked.slice(0,2).map(item=>item.scene));
  for(const scene of scenes){
    if(!playing.has(scene)){stopVideo(scene);continue;}
    setupVideo(scene);
    const video=scene.querySelector('video');
    if(!sceneStates.get(scene).initialized||!video)continue;
    if(video.paused)video.play().catch(()=>scene.classList.remove('is-playing'));
  }`;
 check(html.includes(originalScheduler)&&html.indexOf(originalScheduler)===html.lastIndexOf(originalScheduler),'Legacy preview scheduler changed unexpectedly');
 html=html.replace(originalScheduler,focusedScheduler);
 // Pause alone retains multiple decoded video frames after scrolling through scenes.
 // For the isolated five-scene owner review, unload retired source elements
 // without touching user-selected inspector blob URLs, so two actually active
 // films are the practical resource ceiling rather than just the play ceiling.
 const oldStop=`function stopVideo(scene) {
  const video=scene.querySelector('video');
  if (video && !video.paused) video.pause();
  scene.classList.remove('is-playing');
}`;
 const newStop=`function stopVideo(scene) {
  const video=scene.querySelector('video');
  if (video && !video.paused) video.pause();
  scene.classList.remove('is-playing');
  const state=sceneStates.get(scene);
  if(video && state?.initialized && !state.localUrl){
    video.removeAttribute('src');
    video.querySelectorAll('source').forEach(source=>source.remove());
    video.load();
    state.initialized=false;
  }
}`;
 check(html.includes(oldStop)&&html.indexOf(oldStop)===html.lastIndexOf(oldStop),'Legacy video teardown changed unexpectedly');
 html=html.replace(oldStop,newStop);
 check((html.match(/data-video-ready="true"/g)||[]).length===5 && !html.includes('data-video-ready="false"'),'Five review scenes must be ready only in local bundle');
 for(const row of added)check(!prior.files.some(old=>old.path===row.path),'New film duplicates existing V23 review file');
 html=html.replace(/<title>ANEVUM[^<]*<\/title>/,'<title>ANEVUM — Five Living Environments | Offline Review</title>');
 const files=[...prior.files,...added.map(({path,sha256,bytesLength})=>({path,sha256,bytes:bytesLength}))];
 check(files.length===18&&new Set(files.map(x=>x.path)).size===18,'Expected 18 distinct review assets');
 const manifest={status:STATUS,session:'ANEVUM.WEB.BUILD.2026-11-14.015.FIVE-SCENE-CINEMATIC-ASSEMBLY',
  source_sha256:digest(Buffer.from(original)),published:false,owner_accepted:false,rights_verified:false,
  scene_count:5,media_format:'separate self-contained, exact-hash-local-files',
  extra_sources:ADDITIONS.map(scene=>({scene,source:'previously-rendered-owner-review',approved:false})),files};
 const stage=output+'.pending-'+process.pid;
 check(!existsSync(stage),'Staging directory unexpectedly exists');
 try{
  mkdirSync(stage,{recursive:true});
  for(const entry of prior.files){const target=join(stage,entry.path);mkdirSync(dirname(target),{recursive:true});copyFileSync(join(base,entry.path),target)}
  for(const entry of added){const target=join(stage,entry.path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,entry.bytes,{flag:'wx'})}
  writeFileSync(join(stage,'index.html'),html,{flag:'wx'});
  writeFileSync(join(stage,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  writeFileSync(join(stage,'README.txt'),
   'ANEVUM Five Living Environments — REVIEW ONLY / NOT APPROVED / NOT LIVE\n'+
   'This folder contains owner-review clips and static posters. Rights and owner motion acceptance pending.\n'+
   'All five scenes are enabled only in this review bundle; the public ANEVUM site is unchanged.\n'+
   'Serve locally with the ANEVUM loopback review server, or open index.html.\n'+
   'Site links may navigate to the existing live site. Never publish this media folder.\n',{flag:'wx'});
  for(const entry of files)verifyRow(stage,entry);
  renameSync(stage,output);
 }catch(error){rmSync(stage,{force:true,recursive:true});throw error}
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);
  check(args.length===3,'Usage: node assemble-anevum-five-scene-review.mjs <V23/review> <directory-of-six-movies> <new-output-directory>');
  const m=assembleFiveSceneReview(...args);
  console.log('ANEVUM_FIVE_SCENE_REVIEW_PASS',JSON.stringify({scenes:m.scene_count,files:m.files.length,owner_accepted:m.owner_accepted}));
 }catch(error){console.error(String(error));process.exitCode=1}
}
