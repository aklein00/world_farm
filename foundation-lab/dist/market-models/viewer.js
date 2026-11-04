import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const styles = [
  ['04C', 'Peach Modern', -1], ['04D', 'Rose Twilight', -1],
  ['03B', 'Honey Corners', 1], ['03A', 'Soft Blocks', 1],
  ['01D', 'Copper Rooftops', -1], ['02D', 'Amber Afterglow', 1],
];
const builds = [['threejs', 'Three.js'], ['blender', 'Blender']];
const lighting = {
  day: { background: 0xe4e6dd, key: 0xfff4df, power: 3.2, ambient: 2 },
  golden: { background: 0xeadcc9, key: 0xffce92, power: 3.6, ambient: 1.6 },
  dusk: { background: 0x9b9bb4, key: 0xecc3e2, power: 1.9, ambient: 1.15 },
};

const comparisons = document.querySelector('#comparisons');
const summary = document.querySelector('#summary');
const cards = [];

for (const [id, name, cameraSide] of styles) {
  const code = id.slice(0, 2) + '.' + id.slice(2);
  const pair = document.createElement('section');
  pair.className = 'pair';
  pair.setAttribute('aria-labelledby', 'style-' + id);
  pair.innerHTML = `<div class="pair-heading"><span class="style-code">${code}</span><h2 id="style-${id}">${name}</h2></div><div class="models"></div>`;
  comparisons.append(pair);
  for (const [source, label] of builds) {
    const url = `./assets/${source}/${id}-market-${source}.glb?rev=concept`;
    const figure = document.createElement('figure');
    figure.className = 'model';
    figure.innerHTML = `<div class="stage"><canvas aria-label="${code} ${name}, ${label} 3D model" hidden></canvas><span class="model-status">Loading…</span></div><figcaption><strong>${label}</strong><a href="${url}" download aria-label="Download ${code} ${name} ${label} GLB">GLB ↓</a><span class="stats"></span></figcaption>`;
    pair.querySelector('.models').append(figure);
    cards.push({
      url,
      cameraSide,
      canvas: figure.querySelector('canvas'),
      status: figure.querySelector('.model-status'),
      stats: figure.querySelector('.stats'),
    });
  }
}

// A shared renderer draws into each card's 2D canvas on demand.
// This keeps twelve interactive views within a single WebGL context.
function startViewer() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch {
    document.querySelector('#graphics-error').hidden = false;
    summary.textContent = '12 GLBs available';
    for (const card of cards) card.status.textContent = '3D preview unavailable';
    return;
  }

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.025;
  ground.receiveShadow = true;
  scene.add(ground);
  const ambient = new THREE.HemisphereLight(0xdbeaff, 0xa2937d, 2);
  const key = new THREE.DirectionalLight(0xfff4df, 3.2);
  key.position.set(-7, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 9, bottom: -6, far: 40 });
  key.shadow.normalBias = .025;
  key.shadow.bias = -.0002;
  const fill = new THREE.DirectionalLight(0xc6d8ee, .7);
  fill.position.set(5, 7, -6);
  scene.add(ambient, key, fill);

  const dirty = new Set();
  let frame = 0;
  function draw(card) {
    const { canvas, camera, model } = card;
    const scale = Math.min(devicePixelRatio, 1.75);
    const width = Math.round(canvas.clientWidth * scale);
    const height = Math.round(canvas.clientHeight * scale);
    if (!width || !height) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
      renderer.setSize(width, height, false);
    }
    camera.left = -5.35 * width / height;
    camera.right = 5.35 * width / height;
    camera.updateProjectionMatrix();
    scene.add(model);
    renderer.render(scene, camera);
    card.context.drawImage(renderer.domElement, 0, 0);
    scene.remove(model);
  }

  function queue(card) {
    if (!card.model) return;
    dirty.add(card);
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      for (const pending of dirty) draw(pending);
      dirty.clear();
    });
  }

  function applyLighting(value) {
    const preset = lighting[value];
    scene.background.set(preset.background);
    ground.material.color.set(preset.background);
    key.color.set(preset.key);
    key.intensity = preset.power;
    ambient.intensity = preset.ambient;
    cards.forEach(queue);
  }

  const light = document.querySelector('#light');
  light.addEventListener('change', () => applyLighting(light.value));
  document.querySelector('#reset').addEventListener('click', () => {
    for (const card of cards) card.controls?.reset();
  });
  applyLighting(light.value);

  const loader = new GLTFLoader();
  let ready = 0;
  let failed = 0;
  for (const card of cards) {
    loader.load(card.url, ({ scene: model }) => {
      let triangles = 0;
      model.traverse((node) => {
        if (!node.isMesh) return;
        node.castShadow = true;
        node.receiveShadow = true;
        triangles += (node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3;
      });
      card.model = model;
      card.camera = new THREE.OrthographicCamera(-5.35, 5.35, 5.35, -5.35, .1, 100);
      card.camera.position.set(10 * card.cameraSide, 12, 14);
      card.context = card.canvas.getContext('2d', { alpha: false });
      card.controls = new OrbitControls(card.camera, card.canvas);
      card.controls.target.set(0, 2.8, 0);
      card.controls.enablePan = false;
      card.controls.maxPolarAngle = Math.PI * .49;
      card.controls.minZoom = .65;
      card.controls.maxZoom = 2.7;
      card.controls.update();
      card.controls.saveState();
      card.controls.addEventListener('change', () => queue(card));
      card.canvas.hidden = false;
      card.status.hidden = true;
      card.stats.textContent = `${triangles.toLocaleString()} triangles`;
      new ResizeObserver(() => queue(card)).observe(card.canvas);
      ready += 1;
      summary.textContent = `${ready} / 12 loaded${failed ? ` · ${failed} unavailable` : ''}`;
      queue(card);
    }, undefined, () => {
      failed += 1;
      card.status.textContent = 'Could not load this model';
      summary.textContent = `${ready} / 12 loaded · ${failed} unavailable`;
    });
  }
}

startViewer();
