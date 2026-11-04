import json,struct,math
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parent.parent
reports=[]
for p in sorted(root.glob('*/*.glb')):
 b=p.read_bytes();jlen=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+jlen]);binary=b[28+jlen:];points=[]
 def transform(n):
  if 'matrix' in n:return np.array(n['matrix']).reshape(4,4).T
  x,y,z,w=n.get('rotation',[0,0,0,1]);R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
  m=np.eye(4);m[:3,:3]=R@np.diag(n.get('scale',[1,1,1]));m[:3,3]=n.get('translation',[0,0,0]);return m
 def visit(i,parent):
  n=g['nodes'][i];m=parent@transform(n)
  if 'mesh' in n:
   for prim in g['meshes'][n['mesh']]['primitives']:
    a=g['accessors'][prim['attributes']['POSITION']];v=g['bufferViews'][a['bufferView']];off=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',12)
    for k in range(a['count']):points.append((m@np.array([*struct.unpack_from('<3f',binary,off+k*stride),1]))[:3])
  for c in n.get('children',[]):visit(c,m)
 for i in g['scenes'][g.get('scene',0)]['nodes']:visit(i,np.eye(4))
 pts=np.array(points);lo=pts.min(0);hi=pts.max(0)
 assert np.isfinite(pts).all() and abs(lo[1])<.001,(p,lo)
 reports.append({'file':str(p.relative_to(root)),'min':[round(float(n),4) for n in lo],'max':[round(float(n),4) for n in hi],'sizeMeters':[round(float(n),4) for n in hi-lo]})
(root/'bounds.json').write_text(json.dumps(reports,indent=2)+'\n')
print(json.dumps(reports,indent=2))
