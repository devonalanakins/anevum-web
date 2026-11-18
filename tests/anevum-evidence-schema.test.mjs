import test from "node:test";
import assert from "node:assert/strict";
import {
  EVIDENCE_BROWSER_MODULE,EVIDENCE_FORMAT,EVIDENCE_STORAGE_KEY,EVIDENCE_LIMITS,
  normalizeEvidence,canonicalEvidence,validateEvidence,createEvidenceEnvelope,parseEvidenceEnvelope,validateAndLabNotebook,evidenceFromAndLabNotebook
} from "../apps/anevum-institute-preview/evidence-schema.mjs";

const example=()=>({
  schemaVersion:1,
  kind:"personal-unreviewed-draft",
  courseId:"CFP-101",
  title:"AND logic: four simulated input combinations",
  question:"Which of the four input states produces a logical high output?",
  method:"In the ANEVUM ideal Boolean simulation, begin at 00, flip B, then A, then B; write each output and repeat the series.",
  observations:"Observed 00=>0, 01=>0, 11=>1, and 10=>0 in a browser simulation; these are logical states rather than voltages.",
  limitations:"The ideal logic function does not describe transistor-level voltage, energy consumption, delay, physical instrumentation, or measurement uncertainty.",
  references:["https://ocw.mit.edu/"]
});

test("evidence is strictly a personal unreviewed versioned record with real scientific limitations",async()=>{
  const record=canonicalEvidence(example());
  assert.deepEqual(validateEvidence(record),[]);
  assert.equal(record.kind,"personal-unreviewed-draft");
  assert.equal(EVIDENCE_FORMAT,"anevum-personal-evidence-draft/v1");
  assert.ok(EVIDENCE_STORAGE_KEY.startsWith("anevum.institute."));
  const envelope=await createEvidenceEnvelope(record);
  assert.deepEqual(envelope.record,record);
  assert.match(envelope.digest,/^sha256:[0-9a-f]{64}$/);
  assert.deepEqual(await parseEvidenceEnvelope(JSON.stringify(envelope)),envelope);
  assert.ok(!("awards" in envelope)||!("recognition" in envelope));
});

test("browser module uses exact same schema and produces identical digests",async()=>{
  const module=await import("data:text/javascript;charset=utf-8,"+encodeURIComponent(EVIDENCE_BROWSER_MODULE));
  const input=example();
  const node=await createEvidenceEnvelope(input);
  const browser=await module.createEvidenceEnvelope(input);
  assert.deepEqual(browser,node);
  assert.deepEqual(await module.parseEvidenceEnvelope(JSON.stringify(node)),node);
});

test("rejects edited evidence, unrecognized fields, noncanonical data and malformed digests",async()=>{
  const envelope=await createEvidenceEnvelope(example());
  const tampered=structuredClone(envelope);
  tampered.record.observations="01=>1 (altered)";
  await assert.rejects(parseEvidenceEnvelope(tampered),/Integrity mismatch/);
  const unauthorized=structuredClone(envelope);
  unauthorized.record.reviewerSignature="FAKE PEER REVIEW";
  await assert.rejects(parseEvidenceEnvelope(unauthorized),/unauthorized fields/i);
  const mislabeled=structuredClone(envelope);
  mislabeled.format="anevum-issued-credential";
  await assert.rejects(parseEvidenceEnvelope(mislabeled),/Unsupported evidence-file format/);
  const unordered=structuredClone(envelope);
  unordered.record=Object.fromEntries(Object.entries(envelope.record).reverse());
  await assert.rejects(parseEvidenceEnvelope(unordered),/Non-canonical record/);
  const spaces=structuredClone(envelope);
  spaces.record.title=" "+spaces.record.title;
  await assert.rejects(parseEvidenceEnvelope(spaces),/Non-canonical record/);
  const extra=structuredClone(envelope);
  extra.issuer="ANEVUM";
  await assert.rejects(parseEvidenceEnvelope(extra),/Unexpected evidence-file fields/);
  await assert.rejects(parseEvidenceEnvelope('{"__proto__":{"admin":true}}'),/Unexpected evidence-file fields/);
  await assert.rejects(parseEvidenceEnvelope("not-json"));
});

