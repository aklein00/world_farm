// Portable recipe state. No provider credentials, repository access or paid calls.
export const SCHEMA = 1;
export const TYPES = ['Bakery', 'Shop', 'Townhouse', 'Workshop'];
export const SLOTS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
export const clone = value => structuredClone(value);
export const id = () => crypto.randomUUID();
export const defaultStyle = () => ({version: 1, marketStyle: '04C', trimWeight: 60, softness: 35, windowFamily: 'Inset rectangular', roofTreatment: 'Modest overhang', palette: {walls: '#e3a893', trim: '#ffe4d0', roof: '#df907e', glass: '#536b7c'}});
export const defaultBrief = () => ({type: 'Bakery', description: 'Two-storey bakery, broad shopfront, striped awning', footprint: '2x2', floors: 2, awning: true});
export function freshProject() {
  return {format: 'worldfarm-project', schemaVersion: SCHEMA, name: 'Harbor Village', currentVersion: 0, styles: [], styleDraft: defaultStyle(), brief: defaultBrief(), candidates: [], candidateIndex: 0, draft: null, buildings: [], block: {name: 'Harbor Square', instances: []}, revision: null, step: 1, generationRound: 0};
}
export function currentStyle(p) { return p.styles.find(s => s.version === p.currentVersion) ?? p.styleDraft; }
export function styleFor(p, b) { return p.styles.find(s => s.version === b.styleVersion) ?? currentStyle(p); }
export function saveInitialStyle(p) {
  if (p.currentVersion) throw new Error('Use a style revision to change a saved family.');
  p.styles.push({...clone(p.styleDraft), version: 1}); p.currentVersion = 1;
}
export function candidatesFor(brief, version, round = 0) {
  if (!TYPES.includes(brief.type)) throw new Error('Choose a supported shop, townhouse or workshop.');
  return ['Centered entrance', 'Offset entrance', 'Narrow shopfront'].map((layout, i) => ({
    id: id(), name: brief.type === 'Bakery' ? 'Harbor Bakery' : brief.type === 'Workshop' ? 'Repair workshop' : brief.type,
    type: brief.type, styleVersion: version, baseline: {seed: 1000 + round * 3 + i, layout: ['Centered entrance', 'Offset entrance', 'Narrow shopfront'][(i + round) % 3], variant: (i + round) % 3, description: brief.description, footprint: brief.footprint, floors: Number(brief.floors), awning: brief.awning},
    parameters: {floors: Number(brief.floors), width: 1, windowWidth: 1.1, frameThickness: .1, doorWidth: 1, roofPitch: brief.type === 'Townhouse' ? 30 : 0, overhang: .15},
    overrides: {}, pinned: {Windows: true, Doors: true, Roof: true, Building: true}, collection: 'Family buildings', source: 'mock-kit'
  }));
}
export const ROLE_KEYS = {Building: ['floors', 'width'], Windows: ['windowWidth', 'frameThickness'], Doors: ['doorWidth'], Roof: ['roofPitch', 'overhang']};
export function effective(b, style) {
  return {...b.parameters, frameThickness: .04 + style.trimWeight / 1000, overhang: style.roofTreatment === 'Broad cornice' ? .25 : .15, ...b.overrides};
}
export function saveBuilding(p) {
  if (!p.draft || !p.draft.name.trim()) throw new Error('Give your building a name.');
  const b = clone(p.draft), existing = p.buildings.findIndex(x => x.id === b.id);
  b.name = b.name.trim(); b.collection = b.collection.trim() || `${p.name} buildings`;
  if (existing < 0) p.buildings.push(b); else p.buildings[existing] = b;
  p.draft = null; p.candidates = []; return b;
}
export function beginRevision(p) { p.revision = {style: {...clone(currentStyle(p)), version: p.currentVersion + 1}, selected: p.buildings.map(b => b.id)}; }
export function revisedBuilding(b) {
  const next = clone(b);
  for (const [role, keys] of Object.entries(ROLE_KEYS)) if (!b.pinned[role]) for (const key of keys) delete next.overrides[key];
  return next;
}
export function applyRevision(p) {
  if (!p.revision?.selected.length) throw new Error('Select at least one building to update.');
  const revision = clone(p.revision), version = p.currentVersion + 1;
  p.styles.push({...revision.style, version}); p.currentVersion = version;
  p.buildings = p.buildings.map(b => revision.selected.includes(b.id) ? {...revisedBuilding(b), styleVersion: version} : b);
  p.revision = null; return revision.selected.length;
}
export function place(p, placement) {
  if (!SLOTS.includes(placement.slot)) throw new Error('Choose a plot inside the block.');
  if (!p.buildings.some(b => b.id === placement.buildingId)) throw new Error('Save the building first.');
  if (p.block.instances.some(i => i.slot === placement.slot && i.id !== placement.id)) throw new Error('That plot is occupied. Choose a free plot or cancel this placement.');
  const existing = p.block.instances.findIndex(i => i.id === placement.id);
  if (existing < 0) p.block.instances.push(clone(placement)); else p.block.instances[existing] = clone(placement);
}
export function projectFile(p) { return JSON.stringify({...clone(p), exportedAt: new Date().toISOString()}, null, 2); }

