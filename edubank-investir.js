/* EduBank — Investir / Mercados / Carteira  (window.EDUBANK_INV)
   SIMULAÇÃO EDUCACIONAL (dinheiro fictício; preços e taxas reais). Não é recomendação de investimento.

   CONTRATO (para ligar às abas do EduBank):
     EDUBANK_INV            = {id:'investir',  nome:'Investir',  icone(tam,cor)->svg, render(container, ctx)}
     EDUBANK_INV.mercados   = {id:'mercados',  nome:'Mercados',  icone, render}
     EDUBANK_INV.carteira   = {id:'carteira',  nome:'Carteira',  icone, render}
   ctx = { api(acao, extra) -> Promise<json do servidor> (já injeta login e t),
           login, getCash() -> centavos de R$ (número ou Promise), addCash(deltaCentavos) (negativo debita; pode ser Promise),
           fmtR(centavos)->'R$ 1,00', fmtUS(centavos)->'US$ 1,00', esc(texto), voltar() (opcional: botão "voltar" do nível raiz) ,
           receber() (opcional: chamada após venda/resgate para o app buscar os créditos pendentes) }
   Valores monetários = centavos. Débitos (compra/aplicação): o cliente confere o saldo, manda `cash` e só debita quando o servidor confirma
   (id idempotente reaproveitado em nova tentativa; débito pendente guardado em localStorage). Créditos (venda/resgate/proventos) chegam
   pelo servidor em `receber` (o app já credita). Ações do servidor usadas: ativos, historico, rfprodutos, tdtitulos, fundos, taxas,
   rfaplicar, rfresgatar, invcomprar, invvender, invcarteira. Sem dependências; SVG feito à mão. */
