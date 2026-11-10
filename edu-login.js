/* Login do aluno na Ludopédia: pedido ao clicar numa atividade ou ao dar play num código. Guarda em localStorage (edu_login). */
(function(){
 var RE=/^(\d{1,3}[a-z]{3}\d[a-z]|mestre|teste|mainara)$/,SENHA='2026.2026',MESTRA='45999699444';
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k)||'';localStorage.setItem(k,v)}catch(e){return ''}}
 window.EDU_LOGIN=function(){var l=ls('edu_login');return RE.test(l)?l:''};
 window.EDU_LOGIN_SAIR=function(){try{localStorage.removeItem('edu_login');sessionStorage.removeItem('rbx_login');sessionStorage.removeItem('rbx_ok')}catch(e){}};
 function grava(l){ls('edu_login',l);try{sessionStorage.setItem('rbx_login',l);if(l==='mestre')sessionStorage.setItem('rbx_master','1')}catch(e){}}
 window.EDU_EXIGE_LOGIN=function(cb){
  if(EDU_LOGIN()){grava(EDU_LOGIN());return cb()}
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0b1020e8;display:flex;align-items:center;justify-content:center;padding:14px;font-family:Arial,sans-serif';
  o.innerHTML='<div style="background:#fff;border-radius:18px;padding:22px 20px;width:min(94vw,360px);text-align:center"><h2 style="margin:0 0 4px">🔐 Entrar</h2><p style="margin:0 0 10px;color:#555;font-size:14px">Use o login do RCO (ex.: 7cla6b) para guardar o seu progresso.</p><label style="display:block;text-align:left;font-weight:700;font-size:13px;margin:8px 0">Login<input id="elU" autocapitalize="none" autocomplete="off" style="width:100%;box-sizing:border-box;font:700 18px Arial;padding:10px;border:2px solid #cbd5e1;border-radius:10px"></label><label style="display:block;text-align:left;font-weight:700;font-size:13px;margin:8px 0">Senha<input id="elP" type="password" style="width:100%;box-sizing:border-box;font:700 18px Arial;padding:10px;border:2px solid #cbd5e1;border-radius:10px"></label><div id="elE" style="color:#b91c1c;font-weight:700;min-height:20px;font-size:14px"></div><button id="elG" type="button" style="width:100%;font:900 19px Arial;padding:13px;border:0;border-radius:12px;background:#16a34a;color:#fff;cursor:pointer">▶ Entrar</button><button id="elQ" type="button" style="width:100%;margin-top:8px;font:800 16px Arial;padding:11px;border:2px solid #1f4fd8;border-radius:12px;background:#fff;color:#1f4fd8;cursor:pointer">📷 Entrar com QR code</button><div id="elV" style="display:none;margin-top:8px"><video id="elvid" playsinline muted style="width:100%;border-radius:10px;background:#000"></video><button id="elX" type="button" style="margin-top:6px;border:0;background:#eee;padding:8px 16px;border-radius:10px;cursor:pointer">Fechar câmera</button></div><button id="elC" type="button" style="margin-top:8px;border:0;background:#eee;padding:8px 16px;border-radius:10px;cursor:pointer">Cancelar</button></div>';
  document.body.appendChild(o);var $=function(i){return o.querySelector('#'+i)};$('elU').focus();
  function tenta(){var u=$('elU').value.trim().toLowerCase().replace(/\s+/g,''),p=$('elP').value,l=null;
   if((u==='teste'&&p==='teste')||(u==='mainara'&&p==='mainara'))l=u;
   else if(u===MESTRA||p===MESTRA)l=/^\d{1,3}[a-z]{3}\d[a-z]$/.test(u)?u:'mestre';
   else if(!/^\d{1,3}[a-z]{3}\d[a-z]$/.test(u))return $('elE').textContent='Login inválido. Use o formato do RCO, ex.: 7cla6b.';
   else if(p!==SENHA)return $('elE').textContent='Senha incorreta.';
   else l=u;
   grava(l);o.remove();cb()}
  var stream=null,raf=0;
  function stopCam(){cancelAnimationFrame(raf);if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}$('elV').style.display='none'}
  function err(t){$('elE').textContent=t||''}
  function lerQR(txt){var t=String(txt||'').trim().toLowerCase().replace(/^rbx:/,'');var m=t.match(/(?:[?&#]l=)?(\d{1,3}[a-z]{3}\d[a-z])\b/);if(m){stopCam();grava(m[1]);o.remove();cb();return true}return false}
  $('elQ').onclick=function(){err('');
   if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return err('Este aparelho não deixa usar a câmera aqui. Digite o login e a senha.');
   var go=function(){navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:960}},audio:false}).then(function(s){
     stream=s;var v=$('elvid');v.srcObject=s;$('elV').style.display='block';v.play();
     var c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true});
     (function lp(){if(!stream)return;if(v.videoWidth){var sc=Math.min(1,640/v.videoWidth);c.width=Math.round(v.videoWidth*sc);c.height=Math.round(v.videoHeight*sc);x.drawImage(v,0,0,c.width,c.height);var d=x.getImageData(0,0,c.width,c.height),r=window.jsQR&&jsQR(d.data,c.width,c.height,{inversionAttempts:'dontInvert'});if(r&&r.data){if(lerQR(r.data))return;err('QR não reconhecido. Use o QR do seu login.')}}raf=requestAnimationFrame(lp)})()
    }).catch(function(){err('Não consegui abrir a câmera. Permita o acesso ou digite o login.')})};
   if(window.jsQR)go();else{var sc=document.createElement('script');sc.src='jsQR.js?v=1';sc.onload=go;sc.onerror=function(){err('Leitor de QR indisponível. Digite o login e a senha.')};document.head.appendChild(sc)}};
  $('elX').onclick=stopCam;
  $('elG').onclick=tenta;$('elC').onclick=function(){stopCam();o.remove()};
  ['elU','elP'].forEach(function(i){$(i).addEventListener('keydown',function(e){if(e.key==='Enter')tenta()})});
 };
})();
