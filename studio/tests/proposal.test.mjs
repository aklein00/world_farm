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
test('only homepage, design notes and exact presentation assets are public, without auth configuration',async()=>{
  for(const route of ['/','/proposal.html','/design-notes.html','/proposal.css','/style.css','/assets/blocks.svg','/assets/dm-sans.ttf','/assets/dm-sans-semibold.ttf','/assets/space-grotesk.ttf']){
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
  for(const route of ['/workspace','/workspace/','/index.html','/modules/app.js','/modules/generation.js','/assets/townhouse.svg','/api/session','/api/invites','/api/generate','/proposal.html/','/design-notes.html/','/design-notes.html/extra','/assets/blocks.svg/extra','/worker/public-routes.js']){
    assert.equal(publicAssetPath(new Request(origin+route)),null,route);
    assert.equal((await handleVercel(new Request(origin+route),{},options)).status,503);
    assert.equal((await handleVercel(new Request(origin+route),env,options)).status,route.startsWith('/api/')?401:303);
  }
  assert.equal(publicAssetPath(new Request(origin,{method:'POST'})),null);
});
test('authenticated workspace route serves studio while homepage remains public',async()=>{
  const token=await createSession(env.SESSION_SECRET,env.WORLDFARM_PASSWORD),headers={Cookie:`__Host-worldfarm_session=${token}`};
  for(const route of ['/workspace','/workspace/']){
    const response=await handleVercel(new Request(origin+route,{headers}),env,options);assert.equal(response.status,200);assert.match(await response.text(),/modules\/graybox-app.js/);
  }
  const home=await handleVercel(new Request(origin,{headers}),env,options);assert.match(await home.text(),/<title>World Farm<\/title>/);
  const login=await handleVercel(new Request(origin+'/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:'password='+env.WORLDFARM_PASSWORD}),env,options);assert.equal(login.headers.get('Location'),'/workspace');
});
test('homepage opens the studio and keeps design references on a supplemental page',async()=>{
  const html=await readFile(path.join(root,'proposal.html'),'utf8');
  assert.doesNotMatch(html,/figma|node-id=|WORKING PROPOSAL|Proposal stub|twelve screens/i);
  assert.match(html,/<a class="action primary" href="\/workspace">Open studio/);
  assert.match(html,/href="\/design-notes.html"/);
  assert.match(html,/explicit controls generate cube recipes locally, without AI or credits/);
  assert.match(html,/Short text is saved as direction notes, not interpreted by a model/);
  assert.match(html,/One style.<br>A family of buildings./);
  assert.match(html,/A shared style,<br>not a fixed building./);
  assert.match(html,/From a style family to a little world./);
  assert.match(html,/What exists, and what comes next./);
});
test('design notes retain existing workflow versions, review guidance and honest scope',async()=>{
  const html=await readFile(path.join(root,'design-notes.html'),'utf8');
  assert.match(html,/node-id=40-680/);assert.match(html,/node-id=14-548/);
  assert.match(html,/not frozen version-history snapshots/);
  assert.match(html,/5471d0f34f7eb31f74caffd50423c96118a490a5/);
  assert.match(html,/shared credits for WorldFarm and ImageFarm/);
  assert.doesNotMatch(html,/room tickets/i);assert.match(html,/planned, not connected/);
  assert.match(html,/Figma edits do not automatically change the website/);
  assert.match(html,/workspace and its APIs stay behind member sign-in/);
});
test('public pages link existing local assets and valid section anchors',async()=>{
  for(const filename of ['proposal.html','design-notes.html']){
    const html=await readFile(path.join(root,filename),'utf8');
    for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"]+)"/g))if(href!=='/workspace')await access(path.join(root,href));
    const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
    for(const [,hash] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(hash),`${filename}: Missing anchor ${hash}`);
  }
});
