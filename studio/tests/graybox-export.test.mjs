import test from 'node:test';
import assert from 'node:assert/strict';
import {grayboxDocument,grayboxGLB} from '../public/modules/graybox-export.js';
const objects=[{id:'test-tree',slot:'A1',rotation:90,brief:{type:'Tree'},style:{theme:'Organic'}}];
test('GLB has valid version, chunk types, aligned lengths and finite data',()=>{
 const buffer=grayboxGLB(objects,{A1:3}),view=new DataView(buffer);
 assert.equal(view.getUint32(0,true),0x46546c67);assert.equal(view.getUint32(4,true),2);assert.equal(view.getUint32(8,true),buffer.byteLength);
 const length=view.getUint32(12,true);assert.equal(length%4,0);assert.equal(view.getUint32(16,true),0x4e4f534a);assert.equal(view.getUint32(24+length,true),0x004e4942);
 const doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length)));assert.equal(doc.asset.version,'2.0');assert.equal(doc.buffers[0].byteLength,view.getUint32(20+length,true));
 for(const access of doc.accessors){const bv=doc.bufferViews[access.bufferView];assert.ok(bv.byteOffset+bv.byteLength<=doc.buffers[0].byteLength);const floats=new Float32Array(buffer,28+length+bv.byteOffset,bv.byteLength/4);assert.ok([...floats].every(Number.isFinite));}
});
test('cube world vertices include plot position, elevation and rotation',()=>{
 const {doc}=grayboxDocument(objects,{A1:3});const node=doc.nodes.find(n=>n.name==='Tree trunk'),access=doc.accessors[doc.meshes[node.mesh].primitives[0].attributes.POSITION];
 assert.equal(node.extras.slot,'A1');assert.equal(node.extras.objectId,'test-tree');assert.ok(Math.abs(access.min[1]-3.6)<1e-5);assert.ok(Math.abs(access.min[0]+15.175)<1e-5);
 const upper=doc.nodes.find(n=>n.name==='Upper canopy'),up=doc.accessors[doc.meshes[upper.mesh].primitives[0].attributes.POSITION];
 assert.ok(Math.abs((up.min[2]+up.max[2])/2-(-15.2))<1e-5);assert.equal(node.translation,undefined);
});
test('exports include all 16 raised or flat plot cubes',()=>{
 const {doc}=grayboxDocument([],{D4:2});assert.equal(doc.nodes.length,16);const plot=doc.nodes.find(n=>n.name==='Plot D4'),access=doc.accessors[doc.meshes[plot.mesh].primitives[0].attributes.POSITION];assert.equal(access.max[1],2);assert.equal(access.min[1],-.25);
});
