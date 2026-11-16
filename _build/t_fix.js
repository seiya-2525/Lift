// 片手・片側種目のボリューム2倍と「記録の整理」（半分にする・元に戻す）を確かめる。python3 _build/mk_test.py && node _build/t_fix.js
const {chromium}=require('playwright');const D=require('./sample.json');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780},hasTouch:true,isMobile:true});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file://'+__dirname+'/test.html');
await p.evaluate(D=>{const S=__t.S;S.list=D.list.concat([
  {id:'xd1',name:'ダンベルショルダープレス',cat:'free',step:2,parts:['shoulder']},
  {id:'xc1',name:'ケーブルフライ',cat:'machine',step:2.5,parts:['chest']},
  {id:'xm1',name:'マシンショルダープレス',cat:'machine',step:5,parts:['shoulder']}]);
  S.sessions=Object.assign({},D.sessions,{
  '2026-10-06':{date:'2026-10-06',items:[{ex:'xd1',sets:[{w:36,r:10}]},{ex:'xc1',sets:[{w:10,r:10}]},{ex:'xm1',sets:[{w:40,r:10}]}]},
  '2026-11-03':{date:'2026-11-03',items:[{ex:'xd1',sets:[{w:18,r:10}]}]}});
  S.body=Object.assign({},D.body);S.dbOk=true;S.loaded={ex:true,s:true,b:true};S.tab='me';__t.render()},D);
await p.touchscreen.tap(180,8);await p.waitForTimeout(100);
const ok=[];const chk=(n,c)=>{ok.push((c?'OK ':'NG ')+n)};
const r=await p.evaluate(()=>{const m=__t.exMap(),isDB=__t.isDB,volMul=__t.volMul;return {d:isDB(m.xd1),c:isDB(m.xc1),mm:isDB(m.xm1),vd:volMul(m.xd1),vm:volMul(m.xm1)}});
chk('ダンベルは片手扱い',r.d&&r.vd===2);chk('ケーブルフライは片側扱い',r.c);chk('マシンは通常',!r.mm&&r.vm===1);
await p.evaluate(()=>document.querySelector('[data-act=fixopen]').click());await p.waitForTimeout(150);
const names=await p.evaluate(()=>[...document.querySelectorAll('#bsheet [data-act=fixex] .nm')].map(x=>x.textContent));
chk('整理の一覧にダンベル・ケーブルだけ出る '+names.join('/'),names.includes('ダンベルショルダープレス')&&names.includes('ケーブルフライ')&&!names.includes('マシンショルダープレス'));
await p.evaluate(()=>document.querySelector('[data-act=fixex][data-id=xd1]').click());await p.waitForTimeout(150);
await p.evaluate(()=>document.querySelector('[data-act=fixtog][data-d="2026-10-06"]').click());await p.waitForTimeout(80);
await p.evaluate(()=>document.querySelector('#fixGo').click());await p.waitForTimeout(80);
chk('1回目では変わらない',await p.evaluate(()=>__t.S.sessions['2026-10-06'].items[0].sets[0].w)===36);
await p.evaluate(()=>document.querySelector('#fixGo').click());await p.waitForTimeout(300);
const a=await p.evaluate(()=>[__t.S.sessions['2026-10-06'].items[0].sets[0].w,__t.S.sessions['2026-11-03'].items[0].sets[0].w,__t.S.sessions['2026-10-06'].items[2].sets[0].w]);
chk('選んだ日だけ半分 '+a,a[0]===18&&a[1]===18&&a[2]===40);
await p.evaluate(()=>{__t.S.sheet={kind:'fix',key:'fix:x',ex:null,sel:{},arm:false};__t.render()});await p.waitForTimeout(100);
await p.evaluate(()=>{const x=document.querySelector('[data-act=fixundo]');x&&x.click()});await p.waitForTimeout(300);
chk('元に戻す',await p.evaluate(()=>__t.S.sessions['2026-10-06'].items[0].sets[0].w)===36);
console.log(ok.join('\n'));console.log(ok.every(x=>x.startsWith('OK'))?'fix OK':'fix NG',errs);await b.close()})();
