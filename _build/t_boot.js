const {chromium}=require('playwright');
const fake=`
(function(){const store={};const subs=[];let user=null,authCb=null;
const key=p=>p;
function snapDoc(p){const v=store[p];return {exists:v!==undefined,metadata:{fromCache:false},data:()=>v,id:p.split('/').pop()}}
function notify(){subs.forEach(s=>s())}
const fs={doc:p=>({set:d=>{store[p]=JSON.parse(JSON.stringify(d));Promise.resolve().then(notify);return Promise.resolve()},delete:()=>{delete store[p];Promise.resolve().then(notify);return Promise.resolve()},onSnapshot:(a,b)=>{const f=()=>a(snapDoc(p));subs.push(f);setTimeout(f,0);return()=>{}}}),
collection:p=>({onSnapshot:(a,b)=>{const f=()=>{const docs=Object.keys(store).filter(k=>k.startsWith(p+'/')&&k.slice(p.length+1).indexOf('/')<0).map(k=>({id:k.slice(p.length+1),data:()=>store[k]}));a({docs})};subs.push(f);setTimeout(f,0);return()=>{}}}),
enablePersistence:()=>Promise.resolve()};
window.__store=store;
window.firebase={initializeApp(){},firestore:()=>fs,auth:Object.assign(()=>({onAuthStateChanged:cb=>{authCb=cb;setTimeout(()=>cb(user),0)},signInWithPopup:()=>{user={uid:'u1',email:'t@example.com',displayName:'T'};authCb(user);return Promise.resolve()},signOut:()=>{user=null;return Promise.resolve()}}),{GoogleAuthProvider:function(){}})};
})();`;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:400,height:860},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
for(const f of ['app','auth','firestore'])await p.route('**/firebase-'+f+'-compat.js',r=>r.fulfill({contentType:'application/javascript',body:f==='app'?fake:'/**/'}));
await p.goto('file:///tmp/claude-0/dist/index.html');await p.waitForTimeout(400);
console.log('login shown',await p.evaluate(()=>!document.getElementById('login').hidden));await p.screenshot({path:'/tmp/claude-0/login.png'});
await p.tap('#gLogin');await p.waitForTimeout(600);
console.log('after',await p.evaluate(()=>[document.getElementById('login').hidden,Object.keys(__store).filter(k=>k.includes('meta')),document.body.innerText.slice(0,80)]));
console.log('seeded n',await p.evaluate(()=>__store['users/u1/meta/exercises'].list.length));
await p.screenshot({path:'/tmp/claude-0/boot1.png'});
console.log(errs);await b.close()})();
