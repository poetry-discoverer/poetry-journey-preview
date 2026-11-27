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

;(function(){try{var s=document.currentScript;if(!s)return;var b=s.src.replace(/app\.js.*$/,'');var l=document.createElement('link');l.rel='stylesheet';l.href=b+'search.css';document.head.appendChild(l);var j=document.createElement('script');j.src=b+'search.js';document.head.appendChild(j)}catch(e){}})();
