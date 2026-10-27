/* cédulas e moedas reais do Real (fotos, com tarja SEM VALOR) */
(function(){
 var st=document.createElement('style');st.textContent='.m img{display:block;height:var(--h);width:auto;filter:drop-shadow(0 .2vh .3vh #0004);pointer-events:none;-webkit-user-drag:none}';
 document.head.appendChild(st);
 var N={200:'n2',500:'n5',1000:'n10',2000:'n20',5000:'n50',10000:'n100',20000:'n200'},C={1:'c1',5:'c5',10:'c10',25:'c25',50:'c50',100:'c100'};
 function im(f,e,v){return '<img src="img/din/'+f+'.'+e+'" alt="R$ '+(v>=100?v/100:v/100)+'" draggable="false" title="Imagem ilustrativa, sem valor">'}
 var C1='<svg viewBox="0 0 100 100" style="display:block;height:var(--h);width:auto;filter:drop-shadow(0 .2vh .3vh #0004);pointer-events:none"><defs><radialGradient id="c1g" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#e9a56a"/><stop offset=".55" stop-color="#c47a3f"/><stop offset="1" stop-color="#8f4f22"/></radialGradient><linearGradient id="c1r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3bf8c"/><stop offset="1" stop-color="#7a3d14"/></linearGradient></defs><circle cx="50" cy="50" r="49" fill="url(#c1r)"/><circle cx="50" cy="50" r="46" fill="url(#c1g)" stroke="#7a3d14" stroke-width="1"/><circle cx="50" cy="50" r="42" fill="none" stroke="#f6cfa4" stroke-width="1.2" stroke-opacity=".7"/><path d="M22 66C14 52 16 36 26 26M78 66C86 52 84 36 74 26" fill="none" stroke="#7a3d14" stroke-width="2.2" stroke-linecap="round" opacity=".75"/><g fill="#8f4f22" opacity=".8"><ellipse cx="18" cy="50" rx="3" ry="1.6" transform="rotate(-40 18 50)"/><ellipse cx="19" cy="40" rx="3" ry="1.6" transform="rotate(-70 19 40)"/><ellipse cx="82" cy="50" rx="3" ry="1.6" transform="rotate(40 82 50)"/><ellipse cx="81" cy="40" rx="3" ry="1.6" transform="rotate(70 81 40)"/></g><text x="50" y="62" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="46" fill="#5a2a0c" stroke="#f6cfa4" stroke-width=".8" paint-order="stroke">1</text><text x="50" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="8.2" letter-spacing=".6" fill="#5a2a0c">CENTAVO</text><text x="50" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="6.5" letter-spacing="1.4" fill="#5a2a0c">BRASIL</text></svg>';
 window.DR={bill:function(v){return im(N[v],'jpg',v)},coin:function(v){return v===1?C1:im(C[v],'png',v)}};
})();
/* enunciado claro e direto para cada questão */
window.DRQT=function(t,fmt){
 if(t&&t.txt)return t.txt;
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
 st.textContent='@media screen and (min-width:701px){html:not(.edu-zoomed) #app{overflow-y:auto!important;overflow-x:hidden}#app>.main{flex:1 0 auto!important;min-height:calc(48vh / var(--ezz,1));overflow:visible!important}#app>.main>.card{overflow:visible!important}}@media screen{#app>.tray{position:fixed!important;left:.5vw;right:.5vw;bottom:.5vh;max-height:calc(56vh / var(--ezz,1))!important;overflow-y:auto!important;flex:none!important;z-index:50;box-shadow:0 -6px 18px #0003;margin:0!important}}';
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
 +'#dm-cut{break-before:page;page-break-before:always}.cutg{display:flex;flex-wrap:wrap;gap:3mm}.ci{display:inline-flex;align-items:center;justify-content:center;border:1px dashed #555;padding:.6mm;box-sizing:content-box}.ci.co{border-radius:50%}.ci .cw{display:flex;align-items:center;justify-content:center}.ci img,.ci svg{height:var(--h)!important;width:auto;display:block;max-width:none}'
 +'#dm-gab{break-before:page;page-break-before:always}#dm-gab ol{columns:3;font-size:.95em}'
 +'#dm-bar{position:sticky;top:0;z-index:2147483500;display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:#16213a;color:#fff;padding:8px 14px;font:700 13px "Segoe UI",Arial,sans-serif}#dm-bar label{display:flex;gap:6px;align-items:center}#dm-bar input[type=range]{width:110px}#dm-bar select,#dm-bar button{font:700 13px Arial;padding:3px 8px;border-radius:8px;border:0}'
 +'@media print{#dm-bar,#imp-bar{display:none!important}#dm-sheet{margin:0;max-width:none}@page{size:A4;margin:8mm}}';
 document.head.appendChild(st);
 function esc(x){return String(x).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}

 function cut(){
  var K=+((document.getElementById('dm-k')||{}).value||3),H=+((document.getElementById('dm-s')||{}).value||12);
  var B=window.BILLSET?Array.from(window.BILLSET).sort(function(x,y){return x-y}):[200,500,1000,2000,5000,10000];
  var CD={1:.52,5:.669,10:.608,25:.76,50:.669,100:.821},NR={200:1.86,500:1.97,1000:2.08,2000:2.18,5000:2.29,10000:2.4,20000:2.5},o='';
  B.forEach(function(v){for(var i=0;i<K;i++)o+='<span class="ci" style="width:'+(H*(NR[v]||2.3)).toFixed(1)+'mm;height:'+H+'mm"><span class="cw" style="--h:'+H+'mm">'+DR.bill(v)+'</span></span>'});
  [1,5,10,25,50,100].forEach(function(v){for(var i=0;i<K*2;i++){var s=H*CD[v];o+='<span class="ci co" style="width:'+s.toFixed(1)+'mm;height:'+s.toFixed(1)+'mm"><span class="cw" style="--h:'+s.toFixed(1)+'mm">'+DR.coin(v)+'</span></span>'}});
  return '<div id="dm-cut"><h2>✂️ Dinheirinho para recortar (cole no caderno)</h2><p style="margin:0 0 6px;font-size:.9em">Recorte pela linha pontilhada. Imagens ilustrativas, sem valor.</p><div class="cutg">'+o+'</div></div>';
 }
 function build(){
  var D=window.DRG;if(!D)return;var old=document.getElementById('dm-wrap');if(old)old.remove();
  var wrap=document.createElement('div');wrap.id='dm-wrap';
  var ttl=(document.querySelector('#app h1,h1')||{}).textContent||document.title;
  var q='',gab='',n=0;
  var Y=+((document.getElementById('dm-y')||{}).value||0);D.FASES.forEach(function(F,fi){
   if(Y&&(F.y||6)!==Y)return;var tasks=F.gen();q+='<h2>'+esc(F.t||'Fase '+(fi+1))+' — '+esc(F.s||'')+'</h2><div id="dm-g'+fi+'" class="dmg">';gab+='<li><b>'+esc(F.t||'Fase '+(fi+1))+'</b><br>';
   tasks.forEach(function(t,k){
    n++;var h=DRQT(t,D.fmt).replace(/ Monte o troco na carteira\./,'').replace(/Monte <b>exatamente [^<]*<\/b> na carteira, com moedas e cédulas\./,'<b>Quais cédulas e moedas você usa para pagar?</b>').replace(/<b>Some os preços<\/b> e monte o total exato na carteira\./,'<b>Some os preços. Qual é o total?</b>');var pay=t.paid?' <span class="img">'+DR.bill(t.paid)+'</span>':'';
    q+='<div class="q"><b class="n">'+(k+1)+'</b>'+h+'<div class="r">'+(t.paid?'Troco: R$ <u>&nbsp;</u>':(t.items.length>1?'Total a pagar: R$ <u>&nbsp;</u>':'Resposta: <u style="min-width:70%">&nbsp;</u>'))+'</div></div>';
    gab+=(k+1)+') '+D.fmt(t.target)+(k<tasks.length-1?' · ':'');
   });
   q+='</div>';gab+='</li>';
  });
  wrap.innerHTML='<div id="dm-sheet"><h1>'+esc(ttl.replace(/[^\wÀ-ú ]/g,'').trim())+'</h1><div class="id"><span>Nome:</span><span style="max-width:90px">Data:</span><span style="max-width:90px">Turma:</span><span>Escola:</span></div>'
   +'<p style="margin:0 0 6px"><b>✂️ Como fazer:</b> recorte cada problema (linha pontilhada) e <b>cole no caderno</b>. Recorte o <b>dinheirinho</b> da última folha, cole no caderno ao lado do problema e <b>resolva ali</b>, mostrando as cédulas e moedas que você usou.</p><style>.dmg{display:grid;grid-template-columns:repeat(var(--dm-c,2),1fr);gap:6px 10px}.dmg .q{border:1px dashed #555;border-radius:4px;padding:5px 7px;break-inside:avoid;line-height:1.35}.dmg .q b.n{display:inline-block;background:#000;color:#fff;border-radius:3px;padding:0 5px;margin-right:4px}.dmg .r{margin-top:4px;font-weight:700}.dmg .r u{display:inline-block;min-width:60px;border-bottom:1px solid #000;text-decoration:none}.dmg img{height:var(--dm-i,9mm);width:auto;vertical-align:middle}</style>'+q
   +cut()+'<div id="dm-gab"><h2>GABARITO — uso do professor</h2><ol>'+gab+'</ol></div></div>';
  document.body.appendChild(wrap);
 }
 var bar=document.createElement('div');bar.id='dm-bar';
 bar.innerHTML='<span>🖨️ Imprimir atividade</span>'
  +'<label>Ano <select id="dm-y"><option value="0">Todos</option><option value="6">6º</option><option value="7">7º</option><option value="8">8º</option><option value="9">9º</option></select></label>'
  +'<label>Questões lado a lado <select id="dm-c"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>'
  +'<label>Letra <input id="dm-f" type="range" min="9" max="18" value="13"></label>'
  +'<label>Margem <input id="dm-m" type="range" min="3" max="20" value="8"></label>'
  +'<label>Dinheiro recortável (qtd) <input id="dm-k" type="range" min="1" max="6" value="3"></label><label>Tamanho <input id="dm-s" type="range" min="8" max="20" value="12"></label>'
  +'<label>Cédula <input id="dm-i" type="range" min="4" max="16" value="8"></label>'
  +'<button id="dm-n">🔄 Novas questões</button><button onclick="window.print()" style="background:#ffd24d">Imprimir / Salvar PDF</button>';
 addEventListener('load',function(){
  document.body.insertBefore(bar,document.body.firstChild);build();
  var R=document.documentElement.style;
  function ap(){R.setProperty('--dm-c',document.getElementById('dm-c').value);R.setProperty('--dm-f',document.getElementById('dm-f').value+'px');R.setProperty('--dm-m',document.getElementById('dm-m').value+'mm');R.setProperty('--dm-i',document.getElementById('dm-i').value+'mm')}
  ['dm-c','dm-f','dm-m','dm-i'].forEach(function(i){document.getElementById(i).addEventListener('input',ap)});['dm-k','dm-s'].forEach(function(i){document.getElementById(i).addEventListener('input',build)});ap();
  document.getElementById('dm-n').onclick=build;document.getElementById('dm-y').onchange=build;
 });
})();
/* bandeja de dinheiro como "gaveta" deslizável: puxador elegante na borda de cima */
document.addEventListener('DOMContentLoaded',function(){
 var tr=document.getElementById('tray');if(!tr||/[?&]imp=1/.test(location.search))return;
 var st=document.createElement('style');
 st.textContent='@media screen{#app>.tray{overflow:visible!important;max-height:none!important}'
 +'#app>.tray>.tray-in{overflow-y:auto;max-height:calc(54vh / var(--ezz,1));display:flex;flex-direction:column;gap:.8vh;border-radius:1.2vh}'
 +'.tray-h,.tray-z{position:absolute;top:-17px;touch-action:none;user-select:none;-webkit-user-select:none;z-index:5;display:flex;align-items:center;justify-content:center}'
 +'.tray-h{left:16px;width:150px;height:30px;border-radius:99px;cursor:ns-resize;background:linear-gradient(#fdfdfd 0%,#e8ecf1 18%,#aeb7c2 52%,#7d8895 78%,#d5dbe3 100%);border:1.5px solid #5b6674;box-shadow:0 5px 10px #0007,0 1px 0 #fff inset,0 -2px 3px #0003 inset}'
 +'.tray-h::before,.tray-h::after{content:"";position:absolute;top:50%;width:11px;height:11px;margin-top:-5.5px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#9aa5b1 60%,#5b6674);box-shadow:0 1px 2px #0006}'
 +'.tray-h::before{left:9px}.tray-h::after{right:9px}'
 +'.tray-h i{display:none}.tray-h b{font:800 10px Arial;letter-spacing:.5px;color:#3d4753;text-shadow:0 1px 0 #fff;pointer-events:none}'
 +'.tray-h span,.tray-z span{position:absolute;inset:-12px -10px}'
 +'.tray-z{right:16px;width:132px;height:30px;border-radius:12px;cursor:ns-resize;gap:6px;background:linear-gradient(105deg,#2b3a55,#46597d 45%,#2b3a55);border:1.5px solid #12203a;box-shadow:0 5px 10px #0007,0 1px 0 #8fa5cc inset,0 -2px 3px #0006 inset;font:800 11px Arial;color:#e8f0ff}'
 +'.tray-z::before{content:"";position:absolute;inset:3px 4px;border-radius:9px;background:repeating-linear-gradient(90deg,#ffffff14 0 2px,transparent 2px 5px);pointer-events:none}'
 +'.tray-z svg{width:18px;height:18px;flex:none}.tray-z em{font-style:normal;font-size:13px;color:#ffd24d;letter-spacing:1px}'
 +'.tray-bar{display:flex;justify-content:center;align-items:center;gap:1vw;margin:0 0 .6vh}.tray-bar .btn.ok{font-size:2.4vh;padding:.8vh 3vw;box-shadow:0 .4vh 1vh #0004}'
 +'#app>.tray.dr-col{padding:.5vh 1vw!important;height:auto!important;min-height:0!important;border-width:2px!important}#app>.tray.dr-col>.tray-in{display:none!important}#app>.tray.dr-col>.tray-bar{margin:0}}';
 document.head.appendChild(st);
 var inn=document.createElement('div');inn.className='tray-in';while(tr.firstChild)inn.appendChild(tr.firstChild);tr.appendChild(inn);
 var okb=document.getElementById('bOk');if(okb){var bar=document.createElement('div');bar.className='tray-bar';bar.appendChild(okb);tr.insertBefore(bar,inn)}
 var h=document.createElement('div');h.className='tray-h';h.title='Arraste para cima ou para baixo';h.innerHTML='<b>GAVETA</b><span></span>';tr.appendChild(h);

 var z=document.createElement('div');z.className='tray-z';z.title='Arraste para aumentar ou diminuir o dinheiro';z.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#ffd24d" stroke-width="2.4" stroke-linecap="round"><circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6M7.5 10h5M10 7.5v5"/></svg><em>▲▼</em><span></span>';tr.appendChild(z);
 var sz=document.getElementById('sz'),zy=0,zv=0,zd=false,zm=false;
 function setSz(v){if(!sz)return;v=Math.max(+sz.min,Math.min(+sz.max,v));sz.value=v;sz.dispatchEvent(new Event('input',{bubbles:true}))}
 z.addEventListener('pointerdown',function(e){zd=true;zm=false;zy=e.clientY;zv=+(sz&&sz.value)||5;z.setPointerCapture(e.pointerId);e.preventDefault()});
 z.addEventListener('pointermove',function(e){if(!zd)return;var dy=zy-e.clientY;if(Math.abs(dy)>4)zm=true;if(zm)setSz(zv+dy/22)});
 z.addEventListener('pointerup',function(){zd=false;if(!zm&&sz){var v=+sz.value;setSz(v<6.5?8.5:v<10?12:5)}});
 function zoom(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ezz'))||1}
 function setH(px){inn.style.setProperty('max-height',px+'px','important');inn.style.setProperty('height',px+'px','important')}
 function clr(){inn.style.removeProperty('max-height');inn.style.removeProperty('height')}
 var y0=0,moved=false,drag=false;
 h.addEventListener('pointerdown',function(e){drag=true;moved=false;y0=e.clientY;h.setPointerCapture(e.pointerId);e.preventDefault()});
 h.addEventListener('pointermove',function(e){if(!drag)return;if(Math.abs(e.clientY-y0)>4)moved=true;if(!moved)return;
  var px=(innerHeight-e.clientY)/zoom()-14;px=Math.max(0,Math.min(px,innerHeight*.85/zoom()));
  if(px<40){tr.classList.add('dr-col')}else{tr.classList.remove('dr-col');setH(px)}});
 h.addEventListener('pointerup',function(e){drag=false;
  if(!moved){if(tr.classList.contains('dr-col')){tr.classList.remove('dr-col');clr()}else tr.classList.add('dr-col')}});
});
document.addEventListener('DOMContentLoaded',function(){
 var tr=document.getElementById('tray'),ap=document.getElementById('app');if(!tr||!ap||/[?&]imp=1/.test(location.search))return;
 function res(){ap.style.setProperty('padding-bottom',(tr.offsetHeight+14)+'px','important')}
 if(window.ResizeObserver)new ResizeObserver(res).observe(tr);addEventListener('resize',res);setTimeout(res,300);res();
});
/* sons: moedas caindo na mesa / cédulas sendo contadas */
(function(){
 var ac=null;
 function ctx(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){}return ac}
 function ligado(){var s=document.getElementById('snd');return !s||s.checked}
 function clink(t0,f,g){var a=ac,o=a.createOscillator(),o2=a.createOscillator(),G=a.createGain();
  o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*2.76;
  G.gain.setValueAtTime(0.0001,t0);G.gain.exponentialRampToValueAtTime(g,t0+0.004);G.gain.exponentialRampToValueAtTime(0.0001,t0+0.28);
  o.connect(G);o2.connect(G);G.connect(a.destination);o.start(t0);o2.start(t0);o.stop(t0+0.3);o2.stop(t0+0.3)}
 function moeda(v){var a=ctx();if(!a)return;var t=a.currentTime,base=v<5?5200:v>=100?2300:v>=50?3000:v>=25?3400:4200;
  clink(t,base,0.22);clink(t+0.085,base*1.05,0.14);clink(t+0.15,base*0.97,0.09);clink(t+0.2,base*1.02,0.05)}
 function cedula(){var a=ctx();if(!a)return;var t=a.currentTime,len=a.sampleRate*0.06,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.5);
  for(var k=0;k<5;k++){var s=a.createBufferSource();s.buffer=buf;var f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=3200+k*350;f.Q.value=0.9;var G=a.createGain();
   var tk=t+k*0.075;G.gain.setValueAtTime(0.0001,tk);G.gain.exponentialRampToValueAtTime(0.5,tk+0.006);G.gain.exponentialRampToValueAtTime(0.0001,tk+0.07);
   s.connect(f);f.connect(G);G.connect(a.destination);s.start(tk)}}
 window.DRSOM={moeda:moeda,cedula:cedula};
 document.addEventListener('pointerdown',function(e){
  if(!ligado())return;var m=e.target.closest&&e.target.closest('.m');if(!m||!m.dataset.v)return;
  if(!m.closest('#tray'))return;var v=+m.dataset.v;v>=200?cedula():moeda(v)},true);
})();

