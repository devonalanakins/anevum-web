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
  ["/institute-preview/research","research"],
  ["/institute-preview/recognition","recognition"],
  ["/institute-preview/dossier","dossier"],
  ["/institute-preview/studio","studio"],
  ["/institute-preview/profile","profile"],
  ["/institute-preview/academy","academy"],
  ["/institute-preview/academy/cfp-101","course"],
  ["/institute-preview/learn/cfp-101/transistor-switching","transistor"],
  ["/institute-preview/learn/cfp-101/logic-gates","lesson"],
  ["/institute-preview/learn/cfp-101/half-adders","adder"],
  ["/institute-preview/laboratory/and-gate","laboratory"],
  ["/institute-preview/laboratory/cluster-scheduling","cluster"],
  ["/institute-preview/laboratory/neuron-dynamics","neuron"]
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
  const identity=await evaluate("(()=>{const mark=document.querySelector('img.identity-mark');const scene=document.querySelector('.hero');const frontier=document.querySelector('.frontier-facility-art');const reader=document.querySelector('.lesson-article');return {markLoaded:!!mark&&mark.complete&&mark.naturalWidth===160&&mark.currentSrc.includes('/institute-preview/mark.svg'),iconHref:document.querySelector('link[rel=icon]')?.getAttribute('href'),sceneCorrect:!scene||(!!frontier&&getComputedStyle(frontier).backgroundImage.includes('gradient')&&!!document.querySelector('.facility-poster')),readerBackground:reader?getComputedStyle(reader).backgroundColor:null,navSize:document.querySelectorAll('nav.desk-nav a').length}})()");
  verify(identity.markLoaded&&identity.iconHref==='/institute-preview/mark-small.svg'&&identity.sceneCorrect&&identity.navSize===5,"New identity, scene or navigation is missing",{label,width,identity});
  if(label==="lesson"||label==="transistor"||label==="adder")verify(identity.readerBackground==="rgb(244, 241, 232)","Editorial study surface is missing",{label,width,identity});
  verify(state.mainCount===1&&state.h1Count===1&&state.skip&&state.desktop&&state.mobile&&state.scriptsLoaded&&state.allLinksLabelled,"Accessible landmarks or navigation missing",{label,width,state});
  verify(state.robots.includes("noindex")&&state.scriptCount===1,"Unexpected indexing or scripts",{label,width,state});
  verify(state.width>=width-20&&state.width<=width&&state.scrollWidth<=state.width+1&&state.bodyWidth<=state.width+1,"Horizontal overflow",{label,width,state});
  verify((width<=1100)===state.mobileVisible,"Wrong mobile navigation breakpoint",{label,width,state});
  if(label==="home"){
    const academic=await evaluate("(()=>{const hero=document.querySelector('.academic-intro'),heading=hero?.querySelector('h1'),link=hero?.querySelector('a.academic-primary'),figures=document.querySelectorAll('.institution-home img,.institution-home picture,.institution-home canvas,.institution-home video'),styles=getComputedStyle(hero),nav=[...document.querySelectorAll('nav.desk-nav a')].map(a=>a.textContent.trim()),statements=[...document.querySelectorAll('.academic-study-head span')].map(x=>x.textContent.trim());return {heading:heading?.textContent,background:styles.backgroundImage,mediaCount:figures.length,courseCards:document.querySelectorAll('.academic-offering').length,fieldCount:document.querySelectorAll('.academic-field-list li').length,pathways:document.querySelectorAll('.academic-pathways a').length,linkVisible:!!link,nav,statements};})()");
    verify(academic.heading.includes("open institute")&&academic.background==="none"&&academic.mediaCount===0&&academic.courseCards===3&&academic.fieldCount===6&&academic.pathways===3&&academic.linkVisible&&academic.nav.length===5,"Institutional home must be editorial, compact and contain working academic paths",{width,academic});
    if(width<=390){
      const visual=await evaluate("(()=>{const hero=document.querySelector('.academic-intro h1').getBoundingClientRect(),cta=document.querySelector('.academic-primary').getBoundingClientRect(),viewport=innerHeight;return {headingHeight:hero.height,headingRight:hero.right,ctaTop:cta.top,ctaBottom:cta.bottom,viewport};})()");
      verify(visual.headingHeight>=65&&visual.headingRight<=width+1&&visual.ctaTop<height-35&&visual.ctaBottom<height+15,"Mobile academic home must show the main action in the first viewport",{width,visual});
    }
  }
  if(label==="research"){
    const models=await evaluate("(()=>({count:document.querySelectorAll('.research-experiment').length,heading:document.querySelector('.research-index h1')?.textContent,source:document.querySelector('nav.desk-nav a[aria-current=page]')?.getAttribute('href'),links:[...document.querySelectorAll('.research-experiment>a')].map(a=>a.getAttribute('href')),images:document.querySelectorAll('.research-index img,.research-index canvas,.research-index video').length}))()");
    verify(models.count===3&&models.heading?.includes("testable question")&&models.source==="/institute-preview/research"&&models.images===0&&models.links.every(link=>link.startsWith("/institute-preview/laboratory/")),"Research page must expose actual labeled local models",{width,models});
  }
  if(label==="recognition"&&width===390){
    const evidence=await evaluate("(()=>({count:document.querySelector('[data-evidence-count]')?.textContent,labels:[...document.querySelectorAll('[data-evidence-activity]')].map(x=>x.getAttribute('data-evidence-state')),status:document.querySelector('[data-evidence-label]')?.textContent}))()");
    verify(evidence.count==="0 / 3"&&evidence.labels.length===3&&evidence.labels.every(x=>x==="incomplete")&&evidence.status.includes("No completed"),"Fresh visitor must not see invented recognition",evidence);
  }
  if(label==="neuron"&&(width===390||width===1440)){
    await waitFor(()=>evaluate("document.querySelector('[data-neuron-lab]')?.dataset.neuronReady==='true'"),"neuron teaching model initialized");
    const action=await evaluate("(()=>{const b=document.querySelector('[data-neuron-run]').getBoundingClientRect();return {top:b.top,bottom:b.bottom,viewport:innerHeight};})()");
    verify(action.bottom<=height-6,"Neuron lab primary simulation control is below the initial viewport",{width,action});
  }
  if(label==="cluster"&&(width===390||width===1440)){
    const action=await evaluate("(()=>{const b=document.querySelector('[data-cluster-run]').getBoundingClientRect();const t=document.querySelector('.cluster-table-wrap').getBoundingClientRect();return {buttonTop:b.top,buttonBottom:b.bottom,tableTop:t.top,visible:innerHeight};})()");
    verify(action.buttonBottom<=height-6&&action.buttonTop<action.tableTop,"GPU lab must expose its primary action before the workload table in the initial viewport",{width,action});
  }
  if(label==="academy"){
    const directory=await evaluate("(()=>{const lessons=[...document.querySelectorAll('.academy-unit-link')];const labs=[...document.querySelectorAll('.academy-lab-item > a')];const one=document.querySelector('[data-study-path-progress]');return {lessons:lessons.map(a=>a.getAttribute('href')),labs:labs.map(a=>a.getAttribute('href')),course:document.querySelector('.course-card')?.getBoundingClientRect().top,firstLesson:lessons[0]?.getBoundingClientRect().top,firstLab:labs[0]?.getBoundingClientRect().top,planned:document.querySelector('.catalog-layout>.aside-panel')?.textContent.includes('proposed'),progress:one?.textContent,markers:[...document.querySelectorAll('.academy-unit-copy [data-study-path-status]')].map(x=>x.textContent)}})()");
    verify(directory.lessons.length===3&&directory.labs.length===3&&directory.lessons.every(x=>x.startsWith('/institute-preview/learn/cfp-101/'))&&directory.labs.every(x=>x.startsWith('/institute-preview/laboratory/'))&&directory.firstLesson>directory.course&&directory.firstLab>directory.firstLesson&&directory.planned&&directory.markers[2].includes('not tracked'),"Academy must show real lesson-to-experiment paths without invented accreditation",{width,directory});
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
  if((label==="lesson"||label==="transistor"||label==="adder"||label==="laboratory")&&(width===390||width===1440)){
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
    if(label==="home"||label==="research"||label==="recognition"||label==="dossier"||label==="laboratory"||label==="lesson"||label==="transistor"||label==="adder")await screenshot(label+"-"+width+"-full",true);
  }
  console.log("INSTITUTE_PAGE_QA_PASS",label,width,state.heading);
}

