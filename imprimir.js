/* Versão para impressão (?imp=1): papel A4, sem menu/pontos; colmeias ganham folha + gabarito. */
(function(){
 if(!/[?&]imp=1/.test(location.search))return;
 window.EDU_IMP=true;
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
 document.head.appendChild(css);
 var bar=document.createElement('div');bar.id='imp-bar';
 bar.innerHTML='<span>🖨️ Versão para imprimir</span><button onclick="window.print()">Imprimir / Salvar PDF</button><a href="'+location.pathname.split('/').pop()+'">▶ Jogar na tela</a>';
 document.body.insertBefore(bar,document.body.firstChild);
 function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
 addEventListener('load',function(){
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
    '<div class="pg key"><h1>Gabarito — '+esc(t)+'</h1>'+board(true)+'<ol>'+gab+'</ol></div>';
   app.style.display='none';document.body.appendChild(sh);
  }
 });
})();
