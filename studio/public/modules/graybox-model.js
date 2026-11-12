import * as THREE from '../vendor/three/three.module.js';

// Bounded, deterministic cube recipes. No model service or free-text inference.
export const THEMES = ['Sci-fi','Organic','Medieval','Roman','Desert','Industrial','Coastal','Terraced','Winter'];
export const SLOTS = ['A','B','C','D'].flatMap(row=>[1,2,3,4].map(col=>row+col));
export const GRAYBOX_SLOTS = SLOTS;
export const TYPES = ['Building','House','Shop','Townhouse','Workshop','Bakery','Temple','Hall','Tower','Tree','Planter','Bench','Decoration'];
export const STARTERS = [
  {id:'botanical',name:'Botanicals',theme:'Organic',proportions:'compact',detail:'light',palette:{walls:'#e6b9aa',roof:'#a25660',trim:'#efdaab',glass:'#617b72',accent:'#698659'}},
  {id:'city-state',name:'Terraced City-States',theme:'Terraced',proportions:'wide',detail:'balanced',palette:{walls:'#d8c1a2',roof:'#c6653f',trim:'#f3dfaa',glass:'#426e82',accent:'#248d91'}},
  {id:'retro-future',name:'Retro-Future',theme:'Sci-fi',proportions:'tall',detail:'balanced',palette:{walls:'#e7d9b6',roof:'#ca6246',trim:'#efdca5',glass:'#397a8c',accent:'#e3b744'}}
];
const THEMATIC_COLORS={
 'Sci-fi':['#d4e1dc','#526878','#9fbfbd','#385976','#e7ae53'],Organic:['#d7b6a4','#a05b64','#ecd3ad','#567a6a','#6c884b'],
 Medieval:['#cbb795','#78605c','#ddd1ad','#455c63','#a67d46'],Roman:['#ddd0b4','#b75e49','#f0e2c1','#557582','#c89247'],
 Desert:['#dab078','#b87850','#edd0a0','#466c77','#a77864'],Industrial:['#98a6a5','#51616b','#cad0c4','#426370','#c58c45'],
 Coastal:['#e4dac1','#518b9c','#f4e6be','#45828e','#dc9677'],Terraced:['#d8c1a2','#c6653f','#f3dfaa','#426e82','#248d91'],
 Winter:['#c6d6da','#6c8291','#eff0e5','#587d90','#ba7771']
};
const limit=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
const color=(v,fallback)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:fallback;
export function normalizeStyle(input={}) {
 const theme=THEMES.find(t=>t.toLowerCase()===String(input.theme||'').toLowerCase())||'Terraced';
 const values=THEMATIC_COLORS[theme],palette={};
 ['walls','roof','trim','glass','accent'].forEach((key,i)=>palette[key]=color(input.palette?.[key],values[i]));
 return {theme,palette,proportions:['compact','wide','tall'].includes(input.proportions)?input.proportions:'compact',shape:['horizontal','vertical','stepped'].includes(input.shape)?input.shape:(['Terraced','Organic'].includes(theme)?'stepped':'horizontal'),detail:['light','balanced','bold'].includes(input.detail)?input.detail:'balanced'};
}
export function normalizeBrief(input={}) {
 const allowed=TYPES;
 const type=allowed.find(v=>v.toLowerCase()===String(input.type||'').toLowerCase())||'Building';
 return {type,floors:Math.round(limit(input.floors,1,4,2)),width:limit(input.width,2,7,4),depth:limit(input.depth,2,7,4),variant:Math.round(limit(input.variant,0,2,0))};
}
export function grayboxParts(styleInput={},briefInput={}) {
 const style=normalizeStyle(styleInput),brief=normalizeBrief(briefInput),parts=[];
 const cube=(name,size,position,material='walls')=>parts.push({name,size,position,material});
 const {type,variant}=brief; const decorative=['Tree','Planter','Bench','Decoration'].includes(type);
 let w=brief.width*(style.proportions==='wide'||style.shape==='horizontal'?1.12:1),d=brief.depth,h=brief.floors*(style.proportions==='tall'||style.shape==='vertical'?1.6:1.25);
 if(type==='Tower'){w*=.7;d*=.7;h*=1.3;}
 if(decorative) {
  if(type==='Bench') {cube('Bench seat',[2,.25,.7],[0,.65,0],'accent');cube('Bench leg left',[.3,.6,.5],[-.7,.3,0],'trim');cube('Bench leg right',[.3,.6,.5],[.7,.3,0],'trim');cube('Bench back',[2,.65,.2],[0,1,.3],'walls');}
  else {cube('Planter base',[1.6,.6,1.6],[0,.3,0],'roof');cube('Soil',[1.35,.1,1.35],[0,.65,0],'glass'); if(type==='Tree'){cube('Tree trunk',[.35,1.6,.35],[0,1.4,0],'walls');cube('Tree canopy',[1.7,1.4,1.7],[0,2.6,0],'accent');cube('Upper canopy',[1.1,.8,1.1],[.2,3.5,0],'accent');} else {cube('Plant block',[.9,.8,.9],[0,1.05,0],'accent');cube('Plant upper',[.55,.5,.55],[.2,1.7,0],'accent');}}
  return parts;
 }
 cube('Foundation',[w+.5,.22,d+.5],[0,.11,0],'trim');
 // Deliberately distinct broad silhouettes, all expressible as cuboids.
 if(style.shape==='stepped') {
  const levels=brief.floors;
  for(let i=0;i<levels;i++){const reduction=i*.17;cube(`Stepped mass ${i+1}`,[w*(1-reduction),h/levels,d*(1-reduction)],[i*.12,.22+(i+.5)*h/levels,0]);cube(`Terrace band ${i+1}`,[w*(1-reduction)+.24,.16,d*(1-reduction)+.24],[i*.12,.22+(i+1)*h/levels,0],'trim');}
 } else cube('Main building',[w,h,d],[0,h/2+.22,0]);
 const top=.22+h;
 if(style.theme==='Medieval'||style.theme==='Winter') {
  for(let i=0;i<3;i++)cube(`Stepped roof ${i+1}`,[w+.5-i*w*.22,.3,d+.4-i*.12],[0,top+.15+i*.3,0],'roof');
 } else if(style.theme==='Sci-fi') {
  cube('Cantilever canopy',[w+1,.3,d+.65],[variant===1?.4:0,top+.15,0],'roof');cube('Upper service module',[w*.4,.65,d*.5],[w*.15,top+.62,0],'accent');
 } else if(style.theme==='Roman') {
  cube('Entablature',[w+.45,.35,d+.45],[0,top+.18,0],'trim');
  for(const x of [-w*.38,w*.38])cube('Square portico pillar',[.35,h,.35],[x,h/2+.22,d/2+.4],'trim');
  cube('Portico canopy',[w+.4,.25,1],[0,top+.08,d/2+.2],'roof');
 } else {
  cube('Flat roof',[w+.3,.25,d+.3],[0,top+.13,0],'roof');
  if(style.theme==='Industrial')cube('Vent stack',[.6,1,.6],[w*.25,top+.65,-d*.2],'trim');
  if(style.theme==='Desert')for(const x of [-w*.43,w*.43])cube('Parapet',[.25,.45,d],[x,top+.35,0],'trim');
 }
 const cols=style.detail==='light'?2:3,rows=Math.min(brief.floors,3);
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x=(col-(cols-1)/2)*w/(cols+1),y=.8+row*h/brief.floors;
  if(row===0&&Math.abs(x)<.3)continue;
  const inset=style.shape==='stepped'?row*.17:0;
  cube(`Window ${row+1}-${col+1}`,[Math.min(.65,w/(cols+2)),.55,.1],[x*(1-inset)+row*.12,y,d*(1-inset)/2+.055],'glass');
 }
 cube('Entry',[.7,1,.12],[variant===2?-w*.22:0,.72,d/2+.08],'glass');
 if(style.detail!=='light')cube('Entry marker',[1.1,.16,.45],[variant===2?-w*.22:0,1.3,d/2+.2],'accent');
 if(['Shop','Bakery'].includes(type))cube('Shop canopy',[w*.7,.15,.75],[0,1.65,d/2+.35],'accent');
 if(style.theme==='Coastal')cube('Balcony',[w*.8,.18,1],[0,h*.6,d/2+.35],'trim');
 if(style.theme==='Organic')for(const x of [-w*.36,w*.36])cube('Planter greenery',[.75,.5,.65],[x,.55,d/2+.35],'accent');
 if(style.detail==='bold')cube('Accent spine',[.24,h+.4,.24],[-w/2-.12,h/2+.3,0],'accent');
 return parts;
}
export function makeGraybox(styleInput={},briefInput={}) {
 const style=normalizeStyle(styleInput),brief=normalizeBrief(briefInput),group=new THREE.Group();
 group.name=brief.type;group.userData={generator:'bounded-cubes-v1',style,brief};
 for(const p of grayboxParts(style,brief)) {const mesh=new THREE.Mesh(new THREE.BoxGeometry(...p.size),new THREE.MeshStandardMaterial({color:style.palette[p.material],roughness:.88}));mesh.name=p.name;mesh.position.set(...p.position);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={role:p.material,primitive:'cube'};group.add(mesh);}
 return group;
}
export function makeWorld(objects=[],elevations={}) {
 const group=new THREE.Group();group.name='Style graybox world';
 for(const [index,slot] of GRAYBOX_SLOTS.entries()) {
  const elevation=limit(elevations[slot],0,4,0),height=.25+elevation;
  const plot=new THREE.Mesh(new THREE.BoxGeometry(9.5,height,9.5),new THREE.MeshStandardMaterial({color:'#c4c7ad',roughness:1}));
  plot.position.set((index%4-1.5)*10,height/2-.25,(Math.floor(index/4)-1.5)*10);plot.name=`Plot ${slot}`;plot.receiveShadow=true;plot.userData={slot,elevation,primitive:'cube'};group.add(plot);
  const item=objects.find(item=>item.slot===slot);if(!item)continue;
  const building=makeGraybox(item.style,item.brief);building.position.set(plot.position.x,elevation,plot.position.z);building.rotation.y=(Math.round(limit(item.rotation,-360,360,0)/90)*90)*Math.PI/180;building.userData={...building.userData,slot,id:item.id};group.add(building);
 }
 return group;
}
