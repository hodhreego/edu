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
