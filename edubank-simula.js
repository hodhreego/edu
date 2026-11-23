/* EduBank — Simulações  (window.EDUBANK_SIM)
   Não gastam dinheiro. Usam taxas e históricos reais (servidor: rfprodutos, historico, serie). SIMULAÇÃO EDUCACIONAL; não é recomendação de investimento.

   CONTRATO:  EDUBANK_SIM = {id:'simulacoes', nome:'Simulações', icone(tam,cor)->svg, render(container, ctx)}
   ctx = { api(acao, extra) -> Promise<json> (injeta login e t), login, getCash(), addCash(delta) [não usados aqui],
           fmtR(centavos), fmtUS(centavos), esc(texto), voltar() (opcional) }
   Botão "Salvar na nuvem": nuvemcarregar/nuvemsalvar com a chave 'edu' (mescla em v.simulacoes, no máximo 10; o resto do conteúdo de 'edu' é preservado)
   e registra a atividade em Educação Financeira (ação resultado) para aparecer no Boletim. Sem dependências; gráficos SVG feitos à mão. */
(function () {
'use strict';
var CTX = null, EL = null, SIM = null, DADOS = null, SAVED = null, SEED = 12345;
var VAL = {};   // valores dos campos por simulação

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function nf(x, d) { return Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function R(v) { return 'R$ ' + nf(v, 2); }   // em reais
function pc(x, d) { return x == null || !isFinite(x) ? '—' : nf(x, d == null ? 2 : d) + '%'; }
function api(a, x) { return Promise.resolve(CTX.api(a, x || {})).then(function (j) { if (!j || !j.ok) throw new Error((j && j.erro) || 'Falha no servidor.'); return j; }); }

/* ---------- matemática (pura, testável) ---------- */
function mensal(aa) { return Math.pow(1 + aa / 100, 1 / 12) - 1; }
function composto(ini, apm, anos, aa, infl) {
  var i = mensal(aa), n = Math.round(anos * 12), s = ini, inv = ini, inf = Math.pow(1 + infl / 100, 1 / 12), pts = [], k;
  pts.push({ m: 0, inv: inv, sal: s, real: s });
  for (k = 1; k <= n; k++) { s = s * (1 + i) + apm; inv += apm; pts.push({ m: k, inv: inv, sal: s, real: s / Math.pow(inf, k) }); }
  return { pts: pts, final: s, invest: inv, juros: s - inv, real: pts[n].real };
}
function price(pv, aa, n) { var i = mensal(aa), p = i === 0 ? pv / n : pv * i / (1 - Math.pow(1 + i, -n)), arr = [], s = pv, k, tj = 0; for (k = 1; k <= n; k++) { var j = s * i; tj += j; s = s - (p - j); arr.push(p); } return { parcelas: arr, juros: tj, total: p * n }; }
function sac(pv, aa, n) { var i = mensal(aa), a = pv / n, s = pv, arr = [], tj = 0, k; for (k = 1; k <= n; k++) { var j = s * i, pa = a + j; arr.push(pa); tj += j; s -= a; } return { parcelas: arr, juros: tj, total: pv + tj }; }
function aposent(renda, idade, idadeApo, saldo, rr) {   // valores de hoje, taxa real a.a.
  var i = mensal(rr), n = Math.max(1, Math.round((idadeApo - idade) * 12)), pat = i > 0 ? renda / i : renda * 12 * 25, fv = saldo * Math.pow(1 + i, n);
  var pmt = pat > fv ? (i > 0 ? (pat - fv) * i / (Math.pow(1 + i, n) - 1) : (pat - fv) / n) : 0, pts = [], s = saldo, k;
  for (k = 0; k <= n; k++) { if (k % 12 === 0 || k === n) pts.push([idade + k / 12, s]); s = s * (1 + i) + pmt; }
  return { pat: pat, pmt: pmt, n: n, pts: pts, atinge: pat <= fv };
}
function rng(seed) { var a = seed >>> 0; return function () { a += 0x6D2B79F5; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { var u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function monteCarlo(v0, anos, estr, seed, N) {   // estr {mu,sig} (a.a. %) -> {p10,p50,p90 por ano, finais}
  var r = rng(seed), paths = [], a, k, t;
  for (a = 0; a < N; a++) { var s = v0, p = [s]; for (t = 1; t <= anos; t++) { var m = Math.log(1 + estr.mu / 100) - Math.pow(estr.sig / 100, 2) / 2; s = s * Math.exp(m + estr.sig / 100 * gauss(r)); p.push(s); } paths.push(p); }
  var out = { p10: [], p50: [], p90: [], fin: [] };
  for (t = 0; t <= anos; t++) { var col = paths.map(function (p) { return p[t]; }).sort(function (x, y) { return x - y; }); out.p10.push(col[Math.floor(N * 0.1)]); out.p50.push(col[Math.floor(N * 0.5)]); out.p90.push(col[Math.floor(N * 0.9)]); if (t === anos) out.fin = col; }
  out.perda = out.fin.filter(function (x) { return x < v0; }).length / N * 100; return out;
}
function mix(ra, rb, w) { return { mu: ra.mu * w + rb.mu * (1 - w), sig: Math.sqrt(Math.pow(ra.sig * w, 2) + Math.pow(rb.sig * (1 - w), 2)) }; }   // sem correlação (simplificação)
function irAliq(t, d) { if (t === 'isento') return 0; if (t === 'g15') return 0.15; return d <= 180 ? 0.225 : d <= 360 ? 0.20 : d <= 720 ? 0.175 : 0.15; }
var IOF = [96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3];
function liq(v, aa, dias, ir, iofOn) { var b = v * Math.pow(1 + aa / 100, dias / 365), r = b - v, io = 0, i = 0; if (r > 0) { if (iofOn && dias < 30) io = r * IOF[Math.max(dias, 1) - 1] / 100; i = (r - io) * irAliq(ir, dias); } return { bruto: b, imp: io + i, liq: b - io - i }; }

/* ---------- gráficos ---------- */
var COR = ['var(--ebs-c1)', 'var(--ebs-c2)', 'var(--ebs-c3)', 'var(--ebs-c4)'], DASH = ['', '7 4', '2 4', '10 3 2 3'];
function linhas(series, o) {
  o = o || {}; var W = 340, H = 200, L = 6, Rr = 58, T = 8, B = 22, xs = [], ys = [];
  series.forEach(function (s) { s.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
  if (!xs.length) return '';
  var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min(0, Math.min.apply(0, ys)), y1 = Math.max.apply(0, ys) || 1, pw = W - L - Rr, ph = H - T - B;
  var X = function (x) { return L + (x - x0) / ((x1 - x0) || 1) * pw; }, Y = function (y) { return T + (y1 - y) / ((y1 - y0) || 1) * ph; }, fy = o.fy || function (v) { return nf(v, 0); }, fx = o.fx || function (v) { return nf(v, 0); }, s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ebs-ch" role="img" aria-label="' + esc(o.t || 'Gráfico') + '">', i;
  for (i = 0; i <= 4; i++) { var v = y0 + (y1 - y0) * i / 4, y = Y(v); s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" stroke="var(--ebs-bd)"/><text x="' + (W - Rr + 4) + '" y="' + (y + 3) + '" font-size="9" fill="var(--ebs-tx2)">' + fy(v) + '</text>'; }
  for (i = 0; i <= 3; i++) { var xv = x0 + (x1 - x0) * i / 3; s += '<text x="' + X(xv) + '" y="' + (H - 6) + '" font-size="9" text-anchor="' + (i === 0 ? 'start' : i === 3 ? 'end' : 'middle') + '" fill="var(--ebs-tx2)">' + fx(xv) + '</text>'; }
  (o.faixa || []).forEach(function (f) { var up = f.hi.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }), dn = f.lo.slice().reverse().map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }); s += '<polygon points="' + up.concat(dn).join(' ') + '" fill="' + f.c + '" opacity=".18"/>'; });
  series.forEach(function (se, k) { s += '<polyline fill="none" stroke="' + (se.c || COR[k % 4]) + '" stroke-width="2.4" stroke-linejoin="round" stroke-dasharray="' + (se.d != null ? se.d : DASH[k % 4]) + '" points="' + se.pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') + '"/>'; });
  s += '</svg><div class="ebs-leg">' + series.map(function (se, k) { return '<span><svg width="30" height="8" aria-hidden="true"><line x1="0" x2="30" y1="4" y2="4" stroke="' + (se.c || COR[k % 4]) + '" stroke-width="3" stroke-dasharray="' + (se.d != null ? se.d : DASH[k % 4]) + '"/></svg> ' + esc(se.n) + '</span>'; }).join('') + '</div>';
  return s;
}
function barras(itens, fmt) {   // [{n,v,c}] horizontal
  var mx = Math.max.apply(0, itens.map(function (i) { return i.v; })) || 1;
  return itens.map(function (it, k) { return '<div class="ebs-bar"><div class="ebs-bn">' + esc(it.n) + '</div><div class="ebs-bt"><div style="width:' + Math.max(2, it.v / mx * 100).toFixed(1) + '%;background:' + (it.c || COR[k % 4]) + '"></div></div><b>' + fmt(it.v) + '</b></div>'; }).join('');
}

/* ---------- estilo ---------- */
function css() {
  if (document.getElementById('ebs-css')) return;
  var s = document.createElement('style'); s.id = 'ebs-css';
  s.textContent = '.ebs{--ebs-bg:var(--bg,#f2f3fa);--ebs-card:var(--card,#fff);--ebs-tx:var(--tx,#14142b);--ebs-tx2:var(--tx2,#4b4d6e);--ebs-bd:var(--bd,#e2e4f1);--ebs-pri:var(--pri,#3b2bb0);--ebs-chip:var(--chip,#eef0fb);--ebs-up:var(--up,#0b7a3b);--ebs-dn:var(--dn,#c0261b);--ebs-c1:#3b2bb0;--ebs-c2:#0b7a3b;--ebs-c3:#b45309;--ebs-c4:#be185d;color:var(--ebs-tx);font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '@media(prefers-color-scheme:dark){.ebs{--ebs-bg:var(--bg,#0d0f1f);--ebs-card:var(--card,#171a31);--ebs-tx:var(--tx,#f2f3fc);--ebs-tx2:var(--tx2,#b9bcdb);--ebs-bd:var(--bd,#2a2d4c);--ebs-pri:var(--pri,#a99cff);--ebs-chip:var(--chip,#222544);--ebs-up:var(--up,#4ade80);--ebs-dn:var(--dn,#ff8f86);--ebs-c1:#a99cff;--ebs-c2:#4ade80;--ebs-c3:#fbbf24;--ebs-c4:#f9a8d4}}' +
    '.ebs *{box-sizing:border-box}.ebs h2{margin:4px 2px 8px;font-size:1.15em}.ebs h3{margin:14px 2px 6px;font-size:.84em;letter-spacing:.05em;text-transform:uppercase;color:var(--ebs-tx2)}.ebs-card{background:var(--ebs-card);border-radius:18px;padding:14px;margin-bottom:12px;box-shadow:0 2px 10px rgba(30,25,90,.09)}.ebs-mut{color:var(--ebs-tx2);font-size:.88em}' +
    '.ebs-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ebs-tile{border:0;background:var(--ebs-card);border-radius:18px;padding:14px 10px;min-height:96px;box-shadow:0 2px 10px rgba(30,25,90,.09);text-align:center;font-weight:800;color:var(--ebs-tx);cursor:pointer;font-size:.95em}.ebs-tile span{display:block;font-size:1.8em;margin-bottom:4px}.ebs-tile small{display:block;font-weight:500;color:var(--ebs-tx2);font-size:.8em;margin-top:2px}' +
    '.ebs label{display:block;font-weight:700;margin:10px 0 4px}.ebs input,.ebs select{width:100%;min-height:48px;font-size:1.02em;padding:10px 12px;border:2px solid var(--ebs-bd);border-radius:14px;background:var(--ebs-card);color:var(--ebs-tx)}.ebs input:focus,.ebs select:focus{outline:2px solid var(--ebs-pri);outline-offset:1px}' +
    '.ebs-btn{width:100%;min-height:50px;border:0;border-radius:16px;background:var(--ebs-pri);color:#fff;font-weight:800;font-size:1.02em;cursor:pointer;margin-top:10px}@media(prefers-color-scheme:dark){.ebs-btn{color:#14142b}}.ebs-btn.sec{background:transparent;color:var(--ebs-pri);border:2px solid var(--ebs-pri)}.ebs-back{border:0;background:none;color:var(--ebs-pri);font-weight:800;min-height:44px;font-size:1em;cursor:pointer}' +
    '.ebs-kv{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--ebs-bd)}.ebs-kv:last-child{border:0}.ebs-kv b{text-align:right;overflow-wrap:anywhere}.ebs-big{font-size:1.6em;font-weight:800;color:var(--ebs-pri)}' +
    '.ebs-ch{width:100%;height:auto;display:block}.ebs-leg{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.84em;margin:6px 0}.ebs-leg span{display:inline-flex;align-items:center;gap:6px}' +
    '.ebs-bar{display:grid;grid-template-columns:minmax(80px,32%) 1fr auto;gap:8px;align-items:center;margin:7px 0;font-size:.9em}.ebs-bt{background:var(--ebs-chip);border-radius:8px;height:16px;overflow:hidden}.ebs-bt div{height:100%;border-radius:8px}' +
    '.ebs-msg{border-radius:14px;padding:10px 12px;margin:10px 0;font-weight:600;background:var(--ebs-chip)}.ebs-msg.e{color:var(--ebs-dn)}.ebs-msg.o{color:var(--ebs-up)}.ebs-aviso{margin:14px 2px;padding:10px 12px;border-radius:12px;background:var(--ebs-chip);font-size:.82em;font-weight:600}.ebs-sv{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--ebs-bd);font-size:.9em}';
  document.head.appendChild(s);
}

/* ---------- definição das simulações ---------- */
var SIMS = {
  juros: { n: 'Juros compostos', i: '📈', d: 'Aportes mensais e inflação', campos: [['ini', 'Valor inicial (R$)', 1000, 0, 1e9, 100], ['apm', 'Aporte mensal (R$)', 200, 0, 1e7, 50], ['anos', 'Prazo (anos)', 10, 1, 60, 1], ['aa', 'Rentabilidade (% ao ano)', 10, -50, 100, 0.5], ['inf', 'Inflação (% ao ano)', 4.5, 0, 50, 0.1]], predef: 'juros' },
  comp: { n: 'Comparador', i: '⚖️', d: 'Poupança × CDB × LCI × Tesouro × bolsa', campos: [['v', 'Valor (R$)', 5000, 1, 1e9, 100], ['meses', 'Prazo (meses)', 12, 1, 120, 1]] },
  tempo: { n: 'Máquina do tempo', i: '⏳', d: 'E se eu tivesse investido?', campos: [['v', 'Valor investido (R$)', 1000, 1, 1e9, 100], ['anos', 'Há quantos anos', 3, 1, 5, 1]], ativo: 1 },
  fin: { n: 'Financiamento', i: '🏠', d: 'Price × SAC', campos: [['pv', 'Valor do bem (R$)', 200000, 1000, 1e9, 1000], ['ent', 'Entrada (R$)', 40000, 0, 1e9, 1000], ['aa', 'Juros (% ao ano)', 11.5, 0.1, 100, 0.1], ['n', 'Prazo (meses)', 240, 6, 480, 6]] },
  apo: { n: 'Aposentadoria', i: '🌴', d: 'Quanto poupar por mês', campos: [['renda', 'Renda mensal desejada, em valores de hoje (R$)', 5000, 100, 1e7, 100], ['idade', 'Sua idade hoje', 18, 10, 80, 1], ['idadeApo', 'Idade para se aposentar', 60, 20, 90, 1], ['saldo', 'Quanto já tem guardado (R$)', 0, 0, 1e9, 100], ['rr', 'Rendimento acima da inflação (% ao ano)', 5, 0, 20, 0.5]] },
  risco: { n: 'Risco × retorno', i: '🎲', d: 'Sorteio de cenários (Monte Carlo)', campos: [['v', 'Valor (R$)', 10000, 1, 1e9, 100], ['anos', 'Prazo (anos)', 10, 1, 40, 1], ['mu', 'Retorno esperado das ações (% a.a.)', 12, 0, 40, 0.5], ['sig', 'Oscilação (volatilidade) das ações (% a.a.)', 22, 1, 80, 1], ['rf', 'Retorno da renda fixa (% a.a.)', 10.5, 0, 30, 0.5], ['w', 'Parte em ações no cenário misto (%)', 50, 0, 100, 5]] }
};
var ORDEM = ['juros', 'comp', 'tempo', 'fin', 'apo', 'risco'];
var ATIVOS_T = [['IBOV', 'Ibovespa (índice)'], ['BOVA11', 'BOVA11 (ETF Ibovespa)'], ['PETR4', 'Petrobras (PETR4)'], ['VALE3', 'Vale (VALE3)'], ['ITUB4', 'Itaú (ITUB4)'], ['IVVB11', 'IVVB11 (S&P 500 em R$)'], ['SPX', 'S&P 500 (em US$)'], ['AAPL', 'Apple (em US$)'], ['NVDA', 'Nvidia (em US$)'], ['BTC', 'Bitcoin (em US$)'], ['ETH', 'Ethereum (em US$)']];

function shell(html) {
  EL.innerHTML = '<div class="ebs">' + html + '<div class="ebs-aviso" role="note">Simulação educacional; não é recomendação de investimento. Resultados passados não garantem resultados futuros.</div></div>';
  EL.querySelector('.ebs').addEventListener('click', onClick);
}
function render(container, ctx) { CTX = ctx; EL = container; css(); SIM = null; menu(); }
function menu() {
  shell('<h2>Simulações</h2><div class="ebs-mut" style="margin:0 2px 10px">Treine sem gastar dinheiro. Escolha uma:</div><div class="ebs-grid">' + ORDEM.map(function (k) { return '<button class="ebs-tile" data-a="abrir" data-v="' + k + '"><span>' + SIMS[k].i + '</span>' + SIMS[k].n + '<small>' + SIMS[k].d + '</small></button>'; }).join('') + '</div>' + (CTX.voltar ? '<button class="ebs-back" data-a="sair" style="margin-top:8px">← Voltar</button>' : ''));
}
function onClick(e) {
  var b = e.target.closest('[data-a]'); if (!b) return; var a = b.getAttribute('data-a'), v = b.getAttribute('data-v');
  if (a === 'abrir') { SIM = v; tela(); } else if (a === 'menu') { SIM = null; menu(); } else if (a === 'sair') CTX.voltar();
  else if (a === 'salvar') salvar(); else if (a === 'sortear') { SEED = (SEED * 1103515245 + 12345) >>> 0; calc(); } else if (a === 'carregar') restaurar(Number(v));
}
function campo(c, v) { return '<label for="ebs-' + c[0] + '">' + c[1] + '</label><input id="ebs-' + c[0] + '" data-k="' + c[0] + '" type="number" inputmode="decimal" min="' + c[3] + '" max="' + c[4] + '" step="any" value="' + v + '">'; }
function tela() {
  var d = SIMS[SIM], V = VAL[SIM] = VAL[SIM] || {};
  d.campos.forEach(function (c) { if (V[c[0]] == null) V[c[0]] = c[2]; });
  var extra = '';
  if (SIM === 'tempo') extra = '<label for="ebs-ativo">Em qual ativo?</label><select id="ebs-ativo" data-k="ativo">' + ATIVOS_T.map(function (a) { return '<option value="' + a[0] + '"' + (V.ativo === a[0] ? ' selected' : '') + '>' + a[1] + '</option>'; }).join('') + '</select>';
  if (SIM === 'juros') extra = '<div class="ebs-mut" id="ebs-pre" style="margin-top:6px">Carregando taxas atuais…</div>';
  shell('<button class="ebs-back" data-a="menu">← Simulações</button><h2>' + d.i + ' ' + d.n + '</h2><div class="ebs-card">' + d.campos.map(function (c) { return campo(c, V[c[0]]); }).join('') + extra + '</div><div id="ebs-res"></div><div class="ebs-card"><button class="ebs-btn" data-a="salvar">Salvar na nuvem</button><div id="ebs-sv"></div></div><div id="ebs-lista"></div>');
  EL.querySelectorAll('[data-k]').forEach(function (inp) { inp.addEventListener('input', function () { var k = inp.getAttribute('data-k'); V[k] = k === 'ativo' ? inp.value : Number(inp.value); calc(); }); });
  if (SIM === 'juros') api('rfprodutos').then(function (j) { DADOS = j; var t = j.taxas, p = EL.querySelector('#ebs-pre'); if (!p) return; p.innerHTML = 'Atalhos (taxas de hoje; ' + esc(t.fonte) + '): <button class="ebs-btn sec" style="min-height:40px;margin:4px 4px 0 0;width:auto;padding:0 12px" data-x="cdi">CDI ' + pc(t.cdi_aa, 1) + '</button><button class="ebs-btn sec" style="min-height:40px;margin:4px 4px 0 0;width:auto;padding:0 12px" data-x="selic">Selic ' + pc(t.selic_aa, 2) + '</button><button class="ebs-btn sec" style="min-height:40px;margin:4px 0 0;width:auto;padding:0 12px" data-x="ipca">IPCA 12m ' + pc(t.ipca_12m, 1) + '</button>'; p.querySelectorAll('[data-x]').forEach(function (b) { b.addEventListener('click', function (ev) { ev.stopPropagation(); var x = b.getAttribute('data-x'); if (x === 'ipca') { VAL.juros.inf = Math.round(t.ipca_12m * 10) / 10; EL.querySelector('#ebs-inf').value = VAL.juros.inf; } else { VAL.juros.aa = Math.round((x === 'cdi' ? t.cdi_aa : t.selic_aa) * 10) / 10; EL.querySelector('#ebs-aa').value = VAL.juros.aa; } calc(); }); }); }).catch(function () { var p = EL.querySelector('#ebs-pre'); if (p) p.textContent = 'Taxas atuais indisponíveis agora; digite manualmente.'; });
  listaSalvas();
  calc();
}
function res(html) { var r = EL.querySelector('#ebs-res'); if (r) r.innerHTML = html; }
function valida(V, d) { for (var i = 0; i < d.campos.length; i++) { var c = d.campos[i], x = V[c[0]]; if (!isFinite(x) || x < c[3] || x > c[4]) return 'Confira o campo "' + c[1] + '" (entre ' + nf(c[3], 0) + ' e ' + nf(c[4], 0) + ').'; } return ''; }
var RES = null;   // último resultado (resumo p/ salvar)
function calc() {
  var V = VAL[SIM], d = SIMS[SIM], er = valida(V, d); if (er) { res('<div class="ebs-msg e">' + er + '</div>'); RES = null; return; }
  RES = null;
  if (SIM === 'juros') cJuros(V); else if (SIM === 'fin') cFin(V); else if (SIM === 'apo') cApo(V); else if (SIM === 'risco') cRisco(V); else if (SIM === 'comp') cComp(V); else if (SIM === 'tempo') cTempo(V);
}
function cJuros(V) {
  var r = composto(V.ini, V.apm, V.anos, V.aa, V.inf), n = r.pts.length;
  var step = Math.max(1, Math.floor(n / 60)), f = function (k) { return r.pts.filter(function (p, i) { return i % step === 0 || i === n - 1; }).map(function (p) { return [p.m / 12, p[k]]; }); };
  RES = { final: Math.round(r.final), investido: Math.round(r.invest), real: Math.round(r.real) };
  res('<div class="ebs-card"><div class="ebs-mut">Você teria</div><div class="ebs-big">' + R(r.final) + '</div><div class="ebs-kv"><span>Total que você colocou</span><b>' + R(r.invest) + '</b></div><div class="ebs-kv"><span>Juros ganhos</span><b>' + R(r.juros) + '</b></div><div class="ebs-kv"><span>Em valores de hoje (descontada a inflação)</span><b>' + R(r.real) + '</b></div>' +
    linhas([{ n: 'Acumulado (nominal)', pts: f('sal') }, { n: 'Acumulado em valores de hoje', pts: f('real') }, { n: 'Total investido', pts: f('inv') }], { t: 'Evolução do dinheiro', fx: function (v) { return nf(v, 0) + 'a'; }, fy: function (v) { return v >= 1e6 ? nf(v / 1e6, 1) + 'mi' : v >= 1000 ? nf(v / 1000, 0) + 'mil' : nf(v, 0); } }) + '<div class="ebs-mut">O gráfico mostra: quanto você guardou, quanto vira com juros e quanto isso vale depois da inflação. Quem começa cedo ganha com o tempo.</div></div>');
}
function cFin(V) {
  var pv = V.pv - V.ent; if (pv <= 0) { res('<div class="ebs-msg e">A entrada precisa ser menor que o valor do bem.</div>'); return; }
  var p = price(pv, V.aa, V.n), s = sac(pv, V.aa, V.n), st = Math.max(1, Math.floor(V.n / 60)), f = function (a) { return a.parcelas.map(function (x, i) { return [i + 1, x]; }).filter(function (x, i) { return i % st === 0 || i === a.parcelas.length - 1; }); };
  RES = { financiado: Math.round(pv), price_total: Math.round(p.total), sac_total: Math.round(s.total) };
  res('<div class="ebs-card"><div class="ebs-kv"><span>Valor financiado</span><b>' + R(pv) + '</b></div><table style="width:100%;border-collapse:collapse;font-size:.92em;margin-top:8px"><tr><th></th><th style="text-align:right">Price</th><th style="text-align:right">SAC</th></tr>' +
    [['1ª parcela', R(p.parcelas[0]), R(s.parcelas[0])], ['Última parcela', R(p.parcelas[p.parcelas.length - 1]), R(s.parcelas[s.parcelas.length - 1])], ['Juros totais', R(p.juros), R(s.juros)], ['Total pago', R(p.total), R(s.total)]].map(function (r) { return '<tr><td style="padding:6px 0;border-top:1px solid var(--ebs-bd)">' + r[0] + '</td><td style="text-align:right;border-top:1px solid var(--ebs-bd)">' + r[1] + '</td><td style="text-align:right;border-top:1px solid var(--ebs-bd)">' + r[2] + '</td></tr>'; }).join('') + '</table>' +
    linhas([{ n: 'Price (parcela fixa)', pts: f(p) }, { n: 'SAC (parcela cai)', pts: f(s) }], { t: 'Parcelas ao longo do tempo', fx: function (v) { return 'mês ' + nf(v, 0); }, fy: function (v) { return nf(v, 0); } }) + '<div class="ebs-mut">Price: parcela igual, começa menor e paga mais juros no total. SAC: começa maior, cai todo mês e paga menos juros. (Não inclui seguros e taxas.)</div></div>');
}
function cApo(V) {
  if (V.idadeApo <= V.idade) { res('<div class="ebs-msg e">A idade de aposentadoria precisa ser maior que a idade de hoje.</div>'); return; }
  var r = aposent(V.renda, V.idade, V.idadeApo, V.saldo, V.rr);
  RES = { patrimonio: Math.round(r.pat), aporte_mensal: Math.round(r.pmt) };
  res('<div class="ebs-card"><div class="ebs-mut">Para viver de renda</div><div class="ebs-kv"><span>Patrimônio necessário (valores de hoje)</span><b>' + R(r.pat) + '</b></div><div class="ebs-mut">Aporte mensal necessário</div><div class="ebs-big">' + (r.atinge ? 'R$ 0,00 — você já chega lá' : R(r.pmt)) + '</div><div class="ebs-kv"><span>Meses poupando</span><b>' + r.n + ' (' + nf(r.n / 12, 1) + ' anos)</b></div>' +
    linhas([{ n: 'Patrimônio acumulado', pts: r.pts }, { n: 'Meta', pts: [[V.idade, r.pat], [V.idadeApo, r.pat]] }], { t: 'Caminho até a meta', fx: function (v) { return nf(v, 0) + ' anos'; }, fy: function (v) { return v >= 1e6 ? nf(v / 1e6, 1) + 'mi' : nf(v / 1000, 0) + 'mil'; } }) + '<div class="ebs-mut">Cálculo em valores de hoje, com rendimento real (acima da inflação) constante. Mantendo o patrimônio, a renda mensal sai só dos juros.</div></div>');
}
function cRisco(V) {
  var a = { mu: V.mu, sig: V.sig }, f = { mu: V.rf, sig: 1.5 }, w = V.w / 100, m = mix(a, f, w), N = 400, out = [['Renda fixa', f, 'var(--ebs-c2)'], ['Ações', a, 'var(--ebs-c4)'], ['Misto (' + V.w + '% ações)', m, 'var(--ebs-c1)']].map(function (x) { return { n: x[0], c: x[2], r: monteCarlo(V.v, V.anos, x[1], SEED, N) }; });
  RES = { mediana: out.map(function (o) { return Math.round(o.r.p50[V.anos]); }), perda_pct: out.map(function (o) { return Math.round(o.r.perda); }) };
  var mx = 0; out.forEach(function (o) { mx = Math.max(mx, o.r.p90[V.anos]); });
  res('<div class="ebs-card"><div class="ebs-mut">' + N + ' futuros sorteados para cada estratégia (hipóteses didáticas, não previsões). Faixa = 80% dos casos; linha = caso do meio.</div>' + out.map(function (o) {
    var p = function (k) { return o.r[k].map(function (v, i) { return [i, v]; }); };
    return '<h3>' + esc(o.n) + '</h3>' + linhas([{ n: 'Caso do meio (mediana)', pts: p('p50'), c: o.c, d: '' }, { n: 'Pior dos 10%', pts: p('p10'), c: o.c, d: '5 4' }, { n: 'Melhor dos 10%', pts: p('p90'), c: o.c, d: '2 3' }], { t: 'Cenários de ' + o.n, faixa: [{ hi: p('p90'), lo: p('p10'), c: o.c }], fx: function (v) { return nf(v, 0) + 'a'; }, fy: function (v) { return v >= 1e6 ? nf(v / 1e6, 1) + 'mi' : nf(v / 1000, 0) + 'mil'; } }) + '<div class="ebs-kv"><span>Mediana / pior 10% / melhor 10%</span><b>' + R(o.r.p50[V.anos]) + ' / ' + R(o.r.p10[V.anos]) + ' / ' + R(o.r.p90[V.anos]) + '</b></div><div class="ebs-kv"><span>Chance de terminar com menos do que investiu</span><b>' + pc(o.r.perda, 0) + '</b></div>';
  }).join('') + '<button class="ebs-btn sec" data-a="sortear">🎲 Sortear de novo</button><div class="ebs-mut">Ações rendem mais em média, mas oscilam: algumas trajetórias terminam abaixo da renda fixa ou até com prejuízo. Diversificar reduz o risco.</div></div>');
}
function cComp(V) {
  res('<div class="ebs-msg">Carregando taxas reais…</div>');
  var tok = SIM + ':' + Date.now(); cComp.t = tok;
  Promise.all([api('rfprodutos'), api('historico', { cod: 'BOVA11', p: '5a' }).catch(function () { return null; }), api('tdtitulos').catch(function () { return null; })]).then(function (r) {
    if (cComp.t !== tok) return;
    var j = r[0], t = j.taxas, dias = Math.round(V.meses * 30.4375), itens = [], P = {}; j.prods.forEach(function (p) { P[p.id] = p; });
    [['poup', 'Poupança'], ['cdb100', 'CDB 100% do CDI'], ['cdb115', 'CDB 115% do CDI*'], ['lci90', 'LCI/LCA 90% do CDI*']].forEach(function (x) { var p = P[x[0]]; if (p && p.aa != null) { var l = liq(V.v, p.aa, dias, p.ir, p.iof); itens.push({ n: x[1], v: l.liq, imp: l.imp, aa: p.aa }); } });
    if (r[2]) { var sel = r[2].itens.filter(function (x) { return x.slug === 'selic'; })[0]; if (sel) { var aa = t.selic_aa + (sel.taxaC || 0), l = liq(V.v * (1 - 0.002 * dias / 365), aa, dias, 'reg', 1); itens.push({ n: 'Tesouro Selic', v: l.liq, imp: l.imp, aa: aa }); } }
    var h = r[1], hist = '';
    if (h && h.pts.length > 20) { var a = h.pts[0], b = h.pts[h.pts.length - 1], anos = (b[0] - a[0]) / 31557600, cagr = (Math.pow(b[4] / a[4], 1 / anos) - 1) * 100, l2 = liq(V.v, cagr, dias, 'g15', 0); itens.push({ n: 'Bolsa (BOVA11, média dos últimos ' + nf(anos, 1) + ' anos)', v: l2.liq, imp: l2.imp, aa: cagr, c: 'var(--ebs-c3)' }); hist = ' A bolsa usa a média histórica (' + pc(cagr, 1) + ' a.a.): não é garantida e pode ser negativa em qualquer período.'; }
    itens.sort(function (x, y) { return y.v - x.v; });
    RES = { prazo_meses: V.meses, valor: V.v, resultado: itens.map(function (i) { return [i.n, Math.round(i.v)]; }) };
    res('<div class="ebs-card"><div class="ebs-mut">Valor líquido depois de ' + V.meses + ' mes(es), já descontados IR e IOF</div>' + barras(itens, R) + '<table style="width:100%;font-size:.88em;margin-top:6px">' + itens.map(function (i) { return '<tr><td>' + esc(i.n) + '</td><td style="text-align:right">' + pc(i.aa, 2) + ' a.a.</td><td style="text-align:right">imp. ' + R(i.imp) + '</td></tr>'; }).join('') + '</table><div class="ebs-mut">Taxas de hoje: ' + esc(t.fonte) + '. * Carência de 90 dias.' + esc(hist) + ' Tesouro Selic considera custódia B3 de 0,20% a.a.</div></div>');
  }).catch(function (e) { res('<div class="ebs-msg e">' + esc(e.message) + '</div>'); });
}
function cTempo(V) {
  res('<div class="ebs-msg">Buscando o histórico real…</div>');
  var tok = 't' + Date.now(); cTempo.t = tok;
  Promise.all([api('historico', { cod: V.ativo, p: '5a' }), api('serie', { s: 'cdi', anos: 5 }).catch(function () { return null; }), api('serie', { s: 'ipca', anos: 5 }).catch(function () { return null; })]).then(function (r) {
    if (cTempo.t !== tok) return;
    var pts = r[0].pts, last = pts[pts.length - 1], alvoTs = last[0] - V.anos * 31557600, i0 = 0, k;
    for (k = 0; k < pts.length; k++) if (pts[k][0] >= alvoTs) { i0 = k; break; }
    var base = pts[i0], t0 = base[0], serie = pts.slice(i0).map(function (p) { return [p[0] * 1000, V.v * p[4] / base[4]]; }), fim = serie[serie.length - 1][1];
    var anosReais = (last[0] - t0) / 31557600, out = [{ n: V.ativo + ' (' + r[0].moeda + ')', pts: serie }], vals = [{ n: V.ativo + ' — só preço, sem dividendos', v: fim }];
    var acum = function (s, nome, cor) { if (!s || !s.meses.length) return null; var ym0 = new Date(t0 * 1000).getFullYear() * 100 + new Date(t0 * 1000).getMonth() + 1, v = V.v, pt = [[t0 * 1000, v]]; s.meses.forEach(function (m) { if (m[0] > ym0) { v *= 1 + m[1] / 100; pt.push([Date.UTC(Math.floor(m[0] / 100), m[0] % 100, 0), v]); } }); out.push({ n: nome, pts: pt }); vals.push({ n: nome, v: v }); return v; };
    var cdi = acum(r[1], 'CDI (renda fixa)'), ipc = acum(r[2], 'Inflação (IPCA): o que mantém seu poder de compra');
    RES = { ativo: V.ativo, anos: Math.round(anosReais * 10) / 10, final: Math.round(fim), cdi: cdi ? Math.round(cdi) : null, ipca: ipc ? Math.round(ipc) : null };
    var di = function (v) { var d = new Date(v); return ('0' + (d.getMonth() + 1)).slice(-2) + '/' + String(d.getFullYear()).slice(2); };
    res('<div class="ebs-card"><div class="ebs-mut">Se você tivesse colocado ' + R(V.v) + ' em ' + di(t0 * 1000) + ' (' + nf(anosReais, 1) + ' anos atrás)</div><div class="ebs-big">' + R(fim) + '</div><div class="ebs-mut">' + (fim >= V.v ? 'ganho de ' : 'perda de ') + pc(Math.abs(fim / V.v - 1) * 100, 1) + ' no preço' + (r[0].moeda === 'USD' ? ' (em dólar; o câmbio muda o resultado em reais)' : '') + '</div>' + linhas(out, { t: 'Máquina do tempo', fx: di, fy: function (v) { return nf(v, 0); } }) + barras(vals, R) + '<div class="ebs-mut">Fonte do preço: ' + esc(r[0].fonte) + '; CDI e IPCA: Banco Central (SGS). Não inclui dividendos, impostos nem taxas. O passado não garante o futuro.</div></div>');
  }).catch(function (e) { res('<div class="ebs-msg e">' + esc(e.message) + '</div>'); });
}

/* ---------- salvar na nuvem ---------- */
function svMsg(t, m) { var d = EL.querySelector('#ebs-sv'); if (d) d.innerHTML = '<div class="ebs-msg ' + t + '" role="status">' + m + '</div>'; }
function salvar() {
  if (!RES) return svMsg('e', 'Complete a simulação antes de salvar.');
  var item = { t: SIM, ts: Date.now(), p: JSON.parse(JSON.stringify(VAL[SIM])), r: RES };
  svMsg('', 'Salvando…');
  api('nuvemcarregar', { k: 'edu' }).then(function (j) {
    var o = j.v && typeof j.v === 'object' ? j.v : {}; o.simulacoes = (o.simulacoes || []).concat([item]).slice(-10);
    return api('nuvemsalvar', { k: 'edu', v: JSON.stringify(o), ts: Date.now() }).then(function (s) { SAVED = o.simulacoes; return s; });
  }).then(function () {
    svMsg('o', 'Simulação salva na sua nuvem! ✔');
    api('resultado', { disc: 'Educação Financeira', cod: 'sim_' + SIM, atividade: 'Simulação: ' + SIMS[SIM].n, concluido: 1, acertos: 1, erros: 0, pct: 100 }).catch(function () { });
    listaSalvas();
  }).catch(function (e) { svMsg('e', esc(e.message) + ' Tente de novo.'); });
}
function listaSalvas() {
  var d = EL.querySelector('#ebs-lista'); if (!d) return;
  var mostra = function (l) { var m = l.filter(function (x) { return x.t === SIM; }).slice(-4).reverse(); d.innerHTML = m.length ? '<div class="ebs-card"><h3 style="margin-top:0">Salvas desta simulação</h3>' + m.map(function (x, i) { return '<div class="ebs-sv"><span>' + new Date(x.ts).toLocaleString('pt-BR') + '</span><button class="ebs-btn sec" style="width:auto;min-height:40px;margin:0;padding:0 14px" data-a="carregar" data-v="' + l.indexOf(x) + '">Abrir</button></div>'; }).join('') + '</div>' : ''; };
  if (SAVED) return mostra(SAVED);
  api('nuvemcarregar', { k: 'edu' }).then(function (j) { SAVED = (j.v && j.v.simulacoes) || []; mostra(SAVED); }).catch(function () { SAVED = null; });
}
function restaurar(i) {
  var x = SAVED && SAVED[i]; if (!x || x.t !== SIM) return;
  VAL[SIM] = JSON.parse(JSON.stringify(x.p)); var V = VAL[SIM];
  EL.querySelectorAll('[data-k]').forEach(function (inp) { var k = inp.getAttribute('data-k'); if (V[k] != null) inp.value = V[k]; }); calc();
}

function icone(tam, cor) { tam = tam || 24; return '<svg width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" fill="none" stroke="' + (cor || 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h8"/></svg>'; }
window.EDUBANK_SIM = { id: 'simulacoes', nome: 'Simulações', icone: icone, render: render, _t: { composto: composto, price: price, sac: sac, aposent: aposent, monteCarlo: monteCarlo, mix: mix, liq: liq, linhas: linhas, rng: rng } };
})();