(function () {
'use strict';
var CTX = null, EL = null, VIEW = 'invest';
var ST = { mk: 'br', cat: 'rf', ord: 'rent', q: '', sel: null, selK: '', per: '1m', conf: false, msg: null, busy: false };
var C = {}, IDS = {};

/* ---------- utilidades ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function nf(x, d) { return Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fR(c) { return CTX && CTX.fmtR ? CTX.fmtR(c) : 'R$ ' + nf(c / 100, 2); }
function fUS(c) { return CTX && CTX.fmtUS ? CTX.fmtUS(c) : 'US$ ' + nf(c / 100, 2); }
function pc(x, d) { return x == null || !isFinite(x) ? '—' : nf(x, d == null ? 2 : d) + '%'; }
function sg(x, d) { return x == null || !isFinite(x) ? '—' : (x > 0 ? '+' : x < 0 ? '−' : '') + nf(Math.abs(x), d == null ? 2 : d) + '%'; }
function fP(p, m) { var d = p >= 1000 ? 2 : p >= 1 ? 2 : 4; return (m === 'USD' ? 'US$ ' : 'R$ ') + nf(p, d); }
function fHora(ts) { if (!ts) return '—'; var d = new Date(ts), z = function (n) { return ('0' + n).slice(-2); }; return z(d.getDate()) + '/' + z(d.getMonth() + 1) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); }
function fData(s) { var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[3] + '/' + m[2] + '/' + m[1]; m = String(s).match(/^(\d{4})(\d{2})(\d{2})$/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(s || ''); }
function novoId(k) { var a = ''; for (var i = 0; i < 8; i++) a += Math.floor(Math.random() * 36).toString(36); return (k + Date.now().toString(36) + a).slice(0, 40); }
function idPara(sig) { return IDS[sig] || (IDS[sig] = novoId('i')); }
function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function api(a, x, ttl) {
  var key = a + '|' + JSON.stringify(x || {}), c = C[key];
  if (ttl && c && Date.now() - c.t < ttl) return Promise.resolve(c.j);
  return Promise.resolve(CTX.api(a, x || {})).then(function (j) {
    if (!j || !j.ok) { var e = new Error((j && j.erro) || 'Falha no servidor.'); e.j = j; throw e; }
    if (ttl) C[key] = { t: Date.now(), j: j };
    return j;
  });
}
function cash() { return Promise.resolve(CTX.getCash()).then(function (v) { return Math.max(0, Math.floor(Number(v) || 0)); }); }
function addCash(d) { return Promise.resolve(CTX.addCash(d)); }
function pk() { return 'ebi_pend_' + (CTX && CTX.login || ''); }

/* ---------- regras de imposto (iguais às do servidor) ---------- */
function irAliq(t, d) {
  if (t === 'isento') return 0; if (t === 'g15' || t === 'acoes') return 0.15;
  if (t === 'prev') return d <= 730 ? 0.35 : d <= 1460 ? 0.30 : d <= 2190 ? 0.25 : d <= 2920 ? 0.20 : d <= 3650 ? 0.15 : 0.10;
  if (t === 'cp') return d <= 180 ? 0.225 : 0.20;
  return d <= 180 ? 0.225 : d <= 360 ? 0.20 : d <= 720 ? 0.175 : 0.15;
}
var IOF = [96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3];
function iofAliq(d) { return d >= 30 ? 0 : IOF[Math.max(d, 1) - 1] / 100; }
function liquido(bruto, aplicado, dias, irT, iofOn, cust) {
  cust = cust || 0; var rend = bruto - cust - aplicado, iof = 0, ir = 0;
  if (rend > 0) { if (iofOn) iof = rend * iofAliq(dias); ir = (rend - iof) * irAliq(irT, dias); }
  return { bruto: bruto, rend: rend, iof: iof, ir: ir, cust: cust, liq: bruto - cust - iof - ir, aliq: irAliq(irT, dias) };
}
// projeção de um produto de renda fixa para `dias` corridos (v em reais)
function proj(p, v, dias, tx, spUsd) {
  var du = dias * 252 / 365, f = 1;
  if (p.tipo === 'pos') f = Math.pow(1 + tx.cdi_d / 100 * p.pct, du) * Math.pow(1 + (p.spr || 0), du / 252);
  else if (p.tipo === 'poup') { var rm = Math.pow(1 + p.aa / 100, 1 / 12) - 1; f = Math.pow(1 + rm, Math.floor(dias / 30.4375)); }
  else if (p.tipo === 'usd') f = Math.pow(1 + p.aa / 100, dias / 365) * (1 - spUsd) / (1 + spUsd);
  else f = Math.pow(1 + p.aa / 100, dias / 365);
  return liquido(v * f, v, dias, p.ir, p.iof);
}
// Tesouro até o vencimento (aprox.): taxa de compra + indexador projetado constante
function projTd(t, v, tx, dias) {
  var anos = dias / 365, f;
  if (t.idx === 'pos') f = Math.pow(1 + (tx.selic_aa || 0) / 100, anos) * Math.pow(1 + (t.taxaC || 0) / 100, anos);
  else if (t.idx === 'ipca') f = Math.pow(1 + (tx.ipca_12m || 0) / 100, anos) * Math.pow(1 + t.taxaC / 100, anos);
  else f = Math.pow(1 + t.taxaC / 100, anos);
  var br = v * f, cust = (t.slug === 'selic' && br <= 10000) ? 0 : br * 0.002 * anos;
  var r = liquido(br, v, dias, 'reg', 1, cust); r.aa = (Math.pow(r.liq / v, 1 / anos) - 1) * 100; return r;
}
function diasAte(venc) { return Math.max(1, Math.round((Date.parse(venc + 'T12:00:00') - Date.now()) / 86400000)); }

/* ---------- ícones ---------- */
function icone(tam, cor) {
  tam = tam || 24; return '<svg width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" fill="none" stroke="' + (cor || 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>';
}
function icMercado(tam, cor) { tam = tam || 24; return '<svg width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" fill="none" stroke="' + (cor || 'currentColor') + '" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>'; }
function icCarteira(tam, cor) { tam = tam || 24; return '<svg width="' + tam + '" height="' + tam + '" viewBox="0 0 24 24" fill="none" stroke="' + (cor || 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h14"/><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>'; }

/* ---------- gráficos SVG ---------- */
function spark(pts, w, h) {
  w = w || 84; h = h || 30;
  if (!pts || pts.length < 2) return '<svg width="' + w + '" height="' + h + '" aria-hidden="true"></svg>';
  var mn = Math.min.apply(0, pts), mx = Math.max.apply(0, pts), r = mx - mn || 1, up = pts[pts.length - 1] >= pts[0];
  var d = pts.map(function (v, i) { return (i * (w - 2) / (pts.length - 1) + 1).toFixed(1) + ',' + (h - 3 - (v - mn) / r * (h - 6)).toFixed(1); }).join(' ');
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><polyline points="' + d + '" fill="none" stroke="var(' + (up ? '--ebi-up' : '--ebi-dn') + ')" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
function candles(pts, moeda) {   // pts [[ts,o,h,l,c]]
  if (!pts || pts.length < 2) return '<div class="ebi-mut">Sem histórico disponível.</div>';
  var g = Math.max(1, Math.ceil(pts.length / 90)), cs = [], i, j;
  for (i = 0; i < pts.length; i += g) { var s = pts.slice(i, i + g), o = s[0][1], c = s[s.length - 1][4], hh = -Infinity, ll = Infinity; for (j = 0; j < s.length; j++) { hh = Math.max(hh, s[j][2]); ll = Math.min(ll, s[j][3]); } cs.push([s[0][0], o, hh, ll, c]); }
  var mn = Infinity, mx = -Infinity; cs.forEach(function (k) { mn = Math.min(mn, k[3]); mx = Math.max(mx, k[2]); });
  var W = 340, H = 190, L = 4, R = 54, T = 8, B = 20, pw = W - L - R, ph = H - T - B, rr = mx - mn || 1, bw = Math.max(1.5, pw / cs.length * 0.62);
  var y = function (v) { return T + (mx - v) / rr * ph; }, s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ebi-chart" role="img" aria-label="Gráfico de velas do ativo">';
  for (i = 0; i <= 4; i++) { var v = mn + rr * i / 4, yy = y(v); s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--ebi-bd)" stroke-width="1"/><text x="' + (W - R + 4) + '" y="' + (yy + 3) + '" font-size="9" fill="var(--ebi-tx2)">' + nf(v, v >= 100 ? 0 : 2) + '</text>'; }
  cs.forEach(function (k, n) {
    var x = L + (n + 0.5) * pw / cs.length, up = k[4] >= k[1], col = 'var(' + (up ? '--ebi-up' : '--ebi-dn') + ')', y1 = y(Math.max(k[1], k[4])), y2 = y(Math.min(k[1], k[4]));
    s += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + y(k[2]).toFixed(1) + '" y2="' + y(k[3]).toFixed(1) + '" stroke="' + col + '" stroke-width="1"/><rect x="' + (x - bw / 2).toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, y2 - y1).toFixed(1) + '" fill="' + col + '"' + (up ? '' : '') + '/>';
  });
  var d0 = new Date(cs[0][0] * 1000), d1 = new Date(cs[cs.length - 1][0] * 1000), fd = function (d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + String(d.getFullYear()).slice(2); };
  s += '<text x="' + L + '" y="' + (H - 4) + '" font-size="9" fill="var(--ebi-tx2)">' + fd(d0) + '</text><text x="' + (W - R) + '" y="' + (H - 4) + '" text-anchor="end" font-size="9" fill="var(--ebi-tx2)">' + fd(d1) + '</text></svg>';
  return s;
}
function rosca(fat) {   // fat [{n,v,c}]
  var tot = fat.reduce(function (a, x) { return a + x.v; }, 0); if (tot <= 0) return '';
  var r = 42, cc = 2 * Math.PI * r, off = 0, s = '<svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="Distribuição do patrimônio"><g transform="rotate(-90 60 60)">';
  fat.forEach(function (x) { if (x.v <= 0) return; var l = x.v / tot * cc; s += '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + x.c + '" stroke-width="18" stroke-dasharray="' + l.toFixed(2) + ' ' + (cc - l).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += l; });
  return s + '</g></svg>';
}

/* ---------- estilo ---------- */
function css() {
  if (document.getElementById('ebi-css')) return;
  var s = document.createElement('style'); s.id = 'ebi-css';
  s.textContent = '.ebi{--ebi-bg:var(--bg,#f2f3fa);--ebi-card:var(--card,#fff);--ebi-tx:var(--tx,#14142b);--ebi-tx2:var(--tx2,#4b4d6e);--ebi-bd:var(--bd,#e2e4f1);--ebi-pri:var(--pri,#3b2bb0);--ebi-up:var(--up,#0b7a3b);--ebi-dn:var(--dn,#c0261b);--ebi-chip:var(--chip,#eef0fb);color:var(--ebi-tx);font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
    '@media(prefers-color-scheme:dark){.ebi{--ebi-bg:var(--bg,#0d0f1f);--ebi-card:var(--card,#171a31);--ebi-tx:var(--tx,#f2f3fc);--ebi-tx2:var(--tx2,#b9bcdb);--ebi-bd:var(--bd,#2a2d4c);--ebi-pri:var(--pri,#a99cff);--ebi-up:var(--up,#4ade80);--ebi-dn:var(--dn,#ff8f86);--ebi-chip:var(--chip,#222544)}}' +
    '.ebi *{box-sizing:border-box}.ebi h2{margin:4px 2px 8px;font-size:1.15em}.ebi h3{margin:16px 2px 8px;font-size:.84em;letter-spacing:.05em;text-transform:uppercase;color:var(--ebi-tx2)}' +
    '.ebi-card{background:var(--ebi-card);border-radius:18px;padding:14px;margin-bottom:12px;box-shadow:0 2px 10px rgba(30,25,90,.09)}.ebi-mut{color:var(--ebi-tx2);font-size:.88em}' +
    '.ebi-seg{display:flex;gap:4px;background:var(--ebi-chip);padding:4px;border-radius:16px;margin:8px 0}.ebi-seg button{flex:1;min-height:46px;border:0;border-radius:12px;background:transparent;color:var(--ebi-tx2);font-weight:800;font-size:1em;cursor:pointer}.ebi-seg button.on{background:var(--ebi-card);color:var(--ebi-pri);box-shadow:0 1px 4px rgba(0,0,0,.15)}' +
    '.ebi-chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 8px;-webkit-overflow-scrolling:touch}.ebi-chips button{flex:none;min-height:44px;padding:8px 14px;border-radius:99px;border:2px solid var(--ebi-bd);background:var(--ebi-card);color:var(--ebi-tx);font-weight:700;cursor:pointer}.ebi-chips button.on{background:var(--ebi-pri);border-color:var(--ebi-pri);color:#fff}@media(prefers-color-scheme:dark){.ebi-chips button.on{color:#14142b}}' +
    '.ebi input,.ebi select{width:100%;min-height:48px;font-size:1.02em;padding:10px 12px;border:2px solid var(--ebi-bd);border-radius:14px;background:var(--ebi-card);color:var(--ebi-tx)}.ebi input:focus,.ebi select:focus{outline:2px solid var(--ebi-pri);outline-offset:1px}.ebi label{display:block;font-weight:700;margin:12px 0 5px}' +
    '.ebi-row{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:var(--ebi-card);border:0;border-radius:16px;padding:12px;margin-bottom:8px;box-shadow:0 1px 6px rgba(30,25,90,.08);min-height:64px;color:var(--ebi-tx);cursor:pointer}.ebi-row .mi{flex:1;min-width:0}.ebi-row b{display:block;overflow-wrap:anywhere}.ebi-row small{display:block;color:var(--ebi-tx2);overflow-wrap:anywhere}.ebi-row .mr{text-align:right;min-width:0}' +
    '.ebi-up{color:var(--ebi-up);font-weight:800}.ebi-dn{color:var(--ebi-dn);font-weight:800}' +
    '.ebi-bd{display:inline-block;padding:2px 8px;border-radius:99px;font-size:.74em;font-weight:800;border:1.5px solid currentColor;margin-right:4px;white-space:nowrap}.ebi-bd.baixo{color:var(--ebi-up)}.ebi-bd.medio{color:#9a5b00}.ebi-bd.alto{color:var(--ebi-dn)}@media(prefers-color-scheme:dark){.ebi-bd.medio{color:#fbbf24}}.ebi-bd.n{color:var(--ebi-tx2)}' +
    '.ebi-btn{width:100%;min-height:52px;border:0;border-radius:16px;background:var(--ebi-pri);color:#fff;font-weight:800;font-size:1.05em;cursor:pointer;margin-top:12px}@media(prefers-color-scheme:dark){.ebi-btn{color:#14142b}}.ebi-btn.sec{background:transparent;color:var(--ebi-pri);border:2px solid var(--ebi-pri)}.ebi-btn.red{background:var(--ebi-dn)}.ebi-btn[disabled]{opacity:.5}.ebi-back{border:0;background:none;color:var(--ebi-pri);font-weight:800;min-height:44px;font-size:1em;cursor:pointer;padding:0 4px}' +
    '.ebi-kv{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--ebi-bd)}.ebi-kv:last-child{border:0}.ebi-kv b{text-align:right;overflow-wrap:anywhere}' +
    '.ebi-msg{border-radius:14px;padding:12px;margin:10px 0;font-weight:600}.ebi-msg.e{background:rgba(192,38,27,.12);color:var(--ebi-dn)}.ebi-msg.o{background:rgba(11,122,59,.12);color:var(--ebi-up)}.ebi-msg.i{background:var(--ebi-chip);color:var(--ebi-tx)}' +
    '.ebi-aviso{margin:14px 2px;padding:10px 12px;border-radius:12px;background:var(--ebi-chip);color:var(--ebi-tx);font-size:.82em;font-weight:600}.ebi-chart{width:100%;height:auto;display:block}' +
    '.ebi-tab{width:100%;border-collapse:collapse;font-size:.92em}.ebi-tab th,.ebi-tab td{padding:7px 4px;border-bottom:1px solid var(--ebi-bd);text-align:right}.ebi-tab th:first-child,.ebi-tab td:first-child{text-align:left}.ebi-lic{background:var(--ebi-chip);border-radius:14px;padding:10px 12px;margin:8px 0;font-size:.9em}';
  document.head.appendChild(s);
}

/* ---------- selos ---------- */
function bdRisco(r) { return '<span class="ebi-bd ' + r + '">Risco ' + ({ baixo: 'baixo', medio: 'médio', alto: 'alto' }[r] || r) + '</span>'; }
function bdLiq(t) { return '<span class="ebi-bd n">' + esc(t) + '</span>'; }
var RISCO = { acao: 'alto', bdr: 'alto', fii: 'medio', fiagro: 'medio', etf: 'medio', cripto: 'alto', indice: 'medio' };
var RNUM = { baixo: 1, medio: 2, alto: 3 };
var LICAO = {
  rf: 'Na renda fixa você empresta dinheiro e recebe juros combinados. Risco menor, mas inflação e imposto mordem o ganho.',
  td: 'Tesouro Direto é emprestar ao governo. Se vender antes do vencimento o preço pode cair (marcação a mercado).',
  acao: 'Ação é um pedacinho de empresa: pode valorizar, pagar dividendos ou cair. Diversifique e pense no longo prazo.',
  fii: 'Fundo imobiliário rende aluguéis ou juros de imóveis e distribui rendimentos mensais, isentos de IR para a pessoa física.',
  fundos: 'Fundo junta o dinheiro de muita gente para um gestor investir. Veja taxa de administração, prazo de resgate e come-cotas.',
  etf: 'ETF é uma cesta de ativos que acompanha um índice e é negociada como ação. Barato e diversificado.',
  cripto: 'Cripto oscila muito (risco alto). Só invista o que pode perder; aqui é treino, o dinheiro é fictício.',
  idx: 'Índice mede o desempenho de uma cesta de ativos (Ibovespa, S&P 500). Não se compra direto: use um ETF que o acompanhe.',
  rfus: 'Títulos dos EUA pagam em dólar. Você ganha os juros, mas o real contra o dólar também mexe no resultado.',
  camb: 'Câmbio é o preço de uma moeda em reais. Compra e venda de moedas acontece na aba Câmbio.'
};
var CATS = {
  br: [['rf', 'Renda fixa'], ['td', 'Tesouro'], ['acao', 'Ações'], ['fii', 'FIIs e Fiagro'], ['fundos', 'Fundos'], ['etf', 'ETFs'], ['idx', 'Índices']],
  int: [['acao', 'Ações EUA'], ['etf', 'ETFs'], ['cripto', 'Cripto'], ['rfus', 'Renda fixa US$'], ['idx', 'Índices']]
};
var CATS_M = {
  br: [['idx', 'Índices'], ['acao', 'Ações'], ['fii', 'FIIs e Fiagro'], ['etf', 'ETFs'], ['camb', 'Câmbio']],
  int: [['idx', 'Índices'], ['acao', 'Ações EUA'], ['etf', 'ETFs'], ['cripto', 'Cripto'], ['camb', 'Câmbio']]
};
function tiposDe(cat) { return { acao: ['acao', 'bdr'], fii: ['fii', 'fiagro'], etf: ['etf'], cripto: ['cripto'], idx: ['indice'] }[cat] || []; }
function ret1m(a) { return a.sp && a.sp.length > 1 ? (a.sp[a.sp.length - 1] / a.sp[0] - 1) * 100 : null; }

/* ---------- raiz ---------- */
function render(container, ctx, opts) {
  CTX = ctx; EL = container; VIEW = (opts && opts.view) || 'invest'; css();
  if (VIEW === 'mercados') ST.cat = CATS_M[ST.mk][0][0]; else if (VIEW === 'invest' && !CATS[ST.mk].some(function (c) { return c[0] === ST.cat; })) ST.cat = CATS[ST.mk][0][0];
  ST.sel = null; ST.msg = null; ST.conf = false;
  draw();
}
function shell(html) { EL.innerHTML = '<div class="ebi">' + html + '<div class="ebi-aviso" role="note">Simulação educacional; não é recomendação de investimento. Preços e taxas reais, dinheiro fictício.</div></div>'; EL.querySelector('.ebi').addEventListener('click', onClick); var q = EL.querySelector('[data-q]'); if (q) q.addEventListener('input', function () { ST.q = q.value; drawLista(); }); }
function draw() {
  if (ST.sel) return drawDetalhe();
  if (VIEW === 'carteira') return drawCarteira();
  var cats = (VIEW === 'mercados' ? CATS_M : CATS)[ST.mk];
  shell(
    '<h2>' + (VIEW === 'mercados' ? 'Mercados' : 'Investir') + '</h2>' +
    '<div class="ebi-seg" role="tablist"><button data-a="mk" data-v="br" class="' + (ST.mk === 'br' ? 'on' : '') + '">🇧🇷 Brasil</button><button data-a="mk" data-v="int" class="' + (ST.mk === 'int' ? 'on' : '') + '">🌎 Internacional</button></div>' +
    '<div class="ebi-chips">' + cats.map(function (c) { return '<button data-a="cat" data-v="' + c[0] + '" class="' + (ST.cat === c[0] ? 'on' : '') + '">' + c[1] + '</button>'; }).join('') + '</div>' +
    '<div class="ebi-lic">💡 ' + esc(LICAO[ST.cat] || '') + '</div>' +
    '<div style="display:flex;gap:8px"><input data-q type="search" placeholder="Buscar por nome ou código" aria-label="Buscar" value="' + esc(ST.q) + '"><select data-ord aria-label="Ordenar por" style="max-width:48%"><option value="rent"' + (ST.ord === 'rent' ? ' selected' : '') + '>Rentabilidade</option><option value="risco"' + (ST.ord === 'risco' ? ' selected' : '') + '>Menor risco</option><option value="nome"' + (ST.ord === 'nome' ? ' selected' : '') + '>Nome</option></select></div>' +
    '<div id="ebi-lista"><div class="ebi-mut" style="padding:20px">Carregando…</div></div>');
  EL.querySelector('[data-ord]').addEventListener('change', function (e) { ST.ord = e.target.value; drawLista(); });
  drawLista();
}
function sortar(arr, kRent, kRisco, kNome) {
  var o = ST.ord;
  arr.sort(function (a, b) {
    if (o === 'nome') return String(kNome(a)).localeCompare(String(kNome(b)), 'pt-BR');
    if (o === 'risco') return (RNUM[kRisco(a)] || 9) - (RNUM[kRisco(b)] || 9) || (kRent(b) == null ? -1e9 : kRent(b)) - (kRent(a) == null ? -1e9 : kRent(a));
    return (kRent(b) == null ? -1e9 : kRent(b)) - (kRent(a) == null ? -1e9 : kRent(a));
  });
  return arr;
}
function casa(q, txt) { return !q || String(txt).toLowerCase().indexOf(q.toLowerCase()) >= 0; }
function erroLista(e) { var d = EL.querySelector('#ebi-lista'); if (d) d.innerHTML = '<div class="ebi-msg e">' + esc(e.message || e) + '</div>'; }
function drawLista() {
  var d = EL.querySelector('#ebi-lista'); if (!d) return;
  var cat = ST.cat, mk = ST.mk;
  if (cat === 'rf' || cat === 'rfus') {
    api('rfprodutos', {}, 120000).then(function (j) {
      var tx = j.taxas, l = j.prods.filter(function (p) { return (cat === 'rfus' ? p.grupo === 'int' : p.grupo === 'rf') && casa(ST.q, p.nome); });
      l.forEach(function (p) { var r = p.aa == null ? null : proj(p, 1000, 365, tx, j.spread_usd); p._r = r ? r.liq / 1000 * 100 - 100 : null; });
      sortar(l, function (p) { return p._r; }, function (p) { return p.risco; }, function (p) { return p.nome; });
      d.innerHTML = '<div class="ebi-mut" style="margin:0 2px 8px">Rendimento líquido estimado em 12 meses (já descontado IR/IOF). Fonte: ' + esc(tx.fonte) + (cat === 'rfus' ? '; ' + esc(j.usa.fonte) : '') + ', ' + fHora(j.ts) + '.</div>' + (l.length ? l.map(function (p) {
        return '<button class="ebi-row" data-a="rf" data-v="' + p.id + '"><div class="mi"><b>' + esc(p.nome) + '</b><small>' + bdRisco(p.risco) + bdLiq(p.liq) + '</small></div><div class="mr"><b>' + pc(p.aa) + ' a.a.</b><small>12m líquido: ' + sg(p._r) + '</small></div></button>';
      }).join('') : '<div class="ebi-mut">Nada encontrado.</div>');
    }).catch(erroLista);
  } else if (cat === 'td') {
    api('tdtitulos', {}, 300000).then(function (j) {
      var l = j.itens.filter(function (t) { return casa(ST.q, t.nome + ' ' + t.venc.slice(0, 4)); });
      l.forEach(function (t) { var r = projTd(t, 1000, j, diasAte(t.venc)); t._r = r.aa; });
      sortar(l, function (t) { return t._r; }, function (t) { return t.risco; }, function (t) { return t.nome + t.venc; });
      d.innerHTML = '<div class="ebi-mut" style="margin:0 2px 8px">Preços e taxas de ' + fData(j.base) + '. Fonte: ' + esc(j.fonte) + '.</div>' + l.map(function (t) {
        var tx = t.idx === 'ipca' ? 'IPCA + ' + pc(t.taxaC) : t.idx === 'pos' ? 'Selic + ' + pc(t.taxaC, 4) : pc(t.taxaC) + ' a.a.';
        return '<button class="ebi-row" data-a="td" data-v="' + t.id + '"><div class="mi"><b>' + esc(t.nome) + '</b><small>vence ' + fData(t.venc) + ' · mín. R$ 30,00<br>' + bdRisco(t.risco) + bdLiq('D+1') + '</small></div><div class="mr"><b>' + tx + '</b><small>PU ' + fR(Math.round(t.puC * 100)) + '</small></div></button>';
      }).join('');
    }).catch(erroLista);
  } else if (cat === 'fundos') {
    api('fundos', {}, 300000).then(function (j) {
      var l = j.itens.filter(function (f) { return casa(ST.q, f.nome + ' ' + f.cat); });
      sortar(l, function (f) { return f.r12m != null ? f.r12m : f.r6m != null ? f.r6m : f.r1m; }, function (f) { return f.risco; }, function (f) { return f.nome; });
      d.innerHTML = '<div class="ebi-mut" style="margin:0 2px 8px">Cotas até ' + (j.dt ? fData(j.dt) : 'sem dados ainda') + '. Fonte: ' + esc(j.fonte) + '.</div>' + (l.map(function (f) {
        return '<button class="ebi-row" data-a="fnd" data-v="' + f.id + '"><div class="mi"><b>' + esc(f.nome) + '</b><small>' + esc(f.cat) + ' · ' + bdRisco(f.risco) + bdLiq('Resgate ' + f.resg) + '</small></div><div class="mr"><b class="' + (f.r12m == null ? '' : f.r12m >= 0 ? 'ebi-up' : 'ebi-dn') + '">' + (f.r12m != null ? sg(f.r12m) + ' 12m' : f.r1m != null ? sg(f.r1m) + ' 1m' : 'sem dados') + '</b><small>' + (f.r6m != null ? '6m ' + sg(f.r6m) : '') + '</small></div></button>';
      }).join('') || '<div class="ebi-mut">Nada encontrado.</div>');
    }).catch(erroLista);
  } else if (cat === 'camb') {
    api('taxas', {}, 60000).then(function (j) {
      var nomes = { USD: 'Dólar', EUR: 'Euro', GBP: 'Libra', JPY: 'Iene', ARS: 'Peso argentino', CNY: 'Yuan' };
      d.innerHTML = '<div class="ebi-mut" style="margin:0 2px 8px">Fonte: ' + esc(j.fonte) + ', ' + fHora(j.ts) + '. Compra e venda na aba Câmbio.</div>' + Object.keys(nomes).map(function (m) { var t = j.taxas[m]; return t && t.t ? '<div class="ebi-row" style="cursor:default"><div class="mi"><b>' + m + '</b><small>' + nomes[m] + '</small></div><div class="mr"><b>R$ ' + nf(t.t, t.t < 1 ? 4 : 2) + '</b></div></div>' : ''; }).join('');
    }).catch(erroLista);
  } else {
    api('ativos', {}, 60000).then(function (j) {
      var tp = tiposDe(cat), l = j.itens.filter(function (a) { return a.mercado === mk && tp.indexOf(a.tipo) >= 0 && casa(ST.q, a.cod + ' ' + a.nome); });
      sortar(l, ret1m, function (a) { return RISCO[a.tipo] || 'medio'; }, function (a) { return a.cod; });
      var aberto = l.some(function (a) { return a.aberto; });
      d.innerHTML = '<div class="ebi-mut" style="margin:0 2px 8px">' + (aberto ? 'Pregão aberto.' : 'Pregão fechado: vale o último preço.') + ' Fonte: ' + esc(j.fonte) + ', ' + fHora(j.ts) + '. Cotação pode ter atraso.</div>' + (l.map(function (a) {
        var v = a.var;
        return '<button class="ebi-row" data-a="ativo" data-v="' + a.cod + '"><div class="mi"><b>' + esc(a.cod) + '</b><small>' + esc(a.nome) + '</small><small>' + (a.comp ? bdRisco(RISCO[a.tipo] || 'medio') + bdLiq(a.tipo === 'cripto' ? 'Liquidez 24h' : 'D+2') : bdLiq('Só referência')) + (a.fonte === 'anterior' ? bdLiq('cotação anterior') : '') + '</small></div>' + spark(a.sp) + '<div class="mr"><b>' + fP(a.preco, a.moeda) + '</b><small class="' + (v == null ? '' : v >= 0 ? 'ebi-up' : 'ebi-dn') + '">' + (v == null ? '—' : (v >= 0 ? '▲ ' : '▼ ') + pc(Math.abs(v))) + ' dia</small></div></button>';
      }).join('') || '<div class="ebi-mut">Nada encontrado.</div>');
    }).catch(erroLista);
  }
}

/* ---------- eventos ---------- */
function onClick(e) {
  var b = e.target.closest('[data-a]'); if (!b || !EL.contains(b)) return;
  var a = b.getAttribute('data-a'), v = b.getAttribute('data-v');
  if (a === 'mk') { ST.mk = v; ST.cat = (VIEW === 'mercados' ? CATS_M : CATS)[v][0][0]; ST.q = ''; draw(); }
  else if (a === 'cat') { ST.cat = v; ST.q = ''; draw(); }
  else if (a === 'ativo' || a === 'rf' || a === 'td' || a === 'fnd') { ST.sel = a; ST.selK = v; ST.msg = null; ST.conf = false; ST.per = '1m'; draw(); }
  else if (a === 'voltar') { if (ST.sel) { ST.sel = null; draw(); } else if (CTX.voltar) CTX.voltar(); }
  else if (a === 'per') { ST.per = v; drawDetalhe(); }
  else if (a === 'irCart') { VIEW = 'carteira'; ST.sel = null; draw(); }
  else if (a === 'comprar' || a === 'vender' || a === 'aplicar') agir(a);
  else if (a === 'resgatar') resgatar(v);
  else if (a === 'recarregar') { C = {}; draw(); }
}
function voltarBtn() { return '<button class="ebi-back" data-a="voltar">← Voltar</button>'; }
function msgBox() { return ST.msg ? '<div class="ebi-msg ' + ST.msg[0] + '" role="status">' + ST.msg[1] + '</div>' : ''; }

/* ---------- detalhe ---------- */
function drawDetalhe() {
  var k = ST.sel;
  if (k === 'ativo') return detAtivo();
  if (k === 'rf') return detRf();
  if (k === 'td') return detTd();
  if (k === 'fnd') return detFundo();
}
function detAtivo() {
  var cod = ST.selK;
  shell(voltarBtn() + '<div id="ebi-det"><div class="ebi-mut" style="padding:20px">Carregando…</div></div>');
  Promise.all([api('ativos', {}, 60000), api('historico', { cod: cod, p: ST.per }, 300000).catch(function () { return null; }), api('rfprodutos', {}, 120000).catch(function () { return null; }), api("invcarteira", {}).catch(function () { return null; })]).then(function (r) {
    var a = r[0].itens.filter(function (x) { return x.cod === cod; })[0], h = r[1], rp = r[2], ct = r[3]; if (!a) throw new Error('Ativo não encontrado.');
    var pos = ct && ct.pos.filter(function (p) { return p.cod === cod; })[0], fx = 1, sp = 0;
    if (a.moeda === 'USD') { fx = rp && rp.usd; sp = rp ? rp.spread_usd : 0; }
    var per = ['1m', '6m', '1a', '5a'];
    var html = '<h2>' + esc(a.cod) + ' <small class="ebi-mut">' + esc(a.nome) + '</small></h2><div class="ebi-card"><div style="font-size:1.7em;font-weight:800">' + fP(a.preco, a.moeda) + '</div><div class="' + (a.var == null ? '' : a.var >= 0 ? 'ebi-up' : 'ebi-dn') + '">' + (a.var == null ? '' : (a.var >= 0 ? '▲ ' : '▼ ') + pc(Math.abs(a.var)) + ' no dia') + '</div>' +
      '<div class="ebi-mut">Fonte: ' + esc(a.fonte) + ' · cotação de ' + fHora(a.ts) + ' · ' + (a.aberto ? 'mercado aberto' : 'mercado fechado (último preço)') + (a.fonte === 'anterior' ? ' · fonte fora do ar, mostrando a última cotação salva' : '') + '</div>' +
      '<div class="ebi-seg" style="margin-top:10px">' + per.map(function (p) { return '<button data-a="per" data-v="' + p + '" class="' + (ST.per === p ? 'on' : '') + '">' + p.toUpperCase().replace('A', 'A') + '</button>'; }).join('') + '</div>' + (h ? candles(h.pts, a.moeda) + '<div class="ebi-mut">Velas: verde = subiu, vermelho = caiu no período (▲ sobe / ▼ desce).</div>' : '<div class="ebi-mut">Histórico indisponível agora.</div>') + '</div>';
    if (pos) html += '<div class="ebi-card"><h3 style="margin-top:0">Sua posição</h3><div class="ebi-kv"><span>Quantidade</span><b>' + pos.qtd + '</b></div><div class="ebi-kv"><span>Preço médio</span><b>' + fP(pos.pm, pos.moeda) + '</b></div><div class="ebi-kv"><span>Valor atual</span><b>' + (pos.valor == null ? '—' : fR(pos.valor)) + '</b></div><div class="ebi-kv"><span>Resultado</span><b class="' + (pos.res >= 0 ? 'ebi-up' : 'ebi-dn') + '">' + (pos.res == null ? '—' : fR(pos.res) + ' (' + sg(pos.res_pct) + ')') + '</b></div></div>';
    if (a.comp) {
      html += '<div class="ebi-card"><h3 style="margin-top:0">Negociar</h3>' + bdRisco(RISCO[a.tipo] || 'medio') + bdLiq(a.tipo === 'cripto' ? 'Liquidez 24h' : 'Liquidação D+2') +
        '<label for="ebi-qtd">Quantidade (inteiro, mínimo 1)</label><input id="ebi-qtd" type="number" inputmode="numeric" min="1" step="1" value="1"><div id="ebi-est" class="ebi-mut" style="margin-top:6px"></div>' +
        (a.moeda === 'USD' ? '<div class="ebi-mut">Ativo em dólar: compra convertida em R$ com spread de ' + pc(sp * 100, 1) + '. (IOF de câmbio ~3,5% é só informativo, não cobrado.)</div>' : '') + msgBox() +
        '<button class="ebi-btn" data-a="comprar" id="ebi-bc">' + (ST.conf === 'comprar' ? 'Confirmar compra' : 'Comprar') + '</button>' + (pos ? '<button class="ebi-btn sec" data-a="vender" id="ebi-bv">' + (ST.conf === 'vender' ? 'Confirmar venda' : 'Vender') + '</button>' : '') + '</div>';
    } else {
      var alt = a.mercado === 'br' ? 'BOVA11 ou IVVB11' : 'SPY, VOO ou QQQ';
      html += '<div class="ebi-msg i">Índice é só referência: não dá para comprar direto. Para investir nele, use um ETF que o acompanhe (' + alt + ').</div>';
    }
    EL.querySelector('#ebi-det').innerHTML = html;
    var q = EL.querySelector('#ebi-qtd'), est = EL.querySelector('#ebi-est');
    var upd = function () { var n = Math.floor(Number(q.value)); ST.qtd = n; if (!(n >= 1) || !fx) { est.textContent = fx ? '' : 'Dólar indisponível.'; return; } var c = Math.ceil(n * a.preco * fx * 100 * (1 + sp)), v = Math.floor(n * a.preco * fx * 100 * (1 - sp)); est.innerHTML = 'Custo estimado: <b>' + fR(c) + '</b> · venda estimada: <b>' + fR(v) + '</b>'; ST.conf = false; var bc = EL.querySelector('#ebi-bc'), bv = EL.querySelector('#ebi-bv'); if (bc) bc.textContent = 'Comprar'; if (bv) bv.textContent = 'Vender'; };
    if (q) { q.addEventListener('input', upd); ST.qtd = 1; upd(); }
    ST.cur = { a: a, fx: fx, sp: sp, pos: pos };
  }).catch(function (e) { var d = EL.querySelector('#ebi-det'); if (d) d.innerHTML = '<div class="ebi-msg e">' + esc(e.message) + '</div>'; });
}
function detRf() {
  shell(voltarBtn() + '<div id="ebi-det"><div class="ebi-mut" style="padding:20px">Carregando…</div></div>');
  api('rfprodutos', {}, 120000).then(function (j) {
    var p = j.prods.filter(function (x) { return x.id === ST.selK; })[0]; if (!p) throw new Error('Produto não encontrado.');
    var tx = j.taxas, poup = j.prods.filter(function (x) { return x.id === 'poup'; })[0], cdb = j.prods.filter(function (x) { return x.id === 'cdb100'; })[0];
    var html = '<h2>' + esc(p.nome) + '</h2><div class="ebi-card">' + bdRisco(p.risco) + bdLiq(p.liq) + '<p>' + esc(p.desc) + '</p>' +
      '<div class="ebi-kv"><span>Taxa estimada hoje</span><b>' + pc(p.aa) + ' a.a.</b></div><div class="ebi-kv"><span>Imposto</span><b>' + ({ isento: 'Isento de IR', reg: 'IR regressivo 22,5% → 15% + IOF até 30 dias', prev: 'Tabela previdência 35% → 10%', g15: 'IR 15% sobre o ganho' }[p.ir]) + '</b></div><div class="ebi-kv"><span>Carência</span><b>' + (p.car ? p.car + ' dias' : 'sem carência') + '</b></div>' +
      '<div class="ebi-mut">Fontes: ' + esc(tx.fonte) + (p.moeda === 'USD' ? '; ' + esc(j.usa.fonte) + ' (taxa de ' + esc(p.id === 'usd3m' ? j.usa.d3m : j.usa.d10) + ')' : '') + ' · CDI de ' + fData(tx.cdi_data) + ' · lido em ' + fHora(tx.ts) + '</div></div>' +
      '<div class="ebi-card"><h3 style="margin-top:0">Quanto rende</h3><label for="ebi-v">Valor a aplicar (R$)</label><input id="ebi-v" type="number" inputmode="decimal" min="1" step="0.01" value="1000"><div id="ebi-tab"></div><div class="ebi-mut" id="ebi-cmp"></div>' + msgBox() + '<button class="ebi-btn" data-a="aplicar">' + (ST.conf === 'aplicar' ? 'Confirmar aplicação' : 'Aplicar') + '</button></div>';
    EL.querySelector('#ebi-det').innerHTML = html;
    var inp = EL.querySelector('#ebi-v'), tab = EL.querySelector('#ebi-tab'), cmp = EL.querySelector('#ebi-cmp');
    var upd = function () {
      var v = Number(inp.value) || 0; ST.v = Math.round(v * 100); ST.conf = false; if (v < 1) { tab.innerHTML = '<div class="ebi-mut">Mínimo R$ 1,00.</div>'; return; }
      var rows = [30, 180, 365].map(function (d) { var r = p.aa == null ? null : proj(p, v, d, tx, j.spread_usd); return r ? '<tr><td>' + (d === 30 ? '1 mês' : d === 180 ? '6 meses' : '12 meses') + (p.car > d ? ' *' : '') + '</td><td>' + fR(Math.round(r.rend * 100)) + '</td><td>' + fR(Math.round((r.ir + r.iof) * 100)) + '</td><td><b>' + fR(Math.round(r.liq * 100)) + '</b></td></tr>' : ''; }).join('');
      tab.innerHTML = '<table class="ebi-tab"><tr><th>Prazo</th><th>Rende</th><th>IR+IOF</th><th>Líquido</th></tr>' + rows + '</table>' + (p.car ? '<div class="ebi-mut">* antes da carência não dá para resgatar.</div>' : '');
      var rp = proj(p, v, 365, tx, j.spread_usd), r1 = proj(poup, v, 365, tx, 0), r2 = proj(cdb, v, 365, tx, 0), inf = tx.ipca_12m;
      cmp.innerHTML = p.aa == null ? '' : 'Em 12 meses: este produto líquido ' + fR(Math.round(rp.liq * 100)) + ' · poupança ' + fR(Math.round(r1.liq * 100)) + ' · CDB 100% do CDI ' + fR(Math.round(r2.liq * 100)) + ' · para só acompanhar a inflação (IPCA 12m ' + pc(inf) + ') você precisaria de ' + fR(Math.round(v * (1 + inf / 100) * 100)) + '.';
    };
    inp.addEventListener('input', upd); upd(); ST.cur = { p: p };
  }).catch(function (e) { var d = EL.querySelector('#ebi-det'); if (d) d.innerHTML = '<div class="ebi-msg e">' + esc(e.message) + '</div>'; });
}
function detTd() {
  shell(voltarBtn() + '<div id="ebi-det"><div class="ebi-mut" style="padding:20px">Carregando…</div></div>');
  api('tdtitulos', {}, 300000).then(function (j) {
    var t = j.itens.filter(function (x) { return x.id === ST.selK; })[0]; if (!t) throw new Error('Título não encontrado.');
    var dias = diasAte(t.venc), idxTxt = t.idx === 'ipca' ? 'IPCA + ' + pc(t.taxaC) + ' a.a.' : t.idx === 'pos' ? 'Selic + ' + pc(t.taxaC, 4) + ' a.a.' : pc(t.taxaC) + ' a.a.';
    var html = '<h2>' + esc(t.nome) + ' ' + t.venc.slice(0, 4) + '</h2><div class="ebi-card">' + bdRisco(t.risco) + bdLiq('Liquidez D+1') +
      '<div class="ebi-kv"><span>Rentabilidade (compra)</span><b>' + idxTxt + '</b></div><div class="ebi-kv"><span>Taxa de venda hoje</span><b>' + pc(t.taxaV, t.idx === 'pos' ? 4 : 2) + '</b></div><div class="ebi-kv"><span>Preço unitário (compra)</span><b>' + fR(Math.round(t.puC * 100)) + '</b></div><div class="ebi-kv"><span>Preço unitário (venda)</span><b>' + fR(Math.round(t.puV * 100)) + '</b></div><div class="ebi-kv"><span>Vencimento</span><b>' + fData(t.venc) + ' (' + dias + ' dias)</b></div><div class="ebi-kv"><span>Investimento mínimo</span><b>R$ 30,00</b></div><div class="ebi-kv"><span>Custódia B3</span><b>0,20% a.a.' + (t.slug === 'selic' ? ' (isenta até R$ 10 mil)' : '') + '</b></div><div class="ebi-kv"><span>Imposto</span><b>IR regressivo (22,5% a 15%) + IOF até 30 dias</b></div>' +
      '<div class="ebi-mut">Fonte: ' + esc(j.fonte) + ', preços de ' + fData(j.base) + '.</div>' +
      (t.cupom ? '<div class="ebi-msg i">Este título paga juros (cupons) a cada semestre. Aqui o cupom não é simulado: o resultado mostra só a variação do preço (marcação a mercado) e a simulação até o vencimento considera o cupom reinvestido.</div>' : '') +
      '<div class="ebi-msg i">Marcação a mercado: se você vender antes do vencimento, recebe o preço de venda do dia, que pode ser menor que o que pagou. Venda hoje a partir do preço de compra: ' + sg((t.puV / t.puC - 1) * 100) + '.</div></div>' +
      '<div class="ebi-card"><h3 style="margin-top:0">Quanto rende até o vencimento</h3><label for="ebi-v">Valor a investir (R$)</label><input id="ebi-v" type="number" inputmode="decimal" min="30" step="0.01" value="1000"><div id="ebi-tab"></div><div class="ebi-mut" id="ebi-cmp"></div>' + msgBox() + '<button class="ebi-btn" data-a="aplicar">' + (ST.conf === 'aplicar' ? 'Confirmar compra' : 'Comprar') + '</button></div>';
    EL.querySelector('#ebi-det').innerHTML = html;
    var inp = EL.querySelector('#ebi-v'), tab = EL.querySelector('#ebi-tab'), cmp = EL.querySelector('#ebi-cmp');
    api('rfprodutos', {}, 120000).then(function (rp) {
      var tx = rp.taxas; for (var k in tx) j[k] = j[k] == null ? tx[k] : j[k];
      var poup = rp.prods.filter(function (x) { return x.id === 'poup'; })[0], cdb = rp.prods.filter(function (x) { return x.id === 'cdb100'; })[0];
      var upd = function () {
        var v = Number(inp.value) || 0; ST.v = Math.round(v * 100); ST.conf = false; if (v < 30) { tab.innerHTML = '<div class="ebi-mut">Mínimo R$ 30,00.</div>'; return; }
        var r = projTd(t, v, j, dias), p1 = proj(poup, v, dias, tx, 0), p2 = proj(cdb, v, dias, tx, 0);
        tab.innerHTML = '<table class="ebi-tab"><tr><th>Até o vencimento</th><th>Valor</th></tr><tr><td>Valor bruto</td><td>' + fR(Math.round(r.bruto * 100)) + '</td></tr><tr><td>Custódia</td><td>' + fR(Math.round(r.cust * 100)) + '</td></tr><tr><td>IR (' + pc(r.aliq * 100, 1) + ')</td><td>' + fR(Math.round(r.ir * 100)) + '</td></tr><tr><td><b>Líquido</b></td><td><b>' + fR(Math.round(r.liq * 100)) + '</b></td></tr></table>';
        cmp.innerHTML = 'No mesmo prazo: poupança ' + fR(Math.round(p1.liq * 100)) + ' · CDB 100% do CDI ' + fR(Math.round(p2.liq * 100)) + ' · este título ' + fR(Math.round(r.liq * 100)) + ' (≈ ' + pc(r.aa) + ' a.a. líquido). Estimativa: considera Selic/IPCA de hoje constantes.';
      };
      inp.addEventListener('input', upd); upd();
    }).catch(function () { cmp.textContent = 'Comparação indisponível agora.'; });
    ST.cur = { t: t };
  }).catch(function (e) { var d = EL.querySelector('#ebi-det'); if (d) d.innerHTML = '<div class="ebi-msg e">' + esc(e.message) + '</div>'; });
}
function detFundo() {
  shell(voltarBtn() + '<div id="ebi-det"><div class="ebi-mut" style="padding:20px">Carregando…</div></div>');
  api('fundos', {}, 300000).then(function (j) {
    var f = j.itens.filter(function (x) { return x.id === ST.selK; })[0]; if (!f) throw new Error('Fundo não encontrado.');
    var ir = { cp: 'Curto prazo: 22,5% até 180 dias, 20% depois (come-cotas em maio e novembro)', lp: 'Longo prazo: 22,5% a 15% regressivo (come-cotas de 15% em maio e novembro)', acoes: '15% sobre o lucro, só no resgate (sem come-cotas)' }[f.ir];
    var html = '<h2>' + esc(f.nome) + '</h2><div class="ebi-card">' + bdRisco(f.risco) + bdLiq('Resgate ' + f.resg) + '<p>' + esc(f.desc) + '</p>' +
      '<div class="ebi-kv"><span>Rentabilidade 1 mês</span><b>' + sg(f.r1m) + '</b></div><div class="ebi-kv"><span>6 meses</span><b>' + sg(f.r6m) + '</b></div><div class="ebi-kv"><span>12 meses</span><b>' + sg(f.r12m) + '</b></div><div class="ebi-kv"><span>Última cota</span><b>' + (f.cota ? nf(f.cota, 6) + ' (' + fData(f.dt) + ')' : 'ainda sem dados') + '</b></div><div class="ebi-kv"><span>Taxa de administração</span><b>' + esc(f.adm) + '</b></div><div class="ebi-kv"><span>Aplicação mínima</span><b>R$ 1,00 (aqui)</b></div><div class="ebi-kv"><span>Imposto</span><b>' + esc(ir) + ' + IOF até 30 dias</b></div>' +
      '<div class="ebi-mut">Fonte: ' + esc(j.fonte) + '. ' + esc(j.nota) + (f.r12m == null ? ' Rentabilidades aparecem à medida que o histórico é carregado.' : '') + '</div>' + (f.sp && f.sp.length > 1 ? '<div style="margin-top:8px">' + spark(f.sp, 300, 50) + '<div class="ebi-mut">Cota nos últimos dias</div></div>' : '') + '</div>' +
      '<div class="ebi-card"><label for="ebi-v">Valor a aplicar (R$)</label><input id="ebi-v" type="number" inputmode="decimal" min="1" step="0.01" value="100">' + msgBox() + '<button class="ebi-btn" data-a="aplicar"' + (f.cota ? '' : ' disabled') + '>' + (ST.conf === 'aplicar' ? 'Confirmar aplicação' : 'Aplicar') + '</button></div>';
    EL.querySelector('#ebi-det').innerHTML = html;
    var inp = EL.querySelector('#ebi-v'); var upd = function () { ST.v = Math.round((Number(inp.value) || 0) * 100); ST.conf = false; }; inp.addEventListener('input', upd); upd();
  }).catch(function (e) { var d = EL.querySelector('#ebi-det'); if (d) d.innerHTML = '<div class="ebi-msg e">' + esc(e.message) + '</div>'; });
}

/* ---------- ações (compra, venda, aplicação, resgate) ---------- */
function setMsg(t, m) { ST.msg = [t, m]; ST.busy = false; drawDetalhe(); }
// débito idempotente: grava pendência, chama servidor, debita ao confirmar
function debitar(acao, extra, custoEst, id) {
  var sigDe = extra.__sig;
  var P = lsGet(pk(), {});
  return cash().then(function (c) {
    if (custoEst != null && c < custoEst) throw new Error('Saldo insuficiente: você tem ' + fR(c) + ' e precisa de ' + fR(custoEst) + '.');
    P[id] = { t: Date.now(), a: acao }; lsSet(pk(), P);
    extra.cash = c; extra.id = id; delete extra.__sig;
    return api(acao, extra);
  }).then(function (j) {
    var P2 = lsGet(pk(), {}), p = P2[id]; delete P2[id]; lsSet(pk(), P2);
    if (!j.dup || p) return addCash(-j.custo).then(function () { return j; });   // dup com pendência = servidor gravou mas o débito ficou faltando
    return j;
  }).catch(function (e) { if (e.j && e.j.ok === 0) { var P3 = lsGet(pk(), {}); delete P3[id]; lsSet(pk(), P3); delete IDS[sigDe]; } throw e; });
}
function agir(a) {
  if (ST.busy) return;
  var k = ST.sel, key = a;
  if (ST.conf !== key) { ST.conf = key; if (k === 'ativo') { var b = EL.querySelector(a === 'comprar' ? '#ebi-bc' : '#ebi-bv'); if (b) b.textContent = a === 'comprar' ? 'Confirmar compra' : 'Confirmar venda'; } else { var bb = EL.querySelector('[data-a="aplicar"]'); if (bb) bb.textContent = k === 'td' ? 'Confirmar compra' : 'Confirmar aplicação'; } return; }
  ST.busy = true; ST.conf = false;
  if (k === 'ativo') {
    var cu = ST.cur, qtd = Math.floor(ST.qtd);
    if (!(qtd >= 1)) return setMsg('e', 'Informe uma quantidade válida (inteiro, mínimo 1).');
    if (a === 'comprar') {
      var sig = 'c' + cu.a.cod + qtd, est = Math.ceil(qtd * cu.a.preco * (cu.fx || 1) * 100 * (1 + cu.sp));
      debitar('invcomprar', { cod: cu.a.cod, qtd: qtd, __sig: sig }, est, idPara(sig)).then(function (j) { delete IDS[sig]; ST.sel = null; VIEW = VIEW; setMsgAposTroca('Compra feita: ' + qtd + ' ' + cu.a.cod + ' por ' + fR(j.custo) + ' (preço ' + fP(j.preco, cu.a.moeda) + ').'); }).catch(function (e) { setMsg('e', esc(e.message)); });
    } else {
      var sig2 = 'v' + cu.a.cod + qtd;
      api('invvender', { cod: cu.a.cod, qtd: qtd, id: idPara(sig2) }).then(function (j) { delete IDS[sig2]; if (CTX.receber) try { CTX.receber(); } catch (e) { } setMsgAposTroca('Venda feita: recebe ' + fR(j.recebe) + ' (resultado ' + fR(j.lucro) + '). O valor entra no seu saldo em instantes. ' + esc(j.ir_info || '')); }).catch(function (e) { setMsg('e', esc(e.message)); });
    }
  } else {
    var prod = k === 'rf' ? ST.selK : k === 'td' ? 'td_' + ST.selK : ST.selK, v = ST.v || 0;
    if (v < (k === 'td' ? 3000 : 100)) return setMsg('e', k === 'td' ? 'Mínimo R$ 30,00 no Tesouro Direto.' : 'Mínimo R$ 1,00.');
    var sig3 = 'a' + prod + v;
    debitar('rfaplicar', { prod: prod, v: v, __sig: sig3 }, v, idPara(sig3)).then(function (j) { delete IDS[sig3]; setMsgAposTroca('Aplicação feita: ' + fR(j.custo) + ' em ' + esc(prod.indexOf('td_') === 0 ? 'Tesouro Direto' : prod.indexOf('f_') === 0 ? 'fundo' : (ST.cur && ST.cur.p ? ST.cur.p.nome : prod)) + '. Acompanhe na Carteira.'); }).catch(function (e) { setMsg('e', esc(e.message)); });
  }
}
function setMsgAposTroca(txt) { ST.busy = false; C = {}; ST.sel = null; VIEW = 'carteira'; ST.msg = ['o', txt]; draw(); }
function resgatar(id) {
  if (ST.busy) return; if (ST.conf !== 'r' + id) { ST.conf = 'r' + id; var bb = EL.querySelector('[data-v="' + id + '"]'); if (bb) bb.textContent = 'Confirmar resgate'; return; }
  ST.busy = true; ST.conf = false;
  api('rfresgatar', { id: id }).then(function (j) {
    ST.busy = false; if (CTX.receber) try { CTX.receber(); } catch (e) { }
    C = {}; ST.msg = ['o', 'Resgatado: bruto ' + fR(j.bruto) + ', IR ' + fR(j.ir) + ', IOF ' + fR(j.iof) + (j.custodia ? ', custódia ' + fR(j.custodia) : '') + ' → <b>líquido ' + fR(j.liquido) + '</b>. O valor entra no seu saldo em instantes.']; draw();
  }).catch(function (e) { ST.busy = false; ST.msg = ['e', esc(e.message)]; draw(); });
}

/* ---------- carteira ---------- */
function drawCarteira() {
  shell('<h2>Carteira</h2><div id="ebi-cart"><div class="ebi-mut" style="padding:20px">Carregando…</div></div>');
  Promise.all([api('invcarteira', {}), cash()]).then(function (r) {
    var j = r[0], cx = r[1], pt = j.patrimonio, tot = pt.total + cx;
    var fat = [{ n: 'Dinheiro (R$)', v: cx, c: '#64748b' }, { n: 'Renda fixa, Tesouro e fundos', v: pt.rf, c: '#0f766e' }, { n: 'Ações, FIIs, ETFs, cripto', v: pt.acoes, c: '#7c3aed' }, { n: 'Moedas estrangeiras', v: pt.moedas, c: '#d97706' }];
    var html = msgBox() + '<div class="ebi-card"><div class="ebi-mut">Patrimônio total</div><div style="font-size:1.8em;font-weight:800">' + fR(tot) + '</div><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' + rosca(fat) + '<div style="flex:1;min-width:160px">' + fat.map(function (x) { return '<div class="ebi-kv"><span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + x.c + ';margin-right:6px"></span>' + x.n + '</span><b>' + fR(x.v) + (tot ? ' · ' + pc(x.v / tot * 100, 0) : '') + '</b></div>'; }).join('') + '</div></div></div>';
    html += '<h3>Ações, FIIs, ETFs e cripto</h3>' + (j.pos.length ? j.pos.map(function (p) { return '<button class="ebi-row" data-a="ativo" data-v="' + esc(p.cod) + '"><div class="mi"><b>' + esc(p.cod) + '</b><small>' + p.qtd + ' un. · PM ' + fP(p.pm, p.moeda) + '</small></div><div class="mr"><b>' + (p.valor == null ? '—' : fR(p.valor)) + '</b><small class="' + (p.res >= 0 ? 'ebi-up' : 'ebi-dn') + '">' + (p.res == null ? '—' : (p.res >= 0 ? '▲ ' : '▼ ') + fR(Math.abs(p.res)) + ' (' + sg(p.res_pct) + ')') + '</small></div></button>'; }).join('') : '<div class="ebi-mut">Você ainda não tem ações. Veja Investir → Ações.</div>');
    var at = j.rf.filter(function (x) { return x.status === 'ativa'; }), fe = j.rf.filter(function (x) { return x.status !== 'ativa'; });
    html += '<h3>Renda fixa, Tesouro e fundos</h3>' + (at.length ? at.map(function (x) {
      return '<div class="ebi-card"><b>' + esc(x.nome) + '</b><div class="ebi-mut">Aplicado em ' + fHora(x.ts) + ' · ' + (x.dias || 0) + ' dia(s)</div>' + (x.erro ? '<div class="ebi-msg e">' + esc(x.erro) + '</div>' : '<div class="ebi-kv"><span>Aplicado</span><b>' + fR(x.valor) + '</b></div><div class="ebi-kv"><span>Valor bruto</span><b>' + fR(x.bruto) + '</b></div><div class="ebi-kv"><span>IR / IOF' + (x.cust ? ' / custódia' : '') + '</span><b>' + fR(x.ir) + ' / ' + fR(x.iof) + (x.cust ? ' / ' + fR(x.cust) : '') + '</b></div><div class="ebi-kv"><span>Líquido se resgatar hoje</span><b class="' + (x.liq >= x.valor ? 'ebi-up' : 'ebi-dn') + '">' + fR(x.liq) + ' (' + sg((x.liq / x.valor - 1) * 100) + ')</b></div>' + (x.car > x.dias ? '<div class="ebi-mut">Resgate liberado em ' + (x.car - x.dias) + ' dia(s).</div>' : '') + '<button class="ebi-btn sec" data-a="resgatar" data-v="' + esc(x.id) + '"' + (x.car > x.dias ? ' disabled' : '') + '>Resgatar tudo</button>') + '</div>';
    }).join('') : '<div class="ebi-mut">Nenhuma aplicação ativa.</div>');
    if (fe.length) html += '<h3>Resgatadas</h3>' + fe.slice(-8).reverse().map(function (x) { return '<div class="ebi-kv"><span>' + esc(x.nome) + '</span><b>' + fR(x.valor) + ' → ' + fR(x.liq || 0) + '</b></div>'; }).join('');
    html += '<div class="ebi-card" style="margin-top:12px"><div class="ebi-kv"><span>Proventos recebidos (dividendos e rendimentos)</span><b>' + fR(j.prov_total) + '</b></div>' + (j.prov_novos ? '<div class="ebi-msg o">Novos proventos: ' + fR(j.prov_novos) + ' (caem no saldo em instantes).</div>' : '') + '</div><button class="ebi-btn sec" data-a="recarregar">Atualizar</button>';
    if (j.prov_novos && CTX.receber) try { CTX.receber(); } catch (e) { }
    EL.querySelector('#ebi-cart').innerHTML = html; ST.msg = null;
  }).catch(function (e) { var d = EL.querySelector('#ebi-cart'); if (d) d.innerHTML = '<div class="ebi-msg e">' + esc(e.message) + '</div>'; });
}

var INV = { id: 'investir', nome: 'Investir', icone: icone, render: function (c, x) { render(c, x, { view: 'invest' }); } };
INV.mercados = { id: 'mercados', nome: 'Mercados', icone: icMercado, render: function (c, x) { render(c, x, { view: 'mercados' }); } };
INV.carteira = { id: 'carteira', nome: 'Carteira', icone: icCarteira, render: function (c, x) { render(c, x, { view: 'carteira' }); } };
INV._t = { irAliq: irAliq, iofAliq: iofAliq, liquido: liquido, proj: proj, projTd: projTd, candles: candles, rosca: rosca, spark: spark };
window.EDUBANK_INV = INV;
})();
