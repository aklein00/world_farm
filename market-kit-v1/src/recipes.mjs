// Meters, +Y up and +Z storefront. Dimensions come from the market in each concept panel.
export const variants = [
  { id: '04C', name: 'Peach Modern', wall: '#e3a893', trim: '#ffe4d0', accent: '#d97e80', roof: '#df907e', glass: '#536b7c', glow: '#f5b778', bevel: .025, side: -1 },
  { id: '04D', name: 'Rose Twilight', wall: '#ce90ac', trim: '#efcfdf', accent: '#e180a4', roof: '#be7296', glass: '#68607a', glow: '#ffc37b', bevel: .045, side: -1 },
  { id: '03B', name: 'Honey Corners', wall: '#d7934c', trim: '#ffe0a5', accent: '#d95e32', roof: '#d4682f', glass: '#4f7290', glow: '#efc576', bevel: .095, side: 1 },
  { id: '03A', name: 'Soft Blocks', wall: '#e9a778', trim: '#ffdfb4', accent: '#e16c4c', roof: '#ee9b77', glass: '#55728b', glow: '#e9ca9a', bevel: .085, side: 1 },
  { id: '01D', name: 'Copper Rooftops', wall: '#c39b77', trim: '#edc99c', accent: '#d96742', roof: '#b86337', glass: '#45657c', glow: '#eac28a', bevel: .025, side: -1 },
  { id: '02D', name: 'Amber Afterglow', wall: '#a96350', trim: '#e5b58c', accent: '#db6948', roof: '#b76347', glass: '#5d4c54', glow: '#ffb65f', bevel: .018, side: 1 },
];
export const roles = ['wall', 'trim', 'accent', 'roof', 'glass', 'glow', 'green', 'dark'];

function outline(w, d, radius) {
  if (!radius) return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  const x = w / 2 - radius;
  const z = d / 2 - radius;
  const centers = [[x, z], [-x, z], [-x, -z], [x, -z]];
  return centers.flatMap(([cx, cz], i) => Array.from({ length: 5 }, (_, j) => {
    const angle = (i + j / 4) * Math.PI / 2;
    return [cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius];
  }));
}

function extrusion(w, h, d, radius, rim) {
  const outer = outline(w, d, radius);
  const n = outer.length;
  const loop = (points, y) => points.map(([x, z]) => [x, y, z]);
  const vertices = [...loop(outer, -h / 2), ...loop(outer, h / 2)];
  const faces = [];
  if (rim) {
    const inner = outline(w - 2 * rim, d - 2 * rim, radius ? Math.max(.04, radius - rim) : 0);
    vertices.push(...loop(inner, -h / 2), ...loop(inner, h / 2));
  } else {
    faces.push(Array.from({ length: n }, (_, i) => i));
    faces.push(Array.from({ length: n }, (_, i) => 2 * n - i - 1));
  }
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    faces.push([i, n + i, n + j, j]);
    if (!rim) continue;
    faces.push([n + i, 3 * n + i, 3 * n + j, n + j]);
    faces.push([i, j, 2 * n + j, 2 * n + i]);
    faces.push([2 * n + i, 2 * n + j, 3 * n + j, 3 * n + i]);
  }
  return { vertices, faces };
}