async function compactShellQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate("/institute-preview/academy");
  const open=await evaluate("(()=>{const trigger=document.querySelector('[data-search-open]');trigger.click();const d=document.querySelector('[data-command-dialog]');return {modal:d.open,focused:document.activeElement===d.querySelector('[data-command-query]'),count:d.querySelectorAll('.command-result').length};})()");
  verify(open.modal&&open.focused&&open.count===14,"Compact palette did not open with actual routes",open);
  const search=await evaluate("(()=>{const d=document.querySelector('[data-command-dialog]');const q=d.querySelector('[data-command-query]');q.value='transistor';q.dispatchEvent(new Event('input',{bubbles:true}));return [...d.querySelectorAll('.command-result')].map(a=>a.getAttribute('href'));})()");
  verify(search.includes("/institute-preview/learn/cfp-101/transistor-switching")&&search.every(url=>url.startsWith("/institute-preview/")),"Search did not resolve the existing lesson",search);
  const closed=await evaluate("(()=>{const d=document.querySelector('[data-command-dialog]');d.querySelector('[data-command-close]').click();return !d.open;})()");
  verify(closed,"Palette close button did not close the dialog",{closed});
  const restoredFocus=await waitFor(()=>evaluate("document.activeElement?.matches('[data-search-open]')"),"dialog close event to restore opener focus");
  verify(restoredFocus,"Palette did not restore its opener focus",{restoredFocus});
  const keyboard=await evaluate("(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'/',bubbles:true}));const d=document.querySelector('[data-command-dialog]');const active=d.open&&document.activeElement===d.querySelector('[data-command-query]');d.close();return active;})()");
  verify(keyboard,"Slash shortcut failed",{keyboard});
  console.log("ANEVUM_COMPACT_PALETTE_PASS");
}


async function compactCourseUsabilityQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  // A browser-local activity must never be presented as a degree, verified award or completed course.
  await navigate("/institute-preview/academy");
  const clean=await evaluate("(()=>{localStorage.removeItem('anevum.institute.cfp101.preview.v1');return true;})()");
  verify(clean,"Could not clear synthetic practice flags");
  const stages=[
    [{transistor:false,lesson:false,experiment:false},"/learn/cfp-101/transistor-switching","Begin lesson 01"],
    [{transistor:true,lesson:false,experiment:false},"/learn/cfp-101/logic-gates","Continue lesson 02"],
    [{transistor:true,lesson:true,experiment:false},"/laboratory/and-gate","Run AND laboratory"],
    [{transistor:true,lesson:true,experiment:true},"/learn/cfp-101/half-adders","Explore lesson 03"]
  ];
  for(const entry of stages){
    await evaluate("localStorage.setItem('anevum.institute.cfp101.preview.v1',"+JSON.stringify(JSON.stringify(entry[0]))+")");
    await navigate("/institute-preview/academy");
    const academy=await evaluate("(()=>{const a=document.querySelector('[data-course-resume]');return {href:a?.getAttribute('href'),text:a?.textContent,status:document.querySelector('[data-course-activity-status]')?.textContent};})()");
    verify(academy.href==="/institute-preview"+entry[1]&&academy.text.includes(entry[2])&&academy.status.includes("No academic credit"),"Academy next step is inconsistent with saved local practice",{stage:entry[0],academy});
    await navigate("/institute-preview/academy/cfp-101");
    const course=await evaluate("(()=>{const a=document.querySelector('[data-course-resume]');return {href:a?.getAttribute('href'),text:a?.textContent,display:document.querySelectorAll('[data-unit-availability]:not([hidden])').length,planned:document.querySelectorAll('[data-unit-availability=planned]').length};})()");
    verify(course.href==="/institute-preview"+entry[1]&&course.text.includes(entry[2])&&course.display===8&&course.planned===5,"Course syllabus continuation or availability incorrect",{stage:entry[0],course});
  }
  // The learner can move among three real lessons, with only existing local checks recorded.
  for(const [lessonPath,unitId] of [
    ["/learn/cfp-101/transistor-switching","CFP-101-U01"],
    ["/learn/cfp-101/logic-gates","CFP-101-U02"],
    ["/learn/cfp-101/half-adders","CFP-101-U03"]
  ]){
    await navigate("/institute-preview"+lessonPath);
    const nav=await evaluate("(()=>{const root=document.querySelector('[data-study-path]');return {current:root?.querySelector('[aria-current=page]')?.getAttribute('href'),count:root?.querySelectorAll('.study-path-link').length,labels:[...root.querySelectorAll('[data-study-path-status]')].map(x=>({unit:x.getAttribute('data-study-path-status'),text:x.textContent.trim()})),note:document.querySelector('[data-study-lesson]')?.getAttribute('data-study-lesson'),scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}})()");
    verify(nav.current==="/institute-preview"+lessonPath&&nav.count===3&&nav.note===unitId&&nav.scroll<=nav.width+1&&nav.labels[2].text.includes("not tracked"),"Accessible study path must show three real lessons without inventing lesson 03 completion",{lessonPath,nav});
  }
  await navigate("/institute-preview/learn/cfp-101/half-adders");
  const notes=await evaluate("(()=>{const p=document.querySelector('[data-study-lesson=CFP-101-U03]');const t=p?.querySelector('[data-study-text]');const save=p?.querySelector('[data-study-save]');if(!t||!save)return null;t.value='Local test notebook for combinational arithmetic';t.dispatchEvent(new Event('input',{bubbles:true}));save.click();return {message:p.querySelector('[data-study-status]')?.textContent,value:t.value,stored:localStorage.getItem('anevum.institute.study.v1.CFP-101-U03')}})()");
  verify(notes&&notes.stored?.includes("Local test notebook")&&notes.message?.includes("saved"),"Lesson 03 personal notebook save must work without a backend",notes);
  await navigate("/institute-preview/learn/cfp-101/half-adders");
  const restoredNote=await evaluate("document.querySelector('[data-study-lesson=CFP-101-U03] [data-study-text]')?.value");
  verify(restoredNote==="Local test notebook for combinational arithmetic","Lesson 03 notebook must restore on reload",restoredNote);
  await evaluate("localStorage.removeItem('anevum.institute.study.v1.CFP-101-U03')");
  console.log("ANEVUM_STUDY_PATH_AND_U03_NOTES_QA_PASS");
  await navigate("/institute-preview/academy/cfp-101");
  const toggled=await evaluate("(()=>{const b=document.querySelector('[data-unit-filter=available]');b.click();return {pressed:b.getAttribute('aria-pressed'),shown:document.querySelectorAll('[data-unit-availability]:not([hidden])').length,hidden:document.querySelectorAll('[data-unit-availability][hidden]').length,status:document.querySelector('[data-unit-filter-status]').textContent};})()");
  verify(toggled.pressed==="true"&&toggled.shown===3&&toggled.hidden===5&&toggled.status.includes("hidden, not removed"),"Available-only course filtering is inaccurate",toggled);
  const restored=await evaluate("(()=>{document.querySelector('[data-unit-filter=all]').click();return {shown:document.querySelectorAll('[data-unit-availability]:not([hidden])').length,selected:document.querySelector('[data-unit-filter=all]').getAttribute('aria-pressed')};})()");
  verify(restored.shown===8&&restored.selected==="true","All-units filter did not restore full syllabus",restored);
  for(const p of ["/academy","/academy/cfp-101","/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates","/learn/cfp-101/half-adders","/laboratory/and-gate"]){
    await navigate("/institute-preview"+p);
    const legible=await evaluate("(()=>{const el=document.querySelector('.page-hero');const bg=getComputedStyle(el,'::before');return {bg:el&&getComputedStyle(el).backgroundImage,deco:bg.content,overlay:bg.backgroundImage};})()");
    verify(legible.deco==="none"&&legible.overlay==="none","Mobile study hero remains obscured by decorative diagram",{p,legible});
  }
  // Restore the original browser test's expected fresh-visitor state.
  await evaluate("localStorage.removeItem('anevum.institute.cfp101.preview.v1')");
  console.log("ANEVUM_COMPACT_COURSE_USABILITY_QA_PASS");
}


