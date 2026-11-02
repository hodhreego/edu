(function() {
  window.RBX_CORRIDA = {
    start: function(api) {
      if (!api || !api.B) return;

      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#050B14;user-select:none;-webkit-user-select:none;touch-action:none;font-family:Arial,sans-serif;overflow:hidden;';
      
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      overlay.appendChild(canvas);
      document.body.appendChild(overlay);

      var ctx = canvas.getContext('2d');
      var animId = null;

      var colors = api.avatarColors || {};
      var skinCol = colors.skin || '#FFCC99';
      var shirtCol = colors.shirt || '#0288D1';
      var pantsCol = colors.pants || '#1565C0';
      var hairCol = colors.hair || '#4E342E';

      var qIndex = 0;
      var lives = 3;
      var coins = 0;
      var combo = 0;
      var score = 0;

      var currentLane = 1;
      var targetLane = 1;
      var progress = 0;
      var gateSpeed = 0.003;
      var stripeOffset = 0;
      var animTime = 0;

      var gameState = 'RUNNING'; // RUNNING, RESULT_DELAY, EXPLANATION, GAMEOVER
      var resultType = ''; // SUCCESS, FAIL
      var resultTimer = 0;

      var qData = null;
      var themeId = 0; // 0: Pista, 1: Gol, 2: Alçapão
      var themeNames = ['Pista Arcade', 'Chute a Gol ⚽', 'Alçapão Secreto 🚪'];
      var laneOptions = [null, null, null];
      var correctLane = 0;
      var ballPos = { x: 0, y: 0, z: 0 };

      var coinsParticles = [];
      var touchStartX = 0;
      var touchStartY = 0;

      function resize() {
        var dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
      }
      window.addEventListener('resize', resize);
      resize();

      function nextQuestion() {
        var topics = (api.topics && api.topics().length) ? api.topics() : ['Geral'];
        var top = topics[Math.floor(Math.random() * topics.length)];
        var tier = api.tier ? api.tier() : 1;
        var ano = api.ANO || 6;
        qData = api.B.make(ano, top, tier);

        var isEasy = api.easy ? api.easy() : false;
        themeId = Math.floor(Math.random() * 3);

        var wr = (qData.d || []).slice();
        wr.sort(function() { return Math.random() - 0.5; });

        laneOptions = [null, null, null];
        if (isEasy) {
          var emptyLane = Math.floor(Math.random() * 3);
          var avail = [0, 1, 2].filter(function(l) { return l !== emptyLane; });
          correctLane = avail[Math.floor(Math.random() * 2)];
          var wrongLane = (avail[0] === correctLane) ? avail[1] : avail[0];
          laneOptions[correctLane] = qData.a;
          laneOptions[wrongLane] = wr[0] || '---';
        } else {
          correctLane = Math.floor(Math.random() * 3);
          laneOptions[correctLane] = qData.a;
          var wIdx = 0;
          for (var i = 0; i < 3; i++) {
            if (i !== correctLane) {
              laneOptions[i] = wr[wIdx++] || '---';
            }
          }
        }

        progress = 0;
        var dur = Math.max(3.8, 6.0 - qIndex * 0.2);
        gateSpeed = 1 / (dur * 60);
      }

      function getLanePos(t, lane) {
        var pScale = Math.pow(Math.max(0, Math.min(1, t)), 1.7);
        var horizonY = canvas.height * 0.38;
        var y = horizonY + (canvas.height - horizonY) * pScale;
        var wFar = canvas.width * 0.18;
        var wNear = canvas.width * 0.78;
        var trackW = wFar + (wNear - wFar) * pScale;
        var cx = canvas.width / 2;
        var laneW = trackW / 3;
        var x = cx + (lane - 1) * laneW;
        return { x: x, y: y, scale: pScale, trackW: trackW, laneW: laneW };
      }

      function wrapText(text, x, y, maxW, lineH, alignCenter) {
        if (!text) return y;
        var words = text.split(' ');
        var line = '';
        var lines = [];
        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          if (ctx.measureText(testLine).width > maxW && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        for (var i = 0; i < lines.length; i++) {
          var lx = x;
          if (alignCenter) lx = x - ctx.measureText(lines[i]).width / 2;
          ctx.fillText(lines[i], lx, y + i * lineH);
        }
        return y + lines.length * lineH;
      }

      function drawTextFit(text, x, y, maxW, basePx) {
        if (!text) return;
        var sz = basePx;
        ctx.font = 'bold ' + sz + 'px Arial, sans-serif';
        while (ctx.measureText(text).width > maxW && sz > 11) {
          sz -= 1;
          ctx.font = 'bold ' + sz + 'px Arial, sans-serif';
        }
        ctx.fillText(text, x - ctx.measureText(text).width / 2, y);
      }

      function spawnCoins(x, y) {
        for (var i = 0; i < 25; i++) {
          coinsParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.8) * 14,
            life: 1.0,
            rot: Math.random() * Math.PI * 2
          });
        }
      }

      function updateAndDrawParticles() {
        for (var i = coinsParticles.length - 1; i >= 0; i--) {
          var p = coinsParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5;
          p.life -= 0.02;
          if (p.life <= 0) {
            coinsParticles.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = '#FFD700';
          ctx.strokeStyle = '#FFA000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      function moveLeft() {
        if (gameState === 'RUNNING' && targetLane > 0) targetLane--;
      }

      function moveRight() {
        if (gameState === 'RUNNING' && targetLane < 2) targetLane++;
      }

      function onKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
      }
      window.addEventListener('keydown', onKeyDown);

      function handleTap(clientX, clientY) {
        var w = window.innerWidth;
        var h = window.innerHeight;

        // Close button check
        if (clientX > w - 60 && clientY < 60) {
          closeGame();
          return;
        }

        if (gameState === 'EXPLANATION') {
          qIndex++;
          if (qIndex >= 10 || lives <= 0) {
            gameState = 'GAMEOVER';
          } else {
            nextQuestion();
            gameState = 'RUNNING';
          }
          return;
        }

        if (gameState === 'GAMEOVER') {
          var boxW = Math.min(420, canvas.width * 0.85);
          var cx = canvas.width / 2;
          var cy = canvas.height / 2;
          var scale = canvas.width / w;
          var rX = clientX * scale;
          var rY = clientY * scale;

          if (rY > cy + 40 && rY < cy + 90) {
            if (rX > cx - boxW / 2 + 20 && rX < cx - 10) {
              // Restart
              qIndex = 0; lives = 3; coins = 0; combo = 0; score = 0;
              nextQuestion();
              gameState = 'RUNNING';
            } else if (rX > cx + 10 && rX < cx + boxW / 2 - 20) {
              closeGame();
            }
          }
          return;
        }

        if (gameState === 'RUNNING') {
          if (clientY > h * 0.75) {
            if (clientX < w * 0.3) moveLeft();
            else if (clientX > w * 0.7) moveRight();
          } else {
            if (clientX < w / 2) moveLeft();
            else moveRight();
          }
        }
      }

      function onTouchStart(e) {
        if (!e.touches[0]) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }

      function onTouchEnd(e) {
        if (!e.changedTouches[0]) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) moveLeft();
          else moveRight();
        } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      }

      overlay.addEventListener('touchstart', onTouchStart, { passive: true });
      overlay.addEventListener('touchend', onTouchEnd, { passive: true });
      overlay.addEventListener('mousedown', function(e) { handleTap(e.clientX, e.clientY); });

      function closeGame() {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (api.onClose) api.onClose();
      }

      function update() {
        animTime += 0.15;
        currentLane += (targetLane - currentLane) * 0.25;

        if (gameState === 'RUNNING') {
          progress += gateSpeed;
          stripeOffset = (stripeOffset + 0.03) % 1.0;

          if (progress >= 1.0) {
            progress = 1.0;
            var chosenLane = Math.round(currentLane);
            if (laneOptions[chosenLane] && laneOptions[chosenLane] === qData.a) {
              // Correct
              resultType = 'SUCCESS';
              coins++;
              combo++;
              score++;
              if (api.gain) api.gain(5 + combo, 1);
              if (api.log) api.log(qData, true, 1);
              if (api.say) api.say('Excelente! +1 Moeda', 1200);
              var pos = getLanePos(0.9, currentLane);
              spawnCoins(pos.x, pos.y - 50);
              resultTimer = 60;
              gameState = 'RESULT_DELAY';
            } else {
              // Wrong
              resultType = 'FAIL';
              lives--;
              combo = 0;
              if (api.log) api.log(qData, false, 1);
              if (api.say) api.say('Vixi! Errado!', 1200);
              resultTimer = 40;
              gameState = 'RESULT_DELAY';
            }
          }
        } else if (gameState === 'RESULT_DELAY') {
          resultTimer--;
          if (resultTimer <= 0) {
            if (resultType === 'SUCCESS') {
              qIndex++;
              if (qIndex >= 10) gameState = 'GAMEOVER';
              else { nextQuestion(); gameState = 'RUNNING'; }
            } else {
              gameState = 'EXPLANATION';
            }
          }
        }
      }

      function drawBackground() {
        var W = canvas.width;
        var H = canvas.height;
        var horizonY = H * 0.38;

        // Sky
        var skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, '#0B1D3A');
        skyGrad.addColorStop(1, '#1E3C72');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, W, horizonY);

        // Sun / Glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.beginPath();
        ctx.arc(W / 2, horizonY, 140, 0, Math.PI * 2);
        ctx.fill();

        // Grass Side Ground
        ctx.fillStyle = '#1B4D2E';
        ctx.fillRect(0, horizonY, W, H - horizonY);

        // Track Trapezoid
        var pFar = getLanePos(0, 1);
        var pNear = getLanePos(1, 1);
        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.moveTo(W / 2 - pFar.trackW / 2, horizonY);
        ctx.lineTo(W / 2 + pFar.trackW / 2, horizonY);
        ctx.lineTo(W / 2 + pNear.trackW / 2, H);
        ctx.lineTo(W / 2 - pNear.trackW / 2, H);
        ctx.closePath();
        ctx.fill();

        // Lane Striped Markings
        ctx.strokeStyle = '#ECEFF1';
        ctx.lineWidth = Math.max(2, W * 0.004);
        for (var step = 0; step < 12; step++) {
          var t1 = (step / 12 + stripeOffset * 0.0833) % 1.0;
          var t2 = t1 + 0.04;
          if (t2 > 1.0) continue;
          
          var posA1 = getLanePos(t1, 0.5);
          var posA2 = getLanePos(t2, 0.5);
          ctx.beginPath();
          ctx.moveTo(posA1.x, posA1.y);
          ctx.lineTo(posA2.x, posA2.y);
          ctx.stroke();

          var posB1 = getLanePos(t1, 1.5);
          var posB2 = getLanePos(t2, 1.5);
          ctx.beginPath();
          ctx.moveTo(posB1.x, posB1.y);
          ctx.lineTo(posB2.x, posB2.y);
          ctx.stroke();
        }

        // Side Pillars / Trees
        for (var side = -1; side <= 1; side += 2) {
          for (var i = 0; i < 6; i++) {
            var treeT = (i / 6 + stripeOffset * 0.166) % 1.0;
            var pos = getLanePos(treeT, side === -1 ? -0.2 : 2.2);
            var sz = 25 * pos.scale;
            ctx.fillStyle = '#10391D';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y - sz, sz, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4E342E';
            ctx.fillRect(pos.x - sz * 0.2, pos.y - sz * 0.4, sz * 0.4, sz * 0.6);
          }
        }
      }

      function drawGates() {
        var t = progress;
        if (t <= 0) return;

        for (var lane = 0; lane < 3; lane++) {
          var pos = getLanePos(t, lane);
          var optText = laneOptions[lane];
          var isCorrect = (lane === correctLane);

          if (themeId === 0) { // Pista Arch
            ctx.save();
            ctx.translate(pos.x, pos.y);
            var w = pos.laneW * 0.95;
            var h = 90 * pos.scale;

            var archColor = '#00E5FF';
            if (gameState === 'RESULT_DELAY' && t >= 0.98) {
              archColor = isCorrect ? '#00E676' : '#FF1744';
            }

            ctx.strokeStyle = archColor;
            ctx.lineWidth = Math.max(3, 6 * pos.scale);
            ctx.strokeRect(-w / 2, -h, w, h);

            ctx.fillStyle = 'rgba(10, 25, 50, 0.85)';
            ctx.fillRect(-w / 2 + 2, -h + 2, w - 4, h - 4);

            if (optText) {
              ctx.fillStyle = '#FFFFFF';
              drawTextFit(optText, 0, -h * 0.4, w * 0.85, Math.max(15, Math.floor(36 * pos.scale)));
            } else {
              ctx.fillStyle = '#FF5252';
              ctx.font = 'bold ' + Math.floor(22 * pos.scale) + 'px Arial';
              ctx.fillText('❌', -10 * pos.scale, -h * 0.4);
            }
            ctx.restore();

          } else if (themeId === 1) { // Gol
            ctx.save();
            ctx.translate(pos.x, pos.y);
            var gw = pos.laneW * 0.92;
            var gh = 85 * pos.scale;

            // Net background grid
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(-gw / 2, -gh, gw, gh);
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            for (var gx = -gw / 2; gx < gw / 2; gx += 10 * pos.scale) {
              ctx.beginPath(); ctx.moveTo(gx, -gh); ctx.lineTo(gx, 0); ctx.stroke();
            }

            // White Posts
            var postColor = '#FFFFFF';
            if (gameState === 'RESULT_DELAY' && t >= 0.98) {
              postColor = isCorrect ? '#00E676' : '#FF1744';
            }
            ctx.strokeStyle = postColor;
            ctx.lineWidth = Math.max(4, 8 * pos.scale);
            ctx.strokeRect(-gw / 2, -gh, gw, gh);

            if (optText) {
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.fillRect(-gw / 2 + 4, -gh - 28 * pos.scale, gw - 8, 25 * pos.scale);
              ctx.fillStyle = '#FFD700';
              drawTextFit(optText, 0, -gh - 10 * pos.scale, gw * 0.85, Math.max(14, Math.floor(32 * pos.scale)));
            }
            ctx.restore();

          } else { // Alçapão
            ctx.save();
            ctx.translate(pos.x, pos.y);
            var pw = pos.laneW * 0.9;
            var ph = 40 * pos.scale;

            var isOpen = (gameState === 'RESULT_DELAY' && t >= 0.98 && !isCorrect);
            if (isOpen) {
              ctx.fillStyle = '#000000';
              ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
              ctx.strokeStyle = '#FF1744';
              ctx.lineWidth = 3;
              ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
            } else {
              var tileCol = '#37474F';
              if (gameState === 'RESULT_DELAY' && t >= 0.98 && isCorrect) tileCol = '#2E7D32';
              ctx.fillStyle = tileCol;
              ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
              ctx.strokeStyle = '#90A4AE';
              ctx.lineWidth = Math.max(2, 4 * pos.scale);
              ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);

              if (optText) {
                ctx.fillStyle = '#FFFFFF';
                drawTextFit(optText, 0, 5 * pos.scale, pw * 0.85, Math.max(14, Math.floor(32 * pos.scale)));
              }
            }
            ctx.restore();
          }
        }
      }

      function drawRunner() {
        var pos = getLanePos(0.9, currentLane);
        var scale = pos.scale * 1.1;
        var cx = pos.x;
        var cy = pos.y;

        var legAngle = Math.sin(animTime * 8) * 0.4;
        var isStumbling = (gameState === 'RESULT_DELAY' && resultType === 'FAIL');

        ctx.save();
        ctx.translate(cx, cy);
        if (isStumbling) ctx.rotate(0.3);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs (Pants)
        ctx.fillStyle = pantsCol;
        // Left leg
        ctx.save();
        ctx.translate(-8 * scale, -25 * scale);
        ctx.rotate(legAngle);
        ctx.fillRect(-5 * scale, 0, 10 * scale, 25 * scale);
        ctx.restore();
        // Right leg
        ctx.save();
        ctx.translate(8 * scale, -25 * scale);
        ctx.rotate(-legAngle);
        ctx.fillRect(-5 * scale, 0, 10 * scale, 25 * scale);
        ctx.restore();

        // Torso (Shirt)
        ctx.fillStyle = shirtCol;
        ctx.fillRect(-15 * scale, -55 * scale, 30 * scale, 30 * scale);

        // Arms
        ctx.fillStyle = skinCol;
        ctx.save();
        ctx.translate(-18 * scale, -52 * scale);
        ctx.rotate(-legAngle);
        ctx.fillRect(-4 * scale, 0, 8 * scale, 22 * scale);
        ctx.restore();

        ctx.save();
        ctx.translate(18 * scale, -52 * scale);
        ctx.rotate(legAngle);
        ctx.fillRect(-4 * scale, 0, 8 * scale, 22 * scale);
        ctx.restore();

        // Head
        ctx.fillStyle = skinCol;
        ctx.fillRect(-12 * scale, -78 * scale, 24 * scale, 22 * scale);

        // Hair
        ctx.fillStyle = hairCol;
        ctx.fillRect(-14 * scale, -84 * scale, 28 * scale, 8 * scale);

        // Face / Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(-7 * scale, -72 * scale, 4 * scale, 5 * scale);
        ctx.fillRect(3 * scale, -72 * scale, 4 * scale, 5 * scale);

        ctx.restore();

        // Soccer ball extra render for Theme 1
        if (themeId === 1) {
          var ballX = cx;
          var ballY = cy + 5 * scale;
          if (gameState === 'RESULT_DELAY' && progress >= 0.98) {
            ballY -= (60 - resultTimer) * 4;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ballX, ballY, 9 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      function drawTopQuestionCard() {
        if (!qData) return;
        var W = canvas.width;
        var cardW = Math.min(650, W * 0.92);
        var cardH = 95;
        var cx = W / 2;
        var cy = 18 + cardH / 2;

        ctx.fillStyle = 'rgba(10, 20, 38, 0.9)';
        ctx.strokeStyle = '#FFB300';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx - cardW / 2, 52, cardW, cardH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFD54F';
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.fillText(themeNames[themeId].toUpperCase(), cx - cardW / 2 + 15, 70);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial, sans-serif';
        wrapText(qData.q, cx - cardW / 2 + 15, 92, cardW - 30, 20, false);
      }

      function drawHUD() {
        var W = canvas.width;

        // Top bar details
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, 45);

        // Left: Q count
        ctx.fillStyle = '#00E676';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText('Pergunta ' + (qIndex + 1) + ' / 10', 16, 28);

        // Center: Lives
        var hearts = '';
        for (var i = 0; i < 3; i++) hearts += (i < lives) ? '❤️ ' : '🖤 ';
        ctx.font = '18px Arial';
        ctx.fillText(hearts, W / 2 - 40, 28);

        // Right: Coins & Combo
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial, sans-serif';
        var info = '🪙 ' + coins + (combo > 1 ? ' (x' + combo + ')' : '');
        ctx.fillText(info, W - 120, 28);

        // Close button (✖)
        ctx.fillStyle = '#FF5252';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('✖', W - 35, 31);

        // Mobile On-Screen Buttons
        var btnY = canvas.height - 70;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.arc(50, btnY, 35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W - 50, btnY, 35, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('◀', 36, btnY + 10);
        ctx.fillText('▶', W - 64, btnY + 10);
      }

      function drawExplanationModal() {
        var W = canvas.width;
        var H = canvas.height;
        var boxW = Math.min(520, W * 0.9);
        var boxH = 260;
        var cx = W / 2;
        var cy = H / 2;

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#FF5252';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF5252';
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.fillText('Ops! Resposta Incorreta ❌', cx - boxW / 2 + 20, cy - boxH / 2 + 40);

        ctx.fillStyle = '#81C784';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillText('Certo: ' + (qData ? qData.a : ''), cx - boxW / 2 + 20, cy - boxH / 2 + 75);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '15px Arial, sans-serif';
        wrapText(qData ? qData.e : '', cx - boxW / 2 + 20, cy - boxH / 2 + 105, boxW - 40, 20, false);

        // Button
        var btnW = 180;
        var btnH = 44;
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.roundRect(cx - btnW / 2, cy + boxH / 2 - 60, btnW, btnH, 10);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillText('CONTINUAR ➔', cx - 55, cy + boxH / 2 - 32);
      }

      function drawGameOverModal() {
        var W = canvas.width;
        var H = canvas.height;
        var boxW = Math.min(480, W * 0.9);
        var boxH = 280;
        var cx = W / 2;
        var cy = H / 2;

        ctx.fillStyle = 'rgba(5, 11, 20, 0.88)';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.fillText('FIM DA CORRIDA! 🏁', cx - 110, cy - boxH / 2 + 45);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText('Acertos: ' + score + ' / 10', cx - boxW / 2 + 40, cy - 30);
        ctx.fillText('Moedas Ganhas: 🪙 ' + coins, cx - boxW / 2 + 40, cy + 5);

        // Buttons
        var bW = boxW / 2 - 30;
        var bH = 45;

        // Restart
        ctx.fillStyle = '#00E676';
        ctx.beginPath();
        ctx.roundRect(cx - boxW / 2 + 20, cy + 45, bW, bH, 8);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 15px Arial';
        ctx.fillText('JOGAR DE NOVO', cx - boxW / 2 + 30, cy + 72);

        // Exit
        ctx.fillStyle = '#FF5252';
        ctx.beginPath();
        ctx.roundRect(cx + 10, cy + 45, bW, bH, 8);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 15px Arial';
        ctx.fillText('SAIR', cx + 55, cy + 72);
      }

      function gameLoop() {
        update();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();
        drawGates();
        drawRunner();
        updateAndDrawParticles();
        drawTopQuestionCard();
        drawHUD();

        if (gameState === 'EXPLANATION') drawExplanationModal();
        if (gameState === 'GAMEOVER') drawGameOverModal();

        animId = requestAnimationFrame(gameLoop);
      }

      nextQuestion();
      gameLoop();
    }
  };
})();