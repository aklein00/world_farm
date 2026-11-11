import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{createSession,validSession} from '../worker/index.js';
const password='test-only-password',secret='test-only-secret-not-for-production-123456789';
const env=()=>({WORLDFARM_PASSWORD:password,SESSION_SECRET:secret,LOGIN_LIMITER:{limit:async()=>({success:true})},ASSETS:{fetch:async()=>new Response('private asset')}});
const request=(path='/',init={})=>new Request('https://worldfarm.example'+path,init);
const login=(attempt=password,origin='https://worldfarm.example')=>request('/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:attempt})});
test('missing private configuration fails closed before serving workspace assets',async()=>{for(const path of ['/workspace','/modules/app.js','/assets/townhouse.svg','/api/session','/login'])assert.equal((await worker.fetch(request(path),{})).status,503);});
test('all private assets and APIs require a verified session',async()=>{for(const path of ['/workspace','/index.html','/modules/app.js','/assets/townhouse.svg']){const response=await worker.fetch(request(path),env());assert.equal(response.status,303);assert.equal(response.headers.get('Location'),'/login');}assert.equal((await worker.fetch(request('/api/session'),env())).status,401);});
test('login rejects invalid password, cross-origin, missing origin, oversized body and limiter failures',async()=>{assert.equal((await worker.fetch(login('wrong'),env())).status,401);assert.equal((await worker.fetch(login(password,'https://evil.example'),env())).status,403);assert.equal((await worker.fetch(request('/login',{method:'POST'}),env())).status,403);assert.equal((await worker.fetch(login('x'.repeat(5000)),env())).status,401);const missing=env();delete missing.LOGIN_LIMITER;assert.equal((await worker.fetch(login(),missing)).status,503);const limited=env();limited.LOGIN_LIMITER.limit=async()=>({success:false});const r=await worker.fetch(login(),limited);assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'60');});
test('valid login issues secure session; signed-in assets are private and logout is POST only',async()=>{const r=await worker.fetch(login(),env());assert.equal(r.status,303);const cookie=r.headers.get('Set-Cookie');for(const flag of ['__Host-worldfarm_session=','Secure','HttpOnly','SameSite=Strict','Path=/'])assert.ok(cookie.includes(flag));const authenticated=await worker.fetch(request('/modules/app.js',{headers:{Cookie:cookie}}),env());assert.equal(await authenticated.text(),'private asset');assert.equal(authenticated.headers.get('Cache-Control'),'no-store');assert.ok(authenticated.headers.get('Content-Security-Policy').includes("frame-ancestors 'none'"));assert.equal((await worker.fetch(request('/logout'),env())).status,403);const logout=await worker.fetch(request('/logout',{method:'POST',headers:{Origin:'https://worldfarm.example'}}),env());assert.equal(logout.status,204);assert.ok(logout.headers.get('Set-Cookie').includes('Max-Age=0'));});
test('session tampering, expiry and password rotation invalidate cookies',async()=>{const now=Date.now(),token=await createSession(secret,password,now),req=token=>request('/',{headers:{Cookie:`__Host-worldfarm_session=${token}`}});assert.equal(await validSession(req(token),secret,password,now),true);assert.equal(await validSession(req(token+'bad'),secret,password,now),false);assert.equal(await validSession(req(token),secret,password,now+8*86400000),false);assert.equal(await validSession(req(token),secret,'new-test-password',now),false);assert.equal(await validSession(req(token),'new-secret',password,now),false);});
test('client headers cannot bypass auth; generation routes are absent',async()=>{assert.equal((await worker.fetch(request('/api/generate',{headers:{'x-user':'owner','oai-authenticated-user-id':'owner'}}),env())).status,401);const token=await createSession(secret,password);const response=await worker.fetch(request('/api/generate',{headers:{Cookie:`__Host-worldfarm_session=${token}`}}),env());assert.equal(response.status,404);});

test('login and session accurately identify the procedural generator',async()=>{
  const page=await worker.fetch(request('/login'),env());
  assert.equal(page.status,200);
  const html=await page.text();
  assert.match(html,/Editable procedural building kit/);
  assert.match(html,/No AI service or credits used/);
  assert.doesNotMatch(html,/Generation is simulated/);
  // Keep the existing headline and sign-in form unchanged.
  assert.match(html,/<h1>A little world,<br>all your own\.<\/h1>/);
  assert.match(html,/autocomplete="current-password"/);
  const token=await createSession(secret,password);
  const session=await worker.fetch(request('/api/session',{headers:{Cookie:`__Host-worldfarm_session=${token}`}}),env());
  assert.equal(session.status,200);
  assert.deepEqual(await session.json(),{local:false,role:'owner',generation:'procedural-kit-v1'});
  assert.equal((await worker.fetch(request('/api/session'),env())).status,401);
});