async function halfAdderBrowserQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await navigate("/institute-preview/learn/cfp-101/half-adders");
  const result=await evaluate("(()=>{const root=document.querySelector('[data-half-adder]');const a=root.querySelector('[data-half-input=a]');const b=root.querySelector('[data-half-input=b]');const snap=()=>({a:a.getAttribute('aria-pressed'),b:b.getAttribute('aria-pressed'),sum:root.querySelector('[data-half-sum]').textContent,carry:root.querySelector('[data-half-carry]').textContent,progress:root.querySelector('[data-half-progress]').textContent});const initial=snap();b.click();const after01=snap();a.click();const after11=snap();b.click();const after10=snap();return {initial,after01,after11,after10,visited:[...root.querySelectorAll('[data-half-row]')].map(x=>({row:x.getAttribute('data-half-row'),seen:x.classList.contains('was-visited')}))};})()");
  verify(result.initial.sum==="0"&&result.initial.carry==="0"&&result.initial.progress.startsWith("1 of 4"),"Half adder 00 is incorrect",result);
  verify(result.after01.sum==="1"&&result.after01.carry==="0","Half adder 01 is incorrect",result);
  verify(result.after11.sum==="0"&&result.after11.carry==="1","Half adder 11 is incorrect",result);
  verify(result.after10.sum==="1"&&result.after10.carry==="0"&&result.after10.progress.startsWith("4 of 4")&&result.visited.length===4&&result.visited.every(x=>x.seen),"Half adder 10 or coverage is incorrect",result);
  const quiz=await evaluate("(()=>{const root=document.querySelector('[data-half-quiz]');root.querySelector('[data-half-answer=\"01\"]').click();const wrong=root.querySelector('[data-half-quiz-status]').textContent;root.querySelector('[data-half-answer=\"10\"]').click();return {wrong,correct:root.querySelector('[data-half-quiz-status]').textContent,selected:root.querySelector('[data-half-answer=\"10\"]').getAttribute('aria-pressed')};})()");
  verify(quiz.wrong.includes("Try again")&&quiz.correct.startsWith("Correct.")&&quiz.selected==="true","Half-adder self-assessment did not distinguish a wrong answer from a correct one",quiz);
  const exported=await evaluate("(async()=>{const old=URL.createObjectURL;let blob=null;let name='';const handler=e=>{const a=e.target.closest('a[download]');if(a){name=a.download;e.preventDefault();}};document.addEventListener('click',handler,true);URL.createObjectURL=item=>{blob=item;return 'blob:half-adder-test';};document.querySelector('[data-half-export]').click();document.removeEventListener('click',handler,true);URL.createObjectURL=old;return {name,record:blob?JSON.parse(await blob.text()):null};})()");
  const rows=exported.record?.observations||[];
  verify(exported.name==="anevum-cfp101-half-adder-001.json"&&exported.record?.experimentId==="CFP-101-HALF-001"&&exported.record?.coverage.complete===true&&exported.record?.independentlyVerified===false&&exported.record?.academicCredit===false,"Half adder export invented evidence or lost observations",{name:exported.name,record:exported.record});
  verify(JSON.stringify(rows.map(x=>[x.a,x.b,x.sum,x.carry]))===JSON.stringify([[0,0,0,0],[0,1,1,0],[1,0,1,0],[1,1,0,1]]),"Exported half-adder mathematical observations are wrong",rows);
  const reset=await evaluate("(()=>{const root=document.querySelector('[data-half-adder]');root.querySelector('[data-half-reset]').click();return {coverage:root.querySelector('[data-half-progress]').textContent,sum:root.querySelector('[data-half-sum]').textContent,carry:root.querySelector('[data-half-carry]').textContent,seen:[...root.querySelectorAll('.was-visited')].length};})()");
  verify(reset.coverage.startsWith("1 of 4")&&reset.sum==="0"&&reset.carry==="0"&&reset.seen===1,"Half adder reset retained stale experiment coverage",reset);
  console.log("ANEVUM_HALF_ADDER_BROWSER_QA_PASS",JSON.stringify({fourStates:true,quiz:true,export:true,reset:true,independentReview:false}));
}



async function neuronDynamicsBrowserQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await navigate("/institute-preview/laboratory/neuron-dynamics");
  await waitFor(()=>evaluate("document.querySelector('[data-neuron-lab]')?.dataset.neuronReady==='true'"),"same-origin neuron module");
  const initial=await evaluate("(()=>({hidden:document.querySelector('[data-neuron-results]').hidden,disabled:document.querySelector('[data-neuron-export]').disabled,tau:document.querySelector('[data-neuron-tau]').value,drive:document.querySelector('[data-neuron-drive]').value}))()");
  verify(initial.hidden&&initial.disabled&&initial.tau==="20"&&initial.drive==="20","Neuron lab must start uncomputed with meaningful defaults",initial);
  const active=await evaluate("(()=>{document.querySelector('[data-neuron-run]').click();return {visible:!document.querySelector('[data-neuron-results]').hidden,count:Number(document.querySelector('[data-neuron-count]').textContent),first:document.querySelector('[data-neuron-first]').textContent,svg:!!document.querySelector('svg[data-neuron-chart] polyline'),polyPoints:document.querySelector('svg[data-neuron-chart] polyline')?.getAttribute('points').split(' ').length,exportEnabled:!document.querySelector('[data-neuron-export]').disabled,summary:document.querySelector('[data-neuron-summary]').textContent,status:document.querySelector('[data-neuron-status]').textContent};})()");
  verify(active.visible&&active.count>0&&active.svg&&active.polyPoints===401&&active.exportEnabled&&active.summary.includes("No biological action potentials were recorded")&&active.status.includes("locally"),"Neuron lab failed to produce truthfully labeled simulated trace",active);
  await screenshot("neuron-results-390-full",true);
  await send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await screenshot("neuron-results-1440-full",true);
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const saved=await evaluate("(async()=>{let name='',data=null;const orig=URL.createObjectURL;const capture=e=>{if(e.target.matches('a[download]')){name=e.target.download;e.preventDefault();}};document.addEventListener('click',capture,true);URL.createObjectURL=blob=>{data=blob;return 'blob:neuron-qa';};try{document.querySelector('[data-neuron-export]').click();return {name,record:data?JSON.parse(await data.text()):null,status:document.querySelector('[data-neuron-status]').textContent};}finally{URL.createObjectURL=orig;document.removeEventListener('click',capture,true);}})()");
  verify(saved.name==="anevum-neuron-lif-simulation.json"&&saved.record?.format==="anevum-neuron-lif-simulation/v1"&&saved.record.trace.length===401&&saved.record.metrics.spikeCount===active.count&&saved.record.independentlyReviewed===false&&saved.record.clinicalUse===false&&saved.status.includes("not a validated biological"),"Neuron export must preserve declared scientific limits",saved);
  const stale=await evaluate("(()=>{const drive=document.querySelector('[data-neuron-drive]');drive.value='0';drive.dispatchEvent(new Event('change',{bubbles:true}));return {hidden:document.querySelector('[data-neuron-results]').hidden,disabled:document.querySelector('[data-neuron-export]').disabled,status:document.querySelector('[data-neuron-status]').textContent};})()");
  verify(stale.hidden&&stale.disabled&&stale.status.includes("Settings changed"),"Changing neuron controls must invalidate prior traces",stale);
  const quiet=await evaluate("(()=>{document.querySelector('[data-neuron-run]').click();return {count:document.querySelector('[data-neuron-count]').textContent,first:document.querySelector('[data-neuron-first]').textContent,isi:document.querySelector('[data-neuron-isi]').textContent,summary:document.querySelector('[data-neuron-summary]').textContent};})()");
  verify(quiet.count==="0"&&quiet.first==="None"&&quiet.isi==="N/A"&&quiet.summary.includes("did not cross"),"Zero-input neuron must produce a correct quiet result",quiet);
  console.log("ANEVUM_NEURON_LIF_BROWSER_QA_PASS",JSON.stringify({spiking:active.count,trace:active.polyPoints,quiet:quiet.count,export:saved.name}));
}

async function clusterSchedulerBrowserQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await navigate("/institute-preview/laboratory/cluster-scheduling");
  await waitFor(()=>evaluate("document.querySelector('[data-cluster-lab]')?.dataset.clusterReady==='true'"),"local cluster simulator import");
  const initial=await evaluate("(()=>({hidden:document.querySelector('[data-cluster-output]').hidden,exportDisabled:document.querySelector('[data-cluster-export]').disabled,policy:document.querySelector('[data-cluster-policy]').value,capacity:document.querySelector('[data-cluster-capacity]').value}))()");
  verify(initial.hidden&&initial.exportDisabled&&initial.policy==="fifo"&&initial.capacity==="4","Cluster must start with no fabricated output",initial);
  const result=await evaluate("(()=>{document.querySelector('[data-cluster-run]').click();return {shown:!document.querySelector('[data-cluster-output]').hidden,makespan:document.querySelector('[data-cluster-makespan]').textContent,wait:document.querySelector('[data-cluster-wait]').textContent,util:document.querySelector('[data-cluster-util]').textContent,rows:document.querySelectorAll('[data-cluster-job-results] tr').length,ticks:document.querySelectorAll('.cluster-tick').length,exportEnabled:!document.querySelector('[data-cluster-export]').disabled,status:document.querySelector('[data-cluster-status]').textContent};})()");
  verify(result.shown&&Number(result.makespan)>0&&Number(result.wait)>0&&result.util.endsWith("%")&&result.rows===5&&result.ticks===Number(result.makespan)&&result.exportEnabled&&result.status.includes("no actual GPUs"),"Cluster model did not produce a valid, explicitly simulated result",result);
  const compared=await evaluate("(()=>{document.querySelector('[data-cluster-compare]').click();return {shown:!document.querySelector('[data-cluster-comparison]').hidden,rows:document.querySelectorAll('[data-cluster-compare-results] tr').length,policies:[...document.querySelectorAll('[data-cluster-compare-results] tr td:first-child')].map(td=>td.textContent)};})()");
  verify(compared.shown&&compared.rows===2&&compared.policies.some(x=>x.includes("FIFO"))&&compared.policies.some(x=>x.includes("Shortest")),"Policy comparison did not render honest alternatives",compared);
  await screenshot("cluster-results-390-full",true);
  await send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await screenshot("cluster-results-1440-full",true);
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const download=await evaluate("(async()=>{let payload=null;let filename='';const old=URL.createObjectURL;const stop=e=>{if(e.target.matches('a[download]')){e.preventDefault();filename=e.target.download;}};document.addEventListener('click',stop,true);URL.createObjectURL=blob=>{payload=blob;return 'blob:cluster-sim-test';};try{document.querySelector('[data-cluster-export]').click();return {name:filename,content:payload?await payload.text():null,status:document.querySelector('[data-cluster-status]').textContent};}finally{URL.createObjectURL=old;document.removeEventListener('click',stop,true);}})()");
  const record=download.content?JSON.parse(download.content):null;
  verify(download.name==="anevum-cluster-scheduler-simulation.json"&&record?.format==="anevum-cluster-scheduler-simulation/v1"&&record.policy==="fifo"&&record.capacity===4&&record.jobs.length===5&&record.independentReview===false&&download.status.includes("unreviewed"),"Simulation export fabricated or malformed research evidence",{downloadName:download.name,record});
  const stale=await evaluate("(()=>{const capacity=document.querySelector('[data-cluster-capacity]');capacity.value='8';capacity.dispatchEvent(new Event('change',{bubbles:true}));return {hidden:document.querySelector('[data-cluster-output]').hidden,compareHidden:document.querySelector('[data-cluster-comparison]').hidden,exportDisabled:document.querySelector('[data-cluster-export]').disabled,notice:document.querySelector('[data-cluster-status]').textContent};})()");
  verify(stale.hidden&&stale.compareHidden&&stale.exportDisabled&&stale.notice.includes("Configuration changed"),"Configuration must invalidate prior result",stale);
  const newCapacity=await evaluate("(()=>{document.querySelector('[data-cluster-policy]').value='shortest';document.querySelector('[data-cluster-run]').click();return {status:document.querySelector('[data-cluster-policy-label]').textContent,makespan:Number(document.querySelector('[data-cluster-makespan]').textContent),usage:document.querySelector('[data-cluster-util]').textContent};})()");
  verify(newCapacity.status==="Shortest eligible"&&newCapacity.makespan>0&&newCapacity.usage.endsWith("%"),"Resimulation after config update failed",newCapacity);
  console.log("ANEVUM_CLUSTER_SCHEDULER_BROWSER_QA_PASS",JSON.stringify({initial,model:result,comparison:compared,export:download.name,rerun:newCapacity}));
}




