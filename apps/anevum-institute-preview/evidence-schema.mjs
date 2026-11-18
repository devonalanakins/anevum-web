// ANEVUM evidence draft v1: portable, content-addressed, deliberately UNISSUED.
// A SHA-256 digest can detect accidental changes, but does not authenticate anyone and can be recalculated by an attacker.
export const EVIDENCE_FORMAT="anevum-personal-evidence-draft/v1";
export const EVIDENCE_STORAGE_KEY="anevum.institute.evidence-draft.v1";
export const EVIDENCE_LIMITS=Object.freeze({
  title:110,question:420,method:5000,observations:5000,limitations:2400,
  references:8,referenceLength:300,maxImportBytes:32768
});
const FIELDS=["schemaVersion","kind","courseId","title","question","method","observations","limitations","references"];
const KEYS=["format","record","digest"];

export function normalizeEvidence(input){
  if(!input||typeof input!=="object"||Array.isArray(input))throw new TypeError("Evidence must be an object");
  const references=Array.isArray(input.references)?input.references.slice():input.references;
  return {
    schemaVersion:1,
    kind:"personal-unreviewed-draft",
    courseId:typeof input.courseId==="string"?input.courseId:"CFP-101",
    title:typeof input.title==="string"?input.title.trim():"",
    question:typeof input.question==="string"?input.question.trim():"",
    method:typeof input.method==="string"?input.method.trim():"",
    observations:typeof input.observations==="string"?input.observations.trim():"",
    limitations:typeof input.limitations==="string"?input.limitations.trim():"",
    references:references
  };
}
export function validateEvidence(input){
  const errors=[];
  if(!input||typeof input!=="object"||Array.isArray(input))return ["Evidence must be an object"];
  for(const key of Object.keys(input))if(!FIELDS.includes(key))errors.push("Unsupported evidence field: "+key);
  if(input.schemaVersion!==1)errors.push("Unsupported schema version");
  if(input.kind!=="personal-unreviewed-draft")errors.push("Record must remain an unreviewed personal draft");
  if(input.courseId!=="CFP-101"&&input.courseId!=="COMPUTE-LAB-001"&&input.courseId!=="NEURO-LAB-001")errors.push("Unknown course identifier");
  for(const [name,min,max] of [["title",8,EVIDENCE_LIMITS.title],["question",12,EVIDENCE_LIMITS.question],["method",35,EVIDENCE_LIMITS.method],["observations",15,EVIDENCE_LIMITS.observations],["limitations",12,EVIDENCE_LIMITS.limitations]]){
    const value=input[name];
    if(typeof value!=="string"||value.trim().length<min||value.length>max)errors.push(name+" must be "+min+"-"+max+" characters");
    if(typeof value==="string"&&/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))errors.push(name+" contains control characters");
  }
  if(!Array.isArray(input.references)||input.references.length>EVIDENCE_LIMITS.references)errors.push("References must contain at most 8 HTTPS links");
  else for(const ref of input.references){
    if(typeof ref!=="string"||ref.length>EVIDENCE_LIMITS.referenceLength){errors.push("Invalid reference length");continue;}
    try{
      const url=new URL(ref);
      if(url.protocol!=="https:"||url.username||url.password||!url.hostname)errors.push("References must be public HTTPS URLs without credentials");
    }catch{errors.push("Invalid reference URL");}
  }
  return errors;
}
export function canonicalEvidence(input){
  const record=normalizeEvidence(input);
  const errors=validateEvidence(record);
  if(errors.length)throw new Error(errors.join("; "));
  return record;
}
export async function digestEvidence(record){
  if(!globalThis.crypto?.subtle)throw new Error("Secure WebCrypto context required to compute a local record digest");
  const canonical=canonicalEvidence(record);
  const bytes=new TextEncoder().encode(JSON.stringify(canonical));
  const result=await globalThis.crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(result)].map(n=>n.toString(16).padStart(2,"0")).join("");
}
export async function createEvidenceEnvelope(input){
  const record=canonicalEvidence(input);
  return {format:EVIDENCE_FORMAT,record,digest:"sha256:"+await digestEvidence(record)};
}
export async function parseEvidenceEnvelope(value){
  const source=typeof value==="string"?JSON.parse(value):value;
  if(!source||typeof source!=="object"||Array.isArray(source))throw new Error("Invalid evidence file");
  if(Object.keys(source).sort().join(",")!==KEYS.slice().sort().join(","))throw new Error("Unexpected evidence-file fields");
  if(source.format!==EVIDENCE_FORMAT||!/^sha256:[a-f0-9]{64}$/.test(source.digest||""))throw new Error("Unsupported evidence-file format");
  if(!source.record||typeof source.record!=="object"||Array.isArray(source.record))throw new Error("Missing evidence record");
  const raw=source.record;
  if(Object.keys(raw).sort().join(",")!==FIELDS.slice().sort().join(","))throw new Error("Record contains missing or unauthorized fields");
  const canonical=canonicalEvidence(raw);
  if(JSON.stringify(raw)!==JSON.stringify(canonical))throw new Error("Non-canonical record: field ordering or values were changed");
  const expected="sha256:"+await digestEvidence(canonical);
  if(source.digest!==expected)throw new Error("Integrity mismatch: the evidence file differs from its recorded SHA-256 digest");
  return {format:EVIDENCE_FORMAT,record:canonical,digest:expected};
}

