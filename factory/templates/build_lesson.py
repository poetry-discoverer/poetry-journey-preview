import sys,re,json,html,hashlib,csv,importlib,os
sys.path.insert(0,'.')
LID,MOD,N,TITLE,PREV,NEXT=sys.argv[1:7]
D=importlib.import_module(MOD)
R='.'
EN=re.compile(r"[A-Za-z][A-Za-z0-9'’\-\.]*(?:[ ,]+[A-Za-z][A-Za-z0-9'’\-\.]*)*")
def wrap(t):
    t=html.escape(t,quote=False)
    return EN.sub(lambda m:'<span class="en">'+m.group(0).rstrip(' ,.')+'</span>'+m.group(0)[len(m.group(0).rstrip(' ,.')):],t)
def card(a):
    out=[]
    for ln in a.split('\n'):
        ln=ln.strip()
        if not ln: continue
        if ln.startswith('! '): out.append('<div class="lead">'+wrap(ln[2:])+'</div>')
        elif ln.startswith('- '): out.append('<div class="li">'+wrap(ln[2:])+'</div>')
        else: out.append('<div class="u">'+wrap(ln)+'</div>')
    return ''.join(out)
def tts(a):
    t=re.sub(r'^[!\-] ','',a,flags=re.M); t=re.sub(r'[\U0001F300-\U0001FAFF\u2600-\u27BF\uFE0F]','',t)
    return re.sub(r'\s+',' ',t).strip()
steps=[];k=0;rows=[];cardmap={}
for x in D.C:
    if x[0]=='s': steps.append({'t':'section','h':wrap(x[1])})
    else:
        k+=1;a=f'{LID}-{k:03d}';tx=tts(x[1]);assert len(tx)<1700,(k,len(tx))
        steps.append({'t':'learn','h':card(x[1]),'n':x[1].count('\n')+1,'a':a,'x':hashlib.md5(tx.encode()).hexdigest()[:8],'en':x[2]})
        rows.append((a,tx)); cardmap[k]=len(steps)-1
ins={}
for after,q in D.Q:
    s={'t':q['t'],'h':'','q':wrap(q['q']),'nq':1}
    if q['t']=='mc':
        assert len(q['opts'])==3 and len(q['ex'])==3
        s.update(opts=[wrap(o) for o in q['opts']],ans=q['ans'],why=wrap(q['opts'][q['ans']]),ex=[wrap(e) for e in q['ex']])
    else:
        assert len(q['ex'])==2; s.update(ans=q['ans'],why='صح' if q['ans'] else 'غلط',ex=[wrap(e) for e in q['ex']])
    ins.setdefault(cardmap[after],[]).append(s)
F=[]
for i,s in enumerate(steps):
    F.append(s); F+=ins.get(i,[])
F.append({'t':'end','h':'','teaser':wrap(D.END),'extra':''})
for i,s in enumerate(F): s['i']=i
js=json.dumps(F,ensure_ascii=False).replace('</','<\\/')
H=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'lesson_template.html'),encoding='utf-8').read()
H=re.sub(r'<title>.*?</title>',f'<title>{html.escape(TITLE)} | آداب الإنجليزية: قواعد وجرامر وشعر وأساطير</title>',H,count=1)
H=re.sub(r'<h1>.*?</h1>',f'<h1>{html.escape(TITLE)}</h1>',H,count=1)
H=re.sub(r'<div class="tags">.*?</div>',f'<div class="tags"><span class="tag"><span class="em">📊</span> تمهيدي</span><span class="tag">الدرس {N}</span><span class="tag"><span class="em">📜</span> تاريخ الشعر</span></div>',H,count=1,flags=re.S)
H=H.replace('history-12',LID)
i=H.find('window.STEPS=')+13;j=H.find(';</script>',i);H=H[:i]+js+H[j:]
prev=f'<a class="btn ghost" href="{PREV}.html"><span class="em">→</span> الدرس اللي قبله</a>'
nxt=f'<a class="btn ghost" href="{NEXT}.html">الدرس اللي بعده <span class="em">←</span></a>' if NEXT!='-' else ''
H=re.sub(r'<div class="navrow">.*?</div>',lambda m:f'<div class="navrow">{prev}<a class="btn ghost" href="../track-history.html">كل دروس الكورس</a>{nxt}</div>',H,count=1,flags=re.S)
open(f'{R}/lessons/{LID}.html','w',encoding='utf-8').write(H)
w=csv.writer(open(f'./{LID}.csv','w',encoding='utf-8',newline=''));w.writerow(['id','tts_text']);w.writerows(rows)
print(LID,'cards',k,'qs',len(D.Q),'steps',len(F),'max tts',max(len(r[1]) for r in rows))