async function compactEvidenceImporterQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"Research Desk with compact import hub");
  const initial=await evaluate("(()=>{const hub=document.querySelector('[data-import-hub]');return {closed:!hub.open,modelCount:hub.querySelectorAll('[data-import-source]').length,sourceClosed:[...hub.querySelectorAll('[data-import-source]')].every(x=>!x.open),save:!!document.querySelector('[data-evidence-save]'),pickers:hub.querySelectorAll('input[type=file]').length,summaryVisible:hub.querySelector('summary').getBoundingClientRect().height};})()");
  verify(initial.closed&&initial.modelCount===3&&initial.sourceClosed&&initial.save&&initial.pickers===3&&initial.summaryVisible>=44,"Research Desk must start with one compact, accessible importer hub",initial);
  const keyboard=await evaluate("(()=>{const summary=document.querySelector('[data-import-hub]>summary');summary.focus();return document.activeElement===summary;})()");
  verify(keyboard,"The native experiment import disclosure cannot receive keyboard focus");
  const activated=await evaluate("(()=>{const summary=document.querySelector('[data-import-hub]>summary');summary.click();return document.querySelector('[data-import-hub]').open;})()");
  verify(activated,"Focused native summary did not activate the experiment import hub");
  const expanded=await evaluate("(()=>{const source=document.querySelector('#cluster-import');source.querySelector('summary').click();return {open:source.open,other:[...document.querySelectorAll('[data-import-source]')].filter(x=>x!==source&&x.open).length,activeInputs:!!source.querySelector('[data-cluster-import]')};})()");
  verify(expanded.open&&expanded.other===0&&expanded.activeInputs,"GPU importer cannot be opened under compact hub",expanded);
  const exclusive=await evaluate("(()=>{const neuron=document.querySelector('#neuron-import');neuron.querySelector('summary').click();return {neuron:neuron.open,cluster:document.querySelector('#cluster-import').open,all:[...document.querySelectorAll('[data-import-source]')].filter(x=>x.open).length};})()");
  await waitFor(()=>evaluate("document.querySelector('#neuron-import').open&&!document.querySelector('#cluster-import').open"),"exclusive nested native disclosures");
  verify(exclusive.neuron,"The neuron importer failed to open",exclusive);
  await send("Page.navigate",{url:base+"/institute-preview/dossier#cluster-import"});
  await waitFor(()=>evaluate("location.pathname==='/institute-preview/dossier'&&location.hash==='#cluster-import'&&document.readyState==='complete'"),"initial dossier fragment navigation");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'&&document.querySelector('#cluster-import')?.open"),"deep-linked GPU research importer");
  const linked=await evaluate("(()=>({hub:document.querySelector('[data-import-hub]').open,gpu:document.querySelector('#cluster-import').open,neuron:document.querySelector('#neuron-import').open,hash:location.hash}))()");
  verify(linked.hub&&linked.gpu&&!linked.neuron&&linked.hash==="#cluster-import","GPU deep link must expose the correct file control",linked);
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"Research Desk for dynamic hash navigation");
  await evaluate("location.hash='#neuron-import'");
  await waitFor(()=>evaluate("document.querySelector('[data-import-hub]').open&&document.querySelector('#neuron-import').open"),"neuron fragment expansion");
  const focus=await evaluate("(()=>{const summary=document.querySelector('#neuron-import>summary');summary.focus();return {focused:document.activeElement===summary,visible:summary.getBoundingClientRect().height>=40};})()");
  verify(focus.focused&&focus.visible,"Deep-linked neuron importer is not keyboard accessible",focus);
  console.log("ANEVUM_COMPACT_IMPORT_HUB_QA_PASS",JSON.stringify({modelCount:3,focusable:true,nativeSummaryActivated:true,exclusive:true,deepLinks:true,saveRetained:true}));
}

