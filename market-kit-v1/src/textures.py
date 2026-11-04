from PIL import Image,ImageDraw
from pathlib import Path
import json,math
root=Path(__file__).resolve().parent.parent
for r in json.loads((root/'src/recipes.json').read_text()):
 im=Image.new('RGB',(512,256));px=im.load()
 for i,(role,color) in enumerate(r['palette'].items()):
  rgb=tuple(int(color[k:k+2],16) for k in (1,3,5));ox=i%4*128;oy=i//4*128
  for y in range(128):
   for x in range(128):
    # Broad painted highlight at upper edge; subtle shaded lower edge, no noise.
    edge=min(x,y,127-x,127-y)
    light=1.0+.045*(1-y/127)-.065*(y/127)**3
    if r['id'].startswith('03'):light+=.055*math.exp(-edge/8)
    if role=='glass':light=.78+.28*(1-y/127)+(.08 if abs(x-y-30)<6 else 0)
    if role in ['glow','green','dark']:light=1.0
    px[ox+x,oy+y]=tuple(max(0,min(255,round(c*light))) for c in rgb)
 im.save(root/'textures'/f"{r['id']}-atlas.png")
