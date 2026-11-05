import {freshProject,parseProject,clone,currentStyle,saveInitialStyle} from './model.js';
export const STARTER_IDS=['04C','03B','03A'];
export function editableStyle(p){return p.revision?.style||(p.step<=2?p.styleDraft:currentStyle(p));}
export function styleFile(style,name){return JSON.stringify({format:'worldfarm-style',schemaVersion:1,name,style:clone(style)},null,2);}
export function parseStyleFile(text){
  if(text.length>64_000)throw new Error('Style files must be smaller than 64 KB.');
  let raw;try{raw=JSON.parse(text);}catch{throw new Error('Choose a valid World Farm style JSON file.');}
  if(raw?.format!=='worldfarm-style'||raw.schemaVersion!==1||typeof raw.name!=='string'||!raw.name.trim()||raw.name.length>80||!raw.style)throw new Error('Choose a .worldfarm-style.json file. Project files use Project → Import.');
  const p=freshProject();p.styleDraft=raw.style;
  try{return {...parseProject(JSON.stringify(p)).styleDraft,name:raw.name.trim()};}catch{throw new Error('This style contains unsupported settings. Your current style is unchanged.');}
}
export function saveUnbuiltStyle(p){
  if(p.buildings.length)throw new Error('Preview a style revision before updating saved buildings.');
  if(!p.currentVersion){saveInitialStyle(p);return;}
  const version=p.currentVersion+1;
  p.styles.push({...clone(p.styleDraft),version});p.currentVersion=version;p.styleDraft.version=version;
  for(const b of [...p.candidates,...(p.draft?[p.draft]:[])])b.styleVersion=version;
}