async function neuronResearchBrowserQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate("/institute-preview/laboratory/neuron-dynamics");
  await waitFor(()=>evaluate("document.querySelector('[data-neuron-lab]')?.dataset.neuronReady==='true'"),"neuron model ready to export");
  const sample=await evaluate("(async()=>{let record=null,name='';const orig=URL.createObjectURL;const intercept=e=>{const a=e.target.closest('a[download]');if(a){e.preventDefault();name=a.download;}};document.addEventListener('click',intercept,true);URL.createObjectURL=blob=>{record=blob;return 'blob:neuron-record-qa';};try{document.querySelector('[data-neuron-run]').click();document.querySelector('[data-neuron-export]').click();return {name,data:record?JSON.parse(await record.text()):null};}finally{URL.createObjectURL=orig;document.removeEventListener('click',intercept,true);}})()");
  verify(sample.name==="anevum-neuron-lif-simulation.json"&&sample.data?.trace.length===401&&sample.data.metrics.spikeCount>0,"Neuron simulation failed to export its actual deterministic trace",{name:sample.name});
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"neuroscience evidence workbench");
  const prior=await evaluate("(()=>{const raw=localStorage.getItem('anevum.institute.evidence-draft.v1');return {scope:document.querySelector('[data-evidence-course]').textContent,title:document.querySelector('[data-evidence-field=title]').value,raw};})()");
  verify(prior.scope==="COMPUTE-LAB-001"&&prior.raw,"Previous GPU research draft must remain intact until explicitly replaced",{scope:prior.scope});
  async function importSample(record){
    const encoded=JSON.stringify(JSON.stringify(record));
    return evaluate("(async()=>{const section=document.querySelector('#neuron-import');section.open=true;const input=document.querySelector('[data-neuron-import]');const file=new File(["+encoded+"],'neuron-trace.json',{type:'application/json'});const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<140&&document.querySelector('[data-neuron-feedback]').textContent.startsWith('Checking');i++)await new Promise(r=>setTimeout(r,15));return {text:document.querySelector('[data-neuron-feedback]').textContent,staged:!document.querySelector('[data-neuron-apply]').hidden,scope:document.querySelector('[data-evidence-course]').textContent,title:document.querySelector('[data-evidence-field=title]').value,saved:localStorage.getItem('anevum.institute.evidence-draft.v1')};})()");
  }
  const tampered=structuredClone(sample.data);
  tampered.metrics.spikeCount+=2;
  const denied=await importSample(tampered);
  verify(denied.text.startsWith("Neuron simulation import rejected")&&!denied.staged&&denied.scope===prior.scope&&denied.title===prior.title&&denied.saved===prior.raw,"Modified neuron trace must not replace previously saved research",{denied:denied.text});
  const staged=await importSample(sample.data);
  verify(staged.text.startsWith("The 401 voltage samples")&&staged.staged&&staged.scope===prior.scope&&staged.title===prior.title&&staged.saved===prior.raw,"Valid mathematical result must only stage for explicit review",{feedback:staged.text});
  const applied=await evaluate("(()=>{document.querySelector('[data-neuron-apply]').click();return {scope:document.querySelector('[data-evidence-course]').textContent,title:document.querySelector('[data-evidence-field=title]').value,observations:document.querySelector('[data-evidence-field=observations]').value,limits:document.querySelector('[data-evidence-field=limitations]').value,stored:localStorage.getItem('anevum.institute.evidence-draft.v1')};})()");
  verify(applied.scope==="NEURO-LAB-001"&&applied.title.includes("Simulated point-neuron")&&applied.observations.includes("SIMULATED ONLY")&&applied.limits.includes("no.*")===false&&applied.limits.includes("not a measured electric current")&&applied.stored===prior.raw,"Neuron file must not overwrite saved GPU draft automatically",{scope:applied.scope,limit:applied.limits});
  await evaluate("document.querySelector('[data-evidence-save]').click()");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-status]').textContent.startsWith('Personal draft saved')"),"explicit neuron evidence draft save");
  const saved=await evaluate("(()=>{const data=JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1'));return {scope:data.record.courseId,kind:data.record.kind,title:data.record.title,digest:data.digest};})()");
  verify(saved.scope==="NEURO-LAB-001"&&saved.kind==="personal-unreviewed-draft"&&/^sha256:[0-9a-f]{64}$/.test(saved.digest),"Saved neuron draft must be scoped and integrity checked",saved);
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"neuron record reload");
  const restored=await evaluate("(()=>({scope:document.querySelector('[data-evidence-course]').textContent,title:document.querySelector('[data-evidence-field=title]').value,digest:document.querySelector('[data-evidence-digest]').textContent}))()");
  verify(restored.scope==="NEURO-LAB-001"&&restored.title===saved.title&&restored.digest===saved.digest,"Neuroscience record failed to survive integrity-checked local reload",restored);
  const exported=await evaluate("(async()=>{let blob=null,name='';const old=URL.createObjectURL;const intercept=e=>{const a=e.target.closest('a[download]');if(a){name=a.download;e.preventDefault();}};document.addEventListener('click',intercept,true);URL.createObjectURL=x=>{blob=x;return 'blob:neuro-evidence-qa';};try{document.querySelector('[data-evidence-export]').click();for(let i=0;i<40&&!blob;i++)await new Promise(r=>setTimeout(r,15));return {name,record:blob?JSON.parse(await blob.text()):null};}finally{URL.createObjectURL=old;document.removeEventListener('click',intercept,true);}})()");
  verify(exported.name==="anevum-personal-evidence-NEURO-LAB-001.json"&&exported.record?.record?.courseId==="NEURO-LAB-001"&&exported.record?.digest===saved.digest,"Portable neuroscience research envelope missing honest scope or digest",{name:exported.name});
  console.log("ANEVUM_NEURON_TO_RESEARCH_QA_PASS",JSON.stringify({trace:sample.data.trace.length,tamperDenied:true,preservedPrevious:true,scope:saved.scope,restored:true,exported:exported.name}));
}

