(function(){
const PAGE=document.body.dataset.page, root=document.getElementById('qz'), BANK=window.BANK||[];
const DAY=864e5, byId={}; BANK.forEach(b=>byId[b.id]=b);
function S(){ const s=state(); s.sr=s.sr||{}; s.exams=s.exams||{}; return s; }
function sv(s){ save(s); if(window.refreshHeader) refreshHeader(); }
function addXp(n){ const s=S(); s.xp+=n; sv(s); }
function srMiss(id){ const s=S(); s.sr[id]={st:0,due:Date.now()}; sv(s); }
function srRight(id){ const s=S(), r=s.sr[id]; if(!r) return; if(r.st===0){ s.sr[id]={st:1,due:Date.now()+7*DAY}; } else { delete s.sr[id]; s.srm=(s.srm||0)+1; } sv(s); }
function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function prep(b){ const ix=shuf(b.o.map((_,i)=>i)); if(b.o.length===2) ix.sort(); return {b, ix, a:ix.indexOf(b.a)}; }
function el(h){ root.innerHTML=h; window.scrollTo(0,0); }
const NAMES={poetry:'الشعر',intensive:'المنهج النقدي',analysis:'تحليل القصائد',grammar:'القواعد',all:'كل الأسئلة',myth:'الأساطير',history:'تاريخ الشعر'};
let sfxOn=function(k){ };
function tone(f,t,d){ try{ const c=new (window.AudioContext||window.webkitAudioContext)(), o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f; g.gain.value=.12; o.connect(g); g.connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+d); }catch(e){} }
const snd={right(){ tone(784,0,.12); tone(1047,.1,.25); }, wrong(){ tone(196,0,.2); tone(147,.15,.3); }};
function qHtml(p,n,total,extra){ return '<div class="pl-top" style="display:flex;justify-content:space-between;font-weight:900;color:#777;margin:6px 0 14px"><span>'+n+' / '+total+'</span><span>'+(extra||'')+'</span></div><div class="pl-card"><div class="pl-q">'+p.b.q+'</div>'+p.ix.map((i,k)=>'<button class="pl-opt" data-k="'+k+'">'+p.b.o[i]+'</button>').join('')+'<div id="qfb"></div></div>'; }
function fbHtml(p,k,ok){ const b=p.b, ch=p.ix[k];
  if(ok) return '<div class="pl-fb ok"><div style="font-weight:800">✅ صح!</div><div style="font-size:17px;margin:6px 0">'+(b.ex[b.a]||'')+'</div><button class="pl-next" id="qgo">كمّل</button></div>';
  return '<div class="pl-fb no"><div style="font-weight:800">❌ إجابتك مش صح</div><div style="font-size:17px;margin:6px 0">'+(b.ex[ch]||'')+'</div></div><div class="pl-fb ok"><div style="font-weight:800">✅ الإجابة الصح</div><div style="font-size:17px;margin:6px 0">'+(b.ex[b.a]||'')+'</div><div style="font-size:13px;color:#777">📘 الشرح من إعداد الموقع</div><button class="pl-next" id="qgo">فهمت، كمّل</button></div>'; }
// ---- instant-feedback session (practice and review)
function session(list,mode,onEnd){
  const Q=list.map(prep); const N0=Q.length; let i=0, right=0, wrong=0;
  function show(){ if(i>=Q.length){ return onEnd({right,wrong,total:N0}); }
    const p=Q[i]; el(qHtml(p,Math.min(i+1,N0),N0,p.b.lt)); p.tries=p.tries||0;
    let done=false; root.querySelectorAll('.pl-opt').forEach(o=>o.onclick=()=>{ if(done) return; done=true; const k=+o.dataset.k, ok=k===p.a;
      root.querySelectorAll('.pl-opt').forEach(x=>{ x.disabled=true; if(+x.dataset.k===p.a) x.classList.add('right'); }); if(!ok) o.classList.add('wrong');
      if(ok){ if(!p.tries) right++; snd.right(); addXp(mode==='review'?5:(p.tries?0:2)); srRight(p.b.id); } else { wrong++; snd.wrong(); srMiss(p.b.id); if(p.tries<3){ p.tries++; Q.push(p); } }
      document.getElementById('qfb').innerHTML=fbHtml(p,k,ok); document.getElementById('qgo').onclick=()=>{ i++; show(); }; }); }
  show(); }
// ---- timed mock exam
function exam(set,pool){ const n=Math.min(20,pool.length), secs=n*45; const Q=shuf(pool).slice(0,n).map(prep), ans=new Array(n).fill(-1); let i=0, left=secs, tm=null;
  function fmt(t){ return Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); }
  function show(){ const p=Q[i]; el(qHtml(p,i+1,n,'⏱ <span id="qt">'+fmt(left)+'</span>')+'<div style="display:flex;gap:10px;margin-top:14px"><button class="pl-next" id="qprev" style="background:#e5e5e5;color:#555;box-shadow:0 6px 0 #cfcfcf"'+(i?'':' disabled')+'>السابق</button>'+(i<n-1?'<button class="pl-next" id="qnx">التالي</button>':'<button class="pl-next" id="qfin" style="background:#1cb0f6;box-shadow:0 6px 0 #1899d6">سلّم الامتحان</button>')+'</div>');
    root.querySelectorAll('.pl-opt').forEach(o=>{ if(+o.dataset.k===ans[i]) o.classList.add('right'); o.onclick=()=>{ ans[i]=+o.dataset.k; root.querySelectorAll('.pl-opt').forEach(x=>x.classList.toggle('right',+x.dataset.k===ans[i])); }; });
    const pv=document.getElementById('qprev'); if(pv) pv.onclick=()=>{ i--; show(); }; const nx=document.getElementById('qnx'); if(nx) nx.onclick=()=>{ i++; show(); };
    const fi=document.getElementById('qfin'); if(fi) fi.onclick=()=>{ const un=ans.filter(x=>x<0).length; if(un&&!confirm('فيه '+un+' سؤال من غير إجابة. تسلّم برضه؟')) return; finish(); }; }
  function finish(){ clearInterval(tm); const used=secs-left; let ok=0; const bad=[];
    Q.forEach((p,j)=>{ if(ans[j]===p.a) ok++; else { bad.push([p,ans[j]]); srMiss(p.b.id); } });
    const pct=Math.round(ok/n*100), s=S(); const r=s.exams[set]||{best:0,n:0,last:null,hist:[]}; r.n++; r.last=pct; r.best=Math.max(r.best,pct); r.hist=(r.hist||[]).concat([{t:Date.now(),pct,ok,n,used}]).slice(-20); s.exams[set]=r; s.xp+=ok*2; sv(s);
    const msg=pct>=85?'ممتاز! 🎉':pct>=60?'كويس، كمّل 💪':'محتاج مراجعة، والأسئلة الغلط هتيجيلك في «المراجعة» 📚';
    el('<div class="plan-card" style="text-align:center"><div style="font-size:64px;font-weight:900;color:'+(pct>=60?'#58cc02':'#ff4b4b')+'">'+pct+'%</div><h2>'+ok+' من '+n+' · '+fmt(used)+' دقيقة</h2><p>'+msg+'</p><p style="color:#777">أفضل نتيجة: '+r.best+'% · عدد المحاولات: '+r.n+' · +'+(ok*2)+' نقطة</p></div>'+
      (bad.length?'<h3 style="margin:18px 0 8px">الأسئلة اللي غلطت فيها:</h3>'+bad.map(([p,k])=>'<div class="plan-card" style="margin-bottom:12px"><div style="font-size:20px;font-weight:800;margin-bottom:8px">'+p.b.q+'</div>'+(k>=0?'<div class="pl-fb no" style="position:static;border-radius:14px;margin:6px 0"><b>إجابتك:</b> '+p.b.o[p.ix[k]]+'<div style="font-size:16px;margin-top:4px">'+(p.b.ex[p.ix[k]]||'')+'</div></div>':'<div style="color:#b30000;margin:6px 0">من غير إجابة</div>')+'<div class="pl-fb ok" style="position:static;border-radius:14px;margin:6px 0"><b>الصح:</b> '+p.b.o[p.b.a]+'<div style="font-size:16px;margin-top:4px">'+(p.b.ex[p.b.a]||'')+'</div></div><div style="font-size:13px;color:#777">📘 الشرح من إعداد الموقع</div></div>').join(''):'<p style="text-align:center;font-weight:800">كل إجاباتك صح! 🌟</p>')+
      '<button class="pl-next" id="qagain">امتحان جديد</button><a class="pl-next" href="exam.html" style="text-align:center;text-decoration:none;margin-top:12px;background:#1cb0f6;box-shadow:0 6px 0 #1899d6">رجوع للامتحانات</a>');
    document.getElementById('qagain').onclick=()=>exam(set,pool); }
  tm=setInterval(()=>{ left--; const t=document.getElementById('qt'); if(t) t.textContent=fmt(Math.max(left,0)); if(left<=0){ clearInterval(tm); alert('انتهى الوقت'); finish(); } },1000);
  show(); }
