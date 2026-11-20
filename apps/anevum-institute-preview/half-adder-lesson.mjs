// ANEVUM CFP-101 / Unit 03. Original learning material, preview only.
// The Boolean model below is intentionally independent of the UI and the browser.
export function evaluateHalfAdder(a,b){
  if((a!==0&&a!==1)||(b!==0&&b!==1))throw new TypeError("Half-adder inputs must each be exactly 0 or 1");
  return {sum:a^b,carry:a&b};
}

// Study, simulator, and original explanations belong to one portable lesson.
// No inline handlers, backend, network requests, accreditation, or research approval.
export const HALF_ADDER_LESSON_HTML = String.raw`
<main id="main" tabindex="-1" class="site-main">
  <section class="page-hero"><div class="shell">
    <div class="crumb"><a href="/institute-preview/academy">Academy</a> /
      <a href="/institute-preview/academy/cfp-101">CFP-101</a> / Lesson 03</div>
    <div class="kicker">School of Computing / Combinational Logic / Preview lesson</div>
    <h1 class="serif">Where does <em>1 + 1</em> go?</h1>
    <p>Use elementary Boolean functions to build a circuit that adds two binary digits. Derive its outputs, simulate every input combination, and document what the model does and does not establish.</p>
  </div></section>

  <section class="shell section"><div class="lesson-layout">
    <article class="lesson-article">
      <div class="kicker">CFP-101-U03 / Learning objectives</div>
      <p>Derive the half-adder's sum and carry expressions, distinguish XOR from OR, verify all four binary input pairs, and explain why a half-adder alone cannot accept a carry from a previous column.</p>
      <div class="callout"><p><strong>Prerequisites:</strong> Boolean AND, OR, NOT and XOR; the distinction between an ideal logical circuit and its physical implementation. Read <a href="/institute-preview/learn/cfp-101/logic-gates">Lesson 02</a> first if those concepts are unfamiliar.</p></div>

      <h2 id="binary">1. Binary addition has two outputs</h2>
      <p>Decimal counting uses ten digits; binary counting uses only 0 and 1. Adding two one-bit inputs can produce the decimal values 0, 1 or 2. Two is written <strong>10₂</strong>: a zero in the low-order position and a one carried into the next column.</p>
      <p>We therefore need two output bits: <strong>S</strong> (sum, the low-order bit) and <strong>C</strong> (carry, the next higher bit). For one-bit inputs A and B, the unsigned arithmetic identity is <strong>A + B = S + 2C</strong>.</p>

      <h2 id="derive">2. Derive the circuit from a truth table</h2>
      <p>The sum output is one if exactly one input is one. That is exclusive OR (XOR). The carry output is one only when both inputs are one. That is AND.</p>
      <p class="mathline">S = A ⊕ B　　C = A ∧ B</p>
      <table class="data-table tabular" aria-label="Ideal half-adder truth table">
        <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">Sum S</th><th scope="col">Carry C</th><th scope="col">Binary result</th></tr></thead>
        <tbody><tr><td>0</td><td>0</td><td>0</td><td>0</td><td>00</td></tr>
        <tr><td>0</td><td>1</td><td>1</td><td>0</td><td>01</td></tr>
        <tr><td>1</td><td>0</td><td>1</td><td>0</td><td>01</td></tr>
        <tr><td>1</td><td>1</td><td>0</td><td>1</td><td>10</td></tr></tbody>
      </table>
      <p><strong>Why XOR rather than OR?</strong> OR returns one for 1 OR 1; that would incorrectly report a sum bit of one when both inputs are one. XOR returns zero in that case, while AND sets the carry bit.</p>

      <h2 id="circuit">3. One combinational circuit, no stored state</h2>
      <figure class="logic-box" aria-labelledby="half-figure-caption">
        <svg viewBox="0 0 590 255" role="img" aria-labelledby="half-figure-title half-figure-desc">
          <title id="half-figure-title">Half-adder logic diagram</title>
          <desc id="half-figure-desc">Inputs A and B each feed an XOR gate and an AND gate. XOR produces the sum bit S; AND produces the carry bit C.</desc>
          <g fill="none" stroke="#e2bd80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M64 70H205M64 186H205M145 70V171H205M167 186V96H205"/>
            <path d="M361 88H498M361 182H498"/>
            <path d="M205 44H302Q335 63 361 88Q335 113 302 131H205Q238 88 205 44Z"/>
            <path d="M205 151H288A49 49 0 0 1 288 231H205Z"/>
          </g>
          <g fill="#f3e8d5" font-size="21" font-family="ui-sans-serif,system-ui,sans-serif"><text x="32" y="78">A</text><text x="32" y="194">B</text><text x="503" y="95">S</text><text x="503" y="190">C</text></g>
          <g fill="#efd4a5" font-size="18" font-family="ui-sans-serif,system-ui,sans-serif" text-anchor="middle"><text x="288" y="93">XOR</text><text x="273" y="191">AND</text></g>
        </svg>
        <figcaption id="half-figure-caption">Conceptual logic connectivity. This is not a verified physical schematic or a timing simulation.</figcaption>
      </figure>
      <p>A combinational circuit's ideal output depends on its current inputs, not on a clock or stored memory. Real devices have nonzero propagation delays and can exhibit transient glitches. We deliberately exclude those effects here.</p>

      <h2 id="experiment">4. Experiment: test every input pair</h2>
      <p>Change A and B, predict the two output bits, and observe the result. All four combinations must be visited to complete the session's truth-table coverage.</p>

      <section class="half-bench" data-half-adder aria-labelledby="half-bench-title">
        <div class="half-bench-top"><span>ANEVUM / IDEAL BOOLEAN SIMULATOR</span><span>EXPERIMENT CFP-101-HALF-001</span></div>
        <h3 id="half-bench-title">Half-adder workbench</h3>
        <div class="half-grid">
          <div>
            <div class="half-switches" role="group" aria-label="Set binary inputs">
              <button type="button" data-half-input="a" aria-pressed="false">A = <strong data-half-input-value="a">0</strong></button>
              <button type="button" data-half-input="b" aria-pressed="false">B = <strong data-half-input-value="b">0</strong></button>
            </div>
            <div class="half-outputs" aria-label="Calculated outputs">
              <div><small>SUM / A XOR B</small><strong data-half-sum>0</strong></div>
              <div><small>CARRY / A AND B</small><strong data-half-carry>0</strong></div>
            </div>
            <p class="half-explanation" role="status" aria-live="polite" data-half-feedback>0 + 0 = binary 00 (sum 0, carry 0).</p>
          </div>
          <div>
            <table class="half-table tabular" aria-label="Observed ideal half-adder truth table">
              <thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">S</th><th scope="col">C</th><th scope="col">Visited</th></tr></thead>
              <tbody>
                <tr data-half-row="00"><td>0</td><td>0</td><td>0</td><td>0</td><td data-half-visited>–</td></tr>
                <tr data-half-row="01"><td>0</td><td>1</td><td>1</td><td>0</td><td data-half-visited>–</td></tr>
                <tr data-half-row="10"><td>1</td><td>0</td><td>1</td><td>0</td><td data-half-visited>–</td></tr>
                <tr data-half-row="11"><td>1</td><td>1</td><td>0</td><td>1</td><td data-half-visited>–</td></tr>
              </tbody>
            </table>
            <p class="half-coverage" data-half-progress>1 of 4 combinations visited in this session.</p>
            <div class="progress-meter" aria-hidden="true"><span data-half-meter></span></div>
          </div>
        </div>
        <div class="half-actions">
          <button type="button" data-half-reset>Restart experiment</button>
          <button type="button" data-half-export>Export observations (.json)</button>
          <button type="button" data-half-to-dossier disabled>Review in Research Desk →</button>
        </div>
        <p class="half-fine" data-half-export-status role="status" aria-live="polite">After observing all four input pairs, you can transfer a single-use notebook to the Research Desk for local validation. Nothing is saved automatically. No network request, enrollment, or independent verification occurs.</p>
        <noscript><p class="half-fine">This simulator requires JavaScript; the equations and full truth table above remain readable.</p></noscript>
      </section>

      <h2 id="check">5. Test the reasoning, not the interface</h2>
      <div class="quiz half-quiz" data-half-quiz>
        <div class="kicker">Self-assessment / No automatic grade</div>
        <h3>When both input bits are 1, what two-bit result should the half-adder produce?</h3>
        <div class="answer-list" role="group" aria-label="Select the two-bit binary result">
          <button type="button" class="answer" data-half-answer="01" aria-pressed="false">01 — sum 1, carry 0</button>
          <button type="button" class="answer" data-half-answer="10" aria-pressed="false">10 — sum 0, carry 1</button>
          <button type="button" class="answer" data-half-answer="11" aria-pressed="false">11 — sum 1, carry 1</button>
        </div>
        <p data-half-quiz-status class="feedback" role="status" aria-live="polite">Select an answer to see the reasoning.</p>
      </div>

      <h2 id="limits">6. What this proves—and what it does not</h2>
      <p>Exhaustively checking the four ideal input pairs verifies the implemented Boolean mapping in this browser for those cases. It does <strong>not</strong> measure semiconductor behavior, switching delay, energy use, reliability, or the correctness of a fabricated circuit.</p>
      <p>A full adder introduces a third input, the carry from a previous column. Larger adders combine stages, with practical tradeoffs in carry propagation and timing. Those systems are later topics—not capabilities claimed by this lesson.</p>
      <div class="callout"><p><strong>Research practice:</strong> Export a record of your simulated observations and state the model assumptions when citing it. The Research Desk can check this half-adder notebook and stage it for your explicit approval, either through the same-tab transfer or by importing a downloaded JSON file. It remains independently inspectable but unverified.</p></div>
      <h3>Further reading</h3>
      <ul>
        <li><a href="https://www.nand2tetris.org/project02">Nand2Tetris — Project 02: Boolean Arithmetic</a> (half-adder, full-adder, adders, ALU).</li>
        <li><a href="https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/">MIT OpenCourseWare — Computation Structures (6.004)</a> (digital abstractions and circuit design).</li>
      </ul>
      <p><a href="/institute-preview/academy/cfp-101">Return to CFP-101 syllabus →</a> · <a href="/institute-preview/dossier">Open Research Desk →</a></p>
    </article>
    <aside class="lesson-sidebar" aria-label="Lesson index">
      <div class="kicker">Lesson 03 / Index</div><h2>Inside this lesson</h2>
      <ul><li><a href="#binary">Binary addition</a></li><li><a href="#derive">Derive XOR / AND</a></li><li><a href="#circuit">Logic diagram</a></li><li><a href="#experiment">Half-adder experiment</a></li><li><a href="#check">Self-assessment</a></li><li><a href="#limits">Model limitations</a></li></ul>
      <p>Estimated reading and experiment: 12–18 minutes. No account or credit.</p>
      <p><a href="/institute-preview/learn/cfp-101/logic-gates">← Lesson 02: Gates</a></p><p><a href="/institute-preview/learn/cfp-101/registers">Next: Lesson 04 — Registers →</a></p><p><a href="/institute-preview/academy/cfp-101">Full course outline →</a></p>
    </aside>
  </div></section>
</main>
`;