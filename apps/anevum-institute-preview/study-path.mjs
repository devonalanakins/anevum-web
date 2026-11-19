// CFP-101 preview study navigation. This is a reading aid, not a course-completion tracker.
// All destinations are source-controlled, existing preview lesson paths.
import {CFP_101} from "./curriculum.mjs";

const SHORT_TITLES=Object.freeze({
  "CFP-101-U01":"Transistors",
  "CFP-101-U02":"Logic gates",
  "CFP-101-U03":"Half adders",
  "CFP-101-U04":"Registers",
  "CFP-101-U05":"Memory",
  "CFP-101-U06":"Assembly",
  "CFP-101-U07":"Systems",
  "CFP-101-U08":"CPU capstone"
});
const available=CFP_101.units.filter(unit=>unit.availability==="preview");

export function studyPathNav(activeUnitId,base="/institute-preview"){
  if(!available.some(unit=>unit.id===activeUnitId))throw new RangeError("Unknown available CFP-101 lesson");
  if(base!=="/institute-preview")throw new RangeError("Invalid preview base");
  const rows=available.map(unit=>{
    const current=unit.id===activeUnitId;
    const status=["CFP-101-U03","CFP-101-U04","CFP-101-U05","CFP-101-U06","CFP-101-U07","CFP-101-U08"].includes(unit.id)?"Preview lesson · not tracked":"Check not recorded";
    const statusAttribute=["CFP-101-U03","CFP-101-U04","CFP-101-U05","CFP-101-U06","CFP-101-U07","CFP-101-U08"].includes(unit.id)?"":' data-practice-status="not-recorded"';
    return `<li><a class="study-path-link"${current?' aria-current="page"':''} href="${base}${unit.lessonPath}">
      <span class="study-path-index" aria-hidden="true">${unit.number}</span>
      <span class="study-path-details"><strong>${SHORT_TITLES[unit.id]}</strong><small data-study-path-status="${unit.id}"${statusAttribute}>${status}</small></span>
    </a></li>`;
  }).join("");
  return `<nav class="study-path" data-study-path aria-label="CFP-101 available lesson navigation">
    <div class="study-path-heading"><span>CFP-101 / Study sequence</span><a href="${base}/academy/cfp-101">Full syllabus →</a></div>
    <ol class="study-path-links">${rows}</ol>
    <p class="study-path-disclaimer"><span data-study-path-progress>0 of 3 practice checks recorded on this device.</span> These checks cover Lessons 01–02 and the AND lab only; other preview lessons are untracked. This is not a course completion record or academic credit. All eight introductory lessons have previews; assessment remains in development.</p>
  </nav>`;
}

/**
 * Academy discovery uses the same source-controlled available units as the lesson reader.
 * Practice labels are populated from existing device-local flags by client.mjs.
 * No account, completion, credential or enrolled-student status is implied.
 */
export function academyLearningDirectory(base="/institute-preview"){
  if(base!=="/institute-preview")throw new RangeError("Invalid preview base");
  const planned=CFP_101.units.length-available.length;
  const links=available.map(unit=>{
    const tracked=!["CFP-101-U03","CFP-101-U04","CFP-101-U05","CFP-101-U06","CFP-101-U07","CFP-101-U08"].includes(unit.id);
    const label=tracked?"Check not recorded":"Preview lesson · not tracked";
    return `<li class="academy-unit">
      <a class="academy-unit-link" href="${base}${unit.lessonPath}" aria-label="Open lesson ${unit.number}: ${unit.title}">
        <span class="academy-unit-number" aria-hidden="true">${unit.number}</span>
        <span class="academy-unit-copy"><strong>${unit.title}</strong><small data-study-path-status="${unit.id}"${tracked?' data-practice-status="not-recorded"':''}>${label}</small></span>
        <span class="academy-unit-arrow" aria-hidden="true">↗</span>
      </a>
    </li>`;
  }).join("");
  return `<section class="academy-learning-directory" data-study-path aria-labelledby="academy-available-title">
    <div class="academy-directory-heading"><div><div class="kicker">01 / Available coursework</div>
      <h2 id="academy-available-title">Choose a real lesson.</h2></div>
      <span class="academy-directory-count">${available.length} available previews / ${planned} planned units</span></div>
    <p class="academy-directory-intro">Eight introductory CFP-101 lesson previews are available without an account. Each explains an educational model; independent course assessment and academic credit are not provided.</p>
    <ol class="academy-unit-list">${links}</ol>
    <div class="academy-directory-foot"><span data-study-path-progress>0 of 3 practice checks recorded on this device.</span><span>Local practice only · No course credit or verified completion</span></div>
    <a class="academy-directory-syllabus" href="${base}/academy/cfp-101">Inspect all ${CFP_101.units.length} syllabus units, including planned topics →</a>
  </section>`;
}