test("rejects malformed scientific drafts without making up provenance",()=>{
  assert.ok(validateEvidence({}).length>0);
  assert.throws(()=>canonicalEvidence({title:"a"}),/characters|References/);
  const values=example();values.kind="reviewed-and-published";
  assert.match(validateEvidence(values).join(" | "),/unreviewed/);
  const refs=example();refs.references=["http://example.com/source"];
  assert.match(validateEvidence(refs).join(" | "),/HTTPS/);
  const creds=example();creds.references=["https://dev:secret@example.com/file"];
  assert.match(validateEvidence(creds).join(" | "),/without credentials/);
  const tooMany=example();tooMany.references=Array.from({length:9},(_,i)=>"https://example.org/"+i);
  assert.match(validateEvidence(tooMany).join(" | "),/at most 8/);
  const tooLong=example();tooLong.method="x".repeat(EVIDENCE_LIMITS.method+1);
  assert.match(validateEvidence(tooLong).join(" | "),/method/);
  const control=example();control.observations+="\u0000";
  assert.match(validateEvidence(control).join(" | "),/control characters/);
  const extra=example();extra.reviewed=true;
  assert.match(validateEvidence(extra).join(" | "),/Unsupported evidence field/);
  assert.equal(normalizeEvidence({...example(),title:"   a title   "}).title,"a title");
  assert.throws(()=>normalizeEvidence([]),/object/);
});

const andNotebook=()=>({
  schemaVersion:1,
  experimentId:"CFP-101-AND-001",
  model:"ideal-two-input-boolean-and",
  modelDefinition:"Q = A AND B",
  provenance:"ANEVUM Open Institute design preview; generated in this browser session",
  limitations:"Ideal logical states only; no analog voltage, propagation delay, transistor physics or uncertainty is modeled.",
  observations:[
    {inputA:0,inputB:0,outputQ:0},
    {inputA:0,inputB:1,outputQ:0},
    {inputA:1,inputB:1,outputQ:1},
    {inputA:1,inputB:0,outputQ:0}
  ],
  coverage:{observed:4,possible:4,complete:true}
});

test("real AND laboratory export maps to a scientifically qualified draft without institutional claims",async()=>{
  const exported=andNotebook();
  assert.deepEqual(validateAndLabNotebook(exported),[]);
  const draft=evidenceFromAndLabNotebook(exported);
  assert.equal(draft.kind,"personal-unreviewed-draft");
  assert.match(draft.title,/4 of 4 states/);
  assert.match(draft.observations,/11 -> 1/);
  assert.match(draft.observations,/Simulated \(not measured\)/);
  assert.match(draft.limitations,/not independently reviewed/);
  assert.deepEqual(draft.references,[]);
  const envelope=await createEvidenceEnvelope(draft);
  assert.deepEqual(await parseEvidenceEnvelope(envelope),envelope);
  const browser=await import("data:text/javascript;charset=utf-8,"+encodeURIComponent(EVIDENCE_BROWSER_MODULE));
  assert.deepEqual(browser.evidenceFromAndLabNotebook(exported),draft);
});

test("rejects manipulated AND gate output, duplicate inputs, fake model, incomplete or forged coverage",()=>{
  const modified=andNotebook();
  modified.observations[2].outputQ=0;
  assert.match(validateAndLabNotebook(modified).join("; "),/inconsistent with ideal Boolean AND/);
  assert.throws(()=>evidenceFromAndLabNotebook(modified),/inconsistent/);
  const duplicated=andNotebook();
  duplicated.observations[2]={inputA:0,inputB:0,outputQ:0};
  assert.match(validateAndLabNotebook(duplicated).join("; "),/Duplicate/);
  const forged=andNotebook();
  forged.model="measured-CMOS";
  assert.match(validateAndLabNotebook(forged).join("; "),/Unsupported laboratory model/);
  const falseCoverage=andNotebook();
  falseCoverage.coverage.complete=false;
  assert.match(validateAndLabNotebook(falseCoverage).join("; "),/coverage metadata mismatch/);
  const surprise=andNotebook();
  surprise.reviewedBy="ANEVUM";
  assert.match(validateAndLabNotebook(surprise).join("; "),/Unexpected laboratory notebook fields/);
  const outOfRange=andNotebook();
  outOfRange.observations[0].inputA=2;
  assert.match(validateAndLabNotebook(outOfRange).join("; "),/Boolean bits/);
  const partial=andNotebook();
  partial.observations=partial.observations.slice(0,2);
  partial.coverage={observed:2,possible:4,complete:false};
  assert.deepEqual(validateAndLabNotebook(partial),[]);
  assert.match(evidenceFromAndLabNotebook(partial).observations,/2 of 4/);
});
