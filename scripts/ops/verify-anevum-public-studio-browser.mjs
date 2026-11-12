// Browser acceptance against the exact standalone Worker module on loopback.
// No public route, auth bypass, Cloudflare token, or automatic deployment.
import {spawn, spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,writeFileSync,existsSync,mkdirSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const profile=mkdtempSync(path.join(tmpdir(),"anevum-public-cdp-"));
const output=process.env.RUNNER_TEMP || tmpdir();
mkdirSync(output,{recursive:true});
const base="http://127.0.0.1:4178";
const server=spawn(process.execPath,["scripts/ops/anevum-public-studio-test-server.mjs"],{stdio:"ignore"});
let chrome,ws,next=0,port;
const pending=new Map();
function send(method,params={}){
 return new Promise((resolve,reject)=>{
  const id=++next;
  const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout: "+method));},17000);
  pending.set(id,{resolve,reject,timer});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evalJS(expression){
 const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error(r.exceptionDetails.text||"runtime exception");
 return r.result?.value;
}
async function waitFor(fn,label,{failFast=false}={}){
 let lastError;
 for(let i=0;i<110;i++){
  try{const v=await fn();if(v)return v;}
  catch(error){lastError=error;if(failFast)throw error;}
  await sleep(110);
 }
 throw Error("Timed out waiting for "+label+(lastError?": "+lastError.message:""));
}
async function view(pathname,width,height,name,saveScreenshot=false){
 // Exact apex is the independent Living Laboratory. Legacy routes continue
 // through the established Original Works browser acceptance below.


 if(pathname==="/original-works/research"){
  await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<650});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await send("Page.navigate",{url:base+pathname});
  const state=await waitFor(async()=>{
   const result=await evalJS("(()=>({path:location.pathname,title:document.title,heading:document.querySelector('main h1')?.textContent,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,cards:document.querySelectorAll('.lab-res-card').length,indexLinks:document.querySelectorAll('.lab-res-index a').length,disclosures:document.querySelectorAll('.lab-res-details').length,images:[...document.querySelectorAll('.lab-res-media img')].map(x=>({loaded:x.complete&&x.naturalWidth>0,width:x.naturalWidth})),scripts:document.scripts.length,menu:!!document.querySelector('details.lab-mobile'),main:!!document.querySelector('main#main'),anchors:[...document.querySelectorAll('.lab-res-index a')].every(x=>!!document.querySelector(x.getAttribute('href')))}))()");
   return result?.path===pathname&&result?.heading?result:null;
  },"Research "+name);
  if(!state.main||!state.menu||state.heading!=="Research"||!state.title.startsWith("Research")||state.cards!==4||state.disclosures!==4||state.indexLinks!==4||!state.anchors||state.scripts!==0)throw Error("Research content/accessibility failure: "+JSON.stringify(state));
  if(state.width>width||state.width<width-20||state.scrollWidth>state.width+1||state.bodyScroll>state.width+1)throw Error("Research horizontal overflow: "+JSON.stringify(state));
  // The four source-backed WebPs intentionally use loading=lazy. Scroll each
  // card into view before expecting it to decode, rather than treating a
  // correctly deferred offscreen image as a failed fetch.
  for(let i=0;i<4;i++){
   await evalJS("(()=>{document.querySelectorAll('.lab-res-media img')["+i+"].scrollIntoView({behavior:'instant',block:'center'});return true})()");
   await waitFor(async()=>await evalJS("(()=>{const x=document.querySelectorAll('.lab-res-media img')["+i+"];return x?.complete&&x.naturalWidth>0})()"),"research image "+(i+1));
  }
  const images=await evalJS("(()=>[...document.querySelectorAll('.lab-res-media img')].map(x=>({loaded:x.complete&&x.naturalWidth>0,width:x.naturalWidth})))()");
  if(images.length!==4||images.some(x=>!x.loaded||x.width<400))throw Error("Research images missing or unexpectedly low-resolution: "+JSON.stringify(images));
  await evalJS("(()=>{window.scrollTo({top:0,behavior:'instant'});return true})()");
  const disclosure=await evalJS("(()=>{const d=document.querySelector('.lab-res-details');const summary=d?.querySelector('summary');summary?.focus();const focused=document.activeElement===summary;summary?.click();const opened=d.open;const question=!!d.querySelector('.lab-res-detail-copy strong');const overflow=document.documentElement.scrollWidth>document.documentElement.clientWidth+1;summary?.click();return {focused,opened,question,closed:!d.open,overflow}})()");
  if(!disclosure.focused||!disclosure.opened||!disclosure.question||!disclosure.closed||disclosure.overflow)throw Error("Research native disclosure failure: "+JSON.stringify(disclosure));
  if(width<650){
   const menu=await evalJS("(()=>{const d=document.querySelector('details.lab-mobile');d.querySelector('summary').click();const opened=d.open;const links=[...d.querySelectorAll('nav a')].map(x=>x.getAttribute('href'));d.querySelector('summary').click();return {opened,closed:!d.open,links}})()");
   if(!menu.opened||!menu.closed||!menu.links.includes('/original-works/research'))throw Error("Research mobile menu failure: "+JSON.stringify(menu));
  }
  if(saveScreenshot){
   const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
   const file=path.join(output,"anevum-public-"+name+".png");
   writeFileSync(file,Buffer.from(shot.data,"base64"));
   if(readFileSync(file).length<12000)throw Error("Blank research screenshot");
   const metrics=await send("Page.getLayoutMetrics");
   const fullWidth=Math.ceil(metrics.cssContentSize?.width||metrics.contentSize.width);
   const fullHeight=Math.ceil(metrics.cssContentSize?.height||metrics.contentSize.height);
   if(fullWidth<width-20||fullHeight<=height||fullHeight>12000)throw Error("Invalid research full-page screenshot dimensions");
   const full=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:fullWidth,height:fullHeight,scale:1}});
   const fullPath=path.join(output,"anevum-public-"+name+"-full.png");
   writeFileSync(fullPath,Buffer.from(full.data,"base64"));
   if(readFileSync(fullPath).length<25000)throw Error("Blank research full-page screenshot");
  }
  console.log(JSON.stringify({case:name,path:state.path,heading:state.heading,width:state.width,cards:state.cards,imagesLoaded:images.length}));
  return;
 }

 if(pathname.startsWith("/original-works/experiments")){
  const requestedPath=pathname.split("?")[0];
  await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<650});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await send("Page.navigate",{url:base+pathname});
  const state=await waitFor(async()=>{
   const v=await evalJS("(()=>({path:location.pathname,title:document.title,heading:document.querySelector('h1')?.textContent,count:document.querySelectorAll('.lab-exp-card').length,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,menu:!!document.querySelector('details.lab-mobile'),scripts:document.scripts.length,filterCount:document.querySelectorAll('.lab-exp-filter').length,active:document.querySelector('.lab-exp-filter[aria-current=page]')?.textContent,art:document.querySelector('.lab-exp-card')?.style.getPropertyValue('--art'),main:!!document.querySelector('main#main')}))()");
   return v?.path===requestedPath&&v?.heading?v:null;
  },"Experiments "+name);
  const expectedCount=pathname.includes("?theme=interactive")?1:3;
  if(!state.main||!state.menu||state.count!==expectedCount||state.filterCount!==4||state.scripts!==0||!state.art||!state.title.startsWith("Experiments")||state.heading!=="Experiments")throw Error("Experiments content invalid: "+JSON.stringify(state));
  if(state.width>width||state.width<width-20||state.scrollWidth>state.width+1)throw Error("Experiments horizontal overflow: "+JSON.stringify(state));
  if(expectedCount===1&&state.active!=="Interactive")throw Error("Experiments filter is not active: "+JSON.stringify(state));
  if(width<650){
   const menu=await evalJS("(()=>{const x=document.querySelector('details.lab-mobile');x.querySelector('summary').click();const isOpen=x.open;const links=[...x.querySelectorAll('nav a')].map(a=>a.getAttribute('href'));x.querySelector('summary').click();return {isOpen,closed:!x.open,links}})()");
   if(!menu.isOpen||!menu.closed||!menu.links.includes("/original-works/experiments"))throw Error("Experiments mobile navigation failed: "+JSON.stringify(menu));
  }
  if(saveScreenshot){
   const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
   const file=path.join(output,"anevum-public-"+name+".png");writeFileSync(file,Buffer.from(shot.data,"base64"));
   if(readFileSync(file).length<12000)throw Error("Experiments blank screenshot");
   const metrics=await send("Page.getLayoutMetrics");
   const fullWidth=Math.ceil(metrics.cssContentSize?.width||metrics.contentSize.width);
   const fullHeight=Math.ceil(metrics.cssContentSize?.height||metrics.contentSize.height);
   if(fullWidth<width-20||fullHeight<=height||fullHeight>12000)throw Error("Experiments full-page screenshot dimensions invalid");
   const full=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:fullWidth,height:fullHeight,scale:1}});
   const fullPath=path.join(output,"anevum-public-"+name+"-full.png");
   writeFileSync(fullPath,Buffer.from(full.data,"base64"));
   if(readFileSync(fullPath).length<20000)throw Error("Experiments blank full screenshot");
  }
  console.log(JSON.stringify({case:name,path:state.path,count:state.count,width:state.width,active:state.active}));
  return;
 }
 if(pathname==="/"){
  await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<650});
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await send("Page.navigate",{url:base+pathname});
  const state=await waitFor(async()=>{
   const v=await evalJS(`(()=>{const desktop=document.querySelector('nav.lab-nav'),mobile=document.querySelector('details.lab-mobile'),hero=document.querySelector('#lab-home-title');return {path:location.pathname,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,title:document.title,heading:hero?.textContent,tagline:document.querySelector('.lab-italic')?.textContent,nav:[...(desktop?.querySelectorAll('a')||[])].map(a=>a.getAttribute('href')),main:!!document.querySelector('main#main'),skip:!!document.querySelector('a.lab-skip[href="#main"]'),menu:!!mobile,menuVisible:!!mobile&&getComputedStyle(mobile).display!=='none',scripts:document.scripts.length,artwork:getComputedStyle(document.querySelector('.lab-art')).backgroundImage.includes('lab-hero-v1.webp'),artCount:document.querySelectorAll('.lab-theme-shape img').length,heroInset:Math.round(document.querySelector('.lab-hero-copy').getBoundingClientRect().left),anchors:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(Boolean).every(id=>!!document.getElementById(id))}})()`);
   return v?.path===pathname&&v?.heading?v:null;
  },"Living Laboratory "+name);
  if(!state.main||!state.skip||!state.menu||!state.artwork||state.artCount!==4||!state.anchors||state.scripts!==0)throw Error("Lab accessibility or link contract failed: "+JSON.stringify(state));
  if(!state.title.includes("laboratory for the possible")||state.heading!=="ANEVUM"||!state.tagline?.includes("laboratory for the possible"))throw Error("Wrong laboratory identity: "+JSON.stringify(state));
  if(state.width>width||state.width<width-20||state.scrollWidth>state.width+1||state.bodyScroll>state.width+1)throw Error("Lab horizontal overflow: "+JSON.stringify(state));
  if(state.heroInset<(width<=530?14:width<=1100?24:38))throw Error("Lab desktop/mobile hero gutter missing: "+JSON.stringify(state));
  if(state.nav.length!==5||!state.nav.includes("/original-works/experiments")||!state.nav.includes("/original-works"))throw Error("Lab navigation broken: "+JSON.stringify(state));
  if((width<=800)!==state.menuVisible)throw Error("Lab menu breakpoint mismatch: "+JSON.stringify(state));
  if(state.menuVisible){
   const menu=await evalJS(`(()=>{const d=document.querySelector('details.lab-mobile');d.querySelector('summary').click();const opened=d.open;const links=[...d.querySelectorAll('nav a')].map(a=>a.getAttribute('href'));d.querySelector('summary').click();return {opened,closed:!d.open,links}})()`);
   if(!menu.opened||!menu.closed||!menu.links.includes("/original-works/experiments"))throw Error("Lab mobile disclosure failed: "+JSON.stringify(menu));
  }
  if(saveScreenshot){
   const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
   const filepath=path.join(output,"anevum-public-"+name+".png");
   writeFileSync(filepath,Buffer.from(shot.data,"base64"));
   if(readFileSync(filepath).length<12000)throw Error("Blank Living Laboratory screenshot: "+filepath);
   // Capture the entire laboratory composition for actual visual comparison.
   const metrics=await send("Page.getLayoutMetrics");
   const fullWidth=Math.ceil(metrics.cssContentSize?.width||metrics.contentSize.width);
   const fullHeight=Math.ceil(metrics.cssContentSize?.height||metrics.contentSize.height);
   if(fullWidth<width-20||fullHeight<=height||fullHeight>12000)throw Error("Invalid full-page dimensions: "+JSON.stringify({width,height,fullWidth,fullHeight}));
   const fullShot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:fullWidth,height:fullHeight,scale:1}});
   const fullPath=path.join(output,"anevum-public-"+name+"-full.png");
   writeFileSync(fullPath,Buffer.from(fullShot.data,"base64"));
   if(readFileSync(fullPath).length<25000)throw Error("Blank Living Laboratory full-page screenshot: "+fullPath);
  }
  console.log(JSON.stringify({case:name,path:state.path,width:state.width,heading:state.heading,menuVisible:state.menuVisible}));
  return;
 }

 await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<650});
 await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
 await send("Page.navigate",{url:base+pathname});
 const state=await waitFor(async()=>{
  const v=await evalJS(`(()=>{const desktop=document.querySelector('nav.desktop-nav'),mobile=document.querySelector('details.mobile-menu'),orbit=document.querySelector('.orb.a');return {path:location.pathname,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,heading:document.querySelector('main#main h1')?.textContent,links:[...(desktop?.querySelectorAll('a')||[])].map(a=>a.getAttribute('href')),main:!!document.querySelector('main#main'),skip:!!document.querySelector('a.skip[href="#main"]'),menu:!!mobile,menuVisible:!!mobile&&(getComputedStyle(mobile).display!=='none'),motion:orbit?getComputedStyle(orbit).animationName:null,scripts:document.scripts.length}})()`);
  return v?.path===pathname&&v?.heading?v:null;
 },name);
 if(!state.main||!state.skip||!state.menu)throw Error("Missing accessibility landmark: "+JSON.stringify(state));
 if(state.width>width||state.width<width-20||state.scrollWidth>state.width+1||state.bodyScroll>state.width+1)
  throw Error("Horizontal overflow: "+JSON.stringify({requestedWidth:width,...state}));
 if((state.motion!==null&&state.motion!=="none")||state.scripts!==0)
  throw Error("Unexpected motion or client JS: "+JSON.stringify(state));
 if(state.links.length!==6||!state.links.includes("/original-works/works")||!state.links.includes("/original-works/reply"))
  throw Error("Invalid desktop navigation: "+JSON.stringify(state));
 if((width<=780)!==state.menuVisible)throw Error("Mobile disclosure breakpoint mismatch: "+JSON.stringify(state));

 const journey=await evalJS(`(()=>{const nav=document.querySelector('nav.journey'),next=nav?.querySelector('a.journey-next'),prev=nav?.querySelector('a.journey-prev'),meter=nav?.querySelector('.journey-meter');return {found:!!nav,href:next?.getAttribute('href'),tapHeight:next?.getBoundingClientRect().height||0,previous:prev?.getAttribute('href')||null,segments:meter?.querySelectorAll('span').length||0,current:meter?.querySelectorAll('span.now').length||0,accessibleProgress:meter?.getAttribute('aria-label'),focusable:next?.tabIndex>=0}})()`);
 if(!journey?.found||(journey.href!=="/"&&!journey.href?.startsWith("/original-works"))||journey.tapHeight<44||journey.current!==1||journey.segments!==7||!journey.focusable)
  throw Error("Editorial journey is unusable: "+JSON.stringify({name,width,journey}));
 if(width===390&&pathname==="/original-works"){
  const focus=await evalJS(`(()=>{const next=document.querySelector('.journey-next');next.focus();return document.activeElement===next})()`);
  if(!focus)throw Error("Journey must accept keyboard focus");
 }

 if(width===390&&pathname==="/original-works"){
  const menu=await evalJS(`(()=>{const d=document.querySelector('details.mobile-menu');d.querySelector('summary').click();const open=d.open;const links=[...d.querySelectorAll('nav a')].map(a=>a.getAttribute('href'));d.querySelector('summary').click();return {open,closed:!d.open,links}})()`);
  if(!menu.open||!menu.closed||!menu.links.includes('/original-works/works'))throw Error("Mobile disclosure failed: "+JSON.stringify(menu));
 }

 if(pathname==="/original-works/reply"){
  const reply=await evalJS(`(()=>{const nav=document.querySelector('.reply-quick-nav'),links=[...(nav?.querySelectorAll('a')||[])],book=document.querySelector('.reply-book'),edition=document.querySelector('#reply-edition'),cta=document.querySelector('.reply-editorial-actions .btn'),figure=document.querySelector('.reply-art'),h=document.querySelector('.reply-hero h1'),q=links[0];const rect=book?.getBoundingClientRect(),hRect=h?.getBoundingClientRect();q?.focus();return {anchors:links.map(x=>x.getAttribute('href')),resolved:links.map(x=>!!document.getElementById((x.getAttribute('href')||'').slice(1))),hasBook:!!book,hasFigure:!!figure,conceptLabel:book?.getAttribute('aria-label'),edition:!!edition,ctaHeight:cta?.getBoundingClientRect().height||0,touchHeights:links.map(x=>x.getBoundingClientRect().height),titleLeft:hRect?.left,titleRight:hRect?.right,bookLeft:rect?.left,bookRight:rect?.right,viewport:document.documentElement.clientWidth,coverMotion:book?getComputedStyle(book).transitionDuration:null,focus:document.activeElement===q}})()`);
  const expected=["#reply-work","#reply-edition","#reply-universe"];
  if(JSON.stringify(reply?.anchors)!==JSON.stringify(expected)||reply.resolved.some(x=>!x)||!reply.hasBook||!reply.hasFigure||!reply.edition||!reply.conceptLabel?.includes("not an approved final publication cover"))
   throw Error("REPLY editorial or anchors missing: "+JSON.stringify(reply));
  if(reply.ctaHeight<44||reply.touchHeights.some(x=>x<44)||!reply.focus||reply.coverMotion!=="0s")
   throw Error("REPLY touch/focus/reduced motion failure: "+JSON.stringify(reply));
  if(reply.titleLeft< -2||reply.titleRight>reply.viewport+2||reply.bookLeft< -8||reply.bookRight>reply.viewport+8)
   throw Error("REPLY content clipped at "+width+": "+JSON.stringify(reply));
 }


 if(pathname==="/"){
  const apex=await evalJS(`(()=>({title:document.title,brand:document.querySelector('a.brand')?.getAttribute('href'),reply:document.querySelector('a.nav-cta')?.getAttribute('href'),hero:document.querySelector('h1')?.textContent,robots:document.querySelector('meta[name="robots"]')?.getAttribute('content'),scripts:document.scripts.length}))()`);
  if(!apex.title.startsWith("Anevum | Original Works")||apex.brand!=="/"||apex.reply!=="/original-works/reply"||!apex.hero?.includes("answered.")||!apex.robots?.includes("noindex")||apex.scripts)
   throw Error("Canonical apex visual/safety contract failed: "+JSON.stringify(apex));
 }

 if(saveScreenshot){
  const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  const filepath=path.join(output,"anevum-public-"+name+".png");
  writeFileSync(filepath,Buffer.from(shot.data,"base64"));
  if(readFileSync(filepath).length<12000)throw Error("Empty browser screenshot: "+filepath);
 }
 console.log(JSON.stringify({case:name,path:state.path,width:state.width,scrollWidth:state.scrollWidth,heading:state.heading,menuVisible:state.menuVisible}));
}
try {
 await waitFor(async()=>{if(server.exitCode!==null)throw Error("local server exited");return (await fetch(base+"/original-works")).status===200; },"loopback server");
 const candidate=process.env.CHROME_BIN||(["google-chrome","google-chrome-stable","chromium","chromium-browser"].map(binary=>{
  const lookup=spawnSync("which",[binary],{encoding:"utf8"});
  return lookup.status===0?lookup.stdout.trim():null;
 }).find(Boolean));
 if(!candidate)throw Error("No Chrome/Chromium executable found for public-studio browser QA");
 const version=spawnSync(candidate,["--version"],{encoding:"utf8"});
 if(version.error||version.status!==0)throw Error("Chromium is not executable: "+candidate);
 console.log("PUBLIC_STUDIO_BROWSER_BIN "+candidate+" | "+version.stdout.trim());
 let chromeStartupError=null,chromeStderr="";
 chrome=spawn(candidate,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--no-first-run","--disable-background-networking","--remote-debugging-address=127.0.0.1","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:["ignore","ignore","pipe"]});
 chrome.on("error",error=>{chromeStartupError=error;});
 chrome.stderr?.on("data",chunk=>{chromeStderr=(chromeStderr+String(chunk)).slice(-3000);});
 const devtools=await waitFor(async()=>{
  if(chromeStartupError)throw Error("Chrome startup error: "+chromeStartupError.message);
  if(chrome.exitCode!==null)throw Error("Chrome exited ("+chrome.exitCode+"): "+chromeStderr);
  const f=path.join(profile,"DevToolsActivePort");
  if(!existsSync(f))return null;
  const n=Number(readFileSync(f,"utf8").split(/\r?\n/)[0]);
  return Number.isInteger(n)&&n>0?n:null;
 },"Chrome DevTools",{failFast:true}).catch(error=>{throw Error(error.message+"; stderr: "+chromeStderr);});
 const target=await (await fetch("http://127.0.0.1:"+devtools+"/json/new?about:blank",{method:"PUT"})).json();
 ws=new WebSocket(target.webSocketDebuggerUrl);
 ws.addEventListener("message",ev=>{
  const data=JSON.parse(String(ev.data));
  if(!data.id||!pending.has(data.id))return;
  const waiter=pending.get(data.id);pending.delete(data.id);clearTimeout(waiter.timer);
  if(data.error)waiter.reject(Error(data.error.message));else waiter.resolve(data.result);
 });
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
 await send("Page.enable");await send("Runtime.enable");
 for(const [width,height] of [[320,768],[390,844],[768,1024],[1024,768],[1440,900]]){
  for(const [slug,label] of [["","home"],["works","works"],["reply","reply"],["transcosmic","universe"],["wiki","encyclopedia"],["journal","journal"],["about","about"]]){
   const name=label+"-"+width;
   await view("/original-works"+(slug?"/"+slug:""),width,height,name,["home","reply","encyclopedia"].includes(label)&&[390,1440].includes(width));
   if(label==="reply"&&[390,1440].includes(width)){
    await evalJS(`(()=>{document.querySelector('.reply-art').scrollIntoView({behavior:'instant',block:'center'});return true})()`);
    const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    const filepath=path.join(output,"anevum-public-reply-book-"+width+".png");
    writeFileSync(filepath,Buffer.from(shot.data,"base64"));
    if(readFileSync(filepath).length<12000)throw Error("REPLY book screenshot blank: "+filepath);
   }
   if(label==="home"&&[390,1440].includes(width)){
    await evalJS(`(()=>{document.querySelector('.journey').scrollIntoView({behavior:'instant',block:'center'});return true})()`);
    const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    const filepath=path.join(output,"anevum-public-journey-"+width+".png");
    writeFileSync(filepath,Buffer.from(shot.data,"base64"));
    if(readFileSync(filepath).length<12000)throw Error("Journey screenshot is blank: "+filepath);
   }

  }
 }
 await view("/original-works/research",320,768,"research-320",false);
 await view("/original-works/research",390,844,"research-390",true);
 await view("/original-works/research",768,1024,"research-768",false);
 await view("/original-works/research",1440,900,"research-1440",true);
 await view("/original-works/experiments",390,844,"experiments-390",true);
 await view("/original-works/experiments",1440,900,"experiments-1440",true);
 await view("/original-works/experiments?theme=interactive",390,844,"experiments-interactive-390",false);
 await view("/",390,844,"canonical-root-390",true);
 await view("/",1440,900,"canonical-root-1440",true);
 console.log("ANEVUM_PUBLIC_STUDIO_BROWSER_QA_PASS");
} finally {
 for(const wait of pending.values()){clearTimeout(wait.timer);wait.reject(Error("Browser ending"));}pending.clear();
 if(ws)ws.close();
 // Chrome writes profile files while shutting down. Wait for process close
 // before removing the temporary profile; retry ENOTEMPTY on slow runners.
 let chromeClosed=null;
 if(chrome && chrome.exitCode===null && chrome.signalCode===null){
  chromeClosed=new Promise(resolve=>chrome.once("close",resolve));
  chrome.kill("SIGTERM");
 }
 if(server.exitCode===null && server.signalCode===null)server.kill("SIGTERM");
 if(chromeClosed)await Promise.race([chromeClosed,sleep(2500)]);
 if(chrome && chrome.exitCode===null && chrome.signalCode===null){
  chrome.kill("SIGKILL");
  await sleep(250);
 }
 rmSync(profile,{recursive:true,force:true,maxRetries:20,retryDelay:150});
}
