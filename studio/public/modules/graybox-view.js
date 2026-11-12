import * as THREE from '../vendor/three/three.module.js';
import {OrbitControls} from '../vendor/three/OrbitControls.js';
let renderer,cleanup;
export function showModel(canvas,model,world=false){
 if(cleanup)cleanup();
 try{renderer??=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch{canvas.replaceWith(Object.assign(document.createElement('p'),{textContent:'3D preview requires WebGL. Your recipe can still be saved and exported.'}));return;}
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e7e8df');scene.add(new THREE.HemisphereLight('#fffdf2','#a4b6b2',2.4));const light=new THREE.DirectionalLight('#fff7dc',2.6);light.position.set(-10,24,16);scene.add(light);scene.add(model);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z,8)*.72;
 const camera=new THREE.OrthographicCamera();camera.position.copy(center).add(new THREE.Vector3(1.3,1.2,1.5).multiplyScalar(span));camera.lookAt(center);
 const controls=new OrbitControls(camera,canvas);controls.target.copy(center);controls.enableDamping=false;controls.minZoom=.35;controls.maxZoom=4;
 const ctx=canvas.getContext('2d');
 function render(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),ratio=w/h;canvas.width=Math.round(w*devicePixelRatio);canvas.height=Math.round(h*devicePixelRatio);renderer.setSize(canvas.width,canvas.height,false);camera.left=-span*ratio;camera.right=span*ratio;camera.top=span;camera.bottom=-span;camera.near=.01;camera.far=1000;camera.updateProjectionMatrix();renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0);}
 controls.addEventListener('change',render);const observer=new ResizeObserver(render);observer.observe(canvas);render();
 cleanup=()=>{observer.disconnect();controls.dispose();model.traverse(n=>{n.geometry?.dispose();if(n.material)for(const m of(Array.isArray(n.material)?n.material:[n.material]))m.dispose();});cleanup=null;};
}
export function clearView(){cleanup?.();}
