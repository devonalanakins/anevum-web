// ANEVUM.WEB.DESIGN.2026-11-17.001 — isolated Open Institute design and learning preview.

// No Cloudflare route, auth, API, database or production binding is owned by this module.

import {INSTITUTE_CSS} from "./styles.mjs";

import {INSTITUTE_CLIENT} from "./client.mjs";
import {TRANSISTOR_LESSON_HTML} from "./transistor-lesson.mjs";
import {CFP_101} from "./curriculum.mjs";
import {ANEVUM_MARK_SVG, ANEVUM_OBSERVATORY_SVG} from "./artwork.mjs";
import {LAB_ART} from "../anevum-public-studio/living-laboratory-art.mjs";

const BASE="/institute-preview";

function navigation(active){
  const links=[
    ["Institute",BASE],
    ["Academy",BASE+"/academy"],
    ["Laboratory",BASE+"/laboratory/and-gate"]
  ];
  const makeLinks=()=>links.map(([name,href])=>`<a href="${href}"${(name===active||active==="Course"&&name==="Academy"||active==="Classroom"&&name==="Academy")?' aria-current="page"':''}>${name}</a>`).join("");
  return `<a class="skip" href="#main">Skip to main content</a>
  <header class="mast"><div class="mast-inner">
    <a class="identity" href="${BASE}" aria-label="ANEVUM Open Institute, home"><img class="identity-mark" src="${BASE}/mark.svg" width="59" height="59" alt="" decoding="async"><span><span class="identity-text">ANEVUM</span><span class="identity-caption">The Open Institute</span></span></a>
    <nav class="desk-nav" aria-label="Primary navigation">${makeLinks()}</nav>
    <a class="mast-action" href="${BASE}/learn/cfp-101/transistor-switching">Start learning <span aria-hidden="true">→</span></a>
    <details class="mobile-menu"><summary>Menu</summary><nav class="nav-menu" aria-label="Mobile navigation">${makeLinks()}</nav></details>
  </div></header>`;
}

function footer(){
  return `<footer class="footer"><div class="shell footer-inner">
    <div><div class="footer-brand">ANEVUM <span style="font-family:system-ui,sans-serif;letter-spacing:.09em;font-size:10px;color:#b6c6c6">THE OPEN INSTITUTE</span></div><p>An independent, non-accredited open-education and research project. No degrees or academic credit are offered. Free educational material; no sign-in required for this preview.</p></div>
    <div><div class="preview-flag">Isolated design review / Not a public launch</div><p>The Academy currently contains two preview lessons and a Boolean laboratory. Other spaces and courses remain proposed.</p><p><a href="/original-works/archive">Visit the existing ANEVUM archive</a> · <a href="${BASE}">Return to Institute</a></p></div>
  </div></footer>`;
}

