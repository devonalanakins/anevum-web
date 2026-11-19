import test from "node:test";
import assert from "node:assert/strict";
import {Script} from "node:vm";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {LAB_ART} from "../apps/anevum-public-studio/living-laboratory-art.mjs";
import worker from "../apps/anevum-institute-preview/worker.mjs";
import {CFP_101,validateCurriculum} from "../apps/anevum-institute-preview/curriculum.mjs";
import {evaluateHalfAdder,HALF_ADDER_LESSON_HTML} from "../apps/anevum-institute-preview/half-adder-lesson.mjs";
import {evaluateClockedRegister,REGISTER_LESSON_HTML} from "../apps/anevum-institute-preview/register-lesson.mjs";
import {emptyMemory,readMemoryWord,writeMemoryWord,MEMORY_LESSON_HTML} from "../apps/anevum-institute-preview/memory-lesson.mjs";
import {encodeToyInstruction,decodeToyInstruction,assembleToyLine,ASSEMBLY_LESSON_HTML} from "../apps/anevum-institute-preview/assembly-lesson.mjs";
import {CLUSTER_SCHEDULER_HTML} from "../apps/anevum-institute-preview/cluster-scheduler-ui.mjs";
import {CLUSTER_SCHEDULER_MODEL_BROWSER_MODULE} from "../apps/anevum-institute-preview/cluster-scheduler-model.mjs";
import {CLUSTER_SCHEDULER_CSS} from "../apps/anevum-institute-preview/cluster-scheduler-styles.mjs";
import {NEURON_LIF_HTML} from "../apps/anevum-institute-preview/neuron-lif-ui.mjs";
import {NEURON_LIF_MODEL_BROWSER_MODULE} from "../apps/anevum-institute-preview/neuron-lif-model.mjs";
import {NEURON_LIF_CSS} from "../apps/anevum-institute-preview/neuron-lif-styles.mjs";
import {studyToolsHtml} from "../apps/anevum-institute-preview/study-tools.mjs";
import {dossierPage} from "../apps/anevum-institute-preview/dossier-ui.mjs";
import {localStudioPage,localProfilePage} from "../apps/anevum-institute-preview/learner-ui.mjs";
import {LOCAL_MEMBER_CLIENT} from "../apps/anevum-institute-preview/local-member-client.mjs";
import {LOCAL_MEMBER_BROWSER_MODULE} from "../apps/anevum-institute-preview/local-member-schema.mjs";
import {EVIDENCE_BROWSER_MODULE,EVIDENCE_FORMAT,validateHalfAdderNotebook,evidenceFromHalfAdderNotebook} from "../apps/anevum-institute-preview/evidence-schema.mjs";
import {FRONTIER_GL_CLIENT} from "../apps/anevum-institute-preview/frontier-gl.mjs";
import {frontierHome,frontierRecognition,RECOGNITION_POLICY,FRONTIER_MEDIA,FRONTIER_REVIEW_ART,FACILITY_DESIGN_ART,frontierMediaMarkup} from "../apps/anevum-institute-preview/frontier-society.mjs";

const BASE="https://anevum.com/institute-preview";
const PATHS=["","/research","/recognition","/dossier","/studio","/profile","/academy","/academy/cfp-101","/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates","/learn/cfp-101/half-adders","/learn/cfp-101/registers","/learn/cfp-101/addressed-memory","/learn/cfp-101/assembly-code","/laboratory/and-gate","/laboratory/cluster-scheduling","/laboratory/neuron-dynamics"];
const req=(path="",init={})=>worker.fetch(new Request(BASE+path,init));

test("owner Safari release checklist matches implemented preview and makes no release claim",async()=>{
  const guide=await readFile(new URL("../docs/qa/ANEVUM.WEB.QA.2026-11-18.022.OWNER-SAFARI-ACCEPTANCE.md",import.meta.url),"utf8");
  assert.match(guide,/17 routes/);
  assert.match(guide,/CFP-101 introductory lessons U01–U06/);
  assert.match(guide,/U07–U08 remain planned/);
  assert.match(guide,/institute-pr-816-anevum-web-nextgen\.devonakins\.workers\.dev\/institute-preview/);
  assert.match(guide,/authenticate with the preexisting owner identity/);
  assert.match(guide,/all four A\/B combinations/);
  assert.match(guide,/does \*\*not\*\* change saved drafts before selecting \*\*Apply\*\*/);
  assert.match(guide,/\*\*PENDING\*\*/);
  assert.match(guide,/NO-GO/);
  assert.match(guide,/Do not enter client\/patient records/);
  assert.ok(guide.includes('is **not** a public production site'));
  assert.match(guide,/V5 separate beta workers.dev availability/);
  assert.doesNotMatch(guide,/\b(iPhone Safari|actual owner acceptance) (?:is|was) (?:approved|completed|verified)\b/i);
});

test("seventeen isolated pages have accurate titles, landmarks, and noindex headers",async()=>{
  for(const path of PATHS){
    const response=await req(path);
    assert.equal(response.status,200,path);
    assert.equal(response.headers.get("Content-Type"),"text/html; charset=utf-8");
    assert.equal(response.headers.get("X-Anevum-Surface"),"open-institute-design-review-v1");
    assert.match(response.headers.get("Content-Security-Policy"),/default-src 'none'/);
    assert.match(response.headers.get("Content-Security-Policy"),/connect-src 'none'/);
    assert.match(response.headers.get("Content-Security-Policy"),/media-src 'self'/);
    assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
    const html=await response.text();
    assert.match(html,/<html lang="en">/);
    assert.match(html,/<meta name="viewport"/);
    assert.match(html,/<main id="main" tabindex="-1"/);
    assert.match(html,/<a class="skip" href="#main">Skip to main content/);
    assert.match(html,/<nav class="desk-nav" aria-label="Primary navigation">/);
    assert.match(html,/<details class="mobile-menu">/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,"Exactly one H1: "+path);
    assert.match(html,/independent, non-accredited open-education and research project/i);
    assert.match(html,/Not a public launch/);
    assert.doesNotMatch(html,/<iframe|<form\b|onload=|onclick=|<script(?! defer src=)/i);
    assert.doesNotMatch(html,/patient records|OpenAI API key|university degrees awarded/i);
  }
});

