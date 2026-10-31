/* Ajusta sozinho o tamanho das letras/sílabas (peças) ao tamanho da tela: nenhuma peça passa da largura do celular. */
(function(){
 var SEL='.peca,.btn-tile,.slot',T=null,M=1;try{M=parseFloat(localStorage.getItem('edu_tile'))||1}catch(e){}
 var st=document.createElement('style');
 st.textContent=SEL.split(',').map(function(s){return s+'{min-width:var(--t,56px)!important;min-height:var(--t,56px)!important;font-size:calc(var(--t,56px)*.5)!important;padding-left:2px!important;padding-right:2px!important}'}).join('')+
  '.peca.fr{min-width:0!important;font-size:clamp(14px,4.4vw,24px)!important;padding:6px 10px!important}.peca.sil{min-width:var(--t,56px)!important;padding-left:8px!important;padding-right:8px!important;font-size:calc(var(--t,56px)*.42)!important}'+
  '.slot.char-slot,.btn-tile.char-tile{min-height:var(--t,56px)!important}';
 document.head.appendChild(st);
 function ajusta(){
  var ps=document.querySelectorAll(SEL),max=0,seen=[];
  for(var i=0;i<ps.length;i++){var p=ps[i].parentElement;if(p&&seen.indexOf(p)<0){seen.push(p);var n=0;for(var k=0;k<p.children.length;k++)if(p.children[k].matches(SEL))n++;if(n>max)max=n}}
  if(!max)return;
  var W=Math.min(window.innerWidth,640)-44,gap=8,t=Math.floor((W-gap*(max-1))/max);
  t=Math.max(26,Math.round(Math.min(60,t)*M));
  document.documentElement.style.setProperty('--t',t+'px');
 }
 function ui(){
  var ac=document.getElementById('edu-ac');if(!ac||ac.querySelector('#en-tile'))return false;
  var d=document.createElement('div');d.className='r';d.id='en-tile';d.innerHTML='<label style="font:700 13px Arial;width:100%">🔡 Tamanho das letras do jogo</label><button data-m="0.6">Bem menores</button><button data-m="0.8">Menores</button><button data-m="1">Normal</button><button data-m="1.2">Maiores</button>';
  function marca(){[].forEach.call(d.querySelectorAll('button'),function(b){b.classList.toggle('on',parseFloat(b.dataset.m)===M)})}
  d.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();M=parseFloat(b.dataset.m);try{localStorage.setItem('edu_tile',M)}catch(x){}marca();ajusta()});
  marca();ac.appendChild(d);return true}
 var tn=0;(function u(){if(!ui()&&tn++<40)setTimeout(u,250)})();
 function agenda(){clearTimeout(T);T=setTimeout(ajusta,40)}
 new MutationObserver(agenda).observe(document.body,{childList:true,subtree:true});
 addEventListener('resize',agenda);agenda();
})();
