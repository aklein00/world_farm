import {readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const folder of ['public/modules','worker','scripts','server'])for(const name of await readdir(path.join(root,folder)))if(/\.(m?js)$/.test(name))execFileSync(process.execPath,['--check',path.join(root,folder,name)],{stdio:'inherit'});
console.log('All application, Worker and helper modules passed syntax checks.');