function practiceList(k){ const d=due(), inP=d.filter(b=>k==='all'||b.c===k), ids={}; inP.forEach(b=>ids[b.id]=1); return shuf(inP).concat(shuf(pool(k)).filter(b=>!ids[b.id])); }
function pool(set){ return set==='all'?BANK:BANK.filter(b=>b.c===set); }
function examHome(){ const s=S(); const sets=['poetry','intensive','analysis','grammar','all'];
  let h='<div class="lesson-head"><div class="emoji"><span class="em">📝</span></div><h1>الامتحانات</h1><p style="color:var(--ink-soft)">تدريب بتصحيح فوري وشرح لكل إجابة، أو امتحان تجريبي بوقت. نتيجتك بتتحفظ.</p></div>';
  sets.forEach(k=>{ const n=pool(k).length, r=s.exams[k]; const en=Math.min(20,n);
    h+='<div class="plan-card" style="margin-bottom:14px"><h2 style="margin:0 0 6px">'+NAMES[k]+'</h2><p style="color:#777;margin:0 0 12px">'+n+' سؤال'+(r?' · آخر نتيجة '+r.last+'% · أفضل '+r.best+'%':'')+'</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="pl-next" style="flex:1;min-width:140px" data-m="p" data-k="'+k+'">تدريب</button><button class="pl-next" style="flex:1;min-width:140px;background:#1cb0f6;box-shadow:0 6px 0 #1899d6" data-m="e" data-k="'+k+'">امتحان تجريبي · '+en+' سؤال · '+Math.round(en*45/60)+' دقيقة</button></div></div>'; });
  h+='<div class="plan-card" style="margin-bottom:14px;opacity:.7"><h2 style="margin:0 0 6px">الأساطير وتاريخ الشعر</h2><p style="color:#777;margin:0">أسئلتهم المستقلة بتتضاف قريباً.</p></div><p style="text-align:center"><a href="review.html" style="font-weight:900;color:#1cb0f6">📚 المراجعة المتباعدة</a></p>';
  el(h); root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ const k=b.dataset.k; if(b.dataset.m==='p') session(practiceList(k),'practice',r=>end(r,k)); else exam(k,pool(k)); }); }
