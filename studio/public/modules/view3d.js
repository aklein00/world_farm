import * as THREE from '../vendor/three/three.module.js';
import {OrbitControls} from '../vendor/three/OrbitControls.js';
import {buildBuilding} from './architecture.js';
import {styleFor} from './model.js';
import {SLOTS} from './model.js';

// A single WebGL context serves every view. Each view has its own scene/camera
// and receives the rendered pixels, avoiding the browser's context-count limit.
let renderer, syncingCamera=false;
const views=new Map(), cameraStates=new Map();
function engine(){
  if(!renderer){renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;}
  return renderer;
}
export function sample(type='Bakery',variant=0){return {id:`sample-${type}`,name:type,type,styleVersion:1,baseline:{variant,footprint:'2x2',awning:type==='Bakery'||type==='Shop'},parameters:{floors:2,width:1,windowWidth:1.1,frameThickness:.1,doorWidth:1,roofPitch:type==='Townhouse'?30:0,overhang:.15},overrides:{}};}
function singleProject(b,style){return {name:'Preview',currentVersion:style.version,styleDraft:style,styles:[style],buildings:[{...b,styleVersion:style.version}],block:{name:b.name,instances:[{id:'preview',buildingId:b.id,slot:'A2',rotation:0}]}};}
function disposeObject(object){object.traverse(n=>{n.shadow?.map?.dispose();n.shadow?.mapPass?.dispose();n.geometry?.dispose();if(n.material){for(const m of Array.isArray(n.material)?n.material:[n.material]){m.map?.dispose();m.dispose();}}});}
function model(project,block,selectedRole,selectedInstance){
  const group=new THREE.Group();
  for(const placement of project.block.instances){
    const b=project.buildings.find(b=>b.id===placement.buildingId),root=buildBuilding(b,styleFor(project,b)),slot=SLOTS.indexOf(placement.slot);
    if(block)root.position.set((slot%3-1)*12,0,(Math.floor(slot/3)-.5)*12);
    root.rotation.y=placement.rotation*Math.PI/180;root.userData={slot:placement.slot,instanceId:placement.id};
    root.traverse(mesh=>{if(!mesh.isMesh)return;mesh.userData.slot=placement.slot;if(selectedRole===mesh.userData.role){mesh.material.emissive.set('#56735a');mesh.material.emissiveIntensity=.06;}});
    if(block&&placement.id===selectedInstance){const bounds=new THREE.Box3().setFromObject(root),outline=new THREE.Box3Helper(bounds,new THREE.Color('#d89b42'));outline.userData.ignorePick=true;group.add(outline);}
    group.add(root);
  }return group;
}
function labelSprite(text){const c=document.createElement('canvas');c.width=128;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#314b3e';ctx.font='600 30px sans-serif';ctx.textAlign='center';ctx.fillText(text,64,44);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.scale.set(2,1,1);return s;}
function buildScene(entry){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e8e7e3');
  scene.add(new THREE.HemisphereLight('#dbeaff','#a2937d',2));
  const sun=new THREE.DirectionalLight('#fff4df',3.2);sun.position.set(-12,24,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);const span=entry.block?35:12;Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:.1,far:100});sun.shadow.normalBias=.035;scene.add(sun);const fill=new THREE.DirectionalLight('#c6d8ee',.7);fill.position.set(5,7,-6);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(entry.block?150:120,entry.block?150:120),new THREE.MeshStandardMaterial({color:'#e8e7e3',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
  const p=entry.block?entry.project:singleProject(entry.b,entry.style);
  const objects=model(p,!!entry.block,entry.selected||'',entry.selectedInstance);scene.add(objects);
  const picks=[];
  if(entry.block){
    for(const [i,slot] of SLOTS.entries()){const x=(i%3-1)*12,z=(Math.floor(i/3)-.5)*12,occupied=p.block.instances.some(p=>p.slot===slot),tile=new THREE.Mesh(new THREE.BoxGeometry(10,.12,10),new THREE.MeshStandardMaterial({color:occupied?'#d3d9c4':'#dfe7d5',roughness:1}));tile.position.set(x,-.025,z);tile.receiveShadow=true;tile.userData.slot=slot;scene.add(tile);picks.push(tile);const label=labelSprite(slot);label.position.set(x,.2,z+4.2);scene.add(label);}
    const street=new THREE.Mesh(new THREE.BoxGeometry(39,.08,2),new THREE.MeshStandardMaterial({color:'#73817e'}));street.position.set(0,-.02,0);scene.add(street);
    for(let x=-18;x<=18;x+=3){const dash=new THREE.Mesh(new THREE.BoxGeometry(1.2,.02,.08),new THREE.MeshBasicMaterial({color:'#f0e9c9'}));dash.position.set(x,.03,0);scene.add(dash);}
  }
  objects.traverse(n=>{if(n.isMesh)picks.push(n);});return {scene,picks,objects};
}
function createView(canvas,entry){
  engine();const camera=new THREE.OrthographicCamera(-6,6,6,-6,.1,500),controls=new OrbitControls(camera,canvas);
  const span=entry.block?40:14,target=entry.block?[0,1,0]:[0,2.8,0];camera.position.set(-span*.72,span*.85,span);controls.target.fromArray(target);controls.minDistance=entry.block?18:5;controls.maxDistance=entry.block?120:40;controls.maxPolarAngle=Math.PI/2-.03;controls.minZoom=.55;controls.maxZoom=2.8;controls.enableDamping=false;controls.update();
  const key=canvas.dataset.viewKey||'preview',saved=cameraStates.get(key);if(saved){camera.position.fromArray(saved.position);camera.zoom=saved.zoom||1;controls.target.fromArray(saved.target);controls.update();}
  const v={canvas,camera,controls,key,entry,signature:'',scene:null,picks:[],cleanup:[]};
  const save=()=>{if(syncingCamera)return;cameraStates.set(key,{position:camera.position.toArray(),target:controls.target.toArray(),zoom:camera.zoom,modelCenterY:v.modelCenterY});renderView(v);syncingCamera=true;try{for(const other of views.values()){if(other!==v&&other.key===key){other.camera.position.copy(camera.position);other.camera.zoom=camera.zoom;other.controls.target.copy(controls.target);other.controls.update();renderView(other);}}}finally{syncingCamera=false;}};controls.addEventListener('change',save);
  let start=null,moved=false;
  const down=e=>{start=[e.clientX,e.clientY];moved=false;};
  const move=e=>{if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)moved=true;};
  const up=e=>{if(!start)return;const wasDrag=moved;start=null;if(wasDrag||!v.scene)return;const bounds=canvas.getBoundingClientRect(),pointer=new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(v.picks)[0];if(!hit)return;const detail=entry.block?{slot:hit.object.userData.slot}:{role:hit.object.userData.role};if((entry.block&&entry.interactive)||(entry.selected&&detail.role))canvas.dispatchEvent(new CustomEvent('worldfarm-pick',{bubbles:true,detail}));};
  const click=e=>{if(moved){e.preventDefault();e.stopPropagation();}};
  const keydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){resetView(v);return;}const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);if(e.key==='ArrowLeft')s.theta-=.15;if(e.key==='ArrowRight')s.theta+=.15;if(e.key==='ArrowUp')s.phi=Math.max(.1,s.phi-.1);if(e.key==='ArrowDown')s.phi=Math.min(Math.PI/2-.03,s.phi+.1);if(e.key==='+')camera.zoom=Math.min(controls.maxZoom,camera.zoom*1.1);if(e.key==='-')camera.zoom=Math.max(controls.minZoom,camera.zoom/1.1);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();save();};
  for(const [event,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['click',click],['keydown',keydown]]){canvas.addEventListener(event,fn);v.cleanup.push(()=>canvas.removeEventListener(event,fn));}
  return v;
}
function renderView(v){if(!v.scene||!v.canvas.isConnected)return;const width=Math.max(1,v.canvas.clientWidth),height=Math.max(1,v.canvas.clientHeight),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(width*dpr),h=Math.round(height*dpr);if(v.canvas.width!==w||v.canvas.height!==h){v.canvas.width=w;v.canvas.height=h;}v.camera.updateMatrixWorld();const aspect=width/height,bounds=new THREE.Box3().setFromObject(v.objects).applyMatrix4(v.camera.matrixWorldInverse),size=bounds.getSize(new THREE.Vector3()),extent=v.entry.block?Math.max(16,22/aspect):Math.max(5.2,size.y*.57,size.x*.57/aspect);v.camera.left=-extent*aspect;v.camera.right=extent*aspect;v.camera.top=extent;v.camera.bottom=-extent;v.camera.updateProjectionMatrix();const r=engine();r.setSize(w,h,false);r.render(v.scene,v.camera);const ctx=v.canvas.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(r.domElement,0,0);v.canvas.dataset.rendered='3d';}
export function paint3D(canvas,entry){
  try{let v=views.get(canvas);if(!v){v=createView(canvas,entry);views.set(canvas,v);}const signature=JSON.stringify(entry);if(signature!==v.signature){if(v.scene)disposeObject(v.scene);Object.assign(v,buildScene(entry));v.signature=signature;v.entry=entry;if(!entry.block){const center=new THREE.Box3().setFromObject(v.objects).getCenter(new THREE.Vector3()),previous=v.modelCenterY??cameraStates.get(v.key)?.modelCenterY??2.8,delta=center.y-previous;v.modelCenterY=center.y;v.camera.position.y+=delta;v.controls.target.y+=delta;v.controls.update();}}renderView(v);}catch(error){canvas.dataset.rendered='error';if(!canvas.parentElement.querySelector('.webgl-error')){const message=document.createElement('p');message.className='webgl-error';message.textContent='3D could not start. Enable WebGL / hardware acceleration, then reload.';canvas.after(message);}console.error('World Farm 3D:',error);}
}
export function disposeViews(){for(const v of views.values()){v.controls.dispose();v.cleanup.forEach(fn=>fn());if(v.scene)disposeObject(v.scene);}views.clear();}
function resetView(v){const span=v.entry.block?40:14;v.camera.position.set(-span*.72,span*.85,span);v.camera.zoom=1;v.controls.target.fromArray(v.entry.block?[0,1,0]:[0,v.modelCenterY??2.8,0]);if(!v.entry.block)v.camera.position.y+=(v.modelCenterY??2.8)-2.8;v.controls.update();renderView(v);}
export function resetCameras(){for(const v of views.values())resetView(v);}
export function blockPNG(){const view=[...views.values()].find(v=>v.entry.block);if(!view)throw new Error('Open the 3D block review before exporting a PNG.');renderView(view);const result=document.createElement('canvas');result.width=view.canvas.width;result.height=view.canvas.height;result.getContext('2d').drawImage(view.canvas,0,0);return result;}
