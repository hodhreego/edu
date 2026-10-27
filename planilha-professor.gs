/**
 * Planilha do professor — recebe os resultados dos jogos e organiza sozinha.
 *
 * COMO INSTALAR (uma vez só):
 * 1. Crie uma Planilha Google nova (ex.: "Resultados dos alunos").
 * 2. Menu Extensões > Apps Script. Apague o que estiver lá e cole TODO este arquivo. Salve.
 * 3. Implantar > Nova implantação > tipo "App da Web".
 *    Executar como: Eu  |  Quem pode acessar: Qualquer pessoa. Autorize quando pedir.
 * 4. Copie o endereço que termina em /exec e cole em config.js:  window.EDU_ENDPOINT='ENDEREÇO';
 *
 * O que a planilha faz:
 *  - Aba "Todos": uma linha por jogo jogado (recebe tudo).
 *  - Uma aba por TURMA (ex.: "8º A"), com os alunos daquela turma.
 *  - Cada MATÉRIA tem uma cor própria; nota/pontos ficam verde, amarelo ou vermelho.
 *  - Aba "Resumo": por aluno, total de jogos, pontos somados e melhor pontuação.
 */
var CABEC = ['Data', 'Hora', 'Aluno', 'Turma', 'Escola', 'Matéria', 'Série do jogo', 'Jogo', 'Código', 'Aula', 'Pontos', 'Máximo', 'Tempo (min)', 'ID'];
var CORES = {
  dinheiro: '#d9f2e3', lojas: '#fde9c9', inteiros: '#dbe7ff', ingles: '#f3dcf7',
  espanhol: '#ffe0e0', geometria: '#e0f4f7', algebra: '#fff6c2', default: '#eeeeee'
};
var CABEC_COR = '#16213a';

function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return ok_('json inválido'); }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var linha = [
    d.dia || '', (d.quando || '').substring(11, 16), d.nome || '(sem nome)', d.turma || '(sem turma)', d.escola || '',
    d.tema || '', d.serie || '', d.jogo || d.arquivo || '', d.codigo || '', d.aula || '',
    Number(d.pontos) || 0, Number(d.maximo) || 0, Math.round((Number(d.segundos) || 0) / 6) / 10, d.sid || ''
  ];
  gravar_(aba_(ss, 'Todos'), linha, d.sid);
  gravar_(aba_(ss, String(d.turma || 'Sem turma').substring(0, 30)), linha, d.sid);
  resumo_(ss);
  return ok_('ok');
}

function doGet() { return ok_('Planilha do professor ativa.'); }
function ok_(t) { return ContentService.createTextOutput(t); }

function aba_(ss, nome) {
  var sh = ss.getSheetByName(nome);
  if (sh) return sh;
  sh = ss.insertSheet(nome);
  sh.appendRow(CABEC);
  var h = sh.getRange(1, 1, 1, CABEC.length);
  h.setBackground(CABEC_COR).setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
  sh.setFrozenRows(1);
  sh.setColumnWidths(1, CABEC.length, 110);
  sh.setColumnWidth(3, 200); sh.setColumnWidth(8, 260);
  var rg = sh.getRange(2, 11, 999, 2);
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(80).setBackground('#b7e1cd').setRanges([rg]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(40, 79.99).setBackground('#fce8b2').setRanges([rg]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(40).setBackground('#f4c7c3').setRanges([rg]).build()
  ]);
  return sh;
}

// Atualiza a linha do mesmo jogo (mesmo ID) ou cria uma nova.
function gravar_(sh, linha, sid) {
  var n = sh.getLastRow(), r = 0;
  if (sid && n > 1) {
    var ids = sh.getRange(2, CABEC.length, n - 1, 1).getValues();
    for (var i = ids.length - 1; i >= 0; i--) { if (ids[i][0] === sid) { r = i + 2; break; } }
  }
  if (!r) { r = n + 1; }
  sh.getRange(r, 1, 1, linha.length).setValues([linha]);
  var cor = CORES[String(linha[5]).toLowerCase()] || CORES['default'];
  sh.getRange(r, 1, 1, 10).setBackground(cor);
}

function resumo_(ss) {
  var todos = ss.getSheetByName('Todos');
  if (!todos || todos.getLastRow() < 2) return;
  var v = todos.getRange(2, 1, todos.getLastRow() - 1, CABEC.length).getValues(), m = {};
  v.forEach(function (x) {
    var k = x[2] + '|' + x[3];
    if (!m[k]) m[k] = { aluno: x[2], turma: x[3], escola: x[4], jogos: 0, soma: 0, melhor: 0 };
    m[k].jogos++; m[k].soma += x[10]; if (x[10] > m[k].melhor) m[k].melhor = x[10];
  });
  var linhas = Object.keys(m).map(function (k) { var a = m[k]; return [a.turma, a.aluno, a.escola, a.jogos, a.soma, a.melhor]; })
    .sort(function (a, b) { return String(a[0]).localeCompare(String(b[0])) || String(a[1]).localeCompare(String(b[1])); });
  var sh = ss.getSheetByName('Resumo') || ss.insertSheet('Resumo', 0);
  sh.clear();
  sh.appendRow(['Turma', 'Aluno', 'Escola', 'Jogos', 'Pontos somados', 'Melhor pontuação']);
  sh.getRange(1, 1, 1, 6).setBackground(CABEC_COR).setFontColor('#fff').setFontWeight('bold');
  sh.setFrozenRows(1);
  if (linhas.length) sh.getRange(2, 1, linhas.length, 6).setValues(linhas);
  var cores = ['#e8f0fe', '#e6f4ea', '#fef7e0', '#fce8e6', '#f3e8fd'], t = '', ci = -1;
  linhas.forEach(function (l, i) {
    if (l[0] !== t) { t = l[0]; ci = (ci + 1) % cores.length; }
    sh.getRange(i + 2, 1, 1, 6).setBackground(cores[ci]);
  });
  sh.setColumnWidths(1, 6, 130); sh.setColumnWidth(2, 220);
}
