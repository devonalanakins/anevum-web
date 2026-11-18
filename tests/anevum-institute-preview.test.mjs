import test from "node:test";
import assert from "node:assert/strict";
import {Script} from "node:vm";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {LAB_ART} from "../apps/anevum-public-studio/living-laboratory-art.mjs";
import worker from "../apps/anevum-institute-preview/worker.mjs";
import {CFP_101,validateCurriculum} from "../apps/anevum-institute-preview/curriculum.mjs";
import {studyToolsHtml} from "../apps/anevum-institute-preview/study-tools.mjs";
import {dossierPage} from "../apps/anevum-institute-preview/dossier-ui.mjs";
import {localStudioPage,localProfilePage} from "../apps/anevum-institute-preview/learner-ui.mjs";
import {LOCAL_MEMBER_CLIENT} from "../apps/anevum-institute-preview/local-member-client.mjs";
import {LOCAL_MEMBER_BROWSER_MODULE} from "../apps/anevum-institute-preview/local-member-schema.mjs";
import {EVIDENCE_BROWSER_MODULE,EVIDENCE_FORMAT} from "../apps/anevum-institute-preview/evidence-schema.mjs";
import {FRONTIER_GL_CLIENT} from "../apps/anevum-institute-preview/frontier-gl.mjs";
import {frontierHome,frontierRecognition,RECOGNITION_POLICY,FRONTIER_MEDIA,FRONTIER_REVIEW_ART,FACILITY_DESIGN_ART,frontierMediaMarkup} from "../apps/anevum-institute-preview/frontier-society.mjs";

const BASE="https://anevum.com/institute-preview";
const PATHS=["","/recognition","/dossier","/studio","/profile","/academy","/academy/cfp-101","/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates","/laboratory/and-gate"];
const req=(path="",init={})=>worker.fetch(new Request(BASE+path,init));

test("ten isolated pages have accurate titles, landmarks, and noindex headers",async()=>{
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

test("course availability and educational boundaries are explicit",async()=>{
  const catalog=await(await req("/academy")).text();
  const course=await(await req("/academy/cfp-101")).text();
  const lesson=await(await req("/learn/cfp-101/logic-gates")).text();
  assert.match(catalog,/Explore transistor switching and digital logic/i);
  assert.match(catalog,/not operational faculties/i);
  assert.match(course,/curriculum in development/i);
  assert.equal((course.match(/Study this lesson/g)||[]).length,2);
  assert.ok(course.indexOf("Semiconductors and transistor switching")<course.indexOf("Binary logic and gates"),"Transistors-first syllabus order");
  assert.match(lesson,/Q = A ∧ B/);
  assert.match(lesson,/2² = 4/);
  assert.match(lesson,/N = NOT\(A AND B\)/);
  assert.match(lesson,/Q = NOT\(N\) = A AND B/);
  assert.match(lesson,/data-answer="and"/);
  assert.match(lesson,/data-local-progress/);
  assert.match(lesson,/not a transistor-level SPICE simulation/);
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
    "/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates"
  ]);
  assert.equal(manifest.units.filter(unit=>unit.availability==="planned").length,6);
  const manifestPage=await(await req("/academy/cfp-101")).text();
  assert.match(manifestPage,/Download portable curriculum metadata/);
  assert.match(manifestPage,/version 0\.2\.0/);
  const invalid=structuredClone(manifest);
  invalid.units[2].availability="preview";
  assert.ok(validateCurriculum(invalid).some(error=>error.includes("Lesson availability mismatch")));
  const badPrerequisite=structuredClone(manifest);
  badPrerequisite.units[0].prerequisites=["CFP-101-U02"];
  assert.ok(validateCurriculum(badPrerequisite).some(error=>error.includes("Prerequisites must name earlier units")));
  const duplicate=structuredClone(manifest);
  duplicate.units[1].lessonPath=duplicate.units[0].lessonPath;
  assert.ok(validateCurriculum(duplicate).some(error=>error.includes("Duplicate lesson path")));
  assert.ok(validateCurriculum({schemaVersion:1,id:"CFP-101",version:"0.2.0",status:"preview",units:[{availability:"preview"}]}).length>0);
});

