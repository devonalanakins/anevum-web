/**
 * ANEVUM.WEB.BUILD.2026-11-14.002.IMAGE-LED-MEDIA-RECOVERY
 * Recover previously generated review media from an owner's self-contained V15 HTML.
 * Output is NEVER a production asset tree; it only feeds the existing isolated local reviewer.
 * No embedded scripts are executed, no network I/O, and no release flags are changed.
 */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const PAGE='/original-works/review/cinematic-laboratory.html';
const POSTER='/original-works/review/assets/';
const MOTION='/original-works/assets/motion/';
const SCENES=['experiments','research','experiences','archive'];
const sha=b=>createHash('sha256').update(b).digest('hex');
function requireThat(ok,why){if(!ok)throw Error(why)}
function base64Attribute(element,attribute,mime){
 const re=new RegExp('\\b'+attribute+'="data:'+mime.replace('/','\\/')+';base64,([A-Za-z0-9+/=]+)"');
 const encoded=element.match(re)?.[1];
 requireThat(!!encoded&&encoded.length<80*1024*1024,'Missing/oversize inline '+attribute);
 const bytes=Buffer.from(encoded,'base64');
 requireThat(bytes.length>16&&bytes.toString('base64')===encoded,'Invalid base64 '+attribute);
 if(mime==='image/webp')requireThat(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP','Not WebP: '+attribute);
 if(mime==='video/mp4')requireThat(bytes.toString('ascii',4,8)==='ftyp','Not MP4: '+attribute);
 if(mime==='video/webm')requireThat(bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])),'Not WebM: '+attribute);
 return bytes;
}
function exactElement(html,pattern,label){
 const found=[...html.matchAll(pattern)];
 requireThat(found.length===1,'Expected exactly one '+label+', found '+found.length);
 return found[0][0];
}
export function recoverImageLedMedia(inputFile,outputFolder){
 const bytes=readFileSync(inputFile);
 requireThat(bytes.length>1000&&bytes.length<60*1024*1024,'Invalid V15 HTML size');
 const html=bytes.toString('utf8');
 requireThat(html.includes('<title>ANEVUM')&&html.includes('data-scene="hero"'),'Not ANEVUM V15 review');
 requireThat(!existsSync(outputFolder),'Output folder already exists; refusing overwrite');
 const hero=exactElement(html,/<div\b[^>]*class="scene hero-scene"[^>]*data-scene="hero"[^>]*>/g,'hero scene');
 const source=exactElement(html,/<source\b[^>]*media="\(max-width: 720px\)"[^>]*srcset="data:image\/webp;base64,[A-Za-z0-9+/=]+"[^>]*>/g,'mobile hero poster');
 const desktop=exactElement(html,/<img\b[^>]*class="scene-poster hero-poster"[^>]*>/g,'desktop hero poster');
 const assets=new Map();
 assets.set(POSTER+'hero.webp',base64Attribute(desktop,'src','image/webp'));
 assets.set(POSTER+'hero-mobile.webp',base64Attribute(source,'srcset','image/webp'));
 for(const name of SCENES){
   const scene=exactElement(html,new RegExp('<a\\b[^>]*data-scene="'+name+'"[^>]*>[\\s\\S]*?<img\\b[^>]*class="scene-poster"[^>]*>','g'),name+' poster');
   const poster=scene.match(/<img\b[^>]*class="scene-poster"[^>]*>/)?.[0];
   assets.set(POSTER+name+'.webp',base64Attribute(poster,'src','image/webp'));
 }
 for(const [attr,name] of [['data-video-mp4','hero-desktop.mp4'],['data-video-webm','hero-desktop.webm'],['data-mobile-mp4','hero-mobile.mp4'],['data-mobile-webm','hero-mobile.webm']]){
   const mime=name.endsWith('.mp4')?'video/mp4':'video/webm';
   assets.set(MOTION+name,base64Attribute(hero,attr,mime));
 }
 requireThat(assets.size===10,'Expected six posters and four movie files');
 const placeholder=Buffer.from('<!doctype html><html lang="en"><meta name="robots" content="noindex,nofollow"><title>Review-only staging placeholder; never serve as the page</title></html>\n');
 assets.set(PAGE,placeholder);
 const root=resolve(outputFolder);mkdirSync(root,{recursive:true});
 const files=[];
 for(const [path,data] of assets){
   const file=join(root,path.slice(1));
   mkdirSync(dirname(file),{recursive:true});
   writeFileSync(file,data,{flag:'wx'});
   files.push({path,bytes:data.length,sha256:sha(data)});
 }
 const manifest={status:'REVIEW_ONLY_NOT_PRODUCTION_APPROVED',page:PAGE,
   provenance:{source_sha256:sha(bytes),source_kind:'owner-supplied-self-contained-V15-review',rights_verified:false,owner_motion_accepted:false},files};
 writeFileSync(join(root,'media-review-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
   const [input,output]=process.argv.slice(2);
   requireThat(!!input&&!!output&&process.argv.length===4,'Usage: node recover-anevum-image-led-review.mjs <V15-offline.html> <new-output-dir>');
   const result=recoverImageLedMedia(input,output);
   console.log('ANEVUM_IMAGE_LED_MEDIA_RECOVERY_PASS',JSON.stringify({source_sha256:result.provenance.source_sha256,files:result.files.length,approved:false,output:resolve(output)}));
 }catch(e){console.error(String(e));process.exitCode=1;}
}
