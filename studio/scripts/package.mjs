import {cp,mkdir,rm,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import './build.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'release/worldfarm-site');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
// Explicit source allowlist for a separate website-only repository.
for(const name of ['public','worker','server','scripts','tests','package.json','package-lock.json','wrangler.jsonc','vercel.json','.vercelignore','.env.example','PUBLISHING.md','README.md','.gitignore']){try{const s=await lstat(path.join(root,name));if(s.isSymbolicLink())throw new Error('Refusing symlink');await cp(path.join(root,name),path.join(out,name),{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}}
console.log(`Website-only source prepared at ${out}. No Git history, parent folders, credentials, or project data copied.`);
