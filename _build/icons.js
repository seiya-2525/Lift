const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const svg=fs.readFileSync('/tmp/claude-0/dist-src/icon.svg','utf8');
for(const n of [192,512]){const p=await b.newPage({viewport:{width:n,height:n}});await p.setContent('<body style="margin:0;background:#0b0c0e"><img src="data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')+'" width='+n+' height='+n+'>');await p.waitForTimeout(200);await p.screenshot({path:'/tmp/claude-0/dist/icon-'+n+'.png'});}
await b.close()})();
