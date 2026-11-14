/**
 * ANEVUM.WEB.BUILD.2026-11-14.006.CINEMATIC-LOCAL-HTTP-REVIEW
 * Serve verified, separately stored V22 media over a loopback-only HTTP origin.
 * Never deploys, publishes, or bypasses Cloudflare Access.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const PREFIX='/review/';
const STATUS='REVIEW_ONLY_NOT_PRODUCTION_APPROVED';
const MIME={'.html':'text/html; charset=utf-8','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm'};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function ensure(ok,message){if(!ok)throw Error(message)}

export function verifyReviewBundle(directory){
 const root=resolve(directory);
 const manifest=JSON.parse(readFileSync(join(root,'manifest.json'),'utf8'));
 ensure(manifest.status===STATUS && manifest.published===false && manifest.owner_accepted===false && manifest.rights_verified===false,'Review must be unapproved, unpublished and rights-pending');
 ensure(Array.isArray(manifest.files)&&manifest.files.length===12,'Expected exact V22 media inventory');
 const html=readFileSync(join(root,'index.html'));
 ensure(html.length>1000 && html.length<180000 && !html.includes('base64,'),'Invalid separated-media review HTML');
 ensure(html.toString().includes('data-scene="hero"')&&html.toString().includes('data-scene="research"'),'Required scene source missing');
 const files=new Map([[PREFIX,{data:html,mime:MIME['.html']}],[PREFIX+'index.html',{data:html,mime:MIME['.html']}]]);
 let images=0,videos=0;
 for(const entry of manifest.files){
  ensure(typeof entry.path==='string' && /^(?:assets\/[a-f0-9]{24}\.webp|media\/[a-f0-9]{24}\.(?:mp4|webm))$/.test(entry.path),'Unexpected asset path');
  ensure(!files.has(PREFIX+entry.path),'Duplicate media path');
  ensure(Number.isSafeInteger(entry.bytes)&&entry.bytes>16&&/^[a-f0-9]{64}$/.test(entry.sha256),'Invalid media manifest row');
  const bytes=readFileSync(join(root,entry.path));
  ensure(bytes.length===entry.bytes && digest(bytes)===entry.sha256 && entry.path.split('/')[1].startsWith(entry.sha256.slice(0,24)),'Asset hash or length mismatch: '+entry.path);
  const ext=extname(entry.path);
  if(ext==='.webp'){ensure(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP','Invalid WebP');images++}
  if(ext==='.mp4'){ensure(bytes.toString('ascii',4,8)==='ftyp','Invalid MP4');videos++}
  if(ext==='.webm'){ensure(bytes.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3])),'Invalid WebM');videos++}
  files.set(PREFIX+entry.path,{data:bytes,mime:MIME[ext]});
 }
 ensure(images===6&&videos===6,'Expected six posters and six video renditions');
 return files;
}

export function createReviewServer(directory){
 const files=verifyReviewBundle(directory);
 return createServer((req,res)=>{
  const headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','X-Content-Type-Options':'nosniff',
   'Referrer-Policy':'no-referrer','Cross-Origin-Resource-Policy':'same-origin',
   'Content-Security-Policy':"default-src 'none'; img-src 'self'; media-src 'self' blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"};
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return}
  let path;
  try{const url=new URL(req.url||'/', 'http://127.0.0.1');path=url.pathname;if(url.search||url.hash||decodeURI(path)!==path)throw Error('Unexpected URL syntax')}
  catch{res.writeHead(404,headers);res.end();return}
  const file=files.get(path);
  if(!file){res.writeHead(404,headers);res.end();return}
  let start=0,end=file.data.length-1,status=200;
  const out={...headers,'Content-Type':file.mime};
  if(file.mime.startsWith('video/')){
   out['Accept-Ranges']='bytes';
   if(req.headers.range){
    const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if(!m||(!m[1]&&!m[2])){res.writeHead(416,{...headers,'Content-Range':`bytes */${file.data.length}`});res.end();return}
    if(!m[1]){const suffix=Number(m[2]);start=Math.max(0,file.data.length-suffix)}
    else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]))}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=file.data.length){res.writeHead(416,{...headers,'Content-Range':`bytes */${file.data.length}`});res.end();return}
    status=206;out['Content-Range']=`bytes ${start}-${end}/${file.data.length}`;
   }
  }
  out['Content-Length']=String(end-start+1);
  res.writeHead(status,out);
  res.end(req.method==='HEAD'?undefined:file.data.subarray(start,end+1));
 });
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const [dir,requestedPort='4179']=process.argv.slice(2);
  ensure(!!dir && /^\d+$/.test(requestedPort),'Usage: node serve-anevum-cinematic-review.mjs <extracted-V22-dir> [port]');
  const port=Number(requestedPort);
  ensure(Number.isSafeInteger(port)&&port>=1024&&port<=65535,'Invalid loopback port');
  const server=createReviewServer(dir);
  server.listen(port,'127.0.0.1',()=>console.log(`ANEVUM_REVIEW_LOOPBACK_READY http://127.0.0.1:${port}${PREFIX}`));
 }catch(error){console.error(error.message);process.exitCode=1}
}
