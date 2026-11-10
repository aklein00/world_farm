import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProject,saveInitialStyle,sampleCandidatesFor as candidatesFor,saveBuilding,beginRevision,applyRevision,effective,place,parseProject,projectFile,clone} from '../public/modules/model.js';
import {buildBuilding,buildingParts,MARKET_STYLES} from '../public/modules/architecture.js';
import {recipe,variants} from '../public/modules/market-recipes.js';
import {modelGLB,modelDocument} from '../public/modules/export.js';
function family(){const p=freshProject();saveInitialStyle(p);for(const type of ['Bakery','Townhouse','Workshop']){p.draft=candidatesFor({...p.brief,type},1)[0];saveBuilding(p);}p.step=7;return p;}
test('candidate generation does not mutate a saved building; edits require save',()=>{const p=family(),old=clone(p.buildings[0]);p.candidates=candidatesFor(p.brief,1,1);assert.deepEqual(p.buildings[0],old);p.draft=clone(old);p.draft.overrides.windowWidth=1.4;assert.deepEqual(p.buildings[0],old);saveBuilding(p);assert.equal(p.buildings.length,3);assert.equal(p.buildings[0].overrides.windowWidth,1.4);});
test('selective style revisions preserve pinned overrides and instance transforms',()=>{const p=family(),[a,b,c]=p.buildings;a.overrides={windowWidth:1.4,frameThickness:.1};b.overrides={frameThickness:.08};b.pinned.Windows=false;place(p,{id:'copy1',buildingId:a.id,slot:'A1',rotation:90});const copies=clone(p.block.instances);beginRevision(p);p.revision.style.trimWeight=85;p.revision.style.palette.walls='#cfad65';p.revision.selected=[a.id,b.id];assert.equal(p.buildings[0].styleVersion,1);assert.equal(applyRevision(p),2);assert.equal(p.currentVersion,2);assert.equal(p.styles.length,2);assert.deepEqual(p.buildings.map(x=>x.styleVersion),[2,2,1]);assert.deepEqual(p.buildings[0].overrides,{windowWidth:1.4,frameThickness:.1});assert.deepEqual(p.buildings[1].overrides,{});assert.equal(effective(p.buildings[1],p.styles[1]).frameThickness,.125);assert.deepEqual(p.block.instances,copies);assert.equal(c.styleVersion,1);});
test('occupied plots reject placement atomically; copies share their source',()=>{const p=family(),a={id:'copy1',buildingId:p.buildings[0].id,slot:'A1',rotation:0};place(p,a);const before=clone(p.block);assert.throws(()=>place(p,{...a,id:'copy2'}),/occupied/);assert.deepEqual(p.block,before);place(p,{...a,id:'copy2',slot:'B2',rotation:90});p.block.instances=p.block.instances.filter(x=>x.id!=='copy1');assert.equal(p.buildings.length,3);assert.equal(p.block.instances[0].buildingId,a.buildingId);});
test('portable project round trip retains drafts, versions and placed copies',()=>{const p=family();p.draft=clone(p.buildings[0]);p.draft.overrides.doorWidth=1.2;place(p,{id:'copy1',buildingId:p.buildings[0].id,slot:'B3',rotation:270});beginRevision(p);p.revision.style.softness=75;p.step=11;const loaded=parseProject(projectFile(p));assert.deepEqual(loaded,p);});
test('invalid imports reject out-of-range values, dangling references and duplicate occupancy',()=>{const p=family();for(const change of [x=>x.buildings[0].overrides.windowWidth=999,x=>x.styles[0].palette.walls='url(https://bad)',x=>x.buildings[0].styleVersion=9,x=>x.block.instances=[{id:'c1',buildingId:'missing',slot:'A1',rotation:0}],x=>x.buildings.push(clone(x.buildings[0])),x=>x.step=999]){const bad=clone(p);change(bad);assert.throws(()=>parseProject(JSON.stringify(bad)));}assert.throws(()=>parseProject('x'.repeat(2_000_001)),/2 MB/);});
test('GLB contains valid headers, named building roots, materials and rotations',()=>{const p=family();place(p,{id:'copy1',buildingId:p.buildings[0].id,slot:'A1',rotation:90});place(p,{id:'copy2',buildingId:p.buildings[1].id,slot:'B3',rotation:0});const data=modelGLB(p),view=new DataView(data);assert.equal(view.getUint32(0,true),0x46546c67);assert.equal(view.getUint32(4,true),2);assert.equal(view.getUint32(8,true),data.byteLength);const jsonLength=view.getUint32(12,true),gltf=JSON.parse(new TextDecoder().decode(new Uint8Array(data,20,jsonLength)));assert.equal(gltf.scenes[0].nodes.length,2);assert.equal(gltf.nodes[0].name,'Harbor Bakery / A1');assert.ok(Math.abs(gltf.nodes[0].rotation[1]-Math.SQRT1_2)<1e-8);assert.ok(gltf.nodes.some(x=>x.name==='Windows / Upper ribbon glazing surround'));assert.equal(gltf.buffers[0].byteLength,view.getUint32(20+jsonLength,true));assert.equal(gltf.extras.source,'mock-kit');});

