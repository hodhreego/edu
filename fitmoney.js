/* Ajusta o tamanho das moedas e cédulas para caber na bandeja em qualquer tela
   (computador, tablet, celular, deitado ou em pé). Só diminui; nunca passa do tamanho escolhido. */
(function(){
 var tray=document.getElementById('tray');if(!tray)return;
 var root=document.documentElement,busy=false,limite=null;
 function baseU(){
  var sz=document.getElementById('sz'),w=innerWidth,h=innerHeight;
  var v=sz?parseFloat(sz.value):5;
  if(w<=820)return w*0.11*(v/8.4);
  return (h<=520?15:v*1.35)*h/100;
 }
 function maxH(){return innerHeight*(innerWidth<=820?0.42:0.55)}
 function cabe(){
  var r=tray.getBoundingClientRect();
  var largura=tray.scrollWidth<=tray.clientWidth+1;
  return largura&&r.height<=maxH();
 }
 function fit(){
  if(busy)return;busy=true;
  var u=baseU();root.style.setProperty('--u',u+'px');
  var n=0;while(!cabe()&&n++<60){u*=0.95;root.style.setProperty('--u',u+'px')}
  busy=false;if(window.fitZone)window.fitZone();
 }
 var st=document.createElement('style');st.textContent='@media screen and (min-width:821px) and (max-height:520px){.tray{position:sticky;bottom:0;z-index:40;box-shadow:0 -6px 12px #0003}}';document.head.appendChild(st);
 var st=document.createElement('style');st.textContent='@media(min-width:821px){.zone{min-height:20vh}}.tray .m,.zone .m,.m.drag{touch-action:none!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.m.drag{pointer-events:none}';document.head.appendChild(st);
 var rows=document.querySelectorAll('#tray .row');
 for(var i=0;i<rows.length;i++){rows[i].style.flexWrap='wrap'}
 /* carteira: as peças encolhem conforme entram, para nunca estourar a área */
 var zone=document.getElementById('zone');
 if(zone){
  var zs=document.createElement('style');zs.textContent='.zone .m svg{height:calc(var(--h)*var(--zs,1))!important}.zone{overflow:hidden!important}@media(max-width:820px){.zone{max-height:36vh}}@media(max-height:520px){.zone{max-height:34vh}}';document.head.appendChild(zs);
  var raf=0,busyZ=false;
  function fitZone(){
   if(busyZ)return;busyZ=true;var z=1;zone.style.setProperty('--zs',z);
   var n=0;while((zone.scrollHeight>zone.clientHeight+1||zone.scrollWidth>zone.clientWidth+1)&&z>0.18&&n++<40){z*=0.93;zone.style.setProperty('--zs',z)}
   busyZ=false}
  new MutationObserver(function(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fitZone)}).observe(zone,{childList:true});
  addEventListener('resize',function(){setTimeout(fitZone,120)});
  window.fitZone=fitZone;
 }
 var t;function agenda(){clearTimeout(t);t=setTimeout(fit,60)}
 addEventListener('resize',agenda);addEventListener('orientationchange',agenda);
 var sz=document.getElementById('sz');if(sz)sz.addEventListener('input',function(){setTimeout(fit,0)});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
 fit();setTimeout(fit,300);
})();
/* Ver soma só depois de acertar uma tabuada */
(function(){
 var ok=false,busy=false;
 function ask(done){
  var a=2+Math.floor(Math.random()*8),b=2+Math.floor(Math.random()*8);
  var w=document.createElement('div');
  w.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#000a;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,Arial,sans-serif';
  w.innerHTML='<div style="background:#fff;border-radius:14px;padding:20px 26px;text-align:center;max-width:90vw"><div style="font-size:18px;margin-bottom:8px">Para ver a soma, resolva:</div><div style="font-size:34px;font-weight:900;margin:6px 0">'+a+' × '+b+' = ?</div><input type="number" inputmode="numeric" style="font-size:28px;width:110px;text-align:center;padding:4px;border:2px solid #1f4fd8;border-radius:8px"><div id="tbm" style="min-height:22px;color:#d93025;font-weight:700;margin:6px 0"></div><button id="tbo" style="font-size:18px;padding:6px 18px;border:0;border-radius:8px;background:#0f9d58;color:#fff;font-weight:800">Responder</button> <button id="tbc" style="font-size:18px;padding:6px 14px;border:0;border-radius:8px;background:#e2e8f0;font-weight:700">Cancelar</button></div>';
  document.body.appendChild(w);var i=w.querySelector('input');i.focus();
  function go(){if(parseInt(i.value,10)===a*b){ok=true;w.remove();done()}else{w.querySelector('#tbm').textContent='Errou! Tente outra tabuada.';w.remove();ask(done)}}
  w.querySelector('#tbo').onclick=go;w.querySelector('#tbc').onclick=function(){w.remove();busy=false};
  i.onkeydown=function(e){if(e.key==='Enter')go()};
 }
 function gate(e){
  if(ok||busy)return;var t=e.target;
  var abrindo=t.id==='bSoma'?/Ver/.test(t.textContent):(t.id==='ck'&&t.checked);
  if(!abrindo)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(t.id==='ck')t.checked=false;
  busy=true;ask(function(){busy=false;t.id==='ck'?(t.checked=true,t.dispatchEvent(new Event('change'))):t.click()});
 }
 document.addEventListener('click',function(e){if(e.target.id==='bSoma')gate(e)},true);
 document.addEventListener('change',function(e){if(e.target.id==='ck')gate(e)},true);
})();