test("Learning Studio exposes independently keyed, accessible local notebooks for both lessons",async()=>{
  assert.throws(()=>studyToolsHtml("CFP-101-U03"),/Unsupported or unreviewed/);
  const a=await (await req("/learn/cfp-101/transistor-switching")).text();
  const b=await (await req("/learn/cfp-101/logic-gates")).text();
  for(const [html,key] of [[a,"CFP-101-U01"],[b,"CFP-101-U02"]]){
    assert.match(html,new RegExp('data-study-lesson="'+key+'"'));
    assert.match(html,/data-study-save/);
    assert.match(html,/data-study-download/);
    assert.match(html,/data-study-bookmark aria-pressed="false"/);
    assert.match(html,/data-study-clear/);
    assert.match(html,/data-study-status role="status" aria-live="polite"/);
    assert.match(html,/not encrypted or synced/);
    assert.match(html,/maxlength="8000"/);
    assert.equal((html.match(/class="study-notes"/g)||[]).length,1,"A lesson must have exactly one local notebook");
  }
  assert.doesNotMatch(a,/data-study-lesson="CFP-101-U02"/);
  assert.doesNotMatch(b,/data-study-lesson="CFP-101-U01"/);
});

test("frontier society and evidence-based recognition distinguish working activities from future claims",async()=>{
  const home=await(await req("")).text();
  const recognition=await(await req("/recognition")).text();
  assert.match(home,/The frontier <em>is open\.<\/em>/);
  assert.match(home,/Begin CFP-101/);
  assert.match(home,/Enter the laboratory/);
  assert.match(home,/class="facility-link-dock"/);
  assert.match(home,/frontier-hero-inner/);
  assert.match(home,/ANEVUM \/ 001/);
  assert.match(home,/INDEPENDENT SCIENTIFIC EDUCATION/);
  assert.match(home,/The work is the <em>curriculum/);
  assert.match(home,/NOT ISSUED/);
  assert.match(home,/TWO PREVIEW LESSONS AVAILABLE/);
  assert.match(home,/href="\/institute-preview\/recognition"/);
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
  assert.match(home,/data-frontier-visual/);
  assert.doesNotMatch(frontierHome("/institute-preview"),/<video\b|frontier-cavern-desktop\.webp|atmosphere-screenblend\.mp4/);
  assert.match(home,/data-art-source="generated-facility-v2-review"/);
  assert.match(home,/src="\/institute-preview\/media\/facility-concept-v2-desktop\.webp"/);
  assert.match(home,/srcset="\/institute-preview\/media\/facility-concept-v2-mobile\.webp"/);
  assert.match(home,/class="hero frontier-hero frontier-hero--facility"/);
  assert.match(home,/href="\/institute-preview\/dossier"/);
  assert.doesNotMatch(home,/frontier-cavern-desktop\.webp/);
  assert.match(frontierHome("/institute-preview"),/href="\/institute-preview\/academy/);
  assert.match(frontierRecognition("/institute-preview"),/data-evidence-panel/);
  assert.doesNotMatch(home+recognition,/<form\b|<iframe|onclick=|onload=|download=".*certificate"/i);
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
  assert.match(studio,/Six additional units remain unpublished/);
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
  assert.match(html,/data-art-source="generated-facility-v2-review"/);
  assert.match(html,/facility-concept-v2-desktop\.webp/);
  assert.match(html,/facility-concept-v2-mobile\.webp/);
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
  assert.match(html,/open Research Desk<\/a>/);
  assert.match(html,/href="\/institute-preview\/dossier"/);
  assert.match(html,/browser simulation evaluates the ideal Boolean function/);
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
  assert.match(home,/The frontier <em>is open\.<\/em>/);
  assert.match(home,/NOT A PHYSICAL CAMPUS/);
  assert.match(home,/RECOGNITION \/ 003/);
  assert.match(home,/Document the evidence/);
  assert.match(home,/Design review:/);
  assert.match(lesson,/class="lesson-article"/);
  const nav=home.match(/<nav class="desk-nav" aria-label="Primary navigation">([\s\S]*?)<\/nav>/)?.[1]||"";
  assert.equal((nav.match(/<a /g)||[]).length,5);
  assert.match(nav,/My Studio/);
  assert.match(nav,/Society/);
  assert.match(nav,/Recognition/);
  assert.match(nav,/Academy/);
  assert.match(nav,/Laboratory/);
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
  const home=await (await req("")).text();
  assert.match(home,/rel="icon" type="image\/svg\+xml" href="\/institute-preview\/mark-small\.svg"/);
  assert.match(home,/class="identity-mark" src="\/institute-preview\/mark\.svg"/);
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
  for(const path of ["","/recognition","/dossier","/academy","/academy/cfp-101","/learn/cfp-101/transistor-switching","/learn/cfp-101/logic-gates","/laboratory/and-gate","/curriculum/cfp-101.json","/styles.css","/client.js","/evidence-schema.js","/evidence-workbench.js","/local-member-schema.js","/local-member-client.js","/frontier-gl.js","/assets/lab-hero-v1.webp"]){
    const get=await req(path),head=await req(path,{method:"HEAD"});
    assert.equal(head.status,200,path);
    assert.equal((await head.arrayBuffer()).byteLength,0);
    assert.deepEqual(Object.fromEntries(head.headers),Object.fromEntries(get.headers));
  }
});
