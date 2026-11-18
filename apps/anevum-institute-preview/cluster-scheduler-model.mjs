// ANEVUM Open Institute: deterministic, pedagogical GPU-slot scheduler model.
// This is not a GPU allocator, a driver, a cloud service, or measured hardware telemetry.
export const CLUSTER_WORKLOADS=Object.freeze([
  Object.freeze({id:"j1",label:"Small inference",gpus:1,ticks:2}),
  Object.freeze({id:"j2",label:"Model fine-tuning",gpus:4,ticks:5}),
  Object.freeze({id:"j3",label:"Evaluation batch",gpus:2,ticks:3}),
  Object.freeze({id:"j4",label:"Embedding build",gpus:1,ticks:4}),
  Object.freeze({id:"j5",label:"Batch inference",gpus:1,ticks:1})
]);
export const CLUSTER_SCHEDULER_FORMAT="anevum-cluster-scheduler-simulation/v1";
const POLICIES=new Set(["fifo","shortest"]);
function finiteInteger(value,min,max){return Number.isSafeInteger(value)&&value>=min&&value<=max;}
export function simulateCluster({capacity=4,policy="fifo",jobs=CLUSTER_WORKLOADS}={}){
  if(!finiteInteger(capacity,4,8))throw new RangeError("Capacity must be 4–8 simulated GPU slots");
  if(!POLICIES.has(policy))throw new TypeError("Scheduling policy must be fifo or shortest");
  if(!Array.isArray(jobs)||!jobs.length||jobs.length>16)throw new RangeError("Jobs must contain 1–16 workloads");
  const seen=new Set();
  const queue=jobs.map((job,index)=>{
    if(!job||typeof job!=="object"||Array.isArray(job))throw new TypeError("Invalid job record");
    if(typeof job.id!=="string"||!/^[a-z][a-z0-9-]{0,19}$/.test(job.id)||seen.has(job.id))throw new TypeError("Duplicate or invalid job ID");
    seen.add(job.id);
    if(typeof job.label!=="string"||job.label.trim().length<3||job.label.length>60)throw new TypeError("Invalid job label");
    if(!finiteInteger(job.gpus,1,capacity)||!finiteInteger(job.ticks,1,64))throw new RangeError("Job resources or duration outside the model bounds");
    return {id:job.id,label:job.label,gpus:job.gpus,ticks:job.ticks,index,startTick:null,finishTick:null};
  });
  const pending=queue.slice(),active=[],completed=[];
  const timeline=[];
  let tick=0;
  while(completed.length<queue.length){
    for(let i=active.length-1;i>=0;i--){
      if(active[i].finishTick===tick)completed.push(...active.splice(i,1));
    }
    const candidates=pending.slice().sort(policy==="shortest"
      ?(a,b)=>a.ticks-b.ticks||a.index-b.index
      :(a,b)=>a.index-b.index);
    let used=active.reduce((sum,job)=>sum+job.gpus,0);
    for(const job of candidates){
      if(job.gpus>capacity-used){
        // Strict FIFO never bypasses a waiting head-of-line job.
        if(policy==="fifo")break;
        continue;
      }
      job.startTick=tick;
      job.finishTick=tick+job.ticks;
      used+=job.gpus;
      pending.splice(pending.indexOf(job),1);
      active.push(job);
    }
    if(completed.length===queue.length)break;
    if(!active.length)throw new Error("Scheduler deadlock: no job running");
    const running=active.slice().sort((a,b)=>a.index-b.index).map(job=>({id:job.id,gpus:job.gpus}));
    timeline.push({tick,usedGpus:used,freeGpus:capacity-used,running,queued:pending.map(job=>job.id)});
    tick++;
    if(tick>1024)throw new Error("Scheduler exceeded finite model horizon");
  }
  const resultJobs=queue.slice().sort((a,b)=>a.index-b.index).map(job=>({
    id:job.id,label:job.label,gpus:job.gpus,ticks:job.ticks,
    startTick:job.startTick,finishTick:job.finishTick,waitTicks:job.startTick
  }));
  const work=resultJobs.reduce((sum,job)=>sum+job.gpus*job.ticks,0);
  const avgWait=resultJobs.reduce((sum,job)=>sum+job.waitTicks,0)/resultJobs.length;
  const makespan=timeline.length;
  const percentage=Math.round((1000*work)/(makespan*capacity))/10;
  return {
    format:CLUSTER_SCHEDULER_FORMAT,
    model:"ideal-discrete-time-nonpreemptive-gpu-slots",
    assumptions:["All jobs arrive at tick 0","Discrete integer-duration workloads","No preemption, memory, topology, networking, energy or failures","FIFO is strict head-of-line; shortest chooses the shortest eligible waiting job"],
    independentReview:false,
    capacity,policy,
    jobs:resultJobs,
    timeline,
    metrics:{makespanTicks:makespan,meanWaitTicks:Math.round(avgWait*100)/100,busyGpuTicks:work,availableGpuTicks:makespan*capacity,gpuUtilizationPercent:percentage}
  };
}
