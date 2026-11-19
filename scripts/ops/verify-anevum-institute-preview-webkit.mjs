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
  "/institute-preview/learn/cfp-101/registers",
  "/institute-preview/learn/cfp-101/addressed-memory",
  "/institute-preview/learn/cfp-101/assembly-code",
  "/institute-preview/learn/cfp-101/computer-systems",
  "/institute-preview/learn/cfp-101/eight-bit-computer",
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

async function studyUnsavedNavigation(page){
  const lesson="/institute-preview/learn/cfp-101/logic-gates";
  const syllabus=origin+"/institute-preview/academy/cfp-101";
  const key="anevum.institute.study.v1.CFP-101-U02";
  await visit(page,lesson);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  await page.reload({waitUntil:"load"});
  const note=page.locator("[data-study-text]");
  const link=page.locator(".study-path-heading a");
  const draft="Unsaved model notes should not disappear silently.";
  await note.fill(draft);
  let dismissed=0;
  page.once("dialog",async dialog=>{
    check(dialog.type()==="confirm"&&dialog.message().includes("unsaved lesson notes"),
      "In-site unsaved note guard did not offer a truthful confirmation");
    dismissed++;
    await dialog.dismiss();
  });
  await link.click();
  check(dismissed===1&&page.url()===origin+lesson
    &&(await note.inputValue())===draft
    &&(await page.evaluate(key=>localStorage.getItem(key),key))===null
    &&(await page.locator("[data-study-status]").textContent()).includes("Navigation cancelled"),
    "Cancelled navigation must retain unsaved editor text and keep storage untouched");
  let accepted=0;
  page.once("dialog",async dialog=>{
    check(dialog.type()==="confirm","Keyboard navigation did not show confirmation");
    accepted++;
    await dialog.accept();
  });
  await link.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(syllabus,{timeout:12000});
  check(accepted===1,"Accepted keyboard navigation was not confirmed exactly once");
  await visit(page,lesson);
  check((await page.locator("[data-study-text]").inputValue())===""
    &&(await page.evaluate(key=>localStorage.getItem(key),key))===null,
    "Accepted leave must not auto-save the discarded local draft");
  const saved="Saved notes should not cause a navigation prompt.";
  await page.locator("[data-study-text]").fill(saved);
  await page.locator("[data-study-save]").click();
  let unexpected=0;
  const onDialog=async dialog=>{unexpected++;await dialog.dismiss();};
  page.on("dialog",onDialog);
  await page.locator(".study-path-heading a").click();
  await page.waitForURL(syllabus,{timeout:12000});
  page.off("dialog",onDialog);
  check(unexpected===0&&(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).note,key))===saved,
    "Saved lesson notes must navigate directly without prompting or data loss");
  await page.evaluate(key=>localStorage.removeItem(key),key);
  console.log("ANEVUM_WEBKIT_UNSAVED_NAVIGATION_PASS",JSON.stringify({
    cancelPreservesEditor:true,keyboardAcceptLeaves:true,doesNotAutosave:true,
    savedNavigationDoesNotPrompt:true,mobileBrowserCloseWarningNotAssumed:true
  }));
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
  check(await apply.isHidden(),"Unused note importer Apply action must be visually hidden");
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
  // Reproduce a slow file read; newer editing and confirmed deletion must
  // cancel the earlier import, even if its Promise settles afterward.
  await page.evaluate(()=>{
    const original=File.prototype.text;
    const imported="ANEVUM Open Institute / CFP-101-U02 / Personal study notes\n"+
      "Browser-local export; not an institutional transcript.\n\n"+
      "Stale delayed file must never overwrite newer user work.\n";
    const delayed={original,imported,resolve:null};
    window.__anevumDelayedImport=delayed;
    File.prototype.text=function(){
      if(this.name!=="delayed-cfp101-u02.txt")return original.call(this);
      return new Promise(resolve=>{delayed.resolve=()=>resolve(delayed.imported);});
    };
  });
  const slowFile={name:"delayed-cfp101-u02.txt",mimeType:"text/plain",
    buffer:Buffer.from("ANEVUM fixture, contents provided by delayed File.text","utf8")};
  await file.setInputFiles(slowFile);
  await page.waitForFunction(()=>typeof window.__anevumDelayedImport?.resolve==="function");
  const newer="Keep this newer unsaved edit; disregard the stale file.";
  await note.fill(newer);
  await page.evaluate(async()=>{
    window.__anevumDelayedImport.resolve();
    await new Promise(resolve=>setTimeout(resolve,0));
  });
  check(await apply.isHidden()&&(await note.inputValue())===newer
      &&(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).note,key))===restored
      &&(await file.inputValue())==="",
    "A late file read must not revive an import after editing");
  await page.evaluate(()=>{window.__anevumDelayedImport.resolve=null;});
  await file.setInputFiles(slowFile);
  await page.waitForFunction(()=>typeof window.__anevumDelayedImport?.resolve==="function");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  await page.evaluate(async()=>{
    window.__anevumDelayedImport.resolve();
    await new Promise(resolve=>setTimeout(resolve,0));
    File.prototype.text=window.__anevumDelayedImport.original;
    delete window.__anevumDelayedImport;
  });
  check(await apply.isHidden()&&(await file.inputValue())==="",
    "A late file read must not revive an import after confirmed deletion");
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Synthetic imported note data must be deleted");
  console.log("ANEVUM_WEBKIT_STALE_NOTE_IMPORT_CANCEL_PASS",JSON.stringify({
    editedDuringRead:true,deletedDuringRead:true,staleApplyHidden:true,localSavePreserved:true
  }));
  console.log("ANEVUM_WEBKIT_PORTABLE_STUDY_IMPORT_PASS",JSON.stringify({
    filePicker:true,stagedOnly:true,explicitApply:true,explicitSave:true,
    recoveredAfterReload:true,wrongLessonRejected:true,oversizedRejected:true,
    concurrentEditAndDeletionSafe:true
  }));
}

