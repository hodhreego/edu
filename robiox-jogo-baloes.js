(function(){
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS['baloes'] = {
    nome: 'Estoure o Balão 🎈',
    icone: '🎈',
    desc: 'Estoure o balão com a resposta certa!',
    start: function(api) {
      var d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;user-select:none;-webkit-user-select:none;touch-action:none;font-family:system-ui,-apple-system,sans-serif;';
      var cv = document.createElement('canvas');
      cv.style.cssText = 'width:100%;height:100%;display:block;';
      d.appendChild(cv);
      document.body.appendChild(d);
      var ctx = cv.getContext('2d');

      var W = 0, H = 0, DPR = 1;
      var state = 'COUNTDOWN'; // COUNTDOWN, PLAY, EXPLAIN, OVER
      var qIndex = 0, score = 0, lives = 3, coins = 0, combo = 0;
      var currentQ = null, options = [], selectedIdx = 0;
      var countdownTimer = 3.9;
      var particles = [], clouds = [], kites = [];
      var shake = 0, animTime = 0, lastTime = performance.now();
      var running = true, reqId = null;
      var padPrev = {};

      var balloonColors = [
        { main: '#ff3366', dark: '#cc1144', high: '#ff88aa' },
        { main: '#33b5e5', dark: '#0088bb', high: '#88ddff' },
        { main: '#00c851', dark: '#008833', high: '#66ee88' }
      ];

      for (var i = 0; i < 5; i++) {
        clouds.push({ x: Math.random() * 800, y: 40 + Math.random() * 120, spd: 0.2 + Math.random() * 0.3, s: 0.7 + Math.random() * 0.6 });
      }
      for (var k = 0; k < 2; k++) {
        kites.push({ x: Math.random() * 800, y: 150 + Math.random() * 100, spd: 0.5 + Math.random() * 0.5, color: k === 0 ? '#ffbb33' : '#aa66cc' });
      }

      function resize() {
        DPR = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        cv.width = W * DPR;
        cv.height = H * DPR;
        ctx.resetTransform && ctx.resetTransform();
        ctx.scale(DPR, DPR);
      }
      window.addEventListener('resize', resize);
      resize();

      function nextQuestion() {
        if (lives <= 0 || qIndex >= 10) {
          state = 'OVER';
          return;
        }
        var topics = api.topics ? api.topics() : ['Geral'];
        var topic = topics[Math.floor(Math.random() * topics.length)];
        var tier = api.tier ? api.tier() : 1;
        currentQ = api.B.make(api.ANO || 6, topic, tier);

        var count = api.easy && api.easy() ? 2 : 3;
        var opts = [{ text: currentQ.a, ok: true }];
        var dist = (currentQ.d || []).slice(0);
        dist.sort(function() { return Math.random() - 0.5; });
        for (var i = 0; i < count - 1; i++) {
          opts.push({ text: dist[i] || 'Opção ' + (i + 2), ok: false });
        }
        opts.sort(function() { return Math.random() - 0.5; });
        options = opts.map(function(item, idx) {
          return {
            text: item.text,
            ok: item.ok,
            idx: idx,
            baseX: 0,
            x: 0,
            y: H + 100,
            targetY: 0,
            vy: 0,
            scale: 1,
            popped: false
          };
        });
        selectedIdx = 0;
        state = 'PLAY';
        qIndex++;
      }

      function popBalloon(idx) {
        if (state !== 'PLAY' || !options[idx] || options[idx].popped) return;
        var b = options[idx];
        b.popped = true;
        if (b.ok) {
          score++;
          combo++;
          var gain = 5 + combo;
          coins += 1;
          if (api.gain) api.gain(gain, 1);
          if (api.log) api.log(currentQ, true, 1);
          if (api.say) api.say('BOA!', 600);
          spawnConfetti(b.x, b.y);
          setTimeout(function() { if (running) nextQuestion(); }, 700);
        } else {
          combo = 0;
          lives--;
          shake = 12;
          spawnSmoke(b.x, b.y);
          if (api.log) api.log(currentQ, false, 1);
          setTimeout(function() {
            if (!running) return;
            state = 'EXPLAIN';
          }, 500);
        }
      }

      function spawnConfetti(x, y) {
        for (var i = 0; i < 40; i++) {
          var ang = Math.random() * Math.PI * 2;
          var spd = 3 + Math.random() * 7;
          particles.push({
            x: x, y: y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 2,
            size: 4 + Math.random() * 5,
            color: ['#ffeb3b', '#ff4081', '#00e676', '#00e5ff', '#ff9100'][Math.floor(Math.random() * 5)],
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            type: Math.random() > 0.4 ? 'rect' : 'star'
          });
        }
      }

      function spawnSmoke(x, y) {
        for (var i = 0; i < 25; i++) {
          var ang = Math.random() * Math.PI * 2;
          var spd = 1 + Math.random() * 4;
          particles.push({
            x: x, y: y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - 1,
            size: 8 + Math.random() * 12,
            color: '#888',
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            type: 'smoke'
          });
        }
      }

      function wrapText(txt, maxW, fontBase) {
        var words = (txt || '').split(' ');
        var lines = [];
        var cur = '';
        var fSize = fontBase;
        ctx.font = 'bold ' + fSize + 'px system-ui';
        while (fSize > 14) {
          lines = [];
          cur = '';
          var ok = true;
          for (var i = 0; i < words.length; i++) {
            var test = cur ? cur + ' ' + words[i] : words[i];
            if (ctx.measureText(test).width > maxW) {
              if (cur) lines.push(cur);
              cur = words[i];
              if (ctx.measureText(cur).width > maxW) { ok = false; break; }
            } else {
              cur = test;
            }
          }
          if (cur) lines.push(cur);
          if (ok && lines.length <= 4) break;
          fSize -= 2;
          ctx.font = 'bold ' + fSize + 'px system-ui';
        }
        return { lines: lines, size: fSize };
      }

      // Input handlers
      function handleClick(px, py) {
        // Close button: Top-right corner
        if (px >= W - 55 && px <= W - 10 && py >= 10 && py <= 55) {
          destroy();
          if (api.onClose) api.onClose();
          return;
        }

        if (state === 'COUNTDOWN') return;

        if (state === 'OVER') {
          // Restart or Exit buttons
          var cy = H * 0.65;
          if (py >= cy - 25 && py <= cy + 25) {
            if (px >= W * 0.5 - 140 && px <= W * 0.5 - 10) {
              qIndex = 0; score = 0; lives = 3; coins = 0; combo = 0;
              nextQuestion();
            } else if (px >= W * 0.5 + 10 && px <= W * 0.5 + 140) {
              destroy();
              if (api.onClose) api.onClose();
            }
          }
          return;
        }

        if (state === 'EXPLAIN') {
          nextQuestion();
          return;
        }

        if (state === 'PLAY') {
          for (var i = 0; i < options.length; i++) {
            var b = options[i];
            var dx = px - b.x;
            var dy = py - b.y;
            if (dx * dx / (60 * 60) + dy * dy / (80 * 80) <= 1.2) {
              selectedIdx = i;
              popBalloon(i);
              return;
            }
          }
        }
      }

      function onPointerDown(e) {
        var r = cv.getBoundingClientRect();
        var px = e.clientX - r.left;
        var py = e.clientY - r.top;
        handleClick(px, py);
      }
      cv.addEventListener('pointerdown', onPointerDown);

      function onKeyDown(e) {
        if (e.key === 'Escape') {
          destroy();
          if (api.onClose) api.onClose();
          return;
        }
        if (state === 'COUNTDOWN') return;
        if (state === 'EXPLAIN') {
          if (e.key === 'Enter' || e.key === ' ') nextQuestion();
          return;
        }
        if (state === 'OVER') {
          if (e.key === 'Enter' || e.key === ' ') {
            qIndex = 0; score = 0; lives = 3; coins = 0; combo = 0;
            nextQuestion();
          }
          return;
        }
        if (state === 'PLAY') {
          if (e.key === 'ArrowLeft') {
            selectedIdx = (selectedIdx - 1 + options.length) % options.length;
          } else if (e.key === 'ArrowRight') {
            selectedIdx = (selectedIdx + 1) % options.length;
          } else if (e.key === '1' && options[0]) {
            popBalloon(0);
          } else if (e.key === '2' && options[1]) {
            popBalloon(1);
          } else if (e.key === '3' && options[2]) {
            popBalloon(2);
          } else if (e.key === 'Enter' || e.key === ' ') {
            popBalloon(selectedIdx);
          }
        }
      }
      window.addEventListener('keydown', onKeyDown);

      function pollGamepad() {
        var gps = navigator.getGamepads ? navigator.getGamepads() : [];
        if (!gps) return;
        var gp = gps[0] || gps[1];
        if (!gp) return;

        var bA = gp.buttons[0] && gp.buttons[0].pressed;
        var bB = gp.buttons[1] && gp.buttons[1].pressed;
        var dL = (gp.buttons[14] && gp.buttons[14].pressed) || (gp.axes[0] && gp.axes[0] < -0.5);
        var dR = (gp.buttons[15] && gp.buttons[15].pressed) || (gp.axes[0] && gp.axes[0] > 0.5);

        if (dL && !padPrev.left) {
          if (state === 'PLAY' && options.length) {
            selectedIdx = (selectedIdx - 1 + options.length) % options.length;
          }
        }
        if (dR && !padPrev.right) {
          if (state === 'PLAY' && options.length) {
            selectedIdx = (selectedIdx + 1) % options.length;
          }
        }
        if (bA && !padPrev.a) {
          if (state === 'EXPLAIN') nextQuestion();
          else if (state === 'OVER') {
            qIndex = 0; score = 0; lives = 3; coins = 0; combo = 0;
            nextQuestion();
          } else if (state === 'PLAY') {
            popBalloon(selectedIdx);
          }
        }
        if (bB && !padPrev.b) {
          if (state === 'OVER') {
            destroy();
            if (api.onClose) api.onClose();
          }
        }
        padPrev = { left: dL, right: dR, a: bA, b: bB };
      }

      function destroy() {
        running = false;
        if (reqId) cancelAnimationFrame(reqId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        cv.removeEventListener('pointerdown', onPointerDown);
        if (d.parentNode) d.parentNode.removeChild(d);
      }

      function drawSky() {
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#4fc3f7');
        grad.addColorStop(0.6, '#b3e5fc');
        grad.addColorStop(1, '#e1f5fe');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Sun
        ctx.beginPath();
        ctx.arc(W - 80, 80, 42, 0, Math.PI * 2);
        ctx.fillStyle = '#fff176';
        ctx.shadowColor = '#fbc02d';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (var i = 0; i < clouds.length; i++) {
          var c = clouds[i];
          c.x += c.spd;
          if (c.x > W + 100) c.x = -100;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 25 * c.s, 0, Math.PI * 2);
          ctx.arc(c.x + 20 * c.s, c.y - 10 * c.s, 22 * c.s, 0, Math.PI * 2);
          ctx.arc(c.x + 40 * c.s, c.y, 20 * c.s, 0, Math.PI * 2);
          ctx.fill();
        }

        // Kites
        for (var k = 0; k < kites.length; k++) {
          var kt = kites[k];
          kt.x += kt.spd;
          if (kt.x > W + 80) kt.x = -60;
          var ky = kt.y + Math.sin(animTime * 2 + k) * 15;
          ctx.save();
          ctx.translate(kt.x, ky);
          ctx.rotate(0.2 + Math.sin(animTime + k) * 0.1);
          ctx.fillStyle = kt.color;
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(12, 0);
          ctx.lineTo(0, 15);
          ctx.lineTo(-12, 0);
          ctx.closePath();
          ctx.fill();
          // tail
          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 15);
          ctx.quadraticCurveTo(Math.sin(animTime * 3) * 10, 30, Math.cos(animTime * 3) * 10, 45);
          ctx.stroke();
          ctx.restore();
        }
      }

      function drawQuestionBubble() {
        if (!currentQ) return;
        var bw = Math.min(W * 0.9, 700);
        var bx = (W - bw) / 2;
        var by = 80 + Math.sin(animTime * 2) * 4;
        var bh = Math.max(90, Math.min(140, H * 0.22));

        // Balloon body
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0d47a1';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        ctx.beginPath();
        var r = 24;
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        // little tail pointing down
        ctx.lineTo(bx + bw * 0.5 + 16, by + bh);
        ctx.lineTo(bx + bw * 0.5, by + bh + 16);
        ctx.lineTo(bx + bw * 0.5 - 16, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Tag: Game name
        ctx.fillStyle = '#ff6f00';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx + 20, by - 14, 150, 24, 8) : ctx.rect(bx + 20, by - 14, 150, 24);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Estoure o Balão 🎈', bx + 95, by + 2);

        // Question text
        var wrap = wrapText(currentQ.q, bw - 40, 28);
        ctx.fillStyle = '#1a237e';
        ctx.font = 'bold ' + wrap.size + 'px system-ui';
        ctx.textAlign = 'center';
        var lineH = wrap.size * 1.25;
        var startY = by + (bh - wrap.lines.length * lineH) / 2 + wrap.size * 0.85;
        for (var i = 0; i < wrap.lines.length; i++) {
          ctx.fillText(wrap.lines[i], bx + bw / 2, startY + i * lineH);
        }
      }

      function drawBalloon(b, colorSet, isSelected) {
        if (b.popped) return;
        ctx.save();
        ctx.translate(b.x, b.y);

        // String hanging down
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(60,60,60,0.5)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, 75);
        ctx.quadraticCurveTo(Math.sin(animTime * 3 + b.idx) * 12, 110, Math.cos(animTime * 2) * 8, 140);
        ctx.stroke();

        // Selection highlight
        if (isSelected) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(0, 0, 72, 88, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
          ctx.fill();
          ctx.restore();

          // Finger cursor icon
          ctx.font = '28px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('👇', 0, -100 + Math.sin(animTime * 6) * 5);
        }

        // Balloon oval
        var grad = ctx.createRadialGradient(-20, -25, 10, 0, 0, 75);
        grad.addColorStop(0, colorSet.high);
        grad.addColorStop(0.5, colorSet.main);
        grad.addColorStop(1, colorSet.dark);
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.ellipse(0, 0, 64, 76, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon knot
        ctx.fillStyle = colorSet.dark;
        ctx.beginPath();
        ctx.moveTo(-6, 75);
        ctx.lineTo(6, 75);
        ctx.lineTo(9, 82);
        ctx.lineTo(-9, 82);
        ctx.closePath();
        ctx.fill();

        // Gloss highlight
        ctx.beginPath();
        ctx.ellipse(-22, -26, 12, 22, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Key hint (1, 2, 3)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 52, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText((b.idx + 1) + '', 0, 57);

        // Text in balloon
        var wrap = wrapText(b.text, 100, 22);
        ctx.font = 'bold ' + Math.max(16, wrap.size) + 'px system-ui';
        ctx.textAlign = 'center';
        var lineH = Math.max(16, wrap.size) * 1.15;
        var startY = -((wrap.lines.length - 1) * lineH) / 2 + 2;

        for (var i = 0; i < wrap.lines.length; i++) {
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.strokeText(wrap.lines[i], 0, startY + i * lineH);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(wrap.lines[i], 0, startY + i * lineH);
        }

        ctx.restore();
      }

      function drawHUD() {
        // Progress bar top
        var prog = Math.min(1, qIndex / 10);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, W, 6);
        ctx.fillStyle = '#00c851';
        ctx.fillRect(0, 0, W * prog, 6);

        // Hearts & Coins
        ctx.font = 'bold 20px system-ui';
        ctx.textAlign = 'left';
        var hStr = '';
        for (var i = 0; i < 3; i++) hStr += (i < lives ? '❤️' : '🖤');
        ctx.fillText(hStr, 20, 36);

        ctx.fillStyle = '#f57f17';
        ctx.fillText('🪙 ' + coins, 140, 36);

        ctx.fillStyle = '#0d47a1';
        ctx.textAlign = 'center';
        ctx.fillText('Pergunta ' + Math.min(10, qIndex) + '/10', W / 2, 36);

        // Close button '✖'
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(W - 32, 32, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✕', W - 32, 32);
        ctx.restore();
      }

      function drawExplainModal() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, W, H);

        var bw = Math.min(W * 0.85, 520);
        var bx = (W - bw) / 2;
        var by = H * 0.28;
        var bh = Math.min(H * 0.48, 300);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 20) : ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#d32f2f';
        ctx.stroke();

        ctx.fillStyle = '#d32f2f';
        ctx.font = 'bold 24px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('OPS! QUASE...', bx + bw / 2, by + 40);

        ctx.fillStyle = '#333';
        ctx.font = '16px system-ui';
        ctx.fillText('Resposta certa:', bx + bw / 2, by + 75);

        ctx.fillStyle = '#2e7d32';
        ctx.font = 'bold 22px system-ui';
        var rWrap = wrapText(currentQ.a, bw - 40, 22);
        ctx.fillText(rWrap.lines[0] || currentQ.a, bx + bw / 2, by + 105);

        ctx.fillStyle = '#555';
        ctx.font = '15px system-ui';
        var eWrap = wrapText(currentQ.e || '', bw - 40, 16);
        for (var i = 0; i < Math.min(eWrap.lines.length, 3); i++) {
          ctx.fillText(eWrap.lines[i], bx + bw / 2, by + 145 + i * 22);
        }

        // Continue prompt
        ctx.fillStyle = '#1976d2';
        ctx.font = 'bold 18px system-ui';
        ctx.fillText('Toque ou aperte ENTER para continuar ➔', bx + bw / 2, by + bh - 30);
      }

      function drawOverModal() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, W, H);

        var bw = Math.min(W * 0.85, 480);
        var bx = (W - bw) / 2;
        var by = H * 0.22;
        var bh = 340;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 24) : ctx.rect(bx, by, bw, bh);
        ctx.fill();

        ctx.font = 'bold 32px system-ui';
        ctx.fillStyle = score >= 7 ? '#2e7d32' : '#f57c00';
        ctx.textAlign = 'center';
        ctx.fillText(score >= 7 ? 'PARABÉNS! 🏆' : 'FIM DE JOGO! 🎈', bx + bw / 2, by + 55);

        ctx.fillStyle = '#333';
        ctx.font = '20px system-ui';
        ctx.fillText('Acertos: ' + score + ' de 10', bx + bw / 2, by + 115);
        ctx.fillText('Moedas ganhas: 🪙 ' + coins, bx + bw / 2, by + 155);

        // Buttons
        var cy = H * 0.65;
        // Jogar de novo
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(W * 0.5 - 140, cy - 25, 130, 50, 12) : ctx.rect(W * 0.5 - 140, cy - 25, 130, 50);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px system-ui';
        ctx.fillText('Jogar de novo', W * 0.5 - 75, cy + 6);

        // Sair
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(W * 0.5 + 10, cy - 25, 130, 50, 12) : ctx.rect(W * 0.5 + 10, cy - 25, 130, 50);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('Sair', W * 0.5 + 75, cy + 6);
      }

      function update(dt) {
        animTime += dt;
        pollGamepad();

        if (shake > 0) {
          shake -= dt * 30;
          if (shake < 0) shake = 0;
        }

        // Particles
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += (p.type === 'smoke' ? -0.05 : 0.2); // gravity / smoke rises
          p.life -= p.decay;
          if (p.life <= 0) particles.splice(i, 1);
        }

        if (state === 'COUNTDOWN') {
          countdownTimer -= dt;
          if (countdownTimer <= 0) nextQuestion();
        } else if (state === 'PLAY') {
          var count = options.length;
          var gap = W / (count + 1);
          var targetY = Math.max(H * 0.55, Math.min(H * 0.7, H - 180));

          for (var j = 0; j < count; j++) {
            var b = options[j];
            b.baseX = gap * (j + 1);
            b.x = b.baseX + Math.sin(animTime * 2 + j * 1.5) * 14;
            // Float up smoothly into place
            b.y += (targetY - b.y) * 0.08;
            b.y += Math.cos(animTime * 2.5 + j) * 1.2;
          }
        }
      }

      function render() {
        ctx.save();
        if (shake > 0) {
          var sx = (Math.random() - 0.5) * shake;
          var sy = (Math.random() - 0.5) * shake;
          ctx.translate(sx, sy);
        }

        drawSky();

        if (state === 'PLAY' || state === 'EXPLAIN') {
          drawQuestionBubble();
          for (var i = 0; i < options.length; i++) {
            var col = balloonColors[i % balloonColors.length];
            drawBalloon(options[i], col, i === selectedIdx);
          }
        }

        // Render Particles
        for (var p = 0; p < particles.length; p++) {
          var pt = particles[p];
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.life);
          ctx.fillStyle = pt.color;
          if (pt.type === 'rect') {
            ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
          } else if (pt.type === 'smoke') {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Star
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        drawHUD();

        if (state === 'COUNTDOWN') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, W, H);
          var txt = countdownTimer > 3 ? '3' : countdownTimer > 2 ? '2' : countdownTimer > 1 ? '1' : 'VAI!';
          ctx.fillStyle = '#ffeb3b';
          ctx.strokeStyle = '#e65100';
          ctx.lineWidth = 6;
          ctx.font = 'bold 90px system-ui';
          ctx.textAlign = 'center';
          ctx.strokeText(txt, W / 2, H / 2 + 30);
          ctx.fillText(txt, W / 2, H / 2 + 30);
        } else if (state === 'EXPLAIN') {
          drawExplainModal();
        } else if (state === 'OVER') {
          drawOverModal();
        }

        ctx.restore();
      }

      function loop(now) {
        if (!running) return;
        var dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        update(dt);
        render();
        reqId = requestAnimationFrame(loop);
      }
      reqId = requestAnimationFrame(loop);
    }
  };
})();