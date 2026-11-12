import {makeWorld} from './graybox-model.js';

// Bake each cube's complete world transform into its vertices so plot height,
// placement and rotation export exactly as displayed. No network dependency.
export function grayboxDocument(objects=[],elevations={}) {
 const scene=makeWorld(objects,elevations),chunks=[],bufferViews=[],accessors=[],nodes=[],meshes=[],materials=[],materialMap=new Map();let length=0;
 const append=(data,bounds={})=>{
  const raw=new Uint8Array(data.buffer,data.byteOffset,data.byteLength),viewIndex=bufferViews.length;
  bufferViews.push({buffer:0,byteOffset:length,byteLength:raw.byteLength,target:34962});chunks.push(raw.slice());length+=raw.byteLength;
  const padding=(4-length%4)%4;if(padding){chunks.push(new Uint8Array(padding));length+=padding;}
  const index=accessors.length;accessors.push({bufferView:viewIndex,componentType:5126,count:data.length/3,type:'VEC3',...bounds});return index;
 };
 try {
  scene.updateMatrixWorld(true);
  scene.traverse(part=>{
   if(!part.isMesh)return;
   const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();
   try {
    geometry.applyMatrix4(part.matrixWorld);geometry.computeBoundingBox();
    const m=part.material,key=m.color.getHexString()+':'+m.roughness;let material=materialMap.get(key);
    if(material===undefined){material=materials.length;materialMap.set(key,material);materials.push({name:'#'+m.color.getHexString(),pbrMetallicRoughness:{baseColorFactor:[...m.color.toArray(),1],roughnessFactor:m.roughness,metallicFactor:0}});}
    const attributes={POSITION:append(geometry.attributes.position.array,{min:geometry.boundingBox.min.toArray(),max:geometry.boundingBox.max.toArray()}),NORMAL:append(geometry.attributes.normal.array)};
    const mesh=meshes.length;meshes.push({name:part.name,primitives:[{attributes,material,mode:4}]});
    const slot=part.userData.slot||part.parent?.userData.slot;
    nodes.push({name:part.name,mesh,extras:{primitive:'cube',slot,objectId:part.parent?.userData.id,role:part.userData.role}});
   } finally {geometry.dispose();}
  });
 } finally {
  scene.traverse(part=>{if(part.isMesh){part.geometry.dispose();for(const m of Array.isArray(part.material)?part.material:[part.material])m.dispose();}});
 }
 const binary=new Uint8Array(length);let offset=0;for(const chunk of chunks){binary.set(chunk,offset);offset+=chunk.length;}
 return {doc:{asset:{version:'2.0',generator:'World Farm bounded cubes v1'},scene:0,scenes:[{name:'Style graybox',nodes:nodes.map((_,i)=>i)}],nodes,meshes,materials,buffers:[{byteLength:length}],bufferViews,accessors,extras:{units:'meters',generator:'bounded-cubes-v1',note:'Procedural cube prototype. Not AI-generated or production-validated. Use project JSON to resume editing.'}},binary};
}
export function grayboxGLB(objects=[],elevations={}) {
 const {doc,binary}=grayboxDocument(objects,elevations),text=new TextEncoder().encode(JSON.stringify(doc)),jsonLength=Math.ceil(text.length/4)*4,binLength=Math.ceil(binary.length/4)*4,total=28+jsonLength+binLength;
 const buffer=new ArrayBuffer(total),view=new DataView(buffer),bytes=new Uint8Array(buffer);
 view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,total,true);
 view.setUint32(12,jsonLength,true);view.setUint32(16,0x4e4f534a,true);bytes.fill(32,20,20+jsonLength);bytes.set(text,20);
 view.setUint32(20+jsonLength,binLength,true);view.setUint32(24+jsonLength,0x004e4942,true);bytes.set(binary,28+jsonLength);return buffer;
}
