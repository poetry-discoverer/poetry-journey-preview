// رحلة الشعر الإنجليزي — progress + gamification (local, private draft)
const LS_KEY = 'poetryJourneyV1';
function state(){ try{return JSON.parse(localStorage.getItem(LS_KEY))||{done:{},xp:0,answers:{}}}catch(e){return{done:{},xp:0,answers:{}}} }
function save(s){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }
function isDone(id){ return !!state().done[id]; }

function refreshHeader(){
  const s = state();
  document.querySelectorAll('.xp-val').forEach(el=>el.textContent = s.xp);
  document.querySelectorAll('[data-overall]').forEach(el=>{
    const ids = (el.getAttribute('data-overall')||'').split(',').filter(Boolean);
    const done = ids.filter(id=>s.done[id]).length;
    const pct = ids.length ? Math.round(done/ids.length*100) : 0;
    const bar = el.querySelector('.bar>i'); if(bar) bar.style.width = pct+'%';
    const lab = el.querySelector('[data-pct]'); if(lab) lab.textContent = pct+'%';
    const cnt = el.querySelector('[data-count]'); if(cnt) cnt.textContent = done+' من '+ids.length;
  });
}

function setupPath(){
  document.querySelectorAll('.node[data-id]').forEach(n=>{
    const id = n.dataset.id;
    if(isDone(id)){ n.classList.add('done'); n.innerHTML = '✓'; }
  });
  // first not-done node becomes "current"
  const nodes = [...document.querySelectorAll('.node[data-id]')];
  const cur = nodes.find(n=>!isDone(n.dataset.id));
  if(cur && !cur.classList.contains('locked')) cur.classList.add('current');
}

function setupComplete(){
  const btn = document.querySelector('[data-complete]');
  if(!btn) return;
  const id = btn.getAttribute('data-complete');
  if(isDone(id)){ btn.textContent='✅ الدرس متكمل — برافو!'; btn.classList.add('ghost'); }
  btn.addEventListener('click', ()=>{
    const s = state();
    if(!s.done[id]){ s.done[id]=Date.now(); s.xp += 10; save(s); }
    btn.textContent='✅ الدرس متكمل — برافو!'; btn.classList.add('ghost');
    refreshHeader(); confetti();
  });
}

function setupAnswers(){
  document.querySelectorAll('textarea[data-answer]').forEach(t=>{
    const id = t.getAttribute('data-answer');
    const s = state(); if(s.answers[id]) t.value = s.answers[id];
    t.addEventListener('input', ()=>{ const s2=state(); s2.answers[id]=t.value; save(s2); });
  });
}

function confetti(){
  const c = document.getElementById('confetti'); if(!c) return;
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#58cc02','#1cb0f6','#ffc800','#ce82ff','#ff4b4b'];
  const parts = Array.from({length:140},()=>({
    x: innerWidth/2 + (Math.random()-.5)*260, y: innerHeight*0.35,
    vx:(Math.random()-.5)*12, vy:-Math.random()*11-4, g:.32,
    s: Math.random()*8+4, col: colors[Math.floor(Math.random()*colors.length)],
    rot: Math.random()*6.28, vr:(Math.random()-.5)*.3, life: 110+Math.random()*40
  }));
  let frame=0;
  (function tick(){
    ctx.clearRect(0,0,c.width,c.height); frame++;
    let alive=false;
    for(const p of parts){ if(frame>p.life) continue; alive=true;
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.col; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.62); ctx.restore();
    }
    if(alive) requestAnimationFrame(tick); else ctx.clearRect(0,0,c.width,c.height);
  })();
}

const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.08});
document.querySelectorAll('.fade').forEach(el=>io.observe(el));

refreshHeader(); setupPath(); setupComplete(); setupAnswers();

// reveal fallback: never leave content hidden (headless/no-observer cases)
setTimeout(function(){ document.querySelectorAll('.fade:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 700);

document.addEventListener('click',function(e){var r=e.target.closest&&e.target.closest('.node-row');if(!r||e.target.closest("a,button"))return;var a=r.querySelector('a.node');if(a)location.href=a.href;});

;window.CHIP=(function(){
var ctx=null;
function on(){try{var s=state();return s.mute!==true&&s.nosfx!==true}catch(e){return true}}
function ac(){if(!ctx){try{ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ctx&&ctx.state==='suspended')try{ctx.resume()}catch(e){}return ctx}
function k(){try{return(window.CHIP&&CHIP.voice&&CHIP.voice())?0.45:1}catch(e){return 1}}
function n(f,t0,d,type,vol,to){var c=ac();if(!c)return;var o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0,v=(vol||.08)*k();
o.type=type||'square';o.frequency.setValueAtTime(f,t);if(to)o.frequency.linearRampToValueAtTime(to,t+d);
g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+d*.55);g.gain.linearRampToValueAtTime(0.0001,t+d);
o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}
var X={
click:function(){n(1400,0,.03,'square',.045)},
jump:function(){n(260,0,.13,'square',.08,640)},
right:function(){n(988,0,.07,'square',.09);n(1319,.07,.36,'square',.09)},
wrong:function(){n(150,0,.08,'square',.11,95);n(82,.08,.14,'triangle',.22)},
xp:function(){n(1760,0,.04,'square',.035)},
power:function(){[523,659,784,1047,1319,1568,2093,2637].forEach(function(f,i){n(f,i*.05,.06,'square',.07)})},
combo:function(c){var s=Math.pow(1.06,Math.min(c||3,8)-3);[523,659,784,1047,1319,1568].forEach(function(f,i){n(f*s,i*.05,.07,'square',.075);n(f*s/2,i*.05,.07,'triangle',.12)})},
done:function(){[[392,0,.1],[523,.12,.1],[659,.24,.1],[784,.36,.22],[659,.62,.1],[784,.74,.1],[1047,.86,.6]].forEach(function(a){n(a[0],a[1],a[2],'square',.08)});
[[196,0,.34],[262,.36,.22],[330,.62,.2],[392,.86,.6]].forEach(function(a){n(a[0],a[1],a[2],'triangle',.2)});n(2093,1.0,.3,'square',.04)}};
var C={on:on,ac:ac,voice:null};
Object.keys(X).forEach(function(nm){C[nm]=function(a){if(!on())return;try{X[nm](a)}catch(e){}}});
function pill(){var st=document.querySelector('.stats');if(!st||document.getElementById('sfxp'))return;var p=document.createElement('span');p.id='sfxp';p.className='pill sfxp';p.setAttribute('role','button');p.setAttribute('aria-label','مؤثرات الصوت');p.style.cursor='pointer';
function lab(){var s=state();p.innerHTML='<span class="em">'+(s.nosfx===true?'🔇':'🔊')+'</span>'}lab();
p.addEventListener('click',function(e){e.stopPropagation();var s=state();s.nosfx=s.nosfx!==true;save(s);lab();if(s.nosfx!==true){ac();X.right()}});st.insertBefore(p,st.firstChild)}
function ready(f){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else f()}
ready(function(){pill();document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.btn,a.card,a.node,.node-label');if(t&&!t.closest('#player,#qz'))C.click()},true)});
return C})();
