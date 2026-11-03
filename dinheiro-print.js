/* Folha de dinheiro para recortar, ajustável, em todas as atividades que usam dinheiro.js */
(function () {
  if (window.__DPRINT || !window.DR) return;
  window.__DPRINT = 1;
  if (/[?&]imp=1/.test(location.search)) return;

  var CFG = { h: 22, gap: 2, qb: 3, qc: 5, fill: true };
  try { Object.assign(CFG, JSON.parse(localStorage.getItem('dprint_cfg') || '{}')); } catch (e) {}

  var BILLS = [200, 500, 1000, 2000, 5000, 10000];
  var COINS = [1, 5, 10, 25, 50, 100];

  var css = document.createElement('style');
  css.textContent =
    '.card h2 .btop{font-size:1.3vh!important;padding:.5vh .8vw!important;margin-left:8px;flex:none}' +
    '#dprintBtn{position:fixed;right:14px;bottom:14px;z-index:2147483000;border:0;border-radius:999px;padding:10px 16px;font:800 14px "Segoe UI",Arial;background:#1f3a8a;color:#fff;cursor:pointer;box-shadow:0 6px 18px #0004}' +
    '#dprintBtn:hover{filter:brightness(1.12)}' +
    '#dprintSheet{display:none;position:fixed;inset:0;z-index:2147483100;background:#eef3fb;overflow:auto;padding:64px 12px 40px}' +
    'body.dprint-on #dprintSheet{display:block}' +
    '#dprintBar{position:fixed;left:0;right:0;top:0;z-index:2147483200;display:none;gap:10px;align-items:center;flex-wrap:wrap;background:#16213a;color:#fff;padding:8px 14px;font:700 13px "Segoe UI",Arial}' +
    'body.dprint-on #dprintBar{display:flex}' +
    '#dprintBar label{display:flex;align-items:center;gap:6px;white-space:nowrap}' +
    '#dprintBar input[type=range]{width:110px}' +
    '#dprintBar button{border:0;border-radius:99px;padding:8px 14px;font:800 13px "Segoe UI",Arial;cursor:pointer;background:#ffd24d;color:#16213a}' +
    '#dprintBar button.sec{background:#fff}' +
    '.dpsheet{background:#fff;color:#111;max-width:794px;margin:0 auto;padding:14mm 12mm;font-family:"Segoe UI",Arial,sans-serif}' +
    '.dpsheet h1{font-size:22px;margin:0 0 2px;color:#1f3a8a}.dpsheet .dpsub{font-size:12px;color:#475569;margin-bottom:8px}' +
    '.dpgrid{display:flex;flex-wrap:wrap;gap:var(--dgap,2mm);align-content:flex-start}' +
    '.dpm{display:inline-flex;height:var(--dh,22mm);align-items:center;justify-content:center}' +
    '.dpm img,.dpm svg{height:var(--dh,22mm);width:auto;display:block;filter:none}' +
    '@media print{body.dprint-on>*:not(#dprintSheet){display:none!important}body.dprint-on #dprintSheet{display:block!important;position:static;overflow:visible;background:#fff;padding:0}#dprintBar{display:none!important}.dpsheet{max-width:none;margin:0;padding:0}@page{size:A4;margin:10mm}}';
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.id = 'dprintBtn';
  btn.type = 'button';
  btn.textContent = '🖨️ Imprimir dinheiro';
  btn.onclick = open;
  document.body.appendChild(btn);

  var bar = document.createElement('div');
  bar.id = 'dprintBar';
  bar.innerHTML =
    '<b>🖨️ Dinheiro para recortar</b>' +
    '<label>Tamanho <input type="range" id="dpmh" min="10" max="45" step="1" value="' + CFG.h + '"><span id="dpmh_v">' + CFG.h + ' mm</span></label>' +
    '<label>Espaço <input type="range" id="dpmg" min="0" max="12" step="0.5" value="' + CFG.gap + '"><span id="dpmg_v">' + CFG.gap + ' mm</span></label>' +
    '<label>Cédulas <input type="range" id="dpqb" min="0" max="30" step="1" value="' + CFG.qb + '"><span id="dpqb_v">' + CFG.qb + '</span></label>' +
    '<label>Moedas <input type="range" id="dpqc" min="0" max="30" step="1" value="' + CFG.qc + '"><span id="dpqc_v">' + CFG.qc + '</span></label>' +
    '<label><input type="checkbox" id="dpfill"' + (CFG.fill ? ' checked' : '') + '> Preencher folha</label>' +
    '<button id="dpprint">Imprimir / PDF</button>' +
    '<button class="sec" id="dpclose">Fechar</button>';
  document.body.appendChild(bar);

  var sheet = document.createElement('div');
  sheet.id = 'dprintSheet';
  document.body.appendChild(sheet);

  function save() { try { localStorage.setItem('dprint_cfg', JSON.stringify(CFG)); } catch (e) {} }
  function moneyItems() {
    var base = [];
    BILLS.forEach(function (v) { for (var i = 0; i < CFG.qb; i++) base.push(v); });
    COINS.forEach(function (v) { for (var i = 0; i < CFG.qc; i++) base.push(v); });
    if (!base.length) return [];
    if (!CFG.fill) return base;
    var pageW = 186, pageH = 235, h = CFG.h, gap = CFG.gap;
    var out = [], rows = 1, x = 0;
    for (var k = 0; k < 400; k++) {
      var v = base[k % base.length];
      var w = v >= 200 ? h * 2.05 : h * 0.62;
      if (x + w + gap > pageW) { rows++; x = 0; }
      if (rows * (h + gap) > pageH) break;
      out.push(v); x += w + gap;
    }
    return out.length ? out : base.slice();
  }
  function itemHTML(v) {
    var bill = v >= 200;
    var h = bill ? CFG.h : Math.max(8, CFG.h * 0.58);
    var html = bill ? window.DR.bill(v) : window.DR.coin(v);
    return '<span class="dpm" style="--dh:' + h + 'mm;--h:' + h + 'mm">' + html + '</span>';
  }
  function build() {
    var items = moneyItems();
    sheet.innerHTML = '<div class="dpsheet"><h1>Dinheiro para recortar</h1><div class="dpsub">Tamanho ' + CFG.h + ' mm · espaço ' + CFG.gap + ' mm · ' + items.length + ' peça(s) · Loja de Matemática</div><div class="dpgrid" style="--dgap:' + CFG.gap + 'mm">' + items.map(itemHTML).join('') + '</div></div>';
  }
  function open() {
    document.body.classList.add('dprint-on');
    build();
    window.scrollTo(0, 0);
  }
  function close() { document.body.classList.remove('dprint-on'); }

  function bind(id, key, min) {
    var el = document.getElementById(id), out = document.getElementById(id + '_v');
    el.oninput = function () {
      CFG[key] = +el.value; if (out) out.textContent = el.value + (key === 'h' || key === 'gap' ? ' mm' : '');
      save(); if (document.body.classList.contains('dprint-on')) build();
    };
  }
  bind('dpmh', 'h'); bind('dpmg', 'gap'); bind('dpqb', 'qb'); bind('dpqc', 'qc');
  document.getElementById('dpfill').onchange = function () { CFG.fill = this.checked; save(); if (document.body.classList.contains('dprint-on')) build(); };
  document.getElementById('dpprint').onclick = function () { build(); window.print(); };
  document.getElementById('dpclose').onclick = close;
})();
