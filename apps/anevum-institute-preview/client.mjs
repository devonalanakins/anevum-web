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
})();`;
