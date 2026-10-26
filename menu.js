/* Menu superior dos jogos (Prof. Rodrigo). Depende de catalogo.js (MATS, TEMAS, JOGOS). */
(function(){
 var HUB='https://hodhreego.github.io/edu/';
 if(typeof JOGOS==='undefined')return;
 var file=decodeURIComponent(location.pathname.split('/').pop());
 var cur=null;JOGOS.forEach(function(j){if(j.href===file)cur=j});
 if(!cur)return;
 var tema=TEMAS.filter(function(t){return t.id===cur.tema})[0];
 var mat=MATS.filter(function(m){return m.id===tema.mat})[0];
 var css=document.createElement('style');
 css.textContent=
 ':root{--eh:50px}body{padding-top:var(--eh)!important}'+
 '#edu-nav{position:fixed;top:0;left:0;right:0;height:var(--eh);z-index:2147483000;display:flex;align-items:center;gap:10px;padding:0 14px;'+
 'background:rgba(255,255,255,.9);-webkit-backdrop-filter:saturate(1.6) blur(12px);backdrop-filter:saturate(1.6) blur(12px);border-bottom:1px solid #e1e7f3;'+
 'box-shadow:0 2px 14px rgba(22,33,58,.07);font:600 13px "Segoe UI",Roboto,Arial,sans-serif;color:#16213a;box-sizing:border-box}'+
 '#edu-nav *{box-sizing:border-box}'+
 '#edu-nav a.b{display:flex;align-items:center;gap:7px;text-decoration:none;color:#16213a;font-weight:800;font-size:14px;white-space:nowrap;padding:5px 10px 5px 4px;border-radius:10px}'+
 '#edu-nav a.b:hover{background:#eef2fc}'+
 '#edu-nav a.b i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#1f4fd8,#6a3df0);color:#fff;font-size:16px}'+
 '#edu-nav .sep{width:1px;height:24px;background:#dfe5f2;flex:none}'+
 '#edu-nav label{display:flex;align-items:center;gap:6px;color:#5b6785;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}'+
 '#edu-nav select{max-width:230px;border:1.5px solid #dbe3f1;background:#fff;color:#16213a;border-radius:99px;padding:6px 28px 6px 12px;font:600 13px "Segoe UI",Roboto,Arial,sans-serif;cursor:pointer;appearance:none;-webkit-appearance:none;'+
 'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M1 1l4 4 4-4\' fill=\'none\' stroke=\'%235b6785\' stroke-width=\'1.6\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center}'+
 '#edu-nav select:hover,#edu-nav select:focus{border-color:var(--ec,#1f4fd8);outline:none}'+
 '#edu-nav .sp{flex:1}'+
 '#edu-nav a.n{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:32px;padding:0 10px;border-radius:99px;text-decoration:none;color:#fff;background:var(--ec,#1f4fd8);font-weight:800;white-space:nowrap}'+
 '#edu-nav a.n.off{background:#cfd6e6;pointer-events:none}'+
 '#edu-nav a.n:hover{filter:brightness(1.1)}'+
 '#edu-nav .tag{display:inline-block;background:color-mix(in srgb,var(--ec,#1f4fd8) 14%,#fff);color:var(--ec,#1f4fd8);border-radius:99px;padding:3px 10px;font-weight:800;font-size:12px;white-space:nowrap}'+
 '@media(max-width:900px){#edu-nav label span{display:none}#edu-nav .brand span{display:none}#edu-nav select{max-width:150px}#edu-nav .tag{display:none}}'+
 '@media(max-width:640px){#edu-nav{overflow-x:auto;gap:7px;padding:0 8px}#edu-nav select{max-width:118px;font-size:12px;padding:5px 24px 5px 9px}#edu-nav .sep{display:none}}'+
 '@media(prefers-color-scheme:dark){#edu-nav{background:rgba(24,32,58,.92);border-color:#2a3558;color:#eef2fc}#edu-nav a.b{color:#eef2fc}#edu-nav a.b:hover{background:#222c4c}#edu-nav select{background-color:#18203a;color:#eef2fc;border-color:#2a3558}#edu-nav label{color:#a3afcf}#edu-nav .sep{background:#2a3558}}'+
 '@media print{#edu-nav{display:none!important}body{padding-top:0!important}}';
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
  '<a class="b brand" href="'+HUB+'" title="Voltar ao início"><i>🎓</i><span>Jogos Educativos</span></a><span class="sep"></span>'+
  '<label><span>Matéria</span><select id="en-m" aria-label="Matéria">'+ms+'</select></label>'+
  '<label><span>Tema</span><select id="en-t" aria-label="Tema">'+ts+'</select></label>'+
  '<label><span>Jogo</span><select id="en-g" aria-label="Jogo">'+gs+'</select></label>'+
  '<span class="sp"></span>'+(cur.aula?'<span class="tag">Aula '+cur.aula+'</span>':'')+
  '<a class="n'+(prev?'':' off')+'" href="'+(prev?prev.href:'#')+'" title="Jogo anterior">◀</a>'+
  '<a class="n'+(next?'':' off')+'" href="'+(next?next.href:'#')+'" title="Próximo jogo">Próximo ▶</a>';
 document.body.insertBefore(nav,document.body.firstChild);
 function first(f){var r=JOGOS.filter(f)[0];return r&&r.href}
 document.getElementById('en-m').onchange=function(){var m=this.value;var t=TEMAS.filter(function(x){return x.mat===m})[0];location.href=first(function(j){return j.tema===t.id})||HUB};
 document.getElementById('en-t').onchange=function(){var t=this.value;location.href=first(function(j){return j.tema===t})||HUB};
 document.getElementById('en-g').onchange=function(){location.href=this.value};
})();
