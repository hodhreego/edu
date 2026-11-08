/* RBX_M3D — mecânicas 3D (Three.js). Parte 2 gerada pelo Gemini (chat web), revisada: faixas, árvores, montanhas, p como propriedade. */
(function(window) {
'use strict';
const RBX3D = window.RBX3D;
if (!RBX3D || !window.THREE) return;
const R = function(a, b) { return a + Math.random() * (b - a); };
const RBX_M3D = {};
/* (A) Estrada */
RBX_M3D.estrada = function(st, easy, W, H) {
const s = RBX3D.shared(W, H, { bgColor: 0x9bd6ff, fogDensity: 0.012, fov: 62 });
let dist = 0; const goal = 1500 + st * 90, baseSpeed = 62 + st * 3; let hitTimer = 0, turboTimer = 0, carX = 0;
const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 300), RBX3D.mat(0x3b4658, 0.9, 0.05)); road.rotation.x = -Math.PI / 2; road.position.z = -140; road.receiveShadow = true; s.scene.add(road);
[-4.15, 4.15].forEach(function(x) { const e = new THREE.Mesh(new THREE.PlaneGeometry(.3, 300), RBX3D.mat(0xffffff, 0.8, 0)); e.rotation.x = -Math.PI / 2; e.position.set(x, 0.01, -140); s.scene.add(e); });
const grass = new THREE.Mesh(new THREE.PlaneGeometry(160, 300), RBX3D.mat(0x39b54a, 0.95, 0)); grass.rotation.x = -Math.PI / 2; grass.position.set(0, -0.05, -140); grass.receiveShadow = true; s.scene.add(grass);
const dashes = []; for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.3, 3), RBX3D.mat(0xffffff, 0.8, 0)); d.rotation.x = -Math.PI / 2; d.position.set(0, 0.02, -i * 12); s.scene.add(d); dashes.push(d); }
for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(R(14, 24), R(18, 30), 5), RBX3D.mat(i % 2 ? 0x7f8fa6 : 0x6c7a92, 0.9, 0)); m.position.set(-70 + i * 28 + R(-6, 6), 8, -230); s.scene.add(m); }
const trees = []; for (let i = 0; i < 16; i++) { const t = RBX3D.tree(); const side = i % 2 ? 1 : -1; t.position.set(side * R(6, 14), 0, -i * 11); t.scale.setScalar(R(.9, 1.5)); s.scene.add(t); trees.push(t); }
const kartGroup = RBX3D.kart(0xe74c3c); const driver = RBX3D.kid(0x3498db); driver.scale.set(.4, .4, .4); driver.position.set(0, .35, -.1); kartGroup.add(driver); kartGroup.position.set(0, 0, 2); s.scene.add(kartGroup);
const obstacles = []; for (let i = 0; i < 16; i++) { const type = Math.random() < 0.7 ? 'cone' : 'coin'; const obj = type === 'cone' ? RBX3D.cone() : RBX3D.coin(); obj.position.set(R(-3.4, 3.4), type === 'coin' ? .9 : 0, -20 - i * 13); s.scene.add(obj); obstacles.push({ mesh: obj, type: type, active: true }); }
s.camera.position.set(0, 3.5, 7);
const mech = { txt: '🏎️ Guie o kart, pegue moedas (turbo) e desvie dos cones!', p: 0,
u: function(dt, inp) {
 if (hitTimer > 0) hitTimer -= dt; let speed = baseSpeed; if (turboTimer > 0) { turboTimer -= dt; speed *= 1.5; } const cs = speed * (hitTimer > 0 ? .5 : 1); dist += cs * dt;
 if (inp.dx) carX += inp.dx * 6 * dt; if (inp.l) carX -= .76; if (inp.r) carX += .76; if (inp.down && inp.px != null) carX += ((inp.px / W * 2 - 1) * 3.6 - carX) * Math.min(1, dt * 8);
 carX = Math.max(-3.5, Math.min(3.5, carX)); kartGroup.position.x = carX; kartGroup.rotation.z = -carX * .05; kartGroup.visible = hitTimer > 0 ? (Math.floor(dist / 4) % 2 === 0) : true;
 s.camera.position.x = carX * .4 + Math.sin(dist * .03) * .25; s.camera.position.y = 3.5 + Math.cos(dist * .05) * .08; s.camera.lookAt(carX * .5, .5, -6);
 dashes.forEach(function(d) { d.position.z += cs * dt; if (d.position.z > 8) d.position.z -= 168; });
 trees.forEach(function(t) { t.position.z += cs * dt; if (t.position.z > 8) t.position.z -= 176; });
 obstacles.forEach(function(o) { o.mesh.position.z += cs * dt; if (o.type === 'coin') o.mesh.rotation.y += dt * 4;
  if (o.mesh.position.z > 8) { o.mesh.position.z -= 208 + R(0, 20); o.mesh.position.x = R(-3.4, 3.4); o.active = true; o.mesh.visible = true }
  if (o.active && Math.abs(o.mesh.position.z - 2) < 1 && Math.abs(o.mesh.position.x - carX) < 1) { o.active = false; o.mesh.visible = false; if (o.type === 'cone') { hitTimer = 1; inp.beep(150, .2, 'sawtooth') } else { turboTimer = 1.4; inp.beep(900, .1) } } });
 this.p = Math.min(1, dist / goal); if (dist >= goal) return 'win'; },
d: function(g, t) { s.render(g); } };
return mech;
};
/* (B) Ilha */
RBX_M3D.ilha = function(st, easy, W, H) {
const s = RBX3D.shared(W, H, { bgColor: 0x7fd8e8, fogDensity: 0.006, fov: 50 });
let got = 0; const need = 12; let hitTimer = 0, tm = 0;
s.camera.position.set(0, 11.5, 9); s.camera.lookAt(0, 0, .2);
const bg = new THREE.BoxGeometry(1, .5, 1), bm = [RBX3D.mat(0x3fbf5a, .8, .05), RBX3D.mat(0x35ab4e, .8, .05)]; const board = new THREE.Group();
for (let x = -3.5; x <= 3.5; x++) for (let z = -3.5; z <= 3.5; z++) { const b = new THREE.Mesh(bg, bm[(x + z + 7) % 2]); b.position.set(x, -.25, z); b.receiveShadow = true; b.castShadow = true; board.add(b) } s.scene.add(board);
const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), RBX3D.mat(0x2a9fd6, .4, .3)); water.rotation.x = -Math.PI / 2; water.position.y = -.9; s.scene.add(water);
const player = RBX3D.kid(0x2980b9); player.scale.setScalar(.7); s.scene.add(player); const target = new THREE.Vector3(0, 0, 0);
const jewels = [], jg = new THREE.OctahedronGeometry(.32), jm = RBX3D.mat(0x39a7ff, .2, .8);
function rp() { return new THREE.Vector3(R(-3.2, 3.2), 0, R(-3.2, 3.2)) }
for (let i = 0; i < 4; i++) { const j = new THREE.Mesh(jg, jm); j.castShadow = true; const p = rp(); j.position.set(p.x, .6, p.z); s.scene.add(j); jewels.push(j) }
const slimes = [], sg = new THREE.SphereGeometry(.42, 10, 8), sm = RBX3D.mat(0x58d68d, .4, .1); const nsl = Math.min(5, 2 + Math.floor(st / 3));
for (let i = 0; i < nsl; i++) { const m = new THREE.Mesh(sg, sm); m.scale.y = .65; m.castShadow = true; const p = rp(); m.position.set(p.x, .25, p.z); m.userData.ph = R(0, 6); s.scene.add(m); slimes.push(m) }
const ray = new THREE.Raycaster(), pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
function aim(px, py) { ray.setFromCamera(new THREE.Vector2(px / W * 2 - 1, -(py / H) * 2 + 1), s.camera); if (ray.ray.intersectPlane(pl, hit)) { target.set(Math.max(-3.5, Math.min(3.5, hit.x)), 0, Math.max(-3.5, Math.min(3.5, hit.z))) } }
const mech = { txt: '💎 Toque onde quer ir (ou use as setas) para pegar 12 joias. Fuja dos slimes!', p: 0,
u: function(dt, inp) {
 tm += dt; if (hitTimer > 0) hitTimer -= dt;
 if ((inp.tap || inp.down) && inp.px != null) aim(inp.px, inp.py);
 const k = 1.1; if (inp.l) target.x = Math.max(-3.5, player.position.x - k); if (inp.r) target.x = Math.min(3.5, player.position.x + k); if (inp.up) target.z = Math.max(-3.5, player.position.z - k); if (inp.dn) target.z = Math.min(3.5, player.position.z + k);
 if (inp.dx) { target.x = Math.max(-3.5, Math.min(3.5, player.position.x + inp.dx * 1.2)) }
 const dir = new THREE.Vector3().subVectors(target, player.position); dir.y = 0; const d = dir.length(); const u = player.userData;
 if (d > .08) { dir.normalize(); player.position.addScaledVector(dir, Math.min(d, 3.2 * dt)); player.rotation.y = Math.atan2(dir.x, dir.z); const w = Math.sin(tm * 12) * .6; u.leftArm.rotation.x = w; u.rightArm.rotation.x = -w; u.leftLeg.rotation.x = -w; u.rightLeg.rotation.x = w } else { u.leftArm.rotation.x = u.rightArm.rotation.x = u.leftLeg.rotation.x = u.rightLeg.rotation.x = 0 }
 player.visible = hitTimer > 0 ? (Math.floor(tm * 12) % 2 === 0) : true;
 jewels.forEach(function(j) { j.rotation.y += dt * 2.5; j.position.y = .6 + Math.sin(tm * 3 + j.position.x) * .08; if (Math.hypot(player.position.x - j.position.x, player.position.z - j.position.z) < .7) { got++; inp.beep(900, .1); const p = rp(); j.position.set(p.x, .6, p.z) } });
 slimes.forEach(function(m) { const v = new THREE.Vector3().subVectors(player.position, m.position); v.y = 0; const dd = v.length() || 1; v.normalize(); m.position.addScaledVector(v, (.85 + st * .08) * (easy ? .8 : 1) * dt); m.position.y = .25 + Math.abs(Math.sin(tm * 5 + m.userData.ph)) * .25; m.scale.y = .65 + Math.sin(tm * 10 + m.userData.ph) * .08;
  if (hitTimer <= 0 && dd < .75) { hitTimer = 1.2; got = Math.max(0, got - 2); inp.beep(130, .3, 'sawtooth'); const p = rp(); m.position.set(p.x, .25, p.z) } });
 this.p = Math.min(1, got / need); if (got >= need) return 'win'; },
d: function(g, t) { s.render(g); } };
return mech;
};
window.RBX_M3D = RBX_M3D;
})(window);
