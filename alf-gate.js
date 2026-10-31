/* Bloqueio por código + seletor de atividades de alfabetização (páginas do Método das 32 Palavras).
   O código abre todas as páginas deste conjunto; fica lembrado no aparelho. */
(function(){
  var OK=['9999','9998'], CH='alf_ok_v1';
  var ATIVS=[
    ['0','🏠 Menu das atividades','atividades-32-palavras-jogo.html'],
    ['1','🔤 Qual é a palavra?','atividades-32-palavras-jogo.html?a=1'],
    ['2','🧩 Monte a palavra','atividades-32-palavras-jogo.html?a=2'],
    ['3','🔍 Complete a sílaba','atividades-32-palavras-jogo.html?a=3'],
    ['4','👂 Ouça e toque','atividades-32-palavras-jogo.html?a=4'],
    ['5','🅰️ Letra inicial','atividades-32-palavras-jogo.html?a=5'],
    ['6','✏️ Ditado com letras','atividades-32-palavras-jogo.html?a=6'],
    ['t','🖐️ Trace a Palavra (dedo)','trace-palavra-32-palavras-jogo.html']
  ];
  function liberado(){try{return localStorage.getItem(CH)==='1'}catch(e){return false}}
  function barra(){
    if(document.getElementById('alf-nav'))return;
    var atual=/trace-palavra/.test(location.pathname)?'t':((location.search.match(/[?&]a=(\d)/)||[])[1]||'0');
    var b=document.createElement('div');b.id='alf-nav';
    b.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;background:#FFF3E0;border-bottom:2px solid #FB8C00;font:600 15px Verdana,Arial,sans-serif;color:#5D4037;position:relative;z-index:50';
    var l=document.createElement('label');l.textContent='Atividade de alfabetização:';l.htmlFor='alf-sel';
    var s=document.createElement('select');s.id='alf-sel';
    s.style.cssText='font:700 16px Verdana,Arial,sans-serif;padding:8px 10px;border-radius:10px;border:2px solid #FB8C00;background:#fff;color:#263238;min-height:44px;max-width:100%';
    ATIVS.forEach(function(a){var o=document.createElement('option');o.value=a[2];o.textContent=a[1];if(a[0]===atual)o.selected=true;s.appendChild(o)});
    s.onchange=function(){location.href=s.value};
    b.appendChild(l);b.appendChild(s);document.body.insertBefore(b,document.body.firstChild);
  }
  function porta(){
    var o=document.createElement('div');o.id='alf-gate';
    o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#FFF8E1;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Verdana,Arial,sans-serif';
    o.innerHTML='<div style="background:#fff;border-radius:20px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:26px 22px;max-width:380px;width:100%;text-align:center">'
      +'<div style="font-size:3rem">🔒</div><h1 style="margin:6px 0;font-size:1.4rem;color:#E65100">Atividades das 32 Palavras</h1>'
      +'<p style="margin:0 0 14px;color:#455A64">Digite o código para entrar.</p>'
      +'<input id="alf-cod" type="tel" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0000" style="font:700 2rem Verdana,Arial,sans-serif;text-align:center;letter-spacing:.3em;width:100%;padding:12px;border:3px solid #1E88E5;border-radius:14px">'
      +'<div id="alf-err" role="alert" style="min-height:1.4em;color:#C62828;font-weight:700;margin:8px 0"></div>'
      +'<button id="alf-ok" style="width:100%;min-height:56px;border:0;border-radius:14px;background:#43A047;color:#fff;font:700 1.2rem Verdana,Arial,sans-serif;cursor:pointer">Entrar</button></div>';
    document.documentElement.appendChild(o);
    var i=o.querySelector('#alf-cod'),e=o.querySelector('#alf-err');
    function tenta(){
      if(OK.indexOf(i.value.trim())>=0){try{localStorage.setItem(CH,'1')}catch(x){}o.remove();barra()}
      else{e.textContent='Código incorreto. Tente de novo.';i.select()}
    }
    o.querySelector('#alf-ok').onclick=tenta;
    i.addEventListener('keydown',function(ev){if(ev.key==='Enter')tenta()});
    setTimeout(function(){i.focus()},50);
  }
  function inicio(){ if(liberado())barra(); else porta(); }
  if(document.body)inicio(); else document.addEventListener('DOMContentLoaded',inicio);
})();
