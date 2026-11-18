// Browser-only deterministic cluster scheduler. No fetch, cloud actions or telemetry.
import {CLUSTER_WORKLOADS,simulateCluster} from "/institute-preview/cluster-scheduler-model.js";
const root=document.querySelector("[data-cluster-lab]");
if(root){
  const policy=root.querySelector("[data-cluster-policy]");
  const capacity=root.querySelector("[data-cluster-capacity]");
  const runButton=root.querySelector("[data-cluster-run]");
  const compareButton=root.querySelector("[data-cluster-compare]");
  const exportButton=root.querySelector("[data-cluster-export]");
  const status=root.querySelector("[data-cluster-status]");
  const resultPanel=root.querySelector("[data-cluster-output]");
  const comparePanel=root.querySelector("[data-cluster-comparison]");
  const timeline=root.querySelector("[data-cluster-timeline]");
  const jobResults=root.querySelector("[data-cluster-job-results]");
  const compareResults=root.querySelector("[data-cluster-compare-results]");
  let lastRecord=null;
  function cell(row,value){const td=document.createElement("td");td.textContent=String(value);row.appendChild(td);}
  function activeSettings(){return {policy:policy.value,capacity:Number(capacity.value),jobs:CLUSTER_WORKLOADS};}
  function stale(){
    lastRecord=null;
    resultPanel.hidden=true;
    comparePanel.hidden=true;
    exportButton.disabled=true;
    status.textContent="Configuration changed. Run the local model to generate new results.";
  }
  policy.addEventListener("change",stale);
  capacity.addEventListener("change",stale);
  function renderTimeline(result){
    timeline.replaceChildren();
    result.timeline.forEach(function(tick){
      const line=document.createElement("div");line.className="cluster-tick";
      const label=document.createElement("span");label.className="cluster-tick-label";label.textContent="t"+tick.tick+" → "+(tick.tick+1);
      const bar=document.createElement("div");bar.className="cluster-tick-bar";
      tick.running.forEach(function(job){
        const segment=document.createElement("span");
        segment.className="cluster-allocation cluster-allocation-"+job.id;
        segment.style.width=(100*job.gpus/result.capacity)+"%";
        segment.textContent=job.id.toUpperCase();
        segment.title=job.id.toUpperCase()+": "+job.gpus+" of "+result.capacity+" GPU slots";
        bar.appendChild(segment);
      });
      if(tick.freeGpus){
        const idle=document.createElement("span");idle.className="cluster-idle";
        idle.style.width=(100*tick.freeGpus/result.capacity)+"%";
        idle.title=tick.freeGpus+" idle GPU slots";bar.appendChild(idle);
      }
      const used=document.createElement("span");used.className="cluster-used";
      used.textContent=tick.usedGpus+" / "+result.capacity;
      line.append(label,bar,used);timeline.appendChild(line);
    });
  }
  function renderResult(result){
    root.querySelector("[data-cluster-policy-label]").textContent=result.policy==="fifo"?"Strict FIFO":"Shortest eligible";
    root.querySelector("[data-cluster-makespan]").textContent=result.metrics.makespanTicks;
    root.querySelector("[data-cluster-wait]").textContent=result.metrics.meanWaitTicks.toFixed(2);
    root.querySelector("[data-cluster-util]").textContent=result.metrics.gpuUtilizationPercent.toFixed(1)+"%";
    jobResults.replaceChildren();
    result.jobs.forEach(function(job){
      const tr=document.createElement("tr");
      [job.id.toUpperCase()+" · "+job.label,job.startTick,job.finishTick,job.waitTicks].forEach(x=>cell(tr,x));
      jobResults.appendChild(tr);
    });
    renderTimeline(result);
    resultPanel.hidden=false;
  }
  function renderComparison(config){
    compareResults.replaceChildren();
    ["fifo","shortest"].forEach(function(name){
      const sample=simulateCluster({...config,policy:name});
      const tr=document.createElement("tr");
      const label=name==="fifo"?"FIFO / strict order":"Shortest eligible";
      [label,sample.metrics.makespanTicks,sample.metrics.meanWaitTicks.toFixed(2),sample.metrics.gpuUtilizationPercent.toFixed(1)+"%"].forEach(x=>cell(tr,x));
      compareResults.appendChild(tr);
    });
    comparePanel.hidden=false;
  }
  function compute(withComparison){
    try{
      const config=activeSettings();
      const result=simulateCluster(config);
      renderResult(result);
      if(withComparison)renderComparison(config);else comparePanel.hidden=true;
      lastRecord=result;
      exportButton.disabled=false;
      status.textContent="Simulation complete. Calculated from fixed abstract workloads on this device; no actual GPUs were used.";
    }catch(error){
      stale();
      status.textContent="Simulation rejected: "+String(error&&error.message||"unknown model error");
    }
  }
  runButton.addEventListener("click",()=>compute(false));
  compareButton.addEventListener("click",()=>compute(true));
  exportButton.addEventListener("click",function(){
    if(!lastRecord){status.textContent="Run a simulation before exporting.";return;}
    const blob=new Blob([JSON.stringify(lastRecord,null,2)+"\n"],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.hidden=true;a.download="anevum-cluster-scheduler-simulation.json";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
    status.textContent="Local JSON export requested. Results remain unreviewed, simulated data only.";
  });
  root.dataset.clusterReady="true";
}
