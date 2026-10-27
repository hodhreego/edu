/* Nome, turma e data do aluno: campos editáveis na própria página, guardados no aparelho e valendo para todos os jogos. */
(function(){
 var K={0:'edu_nome',1:'edu_turma',2:'edu_data'};
 function ls(k,v){try{if(v===undefined)return localStorage.getItem(k)||'';localStorage.setItem(k,v)}catch(e){return ''}}
 var css=document.createElement('style');
 css.textContent='.ident b[contenteditable]{cursor:text;outline:none;white-space:nowrap;overflow:hidden;font-weight:700;color:#16213a;padding:0 3px}'+
  '.ident b[contenteditable]:empty::before{content:attr(data-ph);color:#b6bdd0;font-weight:600}'+
  '.ident b[contenteditable]:focus{background:#fff8d6;border-bottom-color:#1f4fd8}'+
  '@media screen and (max-width:820px){.jogo .ident{display:flex!important;flex-wrap:wrap;gap:4px 10px;align-items:flex-end;text-align:left;font-size:13px!important;margin:0 0 4px}.jogo .ident br{display:none}.jogo .ident b{min-width:84px!important;height:22px!important;font-size:14px}.jogo .ident b:first-of-type{flex:1 1 150px}}'+
  '@media print{.ident b[contenteditable]:empty::before{content:""}.ident b[contenteditable]:focus{background:none}}';
 document.head.appendChild(css);
 var hoje=new Date().toLocaleDateString('pt-BR');
 [].forEach.call(document.querySelectorAll('.ident'),function(id){
  [].forEach.call(id.querySelectorAll('b'),function(b,i){
   b.setAttribute('contenteditable','true');b.setAttribute('spellcheck','false');b.setAttribute('role','textbox');
   b.setAttribute('aria-label',['Nome','Turma','Data'][i]||'');b.dataset.ph=['seu nome','turma','data'][i]||'';
   var v=ls(K[i]);if(i===2&&!v)v=hoje;if(v)b.textContent=v;
   b.addEventListener('input',function(){ls(K[i],b.textContent.replace(/\s+/g,' ').trim())});
   b.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter'){e.preventDefault();b.blur()}},true);
   b.addEventListener('paste',function(e){e.preventDefault();var t=(e.clipboardData||window.clipboardData).getData('text').replace(/\s+/g,' ');document.execCommand('insertText',false,t)});
  });
 });
 [].forEach.call(document.querySelectorAll('.ident'),function(id){
  if(id.querySelector('.esc-w'))return;var w=document.createElement('span');w.className='esc-w';w.style.cssText='white-space:nowrap;margin-left:8px';w.innerHTML='Escola: <b></b>';id.appendChild(w);var b=w.querySelector('b');
  b.setAttribute('contenteditable','true');b.setAttribute('spellcheck','false');b.setAttribute('role','textbox');b.setAttribute('aria-label','Escola');b.dataset.ph='escola';b.style.minWidth='90px';b.style.display='inline-block';b.style.borderBottom='1px solid #8a93ad';
  var v=ls('edu_escola');if(v)b.textContent=v;b.addEventListener('input',function(){ls('edu_escola',b.textContent.replace(/\s+/g,' ').trim())});b.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter'){e.preventDefault();b.blur()}},true)});
 window.EDU_ALUNO=function(){return{nome:ls(K[0]),turma:ls(K[1]),data:ls(K[2])||hoje,escola:ls('edu_escola')}};
})();
