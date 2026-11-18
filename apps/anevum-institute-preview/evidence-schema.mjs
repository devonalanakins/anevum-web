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
    courseId:"CFP-101",
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
  if(input.courseId!=="CFP-101")errors.push("Unknown course identifier");
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
  "export {EVIDENCE_FORMAT,EVIDENCE_STORAGE_KEY,EVIDENCE_LIMITS,normalizeEvidence,validateEvidence,canonicalEvidence,digestEvidence,createEvidenceEnvelope,parseEvidenceEnvelope};"
].join("\n")+"\n";
