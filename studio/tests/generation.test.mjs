import test from 'node:test';
import assert from 'node:assert/strict';
import {GENERATOR,interpretBrief,generateCandidates} from '../public/modules/generation.js';
import {defaultBrief,freshProject,saveInitialStyle,saveBuilding,parseProject,projectFile,clone,beginRevision,applyRevision,place,effective,sampleCandidatesFor} from '../public/modules/model.js';
import {buildingParts,buildBuilding,MARKET_STYLES} from '../public/modules/architecture.js';
import {modelDocument,modelGLB} from '../public/modules/export.js';
import * as THREE from '../public/vendor/three/three.module.js';
const brief=(description,extra={})=>({...defaultBrief(),description,...extra});
const family=()=>{const p=freshProject();saveInitialStyle(p);return p;};
const fingerprint=b=>({baseline:b.baseline,parameters:b.parameters});

test('supported description details compile into bounded editable recipes, not canned variants',()=>{
  const input=brief('Broad shopfront, entrance on the left, three windows per floor, wide windows, 35 degree pitched roof, solid awning');
  const before=clone(input),candidates=generateCandidates(input,4,2);
  assert.deepEqual(input,before);assert.equal(candidates.length,3);assert.equal(new Set(candidates.map(b=>b.id)).size,3);
  for(const b of candidates){assert.equal(b.source,GENERATOR);assert.equal(b.styleVersion,4);assert.equal(b.parameters.entranceOffset,-.14);assert.equal(b.parameters.width,1.08);assert.equal(b.parameters.facadeBays,3);assert.equal(b.parameters.windowWidth,1.35);assert.equal(b.parameters.roofPitch,35);assert.equal(b.parameters.awningStripe,0);assert.equal(b.baseline.generation.engine,GENERATOR);}
  const narrow=generateCandidates(brief('Narrow shopfront, entrance on the right, two windows per floor, flat roof'),4,2)[0];
  assert.notDeepEqual(narrow.parameters,candidates[0].parameters);
  const p=family(),leftParts=buildingParts(candidates[0],p.styles[0]).parts,rightParts=buildingParts(narrow,p.styles[0]).parts;
  assert.ok(leftParts.find(x=>x.name==='Entrance pane').p[0]<0);assert.ok(rightParts.find(x=>x.name==='Entrance pane').p[0]>0);
  assert.equal(leftParts.filter(x=>/^Upper floor 2 window \d pane$/.test(x.name)).length,3);
  assert.equal(rightParts.filter(x=>/^Upper floor 2 window \d pane$/.test(x.name)).length,2);
  assert.ok(leftParts.some(x=>x.name==='Pitched roof'));assert.ok(!rightParts.some(x=>x.type==='hip'));
  assert.ok(leftParts.filter(x=>/awning/i.test(x.name)).every(x=>x.mat==='accent'));
});

test('the same brief and round reproduce geometry; regeneration varies only unconstrained details',()=>{
  const input=brief('entrance on the right, pitched roof, solid awning');
  const first=generateCandidates(input,1,0),again=generateCandidates(input,1,0),next=generateCandidates(input,1,1);
  assert.deepEqual(first.map(fingerprint),again.map(fingerprint));assert.notDeepEqual(first.map(b=>b.id),again.map(b=>b.id));
  assert.notDeepEqual(first.map(b=>b.parameters),next.map(b=>b.parameters));
  for(const b of [...first,...next]){assert.equal(b.parameters.entranceOffset,.14);assert.equal(b.parameters.roofPitch,30);assert.equal(b.parameters.awningStripe,0);assert.equal(b.parameters.floors,2);assert.equal(b.baseline.footprint,'2x2');}
  assert.equal(new Set(first.map(b=>JSON.stringify(b.parameters))).size,3);
  assert.deepEqual(generateCandidates(brief('cozy blue brick'),1).map(b=>b.parameters),generateCandidates(brief('warm terracotta'),1).map(b=>b.parameters),'Uninterpreted prose must not change geometry');
  const fixed=generateCandidates(brief('wide frontage, left entrance, three windows per floor, wide windows, wide entrance, flat roof, solid awning'),1);assert.equal(new Set(fixed.map(b=>JSON.stringify(b.parameters))).size,3);
});

test('controls win over prose with explicit warnings and unsupported requests offer alternatives',()=>{
  const r=interpretBrief(brief('Three-storey workshop, no awning, 3 x 2 plots, cozy blue brick'));
  assert.ok(r.warnings.some(x=>/Height control wins/.test(x)));assert.ok(r.warnings.some(x=>/Footprint control wins/.test(x)));assert.ok(r.warnings.some(x=>/Building type control wins/.test(x)));assert.ok(r.warnings.some(x=>/Awning checkbox wins/.test(x)));assert.ok(r.warnings.some(x=>/Unlisted prose/.test(x)));
  const b=generateCandidates(brief('cozy blue brick'),1)[0];assert.equal(b.parameters.floors,2);assert.equal(b.baseline.footprint,'2x2');assert.ok(b.baseline.generation.warnings.some(x=>/No supported layout/.test(x)));
  for(const description of ['floating castle','skyscraper','six windows per floor','60 degree roof','left entrance and right entrance','wide windows and narrow windows','flat roof and pitched roof','no windows','two windows and three windows'])assert.throws(()=>generateCandidates(brief(description),1),undefined,description);
  assert.throws(()=>generateCandidates(brief('ok',{floors:99}),1),/1–3/);assert.throws(()=>generateCandidates(brief('x'.repeat(2001)),1),/2,000/);
  assert.throws(()=>generateCandidates(brief('ok'),1,Infinity));assert.throws(()=>generateCandidates(brief('ok'),0));
});

