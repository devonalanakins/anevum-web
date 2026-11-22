import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {approvedCinematicScene,approvedCinematicAsset} from '../apps/anevum-public-studio/living-laboratory-cinema.mjs';
import {serveApprovedCinematicMotion} from '../apps/anevum-public-studio/living-laboratory-media-origin.mjs';
import worker from '../apps/anevum-public-studio/worker.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const make=(name,ext)=>{
 const bytes=Buffer.from(name.repeat(30)),sha256=hash(bytes);
 return {bytes,path:'/original-works/assets/motion/'+sha256.slice(0,24)+'.'+ext,
  proof:{sha256,bytes:bytes.length}};
};
const files={mp4:make('a','mp4'),webm:make('b','webm'),
 mobileMp4:make('c','mp4'),mobileWebm:make('d','webm')};
const film={ownerApproved:true,rightsCleared:true,qcPassed:true,poster:'lab-hero-v1.webp',
 ...Object.fromEntries(Object.entries(files).map(([k,v])=>[k,v.path])),
 integrity:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,v.proof]))};
const registry={hero:film},base='https://anevum.com';
const request=(path,opts={})=>new Request(base+path,opts);

function bucketFor(file=files.mp4){
 const stats={head:0,get:0},version='immutable-01';
 const key='cinema/'+file.proof.sha256+'.mp4';
 const meta=()=>({key,version,size:file.bytes.length,etag:'r2etag',
  httpMetadata:{contentType:'video/mp4'},
  checksums:{sha256:Uint8Array.from(Buffer.from(file.proof.sha256,'hex')).buffer}});
 const bucket={stats,head:async k=>{stats.head++;return k===key?meta():null},
  get:async(k,opts)=>{
   stats.get++;
   if(k!==key||opts?.onlyIf?.etagMatches!=='r2etag')return null;
   const bytes=opts?.range?
    file.bytes.subarray(opts.range.offset,opts.range.offset+opts.range.length):file.bytes;
   return {...meta(),body:new ReadableStream({start(c){c.enqueue(bytes);c.close()}})};
  }};
 return bucket;
}

test('no default media exposure even when a storage binding exists',async()=>{
 const bucket=bucketFor();
 assert.equal((await worker.fetch(request(files.mp4.path),{ANEVUM_CINEMATIC_MEDIA:bucket})).status,404);
 assert.equal(bucket.stats.head,0);
 assert.equal((await serveApprovedCinematicMotion(request(files.mp4.path),
  {},files.mp4.path,{registry})).status,404);
 assert.equal((await serveApprovedCinematicMotion(request(files.mp4.path+'?debug=1'),
  {ANEVUM_CINEMATIC_MEDIA:bucket},files.mp4.path,{registry})).status,404);
});

test('approved media origin handles HEAD, immutable GET, ranges and cache validators',async()=>{
 const bucket=bucketFor(),env={ANEVUM_CINEMATIC_MEDIA:bucket};
 const go=(opts={})=>serveApprovedCinematicMotion(request(files.mp4.path,opts),
  env,files.mp4.path,{registry});
 const full=await go();
 assert.equal(full.status,200);
 assert.equal(full.headers.get('content-type'),'video/mp4');
 assert.equal(full.headers.get('content-length'),String(files.mp4.bytes.length));
 assert.equal(full.headers.get('accept-ranges'),'bytes');
 assert.equal(full.headers.get('cross-origin-resource-policy'),'same-origin');
 assert.deepEqual(Buffer.from(await full.arrayBuffer()),files.mp4.bytes);
 const head=await go({method:'HEAD'});
 assert.equal(head.status,200);assert.equal(await head.text(),'');
 assert.equal(bucket.stats.get,1);
 const first=await go({headers:{Range:'bytes=0-7'}});
 assert.equal(first.status,206);
 assert.equal(first.headers.get('content-range'),'bytes 0-7/'+files.mp4.bytes.length);
 assert.equal((await first.arrayBuffer()).byteLength,8);
 const suffix=await go({headers:{Range:'bytes=-5'}});
 assert.equal(suffix.status,206);
 assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),files.mp4.bytes.subarray(-5));
 const open=await go({headers:{Range:'bytes=8-'}});
 assert.equal(open.status,206);
 assert.equal((await open.arrayBuffer()).byteLength,files.mp4.bytes.length-8);
 for(const range of ['bytes=999999-','bytes=0-0,2-3','bytes=0--2','bytes=-0','bytes=8-3']){
  assert.equal((await go({headers:{Range:range}})).status,416,range);
 }
 const etag=full.headers.get('etag');
 assert.equal((await go({headers:{'If-None-Match':etag}})).status,304);
 const wrong=await go({headers:{Range:'bytes=0-3','If-Range':'"wrong"'}});
 assert.equal(wrong.status,200);
 assert.equal((await wrong.arrayBuffer()).byteLength,files.mp4.bytes.length);
});

test('approvals require full SHA-256 and byte-length receipts',()=>{
 assert.equal(approvedCinematicAsset(files.mp4.path,registry).sha256,files.mp4.proof.sha256);
 const invalid=[{...film,ownerApproved:false},{...film,rightsCleared:false},
  {...film,qcPassed:false},
  {...film,integrity:{...film.integrity,mp4:{...film.integrity.mp4,sha256:'f'.repeat(64)}}},
  {...film,integrity:{...film.integrity,mp4:{...film.integrity.mp4,bytes:0}}},
  {...film,integrity:{...film.integrity,mp4:undefined}},
  {...film,integrity:{...film.integrity,extra:{sha256:'a'.repeat(64),bytes:10}}},
  {...film,mobileMp4:film.mp4}];
 for(const bad of invalid)
  assert.throws(()=>approvedCinematicScene('hero',{hero:bad}),/Unapproved|Missing|Unverified/);
});

test('stored digest, MIME, version, length and method failures are denied',async()=>{
 const req=()=>request(files.mp4.path);
 for(const mutate of [
  o=>({...o,checksums:{sha256:new Uint8Array(32).buffer}}),
  o=>({...o,httpMetadata:{contentType:'text/html'}}),
  o=>({...o,size:42}),
  o=>({...o,version:''})]){
  const bucket=bucketFor(),original=bucket.head;
  bucket.head=async k=>mutate(await original(k));
  assert.equal((await serveApprovedCinematicMotion(req(),
   {ANEVUM_CINEMATIC_MEDIA:bucket},files.mp4.path,{registry})).status,404);
  assert.equal(bucket.stats.get,0);
 }
 const changed=bucketFor(),get=changed.get;
 changed.get=async(...args)=>({...await get(...args),version:'changed'});
 assert.equal((await serveApprovedCinematicMotion(req(),
  {ANEVUM_CINEMATIC_MEDIA:changed},files.mp4.path,{registry})).status,404);
 const down=bucketFor();down.head=async()=>{throw Error('unavailable')};
 assert.equal((await serveApprovedCinematicMotion(req(),
  {ANEVUM_CINEMATIC_MEDIA:down},files.mp4.path,{registry})).status,503);
 assert.equal((await serveApprovedCinematicMotion(
  request(files.mp4.path,{method:'POST'}),
  {ANEVUM_CINEMATIC_MEDIA:bucketFor()},files.mp4.path,{registry})).status,405);
});
