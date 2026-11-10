import * as THREE from '../vendor/three/three.module.js';
import {recipe,variants} from './market-recipes.js';
import {effective} from './model.js';
import {GENERATOR} from './generation.js';

// The original Market Kit 01 recipes are the visual source of truth. Adapt the
// named pieces, rather than rebuilding a generic facade for the workflow demo.
export const MARKET_STYLES=variants.map(v=>({id:v.id,name:v.name,palette:{walls:v.wall,trim:v.trim,roof:v.roof,glass:v.glass}}));
const roleOf=name=>/awning|roof|pavilion|copper|vent|cornice|hedge|planter|balcony/i.test(name)?'Roof':/entry|door|shutter/i.test(name)?'Doors':/window|glazing|bay|display/i.test(name)?'Windows':'Building';
function polygon(vertices,faces){const positions=[];for(const face of faces)for(let i=1;i<face.length-1;i++)for(const index of [face[0],face[i],face[i+1]])positions.push(...vertices[index]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;}
function geometry(p,softness){
  if(p.type==='mesh')return polygon(p.vertices,p.faces);
  const [w,h,d]=p.s;
  if(p.type==='hip'){const [tx,tz]=p.taper;return polygon([[-w/2,-h/2,-d/2],[w/2,-h/2,-d/2],[w/2,-h/2,d/2],[-w/2,-h/2,d/2],[-w*tx,h/2,-d*tz],[w*tx,h/2,-d*tz],[w*tx,h/2,d*tz],[-w*tx,h/2,d*tz]],[[1,2,3,0],[7,6,5,4],[4,5,1,0],[5,6,2,1],[6,7,3,2],[7,4,0,3]]);}
  const b=Math.min(p.bevel*(.55+softness/100*1.3),Math.min(...p.s)*.23);
  if(b<.001)return new THREE.BoxGeometry(w,h,d).toNonIndexed();
  const x=w/2-b,y=h/2-b,s=new THREE.Shape();s.moveTo(-x,-y);s.lineTo(x,-y);s.lineTo(x,y);s.lineTo(-x,y);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:d-2*b,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:b,bevelThickness:b,curveSegments:1});g.translate(0,0,-d/2+b);return g;
}
export function buildingParts(building,style){
  const source=recipe(variants.find(v=>v.id===style.marketStyle)||variants[0]),p=effective(building,style),parts=structuredClone(source.parts);
  const wall=parts.find(q=>/wall mass/i.test(q.name)),w=wall.s[0],d=wall.s[2],height=wall.s[1],groundH=(parts.find(q=>q.name==='Sloped awning stripe 1')?.p[1]||2.5)+.4,floorH=height-groundH,roofY=.2+height;
  const front=d/2,store=building.type==='Bakery'||building.type==='Shop',generated=building.source===GENERATOR;
  let out=[];
  for(const part of parts){
    const name=part.name,role=roleOf(name),upper=role==='Windows'&&part.p[1]>groundH+.2;
    if(/awning/i.test(name)&&(!store||!p.awning))continue;
    if(generated && ((role==='Windows'&&part.p[2]>=front) || (/entry|door divider/i.test(name)&&part.p[2]>=front)))continue;
    if(generated && /awning/i.test(name) && !p.awningStripe)part.mat='accent';
    if(!store&&/display|entry|door divider|balcony|planter|hedge|copper standing seam/i.test(name))continue;
    if(p.floors===1&&upper)continue;
    if(p.floors===1&&/balcony|planter|hedge/i.test(name)&&part.p[1]<roofY)continue;
    if(/wall mass|corner pier|pilaster/i.test(name)){
      // Mass stretches with floors; openings stay human-scaled.
      if(/wall mass/i.test(name)){const scale=(height+(p.floors-2)*floorH)/height;part.s[1]*=scale;part.p[1]=.2+height*scale/2;if(part.vertices)for(const v of part.vertices)v[1]*=scale;}
      else if(/upper corner|pilaster/i.test(name)){if(p.floors===1)continue;part.s[1]+=(p.floors-2)*floorH;part.p[1]+=(p.floors-2)*floorH/2;}
    }else if(part.p[1]>=roofY-.2||/roof|pavilion|copper standing seam/i.test(name))part.p[1]+=(p.floors-2)*floorH;
    if(upper){
      // Match the reference at the default 1.1 setting; safely vary each bay.
      const axis=/side/i.test(name)?2:0,delta=(p.windowWidth-1.1)*.55;
      part.s[axis]+=delta;
      if(/surround|trim/i.test(name)){part.s[axis]+=(p.frameThickness-.1)*2;part.s[1]+=(p.frameThickness-.1)*2;}
    }
    if(/entry|door divider|threshold|pull/i.test(name)){
      part.s[0]*=p.doorWidth;
      part.p[0]+=w*p.entranceOffset;
    }
    if(store&&/display/i.test(name)&&(p.entranceOffset!==0||p.doorWidth!==1)){
      const entry=parts.find(q=>q.name==='Entry pane'),door=entry.s[0]*p.doorWidth,center=w*p.entranceOffset,edge=w/2-.32;
      const left=part.p[0]<0?-edge:center+door/2+.16,right=part.p[0]<0?center-door/2-.16:edge;
      part.p[0]=(left+right)/2;part.s[0]=Math.max(.25,right-left)+(/surround/i.test(name)?.13:0);
    }
    if(upper&&building.baseline.variant===2)part.s[/side/i.test(name)?2:0]*=.84;
    const partRole=role;out.push({...part,role:partRole});
    if(upper&&p.floors===3)out.push({...structuredClone(part),p:[part.p[0],part.p[1]+floorH,part.p[2]],name:part.name+' / extra floor',role:partRole});
    if(upper&&style.windowFamily==='Divided panes'&&/pane|glazing|bay/i.test(name)&&! /surround/i.test(name)){
      const side=/side/i.test(name),bar={type:'box',name:'Window divider',p:[...part.p],s:side?[.05,part.s[1],.045]:[.045,part.s[1],.05],mat:'trim',bevel:.005,role:'Windows'};bar.p[side?0:2]+=(side?Math.sign(part.p[0]):1)*.03;out.push(bar);if(p.floors===3)out.push({...structuredClone(bar),p:[bar.p[0],bar.p[1]+floorH,bar.p[2]]});
    }
  }
  const box=(name,pos,size,mat,role)=>out.push({type:'box',name,p:pos,s:size,mat,bevel:.025,role});
  if(!store&&!generated){
    const door=building.type==='Workshop'?w*.52:1.05*p.doorWidth,dh=Math.min(2.05,groundH*.78);
    box(building.type==='Workshop'?'Workshop shutter':'Residential entrance',[0,.2+dh/2,front+.09],[door,dh,.16],'glass','Doors');
    for(const x of [-door/2-.07,door/2+.07])box('Entry jamb',[x,.2+dh/2,front+.13],[.1,dh+.12,.18],'trim','Doors');
    box('Entry lintel',[0,.24+dh,front+.13],[door+.24,.12,.18],'trim','Doors');
    if(building.type==='Workshop')for(let i=1;i<6;i++)box('Shutter slat',[0,.2+dh*i/6,front+.19],[door,.035,.025],'trim','Doors');
    else for(const x of [-w*.3,w*.3]){box('Ground window surround',[x,1.3,front+.07],[.95,1.15,.13],'trim','Windows');box('Ground window pane',[x,1.3,front+.15],[.8,1,.04],'glass','Windows');}
  }
  if(generated){
    // Reflow the front from a recipe rather than selecting a canned facade.
    // Openings reserve a slot before sizing so adjacent pieces cannot overlap.
    const glass=source.emissive?'glow':'glass',cx=p.entranceOffset*w;
    const door=(building.type==='Workshop'?w*.34:store?w*.24:1.05)*p.doorWidth;
    const dh=Math.min(2.05,groundH*.68),edge=w/2-.34;
    const opening=(name,x,y,width,h,role)=>{
      const border=role==='Windows'?p.frameThickness:.09;
      box(name+' surround',[x,y,front+.07],[width+2*border,h+2*border,.14],'trim',role);
      box(name+' pane',[x,y,front+.16],[width,h,.04],glass,role);
      if(role==='Windows'&&style.windowFamily==='Divided panes')box(name+' divider',[x,y,front+.20],[.045,h,.04],'trim',role);
    };
    opening(building.type==='Workshop'?'Workshop shutter':'Entrance',cx,.24+dh/2,door,dh,'Doors');
    box('Entrance threshold',[cx,.07,front+.18],[door+.24,.14,.5],'trim','Doors');
    if(building.type==='Workshop')for(let i=1;i<6;i++)box('Shutter slat',[cx,.24+dh*i/6,front+.20],[door,.035,.03],'trim','Doors');
    const spans=[[-edge,cx-door/2-.3],[cx+door/2+.3,edge]];
    if(building.type!=='Workshop')for(const [i,[left,right]] of spans.entries()){
      const available=right-left;
      if(available>.3)opening(store?'Shop display '+(i+1):'Ground window '+(i+1),(left+right)/2,store?.30+dh*.46:1.3,Math.min(available,store?available:1.0),store?dh*.85:1.0,'Windows');
    }
    const bayStep=(w-.8)/p.facadeBays;
    const windowW=Math.max(.25,(bayStep-.22-2*p.frameThickness)*Math.min(1,p.windowWidth/1.4));
    const windowH=Math.min(1.25,floorH*.47);
    for(let floor=1;floor<p.floors;floor++)for(let i=0;i<p.facadeBays;i++){
      const x=(i-(p.facadeBays-1)/2)*bayStep,y=.2+groundH+(floor-.5)*floorH;
      opening(`Upper floor ${floor+1} window ${i+1}`,x,y,windowW,windowH,'Windows');
    }
  }
  const roofTop=roofY+(p.floors-2)*floorH;
  if(generated && (building.baseline.generation.roof!=='shared'||'roofPitch' in building.overrides)){
    out=out.filter(q=>!(q.p[1]>roofTop+.12&&q.role==='Roof'));
  }
  // Explicit pitch edits replace the roof's decorative crown with a true hip
  // roof. Unedited market templates retain their original roofs exactly.
  if(p.roofPitch>0){out=out.filter(q=>!(q.p[1]>roofY+(p.floors-2)*floorH+.16&&q.role==='Roof'));const rise=Math.tan(p.roofPitch*Math.PI/180)*w*.35;out.push({type:'hip',name:'Pitched roof',p:[0,roofY+(p.floors-2)*floorH+.2+rise/2,0],s:[w+(generated?p.overhang*2:.25),rise,d+(generated?p.overhang*2:.25)],taper:[.08,.08],mat:'roof',bevel:0,role:'Roof'});}
  const widthScale=({'1x2':.7,'2x2':1,'3x2':1.25}[building.baseline.footprint]||1)*p.width;
  const palette={...source.palette,wall:style.palette.walls,trim:style.palette.trim,roof:style.palette.roof,glass:style.palette.glass};
  return {parts:out,palette,widthScale,depthScale:generated?p.depth:1,source,p,roofY:roofY+(p.floors-2)*floorH};
}
export function buildBuilding(building,style){
  const kit=buildingParts(building,style),group=new THREE.Group();group.name=building.name;
  for(const part of kit.parts){
    const g=geometry(part,style.softness),mat=new THREE.MeshStandardMaterial({color:kit.palette[part.mat],roughness:part.mat==='glass'?.35:.78,metalness:0});
    if(part.mat==='glow'&&kit.source.emissive){mat.emissive.set(kit.palette.glow);mat.emissiveIntensity=.22;}
    const mesh=new THREE.Mesh(g,mat);mesh.name=`${part.role} / ${part.name}`;mesh.userData={role:part.role,part:part.name};mesh.position.fromArray(part.p);mesh.rotation.x=part.rx||0;
    if(/roof slab|roof rim/i.test(part.name)){const delta=kit.p.overhang-.15;mesh.scale.set((part.s[0]+delta*2)/part.s[0],1,(part.s[2]+delta*2)/part.s[2]);}
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  group.scale.set(kit.widthScale,1,kit.depthScale);return group;
}
