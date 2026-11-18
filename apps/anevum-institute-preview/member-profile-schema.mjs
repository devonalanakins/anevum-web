// Device-local, unverified profile preview. This is NOT a registered user account.
export const MEMBER_PROFILE_FORMAT="anevum-local-profile/v1";
export const MEMBER_PROFILE_KEY="anevum.institute.member-profile.v1";
export const MEMBER_PROFILE_MAX_BYTES=16384;
export const MEMBER_FOCI=Object.freeze(["Computing","Mathematics","Physics","Neuroscience","Engineering"]);
export const MEMBER_THEMES=Object.freeze(["mineral","copper","sage"]);
const FIELDS=Object.freeze(["schemaVersion","kind","displayName","handle","focus","about","theme"]);
export function normalizeMemberProfile(value){
  if(!value||typeof value!=="object"||Array.isArray(value))throw new TypeError("Profile must be an object");
  return {
    schemaVersion:1,
    kind:"device-local-unverified-profile",
    displayName:typeof value.displayName==="string"?value.displayName.trim():"",
    handle:typeof value.handle==="string"?value.handle.trim().toLowerCase():"",
    focus:value.focus,
    about:typeof value.about==="string"?value.about.trim():"",
    theme:value.theme
  };
}
export function validateMemberProfile(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return ["Expected a profile object"];
  const errors=[];
  for(const key of Object.keys(value))if(!FIELDS.includes(key))errors.push("Unexpected field: "+key);
  for(const key of FIELDS)if(!Object.hasOwn(value,key))errors.push("Missing field: "+key);
  if(value.schemaVersion!==1||value.kind!=="device-local-unverified-profile")errors.push("Only unverified local profile drafts are accepted");
  if(typeof value.displayName!=="string"||value.displayName.trim().length<2||value.displayName.length>48||/[\u0000-\u001f<>]/.test(value.displayName||""))errors.push("Display name must be 2–48 safe characters");
  if(typeof value.handle!=="string"||!/^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])$/.test(value.handle||""))errors.push("Local handle must be 3–24 lowercase letters, digits or hyphens");
  if(!MEMBER_FOCI.includes(value.focus))errors.push("Choose a supported field of study");
  if(typeof value.about!=="string"||value.about.length>360||/[\u0000-\u001f]/.test(value.about||""))errors.push("Introduction must be 360 characters or fewer without control characters");
  if(!MEMBER_THEMES.includes(value.theme))errors.push("Choose a supported profile theme");
  return errors;
}
export function canonicalMemberProfile(value){
  const errors=validateMemberProfile(value);
  if(errors.length)throw new Error(errors.join("; "));
  const result=normalizeMemberProfile(value);
  if(JSON.stringify(result)!==JSON.stringify(value))throw new Error("Profile fields must use canonical order and trimmed values");
  return result;
}
export function makeMemberProfileExport(value){
  return {format:MEMBER_PROFILE_FORMAT,record:canonicalMemberProfile(value)};
}
export function readMemberProfileExport(input){
  const source=typeof input==="string"?JSON.parse(input):input;
  if(!source||typeof source!=="object"||Array.isArray(source))throw new Error("Invalid profile export");
  if(Object.keys(source).sort().join(",")!=="format,record")throw new Error("Unexpected profile export fields");
  if(source.format!==MEMBER_PROFILE_FORMAT)throw new Error("Unsupported profile export version");
  return makeMemberProfileExport(source.record);
}
// The browser and Node tests evaluate the same validation functions. No profile data leaves the device.
export const MEMBER_PROFILE_BROWSER_MODULE=[
  "const MEMBER_PROFILE_FORMAT="+JSON.stringify(MEMBER_PROFILE_FORMAT)+";",
  "const MEMBER_PROFILE_KEY="+JSON.stringify(MEMBER_PROFILE_KEY)+";",
  "const MEMBER_PROFILE_MAX_BYTES="+MEMBER_PROFILE_MAX_BYTES+";",
  "const MEMBER_FOCI="+JSON.stringify(MEMBER_FOCI)+";",
  "const MEMBER_THEMES="+JSON.stringify(MEMBER_THEMES)+";",
  "const FIELDS="+JSON.stringify(FIELDS)+";",
  normalizeMemberProfile.toString(),validateMemberProfile.toString(),
  canonicalMemberProfile.toString(),makeMemberProfileExport.toString(),
  readMemberProfileExport.toString(),
  "export {MEMBER_PROFILE_FORMAT,MEMBER_PROFILE_KEY,MEMBER_PROFILE_MAX_BYTES,MEMBER_FOCI,MEMBER_THEMES,normalizeMemberProfile,validateMemberProfile,canonicalMemberProfile,makeMemberProfileExport,readMemberProfileExport};"
].join("\n")+"\n";
