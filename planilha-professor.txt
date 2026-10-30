/**
 * Planilha do professor — recebe os resultados dos jogos e organiza sozinha, ao vivo.
 *
 * COMO INSTALAR (uma vez só):
 * 1. Planilha Google > Extensões > Apps Script. Cole TODO este arquivo e salve.
 * 2. Implantar > Gerenciar implantações > lápis > Nova versão > Implantar (o endereço /exec continua o mesmo).
 *
 * O que a planilha faz:
 *  - Uma aba por TURMA (ex.: "8º A") = o PAINEL que os alunos veem: data, hora, pontos, % de acerto, nota, gasto, dinheiro final.
 *  - Aba "Todos" (só professor): uma linha por jogo, com TUDO (peso, senhas dos apps, detalhe dos gastos, ID).
 *  - Aba "Resumo": média ponderada de cada aluno.
 *  - Só Schuster e Clarito (aba Config) salvam direto; as demais escolas ficam em "Retidos (outros)" até o professor liberar.
 *  - Nota (= % de acerto / 10): 10 azul · 8 a 9,9 verde · 6 a 7,9 amarelo · abaixo de 6 vermelho.
 *  - Data e hora (horário de Brasília) são carimbadas a cada atualização do aluno.
 */
var DET = ['Data', 'Hora', 'Aluno', 'Turma', 'Escola', 'Matéria', 'Série do jogo', 'Jogo', 'Código', 'Cenário', 'Fase',
  'Pontos', 'Acertos', 'Erros', '% acerto', 'Nota (0-10)', 'Peso', 'Gasto (R$)', 'Dinheiro final (R$)', 'Tempo (min)',
  'Senhas dos apps', 'Detalhe das ações', 'ID'];
var PAI = ['Aluno', 'Data', 'Hora', 'Jogo', 'Código', 'Cenário', 'Pontos', 'Acertos', 'Erros', '% acerto', 'Nota (0-10)',
  'Gasto (R$)', 'Dinheiro final (R$)', 'Tempo (min)', 'Pontuação final (acumulada)', 'Carimbo', 'ID'];
var RES = ['Turma', 'Aluno', 'Escola', 'Jogos', 'Pontos somados', 'Melhor pontuação', 'Média da nota', 'Gasto total (R$)', 'Última atividade', 'Ao vivo', 'Posição (nota)'];
var MIN_AO_VIVO = 30;            // minutos: quem jogou nos últimos MIN_AO_VIVO min, na mesma série da jogada mais recente, vai para o topo
var HR = 2;                       // linhas congeladas: título + cabeçalho
var FONTE = 'Nunito';
var NAVY = '#16213a';
var TZ = 'America/Sao_Paulo';
var CORES = {
  dinheiro: '#d9f2e3', lojas: '#fde9c9', inteiros: '#dbe7ff', ingles: '#f3dcf7',
  espanhol: '#ffe0e0', geometria: '#e0f4f7', algebra: '#fff6c2', default: '#eeeeee'
};

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return ok_('json inválido'); }
  if (d.acao === 'pontos') return rkPontos_(d);
  var lock = LockService.getScriptLock();
  try { lock.waitLock(100000); } catch (err) { return ok_('ocupado'); }
  try { return gravaResultado_(d); } finally { lock.releaseLock(); }
}

function gravaResultado_(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var agora = new Date();
  var tot = (d.certas == null || d.erradas == null) ? 0 : (Number(d.certas) + Number(d.erradas));
  var pct = tot > 0 ? Math.round(100 * d.certas / tot) : '';
  var linha = [
    Utilities.formatDate(agora, TZ, 'dd/MM/yyyy'), Utilities.formatDate(agora, TZ, 'HH:mm:ss'),
    d.nome || '(sem nome)', d.turma || '(sem turma)', d.escola || '',
    d.tema || '', d.serie || '', d.jogo || d.arquivo || '', d.codigo || '', d.cenario == null ? '' : d.cenario, d.fase == null ? '' : d.fase,
    Number(d.pontos) || 0, d.certas == null ? '' : Number(d.certas), d.erradas == null ? '' : Number(d.erradas),
    pct, pct === '' ? '' : pct / 10, 1, d.gasto == null ? '' : Number(d.gasto),
    d.dinheiro == null ? '' : Number(d.dinheiro), Math.round((Number(d.segundos) || 0) / 6) / 10,
    d.senhas || '', d.acoes || d.itens || '', d.sid || ''
  ];
  if (!liberada_(ss, d.escola)) {
    gravar_(det_(ss, 'Retidos (outros)'), linha, d.sid, DET.length, 17);
    return ok_('retido');
  }
  gravar_(det_(ss, 'Todos'), linha, d.sid, DET.length, 17);
  paraPainel_(ss, linha, agora.getTime());
  try { resumo_(ss); } catch (err) { /* o resumo nunca pode impedir o registro do resultado */ }
  return ok_('ok');
}