// Strictly parse the browser's ideal AND lab JSON without treating it as physical evidence.
export function validateAndLabNotebook(value){
  const errors=[];
  if(!value||typeof value!=="object"||Array.isArray(value))return ["Laboratory notebook must be a JSON object"];
  const keys=["schemaVersion","experimentId","model","modelDefinition","provenance","limitations","observations","coverage"];
  if(Object.keys(value).sort().join(",")!==keys.sort().join(","))errors.push("Unexpected laboratory notebook fields");
  if(value.schemaVersion!==1||value.experimentId!=="CFP-101-AND-001")errors.push("Unsupported laboratory notebook schema or experiment");
  if(value.model!=="ideal-two-input-boolean-and"||value.modelDefinition!=="Q = A AND B")errors.push("Unsupported laboratory model");
  if(value.provenance!=="ANEVUM Open Institute design preview; generated in this browser session")errors.push("Unknown laboratory export provenance");
  if(typeof value.limitations!=="string"||!value.limitations.includes("no analog voltage")||value.limitations.length>250)errors.push("Missing model limitations");
  if(!Array.isArray(value.observations)||value.observations.length<1||value.observations.length>4){
    errors.push("Expected 1-4 simulated observations");
  }else{
    const visited=new Set();
    for(const row of value.observations){
      if(!row||typeof row!=="object"||Array.isArray(row)){
        errors.push("Invalid observation row");continue;
      }
      if(Object.keys(row).sort().join(",")!=="inputA,inputB,outputQ")errors.push("Unexpected observation fields");
      const bits=[row.inputA,row.inputB,row.outputQ];
      if(bits.some(bit=>!Number.isInteger(bit)||(bit!==0&&bit!==1))){
        errors.push("Observations require Boolean bits");continue;
      }
      const key=String(row.inputA)+String(row.inputB);
      if(visited.has(key))errors.push("Duplicate laboratory input state: "+key);
      visited.add(key);
      if(row.outputQ!==(row.inputA&&row.inputB?1:0))errors.push("Observation is inconsistent with ideal Boolean AND: "+key);
    }
  }
  const c=value.coverage;
  if(!c||typeof c!=="object"||Array.isArray(c)
    ||Object.keys(c).sort().join(",")!=="complete,observed,possible"
    ||c.possible!==4||c.observed!==value.observations?.length
    ||c.complete!==(c.observed===4))errors.push("Laboratory coverage metadata mismatch");
  return errors;
}
export function evidenceFromAndLabNotebook(value){
  const errors=validateAndLabNotebook(value);
  if(errors.length)throw new Error(errors.join("; "));
  const rows=value.observations.map(row=>String(row.inputA)+String(row.inputB)+" -> "+String(row.outputQ));
  return canonicalEvidence({
    title:"Boolean AND study ("+rows.length+" of 4 states)",
    question:"Which ideal Boolean input combinations produce Q = 1 when Q = A AND B?",
    method:"Using the ANEVUM CFP-101-AND-001 browser simulation, set A and B to each recorded input pair, inspect the resulting Q, and compare it with the ideal AND truth table. Repeat from reset to verify each state. No physical equipment was used.",
    observations:"Simulated (not measured) input and output records:\n"+rows.join("\n")+"\nCoverage: "+rows.length+" of 4 input combinations.",
    limitations:"These are ideal Boolean simulation states, not measurements of voltage, current, semiconductor behavior, energy, propagation delay or uncertainty. This local export is not independently reviewed, signed or validated as research.",
    references:[]
  });
}


/**
 * Validate an untrusted GPU-slot scheduler JSON against a newly recomputed
 * reference from the existing five fixed workloads. This is *mathematical*
 * consistency checking only; neither file origin nor reviewer identity is
 * authenticated. The caller MUST construct expected using the fixed,
 * repository-owned CLUSTER_WORKLOADS and simulateCluster() implementation.
 */
