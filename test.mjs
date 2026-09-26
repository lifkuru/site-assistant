import w from './worker.js';
const base={ANTHROPIC_API_KEY:'x', ALLOWED_ORIGIN:'https://lifkuru.com,https://lifkuru.pages.dev'};
globalThis.fetch = async (url, init) => {
  if(String(url).includes('siteverify')){ const tok=init.body.get('response'); return new Response(JSON.stringify({success: tok==='good'}),{status:200}); }
  return new Response(JSON.stringify({content:[{type:'text',text:'**Audit** — see:\n- a\n- b\n## Head\nSecond sentence here. Third sentence cut off mid'}], stop_reason:'max_tokens'}), {status:200});
};
const req=(o={})=>new Request('https://x/', {method:o.method||'POST', headers:{'Content-Type':'application/json', ...(o.origin?{'Origin':o.origin}:{}), 'CF-Connecting-IP':o.ip||'1.2.3.4'}, body:(o.method==='GET')?undefined:JSON.stringify({lang:'en',messages:[{role:'user',content:'hi'}], ...(o.ts!==undefined?{ts:o.ts}:{})})});
const show=async(name,r)=>console.log(name, r.status, (await r.text()).slice(0,120));
await show('GET (monitor)', await w.fetch(req({method:'GET'}),base));
await show('no key', await w.fetch(req({origin:'https://lifkuru.com'}),{ALLOWED_ORIGIN:base.ALLOWED_ORIGIN}));
await show('no secret, no ts -> ok + clean', await w.fetch(req({origin:'https://lifkuru.com'}),base));
const env={...base, TURNSTILE_SECRET:'s'};
await show('secret, no ts', await w.fetch(req({origin:'https://lifkuru.com'}),env));
await show('secret, bad ts', await w.fetch(req({origin:'https://lifkuru.com',ts:'bad'}),env));
await show('secret, good ts', await w.fetch(req({origin:'https://lifkuru.com',ts:'good'}),env));