// Carimbo numérico (ms) a partir de Data/Hora da linha (Date ou texto).
function stamp_(x) {
  var d = x[0], h = x[1];
  try {
    if (!(d instanceof Date)) { var p = String(d).split('/'); d = new Date(+p[2], +p[1] - 1, +p[0]); }
    var hh, mm, ss;
    if (h instanceof Date) { hh = h.getHours(); mm = h.getMinutes(); ss = h.getSeconds(); }
    else { var q = String(h).split(':'); hh = +q[0] || 0; mm = +q[1] || 0; ss = +q[2] || 0; }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, ss).getTime();
  } catch (e) { return new Date().getTime(); }
}

function paraPainel_(ss, x, carimbo) {
  var turma = String(x[3] || 'Sem turma').substring(0, 30);
  var p = painel_(ss, turma.indexOf('(') === 0 ? 'Sem turma' : turma);
  gravar_(p, [x[2], x[0], x[1], x[7], x[8], x[9], x[11], x[12], x[13], x[14], x[15], x[17], x[18], x[19], '', carimbo, x[22]], x[22], PAI.length, 0);
  var n = p.getLastRow() - HR;
  if (n < 1) return;
  // mais recente em cima
  p.getRange(HR + 1, 1, n, PAI.length).sort([{ column: 16, ascending: false }]);
  // pontuação final acumulada de cada aluno (soma de todos os jogos, na aba Todos)
  var todos = ss.getSheetByName('Todos'), soma = {};
  if (todos && todos.getLastRow() > HR) {
    todos.getRange(HR + 1, 3, todos.getLastRow() - HR, 10).getValues().forEach(function (r) {
      if (norm_(r[1]) !== norm_(turma) && String(r[1]) !== String(x[3])) return;
      soma[r[0]] = (soma[r[0]] || 0) + (Number(r[9]) || 0);
    });
  }
  var nomes = p.getRange(HR + 1, 1, n, 1).getValues();
  p.getRange(HR + 1, 15, n, 1).setValues(nomes.map(function (r) { return [soma[r[0]] || 0]; }));
}

// Reconstrói todos os painéis a partir da aba Todos (use depois de mudar colunas).
function reconstruirPaineis() { reconstruir_(); }
function reconstruir_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), t = ss.getSheetByName('Todos');
  if (!t || t.getLastRow() <= HR) return;
  var v = t.getRange(HR + 1, 1, t.getLastRow() - HR, DET.length).getValues(), grupos = {};
  v.forEach(function (x) {
    var turma = String(x[3] || 'Sem turma').substring(0, 30), nome = turma.indexOf('(') === 0 ? 'Sem turma' : turma;
    (grupos[nome] = grupos[nome] || []).push(x);
  });
  Object.keys(grupos).forEach(function (nome) {
    var p = painel_(ss, nome), xs = grupos[nome], soma = {};
    xs.forEach(function (x) { soma[x[2]] = (soma[x[2]] || 0) + (Number(x[11]) || 0); });
    var rows = xs.map(function (x) {
      return [x[2], x[0], x[1], x[7], x[8], x[9], x[11], x[12], x[13], x[14], x[15], x[17], x[18], x[19], soma[x[2]], stamp_(x), x[22]];
    }).sort(function (a, b) { return b[15] - a[15]; });
    var falta = HR + rows.length - p.getMaxRows();
    if (falta > 0) p.insertRowsAfter(p.getMaxRows(), falta);
    p.getRange(HR + 1, 1, p.getMaxRows() - HR, PAI.length).clearContent();
    p.getRange(HR + 1, 1, rows.length, PAI.length).setValues(rows);
  });
}

