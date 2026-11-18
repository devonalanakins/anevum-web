/**
 * ANEVUM — institution-first discovery surface.
 * Academic structure and real preview activities, not a fabricated university.
 * No generated environmental art, animated WebGL canvas or remote image dependency.
 */
const HOME=`
<main id="main" tabindex="-1" class="site-main institution-home">
  <section class="academic-intro" aria-labelledby="institute-title">
    <div class="shell">
      <div class="academic-topline"><span>ANEVUM / THE OPEN INSTITUTE</span><span>Independent scientific education · Founding preview</span></div>
      <div class="academic-hero-grid">
        <div class="academic-hero-copy">
          <p class="academic-eyebrow">Learning / Experimentation / Reproducible work</p>
          <h1 id="institute-title" class="serif">An open institute for <em>serious inquiry.</em></h1>
          <p class="academic-lead">Learn how complex systems work—from transistors and software to neural dynamics and scientific computing. Begin with working lessons, test the models, and document what you actually observed.</p>
          <div class="academic-actions">
            <a class="academic-primary" href="%BASE%/academy">Explore the academic catalogue <span aria-hidden="true">→</span></a>
            <a class="academic-secondary" href="%BASE%/laboratory/neuron-dynamics">Explore a neuroscience lab <span aria-hidden="true">→</span></a>
          </div>
          <p class="academic-honesty">Designed for free, open-access learning with no admission requirements. ANEVUM is independent and non-accredited; no degrees or academic credit are currently issued.</p>
        </div>
        <aside class="academic-study-card" aria-label="Available coursework and experiments">
          <div class="academic-study-head"><span>ACADEMIC DIRECTORY</span><span>01 / ACTIVE COURSE</span></div>
          <div class="academic-card-overline">Foundational computing · CFP-101</div>
          <h2>Computing From First Principles</h2>
          <p>Start at the transistor. Move through binary logic, gates and arithmetic using working explanations and interactive models.</p>
          <div class="academic-card-status"><span>4 lessons available</span><span>4 units in development</span></div>
          <a href="%BASE%/academy/cfp-101">View course and syllabus <span aria-hidden="true">→</span></a>
          <div class="academic-card-bottom">
            <div><strong>03</strong><span>Computing lab models</span></div>
            <div><strong>01</strong><span>Neuroscience model</span></div>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <nav class="academic-pathways" aria-label="Start a real ANEVUM activity">
    <div class="shell academic-pathways-inner">
      <a href="%BASE%/learn/cfp-101/transistor-switching"><span class="academic-path-num">01</span><span><strong>Study a lesson</strong><small>Start with transistor switching</small></span><span aria-hidden="true">↗</span></a>
      <a href="%BASE%/laboratory/cluster-scheduling"><span class="academic-path-num">02</span><span><strong>Conduct an experiment</strong><small>Simulate GPU scheduling</small></span><span aria-hidden="true">↗</span></a>
      <a href="%BASE%/dossier"><span class="academic-path-num">03</span><span><strong>Document your findings</strong><small>Browser-local Research Desk</small></span><span aria-hidden="true">↗</span></a>
    </div>
  </nav>

  <section class="shell academic-section" aria-labelledby="academic-study-title">
    <div class="academic-section-label"><span>01 / ACADEMIC OFFERINGS</span><span>Available now</span></div>
    <div class="academic-heading-row">
      <div><h2 id="academic-study-title" class="serif">Where learning becomes <em>practical.</em></h2><p>The catalogue distinguishes published material from developing curricula and simulated research environments.</p></div>
      <a class="academic-text-link" href="%BASE%/academy">Browse the catalogue →</a>
    </div>
    <div class="academic-offering-grid">
      <article class="academic-offering">
        <div class="academic-offering-top"><span>COURSE · CFP-101</span><span class="academic-status">4 LESSONS READY</span></div>
        <h3>Computing From First Principles</h3>
        <p>Semiconductors, Boolean logic, binary arithmetic and clocked registers. An eight-unit curriculum in development, with the first four introductory lessons available.</p>
        <a href="%BASE%/academy/cfp-101">Explore CFP-101 <span aria-hidden="true">→</span></a>
      </article>
      <article class="academic-offering">
        <div class="academic-offering-top"><span>LABORATORY · GPU-SIM</span><span class="academic-status">SIMULATION</span></div>
        <h3>Compute systems laboratory</h3>
        <p>Compare idealized job scheduling and slot utilization without claiming access to real GPU clusters or benchmarking hardware.</p>
        <a href="%BASE%/laboratory/cluster-scheduling">Open GPU scheduling <span aria-hidden="true">→</span></a>
      </article>
      <article class="academic-offering">
        <div class="academic-offering-top"><span>LABORATORY · NEURO-001</span><span class="academic-status">SIMULATION</span></div>
        <h3>Neuron dynamics laboratory</h3>
        <p>Explore leaky integrate-and-fire membrane dynamics with a transparent numerical model, not clinical or biological recordings.</p>
        <a href="%BASE%/laboratory/neuron-dynamics">Open neuron dynamics <span aria-hidden="true">→</span></a>
      </article>
    </div>
  </section>

  <section class="academic-fields" aria-labelledby="academic-fields-title">
    <div class="shell academic-section">
      <div class="academic-section-label"><span>02 / RESEARCH DIRECTION</span><span>Proposed fields · Not operating faculties</span></div>
      <div class="academic-fields-layout">
        <div><h2 id="academic-fields-title" class="serif">One institute. <em>Connected disciplines.</em></h2><p>ANEVUM's intended specialization connects mathematics, physics, engineering and the biological sciences. The areas below express research direction—not existing departments, accredited programs or clinical services.</p></div>
        <ul class="academic-field-list">
          <li><span>01</span> Artificial intelligence and model validation</li>
          <li><span>02</span> Computing infrastructure and distributed systems</li>
          <li><span>03</span> Mathematics, physics and scientific modeling</li>
          <li><span>04</span> Neuroscience and computational cognition</li>
          <li><span>05</span> Biology, biophysics and neural computation</li>
          <li><span>06</span> Neuropsychology and human behavior</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="shell academic-section academic-method" aria-labelledby="academic-method-title">
    <div class="academic-section-label"><span>03 / THE ACADEMIC METHOD</span><span>Free, inspectable and evidence-led</span></div>
    <div class="academic-heading-row"><div><h2 id="academic-method-title" class="serif">Learn. Test. <em>Show your work.</em></h2><p>Our design goal is to make understanding and reproducible practice more important than arbitrary points or attendance.</p></div></div>
    <div class="academic-method-grid">
      <div><span>01 / STUDY</span><h3>Start with principles</h3><p>Read the lesson, understand its assumptions, and explain the underlying model.</p></div>
      <div><span>02 / EXPERIMENT</span><h3>Work through the problem</h3><p>Change parameters, observe outputs, and export a repeatable demonstration.</p></div>
      <div><span>03 / DOCUMENT</span><h3>Make the evidence inspectable</h3><p>Record methods, observations and limitations in your own Research Desk.</p></div>
      <div><span>04 / EVALUATE</span><h3>Invite scrutiny</h3><p>Independent peer review and externally awarded recognition are proposed, not yet available.</p></div>
    </div>
    <p class="academic-method-note">The current recognition framework is a proposal. No external review, degree, certification or academic credit is issued by the preview. <a href="%BASE%/recognition">Read the evidence standard →</a></p>
  </section>
</main>`;
export function academicInstituteHome(base){
  return HOME.replaceAll("%BASE%",base);
}