/* níveis 7º, 8º e 9º ano: mais questões e mais difícil (lojas, mercadinho, troco) */
(function(){
 if(!/(loja|mercadinho|troco)/.test(location.pathname))return;
 function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1))}
 function pick(a){return a[rnd(0,a.length-1)]}
 function r50(c){return Math.max(50,Math.round(c/50)*50)}
 function r100(c){return Math.max(100,Math.round(c/100)*100)}
 function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
 var CED=[500,1000,2000,5000,10000];
 function ced(total){for(var i=0;i<CED.length;i++)if(CED[i]>total)return CED[i];return 0}
 function build(D){
  var F=D.FASES,fmt=D.fmt,pool={},i,k;
  F.forEach(function(f){f.y=f.y||6});
  for(i=0;i<5;i++)for(k=0;k<Math.min(4,F.length);k++){try{F[k].gen().forEach(function(t){t.items.forEach(function(x){if(x.e&&x.n&&!pool[x.n])pool[x.n]={e:x.e,n:x.n,p:x.p}})})}catch(e){}}
  var P=Object.keys(pool).map(function(n){return pool[n]}).filter(function(x){return x.p>=100&&x.p<=6000});
  if(P.length<6)return;
  function money(c){return fmt(c)}
  function uniq(fn,n){var out=[],seen={},g=0;while(out.length<n&&g++<800){var t=fn();if(!t||seen[t.txt])continue;seen[t.txt]=1;out.push(t)}return out}
  function mkT(items,total,paid,txt){return {items:items,total:total,paid:paid||0,target:paid?paid-total:total,txt:txt}}
  function a7(){var it=shuffle(P).slice(0,4).map(function(x){return {e:x.e,n:x.n,p:r50(x.p)}}),tot=it.reduce(function(s,x){return s+x.p},0),pg=ced(tot);if(!pg||tot>9800)return null;
   return mkT(it.sort(function(a,b){return a.p-b.p}),tot,pg,'Um cliente comprou 4 produtos: '+it.map(function(x){return x.e+' <b>'+x.n+'</b> ('+money(x.p)+')'}).join(', ')+'. Ele pagou com <b>uma cédula de '+money(pg)+'</b>. <b>Qual é o troco?</b>')}
  function b7(){var n=rnd(2,3),pp=shuffle(P.filter(function(x){return x.p<=2500})).slice(0,n);if(pp.length<n)return null;var it=[],tot=0,parts=[];
   pp.forEach(function(x){var q=rnd(2,5),u=r50(x.p);it.push({e:x.e,n:q+' × '+x.n,p:q*u});tot+=q*u;parts.push(q+' × '+x.e+' <b>'+x.n+'</b> ('+money(u)+' cada)')});
   var pg=ced(tot);if(!pg||tot>9800)return null;
   return mkT(it,tot,pg,'Um cliente comprou: '+parts.join(', ')+'. Ele pagou com <b>uma cédula de '+money(pg)+'</b>. <b>Qual é o troco?</b>')}
  function a8(){var x=pick(P.filter(function(y){return y.p>=1000})),pc=pick([10,20,25,50]),base=r100(x.p);if(base<1000)base=1000;
   var fin=base-base*pc/100,pg=ced(fin);if(!pg)return null;
   return mkT([{e:x.e,n:x.n+' (preço normal)',p:base}],fin,pg,'O produto '+x.e+' <b>'+x.n+'</b> custa '+money(base)+' e está com <b>'+pc+'% de desconto</b>. O cliente pagou com <b>uma cédula de '+money(pg)+'</b>. <b>Qual é o troco?</b>')}
  function b8(){var x=pick(P.filter(function(y){return y.p<=2500&&y.p>=300})),q=rnd(2,5),u=r100(x.p),pc=pick([10,20,50]);
   var bruto=q*u,fin=bruto-bruto*pc/100,pg=ced(fin);if(!pg||bruto>20000)return null;
   return mkT([{e:x.e,n:q+' × '+x.n+' (sem desconto)',p:bruto}],fin,pg,'Um cliente comprou '+q+' × '+x.e+' <b>'+x.n+'</b> a '+money(u)+' cada. A compra toda tem <b>'+pc+'% de desconto</b>. Ele pagou com <b>uma cédula de '+money(pg)+'</b>. <b>Qual é o troco?</b>')}
  function a9(){var it=shuffle(P).slice(0,rnd(2,3)).map(function(x){return {e:x.e,n:x.n,p:r50(x.p)}}),tot=it.reduce(function(s,x){return s+x.p},0),fin=tot+tot/10,pg=ced(fin);if(!pg||fin>9800)return null;
   return mkT(it,fin,pg,'A conta é: '+it.map(function(x){return x.e+' <b>'+x.n+'</b> ('+money(x.p)+')'}).join(', ')+'. Será cobrada <b>taxa de serviço de 10%</b> sobre o total. O cliente pagou com <b>uma cédula de '+money(pg)+'</b>. <b>Qual é o troco?</b>')}
  function b9(){var n=pick([2,3,4,5]),a=pick([600,800,950,1200,1500,1800,2250,2500,3000]),tot=n*a;
   return mkT([{e:'🍽️',n:'Conta da mesa',p:tot}],a,0,'A conta da mesa foi de <b>'+money(tot)+'</b>. Ela será dividida igualmente entre <b>'+n+' amigos</b>. <b>Quanto cada amigo paga?</b> Monte o valor de uma parte.')}
  function c9(){var xs=shuffle(P.filter(function(y){return y.p>=500})).slice(0,2);if(xs.length<2)return null;var p1=r100(xs[0].p),p2=r100(xs[1].p),d1=pick([10,20,50]),d2=pick([10,25]);
   var f1=p1-p1*d1/100,f2=p2-p2*d2/100,tot=f1+f2,pg=ced(tot);if(!pg)return null;
   return mkT([{e:xs[0].e,n:xs[0].n+' (preço normal)',p:p1},{e:xs[1].e,n:xs[1].n+' (preço normal)',p:p2}],tot,pg,'Oferta: '+xs[0].e+' <b>'+xs[0].n+'</b> ('+money(p1)+') com <b>'+d1+'% de desconto</b> e '+xs[1].e+' <b>'+xs[1].n+'</b> ('+money(p2)+') com <b>'+d2+'% de desconto</b>. O cliente pagou com <b>uma cédula de '+money(pg)+'</b>. <b>Qual é o troco?</b>')}
  var NF=[
   {y:7,t:'Quatro produtos',s:'Fase 7 — 7º ano · some 4 preços e dê o troco',fn:a7},
   {y:7,t:'Quantidades',s:'Fase 8 — 7º ano · multiplique e dê o troco',fn:b7},
   {y:8,t:'Desconto',s:'Fase 9 — 8º ano · porcentagem de desconto',fn:a8},
   {y:8,t:'Quantidade com desconto',s:'Fase 10 — 8º ano · multiplicação e porcentagem',fn:b8},
   {y:9,t:'Taxa de serviço',s:'Fase 11 — 9º ano · acréscimo de 10%',fn:a9},
   {y:9,t:'Dividir a conta',s:'Fase 12 — 9º ano · divisão igual',fn:b9},
   {y:9,t:'Duas ofertas',s:'Fase 13 — 9º ano · dois descontos diferentes',fn:c9}];
  NF.forEach(function(n){F.push({y:n.y,t:n.t,s:n.s,i:n.s,gen:function(){return uniq(n.fn,12)}})});
  D.first=function(y){for(var j=0;j<F.length;j++)if((F[j].y||6)===y)return j;return 0};
 }
 document.addEventListener('DOMContentLoaded',function(){
  var D=window.DRG;if(!D||D.nv)return;D.nv=1;build(D);
  var btns=document.querySelector('.top .btns');
  if(!btns||!D.first||/[?&]imp=1/.test(location.search)||!D.go)return;
  var sel=document.createElement('select');sel.id='nivel';sel.title='Escolha o ano';sel.style.cssText='font:700 12px Arial;padding:4px 6px;border-radius:8px;border:2px solid #1f3a8a;background:#fff;color:#1f3a8a';
  sel.innerHTML='<option value="6">6º ano</option><option value="7">7º ano</option><option value="8">8º ano</option><option value="9">9º ano</option>';
  btns.insertBefore(sel,btns.querySelector('#bCfg')||null);
  sel.onchange=function(){D.go(D.first(+sel.value))};
  var m=location.search.match(/[?&]ano=(\d)/);if(m&&D.first(+m[1])){sel.value=m[1];D.go(D.first(+m[1]))}
 });
})();
