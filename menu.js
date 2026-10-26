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
#edu-nav a.b i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#1f4fd8,#6a3df0);color:#fff;font-size:17px}
#edu-nav .sels{display:flex;align-items:center;gap:6px;background:#f2f5fc;border:1px solid #e1e7f3;border-radius:14px;padding:4px;flex:0 1 auto;min-width:0}
#edu-nav .sels label{display:flex;flex-direction:column;gap:1px;min-width:0;padding:0 2px}
#edu-nav .sels label span{color:#6a7592;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;padding-left:10px}
#edu-nav select{width:100%;max-width:240px;border:0;background-color:transparent;color:#16213a;border-radius:10px;padding:3px 24px 3px 10px;font:700 13px "Segoe UI",Roboto,Arial,sans-serif;cursor:pointer;appearance:none;-webkit-appearance:none;text-overflow:ellipsis;
 background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%235b6785' stroke-width='1.6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
#edu-nav select:hover,#edu-nav select:focus{background-color:#fff;outline:2px solid var(--ec,#1f4fd8);outline-offset:-2px}
#edu-nav .sels .div{width:1px;height:26px;background:#d8e0f0;flex:none}
#edu-nav .sp{flex:1 1 0;min-width:0}
#edu-nav form.cod{display:flex;align-items:center;gap:4px;background:#fff;border:1.5px solid var(--ec,#1f4fd8);border-radius:99px;padding:3px 3px 3px 10px;flex:none;transition:transform .1s}
#edu-nav form.cod.err{border-color:#d93025;animation:eduShake .35s}
@keyframes eduShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
#edu-nav form.cod b{font-size:15px;line-height:1}
#edu-nav form.cod input{width:82px;border:0;outline:0;background:transparent;color:#16213a;font:800 15px/1 "Segoe UI",Roboto,Arial,sans-serif;letter-spacing:.06em;text-align:center;padding:4px 0}
#edu-nav form.cod input::placeholder{letter-spacing:.02em;font-weight:700;font-size:12px;color:#8b95b0}
#edu-nav form.cod button{border:0;border-radius:99px;background:var(--ec,#1f4fd8);color:#fff;font:800 12px "Segoe UI",Roboto,Arial,sans-serif;padding:6px 12px;cursor:pointer}
#edu-nav form.cod button:hover{filter:brightness(1.12)}
#edu-nav .tag{display:inline-flex;align-items:center;gap:5px;background:color-mix(in srgb,var(--ec,#1f4fd8) 13%,#fff);color:var(--ec,#1f4fd8);border-radius:99px;padding:5px 11px;font-weight:800;font-size:12px;white-space:nowrap;flex:none}
#edu-nav .tag.k{letter-spacing:.06em}
#edu-nav .pn{display:flex;gap:6px;flex:none}
#edu-nav a.n{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 12px;border-radius:99px;text-decoration:none;color:#fff;background:var(--ec,#1f4fd8);font-weight:800;white-space:nowrap}
#edu-nav a.n.off{background:#cfd6e6;pointer-events:none}
#edu-nav a.n:hover{filter:brightness(1.1)}
@media(max-width:1060px){#edu-nav .tag.k{display:none}}
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
  '<a class="b brand" href="'+HUB+'" title="Voltar ao início"><i>🎓</i><span>Jogos Educativos</span></a>'+
  '<div class="sels">'+
   '<label><span>Matéria</span><select id="en-m" aria-label="Matéria">'+ms+'</select></label><i class="div"></i>'+
   '<label><span>Tema</span><select id="en-t" aria-label="Tema">'+ts+'</select></label><i class="div"></i>'+
   '<label><span>Jogo</span><select id="en-g" aria-label="Jogo">'+gs+'</select></label>'+
  '</div>'+
  '<span class="sp"></span>'+
  (cur.aula?'<span class="tag">Aula '+cur.aula+'</span>':'')+
  (cur.cod?'<span class="tag k" title="Código deste jogo">🔑 '+cur.cod+'</span>':'')+
  '<form class="cod" id="en-c" autocomplete="off" title="Digite o código (xus0000) de uma atividade"><b>🔑</b>'+
   '<input id="en-cv" maxlength="7" placeholder="xus0000" autocapitalize="off" aria-label="Código da atividade"><button type="submit">Ir ▶</button></form>'+
  '<div class="pn"><a class="n'+(prev?'':' off')+'" href="'+(prev?prev.href:'#')+'" title="Jogo anterior">◀</a>'+
  '<a class="n nx'+(next?'':' off')+'" href="'+(next?next.href:'#')+'" title="Próximo jogo">Próximo ▶</a></div>';
 document.body.insertBefore(nav,document.body.firstChild);
 function setH(){document.documentElement.style.setProperty('--eh',nav.offsetHeight+'px')}
 setH();addEventListener('resize',setH);addEventListener('load',setH);
 if(window.ResizeObserver)new ResizeObserver(setH).observe(nav);
 function first(f){var r=JOGOS.filter(f)[0];return r&&r.href}
 document.getElementById('en-m').onchange=function(){var m=this.value;var t=TEMAS.filter(function(x){return x.mat===m})[0];location.href=first(function(j){return j.tema===t.id})||HUB};
 document.getElementById('en-t').onchange=function(){var t=this.value;location.href=first(function(j){return j.tema===t})||HUB};
 document.getElementById('en-g').onchange=function(){location.href=this.value};
 var f=document.getElementById('en-c'),iv=document.getElementById('en-cv');
 iv.addEventListener('input',function(){iv.value=iv.value.replace(/[^a-zA-Z0-9]/g,'').slice(0,7)});
 f.addEventListener('submit',function(e){
  e.preventDefault();
  var j=typeof jogoPorCodigo==='function'?jogoPorCodigo(iv.value):null;
  if(j){location.href=j.href}
  else{f.classList.remove('err');void f.offsetWidth;f.classList.add('err');iv.value='';iv.placeholder='Inválido';setTimeout(function(){iv.placeholder='xus0000';f.classList.remove('err')},1400)}
 });
})();