function doGet(e) {
  if (e && e.parameter && e.parameter.acao === 'ranking') return rkTop_(e.parameter);
  return ok_('Planilha do professor ativa.');
}
function ok_(t) { return ContentService.createTextOutput(t); }

// ---- Escolas liberadas: Schuster e Clarito salvam direto; qualquer outra fica retida até o professor liberar. ----
function norm_(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
function liberadas_(ss) {
  var sh = ss.getSheetByName('Config');
  if (!sh) {
    sh = ss.insertSheet('Config');
    sh.getRange(1, 1).setValue('Escolas liberadas (uma por linha)').setFontWeight('bold');
    sh.getRange(2, 1, 2, 1).setValues([['Schuster'], ['Clarito']]);
    sh.setColumnWidth(1, 300);
  }
  var n = Math.max(sh.getLastRow() - 1, 1);
  return sh.getRange(2, 1, n, 1).getValues().map(function (r) { return norm_(r[0]); }).filter(String);
}
function liberada_(ss, escola) {
  var e = norm_(escola);
  return liberadas_(ss).some(function (l) { return e === l || e.indexOf(l) >= 0; });
}
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Professor').addItem('Liberar escolas da aba Config', 'liberarRetidos').addItem('Reconstruir painéis', 'reconstruirPaineis').addToUi();
}
// Depois de acrescentar uma escola na aba Config, este menu move os resultados retidos dela para as notas.
function liberarRetidos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Retidos (outros)');
  if (!sh || sh.getLastRow() <= HR) return;
  var v = sh.getRange(HR + 1, 1, sh.getLastRow() - HR, DET.length).getValues(), mov = 0;
  for (var i = v.length - 1; i >= 0; i--) {
    if (!liberada_(ss, v[i][4])) continue;
    gravar_(det_(ss, 'Todos'), v[i], v[i][22], DET.length, 17);
    paraPainel_(ss, v[i], stamp_(v[i]));
    sh.deleteRow(i + HR + 1); mov++;
  }
  resumo_(ss);
  SpreadsheetApp.getUi().alert(mov + ' resultado(s) liberado(s).');
}

// ---- Criação e formatação das abas ----
function regras_(rgNota, rgPct) {
  function r(rg, tipo, a, b, bg, fg) {
    var c = SpreadsheetApp.newConditionalFormatRule();
    c = tipo === 'ge' ? c.whenNumberGreaterThanOrEqualTo(a) : tipo === 'bt' ? c.whenNumberBetween(a, b) : c.whenNumberLessThan(a);
    return c.setBackground(bg).setFontColor(fg).setBold(true).setRanges([rg]).build();
  }
  var A = '#1a73e8', V = '#1e8e3e', Y = '#fbbc04', R = '#d93025';
  var out = [
    r(rgNota, 'ge', 10, 0, A, '#ffffff'), r(rgNota, 'bt', 8, 9.999, V, '#ffffff'), r(rgNota, 'bt', 6, 7.999, Y, '#202124'), r(rgNota, 'lt', 6, 0, R, '#ffffff')
  ];
  if (rgPct) out = out.concat([
    r(rgPct, 'ge', 100, 0, A, '#ffffff'), r(rgPct, 'bt', 80, 99.999, V, '#ffffff'), r(rgPct, 'bt', 60, 79.999, Y, '#202124'), r(rgPct, 'lt', 60, 0, R, '#ffffff')
  ]);
  return out;
}

