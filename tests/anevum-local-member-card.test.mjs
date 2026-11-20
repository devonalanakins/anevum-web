import test from "node:test";
import assert from "node:assert/strict";
import {
  LOCAL_MEMBER_BROWSER_MODULE,LOCAL_MEMBER_FORMAT,LOCAL_MEMBER_KEY,INTERESTS,
  blankMemberCard,validateMemberCard,normalizeMemberCard,parseMemberCard,exportMemberCard
} from "../apps/anevum-institute-preview/local-member-schema.mjs";
import {LOCAL_MEMBER_CLIENT} from "../apps/anevum-institute-preview/local-member-client.mjs";

test("private learner card is versioned, valid, and portable without account or awards",()=>{
  const card=blankMemberCard();
  assert.deepEqual(validateMemberCard(card),[]);
  assert.match(LOCAL_MEMBER_KEY,/^anevum\.institute\./);
  assert.equal(card.version,1);
  assert.equal(LOCAL_MEMBER_FORMAT,"anevum-local-member-card/v1");
  const file=exportMemberCard({...card,displayName:"Researcher A",interests:["Physics","Computing"]});
  const parsed=parseMemberCard(file);
  assert.equal(parsed.displayName,"Researcher A");
  assert.deepEqual(parsed.interests,["Physics","Computing"]);
  assert.deepEqual(Object.keys(JSON.parse(file)).sort(),["format","profile"]);
  assert.ok(!("userId" in parsed)&&!("award" in parsed)&&!("isVerified" in parsed));
});

test("browser schema and Node schema accept identical private learner cards",async()=>{
  const browser=await import("data:text/javascript;charset=utf-8,"+encodeURIComponent(LOCAL_MEMBER_BROWSER_MODULE));
  const card={version:1,displayName:"Experimental systems",tagline:"Measuring assumptions",interests:["Mathematics","Neuroscience"]};
  assert.equal(browser.exportMemberCard(card),exportMemberCard(card));
  assert.deepEqual(browser.parseMemberCard(exportMemberCard(card)),parseMemberCard(exportMemberCard(card)));
  assert.deepEqual(browser.INTERESTS,INTERESTS);
  assert.equal(browser.LOCAL_MEMBER_KEY,LOCAL_MEMBER_KEY);
});

test("untrusted uploads cannot forge accounts, roles, recognition or invalid interests",()=>{
  const good=blankMemberCard();
  const forged=[
    {...good,role:"institutional-reviewer"},
    {...good,isVerified:true},
    {...good,award:"ANEVUM Scientific Fellow"},
    {...good,memberId:"other-member"},
    {...good,interests:["Physics","Physics"]},
    {...good,interests:["Physics","not a published discipline"]},
    {...good,interests:INTERESTS.slice(0,6)},
    {...good,displayName:"X"},
    {...good,tagline:"x".repeat(181)},
    {...good,displayName:"Mismatched\nuser"}
  ];
  for(const card of forged){
    assert.ok(validateMemberCard(card).length>0,JSON.stringify(card).slice(0,120));
    assert.throws(()=>parseMemberCard(JSON.stringify({format:LOCAL_MEMBER_FORMAT,profile:card})));
  }
  assert.throws(()=>parseMemberCard(JSON.stringify({format:LOCAL_MEMBER_FORMAT,profile:good,issuer:"ANEVUM"})),/Unsupported member-card export/);
  assert.throws(()=>parseMemberCard(JSON.stringify({format:"official-credential/v1",profile:good})),/Unsupported member-card format/);
  assert.throws(()=>parseMemberCard("x".repeat(4097)),/4 KiB/);
  assert.throws(()=>parseMemberCard("not json"));
  assert.throws(()=>normalizeMemberCard(null));
});

test("browser code renders user-defined identity as text and makes no external or privileged writes",()=>{
  assert.match(LOCAL_MEMBER_CLIENT,/\.textContent\s*=/);
  assert.match(LOCAL_MEMBER_CLIENT,/replaceChildren\(\)/);
  assert.match(LOCAL_MEMBER_CLIENT,/localStorage\.setItem/);
  assert.match(LOCAL_MEMBER_CLIENT,/localStorage\.removeItem/);
  assert.match(LOCAL_MEMBER_CLIENT,/data-member-delete/);
  assert.match(LOCAL_MEMBER_CLIENT,/Confirm card deletion/);
  assert.match(LOCAL_MEMBER_CLIENT,/Browser storage|device|private/);
  assert.doesNotMatch(LOCAL_MEMBER_CLIENT,/innerHTML\s*=|insertAdjacentHTML|fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/);
  assert.doesNotMatch(LOCAL_MEMBER_CLIENT,/\/api\/(?:member|command)\/|signIn|signOut|issueAward|issueCredential/i);
});
