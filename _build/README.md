# 配布版の作り方

- 正本のソースは Claude アーティファクト（練習用）の index.html。
- `build.py` の `SRC` を正本の index.html に、`OUT` を出力先に書き換えて `python3 build.py` を実行すると、配布用の index.html と sw.js ができる。
- `config.json` は Firebase の設定（公開してよい値）、`seed.json` は初回に入れる標準45種目。
- `t_boot.js` は偽の Firebase で起動を確かめる Playwright テスト。`mk_test.py` は練習用ソースをテスト用の test.html にする。
- Firebase の読み込みファイルは firebase@10.14.1 の `firebase-*-compat.js`（リポジトリ直下に配置済み）。
