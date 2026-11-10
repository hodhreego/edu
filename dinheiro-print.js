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
    '#dprintBtn{position:fixed!important;right:14px!important;bottom:14px!important;left:auto!important;top:auto!important;z-index:2147483000;width:auto!important;max-width:240px!important;display:inline-flex!important;align-items:center;justify-content:center;border:0;border-radius:999px;padding:10px 16px;font:800 14px "Segoe UI",Arial;background:#1f3a8a;color:#fff;cursor:pointer;box-shadow:0 6px 18px #0004}' +
    '#dprintBtn:hover{filter:brightness(1.12)}' +
    '#dprintSheet{display:none;position:fixed;inset:0;z-index:2147483100;background:#eef3fb;overflow:auto;padding:64px 12px 40px}' +
    'body.dprint-on #dprintSheet{display:block}' +
    '#dprintBar{position:fixed;left:0;right:0;top:0;z-index:2147483200;display:none;gap:10px;align-items:center;flex-wrap:wrap;background:#16213a;color:#fff;padding:8px 14px;font:700 13px "Segoe UI",Arial}' +
    'body.dprint-on #dprintBar{display:flex}' +
    '#dprintBar label{display:flex;align-items:center;gap:6px;white-space:nowrap}' +
    '#dprintBar input[type=range]{width:110px}' +
    '#dprintBar button{border:0;border-radius:99px;padding:8px 14px;font:800 13px "Segoe UI",Arial;cursor:pointer;background:#ffd24d;color:#16213a}' +
    '#dprintBar button.sec{background:#fff}' +
    '.dpsheet{background:#fff;color:#111;width:190mm;box-sizing:border-box;margin:0 auto;padding:0;font-family:"Segoe UI",Arial,sans-serif}' +
    '.dpsheet h1{font-size:22px;margin:0 0 2px;color:#1f3a8a}.dpsheet .dpsub{font-size:12px;color:#475569;margin-bottom:8px}' +
    '.dpgrid{display:flex;flex-wrap:wrap;gap:var(--dgap,2mm);align-content:flex-start}' +
    '.dpm{display:inline-flex;height:var(--dh,22mm);align-items:center;justify-content:center;position:relative;overflow:hidden}' +
    '.dpm img,.dpm svg{height:var(--dh,22mm);width:auto;display:block;filter:none}' +
    '.dpm::after{content:"SEM VALOR";position:absolute;right:2.5%;top:50%;width:16%;height:12%;transform:translateY(-50%) rotate(-18deg);display:flex;align-items:center;justify-content:center;font:800 5px Arial;color:#7a0b0b;background:rgba(255,255,255,.38);border:1px solid rgba(122,11,11,.35);opacity:.5;white-space:nowrap;pointer-events:none;box-sizing:border-box}' +
    '.dpm.coin{width:var(--dh,12mm)}.dpm.coin img,.dpm.coin svg{width:100%;height:100%;object-fit:contain}' +
    '.dpm.coin::after{width:30%;height:8%;font-size:4px;right:0}' +
    '@media print{body.dprint-on>*:not(#dprintSheet){display:none!important}body.dprint-on #dprintSheet{display:block!important;position:static;overflow:visible;background:#fff;padding:0}#dprintBar{display:none!important}.dpsheet{max-width:none;margin:0;padding:0}.dpgrid{overflow:hidden}@page{size:A4;margin:10mm}}';
  document.head.appendChild(css);

  function init() {
  var btn = document.createElement('div');
  btn.id = 'dprintBtn';
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  btn.textContent = '🖨️ Imprimir dinheiro';
  btn.onclick = open;
  document.body.appendChild(btn);
  function fixBtn() {
    try {
      btn.style.setProperty('display', 'inline-flex', 'important');
      btn.style.setProperty('width', 'auto', 'important');
      btn.style.setProperty('max-width', '240px', 'important');
      btn.style.setProperty('left', 'auto', 'important');
      btn.style.setProperty('right', '14px', 'important');
      btn.style.setProperty('top', 'auto', 'important');
      btn.style.setProperty('bottom', '14px', 'important');
      btn.style.setProperty('position', 'fixed', 'important');
    } catch (e) { }
  }
  fixBtn(); setTimeout(fixBtn, 900);

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

  build._t = 0;
  window.addEventListener('beforeprint', function () { if (document.body.classList.contains('dprint-on')) build(true); });
  function save() { try { localStorage.setItem('dprint_cfg', JSON.stringify(CFG)); } catch (e) {} }
  function moneyItems() {
    var base = [];
    BILLS.forEach(function (v) { for (var i = 0; i < CFG.qb; i++) base.push(v); });
    COINS.forEach(function (v) { for (var i = 0; i < CFG.qc; i++) base.push(v); });
    if (!base.length) return [];
    if (!CFG.fill) return base;
    var out = [];
    for (var k = 0; k < 700; k++) out.push(base[k % base.length]);
    return out;
  }
  function itemHTML(v) {
    var bill = v >= 200;
    var h = bill ? CFG.h : Math.max(8, CFG.h * 0.58);
    var html = bill ? window.DR.bill(v) : window.DR.coin(v);
    return '<span class="dpm ' + (bill ? 'bill' : 'coin') + '" style="--dh:' + h + 'mm;--h:' + h + 'mm">' + html + '</span>';
  }
  function build(skipWait) {
    var items = moneyItems();
    var all = items.length;
    sheet.innerHTML = '<div class="dpsheet"><h1>Dinheiro para recortar</h1><div class="dpsub">Tamanho ' + CFG.h + ' mm · espaço ' + CFG.gap + ' mm · ' + items.length + ' peça(s) · Loja de Matemática</div><div class="dpgrid" style="--dgap:' + CFG.gap + 'mm">' + items.map(itemHTML).join('') + '</div></div>';
    if (CFG.fill) {
      fitPage();
      if (!skipWait) {
        var ims = [].slice.call(sheet.querySelectorAll('img')), tk = ++build._t;
        Promise.all(ims.map(function (im) { return im.decode ? im.decode().catch(function () {}) : 0; })).then(function () { if (tk === build._t) build(true); });
      }
    }
  }
  function fitPage() {
    /* mede o layout real: tira peças do fim até a folha caber em 1 página A4 (277 mm úteis) */
    var sh = sheet.querySelector('.dpsheet'), g = sheet.querySelector('.dpgrid'), mm = 96 / 25.4, lim = 276 * mm, k;
    var cs = g.children, lo = 0, hi = cs.length;
    function ok(n) { for (var i = cs.length - 1; i >= n; i--) cs[i].style.display = 'none'; var last = cs[Math.max(0, n - 1)]; var r = last.getBoundingClientRect(), t = sh.getBoundingClientRect().top, res = (r.bottom - t) <= lim; for (i = cs.length - 1; i >= n; i--) cs[i].style.display = ''; return res; }
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (ok(mid)) lo = mid; else hi = mid - 1; }
    while (cs.length > Math.max(1, lo)) g.removeChild(g.lastChild);
    var sub = sheet.querySelector('.dpsub'); if (sub) sub.textContent = sub.textContent.replace(/\d+ peça\(s\)/, cs.length + ' peça(s)');
  }
  function open() {
    document.body.classList.add('dprint-on');
    btn.style.setProperty('display', 'none', 'important');
    build();
    window.scrollTo(0, 0);
  }
  function close() { document.body.classList.remove('dprint-on'); fixBtn(); }

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
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
