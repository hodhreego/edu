/* Barra de acessibilidade dos minijogos do RobIox:
   - Aa: tamanho da letra (80% a 220%) com controle deslizante, salvo no aparelho.
   - ?: instruções de controle (teclado, gamepad e toque) de cada jogo.
   O zoom é aplicado no body; a barra compensa a escala para continuar no canto. */
(function () {
  if (window.__RBXFONTE) return;
  window.__RBXFONTE = 1;

  var KEY = 'rbx_fonte_zoom', DEF = 100, MIN = 80, MAX = 220;
  var val = DEF;
  try { var s = parseInt(localStorage.getItem(KEY), 10); if (s >= MIN && s <= MAX) val = s; } catch (e) { }

  var css = ''
    + '#rbxFonteBar{position:fixed;z-index:2147483600;left:calc(10px / var(--rbxz,1));bottom:calc(10px / var(--rbxz,1));'
    + 'display:flex;gap:calc(8px / var(--rbxz,1))}'
    + '#rbxFonteBar button{width:calc(46px / var(--rbxz,1));height:calc(46px / var(--rbxz,1));border-radius:calc(14px / var(--rbxz,1));'
    + 'border:2px solid rgba(255,255,255,.55);background:rgba(15,23,42,.92);color:#fff;'
    + 'font:900 calc(17px / var(--rbxz,1))/1 Arial,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45);'
    + 'touch-action:manipulation}'
    + '#rbxFonteBar button:active{transform:scale(.96)}'
    + '.rbxPainel{position:fixed;z-index:2147483601;left:calc(10px / var(--rbxz,1));bottom:calc(66px / var(--rbxz,1));'
    + 'width:calc(300px / var(--rbxz,1));max-width:calc(100vw / var(--rbxz,1) - 20px);'
    + 'background:#0f172a;color:#f8fafc;border:1px solid rgba(255,255,255,.22);border-radius:calc(16px / var(--rbxz,1));'
    + 'padding:calc(12px / var(--rbxz,1)) calc(14px / var(--rbxz,1));box-shadow:0 18px 44px rgba(0,0,0,.55);'
    + 'font:600 calc(13px / var(--rbxz,1))/1.4 Arial,sans-serif;display:none}'
    + '.rbxPainel.on{display:block}'
    + '.rbxPainel h4{margin:0 0 .5em;font:900 calc(12px / var(--rbxz,1))/1 Arial,sans-serif;letter-spacing:.06em;'
    + 'text-transform:uppercase;color:#a5b4fc;display:flex;justify-content:space-between;align-items:center;gap:.5em}'
    + '.rbxPainel .x{background:transparent;border:0;color:#94a3b8;font-size:1.1em;cursor:pointer;padding:0 .3em}'
    + '.rbxPainel input[type=range]{width:100%;accent-color:#818cf8;margin:.4em 0 .1em}'
    + '.rbxPainel .linha{display:flex;align-items:center;gap:.5em;margin-top:.45em}'
    + '.rbxPainel .bt{flex:1;background:rgba(255,255,255,.1);color:#f8fafc;border:1px solid rgba(255,255,255,.22);'
    + 'border-radius:.7em;padding:.55em;font:800 .95em Arial,sans-serif;cursor:pointer}'
    + '.rbxPainel .bt:active{transform:scale(.97)}'
    + '.rbxPainel .pct{font:900 1.2em Arial,sans-serif;min-width:3.4em;text-align:right}'
    + '.rbxPainel ul{margin:.2em 0 .6em;padding-left:1.1em}'
    + '.rbxPainel li{margin:.28em 0}'
    + '.rbxPainel .k{display:inline-block;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);'
    + 'border-radius:.35em;padding:0 .38em;font:900 .95em Arial,sans-serif}'
    + '.rbxPainel .dica{color:#94a3b8;font-size:.92em;margin-top:.4em}'
    + '@media print{#rbxFonteBar,.rbxPainel{display:none!important}}';

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    var st = document.createElement('style');
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);

    var bar = document.createElement('div');
    bar.id = 'rbxFonteBar';
    bar.innerHTML = '<button id="rbxFonteBtn" type="button" title="Tamanho da letra" aria-label="Tamanho da letra">Aa</button>'
      + '<button id="rbxAjudaBtn" type="button" title="Como jogar" aria-label="Como jogar">?</button>';
    document.body.appendChild(bar);

    var box = document.createElement('div');
    box.className = 'rbxPainel';
    box.id = 'rbxFonteBox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Tamanho da letra');
    box.innerHTML = ''
      + '<h4><span>Tamanho da letra</span><button class="x" type="button" aria-label="Fechar">✕</button></h4>'
      + '<input id="rbxFonteRange" type="range" min="' + MIN + '" max="' + MAX + '" step="5" value="' + val + '" aria-label="Tamanho da letra">'
      + '<div class="linha"><button class="bt" id="rbxFonteMenos" type="button">A−</button>'
      + '<span class="pct" id="rbxFontePct">' + val + '%</span>'
      + '<button class="bt" id="rbxFonteMais" type="button">A+</button></div>'
      + '<div class="linha"><button class="bt" id="rbxFonteReset" type="button">Restaurar (100%)</button></div>';

    var ajuda = document.createElement('div');
    ajuda.className = 'rbxPainel';
    ajuda.id = 'rbxAjudaBox';
    ajuda.setAttribute('role', 'dialog');
    ajuda.setAttribute('aria-label', 'Como jogar');
    ajuda.innerHTML = ''
      + '<h4><span>Como jogar</span><button class="x" type="button" aria-label="Fechar">✕</button></h4>'
      + '<ul>'
      + '<li><b>Teclado:</b> <span class="k">←</span> <span class="k">→</span> ou <span class="k">A</span> <span class="k">D</span> para andar; '
      + '<span class="k">↑</span> / <span class="k">W</span> ou <span class="k">Espaço</span> para pular.</li>'
      + '<li><b>Controle (gamepad):</b> direcional ou analógico para andar; <span class="k">A</span> para pular.</li>'
      + '<li><b>Toque:</b> arraste a bolinha amarela para andar e toque no botão de pular.</li>'
      + '<li><b>Super pulo:</b> mantenha o botão de pular <u>pressionado</u>; o 7º pulo seguido vai bem alto. Soltar zera a contagem.</li>'
      + '<li>Leia a pergunta no chão e escolha a resposta certa para ganhar moedas.</li>'
      + '</ul>'
      + '<div id="rbxAjudaJogo" class="dica" style="display:none;margin-bottom:.5em"></div>'
      + '<div class="dica">Se a letra estiver pequena, use o botão <b>Aa</b> para aumentar.</div>';

    document.body.appendChild(box);
    document.body.appendChild(ajuda);

    var range = document.getElementById('rbxFonteRange');
    var pct = document.getElementById('rbxFontePct');

    function aplicar(p) {
      val = Math.max(MIN, Math.min(MAX, Math.round(p)));
      document.documentElement.style.setProperty('--rbxz', (val / 100).toFixed(2));
      document.body.style.zoom = (val / 100);
      range.value = val;
      pct.textContent = val + '%';
      try { localStorage.setItem(KEY, val); } catch (e) { }
    }

    function fechar() { box.classList.remove('on'); ajuda.classList.remove('on'); }

    aplicar(val);

    range.addEventListener('input', function () { aplicar(+range.value); });
    document.getElementById('rbxFonteMenos').addEventListener('click', function () { aplicar(val - 10); });
    document.getElementById('rbxFonteMais').addEventListener('click', function () { aplicar(val + 10); });
    document.getElementById('rbxFonteReset').addEventListener('click', function () { aplicar(DEF); });

    document.getElementById('rbxFonteBtn').addEventListener('click', function () {
      var abrir = !box.classList.contains('on');
      fechar();
      if (abrir) box.classList.add('on');
    });
    document.getElementById('rbxAjudaBtn').addEventListener('click', function () {
      var aj = document.getElementById('rbxAjudaJogo'); if (aj) { aj.innerHTML = window.RBX_AJUDA_JOGO || ''; aj.style.display = window.RBX_AJUDA_JOGO ? 'block' : 'none'; }
      var abrir = !ajuda.classList.contains('on');
      fechar();
      if (abrir) ajuda.classList.add('on');
    });
    box.querySelector('.x').addEventListener('click', fechar);
    ajuda.querySelector('.x').addEventListener('click', fechar);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fechar();
      if (e.key === '+' || e.key === '=') aplicar(val + 10);
      if (e.key === '-') aplicar(val - 10);
    });
  });
})();
