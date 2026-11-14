import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createReviewServer,verifyReviewBundle} from '../scripts/ops/serve-anevum-cinematic-review.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
async function fixture(fn){
 const root=mkdtempSync(join(tmpdir(),'anevum-v23-review-'));
 try{
  const files=[];
  for(const [group,ext,count] of [['assets','webp',6],['media','mp4',3],['media','webm',3]]){
   for(let i=0;i<count;i++){
    const bytes=ext==='webp'?Buffer.concat([Buffer.from('RIFF'),Buffer.alloc(4),Buffer.from('WEBP'),Buffer.from('image'+i),Buffer.alloc(18,i)]):
      ext==='mp4'?Buffer.concat([Buffer.alloc(4),Buffer.from('ftyp'),Buffer.alloc(24,i)]):
      Buffer.concat([Buffer.from([0x1a,0x45,0xdf,0xa3]),Buffer.alloc(28,i)]);
    const hash=sha(bytes),rel=group+'/'+hash.slice(0,24)+'.'+ext;
    mkdirSync(dirname(join(root,rel)),{recursive:true});
    writeFileSync(join(root,rel),bytes);
    files.push({path:rel,bytes:bytes.length,sha256:hash});
   }
  }
  writeFileSync(join(root,'index.html'),'<!doctype html><html><title>ANEVUM cinematic review</title><body><div data-scene="hero"></div><div data-scene="research"></div>'+'.'.repeat(1100)+'</body></html>');
  const manifest={status:'REVIEW_ONLY_NOT_PRODUCTION_APPROVED',published:false,owner_accepted:false,rights_verified:false,files};
  writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest));
  return await fn({root,files,manifest});
 }finally{rmSync(root,{recursive:true,force:true})}
}

test('manifest validates hashes, safe source paths and unapproved state',()=>fixture(async({root,files,manifest})=>{
 const valid=verifyReviewBundle(root);assert.equal(valid.size,14);
 const file=join(root,files[0].path),original=readFileSync(file);
 writeFileSync(file,Buffer.alloc(files[0].bytes));
 assert.throws(()=>verifyReviewBundle(root),/hash or length mismatch/);
 writeFileSync(file,original);
 manifest.published=true;
 writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest));
 assert.throws(()=>verifyReviewBundle(root),/unapproved, unpublished/);
}));

test('loopback HTTP supports poster, video byte ranges, HEAD and rejects other paths',()=>fixture(async({root,files})=>{
 const server=createReviewServer(root);
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const page=await fetch(base+'/review/');
  assert.equal(page.status,200);assert.match(page.headers.get('content-type'),/text\/html/);
  assert.match(await page.text(),/ANEVUM cinematic/);
  assert.match(page.headers.get('x-robots-tag'),/noindex/);
  assert.equal(page.headers.get('cache-control'),'private, no-store');
  const mp4=files.find(x=>x.path.endsWith('.mp4')),url=base+'/review/'+mp4.path;
  const partial=await fetch(url,{headers:{Range:'bytes=0-15'}});
  assert.equal(partial.status,206);assert.equal((await partial.arrayBuffer()).byteLength,16);
  assert.equal(partial.headers.get('content-range'),'bytes 0-15/'+mp4.bytes);
  const suffix=await fetch(url,{headers:{Range:'bytes=-10'}});
  assert.equal(suffix.status,206);assert.equal((await suffix.arrayBuffer()).byteLength,10);
  const head=await fetch(url,{method:'HEAD'});
  assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),String(mp4.bytes));
  assert.equal((await head.arrayBuffer()).byteLength,0);
  const badRange=await fetch(url,{headers:{Range:'bytes=9999-'}});
  assert.equal(badRange.status,416);
  for(const path of ['/','/review/manifest.json','/review/%2e%2e/manifest.json','/review/secret.mp4','/review/index.html?debug=true'])assert.equal((await fetch(base+path)).status,404,path);
  const post=await fetch(base+'/review/',{method:'POST'});
  assert.equal(post.status,405);assert.equal(post.headers.get('allow'),'GET, HEAD');
 }finally{await new Promise(done=>server.close(done))}
}));