test('all styles and supported envelopes yield finite bounded geometry and non-overlapping front openings',()=>{
  const p=family();
  for(const preset of MARKET_STYLES)for(const type of ['Bakery','Shop','Townhouse','Workshop'])for(const floors of [1,2,3])for(const footprint of ['1x2','2x2','3x2']){
    const s={...p.styles[0],marketStyle:preset.id,palette:preset.palette};
    const b=generateCandidates(brief('wide windows, wide entrance, entrance on the right, four windows per floor, 45 degree roof',{type,floors,footprint}),1)[0];
    b.overrides={width:1.1,depth:1.05,frameThickness:.16,entranceOffset:.16,windowWidth:1.4,doorWidth:1.3,overhang:.3};
    const kit=buildingParts(b,s);
    for(const part of kit.parts){assert.ok(part.p.every(Number.isFinite),part.name);assert.ok(part.s.every(n=>Number.isFinite(n)&&n>0),part.name);}
    const windows=kit.parts.filter(x=>/^Upper floor 2 window \d surround$/.test(x.name)).sort((a,b)=>a.p[0]-b.p[0]);
    for(let i=1;i<windows.length;i++)assert.ok(windows[i-1].p[0]+windows[i-1].s[0]/2<windows[i].p[0]-windows[i].s[0]/2,'upper openings overlap');
    const entrance=kit.parts.find(x=>/^(Entrance|Workshop shutter) surround$/.test(x.name));
    for(const display of kit.parts.filter(x=>/^(Shop display|Ground window) \d surround$/.test(x.name)))assert.ok(Math.abs(display.p[0]-entrance.p[0])>(display.s[0]+entrance.s[0])/2,'ground openings overlap');
    const model=buildBuilding(b,s),bounds=new THREE.Box3().setFromObject(model);
    assert.ok(bounds.min.x>-5&&bounds.max.x<5,`${preset.id} ${type} ${footprint}: plot width`);assert.ok(bounds.min.z>-5&&bounds.max.z<5,'plot depth');assert.ok(bounds.min.y>=-.001,'above ground');
    model.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
  }
});

test('new piece controls affect geometry and pinned edits survive revisions, save and reopen',()=>{
  const p=family();p.draft=generateCandidates(brief('three windows per floor, striped awning'),1)[0];saveBuilding(p);
  const saved=clone(p.buildings[0]);p.candidates=generateCandidates(brief('flat roof'),1,1);assert.deepEqual(p.buildings[0],saved);
  p.draft=clone(saved);p.draft.overrides={facadeBays:1,entranceOffset:.16,awning:0,roofPitch:25};saveBuilding(p);
  place(p,{id:'copy',buildingId:p.buildings[0].id,slot:'B3',rotation:90});
  beginRevision(p);p.revision.style.palette.walls='#abcdef';applyRevision(p);
  const restored=parseProject(projectFile(p));assert.deepEqual(restored,p);
  const b=restored.buildings[0],parts=buildingParts(b,restored.styles[1]).parts;
  assert.deepEqual(b.overrides,{facadeBays:1,entranceOffset:.16,awning:0,roofPitch:25});
  assert.equal(parts.filter(x=>/^Upper floor 2 window \d pane$/.test(x.name)).length,1);assert.ok(parts.find(x=>x.name==='Entrance pane').p[0]>0);assert.ok(!parts.some(x=>/awning/i.test(x.name)));assert.ok(parts.some(x=>x.name==='Pitched roof'));
  assert.equal(effective(b,restored.styles[1]).roofPitch,25);assert.equal(buildingParts(b,restored.styles[1]).palette.wall,'#abcdef');
  beginRevision(restored);restored.buildings[0].pinned.Doors=false;applyRevision(restored);assert.ok(!('entranceOffset' in restored.buildings[0].overrides));
});

test('generated project validation rejects malformed metadata and extra parameters without breaking legacy import',()=>{
  const p=family();p.draft=generateCandidates(brief('left entrance'),1)[0];saveBuilding(p);
  for(const change of [b=>b.source='ai',b=>b.baseline.generation.engine='unknown',b=>b.baseline.generation.roof='dome',b=>b.baseline.generation.round=-1,b=>b.baseline.generation.applied=['x'.repeat(301)],b=>b.parameters.entranceOffset=1,b=>b.parameters.facadeBays=2.2,b=>b.overrides.awning=2,b=>delete b.parameters.awning,b=>delete b.baseline.generation]){const bad=clone(p);change(bad.buildings[0]);assert.throws(()=>parseProject(projectFile(bad)));}
  p.buildings=[sampleCandidatesFor(defaultBrief(),1)[0]];assert.deepEqual(parseProject(projectFile(p)),p);
});

test('GLB exports the same generated pieces with role tags, recipe metadata and linked style',()=>{
  const p=family();p.draft=generateCandidates(brief('right entrance, flat roof, solid awning'),1)[0];saveBuilding(p);place(p,{id:'copy',buildingId:p.buildings[0].id,slot:'A1',rotation:180});
  const {doc}=modelDocument(p);assert.equal(doc.extras.source,GENERATOR);assert.equal(doc.nodes[0].extras.source,GENERATOR);assert.deepEqual(doc.nodes[0].extras.recipe.parameters,p.buildings[0].parameters);assert.deepEqual(doc.nodes[0].extras.style,p.styles[0]);
  assert.ok(doc.nodes.some(n=>n.name==='Doors / Entrance pane'&&n.extras.role==='Doors'));
  const data=modelGLB(p),jsonSize=new DataView(data).getUint32(12,true),exported=JSON.parse(new TextDecoder().decode(new Uint8Array(data,20,jsonSize)));assert.deepEqual(exported.nodes,doc.nodes);
});
