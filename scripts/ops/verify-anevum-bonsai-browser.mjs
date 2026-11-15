/**
 * Headless Chromium/CDP acceptance for the REAL isolated bonsai Worker module.
 * No npm browser dependencies, network access, Cloudflare token, or production deploy.
 *
 * Evidence: screenshot artifacts + explicit route, responsive, accessibility,
 * reduced-motion and real click-through checks. WebKit/iPhone is a separate gate.
 */
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,writeFileSync,existsSync,mkdirSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {SPECIMENS} from "../../apps/anevum-bonsai/records.mjs";

const base = "http://127.0.0.1:4187";
const profile = mkdtempSync(path.join(tmpdir(),"anevum-bonsai-cdp-"));
const output = process.env.RUNNER_TEMP || tmpdir();
const routes = ["/","/collection",...SPECIMENS.map(s=>"/collection/"+s.id),
 "/chronicle","/journal","/journal/time-is-the-medium","/atelier","/practice","/about"];
const sizes = [[320,760],[390,844],[768,1024],[1440,900],[1920,1080]];
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let server, chrome, ws, nextId=0;
const pending = new Map();
mkdirSync(output,{recursive:true});

function send(method,params={}) {
 return new Promise((resolve,reject)=>{
  const id=++nextId;
  const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timed out: "+method));},20000);
  pending.set(id,{resolve,reject,timer});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression) {
 const x=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(x.exceptionDetails)throw Error(x.exceptionDetails.text||"CDP JavaScript exception");
 return x.result?.value;
}
async function until(fn,name) {
 let last;
 for(let i=0;i<100;i++){
  try{const val=await fn();if(val)return val;}catch(err){last=err;}
  await sleep(100);
 }
 throw Error("Timed out: "+name+(last?" ("+last.message+")":""));
}
async function navigate(pathname,width,height,emulateReduced=false){
 await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<761});
 await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:emulateReduced?"reduce":"no-preference"}]});
 await send("Page.navigate",{url:base+pathname});
 await until(async()=>await evaluate("location.pathname==="+JSON.stringify(pathname)+"&&document.readyState==='complete'&&!!document.querySelector('main h1')"),"navigate "+pathname+" "+width);
}
async function capture(name,width) {
 // Capture first viewport after resetting scroll/focus and closing mobile menu.
 await evaluate("(()=>{document.activeElement?.blur?.();document.querySelector('.menu')?.removeAttribute('open');window.scrollTo(0,0);return true})()");
 await sleep(90);
 const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 const file=path.join(output,"anevum-bonsai-"+name+"-"+width+".png");
 const bytes=Buffer.from(shot.data,"base64");
 if(bytes.length<9000)throw Error("Browser screenshot empty: "+file);
 writeFileSync(file,bytes);
 console.log("BONSAI_SCREENSHOT",file,bytes.length);
}
async function checkRoute(pathname,width,height){
 await navigate(pathname,width,height);
 const state=await evaluate("(()=>{const d=document.documentElement,h=document.querySelector('main h1'),menu=document.querySelector('details.menu'),nav=document.querySelector('.top-nav nav'),first=document.querySelector('a.skip'),all=[...document.querySelectorAll('a[href]')];return {path:location.pathname,title:document.title,width:d.clientWidth,scrollWidth:d.scrollWidth,bodyWidth:document.body.scrollWidth,h1:document.querySelectorAll('h1').length,heading:h?.textContent.trim(),visibleHeading:!!h&&getComputedStyle(h).display!=='none',main:document.querySelectorAll('main#main').length,skip:first?.getAttribute('href'),robots:document.querySelector('meta[name=robots]')?.content,hasNav:!!nav,hasMenu:!!menu,mobileVisible:!!menu&&getComputedStyle(menu).display!=='none',external:all.filter(a=>a.href&&!a.href.startsWith(location.origin)).map(a=>a.href),badLink:all.filter(a=>!a.textContent.trim()&&!a.getAttribute('aria-label')).length}})()");
 const errors=[];
 if(state.width>width||state.width<width-20)errors.push("wrong viewport including scrollbar");
 if(state.scrollWidth>state.width+1||state.bodyWidth>state.width+1)errors.push("horizontal overflow");
 if(state.h1!==1||!state.visibleHeading||state.main!==1)errors.push("heading/landmark");
 if(state.skip!=="#main")errors.push("missing skip link");
 if(!state.robots?.includes("noindex"))errors.push("preview indexing guard");
 if(!state.hasNav||!state.hasMenu)errors.push("navigation missing");
 if(state.mobileVisible!==(width<761))errors.push("responsive mobile menu");
 if(state.badLink>0||state.external.length)errors.push("unlabeled/external link");
 if(errors.length)throw Error("BONSAI_BROWSER_FAIL "+pathname+" "+width+": "+errors.join(", ")+" "+JSON.stringify(state));
 console.log("BONSAI_BROWSER_ROUTE_PASS",pathname,width);
}
async function click(selector,expectedPath){
 const clicked=await evaluate("(()=>{const a=document.querySelector("+JSON.stringify(selector)+");if(!a||!a.getClientRects().length)return false;a.click();return true})()");
 if(!clicked)throw Error("Not clickable: "+selector);
 await until(async()=>await evaluate("location.pathname==="+JSON.stringify(expectedPath)+"&&document.readyState==='complete'&&!!document.querySelector('main h1')"),"clicked "+expectedPath);
}
async function interactions() {
 await navigate("/",1440,900);
 await click('.cta-row a[href="/collection"]',"/collection");
 await click('.feature-specimen a[href="/collection/tree-01"]',"/collection/tree-01");
 await click('a[href="/atelier"].action',"/atelier");
 const study=await evaluate("(()=>{const x=document.querySelector('.study-options details');if(!x)return null;x.querySelector('summary').click();return {open:x.open,items:document.querySelectorAll('.study-options details').length}})()");
 if(study?.items!==3||!study.open)throw Error("Atelier composition disclosure failed");
 await click('a[href="/collection/tree-01"].action',"/collection/tree-01");
 await click('a[href="/chronicle"].action',"/chronicle");
 await click('a[href="/collection/tree-01"].action',"/collection/tree-01");
 await click('a[href="/collection"].action',"/collection");
 await navigate("/",390,844);
 const menu=await evaluate("(()=>{const d=document.querySelector('details.menu');if(!d)return null;d.querySelector('summary').click();return {open:d.open,nav:d.querySelector('nav')?.getAttribute('aria-label')}})()");
 if(!menu?.open||menu.nav!=="Mobile navigation")throw Error("Mobile menu open/focus failed");
 await click('details.menu nav a[href="/journal"]',"/journal");
 await click('a.journal-entry[href="/journal/time-is-the-medium"]',"/journal/time-is-the-medium");
 await navigate("/",390,844);
 await send("Page.bringToFront");
 await send("Emulation.setFocusEmulationEnabled",{enabled:true});
 const skip=await evaluate("(()=>{const a=document.querySelector('a.skip');a.focus();return {focused:document.activeElement===a,rect:a.getBoundingClientRect().top,outline:getComputedStyle(a).outlineStyle}})()");
 if(!skip.focused||skip.rect<0||skip.rect>95||skip.outline==="none")throw Error("Keyboard skip/focus failure "+JSON.stringify(skip));
 await navigate("/",390,844,true);
 const reduced=await evaluate("(()=>{const scene=document.querySelector('.scene');return {reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,pseudo:scene?getComputedStyle(scene,'::before').animationName:null}})()");
 if(!reduced.reduced||reduced.pseudo!=="none")throw Error("Reduced-motion scene keeps animating "+JSON.stringify(reduced));
 console.log("BONSAI_BROWSER_INTERACTIONS_PASS");
}

