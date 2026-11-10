import {styleFor,SLOTS} from './model.js';
import {buildBuilding} from './architecture.js';

// The viewport and GLB use the same original-market geometry, including real
// roof faces, beveled trim, awnings and named editable pieces.
export function modelDocument(project){
  const chunks=[],bufferViews=[],accessors=[],nodes=[],meshes=[],materials=[],roots=[];let bytes=0;
  const materialMap=new Map();
  const append=(typed,target)=>{const data=new Uint8Array(typed.buffer,typed.byteOffset,typed.byteLength);const id=bufferViews.length;bufferViews.push({buffer:0,byteOffset:bytes,byteLength:data.length,target});chunks.push(data);bytes+=data.length;const pad=(4-bytes%4)%4;if(pad){chunks.push(new Uint8Array(pad));bytes+=pad;}return id;};
  const accessor=(data,bounds)=>{const i=accessors.length;accessors.push({bufferView:append(data,34962),componentType:5126,count:data.length/3,type:'VEC3',...bounds});return i;};
  for(const inst of project.block.instances){
    const b=project.buildings.find(b=>b.id===inst.buildingId),model=buildBuilding(b,styleFor(project,b)),slot=SLOTS.indexOf(inst.slot),angle=inst.rotation*Math.PI/180;
    const root=nodes.length;roots.push(root);nodes.push({name:`${b.name} / ${inst.slot}`,translation:[(slot%3-1)*12,0,(Math.floor(slot/3)-.5)*12],rotation:[0,Math.sin(angle/2),0,Math.cos(angle/2)],scale:model.scale.toArray(),children:[],extras:{buildingId:b.id,styleVersion:b.styleVersion,source:b.source,recipe:{baseline:b.baseline,parameters:b.parameters,overrides:b.overrides},style:styleFor(project,b)}});
    for(const part of model.children){
      const g=part.geometry.index?part.geometry.toNonIndexed():part.geometry;g.computeBoundingBox();const m=part.material,key=m.color.getHexString()+':'+m.emissive.getHexString();let material=materialMap.get(key);
      if(material===undefined){material=materials.length;materialMap.set(key,material);materials.push({name:'#'+m.color.getHexString(),pbrMetallicRoughness:{baseColorFactor:[...m.color.toArray(),1],roughnessFactor:m.roughness,metallicFactor:0},emissiveFactor:m.emissive.clone().multiplyScalar(m.emissiveIntensity).toArray()});}
      const attributes={POSITION:accessor(g.attributes.position.array,{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()}),NORMAL:accessor(g.attributes.normal.array,{})};
      const mesh=meshes.length;meshes.push({primitives:[{attributes,material}]});nodes[root].children.push(nodes.length);nodes.push({name:part.name,mesh,translation:part.position.toArray(),rotation:part.quaternion.toArray(),scale:part.scale.toArray(),extras:{role:part.userData.role}});
      if(g!==part.geometry)g.dispose();part.geometry.dispose();part.material.dispose();
    }
  }
  const binary=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){binary.set(chunk,offset);offset+=chunk.length;}
  return {doc:{asset:{version:'2.0',generator:'World Farm Market Kit studio'},scene:0,scenes:[{name:project.block.name,nodes:roots}],nodes,meshes,materials,buffers:[{byteLength:bytes}],bufferViews,accessors,extras:{units:'meters',source:project.block.instances.some(i=>project.buildings.find(b=>b.id===i.buildingId)?.source==='procedural-kit-v1')?'procedural-kit-v1':'mock-kit',note:'Bounded editable kit geometry with named parts and source recipes. Not AI-generated; use World Farm project JSON to reopen the full editing workflow.'}},binary};
}
export function modelGLB(project){
  const {doc,binary}=modelDocument(project),text=new TextEncoder().encode(JSON.stringify(doc)),jsonLength=Math.ceil(text.length/4)*4,binLength=Math.ceil(binary.length/4)*4,total=12+8+jsonLength+8+binLength,buffer=new ArrayBuffer(total),view=new DataView(buffer),bytes=new Uint8Array(buffer);
  view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,total,true);view.setUint32(12,jsonLength,true);view.setUint32(16,0x4e4f534a,true);bytes.fill(32,20,20+jsonLength);bytes.set(text,20);view.setUint32(20+jsonLength,binLength,true);view.setUint32(24+jsonLength,0x004e4942,true);bytes.set(binary,28+jsonLength);return buffer;
}
