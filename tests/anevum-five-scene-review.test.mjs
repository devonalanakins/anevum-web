import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync,copyFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {assembleFiveSceneReview} from '../scripts/ops/assemble-anevum-five-scene-review.mjs';
import {verifyReviewBundle,createReviewServer} from '../scripts/ops/serve-anevum-cinematic-review.mjs';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const SCENES=['hero','experiments','research','experiences','archive'];
const V23_SCHEDULER=`  // Budget two simultaneously decoded videos, prioritizing the hero scene.
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
const makeMedia=(ext,i,length=1400)=>{
 const bytes=Buffer.alloc(length,i);
 if(ext==='webp'){Buffer.from('RIFF').copy(bytes,0);Buffer.from('WEBP').copy(bytes,8)}
 if(ext==='mp4')Buffer.from('ftyp').copy(bytes,4);
 if(ext==='webm')Buffer.from([0x1a,0x45,0xdf,0xa3]).copy(bytes,0);
 return bytes;
};
const row=(directory,kind,ext,i)=>{
 const bytes=makeMedia(ext,i),sha256=digest(bytes),path=kind+'/'+sha256.slice(0,24)+'.'+ext;
 const file=join(directory,path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes);
 return {path,sha256,bytes:bytes.length};
};
function prepare(){
 const root=mkdtempSync(join(tmpdir(),'anevum-v32-test-'));
 const base=join(root,'base'),extra=join(root,'extra'),output=join(root,'output');
 mkdirSync(base);mkdirSync(extra);
 const files=[];
 for(let i=0;i<6;i++)files.push(row(base,'assets','webp',i+1));
 for(let i=0;i<3;i++)files.push(row(base,'media','mp4',i+10));
 for(let i=0;i<3;i++)files.push(row(base,'media','webm',i+15));
 const src=`if (!src || !/^\\.\\/media\\/[a-f0-9]{24}\\.(?:webm|mp4)$/.test(src)) continue;`;
 let html='<!doctype html><title>ANEVUM — V22 Lightweight Cinematic Review</title><script>'+src+'\nfunction syncPlayback(){\n'+V23_SCHEDULER+'\n}</script><main>';
 for(const scene of SCENES){
  const old=scene==='hero'||scene==='research'?'true':'false';
  html+='<a data-scene="'+scene+'" data-video-ready="'+old+'" data-video-webm="/original-works/assets/motion/'+scene+'.webm" data-video-mp4="/original-works/assets/motion/'+scene+'.mp4">'+scene+'</a>';
 }
 html+='</main>'+' '.repeat(1500);
 writeFileSync(join(base,'index.html'),html);
 writeFileSync(join(base,'manifest.json'),JSON.stringify({status:'REVIEW_ONLY_NOT_PRODUCTION_APPROVED',published:false,owner_accepted:false,rights_verified:false,files}));
 for(let i=0;i<3;i++)for(const [j,ext] of ['mp4','webm'].entries())writeFileSync(join(extra,['experiments','experiences','archive'][i]+'.'+ext),makeMedia(ext,100+i*3+j,1800));
 return {root,base,extra,output,files};
}
const inFixture=async fn=>{const data=prepare();try{return await fn(data)}finally{rmSync(data.root,{recursive:true,force:true})}};
test('five-scene assembly is hash-checked, no-overwrite and review-only',()=>inFixture(({base,extra,output})=>{
 const previous=readFileSync(join(base,'index.html'));
 const result=assembleFiveSceneReview(base,extra,output);
 assert.equal(result.files.length,18);
 assert.equal(result.scene_count,5);
 assert.equal(result.rights_verified,false);assert.equal(result.owner_accepted,false);assert.equal(result.published,false);
 assert.deepEqual(readFileSync(join(base,'index.html')),previous);
 const html=readFileSync(join(output,'index.html'),'utf8');
 assert.equal((html.match(/data-video-ready="true"/g)||[]).length,5);
 assert.equal((html.match(/data-video-ready="false"/g)||[]).length,0);
 assert.match(html,/scene\.matches\(':hover'\)/);
 assert.match(html,/scene\.contains\(document\.activeElement\)/);
 assert.match(html,/const playing=new Set\(ranked\.slice\(0,2\)/);
 for(const scene of SCENES)assert.match(html,new RegExp('data-scene="'+scene+'"'));
 assert.equal(verifyReviewBundle(output).size,20);
 assert.throws(()=>assembleFiveSceneReview(base,extra,output),/Never overwrite/);
}));
test('bad source digest, missing codec, wrong gate and unexpected base scheduler fail closed',()=>inFixture(({base,extra,output,files})=>{
 const src=join(base,files[0].path),original=readFileSync(src);
 writeFileSync(src,Buffer.alloc(original.length));
 assert.throws(()=>assembleFiveSceneReview(base,extra,output),/checksum failed/);
 writeFileSync(src,original);
 const missing=join(extra,'experiments.webm');
 const bytes=readFileSync(missing);
 writeFileSync(missing,Buffer.alloc(bytes.length));
 assert.throws(()=>assembleFiveSceneReview(base,extra,output),/Missing or invalid/);
 writeFileSync(missing,bytes);
 const f=join(base,'index.html'),html=readFileSync(f,'utf8');
 writeFileSync(f,html.replace(V23_SCHEDULER,'unknown scheduler'));
 assert.throws(()=>assembleFiveSceneReview(base,extra,output),/Legacy preview scheduler changed/);
 writeFileSync(f,html);
 const manifestFile=join(base,'manifest.json'),manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
 manifest.published=true;writeFileSync(manifestFile,JSON.stringify(manifest));
 assert.throws(()=>assembleFiveSceneReview(base,extra,output),/Base review must remain unapproved/);
 assert.equal(existsSync(output),false);
}));
test('V32 loopback serves exactly 18 hashed assets, range and no arbitrary paths',()=>inFixture(async({base,extra,output})=>{
 const manifest=assembleFiveSceneReview(base,extra,output);
 const server=createReviewServer(output);
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  const page=await fetch(origin+'/review/');
  assert.equal(page.status,200);assert.match(await page.text(),/Five Living Environments/);
  assert.equal(page.headers.get('cache-control'),'private, no-store');
  const movie=manifest.files.find(f=>f.path.endsWith('.mp4'));
  const chunk=await fetch(origin+'/review/'+movie.path,{headers:{Range:'bytes=0-15'}});
  assert.equal(chunk.status,206);assert.equal((await chunk.arrayBuffer()).byteLength,16);
  for(const path of ['/review/manifest.json','/review/nope.webm','/review/index.html?debug=1','/']){
   assert.equal((await fetch(origin+path)).status,404);
  }
  assert.equal((await fetch(origin+'/review/',{method:'POST'})).status,405);
 }finally{await new Promise(ok=>server.close(ok))}
}));
