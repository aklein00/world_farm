import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
root=Path(__file__).resolve().parent.parent
recipes=json.loads((root/'src/recipes.json').read_text())
roles=['wall','trim','accent','roof','glass','glow','green','dark']
C=Matrix(((1,0,0),(0,0,-1),(0,1,0)))
def xyz(p):return (p[0],-p[2],p[1])
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
reports=[]
for r in recipes:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.context.preferences.filepaths.save_version=0
 image=bpy.data.images.load(str(root/'textures'/f"{r['id']}-atlas.png"));image.pack()
 mats={}
 for role in roles:
  mat=bpy.data.materials.new(role);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
  mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.32 if role=='glass' else .78
  if role=='glow' and r['emissive']:
   mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Emission Color']);bs.inputs['Emission Strength'].default_value=.7
  mats[role]=mat
 objects=[]
 for p in r['parts']:
  w,h,d=p['s']
  if p['type']=='mesh':
   mesh=bpy.data.meshes.new(p['name']);mesh.from_pydata([xyz(v) for v in p['vertices']],[],p['faces']);mesh.update();ob=bpy.data.objects.new(p['name'],mesh);bpy.context.collection.objects.link(ob)
  elif p['type']=='hip':
   tx,tz=p['taper']
   vv=[(-w/2,-h/2,-d/2),(w/2,-h/2,-d/2),(w/2,-h/2,d/2),(-w/2,-h/2,d/2),(-w*tx,h/2,-d*tz),(w*tx,h/2,-d*tz),(w*tx,h/2,d*tz),(-w*tx,h/2,d*tz)]
   faces=[(1,2,3,0),(7,6,5,4),(4,5,1,0),(5,6,2,1),(6,7,3,2),(7,4,0,3)]
   mesh=bpy.data.meshes.new(p['name']);mesh.from_pydata([xyz(v) for v in vv],[],faces);mesh.update();ob=bpy.data.objects.new(p['name'],mesh);bpy.context.collection.objects.link(ob)
  else:
   bpy.ops.mesh.primitive_cube_add(size=1);ob=bpy.context.object;ob.name=p['name'];ob.dimensions=(w,d,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
  bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
  if p['bevel']>0:
   mod=ob.modifiers.new('Crafted edge bevel','BEVEL');mod.width=p['bevel'];mod.segments=max(2,r['bevelSegments']);mod.affect='EDGES';bpy.ops.object.modifier_apply(modifier=mod.name)
  # Project each polygon independently into its material's atlas tile.

  for old_uv in list(ob.data.uv_layers):ob.data.uv_layers.remove(old_uv)
  uv=ob.data.uv_layers.new(name='UVMap');tile=roles.index(p['mat'])
  for poly in ob.data.polygons:
   localN=C.transposed()@poly.normal;axis=max(range(3),key=lambda a:abs(localN[a]));a=2 if axis==0 else 0;c=2 if axis==1 else 1
   for li in poly.loop_indices:
    v=C.transposed()@ob.data.vertices[ob.data.loops[li].vertex_index].co
    u=v[a]/p['s'][a]+.5;t=v[c]/p['s'][c]+.5
    uv.data[li].uv=((tile%4+.1+u*.8)/4,1-(tile//4+.1+(1-t)*.8)/2)
  ob.data.materials.append(mats[p['mat']]);ob.location=xyz(p['p']);ob.rotation_euler=(C@Matrix.Rotation(p.get('rx',0),3,'X')@C.transposed()).to_euler()
  ob['part_role']=p['mat'];objects.append(ob)
 # Preserve named separately editable native Blender objects in .blend.
 scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
 asset=bpy.data.collections.new(r['id']+' Market');scene.collection.children.link(asset)
 for ob in objects:
  for coll in list(ob.users_collection):coll.objects.unlink(ob)
  asset.objects.link(ob)
 asset['front']='-Y in Blender; +Z in exported GLB';asset['units']='meters';asset['source']='Native bpy meshes; not imported from Three.js'
 world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.32,.38,.48,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
 bpy.ops.object.camera_add(location=(10*r['cameraSide'],-14,12));camera=bpy.context.object;camera.name='Orthographic preview';camera.data.type='ORTHO';camera.data.ortho_scale=12.5;aim(camera,(0,-.4,3));scene.camera=camera
 for name,loc,power,size,color in [('Key',(-7,-9,12),1800,7,(1,.83,.67)),('Fill',(8,-3,7),1000,8,(.72,.83,1)),('Rim',(0,7,10),1700,6,(1,.92,.83))]:
  bpy.ops.object.light_add(type='AREA',location=loc);lamp=bpy.context.object;lamp.name=name;lamp.data.energy=power;lamp.data.shape='DISK';lamp.data.size=size;lamp.data.color=color;aim(lamp,(0,0,2.8))
 scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True
 scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=False
 scene.view_settings.view_transform='AgX';scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'previews'/f"{r['id']}-blender.png")
 bpy.ops.object.select_all(action='DESELECT')
 for ob in objects:ob.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.wm.save_as_mainfile(filepath=str(root/'blender'/f"{r['id']}-market.blend"))
 # Consolidate for mobile export after saving separately editable source.
 bpy.ops.object.join();ob=bpy.context.object;ob.name=r['id']+' '+r['name'];bpy.context.scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
 bpy.ops.export_scene.gltf(filepath=str(root/'blender'/f"{r['id']}-market-blender.glb"),export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT',export_texcoords=True,export_normals=True,export_cameras=False,export_lights=False)
 ob.data.calc_loop_triangles();reports.append({'variant':r['id'],'triangles':len(ob.data.loop_triangles),'materials':len(ob.data.materials),'editableParts':len(objects),'glbBytes':(root/'blender'/f"{r['id']}-market-blender.glb").stat().st_size})
 # Ground is preview-only and never exported or packed into asset geometry.
 bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.015));ground=bpy.context.object;mat=bpy.data.materials.new('Preview ground');mat.diffuse_color=(.67,.65,.6,1);ground.data.materials.append(mat)
 bpy.ops.render.render(write_still=True)
(root/'blender/stats.json').write_text(json.dumps(reports,indent=2))
print('MARKET_BUILD_COMPLETE',json.dumps(reports))
