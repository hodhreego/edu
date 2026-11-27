/* RobIox — Trivia Obby 🧠 (id 'triviaobby'): 100 fases de parkour, pergunta de conhecimentos gerais antes de cada fase, progresso salvo e modo 'Jogar com a turma'. Banco autoral próprio (174 perguntas). */
(function () {
'use strict';
/* ===== Motor OBBY 3D (Three.js r128 + RBX3D.shared) + modo "Jogar com a turma" (acao=rbxlive). Cópia idêntica em robiox-jogo-towersky.js e robiox-jogo-triviaobby.js ===== */
var T = null, R3 = null;
function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, k) { return a + (b - a) * k; }
function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuf(a, r) { r = r || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
function el(tag, cls, txt, par) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; if (par) par.appendChild(e); return e; }
function LS(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } return null; }
function fmtT(ms) { var s = Math.max(0, ms) / 1000, m = Math.floor(s / 60); s = s - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
function angD(a, b) { var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
function hashS(s) { var h = 7; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }
var OBCSS = '.obx{position:fixed;inset:0;z-index:2147483000;background:#8ec9ff;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;font-family:Nunito,system-ui,Arial,sans-serif;color:#fff}' +
  '.obx canvas.obc{position:absolute;left:0;top:0;width:100%;height:100%;display:block}' +
  '.obx .obh{position:absolute;left:8px;top:8px;background:rgba(10,25,60,.55);border:2px solid rgba(255,255,255,.35);border-radius:12px;padding:6px 10px;font-weight:900;font-size:15px;line-height:1.35;text-shadow:0 1px 2px #000;pointer-events:none;white-space:pre-line}' +
  '.obx .obb{position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:3}' +
  '.obx .obb button{width:42px;height:42px;border-radius:12px;border:2px solid rgba(255,255,255,.5);background:rgba(10,25,60,.6);color:#fff;font-size:19px;font-weight:900;cursor:pointer;padding:0}' +
  '.obx .obt{position:absolute;left:50%;top:24%;transform:translate(-50%,-50%) scale(.9);background:rgba(10,25,60,.78);padding:10px 18px;border-radius:14px;font-weight:900;font-size:19px;text-align:center;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;white-space:pre-line;max-width:86vw;z-index:4}' +
  '.obx .obt.on{opacity:1;transform:translate(-50%,-50%) scale(1)}' +
  '.obx .obj{position:absolute;right:18px;bottom:22px;width:86px;height:86px;border-radius:50%;border:3px solid rgba(255,255,255,.75);background:radial-gradient(circle at 35% 30%,#ffe27a,#f59e0b 60%,#b45309);color:#fff;font-size:30px;font-weight:900;box-shadow:0 4px 0 #7c2d12,0 6px 14px rgba(0,0,0,.35);display:none;padding:0;z-index:3}' +
  '.obx.touch .obj{display:block}.obx .obj.dn{transform:translateY(3px);box-shadow:0 1px 0 #7c2d12}' +
  '.obx .obs{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.5);display:none;pointer-events:none}' +
  '.obx .obs i{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px;border-radius:50%;background:rgba(255,255,255,.78)}' +
  '.obx .obhint{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);font-size:12px;font-weight:800;background:rgba(0,0,0,.35);padding:4px 10px;border-radius:10px;pointer-events:none;white-space:nowrap;max-width:94vw;overflow:hidden;text-overflow:ellipsis}' +
  '.obx .obfl{position:absolute;inset:0;pointer-events:none;background:#fff;opacity:0}' +
  '.obx .obsb{position:absolute;right:8px;top:58px;width:210px;max-width:46vw;background:rgba(10,25,60,.6);border:2px solid rgba(255,255,255,.35);border-radius:12px;padding:5px 7px;font-size:12px;font-weight:800;line-height:1.4;pointer-events:none;display:none;max-height:46vh;overflow:hidden}' +
  '.obx .obsb b{display:block;font-size:12px;color:#fde68a;margin-bottom:2px}.obx .obsb div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.obx .obsb .me{color:#86efac}' +
  '.obx .obm{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(5,15,40,.45);padding:12px;box-sizing:border-box;z-index:5}' +
  '.obx .obm.on{display:flex}' +
  '.obx .card{background:linear-gradient(180deg,#fff,#eef6ff);color:#0f2346;border-radius:20px;border:4px solid #fff;box-shadow:0 10px 0 rgba(0,0,0,.15),0 14px 40px rgba(0,0,0,.4);width:min(560px,100%);max-height:100%;overflow:auto;padding:14px 16px;box-sizing:border-box;text-align:center}' +
  '.obx .card h2{margin:2px 0 6px;font-size:24px;font-weight:900;color:#1d4ed8}.obx .card p{margin:6px 0;font-weight:700;font-size:15px}' +
  '.obx .card .chip{display:inline-block;padding:3px 10px;border-radius:999px;background:#dbeafe;color:#1e40af;font-weight:900;font-size:12px;margin-bottom:6px}' +
  '.obx .card .q{font-size:19px;font-weight:800;margin:6px 0 12px;line-height:1.3}' +
  '.obx .card .alts{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media (max-width:480px){.obx .card .alts{grid-template-columns:1fr}}' +
  '.obx .card .alt{border:0;border-radius:14px;padding:11px 10px;font-size:17px;font-weight:900;color:#fff;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.25);min-height:50px}' +
  '.obx .alt.c0{background:#2563eb}.obx .alt.c1{background:#db2777}.obx .alt.c2{background:#16a34a}.obx .alt.c3{background:#ea580c}' +
  '.obx .alt.ok{background:#16a34a!important;outline:4px solid #bbf7d0}.obx .alt.no{background:#dc2626!important}.obx .alt.dim{opacity:.35}' +
  '.obx .card .ex{margin-top:10px;background:#fff7d6;border:2px solid #fcd34d;border-radius:12px;padding:8px 10px;font-weight:700;font-size:15px;text-align:left;display:none}' +
  '.obx .card .btn{border:0;border-radius:14px;padding:11px 16px;font-size:17px;font-weight:900;background:#22c55e;color:#fff;box-shadow:0 4px 0 #15803d;cursor:pointer;margin:6px 4px 0}' +
  '.obx .card .btn.b2{background:#64748b;box-shadow:0 4px 0 #334155}.obx .card .btn.b3{background:#7c3aed;box-shadow:0 4px 0 #4c1d95}' +
  '.obx .card input{font:900 20px Nunito,Arial;width:110px;text-align:center;border:3px solid #93c5fd;border-radius:12px;padding:6px;letter-spacing:4px}' +
  '.obx .card table{width:100%;border-collapse:collapse;font-weight:800;margin:6px 0;font-size:14px}.obx .card td{padding:4px 6px;border-bottom:1px solid #dbeafe}.obx .card tr.me td{background:#fef9c3}' +
  '.obx .card .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:5px;margin:8px 0;max-height:42vh;overflow:auto}' +
  '.obx .grid button{border:0;border-radius:9px;padding:8px 0;font-weight:900;background:#3b82f6;color:#fff;cursor:pointer}.obx .grid button:disabled{background:#cbd5e1;color:#64748b}.obx .grid button.cur{background:#f59e0b}' +
  '.obx .card .bar{height:12px;background:#dbeafe;border-radius:8px;overflow:hidden;margin:6px 0}.obx .card .bar i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#84cc16)}';

function OBBY(api, o) {
  o = o || {};
  T = window.THREE; R3 = window.RBX3D;
  var E = {}, dead = false;
  if (!document.getElementById('obx-css')) { var stl = document.createElement('style'); stl.id = 'obx-css'; stl.textContent = OBCSS; document.head.appendChild(stl); }
  var root = el('div', 'obx'), isT = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  if (isT) root.classList.add('touch');
  root.style.zIndex = '2147483000';
  document.body.appendChild(root);
  var hud = el('div', 'obh', null, root), bb = el('div', 'obb', null, root);
  var muted = !!LS('rbx_obby_mute');
  var bMute = el('button', null, muted ? '🔇' : '🔊', bb), bPause = el('button', null, '⏸', bb), bClose = el('button', null, '✖', bb);
  var sb = el('div', 'obsb', null, root);
  var toastE = el('div', 'obt', null, root), flashE = el('div', 'obfl', null, root), stick = el('div', 'obs', null, root);
  var knob = el('i', null, null, stick), jumpB = el('button', 'obj', '⤒', root);
  el('div', 'obhint', isT ? 'Arraste à esquerda: andar · à direita: girar câmera · botão: pular' : 'WASD/setas: andar · Espaço: pular · Q/E ou arrastar o mouse: câmera · Esc: pausa', root);
  var modal = el('div', 'obm', null, root);
  E.root = root; E.sb = sb; E.isTouch = isT;
  function fail() { var c = el('div', 'card', null, modal); modal.classList.add('on'); el('h2', null, '3D indisponível', c); el('p', null, 'Seu navegador não conseguiu abrir o modo 3D. Atualize a página e tente de novo.', c); var b = el('button', 'btn', 'Voltar', c); b.onclick = function () { if (root.parentNode) root.parentNode.removeChild(root); if (api.onClose) api.onClose(); }; return null; }
  if (!T || !R3 || !R3.shared) return fail();

  /* ---------- som ---------- */
  var AC = null;
  function snd(f, d, type, vol, slide) { if (muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); var t = AC.currentTime, os = AC.createOscillator(), g = AC.createGain(); os.type = type || 'square'; os.frequency.setValueAtTime(f, t); if (slide) os.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); os.connect(g); g.connect(AC.destination); os.start(t); os.stop(t + d + .02); } catch (e) { } }
  E.snd = snd;
  bMute.onclick = function (e) { e.stopPropagation(); muted = !muted; LS('rbx_obby_mute', muted ? 1 : 0); bMute.textContent = muted ? '🔇' : '🔊'; };
  var tT = 0;
  E.toast = function (s, ms) { toastE.textContent = s; toastE.classList.add('on'); clearTimeout(tT); tT = setTimeout(function () { toastE.classList.remove('on'); }, ms || 1500); };
  E.flash = function (c, a) { flashE.style.transition = 'none'; flashE.style.background = c || '#fff'; flashE.style.opacity = a || .6; void flashE.offsetWidth; flashE.style.transition = 'opacity .45s'; flashE.style.opacity = 0; };
  E.setHud = function (s) { if (hud.textContent !== s) hud.textContent = s; };

  /* ---------- palco 3D (contexto WebGL compartilhado do RobIox) ---------- */
  var vw = root.clientWidth || innerWidth, vh = root.clientHeight || innerHeight, QS = [1, .82, .66, .52], qi = 0, BASE = isT ? 680 : 1000;
  function dims() { var k = Math.min(1, BASE * QS[qi] / Math.max(vw, vh, 1)); return [Math.max(160, Math.round(vw * k)), Math.max(120, Math.round(vh * k))]; }
  var d0 = dims(), s = null;
  try { s = R3.shared(d0[0], d0[1], { bgColor: 0xbfe3ff, fogDensity: o.fogD || .011, fogColor: 0xcfe8ff, fov: o.fov || 62, ambientIntensity: .55, dirIntensity: .85 }); } catch (e) { s = null; }
  if (!s) return fail();
  var sc = s.scene, cam = s.camera, ren = s.renderer, cv = ren.domElement, sunCS = s.sun.castShadow, shm = ren.shadowMap.enabled;
  s.sun.castShadow = false; ren.shadowMap.enabled = false; s.sun.position.set(30, 60, 20);
  var hemi = new T.HemisphereLight(0xdff1ff, 0x6b7a99, .45); sc.add(hemi);
  cam.near = .1; cam.far = 900; cam.fov = o.fov || 62;
  cv.classList.add('obc'); root.insertBefore(cv, root.firstChild);
  function applySize() { var d = dims(); ren.setSize(d[0], d[1], false); cam.aspect = d[0] / d[1]; cam.updateProjectionMatrix(); }
  applySize();
  function onRs() { vw = root.clientWidth || innerWidth; vh = root.clientHeight || innerHeight; applySize(); }
  window.addEventListener('resize', onRs);
  E.sc = sc; E.T = T; E.cam = cam;

  /* ---------- recursos (cache + descarte) ---------- */
  var GC = {}, TX = {}, MC = {}, DSP = [], LD = [];
  function col(h) { return new T.Color(h).convertSRGBToLinear(); }
  function geo(k, f) { return GC[k] || (GC[k] = f()); }
  function cvTex(k, w, h, f, rep) { if (TX[k]) return TX[k]; var c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; if (rep) t.wrapS = t.wrapT = T.RepeatWrapping; return (TX[k] = t); }
  function tile() { return cvTex('tile', 64, 64, function (g, w, h) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.07)'; for (var i = 0; i < 30; i++) g.fillRect(Math.random() * w, Math.random() * h, 3, 3); g.strokeStyle = 'rgba(0,0,0,.30)'; g.lineWidth = 5; g.strokeRect(2.5, 2.5, w - 5, h - 5); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.strokeRect(8, 8, w - 16, h - 16); }); }
  function lam(c, opt) { opt = opt || {}; var k = c + '|' + (opt.em == null ? '' : opt.em) + '|' + (opt.op == null ? '' : opt.op) + '|' + (opt.nm ? 1 : 0); if (MC[k] && !opt.own) return MC[k]; var m = new T.MeshLambertMaterial({ color: col(c), map: opt.nm ? null : tile() }); if (opt.em != null) m.emissive = col(opt.em); if (opt.op != null) { m.transparent = true; m.opacity = opt.op; } if (opt.own) { LD.push(m); return m; } return (MC[k] = m); }
  function basic(c, op, add, lvl) { var m = new T.MeshBasicMaterial({ color: col(c), transparent: op != null && op < 1, opacity: op == null ? 1 : op, depthWrite: !(op != null && op < 1), side: T.DoubleSide }); if (add) m.blending = T.AdditiveBlending; (lvl ? LD : DSP).push(m); return m; }
  E.col = col; E.geo = geo; E.cvTex = cvTex; E.lam = lam; E.basic = basic;
  var LG = new T.Group(); sc.add(LG);
  E.add = function (obj) { LG.add(obj); return obj; };
  E.own = function (x) { LD.push(x); return x; };
  function UB() { return geo('ub', function () { return new T.BoxGeometry(1, 1, 1); }); }
  function UC() { return geo('uc', function () { return new T.CylinderGeometry(.5, .46, 1, 28); }); }
  E.box = function (w, h, d, m, x, y, z, yaw) { var me = new T.Mesh(UB(), m); me.scale.set(w, h, d); me.position.set(x, y, z); me.rotation.y = yaw || 0; LG.add(me); return me; };

  /* ---------- céu, nuvens, estrelas, mar de nuvens ---------- */
  var skyG = new T.SphereGeometry(420, 24, 16), skyC = new Float32Array(skyG.attributes.position.count * 3);
  skyG.setAttribute('color', new T.BufferAttribute(skyC, 3));
  var sky = new T.Mesh(skyG, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10; sc.add(sky); DSP.push(sky.material, skyG);
  var cT = new T.Color(), cB = new T.Color(), cX = new T.Color();
  E.setSky = function (top, bot, fog, fd) {
    cT.set(top).convertSRGBToLinear(); cB.set(bot).convertSRGBToLinear();
    var pa = skyG.attributes.position;
    for (var i = 0; i < pa.count; i++) { var y = pa.getY(i) / 420, k = cl((y + .08) / .9, 0, 1); cX.copy(cB).lerp(cT, Math.pow(k, .7)); skyC[i * 3] = cX.r; skyC[i * 3 + 1] = cX.g; skyC[i * 3 + 2] = cX.b; }
    skyG.attributes.color.needsUpdate = true;
    if (!sc.fog) sc.fog = new T.FogExp2(0xffffff, .01);
    sc.fog.color.set(fog != null ? fog : bot).convertSRGBToLinear(); if (fd) sc.fog.density = fd;
    sc.background = new T.Color(bot).convertSRGBToLinear(); hemi.color.set(top);
  };
  var stars = null;
  E.stars = function (on) {
    if (on && !stars) { var n = 420, pos = new Float32Array(n * 3); for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, y = .06 + .94 * Math.random(), r = Math.sqrt(1 - y * y); pos[i * 3] = Math.cos(a) * r * 400; pos[i * 3 + 1] = y * 400; pos[i * 3 + 2] = Math.sin(a) * r * 400; } var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); var m = new T.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: .9 }); stars = new T.Points(g, m); sc.add(stars); DSP.push(g, m); }
    if (stars) stars.visible = !!on;
  };
  function cloudTex() { return cvTex('cloud', 128, 64, function (g, w, h) { for (var i = 0; i < 16; i++) { var x = 22 + Math.random() * (w - 44), y = h * .56 + (Math.random() - .5) * h * .28, r = 11 + Math.random() * 15, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.6, 'rgba(255,255,255,.65)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }); }
  E.cloud = function (x, y, z, sz, op, tint, lvl) { var m = new T.SpriteMaterial({ map: cloudTex(), transparent: true, opacity: op || .9, depthWrite: false, color: tint != null ? tint : 0xffffff }); var sp = new T.Sprite(m); sp.position.set(x, y, z); sp.scale.set(sz * 2, sz, 1); (lvl ? LG : sc).add(sp); (lvl ? LD : DSP).push(m); return sp; };
  var seaT = null, seaM = null;
  E.sea = function (y, tint) {
    seaT = cvTex('sea', 256, 256, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (var i = 0; i < 70; i++) { var x = Math.random() * w, yy = Math.random() * h, r = 10 + Math.random() * 32, gr = g.createRadialGradient(x, yy, 0, x, yy, r); gr.addColorStop(0, 'rgba(170,195,230,.5)'); gr.addColorStop(1, 'rgba(170,195,230,0)'); g.fillStyle = gr; for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) { g.beginPath(); g.arc(x + a * w, yy + b * h, r, 0, 7); g.fill(); } } }, true);
    seaT.repeat.set(30, 30);
    seaM = new T.MeshBasicMaterial({ map: seaT, color: col(tint || 0xffffff) }); var g = new T.PlaneGeometry(1600, 1600); g.rotateX(-Math.PI / 2);
    var me = new T.Mesh(g, seaM); me.position.y = y; sc.add(me); DSP.push(seaM, g); E.seaMesh = me; return me;
  };
  E.label = function (txt, x, y, z, sz, bg, fg) {
    var c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 256; c.height = 128;
    g.fillStyle = bg || 'rgba(15,35,90,.85)'; rr(g, 6, 14, 244, 100, 26); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 6; g.stroke();
    g.fillStyle = fg || '#fff'; g.font = '900 ' + (txt.length > 7 ? 40 : 58) + 'px Nunito,Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 66);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; var m = new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
    var sp = new T.Sprite(m); sp.scale.set((sz || 2) * 2, (sz || 2), 1); sp.position.set(x, y, z); LG.add(sp); LD.push(m, t); return sp;
  };
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  E.rr = rr;

  /* ---------- avatar (cores do RobIox) ---------- */
  function mkAvatar(c, ghost) {
    var g = new T.Group(), ms = function (h) { var m = new T.MeshLambertMaterial({ color: col(h) }); if (ghost) { m.transparent = true; m.opacity = .4; m.depthWrite = false; } DSP.push(m); return m; };
    var sk = ms(c.skin || '#ffdbac'), sh = ms(c.shirt || '#e91e63'), pa = ms(c.pants || '#3f51b5'), ha = ms(c.hair || '#4a2c11'), bk = ms('#111827');
    function bx(w, h, d, m, x, y, z, par) { var me = new T.Mesh(UB(), m); me.scale.set(w, h, d); me.position.set(x, y, z); (par || g).add(me); return me; }
    function limb(x, y, w, h, m, m2) { var p = new T.Group(); p.position.set(x, y, 0); g.add(p); bx(w, h, w, m, 0, -h / 2, 0, p); if (m2) bx(w * .92, .18, w * .92, m2, 0, -h - .06, 0, p); return p; }
    var lL = limb(-.2, .82, .34, .8, pa), rL = limb(.2, .82, .34, .8, pa);
    bx(.84, .86, .46, sh, 0, 1.24, 0);
    var lA = limb(-.58, 1.62, .28, .72, sh, sk), rA = limb(.58, 1.62, .28, .72, sh, sk);
    var head = new T.Group(); head.position.y = 1.68; g.add(head);
    bx(.62, .62, .6, sk, 0, .33, 0, head); bx(.68, .18, .66, ha, 0, .68, 0, head); bx(.68, .42, .14, ha, 0, .45, -.28, head);
    bx(.09, .13, .04, bk, -.14, .36, .31, head); bx(.09, .13, .04, bk, .14, .36, .31, head); bx(.24, .05, .04, bk, 0, .2, .31, head);
    g.userData = { lL: lL, rL: rL, lA: lA, rA: rA, wp: 0 }; g.scale.setScalar(.76); return g;
  }
  function animAv(av, sp, onG, dt) {
    var u = av.userData;
    if (onG) { u.wp += dt * sp * 1.9; var a = Math.sin(u.wp) * Math.min(1, sp / 5) * .9; u.lL.rotation.x = a; u.rL.rotation.x = -a; u.lA.rotation.x = -a * .8; u.rA.rotation.x = a * .8; u.lA.rotation.z = 0; u.rA.rotation.z = 0; }
    else { u.lL.rotation.x = .45; u.rL.rotation.x = -.35; u.lA.rotation.x = -2.5; u.rA.rotation.x = -2.5; u.lA.rotation.z = -.25; u.rA.rotation.z = .25; }
  }
  E.mkAvatar = mkAvatar; E.animAv = animAv;
  var PR = .36, PH = 1.85, G = 32, JV = 11.5, SPD = o.speed || 6.8;
  E.JV = JV;
  var pl = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, gr: false, gnd: null, coy: 0, jb: 0, face: 0, inv: 0 }; E.pl = pl;
  var av = mkAvatar(api.avatarColors || {}); sc.add(av);
  var blobT = cvTex('blob', 64, 64, function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  var blobG = new T.PlaneGeometry(1.3, 1.3); blobG.rotateX(-Math.PI / 2);
  var blobM = new T.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false }); DSP.push(blobG, blobM);
  var blob = new T.Mesh(blobG, blobM); sc.add(blob);

  /* ---------- partículas ---------- */
  var PT = [];
  (function () { for (var i = 0; i < 40; i++) { var m = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true }); DSP.push(m); var me = new T.Mesh(UB(), m); me.scale.setScalar(.2); me.visible = false; sc.add(me); PT.push({ m: me, vx: 0, vy: 0, vz: 0, t: 0 }); } })();
  E.burst = function (x, y, z, c, n) { for (var i = 0, j = 0; i < PT.length && j < (n || 12); i++) { var q = PT[i]; if (q.t > 0) continue; j++; q.t = .7 + Math.random() * .4; q.m.position.set(x, y, z); q.m.material.color.set(Array.isArray(c) ? c[j % c.length] : c); q.vx = (Math.random() - .5) * 8; q.vy = Math.random() * 7 + 2; q.vz = (Math.random() - .5) * 8; q.m.visible = true; } };

  /* ---------- plataformas, perigos, moedas, gatilhos ---------- */
  var P = [], HZ = [], CO = [], TR = [];
  E.P = P; E.killY = -40; E.coins = 0; E.deaths = 0; E.camD = 6.8; E.camH = 3.1;
  E.plat = function (q) {
    var h = q.h || .8, w = q.w || 3, dd = q.d || 3, p = { x: q.x, y: q.y - h / 2, z: q.z, hw: w / 2, hh: h / 2, hd: dd / 2, yaw: q.yaw || 0, cyl: q.shape === 'cyl', r: q.r || 0, solid: true, hid: false, dx: 0, dy: 0, dz: 0, dyaw: 0, u: null, land: null };
    p.bx = p.x; p.by = p.y; p.bz = p.z; p.byaw = p.yaw; p.br = p.cyl ? p.r : Math.sqrt(p.hw * p.hw + p.hd * p.hd); p.top = q.y;
    var me = new T.Mesh(p.cyl ? UC() : UB(), q.mat || lam(q.col == null ? 0x60a5fa : q.col));
    if (p.cyl) me.scale.set(p.r * 2, h, p.r * 2); else me.scale.set(w, h, dd);
    me.position.set(p.x, p.y, p.z); me.rotation.y = p.yaw; LG.add(me); p.mesh = me; P.push(p); return p;
  };
  E.hz = function (h) { HZ.push(h); return h; };
  E.trig = function (t) { TR.push(t); return t; };
  var coinG = null, coinM = null;
  E.coin = function (x, y, z) { coinG = coinG || geo('coin', function () { var g = new T.CylinderGeometry(.42, .42, .12, 16); g.rotateX(Math.PI / 2); return g; }); coinM = coinM || lam(0xfacc15, { em: 0x8a5a00, nm: 1 }); var m = new T.Mesh(coinG, coinM); m.position.set(x, y, z); LG.add(m); var c = { m: m, x: x, y: y, z: z, got: false }; CO.push(c); return c; };
  E.clear = function () { while (LG.children.length) LG.remove(LG.children[0]); LD.forEach(function (x) { try { x.dispose(); } catch (e) { } }); LD.length = 0; P.length = 0; HZ.length = 0; CO.length = 0; TR.length = 0; pl.gnd = null; };
  function toL(p, x, z) { var dx = x - p.x, dz = z - p.z; if (!p.yaw) return [dx, dz]; var c = Math.cos(p.yaw), s2 = Math.sin(p.yaw); return [c * dx - s2 * dz, s2 * dx + c * dz]; }
  function toW(p, lx, lz) { if (!p.yaw) return [p.x + lx, p.z + lz]; var c = Math.cos(p.yaw), s2 = Math.sin(p.yaw); return [p.x + c * lx + s2 * lz, p.z - s2 * lx + c * lz]; }
  function inside(p, x, z, m) { var L = toL(p, x, z); if (p.cyl) return L[0] * L[0] + L[1] * L[1] <= (p.r + m) * (p.r + m); return Math.abs(L[0]) <= p.hw + m && Math.abs(L[1]) <= p.hd + m; }
  function near(p, x, z) { var R = p.br + 1.6, dx = x - p.x, dz = z - p.z; return dx * dx + dz * dz < R * R; }
  E.inside = inside;

  /* biblioteca de obstáculos: t = n | beam | van | mov | spin | bar | lava | zap | jump ; y = topo */
  var lavaM = null, boltM = null;
  function lavaMat() { if (lavaM) return lavaM; var t = cvTex('lava', 64, 64, function (g, w, h) { g.fillStyle = '#ff5a00'; g.fillRect(0, 0, w, h); for (var i = 0; i < 40; i++) { var x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 9, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,240,120,.95)'); gr.addColorStop(1, 'rgba(255,60,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.strokeStyle = 'rgba(110,10,0,.55)'; g.lineWidth = 2; for (i = 0; i < 8; i++) { g.beginPath(); g.moveTo(Math.random() * w, Math.random() * h); g.lineTo(Math.random() * w, Math.random() * h); g.stroke(); } }, true); lavaM = new T.MeshBasicMaterial({ map: t }); DSP.push(lavaM); return lavaM; }
  function mkBolt() { if (!boltM) { boltM = new T.MeshBasicMaterial({ color: 0xfff7c2, transparent: true, opacity: .95, blending: T.AdditiveBlending, depthWrite: false, fog: false }); DSP.push(boltM); } var g = new T.Group(), xx = 0; for (var i = 0; i < 6; i++) { var nx = (i % 2 ? .7 : -.7) * (.6 + Math.random() * .6), m = new T.Mesh(UB(), boltM); m.scale.set(.24, 4.6, .24); m.position.set((xx + nx) / 2, 2.1 + i * 4.2, 0); m.rotation.z = -Math.atan2(nx - xx, 4.2); xx = nx; g.add(m); } return g; }
  E.obs = function (t, x, y, z, yaw, sz, op) {
    op = op || {}; var ph = op.ph || 0, rnd = op.r || Math.random, p, m;
    if (t === 'beam') return E.plat({ x: x, y: y, z: z, w: .95, d: 4.6, h: .6, yaw: yaw, col: op.col || 0xfde68a });
    if (t === 'van') {
      m = lam(op.col2 || 0xc084fc, { own: 1, op: 1 }); p = E.plat({ x: x, y: y, z: z, w: sz, d: sz, yaw: yaw, mat: m }); p.st = 0; p.tt = 0;
      p.land = function (q) { if (q.st === 0) { q.st = 1; q.tt = 0; snd(330, .08, 'triangle', .03); } };
      p.u = function (q, tt, dt) { if (q.st === 1) { q.tt += dt; m.opacity = (Math.floor(q.tt * 14) % 2) ? .45 : 1 - q.tt * .5; if (q.tt > .75) { q.st = 2; q.tt = 0; q.solid = false; q.hid = true; q.mesh.visible = false; } } else if (q.st === 2) { q.tt += dt; if (q.tt > 2.4) { q.st = 0; q.solid = true; q.hid = false; q.mesh.visible = true; m.opacity = 1; } } };
      return p;
    }
    if (t === 'mov') { p = E.plat({ x: x, y: y, z: z, w: sz, d: sz, yaw: yaw, col: op.col2 || 0xfb923c }); var ax = op.ax || 0, az = op.az || 0, ay = op.ay || 0, w = op.w || 1.2; p.u = function (q, tt) { var k = Math.sin(tt * w + ph); q.x = q.bx + ax * k; q.y = q.by + ay * k; q.z = q.bz + az * k; }; return p; }
    if (t === 'spin') { p = E.plat({ x: x, y: y, z: z, w: 1.3, d: op.len || 4.6, h: .6, yaw: yaw, col: op.col2 || 0x22d3ee }); var w2 = (op.w || .9) * (rnd() < .5 ? -1 : 1); p.u = function (q, tt) { q.yaw = q.byaw + tt * w2 + ph; }; E.box(.5, 1.6, .5, lam(0x334155), x, y - 1.1, z); return p; }
    if (t === 'bar') {
      var R = op.rad || 2.3; p = E.plat({ x: x, y: y, z: z, shape: 'cyl', r: R, h: .8, col: op.col2 || 0x94a3b8 }); var bl = R * 2 + .4, w3 = (op.w || 1.3) * (rnd() < .5 ? -1 : 1);
      var bar = E.box(bl, .42, .36, lam(0xef4444, { em: 0x7f1d1d }), x, y + .55, z); E.box(.4, .75, .4, lam(0x1f2937), x, y + .37, z);
      var hz = { a: ph, why: 'bar', u: function (tt) { hz.a = ph + tt * w3; bar.rotation.y = hz.a; }, hit: function (q) { if (q.y > y + .78 || q.y + PH < y + .33) return false; var dx = q.x - x, dz = q.z - z, c = Math.cos(hz.a), s2 = Math.sin(hz.a), lx = c * dx - s2 * dz, lz = s2 * dx + c * dz; return Math.abs(lx) < bl / 2 + PR * .6 && Math.abs(lz) < .18 + PR * .6; } };
      HZ.push(hz); return p;
    }
    if (t === 'lava') {
      var ms = lam(0x78716c), mw = lam(0xfb923c, { em: 0x7c2d12 }), ml = lavaMat(), per = op.per || 3.4; p = E.plat({ x: x, y: y, z: z, w: sz, d: sz, yaw: yaw, mat: ms }); p.hot = false;
      p.u = function (q, tt) { var c2 = ((tt + ph) % per + per) % per, st = c2 < per * .47 ? 0 : c2 < per * .68 ? 1 : 2; q.hot = st === 2; var mm = st === 0 ? ms : st === 1 ? ((Math.floor(tt * 10) % 2) ? mw : ms) : ml; if (q.mesh.material !== mm) q.mesh.material = mm; };
      HZ.push({ why: 'lava', hit: function (q) { return p.hot && q.gr && q.gnd === p; } }); return p;
    }
    if (t === 'zap') {
      p = E.plat({ x: x, y: y, z: z, w: sz, d: sz, yaw: yaw, col: 0x475569 }); var per2 = op.per || 3.2;
      var rg = geo('ring', function () { var g = new T.RingGeometry(.2, .5, 28); g.rotateX(-Math.PI / 2); return g; }), rm = basic(0xfacc15, .01, false, true), ring = new T.Mesh(rg, rm);
      ring.scale.set(sz, 1, sz); ring.position.set(x, y + .03, z); LG.add(ring);
      var bolt = mkBolt(); bolt.position.set(x, y, z); bolt.visible = false; LG.add(bolt);
      E.cloud(x, y + 9.5, z, 5, .95, 0x7c8798, true);
      var hz2 = { on: false, was: false, why: 'zap', u: function (tt) { var c2 = ((tt + ph) % per2 + per2) % per2, warn = c2 > per2 - 1.25 && c2 < per2 - .35; hz2.on = c2 >= per2 - .35; rm.opacity = warn ? (.35 + .3 * Math.sin(tt * 30)) : hz2.on ? .9 : .01; bolt.visible = hz2.on; if (hz2.on) bolt.rotation.y = tt * 9; if (hz2.on && !hz2.was) { var dx = pl.x - x, dz = pl.z - z; if (dx * dx + dz * dz < 140 && Math.abs(pl.y - y) < 8) { snd(1400, .25, 'sawtooth', .04, 90); E.flash('#fffbe0', .25); } } hz2.was = hz2.on; },
        hit: function (q) { return hz2.on && q.y >= y - .1 && q.y < y + 3 && inside(p, q.x, q.z, PR * .3); } };
      HZ.push(hz2); return p;
    }
    if (t === 'jump') {
      p = E.plat({ x: x, y: y, z: z, w: sz, d: sz, yaw: yaw, col: 0x334155 });
      var pad = new T.Mesh(UC(), lam(0x22c55e, { em: 0x14532d })); pad.scale.set(1.9, .22, 1.9); pad.position.set(x, y + .11, z); LG.add(pad);
      p.land = function () { pl.vy = JV * 1.5; pl.gr = false; pl.gnd = null; pl.coy = 0; pad.scale.y = .08; snd(380, .25, 'sine', .06, 1200); };
      p.u = function () { pad.scale.y += (.22 - pad.scale.y) * .12; }; return p;
    }
    return E.plat({ x: x, y: y, z: z, w: sz, d: sz, h: op.h || .8, yaw: yaw, col: op.col || 0x60a5fa });
  };

  /* ---------- jogador ---------- */
  var spawn = { x: 0, y: 0, z: 0, yaw: 0 }, camYaw = 0, lastDrag = -9, dying = 0, snapCam = true, look = new T.Vector3();
  E.setSpawn = function (x, y, z, yaw) { spawn.x = x; spawn.y = y; spawn.z = z; spawn.yaw = yaw == null ? camYaw : yaw; };
  E.respawn = function () { pl.x = spawn.x; pl.y = spawn.y + .05; pl.z = spawn.z; pl.vx = pl.vy = pl.vz = 0; pl.gr = false; pl.gnd = null; camYaw = spawn.yaw; pl.face = spawn.yaw + Math.PI; snapCam = true; pl.inv = .6; dying = 0; av.visible = true; };
  E.kill = function (why) { if (dying > 0 || pl.inv > 0 || dead) return; dying = .75; E.deaths++; E.flash(why === 'lava' ? '#ff5a1f' : why === 'zap' ? '#fffbe0' : '#ff2d55', .5); snd(why === 'zap' ? 900 : 320, .35, 'sawtooth', .05, 70); E.burst(pl.x, pl.y + 1, pl.z, why === 'lava' ? 0xff7a1a : 0xffffff, 14); av.visible = false; if (o.onDeath) o.onDeath(why); };
  function side() {
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; if (!p.solid || !near(p, pl.x, pl.z)) continue; var top = p.y + p.hh, bot = p.y - p.hh;
      if (pl.y >= top - .02 || pl.y + PH <= bot) continue;
      if (top - pl.y < .32 && pl.vy <= .5 && inside(p, pl.x, pl.z, PR * .5)) { pl.y = top; pl.vy = 0; continue; }
      var L = toL(p, pl.x, pl.z), lx = L[0], lz = L[1], W;
      if (p.cyl) { var dd = Math.sqrt(lx * lx + lz * lz), R = p.r + PR; if (dd < R) { if (dd < 1e-4) { lx = R; lz = 0; } else { lx *= R / dd; lz *= R / dd; } W = toW(p, lx, lz); pl.x = W[0]; pl.z = W[1]; } continue; }
      var px = p.hw + PR - Math.abs(lx), pz = p.hd + PR - Math.abs(lz); if (px <= 0 || pz <= 0) continue;
      if (px < pz) lx += (lx >= 0 ? px : -px); else lz += (lz >= 0 ? pz : -pz);
      W = toW(p, lx, lz); pl.x = W[0]; pl.z = W[1];
    }
  }
  function vert(py) {
    var best = null, bt = -1e9, g0 = pl.gnd, vy0 = pl.vy; pl.gr = false; pl.gnd = null;
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; if (!p.solid || !near(p, pl.x, pl.z)) continue; var top = p.y + p.hh, bot = p.y - p.hh;
      if (pl.vy <= 0) { if (py >= top - .06 - (p === g0 ? .3 : 0) && pl.y <= top + .001 && top > bt && inside(p, pl.x, pl.z, PR * .55)) { best = p; bt = top; } }
      else if (py + PH <= bot + .05 && pl.y + PH > bot && inside(p, pl.x, pl.z, PR * .4)) { pl.y = bot - PH; pl.vy = 0; }
    }
    if (best) { pl.y = bt; pl.vy = 0; pl.gr = true; pl.gnd = best; pl.coy = .1; if (best !== g0) { if (vy0 < -9) snd(140, .07, 'triangle', .04); if (best.land) best.land(best); } }
  }

  /* ---------- entrada ---------- */
  var K = {}, stk = { x: 0, y: 0, id: null, ox: 0, oy: 0 }, drag = { id: null, lx: 0 }, jHeld = false, jId = null;
  function isOpen() { return modal.classList.contains('on'); }
  function pd(e) {
    if (isOpen() || dead) return; if (e.target !== cv && e.target !== root) return; e.preventDefault();
    if (e.pointerType !== 'mouse' && e.clientX < vw * .45 && stk.id == null) { stk.id = e.pointerId; stk.ox = e.clientX; stk.oy = e.clientY; stick.style.left = e.clientX + 'px'; stick.style.top = e.clientY + 'px'; stick.style.display = 'block'; knob.style.transform = ''; return; }
    if (drag.id == null) { drag.id = e.pointerId; drag.lx = e.clientX; drag.ly = e.clientY; }
  }
  function pm(e) {
    if (e.pointerId === stk.id) { var dx = e.clientX - stk.ox, dy = e.clientY - stk.oy, m = Math.sqrt(dx * dx + dy * dy), R = 48; if (m > R) { dx *= R / m; dy *= R / m; } stk.x = dx / R; stk.y = -dy / R; if (m < 7) stk.x = stk.y = 0; knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
    else if (e.pointerId === drag.id) { camYaw -= (e.clientX - drag.lx) * (e.pointerType === 'mouse' ? .013 : .011); E.camH = cl(E.camH + (e.clientY - (drag.ly == null ? e.clientY : drag.ly)) * .02, 1, 8); drag.lx = e.clientX; drag.ly = e.clientY; lastDrag = gt; }
    else if (camLivre && document.pointerLockElement === cv && e.pointerType === 'mouse') { camYaw -= (e.movementX || 0) * .006; E.camH = cl(E.camH + (e.movementY || 0) * .012, 1, 8); lastDrag = gt; }
  }
  function pu(e) { if (e.pointerId === stk.id) { stk.id = null; stk.x = stk.y = 0; stick.style.display = 'none'; } if (e.pointerId === drag.id) drag.id = null; if (e.pointerId === jId) { jHeld = false; jId = null; jumpB.classList.remove('dn'); } }
  jumpB.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); if (isOpen()) return; jHeld = true; jId = e.pointerId; pl.jb = .15; jumpB.classList.add('dn'); });
  root.addEventListener('pointerdown', pd); root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  /* câmera livre: com o botão ligado, clicar na cena prende o mouse e só mexer o mouse já gira a câmera (Esc solta) */
  var camLivre = false, camBt = document.createElement('button'); camBt.type = 'button'; camBt.textContent = '🖱️ Câmera livre';
  camBt.style.cssText = 'position:absolute;right:10px;bottom:58px;z-index:5;border:0;border-radius:10px;padding:7px 11px;font:800 13px system-ui,Arial;background:rgba(15,23,42,.72);color:#fff;cursor:pointer';
  camBt.title = 'Ligado: clique na cena e gire a câmera só mexendo o mouse (Esc solta). Desligado: arraste com o mouse para girar.';
  if (!E.isTouch) root.appendChild(camBt);
  camBt.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  camBt.addEventListener('click', function (e) { e.stopPropagation(); camLivre = !camLivre; camBt.style.background = camLivre ? '#16a34a' : 'rgba(15,23,42,.72)'; camBt.textContent = camLivre ? '🖱️ Câmera livre: LIGADA (clique na cena)' : '🖱️ Câmera livre'; if (!camLivre && document.pointerLockElement === cv) try { document.exitPointerLock(); } catch (x) {} });
  cv.addEventListener('click', function () { if (camLivre && document.pointerLockElement !== cv && !isOpen()) try { cv.requestPointerLock(); } catch (x) {} }); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu); window.addEventListener('pointercancel', pu);
  function wh(e) { E.camD = cl(E.camD + (e.deltaY > 0 ? .6 : -.6), 4.5, 11); }
  root.addEventListener('wheel', wh, { passive: true });
  function kd(e) {
    if (dead) return; var c = e.code;
    if (isOpen()) { if (E.mkey) E.mkey(e); return; }
    if (c === 'Escape' || c === 'KeyP') { E.pauseMenu(); e.preventDefault(); return; }
    if (c === 'Space' || c === 'KeyJ') { if (!K[c]) pl.jb = .15; jHeld = true; }
    K[c] = 1; if (/^(Arrow|Space)/.test(c)) e.preventDefault();
  }
  function ku(e) { K[e.code] = 0; if (e.code === 'Space' || e.code === 'KeyJ') jHeld = false; }
  function bl() { K = {}; jHeld = false; }
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku); window.addEventListener('blur', bl);

  /* ---------- simulação (60 Hz fixo, escala por RBX_SPEED) ---------- */
  var STEP = 1 / 60, gt = 0, paused = false;
  E.gt = function () { return gt; }; E.isPaused = function () { return paused; };
  E.setCam = function (y) { camYaw = y; snapCam = true; };
  function step(dt) {
    gt += dt; var i;
    for (i = 0; i < P.length; i++) { var p = P[i]; if (p.u) { var ox = p.x, oy = p.y, oz = p.z, oa = p.yaw; p.u(p, gt, dt); p.dx = p.x - ox; p.dy = p.y - oy; p.dz = p.z - oz; p.dyaw = p.yaw - oa; p.mesh.position.set(p.x, p.y, p.z); p.mesh.rotation.y = p.yaw; } }
    for (i = 0; i < HZ.length; i++) if (HZ[i].u) HZ[i].u(gt, dt);
    if (pl.inv > 0) pl.inv -= dt;
    if (dying > 0) { dying -= dt; if (dying <= 0) E.respawn(); return; }
    if (E.frozen) return;
    var g = pl.gnd;
    if (g && pl.gr) { pl.x += g.dx; pl.y += g.dy; pl.z += g.dz; if (g.dyaw) { var rx = pl.x - g.x, rz = pl.z - g.z, c = Math.cos(g.dyaw), s2 = Math.sin(g.dyaw); pl.x = g.x + c * rx + s2 * rz; pl.z = g.z - s2 * rx + c * rz; pl.face += g.dyaw; } }
    var kx = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0), kz = (K.KeyW || K.ArrowUp ? 1 : 0) - (K.KeyS || K.ArrowDown ? 1 : 0);
    var ax = kx + stk.x, az = kz + stk.y, m = Math.sqrt(ax * ax + az * az); if (m > 1) { ax /= m; az /= m; m = 1; }
    camYaw += ((K.KeyQ ? 1 : 0) - (K.KeyE ? 1 : 0)) * 2.4 * dt;
    var sy = Math.sin(camYaw), cy = Math.cos(camYaw), wx = -sy * az + cy * ax, wz = -cy * az - sy * ax;
    var k = Math.min(1, (pl.gr ? 16 : 7) * dt); pl.vx += (wx * SPD - pl.vx) * k; pl.vz += (wz * SPD - pl.vz) * k;
    if (m > .1) pl.face += angD(Math.atan2(wx, wz), pl.face) * Math.min(1, dt * 14);
    if (o.autoCam !== false && !camLivre && gt - lastDrag > 6 && az > .35 && m > .3) camYaw += angD(Math.atan2(-wx, -wz), camYaw) * Math.min(1, dt * 1.1 * az);
    if (pl.gr) pl.coy = .1; else pl.coy -= dt;
    if (jHeld) pl.jb = Math.max(pl.jb, .06); if (pl.jb > 0) pl.jb -= dt;
    if (pl.gnd) pl.lg = pl.gnd;
    if (pl.jb > 0 && pl.coy > 0) {   /* pulo turbo: 3º pulo seguido na mesma plataforma = alto, 6º = mais alto, 7º = bem mais alto */
      if (pl.lg !== pl.jplat) { pl.jn = 0; pl.jplat = pl.lg; }
      pl.jn = ((pl.jn || 0) % 7) + 1; var jbm = pl.jn === 3 ? Math.SQRT2 : pl.jn === 6 ? Math.sqrt(3) : pl.jn === 7 ? 2.05 : 1;
      pl.vy = JV * jbm; pl.jb = 0; pl.coy = 0; pl.gr = false; pl.gnd = null; snd(jbm > 1 ? (pl.jn === 7 ? 820 : 660) : 520, .1, 'square', .03, 880);
      if (jbm > 1) { try { var tq = document.getElementById('rbxTurbo'); if (!tq) { tq = document.createElement('div'); tq.id = 'rbxTurbo'; tq.style.cssText = 'position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:2147483600;background:rgba(15,23,42,.82);color:#fde047;font:900 20px system-ui,Arial;padding:8px 16px;border-radius:12px;pointer-events:none;transition:opacity .3s;opacity:0'; document.body.appendChild(tq); } tq.textContent = pl.jn === 7 ? '🚀 SUPER PULO!' : '🚀 Pulo turbo!'; tq.style.opacity = 1; clearTimeout(tq._t); tq._t = setTimeout(function () { tq.style.opacity = 0; }, 900); } catch (e) {} }
    }
    pl.vy -= G * dt; if (pl.vy < -38) pl.vy = -38;
    pl.x += pl.vx * dt; pl.z += pl.vz * dt; side();
    var py = pl.y; pl.y += pl.vy * dt; vert(py);
    for (i = 0; i < HZ.length; i++) { var h = HZ[i]; if (h.hit && h.hit(pl, gt)) { E.kill(h.why || 'hit'); return; } }
    if (pl.y < E.killY) { E.kill('fall'); return; }
    for (i = 0; i < CO.length; i++) { var c3 = CO[i]; if (c3.got) continue; var dx = pl.x - c3.x, dy = pl.y + .9 - c3.y, dz = pl.z - c3.z; if (dx * dx + dy * dy + dz * dz < 1.7) { c3.got = true; c3.m.visible = false; E.coins++; snd(1320, .08, 'triangle', .05); setTimeout(function () { snd(1760, .12, 'triangle', .05); }, 70); E.burst(c3.x, c3.y, c3.z, 0xfde047, 6); } }
    for (i = 0; i < TR.length; i++) { var tr = TR[i]; if (tr.off) continue; var ex = pl.x - tr.x, ez = pl.z - tr.z; if (ex * ex + ez * ez < tr.r * tr.r && pl.y > tr.y - 1 && pl.y < tr.y + (tr.h || 3)) { if (tr.once) tr.off = true; tr.fn(tr); } }
    if (o.onStep) o.onStep(dt, gt);
  }

  /* ---------- visual ---------- */
  var cullN = 0;
  function visual(dt) {
    var i;
    av.position.set(pl.x, pl.y, pl.z); av.rotation.y = pl.face;
    animAv(av, Math.sqrt(pl.vx * pl.vx + pl.vz * pl.vz), pl.gr, dt);
    var gy = -1e9;
    for (i = 0; i < P.length; i++) { var p = P[i]; if (!p.solid || !near(p, pl.x, pl.z)) continue; var top = p.y + p.hh; if (top <= pl.y + .05 && top > gy && inside(p, pl.x, pl.z, 0)) gy = top; }
    if (gy > -1e8 && av.visible) { blob.visible = true; blob.position.set(pl.x, gy + .03, pl.z); var hh = cl(1 - (pl.y - gy) / 8, .3, 1); blob.scale.set(hh, 1, hh); } else blob.visible = false;
    var cd = E.camD, tx = pl.x + Math.sin(camYaw) * cd, tz = pl.z + Math.cos(camYaw) * cd, ty = pl.y + E.camH;
    if (o.camFix) { var f = o.camFix(tx, ty, tz); tx = f[0]; ty = f[1]; tz = f[2]; }
    if (snapCam) { cam.position.set(tx, ty, tz); look.set(pl.x, pl.y + 1.2, pl.z); snapCam = false; }
    else { var k = 1 - Math.exp(-dt * 9), k2 = 1 - Math.exp(-dt * 6); cam.position.x += (tx - cam.position.x) * k; cam.position.z += (tz - cam.position.z) * k; cam.position.y += (ty - cam.position.y) * k2; look.x += (pl.x - look.x) * k; look.z += (pl.z - look.z) * k; look.y += (pl.y + 1.2 - look.y) * k2; }
    cam.lookAt(look);
    sky.position.copy(cam.position); if (stars) stars.position.copy(cam.position);
    for (i = 0; i < CO.length; i++) if (!CO[i].got) CO[i].m.rotation.y += dt * 3;
    if (lavaM && lavaM.map) { lavaM.map.offset.y += dt * .25; lavaM.map.offset.x += dt * .05; }
    if (seaT) seaT.offset.x += dt * .004;
    for (i = 0; i < PT.length; i++) { var q = PT[i]; if (q.t > 0) { q.t -= dt; q.vy -= 18 * dt; q.m.position.x += q.vx * dt; q.m.position.y += q.vy * dt; q.m.position.z += q.vz * dt; q.m.material.opacity = Math.min(1, q.t * 2); q.m.rotation.x += dt * 6; if (q.t <= 0) q.m.visible = false; } }
    if (o.cullY && ++cullN % 10 === 0) for (i = 0; i < P.length; i++) { var pp = P[i]; pp.mesh.visible = !pp.hid && Math.abs(pp.y - pl.y) < o.cullY; }
    if (o.onFrame) o.onFrame(dt, paused);
  }

  /* ---------- laço ---------- */
  var last = performance.now(), acc = 0, raf = 0, fT = 0, fN = 0, rt = 0;
  function frame(now) {
    if (dead) return; raf = requestAnimationFrame(frame);
    var rdt = Math.min(.1, Math.max(0, (now - last) / 1000)); last = now;
    if (document.hidden) return;
    if (!paused && rt > 3) { fT += rdt; fN++; if (fT >= 2.5) { if (fT / fN > 1 / 44 && qi < QS.length - 1) { qi++; applySize(); } fT = 0; fN = 0; } }
    if (!paused) { rt += rdt; acc += Math.min(rdt, .05) * (window.RBX_SPEED || 1); var n = 0; while (acc >= STEP && n < 6) { step(STEP); acc -= STEP; n++; } if (n >= 6) acc = 0; }
    visual(rdt);
    try { ren.render(sc, cam); } catch (e) { }
  }
  raf = requestAnimationFrame(frame);

  /* ---------- janelas (perguntas, pausa) ---------- */
  E.card = function () { modal.innerHTML = ''; var c = el('div', 'card', null, modal); modal.classList.add('on'); paused = true; K = {}; jHeld = false; stk.id = null; stk.x = stk.y = 0; stick.style.display = 'none'; E.mkey = null; return c; };
  E.hide = function () { modal.classList.remove('on'); modal.innerHTML = ''; paused = false; E.mkey = null; last = performance.now(); };
  E.btn = function (par, txt, cls, fn) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), txt, par); b.onclick = function (e) { e.stopPropagation(); fn(); }; return b; };
  E.el = el;
  E.ask = function (q, chip, cb, maxD) {
    var c = E.card(); if (chip) el('div', 'chip', chip, c); el('div', 'q', String(q.q), c);
    var A = String(q.a), nd = maxD != null ? maxD : (api.easy && api.easy() ? 2 : 3), seen = {}; seen[A] = 1;
    var ds = (q.d || []).map(String).filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }).slice(0, nd);
    var opts = shuf([A].concat(ds)), al = el('div', 'alts', null, c), ex = el('div', 'ex', null, c), done = false, fired = false, bs = [];
    function fin(ok) { if (fired) return; fired = true; cb(ok); }
    function pick(i) {
      if (done) return; done = true; var ok = opts[i] === A;
      bs.forEach(function (b, j) { b.classList.add(opts[j] === A ? 'ok' : j === i ? 'no' : 'dim'); });
      if (ok) { snd(880, .12, 'square', .05); setTimeout(function () { snd(1320, .16, 'square', .05); }, 110); setTimeout(function () { fin(true); }, 750); }
      else { snd(170, .35, 'sawtooth', .05); ex.style.display = 'block'; ex.textContent = '💡 ' + (q.e || ('A resposta certa é: ' + A)); E.btn(c, 'Continuar ➜', '', function () { fin(false); }); E.mkey = function (e) { if (e.code === 'Enter' || e.code === 'Space') fin(false); }; }
    }
    opts.forEach(function (t, i) { var b = el('button', 'alt c' + i, (i + 1) + ') ' + t, al); b.onclick = function (e) { e.stopPropagation(); pick(i); }; bs.push(b); });
    E.mkey = function (e) { var n = parseInt(e.key, 10); if (n >= 1 && n <= opts.length) pick(n - 1); };
  };
  E.pauseMenu = function () { if (isOpen() || dead) return; var c = E.card(); el('h2', null, '⏸ Pausado', c); if (o.pauseInfo) o.pauseInfo(c); E.btn(c, '▶ Continuar', '', E.hide); E.btn(c, '🚪 Sair', 'b2', E.close); E.mkey = function (e) { if (e.code === 'Escape' || e.code === 'Enter') E.hide(); }; };
  bPause.onclick = function (e) { e.stopPropagation(); E.pauseMenu(); };
  bClose.onclick = function (e) { e.stopPropagation(); E.close(); };

  /* ---------- fantasmas (jogadores ao vivo) ---------- */
  var GH = {};
  var GCOL = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc', '#fb7185', '#2dd4bf', '#f97316'];
  E.ghost = function (id, nick, x, y, z, info, at) {
    var gh = GH[id];
    if (!gh) {
      var cc = GCOL[hashS(id) % GCOL.length]; gh = GH[id] = { av: mkAvatar({ skin: '#ffe4c4', shirt: cc, pants: '#334155', hair: '#1f2937' }, true), x: x, y: y, z: z, tx: x, ty: y, tz: z, lab: null, txt: '' };
      sc.add(gh.av);
      var c = document.createElement('canvas'); c.width = 256; c.height = 64; var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
      var m = new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }); gh.lab = new T.Sprite(m); gh.lab.scale.set(2.6, .65, 1); gh.lab.renderOrder = 5; sc.add(gh.lab); gh.cv = c; gh.tex = t; DSP.push(m, t);
    }
    var txt = nick + (info ? ' · ' + info : '');
    if (txt !== gh.txt) { gh.txt = txt; var g = gh.cv.getContext('2d'); g.clearRect(0, 0, 256, 64); g.fillStyle = 'rgba(15,23,42,.72)'; rr(g, 4, 8, 248, 48, 20); g.fill(); g.fillStyle = '#fff'; g.font = '900 26px Nunito,Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt.slice(0, 22), 128, 33); gh.tex.needsUpdate = true; }
    gh.tx = x; gh.ty = y; gh.tz = z; gh.seen = at || Date.now(); gh.vis = true;
  };
  E.ghostHide = function (id) { var gh = GH[id]; if (gh) gh.vis = false; };
  E.ghostsTick = function (dt) {
    for (var id in GH) {
      var gh = GH[id], on = gh.vis && Date.now() - gh.seen < 12000; gh.av.visible = gh.lab.visible = on; if (!on) continue;
      var k = 1 - Math.exp(-dt * 5), ox = gh.x, oz = gh.z; gh.x += (gh.tx - gh.x) * k; gh.y += (gh.ty - gh.y) * k; gh.z += (gh.tz - gh.z) * k;
      var vx = (gh.x - ox) / Math.max(dt, .001), vz = (gh.z - oz) / Math.max(dt, .001), sp = Math.sqrt(vx * vx + vz * vz);
      if (sp > .3) gh.av.rotation.y = Math.atan2(vx, vz);
      gh.av.position.set(gh.x, gh.y, gh.z); gh.lab.position.set(gh.x, gh.y + 2.4, gh.z); animAv(gh.av, Math.min(sp, 7), Math.abs(gh.ty - gh.y) < .3, dt);
    }
  };

  /* ---------- fechar ---------- */
  E.close = function () {
    if (dead) return; if (o.beforeClose) { try { o.beforeClose(); } catch (e) { } }
    dead = true; cancelAnimationFrame(raf);
    window.removeEventListener('resize', onRs); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu); window.removeEventListener('pointercancel', pu);
    window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', bl);
    try {
      E.clear(); sc.children.slice().forEach(function (ch) { if (ch !== s.ambient && ch !== s.sun) sc.remove(ch); });
      var k; for (k in GC) GC[k].dispose(); for (k in TX) TX[k].dispose(); for (k in MC) MC[k].dispose(); DSP.forEach(function (x) { try { x.dispose(); } catch (e) { } });
      s.sun.castShadow = sunCS; ren.shadowMap.enabled = shm; ren.setSize(s.W, s.H, false); cam.aspect = s.W / s.H; cam.updateProjectionMatrix(); sc.fog = null; cv.classList.remove('obc');
    } catch (e) { }
    if (cv.parentNode === root) root.removeChild(cv);
    if (root.parentNode) root.parentNode.removeChild(root);
    try { if (AC && AC.close) AC.close(); } catch (e) { }
    if (api.onClose) api.onClose();
  };
  E.dead = function () { return dead; };
  window.__rbxObby = E;
  return E;
}

