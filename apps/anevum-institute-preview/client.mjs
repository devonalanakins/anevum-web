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
    if(!/^CFP-101-U0[12]$/.test(unitId||""))return;
    var key="anevum.institute.study.v1."+unitId;
    var textarea=panel.querySelector("[data-study-text]");
    var feedback=panel.querySelector("[data-study-status]");
    var bookmark=panel.querySelector("[data-study-bookmark]");
    var saveButton=panel.querySelector("[data-study-save]");
    var exportButton=panel.querySelector("[data-study-download]");
    var deleteButton=panel.querySelector("[data-study-clear]");
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
    if(textarea)textarea.value=initial.note;
    if(bookmark)setBookmark(initial.bookmark);
    report(initial.available?(initial.note||initial.bookmark?"Saved study notes loaded from this browser.":"No saved notes for this lesson."):"Browser storage is unavailable. Export your notes to keep a copy.");
    if(saveButton)saveButton.addEventListener("click",function(){
      resetDelete();
      var current=textarea?textarea.value.slice(0,8000):"";
      var starred=bookmark&&bookmark.getAttribute("aria-pressed")==="true";
      report(writeNotes(current,!!starred)?"Notes saved in this browser profile.":"Save failed: browser storage unavailable. Use Export .txt instead.");
    });
    if(bookmark)bookmark.addEventListener("click",function(){
      resetDelete();
      var next=bookmark.getAttribute("aria-pressed")!=="true";
      var saved=readNotes();
      if(writeNotes(saved.note,next)){
        setBookmark(next);
        report(next?"Lesson bookmarked in this browser.":"Lesson bookmark removed from this browser.");
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
      report("Text export requested. Check browser download permissions if the file does not appear.");
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
        if(textarea)textarea.value="";
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
    var exporter=lab.querySelector("[data-export]");
    if(exporter)exporter.addEventListener("click",function(){
      // Exact values are simulated Boolean outputs, never physical measurements.
      var record={
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
      ["Society",root,"institute overview"],
      ["Academy",root+"/academy","disciplines schools catalog"],
      ["Computing From First Principles",root+"/academy/cfp-101","cfp 101 syllabus curriculum"],
      ["Transistor switching",root+"/learn/cfp-101/transistor-switching","semiconductor cmos lesson 01"],
      ["Boolean logic",root+"/learn/cfp-101/logic-gates","and gate lesson 02"],
      ["AND-gate laboratory",root+"/laboratory/and-gate","simulation experiment notebook"],
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