function base_(ss, nome, cab, titulo) {
  var sh = ss.getSheetByName(nome), ok = false;
  if (sh) { try { var atual = sh.getRange(HR, 1, 1, cab.length).getValues()[0]; ok = atual.length === cab.length && atual[0] === cab[0] && atual[cab.length - 1] === cab[cab.length - 1]; if (ok && atual.join('|') !== cab.join('|')) sh.getRange(HR, 1, 1, cab.length).setValues([cab]); } catch (e) { ok = false; } }
  if (ok) return { sh: sh, novo: false };
  if (!sh) sh = ss.insertSheet(nome); else { sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart(); sh.clear(); sh.clearConditionalFormatRules(); sh.setFrozenColumns(0); sh.setFrozenRows(0); }
  if (sh.getMaxColumns() < cab.length) sh.insertColumnsAfter(sh.getMaxColumns(), cab.length - sh.getMaxColumns());
  var n = cab.length;
  sh.getRange(1, 1, sh.getMaxRows(), n).setFontFamily(FONTE).setFontSize(12).setVerticalAlignment('middle').setHorizontalAlignment('center');
  sh.getRange(1, 1, 1, n).merge().setValue(titulo).setBackground(NAVY).setFontColor('#ffd54a').setFontSize(18).setFontWeight('bold').setHorizontalAlignment('left');
  sh.setRowHeight(1, 44);
  sh.getRange(HR, 1, 1, n).setValues([cab]).setBackground('#2f4a8a').setFontColor('#ffffff').setFontWeight('bold').setFontSize(12).setWrap(true);
  sh.setRowHeight(HR, 36);
  sh.setFrozenRows(HR);
  sh.getRange(HR + 1, 1, sh.getMaxRows() - HR, n).setBorder(null, null, true, null, null, true, '#d7dce8', SpreadsheetApp.BorderStyle.SOLID);
  return { sh: sh, novo: true };
}

function det_(ss, nome) {
  var b = base_(ss, nome, DET, nome === 'Todos' ? '📋 Todos os resultados (professor)' : '⏳ Retidos — escolas ainda não liberadas');
  var sh = b.sh;
  if (!b.novo) sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 16, sh.getMaxRows() - HR, 1), sh.getRange(HR + 1, 15, sh.getMaxRows() - HR, 1)));
  if (b.novo) {
    var m = sh.getMaxRows() - HR;
    sh.getRange(HR + 1, 3, m, 1).setHorizontalAlignment('left').setFontWeight('bold');
    sh.getRange(HR + 1, 15, m, 1).setNumberFormat('0"%"');
    sh.getRange(HR + 1, 16, m, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 18, m, 2).setNumberFormat('R$ #,##0.00');
    sh.getRange(HR + 1, 20, m, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 21, m, 2).setHorizontalAlignment('left').setWrap(true).setFontSize(10);
    sh.getRange(HR + 1, 17, m, 1).setBackground('#fff7d6');          // peso: célula editável pelo professor
    try { sh.setFrozenColumns(3); } catch (e) {}
    tamanho_(sh, DET.length, [21, 22]);   // só na criação da aba; depois a largura é do professor
    sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 16, m, 1), sh.getRange(HR + 1, 15, m, 1)));
  }
  return sh;
}

function painel_(ss, nome) {
  var b = base_(ss, nome, PAI, '🏆 Painel da turma ' + nome + ' — atualiza ao vivo');
  var sh = b.sh;
  if (!b.novo) sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 11, sh.getMaxRows() - HR, 1), sh.getRange(HR + 1, 10, sh.getMaxRows() - HR, 1)));
  if (b.novo) {
    var m = sh.getMaxRows() - HR;
    sh.getRange(HR + 1, 1, m, 1).setHorizontalAlignment('left').setFontWeight('bold');
    sh.getRange(HR + 1, 4, m, 1).setHorizontalAlignment('left');
    sh.getRange(HR + 1, 2, m, 1).setNumberFormat('dd/MM/yyyy');
    sh.getRange(HR + 1, 3, m, 1).setNumberFormat('HH:mm:ss');
    sh.getRange(HR + 1, 15, m, 2).setNumberFormat('0');
    sh.getRange(HR + 1, 15, m, 1).setFontWeight('bold');
    sh.getRange(HR + 1, 10, m, 1).setNumberFormat('0"%"');
    sh.getRange(HR + 1, 11, m, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 12, m, 2).setNumberFormat('R$ #,##0.00');
    sh.getRange(HR + 1, 14, m, 1).setNumberFormat('0.0');
    try { sh.setFrozenColumns(1); } catch (e) {}
    sh.hideColumns(PAI.length - 1, 2);
    tamanho_(sh, PAI.length, []);
    sh.setColumnWidth(15, 110);
    sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 11, m, 1), sh.getRange(HR + 1, 10, m, 1)));
  }
  return sh;
}