function layout(title,active,body){
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><meta name="color-scheme" content="dark"><link rel="icon" type="image/svg+xml" href="${BASE}/mark.svg">
<meta name="description" content="ANEVUM Open Institute design preview: free, self-directed computing education and a working digital logic experiment.">
<title>${title} — ANEVUM Open Institute (Design Preview)</title>
<link rel="stylesheet" href="${BASE}/styles.css"><script defer src="${BASE}/client.js"></script>
</head><body data-area="${active.toLowerCase()}">${navigation(active)}<div class="preview-ribbon"><strong>Design review:</strong> ANEVUM is an independent, non-accredited open education project. Only two introductory lessons and the Boolean laboratory are implemented.</div>${body}${footer()}</body></html>`;
}

function home(){
  return layout("Institute","Institute",`<main id="main" tabindex="-1" class="site-main">
    <section class="hero" aria-labelledby="home-title"><div class="shell hero-inner">
      <div class="kicker">Independent education · Open inquiry · Collective knowledge</div>
      <h1 id="home-title" class="serif">An open institute for <em>curious minds.</em></h1>
      <p class="hero-lead">A living open institute for independent minds. Study scientific foundations, perform real experiments, and contribute to an evolving body of knowledge—freely, on your own time.</p>
      <div class="hero-actions"><a class="btn" href="${BASE}/academy">Explore the Academy <span aria-hidden="true">↗</span></a><a class="btn ghost" href="${BASE}/learn/cfp-101/transistor-switching">Start a free lesson <span aria-hidden="true">→</span></a></div>
      <p class="truth">Freely accessible · Independently paced · Evidence before claims</p>
    </div><div class="hero-stamp" aria-hidden="true">ANEVUM / OBSERVATORY 001<span>A conceptual institute, not a physical campus</span></div></section>
    <div class="hero-rail"><div class="shell rail-inner"><span><strong>01</strong>Study independently</span><span><strong>02</strong>Experiment directly</span><span><strong>03</strong>Review the evidence</span><span><strong>04</strong>Improve knowledge openly</span></div></div>
    <section class="shell section" aria-labelledby="spaces"><div class="section-head"><div><div class="kicker">Explore the institute</div><h2 id="spaces" class="serif">Four connected worlds of inquiry.</h2></div><p class="section-lead">The architecture invites curiosity. The workspaces make it useful. Some departments are still being designed, and are clearly marked as such.</p></div>
      <div class="space-grid">
        <a class="space-card library" href="${BASE}/academy"><span class="space-num">01 / LEARNING</span><h3>Academy</h3><p>A structured entry into the foundations of science and computing.</p><span class="space-status">Explore the catalog ↗</span></a>
        <a class="space-card lab" href="${BASE}/laboratory/and-gate"><span class="space-num">02 / EXPERIMENT</span><h3>Laboratory</h3><p>Manipulate real digital logic and test a precise prediction.</p><span class="space-status">Open the first experiment ↗</span></a>
        <article class="space-card research"><span class="space-num">03 / INVESTIGATE</span><h3>Research</h3><p>Transparent methods and reproducible findings, once reviewed.</p><span class="space-status">Research program / proposed</span></article>
        <article class="space-card commons"><span class="space-num">04 / CONTRIBUTE</span><h3>Commons</h3><p>Open review, collective learning, and responsible contributions.</p><span class="space-status">Community platform / proposed</span></article>
      </div>
    </section>
    <section class="shell section" aria-labelledby="featured"><div class="section-head"><div><div class="kicker">The founding course</div><h2 id="featured" class="serif">Begin at the foundations.</h2></div></div>
      <div class="course-feature"><div class="course-feature-copy"><span class="chip">CFP-101 / School of Computing</span><h3>Computing From First Principles</h3>
       <p>Follow the reasoning from bits and logic toward real computing systems. Two introductory lessons and one lab are available in this isolated preview; the remainder of the course is not yet published.</p>
       <ol class="course-steps"><li>Transistors</li><li>Logic</li><li>Circuits</li><li>Architecture</li><li>Software</li><li>AI</li></ol>
       <a class="btn small" href="${BASE}/academy/cfp-101">View the syllabus ↗</a></div></div>
    </section>
  </main>`);
}

function academy(){
  return layout("Academy","Academy",`<main id="main" tabindex="-1" class="site-main">
    <section class="page-hero"><div class="shell"><div class="kicker">01 / The Grand Library</div>
     <h1 class="serif">Study without a <em>deadline.</em></h1><p>An expanding library of rigorous, independently paced scientific education. No paywall. No admission criteria. Start with the course that exists today.</p></div></section>
    <section class="shell section"><div class="catalog-layout">
      <aside class="aside-panel"><div class="kicker">Schools / proposed</div><h2>Fields of study</h2><ul><li>Computing &amp; artificial intelligence</li><li>Mathematics</li><li>Physics</li><li>Neuroscience &amp; living systems</li><li>Scientific methods</li></ul><p>These are planned academic groupings—not operational faculties or degree programs.</p></aside>
      <div><div class="kicker">Available instructional preview / 001</div>
        <article class="course-card"><div><div class="course-meta"><span>CFP-101</span><span>Foundational</span><span>Free / Self-paced</span></div>
          <h3>Computing From First Principles</h3><p>Explore transistor switching and digital logic with two original introductory lessons, self-assessments, an inverter demonstration, and a Boolean AND laboratory. The full course is not complete.</p>
          <a class="btn small" href="${BASE}/academy/cfp-101">Open course ↗</a>
        </div></article>
        <div class="placeholder"><strong>More disciplines are being prepared.</strong>Rather than display fictitious course inventory, ANEVUM will add a subject only when its lessons, sources, exercises and review status are ready.</div>
      </div></div>
    </section>
  </main>`);
}

function program(){
  const units=CFP_101.units.map(unit=>[
    unit.number,unit.title,unit.displayStatus,unit.lessonPath
  ]);
  const cards=units.map(([number,name,state,href])=>`<article class="unit${href?' current':''}"><div class="index">${number}</div><div><h3>${name}</h3><p>${state}</p><div class="mark">${href?`<a href="${BASE}${href}">Study this lesson →</a>`:"Planned / Not yet published"}</div></div></article>`).join("");
  return layout("CFP-101 Course","Course",`<main id="main" tabindex="-1" class="site-main">
   <section class="page-hero"><div class="shell"><div class="crumb"><a href="${BASE}/academy">Academy</a> / School of Computing / CFP-101</div><div class="kicker">Founding course / 001</div>
    <h1 class="serif">Computing from <em>first principles.</em></h1><p>From semiconductors and switching through digital logic and computer architecture. The eight-unit program is a planned syllabus; two introductory preview lessons and one laboratory are currently implemented.</p></div></section>
   <section class="shell section"><div class="section-head"><div><div class="kicker">The learning path</div><h2 class="serif">Eight units. Two lessons available.</h2></div><a class="text-link" href="${BASE}/learn/cfp-101/transistor-switching">Begin available lesson ↗</a></div>
    <div class="program-grid">${cards}</div>
    <div class="aside-panel institution-side"><h2>What completing the course should mean</h2><p>Derive digital logic from explicit assumptions; construct and verify circuits; explain how memory, processing, and instructions fit together; produce an independently inspectable computing artifact. No academic credit or degree is awarded. Prerequisites: comfortable arithmetic and willingness to learn basic algebra.</p><p>Content status: draft syllabus, version ${CFP_101.version}. This is not a completed 30–40 hour course, and no academic credit is offered.</p><p><a href="${BASE}/curriculum/cfp-101.json" download="anevum-cfp-101-curriculum.json">Download portable curriculum metadata (JSON) ↗</a></p></div>
   </section>
  </main>`);
}

function transistorLesson(){
  return layout("Lesson — Transistor Switching","Classroom",TRANSISTOR_LESSON_HTML);
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
    </article>
    <aside class="lesson-sidebar" aria-label="Lesson index"><div class="kicker">Lesson 02 / Index</div><h2>Inside this lesson</h2><ul><li><a href="#bits">From voltage to a bit</a></li><li><a href="#rule">Boolean definition</a></li><li><a href="#physical">Transistor implementation</a></li><li><a href="#check">Knowledge check</a></li><li><a href="#next">Laboratory exercise</a></li></ul><p>Estimated reading: 7–10 minutes. No account required.</p><p><a href="${BASE}/learn/cfp-101/transistor-switching">← Previous: Transistors</a></p><p><a href="${BASE}/academy/cfp-101">Full course outline ↗</a></p></aside>
   </div></section>
  </main>`);
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
            <button class="btn ghost small" type="button" data-export>Export notebook (JSON)</button></div>
          <p class="fine-print" role="status" aria-live="polite" data-export-status>Export the simulated observations from this session. No data is sent to ANEVUM.</p>
          <p class="fine-print" data-local-progress>Progress is stored only on this device.</p>
        </section>
      </div>
      <div class="aside-panel" style="margin-top:23px"><h2>Scientific interpretation</h2><p>AND is defined mathematically by its truth table. This browser simulation evaluates the ideal Boolean function Q = A ∧ B; it is not a physical transistor circuit. The next step would be to construct a CMOS NAND gate followed by an inverter, then compare real switching behavior with this abstract model.</p></div>
    </section>
  </main>`);
}

const PAGES=new Map([[BASE,home],[BASE+"/",home],[BASE+"/academy",academy],[BASE+"/academy/cfp-101",program],[BASE+"/learn/cfp-101/transistor-switching",transistorLesson],[BASE+"/learn/cfp-101/logic-gates",lesson],[BASE+"/laboratory/and-gate",lab]]);

const ASSETS=new Map([
  [BASE+"/curriculum/cfp-101.json",["application/json; charset=utf-8",JSON.stringify(CFP_101,null,2)+"\n"]],
  [BASE+"/styles.css",["text/css; charset=utf-8",INSTITUTE_CSS]],
  [BASE+"/client.js",["text/javascript; charset=utf-8",INSTITUTE_CLIENT]],
  [BASE+"/mark.svg",["image/svg+xml; charset=utf-8",ANEVUM_MARK_SVG]],
  [BASE+"/observatory.svg",["image/svg+xml; charset=utf-8",ANEVUM_OBSERVATORY_SVG]]
]);

const IMAGE_ASSETS=new Set(["lab-hero-v1.webp","lab-archive-v1.webp","research-generation-v1.webp","research-computation-v1.webp","research-worlds-v1.webp","rhen-generative-v1.webp"]);
const SECURITY={"Content-Security-Policy":"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; font-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'","X-Frame-Options":"DENY","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow, noarchive","Cache-Control":"no-store","X-Anevum-Surface":"open-institute-design-review-v1"};

export default {async fetch(request){
  const url=new URL(request.url);
  if(url.protocol!=="https:"||url.hostname!=="anevum.com"||url.port||url.search){return new Response("Not found",{status:404});}
  const page=PAGES.get(url.pathname);
  const asset=ASSETS.get(url.pathname);
  const mediaName=url.pathname.startsWith(BASE+"/assets/")?url.pathname.slice((BASE+"/assets/").length):null;
  const media=mediaName&&IMAGE_ASSETS.has(mediaName)&&Object.hasOwn(LAB_ART,mediaName)?LAB_ART[mediaName]:null;
  if(!page&&!asset&&!media)return new Response("Not found",{status:404});
  if(request.method!=="GET"&&request.method!=="HEAD")return new Response(null,{status:405,headers:{...SECURITY,Allow:"GET, HEAD"}});
  const isAsset=!!asset;
  const isMedia=!!media;
  const body=isMedia?Uint8Array.from(atob(media),c=>c.charCodeAt(0)):isAsset?asset[1]:page();
  return new Response(request.method==="HEAD"?null:body,{status:200,headers:{...SECURITY,"Content-Type":isMedia?"image/webp":isAsset?asset[0]:"text/html; charset=utf-8"}});
}};
