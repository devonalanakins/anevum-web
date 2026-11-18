// CFP-101 U06 — independently authored *toy* instruction encoding.
// No CPU, execution engine, real ISA, program counter, or physical machine exists here.
const OPCODES=Object.freeze({LOAD:0,STORE:1,ADD:2,HALT:3});
const NAME_BY_OPCODE=Object.freeze(["LOAD","STORE","ADD","HALT"]);
const toBits=(n,length)=>n.toString(2).padStart(length,"0");

export function encodeToyInstruction(mnemonic,address=null){
  if(typeof mnemonic!=="string"||!Object.hasOwn(OPCODES,mnemonic))
    throw new RangeError("Unknown teaching mnemonic");
  if(mnemonic==="HALT"){
    if(address!==null)throw new RangeError("HALT takes no address operand");
    return "1100";
  }
  if(!Number.isInteger(address)||address<0||address>3)
    throw new RangeError("Address must be an integer from 0 to 3");
  return toBits(OPCODES[mnemonic],2)+toBits(address,2);
}
export function decodeToyInstruction(bits){
  if(typeof bits!=="string"||!/^[01]{4}$/.test(bits))
    throw new TypeError("Machine word must contain exactly four binary digits");
  const opcode=parseInt(bits.slice(0,2),2);
  const address=parseInt(bits.slice(2),2);
  if(opcode===3&&address!==0)throw new RangeError("Reserved encoding: HALT requires operand 00");
  const mnemonic=NAME_BY_OPCODE[opcode];
  return {
    bits,opcodeBits:bits.slice(0,2),operandBits:bits.slice(2),
    mnemonic,address:opcode===3?null:address,
    assembly:opcode===3?"HALT":mnemonic+" "+address
  };
}
export function assembleToyLine(line){
  if(typeof line!=="string"||line.length>32)
    throw new TypeError("Assembly input must be a short string");
  const clean=line.trim().toUpperCase();
  if(clean==="HALT")return "1100";
  const match=/^(LOAD|STORE|ADD) ([0-3])$/.exec(clean.replace(/[ \t]+/g," "));
  if(!match)throw new RangeError("Use LOAD, STORE or ADD followed by address 0–3; or HALT");
  return encodeToyInstruction(match[1],Number(match[2]));
}

