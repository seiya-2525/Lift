// 相棒のひとこと（v91）の優先順と各文を、場面ごとの作り物データで確かめる。python3 _build/mk_test.py && node _build/t_notes.js
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:780},hasTouch:true,isMobile:true});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file://'+__dirname+'/test.html');
const run=async(name,spec,expect)=>{const t=await p.evaluate(spec=>{
  const S=__t.S,pd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)},y=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const now=new Date(),T=y(now),ad=n=>{const d=pd(T);d.setDate(d.getDate()+n);return y(d)};
  S.list=[{id:'a',name:'ベンチプレス',cat:'free',step:2.5,parts:['chest']},{id:'b',name:'スクワット',cat:'free',step:2.5,parts:['leg']},{id:'c',name:'デッドリフト',cat:'free',step:2.5,parts:['back']},{id:'r',name:'ラットプルダウン',cat:'machine',step:5,parts:['back']},{id:'l',name:'レッグプレス',cat:'machine',step:10,parts:['leg']}];
  S.sessions={};S.body={};
  spec.forEach(([off,ex,w,r,n])=>{const d=ad(off);const s=S.sessions[d]||(S.sessions[d]={date:d,items:[]});s.items.push({ex,sets:Array.from({length:n||1},()=>({w,r}))})});
  S.body[ad(-400)]=60;S.body[ad(-1)]=65;
  S.dbOk=true;S.loaded={ex:true,s:true,b:true};S.tab='me';S.sheet=null;__t.render();
  return document.querySelector('.menote').innerText.replace(/^相棒\s*/,'').replace(/\n/g,' / ');
},spec);const ok=expect.every(x=>t.includes(x));console.log((ok?'OK ':'NG ')+name+' → '+t);return ok};
const R=[];
R.push(await run('自己ベスト＋3回連続',[[-30,'a',80,5],[-20,'a',80,6],[-2,'a',85,5],[-15,'r',50,10],[-10,'r',55,10],[-3,'r',60,10]],['ベンチプレスで自己ベストを更新','ラットプルダウンが3回連続']));
R.push(await run('7日以上空いた＋キリ',[[-40,'b',90,5],[-30,'b',92.5,5],[-12,'b',85,5]],['12日空いています','スクワット、推定MAX値110kgまで']));
R.push(await run('偏り＋停滞',[[-25,'r',60,10],[-20,'r',55,10],[-15,'r',58,10],[-10,'r',55,10],[-3,'r',59,10],[-2,'a',60,10,20],[-1,'c',60,5,2]].map(x=>x),['今月は胸','少なめ','ラットプルダウンは4回続けて伸びていません']));
R.push(await run('1年前＋体重比',[[-365,'a',75,5],[-5,'a',70,5],[-370,'b',100,5],[-4,'b',95,5]],['1年前の','体重の']));
R.push(await run('該当なし',[[-3,'l',105,10]],['通算1日目']));
console.log(R.every(Boolean)?'notes OK':'notes NG',errs);await b.close()})();