test('live 3D scene recipe tracks edits and matches exported model transforms',()=>{
  const p=family(),b=p.buildings[0];place(p,{id:'copy1',buildingId:b.id,slot:'B2',rotation:270});
  const before=buildingParts(b,p.styles[0]).parts.find(n=>n.name==='Upper ribbon glazing pane').s[0];
  b.overrides.windowWidth=1.4;
  const {doc}=modelDocument(p);
  assert.ok(buildingParts(b,p.styles[0]).parts.find(n=>n.name==='Upper ribbon glazing pane').s[0]>before);
  assert.ok(doc.nodes.some(n=>n.name==='Windows / Side window pane'));
  assert.deepEqual(doc.nodes[0].translation,[0,0,6]);
  const data=modelGLB(p),length=new DataView(data).getUint32(12,true);
  const exported=JSON.parse(new TextDecoder().decode(new Uint8Array(data,20,length)));
  assert.deepEqual(exported.nodes,doc.nodes);
  assert.deepEqual(exported.materials,doc.materials);
});

test('all six unedited market presets retain the original recipe proportions and details',()=>{
  const p=family(),b=p.buildings[0];
  for(const preset of MARKET_STYLES){
    const s={...p.styles[0],marketStyle:preset.id,palette:preset.palette};
    const original=recipe(variants.find(v=>v.id===preset.id));
    const adapted=buildingParts(b,s);
    assert.equal(adapted.parts.length,original.parts.length,preset.name);
    for(let i=0;i<original.parts.length;i++){
      assert.deepEqual(adapted.parts[i].p,original.parts[i].p,original.parts[i].name);
      assert.deepEqual(adapted.parts[i].s,original.parts[i].s,original.parts[i].name);
    }
    assert.equal(adapted.palette.wall,original.palette.wall);
    assert.equal(adapted.palette.glass,original.palette.glass);
  }
});
test('legacy project files gain the original market template without changing user colors',()=>{
  const p=family();for(const s of [...p.styles,p.styleDraft])delete s.marketStyle;
  p.styles[0].palette.walls='#abcdef';
  const restored=parseProject(projectFile(p));
  assert.equal(restored.styles[0].marketStyle,'04C');
  assert.equal(restored.styles[0].palette.walls,'#abcdef');
});
test('market geometry exports actual bevels and rotated awning pieces',()=>{
  const p=family();place(p,{id:'copy',buildingId:p.buildings[0].id,slot:'A1',rotation:0});
  const {doc,binary}=modelDocument(p),awning=doc.nodes.find(n=>n.name==='Roof / Sloped awning stripe 1');
  assert.ok(awning.rotation[0]>0);
  const a=doc.accessors[doc.meshes[awning.mesh].primitives[0].attributes.POSITION];
  assert.ok(a.count>36,'Beveled awnings should not export as plain cubes');
  assert.equal(doc.buffers[0].byteLength,binary.length);
  for(const view of doc.bufferViews){assert.equal(view.byteOffset%4,0);assert.ok(view.byteOffset+view.byteLength<=binary.length);}
});
