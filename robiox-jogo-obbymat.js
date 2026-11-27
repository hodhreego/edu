/* RobIox — Obby de Matemática ➗ : parkour 3D em que cada plataforma só aparece depois de resolver uma conta/problema do ano (6º–9º).
   20 plataformas, checkpoint a cada 5, 3 vidas (erro custa vida), dificuldade crescente; obstáculos só em metade das plataformas.
   Fantasmas dos colegas da turma (mesma fase) e largada simultânea opcional. Requer robiox-quiz-banco.js e robiox-quiz-kit.js. */
(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS.obbymat = {
    nome: 'Obby de Matemática ➗', icone: '➗', destaque: true, servidor: true,
    desc: 'Resolva a conta para a próxima plataforma aparecer — e pule até o topo!',
    start: function (api) {
      var K = window.RBX_QZKIT, QZ = window.RBX_QZ;
      if (!K || !QZ || !window.THREE) { try { api.say('Obby de Matemática: carregando…', 1800); } catch (e) {} if (api.onClose) api.onClose(); return; }
      var wrap = K.wrap(), fechado = false;
      var av = api.avatarColors || { skin: '#ffcc99', shirt: '#2563eb', pants: '#1e3a8a', hair: '#3f2a14' };
      var O = K.obby(wrap, { cores: av, ceu: 0xa5b4fc });
      if (!O) { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); if (api.onClose) api.onClose(); return; }
      var painel = K.painel(wrap), msg = K.msg(wrap), hud = K.hud(wrap), placar = K.placar(wrap);
      K.btnFechar(wrap, fechar);
      function onEsc(e) { if (e.key === 'Escape') fechar(); }
      window.addEventListener('keydown', onEsc);
      var ANO = K.ano(api), TIER = api.tier ? api.tier() : 2, FACIL = api.easy ? api.easy() : false;
      var TOTAL = 20, G = null, S = null, lobby = null, menuEl = null, fimEl = null;
      var COR = [0x60a5fa, 0x34d399, 0xfbbf24, 0xf472b6, 0xa78bfa, 0x22d3ee];

      function menu() {
        menuEl = document.createElement('div'); menuEl.className = 'qzl';
        var h = '<div class="box"><h2>➗ Obby de Matemática</h2><p>Cada conta certa faz a próxima plataforma surgir. Pule até a plataforma ' + TOTAL + '! Errou: −1 vida. Caiu: volta à plataforma atual.</p><p>Ano das contas:</p><div class="row">';
        [6, 7, 8, 9].forEach(function (a) { h += '<button data-a="' + a + '" class="' + (a === ANO ? 'y' : 'k') + '">' + a + 'º ano</button>'; });
        h += '</div><div class="row"><button class="g" data-m="j">▶ Jogar</button><button data-m="l">👥 Largada com a turma</button></div><p style="font-size:12px;opacity:.75">Setas/WASD + Espaço · no celular: joystick + PULAR · contas: 1–4.</p></div>';
        menuEl.innerHTML = h; wrap.appendChild(menuEl);
        menuEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        menuEl.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          if (b.dataset.a) { ANO = +b.dataset.a; [].forEach.call(menuEl.querySelectorAll('[data-a]'), function (x) { x.className = +x.dataset.a === ANO ? 'y' : 'k'; }); return; }
          tira();
          if (b.dataset.m === 'j') jogar(null);
          else lobby = K.lobby(wrap, { jogo: 'om' + ANO, titulo: 'Obby de Matemática · ' + ANO + 'º ano', minimo: 2, onSolo: function () { lobby = null; jogar(null); }, onSair: function () { lobby = null; menu(); }, onLargada: function (info) { lobby = null; jogar(info); } });
        });
        O.pausar(true);
      }
      function tira() { if (menuEl && menuEl.parentNode) menuEl.parentNode.removeChild(menuEl); menuEl = null; }
      function semDia() { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

      /* layout determinístico das plataformas (igual para todos da turma no dia / na largada) */
      function layout(seed) {
        var R = QZ.rng(seed), L = [{ x: 0, y: 0, z: 0, w: 7, d: 7, tipo: 'fixa' }], x = 0, y = 0, z = 0, wp = 7;
        for (var i = 1; i <= TOTAL; i++) {
          var dif = i / TOTAL, w = i % 5 === 0 ? 6 : Math.max(2.4, 4 - dif * 1.6), cd = 1.6 + dif * 2.2 + R() * .6 + (wp + w) / 2, ang = (R() - .5) * 1.1; wp = w;
          x = Math.max(-6, Math.min(6, x + Math.sin(ang) * cd)); z -= Math.cos(ang) * cd; y += -.3 + R() * (0.9 + dif * .5);
          /* obstáculo só em METADE das plataformas (ímpares), nunca no checkpoint */
          var tipo = 'fixa'; if (i % 2 === 1 && i % 5 !== 0 && i > 1) tipo = ['move', 'sobe', 'some', 'move'][Math.floor(R() * (i > 10 ? 4 : 2))];
          L.push({ x: x, y: y, z: z, w: w, d: w, tipo: tipo, amp: tipo === 'move' ? 1.6 + dif : 1.4, vel: .9 + dif * .7, fase: R() * 6 });
        }
        return L;
      }
      function jogar(info) {
        O.limpar();
        var L = layout(info ? info.seed : semDia() + ANO);
        G = { L: L, passo: 0, plats: [], vidas: 3, moedas: 0, acertos: 0, combo: 0, fim: false, ck: 0, t0: performance.now(), tag: info ? info.tag : 'solo', esperaPulo: false, nova: null, anima: [] };
        G.plats[0] = O.plat({ x: 0, y: 0, z: 0, w: 7, d: 7, cor: 0xfacc15 }); O.bandeira(-3.2, 0, 3.2, 0x22c55e);
        if (info) S = info.sala; else { S = K.sala({ jogo: 'om' + ANO }); if (!S.ativo) S = null; }
        if (S) S.set({ p: 1000, v: 3, s: G.tag });
        O.onMoeda = function () { G.moedas++; };
        O.onCair = cair;
        O.spawn(0, .2, 1.5);
        setTimeout(pergunta, 700);
      }
      function nivel() { return Math.max(1, Math.min(5, 1 + Math.floor(G.passo / 4) + (TIER - 2))); }
      function pergunta() {
        if (!G || G.fim) return;
        O.pausar(true);
        var q = QZ.mat(ANO, nivel());
        painel.perguntar({ q: q, alts: QZ.alts(q, FACIL ? 3 : 4), titulo: '➗ Plataforma ' + (G.passo + 1) + '/' + TOTAL, sub: ANO + 'º ano · nível ' + nivel(), cor: '#7c3aed', aguardar: 'erro' }, function (r) {
          painel.esconder(); O.pausar(false);
          try { api.log(q, r.ok, 1); } catch (e) {}
          if (r.ok) { G.acertos++; G.combo++; api.gain(6 + Math.min(G.combo, 10), 1); surgir(); }
          else {
            G.combo = 0; G.vidas--; K.beep(150, .4, 'sawtooth'); envia();
            if (G.vidas <= 0) { fimJogo(false); return; }
            msg('💔 −1 vida! Nova conta…', 1300); setTimeout(pergunta, 1300);
          }
        });
      }
      function surgir() {
        var i = G.passo + 1, d = G.L[i];
        var p = O.plat({ x: d.x, y: d.y - 6, z: d.z, w: d.w, d: d.d, cor: i % 5 === 0 ? 0xfacc15 : COR[i % COR.length], tipo: 'fixa' });
        p.alvoY = d.y; p.def = d; G.anima.push(p); G.plats[i] = p; G.nova = p;
        O.moeda(d.x, d.y + 1.4, d.z);
        if (i % 5 === 0) O.bandeira(d.x - d.w / 2 + .4, d.y, d.z, 0x22c55e);
        msg(i === TOTAL ? '🏆 Última plataforma! Pule!' : '✨ Plataforma ' + i + ' surgiu! Pule!', 1300); K.beep(990, .15, 'triangle');
        G.esperaPulo = true;
      }
      function chegou() {
        G.esperaPulo = false; G.passo++; var d = G.L[G.passo];
        if (G.passo % 5 === 0) { G.ck = G.passo; msg('🚩 Checkpoint!', 1100); }
        envia();
        if (G.passo >= TOTAL) { api.gain(40 + G.vidas * 10, 3); fimJogo(true); return; }
        setTimeout(pergunta, 350);
      }
      function cair() {
        if (!G || G.fim) return;
        var d = G.L[G.passo]; G.combo = 0; msg('↩️ Caiu! De volta à plataforma ' + G.passo, 1100);
        var pl = G.plats[G.passo]; O.spawn(pl ? pl.x : d.x, (pl ? pl.y : d.y) + .3, pl ? pl.z : d.z);
      }
      function envia() { if (!S || !G) return; S.set({ p: (Math.floor(G.passo / 5) + 1) * 1000 + G.passo, v: G.vidas }); }
      function fimJogo(venceu) {
        G.fim = true; O.pausar(true); painel.esconder(); envia(); if (S) { S.set({ s: 'fim' }); S.agoraJa(); }
        if (G.moedas) api.gain(G.moedas, 0);
        var t = (performance.now() - G.t0) / 1000;
        fimEl = document.createElement('div'); fimEl.className = 'qzl';
        fimEl.innerHTML = '<div class="box"><h2>' + (venceu ? '🏆 Você chegou ao topo!' : '💀 Fim de jogo') + '</h2><p>' + (venceu ? 'Tempo: ' + Math.floor(t / 60) + ':' + ('0' + Math.floor(t % 60)).slice(-2) : 'Você chegou à plataforma ' + G.passo + ' de ' + TOTAL + '.') + '</p><p>✅ ' + G.acertos + ' contas certas · 🪙 ' + G.moedas + ' · ❤️ ' + G.vidas + '</p><div class="row"><button class="g" data-a="r">Jogar de novo</button><button class="k" data-a="m">Menu</button><button class="r" data-a="s">Sair</button></div></div>';
        wrap.appendChild(fimEl);
        fimEl.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        fimEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; fimEl.parentNode.removeChild(fimEl); fimEl = null; if (S) S.parar(); S = null; G = null; if (b.dataset.a === 's') fechar(); else if (b.dataset.a === 'm') menu(); else jogar(null); });
      }
      var acc = 0;
      O.loop(function (dt) {
        if (!G) { hud([]); placar.mostrar(null); return; }
        /* animação de surgimento: sobe de baixo; depois vira o tipo de obstáculo planejado */
        for (var i = G.anima.length - 1; i >= 0; i--) {
          var p = G.anima[i]; p.y += (p.alvoY - p.y) * Math.min(1, dt * 6);
          if (Math.abs(p.alvoY - p.y) < .03) { p.y = p.alvoY; p.y0 = p.alvoY; p.x0 = p.x; p.z0 = p.z; var d = p.def; p.tipo = d.tipo; p.amp = d.amp; p.vel = d.vel; p.fase = d.fase; p.t = 0; if (d.tipo === 'some') p.mesh.material = new THREE.MeshLambertMaterial({ color: p.mesh.material.color, transparent: true, opacity: 1 }); G.anima.splice(i, 1); }
        }
        if (G.esperaPulo && G.nova && O.P.chao === G.nova) chegou();
        acc += dt; if (acc > .5) { acc = 0; envia(); }
        hud(['❤️'.repeat(Math.max(0, G.vidas)) + '🖤'.repeat(Math.max(0, 3 - G.vidas)), '🪜 ' + G.passo + '/' + TOTAL, '🔥 ' + G.combo, '🪙 ' + G.moedas]);
        if (!S) { placar.mostrar(null); O.fantasmas([]); return; }
        var fase = Math.floor(G.passo / 5) + 1, lst = [], lin = [{ n: '⭐ ' + S.nick, v: 'Fase ' + fase + ' · ' + G.passo, me: true }];
        S.outros().forEach(function (x, i) {
          var f = Math.floor(x.p / 1000), st = x.p % 1000;
          lin.push({ n: x.n, v: x.s === 'fim' && st >= TOTAL ? '🏆' : (f >= 1 ? 'Fase ' + f + ' · ' + st : '…') });
          if (f === fase && G.L[st]) { var d = G.L[st], h = 0; for (var k = 0; k < x.id.length; k++) h = (h * 31 + x.id.charCodeAt(k)) % 97; lst.push({ id: x.id, nome: x.n, x: d.x + ((h % 5) - 2) * .5, y: d.y, z: d.z + ((h % 3) - 1) * .5, i: i }); }
        });
        O.fantasmas(lst); placar.mostrar(lin);
      });
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
