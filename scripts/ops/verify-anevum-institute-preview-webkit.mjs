// WebKit browser preflight for the isolated ANEVUM Open Institute.
// This is not a real iPhone Safari owner acceptance or a production deploy.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {mkdirSync} from "node:fs";
import path from "node:path";
import {tmpdir} from "node:os";
import {webkit} from "playwright";

const origin="http://127.0.0.1:4183";
const output=process.env.RUNNER_TEMP||tmpdir();
mkdirSync(output,{recursive:true});
const routes=[
  "/institute-preview",
  "/institute-preview/academy",
  "/institute-preview/academy/cfp-101",
  "/institute-preview/research",
  "/institute-preview/dossier",
  "/institute-preview/recognition",
  "/institute-preview/studio",
  "/institute-preview/profile",
  "/institute-preview/learn/cfp-101/transistor-switching",
  "/institute-preview/learn/cfp-101/logic-gates",
  "/institute-preview/learn/cfp-101/half-adders",
  "/institute-preview/laboratory/and-gate",
  "/institute-preview/laboratory/cluster-scheduling",
  "/institute-preview/laboratory/neuron-dynamics"
];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const server=spawn(process.execPath,["scripts/ops/anevum-institute-preview-server.mjs"],{stdio:"ignore"});
let browser;
const errors=[];
function check(ok,message,data){assert.ok(ok,message+" "+JSON.stringify(data||{}));}
async function awaitServer(){
  for(let n=0;n<80;n++){
    if(server.exitCode!==null)throw Error("Loopback preview exited");
    try{
      const r=await fetch(origin+"/institute-preview",{signal:AbortSignal.timeout(1000)});
      if(r.status===200)return;
    }catch{}
    await sleep(150);
  }
  throw Error("Loopback preview did not start");
}
async function visit(page,route){
  const res=await page.goto(origin+route,{waitUntil:"load",timeout:20000});
  check(res?.status()===200,"Missing isolated preview route",{route,status:res?.status()});
  await page.locator("main h1").waitFor({state:"visible",timeout:12000});
  if(route==="/institute-preview/dossier")
    await page.locator('[data-evidence-ready="true"]').waitFor({timeout:12000});
}
async function routeMatrix(page,device){
  for(const route of routes){
    await visit(page,route);
    const state=await page.evaluate(()=>({
      width:document.documentElement.clientWidth,
      scroll:document.documentElement.scrollWidth,
      body:document.body.scrollWidth,
      main:document.querySelectorAll("main").length,
      headings:document.querySelectorAll("main h1").length,
      robots:document.querySelector('meta[name="robots"]')?.content,
      skip:!!document.querySelector('a.skip[href="#main"]'),
      links:[...document.querySelectorAll("a[href]")].every(a=>!!(a.textContent.trim()||a.getAttribute("aria-label")))
    }));
    check(state.main===1&&state.headings===1&&state.skip&&state.links&&state.robots?.includes("noindex"),
      "Missing WebKit semantics or privacy marker",{device,route,state});
    check(state.scroll<=state.width+1&&state.body<=state.width+1,
      "Horizontal overflow in WebKit",{device,route,state});
  }
  console.log("ANEVUM_WEBKIT_ROUTE_MATRIX_PASS",JSON.stringify({device,count:routes.length}));
}
async function mobileMenu(page){
  await visit(page,"/institute-preview/academy");
  const menu=page.locator("details.mobile-menu");
  check(await menu.isVisible(),"Mobile menu not visible");
  check(!(await menu.evaluate(el=>el.open)),"Mobile menu not initially closed");
  await menu.locator("summary").click();
  check(await menu.evaluate(el=>el.open),"Touch did not open menu");
  const research=menu.locator('a[href="/institute-preview/research"]');
  check(await research.isVisible(),"Research is hidden in opened mobile menu");
  await research.click();
  await page.waitForURL(origin+"/institute-preview/research");
  check((await page.locator("main h1").textContent()).includes("testable question"),
    "Touch menu failed to navigate");
  console.log("ANEVUM_WEBKIT_TOUCH_MENU_PASS");
}
async function studyNoteBookmark(page){
  const route="/institute-preview/learn/cfp-101/half-adders";
  const key="anevum.institute.study.v1.CFP-101-U03";
  await visit(page,route);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  await page.reload({waitUntil:"load"});
  const note=page.locator("[data-study-text]");
  const bookmark=page.locator("[data-study-bookmark]");
  const feedback=page.locator("[data-study-status]");
  const first="Device-only draft entered before bookmarking.";
  await note.fill(first);
  check((await feedback.textContent()).includes("Unsaved notes"),
    "Typing must expose unsaved note state");
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Typing alone must not silently save");
  await bookmark.click();
  const committed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  check(committed.note===first&&committed.bookmark===true
    &&(await feedback.textContent()).includes("current notes saved"),
    "Bookmarking must atomically save visible note text",committed);
  await page.reload({waitUntil:"load"});
  check(await note.inputValue()===first&&(await bookmark.getAttribute("aria-pressed"))==="true",
    "Bookmark and pending edits must survive reload");
  const revised="Revised device-only draft on bookmark removal.";
  await note.fill(revised);
  check((await feedback.textContent()).includes("Unsaved notes"),
    "Editing a saved note must show unsaved state");
  await bookmark.click();
  const unbookmarked=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  check(unbookmarked.note===revised&&unbookmarked.bookmark===false,
    "Removing bookmark must preserve new unsaved notes",unbookmarked);
  await page.reload({waitUntil:"load"});
  check(await note.inputValue()===revised&&(await bookmark.getAttribute("aria-pressed"))==="false",
    "Unbookmarked revised note was lost");
  await page.locator("[data-study-clear]").click();
  check((await feedback.textContent()).includes("Confirm deletion"),
    "Local notes deletion needs a second confirmation");
  await page.locator("[data-study-clear]").click();
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Synthetic test notes could not be deleted");
  console.log("ANEVUM_WEBKIT_UNSAVED_NOTE_BOOKMARK_PASS",
    JSON.stringify({losslessBookmark:true,losslessUnbookmark:true,noAutosave:true,
      restoredAfterReload:true,twoStepDeletion:true}));
}

