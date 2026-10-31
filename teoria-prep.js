/* Teoria (estudar antes de jogar): botão 📖 + painel com figura, palavra, tradução e frase de exemplo. Usa ITEMS e window.TEORIA. */
(function(){
 var T=window.TEORIA;if(!T||typeof ITEMS==='undefined')return;
 var st=document.createElement('style');st.textContent=
  '#tBtn{position:fixed;left:10px;right:auto;bottom:10px;width:auto!important;max-width:max-content!important;z-index:9000;background:#ffffffd9;color:#1d4ed8;border:0;border-radius:99px;padding:5px 12px;font:700 13px Arial;box-shadow:0 1px 6px #0003;cursor:pointer;opacity:.8;transition:opacity .2s}#tBtn:hover{opacity:1}#tX{position:absolute;top:8px;right:10px;border:0;background:#e2e8f0;color:#334155;border-radius:99px;width:34px;height:34px;font:800 16px Arial;cursor:pointer}'
  +'#tOv{position:fixed;inset:0;background:#0009;z-index:2147483000;display:none;align-items:flex-start;justify-content:center;overflow:auto;padding:12px}#tOv.on{display:flex}'
  +'#tBox{background:#fff;border-radius:16px;max-width:1000px;width:100%;padding:14px 14px 80px;position:relative;color:#1b2440;font-family:Arial,sans-serif}'
  +'#tBox h2{margin:0 0 4px;font-size:24px}#tBox .tp{margin:0 0 10px;color:#46506f;font-size:14px}'
  +'#tBox ul{margin:0 0 12px;padding:10px 12px 10px 28px;background:#fff8dc;border:2px solid #f2c94c;border-radius:12px;font-size:14px;line-height:1.5}'
  +'#tG{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}'
  +'.tc{border:2px solid #cbd5e1;border-radius:12px;padding:6px 8px;cursor:pointer;background:#f8fafc}.tc:hover{border-color:#1d4ed8}.tc svg{width:100%;height:84px;display:block}'
  +'.tc b{display:block;font-size:22px;color:#1d4ed8;margin-top:2px}.tc .pt{font-size:13px;color:#475569}.tc .ex{margin-top:4px;font-size:14px;font-weight:700}.tc .ex i{display:block;font-weight:400;color:#64748b;font-size:12px}'
  +'#tGo{position:sticky;bottom:0;display:block;margin:12px auto 0;background:#16a34a;color:#fff;border:0;border-radius:99px;padding:14px 28px;font:800 18px Arial;cursor:pointer;box-shadow:0 4px 14px #0004}'
  +'@media print{#tBtn,#tOv{display:none!important}}';
 document.head.appendChild(st);
 var ov=document.createElement('div');ov.id='tOv';
 ov.innerHTML='<div id="tBox"><h2>📖 Teoria — '+T.titulo+'</h2><p class="tp">Leia, observe as figuras e memorize. Toque num cartão para ouvir 🔊. Quando estiver pronto, feche para jogar. Você pode voltar aqui quando quiser.</p><ul>'+T.dicas.map(function(d){return '<li>'+d+'</li>'}).join('')+'</ul><div id="tG"></div><button type="button" id="tGo">Já estudei — jogar ▶</button></div>';
 document.body.appendChild(ov);var bx=document.createElement('button');bx.id='tX';bx.type='button';bx.setAttribute('aria-label','Fechar');bx.textContent='✖';document.getElementById('tBox').appendChild(bx);ov.addEventListener('click',function(e){if(e.target===ov)fechar()});bx.onclick=function(){fechar()};document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('on'))fechar()});
 document.getElementById('tG').innerHTML=ITEMS.map(function(it,i){return '<div class="tc" data-i="'+i+'"><svg viewBox="0 12 200 132" preserveAspectRatio="xMidYMid meet">'+it.svg+'</svg><b>'+it.en+'</b><div class="pt">'+it.pt+'</div><div class="ex">'+it.ex+'<i>'+(it.exPt||'')+'</i></div></div>'}).join('');
 function falar(t){try{var S=window.speechSynthesis;if(!S)return;S.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=T.voz;var v=window.EDU_VOICE&&EDU_VOICE(T.voz);if(v)u.voice=v;u.rate=.8;S.speak(u)}catch(e){}}
 ov.addEventListener('click',function(e){var c=e.target.closest('.tc');if(c){var it=ITEMS[+c.dataset.i];falar(it.en+'. '+it.ex)}});
 function abrir(){ov.classList.add('on');ov.scrollTop=0}
 function fechar(){ov.classList.remove('on');try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}}
 document.getElementById('tGo').onclick=fechar;
 var b=document.createElement('button');b.id='tBtn';b.type='button';b.textContent='📖 Teoria';b.title='Estudar a teoria';b.style.setProperty('width','auto','important');b.style.setProperty('max-width','max-content','important');b.onclick=abrir;document.body.appendChild(b);
 var k='teoria_'+location.pathname;
 try{if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');abrir()}}catch(e){abrir()}
})();
