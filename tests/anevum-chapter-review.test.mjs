import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, mkdtempSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {Script} from 'node:vm';
import {enhanceCinematicHTML,buildChapterReview} from '../scripts/ops/enhance-anevum-chapter-review.mjs';
import {verifyReviewBundle} from '../scripts/ops/serve-anevum-cinematic-review.mjs';

const SCENES=['hero','experiments','research','experiences','archive'];
function sourceHTML(){
 return '<!doctype html><html><head><title>ANEVUM | Five Living Environments | Offline Review</title></head><body>'+ 
   '<script type="module">const isActive = () => document.visibilityState === \'visible\' && !isStill();</script>'+ 
   SCENES.map(scene=>'<a data-scene="'+scene+'" data-video-ready="true"></a>').join('')+'</body></html>';
}
test('cinematic chapter review appends a single native dialog and a source-only playback gate',()=>{
 const changed=enhanceCinematicHTML(sourceHTML());
 assert.equal((changed.match(/id="cinema-dialog"/g)||[]).length,1);
 assert.match(changed,/<dialog[^>]*aria-labelledby="cinema-title"[^>]*aria-describedby="cinema-description"/);
 assert.match(changed,/data-chapter-open/);
 assert.match(changed,/document\.addEventListener\('anevum:chapter-state',\(\)=>syncPlayback\(\)\)/);
 assert.match(changed,/document\.dispatchEvent\(new Event\('anevum:chapter-state'\)\)/);
 assert.match(changed,/const chapterIds=\['hero','experiments','research','experiences','archive'\]/);
 assert.match(changed,/\[hidden\]\{display:none!important\}/);
 assert.match(changed,/chapters\.scrollLeft=/);
 assert.match(changed,/new Set|sourceScenes/);
 assert.match(changed,/prefers-reduced-motion: reduce/);
 assert.match(changed,/type="module"/);
});
test('native dialog script parses independently and avoids network/storage APIs',()=>{
 const html=enhanceCinematicHTML(sourceHTML());
 const scripts=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert.equal(scripts.length,2);
 for(const [i,content] of scripts.entries())assert.doesNotThrow(()=>new Script(content,{filename:`review-${i}.js`}));
 const overlay=scripts[1];
 for(const forbidden of ['fetch(', 'localStorage', 'sessionStorage', 'XMLHttpRequest', 'navigator.sendBeacon', 'registerServiceWorker', 'https://']){
  assert.equal(overlay.includes(forbidden),false,'Unexpected external API: '+forbidden);
 }
 assert.match(overlay,/const allowedVideo=s=>.*\^\\\.\\\/media/);
 assert.match(overlay,/const allowedImage=s=>.*\\.webp/);
 assert.match(overlay,/pause\.disabled=prefersStill\(\)/);
 assert.match(overlay,/if\(opener\?\.isConnected\)opener\.focus/);
 assert.match(overlay,/event\.key==='ArrowLeft'\|\|event\.key==='ArrowRight'/);
 assert.match(overlay,/event\.ctrlKey\|\|event\.metaKey/);
});
test('unexpected or previously enhanced documents fail closed',()=>{
 const original=sourceHTML();
 assert.throws(()=>enhanceCinematicHTML(original.replace('Five Living Environments | Offline Review','Other page')),/Expected original V32/);
 assert.throws(()=>enhanceCinematicHTML(original.replace('data-scene="archive"','data-scene="research"')),/Missing or duplicated/);
 assert.throws(()=>enhanceCinematicHTML(original.replace('const isActive = () =>','const isActive2 = () =>')),/Cannot gate legacy/);
 assert.throws(()=>enhanceCinematicHTML(enhanceCinematicHTML(original)),/Expected original V32|already installed/);
});
test('review-only V34 media hashes are mandatory before any output can be created',()=>{
 const root=mkdtempSync(join(tmpdir(),'anevum-v35-deny-'));
 try{
  const target=join(root,'output');
  const original=process.env.ANEVUM_V35_BASE;
  if(!original)return;
  assert.throws(()=>buildChapterReview(original,join(root,'missing.mp4'),join(root,'missing.webm'),target),/ENOENT/);
  assert.equal(existsSync(target),false);
 }finally{rmSync(root,{recursive:true,force:true})}
});
test('full V35 offline provenance and media replacement verified when explicit local sources are supplied', {skip:!process.env.ANEVUM_V35_BASE},()=>{
 const target=mkdtempSync(join(tmpdir(),'anevum-v35-integration-'));
 const destination=join(target,'review');
 try {
  const manifest=buildChapterReview(process.env.ANEVUM_V35_BASE,process.env.ANEVUM_V35_MP4,process.env.ANEVUM_V35_WEBM,destination);
  assert.equal(manifest.files.length,18);
  assert.equal(manifest.status,'REVIEW_ONLY_NOT_PRODUCTION_APPROVED');
  assert.equal(manifest.owner_accepted,false);
  assert.equal(manifest.published,false);
  assert.equal(manifest.rights_verified,false);
  assert.equal(manifest.webkit_verified,false);
  assert.equal(manifest.original_footage_native_4k,false);
  assert.equal(verifyReviewBundle(destination).size,20);
  const index=readFileSync(join(destination,'index.html'),'utf8');
  assert.match(index,/id="cinema-dialog"/);
  assert.match(index,/Five review films are installed locally/);
  assert.match(readFileSync(join(destination,'README.txt'),'utf8'),/cinematic-review\.mjs review 4179/);
  assert.match(index,/data-video-webm="\.\/media\/b6b8472b0917d107b7ec2fb2\.webm"/);
  assert.match(index,/data-video-mp4="\.\/media\/3a840f138b70e94c2a91daa5\.mp4"/);
  assert.throws(()=>buildChapterReview(process.env.ANEVUM_V35_BASE,process.env.ANEVUM_V35_MP4,process.env.ANEVUM_V35_WEBM,destination),/Refusing to overwrite/);
 }finally{rmSync(target,{recursive:true,force:true})}
});
