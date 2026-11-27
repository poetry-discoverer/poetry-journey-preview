# usage: seo.py <root> <base_url> [noindex]   idempotent: strips its own block (<!--seo-->...<!--/seo-->) and rewrites
import re,sys,glob,os,json,html,datetime
R,BASE=sys.argv[1],sys.argv[2].rstrip('/')+'/'; NOIDX=len(sys.argv)>3
NAME='آداب الإنجليزية: قواعد وجرامر وشعر وأساطير'
KW_AR='الأدب الإنجليزي, الشعر الإنجليزي, تاريخ الشعر الإنجليزي, قواعد اللغة الإنجليزية, تعلم الإنجليزية من الصفر, كلية الآداب قسم اللغة الإنجليزية, ميثولوجيا, تحليل القصائد, النقد الأدبي'
KW_EN='English literature, English poetry, history of English poetry, English grammar, learn English poetry, poetry analysis, mythology in poetry, literary criticism'
PAGES={
'index.html':('الأدب الإنجليزي والشعر والقواعد من الصفر','كورسات مجانية في الأدب الإنجليزي: الشعر، تاريخ الشعر الإنجليزي، الميثولوجيا، تحليل القصائد، والقواعد. دروس بالصوت وPDF وأسئلة، من الصفر لحد المستوى المتقدم.'),
'track-poetry.html':('كورس الشعر الإنجليزي من الصفر','تعلم الشعر الإنجليزي خطوة خطوة: الوزن والقافية والصور والرموز، مع أمثلة من قصائد مشهورة، بالصوت وPDF وأسئلة بعد كل درس.'),
'track-mythology.html':('كورس الميثولوجيا في الأدب الإنجليزي','الأساطير اليونانية والرومانية وأثرها في الشعر الإنجليزي: زيوس وأبولو وأرتميس وغيرهم، وإزاي ظهروا في قصائد ميلتون وكيتس وشيلي.'),
'track-history.html':('تاريخ الشعر الإنجليزي من Beowulf لحد الحداثة','رحلة تاريخ الشعر الإنجليزي: العصر القديم، تشوسر، النهضة، الرومانسية، الفيكتوري والحداثة، بدروس قصيرة بالصوت وأسئلة.'),
'track-intensive.html':('مناهج النقد الأدبي: السلسلة المكثفة','المناهج النقدية الحديثة في الأدب: الشكلانية، النفسي، الأسطوري وغيرها، مبسطة بأمثلة لطالب الأدب الإنجليزي.'),
'track-analysis.html':('تحليل القصائد الإنجليزية المهمة','تحليل قصائد إنجليزية مهمة سطر بسطر: Eliot وYeats وDickinson وWhitman وغيرهم، مع شرح الصور والرموز والأسئلة.'),
'track-grammar.html':('كورس قواعد اللغة الإنجليزية (Grammar) من الصفر','قواعد اللغة الإنجليزية من الصفر: الصحة النحوية، مستويات اللغة، الصوتيات والصرف والنحو والدلالة، بدروس بالصوت وأسئلة.'),
'glossary.html':('قاموس مصطلحات الشعر الإنجليزي','مصطلحات الشعر الإنجليزي بالعربي والإنجليزي: meter وrhyme وmetaphor وغيرها، بتعريف بسيط وتمارين.'),
'grammar-glossary.html':('قاموس مصطلحات القواعد','مصطلحات قواعد اللغة الإنجليزية بالعربي والإنجليزي: phonology وsyntax وpragmatics وغيرها، بتعريف بسيط.'),
'exam.html':('امتحانات الأدب الإنجليزي','امتحانات قصيرة على الشعر والميثولوجيا وتاريخ الشعر والقواعد، بتصحيح فوري وشرح لكل إجابة.'),
'review.html':('مراجعة متباعدة للأدب الإنجليزي','مراجعة بنظام التكرار المتباعد على أسئلة الدروس عشان المعلومة تثبت.'),
'progress.html':('تقدمك في الدروس',None),'offline.html':('الدروس المتحملة',None),
}
NOINDEX_PAGES={'progress.html','offline.html'}
def plain(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
def trim(s,n=155):
    s=s.strip()
    if len(s)<=n: return s
    return s[:n].rsplit(' ',1)[0].rstrip('،.:؛ ')+'…'
def block(url,title,desc,typ,ld,noidx=False,kw=True):
    e=lambda s:html.escape(s,quote=True)
    t=f'<meta name="description" content="{e(desc)}">\n'
    if kw: t+=f'<meta name="keywords" content="{e(KW_AR+", "+KW_EN)}">\n'
    t+=f'<meta name="robots" content="{"noindex,nofollow" if (NOIDX or noidx) else "index,follow,max-image-preview:large"}">\n'
    t+=f'<link rel="canonical" href="{url}">\n<meta property="og:type" content="{typ}"><meta property="og:site_name" content="{e(NAME)}"><meta property="og:locale" content="ar_EG">\n<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}assets/icons/icon-512.png">\n'
    t+=f'<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{BASE}assets/icons/icon-512.png">\n'
    if ld: t+='<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False)+'</script>\n'
    return '<!--seo-->'+t+'<!--/seo-->'
def apply(path,url,title,desc,typ,ld,noidx=False):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'<!--seo-->.*?<!--/seo-->\n?','',s,flags=re.S)
    s=re.sub(r'<meta name="description"[^>]*>\n?','',s)
    full=title+' | '+NAME if title!=NAME else NAME
    s=re.sub(r'<title>.*?</title>','<title>'+html.escape(full)+'</title>',s,count=1,flags=re.S)
    s=s.replace('</title>','</title>\n'+block(url,full,desc,typ,ld,noidx),1)
    open(path,'w',encoding='utf-8').write(s)
