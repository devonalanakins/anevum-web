// Portable, private, device-only learner card. This is NOT an account, an ANEVUM award,
// a public member handle, or a server-authoritative user record.
export const LOCAL_MEMBER_FORMAT="anevum-local-member-card/v1";
export const LOCAL_MEMBER_KEY="anevum.institute.member-card.v1";
export const INTERESTS=Object.freeze([
  "Computing","Artificial intelligence","Mathematics","Physics",
  "Neuroscience","Scientific methods","Engineering","Botanical observation"
]);
const FIELDS=["version","displayName","tagline","interests"];
export function blankMemberCard(){
  return {version:1,displayName:"Independent learner",tagline:"Exploring questions through experiments and evidence.",interests:["Computing"]};
}
export function validateMemberCard(value){
  const errors=[];
  if(!value||typeof value!=="object"||Array.isArray(value))return ["Member card must be a record"];
  if(Object.keys(value).sort().join(",")!==FIELDS.slice().sort().join(","))errors.push("Unrecognized, missing, or protected member-card fields");
  if(value.version!==1)errors.push("Unsupported member-card version");
  for(const [key,min,max] of [["displayName",2,60],["tagline",0,180]]){
    const field=value[key];
    if(typeof field!=="string"||field.length<min||field.length>max||field!==field?.trim()||/[\\u0000-\\u001f\\u007f]/.test(field||""))errors.push(key+" must be "+min+"-"+max+" characters without control characters");
  }
  if(!Array.isArray(value.interests)||value.interests.length>5||new Set(value.interests).size!==value.interests.length||value.interests.some(x=>!INTERESTS.includes(x)))errors.push("Choose up to five supported research interests");
  return errors;
}
export function normalizeMemberCard(input){
  if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("Member card must be an object");
  const result={version:1,displayName:typeof input.displayName==="string"?input.displayName.trim():"",tagline:typeof input.tagline==="string"?input.tagline.trim():"",interests:Array.isArray(input.interests)?input.interests.slice():[]};
  const errors=validateMemberCard(result);
  if(errors.length)throw new Error(errors.join("; "));
  return result;
}
export function parseMemberCard(source){
  if(typeof source==="string"&&source.length>4096)throw new Error("Member card exceeds 4 KiB import limit");
  const obj=typeof source==="string"?JSON.parse(source):source;
  if(!obj||typeof obj!=="object"||Array.isArray(obj)||Object.keys(obj).sort().join(",")!=="format,profile")throw new Error("Unsupported member-card export");
  if(obj.format!==LOCAL_MEMBER_FORMAT)throw new Error("Unsupported member-card format");
  const problems=validateMemberCard(obj.profile);
  if(problems.length)throw new Error(problems.join("; "));
  return normalizeMemberCard(obj.profile);
}
export function exportMemberCard(input){
  return JSON.stringify({format:LOCAL_MEMBER_FORMAT,profile:normalizeMemberCard(input)},null,2)+"\\n";
}
export const LOCAL_MEMBER_BROWSER_MODULE=[
  "const LOCAL_MEMBER_FORMAT="+JSON.stringify(LOCAL_MEMBER_FORMAT)+";",
  "const LOCAL_MEMBER_KEY="+JSON.stringify(LOCAL_MEMBER_KEY)+";",
  "const INTERESTS="+JSON.stringify(INTERESTS)+";",
  "const FIELDS="+JSON.stringify(FIELDS)+";",
  blankMemberCard.toString(),validateMemberCard.toString(),normalizeMemberCard.toString(),
  parseMemberCard.toString(),exportMemberCard.toString(),
  "export {LOCAL_MEMBER_FORMAT,LOCAL_MEMBER_KEY,INTERESTS,blankMemberCard,validateMemberCard,normalizeMemberCard,parseMemberCard,exportMemberCard};"
].join("\\n")+"\\n";
