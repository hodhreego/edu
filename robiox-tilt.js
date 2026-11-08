/* Controle por inclinação (giroscópio) para celular/tablet. Uso: var t=RBX_TILT(botaoContainer); t.dx() em [-1,1]; t.edgeY() -> -1/0/1 (inclinar p/ cima/baixo). */
(function(){
 window.RBX_TILT=function(host){
  var ok=('DeviceOrientationEvent' in window)&&(navigator.maxTouchPoints>0);
  var api={dx:function(){return 0},edgeY:function(){return 0},on:false,destroy:function(){}};
  if(!ok)return api;
  var on=false,x=0,y=0,x0=null,y0=null,yst=0;
  function ang(){try{return (screen.orientation&&screen.orientation.angle)||window.orientation||0}catch(e){return 0}}
  function h(e){if(e.gamma==null&&e.beta==null)return;var g=e.gamma||0,b=e.beta||0,a=((ang()%360)+360)%360,px,py;
   if(a===90){px=b;py=-g}else if(a===270){px=-b;py=g}else if(a===180){px=-g;py=-b}else{px=g;py=b}
   x=px;y=py;if(x0===null){x0=x;y0=y}}
  var btn=document.createElement('button');btn.type='button';btn.style.cssText='font:900 13px Arial;padding:6px 9px;border:2px solid #fff;background:#444;color:#fff;border-radius:8px;white-space:nowrap';
  function lab(){btn.textContent=on?'📱 Inclinar: SIM':'📱 Inclinar: NÃO'}
  async function liga(v){
   if(v){try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){var r=await DeviceOrientationEvent.requestPermission();if(r!=='granted'){return}}}catch(e){return}
    x0=y0=null;window.addEventListener('deviceorientation',h);on=true}
   else{window.removeEventListener('deviceorientation',h);on=false}
   api.on=on;lab()}
  btn.onclick=function(){liga(!on)};lab();host.insertBefore(btn,host.lastElementChild);
  var needsPerm=window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function';
  if(!needsPerm)liga(true);
  api.dx=function(){if(!on||x0===null)return 0;var d=x-x0;if(Math.abs(d)<4)return 0;return Math.max(-1,Math.min(1,(d-(d>0?4:-4))/16))};
  api.edgeY=function(){if(!on||y0===null)return 0;var d=y-y0,r=0;if(yst===0&&d<-14){yst=-1;r=-1}else if(yst===0&&d>14){yst=1;r=1}else if(Math.abs(d)<7)yst=0;return r};
  api.destroy=function(){window.removeEventListener('deviceorientation',h)};
  return api;
 };
})();

/* Ícones dos consoles de referência dos minijogos */
window.RBX_CON={
 gba:{nome:'Game Boy Advance',svg:function(w){return '<svg viewBox="0 0 48 28" width="'+(w||34)+'" height="'+((w||34)*28/48)+'" style="vertical-align:middle" aria-label="Game Boy Advance"><rect x="1" y="2" width="46" height="24" rx="9" fill="#6a5acd" stroke="#2d2566" stroke-width="1.5"/><rect x="13" y="6" width="22" height="16" rx="2" fill="#1c1c2e"/><rect x="15" y="8" width="18" height="12" fill="#9bd36a"/><rect x="5" y="12" width="7" height="2.4" fill="#2d2566"/><rect x="7.3" y="9.7" width="2.4" height="7" fill="#2d2566"/><circle cx="39" cy="15" r="2.3" fill="#d6c6ff"/><circle cx="43" cy="11.5" r="2.3" fill="#d6c6ff"/></svg>'}},
 ds:{nome:'Nintendo DS',svg:function(w){return '<svg viewBox="0 0 32 40" width="'+((w||34)*.8)+'" height="'+((w||34)*.8*40/32)+'" style="vertical-align:middle" aria-label="Nintendo DS"><rect x="2" y="1" width="28" height="17" rx="4" fill="#d9dde3" stroke="#555a63" stroke-width="1.2"/><rect x="6" y="3.5" width="20" height="12" rx="1.5" fill="#1c1c2e"/><rect x="7.5" y="5" width="17" height="9" fill="#7fc4ff"/><rect x="11" y="18" width="10" height="2.5" fill="#8a8f98"/><rect x="2" y="21" width="28" height="18" rx="4" fill="#d9dde3" stroke="#555a63" stroke-width="1.2"/><rect x="6" y="23.5" width="20" height="12" rx="1.5" fill="#1c1c2e"/><rect x="7.5" y="25" width="17" height="9" fill="#ffd27f"/></svg>'}},
 '3ds':{nome:'Nintendo 3DS',svg:function(w){return '<svg viewBox="0 0 44 36" width="'+(w||34)+'" height="'+((w||34)*36/44)+'" style="vertical-align:middle" aria-label="Nintendo 3DS"><rect x="3" y="1" width="38" height="17" rx="4" fill="#2aa8d8" stroke="#0d5578" stroke-width="1.2"/><rect x="6" y="3.5" width="32" height="12" rx="1.5" fill="#12202c"/><rect x="7.5" y="5" width="29" height="9" fill="#9ee0ff"/><circle cx="22" cy="2.3" r=".9" fill="#0d5578"/><rect x="3" y="19" width="38" height="16" rx="4" fill="#2aa8d8" stroke="#0d5578" stroke-width="1.2"/><rect x="13" y="21" width="18" height="12" rx="1.5" fill="#12202c"/><rect x="14.5" y="22.5" width="15" height="9" fill="#ffd27f"/><circle cx="7.5" cy="27" r="2.2" fill="#0d5578"/><circle cx="36.5" cy="27" r="2.2" fill="#e8f7ff"/></svg>'}},
 psp:{nome:'PSP',svg:function(w){return '<svg viewBox="0 0 52 26" width="'+(w||34)+'" height="'+((w||34)*26/52)+'" style="vertical-align:middle" aria-label="PSP"><rect x="1" y="2" width="50" height="22" rx="8" fill="#23262d" stroke="#0a0b0e" stroke-width="1.4"/><rect x="12" y="4.5" width="28" height="17" rx="2" fill="#0b0d12"/><rect x="13.5" y="6" width="25" height="14" fill="#6fb7ff"/><rect x="4.5" y="12" width="6" height="2" fill="#aab"/><rect x="6.5" y="10" width="2" height="6" fill="#aab"/><circle cx="43" cy="15" r="1.6" fill="#7fe08a"/><circle cx="46" cy="12" r="1.6" fill="#ff7f7f"/><circle cx="46" cy="18" r="1.6" fill="#7fb7ff"/><circle cx="49" cy="15" r="1.6" fill="#ffd27f"/></svg>'}}
};