urls=[]
ORG={'@type':'Organization','name':NAME,'url':BASE}
for f,(t,d) in PAGES.items():
    p=os.path.join(R,f)
    if not os.path.exists(p): continue
    url=BASE if f=='index.html' else BASE+f
    ld=None
    if f=='index.html':
        ld={'@context':'https://schema.org','@graph':[{'@type':'WebSite','name':NAME,'url':BASE,'inLanguage':'ar','description':d},{'@type':'EducationalOrganization','name':NAME,'url':BASE,'logo':BASE+'assets/icons/icon-512.png'}]}
    elif f.startswith('track-'):
        ld={'@context':'https://schema.org','@type':'Course','name':t,'description':d,'inLanguage':'ar','isAccessibleForFree':True,'provider':ORG,'educationalLevel':'Beginner to Advanced','url':url}
    if d is None: d='صفحة من موقع '+NAME+'.'
    apply(p,url,t,d,'website',ld,f in NOINDEX_PAGES)
    if f not in NOINDEX_PAGES: urls.append((url,'0.9' if f=='index.html' else '0.8'))
TRACK={'poetry':'track-poetry.html','myth':'track-mythology.html','history':'track-history.html','intensive':'track-intensive.html','analysis':'track-analysis.html','grammar':'track-grammar.html'}
n=0
for f in sorted(glob.glob(R+'/lessons/*.html')):
    lid=os.path.basename(f)[:-5]; s=open(f,encoding='utf-8').read()
    m=re.search(r'<h1>(.*?)</h1>',s,re.S); title=plain(m.group(1)) if m else lid
    i=s.find('window.STEPS='); desc=''
    if i>0:
        j=s.find(';</script>',i)
        try:
            for x in json.loads(s[i+13:j]):
                if x.get('t')=='learn' and x.get('h'): desc=plain(x['h']); break
        except Exception: pass
    desc=trim(desc) if desc else title
    desc=trim(desc+' درس بالصوت وPDF وأسئلة.',170) if len(desc)<110 else desc
    key=lid.split('-')[0]
    url=BASE+'lessons/'+lid+'.html'
    ld={'@context':'https://schema.org','@type':'LearningResource','name':title,'description':desc,'inLanguage':'ar','learningResourceType':'lesson','isAccessibleForFree':True,'educationalLevel':'Beginner','teaches':title,'isPartOf':{'@type':'Course','name':PAGES.get(TRACK.get(key,''),('',''))[0],'url':BASE+TRACK.get(key,'')},'provider':ORG,'url':url}
    apply(f,url,title,desc,'article',ld); urls.append((url,'0.6')); n+=1
today=datetime.date.today().isoformat()
sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'<url><loc>{u}</loc><lastmod>{today}</lastmod><priority>{p}</priority></url>\n' for u,p in urls)+'</urlset>\n'
open(R+'/sitemap.xml','w',encoding='utf-8').write(sm)
open(R+'/robots.txt','w').write('User-agent: *\n'+('Disallow: /\n' if NOIDX else 'Allow: /\n')+('' if NOIDX else f'Sitemap: {BASE}sitemap.xml\n'))
print('pages',len(urls),'lessons',n)
