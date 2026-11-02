(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  window.RBX_JOGOS['portas'] = {
    nome: 'Portas Misteriosas 🚪',
    icone: '🚪',
    desc: 'Escolha a porta certa',
    start: function (api) {
      api = api || {};
      var root = document.createElement('div');
      root.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0d0914;font-family:sans-serif;touch-action:none;user-select:none;overflow:hidden;';
      
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      root.appendChild(canvas);

      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✖';
      closeBtn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:10;width:44px;height:44px;background:#e74c3c;color:#fff;border:none;border-radius:50%;font-size:22px;font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;outline:none;';
      root.appendChild(closeBtn);
      document.body.appendChild(root);

      var ctx = canvas.getContext('2d');
      var animId = null;
      var active = true;

      // Game state
      var state = 'COUNTDOWN'; // COUNTDOWN, QUESTION_WAIT, WALKING, DOOR_OPEN, RESULT_ANIM, EXPLANATION, GAME_OVER
      var countdownVal = 3;
      var countdownTimer = 0;
      var lives = 3;
      var qIndex = 0;
      var maxQuestions = 10;
      var coins = 0;
      var combo = 0;
      var currentQ = null;
      var selectedIdx = 0;
      var targetDoorIdx = -1;
      var isCorrect = false;

      // Animation parameters
      var w = 800, h = 600, dpr = 1;
      var time = 0;
      var shake = 0;
      var particles = [];
      var doors = [];
      var charPos = { x: 400, y: 480, targetX: 400, walkFrame: 0, walking: false };
      var doorOpenProgress = 0;
      var explanationDelay = 0;

      // Avatar colors
      var av = api.avatarColors || {};
      var colors = {
        skin: av.skin || '#ffdbac',
        shirt: av.shirt || '#3498db',
        pants: av.pants || '#2c3e50',
        hair: av.hair || '#4a3728'
      };

      // Input tracking
      var prevGP = {};

      function getBalloonMetrics() {
        var bW = Math.min(w * 0.88, 700);
        var bY = 50;
        var maxReserved = h * 0.34;
        
        var lineCount = 1;
        if (currentQ && currentQ.text) {
          ctx.save();
          ctx.font = 'bold 22px sans-serif';
          var lines = wrapTextLines(ctx, currentQ.text, bW - 40);
          ctx.restore();
          lineCount = Math.max(lines.length, 1);
        }
        
        var desiredBH = 36 + lineCount * 28;
        var maxBH = Math.max(70, maxReserved - bY - 16);
        var bH = Math.min(desiredBH, maxBH);
        var reservedTop = Math.min(maxReserved, bY + bH + 18);

        return {
          w: bW,
          h: bH,
          x: (w - bW) / 2,
          y: bY,
          reservedTop: reservedTop
        };
      }

      function resize() {
        dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        if (currentQ) setupDoorPositions();
      }
      window.addEventListener('resize', resize);
      resize();

      function getTopics() {
        if (api.topics && typeof api.topics === 'function') {
          var t = api.topics();
          if (t && t.length) return t;
        }
        return ['Geral'];
      }

      function loadQuestion() {
        var topics = getTopics();
        var topic = topics[Math.floor(Math.random() * topics.length)];
        var ano = api.ANO || 6;
        var tier = api.tier ? api.tier() : 1;
        var qData = api.B ? api.B.make(ano, topic, tier) : {
          q: "Quanto é 5 + 5?", a: "10", d: ["8", "12", "15"], e: "5 mais 5 resulta em 10."
        };
        var isEasy = api.easy ? api.easy() : false;
        var numOpts = isEasy ? 2 : 3;

        var wrong = (qData.d || []).slice();
        wrong.sort(function () { return Math.random() - 0.5; });
        var opts = [qData.a];
        for (var i = 0; i < numOpts - 1; i++) {
          if (wrong[i] !== undefined) opts.push(wrong[i]);
        }
        opts.sort(function () { return Math.random() - 0.5; });

        currentQ = {
          raw: qData,
          text: qData.q || '',
          choices: opts,
          correctIdx: opts.indexOf(qData.a),
          exp: qData.e || ('Resposta correta: ' + qData.a)
        };

        selectedIdx = 0;
        setupDoorPositions();
      }

      function setupDoorPositions() {
        doors = [];
        if (!currentQ) return;

        var bm = getBalloonMetrics();
        var reservedTop = bm.reservedTop;
        var availH = h - reservedTop;

        var plaqueH = Math.max(46, Math.min(65, availH * 0.16));
        var doorH = Math.max(90, Math.min(190, availH * 0.38));
        var doorW = Math.max(60, Math.min(130, w * 0.22, doorH * 0.68));
        var plaqueW = Math.max(doorW + 20, Math.min(w * 0.28, 160));
        var doorBaseY = reservedTop + 14 + plaqueH + 12 + doorH;

        var num = currentQ.choices.length;
        var spacing = w / (num + 1);
        for (var i = 0; i < num; i++) {
          doors.push({
            x: spacing * (i + 1),
            y: doorBaseY,
            w: doorW,
            h: doorH,
            plaqueW: plaqueW,
            plaqueH: plaqueH,
            text: currentQ.choices[i]
          });
        }

        charPos.y = Math.min(h - 25, doorBaseY + Math.max(50, (h - doorBaseY) * 0.55));
        if (!charPos.walking) {
          charPos.x = w / 2;
          charPos.targetX = w / 2;
        }
      }

      function startNextRound() {
        if (qIndex >= maxQuestions || lives <= 0) {
          state = 'GAME_OVER';
          return;
        }
        qIndex++;
        loadQuestion();
        state = 'QUESTION_WAIT';
      }

      function triggerChoice(idx) {
        if (state !== 'QUESTION_WAIT') return;
        targetDoorIdx = idx;
        selectedIdx = idx;
        charPos.targetX = doors[idx].x;
        charPos.walking = true;
        state = 'WALKING';
      }

      // Graphics Utilities
      function roundRect(c, x, y, width, height, radius, fill, stroke) {
        if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
        c.beginPath();
        c.moveTo(x + radius.tl, y);
        c.lineTo(x + width - radius.tr, y);
        c.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        c.lineTo(x + width, y + height - radius.br);
        c.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        c.lineTo(x + radius.bl, y + height);
        c.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        c.lineTo(x, y + radius.tl);
        c.quadraticCurveTo(x, y, x + radius.tl, y);
        c.closePath();
        if (fill) c.fill();
        if (stroke) c.stroke();
      }

      function drawTextAutoFit(c, text, x, y, maxW, maxH, minFont, maxFont, color) {
        var fontSize = maxFont;
        c.save();
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        
        while (fontSize >= minFont) {
          c.font = 'bold ' + fontSize + 'px sans-serif';
          var lines = wrapTextLines(c, text, maxW);
          var totalH = lines.length * fontSize * 1.25;
          if (totalH <= maxH) {
            var startY = y - (totalH / 2) + (fontSize * 0.6);
            for (var l = 0; l < lines.length; l++) {
              c.lineWidth = 4;
              c.strokeStyle = '#000';
              c.strokeText(lines[l], x, startY + l * fontSize * 1.25);
              c.fillStyle = color || '#fff';
              c.fillText(lines[l], x, startY + l * fontSize * 1.25);
            }
            c.restore();
            return;
          }
          fontSize -= 2;
        }

        c.font = 'bold ' + minFont + 'px sans-serif';
        var fallbackLines = wrapTextLines(c, text, maxW);
        var fTotalH = fallbackLines.length * minFont * 1.25;
        var fStartY = y - (fTotalH / 2) + (minFont * 0.6);
        for (var k = 0; k < Math.min(fallbackLines.length, 3); k++) {
          c.lineWidth = 3;
          c.strokeStyle = '#000';
          c.strokeText(fallbackLines[k], x, fStartY + k * minFont * 1.25);
          c.fillStyle = color || '#fff';
          c.fillText(fallbackLines[k], x, fStartY + k * minFont * 1.25);
        }
        c.restore();
      }

      function wrapTextLines(c, text, maxW) {
        var words = text.split(' ');
        var lines = [];
        var current = words[0] || '';
        for (var i = 1; i < words.length; i++) {
          var word = words[i];
          var width = c.measureText(current + ' ' + word).width;
          if (width < maxW) {
            current += ' ' + word;
          } else {
            lines.push(current);
            current = word;
          }
        }
        lines.push(current);
        return lines;
      }

      // Drawing Elements
      function drawBackground() {
        var bm = getBalloonMetrics();
        var reservedTop = bm.reservedTop;
        var availH = h - reservedTop;

        // Castle wall gradient
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#150d2a');
        grad.addColorStop(0.5, '#261746');
        grad.addColorStop(1, '#0d071b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Perspective floor
        var floorY = doors.length > 0 ? (doors[0].y - 8) : (reservedTop + availH * 0.55);
        var floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
        floorGrad.addColorStop(0, '#1a1829');
        floorGrad.addColorStop(1, '#090810');
        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(w, floorY);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

        // Floor tiles perspective lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        var numLines = 10;
        for (var i = 0; i <= numLines; i++) {
          var px = (w / numLines) * i;
          ctx.beginPath();
          ctx.moveTo(px, floorY);
          ctx.lineTo((px - w / 2) * 1.8 + w / 2, h);
          ctx.stroke();
        }
        for (var j = 1; j <= 5; j++) {
          var py = floorY + (h - floorY) * (j / 5) * (j / 5);
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(w, py);
          ctx.stroke();
        }

        // Wall Torches
        var torchXs = [w * 0.08, w * 0.92];
        var ty = reservedTop + availH * 0.28;
        for (var t = 0; t < torchXs.length; t++) {
          var tx = torchXs[t];
          ctx.fillStyle = '#5c3d2e';
          ctx.fillRect(tx - 6, ty, 12, 30);
          ctx.fillStyle = '#f39c12';
          ctx.beginPath();
          ctx.arc(tx, ty, 8, 0, Math.PI * 2);
          ctx.fill();

          var glow = ctx.createRadialGradient(tx, ty - 10, 2, tx, ty - 10, 45);
          glow.addColorStop(0, 'rgba(255, 200, 50, 0.6)');
          glow.addColorStop(1, 'rgba(255, 100, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(tx, ty - 10, 45, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.4) {
            particles.push({
              x: tx + (Math.random() - 0.5) * 10,
              y: ty - 10,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -Math.random() * 1.5 - 0.5,
              life: 1,
              decay: 0.03,
              color: Math.random() > 0.5 ? '#ffec00' : '#ff4500',
              size: Math.random() * 4 + 2
            });
          }
        }
      }

      function drawDoors() {
        for (var i = 0; i < doors.length; i++) {
          var d = doors[i];
          var isSel = (state === 'QUESTION_WAIT' && selectedIdx === i);
          
          ctx.save();
          ctx.translate(d.x, d.y);

          // Selection highlight glow
          if (isSel) {
            ctx.shadowColor = '#f1c40f';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 6;
            roundRect(ctx, -d.w / 2 - 4, -d.h - 4, d.w + 8, d.h + 8, 12, false, true);
            ctx.shadowBlur = 0;
          }

          // Door Arch Frame
          ctx.fillStyle = '#34495e';
          roundRect(ctx, -d.w / 2 - 6, -d.h - 6, d.w + 12, d.h + 12, { tl: d.w / 2, tr: d.w / 2, bl: 4, br: 4 }, true, false);

          // Inner Door Opening (if open)
          var openAngle = (targetDoorIdx === i) ? doorOpenProgress : 0;
          ctx.fillStyle = isCorrect ? '#f39c12' : '#05030a';
          roundRect(ctx, -d.w / 2, -d.h, d.w, d.h, { tl: d.w / 2, tr: d.w / 2, bl: 2, br: 2 }, true, false);

          // Open Door Light Glow
          if (openAngle > 0.3 && isCorrect) {
            var lightGrad = ctx.createRadialGradient(0, -d.h / 2, 10, 0, -d.h / 2, 180);
            lightGrad.addColorStop(0, 'rgba(255, 240, 150, 0.9)');
            lightGrad.addColorStop(1, 'rgba(241, 196, 15, 0)');
            ctx.fillStyle = lightGrad;
            ctx.beginPath();
            ctx.arc(0, -d.h / 2, 180, 0, Math.PI * 2);
            ctx.fill();
          }

          // Door Leaf (Transforms for opening)
          ctx.save();
          var doorW = d.w * Math.cos(openAngle * (Math.PI / 2.2));
          ctx.fillStyle = isSel ? '#8e44ad' : '#5d4037';

          roundRect(ctx, -d.w / 2, -d.h, doorW, d.h, { tl: d.w / 2, tr: d.w / 2, bl: 2, br: 2 }, true, false);

          // Door Knob
          if (doorW > 15) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(-d.w / 2 + doorW - 14, -d.h / 2, 6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Plaque Above Door (Choice Text Container)
          var plaqueW = d.plaqueW || Math.max(d.w + 20, 160);
          var plaqueH = d.plaqueH || 70;
          var plaqueY = -d.h - plaqueH - 12;

          ctx.fillStyle = isSel ? '#2980b9' : '#1f2430';
          ctx.strokeStyle = isSel ? '#f1c40f' : '#7f8c8d';
          ctx.lineWidth = 4;
          roundRect(ctx, -plaqueW / 2, plaqueY, plaqueW, plaqueH, 10, true, true);

          // Number Label Badge (1, 2, 3)
          var badgeR = Math.min(14, plaqueH * 0.22);
          ctx.fillStyle = isSel ? '#e67e22' : '#34495e';
          ctx.beginPath();
          ctx.arc(-plaqueW / 2 + badgeR + 4, plaqueY + badgeR + 4, badgeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold ' + Math.round(badgeR) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((i + 1).toString(), -plaqueW / 2 + badgeR + 4, plaqueY + badgeR + 4);

          // Render choice text inside plaque
          drawTextAutoFit(ctx, d.text, 0, plaqueY + plaqueH / 2, plaqueW - (badgeR * 2 + 16), plaqueH - 10, 16, 26, '#ffffff');

          ctx.restore();
        }
      }

      function drawAvatar() {
        ctx.save();
        ctx.translate(charPos.x, charPos.y);

        var bounce = charPos.walking ? Math.abs(Math.sin(time * 12)) * 8 : Math.sin(time * 3) * 2;
        var legSwing = charPos.walking ? Math.sin(time * 12) * 12 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 15, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, -bounce);

        // Legs
        ctx.fillStyle = colors.pants;
        ctx.fillRect(-12, -20, 8, 22 + legSwing);
        ctx.fillRect(4, -20, 8, 22 - legSwing);

        // Body (Shirt)
        ctx.fillStyle = colors.shirt;
        roundRect(ctx, -16, -50, 32, 32, 6, true, false);

        // Head
        ctx.fillStyle = colors.skin;
        roundRect(ctx, -14, -76, 28, 24, 6, true, false);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(-8, -66, 4, 4);
        ctx.fillRect(4, -66, 4, 4);

        // Hair
        ctx.fillStyle = colors.hair;
        roundRect(ctx, -16, -82, 32, 12, 4, true, false);

        ctx.restore();
      }

      function drawBalloon() {
        if (!currentQ) return;
        ctx.save();

        var bm = getBalloonMetrics();
        var bW = bm.w;
        var bH = bm.h;
        var bX = bm.x;
        var bY = bm.y + Math.sin(time * 2) * 2;

        // Balloon Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        roundRect(ctx, bX + 4, bY + 4, bW, bH, 18, true, false);

        // White Speech Balloon Body
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e3799';
        ctx.lineWidth = 5;
        roundRect(ctx, bX, bY, bW, bH, 18, true, true);

        // Balloon Tail
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 12, bY + bH);
        ctx.lineTo(w / 2 + 12, bY + bH);
        ctx.lineTo(w / 2, bY + bH + 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e3799';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 12, bY + bH - 2);
        ctx.lineTo(w / 2, bY + bH + 12);
        ctx.lineTo(w / 2 + 12, bY + bH - 2);
        ctx.stroke();

        // Game Title Tag (Orange Pill)
        var tagW = 190;
        var tagH = 26;
        var tagX = bX + 24;
        var tagY = bY - 13;
        ctx.fillStyle = '#e67e22';
        roundRect(ctx, tagX, tagY, tagW, tagH, 13, true, false);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(window.RBX_JOGOS['portas'].nome, tagX + tagW / 2, tagY + tagH / 2);

        // Question Text Auto-fit inside balloon
        drawTextAutoFit(ctx, currentQ.text, w / 2, bY + bH / 2 + 4, bW - 40, bH - 20, 18, 30, '#2c3e50');

        ctx.restore();
      }

      function drawHUD() {
        ctx.save();

        // Hearts (Lives) - Top Left
        for (var i = 0; i < 3; i++) {
          ctx.font = '26px sans-serif';
          ctx.fillStyle = i < lives ? '#e74c3c' : '#7f8c8d';
          ctx.fillText('❤️', 20 + i * 34, 40);
        }

        // Progress Bar - Top Center
        var pW = Math.min(220, w * 0.3);
        var pH = 14;
        var pX = (w - pW) / 2;
        var pY = 20;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, pX, pY, pW, pH, 7, true, false);
        var progressRatio = Math.min(1, Math.max(0, qIndex / maxQuestions));
        ctx.fillStyle = '#2ecc71';
        roundRect(ctx, pX, pY, pW * progressRatio, pH, 7, true, false);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pergunta ' + qIndex + ' / ' + maxQuestions, w / 2, pY + 26);

        // Coins / Score - Top Right
        ctx.textAlign = 'right';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#f1c40f';
        ctx.fillText('🪙 ' + coins, w - 70, 40);

        ctx.restore();
      }

      function drawParticles() {
        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= p.decay;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      function drawExplanationModal() {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, w, h);

        var boxW = Math.min(550, w * 0.85);
        var boxH = 260;
        var boxX = (w - boxW) / 2;
        var boxY = (h - boxH) / 2;

        ctx.fillStyle = '#1e272c';
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 4;
        roundRect(ctx, boxX, boxY, boxW, boxH, 16, true, true);

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ops! Porta Errada 🚪💥', w / 2, boxY + 45);

        drawTextAutoFit(ctx, currentQ.exp, w / 2, boxY + 120, boxW - 40, 90, 18, 24, '#ecf0f1');

        var btnW = 200, btnH = 45;
        var btnX = (w - btnW) / 2;
        var btnY = boxY + boxH - 60;
        ctx.fillStyle = '#e67e22';
        roundRect(ctx, btnX, btnY, btnW, btnH, 22, true, false);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Continuar (A / ↵)', w / 2, btnY + 27);

        ctx.restore();
      }

      function drawGameOverScreen() {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 8, 20, 0.9)';
        ctx.fillRect(0, 0, w, h);

        var isWin = lives > 0;
        var title = isWin ? 'Parabéns! Vitória! 🏆' : 'Fim de Jogo! 🚪';
        var color = isWin ? '#2ecc71' : '#e74c3c';

        ctx.fillStyle = color;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, w / 2, h * 0.3);

        ctx.fillStyle = '#fff';
        ctx.font = '22px sans-serif';
        ctx.fillText('Perguntas respondidas: ' + (qIndex) + ' / ' + maxQuestions, w / 2, h * 0.42);
        ctx.fillText('Moedas coletadas: 🪙 ' + coins, w / 2, h * 0.49);

        var btnW = 200, btnH = 50;
        var btn1X = w / 2 - btnW - 15;
        var btn2X = w / 2 + 15;
        var btnY = h * 0.65;

        ctx.fillStyle = (selectedIdx === 0) ? '#27ae60' : '#2ecc71';
        if (selectedIdx === 0) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
        }
        roundRect(ctx, btn1X, btnY, btnW, btnH, 12, true, selectedIdx === 0);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Jogar de novo', btn1X + btnW / 2, btnY + 30);

        ctx.fillStyle = (selectedIdx === 1) ? '#c0392b' : '#e74c3c';
        if (selectedIdx === 1) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 4;
        }
        roundRect(ctx, btn2X, btnY, btnW, btnH, 12, true, selectedIdx === 1);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Sair', btn2X + btnW / 2, btnY + 30);

        ctx.restore();
      }

      function drawCountdown() {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 80px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var txt = countdownVal > 0 ? countdownVal.toString() : 'VAI!';
        ctx.fillText(txt, w / 2, h / 2);
        ctx.restore();
      }

      function createConfetti() {
        for (var i = 0; i < 60; i++) {
          particles.push({
            x: charPos.x,
            y: charPos.y - 60,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 8 - 4,
            life: 1.0,
            decay: Math.random() * 0.02 + 0.015,
            color: ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'][Math.floor(Math.random() * 5)],
            size: Math.random() * 6 + 4
          });
        }
      }

      // Main Loop Update Logic
      function update(dt) {
        time += dt;

        if (shake > 0) shake -= dt * 10;

        if (state === 'COUNTDOWN') {
          countdownTimer += dt;
          if (countdownTimer >= 0.8) {
            countdownTimer = 0;
            countdownVal--;
            if (countdownVal < 0) {
              startNextRound();
            }
          }
          return;
        }

        if (state === 'WALKING') {
          var dx = charPos.targetX - charPos.x;
          if (Math.abs(dx) > 4) {
            charPos.x += (dx > 0 ? 1 : -1) * Math.min(Math.abs(dx), 300 * dt);
          } else {
            charPos.x = charPos.targetX;
            charPos.walking = false;
            state = 'DOOR_OPEN';
            doorOpenProgress = 0;
          }
        }

        if (state === 'DOOR_OPEN') {
          doorOpenProgress += dt * 3;
          if (doorOpenProgress >= 1) {
            doorOpenProgress = 1;
            isCorrect = (targetDoorIdx === currentQ.correctIdx);

            if (isCorrect) {
              combo++;
              var gainedXp = 5 + combo;
              var gainedCoins = 1;
              coins += gainedCoins;
              if (api.gain) api.gain(gainedXp, gainedCoins);
              if (api.log) api.log(currentQ.raw, true, 1);
              if (api.say) api.say('BOA!', 1000);
              createConfetti();
              state = 'RESULT_ANIM';
              explanationDelay = 0;
            } else {
              combo = 0;
              lives--;
              shake = 1.0;
              if (api.log) api.log(currentQ.raw, false, 1);
              state = 'RESULT_ANIM';
              explanationDelay = 0;
            }
          }
        }

        if (state === 'RESULT_ANIM') {
          explanationDelay += dt;
          if (explanationDelay >= 1.2) {
            if (!isCorrect) {
              state = 'EXPLANATION';
            } else {
              startNextRound();
            }
          }
        }

        pollGamepad();
      }

      function pollGamepad() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        var gp = null;
        for (var i = 0; i < gamepads.length; i++) {
          if (gamepads[i]) { gp = gamepads[i]; break; }
        }
        if (!gp) return;

        var ax = gp.axes[0] || 0;
        var btnA = gp.buttons[0] && gp.buttons[0].pressed;
        var btnB = gp.buttons[1] && gp.buttons[1].pressed;
        var dLeft = gp.buttons[14] && gp.buttons[14].pressed;
        var dRight = gp.buttons[15] && gp.buttons[15].pressed;

        var leftJust = (ax < -0.5 || dLeft) && !prevGP.left;
        var rightJust = (ax > 0.5 || dRight) && !prevGP.right;
        var aJust = btnA && !prevGP.a;
        var bJust = btnB && !prevGP.b;

        prevGP.left = (ax < -0.5 || dLeft);
        prevGP.right = (ax > 0.5 || dRight);
        prevGP.a = btnA;
        prevGP.b = btnB;

        if (state === 'QUESTION_WAIT') {
          if (leftJust) selectedIdx = Math.max(0, selectedIdx - 1);
          if (rightJust) selectedIdx = Math.min(doors.length - 1, selectedIdx + 1);
          if (aJust) triggerChoice(selectedIdx);
        } else if (state === 'EXPLANATION') {
          if (aJust) startNextRound();
        } else if (state === 'GAME_OVER') {
          if (leftJust) selectedIdx = 0;
          if (rightJust) selectedIdx = 1;
          if (aJust) {
            if (selectedIdx === 0) restartGame();
            else destroy();
          }
          if (bJust) destroy();
        }
      }

      function restartGame() {
        lives = 3;
        qIndex = 0;
        coins = 0;
        combo = 0;
        countdownVal = 3;
        countdownTimer = 0;
        state = 'COUNTDOWN';
      }

      function onKeyDown(e) {
        if (!active) return;
        if (state === 'QUESTION_WAIT') {
          if (e.key === '1') triggerChoice(0);
          if (e.key === '2' && doors.length > 1) triggerChoice(1);
          if (e.key === '3' && doors.length > 2) triggerChoice(2);
          if (e.key === 'ArrowLeft') selectedIdx = Math.max(0, selectedIdx - 1);
          if (e.key === 'ArrowRight') selectedIdx = Math.min(doors.length - 1, selectedIdx + 1);
          if (e.key === 'Enter' || e.key === ' ') triggerChoice(selectedIdx);
        } else if (state === 'EXPLANATION') {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'a') startNextRound();
        } else if (state === 'GAME_OVER') {
          if (e.key === 'ArrowLeft') selectedIdx = 0;
          if (e.key === 'ArrowRight') selectedIdx = 1;
          if (e.key === 'Enter' || e.key === ' ') {
            if (selectedIdx === 0) restartGame();
            else destroy();
          }
        }
      }

      function onPointerDown(e) {
        if (!active) return;
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;

        if (state === 'QUESTION_WAIT') {
          for (var i = 0; i < doors.length; i++) {
            var d = doors[i];
            var pH = d.plaqueH || 70;
            if (mx >= d.x - d.w / 2 - 20 && mx <= d.x + d.w / 2 + 20 && my >= d.y - d.h - pH - 15 && my <= d.y + 20) {
              triggerChoice(i);
              return;
            }
          }
        } else if (state === 'EXPLANATION') {
          startNextRound();
        } else if (state === 'GAME_OVER') {
          var btnW = 200, btnH = 50;
          var btn1X = w / 2 - btnW - 15;
          var btn2X = w / 2 + 15;
          var btnY = h * 0.65;
          if (my >= btnY && my <= btnY + btnH) {
            if (mx >= btn1X && mx <= btn1X + btnW) restartGame();
            if (mx >= btn2X && mx <= btn2X + btnW) destroy();
          }
        }
      }

      window.addEventListener('keydown', onKeyDown);
      canvas.addEventListener('pointerdown', onPointerDown);

      closeBtn.onclick = function (e) {
        e.stopPropagation();
        destroy();
      };

      function destroy() {
        active = false;
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKeyDown);
        canvas.removeEventListener('pointerdown', onPointerDown);
        if (root.parentNode) root.parentNode.removeChild(root);
        if (api.onClose) api.onClose();
      }

      var lastTime = performance.now();
      function loop(now) {
        if (!active) return;
        var dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        update(dt);

        ctx.save();
        ctx.scale(dpr, dpr);

        if (shake > 0) {
          var sx = (Math.random() - 0.5) * shake * 15;
          var sy = (Math.random() - 0.5) * shake * 15;
          ctx.translate(sx, sy);
        }

        drawBackground();
        drawDoors();
        drawAvatar();
        drawParticles();
        drawBalloon();
        drawHUD();

        if (state === 'COUNTDOWN') drawCountdown();
        if (state === 'EXPLANATION') drawExplanationModal();
        if (state === 'GAME_OVER') drawGameOverScreen();

        ctx.restore();

        animId = requestAnimationFrame(loop);
      }

      animId = requestAnimationFrame(loop);
    }
  };
})();