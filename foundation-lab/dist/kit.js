import * as THREE from 'three';
export const directions = [
 {id:'warm',name:'Warm corner',subtitle:'A neighborhood classic, with a little swagger.',description:'Terracotta masonry, deep teal trim and a generous striped canopy. Familiar, tactile and welcoming.',colors:['#cf795a','#315c55','#eed9b1','#759259'],wall:0xcf795a,trim:0x315c55,roof:0x476c61,accent:0xe4bc68},
 {id:'terrace',name:'Stacked garden',subtitle:'Stepped forms. A small pocket of green.',description:'Layered cream volumes, broad planted terraces and coral accents. A playful silhouette with room to grow.',colors:['#e4d7b8','#ce6e52','#506d55','#adb88b'],wall:0xe4d7b8,trim:0xce6e52,roof:0x62816b,accent:0xc37856},
 {id:'frame',name:'City frame',subtitle:'Confident structure. A brighter city beat.',description:'A bold blue structural frame, mustard infill and deep window reveals. Graphic, urban and deliberately chunky.',colors:['#49777f','#d5ad61','#e1d6b7','#354853'],wall:0xd5ad61,trim:0x49777f,roof:0x354853,accent:0xf0c76c}
];
const geo=new THREE.BoxGeometry(1,1,1);
export function createMarket(index=0,{clay=false,context=true}={}){
 const d=directions[index],g=new THREE.Group(),details=new THREE.Group();details.name='Street details';g.add(details);details.visible=context;
 const materials=new Map();
 function mat(color,glow=false){const key=color+':'+glow;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color:clay?0xc5c4b8:color,roughness:.84,metalness:0,emissive:glow&&!clay?0xffbb64:0x000000,emissiveIntensity:glow?.22:0}));return materials.get(key);}
 function box(name,x,y,z,w,h,depth,color,parent=g,glow=false){const m=new THREE.Mesh(geo,mat(color,glow));m.name=name;m.position.set(x,y,z);m.scale.set(w,h,depth);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 box('Site / plinth',0,-.25,0,11,.45,9,0xa2ac8d);box('Sidewalk',0,.02,-.3,8,.18,6.8,0xd3cdbb);box('Street',0,-.01,3.9,11,.18,1.15,0x697979);
 for(let i=-4;i<5;i++)box('Curb segment',i,.12,3.2,.95,.27,.22,0xe4dbc7);
 for(let i=-4;i<5;i+=2)box('Road marking',i,.095,3.95,.8,.012,.08,0xece7c9);
 box('Ground floor shell',0,1.35,-.45,6,2.55,4.2,d.wall);
 box('Raised base',0,.25,-.45,6.2,.3,4.35,d.trim);
 box('Storefront recess',0,1.35,1.68,5.35,1.95,.08,0x203f43);
 for(const x of [-2.45,-.85,.85,2.45])box('Storefront mullion',x,1.35,1.79,.17,2.1,.25,d.trim);
 for(const x of [-1.65,1.65]){box('Window glow',x,1.34,1.73,1.35,1.65,.08,0xe5c68c,g,true);for(let i=0;i<3;i++)box('Shop shelf',x,.72+i*.45,1.82,1.25,.065,.1,d.trim);}
 box('Entrance door',0,1.27,1.81,1.35,1.85,.08,0x3f6466);box('Door handle',.43,1.2,1.89,.06,.3,.09,0xf4d28c);
 box('Canopy fascia',0,2.48,2.04,6.65,.42,1.12,d.trim);
 if(index===0){for(let i=0;i<11;i++)box('Canopy stripe',-3+i*.6,2.72,2.04,.3,.06,1.15,0xf3ddb8);box('Upper storey',0,3.55,-.64,5.85,1.8,3.8,d.wall);box('Heavy cornice',0,4.51,-.64,6.25,.34,4.15,0xe7c598);box('Inset roof',0,4.68,-.64,5.65,.08,3.55,d.roof);}
 if(index===1){box('Terrace slab',0,2.87,-.5,6.45,.35,4.4,0xf3e7ce);box('Stepped upper floor',-.65,3.65,-1,4.3,1.5,2.85,d.wall);box('Upper roof slab',-.65,4.49,-1,4.7,.27,3.25,d.trim);box('Roof studio',-.8,4.92,-1.2,2.25,.6,1.8,d.wall);box('Studio cap',-.8,5.28,-1.2,2.5,.16,2.05,d.roof);for(const x of [1.9,2.6]){box('Terrace planter',x,3.13,.5,.52,.36,1.1,0xb88561);box('Terrace foliage',x,3.44,.5,.62,.45,1.2,0x708956);}}
 if(index===2){box('Upper floor',0,3.55,-.65,5.8,1.9,3.8,d.wall);for(const x of [-3,0,3])box('Structural column',x,2.6,1.27,.42,4.9,.6,d.trim);box('Top frame',0,5.02,-.55,6.45,.45,4.4,d.trim);box('Roof inset',0,4.9,-.6,5.5,.1,3.5,d.roof);box('Offset rooftop marker',2.4,5.56,-1.65,1.1,.75,1.25,d.accent);for(const x of [-1.6,1.6])box('Sunshade',x,4.25,1.6,2.1,.2,.85,0xf0dfb8);}
 const windowXs=index===1?[-1.8,-.25]:[-1.9,0,1.9];for(const x of windowXs){box('Upper window frame',x,3.63,index===1?.46:1.31,1.18,1.08,.18,d.trim);box('Upper window',x,3.63,index===1?.57:1.42,.88,.78,.08,0x344f54);box('Window sill',x,3.08,index===1?.63:1.48,1.38,.15,.37,0xe9d3ab);}
 for(const z of [-1.5,.2]){box('Side window frame',3.04,1.45,z,.12,1.3,1.1,d.trim);box('Side window glass',3.12,1.45,z,.05,1.05,.85,0x526b67);}
 box('Market sign board',0,2.43,2.63,2.8,.42,.12,0xf3e4c4);
 const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#f3e4c4';ctx.fillRect(0,0,512,96);ctx.fillStyle='#294b42';ctx.font='bold 57px sans-serif';ctx.textAlign='center';ctx.fillText('CORNER MARKET',256,67);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.68,.38),new THREE.MeshBasicMaterial({map:tex,color:clay?0xc5c4b8:0xffffff}));sign.position.set(0,2.43,2.699);sign.name='Editable sign texture';g.add(sign);
 for(const x of [-4.15,4.15]){box('Tree planter',x,.28,-1,.9,.45,.95,0xe4d2ac,details);box('Tree trunk',x,1.2,-1,.18,1.7,.2,0x806349,details);box('Tree canopy lower',x,2.05,-1,1.15,.85,1.1,0x59754f,details);box('Tree canopy upper',x-.15,2.6,-1.1,.9,.6,.85,0x7b9259,details);}
 for(const x of [-2.3,-1.6]){box('Produce crate',x,.56,2.55,.6,.65,.6,0x997752,details);for(let j=0;j<4;j++)box('Produce block',x+(j%2-.5)*.2,.94,2.55+(Math.floor(j/2)-.5)*.2,.18,.18,.18,j%2?0xdba459:0x86a05c,details);}
 box('Bench seat',3.4,.58,2.3,1.5,.17,.45,0xb6915f,details);for(const x of [2.9,3.9])box('Bench leg',x,.31,2.3,.12,.42,.3,0x354e46,details);
 box('Lamp post',-3.65,1.8,2.5,.14,3.4,.14,0x3a5350,details);box('Lamp head',-3.65,3.56,2.5,.62,.18,.38,0xe4c97e,details,true);
 box('Car body',2.1,.37,4,1.8,.5,.7,0xc28254,details);box('Car cabin',2,.72,4,.95,.38,.65,0x36575a,details);for(const x of [1.5,2.7])for(const z of [3.65,4.35])box('Car wheel',x,.2,z,.3,.3,.12,0x35423c,details);
 g.userData={kitVersion:'0.1.0',assetId:'wf-market',variant:d.id,footprint:[6,4.2]};return g;
}
export const lights={golden:{sky:0xe5e8dc,key:0xffd5a4,intensity:3.1,ambient:1.7},day:{sky:0xe1e9e7,key:0xfff4e2,intensity:2.6,ambient:2.2},blue:{sky:0xc9d5df,key:0xfbc89b,intensity:2.4,ambient:1.15}};
export function makeStudio(container,index=0,interactive=false){
 const scene=new THREE.Scene();scene.background=new THREE.Color(lights.golden.sky);const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;container.appendChild(renderer.domElement);
 const camera=new THREE.OrthographicCamera(-9,9,7,-7,.1,100);camera.position.set(12,10,14);camera.lookAt(0,1.6,0);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:lights.golden.sky,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.49;ground.receiveShadow=true;scene.add(ground);
 const hemi=new THREE.HemisphereLight(0xe4f0ff,0x8a8b67,1.7);scene.add(hemi);const key=new THREE.DirectionalLight(0xffd5a4,3.1);key.position.set(-6,10,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:50});key.shadow.normalBias=.03;key.shadow.bias=-.00015;key.shadow.radius=4;scene.add(key);const fill=new THREE.DirectionalLight(0xbdd6e7,.7);fill.position.set(6,5,-7);scene.add(fill);
 let model=createMarket(index);scene.add(model);
 function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,span=interactive?7.25:6.9;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();render();}
 function render(){renderer.render(scene,camera);}
 function update(i,clay,context,light,angle,exposure){scene.remove(model);model.traverse(n=>{if(n.isMesh){if(n.geometry!==geo)n.geometry.dispose();if(n.material.map)n.material.map.dispose();}});const mats=new Set();model.traverse(n=>{if(n.isMesh)mats.add(n.material)});mats.forEach(m=>m.dispose());model=createMarket(i,{clay,context});scene.add(model);const l=lights[light];scene.background.set(l.sky);ground.material.color.set(l.sky);key.color.set(l.key);key.intensity=l.intensity;hemi.intensity=l.ambient;key.position.set(Math.sin(angle*Math.PI/180)*10,10,Math.cos(angle*Math.PI/180)*10);renderer.toneMappingExposure=exposure;render();}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();return {scene,camera,renderer,render,update,resize};
}
