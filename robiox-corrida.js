(function() {
  window.RBX_CORRIDA = {
    start: function(api) {
      if (!api || !api.B) return;

      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;user-select:none;-webkit-user-select:none;touch-action:none;font-family:sans-serif;overflow:hidden;';
      
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
      var shake = 0;

      var gameState = 'COUNTDOWN'; // COUNTDOWN, RUNNING, RESULT_DELAY, EXPLANATION, GAMEOVER
      var countdownVal = 3;
      var countdownTimer = 60;

      var resultType = ''; 
      var resultTimer = 0;
      var qData = null;
      var themeId = 0; 
      var themeNames = ['CIRCUITO VELOZ', 'CHUTE A GOL ⚽', 'ALÇAPÃO MISTERIOSO'];
      var laneOptions = [null, null, null];
      var correctLane = 0;
      
      var particles = [];
      var clouds = [];
      for(var i=0; i<5; i++) clouds.push({x: Math.random()*2000, y: 50 + Math.random()*100, s: 0.5 + Math.random()});

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
            if (i !== correctLane) laneOptions[i] = wr[wIdx++] || '---';
          }
        }
        progress = 0;
        var dur = Math.max(3.5, 5.5 - qIndex * 0.25);
        gateSpeed = 1 / (dur * 60);
      }

      function getLanePos(t, lane) {
        var pScale = Math.pow(Math.max(0, Math.min(1, t)), 1.5);
        var horizonY = canvas.height * 0.42;
        var y = horizonY + (canvas.height - horizonY) * pScale;
        var wFar = canvas.width * 0.15;
        var wNear = canvas.width * 1.2;
        var trackW = wFar + (wNear - wFar) * pScale;
        var cx = canvas.width / 2;
        var laneW = trackW / 3;
        var x = cx + (lane - 1) * laneW;
        return { x: x, y: y, scale: pScale, trackW: trackW, laneW: laneW };
      }

      function drawText(txt, x, y, size, color, center, stroke) {
        ctx.font = 'bold ' + size + 'px sans-serif';
        ctx.textAlign = center ? 'center' : 'left';
        if (stroke) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.strokeText(txt, x, y);
        }
        ctx.fillStyle = color || '#FFF';
        ctx.fillText(txt, x, y);
      }

      function wrapText(text, x, y, maxW, lineH) {
        var words = (text||"").split(' '), line = '', ty = y;
        for (var n = 0; n < words.length; n++) {
          var test = line + words[n] + ' ';
          if (ctx.measureText(test).width > maxW && n > 0) {
            ctx.fillText(line, x, ty);
            line = words[n] + ' ';
            ty += lineH;
          } else line = test;
        }
        ctx.fillText(line, x, ty);
        return ty;
      }

      function spawnEffect(x, y, type) {if(window.RBX_FX&&!RBX_FX.on())return;
        var count = type === 'coin' ? 15 : 30;
        for (var i = 0; i < count; i++) {
          particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.8) * 15,
            life: 1.0,
            c: type === 'coin' ? '#FFD700' : 'hsl('+(Math.random()*360)+',100%,50%)',
            r: type === 'coin' ? 6 : 4 + Math.random()*4,
            type: type
          });
        }
      }

      function moveLeft() { if (gameState === 'RUNNING' && targetLane > 0) targetLane--; }
      function moveRight() { if (gameState === 'RUNNING' && targetLane < 2) targetLane++; }

      function handleInput(clientX, clientY) {
        var w = window.innerWidth, h = window.innerHeight;
        if (clientX > w - 60 && clientY < 60) { closeGame(); return; }
        if (gameState === 'EXPLANATION') {
          qIndex++;
          if (qIndex >= 10 || lives <= 0) gameState = 'GAMEOVER';
          else { nextQuestion(); gameState = 'RUNNING'; }
          return;
        }
        if (gameState === 'GAMEOVER') {
          var cx = canvas.width/2, cy = canvas.height/2, scale = canvas.width/w;
          var rx = clientX*scale, ry = clientY*scale;
          if (ry > cy + 40 && ry < cy + 100) {
            if (rx > cx - 180 && rx < cx - 10) { qIndex=0; lives=3; coins=0; combo=0; score=0; nextQuestion(); gameState='RUNNING'; }
            else if (rx > cx + 10 && rx < cx + 180) closeGame();
          }
          return;
        }
        if (gameState === 'RUNNING') {
          if (clientX < w / 2) moveLeft(); else moveRight();
        }
      }

      overlay.addEventListener('mousedown', function(e) { handleInput(e.clientX, e.clientY); });
      overlay.addEventListener('touchstart', function(e) { 
        var t = e.changedTouches[0];
        handleInput(t.clientX, t.clientY);
      }, {passive:false});
      window.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') moveLeft();
        if (e.key === 'ArrowRight') moveRight();
      });

      function closeGame() {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (api.onClose) api.onClose();
      }

      var padPrev = {l:false, r:false, a:false, b:false};
      function pollPad() {
        try {
          var gps = navigator.getGamepads ? navigator.getGamepads() : [], g = null, i;
          for (i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { g = gps[i]; break; }
          if (!g) return;
          var ax = g.axes[0] || 0, B = g.buttons;
          var l = ax < -0.5 || (B[14] && B[14].pressed), r = ax > 0.5 || (B[15] && B[15].pressed);
          var a = (B[0] && B[0].pressed) || (B[9] && B[9].pressed), b = B[1] && B[1].pressed;
          if (l && !padPrev.l) moveLeft();
          if (r && !padPrev.r) moveRight();
          if (a && !padPrev.a) {
            if (gameState === 'EXPLANATION') handleInput(10, 200);
            else if (gameState === 'GAMEOVER') { qIndex=0; lives=3; coins=0; combo=0; score=0; nextQuestion(); gameState='RUNNING'; }
          }
          if (b && !padPrev.b && gameState === 'GAMEOVER') closeGame();
          padPrev = {l: !!l, r: !!r, a: !!a, b: !!b};
        } catch (e) {}
      }

      function update() {
        pollPad();
        animTime += 0.15;
        currentLane += (targetLane - currentLane) * 0.2;
        if (shake > 0) shake *= 0.9;

        if (gameState === 'COUNTDOWN') {
          countdownTimer--;
          if (countdownTimer <= 0) {
            countdownVal--;
            countdownTimer = 60;
            if (countdownVal < 0) { gameState = 'RUNNING'; nextQuestion(); }
          }
        } else if (gameState === 'RUNNING') {
          progress += gateSpeed*(window.RBX_SPEED||1);
          stripeOffset = (stripeOffset + 0.15) % 2.0;
          if (progress >= 1.0) {
            var chosen = Math.round(currentLane);
            if (laneOptions[chosen] === qData.a) {
              resultType = 'SUCCESS'; coins++; combo++; score++;
              if (api.gain) api.gain(5 + combo, 1);
              if (api.log) api.log(qData, true, 1);
              if (api.say) api.say('BOA!', 1000);
              spawnEffect(canvas.width/2, canvas.height/2, 'confetti');
              spawnEffect(getLanePos(0.9, currentLane).x, getLanePos(0.9, currentLane).y - 100, 'coin');
              resultTimer = 60;
            } else {
              resultType = 'FAIL'; lives--; combo = 0; shake = 20;
              if (api.log) api.log(qData, false, 1);
              if (api.say) api.say('OPS!', 1000);
              resultTimer = 50;
            }
            gameState = 'RESULT_DELAY';
          }
        } else if (gameState === 'RESULT_DELAY') {
          resultTimer--;
          if (resultTimer <= 0) {
            if (resultType === 'SUCCESS') {
              qIndex++;
              if (qIndex >= 10) gameState = 'GAMEOVER';
              else { nextQuestion(); gameState = 'RUNNING'; }
            } else gameState = 'EXPLANATION';
          }
        }

        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.life -= 0.02;
          if (p.life <= 0) particles.splice(i, 1);
        }
        clouds.forEach(function(c) { c.x -= c.s * 0.5; if (c.x < -200) c.x = canvas.width + 200; });
      }

      function draw() {
        var W = canvas.width, H = canvas.height, hor = H * 0.42;
        ctx.save();
        if (shake > 1) ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);

        // Cenário da pista (ou céu de reserva)
        var bgOk = window.RBX_CENA && RBX_CENA.fundo(ctx, 0, 0, W, hor + 6, 'corrida', 0.5);
        if (!bgOk) {
          // Sky
          var g = ctx.createLinearGradient(0, 0, 0, hor);
          g.addColorStop(0, '#009FFF'); g.addColorStop(1, '#40E0D0');
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, hor);

          // Sun
          ctx.fillStyle = 'rgba(255,255,200,0.3)'; ctx.beginPath(); ctx.arc(W*0.8, 80, 100, 0, 7); ctx.fill();
          ctx.fillStyle = '#FFFFAA'; ctx.beginPath(); ctx.arc(W*0.8, 80, 40, 0, 7); ctx.fill();

          // Clouds
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          clouds.forEach(function(c){
            ctx.beginPath(); ctx.arc(c.x, c.y, 30*c.s, 0, 7); ctx.arc(c.x+35*c.s, c.y-10*c.s, 25*c.s, 0, 7); ctx.arc(c.x+60*c.s, c.y, 30*c.s, 0, 7); ctx.fill();
          });

          // Mountains
          ctx.fillStyle = '#4DB6AC';
          for(var i=0; i<4; i++) {
            var mx = (i*W/3 + animTime*2) % (W+400) - 200;
            ctx.beginPath(); ctx.moveTo(mx, hor); ctx.lineTo(mx+150, hor-80); ctx.lineTo(mx+300, hor); ctx.fill();
          }
        }

        var transCor = ctx.createLinearGradient(0, hor - 30, 0, hor + 8);
        transCor.addColorStop(0, 'rgba(46,125,50,0)');
        transCor.addColorStop(1, 'rgba(46,125,50,0.92)');
        ctx.fillStyle = transCor; ctx.fillRect(0, hor - 30, W, 38);

        // Ground
        ctx.fillStyle = '#2E7D32'; ctx.fillRect(0, hor, W, H-hor);
        for(var i=0; i<10; i++) {
          var ty = (i/10 + stripeOffset*0.05) % 1;
          var p1 = getLanePos(ty, -1), p2 = getLanePos(ty+0.05, -1);
          ctx.fillStyle = i%2===0 ? '#388E3C' : '#2E7D32';
          ctx.fillRect(0, p1.y, W, p2.y-p1.y);
        }

        // Track
        var pF = getLanePos(0, 1), pN = getLanePos(1, 1);
        ctx.fillStyle = '#BF360C'; // Athletics Red
        ctx.beginPath(); ctx.moveTo(W/2-pF.trackW/2, hor); ctx.lineTo(W/2+pF.trackW/2, hor);
        ctx.lineTo(W/2+pN.trackW/2, H); ctx.lineTo(W/2-pN.trackW/2, H); ctx.fill();

        // Zebras & Lines
        for(var i=0; i<15; i++) {
          var t1 = (i/15 + stripeOffset*0.1) % 1, t2 = t1 + 0.03;
          if (t2 > 1) continue;
          var lp1 = getLanePos(t1, -0.5), lp2 = getLanePos(t2, -0.5);
          var rp1 = getLanePos(t1, 2.5), rp2 = getLanePos(t2, 2.5);
          ctx.fillStyle = i%2===0 ? '#FFF' : '#D32F2F';
          ctx.beginPath(); ctx.moveTo(lp1.x-10, lp1.y); ctx.lineTo(lp2.x-15, lp2.y); ctx.lineTo(lp2.x+15, lp2.y); ctx.lineTo(lp1.x+10, lp1.y); ctx.fill();
          ctx.beginPath(); ctx.moveTo(rp1.x-10, rp1.y); ctx.lineTo(rp2.x-15, rp2.y); ctx.lineTo(rp2.x+15, rp2.y); ctx.lineTo(rp1.x+10, rp1.y); ctx.fill();
        }

        // Gates
        if (gameState === 'RUNNING' || gameState === 'RESULT_DELAY') {
          var laneColors = ['#2196F3', '#FF9800', '#4CAF50'];
          for (var l = 0; l < 3; l++) {
            var pos = getLanePos(progress, l);
            ctx.save(); ctx.translate(pos.x, pos.y);
            var gw = pos.laneW * 0.9, gh = 120 * pos.scale;
            
            if (themeId === 1) { // Gol
              ctx.strokeStyle = '#FFF'; ctx.lineWidth = 8*pos.scale;
              ctx.strokeRect(-gw/2, -gh, gw, gh);
              ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-gw/2, -gh, gw, gh);
              if (laneOptions[l]) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-gw/2, -gh-30*pos.scale, gw, 30*pos.scale);
                drawText(laneOptions[l], 0, -gh-8*pos.scale, Math.max(24, 52*pos.scale), '#FFD700', true, true);
              }
            } else if (themeId === 2) { // Alçapão
              var open = (gameState==='RESULT_DELAY' && progress>0.98 && l!==correctLane);
              ctx.fillStyle = open ? '#000' : '#5D4037';
              ctx.fillRect(-gw/2, -20*pos.scale, gw, 40*pos.scale);
              ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 2; ctx.strokeRect(-gw/2, -20*pos.scale, gw, 40*pos.scale);
              if (!open && laneOptions[l]) drawText(laneOptions[l], 0, 10*pos.scale, Math.max(24, 50*pos.scale), '#FFF', true, true);
            } else { // Pista
              ctx.fillStyle = laneColors[l]; ctx.fillRect(-gw/2, -gh, gw, gh);
              ctx.strokeStyle = '#FFF'; ctx.lineWidth = 4*pos.scale; ctx.strokeRect(-gw/2, -gh, gw, gh);
              if (laneOptions[l]) drawText(laneOptions[l], 0, -gh/2+10*pos.scale, Math.max(24, 52*pos.scale), '#FFF', true, true);
            }
            ctx.restore();
          }
        }

        // Runner
        var rp = getLanePos(0.85, currentLane);
        var rs = rp.scale * 1.8;
        ctx.save(); ctx.translate(rp.x, rp.y);
        ctx.rotate((targetLane - currentLane) * 0.15);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0,0, 30*rs, 10*rs, 0, 0, 7); ctx.fill();
        // Body
        var bob = Math.sin(animTime*10)*5*rs;
        ctx.fillStyle = pantsCol; ctx.fillRect(-12*rs, -40*rs+bob, 10*rs, 30*rs); ctx.fillRect(2*rs, -40*rs+bob, 10*rs, 30*rs);
        ctx.fillStyle = shirtCol; ctx.fillRect(-15*rs, -70*rs+bob, 30*rs, 35*rs);
        ctx.fillStyle = skinCol; ctx.fillRect(-12*rs, -95*rs+bob, 24*rs, 25*rs);
        ctx.fillStyle = hairCol; ctx.fillRect(-15*rs, -102*rs+bob, 30*rs, 10*rs);
        // Dust
        if (gameState==='RUNNING') {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          for(var d=0; d<3; d++) ctx.beginPath(); ctx.arc(-20*rs-Math.random()*20, 0, 5*rs, 0, 7); ctx.fill();
        }
        ctx.restore();

        // Ball for Theme 1
        if (themeId === 1 && (gameState==='RUNNING' || gameState==='RESULT_DELAY')) {
          var bp = getLanePos(0.88, currentLane);
          var bx = bp.x, by = bp.y + 10;
          if (gameState==='RESULT_DELAY' && resultType==='SUCCESS') {
            var t = (60-resultTimer)/60;
            by -= t*300; bx += (correctLane-1)*t*100;
          }
          ctx.fillStyle='#FFF'; ctx.beginPath(); ctx.arc(bx, by, 12*bp.scale, 0, 7); ctx.fill();
          ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.stroke();
        }

        // Particles
        particles.forEach(function(p){
          ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        });
        ctx.globalAlpha = 1;

        // UI - Question balloon (floating)
        if (qData && (gameState==='RUNNING' || gameState==='RESULT_DELAY')) {
          var bw = Math.min(W*0.94, 680), pad = 18, fz = 34, lines, lh;
          for (;;) {
            ctx.font = 'bold ' + fz + 'px Arial, sans-serif';
            var ws = String(qData.q).split(' '), ln = '', arr = [];
            for (var wi = 0; wi < ws.length; wi++) {
              var tt = ln ? ln + ' ' + ws[wi] : ws[wi];
              if (ctx.measureText(tt).width > bw - pad*2 && ln) { arr.push(ln); ln = ws[wi]; } else ln = tt;
            }
            arr.push(ln); lines = arr; lh = fz * 1.2;
            if ((arr.length * lh + 44 <= H * 0.34) || fz <= 17) break;
            fz -= 2;
          }
          var bh = lines.length * lh + 44, bx = W/2 - bw/2, by = 62 + Math.sin(animTime * 0.5) * 4;
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
          ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 5;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 26); else ctx.rect(bx, by, bw, bh);
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.stroke();
          // tail
          ctx.beginPath(); ctx.moveTo(W/2 - 22, by + bh - 1); ctx.lineTo(W/2, by + bh + 26); ctx.lineTo(W/2 + 22, by + bh - 1);
          ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(W/2 - 22, by + bh); ctx.lineTo(W/2, by + bh + 26); ctx.lineTo(W/2 + 22, by + bh); ctx.stroke();
          ctx.restore();
          // mode tag
          ctx.fillStyle = '#F59E0B'; ctx.font = 'bold 13px Arial, sans-serif'; ctx.textAlign = 'left';
          var tg = themeNames[themeId], tw = ctx.measureText(tg).width + 20;
          ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx + 16, by - 12, tw, 24, 12); else ctx.rect(bx + 16, by - 12, tw, 24); ctx.fill();
          ctx.fillStyle = '#1E1B4B'; ctx.fillText(tg, bx + 26, by + 5);
          // text
          ctx.fillStyle = '#0F172A'; ctx.font = 'bold ' + fz + 'px Arial, sans-serif'; ctx.textAlign = 'center';
          for (var li = 0; li < lines.length; li++) ctx.fillText(lines[li], W/2, by + 32 + fz * 0.8 + li * lh - 6);
          ctx.textAlign = 'left';
        }

        // HUD
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, 50);
        drawText('PERGUNTA: ' + (qIndex+1) + '/10', 20, 32, 18, '#FFF');
        var hts = ''; for(var i=0; i<3; i++) hts += i<lives ? '❤️' : '🖤';
        drawText(hts, W/2, 32, 20, '#FFF', true);
        drawText('🪙 ' + coins, W-100, 32, 18, '#FFD700');
        drawText('✖', W-30, 32, 22, '#FF5252', true);

        // Progress Bar
        ctx.fillStyle = '#37474F'; ctx.fillRect(W/2-100, 40, 200, 6);
        ctx.fillStyle = '#00E676'; ctx.fillRect(W/2-100, 40, (qIndex/10)*200, 6);

        if (gameState === 'COUNTDOWN') {
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0,0,W,H);
          drawText(countdownVal > 0 ? countdownVal : 'VAI!', W/2, H/2, 120, '#FFF', true, true);
        }

        if (gameState === 'EXPLANATION') {
          ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
          var ew = Math.min(W*0.85, 500), eh = 300, ex = W/2-ew/2, ey = H/2-eh/2;
          ctx.fillStyle = '#1A237E'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(ex, ey, ew, eh, 20) : ctx.rect(ex, ey, ew, eh); ctx.fill();
          drawText('RESPOSTA CORRETA:', ex+30, ey+50, 18, '#4FC3F7');
          drawText(qData.a, ex+30, ey+85, 24, '#00E676');
          ctx.fillStyle = '#FFF'; wrapText(qData.e, ex+30, ey+125, ew-60, 22);
          ctx.fillStyle = '#00E676'; ctx.fillRect(W/2-80, ey+eh-60, 160, 40);
          drawText('CONTINUAR', W/2, ey+eh-33, 18, '#000', true);
        }

        if (gameState === 'GAMEOVER') {
          ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0,0,W,H);
          drawText('FIM DE JOGO!', W/2, H/2-80, 40, '#FFF', true, true);
          drawText('Pontuação: ' + score + ' / 10', W/2, H/2-30, 22, '#FFF', true);
          drawText('Moedas: 🪙 ' + coins, W/2, H/2+10, 22, '#FFD700', true);
          ctx.fillStyle = '#00E676'; ctx.fillRect(W/2-180, H/2+50, 170, 50);
          drawText('REPETIR', W/2-95, H/2+82, 18, '#000', true);
          ctx.fillStyle = '#FF5252'; ctx.fillRect(W/2+10, H/2+50, 170, 50);
          drawText('SAIR', W/2+95, H/2+82, 18, '#FFF', true);
        }

        ctx.restore();
        animId = requestAnimationFrame(gameLoop);
      }

      function gameLoop() { update(); draw(); }
      gameLoop();
    }
  };
})();