// Validate every imported field used in rendering, navigation and relationship lookups.
// Reconstruct allowed objects so untrusted keys never enter application state.
export function parseProject(text) {
  if (text.length > 2_000_000) throw new Error('Project files must be smaller than 2 MB.');
  let raw; try { raw = JSON.parse(text); } catch { throw new Error('This is not a valid JSON project.'); }
  const fail = () => { throw new Error('This file is not a supported World Farm project. Your current work is unchanged.'); };
  const obj = x => x && typeof x === 'object' && !Array.isArray(x);
  const str = (x, n=160) => typeof x === 'string' && x.length <= n ? x : fail();
  const num = (x, lo, hi, integer=false) => Number.isFinite(x) && x >= lo && x <= hi && (!integer || Number.isInteger(x)) ? x : fail();
  const list = (x, max) => Array.isArray(x) && x.length <= max ? x : fail();
  const choice = (x, choices) => choices.includes(x) ? x : fail();
  const bool = x => typeof x === 'boolean' ? x : fail();
  const uid = x => typeof x === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(x) ? x : fail();
  const style = x => {
    if (!obj(x) || !obj(x.palette)) return fail();
    const palette = {}; for (const k of ['walls','trim','roof','glass']) palette[k] = /^#[0-9a-f]{6}$/i.test(x.palette[k]) ? x.palette[k] : fail();
    return {version:num(x.version,1,10000,true),...(x.name!==undefined?{name:str(x.name,80)}:{}),marketStyle:choice(x.marketStyle??'04C',['04C','04D','03B','03A','01D','02D']),trimWeight:num(x.trimWeight,0,100),softness:num(x.softness,0,100),windowFamily:choice(x.windowFamily,['Inset rectangular','Divided panes']),roofTreatment:choice(x.roofTreatment,['Modest overhang','Broad cornice']),palette};
  };
  const bounds = {floors:[1,3],width:[.8,1.1],windowWidth:[.8,1.4],frameThickness:[.06,.16],doorWidth:[.8,1.3],roofPitch:[0,45],overhang:[.05,.3]};
  const params = (x, partial=false) => { if (!obj(x)) return fail(); const result={}; for(const [k,[lo,hi]] of Object.entries(bounds)) if(!partial || k in x) result[k]=num(x[k],lo,hi,k==='floors'); return result; };
  const building = b => {
    if(!obj(b)||!obj(b.baseline)||!obj(b.pinned))return fail();
    const a=b.baseline,pinned={};for(const k of Object.keys(ROLE_KEYS)) pinned[k]=bool(b.pinned[k]);
    return {id:uid(b.id),name:str(b.name),type:choice(b.type,TYPES),styleVersion:num(b.styleVersion,1,10000,true),baseline:{seed:num(a.seed,0,1e9,true),layout:str(a.layout),variant:num(a.variant,0,2,true),description:str(a.description,2000),footprint:choice(a.footprint,['1x2','2x2','3x2']),floors:num(a.floors,1,3,true),awning:bool(a.awning)},parameters:params(b.parameters),overrides:params(b.overrides,true),pinned,collection:str(b.collection),source:choice(b.source,['mock-kit'])};
  };
  if (!obj(raw)||raw.format!=='worldfarm-project'||raw.schemaVersion!==SCHEMA) return fail();
  const p=freshProject();p.name=str(raw.name);if(!p.name.trim())return fail();
  p.styles=list(raw.styles,100).map(style);p.styleDraft=style(raw.styleDraft);p.currentVersion=num(raw.currentVersion,0,10000,true);
  const versions=p.styles.map(s=>s.version);if(new Set(versions).size!==versions.length||(p.currentVersion&&!versions.includes(p.currentVersion))||versions.some(v=>v>p.currentVersion))return fail();
  if(!obj(raw.brief))return fail();const q=raw.brief;
  p.brief={type:choice(q.type,TYPES),description:str(q.description,2000),footprint:choice(q.footprint,['1x2','2x2','3x2']),floors:num(q.floors,1,3,true),awning:bool(q.awning)};
  p.buildings=list(raw.buildings,100).map(building);p.candidates=list(raw.candidates,3).map(building);p.draft=raw.draft===null?null:building(raw.draft);
  const ids=p.buildings.map(b=>b.id);if(new Set(ids).size!==ids.length)return fail();
  for(const b of [...p.buildings,...p.candidates,...(p.draft?[p.draft]:[])])if(!versions.includes(b.styleVersion))return fail();
  if(!obj(raw.block))return fail();p.block.name=str(raw.block.name);p.block.instances=[];
  for(const i of list(raw.block.instances,6)){if(!obj(i))return fail();const next={id:uid(i.id),buildingId:uid(i.buildingId),slot:choice(i.slot,SLOTS),rotation:choice(i.rotation,[0,90,180,270])};if(p.block.instances.some(x=>x.id===next.id))return fail();try{place(p,next);}catch{return fail();}}
  p.candidateIndex=num(raw.candidateIndex,0,2,true);p.step=num(raw.step,1,12,true);p.generationRound=num(raw.generationRound,0,100000,true);
  if(raw.revision!==null){if(!obj(raw.revision))return fail();p.revision={style:style(raw.revision.style),selected:list(raw.revision.selected,100).map(uid)};if(p.revision.selected.some(i=>!ids.includes(i)))return fail();}
  if(p.step>=3&&!p.currentVersion)p.step=1;
  if(p.step===4&&!p.candidates.length)p.step=3;
  if([5,6].includes(p.step)&&!p.draft)p.step=7;
  if([10,11].includes(p.step)&&!p.revision)p.step=7;
  if([8,9,10,11,12].includes(p.step)&&!p.buildings.length)p.step=7;
  if(p.step===9&&!p.block.instances.length)p.step=8;
  return p;
}
