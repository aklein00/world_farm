# WorldFarm market kit v1

Six market buildings, constructed separately with native Three.js geometry and native Blender meshes. Each style has its own dimensions and facade layout. The Three.js and Blender versions use the same visual recipe for each style, with fewer bevel segments in the Three.js build.

Match each model to the market in its approved concept panel. Compare the silhouette, floor proportions, window count, corner treatment, canopy and roof from the concept camera before publishing either export. Ask which details to prioritize when the reference is ambiguous.

| Style | Name | Three.js GLB | Blender GLB | Editable Blender |
| --- | --- | --- | --- | --- |
| 04.C | Peach Modern | [GLB](threejs/04C-market-threejs.glb) | [GLB](blender/04C-market-blender.glb) | [blend](blender/04C-market.blend) |
| 04.D | Rose Twilight | [GLB](threejs/04D-market-threejs.glb) | [GLB](blender/04D-market-blender.glb) | [blend](blender/04D-market.blend) |
| 03.B | Honey Corners | [GLB](threejs/03B-market-threejs.glb) | [GLB](blender/03B-market-blender.glb) | [blend](blender/03B-market.blend) |
| 03.A | Soft Blocks | [GLB](threejs/03A-market-threejs.glb) | [GLB](blender/03A-market-blender.glb) | [blend](blender/03A-market.blend) |
| 01.D | Copper Rooftops | [GLB](threejs/01D-market-threejs.glb) | [GLB](blender/01D-market-blender.glb) | [blend](blender/01D-market.blend) |
| 02.D | Amber Afterglow | [GLB](threejs/02D-market-threejs.glb) | [GLB](blender/02D-market-blender.glb) | [blend](blender/02D-market.blend) |

## Concept match

| Style | Details modeled from the market in the panel |
| --- | --- |
| 04.C Peach Modern | Taller, shallower peach shell, three roof beams, full-width balcony planter, pink canopy |
| 04.D Rose Twilight | Wide belt and planted balcony, recessed rose roof cap, glowing windows |
| 03.B Honey Corners | Full-height projecting piers with stepped bases, collars and caps, two broad upper windows, broad clay hip |
| 03.A Soft Blocks | Lower rounded walls and continuous rounded roof rim, small roof block, two simple upper windows |
| 01.D Copper Rooftops | Tall framed bays, slender pilasters, copper pavilion on a planted roof terrace |
| 02.D Amber Afterglow | Shallow faceted roof with two vents, rust walls, warm display and upper windows |

## Inspect

From this directory, run `python3 -m http.server 4320`, then open http://localhost:4320. No package installation needed. Switch build source, change lighting, orbit, zoom, inspect wireframe, reset cameras or download individual assets.

GLB was selected for the self-contained glTF PBR workflow and direct Three.js loading. Both versions use the same 512 × 256 PNG palette atlas with broad painted gradients, subtle edge highlights and stylized glass. Each GLB embeds that image; there are no external image or buffer URIs. The separate PNGs are provided for editing. `.blend` files pack the image and preserve individually named parts plus a preview camera and lights. Materials and atlas UVs work without procedural shaders.

## Asset contract

- The six building shells vary in width, depth and height. Exported bounds, including awnings and trim, are in `bounds.json`.
- Ground-centred origin, meters, +Y up and front +Z in GLB/Three.js. Blender source uses +Z up and front -Y.
- The rear elevations retain the kit’s simple service-door treatment for views outside the concept panels. No interiors, collision meshes, LOD chain, people or individual leaves.
- Opaque stylized glass avoids transparency sorting. 04.D and 02.D include emissive surfaces. Emission is visible in GLB but lighting spill depends on the consuming renderer; preview lights are not embedded in the GLBs.
- Three.js builds favor fewer bevel segments, with triangle counts recorded in each build folder. Blender builds have finer bevel geometry. Both are grouped into 6–8 material primitives. Actual statistics are in each build folder.
- These are building assets, not whole city scenes. Preview ground and scene lights are excluded from exports. Suitability for a dense mobile city still needs device profiling and likely instancing/LOD work.

## Rebuild

Requires Node.js, Python with Pillow, and Blender 4.5+:

```sh
node src/build-three.mjs --recipes
python3 src/textures.py
node src/build-three.mjs
blender -b -t 4 --python src/build-blender.py
```

On macOS the Blender executable may be `/Applications/Blender.app/Contents/MacOS/Blender`.

`src/recipes.mjs` contains the palettes and architectural recipes. `src/build-three.mjs` constructs actual Three.js meshes, bakes transforms, batches by material, and writes GLB buffers. `src/build-blender.py` independently creates native Blender meshes, bevels, maps the atlas, saves editable sources, consolidates export geometry and renders previews.

## Verification

Khronos glTF Validator reports are recorded in `validation.json`. All twelve final GLBs must have zero errors/warnings, embedded PNG images and no external URIs. Both source sets are inspected through Three.js GLTFLoader. Bounding-box and texture checks are recorded separately. Blender previews come from actual native models, not image generation.

Three.js r181 is vendored under `vendor/three` with its MIT license. The atlas textures and model recipes were created for this project.