async function cpuCapstone(page){
  const route="/institute-preview/learn/cfp-101/eight-bit-computer";
  const key="anevum.institute.study.v1.CFP-101-U08";
  await visit(page,route);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  await page.locator('[data-cpu-ready="true"]').waitFor({timeout:12000});
  const bench=page.locator("[data-cpu-bench]");
  await bench.locator("[data-cpu-step]").click();
  check((await bench.locator("[data-cpu-acc]").textContent())==="07","CPU first LDI failed");
  await bench.locator("[data-cpu-run]").click();
  const memory=await bench.locator("[data-cpu-memory] tr").allTextContents();
  check((await bench.locator("[data-cpu-acc]").textContent())==="0B"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("6 /")
    &&memory[2].includes("0B")
    &&await bench.locator("[data-cpu-step]").isDisabled()
    &&await bench.locator("[data-cpu-trace] li").count()===6,
    "CPU sample execution, trace, or HALT behavior incorrect",{memory});
  const invalid=bench.locator("[data-cpu-source]");
  await invalid.fill("ZZ");
  await bench.locator("[data-cpu-load]").click();
  check((await bench.locator("[data-cpu-status]").textContent()).includes("rejected")
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("6 /"),
    "Malformed hex must not modify the previous executed program");
  await invalid.fill("40");
  await bench.locator("[data-cpu-load]").click();
  await bench.locator("[data-cpu-run]").click();
  check((await bench.locator("[data-cpu-steps]").textContent()).startsWith("32 /")
    &&(await bench.locator("[data-cpu-reason]").textContent()).includes("cutoff"),
    "Infinite loop must stop at the bounded step limit");
// Staging a preset never changes editor text or the already executed CPU.
  const select=bench.locator("[data-cpu-example]");
  await select.selectOption("branch");
  check((await bench.locator("[data-cpu-example-description]").textContent()).includes("JZ 3")
    &&(await invalid.inputValue())==="40"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("32 /"),
    "Changing the example chooser must not load or run a program");
  await bench.locator("[data-cpu-insert]").click();
  check((await invalid.inputValue())==="30 53 39 F0"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("32 /"),
    "Copy example must modify editor only");
  await bench.locator("[data-cpu-load]").click();
  check((await bench.locator("[data-cpu-rom] tr").nth(1).textContent()).includes("JZ 3"),
    "ROM display must disassemble the branch instruction");
  await bench.locator("[data-cpu-run]").click();
  check((await bench.locator("[data-cpu-steps]").textContent()).startsWith("3 /")
    &&(await bench.locator("[data-cpu-acc]").textContent())==="00",
    "Conditional branch example must skip LDI 9 and halt in 3 steps");
  await invalid.fill("31");
  await select.selectOption("addition");
  let cancelled=false;
  page.once("dialog",async dialog=>{
    check(dialog.type()==="confirm"&&dialog.message().includes("Replace unsaved program text"),
      "Example replacement must ask before discarding unsaved custom program text");
    cancelled=true;await dialog.dismiss();
  });
  await bench.locator("[data-cpu-insert]").click();
  check(cancelled&&(await invalid.inputValue())==="31"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("3 /"),
    "Cancelled example insertion must not overwrite editor or machine");
  let accepted=false;
  page.once("dialog",async dialog=>{accepted=true;await dialog.accept();});
  await bench.locator("[data-cpu-insert]").click();
  check(accepted&&(await invalid.inputValue())==="37 11 34 21 12 F0"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("3 /"),
    "Confirmed insertion changes editor but never executes CPU instructions");


  await bench.locator("[data-cpu-assembly] > summary").click();
  const asm=bench.locator("[data-cpu-assembly-source]");
  await asm.fill("LDI 2\nHALT");
  const beforeCompile=await bench.locator("[data-cpu-steps]").textContent();
  await bench.locator("[data-cpu-assemble]").click();
  check((await invalid.inputValue())==="32 F0"
    &&(await bench.locator("[data-cpu-steps]").textContent())===beforeCompile
    &&(await bench.locator("[data-cpu-assembly-status]").textContent()).includes("No instructions executed"),
    "Mnemonic assembly must not mutate a running machine");
  await bench.locator("[data-cpu-load]").click();
  await bench.locator("[data-cpu-run]").click();
  check((await bench.locator("[data-cpu-acc]").textContent())==="02"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("2 /"),
    "Two-instruction compiled program must halt with accumulator 02");
  await asm.fill("LDI 16");
  await bench.locator("[data-cpu-assemble]").click();
  check((await invalid.inputValue())==="32 F0"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("2 /")
    &&(await bench.locator("[data-cpu-assembly-status]").textContent()).includes("Compilation rejected"),
    "Out-of-range mnemonic operand must preserve loaded machine and hex editor");
  await invalid.fill("31");
  await asm.fill("LDI 5\nHALT");
  let asmCancelled=false;
  page.once("dialog",async dialog=>{asmCancelled=true;await dialog.dismiss();});
  await bench.locator("[data-cpu-assemble]").click();
  check(asmCancelled&&(await invalid.inputValue())==="31"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("2 /"),
    "Cancelling mnemonic overwrite must preserve dirty custom hex text");
  let asmConfirmed=false;
  page.once("dialog",async dialog=>{asmConfirmed=true;await dialog.accept();});
  await bench.locator("[data-cpu-assemble]").click();
  check(asmConfirmed&&(await invalid.inputValue())==="35 F0"
    &&(await bench.locator("[data-cpu-steps]").textContent()).startsWith("2 /"),
    "Confirmed mnemonic compilation must stage text but not run instructions");

  await bench.locator("[data-cpu-reset]").click();
  check((await bench.locator("[data-cpu-steps]").textContent()).startsWith("0 /")
    &&await bench.locator("[data-cpu-run]").isEnabled(),
    "Reset must restore a runnable machine");
  await page.locator('[data-cpu-answer="0B"]').click();
  check((await page.locator("[data-cpu-quiz-status]").textContent()).startsWith("Correct."),
    "CPU lesson explanatory quiz incorrect");
  await page.locator("[data-study-text]").fill("Synthetic CPU note: RAM address 2 holds 0B.");
  await page.locator("[data-study-save]").click();
  await page.reload({waitUntil:"load"});
  check((await page.locator("[data-study-text]").inputValue()).includes("RAM address 2")
    &&(await page.locator("[data-study-lesson]").getAttribute("data-study-lesson"))==="CFP-101-U08"
    &&(await page.locator("[data-cpu-steps]").textContent()).startsWith("0 /"),
    "CPU session/notebook preservation boundary incorrect");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),"Synthetic Unit08 notebook not deleted");
  await screenshot(page,"cpu-capstone-mobile");
  console.log("ANEVUM_WEBKIT_CPU_CAPSTONE_PASS",JSON.stringify({sample:true,loopBound:32,quiz:true,notes:true,noHardware:true}));
}

