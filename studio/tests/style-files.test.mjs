import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProject,saveInitialStyle,candidatesFor,parseProject,projectFile,clone} from '../public/modules/model.js';
import {styleFile,parseStyleFile,saveUnbuiltStyle} from '../public/modules/style-files.js';
test('style JSON round trip keeps all editable settings and survives project reload',()=>{
  const p=freshProject();p.styleDraft.palette.walls='#abcdef';p.styleDraft.softness=72;p.styleDraft.marketStyle='03B';
  const loaded=parseStyleFile(styleFile(p.styleDraft,'My honey style'));
  assert.deepEqual(loaded,{...p.styleDraft,name:'My honey style'});
  p.styleDraft=loaded;assert.deepEqual(parseProject(projectFile(p)).styleDraft,loaded);
});
test('invalid and oversized style files are rejected',()=>{
  const style=freshProject().styleDraft;
  for(const text of ['{',projectFile(freshProject()),' '.repeat(64001),styleFile({...style,palette:{...style.palette,walls:'url(bad)'}},'Invalid'),styleFile({...style,softness:1000},'Invalid'),JSON.stringify({format:'worldfarm-style',schemaVersion:2,name:'Future',style})])assert.throws(()=>parseStyleFile(text));
});
test('style can be saved after generation but before a building exists, preserving local edits',()=>{
  const p=freshProject();saveInitialStyle(p);p.candidates=candidatesFor(p.brief,1);p.draft=clone(p.candidates[0]);p.draft.overrides.windowWidth=1.3;
  p.styleDraft.palette.roof='#aabbcc';saveUnbuiltStyle(p);
  assert.equal(p.currentVersion,2);assert.equal(p.styles[0].palette.roof,'#df907e');assert.equal(p.styles[1].palette.roof,'#aabbcc');
  assert.equal(p.draft.styleVersion,2);assert.equal(p.draft.overrides.windowWidth,1.3);assert.ok(p.candidates.every(b=>b.styleVersion===2));
  assert.deepEqual(parseProject(projectFile(p)),p);
  p.buildings.push(clone(p.draft));const before=clone(p);assert.throws(()=>saveUnbuiltStyle(p));assert.deepEqual(p,before);
});
