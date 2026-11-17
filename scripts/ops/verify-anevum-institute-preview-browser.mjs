// Browser QA for the isolated Open Institute Worker. No Cloudflare deployment.
// Uses system Chrome/Chromium and the native Chrome DevTools Protocol.
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";

const profile=mkdtempSync(path.join(tmpdir(),"anevum-institute-cdp-"));
const output=process.env.RUNNER_TEMP||tmpdir();
const base="http://127.0.0.1:4183";
const pages=[
  ["/institute-preview","home"],
  ["/institute-preview/academy","academy"],
  ["/institute-preview/academy/cfp-101","course"],
  ["/institute-preview/learn/cfp-101/logic-gates","lesson"],
  ["/institute-preview/laboratory/and-gate","laboratory"]
];
mkdirSync(output,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=spawn(process.execPath,["scripts/ops/anevum-institute-preview-server.mjs"],{stdio:"ignore"});
let chrome,ws,next=0;const pending=new Map();
function send(method,params={}){
  return new Promise((resolve,reject)=>{
    const id=++next;
    const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout: "+method));},20000);
    pending.set(id,{resolve,reject,timer});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evaluate(expression){
  const response=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(response.exceptionDetails)throw Error("Browser JavaScript exception: "+response.exceptionDetails.text);
  return response.result?.value;
}
async function waitFor(fn,label){
  let error;
  for(let i=0;i<125;i++){
    try{const result=await fn();if(result)return result;}catch(e){error=e;}
    await sleep(110);
  }
  throw Error("Timed out waiting for "+label+(error?": "+error.message:""));
}
function verify(ok,message,details){
  if(!ok)throw Error(message+" "+JSON.stringify(details||{}));
}
async function screenshot(name,full=false){
  const result=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:full});
  const file=path.join(output,"anevum-institute-"+name+".png");
  writeFileSync(file,Buffer.from(result.data,"base64"));
  verify(readFileSync(file).length>8000,"Screenshot appears blank",{file});
  return file;
}
async function navigate(pathname){
  await send("Page.navigate",{url:base+pathname});
  return waitFor(async()=>evaluate("(()=>document.readyState==='complete'&&location.pathname==="+JSON.stringify(pathname)+"&&!!document.querySelector('main h1'))()"),pathname);
}
async function testPage(pathname,label,width,height){
  await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<700});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await navigate(pathname);
  const state=await evaluate("(()=>({path:location.pathname,title:document.title,heading:document.querySelector('main h1')?.textContent.trim(),mainCount:document.querySelectorAll('main').length,h1Count:document.querySelectorAll('h1').length,skip:!!document.querySelector('a.skip[href=\"#main\"]'),desktop:!!document.querySelector('nav.desk-nav[aria-label=\"Primary navigation\"]'),mobile:!!document.querySelector('details.mobile-menu'),mobileVisible:getComputedStyle(document.querySelector('details.mobile-menu')).display!=='none',width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,robots:document.querySelector('meta[name=\"robots\"]')?.content,scriptCount:document.scripts.length,allLinksLabelled:[...document.querySelectorAll('a[href]')].every(a=>!!(a.textContent.trim()||a.getAttribute('aria-label'))),scriptsLoaded:!!document.querySelector('script[src=\"/institute-preview/client.js\"]')}))()");
  verify(state.mainCount===1&&state.h1Count===1&&state.skip&&state.desktop&&state.mobile&&state.scriptsLoaded&&state.allLinksLabelled,"Accessible landmarks or navigation missing",{label,width,state});
  verify(state.robots.includes("noindex")&&state.scriptCount===1,"Unexpected indexing or scripts",{label,width,state});
  verify(state.width===width&&state.scrollWidth<=width+1&&state.bodyWidth<=width+1,"Horizontal overflow",{label,width,state});
  verify((width<=1100)===state.mobileVisible,"Wrong mobile navigation breakpoint",{label,width,state});
  if(width===390){
    const opened=await evaluate("(()=>{const menu=document.querySelector('details.mobile-menu');menu.querySelector('summary').click();const opened=menu.open;menu.querySelector('summary').click();return opened&&!menu.open;})()");
    verify(opened,"Mobile menu does not open and close",{label,width});
  }
  const link=await evaluate("(()=>{const anchor=document.querySelector('.skip');anchor.focus();return document.activeElement===anchor})()");
  verify(link,"Skip link cannot receive keyboard focus",{label,width});
  if((width===390||width===1440)){
    await screenshot(label+"-"+width);
    if(label==="home"||label==="laboratory")await screenshot(label+"-"+width+"-full",true);
  }
  console.log("INSTITUTE_PAGE_QA_PASS",label,width,state.heading);
}
async function interactions(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate("/institute-preview/learn/cfp-101/logic-gates");
  const quiz=await evaluate("(()=>{const buttons=[...document.querySelectorAll('[data-answer]')];const correct=buttons.find(b=>b.dataset.answer==='and');correct.click();const feedback=document.querySelector('#answer-feedback').textContent;return {feedback,correct:correct.getAttribute('aria-pressed'),progress:document.querySelector('[data-local-progress]').textContent}})()");
  verify(quiz.feedback.startsWith("Correct.")&&quiz.correct==="true"&&quiz.progress.includes("1 of 2"),"Quiz feedback or progress broken",quiz);
  await navigate("/institute-preview/laboratory/and-gate");
  const lab=await evaluate("(()=>{const root=document.querySelector('[data-and-lab]');const toggle=x=>root.querySelector('[data-input=\"'+x+'\"]').click();const states=[];const snapshot=()=>states.push([root.querySelector('[data-a-mark]').textContent,root.querySelector('[data-b-mark]').textContent,root.querySelector('[data-output]').textContent]);snapshot();toggle('b');snapshot();toggle('a');snapshot();toggle('b');snapshot();const p=root.querySelector('[data-lab-progress]').textContent;const local=JSON.parse(localStorage.getItem('anevum.institute.cfp101.preview.v1'));return {states,progress:p,local,note:root.querySelector('[data-observation]').textContent}})()");
  verify(JSON.stringify(lab.states)===JSON.stringify([["0","0","0"],["0","1","0"],["1","1","1"],["1","0","0"]]),"AND-gate input/output behavior incorrect",lab);
  verify(lab.progress.startsWith("4 of 4")&&lab.local.lesson===true&&lab.local.experiment===true&&lab.note.includes("Experiment completed"),"Experiment completion or storage broken",lab);
  const assets=await evaluate("Promise.all(['lab-hero-v1.webp','lab-archive-v1.webp'].map(async n=>{const img=new Image();img.src='/institute-preview/assets/'+n;try{await img.decode();return {name:n,width:img.naturalWidth}}catch(e){return {name:n,width:0,error:String(e)}}}))");
  verify(assets.every(x=>x.width>100),"Same-origin artwork failed to decode",assets);
  console.log("INSTITUTE_INTERACTION_QA_PASS",JSON.stringify({quiz,lab,assets}));
}
try{
  await waitFor(async()=>{
    if(server.exitCode!==null)throw Error("Loopback server exited");
    return (await fetch(base+"/institute-preview")).status===200;
  },"preview loopback server");
  const executable=process.env.CHROME_BIN||["google-chrome","google-chrome-stable","chromium","chromium-browser"].map(binary=>{
    const located=spawnSync("which",[binary],{encoding:"utf8"});
    return located.status===0?located.stdout.trim():null;
  }).find(Boolean);
  if(!executable)throw Error("Chrome/Chromium executable required for visual verification");
  console.log("INSTITUTE_BROWSER",executable);
  chrome=spawn(executable,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--no-first-run","--disable-background-networking","--remote-debugging-address=127.0.0.1","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
  const port=await waitFor(()=>{
    if(chrome.exitCode!==null)throw Error("Chrome exited prematurely");
    const file=path.join(profile,"DevToolsActivePort");
    return existsSync(file)?Number(readFileSync(file,"utf8").split(/\r?\n/)[0]):null;
  },"Chrome DevTools port");
  const target=await(await fetch("http://127.0.0.1:"+port+"/json/new?about:blank",{method:"PUT"})).json();
  ws=new WebSocket(target.webSocketDebuggerUrl);
  ws.addEventListener("message",event=>{
    const data=JSON.parse(String(event.data));
    if(!data.id||!pending.has(data.id))return;
    const deferred=pending.get(data.id);
    pending.delete(data.id);
    clearTimeout(deferred.timer);
    if(data.error)deferred.reject(Error(data.error.message));else deferred.resolve(data.result);
  });
  await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
  await send("Page.enable");await send("Runtime.enable");
  for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768],[1440,900]]){
    for(const [pathname,label] of pages){await testPage(pathname,label,width,height);}
  }
  await interactions();
  console.log("ANEVUM_INSTITUTE_BROWSER_QA_PASS");
}finally{
  for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error("Browser ending"));}pending.clear();
  if(ws)ws.close();
  if(chrome&&chrome.exitCode===null)chrome.kill("SIGTERM");
  if(server.exitCode===null)server.kill("SIGTERM");
  await sleep(450);
  if(chrome&&chrome.exitCode===null)chrome.kill("SIGKILL");
  rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:150});
}
