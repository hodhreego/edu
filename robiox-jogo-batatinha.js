(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};

  var ID = 'batatinha-frita';
  var NOME = 'Batatinha Frita 1, 2, 3 🚦';
  var EMOJI = '🚦';
  var DESCRICAO = 'Corra na luz verde e resolva o desafio na luz vermelha!';

  window.RBX_JOGOS[ID] = {
    nome: NOME,
    icone: EMOJI,
    desc: DESCRICAO,
    start: function (api) {
      var dpr = window.devicePixelRatio || 1;
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#87ceeb;user-select:none;touch-action:none;font-family:sans-serif;overflow:hidden;';
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      wrap.appendChild(canvas);

      var closeBtn = document.createElement('div');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:40px;height:40px;background:rgba(0,0,0,0.5);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:10;';
      closeBtn.onclick = function() { closeGame(); };
      wrap.appendChild(closeBtn);

      document.body.appendChild(wrap);

      var ctx = canvas.getContext('2d');
      var W, H, animId, destroyed = false;
      var colors = api.avatarColors || { skin: '#ffcc88', shirt: '#29b6f6', pants: '#1e88e5', hair: '#5d4037' };

      var state = 'COUNTDOWN'; // COUNTDOWN, SINGING, TURNING, QUESTION, FEEDBACK, GAMEOVER, VICTORY
      var lives = 3;
      var progress = 0; // 0 a 100
      var timer = 3;
      var dollRot = 0; // 0 = costas, 1 = frente
      var syllables = ["Ba-", "ta-", "ti-", "nha ", "fri-", "ta ", "1, ", "2, ", "3!"];
      var currentSyllableIdx = 0;
      var singDuration = 3;
      var singElapsed = 0;
      var currentQ = null;
      var selectedOpt = 0;
      var feedbackText = "";
      var feedbackTimer = 0;
      var combo = 0;
      var particles = [];
      var keys = {};
      var lastGamepadBtn = {};

      function getQuestion() {
        var topics = api.topics ? api.topics() : ['Geral'];
        var tema = topics[Math.floor(Math.random() * topics.length)];
        var qData = api.B.make(api.ANO || 6, tema, api.tier ? api.tier() : 1);
        var options = [qData.a].concat(qData.d);
        var limit = api.easy && api.easy() ? 2 : 3;
        options = options.slice(0, limit);
        for (var i = options.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = options[i];
          options[i] = options[j];
          options[j] = temp;
        }
        return { q: qData.q, a: qData.a, e: qData.e, options: options, raw: qData };
      }

      function playSiren() {
        try {
          var AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          var aCtx = new AudioCtx();
          var osc = aCtx.createOscillator();
          var g = aCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, aCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, aCtx.currentTime + 0.4);
          g.gain.setValueAtTime(0.1, aCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, aCtx.currentTime + 0.4);
          osc.connect(g); g.connect(aCtx.destination);
          osc.start(); osc.stop(aCtx.currentTime + 0.4);
        } catch(e){}
      }

      function spawnConfetti() {
        for(var i=0; i<30; i++) {
          particles.push({
            x: W/2, y: H/2,
            vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10 - 5,
            c: 'hsl('+Math.random()*360+',100%,50%)',
            r: 5+Math.random()*5, life: 1
          });
        }
      }

      function resize() {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
      }
      window.addEventListener('resize', resize);
      resize();

      function handleInput(e) {
        if (e.type === 'keydown') keys[e.code] = true;
        if (e.type === 'keyup') delete keys[e.code];
        
        if (state === 'QUESTION' && e.type === 'keydown') {
          if (e.code === 'Digit1' || e.code === 'Numpad1') checkAnswer(0);
          if (e.code === 'Digit2' || e.code === 'Numpad2') checkAnswer(1);
          if (e.code === 'Digit3' || e.code === 'Numpad3' && currentQ.options.length > 2) checkAnswer(2);
          if (e.code === 'ArrowUp') selectedOpt = Math.max(0, selectedOpt - 1);
          if (e.code === 'ArrowDown') selectedOpt = Math.min(currentQ.options.length - 1, selectedOpt + 1);
          if (e.code === 'Enter') checkAnswer(selectedOpt);
        }
        if ((state === 'GAMEOVER' || state === 'VICTORY') && e.type === 'keydown') {
          if (e.code === 'Enter') resetGame();
          if (e.code === 'Escape') closeGame();
        }
      }
      window.addEventListener('keydown', handleInput);
      window.addEventListener('keyup', handleInput);

      function onTouch(e) {
        var t = e.changedTouches[0];
        var tx = t.clientX, ty = t.clientY;
        if (state === 'QUESTION') {
          var boxW = Math.min(W * 0.8, 500);
          var startY = H * 0.45;
          for (var i = 0; i < currentQ.options.length; i++) {
            var rect = { x: (W - boxW) / 2, y: startY + i * 70, w: boxW, h: 60 };
            if (tx > rect.x && tx < rect.x + rect.w && ty > rect.y && ty < rect.y + rect.h) {
              checkAnswer(i);
            }
          }
        } else if (state === 'GAMEOVER' || state === 'VICTORY') {
          if (ty > H * 0.6 && ty < H * 0.7) resetGame();
          if (ty > H * 0.75 && ty < H * 0.85) closeGame();
        }
      }
      window.addEventListener('touchstart', onTouch);

      // ---- AO VIVO: todos que estão com o jogo aberto entram na mesma corrida ----
      var CYCLE = 20; // segundos por rodada (igual para todos, pelo relógio do servidor)
      var LIVE = !!(window.EDU_ENDPOINT && window.RBX_LOGIN && window.RBX_LOGIN !== 'mestre');
      var clockOff = 0, others = {}, livePoll = null, nextStart = 0, myNick = '';
      try { myNick = (window.RBX_NICK_ATUAL && window.RBX_NICK_ATUAL()) || ''; } catch (e) {}
      function sNow() { return (Date.now() + clockOff) / 1000; }
      function liveSend(est) {
        if (!LIVE) return;
        var u = window.EDU_ENDPOINT + (window.EDU_ENDPOINT.indexOf('?') < 0 ? '?' : '&') + 'acao=rbxlive&sala=batatinha&login=' + encodeURIComponent(window.RBX_LOGIN) +
          '&nick=' + encodeURIComponent(myNick) + '&pos=' + Math.round(progress) + '&vidas=' + lives + '&est=' + (est || state) + '&c=' + (livePoll ? 1 : 0);
        try {
          var t0 = Date.now();
          fetch(u).then(function (r) { return r.json(); }).then(function (d) {
            if (!d || !d.players) return;
            clockOff = d.now - (t0 + Date.now()) / 2;
            others = {};
            for (var k in d.players) if (k !== window.RBX_LOGIN) others[k] = d.players[k];
          }).catch(function () {});
        } catch (e) {}
      }
      if (LIVE) { liveSend('entrou'); livePoll = setInterval(function () { if (!destroyed) liveSend(); }, 2000); }
      function beginSing() {
        if (LIVE) { state = 'WAIT'; nextStart = Math.ceil(sNow() / CYCLE) * CYCLE; timer = 0; return; }
        state = 'SINGING';
      }
      function hashX(login) { var h = 0, i; for (i = 0; i < login.length; i++) h = (h * 31 + login.charCodeAt(i)) % 997; return (h / 997 - 0.5); }

      function checkAnswer(idx) {
        if (state !== 'QUESTION') return;
        var correct = currentQ.options[idx] === currentQ.a;
        api.log(currentQ.raw, correct, 1);
        if (correct) {
          combo++;
          var xp = 5 + combo;
          api.gain(xp, 1);
          state = 'FEEDBACK';
          feedbackOk = true;
          feedbackText = "BOA!";
          feedbackTimer = 1;
          spawnConfetti();
        } else {
          combo = 0;
          lives--;
          progress = Math.max(0, progress - 12);
          state = 'FEEDBACK';
          feedbackOk = false;
          feedbackText = currentQ.e || "Incorreto!";
          feedbackTimer = 2.5;
        }
      }

      function resetGame() {
        lives = 3; progress = 0; combo = 0;
        state = 'COUNTDOWN'; timer = 3;
      }

      function closeGame() {
        destroyed = true;
        if (livePoll) { clearInterval(livePoll); try { liveSend('saiu'); } catch (e) {} }
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('keyup', handleInput);
        window.removeEventListener('touchstart', onTouch);
        wrap.remove();
        api.onClose();
      }

      function update(dt) {
        if (state === 'COUNTDOWN') {
          timer -= dt;
          if (timer <= 0) {
            singDuration = LIVE ? 6 : 2.5 + Math.random() * 1.5 - (progress/100);
            singElapsed = 0;
            currentSyllableIdx = 0;
            dollRot = 0;
            beginSing();
          }
        } else if (state === 'WAIT') {
          if (sNow() >= nextStart) { state = 'SINGING'; singDuration = 6; singElapsed = 0; currentSyllableIdx = 0; dollRot = 0; }
        } else if (state === 'SINGING') {
          singElapsed += dt;
          currentSyllableIdx = Math.floor((singElapsed / singDuration) * syllables.length);
          if (currentSyllableIdx >= syllables.length) {
            state = 'TURNING';
            timer = 0.4;
            playSiren();
          }
          var isRunning = keys['Space'] || keys['ArrowUp'] || keys['KeyD'];
          // Gamepad polling
          var gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
          if (gp) {
            if (gp.buttons[0].pressed || gp.buttons[7].pressed || gp.axes[1] < -0.5) isRunning = true;
          }
          if (isRunning) {
            progress += dt * 8;
            if (progress >= 100) {
              progress = 100;
              state = 'VICTORY';
              api.gain(50, 10);
            }
          }
        } else if (state === 'TURNING') {
          timer -= dt;
          dollRot = Math.min(1, dollRot + dt * 3);
          if (timer <= 0) {
            state = 'QUESTION';
            currentQ = getQuestion();
            timer = 10;
            selectedOpt = 0;
          }
        } else if (state === 'QUESTION') {
          timer -= dt;
          if (timer <= 0) {
            lives--;
            progress = Math.max(0, progress - 12);
            state = 'FEEDBACK';
            feedbackOk = false;
            feedbackText = "Tempo esgotado!";
            feedbackTimer = 2;
          }
          // Gamepad for question
          var gp = navigator.getGamepads ? navigator.getGamepads()[0] : null;
          if (gp) {
            if (gp.axes[1] < -0.5 && !lastGamepadBtn.up) { selectedOpt = Math.max(0, selectedOpt - 1); lastGamepadBtn.up = true; }
            else if (gp.axes[1] > -0.5) lastGamepadBtn.up = false;
            if (gp.axes[1] > 0.5 && !lastGamepadBtn.down) { selectedOpt = Math.min(currentQ.options.length - 1, selectedOpt + 1); lastGamepadBtn.down = true; }
            else if (gp.axes[1] < 0.5) lastGamepadBtn.down = false;
            if (gp.buttons[0].pressed && !lastGamepadBtn.a) { checkAnswer(selectedOpt); lastGamepadBtn.a = true; }
            else if (!gp.buttons[0].pressed) lastGamepadBtn.a = false;
          }
        } else if (state === 'FEEDBACK') {
          feedbackTimer -= dt;
          if (feedbackTimer <= 0) {
            if (lives <= 0) state = 'GAMEOVER';
            else {
              singDuration = LIVE ? 6 : Math.max(1.5, 3 - (progress/50));
              singElapsed = 0;
              currentSyllableIdx = 0;
              dollRot = 0;
              beginSing();
            }
          }
        }

        for (var i = particles.length - 1; i >= 0; i--) {
          var p = particles[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= dt;
          if (p.life <= 0) particles.splice(i, 1);
        }
      }

      function drawDoll(x, y, rot) {
        ctx.save();
        ctx.translate(x, y);
        // Dress
        ctx.fillStyle = '#ff9800';
        ctx.beginPath(); ctx.moveTo(-25, 60); ctx.lineTo(25, 60); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.fill();
        // Head
        ctx.fillStyle = colors.skin;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
        // Hair/Face
        if (rot < 0.5) { // Back
          ctx.fillStyle = '#3e2723';
          ctx.beginPath(); ctx.arc(0, -5, 18, Math.PI, 0); ctx.fill();
          ctx.fillRect(-22, -5, 10, 30); ctx.fillRect(12, -5, 10, 30); // Braids
        } else { // Front
          ctx.fillStyle = '#3e2723';
          ctx.beginPath(); ctx.arc(0, -5, 18, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(-7, 0, 3, 0, Math.PI*2); ctx.arc(7, 0, 3, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#f44336'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 8, 5, 0, Math.PI); ctx.stroke();
          if (state === 'QUESTION') {
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
            ctx.beginPath(); ctx.arc(-7, 0, 6, 0, Math.PI*2); ctx.arc(7, 0, 6, 0, Math.PI*2); ctx.fill();
          }
        }
        ctx.restore();
      }

      function drawAvatar(x, y, running) {
        var walk = running ? Math.sin(Date.now() * 0.01) * 10 : 0;
        ctx.fillStyle = colors.pants;
        ctx.fillRect(x - 8, y + 15 + walk, 6, 15);
        ctx.fillRect(x + 2, y + 15 - walk, 6, 15);
        ctx.fillStyle = colors.shirt;
        ctx.fillRect(x - 10, y - 10, 20, 25);
        ctx.fillStyle = colors.skin;
        ctx.beginPath(); ctx.arc(x, y - 15, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = colors.hair;
        ctx.fillRect(x - 10, y - 25, 20, 8);
      }

      function render() {
        ctx.clearRect(0, 0, W, H);
        
        // Track
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath(); ctx.moveTo(W*0.2, H); ctx.lineTo(W*0.8, H); ctx.lineTo(W*0.6, 150); ctx.lineTo(W*0.4, 150); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.setLineDash([20, 20]);
        ctx.beginPath(); ctx.moveTo(W*0.5, H); ctx.lineTo(W*0.5, 150); ctx.stroke(); ctx.setLineDash([]);
        
        // Finish line
        ctx.fillStyle = '#f44336';
        ctx.fillRect(W*0.4, 140, W*0.2, 10);

        drawDoll(W/2, 80, dollRot);

        var ok = Object.keys(others);
        ok.forEach(function (k) {
          var o = others[k]; if (!o || o.s === 'saiu') return;
          var gy = H - 50 - ((o.p || 0) * (H - 250) / 100), gx = W / 2 + hashX(k) * W * 0.3;
          ctx.globalAlpha = 0.75; ctx.fillStyle = o.v > 0 ? '#ff7043' : '#9e9e9e';
          ctx.beginPath(); ctx.arc(gx, gy - 24, 11, 0, 7); ctx.fill();
          ctx.fillRect(gx - 9, gy - 14, 18, 24); ctx.globalAlpha = 1;
          ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
          var nm = (o.n || k).slice(0, 12); ctx.strokeText(nm, gx, gy - 40); ctx.fillText(nm, gx, gy - 40); ctx.textAlign = 'left';
        });
        var playerY = H - 50 - (progress * (H - 250) / 100);
        drawAvatar(W/2, playerY, state === 'SINGING' && (keys['Space'] || keys['ArrowUp'] || keys['KeyD']));

        // Ranking ao vivo
        if (LIVE) {
          var rk = ok.map(function (k) { return { n: others[k].n || k, p: others[k].p || 0 }; });
          rk.push({ n: 'Você', p: progress, me: 1 });
          rk.sort(function (a, b) { return b.p - a.p; });
          ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(20, 60, 200, 26 + Math.min(rk.length, 6) * 22);
          ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('🔴 AO VIVO · ' + (ok.length + 1) + ' na corrida', 28, 80);
          for (var ri = 0; ri < Math.min(rk.length, 6); ri++) {
            ctx.fillStyle = rk[ri].me ? '#69f0ae' : '#fff'; ctx.font = '13px sans-serif';
            ctx.fillText((ri + 1) + 'º ' + String(rk[ri].n).slice(0, 14) + ' ' + Math.floor(rk[ri].p) + '%', 28, 100 + ri * 22);
          }
        }
        if (state === 'WAIT') {
          ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W / 2 - 190, H * 0.45, 380, 56);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('Aguardando a turma... ' + Math.max(0, Math.ceil(nextStart - sNow())) + 's', W / 2, H * 0.45 + 36); ctx.textAlign = 'left';
        }
        // UI
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(20, 20, 200, 30);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(20, 20, progress * 2, 30);
        ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif';
        ctx.fillText('PROGRESSO: ' + Math.floor(progress) + '%', 30, 42);

        for(var i=0; i<3; i++) {
          ctx.fillText(i < lives ? '❤️' : '🖤', 20 + i*30, 80);
        }

        if (state === 'COUNTDOWN') {
          ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(Math.ceil(timer), W/2, H/2);
        }

        if (state === 'SINGING') {
          ctx.fillStyle = '#fff'; ctx.fillRect(W/2 + 40, 40, 200, 40);
          ctx.strokeStyle = '#000'; ctx.strokeRect(W/2 + 40, 40, 200, 40);
          ctx.fillStyle = '#000'; ctx.font = '18px sans-serif'; ctx.textAlign = 'left';
          var txt = ""; for(var s=0; s<=currentSyllableIdx && s<syllables.length; s++) txt += syllables[s];
          ctx.fillText(txt, W/2 + 50, 67);
          ctx.fillStyle = '#4caf50'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('🟢 CORRA!', W/2, H - 100);
        }

        if (state === 'QUESTION' || state === 'FEEDBACK') {
          ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0,0,W,H);
          var boxW = Math.min(W * 0.9, 600);
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.roundRect((W-boxW)/2, 100, boxW, H-200, 20); ctx.fill();
          
          ctx.fillStyle = '#000'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
          var qLines = currentQ.q.split('\n');
          for(var l=0; l<qLines.length; l++) ctx.fillText(qLines[l], W/2, 160 + l*35);

          if (state === 'QUESTION') {
            var startY = H * 0.45;
            for (var i = 0; i < currentQ.options.length; i++) {
              ctx.fillStyle = selectedOpt === i ? '#e3f2fd' : '#f5f5f5';
              ctx.fillRect((W - boxW * 0.8) / 2, startY + i * 70, boxW * 0.8, 60);
              ctx.strokeStyle = selectedOpt === i ? '#2196f3' : '#ccc';
              ctx.strokeRect((W - boxW * 0.8) / 2, startY + i * 70, boxW * 0.8, 60);
              ctx.fillStyle = '#000'; ctx.font = '22px sans-serif';
              ctx.fillText(currentQ.options[i], W/2, startY + i * 70 + 38);
            }
            // Timer bar
            ctx.fillStyle = '#eee'; ctx.fillRect(W/2 - 100, 110, 200, 10);
            ctx.fillStyle = timer < 3 ? '#f44336' : '#ffc107';
            ctx.fillRect(W/2 - 100, 110, timer * 20, 10);
            ctx.fillStyle = '#f44336'; ctx.font = 'bold 30px sans-serif';
            ctx.fillText('🔴 PARE!', W/2, H - 60);
          } else {
            ctx.fillStyle = feedbackOk ? '#4caf50' : '#f44336';
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText(feedbackOk ? 'BOA!' : 'OPS!', W/2, H * 0.5);
            ctx.fillStyle = '#333'; ctx.font = '20px sans-serif';
            var eLines = feedbackText.split('\n');
            for(var el=0; el<eLines.length; el++) ctx.fillText(eLines[el], W/2, H * 0.6 + el*25);
          }
        }

        if (state === 'GAMEOVER' || state === 'VICTORY') {
          ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0,0,W,H);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
          ctx.font = 'bold 50px sans-serif';
          ctx.fillText(state === 'VICTORY' ? 'VITÓRIA! 🎉' : 'FIM DE JOGO 💀', W/2, H*0.3);
          ctx.font = '24px sans-serif';
          ctx.fillText('Progresso: ' + Math.floor(progress) + '%', W/2, H*0.45);
          
          ctx.fillStyle = '#4caf50'; ctx.fillRect(W/2-100, H*0.6, 200, 50);
          ctx.fillStyle = '#fff'; ctx.fillText('Jogar de Novo', W/2, H*0.635);
          ctx.fillStyle = '#f44336'; ctx.fillRect(W/2-100, H*0.75, 200, 50);
          ctx.fillStyle = '#fff'; ctx.fillText('Sair', W/2, H*0.785);
        }

        particles.forEach(function(p) {
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x, p.y, p.r, p.r);
        });

        if (!destroyed) animId = requestAnimationFrame(function(t) {
          var now = t / 1000;
          if (!window._lastT) window._lastT = now;
          update(Math.min(0.1, now - window._lastT));
          window._lastT = now;
          render();
        });
      }

      render();
    }
  };
})();