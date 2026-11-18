import test from "node:test";
import assert from "node:assert/strict";
import {LOCAL_MEMBER_FORMAT,LOCAL_MEMBER_KEY,INTERESTS,blankMemberCard,validateMemberCard,normalizeMemberCard,parseMemberCard,exportMemberCard,LOCAL_MEMBER_BROWSER_MODULE} from "../apps/anevum-institute-preview/local-member-schema.mjs";

test("private learner card is portable, grounded and never claims a server identity",async()=>{
  const card=blankMemberCard();
  assert.equal(card.version,1);
  assert.equal(LOCAL_MEMBER_FORMAT,"anevum-local-member-card/v1");
  assert.ok(LOCAL_MEMBER_KEY.startsWith("anevum.institute."));
  assert.deepEqual(validateMemberCard(card),[]);
  const modified=normalizeMemberCard({...card,displayName:"Ada Engineer",tagline:"Building repeatable numerical experiments",interests:["Physics","Computing"]});
  assert.deepEqual(parseMemberCard(exportMemberCard(modified)),modified);
  assert.doesNotMatch(exportMemberCard(modified),/awardsIssued|credential|publicProfile|verifiedBy|memberId/);
  const browser=await import("data:text/javascript;charset=utf-8,"+encodeURIComponent(LOCAL_MEMBER_BROWSER_MODULE));
  assert.deepEqual(browser.blankMemberCard(),card);
  assert.deepEqual(browser.parseMemberCard(browser.exportMemberCard(modified)),modified);
});
test("learner import rejects forged privileges, membership, oversize and browser injection strings",()=>{
  const exported=JSON.parse(exportMemberCard(blankMemberCard()));
  for(const invalid of [
    {...exported,public:true},
    {...exported,profile:{...exported.profile,role:"administrator"}},
    {...exported,profile:{...exported.profile,awards:["verified scientist"]}},
    {...exported,profile:{...exported.profile,version:2}},
    {...exported,profile:{...exported.profile,interests:["Computing","Computing"]}},
    {...exported,profile:{...exported.profile,interests:["Space Magic"]}},
    {...exported,profile:{...exported.profile,displayName:"<script>alert(1)</script>\n"}},
    {...exported,profile:{...exported.profile,displayName:""}},
  ])assert.throws(()=>parseMemberCard(JSON.stringify(invalid)));
  assert.throws(()=>parseMemberCard("x".repeat(4097)),/4 KiB/);
  assert.throws(()=>parseMemberCard("not-json"));
  assert.throws(()=>parseMemberCard(JSON.stringify({...exported,format:"anevum-signed-researcher/v1"})),/Unsupported/);
  assert.throws(()=>normalizeMemberCard({...blankMemberCard(),interests:INTERESTS.slice(0,6)}),/five/);
  const escaped=normalizeMemberCard({...blankMemberCard(),displayName:"<img src=x onerror=alert(1)>"});
  assert.ok(escaped.displayName.includes("<img"));
  // Rendering must use textContent, not innerHTML. Validation alone is not a sanitizer.
});
test("private profile remains independent of protected Command and research review states",()=>{
  assert.equal("authenticated" in blankMemberCard(),false);
  assert.equal("verification" in blankMemberCard(),false);
  assert.equal("award" in blankMemberCard(),false);
  assert.ok(INTERESTS.includes("Neuroscience"));
  assert.ok(INTERESTS.includes("Botanical observation"));
});
