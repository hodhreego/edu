/* RobIox — Corrida de Torre de Matemática 🧮 : cada conta certa libera degraus (mais rápido = mais degraus, combo = bônus);
   errou, escorrega um degrau. Corrida contra bots + seu fantasma (melhor tempo salvo) ou ao vivo com a turma (largada simultânea).
   Contas geradas por ano (6º–9º) com dificuldade crescente conforme sobe. Requer robiox-quiz-banco.js e robiox-quiz-kit.js. */
(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS.torremat = {
    nome: 'Corrida de Torre de Matemática 🧮', icone: '🧮', destaque: true, servidor: true,
    desc: 'Contas rápidas liberam degraus! Corra contra bots, seu fantasma ou a turma ao vivo.',
    start: function (api) {
      var K = window.RBX_QZKIT, QZ = window.RBX_QZ;
      if (!K || !QZ) { try { api.say('Torre de Matemática: carregando…', 1800); } catch (e) {} if (api.onClose) api.onClose(); return; }
      var wrap = K.wrap(), cv = document.createElement('canvas'); cv.className = 'qzc'; wrap.appendChild(cv);
      var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, fechado = false, raf = 0, last = 0, T = 0;
      function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = wrap.clientWidth || innerWidth; H = wrap.clientHeight || innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      resize(); window.addEventListener('resize', resize);
      var painel = K.painel(wrap), msg = K.msg(wrap), hud = K.hud(wrap), placar = K.placar(wrap);
      K.btnFechar(wrap, fechar);
      function onEsc(e) { if (e.key === 'Escape') fechar(); }
      window.addEventListener('keydown', onEsc);
      var av = api.avatarColors || { skin: '#ffcc99', shirt: '#2563eb', pants: '#1e3a8a', hair: '#3f2a14' };
      var ANO = K.ano(api), TIER = api.tier ? api.tier() : 2, FACIL = api.easy ? api.easy() : false;
      var SEL = (api && api.ANO >= 10) ? api.ANO : ANO, MN = QZ.nomeMateria(SEL), MATH = SEL <= 9;
      var GOAL = 40, LIMITE = 150, modo = 'menu', R = null, lobby = null, menuEl = null, fimEl = null;
      var stars = []; for (var si = 0; si < 70; si++) stars.push({ x: Math.random(), y: Math.random(), s: Math.random() * 1.8 + .4 });
      var clouds = []; for (var ci = 0; ci < 8; ci++) clouds.push({ x: Math.random(), y: Math.random() * 1.6, s: .6 + Math.random() });

      function menu() {
        modo = 'menu'; painel.esconder(); placar.mostrar(null); hud([]);
        menuEl = document.createElement('div'); menuEl.className = 'qzl';
        var h = '<div class="box"><h2>🧮 Corrida de Torre de ' + MN + '</h2><p>' + (MATH ? 'Resolva contas' : 'Acerte perguntas de ' + MN) + ' para subir ' + GOAL + ' degraus antes de todo mundo!<br>⚡ Rápido (até 3 s): +3 degraus · até 6 s: +2 · depois: +1 · 🔥 combo de 3: +1 extra · ❌ erro: escorrega 1.</p><p>' + (MATH ? 'Ano das contas:' : '') + '</p><div class="row">';
        if (MATH) [6, 7, 8, 9].forEach(function (a) { h += '<button data-a="' + a + '" class="' + (a === ANO ? 'y' : 'k') + '">' + a + 'º ano</button>'; });
        h += '</div><div class="row"><button class="g" data-m="b">🤖 Contra bots + fantasma</button><button data-m="l">👥 Jogar com a turma</button></div><p style="font-size:12px;opacity:.75">Teclado: 1–4 ou setas + Enter.</p></div>';
        menuEl.innerHTML = h; wrap.appendChild(menuEl);
        menuEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        menuEl.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.dataset.a) { ANO = +b.dataset.a; [].forEach.call(menuEl.querySelectorAll('[data-a]'), function (x) { x.className = +x.dataset.a === ANO ? 'y' : 'k'; }); return; }
          tiraMenu();
          if (b.dataset.m === 'b') corrida(null);
          else lobby = K.lobby(wrap, { jogo: 'tm' + (MATH ? ANO : SEL), titulo: 'Torre de ' + MN + (MATH ? ' · ' + ANO + 'º ano' : ''), minimo: 2, onSolo: function () { lobby = null; corrida(null); }, onSair: function () { lobby = null; menu(); }, onLargada: function (info) { lobby = null; corrida(info); } });
        });
      }
      function tiraMenu() { if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl); menuEl = null; }
      function ghostKey() { return 'rbx_torremat_ghost_' + (MATH ? ANO : SEL); }

      function corrida(info) {
        modo = 'corrida';
        var ghost = null; try { ghost = JSON.parse(localStorage.getItem(ghostKey()) || 'null'); } catch (e) {}
        R = { live: info, S: info ? info.sala : null, T0: info ? info.inicio : 0, t: 0, inicio: performance.now() + (info ? 0 : 3200), passos: 0, vis: 0, combo: 0, acertos: 0, erros: 0, moedas: 0, fim: false, chegada: 0, marcas: [], runners: [], ghost: ghost, fimEspera: 0, flash: 0, shake: 0 };
        if (!info) {
          var nomes = QZ.shuf(K.BOTS).slice(0, 3);
          nomes.forEach(function (n, i) { R.runners.push({ id: 'b' + i, n: '🤖 ' + n, c: K.botCores(i + 2), passos: 0, vis: 0, ritmo: (.28 + .06 * i + (TIER - 2) * .04 - (FACIL ? .05 : 0)) * (ANO >= 8 ? .9 : 1), prox: 2 + Math.random() * 3, chegada: 0 }); });
          if (ghost && ghost.m && ghost.m.length) R.runners.push({ id: 'g', n: '👻 Seu recorde', c: av, ghost: true, passos: 0, vis: 0, chegada: 0 });
          try { var PS = K.sala({ jogo: 'tm' + ANO }); if (PS.ativo) { PS.set({ p: 0, v: 1, s: 'solo' }); R.passiva = PS; } } catch (e) {}
        } else { R.S.set({ p: 0, v: 1, s: info.tag }); }
        if (!info) msg('3… 2… 1…', 2800);
        setTimeout(function () { if (!fechado && R && !R.fim) { msg('VAI! 🏁', 900); pergunta(); } }, info ? 200 : 3100);
      }
      function relogio() { if (!R) return 0; return R.live ? Math.max(0, (R.S.agora() - R.T0) / 1000) : Math.max(0, (performance.now() - R.inicio) / 1000); }
      function pergunta() {
        if (fechado || !R || R.fim) return;
        var nv = Math.max(1, Math.min(5, 1 + Math.floor(R.passos / 8) + (TIER - 2)));
        var q = QZ.porMateria(MATH ? ANO : SEL, nv);
        painel.perguntar({ q: q, alts: QZ.alts(q, FACIL ? 3 : 4), titulo: '🧮 ' + (MATH ? ANO + 'º ano' : MN) + ' · nível ' + nv, sub: 'Degrau ' + R.passos + '/' + GOAL, cor: '#2563eb', aguardar: 'erro', semExplicacao: true }, function (r) {
          if (!R || R.fim) return;
          try { api.log(q, r.ok, 1); } catch (e) {}
          if (r.ok) {
            R.combo++; R.acertos++; R.moedas++;
            var ganho = r.tempo <= 3 ? 3 : r.tempo <= 6 ? 2 : 1; if (R.combo % 3 === 0) ganho++;
            sobe(ganho); api.gain(5 + Math.min(R.combo, 10), 1);
            if (R.combo % 3 === 0) msg('🔥 COMBO x' + R.combo + '!', 900);
          } else { R.combo = 0; R.erros++; R.passos = Math.max(0, R.passos - 1); R.shake = .4; marca(); }
          if (!R.fim) pergunta();
        });
      }
      function sobe(n) {
        R.passos = Math.min(GOAL, R.passos + n); marca(); R.flash = 1;
        K.beep(660 + R.passos * 12, .08, 'triangle', .05);
        if (R.passos >= GOAL && !R.chegada) { R.chegada = relogio(); terminar(); }
      }
      function marca() { var t = relogio(); if (R.passiva) R.passiva.set({ p: R.chegada ? GOAL : R.passos }); while (R.marcas.length < R.passos) R.marcas.push(Math.round(t * 10) / 10); if (R.live) { R.S.set({ p: R.chegada ? 1000000 - Math.round(R.chegada * 10) : R.passos }); R.S.agoraJa(); } }
      function terminar() {
        if (R.fim) return; R.fim = true; painel.esconder();
        var t = R.chegada || relogio();
        if (R.chegada) { msg('🏁 CHEGOU! ' + fmtT(t), 2200); K.beep(1047, .3, 'triangle'); }
        else msg('⏰ Tempo esgotado!', 1800);
        /* fantasma: salva se for o melhor */
        try { var g = R.ghost, melhor = !g || (R.chegada && (!g.chegada || R.chegada < g.chegada)) || (!R.chegada && !g.chegada && R.passos > (g.m || []).length); if (melhor && R.passos > 3) localStorage.setItem(ghostKey(), JSON.stringify({ m: R.marcas.slice(0, GOAL), chegada: R.chegada || 0 })); } catch (e) {}
        if (R.live) { R.S.set({ s: 'fim', p: R.chegada ? 1000000 - Math.round(R.chegada * 10) : R.passos }); R.S.agoraJa(); R.fimEspera = performance.now(); }
        else setTimeout(resultado, 1500);
      }
      function fmtT(t) { t = Math.max(0, t); return Math.floor(t / 60) + ':' + ('0' + Math.floor(t % 60)).slice(-2); }
      function ranking() {
        var a = [{ n: R.live ? R.S.nick : 'Você', me: true, passos: R.passos, chegada: R.chegada }];
        if (R.live) R.S.outros().filter(function (x) { return x.s === R.live.tag || x.s === 'fim'; }).forEach(function (x) { a.push({ n: x.n, passos: x.p >= 900000 ? GOAL : x.p, chegada: x.p >= 900000 ? (1000000 - x.p) / 10 : 0 }); });
        else R.runners.forEach(function (r) { a.push({ n: r.n, passos: r.passos, chegada: r.chegada, ghost: r.ghost }); });
        return a.sort(function (x, y) { if (x.chegada && y.chegada) return x.chegada - y.chegada; if (x.chegada) return -1; if (y.chegada) return 1; return y.passos - x.passos; });
      }
      function resultado() {
        if (fechado || modo === 'fimtela') return; modo = 'fimtela';
        var rk = ranking(), pos = 0; rk.forEach(function (x, i) { if (x.me) pos = i + 1; });
        if (pos === 1) api.gain(30, 3); else api.gain(10, 0);
        fimEl = document.createElement('div'); fimEl.className = 'qzl';
        fimEl.innerHTML = '<div class="box"><h2>' + (pos === 1 ? '🥇 Você venceu!' : '🏁 ' + pos + 'º lugar') + '</h2><ul>' + rk.map(function (x, i) { return '<li' + (x.me ? ' style="color:#facc15"' : '') + '><span>' + (['🥇 ', '🥈 ', '🥉 '][i] || (i + 1) + 'º ') + String(x.n).replace(/</g, '&lt;') + '</span><span>' + (x.chegada ? fmtT(x.chegada) : x.passos + ' degraus') + '</span></li>'; }).join('') +
          '</ul><p>✅ ' + R.acertos + ' acertos · ❌ ' + R.erros + ' erros · 🪙 ' + R.moedas + '</p><div class="row"><button class="g" data-a="r">Correr de novo</button><button class="k" data-a="m">Menu</button><button class="r" data-a="s">Sair</button></div></div>';
        wrap.appendChild(fimEl);
        fimEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        fimEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var live = R && R.live; if (R && R.S) R.S.parar(); if (R && R.passiva) R.passiva.parar(); fimEl.parentNode.removeChild(fimEl); fimEl = null; R = null; if (b.dataset.a === 's') fechar(); else if (b.dataset.a === 'm') menu(); else if (live) lobby = K.lobby(wrap, { jogo: 'tm' + ANO, titulo: 'Torre de Matemática · ' + ANO + 'º ano', onSolo: function () { lobby = null; corrida(null); }, onSair: function () { lobby = null; menu(); }, onLargada: function (i) { lobby = null; corrida(i); } }); else corrida(null); });
      }
      function atualiza(dt) {
        if (!R) return;
        var t = relogio(), sp = window.RBX_SPEED || 1;
        if (!R.fim && t >= LIMITE) terminar();
        R.vis += (R.passos - R.vis) * Math.min(1, dt * 8);
        R.flash = Math.max(0, R.flash - dt * 3); R.shake = Math.max(0, R.shake - dt);
        R.runners.forEach(function (r) {
          if (r.ghost) { var m = R.ghost.m, k = 0; while (k < m.length && m[k] <= t) k++; r.passos = k; if (k >= GOAL && !r.chegada) r.chegada = R.ghost.chegada || m[GOAL - 1]; }
          else if (!r.chegada && t > 0 && !R.fim) { r.prox -= dt * sp; if (r.prox <= 0) { var ok = Math.random() < .8; r.passos = ok ? Math.min(GOAL, r.passos + (Math.random() < .4 ? 2 : 1)) : Math.max(0, r.passos - 1); r.prox = 1 / Math.max(.08, r.ritmo + (Math.random() - .5) * .1) * (.7 + .3 * (1 - r.passos / GOAL)); if (r.passos >= GOAL) r.chegada = t; } }
          r.vis += (r.passos - r.vis) * Math.min(1, dt * 6);
        });
        if (R.live) {
          R.runners = R.S.outros().filter(function (x) { return x.s === R.live.tag || x.s === 'fim'; }).slice(0, 7).map(function (x, i) {
            var old = null; (R._lv || []).forEach(function (o) { if (o.id === x.id) old = o; });
            var p = x.p >= 900000 ? GOAL : x.p; return { id: x.id, n: x.n, c: K.botCores(i), passos: p, vis: old ? old.vis + (p - old.vis) * Math.min(1, dt * 4) : p, chegada: x.p >= 900000 ? (1000000 - x.p) / 10 : 0 };
          }); R._lv = R.runners;
          if (R.fim && modo === 'corrida') { var pend = R.runners.some(function (r) { return !r.chegada; }); if ((!pend || performance.now() - R.fimEspera > 12000) && t > 3) resultado(); }
        }
        if (!R.live && R.fim && modo === 'corrida') { /* resultado já agendado */ }
        if (R.passiva) { R.colegas = R.passiva.outros().slice(0, 4).map(function (x, i) { var old = null; (R.colegas || []).forEach(function (o) { if (o.id === x.id) old = o; }); var p = Math.min(GOAL, x.p); return { id: x.id, n: '👥 ' + x.n, c: K.botCores(i + 4), ghost: true, colega: true, passos: p, vis: old ? old.vis + (p - old.vis) * Math.min(1, dt * 4) : p }; }); }
        var rk = ranking();
        placar.mostrar(rk.map(function (x, i) { return { n: (i + 1) + 'º ' + x.n, v: x.chegada ? '🏁 ' + fmtT(x.chegada) : x.passos, me: x.me }; }).concat((R.colegas || []).map(function (c) { return { n: c.n, v: '🪜 ' + c.passos }; })));
        hud(['⏱️ ' + fmtT(Math.max(0, LIMITE - t)), '🪜 ' + R.passos + '/' + GOAL, '🔥 ' + R.combo, '🪙 ' + R.moedas]);
      }
      function desenha() {
        var lanes = R ? [{ n: 'Você', c: av, vis: R.vis, me: true }].concat(R.runners).concat(R.live ? [] : (R.colegas || [])) : [{ n: 'Você', c: av, vis: 0, me: true }];
        var pe = wrap.querySelector('.qzp.on'), visH = pe ? Math.max(H * .3, H - pe.offsetHeight - 14) : H;
        var n = lanes.length, STEP = Math.max(22, Math.min(56, visH / 7.5)), alt = (R ? R.vis : 0) * STEP;
        var baseY = visH * .66 + alt; /* y do degrau 0 */
        /* céu: azul embaixo, roxo e estrelas no alto */
        var k = Math.min(1, alt / (GOAL * STEP));
        var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix('#38bdf8', '#1e1b4b', k)); g.addColorStop(1, mix('#bae6fd', '#4c1d95', k)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff'; stars.forEach(function (s) { ctx.globalAlpha = k * (.5 + .5 * Math.sin(T * 2 + s.x * 20)); ctx.fillRect(s.x * W, s.y * H, s.s, s.s); }); ctx.globalAlpha = 1;
        clouds.forEach(function (c) { var y = ((c.y * H + alt * .35) % (H * 1.6)) - H * .2, x = ((c.x * W + T * 12 * c.s) % (W + 200)) - 100; ctx.fillStyle = 'rgba(255,255,255,' + (.75 - k * .5) + ')'; ctx.beginPath(); ctx.arc(x, y, 22 * c.s, 0, 7); ctx.arc(x + 26 * c.s, y + 6, 18 * c.s, 0, 7); ctx.arc(x - 24 * c.s, y + 8, 16 * c.s, 0, 7); ctx.fill(); });
        if (R && R.shake > 0) { ctx.save(); ctx.translate((Math.random() - .5) * 10 * R.shake, 0); }
        var LW = Math.min(110, (W - 30) / n), x0 = (W - LW * n) / 2;
        /* chão */
        ctx.fillStyle = '#16a34a'; ctx.fillRect(0, baseY + 8, W, H); ctx.fillStyle = '#15803d'; ctx.fillRect(0, baseY + 8, W, 8);
        /* torre: corpo de pedra */
        ctx.fillStyle = '#475569'; ctx.fillRect(x0 - 10, baseY - GOAL * STEP - 30, LW * n + 20, GOAL * STEP + 40);
        for (var row = 0; row <= GOAL; row++) { var yy = baseY - row * STEP; if (yy < -STEP || yy > H + STEP) continue; ctx.fillStyle = row % 2 ? '#52607a' : '#4b5871'; ctx.fillRect(x0 - 10, yy - STEP, LW * n + 20, STEP); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'left'; if (row % 5 === 0) ctx.fillText(row, x0 - 8, yy - 4); }
        /* topo com bandeira */
        var ty = baseY - GOAL * STEP; ctx.fillStyle = '#facc15'; ctx.fillRect(x0 - 16, ty - 8, LW * n + 32, 10);
        ctx.fillStyle = '#e5e7eb'; ctx.fillRect(W / 2 - 2, ty - 70, 4, 62); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(W / 2 + 2, ty - 70); ctx.lineTo(W / 2 + 34 + Math.sin(T * 5) * 4, ty - 60); ctx.lineTo(W / 2 + 2, ty - 50); ctx.fill();
        lanes.forEach(function (L, i) {
          var lx = x0 + i * LW, cor = L.me ? '#2563eb' : (L.ghost ? '#94a3b8' : ['#f97316', '#22c55e', '#a855f7', '#ec4899', '#06b6d4', '#eab308', '#ef4444'][i % 7]);
          /* degraus da faixa */
          for (var s = 1; s <= GOAL; s++) { var y = baseY - s * STEP; if (y < -STEP || y > H + 20) continue; var on = s <= Math.round(L.vis); ctx.fillStyle = on ? cor : 'rgba(15,23,42,.5)'; K.rr(ctx, lx + 6 + (s % 2) * LW * .18, y - 6, LW * .64, 12, 4); ctx.fill(); if (on) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(lx + 8 + (s % 2) * LW * .18, y - 6, LW * .6, 3); } }
          var vs = L.vis, sy = baseY - vs * STEP - 6, sx = lx + 6 + (Math.round(vs) % 2) * LW * .18 + LW * .32;
          K.avatar2d(ctx, sx, sy, Math.min(42, STEP * .95), L.c, T * 9 + i, L.ghost ? .45 : 1);
          ctx.font = '800 ' + (L.me ? 13 : 11) + 'px system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
          var nm = String(L.n).slice(0, 12); ctx.strokeText(nm, sx, sy - STEP * 1.45); ctx.fillStyle = L.me ? '#facc15' : '#fff'; ctx.fillText(nm, sx, sy - STEP * 1.45);
        });
        if (R && R.shake > 0) ctx.restore();
        if (R && R.flash > 0) { ctx.fillStyle = 'rgba(250,204,21,' + R.flash * .15 + ')'; ctx.fillRect(0, 0, W, H); }
      }
      function mix(a, b, t) { var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), r = ((pa >> 16) * (1 - t) + (pb >> 16) * t) | 0, g = (((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t) | 0, bl = ((pa & 255) * (1 - t) + (pb & 255) * t) | 0; return 'rgb(' + r + ',' + g + ',' + bl + ')'; }
      function frame(ts) {
        if (fechado) return; raf = requestAnimationFrame(frame);
        var dt = last ? Math.min(.05, (ts - last) / 1000) : .016; last = ts; T += dt;
        if (modo === 'corrida' && R) atualiza(dt);
        desenha();
      }
      function fechar() {
        if (fechado) return; fechado = true; cancelAnimationFrame(raf);
        if (lobby) try { lobby.fechar(); } catch (e) {}
        if (R && R.S) try { R.S.parar(); } catch (e) {}
        if (R && R.passiva) try { R.passiva.parar(); } catch (e) {}
        painel.destruir(); window.removeEventListener('resize', resize); window.removeEventListener('keydown', onEsc);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (api.onClose) api.onClose();
      }
      menu(); raf = requestAnimationFrame(frame);
    }
  };
})();