async function systemsLesson(page){
  const route="/institute-preview/learn/cfp-101/computer-systems";
  const key="anevum.institute.study.v1.CFP-101-U07";
  await visit(page,route);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  const bench=page.locator("[data-systems-bench]");
  const tick=bench.locator("[data-systems-tick]");
  const queue=bench.locator("[data-systems-queue]");
  const next=bench.locator("[data-systems-advance]");
  check((await tick.textContent())==="0"&&(await queue.textContent())==="A → B → C"&&await next.isEnabled(),
    "Systems scheduler initial state incorrect");
  const expected=[
    ["A","B → C → A"],["B","C → A"],["C","A → C"],
    ["A","C"],["C","C"],["C","All processes finished"]
  ];
  for(let i=0;i<expected.length;i++){
    await next.click();
    const last=await bench.locator("[data-systems-last]").textContent();
    check(last.includes("· "+expected[i][0]+" ·")&&(await queue.textContent())===expected[i][1]
      &&(await tick.textContent())===String(i+1),
      "Systems scheduler failed at turn "+String(i+1),{last,queue:await queue.textContent()});
  }
  check(await next.isDisabled()&&(await bench.locator("[data-systems-left]").allTextContents()).join(",")==="0,0,0"
    &&await bench.locator("[data-systems-history] li").count()===6,
    "Completed systems model must not retain runnable work");
  const record=await bench.evaluate(async root=>{
    const create=URL.createObjectURL;
    let captured=null;
    const intercept=e=>{if(e.target.closest("a[download]"))e.preventDefault();};
    document.addEventListener("click",intercept,true);
    URL.createObjectURL=blob=>{captured=blob;return "blob:anevum-systems-webkit-fixture";};
    try{
      root.querySelector("[data-systems-export]").click();
      return captured?JSON.parse(await captured.text()):null;
    }finally{
      URL.createObjectURL=create;
      document.removeEventListener("click",intercept,true);
    }
  });
  check(record?.model==="ideal-single-core-round-robin-three-processes"
      &&record?.completedTurns===6
      &&record?.turnHistory?.map(x=>x.process).join("")==="ABCACC"
      &&record?.runQueue?.length===0
      &&record?.realProcessesExecuted===false
      &&record?.realHardware===false
      &&record?.academicCredit===false,
    "Export asserted real scheduling or contained incorrect state",record);
  await page.locator('[data-systems-answer="B"]').click();
  check((await page.locator("[data-systems-quiz-status]").textContent()).includes("Correct."),
    "Process scheduling self-check failed");
  await bench.locator("[data-systems-reset]").click();
  check((await tick.textContent())==="0"&&(await queue.textContent())==="A → B → C"
    &&await next.isEnabled()&&(await bench.locator("[data-systems-history]").textContent()).includes("No scheduling turns"),
    "Scheduler reset failed");
  await page.locator("[data-study-text]").fill("Synthetic note: ready queue is A, B, C.");
  await page.locator("[data-study-save]").click();
  await page.reload({waitUntil:"load"});
  check((await page.locator("[data-study-text]").inputValue()).includes("A, B, C.")
    &&(await page.locator("[data-study-lesson]").getAttribute("data-study-lesson"))==="CFP-101-U07"
    &&(await page.locator("[data-systems-tick]").textContent())==="0",
    "Systems notebook or page-session persistence boundary incorrect");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Synthetic systems notebook was not cleared");
  await screenshot(page,"systems-mobile");
  console.log("ANEVUM_WEBKIT_SYSTEMS_LESSON_PASS",JSON.stringify({
    roundRobin:"A,B,C,A,C,C",completedDisabled:true,exportHonest:true,
    selfCheck:true,reset:true,notesPersist:true,sessionEphemeral:true,academicCredit:false
  }));
}

