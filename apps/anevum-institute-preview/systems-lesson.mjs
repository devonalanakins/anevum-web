// CFP-101 / Unit 07 — idealized single-core, round-robin teaching model.
// A CPU "quantum" here is one discrete scheduling step; no real OS is run.
export const TOY_PROCESSES=Object.freeze([
  Object.freeze({id:"A",name:"Editor",initialQuanta:2}),
  Object.freeze({id:"B",name:"Renderer",initialQuanta:1}),
  Object.freeze({id:"C",name:"Indexer",initialQuanta:3})
]);
const ids=["A","B","C"];
const limits={A:2,B:1,C:3};

export function initialSystemState(){
  return {tick:0,queue:["A","B","C"],remaining:{A:2,B:1,C:3},last:null};
}

function validateSystemState(state){
  if(!state||typeof state!=="object"||Array.isArray(state))
    throw new TypeError("Expected a scheduler state object");
  const remaining=state.remaining;
  if(!remaining||typeof remaining!=="object"||Array.isArray(remaining)||
     Object.keys(remaining).length!==3||
     !ids.every(id=>Object.hasOwn(remaining,id)&&
       Number.isInteger(remaining[id])&&remaining[id]>=0&&remaining[id]<=limits[id]))
    throw new TypeError("Invalid three-process remaining-work table");
  const total=Object.values(remaining).reduce((sum,count)=>sum+count,0);
  if(!Number.isInteger(state.tick)||state.tick<0||state.tick>6||
     state.tick!==6-total)
    throw new RangeError("Tick count does not match completed CPU quanta");
  const queue=state.queue;
  const active=ids.filter(id=>remaining[id]>0);
  if(!Array.isArray(queue)||queue.length!==active.length||
     new Set(queue).size!==queue.length||
     !queue.every(id=>active.includes(id)))
    throw new TypeError("Run queue must contain each runnable job exactly once");
}

export function advanceRoundRobin(state){
  validateSystemState(state);
  const queue=state.queue.slice();
  const remaining={...state.remaining};
  if(queue.length===0)return {tick:state.tick,queue,remaining,last:null};
  const job=queue.shift();
  remaining[job]-=1;
  if(remaining[job]>0)queue.push(job);
  const tick=state.tick+1;
  const last={
    tick,job,remaining:remaining[job],
    outcome:remaining[job]===0?"finished":"requeued"
  };
  return {tick,queue,remaining,last};
}

