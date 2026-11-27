/* Login do aluno na Ludopédia: pedido ao clicar numa atividade ou ao dar play num código.
   Com o porteiro ligado (config.js EDU_AUTH_ON), entra DE VERDADE no servidor (mesma sessão edu_sess de 1h40 usada por todo o site),
   para nenhuma página pedir login de novo. Timeout 20 s + até 4 novas tentativas. Sem porteiro: comportamento antigo (só edu_login). */
(function(){
 var RE=/^(\d{1,3}[a-z]{3}\d[a-z]|mestre|teste|mainara)$/,RA=/^\d{1,3}[a-z]{3}\d[a-z]$/,SENHA='2026.2026',MESTRA='45999699444',SESS_MS=100*6e4;
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k)||'';localStorage.setItem(k,v)}catch(e){return ''}}
 function authOn(){try{return window.EDU_AUTH_ON===true||localStorage.getItem('edu_auth_teste')==='1'}catch(e){return false}}
 function sessOk(){try{var s=JSON.parse(localStorage.getItem('edu_sess')||'null');return s&&RE.test(s.login)&&s.exp>Date.now()?s:null}catch(e){return null}}
 window.EDU_LOGIN=function(){if(authOn()){var s=sessOk();return s?s.login:''}var l=ls('edu_login');return RE.test(l)?l:''};
 window.EDU_LOGIN_SAIR=function(){try{localStorage.removeItem('edu_login');sessionStorage.removeItem('rbx_login');sessionStorage.removeItem('rbx_ok')}catch(e){}};
 function grava(l){ls('edu_login',l);try{sessionStorage.setItem('rbx_login',l);sessionStorage.setItem('rbx_ok','1');if(l==='mestre')sessionStorage.setItem('rbx_master','1')}catch(e){}}
 function gravaSess(s){try{localStorage.setItem('edu_sess',JSON.stringify(s))}catch(e){}grava(s.login);try{if(s.mestre)sessionStorage.setItem('rbx_master','1')}catch(e){}}
 function getJ(url,prog){var esp=[1500,3000,5000,8000],n=0;
  function um(){var ac=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ac)ac.abort()},20000);
   return fetch(url,ac?{signal:ac.signal}:{}).then(function(r){return r.text()}).then(function(t){clearTimeout(tm);var j=null;try{j=JSON.parse(t)}catch(e){}return j&&typeof j==='object'?j:{ok:0,net:1}},function(){clearTimeout(tm);return{ok:0,net:1}})}
  function vai(){return um().then(function(j){if(!j.ok&&(j.net||j.tentar)&&n<esp.length){var w=esp[n++];try{if(prog)prog(n+1)}catch(e){}return new Promise(function(r){setTimeout(r,w)}).then(vai)}return j})}
  return vai()}
 /* aquece o servidor (Apps Script "dorme") enquanto a página abre */
 try{if(authOn()&&!sessOk()&&window.EDU_ENDPOINT)fetch(EDU_ENDPOINT+'?acao=taxas').catch(function(){})}catch(e){}
 /* entra no servidor: devolve {ok,login} ou {ok:0,erro} */
 function entrarSrv(u,p,prog){
  if((u==='teste'&&p==='teste')||(u==='mainara'&&p==='mainara')){gravaSess({login:u,t:'',local:1,exp:Date.now()+SESS_MS,ini:Date.now(),turma:'',trocar:0});return Promise.resolve({ok:1,login:u})}
  if(u===MESTRA||p===MESTRA){var l=RA.test(u)?u:'mestre';gravaSess({login:l,t:'',local:1,mestre:1,exp:Date.now()+12*36e5,turma:l.replace(/^\d+/,''),trocar:0});return Promise.resolve({ok:1,login:l})}
  if(!RA.test(u))return Promise.resolve({ok:0,erro:'Login inválido. Use o formato do RCO, ex.: 7cla6b.'});
  if(!p)return Promise.resolve({ok:0,erro:'Digite a senha.'});
  if(window.EDU_AUTH&&EDU_AUTH.entrar)return EDU_AUTH.entrar(u,p,prog).then(function(j){return j&&j.ok?{ok:1,login:u}:j});
  var ep=window.EDU_ENDPOINT||'';if(!ep)return Promise.resolve({ok:0,erro:'Sem endereço do servidor.'});
  if(!(window.crypto&&crypto.subtle))return Promise.resolve({ok:0,erro:'Este navegador não permite entrar (precisa de https).'});
  var t0=Date.now();
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(u+':'+p+':edu')).then(function(b){
   var h=Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('');
   return getJ(ep+(ep.indexOf('?')<0?'?':'&')+'acao=entrar&login='+encodeURIComponent(u)+'&h='+h,prog).then(function(j){
    if(j&&j.ok&&j.token){var min=+j.validadeMin>0?+j.validadeMin:100;gravaSess({login:u,t:j.token,exp:t0+min*6e4-3e4,ini:t0,turma:j.turma||u.replace(/^\d+/,'')});return{ok:1,login:u}}
    if(j&&!j.ok&&(j.net||j.tentar))return{ok:0,erro:'Não foi possível falar com o servidor agora. Espere alguns segundos e toque em Entrar de novo.'};
    return{ok:0,erro:(j&&j.erro)||'Não foi possível entrar.'}})});
 }
 window.EDU_EXIGE_LOGIN=function(cb){
  if(EDU_LOGIN()){grava(EDU_LOGIN());return cb()}
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0b1020e8;display:flex;align-items:center;justify-content:center;padding:14px;font-family:Arial,sans-serif';
  o.innerHTML='<div style="background:#fff;border-radius:18px;padding:22px 20px;width:min(94vw,360px);text-align:center"><h2 style="margin:0 0 4px">🔐 Entrar</h2><p style="margin:0 0 10px;color:#555;font-size:14px">Use o login do RCO (ex.: 7cla6b) para guardar o seu progresso.</p><label style="display:block;text-align:left;font-weight:700;font-size:13px;margin:8px 0">Login<input id="elU" autocapitalize="none" autocomplete="off" style="width:100%;box-sizing:border-box;font:700 18px Arial;padding:10px;border:2px solid #cbd5e1;border-radius:10px"></label><label style="display:block;text-align:left;font-weight:700;font-size:13px;margin:8px 0">Senha<input id="elP" type="password" style="width:100%;box-sizing:border-box;font:700 18px Arial;padding:10px;border:2px solid #cbd5e1;border-radius:10px"></label><div id="elE" style="color:#b91c1c;font-weight:700;min-height:20px;font-size:14px"></div><button id="elG" type="button" style="width:100%;font:900 19px Arial;padding:13px;border:0;border-radius:12px;background:#16a34a;color:#fff;cursor:pointer">▶ Entrar</button><button id="elQ" type="button" style="width:100%;margin-top:8px;font:800 16px Arial;padding:11px;border:2px solid #1f4fd8;border-radius:12px;background:#fff;color:#1f4fd8;cursor:pointer">📷 Entrar com QR code</button><div id="elV" style="display:none;margin-top:8px"><video id="elvid" playsinline muted style="width:100%;border-radius:10px;background:#000"></video><button id="elX" type="button" style="margin-top:6px;border:0;background:#eee;padding:8px 16px;border-radius:10px;cursor:pointer">Fechar câmera</button></div><button id="elC" type="button" style="margin-top:8px;border:0;background:#eee;padding:8px 16px;border-radius:10px;cursor:pointer">Cancelar</button></div>';
  document.body.appendChild(o);var $=function(i){return o.querySelector('#'+i)};$('elU').focus();
  var ocup=false;
  function fimOk(l){grava(l);o.remove();cb()}
  /* porteiro ligado: entra no servidor (sessão de 1h40 para o site todo); desligado: só confere a senha fixa, como antes */
  function viaServidor(u,p){if(ocup)return;ocup=true;var b=$('elG');b.disabled=true;b.textContent='⏳ Entrando…';err('');
   entrarSrv(u,p,function(n){$('elE').style.color='#1f4fd8';err('Conectando ao servidor… (tentativa '+n+')')}).then(function(j){
    ocup=false;b.disabled=false;b.textContent='▶ Entrar';$('elE').style.color='#b91c1c';
    if(j&&j.ok){err('');fimOk(j.login);return}err((j&&j.erro)||'Não foi possível entrar.')})}
  function tenta(){var u=$('elU').value.trim().toLowerCase().replace(/\s+/g,''),p=$('elP').value,l=null;
   if(authOn())return viaServidor(u,p);
   if((u==='teste'&&p==='teste')||(u==='mainara'&&p==='mainara'))l=u;
   else if(u===MESTRA||p===MESTRA)l=/^\d{1,3}[a-z]{3}\d[a-z]$/.test(u)?u:'mestre';
   else if(!/^\d{1,3}[a-z]{3}\d[a-z]$/.test(u))return $('elE').textContent='Login inválido. Use o formato do RCO, ex.: 7cla6b.';
   else if(p!==SENHA)return $('elE').textContent='Senha incorreta.';
   else l=u;
   fimOk(l)}
  var stream=null,raf=0;
  function stopCam(){cancelAnimationFrame(raf);if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}$('elV').style.display='none'}
  function err(t){$('elE').textContent=t||''}
  function lerQR(txt){var t=String(txt||'').trim().toLowerCase().replace(/^rbx:/,'');var m=t.match(/(?:[?&#]l=)?(\d{1,3}[a-z]{3}\d[a-z])\b/);if(m){stopCam();if(authOn())viaServidor(m[1],SENHA);else fimOk(m[1]);return true}return false}
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
