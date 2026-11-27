/* RobIox — Duelos de Quiz ⚔️ : torneio eliminatório (quartas, semi, final) contra bots, ou "Jogar com a turma" (todos recebem a
   mesma pergunta na mesma rodada; quem erra ou demora é eliminado; o último de pé vence). Requer robiox-quiz-banco.js e robiox-quiz-kit.js. */
(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS.quizduels = {
    nome: 'Duelos de Quiz ⚔️', icone: '⚔️', destaque: true, servidor: true,
    desc: 'Torneio eliminatório de perguntas: Matemática, Ciências, História, Geografia, Português, Inglês e Bandeiras!',
    start: function (api) {
      var K = window.RBX_QZKIT, QZ = window.RBX_QZ;
      if (!K || !QZ) { try { api.say('Duelos de Quiz: carregando banco…', 1800); } catch (e) {} if (api.onClose) api.onClose(); return; }
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
      var disc = 'mix', modo = 'menu', parts = [], moedas = 0, acertos = 0;
      try { disc = localStorage.getItem('rbx_qd_disc') || 'mix'; } catch (e) {}
      var ddM = QZ.discDe && QZ.discDe(api && api.ANO); if (ddM) disc = ddM;
      function dInfo(id) { for (var i = 0; i < QZ.DISC.length; i++) if (QZ.DISC[i].id === id) return QZ.DISC[i]; return QZ.DISC[0]; }

      /* ---------------- menu ---------------- */
      var menuEl = null;
      function menu() {
        modo = 'menu'; painel.esconder(); placar.mostrar(null); hud([]);
        menuEl = document.createElement('div'); menuEl.className = 'qzl';
        var h = '<div class="box"><h2>⚔️ Duelos de Quiz</h2><p>Escolha a disciplina (' + QZ.total() + '+ perguntas autorais):</p><div class="grid">';
        QZ.DISC.forEach(function (d) { h += '<button data-d="' + d.id + '" style="background:' + d.cor + ';' + (d.id === disc ? 'outline:3px solid #facc15;outline-offset:2px' : '') + '"><span>' + d.icone + '</span>' + d.nome + '</button>'; });
        h += '</div><div class="row"><button class="y" data-m="t">🏆 Torneio contra bots</button><button class="g" data-m="l">👥 Jogar com a turma</button></div>' +
          '<p style="font-size:12px;opacity:.75">Teclado: 1–4 ou setas + Enter. Torneio: 3 vidas, quartas → semifinal → final. Turma: mesma pergunta para todos, quem erra ou demora sai; o último de pé vence.</p></div>';
        menuEl.innerHTML = h; wrap.appendChild(menuEl);
        menuEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        menuEl.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.dataset.d) { disc = b.dataset.d; try { localStorage.setItem('rbx_qd_disc', disc); } catch (x) {} [].forEach.call(menuEl.querySelectorAll('[data-d]'), function (x) { x.style.outline = x.dataset.d === disc ? '3px solid #facc15' : ''; x.style.outlineOffset = '2px'; }); K.beep(660, .05); return; }
          if (b.dataset.m === 't') { fecharMenu(); torneio(); }
          if (b.dataset.m === 'l') { fecharMenu(); aoVivo(); }
        });
      }
      function fecharMenu() { if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl); menuEl = null; }

      /* ---------------- torneio contra bots ---------------- */
      var TR = null, RNOME = ['Quartas de final', 'Semifinal', 'Final'];
      function torneio() {
        var nomes = QZ.shuf(K.BOTS).slice(0, 7);
        var ps = [{ n: 'Você', c: av, me: true }].concat(nomes.map(function (n, i) { return { n: '🤖 ' + n, c: K.botCores(i), forca: .5 + Math.random() * .2 }; }));
        TR = { ps: ps, rodada: 0, vidas: 3, vivos: [0, 1, 2, 3, 4, 5, 6, 7], opp: 1, eu: 0, op: 0, qn: 0, streak: 0, botAnim: 0, flash: 0 };
        modo = 'torneio'; moedas = 0; acertos = 0; duelo();
      }
      function chave() { /* simula os duelos entre bots e define o próximo rival */
        var v = TR.vivos, nv = [], i;
        for (i = 0; i < v.length; i += 2) { var a = v[i], b = v[i + 1]; if (a === 0 || b === 0) nv.push(0); else nv.push(Math.random() < .5 ? a : b); }
        TR.vivos = nv;
        TR.opp = nv[nv.indexOf(0) ^ 1];
      }
      function duelo() {
        TR.eu = 0; TR.op = 0; TR.qn = 0; TR.morte = 0;
        if (TR.rodada === 0) TR.opp = 1;
        msg('⚔️ ' + RNOME[TR.rodada] + '\nVocê × ' + TR.ps[TR.opp].n, 2000); K.beep(440, .1); setTimeout(function () { K.beep(660, .15); }, 150);
        setTimeout(proxima, 1900);
      }
      function nivel() { return Math.max(1, Math.min(5, [1, 3, 5][TR.rodada] + (TIER - 2) + (TR.qn >= 3 ? 1 : 0))); }
      function proxima() {
        if (fechado || modo !== 'torneio') return;
        var q = QZ.pergunta(disc, nivel(), null, ANO), tempo = [14, 12, 10][TR.rodada] + (FACIL ? 4 : 0);
        var acc = [.55, .66, .78][TR.rodada] - (FACIL ? .12 : 0) + (TIER - 2) * .05, bt = 2 + Math.random() * (tempo - 3.5);
        TR.bot = { ok: Math.random() < acc, t: bt, feito: false }; TR.t0 = performance.now(); TR.tempo = tempo;
        var sub = (TR.morte ? 'Morte súbita! ' : 'Pergunta ' + (TR.qn + 1) + '/5 · ') + RNOME[TR.rodada];
        painel.perguntar({ q: q, alts: QZ.alts(q, FACIL ? 3 : 4), titulo: dInfo(q.disc).icone + ' ' + dInfo(q.disc).nome, sub: sub, cor: dInfo(q.disc).cor, tempo: tempo, aguardar: true, autoOk: 1400 }, function (r) {
          var b = TR.bot; b.feito = true;
          if (r.ok) { var pts = 100 + Math.round(50 * Math.max(0, 1 - r.tempo / tempo)); TR.eu += pts; TR.streak++; acertos++; moedas++; api.gain(6 + Math.min(TR.streak, 10), 1); TR.flash = 1; } else TR.streak = 0;
          if (b.ok) TR.op += 100 + Math.round(50 * Math.max(0, 1 - b.t / tempo));
          try { api.log(q, r.ok, 1); } catch (e) {}
          TR.qn++;
          if (!r.ok) msg(b.ok ? TR.ps[TR.opp].n + ' também pontuou!' : 'Ninguém pontuou', 1100);
          fimPergunta();
        });
      }
      function fimPergunta() {
        if (fechado || modo !== 'torneio') return;
        if (TR.qn < 5 || (TR.qn >= 5 && TR.eu === TR.op && TR.morte < 4)) { if (TR.qn >= 5) TR.morte++; setTimeout(proxima, 350); return; }
        painel.esconder();
        var ganhou = TR.eu > TR.op || (TR.eu === TR.op && Math.random() < .5);
        if (ganhou) {
          K.beep(784, .15, 'triangle'); setTimeout(function () { K.beep(1047, .25, 'triangle'); }, 160);
          confete(60);
          if (TR.rodada === 2) { api.gain(40, 3); fimJogo(true); return; }
          api.gain(15, 0); msg('🎉 Você venceu ' + TR.ps[TR.opp].n + '!', 1800);
          setTimeout(function () { if (fechado || modo !== 'torneio') return; chave(); TR.rodada++; duelo(); }, 1900);
        } else {
          TR.vidas--; K.beep(150, .4, 'sawtooth');
          if (TR.vidas <= 0) { fimJogo(false); return; }
          msg('💔 ' + TR.ps[TR.opp].n + ' venceu!\nRevanche! (' + TR.vidas + ' vida' + (TR.vidas > 1 ? 's' : '') + ')', 2200);
          setTimeout(duelo, 2300);
        }
      }
      var fimEl = null;
      function fimJogo(campeao, extra) {
        modo = 'fim'; painel.esconder();
        fimEl = document.createElement('div'); fimEl.className = 'qzl';
        fimEl.innerHTML = '<div class="box"><h2>' + (campeao ? '🏆 CAMPEÃO!' : '⚔️ Fim do torneio') + '</h2>' + (extra || '<p>' + (campeao ? 'Você venceu todos os duelos!' : 'Você chegou até: <b>' + RNOME[TR ? TR.rodada : 0] + '</b>') + '</p>') +
          '<p>✅ Acertos: <b>' + acertos + '</b> · 🪙 Moedas: <b>' + moedas + '</b></p><div class="row"><button class="g" data-a="r">Jogar de novo</button><button class="k" data-a="m">Menu</button><button class="r" data-a="s">Sair</button></div></div>';
        wrap.appendChild(fimEl); if (campeao) confete(120);
        fimEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        fimEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fimEl.parentNode.removeChild(fimEl); fimEl = null; if (b.dataset.a === 's') fechar(); else if (b.dataset.a === 'm') menu(); else if (LV) aoVivo(); else torneio(); });
      }

      /* ---------------- ao vivo com a turma ---------------- */
      var LV = null, lobby = null, salaVelha = null;
      function aoVivo() {
        if (salaVelha) { salaVelha.parar(); salaVelha = null; }
        modo = 'lobby'; LV = null;
        lobby = K.lobby(wrap, {
          jogo: 'qd' + disc, titulo: 'Duelo da turma · ' + dInfo(disc).icone + ' ' + dInfo(disc).nome, minimo: 2,
          onSolo: function () { lobby = null; LV = null; torneio(); }, onSair: function () { lobby = null; menu(); },
          onLargada: function (info) { lobby = null; iniciaLive(info); }
        });
      }
      function janela(r) { return Math.max(6, 13 - Math.floor(r / 3)) * 1000; }
      function inicioRodada(r) { var t = LV.T0, i; for (i = 0; i < r; i++) t += janela(i) + 4000; return t; }
      function iniciaLive(info) {
        var S = info.sala;
        LV = { S: S, T0: info.inicio, tag: info.tag, seq: QZ.sequencia(disc, info.seed, ANO), r: -1, vivo: true, p: 0, avaliada: -1, vivosAntes: null, fim: false, elimR: -1 };
        S.set({ p: 0, v: 1, s: info.tag });
        modo = 'live'; moedas = 0; acertos = 0;
        msg('👥 Valendo! Errou ou demorou, saiu.', 1800);
      }
      function noMatch() { return LV.S.outros().filter(function (x) { return x.s === LV.tag; }); }
      function tickLive() {
        if (!LV || LV.fim) return;
        var now = LV.S.agora(), r = 0;
        while (now >= inicioRodada(r + 1) && r < 60) r++;
        var ini = inicioRodada(r), fimJ = ini + janela(r);
        if (r !== LV.r) {
          LV.r = r;
          if (LV.vivo && now < fimJ - 600) {
            var q = LV.seq(r), di = dInfo(q.disc), rr = r, fimR = fimJ;
            painel.perguntar({ q: q, alts: q.alts, titulo: di.icone + ' ' + di.nome, sub: 'Rodada ' + (r + 1) + ' · ' + (noMatch().length + 1) + ' na sala', cor: di.cor, tempo: (fimJ - now) / 1000, semExplicacao: true }, function (res) {
              if (res.ok && LV.S.agora() > fimR + 400) { res.ok = false; res.timeout = true; } /* resposta fora da janela do servidor */
              try { api.log(q, res.ok, 1); } catch (e) {}
              if (res.ok) { LV.p = rr + 1; acertos++; moedas++; api.gain(6 + Math.min(acertos, 10), 1); LV.S.set({ p: LV.p, v: 1 }); msg('✅ Sobreviveu à rodada ' + (rr + 1) + '!', 1300); }
              else { LV.vivo = false; LV.elimR = rr; LV.S.set({ v: 0 }); msg(res.timeout ? '⏰ Demorou… eliminado!' : '💀 Errou… eliminado!', 1800); }
              LV.S.agoraJa();
              setTimeout(function () { if (LV && LV.r === rr) painel.esconder(); }, 2600);
            });
          }
        }
        /* avaliação da rodada (3,5 s depois de fechar a janela, para chegar o sinal de todos) */
        if (now >= fimJ + 3500 && LV.avaliada < r) {
          LV.avaliada = r;
          var vv = vivosAgora(r);
          if (vv.length <= 1 || r >= 24) {
            var venc = vv.length ? vv : (LV.vivosAntesR || [{ id: 'eu', n: LV.S.nick + ' (você)', me: true, p: LV.p }].concat(noMatch().map(function (x) { return { id: x.id, n: x.n, p: x.p }; })));
            encerraLive(venc);
          } else LV.vivosAntesR = vv;
        }
      }
      function vivosAgora(r) {
        var a = [];
        if (LV.vivo && LV.p >= r + 1) a.push({ id: 'eu', n: LV.S.nick + ' (você)', me: true, p: LV.p });
        noMatch().forEach(function (x) { if (x.v === 1 && x.p >= r + 1) a.push({ id: x.id, n: x.n, p: x.p }); });
        return a;
      }
      function encerraLive(venc) {
        LV.fim = true; painel.esconder(); LV.S.agoraJa(); /* mantém o estado da partida por mais 10 s para os colegas conferirem */
        var euV = venc.some(function (x) { return x.me; });
        if (euV) { api.gain(venc.length === 1 ? 40 : 25, 3); confete(120); } else api.gain(8, 0);
        var lista = '<ul>' + venc.map(function (x) { return '<li><span>🏆 ' + String(x.n).replace(/</g, '&lt;') + '</span><span>' + x.p + ' rodadas</span></li>'; }).join('') + '</ul>';
        var t = venc.length === 1 ? (euV ? '<p>Você foi o último de pé!</p>' : '<p>Vencedor:</p>') : '<p>Empate entre os últimos de pé:</p>';
        var SS = LV.S; salaVelha = SS; setTimeout(function () { SS.parar(); }, 10000); setTimeout(function () { fimJogo(euV, t + lista); }, 1200);
      }

      /* ---------------- desenho ---------------- */
      var conf = [];
      function confete(n) { if (window.RBX_FX && !RBX_FX.on()) return; for (var i = 0; i < n; i++) conf.push({ x: W / 2 + (Math.random() - .5) * W * .6, y: H * .25, vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 2, c: ['#facc15', '#ef4444', '#22c55e', '#3b82f6', '#ec4899'][i % 5], v: 1, r: Math.random() * 6 }); }
      function fundo() {
        var g = ctx.createRadialGradient(W / 2, H * .35, 10, W / 2, H * .4, Math.max(W, H) * .8);
        g.addColorStop(0, '#4c1d95'); g.addColorStop(.55, '#1e1b4b'); g.addColorStop(1, '#0b1026'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        /* holofotes */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < 4; i++) {
          var a = Math.sin(T * .6 + i * 1.7) * .45, x0 = W * (i + .5) / 4;
          ctx.save(); ctx.translate(x0, -10); ctx.rotate(a);
          var lg = ctx.createLinearGradient(0, 0, 0, H * .9); lg.addColorStop(0, ['rgba(250,204,21,.22)', 'rgba(59,130,246,.2)', 'rgba(236,72,153,.2)', 'rgba(34,197,94,.18)'][i]); lg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(W * .18, H * .9); ctx.lineTo(-W * .18, H * .9); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        ctx.restore();
        /* palco */
        var py = H * .58; ctx.fillStyle = '#312e81'; ctx.beginPath(); ctx.ellipse(W / 2, py, W * .46, H * .08, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(250,204,21,.55)'; ctx.lineWidth = 3; ctx.stroke();
      }
      function podio(x, y, s, p, pts, cor, ativo) {
        ctx.fillStyle = cor; K.rr(ctx, x - s * .9, y, s * 1.8, s * .5, 8); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - s * .9, y + s * .38, s * 1.8, s * .12);
        var bob = ativo ? Math.sin(T * 6) * s * .04 : 0;
        K.avatar2d(ctx, x, y - bob, s, p.c, ativo ? T * 8 : 0);
        ctx.font = '900 ' + Math.max(13, s * .2) + 'px system-ui'; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.fillStyle = p.me ? '#facc15' : '#fff';
        ctx.strokeText(p.n, x, y - s * 1.62); ctx.fillText(p.n, x, y - s * 1.62);
        ctx.font = '900 ' + Math.max(18, s * .32) + 'px system-ui'; ctx.strokeText(pts, x, y - s * 2.02); ctx.fillStyle = '#fff'; ctx.fillText(pts, x, y - s * 2.02);
      }
      function desenhaTorneio() {
        var s = Math.min(W * .16, H * .17), y = H * .52;
        podio(W * .27, y, s, TR.ps[0], TR.eu, '#2563eb', true);
        podio(W * .73, y, s, TR.ps[TR.opp], TR.op, '#b91c1c', true);
        ctx.save(); ctx.translate(W / 2, y - s * .6); ctx.rotate(Math.sin(T * 3) * .08);
        ctx.font = '900 ' + Math.max(28, s * .5) + 'px system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.strokeText('VS', 0, 0); ctx.fillStyle = '#facc15'; ctx.fillText('VS', 0, 0); ctx.restore();
        /* chave */
        var bw = Math.min(W - 80, 520), bx = (W - bw) / 2, by = 58;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; K.rr(ctx, bx, by, bw, 26, 13); ctx.fill();
        RNOME.forEach(function (n, i) { var x = bx + bw * (i + .5) / 3; ctx.font = '800 12px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = i === TR.rodada ? '#facc15' : (i < TR.rodada ? '#86efac' : 'rgba(255,255,255,.55)'); ctx.fillText((i < TR.rodada ? '✔ ' : '') + n, x, by + 17); });
        if (TR.flash > 0) { ctx.fillStyle = 'rgba(34,197,94,' + TR.flash * .25 + ')'; ctx.fillRect(0, 0, W, H); }
        hud(['❤️'.repeat(Math.max(0, TR.vidas)) + '🖤'.repeat(3 - Math.max(0, TR.vidas)), '🪙 ' + moedas, '🔥 ' + TR.streak]);
      }
      function desenhaLive() {
        var jog = [{ n: LV.S.nick, me: true, vivo: LV.vivo, p: LV.p, c: av }].concat(noMatch().map(function (x, i) { return { n: x.n, vivo: x.v === 1, p: x.p, c: K.botCores(i + 1) }; }));
        var n = jog.length, cx = W / 2, cy = H * .5, rx = Math.min(W * .4, 360), ry = H * .13, s = Math.max(26, Math.min(W, H) * (n > 8 ? .07 : .1));
        jog.forEach(function (j, i) {
          var a = Math.PI / 2 + (i / n) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
          K.avatar2d(ctx, x, y, s, j.vivo ? j.c : { skin: '#777', shirt: '#555', pants: '#444', hair: '#333' }, j.vivo ? T * 5 + i : 0, j.vivo ? 1 : .45);
          ctx.font = '800 ' + Math.max(11, s * .22) + 'px system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
          var tx = (j.vivo ? '' : '💀 ') + j.n; ctx.strokeText(tx, x, y + s * .35); ctx.fillStyle = j.me ? '#facc15' : '#fff'; ctx.fillText(tx, x, y + s * .35);
        });
        var now = LV.S.agora(), r = Math.max(0, LV.r), fimJ = inicioRodada(r) + janela(r), rest = Math.max(0, Math.ceil((fimJ - now) / 1000));
        var vivos = jog.filter(function (j) { return j.vivo; }).length;
        hud(['👥 Rodada ' + (r + 1), '❤️ ' + vivos + ' de pé', now < fimJ ? '⏱️ ' + rest + 's' : '⏳ conferindo…', LV.vivo ? '✅ ' + LV.p : '👀 assistindo']);
        placar.mostrar(jog.slice().sort(function (a, b) { return (b.vivo - a.vivo) || (b.p - a.p); }).map(function (j) { return { n: (j.vivo ? '❤️ ' : '💀 ') + j.n, v: j.p, me: j.me }; }));
      }
      function frame(ts) {
        if (fechado) return; raf = requestAnimationFrame(frame);
        var dt = last ? Math.min(.05, (ts - last) / 1000) : .016; last = ts; T += dt;
        fundo();
        if (modo === 'torneio' && TR) { TR.flash = Math.max(0, TR.flash - dt * 2); desenhaTorneio(); }
        else if (modo === 'live' && LV) { tickLive(); if (LV && !LV.fim) desenhaLive(); }
        else if (modo === 'menu' || modo === 'lobby') { var s = Math.min(W, H) * .12; K.avatar2d(ctx, W / 2, H * .58, s, av, T * 4); placar.mostrar(null); }
        for (var i = conf.length - 1; i >= 0; i--) { var c = conf[i]; c.x += c.vx; c.y += c.vy; c.vy += .25; c.v -= dt * .6; c.r += .2; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.globalAlpha = Math.max(0, c.v); ctx.fillRect(-4, -2, 8, 4); ctx.restore(); if (c.v <= 0 || c.y > H) conf.splice(i, 1); }
      }
      function fechar() {
        if (fechado) return; fechado = true; cancelAnimationFrame(raf);
        if (lobby) try { lobby.fechar(); } catch (e) {}
        if (LV && LV.S) try { LV.S.parar(); } catch (e) {}
        if (salaVelha) try { salaVelha.parar(); } catch (e) {}
        painel.destruir(); window.removeEventListener('resize', resize); window.removeEventListener('keydown', onEsc);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (api.onClose) api.onClose();
      }
      menu(); raf = requestAnimationFrame(frame);
    }
  };
})();
