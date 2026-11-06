/* RobIox GBC — motor único dos minijogos 2D estilo Game Boy Color (tela 160x144, paleta de até 8 cores).
   Conteúdo: robiox-gbc-<tema>.js  →  (window.RBX_GBC = window.RBX_GBC || {}).<id> = {titulo, materia, serie, ano?, paleta, cena, resumo, fonte, perguntas}
   Perguntas: geradas do banco RBXB (window.RBXB.make) e/ou estáticas (perguntas:[{q,a,d,dica,rev}]). Sem bibliotecas. Pixel art própria. */
(function () {
  'use strict';
  var R = window.RBX_GBC = window.RBX_GBC || {}, J = window.RBX_JOGOS = window.RBX_JOGOS || {};
  var W = 160, H = 144, NQ = 10;

  /* ---------- utilidades ---------- */
  function rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  /* ---------- sprites (índices da paleta; '.' = transparente) ---------- */
  var HERO = [
    ['....000000....', '...07777770...', '..0777777770..', '..0777777770..', '..0000000000..', '..0666666660..', '..0606666060..', '..0666666660..', '...06666660...', '....000000....', '...02222220...', '..0022222200..', '..0602222060..', '..0602222060..', '...02222220...', '...01100110...', '...01100110...', '..0011001100..'],
    ['....000000....', '...07777770...', '..0777777770..', '..0777777770..', '..0000000000..', '..0666666660..', '..0606666060..', '..0666666660..', '...06666660...', '....000000....', '...02222220...', '..0022222200..', '..0602222060..', '..0602222060..', '...02222220...', '...01100110...', '...011..0110..', '..0011..01100.']
  ];
  var GUARD = [
    '....000000....', '...01111110...', '..0122222210..', '..0172222710..', '..0122222210..', '..0111111110..', '...00000000...', '..0111111110..',
    '.001222222100.', '.012122221210.', '.012122221210.', '..0111111110..', '..0110000110..', '..0110..0110..', '..0110..0110..', '.00110..01100.'];
  var COIN = ['.555.', '56665', '56665', '56665', '.555.'];

  function bakeStr(rows, pal) {
    var h = rows.length, w = rows[0].length, c = mk(w, h), g = c.getContext('2d'), x, y, ch;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { ch = rows[y].charAt(x); if (ch !== '.' && pal[+ch]) { g.fillStyle = pal[+ch]; g.fillRect(x, y, 1, 1); } }
    return c;
  }
  function disc(g, cx, cy, r, col) { var x, y; g.fillStyle = col; for (y = -r; y <= r; y++) for (x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .4) g.fillRect(cx + x, cy + y, 1, 1); }
  function ring(g, cx, cy, r, col) { var x, y, d; g.fillStyle = col; for (y = -r; y <= r; y++) for (x = -r; x <= r; x++) { d = x * x + y * y; if (d <= r * r + r * .4 && d >= (r - 1) * (r - 1) + (r - 1) * .4) g.fillRect(cx + x, cy + y, 1, 1); } }

  function bakeAll(P) {
    var S = {}, c, g, i, a;
    S.hero = [bakeStr(HERO[0], P), bakeStr(HERO[1], P)];
    S.guard = bakeStr(GUARD, P);
    S.coin = bakeStr(COIN, P);
    /* porta do cofre: 44x60 */
    function interior(g) {
      g.fillStyle = P[0]; g.fillRect(0, 0, 44, 60); g.fillStyle = P[1]; g.fillRect(2, 2, 40, 56);
      g.fillStyle = P[0]; g.fillRect(4, 4, 36, 52);
    }
    c = mk(44, 60); g = c.getContext('2d'); interior(g);
    disc(g, 22, 30, 17, P[3]); disc(g, 22, 30, 16, P[2]); ring(g, 22, 30, 11, P[1]); disc(g, 22, 30, 4, P[5]);
    g.fillStyle = P[3]; g.fillRect(21, 15, 2, 6); g.fillRect(21, 39, 2, 6); g.fillRect(7, 29, 6, 2); g.fillRect(31, 29, 6, 2);
    g.fillStyle = P[0]; for (i = 0; i < 8; i++) { a = i * Math.PI / 4; g.fillRect(Math.round(22 + Math.cos(a) * 14), Math.round(30 + Math.sin(a) * 14), 1, 1); }
    g.fillStyle = P[6]; g.fillRect(21, 29, 2, 2);
    S.doorC = c;
    c = mk(44, 60); g = c.getContext('2d'); interior(g);   /* aberta: tesouro lá dentro */
    g.fillStyle = P[4]; g.fillRect(6, 44, 32, 10); g.fillStyle = P[0]; g.fillRect(6, 44, 32, 1);
    for (i = 0; i < 4; i++) { g.fillStyle = P[5]; g.fillRect(8 + i * 8, 36, 6, 8); g.fillStyle = P[6]; g.fillRect(8 + i * 8, 36, 6, 2); g.fillStyle = P[0]; g.fillRect(8 + i * 8 + 5, 36, 1, 8); }
    g.fillStyle = P[6]; g.fillRect(14, 28, 6, 8); g.fillRect(24, 28, 6, 8); g.fillStyle = P[5]; g.fillRect(14, 30, 6, 6); g.fillRect(24, 30, 6, 6);
    g.fillStyle = P[3]; g.fillRect(12, 20, 2, 2); g.fillRect(30, 16, 2, 2); g.fillRect(21, 10, 2, 2);
    S.doorO = c;
    c = mk(38, 38); g = c.getContext('2d'); disc(g, 19, 19, 17, P[3]); disc(g, 19, 19, 16, P[2]); ring(g, 19, 19, 11, P[1]); disc(g, 19, 19, 4, P[5]);
    g.fillStyle = P[3]; g.fillRect(18, 4, 2, 6); g.fillRect(18, 28, 2, 6); g.fillRect(4, 18, 6, 2); g.fillRect(28, 18, 6, 2);
    S.panel = c;
    return S;
  }

  /* texto em pixel: desenha com a fonte do sistema e converte em pixels duros (sem suavização) */
  function Txt(P) {
    var cache = {}, n = 0, cv = mk(120, 12), g = cv.getContext('2d');
    return function (s, idx) {
      var k = s + '|' + idx, o = cache[k]; if (o) return o;
      g.clearRect(0, 0, 120, 12); g.font = 'bold 9px "Courier New",ui-monospace,monospace'; g.textBaseline = 'top'; g.fillStyle = '#fff';
      var w = Math.min(120, Math.ceil(g.measureText(s).width) + 1); g.fillText(s, 0, 1);
      var d = g.getImageData(0, 0, w, 12), px = d.data, i, c = rgb(P[idx]);
      for (i = 0; i < px.length; i += 4) { if (px[i + 3] > 110) { px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; } else px[i + 3] = 0; }
      o = mk(w, 12); o.getContext('2d').putImageData(d, 0, 0);
      if (n++ > 120) { cache = {}; n = 0; }
      cache[k] = o; return o;
    };
  }

  /* ---------- perguntas: banco RBXB + estáticas ---------- */
  function norm(raw, tema, rev) {
    var d = (raw.d || []).slice(0, 3), o = shuf([String(raw.a)].concat(d.map(String)));
    return { q: raw.q, a: String(raw.a), o: o, i: o.indexOf(String(raw.a)), e: raw.e || raw.dica || '', tema: tema, rev: rev || '', raw: { q: raw.q, a: String(raw.a), topic: raw.topic || tema, tier: raw.tier || 0 } };
  }
  function gen(B, ano, temas, n, base, seen, rev, tag) {
    var out = [], tries = 0, i = 0;
    while (out.length < n && tries++ < n * 14 && temas.length) {
      var t = temas[i++ % temas.length], tier = Math.max(1, Math.min(4, Math.round(base + (out.length / Math.max(1, n - 1) - .5) * 2))), q;
      try { q = B.make(ano, t, tier); } catch (e) { continue; }
      if (!q || !q.q || seen[q.q]) continue;
      seen[q.q] = 1; q.topic = t; q.tier = tier;
      out.push(norm(q, (B.TN && B.TN[t]) || t, rev ? tag : ''));
    }
    return out;
  }
  function build(c, api) {
    var B = api.B || window.RBXB, base = (api.tier && api.tier()) || 2, F = c.fonte || {}, seen = {}, st = (c.perguntas || []), nRev = Math.round(NQ * (F.revisaoPct != null ? F.revisaoPct : .3)), cur = [], rev = [], i, k;
    var stRev = st.filter(function (p) { return p.rev; }), stCur = st.filter(function (p) { return !p.rev; });
    /* revisão: séries anteriores geradas pelo banco e/ou perguntas estáticas marcadas com rev */
    if (F.revisao && F.revisao.length && B) {
      var per = Math.max(1, Math.floor(nRev / F.revisao.length));
      F.revisao.forEach(function (r, j) { rev = rev.concat(gen(B, r.ano, r.temas, j === F.revisao.length - 1 ? nRev - rev.length : per, Math.max(1, base - 1), seen, true, r.rot || (r.ano + 'º ano'))); });
    }
    var need = nRev - rev.length;
    if (need > 0) shuf(stRev).slice(0, need).forEach(function (p) { seen[p.q] = 1; rev.push(norm(p, 'Revisão', p.rev)); });
    /* série atual */
    var nCur = NQ - rev.length;
    if (F.ano && F.temas && B) cur = gen(B, F.ano, F.temas, nCur, base, seen, false);
    if (cur.length < nCur) shuf(stCur).slice(0, nCur - cur.length).forEach(function (p) { if (!seen[p.q]) { seen[p.q] = 1; cur.push(norm(p, c.materia, '')); } });
    var all = cur.concat(rev);
    /* completa se faltou (ex.: sem banco) com o que houver */
    for (k = 0; all.length < NQ && k < st.length; k++) if (!seen[st[k].q]) { seen[st[k].q] = 1; all.push(norm(st[k], st[k].rev ? 'Revisão' : c.materia, st[k].rev || '')); }
    /* intercala: a revisão entra espalhada, sem ficar tudo no fim */
    all = shuf(cur).concat([]); var res = all.slice(), rv = shuf(rev), pos = Math.max(2, Math.floor(res.length / (rv.length + 1)));
    rv.forEach(function (q, j) { res.splice(Math.min(res.length, 2 + j * pos), 0, q); });
    return res.slice(0, NQ);
  }

  /* ---------- CSS (injetado uma vez) ---------- */
  function css(P) {
    return '.gbcR{position:fixed;inset:0;z-index:2147483000;background:' + P[0] + ';color:' + P[3] + ';font-family:"Courier New",ui-monospace,monospace;font-weight:700;display:flex;flex-direction:column;touch-action:manipulation;user-select:none;-webkit-user-select:none;overflow:hidden}' +
      '.gbcR *{box-sizing:border-box}' +
      '.gbcT{display:flex;gap:8px;align-items:center;padding:8px 10px;background:' + P[1] + ';border-bottom:4px solid ' + P[3] + '}' +
      '.gbcT b{flex:1;text-align:center;font-size:clamp(14px,3.4vw,19px);letter-spacing:.04em;text-transform:uppercase}' +
      '.gbcR button{font:inherit;cursor:pointer;color:' + P[3] + ';background:' + P[0] + ';border:3px solid ' + P[3] + ';border-radius:0;box-shadow:3px 3px 0 ' + P[3] + ';padding:8px 12px;min-height:44px}' +
      '.gbcR button:active{transform:translate(2px,2px);box-shadow:1px 1px 0 ' + P[3] + '}' +
      '.gbcR button:focus-visible,.gbcR button.sel{outline:4px solid ' + P[5] + ';outline-offset:2px}' +
      '.gbcM{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 10px 110px;overflow:auto}' +
      '.lgw-btn{display:none!important}' +
      '.gbcS{flex:none;border:4px solid ' + P[3] + ';box-shadow:0 0 0 4px ' + P[1] + ';background:' + P[0] + ';line-height:0}' +
      '.gbcS canvas{image-rendering:pixelated;image-rendering:crisp-edges;display:block}' +
      '.gbcP{flex:1;min-height:0;width:100%;max-width:640px;display:flex;flex-direction:column;gap:10px}' +
      '.gbcQ{background:' + P[1] + ';border:4px solid ' + P[3] + ';padding:10px 12px;font-size:clamp(16px,4.2vw,24px);line-height:1.3;min-height:3.2em;display:flex;align-items:center}' +
      '.gbcO{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
      '.gbcO button{display:flex;gap:8px;align-items:center;text-align:left;font-size:clamp(16px,4.2vw,24px);min-height:clamp(56px,12vw,76px);background:' + P[1] + '}' +
      '.gbcO button i{flex:none;font-style:normal;width:1.7em;height:1.7em;border-radius:50%;background:' + P[3] + ';color:' + P[0] + ';display:grid;place-items:center;font-size:.8em}' +
      '.gbcO button.ok{background:' + P[5] + ';color:' + P[0] + '}.gbcO button.ok i{background:' + P[0] + ';color:' + P[5] + '}' +
      '.gbcO button.no{background:' + P[7] + ';color:' + P[0] + '}.gbcO button.no i{background:' + P[0] + ';color:' + P[7] + '}' +
      '.gbcO button[disabled]{cursor:default}' +
      '.gbcF{min-height:2.6em;display:flex;gap:10px;align-items:center;font-size:clamp(13px,3.2vw,18px);line-height:1.3}' +
      '.gbcF span{flex:1}.gbcF button{flex:none;background:' + P[5] + ';color:' + P[0] + '}' +
      '.gbcD{position:absolute;inset:0;background:' + P[0] + 'ee;display:flex;align-items:center;justify-content:center;padding:12px;z-index:3}' +
      '.gbcD>div{width:100%;max-width:600px;max-height:100%;overflow:auto;background:' + P[1] + ';border:4px solid ' + P[3] + ';box-shadow:6px 6px 0 ' + P[3] + ';padding:14px 14px 100px;font-size:clamp(14px,3.4vw,19px);line-height:1.4}' +
      '.gbcD h2{margin:0 0 8px;font-size:1.2em;text-transform:uppercase;color:' + P[6] + '}' +
      '.gbcD h3{margin:12px 0 2px;font-size:1em;color:' + P[6] + '}.gbcD p{margin:0 0 6px;white-space:pre-line}' +
      '.gbcD .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.gbcD .row button{flex:1;min-width:120px}' +
      '.gbcD .nota{font-size:3em;color:' + P[6] + ';text-align:center;line-height:1.1}' +
      '.gbcD ol{margin:6px 0;padding-left:1.8em}.gbcD li{margin:3px 0}' +
      '@media (min-aspect-ratio:13/10) and (min-width:700px){.gbcM{flex-direction:row;align-items:center;justify-content:center}.gbcP{max-width:560px;align-self:center}}' +
      '@media print{.gbcR{display:none!important}}';
  }

  /* ---------- o jogo ---------- */
  function play(c, id, api) {
    api = api || {};
    var B = api.B || window.RBXB, ano = c.ano || api.ANO || c.serie, P = (c.paleta || []).slice();
    while (P.length < 8) P.push(P[P.length - 1] || '#ffffff');
    var Q = build(c, api);
    if (Q.length < 4) { if (api.say) api.say('Ainda faltam perguntas para este jogo', 2000); if (api.onClose) api.onClose(); return; }
    var NQL = Q.length;
    var st = document.createElement('style'); st.textContent = css(P); document.head.appendChild(st);
    var root = document.createElement('div'); root.className = 'gbcR'; root.setAttribute('role', 'application'); root.setAttribute('aria-label', c.titulo);
    root.innerHTML = '<div class="gbcT"><button type="button" data-a="x" aria-label="Sair">✖</button><b>' + esc(c.titulo) + '</b><button type="button" data-a="r" aria-label="Resumo">📖</button></div>' +
      '<div class="gbcM"><div class="gbcS"><canvas width="' + W + '" height="' + H + '"></canvas></div>' +
      '<div class="gbcP"><div class="gbcQ" id="gq"></div><div class="gbcO" id="go"></div><div class="gbcF" id="gf"></div></div></div>';
    document.body.appendChild(root);
    var cv = root.querySelector('canvas'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    var elQ = root.querySelector('#gq'), elO = root.querySelector('#go'), elF = root.querySelector('#gf'), box = root.querySelector('.gbcS');
    var S = bakeAll(P), T = Txt(P);
    window.RBX_AJUDA_JOGO = '<b>' + esc(c.titulo) + ':</b> leia a pergunta e escolha a alternativa. Acertou, a porta do cofre abre. Errou, o alarme toca e o guarda se aproxima. São ' + NQL + ' perguntas; a nota vai de 0 a 10.<br><b>Teclado:</b> <span class="k">1</span>–<span class="k">4</span> ou <span class="k">A</span>–<span class="k">D</span> escolhem; setas movem; <span class="k">Enter</span> confirma. <b>Controle:</b> direcional move, <span class="k">A</span> confirma, <span class="k">Start</span> abre o resumo. <b>Toque:</b> toque na alternativa.';

    /* estado */
    var qi = 0, sel = 0, wrong = 0, ok = 0, res = [], state = 'walk', t = 0, cam = -60, camT = 0, openT = 0, alarmT = 0, shake = 0, parts = [], locked = true, done = false, raf = 0, last = 0, acc = 0, lastW = 0, lastH = 0, pads = {}, autoT = 0, modal = null;
    function doorX(i) { return 100 + i * 110; }
    function camFor(i) { return doorX(i) - 92; }
    camT = camFor(0);

    function fit() {
      var cw = root.clientWidth, ch = root.clientHeight; if (cw === lastW && ch === lastH) return; lastW = cw; lastH = ch;
      var wide = cw / ch >= 1.3 && cw >= 700, availW = wide ? cw * .45 : cw - 44, availH = wide ? ch - 120 : ch * .44;
      var s = Math.min(availW / (W + 8), availH / (H + 8)); s = s >= 2 ? Math.floor(s) : Math.max(1, Math.floor(s * 4) / 4);
      cv.style.width = (W * s) + 'px'; cv.style.height = (H * s) + 'px';
    }

    function showQ() {
      var q = Q[qi]; elQ.textContent = q.q; elF.innerHTML = '';
      elO.innerHTML = q.o.map(function (o, i) { return '<button type="button" data-i="' + i + '"><i>' + 'ABCD'.charAt(i) + '</i><span>' + esc(o) + '</span></button>'; }).join('');
      sel = 0; mark(); locked = false; state = 'ask';
    }
    function mark() { var bs = elO.children, i; for (i = 0; i < bs.length; i++) bs[i].classList.toggle('sel', i === sel && !locked); }
    function answer(i) {
      if (locked || done || modal) return; locked = true; mark();
      var q = Q[qi], good = i === q.i, bs = elO.children, k;
      for (k = 0; k < bs.length; k++) bs[k].disabled = true;
      bs[q.i].classList.add('ok'); if (!good) bs[i].classList.add('no');
      res.push({ q: q.q, ok: good, tema: q.tema, rev: q.rev, a: q.a, m: q.o[i] });
      try { if (api.log) api.log(q.raw, good, 1, qi + 1); } catch (e) { }
      if (good) {
        ok++; state = 'opening'; openT = 0; autoT = 1.5;
        for (k = 0; k < 14; k++) parts.push({ x: doorX(qi) - cam + 22, y: 70, vx: (Math.random() - .5) * 70, vy: -40 - Math.random() * 50, l: 1.2 });
        try { if (api.gain) api.gain(8 + Math.min(ok, 6), 1); } catch (e) { }
        elF.innerHTML = '<span>✔ Cofre aberto! ' + (q.e ? esc(q.e) : '') + '</span><button type="button" data-a="n">▶</button>';
      } else {
        wrong++; state = 'alarm'; alarmT = 1.1; shake = .5; autoT = 0;
        elF.innerHTML = '<span>✘ Alarme! Certa: <u>' + esc(q.a) + '</u>. ' + (q.e ? esc(q.e) : '') + '</span><button type="button" data-a="n">▶</button>';
      }
      var nb = elF.querySelector('button'); if (nb) nb.focus({ preventScroll: true });
    }
    function next() {
      if (locked === false || done) return;
      qi++; if (qi >= NQL) return finish();
      camT = camFor(qi); state = 'walk'; elO.innerHTML = ''; elQ.textContent = '…'; elF.innerHTML = '';
    }
    function finish() {
      done = true; state = 'end';
      var nota = Math.round(ok * 10 / NQL * 10) / 10;
      try { if (api.gain) api.gain(nota >= 10 ? 40 : nota >= 7 ? 20 : 8, 0); } catch (e) { }
      modal = 'fim'; showModal();
    }
    function resumoHTML() {
      var RES = window.RBX_RES || {}, key = String(c.resumo || ano), tm = (c.fonte && c.fonte.temas) || [], o = '', TN = (B && B.TN) || {};
      var r = RES[key] || RES[ano] || {};
      tm.forEach(function (t) { if (r[t]) o += '<h3>' + esc(TN[t] || t) + '</h3><p>' + esc(r[t]) + '</p>'; });
      return o || '<p>Sem resumo cadastrado para este tema.</p>';
    }
    function showModal() {
      var m = root.querySelector('.gbcD'); if (m) m.remove();
      var d = document.createElement('div'), h; d.className = 'gbcD';
      if (modal === 'intro' || modal === 'resumo') {
        h = '<h2>📖 Resumo · ' + esc(c.titulo) + '</h2><p>Leia antes de jogar. Depois são ' + NQL + ' portas, uma pergunta em cada.</p>' + resumoHTML() +
          '<div class="row"><button type="button" data-a="go">' + (modal === 'intro' ? '▶ JOGAR' : '▶ VOLTAR') + '</button></div>';
      } else {
        var nota = Math.round(ok * 10 / NQL * 10) / 10, msg = nota >= 9 ? 'Cofre limpo! Mestre das contas!' : nota >= 7 ? 'Muito bem! Quase tudo certo.' : nota >= 5 ? 'Bom começo. Revise o resumo e tente de novo.' : 'O guarda pegou você! Leia o resumo e volte.';
        h = '<h2>Fim de jogo</h2><div class="nota">' + String(nota).replace('.', ',') + '/10</div><p style="text-align:center">' + ok + ' acertos · ' + (NQL - ok) + ' erros<br>' + msg + '</p><ol>' +
          res.map(function (r) { return '<li>' + (r.ok ? '✔' : '✘') + ' ' + esc(r.q) + (r.ok ? '' : ' → <u>' + esc(r.a) + '</u>') + (r.rev ? ' <small>(revisão ' + esc(r.rev) + ')</small>' : '') + '</li>'; }).join('') + '</ol>' +
          '<div class="row"><button type="button" data-a="again">↺ Jogar de novo</button><button type="button" data-a="r2">📖 Rever resumo</button><button type="button" data-a="x">✖ Sair</button></div>';
      }
      d.innerHTML = '<div>' + h + '</div>'; root.appendChild(d);
      var b = d.querySelector('button'); if (b) b.focus({ preventScroll: true });
    }
    function closeModal() { var m = root.querySelector('.gbcD'); if (m) m.remove(); modal = null; }
    function restart() {
      closeModal(); Q = build(c, api); NQL = Q.length; qi = 0; wrong = 0; ok = 0; res = []; done = false; cam = -60; camT = camFor(0); parts = []; state = 'walk'; locked = true; elO.innerHTML = ''; elQ.textContent = '…'; elF.innerHTML = '';
    }
    function quit() {
      cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', onRes);
      root.remove(); st.remove(); window.RBX_AJUDA_JOGO = null; try { if (api.onClose) api.onClose(); } catch (e) { }
    }

    /* entrada: clique/toque, teclado e controle */
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a'), i = b.getAttribute('data-i');
      if (i != null) return answer(+i);
      if (a === 'x') return quit();
      if (a === 'n') return next();
      if (a === 'r') { modal = 'resumo'; return showModal(); }
      if (a === 'r2') { modal = 'resumo'; return showModal(); }
      if (a === 'go') { var was = modal; closeModal(); if (was === 'resumo' && done) { modal = 'fim'; showModal(); } else if (was === 'intro') { state = 'walk'; } return; }
      if (a === 'again') return restart();
    });
    function onKey(e) {
      if (!root.isConnected) return;
      var k = e.key, n = 'ABCDabcd1234'.indexOf(k);
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (modal) { if (k === 'Escape' && modal === 'resumo') { e.preventDefault(); root.querySelector('[data-a=go]') && root.querySelector('[data-a=go]').click(); } return; }
      if (k === 'Escape') { e.preventDefault(); return quit(); }
      if (n >= 0 && !locked) { e.preventDefault(); e.stopPropagation(); answer(n % 4); return; }
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); if (!locked) { sel = (sel + (k === 'ArrowDown' ? 2 : 1)) % 4; mark(); } return; }
      if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); if (!locked) { sel = (sel + (k === 'ArrowUp' ? 2 : 3)) % 4; mark(); } return; }
      if (k === 'Enter' || k === ' ') {
        if (document.activeElement && document.activeElement.tagName === 'BUTTON' && document.activeElement.getAttribute('data-a') !== null && locked) return;
        e.preventDefault(); e.stopPropagation(); if (!locked) answer(sel); else if (state !== 'walk' && !done) next();
      }
    }
    window.addEventListener('keydown', onKey, true);
    function onRes() { lastW = 0; fit(); }
    window.addEventListener('resize', onRes);
    function pad() {
      var gs = navigator.getGamepads ? navigator.getGamepads() : [], p = null, i; for (i = 0; i < gs.length; i++) if (gs[i] && gs[i].connected) { p = gs[i]; break; }
      if (!p) return; var b = p.buttons, ax = p.axes, cur = {
        l: (b[14] && b[14].pressed) || ax[0] < -.6, r: (b[15] && b[15].pressed) || ax[0] > .6, u: (b[12] && b[12].pressed) || ax[1] < -.6, d: (b[13] && b[13].pressed) || ax[1] > .6,
        a: b[0] && b[0].pressed, s: b[9] && b[9].pressed
      };
      function edge(k) { return cur[k] && !pads[k]; }
      if (modal) { if (edge('a')) { var bt = root.querySelector('.gbcD button'); if (bt) bt.click(); } }
      else {
        if (!locked) {
          if (edge('r')) { sel = (sel + 1) % 4; mark(); } if (edge('l')) { sel = (sel + 3) % 4; mark(); } if (edge('d')) { sel = (sel + 2) % 4; mark(); } if (edge('u')) { sel = (sel + 2) % 4; mark(); }
          if (edge('a')) answer(sel);
        } else if (edge('a') && state !== 'walk' && !done) next();
        if (edge('s')) { modal = 'resumo'; showModal(); }
      }
      pads = cur;
    }

    /* desenho */
    function brick(cx, col) {
      var y, x, off;
      g.fillStyle = P[1]; g.fillRect(0, 14, W, 90);
      g.fillStyle = col;
      for (y = 14; y < 104; y += 8) {
        g.fillRect(0, y, W, 1); off = ((y - 14) / 8 & 1) ? 8 : 0;
        for (x = -((cx * .5 + off) % 16) - 16; x < W; x += 16) g.fillRect(Math.round(x), y, 1, 8);
      }
    }
    function draw() {
      var sx = shake > 0 ? Math.round((Math.random() - .5) * 4) : 0, sy = shake > 0 ? Math.round((Math.random() - .5) * 2) : 0, i, al = alarmT > 0 && ((alarmT * 8) | 0) % 2 === 0;
      g.setTransform(1, 0, 0, 1, sx, sy);
      g.fillStyle = P[0]; g.fillRect(-4, -4, W + 8, H + 8);
      brick(cam, al ? P[7] : P[0]);
      /* portas visíveis */
      for (i = Math.max(0, qi - 1); i <= Math.min(NQL - 1, qi + 1); i++) {
        var dx = Math.round(doorX(i) - cam), dy = 44;
        if (dx < -50 || dx > W + 6) continue;
        if (i < qi || (i === qi && state === 'opening' && openT >= 1)) g.drawImage(S.doorO, dx, dy);
        else if (i === qi && state === 'opening') {
          g.drawImage(S.doorO, dx, dy); var pw = Math.max(2, Math.round(38 * (1 - openT))); g.drawImage(S.panel, 0, 0, 38, 38, dx + 3, dy + 11, pw, 38);
        } else g.drawImage(S.doorC, i === qi && state === 'alarm' ? dx + (((alarmT * 30) | 0) % 2 ? 1 : -1) : dx, dy);
        g.fillStyle = P[0]; g.fillRect(dx + 14, dy - 12, 16, 10); g.fillStyle = P[3]; g.fillRect(dx + 15, dy - 11, 14, 8);
        g.drawImage(T(String(i + 1), 0), dx + 22 - (i > 8 ? 5 : 2), dy - 12);
      }
      /* piso */
      g.fillStyle = P[4]; g.fillRect(0, 104, W, 16); g.fillStyle = P[0]; g.fillRect(0, 104, W, 1);
      for (i = 0; i < 12; i++) g.fillRect(Math.round(((i * 20 - cam) % 200 + 200) % 200) - 20, 112, 10, 1);
      /* guarda */
      if (wrong > 0) { var gx = Math.min(10, -8 + wrong * 4 + (state === 'alarm' ? 2 : 0)); g.drawImage(S.guard, gx, 88 + (((t * 6) | 0) % 2)); }
      /* herói */
      var walking = Math.abs(camT - cam) > 1.5, hf = walking ? ((t * 8) | 0) % 2 : 0, hy = 86 + (state === 'opening' && openT < .5 ? -2 : 0);
      g.drawImage(S.hero[hf], 30, hy + (walking ? ((t * 16) | 0) % 2 : 0));
      /* moedas */
      for (i = 0; i < parts.length; i++) g.drawImage(S.coin, Math.round(parts[i].x), Math.round(parts[i].y));
      g.setTransform(1, 0, 0, 1, 0, 0);
      /* HUD */
      g.fillStyle = P[0]; g.fillRect(0, 0, W, 14); g.fillStyle = P[3]; g.fillRect(0, 13, W, 1);
      g.drawImage(T('PORTA ' + Math.min(qi + 1, NQL) + '/' + NQL, 3), 4, 2);
      var cs = '$' + ok; g.drawImage(T(cs, 6), W - 14 - Math.ceil(cs.length * 5.5), 2); g.drawImage(S.coin, W - 8, 4);
      g.fillStyle = P[0]; g.fillRect(0, 120, W, 24); g.fillStyle = P[3]; g.fillRect(0, 120, W, 1);
      for (i = 0; i < NQL; i++) {
        var px = Math.round(8 + i * ((W - 16) / NQL)), py = 132, col = i < res.length ? (res[i].ok ? P[5] : P[7]) : (i === qi ? P[3] : P[1]);
        g.fillStyle = P[0]; g.fillRect(px - 1, py - 1, 11, 11); g.fillStyle = col; g.fillRect(px, py, 9, 9);
        if (i < res.length) {
          g.fillStyle = P[0];
          if (res[i].ok) { g.fillRect(px + 2, py + 4, 2, 2); g.fillRect(px + 4, py + 6, 2, 2); g.fillRect(px + 6, py + 2, 2, 2); }
          else { g.fillRect(px + 2, py + 2, 5, 1); g.fillRect(px + 2, py + 6, 5, 1); g.fillRect(px + 2, py + 2, 1, 5); g.fillRect(px + 6, py + 2, 1, 5); }
        }
      }
      g.drawImage(T(wrong ? 'ALARME ' + 'X'.repeat(Math.min(wrong, 8)) : 'COFRE SEGURO', wrong ? 7 : 2), 4, 120);
    }
    function update(dt) {
      t += dt; if (shake > 0) shake -= dt; if (alarmT > 0) alarmT -= dt;
      var d = camT - cam; cam += d * Math.min(1, dt * 4.5); if (Math.abs(d) < .6) cam = camT;
      if (state === 'walk' && Math.abs(camT - cam) < .6 && !modal && qi < NQL) showQ();
      if (state === 'opening') { openT = Math.min(1, openT + dt * 1.6); if (autoT > 0) { autoT -= dt; if (autoT <= 0) next(); } }
      for (var i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.vy += 160 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; if (p.l <= 0 || p.y > 118) parts.splice(i, 1); }
    }
    function loop(ts) {
      raf = requestAnimationFrame(loop); if (document.hidden) { last = ts; return; }
      var dt = Math.min(.1, (ts - last) / 1000 || 0); last = ts; acc += dt;
      if (acc < 1 / 30) return; var step = acc; acc = 0;   /* 30 quadros/s: leve em celular fraco */
      fit(); pad(); update(step); draw();
    }
    modal = 'intro'; fit(); showModal(); draw(); raf = requestAnimationFrame(loop);
    return { close: quit };
  }

  /* ---------- registro no menu de minijogos do RobIox ---------- */
  function reg() {
    Object.keys(R).forEach(function (k) {
      var c = R[k]; if (!c || c._reg || !c.perguntas && !c.fonte) return; c._reg = 1;
      var a = c.ano || (c.serie >= 6 && c.serie <= 9 ? c.serie : 0);
      J['gbc-' + k] = { nome: c.titulo + ' 🎮', icone: c.icone || '🎮', desc: c.materia + (c.serie ? ' · ' + c.serie + 'º ano' : '') + ' · estilo Game Boy', ano: a, start: function (api) { play(c, k, api); } };
    });
  }
  window.RBX_GBC_REG = reg; reg();
})();
