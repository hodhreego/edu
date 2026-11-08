/* RBX3D.chess — peças e tabuleiro 3D. Parte 3 gerada pelo Gemini (chat web), revisada. */
(function(window) {
'use strict';
const RBX3D = window.RBX3D;
if (!RBX3D || !window.THREE) return;
if (!RBX3D.chess) RBX3D.chess = {};
function chessMat(colorHex) { return new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5, metalness: 0.1, flatShading: true }); }
function createLathePiece(points, colorHex, scale = 1) {
const group = new THREE.Group();
const vecPoints = points.map(p => new THREE.Vector2(p[1] * scale, p[0] * scale));
const mesh = new THREE.Mesh(new THREE.LatheGeometry(vecPoints, 12), chessMat(colorHex));
mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return group;
}
RBX3D.chess.piece = function(tipo, cor) {
const colorHex = (cor === 'w') ? 0xf2ead3 : 0x2b2b33;
let group = new THREE.Group();
const baseProfile = [[0.0, 0.35], [0.05, 0.38], [0.1, 0.32], [0.12, 0.22], [0.2, 0.18], [0.3, 0.20], [0.4, 0.15]];
function add(geom, x, y, z, rx) { const m = new THREE.Mesh(geom, chessMat(colorHex)); m.position.set(x, y, z); if (rx) m.rotation.x = rx; m.castShadow = true; group.add(m); return m; }
switch (tipo) {
case 'p': group = createLathePiece([[0.0, 0.35], [0.05, 0.38], [0.12, 0.22], [0.3, 0.16], [0.4, 0.12], [0.45, 0.18], [0.55, 0.18], [0.6, 0.0]], colorHex, 0.8); add(new THREE.SphereGeometry(0.15, 8, 8), 0, 0.55, 0); break;
case 'r': group = createLathePiece([[0.0, 0.36], [0.06, 0.39], [0.15, 0.25], [0.4, 0.22], [0.6, 0.25], [0.65, 0.28], [0.7, 0.28]], colorHex, 0.85); add(new THREE.BoxGeometry(0.5, 0.1, 0.5), 0, 0.72, 0); [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(function(p){ add(new THREE.BoxGeometry(0.12, 0.12, 0.12), p[0], 0.82, p[1]); }); break;
case 'n': group = createLathePiece(baseProfile, colorHex, 0.85); add(new THREE.BoxGeometry(0.25, 0.4, 0.35), 0, 0.45, 0.05, -0.2); add(new THREE.BoxGeometry(0.2, 0.25, 0.4), 0, 0.65, -0.1); add(new THREE.BoxGeometry(0.06, 0.1, 0.06), -0.07, 0.8, 0); add(new THREE.BoxGeometry(0.06, 0.1, 0.06), 0.07, 0.8, 0); break;
case 'b': group = createLathePiece([[0.0, 0.36], [0.06, 0.39], [0.15, 0.24], [0.5, 0.18], [0.7, 0.15], [0.8, 0.0]], colorHex, 0.85); add(new THREE.SphereGeometry(0.08, 8, 8), 0, 0.8, 0); break;
case 'q': group = createLathePiece([[0.0, 0.38], [0.06, 0.41], [0.15, 0.26], [0.6, 0.18], [0.85, 0.25], [0.9, 0.0]], colorHex, 0.85); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; add(new THREE.SphereGeometry(0.05, 6, 6), Math.cos(a) * 0.18, 0.9, Math.sin(a) * 0.18); } add(new THREE.SphereGeometry(0.07, 6, 6), 0, 0.95, 0); break;
case 'k': group = createLathePiece([[0.0, 0.38], [0.06, 0.41], [0.15, 0.26], [0.65, 0.2], [0.9, 0.25], [0.95, 0.0]], colorHex, 0.85); add(new THREE.BoxGeometry(0.08, 0.25, 0.08), 0, 1.0, 0); add(new THREE.BoxGeometry(0.2, 0.08, 0.08), 0, 1.05, 0); break;
}
return group;
};
RBX3D.chess.board = function(parentGroup) {
const squares = [], squareGeom = new THREE.BoxGeometry(1, 0.3, 1);
for (let r = 0; r < 8; r++) { squares[r] = [];
 for (let c = 0; c < 8; c++) { const isDark = (r + c) % 2 === 1, col = isDark ? 0x8a5a3b : 0xe8d3a8; const mesh = new THREE.Mesh(squareGeom, chessMat(col));
  mesh.position.set(c - 3.5, -0.15, r - 3.5); mesh.receiveShadow = true; mesh.userData.baseColor = col; mesh.userData.row = r; mesh.userData.col = c; parentGroup.add(mesh); squares[r][c] = mesh; } }
const frame = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.35, 8.8), chessMat(0x5c3a21)); frame.position.set(0, -0.33, 0); frame.receiveShadow = true; parentGroup.add(frame);
return squares;
};
RBX3D.chess.highlight = function(mesh, hex) { if (mesh && mesh.material) { if (mesh.userData.baseColor == null) mesh.userData.baseColor = mesh.material.color.getHex(); mesh.material.color.setHex(hex); } };
RBX3D.chess.reset = function(mesh) { if (mesh && mesh.material && mesh.userData.baseColor != null) mesh.material.color.setHex(mesh.userData.baseColor); };
})(window);
