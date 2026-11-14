/**
 * ANEVUM.WEB.BUILD.2026-11-14.018.CINEMATIC-CHAPTER-REVIEW
 * Upgrade the verified local V32 five-scene bundle into an immersive owner-only
 * review with the improved V34 Archive film. No remote requests, publication,
 * Worker routes or implicit license/owner sign-off. Original media is immutable.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyReviewBundle } from './serve-anevum-cinematic-review.mjs';

const STATUS = 'REVIEW_ONLY_NOT_PRODUCTION_APPROVED';
const EXPECTED_V34 = Object.freeze({
  mp4: '3a840f138b70e94c2a91daa5017b85e53b9d3834b9348d1be75a9204079cab05',
  webm: 'b6b8472b0917d107b7ec2fb2e7d9c6fcddb3eefd8cead19db9c5dac96799bfec',
});
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const ensure = (condition, why) => { if (!condition) throw Error(why); };
const MEDIA = /^media\/[a-f0-9]{24}\.(?:webm|mp4)$/;

const css = String.raw`
/* Strictly local owner-review chapter stage. Not part of the published site. */
.cinema-launch{display:inline-flex;align-items:center;justify-content:center;gap:15px;position:relative;z-index:6;min-height:44px;max-width:100%;margin:13px auto 0;padding:10px 19px;border:1px solid #e7b979b0;border-radius:2px;background:#0c141ecb;color:#fae8d3;font:650 10px/1.4 var(--body,Arial,sans-serif);letter-spacing:.20em;text-transform:uppercase;cursor:pointer;transition:background .2s,border-color .2s}
.cinema-launch:hover{background:#452d21eb;border-color:#f3c99b}.cinema-launch:focus-visible{outline:2px solid #f9d2a8;outline-offset:4px}
.cinema-dialog{position:fixed;inset:0;margin:0;padding:0;max-width:none;max-height:none;width:100%;height:100%;height:100dvh;border:0;overflow:hidden;background:#050911;color:#fff;z-index:900;isolation:isolate}
.cinema-dialog:not([open]){display:none}.cinema-dialog::backdrop{background:#000f}
.cinema-film,.cinema-shade{position:absolute;inset:0}.cinema-film{overflow:hidden;z-index:-2;background:#070b12}
.cinema-backdrop,.cinema-poster,.cinema-video{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
.cinema-backdrop{object-fit:cover;opacity:.32;filter:blur(28px) saturate(.75);transform:scale(1.13)}
.cinema-poster,.cinema-video{object-fit:cover;object-position:center;transition:opacity .55s ease}
.cinema-video{opacity:0}.cinema-video.is-playing{opacity:1}
.cinema-dialog:not([data-chapter="hero"]) .cinema-poster,.cinema-dialog:not([data-chapter="hero"]) .cinema-video{object-fit:contain;object-position:center}
.cinema-shade{z-index:-1;pointer-events:none;background:linear-gradient(180deg,#04070bc9 0%,#04070b55 20%,transparent 41%,#030609c4 76%,#030609f0 100%)}
.cinema-layout{position:relative;display:grid;grid-template-rows:auto 1fr auto;min-height:100%;padding:max(17px,env(safe-area-inset-top)) max(23px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(23px,env(safe-area-inset-left));gap:18px}
.cinema-top,.cinema-controls,.cinema-bottom{display:flex;align-items:center;justify-content:space-between;gap:15px}
.cinema-mark{display:flex;flex-direction:column;gap:2px;letter-spacing:.25em;text-transform:uppercase;font-size:12px;font-weight:650}
.cinema-mark small{font-size:9px;letter-spacing:.15em;color:#e7c9a9;font-weight:450}
.cinema-close,.cinema-arrow,.cinema-pause{display:inline-flex;align-items:center;justify-content:center;min-height:44px;background:#09121edb;border:1px solid #bd997b8c;color:#fff7ef;cursor:pointer;border-radius:2px}
.cinema-close{gap:12px;padding:0 15px;font:600 10px/1 var(--body,Arial,sans-serif);text-transform:uppercase;letter-spacing:.18em}
.cinema-close span{font-size:21px;line-height:1;font-weight:300}
.cinema-copy{align-self:end;max-width:min(780px,100%);margin:0 0 clamp(24px,6vh,70px)}
.cinema-index{font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:#ebbc87;margin:0 0 15px;font-weight:650}
.cinema-copy h2{font-family:var(--display,'Helvetica Neue',Arial,sans-serif);font-weight:280;line-height:1.06;letter-spacing:.10em;font-size:clamp(38px,6vw,90px);margin:0 0 18px;text-wrap:balance}
.cinema-copy>p:not(.cinema-index){margin:0;max-width:560px;line-height:1.7;color:#e8e4df;font-size:clamp(13px,1.6vw,17px);text-shadow:0 1px 10px #000}
.cinema-origin{display:inline-block;margin-top:20px;padding-bottom:7px;border-bottom:1px solid #e9c397;color:#e7c19e;letter-spacing:.1em;font:650 10px/1.5 var(--body,Arial,sans-serif);text-transform:uppercase}
.cinema-origin[hidden]{display:none!important}
.cinema-bottom{border-top:1px solid #d1ae8c66;padding-top:13px;align-items:flex-start}
.cinema-controls{flex-shrink:0}.cinema-arrow{width:44px;font-size:19px}
.cinema-pause{padding:0 15px;min-width:116px;font:600 10px/1.4 var(--body,Arial,sans-serif);letter-spacing:.07em}
.cinema-chapters{display:flex;gap:7px;min-width:0;max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin}
.cinema-chapters button{padding:9px 12px;min-width:102px;min-height:44px;white-space:nowrap;background:#07101a90;border:1px solid transparent;color:#dad8d7;letter-spacing:.09em;font:600 10px/1.3 var(--body,Arial,sans-serif);cursor:pointer;text-align:left}
.cinema-chapters button span{display:block;color:#b3a08c;font:500 9px/1.4 var(--body,Arial,sans-serif);margin-bottom:3px}
.cinema-chapters button[aria-pressed="true"]{background:#2b1b15d9;border-color:#e9bc88;color:#fff5e7}
.cinema-dialog button:focus-visible,.cinema-origin:focus-visible{outline:2px solid #ffd9b2;outline-offset:3px}
.cinema-dialog button:disabled{opacity:.64;cursor:not-allowed}
.cinema-screen-reader{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
@media(max-width:720px){.cinema-layout{padding-top:max(14px,env(safe-area-inset-top));padding-left:17px;padding-right:17px;gap:9px}.cinema-copy{margin-bottom:20px}.cinema-copy h2{font-size:clamp(36px,10.8vw,53px);letter-spacing:.05em}.cinema-copy>p:not(.cinema-index){font-size:13px;line-height:1.55}.cinema-bottom{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px}.cinema-chapters{grid-column:1/-1;grid-row:2;max-width:100%}.cinema-controls{grid-column:1/-1;grid-row:1}.cinema-mark{font-size:11px}.cinema-copy{max-width:100%}.cinema-origin{font-size:9px}.cinema-dialog[data-chapter="hero"] .cinema-video,.cinema-dialog[data-chapter="hero"] .cinema-poster{object-fit:cover}}
@media(max-width:390px){.cinema-chapters button{min-width:94px;padding:8px 10px}.cinema-copy h2{font-size:36px}.cinema-index{margin-bottom:8px}.cinema-mark small{letter-spacing:.1em}}
@media(prefers-reduced-motion:reduce){.cinema-poster,.cinema-video,.cinema-launch{transition:none!important}}
@media(forced-colors:active){.cinema-dialog button,.cinema-chapters button{border:1px solid CanvasText}.cinema-shade{background:Canvas}}
`;
const markup = String.raw`
<!-- Isolated five-scene cinematic chapter inspector. Review only. -->
<dialog id="cinema-dialog" class="cinema-dialog" aria-labelledby="cinema-title" aria-describedby="cinema-description" data-chapter="hero">
 <div class="cinema-film" aria-hidden="true">
  <img id="cinema-backdrop" class="cinema-backdrop" alt="" decoding="async">
  <img id="cinema-poster" class="cinema-poster" alt="" decoding="async">
  <video id="cinema-video" class="cinema-video" muted playsinline loop preload="none" tabindex="-1"></video>
 </div>
 <div class="cinema-shade" aria-hidden="true"></div>
 <div class="cinema-layout">
  <div class="cinema-top"><div class="cinema-mark">ANEVUM <small>Five living environments / private review</small></div>
   <button id="cinema-close" class="cinema-close" type="button">Close <span aria-hidden="true">&#215;</span></button>
  </div>
  <div class="cinema-copy">
   <p id="cinema-index" class="cinema-index">01 / 05</p>
   <h2 id="cinema-title">The Observatory</h2>
   <p id="cinema-description">The gateway into a laboratory for the possible.</p>
   <a id="cinema-origin" class="cinema-origin" target="_blank" rel="noopener noreferrer" hidden>Open original destination</a>
  </div>
  <div class="cinema-bottom">
   <nav id="cinema-chapters" class="cinema-chapters" aria-label="Cinematic environments"></nav>
   <div class="cinema-controls">
    <button type="button" class="cinema-arrow" id="cinema-prev" aria-label="Previous cinematic scene">&#8592;</button>
    <button type="button" class="cinema-arrow" id="cinema-next" aria-label="Next cinematic scene">&#8594;</button>
    <button type="button" class="cinema-pause" id="cinema-pause" aria-pressed="false">Pause film</button>
   </div>
  </div>
 </div>
 <p class="cinema-screen-reader" id="cinema-status" role="status" aria-live="polite"></p>
</dialog>`;
const script = String.raw`
// Local review-only modal: no network, tracking, credentials or release toggles.
(() => {
 const chapterIds=['hero','experiments','research','experiences','archive'];
 const titles=['The Observatory','Experiments','Research','Experiences','Archive'];
 const descriptions=[
  'Enter the threshold between scientific curiosity and imagined worlds.',
  'Explore luminous systems, galaxies and experiments in progress.',
  'Trace the contours of ideas, computational questions and investigation.',
  'Walk toward the worlds and interactive experiences taking shape.',
  'Preserve the stories, artifacts and experiments that came before.'
 ];
 const dialog=document.querySelector('#cinema-dialog');
 if (!dialog || typeof dialog.showModal!=='function') return;
 const sourceScenes=new Map([...document.querySelectorAll('[data-scene]')].map(el=>[el.dataset.scene,el]));
 const poster=dialog.querySelector('#cinema-poster');
 const backdrop=dialog.querySelector('#cinema-backdrop');
 const video=dialog.querySelector('#cinema-video');
 const title=dialog.querySelector('#cinema-title');
 const text=dialog.querySelector('#cinema-description');
 const sequence=dialog.querySelector('#cinema-index');
 const status=dialog.querySelector('#cinema-status');
 const chapters=dialog.querySelector('#cinema-chapters');
 const origin=dialog.querySelector('#cinema-origin');
 const close=dialog.querySelector('#cinema-close');
 const previous=dialog.querySelector('#cinema-prev');
 const next=dialog.querySelector('#cinema-next');
 const pause=dialog.querySelector('#cinema-pause');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=window.matchMedia('(max-width: 720px)');
 const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const allowedVideo=s=>typeof s==='string' && /^\.\/media\/[a-f0-9]{24}\.(?:mp4|webm)$/.test(s);
 const allowedImage=s=>typeof s==='string' && /^\.\/assets\/[a-f0-9]{24}\.webp$/.test(s);
 let current=0,paused=false,opener=null;
 const prefersStill=()=>reduced.matches||connection?.saveData===true;
 function clearFilm(){
  video.pause(); video.classList.remove('is-playing');
  video.removeAttribute('src');video.querySelectorAll('source').forEach(node=>node.remove());
  video.load();
 }
 function syncPause(){
  pause.disabled=prefersStill();
  pause.setAttribute('aria-pressed',String(paused));
  pause.textContent=prefersStill()?'Still image only':paused?'Resume film':'Pause film';
 }
 function playFilm(){
  clearFilm(); syncPause();
  if(paused||prefersStill()||!dialog.open)return;
  const scene=sourceScenes.get(chapterIds[current]);
  if(!scene||scene.dataset.videoReady!=='true')return;
  const useMobile=mobile.matches;
  const webm=useMobile?(scene.dataset.mobileWebm||scene.dataset.videoWebm):scene.dataset.videoWebm;
  const mp4=useMobile?(scene.dataset.mobileMp4||scene.dataset.videoMp4):scene.dataset.videoMp4;
  for(const [path,type] of [[webm,'video/webm'],[mp4,'video/mp4']]){
    if(!allowedVideo(path))continue;
    const node=document.createElement('source');node.src=path;node.type=type;video.append(node);
  }
  if(!video.querySelector('source'))return;
  video.load();
  const playing=video.play();
  if(playing?.catch)playing.catch(()=>{status.textContent='Film playback was blocked. Poster remains available.';video.classList.remove('is-playing');});
 }
 video.addEventListener('playing',()=>video.classList.add('is-playing'));
 video.addEventListener('pause',()=>video.classList.remove('is-playing'));
 video.addEventListener('error',()=>{video.classList.remove('is-playing');status.textContent='Film could not play. Poster remains available.';});
 function show(index){
  current=(index+chapterIds.length)%chapterIds.length;
  const id=chapterIds[current],scene=sourceScenes.get(id);
  if(!scene)return;
  dialog.dataset.chapter=id;
  title.textContent=titles[current];text.textContent=descriptions[current];
  sequence.textContent=String(current+1).padStart(2,'0')+' / 05  -  '+id.toUpperCase();
  const main=scene.querySelector('img.scene-poster');
  const mobileHero=scene.querySelector('picture source[media="(max-width: 720px)"]');
  const src=mobile.matches&&id==='hero'?mobileHero?.getAttribute('srcset'):main?.getAttribute('src');
  if(allowedImage(src)){
    poster.src=src;backdrop.src=src;
  }else{poster.removeAttribute('src');backdrop.removeAttribute('src');}
  const href=scene.getAttribute('href');
  const valid=href && /^https:\/\/anevum\.com\/original-works\/[a-z-]+$/.test(href);
  origin.hidden=!valid;
  if(valid)origin.href=href;else origin.removeAttribute('href');
  [...chapters.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));
  const activeChapter=chapters.children[current];
  if(activeChapter){
   const left=activeChapter.offsetLeft-chapters.offsetLeft;
   chapters.scrollLeft=Math.max(0,left-(chapters.clientWidth-activeChapter.clientWidth)/2);
  }
  status.textContent=titles[current]+'; scene '+(current+1)+' of '+chapterIds.length+'.';
  playFilm();
 }
 chapterIds.forEach((name,index)=>{
  const button=document.createElement('button');button.type='button';
  button.innerHTML='<span>'+String(index+1).padStart(2,'0')+' / 05</span>'+titles[index];
  button.setAttribute('aria-label','View '+titles[index]);
  button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>show(index));chapters.append(button);
 });
 function open(id,trigger){
  if(!sourceScenes.has(id))return;
  opener=trigger||document.activeElement;
  document.documentElement.setAttribute('data-chapter-open','');
  dialog.showModal();
  document.dispatchEvent(new Event('anevum:chapter-state'));
  show(chapterIds.indexOf(id));close.focus();
 }
 function closed(){
  clearFilm();document.documentElement.removeAttribute('data-chapter-open');
  document.dispatchEvent(new Event('anevum:chapter-state'));
  if(opener?.isConnected)opener.focus({preventScroll:true});opener=null;
 }
 dialog.addEventListener('close',closed);
 close.addEventListener('click',()=>dialog.close());
 previous.addEventListener('click',()=>show(current-1));
 next.addEventListener('click',()=>show(current+1));
 pause.addEventListener('click',()=>{
  if(prefersStill())return;
  paused=!paused;
  playFilm();
 });
 dialog.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));
  }
 });
 for(const scene of sourceScenes.values()){
  if(scene.tagName!=='A')continue;
  scene.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();open(scene.dataset.scene,scene);
  });
 }
 const launch=document.createElement('button');launch.type='button';launch.className='cinema-launch';
 launch.id='cinema-launch';launch.textContent='Enter cinematic review  /  05 scenes';
 document.querySelector('.hero-actions')?.after(launch);
 launch.addEventListener('click',()=>open('hero',launch));
 reduced.addEventListener('change',()=>{if(dialog.open)playFilm();});
 mobile.addEventListener('change',()=>{if(dialog.open)show(current);});
 connection?.addEventListener?.('change',()=>{if(dialog.open)playFilm();});
 window.addEventListener('pagehide',clearFilm,{once:true});
})();`;

export function enhanceCinematicHTML(input) {
  ensure(typeof input==='string' && input.includes('Five Living Environments | Offline Review'), 'Expected original V32 cinematic review HTML');
  ensure(!input.includes('id="cinema-dialog"') && !input.includes('data-chapter-open'), 'Chapter modal is already installed');
  for(const scene of ['hero','experiments','research','experiences','archive']) {
    const tags=[...input.matchAll(new RegExp('\\bdata-scene="'+scene+'"','g'))];
    ensure(tags.length===1, 'Missing or duplicated scene '+scene);
  }
  const old='const isActive = () => document.visibilityState === \'visible\' && !isStill();';
  ensure(input.includes(old) && input.split(old).length===2, 'Cannot gate legacy playback on chapter modal');
  ensure(input.split('</head>').length===2 && input.split('</body>').length===2, 'Expected single document head/body');
  let result=input.replace(old,old.replace('!isStill();', "!isStill() && !document.documentElement.hasAttribute('data-chapter-open');") + "\ndocument.addEventListener('anevum:chapter-state',()=>syncPlayback());");
  result=result.replace('</head>','<style>\n'+css+'\n</style>\n</head>');
  result=result.replace('</body>',markup+'\n<script type="module">\n'+script+'\n</script>\n</body>');
  result=result.replace('Five Living Environments | Offline Review','Five Living Environments | Chapter Review');
  return result;
}

function newArchiveClip(file, ext) {
  const bytes=readFileSync(file);
  const hash=digest(bytes);
  ensure(hash===EXPECTED_V34[ext], 'Archive V34 source hash mismatch: '+ext);
  ensure(bytes.length>20000 && bytes.length<25*1024*1024, 'Unexpected Archive V34 media size');
  if(ext==='mp4')ensure(bytes.toString('ascii',4,8)==='ftyp','Invalid MP4 header');
  if(ext==='webm')ensure(bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])), 'Invalid WebM header');
  return {name:'media/'+hash.slice(0,24)+'.'+ext,sha256:hash,bytes:bytes.length,body:bytes};
}

export function buildChapterReview(v32Directory,archiveMp4,archiveWebm,outputDirectory) {
  const v32=resolve(v32Directory),output=resolve(outputDirectory);
  ensure(v32!==output && !output.startsWith(v32+'/'), 'Review output cannot overwrite or nest within base');
  ensure(!existsSync(output),'Refusing to overwrite any existing owner review');
  verifyReviewBundle(v32);
  const original=JSON.parse(readFileSync(join(v32,'manifest.json'),'utf8'));
  ensure(original.status===STATUS&&original.published===false&&original.rights_verified===false&&original.owner_accepted===false,
    'Original review must remain unapproved');
  ensure(original.scene_count===5&&original.files.length===18,'Expected V32 five-scene manifest');
  const mp4=newArchiveClip(archiveMp4,'mp4'),webm=newArchiveClip(archiveWebm,'webm');
  let html=readFileSync(join(v32,'index.html'),'utf8');
  const archiveTag=[...html.matchAll(/<a\b[^>]*\bdata-scene="archive"[^>]*>/g)];
  ensure(archiveTag.length===1,'Expected one archive card');
  const oldTag=archiveTag[0][0];
  const oldMp4=oldTag.match(/data-video-mp4="\.\/(media\/[a-f0-9]{24}\.mp4)"/)?.[1];
  const oldWebm=oldTag.match(/data-video-webm="\.\/(media\/[a-f0-9]{24}\.webm)"/)?.[1];
  ensure(oldMp4&&oldWebm&&oldMp4!==mp4.name&&oldWebm!==webm.name,'Expected distinct prior Archive media paths');
  const prev=new Set(original.files.map(x=>x.path));
  ensure(prev.has(oldMp4)&&prev.has(oldWebm)&&!prev.has(mp4.name)&&!prev.has(webm.name),'Archive path/inventory mismatch');
  html=html.replace(oldTag,oldTag.replace(oldMp4,mp4.name).replace(oldWebm,webm.name));
  // The V23 inspector instructions predate the complete five-film package.
  const staleInstructions='Hero MP4/WebM is included locally; other scenes are still procedural previews. Select a scene to load your own clip or clear the hero video to view the canvas-only effect. Files remain on this device.';
  ensure(html.includes(staleInstructions),'Legacy reviewer help copy changed unexpectedly');
  html=html.replace(staleInstructions,
    'Five review films are installed locally. Select a scene to replace its temporary clip with your own MP4 or WebM, or clear it to see the still artwork. No file leaves your device.');
  const staleStatus='V20 eight-second Observatory media is loaded for private motion review; not approved for public release.';
  ensure(html.includes(staleStatus),'Legacy reviewer status copy changed unexpectedly');
  html=html.replace(staleStatus,
    'Five scenes are available for private moving-image review; no footage is approved for publication.');
  html=enhanceCinematicHTML(html);
  ensure(Buffer.byteLength(html,'utf8')<150000,'Oversize local review HTML');
  const files=[...original.files.filter(x=>x.path!==oldMp4&&x.path!==oldWebm),
    ...[mp4,webm].map(({name,bytes,sha256})=>({path:name,bytes,sha256}))];
  ensure(files.length===18&&new Set(files.map(x=>x.path)).size===18,'Chapter review inventory not exact');
  const manifest={status:STATUS,session:'ANEVUM.WEB.BUILD.2026-11-14.018.CINEMATIC-CHAPTER-REVIEW',
    scene_count:5,source_manifest_sha256:digest(readFileSync(join(v32,'manifest.json'))),
    published:false,owner_accepted:false,rights_verified:false,
    webkit_verified:false,original_footage_native_4k:false,
    replacement:{scene:'archive',original:{mp4:oldMp4,webm:oldWebm},
      current:{mp4:mp4.name,webm:webm.name},review_only:true},files};
  const staged=output+'.pending-'+process.pid;
  ensure(!existsSync(staged),'Staging directory already exists');
  try {
    mkdirSync(staged,{recursive:true});
    for(const row of files){
      const target=join(staged,row.path);mkdirSync(dirname(target),{recursive:true});
      if(row.path===mp4.name)writeFileSync(target,mp4.body,{flag:'wx'});
      else if(row.path===webm.name)writeFileSync(target,webm.body,{flag:'wx'});
      else copyFileSync(join(v32,row.path),target);
    }
    writeFileSync(join(staged,'index.html'),html,{flag:'wx'});
    writeFileSync(join(staged,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
    writeFileSync(join(staged,'README.txt'),
      'ANEVUM V35: FIVE LIVING ENVIRONMENTS / PRIVATE CINEMATIC REVIEW\n\n'+
      'Review-only, not published, not rights-verified or owner-accepted.\n'+
      'Keep all files together. On desktop, open index.html. Some browsers\n'+
      'require the loopback HTTP server: node serve-anevum-cinematic-review.mjs review 4179\n'+
      'On iPhone, use a separately Access-protected hosted preview only after\n'+
      'owner approval. Do not upload this review package to a public host.\n'+
      'Select a scene card or the Enter cinematic review control, then use\n'+
      'the 01-05 chapter controls. Escape/Close exits; arrow keys change scenes.\n'+
      'The improved V34 Archive video is present; others are original V32 review films.\n',
      {flag:'wx'});
    verifyReviewBundle(staged);
    ensure(!existsSync(output),'Output changed during assembly');
    renameSync(staged,output);
  } finally { if(existsSync(staged))rmSync(staged,{recursive:true,force:true}); }
  return manifest;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {
    const [v32,mp4,webm,out]=process.argv.slice(2);
    ensure(process.argv.length===6,'Usage: node enhance-anevum-chapter-review.mjs <V32-dir> <V34-Archive.mp4> <V34-Archive.webm> <new-V35-dir>');
    const manifest=buildChapterReview(v32,mp4,webm,out);
    console.log('ANEVUM_V35_REVIEW_PASS',JSON.stringify({scenes:manifest.scene_count,media:manifest.files.length,
      output:resolve(out),approved:false,published:false}));
  } catch(error) { console.error(String(error));process.exitCode=1; }
}
