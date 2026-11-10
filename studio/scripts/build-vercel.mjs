import {mkdir,rm,cp,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import './build.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),output=path.join(root,'.vercel/output'),fn=path.join(output,'functions/gateway.func');
await rm(output,{recursive:true,force:true});await mkdir(fn,{recursive:true});
for(const name of ['server','worker','dist'])await cp(path.join(root,name),path.join(fn,name),{recursive:true});
await writeFile(path.join(fn,'package.json'),JSON.stringify({type:'module'}));
await writeFile(path.join(fn,'.vc-config.json'),JSON.stringify({runtime:'nodejs22.x',handler:'server/vercel.mjs',launcherType:'Nodejs',supportsResponseStreaming:true}));
// Deliberately no public static directory or filesystem fallback: every URL
// reaches the access-control function, including assets and /gateway itself.
await writeFile(path.join(output,'config.json'),JSON.stringify({version:3,routes:[{src:'/(.*)',dest:'/gateway'}]},null,2));
console.log('Built Vercel output: every page and asset routes through the access-control function.');
