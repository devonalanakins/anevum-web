// CFP-101 / Unit 04: original introductory material for an ideal clocked register.
// No claims about transistor timing, real flip-flops, physical measurement or credentials.
export function evaluateClockedRegister(q,d,risingEdge=false){
  const valid=bits=>Array.isArray(bits)&&bits.length===4&&bits.every(x=>x===0||x===1);
  if(!valid(q)||!valid(d)||typeof risingEdge!=="boolean"){
    throw new TypeError("A clocked four-bit register needs binary 4-bit arrays and a Boolean edge");
  }
  return [...(risingEdge?d:q)];
}

export const REGISTER_LESSON_HTML=String.raw`
<main id="main" tabindex="-1" class="site-main">
  <section class="page-hero"><div class="shell">
    <div class="crumb"><a href="/institute-preview/academy">Academy</a> /
      <a href="/institute-preview/academy/cfp-101">CFP-101</a> / Lesson 04</div>
    <div class="kicker">School of Computing / Sequential Logic / Introductory preview</div>
    <h1 class="serif">How does a circuit <em>remember?</em></h1>
    <p>Construct a four-bit clocked register in an ideal teaching model. Change its input, apply a discrete clock event, and discover why storage is different from combinational logic.</p>
  </div></section>
  <section class="shell section"><div class="lesson-layout">
    <article class="lesson-article">
      <div class="kicker">CFP-101-U04 / Learning objectives</div>
      <p>Distinguish combinational and sequential logic, model a D-type storage element, predict when a four-bit register holds or captures information, and explain which physical constraints this model excludes.</p>
      <div class="callout"><p><strong>Prerequisite:</strong> A half-adder produces outputs from its current inputs without storing history. Complete <a href="/institute-preview/learn/cfp-101/half-adders">Lesson 03</a> first if that distinction is unfamiliar.</p></div>

      <h2 id="memory">1. Combinational logic has no memory</h2>
      <p>The half-adder computes two bits from A and B. If those inputs change, the ideal sum and carry change too. A register behaves differently: its stored bits, called <strong>Q</strong>, can remain fixed while its input bits, called <strong>D</strong>, change.</p>
      <p>That persistence allows a computation to use results from earlier steps. A computer needs both operations that transform bits and storage elements that preserve them between operations.</p>

      <h2 id="edge">2. A clocked element samples on an event</h2>
      <p>We model four edge-triggered D-type storage elements sharing a clock. For each bit, the next stored value is the current input bit <strong>when the rising clock edge occurs</strong>. Between those edges, the stored value holds:</p>
      <p class="mathline">Q(next) = D at ↑CLK; otherwise Q(next) = Q</p>
      <p>This is a <strong>discrete event model</strong>. The "Clock ↑" button below represents one ideal rising-edge event. This is not a physical circuit or timing simulator: it does not simulate a changing voltage, clock frequency, propagation delay, transistor topology or electrical signal.</p>
      <table class="data-table tabular" aria-label="Ideal edge-triggered register transition rule">
        <thead><tr><th scope="col">Event</th><th scope="col">Input D</th><th scope="col">Next Q</th></tr></thead>
        <tbody>
          <tr><td>No rising edge</td><td>May change</td><td>Unchanged</td></tr>
          <tr><td>Rising edge</td><td>Sampled</td><td>Copy of D</td></tr>
        </tbody>
      </table>

      <h2 id="bench">3. Test a four-bit register</h2>
      <p>Start with Q = 0000. Toggle individual input bits to form D = 1010, and notice Q stays unchanged. Apply one Clock ↑ event to capture that word. Change D again: Q must still hold the previously captured word until the next clock event.</p>
      <section class="register-bench" data-register-bench aria-labelledby="register-bench-title">
        <div class="register-head"><span>ANEVUM / IDEAL SEQUENTIAL LOGIC</span><span>CFP-101-REG-001 · DEMONSTRATION</span></div>
        <h3 id="register-bench-title">Four-bit register workbench</h3>
        <div class="register-grid">
          <div class="register-input-panel">
            <div class="register-meta">D / Input bus <small>Adjust the next word</small></div>
            <div class="register-bit-switches" role="group" aria-label="Set the four D input bits">
              <button type="button" data-register-bit="0" aria-pressed="false">D3 <strong data-register-bit-value>0</strong></button>
              <button type="button" data-register-bit="1" aria-pressed="false">D2 <strong data-register-bit-value>0</strong></button>
              <button type="button" data-register-bit="2" aria-pressed="false">D1 <strong data-register-bit-value>0</strong></button>
              <button type="button" data-register-bit="3" aria-pressed="false">D0 <strong data-register-bit-value>0</strong></button>
            </div>
            <p class="register-word">D = <strong data-register-d>0000</strong></p>
          </div>
          <div class="register-output-panel">
            <div class="register-meta">Q / Stored bus <small>Holds between clock edges</small></div>
            <strong class="register-output" data-register-q aria-label="Stored four-bit word">0000</strong>
            <p class="register-word">Clock events: <strong data-register-count>0</strong></p>
          </div>
        </div>
        <div class="register-actions">
          <button type="button" data-register-clock>Clock ↑ · Capture D</button>
          <button type="button" data-register-reset>Reset teaching model</button>
          <button type="button" data-register-export>Export session (.json)</button>
        </div>
        <p data-register-status class="register-status" role="status" aria-live="polite">Q = 0000. Change D; Q will hold until you apply a clock edge.</p>
        <h4>Observed clock events</h4>
        <ol data-register-history class="register-history"><li>No clock events recorded yet.</li></ol>
        <p data-register-export-status class="half-fine" role="status" aria-live="polite">All observations remain in this page session. Export is a teaching-model record, not a Research Desk submission or independent verification.</p>
        <noscript><p>The workbench needs JavaScript. The model rule and transition table above remain readable.</p></noscript>
      </section>

      <h2 id="reasoning">4. Check the distinction</h2>
      <div class="quiz" data-register-quiz>
        <div class="kicker">Self-check / No score or credential</div>
        <h3>If Q = 0011 and D changes to 1010, what is Q before another clock edge?</h3>
        <div class="answer-list" role="group" aria-label="Select the stored register output before a new clock edge">
          <button type="button" class="answer" aria-pressed="false" data-register-answer="0011">0011 — the previously stored value</button>
          <button type="button" class="answer" aria-pressed="false" data-register-answer="1010">1010 — the new input</button>
          <button type="button" class="answer" aria-pressed="false" data-register-answer="0000">0000 — every input change clears storage</button>
        </div>
        <p data-register-quiz-status class="feedback" role="status" aria-live="polite">Select a prediction to see the explanation.</p>
      </div>

      <h2 id="limitations">5. What ideal memory does not model</h2>
      <p>Real edge-triggered flip-flops have setup and hold requirements, nonzero clock-to-Q propagation delays, asynchronous reset variants and possible metastable behavior when timing assumptions are violated. A real chip also has power, area, clock distribution and noise constraints. None of those properties is measured, estimated or validated here.</p>
      <p>The <strong>Reset teaching model</strong> button clears this page's illustrative state; it does not represent a particular chip's physical reset pin or timing behavior. The exported event list is self-reported browser simulation data and cannot authenticate experimental observations.</p>
      <div class="callout"><p><strong>Next step:</strong> Combine registered state with combinational arithmetic to make systems that advance one clock step at a time. Memory arrays, instruction decoding and control remain planned CFP-101 units, not capabilities of this workbench.</p></div>
      <h3>Further reading</h3>
      <ul><li><a href="https://www.nand2tetris.org/project03">Nand2Tetris — Project 03: Memory</a> (sequential elements, registers and RAM).</li>
        <li><a href="https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/">MIT OpenCourseWare — Computation Structures</a> (digital abstraction and sequential systems).</li></ul>
      <p><a href="/institute-preview/academy/cfp-101">Return to the full syllabus →</a> · <a href="/institute-preview/learn/cfp-101/half-adders">Review combinational logic →</a></p>
    </article>
    <aside class="lesson-sidebar" aria-label="Lesson index">
      <div class="kicker">Lesson 04 / Index</div><h2>Inside this lesson</h2>
      <ul><li><a href="#memory">Why storage matters</a></li><li><a href="#edge">Edge-triggered rule</a></li><li><a href="#bench">Register experiment</a></li><li><a href="#reasoning">Check your reasoning</a></li><li><a href="#limitations">Physical limitations</a></li></ul>
      <p>Estimated reading and practice: 12–18 minutes. No account or academic credit.</p>
      <p><a href="/institute-preview/learn/cfp-101/half-adders">← Lesson 03: Half adders</a></p><p><a href="/institute-preview/learn/cfp-101/addressed-memory">Next: Lesson 05 — Addressed memory →</a></p><p><a href="/institute-preview/academy/cfp-101">Full course outline →</a></p>
    </aside>
  </div></section>
</main>
`;