async function assemblyLesson(page){
  const route="/institute-preview/learn/cfp-101/assembly-code";
  const key="anevum.institute.study.v1.CFP-101-U06";
  await visit(page,route);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  const bench=page.locator("[data-assembly-bench]");
  const source=bench.locator("[data-assembly-source]");
  const machine=bench.locator("[data-assembly-machine]");
  const bits=bench.locator("[data-assembly-bits]");
  const result=bench.locator("[data-assembly-result]");
  const status=bench.locator("[data-assembly-status]");
  check((await bits.textContent())==="0010"&&(await source.inputValue())==="LOAD 2",
    "Instruction encoder failed initial state");
  await source.fill("LOAD 2");
  await source.press("Enter");
  check((await bits.textContent())==="0010"&&(await result.textContent())==="LOAD 2",
    "Enter key did not assemble LOAD 2");
  await source.fill("STORE 1");
  await source.press("Enter");
  check((await bits.textContent())==="0101"&&(await result.textContent())==="STORE 1",
    "Instruction encoding STORE 1 failed");
  await bench.locator('[data-assembly-example="ADD 3"]').click();
  check((await bits.textContent())==="1011"&&(await result.textContent())==="ADD 3",
    "Assembly example ADD 3 failed");
  await machine.fill("0110");
  await machine.press("Enter");
  check((await result.textContent())==="STORE 2"&&(await bits.textContent())==="0110",
    "Machine word did not decode as STORE 2");
  await bench.locator('[data-assembly-example="HALT"]').click();
  check((await bits.textContent())==="1100"&&(await result.textContent())==="HALT",
    "Canonical HALT encoding failed");
  const previous=(await bits.textContent());
  await machine.fill("1111");
  await machine.press("Enter");
  check((await bits.textContent())===previous&&(await status.textContent()).includes("Reserved encoding"),
    "Reserved HALT code must be rejected without overwriting valid output");
  await source.fill("LOAD 4");
  await source.press("Enter");
  check((await bits.textContent())===previous&&(await status.textContent()).includes("Assembly rejected"),
    "Invalid assembler operand must preserve last valid output");
  const recorded=await bench.evaluate(async root=>{
    const orig=URL.createObjectURL;
    let blob=null;
    const stop=e=>{if(e.target.closest("a[download]"))e.preventDefault();};
    document.addEventListener("click",stop,true);
    URL.createObjectURL=value=>{blob=value;return "blob:anevum-assembly-webkit";};
    try{
      root.querySelector("[data-assembly-export]").click();
      return blob?JSON.parse(await blob.text()):null;
    }finally{
      URL.createObjectURL=orig;
      document.removeEventListener("click",stop,true);
    }
  });
  check(recorded?.model==="fictional-four-bit-instruction-encoding"
      &&recorded?.recentConversions?.length===5
      &&recorded?.reservedEncodings?.includes("1111")
      &&recorded?.instructionsExecuted===false
      &&recorded?.realHardware===false
      &&recorded?.academicCredit===false,
    "Assembly export invented execution, research verification or an academic credential",recorded);
  await page.locator('[data-assembly-answer="0110"]').click();
  check((await page.locator("[data-assembly-quiz-status]").textContent()).includes("Correct."),
    "Assembly opcode self-check was incorrect");
  await page.locator("[data-assembly-clear]").click();
  check((await page.locator("[data-assembly-history]").textContent()).includes("No conversions recorded"),
    "Session conversion history was not cleared");
  await page.locator("[data-study-text]").fill("Synthetic note: STORE 2 maps to 0110.");
  await page.locator("[data-study-save]").click();
  await page.reload({waitUntil:"load"});
  check((await page.locator("[data-study-text]").inputValue()).includes("STORE 2")
      &&(await page.locator("[data-study-lesson]").getAttribute("data-study-lesson"))==="CFP-101-U06"
      &&(await page.locator("[data-assembly-history]").textContent()).includes("No conversions recorded"),
    "Notebook persistence or ephemeral assembly history is incorrect");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Synthetic assembly note was not removed");
  await screenshot(page,"assembly-mobile");
  console.log("ANEVUM_WEBKIT_ASSEMBLY_LESSON_PASS",JSON.stringify({
    keyboardAssembly:true,encoding:true,decoding:true,reservedRejected:true,
    invalidOperandRejected:true,exportHonest:true,selfCheck:true,
    noteRestored:true,sessionEphemeral:true,academicCredit:false
  }));
}

