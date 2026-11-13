// スワイプの動きをまとめて確かめる。python3 _build/mk_test.py && node _build/t_swipe.js で「swipe OK」。
// 期待値 t_swipe.expected.txt は、動きを意図して変えたときだけ --save で作り直す。
// スワイプの動きを一通り記録する（リファクタ前後で同じ結果になるかを見る）
const {chromium}=require('playwright');const D=require('./sample.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780},hasTouch:true,isMobile:true});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file://'+__dirname+'/test.html');
await p.evaluate(D=>{const S=__t.S;S.list=D.list;S.sessions=D.sessions;S.body=D.body;S.dbOk=true;S.loaded={ex:true,s:true,b:true};S.tab='log';S.date='2026-11-05';__t.render()},D);
await p.touchscreen.tap(180,5);await p.waitForTimeout(150);
// 合成スワイプ：CDP の touch を使う
const cdp=await p.context().newCDPSession(p);
const swipe=async(x0,y0,x1,y1,steps=8,dur=200)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});for(let i=1;i<=steps;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/steps,y:y0+(y1-y0)*i/steps}]});await p.waitForTimeout(dur/steps);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(400);};
const at=async q=>p.evaluate(q=>{const e=document.querySelector(q);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]},q);
const st=()=>p.evaluate(()=>{const S=__t.S;return JSON.stringify({tab:S.tab,date:S.date,tray:S.trayOpen,full:S.trayFull,g:S.gOpen,gM:S.gM,calM:S.calM,calA:S.calA,ex:S.exPart,pk:S.pickPart,picking:S.picking})});
const R=[];
// 1 記録：一覧の横スワイプ（右へ＝前日）
let c=await at('.dayhead');R.push(['dayhead→',c&&await (async()=>{await swipe(c[0]-100,c[1],c[0]+100,c[1]);return st();})()]);
c=await at('#app');await p.evaluate(()=>window.scrollTo(0,0));R.push(['list→',await (async()=>{await swipe(60,400,300,400);return st();})()]);
R.push(['list←',await (async()=>{await swipe(300,400,60,400);return st();})()]);
// 2 カード（トレイ）：開いて下に引く
await p.evaluate(()=>{const S=__t.S;S.date='2026-11-05';const s=S.sessions['2026-11-05'];S.sel=s.items[0].ex;S.trayOpen=true;S.trayFull=true;__t.render()});await p.waitForTimeout(300);
c=await at('#ocard .exhead');R.push(['tray open',await st()]);
R.push(['exhead→',await (async()=>{await swipe(c[0]-100,c[1],c[0]+100,c[1]);return st();})()]);
await p.evaluate(()=>{const S=__t.S;S.date='2026-11-05';S.sel=S.sessions['2026-11-05'].items[0].ex;S.trayOpen=true;S.trayFull=true;__t.render()});await p.waitForTimeout(300);
c=await at('#ocard .exhead');R.push(['tray pull down',await (async()=>{await swipe(c[0],c[1],c[0],c[1]+300,10,250);return st();})()]);
// 3 振り返り：カレンダー横スワイプ
await p.evaluate(()=>{__t.S.tab='cal';__t.S.calM='2026-11';__t.S.calA='2026-11-11';__t.render();window.scrollTo(0,0)});await p.waitForTimeout(200);
c=await at('.cal');R.push(['cal→',await (async()=>{await swipe(60,c[1],300,c[1]);return st();})()]);
c=await at('.pcard');R.push(['pcard→',c&&await (async()=>{await swipe(60,c[1],300,c[1]);return st();})()]);
// 4 マイページ：グラフ詳細の指標スワイプと下に引く
await p.evaluate(()=>{__t.S.tab='me';__t.render()});await p.waitForTimeout(150);
c=await at('.cdc');await p.touchscreen.tap(c[0],c[1]);await p.waitForTimeout(300);
R.push(['g←',await (async()=>{await swipe(300,330,60,330);return st();})()]);
R.push(['g←2',await (async()=>{await swipe(300,330,60,330);return st();})()]);
R.push(['g→',await (async()=>{await swipe(60,330,300,330);return st();})()]);
R.push(['g pull',await (async()=>{await swipe(180,120,180,450,10,250);return st();})()]);
// 5 種目の管理：部位スワイプ
await p.evaluate(()=>{__t.S.tab='ex';__t.render();window.scrollTo(0,0)});await p.waitForTimeout(150);
c=await at('#exListWrap');R.push(['ex←',c&&await (async()=>{await swipe(300,c[1],60,c[1]);await p.waitForTimeout(300);return st();})()]);
// 6 種目選択シート
await p.evaluate(()=>{__t.S.tab='log';__t.S.trayOpen=false;__t.render()});
await p.evaluate(()=>{const S=__t.S;S.picking='log';S.pickQ='';__t.renderSheet()});await p.waitForTimeout(400);
c=await at('#pickBd');R.push(['pick←',c&&await (async()=>{await swipe(300,c[1],40,c[1],10,250);await p.waitForTimeout(300);return st();})()]);
R.push(['pick← again',c&&await (async()=>{await swipe(300,c[1],40,c[1],10,250);await p.waitForTimeout(300);return st();})()]);
R.push(['pick small→',c&&await (async()=>{await swipe(100,c[1],140,c[1],6,250);await p.waitForTimeout(300);return st();})()]);
const got=JSON.stringify(R,null,0).replace(/\],\[/g,'],\n[')+'\n',fs=require('fs'),f=__dirname+'/t_swipe.expected.txt';
if(process.argv[2]==='--save'){fs.writeFileSync(f,got);console.log('saved');}
else{const exp=fs.readFileSync(f,'utf8');console.log(got===exp&&!errs.length?'swipe OK':'swipe NG\n'+got+errs.join('\n'));}await b.close()})();
