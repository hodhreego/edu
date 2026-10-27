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
  'Senhas dos apps', 'Detalhe dos gastos', 'ID'];
var PAI = ['Aluno', 'Data', 'Hora', 'Jogo', 'Código', 'Cenário', 'Pontos', 'Acertos', 'Erros', '% acerto', 'Nota (0-10)',
  'Gasto (R$)', 'Dinheiro final (R$)', 'Tempo (min)', 'ID'];
var RES = ['Turma', 'Aluno', 'Escola', 'Jogos', 'Pontos somados', 'Melhor pontuação', 'Média da nota', 'Gasto total (R$)'];
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
    d.senhas || '', d.itens || '', d.sid || ''
  ];
  if (!liberada_(ss, d.escola)) {
    gravar_(det_(ss, 'Retidos (outros)'), linha, d.sid, DET.length, 17);
    return ok_('retido');
  }
  gravar_(det_(ss, 'Todos'), linha, d.sid, DET.length, 17);
  paraPainel_(ss, linha);
  resumo_(ss);
  return ok_('ok');
}

function paraPainel_(ss, x) {
  var turma = String(x[3] || 'Sem turma').substring(0, 30);
  var p = painel_(ss, turma.indexOf('(') === 0 ? 'Sem turma' : turma);
  gravar_(p, [x[2], x[0], x[1], x[7], x[8], x[9], x[11], x[12], x[13], x[14], x[15], x[17], x[18], x[19], x[22]], x[22], PAI.length, 0);
  p.getRange(HR + 1, 1, Math.max(p.getLastRow() - HR, 1), PAI.length).sort([{ column: 1, ascending: true }]);
  tamanho_(p, PAI.length, []);
}

function doGet() { return ok_('Planilha do professor ativa.'); }
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
  SpreadsheetApp.getUi().createMenu('Professor').addItem('Liberar escolas da aba Config', 'liberarRetidos').addToUi();
}
// Depois de acrescentar uma escola na aba Config, este menu move os resultados retidos dela para as notas.
function liberarRetidos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Retidos (outros)');
  if (!sh || sh.getLastRow() <= HR) return;
  var v = sh.getRange(HR + 1, 1, sh.getLastRow() - HR, DET.length).getValues(), mov = 0;
  for (var i = v.length - 1; i >= 0; i--) {
    if (!liberada_(ss, v[i][4])) continue;
    gravar_(det_(ss, 'Todos'), v[i], v[i][22], DET.length, 17);
    paraPainel_(ss, v[i]);
    sh.deleteRow(i + HR + 1); mov++;
  }
  resumo_(ss);
  SpreadsheetApp.getUi().alert(mov + ' resultado(s) liberado(s).');
}

// ---- Criação e formatação das abas ----
function regras_(rgNota, rgPct) {
  function r(rg, tipo, a, b, bg, fg) {
    var c = SpreadsheetApp.newConditionalFormatRule();
    if (tipo === 'ge') c.whenNumberGreaterThanOrEqualTo(a);
    else if (tipo === 'bt') c.whenNumberBetween(a, b);
    else c.whenNumberLessThan(a);
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
  if (sh) { try { ok = sh.getRange(HR, 1, 1, cab.length).getValues()[0].join('|') === cab.join('|'); } catch (e) { ok = false; } }
  if (ok) return { sh: sh, novo: false };
  if (!sh) sh = ss.insertSheet(nome); else { sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart(); sh.clear(); sh.clearConditionalFormatRules(); }
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
  if (b.novo) {
    var m = sh.getMaxRows() - HR;
    sh.getRange(HR + 1, 3, m, 1).setHorizontalAlignment('left').setFontWeight('bold');
    sh.getRange(HR + 1, 15, m, 1).setNumberFormat('0"%"');
    sh.getRange(HR + 1, 16, m, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 18, m, 2).setNumberFormat('R$ #,##0.00');
    sh.getRange(HR + 1, 20, m, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 21, m, 2).setHorizontalAlignment('left').setWrap(true).setFontSize(10);
    sh.getRange(HR + 1, 17, m, 1).setBackground('#fff7d6');          // peso: célula editável pelo professor
    sh.setFrozenColumns(3);
    sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 16, m, 1), sh.getRange(HR + 1, 15, m, 1)));
  }
  return sh;
}

