/* cédulas e moedas reais do Real (fotos, com tarja SEM VALOR) */
(function(){
 var st=document.createElement('style');st.textContent='.m img{display:block;height:var(--h);width:auto;filter:drop-shadow(0 .2vh .3vh #0004);pointer-events:none;-webkit-user-drag:none}';
 document.head.appendChild(st);
 var N={200:'n2',500:'n5',1000:'n10',2000:'n20',5000:'n50',10000:'n100'},C={5:'c5',10:'c10',25:'c25',50:'c50',100:'c100'};
 function im(f,e,v){return '<img src="img/din/'+f+'.'+e+'" alt="R$ '+(v>=100?v/100:v/100)+'" draggable="false" title="Imagem ilustrativa, sem valor">'}
 window.DR={bill:function(v){return im(N[v],'jpg',v)},coin:function(v){return im(C[v],'png',v)}};
})();
/* enunciado claro e direto para cada questão */
window.DRQT=function(t,fmt){
 if(!t||!t.items)return '';
 var L=t.items.map(function(i){return (i.e?i.e+' ':'')+'<b>'+i.n+'</b> ('+fmt(i.p)+')'});
 var lista=L.length>1?L.slice(0,-1).join(', ')+' e '+L[L.length-1]:L[0],h;
 var P=t.paid?'<b>uma cédula de '+fmt(t.paid)+'</b>':'';
 if(t.paid){
  h=t.items.length>1
   ?'Um cliente comprou '+lista+'. Ele pagou com '+P+'. <b>Some os preços e calcule o troco.</b> Monte o troco na carteira.'
   :'Um cliente comprou '+lista+'. Ele pagou com '+P+'. <b>Qual é o troco?</b> Monte o troco na carteira.';
 }else{
  h=t.items.length>1
   ?'Você vai pagar: '+lista+'. <b>Some os preços</b> e monte o total exato na carteira.'
   :'Você vai pagar: '+lista+'. Monte <b>exatamente '+fmt(t.total)+'</b> na carteira, com moedas e cédulas.';
 }
 return h;
};
window.DRQ=function(t,fmt){var el=document.getElementById('inst');if(el&&t&&t.items)el.innerHTML=DRQT(t,fmt)};
/* enunciado + produto + carteira num único espaço */
document.addEventListener('DOMContentLoaded',function(){
 var i=document.getElementById('inst'),m=document.querySelector('#app>.main');
 if(!i||!m)return;m.insertBefore(i,m.firstChild);i.classList.add('inst-in');
 var st=document.createElement('style');
 st.textContent='@media screen{#app>.main{grid-template-rows:auto 1fr!important}#app>.main>.inst-in{align-self:start;grid-column:1/-1;border:0!important;border-bottom:.3vh dashed #94a3b8!important;border-radius:0!important;background:transparent!important;margin:0 0 .8vh;padding:.4vh 1vw .9vh!important}}';
 document.head.appendChild(st);
});
/* neon: verde = dinheiro que o cliente pagou; roxo = troco / dinheiro montado */
(function(){var st=document.createElement('style');
 st.textContent='.paid .m img,.paid .m svg{filter:drop-shadow(0 0 2px #39ff14) drop-shadow(0 0 7px #39ff14) drop-shadow(0 0 14px #1aff00)!important}'
 +'#zone .m img,#zone .m svg{filter:drop-shadow(0 0 2px #c04dff) drop-shadow(0 0 7px #b026ff) drop-shadow(0 0 14px #9d00ff)!important}'
 +'#zone{box-shadow:inset 0 0 12px #b026ff55}';
 document.head.appendChild(st)})();
/* rolagem do mouse nas áreas do centro */
(function(){var st=document.createElement('style');
 st.textContent='@media screen{#app>.main>.card{overflow-y:auto!important;overscroll-behavior:contain}#app #zone{overflow-y:auto!important;overscroll-behavior:contain}#app #prods{overflow:visible}}';
 document.head.appendChild(st)})();
/* baixa visão: tamanhos grandes rolam a página inteira; bandeja fixa embaixo */
(function(){var st=document.createElement('style');
 st.textContent='@media screen and (min-width:701px){#app{overflow-y:auto!important;overflow-x:hidden}#app>.main{flex:1 0 auto!important;min-height:52vh;overflow:visible!important}#app>.main>.card{overflow:visible!important}#app>.tray{max-height:46vh;overflow-y:auto;flex:none!important}}';
 document.head.appendChild(st)})();

