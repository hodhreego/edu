/* RobIox — kit compartilhado dos jogos de quiz/obby (Duelos de Quiz, Obby Trivia, Torre de Matemática, Obby de Matemática).
   window.RBX_QZKIT = { painel(wrap,opts), sala(opts), lobby(wrap,opts), obby(wrap,opts), avatar2d(ctx,...), btnFechar(wrap,fn), ano(api), nick() }
   Requer robiox-quiz-banco.js (RBX_QZ). Modo ao vivo usa a ação já existente 'rbxlive' do servidor (EDU_ENDPOINT). */
(function () {
  'use strict';
  var K = {};

  /* ---------------- CSS ---------------- */
  function css() {
    if (document.getElementById('rbxqz-css')) return;
    var s = document.createElement('style'); s.id = 'rbxqz-css';
    s.textContent =
      '.qzw{position:fixed;inset:0;z-index:2147483590;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:none;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#fff;background:#0b1026}' +
      '.qzw canvas.qzc{position:absolute;inset:0;width:100%;height:100%;display:block}' +
      '.qzx{position:absolute;top:10px;right:10px;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.35);color:#fff;font:bold 22px system-ui;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:60}' +
      '.qzp{position:absolute;left:50%;bottom:60px;transform:translate(-50%,calc(100% + 90px));visibility:hidden;width:min(760px,calc(100% - 16px));background:linear-gradient(160deg,rgba(17,24,58,.96),rgba(33,20,70,.96));border:2px solid rgba(255,255,255,.18);border-radius:18px;padding:12px 12px 10px;box-shadow:0 12px 40px rgba(0,0,0,.5);transition:transform .25s ease,visibility 0s linear .25s;z-index:20;max-height:calc(100% - 120px);overflow:auto}' +
      '.qzp.on{transform:translate(-50%,0);visibility:visible;transition:transform .25s ease}' +
      '.qzp .qt{display:flex;align-items:center;gap:8px;font:800 12px system-ui;letter-spacing:.06em;text-transform:uppercase;opacity:.85;margin-bottom:6px}' +
      '.qzp .qt b{padding:2px 8px;border-radius:10px;background:var(--qc,#2563eb)}' +
      '.qzp .qq{font:800 clamp(16px,4.2vw,23px)/1.25 system-ui;margin:4px 2px 10px;text-shadow:0 2px 0 rgba(0,0,0,.35)}' +
      '.qzp .qf{display:block;margin:2px auto 10px;height:clamp(70px,16vh,120px);aspect-ratio:3/2;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.5);background:#fff}' +
      '.qzp .qa{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
      '.qzp .qa button{position:relative;min-height:54px;border:0;border-radius:12px;padding:8px 10px 8px 40px;font:800 clamp(14px,3.6vw,18px)/1.15 system-ui;color:#fff;text-align:left;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.35);transition:transform .08s,filter .15s,opacity .2s}' +
      '.qzp .qa button:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.35)}' +
      '.qzp .qa button i{position:absolute;left:8px;top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:7px;background:rgba(0,0,0,.25);font:900 13px/24px system-ui;text-align:center;font-style:normal}' +
      '.qzp .qa button.sel{outline:3px solid #fff;outline-offset:2px}' +
      '.qzp .qa button.ok{background:#16a34a!important;outline:3px solid #bbf7d0}' +
      '.qzp .qa button.no{background:#991b1b!important;opacity:.9}' +
      '.qzp .qa button.dim{opacity:.35}' +
      '.qzp .qb{height:8px;border-radius:6px;background:rgba(255,255,255,.15);overflow:hidden;margin:2px 0 10px}' +
      '.qzp .qb div{height:100%;width:100%;background:linear-gradient(90deg,#22c55e,#facc15,#ef4444);transform-origin:left}' +
      '.qzp .qe{margin-top:9px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.1);font:600 14px/1.35 system-ui;display:none}' +
      '.qzp .qe.on{display:block}' +
      '.qzp .qn{margin-top:9px;width:100%;min-height:46px;border:0;border-radius:12px;background:#facc15;color:#1e1b4b;font:900 17px system-ui;cursor:pointer;display:none}' +
      '.qzp .qn.on{display:block}' +
      '.qzm{position:absolute;left:50%;top:18%;transform:translate(-50%,-50%) scale(.8);opacity:0;pointer-events:none;z-index:25;font:900 clamp(22px,6vw,40px) system-ui;text-align:center;text-shadow:0 3px 0 #000,0 0 18px rgba(0,0,0,.6);transition:opacity .2s,transform .2s;white-space:pre-line;width:90%}' +
      '.qzm.on{opacity:1;transform:translate(-50%,-50%) scale(1)}' +
      '.qzl{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:14px;background:radial-gradient(circle at 50% 20%,#3b2a8a,#0b1026 70%)}' +
      '.qzl .box{width:min(560px,100%);max-height:100%;overflow:auto;background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.18);border-radius:18px;padding:16px}' +
      '.qzl,.qzl .box,.qzl h2,.qzl li{color:#fff}.qzl p{color:#e2e8f0!important}.qzp,.qzp .qq{color:#fff}' +
      '.qzl h2{margin:0 0 4px;font:900 clamp(20px,5vw,28px) system-ui;text-align:center}' +
      '.qzl p{margin:6px 0;text-align:center;font:600 14px/1.35 system-ui;opacity:.9}' +
      '.qzl .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}' +
      '.qzl button{min-height:46px;padding:0 16px;border:0;border-radius:12px;font:900 16px system-ui;color:#fff;background:#2563eb;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.35)}' +
      '.qzl button.g{background:#16a34a}.qzl button.r{background:#b91c1c}.qzl button.y{background:#ca8a04}.qzl button.k{background:#475569}' +
      '.qzl input{width:110px;min-height:44px;border-radius:10px;border:2px solid #94a3b8;background:#0f172a;color:#fff;font:900 20px system-ui;text-align:center;letter-spacing:.2em}' +
      '.qzl ul{list-style:none;padding:0;margin:8px 0;display:grid;gap:5px}' +
      '.qzl li{display:flex;justify-content:space-between;gap:8px;padding:7px 10px;border-radius:10px;background:rgba(255,255,255,.08);font:700 15px system-ui}' +
      '.qzl .cd{font:900 54px system-ui;text-align:center;color:#facc15;text-shadow:0 4px 0 #000}' +
      '.qzl .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:10px 0}' +
      '.qzl .grid button{min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:14px}' +
      '.qzl .grid button span{font-size:24px}' +
      '.qzb{position:absolute;left:8px;top:60px;z-index:15;min-width:150px;max-width:44vw;background:rgba(0,0,0,.45);border-radius:12px;padding:6px 8px;font:700 12px/1.3 system-ui;pointer-events:none}' +
      '.qzb div{display:flex;justify-content:space-between;gap:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.qzb .me{color:#facc15}' +
      '.qzh{position:absolute;left:62px;top:8px;right:62px;z-index:15;display:flex;gap:8px;flex-wrap:wrap;pointer-events:none}' +
      '.qzh span{background:rgba(0,0,0,.5);border-radius:12px;padding:5px 10px;font:900 15px system-ui;text-shadow:0 2px 0 #000}' +
      '.qzt{position:absolute;z-index:16;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.4);color:#fff;font:900 18px system-ui;display:flex;align-items:center;justify-content:center;touch-action:none}' +
      '@media (hover:hover) and (pointer:fine){.qzt.touch{display:none}}' +
      '@media (max-height:560px){.qzp{padding:8px 8px 6px}.qzp .qq{font-size:16px;margin:2px 2px 6px}.qzp .qa button{min-height:40px;font-size:14px}.qzp .qf{height:56px}.qzp .qe{font-size:12px;padding:5px 8px;margin-top:5px}.qzp .qn{min-height:36px;margin-top:5px}.qzp .qb{margin:2px 0 6px}}';
    document.head.appendChild(s);
  }
  K.css = css;

  K.btnFechar = function (wrap, fn) {
    var b = document.createElement('div'); b.className = 'qzx'; b.textContent = '✕'; b.title = 'Sair (Esc)';
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); e.preventDefault(); fn(); });
    wrap.appendChild(b); return b;
  };
  K.wrap = function () { css(); var w = document.createElement('div'); w.className = 'qzw'; document.body.appendChild(w); return w; };
  K.msg = function (wrap) {
    var m = document.createElement('div'); m.className = 'qzm'; wrap.appendChild(m); var t = 0;
    return function (txt, ms) { m.textContent = txt; m.classList.add('on'); clearTimeout(t); t = setTimeout(function () { m.classList.remove('on'); }, ms || 1400); };
  };
  /* ano escolar (6–9) para as contas: ano do jogo atual ou o dígito da turma no login (ex.: 7cla6b → 6º) */
  K.ano = function (api) {
    var a = api && api.ANO; if (a >= 6 && a <= 9) return a;
    var m = String(window.RBX_LOGIN || '').match(/(\d)[a-z]$/i); if (m && +m[1] >= 6 && +m[1] <= 9) return +m[1];
    return 7;
  };
  K.nick = function () {
    var n = ''; try { n = (window.RBX_NICK_ATUAL && window.RBX_NICK_ATUAL()) || ''; } catch (e) {}
    if (n) return String(n).slice(0, 20);
    var m = String(window.RBX_LOGIN || '').match(/^(\d+)/); return m ? 'Aluno nº ' + (+m[1]) : 'Jogador';
  };
  K.beep = function (f, d, ty, v) {
    try { var A = K._ac || (K._ac = new (window.AudioContext || window.webkitAudioContext)()), o = A.createOscillator(), g = A.createGain(); o.frequency.value = f; o.type = ty || 'square'; g.gain.value = v || .04; o.connect(g); g.connect(A.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, A.currentTime + (d || .12)); o.stop(A.currentTime + (d || .12)); } catch (e) {}
  };

  /* ---------------- Painel de perguntas (DOM) ---------------- */
  var CORES = ['#e11d48', '#2563eb', '#ca8a04', '#16a34a'], FORM = ['▲', '◆', '●', '■'];
  K.painel = function (wrap) {
    css();
    var el = document.createElement('div'); el.className = 'qzp';
    el.innerHTML = '<div class="qt"><b></b><span></span></div><div class="qq"></div><img class="qf" alt="bandeira" style="display:none"><div class="qb"><div></div></div><div class="qa"></div><div class="qe"></div><button class="qn">Continuar ▶</button>';
    wrap.appendChild(el);
    var $ = function (s) { return el.querySelector(s); }, cur = null, sel = 0, timer = 0, raf = 0;
    function stopT() { clearTimeout(timer); cancelAnimationFrame(raf); }
    function fim(idx, timeout) {
      if (!cur || cur.done) return; cur.done = true; stopT();
      var c = cur, ok = !timeout && c.alts[idx] === c.q.a, bs = $('.qa').children, i;
      for (i = 0; i < bs.length; i++) { if (c.alts[i] === c.q.a) bs[i].classList.add('ok'); else if (i === idx) bs[i].classList.add('no'); else bs[i].classList.add('dim'); }
      var e = $('.qe'); e.innerHTML = (ok ? '✅ <b>Certo!</b> ' : (timeout ? '⏰ <b>Tempo esgotado!</b> ' : '❌ <b>Não foi dessa vez.</b> ') + 'Resposta: <b>' + esc(c.q.a) + '</b>. ') + esc(c.q.e || '');
      if (!c.o.semExplicacao || !ok) e.classList.add('on');
      K.beep(ok ? 880 : 170, ok ? .15 : .3, ok ? 'triangle' : 'sawtooth', .05);
      var res = { idx: idx, ok: ok, timeout: !!timeout, tempo: (performance.now() - c.t0) / 1000, alt: c.alts[idx] };
      if (c.o.aguardar && !(ok && c.o.aguardar === 'erro')) {
        var n = $('.qn'); n.textContent = c.o.textoContinuar || 'Continuar ▶'; n.classList.add('on');
        var dl = Date.now() + 350; c.cont = function () { if (Date.now() < dl) return; c.cont = null; n.classList.remove('on'); c.cb(res); };
        if (ok && c.o.autoOk) setTimeout(function () { if (c.cont && cur === c) { dl = 0; c.cont(); } }, c.o.autoOk);
      } else c.cb(res);
    }
    function esc(t) { return String(t).replace(/[&<>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; }); }
    $('.qn').addEventListener('pointerdown', function (e) { e.stopPropagation(); if (cur && cur.cont) cur.cont(); });
    el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    function onKey(e) {
      if (!cur || !el.classList.contains('on')) return;
      var k = e.key;
      if (cur.done) { if ((k === 'Enter' || k === ' ') && cur.cont) { e.preventDefault(); cur.cont(); } return; }
      if (k >= '1' && k <= String(cur.alts.length)) { e.preventDefault(); fim(+k - 1); return; }
      var n = cur.alts.length;
      if (k === 'ArrowRight') sel = (sel + 1) % n; else if (k === 'ArrowLeft') sel = (sel + n - 1) % n; else if (k === 'ArrowDown') sel = Math.min(n - 1, sel + 2); else if (k === 'ArrowUp') sel = Math.max(0, sel - 2);
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); fim(sel); return; } else return;
      e.preventDefault(); mark();
    }
    function mark() { var bs = $('.qa').children; for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('sel', i === sel); }
    window.addEventListener('keydown', onKey, true);
    var api = {
      /* o: {q, alts, titulo, cor, tempo(s), aguardar, autoOk(ms), semExplicacao} ; cb({idx,ok,timeout,tempo}) */
      perguntar: function (o, cb) {
        stopT(); cur = { q: o.q, alts: o.alts || RBX_QZ.alts(o.q, 4), cb: cb, o: o, t0: performance.now(), done: false }; sel = 0;
        el.style.setProperty('--qc', o.cor || '#2563eb');
        $('.qt b').textContent = o.titulo || 'Pergunta'; $('.qt span').textContent = o.sub || '';
        $('.qq').textContent = o.q.q;
        var f = $('.qf'); if (o.q.flag && window.RBX_QZ) { f.src = RBX_QZ.flagURL(o.q.flag); f.style.display = 'block'; } else f.style.display = 'none';
        var a = $('.qa'); a.innerHTML = '';
        cur.alts.forEach(function (t, i) { var b = document.createElement('button'); b.style.background = CORES[i % 4]; b.innerHTML = '<i>' + (i + 1) + '</i>'; b.appendChild(document.createTextNode(t)); b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); fim(i); }); a.appendChild(b); });
        $('.qe').classList.remove('on'); $('.qn').classList.remove('on');
        var bar = $('.qb div'), T = o.tempo || 0; $('.qb').style.display = T ? 'block' : 'none';
        if (T) {
          var c = cur, t0 = performance.now();
          (function tick() { var r = 1 - (performance.now() - t0) / (T * 1000); bar.style.transform = 'scaleX(' + Math.max(0, r) + ')'; if (r <= 0) { if (cur === c) fim(-1, true); return; } raf = requestAnimationFrame(tick); })();
        }
        el.classList.add('on');
      },
      esconder: function () { stopT(); el.classList.remove('on'); cur = null; },
      aberto: function () { return el.classList.contains('on'); },
      atual: function () { return cur; },
      responder: function (i) { fim(i); },
      destruir: function () { stopT(); window.removeEventListener('keydown', onKey, true); if (el.parentNode) el.parentNode.removeChild(el); }
    };
    K._ult = api;
    return api;
  };

  /* ---------------- Sala ao vivo (usa a ação 'rbxlive' que já existe no servidor) ----------------
     Campos que o servidor guarda por jogador: n (apelido), p (número), v (número), s (texto até 10), t. Expira após 12 s sem sinal. */
  K.sala = function (o) {
    o = o || {};
    var L = String(window.RBX_LOGIN || ''), EP = window.EDU_ENDPOINT;
    var ok = !!(EP && /^[A-Za-z0-9]{3,12}$/.test(L) && L !== 'mestre');
    var turma = L.replace(/^\d+/, '').toLowerCase() || L.toLowerCase();
    var nome = (o.jogo + '_' + turma + (o.codigo ? '_' + o.codigo : '')).replace(/[^a-z0-9_]/gi, '').slice(0, 20);
    var st = { p: 0, v: 0, s: 'pronto' }, others = {}, off = 0, fails = 0, inflight = false, stopped = false, to = 0, lastOk = 0;
    var S = {
      ativo: ok, nome: nome, login: L, nick: K.nick(), falhou: false,
      agora: function () { return Date.now() + off; },
      set: function (f) { for (var k in f) st[k] = f[k]; },
      eu: function () { return st; },
      outros: function () { var a = [], k; var agora = Date.now() + off; for (k in others) if (!others[k].t || agora - others[k].t <= 12000) a.push({ id: k, n: others[k].n || 'Colega', p: +others[k].p || 0, v: +others[k].v || 0, s: String(others[k].s || ''), t: others[k].t }); return a; },
      agoraJa: function () { if (!inflight && !stopped) { clearTimeout(to); poll(); } },
      parar: function () {
        if (stopped) return; stopped = true; clearTimeout(to); document.removeEventListener('visibilitychange', vis);
        if (ok) try { fetch(url('saiu'), { keepalive: true }).catch(function () {}); } catch (e) {}
      }
    };
    function url(sOverride) {
      return EP + (EP.indexOf('?') < 0 ? '?' : '&') + 'acao=rbxlive&sala=' + encodeURIComponent(nome) + '&login=' + encodeURIComponent(L) +
        '&nick=' + encodeURIComponent(S.nick) + '&pos=' + Math.round(st.p) + '&vidas=' + Math.round(st.v) + '&est=' + encodeURIComponent(sOverride || st.s);
    }
    function sched() { if (!stopped) to = setTimeout(poll, 1500); }
    function poll() {
      if (stopped || !ok) return;
      if (document.hidden) { sched(); return; }
      if (inflight) return; inflight = true;
      var t0 = Date.now(), done = false, ab = window.AbortController ? new AbortController() : null;
      var kill = setTimeout(function () { if (ab) ab.abort(); fin(false); }, 6000);
      function fin(good, d) {
        if (done) return; done = true; clearTimeout(kill); inflight = false;
        if (good && d && d.players) {
          var t1 = Date.now(); off = d.now - (t0 + t1) / 2; others = {};
          for (var k in d.players) if (k !== L && d.players[k].s !== 'saiu') others[k] = d.players[k];
          fails = 0; lastOk = t1; if (o.onUpdate) try { o.onUpdate(S); } catch (e) {}
        } else { fails++; if (fails >= 3 && !S.falhou) { S.falhou = true; if (o.onFalha) try { o.onFalha(S); } catch (e) {} } }
        sched();
      }
      try { fetch(url(), ab ? { signal: ab.signal } : {}).then(function (r) { return r.json(); }).then(function (d) { fin(true, d); }).catch(function () { fin(false); }); } catch (e) { fin(false); }
    }
    function vis() { if (!document.hidden) S.agoraJa(); }
    if (ok) { document.addEventListener('visibilitychange', vis); poll(); }
    return S;
  };

  /* ---------------- Lobby "Jogar com a turma": largada simultânea com contagem regressiva quando ≥ 2 ----------------
     o: {jogo:'qd', titulo, minimo:2, onLargada(info), onSolo(), onSair()} ; info: {sala, inicio(ms servidor), seed, tag} */
  K.lobby = function (wrap, o) {
    css();
    var el = document.createElement('div'); el.className = 'qzl'; wrap.appendChild(el);
    var sala = null, tag = '', fechado = false, codigo = '', tk = 0;
    try { codigo = sessionStorage.getItem('rbxqz_cod') || ''; } catch (e) {}
    el.innerHTML = '<div class="box"><h2>👥 ' + (o.titulo || 'Jogar com a turma') + '</h2>' +
      '<p>Você entra na sala da sua turma. Quando houver <b>2 ou mais</b> colegas, a largada começa sozinha.</p>' +
      '<div class="row"><input class="cod" inputmode="numeric" maxlength="4" placeholder="----" aria-label="Código da sala"><button class="k ent">Usar código</button></div>' +
      '<p style="font-size:12px;opacity:.7">Código de 4 dígitos é opcional (o professor pode passar um para separar grupos).</p>' +
      '<p class="stt">Conectando…</p><div class="cd"></div><ul class="lst"></ul>' +
      '<div class="row"><button class="g solo">🤖 Jogar contra bots</button><button class="r sair">Sair</button></div></div>';
    var $ = function (s) { return el.querySelector(s); };
    $('.cod').value = codigo;
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { $('.cod').addEventListener(t, function (e) { e.stopPropagation(); }); });
    el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    $('.ent').onclick = function () { var c = ($('.cod').value || '').replace(/\D/g, '').slice(0, 4); if (c && c.length !== 4) { $('.stt').textContent = 'O código tem 4 dígitos.'; return; } codigo = c; try { sessionStorage.setItem('rbxqz_cod', c); } catch (e) {} conectar(); };
    $('.solo').onclick = function () { sair(); if (o.onSolo) o.onSolo(); };
    $('.sair').onclick = function () { sair(); if (o.onSair) o.onSair(); };
    function sair() { fechado = true; clearInterval(tk); if (sala) sala.parar(); if (el.parentNode) el.parentNode.removeChild(el); }
    function parseG(s) { if (!s || s.charAt(0) !== 'G') return 0; var t = parseInt(s.slice(1), 36); return isFinite(t) ? t * 1000 : 0; }
    function conectar() {
      if (sala) sala.parar(); tag = '';
      sala = K.sala({ jogo: o.jogo, codigo: codigo, onUpdate: atualiza, onFalha: function () { if (fechado) return; $('.stt').textContent = '⚠️ Servidor indisponível agora. Indo para o modo contra bots…'; setTimeout(function () { if (!fechado) { sair(); if (o.onSolo) o.onSolo(); } }, 1600); } });
      if (!sala.ativo) { $('.stt').textContent = 'O modo ao vivo precisa do login da turma. Jogue contra os bots!'; return; }
      sala.set({ p: 0, v: 1, s: 'pronto' });
      $('.stt').textContent = 'Sala: ' + sala.nome.replace(/_/g, ' · ') + ' — procurando colegas…';
    }
    function atualiza(S) {
      if (fechado) return;
      var now = S.agora(), os = S.outros(), my = S.eu();
      /* menor largada recente anunciada (inclusive a minha) */
      var best = 0, emAndamento = false;
      os.concat([{ s: my.s }]).forEach(function (x) { var t = parseG(x.s); if (!t) return; if (t > now - 3000) { if (!best || t < best) best = t; } else emAndamento = true; });
      var prontos = os.filter(function (x) { return x.s === 'pronto' || parseG(x.s) > now - 3000; });
      if (!best && prontos.length + 1 >= (o.minimo || 2)) {
        var ids = prontos.map(function (x) { return x.id; }).concat([S.login]).sort();
        if (ids[0] === S.login) best = (Math.ceil(now / 1000) + 6) * 1000;
      }
      if (best) { tag = 'G' + Math.round(best / 1000).toString(36); S.set({ s: tag }); }
      var html = '<li class="me"><span>⭐ ' + esc(S.nick) + ' (você)</span><span>' + (tag ? 'pronto' : 'aguardando') + '</span></li>';
      os.forEach(function (x) { var g = parseG(x.s); html += '<li><span>' + esc(x.n) + '</span><span>' + (x.s === 'pronto' ? 'aguardando' : (g && g > now - 3000) ? 'pronto' : (g ? 'jogando' : x.s)) + '</span></li>'; });
      $('.lst').innerHTML = html;
      $('.stt').textContent = tag ? 'Largada sincronizada!' : (emAndamento ? 'Tem uma partida em andamento. A próxima começa quando houver 2 prontos.' : 'Aguardando colegas… (' + (prontos.length + 1) + '/' + (o.minimo || 2) + ')');
      if (best && !tk) tk = setInterval(cont, 100);
    }
    function cont() {
      if (fechado || !sala) return; var t = parseG(tag), r = t - sala.agora();
      $('.cd').textContent = r > 0 ? Math.ceil(r / 1000) : 'VAI!';
      if (r <= 0) { clearInterval(tk); tk = 0; fechado = true; var s = sala; sala = null; if (el.parentNode) el.parentNode.removeChild(el); if (o.onLargada) o.onLargada({ sala: s, inicio: t, seed: Math.round(t / 1000), tag: tag }); }
    }
    function esc(t) { return String(t).replace(/[&<>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]; }); }
    conectar();
    return { fechar: sair };
  };
  /* placar ao vivo (canto da tela) */
  K.placar = function (wrap) {
    var b = document.createElement('div'); b.className = 'qzb'; b.style.display = 'none'; wrap.appendChild(b);
    return {
      mostrar: function (linhas) { if (!linhas || !linhas.length) { b.style.display = 'none'; return; } b.style.display = 'block'; b.innerHTML = linhas.map(function (l) { return '<div' + (l.me ? ' class="me"' : '') + '><span>' + String(l.n).replace(/</g, '&lt;') + '</span><span>' + l.v + '</span></div>'; }).join(''); },
      el: b
    };
  };
  K.hud = function (wrap) { var h = document.createElement('div'); h.className = 'qzh'; wrap.appendChild(h); return function (arr) { h.innerHTML = arr.map(function (t) { return '<span>' + t + '</span>'; }).join(''); }; };

  /* avatar 2D estilo bloco (canvas) */
  K.avatar2d = function (ctx, x, y, s, c, t, alpha) {
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.translate(x, y);
    var sw = Math.sin(t || 0) * s * .12;
    ctx.fillStyle = c.pants || '#334155'; ctx.fillRect(-s * .28, -s * .42 + sw * .2, s * .25, s * .42); ctx.fillRect(s * .03, -s * .42 - sw * .2, s * .25, s * .42);
    ctx.fillStyle = c.shirt || '#2563eb'; ctx.fillRect(-s * .32, -s * .95, s * .64, s * .55);
    ctx.fillStyle = c.skin || '#ffcc99'; ctx.fillRect(-s * .46, -s * .92 + sw * .3, s * .14, s * .45); ctx.fillRect(s * .32, -s * .92 - sw * .3, s * .14, s * .45);
    ctx.fillRect(-s * .25, -s * 1.42, s * .5, s * .48);
    ctx.fillStyle = c.hair || '#3f2a14'; ctx.fillRect(-s * .27, -s * 1.47, s * .54, s * .16);
    ctx.fillStyle = '#111'; ctx.fillRect(-s * .13, -s * 1.25, s * .06, s * .08); ctx.fillRect(s * .07, -s * 1.25, s * .06, s * .08);
    ctx.fillRect(-s * .08, -s * 1.1, s * .16, s * .03);
    ctx.restore();
  };
  K.rr = function (ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  K.BOTS = ['Cometa', 'Faísca', 'Turbo', 'Pixel', 'Quasar', 'Nebulosa', 'Trovão', 'Órbita', 'Radar', 'Ciclone', 'Eco', 'Vulcão', 'Granito', 'Neon'];
  K.botCores = function (i) { var sh = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'], hr = ['#1f2937', '#78350f', '#fde68a', '#7c2d12']; return { skin: ['#f1c27d', '#e0ac69', '#8d5524', '#ffdbac', '#c68642'][i % 5], shirt: sh[i % sh.length], pants: ['#1e3a8a', '#374151', '#14532d', '#4c1d95'][i % 4], hair: hr[i % hr.length] }; };

  /* ---------------- Kit 3D de obby (Three.js r128) ---------------- */
  K.obby = function (wrap, o) {
    o = o || {};
    if (!window.THREE) return null;
    var T = THREE, W = 0, H = 0;
    var cv = document.createElement('canvas'); cv.className = 'qzc'; wrap.insertBefore(cv, wrap.firstChild);
    var ren = new T.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
    var lowEnd = (navigator.hardwareConcurrency || 4) <= 4 || Math.min(screen.width, screen.height) < 500;
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5));
    var sc = new T.Scene(), sky = new T.Color(o.ceu || 0x7cc8ff); sc.background = sky; sc.fog = new T.Fog(sky, 40, 120);
    var cam = new T.PerspectiveCamera(62, 1, .1, 300);
    sc.add(new T.HemisphereLight(0xffffff, 0x445566, .85)); var sun = new T.DirectionalLight(0xffffff, .65); sun.position.set(8, 20, 6); sc.add(sun);
    function resize() { W = wrap.clientWidth || innerWidth; H = wrap.clientHeight || innerHeight; ren.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
    resize(); window.addEventListener('resize', resize);
    var MC = {}; function mat(c) { return MC[c] || (MC[c] = new T.MeshLambertMaterial({ color: c })); }
    var BOX = new T.BoxGeometry(1, 1, 1);
    /* nuvens e ilhas decorativas */
    var deco = new T.Group(); sc.add(deco);
    (function () { var cg = new T.SphereGeometry(1, 7, 5), cm = new T.MeshLambertMaterial({ color: 0xffffff, emissive: 0x444444 }); for (var i = 0; i < 14; i++) { var g = new T.Group(); for (var j = 0; j < 3; j++) { var m = new T.Mesh(cg, cm); m.position.set(j * 1.6 - 1.6, Math.random() * .6, Math.random()); m.scale.setScalar(1.2 + Math.random()); g.add(m); } g.position.set((Math.random() - .5) * 120, 10 + Math.random() * 25, -Math.random() * 200 + 20); deco.add(g); } })();
    /* jogador */
    var C = o.cores || {}, pg = new T.Group();
    function part(w, h, d, c, x, y) { var m = new T.Mesh(BOX, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, 0); pg.add(m); return m; }
    var col = function (s, d) { try { return new T.Color(s || d).getHex(); } catch (e) { return d; } };
    part(.42, .72, .42, col(C.pants, 0x1e3a8a), -.24, .36); part(.42, .72, .42, col(C.pants, 0x1e3a8a), .24, .36);
    var torso = part(1, .85, .55, col(C.shirt, 0x2563eb), 0, 1.15);
    var la = part(.3, .8, .3, col(C.skin, 0xffcc99), -.66, 1.15), ra = part(.3, .8, .3, col(C.skin, 0xffcc99), .66, 1.15);
    part(.7, .7, .7, col(C.skin, 0xffcc99), 0, 1.95); part(.74, .2, .74, col(C.hair, 0x3f2a14), 0, 2.32);
    var eye = part(.1, .1, .05, 0x111111, -.16, 2); eye.position.z = -.36; var eye2 = part(.1, .1, .05, 0x111111, .16, 2); eye2.position.z = -.36;
    sc.add(pg);
    var blob = new T.Mesh(new T.CircleGeometry(.55, 16), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .3, depthWrite: false })); blob.rotation.x = -Math.PI / 2; sc.add(blob);
    var P = { x: 0, y: 1, z: 0, vx: 0, vy: 0, vz: 0, chao: null, yaw: 0, coyote: 0, jb: 0 };
    var plats = [], coins = [], trig = [], ghosts = {}, pausado = false, keys = {}, joy = { x: 0, y: 0 }, jumpQ = false, mortos = false;
    var O = { P: P, scene: sc, cam: cam, plats: plats, onCair: null, onMoeda: null, velocidade: o.velocidade || 7.5 };
    O.plat = function (q) {
      var c = q.cor != null ? q.cor : 0x22c55e, m = new T.Mesh(BOX, mat(c));
      var p = { x: q.x || 0, y: q.y || 0, z: q.z || 0, w: q.w || 4, d: q.d || 4, h: q.h || .8, tipo: q.tipo || 'fixa', amp: q.amp || 0, vel: q.vel || 1, fase: q.fase || 0, eixo: q.eixo || 'x', mesh: m, vivo: true, t: 0 };
      p.x0 = p.x; p.y0 = p.y; p.z0 = p.z;
      m.scale.set(p.w, p.h, p.d); m.position.set(p.x, p.y - p.h / 2, p.z); sc.add(m);
      var ed = new T.Mesh(BOX, mat(0xffffff)); ed.scale.set(1.02, .12, 1.02); ed.position.y = .5; m.add(ed); ed.material = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .28 });
      if (p.tipo === 'gira') { var bar = new T.Mesh(BOX, mat(0xef4444)); bar.scale.set(p.w * .95, .3, .3); bar.position.set(p.x, p.y + .55, p.z); sc.add(bar); p.bar = bar; }
      if (p.tipo === 'some') m.material = new T.MeshLambertMaterial({ color: c, transparent: true, opacity: 1 });
      plats.push(p); return p;
    };
    O.remover = function (p) { sc.remove(p.mesh); if (p.bar) sc.remove(p.bar); var i = plats.indexOf(p); if (i >= 0) plats.splice(i, 1); };
    O.limpar = function () { plats.slice().forEach(O.remover); coins.forEach(function (c) { sc.remove(c.m); }); coins.length = 0; trig.length = 0; };
    var CG = new T.CylinderGeometry(.45, .45, .12, 14), CM = new T.MeshLambertMaterial({ color: 0xfacc15, emissive: 0x664400 });
    O.moeda = function (x, y, z) { var m = new T.Mesh(CG, CM); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); sc.add(m); coins.push({ m: m, x: x, y: y, z: z, ok: false }); };
    O.bandeira = function (x, y, z, cor) {
      var g = new T.Group(), po = new T.Mesh(BOX, mat(0xe5e7eb)); po.scale.set(.15, 3, .15); po.position.y = 1.5; g.add(po);
      var fl = new T.Mesh(BOX, mat(cor || 0xfacc15)); fl.scale.set(1.2, .7, .05); fl.position.set(.65, 2.6, 0); g.add(fl);
      g.position.set(x, y, z); sc.add(g); return g;
    };
    O.gatilho = function (x, z, r, fn, yMin) { var t = { x: x, z: z, r: r, fn: fn, y: yMin == null ? -99 : yMin, on: true }; trig.push(t); return t; };
    O.spawn = function (x, y, z) { P.x = x; P.y = y; P.z = z; P.vx = P.vy = P.vz = 0; P.chao = null; mortos = false; };
    O.pausar = function (b) { pausado = !!b; if (b) { P.vx = P.vz = 0; } };
    O.texto = function (txt, cor) {
      var c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 256; c.height = 64;
      g.font = 'bold 30px system-ui'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,.55)'; K.rr(g, 4, 8, 248, 48, 14); g.fill(); g.fillStyle = cor || '#fff'; g.fillText(String(txt).slice(0, 16), 128, 43);
      var sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true })); sp.scale.set(4.4, 1.1, 1); return sp;
    };
    /* fantasmas dos colegas: lista [{id, nome, x, y, z, i}] */
    O.fantasmas = function (lst) {
      var vistos = {};
      (lst || []).forEach(function (f) {
        var g = ghosts[f.id];
        if (!g) {
          var cc = K.botCores(f.i || 0), gr = new T.Group(), gm = function (c) { return new T.MeshLambertMaterial({ color: c, transparent: true, opacity: .4, depthWrite: false }); };
          var b = new T.Mesh(BOX, gm(cc.shirt)); b.scale.set(1, 1.6, .55); b.position.y = .8; gr.add(b);
          var h = new T.Mesh(BOX, gm(cc.skin)); h.scale.set(.7, .7, .7); h.position.y = 1.95; gr.add(h);
          var lb = O.texto(f.nome, '#fde68a'); lb.position.y = 2.9; gr.add(lb);
          sc.add(gr); g = ghosts[f.id] = { g: gr, x: f.x, y: f.y, z: f.z };
        }
        g.tx = f.x; g.ty = f.y; g.tz = f.z; vistos[f.id] = 1;
      });
      for (var k in ghosts) if (!vistos[k]) { sc.remove(ghosts[k].g); delete ghosts[k]; }
    };
    O.topoEm = function (x, z) { var best = null; plats.forEach(function (p) { if (p.vivo && Math.abs(x - p.x) <= p.w / 2 + .3 && Math.abs(z - p.z) <= p.d / 2 + .3 && (!best || p.y > best.y)) best = p; }); return best ? best.y : null; };

    /* controles: teclado, toque (joystick + pulo), gamepad */
    function kd(e) { var k = e.key; if (k === 'h' || k === 'H') keys.h = true; if (/^(Arrow|w|a|s|d|W|A|S|D| )/.test(k) && k.length <= 10) { keys[k.toLowerCase()] = true; if (k === ' ' || k === 'ArrowUp' || k === 'ArrowDown') e.preventDefault(); if (k === ' ') jumpQ = true; } }
    function ku(e) { keys[e.key.toLowerCase()] = false; if (e.key === ' ') P.hc = 0; }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    var jb = document.createElement('div'); jb.className = 'qzt touch'; jb.style.cssText += 'right:16px;bottom:64px;width:84px;height:84px;font-size:15px'; jb.textContent = 'PULAR'; wrap.appendChild(jb);
    jb.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); P.hc = 0; jumpQ = true; P.jb = 1; });
    jb.addEventListener('pointerup', function () { P.jb = 0; });
    var jbase = document.createElement('div'); jbase.className = 'qzt touch'; jbase.style.cssText += 'left:16px;bottom:64px;width:120px;height:120px;background:rgba(255,255,255,.1)'; var knob = document.createElement('div'); knob.style.cssText = 'width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.55);pointer-events:none'; jbase.appendChild(knob); wrap.appendChild(jbase);
    var jid = null;
    function jmove(e) { if (e.pointerId !== jid) return; var r = jbase.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), m = Math.hypot(dx, dy), R = r.width / 2; if (m > R) { dx *= R / m; dy *= R / m; } joy.x = dx / R; joy.y = dy / R; knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
    jbase.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); jid = e.pointerId; try { jbase.setPointerCapture(jid); } catch (x) {} jmove(e); });
    jbase.addEventListener('pointermove', jmove);
    function jend(e) { if (e.pointerId !== jid) return; jid = null; joy.x = joy.y = 0; knob.style.transform = ''; }
    jbase.addEventListener('pointerup', jend); jbase.addEventListener('pointercancel', jend);
    var gpPrev = false;
    /* câmera: arrastar (mouse esquerdo/direito ou dedo fora do joystick) gira; roda do mouse aproxima; botão "Câmera livre" gira só mexendo o mouse */
    var camYaw = 0, camDist = 9, camH = 5.6, cdrag = null, camLivre = false, cvE = ren.domElement;
    function cl2(v, a, b) { return v < a ? a : v > b ? b : v; }
    wrap.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    wrap.addEventListener('pointerdown', function (e) { if (e.target !== cvE) return; cdrag = { id: e.pointerId, x: e.clientX, y: e.clientY }; if (camLivre && e.pointerType === 'mouse' && document.pointerLockElement !== cvE) try { cvE.requestPointerLock(); } catch (x) {} });
    function cmove(e) {
      if (camLivre && document.pointerLockElement === cvE && e.pointerType === 'mouse') { camYaw -= (e.movementX || 0) * .006; camH = cl2(camH + (e.movementY || 0) * .015, 2, 12); return; }
      if (!cdrag || e.pointerId !== cdrag.id) return; camYaw -= (e.clientX - cdrag.x) * .012; camH = cl2(camH + (e.clientY - cdrag.y) * .025, 2, 12); cdrag.x = e.clientX; cdrag.y = e.clientY;
    }
    function cup(e) { if (cdrag && e.pointerId === cdrag.id) cdrag = null; }
    window.addEventListener('pointermove', cmove); window.addEventListener('pointerup', cup); window.addEventListener('pointercancel', cup);
    wrap.addEventListener('wheel', function (e) { camDist = cl2(camDist + (e.deltaY > 0 ? .8 : -.8), 4, 18); }, { passive: true });
    var camBt = document.createElement('button'); camBt.type = 'button'; camBt.textContent = '🖱️ Câmera livre';
    camBt.style.cssText = 'position:absolute;right:12px;bottom:12px;z-index:6;border:0;border-radius:10px;padding:7px 11px;font:800 13px system-ui,Arial;background:rgba(15,23,42,.72);color:#fff;cursor:pointer';
    camBt.title = 'Ligado: clique na cena e gire a câmera só mexendo o mouse (Esc solta). Desligado: arraste com o mouse para girar. Rodinha: aproximar/afastar.';
    if (!matchMedia('(pointer: coarse)').matches) wrap.appendChild(camBt);
    camBt.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    camBt.addEventListener('click', function (e) { e.stopPropagation(); camLivre = !camLivre; camBt.style.background = camLivre ? '#16a34a' : 'rgba(15,23,42,.72)'; camBt.textContent = camLivre ? '🖱️ Câmera livre: LIGADA (clique na cena)' : '🖱️ Câmera livre'; if (!camLivre && document.pointerLockElement === cvE) try { document.exitPointerLock(); } catch (x) {} });
    O.camReset = function () { camYaw = 0; camDist = 9; camH = 5.6; };

    var t = 0, last = 0, raf = 0, upd = null, vivo = true, anim = 0;
    O.loop = function (fn) { upd = fn; };
    function step(dt) {
      var sp = window.RBX_SPEED || 1, dts = dt * sp; t += dts;
      /* plataformas */
      plats.forEach(function (p) {
        var ox = p.x, oy = p.y, oz = p.z; p.t += dts;
        if (p.tipo === 'move') { if (p.eixo === 'z') p.z = p.z0 + Math.sin(p.t * p.vel + p.fase) * p.amp; else p.x = p.x0 + Math.sin(p.t * p.vel + p.fase) * p.amp; }
        else if (p.tipo === 'sobe') p.y = p.y0 + (Math.sin(p.t * p.vel + p.fase) * .5 + .5) * p.amp;
        else if (p.tipo === 'some') { var cyc = (p.t * p.vel + p.fase) % 4; p.vivo = cyc < 2.8; p.mesh.material.opacity = cyc < 2.2 ? 1 : (cyc < 2.8 ? .45 + .3 * Math.sin(t * 30) : .12); }
        else if (p.tipo === 'gira' && p.bar) { p.bar.rotation.y = p.t * p.vel * 1.6 + p.fase; p.bar.position.set(p.x, p.y + .55, p.z); }
        p.dx = p.x - ox; p.dy = p.y - oy; p.dz = p.z - oz;
        p.mesh.position.set(p.x, p.y - p.h / 2, p.z);
      });
      /* entrada */
      var ix = 0, iz = 0;
      if (!pausado) {
        if (keys.arrowleft || keys.a) ix -= 1; if (keys.arrowright || keys.d) ix += 1; if (keys.arrowup || keys.w) iz -= 1; if (keys.arrowdown || keys.s) iz += 1;
        ix += joy.x; iz += joy.y;
        try { var gp = navigator.getGamepads ? navigator.getGamepads()[0] : null; if (gp) { if (Math.abs(gp.axes[0]) > .2) ix += gp.axes[0]; if (Math.abs(gp.axes[1]) > .2) iz += gp.axes[1]; var pr = gp.buttons[0] && gp.buttons[0].pressed; if (pr && !gpPrev) jumpQ = true; gpPrev = pr; if (gp.buttons[14] && gp.buttons[14].pressed) ix -= 1; if (gp.buttons[15] && gp.buttons[15].pressed) ix += 1; if (gp.buttons[12] && gp.buttons[12].pressed) iz -= 1; if (gp.buttons[13] && gp.buttons[13].pressed) iz += 1; } } catch (e) {}
        var m = Math.hypot(ix, iz); if (m > 1) { ix /= m; iz /= m; }
      } else jumpQ = false;
      if (camYaw) { var cyw = Math.cos(camYaw), syw = Math.sin(camYaw), rx = ix * cyw + iz * syw, rz = -ix * syw + iz * cyw; ix = rx; iz = rz; }
      var v = O.velocidade * sp, ac = P.chao ? 14 : 6;
      P.vx += (ix * v - P.vx) * Math.min(1, ac * dt); P.vz += (iz * v - P.vz) * Math.min(1, ac * dt);
      if (P.chao) P.coyote = .12; else P.coyote -= dt;
      if (P.chao) P.lg = P.chao;
      if (jumpQ && P.coyote > 0) {   /* pulo turbo igual ao obby principal: 3º pulo seguido na mesma plataforma = alto, 6º = mais alto, 7º = bem mais alto */
        if (P.lg !== P.jplat) { P.jn = 0; P.jplat = P.lg; }
        P.jn = ((P.jn || 0) % 7) + 1; var jbm = P.jn === 3 ? Math.SQRT2 : P.jn === 6 ? Math.sqrt(3) : P.jn === 7 ? 2.05 : 1; P.hc = (P.hc || 0) + 1; var hyp = !!keys.h || P.hc % 10 === 0; if (hyp) jbm = Math.sqrt(20);   /* HIPER PULO 20x: 10º pulo sem soltar ou Espaço + H */
        P.vy = 9.6 * jbm; P.coyote = 0; P.chao = null; K.beep(jbm > 1 ? (P.jn === 7 ? 820 : 660) : 520, .07, 'square', .025);
        if (jbm > 1) { try { (O.turboMsg = O.turboMsg || K.msg(wrap))(hyp ? '⚡ HIPER PULO!' : P.jn === 7 ? '🚀 SUPER PULO!' : '🚀 Pulo turbo!', 900); } catch (e) {} }
      }
      jumpQ = false;
      P.vy -= 24 * dt; if (P.vy < -30) P.vy = -30;
      if (P.chao) { P.x += P.chao.dx || 0; P.y += P.chao.dy || 0; P.z += P.chao.dz || 0; }
      var py = P.y; P.x += P.vx * dt; P.z += P.vz * dt; P.y += P.vy * dt;
      /* colisão com o topo das plataformas */
      P.chao = null;
      for (var i = 0; i < plats.length; i++) {
        var p = plats[i]; if (!p.vivo) continue;
        if (Math.abs(P.x - p.x) <= p.w / 2 + .25 && Math.abs(P.z - p.z) <= p.d / 2 + .25) {
          if (P.vy <= 0 && py >= p.y - .35 && P.y <= p.y) { P.y = p.y; P.vy = 0; P.chao = p; }
          else if (P.y < p.y - .1 && P.y > p.y - p.h - 1.8) { /* lateral: empurra para fora */
            var ox2 = (p.w / 2 + .26) - Math.abs(P.x - p.x), oz2 = (p.d / 2 + .26) - Math.abs(P.z - p.z);
            if (ox2 < oz2) P.x += (P.x > p.x ? 1 : -1) * ox2; else P.z += (P.z > p.z ? 1 : -1) * oz2;
          }
          if (p.bar && P.chao === p) { /* barra giratória: empurra */
            var a = p.bar.rotation.y, dx = P.x - p.x, dz = P.z - p.z, ca = Math.cos(a), sa = Math.sin(a), along = dx * ca - dz * sa, perp = dx * sa + dz * ca;
            if (Math.abs(along) < p.w * .48 && Math.abs(perp) < .45 && P.y < p.y + .9) { P.vy = 7; P.vx += (perp >= 0 ? 1 : -1) * sa * 9; P.vz += (perp >= 0 ? 1 : -1) * ca * 9; P.chao = null; K.beep(200, .1, 'sawtooth', .03); }
          }
        }
      }
      /* moedas e gatilhos */
      coins.forEach(function (c) { if (c.ok) return; c.m.rotation.z += dt * 3; if (Math.abs(P.x - c.x) < 1 && Math.abs(P.z - c.z) < 1 && Math.abs(P.y + 1 - c.y) < 1.6) { c.ok = true; sc.remove(c.m); K.beep(1320, .08, 'triangle', .04); if (O.onMoeda) O.onMoeda(); } });
      trig.forEach(function (g) { if (g.on && Math.hypot(P.x - g.x, P.z - g.z) < g.r && P.y > g.y) { g.on = false; g.fn(); } });
      if (P.y < -14 && !mortos) { mortos = true; if (O.onCair) O.onCair(); }
      /* avatar */
      var mv = Math.hypot(P.vx, P.vz); if (mv > .5) P.yaw = Math.atan2(-P.vx, -P.vz); anim += dt * mv * 1.3;
      pg.position.set(P.x, P.y, P.z); pg.rotation.y += ((P.yaw - pg.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 12);
      la.rotation.x = Math.sin(anim) * .7 * Math.min(1, mv / 4); ra.rotation.x = -la.rotation.x;
      var ty = O.topoEm(P.x, P.z); blob.visible = ty != null && ty <= P.y + .05; if (blob.visible) blob.position.set(P.x, ty + .02, P.z);
      /* fantasmas */
      for (var k in ghosts) { var g = ghosts[k]; g.x += (g.tx - g.x) * Math.min(1, dt * 3); g.y += (g.ty - g.y) * Math.min(1, dt * 3); g.z += (g.tz - g.z) * Math.min(1, dt * 3); g.g.position.set(g.x, g.y, g.z); }
      /* câmera atrás e acima */
      var cx = P.x + Math.sin(camYaw) * camDist, cz = P.z + Math.cos(camYaw) * camDist, cy = P.y + camH;
      cam.position.x += (cx - cam.position.x) * Math.min(1, dt * 5); cam.position.y += (cy - cam.position.y) * Math.min(1, dt * 4); cam.position.z += (cz - cam.position.z) * Math.min(1, dt * 5);
      cam.lookAt(P.x - Math.sin(camYaw) * 6, pausado ? P.y - 2.6 : P.y + 1, P.z - Math.cos(camYaw) * 6);
      deco.position.z = cam.position.z * .6;
    }
    function frame(ts) {
      if (!vivo) return; raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(.05, (ts - last) / 1000) : .016; last = ts;
      step(dt); if (upd) upd(dt); ren.render(sc, cam);
    }
    K._ultObby = O;
    raf = requestAnimationFrame(frame);
    O.destruir = function () {
      vivo = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      try { sc.traverse(function (n) { if (n.geometry && n.geometry !== BOX) n.geometry.dispose(); if (n.material && n.material.map) n.material.map.dispose(); }); BOX.dispose(); ren.dispose(); if (ren.forceContextLoss) ren.forceContextLoss(); } catch (e) {}
    };
    return O;
  };

  window.RBX_QZKIT = K;
})();
