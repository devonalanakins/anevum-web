// Same-origin, browser-only neuron instrument.
export const NEURON_LIF_CLIENT_BROWSER_MODULE = String.raw`
// ANEVUM NEURO model 001. No remote IO, patient data, profile or research award.
import {simulateNeuron} from "/institute-preview/neuron-lif-model.js";
const root=document.querySelector("[data-neuron-lab]");
if(root){
  const tau=root.querySelector("[data-neuron-tau]");
  const drive=root.querySelector("[data-neuron-drive]");
  const run=root.querySelector("[data-neuron-run]");
  const exporter=root.querySelector("[data-neuron-export]");
  const status=root.querySelector("[data-neuron-status]");
  const output=root.querySelector("[data-neuron-results]");
  const chart=root.querySelector("[data-neuron-chart]");
  let last=null;
  function invalidate(){
    last=null;output.hidden=true;exporter.disabled=true;
    status.textContent="Settings changed. Run the local simulation again to update the trace.";
  }
  tau.addEventListener("change",invalidate);
  drive.addEventListener("change",invalidate);
  const NS="http://www.w3.org/2000/svg";
  function add(tag,attrs={},textValue){
    const el=document.createElementNS(NS,tag);
    for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));
    if(textValue!==undefined)el.textContent=String(textValue);
    chart.appendChild(el);
    return el;
  }
  const left=62,right=784,top=15,bottom=216,rangeLow=-76,rangeHigh=-38;
  const x=t=>left+t/200*(right-left);
  const y=v=>bottom-(v-rangeLow)/(rangeHigh-rangeLow)*(bottom-top);
  function renderChart(result){
    chart.replaceChildren();
    add("rect",{x:x(20),y:top,width:x(160)-x(20),height:bottom-top,fill:"#ebdfc3",opacity:"0.52"});
    [-65,-50,-40].forEach(function(v){
      const yy=y(v);
      add("line",{x1:left,x2:right,y1:yy,y2:yy,stroke:"#9daea5","stroke-width":v===-50?1.7:1,"stroke-dasharray":v===-50?"7 5":"2 6"});
      add("text",{x:47,y:yy+4,"text-anchor":"end","font-size":12,fill:"#455f58"},v+" mV");
    });
    for(const t of [0,50,100,150,200]){
      add("text",{x:x(t),y:242,"text-anchor":"middle","font-size":12,fill:"#455f58"},t+" ms");
    }
    add("polyline",{points:result.trace.map(p=>x(p.timeMs).toFixed(2)+","+y(p.voltageMv).toFixed(2)).join(" "),fill:"none",stroke:"#245a62","stroke-width":2.2,"stroke-linejoin":"round"});
    result.spikeTimesMs.forEach(function(t){
      add("line",{x1:x(t),x2:x(t),y1:y(-49),y2:y(-38),stroke:"#ae7449","stroke-width":2.5});
    });
  }
  function show(result){
    root.querySelector("[data-neuron-settings-label]").textContent="τ "+result.settings.tauMs+" ms · D "+result.settings.driveMv+" mV";
    root.querySelector("[data-neuron-count]").textContent=String(result.metrics.spikeCount);
    root.querySelector("[data-neuron-first]").textContent=result.metrics.firstSpikeMs===null?"None":result.metrics.firstSpikeMs.toFixed(1);
    root.querySelector("[data-neuron-isi]").textContent=result.metrics.meanInterspikeIntervalMs===null?"N/A":result.metrics.meanInterspikeIntervalMs.toFixed(2)+" ms";
    root.querySelector("[data-neuron-summary]").textContent="The ideal model generated "+result.metrics.spikeCount+
      " threshold event"+(result.metrics.spikeCount===1?"":"s")+" during 200 ms. "+
      (result.metrics.spikeCount?"First threshold crossing: "+result.metrics.firstSpikeMs+" ms.":"The selected effective drive did not cross −50 mV.")+
      " No biological action potentials were recorded.";
    renderChart(result);
    output.hidden=false;
  }
  run.addEventListener("click",function(){
    try{
      const result=simulateNeuron({tauMs:Number(tau.value),driveMv:Number(drive.value)});
      show(result);last=result;exporter.disabled=false;
      status.textContent="Model run completed locally; no physical measurements or remote tasks.";
    }catch(error){
      invalidate();status.textContent="Simulation rejected: "+String(error&&error.message||"invalid settings");
    }
  });
  exporter.addEventListener("click",function(){
    if(!last)return;
    const blob=new Blob([JSON.stringify(last,null,2)+"\n"],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");anchor.href=url;anchor.download="anevum-neuron-lif-simulation.json";anchor.hidden=true;
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
    status.textContent="Simulated trace JSON export requested. This is not a validated biological or clinical record.";
  });
  root.dataset.neuronReady="true";
}

`;
