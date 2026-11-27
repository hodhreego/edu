/* RobIox — Obby Trivia Challenge 🏁 : alterna pergunta e pista de obstáculos (3D). Errou a pergunta → obby EXTRA curto e vermelho
   para não perder vida. 8 fases, 3 vidas, moedas. Só metade dos obstáculos antes de cada pergunta (pedido do professor).
   Fantasmas dos colegas da turma (mesma fase) aparecem semitransparentes; largada simultânea opcional. Requer robiox-quiz-banco.js e robiox-quiz-kit.js. */
(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS.obbytrivia = {
    nome: 'Obby Trivia Challenge 🏁', icone: '🏁', destaque: true, servidor: true,
    desc: 'Pergunta, obby, pergunta, obby! Errou? Encare o obby extra para não perder vida.',
    start: function (api) {
      var K = window.RBX_QZKIT, QZ = window.RBX_QZ;
      if (!K || !QZ || !window.THREE) { try { api.say('Obby Trivia: carregando…', 1800); } catch (e) {} if (api.onClose) api.onClose(); return; }
      var wrap = K.wrap(), fechado = false;
      var av = api.avatarColors || { skin: '#ffcc99', shirt: '#2563eb', pants: '#1e3a8a', hair: '#3f2a14' };
      var O = K.obby(wrap, { cores: av, ceu: 0x8fd3ff });
      if (!O) { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); if (api.onClose) api.onClose(); return; }
      var painel = K.painel(wrap), msg = K.msg(wrap), hud = K.hud(wrap), placar = K.placar(wrap);
      K.btnFechar(wrap, fechar);
      function onEsc(e) { if (e.key === 'Escape') fechar(); }
      window.addEventListener('keydown', onEsc);
      var ANO = K.ano(api), TIER = api.tier ? api.tier() : 2, FACIL = api.easy ? api.easy() : false;
      var FASES = 8, disc = 'mix', G = null, S = null, lobby = null, menuEl = null, fimEl = null;
      try { disc = localStorage.getItem('rbx_ot_disc') || 'mix'; } catch (e) {}
      function dInfo(id) { for (var i = 0; i < QZ.DISC.length; i++) if (QZ.DISC[i].id === id) return QZ.DISC[i]; return QZ.DISC[0]; }
      var COR = [0x22c55e, 0x3b82f6, 0xf59e0b, 0xa855f7, 0x06b6d4, 0xec4899, 0x84cc16, 0xf97316];

      /* ---------- pista (determinística pela semente: todos da turma veem a mesma) ---------- */
      function construir(seed) {
        O.limpar();
        var R = QZ.rng(seed), z = 0, y = 0, fases = [];
        function rr(a, b) { return a + R() * (b - a); }
        for (var f = 1; f <= FASES; f++) {
          var pad = O.plat({ x: 0, y: y, z: z - 4, w: 9, d: 8, cor: 0xfacc15 });
          var ph = { f: f, pad: pad, z0: z - 4, y0: y, obs: [] };
          O.bandeira(-3.6, y, z - 6.5, COR[f % 8]);
          z -= 8;
          var n = Math.ceil((2 + f) / 2); /* METADE dos obstáculos (antes eram 2+f) */
          for (var i = 0; i < n; i++) {
            var tipo = ['fixa', 'move', 'sobe', 'some', 'gira', 'escada'][Math.floor(R() * Math.min(6, 2 + f))], gap = rr(3, 3.6 + f * .15);
            y = Math.max(-1, Math.min(6, y + rr(-.6, 1.1)));
            if (tipo === 'escada') {
              for (var s = 0; s < 3; s++) { z -= gap * .75; y += .7; ph.obs.push(O.plat({ x: (s - 1) * 1.6, y: y, z: z, w: 2.4, d: 2.4, cor: COR[(f + s) % 8] })); }
              O.moeda((1) * 1.6, y + 1.2, z);
            } else if (tipo === 'gira') {
              z -= gap + 3; ph.obs.push(O.plat({ x: 0, y: y, z: z, w: 7, d: 7, cor: 0x64748b, tipo: 'gira', vel: .8 + f * .08, fase: R() * 6 })); z -= 3;
            } else {
              z -= gap + 1.5;
              var w = Math.max(2.2, 4.2 - f * .2);
              ph.obs.push(O.plat({ x: tipo === 'move' ? 0 : rr(-1.5, 1.5), y: y, z: z, w: w, d: w, cor: COR[(f + i) % 8], tipo: tipo, amp: tipo === 'move' ? 2.6 : (tipo === 'sobe' ? 2 : 0), vel: 1 + f * .1, fase: R() * 6 }));
              O.moeda(0, y + 1.3 + (tipo === 'sobe' ? 1 : 0), z);
            }
            z -= 1.5;
          }
          z -= 3; ph.z1 = z;
          fases.push(ph);
        }
        var fim = O.plat({ x: 0, y: y, z: z - 5, w: 10, d: 10, cor: 0xfacc15 }); O.bandeira(0, y, z - 7, 0xef4444);
        return { fases: fases, fimZ: z - 5, fimY: y, fimPlat: fim };
      }
      /* obby extra curto (vermelho), ao lado da pista principal */
      var extra = [];
      function obbyExtra(ph) {
        extra.forEach(O.remover); extra = [];
        var x0 = 34, z = ph.z0, y = ph.y0, R = Math.random;
        extra.push(O.plat({ x: x0, y: y, z: z, w: 6, d: 6, cor: 0xb91c1c }));
        var n = 3 + Math.min(2, Math.floor(ph.f / 3));
        for (var i = 0; i < n; i++) { z -= 4.2; y += .4; extra.push(O.plat({ x: x0 + (R() - .5) * 3, y: y, z: z, w: 2.6, d: 2.6, cor: 0xef4444, tipo: i % 2 ? 'move' : 'fixa', amp: 1.8, vel: 1.2 })); }
        z -= 4.5; var fimP = O.plat({ x: x0, y: y, z: z, w: 5, d: 5, cor: 0x16a34a }); extra.push(fimP);
        O.spawn(x0, ph.y0 + .2, ph.z0); G.emExtra = true;
        O.gatilho(x0, z, 2.2, function () { if (!G || !G.emExtra) return; G.emExtra = false; extra.forEach(O.remover); extra = []; msg('💪 Obby extra completo!\nNenhuma vida perdida.', 1800); K.beep(880, .2, 'triangle'); seguir(); }, y - .5);
        msg('🟥 OBBY EXTRA!\nComplete para não perder vida', 2200);
      }

      /* ---------- fluxo ---------- */
      function menu() {
        menuEl = document.createElement('div'); menuEl.className = 'qzl';
        var h = '<div class="box"><h2>🏁 Obby Trivia Challenge</h2><p>Responda, atravesse o obby, responda de novo! Errou? Obby extra vermelho para salvar a vida. ' + FASES + ' fases.</p><div class="grid">';
        QZ.DISC.forEach(function (d) { h += '<button data-d="' + d.id + '" style="background:' + d.cor + ';' + (d.id === disc ? 'outline:3px solid #facc15;outline-offset:2px' : '') + '"><span>' + d.icone + '</span>' + d.nome + '</button>'; });
        h += '</div><div class="row"><button class="g" data-m="j">▶ Jogar</button><button data-m="l">👥 Largada com a turma</button></div><p style="font-size:12px;opacity:.75">Setas/WASD + Espaço · no celular: joystick + PULAR. Colegas da turma aparecem como fantasmas.</p></div>';
        menuEl.innerHTML = h; wrap.appendChild(menuEl);
        menuEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        menuEl.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.dataset.d) { disc = b.dataset.d; try { localStorage.setItem('rbx_ot_disc', disc); } catch (x) {} [].forEach.call(menuEl.querySelectorAll('[data-d]'), function (x) { x.style.outline = x.dataset.d === disc ? '3px solid #facc15' : ''; }); return; }
          tira();
          if (b.dataset.m === 'j') jogar(null);
          else lobby = K.lobby(wrap, { jogo: 'ot', titulo: 'Obby Trivia · largada da turma', minimo: 2, onSolo: function () { lobby = null; jogar(null); }, onSair: function () { lobby = null; menu(); }, onLargada: function (info) { lobby = null; jogar(info); } });
        });
        O.pausar(true);
      }
      function tira() { if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl); menuEl = null; }
      function semDia() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
      function jogar(info) {
        var seed = info ? info.seed : semDia();
        G = { fase: 1, vidas: 3, moedas: 0, acertos: 0, emExtra: false, t0: performance.now(), tag: info ? info.tag : 'solo', fim: false, perguntando: false, ckZ: 0 };
        G.pista = construir(seed);
        if (info) S = info.sala; else { S = K.sala({ jogo: 'ot' }); if (!S.ativo) S = null; }
        if (S) S.set({ p: 1000, v: 3, s: G.tag });
        O.onMoeda = function () { G.moedas++; };
        O.onCair = cair;
        G.pista.fases.forEach(function (ph) { O.gatilho(0, ph.z0, 3.6, function () { if (G && ph.f > 1) chegouPad(ph); }, ph.y0 - .5); });
        O.gatilho(0, G.pista.fimZ, 4, vitoria, G.pista.fimY - .5);
        var p1 = G.pista.fases[0]; O.spawn(0, p1.y0 + .2, p1.z0 + 2);
        setTimeout(function () { chegouPad(p1); }, 600);
      }
      function chegouPad(ph) {
        if (!G || G.fim) return;
        G.fase = ph.f; G.ph = ph; G.perguntando = true; O.pausar(true); envia();
        var nv = Math.max(1, Math.min(5, Math.ceil(ph.f * 5 / FASES) + (TIER - 2)));
        var q = QZ.pergunta(disc, nv, null, ANO), di = dInfo(q.disc);
        msg('📜 Fase ' + ph.f + '/' + FASES, 1000);
        painel.perguntar({ q: q, alts: QZ.alts(q, FACIL ? 3 : 4), titulo: di.icone + ' ' + di.nome, sub: 'Fase ' + ph.f + '/' + FASES, cor: di.cor, aguardar: true, autoOk: 1100 }, function (r) {
          painel.esconder(); G.perguntando = false;
          try { api.log(q, r.ok, 1); } catch (e) {}
          if (r.ok) { G.acertos++; api.gain(8 + ph.f, 1); msg('✅ Certo! Agora o obby!', 1200); seguir(); }
          else obbyExtra(ph);
          O.pausar(false);
        });
      }
      function seguir() { var ph = G.ph; O.spawn(0, ph.y0 + .2, ph.z0 - 2.5); G.ckZ = ph.z0; }
      function cair() {
        if (!G || G.fim) return;
        if (G.emExtra) {
          G.emExtra = false; extra.forEach(O.remover); extra = []; G.vidas--; K.beep(150, .4, 'sawtooth');
          if (G.vidas <= 0) { fimJogo(false); return; }
          msg('💔 Caiu no obby extra: -1 vida', 1800); seguir(); envia(); return;
        }
        var ph = G.ph || G.pista.fases[0]; msg('↩️ Volte ao checkpoint!', 1000); O.spawn(0, ph.y0 + .3, ph.z0 - 2.5);
      }
      function vitoria() { if (!G || G.fim) return; api.gain(40 + G.vidas * 10, 3); fimJogo(true); }
      function envia() { if (!S || !G) return; var prog = G.ph ? Math.max(0, Math.min(999, Math.round((G.ph.z0 - O.P.z) * 10))) : 0; if (G.emExtra) prog = 0; S.set({ p: (G.fim && G.venceu ? FASES + 1 : G.fase) * 1000 + (G.fim ? 0 : prog), v: G.vidas }); }
      function fimJogo(venceu) {
        G.fim = true; G.venceu = venceu; O.pausar(true); painel.esconder(); envia(); if (S) { S.set({ s: 'fim' }); S.agoraJa(); }
        var t = (performance.now() - G.t0) / 1000;
        fimEl = document.createElement('div'); fimEl.className = 'qzl';
        fimEl.innerHTML = '<div class="box"><h2>' + (venceu ? '🏆 Obby completo!' : '💀 Fim de jogo') + '</h2><p>' + (venceu ? 'Você terminou as ' + FASES + ' fases em ' + Math.floor(t / 60) + ':' + ('0' + Math.floor(t % 60)).slice(-2) + '!' : 'Você chegou à fase ' + G.fase + '.') + '</p><p>✅ ' + G.acertos + ' acertos · 🪙 ' + G.moedas + ' moedas · ❤️ ' + G.vidas + '</p><div class="row"><button class="g" data-a="r">Jogar de novo</button><button class="k" data-a="m">Menu</button><button class="r" data-a="s">Sair</button></div></div>';
        wrap.appendChild(fimEl);
        if (G.moedas) api.gain(G.moedas, 0);
        fimEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        fimEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fimEl.parentNode.removeChild(fimEl); fimEl = null; if (S) S.parar(); S = null; G = null; extra.forEach(O.remover); extra = []; if (b.dataset.a === 's') fechar(); else if (b.dataset.a === 'm') menu(); else jogar(null); });
      }
      /* ---------- fantasmas dos colegas e placar ---------- */
      var acc = 0;
      O.loop(function (dt) {
        if (!G) { hud([]); placar.mostrar(null); return; }
        acc += dt; if (acc > .5) { acc = 0; envia(); }
        hud(['❤️'.repeat(Math.max(0, G.vidas)) + '🖤'.repeat(Math.max(0, 3 - G.vidas)), '🏁 Fase ' + G.fase + '/' + FASES, '🪙 ' + G.moedas]);
        if (!S) { placar.mostrar(null); O.fantasmas([]); return; }
        var lst = [], lin = [{ n: '⭐ ' + S.nick, v: 'Fase ' + G.fase, me: true }];
        S.outros().forEach(function (x, i) {
          var f = Math.floor(x.p / 1000), d = (x.p % 1000) / 10;
          lin.push({ n: x.n, v: x.s === 'fim' && f > FASES ? '🏆' : (f >= 1 ? 'Fase ' + Math.min(f, FASES) : '…') });
          if (f === G.fase && !G.emExtra && G.pista.fases[f - 1]) {
            var ph = G.pista.fases[f - 1], gx = ((K_hash(x.id) % 7) - 3) * .5, gz = ph.z0 - d, gy = O.topoEm(gx, gz); if (gy == null) gy = ph.y0;
            lst.push({ id: x.id, nome: x.n, x: gx, y: gy, z: gz, i: i });
          }
        });
        O.fantasmas(lst); placar.mostrar(lin);
      });
      function K_hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; }
      function fechar() {
        if (fechado) return; fechado = true;
        if (lobby) try { lobby.fechar(); } catch (e) {}
        if (S) try { S.parar(); } catch (e) {}
        painel.destruir(); O.destruir(); window.removeEventListener('keydown', onEsc);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (api.onClose) api.onClose();
      }
      menu();
    }
  };
})();