function end(r,k){ el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">🎯</div><h2>خلصت التدريب: '+r.right+' من '+r.total+'</h2><p style="color:#777">الأسئلة اللي غلطت فيها بتتحط في «المراجعة» فوراً، وتقدر تراجعها دلوقتي.</p></div><a class="pl-next" href="exam.html" style="text-align:center;text-decoration:none">رجوع</a>'); }
// ---- spaced review
function due(){ const s=S(), t=Date.now(); return Object.keys(s.sr).filter(id=>byId[id]&&s.sr[id].due<=t).map(id=>byId[id]); }
function reviewHome(){ const s=S(), d=due(), all=Object.keys(s.sr).filter(id=>byId[id]); const later=all.length-d.length; const nxt=all.filter(id=>s.sr[id].due>Date.now()).map(id=>s.sr[id].due).sort()[0];
  let h='<div class="lesson-head"><div class="emoji"><span class="em">📚</span></div><h1>المراجعة</h1><p style="color:var(--ink-soft)">أي سؤال تغلط فيه بيتحط هنا فوراً، وبيتكرر لحد ما تجاوبه صح. بعد كده بيرجعلك بعد أسبوع، لحد ما تثبت معلومتها.</p></div>';
  h+='<div class="plan-card" style="text-align:center"><div style="font-size:64px;font-weight:900;color:'+(d.length?'#ff9600':'#58cc02')+'">'+d.length+'</div><h2>'+(d.length?'سؤال جاهز للمراجعة دلوقتي':'مفيش مراجعة مستحقة دلوقتي ✅')+'</h2><p style="color:#777">'+(later?later+' سؤال تاني مستني موعده'+(nxt?' (أقرب واحد: '+new Date(nxt).toLocaleString('ar-EG',{weekday:'long',hour:'numeric',minute:'2-digit'})+')':''):'')+'</p><p style="color:#777">ثبّتّ حتى الآن: '+(s.srm||0)+' سؤال</p>'+(d.length?'<button class="pl-next" id="qgo0">ابدأ المراجعة</button>':'<a class="pl-next" href="exam.html" style="display:block;text-decoration:none">تدريب على الأسئلة</a>')+'</div>';
  el(h); const g=document.getElementById('qgo0'); if(g) g.onclick=()=>session(shuf(d),'review',r=>{ el('<div class="plan-card" style="text-align:center"><div style="font-size:56px">🌟</div><h2>خلصت المراجعة: '+r.right+' من '+r.total+'</h2><p style="color:#777">اللي غلطت فيه هتلاقيه في المراجعة فوراً، واللي صح هيرجعلك بعد أسبوع.</p></div><a class="pl-next" href="review.html" style="text-align:center;text-decoration:none">تمام</a>'); }); }
window.addEventListener('DOMContentLoaded',()=>{ if(PAGE==='exam') examHome(); else reviewHome(); });
})();
