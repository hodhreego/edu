/* Janela de logins dos alunos — idêntica em atalhos.html, painel.html e robiox.html.
   Uso: <button data-logins-trigger>Logins</button> + <script src="logins-widget.js?v=1"></script>
   Se não houver botão com data-logins-trigger, cria um flutuante.
   Para mostrar os botões de bloqueio, defina window.LOGINS_ADMIN = true antes do script. */
(function () {
  if (window.__LOGGINS_WIDGET) return;
  window.__LOGGINS_WIDGET = 1;

  var PASS = '45999699444', OKKEY = 'logins_ok_v1', CKEY = 'logins_dados_v1';
  var END = window.EDU_ENDPOINT || 'https://script.google.com/macros/s/AKfycbyuRU8QZHIANlj_ApgBUaF6CtVT4oJrJEKnmOMhGFQpoHIlNLqYb4Ium4toW2ZF1tmO/exec';
  var ADMIN = !!window.LOGINS_ADMIN;
  var ESCOLAS = { cla: 'Colégio CLA', xus: 'Colégio XUS' };

  var css = `
  .lgw-btn{position:fixed;left:12px;bottom:70px;z-index:2147483550;background:rgba(15,23,42,.94);color:#f8fafc;
    border:1px solid rgba(255,255,255,.28);border-radius:12px;padding:10px 14px;font:800 13px/1 Arial,sans-serif;
    cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.45)}
  .lgw-win{position:fixed;z-index:2147483560;left:50%;top:12%;transform:translateX(-50%);
    width:min(430px,calc(100vw - 24px));background:#111a33;color:#f8fafc;border:1px solid rgba(255,255,255,.22);
    border-radius:18px;padding:16px 18px;box-shadow:0 24px 60px rgba(0,0,0,.6);
    font:600 14px/1.35 Arial,sans-serif}
  .lgw-win[hidden]{display:none}
  .lgw-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;user-select:none;touch-action:none;cursor:move}
  .lgw-head strong{font-size:1.02rem}
  .lgw-x{background:transparent;border:0;color:#94a3b8;font-size:1rem;cursor:pointer;padding:2px 6px}
  .lgw-win label{display:block;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;margin:10px 0 5px}
  .lgw-win input,.lgw-win select{width:100%;background:#0b1120;color:#f8fafc;border:1px solid rgba(255,255,255,.22);
    border-radius:10px;padding:10px;font-size:.95rem;outline:none}
  .lgw-win input:focus,.lgw-win select:focus{border-color:#818cf8;box-shadow:0 0 0 3px #818cf855}
  .lgw-sel{font-size:1.5rem;font-weight:400;line-height:1.2;background:#0b1120;border:1px solid rgba(255,255,255,.22);
    border-radius:10px;padding:9px 12px;margin:0 0 8px;min-height:44px;word-break:break-word}
  .lgw-row{display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap}
  .lgw-row button{background:#6366f1;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-weight:800;cursor:pointer}
  .lgw-err{font-size:.8rem;font-weight:700;color:#f87171}
  .lgw-ok{font-size:.8rem;font-weight:700;color:#34d399}
  .lgw-filtros{display:flex;gap:8px}
  .lgw-filtros>div{flex:1;min-width:0}
  .lgw-ban{margin-top:10px;border-top:1px solid rgba(255,255,255,.18);padding-top:8px}
  .lgw-banbtns{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
  .lgw-banbtns button{background:rgba(239,68,68,.16);border:1px solid rgba(239,68,68,.5);color:#fecaca;
    border-radius:9px;padding:6px 9px;font:800 .78rem Arial,sans-serif;cursor:pointer}
  .lgw-banbtns button.liberar{background:rgba(34,197,94,.16);border-color:rgba(34,197,94,.5);color:#bbf7d0}
  @media print{.lgw-btn,.lgw-win{display:none!important}}
  `;

  function ready(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn, { once: true }); }

  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function parseLogin(l) {
    const m = String(l || '').match(/^(\d{1,3})([a-z]{3})(\d)([a-z])$/i);
    return m ? { escola: m[2].toLowerCase(), turma: m[3] + m[4].toLowerCase() } : { escola: '', turma: '' };
  }
  function nomeEscola(c) { return ESCOLAS[c] || ('Colégio ' + String(c).toUpperCase()); }
  function nomeTurma(t) { return t ? (t.slice(0, -1) + 'º ' + t.slice(-1).toUpperCase()) : ''; }
  function abrevNome(nome) {
    const p = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '';
    return [p[0].charAt(0).toUpperCase() + p[0].slice(1).toLowerCase()]
      .concat(p.slice(1).map(x => x.charAt(0).toUpperCase() + '.')).join(' ');
  }
  function nomeDe(login, nick) {
    const lg = String(login || '').toLowerCase();
    try {
      if (window.RCO_ALUNOS) {
        const m = lg.match(/^(\d{1,3})([a-z]{3})(\d)([a-z])$/);
        if (m) {
          const t = window.RCO_ALUNOS[m[2] + m[3] + m[4]];
          if (t && t[m[1]]) return t[m[1]];
        }
      }
    } catch (e) { }
    if (nick) return nick;
    if (window.RBX_NOMES && window.RBX_NOMES[lg]) return window.RBX_NOMES[lg];
    return '';
  }

  ready(function () {
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    const win = document.createElement('div');
    win.className = 'lgw-win';
    win.hidden = true;
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Logins dos alunos');
    win.innerHTML = `
      <div class="lgw-head"><strong>🔑 Logins dos alunos</strong><button class="lgw-x" type="button" aria-label="Fechar">✕</button></div>
      <div class="lgw-sel">—</div>
      <div class="lgw-lock">
        <label>Senha do professor</label>
        <input class="lgw-pass" type="password" inputmode="numeric" autocomplete="off" placeholder="Digite a senha">
        <div class="lgw-row"><button class="lgw-entrar" type="button">Entrar</button><span class="lgw-err"></span></div>
      </div>
      <div class="lgw-body" hidden>
        <div class="lgw-filtros">
          <div><label>Colégio</label><select class="lgw-es"></select></div>
          <div><label>Turma</label><select class="lgw-tu"></select></div>
        </div>
        <label>Aluno (ordem de chamada)</label>
        <select class="lgw-aluno"></select>
        <div class="lgw-row"><button class="lgw-copiar" type="button">Copiar login</button><span class="lgw-ok lgw-copyok"></span></div>
        <div class="lgw-ban" ${ADMIN ? '' : 'hidden'}>
          <label>Bloquear acesso</label>
          <div class="lgw-banbtns">
            <button type="button" data-min="5">5 min</button>
            <button type="button" data-min="10">10 min</button>
            <button type="button" data-min="15">15 min</button>
            <button type="button" data-min="60">1 h</button>
            <button type="button" data-min="120">2 h</button>
            <button type="button" data-min="1440">1 dia</button>
            <button type="button" data-min="10080">1 semana</button>
            <button type="button" data-min="0" class="liberar">Liberar</button>
          </div>
          <span class="lgw-ok lgw-banok"></span>
        </div>
      </div>`;
    document.body.appendChild(win);

    const q = s => win.querySelector(s);
    const selEl = q('.lgw-sel'), lockEl = q('.lgw-lock'), bodyEl = q('.lgw-body'),
      passEl = q('.lgw-pass'), errEl = q('.lgw-err'), esEl = q('.lgw-es'), tuEl = q('.lgw-tu'),
      alunoEl = q('.lgw-aluno'), copyEl = q('.lgw-copyok'), banEl = q('.lgw-banok');

    let dados = null, carregando = false;
    const filtro = { escola: 'TODOS', turma: 'TODOS' };

    function lista() {
      const out = [], vistos = {};
      (dados && dados.alunos ? dados.alunos : []).forEach(a => {
        const lg = String(a.login || '').toLowerCase();
        if (!lg) return;
        vistos[lg] = 1;
        out.push({ login: lg, num: parseInt(lg, 10) || 999, nome: nomeDe(lg, (a.nick || '').trim()) });
      });
      try {
        if (window.RCO_ALUNOS) {
          for (const k in window.RCO_ALUNOS) {
            const t = window.RCO_ALUNOS[k] || {};
            for (const n in t) {
              const lg = (String(n) + k).toLowerCase();
              if (vistos[lg]) continue;
              vistos[lg] = 1;
              out.push({ login: lg, num: parseInt(n, 10) || 999, nome: t[n] || '' });
            }
          }
        }
      } catch (e) { }
      out.sort((a, b) => a.num - b.num || a.login.localeCompare(b.login));
      return out;
    }

    function montaFiltros(all) {
      const es = {}, tu = {};
      all.forEach(o => { const p = parseLogin(o.login); if (p.escola) es[p.escola] = 1; if (p.turma) tu[p.turma] = 1; });
      const eo = Object.keys(es).sort();
      const to = Object.keys(tu).sort((a, b) => (+a.slice(0, -1) - +b.slice(0, -1)) || a.slice(-1).localeCompare(b.slice(-1)));
      esEl.innerHTML = '<option value="TODOS">Todos os colégios</option>' + eo.map(c => `<option value="${esc(c)}">${esc(nomeEscola(c))}</option>`).join('');
      tuEl.innerHTML = '<option value="TODOS">Todas as turmas</option>' + to.map(t => `<option value="${esc(t)}">${esc(nomeTurma(t))}</option>`).join('');
      esEl.value = eo.indexOf(filtro.escola) >= 0 ? filtro.escola : 'TODOS';
      tuEl.value = to.indexOf(filtro.turma) >= 0 ? filtro.turma : 'TODOS';
    }

    function titulo() {
      const o = alunoEl.options[alunoEl.selectedIndex];
      if (!o) { selEl.textContent = '—'; return; }
      const parts = String(o.textContent || '').split(' — ');
      selEl.textContent = parts[0] + (parts[1] ? ' — ' + parts[1].toUpperCase() : '');
    }

    function preenche() {
      const all = lista();
      const arr = all.filter(o => {
        const p = parseLogin(o.login);
        return (filtro.escola === 'TODOS' || p.escola === filtro.escola) && (filtro.turma === 'TODOS' || p.turma === filtro.turma);
      });
      alunoEl.innerHTML = arr.length
        ? arr.map(o => {
          const rot = o.num + 'º · ' + esc(o.login) + (o.nome ? ' — ' + esc(abrevNome(o.nome)) : '');
          return `<option value="${esc(o.login)}" title="${esc(o.nome || o.login)}">${rot}</option>`;
        }).join('')
        : '<option value="">Sem alunos nesses filtros</option>';
      titulo();
    }

    function mostrarLogado(un) {
      lockEl.hidden = un;
      bodyEl.hidden = !un;
      if (!un) { try { passEl.value = ''; } catch (e) { } }
    }
    function estaLogado() { try { return sessionStorage.getItem(OKKEY) === '1'; } catch (e) { return false; } }

    function carregar() {
      if (dados) { montaFiltros(lista()); preenche(); return; }
      try {
        const c = JSON.parse(sessionStorage.getItem(CKEY) || 'null');
        if (c && Date.now() - c.t < 60000) { dados = c.d; montaFiltros(lista()); preenche(); return; }
      } catch (e) { }
      if (carregando) return;
      carregando = true;
      montaFiltros(lista()); preenche();
      fetch(END + '?acao=rbxdash&k=ludo2026')
        .then(r => r.json())
        .then(j => {
          dados = j;
          try { sessionStorage.setItem(CKEY, JSON.stringify({ t: Date.now(), d: j })); } catch (e) { }
          montaFiltros(lista()); preenche();
        })
        .catch(() => { preenche(); })
        .finally(() => { carregando = false; });
    }

    function abrir() {
      win.hidden = false;
      mostrarLogado(estaLogado());
      carregar();
      if (!estaLogado()) { const p = passEl; setTimeout(() => { try { p.focus(); } catch (e) { } }, 60); }
    }
    function fechar() { win.hidden = true; }

    document.querySelectorAll('[data-logins-trigger]').forEach(b => b.addEventListener('click', abrir));
    if (!document.querySelector('[data-logins-trigger]')) {
      const fb = document.createElement('button');
      fb.type = 'button'; fb.className = 'lgw-btn'; fb.textContent = '🔑 Logins';
      fb.addEventListener('click', abrir);
      document.body.appendChild(fb);
    }

    q('.lgw-x').addEventListener('click', fechar);
    q('.lgw-entrar').addEventListener('click', () => {
      if (passEl.value.trim() === PASS) {
        try { sessionStorage.setItem(OKKEY, '1'); } catch (e) { }
        errEl.textContent = '';
        mostrarLogado(true);
        preenche();
      } else {
        errEl.textContent = 'Senha incorreta';
        passEl.select();
      }
    });
    passEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); q('.lgw-entrar').click(); } });
    alunoEl.addEventListener('change', titulo);
    esEl.addEventListener('change', () => { filtro.escola = esEl.value; preenche(); });
    tuEl.addEventListener('change', () => { filtro.turma = tuEl.value; preenche(); });
    q('.lgw-copiar').addEventListener('click', () => {
      const v = alunoEl.value; if (!v) return;
      try { navigator.clipboard.writeText(v); } catch (e) { }
      copyEl.textContent = 'Copiado: ' + v;
    });

    if (ADMIN) {
      q('.lgw-banbtns').addEventListener('click', e => {
        const b = e.target.closest('[data-min]'); if (!b) return;
        const login = alunoEl.value, min = +b.getAttribute('data-min');
        if (!login) return;
        banEl.textContent = min ? ('Bloqueando ' + login + '…') : ('Liberando ' + login + '…');
        fetch(END, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ acao: 'rbxban', k: 'ludo2026', login: login, min: min })
        }).then(() => {
          banEl.textContent = min ? (login + ' bloqueado') : (login + ' liberado');
        }).catch(() => { banEl.textContent = 'Não consegui enviar.'; });
      });
    }

    /* arrastar pela barra do título */
    const head = q('.lgw-head');
    let drag = false, sx = 0, sy = 0, ox = 0, oy = 0;
    head.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      const r = win.getBoundingClientRect();
      win.style.transform = 'none';
      win.style.left = r.left + 'px'; win.style.top = r.top + 'px';
      drag = true; sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      try { head.setPointerCapture(e.pointerId); } catch (x) { }
      e.preventDefault();
    });
    head.addEventListener('pointermove', e => {
      if (!drag) return;
      const x = Math.min(Math.max(4, ox + e.clientX - sx), window.innerWidth - win.offsetWidth - 4);
      const y = Math.min(Math.max(4, oy + e.clientY - sy), window.innerHeight - win.offsetHeight - 4);
      win.style.left = x + 'px'; win.style.top = y + 'px';
    });
    const fim = () => { drag = false; };
    head.addEventListener('pointerup', fim);
    head.addEventListener('pointercancel', fim);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
  });
})();
