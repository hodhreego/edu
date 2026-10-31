/* Acessibilidade de teclado/leitor de tela para os jogos de alfabetização: cartões e opções viram botões focáveis (Tab + Enter/Espaço). */
(function(){
 var SEL='.cartao,.fase:not(.trava),.op,.card,.card-act,.cell,.opcao';
 var st=document.createElement('style');
 st.textContent=SEL.split(',').map(function(s){return s+':focus-visible'}).join(',')+',button:focus-visible,.peca:focus-visible{outline:5px solid #FFD600!important;outline-offset:3px;box-shadow:0 0 0 8px #263238!important}';
 document.head.appendChild(st);
 function prepara(){
  [].forEach.call(document.querySelectorAll(SEL),function(e){
   if(e.__a11y||e.tagName==='BUTTON'||e.tagName==='A')return;e.__a11y=1;
   e.tabIndex=0;if(!e.getAttribute('role'))e.setAttribute('role','button');
   if(!e.getAttribute('aria-label')){var t=(e.innerText||'').replace(/\s+/g,' ').trim();if(t)e.setAttribute('aria-label',t.slice(0,120))}
   e.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();e.click()}});
  });
 }
 var T=null;function ag(){clearTimeout(T);T=setTimeout(prepara,60)}
 new MutationObserver(ag).observe(document.body,{childList:true,subtree:true});ag();
})();
