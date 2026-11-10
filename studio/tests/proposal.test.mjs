import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {handleVercel,assetServer} from '../server/vercel.mjs';
import {createSession} from '../worker/index.js';
const origin='https://worldfarm.utilityinfielder.com';
const env={WORLDFARM_PASSWORD:'test-password-only',SESSION_SECRET:'test-only-session-secret-1234567890123456789',KV_REST_API_URL:'https://test.upstash.io',KV_REST_API_TOKEN:'test-token'};
const root=fileURLToPath(new URL('../public/',import.meta.url));
const options={assets:assetServer(root),fetcher:async()=>Response.json({result:1})};
test('proposal and its stylesheet preserve the existing member gate',async()=>{
  const token=await createSession(env.SESSION_SECRET,env.WORLDFARM_PASSWORD);
  for(const route of ['/proposal.html','/proposal.css']){
    assert.equal((await handleVercel(new Request(origin+route),{},options)).status,503);
    const signedOut=await handleVercel(new Request(origin+route),env,options);
    assert.equal(signedOut.status,303);assert.equal(signedOut.headers.get('Location'),'/login');
    const signedIn=await handleVercel(new Request(origin+route,{headers:{Cookie:`__Host-worldfarm_session=${token}`}}),env,options);
    assert.equal(signedIn.status,200);assert.equal(signedIn.headers.get('Cache-Control'),'no-store');
  }
});
test('proposal links existing local assets and clearly separates live design from code baseline',async()=>{
  const html=await readFile(path.join(root,'proposal.html'),'utf8');
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"]+)"/g))await access(path.join(root,href));
  assert.match(html,/node-id=40-680/);assert.match(html,/node-id=14-548/);
  assert.match(html,/not frozen version-history snapshots/);assert.match(html,/generation uses sample models/);
  assert.match(html,/5471d0f34f7eb31f74caffd50423c96118a490a5/);
  const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  for(const [,hash] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(hash),`Missing anchor ${hash}`);
});
