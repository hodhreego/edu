/* Camada de jogo sobre a colmeia do Prof. Rodrigo: arrastar letras, faixas coloridas, quadrinhos de palavra (verde/vermelho). */
(function(){
 addEventListener('load',function(){var pn=document.getElementById('painel'),tg=document.getElementById('toggle');if(pn&&tg&&pn.style.display!=='none')tg.click()});
 if(/[?&]imp=1/.test(location.search))return;
 var svg=document.querySelector('svg.colmeia');if(!svg)return;
 var NS='http://www.w3.org/2000/svg';
 var polys=[].slice.call(svg.querySelectorAll('.cel polygon')),lets=[].slice.call(svg.querySelectorAll('.let text'));
 var rowsTxt=[].slice.call(svg.querySelectorAll('.lin text'));
 var C=lets.map(function(t,i){return{x:+t.getAttribute('x'),y:+t.getAttribute('y'),ch:t.textContent.trim(),i:i,poly:polys[i]}});
 var STEP=1.732,DIRS=[[STEP,0],[-STEP,0],[STEP/2,1.5],[-STEP/2,1.5],[STEP/2,-1.5],[-STEP/2,-1.5]];
 var rowOf=function(c){return Math.round(c.y/1.5)+1};
 var items=[].slice.call(document.querySelectorAll('.listas li')).map(function(li){
  var p=li.querySelector('.pal');return{li:li,w:p.textContent.trim(),col:p.style.color||'#d00',cx:li.querySelector('.cx'),ok:0,rev:0};
 });
 if(!items.length)return;
 var layer=document.createElementNS(NS,'g');layer.setAttribute('class','jg');
 var marca=svg.querySelector('.marca');svg.insertBefore(layer,svg.querySelector('.let'));
 var pv=document.createElementNS(NS,'g');layer.appendChild(pv);
 function cellAt(x,y){var b=null,d=1e9;C.forEach(function(c){var q=(c.x-x)*(c.x-x)+(c.y-y)*(c.y-y);if(q<d){d=q;b=c}});return d<1.1?b:null}
 function byXY(x,y){var b=null,d=.09;C.forEach(function(c){var q=(c.x-x)*(c.x-x)+(c.y-y)*(c.y-y);if(q<d){d=q;b=c}});return b}
 function pt(e){var m=svg.getScreenCTM();if(!m)return null;var p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(m.inverse())}
 function line(a,b,col,op,cls){
  var l=document.createElementNS(NS,'line');l.setAttribute('x1',a.x);l.setAttribute('y1',a.y);l.setAttribute('x2',b.x);l.setAttribute('y2',b.y);
  l.setAttribute('stroke',col);l.setAttribute('stroke-linecap','round');l.setAttribute('stroke-width',cls==='pv'?'1.55':'1.5');l.setAttribute('stroke-opacity',op);if(cls)l.setAttribute('class',cls);return l}
 var pts=0,t0=Date.now(),AC=null;
 var coin=document.getElementById('jg-pts'),prog=document.getElementById('jg-prog'),msgEl=document.getElementById('jg-msg');
 function tone(f,d,v,ty){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
 function setPts(v){pts=Math.max(0,v);coin.textContent=pts+' pontos'}
 function say(t,k){msgEl.textContent=t;msgEl.className=k||''}
 function upd(){var n=items.filter(function(x){return x.ok}).length;prog.textContent=n+' / '+items.length}
 /* posição de cada palavra na grade (para faixas e dicas) */
 function locate(w){
  for(var i=0;i<C.length;i++){if(C[i].ch!==w[0])continue;
   for(var d=0;d<6;d++){var cs=[C[i]],ok=true;
    for(var k=1;k<w.length;k++){var c=byXY(C[i].x+DIRS[d][0]*k,C[i].y+DIRS[d][1]*k);if(!c||c.ch!==w[k]){ok=false;break}cs.push(c)}
    if(ok)return cs}}
  return null;
 }
 items.forEach(function(it){it.cells=locate(it.w)});
 /* 30% das palavras podem ser reveladas pelos quadrinhos; as outras o aluno precisa achar na colmeia */
 var idx=items.map(function(_,i){return i}).sort(function(){return Math.random()-.5});
 idx.slice(0,Math.max(1,Math.round(items.length*.3))).forEach(function(i){items[i].rev=1});
 function marcar(it,quemAchou){
  if(it.ok)return;it.ok=1;var cs=it.cells;
  if(cs){layer.insertBefore(line(cs[0],cs[cs.length-1],it.col,.55),pv)}
  it.li.classList.add('jg-ok');
  if(cs&&it.cx){it.cx.textContent=rowOf(cs[0]);it.cx.classList.add('on')}
  var inp=it.box&&it.box.querySelectorAll('input');if(inp)[].forEach.call(inp,function(n,j){n.value=it.w[j];n.className='g';n.disabled=true});
  if(it.box)it.box.parentNode.classList.add('feito');
  upd();
  if(items.every(function(x){return x.ok}))fim();
 }
 function fim(){
  var sec=Math.round((Date.now()-t0)/1000),m=Math.floor(sec/60),s=sec%60,bonus=Math.max(0,120-Math.floor(sec/5));setPts(pts+bonus);
  document.getElementById('jg-fp').innerHTML='Você achou as <b>'+items.length+'</b> palavras em <b>'+m+'min '+s+'s</b>.<br>Bônus de tempo: +'+bonus+' · Total: <b>'+pts+' pontos</b>';
  document.getElementById('jg-fim').classList.add('on');tone(523,.15,.15,'triangle');setTimeout(function(){tone(784,.3,.15,'triangle')},160);
 }
 /* ---- seleção por arrastar / tocar ---- */
 var drag=null,pend=null;
 function cellsTo(a,p){
  var vx=p.x-a.x,vy=p.y-a.y,best=0,bs=-1e9;
  DIRS.forEach(function(d,k){var s=(vx*d[0]+vy*d[1])/Math.hypot(d[0],d[1]);if(s>bs){bs=s;best=k}});
  var n=Math.max(0,Math.round(bs/Math.hypot(DIRS[best][0],DIRS[best][1])));var out=[a];
  for(var i=1;i<=n;i++){var c=byXY(a.x+DIRS[best][0]*i,a.y+DIRS[best][1]*i);if(!c)break;out.push(c)}
  return out;
 }
 function showPv(cs){pv.innerHTML='';if(cs.length>0)pv.appendChild(line(cs[0],cs[cs.length-1],'#ffb300',.55,'pv'))}
 function tentar(cs){
  showPv([]);if(cs.length<2)return;
  var s=cs.map(function(c){return c.ch}).join(''),r=s.split('').reverse().join('');
  var it=items.filter(function(x){return !x.ok&&(x.w===s||x.w===r)})[0];
  if(it){it.cells=s===it.w?cs:cs.slice().reverse();marcar(it,'tela');setPts(pts+20);tone(660,.12,.14,'triangle');setTimeout(function(){tone(880,.16,.14,'triangle')},90);say('✔ Muito bem! '+it.w,'ok')}
  else{tone(180,.22,.12,'sawtooth');setPts(pts-3);say('Essa não é uma das palavras. Tente de novo!','bad');pv.appendChild(line(cs[0],cs[cs.length-1],'#e53935',.5,'pv'));setTimeout(function(){showPv([])},350)}
 }
 svg.style.touchAction='none';svg.style.cursor='crosshair';
 svg.addEventListener('pointerdown',function(e){
  var p=pt(e);if(!p)return;var c=cellAt(p.x,p.y);if(!c)return;e.preventDefault();
  try{svg.setPointerCapture(e.pointerId)}catch(_){}
  if(pend){var cs=cellsTo(pend,c);if(cs.length>1&&cs[cs.length-1]===c){tentar(cs);pend=null;drag=null;return}pend=null}
  drag={a:c,cs:[c],moved:false};showPv([c]);
 });
 svg.addEventListener('pointermove',function(e){
  if(!drag)return;var p=pt(e);if(!p)return;var cs=cellsTo(drag.a,p);drag.cs=cs;if(cs.length>1)drag.moved=true;showPv(cs);
 });
 function up(){
  if(!drag)return;var d=drag;drag=null;
  if(d.moved&&d.cs.length>1){tentar(d.cs)}else{pend=d.a;showPv([d.a]);say('Agora toque na última letra da palavra.','')}
 }
 svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',function(){drag=null;showPv([])});
 /* ---- quadrinhos para escrever a palavra (verde = certa, vermelho = errada) ---- */
 var fill=document.getElementById('jg-fill');
 items.forEach(function(it,i){
  var d=document.createElement('div');d.className='jg-card';d.style.borderLeftColor=it.col;
  var def=(window.JG_DEFS&&window.JG_DEFS[it.w])||'';
  d.innerHTML='<b style="background:'+it.col+'">'+(i+1)+'</b><span class="df">'+(def||'Palavra de '+it.w.length+' letras')+'</span><div class="bx"></div>';
  var bx=d.querySelector('.bx');it.box=bx;
  it.w.split('').forEach(function(_,j){var n=document.createElement('input');n.maxLength=1;n.autocomplete='off';n.setAttribute('autocapitalize','characters');n.dataset.j=j;n.setAttribute('aria-label','letra '+(j+1));bx.appendChild(n)});
  fill.appendChild(d);
 });
 fill.style.setProperty('--minw',(Math.max.apply(null,items.map(function(x){return x.w.length}))*29+34)+'px');
 fill.addEventListener('input',function(e){
  var n=e.target;if(n.tagName!=='INPUT')return;var bx=n.parentNode,i=[].indexOf.call(fill.children,bx.parentNode),it=items[i],j=+n.dataset.j;
  var v=(n.value||'').toUpperCase().replace(/[^A-Z]/g,'').slice(-1);n.value=v;if(!v){n.className='';return}
  var ok=v===it.w[j];n.className=ok?'g':'r';
  if(ok){tone(660,.07,.1,'triangle');var nx=bx.querySelector('input[data-j="'+(j+1)+'"]');if(nx)nx.focus()}else{tone(180,.16,.1,'sawtooth');setPts(pts-1)}
  var all=[].slice.call(bx.querySelectorAll('input'));
  if(!it.ok&&!it.typed&&all.every(function(x,k){return x.value===it.w[k]})){
   it.typed=1;setPts(pts+5);
   if(it.rev){marcar(it,'quadrinhos');say('Certo! Essa palavra apareceu na colmeia.','ok')}
   else{bx.parentNode.classList.add('feito');all.forEach(function(x){x.disabled=true});say('Palavra certa! Agora ache “'+it.w+'” na colmeia para ganhar os pontos.','ok')}
  }
 });
 fill.addEventListener('keydown',function(e){var n=e.target;if(n.tagName!=='INPUT')return;var p=n.parentNode,j=+n.dataset.j;
  if(e.key==='Backspace'&&!n.value){var pv2=p.querySelector('input[data-j="'+(j-1)+'"]');if(pv2){pv2.value='';pv2.className='';pv2.focus();e.preventDefault()}}
  if(e.key==='ArrowRight'){var nx=p.querySelector('input[data-j="'+(j+1)+'"]');if(nx)nx.focus()}
  if(e.key==='ArrowLeft'){var pv3=p.querySelector('input[data-j="'+(j-1)+'"]');if(pv3)pv3.focus()}});
 /* clicar numa palavra da lista = dica */
 document.getElementById('jg-dica').onclick=function(){
  var it=items.filter(function(x){return !x.ok})[0];if(!it||!it.cells)return;setPts(pts-5);
  var c=it.cells[0];c.poly.style.fill='#fff3b0';setTimeout(function(){c.poly.style.fill=''},1800);say('Dica: a primeira letra de uma palavra está na linha '+rowOf(c)+'.','');
 };
 document.getElementById('jg-novo').onclick=function(){location.reload()};
 document.getElementById('jg-fb').onclick=function(){location.reload()};
 window.EDU_DBG=function(){return items.map(function(x){return{w:x.w,cells:x.cells&&x.cells.map(function(c){return c.i}),rev:x.rev,ok:x.ok}})};
 window.EDU_CELLS=C;
 setPts(0);upd();
})();
