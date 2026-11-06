import test from 'node:test';
import {Readable,Writable} from 'node:stream';
import {createSession} from '../worker/index.js';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {handleVercel,assetServer,loginLimiter} from '../server/vercel.mjs';
const origin='https://worldfarm.utilityinfielder.com',env={WORLDFARM_PASSWORD:'test-password-only',SESSION_SECRET:'test-only-session-secret-1234567890123456789',UPSTASH_REDIS_REST_URL:'https://test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'test-token'};
const request=(p,init)=>new Request(origin+p,init),fetcher=async()=>Response.json({result:1}),options={assets:assetServer(fileURLToPath(new URL('../public/',import.meta.url))),fetcher};
test('Vercel protects every asset and fails closed without credentials or limiter',async()=>{
  for(const p of ['/','/modules/app.js','/vendor/three/three.module.js','/api/session','/gateway']){
    assert.equal((await handleVercel(request(p),{},options)).status,503);
    const response=await handleVercel(request(p),env,options);assert.equal(response.status,p.startsWith('/api/')?401:303);
  }
  const broken={...env};delete broken.SESSION_SECRET;assert.equal((await handleVercel(request('/'),broken,options)).status,503);
});
test('Vercel sign-in serves real assets, rejects traversal and supports sign-out',async()=>{
  const login=await handleVercel(request('/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:'password='+env.WORLDFARM_PASSWORD}),env,options);
  assert.equal(login.status,303);const Cookie=login.headers.get('Set-Cookie');
  const home=await handleVercel(request('/',{headers:{Cookie}}),env,options);assert.equal(home.status,200);assert.ok((await home.text()).includes('World Farm'));
  const js=await handleVercel(request('/modules/app.js',{headers:{Cookie}}),env,options);assert.equal(js.status,200);assert.match(js.headers.get('Content-Type'),/javascript/);assert.equal(js.headers.get('Cache-Control'),'no-store');
  for(const p of ['/%2e%2e%2fworker/index.js','/.env','/worker/index.js','/server/vercel.mjs','/package.json','/gateway'])assert.equal((await handleVercel(request(p,{headers:{Cookie}}),env,options)).status,404);
  assert.equal((await handleVercel(request('/logout',{method:'POST',headers:{Origin:origin,Cookie}}),env,options)).status,204);
});
test('Vercel login limiter shares an atomic expiring budget and fails on service errors',async()=>{
  let count=0;const limiter=loginLimiter(env,async(url,init)=>{assert.equal(url,env.UPSTASH_REDIS_REST_URL);const command=JSON.parse(init.body);assert.equal(command[0],'EVAL');assert.match(command[1],/EXPIRE/);assert.equal(command[3],'worldfarm:login:v1');return Response.json({result:++count});});
  for(let i=0;i<5;i++)assert.equal((await limiter.limit()).success,true);assert.equal((await limiter.limit()).success,false);
  for(const fetcher of [async()=>new Response('',{status:503}),async()=>Response.json({error:'failed'}),async()=>{throw new Error('network');}]){
    const response=await handleVercel(request('/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:'password=x'}),env,{...options,fetcher});assert.equal(response.status,503);
  }
});
test('Vercel Marketplace credentials support a real sign-in request',async()=>{
  const marketplace={WORLDFARM_PASSWORD:env.WORLDFARM_PASSWORD,SESSION_SECRET:env.SESSION_SECRET,KV_REST_API_URL:env.UPSTASH_REDIS_REST_URL,KV_REST_API_TOKEN:env.UPSTASH_REDIS_REST_TOKEN};
  let called=false;
  const response=await handleVercel(request('/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:'password='+env.WORLDFARM_PASSWORD}),marketplace,{...options,fetcher:async(url,init)=>{called=true;assert.equal(url,marketplace.KV_REST_API_URL);assert.equal(init.headers.Authorization,'Bearer '+marketplace.KV_REST_API_TOKEN);return Response.json({result:1});}});
  assert.equal(called,true);assert.equal(response.status,303);assert.match(response.headers.get('Set-Cookie'),/__Host-worldfarm_session=/);
});
test('Vercel artifact has only a guarded function, includes runtime assets and can be imported',async()=>{
  execFileSync(process.execPath,['scripts/build-vercel.mjs'],{cwd:fileURLToPath(new URL('../',import.meta.url))});
  const root=new URL('../.vercel/output/',import.meta.url),config=JSON.parse(await readFile(new URL('config.json',root)));
  assert.deepEqual(config,{version:3,routes:[{src:'/(.*)',dest:'/gateway'}]});await assert.rejects(access(new URL('static',root)));
  const fn=new URL('functions/gateway.func/',root),runtime=JSON.parse(await readFile(new URL('.vc-config.json',fn)));
  assert.equal(runtime.runtime,'nodejs22.x');assert.equal(runtime.handler,'server/vercel.mjs');const built=await import(new URL(runtime.handler,fn));assert.equal(typeof built.default,'function');
  await access(new URL('dist/index.html',fn));await access(new URL('worker/index.js',fn));
  for(const name of ['.env','docs','market-kit-v1','.git'])await assert.rejects(access(new URL(name,fn)));
  // Invoke the built Node request/response entry point, not just its Fetch core.
  const saved={};for(const k of [...Object.keys(env),'APP_ORIGIN']){saved[k]=process.env[k];process.env[k]=k==='APP_ORIGIN'?origin:env[k];}
  try{
    const token=await createSession(env.SESSION_SECRET,env.WORLDFARM_PASSWORD),req=Readable.from([]);req.method='GET';req.url='/modules/app.js';req.headers={cookie:`__Host-worldfarm_session=${token}`};
    const chunks=[],res=new Writable({write(chunk,encoding,callback){chunks.push(chunk);callback();}});res.writeHead=(status,headers)=>{res.statusCode=status;res.headers=headers;res.headersSent=true;};
    await built.default(req,res);assert.equal(res.statusCode,200);assert.match(res.headers['content-type'],/javascript/);assert.ok(Buffer.concat(chunks).toString().includes('STARTER_IDS'));
  }finally{for(const [k,v] of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}

});
