import json,re,shutil,os
import sys
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'src.html')
# 出力先。引数なしなら _build/out（確認用）。配布するときは `python3 build.py ..` でリポジトリ直下へ
OUT=os.path.abspath(sys.argv[1]) if len(sys.argv)>1 else os.path.join(HERE,'out')
s=open(SRC,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
# ---- head ----
rep('<meta name="claude:viewport-fit-sides" content="cover">','<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#0a0a0b">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black">\n<link rel="manifest" href="manifest.webmanifest">')
rep('<style>\n/* Layout','<style>\n:root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\nbody{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}\n/* Layout')
# ---- login CSS + HTML ----
rep('</style>','''.login{position:fixed;inset:0;z-index:100;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:32px max(24px,env(safe-area-inset-right,0px)) 32px max(24px,env(safe-area-inset-left,0px));text-align:center}
.login img{width:84px;height:84px;border-radius:20px}.login h1{margin:6px 0 0;font-size:28px}.login p{margin:0;color:var(--ink2);font-size:14px;line-height:1.7;max-width:320px}
.login .gbtn{margin-top:14px;width:100%;max-width:320px;min-height:52px;border-radius:12px;background:var(--ink);color:var(--bg);font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px}
.login .gbtn svg{width:20px;height:20px}.login .lerr{color:#ff8a80;font-size:13px;min-height:1.5em}
.acct{margin-top:30px}.acct .em{font-size:14px;color:var(--ink2);word-break:break-all;margin-bottom:10px}
</style>''')
LOGIN='<div id="login" class="login" hidden><img src="icon-192.png" alt=""><h1>筋トレログ</h1><p>重量と回数を記録して、推定MAX値の推移を見られる筋トレ記録アプリです。記録はGoogleアカウントに紐づいて保存されます。</p><button type="button" class="gbtn" id="gLogin"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>Googleでログイン</button><div class="lerr" id="lerr" role="alert"></div></div>'
# ---- boot ----
i=s.index("const C = window.claude;");j=s.index("}).catch(() => { S.dbOk = false; S.loaded = { ex: true, s: true, b: true }; render(); });")+len("}).catch(() => { S.dbOk = false; S.loaded = { ex: true, s: true, b: true }; render(); });")
boot=r"""
/* ---- Firebase（Googleログイン＋Firestore）。記録は users/<uid>/ 以下に保存し、本人以外は読み書きできない ---- */
const SEED = __SEED__;
const FB = __CONFIG__;
function startDb(user) {
  const fs = firebase.firestore(), base = 'users/' + user.uid + '/';
  const clean = o => JSON.parse(JSON.stringify(o));
  db = {
    doc: p => { const r = fs.doc(base + p); return { set: d => r.set(clean(d)), delete: () => r.delete(), get: () => r.get(), onSnapshot: (a, b) => r.onSnapshot(a, b) }; },
    collection: p => { const r = fs.collection(base + p); return { onSnapshot: (a, b) => r.onSnapshot(a, b) }; }
  };
  S.user = { email: user.email || '', name: user.displayName || '' };
  S.dbOk = true; render();
  const fail = () => { S.loaded = { ex: true, s: true, b: true }; render(); toast('記録を読み込めませんでした。開き直してください'); };
  const busy = () => !!(sw || holdI || holdT || S.sheet || (document.activeElement && ['exMemo', 'inN', 'exQ', 'pickQ', 'bsName', 'bIn', 'bFat', 'meNm'].includes(document.activeElement.id)));
  fs.doc(base + 'meta/exercises').onSnapshot(snap => {
    if (!snap.exists && !snap.metadata.fromCache && !S.seeded) { S.seeded = true; S.list = clean(SEED); store.saveList(); S.loaded.ex = true; render(); return; }
    S.list = snap.exists && Array.isArray(snap.data().list) ? JSON.parse(JSON.stringify(snap.data().list)) : [];
    S.loaded.ex = true; if (!busy()) render();
  }, fail);
  fs.doc(base + 'meta/routines').onSnapshot(snap => { S.routines = snap.exists && Array.isArray(snap.data().list) ? JSON.parse(JSON.stringify(snap.data().list)) : []; }, () => {});
  fs.collection(base + 'sessions').onSnapshot(q => {
    const o = {}; q.docs.forEach(x => { const v = x.data(); if (v && Array.isArray(v.items)) o[x.id] = JSON.parse(JSON.stringify(v)); });
    S.sessions = o;
    if (!S.loaded.s) { S.loaded.s = true; const s = curSession(); if (s.items.length) selectEx(s.items[0].ex); }
    if (!busy()) render();
  }, fail);
  fs.collection(base + 'body').onSnapshot(q => {
    const o = {}, f = {}, sr = {}, ph = {}; q.docs.forEach(x => { const v = x.data(); if (v && v.kg != null) { o[x.id] = +v.kg; if (v.fat != null && !isNaN(+v.fat)) f[x.id] = +v.fat; if (v.src) sr[x.id] = v.src; if (v.ph) ph[x.id] = 1; } });
    S.body = o; S.fat = f; S.bsrc = sr; S.bph = ph; S.loaded.b = true; if (!busy()) render();
  }, fail);
}
(function () {
  const lg = document.getElementById('login'), le = document.getElementById('lerr');
  const showLogin = msg => { lg.hidden = false; le.textContent = msg || ''; };
  try {
    firebase.initializeApp(FB);
    try { firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch (e) {}
    document.getElementById('gLogin').addEventListener('click', () => {
      le.textContent = '';
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e => {
        if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) return;
        le.textContent = e && e.code === 'auth/popup-blocked' ? 'ポップアップがブロックされました。許可してもう一度お試しください' : e && e.code === 'auth/unauthorized-domain' ? 'このアドレスはログインが許可されていません' : 'ログインできませんでした。通信状況を確認してもう一度お試しください';
      });
    });
    let started = false;
    firebase.auth().onAuthStateChanged(u => {
      if (u) { lg.hidden = true; if (!started) { started = true; startDb(u); } }
      else if (started) location.reload();
      else showLogin();
    });
  } catch (e) { S.dbOk = false; S.loaded = { ex: true, s: true, b: true }; render(); showLogin('起動できませんでした。開き直してください'); }
})();
window.signOutApp = () => firebase.auth().signOut().then(() => location.reload());"""
cfg=open(os.path.join(HERE,'config.json'),encoding='utf-8').read()
seed=open(os.path.join(HERE,'seed.json'),encoding='utf-8').read()
s=s[:i]+boot.replace('__SEED__',seed).replace('__CONFIG__',cfg)+s[j:]
# ---- scripts ----
i0=s.index('<script>\n'); s=s[:i0]+LOGIN+'\n<script src="firebase-app-compat.js"></script>\n<script src="firebase-auth-compat.js"></script>\n<script src="firebase-firestore-compat.js"></script>\n'+s[i0:]
# ---- account section + download ----
rep("""data-act="bkimp">読み込む</button></div>';""","""data-act="bkimp">読み込む</button></div><div class="bkrow" style="margin-top:8px"><button type="button" class="bo" style="min-height:44px;grid-column:1/-1" data-act="bkdl">ファイルに保存</button></div>' +
    '<div class="acct"><div class="sect">アカウント</div><div class="em">' + esc(S.user && S.user.email || '') + '</div><button type="button" class="bo" style="min-height:44px;width:100%" data-act="logout">ログアウト</button></div>';""")
rep("  else if (a === 'expsel') {","""  else if (a === 'bkdl') {
    try { const u = URL.createObjectURL(new Blob([backupJSON()], { type: 'application/json' })), l = document.createElement('a'); l.href = u; l.download = 'kintore-log-' + today() + '.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast('保存しました'); } catch (e) { openSheetKind('export'); }
  }
  else if (a === 'logout') { if (window.signOutApp) window.signOutApp(); }
  else if (a === 'expsel') {""")
# service worker registration
k=s.index('</style>')+len('</style>'); s='<!doctype html>\n<html lang="ja"><head>\n'+s[:k]+'\n</head><body>'+s[k:]+"\n<script>if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}</script>\n</body></html>"
os.makedirs(OUT,exist_ok=True)
open(OUT+'/index.html','w',encoding='utf-8').write(s)
# firebase-*-compat.js（v10.14.1）はリポジトリ直下に置いてある。確認用の出力先にはコピーする
for f in ['app','auth','firestore']:
    n='firebase-%s-compat.js'%f; a=os.path.join(HERE,'..',n); b=os.path.join(OUT,n)
    if os.path.exists(a) and os.path.abspath(a)!=os.path.abspath(b): shutil.copy(a,b)
print(len(s))
