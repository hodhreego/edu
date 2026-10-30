try{if(/^\s*teste( de aluno)?\s*$/i.test(localStorage.getItem('edu_nome')||''))localStorage.removeItem('edu_nome')}catch(e){}
window.EDU_COD=function(){var f=decodeURIComponent(location.pathname.split('/').pop()),r='';if(typeof JOGOS!=='undefined')JOGOS.forEach(function(j){if(j.href===f)r=j.cod});return r};
/* Menu superior dos jogos (Prof. Rodrigo). Depende de catalogo.js (MATS, TEMAS, JOGOS, jogoPorCodigo). */
(function(){
 var HUB='https://hodhreego.github.io/edu/';
 if(typeof JOGOS==='undefined')return;
 var file=decodeURIComponent(location.pathname.split('/').pop());
 var cur=null;JOGOS.forEach(function(j){if(j.href===file)cur=j});
 if(!cur)return;
 var tema=TEMAS.filter(function(t){return t.id===cur.tema})[0];
 var mat=MATS.filter(function(m){return m.id===tema.mat})[0];
 var css=document.createElement('style');
 css.textContent=`
:root{--eh:56px}
body{padding-top:var(--eh)!important}
#edu-nav{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:8px 16px;
 background:rgba(255,255,255,.94);-webkit-backdrop-filter:saturate(1.6) blur(12px);backdrop-filter:saturate(1.6) blur(12px);border-bottom:1px solid #e1e7f3;
 box-shadow:0 2px 14px rgba(22,33,58,.08);font:600 13px "Segoe UI",Roboto,Arial,sans-serif;color:#16213a;box-sizing:border-box}
#edu-nav *{box-sizing:border-box}
#edu-nav a.b{display:flex;align-items:center;gap:8px;text-decoration:none;color:#16213a;font-weight:800;font-size:14px;white-space:nowrap;padding:3px 10px 3px 3px;border-radius:12px;flex:none}
#edu-nav a.b:hover{background:#eef2fc}
#edu-nav a.b i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:#fff;border:1px solid #dfe6f5;color:#fff;font-size:17px;padding:2px}#edu-nav a.b i svg{width:100%;height:100%}
#edu-nav .sels{display:flex;align-items:center;gap:6px;background:#f2f5fc;border:1px solid #e1e7f3;border-radius:14px;padding:4px;flex:0 1 auto;min-width:0}
#edu-nav .sels label{display:flex;flex-direction:column;gap:1px;min-width:0;padding:0 2px}
#edu-nav .sels label span{color:#6a7592;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;padding-left:10px}
#edu-nav select{width:100%;max-width:165px;border:0;background-color:transparent;color:#16213a;border-radius:10px;padding:3px 24px 3px 10px;font:700 13px "Segoe UI",Roboto,Arial,sans-serif;cursor:pointer;appearance:none;-webkit-appearance:none;text-overflow:ellipsis;
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%235b6785' stroke-width='1.6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
#edu-nav select:hover,#edu-nav select:focus{background-color:#fff;outline:2px solid var(--ec,#1f4fd8);outline-offset:-2px}
#edu-nav .sels .div{width:1px;height:26px;background:#d8e0f0;flex:none}
#edu-nav .sp{flex:1 1 0;min-width:0}
#edu-nav form.cod{display:flex;align-items:center;gap:4px;background:#fff;border:1.5px solid var(--ec,#1f4fd8);border-radius:99px;padding:3px 3px 3px 10px;flex:none;transition:transform .1s}
#edu-nav form.cod.err{border-color:#d93025;animation:eduShake .35s}
@keyframes eduShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
#edu-nav form.cod b{font-size:15px;line-height:1}
#edu-nav form.cod input{width:64px;border:0;outline:0;background:transparent;color:#16213a;font:800 15px/1 "Segoe UI",Roboto,Arial,sans-serif;letter-spacing:.2em;text-align:center;padding:4px 0}
#edu-nav form.cod input::placeholder{letter-spacing:.02em;font-weight:700;font-size:12px;color:#8b95b0}
#edu-nav form.cod button{border:0;border-radius:99px;background:var(--ec,#1f4fd8);color:#fff;font:800 12px "Segoe UI",Roboto,Arial,sans-serif;padding:6px 12px;cursor:pointer}
#edu-nav form.cod button:hover{filter:brightness(1.12)}
#edu-nav .tag{display:inline-flex;align-items:center;gap:5px;background:color-mix(in srgb,var(--ec,#1f4fd8) 13%,#fff);color:var(--ec,#1f4fd8);border-radius:99px;padding:5px 11px;font-weight:800;font-size:12px;white-space:nowrap;flex:none}
#edu-nav .tag.k{letter-spacing:.08em;background:var(--ec,#1f4fd8);color:#fff;font-size:calc(30px*var(--ez,1));letter-spacing:.08em;font-weight:900;padding:8px 30px;box-shadow:0 2px 8px #0003;border-radius:14px;min-width:190px;justify-content:center;cursor:pointer;user-select:none;transition:zoom .15s}
#edu-nav .tag.k.big{zoom:1.3}
#edu-nav .pn{display:flex;gap:6px;flex:none}
#edu-nav a.n{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 12px;border-radius:99px;text-decoration:none;color:#fff;background:var(--ec,#1f4fd8);font-weight:800;white-space:nowrap}
#edu-nav a.n.off{background:#cfd6e6;pointer-events:none}
#edu-nav a.n:hover{filter:brightness(1.1)}
#edu-nav button.ac{border:0;border-radius:99px;width:34px;height:34px;background:#e8edf8;font-size:17px;cursor:pointer;flex:none}
#edu-ac{position:fixed;top:calc(var(--eh) + 6px);right:12px;z-index:2147483001;background:#fff;color:#16213a;border:2px solid #1f4fd8;border-radius:16px;padding:12px 14px;box-shadow:0 12px 32px #0004;display:none;font:700 14px "Segoe UI",Roboto,Arial,sans-serif;min-width:230px}
#edu-ac.on{display:block}#edu-ac h4{margin:0 0 8px;font-size:15px}#edu-ac .r{display:flex;gap:6px;margin-bottom:8px}
#edu-ac button{flex:1;border:2px solid #cfd8ec;background:#f4f7fc;color:#16213a;border-radius:10px;padding:7px 4px;font:800 14px "Segoe UI",Arial,sans-serif;cursor:pointer}
#edu-ac button.on{background:#1f4fd8;border-color:#1f4fd8;color:#fff}
body>*:not(#edu-nav):not(#edu-ac):not(script):not(style):not(#ac-aviso):not(#painel):not(#toggle):not(#wal):not(#jg-bar):not(#jg-fim):not(#pv):not(#imp-bar){zoom:var(--ezz,1);width:100%!important;max-width:100%!important;box-sizing:border-box}
html.edu-hc body,html.edu-hc body *:not(svg):not(svg *):not(img):not(#edu-nav):not(#edu-nav *):not(#edu-ac):not(#edu-ac *){background:#000!important;background-image:none!important;color:#fff!important;border-color:#ffeb3b!important;text-shadow:none!important;box-shadow:none!important;-webkit-text-stroke:0!important}
html.edu-hc body button,html.edu-hc body .btn,html.edu-hc body a,html.edu-hc body select,html.edu-hc body input:not([type=checkbox]),html.edu-hc body [contenteditable]{background:#ffeb3b!important;color:#000!important;border:2px solid #fff!important;font-weight:800!important}
html.edu-hc body input.g,html.edu-hc body .ok,html.edu-hc body .good{background:#00e676!important;color:#000!important}
html.edu-hc body input.r,html.edu-hc body .bad{background:#ff1744!important;color:#fff!important}
html.edu-hc body svg text{fill:#fff!important;stroke:none!important;paint-order:normal!important;-webkit-text-stroke:0!important}
html.edu-hc body svg polygon,html.edu-hc body svg rect:not([fill]),html.edu-hc body svg path:not([fill]){stroke:#ffeb3b!important}
html.edu-hc body .hx polygon{fill:#000!important;stroke-width:2!important}
html.edu-hc body img{filter:contrast(1.4) saturate(1.2)}
html.edu-zoomed body>#app,html.edu-zoomed body>.folha.jogo,html.edu-zoomed #folhaJogo{height:auto!important;min-height:calc((100vh - var(--eh))/var(--ezz,1))}
@media screen{html:not(.edu-print-ok) .jc>.jr{display:none!important}}@media screen{#app>.main{background:#fff;border:.35vh solid #1f4fd8;border-radius:1.6vh;gap:0!important;padding:1vh .8vw}#app>.main>.card{border:0!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;padding:.4vh 1vw!important}#app>.main>.card+.card{border-left:.3vh dashed #94a3b8!important}}@media screen and (max-width:700px){#app>.main>.card+.card{border-left:0!important;border-top:.3vh dashed #94a3b8!important;margin-top:1vh;padding-top:1vh!important}}@media screen{#app>.tray{flex:none!important;position:sticky;bottom:0;z-index:5;box-shadow:0 -4px 10px #0002}#app>.main{overflow:auto!important;min-height:0!important;-webkit-overflow-scrolling:touch}}@media screen{#app>.top{padding:0!important;gap:8px!important;min-height:0!important}#app .top .sub{font-size:min(1.9vh,11pt)!important;margin:0!important;line-height:1.2!important}#app .top .dots i{width:9px!important;height:9px!important}#app .top .btn{font-size:11pt!important;padding:3px 10px!important;border-width:2px!important;border-radius:10px!important;line-height:1.2!important}}@media screen{.folha.jogo h1,#folhaJogo h1,#app h1,.jogo .topo h1{font-size:14pt!important;line-height:1.15!important}}
/* gabarito manuscrito aposentado: cobria as figuras */
.folha.gab,.jgab{display:none!important}
@media print{html:not(.edu-print-ok) body>*{display:none!important}html:not(.edu-print-ok) body::before{content:'🔒 Impressão disponível apenas para o professor. Use o botão 🖨️ do cabeçalho e digite a senha.';display:block;font:700 26px Arial,sans-serif;text-align:center;padding:60mm 12mm;color:#000}html,body{max-width:100%!important}.listas ol{column-width:27ch!important}.listas .pal{overflow-wrap:anywhere}}
#edu-nav .en-coin{position:static!important;transform:none!important;margin:0!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;zoom:.62;flex:none;order:0;z-index:auto!important}
html.edu-hc #edu-nav{background:#000!important;color:#fff!important;border-bottom:3px solid #ffeb3b}
html.edu-hc #edu-nav .tag.k{background:#ffeb3b!important;color:#000!important}
html.edu-hc #edu-nav .sels,html.edu-hc #edu-nav form.cod{background:#fff!important;border-color:#ffeb3b!important}
html.edu-hc #edu-nav a.n,html.edu-hc #edu-nav form.cod button{background:#ffeb3b!important;color:#000!important}
@media(max-width:1060px){#edu-nav .tag.k{display:inline-flex;font-size:calc(26px*var(--ez,1))}}
@media(min-width:901px) and (max-width:1400px){#edu-nav select{max-width:118px}#edu-nav .tag.k{font-size:calc(26px*var(--ez,1));padding:6px 22px;min-width:170px}#edu-nav a.b span{display:none}}
@media(max-width:900px){
 #edu-nav{padding:7px 10px;gap:7px 8px}
 #edu-nav a.b span{display:none}
 #edu-nav .sels{order:5;flex:1 1 100%;width:100%}
 #edu-nav .sels label{flex:1 1 0}
 #edu-nav select{max-width:none}
 #edu-nav .tag{display:none}
}
@media(max-width:420px){#edu-nav form.cod input{width:72px}#edu-nav a.n{padding:0 10px}#edu-nav a.n.nx{font-size:0}#edu-nav a.n.nx::after{content:'▶';font-size:13px}}
@media(prefers-color-scheme:dark){
 #edu-nav{background:rgba(24,32,58,.94);border-color:#2a3558;color:#eef2fc}
 #edu-nav a.b{color:#eef2fc}#edu-nav a.b:hover{background:#222c4c}
 #edu-nav .sels{background:#1d2748;border-color:#2a3558}#edu-nav .sels label span{color:#a3afcf}#edu-nav .sels .div{background:#2f3b66}
 #edu-nav select{color:#eef2fc}#edu-nav select option{background:#18203a;color:#eef2fc}#edu-nav select:hover,#edu-nav select:focus{background-color:#18203a}
 #edu-nav form.cod{background:#18203a}#edu-nav form.cod input{color:#eef2fc}
}
@media screen and (min-width:821px) and (min-height:521px){body>#app,body>.folha.jogo,#folhaJogo{height:calc((100vh - var(--eh))/var(--ezz,1))!important;height:calc((100dvh - var(--eh))/var(--ezz,1))!important}}
@media print{#edu-nav{display:none!important}body{padding-top:0!important}}
`;
 document.head.appendChild(css);
 function opt(v,t,sel){return '<option value="'+v+'"'+(sel?' selected':'')+'>'+t+'</option>'}
 function lab(j){return (j.cod?j.cod+' · ':'')+(j.aula?'Aula '+j.aula+' · ':'')+j.titulo}
 var jt=JOGOS.filter(function(j){return j.tema===cur.tema});
 var idx=jt.indexOf(cur);
 var nav=document.createElement('div');nav.id='edu-nav';nav.style.setProperty('--ec',tema.cor);
 var ms=MATS.map(function(m){return opt(m.id,m.nome,m.id===mat.id)}).join('');
 var ts=TEMAS.filter(function(t){return t.mat===mat.id}).map(function(t){return opt(t.id,t.nome,t.id===tema.id)}).join('');
 var gs=jt.map(function(j){return opt(j.href,lab(j),j===cur)}).join('');
 var prev=idx>0?jt[idx-1]:null,next=idx<jt.length-1?jt[idx+1]:null;
 nav.innerHTML=
  '<a class="b brand" href="'+HUB+'" title="Ludopédia — voltar ao início"><i>'+(typeof LOGO==='function'?LOGO('n'):'🏛️')+'</i><span>Ludopédia</span></a>'+
  '<div class="sels">'+
   '<label><span>Matéria</span><select id="en-m" aria-label="Matéria">'+ms+'</select></label><i class="div"></i>'+
   '<label><span>Tema</span><select id="en-t" aria-label="Tema">'+ts+'</select></label><i class="div"></i>'+
   '<label><span>Jogo</span><select id="en-g" aria-label="Jogo">'+gs+'</select></label>'+
  '</div>'+
  '<span class="sp"></span>'+
  (cur.aula?'<span class="tag">Aula '+cur.aula+'</span>':'')+
  (cur.cod?'<span class="tag k" id="en-k" title="Clique para aumentar o código">'+cur.cod+'</span>':'')+
  '<form class="cod" id="en-c" autocomplete="off" title="Digite o código de 4 números de uma atividade">'+
   '<input id="en-cv" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="Código" aria-label="Código da atividade"><button type="submit">Ir ▶</button></form>'+
  '<button class="ac" id="en-r" title="Ajustar à tela (reiniciar o layout)" aria-label="Ajustar à tela">⟲</button>'+
  '<button class="ac" id="en-a" title="Acessibilidade" aria-label="Acessibilidade">♿</button>'+
  '<a class="n pr" id="en-p" href="'+cur.href+'?imp=1" title="Versão para imprimir (PDF)">🖨️</a>'+
  '<div class="pn"><a class="n'+(prev?'':' off')+'" href="'+(prev?prev.href:'#')+'" title="Jogo anterior">◀</a>'+
  '<a class="n nx'+(next?'':' off')+'" href="'+(next?next.href:'#')+'" title="Próximo jogo">Próximo ▶</a></div>';
 document.body.insertBefore(nav,document.body.firstChild);
 (function(){var c=document.querySelector('.coin,.jcoin');if(!c)return;var k=nav.querySelector('.tag.k')||nav.querySelector('form.cod');
  c.classList.add('en-coin');nav.insertBefore(c,k);})();
 var ac=document.createElement('div');ac.id='edu-ac';ac.innerHTML='<h4>♿ Acessibilidade</h4><div class="r"><button data-z="1">Texto normal</button><button data-z="1.25">Grande</button><button data-z="1.5">Enorme</button><button data-z="1.75">Gigante</button></div><div class="r"><button id="en-hc">◐ Alto contraste</button></div>';
 if(document.getElementById('txt')){var az=1;try{az=parseFloat(localStorage.getItem('edu_appz'))||1}catch(e){}
  var rz=document.createElement('div');rz.className='r';rz.style.cssText='flex-direction:column;align-items:stretch;gap:4px';rz.innerHTML='<label style="font:700 13px Arial">💬 Texto do app aberto à esquerda: <b id="az-v"></b></label><input type="range" id="az-r" min="0.6" max="1.6" step="0.05">';ac.appendChild(rz);
  var zr=rz.querySelector('#az-r'),zv=rz.querySelector('#az-v'),aplz=function(v){document.documentElement.style.setProperty('--appz',v);zv.textContent=Math.round(v*100)+'%';try{localStorage.setItem('edu_appz',v)}catch(e){}};
  zr.value=az;aplz(az);zr.addEventListener('input',function(){aplz(parseFloat(zr.value))});}
 document.body.appendChild(ac);
 if(document.getElementById('painel')&&document.getElementById('toggle')&&!/[?&]imp=1/.test(location.search)){
  var ajst=document.createElement('style');ajst.textContent='@media screen{html:not(.edu-print-ok) body:not(.edu-aj-on) #painel,html:not(.edu-print-ok) body:not(.edu-aj-on) #toggle{display:none!important}html:not(.edu-print-ok) body:not(.edu-aj-on).painel-on{padding-right:0!important}}';document.head.appendChild(ajst);
  var rw=document.createElement('div');rw.className='r';rw.innerHTML='<button id="en-aj">⚙ Ajustes da colmeia</button>';ac.appendChild(rw);
  rw.firstChild.onclick=function(){var P=document.getElementById('painel'),T=document.getElementById('toggle'),on=document.body.classList.toggle('edu-aj-on');rw.firstChild.classList.toggle('on',on);
   if(on){if(getComputedStyle(P).display==='none')T.click()}else{if(getComputedStyle(P).display!=='none'&&/Fechar/.test(T.textContent))T.click()}ac.classList.remove('on')};
 }
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}}
 function aplica(){var z=ls('edu_ez')||'1';nav.style.setProperty('--ez',z);nav.style.zoom=z>1?1+(z-1)*.5:1;document.documentElement.style.setProperty('--ezz',z);document.documentElement.classList.toggle('edu-hc',ls('edu_hc')==='1');document.documentElement.classList.toggle('edu-zoomed',+z>1);if(window.fitChips)setTimeout(window.fitChips,30);
  [].forEach.call(ac.querySelectorAll('[data-z]'),function(b){b.classList.toggle('on',b.dataset.z===z)});document.getElementById('en-hc').classList.toggle('on',ls('edu_hc')==='1');setH()}
 ac.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.id==='en-aj')return;if(b.dataset.z)ls('edu_ez',b.dataset.z);else ls('edu_hc',ls('edu_hc')==='1'?'0':'1');aplica()});
 document.getElementById('en-a').onclick=function(){ac.classList.toggle('on')};
 document.getElementById('en-r').onclick=function(){
  ls('edu_ez','1');aplica();var R=document.documentElement,st=R.style;st.removeProperty('--u');st.removeProperty('--zm');
  [].forEach.call(document.querySelectorAll('#sz,#zm'),function(i){i.value=i.defaultValue;i.dispatchEvent(new Event('input',{bubbles:true}))});
  [].forEach.call(document.querySelectorAll('.tray.dr-col'),function(t){t.classList.remove('dr-col')});
  [].forEach.call(document.querySelectorAll('.tray-in'),function(t){t.style.removeProperty('max-height');t.style.removeProperty('height')});
  [].forEach.call(document.querySelectorAll('*'),function(e){if(e.scrollTop)e.scrollTop=0;if(e.scrollLeft)e.scrollLeft=0});
  scrollTo(0,0);window.dispatchEvent(new Event('resize'));if(window.fitChips)window.fitChips();if(window.fitZone)window.fitZone();
  var t=document.createElement('div');t.textContent='Layout ajustado à tela ✔';t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#16213a;color:#fff;padding:8px 16px;border-radius:99px;font:700 14px Arial;z-index:2147483600';document.body.appendChild(t);setTimeout(function(){t.remove()},1600)};
 var pb=document.getElementById('en-p');if(pb)pb.addEventListener('click',function(e){/*en-p-click*/if(window.EDU_PROF_OK&&EDU_PROF_OK())return;e.preventDefault();if(window.EDU_PROF_ASK)EDU_PROF_ASK(function(ok){if(ok)location.href=pb.href})});
 document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&(e.key||'').toLowerCase()==='p'&&!document.documentElement.classList.contains('edu-print-ok')){e.preventDefault();e.stopPropagation()}},true);
 function setH(){document.documentElement.style.setProperty('--eh',nav.offsetHeight+'px')}
 aplica();addEventListener('resize',setH);addEventListener('load',setH);
 if(window.ResizeObserver)new ResizeObserver(setH).observe(nav);
 function first(f){var r=JOGOS.filter(f)[0];return r&&r.href}
 document.getElementById('en-m').onchange=function(){var m=this.value;var t=TEMAS.filter(function(x){return x.mat===m})[0];location.href=first(function(j){return j.tema===t.id})||HUB};
 document.getElementById('en-t').onchange=function(){var t=this.value;location.href=first(function(j){return j.tema===t})||HUB};
 document.getElementById('en-g').onchange=function(){location.href=this.value};
 var kk=document.getElementById('en-k');if(kk){try{if(localStorage.getItem('edu_kbig')==='1')kk.classList.add('big')}catch(e){}kk.onclick=function(){kk.classList.toggle('big');try{localStorage.setItem('edu_kbig',kk.classList.contains('big')?'1':'0')}catch(e){}setH()}}
 var f=document.getElementById('en-c'),iv=document.getElementById('en-cv');
 iv.addEventListener('input',function(){iv.value=iv.value.replace(/\D/g,'').slice(0,4)});
 f.addEventListener('submit',function(e){
  e.preventDefault();
  var j=typeof jogoPorCodigo==='function'?jogoPorCodigo(iv.value):null;
  if(j){location.href=j.href}
  else{f.classList.remove('err');void f.offsetWidth;f.classList.add('err');iv.value='';iv.placeholder='Inválido';setTimeout(function(){iv.placeholder='Código';f.classList.remove('err')},1400)}
 });
})();
/* janela de Ajustes some sozinha após 3 s sem uso */
(function(){
 var tm=0;
 function btn(){return [].filter.call(document.querySelectorAll('button'),function(b){return /Ajustes|Fechar/.test(b.textContent)&&!b.closest('#edu-nav')&&!b.closest('#edu-ac')})[0]}
 function aberto(b){var c=document.getElementById('cfg');if(c&&c.classList.contains('on'))return true;return !!b&&/Fechar/.test(b.textContent)}
 function arma(){clearTimeout(tm);tm=setTimeout(function(){var b=btn();if(b&&aberto(b))b.click()},3000)}
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(b&&b===btn()){setTimeout(function(){if(aberto(b))arma();else clearTimeout(tm)},50)}},true);
 ['input','change','pointerdown','keydown'].forEach(function(ev){document.addEventListener(ev,function(e){var b=btn();if(b&&aberto(b)&&e.target.closest&&e.target.closest('#cfg,[id*=cfg],[class*=cfg],[class*=painel],[class*=ajust]'))arma()},true)});
})();
/* contas/números nos cartões de combinar: não encostar nas bordas */
(function(){
 var st=document.createElement('style');
 st.textContent='@media screen{.prods{align-content:safe center!important}.zone,.zb{align-content:flex-start!important}.prods{justify-content:safe center!important}.card{overscroll-behavior:contain}html:not(.edu-print-ok) .jc>svg.cena.cena-txt{position:absolute!important;left:2%!important;bottom:3%!important;width:96%!important;height:60%!important;max-height:none!important;margin:0!important}.jc .jn{width:20px!important;height:20px!important;line-height:20px!important;font-size:10px!important;left:-3px!important;top:-3px!important;box-shadow:0 1px 3px #0004}}}';
 document.head.appendChild(st);
 function mark(){[].forEach.call(document.querySelectorAll('.jc>svg.cena:not([data-m])'),function(s){s.dataset.m=1;if(/[0-9]/.test(s.textContent)&&s.querySelector('text')&&!s.querySelector('path,circle,ellipse,polygon,image,line,polyline')){s.classList.add('cena-txt');try{var bb=s.getBBox();if(bb.width>0&&bb.height>0){var pw=bb.width*.06,ph=bb.height*.1;s.setAttribute('viewBox',(bb.x-pw)+' '+(bb.y-ph)+' '+(bb.width+2*pw)+' '+(bb.height+2*ph))}}catch(e){}}})}
 var t=0;new MutationObserver(function(){clearTimeout(t);t=setTimeout(mark,30)}).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('load',mark);mark();
})();

