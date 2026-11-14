/**
 * ANEVUM.WEB.TEST.2026-11-13.020.CINEMATIC-HTTP-BROWSER-ACCEPTANCE
 * Offline, synthetic MP4/WebM acceptance of V17's real HTTP review pipeline.
 * No production assets, services, or route changes.
 */
import {createHash} from "node:crypto";
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from "node:fs";
import {join,dirname} from "node:path";
import {tmpdir} from "node:os";
import {stageCurrentReview,createLocalReviewServer} from "./anevum-cinematic-local-preview.mjs";

const PAGE="/original-works/review/cinematic-laboratory.html";
const MEDIA="/original-works/assets/motion/";
const POSTER="/original-works/review/assets/";
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const sha=b=>createHash("sha256").update(b).digest("hex");
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
const root=mkdtempSync(join(tmpdir(),"anevum-cinematic-http-"));
let staged,server,chrome,ws,seq=0;
const pending=new Map();
function encode(file,w,h,type){
 mkdirSync(dirname(file),{recursive:true});
 const args=["-hide_banner","-loglevel","error","-y","-f","lavfi","-i",
   "testsrc2=size="+w+"x"+h+":rate=24","-t","1.5","-an","-pix_fmt","yuv420p"];
 if(type==="mp4")args.push("-c:v","libx264","-preset","ultrafast","-crf","32","-movflags","+faststart");
 else args.push("-c:v","libvpx-vp9","-deadline","realtime","-cpu-used","8","-b:v","220k");
 const r=spawnSync("ffmpeg",[...args,file],{encoding:"utf8",timeout:45000});
 check(r.status===0,"Synthetic ffmpeg failed: "+(r.stderr||r.error||"").slice(-700));
}
function makeFixture(){
 const home=join(root,"v16-staged"),parts=[];
 function add(path,bytes){
  const file=join(home,path.slice(1));mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes);
  parts.push({path,bytes:bytes.length,sha256:sha(bytes)});
 }
 add(PAGE,Buffer.from("<!doctype html><title>V16 review manifest placeholder</title>"));
 for(const name of ["hero","hero-mobile","experiments","research","experiences","archive"])
  add(POSTER+name+".webp",readFileSync(join("apps/anevum-public-studio/review/assets",name+".webp")));
 for(const name of ["hero-desktop","hero-mobile"])for(const type of ["mp4","webm"]){
  const file=join(root,"synthetic-"+name+"."+type);
  encode(file,name==="hero-desktop"?320:180,name==="hero-desktop"?180:280,type);
  add(MEDIA+name+"."+type,readFileSync(file));
 }
 writeFileSync(join(home,"media-review-manifest.json"),JSON.stringify({
  status:"REVIEW_ONLY_NOT_PRODUCTION_APPROVED",page:PAGE,files:parts
 },null,2));
 return home;
}
function send(method,params={}){
 return new Promise((resolve,reject)=>{
  const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout "+method))},20000);
  pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error("Page JavaScript exception: "+JSON.stringify(r.exceptionDetails));
 return r.result?.value;
}
async function until(fn,label){
 for(let i=0;i<110;i++){const v=await fn();if(v)return v;await sleep(130)}
 throw Error("Timed out: "+label);
}
async function browserCase(base,width,height,reduced){
 const requests=[],responses=[];
 const listener=e=>{
  const d=JSON.parse(String(e.data));
  if(d.method==="Network.requestWillBeSent")requests.push(d.params.request.url);
  if(d.method==="Network.responseReceived")responses.push({url:d.params.response.url,status:d.params.response.status});
 };
 ws.addEventListener("message",listener);
 try{
  await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<720});
  await send("Emulation.setEmulatedMedia",{features:reduced?[{name:"prefers-reduced-motion",value:"reduce"}]:[]});
  const nav=await send("Page.navigate",{url:base+PAGE});
  if(nav?.errorText)throw Error("Chromium navigation: "+nav.errorText);
  await until(()=>evaluate("document.readyState==='complete'&&!!document.querySelector('[data-scene=hero]')"),"page "+width);
  const read=()=>evaluate("(()=>{const h=document.querySelector('[data-scene=hero]'),v=h?.querySelector('video');return {path:location.pathname,scenes:document.querySelectorAll('[data-scene]').length,enabled:document.querySelectorAll('[data-video-ready=\"true\"]').length,disabled:document.querySelectorAll('[data-video-ready=\"false\"]').length,posters:[...document.querySelectorAll('.scene-poster')].map(x=>x.complete&&x.naturalWidth>0),motion:document.documentElement.dataset.motion,playing:h?.classList.contains('is-playing'),src:v?.currentSrc||'',time:v?.currentTime||0,paused:!!v?.paused,videoWidth:v?.videoWidth||0,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,errors:window.__anevumErrors?.length||0,skip:!!document.querySelector('a.skip[href=\"#main\"]')}})()");
  const state=await until(async()=>{
   const s=await read();
   return s?.scenes===5&&s.posters.length===5&&s.posters.every(Boolean)&&
    (reduced?s.motion==="still"&&s.paused:s.time>.1&&s.videoWidth>0&&s.playing)?s:null;
  },"real HTTP playback "+width+(reduced?" reduced motion":""));
  check(state.path===PAGE&&state.enabled===1&&state.disabled===4&&!state.overflow&&state.errors===0&&state.skip,
   "Browser integrity: "+JSON.stringify(state));
  if(!reduced){
   const name=width<720?"hero-mobile":"hero-desktop";
   check(state.src.includes(name),"Wrong responsive video: "+JSON.stringify(state));
   check(responses.some(x=>x.url.includes(MEDIA+name)&&[200,206].includes(x.status)),
    "Video was not fetched by Chromium: "+JSON.stringify(responses));
  }
  check(requests.filter(x=>x.startsWith("http")).every(x=>x.startsWith(base)),
   "External request in isolated review: "+JSON.stringify(requests));
  console.log("ANEVUM_CINEMATIC_HTTP_BROWSER_PASS",JSON.stringify({width,height,reduced,video:state.src,time:state.time}));
 }finally{ws.removeEventListener("message",listener)}
}
try{
 const fixture=makeFixture();
 staged=stageCurrentReview("apps/anevum-public-studio/review/cinematic-laboratory.html",fixture);
 server=createLocalReviewServer(staged);
 await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
 const base="http://127.0.0.1:"+server.address().port;
 const doc=await fetch(base+PAGE);
 check(doc.status===200&&(await doc.text()).includes('data-scene="hero" data-video-ready="true"'),"Staged page missing");
 for(const filename of ["hero-desktop.mp4","hero-mobile.mp4"]){
  const r=await fetch(base+MEDIA+filename,{headers:{Range:"bytes=0-31"}});
  check(r.status===206&&Number(r.headers.get("content-length"))===32,"Invalid video byte range: "+filename);
 }
 console.log("ANEVUM_CINEMATIC_LOCAL_HTTP_CONTRACT_PASS");
 if(!process.argv.includes("--http-contract-only")){
  const bin=process.env.CHROME_BIN||["google-chrome","google-chrome-stable","chromium","chromium-browser"].map(n=>{
   const r=spawnSync("which",[n],{encoding:"utf8"});return r.status===0?r.stdout.trim():null;
  }).find(Boolean);
  check(bin,"No Chromium available for actual HTTP browser acceptance");
  const profile=join(root,"chrome-profile");mkdirSync(profile);
  let startupError,stderr="";
  chrome=spawn(bin,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--no-first-run",
   "--disable-background-networking","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],
   {stdio:["ignore","ignore","pipe"]});
  chrome.on("error",e=>{startupError=e});
  chrome.stderr?.on("data",b=>{stderr=(stderr+String(b)).slice(-1800)});
  const port=await until(()=>{
   if(startupError)throw startupError;
   if(chrome.exitCode!==null)throw Error("Chromium exited: "+stderr);
   const file=join(profile,"DevToolsActivePort");
   return existsSync(file)?Number(readFileSync(file,"utf8").split(/\r?\n/)[0]):null;
  },"Chromium DevTools port");
  const target=await(await fetch("http://127.0.0.1:"+port+"/json/new?about:blank",{method:"PUT"})).json();
  ws=new WebSocket(target.webSocketDebuggerUrl);
  ws.addEventListener("message",e=>{
   const d=JSON.parse(String(e.data)),waiter=pending.get(d.id);
   if(!waiter)return;
   pending.delete(d.id);clearTimeout(waiter.timer);
   if(d.error)waiter.reject(Error(d.error.message));else waiter.resolve(d.result);
  });
  await new Promise((ok,fail)=>{ws.addEventListener("open",ok,{once:true});ws.addEventListener("error",fail,{once:true})});
  await send("Page.enable");await send("Runtime.enable");await send("Network.enable");
  await send("Page.addScriptToEvaluateOnNewDocument",{source:
   "window.__anevumErrors=[];window.addEventListener('error',e=>window.__anevumErrors.push(String(e.message)));window.addEventListener('unhandledrejection',e=>window.__anevumErrors.push(String(e.reason)))"});
  await browserCase(base,390,844,false);
  await browserCase(base,1440,900,false);
  await browserCase(base,390,844,true);
  console.log("ANEVUM_CINEMATIC_HTTP_BROWSER_QA_PASS");
 }
}finally{
 for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error("Browser closing"))}pending.clear();
 if(ws)ws.close();
 if(chrome&&!chrome.killed)chrome.kill("SIGTERM");
 if(server)await new Promise(ok=>server.close(ok));
 await sleep(500);
 rmSync(root,{recursive:true,force:true,maxRetries:10,retryDelay:100});
 if(staged)rmSync(staged,{recursive:true,force:true,maxRetries:10,retryDelay:100});
}
