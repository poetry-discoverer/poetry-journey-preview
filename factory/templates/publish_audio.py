# usage: publish_audio.py <dir with mp3s>  -> copies mp3s, updates manifest audio+pdf maps, bumps sw
import json,os,re,shutil,glob,hashlib,sys
R='.'; D=sys.argv[1]
p=R+'/audio/manifest.js'; M=open(p,encoding='utf-8').read(); pre=M[:M.index('{')]; man=json.loads(M[M.index('{'):].rstrip().rstrip(';'))
n=0
for f in glob.glob(D+'/*.mp3'):
    b=os.path.basename(f); shutil.copy(f,R+'/audio/'+b); man['audio'][b[:-4]]=b; n+=1
for f in os.listdir(R+'/pdf'): man['pdf'].setdefault(f[:-4],f)
open(p,'w',encoding='utf-8').write(pre+json.dumps(man,ensure_ascii=False)+';')
S=open(R+'/sw.js',encoding='utf-8').read(); m=re.search(r'const FILES=(\[.*?\]);',S); F=json.loads(m.group(1))
for f in ('track-analysis.html',):
    if f not in F: F.append(f)
S=S.replace(m.group(0),'const FILES='+json.dumps(F)+';')
S=re.sub(r'const V="[^"]*"','const V="poetry-'+hashlib.md5(os.urandom(4)).hexdigest()[:8]+'"',S); open(R+'/sw.js','w',encoding='utf-8').write(S)
# check every learn step with audio key has a clip
miss=[]
for f in glob.glob(R+'/lessons/analysis-*.html'):
    H=open(f,encoding='utf-8').read(); i=H.find('window.STEPS=')+13; j=H.find(';</script>',i)
    for s in json.loads(H[i:j]):
        if s.get('a') and s['a'] not in man['audio']: miss.append(s['a'])
print('copied',n,'missing',miss)
