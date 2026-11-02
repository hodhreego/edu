(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS['basquete'] = {
    nome: 'Cesta Certa 🏀',
    icone: '🏀',
    desc: 'Arremesse na cesta da resposta',
    start: function (api) {
      var root = document.createElement('div');
      root.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0f172a;overflow:hidden;touch-action:none;user-select:none;font-family:sans-serif;';
      document.body.appendChild(root);

      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      root.appendChild(canvas);
      var ctx = canvas.getContext('2d');

      var animId = null, w = 0, h = 0, dpr = 1;
      var time = 0, shakeTimer = 0;

      // Game state
      var state = 'COUNTDOWN'; // COUNTDOWN, PLAYING, SHOOTING, EXPLANATION, GAMEOVER
      var countdownVal = 3, countdownTimer = 0;
      var qIndex = 0, totalQuestions = 10;
      var lives = 3, coins = 0, combo = 0, correctCount = 0;
      var curQ = null, options = [], selectedIndex = 0;
      var explanationText = '';
      var gameoverBtn = 0; // 0: Jogar de novo, 1: Sair

      // Ball & Animations
      var ball = { x: 0, y: 0, startX: 0, startY: 0, targetX: 0, targetY: 0, ctrlX: 0, ctrlY: 0, t: 0, active: false, targetIdx: -1 };
      var particles = [];
      var clouds = [
        { x: 0.1, y: 0.12, s: 0.8, v: 0.0002 },
        { x: 0.5, y: 0.08, s: 1.2, v: 0.00015 },
        { x: 0.8, y: 0.15, s: 0.9, v: 0.00025 }
      ];

      // Input tracking for gamepad edge detection
      var gpState = { left: false, right: false, up: false, down: false, btnA: false, btnB: false };

      var colors = api.avatarColors || {};
      var avSkin = colors.skin || '#fbcfe8';
      var avShirt = colors.shirt || '#2563eb';
      var avPants = colors.pants || '#1e293b';
      var avHair = colors.hair || '#451a03';

      function resize() {
        dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      resize();
      window.addEventListener('resize', resize);

      function cleanup() {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        if (root && root.parentNode) root.parentNode.removeChild(root);
        api.onClose();
      }

      function getWrappedLines(text, maxW, fontSize) {
        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        var words = (text || '').split(' ');
        var lines = [];
        var cur = words[0] || '';
        for (var i = 1; i < words.length; i++) {
          var test = cur + ' ' + words[i];
          if (ctx.measureText(test).width <= maxW) {
            cur = test;
          } else {
            lines.push(cur);
            cur = words[i];
          }
        }
        lines.push(cur);
        return lines;
      }

      function getHoopRects() {
        var num = options.length;
        var rects = [];
        var hoopW = Math.min(w * 0.28, 220);
        var hoopH = 125;
        var balloonBottom = 70 + Math.min(h * 0.18, 120) + 16;
        var topY = Math.max(balloonBottom + 12, h * 0.43);

        for (var i = 0; i < num; i++) {
          var cx = (w / (num + 1)) * (i + 1);
          rects.push({
            x: cx - hoopW / 2,
            y: topY,
            w: hoopW,
            h: hoopH,
            cx: cx,
            cy: topY + 40,
            rimX: cx,
            rimY: topY + 85
          });
        }
        return rects;
      }

      function loadQuestion() {
        if (qIndex >= totalQuestions || lives <= 0) {
          state = 'GAMEOVER';
          gameoverBtn = 0;
          return;
        }

        var topics = api.topics();
        var topic = topics[Math.floor(Math.random() * topics.length)] || 'Geral';
        curQ = api.B.make(api.ANO, topic, api.tier());

        var wrongList = (curQ.d || []).slice();
        wrongList.sort(function () { return Math.random() - 0.5; });

        var alts = [{ text: curQ.a, ok: true }];
        alts.push({ text: wrongList[0] || 'Errada 1', ok: false });
        if (!api.easy() && wrongList.length > 1) {
          alts.push({ text: wrongList[1], ok: false });
        }
        alts.sort(function () { return Math.random() - 0.5; });

        options = alts;
        selectedIndex = 0;
        ball.active = false;
        state = 'PLAYING';
      }

      function startCountdown() {
        state = 'COUNTDOWN';
        countdownVal = 3;
        countdownTimer = performance.now();
      }

      function shoot(idx) {
        if (state !== 'PLAYING' || ball.active) return;
        selectedIndex = idx;
        var hoops = getHoopRects();
        var target = hoops[idx];
        if (!target) return;

        ball.startX = w * 0.5;
        ball.startY = h * 0.80;
        ball.targetX = target.rimX;
        ball.targetY = target.rimY;
        ball.ctrlX = (ball.startX + ball.targetX) / 2;
        ball.ctrlY = Math.min(ball.startY, ball.targetY) - h * 0.28;
        ball.t = 0;
        ball.active = true;
        ball.targetIdx = idx;
        state = 'SHOOTING';
      }

      function spawnConfetti(x, y) {
        for (var i = 0; i < 40; i++) {
          particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.8) * 10,
            color: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
            size: Math.random() * 8 + 4,
            life: 1,
            decay: Math.random() * 0.02 + 0.015,
            rot: Math.random() * 6.28
          });
        }
      }

      function spawnPopText(x, y, txt, color) {
        particles.push({
          x: x, y: y, vx: 0, vy: -1.5,
          text: txt, color: color || '#f59e0b',
          life: 1, decay: 0.02, size: 28
        });
      }

      function onConfirm() {
        if (state === 'PLAYING') {
          shoot(selectedIndex);
        } else if (state === 'EXPLANATION') {
          qIndex++;
          loadQuestion();
        } else if (state === 'GAMEOVER') {
          if (gameoverBtn === 0) {
            lives = 3;
            coins = 0;
            combo = 0;
            correctCount = 0;
            qIndex = 0;
            startCountdown();
          } else {
            cleanup();
          }
        }
      }

      function onKeyDown(e) {
        if (e.key === 'Escape') { cleanup(); return; }
        if (state === 'PLAYING') {
          if (e.key === '1') shoot(0);
          if (e.key === '2' && options.length > 1) shoot(1);
          if (e.key === '3' && options.length > 2) shoot(2);
          if (e.key === 'ArrowLeft') selectedIndex = (selectedIndex - 1 + options.length) % options.length;
          if (e.key === 'ArrowRight') selectedIndex = (selectedIndex + 1) % options.length;
          if (e.key === 'Enter' || e.key === ' ') onConfirm();
        } else if (state === 'EXPLANATION') {
          if (e.key === 'Enter' || e.key === ' ') onConfirm();
        } else if (state === 'GAMEOVER') {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') gameoverBtn = gameoverBtn === 0 ? 1 : 0;
          if (e.key === 'Enter' || e.key === ' ') onConfirm();
        }
      }
      window.addEventListener('keydown', onKeyDown);

      function handlePointer(px, py, isClick) {
        // Close button check (top right)
        if (isClick && px > w - 60 && py < 60) {
          cleanup();
          return;
        }

        if (state === 'PLAYING') {
          var hoops = getHoopRects();
          for (var i = 0; i < hoops.length; i++) {
            var hBox = hoops[i];
            if (px >= hBox.x && px <= hBox.x + hBox.w && py >= hBox.y && py <= hBox.y + hBox.h + 80) {
              selectedIndex = i;
              if (isClick) shoot(i);
              break;
            }
          }
        } else if (state === 'EXPLANATION' && isClick) {
          onConfirm();
        } else if (state === 'GAMEOVER' && isClick) {
          var bw = 160, bh = 50, cy = h * 0.65;
          if (py >= cy - bh / 2 && py <= cy + bh / 2) {
            if (px >= w * 0.5 - bw - 20 && px <= w * 0.5 - 20) {
              gameoverBtn = 0;
              onConfirm();
            } else if (px >= w * 0.5 + 20 && px <= w * 0.5 + bw + 20) {
              gameoverBtn = 1;
              onConfirm();
            }
          }
        }
      }

      function onPointerDown(e) {
        handlePointer(e.clientX, e.clientY, true);
      }
      function onPointerMove(e) {
        handlePointer(e.clientX, e.clientY, false);
      }
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);

      function pollGamepad() {
        var gps = navigator.getGamepads ? navigator.getGamepads() : [];
        var gp = null;
        for (var i = 0; i < gps.length; i++) { if (gps[i]) { gp = gps[i]; break; } }
        if (!gp) return;

        var ax = gp.axes[0] || 0;
        var curLeft = ax < -0.5 || (gp.buttons[14] && gp.buttons[14].pressed);
        var curRight = ax > 0.5 || (gp.buttons[15] && gp.buttons[15].pressed);
        var curA = gp.buttons[0] && gp.buttons[0].pressed;
        var curB = gp.buttons[1] && gp.buttons[1].pressed;

        if (curB && !gpState.btnB) cleanup();

        if (state === 'PLAYING') {
          if (curLeft && !gpState.left) selectedIndex = (selectedIndex - 1 + options.length) % options.length;
          if (curRight && !gpState.right) selectedIndex = (selectedIndex + 1) % options.length;
          if (curA && !gpState.btnA) onConfirm();
        } else if (state === 'EXPLANATION') {
          if (curA && !gpState.btnA) onConfirm();
        } else if (state === 'GAMEOVER') {
          if ((curLeft && !gpState.left) || (curRight && !gpState.right)) gameoverBtn = gameoverBtn === 0 ? 1 : 0;
          if (curA && !gpState.btnA) onConfirm();
        }

        gpState.left = curLeft; gpState.right = curRight; gpState.btnA = curA; gpState.btnB = curB;
      }

      function update() {
        time += 16;
        if (shakeTimer > 0) shakeTimer--;

        // Clouds movement
        clouds.forEach(function (c) {
          c.x += c.v;
          if (c.x > 1.2) c.x = -0.2;
        });

        // Countdown state logic
        if (state === 'COUNTDOWN') {
          var elapsed = performance.now() - countdownTimer;
          if (elapsed > 800) {
            countdownVal--;
            countdownTimer = performance.now();
            if (countdownVal < 0) {
              loadQuestion();
            }
          }
        }

        // Shooting Arc Animation
        if (state === 'SHOOTING' && ball.active) {
          ball.t += 0.035;
          if (ball.t >= 1) {
            ball.t = 1;
            ball.active = false;
            var chosen = options[ball.targetIdx];
            if (chosen && chosen.ok) {
              correctCount++;
              combo++;
              var gCoins = 1;
              var gXp = 5 + combo;
              coins += gCoins;
              api.gain(gXp, gCoins);
              api.log(curQ, true, 1);
              spawnConfetti(ball.targetX, ball.targetY);
              spawnPopText(ball.targetX, ball.targetY - 30, 'SWISH! +' + gXp + 'XP', '#10b981');
              qIndex++;
              setTimeout(loadQuestion, 800);
            } else {
              lives--;
              combo = 0;
              shakeTimer = 15;
              api.log(curQ, false, 1);
              explanationText = (curQ && curQ.e) ? curQ.e : 'A resposta correta era: ' + (curQ ? curQ.a : '');
              spawnPopText(ball.targetX, ball.targetY - 30, 'ERROU!', '#ef4444');
              state = 'EXPLANATION';
            }
          }
          var inv = 1 - ball.t;
          ball.x = inv * inv * ball.startX + 2 * inv * ball.t * ball.ctrlX + ball.t * ball.t * ball.targetX;
          ball.y = inv * inv * ball.startY + 2 * inv * ball.t * ball.ctrlY + ball.t * ball.t * ball.targetY;
        }

        // Update particles
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx || 0;
          p.y += p.vy || 0;
          if (p.vy !== undefined && !p.text) p.vy += 0.3; // Gravity
          p.life -= p.decay || 0.02;
          if (p.life <= 0) particles.splice(i, 1);
        }

        pollGamepad();
      }

      // --- DRAWING FUNCTIONS ---

      function drawSkyAndCourt() {
        var courtY = h * 0.67;

        // Sky
        var skyGrad = ctx.createLinearGradient(0, 0, 0, courtY);
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, courtY);

        // Sun
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.12, 45, 0, Math.PI * 2);
        ctx.fill();

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        clouds.forEach(function (c) {
          var cx = c.x * w, cy = c.y * h, s = c.s;
          ctx.beginPath();
          ctx.arc(cx, cy, 25 * s, 0, Math.PI * 2);
          ctx.arc(cx + 20 * s, cy - 10 * s, 20 * s, 0, Math.PI * 2);
          ctx.arc(cx + 40 * s, cy, 22 * s, 0, Math.PI * 2);
          ctx.fill();
        });

        // Court Floor (Wood/Hardcourt)
        var courtGrad = ctx.createLinearGradient(0, courtY, 0, h);
        courtGrad.addColorStop(0, '#ea580c');
        courtGrad.addColorStop(1, '#c2410c');
        ctx.fillStyle = courtGrad;
        ctx.fillRect(0, courtY, w, h - courtY);

        // Court lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, courtY);
        ctx.lineTo(w, courtY);
        ctx.stroke();

        // Key Arc line
        ctx.beginPath();
        ctx.ellipse(w * 0.5, courtY + (h - courtY) * 0.18, w * 0.35, (h - courtY) * 0.6, 0, 0, Math.PI);
        ctx.stroke();
      }

      function drawHoops() {
        var courtY = h * 0.67;
        var hoops = getHoopRects();
        for (var i = 0; i < hoops.length; i++) {
          var hp = hoops[i];
          var opt = options[i];
          var isSelected = (state === 'PLAYING' && selectedIndex === i);

          // Pole
          ctx.fillStyle = '#64748b';
          ctx.fillRect(hp.cx - 6, hp.y + 40, 12, Math.max(10, courtY - (hp.y + 40)));

          // Plate Text Box (Backboard Top)
          ctx.fillStyle = isSelected ? '#fef08a' : '#ffffff';
          ctx.strokeStyle = isSelected ? '#f59e0b' : '#334155';
          ctx.lineWidth = isSelected ? 5 : 3;

          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(hp.x + 4, hp.y + 4, hp.w, hp.h);

          // Card
          ctx.fillStyle = isSelected ? '#fffbebe6' : 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(hp.x, hp.y, hp.w, hp.h, 12) : ctx.rect(hp.x, hp.y, hp.w, hp.h);
          ctx.fill();
          ctx.stroke();

          // Target / Inner Rim Square
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(hp.cx - 20, hp.y + hp.h - 35, 40, 30);

          // Rim
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(hp.cx - 25, hp.rimY, 50, 8);

          // Net
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hp.cx - 22, hp.rimY + 8);
          ctx.lineTo(hp.cx - 12, hp.rimY + 35);
          ctx.lineTo(hp.cx + 12, hp.rimY + 35);
          ctx.lineTo(hp.cx + 22, hp.rimY + 8);
          ctx.stroke();

          // Render Alternative Text Inside Plate
          if (opt) {
            var fontSize = 24;
            var lines = getWrappedLines(opt.text, hp.w - 16, fontSize);
            while (lines.length > 3 && fontSize > 18) {
              fontSize -= 2;
              lines = getWrappedLines(opt.text, hp.w - 16, fontSize);
            }
            ctx.font = 'bold ' + fontSize + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            var startTextY = hp.y + (hp.h - 35) / 2 - ((lines.length - 1) * (fontSize + 2)) / 2;
            for (var l = 0; l < lines.length; l++) {
              var ly = startTextY + l * (fontSize + 4);
              ctx.fillStyle = '#0f172a';
              ctx.fillText(lines[l], hp.cx, ly);
            }
          }
        }
      }

      function drawAvatar() {
        var px = w * 0.5;
        var py = h * 0.80;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(px, py + 55, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs / Pants
        ctx.fillStyle = avPants;
        ctx.fillRect(px - 16, py + 20, 12, 35);
        ctx.fillRect(px + 4, py + 20, 12, 35);

        // Shirt
        ctx.fillStyle = avShirt;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(px - 20, py - 20, 40, 42, 6) : ctx.rect(px - 20, py - 20, 40, 42);
        ctx.fill();

        // Head
        ctx.fillStyle = avSkin;
        ctx.beginPath();
        ctx.arc(px, py - 35, 18, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = avHair;
        ctx.beginPath();
        ctx.arc(px, py - 40, 18, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px - 5, py - 35, 2, 0, Math.PI * 2);
        ctx.arc(px + 5, py - 35, 2, 0, Math.PI * 2);
        ctx.fill();

        // Static Ball in hand if not shooting
        if (!ball.active && state === 'PLAYING') {
          drawBasketball(px + 24, py - 10, 16);
        }
      }

      function drawBasketball(bx, by, radius) {
        ctx.save();
        ctx.translate(bx, by);

        // Orange sphere
        var bGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
        bGrad.addColorStop(0, '#fb923c');
        bGrad.addColorStop(1, '#ea580c');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Black lines
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0);
        ctx.moveTo(0, -radius); ctx.lineTo(0, radius);
        ctx.stroke();

        ctx.restore();
      }

      function drawQuestionBalloon() {
        if (!curQ) return;
        var floatY = Math.sin(time * 0.003) * 4;
        var bw = Math.min(w * 0.9, 750);
        var bh = Math.min(h * 0.18, 120);
        var bx = (w - bw) / 2;
        var by = 70 + floatY;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx + 4, by + 4, bw, bh, 20) : ctx.rect(bx + 4, by + 4, bw, bh);
        ctx.fill();

        // White Balloon
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 20) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.stroke();

        // Speech Tail
        ctx.beginPath();
        ctx.moveTo(w * 0.5 - 15, by + bh);
        ctx.lineTo(w * 0.5, by + bh + 14);
        ctx.lineTo(w * 0.5 + 15, by + bh);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();

        // Top Orange Badge
        var tagW = 140, tagH = 24;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx + 20, by - 12, tagW, tagH, 8) : ctx.rect(bx + 20, by - 12, tagW, tagH);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Cesta Certa 🏀', bx + 20 + tagW / 2, by - 12 + tagH / 2);

        // Auto-fit Enunciado Text (30-34px target)
        var fontSize = 30;
        var lines = getWrappedLines(curQ.q, bw - 40, fontSize);
        while (lines.length * (fontSize + 6) > bh - 20 && fontSize > 15) {
          fontSize -= 2;
          lines = getWrappedLines(curQ.q, bw - 40, fontSize);
        }

        ctx.font = 'bold ' + fontSize + 'px sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var totalH = lines.length * (fontSize + 4);
        var startY = by + (bh / 2) - (totalH / 2) + (fontSize / 2);
        for (var i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], w * 0.5, startY + i * (fontSize + 4));
        }
      }

      function drawHUD() {
        // Top Bar Background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(0, 0, w, 52);

        // Lives (❤️)
        var heartStr = '';
        for (var i = 0; i < 3; i++) heartStr += (i < lives) ? '❤️' : '🖤';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(heartStr, 16, 26);

        // Question Progress
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('Pergunta: ' + (qIndex + 1) + ' / ' + totalQuestions, 130, 26);

        // Coins
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('🪙 ' + coins, 290, 26);

        // Progress Bar Line
        var pWidth = Math.min(w * 0.2, 150);
        var pX = w * 0.5 - pWidth / 2;
        ctx.fillStyle = '#334155';
        ctx.fillRect(pX, 21, pWidth, 10);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(pX, 21, pWidth * (qIndex / totalQuestions), 10);

        // Close ✖ Button
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w - 25, 26, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✖', w - 25, 26);
      }

      function drawCountdown() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, w, h);

        var txt = countdownVal > 0 ? countdownVal : 'VAI!';
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.font = '900 90px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(txt, w * 0.5, h * 0.45);
        ctx.fillText(txt, w * 0.5, h * 0.45);
      }

      function drawExplanation() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, w, h);

        var bw = Math.min(w * 0.85, 600);
        var bh = 280;
        var bx = (w - bw) / 2;
        var by = (h - bh) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 16) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Resposta Errada! ❌', w * 0.5, by + 40);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px sans-serif';
        var lines = getWrappedLines(explanationText, bw - 40, 18);
        for (var i = 0; i < lines.length && i < 5; i++) {
          ctx.fillText(lines[i], w * 0.5, by + 90 + i * 24);
        }

        // Action Button
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(w * 0.5 - 100, by + bh - 60, 200, 45, 10) : ctx.rect(w * 0.5 - 100, by + bh - 60, 200, 45);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Continuar ➔', w * 0.5, by + bh - 37);
      }

      function drawGameOver() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(0, 0, w, h);

        var bw = Math.min(w * 0.85, 500);
        var bh = 320;
        var bx = (w - bw) / 2;
        var by = (h - bh) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 20) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e3a8a';
        ctx.font = '900 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Fim de Jogo! 🏀', w * 0.5, by + 50);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Acertos: ' + correctCount + ' / ' + totalQuestions, w * 0.5, by + 110);
        ctx.fillText('Moedas Ganhas: 🪙 ' + coins, w * 0.5, by + 150);

        // Buttons: Jogar de novo & Sair
        var btnW = 160, btnH = 50;
        var cy = by + bh - 70;

        // Jogar de Novo
        ctx.fillStyle = (gameoverBtn === 0) ? '#16a34a' : '#22c55e';
        ctx.strokeStyle = (gameoverBtn === 0) ? '#fef08a' : 'transparent';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(w * 0.5 - btnW - 15, cy - btnH / 2, btnW, btnH, 10) : ctx.rect(w * 0.5 - btnW - 15, cy - btnH / 2, btnW, btnH);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('Jogar de Novo', w * 0.5 - btnW / 2 - 15, cy);

        // Sair
        ctx.fillStyle = (gameoverBtn === 1) ? '#dc2626' : '#ef4444';
        ctx.strokeStyle = (gameoverBtn === 1) ? '#fef08a' : 'transparent';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(w * 0.5 + 15, cy - btnH / 2, btnW, btnH, 10) : ctx.rect(w * 0.5 + 15, cy - btnH / 2, btnW, btnH);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Sair', w * 0.5 + btnW / 2 + 15, cy);
      }

      function render() {
        ctx.save();
        ctx.scale(dpr, dpr);

        if (shakeTimer > 0) {
          var dx = (Math.random() - 0.5) * shakeTimer;
          var dy = (Math.random() - 0.5) * shakeTimer;
          ctx.translate(dx, dy);
        }

        drawSkyAndCourt();
        drawHoops();
        drawAvatar();

        // Animated Ball
        if (ball.active) {
          drawBasketball(ball.x, ball.y, 18);
        }

        // Draw Particles
        particles.forEach(function (p) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          if (p.text) {
            ctx.fillStyle = p.color;
            ctx.font = '900 ' + p.size + 'px sans-serif';
            ctx.fillText(p.text, p.x, p.y);
          } else {
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot || 0);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
          ctx.restore();
        });

        // UI Layer
        if (state === 'PLAYING' || state === 'SHOOTING') {
          drawQuestionBalloon();
        }
        drawHUD();

        if (state === 'COUNTDOWN') drawCountdown();
        if (state === 'EXPLANATION') drawExplanation();
        if (state === 'GAMEOVER') drawGameOver();

        ctx.restore();
      }

      function loop() {
        update();
        render();
        animId = requestAnimationFrame(loop);
      }

      startCountdown();
      loop();
    }
  };
})();