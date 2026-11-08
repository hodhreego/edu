/* RBX3D — biblioteca 3D (Three.js r128) para os minijogos. Parte 1 gerada pelo Gemini (chat web), revisada. */
(function(window) {
'use strict';
const RBX3D = {};
RBX3D.stage = function(W, H, opts = {}) {
W = W || 320; H = H || 180;
const scene = new THREE.Scene();
if (opts.fogColor !== false) {
scene.background = new THREE.Color(opts.bgColor || 0x87ceeb);
scene.fog = new THREE.FogExp2(opts.fogColor || 0x87ceeb, opts.fogDensity || 0.015);
}
const camera = new THREE.PerspectiveCamera(opts.fov || 60, W / H, 0.1, 1000);
camera.position.set(0, 10, 15); camera.lookAt(0, 0, 0);
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: opts.antialias !== undefined ? opts.antialias : true, preserveDrawingBuffer: true, alpha: false });
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding;
const ambientLight = new THREE.AmbientLight(0xffffff, opts.ambientIntensity || 0.6); scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, opts.dirIntensity || 0.8);
dirLight.position.set(10, 20, 10); dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 1024; dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 50;
const d = 15; dirLight.shadow.camera.left = -d; dirLight.shadow.camera.right = d; dirLight.shadow.camera.top = d; dirLight.shadow.camera.bottom = -d;
dirLight.shadow.bias = -0.0005; scene.add(dirLight);
return { scene: scene, camera: camera, renderer: renderer, ambient: ambientLight, sun: dirLight,
render: function(g) { renderer.render(scene, camera); g.drawImage(renderer.domElement, 0, 0, W, H); } };
};
/* um único contexto WebGL reaproveitado (navegadores limitam ~16): reset() limpa a cena e reaplica as luzes */
RBX3D.shared = function(W, H, opts) {
 opts = opts || {};
 let s = RBX3D._st;
 if (!s || s.W !== W || s.H !== H) { if (s) RBX3D.dispose(s); s = RBX3D.stage(W, H, { fogColor: false }); s.W = W; s.H = H; RBX3D._st = s; }
 const keep = [s.ambient, s.sun];
 s.scene.children.slice().forEach(function(c) { if (keep.indexOf(c) < 0) { s.scene.remove(c); } });
 s.scene.background = new THREE.Color(opts.bgColor != null ? opts.bgColor : 0x87ceeb);
 s.scene.fog = opts.fogDensity ? new THREE.FogExp2(opts.fogColor != null ? opts.fogColor : (opts.bgColor != null ? opts.bgColor : 0x87ceeb), opts.fogDensity) : null;
 s.camera.fov = opts.fov || 60; s.camera.updateProjectionMatrix();
 s.ambient.intensity = opts.ambientIntensity || 0.6; s.sun.intensity = opts.dirIntensity || 0.8;
 return s;
};
function mat(color, roughness = 0.7, metalness = 0.1) { return new THREE.MeshStandardMaterial({ color: color, roughness: roughness, metalness: metalness, flatShading: true }); }
RBX3D.mat = mat;
RBX3D.kid = function(color = 0x3498db) {
const group = new THREE.Group();
const bodyMat = mat(color), skinMat = mat(0xffdbac), darkMat = mat(0x2c3e50);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), skinMat); head.position.y = 1.8; head.castShadow = true; group.add(head);
const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.5), bodyMat); body.position.y = 1.0; body.castShadow = true; group.add(body);
function limb(x, y, gw, gh, m) { const gr = new THREE.Group(); gr.position.set(x, y, 0); const l = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, gw), m); l.position.y = -gh / 2; l.castShadow = true; gr.add(l); group.add(gr); return gr; }
const la = limb(-0.6, 1.4, 0.3, 0.9, bodyMat), ra = limb(0.6, 1.4, 0.3, 0.9, bodyMat), ll = limb(-0.25, 0.5, 0.35, 0.8, darkMat), rl = limb(0.25, 0.5, 0.35, 0.8, darkMat);
group.userData = { leftArm: la, rightArm: ra, leftLeg: ll, rightLeg: rl };
return group;
};
RBX3D.cone = function() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4), mat(0xe67e22)); c.position.y = 0.6; c.castShadow = true; g.add(c); const s = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.42), mat(0xffffff)); s.position.y = 0.6; g.add(s); return g; };
RBX3D.coin = function() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12), mat(0xf1c40f, 0.3, 0.8)); m.rotation.x = Math.PI / 2; m.castShadow = true; const g = new THREE.Group(); g.add(m); return g; };
RBX3D.tree = function() { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.2, 6), mat(0x795548)); t.position.y = 0.6; t.castShadow = true; g.add(t); const l = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.2, 6), mat(0x27ae60)); l.position.y = 2.0; l.castShadow = true; g.add(l); return g; };
RBX3D.rock = function() { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), mat(0x95a5a6)); m.position.y = 0.5; m.castShadow = true; const g = new THREE.Group(); g.add(m); return g; };
RBX3D.kart = function(color = 0xe74c3c) {
const group = new THREE.Group(); const bm = mat(color), wm = mat(0x222222);
const ch = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.6), bm); ch.position.y = 0.4; ch.castShadow = true; group.add(ch);
const dr = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.4), mat(0xffdbac)); dr.position.set(0, 0.85, -0.1); group.add(dr);
const wg = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10); wg.rotateZ(Math.PI / 2);
[[-0.6, 0.3, 0.6], [0.6, 0.3, 0.6], [-0.6, 0.3, -0.6], [0.6, 0.3, -0.6]].forEach(function(p) { const w = new THREE.Mesh(wg, wm); w.position.set(p[0], p[1], p[2]); w.castShadow = true; group.add(w); });
return group;
};
RBX3D.ship = function() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.0, 4), mat(0x9b59b6)); m.rotation.x = Math.PI / 2; m.position.y = 0.8; m.castShadow = true; g.add(m); return g; };
RBX3D.ghost = function() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), mat(0xecf0f1)); m.position.y = 1.0; m.castShadow = true; g.add(m); return g; };
RBX3D.fish = function() { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 1.2), mat(0x3498db)); b.position.y = 0.5; b.castShadow = true; g.add(b); return g; };
RBX3D.crate = function() { const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), mat(0xd35400)); m.position.y = 0.5; m.castShadow = true; const g = new THREE.Group(); g.add(m); return g; };
RBX3D.dispose = function(stage) {
if (!stage) return;
if (stage.scene) stage.scene.traverse(function(n) { if (n.geometry) n.geometry.dispose(); if (n.material) { (Array.isArray(n.material) ? n.material : [n.material]).forEach(function(m) { m.dispose(); }); } });
if (stage.renderer) stage.renderer.dispose();
};
window.RBX3D = RBX3D;
})(window);
