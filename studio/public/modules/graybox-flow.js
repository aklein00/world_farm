// Pure state and prompt logic. This prototype uses explicit controls, not an AI service.
export const STEPS=['start','brief','prompt','sample','building','edit','world','terrain','swap','review','saved','library'];
export const initialState=()=>({format:'worldfarm-graybox',version:1,step:'start',style:{name:'New style',theme:'Sci-fi',proportions:'compact',shape:'stepped',detail:'light',palette:{walls:'#dae4e4',roof:'#366c78',trim:'#e6a563',glass:'#426e82',accent:'#248d91'}},blurb:'',moods:['Grounded'],sampleType:'House',approvedPrompt:null,approvedStyle:null,brief:{type:'House',floors:2,width:4,depth:4,variant:0},buildingBlurb:'',assets:[],objects:[],elevations:{},selected:'A1',terrainDraft:null,swapId:null,sampleVariant:0});
export function organizedPrompt(s){return [
['Purpose',`Create one ${s.sampleType.toLowerCase()} as a style stub for quick game-world prototyping, not a finished asset.`],
['Direction',`${s.style.theme}; ${s.moods.join(', ').toLowerCase()}. ${s.blurb.trim()||'Use the selected broad theme.'}`],
['Visual recipe',`${s.style.proportions} proportions; ${s.style.shape} shapes; ${s.style.detail} detail; palette ${Object.values(s.style.palette).join(', ')}.`],
['Locked geometry','Grid-aligned chunky cubes, cuboids and slabs only. Stepped silhouettes, simplified openings, solid colors. No textures, smooth curves, fine detail or floating parts.'],
['Output','One editable cube recipe with named parts. Review the silhouette and palette before saving the style.'],
['Current generation','Local procedural recipes use the selected fields. The short blurb and mood are retained as direction notes, not interpreted by AI. No provider calls or credits.']];}
export function approvePrompt(s){s.approvedPrompt=JSON.stringify(organizedPrompt(s));s.step='sample';}
export function isPromptCurrent(s){return s.approvedPrompt===JSON.stringify(organizedPrompt(s));}
export function approveStyle(s){if(!isPromptCurrent(s))throw Error('Review and approve the updated prompt first.');s.approvedStyle=structuredClone(s.style);s.step='building';}
const THEMES=['Sci-fi','Organic','Medieval','Roman','Desert','Industrial','Coastal','Terraced','Winter'];
const TYPES=['Building','House','Shop','Townhouse','Workshop','Bakery','Temple','Hall','Tower','Tree','Planter','Bench','Decoration'];
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v,max=160)=>typeof v==='string'&&v.length<=max;
const identifier=v=>text(v,100)&&v.length>0;
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
function validStyle(v){return record(v)&&text(v.name||'',80)&&THEMES.includes(v.theme)&&['compact','wide','tall'].includes(v.proportions)&&['horizontal','vertical','stepped'].includes(v.shape)&&['light','balanced','bold'].includes(v.detail)&&record(v.palette)&&['walls','roof','trim','glass','accent'].every(k=>typeof v.palette[k]==='string'&&/^#[0-9a-f]{6}$/i.test(v.palette[k]));}
function validBrief(v){return record(v)&&TYPES.includes(v.type)&&integer(v.floors,1,4)&&integer(v.width,2,7)&&integer(v.depth,2,7)&&integer(v.variant,0,2);}
function validHeights(v){return record(v)&&Object.entries(v).every(([slot,n])=>/^[A-D][1-4]$/.test(slot)&&integer(n,0,4));}
export function validateProject(p){
 const fail=message=>{throw Error(message);};
 if(!record(p)||p.format!=='worldfarm-graybox'||p.version!==1||!STEPS.includes(p.step)||!Array.isArray(p.assets)||p.assets.length>200||!Array.isArray(p.objects)||p.objects.length>16)fail('Choose a valid World Farm graybox project.');
 if(!validStyle(p.style)||(p.approvedStyle!==null&&!validStyle(p.approvedStyle)))fail('Invalid style recipe or palette.');
 if(!Array.isArray(p.moods)||p.moods.length>2||!p.moods.every(m=>['Grounded','Layered','Quiet','Bold','Playful','Elegant'].includes(m))||new Set(p.moods).size!==p.moods.length||!text(p.blurb)||!text(p.buildingBlurb)||!TYPES.includes(p.sampleType)||!integer(p.sampleVariant,0,2)||!validBrief(p.brief))fail('Invalid style or building brief.');
 if(p.approvedPrompt!==null&&!text(p.approvedPrompt,5000))fail('Invalid prompt approval.');
 if(!p.assets.every(a=>record(a)&&identifier(a.id)&&text(a.name,80)&&validStyle(a.style)&&validBrief(a.brief)&&text(a.description)&&a.source==='procedural-cubes')||new Set(p.assets.map(a=>a.id)).size!==p.assets.length)fail('Invalid saved asset.');
 if(!p.objects.every(o=>record(o)&&identifier(o.id)&&/^[A-D][1-4]$/.test(o.slot)&&p.assets.some(a=>a.id===o.assetId)&&[0,90,180,270].includes(o.rotation))||new Set(p.objects.map(o=>o.slot)).size!==p.objects.length||new Set(p.objects.map(o=>o.id)).size!==p.objects.length)fail('Invalid object placement.');
 if(!/^[A-D][1-4]$/.test(p.selected)||!validHeights(p.elevations)||(p.terrainDraft!==null&&!validHeights(p.terrainDraft)))fail('Invalid plot height or selection.');
 if(p.swapId!==null&&!p.assets.some(a=>a.id===p.swapId))fail('Invalid replacement asset.');
 if(p.assetName!==undefined&&!text(p.assetName,80))fail('Invalid asset name.');
 if(p.placeId!==undefined&&!p.assets.some(a=>a.id===p.placeId))fail('Invalid placement asset.');
 if(['building','edit'].includes(p.step)&&!p.approvedStyle)fail('This step requires an approved style.');
 if(p.step==='terrain'&&!p.terrainDraft)fail('Terrain preview is missing.');
 if(p.step==='swap'&&!p.objects.some(o=>o.slot===p.selected))fail('Replacement requires an occupied plot.');
 return structuredClone(p);
}
export function placeAsset(s,id){const asset=s.assets.find(a=>a.id===id);if(!asset)throw Error('Choose a saved asset.');if(s.objects.some(o=>o.slot===s.selected))throw Error('This plot is occupied. Use Swap to replace it.');s.objects.push({id:crypto.randomUUID(),assetId:id,slot:s.selected,rotation:0});}
export function swapAsset(s,id){const o=s.objects.find(o=>o.slot===s.selected);if(!o||!s.assets.some(a=>a.id===id))throw Error('Choose an occupied plot and a saved replacement.');o.assetId=id;s.swapId=null;}
