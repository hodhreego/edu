(function() {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS['penalti'] = {
    nome: 'Pênalti ⚽',
    icone: '⚽',
    desc: 'Chute no gol da resposta certa',
    start: function(api) {
      var root = document.createElement('div');
      root.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;user-select:none;touch-action:none;overflow:hidden;font-family:sans-serif;';
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      root.appendChild(canvas);
      document.body.appendChild(root);

      var ctx = canvas.getContext('2d');
      var W = 0, H = 0, dpr = 1;
      var animId = null;
      var active = true;

      var colors = api.avatarColors || { skin: '#ffd1a4', shirt: '#ffcc00', pants: '#1e3c72', hair: '#4a2c00' };

      // Estado do Jogo
      var state = 'COUNTDOWN'; // COUNTDOWN, PLAY, KICK, RESULT_OK, RESULT_ERR, END
      var countVal = 3, countTimer = 0;
      var qIndex = 0, totalQ = 10, lives = 3, coins = 0, combo = 0, hits = 0;
      var curQ = null, options = [], correctIdx = -1;
      var selectedIdx = 0;
      var shake = 0;
      var confetti = [];
      var bannerTimer = 0;
      var explainText = '';

      // Física / Animação chute
      var ball = { x: 0, y: 0, startX: 0, startY: 0, targetX: 0, targetY: 0, t: 0, rot: 0, active: false };
      var gk = { x: 0, y: 0, targetX: 0, targetY: 0, diving: false, dir: 0 };
      var netShake = 0;
      var crowdJump = 0;

      // Gamepad Edge Detection
      var prevPad = { buttons: [], axes: [] };

      function resize() {
        dpr = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        resetPositions();
      }

      function resetPositions() {
        ball.x = W * 0.5;
        ball.y = H * 0.84;
        ball.t = 0;
        ball.active = false;
        gk.x = W * 0.5;
        gk.y = H * 0.50;
        gk.diving = false;
        gk.dir = 0;
      }

      window.addEventListener('resize', resize);
      resize();

      function closeGame() {
        if (!active) return;
        active = false;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        root.removeEventListener('pointerdown', onPointerDown);
        if (root.parentNode) root.parentNode.removeChild(root);
        api.onClose();
      }

      function nextQuestion() {
        if (qIndex >= totalQ || lives <= 0) {
          state = 'END';
          return;
        }
        qIndex++;
        var topics = api.topics();
        var tema = topics[Math.floor(Math.random() * topics.length)];
        curQ = api.B.make(api.ANO, tema, api.tier());
        
        var isEasy = api.easy();
        var wrongPool = (curQ.d || []).slice();
        // shuffle wrong
        for (var i = wrongPool.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = wrongPool[i]; wrongPool[i] = wrongPool[j]; wrongPool[j] = t;
        }
        options = [curQ.a];
        options.push(wrongPool[0] || 'Opção B');
        if (!isEasy && wrongPool.length > 1) {
          options.push(wrongPool[1]);
        }
        // Shuffle options
        for (var k = options.length - 1; k > 0; k--) {
          var m = Math.floor(Math.random() * (k + 1));
          var tmp = options[k]; options[k] = options[m]; options[m] = tmp;
        }
        correctIdx = options.indexOf(curQ.a);
        selectedIdx = Math.floor(options.length / 2);
        resetPositions();
        state = 'PLAY';
      }

      function triggerKick(choiceIdx) {
        if (state !== 'PLAY') return;
        selectedIdx = choiceIdx;
        state = 'KICK';

        var zones = getGoalZones();
        var targetZone = zones[choiceIdx];
        ball.startX = W * 0.5;
        ball.startY = H * 0.84;
        ball.targetX = targetZone.x + targetZone.w * 0.5;
        ball.targetY = targetZone.y + targetZone.h * 0.6;
        ball.t = 0;
        ball.active = true;

        var isCorrect = (choiceIdx === correctIdx);
        // Goleiro pula
        gk.diving = true;
        if (isCorrect) {
          // Pula para um setor errado!
          var badSectors = [];
          for (var i = 0; i < options.length; i++) {
            if (i !== choiceIdx) badSectors.push(i);
          }
          var diveSec = badSectors[Math.floor(Math.random() * badSectors.length)];
          var diveZone = zones[diveSec];
          gk.targetX = diveZone.x + diveZone.w * 0.5;
          gk.targetY = diveZone.y + diveZone.h * 0.55;
          gk.dir = (gk.targetX < W * 0.5) ? -1 : 1;
        } else {
          // Pula na bola e defende!
          gk.targetX = ball.targetX;
          gk.targetY = ball.targetY;
          gk.dir = (gk.targetX < W * 0.5) ? -1 : 1;
        }
      }

      function spawnConfetti() {if(window.RBX_FX&&!RBX_FX.on())return;
        confetti = [];
        for (var i = 0; i < 70; i++) {
          confetti.push({
            x: W * 0.5 + (Math.random() - 0.5) * 300,
            y: H * 0.45,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 10 - 4,
            size: Math.random() * 8 + 5,
            color: ['#ff0', '#00f', '#0f0', '#f00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
            rot: Math.random() * 6,
            vRot: Math.random() * 0.2 - 0.1
          });
        }
      }

      function getGoalZones() {
        var num = options.length;
        var goalW = Math.min(W * 0.88, 760);
        var goalH = Math.min(H * 0.32, 230);
        var goalX = (W - goalW) * 0.5;
        var goalY = H * 0.38;

        var zones = [];
        var secW = goalW / num;
        for (var i = 0; i < num; i++) {
          zones.push({
            x: goalX + i * secW,
            y: goalY,
            w: secW,
            h: goalH,
            text: options[i]
          });
        }
        return zones;
      }

      // Input Listeners
      function onKeyDown(e) {
        if (!active) return;
        var k = e.key;
        if (k === 'Escape') { closeGame(); return; }

        if (state === 'PLAY') {
          if (k === 'ArrowLeft') {
            selectedIdx = Math.max(0, selectedIdx - 1);
          } else if (k === 'ArrowRight') {
            selectedIdx = Math.min(options.length - 1, selectedIdx + 1);
          } else if (k === 'Enter' || k === ' ') {
            triggerKick(selectedIdx);
          } else if (k === '1' && options[0]) {
            triggerKick(0);
          } else if (k === '2' && options[1]) {
            triggerKick(1);
          } else if (k === '3' && options[2]) {
            triggerKick(2);
          }
        } else if (state === 'RESULT_ERR') {
          if (k === 'Enter' || k === ' ' || k === 'ArrowRight') {
            nextQuestion();
          }
        } else if (state === 'END') {
          if (k === 'Enter' || k === ' ') {
            restartGame();
          }
        }
      }
      window.addEventListener('keydown', onKeyDown);

      function onPointerDown(e) {
        if (!active) return;
        var rect = canvas.getBoundingClientRect();
        var px = e.clientX - rect.left;
        var py = e.clientY - rect.top;

        // Botão Fechar ✖ no topo direito
        if (px >= W - 58 && px <= W - 10 && py >= 10 && py <= 58) {
          closeGame();
          return;
        }

        if (state === 'PLAY') {
          var zones = getGoalZones();
          for (var i = 0; i < zones.length; i++) {
            var z = zones[i];
            if (px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h) {
              triggerKick(i);
              return;
            }
          }
        } else if (state === 'RESULT_ERR') {
          nextQuestion();
        } else if (state === 'END') {
          // Botões Jogar de Novo e Sair
          var btnW = 160, btnH = 50;
          var by = H * 0.68;
          var bx1 = W * 0.5 - btnW - 15;
          var bx2 = W * 0.5 + 15;
          if (px >= bx1 && px <= bx1 + btnW && py >= by && py <= by + btnH) {
            restartGame();
          } else if (px >= bx2 && px <= bx2 + btnW && py >= by && py <= by + btnH) {
            closeGame();
          }
        }
      }
      root.addEventListener('pointerdown', onPointerDown);

      function pollGamepad() {
        var gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
        if (!gp || !gp.buttons) return;

        var aBtn = gp.buttons[0] && gp.buttons[0].pressed;
        var bBtn = gp.buttons[1] && gp.buttons[1].pressed;
        var left = (gp.axes[0] < -0.4) || (gp.buttons[14] && gp.buttons[14].pressed);
        var right = (gp.axes[0] > 0.4) || (gp.buttons[15] && gp.buttons[15].pressed);

        var aPressed = aBtn && !prevPad.a;
        var bPressed = bBtn && !prevPad.b;
        var leftPressed = left && !prevPad.left;
        var rightPressed = right && !prevPad.right;

        prevPad = { a: aBtn, b: bBtn, left: left, right: right };

        if (state === 'PLAY') {
          if (leftPressed) selectedIdx = Math.max(0, selectedIdx - 1);
          if (rightPressed) selectedIdx = Math.min(options.length - 1, selectedIdx + 1);
          if (aPressed) triggerKick(selectedIdx);
        } else if (state === 'RESULT_ERR') {
          if (aPressed) nextQuestion();
        } else if (state === 'END') {
          if (aPressed) restartGame();
          if (bPressed) closeGame();
        }
      }

      function restartGame() {
        lives = 3;
        score = 0;
        coins = 0;
        combo = 0;
        hits = 0;
        qIndex = 0;
        countVal = 3;
        countTimer = 0;
        state = 'COUNTDOWN';
      }

      // Render helpers
      function wrapText(text, maxW) {
        var words = (text || '').split(' ');
        var lines = [];
        var cur = '';
        for (var i = 0; i < words.length; i++) {
          var test = cur ? cur + ' ' + words[i] : words[i];
          if (ctx.measureText(test).width > maxW && cur !== '') {
            lines.push(cur);
            cur = words[i];
          } else {
            cur = test;
          }
        }
        if (cur) lines.push(cur);
        return lines;
      }

      function drawBalloon(text, x, y, maxW) {
        ctx.save();
        var bob = Math.sin(Date.now() * 0.003) * 4;
        y += bob;

        ctx.font = 'bold 30px sans-serif';
        var lines = wrapText(text, maxW - 40);
        var fontSize = 30;
        while (lines.length > 3 && fontSize > 18) {
          fontSize -= 2;
          ctx.font = 'bold ' + fontSize + 'px sans-serif';
          lines = wrapText(text, maxW - 40);
        }

        var lineH = fontSize * 1.25;
        var padY = 22;
        var boxH = lines.length * lineH + padY * 2;
        var boxW = maxW;
        var bx = x - boxW * 0.5;
        var by = y;

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.roundRect(bx + 4, by + 4, boxW, boxH, 18);
        ctx.fill();

        // Balão branco
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#10356c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 18);
        ctx.fill();
        ctx.stroke();

        // Rabinho
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 14, by + boxH - 1);
        ctx.lineTo(x, by + boxH + 16);
        ctx.lineTo(x + 14, by + boxH - 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Linha branca de remendo para o rabinho
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 12, by + boxH - 3, 24, 4);

        // Etiqueta Laranja
        var tagW = 140, tagH = 26;
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.roundRect(bx + 20, by - 13, tagW, tagH, 8);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚽ PÊNALTI RBX', bx + 20 + tagW * 0.5, by);

        // Texto da Pergunta
        ctx.fillStyle = '#10356c';
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (var i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], x, by + padY + lineH * 0.5 + i * lineH);
        }

        ctx.restore();
      }

      function drawKicker(x, y, kicking) {
        ctx.save();
        ctx.translate(x, y);

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pernas
        ctx.strokeStyle = colors.pants;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        // Perna esquerda
        ctx.beginPath();
        ctx.moveTo(-8, -25);
        ctx.lineTo(-12, 0);
        ctx.stroke();
        // Perna direita (chute)
        ctx.beginPath();
        ctx.moveTo(8, -25);
        if (kicking) {
          ctx.lineTo(24, -10);
        } else {
          ctx.lineTo(12, 0);
        }
        ctx.stroke();

        // Chuteira
        ctx.fillStyle = '#111';
        ctx.fillRect(-16, -2, 10, 6);
        ctx.fillRect(kicking ? 20 : 8, kicking ? -12 : -2, 10, 6);

        // Tronco (camisa)
        ctx.fillStyle = colors.shirt;
        ctx.beginPath();
        ctx.roundRect(-14, -58, 28, 35, 6);
        ctx.fill();

        // Braços
        ctx.strokeStyle = colors.shirt;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-12, -50);
        ctx.lineTo(-24, kicking ? -35 : -25);
        ctx.moveTo(12, -50);
        ctx.lineTo(24, kicking ? -45 : -25);
        ctx.stroke();

        // Cabeça
        ctx.fillStyle = colors.skin;
        ctx.beginPath();
        ctx.arc(0, -70, 14, 0, Math.PI * 2);
        ctx.fill();

        // Cabelo
        ctx.fillStyle = colors.hair;
        ctx.beginPath();
        ctx.arc(0, -75, 14, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      function drawGoalkeeper(x, y, diving, dir) {
        ctx.save();
        ctx.translate(x, y);

        if (diving) {
          ctx.rotate(dir * 0.9);
        }

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, diving ? 30 : 6, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo
        ctx.fillStyle = '#00bcd4'; // Camisa Goleiro
        ctx.beginPath();
        ctx.roundRect(-14, -50, 28, 32, 6);
        ctx.fill();

        // Shorts
        ctx.fillStyle = '#222';
        ctx.fillRect(-12, -20, 24, 14);

        // Pernas
        ctx.strokeStyle = '#f5c6a5';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-7, -8);
        ctx.lineTo(-10, 8);
        ctx.moveTo(7, -8);
        ctx.lineTo(10, 8);
        ctx.stroke();

        // Braços esticados com luvas
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-12, -42);
        ctx.lineTo(-28, diving ? -55 : -35);
        ctx.moveTo(12, -42);
        ctx.lineTo(28, diving ? -55 : -35);
        ctx.stroke();

        // Luvas grandes laranjas
        ctx.fillStyle = '#ff7700';
        ctx.beginPath();
        ctx.arc(-30, diving ? -58 : -37, 7, 0, Math.PI * 2);
        ctx.arc(30, diving ? -58 : -37, 7, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça
        ctx.fillStyle = '#f5c6a5';
        ctx.beginPath();
        ctx.arc(0, -62, 13, 0, Math.PI * 2);
        ctx.fill();

        // Cabelo preto
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(0, -67, 13, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      function drawBall(x, y, r, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        // Sombra da bola no chão projetada
        ctx.restore();
        ctx.save();
        var groundY = H * 0.86;
        var altRatio = Math.max(0, 1 - (groundY - y) / (H * 0.4));
        ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * altRatio) + ')';
        ctx.beginPath();
        ctx.ellipse(x, groundY - (groundY - y) * 0.1, r * altRatio, r * 0.45 * altRatio, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        // Bola
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#222';
        ctx.stroke();

        // Pentágonos decorativos
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
        for (var a = 0; a < 5; a++) {
          var ang = a * (Math.PI * 2 / 5);
          var px = Math.cos(ang) * r * 0.75;
          var py = Math.sin(ang) * r * 0.75;
          ctx.beginPath();
          ctx.arc(px, py, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      function update(dt) {
        pollGamepad();

        if (shake > 0) shake = Math.max(0, shake - dt * 25);
        if (netShake > 0) netShake = Math.max(0, netShake - dt * 4);
        crowdJump += dt * 5;

        // Confetes
        for (var i = confetti.length - 1; i >= 0; i--) {
          var c = confetti[i];
          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.3; // gravidade
          c.rot += c.vRot;
          if (c.y > H + 50) confetti.splice(i, 1);
        }

        if (state === 'COUNTDOWN') {
          countTimer += dt;
          if (countTimer >= 0.8) {
            countTimer = 0;
            countVal--;
            if (countVal < 0) {
              nextQuestion();
            }
          }
        } else if (state === 'KICK') {
          ball.t += dt * 2.2;
          ball.rot += dt * 15;
          // Bezier quadrático
          var t = Math.min(1, ball.t);
          var arcH = -120;
          var bx = (1 - t) * (1 - t) * ball.startX + 2 * (1 - t) * t * ((ball.startX + ball.targetX) * 0.5) + t * t * ball.targetX;
          var by = (1 - t) * (1 - t) * ball.startY + 2 * (1 - t) * t * (Math.min(ball.startY, ball.targetY) + arcH) + t * t * ball.targetY;
          ball.x = bx;
          ball.y = by;

          // Goleiro se move
          gk.x += (gk.targetX - gk.x) * dt * 7;
          gk.y += (gk.targetY - gk.y) * dt * 7;

          if (ball.t >= 1) {
            ball.active = false;
            if (selectedIdx === correctIdx) {
              // Acertou!
              netShake = 15;
              state = 'RESULT_OK';
              bannerTimer = 1.8;
              combo++;
              hits++;
              var xpEarned = 5 + combo;
              coins += 1;
              api.gain(xpEarned, 1);
              api.log(curQ, true, 1);
              spawnConfetti();
            } else {
              // Errou!
              shake = 16;
              lives = Math.max(0, lives - 1);
              combo = 0;
              api.log(curQ, false, 1);
              state = 'RESULT_ERR';
              explainText = curQ.e || ('Resposta correta: ' + curQ.a);
            }
          }
        } else if (state === 'RESULT_OK') {
          bannerTimer -= dt;
          if (bannerTimer <= 0) {
            nextQuestion();
          }
        }
      }

      function draw() {
        ctx.save();
        if (shake > 0) {
          var ox = (Math.random() - 0.5) * shake;
          var oy = (Math.random() - 0.5) * shake;
          ctx.translate(ox, oy);
        }

        var fieldY = H * 0.38;
        var bgOk = window.RBX_CENA && RBX_CENA.fundo(ctx, 0, 0, W, fieldY + 10, 'penalti', 0.35);

        if (!bgOk) {
          // Céu Degradê
          var skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
          skyGrad.addColorStop(0, '#2980b9');
          skyGrad.addColorStop(1, '#6dd5fa');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, W, H);

          // Sol brilhante
          ctx.fillStyle = '#fff7b2';
          ctx.beginPath();
          ctx.arc(W * 0.85, H * 0.12, 45, 0, Math.PI * 2);
          ctx.fill();

          // Arquibancada com torcida
          var standY = H * 0.22;
          var standH = H * 0.18;
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(0, standY, W, standH);

          // Cabeças da torcida balançando
          var crowdCols = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#ffffff', '#e67e22'];
          for (var cx = 15; cx < W; cx += 22) {
            for (var row = 0; row < 3; row++) {
              var cy = standY + 18 + row * 22;
              var jmp = (state === 'RESULT_OK' || (cx % 3 === 0)) ? Math.sin(crowdJump + cx) * 5 : 0;
              ctx.fillStyle = crowdCols[(cx + row * 3) % crowdCols.length];
              ctx.beginPath();
              ctx.arc(cx, cy + jmp, 7, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Transição suave entre o cenário e o gramado
        var trans = ctx.createLinearGradient(0, fieldY - 40, 0, fieldY + 12);
        trans.addColorStop(0, 'rgba(39,174,96,0)');
        trans.addColorStop(1, 'rgba(39,174,96,0.95)');
        ctx.fillStyle = trans;
        ctx.fillRect(0, fieldY - 40, W, 52);

        // Gramado Degradê
        var grassGrad = ctx.createLinearGradient(0, fieldY, 0, H);
        grassGrad.addColorStop(0, '#27ae60');
        grassGrad.addColorStop(0.3, '#2ecc71');
        grassGrad.addColorStop(1, '#1b8a47');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, fieldY, W, H - fieldY);

        // Faixas de grama cortada
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (var gy = fieldY; gy < H; gy += 45) {
          ctx.fillRect(0, gy, W, 22);
        }

        // Linhas do campo de pênalti
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Linha da grande área
        ctx.moveTo(W * 0.1, H);
        ctx.lineTo(W * 0.2, H * 0.65);
        ctx.lineTo(W * 0.8, H * 0.65);
        ctx.lineTo(W * 0.9, H);
        // Marca do pênalti
        ctx.arc(W * 0.5, H * 0.84, 5, 0, Math.PI * 2);
        ctx.stroke();

        // O GRANDE GOL COM OS ALVOS/SETORES
        var zones = getGoalZones();
        var goalW = Math.min(W * 0.88, 760);
        var goalH = Math.min(H * 0.32, 230);
        var goalX = (W - goalW) * 0.5;
        var goalY = H * 0.38;

        // Fundo da rede
        ctx.fillStyle = 'rgba(20, 20, 30, 0.45)';
        ctx.fillRect(goalX, goalY, goalW, goalH);

        // Grade da rede com vibração
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        var netOff = Math.sin(Date.now() * 0.05) * netShake;
        ctx.beginPath();
        for (var nx = goalX; nx <= goalX + goalW; nx += 16) {
          ctx.moveTo(nx + netOff, goalY);
          ctx.lineTo(nx, goalY + goalH);
        }
        for (var ny = goalY; ny <= goalY + goalH; ny += 16) {
          ctx.moveTo(goalX, ny);
          ctx.lineTo(goalX + goalW + netOff, ny);
        }
        ctx.stroke();

        // Setores de Alternativas (fundos e demarcações no gol)
        for (var zIdx = 0; zIdx < zones.length; zIdx++) {
          var z = zones[zIdx];
          var isSel = (zIdx === selectedIdx);

          ctx.save();
          // Caixa do setor
          ctx.fillStyle = isSel ? 'rgba(255, 230, 0, 0.35)' : 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(z.x + 3, z.y + 3, z.w - 6, z.h - 6);

          // Borda de seleção
          if (isSel) {
            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 5;
            ctx.strokeRect(z.x + 4, z.y + 4, z.w - 8, z.h - 8);
          } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(z.x + 3, z.y + 3, z.w - 6, z.h - 6);
          }
          ctx.restore();
        }

        // Traves brancas espessas
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#f8f9fa';
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(goalX, goalY + goalH);
        ctx.lineTo(goalX, goalY);
        ctx.lineTo(goalX + goalW, goalY);
        ctx.lineTo(goalX + goalW, goalY + goalH);
        ctx.stroke();

        // Goleiro (desenhado antes das placas para nunca tapar o texto)
        drawGoalkeeper(gk.x, gk.y, gk.diving, gk.dir);

        // Placas e Textos das Alternativas desenhados POR CIMA do goleiro e da rede
        for (var zIdx2 = 0; zIdx2 < zones.length; zIdx2++) {
          var z2 = zones[zIdx2];
          var isSel2 = (zIdx2 === selectedIdx);

          ctx.save();

          // Plaquinha no topo do setor com o número
          ctx.fillStyle = isSel2 ? '#ff9900' : '#1e3c72';
          ctx.beginPath();
          ctx.roundRect(z2.x + z2.w * 0.5 - 20, z2.y + 8, 40, 24, 6);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((zIdx2 + 1).toString(), z2.x + z2.w * 0.5, z2.y + 20);

          // Texto da alternativa e cálculo de quebras de linha
          ctx.font = 'bold 24px sans-serif';
          var optLines = wrapText(z2.text, z2.w - 28);
          var fSize = 24;
          while (optLines.length > 4 && fSize > 16) {
            fSize -= 2;
            ctx.font = 'bold ' + fSize + 'px sans-serif';
            optLines = wrapText(z2.text, z2.w - 28);
          }

          var lH = fSize * 1.25;
          var totalTxtH = optLines.length * lH;
          var textStartY = z2.y + z2.h * 0.5 - totalTxtH * 0.5 + 10;

          // Placa de fundo escura semitransparente por trás do texto
          var platePad = 8;
          var plateW = z2.w - 16;
          var plateH = totalTxtH + platePad * 2;
          var plateX = z2.x + 8;
          var plateY = textStartY - lH * 0.5 - platePad;

          ctx.fillStyle = isSel2 ? 'rgba(10, 22, 42, 0.88)' : 'rgba(0, 0, 0, 0.82)';
          ctx.beginPath();
          ctx.roundRect(plateX, plateY, plateW, plateH, 10);
          ctx.fill();
          ctx.strokeStyle = isSel2 ? '#ffe600' : 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = isSel2 ? 3 : 1.5;
          ctx.stroke();

          // Renderização do texto
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          for (var li = 0; li < optLines.length; li++) {
            var lineY = textStartY + li * lH;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 5;
            ctx.strokeText(optLines[li], z2.x + z2.w * 0.5, lineY);
            ctx.fillStyle = isSel2 ? '#fff7a0' : '#ffffff';
            ctx.fillText(optLines[li], z2.x + z2.w * 0.5, lineY);
          }

          // Seta animada acima se selecionado
          if (isSel2 && state === 'PLAY') {
            var arrowY = z2.y - 20 + Math.sin(Date.now() * 0.008) * 6;
            ctx.fillStyle = '#ffe600';
            ctx.beginPath();
            ctx.moveTo(z2.x + z2.w * 0.5, arrowY + 12);
            ctx.lineTo(z2.x + z2.w * 0.5 - 14, arrowY - 6);
            ctx.lineTo(z2.x + z2.w * 0.5 + 14, arrowY - 6);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.restore();
        }

        // Jogador Kicker na marca do pênalti
        drawKicker(W * 0.5 - 35, H * 0.85, (state === 'KICK'));

        // Bola
        if (state !== 'KICK') {
          drawBall(W * 0.5, H * 0.84, 15, 0);
        } else {
          var ballScale = 15 * (1 - ball.t * 0.35); // Bola diminui em perspectiva
          drawBall(ball.x, ball.y, ballScale, ball.rot);
        }

        // Confetes
        for (var cIdx = 0; cIdx < confetti.length; cIdx++) {
          var cf = confetti[cIdx];
          ctx.save();
          ctx.translate(cf.x, cf.y);
          ctx.rotate(cf.rot);
          ctx.fillStyle = cf.color;
          ctx.fillRect(-cf.size * 0.5, -cf.size * 0.5, cf.size, cf.size);
          ctx.restore();
        }

        // Balão da pergunta (no topo flutuando)
        if (curQ && (state === 'PLAY' || state === 'KICK' || state === 'RESULT_OK')) {
          var balloonW = Math.min(W * 0.92, 780);
          drawBalloon(curQ.q, W * 0.5, 75, balloonW);
        }

        // HUD Superior
        drawHUD();

        // Banner de GOL!
        if (state === 'RESULT_OK') {
          ctx.save();
          var scale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
          ctx.translate(W * 0.5, H * 0.45);
          ctx.scale(scale, scale);
          ctx.font = '900 68px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 10;
          ctx.strokeText('⚽ GOOOOL! ⚽', 0, 0);
          ctx.fillStyle = '#ffe600';
          ctx.fillText('⚽ GOOOOL! ⚽', 0, 0);
          ctx.restore();
        }

        // Contagem regressiva inicial 3, 2, 1, VAI!
        if (state === 'COUNTDOWN') {
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fillRect(0, 0, W, H);
          ctx.save();
          ctx.font = '900 90px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          var txt = countVal > 0 ? countVal.toString() : 'VAI!';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 10;
          ctx.strokeText(txt, W * 0.5, H * 0.5);
          ctx.fillStyle = '#ffcc00';
          ctx.fillText(txt, W * 0.5, H * 0.5);
          ctx.restore();
        }

        // Painel de Erro / Explicação
        if (state === 'RESULT_ERR') {
          drawErrorDialog();
        }

        // Tela de Fim de Jogo
        if (state === 'END') {
          drawEndScreen();
        }

        ctx.restore();
      }

      function drawHUD() {
        ctx.save();
        // Barra de progresso fina no topo
        var prog = (qIndex / totalQ);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, 5);
        ctx.fillStyle = '#00e676';
        ctx.fillRect(0, 0, W * prog, 5);

        // Vidas ❤️
        var heartStr = '';
        for (var i = 0; i < 3; i++) {
          heartStr += (i < lives) ? '❤️' : '🖤';
        }
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(heartStr, 16, 14);

        // Pergunta n/10
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        var qStr = 'Pergunta ' + (state === 'COUNTDOWN' ? 1 : qIndex) + '/' + totalQ;
        ctx.strokeText(qStr, 140, 15);
        ctx.fillText(qStr, 140, 15);

        // Moedas
        var coinStr = '🪙 ' + coins;
        ctx.strokeText(coinStr, 310, 15);
        ctx.fillText(coinStr, 310, 15);

        // Botão Fechar ✖ (canto superior direito)
        var btnX = W - 50, btnY = 12;
        ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, 38, 38, 8);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✖', btnX + 19, btnY + 19);

        ctx.restore();
      }

      function drawErrorDialog() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, W, H);

        var diaW = Math.min(W * 0.88, 560);
        var diaH = 310;
        var dx = (W - diaW) * 0.5;
        var dy = (H - diaH) * 0.5;

        // Caixa
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(dx, dy, diaW, diaH, 18);
        ctx.fill();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Título
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DEFENDEU! 🧤', W * 0.5, dy + 40);

        // Resposta Certa
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Resposta certa: ' + (curQ ? curQ.a : ''), W * 0.5, dy + 85);

        // Explicação
        ctx.fillStyle = '#333333';
        ctx.font = '16px sans-serif';
        var expLines = wrapText(explainText, diaW - 40);
        for (var i = 0; i < expLines.length; i++) {
          ctx.fillText(expLines[i], W * 0.5, dy + 130 + i * 22);
        }

        // Botão Continuar
        var btnW = 200, btnH = 46;
        var bx = W * 0.5 - btnW * 0.5;
        var by = dy + diaH - 65;
        ctx.fillStyle = '#1e3c72';
        ctx.beginPath();
        ctx.roundRect(bx, by, btnW, btnH, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Continuar ▶ (A)', W * 0.5, by + 28);
      }

      function drawEndScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, W, H);

        var diaW = Math.min(W * 0.9, 520);
        var diaH = 340;
        var dx = (W - diaW) * 0.5;
        var dy = (H - diaH) * 0.5;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(dx, dy, diaW, diaH, 20);
        ctx.fill();

        var isVictory = lives > 0;
        ctx.fillStyle = isVictory ? '#27ae60' : '#e74c3c';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isVictory ? 'FIM DE JOGO! 🏆' : 'FIM DE PARTIDA! ⚽', W * 0.5, dy + 50);

        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Gols Marcados: ' + hits + ' / ' + totalQ, W * 0.5, dy + 110);
        ctx.fillText('Moedas Conquistadas: 🪙 ' + coins, W * 0.5, dy + 155);

        // Botão Jogar de Novo
        var btnW = 160, btnH = 50;
        var by = dy + 230;
        var bx1 = W * 0.5 - btnW - 15;
        var bx2 = W * 0.5 + 15;

        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.roundRect(bx1, by, btnW, btnH, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('De Novo (A)', bx1 + btnW * 0.5, by + 30);

        // Botão Sair
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.roundRect(bx2, by, btnW, btnH, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Sair (B)', bx2 + btnW * 0.5, by + 30);
      }

      var lastTime = performance.now();
      function loop(now) {
        if (!active) return;
        var dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        update(dt);
        draw();
        animId = requestAnimationFrame(loop);
      }
      animId = requestAnimationFrame(loop);
    }
  };
})();