export const EVIDENCE_WORKBENCH_CLIENT=String.raw`import {EVIDENCE_STORAGE_KEY,EVIDENCE_LIMITS,createEvidenceEnvelope,parseEvidenceEnvelope,evidenceFromAndLabNotebook,evidenceFromHalfAdderNotebook,evidenceFromClusterSchedulerNotebook,evidenceFromNeuronLifNotebook} from "/institute-preview/evidence-schema.js";
import {simulateNeuron} from "/institute-preview/neuron-lif-model.js";
import {simulateCluster} from "/institute-preview/cluster-scheduler-model.js";

const panel=document.querySelector("[data-evidence-workbench]");
if(panel){
  const keys=["title","question","method","observations","limitations","references"];
  const status=panel.querySelector("[data-evidence-status]");
  const courseStatus=panel.querySelector("[data-evidence-course]");
  let draftCourseId="CFP-101";
  const state=panel.querySelector("[data-evidence-receipt-state]");
  const digest=panel.querySelector("[data-evidence-digest]");
  const save=panel.querySelector("[data-evidence-save]");
  const exporter=panel.querySelector("[data-evidence-export]");
  const importer=panel.querySelector("[data-evidence-import]");
  const evidenceImportApply=panel.querySelector("[data-evidence-import-apply]");
  const deletion=panel.querySelector("[data-evidence-delete]");
  const labImporter=panel.querySelector("[data-lab-import]");
  const labApply=panel.querySelector("[data-lab-apply]");
  const labFeedback=panel.querySelector("[data-lab-feedback]");
  const halfImporter=panel.querySelector("[data-half-import]");
  const halfApply=panel.querySelector("[data-half-apply]");
  const halfFeedback=panel.querySelector("[data-half-feedback]");
  const clusterImporter=panel.querySelector("[data-cluster-import]");
  const clusterApply=panel.querySelector("[data-cluster-apply]");
  const clusterFeedback=panel.querySelector("[data-cluster-feedback]");
  const neuronImporter=panel.querySelector("[data-neuron-import]");
  const neuronApply=panel.querySelector("[data-neuron-apply]");
  const neuronFeedback=panel.querySelector("[data-neuron-feedback]");

  // Progressive-enhancement disclosure controls: compact by default,
  // keyboard accessible via native summary, and fragment links reveal
  // the exact importer without skipping the real mathematical validators.
  const importHub=panel.querySelector("[data-import-hub]");
  const importSources=[...panel.querySelectorAll("[data-import-source]")];
  function revealImportHash(){
    const id=window.location.hash.slice(1);
    if(!["logic-import","half-import","cluster-import","neuron-import"].includes(id))return;
    const target=panel.querySelector("#"+id);
    if(!target||!importHub)return;
    importHub.open=true;
    for(const item of importSources)item.open=item===target;
    requestAnimationFrame(()=>target.scrollIntoView({block:"start",behavior:"auto"}));
  }
  if(importHub&&importSources.length===4){
    importSources.forEach(function(source){
      source.addEventListener("toggle",function(){
        if(!source.open)return;
        // Fallback for browsers without native details[name] grouping.
        for(const other of importSources)if(other!==source)other.open=false;
      });
    });
    window.addEventListener("hashchange",revealImportHash);
    revealImportHash();
  }
  let stagedEvidence=null;
  let evidenceImportVersion=0;
  function clearStagedEvidence(){
    evidenceImportVersion++;
    stagedEvidence=null;
    evidenceImportApply.hidden=true;
  }
  let stagedLab=null;
  let stagedHalf=null;
  let stagedCluster=null;
  let stagedNeuron=null;
  function clearStagedHalf(){stagedHalf=null;halfApply.hidden=true;}
  function clearStagedLab(){
    stagedLab=null;
    labApply.hidden=true;
  }
  function clearStagedCluster(){
    stagedCluster=null;
    clusterApply.hidden=true;
  }
  function clearStagedNeuron(){stagedNeuron=null;neuronApply.hidden=true;}
  let awaitingDelete=false;
  function report(message){if(status)status.textContent=message;}
  function resetDelete(){awaitingDelete=false;deletion.textContent="Delete saved draft";}
  function resetReceipt(){state.textContent="Unsaved changes";digest.textContent="Not computed for current edits";}
  function inputs(){
    const result={schemaVersion:1,kind:"personal-unreviewed-draft",courseId:draftCourseId};
    for(const key of keys){
      const field=panel.querySelector('[data-evidence-field="'+key+'"]');
      result[key]=key==="references"?field.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean):field.value;
    }
    return result;
  }
  function fill(record){
    draftCourseId=record.courseId||"CFP-101";
    if(courseStatus)courseStatus.textContent=draftCourseId;
    for(const key of keys){
      const field=panel.querySelector('[data-evidence-field="'+key+'"]');
      field.value=key==="references"?record.references.join("\n"):record[key];
    }
  }
  function showReceipt(envelope,label){
    state.textContent=label;
    digest.textContent=envelope.digest;
  }
  function humanError(error){return error instanceof Error?error.message:"An unknown error occurred.";}
  function makeDownload(contents){
    const blob=new Blob([contents],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;link.download="anevum-personal-evidence-"+draftCourseId+".json";link.hidden=true;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  for(const key of keys){
    panel.querySelector('[data-evidence-field="'+key+'"]').addEventListener("input",function(){
      resetReceipt();resetDelete();
    });
  }
  save.addEventListener("click",async function(){
    resetDelete();
    try{
      const envelope=await createEvidenceEnvelope(inputs());
      localStorage.setItem(EVIDENCE_STORAGE_KEY,JSON.stringify(envelope));
      clearStagedEvidence();
      showReceipt(envelope,"Saved in this browser");
      report("Personal draft saved locally. It is not encrypted, submitted, reviewed or published.");
    }catch(error){report("Not saved: "+humanError(error));}
  });
  exporter.addEventListener("click",async function(){
    resetDelete();
    try{
      const envelope=await createEvidenceEnvelope(inputs());
      makeDownload(JSON.stringify(envelope,null,2)+"\n");
      showReceipt(envelope,"Export checksum computed");
      report("JSON export requested. A checksum is not an institution-issued credential or signature.");
    }catch(error){report("Export not created: "+humanError(error));}
  });
  importer.addEventListener("change",async function(){
    clearStagedEvidence();
    clearStagedLab();clearStagedCluster();clearStagedNeuron();clearStagedHalf();
    resetDelete();
    const file=importer.files?.[0];
    if(!file)return;
    const version=evidenceImportVersion;
    try{
      if(file.size>EVIDENCE_LIMITS.maxImportBytes)throw new Error("File exceeds 32 KiB maximum");
      const envelope=await parseEvidenceEnvelope(await file.text());
      // The user can select another file while a large or slow file is being parsed.
      // Only the latest selection may become available for explicit application.
      if(version!==evidenceImportVersion)return;
      stagedEvidence=envelope;
      evidenceImportApply.hidden=false;
      report("Evidence file structure and SHA-256 checked. Select Apply checked draft to editor to replace current unsaved fields. No changes have been applied or saved.");
    }catch(error){
      if(version===evidenceImportVersion)report("Import rejected: "+humanError(error)+". Current editor and saved draft are unchanged.");
    }finally{importer.value="";}
  });
  evidenceImportApply.addEventListener("click",function(){
    if(!stagedEvidence)return;
    const envelope=stagedEvidence;
    clearStagedEvidence();
    fill(envelope.record);
    resetReceipt();
    resetDelete();
    report("Checked evidence draft applied to editor, but not saved. Review its contents and explicitly select Save locally to persist it.");
  });
  labImporter.addEventListener("change",async function(){
    clearStagedEvidence();
    clearStagedLab();
    clearStagedCluster();
    clearStagedNeuron();
    clearStagedHalf();
    neuronFeedback.textContent="No neuron simulation is staged.";
    clusterFeedback.textContent="No GPU scheduling result is staged.";
    labFeedback.textContent="Checking laboratory notebook format and Boolean values…";
    const file=labImporter.files?.[0];
    if(!file)return;
    try{
      if(file.size>8192)throw new Error("Laboratory export exceeds 8 KiB");
      const source=JSON.parse(await file.text());
      stagedLab=evidenceFromAndLabNotebook(source);
      labApply.hidden=false;
      labFeedback.textContent="Validated "+source.observations.length+" of 4 ideal Boolean input states. Select Use checked simulation to replace the current editor fields; nothing is saved or submitted automatically.";
    }catch(error){
      labFeedback.textContent="Laboratory import rejected: "+humanError(error)+". Existing editor and saved data were not changed.";
    }finally{labImporter.value="";}
  });
  labApply.addEventListener("click",function(){
    if(!stagedLab)return;
    fill(stagedLab);resetReceipt();resetDelete();
    clearStagedLab();
    labFeedback.textContent="Simulated results copied into the editor. Review the method and limitations, then select Save locally if you want to keep them.";
    report("Checked simulation staged in your research draft. No institutional verification, account or network upload.");
  });
  halfImporter.addEventListener("change",async function(){
    clearStagedEvidence();
    clearStagedHalf();clearStagedLab();clearStagedCluster();clearStagedNeuron();
    halfFeedback.textContent="Checking the half-adder XOR/AND observations and completeness…";
    const file=halfImporter.files?.[0];
    if(!file)return;
    try{
      if(file.size>8192)throw new Error("Half-adder export exceeds 8 KiB");
      const source=JSON.parse(await file.text());
      stagedHalf=evidenceFromHalfAdderNotebook(source);
      halfApply.hidden=false;
      halfFeedback.textContent="Checked "+source.observations.length+" of 4 ideal input pairs against XOR sum and AND carry. Select Use checked half-adder result to replace the editor fields. Origin, independent review and hardware performance have not been verified.";
    }catch(error){
      clearStagedHalf();
      halfFeedback.textContent="Half-adder import rejected: "+humanError(error)+". Existing editor and saved research are unchanged.";
    }finally{halfImporter.value="";}
  });
  halfApply.addEventListener("click",function(){
    if(!stagedHalf)return;
    fill(stagedHalf);resetReceipt();resetDelete();
    clearStagedHalf();
    halfFeedback.textContent="Checked simulated addition results copied into your editor. Review limitations and select Save locally if desired; no automatic saving or submission.";
    report("Half-adder arithmetic was staged as an unreviewed local draft. No independent verification, credential or physical circuit evidence.");
  });
  clusterImporter.addEventListener("change",async function(){
    clearStagedEvidence();
    clearStagedCluster();
    clearStagedLab();
    clearStagedNeuron();
    clearStagedHalf();
    neuronFeedback.textContent="No neuron simulation is staged.";
    labFeedback.textContent="No Boolean notebook is staged.";
    clusterFeedback.textContent="Checking the GPU scheduling model and metrics…";
    const file=clusterImporter.files?.[0];
    if(!file)return;
    try{
      if(file.size>16384)throw new Error("Simulation export exceeds 16 KiB");
      const source=JSON.parse(await file.text());
      if(!source||![4,8].includes(source.capacity)||!["fifo","shortest"].includes(source.policy)){
        throw new Error("Unsupported scheduler capacity or policy");
      }
      // Always recompute with trusted fixed workloads, never with job data
      // from the untrusted import. Accepting matching math is not provenance.
      const expected=simulateCluster({capacity:source.capacity,policy:source.policy});
      stagedCluster=evidenceFromClusterSchedulerNotebook(source,expected);
      clusterApply.hidden=false;
      clusterFeedback.textContent="Checked all five workloads, timeline allocations and metrics against the deterministic simulator. Select Use checked simulation to replace the current editor fields. No hardware, identity or independent review was verified.";
    }catch(error){
      clearStagedCluster();
      clusterFeedback.textContent="GPU scheduling import rejected: "+humanError(error)+". Existing editor and saved data were not changed.";
    }finally{clusterImporter.value="";}
  });
  clusterApply.addEventListener("click",function(){
    if(!stagedCluster)return;
    fill(stagedCluster);
    resetReceipt();resetDelete();
    clearStagedCluster();
    clusterFeedback.textContent="Simulated GPU scheduling results copied into the editor. Review limitations before choosing Save locally; nothing was submitted or saved automatically.";
    report("Validated simulation staged in your personal research draft. This is not a real hardware benchmark or independently verified evidence.");
  });

  neuronImporter.addEventListener("change",async function(){
    clearStagedEvidence();
    clearStagedNeuron();
    clearStagedHalf();
    clearStagedLab();
    clearStagedCluster();
    labFeedback.textContent="No Boolean notebook is staged.";
    clusterFeedback.textContent="No GPU scheduling result is staged.";
    neuronFeedback.textContent="Checking the ideal neuron model and entire voltage trace…";
    const file=neuronImporter.files?.[0];
    if(!file)return;
    try{
      if(file.size>65536)throw new Error("Neuron simulation export exceeds 64 KiB");
      const imported=JSON.parse(await file.text());
      if(!imported||!imported.settings||![5,10,20,40].includes(imported.settings.tauMs)
        ||![0,10,20,30].includes(imported.settings.driveMv)){
        throw new Error("Unsupported neuron simulation settings");
      }
      // Do not use exported trace, biological constants, or reported metrics
      // as trusted model inputs. Recompute from source-controlled assumptions.
      const expected=simulateNeuron({tauMs:imported.settings.tauMs,driveMv:imported.settings.driveMv});
      stagedNeuron=evidenceFromNeuronLifNotebook(imported,expected);
      neuronApply.hidden=false;
      neuronFeedback.textContent="The 401 voltage samples, threshold events and metrics match a new local model run. Select Use checked neuron simulation to replace editor fields. Biological measurement, origin, identity and peer review have NOT been established.";
    }catch(error){
      clearStagedNeuron();
      neuronFeedback.textContent="Neuron simulation import rejected: "+humanError(error)+". Existing editor and saved data remain unchanged.";
    }finally{neuronImporter.value="";}
  });
  neuronApply.addEventListener("click",function(){
    if(!stagedNeuron)return;
    fill(stagedNeuron);
    resetReceipt();resetDelete();
    clearStagedNeuron();
    neuronFeedback.textContent="The checked ideal-neuron result is in the editor. Review the limitations and explicitly save if desired. Nothing was submitted.";
    report("Local unreviewed neuroscience draft staged. No actual neural recordings, clinical validation, external review or credential.");
  });
  deletion.addEventListener("click",function(){
    if(!awaitingDelete){
      awaitingDelete=true;
      deletion.textContent="Confirm deletion";
      report("Select Confirm deletion again to erase this browser's saved research draft. Unsaved editor text will also be cleared.");
      return;
    }
    try{
      localStorage.removeItem(EVIDENCE_STORAGE_KEY);
      clearStagedEvidence();
      fill({title:"",question:"",method:"",observations:"",limitations:"",references:[]});
      state.textContent="No local draft";digest.textContent="Not computed";
      resetDelete();
      report("This browser's saved personal evidence draft was deleted. No remote copy exists in this preview.");
    }catch(error){resetDelete();report("Delete failed: "+humanError(error));}
  });
  try{
    const raw=localStorage.getItem(EVIDENCE_STORAGE_KEY);
    if(raw){
      if(raw.length>EVIDENCE_LIMITS.maxImportBytes)throw new Error("Saved draft exceeds size limit");
      const envelope=await parseEvidenceEnvelope(raw);
      fill(envelope.record);
      showReceipt(envelope,"Loaded browser-local draft");
      report("Saved unreviewed draft restored from this browser. No institutional review or identity has occurred.");
    }else report("No local draft saved yet. Fill the record to save or export it.");
  }catch(error){
    report("Could not verify saved draft: "+humanError(error)+"; it has not been removed.");
  }
  // Single-use, same-tab AND experiment handoff. Session storage is untrusted:
  // validate the same strict notebook shape as manual file import, then wait for
  // explicit Apply and Save. Never silently change editor fields or saved drafts.
  function consumeAndLabHandoff(){
    const handoffKey="anevum.institute.handoff.and.v1";
    let raw=null;
    try{raw=sessionStorage.getItem(handoffKey);}
    catch(_){return;}
    if(raw===null)return;
    try{sessionStorage.removeItem(handoffKey);}
    catch(_){
      labFeedback.textContent="The browser could not clear its pending transfer. Export and import the notebook manually.";
      return;
    }
    if(window.location.hash!=="#logic-import")return;
    try{
      if(raw.length>8192)throw new Error("Session notebook exceeds 8 KiB");
      const source=JSON.parse(raw);
      if(source?.coverage?.complete!==true||source?.coverage?.observed!==4){
        throw new Error("Direct handoff requires all four Boolean input states");
      }
      stagedLab=evidenceFromAndLabNotebook(source);
      labApply.hidden=false;
      if(importHub)importHub.open=true;
      for(const item of importSources)item.open=item.id==="logic-import";
      labFeedback.textContent="Validated all four ideal Boolean states from a same-tab session transfer. Select Use checked simulation in this draft to replace the current editor fields. Nothing is saved or submitted automatically; origin and authorship are not verified.";
      report("A checked simulated notebook is ready for your explicit approval. Any existing saved draft remains unchanged.");
    }catch(error){
      clearStagedLab();
      labFeedback.textContent="Same-tab handoff rejected: "+humanError(error)+". Existing editor and saved draft were not changed. Export and import the notebook manually.";
      report("The transferred simulation was not applied. Your existing research draft was not changed.");
    }
  }
  // Single-use, same-tab half-adder handoff; session storage is not trusted.
  // Require all four pairs, validate every XOR/AND value, then wait for Apply.
  function consumeHalfHandoff(){
    const key="anevum.institute.handoff.half.v1";
    let raw=null;
    try{raw=sessionStorage.getItem(key);}catch(_){return;}
    if(raw===null)return;
    try{sessionStorage.removeItem(key);}
    catch(_){
      halfFeedback.textContent="The half-adder session transfer could not be cleared; export and import the notebook manually.";
      return;
    }
    if(window.location.hash!=="#half-import")return;
    try{
      if(raw.length>8192)throw new Error("Session notebook exceeds 8 KiB");
      const source=JSON.parse(raw);
      if(source?.coverage?.complete!==true||source?.coverage?.observed!==4){
        throw new Error("Direct transfer requires all four ideal input pairs");
      }
      stagedHalf=evidenceFromHalfAdderNotebook(source);
      halfApply.hidden=false;
      if(importHub)importHub.open=true;
      for(const item of importSources)item.open=item.id==="half-import";
      halfFeedback.textContent="All four half-adder results match the ideal XOR/AND model. Select Use checked half-adder result to replace the editor fields. Nothing is saved automatically; authorship, physical behavior and independent review are not verified.";
      report("A checked, unreviewed half-adder notebook is ready for explicit approval; your saved research draft remains unchanged.");
    }catch(error){
      clearStagedHalf();
      halfFeedback.textContent="Same-tab half-adder transfer rejected: "+humanError(error)+". Existing editor and saved drafts were not changed. Import exported JSON manually if needed.";
      report("The transferred half-adder notebook was not applied. Your existing research draft was not changed.");
    }
  }
  // Single-use same-tab transfers from computational teaching laboratories.
  // Session storage is untrusted, exactly like uploaded JSON. Recompute the
  // source-controlled mathematical models before permitting an explicit Apply.
  function consumeModelHandoff(kind){
    const config=kind==="cluster"
      ?{key:"anevum.institute.handoff.cluster.v1",hash:"#cluster-import",section:"cluster-import",limit:16384,feedback:clusterFeedback,clear:clearStagedCluster}
      :{key:"anevum.institute.handoff.neuron.v1",hash:"#neuron-import",section:"neuron-import",limit:65536,feedback:neuronFeedback,clear:clearStagedNeuron};
    let raw=null;
    try{raw=sessionStorage.getItem(config.key);}
    catch(_){return;}
    if(raw===null)return;
    try{sessionStorage.removeItem(config.key);}
    catch(_){
      config.feedback.textContent="Could not clear the pending session transfer. Export JSON and import it manually instead.";
      return;
    }
    if(window.location.hash!==config.hash)return;
    try{
      if(raw.length>config.limit)throw new Error("Session simulation exceeds the allowed size");
      const source=JSON.parse(raw);
      if(kind==="cluster"){
        if(!source||![4,8].includes(source.capacity)||!["fifo","shortest"].includes(source.policy)){
          throw new Error("Unsupported scheduler settings");
        }
        const expected=simulateCluster({capacity:source.capacity,policy:source.policy});
        stagedCluster=evidenceFromClusterSchedulerNotebook(source,expected);
        clusterApply.hidden=false;
      }else{
        if(!source||!source.settings||![5,10,20,40].includes(source.settings.tauMs)
          ||![0,10,20,30].includes(source.settings.driveMv)){
          throw new Error("Unsupported neuron simulation settings");
        }
        const expected=simulateNeuron({tauMs:source.settings.tauMs,driveMv:source.settings.driveMv});
        stagedNeuron=evidenceFromNeuronLifNotebook(source,expected);
        neuronApply.hidden=false;
      }
      if(importHub)importHub.open=true;
      for(const item of importSources)item.open=item.id===config.section;
      config.feedback.textContent=kind==="cluster"
        ?"The GPU scheduling values were recomputed and checked against the simulation model. Select Use checked simulation to replace the editor fields. No real hardware, authorship or independent review was verified."
        :"The neuron trace and threshold events were recomputed and checked against the teaching model. Select Use checked neuron simulation to replace editor fields. No biological recordings or clinical validity were established.";
      report("A checked, unreviewed teaching-model result is staged. Your current editor and saved draft remain unchanged until you explicitly Apply and Save.");
    }catch(error){
      config.clear();
      config.feedback.textContent="Same-tab handoff rejected: "+humanError(error)+". Editor fields and saved research remain unchanged; use manual JSON import if needed.";
      report("The transferred simulation was not applied. Your existing research draft was not changed.");
    }
  }
  consumeAndLabHandoff();
  consumeHalfHandoff();
  consumeModelHandoff("cluster");
  consumeModelHandoff("neuron");
  panel.setAttribute("data-evidence-ready","true");
}
`;