export function validateClusterSchedulerNotebook(value, expected){
  const errors=[];
  if(!value||typeof value!=="object"||Array.isArray(value)){
    return ["Cluster notebook must be a JSON object"];
  }
  if(value.format!=="anevum-cluster-scheduler-simulation/v1"
    ||value.model!=="ideal-discrete-time-nonpreemptive-gpu-slots"
    ||value.independentReview!==false){
    errors.push("Unsupported or misrepresented simulated scheduling notebook");
  }
  if(![4,8].includes(value.capacity)||!["fifo","shortest"].includes(value.policy)){
    errors.push("Unsupported simulated cluster capacity or scheduling policy");
  }
  if(!expected||typeof expected!=="object"||Array.isArray(expected)
    ||expected.format!=="anevum-cluster-scheduler-simulation/v1"
    ||expected.capacity!==value.capacity||expected.policy!==value.policy){
    errors.push("Reference scheduling model does not match the notebook configuration");
  }else if(JSON.stringify(value)!==JSON.stringify(expected)){
    // This also denies unrecognized fields, forged claims, edited metrics,
    // missing jobs, modified job order and altered timeline/provenance strings.
    errors.push("Simulated scheduling results differ from the expected deterministic model");
  }
  return errors;
}
export function evidenceFromClusterSchedulerNotebook(value,expected){
  const errors=validateClusterSchedulerNotebook(value,expected);
  if(errors.length)throw new Error(errors.join("; "));
  const name=value.policy==="fifo"?"strict FIFO":"shortest eligible job first";
  const m=value.metrics;
  const jobs=value.jobs.map(job=>
    job.id.toUpperCase()+" "+job.label+": start "+job.startTick+
    ", finish "+job.finishTick+", wait "+job.waitTicks+
    " abstract ticks ("+job.gpus+" slots)"
  );
  return canonicalEvidence({
    courseId:"COMPUTE-LAB-001",
    title:"Simulated GPU scheduling: "+name+" / "+value.capacity+" slots",
    question:"For five simultaneous illustrative compute jobs, how does the selected GPU-slot scheduling policy affect waiting time, makespan and ideal slot utilization?",
    method:"In the ANEVUM browser-only GPU scheduling simulator, select "+value.capacity+
      " abstract GPU slots and "+name+". All five fixed example workloads arrive at tick 0."+
      " Use the nonpreemptive discrete-time scheduling model, run the simulation and"+
      " record each job's start, finish and queue wait. Repeat the same fixed settings."+
      " No actual compute or networking occurs.",
    observations:"SIMULATED ONLY — no hardware measurements.\n"+
      "Policy: "+name+"; modeled GPU slots: "+value.capacity+"."+
      "\nMakespan: "+m.makespanTicks+" abstract ticks; mean queue wait: "+m.meanWaitTicks+
      " ticks; occupied slot-ticks: "+m.busyGpuTicks+
      "; ideal modeled utilization: "+m.gpuUtilizationPercent+"%."+
      "\n"+jobs.join("\n"),
    limitations:"The imported file matched a fresh execution of the same deterministic educational model, not an independent observation."+
      " Jobs arrive simultaneously and have fixed integer durations; there is no preemption, GPU memory, topology, network overhead, energy use, failure, queue priority or sustained-arrival workload."+
      " These results are not GPU benchmarks, real training runs, authenticated evidence, external validation or a research credential.",
    references:[]
  });
}


/**
 * Require exact agreement with the canonical in-repository leaky integrate-
 * and-fire model. Recomputing the same simulation checks internal consistency
 * ONLY; it cannot authenticate who generated a file or prove biological truth.
 * Callers must construct expected from trusted model code using allowlisted
 * settings, NEVER from imported constants/trace/assumptions.
 */