async function studyNotePortability(page){
  const route="/institute-preview/learn/cfp-101/logic-gates";
  const key="anevum.institute.study.v1.CFP-101-U02";
  await visit(page,route);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  await page.reload({waitUntil:"load"});
  const note=page.locator("[data-study-text]");
  const save=page.locator("[data-study-save]");
  const file=page.locator("[data-study-import]");
  const apply=page.locator("[data-study-import-apply]");
  const feedback=page.locator("[data-study-status]");
  await note.fill("Previously saved text on this device.");
  await save.click();
  const original=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).note,key);
  await note.fill("New unsaved text already in editor.");
  const temporary=await note.inputValue();
  const restored="From exported notes, with a new line.\nRestored through file picker.";
  const format=(id,text)=>"ANEVUM Open Institute / "+id+
    " / Personal study notes\nBrowser-local export; not an institutional transcript.\n\n"+text+"\n";
  await file.setInputFiles({name:"anevum-cfp101-u02-notes.txt",mimeType:"text/plain",
    buffer:Buffer.from(format("CFP-101-U02",restored),"utf8")});
  await apply.waitFor({state:"visible",timeout:10000});
  check((await note.inputValue())===temporary
      &&(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).note,key))===original,
    "Importing a file must not overwrite editor or saved note");
  check((await feedback.textContent()).includes("format checked"),
    "Per-lesson export format was not validated");
  await apply.click();
  check((await note.inputValue())===restored
      &&(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).note,key))===original
      &&(await feedback.textContent()).includes("not saved"),
    "Apply must require a separate Save");
  await save.click();
  await page.reload({waitUntil:"load"});
  check((await note.inputValue())===restored
      &&(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).note,key))===restored,
    "Imported notes failed to survive a reload after explicit Save");
  await file.setInputFiles({name:"anevum-cfp101-u01-notes.txt",mimeType:"text/plain",
    buffer:Buffer.from(format("CFP-101-U01","wrong lesson"),"utf8")});
  await page.waitForFunction(()=>document.querySelector("[data-study-status]")?.textContent.startsWith("Notes import rejected"));
  check(await apply.isHidden()&&(await note.inputValue())===restored
      &&(await feedback.textContent()).includes("this exact lesson"),
    "Foreign lesson notes should be rejected without overwriting anything");
  await file.setInputFiles({name:"huge.txt",mimeType:"text/plain",
    buffer:Buffer.from("x".repeat(41000),"utf8")});
  await page.waitForFunction(()=>document.querySelector("[data-study-status]")?.textContent.includes("40 KiB limit"));
  check(await apply.isHidden()&&(await note.inputValue())===restored,
    "Oversized import must be rejected and leave text intact");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Synthetic imported note data must be deleted");
  console.log("ANEVUM_WEBKIT_PORTABLE_STUDY_IMPORT_PASS",JSON.stringify({
    filePicker:true,stagedOnly:true,explicitApply:true,explicitSave:true,
    recoveredAfterReload:true,wrongLessonRejected:true,oversizedRejected:true
  }));
}

