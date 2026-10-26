/* Ajusta o tamanho das moedas e cédulas para caber na bandeja em qualquer tela
   (computador, tablet, celular, deitado ou em pé). Só diminui; nunca passa do tamanho escolhido. */
(function(){
 var tray=document.getElementById('tray');if(!tray)return;
 var root=document.documentElement,busy=false,limite=null;
 function baseU(){
  var sz=document.getElementById('sz'),w=innerWidth,h=innerHeight;
  if(w<=820)return w*0.11;
  var v=sz?parseFloat(sz.value):8.4;
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
  busy=false;
 }
 var st=document.createElement('style');st.textContent='@media screen and (min-width:821px) and (max-height:520px){.tray{position:sticky;bottom:0;z-index:40;box-shadow:0 -6px 12px #0003}}';document.head.appendChild(st);
 var st=document.createElement('style');st.textContent='@media(min-width:821px){.zone{min-height:20vh}}.tray .m,.zone .m,.m.drag{touch-action:none!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.m.drag{pointer-events:none}';document.head.appendChild(st);
 var rows=document.querySelectorAll('#tray .row');
 for(var i=0;i<rows.length;i++){rows[i].style.flexWrap='wrap'}
 var t;function agenda(){clearTimeout(t);t=setTimeout(fit,60)}
 addEventListener('resize',agenda);addEventListener('orientationchange',agenda);
 var sz=document.getElementById('sz');if(sz)sz.addEventListener('input',function(){setTimeout(fit,0)});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
 fit();setTimeout(fit,300);
})();