/* Identificação do aluno antes de começar: nome, turma e escola (mesmas chaves do ident.js) */
(function(){
 if(/[?&]imp=1/.test(location.search))return;
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k)||'';localStorage.setItem(k,v)}catch(e){return ''}}
 var ss=function(v){try{if(v===undefined)return sessionStorage.getItem('edu_idok');sessionStorage.setItem('edu_idok','1')}catch(e){}};
 if(!window.EDU_ALUNO)window.EDU_ALUNO=function(){return{nome:ls('edu_nome'),turma:ls('edu_turma'),data:ls('edu_data')||new Date().toLocaleDateString('pt-BR'),escola:ls('edu_escola')}};
 if(ss())return;
 function abrir(){
  var o=document.createElement('div');o.id='eduId';
  o.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(20,28,50,.82);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Segoe UI,Arial,sans-serif';
  o.innerHTML='<form style="background:#fff;border-radius:18px;padding:22px 22px 18px;width:min(420px,100%);box-shadow:0 10px 40px #0008"><h2 style="margin:0 0 4px;color:#16213a;font-size:22px">👋 Antes de começar</h2><p style="margin:0 0 14px;color:#555;font-size:14px">Preencha seus dados para o professor identificar a sua atividade.</p>'
  +['nome|Nome completo|edu_nome','escola|Escola|edu_escola'].map(function(x){var p=x.split('|');if(p[0]==='escola'){var v=ls('edu_escola');return '<label style="display:block;font:700 13px Arial;color:#16213a;margin:8px 0 3px">Escola</label><select data-k="edu_escola" id="eid_escola" style="width:100%;box-sizing:border-box;font:16px Arial;padding:10px;border:2px solid #c9d3e8;border-radius:10px;background:#fff"><option value="">Selecione sua escola…</option>'+['Jardim Clarito — Cascavel - PR','Marcos Claudio Schuster — Cascavel - PR','Outros'].map(function(e){return '<option'+(v===e?' selected':'')+'>'+e+'</option>'}).join('')+'</select>'}return '<label style="display:block;font:700 13px Arial;color:#16213a;margin:8px 0 3px">'+p[1]+'</label><input data-k="'+p[2]+'" id="eid_'+p[0]+'" autocomplete="off" placeholder="Escreva seu nome completo (ex.: Maria da Silva)" style="width:100%;box-sizing:border-box;font:16px Arial;padding:10px;border:2px solid #c9d3e8;border-radius:10px" value="'+ls(p[2]).replace(/"/g,'&quot;')+'">'}).join('')
  +'<div id="eid_tw"></div><button type="submit" style="margin-top:16px;width:100%;font:800 17px Arial;padding:12px;border:0;border-radius:12px;background:#0f9d58;color:#fff;cursor:pointer">▶ Começar</button></form>';
  document.body.appendChild(o);
  var TURMAS={'Jardim Clarito — Cascavel - PR':['6º A','6º B','6º C','6º D'],'Marcos Claudio Schuster — Cascavel - PR':['6º A','6º B','6º C','8º A','8º B','8º C','9º A','9º B','9º C','3º B','3º C']};
  var LB='display:block;font:700 13px Arial;color:#16213a;margin:8px 0 3px',EST='width:100%;box-sizing:border-box;font:16px Arial;padding:10px;border:2px solid #c9d3e8;border-radius:10px;background:#fff';
  function turmas(){var es=o.querySelector('#eid_escola').value,lst=TURMAS[es],v=ls('edu_turma'),w=o.querySelector('#eid_tw');
   if(!es){w.innerHTML='';return}
   if(lst)w.innerHTML='<label style="'+LB+'">Turma</label><select data-k="edu_turma" id="eid_turma" style="'+EST+'"><option value="">Selecione sua turma…</option>'+lst.map(function(t){return '<option'+(v===t?' selected':'')+'>'+t+'</option>'}).join('')+'</select>';
   else w.innerHTML='<label style="'+LB+'">Turma</label><input data-k="edu_turma" id="eid_turma" autocomplete="off" placeholder="ex.: 8º A" style="'+EST+'" value="'+v.replace(/"/g,'&quot;')+'">'}
  o.querySelector('#eid_escola').addEventListener('change',function(){this.style.borderColor='#c9d3e8';turmas()});turmas();
  var f=o.querySelector('form');f.onsubmit=function(e){e.preventDefault();var n=o.querySelector('#eid_nome');if(!n.value.trim()){n.style.borderColor='#d93025';n.focus();return}var es=o.querySelector('#eid_escola');if(!es.value){es.style.borderColor='#d93025';es.focus();return}var tu=o.querySelector('#eid_turma');if(!tu||!tu.value.trim()){if(tu){tu.style.borderColor='#d93025';tu.focus()}return}
   o.querySelectorAll('input,select').forEach(function(i){ls(i.dataset.k,i.value.replace(/\s+/g,' ').trim())});ss(1);o.remove();if(window.EDU_IDOK)window.EDU_IDOK()};
  setTimeout(function(){var n=o.querySelector('#eid_nome');if(n)n.focus()},50)}
 if(document.body)abrir();else document.addEventListener('DOMContentLoaded',abrir)})();

/* ===== Tecla ENTER central (Prof. Rodrigo) =====
   Enter confirma onde antes só dava para clicar (Verificar, Conferir, Próxima, Continuar, Pagar, Enviar...).
   Regras de segurança: não mexe em botão/link focado (o navegador já ativa), textarea, campos de formulário (<form> já envia com Enter),
   campos com onkeydown próprio, nem em botões de imprimir/sair/limpar/pular/professor. Só age quando existe UM único botão principal visível
   (senão, não faz nada). Se o próprio jogo já reagiu ao Enter (DOM mudou), não dispara de novo. Botão principal pode ser marcado com data-enter. */
(function(){
 if(window.__eduEnter)return;window.__eduEnter=1;
 if(/[?&]imp=1/.test(location.search))return;
 var TIERS=['#tbo,#tabuOk','.kp button[data-k="OK"],#fB,#jg-fb','[data-enter]','button#nx,.jnext','button#ck,#bOk,#cOk,#consC,.nvgo,[data-x="go"]','.pb:not(.sec),.cbt,[data-x^="sci:"],[data-w="dsend"],[data-w="tsend"],[data-w="jksend"]'];
 var SKIP=/imprim|\bsair\b|sa[ií]da|limpar|pular|\bprof|cancel|zerar|reinici|recome[cç]|voltar|fechar|apagar|exclu|resgat|logout|prefiro|desfaz|girar|ajustes/i;
 var NOPE='#painel,#corpo,#cfg,[id*=cfg],[class*=ajust],#edu-nav,#rgpBar,#rgpTimer';
 var NOENTER=/^(button|submit|reset|checkbox|radio|file|range|color|image|password|hidden)$/i;
 var last=0,mo=null;
 function vis(b){
  if(!b||b.disabled||b.hidden||b.getAttribute('aria-disabled')==='true')return false;
  if(!b.getClientRects().length)return false;
  var cs=getComputedStyle(b);if(cs.visibility==='hidden'||cs.pointerEvents==='none')return false;
  return !(b.closest&&b.closest('[hidden],[inert]'));
 }
 function ok(b){return vis(b)&&!SKIP.test((b.textContent||'')+' '+(b.title||'')+' '+(b.getAttribute('aria-label')||''))&&!(b.closest&&b.closest(NOPE))}
 function pickIn(root){
  for(var i=0;i<TIERS.length;i++){
   var c=[].filter.call(root.querySelectorAll(TIERS[i]),ok);
   if(c.length===1)return c[0];
   if(c.length>1)return null;
  }
  return undefined;
 }
 function campos(root){
  return [].filter.call(root.querySelectorAll('input'),function(i){return /^(|text|number|tel|search|email|url)$/i.test(i.type)&&!i.readOnly&&vis(i)});
 }
 function overlay(){
  var k=document.body?document.body.children:[];
  for(var i=0;i<k.length;i++){var el=k[i];if(el.id==='ac-aviso')continue;var z=parseInt(el.style&&el.style.zIndex,10);if(z>=2147483000&&el.getClientRects().length)return el}
  return null;
 }
 function fire(b,e){last=Date.now();e.preventDefault();b.click()}
 /* captura: marca o DOM antes de os handlers do jogo rodarem */
 document.addEventListener('keydown',function(e){
  if(e.key!=='Enter')return;
  try{
   if(mo)mo.disconnect();
   var m=new MutationObserver(function(){});mo=m;
   m.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});
   setTimeout(function(){m.disconnect();if(mo===m)mo=null},0);
  }catch(x){mo=null}
 },true);
 document.addEventListener('keydown',function(e){
  if(e.key!=='Enter')return;
  var changed=false;
  try{if(mo){changed=mo.takeRecords().length>0;mo.disconnect();mo=null}}catch(x){}
  if(changed||e.defaultPrevented||e.isComposing||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey)return;
  if(Date.now()-last<300)return;
  var t=e.target,tag=((t&&t.tagName)||'').toLowerCase();
  if(!t||t.isContentEditable||tag==='textarea')return;
  /* aviso do anti-cola: Enter confirma a conta digitada */
  var ac=document.getElementById('ac-aviso');
  if(ac&&getComputedStyle(ac).display!=='none'){
   if(t.id==='ac-r')return;
   var r=ac.querySelector('#ac-r'),f=ac.querySelector('#ac-q');
   if(r){if(r.value&&f&&f.requestSubmit){last=Date.now();e.preventDefault();f.requestSubmit()}else r.focus()}
   return;
  }
  if(tag==='a'||tag==='summary'||tag==='video'||tag==='audio'||(tag==='button'&&!t.disabled))return;
  if(tag==='select'){var fm=t.form;if(fm&&fm.requestSubmit&&fm.querySelector('button:not([type]),[type=submit]')){last=Date.now();e.preventDefault();fm.requestSubmit()}return}
  var isIn=tag==='input';
  if(isIn){
   if(NOENTER.test(t.type||'')||t.form||typeof t.onkeydown==='function'||t.closest('[data-no-enter]'))return;
  }
  /* janelas por cima (tabuada: Enter no botão da janela; senha/identificação: tratadas pelo próprio <form>) */
  var mod=null;
  var tb=document.querySelector('#tbo,#tabuOk');
  if(tb&&ok(tb))mod=tb;
  if(mod){fire(mod,e);return}
  if(overlay())return;
  var b;
  if(isIn){
   for(var n=t.parentElement;n;n=n.parentElement){
    var r2=pickIn(n);
    if(r2===null)return;
    if(r2){b=r2;
     /* vários campos: Enter vai para o próximo campo vazio; no último, confirma */
     var cs=campos(n),ix=cs.indexOf(t);
     if(ix>-1)for(var j=ix+1;j<cs.length;j++){if(!cs[j].value){e.preventDefault();cs[j].focus();return}}
     break}
    if(n===document.body)break;
   }
  }else{
   var r3=pickIn(document.body);
   if(r3)b=r3;
  }
  if(b)fire(b,e);
 },false);

 /* teclado numérico da senha do app (banco): digitar 0-9 e Backspace no teclado do computador */
 document.addEventListener('keydown',function(e){
  if(e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;
  var k=e.key;if(!/^[0-9]$/.test(k)&&k!=='Backspace')return;
  var t=e.target,tag=((t&&t.tagName)||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||tag==='select'||(t&&t.isContentEditable))return;
  var kp=document.querySelectorAll('.kp');if(kp.length!==1||!kp[0].getClientRects().length)return;
  var b=kp[0].querySelector('button[data-k="'+(k==='Backspace'?'⌫':k)+'"]');
  if(b){e.preventDefault();b.click()}
 },false);
})();
