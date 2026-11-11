# 確認用アーティファクトの材料を作る。python3 _build/mk_preview.py v71 <出力先>
#   <出力先>/lift_<版>.html … src.html の題名に版を付けたもの（Artifact で db 付きで公開する）
#   <出力先>/seed/w*.json … 見本データ（sample.json）を入れる ArtifactData の batch（50件ずつ）
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__))
ver, out = sys.argv[1], os.path.abspath(sys.argv[2])
os.makedirs(out + '/seed', exist_ok=True)
s = open(H + '/src.html', encoding='utf-8').read()
assert '<title>筋トレログ</title>' in s
open(out + '/lift_' + ver + '.html', 'w', encoding='utf-8').write(s.replace('<title>筋トレログ</title>', '<title>筋トレログ ' + ver + '</title>', 1))
d = json.load(open(H + '/sample.json', encoding='utf-8'))
def put(name, obj, col, doc):
    p = out + '/seed/' + name + '.json'; json.dump(obj, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    return {'op': 'set', 'collection': col, 'doc_id': doc, 'file_path': p}
w = [put('ex', {'list': d['list']}, 'meta', 'exercises')]
w += [put('s_' + k, v, 'sessions', k) for k, v in d['sessions'].items()]
w += [put('b_' + k, {'kg': v}, 'body', k) for k, v in d['body'].items()]
for i in range(0, len(w), 50): json.dump(w[i:i + 50], open(out + '/seed/w' + str(i // 50 + 1) + '.json', 'w'))
print(out + '/lift_' + ver + '.html', len(w), 'docs')
