import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {recoverImageLedMedia} from '../scripts/ops/recover-anevum-image-led-review.mjs';

const image=Buffer.concat([Buffer.from('RIFF'),Buffer.alloc(4),Buffer.from('WEBPVP8 '),Buffer.alloc(24)]).toString('base64');
const mp4=Buffer.concat([Buffer.alloc(4),Buffer.from('ftypmp42'),Buffer.alloc(20)]).toString('base64');
const webm=Buffer.concat([Buffer.from([0x1a,0x45,0xdf,0xa3]),Buffer.alloc(28)]).toString('base64');
const clip=(key,type,bytes)=>key+'="data:video/'+type+';base64,'+bytes+'"';
function fixture(){
 let s='<!doctype html><html><head><title>ANEVUM V15</title></head><body>';
 s+='<div class="scene hero-scene" data-scene="hero" data-video-ready="true" '+clip('data-video-mp4','mp4',mp4)+' '+clip('data-video-webm','webm',webm)+' '+clip('data-mobile-mp4','mp4',mp4)+' '+clip('data-mobile-webm','webm',webm)+'>';
 s+='<source media="(max-width: 720px)" srcset="data:image/webp;base64,'+image+'" type="image/webp">';
 s+='<img class="scene-poster hero-poster" src="data:image/webp;base64,'+image+'" alt=""></div>';
 for(const scene of ['experiments','research','experiences','archive'])s+='<a class="scene destination" data-scene="'+scene+'" data-video-ready="false" href="#'+scene+'"><img class="scene-poster" src="data:image/webp;base64,'+image+'" alt=""></a>';
 return s+'</body></html>';
}
function inTemp(check){
 const root=mkdtempSync(join(tmpdir(),'anevum-recover-test-'));
 try{const src=join(root,'v15.html'),out=join(root,'extracted');writeFileSync(src,fixture());check({src,out,root});}
 finally{rmSync(root,{force:true,recursive:true});}
}
test('recovers exactly ten allowlisted binary assets plus a non-publishable review placeholder',()=>inTemp(({src,out})=>{
 const m=recoverImageLedMedia(src,out);
 assert.equal(m.status,'REVIEW_ONLY_NOT_PRODUCTION_APPROVED');
 assert.equal(m.files.length,11);
 assert.equal(m.provenance.rights_verified,false);
 assert.equal(m.provenance.owner_motion_accepted,false);
 assert.equal(m.files.filter(f=>f.path.endsWith('.webp')).length,6);
 assert.equal(m.files.filter(f=>f.path.endsWith('.mp4')||f.path.endsWith('.webm')).length,4);
 assert.equal(m.files.filter(f=>f.path.endsWith('.html')).length,1);
 assert.ok(m.files.every(f=>f.path.startsWith('/original-works/')));
 const html=readFileSync(join(out,'original-works/review/cinematic-laboratory.html'),'utf8');
 assert.doesNotMatch(html,/<video|<script|data-video-ready="true"/);
 assert.deepEqual(JSON.parse(readFileSync(join(out,'media-review-manifest.json'),'utf8')),m);
 assert.throws(()=>recoverImageLedMedia(src,out),/refusing overwrite/);
}));
test('rejects missing scene source or malformed media rather than producing partial assets',()=>inTemp(({src,out})=>{
 let s=readFileSync(src,'utf8').replace('data-scene="archive"','data-scene="missing"');
 writeFileSync(src,s);
 assert.throws(()=>recoverImageLedMedia(src,out),/archive poster/);
 assert.equal(existsSync(out),false);
 s=fixture().replace('data:video/mp4;base64,'+mp4,'data:video/mp4;base64,'+image);
 writeFileSync(src,s);
 assert.throws(()=>recoverImageLedMedia(src,out),/Not MP4/);
 assert.equal(existsSync(out),false);
}));