function painel_(ss, nome) {
  var b = base_(ss, nome, PAI, '🏆 Painel da turma ' + nome + ' — atualiza ao vivo');
  var sh = b.sh;
  if (b.novo) {
    var m = sh.getMaxRows() - HR;
    sh.getRange(HR + 1, 1, m, 1).setHorizontalAlignment('left').setFontWeight('bold');
    sh.getRange(HR + 1, 4, m, 1).setHorizontalAlignment('left');
    sh.getRange(HR + 1, 10, m, 1).setNumberFormat('0"%"');
    sh.getRange(HR + 1, 11, m, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 12, m, 2).setNumberFormat('R$ #,##0.00');
    sh.getRange(HR + 1, 14, m, 1).setNumberFormat('0.0');
    sh.setFrozenColumns(1);
    sh.hideColumns(PAI.length);
    sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 11, m, 1), sh.getRange(HR + 1, 10, m, 1)));
  }
  return sh;
}

// Larguras automáticas; textos longos ficam com largura fixa.
function tamanho_(sh, n, fixas) {
  for (var c = 1; c <= n; c++) {
    if (fixas && fixas.indexOf(c) >= 0) { sh.setColumnWidth(c, 300); continue; }
    sh.autoResizeColumn(c);
    sh.setColumnWidth(c, Math.max(80, Math.min(sh.getColumnWidth(c) + 16, 340)));
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
    tamanho_(sh, DET.length, [21, 22]);
  } else {
    sh.getRange(r, 1, 1, 6).setBackground('#f6f7fb');
  }
}

function resumo_(ss) {
  var todos = ss.getSheetByName('Todos');
  if (!todos || todos.getLastRow() <= HR) return;
  var v = todos.getRange(HR + 1, 1, todos.getLastRow() - HR, DET.length).getValues(), m = {};
  v.forEach(function (x) {
    var k = x[2] + '|' + x[3];
    if (!m[k]) m[k] = { aluno: x[2], turma: x[3], escola: x[4], jogos: 0, soma: 0, melhor: 0, nn: 0, np: 0, gasto: 0 };
    var a = m[k]; a.jogos++; a.soma += Number(x[11]) || 0; if (x[11] > a.melhor) a.melhor = x[11];
    if (x[15] !== '' && !isNaN(x[15])) { var p = Number(x[16]) || 1; a.nn += x[15] * p; a.np += p; }
    a.gasto += Number(x[17]) || 0;
  });
  var linhas = Object.keys(m).map(function (k) {
    var a = m[k]; return [a.turma, a.aluno, a.escola, a.jogos, a.soma, a.melhor, a.np ? Math.round(10 * a.nn / a.np) / 10 : '', a.gasto];
  }).sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])) || String(a[1]).localeCompare(String(b[1])); });
  var b = base_(ss, 'Resumo', RES, '📊 Resumo por aluno — média ponderada pelo peso');
  var sh = b.sh, n = RES.length, max = sh.getMaxRows();
  sh.getRange(HR + 1, 1, max - HR, n).clearContent().setBackground(null);
  if (linhas.length) {
    sh.getRange(HR + 1, 1, linhas.length, n).setValues(linhas);
    var cores = ['#e8f0fe', '#e6f4ea', '#fef7e0', '#fce8e6', '#f3e8fd'], t = '', ci = -1;
    linhas.forEach(function (l, i) {
      if (l[0] !== t) { t = l[0]; ci = (ci + 1) % cores.length; }
      sh.getRange(i + HR + 1, 1, 1, 6).setBackground(cores[ci]);
    });
  }
  if (b.novo) {
    sh.getRange(HR + 1, 2, max - HR, 1).setHorizontalAlignment('left').setFontWeight('bold');
    sh.getRange(HR + 1, 7, max - HR, 1).setNumberFormat('0.0');
    sh.getRange(HR + 1, 8, max - HR, 1).setNumberFormat('R$ #,##0.00');
    sh.setConditionalFormatRules(regras_(sh.getRange(HR + 1, 7, max - HR, 1), null));
  }
  tamanho_(sh, n, []);
}
