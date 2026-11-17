// CFP-101 / Lesson 01. Original educational content; isolated review, not accreditation.
export const TRANSISTOR_LESSON_HTML = String.raw`
<main id="main" tabindex="-1" class="site-main">
 <section class="page-hero"><div class="shell"><div class="crumb"><a href="/institute-preview/academy">Academy</a> / <a href="/institute-preview/academy/cfp-101">CFP-101</a> / Lesson 01</div>
  <div class="kicker">School of Computing / Lesson 01 / Open access preview</div><h1 class="serif">From matter to <em>switching.</em></h1>
  <p>Before Boolean gates and processors, we need to understand how controlled electrical conduction can represent a logical decision.</p></div></section>
 <section class="shell section"><div class="lesson-layout">
  <article class="lesson-article">
   <div class="kicker">Learning objectives / 10–15 minutes</div>
   <p>By the end, distinguish an ideal bit from a continuous voltage; explain the different roles of nMOS and pMOS in a complementary inverter; derive its two-row truth table; and identify which physical effects this browser model deliberately omits.</p>
   <div class="callout"><p><strong>Prerequisites:</strong> Basic arithmetic and the ideas of voltage, ground and a circuit connection. No prior electronics coursework is required. This is an instructional preview, not a validated engineering design tool.</p></div>
   <h2 id="material">1. A device that can control a path</h2>
   <p>Silicon is a semiconductor: its electrical properties can be altered through the material structure, added impurities (doping), and applied electric fields. In a metal–oxide–semiconductor field-effect transistor (MOSFET), the voltage on an insulated gate terminal influences how readily charge carriers can move through a channel between source and drain.</p>
   <p>The MOSFET is not a mechanical switch. Its current depends continuously on terminal voltages and device conditions. A digital abstraction treats selected operating regions as approximately <em>off</em> or <em>on</em>, and combines many devices into reliable logic.</p>
   <div class="callout"><p><strong>Misconception to avoid:</strong> A transistor does not inherently store one binary digit, nor does its voltage become literally restricted to 0 or 1. Digital states are assigned to ranges of physical values.</p></div>
   <h2 id="complement">2. Complementary devices make an inverter</h2>
   <p>Consider one familiar static CMOS arrangement: a p-channel MOSFET (pMOS) between the positive supply VDD and the output, and an n-channel MOSFET (nMOS) between the output and ground. Their gates receive the same input. In a simplified steady-state model, a low input turns the pMOS on and the nMOS off; a high input reverses those roles.</p>
   <figure class="logic-box" aria-labelledby="inverter-caption">
    <svg viewBox="0 0 530 345" role="img" aria-labelledby="inv-title inv-desc"><title id="inv-title">Conceptual CMOS inverter</title><desc id="inv-desc">Power rail VDD connects through the pMOS pull-up block to output Q. Output Q connects through the nMOS pull-down block to ground. Input A controls both blocks. This is a functional diagram, not a transistor schematic.</desc>
      <g stroke="#d9b17a" stroke-width="3" fill="none" stroke-linecap="round"><path d="M265 35V83M265 144V172M265 172V214M265 275V308M265 172H435M90 125H172M90 256H172M90 125V256"/></g>
      <rect x="172" y="83" width="186" height="61" rx="9" fill="#29463f" stroke="#b8d4bf"/><rect x="172" y="214" width="186" height="61" rx="9" fill="#263b46" stroke="#afc7d1"/>
      <g fill="#f4f1e8" font-size="19" font-family="system-ui,sans-serif" text-anchor="middle"><text x="265" y="115">pMOS pull-up</text><text x="265" y="246">nMOS pull-down</text><text x="265" y="25">VDD</text><text x="265" y="336">Ground</text><text x="447" y="179" text-anchor="start">Q</text><text x="75" y="187" text-anchor="end">Input A</text></g>
    </svg><figcaption id="inverter-caption">Functional paths only. The drawing is not a layout or a transistor-level circuit schematic.</figcaption>
   </figure>
   <p>For a stable input low, the pull-up network connects Q toward VDD. For a stable input high, the pull-down network connects Q toward ground. These high and low output levels become logical 1 and 0 when they satisfy the circuit's actual input/output voltage specifications.</p>
   <h2 id="logic">3. Derive the logical function</h2>
   <p>Let A be the interpreted binary input and Q the interpreted binary output. The ideal inverter implements logical negation:</p>
   <p class="mathline">Q = NOT(A)</p>
   <table class="data-table tabular" aria-label="Ideal CMOS inverter truth table"><thead><tr><th scope="col">Input A</th><th scope="col">pMOS</th><th scope="col">nMOS</th><th scope="col">Output Q</th></tr></thead><tbody><tr><td>0</td><td>Conducting</td><td>Off</td><td>1</td></tr><tr><td>1</td><td>Off</td><td>Conducting</td><td>0</td></tr></tbody></table>
   <h3 id="worked">Worked example</h3><p>Suppose A is interpreted as logical 1. The pull-down nMOS conducts and the pull-up pMOS is off in our ideal steady-state model. Q is interpreted as logical 0. Changing A to 0 reverses the conducting path, so Q becomes 1. This is why the circuit is called an <em>inverter</em>.</p>
   <h2 id="try">4. Test the ideal inverter</h2>
   <div class="quiz" data-inverter-demo>
     <div class="kicker">Interactive study / ideal steady-state model</div><h3>Change the input state.</h3>
     <button class="switch" type="button" data-inverter-toggle aria-pressed="false">Input A: <span data-inverter-input>0</span> <span class="fine-print">(toggle)</span></button>
     <div class="readout" style="margin-top:18px"><div><div class="panel-label">Predicted output</div><span class="fine-print">Q = NOT(A)</span></div><strong data-inverter-output aria-live="polite">1</strong></div>
     <p class="fine-print" data-inverter-explanation aria-live="polite">Input low: pMOS conducting, nMOS off; output high.</p>
   </div>
   <h2 id="limits">5. Where the binary model stops</h2>
   <p>A real inverter has a continuous voltage-transfer characteristic, finite transition times, capacitive loading, power consumption and leakage. During input changes, both transistors can briefly conduct. The device threshold voltage is not interchangeable with a specified logic-input threshold. This model cannot determine any numerical voltages, currents, energy use or delay.</p>
   <div class="callout"><p><strong>Formal assumption:</strong> The digital truth table applies only after stable high/low input and output levels have been interpreted according to a particular technology's electrical specifications. No transistor parameters have been measured or simulated here.</p></div>
   <h2 id="assessment">6. Check your reasoning</h2>
   <div class="quiz"><div class="kicker">Knowledge check / One question</div><h3>In our ideal CMOS inverter, when input A is 1, what is output Q?</h3>
    <div class="answer-list" role="group" aria-label="Choose inverter output">
      <button class="answer" type="button" aria-pressed="false" data-inverter-answer="high">1, because both devices conduct</button>
      <button class="answer" type="button" aria-pressed="false" data-inverter-answer="low">0, because the pull-down path conducts</button>
      <button class="answer" type="button" aria-pressed="false" data-inverter-answer="floating">Undetermined, because both devices are off</button>
    </div><p class="feedback" id="inverter-feedback" role="status" aria-live="polite">Select an answer to receive feedback.</p>
    <p class="fine-print" data-local-progress>Progress is stored only on this device.</p>
   </div>
   <h2 id="practice">7. Practice and extend</h2>
   <ol><li>Draw the two conducting paths for A = 0 and A = 1, and justify the output in each case.</li><li>Explain why a truth table alone cannot predict how many nanoseconds it takes for Q to change.</li><li>Predict what happens if a circuit's input voltage is neither a guaranteed low nor a guaranteed high. Why must real specifications define valid ranges?</li></ol>
   <p><strong>Further investigation:</strong> Study the voltage-transfer curve of a CMOS inverter, then investigate why two-input NAND logic can be combined with this inverter to implement AND.</p>
   <h2 id="sources">References and provenance</h2>
   <p>Original ANEVUM introductory explanation, version 0.1, prepared for editorial review. Scientific background: <a href="https://ocw.mit.edu/courses/6-012-microelectronic-devices-and-circuits-spring-2009/pages/lecture-notes/" target="_blank" rel="noopener noreferrer">MIT OpenCourseWare 6.012, lectures 8 and 11–13 (MOSFET characteristics and CMOS inverter)</a>. External materials are referenced, not reproduced. No faculty affiliation or external editorial endorsement is claimed.</p>
   <p><a class="btn" href="/institute-preview/learn/cfp-101/logic-gates">Continue to Lesson 02: AND gates →</a></p>
  </article>
  <aside class="lesson-sidebar" aria-label="Lesson index"><div class="kicker">Lesson 01 / Index</div><h2>Inside this lesson</h2><ul><li><a href="#material">Semiconductors</a></li><li><a href="#complement">Complementary devices</a></li><li><a href="#logic">Truth table</a></li><li><a href="#try">Interactive inverter</a></li><li><a href="#assessment">Knowledge check</a></li><li><a href="#practice">Practice</a></li><li><a href="#sources">References</a></li></ul><p>Source status: original preview material, editorial review pending. No accreditation.</p><p><a href="/institute-preview/academy/cfp-101">Full course outline ↗</a></p></aside>
 </div></section>
</main>
`;