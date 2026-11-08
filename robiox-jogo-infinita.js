(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};

  var ID = 'infinita';
  var NOME = 'Matemática Infinita ♾️';
  var EMOJI = '♾️';
  var DESCRICAO = 'Corra sem parar escolhendo a resposta certa na pista!';

  window.RBX_JOGOS[ID] = {
    nome: NOME,
    icone: EMOJI,
    desc: DESCRICAO,
    start: function (api) {
      var dpr = window.devicePixelRatio || 1;
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;user-select:none;touch-action:none;font-family:sans-serif;';
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      wrap.appendChild(canvas);
      document.body.appendChild(wrap);

      var ctx = canvas.getContext('2d');
      var W = 0, H = 0;
      var animId = null;
      var destroyed = false;

      var colors = api.avatarColors || { skin: '#ffcc88', shirt: '#29b6f6', pants: '#1e88e5', hair: '#5d4037' };

      // Estado do Jogo
      var state = 'COUNTDOWN'; // COUNTDOWN, RUNNING, FEEDBACK, GAMEOVER
      var lives = 3;
      var score = 0;
      var sessionHigh = 0;
      var totalCoins = 0;
      var combo = 0;
      var countdownTimer = 3.5;
      var shakeTimer = 0;
      var zProgress = 0; // 0 a 1 em direção ao portal atual
      var speed = 0.2; // velocidade base (lenta)
      var lane = 1; // 0, 1, 2
      var targetLane = 1;
      var laneX = 0; // interpolação suave
      var particles = [];
      var coinsRain = [];

      var currentQ = null;
      var upcomingQs = []; // filas de perguntas futuras para render 3D

      var feedbackTimer = 0;
      var feedbackOk = false;

      function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      resize();
      window.addEventListener('resize', resize);

      function getQuestion() {
        try {
          var topics = api.topics ? api.topics() : ['Geral'];
          var top = topics[Math.floor(Math.random() * topics.length)];
          var qObj = api.B.make(api.ANO || 6, top, api.tier ? api.tier() : 1);
          var easy = api.easy ? api.easy() : false;
          var alts = [{ text: String(qObj.a), correct: true }];
          var wrongs = (qObj.d || []).slice(0);
          wrongs.sort(function () { return Math.random() - 0.5; });
          var neededWrongs = easy ? 1 : 2;
          for (var i = 0; i < neededWrongs; i++) {
            if (wrongs[i] !== undefined) {
              alts.push({ text: String(wrongs[i]), correct: false });
            } else {
              alts.push({ text: String(i + 1), correct: false });
            }
          }
          alts.sort(function () { return Math.random() - 0.5; });
          return { qData: qObj, alts: alts, numLanes: alts.length };
        } catch (e) {
          return {
            qData: { q: 'Quanto é 2 + 2?', a: '4', e: '2 somado a 2 resulta em 4.' },
            alts: [{ text: '4', correct: true }, { text: '3', correct: false }, { text: '5', correct: false }],
            numLanes: 3
          };
        }
      }

      function initTrack() {
        currentQ = getQuestion();
        upcomingQs = [getQuestion(), getQuestion()];
        zProgress = 0;
        lane = Math.floor(currentQ.numLanes / 2);
        targetLane = lane;
        laneX = lane;
      }
      initTrack();

      // Botão fechar
      function closeGame() {
        if (destroyed) return;
        destroyed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        wrap.removeEventListener('pointerdown', onPointerDown);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (api.onClose) api.onClose();
      }

      // Input Teclado
      function onKeyDown(e) {
        if (state === 'FEEDBACK') {
          feedbackTimer = 0;
          return;
        }
        if (state === 'GAMEOVER') {
          if (e.key === 'Enter' || e.code === 'Space') restartGame();
          if (e.key === 'Escape') closeGame();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          if (targetLane > 0) targetLane--;
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          if (targetLane < (currentQ ? currentQ.numLanes - 1 : 2)) targetLane++;
        } else if (e.key === '1') {
          targetLane = 0;
        } else if (e.key === '2') {
          targetLane = Math.min(1, (currentQ ? currentQ.numLanes - 1 : 1));
        } else if (e.key === '3') {
          targetLane = Math.min(2, (currentQ ? currentQ.numLanes - 1 : 2));
        } else if (e.key === 'Escape') {
          closeGame();
        }
      }
      window.addEventListener('keydown', onKeyDown);

      // Input Toque / Mouse
      function onPointerDown(e) {
        var x = e.clientX, y = e.clientY;
        // Botão Fechar no canto superior direito
        if (x > W - 60 && y < 60) {
          closeGame();
          return;
        }
        if (state === 'FEEDBACK') {
          feedbackTimer = 0;
          return;
        }
        if (state === 'GAMEOVER') {
          // Botão reiniciar vs sair
          if (y > H * 0.6 && y < H * 0.72) {
            restartGame();
          } else if (y >= H * 0.72 && y < H * 0.84) {
            closeGame();
          }
          return;
        }
        // Faixas de toque
        if (currentQ) {
          var wLane = W / currentQ.numLanes;
          var clickedLane = Math.floor(x / wLane);
          if (clickedLane >= 0 && clickedLane < currentQ.numLanes) {
            targetLane = clickedLane;
          }
        }
      }
      wrap.addEventListener('pointerdown', onPointerDown);

      // Gamepad
      var lastPadX = 0, lastPadA = false, lastPadB = false;
      function checkGamepad() {
        var gps = navigator.getGamepads ? navigator.getGamepads() : [];
        if (!gps) return;
        var gp = gps[0] || gps[1];
        if (!gp) return;

        var ax = gp.axes[0] || 0;
        var dLeft = gp.buttons[14] && gp.buttons[14].pressed;
        var dRight = gp.buttons[15] && gp.buttons[15].pressed;
        var btnA = gp.buttons[0] && gp.buttons[0].pressed;
        var btnB = gp.buttons[1] && gp.buttons[1].pressed;

        if (state === 'RUNNING') {
          if ((ax < -0.5 || dLeft) && lastPadX >= -0.5 && !dLeft) {
            if (targetLane > 0) targetLane--;
          } else if ((ax > 0.5 || dRight) && lastPadX <= 0.5 && !dRight) {
            if (targetLane < (currentQ ? currentQ.numLanes - 1 : 2)) targetLane++;
          }
        } else if (state === 'FEEDBACK') {
          if (btnA && !lastPadA) feedbackTimer = 0;
        } else if (state === 'GAMEOVER') {
          if (btnA && !lastPadA) restartGame();
          if (btnB && !lastPadB) closeGame();
        }
        lastPadX = ax;
        lastPadA = btnA;
        lastPadB = btnB;
      }

      function spawnConfetti(x, y) {if(window.RBX_FX&&!RBX_FX.on())return;
        for (var i = 0; i < 35; i++) {
          particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.8) * 15,
            color: ['#ffeb3b', '#ff4081', '#00e676', '#00e5ff', '#ff9100'][Math.floor(Math.random() * 5)],
            size: 6 + Math.random() * 8,
            life: 1
          });
        }
      }

      function spawnCoinsRain() {
        for (var i = 0; i < 30; i++) {
          coinsRain.push({
            x: Math.random() * W,
            y: -20 - Math.random() * 100,
            vy: 5 + Math.random() * 7,
            size: 16 + Math.random() * 8,
            rot: Math.random() * Math.PI,
            rotSpeed: 0.1 + Math.random() * 0.1
          });
        }
      }

      function restartGame() {
        lives = 3;
        score = 0;
        combo = 0;
        speed = 0.2;
        state = 'COUNTDOWN';
        countdownTimer = 3.5;
        initTrack();
      }

      function onGatePass() {
        var chosenAlt = currentQ.alts[targetLane];
        if (!chosenAlt) chosenAlt = currentQ.alts[0];

        if (chosenAlt.correct) {
          score++;
          if (score > sessionHigh) sessionHigh = score;
          combo++;
          var gainCoins = 1;
          totalCoins += gainCoins;
          if (api.gain) api.gain(5 + combo, gainCoins);
          if (api.log) api.log(currentQ.qData, true, 1);
          if (api.say) api.say('BOA!', 800);
          spawnConfetti(W * 0.5, H * 0.5);
          if (combo % 5 === 0) {
            spawnCoinsRain();
          }
          speed = Math.min(0.4, speed + 0.006);
          advanceTrack();
        } else {
          lives--;
          combo = 0;
          shakeTimer = 0.4;
          if (api.log) api.log(currentQ.qData, false, 1);
          feedbackOk = false;
          state = 'FEEDBACK';
          feedbackTimer = 3.0; // 3 segundos ou toque
        }
      }

      function advanceTrack() {
        currentQ = upcomingQs.shift();
        upcomingQs.push(getQuestion());
        zProgress = 0;
        if (targetLane >= currentQ.numLanes) {
          targetLane = currentQ.numLanes - 1;
        }
      }

      function drawBalloon(text, tag) {
        var bw = Math.min(W * 0.88, 700);
        var bx = (W - bw) / 2;
        var by = 58;
        var bh = Math.min(H * 0.26, 190);

        ctx.save();
        // Sombra balão
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        roundRect(bx + 4, by + 6, bw, bh, 20);
        ctx.fill();

        // Fundo e borda balão
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0277bd';
        ctx.lineWidth = 5;
        roundRect(bx, by, bw, bh, 20);
        ctx.fill();
        ctx.stroke();

        // Rabinho do balão
        ctx.beginPath();
        ctx.moveTo(W / 2 - 15, by + bh);
        ctx.lineTo(W / 2, by + bh + 14);
        ctx.lineTo(W / 2 + 15, by + bh);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0277bd';
        ctx.lineWidth = 5;
        ctx.stroke();
        // cobrir borda interna rabinho
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(W / 2 - 13, by + bh - 4, 26, 6);

        // Tag superior laranja
        var tagW = 190, tagH = 26;
        var tagX = bx + 25, tagY = by - 13;
        ctx.fillStyle = '#ff6f00';
        roundRect(tagX, tagY, tagW, tagH, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tag || NOME, tagX + tagW / 2, tagY + 17);

        // Texto da Pergunta auto-ajustável
        ctx.fillStyle = '#1a237e';
        ctx.textAlign = 'center';
        fitAndWrapText(text, bx + bw / 2, by + bh / 2 + 6, bw - 40, bh - 30, 40, 24);
        ctx.restore();
      }

      function fitAndWrapText(text, x, y, maxW, maxH, startSize, minSize) {
        var size = startSize;
        while (size >= minSize) {
          ctx.font = 'bold ' + size + 'px sans-serif';
          var lines = wrapTextLines(text, maxW);
          var lineH = size * 1.2;
          if (lines.length * lineH <= maxH) {
            var startY = y - ((lines.length - 1) * lineH) / 2;
            for (var i = 0; i < lines.length; i++) {
              ctx.fillText(lines[i], x, startY + i * lineH);
            }
            return;
          }
          size -= 2;
        }
        ctx.font = 'bold ' + minSize + 'px sans-serif';
        var finalLines = wrapTextLines(text, maxW);
        var finalH = minSize * 1.1;
        var sY = y - ((finalLines.length - 1) * finalH) / 2;
        for (var j = 0; j < Math.min(finalLines.length, 3); j++) {
          ctx.fillText(finalLines[j], x, sY + j * finalH);
        }
      }

      function wrapTextLines(text, maxW) {
        var words = String(text).split(' ');
        var lines = [];
        var cur = '';
        for (var i = 0; i < words.length; i++) {
          var test = cur ? cur + ' ' + words[i] : words[i];
          if (ctx.measureText(test).width <= maxW) {
            cur = test;
          } else {
            if (cur) lines.push(cur);
            cur = words[i];
          }
        }
        if (cur) lines.push(cur);
        return lines;
      }

      function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y + w, x, y, r);
        ctx.closePath();
      }

      // Projeção 3D da pista
      var horizonY = 0;
      function project3D(laneIdx, totalLanes, depth) {
        var p = Math.max(0.01, depth);
        var scale = 1 / (1 + p * 1.8);
        var y = horizonY + (H - horizonY) * scale;
        var trackWidth = W * 0.95 * scale;
        var laneWidth = trackWidth / totalLanes;
        var startX = (W - trackWidth) / 2;
        var x = startX + (laneIdx + 0.5) * laneWidth;
        return { x: x, y: y, scale: scale, laneWidth: laneWidth };
      }

      // Desenhar personagem estilo blox
      function drawAvatar(x, y, scale, isTripped) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        if (isTripped) {
          ctx.rotate(0.5);
          ctx.translate(0, 30);
        }

        var runCycle = Math.sin(Date.now() * 0.015);
        var legSwing = isTripped ? 0 : runCycle * 14;

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pernas (Blocos)
        ctx.fillStyle = colors.pants;
        ctx.fillRect(-18, -40 + legSwing, 14, 40);
        ctx.fillRect(4, -40 - legSwing, 14, 40);

        // Tronco
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(-22, -85, 44, 48);

        // Braços
        var armSwing = isTripped ? 0 : -runCycle * 15;
        ctx.fillRect(-34, -85 + armSwing, 10, 42);
        ctx.fillRect(24, -85 - armSwing, 10, 42);

        // Cabeça
        ctx.fillStyle = colors.skin;
        ctx.fillRect(-16, -118, 32, 30);

        // Cabelo
        ctx.fillStyle = colors.hair;
        ctx.fillRect(-18, -125, 36, 12);
        ctx.fillRect(-18, -120, 6, 16);
        ctx.fillRect(12, -120, 6, 16);

        ctx.restore();
      }

      function drawGates(qObj, depthOffset) {
        var num = qObj.numLanes;
        var pLeft = project3D(0, num, depthOffset);
        var pRight = project3D(num - 1, num, depthOffset);
        var totalW = pRight.x - pLeft.x + pLeft.laneWidth;
        var gateX = pLeft.x - pLeft.laneWidth / 2;
        var gateY = pLeft.y;
        var gateH = 140 * pLeft.scale;

        // Placa / Portal da Pergunta acima das faixas
        if (depthOffset > 0.4) {
          var signW = Math.min(totalW * 0.9, 500 * pLeft.scale);
          var signH = 65 * pLeft.scale;
          var signX = W / 2 - signW / 2;
          var signY = gateY - gateH - signH - 5;
          ctx.fillStyle = 'rgba(2, 119, 189, 0.9)';
          roundRect(signX, signY, signW, signH, 8 * pLeft.scale);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3 * pLeft.scale;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.font = 'bold ' + Math.max(10, 16 * pLeft.scale) + 'px sans-serif';
          var shortQ = qObj.qData.q;
          if (shortQ.length > 35) shortQ = shortQ.substr(0, 32) + '...';
          ctx.fillText(shortQ, W / 2, signY + signH * 0.65);
        }

        // Portais de cada alternativa
        for (var i = 0; i < num; i++) {
          var p = project3D(i, num, depthOffset);
          var gw = p.laneWidth * 0.92;
          var gx = p.x - gw / 2;
          var gy = p.y - gateH;

          // Pilares
          ctx.fillStyle = '#0288d1';
          ctx.fillRect(gx, gy, 8 * p.scale, gateH);
          ctx.fillRect(gx + gw - 8 * p.scale, gy, 8 * p.scale, gateH);

          // Topo portal
          ctx.fillStyle = '#01579b';
          ctx.fillRect(gx, gy, gw, 18 * p.scale);

          // Painel de vidro brilhante da alternativa
          var isChosen = (state === 'RUNNING' && Math.round(laneX) === i && depthOffset < 0.6);
          ctx.fillStyle = isChosen ? 'rgba(76, 175, 80, 0.55)' : 'rgba(3, 169, 244, 0.35)';
          ctx.fillRect(gx + 6 * p.scale, gy + 18 * p.scale, gw - 12 * p.scale, gateH - 18 * p.scale);

          // Moldura
          ctx.strokeStyle = isChosen ? '#ffeb3b' : '#ffffff';
          ctx.lineWidth = (isChosen ? 4 : 2) * p.scale;
          ctx.strokeRect(gx + 6 * p.scale, gy + 18 * p.scale, gw - 12 * p.scale, gateH - 18 * p.scale);

          // Texto Alternativa
          var altText = qObj.alts[i].text;
          var fSize = Math.max(14, 28 * p.scale);
          ctx.font = 'bold ' + fSize + 'px sans-serif';
          ctx.textAlign = 'center';

          // Contorno escuro para legibilidade máxima
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4 * p.scale;
          ctx.strokeText(altText, p.x, gy + gateH * 0.55);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(altText, p.x, gy + gateH * 0.55);

          // Número da faixa (1, 2, 3) no topo
          ctx.fillStyle = '#ffe082';
          ctx.font = 'bold ' + Math.max(10, 14 * p.scale) + 'px sans-serif';
          ctx.fillText('[' + (i + 1) + ']', p.x, gy + 14 * p.scale);
        }
      }

      function drawClouds(time) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (var i = 0; i < 6; i++) {
          var cx = ((i * 240 + time * 15) % (W + 300)) - 150;
          var cy = 40 + (i % 3) * 35;
          ctx.beginPath();
          ctx.arc(cx, cy, 35, 0, Math.PI * 2);
          ctx.arc(cx + 25, cy - 10, 30, 0, Math.PI * 2);
          ctx.arc(cx + 50, cy, 32, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      var lastFrameTime = performance.now();
      function loop(now) {
        if (destroyed) return;
        animId = requestAnimationFrame(loop);

        var dt = (now - lastFrameTime) / 1000;
        if (dt > 0.1) dt = 0.1;
        dt *= (window.RBX_SPEED || 1);
        lastFrameTime = now;

        checkGamepad();

        // Shake
        var sx = 0, sy = 0;
        if (shakeTimer > 0) {
          shakeTimer -= dt;
          sx = (Math.random() - 0.5) * 14;
          sy = (Math.random() - 0.5) * 14;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.translate(sx, sy);

        horizonY = H * 0.44;
        var bgOk = window.RBX_CENA && RBX_CENA.fundo(ctx, 0, 0, W, H, 'infinita', 0.5);

        if (!bgOk) {
          // Céu com gradiente alegre
          var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
          skyGrad.addColorStop(0, '#29b6f6');
          skyGrad.addColorStop(0.5, '#81d4fa');
          skyGrad.addColorStop(1, '#b3e5fc');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, W, H);

          // Sol brilhante
          ctx.fillStyle = '#fff59d';
          ctx.beginPath();
          ctx.arc(W * 0.85, horizonY * 0.4, 55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
          ctx.beginPath();
          ctx.arc(W * 0.85, horizonY * 0.4, 75, 0, Math.PI * 2);
          ctx.fill();

          drawClouds(now * 0.001);

          // Ilhas e montanhas no fundo
          ctx.fillStyle = '#80deea';
          ctx.beginPath();
          ctx.moveTo(0, horizonY);
          ctx.lineTo(W * 0.2, horizonY - 40);
          ctx.lineTo(W * 0.45, horizonY);
          ctx.lineTo(W * 0.7, horizonY - 55);
          ctx.lineTo(W, horizonY);
          ctx.fill();
        }

        // Perspectiva da Pista Suspensa
        var pFarLeft = project3D(0, currentQ.numLanes, 3.5);
        var pFarRight = project3D(currentQ.numLanes - 1, currentQ.numLanes, 3.5);
        var pNearLeft = project3D(0, currentQ.numLanes, 0.05);
        var pNearRight = project3D(currentQ.numLanes - 1, currentQ.numLanes, 0.05);

        var trackFarW = pFarRight.x - pFarLeft.x + pFarLeft.laneWidth;
        var trackNearW = pNearRight.x - pNearLeft.x + pNearLeft.laneWidth;
        var farX = pFarLeft.x - pFarLeft.laneWidth / 2;
        var nearX = pNearLeft.x - pNearLeft.laneWidth / 2;

        // Base da pista (estilo bloco suspenso)
        ctx.fillStyle = '#0277bd';
        ctx.beginPath();
        ctx.moveTo(nearX, pNearLeft.y);
        ctx.lineTo(nearX + trackNearW, pNearLeft.y);
        ctx.lineTo(nearX + trackNearW, pNearLeft.y + 40);
        ctx.lineTo(nearX, pNearLeft.y + 40);
        ctx.fill();

        // Superfície da pista
        var trackGrad = ctx.createLinearGradient(0, horizonY, 0, H);
        trackGrad.addColorStop(0, '#e1f5fe');
        trackGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = trackGrad;
        ctx.beginPath();
        ctx.moveTo(farX, pFarLeft.y);
        ctx.lineTo(farX + trackFarW, pFarLeft.y);
        ctx.lineTo(nearX + trackNearW, pNearLeft.y);
        ctx.lineTo(nearX, pNearLeft.y);
        ctx.closePath();
        ctx.fill();

        // Bordas da pista (neon azul)
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(farX, pFarLeft.y);
        ctx.lineTo(nearX, pNearLeft.y);
        ctx.moveTo(farX + trackFarW, pFarLeft.y);
        ctx.lineTo(nearX + trackNearW, pNearLeft.y);
        ctx.stroke();

        // Divisórias das faixas pontilhadas
        for (var fl = 1; fl < currentQ.numLanes; fl++) {
          var pDivFar = project3D(fl, currentQ.numLanes, 3.5);
          var pDivNear = project3D(fl, currentQ.numLanes, 0.05);
          var dfX = pDivFar.x - pDivFar.laneWidth / 2;
          var dnX = pDivNear.x - pDivNear.laneWidth / 2;
          ctx.strokeStyle = 'rgba(2, 136, 209, 0.4)';
          ctx.lineWidth = 3;
          ctx.setLineDash([15, 15]);
          ctx.beginPath();
          ctx.moveTo(dfX, pDivFar.y);
          ctx.lineTo(dnX, pDivNear.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Lógica de corrida
        if (state === 'RUNNING') {
          zProgress += speed * dt;
          if (zProgress >= 1) {
            zProgress = 0;
            onGatePass();
          }
        }

        // Interpolação suave do boneco entre faixas
        laneX += (targetLane - laneX) * Math.min(1, dt * 14);

        // Desenhar filas de perguntas ao longe (3D fila infinita)
        if (upcomingQs[1]) {
          drawGates(upcomingQs[1], 2.2 - zProgress * 0.7);
        }
        if (upcomingQs[0]) {
          drawGates(upcomingQs[0], 1.5 - zProgress * 0.7);
        }
        if (currentQ) {
          drawGates(currentQ, 0.8 - zProgress * 0.7);
        }

        // Desenhar Avatar do Jogador
        var pPlayer = project3D(laneX, currentQ ? currentQ.numLanes : 3, 0.12);
        var isTripped = (state === 'FEEDBACK' && !feedbackOk);
        drawAvatar(pPlayer.x, pPlayer.y - 10, 0.85, isTripped);

        // Partículas de Acerto
        for (var pi = particles.length - 1; pi >= 0; pi--) {
          var pt = particles[pi];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.5;
          pt.life -= dt * 1.5;
          if (pt.life <= 0) {
            particles.splice(pi, 1);
            continue;
          }
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.life;
          ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
          ctx.globalAlpha = 1.0;
        }

        // Chuva de Moedas Bônus
        for (var ci = coinsRain.length - 1; ci >= 0; ci--) {
          var coin = coinsRain[ci];
          coin.y += coin.vy;
          coin.rot += coin.rotSpeed;
          ctx.save();
          ctx.translate(coin.x, coin.y);
          ctx.rotate(coin.rot);
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.ellipse(0, 0, coin.size, coin.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ff8f00';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
          if (coin.y > H + 50) coinsRain.splice(ci, 1);
        }

        // HUD Superior Organizado com Barra Semitransparente
        var hudH = 48;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.fillRect(0, 0, W, hudH);
        ctx.fillStyle = 'rgba(2, 119, 189, 0.2)';
        ctx.fillRect(0, hudH - 1, W, 1);

        // Botão Fechar [✖]
        var closeX = W - 22;
        var closeY = 24;
        var closeR = 14;
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.arc(closeX, closeY, closeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✖', closeX, closeY);
        ctx.textBaseline = 'alphabetic';

        // Coluna Esquerda: Vidas
        var heartStr = '';
        for (var h = 0; h < 3; h++) {
          heartStr += (h < lives) ? '❤️' : '🖤';
        }
        var leftX = 10;
        ctx.textAlign = 'left';
        ctx.font = '14px sans-serif';
        ctx.fillText(heartStr, leftX, 19);

        ctx.fillStyle = '#0277bd';
        ctx.font = 'bold 11px sans-serif';
        var lifeSub = (lives === 1 ? '1 vida' : lives + ' vidas');
        ctx.fillText(lifeSub, leftX, 38);
        var leftW = Math.max(ctx.measureText(heartStr).width, ctx.measureText(lifeSub).width);

        // Coluna Direita: Recorde e Moedas
        var rightX = closeX - closeR - 8;
        var recText = 'Recorde: ' + sessionHigh;
        var coinText = '🪙 ' + totalCoins;

        var recSize = 12;
        ctx.font = 'bold ' + recSize + 'px sans-serif';
        while (recSize > 9 && ctx.measureText(recText).width > 80) {
          recSize--;
          ctx.font = 'bold ' + recSize + 'px sans-serif';
        }
        ctx.textAlign = 'right';
        ctx.fillStyle = '#01579b';
        ctx.fillText(recText, rightX, 19);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#b78103';
        ctx.fillText(coinText, rightX, 38);
        var rightW = Math.max(ctx.measureText(recText).width, ctx.measureText(coinText).width);

        // Coluna Central: Pontos (com proteção anticolisão)
        var scoreText = 'Pontos: ' + score;
        var scoreSize = 15;
        var maxCenterW = Math.max(40, (rightX - rightW) - (leftX + leftW) - 16);
        ctx.font = 'bold ' + scoreSize + 'px sans-serif';
        while (scoreSize > 10 && ctx.measureText(scoreText).width > maxCenterW) {
          scoreSize--;
          ctx.font = 'bold ' + scoreSize + 'px sans-serif';
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = '#01579b';
        if (combo >= 2) {
          ctx.fillText(scoreText, W / 2, 19);
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#e65100';
          ctx.fillText('🔥 ' + combo + 'x COMBO', W / 2, 38);
        } else {
          ctx.fillText(scoreText, W / 2, 29);
        }

        // Balão Grande com Pergunta Atual no topo
        if (currentQ && (state === 'RUNNING' || state === 'COUNTDOWN')) {
          drawBalloon(currentQ.qData.q, NOME);
        }

        // Indicador de Faixa na tela (Dica para Toque / Controles)
        if (state === 'RUNNING') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Toque nas faixas ou use ← / → / [1, 2, 3]', W / 2, H - 20);
        }

        // Estado: CONTAGEM REGRESSIVA
        if (state === 'COUNTDOWN') {
          countdownTimer -= dt;
          var countNum = Math.ceil(countdownTimer);
          var txt = countNum > 0 ? (countNum > 3 ? 'PREPARE-SE!' : countNum) : 'VAI!';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#ffeb3b';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 6;
          ctx.font = '900 64px sans-serif';
          ctx.textAlign = 'center';
          ctx.strokeText(txt, W / 2, H * 0.52);
          ctx.fillText(txt, W / 2, H * 0.52);
          if (countdownTimer <= 0) {
            state = 'RUNNING';
          }
        }

        // Estado: FEEDBACK DE ERRO
        if (state === 'FEEDBACK') {
          feedbackTimer -= dt;
          var panelW = Math.min(W * 0.9, 560);
          var panelH = 260;
          var px = (W - panelW) / 2;
          var py = (H - panelH) / 2;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, 0, W, H);

          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#d32f2f';
          ctx.lineWidth = 6;
          roundRect(px, py, panelW, panelH, 20);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#d32f2f';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('OPS! VOCÊ ERROU ⚠️', W / 2, py + 45);

          ctx.fillStyle = '#2e7d32';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('Resposta certa: ' + currentQ.qData.a, W / 2, py + 85);

          ctx.fillStyle = '#37474f';
          fitAndWrapText('Explicação: ' + (currentQ.qData.e || 'Atenção ao cálculo!'), W / 2, py + 140, panelW - 40, 70, 17, 13);

          ctx.fillStyle = '#0288d1';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText('Toque ou aperte qualquer tecla para continuar (' + Math.ceil(feedbackTimer) + 's)', W / 2, py + 225);

          if (feedbackTimer <= 0) {
            if (lives <= 0) {
              state = 'GAMEOVER';
            } else {
              advanceTrack();
              state = 'RUNNING';
            }
          }
        }

        // Estado: GAMEOVER (Fim das Vidas)
        if (state === 'GAMEOVER') {
          ctx.fillStyle = 'rgba(0, 10, 30, 0.85)';
          ctx.fillRect(0, 0, W, H);

          var goW = Math.min(W * 0.88, 480);
          var goX = (W - goW) / 2;

          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#ff9800';
          ctx.lineWidth = 6;
          roundRect(goX, H * 0.18, goW, H * 0.68, 24);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#e65100';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('FIM DE JOGO! ♾️', W / 2, H * 0.28);

          ctx.fillStyle = '#263238';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText('Pontuação: ' + score, W / 2, H * 0.38);
          ctx.fillText('Melhor da Sessão: ' + sessionHigh, W / 2, H * 0.44);
          ctx.fillText('Moedas Ganhas: 🪙 ' + totalCoins, W / 2, H * 0.50);

          // Botão Jogar de Novo
          var btnW = goW * 0.75;
          var btnH = 50;
          var btnX = (W - btnW) / 2;
          var btnY1 = H * 0.61;
          ctx.fillStyle = '#4caf50';
          roundRect(btnX, btnY1, btnW, btnH, 14);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('🔄 JOGAR DE NOVO (A)', W / 2, btnY1 + 32);

          // Botão Sair
          var btnY2 = H * 0.73;
          ctx.fillStyle = '#e53935';
          roundRect(btnX, btnY2, btnW, btnH, 14);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillText('🚪 SAIR (B)', W / 2, btnY2 + 32);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    }
  };
})();