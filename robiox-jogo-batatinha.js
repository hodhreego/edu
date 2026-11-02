(function () {
  window.RBX_JOGOS = window.RBX_JOGOS || {};
  var ID = 'batatinha-frita';

  window.RBX_JOGOS[ID] = {
    nome: 'Batatinha Frita 1, 2, 3 🚦',
    icone: '🚦',
    desc: 'Corra enquanto a boneca canta e responda quando ela virar!',
    start: function (api) {
      var dpr = window.devicePixelRatio || 1;
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#87ceeb;user-select:none;-webkit-user-select:none;touch-action:none;font-family:Arial,sans-serif;overflow:hidden;';
      var canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block;';
      wrap.appendChild(canvas);
      var closeBtn = document.createElement('div');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;width:46px;height:46px;background:rgba(0,0,0,.6);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer;z-index:10;';
      closeBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); closeGame(); });
      wrap.appendChild(closeBtn);
      document.body.appendChild(wrap);

      var ctx = canvas.getContext('2d');
      var W = 0, H = 0, animId = null, destroyed = false, lastT = 0;
      var colors = api.avatarColors || { skin: '#ffcc88', shirt: '#29b6f6', pants: '#1e88e5', hair: '#5d4037' };

      var state = 'COUNTDOWN'; // COUNTDOWN, WAIT, SINGING, TURNING, QUESTION, FEEDBACK, GAMEOVER, VICTORY
      var lives = 3, progress = 0, combo = 0, coins = 0, hits = 0;
      var timer = 3, dollRot = 0;
      var SYL = ['Ba', 'ta', 'ti', 'nha ', 'fri', 'ta ', '1, ', '2, ', '3!'];
      var FRASE = 'Batatinha frita 1, 2, 3!';
      var singDuration = 5, singElapsed = 0, sylIdx = 0;
      var currentQ = null, selectedOpt = 0, feedbackText = '', feedbackOk = false, feedbackTimer = 0;
      var particles = [], keys = {}, holding = false, lastPad = {};
      var optRects = [], btnRects = {}, stripe = 0, runAnim = 0;
      var qTotal = 10;

      // ---------- AO VIVO ----------
      var CYCLE = 20;
      var LIVE = !!(window.EDU_ENDPOINT && window.RBX_LOGIN && window.RBX_LOGIN !== 'mestre');
      var clockOff = 0, others = {}, livePoll = null, nextStart = 0, myNick = '';
      try { myNick = (window.RBX_NICK_ATUAL && window.RBX_NICK_ATUAL()) || ''; } catch (e) {}
      function sNow() { return (Date.now() + clockOff) / 1000; }
      function liveSend(est) {
        if (!LIVE) return;
        var u = window.EDU_ENDPOINT + (window.EDU_ENDPOINT.indexOf('?') < 0 ? '?' : '&') + 'acao=rbxlive&sala=batatinha&login=' + encodeURIComponent(window.RBX_LOGIN) +
          '&nick=' + encodeURIComponent(myNick) + '&pos=' + Math.round(progress) + '&vidas=' + lives + '&est=' + (est || state);
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
      function hashX(login) { var h = 0, i; for (i = 0; i < login.length; i++) h = (h * 31 + login.charCodeAt(i)) % 997; return h / 997 - 0.5; }

      // ---------- voz e som ----------
      var AC = null;
      function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; }
      function beep(f, d, type, v) {
        var a = audio(); if (!a) return;
        try { var o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.value = v || 0.08; o.connect(g); g.connect(a.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d); o.stop(a.currentTime + d); } catch (e) {}
      }
      function siren() { beep(880, 0.25, 'sawtooth', 0.07); setTimeout(function () { beep(660, 0.3, 'sawtooth', 0.07); }, 250); }
      var voz = null;
      function pickVoice() {
        try { var vs = window.speechSynthesis.getVoices(); for (var i = 0; i < vs.length; i++) if (/pt[-_]BR/i.test(vs[i].lang)) return vs[i]; for (i = 0; i < vs.length; i++) if (/^pt/i.test(vs[i].lang)) return vs[i]; } catch (e) {}
        return null;
      }
      var vozAud = null;
      try { vozAud = new Audio('batatinha-voz.wav'); vozAud.preload = 'auto'; } catch (e) {}
      function falar(dur) {
        try {
          if (vozAud) {
            var d = vozAud.duration && isFinite(vozAud.duration) ? vozAud.duration : 4;
            vozAud.pause(); vozAud.currentTime = 0;
            vozAud.playbackRate = Math.max(0.6, Math.min(1.5, d / dur));
            var pr = vozAud.play();
            if (pr && pr.catch) pr.catch(function () { falarTTS(dur); });
            return;
          }
        } catch (e) {}
        falarTTS(dur);
      }
      function falarTTS(dur) {
        try {
          if (!window.speechSynthesis) return;
          window.speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(FRASE);
          u.lang = 'pt-BR'; u.pitch = 1.5; u.volume = 1;
          u.rate = Math.max(0.5, Math.min(1.4, 2.6 / dur));
          var v = pickVoice(); if (v) u.voice = v;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
      function calar() { try { if (vozAud) vozAud.pause(); } catch (e) {} try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {} }

      // ---------- perguntas ----------
      function getQuestion() {
        try {
          var topics = api.topics ? api.topics() : ['Geral'];
          var top = topics[Math.floor(Math.random() * topics.length)];
          var qObj = api.B.make(api.ANO || 6, top, api.tier ? api.tier() : 1);
          var easy = api.easy ? api.easy() : false;
          var opts = [String(qObj.a)], wr = (qObj.d || []).slice(0).sort(function () { return Math.random() - 0.5; });
          for (var i = 0; i < (easy ? 1 : 2); i++) opts.push(wr[i] !== undefined ? String(wr[i]) : String(i + 1));
          opts.sort(function () { return Math.random() - 0.5; });
          return { q: String(qObj.q), a: String(qObj.a), e: qObj.e || '', options: opts, raw: qObj };
        } catch (e) {
          return { q: 'Quanto é 2 + 2?', a: '4', e: '2 + 2 = 4', options: ['3', '4', '5'], raw: { q: 'Quanto é 2 + 2?', a: '4', e: '' } };
        }
      }

      // ---------- util ----------
      function resize() {
        dpr = window.devicePixelRatio || 1;
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      window.addEventListener('resize', resize); resize();

      function wrapLines(text, maxW) {
        var words = String(text).split(/\s+/), lines = [], cur = '';
        for (var i = 0; i < words.length; i++) {
          var t = cur ? cur + ' ' + words[i] : words[i];
          if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = words[i]; } else cur = t;
        }
        if (cur) lines.push(cur);
        return lines;
      }
      function rr(x, y, w, h, r, fill, stroke) {
        ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
      }
      function fitFont(text, maxW, maxH, big, small, weight) {
        var s = big, lines;
        for (; s >= small; s -= 2) { ctx.font = weight + ' ' + s + 'px Arial, sans-serif'; lines = wrapLines(text, maxW); if (lines.length * s * 1.25 <= maxH) return { s: s, lines: lines }; }
        ctx.font = weight + ' ' + small + 'px Arial, sans-serif';
        return { s: small, lines: wrapLines(text, maxW) };
      }
      function confetti() {
        for (var i = 0; i < 40; i++) particles.push({ x: W / 2, y: H * 0.4, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 10 - 2, life: 1.2, r: 6 + Math.random() * 6, c: ['#ff5252', '#ffeb3b', '#4caf50', '#2196f3', '#e040fb'][i % 5] });
      }

      // ---------- fluxo ----------
      function beginSing() {
        singDuration = LIVE ? 6 : Math.max(2.6, 4.5 - progress / 50);
        singElapsed = 0; sylIdx = 0; dollRot = 0;
        state = 'SINGING';
        falar(singDuration);
      }
      function toNextRound() {
        if (LIVE) { state = 'WAIT'; nextStart = Math.ceil(sNow() / CYCLE) * CYCLE; }
        else beginSing();
      }
      function resetGame() { lives = 3; progress = 0; combo = 0; coins = 0; hits = 0; state = 'COUNTDOWN'; timer = 3; dollRot = 0; calar(); }
      function closeGame() {
        if (destroyed) return;
        destroyed = true; calar();
        if (livePoll) { clearInterval(livePoll); try { liveSend('saiu'); } catch (e) {} }
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
        wrap.remove();
        if (api.onClose) api.onClose();
      }
      function answer(idx) {
        if (state !== 'QUESTION') return;
        var ok = currentQ.options[idx] === currentQ.a;
        try { api.log(currentQ.raw, ok, 1); } catch (e) {}
        if (ok) {
          combo++; hits++; coins++;
          try { api.gain(5 + combo, 1); } catch (e) {}
          feedbackOk = true; feedbackText = 'Muito bem! Pode voltar a correr.'; feedbackTimer = 1.1; confetti(); beep(880, 0.15, 'triangle'); beep(1175, 0.2, 'triangle');
        } else {
          combo = 0; lives--; progress = Math.max(0, progress - 12);
          feedbackOk = false; feedbackText = currentQ.e || ('A resposta certa era ' + currentQ.a); feedbackTimer = 2.8; beep(180, 0.35, 'sawtooth');
        }
        state = 'FEEDBACK';
      }

      // ---------- entrada ----------
      function onKey(e) {
        if (e.type === 'keydown') keys[e.code] = true; else delete keys[e.code];
        if (e.type !== 'keydown') return;
        if (state === 'QUESTION') {
          var n = currentQ.options.length;
          if (e.code === 'Digit1' || e.code === 'Numpad1') answer(0);
          else if (e.code === 'Digit2' || e.code === 'Numpad2') answer(1);
          else if ((e.code === 'Digit3' || e.code === 'Numpad3') && n > 2) answer(2);
          else if (e.code === 'ArrowUp') selectedOpt = Math.max(0, selectedOpt - 1);
          else if (e.code === 'ArrowDown') selectedOpt = Math.min(n - 1, selectedOpt + 1);
          else if (e.code === 'Enter') answer(selectedOpt);
        } else if (state === 'GAMEOVER' || state === 'VICTORY') {
          if (e.code === 'Enter') resetGame(); else if (e.code === 'Escape') closeGame();
        } else if (e.code === 'Escape') closeGame();
        if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
      }
      window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);

      function hit(r, x, y) { return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
      canvas.addEventListener('pointerdown', function (e) {
        var x = e.clientX, y = e.clientY;
        audio(); if (AC && AC.state === 'suspended') AC.resume();
        if (state === 'QUESTION') { for (var i = 0; i < optRects.length; i++) if (hit(optRects[i], x, y)) { selectedOpt = i; answer(i); return; } }
        else if (state === 'GAMEOVER' || state === 'VICTORY') { if (hit(btnRects.again, x, y)) resetGame(); else if (hit(btnRects.exit, x, y)) closeGame(); }
        else holding = true;
      });
      function up() { holding = false; }
      canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('pointerleave', up);

      function pad() {
        var gps = navigator.getGamepads ? navigator.getGamepads() : [], g = null, i;
        for (i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { g = gps[i]; break; }
        if (!g) return false;
        var B = g.buttons, ay = g.axes[1] || 0;
        function edge(k, on) { var r = on && !lastPad[k]; lastPad[k] = on; return r; }
        var A = !!(B[0] && B[0].pressed), up2 = !!(B[12] && B[12].pressed) || ay < -0.5, dn = !!(B[13] && B[13].pressed) || ay > 0.5, Bb = !!(B[1] && B[1].pressed);
        if (state === 'QUESTION') {
          if (edge('u', up2)) selectedOpt = Math.max(0, selectedOpt - 1);
          if (edge('d', dn)) selectedOpt = Math.min(currentQ.options.length - 1, selectedOpt + 1);
          if (edge('a', A)) answer(selectedOpt);
        } else if (state === 'GAMEOVER' || state === 'VICTORY') {
          if (edge('a', A)) resetGame(); if (edge('b', Bb)) closeGame();
        }
        return A || !!(B[7] && B[7].pressed) || up2;
      }

      // ---------- atualização ----------
      function update(dt) {
        var padRun = pad(); lastPad.run = padRun;
        if (state === 'COUNTDOWN') {
          timer -= dt;
          if (timer <= 0) { if (LIVE) { state = 'WAIT'; nextStart = Math.ceil(sNow() / CYCLE) * CYCLE; } else beginSing(); }
        } else if (state === 'WAIT') {
          if (sNow() >= nextStart) beginSing();
        } else if (state === 'SINGING') {
          singElapsed += dt;
          sylIdx = Math.min(SYL.length - 1, Math.floor((singElapsed / singDuration) * SYL.length));
          var run = holding || keys.Space || keys.ArrowUp || keys.KeyD || keys.KeyW || padRun;
          if (run) {
            progress += dt * 10; runAnim += dt * 14; stripe += dt * 260;
            if (progress >= 100) { progress = 100; state = 'VICTORY'; calar(); confetti(); try { api.gain(50, 10); api.say('Chegou! 🏁', 1500); } catch (e) {} }
          }
          if (state === 'SINGING' && singElapsed >= singDuration) { state = 'TURNING'; timer = 0.6; siren(); }
        } else if (state === 'TURNING') {
          timer -= dt; dollRot = Math.min(1, dollRot + dt * 3);
          if (timer <= 0) { state = 'QUESTION'; currentQ = getQuestion(); timer = 10; selectedOpt = 0; }
        } else if (state === 'QUESTION') {
          timer -= dt;
          if (timer <= 0) {
            lives--; combo = 0; progress = Math.max(0, progress - 12);
            try { api.log(currentQ.raw, false, 1); } catch (e) {}
            feedbackOk = false; feedbackText = 'Tempo esgotado! ' + (currentQ.e || ('Resposta: ' + currentQ.a)); feedbackTimer = 2.8; state = 'FEEDBACK'; beep(180, 0.35, 'sawtooth');
          }
        } else if (state === 'FEEDBACK') {
          feedbackTimer -= dt;
          if (feedbackTimer <= 0) { if (lives <= 0) { state = 'GAMEOVER'; } else toNextRound(); }
        }
        if (state === 'SINGING' || state === 'WAIT' || state === 'COUNTDOWN') dollRot = Math.max(0, dollRot - dt * 4);
        for (var i = particles.length - 1; i >= 0; i--) { var p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.life -= dt; if (p.life <= 0) particles.splice(i, 1); }
      }

      // ---------- desenho ----------
      var TOPY = 0, BOTY = 0;
      function trackX(y, half) { // meia-largura da pista na altura y (perspectiva)
        var t = (y - TOPY) / (BOTY - TOPY); return half * (0.28 + 0.72 * t);
      }
      function drawDoll(cx, y, s) {
        var turned = dollRot > 0.5;
        ctx.save(); ctx.translate(cx, y); ctx.scale(s, s);
        ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(40, 70); ctx.lineTo(-40, 70); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe0b2'; ctx.fillRect(-6, -8, 12, 10);
        ctx.fillStyle = '#ffd7a8'; ctx.beginPath(); ctx.arc(0, -26, 24, 0, 7); ctx.fill();
        ctx.fillStyle = '#2b1b17';
        if (!turned) { ctx.beginPath(); ctx.arc(0, -28, 25, 0, 7); ctx.fill(); ctx.fillRect(-34, -30, 10, 46); ctx.fillRect(24, -30, 10, 46); }
        else {
          ctx.beginPath(); ctx.arc(0, -34, 25, Math.PI, 0); ctx.fill(); ctx.fillRect(-34, -30, 10, 46); ctx.fillRect(24, -30, 10, 46);
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-9, -24, 6, 0, 7); ctx.arc(9, -24, 6, 0, 7); ctx.fill();
          ctx.fillStyle = '#d50000'; ctx.beginPath(); ctx.arc(-9, -24, 3.5, 0, 7); ctx.arc(9, -24, 3.5, 0, 7); ctx.fill();
          ctx.fillStyle = '#c2185b'; ctx.fillRect(-7, -10, 14, 4);
        }
        ctx.restore();
      }
      function drawRunner(x, y, s, running, shirt, pants, skin, hair, alpha) {
        var sw = running ? Math.sin(runAnim) * 9 : 0;
        ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.translate(x, y); ctx.scale(s, s);
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 34, 22, 7, 0, 0, 7); ctx.fill();
        ctx.fillStyle = pants; ctx.fillRect(-11, 12, 9, 22 + sw); ctx.fillRect(2, 12, 9, 22 - sw);
        ctx.fillStyle = shirt; ctx.fillRect(-14, -16, 28, 30);
        ctx.fillStyle = skin; ctx.fillRect(-20, -12 - sw * 0.5, 6, 22); ctx.fillRect(14, -12 + sw * 0.5, 6, 22);
        ctx.beginPath(); ctx.arc(0, -26, 13, 0, 7); ctx.fill();
        ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -29, 13, Math.PI, 0); ctx.fill();
        ctx.restore();
      }

      function render() {
        TOPY = H * 0.38; BOTY = H;
        var half = Math.min(W * 0.46, 330), cx = W / 2;
        ctx.clearRect(0, 0, W, H);
        // céu e chão
        var sky = ctx.createLinearGradient(0, 0, 0, TOPY + 40); sky.addColorStop(0, '#5ec2f2'); sky.addColorStop(1, '#bfe9ff');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, TOPY + 40);
        ctx.fillStyle = '#7cb342'; ctx.fillRect(0, TOPY, W, H - TOPY);
        // pista
        ctx.fillStyle = '#9b8a6a'; ctx.beginPath(); ctx.moveTo(cx - trackX(TOPY, half), TOPY); ctx.lineTo(cx + trackX(TOPY, half), TOPY); ctx.lineTo(cx + trackX(BOTY, half), BOTY); ctx.lineTo(cx - trackX(BOTY, half), BOTY); ctx.closePath(); ctx.fill();
        // listras que rolam (sensação de avanço)
        for (var k = -1; k < 12; k++) {
          var tt = ((k + (stripe % 90) / 90) / 11); if (tt < 0 || tt > 1) continue;
          var py = TOPY + (BOTY - TOPY) * tt * tt; var hw = trackX(py, half);
          ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(cx - 3 * (0.3 + tt), py, 6 * (0.3 + tt), 10 + 26 * tt);
          ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(cx - hw, py, hw * 2, 3);
        }
        // linha de chegada
        var fw = trackX(TOPY, half); var cs = fw * 2 / 14;
        for (var c = 0; c < 14; c++) { ctx.fillStyle = c % 2 ? '#fff' : '#111'; ctx.fillRect(cx - fw + c * cs, TOPY, cs, 8); ctx.fillStyle = c % 2 ? '#111' : '#fff'; ctx.fillRect(cx - fw + c * cs, TOPY + 8, cs, 8); }

        // boneca
        var ds = Math.max(1.2, Math.min(2.3, W / 260, H / 380));
        drawDoll(cx, TOPY - 62 * ds, ds);

        // outros jogadores (ao vivo)
        var okeys = Object.keys(others);
        function yOf(p) { var t = 1 - p / 100; return TOPY + 40 + (BOTY - TOPY - 150) * t * t * 0.0 + (BOTY - TOPY - 170) * t; }
        okeys.forEach(function (key) {
          var o = others[key]; if (!o || o.s === 'saiu') return;
          var gy = yOf(o.p || 0), sc = 0.55 + 0.6 * ((gy - TOPY) / (BOTY - TOPY)), gx = cx + hashX(key) * trackX(gy, half) * 1.5;
          drawRunner(gx, gy, sc, true, o.v > 0 ? '#ff7043' : '#9e9e9e', '#455a64', '#ffcc88', '#3e2723', 0.8);
          ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff';
          var nm = String(o.n || key).slice(0, 12); ctx.strokeText(nm, gx, gy - 52 * sc); ctx.fillText(nm, gx, gy - 52 * sc);
        });
        // jogador
        var py2 = yOf(progress), psc = 0.65 + 0.75 * ((py2 - TOPY) / (BOTY - TOPY));
        var running = state === 'SINGING' && (holding || keys.Space || keys.ArrowUp || keys.KeyD || keys.KeyW || lastPad.run);
        drawRunner(cx, py2, psc, running, colors.shirt, colors.pants, colors.skin, colors.hair, 1);

        // HUD: barra de progresso
        ctx.textAlign = 'left';
        rr(16, 14, Math.min(W - 90, 300), 30, 15, 'rgba(0,0,0,.45)');
        var bw = Math.min(W - 90, 300) - 4; rr(18, 16, Math.max(26, bw * progress / 100), 26, 13, '#4caf50');
        ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.fillText('PROGRESSO ' + Math.floor(progress) + '%', 30, 35);
        ctx.font = '26px Arial'; for (var h = 0; h < 3; h++) ctx.fillText(h < lives ? '❤️' : '🖤', 16 + h * 34, 76);
        ctx.font = 'bold 15px Arial'; ctx.fillStyle = '#fff'; ctx.fillText('🪙 ' + coins, 16, 100);

        // ranking ao vivo
        if (LIVE) {
          var rk = okeys.filter(function (q) { return others[q].s !== 'saiu'; }).map(function (q) { return { n: others[q].n || q, p: others[q].p || 0 }; });
          rk.push({ n: 'Você', p: progress, me: 1 }); rk.sort(function (a, b) { return b.p - a.p; });
          var n6 = Math.min(rk.length, 4), rx = 12, ry = H - 40 - (30 + Math.min(rk.length, 4) * 24) - 50, rw = Math.min(190, W * 0.5);
          rr(rx, ry, rw, 30 + n6 * 24, 10, 'rgba(0,0,0,.55)');
          ctx.fillStyle = '#ffeb3b'; ctx.font = 'bold 14px Arial'; ctx.fillText('🔴 AO VIVO · ' + rk.length + ' na corrida', rx + 8, ry + 21);
          ctx.font = '14px Arial';
          for (var ri = 0; ri < n6; ri++) { ctx.fillStyle = rk[ri].me ? '#69f0ae' : '#fff'; ctx.fillText((ri + 1) + 'º ' + String(rk[ri].n).slice(0, 12) + ' ' + Math.floor(rk[ri].p) + '%', rx + 8, ry + 44 + ri * 24); }
        }

        // balão de fala da boneca (letras grandes)
        if (state === 'SINGING') {
          var txt = ''; for (var s = 0; s <= sylIdx; s++) txt += SYL[s];
          var fs = Math.max(26, Math.min(40, W / 12)); ctx.font = 'bold ' + fs + 'px Arial';
          var tw = ctx.measureText('Batatinha frita 1, 2, 3!').width, bw2 = Math.min(W - 24, tw + 40), bx = Math.max(12, Math.min(W - bw2 - 12, cx - bw2 / 2)), by = Math.max(60, TOPY - 74 * ds * 0.35 - 120 * ds * 0.55 - fs - 40);
          by = TOPY + 24;
          rr(bx, by, bw2, fs + 28, 18, '#fff', '#222');
          ctx.beginPath(); ctx.moveTo(cx - 12, by); ctx.lineTo(cx, by - 18); ctx.lineTo(cx + 12, by); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
          ctx.fillStyle = '#d84315'; ctx.textAlign = 'center'; ctx.fillText(txt, W / 2, by + fs + 6);
          ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b5e20'; ctx.lineWidth = 5; ctx.font = 'bold 32px Arial';
          ctx.strokeText('🟢 CORRA! (segure a tela)', cx, H - 40); ctx.fillStyle = '#c6ff00'; ctx.fillText('🟢 CORRA! (segure a tela)', cx, H - 40);
        }
        if (state === 'TURNING') {
          ctx.fillStyle = 'rgba(211,47,47,.35)'; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 44px Arial'; ctx.fillText('🔴 PARE!', cx, H * 0.55);
        }
        if (state === 'COUNTDOWN') {
          ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 110px Arial'; ctx.fillText(Math.max(1, Math.ceil(timer)), cx, H * 0.5);
          ctx.font = 'bold ' + Math.min(24, W / 15) + 'px Arial'; ctx.fillText('Segure a tela para correr', cx, H * 0.6);
          ctx.fillText('enquanto ela canta', cx, H * 0.6 + 30);
          ctx.font = Math.min(19, W / 19) + 'px Arial'; ctx.fillText('Quando ela virar, responda', cx, H * 0.6 + 66);
          ctx.fillText('em 10 segundos!', cx, H * 0.6 + 90);
        }
        if (state === 'WAIT') {
          rr(cx - Math.min(W * 0.45, 230), H * 0.42, Math.min(W * 0.9, 460), 70, 16, 'rgba(0,0,0,.65)');
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 24px Arial'; ctx.fillText('Aguardando a turma... ' + Math.max(0, Math.ceil(nextStart - sNow())) + 's', cx, H * 0.42 + 44);
        }

        // pergunta
        optRects = [];
        if (state === 'QUESTION' || state === 'FEEDBACK') {
          ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H);
          var pw = Math.min(W - 20, 640), px = (W - pw) / 2, py = 62, ph = H - 80;
          rr(px, py, pw, ph, 22, '#fff', '#1d4ed8');
          if (state === 'QUESTION') {
            // relógio
            var frac = Math.max(0, timer / 10), colr = timer < 3 ? '#e53935' : '#ffb300';
            ctx.lineWidth = 9; ctx.strokeStyle = '#e0e0e0'; ctx.beginPath(); ctx.arc(px + 44, py + 44, 30, 0, 7); ctx.stroke();
            ctx.strokeStyle = colr; ctx.beginPath(); ctx.arc(px + 44, py + 44, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke();
            ctx.fillStyle = colr; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(timer), px + 44, py + 54);
            ctx.fillStyle = '#c62828'; ctx.font = 'bold 22px Arial'; ctx.fillText('🔴 PARE E RESPONDA!', px + pw / 2 + 36, py + 52);
            var qa = fitFont(currentQ.q, pw - 40, ph * 0.28, 38, 22, 'bold');
            ctx.fillStyle = '#0f172a'; ctx.textAlign = 'center';
            var qy = py + 100 + qa.s;
            for (var l = 0; l < qa.lines.length; l++) ctx.fillText(qa.lines[l], W / 2, qy + l * qa.s * 1.25);
            var n = currentQ.options.length, top = Math.max(qy + qa.lines.length * qa.s * 1.25 + 14, py + ph * 0.42), avail = py + ph - 16 - top, bh = Math.max(54, Math.min(84, (avail - (n - 1) * 12) / n));
            for (var o2 = 0; o2 < n; o2++) {
              var ry2 = top + o2 * (bh + 12), rx2 = px + 24, rw2 = pw - 48;
              rr(rx2, ry2, rw2, bh, 16, selectedOpt === o2 ? '#dbeafe' : '#f1f5f9', selectedOpt === o2 ? '#2563eb' : '#cbd5e1');
              ctx.fillStyle = '#1e3a8a'; ctx.font = 'bold ' + Math.min(34, bh * 0.5) + 'px Arial'; ctx.textAlign = 'center';
              ctx.fillText((o2 + 1) + ')  ' + currentQ.options[o2], W / 2, ry2 + bh / 2 + Math.min(34, bh * 0.5) * 0.35);
              optRects.push({ x: rx2, y: ry2, w: rw2, h: bh });
            }
          } else {
            ctx.textAlign = 'center'; ctx.fillStyle = feedbackOk ? '#2e7d32' : '#c62828'; ctx.font = 'bold 48px Arial';
            ctx.fillText(feedbackOk ? 'BOA! 🎉' : 'OPS! 😬', W / 2, py + ph * 0.28);
            var fa = fitFont(feedbackText, pw - 50, ph * 0.4, 28, 18, 'bold'); ctx.fillStyle = '#263238';
            for (var e2 = 0; e2 < fa.lines.length; e2++) ctx.fillText(fa.lines[e2], W / 2, py + ph * 0.42 + e2 * fa.s * 1.3);
          }
        }

        if (state === 'GAMEOVER' || state === 'VICTORY') {
          ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold ' + Math.min(52, W / 8) + 'px Arial';
          ctx.fillText(state === 'VICTORY' ? 'VITÓRIA! 🎉' : 'FIM DE JOGO 💀', cx, H * 0.28);
          ctx.font = Math.min(26, W / 16) + 'px Arial'; ctx.fillText('Progresso: ' + Math.floor(progress) + '%   ·   Acertos: ' + hits + '   ·   🪙 ' + coins, cx, H * 0.38);
          btnRects.again = { x: cx - 130, y: H * 0.5, w: 260, h: 62 }; btnRects.exit = { x: cx - 130, y: H * 0.62, w: 260, h: 62 };
          rr(btnRects.again.x, btnRects.again.y, 260, 62, 16, '#43a047'); rr(btnRects.exit.x, btnRects.exit.y, 260, 62, 16, '#e53935');
          ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Arial'; ctx.fillText('Jogar de novo', cx, H * 0.5 + 40); ctx.fillText('Sair', cx, H * 0.62 + 40);
        }

        for (var pi = 0; pi < particles.length; pi++) { var p = particles[pi]; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r); }
      }

      function loop(t) {
        if (destroyed) return;
        var now = t / 1000; if (!lastT) lastT = now;
        update(Math.min(0.1, now - lastT)); lastT = now;
        render();
        animId = requestAnimationFrame(loop);
      }
      animId = requestAnimationFrame(loop);
    }
  };
})();
