import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {handleVercel,assetServer} from '../server/vercel.mjs';
import {publicAssetPath} from '../worker/public-routes.js';
import {createSession} from '../worker/index.js';
const origin='https://worldfarm.utilityinfielder.com';
const env={WORLDFARM_PASSWORD:'test-password-only',SESSION_SECRET:'test-only-session-secret-1234567890123456789',KV_REST_API_URL:'https://test.upstash.io',KV_REST_API_TOKEN:'test-token'};
const root=fileURLToPath(new URL('../public/',import.meta.url));
const options={assets:assetServer(root),fetcher:async()=>Response.json({result:1})};
test('only proposal and exact presentation assets are public, without auth configuration',async()=>{
  for(const route of ['/','/proposal.html','/proposal.css','/style.css','/assets/blocks.svg','/assets/dm-sans.ttf','/assets/dm-sans-semibold.ttf','/assets/space-grotesk.ttf']){
    for(const method of ['GET','HEAD']){
      const response=await handleVercel(new Request(origin+route,{method}),{},options);
      assert.equal(response.status,200,route);assert.equal(response.headers.get('Set-Cookie'),null);
      if(method==='HEAD')assert.equal((await response.arrayBuffer()).byteLength,0);
    }
  }
});
test('public content ignores session headers and query strings',async()=>{
  const clean=await handleVercel(new Request(origin),{},options);
  const spoofed=await handleVercel(new Request(origin+'/?scene=private&return_to=/api/session',{headers:{Cookie:'private=1','x-worldfarm-role':'owner','oai-authenticated-user-id':'owner'}}),env,options);
  assert.equal(await clean.text(),await spoofed.text());
});
test('workspace, modules, APIs and unexpected asset paths remain private',async()=>{
  for(const route of ['/workspace','/workspace/','/index.html','/modules/app.js','/assets/townhouse.svg','/api/session','/api/invites','/api/generate','/proposal.html/','/assets/blocks.svg/extra','/worker/public-routes.js']){
    assert.equal(publicAssetPath(new Request(origin+route)),null,route);
    assert.equal((await handleVercel(new Request(origin+route),{},options)).status,503);
    assert.equal((await handleVercel(new Request(origin+route),env,options)).status,route.startsWith('/api/')?401:303);
  }
  assert.equal(publicAssetPath(new Request(origin,{method:'POST'})),null);
});
test('authenticated workspace route serves studio while homepage remains proposal',async()=>{
  const token=await createSession(env.SESSION_SECRET,env.WORLDFARM_PASSWORD),headers={Cookie:`__Host-worldfarm_session=${token}`};
  for(const route of ['/workspace','/workspace/']){
    const response=await handleVercel(new Request(origin+route,{headers}),env,options);assert.equal(response.status,200);assert.match(await response.text(),/modules\/app.js/);
  }
  const home=await handleVercel(new Request(origin,{headers}),env,options);assert.match(await home.text(),/Project proposal/);
  const login=await handleVercel(new Request(origin+'/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:'password='+env.WORLDFARM_PASSWORD}),env,options);assert.equal(login.headers.get('Location'),'/workspace');
});
test('proposal links existing local assets and distinguishes design versions and planned credits',async()=>{
  const html=await readFile(path.join(root,'proposal.html'),'utf8');
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"]+)"/g))if(href!=='/workspace')await access(path.join(root,href));
  assert.match(html,/node-id=40-680/);assert.match(html,/node-id=14-548/);
  assert.match(html,/not frozen version-history snapshots/);assert.match(html,/generation uses sample models/);
  assert.match(html,/5471d0f34f7eb31f74caffd50423c96118a490a5/);assert.match(html,/shared credits for WorldFarm and ImageFarm/);assert.doesNotMatch(html,/room tickets/i);assert.match(html,/planned, not connected/);
  const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  for(const [,hash] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(hash),`Missing anchor ${hash}`);
});