export const SYSTEMS_LESSON_HTML=String.raw`<main id="main" tabindex="-1" class="site-main">
<section class="page-hero"><div class="shell">
  <div class="crumb"><a href="/institute-preview/academy">Academy</a> / <a href="/institute-preview/academy/cfp-101">CFP-101</a> / Lesson 07</div>
  <div class="kicker">Computing / Systems Software / Introductory preview</div>
  <h1 class="serif">Who decides what <em>runs next?</em></h1>
  <p>Trace how an operating system can share processor time among runnable processes. Step through a deliberately simplified, single-core round-robin scheduler—without claiming to execute applications or simulate a real kernel.</p>
</div></section>
<section class="shell section"><div class="lesson-layout"><article class="lesson-article">
<div class="kicker">CFP-101-U07 / Learning objectives</div>
<p>Differentiate an application, an operating system and hardware; understand a process and run queue; predict simple round-robin scheduling; and explain what real scheduling must account for beyond this teaching model.</p>
<div class="callout"><p><strong>Prerequisite:</strong> Lesson 06 mapped fictional assembly mnemonics to binary codes. Those symbols alone cannot execute instructions. Here we examine one aspect of systems software that manages running programs. <a href="/institute-preview/learn/cfp-101/assembly-code">Review Lesson 06 →</a></p></div>

<h2 id="layers">1. Software and hardware have different responsibilities</h2>
<p>An <strong>application</strong> expresses a user task; an <strong>operating system</strong> manages resources and exposes services; the <strong>processor</strong> executes instructions. A real program also relies on memory, storage, device drivers and privilege boundaries. Our model concerns only the operating system's choice of which runnable process gets an illustrative CPU turn.</p>
<div class="systems-layer-stack" aria-label="Conceptual software and hardware stack">
 <div><strong>Applications</strong><span>Editor · Renderer · Indexer (fictional workloads)</span></div>
 <div><strong>OS scheduler</strong><span>Chooses one runnable process for a time slice</span></div>
 <div><strong>Processor</strong><span>Executes one process's real instructions (not simulated here)</span></div>
</div>

<h2 id="time">2. Round-robin scheduling</h2>
<p>A <strong>process</strong> is a program in execution with its own state and resources. In simplified round-robin scheduling, runnable processes wait in a queue. One process receives a time slice (quantum); if it still needs CPU work afterwards, it goes to the back of the queue. A process that finishes leaves the queue.</p>
<p>We start with A needing <strong>two</strong> quanta, B needing <strong>one</strong>, and C needing <strong>three</strong>. All three are ready at time zero. Press <strong>Advance one CPU turn</strong> to observe one decision at a time. The full deterministic sequence is <strong>A → B → C → A → C → C</strong>.</p>
<p>In this learning model, a “turn” is a single abstract step; it does <strong>not</strong> measure clock cycles, throughput, actual execution time or preemption overhead. All work is CPU-bound, arrives simultaneously, never blocks on I/O and needs no system calls.</p>

<h2 id="bench">3. Run the tiny scheduler</h2>
<section class="systems-bench" data-systems-bench aria-labelledby="systems-bench-title">
 <div class="systems-header"><span>ANEVUM / IDEAL SINGLE-CORE SCHEDULER</span><span>CFP-101-SYS-001</span></div>
 <h3 id="systems-bench-title">Process scheduling workbench</h3>
 <div class="systems-grid">
  <div class="systems-panel">
   <div class="systems-label">READY QUEUE / FIRST PROCESS AT LEFT</div>
   <p class="systems-queue" data-systems-queue aria-label="Ready queue">A → B → C</p>
   <p class="systems-turn">CPU turns completed: <strong data-systems-tick>0</strong> / 6</p>
   <div class="systems-actions">
    <button type="button" data-systems-advance>Advance one CPU turn</button>
    <button type="button" data-systems-reset>Reset model</button>
    <button type="button" data-systems-export>Export session (.json)</button>
   </div>
  </div>
  <div class="systems-panel">
   <div class="systems-label">REMAINING CPU QUANTA</div>
   <table class="data-table tabular systems-table" aria-label="Remaining work for the three fictional processes">
    <thead><tr><th scope="col">Process</th><th scope="col">Left</th><th scope="col">State</th></tr></thead>
    <tbody>
     <tr data-systems-row="A"><th scope="row">A · Editor</th><td data-systems-left>2</td><td data-systems-state>Ready</td></tr>
     <tr data-systems-row="B"><th scope="row">B · Renderer</th><td data-systems-left>1</td><td data-systems-state>Ready</td></tr>
     <tr data-systems-row="C"><th scope="row">C · Indexer</th><td data-systems-left>3</td><td data-systems-state>Ready</td></tr>
    </tbody>
   </table>
   <p class="systems-current">Last decision: <strong data-systems-last>None yet</strong></p>
  </div>
 </div>
 <p data-systems-status class="systems-status" role="status" aria-live="polite">All three processes are ready. A is at the head of the queue; no CPU turns have run.</p>
 <h4>Scheduling decisions</h4>
 <ol data-systems-history class="systems-history"><li>No scheduling turns recorded.</li></ol>
 <p data-systems-export-status role="status" aria-live="polite" class="systems-export-status">This page-session simulation is browser-local and resets on reload. Its export is unverified teaching data, not real scheduler telemetry or research evidence.</p>
 <noscript><p>JavaScript is required for the interactive queue. The fixed six-turn example above remains available for study.</p></noscript>
</section>

<h2 id="predict">4. Predict the schedule</h2>
<div class="quiz" data-systems-quiz>
 <div class="kicker">Self-check / No score or academic credit</div>
 <h3>After A receives the first turn but still has one quantum left, which process is scheduled next?</h3>
 <div class="answer-list" role="group" aria-label="Choose the next runnable process">
  <button type="button" class="answer" aria-pressed="false" data-systems-answer="B">B — A returns behind B and C</button>
  <button type="button" class="answer" aria-pressed="false" data-systems-answer="A">A — the first process keeps all CPU time</button>
  <button type="button" class="answer" aria-pressed="false" data-systems-answer="C">C — the scheduler skips the queue head</button>
 </div>
 <p class="feedback" role="status" aria-live="polite" data-systems-quiz-status>Select an answer to see the explanation.</p>
</div>

<h2 id="limits">5. A scheduling example is not an operating system</h2>
<p>A real kernel must handle interrupts, blocking I/O, system calls, priorities, memory protection, context-switch overhead, concurrency and security, along with processes that arrive or finish unpredictably. Round-robin behavior also depends on quantum length and actual scheduling rules. This six-turn sequence does not prove fairness or predict real-world performance.</p>
<p><strong>No application code runs, no CPU instructions are interpreted, and no physical process or operating-system scheduler is created.</strong> <a href="/institute-preview/learn/cfp-101/eight-bit-computer">Lesson 08</a> separately introduces a bounded, fictional eight-bit accumulator computer with instruction ROM, data RAM and registers. That computer is not this scheduler, runs no real operating system or hardware, and does not provide academic credit.</p>
<h3>Further reading</h3>
<ul><li><a href="https://pages.cs.wisc.edu/~remzi/OSTEP/">Operating Systems: Three Easy Pieces</a> — chapters on process scheduling and CPU virtualization.</li>
<li><a href="https://ocw.mit.edu/courses/6-s081-operating-system-engineering-fall-2020/">MIT OpenCourseWare — Operating System Engineering</a> — actual OS concepts and teaching exercises.</li></ul>
<p><a href="/institute-preview/academy/cfp-101">Full CFP-101 syllabus →</a> · <a href="/institute-preview/learn/cfp-101/assembly-code">← Previous: Machine Code and Assembly</a> · <a href="/institute-preview/learn/cfp-101/eight-bit-computer">Next: Lesson 08 — Eight-bit computer →</a></p>
</article>
<aside class="lesson-sidebar" aria-label="Lesson index">
 <div class="kicker">Lesson 07 / Index</div><h2>Inside this lesson</h2>
 <ul><li><a href="#layers">Software and hardware</a></li><li><a href="#time">Round-robin scheduling</a></li><li><a href="#bench">Scheduler workbench</a></li><li><a href="#predict">Prediction</a></li><li><a href="#limits">Model boundaries</a></li></ul>
 <p>Estimated reading and practice: 12–18 minutes. No account, academic credit or verified completion.</p>
 <p><a href="/institute-preview/learn/cfp-101/assembly-code">← Lesson 06: Assembly</a></p><p><a href="/institute-preview/learn/cfp-101/eight-bit-computer">Next: Lesson 08 — Eight-bit computer →</a></p><p><a href="/institute-preview/academy/cfp-101">Full course outline →</a></p>
</aside></div></section></main>
`;
