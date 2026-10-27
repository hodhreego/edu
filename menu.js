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
@media screen and (min-width:821px) and (min-height:521px){body>#app{height:calc(100vh - var(--eh))!important;height:calc(100dvh - var(--eh))!important}}
@media print{#edu-nav{display:none!important}body{padding-top:0!important}}
`;
 document.head.appendChild(css);
 function opt(v,t,sel){return '<option value="'+v+'"'+(sel?' selected':'')+'>'+t+'</option>'}
 function lab(j){return (j.aula?'Aula '+j.aula+' · ':'')+j.titulo}
 var jt=JOGOS.filter(function(j){return j.tema===cur.tema});
 var idx=jt.indexOf(cur);
 var nav=document.createElement('div');nav.id='edu-nav';nav.style.setProperty('--ec',tema.cor);
 var ms=MATS.map(function(m){return opt(m.id,m.nome,m.id===mat.id)}).join('');
 var ts=TEMAS.filter(function(t){return t.mat===mat.id}).map(function(t){return opt(t.id,t.nome,t.id===tema.id)}).join('');
 var gs=jt.map(function(j){return opt(j.href,lab(j),j===cur)}).join('');
 var prev=idx>0?jt[idx-1]:null,next=idx<jt.length-1?jt[idx+1]:null;
 nav.innerHTML=
  '<a class="b brand" href="'+HUB+'" title="Loja de Matemática — voltar ao início"><i>'+(typeof LOGO==='function'?LOGO('n'):'🏛️')+'</i><span>Loja de Matemática</span></a>'+
  '<div class="sels">'+
   '<label><span>Matéria</span><select id="en-m" aria-label="Matéria">'+ms+'</select></label><i class="div"></i>'+
   '<label><span>Tema</span><select id="en-t" aria-label="Tema">'+ts+'</select></label><i class="div"></i>'+
   '<label><span>Jogo</span><select id="en-g" aria-label="Jogo">'+gs+'</select></label>'+
  '</div>'+
  '<span class="sp"></span>'+
  (cur.aula?'<span class="tag">Aula '+cur.aula+'</span>':'')+
  (cur.cod?'<span class="tag k" id="en-k" title="Clique para aumentar o código">🔑 '+cur.cod+'</span>':'')+
  '<form class="cod" id="en-c" autocomplete="off" title="Digite o código de 4 números de uma atividade"><b>🔑</b>'+
   '<input id="en-cv" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="Código" aria-label="Código da atividade"><button type="submit">Ir ▶</button></form>'+
  '<button class="ac" id="en-a" title="Acessibilidade" aria-label="Acessibilidade">♿</button>'+
  '<a class="n pr" id="en-p" href="'+cur.href+'?imp=1" title="Versão para imprimir (PDF)">🖨️</a>'+
  '<div class="pn"><a class="n'+(prev?'':' off')+'" href="'+(prev?prev.href:'#')+'" title="Jogo anterior">◀</a>'+
  '<a class="n nx'+(next?'':' off')+'" href="'+(next?next.href:'#')+'" title="Próximo jogo">Próximo ▶</a></div>';
 document.body.insertBefore(nav,document.body.firstChild);
 var ac=document.createElement('div');ac.id='edu-ac';ac.innerHTML='<h4>♿ Acessibilidade</h4><div class="r"><button data-z="1">Texto normal</button><button data-z="1.25">Grande</button><button data-z="1.5">Enorme</button></div><div class="r"><button id="en-hc">◐ Alto contraste</button></div>';
 document.body.appendChild(ac);
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}}
 function aplica(){var z=ls('edu_ez')||'1';nav.style.setProperty('--ez',z);nav.style.zoom=z>1?1+(z-1)*.5:1;document.documentElement.classList.toggle('edu-hc',ls('edu_hc')==='1');
  [].forEach.call(ac.querySelectorAll('[data-z]'),function(b){b.classList.toggle('on',b.dataset.z===z)});document.getElementById('en-hc').classList.toggle('on',ls('edu_hc')==='1');setH()}
 ac.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.z)ls('edu_ez',b.dataset.z);else ls('edu_hc',ls('edu_hc')==='1'?'0':'1');aplica()});
 document.getElementById('en-a').onclick=function(){ac.classList.toggle('on')};
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
