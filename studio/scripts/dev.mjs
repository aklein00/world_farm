import http from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=await realpath(fileURLToPath(new URL('../public',import.meta.url))),port=Number(process.env.WORLDFARM_PORT||4318);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.txt':'text/plain'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  if(!/^((127\.0\.0\.1|localhost)(:\d+)?)$/.test(req.headers.host||'')){res.writeHead(403);res.end('Local preview only');return;}
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/api/session'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({local:true,role:'local-preview',generation:'mock'}));return;}
  try{const requested=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)),resolved=await realpath(requested);if(!resolved.startsWith(root+path.sep))throw new Error();const data=await readFile(resolved);res.setHeader('Content-Type',mime[path.extname(resolved)]||'application/octet-stream');res.end(req.method==='HEAD'?null:data);}catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`World Farm local workflow preview: http://127.0.0.1:${port}\nServing studio/public only. Generation is simulated; no passwords or API keys needed.`));
