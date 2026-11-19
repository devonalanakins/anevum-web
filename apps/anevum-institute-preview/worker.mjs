// ANEVUM.WEB.DESIGN.2026-11-17.001 — isolated Open Institute design and learning preview.

// No Cloudflare route, auth, API, database or production binding is owned by this module.

import {INSTITUTE_CSS} from "./styles.mjs";
import {INSTITUTION_CSS} from "./academic-styles.mjs";
import {studyPathNav,academyLearningDirectory} from "./study-path.mjs";
import {academicInstituteHome} from "./academic-home.mjs";

import {INSTITUTE_CLIENT} from "./client.mjs";
import {FRONTIER_GL_CLIENT} from "./frontier-gl.mjs";
import {TRANSISTOR_LESSON_HTML} from "./transistor-lesson.mjs";
import {HALF_ADDER_LESSON_HTML} from "./half-adder-lesson.mjs";
import {REGISTER_LESSON_HTML} from "./register-lesson.mjs";
import {MEMORY_LESSON_HTML} from "./memory-lesson.mjs";
import {ASSEMBLY_LESSON_HTML} from "./assembly-lesson.mjs";
import {SYSTEMS_LESSON_HTML} from "./systems-lesson.mjs";
import {CPU_CAPSTONE_HTML} from "./cpu-capstone-ui.mjs";
import {CPU_CAPSTONE_MODEL_BROWSER_MODULE} from "./cpu-capstone-model.mjs";
import {CPU_CAPSTONE_CLIENT_BROWSER_MODULE} from "./cpu-capstone-client.mjs";
import {CPU_CAPSTONE_CSS} from "./cpu-capstone-styles.mjs";
import {CLUSTER_SCHEDULER_HTML} from "./cluster-scheduler-ui.mjs";
import {CLUSTER_SCHEDULER_MODEL_BROWSER_MODULE} from "./cluster-scheduler-model.mjs";
import {CLUSTER_SCHEDULER_CLIENT_BROWSER_MODULE} from "./cluster-scheduler-client.mjs";
import {CLUSTER_SCHEDULER_CSS} from "./cluster-scheduler-styles.mjs";
import {NEURON_LIF_HTML} from "./neuron-lif-ui.mjs";
import {NEURON_LIF_MODEL_BROWSER_MODULE} from "./neuron-lif-model.mjs";
import {NEURON_LIF_CLIENT_BROWSER_MODULE} from "./neuron-lif-client.mjs";
import {NEURON_LIF_CSS} from "./neuron-lif-styles.mjs";
import {CFP_101} from "./curriculum.mjs";
import {studyToolsHtml} from "./study-tools.mjs";
import {frontierRecognition,FRONTIER_REVIEW_ART,FACILITY_DESIGN_ART} from "./frontier-society.mjs";
import {dossierPage} from "./dossier-ui.mjs";
import {EVIDENCE_BROWSER_MODULE} from "./evidence-schema.mjs";
import {EVIDENCE_WORKBENCH_CLIENT} from "./evidence-workbench.mjs";
import {localStudioPage,localProfilePage} from "./learner-ui.mjs";
import {LOCAL_MEMBER_BROWSER_MODULE} from "./local-member-schema.mjs";
import {LOCAL_MEMBER_CLIENT} from "./local-member-client.mjs";
import {ANEVUM_MARK_SVG, ANEVUM_FAVICON_SVG, ANEVUM_OBSERVATORY_SVG} from "./artwork.mjs";
import {LAB_ART} from "../anevum-public-studio/living-laboratory-art.mjs";

const BASE="/institute-preview";

function navigation(active){
  const links=[
    ["Institute","Society",BASE],
    ["Academics","Academy",BASE+"/academy"],
    ["Laboratories","Laboratory",BASE+"/laboratory/cluster-scheduling"],
    ["Research","Research",BASE+"/research"],
    ["My Studio","My Studio",BASE+"/studio"]
  ];
  const makeLinks=()=>links.map(([label,key,href])=>`<a href="${href}"${(key===active||(active==="Course"||active==="Classroom")&&key==="Academy")?' aria-current="page"':''}>${label}</a>`).join("");
  return `<a class="skip" href="#main">Skip to main content</a>
  <header class="mast"><div class="mast-inner">
    <a class="identity" href="${BASE}" aria-label="ANEVUM, home"><img class="identity-mark" src="${BASE}/mark.svg" width="59" height="59" alt="" decoding="async"><span><span class="identity-text">ANEVUM</span><span class="identity-caption">The Open Institute</span></span></a>
    <nav class="desk-nav" aria-label="Primary navigation">${makeLinks()}</nav>
    <button type="button" class="shell-search" data-search-open aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K" aria-label="Search ANEVUM destinations">Search <kbd>/</kbd></button>
    <a class="mast-action" href="${BASE}/learn/cfp-101/transistor-switching">Start learning <span aria-hidden="true">→</span></a>
    <details class="mobile-menu"><summary>Menu</summary><nav class="nav-menu" aria-label="Mobile navigation">${makeLinks()}</nav></details>
  </div></header>`;
}

