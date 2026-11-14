/**
 * ANEVUM.WEB.BUILD.2026-11-13.019.LOCAL-CINEMATIC-MEDIA-BRIDGE
 * Assemble the current PR's fail-closed review UI with verified V16 review media.
 * No binaries are committed or copied into the repository; no public Worker code.
 */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync} from 'node:fs';
import {createServer} from 'node:http';
import {join,dirname,extname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';

const PAGE='/original-works/review/cinematic-laboratory.html';
const POSTER='/original-works/review/assets/';
const MOTION='/original-works/assets/motion/';
const ASSETS=[
  ...['hero','hero-mobile','experiments','research','experiences','archive'].map(n=>POSTER+n+'.webp'),
  ...['hero-desktop','hero-mobile'].flatMap(n=>[MOTION+n+'.mp4',MOTION+n+'.webm'])
];
const EXPECTED=new Set([PAGE,...ASSETS]);
const MIME={'.html':'text/html; charset=utf-8','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm'};
const digest=b=>createHash('sha256').update(b).digest('hex');
function requireThat(condition,message){if(!condition)throw Error(message);}

function verifyMediaTree(root){
  const manifest=JSON.parse(readFileSync(join(root,'media-review-manifest.json'),'utf8'));
  requireThat(manifest.status==='REVIEW_ONLY_NOT_PRODUCTION_APPROVED','V16 source must remain review-only');
  requireThat(manifest.page===PAGE&&Array.isArray(manifest.files)&&manifest.files.length===11,'Invalid V16 manifest');
  requireThat(new Set(manifest.files.map(f=>f.path)).size===11&&manifest.files.every(f=>EXPECTED.has(f.path)),'Unexpected media paths');
  const verified=new Map();
  for(const f of manifest.files){
    requireThat(Number.isSafeInteger(f.bytes)&&f.bytes>0&&/^[a-f0-9]{64}$/.test(f.sha256),'Invalid file digest');
    const bytes=readFileSync(join(root,f.path.slice(1)));
    requireThat(bytes.length===f.bytes&&digest(bytes)===f.sha256,'Media verification failed: '+f.path);
    verified.set(f.path,bytes);
  }
  return verified;
}

export function stageCurrentReview(reviewFile,v16StageRoot){
  const originals=verifyMediaTree(resolve(v16StageRoot));
  let html=readFileSync(reviewFile,'utf8');
  requireThat((html.match(/data-video-ready="false"/g)||[]).length===5,'Current review must disable all five videos');
  requireThat((html.match(/data-scene="(?:hero|experiments|research|experiences|archive)"/g)||[]).length===5,'Invalid review scene structure');
  requireThat(html.includes('hero-mobile.webp'),'Current review must provide its portrait poster');
  requireThat(!/<script\b[^>]*\bsrc=/i.test(html),'External scripts forbidden in isolated review');
  const target='data-scene="hero" data-video-ready="false"';
  requireThat(html.includes(target),'Hero must be explicitly disabled in committed source');
  html=html.replace(target,'data-scene="hero" data-video-ready="true"');
  requireThat((html.match(/data-video-ready="true"/g)||[]).length===1&&
      (html.match(/data-video-ready="false"/g)||[]).length===4,'Only local review hero can play');
  const out=mkdtempSync(join(tmpdir(),'anevum-cinematic-v17-'));
  const content=new Map([[PAGE,Buffer.from(html,'utf8')]]);
  for(const path of ASSETS)content.set(path,originals.get(path));
  for(const [path,bytes] of content){
    const file=join(out,path.slice(1));
    mkdirSync(dirname(file),{recursive:true});
    writeFileSync(file,bytes,{flag:'wx'});
  }
  const files=[...content].map(([path,bytes])=>({path,bytes:bytes.length,sha256:digest(bytes)}));
  writeFileSync(join(out,'media-review-manifest.json'),JSON.stringify({status:'REVIEW_ONLY_NOT_PRODUCTION_APPROVED',page:PAGE,files},null,2)+'\n',{flag:'wx'});
  return out;
}

export function createLocalReviewServer(stagedRoot){
  const files=verifyMediaTree(resolve(stagedRoot));
  return createServer((req,res)=>{
    if(req.method!=='GET'&&req.method!=='HEAD'){
      res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;
    }
    const url=new URL(req.url||'/', 'http://127.0.0.1');
    const key=url.pathname;
    if(url.search||!EXPECTED.has(key)||!files.has(key)){
      res.writeHead(404,{'Cache-Control':'no-store'});res.end();return;
    }
    const bytes=files.get(key),type=MIME[extname(key)];
    const h={'Content-Type':type,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow, noarchive',
      'X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin',
      'Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; img-src 'self'; media-src 'self' blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
    let start=0,end=bytes.length-1,status=200;
    if(type.startsWith('video/')){
      h['Accept-Ranges']='bytes';
      if(req.headers.range){
        const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return;}
        if(!m[1])start=Math.max(0,bytes.length-Number(m[2]));
        else {start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=bytes.length){
          res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return;
        }
        status=206;h['Content-Range']=`bytes ${start}-${end}/${bytes.length}`;
      }
    }
    h['Content-Length']=String(end-start+1);
    res.writeHead(status,h);res.end(req.method==='HEAD'?undefined:bytes.subarray(start,end+1));
  });
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const [mode,a,b]=process.argv.slice(2);
    if(mode==='stage'&&a&&b)process.stdout.write(stageCurrentReview(a,b)+'\n');
    else if(mode==='serve'&&a){
      const port=Number(b??4179);
      requireThat(Number.isInteger(port)&&port>=1024&&port<=65535,'Invalid localhost port');
      createLocalReviewServer(a).listen(port,'127.0.0.1',()=>process.stdout.write(`Local review: http://127.0.0.1:${port}${PAGE}\n`));
    }else throw Error('Usage: node anevum-cinematic-local-preview.mjs stage <repo-review.html> <V16/staged> | serve <outputDir> [port]');
  }catch(e){process.stderr.write(String(e)+'\n');process.exitCode=1;}
}
