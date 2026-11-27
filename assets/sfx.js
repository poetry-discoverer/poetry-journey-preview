/* light synthesized UI sounds, no files. Respects the same mute flag as the lesson player. */
(function(){
var ctx=null,inLesson=!!document.getElementById('player');
function on(){try{return state().mute!==true}catch(e){return true}}
function ac(){if(!ctx){try{ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(ctx&&ctx.state==='suspended')ctx.resume();return ctx}
function tone(f,t,d,type,v){var c=ac();if(!c)return;var o=c.createOscillator(),g=c.createGain(),s=c.currentTime+t;o.type=type||'sine';o.frequency.setValueAtTime(f,s);g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(v||0.14,s+0.015);g.gain.exponentialRampToValueAtTime(0.0001,s+d);o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+d+0.03)}
var S={
tap:function(){tone(520,0,.05,'triangle',.07)},
right:function(){tone(784,0,.12);tone(1047,.1,.25)},
wrong:function(){tone(196,0,.2,'sine',.12);tone(147,.15,.3,'sine',.12)},
xp:function(){tone(988,0,.08,'triangle',.1);tone(1319,.07,.16,'triangle',.1)},
streak:function(){[523,659,784,1047].forEach(function(f,i){tone(f,i*.08,.2,'triangle',.12)})},
done:function(){[523,659,784,1047,1319].forEach(function(f,i){tone(f,i*.09,.3,'sine',.14)})}
};
window.SFX2={play:function(n){if(!on())return;try{S[n]&&S[n]()}catch(e){}},on:on};
function setBtn(b){b.textContent=on()?'🔊':'🔇';b.setAttribute('aria-label',on()?'إيقاف الأصوات':'تشغيل الأصوات');b.title=b.getAttribute('aria-label')}
document.addEventListener('DOMContentLoaded',function(){
 if(inLesson)return;
 var st=document.querySelector('.topbar .stats');
 if(st){var b=document.createElement('button');b.id='gsnd';b.className='pill';b.type='button';b.style.cssText='cursor:pointer;border:0;font:inherit;background:transparent;font-size:1.25rem;padding:4px 8px';setBtn(b);
  b.onclick=function(e){e.stopPropagation();var q=state();q.mute=on();save(q);setBtn(b);if(on()){ac();S.tap()}};st.appendChild(b)}
 document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('.card,.node-row,.btn,.pdf-link,.pl-opt');if(t&&t.id!=='gsnd')SFX2.play('tap')},true);
 if(typeof window.confetti==='function'){var o=window.confetti;window.confetti=function(){SFX2.play('done');return o.apply(this,arguments)}}
});
})();