// Larguras iniciais estreitas, aplicadas só quando a aba é criada. Depois o script nunca mais mexe: o professor ajusta à mão.
function tamanho_(sh, n, fixas) {
  for (var c = 1; c <= n; c++) {
    sh.setColumnWidth(c, (fixas && fixas.indexOf(c) >= 0) ? 200 : 85);
  }
}

// Atualiza a linha do mesmo jogo (mesmo ID) ou cria uma nova. keepCol: coluna (1-based) preservada da linha antiga (ex.: peso).
function gravar_(sh, linha, sid, idCol, keepCol) {
  var n = sh.getLastRow(), r = 0, det = linha.length === DET.length;
  if (sid && n > HR) {
    var ids = sh.getRange(HR + 1, idCol, n - HR, 1).getValues();
    for (var i = ids.length - 1; i >= 0; i--) { if (ids[i][0] === sid) { r = i + HR + 1; break; } }
  }
  if (r && keepCol) { var old = sh.getRange(r, keepCol).getValue(); if (old !== '') linha[keepCol - 1] = old; }
  if (!r) r = Math.max(n, HR) + 1;
  sh.getRange(r, 1, 1, linha.length).setValues([linha]);
  if (det) {
    sh.getRange(r, 1, 1, 10).setBackground(CORES[String(linha[5]).toLowerCase()] || '#f6f7fb');
    sh.getRange(r, 17).setBackground('#fff7d6');
  } else {
    sh.getRange(r, 1, 1, 6).setBackground('#f6f7fb');
  }
}

function resumo_(ss) {
  var todos = ss.getSheetByName('Todos');
  if (!todos || todos.getLastRow() <= HR) return;
  var v = todos.getRange(HR + 1, 1, todos.getLastRow() - HR, DET.length).getValues(), m = {}, ultimo = { t: 0, serie: '' };
  v.forEach(function (x) {
    var k = x[2] + '|' + x[3], t = stamp_(x);
    if (!m[k]) m[k] = { aluno: x[2], turma: x[3], escola: x[4], serie: x[6], jogos: 0, soma: 0, melhor: 0, nn: 0, np: 0, gasto: 0, last: 0 };
    var a = m[k]; a.jogos++; a.soma += Number(x[11]) || 0; if (x[11] > a.melhor) a.melhor = x[11];
    if (x[15] !== '' && !isNaN(x[15])) { var p = Number(x[16]) || 1; a.nn += x[15] * p; a.np += p; }
    a.gasto += Number(x[17]) || 0;
    if (t >= a.last) { a.last = t; a.serie = x[6]; }
    if (t >= ultimo.t) { ultimo.t = t; ultimo.serie = x[6]; }
  });
  var corte = new Date().getTime() - MIN_AO_VIVO * 60000;
  var lista = Object.keys(m).map(function (k) {
    var a = m[k]; a.media = a.np ? Math.round(10 * a.nn / a.np) / 10 : '';
    a.vivo = a.last >= corte && String(a.serie) === String(ultimo.serie);
    return a;
  });
  function nota_(a) { return a.media === '' ? -1 : a.media; }
  lista.sort(function (a, b) {
    return (b.vivo - a.vivo) || (nota_(b) - nota_(a)) || (b.soma - a.soma) || String(a.aluno).localeCompare(String(b.aluno));
  });
  // posição por nota (empates dividem a posição), dentro do bloco "ao vivo" e dentro do restante
  var pos = {}, ult = null, ultPos = 0;
  [true, false].forEach(function (blk) {
    ult = null; ultPos = 0; var n = 0;
    lista.forEach(function (a) {
      if (a.vivo !== blk) return;
      n++; if (nota_(a) !== ult) { ult = nota_(a); ultPos = n; }
      pos[a.aluno + '|' + a.turma] = ultPos;
    });
  });
  var linhas = lista.map(function (a) {
    return [a.turma, a.aluno, a.escola, a.jogos, a.soma, a.melhor, a.media, a.gasto,
      Utilities.formatDate(new Date(a.last), TZ, 'dd/MM HH:mm'), a.vivo ? '🟢 AGORA' : '', pos[a.aluno + '|' + a.turma]];
  });
  var b = base_(ss, 'Resumo', RES, '📊 Resumo ao vivo — quem jogou nos últimos ' + MIN_AO_VIVO + ' min (mesma série da jogada mais recente) em cima; depois, por nota');
  var sh = b.sh, n = RES.length, max = sh.getMaxRows();
  if (linhas.length > max - HR) sh.insertRowsAfter(max, linhas.length - (max - HR));
  max = sh.getMaxRows();
  sh.getRange(HR + 1, 1, max - HR, n).clearContent().setBackground(null);
  if (linhas.length) {
    sh.getRange(HR + 1, 1, linhas.length, n).setValues(linhas);
    var cores = ['#e8f0fe', '#e6f4ea', '#fef7e0', '#fce8e6', '#f3e8fd'], t = '', ci = -1;
    linhas.forEach(function (l, i) {
      var vivo = l[9] !== '';
      if (l[0] !== t) { t = l[0]; ci = (ci + 1) % cores.length; }
      sh.getRange(i + HR + 1, 1, 1, n).setBackground(vivo ? '#c8f7d4' : cores[ci]);
    });
  }
  if (b.novo) {
    sh.getRange(HR + 1, 2, max - HR, 1).setHorizontalAlignment('left').setFontWeight('bold');
    sh.getRange(HR + 1, 7, max - HR, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 8, max - HR, 1).setNumberFormat('R$ #,##0.00');
    sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 7, max - HR, 1), null));
  }
  if (b.novo) tamanho_(sh, n, []);
}


