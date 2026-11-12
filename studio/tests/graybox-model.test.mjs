import test from 'node:test';
import assert from 'node:assert/strict';
import {THEMES,STARTERS,normalizeStyle,normalizeBrief,grayboxParts,makeGraybox,makeWorld} from '../public/modules/graybox-model.js';
test('every theme uses bounded cube geometry and finite positive dimensions',()=>{
 for(const theme of THEMES)for(const type of ['House','Shop','Tower','Tree','Planter','Bench']) {
  const group=makeGraybox({theme},{type,floors:4});assert.ok(group.children.length);
  group.traverse(o=>{if(o.isMesh){assert.equal(o.geometry.type,'BoxGeometry');for(const n of Object.values(o.geometry.parameters))assert.ok(Number.isFinite(n)&&n>0);}});
 }
});
test('normalization clamps hostile input and validates colors',()=>{
 assert.equal(normalizeBrief({floors:999,width:-10,depth:NaN}).floors,4);assert.equal(normalizeBrief({width:-10}).width,2);
 assert.equal(normalizeStyle({theme:'Unknown',palette:{walls:'url(x)'}}).theme,'Terraced');assert.match(normalizeStyle({palette:{walls:'url(x)'}}).palette.walls,/^#[0-9a-f]{6}$/i);
});
test('recipes are repeatable, themes distinct, starters editable without mutation',()=>{
 const s=structuredClone(STARTERS);assert.deepEqual(grayboxParts(s[0],{}),grayboxParts(s[0],{}));
 assert.notDeepEqual(grayboxParts({theme:'Roman'},{}),grayboxParts({theme:'Sci-fi'},{}));makeGraybox(s[0],{});assert.deepEqual(s,STARTERS);
});
test('plot elevations lift both ground and object and swapping preserves plot',()=>{
 const scene=makeWorld([{id:'one',slot:'A1',style:{theme:'Roman'},brief:{type:'Temple'},rotation:90}],{A1:3,B2:999});
 const plot=scene.children.find(c=>c.name==='Plot A1'),object=scene.children.find(c=>c.userData.id==='one');assert.equal(object.position.y,3);assert.equal(object.rotation.y,Math.PI/2);assert.equal(plot.userData.elevation,3);assert.equal(scene.children.find(c=>c.name==='Plot B2').userData.elevation,4);
 const swapped=makeWorld([{id:'two',slot:'A1',style:{theme:'Organic'},brief:{type:'Tree'}}],{A1:3});assert.equal(swapped.children.find(c=>c.userData.id==='two').position.y,3);
});
