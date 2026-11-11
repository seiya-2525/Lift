# 練習用ソース（src.html）を、Playwright で直接開けるテスト用の test.html にする
import os
H=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(H,'src.html'),encoding='utf-8').read()
s=s.replace("let db = null;","let db = null;window.__t={get S(){return S},render:()=>render(),setDb:d=>{db=d}};",1).replace('<style>','<style>[hidden]{display:none!important}',1)
s='<!doctype html><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1">'+s
open(os.path.join(H,'test.html'),'w',encoding='utf-8').write(s)
