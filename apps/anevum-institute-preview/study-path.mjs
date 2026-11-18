// CFP-101 preview study navigation. This is a reading aid, not a course-completion tracker.
// All destinations are source-controlled, existing preview lesson paths.
import {CFP_101} from "./curriculum.mjs";

const SHORT_TITLES=Object.freeze({
  "CFP-101-U01":"Transistors",
  "CFP-101-U02":"Logic gates",
  "CFP-101-U03":"Half adders"
});
const available=CFP_101.units.filter(unit=>unit.availability==="preview");

export function studyPathNav(activeUnitId,base="/institute-preview"){
  if(!available.some(unit=>unit.id===activeUnitId))throw new RangeError("Unknown available CFP-101 lesson");
  if(base!=="/institute-preview")throw new RangeError("Invalid preview base");
  const rows=available.map(unit=>{
    const current=unit.id===activeUnitId;
    const status=unit.id==="CFP-101-U03"?"Preview lesson · not tracked":"Check not recorded";
    const statusAttribute=unit.id==="CFP-101-U03"?"":' data-practice-status="not-recorded"';
    return `<li><a class="study-path-link"${current?' aria-current="page"':''} href="${base}${unit.lessonPath}">
      <span class="study-path-index" aria-hidden="true">${unit.number}</span>
      <span class="study-path-details"><strong>${SHORT_TITLES[unit.id]}</strong><small data-study-path-status="${unit.id}"${statusAttribute}>${status}</small></span>
    </a></li>`;
  }).join("");
  return `<nav class="study-path" data-study-path aria-label="CFP-101 available lesson navigation">
    <div class="study-path-heading"><span>CFP-101 / Study sequence</span><a href="${base}/academy/cfp-101">Full syllabus →</a></div>
    <ol class="study-path-links">${rows}</ol>
    <p class="study-path-disclaimer"><span data-study-path-progress>0 of 3 practice checks recorded on this device.</span> This is not a course completion record or academic credit. Five units remain in development.</p>
  </nav>`;
}
