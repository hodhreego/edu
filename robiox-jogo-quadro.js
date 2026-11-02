(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};

  var ID = 'quadro';
  var NOME = 'Quadro Gigante 🧠';
  var EMOJI = '🧠';
  var DESCRICAO = 'Responda no quadro gigante';

  window.RBX_JOGOS[ID] = {
    nome: NOME,
    icone: EMOJI,
    desc: DESCRICAO,
    start: function (api) {
      var wrap = document.createElement('div');
      wrap.style.position = 'fixed';
      wrap.style.inset = '0';
      wrap.style.zIndex = '2147483000';
      wrap.style.background = '#87CEEB';
      wrap.style.userSelect = 'none';
      wrap.style.webkitUserSelect = 'none';
      wrap.style.touchAction = 'none';

      var cv = document.createElement('canvas');
      cv.style.width = '100%';
      cv.style.height = '100%';
      cv.style.display = 'block';
      wrap.appendChild(cv);
      document.body.appendChild(wrap);

      var ctx = cv.getContext('2d');
      var W = 0, H = 0, dpr = 1;
      var rafId = null;

      // Estado do jogo
      var state = 'COUNTDOWN'; // COUNTDOWN, PLAYING, EXPLANATION, RESULT
      var countTime = 3.8;
      var qIndex = 0;
      var maxQ = 10;
      var lives = 3;
      var coinsEarned = 0;
      var score = 0;
      var combo = 0;
      var skipsLeft = 2;
      var hintsLeft = 2;

      var currentQ = null;
      var alts = []; // { text, correct, origIdx, disabled: bool }
      var selectedAlt = 0;
      var isTroll = false;

      // Visual / Personagem
      var playerX = 0.5; // normalizado 0..1
      var targetPlayerX = 0.5;
      var playerJump = 0;
      var shake = 0;
      var bannerTimer = 0;
      var goodTextTimer = 0;
      var particles = [];

      // Gamepad edge trigger
      var lastAxesX = 0;
      var fontIndex = 0;
      try {
        var savedFont = localStorage.getItem('rbx_quadro_fonte');
        if (savedFont !== null) fontIndex = parseInt(savedFont, 10) || 0;
      } catch (e) {}
      try {
        var f = new FontFace('Playwrite BR', 'url(playwrite-br.ttf)');
        f.load().then(function(loaded) { document.fonts.add(loaded); }).catch(function() {});
      } catch (e) {}
      var lastBtnA = false;
      var lastBtnB = false;

      // Botões de tela / Touch bounds
      var btnCloseRect = { x: 0, y: 0, w: 44, h: 44 };
      var btnSkipRect = { x: 0, y: 0, r: 28 };
      var btnHintRect = { x: 0, y: 0, r: 28 };
      var altRects = [];
      var resBtnRetry = { x: 0, y: 0, w: 160, h: 50 };
      var resBtnClose = { x: 0, y: 0, w: 160, h: 50 };
      var btnFontRect = { x: 0, y: 0, w: 56, h: 26 };

      var colors = api.avatarColors || { skin: '#F5C48E', shirt: '#0088FE', pants: '#1C3144', hair: '#4A2A0C' };

      function resize() {
        dpr = window.devicePixelRatio || 1;
        W = wrap.clientWidth;
        H = wrap.clientHeight;
        cv.width = W * dpr;
        cv.height = H * dpr;
      }
      window.addEventListener('resize', resize);
      resize();

      function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
        return arr;
      }

      function nextQuestion() {
        if (qIndex >= maxQ || lives <= 0) {
          state = 'RESULT';
          return;
        }
        qIndex++;
        isTroll = (qIndex % 4 === 0);
        var topics = (api.topics && api.topics()) || ['Geral'];
        var tema = topics[Math.floor(Math.random() * topics.length)];
        var tier = (api.tier && api.tier()) || 1;
        currentQ = api.B.make(api.ANO || 6, tema, tier);

        var list = [{ text: currentQ.a, correct: true }];
        var dist = (currentQ.d || []).slice();
        shuffle(dist);
        var want = (api.easy && api.easy()) ? 1 : 2;
        for (var i = 0; i < want && i < dist.length; i++) {
          list.push({ text: dist[i], correct: false });
        }
        shuffle(list);
        alts = list.map(function (it, idx) {
          return { text: it.text, correct: it.correct, disabled: false, id: idx };
        });

        selectedAlt = 0;
        targetPlayerX = 0.5;
        state = 'PLAYING';
      }

      function triggerConfetti() {
        for (var i = 0; i < 40; i++) {
          particles.push({
            x: W * 0.5,
            y: H * 0.4,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.8) * 14,
            color: ['#FF1493', '#00FF7F', '#FFD700', '#00BFFF', '#FF4500'][Math.floor(Math.random() * 5)],
            size: Math.random() * 7 + 5,
            life: 1.0
          });
        }
      }

      function chooseAnswer(index) {
        if (state !== 'PLAYING') return;
        var alt = alts[index];
        if (!alt || alt.disabled) return;

        selectedAlt = index;
        playerJump = 1.0;
        var ok = alt.correct;
        api.log(currentQ, ok, 1);

        if (ok) {
          combo++;
          score++;
          var reward = (5 + combo) * (isTroll ? 2 : 1);
          var cGain = 1 * (isTroll ? 2 : 1);
          coinsEarned += cGain;
          api.gain(reward, cGain);
          goodTextTimer = 1.2;
          triggerConfetti();
          setTimeout(function () {
            if (state === 'PLAYING') nextQuestion();
          }, 700);
        } else {
          combo = 0;
          lives--;
          shake = 15;
          state = 'EXPLANATION';
        }
      }

      function useHint() {
        if (state !== 'PLAYING' || hintsLeft <= 0) return;
        var wrong = alts.filter(function (a) { return !a.correct && !a.disabled; });
        if (wrong.length > 0) {
          hintsLeft--;
          var chosen = wrong[Math.floor(Math.random() * wrong.length)];
          chosen.disabled = true;
          if (alts[selectedAlt].disabled) {
            for (var i = 0; i < alts.length; i++) {
              if (!alts[i].disabled) { selectedAlt = i; break; }
            }
          }
        }
      }

      function useSkip() {
        if (state !== 'PLAYING' || skipsLeft <= 0) return;
        skipsLeft--;
        api.log(currentQ, false, 0);
        nextQuestion();
      }

      function destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        wrap.removeEventListener('pointerdown', onPointerDown);
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        api.onClose();
      }

      function onPointerDown(e) {
        var rect = cv.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        // Botão de Fonte
        if (x >= btnFontRect.x && x <= btnFontRect.x + btnFontRect.w &&
            y >= btnFontRect.y && y <= btnFontRect.y + btnFontRect.h) {
          fontIndex = (fontIndex + 1) % 3;
          try { localStorage.setItem('rbx_quadro_fonte', fontIndex); } catch (err) {}
          return;
        }

        // Fechar
        if (x >= btnCloseRect.x && x <= btnCloseRect.x + btnCloseRect.w &&
            y >= btnCloseRect.y && y <= btnCloseRect.y + btnCloseRect.h) {
          destroy();
          return;
        }

        if (state === 'COUNTDOWN') {
          countTime = 0.1;
          return;
        }

        if (state === 'EXPLANATION') {
          nextQuestion();
          return;
        }

        if (state === 'RESULT') {
          if (x >= resBtnRetry.x && x <= resBtnRetry.x + resBtnRetry.w &&
              y >= resBtnRetry.y && y <= resBtnRetry.y + resBtnRetry.h) {
            qIndex = 0; lives = 3; score = 0; combo = 0;
            skipsLeft = 2; hintsLeft = 2; coinsEarned = 0;
            state = 'COUNTDOWN'; countTime = 3.5;
            return;
          }
          if (x >= resBtnClose.x && x <= resBtnClose.x + resBtnClose.w &&
              y >= resBtnClose.y && y <= resBtnClose.y + resBtnClose.h) {
            destroy();
            return;
          }
          return;
        }

        if (state === 'PLAYING') {
          // Checa Pular
          var dSkip = Math.hypot(x - btnSkipRect.x, y - btnSkipRect.y);
          if (dSkip <= btnSkipRect.r) { useSkip(); return; }

          // Checa Dica
          var dHint = Math.hypot(x - btnHintRect.x, y - btnHintRect.y);
          if (dHint <= btnHintRect.r) { useHint(); return; }

          // Checa Alternativas
          for (var i = 0; i < altRects.length; i++) {
            var r = altRects[i];
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
              chooseAnswer(i);
              return;
            }
          }
        }
      }

      function onKeyDown(e) {
        if (e.key === 'Escape') { destroy(); return; }

        if (state === 'COUNTDOWN') {
          countTime = 0.1;
          return;
        }
        if (state === 'EXPLANATION') {
          if (e.key === 'Enter' || e.key === ' ') nextQuestion();
          return;
        }
        if (state === 'RESULT') {
          if (e.key === 'Enter' || e.key === ' ') {
            qIndex = 0; lives = 3; score = 0; combo = 0;
            skipsLeft = 2; hintsLeft = 2; coinsEarned = 0;
            state = 'COUNTDOWN'; countTime = 3.5;
          }
          return;
        }

        if (state === 'PLAYING') {
          if (e.key === 'ArrowLeft') {
            selectedAlt = Math.max(0, selectedAlt - 1);
            while (selectedAlt > 0 && alts[selectedAlt].disabled) selectedAlt--;
          } else if (e.key === 'ArrowRight') {
            selectedAlt = Math.min(alts.length - 1, selectedAlt + 1);
            while (selectedAlt < alts.length - 1 && alts[selectedAlt].disabled) selectedAlt++;
          } else if (e.key === 'Enter' || e.key === ' ') {
            chooseAnswer(selectedAlt);
          } else if (e.key === '1' && alts[0]) {
            chooseAnswer(0);
          } else if (e.key === '2' && alts[1]) {
            chooseAnswer(1);
          } else if (e.key === '3' && alts[2]) {
            chooseAnswer(2);
          } else if (e.key === 'p' || e.key === 'P') {
            useSkip();
          } else if (e.key === 'd' || e.key === 'D') {
            useHint();
          }
        }
      }

      wrap.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('keydown', onKeyDown);

      // Wrap text helper com auto-fit
      function wrapText(ctx, text, maxWidth) {
        var words = (text || '').split(' ');
        var lines = [];
        var cur = '';
        for (var i = 0; i < words.length; i++) {
          var test = cur ? (cur + ' ' + words[i]) : words[i];
          if (ctx.measureText(test).width <= maxWidth) {
            cur = test;
          } else {
            if (cur) lines.push(cur);
            cur = words[i];
          }
        }
        if (cur) lines.push(cur);
        return lines.length ? lines : [''];
      }

      // Loop principal de renderização
      var lastTimestamp = 0;
      function loop(ts) {
        if (!lastTimestamp) lastTimestamp = ts;
        var dt = Math.min((ts - lastTimestamp) / 1000, 0.1);
        lastTimestamp = ts;

        updateGamepad();
        update(dt);
        render();

        rafId = requestAnimationFrame(loop);
      }

      function updateGamepad() {
        var gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
        if (!gp) return;

        var ax = gp.axes[0] || 0;
        var btnA = !!(gp.buttons[0] && gp.buttons[0].pressed);
        var btnB = !!(gp.buttons[1] && gp.buttons[1].pressed);
        var dLeft = !!(gp.buttons[14] && gp.buttons[14].pressed);
        var dRight = !!(gp.buttons[15] && gp.buttons[15].pressed);

        var moveLeft = (ax < -0.4 && lastAxesX >= -0.4) || dLeft;
        var moveRight = (ax > 0.4 && lastAxesX <= 0.4) || dRight;
        var pressA = btnA && !lastBtnA;
        var pressB = btnB && !lastBtnB;

        lastAxesX = ax;
        lastBtnA = btnA;
        lastBtnB = btnB;

        if (pressB) {
          if (state === 'RESULT') destroy();
          else if (state === 'PLAYING') useSkip();
          return;
        }

        if (state === 'COUNTDOWN' && pressA) {
          countTime = 0.1;
        } else if (state === 'EXPLANATION' && pressA) {
          nextQuestion();
        } else if (state === 'RESULT' && pressA) {
          qIndex = 0; lives = 3; score = 0; combo = 0;
          skipsLeft = 2; hintsLeft = 2; coinsEarned = 0;
          state = 'COUNTDOWN'; countTime = 3.5;
        } else if (state === 'PLAYING') {
          if (moveLeft) {
            selectedAlt = Math.max(0, selectedAlt - 1);
            while (selectedAlt > 0 && alts[selectedAlt].disabled) selectedAlt--;
          }
          if (moveRight) {
            selectedAlt = Math.min(alts.length - 1, selectedAlt + 1);
            while (selectedAlt < alts.length - 1 && alts[selectedAlt].disabled) selectedAlt++;
          }
          if (pressA) {
            chooseAnswer(selectedAlt);
          }
        }
      }

      function update(dt) {
        if (shake > 0) {
          shake -= dt * 30;
          if (shake < 0) shake = 0;
        }
        if (goodTextTimer > 0) goodTextTimer -= dt;
        if (playerJump > 0) {
          playerJump -= dt * 3;
          if (playerJump < 0) playerJump = 0;
        }

        if (state === 'COUNTDOWN') {
          countTime -= dt;
          if (countTime <= 0) {
            nextQuestion();
          }
        }

        // Interpolação da posição do boneco
        if (altRects[selectedAlt]) {
          var targetNorm = (altRects[selectedAlt].x + altRects[selectedAlt].w * 0.5) / W;
          playerX += (targetNorm - playerX) * 0.2;
        }

        // Partículas
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.4; // gravidade
          p.life -= dt * 1.5;
          if (p.life <= 0) particles.splice(i, 1);
        }
      }

      function render() {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, W, H);

        if (shake > 0) {
          ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
        }

        // Fundo Sala com Céu e Janela Gigante
        drawRoom();

        // Quadro Gigante + Pergunta
        drawBoard();

        // Botões / Plataformas de Alternativas
        if (state === 'PLAYING' || state === 'EXPLANATION') {
          drawPlatforms();
        }

        // Personagem de costas
        drawAvatar();

        // Partículas
        drawParticles();

        // HUD topo
        drawHUD();

        // Estados Especiais
        if (state === 'COUNTDOWN') drawCountdown();
        if (state === 'EXPLANATION') drawExplanation();
        if (state === 'RESULT') drawResult();

        if (goodTextTimer > 0) {
          ctx.save();
          ctx.font = '900 64px sans-serif';
          ctx.fillStyle = '#FFEB3B';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 8;
          ctx.textAlign = 'center';
          ctx.strokeText('BOA! 🔥', W * 0.5, H * 0.45);
          ctx.fillText('BOA! 🔥', W * 0.5, H * 0.45);
          ctx.restore();
        }

        ctx.restore();
      }

      function drawRoom() {
        // Parede da sala (cenário 3D) ou céu de reserva
        var bgOk = window.RBX_CENA && RBX_CENA.fundo(ctx, 0, 0, W, H * 0.58, 'quadro', 0.5);
        if (!bgOk) {
          var skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.6);
          skyGrad.addColorStop(0, '#4FC3F7');
          skyGrad.addColorStop(1, '#B3E5FC');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, W, H * 0.6);

          // Sol e Nuvens
          ctx.fillStyle = '#FFF9C4';
          ctx.beginPath();
          ctx.arc(W * 0.15, H * 0.12, 35, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(W * 0.8, H * 0.15, 30, 0, Math.PI * 2);
          ctx.arc(W * 0.85, H * 0.13, 40, 0, Math.PI * 2);
          ctx.arc(W * 0.9, H * 0.15, 30, 0, Math.PI * 2);
          ctx.fill();

          // Olho decorativo no topo (estilo Roblox)
          var eyeY = H * 0.08;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(W * 0.5, eyeY, 40, 22, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1E3A8A';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          ctx.arc(W * 0.5 + Math.sin(Date.now() * 0.003) * 6, eyeY, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        // Piso com perspectiva de azulejos claros
        var floorY = H * 0.55;
        var floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
        floorGrad.addColorStop(0, '#E2E8F0');
        floorGrad.addColorStop(1, '#CBD5E1');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, floorY, W, H - floorY);

        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        var tiles = 10;
        for (var i = 0; i <= tiles; i++) {
          var px = (W / tiles) * i;
          ctx.beginPath();
          ctx.moveTo(px, floorY);
          ctx.lineTo((px - W * 0.5) * 1.5 + W * 0.5, H);
          ctx.stroke();
        }
        for (var j = 1; j <= 5; j++) {
          var py = floorY + (H - floorY) * Math.pow(j / 5, 1.4);
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(W, py);
          ctx.stroke();
        }
      }

      function drawBoard() {
        var bx = W * 0.08;
        var by = H * 0.14;
        var bw = W * 0.84;
        var bh = H * 0.38;

        // Moldura preta arredondada

        ctx.fillStyle = '#1E293B';
        roundRect(ctx, bx - 6, by - 6, bw + 12, bh + 12, 24, true, false);

        // Tela do quadro (azul-claro neon)
        var boardGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        boardGrad.addColorStop(0, '#0284C7');
        boardGrad.addColorStop(1, '#0369A1');
        ctx.fillStyle = boardGrad;
        roundRect(ctx, bx, by, bw, bh, 20, true, false);

        // Faixa Troll se for pergunta troll
        if (isTroll) {
          ctx.fillStyle = '#D946EF';
          roundRect(ctx, bx, by, bw, 40, { tl: 20, tr: 20, bl: 0, br: 0 }, true, false);
          ctx.font = '900 20px sans-serif';
          ctx.fillStyle = '#FFF';
          ctx.textAlign = 'center';
          ctx.fillText('😈 PERGUNTA DE TROLL (MOEDAS 2X)! 😈', W * 0.5, by + 26);
        }

        // Balão flutuante estilizado dentro do quadro
        var qY = isTroll ? (by + 48) : (by + 16);
        var qH = bh - (isTroll ? 58 : 28);
        var qPad = 16;
        var innerW = bw - qPad * 2;

        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, bx + qPad, qY, innerW, qH, 18, true, false);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#1D4ED8';
        ctx.stroke();

        // Etiqueta laranja do jogo
        var tagW = 180, tagH = 26;
        ctx.fillStyle = '#F97316';
        roundRect(ctx, W * 0.5 - tagW * 0.5, qY - 12, tagW, tagH, 10, true, false);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(NOME.toUpperCase(), W * 0.5, qY + 6);

        var FONTS = ["'Playwrite BR', cursive", "'Arial Black', Arial, sans-serif", "'Segoe Print', 'Comic Sans MS', cursive"];
        // Texto da pergunta com ajuste automático de tamanho
        if (currentQ && currentQ.q) {
          ctx.fillStyle = '#0F172A';
          ctx.textAlign = 'center';
          var ff = FONTS[fontIndex % 3];
          var lh = fontIndex === 0 ? 1.5 : 1.25;
          var fontSize = Math.min(44, Math.max(24, Math.floor(innerW / 18)));
          if (fontIndex === 0) fontSize = Math.floor(fontSize * 0.85);
          ctx.font = (fontIndex === 1 ? '' : 'bold ') + fontSize + 'px ' + ff;
          var lines = wrapText(ctx, currentQ.q, innerW - 40);
          while (lines.length * (fontSize * lh) > (qH - 30) && fontSize > 18) {
            fontSize -= 2;
            ctx.font = (fontIndex === 1 ? '' : 'bold ') + fontSize + 'px ' + ff;
            lines = wrapText(ctx, currentQ.q, innerW - 40);
          }
          var startY = qY + (qH - lines.length * (fontSize * lh)) * 0.5 + fontSize;
          for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], W * 0.5, startY + i * (fontSize * lh));
          }
        }

        // Bandeja do apagador (cantinho): botão Aa troca a fonte
        btnFontRect.x = bx + bw - 76;
        btnFontRect.y = by + bh + 2;
        ctx.fillStyle = '#94A3B8';
        roundRect(ctx, btnFontRect.x - 12, by + bh + 4, 100, 8, 4, true, false);
        ctx.fillStyle = '#F8FAFC';
        roundRect(ctx, btnFontRect.x, btnFontRect.y, btnFontRect.w, btnFontRect.h, 8, true, false);
        ctx.strokeStyle = '#1D4ED8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#1E293B';
        ctx.font = "bold 16px " + FONTS[fontIndex % 3];
        ctx.textAlign = 'center';
        ctx.fillText('Aa', btnFontRect.x + btnFontRect.w / 2, btnFontRect.y + 19);
      }

      function drawPlatforms() {
        altRects = [];
        var n = alts.length;
        var pad = 16;
        var totalW = Math.min(W * 0.9, 760);
        var startX = (W - totalW) * 0.5;
        var pw = (totalW - (n - 1) * pad) / n;
        var ph = 85;
        var py = H * 0.64;

        var btnColors = [
          { top: '#22C55E', bot: '#15803D' }, // Verde
          { top: '#EAB308', bot: '#A16207' }, // Amarelo
          { top: '#3B82F6', bot: '#1D4ED8' }  // Azul
        ];

        for (var i = 0; i < n; i++) {
          var alt = alts[i];
          var px = startX + i * (pw + pad);
          altRects.push({ x: px, y: py, w: pw, h: ph });

          var isSel = (i === selectedAlt);
          var elev = isSel ? 8 : 0;

          // Sombra da plataforma
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          roundRect(ctx, px, py + 14, pw, ph, 16, true, false);

          if (alt.disabled) {
            ctx.fillStyle = '#94A3B8';
            roundRect(ctx, px, py, pw, ph, 16, true, false);
            ctx.fillStyle = '#64748B';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❌', px + pw * 0.5, py + ph * 0.5 + 8);
            continue;
          }

          var col = btnColors[i % btnColors.length];
          // Base
          ctx.fillStyle = col.bot;
          roundRect(ctx, px, py - elev + 10, pw, ph, 16, true, false);

          // Topo
          ctx.fillStyle = isSel ? '#F8FAFC' : col.top;
          roundRect(ctx, px, py - elev, pw, ph, 16, true, false);

          // Borda de seleção
          if (isSel) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#FACC15';
            roundRect(ctx, px, py - elev, pw, ph, 16, false, true);
          }

          // Texto com contorno
          var fSize = Math.min(26, Math.max(20, Math.floor(pw / 12)));
          ctx.font = '900 ' + fSize + 'px sans-serif';
          var textLines = wrapText(ctx, alt.text, pw - 24);
          var lineH = fSize * 1.15;
          var textStartY = (py - elev) + (ph - textLines.length * lineH) * 0.5 + fSize * 0.9;

          ctx.textAlign = 'center';
          for (var t = 0; t < textLines.length; t++) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#0F172A';
            ctx.strokeText(textLines[t], px + pw * 0.5, textStartY + t * lineH);
            ctx.fillStyle = isSel ? '#0284C7' : '#FFFFFF';
            ctx.fillText(textLines[t], px + pw * 0.5, textStartY + t * lineH);
          }
        }
      }

      function drawAvatar() {
        var ax = playerX * W;
        var ay = H * 0.85 - playerJump * 35;
        var sz = Math.min(W, H) * 0.08;

        ctx.save();
        ctx.translate(ax, ay);

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, sz * 1.1, sz * 0.7, sz * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pernas (de costas)
        ctx.fillStyle = colors.pants;
        ctx.fillRect(-sz * 0.45, sz * 0.35, sz * 0.4, sz * 0.7);
        ctx.fillRect(sz * 0.05, sz * 0.35, sz * 0.4, sz * 0.7);

        // Tronco (de costas)
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(-sz * 0.55, -sz * 0.45, sz * 1.1, sz * 0.85);

        // Braços
        ctx.fillStyle = colors.skin;
        ctx.fillRect(-sz * 0.8, -sz * 0.4, sz * 0.22, sz * 0.75);
        ctx.fillRect(sz * 0.58, -sz * 0.4, sz * 0.22, sz * 0.75);

        // Cabeça
        ctx.fillStyle = colors.skin;
        ctx.fillRect(-sz * 0.35, -sz * 1.15, sz * 0.7, sz * 0.65);

        // Cabelo (de costas - cobre a maior parte da cabeça)
        ctx.fillStyle = colors.hair;
        ctx.fillRect(-sz * 0.38, -sz * 1.25, sz * 0.76, sz * 0.55);

        ctx.restore();
      }

      function drawHUD() {
        // Barra Superior: Vidas, Moedas, Pergunta n/10
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        roundRect(ctx, 16, 12, W - 32, 46, 23, true, false);

        // Pergunta n/10
        ctx.font = '900 18px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        ctx.fillText('Q: ' + qIndex + ' / ' + maxQ, 32, 41);

        // Vidas
        var hearts = '';
        for (var i = 0; i < 3; i++) hearts += (i < lives ? '❤️' : '🖤');
        ctx.font = '18px sans-serif';
        ctx.fillText(hearts, 150, 41);

        // Moedas
        ctx.font = '900 18px sans-serif';
        ctx.fillStyle = '#FACC15';
        ctx.fillText('🪙 ' + coinsEarned, 260, 41);

        // Barra de progresso central
        var barW = Math.min(200, W * 0.25);
        var barX = W * 0.5 - barW * 0.5;
        ctx.fillStyle = '#334155';
        roundRect(ctx, barX, 24, barW, 14, 7, true, false);
        var prog = Math.min(1, qIndex / maxQ);
        ctx.fillStyle = '#22C55E';
        roundRect(ctx, barX, 24, barW * prog, 14, 7, true, false);

        // Botão Fechar [X]
        btnCloseRect = { x: W - 56, y: 13, w: 44, h: 44 };
        ctx.fillStyle = '#EF4444';
        roundRect(ctx, btnCloseRect.x, btnCloseRect.y, btnCloseRect.w, btnCloseRect.h, 22, true, false);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✖', btnCloseRect.x + 22, btnCloseRect.y + 30);

        // Botões Laterais: Pular (Verde) e Dica (Amarelo)
        if (state === 'PLAYING') {
          var by = H * 0.84;
          // Pular (esquerda)
          btnSkipRect = { x: 55, y: by, r: 28 };
          ctx.fillStyle = skipsLeft > 0 ? '#10B981' : '#64748B';
          ctx.beginPath();
          ctx.arc(btnSkipRect.x, btnSkipRect.y, btnSkipRect.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('PULAR', btnSkipRect.x, btnSkipRect.y - 2);
          ctx.font = '900 12px sans-serif';
          ctx.fillText('(' + skipsLeft + ')', btnSkipRect.x, btnSkipRect.y + 13);

          // Dica (direita)
          btnHintRect = { x: W - 55, y: by, r: 28 };
          ctx.fillStyle = hintsLeft > 0 ? '#EAB308' : '#64748B';
          ctx.beginPath();
          ctx.arc(btnHintRect.x, btnHintRect.y, btnHintRect.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = '#FFFFFF'; ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DICA', btnHintRect.x, btnHintRect.y - 2);
          ctx.font = '900 12px sans-serif';
          ctx.fillText('(' + hintsLeft + ')', btnHintRect.x, btnHintRect.y + 13);
        }
      }

      function drawCountdown() {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);

        var num = Math.ceil(countTime);
        var txt = num > 0 ? (num === 1 ? 'VAI!' : '' + (num - 1)) : 'VAI!';
        ctx.font = '900 90px sans-serif';
        ctx.fillStyle = '#FACC15';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
        ctx.textAlign = 'center';
        ctx.strokeText(txt, W * 0.5, H * 0.52);
        ctx.fillText(txt, W * 0.5, H * 0.52);
      }

      function drawExplanation() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, W, H);

        var mw = Math.min(W * 0.85, 550);
        var mx = (W - mw) * 0.5;
        var my = H * 0.22;
        var mh = H * 0.56;

        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, mx, my, mw, mh, 20, true, false);

        ctx.fillStyle = '#DC2626';
        ctx.font = '900 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OPS! VOCÊ ERROU!', W * 0.5, my + 45);

        ctx.fillStyle = '#16A34A';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Resposta Certa: ' + (currentQ ? currentQ.a : ''), W * 0.5, my + 85);

        // Explicação
        var exp = (currentQ && currentQ.e) ? currentQ.e : 'Preste atenção aos detalhes da questão!';
        ctx.fillStyle = '#334155';
        ctx.font = '18px sans-serif';
        var eLines = wrapText(ctx, exp, mw - 40);
        for (var i = 0; i < eLines.length; i++) {
          ctx.fillText(eLines[i], W * 0.5, my + 130 + i * 26);
        }

        // Botão Continuar
        var btnW = 200, btnH = 50;
        var bx = W * 0.5 - btnW * 0.5;
        var by = my + mh - 70;
        ctx.fillStyle = '#2563EB';
        roundRect(ctx, bx, by, btnW, btnH, 25, true, false);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('CONTINUAR [A]', W * 0.5, by + 32);
      }

      function drawResult() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, 0, W, H);

        var rw = Math.min(W * 0.85, 500);
        var rx = (W - rw) * 0.5;
        var ry = H * 0.2;
        var rh = H * 0.6;

        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, rx, ry, rw, rh, 24, true, false);

        var won = score >= 6;
        ctx.fillStyle = won ? '#16A34A' : '#E11D48';
        ctx.font = '900 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(won ? 'PARABÉNS! 🎉' : 'FIM DE JOGO! 🧠', W * 0.5, ry + 60);

        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Acertos: ' + score + ' de ' + maxQ, W * 0.5, ry + 120);

        ctx.fillStyle = '#CA8A04';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Moedas Ganhas: 🪙 ' + coinsEarned, W * 0.5, ry + 160);

        // Botões de ação
        var bw = 160, bh = 50;
        resBtnRetry = { x: W * 0.5 - bw - 15, y: ry + rh - 80, w: bw, h: bh };
        resBtnClose = { x: W * 0.5 + 15, y: ry + rh - 80, w: bw, h: bh };

        ctx.fillStyle = '#22C55E';
        roundRect(ctx, resBtnRetry.x, resBtnRetry.y, bw, bh, 25, true, false);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('De Novo [A]', resBtnRetry.x + bw * 0.5, resBtnRetry.y + 31);

        ctx.fillStyle = '#EF4444';
        roundRect(ctx, resBtnClose.x, resBtnClose.y, bw, bh, 25, true, false);
        ctx.fillStyle = '#FFF';
        ctx.fillText('Sair [B]', resBtnClose.x + bw * 0.5, resBtnClose.y + 31);
      }

      function drawParticles() {
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        var r = { tl: 0, tr: 0, br: 0, bl: 0 };
        if (typeof radius === 'number') {
          r = { tl: radius, tr: radius, br: radius, bl: radius };
        } else if (radius) {
          r = Object.assign(r, radius);
        }
        ctx.beginPath();
        ctx.moveTo(x + r.tl, y);
        ctx.lineTo(x + width - r.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
        ctx.lineTo(x + width, y + height - r.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
        ctx.lineTo(x + r.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
        ctx.lineTo(x, y + r.tl);
        ctx.quadraticCurveTo(x, y, x + r.tl, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }

      rafId = requestAnimationFrame(loop);
    }
  };
})();
