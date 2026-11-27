# usage: add_gl.py <root> <lesson_id> <html> <pdf>
import re,json,sys,os,glob,shutil
R,LID,SRC,PDF=sys.argv[1:5]
H=open(SRC,encoding='utf-8').read()
if 'glossary.js' not in H: H=H.replace('<script src="../assets/player.js"></script>','<script src="../assets/glossary.js"></script><script src="../assets/player.js"></script>')
open(f'{R}/lessons/{LID}.html','w',encoding='utf-8').write(H)
shutil.copy(PDF,f'{R}/pdf/{LID}.pdf')
p=f'{R}/audio/manifest.js';M=open(p,encoding='utf-8').read();pre=M[:M.index('{')];man=json.loads(M[M.index('{'):].rstrip().rstrip(';'));man['pdf'][LID]=LID+'.pdf'
open(p,'w',encoding='utf-8').write(pre+json.dumps(man,ensure_ascii=False)+';')
ids=sorted(os.path.basename(f)[:-5] for f in glob.glob(R+'/lessons/grammar-*.html'))
# nav
for k,i in enumerate(ids):
    f=f'{R}/lessons/{i}.html';h=open(f,encoding='utf-8').read()
    nav='<div class="navrow">'
    if k>0: nav+=f'<a class="btn ghost" href="{ids[k-1]}.html"><span class="em">→</span> الدرس اللي قبله</a>'
    nav+='<a class="btn ghost" href="../track-grammar.html">كل دروس الكورس</a>'
    if k<len(ids)-1: nav+=f'<a class="btn ghost" href="{ids[k+1]}.html">الدرس اللي بعده <span class="em">←</span></a>'
    nav+='</div>'
    h=re.sub(r'<div class="navrow">.*?</div>(?=\s*</main>)',nav,h,count=1,flags=re.S)
    h=h.replace('href="track-grammar.html"','href="../track-grammar.html"')
    open(f,'w',encoding='utf-8').write(h)
def title(i):
    h=open(f'{R}/lessons/{i}.html',encoding='utf-8').read(); return re.search(r'<h1>(.*?)</h1>',h,re.S).group(1)
T=open(R+'/track-analysis.html',encoding='utf-8').read()
nodes=''.join(f'<div class="node-row fade">\n<a class="node" data-id="{i}" href="lessons/{i}.html"><span class="em">🧩</span></a>\n<div class="node-label">{title(i)}<small>من الصفر</small></div>\n</div>\n' for i in ids)
T=re.sub(r'<title>.*?</title>','<title>كورس القواعد | آداب الإنجليزية: قواعد وجرامر وشعر وأساطير</title>',T)
T=re.sub(r'<div class="lesson-head fade">.*?</div>\n<div class="overall',f'<div class="lesson-head fade"><div class="emoji"><span class="em">🧩</span></div><h1>كورس القواعد (Grammar)</h1>\n<p style="color:var(--ink-soft)">القواعد من الصفر: إزاي اللغة بتشتغل، وبعدين كل عنصر بشكله ووظيفته ومعناه واستخدامه. كل درس بصوته وPDF وأسئلة.</p>\n<div class="tags"><span class="tag">{len(ids)} درس حتى الآن</span></div></div>\n<div class="overall',T,count=1,flags=re.S)
T=re.sub(r'data-overall="[^"]*"','data-overall="'+','.join(ids)+'"',T)
T=re.sub(r'<div class="path">.*?</div>\n</main>','<div class="path">'+nodes+'</div>\n</main>',T,count=1,flags=re.S)
open(R+'/track-grammar.html','w',encoding='utf-8').write(T)
I=open(R+'/index.html',encoding='utf-8').read()
allids=json.loads(re.search(r'ALL_IDS=(\[.*?\])',I).group(1))
for i in ids:
    if i not in allids: allids.append(i)
for f in glob.glob(R+'/*.html')+glob.glob(R+'/lessons/*.html'):
    s=open(f,encoding='utf-8').read();o=s
    s=re.sub(r'ALL_IDS=\[.*?\]','ALL_IDS='+json.dumps(allids),s)
    if f.endswith('/index.html'): s=re.sub(r'data-overall="[^"]*"','data-overall="'+','.join(allids)+'"',s)
    if s!=o: open(f,'w',encoding='utf-8').write(s)
I=open(R+'/index.html',encoding='utf-8').read()
I=re.sub(r'<div class="card soon fade"><span class="icon c-gray"><span class="em">✏️</span></span><span><h2>كورس القواعد \(Grammar\)</h2>.*?</div>','<a class="card fade" href="track-grammar.html"><span class="icon c-green"><span class="em">🧩</span></span><span><h2>كورس القواعد (Grammar)</h2><span class="sub">من الصفر، الدروس بتتضاف واحد ورا التاني</span></span></a>',I,count=1,flags=re.S)
open(R+'/index.html','w',encoding='utf-8').write(I)
S=open(R+'/sw.js',encoding='utf-8').read();m=re.search(r'const FILES=(\[.*?\]);',S);F=json.loads(m.group(1))
if 'track-grammar.html' not in F: F.append('track-grammar.html')
open(R+'/sw.js','w',encoding='utf-8').write(S.replace(m.group(0),'const FILES='+json.dumps(F)+';'))
print(ids,len(allids))
