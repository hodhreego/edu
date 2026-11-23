/* Meu Boletim - app de celular (overlay). API: BOLETIM.open(opts), BOLETIM.close(), BOLETIM.icone(tam)
   opts: {endpoint, login, token, container, onClose}. Consome acoes `boletim` e `extrato` da API v2. */
(function () {
  'use strict';
  var W = window, D = document, ID = 'boletim-ov';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nf(n, d) { return (+n).toFixed(d == null ? 1 : d).replace('.', ','); }
  function cor(nota) { return nota >= 8 ? 'az' : nota >= 6 ? 'vd' : 'vm'; }

  function icone(t) {
    t = t || 64;
    var u = 'bl' + Math.random().toString(36).slice(2, 7);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + t + '" height="' + t + '" viewBox="0 0 100 100" role="img" aria-label="Meu Boletim">' +
      '<defs><linearGradient id="' + u + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10d9a0"/><stop offset=".55" stop-color="#0aa5b8"/><stop offset="1" stop-color="#2563eb"/></linearGradient>' +
      '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset="1" stop-color="#f5b400"/></linearGradient>' +
      '<linearGradient id="' + u + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d6f5ef"/></linearGradient>' +
      '<radialGradient id="' + u + 'h" cx=".3" cy=".1" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="100" height="100" rx="23" fill="url(#' + u + 'g)"/><rect width="100" height="100" rx="23" fill="url(#' + u + 'h)"/>' +
      '<rect x="22" y="17" width="56" height="68" rx="7" fill="#0b3b5c" opacity=".25" transform="translate(2 3)"/>' +
      '<rect x="22" y="17" width="56" height="68" rx="7" fill="url(#' + u + 'b)"/>' +
      '<rect x="22" y="17" width="9" height="68" rx="5" fill="#0d7f8f"/>' +
      '<g fill="#0d7f8f" opacity=".9"><circle cx="26.5" cy="28" r="2"/><circle cx="26.5" cy="41" r="2"/><circle cx="26.5" cy="54" r="2"/><circle cx="26.5" cy="67" r="2"/></g>' +
      '<rect x="38" y="58" width="9" height="19" rx="2.5" fill="#10b981"/><rect x="51" y="49" width="9" height="28" rx="2.5" fill="#0ea5c6"/><rect x="64" y="38" width="9" height="39" rx="2.5" fill="#2563eb"/>' +
      '<path d="M69 13l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2z" fill="url(#' + u + 's)" stroke="#d99a00" stroke-width="1" stroke-linejoin="round"/>' +
      '</svg>';
  }

  var CSS = '#' + ID + '{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(8,20,36,.6);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#10243a}' +
    '#' + ID + ' *{box-sizing:border-box}' +
    '#' + ID + ' .bl-app{width:100%;height:100%;max-width:460px;max-height:100%;background:#f1f6f9;display:flex;flex-direction:column;overflow:hidden}' +
    '@media(min-width:600px){#' + ID + ' .bl-app{height:min(860px,96vh);border-radius:28px;box-shadow:0 20px 60px rgba(0,0,0,.45)}}' +
    '#' + ID + ' .bl-top{background:linear-gradient(135deg,#0fbf92,#0a8fb0 55%,#2563eb);color:#fff;padding:14px 16px 18px;position:relative}' +
    '#' + ID + ' .bl-bar{display:flex;align-items:center;gap:10px}' +
    '#' + ID + ' .bl-bar b{font-size:18px;flex:1}' +
    '#' + ID + ' .bl-x{border:0;background:rgba(255,255,255,.22);color:#fff;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer}' +
    '#' + ID + ' .bl-hero{display:flex;gap:12px;margin-top:14px}' +
    '#' + ID + ' .bl-card{flex:1;background:rgba(255,255,255,.18);border-radius:16px;padding:12px;text-align:center}' +
    '#' + ID + ' .bl-card small{display:block;font-size:12px;opacity:.9}' +
    '#' + ID + ' .bl-card strong{font-size:32px;line-height:1.1;display:block;margin-top:2px}' +
    '#' + ID + ' .bl-body{flex:1;overflow:auto;padding:14px 14px 24px;-webkit-overflow-scrolling:touch}' +
    '#' + ID + ' h3{margin:16px 2px 8px;font-size:14px;color:#3b5368;text-transform:uppercase;letter-spacing:.04em}' +
    '#' + ID + ' .bl-d{background:#fff;border-radius:16px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(16,36,58,.08)}' +
    '#' + ID + ' .bl-dh{display:flex;justify-content:space-between;align-items:center;gap:8px;font-weight:700}' +
    '#' + ID + ' .bl-n{font-size:20px;font-weight:800}' +
    '#' + ID + ' .bl-tabs{display:flex;gap:6px;margin:10px 0}' +
    '#' + ID + ' .bl-tabs button{flex:1;border:1px solid #cdd9e2;background:#f4f8fa;border-radius:10px;padding:7px 0;font-size:13px;cursor:pointer;color:#3b5368}' +
    '#' + ID + ' .bl-tabs button.on{background:#0a8fb0;border-color:#0a8fb0;color:#fff;font-weight:700}' +
    '#' + ID + ' .bl-track{height:14px;background:#e3ecf1;border-radius:8px;overflow:hidden}' +
    '#' + ID + ' .bl-fill{height:100%;border-radius:8px;transition:width .5s}' +
    '#' + ID + ' .az{color:#1d4ed8}#' + ID + ' .vd{color:#6a9a0b}#' + ID + ' .vm{color:#d42b2b}' +
    '#' + ID + ' .bg-az{background:#2563eb}#' + ID + ' .bg-vd{background:#a3c61a}#' + ID + ' .bg-vm{background:#e24a4a}' +
    '#' + ID + ' .bl-meta{font-size:12px;color:#5d7487;margin-top:6px}' +
    '#' + ID + ' .bl-li{display:flex;justify-content:space-between;gap:10px;align-items:center;background:#fff;border-radius:12px;padding:10px 12px;margin-bottom:7px;font-size:14px}' +
    '#' + ID + ' .bl-li span{min-width:0;overflow-wrap:anywhere}#' + ID + ' .bl-li em{display:block;font-style:normal;font-size:12px;color:#6b8092}' +
    '#' + ID + ' .bl-li b{white-space:nowrap}' +
    '#' + ID + ' .bl-vz{text-align:center;padding:34px 14px;color:#3b5368}#' + ID + ' .bl-vz p{margin:10px 0 0;line-height:1.45}' +
    '#' + ID + ' .bl-btn{margin-top:14px;border:0;background:#0a8fb0;color:#fff;border-radius:12px;padding:10px 18px;font-size:15px;cursor:pointer}' +
    '#' + ID + ' .bl-sw{display:flex;gap:6px;margin:0 0 8px}#' + ID + ' .bl-sw button{flex:1;border:1px solid #cdd9e2;background:#fff;border-radius:12px;padding:9px 0;font-size:14px;cursor:pointer;color:#3b5368;font-weight:600}#' + ID + ' .bl-sw button.on{background:#0a8fb0;border-color:#0a8fb0;color:#fff}' +
    '#' + ID + ' .bl-dica{background:#fff8dc;border-radius:12px;padding:10px 12px;margin:8px 0;font-size:13px;color:#6b5400}' +
    '#' + ID + ' .bl-re{display:inline-block;margin-top:6px;border-radius:10px;background:#0a8fb0;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:6px 12px}' +
    '#' + ID + ' .bl-cn{background:#fff;border-radius:14px;padding:11px 13px;margin-bottom:9px;box-shadow:0 1px 4px rgba(16,36,58,.08)}#' + ID + ' .bl-cn .t{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}#' + ID + ' .bl-cn .t span{min-width:0;overflow-wrap:anywhere;font-weight:700}#' + ID + ' .bl-cn .t b{font-size:22px;font-weight:800;white-space:nowrap}';


  function fv(x) { return typeof x === 'function' ? x() : x; }
  function getSess() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem('edu_sess') || 'null'); } catch (e) {}
    return s;
  }
  function creds(o) {
    var s = getSess() || {};
    return {
      ep: o.endpoint || W.EDU_ENDPOINT || '',
      login: o.login || fv(W.EDU_LOGIN) || s.login || '',
      t: o.token || fv(W.EDU_TOKEN) || s.t || ''
    };
  }
  function api(c, acao, extra) {
    var q = 'acao=' + encodeURIComponent(acao) + '&login=' + encodeURIComponent(c.login) + '&t=' + encodeURIComponent(c.t);
    for (var k in (extra || {})) q += '&' + k + '=' + encodeURIComponent(extra[k]);
    var url = c.ep + (c.ep.indexOf('?') < 0 ? '?' : '&') + q;
    return fetch(url).then(function (r) { return r.json(); });
  }

  function dataBr(ts) {
    var d = new Date(ts); if (isNaN(d)) return '';
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
  }

  function render(body, top, b, ext, tab, moe) {
    var g = b.geral || {}, pd = b.porDisc || {}, discs = Object.keys(pd);
    var ultimas = b.ultimas || [];
    if (!ultimas.length && ext && ext.linhas) {
      ultimas = ext.linhas.filter(function (l) { return l && (l.atividade || l.tipo === 'resultado'); });
    }
    var temDados = discs.length > 0 || (+g.n > 0);
    var nota = g.media != null ? g.media / 10 : null;
    var pc = g.pctConc != null ? g.pctConc : null;
    top.querySelector('.bl-hero').innerHTML =
      '<div class="bl-card"><small>Média geral</small><strong>' + (nota == null || !temDados ? '–' : nf(nota)) + '</strong></div>' +
      '<div class="bl-card"><small>Atividades concluídas</small><strong>' + (!temDados ? '–' : (pc != null ? Math.round(pc) + '%' : (g.n || 0))) + '</strong></div>' +
      (moe && moe.ok ? '<div class="bl-card"><small>🪙 Moedas</small><strong>' + Math.max(0, Math.floor(+moe.saldo || 0)) + '</strong></div>' : '');

    var cont = (b.conteudos || []).filter(function (x) { return x && (x.cod || x.atividade); });
    if (!temDados && !cont.length) {
      body.innerHTML = '<div class="bl-vz">' + icone(84) + '<p><b>Seu boletim ainda está vazio.</b><br>Faça atividades da plataforma e suas notas aparecem aqui automaticamente.</p></div>';
      return;
    }
    var vista = tab._v === 'cont' ? 'cont' : 'bol';
    var sw = '<div class="bl-sw"><button data-v="bol" class="' + (vista === 'bol' ? 'on' : '') + '">Boletim</button><button data-v="cont" class="' + (vista === 'cont' ? 'on' : '') + '">Meus conteúdos</button></div>';
    function bindSw() {
      Array.prototype.forEach.call(body.querySelectorAll('.bl-sw button'), function (bt) {
        bt.addEventListener('click', function () { tab._v = bt.getAttribute('data-v'); render(body, top, b, ext, tab, moe); });
      });
    }
    if (vista === 'cont') {
      var hc = sw + '<div class="bl-dica">💡 Refaça as atividades para melhorar sua nota e ganhar mais moedas.</div>';
      if (!cont.length) hc += '<div class="bl-vz"><p>Você ainda não fez nenhuma atividade.</p></div>';
      cont.slice().sort(function (a, z) { return (+z.ts || 0) - (+a.ts || 0); }).forEach(function (x) {
        var nm = x.melhor != null && x.melhor !== '' ? +x.melhor : null;
        var t = +x.tent || 0;
        hc += '<div class="bl-cn"><div class="t"><span>' + esc(x.atividade || x.cod) + '</span><b class="' + (nm == null || isNaN(nm) ? '' : cor(nm)) + '">' + (nm == null || isNaN(nm) ? '–' : nf(nm)) + '</b></div>' +
          '<div class="bl-meta">' + esc(x.disc || '') + (x.tri ? ' · ' + esc(x.tri) + 'º tri' : '') + ' · ' + t + ' tentativa' + (t === 1 ? '' : 's') + (x.concluido ? ' · concluída' : '') + (x.ts ? ' · ' + dataBr(x.ts) : '') + '</div>' +
          (x.cod ? '<a class="bl-re" href="index.html?cod=' + encodeURIComponent(x.cod) + '">Tentar de novo</a>' : '') + '</div>';
      });
      body.innerHTML = hc;
      bindSw();
      return;
    }
    if (!temDados) { tab._v = 'cont'; render(body, top, b, ext, tab, moe); return; }
    var h = '<h3>Por disciplina</h3>';
    discs.forEach(function (d, i) {
      var t = tab[d] || (tab[d] = firstTri(pd[d]));
      var x = pd[d][t] || {};
      var has = x.n > 0, nt = has ? x.media / 10 : 0, c = cor(nt);
      h += '<div class="bl-d" data-d="' + i + '"><div class="bl-dh"><span>' + esc(d) + '</span><span class="bl-n ' + (has ? c : '') + '">' + (has ? nf(nt) : '–') + '</span></div>' +
        '<div class="bl-tabs">' + [1, 2, 3].map(function (k) { return '<button data-t="' + k + '" class="' + (k == t ? 'on' : '') + '">' + k + 'º tri</button>'; }).join('') + '</div>' +
        '<div class="bl-track"><div class="bl-fill bg-' + c + '" style="width:' + (has ? Math.max(3, Math.min(100, x.media)) : 0) + '%"></div></div>' +
        '<div class="bl-meta">' + (has ? x.n + ' atividade' + (x.n == 1 ? '' : 's') + ' feita' + (x.n == 1 ? '' : 's') + (x.conc != null ? ' · ' + x.conc + ' concluída' + (x.conc == 1 ? '' : 's') : '') : 'Sem atividades neste trimestre') + '</div></div>';
    });
    if (ultimas.length) {
      h += '<h3>Últimas atividades</h3>';
      ultimas.slice(0, 12).forEach(function (u) {
        var p = u.pct != null ? u.pct / 10 : null;
        h += '<div class="bl-li"><span>' + esc(u.atividade || u.cod || 'Atividade') + '<em>' + esc(u.disc || '') + (u.ts ? ' · ' + dataBr(u.ts) : '') + (u.concluido ? ' · concluída' : '') + '</em></span><b class="' + (p == null ? '' : cor(p)) + '">' + (p == null ? '' : nf(p)) + '</b></div>';
      });
    }
    body.innerHTML = sw + h;
    bindSw();
    Array.prototype.forEach.call(body.querySelectorAll('.bl-d'), function (card) {
      card.querySelector('.bl-tabs').addEventListener('click', function (e) {
        var bt = e.target.closest('button'); if (!bt) return;
        tab[discs[+card.getAttribute('data-d')]] = +bt.getAttribute('data-t');
        render(body, top, b, ext, tab, moe);
      });
    });
  }
  function firstTri(o) {
    for (var k = 3; k >= 1; k--) if (o[k] && o[k].n > 0) return k;
    return 1;
  }

  /* login dentro do app: carrega edu-login-ui.js sob demanda */
  function precisaLogin(c, j) { return !c.ep || !c.login || !c.t || (j && (j.relogin || /Sess.{1,2}o inv.{1,2}lida/i.test(j.erro || ''))); }
  function loginDentro(body, o, msg, depois) {
    function go() {
      W.EDU_LOGIN_UI.mostrar(body, { titulo: o.titulo, erro: msg, cor: o.cor, onOk: function () { o.opts.login = ''; o.opts.token = ''; depois(); } });
    }
    if (W.EDU_LOGIN_UI) return go();
    var s = D.createElement('script'); s.src = 'edu-login-ui.js?v=1'; s.onload = go;
    s.onerror = function () { body.innerHTML = '<p style="text-align:center;padding:30px 14px">Não foi possível abrir o login. Verifique a internet.</p>'; };
    D.head.appendChild(s);
  }
  function msgLogin(s) {
    if (s && (s.mestre || s.local || (s.login && !s.t))) return 'Esta sessão é de teste/professor e não vale aqui. Entre com um login de aluno (ex.: 12cla6b).';
    return 'Sua sessão expirou ou foi aberta em outro aparelho. Entre de novo.';
  }

  function close() {
    var el = D.getElementById(ID); if (el) el.remove();
    if (close._cb) { var f = close._cb; close._cb = null; try { f(); } catch (e) {} }
  }

  function open(opts) {
    opts = opts || {};
    close();
    if (!D.getElementById(ID + '-css')) {
      var st = D.createElement('style'); st.id = ID + '-css'; st.textContent = CSS; D.head.appendChild(st);
    }
    close._cb = opts.onClose || null;
    var ov = D.createElement('div'); ov.id = ID;
    ov.innerHTML = '<div class="bl-app" role="dialog" aria-label="Meu Boletim"><div class="bl-top"><div class="bl-bar">' + icone(34) + '<b>Meu Boletim</b><button class="bl-x" aria-label="Fechar">✕</button></div><div class="bl-hero"></div></div><div class="bl-body"><div class="bl-vz"><p>Carregando…</p></div></div></div>';
    (opts.container || D.body).appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.bl-x').onclick = close;
    var body = ov.querySelector('.bl-body'), top = ov.querySelector('.bl-top');
    var c;
    function pedeLogin(msg) {
      top.querySelector('.bl-hero').innerHTML = '';
      loginDentro(body, { opts: opts, titulo: 'Entre para ver seu boletim', cor: '#0a8fb0' }, msg, carregar);
    }
    function carregar() {
      c = creds(opts);
      body.innerHTML = '<div class="bl-vz"><p>Carregando…</p></div>';
      var s0 = getSess();
      if (!c.ep || !c.login || !c.t) { pedeLogin(msgLogin(s0)); return; }
      Promise.all([api(c, 'boletim'), api(c, 'extrato').catch(function () { return null; }), api(c, 'moedas').catch(function () { return null; })]).then(function (r) {
        var b = r[0], ext = r[1], moe = r[2];
        if (precisaLogin(c, b)) { pedeLogin(msgLogin(getSess())); return; }
        if (!b || !b.ok) { body.innerHTML = '<div class="bl-vz"><p>' + esc((b && b.erro) || 'Não foi possível carregar o boletim.') + '</p><button class="bl-btn">Tentar de novo</button></div>'; body.querySelector('button').onclick = carregar; return; }
        render(body, top, b, ext, {}, moe);
      }).catch(function () {
        body.innerHTML = '<div class="bl-vz"><p>Sem conexão no momento. Verifique a internet e tente de novo.</p><button class="bl-btn">Tentar de novo</button></div>';
        body.querySelector('button').onclick = carregar;
      });
    }
    carregar();
    return ov;
  }

  W.BOLETIM = { open: open, close: close, icone: icone };
})();
