import {publicAssetPath} from './public-routes.js';
const COOKIE='__Host-worldfarm_session',TTL=60*60*24*7,encoder=new TextEncoder();
async function key(secret){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function sign(secret,message){return new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(message)));}
const hex=bytes=>[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
async function verify(secret,message,signature){if(!/^[a-f0-9]{64}$/.test(signature))return false;return crypto.subtle.verify('HMAC',await key(secret),new Uint8Array(signature.match(/../g).map(x=>parseInt(x,16))),encoder.encode(message));}
async function passwordMatches(secret,attempt,expected){const signature=await sign(secret,expected);return crypto.subtle.verify('HMAC',await key(secret),signature,encoder.encode(attempt));}
const cookie=(value,age)=>`${COOKIE}=${value}; Path=/; Max-Age=${age}; Secure; HttpOnly; SameSite=Strict`;
export async function createSession(secret,password,now=Date.now()){const expires=Math.floor(now/1000)+TTL;const passwordStamp=hex(await sign(secret,`password:${password}`));const payload=`v1.${expires}.${passwordStamp}`;return `${payload}.${hex(await sign(secret,payload))}`;}
export async function validSession(request,secret,password,now=Date.now()){
  const value=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!value)return false;
  const parts=value.split('.');if(parts.length!==4||parts[0]!=='v1'||!/^\d{10}$/.test(parts[1]))return false;
  const expires=Number(parts[1]),seconds=Math.floor(now/1000);if(expires<=seconds||expires>seconds+TTL)return false;
  return await verify(secret,`password:${password}`,parts[2])&&await verify(secret,parts.slice(0,3).join('.'),parts[3]);
}
const secure=response=>{const r=new Response(response.body,response);for(const [k,v] of Object.entries({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','X-Robots-Tag':'noindex, nofollow','Strict-Transport-Security':'max-age=31536000; includeSubDomains','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"}))r.headers.set(k,v);return r;};
const redirect=location=>new Response(null,{status:303,headers:{Location:location}});
const sameOrigin=request=>request.headers.get('Origin')===new URL(request.url).origin&&request.headers.get('Sec-Fetch-Site')!=='cross-site';
function loginPage(error='',status=200){return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World Farm · Sign in</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f3eb;color:#24372f;font:16px/1.5 system-ui}form{width:min(340px,80vw);display:grid;gap:18px;padding:36px;background:#fffefa;border:1px solid #d7ddd0;border-radius:14px}h1,p{margin:0}h1{font-size:30px}label{display:grid;gap:8px}input,button{font:inherit;padding:12px;border:1px solid #b4c0ae;border-radius:6px}input{background:#f5f3eb;color:#24372f}button{background:#2e5945;color:#fffefa;cursor:pointer}small{color:#63736a}.error{color:#9a3f32}</style></head><body><form method="post" action="/login"><small>WORLD FARM / PRIVATE STUDIO</small><h1>A little world,<br>all your own.</h1><p>Sign in with your member password.</p>${error?`<p class="error" role="alert">${error}</p>`:''}<label>Password<input name="password" type="password" required autocomplete="current-password" maxlength="256" autofocus></label><button>Sign in →</button><small>Editable procedural building kit · No AI service or credits used.</small></form></body></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8'}});}
async function boundedForm(request){if(!request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded'))return null;const reader=request.body?.getReader();if(!reader)return null;let size=0,text='',decoder=new TextDecoder();try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return null;}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();return new URLSearchParams(text);}finally{reader.releaseLock();}}
async function handle(request,env){
  const url=new URL(request.url),password=env.WORLDFARM_PASSWORD,secret=env.SESSION_SECRET;
  if(url.protocol!=='https:'&&url.hostname!=='127.0.0.1'&&url.hostname!=='localhost'){url.protocol='https:';return Response.redirect(url.href,308);}
  const publicPath=publicAssetPath(request);
  if(publicPath){const target=new URL(request.url);target.pathname=publicPath;target.search='';return env.ASSETS.fetch(new Request(target,{method:request.method}));}
  if(!password||password.length<12||!secret||secret.length<32)return new Response('World Farm is locked: configure a member password (12+ characters) and a session secret (32+ characters).',{status:503});
  if(url.pathname==='/login'){
    if(['GET','HEAD'].includes(request.method)){const r=loginPage();return request.method==='HEAD'?new Response(null,r):r;}
    if(request.method!=='POST'||!sameOrigin(request))return new Response('Forbidden',{status:403});
    if(!env.LOGIN_LIMITER)return new Response('Sign-in is unavailable: rate limiter is not configured.',{status:503});
    if(!(await env.LOGIN_LIMITER.limit({key:`login:${request.headers.get('CF-Connecting-IP')||'unknown'}`})).success)return new Response('Too many sign-in attempts. Wait one minute and try again.',{status:429,headers:{'Retry-After':'60'}});
    const form=await boundedForm(request),attempt=form?.get('password')||'';
    if(!attempt||attempt.length>256||!(await passwordMatches(secret,attempt,password)))return loginPage('That password did not match. Please try again.',401);
    const r=redirect('/workspace');r.headers.set('Set-Cookie',cookie(await createSession(secret,password),TTL));return r;
  }
  if(url.pathname==='/logout'){
    if(request.method!=='POST'||!sameOrigin(request))return new Response('Forbidden',{status:403});
    return new Response(null,{status:204,headers:{'Set-Cookie':cookie('',0)}});
  }
  if(!(await validSession(request,secret,password)))return url.pathname.startsWith('/api/')?Response.json({error:'Sign in required.'},{status:401}):redirect('/login');
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  if(url.pathname==='/api/session')return Response.json({local:false,role:'owner',generation:'procedural-kit-v1'});
  if(url.pathname.startsWith('/api/'))return Response.json({error:'No generation services are connected.'},{status:404});
  // No filesystem, GitHub token, repository binding, or external provider exists.
  // Only the explicitly allowlisted proposal assets bypass the session check.
  if(url.pathname==='/workspace'||url.pathname==='/workspace/'){url.pathname='/index.html';return env.ASSETS.fetch(new Request(url,request));}
  return env.ASSETS.fetch(request);
}
export default {async fetch(request,env){try{return secure(await handle(request,env));}catch{return secure(new Response('World Farm is temporarily unavailable.',{status:503}));}}};
