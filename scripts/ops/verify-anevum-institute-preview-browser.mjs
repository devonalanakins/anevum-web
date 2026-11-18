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
  ["/institute-preview/recognition","recognition"],
  ["/institute-preview/dossier","dossier"],
  ["/institute-preview/studio","studio"],
  ["/institute-preview/profile","profile"],
  ["/institute-preview/academy","academy"],
  ["/institute-preview/academy/cfp-101","course"],
  ["/institute-preview/learn/cfp-101/transistor-switching","transistor"],
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
  if(label==="dossier")await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.getAttribute('data-evidence-ready')==='true'"),"dossier editor loading");
  if(label==="studio"||label==="profile")await waitFor(()=>evaluate("document.querySelector('[data-member-studio],[data-member-profile]')?.dataset.memberReady==='true'"),"learner workspace module");
  const state=await evaluate("(()=>({path:location.pathname,title:document.title,heading:document.querySelector('main h1')?.textContent.trim(),mainCount:document.querySelectorAll('main').length,h1Count:document.querySelectorAll('h1').length,skip:!!document.querySelector('a.skip[href=\"#main\"]'),desktop:!!document.querySelector('nav.desk-nav[aria-label=\"Primary navigation\"]'),mobile:!!document.querySelector('details.mobile-menu'),mobileVisible:getComputedStyle(document.querySelector('details.mobile-menu')).display!=='none',width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,robots:document.querySelector('meta[name=\"robots\"]')?.content,scriptCount:document.scripts.length,allLinksLabelled:[...document.querySelectorAll('a[href]')].every(a=>!!(a.textContent.trim()||a.getAttribute('aria-label'))),scriptsLoaded:!!document.querySelector('script[src=\"/institute-preview/client.js\"]')}))()");
  const identity=await evaluate("(()=>{const mark=document.querySelector('img.identity-mark');const scene=document.querySelector('.hero');const frontier=document.querySelector('.frontier-facility-art');const reader=document.querySelector('.lesson-article');return {markLoaded:!!mark&&mark.complete&&mark.naturalWidth===160,sceneCorrect:!scene||(!!frontier&&getComputedStyle(frontier).backgroundImage.includes('gradient')&&!!document.querySelector('.facility-poster')),readerBackground:reader?getComputedStyle(reader).backgroundColor:null,navSize:document.querySelectorAll('nav.desk-nav a').length}})()");
  verify(identity.markLoaded&&identity.sceneCorrect&&identity.navSize===5,"New identity, scene or navigation is missing",{label,width,identity});
  if(label==="lesson"||label==="transistor")verify(identity.readerBackground==="rgb(244, 241, 232)","Editorial study surface is missing",{label,width,identity});
  verify(state.mainCount===1&&state.h1Count===1&&state.skip&&state.desktop&&state.mobile&&state.scriptsLoaded&&state.allLinksLabelled,"Accessible landmarks or navigation missing",{label,width,state});
  verify(state.robots.includes("noindex")&&state.scriptCount===1,"Unexpected indexing or scripts",{label,width,state});
  verify(state.width>=width-20&&state.width<=width&&state.scrollWidth<=state.width+1&&state.bodyWidth<=state.width+1,"Horizontal overflow",{label,width,state});
  verify((width<=1100)===state.mobileVisible,"Wrong mobile navigation breakpoint",{label,width,state});
  if(label==="home"){
    await waitFor(()=>evaluate("document.querySelector('.facility-poster')?.complete&&document.querySelector('.facility-poster')?.naturalWidth>700"),"real new facility image decode");
    const background=await evaluate("(()=>({artSource:document.querySelector('[data-frontier-visual]').dataset.artSource,posterWidth:document.querySelector('.facility-poster')?.naturalWidth,currentSrc:document.querySelector('.facility-poster')?.currentSrc,facilityScene:getComputedStyle(document.querySelector('.frontier-facility-art')).backgroundImage,links:document.querySelectorAll('.facility-link-dock a').length,title:document.querySelector('main h1').textContent}))()");
    verify(background.artSource==="generated-facility-v2-review"&&background.posterWidth===(width<=650?720:1672)&&background.currentSrc.includes("facility-concept-v2-")&&background.facilityScene.includes("gradient")&&background.links===3&&background.title.includes("frontier"),"New facility art must decode and working activity links must remain usable",{width,background});
    if(width<=390){
      const visual=await evaluate("(()=>{const h=document.querySelector('.frontier-hero--facility h1').getBoundingClientRect(),cta=document.querySelector('.facility-actions a.btn').getBoundingClientRect();return {headingHeight:h.height,headingRight:h.right,ctaTop:cta.top,ctaBottom:cta.bottom,viewport:innerHeight,photoOpacity:getComputedStyle(document.querySelector('.facility-poster')).opacity}})()");
      verify(visual.headingHeight>=70&&visual.headingRight<=width+1&&visual.ctaTop<height-35&&visual.ctaBottom<height+15,"Mobile facility hero must expose a readable headline and working learning action in first viewport",{width,visual});
    }
    await waitFor(()=>evaluate("document.querySelector('[data-frontier-gl]')?.dataset.fxStatus==='reduced-motion'"),"reduced-motion WebGL suppression");
    const fx=await evaluate("(()=>({status:document.querySelector('[data-frontier-gl]').dataset.fxStatus,canvas:!!document.querySelector('[data-frontier-gl]'),draws:document.querySelector('[data-frontier-gl]').dataset.fxFrames||'0',display:getComputedStyle(document.querySelector('[data-frontier-gl]')).display,art:getComputedStyle(document.querySelector('.frontier-facility-art')).backgroundImage}))()");
    verify(fx.canvas&&fx.status==="reduced-motion"&&fx.draws==="0"&&fx.display==="none"&&fx.art.includes("gradient"),"Reduced-motion users must keep an authentic still while avoiding GPU allocation",{width,fx});
  }
  if(label==="recognition"&&width===390){
    const evidence=await evaluate("(()=>({count:document.querySelector('[data-evidence-count]')?.textContent,labels:[...document.querySelectorAll('[data-evidence-activity]')].map(x=>x.getAttribute('data-evidence-state')),status:document.querySelector('[data-evidence-label]')?.textContent}))()");
    verify(evidence.count==="0 / 3"&&evidence.labels.length===3&&evidence.labels.every(x=>x==="incomplete")&&evidence.status.includes("No completed"),"Fresh visitor must not see invented recognition",evidence);
  }
  if(label==="academy"&&width===390){
    const layout=await evaluate("(()=>({courseTop:document.querySelector('.course-card')?.getBoundingClientRect().top,schoolsTop:document.querySelector('.catalog-layout>.aside-panel')?.getBoundingClientRect().top}))()");
    verify(layout.courseTop<layout.schoolsTop&&layout.courseTop<height,"Mobile Academy must show the published learning opportunity before planned schools",{width,layout});
  }
  if((label==="studio"||label==="profile")&&(width===390||width===1440)){
    const start=await evaluate("(()=>{const item=document.querySelector('[data-member-studio] #studio-course-title,[data-member-profile] [data-member-field=displayName]');return item?.getBoundingClientRect().top??9999})()");
    verify(start<height-(label==="studio"?125:20),"Working Studio/profile activity must appear prominently in initial screen",{label,width,height,start});
  }
  if(label==="dossier"&&(width===390||width===1440)){
    const firstField=await evaluate("document.querySelector('[data-evidence-field=title]').getBoundingClientRect().top");
    verify(firstField<height-30,"Personal research activity must be visible in first viewport",{width,height,firstField});
  }
  if((label==="lesson"||label==="transistor"||label==="laboratory")&&(width===390||width===1440)){
    const workTop=await evaluate("(()=>{const el=document.querySelector('.lesson-article')||document.querySelector('[data-and-lab]');return el?.getBoundingClientRect().top??9999})()");
    verify(workTop<height-30,"Study task is pushed below the initial viewport",{label,width,height,workTop});
  }
  if(width===390){
    const opened=await evaluate("(()=>{const menu=document.querySelector('details.mobile-menu');menu.querySelector('summary').click();const opened=menu.open;menu.querySelector('summary').click();return opened&&!menu.open;})()");
    verify(opened,"Mobile menu does not open and close",{label,width});
  }
  const link=await evaluate("(()=>{const anchor=document.querySelector('.skip');anchor.focus();return document.activeElement===anchor})()");
  verify(link,"Skip link cannot receive keyboard focus",{label,width});
  if((width===390||width===1440)){
    await screenshot(label+"-"+width);
    if(label==="home"||label==="recognition"||label==="dossier"||label==="laboratory"||label==="lesson"||label==="transistor")await screenshot(label+"-"+width+"-full",true);
  }
  console.log("INSTITUTE_PAGE_QA_PASS",label,width,state.heading);
}
async function interactions(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  await navigate("/institute-preview");
  await waitFor(()=>evaluate("['active','fallback'].includes(document.querySelector('[data-frontier-gl]')?.dataset.fxStatus)"),"WebGL startup or clean fallback");
  const fx=await evaluate("(()=>({status:document.querySelector('[data-frontier-gl]').dataset.fxStatus,frames:Number(document.querySelector('[data-frontier-gl]').dataset.fxFrames||0),shader:document.querySelector('[data-frontier-gl]').width>0,opacity:Number(getComputedStyle(document.querySelector('[data-frontier-gl]')).opacity),still:document.querySelector('.facility-poster').naturalWidth>700}))()");
  verify(["active","fallback"].includes(fx.status)&&fx.still&&(fx.status!=="active"||fx.opacity<=0.18),"WebGL must draw or fall back without obscuring high-definition facility art",fx);
  if(fx.status==="active"){
    await waitFor(()=>evaluate("Number(document.querySelector('[data-frontier-gl]').dataset.fxFrames||0)>=2"),"shader animation frames");
    await screenshot("home-webgl-active-390",false);
    await send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await navigate("/institute-preview");
    await waitFor(()=>evaluate("document.querySelector('[data-frontier-gl]')?.dataset.fxStatus==='active'&&Number(document.querySelector('[data-frontier-gl]').dataset.fxFrames||0)>=2"),"desktop WebGL shader frames");
    await screenshot("home-webgl-active-1440",false);
    await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
    console.log("INSTITUTE_WEBGL_RENDER_QA_PASS",JSON.stringify({...fx,desktopFrames:true,mobileScreenshot:true,desktopScreenshot:true}));
  }else console.log("INSTITUTE_WEBGL_FALLBACK_QA_PASS",JSON.stringify(fx));
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await waitFor(()=>evaluate("document.querySelector('[data-frontier-gl]')?.dataset.fxStatus==='reduced-motion'"),"WebGL runtime preference switch");
  const stopped=await evaluate("(()=>({status:document.querySelector('[data-frontier-gl]').dataset.fxStatus,display:getComputedStyle(document.querySelector('[data-frontier-gl]')).display}))()");
  verify(stopped.status==="reduced-motion"&&stopped.display==="none","WebGL must stop and hide immediately when user enables reduced motion",stopped);
  console.log("INSTITUTE_WEBGL_ACCESSIBILITY_QA_PASS",JSON.stringify({initial:fx.status,motionStopped:true,stillAvailable:true}));
  // Force a genuine missing GPU context before page scripts run: the still must stay usable.
  const blockedGL=await send("Page.addScriptToEvaluateOnNewDocument",{source:"(()=>{const previous=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl')return null;return previous.apply(this,[type,...args]);};})()"});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  await navigate("/institute-preview");
  await waitFor(()=>evaluate("document.querySelector('[data-frontier-gl]')?.dataset.fxStatus==='fallback'"),"no-WebGL fallback");
  const disabledGL=await evaluate("(()=>({status:document.querySelector('[data-frontier-gl]').dataset.fxStatus,art:document.querySelector('.facility-poster').naturalWidth>700,title:document.querySelector('main h1').textContent}))()");
  verify(disabledGL.status==="fallback"&&disabledGL.art&&disabledGL.title.includes("frontier"),"WebGL absence must preserve readable architecture and learning entry",disabledGL);
  await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:blockedGL.identifier});
  console.log("INSTITUTE_WEBGL_NO_GPU_QA_PASS",JSON.stringify(disabledGL));
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});

  await navigate("/institute-preview/learn/cfp-101/transistor-switching");
  const inverter=await evaluate("(()=>{const root=document.querySelector('[data-inverter-demo]');const t=root.querySelector('[data-inverter-toggle]');const a=root.querySelector('[data-inverter-input]');const q=root.querySelector('[data-inverter-output]');const states=[];const snapshot=()=>states.push([a.textContent,q.textContent]);snapshot();t.click();snapshot();const high=t.getAttribute('aria-pressed');t.click();snapshot();const wrong=document.querySelector('[data-inverter-answer=high]');wrong.click();const incorrect=document.querySelector('#inverter-feedback').textContent;const correct=document.querySelector('[data-inverter-answer=low]');correct.click();return {states,high,incorrect,feedback:document.querySelector('#inverter-feedback').textContent,progress:document.querySelector('[data-local-progress]').textContent,completed:JSON.parse(localStorage.getItem('anevum.institute.cfp101.preview.v1')).transistor};})()");
  verify(JSON.stringify(inverter.states)===JSON.stringify([["0","1"],["1","0"],["0","1"]])&&inverter.high==="true","Ideal inverter toggle or truth table invalid",inverter);
  verify(inverter.incorrect.startsWith("Revisit")&&inverter.feedback.startsWith("Correct.")&&inverter.progress.includes("1 of 3")&&inverter.completed===true,"Inverter assessment/feedback/progress broken",inverter);
  console.log("INSTITUTE_INVERTER_QA_PASS",JSON.stringify(inverter));
  await navigate("/institute-preview/learn/cfp-101/logic-gates");
  const quiz=await evaluate("(()=>{const buttons=[...document.querySelectorAll('[data-answer]')];const correct=buttons.find(b=>b.dataset.answer==='and');correct.click();const feedback=document.querySelector('#answer-feedback').textContent;return {feedback,correct:correct.getAttribute('aria-pressed'),progress:document.querySelector('[data-local-progress]').textContent}})()");
  verify(quiz.feedback.startsWith("Correct.")&&quiz.correct==="true"&&quiz.progress.includes("2 of 3"),"Quiz feedback or progress broken",quiz);
  await navigate("/institute-preview/laboratory/and-gate");
  const lab=await evaluate("(()=>{const root=document.querySelector('[data-and-lab]');const toggle=x=>root.querySelector('[data-input=\"'+x+'\"]').click();const states=[];const snapshot=()=>states.push([root.querySelector('[data-a-mark]').textContent,root.querySelector('[data-b-mark]').textContent,root.querySelector('[data-output]').textContent]);snapshot();toggle('b');snapshot();toggle('a');snapshot();toggle('b');snapshot();const p=root.querySelector('[data-lab-progress]').textContent;const local=JSON.parse(localStorage.getItem('anevum.institute.cfp101.preview.v1'));return {states,progress:p,local,note:root.querySelector('[data-observation]').textContent}})()");
  verify(JSON.stringify(lab.states)===JSON.stringify([["0","0","0"],["0","1","0"],["1","1","1"],["1","0","0"]]),"AND-gate input/output behavior incorrect",lab);
  verify(lab.progress.startsWith("4 of 4")&&lab.local.transistor===true&&lab.local.lesson===true&&lab.local.experiment===true&&lab.note.includes("Experiment completed"),"Experiment completion or storage broken",lab);
  const notebook=await evaluate(`(async()=>{const root=document.querySelector('[data-and-lab]');let captured=null,filename='';const originalCreate=URL.createObjectURL;const stop=e=>{if(e.target.matches('a[download]')){filename=e.target.download;e.preventDefault();}};document.addEventListener('click',stop,true);URL.createObjectURL=blob=>{captured=blob;return 'blob:anevum-qa';};try{root.querySelector('[data-export]').click();const full=JSON.parse(await captured.text());const statusFull=root.querySelector('[data-export-status]').textContent;root.querySelector('[data-reset]').click();root.querySelector('[data-export]').click();const reset=JSON.parse(await captured.text());return {filename,full,statusFull,reset,statusReset:root.querySelector('[data-export-status]').textContent};}finally{URL.createObjectURL=originalCreate;document.removeEventListener('click',stop,true);}})()`);
  verify(notebook.filename==="anevum-cfp101-and-001.json"&&notebook.full.schemaVersion===1&&notebook.full.experimentId==="CFP-101-AND-001"&&notebook.full.model==="ideal-two-input-boolean-and","Notebook metadata or browser download is invalid",notebook);
  verify(JSON.stringify(notebook.full.observations)===JSON.stringify([{inputA:0,inputB:0,outputQ:0},{inputA:0,inputB:1,outputQ:0},{inputA:1,inputB:1,outputQ:1},{inputA:1,inputB:0,outputQ:0}])&&notebook.full.coverage.complete===true,"Notebook does not capture four reproducible logical states",notebook);
  verify(notebook.full.limitations.includes("no analog voltage")&&notebook.statusFull.includes("4 simulated observations")&&notebook.reset.coverage.complete===false&&notebook.reset.coverage.observed===1&&JSON.stringify(notebook.reset.observations)===JSON.stringify([{inputA:0,inputB:0,outputQ:0}])&&notebook.statusReset.includes("1 simulated observation"),"Notebook model boundaries, reset or export feedback is incorrect",notebook);
  console.log("INSTITUTE_NOTEBOOK_QA_PASS",JSON.stringify({file:notebook.filename,complete:notebook.full.coverage,reset:notebook.reset.coverage}));
  const assets=await evaluate("Promise.all(['lab-hero-v1.webp','lab-archive-v1.webp'].map(async n=>{const img=new Image();img.src='/institute-preview/assets/'+n;try{await img.decode();return {name:n,width:img.naturalWidth}}catch(e){return {name:n,width:0,error:String(e)}}}))");
  verify(assets.every(x=>x.width>100),"Same-origin artwork failed to decode",assets);
  const identityArt=await evaluate("Promise.all(['/institute-preview/mark.svg','/institute-preview/observatory.svg'].map(async url=>{const image=new Image();image.src=url;try{await image.decode();return {url,width:image.naturalWidth}}catch(error){return {url,width:0,error:String(error)}}}))");
  verify(identityArt.length===2&&identityArt[0].width===160&&identityArt[1].width===1600,"New SVG artwork does not decode",identityArt);
  await navigate("/institute-preview/recognition");
  const liveEvidence=await evaluate("(()=>({count:document.querySelector('[data-evidence-count]').textContent,flags:[...document.querySelectorAll('[data-evidence-activity]')].map(x=>({key:x.getAttribute('data-evidence-activity'),state:x.getAttribute('data-evidence-state')})),caption:document.querySelector('[data-evidence-label]').textContent}))()");
  verify(liveEvidence.count==="3 / 3"&&liveEvidence.flags.every(x=>x.state==="complete")&&liveEvidence.caption.includes("not independently verified"),"Evidence counter must reflect real local progress without implying awards",liveEvidence);
  console.log("INSTITUTE_EVIDENCE_QA_PASS",JSON.stringify(liveEvidence));
  // An untrusted document is only ever a local draft. Exercise the complete edit/save/import/delete path.
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.getAttribute('data-evidence-ready')==='true'"),"evidence workbench module");
  const dossierInitial=await evaluate("(()=>({status:document.querySelector('[data-evidence-status]').textContent,value:document.querySelector('[data-evidence-field=title]').value,credential:document.querySelector('.dossier-panel').textContent.includes('NOT AN ATTESTATION')}))()");
  verify(dossierInitial.status.includes("No local draft")&&dossierInitial.value===""&&dossierInitial.credential,"Dossier must start empty without manufactured recognition",dossierInitial);
  const invalidDossier=await evaluate("(()=>{document.querySelector('[data-evidence-save]').click();return true})()");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-status]').textContent.startsWith('Not saved:')"),"invalid dossier rejection");
  const invalidStatus=await evaluate("document.querySelector('[data-evidence-status]').textContent");
  verify(invalidDossier&&invalidStatus.includes("title"),"Empty dossier should not save",invalidStatus);
  const sampleDossier=await evaluate("(()=>{const values={title:'AND logic: four input combinations',question:'Which of the four binary input states produces an AND output of one?',method:'In the ANEVUM ideal Boolean simulator, begin at 00. Toggle input B, then A, then B; record every output and repeat the procedure.',observations:'The browser produced 00=0, 01=0, 11=1, and 10=0, demonstrating the ideal Boolean AND truth table.',limitations:'This simulation does not measure physical voltages, energy, switching delays or the behavior of actual transistors.',references:'https://ocw.mit.edu/'};Object.entries(values).forEach(([name,value])=>{const field=document.querySelector('[data-evidence-field='+name+']');field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));});document.querySelector('[data-evidence-save]').click();return values;})()");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-status]').textContent.startsWith('Personal draft saved')"),"dossier save");
  const savedDossier=await evaluate("(()=>{const key='anevum.institute.evidence-draft.v1';const record=JSON.parse(localStorage.getItem(key));return {digest:record.digest,title:record.record.title,kind:record.record.kind,receipt:document.querySelector('[data-evidence-digest]').textContent};})()");
  verify(savedDossier.title===sampleDossier.title&&savedDossier.kind==="personal-unreviewed-draft"&&/^sha256:[a-f0-9]{64}$/.test(savedDossier.digest)&&savedDossier.receipt===savedDossier.digest,"Saved evidence lacked canonical identity/checksum",savedDossier);
  await navigate("/institute-preview/recognition");
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.getAttribute('data-evidence-ready')==='true'"),"restored dossier module");
  const restoredDossier=await evaluate("(()=>({title:document.querySelector('[data-evidence-field=title]').value,status:document.querySelector('[data-evidence-status]').textContent,receipt:document.querySelector('[data-evidence-digest]').textContent}))()");
  verify(restoredDossier.title===sampleDossier.title&&restoredDossier.status.includes("restored")&&restoredDossier.receipt===savedDossier.digest,"Dossier lost saved work on navigation",restoredDossier);
  const dossierExport=await evaluate(`(async()=>{const old=URL.createObjectURL;let captured=null,filename='';const intercept=e=>{if(e.target.matches('a[download]')){filename=e.target.download;e.preventDefault();}};document.addEventListener('click',intercept,true);URL.createObjectURL=blob=>{captured=blob;return 'blob:anevum-dossier-qa';};try{document.querySelector('[data-evidence-export]').click();for(let i=0;i<30&&!captured;i++)await new Promise(resolve=>setTimeout(resolve,15));return {filename,contents:captured?await captured.text():null};}finally{URL.createObjectURL=old;document.removeEventListener('click',intercept,true);}})()`);
  verify(dossierExport.filename==="anevum-personal-evidence-CFP-101.json"&&dossierExport.contents!==null,"Dossier browser export did not create JSON",dossierExport);
  const parsedDossier=JSON.parse(dossierExport.contents);
  verify(parsedDossier.digest===savedDossier.digest&&parsedDossier.record.title===sampleDossier.title&&parsedDossier.format==="anevum-personal-evidence-draft/v1","Export content differs from saved draft",parsedDossier);
  // Import a modified file with a stale checksum; it must be rejected without overwriting any field or stored record.
  const importTest=await evaluate(`(async()=>{const key='anevum.institute.evidence-draft.v1',input=document.querySelector('[data-evidence-import]');const old=JSON.parse(localStorage.getItem(key));const modified={...old,record:{...old.record,title:'FORGED RESEARCH CLAIM'}};const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(modified)],'forged.json',{type:'application/json'}));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<40&&!document.querySelector('[data-evidence-status]').textContent.startsWith('Import rejected');i++)await new Promise(resolve=>setTimeout(resolve,20));return {message:document.querySelector('[data-evidence-status]').textContent,stored:JSON.parse(localStorage.getItem(key)).record.title,visible:document.querySelector('[data-evidence-field=title]').value};})()`);
  verify(importTest.message.includes("Integrity mismatch")&&importTest.stored===sampleDossier.title&&importTest.visible===sampleDossier.title,"Forged import should be rejected without changing stored records",importTest);
  const deletionTest=await evaluate("(()=>{const button=document.querySelector('[data-evidence-delete]');const key='anevum.institute.evidence-draft.v1';button.click();const pending={label:button.textContent,stillSaved:localStorage.getItem(key)!==null};button.click();return {pending,stored:localStorage.getItem(key),status:document.querySelector('[data-evidence-status]').textContent,field:document.querySelector('[data-evidence-field=title]').value};})()");
  verify(deletionTest.pending.label==="Confirm deletion"&&deletionTest.pending.stillSaved&&deletionTest.stored===null&&deletionTest.field===""&&deletionTest.status.includes("deleted"),"Dossier deletion must require confirmation and actually clear saved data",deletionTest);
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.getAttribute('data-evidence-ready')==='true'"),"dossier post-delete");
  const postDelete=await evaluate("(()=>({title:document.querySelector('[data-evidence-field=title]').value,status:document.querySelector('[data-evidence-status]').textContent}))()");
  verify(postDelete.title===""&&postDelete.status.includes("No local draft"),"Deleted dossier must not reappear",postDelete);
  // Ingest a real exported AND-gate simulation. Reject forged model output before showing an opt-in Apply step.
  async function loadLabIntoDossier(value){
    const body=JSON.stringify(JSON.stringify(value));
    const expression="(async()=>{const content="+body+";const input=document.querySelector('[data-lab-import]');const dt=new DataTransfer();dt.items.add(new File([content],'and-lab.json',{type:'application/json'}));input.files=dt.files;const previous=document.querySelector('[data-lab-feedback]').textContent;input.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<50&&(document.querySelector('[data-lab-feedback]').textContent===previous||!/^(Validated|Laboratory import rejected)/.test(document.querySelector('[data-lab-feedback]').textContent));i++)await new Promise(r=>setTimeout(r,15));return {feedback:document.querySelector('[data-lab-feedback]').textContent,buttonHidden:document.querySelector('[data-lab-apply]').hidden,title:document.querySelector('[data-evidence-field=title]').value,stored:localStorage.getItem('anevum.institute.evidence-draft.v1')};})()";
    return evaluate(expression);
  }
  const fakeLab=structuredClone(notebook.full);
  fakeLab.observations[2].outputQ=0;
  const invalidLab=await loadLabIntoDossier(fakeLab);
  verify(invalidLab.feedback.includes("inconsistent with ideal Boolean AND")&&invalidLab.buttonHidden&&invalidLab.title===""&&invalidLab.stored===null,"Falsified laboratory output cannot populate an evidence draft",invalidLab);
  const checkedLab=await loadLabIntoDossier(notebook.full);
  verify(checkedLab.feedback.includes("Validated 4 of 4 ideal Boolean input states")&&!checkedLab.buttonHidden&&checkedLab.title===""&&checkedLab.stored===null,"Lab import must be staged without overwriting the research desk",checkedLab);
  const importedLab=await evaluate("(()=>{document.querySelector('[data-lab-apply]').click();return {title:document.querySelector('[data-evidence-field=title]').value,observations:document.querySelector('[data-evidence-field=observations]').value,limitations:document.querySelector('[data-evidence-field=limitations]').value,feedback:document.querySelector('[data-lab-feedback]').textContent,local:localStorage.getItem('anevum.institute.evidence-draft.v1')};})()");
  verify(importedLab.title.includes("Boolean AND study (4 of 4 states)")&&importedLab.observations.includes("11 -> 1")&&importedLab.observations.includes("Simulated (not measured)")&&importedLab.limitations.includes("not independently reviewed")&&importedLab.feedback.includes("copied into the editor")&&importedLab.local===null,"Lab import must preserve simulation qualifications and await explicit save",importedLab);
  console.log("INSTITUTE_LAB_TO_DOSSIER_QA_PASS",JSON.stringify({observed:4,forgeryRejected:true,applied:true,autoSaved:false}));
  console.log("INSTITUTE_DOSSIER_QA_PASS",JSON.stringify({digest:savedDossier.digest,persistence:true,export:parsedDossier.format,tamperRejected:true,confirmedDelete:true}));
  // The Canvas-like Studio uses the SAME local activity flags; the member card is
  // private, unissued and independent of notes, award state, and Command identity.
  await navigate("/institute-preview/studio");
  await waitFor(()=>evaluate("document.querySelector('[data-member-studio]')?.dataset.memberReady==='true'"),"Studio client");
  const studioBefore=await evaluate("(()=>({name:document.querySelector('[data-studio-name]').textContent,count:document.querySelector('[data-studio-count]').textContent,progress:document.querySelector('[data-studio-meter]').getAttribute('aria-valuenow'),next:document.querySelector('[data-studio-resume]').getAttribute('href'),states:[...document.querySelectorAll('[data-studio-activity]')].map(x=>x.dataset.status),evidence:document.querySelector('[data-studio-evidence-state]').textContent}))()");
  verify(studioBefore.name==="Independent learner"&&studioBefore.count==="3 of 3"&&studioBefore.progress==="3"&&studioBefore.states.every(x=>x==="local-complete")&&studioBefore.evidence.includes("No saved research dossier"),"Studio must show real local progress, never an invented award",studioBefore);
  await navigate("/institute-preview/profile");
  await waitFor(()=>evaluate("document.querySelector('[data-member-profile]')?.dataset.memberReady==='true'"),"member-card editor");
  const profileWrite=await evaluate("(()=>{const field=document.querySelector('[data-member-field=displayName]');const tagline=document.querySelector('[data-member-field=tagline]');field.value='Ada Experimenter';field.dispatchEvent(new Event('input',{bubbles:true}));tagline.value='I build reproducible logic experiments.';tagline.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-member-interest=Physics]').click();document.querySelector('[data-member-save]').click();const saved=JSON.parse(localStorage.getItem('anevum.institute.member-card.v1'));return {name:saved.displayName,tagline:saved.tagline,physics:saved.interests.includes('Physics'),status:document.querySelector('[data-member-status]').textContent,visible:document.querySelector('[data-member-name]').textContent};})()");
  verify(profileWrite.name==="Ada Experimenter"&&profileWrite.physics&&profileWrite.visible===profileWrite.name&&profileWrite.status.includes("saved on this device"),"Private profile could not be saved",profileWrite);
  await navigate("/institute-preview/studio");
  await waitFor(()=>evaluate("document.querySelector('[data-member-studio]')?.dataset.memberReady==='true'"),"Studio refreshed profile");
  const profileInStudio=await evaluate("(()=>({name:document.querySelector('[data-studio-name]').textContent,interests:document.querySelector('[data-studio-interests]').textContent,progress:document.querySelector('[data-studio-count]').textContent}))()");
  verify(profileInStudio.name===profileWrite.name&&profileInStudio.interests.includes("Physics")&&profileInStudio.progress==="3 of 3","Saved identity failed to appear beside existing work",profileInStudio);
  await navigate("/institute-preview/profile");
  await waitFor(()=>evaluate("document.querySelector('[data-member-profile]')?.dataset.memberReady==='true'"),"profile restoration");
  const profileExport=await evaluate(`(async()=>{let captured=null;let name='';const old=URL.createObjectURL;const stop=e=>{if(e.target.matches('a[download]')){e.preventDefault();name=e.target.download;}};document.addEventListener('click',stop,true);URL.createObjectURL=blob=>{captured=blob;return 'blob:anevum-local-member';};try{document.querySelector('[data-member-export]').click();return {filename:name,body:captured?await captured.text():null};}finally{URL.createObjectURL=old;document.removeEventListener('click',stop,true);}})()`);
  verify(profileExport.filename==="anevum-local-learner-card.json"&&JSON.parse(profileExport.body).profile.displayName==="Ada Experimenter","Portable learner card export broken",profileExport);
  const forgedProfile=await evaluate(`(async()=>{const card=JSON.parse(localStorage.getItem('anevum.institute.member-card.v1'));const input=document.querySelector('[data-member-import]');const dt=new DataTransfer();dt.items.add(new File([JSON.stringify({format:'anevum-local-member-card/v1',profile:{...card,role:'administrator'}})],'forged.json',{type:'application/json'}));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<30&&!document.querySelector('[data-member-status]').textContent.startsWith('Import rejected');i++)await new Promise(r=>setTimeout(r,15));return {status:document.querySelector('[data-member-status]').textContent,stored:JSON.parse(localStorage.getItem('anevum.institute.member-card.v1')).displayName};})()`);
  verify(forgedProfile.status.includes("Unrecognized")&&forgedProfile.stored==="Ada Experimenter","Forged administrative profile import was not rejected",forgedProfile);
  const deletion=await evaluate("(()=>{const btn=document.querySelector('[data-member-delete]');const card='anevum.institute.member-card.v1';const course='anevum.institute.cfp101.preview.v1';btn.click();const pending={label:btn.textContent,exists:localStorage.getItem(card)!==null};btn.click();return {pending,removed:localStorage.getItem(card)===null,courseProgress:JSON.parse(localStorage.getItem(course)).experiment,display:document.querySelector('[data-member-name]').textContent};})()");
  verify(deletion.pending.label==="Confirm card deletion"&&deletion.pending.exists&&deletion.removed&&deletion.courseProgress&&deletion.display==="Independent learner","Private profile deletion must not erase course records",deletion);
  console.log("INSTITUTE_MEMBER_STUDIO_QA_PASS",JSON.stringify({profileSaved:true,restored:true,exported:true,forgeryRejected:true,deleteConfirmed:true,progressPreserved:true}));
  // Notes are scoped to a lesson and must survive navigation without leaking to others.
  await navigate("/institute-preview/learn/cfp-101/transistor-switching");
  const notesSaved=await evaluate("(()=>{const root=document.querySelector('[data-study-lesson]');const text=root.querySelector('[data-study-text]');text.value='Input high enables nMOS; in the ideal model Q=0.';root.querySelector('[data-study-save]').click();root.querySelector('[data-study-bookmark]').click();return {key:root.getAttribute('data-study-lesson'),note:JSON.parse(localStorage.getItem('anevum.institute.study.v1.CFP-101-U01')).note,bookmark:root.querySelector('[data-study-bookmark]').getAttribute('aria-pressed'),status:root.querySelector('[data-study-status]').textContent};})()");
  verify(notesSaved.key==="CFP-101-U01"&&notesSaved.note.includes("nMOS")&&notesSaved.bookmark==="true"&&notesSaved.status.includes("bookmarked"),"Notebook save/bookmark did not persist",notesSaved);
  await navigate("/institute-preview/learn/cfp-101/logic-gates");
  const notesIsolation=await evaluate("(()=>({value:document.querySelector('[data-study-text]').value,key:document.querySelector('[data-study-lesson]').getAttribute('data-study-lesson'),stored:localStorage.getItem('anevum.institute.study.v1.CFP-101-U02')}))()");
  verify(notesIsolation.key==="CFP-101-U02"&&notesIsolation.value===""&&notesIsolation.stored===null,"Study notes leaked across lessons",notesIsolation);
  await navigate("/institute-preview/learn/cfp-101/transistor-switching");
  const notesReloaded=await evaluate("(()=>({value:document.querySelector('[data-study-text]').value,bookmark:document.querySelector('[data-study-bookmark]').getAttribute('aria-pressed')}))()");
  verify(notesReloaded.value===notesSaved.note&&notesReloaded.bookmark==="true","Saved notes did not survive a page reload",notesReloaded);
  const notesExport=await evaluate(`(async()=>{let captured=null,filename="";const old=URL.createObjectURL;const prevent=e=>{if(e.target.matches('a[download]')){filename=e.target.download;e.preventDefault();}};document.addEventListener('click',prevent,true);URL.createObjectURL=blob=>{captured=blob;return 'blob:study-notes-qa';};try{document.querySelector('[data-study-download]').click();return {filename,body:await captured.text(),status:document.querySelector('[data-study-status]').textContent}}finally{URL.createObjectURL=old;document.removeEventListener('click',prevent,true);}})()`);
  verify(notesExport.filename==="anevum-cfp101-u01-notes.txt"&&notesExport.body.includes(notesSaved.note)&&notesExport.body.includes("Browser-local export")&&notesExport.status.includes("Text export requested"),"Text notebook export failed",notesExport);
  const notesDelete=await evaluate("(()=>{const btn=document.querySelector('[data-study-clear]');const key='anevum.institute.study.v1.CFP-101-U01';btn.click();const pending={label:btn.textContent,exists:localStorage.getItem(key)!==null};btn.click();return {pending,stored:localStorage.getItem(key),text:document.querySelector('[data-study-text]').value,bookmark:document.querySelector('[data-study-bookmark]').getAttribute('aria-pressed'),status:document.querySelector('[data-study-status]').textContent};})()");
  verify(notesDelete.pending.label==="Confirm deletion"&&notesDelete.pending.exists&&notesDelete.stored===null&&notesDelete.text===""&&notesDelete.bookmark==="false"&&notesDelete.status.includes("deleted"),"Two-step delete must remove notes only after confirmation",notesDelete);
  await navigate("/institute-preview/learn/cfp-101/transistor-switching");
  const notesEmpty=await evaluate("(()=>({value:document.querySelector('[data-study-text]').value,bookmark:document.querySelector('[data-study-bookmark]').getAttribute('aria-pressed')}))()");
  verify(notesEmpty.value===""&&notesEmpty.bookmark==="false","Deleted notes unexpectedly reappeared",notesEmpty);
  console.log("INSTITUTE_STUDY_NOTES_QA_PASS",JSON.stringify({saved:notesSaved,isolated:notesIsolation.key,exportFilename:notesExport.filename,deleted:notesDelete.stored===null}));
  console.log("INSTITUTE_INTERACTION_QA_PASS",JSON.stringify({inverter,quiz,lab,assets}));
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