async function clusterResearchBrowserQA(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate("/institute-preview/laboratory/cluster-scheduling");
  await waitFor(()=>evaluate("document.querySelector('[data-cluster-lab]')?.dataset.clusterReady==='true'"),"GPU model module ready");
  const notebook=await evaluate("(async()=>{let contents=null,filename='';const prev=URL.createObjectURL;const intercept=e=>{if(e.target.matches('a[download]')){filename=e.target.download;e.preventDefault();}};document.addEventListener('click',intercept,true);URL.createObjectURL=blob=>{contents=blob;return 'blob:compute-research-qa';};try{document.querySelector('[data-cluster-run]').click();document.querySelector('[data-cluster-export]').click();return {filename,record:contents?JSON.parse(await contents.text()):null};}finally{URL.createObjectURL=prev;document.removeEventListener('click',intercept,true);}})()");
  verify(notebook.filename==="anevum-cluster-scheduler-simulation.json"&&notebook.record?.jobs?.length===5&&notebook.record?.independentReview===false,"Browser simulator failed to export research notebook",notebook);
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.getAttribute('data-evidence-ready')==='true'"),"Research Desk ready for GPU import");
  const scopeContrast=await evaluate("(()=>{const scope=document.querySelector('.dossier-scope'),label=document.querySelector('[data-evidence-course]');const extract=x=>(x.match(/\\d+/g)||[]).slice(0,3).map(Number);const luminance=x=>{const rgb=extract(x).map(v=>{const n=v/255;return n<=0.04045?n/12.92:Math.pow((n+0.055)/1.055,2.4)});return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};const bg=luminance(getComputedStyle(scope).backgroundColor);const fg=luminance(getComputedStyle(label).color);return (Math.max(bg,fg)+.05)/(Math.min(bg,fg)+.05);})()");
  verify(scopeContrast>=4.5,"Research scope contrast must remain WCAG AA for normal-size text",{scopeContrast});

  async function stage(data){
    const raw=JSON.stringify(JSON.stringify(data));
    return evaluate("(async()=>{const input=document.querySelector('[data-cluster-import]');const file=new File(["+raw+"],'gpu-schedule.json',{type:'application/json'});const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<80&&document.querySelector('[data-cluster-feedback]').textContent.startsWith('Checking');i++)await new Promise(r=>setTimeout(r,15));return {feedback:document.querySelector('[data-cluster-feedback]').textContent,staged:!document.querySelector('[data-cluster-apply]').hidden,title:document.querySelector('[data-evidence-field=title]').value,scope:document.querySelector('[data-evidence-course]').textContent,saved:localStorage.getItem('anevum.institute.evidence-draft.v1')};})()");
  }
  const changed=structuredClone(notebook.record);
  changed.metrics.gpuUtilizationPercent=100;
  const rejected=await stage(changed);
  verify(rejected.feedback.includes("GPU scheduling import rejected")&&!rejected.staged&&rejected.title===""&&rejected.scope==="CFP-101"&&rejected.saved===null,"Tampered scheduling metrics changed local Research Desk",rejected);
  const verified=await stage(notebook.record);
  verify(verified.feedback.startsWith("Checked all five workloads")&&verified.staged&&verified.title===""&&verified.saved===null,"Verified GPU simulation must stage without replacing draft",verified);
  const applied=await evaluate("(()=>{document.querySelector('[data-cluster-apply]').click();return {title:document.querySelector('[data-evidence-field=title]').value,scope:document.querySelector('[data-evidence-course]').textContent,observations:document.querySelector('[data-evidence-field=observations]').value,limitations:document.querySelector('[data-evidence-field=limitations]').value,stored:localStorage.getItem('anevum.institute.evidence-draft.v1')};})()");
  verify(applied.title.includes("Simulated GPU scheduling")&&applied.scope==="COMPUTE-LAB-001"&&applied.observations.includes("SIMULATED ONLY")&&applied.limitations.includes("not GPU benchmarks")&&applied.stored===null,"GPU export did not produce truthful, unsaved scientific draft",applied);
  await evaluate("document.querySelector('[data-evidence-save]').click()");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-status]').textContent.startsWith('Personal draft saved')"),"GPU draft explicit browser-local save");
  const saved=await evaluate("(()=>{const r=JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1'));return {kind:r.record.kind,scope:r.record.courseId,hash:r.digest,title:r.record.title};})()");
  verify(saved.kind==="personal-unreviewed-draft"&&saved.scope==="COMPUTE-LAB-001"&&/^sha256:[0-9a-f]{64}$/.test(saved.hash),"Saved GPU draft had incorrect scope, review status or integrity format",saved);
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.getAttribute('data-evidence-ready')==='true'"),"GPU draft reload");
  const restored=await evaluate("(()=>({scope:document.querySelector('[data-evidence-course]').textContent,title:document.querySelector('[data-evidence-field=title]').value,hash:document.querySelector('[data-evidence-digest]').textContent}))()");
  verify(restored.scope==="COMPUTE-LAB-001"&&restored.title===saved.title&&restored.hash===saved.hash,"Saved GPU evidence draft did not restore consistently",restored);
  const exported=await evaluate("(async()=>{let blob=null,name='';const before=URL.createObjectURL;const intercept=e=>{if(e.target.matches('a[download]')){e.preventDefault();name=e.target.download;}};document.addEventListener('click',intercept,true);URL.createObjectURL=data=>{blob=data;return 'blob:gpu-evidence-qa';};try{document.querySelector('[data-evidence-export]').click();for(let i=0;i<40&&!blob;i++)await new Promise(r=>setTimeout(r,15));return {name,record:blob?JSON.parse(await blob.text()):null};}finally{URL.createObjectURL=before;document.removeEventListener('click',intercept,true);}})()");
  verify(exported.name==="anevum-personal-evidence-COMPUTE-LAB-001.json"&&exported.record?.digest===saved.hash&&exported.record?.record?.courseId==="COMPUTE-LAB-001","Portable research record did not retain laboratory scope",exported);
  console.log("ANEVUM_CLUSTER_TO_RESEARCH_QA_PASS",JSON.stringify({tamperRejected:true,stagedWithoutSaving:true,scope:saved.scope,restored:true,exported:exported.name}));
}