test("every relative institute navigation link resolves within the preview",async()=>{
  const known=new Set(PATHS.map(path=>"/institute-preview"+path));
  known.add("/institute-preview/");
  known.add("/institute-preview/curriculum/cfp-101.json");
  for(const path of PATHS){
    const html=await(await req(path)).text();
    const links=[...html.matchAll(/<a[^>]*\bhref="(\/institute-preview(?:\/[^"#]*)?)"/g)].map(m=>m[1]);
    assert.ok(links.length>=6,"No meaningful links in "+path);
    for(const link of links){
      assert.ok(known.has(link),"Unreachable link on "+path+": "+link);
    }
  }
});

test("Academy advertises only implemented curriculum lessons and real simulated laboratories",async()=>{
  const html=await(await req("/academy")).text();
  const lessonPaths=CFP_101.units.filter(unit=>unit.availability==="preview");
  assert.equal(lessonPaths.length,6);
  assert.match(html,/data-study-path aria-labelledby="academy-available-title"/);
  assert.match(html,/6 available previews \/ 2 planned units/);
  assert.equal((html.match(/class="academy-unit-link"/g)||[]).length,6);
  for(const unit of lessonPaths){
    assert.ok(html.includes('href="/institute-preview'+unit.lessonPath+'"'),"Missing implemented lesson "+unit.id);
    assert.ok(html.includes('data-study-path-status="'+unit.id+'"'),"Missing honest practice marker "+unit.id);
    assert.ok(html.includes(unit.title),"Lesson name must derive from the curriculum");
  }
  for(const unit of CFP_101.units.filter(unit=>unit.availability==="planned")){
    assert.ok(!html.includes('href="/institute-preview'+(unit.lessonPath||'/no-route')+'"'),"Planned lessons cannot be linked");
  }
  assert.equal((html.match(/class="academy-lab-item"/g)||[]).length,3);
  for(const path of ["/laboratory/and-gate","/laboratory/cluster-scheduling","/laboratory/neuron-dynamics"]){
    assert.ok(html.includes('href="/institute-preview'+path+'"'),"Missing working laboratory "+path);
  }
  assert.match(html,/Local practice only · No course credit or verified completion/);
  assert.match(html,/No physical equipment/);
  assert.match(html,/These groupings are proposed—not operational faculties/);
  assert.doesNotMatch(html,/<canvas\b|<video\b|<picture\b/i);
});

test("course availability and educational boundaries are explicit",async()=>{
  const catalog=await(await req("/academy")).text();
  const course=await(await req("/academy/cfp-101")).text();
  const lesson=await(await req("/learn/cfp-101/logic-gates")).text();
  assert.match(catalog,/Explore transistor switching, Boolean logic, binary arithmetic, clocked registers, addressed memory and fictional machine-code encoding/i);
  assert.match(catalog,/not operational faculties/i);
  assert.match(course,/curriculum in development/i);
  assert.equal((course.match(/Study this lesson/g)||[]).length,6);
  assert.ok(course.indexOf("Semiconductors and transistor switching")<course.indexOf("Binary logic and gates"),"Transistors-first syllabus order");
  assert.match(lesson,/Q = A ∧ B/);
  assert.match(lesson,/2² = 4/);
  assert.match(lesson,/N = NOT\(A AND B\)/);
  assert.match(lesson,/Q = NOT\(N\) = A AND B/);
  assert.match(lesson,/data-answer="and"/);
  assert.match(lesson,/data-local-progress/);
  assert.match(lesson,/not a transistor-level SPICE simulation/);
});


test("Unit03 half-adder model and route are true to their mathematical and review scope",async()=>{
  const cases=[[0,0,{sum:0,carry:0}],[0,1,{sum:1,carry:0}],[1,0,{sum:1,carry:0}],[1,1,{sum:0,carry:1}]];
  for(const [a,b,result] of cases){
    assert.deepEqual(evaluateHalfAdder(a,b),result);
    assert.equal(a+b,result.sum+2*result.carry,"binary arithmetic invariant");
  }
  for(const pair of [[2,0],[0,2],[-1,1],[null,1],["1",0],[0,undefined],[0.5,1]]){
    assert.throws(()=>evaluateHalfAdder(...pair),TypeError);
  }
  assert.match(HALF_ADDER_LESSON_HTML,/S = A ⊕ B/);
  assert.match(HALF_ADDER_LESSON_HTML,/C = A ∧ B/);
  const response=await req("/learn/cfp-101/half-adders");
  assert.equal(response.status,200);
  const html=await response.text();
  for(const token of ["CFP-101-U03","data-half-adder","data-half-input=\"a\"","data-half-input=\"b\"","data-half-sum","data-half-carry","data-half-export","data-half-reset","data-half-quiz-status","data-study-lesson=\"CFP-101-U03\""]){
    assert.ok(html.includes(token),"Missing half-adder lesson control: "+token);
  }
  assert.equal((html.match(/data-half-row="(?:00|01|10|11)"/g)||[]).length,4);
  assert.match(html,/no network request/i);
  assert.match(html,/not a verified physical schematic|not a physical/i);
  assert.match(html,/nand2tetris\.org\/project02/);
  assert.match(html,/ocw\.mit\.edu\/courses\/6-004/);
  assert.match(html,/independently inspectable|independent review|independently verified/i);
  assert.doesNotMatch(html,/accredited degree|measured voltage|power in watts/i);
});

test("Unit04 register model implements clocked hold and capture without hardware claims",async()=>{
  const cases=[
    {q:[0,0,0,0],d:[1,0,1,0],edge:false,want:[0,0,0,0]},
    {q:[0,0,0,0],d:[1,0,1,0],edge:true,want:[1,0,1,0]},
    {q:[1,1,0,0],d:[0,0,1,1],edge:false,want:[1,1,0,0]},
    {q:[1,1,0,0],d:[0,0,1,1],edge:true,want:[0,0,1,1]}
  ];
  for(const {q,d,edge,want} of cases){
    const beforeQ=q.slice(),beforeD=d.slice();
    const result=evaluateClockedRegister(q,d,edge);
    assert.deepEqual(result,want);
    assert.notEqual(result,q,"Register results must not alias current state");
    assert.notEqual(result,d,"Register results must not alias input data");
    assert.deepEqual(q,beforeQ);assert.deepEqual(d,beforeD);
  }
  for(const [q,d,edge] of [
    [[0,0,0],[0,0,0,0],true],[[0,0,0,0],[0,1,2,0],true],
    [[0,0,0,0],["1",0,0,0],true],[[0,0,0,0],[0,0,0,0],"true"],
    [null,[0,0,0,0],false]
  ])assert.throws(()=>evaluateClockedRegister(q,d,edge),TypeError);
  assert.match(REGISTER_LESSON_HTML,/Q\(next\) = D at ↑CLK; otherwise Q\(next\) = Q/);
  const resp=await req("/learn/cfp-101/registers");
  assert.equal(resp.status,200);
  const html=await resp.text();
  for(const token of ["CFP-101-U04","data-register-bench","data-register-clock","data-register-reset","data-register-export","data-register-q","data-register-d","data-register-count","data-register-history","data-register-quiz","data-study-lesson=\"CFP-101-U04\""]){
    assert.ok(html.includes(token),"Missing register workbench token "+token);
  }
  assert.equal((html.match(/data-register-bit="[0-3]"/g)||[]).length,4);
  assert.match(html,/setup and hold requirements/);
  assert.match(html,/metastable behavior/);
  assert.match(html,/not a Research Desk submission/);
  assert.match(html,/not independently validated|not measured|not a physical|no physical/i);
  assert.doesNotMatch(html,/real clock frequency|measured nanoseconds|accredited degree/i);
  const client=await(await req("/client.js")).text();
  assert.match(client,/q=d\.slice\(\);cycles\+\+/);
  assert.match(client,/status\.textContent="D changed to "/);
  assert.match(client,/data-register-clock/);
  assert.match(client,/data-register-export/);
  assert.match(client,/clockEventCount:cycles/);
  assert.match(client,/independentlyVerified:false,academicCredit:false/);
});

test("Unit05 ideal addressed-memory model preserves untouched words, rejects invalid data and stays uncredentialed",async()=>{
  const zero=emptyMemory();
  assert.deepEqual(zero,[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]);
  assert.notEqual(zero[0],zero[1],"Separate memory words must never alias");
  const first=writeMemoryWord(zero,2,[1,0,1,0]);
  const second=writeMemoryWord(first,1,[0,1,0,1]);
  assert.deepEqual(readMemoryWord(second,2),[1,0,1,0]);
  assert.deepEqual(readMemoryWord(second,1),[0,1,0,1]);
  assert.deepEqual(readMemoryWord(second,0),[0,0,0,0]);
  assert.deepEqual(readMemoryWord(second,3),[0,0,0,0]);
  assert.deepEqual(zero[2],[0,0,0,0],"Writes must not mutate the source array");
  assert.deepEqual(first[1],[0,0,0,0],"First write must not alter other addresses");
  const result=readMemoryWord(second,2);
  result[0]=0;
  assert.deepEqual(readMemoryWord(second,2),[1,0,1,0],"Read data must not alias saved memory");
  for(const address of [-1,4,1.5,"2",null,undefined,NaN,Infinity]){
    assert.throws(()=>readMemoryWord(second,address),RangeError);
    assert.throws(()=>writeMemoryWord(second,address,[0,0,0,0]),RangeError);
  }
  for(const word of [[1,0,1],[1,0,1,2],["1",0,1,0],null,0,[true,0,1,0]]){
    assert.throws(()=>writeMemoryWord(second,1,word),TypeError);
  }
  for(const memory of [null,[],[[]],[[0,0,0,0]],[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,2]]]){
    assert.throws(()=>readMemoryWord(memory,0),TypeError);
  }
  assert.match(MEMORY_LESSON_HTML,/4 × 4 = 16 bits/);
  const page=await req("/learn/cfp-101/addressed-memory");
  assert.equal(page.status,200);
  const html=await page.text();
  for(const token of ["CFP-101-U05","data-memory-bench","data-memory-address=\"2\"","data-memory-bit=\"0\"","data-memory-write","data-memory-reset","data-memory-export","data-memory-read","data-memory-cell","data-memory-quiz","data-study-lesson=\"CFP-101-U05\""]){
    assert.ok(html.includes(token),"Missing learning control "+token);
  }
  assert.equal((html.match(/data-memory-address="[0-3]"/g)||[]).length,4);
  assert.equal((html.match(/data-memory-bit="[0-3]"/g)||[]).length,4);
  assert.match(html,/not physical SRAM or DRAM/);
  assert.match(html,/does not implement an ISA, instruction decoder/);
  assert.match(html,/not a Research Desk submission/);
  assert.doesNotMatch(html,/real RAM benchmark|accredited degree|measured latency/i);
  const client=await(await req("/client.js")).text();
  assert.match(client,/memory\[address\]=data\.slice\(\);writes\+\+/);
  assert.match(client,/data-memory-write/);
  assert.match(client,/data-memory-export/);
  assert.match(client,/independentlyVerified:false,academicCredit:false/);
  assert.match(client,/model:"ideal-four-word-four-bit-addressed-memory"/);
  assert.match(client,/recentWrites:history\.slice\(\)/);
});

test("Unit06 fictional four-bit assembly encodes, decodes and rejects reserved machine words",async()=>{
  const expected={
    LOAD:["0000","0001","0010","0011"],
    STORE:["0100","0101","0110","0111"],
    ADD:["1000","1001","1010","1011"]
  };
  let valid=0;
  for(const [name,words] of Object.entries(expected)){
    for(let address=0;address<4;address++){
      const bits=encodeToyInstruction(name,address);
      assert.equal(bits,words[address],name+" "+address);
      assert.equal(assembleToyLine(name+" "+address),bits);
      assert.equal(assembleToyLine("  "+name.toLowerCase()+"  "+address+"  "),bits);
      assert.deepEqual(decodeToyInstruction(bits),{
        bits,opcodeBits:bits.slice(0,2),operandBits:bits.slice(2),
        mnemonic:name,address,assembly:name+" "+address
      });
      valid++;
    }
  }
  assert.equal(valid,12);
  assert.equal(encodeToyInstruction("HALT"),"1100");
  assert.equal(assembleToyLine(" halt "),"1100");
  assert.deepEqual(decodeToyInstruction("1100"),{
    bits:"1100",opcodeBits:"11",operandBits:"00",mnemonic:"HALT",address:null,assembly:"HALT"
  });
  for(const bits of ["1101","1110","1111"])assert.throws(()=>decodeToyInstruction(bits),RangeError);
  for(const bits of ["","001","00101","abcd","0020"," 0010 ",0,null,undefined,"1100\n"])
    assert.throws(()=>decodeToyInstruction(bits),TypeError);
  for(const assembly of ["LOAD","STORE 4","LOAD -1","ADD 3 garbage","HALT 0","NOP 2","","LOAD 1\nHALT",null,42,"x".repeat(33)])
    assert.throws(()=>assembleToyLine(assembly),{name:/TypeError|RangeError/});
  for(const [mnemonic,address] of [["LOAD",null],["ADD",4],["STORE",-1],["STORE","1"],["HALT",0],["BOGUS",1]])
    assert.throws(()=>encodeToyInstruction(mnemonic,address),RangeError);
  assert.match(ASSEMBLY_LESSON_HTML,/fictional 4-bit instruction format/);
  assert.match(ASSEMBLY_LESSON_HTML,/13 valid code words/);
  assert.match(ASSEMBLY_LESSON_HTML,/does not provide a CPU/);
  const resp=await req("/learn/cfp-101/assembly-code");
  assert.equal(resp.status,200);
  const html=await resp.text();
  for(const token of ["CFP-101-U06","data-assembly-bench","data-assembly-form","data-assembly-source","data-assembly-machine","data-assembly-decode-form","data-assembly-example=\"HALT\"","data-assembly-export","data-assembly-history","data-assembly-quiz","data-study-lesson=\"CFP-101-U06\""]){
    assert.ok(html.includes(token),"Missing assembly control "+token);
  }
  assert.equal((html.match(/data-assembly-example=/g)||[]).length,4);
  assert.equal((html.match(/data-assembly-answer=/g)||[]).length,3);
  assert.match(html,/does not fetch instructions, add numbers, alter memory or run programs/);
  assert.match(html,/not an industry-standard ISA, an assembler for real hardware, a secure executable/i);
  assert.doesNotMatch(html,/physical assembly execution|real instruction benchmark|accredited degree/i);
  const js=await(await req("/client.js")).text();
  assert.match(js,/data-assembly-encode/);
  assert.match(js,/data-assembly-decode/);
  assert.match(js,/source\.addEventListener\("keydown"/);
  assert.match(js,/machine\.addEventListener\("keydown"/);
  assert.doesNotMatch(html,/<form\b/i);
  assert.match(js,/Reserved encoding: HALT requires operand 00/);
  assert.match(js,/instructionsExecuted:false,realHardware:false/);
  assert.match(js,/independentlyVerified:false,academicCredit:false/);
});

test("transistor switching lesson teaches ideal complementary inversion with accessible active controls",async()=>{
  const response=await req("/learn/cfp-101/transistor-switching");
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/From matter to <em>switching\.<\/em>/);
  assert.match(html,/Q = NOT\(A\)/);
  assert.match(html,/pMOS pull-up/);
  assert.match(html,/nMOS pull-down/);
  assert.match(html,/data-inverter-demo/);
  assert.match(html,/data-inverter-toggle/);
  assert.match(html,/data-inverter-answer="low"/);
  assert.match(html,/id="inverter-feedback" role="status" aria-live="polite"/);
  assert.match(html,/real inverter has a continuous voltage-transfer characteristic/i);
  assert.match(html,/ocw\.mit\.edu\/courses\/6-012-/);
  assert.doesNotMatch(html,/measured [0-9]+ volts|accredited degree|real laboratory equipment/i);
});

test("versioned curriculum JSON is portable, accurate and fail-closed on invalid metadata",async()=>{
  const response=await req("/curriculum/cfp-101.json");
  assert.equal(response.status,200);
  assert.equal(response.headers.get("Content-Type"),"application/json; charset=utf-8");
  assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
  const manifest=JSON.parse(await response.text());
  assert.deepEqual(manifest,CFP_101);
  assert.equal(validateCurriculum(manifest).length,0);
  assert.equal(manifest.schemaVersion,1);
  assert.equal(manifest.editorialStatus,"draft");
  assert.equal(manifest.accreditation,"none");
  assert.equal(manifest.units.length,8);
  assert.deepEqual(manifest.units.filter(unit=>unit.availability==="preview").map(unit=>unit.lessonPath),[
    "/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates","/learn/cfp-101/half-adders","/learn/cfp-101/registers","/learn/cfp-101/addressed-memory","/learn/cfp-101/assembly-code"
  ]);
  assert.equal(manifest.units.filter(unit=>unit.availability==="planned").length,2);
  const manifestPage=await(await req("/academy/cfp-101")).text();
  assert.match(manifestPage,/Download portable curriculum metadata/);
  assert.match(manifestPage,/version 0\.6\.0/);
  const invalid=structuredClone(manifest);
  invalid.units[6].availability="preview";
  assert.ok(validateCurriculum(invalid).some(error=>error.includes("Lesson availability mismatch")));
  const badPrerequisite=structuredClone(manifest);
  badPrerequisite.units[0].prerequisites=["CFP-101-U02"];
  assert.ok(validateCurriculum(badPrerequisite).some(error=>error.includes("Prerequisites must name earlier units")));
  const duplicate=structuredClone(manifest);
  duplicate.units[1].lessonPath=duplicate.units[0].lessonPath;
  assert.ok(validateCurriculum(duplicate).some(error=>error.includes("Duplicate lesson path")));
  assert.ok(validateCurriculum({schemaVersion:1,id:"CFP-101",version:"0.3.0",status:"preview",units:[{availability:"preview"}]}).length>0);
});

test("Learning Studio exposes independently keyed, accessible local notebooks for all six lessons",async()=>{
  assert.throws(()=>studyToolsHtml("CFP-101-U07"),/Unsupported or unreviewed/);
  const a=await (await req("/learn/cfp-101/transistor-switching")).text();
  const b=await (await req("/learn/cfp-101/logic-gates")).text();
  const c=await (await req("/learn/cfp-101/half-adders")).text();
  const d=await (await req("/learn/cfp-101/registers")).text();
  const e=await (await req("/learn/cfp-101/addressed-memory")).text();
  const ff=await (await req("/learn/cfp-101/assembly-code")).text();
  for(const [html,key] of [[a,"CFP-101-U01"],[b,"CFP-101-U02"],[c,"CFP-101-U03"],[d,"CFP-101-U04"],[e,"CFP-101-U05"],[ff,"CFP-101-U06"]]){
    assert.match(html,new RegExp('data-study-lesson="'+key+'"'));
    assert.match(html,/data-study-save/);
    assert.match(html,/data-study-import/);
    assert.match(html,/data-study-import-apply hidden/);
    assert.match(html,/Bring back exported notes for this lesson/);
    assert.match(html,/your current text and saved notes stay unchanged until you explicitly apply/i);
    assert.match(html,/data-study-download/);
    assert.match(html,/data-study-bookmark aria-pressed="false"/);
    assert.match(html,/data-study-clear/);
    assert.match(html,/data-study-status role="status" aria-live="polite"/);
    assert.match(html,/not encrypted or synced/);
    assert.match(html,/Bookmarking also saves the text currently in the editor/);
    assert.match(html,/In-site links ask before discarding unsaved edits/);
    assert.match(html,/browser close or app switch warnings may not appear on mobile Safari/);
    assert.match(html,/maxlength="8000"/);
    assert.equal((html.match(/class="study-notes"/g)||[]).length,1,"A lesson must have exactly one local notebook");
  }
  assert.doesNotMatch(a,/data-study-lesson="CFP-101-U02"/);
  assert.doesNotMatch(b,/data-study-lesson="CFP-101-U01"/);
  assert.doesNotMatch(c,/data-study-lesson="CFP-101-U01"/);
  assert.doesNotMatch(c,/data-study-lesson="CFP-101-U02"/);
  const client=await (await req("/client.js")).text();
  assert.match(client,/var persistedNote=initial\.note/);
  assert.match(client,/function hasUnsavedStudyNotes\(\)/);
  assert.match(client,/window\.addEventListener\("beforeunload"/);
  assert.match(client,/window\.confirm\("You have unsaved lesson notes/);
  assert.match(client,/link\.hasAttribute\("download"\)/);
  assert.match(client,/target\.origin===location\.origin&&target\.pathname===location\.pathname/);
  assert.match(client,/Navigation cancelled\. Save notes/);
  assert.match(client,/textarea\.addEventListener\("input"/);
  assert.match(client,/Unsaved notes\. Select Save notes or Bookmark this lesson/);
  assert.match(client,/var current=textarea\?textarea\.value\.slice\(0,8000\):""/);
  assert.doesNotMatch(client,/writeNotes\(saved\.note,next\)/);
  assert.match(client,/function clearStagedNotesImport\(\)\{[\s\S]*?importRequest\+\+/);
  assert.match(client,/clearStagedNotesImport\(\);\s*var request=importRequest/);
  assert.match(client,/if\(request!==importRequest\)return/);
  assert.match(client,/if\(importInput\)importInput\.value=""/);
  assert.match(client,/importInput\.addEventListener\("change",async function/);
  assert.match(client,/file\.size>40960/);
  assert.match(client,/raw\.startsWith\(prefix\)/);
  assert.match(client,/raw\.endsWith\("\\n"\)/);
  assert.match(client,/imported\.length>8000/);
  assert.match(client,/importApply\.addEventListener\("click",function/);
  assert.match(client,/Imported notes applied to editor, not saved/);
  assert.doesNotMatch(client,/localStorage\.setItem\(key,stagedImportedNotes\)/);
  const css=await(await req("/styles.css")).text();
  assert.match(css,/\.study-import \[data-study-import-apply\]\[hidden\]\{display:none!important\}/);
});

test("Six CFP-101 readers expose curriculum-grounded navigation without invented completion",async()=>{
  const pages=[
    ["/learn/cfp-101/transistor-switching","CFP-101-U01"],
    ["/learn/cfp-101/logic-gates","CFP-101-U02"],
    ["/learn/cfp-101/half-adders","CFP-101-U03"],
    ["/learn/cfp-101/registers","CFP-101-U04"],
    ["/learn/cfp-101/addressed-memory","CFP-101-U05"],
    ["/learn/cfp-101/assembly-code","CFP-101-U06"]
  ];
  for(const [path,id] of pages){
    const response=await req(path);
    assert.equal(response.status,200);
    const html=await response.text();
    assert.equal((html.match(/data-study-path(?: |\>)/g)||[]).length,1);
    assert.match(html,/aria-label="CFP-101 available lesson navigation"/);
    assert.equal((html.match(/class="study-path-link"/g)||[]).length,6);
    assert.equal((html.match(/aria-current="page"/g)||[]).length,3,"Expected desktop and mobile mast navigation plus current lesson");
    assert.match(html,/This is not a course completion record or academic credit/);
    assert.match(html,/Two units remain in development/);
    assert.match(html,/data-study-path-progress/);
    for(const [otherPath,otherId] of pages){
      assert.ok(html.includes('href="/institute-preview'+otherPath+'"'),"Missing lesson "+otherId);
      assert.ok(html.includes('data-study-path-status="'+otherId+'"'),"Missing practice status "+otherId);
    }
    assert.ok(html.includes('aria-current="page" href="/institute-preview'+path+'"'),"Current lesson marker missing");
    assert.ok(html.includes('data-study-lesson="'+id+'"'),"Notes must exist for "+id);
  }
  const js=await (await req("/client.js")).text();
  assert.ok(js.includes('/^CFP-101-U0[123456]$/'),"All six local notebooks must be initialized");
  assert.match(js,/data-study-path-status/);
  assert.match(js,/Lessons U03–U06 remain untracked/);
  const css=await (await req("/styles.css")).text();
  assert.match(css,/\.study-path-links\{list-style:none/);
  assert.match(css,/@media\(max-width:420px\)\{\.study-path-links\{grid-template-columns:1fr\}/);
});

test("frontier society and evidence-based recognition distinguish working activities from future claims",async()=>{
  const home=await(await req("")).text();
  const recognition=await(await req("/recognition")).text();
  assert.match(home,/An open institute for <em>serious inquiry/);
  assert.match(home,/Explore the academic catalogue/);
  assert.match(home,/Computing From First Principles/);
  assert.match(home,/6 lessons available/);
  assert.match(home,/2 units in development/);
  assert.match(home,/class="academic-pathways"/);
  assert.match(home,/href="\/institute-preview\/laboratory\/cluster-scheduling"/);
  assert.match(home,/href="\/institute-preview\/laboratory\/neuron-dynamics"/);
  assert.match(home,/href="\/institute-preview\/dossier"/);
  assert.match(home,/Proposed fields · Not operating faculties/);
  assert.match(home,/non-accredited/i);
  assert.match(home,/no degrees or academic credit are currently issued/i);
  assert.match(home,/data-area="society"/);
  assert.doesNotMatch(home,/<canvas\b|<picture\b|<video\b|data-frontier-visual|facility-concept-v2|generated-facility-v2-review/i);
  assert.match(recognition,/Your work should speak/);
  assert.match(recognition,/data-evidence-panel/);
  assert.match(recognition,/data-evidence-count/);
  assert.match(recognition,/data-evidence-activity="transistor"/);
  assert.match(recognition,/data-evidence-activity="lesson"/);
  assert.match(recognition,/data-evidence-activity="experiment"/);
  assert.match(recognition,/No external awards, institutional credentials, or member accounts are issued/);
  assert.match(recognition,/independent critique/i);
  assert.deepEqual(RECOGNITION_POLICY.evidenceStages,["practice","artifact","review","replication"]);
  assert.equal(RECOGNITION_POLICY.awardsIssued,false);
  assert.equal(RECOGNITION_POLICY.profilesEnabled,false);
  assert.equal(RECOGNITION_POLICY.reviewEnabled,false);
  assert.equal(FRONTIER_MEDIA.assetsBundled,false);
  assert.equal(FRONTIER_REVIEW_ART.previewEnabled,false);
  assert.equal(FACILITY_DESIGN_ART.previewEnabled,true);
  assert.equal(FACILITY_DESIGN_ART.ownerApproved,false);
  assert.equal(FACILITY_DESIGN_ART.desktop.width,1672);
  assert.equal(FACILITY_DESIGN_ART.mobile.width,720);
  assert.equal(FRONTIER_REVIEW_ART.productionApproved,false);
  assert.equal(FRONTIER_MEDIA.ownerApproved,false);
  assert.match(FRONTIER_MEDIA.desktop.name,/\.webp$/);
  assert.match(FRONTIER_MEDIA.overlay.name,/\.mp4$/);
  assert.match(FRONTIER_MEDIA.desktop.sha256,/^[a-f0-9]{64}$/);
  assert.match(FRONTIER_MEDIA.overlay.sha256,/^[a-f0-9]{64}$/);
  assert.match(frontierMediaMarkup("/institute-preview"),/class="frontier-facility-art"/);
  assert.doesNotMatch(frontierHome("/institute-preview"),/observatory-review-desktop\.webp|observatory-review-mobile\.webp/);
  assert.match(frontierMediaMarkup("/institute-preview"),/data-frontier-gl/);
  // Old visual source remains in Git history/preview source but is not requested
  // or rendered by the new institutional homepage.
  assert.match(frontierHome("/institute-preview"),/data-art-source="generated-facility-v2-review"/);
  assert.doesNotMatch(home,/frontier-cavern-desktop\.webp|facility-concept-v2-desktop\.webp/);
  assert.match(frontierHome("/institute-preview"),/href="\/institute-preview\/academy/);
  assert.match(frontierRecognition("/institute-preview"),/data-evidence-panel/);
  assert.doesNotMatch(home+recognition,/<form\b|<iframe|onclick=|onload=|download=".*certificate"/i);
});

test("academic homepage and catalogue use honest institution-style navigation without generated art",async()=>{
  const home=await(await req("")).text();
  const academy=await(await req("/academy")).text();
  const css=await(await req("/styles.css")).text();
  assert.match(home,/<title>The Open Institute — ANEVUM Open Institute/);
  assert.match(home,/The Open Institute<\/span>/);
  assert.match(home,/>Institute<\/a>/);
  assert.match(home,/>Academics<\/a>/);
  assert.match(home,/>Laboratories<\/a>/);
  assert.match(home,/>Research<\/a>/);
  assert.match(home,/class="academic-study-card"/);
  assert.equal((home.match(/class="academic-offering"/g)||[]).length,3);
  assert.equal((home.match(/<li><span>0[1-6]<\/span>/g)||[]).length,6);
  assert.doesNotMatch(home,/<img[^>]+(?:facility|observatory|hero)|<canvas\b|<video\b/);
  assert.match(academy,/not operational faculties/i);
  assert.match(css,/\.academic-study-card/);
  assert.match(css,/\.academic-offering-grid/);
  assert.match(css,/\.dossier-import-hub/);
  assert.match(css,/\.neuron-chart-wrap/);
  assert.match(css,/\.cluster-/);
  assert.match(css,/\.page-hero::before\{content:none!important/);
  assert.match(css,/body\[data-area="society"\],body\[data-area="academy"\],body\[data-area="course"\]/);
  assert.doesNotMatch(css.slice(css.lastIndexOf("ANEVUM — academic design layer.")),/background-image:url|background:url/);
});

test("working private learner workspace and profile expose real known course, notes and identity controls",async()=>{
  const studio=await(await req("/studio")).text();
  const profile=await(await req("/profile")).text();
  assert.equal(localStudioPage("/institute-preview").includes("data-member-studio"),true);
  assert.equal(localProfilePage("/institute-preview").includes("data-member-profile"),true);
  assert.match(studio,/data-studio-meter/);
  assert.match(studio,/data-studio-resume/);
  assert.match(studio,/data-studio-evidence-state/);
  assert.match(studio,/CFP-101-U02/);
  assert.match(studio,/Five additional units remain unpublished/);
  assert.match(studio,/private|Private/);
  assert.match(profile,/data-member-field="displayName"/);
  assert.match(profile,/data-member-field="tagline"/);
  assert.match(profile,/data-member-save/);
  assert.match(profile,/data-member-export/);
  assert.match(profile,/data-member-import/);
  assert.match(profile,/data-member-delete/);
  assert.match(profile,/data-member-interests/);
  assert.match(profile,/unpublished/i);
  for(const path of ["/local-member-schema.js","/local-member-client.js"]){
    const response=await req(path);
    assert.equal(response.status,200);
    assert.equal(response.headers.get("Content-Type"),"text/javascript; charset=utf-8");
    assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
    const js=await response.text();
    assert.match(js,/export |import /,"Expected a real same-origin JavaScript module: "+path);
  }
  assert.match(LOCAL_MEMBER_BROWSER_MODULE,/parseMemberCard/);
  assert.match(LOCAL_MEMBER_CLIENT,/textContent/);
  assert.doesNotMatch(LOCAL_MEMBER_CLIENT,/innerHTML|fetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
  for(const path of ["/member","/members","/profile/public","/api/member","/api/learning","/api/credentials"]){
    assert.equal((await req(path)).status,404,path);
  }
});

test("personal research dossier provides real editor controls without exposing protected membership operations",async()=>{
  const response=await req("/dossier");
  assert.equal(response.status,200);
  const html=await response.text();
  assert.equal(dossierPage("/institute-preview").includes("data-evidence-workbench"),true);
  assert.match(html,/Give your work a <em>method/);
  assert.match(html,/data-evidence-workbench/);
  assert.match(html,/No reviewer, award, or external validation/);
  for(const name of ["title","question","method","observations","limitations","references"]){
    assert.match(html,new RegExp('data-evidence-field="'+name+'"'));
  }
  for(const control of ["data-evidence-save","data-evidence-export","data-evidence-import","data-evidence-delete","data-evidence-digest"]){
    assert.match(html,new RegExp(control));
  }
  assert.match(html,/type="file"/);
  assert.match(html,/data-lab-import/);
  assert.match(html,/data-lab-apply hidden/);
  assert.match(html,/data-lab-feedback/);
  assert.match(html,/browser storage is not encrypted/i);
  assert.equal(EVIDENCE_FORMAT,"anevum-personal-evidence-draft/v1");
  assert.match(EVIDENCE_BROWSER_MODULE,/function parseEvidenceEnvelope/);
  for(const path of ["/evidence-schema.js","/evidence-workbench.js"]){
    const asset=await req(path);
    assert.equal(asset.status,200);
    assert.equal(asset.headers.get("Content-Type"),"text/javascript; charset=utf-8");
    assert.match(asset.headers.get("X-Robots-Tag"),/noindex/);
  }
  assert.equal((await req("/api/evidence")).status,404);
  assert.equal((await req("/accounts")).status,404);
  assert.equal((await req("/awards")).status,404);
});

test("archived high-resolution hero review blobs preserve provenance and fail closed without media binding",async()=>{
  for(const art of [FRONTIER_REVIEW_ART.desktop,FRONTIER_REVIEW_ART.mobile,FACILITY_DESIGN_ART.desktop,FACILITY_DESIGN_ART.mobile]){
    const file=new Uint8Array(await readFile(new URL("../apps/anevum-institute-preview/media/"+art.name,import.meta.url)));
    assert.ok(file.length>=100000,"Review imagery must be a real, opt-in high-resolution asset");
    const gitHash=createHash("sha1").update("blob "+file.length+"\0").update(file).digest("hex");
    assert.equal(gitHash,art.blobSha,"Art must retain its exact source Git blob");
    if(art.bytes)assert.equal(file.length,art.bytes,"Generated art bytes must match manifest");
    assert.equal((await req("/media/"+art.name)).status,404,"Unbound preview media must fail closed");
    const mediaUrl=new Request(BASE+"/media/"+art.name);
    const bound=await worker.fetch(mediaUrl,{loadReviewMedia:async key=>key===art.name?file:null});
    assert.equal(bound.status,200);
    assert.equal(bound.headers.get("Content-Type"),"image/webp");
    assert.match(bound.headers.get("Content-Security-Policy"),/default-src 'none'/);
    assert.equal(Buffer.from(await bound.arrayBuffer()).toString("ascii",0,4),"RIFF");
    const head=await worker.fetch(new Request(mediaUrl.url,{method:"HEAD"}),{loadReviewMedia:async()=>file});
    assert.equal(head.status,200);
    assert.equal((await head.arrayBuffer()).byteLength,0);
    const refused=await worker.fetch(new Request(mediaUrl.url,{method:"POST",body:"test"}),{loadReviewMedia:async()=>file});
    assert.equal(refused.status,405);
  }
  assert.equal((await req("/media/private.webp")).status,404);
  const html=await(await req("")).text();
  // The original review assets are preserved in the codebase and served only
  // through their explicitly requested, protected media routes, not the new homepage.
  assert.doesNotMatch(html,/data-art-source="generated-facility-v2-review"/);
  assert.doesNotMatch(html,/facility-concept-v2-desktop\.webp|facility-concept-v2-mobile\.webp/);
  assert.doesNotMatch(html,/src="\/institute-preview\/media\/observatory-review-desktop\.webp"/);
  assert.doesNotMatch(html,/srcset="\/institute-preview\/media\/observatory-review-mobile\.webp"/);
  assert.doesNotMatch(html,/frontier-cavern-desktop\.webp/);
});

test("real WebGL atmospheric module is isolated, accessible, same-origin, and resilient to failures",async()=>{
  const response=await req("/frontier-gl.js");
  assert.equal(response.status,200);
  assert.equal(response.headers.get("Content-Type"),"text/javascript; charset=utf-8");
  assert.match(response.headers.get("Content-Security-Policy"),/script-src 'self'/);
  assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
  const source=await response.text();
  assert.equal(source,FRONTIER_GL_CLIENT);
  assert.doesNotThrow(()=>new Script(source));
  for(const token of ["getContext(\"webgl\"","createShader","compileShader","drawArrays","uniform2f","requestAnimationFrame","cancelAnimationFrame","webglcontextlost","webglcontextrestored","prefers-reduced-motion","navigator.connection","document.hidden","IntersectionObserver","ResizeObserver"]){
    assert.ok(source.includes(token),"WebGL functionality missing: "+token);
  }
  assert.match(source,/now-lastFrame<42/,"WebGL frame rate must be limited");
  assert.match(source,/Math\.sqrt\(1050000\//,"WebGL pixel count must be bounded");
  assert.match(source,/dataset\.fxStatus=/);
  assert.match(source,/Frontier Research Society/);
  assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|import\(|eval\(|new Function|three\.js|\.glb\b|\.gltf\b/i);
});

test("logic laboratory exposes four correct truth-table rows and accessible controls",async()=>{
  const html=await(await req("/laboratory/and-gate")).text();
  const rows=[...html.matchAll(/<tr data-bits="([01]{2})"><td>([01])<\/td><td>([01])<\/td><td>([01])<\/td><\/tr>/g)];
  assert.deepEqual(rows.map(m=>[m[1],Number(m[2]),Number(m[3]),Number(m[4])]),[
    ["00",0,0,0],["01",0,1,0],["10",1,0,0],["11",1,1,1]
  ]);
  assert.match(html,/data-and-lab/);
  assert.match(html,/data-input="a" aria-pressed="false"/);
  assert.match(html,/data-input="b" aria-pressed="false"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/data-lab-progress/);
  assert.match(html,/data-reset/);
  assert.match(html,/data-export/);
  assert.match(html,/data-export-status/);
  assert.match(html,/import a downloaded notebook manually<\/a>/);
  assert.match(html,/href="\/institute-preview\/dossier#logic-import"/);
  assert.match(html,/browser simulation evaluates the ideal Boolean function/);
});

test("AND-to-Research Desk handoff requires full coverage and explicit draft approval",async()=>{
  const html=await(await req("/laboratory/and-gate")).text();
  assert.match(html,/<button[^>]*data-to-dossier disabled>Review in Research Desk/);
  assert.match(html,/After testing all four input pairs/);
  const client=await(await req("/client.js")).text();
  assert.match(client,/handoffKey="anevum\.institute\.handoff\.and\.v1"/);
  assert.match(client,/handoff\.disabled=visited\.size!==4/);
  assert.match(client,/sessionStorage\.setItem\(handoffKey,encoded\)/);
  assert.match(client,/window\.location\.assign\("\/institute-preview\/dossier#logic-import"\)/);
  const workbench=await(await req("/evidence-workbench.js")).text();
  assert.match(workbench,/function consumeAndLabHandoff\(\)/);
  assert.match(workbench,/sessionStorage\.removeItem\(handoffKey\)/);
  assert.match(workbench,/stagedLab=evidenceFromAndLabNotebook\(source\)/);
  assert.match(workbench,/source\?\.coverage\?\.complete!==true/);
  assert.match(workbench,/Nothing is saved or submitted automatically/);
  assert.doesNotMatch(client,/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
  assert.doesNotMatch(workbench,/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
});

test("half-adder research notebook validates XOR/AND and requires explicit approval",async()=>{
  const rows=[
    {a:0,b:0,sum:0,carry:0},
    {a:0,b:1,sum:1,carry:0},
    {a:1,b:0,sum:1,carry:0},
    {a:1,b:1,sum:0,carry:1}
  ];
  const notebook={
    schemaVersion:1,kind:"browser-local-unverified-simulation",
    experimentId:"CFP-101-HALF-001",courseId:"CFP-101",unitId:"CFP-101-U03",
    model:"ideal-Boolean-half-adder",
    assumptions:["binary inputs only","no physical propagation delay","no voltage, noise or power measurements"],
    coverage:{observed:4,possible:4,complete:true},
    observations:rows,independentlyVerified:false,academicCredit:false
  };
  assert.deepEqual(validateHalfAdderNotebook(notebook),[]);
  const record=evidenceFromHalfAdderNotebook(notebook);
  assert.equal(record.kind,"personal-unreviewed-draft");
  assert.equal(record.courseId,"CFP-101");
  assert.match(record.title,/half-adder/i);
  assert.match(record.observations,/SIMULATED ONLY/);
  assert.match(record.limitations,/not authenticated/);
  const partial=structuredClone(notebook);partial.observations=rows.slice(0,2);partial.coverage={observed:2,possible:4,complete:false};
  assert.deepEqual(validateHalfAdderNotebook(partial),[],"Partial manual imports may be used but are labeled incomplete");
  for(const variant of [
    {...notebook,observations:[...rows.slice(0,3),{a:1,b:1,sum:1,carry:1}]},
    {...notebook,observations:[...rows.slice(0,3),{a:0,b:0,sum:0,carry:0}]},
    {...notebook,observations:[...rows.slice(0,3),{a:1,b:1,sum:0,carry:1,physicalMeasured:true}]},
    {...notebook,coverage:{observed:4,possible:4,complete:false}},
    {...notebook,independentlyVerified:true},
    {...notebook,academicCredit:true},
    {...notebook,assumptions:["verified hardware"]},
    {...notebook,provenance:"accredited university"},
    {...notebook,observations:[...rows.slice(0,3),{a:"1",b:1,sum:0,carry:1}]}
  ]){
    assert.notDeepEqual(validateHalfAdderNotebook(variant),[],"Tampered half-adder record must fail");
    assert.throws(()=>evidenceFromHalfAdderNotebook(variant),Error);
  }
  for(const invalid of [null,[],42,"not-json",{}])assert.notDeepEqual(validateHalfAdderNotebook(invalid),[]);
  const lesson=await(await req("/learn/cfp-101/half-adders")).text();
  const dossier=await(await req("/dossier")).text();
  const client=await(await req("/client.js")).text();
  const workbench=await(await req("/evidence-workbench.js")).text();
  assert.match(lesson,/data-half-to-dossier disabled>Review in Research Desk/);
  assert.match(dossier,/id="half-import"/);
  assert.match(dossier,/data-half-import/);
  assert.match(dossier,/data-half-apply hidden/);
  assert.match(client,/halfTransfer\.disabled=visited\.size!==4/);
  assert.match(client,/sessionStorage\.setItem\(halfHandoffKey,raw\)/);
  assert.match(client,/window\.location\.assign\("\/institute-preview\/dossier#half-import"\)/);
  assert.match(workbench,/function consumeHalfHandoff\(\)/);
  assert.match(workbench,/sessionStorage\.removeItem\(key\)/);
  assert.match(workbench,/stagedHalf=evidenceFromHalfAdderNotebook\(source\)/);
  assert.match(workbench,/if\(source\?\.coverage\?\.complete!==true/);
  assert.match(EVIDENCE_BROWSER_MODULE,/function validateHalfAdderNotebook/);
  assert.match(EVIDENCE_BROWSER_MODULE,/function evidenceFromHalfAdderNotebook/);
  assert.doesNotMatch(client+workbench,/XMLHttpRequest|WebSocket|sendBeacon|navigator\.sendBeacon/);
});

test("GPU and neuron same-tab research handoffs stay untrusted and require explicit Apply",async()=>{
  const gpu=await(await req("/laboratory/cluster-scheduling")).text();
  const neuron=await(await req("/laboratory/neuron-dynamics")).text();
  assert.match(gpu,/data-cluster-to-dossier disabled>Use result in Research Desk/);
  assert.match(neuron,/data-neuron-to-dossier disabled>Use result in Research Desk/);
  const clusterClient=await(await req("/cluster-scheduler-client.js")).text();
  const neuronClient=await(await req("/neuron-lif-client.js")).text();
  const workbench=await(await req("/evidence-workbench.js")).text();
  assert.match(clusterClient,/anevum\.institute\.handoff\.cluster\.v1/);
  assert.match(neuronClient,/anevum\.institute\.handoff\.neuron\.v1/);
  for(const [client,selector,hash] of [
    [clusterClient,"cluster","#cluster-import"],[neuronClient,"neuron","#neuron-import"]
  ]){
    assert.ok(client.includes("sessionStorage.setItem(transferKey,raw)"),"No local staging "+selector);
    assert.ok(client.includes("sessionStorage.getItem(transferKey)!==raw"),"Missing write-check "+selector);
    assert.ok(client.includes("window.location.assign(\"/institute-preview/dossier"+hash+"\")"),"Wrong same-tab route "+selector);
    assert.doesNotMatch(client,/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|navigator\.sendBeacon/);
  }
  assert.match(workbench,/function consumeModelHandoff\(kind\)/);
  assert.match(workbench,/sessionStorage\.removeItem\(config\.key\)/);
  assert.match(workbench,/window\.location\.hash!==config\.hash/);
  assert.match(workbench,/stagedCluster=evidenceFromClusterSchedulerNotebook\(source,expected\)/);
  assert.match(workbench,/stagedNeuron=evidenceFromNeuronLifNotebook\(source,expected\)/);
  assert.match(workbench,/simulateCluster\(\{capacity:source\.capacity,policy:source\.policy\}\)/);
  assert.match(workbench,/simulateNeuron\(\{tauMs:source\.settings\.tauMs,driveMv:source\.settings\.driveMv\}\)/);
  assert.match(workbench,/Your current editor and saved draft remain unchanged/);
  assert.doesNotMatch(workbench,/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
});

test("preview client parses, and uses only local browser state",async()=>{
  const response=await req("/client.js");
  assert.equal(response.status,200);
  assert.match(response.headers.get("Content-Type"),/javascript/);
  const source=await response.text();
  assert.doesNotThrow(()=>new Script(source));
  assert.match(source,/localStorage\.setItem/);
  assert.match(source,/visited\.size===4/);
  assert.match(source,/experimentId:"CFP-101-AND-001"/);
  assert.match(source,/schemaVersion:1/);
  assert.match(source,/URL\.createObjectURL/);
  assert.match(source,/URL\.revokeObjectURL/);
  assert.match(source,/observations\.push/);
  assert.match(source,/data-inverter-toggle/);
  assert.match(source,/record\.transistor=true/);
  assert.match(source,/Number\(result\.transistor\)/);
  assert.match(source,/anevum\.institute\.study\.v1\./);
  assert.match(source,/localStorage\.removeItem/);
  assert.match(source,/data-study-download/);
  assert.match(source,/pendingDeletion/);
  assert.match(source,/data-evidence-panel/);
  assert.match(source,/data-evidence-state/);
  assert.match(source,/This is not independently verified/);
  assert.match(source,/prefers-reduced-motion: reduce/);
  assert.match(source,/navigator\.connection\.saveData/);
  assert.match(source,/visibilitychange/);
  assert.match(source,/import\("\/institute-preview\/evidence-workbench\.js"\)/);
  assert.match(source,/import\("\/institute-preview\/local-member-client\.js"\)/);
  assert.match(source,/import\("\/institute-preview\/frontier-gl\.js"\)/);
  assert.match(source,/no analog voltage|analog voltage/i);
  assert.doesNotMatch(source,/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|navigator\.serviceWorker/);
});

test("styles are complete, mobile responsive and reduced-motion safe",async()=>{
  const response=await req("/styles.css");
  assert.equal(response.status,200);
  assert.match(response.headers.get("Content-Type"),/text\/css/);
  const css=await response.text();
  assert.match(css,/@media\(max-width:750px\)/);
  assert.match(css,/@media\(max-width:470px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/a:focus-visible/);
  assert.match(css,/\.study-notes textarea:focus-visible/);
  assert.match(css,/\.study-actions/);
  assert.match(css,/\.frontier-hero/);
  assert.match(css,/\.frontier-evidence-list/);
  assert.match(css,/\.frontier-poster/);
  assert.match(css,/\.frontier-hero--facility/);
  assert.match(css,/\.frontier-facility-art/);
  assert.match(css,/\.facility-poster/);
  assert.match(css,/\.facility-link-dock/);
  assert.match(css,/\.frontier-gl/);
  assert.match(css,/\[data-fx-status="active"\]/);
  assert.match(css,/\.frontier-gl\{display:none!important/);
  assert.match(css,/\.frontier-video/);
  assert.match(css,/\.dossier-grid/);
  assert.match(css,/\.studio-layout/);
  assert.match(css,/\.studio-profile-grid/);
  assert.match(css,/\.studio-activity-list/);
  assert.match(css,/\.dossier-receipt/);
  assert.match(css,/\.dossier-lab-import/);
  assert.match(css,/\.dossier-lab-apply\[hidden\]/);
  assert.match(css,/\.dossier-field input:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.frontier-atmosphere/);
  assert.match(css,/\/institute-preview\/assets\/lab-hero-v1\.webp/);
  assert.doesNotMatch(css,/https?:\/\//);
});

test("reviewed same-origin images decode and all other binary assets fail closed",async()=>{
  for(const name of ["lab-hero-v1.webp","lab-archive-v1.webp","research-generation-v1.webp","research-computation-v1.webp","research-worlds-v1.webp","rhen-generative-v1.webp"]){
    const response=await req("/assets/"+name);
    assert.equal(response.status,200,name);
    assert.equal(response.headers.get("Content-Type"),"image/webp");
    const bytes=Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.toString("ascii",0,4),"RIFF");
    assert.equal(bytes.toString("ascii",8,12),"WEBP");
    assert.deepEqual(bytes,Buffer.from(LAB_ART[name],"base64"));
  }
  assert.equal((await req("/assets/private.webp")).status,404);
});


test("new institute identity is an original isolated vector system",async()=>{
  const home=await (await req("")).text();
  const lesson=await (await req("/learn/cfp-101/logic-gates")).text();
  assert.match(home,/src="\/institute-preview\/mark\.svg"/);
  assert.match(home,/rel="icon" type="image\/svg\+xml"/);
  assert.match(home,/An open institute for <em>serious inquiry\.<\/em>/);
  assert.match(home,/Not operating faculties/);
  assert.match(home,/03 \/ THE ACADEMIC METHOD/);
  assert.match(home,/Document your findings/);
  assert.match(home,/Design review:/);
  assert.match(lesson,/class="lesson-article"/);
  const nav=home.match(/<nav class="desk-nav" aria-label="Primary navigation">([\s\S]*?)<\/nav>/)?.[1]||"";
  assert.equal((nav.match(/<a /g)||[]).length,5);
  assert.match(nav,/My Studio/);
  assert.match(nav,/>Institute<\/a>/);
  assert.match(nav,/>Research<\/a>/);
  assert.match(nav,/>Academics<\/a>/);
  assert.match(nav,/>Laboratories<\/a>/);
  for(const [name,part] of [["mark.svg","The Confluence"],["mark-small.svg","The Confluence"],["observatory.svg","The ANEVUM observatory"]]){
    const response=await req("/"+name);
    assert.equal(response.status,200,name);
    assert.match(response.headers.get("Content-Type"),/image\/svg\+xml/);
    assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
    const svg=await response.text();
    assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.ok(svg.includes(part),name);
    assert.doesNotMatch(svg,/<(?:script|foreignObject|iframe)\b|xlink:href="https?:|<image[^>]+https?:/i);
    const head=await req("/"+name,{method:"HEAD"});
    assert.equal(head.status,200);
    assert.equal(await head.text(),"");
  }
  const brandedHome=await (await req("")).text();
  assert.match(brandedHome,/rel="icon" type="image\/svg\+xml" href="\/institute-preview\/mark-small\.svg"/);
  assert.match(brandedHome,/class="identity-mark" src="\/institute-preview\/mark\.svg"/);
  const css=await (await req("/styles.css")).text();
  assert.match(css,/url\("\/institute-preview\/assets\/research-computation-v1\.webp"\)/);
  assert.match(css,/\.lesson-article\{background:#f4f1e8/);
  assert.match(css,/\.identity-mark\{display:block/);
});

test("unowned routes, origins, methods and data endpoints are rejected",async()=>{
  for(const path of ["/staff","/command","/api","/about","/archive","/profiles","/awards","/../../staff","/assets/private.webp"]){
    assert.equal((await req(path)).status,404,path);
  }
  for(const url of ["https://example.com/institute-preview","https://backstage.anevum.com/institute-preview","http://anevum.com/institute-preview","https://anevum.com/institute-preview?debug=1"]){
    assert.equal((await worker.fetch(new Request(url))).status,404,url);
  }
  const post=await req("",{method:"POST",body:"x"});
  assert.equal(post.status,405);
  assert.equal(post.headers.get("Allow"),"GET, HEAD");
  for(const path of ["","/research","/recognition","/dossier","/academy","/academy/cfp-101","/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates","/laboratory/and-gate","/laboratory/cluster-scheduling","/laboratory/neuron-dynamics","/curriculum/cfp-101.json","/styles.css","/client.js","/evidence-schema.js","/evidence-workbench.js","/local-member-schema.js","/local-member-client.js","/frontier-gl.js","/assets/lab-hero-v1.webp"]){
    const get=await req(path),head=await req(path,{method:"HEAD"});
    assert.equal(head.status,200,path);
    assert.equal((await head.arrayBuffer()).byteLength,0);
    assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(get.headers));
  }
});


test("compute scheduling laboratory model is deterministic, bounded and explicitly simulated",async()=>{
  const response=await req("/cluster-scheduler-model.js");
  assert.equal(response.status,200);
  assert.equal(response.headers.get("Content-Type"),"text/javascript; charset=utf-8");
  assert.match(response.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  assert.equal(await response.text(),CLUSTER_SCHEDULER_MODEL_BROWSER_MODULE);
  const model=await import("data:text/javascript,"+encodeURIComponent(CLUSTER_SCHEDULER_MODEL_BROWSER_MODULE));
  const {simulateCluster,CLUSTER_WORKLOADS,CLUSTER_SCHEDULER_FORMAT}=model;
  assert.equal(CLUSTER_SCHEDULER_FORMAT,"anevum-cluster-scheduler-simulation/v1");
  assert.equal(CLUSTER_WORKLOADS.length,5);
  for(const capacity of [4,8]){
    for(const policy of ["fifo","shortest"]){
      const options={capacity,policy};
      const run=simulateCluster(options),again=simulateCluster(options);
      assert.deepEqual(run,again,"Simulation is not deterministic");
      assert.equal(run.capacity,capacity);
      assert.equal(run.jobs.length,5);
      assert.equal(run.metrics.makespanTicks,run.timeline.length);
      assert.equal(run.metrics.availableGpuTicks,run.timeline.length*capacity);
      assert.equal(run.metrics.busyGpuTicks,run.jobs.reduce((s,j)=>s+j.gpus*j.ticks,0));
      assert.ok(run.timeline.every(t=>t.usedGpus<=capacity&&t.usedGpus>=1&&t.usedGpus+t.freeGpus===capacity));
      for(const job of run.jobs){
        assert.equal(job.finishTick-job.startTick,job.ticks);
        assert.equal(job.waitTicks,job.startTick);
        assert.ok(job.finishTick<=run.metrics.makespanTicks);
        for(let tick=0;tick<run.metrics.makespanTicks;tick++){
          const running=run.timeline[tick].running.some(x=>x.id===job.id);
          assert.equal(running,job.startTick<=tick&&tick<job.finishTick);
        }
      }
      assert.equal(run.timeline.reduce((s,t)=>s+t.usedGpus,0),run.metrics.busyGpuTicks);
      assert.equal(run.independentReview,false);
      assert.ok(run.assumptions.some(s=>s.includes("No preemption")));
      assert.ok(run.metrics.gpuUtilizationPercent>0&&run.metrics.gpuUtilizationPercent<=100);
    }
  }
  const fifo=simulateCluster({policy:"fifo"}),shortest=simulateCluster({policy:"shortest"});
  assert.ok(shortest.metrics.meanWaitTicks<fifo.metrics.meanWaitTicks);
  assert.notDeepEqual(fifo.timeline,shortest.timeline);
  assert.equal(fifo.jobs[1].startTick,2,"Strict FIFO must not leapfrog the blocking four-GPU job");
  for(const invalid of [{capacity:0},{capacity:1},{capacity:9},{capacity:4.5},{policy:"round-robin"},{jobs:[]},
    {jobs:[{id:"a",label:"Test job",gpus:5,ticks:2}]},
    {jobs:[{id:"a",label:"Test job",gpus:1,ticks:2},{id:"a",label:"Test job",gpus:1,ticks:2}]},
    {jobs:[{id:"a",label:"Test job",gpus:1,ticks:0}]},
    {jobs:[{id:"a",label:"Test job",gpus:1,ticks:Infinity}]}]){
    assert.throws(()=>simulateCluster(invalid));
  }
  const page=await(await req("/laboratory/cluster-scheduling")).text();
  assert.ok(page.includes(CLUSTER_SCHEDULER_HTML.trim().slice(0,40)));
  assert.match(page,/data-cluster-lab/);
  assert.match(page,/Five illustrative jobs/);
  assert.match(page,/No hardware or server jobs are involved/);
  assert.doesNotMatch(page,/live telemetry|real GPU training jobs/i);
  const academy=await(await req("/academy")).text();
  assert.match(academy,/Open the scheduling simulator/);
  assert.ok(academy.includes('/institute-preview/laboratory/cluster-scheduling'));
  for(const asset of ["/cluster-scheduler-model.js","/cluster-scheduler-client.js"]){
    const file=await req(asset);
    assert.equal(file.status,200);
    assert.equal(file.headers.get("Content-Type"),"text/javascript; charset=utf-8");
    assert.match(file.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  }
  assert.ok(CLUSTER_SCHEDULER_CSS.includes(".cluster-layout"));
  const stylesheet=await(await req("/styles.css")).text();
  assert.ok(stylesheet.includes(CLUSTER_SCHEDULER_CSS));
  assert.doesNotMatch(stylesheet,/https?:\/\//);
});


test("neuron LIF simulator is deterministic, mathematically bounded and not a clinical or physical recording",async()=>{
  const moduleRes=await req("/neuron-lif-model.js");
  assert.equal(moduleRes.status,200);
  assert.equal(moduleRes.headers.get("Content-Type"),"text/javascript; charset=utf-8");
  assert.match(moduleRes.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  assert.equal(await moduleRes.text(),NEURON_LIF_MODEL_BROWSER_MODULE);
  const mod=await import("data:text/javascript;charset=utf-8,"+encodeURIComponent(NEURON_LIF_MODEL_BROWSER_MODULE));
  const {simulateNeuron,NEURON_FORMAT,NEURON_CONSTANTS,NEURON_TAUS,NEURON_DRIVES}=mod;
  assert.equal(NEURON_FORMAT,"anevum-neuron-lif-simulation/v1");
  assert.equal(NEURON_CONSTANTS.stepMs,0.5);
  assert.equal(NEURON_CONSTANTS.durationMs,200);
  for(const tauMs of NEURON_TAUS){
    for(const driveMv of NEURON_DRIVES){
      const run=simulateNeuron({tauMs,driveMv});
      assert.deepEqual(run,simulateNeuron({tauMs,driveMv}),"Repeat with identical parameters must reproduce the exact data");
      assert.equal(run.trace.length,401);
      assert.equal(run.trace[0].timeMs,0);
      assert.equal(run.trace[400].timeMs,200);
      assert.equal(run.format,NEURON_FORMAT);
      assert.equal(run.independentlyReviewed,false);
      assert.equal(run.clinicalUse,false);
      assert.equal(run.metrics.spikeCount,run.spikeTimesMs.length);
      assert.ok(run.trace.every((x,i)=>x.timeMs===i*0.5&&Number.isFinite(x.voltageMv)&&x.voltageMv>=-65&&x.voltageMv<=-50));
      assert.ok(run.spikeTimesMs.every((t,i)=>t>=20&&t<160&&Number.isFinite(t)&&Number.isInteger(t*2)&&(i===0||t-run.spikeTimesMs[i-1]>=2)));
      assert.ok(run.assumptions.some(x=>x.includes("not a measured electrical current")));
    }
  }
  const silent=simulateNeuron({tauMs:20,driveMv:0});
  const subthreshold=simulateNeuron({tauMs:20,driveMv:10});
  const active=simulateNeuron({tauMs:20,driveMv:20});
  const faster=simulateNeuron({tauMs:5,driveMv:20});
  assert.equal(silent.metrics.spikeCount,0);
  assert.equal(subthreshold.metrics.spikeCount,0);
  assert.equal(silent.metrics.firstSpikeMs,null);
  assert.equal(silent.metrics.meanInterspikeIntervalMs,null);
  assert.ok(active.metrics.spikeCount>0);
  assert.ok(faster.metrics.spikeCount>active.metrics.spikeCount);
  assert.equal(active.trace[20].voltageMv,-65,"Before stimulus the rest voltage is constant");
  assert.ok(active.trace[60].voltageMv>-65,"Active pulse causes subthreshold integration");
  assert.equal(active.trace[400].voltageMv<=-50,true);
  for(const invalid of [{tauMs:0},{tauMs:1},{tauMs:20.1},{tauMs:NaN},{tauMs:Infinity},{tauMs:"20"},{tauMs:20,driveMv:-1},{driveMv:15},{driveMv:Infinity},{driveMv:"20"}]){
    assert.throws(()=>simulateNeuron(invalid),/RangeError/);
  }
  const page=await(await req("/laboratory/neuron-dynamics")).text();
  assert.ok(page.includes(NEURON_LIF_HTML));
  assert.match(page,/data-neuron-lab/);
  assert.match(page,/threshold/i);
  assert.match(page,/not a simulation of real action-potential waveforms/i);
  assert.match(page,/No real neural recordings/i);
  assert.doesNotMatch(page,/clinically validated|medical diagnosis available|diagnostic accuracy established/i);
  const academy=await(await req("/academy")).text();
  assert.match(academy,/Open neuron dynamics model/);
  const client=await req("/neuron-lif-client.js");
  assert.equal(client.status,200);
  assert.match(client.headers.get("Content-Security-Policy"),/connect-src 'none'/);
  assert.ok(NEURON_LIF_CSS.includes(".neuron-layout"));
  const style=await(await req("/styles.css")).text();
  assert.ok(style.includes(NEURON_LIF_CSS));
  assert.equal((await req("/api/neuron-data")).status,404);
});

test("Research Desk groups all four locally checked teaching exports in native keyboard disclosures",async()=>{
  const dossier=await(await req("/dossier")).text();
  assert.match(dossier,/data-import-hub/);
  assert.equal((dossier.match(/\bdata-import-source(?=[\s=>])/g)||[]).length,4);
  for(const id of ["logic-import","half-import","cluster-import","neuron-import"])assert.match(dossier,new RegExp('id="'+id+'"'));
  for(const picker of ["data-lab-import","data-half-import","data-cluster-import","data-neuron-import"])assert.match(dossier,new RegExp(picker));
  assert.match(dossier,/Import experiment results|Bring in experiment results/);
  assert.match(dossier,/data-evidence-save/);
  assert.match(dossier,/data-evidence-export/);
  assert.match(dossier,/does not authenticate their origin|not authorship, physical observations or peer review/i);
  const js=await(await req("/evidence-workbench.js")).text();
  assert.match(js,/revealImportHash/);
  assert.match(js,/hashchange/);
  assert.match(js,/clearStagedNeuron/);
  const css=await(await req("/styles.css")).text();
  assert.match(css,/\.dossier-import-hub/);
  assert.match(css,/\.dossier-import-source/);
  assert.match(css,/summary:focus-visible/);
});

test("Research navigation opens a real methods page, not recognition policy",async()=>{
  const home=await(await req("")).text();
  assert.match(home,/href="\/institute-preview\/research"[^>]*>Research<\/a>/);
  const response=await req("/research");
  assert.equal(response.status,200);
  assert.match(response.headers.get("X-Robots-Tag"),/noindex/);
  const research=await response.text();
  assert.match(research,/Research &amp; Methods/);
  assert.match(research,/No peer-reviewed findings/);
  assert.match(research,/No GPU hardware/);
  assert.match(research,/No neural recordings/);
  assert.match(research,/No transistor timings/);
  assert.equal((research.match(/class="research-experiment"/g)||[]).length,3);
  for(const path of ["/laboratory/and-gate","/laboratory/cluster-scheduling","/laboratory/neuron-dynamics","/dossier","/recognition","/academy"]){
    assert.ok(research.includes('href="/institute-preview'+path+'"'),"Missing working destination: "+path);
  }
  assert.doesNotMatch(research,/<canvas|<video|<picture|<form\b/i);
});
