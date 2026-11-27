import sys,re,json,glob,os,html,subprocess
SRC=sys.argv[1]; OUT=sys.argv[2]; ONLY=sys.argv[3:] 
os.makedirs(OUT,exist_ok=True)
EMO=re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200d\u2190-\u21FF\u2300-\u23FF]')
def clean(h):
    h=re.sub(r'<span class="em">.*?</span>','',h)
    return EMO.sub('',h)
CSS='''
@font-face{font-family:T;src:url(file://%(r)s/assets/fonts/thmanyah-sans-regular.woff2);font-weight:400}
@font-face{font-family:T;src:url(file://%(r)s/assets/fonts/thmanyah-sans-medium.woff2);font-weight:500}
@font-face{font-family:T;src:url(file://%(r)s/assets/fonts/thmanyah-sans-bold.woff2);font-weight:700}
@font-face{font-family:T;src:url(file://%(r)s/assets/fonts/thmanyah-sans-black.woff2);font-weight:900}
@font-face{font-family:N;src:url(file://%(r)s/assets/fonts/nunito-400.woff2);font-weight:400}
@font-face{font-family:N;src:url(file://%(r)s/assets/fonts/nunito-700.woff2);font-weight:700}
@page{size:A4;margin:18mm 16mm}
body{font-family:T,N,sans-serif;font-size:17pt;line-height:2;color:#111;direction:rtl;margin:0;background:#fff}
.brand{color:#58a700;font-weight:700;font-size:13pt;margin-bottom:4pt}
h1{font-size:27pt;line-height:1.5;margin:0 0 14pt;font-weight:900;border-bottom:3pt solid #58cc02;padding-bottom:8pt}
h2{font-size:21pt;font-weight:900;margin:22pt 0 6pt;color:#1a73b8;break-after:avoid}
.u,.li,p{margin:0 0 9pt;break-inside:avoid}
.lead{font-weight:700;color:#58a700;margin-bottom:2pt}
.en{font-family:N,T,sans-serif;direction:ltr;unicode-bidi:isolate;font-weight:700}
.q{margin:14pt 0 4pt;font-weight:700;break-inside:avoid}
.opt{margin:0 22pt 2pt 0}
.ans{background:#f3fbe9;border-right:4pt solid #58cc02;padding:6pt 12pt;margin:6pt 0}
.write{border-bottom:1.2pt solid #bbb;height:30pt;margin:0 0 2pt}
.src{font-size:12pt;color:#444;margin-top:20pt;border-top:1pt solid #ccc;padding-top:8pt;line-height:1.8}
.src a{color:#1a73b8;word-break:break-all;direction:ltr;unicode-bidi:isolate}
ul{margin:0 0 8pt;padding-right:22pt}
'''
def build(lid,H,root):
    i=H.find('window.STEPS=');j=H.find(';</script>',i);S=[x for x in json.loads(H[i+13:j]) if not x.get('hide')]
    title=html.unescape(re.search(r'<h1>(.*?)</h1>',H,re.S).group(1))
    title=re.sub(r'<[^>]+>','',title)
    out=[f'<div class="brand">آداب الإنجليزية: قواعد وجرامر وشعر وأساطير</div><h1>{html.escape(EMO.sub("",title)).strip()}</h1>']
    key=[];qn=0;end=None;ABC='أبجدهـ'
    for s in S:
        t=s['t']
        if t=='section': out.append('<h2>'+clean(s['h']).strip()+'</h2>')
        elif t=='learn': out.append(clean(s['h']))
        elif t in('mc','tf'):
            qn+=1; out.append(f'<div class="q">س{qn}) {clean(s["q"])}</div>')
            if t=='tf':
                out.append('<div class="opt">○ صح &nbsp;&nbsp;&nbsp; ○ غلط</div>'); key.append(f'س{qn}: '+('صح' if s['ans'] else 'غلط')+(' — '+clean(s.get('why','')) if s.get('why') and s['why'] not in('صح','غلط') else ''))
            else:
                for k,o in enumerate(s['opts']): out.append(f'<div class="opt">○ {clean(o)}</div>')
                key.append(f'س{qn}: '+clean(s['opts'][s['ans']]))
        elif t=='recall':
            qn+=1; out.append(f'<div class="q">س{qn}) {clean(s["q"])}</div><div class="write"></div><div class="write"></div>'); key.append(f'س{qn}: '+clean(s['a']))
        elif t=='write':
            qn+=1; out.append(f'<div class="q">س{qn}) {clean(s["q"])}</div><div class="write"></div><div class="write"></div><div class="write"></div>')
            if s.get('a'): key.append(f'س{qn} (إجابة نموذجية): '+clean(s['a']))
        elif t=='end': end=s
    if key: out.append('<h2>الإجابات</h2>'+''.join(f'<div class="ans">{k}</div>' for k in key))
    if end and end.get('extra'): out.append('<div class="src">'+clean(end['extra'])+'</div>')
    return f'<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{html.escape(title)}</title><style>{CSS%{"r":root}}</style></head><body>'+'\n'.join(out)+'</body></html>'
for f in sorted(glob.glob(SRC+'/lessons/*.html')):
    lid=os.path.basename(f)[:-5]
    if ONLY and lid not in ONLY: continue
    H=open(f,encoding='utf-8').read()
    if 'window.STEPS=' not in H: continue
    hp=f'./{lid}.html'; open(hp,'w',encoding='utf-8').write(build(lid,H,SRC))
    r=subprocess.run(['google-chrome','--headless=new','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--no-pdf-header-footer','--virtual-time-budget=3000',f'--print-to-pdf={OUT}/{lid}.pdf',f'file://{hp}'],capture_output=True,text=True)
    print(lid,os.path.getsize(f'{OUT}/{lid}.pdf'))
