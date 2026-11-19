export const INSTITUTE_CLIENT = String.raw`
// ANEVUM Open Institute / preview-only client logic. No API, telemetry, account or network calls.
(function(){
  "use strict";
  var KEY="anevum.institute.cfp101.preview.v1";
  function stateRead(){
    try{
      var raw=localStorage.getItem(KEY);
      var obj=raw?JSON.parse(raw):{};
      if(!obj||typeof obj!=="object"||Array.isArray(obj))return {transistor:false,lesson:false,experiment:false};
      return {transistor:obj.transistor===true,lesson:obj.lesson===true,experiment:obj.experiment===true};
    }catch(_){return {transistor:false,lesson:false,experiment:false};}
  }
  function stateWrite(next){
    try{localStorage.setItem(KEY,JSON.stringify(next));return true;}catch(_){return false;}
  }
  function updateStatus(){
    var result=stateRead();
    document.querySelectorAll("[data-local-progress]").forEach(function(el){
      var count=Number(result.transistor)+Number(result.lesson)+Number(result.experiment);
      el.textContent=count+" of 3 learning activities completed on this device";
    });
    // A continuation is a suggested NEXT ACTIVITY, never a claim of mastery.
    var nextStep=!result.transistor
      ?{href:"/institute-preview/learn/cfp-101/transistor-switching",label:"Begin lesson 01 →"}
      :!result.lesson
      ?{href:"/institute-preview/learn/cfp-101/logic-gates",label:"Continue lesson 02 →"}
      :!result.experiment
      ?{href:"/institute-preview/laboratory/and-gate",label:"Run AND laboratory →"}
      :{href:"/institute-preview/learn/cfp-101/half-adders",label:"Explore lesson 03 →"};
    document.querySelectorAll("[data-course-resume]").forEach(function(link){
      link.setAttribute("href",nextStep.href);
      link.textContent=nextStep.label;
    });
    document.querySelectorAll("[data-course-activity-status]").forEach(function(el){
      el.textContent=(Number(result.transistor)+Number(result.lesson)+Number(result.experiment))+" / 3 preview activities recorded on this device · No academic credit";
    });
    // Read-only lesson navigation: checkpoints correspond only to actual local checks.
    document.querySelectorAll("[data-study-path]").forEach(function(nav){
      var checks={"CFP-101-U01":result.transistor,"CFP-101-U02":result.lesson};
      Object.keys(checks).forEach(function(id){
        var marker=nav.querySelector('[data-study-path-status="'+id+'"]');
        if(!marker)return;
        var recorded=checks[id]===true;
        marker.setAttribute("data-practice-status",recorded?"recorded":"not-recorded");
        marker.textContent=recorded?"Check recorded on this device":"Check not recorded";
      });
      var count=Number(result.transistor)+Number(result.lesson)+Number(result.experiment);
      var progress=nav.querySelector("[data-study-path-progress]");
      if(progress)progress.textContent=count+" of 3 practice checks recorded on this device.";
      // Lessons U03–U08 remain untracked: a model event is not course completion.
    });
    // Recognition preview: this is a browser-local practice trace, never an award.
    document.querySelectorAll("[data-evidence-panel]").forEach(function(panel){
      var count=Number(result.transistor)+Number(result.lesson)+Number(result.experiment);
      var counter=panel.querySelector("[data-evidence-count]");
      var caption=panel.querySelector("[data-evidence-label]");
      if(counter)counter.textContent=count+" / 3";
      if(caption)caption.textContent=count===0
        ?"No completed preview activities were found on this device."
        :count+" of 3 preview activities marked complete on this device. This is not independently verified.";
      ["transistor","lesson","experiment"].forEach(function(key){
        var row=panel.querySelector('[data-evidence-activity="'+key+'"]');
        if(row)row.setAttribute("data-evidence-state",result[key]===true?"complete":"incomplete");
      });
    });
  }
  // The inverter is an ideal Boolean model, not an analog circuit simulator.
  var inverter=document.querySelector("[data-inverter-demo]");
  if(inverter){
    var inputHigh=false;
    var toggle=inverter.querySelector("[data-inverter-toggle]");
    var inValue=inverter.querySelector("[data-inverter-input]");
    var outValue=inverter.querySelector("[data-inverter-output]");
    var explanation=inverter.querySelector("[data-inverter-explanation]");
    function renderInverter(){
      if(toggle)toggle.setAttribute("aria-pressed",inputHigh?"true":"false");
      if(inValue)inValue.textContent=inputHigh?"1":"0";
      if(outValue)outValue.textContent=inputHigh?"0":"1";
      if(explanation)explanation.textContent=inputHigh
        ?"Input high: nMOS conducting, pMOS off; output low. Ideal steady-state model."
        :"Input low: pMOS conducting, nMOS off; output high. Ideal steady-state model.";
    }
    if(toggle)toggle.addEventListener("click",function(){inputHigh=!inputHigh;renderInverter();});
    var inverterAnswers=[].slice.call(document.querySelectorAll("[data-inverter-answer]"));
    var inverterFeedback=document.getElementById("inverter-feedback");
    inverterAnswers.forEach(function(button){
      button.addEventListener("click",function(){
        inverterAnswers.forEach(function(item){item.classList.remove("selected","correct");item.setAttribute("aria-pressed","false");});
        button.classList.add("selected");
        button.setAttribute("aria-pressed","true");
        if(button.getAttribute("data-inverter-answer")==="low"){
          button.classList.add("correct");
          if(inverterFeedback)inverterFeedback.textContent="Correct. High input enables the nMOS pull-down path and disables the pMOS pull-up, producing a low output in this ideal model.";
          var record=stateRead();record.transistor=true;stateWrite(record);updateStatus();
        }else{
          if(inverterFeedback)inverterFeedback.textContent="Revisit the complementary pull-up and pull-down paths, then try again.";
        }
      });
    });
    renderInverter();
  }
  // Personal study notes are device-only and scoped to a versioned lesson ID.
  document.querySelectorAll("[data-study-lesson]").forEach(function(panel){
    var unitId=panel.getAttribute("data-study-lesson");
    if(!/^CFP-101-U0[12345678]$/.test(unitId||""))return;
    var key="anevum.institute.study.v1."+unitId;
    var textarea=panel.querySelector("[data-study-text]");
    var feedback=panel.querySelector("[data-study-status]");
    var bookmark=panel.querySelector("[data-study-bookmark]");
    var saveButton=panel.querySelector("[data-study-save]");
    var exportButton=panel.querySelector("[data-study-download]");
    var deleteButton=panel.querySelector("[data-study-clear]");
    var importInput=panel.querySelector("[data-study-import]");
    var importApply=panel.querySelector("[data-study-import-apply]");
    var stagedImportedNotes=null;
    var importRequest=0;
    function clearStagedNotesImport(){
      // Invalidate asynchronous file reads as well as any already-staged import.
      // A subsequent edit, save, bookmark or deletion must win over stale work.
      importRequest++;
      stagedImportedNotes=null;
      if(importApply)importApply.hidden=true;
      if(importInput)importInput.value="";
    }
    var pendingDeletion=false;
    function report(message){if(feedback)feedback.textContent=message;}
    function readNotes(){
      try{
        var raw=localStorage.getItem(key);
        if(!raw)return {available:true,note:"",bookmark:false};
        var data=JSON.parse(raw);
        if(!data||typeof data!=="object"||Array.isArray(data))return {available:true,note:"",bookmark:false};
        return {available:true,note:typeof data.note==="string"?data.note.slice(0,8000):"",bookmark:data.bookmark===true};
      }catch(_){return {available:false,note:"",bookmark:false};}
    }
    function writeNotes(note,bookmarked){
      try{
        localStorage.setItem(key,JSON.stringify({version:1,note:note.slice(0,8000),bookmark:bookmarked}));
        return true;
      }catch(_){return false;}
    }
    function setBookmark(active){
      bookmark.setAttribute("aria-pressed",active?"true":"false");
      bookmark.textContent=active?"Bookmarked on this device":"Bookmark this lesson";
    }
    function resetDelete(){
      pendingDeletion=false;
      if(deleteButton)deleteButton.textContent="Delete saved notes";
    }
    var initial=readNotes();
    // Track the last saved text so a bookmark never silently loses typed edits.
    var persistedNote=initial.note;
    if(textarea)textarea.value=initial.note;
    function hasUnsavedStudyNotes(){
      return !!textarea&&textarea.value.slice(0,8000)!==persistedNote;
    }
    // Safari may not display beforeunload prompts during app switch/termination.
    // This is a best-effort fallback; ordinary links get a direct confirmation.
    var approvedLeave=false;
    window.addEventListener("beforeunload",function(event){
      if(approvedLeave||!hasUnsavedStudyNotes())return;
      event.preventDefault();
      event.returnValue="";
    });
    document.addEventListener("click",function(event){
      if(!hasUnsavedStudyNotes()||approvedLeave||event.defaultPrevented||
         event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      var source=event.target instanceof Element?event.target:null;
      var link=source?.closest("a[href]");
      if(!link||link.hasAttribute("download")||link.target==="_blank")return;
      var href=link.getAttribute("href");
      if(!href||href.startsWith("#"))return;
      var target;
      try{target=new URL(href,window.location.href);}catch(_){return;}
      if(target.protocol!=="http:"&&target.protocol!=="https:")return;
      if(target.origin===location.origin&&target.pathname===location.pathname&&
        target.search===location.search)return;
      if(!window.confirm("You have unsaved lesson notes. Leave this page and discard these edits?")){
        event.preventDefault();
        report("Navigation cancelled. Save notes, bookmark the lesson, or export your text before leaving.");
        return;
      }
      approvedLeave=true;
    },true);
    if(bookmark)setBookmark(initial.bookmark);
    if(textarea)textarea.addEventListener("input",function(){
      resetDelete();
      clearStagedNotesImport();
      if(!initial.available){
        report("Browser storage is unavailable. Export your current notes to keep a copy.");
      }else if(textarea.value.slice(0,8000)===persistedNote){
        report("Current notes match the saved browser-local copy.");
      }else{
        report("Unsaved notes. Select Save notes or Bookmark this lesson before leaving.");
      }
    });
    report(initial.available?(initial.note||initial.bookmark?"Saved study notes loaded from this browser.":"No saved notes for this lesson."):"Browser storage is unavailable. Export your notes to keep a copy.");
    if(saveButton)saveButton.addEventListener("click",function(){
      resetDelete();
      clearStagedNotesImport();
      var current=textarea?textarea.value.slice(0,8000):"";
      var starred=bookmark&&bookmark.getAttribute("aria-pressed")==="true";
      var saved=writeNotes(current,!!starred);
      if(saved)persistedNote=current;
      report(saved?"Notes saved in this browser profile.":"Save failed: browser storage unavailable. Use Export .txt instead.");
    });
    if(bookmark)bookmark.addEventListener("click",function(){
      resetDelete();
      clearStagedNotesImport();
      var next=bookmark.getAttribute("aria-pressed")!=="true";
      // Commit both the bookmark and the *currently visible* notes together.
      var current=textarea?textarea.value.slice(0,8000):"";
      if(writeNotes(current,next)){
        persistedNote=current;
        setBookmark(next);
        report(next?"Lesson bookmarked and current notes saved in this browser.":"Bookmark removed and current notes saved in this browser.");
      }else{
        report("Bookmark could not be saved. Browser storage may be unavailable.");
      }
    });
    if(exportButton)exportButton.addEventListener("click",function(){
      resetDelete();
      var content="ANEVUM Open Institute / "+unitId+" / Personal study notes\n"+
        "Browser-local export; not an institutional transcript.\n\n"+
        (textarea?textarea.value.slice(0,8000):"")+"\n";
      var file=new Blob([content],{type:"text/plain;charset=utf-8"});
      var url=URL.createObjectURL(file);
      var link=document.createElement("a");
      link.href=url;
      link.download=panel.getAttribute("data-study-filename")||"anevum-study-notes.txt";
      link.hidden=true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},5000);
      report("Text export requested. Check browser download permissions if the file does not appear."+
        (textarea&&textarea.value.slice(0,8000)!==persistedNote?" Your edits are not saved in this browser unless you choose Save notes or Bookmark.":""));
    });
    // Import only our own per-lesson exported text, never arbitrary files.
    // A successful file read stages notes for explicit Apply, not for storage.
    if(importInput&&importApply)importInput.addEventListener("change",async function(){
      var file=importInput.files?.[0];
      // Capture the selected File before clearing the input. Cancellation also
      // clears its filename, including when a slow read is still pending.
      clearStagedNotesImport();
      var request=importRequest;
      resetDelete();
      if(!file)return;
      try{
        if(file.size>40960)throw new Error("File exceeds the 40 KiB limit");
        var raw=await file.text();
        if(request!==importRequest)return;
        // A UTF-8 BOM is harmless; all other header fields must match exactly.
        if(raw.charCodeAt(0)===0xFEFF)raw=raw.slice(1);
        var prefix="ANEVUM Open Institute / "+unitId+" / Personal study notes\n"+
          "Browser-local export; not an institutional transcript.\n\n";
        if(!raw.startsWith(prefix)||!raw.endsWith("\n")){
          throw new Error("Not an ANEVUM exported notes file for this exact lesson");
        }
        var imported=raw.slice(prefix.length,-1);
        if(imported.length>8000||imported.indexOf("\u0000")!==-1){
          throw new Error("Imported notes exceed the 8000-character limit or contain invalid text");
        }
        stagedImportedNotes=imported;
        importApply.hidden=false;
        report("Lesson export format checked ("+imported.length+" characters). Current editor and saved notes unchanged. Select Apply imported notes to review the text.");
      }catch(error){
        if(request===importRequest){
          clearStagedNotesImport();
          report("Notes import rejected: "+(error instanceof Error?error.message:"Could not read file")+". Current notes unchanged.");
        }
      }finally{
        if(request===importRequest)importInput.value="";
      }
    });
    if(importApply)importApply.addEventListener("click",function(){
      if(stagedImportedNotes===null||!textarea)return;
      var imported=stagedImportedNotes;
      clearStagedNotesImport();
      textarea.value=imported;
      textarea.dispatchEvent(new Event("input",{bubbles:true}));
      report("Imported notes applied to editor, not saved. Review and select Save notes or Bookmark this lesson to keep them on this device.");
    });
    if(deleteButton)deleteButton.addEventListener("click",function(){
      if(!pendingDeletion){
        pendingDeletion=true;
        deleteButton.textContent="Confirm deletion";
        report("Select Confirm deletion to remove this lesson's saved notes and bookmark from this browser.");
        return;
      }
      try{
        localStorage.removeItem(key);
        clearStagedNotesImport();
        if(textarea)textarea.value="";
        persistedNote="";
        if(bookmark)setBookmark(false);
        resetDelete();
        report("Saved notes and bookmark deleted from this browser profile.");
      }catch(_){
        resetDelete();
        report("Deletion could not be confirmed; browser storage is unavailable.");
      }
    });
  });
  // Learning Workspace and Private Profile reuse the real existing preview records.
  // They NEVER create a server account, public profile, credential or API request.
  if(document.querySelector("[data-member-studio]")||document.querySelector("[data-member-profile]")){
    import("/institute-preview/local-member-client.js").catch(function(){
      var note=document.querySelector("[data-member-status]");
      if(note)note.textContent="Private card editor unavailable. Your existing browser data was not changed.";
      var studio=document.querySelector("[data-member-studio]");
      if(studio)studio.setAttribute("data-member-error","unavailable");
    });
  }
  // Discovery-only WebGL light/fog layer: no 3D models and no impact on study controls.
  // The dedicated source module handles context loss, Save-Data, reduced motion and tab visibility.
  if(document.querySelector("[data-frontier-gl]")){
    import("/institute-preview/frontier-gl.js").catch(function(){
      var canvas=document.querySelector("[data-frontier-gl]");
      if(canvas){canvas.dataset.fxStatus="fallback";canvas.closest(".frontier-media").dataset.fxStatus="fallback";}
    });
  }
  // Cinematic MP4 only exists after reviewed assets have been bundled.
  // No remote video, simulated 3D, or motion for reduced-motion/Save-Data users.
  var frontierVideo=document.querySelector("[data-frontier-video]");
  if(frontierVideo){
    var preferStill=window.matchMedia("(prefers-reduced-motion: reduce)");
    var conserveData=navigator.connection&&navigator.connection.saveData===true;
    function syncFrontierMotion(){
      if(preferStill.matches||conserveData||document.hidden){
        frontierVideo.pause();
        frontierVideo.currentTime=0;
      }else{
        var attempt=frontierVideo.play();
        if(attempt&&typeof attempt.catch==="function")attempt.catch(function(){});
      }
    }
    if(typeof preferStill.addEventListener==="function")preferStill.addEventListener("change",syncFrontierMotion);
    document.addEventListener("visibilitychange",syncFrontierMotion);
    syncFrontierMotion();
  }
  var answers=[].slice.call(document.querySelectorAll("[data-answer]"));
  if(answers.length){
    var feedback=document.getElementById("answer-feedback");
    answers.forEach(function(button){
      button.addEventListener("click",function(){
        answers.forEach(function(item){item.classList.remove("selected","correct");item.setAttribute("aria-pressed","false");});
        button.classList.add("selected");
        button.setAttribute("aria-pressed","true");
        if(button.getAttribute("data-answer")==="and"){
          button.classList.add("correct");
          if(feedback)feedback.textContent="Correct. AND is true only when both inputs are 1. In CMOS, a NAND stage followed by an inverter can implement AND.";
          var result=stateRead();result.lesson=true;stateWrite(result);
          updateStatus();
        }else{
          if(feedback)feedback.textContent="Not quite. Test all four input pairs and identify which operation is 1 only when both inputs are 1.";
        }
      });
    });
  }
  var lab=document.querySelector("[data-and-lab]");
  if(lab){
    var a=false,b=false;
    var visited=new Set();
    var observations=[];
    var inputs=[].slice.call(lab.querySelectorAll("[data-input]"));
    var output=lab.querySelector("[data-output]");
    var aMark=lab.querySelector("[data-a-mark]");
    var bMark=lab.querySelector("[data-b-mark]");
    var progress=lab.querySelector("[data-lab-progress]");
    var meter=lab.querySelector("[data-lab-meter]");
    var note=lab.querySelector("[data-observation]");
    var exportNotice=lab.querySelector("[data-export-status]");
    var handoff=lab.querySelector("[data-to-dossier]");
    var handoffKey="anevum.institute.handoff.and.v1";
    function render(){
      var result=a&&b?1:0;
      var bits=Number(a)+""+Number(b);
      if(!visited.has(bits)){
        visited.add(bits);
        observations.push({inputA:Number(a),inputB:Number(b),outputQ:result});
      }
      inputs.forEach(function(el){
        var active=el.getAttribute("data-input")==="a"?a:b;
        el.setAttribute("aria-pressed",active?"true":"false");
        var indicator=el.querySelector(".indicator");
        if(indicator)indicator.classList.toggle("live",active);
        var val=el.querySelector("[data-switch-value]");
        if(val)val.textContent=active?"1":"0";
      });
      if(output)output.textContent=String(result);
      if(aMark)aMark.textContent=String(Number(a));
      if(bMark)bMark.textContent=String(Number(b));
      lab.querySelectorAll("[data-bits]").forEach(function(row){
        row.classList.toggle("is-selected",row.getAttribute("data-bits")===bits);
      });
      if(progress)progress.textContent=visited.size+" of 4 input combinations tested";
      if(meter)meter.style.width=(visited.size*25)+"%";
      if(handoff)handoff.disabled=visited.size!==4;
      if(note)note.textContent=visited.size===4
        ?"Experiment completed. You have verified the full truth table for AND. This preview records completion on this device only."
        :"Predict the output, then toggle inputs. The AND output is 1 only when both switches are on.";
      if(visited.size===4){var resultState=stateRead();resultState.experiment=true;stateWrite(resultState);updateStatus();}
    }
    inputs.forEach(function(input){
      input.addEventListener("click",function(){
        if(input.getAttribute("data-input")==="a")a=!a;else b=!b;
        render();
      });
    });
    var reset=lab.querySelector("[data-reset]");
    if(reset)reset.addEventListener("click",function(){
      a=false;b=false;visited=new Set();observations=[];render();
      if(exportNotice)exportNotice.textContent="Notebook reset. Only the initial 00 observation remains.";
    });
    // Build the same truthful notebook for file export and local handoff.
    // The receiving workbench treats sessionStorage as untrusted input.
    function makeNotebook(){
      return {
        schemaVersion:1,
        experimentId:"CFP-101-AND-001",
        model:"ideal-two-input-boolean-and",
        modelDefinition:"Q = A AND B",
        provenance:"ANEVUM Open Institute design preview; generated in this browser session",
        limitations:"Ideal logical states only; no analog voltage, propagation delay, transistor physics or uncertainty is modeled.",
        observations:observations.map(function(row){return {
          inputA:row.inputA,inputB:row.inputB,outputQ:row.outputQ
        };}),
        coverage:{observed:observations.length,possible:4,complete:observations.length===4}
      };
    }
    var exporter=lab.querySelector("[data-export]");
    if(exporter)exporter.addEventListener("click",function(){
      // A notebook file remains portable and independent of browser storage.
      var record=makeNotebook();
      var file=new Blob([JSON.stringify(record,null,2)+"\n"],{type:"application/json"});
      var url=URL.createObjectURL(file);
      var anchor=document.createElement("a");
      anchor.href=url;
      anchor.download="anevum-cfp101-and-001.json";
      anchor.hidden=true;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(function(){URL.revokeObjectURL(url);},5000);
      if(exportNotice)exportNotice.textContent="Download requested for "+observations.length+" simulated observation"+(observations.length===1?"":"s")+". Check browser download permissions if no file appears.";
    });
    if(handoff)handoff.addEventListener("click",function(){
      if(visited.size!==4){
        if(exportNotice)exportNotice.textContent="Visit all four Boolean input pairs before transferring a complete notebook.";
        return;
      }
      try{
        var encoded=JSON.stringify(makeNotebook());
        if(encoded.length>8192)throw new Error("Session notebook exceeds 8 KiB");
        sessionStorage.setItem(handoffKey,encoded);
        if(sessionStorage.getItem(handoffKey)!==encoded)throw new Error("Session transfer is unavailable");
        // A local, single-tab navigation. No network submission or automatic save.
        window.location.assign("/institute-preview/dossier#logic-import");
      }catch(_){
        if(exportNotice)exportNotice.textContent="The browser could not prepare the same-tab handoff. Export JSON instead and import it in Research Desk.";
      }
    });
    render();
  }
  updateStatus();
  // Load the separate source-controlled dossier editor only on its own preview route.
  // No accounts, public upload or credential issuance exist in this preview.
  if(document.querySelector("[data-evidence-workbench]")){
    import("/institute-preview/evidence-workbench.js").catch(function(){
      var note=document.querySelector("[data-evidence-status]");
      if(note)note.textContent="The local evidence editor could not load. Your existing saved draft has not been changed.";
    });
  }
  // Filters only the current syllabus presentation; it cannot change coursework or progress.
  (function(){
    var syllabus=document.querySelector("[data-course-units]");
    if(!syllabus)return;
    var controls=[].slice.call(document.querySelectorAll("[data-unit-filter]"));
    var units=[].slice.call(syllabus.querySelectorAll("[data-unit-availability]"));
    var status=document.querySelector("[data-unit-filter-status]");
    var availableCount=units.filter(function(unit){return unit.getAttribute("data-unit-availability")==="available";}).length;
    var plannedCount=units.length-availableCount;
    function select(value){
      controls.forEach(function(button){
        button.setAttribute("aria-pressed",button.getAttribute("data-unit-filter")===value?"true":"false");
      });
      units.forEach(function(unit){
        unit.hidden=value==="available"&&unit.getAttribute("data-unit-availability")!=="available";
      });
      if(status)status.textContent=value==="available"
        ?(plannedCount?"Showing "+availableCount+" available preview lessons. "+plannedCount+" planned units are hidden, not removed.":"All "+availableCount+" introductory previews available; no units hidden.")
        :"Showing all "+units.length+" syllabus units, including "+plannedCount+" planned units.";
    }
    controls.forEach(function(button){
      button.addEventListener("click",function(){select(button.getAttribute("data-unit-filter"));});
    });
    select("all");
  })();

  // CFP-101 / U03: ideal combinational arithmetic, not physical-circuit evidence.
  (function(){
    var bench=document.querySelector("[data-half-adder]");
    if(!bench)return;
    var a=0,b=0;
    var visited=new Map();
    var progress=bench.querySelector("[data-half-progress]");
    var meter=bench.querySelector("[data-half-meter]");
    var feedback=bench.querySelector("[data-half-feedback]");
    var exportStatus=bench.querySelector("[data-half-export-status]");
    var halfTransfer=bench.querySelector("[data-half-to-dossier]");
    var halfHandoffKey="anevum.institute.handoff.half.v1";
    function model(x,y){return {a:x,b:y,sum:x^y,carry:x&y};}
    function observe(){
      var state=model(a,b);
      var key=String(a)+String(b);
      visited.set(key,state);
      bench.querySelectorAll("[data-half-input]").forEach(function(button){
        var name=button.getAttribute("data-half-input");
        var value=name==="a"?a:b;
        button.setAttribute("aria-pressed",value===1?"true":"false");
        button.querySelector("[data-half-input-value]").textContent=String(value);
      });
      bench.querySelector("[data-half-sum]").textContent=String(state.sum);
      bench.querySelector("[data-half-carry]").textContent=String(state.carry);
      feedback.textContent=a+" + "+b+" = binary "+state.carry+state.sum+" (sum "+state.sum+", carry "+state.carry+").";
      bench.querySelectorAll("[data-half-row]").forEach(function(row){
        var rowKey=row.getAttribute("data-half-row");
        row.classList.toggle("is-current",rowKey===key);
        row.classList.toggle("was-visited",visited.has(rowKey));
        row.querySelector("[data-half-visited]").textContent=visited.has(rowKey)?"Seen":"—";
      });
      progress.textContent=visited.size+" of 4 combinations visited in this session."+(visited.size===4?" Complete Boolean coverage; no external review.":"");
      meter.style.width=(visited.size/4*100)+"%";
      halfTransfer.disabled=visited.size!==4;
    }
    bench.querySelectorAll("[data-half-input]").forEach(function(button){
      button.addEventListener("click",function(){
        if(button.getAttribute("data-half-input")==="a")a=1-a;else b=1-b;
        observe();
      });
    });
    bench.querySelector("[data-half-reset]").addEventListener("click",function(){
      a=0;b=0;visited.clear();observe();
      exportStatus.textContent="Experiment restarted. Previous session observations were cleared from this page.";
    });
    function halfNotebook(){
      var rows=[...visited.values()].sort(function(x,y){return x.a*2+x.b-(y.a*2+y.b);});
      return {
        schemaVersion:1,
        kind:"browser-local-unverified-simulation",
        experimentId:"CFP-101-HALF-001",
        courseId:"CFP-101",
        unitId:"CFP-101-U03",
        model:"ideal-Boolean-half-adder",
        assumptions:["binary inputs only","no physical propagation delay","no voltage, noise or power measurements"],
        coverage:{observed:rows.length,possible:4,complete:rows.length===4},
        observations:rows,
        independentlyVerified:false,
        academicCredit:false
      };
    }
    bench.querySelector("[data-half-export]").addEventListener("click",function(){
      var record=halfNotebook();
      try{
        var blob=new Blob([JSON.stringify(record,null,2)+"\n"],{type:"application/json"});
        var url=URL.createObjectURL(blob);
        var anchor=document.createElement("a");
        anchor.download="anevum-cfp101-half-adder-001.json";
        anchor.href=url;anchor.hidden=true;
        document.body.appendChild(anchor);anchor.click();anchor.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},5000);
        exportStatus.textContent="Download requested for "+record.observations.length+" ideal simulation states. The record is not independently authenticated.";
      }catch(_){
        exportStatus.textContent="The browser could not create a download. You can still read the complete truth table above.";
      }
    });
    halfTransfer.addEventListener("click",function(){
      if(visited.size!==4){
        exportStatus.textContent="Visit all four Boolean input pairs before transferring a research draft.";
        return;
      }
      try{
        var raw=JSON.stringify(halfNotebook());
        if(raw.length>8192)throw new Error("Notebook exceeds 8 KiB");
        sessionStorage.setItem(halfHandoffKey,raw);
        if(sessionStorage.getItem(halfHandoffKey)!==raw)throw new Error("Session transfer unavailable");
        // Same-tab handoff is untrusted. The Research Desk independently validates
        // every sum/carry value and waits for an explicit Apply and Save.
        window.location.assign("/institute-preview/dossier#half-import");
      }catch(_){
        exportStatus.textContent="Could not transfer the local half-adder notebook. Export JSON and import it manually instead.";
      }
    });
    observe();
  })();
  (function(){
    var quiz=document.querySelector("[data-half-quiz]");
    if(!quiz)return;
    var status=quiz.querySelector("[data-half-quiz-status]");
    quiz.querySelectorAll("[data-half-answer]").forEach(function(button){
      button.addEventListener("click",function(){
        quiz.querySelectorAll("[data-half-answer]").forEach(function(option){
          option.setAttribute("aria-pressed","false");
          option.classList.remove("correct","selected");
        });
        button.setAttribute("aria-pressed","true");
        button.classList.add("selected");
        if(button.getAttribute("data-half-answer")==="10"){
          button.classList.add("correct");
          status.textContent="Correct. One plus one equals binary 10: sum bit zero, carry bit one.";
        }else{
          status.textContent="Try again. XOR produces the sum bit; AND produces the carry bit. For 1 + 1, the sum is zero and the carry is one.";
        }
      });
    });
  })();


  // CFP-101 Unit 04: ideal four-bit edge-triggered register, browser only.
  // Input edits never update Q. One explicit rising-edge event samples D.
  (function(){
    var bench=document.querySelector("[data-register-bench]");
    if(!bench)return;
    var d=[0,0,0,0],q=[0,0,0,0],cycles=0,events=[];
    var toggles=bench.querySelectorAll("[data-register-bit]");
    var output=bench.querySelector("[data-register-q]");
    var inputWord=bench.querySelector("[data-register-d]");
    var count=bench.querySelector("[data-register-count]");
    var status=bench.querySelector("[data-register-status]");
    var history=bench.querySelector("[data-register-history]");
    var exportStatus=bench.querySelector("[data-register-export-status]");
    function word(bits){return bits.join("");}
    function refresh(){
      toggles.forEach(function(button){
        var index=Number(button.getAttribute("data-register-bit"));
        var active=d[index]===1;
        button.setAttribute("aria-pressed",active?"true":"false");
        button.querySelector("[data-register-bit-value]").textContent=String(d[index]);
      });
      inputWord.textContent=word(d);
      output.textContent=word(q);
      count.textContent=String(cycles);
    }
    function refreshHistory(){
      history.replaceChildren();
      if(!events.length){
        var empty=document.createElement("li");
        empty.textContent="No clock events recorded yet.";
        history.appendChild(empty);return;
      }
      events.slice(-8).reverse().forEach(function(item){
        var li=document.createElement("li");
        li.textContent="Clock "+item.cycle+": D = "+item.d+" → Q = "+item.q;
        history.appendChild(li);
      });
    }
    toggles.forEach(function(button){
      button.addEventListener("click",function(){
        var index=Number(button.getAttribute("data-register-bit"));
        if(!Number.isInteger(index)||index<0||index>=4)return;
        d[index]=1-d[index];
        refresh();
        status.textContent="D changed to "+word(d)+". Q remains "+word(q)+"; no rising clock edge occurred.";
      });
    });
    bench.querySelector("[data-register-clock]").addEventListener("click",function(){
      q=d.slice();cycles++;
      events.push({cycle:cycles,d:word(d),q:word(q)});
      if(events.length>32)events.shift();
      refresh();refreshHistory();
      status.textContent="Rising-edge event "+cycles+": sampled D = "+word(d)+", stored Q = "+word(q)+".";
    });
    bench.querySelector("[data-register-reset]").addEventListener("click",function(){
      d=[0,0,0,0];q=[0,0,0,0];cycles=0;events=[];
      refresh();refreshHistory();
      status.textContent="Ideal teaching model reset to D = 0000 and Q = 0000. No physical reset timing was simulated.";
      exportStatus.textContent="The page-session history was cleared. No external records changed.";
    });
    bench.querySelector("[data-register-export]").addEventListener("click",function(){
      try{
        var record={
          schemaVersion:1,kind:"browser-local-unverified-simulation",
          experimentId:"CFP-101-REG-001",unitId:"CFP-101-U04",
          model:"ideal-four-bit-rising-edge-register",
          assumptions:["discrete rising-edge events","no propagation, setup or hold timing","no physical flip-flop measurements"],
          clockEventCount:cycles,recentEvents:events.slice(),
          independentlyVerified:false,academicCredit:false
        };
        var blob=new Blob([JSON.stringify(record,null,2)+"\n"],{type:"application/json"});
        var url=URL.createObjectURL(blob);
        var anchor=document.createElement("a");anchor.href=url;
        anchor.download="anevum-cfp101-register-001.json";anchor.hidden=true;
        document.body.appendChild(anchor);anchor.click();anchor.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},5000);
        exportStatus.textContent="JSON download requested. These are unverified teaching-model events, not measured hardware data or a Research Desk submission.";
      }catch(_){
        exportStatus.textContent="The browser could not export this page session. No data was transmitted.";
      }
    });
    var quiz= document.querySelector("[data-register-quiz]");
    if(quiz){
      var feedback=quiz.querySelector("[data-register-quiz-status]");
      quiz.querySelectorAll("[data-register-answer]").forEach(function(button){
        button.addEventListener("click",function(){
          quiz.querySelectorAll("[data-register-answer]").forEach(function(choice){
            choice.setAttribute("aria-pressed","false");
            choice.classList.remove("selected","correct");
          });
          button.setAttribute("aria-pressed","true");
          button.classList.add("selected");
          if(button.getAttribute("data-register-answer")==="0011"){
            button.classList.add("correct");
            feedback.textContent="Correct. Q holds 0011 until a rising clock event samples the new input D = 1010.";
          }else{
            feedback.textContent="The input bus does not directly drive stored Q. Without a rising clock event Q stays at 0011.";
          }
        });
      });
    }
    refresh();
  })();


  // CFP-101 / Unit 05: ideal addressed memory in page-session state only.
  // Selecting an address reads its word immediately; only explicit WRITE mutates it.
  (function(){
    var bench=document.querySelector("[data-memory-bench]");
    if(!bench)return;
    var memory=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    var address=0, data=[0,0,0,0], writes=0, history=[];
    var addressButtons=bench.querySelectorAll("[data-memory-address]");
    var dataButtons=bench.querySelectorAll("[data-memory-bit]");
    var readout=bench.querySelector("[data-memory-read]");
    var selected=bench.querySelector("[data-memory-selected]");
    var input=bench.querySelector("[data-memory-input]");
    var count=bench.querySelector("[data-memory-count]");
    var status=bench.querySelector("[data-memory-status]");
    var historyList=bench.querySelector("[data-memory-history]");
    var exportStatus=bench.querySelector("[data-memory-export-status]");
    function word(bits){return bits.join("");}
    function render(){
      addressButtons.forEach(function(button){
        var number=Number(button.getAttribute("data-memory-address"));
        button.setAttribute("aria-pressed",number===address?"true":"false");
      });
      dataButtons.forEach(function(button){
        var index=Number(button.getAttribute("data-memory-bit"));
        button.setAttribute("aria-pressed",data[index]===1?"true":"false");
        button.querySelector("[data-memory-bit-value]").textContent=String(data[index]);
      });
      selected.textContent=String(address);readout.textContent=word(memory[address]);
      input.textContent=word(data);count.textContent=String(writes);
      bench.querySelectorAll("[data-memory-row]").forEach(function(row){
        var index=Number(row.getAttribute("data-memory-row"));
        row.querySelector("[data-memory-cell]").textContent=word(memory[index]);
        if(index===address)row.setAttribute("aria-current","true");else row.removeAttribute("aria-current");
      });
    }
    function refreshHistory(){
      historyList.replaceChildren();
      if(!history.length){
        var empty=document.createElement("li");empty.textContent="No writes recorded.";
        historyList.appendChild(empty);return;
      }
      history.slice(-8).reverse().forEach(function(item){
        var li=document.createElement("li");
        li.textContent="Write "+item.operation+": M["+item.address+"] ← "+item.data;
        historyList.appendChild(li);
      });
    }
    addressButtons.forEach(function(button){
      button.addEventListener("click",function(){
        var next=Number(button.getAttribute("data-memory-address"));
        if(!Number.isInteger(next)||next<0||next>3)return;
        address=next;render();
        status.textContent="Read address "+address+": stored word "+word(memory[address])+". Selecting a location did not change memory.";
      });
    });
    dataButtons.forEach(function(button){
      button.addEventListener("click",function(){
        var index=Number(button.getAttribute("data-memory-bit"));
        if(!Number.isInteger(index)||index<0||index>3)return;
        data[index]=1-data[index];render();
        status.textContent="Write input now "+word(data)+". Stored M["+address+"] remains "+word(memory[address])+" until Write selected word.";
      });
    });
    bench.querySelector("[data-memory-write]").addEventListener("click",function(){
      memory[address]=data.slice();writes++;
      history.push({operation:writes,address:address,data:word(data)});
      if(history.length>32)history.shift();
      render();refreshHistory();
      status.textContent="Write "+writes+": M["+address+"] stored "+word(memory[address])+". Other addresses were not changed.";
    });
    bench.querySelector("[data-memory-reset]").addEventListener("click",function(){
      memory=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
      data=[0,0,0,0];address=0;writes=0;history=[];
      render();refreshHistory();
      status.textContent="Ideal memory reset to four zero words. No physical reset timing or persistence is simulated.";
      exportStatus.textContent="This page-session history was cleared. No external record was changed.";
    });
    bench.querySelector("[data-memory-export]").addEventListener("click",function(){
      try{
        var record={
          schemaVersion:1,kind:"browser-local-unverified-simulation",
          experimentId:"CFP-101-MEM-001",courseId:"CFP-101",unitId:"CFP-101-U05",
          model:"ideal-four-word-four-bit-addressed-memory",
          assumptions:["four logical addresses","four binary bits per word","instantaneous ideal read/write","no clock, real RAM or ISA"],
          writeCount:writes,memory:memory.map(function(row){return row.slice();}),
          recentWrites:history.slice(),independentlyVerified:false,academicCredit:false
        };
        var blob=new Blob([JSON.stringify(record,null,2)+"\n"],{type:"application/json"});
        var url=URL.createObjectURL(blob);
        var link=document.createElement("a");link.href=url;
        link.download="anevum-cfp101-memory-001.json";link.hidden=true;
        document.body.appendChild(link);link.click();link.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},5000);
        exportStatus.textContent="JSON download requested. This record is unverified, browser-local, and not a Research Desk import or physical measurement.";
      }catch(_){
        exportStatus.textContent="The browser could not export this page session. No data was transmitted.";
      }
    });
    var quiz=document.querySelector("[data-memory-quiz]");
    if(quiz){
      var feedback=quiz.querySelector("[data-memory-quiz-status]");
      quiz.querySelectorAll("[data-memory-answer]").forEach(function(button){
        button.addEventListener("click",function(){
          quiz.querySelectorAll("[data-memory-answer]").forEach(function(choice){
            choice.setAttribute("aria-pressed","false");
            choice.classList.remove("selected","correct");
          });
          button.setAttribute("aria-pressed","true");button.classList.add("selected");
          if(button.getAttribute("data-memory-answer")==="1010"){
            button.classList.add("correct");
            feedback.textContent="Correct. A write to address 1 leaves the data at address 2 unchanged.";
          }else{
            feedback.textContent="Each address selects a separate stored word. Writing address 1 cannot change word 2 in this model.";
          }
        });
      });
    }
    render();
  })();

  // CFP-101 Unit 06: one fictional 4-bit instruction encoding, not execution.
  (function(){
    var bench=document.querySelector("[data-assembly-bench]");
    if(!bench)return;
    var source=bench.querySelector("[data-assembly-source]");
    var machine=bench.querySelector("[data-assembly-machine]");
    var status=bench.querySelector("[data-assembly-status]");
    var binary=bench.querySelector("[data-assembly-bits]");
    var result=bench.querySelector("[data-assembly-result]");
    var opcode=bench.querySelector("[data-assembly-opcode]");
    var operand=bench.querySelector("[data-assembly-operand]");
    var historyList=bench.querySelector("[data-assembly-history]");
    var exportStatus=bench.querySelector("[data-assembly-export-status]");
    var mnemonics=["LOAD","STORE","ADD","HALT"],history=[];
    function decode(word){
      if(typeof word!=="string"||word.length!==4||!/^[01]{4}$/.test(word))
        throw new TypeError("Machine word must contain exactly four binary digits");
      var op=parseInt(word.slice(0,2),2);
      var addr=parseInt(word.slice(2),2);
      if(op===3&&addr!==0)throw new RangeError("Reserved encoding: HALT requires operand 00");
      var name=mnemonics[op];
      return {bits:word,opcodeBits:word.slice(0,2),operandBits:word.slice(2),
        assembly:op===3?"HALT":name+" "+addr};
    }
    function assemble(line){
      if(typeof line!=="string"||line.length>32)throw new TypeError("Assembly must be at most 32 characters");
      var clean=line.trim().toUpperCase().replace(/[ \t]+/g," ");
      if(clean==="HALT")return "1100";
      var match=/^(LOAD|STORE|ADD) ([0-3])$/.exec(clean);
      if(!match)throw new RangeError("Use LOAD, STORE or ADD plus address 0–3; or HALT");
      var op=mnemonics.indexOf(match[1]);
      return op.toString(2).padStart(2,"0")+Number(match[2]).toString(2).padStart(2,"0");
    }
    function present(item,mode){
      binary.textContent=item.bits;
      opcode.textContent=item.opcodeBits;operand.textContent=item.operandBits;
      result.textContent=item.assembly;
      source.value=item.assembly;machine.value=item.bits;
      history.push({direction:mode,assembly:item.assembly,bits:item.bits});
      if(history.length>32)history.shift();
      historyList.replaceChildren();
      history.slice(-8).reverse().forEach(function(entry){
        var li=document.createElement("li");
        li.textContent=entry.direction+": "+entry.assembly+" = "+entry.bits;
        historyList.appendChild(li);
      });
      status.textContent=mode+" successful: "+item.assembly+" is "+item.bits+
        ". This is a fictional encoding, not a computer instruction executed here.";
    }
    // The preview prohibits HTML forms entirely, so use scoped buttons and
    // intercept Enter on each text input. No network/navigation is involved.
    var encodeAction=bench.querySelector("[data-assembly-encode]");
    var decodeAction=bench.querySelector("[data-assembly-decode]");
    encodeAction.addEventListener("click",function(){
      try{present(decode(assemble(source.value)),"Assembly");}
      catch(error){status.textContent="Assembly rejected: "+error.message+". Previous valid result unchanged.";}
    });
    decodeAction.addEventListener("click",function(){
      try{present(decode(machine.value),"Disassembly");}
      catch(error){status.textContent="Disassembly rejected: "+error.message+". Previous valid result unchanged.";}
    });
    source.addEventListener("keydown",function(event){
      if(event.key!=="Enter")return;
      event.preventDefault();encodeAction.click();
    });
    machine.addEventListener("keydown",function(event){
      if(event.key!=="Enter")return;
      event.preventDefault();decodeAction.click();
    });
    bench.querySelectorAll("[data-assembly-example]").forEach(function(button){
      button.addEventListener("click",function(){
        source.value=button.getAttribute("data-assembly-example");
        encodeAction.click();
      });
    });
    bench.querySelector("[data-assembly-clear]").addEventListener("click",function(){
      history=[];historyList.replaceChildren();
      var li=document.createElement("li");li.textContent="No conversions recorded.";
      historyList.appendChild(li);
      status.textContent="Page-session conversion history cleared. Your study notes were not changed.";
      exportStatus.textContent="Only the conversion history was cleared; no external data was affected.";
    });
    bench.querySelector("[data-assembly-export]").addEventListener("click",function(){
      try{
        var record={schemaVersion:1,kind:"browser-local-unverified-simulation",
          experimentId:"CFP-101-ASM-001",courseId:"CFP-101",unitId:"CFP-101-U06",
          model:"fictional-four-bit-instruction-encoding",
          operations:["LOAD","STORE","ADD","HALT"],instructionWidthBits:4,
          reservedEncodings:["1101","1110","1111"],
          conversionCount:history.length,recentConversions:history.slice(),
          instructionsExecuted:false,realHardware:false,
          independentlyVerified:false,academicCredit:false};
        var blob=new Blob([JSON.stringify(record,null,2)+"\n"],{type:"application/json"});
        var url=URL.createObjectURL(blob);
        var link=document.createElement("a");link.href=url;
        link.download="anevum-cfp101-assembly-001.json";link.hidden=true;
        document.body.appendChild(link);link.click();link.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},5000);
        exportStatus.textContent="JSON download requested. These are fictional conversions, not executed machine code, verified research or academic credit.";
      }catch(_){exportStatus.textContent="Export failed in this browser. No data was transmitted.";}
    });
    var quiz=document.querySelector("[data-assembly-quiz]");
    if(quiz){
      var feedback=quiz.querySelector("[data-assembly-quiz-status]");
      quiz.querySelectorAll("[data-assembly-answer]").forEach(function(button){
        button.addEventListener("click",function(){
          quiz.querySelectorAll("[data-assembly-answer]").forEach(function(choice){
            choice.setAttribute("aria-pressed","false");
            choice.classList.remove("selected","correct");
          });
          button.setAttribute("aria-pressed","true");button.classList.add("selected");
          if(button.getAttribute("data-assembly-answer")==="0110"){
            button.classList.add("correct");
            feedback.textContent="Correct. STORE is 01 and address 2 is 10, producing 0110.";
          }else feedback.textContent="Review the opcode and the two-bit address independently. STORE is opcode 01.";
        });
      });
    }
  })();


  // CFP-101 Unit 07 — ideal single-core process-scheduling exercise.
  // Each click is a discrete turn, not real CPU execution, a timer or OS.
  (function(){
    var bench=document.querySelector("[data-systems-bench]");
    if(!bench)return;
    var initial={A:2,B:1,C:3};
    var remaining={A:2,B:1,C:3},queue=["A","B","C"],tick=0,history=[];
    var ready=bench.querySelector("[data-systems-queue]");
    var tickText=bench.querySelector("[data-systems-tick]");
    var lastText=bench.querySelector("[data-systems-last]");
    var status=bench.querySelector("[data-systems-status]");
    var historyList=bench.querySelector("[data-systems-history]");
    var advance=bench.querySelector("[data-systems-advance]");
    var exportStatus=bench.querySelector("[data-systems-export-status]");
    function render(){
      ready.textContent=queue.length?queue.join(" → "):"All processes finished";
      tickText.textContent=String(tick);
      advance.disabled=queue.length===0;
      bench.querySelectorAll("[data-systems-row]").forEach(function(row){
        var id=row.getAttribute("data-systems-row");
        row.querySelector("[data-systems-left]").textContent=String(remaining[id]);
        row.querySelector("[data-systems-state]").textContent=remaining[id]===0?"Finished":queue[0]===id?"Next":"Ready";
        if(queue[0]===id)row.setAttribute("aria-current","true");else row.removeAttribute("aria-current");
      });
      historyList.replaceChildren();
      if(!history.length){
        var empty=document.createElement("li");
        empty.textContent="No scheduling turns recorded.";
        historyList.appendChild(empty);
      }else history.forEach(function(item){
        var li=document.createElement("li");
        li.textContent="Turn "+item.tick+": "+item.process+" → "+item.outcome+" ("+item.remaining+" left)";
        historyList.appendChild(li);
      });
    }
    advance.addEventListener("click",function(){
      if(!queue.length)return;
      var process=queue.shift();
      remaining[process]-=1;
      var outcome=remaining[process]===0?"finished":"requeued";
      if(outcome==="requeued")queue.push(process);
      tick++;
      var event={tick:tick,process:process,remaining:remaining[process],outcome:outcome};
      history.push(event);
      lastText.textContent="Turn "+tick+" · "+process+" · "+outcome;
      status.textContent="Process "+process+" used one abstract CPU turn and "+
        (outcome==="finished"?"finished.":"returned to the queue.")+
        (queue.length?" Next: "+queue[0]+".":" All six turns complete.");
      render();
    });
    bench.querySelector("[data-systems-reset]").addEventListener("click",function(){
      remaining={...initial};queue=["A","B","C"];tick=0;history=[];
      lastText.textContent="None yet";
      status.textContent="Teaching model reset. All three processes are ready; no CPU work has been executed.";
      exportStatus.textContent="Local scheduling history cleared. Saved study notes were not changed.";
      render();
    });
    bench.querySelector("[data-systems-export]").addEventListener("click",function(){
      try{
        var record={schemaVersion:1,kind:"browser-local-unverified-simulation",
          experimentId:"CFP-101-SYS-001",courseId:"CFP-101",unitId:"CFP-101-U07",
          model:"ideal-single-core-round-robin-three-processes",
          assumptions:["three simultaneously ready CPU-bound processes","one discrete ideal quantum per click",
            "no I/O blocking or arrivals","no real timer, process, operating system or machine execution"],
          initialWork:{...initial},completedTurns:tick,runQueue:queue.slice(),
          remainingWork:{...remaining},turnHistory:history.map(function(x){return {...x};}),
          realProcessesExecuted:false,realHardware:false,
          independentlyVerified:false,academicCredit:false
        };
        var blob=new Blob([JSON.stringify(record,null,2)+"\n"],{type:"application/json"});
        var url=URL.createObjectURL(blob),link=document.createElement("a");
        link.href=url;link.download="anevum-cfp101-systems-001.json";link.hidden=true;
        document.body.appendChild(link);link.click();link.remove();
        setTimeout(function(){URL.revokeObjectURL(url);},5000);
        exportStatus.textContent="JSON download requested. These are unverified toy scheduling decisions, not real OS telemetry or research evidence.";
      }catch(_){exportStatus.textContent="This browser could not export the page session. Nothing was transmitted.";}
    });
    var quiz=document.querySelector("[data-systems-quiz]");
    if(quiz){
      var feedback=quiz.querySelector("[data-systems-quiz-status]");
      quiz.querySelectorAll("[data-systems-answer]").forEach(function(button){
        button.addEventListener("click",function(){
          quiz.querySelectorAll("[data-systems-answer]").forEach(function(choice){
            choice.setAttribute("aria-pressed","false");
            choice.classList.remove("selected","correct");
          });
          button.setAttribute("aria-pressed","true");button.classList.add("selected");
          if(button.getAttribute("data-systems-answer")==="B"){
            button.classList.add("correct");
            feedback.textContent="Correct. After A uses its first quantum, it moves behind B and C; B is next.";
          }else feedback.textContent="Round-robin chooses the head of the ready queue. A returns behind B and C.";
        });
      });
    }
    render();
  })();

  // Capstone interpreter is browser-only and executes no real machine code.
  if(document.querySelector("[data-cpu-bench]")){
    import("/institute-preview/cpu-capstone-client.js").catch(function(){
      var status=document.querySelector("[data-cpu-status]");
      if(status)status.textContent="The local eight-bit teaching model could not load. No instructions ran.";
    });
  }
  // The GPU scheduling simulator is a browser-only, lazily loaded module.
  if(document.querySelector("[data-cluster-lab]")){
    import("/institute-preview/cluster-scheduler-client.js").catch(function(){
      var message=document.querySelector("[data-cluster-status]");
      if(message)message.textContent="The local scheduling model could not load. No simulation ran.";
    });
  }
  // Computational neuroscience demonstration: isolated, lazy same-origin model.
  if(document.querySelector("[data-neuron-lab]")){
    import("/institute-preview/neuron-lif-client.js").catch(function(){
      var message=document.querySelector("[data-neuron-status]");
      if(message)message.textContent="The local neuron model could not load. No simulation ran.";
    });
  }
  // Local-only navigation. Every result is a real allowlisted preview route.
  (function(){
    var modal=document.querySelector("[data-command-dialog]");
    var triggers=document.querySelectorAll("[data-search-open]");
    if(!modal||!triggers.length||typeof modal.showModal!=="function")return;
    var query=modal.querySelector("[data-command-query]");
    var results=modal.querySelector("[data-command-results]");
    var status=modal.querySelector("[data-command-status]");
    var closer=modal.querySelector("[data-command-close]");
    var previous=null;
    var root="/institute-preview";
    var pages=[
      ["Institute",root,"institute overview"],
      ["Research & Methods",root+"/research","research models method scientific simulation inquiry"],
      ["Academy",root+"/academy","disciplines schools catalog"],
      ["Computing From First Principles",root+"/academy/cfp-101","cfp 101 syllabus curriculum"],
      ["Transistor switching",root+"/learn/cfp-101/transistor-switching","semiconductor cmos lesson 01"],
      ["Boolean logic",root+"/learn/cfp-101/logic-gates","and gate lesson 02"],
      ["Half adders",root+"/learn/cfp-101/half-adders","binary arithmetic combinational xor and sum carry lesson 03"],
      ["Clocked registers",root+"/learn/cfp-101/registers","sequential circuits memory d flip-flop clock rising edge four bit register lesson 04"],
      ["Addressed memory",root+"/learn/cfp-101/addressed-memory","ram words addresses read write store load memory access instruction concepts lesson 05"],
      ["Assembly encoding",root+"/learn/cfp-101/assembly-code","four bit instructions fictional ISA opcode operand LOAD STORE ADD HALT assembler decoder machine code lesson 06"],
      ["Computer systems",root+"/learn/cfp-101/computer-systems","round robin single core cpu scheduling processes operating system software ready queue time slices lesson 07"],
      ["Eight-bit computer",root+"/learn/cfp-101/eight-bit-computer","instruction set cpu accumulator program counter RAM ROM eight-bit capstone lesson 08"],
      ["AND-gate laboratory",root+"/laboratory/and-gate","simulation experiment notebook"],
      ["GPU cluster scheduling",root+"/laboratory/cluster-scheduling","compute gpu allocation fifo shortest job first simulator"],
      ["Neuron dynamics laboratory",root+"/laboratory/neuron-dynamics","neuroscience leaky integrate fire membrane potential threshold spike refractory"],
      ["Research Desk",root+"/dossier","evidence methodology draft"],
      ["Recognition",root+"/recognition","review policy research evidence"],
      ["My Studio",root+"/studio","personal learning progress notes"],
      ["Private Learner Card",root+"/profile","local identity interests"]
    ];
    function render(){
      var q=query.value.trim().toLowerCase();
      var found=pages.filter(function(p){return (p[0]+" "+p[2]).toLowerCase().includes(q);});
      results.replaceChildren();
      found.forEach(function(p){
        var li=document.createElement("li");
        var a=document.createElement("a");
        var name=document.createElement("strong");
        var route=document.createElement("small");
        a.href=p[1];a.className="command-result";
        name.textContent=p[0];route.textContent=p[1].slice(root.length)||"/";
        a.append(name,route);li.appendChild(a);results.appendChild(li);
      });
      status.textContent=found.length?found.length+" available destination"+(found.length===1?"":"s"):"No matching preview destinations.";
    }
    function open(opener){
      previous=opener||document.activeElement;
      query.value="";render();
      if(!modal.open)modal.showModal();
      query.focus();
    }
    triggers.forEach(function(button){button.addEventListener("click",function(){open(button);});});
    closer.addEventListener("click",function(){modal.close();});
    modal.addEventListener("close",function(){if(previous&&typeof previous.focus==="function")previous.focus();});
    query.addEventListener("input",render);
    query.addEventListener("keydown",function(event){
      if(event.key==="ArrowDown"){var first=results.querySelector("a");if(first){event.preventDefault();first.focus();}}
    });
    results.addEventListener("keydown",function(event){
      if(event.key==="ArrowUp"&&event.target===results.querySelector("a")){event.preventDefault();query.focus();}
    });
    document.addEventListener("keydown",function(event){
      if(event.defaultPrevented||event.altKey)return;
      var el=document.activeElement;
      var editing=el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
        event.preventDefault();if(!modal.open)open(el);else query.focus();
      }else if(event.key==="/"&&!event.ctrlKey&&!event.metaKey&&!editing&&!modal.open){
        event.preventDefault();open(el);
      }
    });
  })();

})();`;