try {
 server=spawn(process.execPath,["scripts/ops/anevum-bonsai-preview-test-server.mjs"],{stdio:["ignore","pipe","pipe"]});
 let serverLog="";
 server.stdout.on("data",x=>{serverLog+=String(x);});
 server.stderr.on("data",x=>{serverLog+=String(x);});
 await until(async()=>{
   if(server.exitCode!==null)throw Error("Server exit "+server.exitCode+" "+serverLog);
   return (await fetch(base+"/")).status===200;
 },"bonsai loopback server");
 const exe=process.env.CHROME_BIN||["google-chrome","google-chrome-stable","chromium","chromium-browser"].map(bin=>{
  const found=spawnSync("which",[bin],{encoding:"utf8"});
  return found.status===0?found.stdout.trim():null;
 }).find(Boolean);
 if(!exe)throw Error("Chromium is required for mandatory real-browser QA");
 const version=spawnSync(exe,["--version"],{encoding:"utf8"});
 if(version.status!==0)throw Error("Chromium cannot execute");
 console.log("BONSAI_CHROMIUM",version.stdout.trim());
 let stderr="";
 chrome=spawn(exe,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
  "--no-first-run","--disable-background-networking","--remote-debugging-address=127.0.0.1",
  "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:["ignore","ignore","pipe"]});
 chrome.stderr?.on("data",chunk=>{stderr=(stderr+String(chunk)).slice(-2200);});
 const port=await until(async()=>{
  if(chrome.exitCode!==null)throw Error("Chromium exit: "+stderr);
  const filepath=path.join(profile,"DevToolsActivePort");
  if(!existsSync(filepath))return null;
  const p=Number(readFileSync(filepath,"utf8").split(/\r?\n/)[0]);
  return Number.isInteger(p)&&p>0?p:null;
 },"Chromium DevTools port");
 const target=await (await fetch("http://127.0.0.1:"+port+"/json/new?about:blank",{method:"PUT"})).json();
 ws=new WebSocket(target.webSocketDebuggerUrl);
 ws.addEventListener("message",event=>{
  const message=JSON.parse(String(event.data));
  if(!message.id||!pending.has(message.id))return;
  const pendingItem=pending.get(message.id);pending.delete(message.id);
  clearTimeout(pendingItem.timer);
  if(message.error)pendingItem.reject(Error(message.error.message));
  else pendingItem.resolve(message.result);
 });
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
 await send("Page.enable");await send("Runtime.enable");
 for(const [width,height] of sizes)for(const route of routes){
  await checkRoute(route,width,height);
  if([390,1440].includes(width)&&["/","/collection","/collection/tree-01","/chronicle","/atelier"].includes(route)){
    await capture(route==="/"?"home":route.replaceAll("/","-").slice(1),width);
  }
 }
 await interactions();
 console.log("BONSAI_BROWSER_QA_PASS",JSON.stringify({routes:routes.length,viewports:sizes.length}));
} finally {
 for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error("Browser ended"));}
 pending.clear();
 if(ws)ws.close();
 if(chrome&&chrome.exitCode===null){
  const closed=new Promise(done=>chrome.once("close",done));chrome.kill("SIGTERM");
  await Promise.race([closed,sleep(1700)]);
  if(chrome.exitCode===null){chrome.kill("SIGKILL");await sleep(100);}
 }
 if(server&&server.exitCode===null)server.kill("SIGTERM");
 rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:120});
}