/* versão para imprimir (?imp=1): TODAS as questões de todas as fases, ajustável */
(function(){
 if(!/[?&]imp=1/.test(location.search))return;
 var st=document.createElement('style');
 st.textContent='#app,#cfg,#fim,.fim,#tray,#imp-bar{display:none!important}body{overflow:auto!important;height:auto!important}html{overflow:auto!important;height:auto!important}'
 +'#dm-sheet{background:#fff;color:#000;max-width:794px;margin:12px auto;padding:var(--dm-m,10mm);font-family:"Segoe UI",Arial,sans-serif;font-size:var(--dm-f,13px)}'
 +'#dm-sheet h1{font-size:1.5em;margin:0 0 4px}#dm-sheet .id{display:flex;gap:14px;margin:6px 0 10px}#dm-sheet .id span{flex:1;border-bottom:1px solid #000;padding-bottom:2px;font-size:.9em}'
 +'#dm-sheet h2{font-size:1.05em;margin:12px 0 6px;padding:3px 8px;background:#eee;border-left:5px solid #000;break-after:avoid}'
 +'#dm-g{display:grid;grid-template-columns:repeat(var(--dm-c,2),1fr);gap:6px 10px}'
 +'#dm-g .q{border:1px dashed #555;border-radius:4px;padding:5px 7px;break-inside:avoid;line-height:1.35}#dm-g .q b.n{display:inline-block;background:#000;color:#fff;border-radius:3px;padding:0 5px;margin-right:4px}'
 +'#dm-g .q img{height:var(--dm-i,9mm);width:auto;vertical-align:middle;margin:0 3px}#dm-g .r{margin-top:4px;font-weight:700}#dm-g .r u{display:inline-block;min-width:60px;text-decoration:none;border-bottom:1px solid #000}'
 +'#dm-gab{break-before:page;page-break-before:always}#dm-gab ol{columns:3;font-size:.95em}'
 +'#dm-bar{position:sticky;top:0;z-index:2147483500;display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:#16213a;color:#fff;padding:8px 14px;font:700 13px "Segoe UI",Arial,sans-serif}#dm-bar label{display:flex;gap:6px;align-items:center}#dm-bar input[type=range]{width:110px}#dm-bar select,#dm-bar button{font:700 13px Arial;padding:3px 8px;border-radius:8px;border:0}'
 +'@media print{#dm-bar,#imp-bar{display:none!important}#dm-sheet{margin:0;max-width:none}@page{size:A4;margin:8mm}}';
 document.head.appendChild(st);
 function esc(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
 function build(){
  var D=window.DRG;if(!D)return;var old=document.getElementById('dm-wrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='dm-wrap';
  var ttl=(document.querySelector('#app h1,h1')||{}).textContent||document.title;
  var q='',gab='',n=0;
  D.FASES.forEach(function(F,fi){
   var tasks=F.gen();q+='<h2>'+esc(F.t||'Fase '+(fi+1))+' — '+esc(F.s||'')+'</h2><div id="dm-g'+fi+'" class="dmg">';gab+='<li><b>'+esc(F.t||'Fase '+(fi+1))+'</b><br>';
   tasks.forEach(function(t,k){
    n++;var h=DRQT(t,D.fmt).replace(/ Monte o troco na carteira\./,'').replace(/Monte <b>exatamente [^<]*<\/b> na carteira, com moedas e cédulas\./,'<b>Quanto você vai pagar?</b>').replace(/<b>Some os preços<\/b> e monte o total exato na carteira\./,'<b>Some os preços. Qual é o total?</b>');var pay=t.paid?' <span class="img">'+DR.bill(t.paid)+'</span>':'';
    q+='<div class="q"><b class="n">'+(k+1)+'</b>'+h+'<div class="r">'+(t.paid?'Troco: R$ <u>&nbsp;</u>':'Total a pagar: R$ <u>&nbsp;</u>')+'</div></div>';
    gab+=(k+1)+') '+D.fmt(t.target)+(k<tasks.length-1?' · ':'');
   });
   q+='</div>';gab+='</li>';
  });
  wrap.innerHTML='<div id="dm-sheet"><h1>'+esc(ttl.replace(/[^\wÀ-ú ]/g,'').trim())+'</h1><div class="id"><span>Nome:</span><span style="max-width:90px">Data:</span><span style="max-width:90px">Turma:</span><span>Escola:</span></div>'
   +'<p style="margin:0 0 6px"><b>Leia com atenção.</b> Calcule e escreva a resposta. Use moedas e cédulas do Real.</p><style>.dmg{display:grid;grid-template-columns:repeat(var(--dm-c,2),1fr);gap:6px 10px}.dmg .q{border:1px dashed #555;border-radius:4px;padding:5px 7px;break-inside:avoid;line-height:1.35}.dmg .q b.n{display:inline-block;background:#000;color:#fff;border-radius:3px;padding:0 5px;margin-right:4px}.dmg .r{margin-top:4px;font-weight:700}.dmg .r u{display:inline-block;min-width:60px;border-bottom:1px solid #000;text-decoration:none}.dmg img{height:var(--dm-i,9mm);width:auto;vertical-align:middle}</style>'+q
   +'<div id="dm-gab"><h2>GABARITO — uso do professor</h2><ol>'+gab+'</ol></div></div>';
  document.body.appendChild(wrap);
 }
 var bar=document.createElement('div');bar.id='dm-bar';
 bar.innerHTML='<span>🖨️ Imprimir atividade</span>'
  +'<label>Questões lado a lado <select id="dm-c"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>'
  +'<label>Letra <input id="dm-f" type="range" min="9" max="18" value="13"></label>'
  +'<label>Margem <input id="dm-m" type="range" min="3" max="20" value="8"></label>'
  +'<label>Cédula <input id="dm-i" type="range" min="4" max="16" value="8"></label>'
  +'<button id="dm-n">🔄 Novas questões</button><button onclick="window.print()" style="background:#ffd24d">Imprimir / Salvar PDF</button>';
 addEventListener('load',function(){
  document.body.insertBefore(bar,document.body.firstChild);build();
  var R=document.documentElement.style;
  function ap(){R.setProperty('--dm-c',document.getElementById('dm-c').value);R.setProperty('--dm-f',document.getElementById('dm-f').value+'px');R.setProperty('--dm-m',document.getElementById('dm-m').value+'mm');R.setProperty('--dm-i',document.getElementById('dm-i').value+'mm')}
  ['dm-c','dm-f','dm-m','dm-i'].forEach(function(i){document.getElementById(i).addEventListener('input',ap)});ap();
  document.getElementById('dm-n').onclick=build;
 });
})();