async function interactions(){
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  await navigate("/institute-preview");
  const institution=await evaluate("(()=>({hero:!!document.querySelector('.institution-home'),canvas:document.querySelectorAll('.institution-home canvas').length,video:document.querySelectorAll('.institution-home video').length,images:document.querySelectorAll('.institution-home img').length,primary:!!document.querySelector('.academic-primary[href=\"/institute-preview/academy\"]'),fieldCount:document.querySelectorAll('.academic-field-list li').length,background:getComputedStyle(document.querySelector('.academic-intro')).backgroundImage}))()");
  verify(institution.hero&&institution.canvas===0&&institution.video===0&&institution.images===0&&institution.primary&&institution.fieldCount===6&&institution.background==="none","University-style homepage must not run decorative visual rendering",institution);
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  const reduced=await evaluate("(()=>({motion:getComputedStyle(document.querySelector('.academic-hero-copy')).animationDuration,canvas:document.querySelectorAll('.institution-home canvas').length,primary:document.querySelector('.academic-primary').textContent.trim()}))()");
  verify(reduced.canvas===0&&reduced.primary.includes("academic catalogue"),"Reduced-motion academic homepage must retain real navigation",reduced);
  console.log("ANEVUM_INSTITUTION_EDITORIAL_QA_PASS",JSON.stringify({noVisualMedia:true,realAcademicRoutes:true,reducedMotionAccessible:true}));
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

async function andResearchDirectHandoffQA(){
  const draftKey="anevum.institute.evidence-draft.v1";
  const handoffKey="anevum.institute.handoff.and.v1";
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await navigate("/institute-preview/dossier");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"Research Desk ready before handoff");
  const baseline=await evaluate("(async()=>{const m=await import('/institute-preview/evidence-schema.js');const record={schemaVersion:1,kind:'personal-unreviewed-draft',courseId:'CFP-101',title:'Existing personal research draft',question:'Does the unreviewed example provide a credible model result?',method:'This is a synthetic test record created by browser QA, with no physical observation or actual institute publication.',observations:'A previous unreviewed example was saved only in this browser.',limitations:'The example is synthetic and unreviewed and must not be treated as scientific evidence.',references:[]};const envelope=await m.createEvidenceEnvelope(record);localStorage.setItem('anevum.institute.evidence-draft.v1',JSON.stringify(envelope));sessionStorage.removeItem('anevum.institute.handoff.and.v1');return {title:envelope.record.title,digest:envelope.digest};})()");
  verify(baseline.title==="Existing personal research draft"&&/^sha256:[a-f0-9]{64}$/.test(baseline.digest),"Baseline local evidence draft could not be prepared",baseline);
  await navigate("/institute-preview/laboratory/and-gate");
  const initial=await evaluate("(()=>({disabled:document.querySelector('[data-to-dossier]')?.disabled,coverage:document.querySelector('[data-lab-progress]')?.textContent}))()");
  verify(initial.disabled&&initial.coverage.startsWith("1 of 4"),"Direct handoff must start disabled until full coverage",initial);
  const completed=await evaluate("(()=>{const root=document.querySelector('[data-and-lab]');const tap=key=>root.querySelector('[data-input="'+key+'"]').click();tap('b');tap('a');tap('b');return {disabled:root.querySelector('[data-to-dossier]').disabled,coverage:root.querySelector('[data-lab-progress]').textContent};})()");
  verify(completed.disabled===false&&completed.coverage.startsWith("4 of 4"),"Direct handoff did not unlock after all four ideal states",completed);
  await evaluate("document.querySelector('[data-to-dossier]').click()");
  await waitFor(()=>evaluate("location.pathname==='/institute-preview/dossier'&&location.hash==='#logic-import'&&document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"same-tab handoff into Research Desk");
  const staged=await evaluate("(()=>({status:document.querySelector('[data-evidence-status]').textContent,feedback:document.querySelector('[data-lab-feedback]').textContent,apply:!document.querySelector('[data-lab-apply]').hidden,hub:document.querySelector('[data-import-hub]').open,details:document.querySelector('#logic-import').open,title:document.querySelector('[data-evidence-field=title]').value,stored:JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1')).record.title,pending:sessionStorage.getItem('anevum.institute.handoff.and.v1'),receipt:document.querySelector('[data-evidence-digest]').textContent}))()");
  verify(staged.apply&&staged.hub&&staged.details&&staged.feedback.includes("Validated all four")&&staged.status.includes("existing saved draft remains unchanged")&&staged.title===baseline.title&&staged.stored===baseline.title&&staged.pending===null&&staged.receipt===baseline.digest,"Handoff must remain staged only and preserve saved evidence",staged);
  await send("Page.navigate",{url:base+"/institute-preview/dossier#logic-import"});
  await waitFor(()=>evaluate("location.pathname==='/institute-preview/dossier'&&document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"dossier reload for one-time consumption");
  const oneShot=await evaluate("(()=>({apply:document.querySelector('[data-lab-apply]').hidden,stored:JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1')).record.title,pending:sessionStorage.getItem('anevum.institute.handoff.and.v1')}))()");
  verify(oneShot.apply&&oneShot.stored===baseline.title&&oneShot.pending===null,"One-time session handoff must not restage on reload",oneShot);
  // Recreate a valid transfer from the laboratory, approve explicitly and export.
  await navigate("/institute-preview/laboratory/and-gate");
  await evaluate("(()=>{const root=document.querySelector('[data-and-lab]');root.querySelector('[data-input="b"]').click();root.querySelector('[data-input="a"]').click();root.querySelector('[data-input="b"]').click();root.querySelector('[data-to-dossier]').click();})()");
  await waitFor(()=>evaluate("location.pathname==='/institute-preview/dossier'&&document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"second explicit handoff");
  const applied=await evaluate("(()=>{document.querySelector('[data-lab-apply]').click();return {title:document.querySelector('[data-evidence-field=title]').value,observations:document.querySelector('[data-evidence-field=observations]').value,receipt:document.querySelector('[data-evidence-receipt-state]').textContent,stored:JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1')).record.title};})()");
  verify(applied.title==="Boolean AND study (4 of 4 states)"&&applied.observations.includes("11 -> 1")&&applied.receipt==="Unsaved changes"&&applied.stored===baseline.title,"Explicit Apply must populate editor without saving or corrupting the existing draft",applied);
  await evaluate("document.querySelector('[data-evidence-save]').click()");
  await waitFor(()=>evaluate("document.querySelector('[data-evidence-status]').textContent.includes('Personal draft saved locally')"),"opt-in local save after handoff");
  const saved=await evaluate("(()=>({title:JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1')).record.title,receipt:document.querySelector('[data-evidence-digest]').textContent}))()");
  verify(saved.title===applied.title&&/^sha256:[a-f0-9]{64}$/.test(saved.receipt),"Explicit save did not create a content-addressed personal record",saved);
  const exported=await evaluate("(async()=>{let blob=null,name='';const old=URL.createObjectURL;const handler=e=>{const a=e.target.closest('a[download]');if(a){e.preventDefault();name=a.download;}};document.addEventListener('click',handler,true);URL.createObjectURL=b=>{blob=b;return 'blob:handoff-qa';};try{document.querySelector('[data-evidence-export]').click();for(let i=0;i<40&&!blob;i++)await new Promise(r=>setTimeout(r,15));return {name,body:blob?JSON.parse(await blob.text()):null};}finally{URL.createObjectURL=old;document.removeEventListener('click',handler,true);}})()");
  verify(exported.name==="anevum-personal-evidence-CFP-101.json"&&exported.body?.digest===saved.receipt&&exported.body?.record?.kind==="personal-unreviewed-draft"&&exported.body?.record?.title===applied.title,"Opt-in draft export must retain unreviewed provenance and integrity receipt",exported);
  // The same-tab mailbox is attacker-controllable. Forged logical outputs must fail closed.
  await navigate("/institute-preview/academy");
  const forged=await evaluate("(()=>{const record={schemaVersion:1,experimentId:'CFP-101-AND-001',model:'ideal-two-input-boolean-and',modelDefinition:'Q = A AND B',provenance:'ANEVUM Open Institute design preview; generated in this browser session',limitations:'Ideal logical states only; no analog voltage, propagation delay, transistor physics or uncertainty is modeled.',observations:[{inputA:0,inputB:0,outputQ:1},{inputA:0,inputB:1,outputQ:0},{inputA:1,inputB:1,outputQ:1},{inputA:1,inputB:0,outputQ:0}],coverage:{observed:4,possible:4,complete:true}};sessionStorage.setItem('anevum.institute.handoff.and.v1',JSON.stringify(record));return JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1')).record.title;})()");
  await send("Page.navigate",{url:base+"/institute-preview/dossier#logic-import"});
  await waitFor(()=>evaluate("location.pathname==='/institute-preview/dossier'&&document.querySelector('[data-evidence-workbench]')?.dataset.evidenceReady==='true'"),"forged handoff safely rejected");
  const rejected=await evaluate("(()=>({feedback:document.querySelector('[data-lab-feedback]').textContent,hidden:document.querySelector('[data-lab-apply]').hidden,title:document.querySelector('[data-evidence-field=title]').value,saved:JSON.parse(localStorage.getItem('anevum.institute.evidence-draft.v1')).record.title,pending:sessionStorage.getItem('anevum.institute.handoff.and.v1')}))()");
  verify(rejected.feedback.includes("inconsistent with ideal Boolean AND")&&rejected.hidden&&rejected.title===forged&&rejected.saved===forged&&rejected.pending===null,"Forged sessionStorage input must not stage, replace or save research data",rejected);
  await evaluate("localStorage.removeItem('anevum.institute.evidence-draft.v1');sessionStorage.removeItem('anevum.institute.handoff.and.v1')");
  console.log("ANEVUM_DIRECT_AND_RESEARCH_HANDOFF_QA_PASS",JSON.stringify({fourStatesRequired:true,stagedWithoutSaving:true,oneTime:true,explicitApply:true,explicitSave:true,portableExport:true,forgeryRejected:true}));
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
  await compactShellQA();
  await compactCourseUsabilityQA();
  await halfAdderBrowserQA();
  await clusterSchedulerBrowserQA();
  await neuronDynamicsBrowserQA();
  await interactions();
  await clusterResearchBrowserQA();
  await neuronResearchBrowserQA();
  await compactEvidenceImporterQA();
  await andResearchDirectHandoffQA();
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