/* ===== Ao vivo: "Jogar com a turma" (usa a ação existente acao=rbxlive do Apps Script; sem ação nova) =====
   sala = <jogo>_<turma do login> (+ código de 4 dígitos opcional). Campos: p = progresso (número), v = posição x/z empacotada,
   est (≤10 chars) = estado + altura + tempo. Polling 1,5 s só com a aba visível e sem sobrepor requisições. Se falhar, o jogo segue solo. */
function LIVE(gameKey) {
  var L = { on: false, ok: false, fails: 0, players: {}, clockOff: 0, sala: '', busy: false, timer: 0, me: { p: 0, v: 0, s: 'w' }, lastOk: 0 };
  var login = String(window.RBX_LOGIN || '');
  L.can = !!(window.EDU_ENDPOINT && /^[A-Za-z0-9]{3,12}$/.test(login) && login !== 'mestre');
  L.login = login;
  L.turma = login.replace(/^\d+/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'geral';
  L.nick = function () { var n = ''; try { n = (window.RBX_NICK_ATUAL && window.RBX_NICK_ATUAL()) || ''; } catch (e) { } n = String(n).trim(); if (n) return n.slice(0, 16); var m = login.match(/^\d+/); return m ? 'Aluno nº ' + m[0] : 'Jogador'; };
  L.now = function () { return Date.now() + L.clockOff; };
  L.start = function (code) { if (!L.can) return false; code = String(code || '').replace(/\D/g, '').slice(0, 4); L.sala = (gameKey + "_" + L.turma + code).slice(0, 20); L.on = true; L.fails = 0; L.send(); clearInterval(L.timer); L.timer = setInterval(function () { if (!document.hidden) L.send(); }, 1500); return true; };
  L.send = function (est) {
    if (!L.on || L.busy) return; L.busy = true;
    var me = L.me, u = window.EDU_ENDPOINT + (window.EDU_ENDPOINT.indexOf('?') < 0 ? '?' : '&') + 'acao=rbxlive&sala=' + encodeURIComponent(L.sala) + '&login=' + encodeURIComponent(login) +
      '&nick=' + encodeURIComponent(L.nick()) + '&pos=' + Math.round(me.p) + '&vidas=' + Math.round(me.v) + '&est=' + encodeURIComponent(String(est || me.s).slice(0, 10));
    var t0 = Date.now(), done = false, to = setTimeout(function () { if (!done) { done = true; L.busy = false; L.fails++; } }, 8000);
    try {
      fetch(u).then(function (r) { return r.json(); }).then(function (d) {
        if (done) return; done = true; clearTimeout(to); L.busy = false;
        if (!d || !d.players) { L.fails++; return; }
        L.ok = true; L.fails = 0; L.lastOk = Date.now(); L.clockOff = d.now - (t0 + Date.now()) / 2;
        var o = {}; for (var k in d.players) if (k !== login && d.players[k].s !== 'saiu') o[k] = d.players[k]; L.players = o;
        if (L.onData) L.onData(o);
      }).catch(function () { if (done) return; done = true; clearTimeout(to); L.busy = false; L.fails++; });
    } catch (e) { done = true; clearTimeout(to); L.busy = false; L.fails++; }
  };
  L.stop = function () { if (!L.on) return; clearInterval(L.timer); L.busy = false; L.send('saiu'); L.on = false; };
  /* empacotamento: v = (x*10+50000)*1e5 + (z*10+50000) ; est = letra + altura (dm, +100 m de folga, 4 díg.) + '_' + segundos */
  L.packV = function (x, z) { return (cl(Math.round(x * 10), -49999, 49999) + 50000) * 100000 + (cl(Math.round(z * 10), -49999, 49999) + 50000); };
  L.unV = function (v) { v = Number(v) || 0; var a = Math.floor(v / 100000), b = v - a * 100000; return [(a - 50000) / 10, (b - 50000) / 10]; };
  L.packS = function (st, y, sec) { var yy = cl(Math.round((y + 100) * 10), 0, 9999); return st + ('000' + yy).slice(-4) + '_' + cl(Math.round(sec), 0, 9999); };
  L.unS = function (s) { s = String(s || ''); var m = s.match(/^([a-z])(\d{4})_(\d+)$/); if (!m) return { st: s.charAt(0) || '?', y: 0, sec: 0, raw: s }; return { st: m[1], y: Number(m[2]) / 10 - 100, sec: Number(m[3]) }; };
  /* largada simultânea: cada um propõe um horário (segundos do servidor mod 1e5) em est='w'+ddddd; todos adotam o menor ainda válido */
  L.proposal = function (others, cur, lead) {
    var now = L.now() / 1000, best = cur == null ? Math.ceil(now + (lead || 8)) : cur, base = Math.floor(now / 100000) * 100000;
    for (var k in others) { var s = String(others[k].s || ''); if (/^w\d{5}$/.test(s)) { var v = base + Number(s.slice(1)); if (v < now - 50000) v += 100000; if (v > now + 1 && v < best) best = v; } }
    return best;
  };
  return L;
}

/* placar lateral ao vivo: rows = [{n, a, b, me}] já ordenadas */
function BOARD(E, title, rows) {
  var sb = E.sb; if (!rows || rows.length < 2) { sb.style.display = 'none'; return; }
  sb.style.display = 'block'; var html = [];
  sb.textContent = ''; el('b', null, title, sb);
  rows.slice(0, 8).forEach(function (r, i) { el('div', r.me ? 'me' : '', (i + 1) + 'º ' + r.n + ' · ' + r.a + (r.b ? ' · ' + r.b : ''), sb); });
}

/* sala de espera com largada simultânea; onGo(startSecServidor|null, multi) */
function LOBBY(E, L, title, onGo, onBack) {
  var c = E.card(), myStart = null, iv = 0, view = 0;
  el('h2', null, '👥 ' + title, c);
  if (!L.can) { el('p', null, 'O modo turma precisa do login do RobIox (entre com seu login da escola). Você pode jogar sozinho.', c); E.btn(c, '▶ Jogar sozinho', '', function () { onGo(null, false); }); E.btn(c, '↩ Voltar', 'b2', onBack); return; }
  el('p', null, 'Sala da turma ' + L.turma.toUpperCase() + '. Código do professor (opcional, 4 números) para uma sala única:', c);
  var inp = el('input', null, null, c); inp.type = 'tel'; inp.maxLength = 4; inp.placeholder = '----'; inp.value = LS('rbx_obby_sala') || '';
  el('div', null, null, c);
  E.btn(c, '🚪 Entrar na sala', '', enter); E.btn(c, '↩ Voltar', 'b2', onBack);
  E.mkey = function (e) { if (e.code === 'Enter') enter(); };
  function enter() {
    var code = String(inp.value || '').replace(/\D/g, '').slice(0, 4); LS('rbx_obby_sala', code);
    L.me.s = 'w'; L.start(code); view = 1;
    c.innerHTML = ''; el('h2', null, '👥 ' + title, c); var info = el('p', null, 'Conectando à sala…', c), big = el('div', null, '', c), list = el('div', null, null, c);
    big.style.cssText = 'font:900 54px Nunito,Arial;color:#7c3aed;min-height:10px';
    list.style.cssText = 'text-align:left;font-weight:800;margin:8px auto;max-width:360px;max-height:30vh;overflow:auto';
    E.btn(c, '▶ Começar agora (sozinho)', 'b3', function () { stop(); onGo(null, true); });
    E.btn(c, '↩ Sair da sala', 'b2', function () { stop(); L.stop(); onBack(); });
    E.mkey = null;
    iv = setInterval(function () {
      if (E.dead()) { stop(); return; }
      var o = L.players, ks = Object.keys(o), wait = {}, nw = 0;
      list.textContent = ''; el('div', null, '🟢 ' + L.nick() + ' (você)', list);
      ks.forEach(function (k) { var s = String(o[k].s || ''); var w = s.charAt(0) === 'w'; if (w) { wait[k] = o[k]; nw++; } el('div', null, (w ? '🟢 ' : '🏃 ') + (o[k].n || 'Colega') + (w ? '' : ' (já jogando)'), list); });
      if (!L.ok && L.fails >= 3) { info.textContent = '⚠️ Servidor indisponível agora. Toque em "Começar agora" para jogar sozinho.'; return; }
      if (!L.ok) return;
      if (nw >= 1) { myStart = L.proposal(wait, myStart, 8); L.me.s = 'w' + ('0000' + (myStart % 100000)).slice(-5); var left = myStart - L.now() / 1000; info.textContent = 'Largada simultânea com ' + (nw + 1) + ' jogadores!'; big.textContent = left > 0 ? String(Math.ceil(left)) : 'VAI!'; if (left <= 0) { stop(); onGo(myStart, true); } }
      else { myStart = null; L.me.s = 'w'; big.textContent = ''; info.textContent = 'Aguardando colegas… (a largada começa quando houver 2 ou mais na sala)'; }
    }, 250);
  }
  function stop() { clearInterval(iv); iv = 0; }
}

/* ===================== TRIVIA OBBY: banco próprio (autoral) — [categoria, nível 1-3, pergunta, resposta, 'distratores|...', explicação] ===================== */
var TQB = [
['C',1,'Qual planeta é conhecido como Planeta Vermelho?','Marte','Júpiter|Vênus|Saturno','Marte tem muito óxido de ferro (ferrugem) no solo, o que dá a cor avermelhada.'],
['C',1,'Qual gás as plantas retiram do ar para fazer a fotossíntese?','Gás carbônico','Oxigênio|Nitrogênio|Hélio','Na fotossíntese a planta usa gás carbônico, água e luz para produzir açúcar e liberar oxigênio.'],
['C',1,'Qual é o maior órgão do corpo humano?','Pele','Fígado|Coração|Intestino','A pele cobre todo o corpo e é considerada o maior órgão humano.'],
['C',2,'Quantos ossos tem, aproximadamente, o corpo de um adulto?','206','106|306|156','O esqueleto adulto tem cerca de 206 ossos; o bebê nasce com mais, que se fundem.'],
['C',1,'Qual é a estrela mais próxima da Terra?','Sol','Sirius|Alfa Centauri|Estrela Polar','O Sol é uma estrela; a seguinte mais próxima é Próxima Centauri.'],
['C',1,'A água pura ferve a quantos graus Celsius ao nível do mar?','100 °C','50 °C|80 °C|120 °C','Ao nível do mar a água ferve a 100 °C; em lugares altos ferve um pouco antes.'],
['C',2,'Qual é o símbolo químico do ouro?','Au','Ag|Go|Or','Au vem do latim aurum. Ag é o símbolo da prata.'],
['C',1,'Qual órgão bombeia o sangue pelo corpo?','Coração','Pulmão|Rim|Estômago','O coração é um músculo que bombeia o sangue pelos vasos sanguíneos.'],
['C',1,'Qual é o maior planeta do Sistema Solar?','Júpiter','Saturno|Terra|Netuno','Júpiter é um gigante gasoso; caberiam mais de mil Terras dentro dele.'],
['C',2,'Como se chama a passagem do estado líquido para o gasoso?','Vaporização','Fusão|Solidificação|Condensação','Vaporização é a passagem de líquido para gás, como a água fervendo.'],
['C',2,'Qual gás existe em maior quantidade no ar que respiramos?','Nitrogênio','Oxigênio|Gás carbônico|Hidrogênio','O ar tem cerca de 78% de nitrogênio e 21% de oxigênio.'],
['C',1,'Animais que se alimentam só de plantas são chamados de:','Herbívoros','Carnívoros|Onívoros|Decompositores','Herbívoros comem vegetais, como o boi e a capivara.'],
['C',1,'Qual parte da planta normalmente absorve água do solo?','Raiz','Folha|Flor|Fruto','As raízes absorvem água e sais minerais e fixam a planta no solo.'],
['C',1,'A Lua é um(a):','Satélite natural','Planeta|Estrela|Cometa','A Lua gira em torno da Terra, por isso é o satélite natural do nosso planeta.'],
['C',2,'Qual vitamina o corpo produz com a ajuda da luz do sol?','Vitamina D','Vitamina C|Vitamina A|Vitamina K','A pele produz vitamina D quando recebe luz solar; ela ajuda a fixar o cálcio nos ossos.'],
['C',1,'Qual é a fórmula química da água?','H₂O','CO₂|O₂|NaCl','A molécula de água tem dois átomos de hidrogênio e um de oxigênio.'],
['C',1,'Quantos planetas existem no Sistema Solar?','8','7|9|10','São 8: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.'],
['C',1,'Em qual órgão acontece a troca do gás carbônico pelo oxigênio?','Pulmões','Fígado|Rins|Estômago','Nos pulmões o sangue recebe oxigênio e libera gás carbônico.'],
['C',1,'A baleia é um:','Mamífero','Peixe|Anfíbio|Réptil','A baleia respira ar pelos pulmões e amamenta os filhotes: é mamífero.'],
['C',2,'Qual é a unidade de medida de força no Sistema Internacional?','Newton','Joule|Watt|Pascal','A força é medida em newtons (N), em homenagem a Isaac Newton.'],
['C',2,'Qual cientista explicou a evolução das espécies por seleção natural?','Charles Darwin','Isaac Newton|Albert Einstein|Louis Pasteur','Darwin publicou "A Origem das Espécies" em 1859.'],
['C',3,'A célula que não tem núcleo organizado (como a das bactérias) é chamada de:','Procariótica','Eucariótica|Vegetal|Nervosa','Nas procarióticas o material genético fica solto no citoplasma.'],
['C',1,'Qual é o planeta mais próximo do Sol?','Mercúrio','Vênus|Terra|Marte','Mercúrio é o primeiro planeta e também o menor do Sistema Solar.'],
['C',1,'Sapos e rãs pertencem a qual grupo de animais?','Anfíbios','Répteis|Mamíferos|Peixes','Anfíbios vivem parte da vida na água e parte em terra.'],
['C',2,'Qual metal é líquido à temperatura ambiente?','Mercúrio','Ferro|Alumínio|Cobre','O mercúrio é o único metal líquido em temperatura ambiente.'],
['C',2,'Em qual destes meios o som NÃO se propaga?','Vácuo','Água|Ar|Metal','O som precisa de matéria para se propagar; no vácuo não há som.'],
['C',2,'Qual camada da atmosfera protege a Terra de parte dos raios ultravioleta?','Camada de ozônio','Camada de nuvens|Crosta terrestre|Manto','O ozônio absorve boa parte da radiação ultravioleta do Sol.'],
['C',1,'A energia produzida pela força do vento chama-se:','Eólica','Solar|Hidrelétrica|Nuclear','Eólica vem de Éolo, o deus dos ventos na mitologia grega.'],
['C',2,'Qual é o osso mais longo do corpo humano?','Fêmur','Úmero|Tíbia|Rádio','O fêmur fica na coxa e é o maior osso do corpo.'],
['C',3,'Ao passar por um prisma, a luz branca se separa em várias cores. Esse fenômeno é a:','Dispersão','Reflexão|Evaporação|Fusão','Cada cor se desvia de um jeito no prisma, formando um "arco-íris".'],
['C',3,'Qual organela da célula é responsável pela respiração celular?','Mitocôndria','Ribossomo|Cloroplasto|Vacúolo','As mitocôndrias liberam a energia dos alimentos para a célula.'],
['C',2,'O pigmento verde das plantas chama-se:','Clorofila','Melanina|Hemoglobina|Caroteno','A clorofila capta a luz usada na fotossíntese.'],
['C',1,'A água pura congela a quantos graus Celsius ao nível do mar?','0 °C','10 °C|−10 °C|4 °C','A 0 °C a água passa do estado líquido para o sólido (gelo).'],
['C',2,'Quantos dentes tem, em geral, um adulto com a dentição completa?','32','20|28|36','O adulto tem 32 dentes, contando os sisos; a criança tem 20 de leite.'],
['C',1,'Qual gás as plantas liberam na fotossíntese?','Oxigênio','Gás carbônico|Metano|Nitrogênio','O oxigênio liberado pelas plantas é usado na respiração dos seres vivos.'],
['C',1,'Qual força nos mantém presos ao chão?','Gravidade','Magnetismo|Atrito|Empuxo','A gravidade da Terra atrai tudo para o seu centro.'],
['C',2,'Nas células eucarióticas, o DNA fica guardado principalmente no:','Núcleo','Membrana|Citoplasma|Parede celular','O núcleo guarda o material genético da célula.'],
['C',3,'Qual é a velocidade aproximada da luz no vácuo?','300 mil km/s','300 km/s|3 mil km/s|30 mil km/s','A luz percorre cerca de 300 000 km a cada segundo.'],
['C',1,'Qual destes é um mamífero que voa?','Morcego','Pinguim|Avestruz|Beija-flor','O morcego é o único mamífero capaz de voar de verdade.'],
['C',2,'A passagem do estado líquido para o sólido chama-se:','Solidificação','Sublimação|Condensação|Ebulição','Quando a água vira gelo, ocorre a solidificação.'],
['C',1,'Qual planeta tem os anéis mais visíveis?','Saturno','Marte|Mercúrio|Vênus','Os anéis de Saturno são feitos de gelo e rochas.'],
['C',1,'Quantas patas tem um inseto?','6','8|4|10','Todo inseto adulto tem 6 patas; aranhas, que têm 8, não são insetos.'],
['C',1,'Qual elemento químico tem o símbolo O?','Oxigênio','Ouro|Ósmio|Prata','O é o oxigênio. Ouro é Au, ósmio é Os e prata é Ag.'],
['C',2,'Qual é o principal alimento da maioria das plantas, produzido por elas mesmas?','Glicose (açúcar)','Sal|Ferro|Proteína animal','Na fotossíntese a planta produz glicose, que serve de alimento e energia.'],
['G',1,'Qual é o maior país do mundo em área?','Rússia','Canadá|China|Brasil','A Rússia ocupa parte da Europa e da Ásia e é o maior país em território.'],
['G',1,'Qual é a capital do Brasil?','Brasília','Rio de Janeiro|São Paulo|Salvador','Brasília é a capital desde 1960.'],
['G',1,'Qual é o maior oceano da Terra?','Pacífico','Atlântico|Índico|Ártico','O Pacífico é o maior e o mais profundo dos oceanos.'],
['G',1,'Em qual continente fica o Egito?','África','Ásia|Europa|Oceania','O Egito fica no nordeste da África (só a Península do Sinai fica na Ásia).'],
['G',1,'Qual rio tem o maior volume de água do mundo?','Amazonas','Nilo|Mississippi|Danúbio','O Amazonas despeja mais água no oceano do que qualquer outro rio.'],
['G',1,'Qual é a capital do Paraná?','Curitiba','Londrina|Maringá|Cascavel','Curitiba é a capital e a maior cidade do Paraná.'],
['G',2,'Quantos estados tem o Brasil, sem contar o Distrito Federal?','26','27|25|24','São 26 estados mais o Distrito Federal, totalizando 27 unidades federativas.'],
['G',1,'Qual é a montanha mais alta do mundo em altitude?','Monte Everest','K2|Aconcágua|Kilimanjaro','O Everest, no Himalaia, tem cerca de 8 849 m de altitude.'],
['G',1,'A linha imaginária que divide a Terra em hemisférios Norte e Sul é a:','Linha do Equador','Meridiano de Greenwich|Trópico de Câncer|Círculo Polar Ártico','O Equador está a 0° de latitude.'],
['G',1,'Qual é a capital da Argentina?','Buenos Aires','Montevidéu|Santiago|Lima','Buenos Aires fica às margens do Rio da Prata.'],
['G',1,'Qual país tem o formato parecido com o de uma bota?','Itália','Espanha|Grécia|Portugal','A Península Itálica lembra uma bota no mapa.'],
['G',2,'Qual é o maior deserto quente do mundo?','Saara','Atacama|Gobi|Kalahari','O Saara ocupa grande parte do norte da África.'],
['G',1,'Em que região do Brasil fica o estado do Amazonas?','Norte','Nordeste|Centro-Oeste|Sul','A Região Norte reúne Amazonas, Pará, Acre, Rondônia, Roraima, Amapá e Tocantins.'],
['G',2,'Qual bioma brasileiro tem árvores de galhos retorcidos e inverno seco?','Cerrado','Pampa|Mata Atlântica|Amazônia','O Cerrado ocupa principalmente o Brasil central.'],
['G',1,'A Cordilheira dos Andes fica em qual continente?','América do Sul','África|Europa|Ásia','Os Andes acompanham todo o oeste da América do Sul.'],
['G',1,'Qual é a capital do Japão?','Tóquio','Pequim|Seul|Osaka','Tóquio é a capital e uma das maiores cidades do mundo.'],
['G',2,'Qual é o menor país do mundo?','Vaticano','Mônaco|Malta|San Marino','O Vaticano fica dentro de Roma e tem menos de 1 km².'],
['G',2,'As Cataratas do Iguaçu ficam na fronteira do Brasil com qual país?','Argentina','Chile|Bolívia|Peru','As cataratas ficam no Rio Iguaçu, entre o Paraná e a Argentina.'],
['G',1,'Qual é o país mais populoso da América do Sul?','Brasil','Argentina|Colômbia|Peru','O Brasil tem mais de 200 milhões de habitantes.'],
['G',1,'Qual instrumento indica os pontos cardeais?','Bússola','Termômetro|Barômetro|Régua','A agulha imantada da bússola aponta para o norte magnético.'],
['G',1,'O Sol nasce, aproximadamente, em qual ponto cardeal?','Leste','Oeste|Norte|Sul','O Sol nasce a leste e se põe a oeste.'],
['G',1,'Qual é a capital da França?','Paris','Lyon|Marselha|Bruxelas','Paris é a capital francesa; Bruxelas é a capital da Bélgica.'],
['G',2,'O Pantanal fica principalmente em quais estados?','Mato Grosso e Mato Grosso do Sul','Bahia e Sergipe|Paraná e Santa Catarina|Pará e Amapá','O Pantanal é uma das maiores planícies alagáveis do mundo.'],
['G',2,'Qual é o maior estado brasileiro em área?','Amazonas','Pará|Mato Grosso|Minas Gerais','O Amazonas tem cerca de 1,5 milhão de km².'],
['G',3,'Qual é o rio mais extenso da Europa?','Volga','Danúbio|Reno|Sena','O Volga corre pela Rússia e deságua no Mar Cáspio.'],
['G',3,'Qual é a capital da Austrália?','Camberra','Sydney|Melbourne|Perth','Camberra foi planejada para ser a capital; Sydney é a maior cidade.'],
['G',3,'O Brasil faz fronteira com quantos países da América do Sul?','10','8|12|6','Só Chile e Equador não fazem fronteira com o Brasil.'],
['G',2,'Qual destes países da América do Sul NÃO faz fronteira com o Brasil?','Chile','Peru|Bolívia|Paraguai','Chile e Equador são os únicos sem fronteira com o Brasil.'],
['G',2,'A linha que passa por Greenwich, em Londres, e marca a longitude 0° é o:','Meridiano de Greenwich','Equador|Trópico de Capricórnio|Círculo Polar Ártico','A partir dele se contam as longitudes leste e oeste e os fusos horários.'],
['G',1,'Qual é a capital de Portugal?','Lisboa','Porto|Madri|Coimbra','Lisboa fica na foz do Rio Tejo; Madri é a capital da Espanha.'],
['G',3,'Qual é o maior lago de água doce do mundo em área?','Lago Superior','Lago Baikal|Lago Titicaca|Lago Vitória','O Lago Superior fica entre EUA e Canadá; o Baikal é o maior em volume.'],
['G',1,'Em qual estado fica a cidade de Foz do Iguaçu?','Paraná','Santa Catarina|São Paulo|Mato Grosso do Sul','Foz do Iguaçu fica no oeste do Paraná, na tríplice fronteira.'],
['G',2,'Qual linha imaginária, a cerca de 23° Sul, passa pelo Paraná?','Trópico de Capricórnio','Trópico de Câncer|Equador|Meridiano de Greenwich','O Trópico de Capricórnio cruza o norte do Paraná, perto de Maringá.'],
['G',1,'Qual é o continente mais populoso?','Ásia','África|Europa|América','A Ásia tem mais da metade da população mundial.'],
['G',1,'A maior parte da Floresta Amazônica fica em qual país?','Brasil','Peru|Colômbia|Venezuela','Cerca de 60% da floresta fica em território brasileiro.'],
['G',3,'Qual é a capital do Canadá?','Ottawa','Toronto|Montreal|Vancouver','Ottawa é a capital; Toronto é a maior cidade do país.'],
['G',3,'O Monte Roraima fica na fronteira do Brasil com a Venezuela e a:','Guiana','Colômbia|Suriname|Peru','O Monte Roraima é um tepui na tríplice fronteira Brasil–Venezuela–Guiana.'],
['G',1,'Qual oceano banha o litoral brasileiro?','Atlântico','Pacífico|Índico|Ártico','Todo o litoral do Brasil é banhado pelo Oceano Atlântico.'],
['G',2,'Como se chama a camada mais externa da Terra, onde vivemos?','Crosta','Manto|Núcleo|Astenosfera','A crosta é a camada rochosa da superfície; abaixo dela fica o manto.'],
['G',1,'Qual instrumento mede a temperatura do ar?','Termômetro','Anemômetro|Pluviômetro|Barômetro','O anemômetro mede o vento e o pluviômetro mede a chuva.'],
['G',2,'Qual é a capital do Egito?','Cairo','Alexandria|Luxor|Casablanca','O Cairo fica às margens do Rio Nilo.'],
['G',1,'O Polo Sul fica em qual continente?','Antártida','Oceania|América do Sul|África','A Antártida é o continente mais frio do planeta.'],
['G',2,'Qual é o rio mais extenso do mundo, segundo a maioria das medições?','Nilo','Tietê|Paraná|Reno','O Nilo e o Amazonas disputam o título; a maioria das fontes aponta o Nilo como mais longo.'],
['H',1,'Em que ano a frota de Pedro Álvares Cabral chegou ao Brasil?','1500','1492|1822|1600','A esquadra de Cabral chegou em abril de 1500.'],
['H',1,'Quem proclamou a Independência do Brasil em 1822?','Dom Pedro I','Dom Pedro II|Tiradentes|Deodoro da Fonseca','Dom Pedro I proclamou a independência em 7 de setembro de 1822.'],
['H',1,'Qual lei aboliu a escravidão no Brasil, em 1888?','Lei Áurea','Lei do Ventre Livre|Lei dos Sexagenários|Lei Eusébio de Queirós','A Lei Áurea foi assinada em 13 de maio de 1888.'],
['H',1,'Quem assinou a Lei Áurea?','Princesa Isabel','Dom Pedro I|Getúlio Vargas|Marechal Deodoro','A Princesa Isabel assinou a lei como regente do Império.'],
['H',2,'Em que ano foi proclamada a República no Brasil?','1889','1822|1500|1930','A República foi proclamada em 15 de novembro de 1889.'],
['H',1,'Quem chegou à América em 1492, em viagem patrocinada pela Espanha?','Cristóvão Colombo','Pedro Álvares Cabral|Vasco da Gama|Fernão de Magalhães','Colombo chegou às ilhas do Caribe em 1492.'],
['H',1,'Qual civilização construiu as pirâmides de Gizé?','Egípcia','Romana|Grega|Asteca','As pirâmides foram túmulos de faraós do Egito Antigo.'],
['H',2,'Tiradentes participou de qual movimento?','Inconfidência Mineira','Revolução Farroupilha|Cabanagem|Guerra de Canudos','A Inconfidência Mineira (1789) lutava contra a cobrança de impostos de Portugal.'],
['H',1,'Qual cidade grega é considerada o berço da democracia?','Atenas','Esparta|Roma|Troia','Em Atenas os cidadãos votavam diretamente nas assembleias.'],
['H',2,'Em que ano terminou a Segunda Guerra Mundial?','1945','1918|1939|1964','A guerra começou em 1939 e terminou em 1945.'],
['H',1,'Em qual cidade fica o Coliseu, símbolo do Império Romano?','Roma','Atenas|Cairo|Paris','O Coliseu era usado para espetáculos na Roma Antiga.'],
['H',2,'Quem foi o primeiro presidente do Brasil?','Marechal Deodoro da Fonseca','Getúlio Vargas|Floriano Peixoto|Juscelino Kubitschek','Deodoro proclamou a República e governou de 1889 a 1891.'],
['H',2,'Qual presidente inaugurou Brasília em 1960?','Juscelino Kubitschek','Getúlio Vargas|Jânio Quadros|Dom Pedro II','JK construiu Brasília para levar a capital ao interior do país.'],
['H',1,'O período anterior à invenção da escrita é chamado de:','Pré-História','Idade Média|Idade Moderna|Antiguidade Clássica','A História, em sentido tradicional, começa com os registros escritos.'],
['H',1,'Castelos, feudos e cavaleiros são marcas de qual período da Europa?','Idade Média','Pré-História|Idade Contemporânea|Antiguidade','A Idade Média vai aproximadamente do século V ao XV.'],
['H',2,'Quem foi o último imperador do Brasil?','Dom Pedro II','Dom Pedro I|Dom João VI|Dom Manuel','Dom Pedro II governou de 1840 até a Proclamação da República, em 1889.'],
['H',3,'Em que ano a família real portuguesa chegou ao Brasil?','1808','1500|1822|1889','A corte fugiu das tropas de Napoleão e chegou ao Brasil em 1808.'],
['H',2,'Qual navegador português chegou à Índia por mar em 1498?','Vasco da Gama','Pedro Álvares Cabral|Cristóvão Colombo|Fernão de Magalhães','Vasco da Gama contornou a África até chegar a Calicute.'],
['H',3,'Em que ano caiu o Muro de Berlim?','1989','1945|1961|2001','O muro foi erguido em 1961 e derrubado em 1989.'],
['H',3,'Em que ano começou a Revolução Francesa?','1789','1500|1889|1917','A Tomada da Bastilha, em 14 de julho de 1789, marca o início.'],
['H',2,'Os vikings vieram de qual região?','Escandinávia','Península Ibérica|Oriente Médio|Norte da África','Os vikings eram navegadores da Noruega, Suécia e Dinamarca.'],
['H',1,'Qual povo antigo criou os Jogos Olímpicos?','Gregos','Romanos|Egípcios|Chineses','Os primeiros jogos foram em Olímpia, na Grécia, por volta de 776 a.C.'],
['H',2,'A escrita cuneiforme surgiu em qual região?','Mesopotâmia','Brasil|Japão|Escandinávia','Os sumérios escreviam em placas de argila com marcas em forma de cunha.'],
['H',2,'Zumbi foi líder de qual quilombo?','Palmares','Canudos|Caldeirão|Contestado','O Quilombo dos Palmares ficava na Serra da Barriga, em Alagoas.'],
['H',2,'Quem foi o primeiro ser humano a pisar na Lua, em 1969?','Neil Armstrong','Yuri Gagarin|Buzz Aldrin|Santos Dumont','Armstrong desceu primeiro; Buzz Aldrin saiu logo depois.'],
['H',1,'Qual brasileiro voou com o 14-Bis em Paris, em 1906?','Santos Dumont','Irmãos Wright|Oswaldo Cruz|Rui Barbosa','Santos Dumont é chamado de "Pai da Aviação" no Brasil.'],
['H',3,'Quem foi o primeiro ser humano a ir ao espaço, em 1961?','Yuri Gagarin','Neil Armstrong|John Glenn|Alan Shepard','O soviético Gagarin deu uma volta na Terra na nave Vostok 1.'],
['H',3,'Na Guerra do Paraguai, o Paraguai lutou contra Brasil, Argentina e:','Uruguai','Chile|Bolívia|Peru','Os três países formaram a Tríplice Aliança (1864–1870).'],
['H',2,'As Grandes Navegações foram lideradas principalmente por Portugal e:','Espanha','Alemanha|Rússia|Suíça','Os dois reinos ibéricos abriram novas rotas marítimas nos séculos XV e XVI.'],
['H',1,'O Brasil foi colônia de qual país?','Portugal','Espanha|França|Holanda','O Brasil foi colônia portuguesa até 1822.'],
['H',2,'Qual foi a primeira capital do Brasil?','Salvador','Rio de Janeiro|Brasília|São Paulo','Salvador foi capital de 1549 a 1763.'],
['H',3,'O Rio de Janeiro foi capital do Brasil até que ano?','1960','1889|1822|1945','Em 1960 a capital passou para Brasília.'],
['H',2,'Qual civilização construiu Machu Picchu?','Incas','Maias|Astecas|Egípcios','Machu Picchu fica nos Andes, no Peru.'],
['H',1,'Os faraós governavam qual civilização?','Egito Antigo','Grécia Antiga|Roma Antiga|China Antiga','O faraó era rei e considerado divino pelos egípcios.'],
['H',3,'Em que ano começou a Primeira Guerra Mundial?','1914','1939|1889|1945','A Primeira Guerra durou de 1914 a 1918.'],
['H',1,'Quem pintou a Mona Lisa?','Leonardo da Vinci','Michelangelo|Picasso|Van Gogh','Leonardo da Vinci foi um gênio do Renascimento italiano.'],
['H',2,'Em qual país começou o Renascimento?','Itália','Inglaterra|Brasil|Rússia','Cidades como Florença foram centros do Renascimento.'],
['H',3,'Quem desenvolveu a prensa de tipos móveis na Europa, por volta de 1450?','Johannes Gutenberg','Thomas Edison|Galileu Galilei|Isaac Newton','A prensa de Gutenberg barateou os livros e espalhou o conhecimento.'],
['H',3,'A Inconfidência Mineira aconteceu em qual século?','XVIII','XVI|XIX|XX','Ela ocorreu em 1789, no século XVIII.'],
['H',3,'Quem é chamado de "Patriarca da Independência" do Brasil?','José Bonifácio','Tiradentes|Rui Barbosa|Duque de Caxias','José Bonifácio foi conselheiro de Dom Pedro I no processo de independência.'],
['H',1,'A Grande Muralha foi construída em qual país?','China','Japão|Índia|Coreia','A muralha foi erguida ao longo de séculos para proteger o norte da China.'],
['H',3,'Em 1943, o governo de Getúlio Vargas criou a:','CLT (leis do trabalho)','Lei Áurea|Constituição de 1824|Independência','A Consolidação das Leis do Trabalho reuniu as leis trabalhistas.'],
['H',2,'A Lei do Ventre Livre, de 1871, declarava livres:','Os filhos de escravizadas nascidos a partir dela','Todos os escravizados|Os maiores de 60 anos|Os indígenas','Foi uma das leis graduais antes da abolição total pela Lei Áurea (1888).'],
['K',1,'Quantos minutos tem uma hora?','60','100|30|90','Uma hora tem 60 minutos e cada minuto tem 60 segundos.'],
['K',1,'Quantos dias tem um ano bissexto?','366','365|364|360','No ano bissexto fevereiro tem 29 dias.'],
['K',1,'Qual é a língua oficial do Brasil?','Português','Espanhol|Inglês|Tupi','O português é a língua oficial; também existem muitas línguas indígenas.'],
['K',1,'Qual é o animal terrestre mais rápido?','Guepardo','Leão|Cavalo|Avestruz','O guepardo pode passar de 100 km/h em corridas curtas.'],
['K',1,'Quantos jogadores de cada time ficam em campo no futebol?','11','10|9|12','São 11 por time, incluindo o goleiro.'],
['K',1,'Tradicionalmente, quantas cores tem o arco-íris?','7','5|6|8','Vermelho, laranja, amarelo, verde, azul, anil e violeta.'],
['K',1,'Qual instrumento musical tem teclas brancas e pretas?','Piano','Violão|Flauta|Bateria','O piano tem 88 teclas na versão completa.'],
['K',2,'Quem escreveu o romance "Dom Casmurro"?','Machado de Assis','José de Alencar|Monteiro Lobato|Carlos Drummond de Andrade','Machado de Assis publicou "Dom Casmurro" em 1899.'],
['K',2,'Quem criou o Sítio do Picapau Amarelo?','Monteiro Lobato','Ziraldo|Mauricio de Sousa|Cecília Meireles','Monteiro Lobato criou Emília, Narizinho e Pedrinho.'],
['K',1,'Qual é a moeda do Brasil?','Real','Peso|Dólar|Euro','O real é a moeda brasileira desde 1994.'],
['K',1,'Quantos lados tem um hexágono?','6','5|7|8','Hexa significa seis. Os favos de mel têm forma de hexágono.'],
['K',1,'Qual é o maior animal do planeta?','Baleia-azul','Elefante-africano|Tubarão-baleia|Girafa','A baleia-azul pode passar de 25 metros de comprimento.'],
['K',2,'Em qual esporte se usa raquete e peteca?','Badminton','Tênis|Vôlei|Golfe','No badminton a peteca é rebatida por cima de uma rede.'],
['K',1,'Em qual símbolo nacional está escrito "Ordem e Progresso"?','Bandeira do Brasil','Hino Nacional|Brasão da República|Selo Nacional','O lema fica na faixa branca do círculo azul da bandeira.'],
['K',3,'Quantas estrelas há na bandeira do Brasil?','27','26|22|50','Há 27 estrelas: uma para cada estado e o Distrito Federal.'],
['K',1,'Quantos segundos tem um minuto?','60','100|30|120','Um minuto tem 60 segundos.'],
['K',1,'Qual é o maior animal terrestre?','Elefante-africano','Rinoceronte|Hipopótamo|Girafa','O elefante-africano pode pesar mais de 6 toneladas.'],
['K',1,'Quantas patas tem uma aranha?','8','6|10|4','Aranhas são aracnídeos e têm 8 patas.'],
['K',2,'Qual idioma tem mais falantes nativos no mundo?','Mandarim (chinês)','Inglês|Espanhol|Hindi','O mandarim é a língua materna de cerca de 1 bilhão de pessoas.'],
['K',2,'Qual destes números é primo?','13','15|21|27','13 só é divisível por 1 e por ele mesmo.'],
['K',1,'A Copa do Mundo de futebol masculino acontece a cada quantos anos?','4','2|3|5','A Copa acontece de 4 em 4 anos.'],
['K',1,'Qual é o ponto cardeal oposto ao norte?','Sul','Leste|Oeste|Nordeste','Os opostos são norte–sul e leste–oeste.'],
['K',3,'Qual compositor brasileiro criou "O Trenzinho do Caipira"?','Heitor Villa-Lobos','Tom Jobim|Chiquinha Gonzaga|Pixinguinha','A peça faz parte das Bachianas Brasileiras nº 2.'],
['K',1,'Quantos anos tem um século?','100','10|1 000|50','Século = 100 anos; década = 10; milênio = 1 000.'],
['K',1,'Quantos anos tem uma década?','10','100|5|12','Uma década tem 10 anos.'],
['K',2,'Qual destes alimentos é uma boa fonte de proteína?','Feijão','Alface|Açúcar|Maçã','O feijão é rico em proteína e ferro.'],
['K',2,'O que significa a sigla ONU?','Organização das Nações Unidas','Organização Nacional Unificada|Ordem das Nações Universais|Organização do Norte Unido','A ONU foi criada em 1945, após a Segunda Guerra.'],
['K',1,'Misturando tinta azul com tinta amarela, que cor obtemos?','Verde','Roxo|Laranja|Marrom','Azul + amarelo = verde.'],
['K',2,'Quanto é 12 × 12?','144','124|132|154','12 × 12 = 144, que é chamado de uma grosa.'],
['K',1,'Meio quilograma equivale a quantos gramas?','500 g','50 g|250 g|5 000 g','1 kg = 1 000 g, então meio quilo = 500 g.'],
['K',1,'Qual é a maior floresta tropical do mundo?','Amazônia','Mata Atlântica|Floresta do Congo|Taiga','A Amazônia se espalha por nove países da América do Sul.'],
['K',1,'Qual órgão dos sentidos é responsável pelo olfato?','Nariz','Olhos|Ouvidos|Língua','O olfato é o sentido que percebe cheiros.'],
['K',1,'Quantos graus tem um ângulo reto?','90°','180°|45°|360°','O ângulo reto mede 90°, como o canto de uma folha.'],
['K',1,'Qual destes é um instrumento de sopro?','Flauta','Violino|Tambor|Piano','Na flauta o som nasce do ar soprado.'],
['K',2,'Quantos meses do ano têm 31 dias?','7','6|5|8','Janeiro, março, maio, julho, agosto, outubro e dezembro.'],
['K',1,'Quantos centímetros há em 1 metro?','100','10|1 000|60','Centi significa centésima parte: 1 m = 100 cm.'],
['K',2,'Qual número romano representa 50?','L','C|X|D','I=1, V=5, X=10, L=50, C=100, D=500, M=1000.'],
['K',2,'Qual número romano representa 100?','C','L|M|D','C vem do latim centum, que significa cem.'],
['K',1,'No semáforo, qual cor indica "pare"?','Vermelho','Verde|Amarelo|Azul','Vermelho = pare; amarelo = atenção; verde = siga.'],
['K',2,'Quantos zeros tem o número um milhão?','6','5|7|9','Um milhão = 1 000 000.'],
['K',1,'Em qual esporte Ayrton Senna foi campeão mundial?','Fórmula 1','Futebol|Tênis|Vôlei','Senna foi tricampeão mundial de Fórmula 1 (1988, 1990 e 1991).'],
['K',3,'Quantas casas tem um tabuleiro de xadrez?','64','32|48|100','O tabuleiro tem 8 × 8 = 64 casas.'],
['K',2,'Quantos lados tem um triângulo?','3','4|5|6','Tri significa três: três lados e três ângulos.'],
['K',3,'Qual é a raiz quadrada de 81?','9','8|7|81','9 × 9 = 81.']
];

/* ===================== TRIVIA OBBY ===================== */
var TCAT = { C: '🔬 Ciências', G: '🌍 Geografia', H: '📜 História', K: '💡 Conhecimentos gerais' };
var TTH = [
  { n: 'Manhã', t: 0x5fb4ff, b: 0xcfeaff, s: 0x60a5fa, p: [0x60a5fa, 0x34d399, 0xfbbf24, 0xf472b6] },
  { n: 'Meio-dia', t: 0x3d8bff, b: 0xbfe3ff, s: 0x22c55e, p: [0x22d3ee, 0x4ade80, 0xfacc15, 0xfb7185] },
  { n: 'Entardecer', t: 0x6d6bd8, b: 0xffc9a3, s: 0xf97316, p: [0xfb923c, 0xa78bfa, 0xfde047, 0x38bdf8] },
  { n: 'Pôr do sol', t: 0x3b3b98, b: 0xff9a76, s: 0xef4444, p: [0xf87171, 0xfbbf24, 0xc084fc, 0x2dd4bf] },
  { n: 'Noite estrelada', t: 0x0b1240, b: 0x2a3a7a, st: 1, s: 0x6366f1, p: [0x818cf8, 0x22d3ee, 0xf0abfc, 0xfde68a] },
  { n: 'Aurora', t: 0x081a2e, b: 0x1f7a6a, st: 1, s: 0x14b8a6, p: [0x2dd4bf, 0xa3e635, 0xe879f9, 0x60a5fa] },
  { n: 'Algodão-doce', t: 0xff9ad5, b: 0xffe1f2, s: 0xec4899, p: [0xf472b6, 0x93c5fd, 0xfde047, 0xc4b5fd] },
  { n: 'Tempestade', t: 0x2f3e55, b: 0x8796ab, s: 0x64748b, p: [0x94a3b8, 0x38bdf8, 0xfacc15, 0xf87171] },
  { n: 'Espaço', t: 0x05010f, b: 0x2a1450, st: 1, s: 0x7c3aed, p: [0xa78bfa, 0x22d3ee, 0xf472b6, 0xfacc15] },
  { n: 'Céu dourado', t: 0x4fa8ff, b: 0xfff2b0, s: 0xeab308, p: [0xfacc15, 0x60a5fa, 0x4ade80, 0xfb923c] }
];
function triviaStart(api) {
  var login = String(window.RBX_LOGIN || ''), SK = 'rbx_triviaobby' + (login ? '_' + login : ''), UK = 'rbx_triviaobby_q' + (login ? '_' + login : '');
  var PG = load(), phase = PG.f, playing = false, tm = 0, coins0 = 0, deaths0 = 0, hudT = 0, multi = false, liveT = 0, fin = null, ann = {}, nPl = 0;
  var L = LIVE('trivia');
  var E = OBBY(api, {
    fogD: .0075, cullY: 0,
    onDeath: function (w) { E.toast(w === 'lava' ? '🔥 Lava!' : w === 'zap' ? '⚡ Raio!' : w === 'bar' ? '💥 Barreira!' : '💨 Caiu!', 1100); },
    onFrame: onFrame, beforeClose: function () { try { L.stop(); } catch (e) { } save(); },
    pauseInfo: function (c) { E.el('p', null, 'Fase ' + phase + '/100 · ⏱ ' + fmtT(tm) + ' · 💨 ' + (E.deaths - deaths0), c); }
  });
  if (!E) return;
  E.sea(-30);

  /* progresso: localStorage por login + ST do RobIox quando o api expõe ST/sv (salva na nuvem junto com o resto) */
  function load() { var s = null, l = LS(SK); try { if (api.ST && api.ST.tob) s = api.ST.tob; } catch (e) { } if (!s || (l && (l.mx || 1) > (s.mx || 1))) s = l; s = s || {}; return { f: cl((s.f | 0) || 1, 1, 100), mx: cl((s.mx | 0) || 1, 1, 100), done: !!s.done, bt: s.bt || {} }; }
  function save() { LS(SK, PG); try { if (api.ST) { api.ST.tob = PG; if (api.sv) api.sv(); } } catch (e) { } }

  function nextQ(p) {
    var cats = ['C', 'G', 'H', 'K'], cat = cats[(p - 1) % 4], tier = p <= 33 ? 1 : p <= 66 ? 2 : 3, i;
    try {
      /* disciplina escolhida no RobIox (ex.: Inglês) manda nas perguntas: 3 de cada 4 vêm do conteúdo dela */
      var sd = +(api && api.ANO) || 0;
      if (sd >= 10 && api.B && api.B.G && api.B.G[sd] && Math.random() < .75) {
        var ks2 = Object.keys(api.B.G[sd]).filter(function (k) { return typeof api.B.G[sd][k] === 'function'; });
        if (ks2.length) { var tk2 = ks2[Math.floor(Math.random() * ks2.length)], q2 = api.B.make(sd, tk2, tier); if (q2 && q2.q && q2.a != null) { var nm = (api.B.TN && api.B.TN[tk2]) || 'Inglês'; q2.topic = nm; q2._chip = sd === 10 ? '🇬🇧 ' + nm : nm; return q2; } }
      }
      var an = cat === 'H' ? 11 : cat === 'G' ? 12 : 0;
      if (an && api.B && api.B.G && api.B.G[an] && Math.random() < .3) {
        var ks = Object.keys(api.B.G[an]).filter(function (k) { return typeof api.B.G[an][k] === 'function'; });
        if (ks.length) { var tk = ks[Math.floor(Math.random() * ks.length)], q0 = api.B.make(an, tk, tier); if (q0 && q0.q && q0.a != null) { q0.topic = TCAT[cat]; q0._chip = TCAT[cat]; return q0; } }
      }
    } catch (e) { }
    var used = LS(UK) || [], cand = [], cand2 = [];
    for (i = 0; i < TQB.length; i++) { if (TQB[i][0] !== cat || used.indexOf(i) >= 0) continue; cand2.push(i); if (TQB[i][1] === tier) cand.push(i); }
    if (!cand2.length) { used = used.filter(function (j) { return TQB[j][0] !== cat; }); for (i = 0; i < TQB.length; i++) if (TQB[i][0] === cat) { cand2.push(i); if (TQB[i][1] === tier) cand.push(i); } }
    var pool = cand.length ? cand : cand2, ix = pool[Math.floor(Math.random() * pool.length)]; used.push(ix); LS(UK, used);
    var e = TQB[ix]; return { q: e[2], a: e[3], d: e[4].split('|'), e: e[5], topic: TCAT[cat], tier: e[1], _chip: TCAT[cat] };
  }
  function pickT(p, r, prev) {
    var d = (p - 1) / 99, Lt = [['n', 3.5 - 2.4 * d], ['mov', p >= 3 ? 1 : 0], ['van', p >= 6 ? .9 : 0], ['spin', p >= 10 ? .8 : 0], ['jump', p >= 12 ? .5 : 0], ['lava', p >= 15 ? .8 : 0], ['bar', p >= 20 ? .8 : 0], ['zap', p >= 25 ? .8 : 0], ['beam', p >= 30 ? .6 : 0]], tot = 0, i;
    for (i = 0; i < Lt.length; i++) { if (Lt[i][0] === prev && prev !== 'n') Lt[i][1] *= .15; tot += Lt[i][1]; }
    var x = r() * tot; for (i = 0; i < Lt.length; i++) { x -= Lt[i][1]; if (x <= 0) return Lt[i][0]; } return 'n';
  }

  /* fase p: percurso determinístico (mesma fase = mesmo percurso para toda a turma). Metade dos obstáculos da versão anterior. */
  var PATH = [];
  function build(p) {
    E.clear(); PATH = [];
    var th = TTH[Math.min(9, Math.floor((p - 1) / 10))]; E.setSky(th.t, th.b, th.b, .0075); E.stars(!!th.st); if (E.seaMesh) E.seaMesh.material.color.copy(E.col(th.b)).lerp(E.col(0xffffff), .5);
    var r = rng(p * 7919 + 101), d = (p - 1) / 99, n = Math.min(17, 4 + Math.floor(p * .13)), x = 0, y = 0, z = 0, h = Math.PI, prevHalf = 2.5, prevT = 'start', minY = 0, cpAt = p >= 30 ? Math.floor(n / 2) : -1, i;
    E.plat({ x: 0, y: 0, z: 0, w: 5, d: 5, h: 1.2, col: th.s }); E.label('FASE ' + p, 0, 3.3, -2.3, 1.5); PATH.push([0, 0, 0]);
    for (i = 0; i < n; i++) {
      var t = i === cpAt ? 'cp' : pickT(p, r, prevT), s = (3.0 - 1.25 * d) * (.88 + r() * .24);
      var half = t === 'bar' ? 2.4 : t === 'spin' ? 1.3 : t === 'beam' ? 2.3 : t === 'cp' ? 1.9 : s / 2;
      var gap = (1.3 + 1.6 * d) * (.8 + r() * .35); if (prevT === 'spin') gap = Math.min(gap, 2.0); if (t === 'spin' || t === 'bar') gap = Math.max(gap, 1.5); gap = Math.min(gap, 3.0);
      var rise = prevT === 'jump' ? 2.8 : (r() - .3) * (.7 + .5 * d);
      h += (r() - .5) * .7; if (x > 6) h = Math.max(h, Math.PI + .25); if (x < -6) h = Math.min(h, Math.PI - .25); h = cl(h, Math.PI - .75, Math.PI + .75);
      var dist = prevHalf + gap + half; x += Math.sin(h) * dist; z += Math.cos(h) * dist; y += rise;
      var col = th.p[i % th.p.length];
      if (t === 'cp') {
        var cp = E.plat({ x: x, y: y, z: z, w: 3.8, d: 3.8, yaw: h, col: 0x22c55e }); E.box(.16, 2.6, .16, E.lam(0xe5e7eb), x + 1.4, y + 1.3, z); var fl = E.box(.9, .55, .06, E.lam(0xef4444, { em: 0x7f1d1d }), x + 1.85, y + 2.3, z);
        (function (cx, cy, cz, hh, flag) { cp.land = function () { if (cp.got) return; cp.got = true; flag.material = E.lam(0x22c55e, { em: 0x14532d }); E.setSpawn(cx, cy, cz, hh + Math.PI); E.toast('🚩 Checkpoint!', 1000); E.snd(990, .15, 'square', .05); }; })(x, y, z, h, fl);
      } else {
        var op = { col: col, ph: r() * 6, r: r, w: t === 'spin' ? .7 + .8 * d : t === 'bar' ? 1.1 + 1.0 * d : 1 + .8 * d, per: 3.6 - .8 * d };
        if (t === 'mov') { if (r() < .35 && prevT !== 'jump') op.ay = .9; else { var amp = 1.5 + r(); op.ax = Math.cos(h) * amp; op.az = -Math.sin(h) * amp; } }
        if (t === 'jump') s = Math.max(s, 2.4);
        E.obs(t, x, y, z, h, s, op);
        if ((t === 'n' || t === 'beam') && r() < .35) E.coin(x, y + 1.3, z);
      }
      PATH.push([x, y, z]); minY = Math.min(minY, y); prevHalf = half; prevT = t;
    }
    var dist2 = prevHalf + 1.8 + 3; x += Math.sin(h) * dist2; z += Math.cos(h) * dist2; y += prevT === 'jump' ? 2.8 : .3;
    var fp = E.plat({ x: x, y: y, z: z, w: 6, d: 6, h: 1, yaw: h, col: 0xfacc15 }); fp.land = phaseDone; PATH.push([x, y, z]);
    var tor = new T.Mesh(E.geo('portal', function () { return new T.TorusGeometry(2.2, .28, 10, 28); }), E.lam(0xa855f7, { em: 0x4c1d95, nm: 1 })); tor.position.set(x, y + 2.6, z); tor.rotation.y = h; E.add(tor);
    var disc = new T.Mesh(E.geo('disc', function () { return new T.CircleGeometry(2, 24); }), E.basic(0xc4b5fd, .45, true, true)); disc.position.copy(tor.position); disc.rotation.y = h; E.add(disc); fin = { tor: tor, disc: disc };
    E.label('🏁', x, y + 5.5, z, 1.4, 'rgba(161,98,7,.9)');
    for (i = 0; i < 14; i++) { var pp = PATH[Math.floor(r() * PATH.length)], sd = r() < .5 ? -1 : 1; E.cloud(pp[0] + sd * (14 + r() * 30), pp[1] - 6 + r() * 16, pp[2] + (r() - .5) * 20, 6 + r() * 9, .85, null, true); }
    E.killY = minY - 10; E.setSpawn(0, 0, 1.2, 0); E.respawn();
  }
  function progress() { var pl = E.pl, best = 0, bd = 1e9; for (var i = 0; i < PATH.length; i++) { var q = PATH[i], dx = pl.x - q[0], dz = pl.z - q[2], dd = dx * dx + dz * dz; if (dd < bd) { bd = dd; best = i; } } return Math.min(999, Math.round(best / Math.max(1, PATH.length - 1) * 999)); }

  /* ---------- fluxo ---------- */
  function menu() {
    try { L.stop(); } catch (e) { } multi = false; playing = false; E.sb.style.display = 'none';
    build(PG.f); phase = PG.f;
    var c = E.card(); E.el('h2', null, 'Trivia Obby 🧠', c);
    E.el('p', null, '100 fases de parkour nas nuvens. Antes de cada fase vem uma pergunta de Ciências, Geografia, História ou Conhecimentos gerais: acerte para liberar a fase!', c);
    var bar = E.el('div', 'bar', null, c), bi = E.el('i', null, null, bar); bi.style.width = Math.round((PG.mx - 1) / 100 * 100) + '%';
    E.el('p', null, PG.done ? '👑 Você completou as 100 fases! Jogue qualquer fase de novo.' : 'Progresso: fase ' + PG.f + ' de 100 (maior liberada: ' + PG.mx + ')', c);
    E.btn(c, '▶ Jogar fase ' + PG.f, '', function () { startPhase(PG.f); });
    E.btn(c, '👥 Jogar com a turma', 'b3', function () { LOBBY(E, L, 'Trivia Obby com a turma', function (st, m) { multi = !!m; if (st) countdownThen(function () { startPhase(PG.f, true); }); else startPhase(PG.f, true); }, menu); });
    E.btn(c, '🗺️ Escolher fase', 'b2', pickPhase); E.btn(c, '🚪 Sair', 'b2', E.close);
    E.mkey = function (e) { if (e.code === 'Enter' || e.code === 'Space') startPhase(PG.f); };
  }
  function pickPhase() {
    var c = E.card(); E.el('h2', null, '🗺️ Escolher fase', c); var g = E.el('div', 'grid', null, c);
    for (var i = 1; i <= 100; i++) (function (k) { var b = E.el('button', k === PG.f ? 'cur' : '', String(k), g); b.disabled = k > PG.mx; b.onclick = function (e) { e.stopPropagation(); PG.f = k; save(); startPhase(k); }; })(i);
    E.btn(c, '↩ Voltar', 'b2', menu);
  }
  function countdownThen(fn) { E.hide(); var n = 3; (function tick() { if (E.dead()) return; if (n > 0) { E.toast(String(n), 800); E.snd(440, .12, 'square', .05); n--; setTimeout(tick, 1000); } else fn(); })(); }
  function startPhase(p, keepMulti) {
    if (!keepMulti && multi) { try { L.stop(); } catch (e) { } multi = false; }
    phase = p; PG.f = p; save(); build(p);
    playing = false; E.frozen = true; ask(0);
  }
  function ask(tries) {
    var q = nextQ(phase);
    E.ask(q, q._chip + ' · Fase ' + phase, function (ok) {
      try { if (api.log) api.log(q, ok, tries + 1); } catch (e) { }
      if (ok) { try { api.gain(6, 1); } catch (e) { } E.hide(); go(); }
      else ask(tries + 1);
    }, tries >= 2 ? 1 : undefined);
  }
  function go() { E.respawn(); E.frozen = false; playing = true; tm = 0; coins0 = E.coins; deaths0 = E.deaths; E.toast('Fase ' + phase + ' — vai! 🏁', 1300); E.snd(880, .2, 'square', .05); }
  function phaseDone() {
    if (!playing) return; playing = false; E.frozen = true;
    var p = phase, cc = E.coins - coins0, dd = E.deaths - deaths0, xp = 10 + Math.floor(p / 4) + Math.min(10, cc * 2);
    try { api.gain(xp, 0); if (p % 10 === 0) api.gain(25, 3); } catch (e) { }
    var bt = PG.bt[p]; if (!bt || tm < bt) PG.bt[p] = Math.round(tm);
    if (p >= 100) { PG.done = true; PG.f = 100; PG.mx = 100; } else { PG.f = p + 1; PG.mx = Math.max(PG.mx, p + 1); }
    save();
    if (multi && L.on) { L.me.p = (p + 1) * 1000; L.me.s = L.packS('r', 0, 0); L.send(); }
    E.burst(E.pl.x, E.pl.y + 1.5, E.pl.z, [0xfacc15, 0xf472b6, 0x38bdf8, 0x4ade80], 30);
    [523, 659, 784].forEach(function (f, i) { setTimeout(function () { E.snd(f, .18, 'square', .05); }, i * 130); });
    setTimeout(function () {
      var c = E.card();
      if (p >= 100) { E.el('h2', null, '👑 Você venceu as 100 fases!', c); E.el('p', null, 'Incrível! Agora você pode jogar qualquer fase pelo menu.', c); try { api.gain(100, 5); } catch (e) { } }
      else E.el('h2', null, '🎉 Fase ' + p + ' completa!', c);
      E.el('p', null, '⏱ ' + fmtT(tm) + (bt && tm >= bt ? ' (recorde: ' + fmtT(bt) + ')' : ' 🏅 novo recorde!') + ' · 💨 ' + dd + ' quedas · 🪙 ' + cc + ' · +' + xp + ' XP' + (p % 10 === 0 ? ' · 🎁 bônus!' : ''), c);
      if (p < 100) E.btn(c, '▶ Próxima: fase ' + (p + 1), '', function () { startPhase(p + 1, true); });
      E.btn(c, '🗺️ Menu', 'b2', menu); E.btn(c, '🚪 Sair', 'b2', E.close);
      E.mkey = function (e) { if ((e.code === 'Enter' || e.code === 'Space') && p < 100) startPhase(p + 1, true); };
    }, 900);
  }

  function onFrame(dt, paused) {
    if (playing && !paused) tm += dt * 1000;
    if (fin) { fin.tor.rotation.z += dt * .8; fin.disc.material.opacity = .35 + .15 * Math.sin(Date.now() / 300); }
    hudT -= dt; if (hudT <= 0) { hudT = .2; E.setHud('🧠 TRIVIA OBBY\n🏁 Fase ' + phase + '/100\n⏱ ' + fmtT(tm) + '\n🪙 ' + (E.coins - coins0) + ' · 💨 ' + (E.deaths - deaths0)); }
    if (multi && L.on) live(dt);
  }
  /* ---------- ao vivo: fantasmas só da mesma fase; outras fases aparecem no placar ---------- */
  function live(dt) {
    liveT -= dt; var pl = E.pl;
    if (liveT <= 0) {
      liveT = .5;
      var pr = playing ? progress() : 0; L.me.p = phase * 1000 + pr; L.me.v = L.packV(pl.x, pl.z); L.me.s = L.packS(playing ? 'r' : 'q', pl.y, tm / 1000);
      var o = L.players, rows = [{ n: L.nick(), a: 'Fase ' + phase, b: Math.round(pr / 10) + '%', me: true, sc: phase * 1000 + pr }];
      for (var k in o) {
        var q = o[k], st = L.unS(q.s), f = Math.floor((Number(q.p) || 0) / 1000), prg = (Number(q.p) || 0) % 1000, xz = L.unV(q.v);
        if (f === phase && st.st === 'r') E.ghost(k, q.n || 'Colega', xz[0], st.y, xz[1], Math.round(prg / 10) + '%', (q.t || L.now()) - L.clockOff); else E.ghostHide(k);
        rows.push({ n: q.n || 'Colega', a: f > 0 ? 'Fase ' + f : 'esperando', b: f > 0 ? Math.round(prg / 10) + '%' : '', sc: f * 1000 + prg });
        if (f > 1 && ann[k] && f > ann[k]) E.toast('🧠 ' + (q.n || 'Colega') + ' chegou à fase ' + f + '!', 1800);
        if (f > 0) ann[k] = Math.max(ann[k] || 0, f);
      }
      rows.sort(function (a, b) { return b.sc - a.sc; });
      BOARD(E, '👥 Turma ' + L.turma.toUpperCase() + (L.ok ? '' : ' (offline)'), rows);
    }
    E.ghostsTick(dt);
  }

  window.__rbxTriviaBuild = build;
  menu();
}
window.RBX_JOGOS = window.RBX_JOGOS || {};
window.RBX_JOGOS.triviaobby = {
  nome: 'Trivia Obby 🧠', icone: '🧠', destaque: true, servidor: true,
  desc: '100 fases de parkour: acerte a pergunta de conhecimentos gerais para liberar cada fase. Jogue com a turma!',
  start: function (api) { try { triviaStart(api); } catch (e) { try { console.error(e); } catch (x) { } var b = document.querySelector('.obx'); if (b && b.parentNode) b.parentNode.removeChild(b); if (api && api.onClose) api.onClose(); } }
};
})();