export function validateNeuronLifNotebook(value,expected){
  const errors=[];
  if(!value||typeof value!=="object"||Array.isArray(value))return ["Neuron simulation export must be a JSON object"];
  if(value.format!=="anevum-neuron-lif-simulation/v1"
    ||value.model!=="ideal-single-neuron-leaky-integrate-and-fire"
    ||value.provenance!=="deterministic-browser-only-educational-model"
    ||value.independentlyReviewed!==false
    ||value.clinicalUse!==false)errors.push("Unsupported neuron simulation provenance or review/clinical claims");
  if(!value.settings||typeof value.settings!=="object"||Array.isArray(value.settings)
    ||![5,10,20,40].includes(value.settings.tauMs)
    ||![0,10,20,30].includes(value.settings.driveMv))errors.push("Neuron simulation settings are outside the teaching model");
  if(!expected||typeof expected!=="object"||Array.isArray(expected)
    ||expected.format!=="anevum-neuron-lif-simulation/v1"
    ||JSON.stringify(expected.settings)!==JSON.stringify(value.settings))errors.push("Neuron reference model settings do not match");
  else if(JSON.stringify(value)!==JSON.stringify(expected)){
    // Reject altered trace or timestamps, inferred biology, missing events,
    // edited constants, additional fields, changed metrics or false provenance.
    errors.push("Neuron simulation differs from the deterministic reference model");
  }
  return errors;
}
export function evidenceFromNeuronLifNotebook(value,expected){
  const errors=validateNeuronLifNotebook(value,expected);
  if(errors.length)throw new Error(errors.join("; "));
  const s=value.settings,m=value.metrics;
  const intervals=m.meanInterspikeIntervalMs===null?"not defined for fewer than two events":m.meanInterspikeIntervalMs+" ms";
  const first=m.firstSpikeMs===null?"no threshold event":m.firstSpikeMs+" ms";
  return canonicalEvidence({
    courseId:"NEURO-LAB-001",
    title:"Simulated point-neuron dynamics: tau "+s.tauMs+" ms, drive "+s.driveMv+" mV",
    question:"How do the fixed effective input and membrane time constant influence threshold events and integration in a single ideal leaky integrate-and-fire neuron?",
    method:"Use the ANEVUM browser-only single-point-neuron model with tau "+s.tauMs+
      " ms and effective drive "+s.driveMv+" mV. Start at -65 mV. Apply the modeled drive"+
      " between 20 and 160 ms, with -50 mV threshold, 2 ms hard refractory interval,"+
      " 0.5 ms numerical steps, and 200 ms total duration. Export the deterministic"+
      " trace, then compare a repeated run using identical settings. No biological"+
      " tissue, electrodes, patient data, or neural recordings are involved.",
    observations:"SIMULATED ONLY — no neuronal or clinical measurements.\n"+
      "Model: single-point-neuron leaky integrate-and-fire; tau "+s.tauMs+
      " ms; effective drive "+s.driveMv+" mV (voltage shift, not measured current)."+
      "\nTime samples: "+value.trace.length+" at 0.5 ms increments over 200 ms."+
      "\nNumerical threshold crossings: "+m.spikeCount+
      "; first event: "+first+
      "; mean inter-event interval: "+intervals+
      "; peak stored/reset potential: "+m.peakRecordedVoltageMv+" mV."+
      "\nThreshold event times (ms): "+(value.spikeTimesMs.join(", ")||"none")+".",
    limitations:"Agreement with a freshly rerun educational model checks mathematical consistency only, not independent research replication, source authenticity or the validity of human physiology."+
      " This ideal point-neuron model uses a fixed threshold and instantaneous voltage reset; it omits action-potential waveforms, ion channels, dendrites, synaptic inputs, network dynamics, noise, plasticity and model uncertainty."+
      " Its effective drive in mV is not a measured electric current. Nothing here is neural data, a clinical neuropsychological assessment, CNS-regulation evidence or a research credential.",
    references:[]
  });
}

/** The exact same schema functions run in Node tests and the browser sandbox. */
export const EVIDENCE_BROWSER_MODULE=[
  "const EVIDENCE_FORMAT="+JSON.stringify(EVIDENCE_FORMAT)+";",
  "const EVIDENCE_STORAGE_KEY="+JSON.stringify(EVIDENCE_STORAGE_KEY)+";",
  "const EVIDENCE_LIMITS="+JSON.stringify(EVIDENCE_LIMITS)+";",
  "const FIELDS="+JSON.stringify(FIELDS)+";",
  "const KEYS="+JSON.stringify(KEYS)+";",
  normalizeEvidence.toString(),
  validateEvidence.toString(),
  canonicalEvidence.toString(),
  digestEvidence.toString(),
  createEvidenceEnvelope.toString(),
  parseEvidenceEnvelope.toString(),
  validateAndLabNotebook.toString(),
  evidenceFromAndLabNotebook.toString(),
  validateClusterSchedulerNotebook.toString(),
  evidenceFromClusterSchedulerNotebook.toString(),
  validateNeuronLifNotebook.toString(),
  evidenceFromNeuronLifNotebook.toString(),
  "export {EVIDENCE_FORMAT,EVIDENCE_STORAGE_KEY,EVIDENCE_LIMITS,normalizeEvidence,validateEvidence,canonicalEvidence,digestEvidence,createEvidenceEnvelope,parseEvidenceEnvelope,validateAndLabNotebook,evidenceFromAndLabNotebook,validateClusterSchedulerNotebook,evidenceFromClusterSchedulerNotebook,validateNeuronLifNotebook,evidenceFromNeuronLifNotebook};"
].join("\n")+"\n";
