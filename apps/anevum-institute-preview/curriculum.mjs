// ANEVUM Open Institute: source-controlled and portable curriculum metadata.
// Preview content only. These records do not claim accredited courses, faculty, or completion.
export const CFP_101 = {
  schemaVersion:1,
  id:"CFP-101",
  title:"Computing From First Principles",
  school:"Computing and Artificial Intelligence (proposed)",
  version:"0.7.0",
  status:"preview",
  editorialStatus:"draft",
  delivery:"free-self-directed",
  accreditation:"none",
  description:"A proposed eight-unit path from transistor switching to a simulated 8-bit computer. Seven introductory lessons (including ideal registers, addressed memory, fictional four-bit assembly and deterministic single-core process scheduling), an ideal AND-gate laboratory and a half-adder workbench are implemented as previews; only the separate eight-bit capstone remains planned.",
  provenance:"Original ANEVUM educational draft. Independent subject-matter and accessibility review pending.",
  units:[
    {id:"CFP-101-U01",number:"01",title:"Semiconductors and transistor switching",availability:"preview",displayStatus:"Introductory lesson available",lessonPath:"/learn/cfp-101/transistor-switching",prerequisites:[]},
    {id:"CFP-101-U02",number:"02",title:"Binary logic and gates",availability:"preview",displayStatus:"Introductory lesson and laboratory available",lessonPath:"/learn/cfp-101/logic-gates",prerequisites:["CFP-101-U01"]},
    {id:"CFP-101-U03",number:"03",title:"Combinational circuits and adders",availability:"preview",displayStatus:"Introductory half-adder lesson and four-state workbench available",lessonPath:"/learn/cfp-101/half-adders",prerequisites:["CFP-101-U02"]},
    {id:"CFP-101-U04",number:"04",title:"Sequential circuits and registers",availability:"preview",displayStatus:"Introductory lesson and ideal four-bit register model available",lessonPath:"/learn/cfp-101/registers",prerequisites:["CFP-101-U03"]},
    {id:"CFP-101-U05",number:"05",title:"Memory and instruction architecture",availability:"preview",displayStatus:"Introductory addressed-memory lesson and ideal 4×4-bit model available; no ISA implemented",lessonPath:"/learn/cfp-101/addressed-memory",prerequisites:["CFP-101-U04"]},
    {id:"CFP-101-U06",number:"06",title:"Machine code and assembly",availability:"preview",displayStatus:"Fictional four-bit instruction assembly and disassembly available; no CPU or program execution",lessonPath:"/learn/cfp-101/assembly-code",prerequisites:["CFP-101-U05"]},
    {id:"CFP-101-U07",number:"07",title:"Computer systems and software",availability:"preview",displayStatus:"Original OS concepts lesson and ideal three-process round-robin workbench; no real kernel or applications executed",lessonPath:"/learn/cfp-101/computer-systems",prerequisites:["CFP-101-U06"]},
    {id:"CFP-101-U08",number:"08",title:"Simulated 8-bit computer capstone",availability:"planned",displayStatus:"Curriculum in development",lessonPath:null,prerequisites:["CFP-101-U07"]}
  ]
};

export function validateCurriculum(input){
  const errors=[];
  if(!input||typeof input!=="object"||Array.isArray(input))return ["Curriculum must be an object"];
  if(input.schemaVersion!==1)errors.push("Unsupported curriculum schema version");
  if(!/^[A-Z]{2,5}-[0-9]{3}$/.test(String(input.id||"")))errors.push("Invalid course ID");
  if(!/^\d+\.\d+\.\d+$/.test(String(input.version||"")))errors.push("Invalid course version");
  if(!["preview","draft","published","retired"].includes(input.status))errors.push("Invalid course status");
  if(!Array.isArray(input.units)||input.units.length===0||input.units.length>64)return [...errors,"Curriculum must have 1 to 64 units"];
  const seen=new Set(),paths=new Set();
  input.units.forEach((unit,index)=>{
    if(!unit||typeof unit!=="object"){errors.push("Invalid unit at "+index);return;}
    if(!/^([A-Z]{2,5}-[0-9]{3})-U[0-9]{2}$/.test(String(unit.id||""))||!String(unit.id||"").startsWith(input.id+"-U"))errors.push("Invalid unit ID at "+index);
    if(seen.has(unit.id))errors.push("Duplicate unit ID: "+unit.id);
    if(unit.number!==String(index+1).padStart(2,"0"))errors.push("Nonsequential unit number: "+unit.id);
    if(typeof unit.title!=="string"||unit.title.trim().length<5)errors.push("Missing unit title: "+unit.id);
    if(!["planned","preview","published","retired"].includes(unit.availability))errors.push("Invalid availability: "+unit.id);
    const hasLesson=typeof unit.lessonPath==="string"&&unit.lessonPath.length>0;
    if(["preview","published"].includes(unit.availability)!==hasLesson)errors.push("Lesson availability mismatch: "+unit.id);
    if(hasLesson){
      if(!/^\/learn\/[a-z0-9-]+\/[a-z0-9-]+$/.test(unit.lessonPath))errors.push("Invalid lesson path: "+unit.id);
      if(paths.has(unit.lessonPath))errors.push("Duplicate lesson path: "+unit.lessonPath);
      paths.add(unit.lessonPath);
    }else if(unit.lessonPath!==null)errors.push("Planned/retired lesson path must be null: "+unit.id);
    if(!Array.isArray(unit.prerequisites)||unit.prerequisites.some(pre=>!seen.has(pre)||pre===unit.id))errors.push("Prerequisites must name earlier units: "+unit.id);
    seen.add(unit.id);
  });
  return errors;
}

const errors=validateCurriculum(CFP_101);
if(errors.length)throw new Error("Invalid CFP-101 curriculum: "+errors.join("; "));
