// Units: meters. Three.js Y-up, front +Z, ground pivot at origin.
export const variants=[
 {id:'04C',name:'Peach Modern',wall:'#e9af9c',trim:'#fff0de',accent:'#608f8d',roof:'#d4a291',glass:'#506e78',glow:'#ffd79a',bevel:.035,kind:'modern'},
 {id:'04D',name:'Rose Twilight',wall:'#d599b8',trim:'#f4dfe9',accent:'#a77caa',roof:'#ad86ac',glass:'#735f87',glow:'#ffc979',bevel:.045,kind:'rose'},
 {id:'03B',name:'Honey Corners',wall:'#dba051',trim:'#ffe2ac',accent:'#b95f37',roof:'#cb6e35',glass:'#527585',glow:'#efc576',bevel:.12,kind:'honey'},
 {id:'03A',name:'Soft Blocks',wall:'#efb090',trim:'#ffebcf',accent:'#d98268',roof:'#e99e7d',glass:'#648697',glow:'#e9ca9a',bevel:.16,kind:'soft'},
 {id:'01D',name:'Copper Rooftops',wall:'#c59a76',trim:'#f3dbb3',accent:'#8d6447',roof:'#bf7044',glass:'#45687d',glow:'#eac28a',bevel:.025,kind:'copper'},
 {id:'02D',name:'Amber Afterglow',wall:'#b77e69',trim:'#d9b190',accent:'#68596d',roof:'#765e66',glass:'#534d68',glow:'#ffbf62',bevel:.018,kind:'amber'}
];
export const roles=['wall','trim','accent','roof','glass','glow','green','dark'];
export function recipe(v){
 const parts=[];const b=v.bevel;
 function box(name,p,s,mat='wall',bev=b,rx=0){parts.push({type:'box',name,p,s,mat,bevel:Math.min(bev,...s.map(n=>n*.23)),rx});}
 function hip(name,p,s,mat='roof'){parts.push({type:'hip',name,p,s,mat,bevel:0,rx:0});}
 function frontWin(x,y,z=2.34,w=.82,h=1.05,lit=false){box('Window surround',[x,y,z],[w+.22,h+.24,.15],'trim',b*.7);box('Window pane',[x,y,z+.09],[w,h,.045],lit?'glow':'glass',.01);if(v.kind!=='soft')box('Window sill',[x,y-h*.5-.12,z+.12],[w+.34,.13,.28],'trim',b*.5);}
 function planter(x,y,z,w,d){box('Planter tray',[x,y,z],[w,.26,d],'trim');box('Solid hedge',[x,y+.25,z],[w-.12,.3,d-.12],'green',.07);}
 box('Foundation',[0,.14,0],[6.12,.28,4.72],'trim');
 box('Ground shell',[0,1.42,0],[6,2.56,4.6]);
 const setback=['modern','rose','amber'].includes(v.kind);const upperZ=setback?-.23:0;const upperD=setback?4.04:4.6;
 box('Upper shell',[0,3.78,upperZ],[6,2.16,upperD]);
 box('Floor belt',[0,2.65,0],[6.2,.22,4.8],'trim');
 box('Roof slab',[0,4.92,upperZ],[6.26,.26,upperD+.26],'trim');
 box('Roof inset',[0,5.07,upperZ],[5.66,.1,upperD-.36],'roof');
 for(const x of [-2.96,2.96])box('Side parapet',[x,5.23,upperZ],[.25,.45,upperD-.25],'trim');
 for(const z of [upperZ-upperD/2,upperZ+upperD/2])box('End parapet',[0,5.23,z],[6.15,.45,.25],'trim');
 // Street-facing shopfront. Planes use opaque stylized glass for dependable mobile rendering.
 box('Storefront reveal',[0,1.28,2.315],[5.48,2.12,.08],'dark',0);
 for(const x of [-1.83,1.83]){box('Shop glazing',[x,1.3,2.37],[1.65,1.83,.06],'glass',.012);box('Glazing sill',[x,.34,2.44],[1.86,.14,.2],'trim');}
 box('Door frame',[0,1.25,2.39],[1.65,2.05,.13],'trim');box('Double glass doors',[0,1.24,2.47],[1.39,1.82,.045],'glass',.01);
 box('Door center mullion',[0,1.24,2.51],[.07,1.83,.06],'trim',.01);
 for(const x of [-.17,.17])box('Door pull',[x,1.14,2.56],[.04,.35,.065],'accent',.01);
 for(const x of [-2.78,-.91,.91,2.78])box('Storefront post',[x,1.3,2.43],[.14,2.13,.2],'trim');
 box('Entry step',[0,.1,2.68],[1.94,.2,.65],'trim');
 // Nine alternating broad canopy sections, sloped towards street.
 for(let i=0;i<9;i++){const x=(i-4)*.65;box('Canopy stripe '+i,[x,2.48,2.92],[.65,.13,1.35],i%2?'trim':'accent',Math.min(b,.035),.23);box('Canopy valance '+i,[x,2.24,3.56],[.65,.25,.12],i%2?'trim':'accent',Math.min(b,.04));}
 // Upper fenestration visible from the chosen 3/4 view.
 for(const x of [-1.94,0,1.94])frontWin(x,3.75,upperZ+upperD/2+.05,.8,1.08,v.kind==='rose'||v.kind==='amber');
 for(const side of [-1,1])for(const z of [-1.4,.4]){
 box('Side window surround',[side*3.035,3.77,z],[.14,1.3,1.12],'trim');box('Side window pane',[side*3.12,3.77,z],[.045,1.07,.87],v.kind==='amber'?'glow':'glass',.01);
 box('Ground side window frame',[side*3.035,1.35,z],[.14,1.25,1.15],'trim');box('Ground side window glass',[side*3.12,1.35,z],[.045,1.02,.92],'glass',.01);}
 // Back elevation is complete, suitable for orbiting or placing freely.
 for(const x of [-1.7,1.7]){box('Rear window surround',[x,3.75,upperZ-upperD/2-.06],[1.18,1.25,.14],'trim');box('Rear glass',[x,3.75,upperZ-upperD/2-.15],[.94,1.02,.04],'glass',.01);}
 box('Service door',[0,1.1,-2.34],[1.1,1.9,.08],'accent');
 if(v.kind==='modern'){
 box('Modern side accent',[2.95,3.7,upperZ],[.18,2.13,upperD],'accent');
 box('Front balcony edge',[0,2.99,2.12],[6.15,.3,.28],'trim');planter(-1.65,3.13,2.07,2.05,.4);
 for(const x of [-1.5,0,1.5])box('Pergola blade',[x,5.47,-.2],[.25,.48,2.65],'trim',.035);
 planter(0,5.27,-1.75,3.9,.55);
 }
 if(v.kind==='rose'){
 box('Balcony front',[0,3.0,2.18],[6.12,.33,.27],'trim');planter(-1.6,3.19,2.06,2.08,.42);
 box('Roof room',[1.27,5.67,-.85],[2.4,1.1,1.85],'wall');box('Roof room cap',[1.27,6.29,-.85],[2.65,.2,2.08],'trim');
 box('Roof lantern',[1.27,6.43,-.85],[1.9,.12,1.4],'glow',.035);planter(-1.6,5.3,-1.2,1.9,1.25);
 for(const x of [-1.94,0,1.94])box('Amber window brow',[x,4.42,1.87],[1.13,.09,.15],'glow',.015);
 box('Entrance light strip',[0,2.71,2.44],[5.44,.09,.12],'glow',.015);
 }
 if(v.kind==='honey'){
 for(const x of [-2.89,2.89]){box('Chunky corner pier',[x,3.82,2.16],[.42,2.17,.42],'trim',.1);box('Corner cap',[x,5.34,2.13],[.65,.48,.65],'trim',.13);}
 hip('Hipped clay roof',[0,5.62,-.1],[4.82,1.08,3.3]);box('Roof crown',[0,6.19,-.1],[2.7,.14,1.15],'accent',.05);
 for(const x of [-1.94,0,1.94])box('Thick lower sill',[x,3.06,2.48],[1.18,.23,.35],'trim',.07);
 }
 if(v.kind==='soft'){
 box('Simple roof block',[-1.7,5.45,-1.14],[1.12,.65,1.05],'trim',.16);
 }
 if(v.kind==='copper'){
 for(const x of [-2.87,-.96,.96,2.87])box('Facade pilaster',[x,3.7,2.39],[.22,2.15,.19],'trim',.02);
 box('Cornice lower',[0,4.72,0],[6.32,.17,4.92],'accent');box('Cornice upper',[0,4.91,0],[6.52,.17,5.12],'trim');
 hip('Copper pavilion',[0,5.63,-.35],[4.6,1.12,3.3]);
 for(const x of [-1.3,0,1.3]){box('Copper roof seam',[x,5.63,1.02],[.035,.035,1.5],'accent',0,-.57);}
 planter(-2.28,5.29,1.1,.65,1.5);planter(2.28,5.29,1.1,.65,1.5);
 box('Solar frame',[1.2,5.44,-1.5],[1.45,.12,.86],'trim',.01,-.18);box('Solar panel',[1.2,5.51,-1.49],[1.3,.035,.72],'glass',.0,-.18);
 }
 if(v.kind==='amber'){
 box('Stepped roof tower',[-1.45,5.65,-.9],[2.0,1.1,1.9],'wall');box('Tower cap',[-1.45,6.27,-.9],[2.25,.22,2.12],'accent');
 hip('Faceted tower roof',[-1.45,6.61,-.9],[2.12,.48,2.0],'roof');
 box('Roof utility',[1.45,5.52,-.95],[1.0,.7,.85],'accent');
 for(let i=0;i<4;i++)box('Vent slat',[1.45,5.88,-1.2+i*.15],[.72,.035,.055],'dark',0);
 planter(1.45,5.3,.88,1.6,.7);
 for(const y of [2.76,4.68])box('Emissive facade band',[0,y,1.86],[5.72,.1,.13],'glow',.005);
 box('Angular corner rib',[2.83,3.78,1.84],[.27,2.2,.27],'accent',.0);
 }
 return {id:v.id,name:v.name,units:'meters',up:'Y',front:'+Z',parts,palette:Object.fromEntries(roles.map(k=>[k,v[k]||({green:'#819653',dark:'#34414a'}[k])])),bevelSegments:v.kind==='soft'?3:v.kind==='honey'?2:1,emissive:['rose','amber'].includes(v.kind)};
}