async function memoryLesson(page){
  const route="/institute-preview/learn/cfp-101/addressed-memory";
  const key="anevum.institute.study.v1.CFP-101-U05";
  await visit(page,route);
  await page.evaluate(key=>localStorage.removeItem(key),key);
  const bench=page.locator("[data-memory-bench]");
  const read=bench.locator("[data-memory-read]");
  const input=bench.locator("[data-memory-input]");
  const count=bench.locator("[data-memory-count]");
  check((await read.textContent())==="0000"&&(await input.textContent())==="0000"&&(await count.textContent())==="0",
    "Memory model did not initialize with four zero words");
  await bench.locator('[data-memory-address="2"]').click();
  await bench.locator('[data-memory-bit="0"]').click();
  await bench.locator('[data-memory-bit="2"]').click();
  check((await input.textContent())==="1010"&&(await read.textContent())==="0000",
    "Selecting write bits incorrectly changed stored data");
  await bench.locator("[data-memory-write]").click();
  check((await read.textContent())==="1010"&&(await count.textContent())==="1",
    "Explicit write to memory word 2 failed");
  await bench.locator('[data-memory-address="1"]').click();
  for(const bit of ["0","1","2","3"])await bench.locator('[data-memory-bit="'+bit+'"]').click();
  await bench.locator("[data-memory-write]").click();
  check((await read.textContent())==="0101"&&(await input.textContent())==="0101"
    &&(await count.textContent())==="2","Explicit write to memory word 1 failed");
  await bench.locator('[data-memory-address="2"]').click();
  const words=await bench.locator("[data-memory-cell]").allTextContents();
  check((await read.textContent())==="1010"&&words.join(",")==="0000,0101,1010,0000",
    "Writing a different address corrupted prior memory words",words);
  const exportRecord=await bench.evaluate(async root=>{
    const prior=URL.createObjectURL;
    let captured=null;
    const intercept=e=>{if(e.target.closest("a[download]"))e.preventDefault();};
    document.addEventListener("click",intercept,true);
    URL.createObjectURL=blob=>{captured=blob;return "blob:anevum-memory-webkit-fixture";};
    try{
      root.querySelector("[data-memory-export]").click();
      return captured?JSON.parse(await captured.text()):null;
    }finally{
      URL.createObjectURL=prior;
      document.removeEventListener("click",intercept,true);
    }
  });
  check(exportRecord?.model==="ideal-four-word-four-bit-addressed-memory"
    &&exportRecord?.writeCount===2&&exportRecord?.recentWrites?.length===2
    &&exportRecord?.memory?.[2]?.join("")==="1010"
    &&exportRecord?.independentlyVerified===false&&exportRecord?.academicCredit===false,
    "Export must preserve true model scope and data",exportRecord);
  await page.locator('[data-memory-answer="1010"]').click();
  check((await page.locator("[data-memory-quiz-status]").textContent()).includes("Correct."),
    "Memory address isolation self-check failed");
  await bench.locator("[data-memory-reset]").click();
  check((await read.textContent())==="0000"&&(await count.textContent())==="0"
    &&(await bench.locator("[data-memory-cell]").allTextContents()).every(s=>s==="0000"),
    "Memory teaching model reset failed");
  await page.locator("[data-study-text]").fill("Synthetic note: writing address 1 leaves address 2 unchanged.");
  await page.locator("[data-study-save]").click();
  await page.reload({waitUntil:"load"});
  check((await page.locator("[data-study-text]").inputValue()).includes("address 2 unchanged")
    &&(await page.locator("[data-study-lesson]").getAttribute("data-study-lesson"))==="CFP-101-U05"
    &&(await page.locator("[data-memory-count]").textContent())==="0",
    "Notebook restore or page-session reset is incorrect");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  check(await page.evaluate(key=>localStorage.getItem(key)===null,key),
    "Synthetic test notes must be cleared");
  await screenshot(page,"memory-mobile");
  console.log("ANEVUM_WEBKIT_MEMORY_LESSON_PASS",
    JSON.stringify({distinctAddresses:true,inputDoesNotWrite:true,explicitWrites:true,
      exportHonest:true,selfCheck:true,reset:true,notesPersist:true,academicCredit:false}));
}

