// CFP-101 / Unit 05: ideal four-word memory, not physical RAM or an actual ISA.
function validWord(word){return Array.isArray(word)&&word.length===4&&word.every(bit=>bit===0||bit===1);}
function validateMemory(memory){
  if(!Array.isArray(memory)||memory.length!==4||!memory.every(validWord))
    throw new TypeError("Expected four four-bit binary words");
}
function validateAddress(address){
  if(!Number.isInteger(address)||address<0||address>3)
    throw new RangeError("Memory address must be an integer 0 through 3");
}
export function emptyMemory(){return Array.from({length:4},()=>[0,0,0,0]);}
export function readMemoryWord(memory,address){
  validateMemory(memory);validateAddress(address);
  return memory[address].slice();
}
export function writeMemoryWord(memory,address,word){
  validateMemory(memory);validateAddress(address);
  if(!validWord(word))throw new TypeError("Expected exactly four binary data bits");
  return memory.map((existing,index)=>index===address?word.slice():existing.slice());
}

export const MEMORY_LESSON_HTML=String.raw`<main id="main" tabindex="-1" class="site-main">
<section class="page-hero"><div class="shell">
 <div class="crumb"><a href="/institute-preview/academy">Academy</a> / <a href="/institute-preview/academy/cfp-101">CFP-101</a> / Lesson 05</div>
 <div class="kicker">Computing / Addressed Memory / Introductory preview</div>
 <h1 class="serif">How do bits find <em>their place?</em></h1>
 <p>Learn how four independent four-bit words can be addressed, read and written. Connect that ideal memory model to instruction architecture without pretending to build a CPU.</p>
</div></section>
<section class="shell section"><div class="lesson-layout"><article class="lesson-article">
<div class="kicker">CFP-101-U05 / Learning objectives</div>
<p>Distinguish a word from an address; perform an ideal memory read and write; verify that untouched addresses preserve their values; and explain why memory access is not the same as instruction execution.</p>
<div class="callout"><p><strong>Prerequisite:</strong> Lesson 04 explained how one four-bit register holds a word until a discrete clock event. <a href="/institute-preview/learn/cfp-101/registers">Review clocked registers →</a></p></div>
<h2 id="words">1. From a single register to addressed memory</h2>
<p>A four-bit register stores one word. This teaching model contains four separate four-bit words, for a total of <strong>4 × 4 = 16 bits</strong>. The two-bit address 00 selects word 0; 01 selects word 1; 10 selects word 2; and 11 selects word 3. An address identifies a storage location and is not the stored data.</p>
<table class="data-table tabular" aria-label="Two-bit addresses"><thead><tr><th scope="col">Address bits</th><th scope="col">Word index</th></tr></thead>
<tbody><tr><td>00</td><td>0</td></tr><tr><td>01</td><td>1</td></tr><tr><td>10</td><td>2</td></tr><tr><td>11</td><td>3</td></tr></tbody></table>
<h2 id="operations">2. Define read and write</h2>
<p>A <strong>read</strong> selects a word without changing memory. A <strong>write</strong> replaces just the selected word with four new data bits. Our model displays the selected word immediately; pressing Write is a separate explicit operation.</p>
<p class="mathline">READ(a) = M[a] · WRITE(a, d): M[a] ← d</p>
<p>Unlike the clocked register in Lesson 04, the Write button here is an abstract command, not a modeled rising clock edge. Neither electrical behavior nor access timing is simulated.</p>
<h2 id="bench">3. Workbench: four words × four bits</h2>
<p>First select address 2 and write 1010. Then select address 1 and write 0101. Return to address 2: its contents must still read 1010.</p>
<section class="memory-bench" data-memory-bench aria-labelledby="memory-title">
 <div class="memory-header"><span>ANEVUM / IDEAL ADDRESSED MEMORY</span><span>CFP-101-MEM-001</span></div>
 <h3 id="memory-title">16-bit teaching memory</h3>
 <div class="memory-grid">
  <div class="memory-controls">
   <div class="memory-label">01 / Select address</div>
   <div class="memory-addresses" role="group" aria-label="Select a memory word by address">
    <button type="button" data-memory-address="0" aria-pressed="true">00 <small>Word 0</small></button>
    <button type="button" data-memory-address="1" aria-pressed="false">01 <small>Word 1</small></button>
    <button type="button" data-memory-address="2" aria-pressed="false">10 <small>Word 2</small></button>
    <button type="button" data-memory-address="3" aria-pressed="false">11 <small>Word 3</small></button>
   </div>
   <div class="memory-label">02 / Set four input data bits</div>
   <div class="memory-bits" role="group" aria-label="Set four write-data bits">
    <button type="button" data-memory-bit="0" aria-pressed="false">D3 <strong data-memory-bit-value>0</strong></button>
    <button type="button" data-memory-bit="1" aria-pressed="false">D2 <strong data-memory-bit-value>0</strong></button>
    <button type="button" data-memory-bit="2" aria-pressed="false">D1 <strong data-memory-bit-value>0</strong></button>
    <button type="button" data-memory-bit="3" aria-pressed="false">D0 <strong data-memory-bit-value>0</strong></button>
   </div>
   <p class="memory-word">Write input D = <strong data-memory-input>0000</strong></p>
   <div class="memory-actions">
    <button type="button" data-memory-write>Write selected word</button>
    <button type="button" data-memory-reset>Reset teaching memory</button>
    <button type="button" data-memory-export>Export session (.json)</button>
   </div>
  </div>
  <div class="memory-observations">
   <div class="memory-label">Readout / current address</div>
   <p class="memory-readout">M[<strong data-memory-selected>0</strong>] = <strong data-memory-read>0000</strong></p>
   <table class="data-table tabular memory-table" aria-label="Four word contents"><thead><tr><th scope="col">Address</th><th scope="col">Stored word</th></tr></thead>
    <tbody><tr data-memory-row="0" aria-current="true"><th scope="row">00 · 0</th><td data-memory-cell>0000</td></tr>
     <tr data-memory-row="1"><th scope="row">01 · 1</th><td data-memory-cell>0000</td></tr>
     <tr data-memory-row="2"><th scope="row">10 · 2</th><td data-memory-cell>0000</td></tr>
     <tr data-memory-row="3"><th scope="row">11 · 3</th><td data-memory-cell>0000</td></tr></tbody>
   </table>
   <p class="memory-word">Writes this session: <strong data-memory-count>0</strong></p>
  </div>
 </div>
 <p class="memory-status" data-memory-status role="status" aria-live="polite">All four words begin at 0000. Selecting an address reads its stored word; changing D alone does not write memory.</p>
 <h4>Recent writes</h4><ol data-memory-history class="memory-history"><li>No writes recorded.</li></ol>
 <p data-memory-export-status class="memory-disclosure" role="status" aria-live="polite">This page-session state is browser-local and disappears on reload. Export produces unverified model data, not a Research Desk submission or hardware measurement.</p>
 <noscript><p>The interactive model requires JavaScript. The lesson and address table remain accessible.</p></noscript>
</section>
<h2 id="instructions">4. An address is not an instruction</h2>
<p>In a real computer, an <strong>instruction set architecture (ISA)</strong> specifies how operations are encoded and what they mean. A hypothetical <strong>LOAD address</strong> instruction could copy memory into a CPU register; <strong>STORE address</strong> could copy a register into memory. A real system would need an instruction decoder, program counter, register state and control logic to execute them.</p>
<p><strong>This lesson does not implement an ISA, instruction decoder, program counter, real RAM or CPU.</strong> The Write button directly updates the teaching array. Unit 06 introduces a fictional four-bit instruction encoding and assembly syntax. It does not execute instructions or implement a real processor.</p>
<h2 id="check">5. Check your reasoning</h2>
<div class="quiz" data-memory-quiz><div class="kicker">Self-check / No credit or verified completion</div>
<h3>If M[2] contains 1010 and you write 0101 to address 1, what remains at M[2]?</h3>
<div class="answer-list" role="group" aria-label="Predict the untouched memory word">
 <button type="button" class="answer" data-memory-answer="1010" aria-pressed="false">1010 — address 2 was not written</button>
 <button type="button" class="answer" data-memory-answer="0101" aria-pressed="false">0101 — all words copy the newest data</button>
 <button type="button" class="answer" data-memory-answer="0000" aria-pressed="false">0000 — changing the address resets other words</button>
</div><p class="feedback" data-memory-quiz-status role="status" aria-live="polite">Select a prediction to see the explanation.</p></div>
<h2 id="limits">6. Interpret the limits</h2>
<p>These four words form an <strong>ideal 16-bit software array, not physical SRAM or DRAM</strong>. There is no timing, power, refresh, caching, clock, bus contention or error model. The exported history cannot authenticate experimental observations or measure hardware performance.</p>
<h3>Further reading</h3><ul>
 <li><a href="https://www.nand2tetris.org/project03">Nand2Tetris — Project 03: Memory</a></li>
 <li><a href="https://www.nand2tetris.org/project04">Nand2Tetris — Project 04: Machine Language</a></li>
</ul>
<p><a href="/institute-preview/academy/cfp-101">Full syllabus →</a> · <a href="/institute-preview/learn/cfp-101/registers">← Previous: Registers</a> · <a href="/institute-preview/learn/cfp-101/assembly-code">Next: Assembly encoding →</a></p>
</article>
<aside class="lesson-sidebar" aria-label="Lesson index"><div class="kicker">Lesson 05 / Index</div><h2>Inside this lesson</h2>
<ul><li><a href="#words">Words and addresses</a></li><li><a href="#operations">Read and write</a></li><li><a href="#bench">Memory workbench</a></li><li><a href="#instructions">Instructions versus memory</a></li><li><a href="#check">Self-check</a></li><li><a href="#limits">Boundaries</a></li></ul>
<p>Estimated reading and exercise: 12–18 minutes. No account or academic credit.</p>
<p><a href="/institute-preview/learn/cfp-101/registers">← Lesson 04: Registers</a></p>
<p><a href="/institute-preview/academy/cfp-101">Full course outline →</a></p>
</aside>
</div></section></main>
`;
