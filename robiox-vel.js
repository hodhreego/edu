/* Controle de velocidade para jogos de corrida/velocidade: window.RBX_SPEED (0.5–1.5), botão ⚡ aparece enquanto um jogo está aberto. */
(function(){
 var K='rbxspeed',v=1;try{v=parseFloat(localStorage.getItem(K))||1}catch(e){}
 window.RBX_SPEED=Math.max(.5,Math.min(1.5,v));
 var box=document.createElement('div');box.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483600;display:none;align-items:center;gap:6px;background:rgba(0,0,0,.65);color:#fff;font:bold 13px system-ui;padding:5px 9px;border-radius:20px;touch-action:manipulation';
 box.innerHTML='<span>⚡ Velocidade</span><button id="rv-" style="width:26px;height:26px;border-radius:50%;border:0;font-weight:bold">−</button><span id="rvv" style="min-width:38px;text-align:center"></span><button id="rv+" style="width:26px;height:26px;border-radius:50%;border:0;font-weight:bold">+</button>';
 function show(){box.querySelector('#rvv').textContent=Math.round(window.RBX_SPEED*100)+'%'}
 function set(x){window.RBX_SPEED=Math.max(.5,Math.min(1.5,Math.round(x*10)/10));try{localStorage.setItem(K,window.RBX_SPEED)}catch(e){}show()}
 document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(box);show();
  box.querySelector('#rv-').onclick=function(e){e.stopPropagation();set(window.RBX_SPEED-.1)};box.querySelector('[id="rv+"]').onclick=function(e){e.stopPropagation();set(window.RBX_SPEED+.1)};
  ['pointerdown','touchstart','mousedown'].forEach(function(ev){box.addEventListener(ev,function(e){e.stopPropagation()})});
  setInterval(function(){var on=false;[].forEach.call(document.body.children,function(n){if(n!==box&&n.style&&n.style.zIndex==='2147483000'&&n.querySelector&&n.querySelector('canvas'))on=true});box.style.display=on?'flex':'none'},400)});
})();
