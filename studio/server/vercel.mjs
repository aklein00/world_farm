import {readFile} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import worker from '../worker/index.js';
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n";
// One shared budget across instances and addresses prevents IP header spoofing
// and distributed guessing. A burst can temporarily block new owner sign-ins.
export function loginLimiter(env,fetcher=fetch){return {async limit(){
  const response=await fetcher(env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:`Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,'1','worldfarm:login:v1']),signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('Limiter unavailable');const data=await response.json();if(!Number.isSafeInteger(data.result)||data.result<1)throw new Error('Invalid limiter response');return {success:data.result<=5};
}};}
export function assetServer(root){return {async fetch(request){
  try{const pathname=decodeURIComponent(new URL(request.url).pathname);if(pathname.includes('\\')||pathname.includes('\0'))return new Response('Not found',{status:404});
    const relative=pathname==='/'?'index.html':pathname.slice(1),file=path.resolve(root,relative);
    if(!file.startsWith(path.resolve(root)+path.sep)||relative.split('/').some(s=>s.startsWith('.')))return new Response('Not found',{status:404});
    const type=MIME[path.extname(file)];if(!type)return new Response('Not found',{status:404});
    const bytes=await readFile(file);return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':type}});
  }catch{return new Response('Not found',{status:404});}
}};}
export async function handleVercel(request,env,{assets=assetServer(fileURLToPath(new URL('../dist/',import.meta.url))),fetcher=fetch}={}){
  // Vercel Marketplace supplies KV_*; direct Upstash setups use UPSTASH_*.
  env={...env,UPSTASH_REDIS_REST_URL:env.UPSTASH_REDIS_REST_URL||env.KV_REST_API_URL,UPSTASH_REDIS_REST_TOKEN:env.UPSTASH_REDIS_REST_TOKEN||env.KV_REST_API_TOKEN};
  // An unconfigured deployment is locked, including its generated Vercel URLs.
  if(!/^https:\/\/[^/]+\.upstash\.io\/?$/.test(env.UPSTASH_REDIS_REST_URL||'')||!env.UPSTASH_REDIS_REST_TOKEN)return new Response('World Farm is locked: configure the server-side sign-in limiter.',{status:503,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
  return worker.fetch(request,{WORLDFARM_PASSWORD:env.WORLDFARM_PASSWORD,SESSION_SECRET:env.SESSION_SECRET,LOGIN_LIMITER:loginLimiter(env,fetcher),ASSETS:assets});
}
export default async function handler(req,res){
  try{
    // Use the configured origin for redirects and CSRF checks. Preview builds
    // may use VERCEL_URL; production must explicitly configure APP_ORIGIN.
    const origin=process.env.APP_ORIGIN||(process.env.VERCEL_ENV!=='production'&&process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'');
    if(!/^https:\/\/[^/]+$/.test(origin)){res.writeHead(503,{'Cache-Control':'no-store'});res.end('World Farm is locked: configure APP_ORIGIN.');return;}
    if(!req.url?.startsWith('/')||req.url.startsWith('//')){res.writeHead(400);res.end();return;}
    const headers=new Headers();for(const [k,v] of Object.entries(req.headers))if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(', '):v);
    // Request's streamed body is bounded by the shared password handler.
    const request=new Request(origin+req.url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Readable.toWeb(req),duplex:'half'}:{})});
    const response=await handleVercel(request,process.env);res.writeHead(response.status,Object.fromEntries(response.headers));
    if(response.body)await pipeline(Readable.fromWeb(response.body),res);else res.end();
  }catch{if(!res.headersSent)res.writeHead(503,{'Cache-Control':'no-store'});res.end('World Farm is temporarily unavailable.');}
}
