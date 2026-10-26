/* Anti-cola dos jogos (Prof. Rodrigo).
   Bloqueia menu de contexto / toque longo (onde aparece "Pesquisar com o Google Lens"), seleção e arrastar,
   e avisa em vermelho (tremendo) quando detecta tentativa de busca por imagem, captura de tela ou saída da página.
   Limite técnico: o Google Lens do Android/Chrome roda fora da página; só dá para detectar os sinais acima. */
(function(){
 /* Endereço que recebe o relatório (ex.: formulário do Formspree que encaminha para o seu e-mail). Vazio = só avisa e guarda no aparelho. */
 var REPORT_URL='';
 var jogo=decodeURIComponent(location.pathname.split('/').pop()||'jogo');
 var cont=0,tAviso=null,saiu=0;
 var css=document.createElement('style');
 css.textContent=
 'html,body{-webkit-touch-callout:none!important;-webkit-user-select:none!important;user-select:none!important}'+
 'input,textarea,[contenteditable]{-webkit-user-select:text!important;user-select:text!important}'+
 'img,svg,canvas{-webkit-user-drag:none;user-drag:none}'+
 '#ac-aviso{position:fixed!important;left:10vw!important;top:10vh!important;right:auto!important;bottom:auto!important;margin:0!important;z-index:2147483600;width:80vw!important;height:80vh!important;height:80dvh!important;max-width:none!important;background:#d00000;color:#fff;border:8px solid #fff;border-radius:28px;'+
 'padding:3vh 3vw;text-align:center;font:900 clamp(30px,7vw,84px)/1.12 "Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 0 0 10px #d00000,0 0 0 9999px rgba(0,0,0,.55),0 24px 70px rgba(0,0,0,.7);display:none;flex-direction:column;align-items:center;justify-content:center;gap:2vh;animation:ac-sacode .4s infinite;cursor:pointer}'+
 '#ac-aviso small{display:block;font:700 clamp(16px,2.6vw,30px)/1.3 "Segoe UI",Roboto,Arial,sans-serif;opacity:.97}'+
 '#ac-aviso em{display:block;font:800 clamp(14px,2vw,22px) "Segoe UI",Roboto,Arial,sans-serif;font-style:normal;background:#fff;color:#d00000;border-radius:99px;padding:6px 22px}'+
 '@keyframes ac-sacode{0%,100%{transform:translate(0,0) rotate(0)}12%{transform:translate(-22px,6px) rotate(-2.2deg)}25%{transform:translate(22px,-6px) rotate(2.2deg)}38%{transform:translate(-16px,-8px) rotate(-1.6deg)}50%{transform:translate(16px,8px) rotate(1.6deg)}65%{transform:translate(-10px,0) rotate(-1deg)}80%{transform:translate(10px,0) rotate(1deg)}}'+
 '@media print{#ac-aviso{display:none!important}}';
 document.head.appendChild(css);
 var box=document.createElement('div');box.id='ac-aviso';box.setAttribute('role','alert');
 document.body.appendChild(box);
 function campo(re){var r='';var els=document.querySelectorAll('input');for(var i=0;i<els.length;i++){var e=els[i];var ph=(e.placeholder||'')+(e.name||'')+(e.id||'')+(e.getAttribute('aria-label')||'');if(re.test(ph)&&e.value){r=e.value;break}}return r}
 function enviar(tipo){
  var d={tipo:tipo,jogo:jogo,contagem:cont,nome:(window.EDU_ALUNO&&EDU_ALUNO().nome)||campo(/nome|name/i),turma:(window.EDU_ALUNO&&EDU_ALUNO().turma)||campo(/turma|class/i),quando:new Date().toLocaleString('pt-BR'),aparelho:navigator.userAgent};
  try{var a=JSON.parse(localStorage.getItem('edu_alertas')||'[]');a.push(d);localStorage.setItem('edu_alertas',JSON.stringify(a.slice(-50)))}catch(e){}
  if(!REPORT_URL)return;
  var body=JSON.stringify({_subject:'ALERTA anti-cola: '+tipo+' — '+(d.nome||'aluno sem nome')+' — '+jogo,tipo:tipo,jogo:jogo,aluno:d.nome,turma:d.turma,tentativas:cont,quando:d.quando,aparelho:d.aparelho});
  try{fetch(REPORT_URL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:body,keepalive:true})}catch(e){}
 }
 box.addEventListener('click',function(){box.style.display='none'});
 var AC=null;
 function alarme(){
  try{if(navigator.vibrate)navigator.vibrate([300,120,300,120,500])}catch(e){}
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
   for(var i=0;i<6;i++){var t=AC.currentTime+i*.32,o=AC.createOscillator(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(i%2?620:880,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.32)}}catch(e){}
 }
 function aviso(tipo,titulo){
  cont++;
  box.innerHTML='⚠️ '+titulo+'<small>Isso foi registrado e o professor será avisado. Tentativas nesta página: '+cont+'.</small><em>Toque aqui para fechar</em>';
  box.style.display='flex';alarme();
  box.style.animation='none';void box.offsetWidth;box.style.animation='';
  clearTimeout(tAviso);tAviso=setTimeout(function(){box.style.display='none'},9000);
  enviar(tipo);
 }
 var LENS='TENTATIVA DE USAR O GOOGLE LENS DETECTADA!';
 document.addEventListener('contextmenu',function(e){if(/input|textarea/i.test(e.target.tagName))return;e.preventDefault();aviso('Google Lens / busca por imagem (menu do botão direito)',LENS)},true);
 /* toque longo no celular (abre "Pesquisar imagem com o Lens") */
 var tl=null;
 document.addEventListener('touchstart',function(e){if(e.touches.length>1)return;var t=e.target;if(/input|textarea|button|select/i.test(t.tagName))return;clearTimeout(tl);tl=setTimeout(function(){aviso('Google Lens / busca por imagem (toque longo)',LENS)},650)},{passive:true,capture:true});
 ['touchend','touchmove','touchcancel'].forEach(function(n){document.addEventListener(n,function(){clearTimeout(tl)},{passive:true,capture:true})});
 document.addEventListener('dragstart',function(e){if(e.target&&e.target.closest&&e.target.closest('.m,.chip,.jchip,[draggable=true]'))return;e.preventDefault()},true);
 document.addEventListener('keydown',function(e){
  var k=(e.key||'').toLowerCase();
  if(k==='printscreen'||(e.metaKey&&e.shiftKey&&k==='s')||(e.ctrlKey&&e.shiftKey&&k==='s')){e.preventDefault();aviso('Captura de tela',LENS.replace('GOOGLE LENS','CAPTURA DE TELA / GOOGLE LENS'));return}
  if(k==='f12'||(e.ctrlKey&&e.shiftKey&&/^[ijc]$/.test(k))||(e.ctrlKey&&k==='u')){e.preventDefault();aviso('Ferramentas do navegador',LENS.replace('O GOOGLE LENS','USO DE FERRAMENTAS DO NAVEGADOR'))}
 },true);
 document.addEventListener('copy',function(e){e.preventDefault()},true);
 /* saiu da página (outra aba, app do Lens, tela dividida): registra e avisa ao voltar */
 var oculto=0;
 document.addEventListener('visibilitychange',function(){
  if(document.hidden){oculto=Date.now()}
  else if(oculto&&Date.now()-oculto>1500){saiu++;aviso('Saiu da página ('+Math.round((Date.now()-oculto)/1000)+' s)','VOCÊ SAIU DA PÁGINA! (poderia ser o Google Lens)')}
 });
})();