async function halfAdder(page){
  await visit(page,"/institute-preview/learn/cfp-101/half-adders");
  await page.evaluate(()=>{
    localStorage.removeItem("anevum.institute.evidence-draft.v1");
    sessionStorage.removeItem("anevum.institute.handoff.half.v1");
  });
  const handoff=page.locator("[data-half-to-dossier]");
  check(await handoff.isDisabled(),"Half-adder handoff must begin disabled");
  for(const key of ["b","a","b"])await page.locator('[data-half-input="'+key+'"]').click();
  check(await handoff.isEnabled(),"Four input states did not unlock handoff");
  check((await page.locator("[data-half-progress]").textContent()).startsWith("4 of 4"),
    "Incomplete half-adder coverage");
  await handoff.click();
  await page.waitForURL(origin+"/institute-preview/dossier#half-import",{timeout:12000});
  await page.locator('[data-evidence-ready="true"]').waitFor({timeout:12000});
  const staged=await page.evaluate(()=>({
    hub:document.querySelector("[data-import-hub]")?.open,
    source:document.querySelector("#half-import")?.open,
    apply:!document.querySelector("[data-half-apply]")?.hidden,
    pending:sessionStorage.getItem("anevum.institute.handoff.half.v1"),
    saved:localStorage.getItem("anevum.institute.evidence-draft.v1"),
    title:document.querySelector('[data-evidence-field="title"]')?.value,
    feedback:document.querySelector("[data-half-feedback]")?.textContent
  }));
  check(staged.hub&&staged.source&&staged.apply&&staged.pending===null&&staged.saved===null
      &&staged.title===""&&staged.feedback?.includes("All four half-adder results"),
    "Handoff not staged safely in WebKit",staged);
  await page.locator("[data-half-apply]").click();
  const applied=await page.evaluate(()=>({
    title:document.querySelector('[data-evidence-field="title"]')?.value,
    observations:document.querySelector('[data-evidence-field="observations"]')?.value,
    saved:localStorage.getItem("anevum.institute.evidence-draft.v1")
  }));
  check(applied.title?.includes("half-adder")&&applied.observations?.includes("11 -> sum 0, carry 1")
      &&applied.saved===null,"Apply must not silently save",applied);
  await page.locator("[data-evidence-save]").click();
  await page.waitForFunction(()=>document.querySelector("[data-evidence-status]")?.textContent.startsWith("Personal draft saved"));
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem("anevum.institute.evidence-draft.v1")));
  check(record?.record?.kind==="personal-unreviewed-draft"&&record?.record?.courseId==="CFP-101"
    &&/^sha256:[a-f0-9]{64}$/.test(record.digest),"Saved record is not an unreviewed checksum draft",
    {kind:record?.record?.kind,course:record?.record?.courseId});
  await visit(page,"/institute-preview/academy");
  await page.goto(origin+"/institute-preview/dossier#half-import");
  await page.locator('[data-evidence-ready="true"]').waitFor();
  check(await page.locator("[data-half-apply]").isHidden(),"Handoff replayed after one use");
  check((await page.locator('[data-evidence-field="title"]').inputValue())===record.record.title,
    "Saved research lost on re-entry");
  await page.evaluate(()=>localStorage.removeItem("anevum.institute.evidence-draft.v1"));
  console.log("ANEVUM_WEBKIT_HALF_ADDER_RESEARCH_PASS");
}
async function screenshot(page,name){
  await page.screenshot({path:path.join(output,"anevum-institute-webkit-"+name+".png"),
    fullPage:true,animations:"disabled"});
}
try{
  await awaitServer();
  browser=await webkit.launch({headless:true});
  const phoneContext=await browser.newContext({viewport:{width:393,height:852},
    deviceScaleFactor:3,isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  const phone=await phoneContext.newPage();
  phone.on("pageerror",err=>errors.push("phone: "+err.message));
  await routeMatrix(phone,"touch-393");
  await visit(phone,"/institute-preview/academy");
  await screenshot(phone,"academy-mobile");
  await mobileMenu(phone);
  await studyNoteBookmark(phone);
  await studyNotePortability(phone);
  await halfAdder(phone);
  await visit(phone,"/institute-preview/dossier");
  await screenshot(phone,"research-desk-mobile");
  await phoneContext.close();
  const desktopContext=await browser.newContext({viewport:{width:1440,height:900},
    deviceScaleFactor:1,reducedMotion:"reduce"});
  const desktop=await desktopContext.newPage();
  desktop.on("pageerror",err=>errors.push("desktop: "+err.message));
  await routeMatrix(desktop,"desktop-1440");
  await visit(desktop,"/institute-preview/academy");
  await screenshot(desktop,"academy-desktop");
  await desktopContext.close();
  check(errors.length===0,"Unhandled WebKit page errors",errors);
  console.log("ANEVUM_INSTITUTE_WEBKIT_PREFLIGHT_PASS",
    JSON.stringify({routes:28,touchMenu:true,studyNotesPreserved:true,portableNoteImport:true,halfAdderHandoff:true,
      ownerSafariAcceptance:false,publicDeployment:false}));
}finally{
  if(browser)await browser.close();
  if(server.exitCode===null)server.kill("SIGTERM");
}
