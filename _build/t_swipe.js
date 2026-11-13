// スワイプの動きをまとめて確かめる。python3 _build/mk_test.py && node _build/t_swipe.js で「swipe OK」。
// 期待値 t_swipe.expected.txt は、動きを意図して変えたときだけ --save で作り直す（変える前のコードで作ること）。
const {chromium}=require('playwright');const D=require('./sample.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780},hasTouch:true,isMobile:true});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file://'+__dirname+'/test.html');
await p.evaluate(D=>{const S=__t.S;S.list=D.list;S.sessions=D.sessions;S.body=D.body;S.dbOk=true;S.loaded={ex:true,s:true,b:true};S.tab='log';S.date='2026-11-05';__t.render()},D);
await p.touchscreen.tap(180,5);await p.waitForTimeout(150);
const cdp=await p.context().newCDPSession(p);
const swipe=async(x0,y0,x1,y1,steps=8,dur=200)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});for(let i=1;i<=steps;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/steps,y:y0+(y1-y0)*i/steps}]});await p.waitForTimeout(dur/steps);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(400);};
const at=q=>p.evaluate(q=>{const e=document.querySelector(q);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]},q);
const st=()=>p.evaluate(()=>{const S=__t.S;return JSON.stringify({tab:S.tab,date:S.date,tray:S.trayOpen,g:S.gOpen,gp:S.gPart,calM:S.calM,calA:S.calA,ex:S.exPart,pk:S.pickPart,picking:S.picking})});
const R=[];const run=async(n,f)=>{try{R.push([n,await f()]);}catch(e){R.push([n,'ERR '+e.message.split('\n')[0]]);}};
let c;
// 1 記録の一覧：日付の見出し・一覧の横スワイプ
await run('dayhead→',async()=>{c=await at('.dayhead');await swipe(c[0]-100,c[1],c[0]+100,c[1]);return st();});
await run('list→',async()=>{await p.evaluate(()=>window.scrollTo(0,0));await swipe(60,400,300,400);return st();});
await run('list←',async()=>{await swipe(300,400,60,400);return st();});
// 2 開いたカード（トレイ）：種目名の横スワイプ、下に引いて閉じる
const openTray=()=>p.evaluate(()=>{const S=__t.S;S.tab='log';S.date='2026-11-05';S.sel=S.sessions['2026-11-05'].items[0].ex;S.trayOpen=true;S.trayFull=true;__t.render()});
await run('exhead→',async()=>{await openTray();await p.waitForTimeout(300);c=await at('#ocard .exhead');await swipe(c[0]-100,c[1],c[0]+100,c[1]);return st();});
await run('tray pull',async()=>{await openTray();await p.waitForTimeout(300);c=await at('#ocard .exhead');await swipe(c[0],c[1],c[0],c[1]+300,10,250);return st();});
// 3 振り返り
await run('cal→',async()=>{await p.evaluate(()=>{const S=__t.S;S.trayOpen=false;S.tab='cal';S.calM='2026-11';S.calA='2026-11-11';__t.render();window.scrollTo(0,0)});await p.waitForTimeout(200);c=await at('.cal');await swipe(60,c[1],300,c[1]);return st();});
await run('pcard→',async()=>{c=await at('.pcard');await swipe(60,c[1],300,c[1]);return st();});
// 4 グラフタブ：部位の切替、詳細カードを下に引いて閉じる
await run('graph←',async()=>{await p.evaluate(()=>{__t.S.tab='graph';__t.S.gPart='all';__t.render();window.scrollTo(0,0)});await p.waitForTimeout(200);await swipe(300,450,60,450);await p.waitForTimeout(300);return st();});
await run('graph← again',async()=>{await swipe(300,450,60,450);await p.waitForTimeout(300);return st();});
await run('graph→',async()=>{await swipe(60,450,300,450);await p.waitForTimeout(300);return st();});
await run('graph card pull',async()=>{await p.evaluate(()=>{__t.S.gPart='all';__t.render();window.scrollTo(0,0)});c=await at('[data-act=gopen]');await p.touchscreen.tap(c[0],c[1]);await p.waitForTimeout(400);const o=await st();await swipe(180,120,180,450,10,250);return o+' -> '+await st();});
// 5 種目の管理
await run('ex←',async()=>{await p.evaluate(()=>{__t.S.tab='ex';__t.render();window.scrollTo(0,0)});await p.waitForTimeout(150);c=await at('#exListWrap');await swipe(300,c[1],60,c[1]);await p.waitForTimeout(300);return st();});
// 6 種目選択シート
await run('pick←',async()=>{await p.evaluate(()=>{const S=__t.S;S.tab='log';S.picking='log';S.pickQ='';__t.renderSheet()});await p.waitForTimeout(400);c=await at('#pickBd');await swipe(300,c[1],40,c[1],10,250);await p.waitForTimeout(300);return st();});
await run('pick← again',async()=>{await swipe(300,c[1],40,c[1],10,250);await p.waitForTimeout(300);return st();});
await run('pick small→',async()=>{await swipe(100,c[1],140,c[1],6,250);await p.waitForTimeout(300);return st();});
const got=R.map(r=>JSON.stringify(r)).join('\n')+'\n',fs=require('fs'),f=__dirname+'/t_swipe.expected.txt';
if(process.argv[2]==='--save'){fs.writeFileSync(f,got);console.log('saved\n'+got+errs.join('\n'));}
else{const exp=fs.readFileSync(f,'utf8');console.log(got===exp&&!errs.length?'swipe OK':'swipe NG\n'+got+errs.join('\n'));}
await b.close()})();