function footer(){
  return `<footer class="footer"><div class="shell footer-inner">
    <div><div class="footer-brand">ANEVUM <span style="font-family:system-ui,sans-serif;letter-spacing:.09em;font-size:10px;color:#b6c6c6">THE OPEN INSTITUTE / INDEPENDENT EDUCATION</span></div><p>An independent, non-accredited open-education and research project. No degrees or academic credit are offered. The learning demo stores notes locally; accessing this private review requires owner authentication through Cloudflare Access.</p></div>
    <div><div class="preview-flag">Isolated design review / Not a public launch</div><p>The Academy currently contains eight introductory computing lesson previews, two Boolean experiments, a simulated GPU scheduler and a single-neuron teaching model. Full degrees, real compute and clinical programs remain proposed.</p><p><a href="/original-works/archive">Visit the existing ANEVUM archive</a> · <a href="${BASE}">Return to Institute</a></p></div>
  </div></footer>`;
}

function layout(title,active,body,studyUnit=null){
  if(studyUnit){
    const article='<article class="lesson-article">';
    if(!body.includes(article))throw new Error("Lesson article missing for study path");
    body=body.replace(article,article+studyPathNav(studyUnit));
  }
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><meta name="color-scheme" content="light"><link rel="icon" type="image/svg+xml" href="${BASE}/mark-small.svg"><meta name="theme-color" content="#f5f4ee">
<meta name="description" content="ANEVUM design preview: free scientific learning, independent experiments, and evidence-based recognition.">
<title>${title} — ANEVUM Open Institute (Design Preview)</title>
<link rel="stylesheet" href="${BASE}/styles.css"><script defer src="${BASE}/client.js"></script>
</head><body data-area="${active.toLowerCase()}">${navigation(active)}<div class="preview-ribbon"><strong>Design review:</strong> ANEVUM is an independent, non-accredited education and research project. Accounts, peer review and credential issuance are not implemented.</div><dialog class="command-dialog" data-command-dialog aria-labelledby="command-title"><div class="command-heading"><div><p>ANEVUM / DIRECTORY</p><h2 id="command-title">Find a destination</h2></div><button type="button" data-command-close aria-label="Close search">Close</button></div><label for="command-query">Search available pages</label><input id="command-query" type="search" data-command-query autocomplete="off" placeholder="Course, lesson, laboratory"><p data-command-status role="status" aria-live="polite"></p><ul data-command-results aria-label="Search results"></ul><p class="command-disclaimer">Only available preview pages. No planned courses, cluster jobs, or credentials are listed.</p></dialog>${body}${footer()}</body></html>`;
}

function home(){return layout("The Open Institute","Society",academicInstituteHome(BASE));}
function recognition(){return layout("Recognition","Recognition",frontierRecognition(BASE));}

function research(){
  return layout("Research & Methods","Research",`<main id="main" tabindex="-1" class="site-main research-index">
    <section class="page-hero research-intro" aria-labelledby="research-title">
      <div class="shell">
        <div class="kicker">ANEVUM / Research &amp; Methods / Founding preview</div>
        <h1 id="research-title" class="serif">Inquiry starts with <em>a testable question.</em></h1>
        <p>Explore transparent scientific teaching models, examine their assumptions and record what they actually demonstrate. The institute is being built around reproducible work, not claims of research it has not conducted.</p>
        <div class="research-actions"><a class="academic-primary" href="${BASE}/dossier">Open the Research Desk <span aria-hidden="true">→</span></a><a class="academic-secondary" href="${BASE}/recognition">Read the proposed evidence standard <span aria-hidden="true">→</span></a></div>
        <p class="research-disclosure">Independent education preview · No peer-reviewed findings, operating research departments, clinical validation or physical GPU cluster is claimed.</p>
      </div>
    </section>
    <section class="shell academic-section" aria-labelledby="research-models-title">
      <div class="academic-section-label"><span>01 / EXPERIMENT DIRECTORY</span><span>Available now · Three browser-based models</span></div>
      <div class="academic-heading-row"><div><h2 id="research-models-title" class="serif">Inspect the model. <em>Challenge its limits.</em></h2><p>These are runnable learning instruments, not results from original empirical studies. Each model is explicit about what is simulated and what is not measured.</p></div></div>
      <div class="research-experiment-grid">
        <article class="research-experiment">
          <div class="research-experiment-meta"><span>CFP-101 · DIGITAL LOGIC</span><strong>IDEAL MODEL</strong></div>
          <h3>Boolean switching</h3><p>Change two inputs and reproduce all four rows of an AND-gate truth table.</p>
          <p class="research-assumption"><strong>Boundary</strong> No transistor timings, voltage measurements or physical circuit simulation.</p>
          <a href="${BASE}/laboratory/and-gate">Run the logic experiment <span aria-hidden="true">→</span></a>
        </article>
        <article class="research-experiment">
          <div class="research-experiment-meta"><span>COMPUTE-LAB-001 · SYSTEMS</span><strong>SIMULATED</strong></div>
          <h3>GPU scheduling</h3><p>Compare idealized scheduling policies, queue behavior and slot utilization across a small example workload.</p>
          <p class="research-assumption"><strong>Boundary</strong> No GPU hardware, real cluster access or performance benchmarks.</p>
          <a href="${BASE}/laboratory/cluster-scheduling">Run the scheduling model <span aria-hidden="true">→</span></a>
        </article>
        <article class="research-experiment">
          <div class="research-experiment-meta"><span>NEURO-LAB-001 · COMPUTATION</span><strong>TEACHING MODEL</strong></div>
          <h3>Neuron dynamics</h3><p>Explore threshold, leakage and refractory behavior in an idealized leaky integrate-and-fire neuron.</p>
          <p class="research-assumption"><strong>Boundary</strong> No neural recordings, biological validation or clinical diagnosis.</p>
          <a href="${BASE}/laboratory/neuron-dynamics">Run the neuron model <span aria-hidden="true">→</span></a>
        </article>
      </div>
    </section>
    <section class="research-methods" aria-labelledby="research-workflow-title"><div class="shell academic-section">
      <div class="academic-section-label"><span>02 / PRACTICAL METHOD</span><span>Working local workflow · External review proposed</span></div>
      <div class="academic-heading-row"><div><h2 id="research-workflow-title" class="serif">From observation <em>to a record.</em></h2><p>ANEVUM provides a private, browser-local place to describe and export investigations. Independent validation and publication workflows are future work.</p></div></div>
      <ol class="research-method-steps">
        <li><span>01</span><div><h3>Define the question</h3><p>Record an explicit hypothesis and the assumptions under which it could be tested.</p></div></li>
        <li><span>02</span><div><h3>Run a model</h3><p>Vary inputs and save the model's generated observations as a portable JSON notebook.</p></div></li>
        <li><span>03</span><div><h3>Document the evidence</h3><p>Import the simulation into your Research Desk; record method, limits and references locally.</p></div></li>
        <li><span>04</span><div><h3>Separate review from practice</h3><p>Export the draft for scrutiny. No independent review, publication or credential is automatic.</p></div></li>
      </ol>
      <div class="research-next"><div><strong>Start a documented investigation</strong><p>Open the existing Research Desk and import a laboratory notebook. The record stays on this browser unless you export it.</p></div><a class="academic-primary" href="${BASE}/dossier">Go to Research Desk <span aria-hidden="true">→</span></a></div>
    </div></section>
    <section class="shell academic-section research-status" aria-labelledby="research-status-title">
      <div class="academic-section-label"><span>03 / INSTITUTE STATUS</span><span>Scope and boundaries</span></div>
      <h2 id="research-status-title" class="serif">An open research ambition, <em>not a claimed institution.</em></h2>
      <p>AI model validation, distributed computing, mathematics, physics, neuroscience, biophysics and neuropsychology are intended directions. ANEVUM does not currently claim employed faculty, operating research departments, accreditation, university status, original clinical studies or issued academic credentials.</p>
      <a class="academic-text-link" href="${BASE}/academy">Return to available coursework →</a>
    </section>
  </main>`);
}

function dossier(){return layout("Research Desk","My Studio",dossierPage(BASE));}
function memberStudio(){return layout("My Studio","My Studio",localStudioPage(BASE));}
function memberProfile(){return layout("Private Learner Card","My Studio",localProfilePage(BASE));}
function clusterScheduling(){return layout("GPU Cluster Scheduling Simulation","Laboratory",CLUSTER_SCHEDULER_HTML);}
function neuronLab(){return layout("Leaky Integrate-and-Fire Neuron Simulation","Laboratory",NEURON_LIF_HTML);}

function academy(){
  return layout("Academy","Academy",`<main id="main" tabindex="-1" class="site-main">
    <section class="page-hero"><div class="shell"><div class="kicker">01 / Open Academy</div>
     <h1 class="serif">Learn by building. <em>Verify by doing.</em></h1><p>Open scientific education organized around working lessons, experiments and reproducible reasoning. Start with the material available today; other schools remain proposed.</p></div></section>
    <section class="shell section compact-academy"><div class="catalog-layout">
      <aside class="aside-panel"><div class="kicker">Six disciplines / proposed</div><h2>Fields of study</h2><ul class="discipline-list"><li>Computing &amp; systems engineering</li><li>Artificial intelligence &amp; machine learning</li><li>Mathematics &amp; physical sciences</li><li>Neuroscience &amp; cognitive science</li><li>Biology &amp; biophysics</li><li>Neuropsychology &amp; human behavior</li></ul><p>These groupings are proposed—not operational faculties, degrees, or clinical qualifications.</p></aside>
      <div class="academy-main"><div class="academy-tools"><span class="kicker">Ready to study / 01 course</span><a class="academy-jump" data-course-resume href="${BASE}/learn/cfp-101/transistor-switching">Begin lesson 01 →</a><span class="academy-practice" data-course-activity-status>Browser-local practice only</span></div>
        <article class="course-card"><div><div class="course-meta"><span>CFP-101</span><span>Foundational</span><span>Free / Self-paced</span></div>
          <h3>Computing From First Principles</h3><p>Explore transistor switching, Boolean logic, binary arithmetic, clocked registers, addressed memory, fictional assembly and systems software through eight original preview lessons, a fictional eight-bit computer, an inverter demonstration and two ideal Boolean experiments. Formal assessment and independent curriculum review remain unfinished.</p>
          <a class="btn small" href="${BASE}/academy/cfp-101">Open course ↗</a>
        </div></article>
        ${academyLearningDirectory(BASE)}
        <section class="academy-laboratory-directory" aria-labelledby="academy-laboratories-title">
          <div class="academy-directory-heading"><div><div class="kicker">02 / Working laboratories</div><h2 id="academy-laboratories-title">Experiment with a model.</h2></div><span class="academy-directory-count">3 browser simulations · No physical equipment</span></div>
          <p class="academy-directory-intro">Each instrument has explicit assumptions and exports an inspectable simulation record. These are educational models, not clinical experiments, hardware benchmarks or independently validated research.</p>
          <div class="academy-lab-grid">
            <article class="academy-lab-item"><div class="academy-lab-label"><span>CFP-101 / IDEAL DIGITAL LOGIC</span><span>4 INPUT STATES</span></div><h3>AND gate</h3><p>Predict a Boolean output, test every two-bit input pair and export your observations.</p><a href="${BASE}/laboratory/and-gate">Open AND-gate experiment <span aria-hidden="true">→</span></a></article>
            <article class="academy-lab-item"><div class="academy-lab-label"><span>COMPUTE-LAB-001 / SIMULATION</span><span>NO GPU HARDWARE</span></div><h3>GPU scheduling</h3><p>Compare two illustrative scheduling policies and inspect simulated queue and utilization metrics.</p><a href="${BASE}/laboratory/cluster-scheduling">Open the scheduling simulator <span aria-hidden="true">→</span></a></article>
            <article class="academy-lab-item"><div class="academy-lab-label"><span>NEURO-LAB-001 / TEACHING MODEL</span><span>NO NEURAL RECORDINGS</span></div><h3>Neuron dynamics</h3><p>Study leakage and threshold events using a deterministic leaky integrate-and-fire model.</p><a href="${BASE}/laboratory/neuron-dynamics">Open neuron dynamics model <span aria-hidden="true">→</span></a></article>
          </div>
          <p class="academy-laboratory-note">The half-adder workbench is part of <a href="${BASE}/learn/cfp-101/half-adders">CFP-101 lesson 03</a>. Evidence drafting and exporting are available in the <a href="${BASE}/dossier">browser-local Research Desk</a>; no independent research review is provided.</p>
        </section>
        <div class="placeholder"><strong>More disciplines are being prepared.</strong>Rather than display fictitious course inventory, ANEVUM will add a subject only when its lessons, sources, exercises and review status are ready.</div>
      </div></div>
    </section>
  </main>`);
}

function program(){
  const available=CFP_101.units.filter(unit=>unit.availability==="preview").length;
  const units=CFP_101.units.map(unit=>[
    unit.number,unit.title,unit.displayStatus,unit.lessonPath
  ]);
  const cards=units.map(([number,name,state,href])=>`<article class="unit${href?' current':''}" data-unit-availability="${href?'available':'planned'}"><div class="index">${number}</div><div><h3>${name}</h3><p>${state}</p><div class="mark">${href?`<a href="${BASE}${href}">Study this lesson →</a>`:"Planned / Not yet published"}</div></div></article>`).join("");
  return layout("CFP-101 Course","Course",`<main id="main" tabindex="-1" class="site-main">
   <section class="page-hero"><div class="shell"><div class="crumb"><a href="${BASE}/academy">Academy</a> / School of Computing / CFP-101</div><div class="kicker">Founding course / 001</div>
    <h1 class="serif">Computing from <em>first principles.</em></h1><p>From semiconductors and switching through digital logic and computer architecture. The eight-unit syllabus now has introductory previews for every unit, with two ideal Boolean experiments; independent academic review and formal assessment remain incomplete. Independent course assessment remains unfinished.</p></div></section>
   <section class="shell section compact-course"><div class="section-head"><div><div class="kicker">The learning path / ${CFP_101.version}</div><h2 class="serif">Eight units. ${available} lessons available.</h2></div><a class="text-link" data-course-resume href="${BASE}/learn/cfp-101/transistor-switching">Begin lesson 01 →</a></div>
    <div class="course-controls"><div class="course-filter-buttons" role="group" aria-label="Filter syllabus units"><button type="button" data-unit-filter="all" aria-pressed="true">All 8 units</button><button type="button" data-unit-filter="available" aria-pressed="false">Available ${available} lessons</button></div><span class="course-activity" data-course-activity-status>Browser-local practice only</span><span class="course-filter-status" role="status" aria-live="polite" data-unit-filter-status>Showing all 8 units.</span></div>
    <div class="program-grid" data-course-units>${cards}</div>
    <div class="aside-panel institution-side"><h2>What completing the course should mean</h2><p>Derive digital logic from explicit assumptions; construct and verify circuits; explain how memory, processing, and instructions fit together; produce an independently inspectable computing artifact. No academic credit or degree is awarded. Prerequisites: comfortable arithmetic and willingness to learn basic algebra.</p><p>Content status: draft syllabus, version ${CFP_101.version}. This is not a completed 30–40 hour course, and no academic credit is offered.</p><p><a href="${BASE}/curriculum/cfp-101.json" download="anevum-cfp-101-curriculum.json">Download portable curriculum metadata (JSON) ↗</a></p></div>
   </section>
  </main>`);
}

function transistorLesson(){
  return layout("Lesson — Transistor Switching","Classroom",TRANSISTOR_LESSON_HTML.replace("</article>",studyToolsHtml("CFP-101-U01")+"</article>"),"CFP-101-U01");
}

function halfAdderLesson(){
  return layout("Lesson — Half Adders","Classroom",HALF_ADDER_LESSON_HTML.replace("</article>",studyToolsHtml("CFP-101-U03")+"</article>"),"CFP-101-U03");
}
function registerLesson(){
  return layout("Lesson — Clocked Registers","Classroom",REGISTER_LESSON_HTML.replace("</article>",studyToolsHtml("CFP-101-U04")+"</article>"),"CFP-101-U04");
}
function memoryLesson(){
  return layout("Lesson — Addressed Memory","Classroom",MEMORY_LESSON_HTML.replace("</article>",studyToolsHtml("CFP-101-U05")+"</article>"),"CFP-101-U05");
}
function assemblyLesson(){
  return layout("Lesson — Machine Code and Assembly","Classroom",ASSEMBLY_LESSON_HTML.replace("</article>",studyToolsHtml("CFP-101-U06")+"</article>"),"CFP-101-U06");
}
function cpuCapstoneLesson(){
  return layout("Lesson — Simulated Eight-Bit Computer","Classroom",CPU_CAPSTONE_HTML.replace("</article>",studyToolsHtml("CFP-101-U08")+"</article>"),"CFP-101-U08");
}
function systemsLesson(){
  return layout("Lesson — Computer Systems and Software","Classroom",SYSTEMS_LESSON_HTML.replace("</article>",studyToolsHtml("CFP-101-U07")+"</article>"),"CFP-101-U07");
}

function gateFigure(){
  return `<figure class="logic-box" aria-label="AND gate diagram"><svg viewBox="0 0 500 190" role="img" aria-labelledby="gate-svg-title gate-svg-desc"><title id="gate-svg-title">Two-input AND gate</title><desc id="gate-svg-desc">Inputs A and B enter a logical AND gate, resulting in output Q equal to A AND B.</desc>
    <g fill="none" stroke="#e2bf8b" stroke-width="3"><path d="M70 53H174M70 137H174M322 95H432"/><path d="M174 20H235A75 75 0 0 1 235 170H174Z"/></g>
    <g fill="#f0e6d9" font-family="system-ui,sans-serif" font-size="23"><text x="26" y="61">A</text><text x="26" y="146">B</text><text x="438" y="102">Q</text></g>
    <text x="240" y="104" text-anchor="middle" font-size="21" font-family="Georgia,serif" fill="#dfc28b">AND</text>
    </svg><figcaption>Logical symbol. The internal transistor implementation is not shown.</figcaption></figure>`;
}

function truthTable(attrs=false){
  return `<table class="data-table tabular" aria-label="AND gate truth table"><thead><tr><th scope="col">Input A</th><th scope="col">Input B</th><th scope="col">A AND B</th></tr></thead><tbody>
    ${[[0,0,0],[0,1,0],[1,0,0],[1,1,1]].map(([a,b,q])=>`<tr${attrs?` data-bits="${a}${b}"`:''}><td>${a}</td><td>${b}</td><td>${q}</td></tr>`).join("")}
  </tbody></table>`;
}

function lesson(){
  return layout("Lesson — AND Gates","Classroom",`<main id="main" tabindex="-1" class="site-main">
   <section class="page-hero"><div class="shell"><div class="crumb"><a href="${BASE}/academy">Academy</a> / <a href="${BASE}/academy/cfp-101">CFP-101</a> / Lesson 02</div>
    <div class="kicker">School of Computing / Lesson 02 / Open access</div><h1 class="serif">What makes an <em>AND gate</em> work?</h1><p>A rigorous introduction to Boolean logic, digital computation, and the physical assumptions behind switching circuits.</p></div></section>
   <section class="shell section"><div class="lesson-layout">
    <article class="lesson-article">
      <div class="kicker">Learning outcome</div><p>After this lesson, you should be able to write the Boolean expression for AND, predict every output, explain the relationship between the logical circuit and a CMOS implementation, and verify your reasoning experimentally.</p>
      <h2 id="bits">1. From voltage to a bit</h2>
      <p>Electronic circuits carry continuous voltages. Digital logic interprets specified ranges as two states, conventionally called 0 and 1. Real switching thresholds, noise margins, timing and power consumption matter, but we begin with an idealized two-state model.</p>
      <div class="callout"><p><strong>Model boundary:</strong> A bit is a logical abstraction, not a claim that physical electronics can only occupy two voltages.</p></div>
      <h2 id="rule">2. Define a logical operation</h2>
      <p>The AND function returns 1 if and only if both of its inputs equal 1. Write the inputs as A and B and the output as Q:</p>
      <p class="mathline">Q = A ∧ B</p>
      ${gateFigure()}
      <h3>All possible input pairs</h3><p>Two binary inputs have 2² = 4 possible combinations. A truth table lists the complete behavior of the function.</p>
      ${truthTable()}
      <h2 id="physical">3. How can transistors produce AND?</h2>
      <p>In static complementary MOS (CMOS) logic, a two-input NAND gate can be constructed from a pull-up network of p-channel transistors and a pull-down network of n-channel transistors. Its Boolean output is N = NOT(A AND B). Passing N through an inverter gives Q = NOT(N) = A AND B.</p>
      <p>That construction is one common implementation, not the only possible implementation. A real CMOS circuit has propagation delay, analog transition behavior, leakage and layout constraints that the truth table intentionally abstracts away.</p>
      <div class="callout"><p><strong>Why it matters:</strong> In a binary half-adder, the carry bit is A AND B, while the sum bit is A XOR B. Combining elementary logic functions eventually yields circuits capable of arithmetic.</p></div>
      <h2 id="check">4. Test your reasoning</h2><div class="quiz" data-quiz><div class="kicker">Knowledge check / One question</div><h3>Which operation outputs 1 only when both inputs are 1?</h3>
       <div class="answer-list" role="group" aria-label="Choose a Boolean operation">
        <button class="answer" type="button" aria-pressed="false" data-answer="or">OR — at least one input is 1</button>
        <button class="answer" type="button" aria-pressed="false" data-answer="and">AND — both inputs must be 1</button>
        <button class="answer" type="button" aria-pressed="false" data-answer="xor">XOR — exactly one input is 1</button>
       </div><p class="feedback" id="answer-feedback" role="status" aria-live="polite">Select an answer to receive feedback.</p><p class="fine-print" data-local-progress>Progress is stored only on this device.</p>
      </div>
      <h2 id="next">5. Verify it yourself</h2><p>In the laboratory, you will change both inputs, observe the output, and reproduce all four truth-table rows. This is an ideal Boolean model, not a transistor-level SPICE simulation.</p>
      <a class="btn" href="${BASE}/laboratory/and-gate">Open AND-gate experiment →</a>
      ${studyToolsHtml("CFP-101-U02")}
    </article>
    <aside class="lesson-sidebar" aria-label="Lesson index"><div class="kicker">Lesson 02 / Index</div><h2>Inside this lesson</h2><ul><li><a href="#bits">From voltage to a bit</a></li><li><a href="#rule">Boolean definition</a></li><li><a href="#physical">Transistor implementation</a></li><li><a href="#check">Knowledge check</a></li><li><a href="#next">Laboratory exercise</a></li></ul><p>Estimated reading: 7–10 minutes. No account required.</p><p><a href="${BASE}/learn/cfp-101/transistor-switching">← Previous: Transistors</a></p><p><a href="${BASE}/learn/cfp-101/half-adders">Next: Half adders →</a></p><p><a href="${BASE}/academy/cfp-101">Full course outline ↗</a></p></aside>
   </div></section>
  </main>`,"CFP-101-U02");
}

function lab(){
  return layout("AND Gate Laboratory","Laboratory",`<main id="main" tabindex="-1" class="site-main">
    <section class="page-hero"><div class="shell"><div class="crumb"><a href="${BASE}/learn/cfp-101/logic-gates">Lesson 02</a> / Laboratory 001</div><div class="kicker">Laboratory / Digital systems / Experiment 001</div>
      <h1 class="serif">Make logic <em>visible.</em></h1><p>Change two binary inputs, predict what should happen, and verify the complete truth table of an ideal AND gate. This simulation makes no network requests.</p></div></section>
    <section class="shell section"><div class="section-head"><div><div class="kicker">Interactive model / Two Boolean inputs</div><h2 class="serif">AND gate: Q = A ∧ B</h2></div><a class="text-link" href="${BASE}/learn/cfp-101/logic-gates">Read the lesson ↗</a></div>
      <div class="lab-layout" data-and-lab>
        <section class="panel" aria-labelledby="lab-bench"><div class="panel-label">Experiment bench / 001</div><h2 id="lab-bench">Set the inputs.</h2>
          <div class="bench"><svg viewBox="0 0 500 190" role="img" aria-label="AND gate with togglable inputs A and B; the output is shown below"><g fill="none" stroke="#d9b780" stroke-width="3"><path d="M70 53H174M70 137H174M322 95H432"/><path d="M174 20H235A75 75 0 0 1 235 170H174Z"/></g><g fill="#f0e6d9" font-family="system-ui,sans-serif" font-size="23"><text x="17" y="62">A:</text><text x="52" y="62" data-a-mark>0</text><text x="17" y="145">B:</text><text x="52" y="145" data-b-mark>0</text><text x="438" y="104">Q</text></g><text x="240" y="104" text-anchor="middle" font-size="20" font-family="Georgia,serif" fill="#dfc28b">AND</text></svg></div>
          <div class="switch-row" role="group" aria-label="Toggle binary inputs"><button class="switch" type="button" data-input="a" aria-pressed="false"><span class="indicator" aria-hidden="true"></span>Input A = <span data-switch-value>0</span></button><button class="switch" type="button" data-input="b" aria-pressed="false"><span class="indicator" aria-hidden="true"></span>Input B = <span data-switch-value>0</span></button></div>
          <div class="readout"><div><div class="panel-label">Observed output</div><span class="fine-print">Q = A AND B</span></div><strong data-output aria-live="polite" aria-label="Output">0</strong></div>
          <p class="fine-print">Both switches off is the starting case. Toggle either switch to explore all other combinations. There is no real-world electrical voltage model in this preview.</p>
        </section>
        <section class="panel" aria-labelledby="lab-truth"><div class="panel-label">Recorded observations</div><h2 id="lab-truth">Truth table</h2>${truthTable(true)}
          <div class="panel-label">Experiment coverage</div><p data-lab-progress aria-live="polite">1 of 4 input combinations tested</p><div class="progress-meter" aria-hidden="true"><span data-lab-meter></span></div>
          <p data-observation role="status" aria-live="polite">Predict the output, then change the input switches.</p>
          <div class="lab-actions"><button class="btn ghost small" type="button" data-reset>Restart experiment</button>
            <button class="btn ghost small" type="button" data-export>Export notebook (JSON)</button>
            <button class="btn small" type="button" data-to-dossier disabled>Review in Research Desk →</button></div>
          <p class="fine-print" role="status" aria-live="polite" data-export-status>Export the simulated observations from this session. No data is sent to ANEVUM.</p>
          <p class="fine-print">After testing all four input pairs, <strong>Review in Research Desk</strong> transfers a same-tab, session-only copy for validation and explicit approval. The working draft is never replaced or saved automatically. You can also <a href="${BASE}/dossier#logic-import">import a downloaded notebook manually</a>. This is not independently verified research.</p>
          <p class="fine-print" data-local-progress>Progress is stored only on this device.</p>
        </section>
      </div>
      <div class="aside-panel" style="margin-top:23px"><h2>Scientific interpretation</h2><p>AND is defined mathematically by its truth table. This browser simulation evaluates the ideal Boolean function Q = A ∧ B; it is not a physical transistor circuit. The next step would be to construct a CMOS NAND gate followed by an inverter, then compare real switching behavior with this abstract model.</p><p><a href="${BASE}/learn/cfp-101/half-adders">Next lesson: Use AND and XOR to build a half adder →</a></p></div>
    </section>
  </main>`);
}

const PAGES=new Map([[BASE,home],[BASE+"/",home],[BASE+"/academy",academy],[BASE+"/academy/cfp-101",program],[BASE+"/research",research],[BASE+"/recognition",recognition],[BASE+"/dossier",dossier],[BASE+"/studio",memberStudio],[BASE+"/profile",memberProfile],[BASE+"/learn/cfp-101/transistor-switching",transistorLesson],[BASE+"/learn/cfp-101/logic-gates",lesson],[BASE+"/learn/cfp-101/half-adders",halfAdderLesson],[BASE+"/learn/cfp-101/registers",registerLesson],[BASE+"/learn/cfp-101/addressed-memory",memoryLesson],[BASE+"/learn/cfp-101/assembly-code",assemblyLesson],[BASE+"/learn/cfp-101/computer-systems",systemsLesson],[BASE+"/learn/cfp-101/eight-bit-computer",cpuCapstoneLesson],[BASE+"/laboratory/and-gate",lab],[BASE+"/laboratory/cluster-scheduling",clusterScheduling],[BASE+"/laboratory/neuron-dynamics",neuronLab]]);

const ASSETS=new Map([
  [BASE+"/curriculum/cfp-101.json",["application/json; charset=utf-8",JSON.stringify(CFP_101,null,2)+"\n"]],
  [BASE+"/styles.css",["text/css; charset=utf-8",INSTITUTE_CSS+"\n"+CLUSTER_SCHEDULER_CSS+"\n"+NEURON_LIF_CSS+"\n"+CPU_CAPSTONE_CSS+"\n"+INSTITUTION_CSS]],
  [BASE+"/neuron-lif-model.js",["text/javascript; charset=utf-8",NEURON_LIF_MODEL_BROWSER_MODULE]],
  [BASE+"/neuron-lif-client.js",["text/javascript; charset=utf-8",NEURON_LIF_CLIENT_BROWSER_MODULE]],
  [BASE+"/cluster-scheduler-model.js",["text/javascript; charset=utf-8",CLUSTER_SCHEDULER_MODEL_BROWSER_MODULE]],
  [BASE+"/cluster-scheduler-client.js",["text/javascript; charset=utf-8",CLUSTER_SCHEDULER_CLIENT_BROWSER_MODULE]],
  [BASE+"/cpu-capstone-model.js",["text/javascript; charset=utf-8",CPU_CAPSTONE_MODEL_BROWSER_MODULE]],
  [BASE+"/cpu-capstone-client.js",["text/javascript; charset=utf-8",CPU_CAPSTONE_CLIENT_BROWSER_MODULE]],
  [BASE+"/client.js",["text/javascript; charset=utf-8",INSTITUTE_CLIENT]],
  [BASE+"/frontier-gl.js",["text/javascript; charset=utf-8",FRONTIER_GL_CLIENT]],
  [BASE+"/evidence-schema.js",["text/javascript; charset=utf-8",EVIDENCE_BROWSER_MODULE]],
  [BASE+"/evidence-workbench.js",["text/javascript; charset=utf-8",EVIDENCE_WORKBENCH_CLIENT]],
  [BASE+"/local-member-schema.js",["text/javascript; charset=utf-8",LOCAL_MEMBER_BROWSER_MODULE]],
  [BASE+"/local-member-client.js",["text/javascript; charset=utf-8",LOCAL_MEMBER_CLIENT]],
  [BASE+"/mark.svg",["image/svg+xml; charset=utf-8",ANEVUM_MARK_SVG]],
  [BASE+"/mark-small.svg",["image/svg+xml; charset=utf-8",ANEVUM_FAVICON_SVG]],
  [BASE+"/observatory.svg",["image/svg+xml; charset=utf-8",ANEVUM_OBSERVATORY_SVG]]
]);

const REVIEW_MEDIA_FILES=new Set([FRONTIER_REVIEW_ART.desktop.name,FRONTIER_REVIEW_ART.mobile.name,FACILITY_DESIGN_ART.desktop.name,FACILITY_DESIGN_ART.mobile.name]);
const IMAGE_ASSETS=new Set(["lab-hero-v1.webp","lab-archive-v1.webp","research-generation-v1.webp","research-computation-v1.webp","research-worlds-v1.webp","rhen-generative-v1.webp"]);
const SECURITY={"Content-Security-Policy":"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; media-src 'self'; connect-src 'none'; font-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'","X-Frame-Options":"DENY","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow, noarchive","Cache-Control":"no-store","X-Anevum-Surface":"open-institute-design-review-v1"};

export default {async fetch(request,env={}){
  const url=new URL(request.url);
  if(url.protocol!=="https:"||url.hostname!=="anevum.com"||url.port||url.search){return new Response("Not found",{status:404});}
  const page=PAGES.get(url.pathname);
  const asset=ASSETS.get(url.pathname);
  const mediaName=url.pathname.startsWith(BASE+"/assets/")?url.pathname.slice((BASE+"/assets/").length):null;
  const media=mediaName&&IMAGE_ASSETS.has(mediaName)&&Object.hasOwn(LAB_ART,mediaName)?LAB_ART[mediaName]:null;
  const reviewName=url.pathname.startsWith(BASE+"/media/")?url.pathname.slice((BASE+"/media/").length):null;
  const previewAsset=reviewName&&REVIEW_MEDIA_FILES.has(reviewName)?reviewName:null;
  if(!page&&!asset&&!media&&!previewAsset)return new Response("Not found",{status:404});
  if(request.method!=="GET"&&request.method!=="HEAD")return new Response(null,{status:405,headers:{...SECURITY,Allow:"GET, HEAD"}});
  if(previewAsset){
    // No binary blobs are bundled into code. The isolated Node review server injects
    // a verified, same-origin loader; an unconfigured Worker fails closed.
    if(typeof env?.loadReviewMedia!=="function")return new Response("Not found",{status:404,headers:SECURITY});
    let bytes;
    try{bytes=await env.loadReviewMedia(previewAsset);}catch(_){return new Response("Not found",{status:404,headers:SECURITY});}
    if(!(bytes instanceof Uint8Array)||bytes.length<4096||bytes.length>2097152)return new Response("Not found",{status:404,headers:SECURITY});
    return new Response(request.method==="HEAD"?null:bytes,{status:200,headers:{...SECURITY,"Content-Type":"image/webp","Content-Length":String(bytes.length)}});
  }
  const isAsset=!!asset;
  const isMedia=!!media;
  const body=isMedia?Uint8Array.from(atob(media),c=>c.charCodeAt(0)):isAsset?asset[1]:page();
  return new Response(request.method==="HEAD"?null:body,{status:200,headers:{...SECURITY,"Content-Type":isMedia?"image/webp":isAsset?asset[0]:"text/html; charset=utf-8"}});
}};