async function registerLesson(page){
  await visit(page,"/institute-preview/learn/cfp-101/registers");
  const bench=page.locator("[data-register-bench]");
  const d=page.locator("[data-register-d]");
  const q=page.locator("[data-register-q]");
  const clock=page.locator("[data-register-count]");
  check((await d.textContent())==="0000"&&(await q.textContent())==="0000"
    &&(await clock.textContent())==="0","Register did not initialize");
  await bench.locator('[data-register-bit="0"]').click();
  await bench.locator('[data-register-bit="2"]').click();
  check((await d.textContent())==="1010"&&(await q.textContent())==="0000",
    "Input editing changed Q without clock event");
  await bench.locator("[data-register-clock]").click();
  check((await q.textContent())==="1010"&&(await clock.textContent())==="1",
    "Clock event did not sample the four-bit bus");
  await bench.locator('[data-register-bit="0"]').click();
  check((await d.textContent())==="0010"&&(await q.textContent())==="1010",
    "Stored Q did not hold after changing input D");
  const evidence=await bench.evaluate(async root=>{
    const original=URL.createObjectURL;
    let captured=null;
    const noDownload=e=>{if(e.target.closest("a[download]"))e.preventDefault();};
    document.addEventListener("click",noDownload,true);
    URL.createObjectURL=blob=>{captured=blob;return "blob:anevum-register-qa";};
    try{
      root.querySelector("[data-register-export]").click();
      return captured?JSON.parse(await captured.text()):null;
    }finally{
      URL.createObjectURL=original;
      document.removeEventListener("click",noDownload,true);
    }
  });
  check(evidence?.model==="ideal-four-bit-rising-edge-register"
    &&evidence?.clockEventCount===1&&evidence?.recentEvents?.length===1
    &&evidence?.recentEvents[0].q==="1010"
    &&evidence?.independentlyVerified===false&&evidence?.academicCredit===false,
    "Register notebook misrepresents its source or clock history",evidence);
  await page.locator('[data-register-answer="0011"]').click();
  check((await page.locator("[data-register-quiz-status]").textContent()).includes("Correct"),
    "Register knowledge check failed");
  await bench.locator("[data-register-reset]").click();
  check((await d.textContent())==="0000"&&(await q.textContent())==="0000"
    &&(await clock.textContent())==="0","Register reset did not clear session");
  await page.locator("[data-study-text]").fill("Synthetic note: Q holds between clock edges.");
  await page.locator("[data-study-save]").click();
  await page.reload({waitUntil:"load"});
  check((await page.locator("[data-study-text]").inputValue()).includes("Q holds")
    &&(await page.locator("[data-study-lesson]").getAttribute("data-study-lesson"))==="CFP-101-U04",
    "Fourth lesson notebook did not survive reload");
  await page.locator("[data-study-clear]").click();
  await page.locator("[data-study-clear]").click();
  await screenshot(page,"register-mobile");
  console.log("ANEVUM_WEBKIT_REGISTER_LESSON_PASS",
    JSON.stringify({inputHold:true,risingEdgeCapture:true,heldAfterInputChange:true,
      exportHonest:true,selfCheck:true,reset:true,notesPersist:true,academicCredit:false}));
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
  await studyUnsavedNavigation(phone);
  await studyNotePortability(phone);
  await halfAdder(phone);
  await registerLesson(phone);
  await memoryLesson(phone);
  await assemblyLesson(phone);
  await systemsLesson(phone);
  await cpuCapstone(phone);
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
    JSON.stringify({routes:38,touchMenu:true,registerLesson:true,memoryLesson:true,assemblyLesson:true,systemsLesson:true,cpuCapstone:true,studyNotesPreserved:true,unsavedNavigationGuard:true,portableNoteImport:true,halfAdderHandoff:true,
      ownerSafariAcceptance:false,publicDeployment:false}));
}finally{
  if(browser)await browser.close();
  if(server.exitCode===null)server.kill("SIGTERM");
}
