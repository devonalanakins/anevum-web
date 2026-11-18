export const EVIDENCE_WORKBENCH_CLIENT=String.raw`import {EVIDENCE_STORAGE_KEY,EVIDENCE_LIMITS,createEvidenceEnvelope,parseEvidenceEnvelope,evidenceFromAndLabNotebook} from "/institute-preview/evidence-schema.js";

const panel=document.querySelector("[data-evidence-workbench]");
if(panel){
  const keys=["title","question","method","observations","limitations","references"];
  const status=panel.querySelector("[data-evidence-status]");
  const state=panel.querySelector("[data-evidence-receipt-state]");
  const digest=panel.querySelector("[data-evidence-digest]");
  const save=panel.querySelector("[data-evidence-save]");
  const exporter=panel.querySelector("[data-evidence-export]");
  const importer=panel.querySelector("[data-evidence-import]");
  const deletion=panel.querySelector("[data-evidence-delete]");
  const labImporter=panel.querySelector("[data-lab-import]");
  const labApply=panel.querySelector("[data-lab-apply]");
  const labFeedback=panel.querySelector("[data-lab-feedback]");
  let stagedLab=null;
  let awaitingDelete=false;
  function report(message){if(status)status.textContent=message;}
  function resetDelete(){awaitingDelete=false;deletion.textContent="Delete saved draft";}
  function resetReceipt(){state.textContent="Unsaved changes";digest.textContent="Not computed for current edits";}
  function inputs(){
    const result={schemaVersion:1,kind:"personal-unreviewed-draft",courseId:"CFP-101"};
    for(const key of keys){
      const field=panel.querySelector('[data-evidence-field="'+key+'"]');
      result[key]=key==="references"?field.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean):field.value;
    }
    return result;
  }
  function fill(record){
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
    link.href=url;link.download="anevum-personal-evidence-CFP-101.json";link.hidden=true;
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
    resetDelete();
    const file=importer.files?.[0];
    if(!file)return;
    try{
      if(file.size>EVIDENCE_LIMITS.maxImportBytes)throw new Error("File exceeds 32 KiB maximum");
      const envelope=await parseEvidenceEnvelope(await file.text());
      fill(envelope.record);
      showReceipt(envelope,"Imported to editor; not saved");
      report("Checked record structure and SHA-256 integrity. Select Save locally to keep this imported draft.");
    }catch(error){report("Import rejected: "+humanError(error));}
    finally{importer.value="";}
  });
  labImporter.addEventListener("change",async function(){
    stagedLab=null;labApply.hidden=true;
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
    stagedLab=null;labApply.hidden=true;
    labFeedback.textContent="Simulated results copied into the editor. Review the method and limitations, then select Save locally if you want to keep them.";
    report("Checked simulation staged in your research draft. No institutional verification, account or network upload.");
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
  panel.setAttribute("data-evidence-ready","true");
}
`;
