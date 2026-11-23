/* Classificação da turma - app de celular (overlay). API: RANKING.open({host,login,token,endpoint,onClose}), RANKING.close(), RANKING.icone(tam)
   Consome a ação `classificacao` (só a turma do próprio aluno; sem nomes: "Aluno nº N"). */
(function () {
  'use strict';
  var W = window, D = document, ID = 'ranking-ov', cb = null, host = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nf(n) { return (+n).toFixed(1).replace('.', ','); }

  function icone(t) {
    t = t || 64;
    var u = 'rk' + Math.random().toString(36).slice(2, 7);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + t + '" height="' + t + '" viewBox="0 0 100 100" role="img" aria-label="Classificação">' +
      '<defs><linearGradient id="' + u + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a3d"/><stop offset="1" stop-color="#e0245e"/></linearGradient>' +
      '<linearGradient id="' + u + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a8"/><stop offset="1" stop-color="#f5b400"/></linearGradient></defs>' +
      '<rect width="100" height="100" rx="23" fill="url(#' + u + 'g)"/>' +
      '<rect x="14" y="52" width="22" height="30" rx="3" fill="#fff" opacity=".9"/><rect x="39" y="38" width="22" height="44" rx="3" fill="#fff"/><rect x="64" y="60" width="22" height="22" rx="3" fill="#fff" opacity=".8"/>' +
      '<path d="M50 12l4.6 9.3 10.3 1.5-7.4 7.2 1.8 10.2-9.3-4.9-9.2 4.9 1.8-10.2-7.4-7.2 10.3-1.5z" fill="url(#' + u + 's)" stroke="#c98a00" stroke-width="1.2"/>' +
      '<text x="25" y="73" text-anchor="middle" font-size="16" font-weight="800" fill="#e0245e" font-family="Arial">2</text><text x="50" y="73" text-anchor="middle" font-size="18" font-weight="800" fill="#e0245e" font-family="Arial">1</text><text x="75" y="76" text-anchor="middle" font-size="14" font-weight="800" fill="#e0245e" font-family="Arial">3</text></svg>';
  }

  var CSS = '#' + ID + '{position:fixed;z-index:2147483000;display:flex;flex-direction:column;background:#f4f6fb;color:#16213a;font-family:system-ui,Segoe UI,Arial,sans-serif;overflow:hidden;box-sizing:border-box}' +
    '#' + ID + '.full{inset:0}' +
    '#' + ID + ' *{box-sizing:border-box}' +
    '#' + ID + ' .rk-top{background:linear-gradient(135deg,#ff8a3d,#e0245e);color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px}' +
    '#' + ID + ' .rk-top b{font-size:1.1em;flex:1}' +
    '#' + ID + ' .rk-x{border:0;background:rgba(255,255,255,.25);color:#fff;border-radius:10px;width:34px;height:34px;font-size:18px;cursor:pointer}' +
    '#' + ID + ' .rk-sub{padding:10px 14px;font-weight:700;display:flex;justify-content:space-between;gap:8px;background:#fff;border-bottom:1px solid #e2e6f0}' +
    '#' + ID + ' .rk-body{flex:1;overflow:auto;padding:10px 12px 18px}' +
    '#' + ID + ' .rk-li{display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:10px 12px;margin:0 0 7px;box-shadow:0 1px 4px #0001}' +
    '#' + ID + ' .rk-li.eu{background:#fff3e0;border:2px solid #ff8a3d}' +
    '#' + ID + ' .rk-p{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;background:#e8ecf6;flex:none}' +
    '#' + ID + ' .rk-p.m1{background:#ffd54a}#' + ID + ' .rk-p.m2{background:#d7dde6}#' + ID + ' .rk-p.m3{background:#f0b27a}' +
    '#' + ID + ' .rk-n{flex:1;min-width:0}#' + ID + ' .rk-n b{display:block}#' + ID + ' .rk-n small{color:#6b7488}' +
    '#' + ID + ' .rk-m{font-weight:900;font-size:1.15em;color:#0b7a3b}' +
    '#' + ID + ' .rk-vz{text-align:center;padding:30px 14px;color:#6b7488}' +
    '#' + ID + ' .rk-btn{border:0;background:#e0245e;color:#fff;font-weight:800;border-radius:10px;padding:9px 16px;margin-top:10px;cursor:pointer}';

  function getSess() { try { return JSON.parse(localStorage.getItem('edu_sess') || 'null'); } catch (e) { return null; } }
  function fv(x) { return typeof x === 'function' ? x() : x; }
  function creds(o) {
    var s = getSess() || {};
    return { ep: o.endpoint || W.EDU_ENDPOINT || '', login: o.login || fv(W.EDU_LOGIN) || s.login || '', t: o.token || fv(W.EDU_TOKEN) || s.t || '' };
  }
  function api(c, acao) {
    var url = c.ep + (c.ep.indexOf('?') < 0 ? '?' : '&') + 'acao=' + encodeURIComponent(acao) + '&login=' + encodeURIComponent(c.login) + '&t=' + encodeURIComponent(c.t);
    return fetch(url).then(function (r) { return r.json(); });
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
    W.removeEventListener('resize', encaixa);
    if (cb) { var f = cb; cb = null; try { f(); } catch (e) {} }
  }
  function encaixa() {
    var ov = D.getElementById(ID); if (!ov) return;
    if (host && host.getBoundingClientRect) {
      var r = host.getBoundingClientRect(), bw = parseFloat(getComputedStyle(host).borderLeftWidth) || 0, S = ov.style;
      ov.classList.remove('full');
      S.setProperty('left', (r.left + bw) + 'px', 'important'); S.setProperty('top', (r.top + bw) + 'px', 'important');
      S.setProperty('width', (r.width - 2 * bw) + 'px', 'important'); S.setProperty('height', (r.height - 2 * bw) + 'px', 'important');
      S.setProperty('right', 'auto', 'important'); S.setProperty('bottom', 'auto', 'important');
      S.fontSize = Math.max(11, Math.min(17, r.width / 24)) + 'px'; S.borderRadius = getComputedStyle(host).borderRadius || '0';
    } else { ov.classList.add('full'); }
  }

  function render(body, sub, d) {
    var L = d.lista || [];
    sub.innerHTML = '<span>Turma ' + esc(String(d.turma || '').toUpperCase()) + '</span><span>' + (d.minha ? 'Você: ' + d.minha + 'º de ' + d.total : d.total + ' aluno(s)') + '</span>';
    if (!L.length) { body.innerHTML = '<div class="rk-vz"><p>Ninguém da sua turma fez atividades ainda. Seja o primeiro!</p></div>'; return; }
    body.innerHTML = L.map(function (x) {
      return '<div class="rk-li' + (x.eu ? ' eu' : '') + '"><div class="rk-p' + (x.pos <= 3 ? ' m' + x.pos : '') + '">' + (x.pos <= 3 ? ['🥇', '🥈', '🥉'][x.pos - 1] : x.pos) + '</div>' +
        '<div class="rk-n"><b>' + esc(x.nome) + (x.eu ? ' (você)' : '') + '</b><small>' + x.n + ' atividade(s) · ' + x.conc + ' concluída(s)</small></div>' +
        '<div class="rk-m">' + (x.media == null ? '–' : nf(x.media)) + '</div></div>';
    }).join('') + '<div class="rk-vz" style="padding:8px">A nota é a média de acertos nas atividades (0 a 10).</div>';
  }

  function open(opts) {
    opts = opts || {};
    close(); host = opts.host || null; cb = opts.onClose || null;
    if (!D.getElementById(ID + '-css')) { var st = D.createElement('style'); st.id = ID + '-css'; st.textContent = CSS; D.head.appendChild(st); }
    var ov = D.createElement('div'); ov.id = ID; ov.className = 'full'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Classificação da turma');
    ov.innerHTML = '<div class="rk-top">' + icone(34) + '<b>Classificação da turma</b><button class="rk-x" aria-label="Fechar">✕</button></div><div class="rk-sub" id="rk-sub"></div><div class="rk-body" id="rk-body"></div>';
    ((host && host.parentNode) || D.body).appendChild(ov); encaixa(); W.addEventListener('resize', encaixa);
    ov.querySelector('.rk-x').onclick = close;
    var body = ov.querySelector('#rk-body'), sub = ov.querySelector('#rk-sub'), c;
    function pedeLogin(msg) {
      sub.innerHTML = '';
      loginDentro(body, { opts: opts, titulo: 'Entre para ver a classificação', cor: '#e0245e' }, msg, carregar);
    }
    function carregar() {
      c = creds(opts);
      body.innerHTML = '<div class="rk-vz"><p>Carregando…</p></div>';
      if (!c.ep || !c.login || !c.t) { pedeLogin(msgLogin(getSess())); return; }
      api(c, 'classificacao').then(function (d) {
        if (precisaLogin(c, d)) { pedeLogin(msgLogin(getSess())); return; }
        if (!d || !d.ok) { body.innerHTML = '<div class="rk-vz"><p>' + esc((d && d.erro) || 'Não foi possível carregar a classificação.') + '</p><button class="rk-btn">Tentar de novo</button></div>'; body.querySelector('button').onclick = carregar; return; }
        render(body, sub, d);
      }).catch(function () {
        body.innerHTML = '<div class="rk-vz"><p>Sem conexão no momento.</p><button class="rk-btn">Tentar de novo</button></div>'; body.querySelector('button').onclick = carregar;
      });
    }
    carregar();
    return ov;
  }
  W.RANKING = { open: open, close: close, icone: icone };
})();
