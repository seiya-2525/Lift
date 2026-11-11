s=open('/tmp/claude-0/-home-claude/ad341c87-ac34-5779-8476-39fc5fad45ec/scratchpad/app/index.html',encoding='utf-8').read()
s=s.replace("let db = null;","let db = null;window.__t={get S(){return S},render:()=>render()};",1).replace('<style>','<style>[hidden]{display:none!important}',1)
s='<!doctype html><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">'+s
open('test.html','w',encoding='utf-8').write(s)
