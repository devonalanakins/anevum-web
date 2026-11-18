// ANEVUM Open Institute: accessible shared study tools for available preview lessons.
// Device-only experimental support; no account, server-side notes, telemetry, or cloud sync.
const LESSONS=Object.freeze({
  "CFP-101-U01":{label:"Lesson 01 · Transistor switching",filename:"anevum-cfp101-u01-notes.txt"},
  "CFP-101-U02":{label:"Lesson 02 · Boolean logic",filename:"anevum-cfp101-u02-notes.txt"},
  "CFP-101-U03":{label:"Lesson 03 · Half adders",filename:"anevum-cfp101-u03-notes.txt"},
  "CFP-101-U04":{label:"Lesson 04 · Clocked registers",filename:"anevum-cfp101-u04-notes.txt"},
  "CFP-101-U05":{label:"Lesson 05 · Addressed memory",filename:"anevum-cfp101-u05-notes.txt"}
});

export function studyToolsHtml(unitId){
  const unit=Object.hasOwn(LESSONS,unitId)?LESSONS[unitId]:null;
  if(!unit)throw new TypeError("Unsupported or unreviewed study-notes unit");
  return `<section class="study-notes" data-study-lesson="${unitId}" data-study-filename="${unit.filename}" aria-label="Personal study notes">
    <div class="study-notes-header"><div class="kicker">Learning Studio / Local notebook</div><h2>Keep your reasoning.</h2><p class="study-notes-subtitle">${unit.label}</p></div>
    <p>Notes and bookmarks are stored only in this browser profile, if storage is available. Bookmarking also saves the text currently in the editor. They are not encrypted or synced, and other people using this profile could read them. In-site links ask before discarding unsaved edits; browser close or app switch warnings may not appear on mobile Safari. Do not enter sensitive personal information.</p>
    <label for="notes-${unitId}">Your notes</label>
    <textarea id="notes-${unitId}" data-study-text maxlength="8000" rows="6" placeholder="Write a derivation, question, or observation in your own words…"></textarea>
    <div class="study-actions"><button class="btn small" type="button" data-study-save>Save notes</button><button class="btn ghost small" type="button" data-study-download>Export .txt</button></div>
    <div class="study-import">
      <label for="notes-import-${unitId}">Bring back exported notes for this lesson (.txt)</label>
      <input id="notes-import-${unitId}" type="file" accept=".txt,text/plain" data-study-import>
      <button class="btn ghost small" type="button" data-study-import-apply hidden>Apply imported notes to editor</button>
      <p class="study-import-disclosure">ANEVUM notes exports from this same lesson only. Importing checks the file locally; your current text and saved notes stay unchanged until you explicitly apply, then save.</p>
    </div>
    <div class="study-actions secondary"><button class="study-bookmark" type="button" data-study-bookmark aria-pressed="false">Bookmark this lesson</button><button class="study-delete" type="button" data-study-clear>Delete saved notes</button></div>
    <p class="study-status" data-study-status role="status" aria-live="polite">Notes have not been loaded.</p>
    <noscript><p>Interactive notes require JavaScript; you can still read and study every lesson without it.</p></noscript>
  </section>`;
}
