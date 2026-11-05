import {cp,mkdir,rm,readdir,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const allowed=new Set(['.html','.css','.js','.svg','.png','.woff2','.ttf','.txt']);
async function audit(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name),s=await lstat(p);if(s.isSymbolicLink())throw new Error(`Public symlinks are forbidden: ${p}`);if(entry.name.startsWith('.'))throw new Error(`Hidden file in public directory: ${p}`);if(entry.isDirectory())await audit(p);else if(!allowed.has(path.extname(p)))throw new Error(`Unexpected public file: ${p}`);}}
await audit(path.join(root,'public'));await rm(path.join(root,'dist'),{recursive:true,force:true});await mkdir(path.join(root,'dist'),{recursive:true});await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});console.log('Built studio/dist from public/ only. No design sources, secrets or repository files included.');