/* ===== Classificação ao vivo (top 10 por turma + código da atividade) ===== */
var RK='Ranking',RK_MAX_PTS=6000,RK_HORAS=12;
function rkAba_(){var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(RK);if(!sh){sh=ss.insertSheet(RK);sh.appendRow(['sid','turma','codigo','nome','pontos','quando'])}return sh}
function rkLimpa_(t,n){return String(t==null?'':t).replace(/[<>&"'\=+@]/g,'').replace(/\s+/g,' ').trim().slice(0,n)}
function rkPontos_(d){
  var cache=CacheService.getScriptCache(),sid=rkLimpa_(d.sid,24),turma=rkLimpa_(d.turma,12).toUpperCase(),cod=rkLimpa_(d.codigo,8),nome=rkLimpa_(d.nome,30),pts=Math.floor(Number(d.pts));
  if(!sid||!cod||!turma||!nome||!isFinite(pts)||pts<0||pts>RK_MAX_PTS)return ContentService.createTextOutput('recusado');
  if(cache.get('rk'+sid))return ContentService.createTextOutput('aguarde');
  cache.put('rk'+sid,'1',3);
  rkAba_().appendRow([sid,turma,cod,nome,pts,new Date()]); /* só acrescenta (sem bloqueio); o ranking pega o maior de cada aluno */
  return ContentService.createTextOutput('ok');
}
function rkTop_(p){
  var turma=rkLimpa_(p.turma,12).toUpperCase(),cod=rkLimpa_(p.codigo,8),sh=rkAba_(),v=sh.getDataRange().getValues();v.shift();
  var lim=Date.now()-RK_HORAS*3600000;
  var m={};v.forEach(function(r){if(String(r[1]).toUpperCase()===turma&&String(r[2])===cod&&new Date(r[5]).getTime()>=lim){var s=r[0],x=Number(r[4]);if(!m[s]||x>m[s].pontos)m[s]={sid:s,nome:r[3],pontos:x}}});
  var o=Object.keys(m).map(function(k){return m[k]});
  o.sort(function(a,b){return b.pontos-a.pontos});
  return ContentService.createTextOutput(JSON.stringify({ranking:o.slice(0,10)})).setMimeType(ContentService.MimeType.JSON);
}
