import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {createLocalReviewServer,stageCurrentReview} from '../scripts/ops/anevum-cinematic-local-preview.mjs';
const page='/original-works/review/cinematic-laboratory.html';
const names=[...['hero','hero-mobile','experiments','research','experiences','archive'].map(n=>'/original-works/review/assets/'+n+'.webp'),...['hero-desktop','hero-mobile'].flatMap(n=>['/original-works/assets/motion/'+n+'.mp4','/original-works/assets/motion/'+n+'.webm'])];
const sum=b=>createHash('sha256').update(b).digest('hex');
function createFixture(){
 const root=mkdtempSync(join(tmpdir(),'anevum-v17-test-')),src=join(root,'src'),h=join(root,'review.html');
 const review=`<html><title>ANEVUM</title><div data-scene="hero" data-video-ready="false"><picture><source srcset="./assets/hero-mobile.webp"></picture></div>${['experiments','research','experiences','archive'].map(n=>`<a data-scene="${n}" data-video-ready="false"></a>`).join('')}`;
 writeFileSync(h,review);
 const items=[[page,Buffer.from('V16 old page')],...names.map(x=>[x,Buffer.from('review-only media '+x)])];
 for(const [path,content] of items){const f=join(src,path.slice(1));mkdirSync(dirname(f),{recursive:true});writeFileSync(f,content);}
 writeFileSync(join(src,'media-review-manifest.json'),JSON.stringify({status:'REVIEW_ONLY_NOT_PRODUCTION_APPROVED',page,files:items.map(([path,b])=>({path,bytes:b.length,sha256:sum(b)}))}));
 return {root,src,h};
}
test('V17 bridge leaves committed review unchanged and enables only local hero copy',()=>{
 const f=createFixture();let out;
 try{
  const before=readFileSync(f.h,'utf8');out=stageCurrentReview(f.h,f.src);
  const html=readFileSync(join(out,page.slice(1)),'utf8');
  assert.match(html,/data-scene="hero" data-video-ready="true"/);
  assert.equal((html.match(/data-video-ready="false"/g)||[]).length,4);
  assert.equal((readFileSync(f.h,'utf8').match(/data-video-ready="false"/g)||[]).length,5);
  assert.equal(readFileSync(f.h,'utf8'),before);
  assert.ok(out.startsWith(tmpdir()));
  assert.equal(readFileSync(join(out,names[0].slice(1)),'utf8'),'review-only media '+names[0]);
 }finally{rmSync(f.root,{recursive:true,force:true});if(out)rmSync(out,{recursive:true,force:true});}
});
test('V17 refuses changed media and video outside the supplied exact-hash allowlist',()=>{
 const f=createFixture();try{
   const bad=join(f.src,names[0].slice(1));writeFileSync(bad,'changed');
   assert.throws(()=>stageCurrentReview(f.h,f.src),/Media verification failed/);
 }finally{rmSync(f.root,{recursive:true,force:true});}
});
test('V17 same-origin local server supports verified range and rejects unknown or mutable paths',async()=>{
 const f=createFixture();let out,server;
 try{
  out=stageCurrentReview(f.h,f.src);server=createLocalReviewServer(out);
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const origin='http://127.0.0.1:'+server.address().port;
  let r=await fetch(origin+'/original-works/assets/motion/hero-desktop.mp4',{headers:{Range:'bytes=0-4'}});
  assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,5);
  assert.equal(r.headers.get('content-range').startsWith('bytes 0-4/'),true);
  r=await fetch(origin+page,{method:'HEAD'});assert.equal(r.status,200);assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow, noarchive');
  r=await fetch(origin+'/api/member/me');assert.equal(r.status,404);
  r=await fetch(origin+page+'?x=1');assert.equal(r.status,404);
  r=await fetch(origin+page,{method:'POST'});assert.equal(r.status,405);
  r=await fetch(origin+'/original-works/assets/motion/hero-desktop.mp4',{headers:{Range:'bytes=999999-'}});assert.equal(r.status,416);
  for(const invalid of ['bytes=-','bytes=-9999999999999999999999','bytes=0-9999999999999999999999']){
    r=await fetch(origin+'/original-works/assets/motion/hero-desktop.mp4',{headers:{Range:invalid}});
    assert.equal(r.status,416,invalid);
  }
 }finally{if(server)await new Promise(ok=>server.close(ok));rmSync(f.root,{recursive:true,force:true});if(out)rmSync(out,{recursive:true,force:true});}
});
