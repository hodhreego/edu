(function(){function f(){var c=window.EDU_COD?EDU_COD():'';[].forEach.call(document.querySelectorAll('.gcod'),function(e){e.textContent=c})}addEventListener('load',f);setTimeout(f,600);setTimeout(f,2000)})();
/* Versão para impressão (?imp=1): só abre com a SENHA do professor (hash em config.js). */
(function(){
 function hex(b){return Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
 function unhex(h){var a=new Uint8Array(h.length/2);for(var i=0;i<a.length;i++)a[i]=parseInt(h.substr(i*2,2),16);return a}
 function sha(t){var enc=new TextEncoder();return crypto.subtle.importKey('raw',enc.encode(t),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(window.EDU_PRINT_SALT||'00'),iterations:600000,hash:'SHA-256'},k,256)}).then(hex)}
 window.EDU_PROF_OK=function(){try{return sessionStorage.getItem('edu_prof')==='1'}catch(e){return false}};
 window.EDU_PROF_TRY=function(pw){return sha(String(pw||'').trim()).then(function(h){var ok=!!window.EDU_PRINT_HASH&&h===window.EDU_PRINT_HASH;if(ok){try{sessionStorage.setItem('edu_prof','1')}catch(e){}}return ok})};
 window.EDU_PROF_ASK=function(done){
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#000c;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,Arial,sans-serif';
  o.innerHTML='<form autocomplete="off" style="background:#fff;border-radius:18px;padding:22px 26px;text-align:center;max-width:90vw"><h3 style="margin:0 0 6px">🔒 Área do professor</h3><p style="margin:0 0 10px;font-size:14px;color:#555">Digite a senha para liberar a versão de impressão.</p><input type="text" name="x'+Math.random().toString(36).slice(2)+'" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore data-form-type="other" readonly onfocus="this.removeAttribute(\'readonly\')" style="-webkit-text-security:disc;font-size:20px;padding:8px 12px;border:2px solid #1f4fd8;border-radius:10px;width:11em;text-align:center"><div style="margin-top:12px;display:flex;gap:8px;justify-content:center"><button type="submit" style="border:0;border-radius:99px;background:#1f4fd8;color:#fff;font:800 15px Arial;padding:9px 22px;cursor:pointer">Entrar</button><button type="button" class="c" style="border:0;border-radius:99px;background:#e6e9f2;font:800 15px Arial;padding:9px 18px;cursor:pointer">Cancelar</button></div><div class="e" style="color:#d93025;font-weight:700;margin-top:8px;min-height:1.2em"></div></form>';
  document.body.appendChild(o);var f=o.querySelector('form'),i=o.querySelector('input');setTimeout(function(){i.focus()},50);
  o.querySelector('.c').onclick=function(){o.remove();done(false)};
  f.onsubmit=function(e){e.preventDefault();EDU_PROF_TRY(i.value).then(function(ok){if(ok){o.remove();done(true)}else{o.querySelector('.e').textContent='Senha incorreta.';i.value='';i.focus()}})};
 };
})();
/* Versão para impressão (?imp=1): papel A4, sem menu/pontos; colmeias ganham folha + gabarito. */
(function(){
 if(!/[?&]imp=1/.test(location.search))return;
 if(!EDU_PROF_OK()){document.documentElement.style.visibility='hidden';addEventListener('DOMContentLoaded',function(){document.documentElement.style.visibility='visible';EDU_PROF_ASK(function(ok){if(ok)location.reload();else location.href=location.pathname})});return}
 try{sessionStorage.removeItem('edu_prof')}catch(e){}
 window.EDU_IMP=true;document.documentElement.classList.add('edu-print-ok');
 var css=document.createElement('style');
 css.textContent='#edu-nav,#ac-aviso,.coin,.jcoin,#edu-ac{display:none!important}body{padding-top:0!important}'+
 '#imp-bar{position:sticky;top:0;z-index:2147483500;display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#16213a;color:#fff;padding:8px 14px;font:700 14px "Segoe UI",Arial,sans-serif}'+
 '#imp-bar button,#imp-bar a{border:0;border-radius:99px;padding:8px 16px;font:800 14px "Segoe UI",Arial,sans-serif;cursor:pointer;background:#ffd24d;color:#16213a;text-decoration:none}'+
 '#imp-bar a{background:#fff}'+
 '#imp-sheet{background:#fff;color:#000;max-width:794px;margin:12px auto;padding:14mm 12mm;font-family:"Segoe UI",Arial,sans-serif}'+
 '#imp-sheet h1{font-size:22px;margin:0 0 4px}#imp-sheet .id{display:flex;gap:18px;font-size:13px;margin:6px 0 10px}#imp-sheet .id span{flex:1;border-bottom:1px solid #000;padding-bottom:2px}'+
 '#imp-sheet svg{width:100%;max-height:150mm;display:block;margin:0 auto}#imp-sheet polygon{fill:#fff;stroke:#000;stroke-width:1}#imp-sheet text{font:700 14px Arial;fill:#000;text-anchor:middle;dominant-baseline:central}'+
 '#imp-sheet ol{columns:2;column-gap:10mm;font-size:12.5px;padding-left:20px;margin:8px 0}#imp-sheet li{break-inside:avoid;margin-bottom:6px}#imp-sheet li i{display:inline-block;min-width:70px;border-bottom:1px solid #000;margin-left:6px}'+
 '#imp-sheet .key polygon.on{fill:#bbb}#imp-sheet .pg{break-before:page}'+
 '@media print{#imp-bar{display:none!important}body{background:#fff!important}#imp-sheet{margin:0;padding:0;max-width:none}@page{size:A4;margin:10mm}}';
css.textContent+='@media print{#cfg,#bCfg,#bLimpar,#bSoma,#bOk,#dots,.dots,#painel,#toggle,#rgpBar,#rgpTimer,#fala-w,#falaBtn,#jg-bar,#jg-fim,.coin,.jcoin,#edu-nav,#edu-ac,#ac-aviso,.btns{display:none!important}}';
 document.head.appendChild(css);
 var bar=document.createElement('div');bar.id='imp-bar';
 bar.innerHTML='<span>🖨️ Versão para imprimir</span><button onclick="window.print()">Imprimir / Salvar PDF</button><a href="'+location.pathname.split('/').pop()+'">▶ Jogar na tela</a>';
 document.body.insertBefore(bar,document.body.firstChild);
 addEventListener('load',function(){
  var chips=[].slice.call(document.querySelectorAll('.jbank div.ch,.jbank .ch')).filter(function(c){return c.dataset&&c.dataset.n});
  if(chips.length){
   var rows=chips.slice().sort(function(a,b){return (+a.dataset.n)-(+b.dataset.n)}).map(function(c){var L=c.dataset.l||'',t=c.textContent.replace(/\s+/g,' ').trim();if(L&&t.indexOf(L)===0)t=t.slice(L.length).trim();return '<li value="'+(+c.dataset.n+1)+'"><b>'+esc(c.dataset.l||'')+'</b> — '+esc(t)+'</li>'}).join('');
   var g=document.createElement('div');g.id='imp-gab';g.innerHTML='<h2>GABARITO — uso do professor · código <b class="gcod"></b></h2><p>Cartão nº → letra da resposta correta</p><ol>'+rows+'</ol>';
   var st=document.createElement('style');st.textContent='#imp-gab{break-before:page;page-break-before:always;background:#fff;color:#000;font-family:"Segoe UI",Arial,sans-serif;padding:10mm;max-width:794px;margin:12px auto}#imp-gab h2{margin:0 0 4px;font-size:20px}#imp-gab p{margin:0 0 8px;font-size:13px}#imp-gab ol{columns:2;column-gap:10mm;font-size:14px;line-height:1.6;padding-left:28px}#imp-gab li{break-inside:avoid}#imp-gab b{display:inline-block;min-width:1.6em;text-align:center;border:1.5px solid #000;border-radius:50%;margin-right:4px}';
   document.head.appendChild(st);document.body.appendChild(g);
  }
 });
 function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
 addEventListener('load',function(){
  var jb=document.getElementById('jbank')||document.querySelector('.jbank');
  if(jb){
   var st=document.createElement('style');
   st.textContent='.jbank div.ch,.jbank>div{border:1.6px dashed #000!important;background:#fff!important;box-shadow:none!important;border-radius:0!important}.jbank{border:2px dashed #000!important}.jbank div.ch{overflow-wrap:normal!important;word-break:normal!important;hyphens:none;font-size:9.5pt!important}.imp-inst{font:700 12px "Segoe UI",Arial,sans-serif;border:1.5px solid #000;border-radius:6px;padding:5px 9px;margin:6px 0;background:#fff;color:#000;line-height:1.35}@media print{.imp-inst{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
   document.head.appendChild(st);
   var d=document.createElement('div');d.className='imp-inst';
   d.innerHTML='✂️ <b>Como fazer:</b> 1) Recorte as respostas nas <b>linhas pontilhadas</b>. 2) Leia cada cartão numerado. 3) Cole cada resposta no cartão correto (ou escreva a letra no quadradinho). 4) Confira com o professor.';
   jb.parentNode.insertBefore(d,jb);
  }

  if(typeof window.EDU_PRINT==='function'){
   var P=window.EDU_PRINT(),app=document.getElementById('app'),sv=document.getElementById('sv');
   if(!sv)return;
   var t=(document.title||'').replace(/^🐝\s*/,'');
   function board(key){var c=sv.cloneNode(true);c.removeAttribute('id');
    c.querySelectorAll('.hx').forEach(function(g){g.setAttribute('class','hx');var p=g.querySelector('polygon');p.removeAttribute('style');if(key&&P.on[g.dataset.k])p.setAttribute('class','on')});return c.outerHTML}
   var on={};P.words.forEach(function(w){w.cells.forEach(function(k){on[k]=1})});P.on=on;
   var cl=P.words.map(function(w){return '<li>'+esc(w.c)+' <small>('+w.w.length+' letras)</small><i></i></li>'}).join('');
   var gab=P.words.map(function(w,i){return '<li>'+esc(w.w)+'</li>'}).join('');
   var sh=document.createElement('div');sh.id='imp-sheet';
   sh.innerHTML='<h1>🐝 '+esc(t)+'</h1><div class="id"><span>Nome:</span><span>Turma:</span><span>Data:</span></div>'+
    '<p style="font-size:12.5px;margin:4px 0 8px">Encontre as palavras na colmeia (em qualquer direção, de frente para trás ou de trás para frente), pinte cada uma com uma cor e escreva-a ao lado da dica.</p>'+
    board(false)+'<ol>'+cl+'</ol>'+
    '<div class="pg key"><h1>Gabarito — '+esc(t)+' · código <b class="gcod"></b></h1>'+board(true)+'<ol>'+gab+'</ol></div>';
   app.style.display='none';document.body.appendChild(sh);
  }
 });
})();
