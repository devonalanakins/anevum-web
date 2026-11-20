// Exact same-origin browser module, not real neural telemetry.
export const NEURON_LIF_MODEL_BROWSER_MODULE = String.raw`
// Reproducible, ideal single-cell leaky integrate-and-fire teaching model.
// NOT a real membrane recording, biomedical analysis or clinical simulation.
export const NEURON_FORMAT="anevum-neuron-lif-simulation/v1";
export const NEURON_TAUS=Object.freeze([5,10,20,40]);
export const NEURON_DRIVES=Object.freeze([0,10,20,30]);
export const NEURON_CONSTANTS=Object.freeze({
  restMv:-65,resetMv:-65,thresholdMv:-50,
  refractoryMs:2,stepMs:0.5,durationMs:200,
  pulseStartMs:20,pulseEndMs:160
});
function round(value,places=3){return Number(value.toFixed(places));}
export function simulateNeuron({tauMs=20,driveMv=20}={}){
  if(!NEURON_TAUS.includes(tauMs)||!NEURON_DRIVES.includes(driveMv)){
    throw new RangeError("Choose an allowed membrane time constant and depolarizing drive");
  }
  const {restMv,resetMv,thresholdMv,refractoryMs,stepMs,durationMs,pulseStartMs,pulseEndMs}=NEURON_CONSTANTS;
  const alpha=Math.exp(-stepMs/tauMs);
  let voltage=restMv;
  let refractoryUntil=-Infinity;
  const trace=[];
  const spikeTimesMs=[];
  for(let index=0;index<=durationMs/stepMs;index++){
    const timeMs=round(index*stepMs,1);
    const inputActive=timeMs>=pulseStartMs&&timeMs<pulseEndMs;
    if(index>0){
      if(timeMs<refractoryUntil){
        voltage=resetMv;
      }else{
        const drive=inputActive?driveMv:0;
        // Exact constant-input subthreshold RC solution for each 0.5 ms step.
        voltage=restMv+(voltage-restMv)*alpha+drive*(1-alpha);
        // Threshold event is detected on the sampled grid (<=0.5 ms precision).
        if(voltage>=thresholdMv){
          spikeTimesMs.push(timeMs);
          voltage=resetMv;
          refractoryUntil=timeMs+refractoryMs;
        }
      }
    }
    trace.push({timeMs,voltageMv:round(voltage),inputActive});
  }
  const intervals=spikeTimesMs.slice(1).map((time,i)=>time-spikeTimesMs[i]);
  const meanInterval=intervals.length?round(intervals.reduce((a,b)=>a+b,0)/intervals.length,2):null;
  return {
    format:NEURON_FORMAT,
    model:"ideal-single-neuron-leaky-integrate-and-fire",
    provenance:"deterministic-browser-only-educational-model",
    independentlyReviewed:false,
    clinicalUse:false,
    settings:{tauMs,driveMv},
    constants:NEURON_CONSTANTS,
    assumptions:[
      "One point neuron, no dendrites or network connectivity",
      "Effective step drive is a target-voltage shift in mV, not a measured electrical current",
      "Fixed voltage threshold, hard reset and a two-millisecond absolute refractory period",
      "Subthreshold integration uses the exact RC step; spike timing is quantized to 0.5 ms",
      "No modeled action-potential waveform, ion channels, synapses, noise, plasticity or uncertainty"
    ],
    trace,
    spikeTimesMs,
    metrics:{
      spikeCount:spikeTimesMs.length,
      meanInterspikeIntervalMs:meanInterval,
      firstSpikeMs:spikeTimesMs.length?spikeTimesMs[0]:null,
      peakRecordedVoltageMv:Math.max(...trace.map(s=>s.voltageMv))
    }
  };
}

`;