export function recipe(v) {
  const parts = [];
  const emissive = v.id === '02D' || v.id === '04D';
  const b = v.bevel;
  const box = (name, p, s, mat = 'wall', bevel = b, rx = 0) => {
    parts.push({ type: 'box', name, p, s, mat, bevel: Math.min(bevel, ...s.map(n => n * .23)), rx });
  };
  const form = (name, p, s, mat, radius, rim = 0, bevel = .025) => {
    parts.push({ type: 'mesh', name, p, s, mat, bevel, ...extrusion(...s, radius, rim) });
  };
  const hip = (name, p, s, taper = [.27, .16]) => {
    parts.push({ type: 'hip', name, p, s, mat: 'roof', bevel: 0, taper });
  };
  function body(w, d, height, radius = 0) {
    if (radius) {
      form('Rounded foundation', [0, .1, 0], [w + .19, .2, d + .19], 'trim', radius + .055);
      form('Rounded wall mass', [0, .2 + height / 2, 0], [w, height, d], 'wall', radius, 0, .04);
    } else {
      box('Foundation', [0, .1, 0], [w + .16, .2, d + .16], 'trim');
      box('Wall mass', [0, .2 + height / 2, 0], [w, height, d]);
    }
  }
  function roof(w, d, y, { rim = .24, height = .24, radius = 0, deck = 'roof' } = {}) {
    const slab = [w, .16, d];
    if (radius) form('Continuous roof slab', [0, y - .08, 0], slab, 'trim', radius);
    else box('Roof slab', [0, y - .08, 0], slab, 'trim');
    box('Inset roof deck', [0, y + .025, 0], [w - 2 * rim + .08, .05, d - 2 * rim + .08], deck);
    form('Continuous roof rim', [0, y + height / 2, 0], [w, height, d], 'trim', radius, rim, Math.min(.055, height * .2));
  }
  function frontFrame(name, x, y, z, w, h, { border = .1, mat = 'glass', surround = 'trim', depth = .13 } = {}) {
    box(name + ' surround', [x, y, z + depth / 2], [w + 2 * border, h + 2 * border, depth], surround);
    box(name + ' pane', [x, y, z + depth + .014], [w, h, .038], mat, .009);
  }
  function sideFrame(side, x, y, z, w, h, { border = .1, mat = 'glass', surround = 'trim' } = {}) {
    box('Side window surround', [side * (x + .05), y, z], [.13, h + 2 * border, w + 2 * border], surround);
    box('Side window pane', [side * (x + .13), y, z], [.04, h, w], mat, .009);
  }
  function canopy(w, y, front, { stripes = 7, projection = 1.05, drop = .23, round = .045 } = {}) {
    const step = w / stripes;
    for (let i = 0; i < stripes; i += 1) {
      const x = (i - (stripes - 1) / 2) * step;
      const color = i % 2 === 0 ? 'accent' : 'trim';
      box('Sloped awning stripe ' + (i + 1), [x, y, front + projection * .46], [step, .18, projection], color, round, .24);
      box('Awning valance ' + (i + 1), [x, y - .13 - drop / 2, front + projection * .93], [step, drop, .17], color, round);
    }
  }
  function shop(front, width, height, { mat = 'glass', border = .08, sideBays = true, surround = 'trim' } = {}) {
    const door = sideBays ? width * .34 : width * .51;
    frontFrame('Entry', 0, .21 + height / 2, front, door, height, { border, mat, surround });
    const paneZ = front + .171;
    box('Door divider', [0, .21 + height / 2, paneZ], [.052, height, .05], surround, .008);
    for (const x of [-.10, .10]) box('Entry pull', [x, .92, paneZ + .033], [.025, .21, .04], 'trim', .004);
    if (sideBays) {
      const pane = (width - door) / 2 - .21;
      for (const x of [-(door + pane) / 2 - .12, (door + pane) / 2 + .12]) {
        frontFrame('Display', x, .31 + height * .46, front, pane, height * .86, { border, mat, surround });
      }
    }
    box('Entry threshold', [0, .065, front + .18], [door + .26, .13, .55], 'trim');
  }
  function sideBays(w, positions, upper, lower, { mat = 'glass', tall = .94, surround = 'trim' } = {}) {
    for (const side of [-1, 1]) {
      for (const z of positions) {
        sideFrame(side, w / 2, upper, z, .76, tall, { mat, surround, border: .075 });
        sideFrame(side, w / 2, lower, z, .71, tall * 1.08, { mat, surround, border: .075 });
      }
    }
  }
  function rear(w, d, upper) {
    for (const x of [-w * .23, w * .23]) {
      box('Rear window trim', [x, upper, -d / 2 - .055], [.91, 1.05, .13], 'trim');
      box('Rear window', [x, upper, -d / 2 - .13], [.73, .85, .04], 'glass', .008);
    }
    box('Rear service door', [0, 1.12, -d / 2 - .055], [.96, 1.84, .13], 'dark');
  }
  function planter(x, y, z, width, depth) {
    box('Planter trough', [x, y, z], [width, .31, depth], 'trim', .055);
    for (let i = 0; i < 5; i += 1) {
      box('Clipped hedge block', [x + (i - 2) * width / 5.2, y + .25, z], [width / 5, .35 + (i % 2) * .055, depth - .10], 'green', .075);
    }
  }

  switch (v.id) {
    case '03B': {
      const w = 5.35;
      const d = 4.9;
      body(w, d, 4.37);
      // Heavy, stepped posts run uninterrupted from their plinths to oversized roof caps.
      for (const x of [-w / 2 + .025, w / 2 - .025]) {
        for (const z of [-d / 2 + .035, d / 2 - .035]) {
          box('Corner plinth', [x, .35, z], [.93, .7, .93], 'wall', .115);
          box('Lower corner pier', [x, 1.42, z], [.79, 1.66, .79], 'wall', .09);
          box('Corner collar', [x, 2.33, z], [.9, .22, .9], 'trim', .045);
          box('Upper corner pier', [x, 3.44, z], [.72, 2.03, .72], 'wall', .10);
          box('Roof corner capital', [x, 4.70, z], [1.03, .62, 1.03], 'trim', .125);
        }
      }
      box('Wide upper facade belt', [0, 2.56, 0], [w + .24, .31, d + .24], 'trim', .07);
      roof(w + .36, d + .31, 4.57, { rim: .30, height: .21 });
      hip('Broad clay hip roof', [0, 5.05, -.06], [4.87, 1.03, 4.30], [.13, .12]);
      for (const x of [-1.10, 1.10]) frontFrame('Wide upper bay', x, 3.67, d / 2, 1.34, .78, { border: .15, depth: .19 });
      shop(d / 2, 4.40, 1.59, { border: .085 });
      canopy(4.77, 2.42, d / 2, { projection: 1.14, drop: .35, round: .066 });
      sideBays(w, [-1.19, .98], 3.64, 1.30, { tall: .88 });
      rear(w, d, 3.66);
      break;
    }
    case '03A': {
      const w = 5.48;
      const d = 4.86;
      body(w, d, 4.08, .43);
      roof(w + .34, d + .34, 4.35, { rim: .38, height: .28, radius: .58 });
      box('Offset soft roof block', [-1.48, 4.70, -1.34], [1.08, .62, 1.06], 'trim', .137);
      for (const x of [-1.12, 1.12]) frontFrame('Small horizontal window', x, 3.27, d / 2, 1.21, .68, { border: .065 });
      shop(d / 2, 4.5, 1.55, { border: .055 });
      canopy(5.05, 2.29, d / 2, { projection: 1.00, drop: .32, round: .06 });
      sideBays(w, [-1.13, .99], 3.30, 1.25, { tall: .82, surround: 'wall' });
      rear(w, d, 3.32);
      break;
    }
    case '01D': {
      const w = 6.12;
      const d = 4.68;
      body(w, d, 5.06);
      roof(w + .32, d + .29, 5.29, { rim: .25, height: .20, deck: 'trim' });
      box('Facade stringcourse', [0, 2.75, 0], [w + .25, .24, d + .25], 'trim');
      box('Pavilion base', [-.28, 5.41, -.35], [3.50, .28, 2.68], 'dark');
      hip('Copper terrace pavilion', [-.28, 5.91, -.35], [3.53, .79, 2.72], [.075, .22]);
      // Copper ridges follow the roof planes. The solar panel on the concept's apartment stays there.
      const ridgeRise = .79;
      const ridgeRun = 2.72 * (.5 - .22);
      const ridgeLength = Math.hypot(ridgeRise, ridgeRun);
      for (const side of [-1, 1]) {
        box('Raised copper standing seam', [-.28, 5.92, -.35 + side * (2.72 * .22 + ridgeRun / 2)], [.038, .043, ridgeLength], 'accent', .005, side * Math.atan2(ridgeRise, ridgeRun));
      }
      planter(2.43, 5.43, .25, .52, 1.62);
      planter(-2.33, 5.43, 1.78, 1.03, .41);
      planter(.82, 5.43, -1.85, 1.20, .40);
      for (const x of [-2.62, -1.29, 0, 1.29, 2.62]) {
        box('Slender stone pilaster', [x, 3.94, d / 2 + .08], [.16, 2.15, .23], 'trim');
      }
      for (const x of [-1.98, -.65, .65, 1.98]) frontFrame('Tall upper bay', x, 3.99, d / 2, .74, 1.34);
      shop(d / 2, 5.15, 1.97);
      canopy(5.49, 2.54, d / 2, { stripes: 9, projection: 1.02, drop: .22 });
      sideBays(w, [-1.45, 0, 1.43], 4.02, 1.38, { tall: 1.24 });
      rear(w, d, 4.02);
      break;
    }
    case '02D': {
      const w = 5.71;
      const d = 5.05;
      body(w, d, 4.82);
      roof(w + .35, d + .35, 5.01, { rim: .28, height: .27 });
      hip('Low faceted inset roof', [0, 5.16, 0], [w - .48, .32, d * .93], [.16, .14]);
      for (const [x, z, size, h] of [[.64, -.76, .96, .67], [-.79, 1.15, .71, .43]]) {
        box('Low roof vent housing', [x, 5.18 + h / 2, z], [size, h, size * .82], 'dark');
        box('Roof vent lid', [x, 5.22 + h, z], [size + .08, .095, size * .88], 'trim');
        for (let i = -1; i <= 1; i += 1) box('Vent louver', [x, 5.28 + h, z + i * .16], [size * .64, .033, .045], 'dark', 0);
      }
      box('Terracotta awning ledge', [0, 2.54, d / 2], [w - .18, .23, .30], 'roof');
      for (const x of [-1.72, 0, 1.72]) frontFrame('Amber upper window', x, 3.79, d / 2, 1.03, .82, { mat: 'glow', surround: 'roof', depth: .17 });
      shop(d / 2, 4.92, 1.83, { mat: 'glow', surround: 'dark' });
      canopy(5.25, 2.45, d / 2, { projection: 1.17, drop: .29, round: .022 });
      sideBays(w, [-1.35, .58], 3.75, 1.40, { mat: 'glow', tall: 1.04, surround: 'roof' });
      rear(w, d, 3.76);
      break;
    }
    case '04C': {
      const w = 5.65;
      const d = 4.28;
      body(w, d, 5.36);
      roof(w + .29, d + .25, 5.59, { rim: .19, height: .16 });
      for (const x of [-1.42, 0, 1.42]) box('Raised roof beam', [x, 5.85, -.13], [.35, .49, 2.59], 'trim');
      box('Broad balcony slab', [0, 3.13, d / 2 + .16], [5.43, .27, .57], 'trim');
      planter(.22, 3.39, d / 2 + .17, 4.61, .52);
      for (const x of [-1.68, 0, 1.68]) frontFrame('Upper ribbon glazing', x, 4.32, d / 2, 1.39, .93, { border: .065 });
      box('Cream base course', [0, .33, 0], [w + .1, .29, d + .10], 'trim');
      shop(d / 2, 4.91, 2.03, { border: .065 });
      canopy(4.87, 2.58, d / 2, { projection: .95, drop: .28 });
      sideBays(w, [-.98, .85], 4.19, 1.38, { tall: 1.18, surround: 'wall' });
      rear(w, d, 4.17);
      break;
    }
    case '04D': {
      const w = 5.86;
      const d = 4.48;
      body(w, d, 5.0);
      roof(w + .31, d + .29, 5.23, { rim: .21, height: .19 });
      const cap = [-.95, 5.57, -.41];
      box('Low rose roof cap', cap, [2.15, .60, 1.83], 'wall');
      form('Inset crown on roof cap', [cap[0], 5.93, cap[2]], [2.29, .14, 1.97], 'trim', 0, .12);
      box('Wraparound balcony belt', [0, 3.04, .08], [w + .3, .30, d + .35], 'trim');
      planter(.36, 3.36, d / 2 + .23, 4.81, .62);
      for (const x of [-1.76, 0, 1.76]) frontFrame('Lit upper ribbon bay', x, 4.02, d / 2, 1.42, .98, { mat: 'glow', border: .065 });
      shop(d / 2, 4.94, 1.88, { border: .07 });
      canopy(4.91, 2.60, d / 2, { projection: 1.09, drop: .28 });
      sideBays(w, [-1.09, .91], 4.0, 1.42, { mat: 'glow', tall: 1.10, surround: 'wall' });
      for (const side of [-1, 1]) {
        box('Recessed warm cornice light', [side * (w / 2 + .07), 2.84, -.24], [.064, .075, 2.35], 'glow', .009);
      }
      rear(w, d, 4.01);
      break;
    }
    default:
      throw new Error('Unknown market concept ' + v.id);
  }

  const fallbackColors = { green: '#82994a', dark: '#514447' };
  return {
    id: v.id, name: v.name, units: 'meters', up: 'Y', front: '+Z', parts,
    palette: Object.fromEntries(roles.map(role => [role, v[role] ?? fallbackColors[role]])),
    bevelSegments: v.id === '03A' || v.id === '03B' ? 2 : 1,
    cameraSide: v.side,
    emissive,
  };
}
