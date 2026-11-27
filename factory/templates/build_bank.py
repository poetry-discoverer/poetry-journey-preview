import json,glob,re,html,sys,os
R=sys.argv[1] if len(sys.argv)>1 else '.'
def txt(h): return html.unescape(re.sub(r'<[^>]+>','',h)).strip()
CN={'poetry':'poetry','myth':'myth','history':'history','intensive':'intensive'}
B=[]
for f in sorted(glob.glob(R+'/lessons/*.html')):
    lid=os.path.basename(f)[:-5]; H=open(f,encoding='utf-8').read()
    i=H.find('window.STEPS=')+13; j=H.find(';</script>',i); S=[x for x in json.loads(H[i:j]) if not x.get('hide')]
    m=re.search(r'<h1>(.*?)</h1>',H,re.S); title=txt(m.group(1)) if m else lid
    for k,s in enumerate(S):
        if s['t'] not in('mc','tf') or '_____' in s['q'] or 'ex' not in s: continue
        if s['t']=='tf': o=['صح ✅','غلط ❌']; a=0 if s['ans'] else 1
        else: o=s['opts']; a=s['ans']
        B.append({'id':lid+':'+str(k),'c':lid.split('-')[0],'l':lid,'lt':title,'q':s['q'],'o':o,'a':a,'ex':s['ex']})
open(R+'/assets/bank.js','w',encoding='utf-8').write('window.BANK='+json.dumps(B,ensure_ascii=False)+';')
import collections; print(len(B),collections.Counter(b['c'] for b in B))
