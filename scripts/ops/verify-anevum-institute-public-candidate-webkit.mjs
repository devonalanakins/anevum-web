// Public Institute release-candidate browser QA: loopback only, NEVER a deployment.
// Linux Playwright WebKit is not owner-authenticated physical iPhone Safari acceptance.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {tmpdir} from "node:os";
import {webkit} from "playwright";
import {CFP_101} from "../../apps/anevum-institute-preview/curriculum.mjs";

const origin="http://127.0.0.1:4184";
const output=process.env.RUNNER_TEMP||tmpdir();
mkdirSync(output,{recursive:true});
const paths=[
  "/institute","/institute/academy","/institute/academy/cfp-101",
  "/institute/research","/institute/recognition","/institute/dossier",
  "/institute/studio","/institute/profile",
  ...CFP_101.units.map(unit=>"/institute"+unit.lessonPath),
  "/institute/laboratory/and-gate",
  "/institute/laboratory/cluster-scheduling",
  "/institute/laboratory/neuron-dynamics"
];
const privateLocal=new Set(["/institute/dossier","/institute/studio","/institute/profile"]);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn(process.execPath,["scripts/ops/anevum-institute-public-candidate-server.mjs"],{stdio:"ignore"});
let browser;
const errors=[];
async function waitForServer(){
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw Error("Public candidate loopback server exited unexpectedly");
    try{
      const response=await fetch(origin+"/institute",{signal:AbortSignal.timeout(1000)});
      if(response.status===200)return;
    }catch{}
    await sleep(150);
  }
  throw Error("Candidate loopback server unavailable");
}
async function checkRoute(page,route,device){
  const response=await page.goto(origin+route,{waitUntil:"load",timeout:20000});
  assert.equal(response?.status(),200,route);
  await page.locator("main h1").waitFor({state:"visible",timeout:12000});
  const state=await page.evaluate(()=>({
    width:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    body:document.body.scrollWidth,
    main:document.querySelectorAll("main").length,
    headings:document.querySelectorAll("main h1").length,
    robots:document.querySelector('meta[name="robots"]')?.content,
    canonical:document.querySelector('link[rel="canonical"]')?.href,
    oldPath:document.documentElement.outerHTML.includes("/institute-preview"),
    logo:!!document.querySelector(".identity-mark")?.naturalWidth,
    css:!![...document.styleSheets].some(sheet=>sheet.href?.includes("/institute/styles.css")),
    script:!!document.querySelector('script[src="/institute/client.js"]')
  }));
  assert.equal(state.main,1,device+" "+route);
  assert.equal(state.headings,1,device+" "+route);
  assert.ok(state.logo&&state.css&&state.script,"Candidate media or CSS/JS failed: "+device+" "+route);
  assert.ok(!state.oldPath,"Stale preview link: "+route);
  assert.equal(state.canonical,"https://anevum.com"+route);
  assert.equal(state.robots,privateLocal.has(route)?"noindex,nofollow":"index,follow");
  assert.ok(state.scroll<=state.width+1&&state.body<=state.width+1,
    "Horizontal overflow: "+JSON.stringify({route,device,...state}));
}
try{
  await waitForServer();
  browser=await webkit.launch({headless:true});
  for(const spec of [
    {name:"phone-393",viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:3},
    {name:"desktop-1440",viewport:{width:1440,height:900},isMobile:false,hasTouch:false,deviceScaleFactor:1}
  ]){
    const {name:deviceName,...deviceOptions}=spec;
    const context=await browser.newContext({...deviceOptions,reducedMotion:"reduce"});
    const page=await context.newPage();
    page.on("pageerror",error=>errors.push(spec.name+": "+error.message));
    const unexpected=[];
    await page.route("**/*",route=>{
      if(route.request().url().startsWith(origin+"/"))return route.continue();
      unexpected.push(route.request().url());
      return route.abort();
    });
    for(const route of paths)await checkRoute(page,route,spec.name);
    assert.deepEqual(unexpected,[],"Unexpected external requests");
    if(spec.isMobile){
      await page.goto(origin+"/institute/academy",{waitUntil:"load"});
      const menu=page.locator("details.mobile-menu");
      assert.ok(await menu.isVisible(),"Mobile nav unavailable");
      await menu.locator("summary").click();
      await menu.locator('a[href="/institute/research"]').click();
      await page.waitForURL(origin+"/institute/research");
      assert.match(await page.locator("main h1").textContent(),/testable question/);
      await page.goto(origin+"/institute/learn/cfp-101/half-adders",{waitUntil:"load"});
      const note=page.locator("[data-study-text]");
      await note.fill("Synthetic local note on the public candidate.");
      await page.locator("[data-study-save]").click();
      await page.reload({waitUntil:"load"});
      assert.equal(await note.inputValue(),"Synthetic local note on the public candidate.");
      await page.locator("[data-study-clear]").click();
      await page.locator("[data-study-clear]").click();
      await page.goto(origin+"/institute/dossier",{waitUntil:"load"});
      await page.locator('[data-evidence-ready="true"]').waitFor({timeout:12000});
      await page.screenshot({
        path:path.join(output,"anevum-institute-public-candidate-webkit-phone.png"),
        animations:"disabled",fullPage:true
      });
    }else{
      await page.goto(origin+"/institute",{waitUntil:"load"});
      await page.screenshot({
        path:path.join(output,"anevum-institute-public-candidate-webkit-desktop.png"),
        animations:"disabled",fullPage:true
      });
    }
    await context.close();
    console.log("ANEVUM_INSTITUTE_PUBLIC_CANDIDATE_WEBKIT_MATRIX_PASS",
      JSON.stringify({device:spec.name,routes:paths.length,externalRequests:0}));
  }
  assert.deepEqual(errors,[],"Unhandled browser script failures");
  console.log("ANEVUM_INSTITUTE_PUBLIC_CANDIDATE_WEBKIT_PASS",
    JSON.stringify({routes:paths.length*2,localNotes:true,mobileMenu:true,
      ownerSafariAcceptance:false,productionDeployment:false}));
}finally{
  if(browser)await browser.close();
  if(server.exitCode===null)server.kill("SIGTERM");
}
