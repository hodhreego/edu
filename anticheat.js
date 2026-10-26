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
 '#ac-aviso{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:2147483600;width:min(94vw,820px);background:#d00000;color:#fff;border:5px solid #fff;border-radius:22px;'+
 'padding:18px 24px;text-align:center;font:900 clamp(22px,4.6vw,44px)/1.15 "Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 0 0 6px #d00000,0 18px 50px rgba(0,0,0,.55);display:none;animation:ac-sacode .45s infinite}'+
 '#ac-aviso small{display:block;font:700 clamp(13px,2vw,18px)/1.3 "Segoe UI",Roboto,Arial,sans-serif;margin-top:8px;opacity:.95}'+
 '@keyframes ac-sacode{0%,100%{transform:translateX(-50%) rotate(0)}15%{transform:translateX(calc(-50% - 12px)) rotate(-2deg)}30%{transform:translateX(calc(-50% + 12px)) rotate(2deg)}45%{transform:translateX(calc(-50% - 9px)) rotate(-1.5deg)}60%{transform:translateX(calc(-50% + 9px)) rotate(1.5deg)}80%{transform:translateX(calc(-50% - 4px))}}'+
 '@media print{#ac-aviso{display:none!important}}';
 document.head.appendChild(css);
 var box=document.createElement('div');box.id='ac-aviso';box.setAttribute('role','alert');
 document.body.appendChild(box);
 function campo(re){var r='';var els=document.querySelectorAll('input');for(var i=0;i<els.length;i++){var e=els[i];var ph=(e.placeholder||'')+(e.name||'')+(e.id||'')+(e.getAttribute('aria-label')||'');if(re.test(ph)&&e.value){r=e.value;break}}return r}
 function enviar(tipo){
  var d={tipo:tipo,jogo:jogo,contagem:cont,nome:campo(/nome|name/i),turma:campo(/turma|class/i),quando:new Date().toLocaleString('pt-BR'),aparelho:navigator.userAgent};
  try{var a=JSON.parse(localStorage.getItem('edu_alertas')||'[]');a.push(d);localStorage.setItem('edu_alertas',JSON.stringify(a.slice(-50)))}catch(e){}
  if(!REPORT_URL)return;
  var body=JSON.stringify({_subject:'ALERTA anti-cola: '+tipo+' — '+(d.nome||'aluno sem nome')+' — '+jogo,tipo:tipo,jogo:jogo,aluno:d.nome,turma:d.turma,tentativas:cont,quando:d.quando,aparelho:d.aparelho});
  try{fetch(REPORT_URL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:body,keepalive:true})}catch(e){}
 }
 function aviso(tipo,titulo){
  cont++;
  box.innerHTML='⚠️ '+titulo+'<small>Isso foi registrado e o professor será avisado. Tentativas nesta página: '+cont+'.</small>';
  box.style.display='block';
  box.style.animation='none';void box.offsetWidth;box.style.animation='';
  clearTimeout(tAviso);tAviso=setTimeout(function(){box.style.display='none'},7000);
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
