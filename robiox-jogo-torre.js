(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};

  var ID = 'torre';
  var NOME = 'Corrida de Torre 🏗️';
  var EMOJI = '🏗️';
  var DESCRICAO = 'Quanto mais rápido responder, mais blocos sobe!';

  window.RBX_JOGOS[ID] = {
    nome: NOME,
    icone: EMOJI,
    desc: DESCRICAO,
    start: function (api) {
      try {
        var container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.zIndex = '2147483000';
        container.style.backgroundColor = '#000';
        container.style.userSelect = 'none';
        container.style.webkitUserSelect = 'none';
        container.style.overflow = 'hidden';

        var canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        document.body.appendChild(container);

        var ctx = canvas.getContext('2d');
        var animId = null;
        var running = true;

        var W = 0, H = 0, dpr = 1;
        function resize() {
          dpr = window.devicePixelRatio || 1;
          W = window.innerWidth;
          H = window.innerHeight;
          canvas.width = W * dpr;
          canvas.height = H * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize);

        var av = api.avatarColors || { skin: '#ffdbac', shirt: '#e91e63', pants: '#3f51b5', hair: '#4a2c11' };
        var rivalColors = { skin: '#b2ebf2', shirt: '#0288d1', pants: '#01579b', hair: '#37474f' };

        var state = 'COUNTDOWN'; // COUNTDOWN, PLAYING, EXPLAIN, GAMEOVER
        var countTimer = 3.5;
        var currentQIndex = 0;
        var totalQ = 10;
        var lives = 3;
        var combo = 0;
        var coinsEarned = 0;

        var playerBlocks = 1;
        var rivalBlocks = 1;
        var targetPBlocks = 1;
        var targetRBlocks = 1;

        // A lava sobe conforme as perguntas avançam (0 = início, 1 = fim)
        var lavaProgress = 0;
        var lavaTargetProgress = 0;

        // ---- AO VIVO: quem está com a Torre aberta entra na disputa; o rival passa a ser um colega real ----
        var LIVE = !!(window.EDU_ENDPOINT && window.RBX_LOGIN && window.RBX_LOGIN !== 'mestre');
        var others = {}, livePoll = null, liveRivalKey = null, myNick = '';
        try { myNick = (window.RBX_NICK_ATUAL && window.RBX_NICK_ATUAL()) || ''; } catch (e) {}
        function liveSend(est) {
          if (!LIVE) return;
          var u = window.EDU_ENDPOINT + (window.EDU_ENDPOINT.indexOf('?') < 0 ? '?' : '&') + 'acao=rbxlive&sala=torre&login=' + encodeURIComponent(window.RBX_LOGIN) +
            '&nick=' + encodeURIComponent(myNick) + '&pos=' + Math.floor(targetPBlocks) + '&vidas=' + lives + '&est=' + (est || state);
          try {
            fetch(u).then(function (r) { return r.json(); }).then(function (d) {
              if (!d || !d.players) return;
              others = {};
              for (var k in d.players) if (k !== window.RBX_LOGIN && d.players[k].s !== 'saiu') others[k] = d.players[k];
              // rival = colega com altura mais próxima da minha (mantém o mesmo enquanto estiver online)
              if (!others[liveRivalKey]) {
                var best = null, bd = 1e9;
                for (var q in others) { var dd = Math.abs((others[q].p || 0) - targetPBlocks); if (dd < bd) { bd = dd; best = q; } }
                liveRivalKey = best;
              }
            }).catch(function () {});
          } catch (e) {}
        }
        if (LIVE) { liveSend('entrou'); livePoll = setInterval(function () { if (running) liveSend(); }, 2000); }
        function rivalLive() { return LIVE && liveRivalKey && others[liveRivalKey] ? others[liveRivalKey] : null; }

        var currentQ = null;
        var alts = [];
        var selectedAlt = 0;
        var qTime = 12;
        var rivalTargetTime = 0;
        var rivalAnswered = false;

        var shakeTime = 0;
        var particles = [];
        var bubbles = [];
        for (var bi = 0; bi < 25; bi++) {
          bubbles.push({ x: Math.random(), y: Math.random(), s: 5 + Math.random() * 15, sp: 0.2 + Math.random() * 0.5 });
        }

        var explainText = '';
        var explainCorrect = '';
        var clouds = [
          { x: 0.1, y: 0.12, s: 1 },
          { x: 0.45, y: 0.08, s: 1.3 },
          { x: 0.8, y: 0.15, s: 0.9 }
        ];

        var prevPadButtons = [];

        function addConfetti(x, y, count) {if(window.RBX_FX&&!RBX_FX.on())return;
          var colors = ['#f44336', '#e91e63', '#9c27b0', '#ffeb3b', '#4caf50', '#00e676', '#00e5ff'];
          for (var i = 0; i < count; i++) {
            var ang = Math.random() * Math.PI * 2;
            var spd = 2 + Math.random() * 8;
            particles.push({
              x: x, y: y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 3,
              c: colors[Math.floor(Math.random() * colors.length)],
              life: 1.0,
              size: 4 + Math.random() * 6
            });
          }
        }

        function nextQuestion() {
          if (currentQIndex >= totalQ || lives <= 0) {
            state = 'GAMEOVER';
            if (playerBlocks > rivalBlocks && lives > 0) {
              api.gain(15, 3);
              coinsEarned += 3;
              addConfetti(W * 0.5, H * 0.4, 60);
            }
            return;
          }
          currentQIndex++;
          lavaTargetProgress = Math.max(0, (currentQIndex - 1) / totalQ);
          var topics = api.topics ? api.topics() : ['geral'];
          var top = topics[Math.floor(Math.random() * topics.length)];
          var tLvl = api.tier ? api.tier() : 1;
          currentQ = api.B.make(api.ANO || 6, top, tLvl);
          
          var isEasy = api.easy ? api.easy() : false;
          var wrong = (currentQ.d || []).slice(0, isEasy ? 1 : 2);
          var arr = wrong.concat([currentQ.a]);
          for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          }
          alts = arr;
          selectedAlt = 0;
          qTime = 12.0;

          // Rival config
          rivalAnswered = false;
          rivalTargetTime = 3.5 + Math.random() * 6.5; // 3.5 a 10s
          state = 'PLAYING';
        }

        function handleAnswer(idx) {
          if (state !== 'PLAYING') return;
          var picked = alts[idx];
          var isRight = (picked === currentQ.a);
          if (isRight) {
            combo++;
            var earned = 1;
            if (qTime >= 9) earned = 4;
            else if (qTime >= 6) earned = 3;
            else if (qTime >= 3) earned = 2;
            targetPBlocks += earned;
            api.gain(5 + combo, 1);
            coinsEarned += 1;
            api.log(currentQ, true, 1);
            addConfetti(W * 0.35, H * 0.5, 30);
            nextQuestion();
          } else {
            combo = 0;
            lives--;
            shakeTime = 0.5;
            if (targetPBlocks > 1) targetPBlocks--;
            explainCorrect = currentQ.a;
            explainText = currentQ.e || 'A resposta correta é ' + currentQ.a;
            api.log(currentQ, false, 1);
            state = 'EXPLAIN';
          }
        }

        function update(dt) {
          for (var i = 0; i < clouds.length; i++) {
            clouds[i].x += 0.01 * dt;
            if (clouds[i].x > 1.2) clouds[i].x = -0.2;
          }
          for (var b = 0; b < bubbles.length; b++) {
            bubbles[b].y -= bubbles[b].sp * dt * 0.3;
            if (bubbles[b].y < 0) bubbles[b].y = 1;
          }

          playerBlocks += (targetPBlocks - playerBlocks) * Math.min(1, dt * 6);
          rivalBlocks += (targetRBlocks - rivalBlocks) * Math.min(1, dt * 6);
          lavaProgress += (lavaTargetProgress - lavaProgress) * Math.min(1, dt * 1.6);

          var rl = rivalLive(); if (rl) targetRBlocks = Math.max(1, rl.p || 1);
          if (shakeTime > 0) shakeTime -= dt;

          for (var p = particles.length - 1; p >= 0; p--) {
            var pt = particles[p];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.vy += 9.8 * dt * 3;
            pt.life -= dt * 1.2;
            if (pt.life <= 0) particles.splice(p, 1);
          }

          if (state === 'COUNTDOWN') {
            countTimer -= dt;
            if (countTimer <= 0) nextQuestion();
          } else if (state === 'PLAYING') {
            qTime -= dt;
            if (!rivalLive() && !rivalAnswered && (12 - qTime) >= rivalTargetTime) {
              rivalAnswered = true;
              var accRate = 0.5 + (api.tier ? api.tier() * 0.05 : 0.1);
              if (Math.random() < accRate) {
                targetRBlocks += Math.floor(1 + Math.random() * 3);
              }
            }
            if (qTime <= 0) {
              handleAnswer(-1); // Errou por tempo
            }
          }
          handleGamepad();
        }

        function handleGamepad() {
          var gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
          if (!gp) return;

          var justDown = function(idx) {
            var pressed = gp.buttons[idx] && gp.buttons[idx].pressed;
            var was = prevPadButtons[idx];
            return pressed && !was;
          };

          var ax = gp.axes[0] || 0;
          var leftP = justDown(14) || (ax < -0.5 && !prevPadButtons['axL']);
          var rightP = justDown(15) || (ax > 0.5 && !prevPadButtons['axR']);
          prevPadButtons['axL'] = ax < -0.5;
          prevPadButtons['axR'] = ax > 0.5;

          if (state === 'PLAYING') {
            if (leftP) selectedAlt = (selectedAlt - 1 + alts.length) % alts.length;
            if (rightP) selectedAlt = (selectedAlt + 1) % alts.length;
            if (justDown(0)) handleAnswer(selectedAlt);
          } else if (state === 'EXPLAIN') {
            if (justDown(0)) nextQuestion();
          } else if (state === 'GAMEOVER') {
            if (justDown(0)) restartGame();
            if (justDown(1)) close();
          }

          for (var i = 0; i < gp.buttons.length; i++) {
            prevPadButtons[i] = gp.buttons[i].pressed;
          }
        }

        function restartGame() {
          currentQIndex = 0;
          lives = 3;
          combo = 0;
          coinsEarned = 0;
          playerBlocks = 1;
          rivalBlocks = 1;
          targetPBlocks = 1;
          targetRBlocks = 1;
          lavaProgress = 0;
          lavaTargetProgress = 0;
          countTimer = 3.5;
          state = 'COUNTDOWN';
        }

        function close() {
          running = false;
          if (livePoll) { clearInterval(livePoll); try { liveSend('saiu'); } catch (e) {} }
          window.removeEventListener('resize', resize);
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('pointerdown', onPointerDown);
          if (animId) cancelAnimationFrame(animId);
          if (container && container.parentNode) container.parentNode.removeChild(container);
          if (api.onClose) api.onClose();
        }

        function onKeyDown(e) {
          if (e.key === 'Escape') { close(); return; }
          if (state === 'PLAYING') {
            if (e.key === '1') handleAnswer(0);
            if (e.key === '2' && alts.length > 1) handleAnswer(1);
            if (e.key === '3' && alts.length > 2) handleAnswer(2);
            if (e.key === 'ArrowLeft') selectedAlt = (selectedAlt - 1 + alts.length) % alts.length;
            if (e.key === 'ArrowRight') selectedAlt = (selectedAlt + 1) % alts.length;
            if (e.key === 'Enter' || e.key === ' ') handleAnswer(selectedAlt);
          } else if (state === 'EXPLAIN') {
            if (e.key === 'Enter' || e.key === ' ') nextQuestion();
          } else if (state === 'GAMEOVER') {
            if (e.key === 'Enter' || e.key === ' ') restartGame();
          }
        }

        var altRects = [];
        var btnCloseRect = { x: 0, y: 0, w: 40, h: 40 };
        var btnRestartRect = { x: 0, y: 0, w: 0, h: 0 };
        var btnExitRect = { x: 0, y: 0, w: 0, h: 0 };

        function onPointerDown(e) {
          var px = e.clientX;
          var py = e.clientY;

          // Close button
          if (px >= btnCloseRect.x && px <= btnCloseRect.x + btnCloseRect.w &&
              py >= btnCloseRect.y && py <= btnCloseRect.y + btnCloseRect.h) {
            close();
            return;
          }

          if (state === 'PLAYING') {
            for (var i = 0; i < altRects.length; i++) {
              var r = altRects[i];
              if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
                selectedAlt = i;
                handleAnswer(i);
                break;
              }
            }
          } else if (state === 'EXPLAIN') {
            nextQuestion();
          } else if (state === 'GAMEOVER') {
            if (px >= btnRestartRect.x && px <= btnRestartRect.x + btnRestartRect.w &&
                py >= btnRestartRect.y && py <= btnRestartRect.y + btnRestartRect.h) {
              restartGame();
            } else if (px >= btnExitRect.x && px <= btnExitRect.x + btnExitRect.w &&
                       py >= btnExitRect.y && py <= btnExitRect.y + btnExitRect.h) {
              close();
            }
          }
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('pointerdown', onPointerDown);

        function drawChar(cx, cy, csize, colors) {
          ctx.save();
          ctx.translate(cx, cy);
          // Pernas
          ctx.fillStyle = colors.pants;
          ctx.fillRect(-csize * 0.28, -csize * 0.4, csize * 0.24, csize * 0.4);
          ctx.fillRect(csize * 0.04, -csize * 0.4, csize * 0.24, csize * 0.4);
          // Tronco
          ctx.fillStyle = colors.shirt;
          ctx.fillRect(-csize * 0.32, -csize * 0.9, csize * 0.64, csize * 0.5);
          // Cabeça
          ctx.fillStyle = colors.skin;
          ctx.fillRect(-csize * 0.24, -csize * 1.35, csize * 0.48, csize * 0.45);
          // Cabelo
          ctx.fillStyle = colors.hair;
          ctx.fillRect(-csize * 0.26, -csize * 1.42, csize * 0.52, csize * 0.16);
          // Olhos
          ctx.fillStyle = '#000';
          ctx.fillRect(-csize * 0.14, -csize * 1.2, csize * 0.08, csize * 0.08);
          ctx.fillRect(csize * 0.06, -csize * 1.2, csize * 0.08, csize * 0.08);
          ctx.restore();
        }

        function drawWrappedText(txt, x, y, maxW, lineH, stroke) {
          var words = (txt || '').split(' ');
          var line = '';
          var startY = y;
          for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            if (metrics.width > maxW && n > 0) {
              if (stroke) ctx.strokeText(line, x, startY);
              ctx.fillText(line, x, startY);
              line = words[n] + ' ';
              startY += lineH;
            } else {
              line = testLine;
            }
          }
          if (stroke) ctx.strokeText(line, x, startY);
          ctx.fillText(line, x, startY);
          return startY + lineH;
        }

        var lastTime = performance.now();
        function loop(now) {
          if (!running) return;
          var dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;
          update(dt);

          ctx.save();
          if (shakeTime > 0) {
            var mag = shakeTime * 14;
            ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
          }

          // Cenário de obra ao pôr do sol (ou céu de reserva)
          var bgOk = window.RBX_CENA && RBX_CENA.fundo(ctx, 0, 0, W, H, 'torre', 0.5);
          if (!bgOk) {
            var skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.8);
            skyGrad.addColorStop(0, '#29b6f6');
            skyGrad.addColorStop(1, '#e1f5fe');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, W, H);

            // Sol
            ctx.fillStyle = '#fff176';
            ctx.beginPath();
            ctx.arc(W * 0.85, H * 0.15, Math.min(W, H) * 0.08, 0, Math.PI * 2);
            ctx.fill();

            // Nuvens
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            for (var ci = 0; ci < clouds.length; ci++) {
              var cl = clouds[ci];
              var cw = Math.min(W, H) * 0.18 * cl.s;
              ctx.beginPath();
              ctx.arc(cl.x * W, cl.y * H, cw * 0.4, 0, Math.PI * 2);
              ctx.arc(cl.x * W + cw * 0.3, cl.y * H - cw * 0.1, cw * 0.45, 0, Math.PI * 2);
              ctx.arc(cl.x * W + cw * 0.6, cl.y * H, cw * 0.35, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Zona do meio (Torres e Lava)
          var midTop = H * 0.28;
          var midBottom = H * 0.68;
          var towerBaseY = midBottom;
          var maxLavaRise = (midBottom - midTop) * 0.55;
          var lavaY = towerBaseY - lavaProgress * maxLavaRise;

          // Torres e Câmera
          var maxBlocks = Math.max(playerBlocks, rivalBlocks, 5);
          var blockH = Math.min((midBottom - midTop) * 0.75 / maxBlocks, 35);
          var blockW = Math.max(blockH * 1.8, Math.min(W, H) * 0.12);

          var pBaseX = W * 0.32;
          var rBaseX = W * 0.68;

          // Desenho das torres
          function drawTower(baseX, count, mainCol, darkCol) {
            for (var b = 0; b < Math.floor(count); b++) {
              var by = towerBaseY - (b + 1) * blockH;
              ctx.fillStyle = mainCol;
              ctx.fillRect(baseX - blockW / 2, by, blockW, blockH - 2);
              ctx.fillStyle = darkCol;
              ctx.fillRect(baseX - blockW / 2, by + blockH - 6, blockW, 4);
              ctx.strokeStyle = '#222';
              ctx.lineWidth = 2;
              ctx.strokeRect(baseX - blockW / 2, by, blockW, blockH - 2);
            }
            var frac = count - Math.floor(count);
            if (frac > 0.05) {
              var fby = towerBaseY - (Math.floor(count) + frac) * blockH;
              ctx.fillStyle = mainCol;
              ctx.fillRect(baseX - blockW / 2, fby, blockW, (blockH - 2) * frac);
            }
          }

          drawTower(pBaseX, playerBlocks, '#e91e63', '#ad1457');
          drawTower(rBaseX, rivalBlocks, '#00bcd4', '#00838f');

          // Personagens sobre as torres
          var pCharY = towerBaseY - playerBlocks * blockH;
          var rCharY = towerBaseY - rivalBlocks * blockH;
          var charSize = Math.max(blockH * 1.5, 24);
          drawChar(pBaseX, pCharY, charSize, av);
          drawChar(rBaseX, rCharY, charSize, rivalColors);

          // Rótulos dos personagens
          ctx.font = 'bold ' + Math.max(12, Math.floor(charSize * 0.35)) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 3;
          ctx.strokeText('VOCÊ (' + Math.floor(playerBlocks) + ')', pBaseX, pCharY - charSize * 1.55);
          ctx.fillText('VOCÊ (' + Math.floor(playerBlocks) + ')', pBaseX, pCharY - charSize * 1.55);

          var rlab = rivalLive() ? String(rivalLive().n || liveRivalKey).slice(0, 12).toUpperCase() : 'RIVAL';
          ctx.strokeText(rlab + ' (' + Math.floor(rivalBlocks) + ')', rBaseX, rCharY - charSize * 1.55);
          ctx.fillText(rlab + ' (' + Math.floor(rivalBlocks) + ')', rBaseX, rCharY - charSize * 1.55);

          // Ranking ao vivo (canto direito)
          if (LIVE) {
            var ok = Object.keys(others), rk = ok.map(function (k) { return { n: others[k].n || k, p: others[k].p || 0 }; });
            rk.push({ n: 'Você', p: Math.floor(targetPBlocks), me: 1 });
            rk.sort(function (a, b) { return b.p - a.p; });
            var n6 = Math.min(rk.length, 6), px0 = W - 215;
            ctx.fillStyle = 'rgba(0,0,0,0.55)'; var py0 = Math.floor(H * 0.27); ctx.fillRect(px0, py0, 200, 28 + n6 * 22);
            ctx.textAlign = 'left'; ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 14px sans-serif'; ctx.lineWidth = 0;
            ctx.fillText('🔴 AO VIVO · ' + (ok.length + 1) + ' na torre', px0 + 8, py0 + 20);
            for (var ri = 0; ri < n6; ri++) {
              ctx.fillStyle = rk[ri].me ? '#69f0ae' : '#fff'; ctx.font = '13px sans-serif';
              ctx.fillText((ri + 1) + 'º ' + String(rk[ri].n).slice(0, 14) + ' · ' + rk[ri].p + ' blocos', px0 + 8, py0 + 42 + ri * 22);
            }
            ctx.textAlign = 'center'; ctx.lineWidth = 3;
          }

          // Mar de Lava
          var lavaGrad = ctx.createLinearGradient(0, lavaY, 0, H);
          lavaGrad.addColorStop(0, '#ff3d00');
          lavaGrad.addColorStop(0.4, '#ff9100');
          lavaGrad.addColorStop(1, '#dd2c00');
          ctx.fillStyle = lavaGrad;
          ctx.fillRect(0, lavaY, W, H - lavaY);

          // Superfície da lava ondulante
          ctx.fillStyle = '#ffea00';
          for (var lx = 0; lx < W; lx += 20) {
            var waveH = Math.sin((lx * 0.05) + now * 0.005) * 4;
            ctx.fillRect(lx, lavaY + waveH - 3, 20, 6);
          }

          // Bolhas de lava
          ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
          for (var bi2 = 0; bi2 < bubbles.length; bi2++) {
            var bb = bubbles[bi2];
            var bx = bb.x * W;
            var by = lavaY + bb.y * (H - lavaY);
            ctx.beginPath();
            ctx.arc(bx, by, bb.s, 0, Math.PI * 2);
            ctx.fill();
          }

          // HUD Superior
          ctx.fillStyle = '#fff';
          ctx.font = 'bold ' + Math.max(15, Math.floor(W * 0.022)) + 'px sans-serif';
          ctx.textAlign = 'left';
          var hudText = '❤️ ' + lives + '  |  Questão: ' + currentQIndex + '/' + totalQ + '  |  🪙 ' + coinsEarned;
          ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
          ctx.strokeText(hudText, 20, 32);
          ctx.fillText(hudText, 20, 32);

          // Botão Sair ✖
          btnCloseRect = { x: W - 48, y: 10, w: 38, h: 38 };
          ctx.fillStyle = '#f44336';
          ctx.beginPath();
          ctx.arc(btnCloseRect.x + 19, btnCloseRect.y + 19, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('✖', btnCloseRect.x + 19, btnCloseRect.y + 26);

          // Partículas
          for (var pi = 0; pi < particles.length; pi++) {
            var prt = particles[pi];
            ctx.fillStyle = prt.c;
            ctx.globalAlpha = Math.max(0, prt.life);
            ctx.fillRect(prt.x - prt.size / 2, prt.y - prt.size / 2, prt.size, prt.size);
          }
          ctx.globalAlpha = 1.0;

          // Balão da pergunta (TOPO)
          if (state === 'PLAYING' || state === 'EXPLAIN') {
            var bubbleW = Math.min(W * 0.92, 760);
            var bubbleH = Math.max(H * 0.17, 85);
            var bubbleX = (W - bubbleW) / 2;
            var bubbleY = 46;

            // Fundo balão
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0d47a1';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 18);
            ctx.fill();
            ctx.stroke();

            // Rabinho
            ctx.beginPath();
            ctx.moveTo(bubbleX + bubbleW * 0.35, bubbleY + bubbleH);
            ctx.lineTo(bubbleX + bubbleW * 0.35 - 12, bubbleY + bubbleH + 14);
            ctx.lineTo(bubbleX + bubbleW * 0.35 + 16, bubbleY + bubbleH);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // Etiqueta laranja do jogo
            ctx.fillStyle = '#ff6f00';
            ctx.beginPath();
            ctx.roundRect(bubbleX + 20, bubbleY - 14, 150, 24, 6);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(NOME, bubbleX + 95, bubbleY + 3);

            // Barra de Tempo
            if (state === 'PLAYING') {
              var barW = (bubbleW - 40) * Math.max(0, qTime / 12);
              var barCol = qTime > 6 ? '#4caf50' : (qTime > 3 ? '#ff9800' : '#f44336');
              ctx.fillStyle = barCol;
              ctx.fillRect(bubbleX + 20, bubbleY + bubbleH - 8, barW, 5);
            }

            // Texto da pergunta
            var qFontSize = Math.min(Math.floor(bubbleH * 0.28), Math.floor(W * 0.04), 26);
            ctx.font = 'bold ' + qFontSize + 'px sans-serif';
            ctx.fillStyle = '#1a237e';
            ctx.textAlign = 'center';
            drawWrappedText(currentQ ? currentQ.q : '', W * 0.5, bubbleY + qFontSize * 1.3, bubbleW - 40, qFontSize * 1.25, false);

            // Alternativas (BASE)
            var botAreaY = Math.max(H * 0.72, towerBaseY + 15);
            var totalAltH = H - botAreaY - 15;
            var numAlts = alts.length;
            var isRow = W > 640;
            altRects = [];

            var altColors = ['#e91e63', '#2196f3', '#4caf50'];

            if (isRow) {
              var bw = (Math.min(W * 0.94, 850) - (numAlts - 1) * 15) / numAlts;
              var bh = Math.min(totalAltH, 75);
              var startX = (W - (bw * numAlts + (numAlts - 1) * 15)) / 2;
              for (var ai = 0; ai < numAlts; ai++) {
                var bx = startX + ai * (bw + 15);
                var by = botAreaY + (totalAltH - bh) / 2;
                altRects.push({ x: bx, y: by, w: bw, h: bh });
              }
            } else {
              var vh = Math.min((totalAltH - (numAlts - 1) * 8) / numAlts, 55);
              var vw = Math.min(W * 0.92, 420);
              var vStartX = (W - vw) / 2;
              for (var vi = 0; vi < numAlts; vi++) {
                var vy = botAreaY + vi * (vh + 8);
                altRects.push({ x: vStartX, y: vy, w: vw, h: vh });
              }
            }

            var btnFontSize = Math.max(16, Math.min(24, Math.floor(altRects[0].h * 0.45)));
            ctx.font = 'bold ' + btnFontSize + 'px sans-serif';
            ctx.textAlign = 'center';

            for (var a = 0; a < altRects.length; a++) {
              var rct = altRects[a];
              var isSel = (a === selectedAlt);
              ctx.save();
              ctx.fillStyle = altColors[a % altColors.length];
              ctx.beginPath();
              ctx.roundRect(rct.x, rct.y, rct.w, rct.h, 12);
              ctx.fill();
              ctx.lineWidth = isSel ? 6 : 3;
              ctx.strokeStyle = isSel ? '#ffeb3b' : '#ffffff';
              ctx.stroke();

              // Número indicador
              ctx.fillStyle = 'rgba(0,0,0,0.2)';
              ctx.beginPath();
              ctx.arc(rct.x + 22, rct.y + rct.h / 2, 14, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 14px sans-serif';
              ctx.fillText((a + 1) + '', rct.x + 22, rct.y + rct.h / 2 + 5);

              // Texto
              ctx.font = 'bold ' + btnFontSize + 'px sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 3;
              drawWrappedText(alts[a], rct.x + rct.w * 0.52, rct.y + rct.h * 0.58, rct.w - 55, btnFontSize * 1.1, true);
              ctx.restore();
            }
          }

          // Modal de Explicação
          if (state === 'EXPLAIN') {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, 0, W, H);

            var expW = Math.min(W * 0.88, 540);
            var expH = Math.min(H * 0.5, 300);
            var expX = (W - expW) / 2;
            var expY = (H - expH) / 2;

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(expX, expY, expW, expH, 16);
            ctx.fill();
            ctx.lineWidth = 4; ctx.strokeStyle = '#f44336'; ctx.stroke();

            ctx.fillStyle = '#d32f2f';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('OPS! Resposta Incorreta', W / 2, expY + 40);

            ctx.fillStyle = '#1b5e20';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText('Certa: ' + explainCorrect, W / 2, expY + 75);

            ctx.fillStyle = '#333333';
            ctx.font = '16px sans-serif';
            drawWrappedText(explainText, W / 2, expY + 115, expW - 40, 22, false);

            ctx.fillStyle = '#1976d2';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('Toque ou pressione Enter / A para continuar', W / 2, expY + expH - 24);
          }

          // Tela de Contagem
          if (state === 'COUNTDOWN') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ffeb3b';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.textAlign = 'center';
            ctx.font = 'bold ' + Math.min(W * 0.18, 90) + 'px sans-serif';
            var numTxt = Math.ceil(countTimer) > 0 ? (Math.ceil(countTimer) > 3 ? '3' : Math.ceil(countTimer)) : 'VAI!';
            ctx.strokeText(numTxt, W / 2, H / 2);
            ctx.fillText(numTxt, W / 2, H / 2);
          }

          // Tela de Game Over / Vitória
          if (state === 'GAMEOVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);

            var win = playerBlocks > rivalBlocks && lives > 0;
            var tie = Math.floor(playerBlocks) === Math.floor(rivalBlocks) && lives > 0;

            var resTitle = win ? '🎉 VOCÊ VENCEU! 🎉' : (tie ? 'EMPATE!' : 'O Rival Venceu!');
            var titleCol = win ? '#ffeb3b' : (tie ? '#81d4fa' : '#ef5350');

            ctx.fillStyle = titleCol;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.font = 'bold ' + Math.min(W * 0.08, 44) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeText(resTitle, W / 2, H * 0.32);
            ctx.fillText(resTitle, W / 2, H * 0.32);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('Sua Torre: ' + Math.floor(playerBlocks) + ' blocos   |   Rival: ' + Math.floor(rivalBlocks) + ' blocos', W / 2, H * 0.42);
            ctx.fillText('Moedas coletadas: 🪙 ' + coinsEarned, W / 2, H * 0.48);

            // Botão Jogar de Novo
            var bW = Math.min(W * 0.38, 190);
            var bH = 50;
            btnRestartRect = { x: W * 0.5 - bW - 10, y: H * 0.58, w: bW, h: bH };
            ctx.fillStyle = '#4caf50';
            ctx.beginPath();
            ctx.roundRect(btnRestartRect.x, btnRestartRect.y, btnRestartRect.w, btnRestartRect.h, 10);
            ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Jogar de Novo (A)', btnRestartRect.x + bW / 2, btnRestartRect.y + 32);

            // Botão Sair
            btnExitRect = { x: W * 0.5 + 10, y: H * 0.58, w: bW, h: bH };
            ctx.fillStyle = '#e53935';
            ctx.beginPath();
            ctx.roundRect(btnExitRect.x, btnExitRect.y, btnExitRect.w, btnExitRect.h, 10);
            ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Sair (B)', btnExitRect.x + bW / 2, btnExitRect.y + 32);
          }

          ctx.restore();
          animId = requestAnimationFrame(loop);
        }

        animId = requestAnimationFrame(loop);
      } catch (err) {
        if (api.onClose) api.onClose();
      }
    }
  };
})();