export const ASSEMBLY_LESSON_HTML=String.raw`<main id="main" tabindex="-1" class="site-main">
<section class="page-hero"><div class="shell">
  <div class="crumb"><a href="/institute-preview/academy">Academy</a> / <a href="/institute-preview/academy/cfp-101">CFP-101</a> / Lesson 06</div>
  <div class="kicker">Computing / Symbolic Instructions / Introductory preview</div>
  <h1 class="serif">From words to <em>machine code.</em></h1>
  <p>Turn a tiny assembly instruction into four binary digits and decode it back. Study why bits mean something only when an instruction set defines their meaning.</p>
</div></section>
<section class="shell section"><div class="lesson-layout"><article class="lesson-article">
<div class="kicker">CFP-101-U06 / Learning objectives</div>
<p>Distinguish assembly notation from binary encodings, identify an opcode and operand, encode and decode a small fictional instruction set, and explain why interpreting instructions is not the same as executing a program.</p>
<div class="callout"><p><strong>Prerequisite:</strong> Lesson 05 modeled four addressed memory words. Its address choices are reused here as two-bit instruction operands. <a href="/institute-preview/learn/cfp-101/addressed-memory">Review addressed memory →</a></p></div>
<h2 id="isa">1. A CPU interprets bits according to an instruction set</h2>
<p>Binary digits have no inherent instruction meaning. An <strong>instruction set architecture (ISA)</strong> assigns patterns to operations and operands, while <strong>assembly language</strong> provides human-readable symbols for those patterns. Actual architectures also define machine state, execution semantics and many other details.</p>
<p>For this lesson only, we define a <strong>fictional 4-bit instruction format</strong> consisting of a 2-bit operation code followed by a 2-bit address. It is deliberately much smaller than a real instruction set. Four addresses exist: 0, 1, 2 and 3.</p>
<p class="mathline">4-bit instruction = 2-bit opcode ∥ 2-bit operand</p>
<table class="data-table tabular" aria-label="Fictional four-bit instruction coding">
<thead><tr><th scope="col">Opcode</th><th scope="col">Mnemonic</th><th scope="col">Proposed meaning</th></tr></thead>
<tbody>
<tr><td>00</td><td>LOAD a</td><td>Copy word M[a] into an imagined accumulator</td></tr>
<tr><td>01</td><td>STORE a</td><td>Copy an imagined accumulator to M[a]</td></tr>
<tr><td>10</td><td>ADD a</td><td>Add M[a] to an imagined accumulator</td></tr>
<tr><td>11</td><td>HALT</td><td>Stop; only operand 00 is valid</td></tr>
</tbody></table>
<p>These operations are <strong>names and proposed semantics only</strong>: this lesson does not provide a CPU, registers for instruction execution, a program counter, arithmetic execution, or a real machine. LOAD and STORE names are common concepts, but these binary codes are invented solely for ANEVUM's teaching example.</p>

<h2 id="assembler">2. Encode and decode instructions</h2>
<p>Enter <strong>LOAD 2</strong> to produce <strong>0010</strong> (00 plus address 10). Enter <strong>STORE 1</strong> to produce <strong>0101</strong>. <strong>HALT</strong> encodes as <strong>1100</strong> with no address; 1101, 1110 and 1111 are reserved and must be rejected.</p>
<section class="assembly-bench" data-assembly-bench aria-labelledby="assembly-title">
  <div class="assembly-header"><span>ANEVUM / FICTIONAL FOUR-BIT ISA</span><span>CFP-101-ASM-001</span></div>
  <h3 id="assembly-title">Instruction encoding desk</h3>
  <div class="assembly-layout">
  <div class="assembly-control">
    <form data-assembly-form>
      <label for="assembly-source">Assembly source</label>
      <div class="assembly-input-row">
        <input id="assembly-source" type="text" maxlength="32" spellcheck="false" autocomplete="off" autocapitalize="characters" data-assembly-source value="LOAD 2" aria-describedby="assembly-format"/>
        <button type="submit" data-assembly-encode>Assemble</button>
      </div>
      <p id="assembly-format" class="assembly-fine">Accepted: LOAD 0–3 · STORE 0–3 · ADD 0–3 · HALT. Press Enter to assemble.</p>
    </form>
    <div class="assembly-examples" role="group" aria-label="Load an example assembly instruction">
      <button type="button" data-assembly-example="LOAD 2">LOAD 2</button>
      <button type="button" data-assembly-example="STORE 1">STORE 1</button>
      <button type="button" data-assembly-example="ADD 3">ADD 3</button>
      <button type="button" data-assembly-example="HALT">HALT</button>
    </div>
    <form data-assembly-decode-form>
      <label for="assembly-machine">Machine word (4 bits)</label>
      <div class="assembly-input-row">
        <input id="assembly-machine" type="text" maxlength="4" spellcheck="false" autocomplete="off" inputmode="numeric" data-assembly-machine value="0010" aria-describedby="assembly-reserved"/>
        <button type="submit" data-assembly-decode>Decode</button>
      </div>
      <p id="assembly-reserved" class="assembly-fine">Binary input must be exactly four 0/1 digits. Reserved encodings are rejected.</p>
    </form>
  </div>
  <div class="assembly-output">
    <div class="assembly-output-title">Latest valid instruction</div>
    <div class="assembly-bit-pair"><span data-assembly-opcode>00</span><span data-assembly-operand>10</span></div>
    <div class="assembly-bit-labels"><span>OPCODE</span><span>ADDRESS / RESERVED</span></div>
    <p class="assembly-decoded">Disassembly: <strong data-assembly-result>LOAD 2</strong></p>
    <p class="assembly-mapping">Machine word: <strong data-assembly-bits>0010</strong></p>
    <p class="assembly-output-disclaimer">Example encoding only. Not executable by the browser or any physical processor.</p>
  </div>
  </div>
  <p data-assembly-status class="assembly-status" role="status" aria-live="polite">Example: LOAD 2 maps to 0010. Enter another instruction to check its encoding.</p>
  <h4>Validated conversions this session</h4>
  <ol class="assembly-history" data-assembly-history><li>No conversions recorded.</li></ol>
  <div class="assembly-actions"><button type="button" data-assembly-clear>Clear session history</button><button type="button" data-assembly-export>Export teaching conversions (.json)</button></div>
  <p data-assembly-export-status class="assembly-fine" role="status" aria-live="polite">The conversion history is browser-local and disappears on reload. Exports are unverified learning artifacts, not research evidence or academic credit.</p>
  <noscript><p>The converter requires JavaScript. The instruction table and worked examples remain readable.</p></noscript>
</section>

<h2 id="reading">3. Separate representation from execution</h2>
<p>For <strong>ADD 3</strong>, the fictional opcode 10 followed by address 11 yields <strong>1011</strong>. Decoding 1011 retrieves the symbol ADD and its operand 3. A real CPU would need an instruction fetch, decoder, program state, accumulator, ALU, memory interface and control logic to perform the arithmetic.</p>
<p><strong>Assembling, decoding, and executing are different actions.</strong> This workbench only maps between syntax and the fictional binary format. It does not fetch instructions, add numbers, alter memory or run programs. The simulated eight-bit computer in Unit 08 remains planned, not implemented here.</p>
<h2 id="quiz">4. Check the encoding</h2>
<div class="quiz" data-assembly-quiz>
 <div class="kicker">Self-check / No graded credential</div>
 <h3>What is the four-bit machine word for STORE 2?</h3>
 <div class="answer-list" role="group" aria-label="Choose the binary encoding of STORE 2">
  <button type="button" class="answer" aria-pressed="false" data-assembly-answer="0110">0110 — opcode 01, address 10</button>
  <button type="button" class="answer" aria-pressed="false" data-assembly-answer="0010">0010 — opcode 00, address 10</button>
  <button type="button" class="answer" aria-pressed="false" data-assembly-answer="1100">1100 — opcode 11, reserved operand 00</button>
 </div>
 <p class="feedback" data-assembly-quiz-status role="status" aria-live="polite">Select a prediction to see the reasoning.</p>
</div>
<h2 id="limits">5. Model limitations and further reading</h2>
<p>The encoding has 12 address-bearing instructions plus one HALT instruction: <strong>13 valid code words</strong> out of 16 possible four-bit patterns. The three remaining patterns beginning with 11 and a nonzero operand are intentionally invalid. This is a conceptual design, not an industry-standard ISA, an assembler for real hardware, a secure executable, or a verified educational credential.</p>
<ul>
 <li><a href="https://www.nand2tetris.org/project04">Nand2Tetris — Project 04: Machine Language</a> (instruction encodings and assembly).</li>
 <li><a href="https://ocw.mit.edu/courses/6-004-computation-structures-spring-2009/">MIT OpenCourseWare — Computation Structures</a> (stored-program concepts).</li>
</ul>
<p><a href="/institute-preview/academy/cfp-101">Return to the CFP-101 syllabus →</a> · <a href="/institute-preview/learn/cfp-101/addressed-memory">← Review Lesson 05</a></p>
</article>
<aside class="lesson-sidebar" aria-label="Lesson index">
 <div class="kicker">Lesson 06 / Index</div><h2>Inside this lesson</h2>
 <ul><li><a href="#isa">Opcode and operand</a></li><li><a href="#assembler">Encode/decode desk</a></li><li><a href="#reading">What execution needs</a></li><li><a href="#quiz">Knowledge check</a></li><li><a href="#limits">Scope and sources</a></li></ul>
 <p>Estimated reading and practice: 12–18 minutes. No account, assessed course completion, or academic credit.</p>
 <p><a href="/institute-preview/learn/cfp-101/addressed-memory">← Lesson 05: Memory</a></p>
 <p><a href="/institute-preview/academy/cfp-101">Full course outline →</a></p>
</aside>
</div></section></main>
`;
