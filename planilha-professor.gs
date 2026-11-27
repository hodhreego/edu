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
  if (EB_ACOES[d.acao]) return eb_(d);
  if (d.acao === 'pontos') return rkPontos_(d);
  if (d.acao === 'rbxsave') return rbxSave_(d);
  if (d.acao === 'rbxresp') return rbxResp_(d);
  if (d.acao === 'rbxban') return rbxBan_(d);
  var lock = LockService.getScriptLock();
  try { lock.waitLock(100000); } catch (err) { return ok_('ocupado'); }
  try { return gravaResultado_(d); } finally { lock.releaseLock(); }
}

// Coluna extra 'Login' (24), fora de DET para não recriar/limpar a aba.
function loginCol_(sh, sid, login) {
  if (!sh || !sid || !login) return;
  if (sh.getMaxColumns() < 24) sh.insertColumnsAfter(sh.getMaxColumns(), 24 - sh.getMaxColumns());
  if (sh.getRange(HR, 24).getValue() === '') sh.getRange(HR, 24).setValue('Login').setFontWeight('bold').setBackground(NAVY).setFontColor('#ffd54a').setHorizontalAlignment('center');
  var n = sh.getLastRow(); if (n <= HR) return;
  var ids = sh.getRange(HR + 1, 23, n - HR, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) if (ids[i][0] === sid) { sh.getRange(i + HR + 1, 24).setValue(String(login).toLowerCase()); return; }
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
    try { loginCol_(ss.getSheetByName('Retidos (outros)'), d.sid, d.login); } catch (err) { }
    return ok_('retido');
  }
  gravar_(det_(ss, 'Todos'), linha, d.sid, DET.length, 17);
  try { loginCol_(ss.getSheetByName('Todos'), d.sid, d.login); } catch (err) { }
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
  if (e && e.parameter && e.parameter.acao === 'rbxload') return rbxLoad_(e.parameter);
  if (e && e.parameter && e.parameter.acao === 'rbxdash') return rbxDash_(e.parameter);
  if (e && e.parameter && e.parameter.acao === 'rbxlive') return rbxLive_(e.parameter);
  if (e && e.parameter && e.parameter.acao === 'ativdash') return ativDash_(e.parameter);
  if (e && e.parameter && e.parameter.acao === 'profsaldos') return profSaldos_(e.parameter);
  if (e && e.parameter && EB_ACOES[e.parameter.acao]) return eb_(e.parameter);
  if (e && e.parameter && e.parameter.acao === 'rbxfmt' && e.parameter.k === RBX_KEY) { rbxBeleza_(); return ok_('formatado'); }
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
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Professor').addItem('Liberar escolas da aba Config', 'liberarRetidos').addItem('Reconstruir painéis', 'reconstruirPaineis').addToUi();
  ui.createMenu('🔑 EduBank').addItem('Resetar senha do EduBank de um aluno', 'resetarSenha').addItem('Resetar senha do EduBank de TODOS', 'resetarTodas').addItem('Desbloquear aluno', 'desbloquear').addSeparator().addItem('Ver aluno (aba Aluno)', 'verAluno').addItem('Zerar carteira de um aluno', 'zerarCarteira').addItem('Definir senha do professor', 'definirSenhaProfessor').addSeparator().addItem('Atualizar câmbio agora', 'atualizarCambio').addItem('Preparar abas do EduBank', 'prepararEduBank').addToUi();
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
  // ordem da lista: quem fez a ÚLTIMA atividade por último fica em cima (facilita lançar as notas de quem você viu por último)
  lista.sort(function (a, b) {
    return (b.last - a.last) || String(a.aluno).localeCompare(String(b.aluno));
  });
  // a posição (ranking) continua sendo por nota
  var porNota = lista.slice().sort(function (a, b) {
    return (b.vivo - a.vivo) || (nota_(b) - nota_(a)) || (b.soma - a.soma) || String(a.aluno).localeCompare(String(b.aluno));
  });
  // posição por nota (empates dividem a posição), dentro do bloco "ao vivo" e dentro do restante
  var pos = {}, ult = null, ultPos = 0;
  [true, false].forEach(function (blk) {
    ult = null; ultPos = 0; var n = 0;
    porNota.forEach(function (a) {
      if (a.vivo !== blk) return;
      n++; if (nota_(a) !== ult) { ult = nota_(a); ultPos = n; }
      pos[a.aluno + '|' + a.turma] = ultPos;
    });
  });
  var linhas = lista.map(function (a) {
    return [a.turma, a.aluno, a.escola, a.jogos, a.soma, a.melhor, a.media, a.gasto,
      Utilities.formatDate(new Date(a.last), TZ, 'dd/MM HH:mm'), a.vivo ? '🟢 AGORA' : '', pos[a.aluno + '|' + a.turma]];
  });
  var b = base_(ss, 'Resumo', RES, '📊 Resumo ao vivo — última atividade primeiro (🟢 = jogou nos últimos ' + MIN_AO_VIVO + ' min); a posição continua por nota');
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


// ---- RobIox: progresso por login (aba "RobIox": login | ts | json) ----
function rbxAba_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('RobIox');
  if (!sh) { sh = ss.insertSheet('RobIox'); sh.appendRow(['login', 'ts', 'json']); sh.setFrozenRows(1); }
  return sh;
}
function rbxSave_(d) {
  var login = String(d.login || '').toLowerCase();
  if (!/^(\d{1,3}[a-z]{3}\d[a-z]|mestre|teste|mainara)$/.test(login)) return ok_('login inválido');
  var ate = rbxBloqueio_(login);
  if (ate > Date.now()) return ok_('bloqueado ate ' + new Date(ate).toLocaleString('pt-BR'));
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (err) { return ok_('ocupado'); }
  try {
    var sh = rbxAba_(), n = sh.getLastRow(), ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues() : [], row = 0;
    for (var i = 0; i < ids.length; i++) if (ids[i][0] === login) { row = i + 2; break; }
    var js = JSON.stringify(d.st || {});
    if (js.length > 45000) return ok_('grande demais');
    var linha = [login, Number(d.ts) || Date.now(), js];
    if (row) sh.getRange(row, 1, 1, 3).setValues([linha]); else sh.appendRow(linha);
    if (d.sum && login !== 'mestre') { try { rbxAlunos_(login, d.ts, d.sum); } catch (err) { } }
    return ok_('ok');
  } finally { lock.releaseLock(); }
}
function rbxLoad_(p) {
  var login = String(p.login || '').toLowerCase(), sh = rbxAba_(), n = sh.getLastRow();
  var ate = rbxBloqueio_(login);
  if (ate > Date.now()) return ContentService.createTextOutput(JSON.stringify({ ok: 0, bloqueado: 1, ate: ate })).setMimeType(ContentService.MimeType.JSON);
  var out = { ok: 0 };
  if (n > 1) {
    var v = sh.getRange(2, 1, n - 1, 3).getValues();
    for (var i = 0; i < v.length; i++) if (v[i][0] === login) { try { out = { ok: 1, ts: Number(v[i][1]), st: JSON.parse(v[i][2]) }; } catch (e) {} break; }
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}


// ================= EduBank (spec v2): contas, sessões, nuvem, câmbio, transferências, boletim =================
// Resposta sempre JSON: {ok:1,...} ou {ok:0,erro:'texto'}. Ação pelo parâmetro "acao" (GET ou POST JSON).
var EB_ACOES = { entrar: 1, senha: 1, bancostat: 1, bancosenha: 1, profreset: 1, profentrar: 1, profturmas: 1, profturma: 1, profaluno: 1, profconteudos: 1, profconteudo: 1, profdesbloquear: 1, profzerar: 1, profdash: 1, profenviar: 1, profenviarturma: 1, receber: 1, receberack: 1, quem: 1, nuvemsalvar: 1, nuvemcarregar: 1, carteira: 1, taxas: 1, cambio: 1, transferir: 1, extrato: 1, resultado: 1, boletim: 1, classificacao: 1, moedas: 1, trocarmoedas: 1, receberack: 1, ativos: 1, historico: 1, serie: 1, rfprodutos: 1, tdtitulos: 1, fundos: 1, invcarteira: 1, rfaplicar: 1, rfresgatar: 1, invcomprar: 1, invvender: 1 };
var EB_ALUNO = /^\d{1,3}[a-z]{3}\d[a-z]$/;
var EB_ESPECIAL = /^(mestre|teste|mainara)$/;
var EB_FIAT = ['USD', 'EUR', 'GBP', 'JPY', 'ARS', 'CNY'];
var EB_CRIPTO = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'USDT'];
var EB_MESTRE = '4599699444';
var EB_MOEDAS = EB_FIAT.concat(EB_CRIPTO);
var EB_RESERVA = { USD: 5.4, EUR: 6.3, GBP: 7.25, JPY: 0.036, ARS: 0.0055, CNY: 0.75, BTC: 350000, ETH: 18000, SOL: 800, XRP: 12, DOGE: 1, USDT: 5.4 };
var EB_URL_FIAT = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,JPY-BRL,ARS-BRL,CNY-BRL';
var EB_URL_CRIPTO = 'https://economia.awesomeapi.com.br/json/last/BTC-BRL,ETH-BRL,SOL-BRL,XRP-BRL,DOGE-BRL,USDT-BRL';
var EB_MAX_ERROS = 5, EB_BLOQ_MIN = 10, EB_SESSAO_DIAS = 30, EB_SENHA_INICIAL = '2026.2026';
var EB_ABAS = {
  Contas: { cab: ['login', 'turma', 'salt', 'hash', 'trocar', 'erros', 'bloqueio_ate', 'criado', 'ultimo_acesso', 'banco_salt', 'banco_hash'], cor: '#1e3a8a', w: [110, 80, 150, 420, 60, 60, 150, 150, 150, 150, 420], txt: [1, 2, 3, 4, 10, 11] },
  Sessoes: { cab: ['token_hash', 'login', 'expira', 'criado'], cor: '#475569', w: [420, 110, 140, 150], txt: [1, 2] },
  Nuvem: { cab: ['login', 'chave', 'ts', 'json'], cor: '#0f766e', w: [110, 70, 140, 500], txt: [1, 2] },
  Carteiras: { cab: ['login'].concat(EB_MOEDAS, ['atualizado']), cor: '#6a2fd6', w: [110], txt: [1] },
  Extratos: { cab: ['ts', 'login', 'tipo', 'moeda', 'v', 'brl', 'outro', 'nota', 'saldo_apos', 'id'], cor: '#b45309', w: [150, 110, 70, 70, 110, 100, 110, 220, 110, 200], txt: [2, 7, 8, 10] },
  Logs: { cab: ['ts', 'login', 'evento', 'detalhe'], cor: '#334155', w: [150, 110, 110, 520], txt: [2, 4] },
  Mestre: { cab: ['ts', 'aluno', 'operacao', 'moeda', 'spread_brl', 'conta_mestre'], cor: '#7c3aed', w: [150, 110, 80, 80, 110, 130], txt: [2, 4, 6] },
  Moedas: { cab: ['ts', 'login', 'id', 'tipo', 'qtd', 'centavos'], cor: '#ca8a04', w: [150, 110, 200, 80, 80, 90], txt: [2, 3, 4] },
  Creditos: { cab: ['ts', 'login', 'id', 'centavos', 'nota', 'status'], cor: '#0e7490', w: [150, 110, 220, 100, 220, 90], txt: [2, 3, 5, 6] },
  Posicoes: { cab: ['login', 'ativo', 'qtd', 'preco_medio', 'ts', 'moeda', 'custo_brl'], cor: '#0369a1', w: [110, 80, 80, 100, 140, 70, 100], txt: [1, 2, 6] },
  Aplicacoes: { cab: ['login', 'id', 'prod', 'valor', 'ts', 'taxa', 'status', 'extra', 'fx', 'resg_ts', 'liquido'], cor: '#047857', w: [110, 200, 130, 90, 140, 80, 80, 90, 80, 140, 90], txt: [1, 2, 3, 7] },
  Ordens: { cab: ['ts', 'login', 'id', 'tipo', 'ativo', 'qtd', 'preco', 'centavos', 'moeda'], cor: '#9333ea', w: [140, 110, 200, 50, 80, 70, 90, 90, 60], txt: [2, 3, 4, 5, 9] },
  Cotacoes: { cab: ['cod', 'preco', 'ant', 'ts', 'moeda'], cor: '#be123c', w: [80, 90, 90, 140, 70], txt: [1, 5] },
  Fundos: { cab: ['cnpj', 'dt', 'cota'], cor: '#4d7c0f', w: [150, 90, 110], txt: [1] },
  Resultados: { cab: ['ts', 'login', 'turma', 'trimestre', 'disc', 'cod', 'atividade', 'acertos', 'erros', 'pct', 'concluido', 'pontos', 'dur', 'serie', 'sid', 'progresso', 'dinheiro'], cor: '#15803d', w: [150, 110, 80, 80, 120, 100, 240, 70, 70, 70, 80, 80, 70, 80, 160, 80, 80], txt: [2, 3, 5, 6, 7, 14, 15] }
};

// ---------- utilitários ----------
function eb_escala_(m) { return EB_CRIPTO.indexOf(m) >= 0 ? 100000000 : 100; }
function eb_maxV_(m) { return EB_CRIPTO.indexOf(m) >= 0 ? 1e14 : 100000000; }
function eb_sha_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8), o = '';
  for (var i = 0; i < b.length; i++) { var x = (b[i] < 0 ? b[i] + 256 : b[i]).toString(16); o += (x.length < 2 ? '0' : '') + x; }
  return o;
}
function eb_hashInicial_(login) { return eb_sha_(login + ':' + EB_SENHA_INICIAL + ':edu'); }
// Só alunos têm conta/token; mestre/teste/mainara NÃO usam o servidor de contas (recusados em todas as ações).
function eb_loginOk_(x) { var l = String(x || '').toLowerCase().trim(); return EB_ALUNO.test(l) ? l : ''; }
function eb_turma_(login) { return EB_ALUNO.test(login) ? login.replace(/^\d+/, '') : ''; }
function eb_anon_(login) { return EB_ALUNO.test(login || '') ? 'Aluno nº ' + login.match(/^\d+/)[0] + ' · ' + eb_turma_(login) : ''; }
function eb_erro_(m, extra) { var o = { ok: 0, erro: m }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
function eb_int_(x, min, max) { if (x === '' || x == null) return NaN; var n = Number(x); if (!isFinite(n) || Math.floor(n) !== n || n < min || n > max) return NaN; return n; }
function eb_t_(s, n) { return String(s == null ? '' : s).replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, n); }
function eb_txt_(s) { s = String(s == null ? '' : s); return /^[=+\-@]/.test(s) ? "'" + s : s; }   // evita fórmula em célula
function eb_r6_(x) { return Math.round(x * 1e6) / 1e6; }
function eb_lock_(fn) {
  var l = LockService.getScriptLock();
  try { l.waitLock(30000); } catch (e) { return eb_erro_('Servidor ocupado, tente de novo em instantes.'); }
  try { return fn(); } finally { l.releaseLock(); }
}
function eb_aba_(nome) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(nome);
  var d = EB_ABAS[nome];
  if (sh) {
    if (d && /^(Posicoes|Aplicacoes|Ordens)$/.test(nome)) {
      try {
        if (sh.getLastRow() === 0 || String(sh.getRange(1, 1).getValue()) !== d.cab[0]) {
          sh.insertRowBefore(1);
          sh.getRange(1, 1, 1, d.cab.length).setValues([d.cab]).setFontWeight('bold').setBackground(d.cor).setFontColor('#ffffff');
          sh.setFrozenRows(1);
        }
      } catch (e) { }
    }
    return sh;
  }
  sh = ss.insertSheet(nome);
  sh.getRange(1, 1, 1, d.cab.length).setValues([d.cab]).setFontWeight('bold').setBackground(d.cor).setFontColor('#ffffff');
  sh.setFrozenRows(1);
  for (var i = 0; i < d.cab.length; i++) sh.setColumnWidth(i + 1, d.w[i] || 80);
  (d.txt || []).forEach(function (c) { try { sh.getRange(2, c, Math.max(sh.getMaxRows() - 1, 1), 1).setNumberFormat('@'); } catch (e) { } });
  return sh;
}
function eb_find_(sh, col, key) {
  var n = sh.getLastRow(); if (n < 2) return 0;
  var v = sh.getRange(2, col, n - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][0]) === key) return i + 2;
  return 0;
}
function eb_log_(login, evento, detalhe) {
  try { eb_aba_('Logs').appendRow([new Date(), login || '', evento, eb_txt_(detalhe || '')]); } catch (e) { }
}
function eb_msgBloq_(ate) { var m = Math.max(1, Math.ceil((ate - Date.now()) / 60000)); return eb_erro_('Muitas tentativas erradas. Tente de novo em ' + m + ' min.', { bloqueado: 1, ate: ate }); }

// ---------- Config (colunas D:F da aba Config, ao lado das escolas liberadas na coluna A) ----------
function eb_cfgGarante_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName('Config')) liberadas_(ss);
  var sh = ss.getSheetByName('Config');
  if (String(sh.getRange(1, 4).getValue()) !== 'chave') {
    sh.getRange(1, 4, 1, 3).setValues([['chave', 'valor', 'observação']]).setFontWeight('bold');
    sh.getRange(2, 5, 6, 1).setNumberFormat('@');
    sh.getRange(2, 4, 5, 3).setValues([
      ['spread_pct', '2', 'Spread do câmbio em % para moedas (compra e venda)'],
      ['spread_cripto_pct', '2', 'Spread do câmbio em % para criptomoedas'],
      ['tri1_fim', '31/05', 'Último dia do 1º trimestre (dd/mm)'],
      ['tri2_fim', '31/08', 'Último dia do 2º trimestre (dd/mm)'],
      ['total_geral', '0', 'Total de atividades do catálogo (0 = desconhecido). Opcional: linhas total_<disciplina>, ex. total_matematica']]);
    sh.setColumnWidth(4, 150); sh.setColumnWidth(6, 420);
  }
  return sh;
}
function eb_cfg_() {
  var sh = eb_cfgGarante_(), n = sh.getLastRow(), o = {};
  if (n >= 2) sh.getRange(2, 4, n - 1, 2).getValues().forEach(function (r) { if (r[0] !== '') o[String(r[0])] = r[1]; });
  return o;
}
function eb_md_(v, def) {
  if (v instanceof Date) return (v.getMonth() + 1) * 100 + v.getDate();
  var m = String(v == null ? '' : v).match(/^(\d{1,2})\/(\d{1,2})/);
  return m ? (+m[2]) * 100 + (+m[1]) : def;
}
function eb_trimestre_(d) {
  var c = eb_cfg_(), md = Number(Utilities.formatDate(d, TZ, 'MM')) * 100 + Number(Utilities.formatDate(d, TZ, 'dd'));
  if (md <= eb_md_(c.tri1_fim, 531)) return 1;
  if (md <= eb_md_(c.tri2_fim, 831)) return 2;
  return 3;
}
function eb_spread_(cfg, m) {
  var k = EB_CRIPTO.indexOf(m) >= 0 ? 'spread_cripto_pct' : 'spread_pct', d = 2, s = Number(cfg[k]);
  if (!isFinite(s) || s < 0 || s > 20) s = d;
  return s / 100;
}

// ---------- câmbio: fiduciárias = AwesomeAPI (reserva open.er-api.com); cripto tambem AwesomeAPI (reserva Binance data-api) ----------
// Sem tabela inventada: se nenhuma fonte responder, usa a última cotação boa (até 24 h); depois disso fonte='indisponivel'.
function eb_busca_(url, lista) {
  var tx = {}, n = 0;
  try {
    var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      var j = JSON.parse(r.getContentText());
      lista.forEach(function (m) { var o = j[m + 'BRL'], b = o ? Number(o.bid) : NaN; if (isFinite(b) && b > 0) { tx[m] = Math.round(b * 1e8) / 1e8; n++; } });
    }
  } catch (e) { }
  return { tx: tx, n: n };
}
function eb_buscaBinance_(lista) {
  var tx = {}, n = 0;
  try {
    var syms = lista.map(function (m) { return m + 'BRL'; });
    var r = UrlFetchApp.fetch('https://data-api.binance.vision/api/v3/ticker/price?symbols=' + encodeURIComponent(JSON.stringify(syms)), { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      JSON.parse(r.getContentText()).forEach(function (o) { var m = String(o.symbol).replace(/BRL$/, ''), b = Number(o.price); if (lista.indexOf(m) >= 0 && isFinite(b) && b > 0) { tx[m] = Math.round(b * 1e8) / 1e8; n++; } });
    }
  } catch (e) { }
  return { tx: tx, n: n };
}
function eb_buscaCoinGecko_(lista) {
  var tx = {}, n = 0, ids = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', XRP: 'ripple', DOGE: 'dogecoin', USDT: 'tether' };
  try {
    var qs = lista.map(function (m) { return ids[m]; }).filter(function (x) { return x; }).join(',');
    var r = UrlFetchApp.fetch('https://api.coingecko.com/api/v3/simple/price?vs_currencies=brl&ids=' + qs, { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      var j = JSON.parse(r.getContentText());
      lista.forEach(function (m) { var o = j[ids[m]], b = o ? Number(o.brl) : NaN; if (isFinite(b) && b > 0) { tx[m] = Math.round(b * 1e8) / 1e8; n++; } });
    }
  } catch (e) { }
  return { tx: tx, n: n };
}
function eb_buscaCoinbase_(lista) {
  var tx = {}, n = 0;
  try {
    var brl = eb_buscaOpenEr_(['USD']).tx.USD;
    if (!brl) return { tx: tx, n: 0 };
    lista.forEach(function (m) {
      try {
        var r = UrlFetchApp.fetch('https://api.coinbase.com/v2/prices/' + m + '-USD/spot', { muteHttpExceptions: true });
        if (r.getResponseCode() === 200) { var p = Number(JSON.parse(r.getContentText()).data.amount); if (isFinite(p) && p > 0) { tx[m] = Math.round(p * brl * 1e8) / 1e8; n++; } }
      } catch (e) { }
    });
  } catch (e) { }
  return { tx: tx, n: n };
}
function eb_buscaOpenEr_(lista) {
  var tx = {}, n = 0;
  try {
    var r = UrlFetchApp.fetch('https://open.er-api.com/v6/latest/USD', { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      var j = JSON.parse(r.getContentText()), R = j.rates || {}, brl = Number(R.BRL);
      lista.forEach(function (m) { var x = m === 'USD' ? 1 : Number(R[m]), v = (isFinite(brl) && brl > 0 && isFinite(x) && x > 0) ? brl / x : NaN; if (isFinite(v) && v > 0) { tx[m] = Math.round(v * 1e8) / 1e8; n++; } });
    }
  } catch (e) { }
  return { tx: tx, n: n };
}
// buscas: lista de [nome, função(lista)] em ordem de preferência; completa com a seguinte o que faltar.
function eb_grupo_(chave, buscas, lista, ttl) {
  var c = CacheService.getScriptCache(), s = c.get(chave);
  if (s) { try { return JSON.parse(s); } catch (e) { } }
  var p = PropertiesService.getScriptProperties(), res = { taxas: {}, ts: Date.now(), fonte: 'indisponivel', fontes: {} };
  var falta = lista.slice(), usadas = [];
  buscas.forEach(function (bf) {
    if (!falta.length) return;
    var b = bf[1](falta), antes = falta.length;
    falta = falta.filter(function (m) { if (b.tx[m]) { res.taxas[m] = b.tx[m]; res.fontes[m] = bf[0]; return false; } return true; });
    if (falta.length < antes) usadas.push(bf[0]);
  });
  var ult = null; try { ult = JSON.parse(p.getProperty(chave + '_ok') || 'null'); } catch (e) { }
  if (ult && Date.now() - ult.ts > 24 * 3600000) ult = null;
  if (!falta.length) {
    res.fonte = usadas.join('+');
    try { p.setProperty(chave + '_ok', JSON.stringify(res)); } catch (e) { }
  } else if (ult) {
    falta.forEach(function (m) { if (ult.taxas && ult.taxas[m]) { res.taxas[m] = ult.taxas[m]; res.fontes[m] = 'anterior'; res.ts = Math.min(res.ts, ult.ts); } });
    res.fonte = Object.keys(res.taxas).length === lista.length ? (usadas.length ? usadas.join('+') + '/anterior' : 'anterior') : 'indisponivel';
  }
  try { c.put(chave, JSON.stringify(res), res.fonte === 'indisponivel' ? 60 : ttl); } catch (e) { }
  return res;
}
// {taxas:{USD:{t:5.42,e:100},BTC:{t:350000,e:100000000}},ts,fonte}
function eb_taxas_() {
  var f = eb_grupo_('eb_tx_f', [['AwesomeAPI', function (l) { return eb_busca_(EB_URL_FIAT, l); }], ['open.er-api', eb_buscaOpenEr_]], EB_FIAT, 600), c = eb_grupo_('eb_tx_c', [['AwesomeAPI', function (l) { return eb_busca_(EB_URL_CRIPTO, l); }], ['Coinbase', eb_buscaCoinbase_], ['CoinGecko', eb_buscaCoinGecko_], ['Binance', eb_buscaBinance_]], EB_CRIPTO, 60), out = {};
  EB_FIAT.forEach(function (m) { out[m] = { t: f.taxas[m] || null, e: 100 }; });
  EB_CRIPTO.forEach(function (m) { out[m] = { t: c.taxas[m] || null, e: 100000000 }; });
  return { taxas: out, ts: Math.min(f.ts, c.ts), fonte: f.fonte === c.fonte ? f.fonte : (f.fonte + '/' + c.fonte), fontes: Object.assign({}, f.fontes, c.fontes) };
}
function eb_taxasResp_() { var t = eb_taxas_(); return { ok: 1, taxas: t.taxas, ts: t.ts, fonte: t.fonte, fontes: t.fontes, escala: { fiduciaria: 100, cripto: 100000000 } }; }

// ---------- entrada ----------
function eb_(p) {
  var o;
  try { o = eb_dispatch_(p || {}); }
  catch (err) { try { Logger.log('EduBank erro: ' + (err && err.message)); } catch (x) { } o = eb_erro_('Erro no servidor. Tente de novo.'); }
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function eb_dispatch_(p) {
  var a = String(p.acao || '');
  if (a === 'entrar') return eb_entrar_(p);
  if (a === 'taxas') return eb_taxasResp_();
  if (a === 'profreset') return eb_profReset_(p);
  if (a.indexOf('prof') === 0) return eb_profAcao_(p);
  if (a === 'senha') return eb_erro_('A senha de login é fixa e não pode ser alterada. Só a senha do EduBank pode ser criada ou trocada.');
  var au = eb_auth_(p);
  if (!au.ok) return au;
  var l = au.login;
  if (a === 'quem') return { ok: 1, turma: eb_turma_(l) };
  if (a === 'bancostat') return eb_bancoStat_(l);
  if (a === 'bancosenha') return eb_bancoSenha_(p, l);
  if (a === 'nuvemsalvar') return eb_nuvemSalvar_(p, l);
  if (a === 'nuvemcarregar') return eb_nuvemCarregar_(p, l);
  if (a === 'carteira') return eb_carteiraResp_(l);
  if (a === 'cambio') return eb_cambio_(p, l);
  if (a === 'transferir') return eb_transferir_(p, l);
  if (a === 'extrato') return eb_extratoResp_(l);
  if (a === 'resultado') return eb_resultado_(p, l);
  if (a === 'boletim') return eb_boletimResp_(l);
  if (a === 'moedas') return eb_moedasResp_(l);
  if (a === 'trocarmoedas') return eb_trocarMoedas_(p, l);
  if (a === 'classificacao') return eb_classifResp_(l);
  if (a === 'receber') return eb_receber_(l);
  if (a === 'receberack') return eb_receberAck_(p, l);
  if (a === 'ativos') return eb_i_ativosResp_();
  if (a === 'historico') return eb_i_historico_(p);
  if (a === 'serie') return eb_i_serie_(p);
  if (a === 'rfprodutos') return eb_i_rfProdutosResp_();
  if (a === 'tdtitulos') return eb_i_tdResp_();
  if (a === 'fundos') return eb_i_fundosResp_();
  if (a === 'rfaplicar') return eb_i_aplicar_(p, l);
  if (a === 'rfresgatar') return eb_i_resgatar_(p, l);
  if (a === 'invcomprar') return eb_i_comprar_(p, l);
  if (a === 'invvender') return eb_i_vender_(p, l);
  if (a === 'invcarteira') return eb_i_carteira_(l);
  return eb_erro_('Ação desconhecida.');
}

// ---------- sessões ----------
function eb_auth_(p) {
  var login = eb_loginOk_(p.login), t = String(p.t || ''), inv = eb_erro_('Sessão inválida. Entre de novo.', { relogin: 1 });
  if (!login || !/^[A-Za-z0-9]{24}$/.test(t)) return inv;
  var th = eb_sha_(t), c = CacheService.getScriptCache(), cv = c.get('s_' + th), agora = Date.now();
  if (cv) { var q = cv.split('|'); if (q[0] === login && Number(q[1]) > agora) return { ok: 1, login: login, th: th }; }
  var sh = eb_aba_('Sessoes'), n = sh.getLastRow();
  if (n >= 2) {
    var v = sh.getRange(2, 1, n - 1, 3).getValues();
    for (var i = v.length - 1; i >= 0; i--) {
      if (String(v[i][0]) === th) {
        if (String(v[i][1]) === login && Number(v[i][2]) > agora) { try { c.put('s_' + th, login + '|' + v[i][2], 21600); } catch (e) { } return { ok: 1, login: login, th: th }; }
        break;
      }
    }
  }
  return inv;
}
function eb_sessoesApagar_(login, manter) {   // chamar com lock
  var sh = eb_aba_('Sessoes'), n = sh.getLastRow(), ks = [], c = 0;
  if (n < 2) return 0;
  var v = sh.getRange(2, 1, n - 1, 2).getValues();
  for (var i = v.length - 1; i >= 0; i--) if (String(v[i][1]) === login && String(v[i][0]) !== manter) { ks.push('s_' + v[i][0]); sh.deleteRow(i + 2); c++; }
  var cache = CacheService.getScriptCache();
  for (var j = 0; j < ks.length; j += 100) cache.removeAll(ks.slice(j, j + 100));
  return c;
}
function eb_limpaSessoes_(sh) {   // chamar com lock
  var n = sh.getLastRow(); if (n < 2) return;
  var v = sh.getRange(2, 1, n - 1, 3).getValues(), agora = Date.now();
  for (var i = v.length - 1; i >= 0; i--) if (Number(v[i][2]) <= agora) sh.deleteRow(i + 2);
}

// ---------- contas ----------
// Senha de LOGIN é FIXA (2026.2026) e não pode ser alterada; colunas salt/hash/trocar da aba Contas ficam sem uso.
function eb_confere_(login, r, h) { return h === eb_hashInicial_(login); }
function eb_entrar_(p) {
  var login = eb_loginOk_(p.login), h = String(p.h || '').toLowerCase();
  if (!login || !/^[0-9a-f]{64}$/.test(h)) return eb_erro_('Login ou senha incorretos.');
  var cache = CacheService.getScriptCache();
  return eb_lock_(function () {
    var sh = eb_aba_('Contas'), row = eb_find_(sh, 1, login), agora = Date.now(), r;
    if (row) { r = sh.getRange(row, 1, 1, 9).getValues()[0]; var ate = Number(r[6]) || 0; if (ate > agora) return eb_msgBloq_(ate); }
    else { var cb = Number(cache.get('blk_' + login)) || 0; if (cb > agora) return eb_msgBloq_(cb); r = [login, eb_turma_(login), '', '', 1, 0, '', '', '']; }
    if (!eb_confere_(login, r, h)) {
      var rest, bl = 0;
      if (row) {
        var e = (Number(r[5]) || 0) + 1;
        if (e >= EB_MAX_ERROS) { bl = agora + EB_BLOQ_MIN * 60000; e = 0; }
        sh.getRange(row, 6, 1, 2).setValues([[e, bl || '']]); rest = EB_MAX_ERROS - e;
      } else {
        var n = (Number(cache.get('bad_' + login)) || 0) + 1;
        if (n >= EB_MAX_ERROS) { bl = agora + EB_BLOQ_MIN * 60000; cache.put('blk_' + login, String(bl), EB_BLOQ_MIN * 60); cache.remove('bad_' + login); }
        else cache.put('bad_' + login, String(n), EB_BLOQ_MIN * 60);
        rest = EB_MAX_ERROS - n;
      }
      eb_log_(login, 'falha', bl ? 'bloqueado por ' + EB_BLOQ_MIN + ' min' : 'senha incorreta');
      if (bl) return eb_msgBloq_(bl);
      return eb_erro_('Login ou senha incorretos. Restam ' + rest + ' tentativa(s).');
    }
    if (!row) sh.appendRow([login, eb_turma_(login), '', '', 0, 0, '', new Date(), new Date(), '', '']);
    else sh.getRange(row, 5, 1, 5).setValues([[0, 0, '', r[7], new Date()]]);
    var token = (eb_sha_(Utilities.getUuid() + Date.now() + Math.random())).slice(0, 24), th = eb_sha_(token), exp = agora + EB_SESSAO_DIAS * 86400000;
    var ss = eb_aba_('Sessoes'); if (ss.getLastRow() > 300) eb_limpaSessoes_(ss);
    ss.appendRow([th, login, exp, new Date()]);
    try { cache.put('s_' + th, login + '|' + exp, 21600); } catch (e) { }
    eb_log_(login, 'entrar', 'ok');
    return { ok: 1, token: token, trocar: 0, turma: eb_turma_(login) };
  });
}
// ---------- senha do EduBank (única senha alterável; só para transferir) ----------
// hash do cliente = SHA-256 hex de (login + ':' + senha + ':bank'); servidor guarda sha256(hash + salt).
function eb_bHex_(x) { x = String(x == null ? '' : x).toLowerCase(); return /^[0-9a-f]{64}$/.test(x) ? x : ''; }
function eb_bTem_(r) { return !!(r && r[10]); }
function eb_bConfere_(r, hb) { return eb_sha_(hb + String(r[9])) === String(r[10]); }
function eb_msgBloqBanco_(ate) { var m = Math.max(1, Math.ceil((ate - Date.now()) / 60000)); return eb_erro_('Muitas tentativas erradas na senha do EduBank. Transferências bloqueadas por ' + m + ' min.', { bloqueado: 1, ate: ate }); }
// chamar com lock; ok=true zera o contador; senão devolve o erro a responder
function eb_bTentativa_(login, ok) {
  var c = CacheService.getScriptCache(), agora = Date.now();
  if (ok) { c.remove('bbad_' + login); return null; }
  var n = (Number(c.get('bbad_' + login)) || 0) + 1;
  if (n >= EB_MAX_ERROS) {
    var bl = agora + EB_BLOQ_MIN * 60000;
    c.put('bblk_' + login, String(bl), EB_BLOQ_MIN * 60); c.remove('bbad_' + login);
    eb_log_(login, 'falha', 'senha do EduBank: bloqueado por ' + EB_BLOQ_MIN + ' min');
    return eb_msgBloqBanco_(bl);
  }
  c.put('bbad_' + login, String(n), EB_BLOQ_MIN * 60);
  eb_log_(login, 'falha', 'senha do EduBank incorreta');
  return eb_erro_('Senha do EduBank incorreta. Restam ' + (EB_MAX_ERROS - n) + ' tentativa(s).');
}
function eb_bBloq_(login) { var b = Number(CacheService.getScriptCache().get('bblk_' + login)) || 0; return b > Date.now() ? eb_msgBloqBanco_(b) : null; }
function eb_bancoStat_(login) {
  var sh = eb_aba_('Contas'), row = eb_find_(sh, 1, login);
  return { ok: 1, tem: eb_bTem_(row ? sh.getRange(row, 1, 1, 11).getValues()[0] : null) };
}
function eb_bancoSenha_(p, login) {
  var novo = eb_bHex_(p.h_novo), atual = eb_bHex_(p.h_atual);
  if (!novo) return eb_erro_('Senha do EduBank inválida.');
  return eb_lock_(function () {
    var sh = eb_aba_('Contas'), row = eb_find_(sh, 1, login);
    if (!row) return eb_erro_('Conta não encontrada.');
    var bq = eb_bBloq_(login); if (bq) return bq;
    var r = sh.getRange(row, 1, 1, 11).getValues()[0], tem = eb_bTem_(r);
    if (tem) {
      if (!atual) return eb_erro_('Informe a senha atual do EduBank.');
      if (!eb_bConfere_(r, atual)) return eb_bTentativa_(login, false);
      eb_bTentativa_(login, true);
      if (novo === atual) return eb_erro_('A nova senha deve ser diferente da atual.');
    }
    var salt = eb_sha_(Utilities.getUuid() + Date.now()).slice(0, 16);
    if (!String(sh.getRange(1, 10).getValue())) sh.getRange(1, 10, 1, 2).setValues([['banco_salt', 'banco_hash']]);
    sh.getRange(row, 10, 1, 2).setValues([[salt, eb_sha_(novo + salt)]]);
    eb_log_(login, 'banco', tem ? 'senha do EduBank trocada' : 'senha do EduBank criada');
    return { ok: 1 };
  });
}
function eb_limpaFalhas_(login) { var c = CacheService.getScriptCache(); c.remove('bad_' + login); c.remove('blk_' + login); }
function eb_limpaFalhasBanco_(login) { var c = CacheService.getScriptCache(); c.remove('bbad_' + login); c.remove('bblk_' + login); }

// ---------- senha do PROFESSOR (guardada só em PropertiesService: sha256(hp+salt); hp = SHA-256 hex de 'prof:'+senha) ----------
function eb_logL_(l, e, d) { eb_lock_(function () { eb_log_(l, e, d); return 0; }); }   // só fora de lock
function eb_hpDe_(senha) { return eb_sha_('prof:' + senha); }
function eb_profTem_() { return !!PropertiesService.getScriptProperties().getProperty('prof_hash'); }
// devolve null se a senha confere; senão {ok:0,erro}
function eb_profCheck_(hp) {
  var c = CacheService.getScriptCache(), p = PropertiesService.getScriptProperties(), agora = Date.now();
  if (!p.getProperty('prof_hash')) return eb_erro_('Defina a senha do professor primeiro (menu EduBank > Definir senha do professor).', { semProf: 1 });
  var b = Number(c.get('pblk')) || 0;
  if (b > agora) return eb_erro_('Muitas tentativas erradas. Tente de novo em ' + Math.max(1, Math.ceil((b - agora) / 60000)) + ' min.', { bloqueado: 1 });
  hp = eb_bHex_(hp);
  if (hp && eb_sha_(hp + p.getProperty('prof_salt')) === p.getProperty('prof_hash')) { c.remove('pbad'); return null; }
  var n = (Number(c.get('pbad')) || 0) + 1;
  if (n >= EB_MAX_ERROS) { c.put('pblk', String(agora + EB_BLOQ_MIN * 60000), EB_BLOQ_MIN * 60); c.remove('pbad'); eb_logL_('', 'falha', 'senha do professor: bloqueado por ' + EB_BLOQ_MIN + ' min'); return eb_erro_('Muitas tentativas erradas. Bloqueado por ' + EB_BLOQ_MIN + ' min.', { bloqueado: 1 }); }
  c.put('pbad', String(n), EB_BLOQ_MIN * 60);
  eb_logL_('', 'falha', 'senha do professor incorreta');
  return eb_erro_('Senha do professor incorreta. Restam ' + (EB_MAX_ERROS - n) + ' tentativa(s).');
}
// define/troca; 1a vez sem atual; depois exige a atual correta
function eb_profDefinir_(hpNovo, hpAtual) {
  hpNovo = eb_bHex_(hpNovo); if (!hpNovo) return eb_erro_('Senha inválida.');
  if (eb_profTem_()) { var e = eb_profCheck_(hpAtual); if (e) return e; }
  var p = PropertiesService.getScriptProperties(), salt = eb_sha_(Utilities.getUuid() + Date.now()).slice(0, 16);
  p.setProperty('prof_salt', salt); p.setProperty('prof_hash', eb_sha_(hpNovo + salt));
  eb_logL_('', 'prof', 'senha do professor definida/alterada');
  return { ok: 1 };
}
// ação web profreset: {acao:'profreset',alvo:'login'|'todas',hp}
function eb_profReset_(p) {
  var e = eb_profCheck_(p.hp); if (e) return e;
  var alvo = String(p.alvo || '').toLowerCase().trim();
  if (alvo === 'todas') return eb_resetTodasCore_();
  var login = eb_loginOk_(alvo); if (!login) return eb_erro_('Login inválido.');
  return eb_resetCore_(login);
}

// ---------- painel do professor (profentrar/profturmas/profturma/profaluno/profconteudos/profconteudo/profdesbloquear/profzerar) ----------
// Todas exigem hp (mesma checagem/bloqueio do profreset). Nunca devolvem hash, salt, token nem senha.
var EB_ESCOLAS = { cla: 'Clarito', xus: 'Schuster' };
function eb_turmaOk_(t) { t = String(t || '').toLowerCase().trim(); return /^[a-z]{3}\d[a-z]$/.test(t) ? t : ''; }
function eb_numLogin_(l) { return parseInt(l, 10) || 0; }
function eb_msAte_(v) { return Number(v) || 0; }
// {login:{key:{disc,cod,atividade,tri,ts,pct,melhor,tent,conc,pts}}} lendo Resultados uma vez
function eb_profResultados_() {
  var res = {}, sh = eb_aba_('Resultados'), n = sh.getLastRow();
  if (n < 2) return res;
  sh.getRange(2, 1, n - 1, 12).getValues().forEach(function (r, i) {
    var lg = String(r[1]); if (!EB_ALUNO.test(lg)) return;
    var key = r[4] + '|' + (r[5] || r[6] || ('#' + i)), o = res[lg] || (res[lg] = {}), c = o[key];
    if (!c) c = o[key] = { disc: String(r[4]), cod: String(r[5] || r[6] || ''), atividade: String(r[6] || r[5] || ''), tri: 1, ts: -1, pct: null, melhor: null, tent: 0, conc: 0, pts: 0, ptsAll: 0 };
    var pc = (r[9] === '' || r[9] == null) ? null : Number(r[9]), ts = new Date(r[0]).getTime() || 0;
    if (pc !== null && !isFinite(pc)) pc = null;
    c.tent++;
    if (pc !== null && (c.melhor === null || pc > c.melhor)) c.melhor = pc;
    if (ts >= c.ts) { c.ts = ts; c.pct = pc; c.tri = Number(r[3]) || 1; c.atividade = String(r[6] || r[5] || ''); }
    if (Number(r[10]) === 1) c.conc = 1;
    var v = Number(r[11]); if (!isFinite(v) || v <= 0) v = Number(r[7]); if (!isFinite(v) || v < 0) v = 0;
    if (v > c.ptsAll) c.ptsAll = v;
    if (Number(r[10]) === 1 && v > c.pts) c.pts = v;   // moedas: só linhas concluídas
  });
  return res;
}
function eb_profResumo_(o) {   // o = {key:{...}} de um aluno (ou undefined)
  var n = 0, s = 0, nn = 0, conc = 0, g = 0;
  if (o) Object.keys(o).forEach(function (k) { var c = o[k]; n++; if (c.pct !== null) { s += c.pct; nn++; } conc += c.conc; g += Math.floor(c.pts); });
  return { n: n, media: nn ? eb_round1_(s / nn / 10) : null, conc: conc, ganhas: g };
}
function eb_profTrocadas_() {
  var sh = eb_aba_('Moedas'), n = sh.getLastRow(), t = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 6).getValues().forEach(function (r) { if (String(r[3]) === 'troca') t[String(r[1])] = (t[String(r[1])] || 0) + (Number(r[4]) || 0); });
  return t;
}
function eb_profContas_() {   // {login:{turma,bloq,banco,ultimo}}
  var sh = eb_aba_('Contas'), n = sh.getLastRow(), o = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 11).getValues().forEach(function (r) {
    var lg = String(r[0]); if (!EB_ALUNO.test(lg)) return;
    var u = r[8] ? new Date(r[8]).getTime() : 0;
    o[lg] = { bloq: eb_msAte_(r[6]) > Date.now() ? 1 : 0, banco: r[10] ? 1 : 0, ultimo: isFinite(u) ? u : 0 };
  });
  return o;
}
function eb_profBloqCache_(login) {
  var c = CacheService.getScriptCache(), a = Date.now();
  return (Number(c.get('blk_' + login)) || 0) > a || (Number(c.get('bblk_' + login)) || 0) > a ? 1 : 0;
}
function eb_profLogins_(turma, contas, res) {
  var seen = {}, out = [];
  [contas, res].forEach(function (m) { Object.keys(m).forEach(function (l) { if (eb_turma_(l) === turma && !seen[l]) { seen[l] = 1; out.push(l); } }); });
  out.sort(function (a, b) { return eb_numLogin_(a) - eb_numLogin_(b); });
  return out;
}
function eb_profAcao_(p) {
  var a = String(p.acao || ''), e = eb_profCheck_(p.hp); if (e) return e;
  if (a === 'profentrar') return { ok: 1 };
  if (a === 'profturmas') return eb_profTurmas_();
  if (a === 'profturma') return eb_profTurma_(p);
  if (a === 'profaluno') return eb_profAluno_(p);
  if (a === 'profconteudos') return eb_profConteudos_(p);
  if (a === 'profconteudo') return eb_profConteudo_(p);
  if (a === 'profdash') return eb_profDash_(p);
  if (a === 'profdesbloquear') { var l1 = eb_loginOk_(p.login); return l1 ? eb_desbloquearCore_(l1) : eb_erro_('Login inválido.'); }
  if (a === 'profzerar') { var l2 = eb_loginOk_(p.login); return l2 ? eb_zerarCore_(l2) : eb_erro_('Login inválido.'); }
  if (a === 'profenviar') return eb_profEnviar_(p);
  if (a === 'profenviarturma') return eb_profEnviarTurma_(p);
  return eb_erro_('Ação desconhecida.');
}
// {ok,escolas:[{cod,nome,turmas:[{turma,ano,letra,alunos,ativos}]}]}
function eb_profTurmas_() {
  var contas = eb_profContas_(), res = eb_profResultados_(), por = {};
  [contas, res].forEach(function (m, k) {
    Object.keys(m).forEach(function (l) {
      var t = eb_turma_(l), o = por[t] || (por[t] = { all: {}, ativos: {} });
      o.all[l] = 1; if (k === 0) o.ativos[l] = 1;
    });
  });
  var esc = {};
  Object.keys(por).forEach(function (t) {
    var cod = t.slice(0, 3), e = esc[cod] || (esc[cod] = { cod: cod, nome: EB_ESCOLAS[cod] || cod.toUpperCase(), turmas: [] });
    e.turmas.push({ turma: t, ano: Number(t.charAt(3)), letra: t.charAt(4), alunos: Object.keys(por[t].all).length, ativos: Object.keys(por[t].ativos).length });
  });
  var lista = Object.keys(esc).sort().map(function (k) {
    esc[k].turmas.sort(function (x, y) { return (x.ano - y.ano) || (x.letra < y.letra ? -1 : 1); });
    return esc[k];
  });
  return { ok: 1, escolas: lista };
}
// {ok,turma,alunos:[{login,num,n,media,conc,ganhas,saldo,conta,banco,bloq,ultimo}]}
function eb_profTurma_(p) {
  var turma = eb_turmaOk_(p.turma); if (!turma) return eb_erro_('Turma inválida.');
  var contas = eb_profContas_(), res = eb_profResultados_(), troc = eb_profTrocadas_();
  var alunos = eb_profLogins_(turma, contas, res).map(function (l) {
    var r = eb_profResumo_(res[l]), c = contas[l];
    return { login: l, num: eb_numLogin_(l), n: r.n, media: r.media, conc: r.conc, ganhas: r.ganhas, saldo: Math.max(0, r.ganhas - (troc[l] || 0)), conta: c ? 1 : 0, banco: c ? c.banco : 0, bloq: (c && c.bloq) || eb_profBloqCache_(l) ? 1 : 0, ultimo: c ? c.ultimo : 0 };
  });
  return { ok: 1, turma: turma, alunos: alunos };
}
// Relatório detalhado por atividade que o aluno abriu: [{cod,atividade,disc,tri,tent,ts,acertos,erros,pct,nota,pontos,dinheiro,moedas,progresso,progEst,concluido,melhor:{...},ultima:{...}}]
// Campos do nível superior = MELHOR tentativa (maior pct; empate: mais pontos); progresso = maior entre as tentativas; concluido = alguma tentativa concluída; ts = data da última tentativa.
// dinheiro em CENTAVOS (null se o cliente nunca enviou); progresso 0-100 (vazio: 100 se concluída, senão estimado por acertos+erros, máx. 99, progEst=1).
function eb_detalheDe_(login) {
  var sh = eb_aba_('Resultados'), n = sh.getLastRow(), m = {};
  if (n < 2) return [];
  var nc = Math.max(15, Math.min(17, sh.getLastColumn()));
  sh.getRange(2, 1, n - 1, nc).getValues().forEach(function (r, i) {
    if (String(r[1]) !== login) return;
    var key = r[4] + '|' + (r[5] || r[6] || ('#' + i)), ts = new Date(r[0]).getTime() || 0;
    var pc = (r[9] === '' || r[9] == null) ? null : Number(r[9]); if (pc !== null && !isFinite(pc)) pc = null;
    var ac = Number(r[7]) || 0, er = Number(r[8]) || 0, conc = Number(r[10]) === 1 ? 1 : 0, pt = Number(r[11]); if (!isFinite(pt) || pt < 0) pt = 0;
    var pg = (r.length > 15 && r[15] !== '' && r[15] != null && isFinite(Number(r[15]))) ? Math.max(0, Math.min(100, Number(r[15]))) : null;
    var dn = (r.length > 16 && r[16] !== '' && r[16] != null && isFinite(Number(r[16]))) ? Math.max(0, Number(r[16])) : null;
    var est = 0;
    if (pg === null) { if (conc) pg = 100; else { pg = (ac + er) > 0 ? Math.min(99, ac + er) : 0; est = 1; } }
    var t = { ts: ts, tri: Number(r[3]) || 1, acertos: ac, erros: er, pct: pc, nota: pc === null ? null : eb_round1_(pc / 10), pontos: pt, dinheiro: dn, progresso: pg, progEst: est, concluido: conc };
    var o = m[key];
    if (!o) o = m[key] = { cod: String(r[5] || ''), atividade: String(r[6] || r[5] || ''), disc: String(r[4]), tent: 0, ts: -1, tri: 1, melhor: null, ultima: null, prog: 0, progEst: 1, conc: 0, moedas: 0 };
    o.tent++;
    if (ts >= o.ts) { o.ts = ts; o.tri = t.tri; o.ultima = t; o.atividade = String(r[6] || r[5] || o.atividade); o.cod = String(r[5] || o.cod); }
    if (!o.melhor || (t.pct === null ? -1 : t.pct) > (o.melhor.pct === null ? -1 : o.melhor.pct) || ((t.pct === o.melhor.pct) && t.pontos > o.melhor.pontos)) o.melhor = t;
    if (t.progresso > o.prog || (t.progresso === o.prog && !t.progEst)) { o.prog = t.progresso; o.progEst = t.progEst; }
    if (conc) { o.conc = 1; var v = pt > 0 ? pt : ac; if (v > o.moedas) o.moedas = v; }
  });
  return Object.keys(m).map(function (k) {
    var o = m[k], b = o.melhor || o.ultima;
    return { cod: o.cod, atividade: o.atividade, disc: o.disc, tri: o.tri, tent: o.tent, ts: o.ts, acertos: b.acertos, erros: b.erros, pct: b.pct, nota: b.nota, pontos: b.pontos, dinheiro: b.dinheiro, moedas: Math.floor(o.moedas), progresso: o.conc ? 100 : o.prog, progEst: o.conc ? 0 : o.progEst, concluido: o.conc, melhor: o.melhor, ultima: o.ultima };
  }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 300);
}
// ficha: {ok,login,num,turma,conta:{ativada,banco,bloq,ultimo},boletim,moedas:{ganhas,trocadas,saldo},carteira:{USD:1.5,...},extrato:[...],trocas:[...]}
function eb_profAluno_(p) {
  var login = eb_loginOk_(p.login); if (!login) return eb_erro_('Login inválido.');
  var ct = eb_profContas_()[login], b = eb_boletimDe_(login), g = eb_moedasGanhas_(login), t = eb_moedasTrocadas_(login);
  var sc = eb_saldosLogin_(login), cart = {};
  EB_MOEDAS.forEach(function (m) { if (sc[m]) cart[m] = sc[m] / eb_escala_(m); });
  var ex = [], sx = eb_aba_('Extratos'), n = sx.getLastRow();
  if (n >= 2) {
    var ini = Math.max(2, n - 2999), v = sx.getRange(ini, 1, n - ini + 1, 10).getValues();
    for (var i = v.length - 1; i >= 0 && ex.length < 30; i--) {
      var r = v[i]; if (String(r[1]) !== login) continue;
      ex.push({ ts: new Date(r[0]).getTime(), tipo: String(r[2]), moeda: String(r[3]), v: Number(r[4]) / eb_escala_(String(r[3])), brl: r[5] === '' ? null : Number(r[5]) / 100, outro: String(r[6]), nota: String(r[7]) });
    }
  }
  var tr = [], sm = eb_aba_('Moedas'), nm = sm.getLastRow();
  if (nm >= 2) {
    var vm = sm.getRange(2, 1, nm - 1, 6).getValues();
    for (var j = vm.length - 1; j >= 0 && tr.length < 10; j--) if (String(vm[j][1]) === login && String(vm[j][3]) === 'troca') tr.push({ ts: new Date(vm[j][0]).getTime(), q: Number(vm[j][4]) || 0, centavos: Number(vm[j][5]) || 0 });
  }
  return { ok: 1, login: login, detalhe: eb_detalheDe_(login), num: eb_numLogin_(login), turma: eb_turma_(login), conta: { ativada: ct ? 1 : 0, banco: ct ? ct.banco : 0, bloq: (ct && ct.bloq) || eb_profBloqCache_(login) ? 1 : 0, ultimo: ct ? ct.ultimo : 0 }, boletim: b, moedas: { ganhas: g, trocadas: t, saldo: Math.max(0, g - t) }, carteira: cart, extrato: ex, trocas: tr };
}
// {ok,turma,discs:[{disc,conteudos:[{cod,atividade,feitos}]}],total}  (total = alunos da turma)
function eb_profConteudos_(p) {
  var turma = eb_turmaOk_(p.turma); if (!turma) return eb_erro_('Turma inválida.');
  var contas = eb_profContas_(), res = eb_profResultados_(), logins = eb_profLogins_(turma, contas, res), md = {};
  logins.forEach(function (l) {
    Object.keys(res[l] || {}).forEach(function (k) {
      var c = res[l][k], d = md[c.disc] || (md[c.disc] = {}), x = d[c.cod] || (d[c.cod] = { cod: c.cod, atividade: c.atividade, feitos: 0, ts: 0 });
      x.feitos++; if (c.ts > x.ts) { x.ts = c.ts; x.atividade = c.atividade; }
    });
  });
  var discs = Object.keys(md).sort().map(function (d) {
    return { disc: d, conteudos: Object.keys(md[d]).map(function (k) { return md[d][k]; }).sort(function (a, b) { return b.ts - a.ts; }).map(function (x) { return { cod: x.cod, atividade: x.atividade, feitos: x.feitos }; }) };
  });
  return { ok: 1, turma: turma, discs: discs, total: logins.length };
}
// {ok,turma,disc,cod,atividade,alunos:[{login,num,feito,melhor,ultima,tent,conc}]}  notas 0-10
function eb_profConteudo_(p) {
  var turma = eb_turmaOk_(p.turma), disc = eb_t_(p.disc, 30), cod = eb_t_(p.cod, 80);
  if (!turma || !disc || !cod) return eb_erro_('Informe turma, disciplina e conteúdo.');
  var contas = eb_profContas_(), res = eb_profResultados_(), ativ = cod;
  var alunos = eb_profLogins_(turma, contas, res).map(function (l) {
    var c = (res[l] || {})[disc + '|' + cod];
    if (!c) return { login: l, num: eb_numLogin_(l), feito: 0, melhor: null, ultima: null, tent: 0, conc: 0 };
    ativ = c.atividade || ativ;
    return { login: l, num: eb_numLogin_(l), feito: 1, melhor: c.melhor === null ? null : eb_round1_(c.melhor / 10), ultima: c.pct === null ? null : eb_round1_(c.pct / 10), tent: c.tent, conc: c.conc };
  });
  return { ok: 1, turma: turma, disc: disc, cod: cod, atividade: ativ, alunos: alunos };
}

// R$ do jogo guardado na Nuvem (cópia da última sincronização): {login:{cash:reais,ts}}; chaves 'rbx' (cash) ou 'edu' (robiox_v2_<login>.cash), vence a de ts maior
function eb_profCash_(logins) {
  var sh = eb_aba_('Nuvem'), n = sh.getLastRow(), o = {};
  if (n < 2) return o;
  sh.getRange(2, 1, n - 1, 4).getValues().forEach(function (r) {
    var lg = String(r[0]); if (!logins[lg]) return;
    var k = String(r[1]), ts = Number(r[2]) || 0, cash = null;
    if (o[lg] && o[lg].ts >= ts) return;
    try {
      var j = JSON.parse(String(r[3]));
      if (k === 'rbx') cash = Number(j.cash);
      else if (k === 'edu') { var s = j['robiox_v2_' + lg]; if (s) cash = Number(JSON.parse(s).cash); }
    } catch (e) { cash = null; }
    if (cash !== null && isFinite(cash)) o[lg] = { cash: cash / 100, ts: ts };
  });
  return o;
}
// profdash {escola?,turma?,disc?,cash?:1,atualizar?:1}
// -> {ok,filtro,cotacao:{ts,fonte},discs:[nomes],turmas:[{turma,alunos,feitos,media,conc,pts}],disciplinas:[{disc,alunos,feitos,media,conc,pts}],
//     atividades:[{disc,cod,atividade,alunos,media,pctConc,lt6,m68,ge8}],
//     alunos:[{login,num,turma,n,media,conc,pts,ganhas,saldo,cash,cashTs,cart,patr}]}  (patr = cash + moedas estrangeiras/cripto em R$ pela cotação atual; cash/cashTs null se sem cópia na Nuvem; cash só vem com cash:1)
function eb_profDash_(p) {
  var esc = String(p.escola || '').toLowerCase().trim(), turma = p.turma ? eb_turmaOk_(p.turma) : '', disc = p.disc ? eb_t_(p.disc, 30) : '', cash = p.cash ? 1 : 0;
  if (p.turma && !turma) return eb_erro_('Turma inválida.');
  if (esc && !/^[a-z]{3}$/.test(esc)) return eb_erro_('Escola inválida.');
  var cache = CacheService.getScriptCache(), ck = 'pd_' + eb_sha_([esc, turma, disc, cash].join('|')).slice(0, 24);
  if (p.atualizar) { cache.remove('eb_tx_f'); cache.remove('eb_tx_c'); }
  else { var cv = cache.get(ck); if (cv) { try { return JSON.parse(cv); } catch (e) { } } }
  var tx = eb_taxas_(), contas = eb_profContas_(), res = eb_profResultados_(), troc = eb_profTrocadas_(), logins = {};
  [contas, res].forEach(function (m) { Object.keys(m).forEach(function (l) { var t = eb_turma_(l); if ((!esc || t.slice(0, 3) === esc) && (!turma || t === turma)) logins[l] = 1; }); });
  var ls = Object.keys(logins);
  // carteiras
  var shc = eb_aba_('Carteiras'), nc = shc.getLastRow(), cart = {};
  if (nc >= 2) shc.getRange(2, 1, nc - 1, EB_MOEDAS.length + 1).getValues().forEach(function (r) {
    var lg = String(r[0]); if (!logins[lg]) return;
    var v = 0; EB_MOEDAS.forEach(function (m, i) { v += (Number(r[i + 1]) || 0) / eb_escala_(m) * tx.taxas[m].t; });
    cart[lg] = Math.round(v * 100) / 100;
  });
  var cs = cash ? eb_profCash_(logins) : {};
  var discs = {}, dd = {}, tt = {}, at = {}, alunos = [];
  ls.forEach(function (l) {
    var o = res[l] || {}, n = 0, s = 0, nn = 0, conc = 0, pts = 0, g = 0, ga = 0, t = eb_turma_(l);
    Object.keys(o).forEach(function (k) {
      var c = o[k]; discs[c.disc] = 1; ga += Math.floor(c.pts);
      if (disc && c.disc !== disc) return;
      n++; if (c.pct !== null) { s += c.pct; nn++; } conc += c.conc; pts += c.ptsAll; g += Math.floor(c.pts);
      var d = dd[c.disc] || (dd[c.disc] = { disc: c.disc, a: {}, n: 0, s: 0, nn: 0, conc: 0, pts: 0 });
      d.a[l] = 1; d.n++; if (c.pct !== null) { d.s += c.pct; d.nn++; } d.conc += c.conc; d.pts += c.ptsAll;
      var ak = c.disc + '|' + c.cod, x = at[ak] || (at[ak] = { disc: c.disc, cod: c.cod, atividade: c.atividade, ts: 0, a: 0, s: 0, nn: 0, conc: 0, lt6: 0, m68: 0, ge8: 0 });
      x.a++; x.conc += c.conc; if (c.ts > x.ts) { x.ts = c.ts; x.atividade = c.atividade; }
      if (c.melhor !== null) { x.s += c.melhor; x.nn++; var nt = c.melhor / 10; if (nt < 6) x.lt6++; else if (nt < 8) x.m68++; else x.ge8++; }
    });
    var tg = tt[t] || (tt[t] = { turma: t, alunos: 0, feitos: 0, s: 0, nn: 0, conc: 0, pts: 0 });
    tg.alunos++; tg.feitos += n; tg.s += s; tg.nn += nn; tg.conc += conc; tg.pts += pts;
    var c1 = cs[l], pv = cart[l] || 0;
    alunos.push({ login: l, num: eb_numLogin_(l), turma: t, n: n, media: nn ? eb_round1_(s / nn / 10) : null, conc: conc, pts: Math.round(pts), ganhas: g, saldo: Math.max(0, ga - (troc[l] || 0)), cash: c1 ? c1.cash : null, cashTs: c1 ? c1.ts : null, cart: pv, patr: Math.round(((c1 ? c1.cash : 0) + pv) * 100) / 100 });
  });
  var out = {
    ok: 1, filtro: { escola: esc, turma: turma, disc: disc }, cotacao: { ts: tx.ts, fonte: tx.fonte }, discs: Object.keys(discs).sort(),
    turmas: Object.keys(tt).sort().map(function (k) { var x = tt[k]; return { turma: x.turma, alunos: x.alunos, feitos: x.feitos, media: x.nn ? eb_round1_(x.s / x.nn / 10) : null, conc: x.conc, pts: Math.round(x.pts) }; }),
    disciplinas: Object.keys(dd).sort().map(function (k) { var x = dd[k]; return { disc: x.disc, alunos: Object.keys(x.a).length, feitos: x.n, media: x.nn ? eb_round1_(x.s / x.nn / 10) : null, conc: x.conc, pts: Math.round(x.pts) }; }),
    atividades: Object.keys(at).map(function (k) { return at[k]; }).sort(function (a, b) { return b.a - a.a; }).slice(0, 150).map(function (x) { return { disc: x.disc, cod: x.cod, atividade: x.atividade, alunos: x.a, media: x.nn ? eb_round1_(x.s / x.nn / 10) : null, pctConc: x.a ? Math.round(100 * x.conc / x.a) : 0, lt6: x.lt6, m68: x.m68, ge8: x.ge8 }; }),
    alunos: alunos.slice(0, 700)
  };
  try { var js = JSON.stringify(out); if (js.length < 95000) cache.put(ck, js, 60); } catch (e) { }
  return out;
}
function eb_desbloquearCore_(login) {
  return eb_lock_(function () {
    var sh = eb_aba_('Contas'), row = eb_find_(sh, 1, login);
    if (row) sh.getRange(row, 6, 1, 2).setValues([[0, '']]);
    eb_limpaFalhas_(login); eb_limpaFalhasBanco_(login);
    eb_log_(login, 'desbloquear', 'bloqueio removido pelo professor');
    return { ok: 1, msg: login + ': desbloqueado.' };
  });
}
function eb_zerarCore_(login) {
  return eb_lock_(function () {
    var sh = eb_aba_('Carteiras'), row = eb_carteiraRow_(sh, login, false);
    if (!row) return { ok: 1, msg: login + ': não tem carteira.' };
    var z = {}; EB_MOEDAS.forEach(function (m) { z[m] = 0; });
    eb_gravaSaldos_(sh, row, z);
    eb_log_(login, 'zerar', 'carteira zerada pelo professor');
    return { ok: 1, msg: login + ': carteira zerada.' };
  });
}

// ---------- nuvem ----------
function eb_nuvemSalvar_(p, login) {
  var k = String(p.k || ''), v = p.v, ts = Number(p.ts);
  if (!/^(rbx|edu)$/.test(k)) return eb_erro_('Chave inválida.');
  if (typeof v !== 'string') v = JSON.stringify(v);
  if (!v || v.length > 40000) return eb_erro_('Dados vazios ou grandes demais.');
  try { JSON.parse(v); } catch (e) { return eb_erro_('Dados inválidos.'); }
  var agora = Date.now(); if (!isFinite(ts) || ts <= 0) ts = agora; if (ts > agora + 86400000) ts = agora;
  var r = eb_lock_(function () {
    var sh = eb_aba_('Nuvem'), n = sh.getLastRow(), row = 0;
    if (n >= 2) { var ids = sh.getRange(2, 1, n - 1, 2).getValues(); for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === login && String(ids[i][1]) === k) { row = i + 2; break; } }
    if (row) {
      var old = Number(sh.getRange(row, 3).getValue()) || 0;
      if (ts < old) return { ok: 1, ignorado: 1, ts: old };
      sh.getRange(row, 3, 1, 2).setValues([[ts, v]]);
    } else sh.appendRow([login, k, ts, v]);
    var c = CacheService.getScriptCache();   // log no máximo a cada 10 min por aluno (sincroniza a cada poucos segundos)
    if (!c.get('ln_' + login)) { c.put('ln_' + login, '1', 600); eb_log_(login, 'nuvem', 'salvou ' + k + ' (' + v.length + ' car.)'); }
    return { ok: 1, ts: ts };
  });
  return r;
}
function eb_nuvemCarregar_(p, login) {
  var k = String(p.k || '');
  if (!/^(rbx|edu)$/.test(k)) return eb_erro_('Chave inválida.');
  var sh = eb_aba_('Nuvem'), n = sh.getLastRow();
  if (n >= 2) {
    var ids = sh.getRange(2, 1, n - 1, 2).getValues();
    for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === login && String(ids[i][1]) === k) {
      var r = sh.getRange(i + 2, 3, 1, 2).getValues()[0], v = null;
      try { v = JSON.parse(r[1]); } catch (e) { }
      return { ok: 1, ts: Number(r[0]) || 0, v: v };
    }
  }
  return { ok: 1, ts: 0, v: null, vazio: 1 };
}

// ---------- carteiras ----------
function eb_carteiraRow_(sh, login, criar) {
  var row = eb_find_(sh, 1, login);
  if (!row && criar) { var z = [login]; EB_MOEDAS.forEach(function () { z.push(0); }); z.push(new Date()); sh.appendRow(z); row = sh.getLastRow(); }
  return row;
}
function eb_lerSaldos_(sh, row) {
  var o = {}, v = row ? sh.getRange(row, 2, 1, EB_MOEDAS.length).getValues()[0] : [];
  EB_MOEDAS.forEach(function (m, i) { o[m] = Number(v[i]) || 0; });
  return o;
}
function eb_gravaSaldos_(sh, row, s) {
  sh.getRange(row, 2, 1, EB_MOEDAS.length + 1).setValues([EB_MOEDAS.map(function (m) { return s[m]; }).concat([new Date()])]);
}
function eb_saldosLogin_(login) { var sh = eb_aba_('Carteiras'); return eb_lerSaldos_(sh, eb_carteiraRow_(sh, login, false)); }
function eb_carteiraResp_(login) { var t = eb_taxas_(); return { ok: 1, saldos: eb_saldosLogin_(login), taxas: t.taxas, ts: t.ts, fonte: t.fonte }; }

// ---------- extratos ----------
function eb_idUso_(id, login) {   // {t:'meu',r:linha} | {t:'outro'} | null
  var sh = eb_aba_('Extratos'), n = sh.getLastRow(); if (n < 2) return null;
  var ini = Math.max(2, n - 2999), v = sh.getRange(ini, 1, n - ini + 1, 10).getValues(), uso = null;
  for (var i = v.length - 1; i >= 0; i--) if (String(v[i][9]) === id) {
    if (String(v[i][1]) === login && /^(env|compra|venda)$/.test(v[i][2])) return { t: 'meu', r: v[i] };
    uso = { t: 'outro' };
  }
  return uso;
}
function eb_extratoResp_(login) {
  var sh = eb_aba_('Extratos'), n = sh.getLastRow(), itens = [];
  if (n >= 2) {
    var ini = Math.max(2, n - 2999), v = sh.getRange(ini, 1, n - ini + 1, 10).getValues();
    for (var i = v.length - 1; i >= 0 && itens.length < 60; i--) {
      var r = v[i]; if (String(r[1]) !== login) continue;
      itens.push({ ts: new Date(r[0]).getTime(), tipo: String(r[2]), moeda: String(r[3]), v: Number(r[4]), brl: r[5] === '' ? null : Number(r[5]), outro: String(r[6]) === 'Professor' ? 'Professor' : eb_anon_(String(r[6])), nota: String(r[7]), saldo_apos: r[8] === '' ? null : Number(r[8]) });
    }
  }
  return { ok: 1, itens: itens };
}

// ---------- câmbio ----------
function eb_cambio_(p, login) {
  var op = String(p.op || ''), moeda = String(p.moeda || '').toUpperCase(), id = String(p.id || '');
  if (op !== 'comprar' && op !== 'vender') return eb_erro_('Operação inválida.');
  if (EB_MOEDAS.indexOf(moeda) < 0) return eb_erro_('Moeda não disponível.');
  var v = eb_int_(p.v, 1, eb_maxV_(moeda));
  if (isNaN(v)) return eb_erro_('Valor inválido.');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  var cash = 0;
  if (op === 'comprar') { cash = eb_int_(p.cash, 0, 1e13); if (isNaN(cash)) return eb_erro_('Informe seu saldo em reais.'); }
  var tx = eb_taxas_().taxas[moeda], esc = eb_escala_(moeda);
  if (!tx || !tx.t) return eb_erro_('Cotação indisponível agora. Tente de novo em alguns minutos.');
  return eb_lock_(function () {
    var cfg = eb_cfg_(), sp = eb_spread_(cfg, moeda), uso = eb_idUso_(id, login);
    if (uso && uso.t === 'meu') { var d = uso.r; return d[2] === 'compra' ? { ok: 1, dup: 1, custo: Number(d[5]), saldos: eb_saldosLogin_(login) } : { ok: 1, dup: 1, recebe: Number(d[5]), saldos: eb_saldosLogin_(login) }; }
    if (uso) return eb_erro_('Identificador já usado.');
    var sh = eb_aba_('Carteiras'), row = eb_carteiraRow_(sh, login, true), s = eb_lerSaldos_(sh, row);
    if (op === 'comprar') {
      var custo = Math.ceil(eb_r6_(v / esc * tx.t * 100 * (1 + sp)));
      if (cash < custo) return eb_erro_('Saldo em reais insuficiente.', { custo: custo });
      s[moeda] += v; eb_gravaSaldos_(sh, row, s);
      eb_aba_('Extratos').appendRow([new Date(), login, 'compra', moeda, v, custo, '', '', s[moeda], id]);
      eb_log_(login, 'cambio', 'compra ' + moeda + ' ' + v + ' custo_centavos=' + custo + ' taxa=' + tx.t + ' id=' + id);
      try { eb_aba_('Mestre').appendRow([new Date(), login, 'compra', moeda, (custo - Math.ceil(eb_r6_(v / esc * tx.t * 100))) / 100, EB_MESTRE]); } catch (e) { }
      return { ok: 1, custo: custo, taxa: tx.t, saldos: s };
    }
    if (s[moeda] < v) return eb_erro_('Saldo insuficiente nessa moeda.');
    var rec = Math.floor(eb_r6_(v / esc * tx.t * 100 * (1 - sp)));
    if (rec < 1) return eb_erro_('Valor pequeno demais para vender.');
    s[moeda] -= v; eb_gravaSaldos_(sh, row, s);
    eb_aba_('Extratos').appendRow([new Date(), login, 'venda', moeda, v, rec, '', '', s[moeda], id]);
    eb_log_(login, 'cambio', 'venda ' + moeda + ' ' + v + ' recebe_centavos=' + rec + ' taxa=' + tx.t + ' id=' + id);
    try { eb_aba_('Mestre').appendRow([new Date(), login, 'venda', moeda, (Math.floor(eb_r6_(v / esc * tx.t * 100)) - rec) / 100, EB_MESTRE]); } catch (e) { }
    return { ok: 1, recebe: rec, taxa: tx.t, saldos: s };
  });
}

// ---------- transferência (apenas moedas estrangeiras/cripto; mesma turma) ----------
function eb_transferir_(p, de) {
  if (!EB_ALUNO.test(de)) return eb_erro_('Contas de professor não fazem transferências.');
  var para = String(p.para || '').toLowerCase().trim(), moeda = String(p.moeda || '').toUpperCase(), id = String(p.id || ''), nota = String(p.nota == null ? '' : p.nota);
  if (!EB_ALUNO.test(para)) return eb_erro_('Chave Pix inválida. Use o login do colega, como 12cla6b.');
  if (para === de) return eb_erro_('Você não pode transferir para si mesmo.');
  if (eb_turma_(para) !== eb_turma_(de)) return eb_erro_('Só é possível transferir para alunos da mesma turma.');
  if (EB_MOEDAS.indexOf(moeda) < 0) return eb_erro_('Só moedas estrangeiras e criptomoedas podem ser transferidas.');
  var v = eb_int_(p.v, 1, eb_maxV_(moeda));
  if (isNaN(v)) return eb_erro_('Valor inválido.');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  if (nota.length > 40 || /[<>]/.test(nota)) return eb_erro_('Mensagem inválida (até 40 caracteres, sem < ou >).');
  var hb = eb_bHex_(p.hb);
  return eb_lock_(function () {
    var cs = eb_aba_('Contas'), crow = eb_find_(cs, 1, de), cr = crow ? cs.getRange(crow, 1, 1, 11).getValues()[0] : null;
    if (!eb_bTem_(cr)) return eb_erro_('Crie sua senha do EduBank antes de transferir.', { semBanco: 1 });
    var bq = eb_bBloq_(de); if (bq) return bq;
    if (!hb) return eb_erro_('Informe a senha do EduBank.');
    if (!eb_bConfere_(cr, hb)) return eb_bTentativa_(de, false);
    eb_bTentativa_(de, true);
    var uso = eb_idUso_(id, de);
    if (uso && uso.t === 'meu') return { ok: 1, dup: 1, saldos: eb_saldosLogin_(de), para: eb_anon_(para) };
    if (uso) return eb_erro_('Identificador já usado.');
    if (!eb_find_(eb_aba_('Contas'), 1, para)) return eb_erro_('Esse colega ainda não ativou a conta.');
    var sh = eb_aba_('Carteiras'), rd = eb_carteiraRow_(sh, de, true), rp = eb_carteiraRow_(sh, para, true);
    var sd = eb_lerSaldos_(sh, rd), sp = eb_lerSaldos_(sh, rp);
    if (sd[moeda] < v) return eb_erro_('Saldo insuficiente.');
    var nd = JSON.parse(JSON.stringify(sd)), np = JSON.parse(JSON.stringify(sp));
    nd[moeda] -= v; np[moeda] += v;
    eb_gravaSaldos_(sh, rd, nd);
    try { eb_gravaSaldos_(sh, rp, np); } catch (err) { eb_gravaSaldos_(sh, rd, sd); return eb_erro_('Não foi possível concluir. Nada foi debitado.'); }
    var ex = eb_aba_('Extratos'), agora = new Date(), nt = eb_txt_(nota);
    ex.appendRow([agora, de, 'env', moeda, v, '', para, nt, nd[moeda], id]);
    ex.appendRow([agora, para, 'rec', moeda, v, '', de, nt, np[moeda], id]);
    eb_log_(de, 'transferir', 'origem=' + de + ' destino=' + para + ' ' + moeda + ' ' + v + ' id=' + id);
    return { ok: 1, saldos: nd, para: eb_anon_(para) };
  });
}

// ---------- créditos pendentes em R$ (professor -> aluno; o R$ vive no aparelho, o cliente credita via receber/receberack) ----------
function eb_credIds_() {   // {id:1} dos ids já gravados em Creditos
  var sh = eb_aba_('Creditos'), n = sh.getLastRow(), o = {};
  if (n >= 2) sh.getRange(2, 3, n - 1, 1).getValues().forEach(function (r) { o[String(r[0])] = 1; });
  return o;
}
// chamar dentro de lock; devolve 1 se gravou, 0 se id repetido
function eb_credAdd_(login, id, cent, nota, ids) {
  if (ids[id]) return 0;
  var agora = new Date(), nt = eb_txt_(nota);
  eb_aba_('Creditos').appendRow([agora, login, id, cent, nt, 'novo']);
  eb_aba_('Extratos').appendRow([agora, login, 'rec', 'BRL', cent, '', 'Professor', nt, '', id]);
  eb_log_(login, 'profenviar', 'professor enviou ' + cent + ' centavos a ' + login + ' id=' + id);
  ids[id] = 1;
  return 1;
}
function eb_credValida_(p) {
  var cent = eb_int_(p.centavos, 1, 100000000);
  if (isNaN(cent)) return eb_erro_('Valor inválido (R$ 0,01 a R$ 1.000.000,00).');
  var nota = String(p.nota == null ? '' : p.nota), id = String(p.id || '');
  if (nota.length > 40 || /[<>]/.test(nota)) return eb_erro_('Mensagem inválida (até 40 caracteres, sem < ou >).');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  return { cent: cent, nota: nota, id: id };
}
// {acao:'profenviar',hp,login,centavos,nota,id}
function eb_profEnviar_(p) {
  var login = eb_loginOk_(p.login); if (!login) return eb_erro_('Chave Pix (login) inválida.');
  var v = eb_credValida_(p); if (!v.ok && v.erro) return v;
  return eb_lock_(function () {
    var g = eb_credAdd_(login, v.id, v.cent, v.nota, eb_credIds_());
    return g ? { ok: 1, msg: 'Enviado R$ ' + (v.cent / 100).toFixed(2).replace('.', ',') + ' para ' + login + '.' } : { ok: 1, dup: 1, msg: 'Este envio já tinha sido feito.' };
  });
}
// {acao:'profenviarturma',hp,turma,centavos,nota,id} -> id derivado = id(20) + login
function eb_profEnviarTurma_(p) {
  var turma = eb_turmaOk_(p.turma); if (!turma) return eb_erro_('Turma inválida.');
  var v = eb_credValida_(p); if (!v.ok && v.erro) return v;
  if (v.id.length > 20) return eb_erro_('Identificador inválido (até 20 caracteres para a turma).');
  var logins = eb_profLogins_(turma, eb_profContas_(), eb_profResultados_());
  if (!logins.length) return eb_erro_('Nenhum aluno nessa turma.');
  return eb_lock_(function () {
    var ids = eb_credIds_(), n = 0, dup = 0;
    logins.forEach(function (l) { if (eb_credAdd_(l, v.id + l, v.cent, v.nota, ids)) n++; else dup++; });
    eb_log_('', 'profenviarturma', 'turma ' + turma + ' ' + v.cent + ' centavos para ' + n + ' aluno(s) id=' + v.id);
    return { ok: 1, n: n, dup: dup, msg: 'Enviado para ' + n + ' aluno(s) de ' + turma + '.' };
  });
}
// aluno: lista créditos 'novo'
function eb_receber_(login) {
  var sh = eb_aba_('Creditos'), n = sh.getLastRow(), itens = [];
  if (n >= 2) {
    var ini = Math.max(2, n - 4999), v = sh.getRange(ini, 1, n - ini + 1, 6).getValues();
    for (var i = 0; i < v.length && itens.length < 50; i++) {
      var r = v[i]; if (String(r[1]) !== login || String(r[5]) !== 'novo') continue;
      itens.push({ id: String(r[2]), centavos: Number(r[3]), nota: String(r[4]), ts: new Date(r[0]).getTime() });
    }
  }
  return { ok: 1, itens: itens };
}
function eb_receberAck_(p, login) {
  var ids = String(p.ids || '').split(',').filter(function (x) { return /^[A-Za-z0-9]{1,40}$/.test(x); }).slice(0, 50), set = {};
  ids.forEach(function (x) { set[x] = 1; });
  if (!ids.length) return { ok: 1, n: 0 };
  return eb_lock_(function () {
    var sh = eb_aba_('Creditos'), n = sh.getLastRow(), c = 0;
    if (n >= 2) {
      var v = sh.getRange(2, 1, n - 1, 6).getValues();
      for (var i = 0; i < v.length; i++) if (String(v[i][1]) === login && String(v[i][5]) === 'novo' && set[String(v[i][2])]) { sh.getRange(i + 2, 6).setValue('creditado'); c++; }
    }
    if (c) eb_log_(login, 'receber', c + ' crédito(s) do professor confirmado(s)');
    return { ok: 1, n: c };
  });
}

// ---------- resultados e boletim ----------
function eb_resultado_(p, login) {
  var r = {}, k, dd = p.d;   // campos no nível superior e/ou em d (d prevalece)
  for (k in p) r[k] = p[k];
  if (dd) { try { if (typeof dd === 'string') dd = JSON.parse(dd); for (k in dd) r[k] = dd[k]; } catch (e) { return eb_erro_('Resultado inválido.'); } }
  var sid = eb_t_(r.sid, 40);
  var cod = eb_t_(r.cod, 40), ativ = eb_t_(r.atividade, 80), disc = eb_t_(r.disc, 30), serie = eb_t_(r.serie, 20);
  if (!disc || (!cod && !ativ)) return eb_erro_('Resultado incompleto.');
  var ac = eb_int_(r.acertos == null ? 0 : r.acertos, 0, 100000), er = eb_int_(r.erros == null ? 0 : r.erros, 0, 100000);
  if (isNaN(ac) || isNaN(er)) return eb_erro_('Acertos/erros inválidos.');
  var pct = Number(r.pct);
  if (r.pct === '' || r.pct == null || !isFinite(pct) || pct < 0 || pct > 100) pct = (ac + er) > 0 ? Math.round(100 * ac / (ac + er)) : '';
  var pts = Number(r.pontos); if (!isFinite(pts) || pts < 0) pts = 0; pts = Math.min(pts, 1e7);
  var dur = Number(r.dur); if (!isFinite(dur) || dur < 0) dur = 0; dur = Math.min(Math.round(dur), 86400);
  var conc = (r.concluido === 1 || r.concluido === true || r.concluido === '1' || r.concluido === 'true') ? 1 : 0;
  var prog = Number(r.progresso); prog = (r.progresso === '' || r.progresso == null || !isFinite(prog)) ? '' : Math.max(0, Math.min(100, Math.round(prog)));
  var din = Number(r.dinheiro); din = (r.dinheiro === '' || r.dinheiro == null || !isFinite(din)) ? '' : Math.max(0, Math.min(1e9, Math.round(din)));   // centavos de R$ ganhos na atividade
  var agora = new Date(), tri = eb_trimestre_(agora);
  return eb_lock_(function () {
    var sh = eb_aba_('Resultados'), lin = [agora, login, eb_turma_(login), tri, eb_txt_(disc), eb_txt_(cod), eb_txt_(ativ), ac, er, pct, conc, pts, dur, eb_txt_(serie), eb_txt_(sid), prog, din], row = 0, nn = sh.getLastRow();
    if (sh.getLastColumn() < 17) { sh.getRange(1, 16, 1, 2).setValues([['progresso', 'dinheiro']]).setFontWeight('bold').setBackground('#15803d').setFontColor('#ffffff'); }   // planilha antiga: acrescenta as colunas novas
    if (sid && nn >= 2) { var ids = sh.getRange(2, 1, nn - 1, 15).getValues(); for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][14]) === sid && String(ids[i][1]) === login) { row = i + 2; break; } }
    if (row) sh.getRange(row, 1, 1, 17).setValues([lin]); else sh.appendRow(lin);
    eb_log_(login, 'resultado', disc + ' ' + (cod || ativ) + ' ' + (pct === '' ? '-' : pct + '%'));
    return { ok: 1, trimestre: tri, atualizado: row ? 1 : 0 };
  });
}
function eb_slug_(t) { return norm_(t).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }
function eb_round1_(x) { return Math.round(x * 10) / 10; }
function eb_boletimDe_(login) {
  var sh = eb_aba_('Resultados'), n = sh.getLastRow(), m = {}, lista = [], cfg = eb_cfg_();
  if (n >= 2) sh.getRange(2, 1, n - 1, 14).getValues().forEach(function (r, i) {
    if (String(r[1]) !== login) return;
    var key = r[4] + '|' + (r[5] || r[6] || ('#' + i)), ts = new Date(r[0]).getTime() || 0, o = m[key];
    if (!o) { o = m[key] = { disc: String(r[4]), ts: -1, tri: 1, pct: null, conc: 0, cod: '', atividade: '', melhor: null, tent: 0 }; }
    var pc = (r[9] === '' || r[9] == null) ? null : Number(r[9]);
    o.tent++;
    if (pc !== null && isFinite(pc) && (o.melhor === null || pc > o.melhor)) o.melhor = pc;
    if (ts >= o.ts) { o.ts = ts; o.tri = Number(r[3]) || 1; o.pct = (r[9] === '' || r[9] == null) ? null : Number(r[9]); o.cod = String(r[5] || ''); o.atividade = String(r[6] || r[5] || ''); }
    if (Number(r[10]) === 1) o.conc = 1;
    lista.push({ i: i, ts: ts, atividade: String(r[6] || r[5]), disc: String(r[4]), pct: r[9] === '' ? null : Number(r[9]), concluido: Number(r[10]) === 1 ? 1 : 0 });
  });
  function novo() { return { n: 0, s: 0, nn: 0, conc: 0 }; }
  function fim(a, extra) { var o = { n: a.n, media: a.nn ? eb_round1_(a.s / a.nn / 10) : null, mediaPct: a.nn ? Math.round(a.s / a.nn) : null, conc: a.conc }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  function soma(a, o) { a.n++; if (o.pct !== null) { a.s += o.pct; a.nn++; } a.conc += o.conc; }
  var pd = {}, td = {}, geral = novo(), gt = { 1: novo(), 2: novo(), 3: novo() };
  Object.keys(m).forEach(function (k) {
    var o = m[k], d = o.disc;
    if (!pd[d]) { pd[d] = { 1: novo(), 2: novo(), 3: novo() }; td[d] = novo(); }
    soma(pd[d][o.tri], o); soma(td[d], o); soma(geral, o); soma(gt[o.tri], o);
  });
  var porDisc = {}, totais = {};
  Object.keys(pd).forEach(function (d) {
    porDisc[d] = { 1: fim(pd[d][1]), 2: fim(pd[d][2]), 3: fim(pd[d][3]) };
    var tot = Number(cfg['total_' + eb_slug_(d)]) || 0;
    totais[d] = fim(td[d], { total: tot });
  });
  var tg = Number(cfg.total_geral) || 0;
  var g = fim(geral, { total: tg, pctConc: tg > 0 ? Math.min(100, Math.round(100 * geral.conc / tg)) : null, porTri: { 1: fim(gt[1]), 2: fim(gt[2]), 3: fim(gt[3]) } });
  lista.sort(function (a, b) { return (b.ts - a.ts) || (b.i - a.i); });
  var conteudos = Object.keys(m).map(function (k) {
    var o = m[k];
    return { cod: o.cod, atividade: o.atividade, disc: o.disc, tri: o.tri, melhor: o.melhor === null ? null : eb_round1_(o.melhor / 10), ultima: o.pct === null ? null : eb_round1_(o.pct / 10), tent: o.tent, ts: o.ts, concluido: o.conc ? 1 : 0 };
  }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, 200);
  return { ok: 1, porDisc: porDisc, totais: totais, geral: g, ultimas: lista.slice(0, 12), conteudos: conteudos };
}
function eb_boletimResp_(login) { return eb_boletimDe_(login); }

// ---------- moedas (ganhas por atividade; troca por R$ no cliente) ----------
// Ganhas = soma, por atividade distinta, do MELHOR 'pontos' já obtido (se pontos = 0/ausente, usa acertos). Refazer só rende a diferença para cima.
function eb_moedasGanhas_(login) {
  var sh = eb_aba_('Resultados'), n = sh.getLastRow(), best = {}, tot = 0;
  if (n >= 2) sh.getRange(2, 1, n - 1, 12).getValues().forEach(function (r, i) {
    if (String(r[1]) !== login || Number(r[10]) !== 1) return;   // só atividades CONCLUÍDAS rendem moedas
    var key = r[4] + '|' + (r[5] || r[6] || ('#' + i)), v = Number(r[11]);
    if (!isFinite(v) || v <= 0) v = Number(r[7]);
    if (!isFinite(v) || v < 0) v = 0;
    if (best[key] === undefined || v > best[key]) best[key] = v;
  });
  Object.keys(best).forEach(function (k) { tot += Math.floor(best[k]); });
  return tot;
}
function eb_moedasTrocadas_(login) {
  var sh = eb_aba_('Moedas'), n = sh.getLastRow(), t = 0;
  if (n >= 2) sh.getRange(2, 1, n - 1, 6).getValues().forEach(function (r) { if (String(r[1]) === login && String(r[3]) === 'troca') t += Number(r[4]) || 0; });
  return t;
}
function eb_moedaCent_() { var c = Number(eb_cfg_().moeda_centavos); return (isFinite(c) && c >= 1 && Math.floor(c) === c && c <= 100000) ? c : 100; }
function eb_moedasResp_(login) {
  var g = eb_moedasGanhas_(login), t = eb_moedasTrocadas_(login);
  return { ok: 1, ganhas: g, trocadas: t, saldo: Math.max(0, g - t), centavosPorMoeda: eb_moedaCent_() };
}
function eb_trocarMoedas_(p, login) {
  var q = eb_int_(p.q, 1, 100000), id = String(p.id || '');
  if (isNaN(q)) return eb_erro_('Quantidade de moedas inválida.');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  return eb_lock_(function () {
    var sh = eb_aba_('Moedas'), n = sh.getLastRow(), cpm = eb_moedaCent_(), g = eb_moedasGanhas_(login), t = 0;
    if (n >= 2) {
      var v = sh.getRange(2, 1, n - 1, 6).getValues();
      for (var i = 0; i < v.length; i++) {
        if (String(v[i][1]) !== login || String(v[i][3]) !== 'troca') continue;
        t += Number(v[i][4]) || 0;
        if (String(v[i][2]) === id) return { ok: 1, dup: 1, q: Number(v[i][4]), centavos: Number(v[i][5]), saldo: Math.max(0, g - t) };
      }
    }
    var saldo = Math.max(0, g - t);
    if (q > saldo) return eb_erro_('Você não tem moedas suficientes.', { saldo: saldo });
    var cent = q * cpm;
    sh.appendRow([new Date(), login, id, 'troca', q, cent]);
    eb_log_(login, 'moedas', 'troca ' + q + ' moedas centavos=' + cent + ' id=' + id);
    return { ok: 1, q: q, centavos: cent, saldo: saldo - q };
  });
}

// Classificação da turma do aluno (só a turma dele; sem nomes: "Aluno nº N").
function eb_classifResp_(login) {
  var turma = eb_turma_(login), sh = eb_aba_('Resultados'), n = sh.getLastRow(), por = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 14).getValues().forEach(function (r, i) {
    var lg = String(r[1]); if (eb_turma_(lg) !== turma) return;
    var key = r[4] + '|' + (r[5] || r[6] || ('#' + i)), o = por[lg] || (por[lg] = {}), c = o[key] || (o[key] = { pct: null, conc: 0 });
    var pct = (r[9] === '' || r[9] == null) ? null : Number(r[9]);
    if (pct !== null) c.pct = pct;
    if (Number(r[10]) === 1) c.conc = 1;
  });
  if (!por[login]) por[login] = {};
  var lista = Object.keys(por).map(function (lg) {
    var o = por[lg], s = 0, nn = 0, conc = 0, na = 0;
    Object.keys(o).forEach(function (k) { na++; if (o[k].pct !== null) { s += o[k].pct; nn++; } conc += o[k].conc; });
    return { login: lg, n: na, media: nn ? eb_round1_(s / nn / 10) : null, conc: conc };
  });
  lista.sort(function (a, b) { return ((b.media === null ? -1 : b.media) - (a.media === null ? -1 : a.media)) || (b.n - a.n); });
  var out = lista.slice(0, 60).map(function (x, i) {
    return { pos: i + 1, nome: 'Aluno nº ' + parseInt(x.login, 10), media: x.media, n: x.n, conc: x.conc, eu: x.login === login };
  });
  var eu = 0; lista.forEach(function (x, i) { if (x.login === login) eu = i + 1; });
  return { ok: 1, turma: turma, total: lista.length, minha: eu, lista: out };
}

// ---------- professor: menu 🔑 EduBank ----------
function eb_ui_() { try { return SpreadsheetApp.getUi(); } catch (e) { return null; } }
function eb_pergunta_(t, m) {
  var ui = eb_ui_(); if (!ui) return '';
  var r = ui.prompt(t, m, ui.ButtonSet.OK_CANCEL);
  return r.getSelectedButton() === ui.Button.OK ? String(r.getResponseText() || '').toLowerCase().trim() : '';
}
function eb_aviso_(t) { var ui = eb_ui_(); if (ui) ui.alert(t); else Logger.log(t); return t; }
function eb_alvo_(login, t) {
  login = login ? String(login).toLowerCase().trim() : eb_pergunta_(t, 'Digite o login do aluno (ex.: 12cla6b):');
  return eb_loginOk_(login);
}
// Senha do professor digitada na hora (ui.prompt) ou hp (SHA-256 de 'prof:'+senha) quando chamado por código. Devolve null se ok.
function eb_profMenu_(hp) {
  if (!hp) {
    var ui = eb_ui_();
    if (!ui) return eb_erro_('Informe a senha do professor.');
    if (!eb_profTem_()) return eb_erro_('Defina a senha do professor primeiro (menu EduBank > Definir senha do professor).', { semProf: 1 });
    var r = ui.prompt('Senha do professor', 'Digite a senha do professor:', ui.ButtonSet.OK_CANCEL);
    if (r.getSelectedButton() !== ui.Button.OK) return eb_erro_('cancelado');
    hp = eb_hpDe_(String(r.getResponseText() || ''));
  }
  return eb_profCheck_(hp);
}
function definirSenhaProfessor() {
  var ui = eb_ui_(); if (!ui) return eb_aviso_('Use o menu da planilha.');
  var atual = '';
  if (eb_profTem_()) {
    var a = ui.prompt('Definir senha do professor', 'Senha ATUAL do professor:', ui.ButtonSet.OK_CANCEL);
    if (a.getSelectedButton() !== ui.Button.OK) return 'cancelado';
    atual = eb_hpDe_(String(a.getResponseText() || ''));
  }
  var n = ui.prompt('Definir senha do professor', 'Nova senha do professor (mín. 6 caracteres):', ui.ButtonSet.OK_CANCEL);
  if (n.getSelectedButton() !== ui.Button.OK) return 'cancelado';
  var t = String(n.getResponseText() || '');
  if (t.length < 6) return eb_aviso_('Senha curta demais (mínimo 6 caracteres).');
  var r = eb_profDefinir_(eb_hpDe_(t), atual);
  return eb_aviso_(r.ok ? 'Senha do professor definida.' : r.erro);
}
function eb_resetCore_(login) {
  return eb_lock_(function () {
    var sh = eb_aba_('Contas'), row = eb_find_(sh, 1, login);
    eb_limpaFalhasBanco_(login);
    if (!row) return { ok: 1, msg: login + ': conta ainda não ativada (não há senha do EduBank).' };
    sh.getRange(row, 10, 1, 2).setValues([['', '']]);
    eb_log_(login, 'reset', 'senha do EduBank resetada pelo professor');
    return { ok: 1, msg: login + ': senha do EduBank apagada; o aluno cria uma nova. A senha de login não muda.' };
  });
}
function eb_resetTodasCore_() {
  return eb_lock_(function () {
    var sh = eb_aba_('Contas'), n = sh.getLastRow(), qtd = 0;
    if (n >= 2) {
      var ls = sh.getRange(2, 1, n - 1, 1).getValues();
      sh.getRange(2, 10, n - 1, 2).setValues(ls.map(function () { return ['', '']; }));
      ls.forEach(function (x) { eb_limpaFalhasBanco_(String(x[0])); });
      qtd = n - 1;
    }
    eb_log_('', 'reset', 'senha do EduBank de TODAS as contas apagada (' + qtd + ' contas)');
    return { ok: 1, msg: qtd + ' conta(s): senha do EduBank apagada. A senha de login não muda.' };
  });
}
function resetarSenha(login, hp) {
  var e = eb_profMenu_(hp); if (e) return eb_aviso_(e.erro);
  login = eb_alvo_(login, 'Resetar senha do EduBank');
  if (!login) return eb_aviso_('Login não informado ou inválido.');
  var r = eb_resetCore_(login);
  return eb_aviso_(r.ok ? r.msg : r.erro);
}
function resetarTodas(hp) {
  var e = eb_profMenu_(hp); if (e) return eb_aviso_(e.erro);
  var ui = eb_ui_();
  if (ui && ui.alert('Resetar senha do EduBank de TODOS', 'Todos os alunos precisarão criar uma nova senha do EduBank antes de transferir. A senha de login não muda. Continuar?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return 'cancelado';
  var r = eb_resetTodasCore_();
  return eb_aviso_(r.ok ? r.msg : r.erro);
}
function desbloquear(login, hp) {
  var e = eb_profMenu_(hp); if (e) return eb_aviso_(e.erro);
  login = eb_alvo_(login, 'Desbloquear aluno');
  if (!login) return eb_aviso_('Login não informado ou inválido.');
  var r = eb_lock_(function () {
    var sh = eb_aba_('Contas'), row = eb_find_(sh, 1, login);
    if (row) sh.getRange(row, 6, 1, 2).setValues([[0, '']]);
    eb_limpaFalhas_(login); eb_limpaFalhasBanco_(login);
    eb_log_(login, 'desbloquear', 'bloqueio removido pelo professor');
    return { ok: 1, msg: login + ': desbloqueado.' };
  });
  return eb_aviso_(r.ok ? r.msg : r.erro);
}
function zerarCarteira(login, hp) {
  var e = eb_profMenu_(hp); if (e) return eb_aviso_(e.erro);
  login = eb_alvo_(login, 'Zerar carteira');
  if (!login) return eb_aviso_('Login não informado ou inválido.');
  var ui = eb_ui_();
  if (ui && ui.alert('Zerar carteira', 'Zerar todas as moedas de ' + login + '?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return 'cancelado';
  var r = eb_lock_(function () {
    var sh = eb_aba_('Carteiras'), row = eb_carteiraRow_(sh, login, false);
    if (!row) return { ok: 1, msg: login + ': não tem carteira.' };
    var z = {}; EB_MOEDAS.forEach(function (m) { z[m] = 0; });
    eb_gravaSaldos_(sh, row, z);
    eb_log_(login, 'zerar', 'carteira zerada pelo professor');
    return { ok: 1, msg: login + ': carteira zerada.' };
  });
  return eb_aviso_(r.ok ? r.msg : r.erro);
}
function atualizarCambio() {
  var c = CacheService.getScriptCache(); c.remove('eb_tx_f'); c.remove('eb_tx_c');
  var t = eb_taxas_(); return eb_aviso_('Câmbio atualizado (' + t.fonte + '). USD = R$ ' + (t.taxas.USD.t || 'indisponível') + ' · BTC = R$ ' + (t.taxas.BTC.t || 'indisponível'));
}
function prepararEduBank() { Object.keys(EB_ABAS).forEach(function (n) { eb_aba_(n); }); eb_cfgGarante_(); return eb_aviso_('Abas do EduBank prontas.'); }
// Preenche a aba "Aluno" com a visão do professor sobre um login (sem hash/senha/token).
function verAluno(login) {
  login = eb_alvo_(login, 'Ver aluno');
  if (!login) return eb_aviso_('Login não informado ou inválido.');
  var ss = SpreadsheetApp.getActiveSpreadsheet(), rows = [], tit = [];
  function sec(t) { if (rows.length) rows.push([]); tit.push(rows.length); rows.push([t]); }
  var ct = eb_aba_('Contas'), cr = eb_find_(ct, 1, login), c = cr ? ct.getRange(cr, 1, 1, 11).getValues()[0] : null;
  sec('Aluno ' + login + ' · turma ' + (eb_turma_(login) || '-'));
  if (c) { rows.push(['Senha do EduBank criada', c[10] ? 'sim' : 'não']); rows.push(['Bloqueado até', Number(c[6]) > Date.now() ? new Date(Number(c[6])) : '-']); rows.push(['Último acesso', c[8] || '-']); }
  else rows.push(['Conta', 'ainda não ativada']);
  sec('Carteira (menor unidade da moeda)');
  var sh = eb_aba_('Carteiras'), s = eb_lerSaldos_(sh, eb_carteiraRow_(sh, login, false));
  EB_MOEDAS.forEach(function (m) { rows.push([m, s[m], s[m] / eb_escala_(m)]); });
  var b = eb_boletimDe_(login);
  sec('Boletim'); rows.push(['Disciplina', 'Trimestre', 'Atividades', 'Média (0-10)', '% acerto', 'Concluídas']);
  Object.keys(b.porDisc).forEach(function (d) { [1, 2, 3].forEach(function (t) { var x = b.porDisc[d][t]; if (x.n) rows.push([d, t + 'º', x.n, x.media, x.mediaPct, x.conc]); }); });
  rows.push(['GERAL', '', b.geral.n, b.geral.media, b.geral.mediaPct, b.geral.conc]);
  function cauda(nome, col, cab, nc, lim) {
    sec(nome); rows.push(cab);
    var s2 = eb_aba_(nome === 'Últimos extratos' ? 'Extratos' : nome === 'Últimos logs' ? 'Logs' : 'Resultados'), n = s2.getLastRow(), k = 0;
    if (n < 2) return;
    var ini = Math.max(2, n - 2999), v = s2.getRange(ini, 1, n - ini + 1, nc).getValues();
    for (var i = v.length - 1; i >= 0 && k < lim; i--) if (String(v[i][1]) === login) { rows.push(v[i].slice(0, nc)); k++; }
  }
  cauda('Últimos extratos', 2, ['ts', 'login', 'tipo', 'moeda', 'v', 'brl', 'outro', 'nota', 'saldo_apos', 'id'], 10, 30);
  cauda('Últimos logs', 2, ['ts', 'login', 'evento', 'detalhe'], 4, 40);
  cauda('Resultados recentes', 2, ['ts', 'login', 'turma', 'trimestre', 'disc', 'cod', 'atividade', 'acertos', 'erros', 'pct', 'concluido'], 11, 30);
  var w = 0; rows.forEach(function (r) { if (r.length > w) w = r.length; });
  var out = rows.map(function (r) { var x = r.slice(); while (x.length < w) x.push(''); return x; });
  var ab = ss.getSheetByName('Aluno');
  if (!ab) ab = ss.insertSheet('Aluno'); else ab.clear();
  ab.getRange(1, 1, out.length, w).setValues(out);
  tit.forEach(function (i) { ab.getRange(i + 1, 1, 1, w).setFontWeight('bold').setBackground('#e8f0fe'); });
  ab.setColumnWidth(1, 160);
  return eb_aviso_('Aba "Aluno" atualizada para ' + login + '.');
}

// Registro de cada resposta dos alunos no RobIox (aba "RobIox-Respostas")
function rbxResp_(d) {
  var login = String(d.login || '').toLowerCase();
  if (!/^(\d{1,3}[a-z]{3}\d[a-z]|teste|mainara)$/.test(login)) return ok_('login inválido');
  var its = d.itens || [];
  if (!its.length || its.length > 200) return ok_('vazio');
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (err) { return ok_('ocupado'); }
  try {
    var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName('RobIox-Respostas');
    if (!sh) {
      sh = ss.insertSheet('RobIox-Respostas');
      sh.appendRow(['Data/hora', 'Login', 'Matéria', 'Mundo', 'Fase', 'Tema', 'Nível', 'Pergunta', 'Resposta correta', 'Aluno marcou', 'Acertou?', 'Tentativa nº']);
      sh.setFrozenRows(1);
      try { rbxBeleza_(); } catch (err) { }
    }
    var rows = its.map(function (x) {
      return [new Date(Number(x.t) || Date.now()), login, String(x.mat || ''), String(x.mundo || ''), Number(x.fase) || '', String(x.tema || ''), Number(x.nivel) || '', String(x.q || '').slice(0, 300), String(x.certa || '').slice(0, 100), String(x.marcou || '').slice(0, 100), x.ok ? 'SIM' : 'NÃO', Number(x.tent) || ''];
    });
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    return ok_('ok');
  } finally { lock.releaseLock(); }
}

// ---- RobIox: planilha "RobIox-Alunos" (uma linha por aluno) e dados do painel ao vivo ----
var RBX_KEY = 'ludo2026';
var RBX_SENHA = '2026.2026';
// ---- Bloqueio de acesso (banimento temporário) ----
function rbxBloqAba_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('RobIox-Bloqueios');
  if (!sh) { sh = ss.insertSheet('RobIox-Bloqueios'); sh.appendRow(['login', 'ate', 'minutos', 'quando']); sh.setFrozenRows(1); }
  return sh;
}
function rbxBloqueio_(login) {
  try {
    var sh = rbxBloqAba_(), n = sh.getLastRow();
    if (n < 2) return 0;
    var v = sh.getRange(2, 1, n - 1, 2).getValues();
    for (var i = 0; i < v.length; i++) if (String(v[i][0]) === login) return Number(v[i][1]) || 0;
  } catch (e) { }
  return 0;
}
function rbxBan_(d) {
  if (String(d.k || '') !== RBX_KEY) return ok_('sem permissao');
  var login = String(d.login || '').toLowerCase();
  if (!/^(\d{1,3}[a-z]{3}\d[a-z]|teste|mainara)$/.test(login)) return ok_('login invalido');
  var min = Math.max(0, Math.min(10080, Math.round(Number(d.min) || 0)));
  var ate = min ? Date.now() + min * 60000 : 0;
  var lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (err) { return ok_('ocupado'); }
  try {
    var sh = rbxBloqAba_(), n = sh.getLastRow(), ids = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues() : [], row = 0;
    for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === login) { row = i + 2; break; }
    var linha = [login, ate, min, new Date()];
    if (row) sh.getRange(row, 1, 1, 4).setValues([linha]); else sh.appendRow(linha);
    return ok_('ok');
  } finally { lock.releaseLock(); }
}

var RBX_COLS = ['Login', 'Senha', 'Nick', 'Série / matéria', 'Nível', 'XP', 'Moedas', 'Cofrinho (R$)', 'Gasto na loja (moedas)', 'Vendido (moedas)', 'Itens', 'Fases começadas', 'Fases concluídas', '% concluído', 'Estrelas', 'Acertos (jogo)', 'Fases perfeitas', 'Melhor sequência', 'Mundos concluídos', 'Respostas registradas', '% acertos', 'Nota (% concluído)', 'Nota (% acertos)', 'Última atividade', 'Gastos detalhados', 'Cofrinho detalhado', 'json'];
function rbxSerie_(a) { a = Number(a); return a >= 6 && a <= 9 ? a + 'º ano (Matemática)' : a === 10 ? 'Inglês' : ({ 11: '1ª série · Educação financeira', 11.5: '' })[a] || ({ 12: 'História', 13: 'Geografia', 14: 'Espanhol', 15: 'Educação Financeira' })[a] || String(a); }
function rbxAlunos_(login, ts, s) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('RobIox-Alunos');
  if (!sh) {
    sh = ss.insertSheet('RobIox-Alunos');
    sh.getRange(1, 1, 1, RBX_COLS.length).setValues([RBX_COLS]).setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold').setWrap(true).setVerticalAlignment('middle');
    sh.setFrozenRows(1); sh.setFrozenColumns(1); sh.setRowHeight(1, 44);
    sh.setColumnWidths(1, RBX_COLS.length - 1, 105); sh.setColumnWidth(25, 380); sh.setColumnWidth(26, 260); sh.hideColumns(27);
    var r1 = SpreadsheetApp.newConditionalFormatRule().setGradientMaxpointWithValue('#57bb8a', SpreadsheetApp.InterpolationType.NUMBER, '10').setGradientMinpointWithValue('#f4c7c3', SpreadsheetApp.InterpolationType.NUMBER, '0').setRanges([sh.getRange('V2:W2000')]).build();
    sh.setConditionalFormatRules([r1]);
  }
  var n = sh.getLastRow(), row = 0;
  if (n > 1) { var ids = sh.getRange(2, 1, n - 1, 1).getValues(); for (var i = 0; i < ids.length; i++) if (ids[i][0] === login) { row = i + 2; break; } }
  if (!row) row = n + 1;
  var st = s.stat || {}, j = s.jar || {}, tot = Number(s.tot) || 50, fim = Number(s.fim) || 0, pct = Math.round(fim / tot * 100);
  var gastos = (s.gastos || []).map(function (g) { return Utilities.formatDate(new Date(g.t), 'America/Sao_Paulo', 'dd/MM HH:mm') + ' ' + g.item + ' (' + g.preco + ' moedas)'; }).join(' | ');
  var nd = j.nd || {}, notas = Object.keys(nd).sort(function (a, b) { return b - a; }).map(function (k) { return nd[k] + '× R$' + k; });
  var cof = 'moedas: ' + (j.moedas1 || 0) + '× R$1 · ' + (j.moedas50 || 0) + '× 50c · ' + (j.moedas25 || 0) + '× 25c' + (notas.length ? ' · notas: ' + notas.join(', ') : '');
  var vals = [login, RBX_SENHA, s.nick || '', rbxSerie_(s.ano), s.nivel || 1, s.xp || 0, s.coins || 0, (Number(s.cash) || 0) / 100, s.spent || 0, s.sold || 0, (s.own || []).length, Number(s.ini) || 0, fim, pct / 100, s.est || 0, st.correct || 0, st.perfeitas || 0, st.combo || 0, st.mundos || 0, '', '', '', '', new Date(Number(s.t) || Number(ts) || Date.now()), gastos, cof, JSON.stringify(s).slice(0, 45000)];
  sh.getRange(row, 1, 1, 2).setNumberFormat('@');
  sh.getRange(row, 1, 1, vals.length).setValues([vals]);
  var rs = "'RobIox-Respostas'";
  sh.getRange(row, 20).setFormula('=IFERROR(COUNTIF(' + rs + '!B:B,A' + row + '),0)');
  sh.getRange(row, 21).setFormula('=IFERROR(COUNTIFS(' + rs + '!B:B,A' + row + ',' + rs + '!K:K,"SIM")/T' + row + ',0)');
  sh.getRange(row, 22).setFormula('=ROUND(N' + row + '*10,1)');
  sh.getRange(row, 23).setFormula('=ROUND(U' + row + '*10,1)');
  sh.getRange(row, 14).setNumberFormat('0%'); sh.getRange(row, 21).setNumberFormat('0%'); sh.getRange(row, 8).setNumberFormat('"R$" #,##0.00'); sh.getRange(row, 24).setNumberFormat('dd/MM/yyyy HH:mm');
}
function rbxDash_(p) {
  if (String(p.k || '') !== RBX_KEY) return ContentService.createTextOutput(JSON.stringify({ ok: 0 })).setMimeType(ContentService.MimeType.JSON);
  var ss = SpreadsheetApp.getActiveSpreadsheet(), out = { ok: 1, agora: Date.now(), alunos: [], recentes: [] }, sh = ss.getSheetByName('RobIox-Alunos'), rs = ss.getSheetByName('RobIox-Respostas'), cnt = {};
  if (rs && rs.getLastRow() > 1) {
    var rn = rs.getLastRow(), v = rs.getRange(2, 1, rn - 1, 12).getValues();
    v.forEach(function (r) { var l = r[1]; cnt[l] = cnt[l] || { n: 0, ok: 0, t: {} }; cnt[l].n++; var tm = String(r[5] || '-'); cnt[l].t[tm] = cnt[l].t[tm] || { n: 0, ok: 0 }; cnt[l].t[tm].n++; if (r[10] === 'SIM') { cnt[l].ok++; cnt[l].t[tm].ok++; } });
    out.recentes = v.slice(-30).reverse().map(function (r) { return { t: new Date(r[0]).getTime(), login: r[1], mat: r[2], mundo: r[3], fase: r[4], tema: r[5], q: r[7], ok: r[10] === 'SIM' }; });
  }
  if (sh && sh.getLastRow() > 1) {
    var d = sh.getRange(2, 1, sh.getLastRow() - 1, 27).getValues();
    d.forEach(function (r) {
      var s = {}; try { s = JSON.parse(r[26]); } catch (e) { }
      var c = cnt[r[0]] || { n: 0, ok: 0 };
      out.alunos.push({ login: r[0], nick: r[2], serie: r[3], nivel: r[4], xp: r[5], moedas: r[6], cofrinho: r[7], gasto: r[8], vendido: r[9], itens: r[10], ini: r[11], fim: r[12], pct: r[13], est: r[14], acertosJogo: r[15], perfeitas: r[16], combo: r[17], mundos: r[18], resp: c.n, respOk: c.ok, ultima: new Date(r[23]).getTime(), own: s.own || [], gastos: (s.gastos || []).slice(0, 8), ganhas: s.ganhas || 0, atual: s.atual || null, mw: s.mw || {}, temas: c.t || {} });
    });
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// Deixa as abas do RobIox bonitas e organizadas (não apaga nada)
function rbxBeleza_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  function cab(sh, n, cor) { var h = sh.getRange(1, 1, 1, n); h.setBackground(cor).setFontColor('#ffffff').setFontWeight('bold').setWrap(true).setVerticalAlignment('middle').setHorizontalAlignment('center'); sh.setRowHeight(1, 44); sh.setFrozenRows(1); }
  function faixas(sh, n) { try { sh.getBandings().forEach(function (b) { b.remove(); }); sh.getRange(1, 1, Math.max(sh.getMaxRows(), 2), n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false); } catch (e) { } }
  function filtro(sh, n) { try { var f = sh.getFilter(); if (f) f.remove(); sh.getRange(1, 1, Math.max(sh.getLastRow(), 2), n).createFilter(); } catch (e) { } }
  var al = ss.getSheetByName('RobIox-Alunos');
  if (al) {
    al.setTabColor('#1e3a8a'); cab(al, 26, '#1e3a8a'); al.setFrozenColumns(1);
    al.getRange(2, 2, Math.max(al.getMaxRows() - 1, 1), 25).setHorizontalAlignment('center').setVerticalAlignment('middle');
    al.getRange(2, 25, Math.max(al.getMaxRows() - 1, 1), 2).setHorizontalAlignment('left').setWrap(true);
    al.getRange(2, 1, Math.max(al.getMaxRows() - 1, 1), 1).setFontWeight('bold');
    faixas(al, 26); filtro(al, 26);
    al.getRange(1, 20, 1, 1).setNote('Total de respostas registradas na aba RobIox-Respostas');
    al.getRange(1, 14, 1, 1).setNote('Fases concluídas ÷ total de fases da série');
    al.getRange(1, 21, 1, 1).setNote('Acertos ÷ respostas registradas');
  }
  var rs = ss.getSheetByName('RobIox-Respostas');
  if (rs) {
    rs.setTabColor('#16a34a'); cab(rs, 12, '#15803d');
    var w = [135, 90, 115, 130, 55, 130, 60, 420, 140, 140, 80, 80];
    w.forEach(function (x, i) { rs.setColumnWidth(i + 1, x); });
    var n = Math.max(rs.getMaxRows() - 1, 1);
    rs.getRange(2, 1, n, 1).setNumberFormat('dd/MM/yyyy HH:mm');
    rs.getRange(2, 8, n, 1).setWrap(true); rs.getRange(2, 5, n, 1).setHorizontalAlignment('center'); rs.getRange(2, 7, n, 1).setHorizontalAlignment('center'); rs.getRange(2, 11, n, 2).setHorizontalAlignment('center').setFontWeight('bold');
    rs.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('SIM').setBackground('#c8f7d4').setFontColor('#166534').setRanges([rs.getRange(2, 11, n, 1)]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NÃO').setBackground('#fecaca').setFontColor('#991b1b').setRanges([rs.getRange(2, 11, n, 1)]).build()]);
    faixas(rs, 12); filtro(rs, 12);
  }
  var pr = ss.getSheetByName('RobIox');
  if (pr) { pr.setTabColor('#94a3b8'); cab(pr, 3, '#475569'); pr.setColumnWidth(1, 110); pr.setColumnWidth(2, 120); pr.setColumnWidth(3, 300); pr.getRange(1, 1).setNote('Aba técnica: guarda o progresso bruto de cada aluno (usada pelo jogo para continuar de onde parou). Veja os dados organizados em RobIox-Alunos.'); }
  [['RobIox-Alunos', 0], ['RobIox-Respostas', 1], ['RobIox', 2]].forEach(function (x) { var sh = ss.getSheetByName(x[0]); if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(ss.getNumSheets() - 2 + x[1]); } });
}


// ---- Corrida ao vivo (Batatinha Frita): presença em memória (CacheService), sem gravar na planilha ----
function rbxLive_(p) {
  var sala = String(p.sala || 'batatinha').replace(/[^a-z0-9_]/gi, '').slice(0, 20) || 'batatinha';
  var cache = CacheService.getScriptCache(), key = 'live_' + sala;
  var lock = LockService.getScriptLock(), got = false;
  try { got = lock.tryLock(3000); } catch (err) {}
  var m = {};
  try { m = JSON.parse(cache.get(key) || '{}'); } catch (err) { m = {}; }
  var now = Date.now();
  if (p.login && /^[A-Za-z0-9]{3,12}$/.test(p.login)) {
    m[p.login] = { n: String(p.nick || '').slice(0, 20), p: Number(p.pos) || 0, v: Number(p.vidas) || 0, s: String(p.est || '').slice(0, 10), t: now };
  }
  for (var k in m) { if (now - m[k].t > 12000 || m[k].s === 'saiu') delete m[k]; }
  try { cache.put(key, JSON.stringify(m), 120); } catch (err) {}
  if (got) lock.releaseLock();
  return ContentService.createTextOutput(JSON.stringify({ now: now, players: m })).setMimeType(ContentService.MimeType.JSON);
}

// =====================================================================================================
// INVESTIR (EduBank etapa 2) — cotações, renda fixa, Tesouro Direto, ações/FIIs/ETFs, fundos (CVM), carteira.
// R$ vive no aparelho do aluno (centavos): compras/aplicações o cliente DEBITA (confere saldo e manda `cash`);
// vendas/resgates/proventos voltam por CRÉDITO PENDENTE (aba Creditos; ações receber/receberack).
// Ações: ativos, historico, serie, rfprodutos, tdtitulos, fundos, rfaplicar, rfresgatar, invcomprar, invvender, invcarteira.
// Fontes (grátis, sem chave): Yahoo Finance chart v8 (reserva brapi.dev e última cotação gravada na aba Cotacoes),
// BCB SGS 11/12/226/432/433, FRED (DGS3MO/DGS10), Tesouro Transparente (CSV preço e taxa), CVM Informe Diário (aba Fundos).
// Nunca inventa preço: sem fonte, devolve fonte 'anterior' (com a hora da última boa) ou omite o item.
// Gatilho diário: ebiAtualizarFundos() (baixa 1 mês do Informe Diário por execução). Simulação educacional.
// =====================================================================================================
var EBI_UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' };
var EBI_ATIVOS = (function () {
  var L = [];
  function add(m, tipo, arr, suf, moeda, comp) { arr.forEach(function (x) { L.push({ cod: x[0], nome: x[1], tipo: tipo, mercado: m, y: x[2] || (x[0] + suf), moeda: moeda, comp: comp }); }); }
  add('br', 'indice', [['IBOV', 'Ibovespa', '^BVSP']], '', 'BRL', 0);
  add('br', 'acao', [['PETR4', 'Petrobras PN'], ['VALE3', 'Vale ON'], ['ITUB4', 'Itaú Unibanco PN'], ['BBDC4', 'Bradesco PN'], ['BBAS3', 'Banco do Brasil ON'], ['WEGE3', 'WEG ON'], ['ABEV3', 'Ambev ON'], ['MGLU3', 'Magazine Luiza ON'], ['LREN3', 'Lojas Renner ON'], ['RENT3', 'Localiza ON'], ['SUZB3', 'Suzano ON'], ['B3SA3', 'B3 ON'], ['ELET3', 'Eletrobras ON'], ['RDOR3', "Rede D'Or ON"], ['RADL3', 'RaiaDrogasil ON'], ['EQTL3', 'Equatorial ON'], ['PRIO3', 'PRIO ON'], ['JBSS3', 'JBS ON'], ['GGBR4', 'Gerdau PN'], ['CSNA3', 'CSN ON'], ['CMIG4', 'Cemig PN'], ['SBSP3', 'Sabesp ON'], ['VIVT3', 'Vivo ON'], ['TIMS3', 'TIM ON'], ['RAIL3', 'Rumo ON'], ['EMBR3', 'Embraer ON'], ['HAPV3', 'Hapvida ON'], ['CPLE6', 'Copel PNB'], ['UGPA3', 'Ultrapar ON'], ['BBSE3', 'BB Seguridade ON'], ['ITSA4', 'Itaúsa PN'], ['KLBN11', 'Klabin UNT'], ['TAEE11', 'Taesa UNT'], ['ASAI3', 'Assaí ON']], '.SA', 'BRL', 1);
  add('br', 'bdr', [['AAPL34', 'Apple (BDR)'], ['MSFT34', 'Microsoft (BDR)'], ['AMZO34', 'Amazon (BDR)'], ['GOGL34', 'Alphabet (BDR)'], ['NFLX34', 'Netflix (BDR)'], ['TSLA34', 'Tesla (BDR)'], ['NVDC34', 'Nvidia (BDR)'], ['DISB34', 'Disney (BDR)'], ['COCA34', 'Coca-Cola (BDR)'], ['MELI34', 'Mercado Livre (BDR)']], '.SA', 'BRL', 1);
  add('br', 'fii', [['HGLG11', 'CSHG Logística'], ['KNRI11', 'Kinea Renda Imobiliária'], ['MXRF11', 'Maxi Renda'], ['XPLG11', 'XP Log'], ['VISC11', 'Vinci Shopping Centers'], ['XPML11', 'XP Malls'], ['BTLG11', 'BTG Logística'], ['KNCR11', 'Kinea Rendimentos (papel)'], ['HGRU11', 'CSHG Renda Urbana'], ['BCFF11', 'BTG Fundo de Fundos']], '.SA', 'BRL', 1);
  add('br', 'fiagro', [['KNCA11', 'Kinea Crédito Agro'], ['RZAG11', 'Riza Terrax Agro'], ['VGIA11', 'Valora CRA Agro']], '.SA', 'BRL', 1);
  add('br', 'etf', [['BOVA11', 'iShares Ibovespa'], ['IVVB11', 'iShares S&P 500'], ['SMAL11', 'iShares Small Caps'], ['DIVO11', 'It Now Dividendos'], ['NASD11', 'Trend Nasdaq 100'], ['SPXI11', 'It Now S&P 500'], ['GOLD11', 'Trend Ouro'], ['HASH11', 'Hashdex Cripto']], '.SA', 'BRL', 1);
  add('int', 'indice', [['SPX', 'S&P 500', '^GSPC'], ['IXIC', 'Nasdaq Composite', '^IXIC'], ['DJI', 'Dow Jones', '^DJI'], ['DAX', 'DAX (Alemanha)', '^GDAXI'], ['FTSE', 'FTSE 100 (Reino Unido)', '^FTSE'], ['N225', 'Nikkei 225 (Japão)', '^N225']], '', 'USD', 0);
  add('int', 'etf', [['SPY', 'SPDR S&P 500'], ['VOO', 'Vanguard S&P 500'], ['QQQ', 'Invesco Nasdaq 100'], ['VT', 'Vanguard Mundo'], ['EEM', 'iShares Emergentes'], ['IVV', 'iShares S&P 500']], '', 'USD', 1);
  add('int', 'acao', [['AAPL', 'Apple'], ['MSFT', 'Microsoft'], ['AMZN', 'Amazon'], ['GOOGL', 'Alphabet (Google)'], ['NVDA', 'Nvidia'], ['TSLA', 'Tesla'], ['META', 'Meta'], ['KO', 'Coca-Cola'], ['DIS', 'Disney'], ['JPM', 'JPMorgan']], '', 'USD', 1);
  add('int', 'cripto', [['BTC', 'Bitcoin', 'BTC-USD'], ['ETH', 'Ethereum', 'ETH-USD'], ['SOL', 'Solana', 'SOL-USD'], ['XRP', 'XRP', 'XRP-USD'], ['DOGE', 'Dogecoin', 'DOGE-USD']], '', 'USD', 0);
  return L;
})();
var EBI_BY = {}; EBI_ATIVOS.forEach(function (a) { EBI_BY[a.cod] = a; });

function eb_i_yh_(sym, range, intv, ev) {
  return { url: 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=' + range + '&interval=' + intv + (ev ? '&events=div' : ''), headers: EBI_UA, muteHttpExceptions: true };
}
function eb_i_parse_(txt) {
  try {
    var r = JSON.parse(txt).chart.result[0], m = r.meta, q = r.indicators.quote[0], ts = r.timestamp || [], cl = [], i;
    for (i = 0; i < ts.length; i++) { var c = q.close[i]; if (c != null && isFinite(c)) cl.push(c); }
    var p = Number(m.regularMarketPrice); if (!isFinite(p) || p <= 0) return null;
    var prev = cl.length >= 2 ? (Math.abs(cl[cl.length - 1] - p) <= p * 0.0005 ? cl[cl.length - 2] : cl[cl.length - 1]) : Number(m.chartPreviousClose);
    var tp = m.currentTradingPeriod && m.currentTradingPeriod.regular, agora = Date.now() / 1000;
    var ab = /CRYPTO|CURRENCY/.test(String(m.instrumentType)) ? true : !!(tp && agora >= tp.start && agora <= tp.end);
    return { p: p, ant: isFinite(prev) && prev > 0 ? prev : null, ts: (Number(m.regularMarketTime) || 0) * 1000, aberto: ab, sp: cl.slice(-22).map(function (x) { return Math.round(x * 10000) / 10000; }), moeda: String(m.currency || '') };
  } catch (e) { return null; }
}
function eb_i_brapi_(cod) {
  try {
    var tok = PropertiesService.getScriptProperties().getProperty('brapi_token');
    var r = UrlFetchApp.fetch('https://brapi.dev/api/quote/' + encodeURIComponent(cod) + (tok ? '?token=' + tok : ''), { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    var o = JSON.parse(r.getContentText()).results[0], p = Number(o.regularMarketPrice), ch = Number(o.regularMarketChange);
    if (!isFinite(p) || p <= 0) return null;
    return { p: p, ant: isFinite(ch) ? p - ch : null, ts: Date.parse(o.regularMarketTime) || Date.now(), aberto: false, sp: [], moeda: 'BRL' };
  } catch (e) { return null; }
}
function eb_i_cotLer_() {
  var sh = eb_aba_('Cotacoes'), n = sh.getLastRow(), o = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 5).getValues().forEach(function (r) { o[String(r[0])] = { p: Number(r[1]), ant: r[2] === '' ? null : Number(r[2]), ts: Number(r[3]), moeda: String(r[4]) }; });
  return o;
}
function eb_i_ativos_() {
  var c = CacheService.getScriptCache(), s = c.get('ebi_at'); if (s) { try { return JSON.parse(s); } catch (e) { } }
  var got = {}, i, j, nOk = 0;
  for (i = 0; i < EBI_ATIVOS.length; i += 25) {
    var lote = EBI_ATIVOS.slice(i, i + 25), res = [];
    try { res = UrlFetchApp.fetchAll(lote.map(function (a) { return eb_i_yh_(a.y, '1mo', '1d'); })); } catch (e) { res = []; }
    for (j = 0; j < lote.length; j++) { var q = res[j] && res[j].getResponseCode() === 200 ? eb_i_parse_(res[j].getContentText()) : null; if (q) { q.fonte = 'Yahoo Finance'; got[lote[j].cod] = q; nOk++; } }
  }
  EBI_ATIVOS.forEach(function (a) { if (!got[a.cod] && a.mercado === 'br' && a.comp) { var q = eb_i_brapi_(a.cod); if (q) { q.fonte = 'brapi.dev'; got[a.cod] = q; } } });
  var old = {}; try { old = eb_i_cotLer_(); } catch (e) { }
  var itens = [], linhas = [];
  EBI_ATIVOS.forEach(function (a) {
    var q = got[a.cod], fonte;
    if (q) fonte = q.fonte; else if (old[a.cod] && old[a.cod].p > 0) { q = old[a.cod]; q.aberto = false; q.sp = []; fonte = 'anterior'; } else return;
    itens.push({ cod: a.cod, nome: a.nome, tipo: a.tipo, mercado: a.mercado, moeda: a.moeda, comp: a.comp, preco: q.p, ant: q.ant, 'var': q.ant ? Math.round((q.p / q.ant - 1) * 10000) / 100 : null, ts: q.ts, aberto: !!q.aberto, fonte: fonte, sp: q.sp || [] });
    if (fonte !== 'anterior') linhas.push([a.cod, q.p, q.ant == null ? '' : q.ant, q.ts, a.moeda]);
  });
  if (nOk >= 5) {   // grava reserva (última cotação boa de cada ativo)
    try {
      var merged = {}; Object.keys(old).forEach(function (k) { merged[k] = [k, old[k].p, old[k].ant == null ? '' : old[k].ant, old[k].ts, old[k].moeda]; }); linhas.forEach(function (l) { merged[l[0]] = l; });
      var arr = Object.keys(merged).map(function (k) { return merged[k]; }), sh = eb_aba_('Cotacoes');
      if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 5).clearContent();
      sh.getRange(2, 1, arr.length, 5).setValues(arr);
    } catch (e) { }
  }
  var out = { ts: Date.now(), fonte: nOk ? 'Yahoo Finance' : 'indisponivel', itens: itens };
  try { c.put('ebi_at', JSON.stringify(out), nOk ? 600 : 60); } catch (e) { }
  return out;
}
function eb_i_cot_(cod) { var l = eb_i_ativos_().itens; for (var i = 0; i < l.length; i++) if (l[i].cod === cod) return l[i]; return null; }
function eb_i_ativosResp_() { var o = eb_i_ativos_(); return { ok: 1, itens: o.itens, ts: o.ts, fonte: o.fonte }; }
// {ok,pts:[[ts,o,h,l,c]...]}
function eb_i_historico_(p) {
  var cod = String(p.cod || '').toUpperCase(), a = EBI_BY[cod], pp = String(p.p || '1m');
  if (!a) return eb_erro_('Ativo inválido.');
  var M = { '1m': ['1mo', '1d'], '6m': ['6mo', '1d'], '1a': ['1y', '1d'], '5a': ['5y', '1wk'] }, m = M[pp]; if (!m) return eb_erro_('Período inválido.');
  var c = CacheService.getScriptCache(), k = 'ebi_h_' + cod + pp, s = c.get(k), r0;
  if (s) { try { return JSON.parse(s); } catch (e) { } }
  try { r0 = UrlFetchApp.fetch(eb_i_yh_(a.y, m[0], m[1]).url, { headers: EBI_UA, muteHttpExceptions: true }); } catch (e) { return eb_erro_('Histórico indisponível agora.'); }
  if (r0.getResponseCode() !== 200) return eb_erro_('Histórico indisponível agora.');
  try {
    var r = JSON.parse(r0.getContentText()).chart.result[0], q = r.indicators.quote[0], pts = [], i, f = function (x) { return Math.round(x * 10000) / 10000; };
    for (i = 0; i < r.timestamp.length; i++) if (q.close[i] != null && q.open[i] != null) pts.push([r.timestamp[i], f(q.open[i]), f(q.high[i]), f(q.low[i]), f(q.close[i])]);
    var out = { ok: 1, cod: cod, moeda: a.moeda, pts: pts, fonte: 'Yahoo Finance', ts: Date.now() };
    try { c.put(k, JSON.stringify(out), 21600); } catch (e) { }
    return out;
  } catch (e) { return eb_erro_('Histórico indisponível agora.'); }
}
// proventos: [[ts_s, valor]] (cache 6 h)
function eb_i_divs_(cod) {
  var a = EBI_BY[cod], c = CacheService.getScriptCache(), k = 'ebi_d_' + cod, s = c.get(k);
  if (s) { try { return JSON.parse(s); } catch (e) { } }
  var out = [];
  try {
    var r0 = UrlFetchApp.fetch(eb_i_yh_(a.y, '2y', '1mo', 1).url, { headers: EBI_UA, muteHttpExceptions: true });
    if (r0.getResponseCode() === 200) {
      var d = JSON.parse(r0.getContentText()).chart.result[0].events; d = d && d.dividends ? d.dividends : {};
      Object.keys(d).forEach(function (t) { var x = d[t]; if (x && x.amount > 0) out.push([Number(x.date), Number(x.amount)]); });
      out.sort(function (a1, b1) { return a1[0] - b1[0]; });
      try { c.put(k, JSON.stringify(out), 21600); } catch (e) { }
    }
  } catch (e) { }
  return out;
}

// ---------- BCB / FRED ----------
function eb_i_ymd_(ms) { return Number(Utilities.formatDate(new Date(ms), TZ, 'yyyyMMdd')); }
function eb_i_fetchJson_(url) {
  try { var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true }); if (r.getResponseCode() === 200) return JSON.parse(r.getContentText()); } catch (e) { }
  return null;
}
// série diária [[ymd,valor]] dos últimos ~2 anos (cache 6 h; reserva em Script Property compacta)
function eb_i_sgs_(serie) {
  var c = CacheService.getScriptCache(), k = 'ebi_sgs' + serie, s = c.get(k); if (s) { try { return JSON.parse(s); } catch (e) { } }
  var ini = Utilities.formatDate(new Date(Date.now() - 740 * 86400000), TZ, 'dd/MM/yyyy');
  var j = eb_i_fetchJson_('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + serie + '/dados?formato=json&dataInicial=' + ini), p = PropertiesService.getScriptProperties(), out = [];
  if (j && j.length) {
    j.forEach(function (o) { var d = String(o.data).split('/'), v = Number(o.valor); if (d.length === 3 && isFinite(v)) out.push([Number(d[2] + d[1] + d[0]), v]); });
    try { p.setProperty('ebi_bk' + serie, out.slice(-330).map(function (r) { return r[0] + ':' + r[1]; }).join(';')); } catch (e) { }
    try { c.put(k, JSON.stringify(out), 21600); } catch (e) { }
  } else {
    var b = p.getProperty('ebi_bk' + serie); if (b) b.split(';').forEach(function (x) { var q = x.split(':'); out.push([Number(q[0]), Number(q[1])]); });
  }
  return out;
}
function eb_i_bcbTaxas_() {
  var c = CacheService.getScriptCache(), s = c.get('ebi_bcb'); if (s) { try { return JSON.parse(s); } catch (e) { } }
  var p = PropertiesService.getScriptProperties(), o = { ts: Date.now(), fonte: 'BCB (SGS 12, 226, 432, 433)' };
  var cdi = eb_i_sgs_(12), l = cdi.length ? cdi[cdi.length - 1] : null;
  var se = eb_i_fetchJson_('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json');
  var ip = eb_i_fetchJson_('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json');
  var tr = eb_i_fetchJson_('https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados/ultimos/1?formato=json');
  if (l) { o.cdi_d = l[1]; o.cdi_data = l[0]; o.cdi_aa = (Math.pow(1 + l[1] / 100, 252) - 1) * 100; }
  if (se && se.length) o.selic_aa = Number(se[0].valor);
  if (ip && ip.length) { var f = 1; ip.forEach(function (x) { f *= 1 + Number(x.valor) / 100; }); o.ipca_12m = (f - 1) * 100; o.ipca_ult = Number(ip[ip.length - 1].valor); o.ipca_ref = ip[ip.length - 1].data; o.ipca_n = ip.length; }
  if (tr && tr.length) o.tr_m = Number(tr[0].valor);
  var ok = o.cdi_aa && o.selic_aa && o.ipca_12m != null && o.tr_m != null;
  if (ok) { try { p.setProperty('ebi_bcb_ok', JSON.stringify(o)); } catch (e) { } }
  else { try { var b = JSON.parse(p.getProperty('ebi_bcb_ok') || 'null'); if (b) { Object.keys(b).forEach(function (k) { if (o[k] == null) o[k] = b[k]; }); o.fonte = 'BCB (última leitura salva)'; o.ts = b.ts; } } catch (e) { } }
  try { c.put('ebi_bcb', JSON.stringify(o), ok ? 21600 : 120); } catch (e) { }
  return o;
}
function eb_i_usa_() {
  var c = CacheService.getScriptCache(), s = c.get('ebi_usa'); if (s) { try { return JSON.parse(s); } catch (e) { } }
  var p = PropertiesService.getScriptProperties(), o = null;
  try {
    var r = UrlFetchApp.fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS3MO,DGS10', { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      var ls = r.getContentText().split('\n'), a = null, b = null, da = '', db = '';
      for (var i = ls.length - 1; i > 0 && (a == null || b == null); i--) { var q = ls[i].trim().split(','); if (q.length < 3) continue; if (a == null && isFinite(parseFloat(q[1]))) { a = parseFloat(q[1]); da = q[0]; } if (b == null && isFinite(parseFloat(q[2]))) { b = parseFloat(q[2]); db = q[0]; } }
      if (a != null && b != null) o = { y3m: a, y10: b, d3m: da, d10: db, fonte: 'FRED (Federal Reserve)', ts: Date.now() };
    }
  } catch (e) { }
  if (o) { try { p.setProperty('ebi_usa_ok', JSON.stringify(o)); c.put('ebi_usa', JSON.stringify(o), 21600); } catch (e) { } }
  else { try { o = JSON.parse(p.getProperty('ebi_usa_ok') || 'null'); if (o) o.fonte += ' (anterior)'; } catch (e) { } }
  return o || { y3m: null, y10: null, fonte: 'indisponivel', ts: Date.now() };
}
// {s:'cdi'|'ipca'|'selic', anos:1..10} -> meses [[yyyymm, % no mês]]
function eb_i_serie_(p) {
  var s = String(p.s || ''), anos = eb_int_(p.anos == null ? 5 : p.anos, 1, 10), cod = { cdi: 12, ipca: 433, selic: 11 }[s];
  if (!cod || isNaN(anos)) return eb_erro_('Série inválida.');
  var c = CacheService.getScriptCache(), k = 'ebi_m_' + s + anos, ca = c.get(k); if (ca) { try { return JSON.parse(ca); } catch (e) { } }
  var ini = Utilities.formatDate(new Date(Date.now() - (anos * 365 + 20) * 86400000), TZ, 'dd/MM/yyyy');
  var j = eb_i_fetchJson_('https://api.bcb.gov.br/dados/serie/bcdata.sgs.' + cod + '/dados?formato=json&dataInicial=' + ini);
  if (!j || !j.length) return eb_erro_('Série indisponível agora.');
  var m = {}, ord = [];
  j.forEach(function (o) { var d = String(o.data).split('/'), v = Number(o.valor), ym = d[2] + d[1]; if (!isFinite(v)) return; if (!(ym in m)) { m[ym] = 1; ord.push(ym); } m[ym] *= (1 + v / 100); });
  var out = { ok: 1, s: s, meses: ord.map(function (ym) { return [Number(ym), Math.round((m[ym] - 1) * 1e6) / 1e4]; }), fonte: 'BCB SGS ' + cod, ts: Date.now() };
  try { c.put(k, JSON.stringify(out), 43200); } catch (e) { }
  return out;
}

// ---------- produtos de renda fixa ----------
var EBI_RF = [
  { id: 'poup', nome: 'Poupança', grupo: 'rf', tipo: 'poup', car: 0, liq: 'D+0 (rende no aniversário mensal)', risco: 'baixo', ir: 'isento', iof: 0, desc: 'Rende 0,5% ao mês + TR (ou 70% da Selic se a Selic ≤ 8,5% a.a.). Sem IR.' },
  { id: 'cdb100', nome: 'CDB liquidez diária 100% do CDI', grupo: 'rf', tipo: 'pos', pct: 1, car: 0, liq: 'D+0', risco: 'baixo', ir: 'reg', iof: 1, desc: 'O banco toma seu dinheiro emprestado. Protegido pelo FGC até R$ 250 mil. IR regressivo.' },
  { id: 'cdb115', nome: 'CDB 115% do CDI (90 dias)', grupo: 'rf', tipo: 'pos', pct: 1.15, car: 90, liq: 'No vencimento (90 dias)', risco: 'baixo', ir: 'reg', iof: 1, desc: 'Paga mais por prender o dinheiro 90 dias. FGC até R$ 250 mil.' },
  { id: 'lci90', nome: 'LCI/LCA 90% do CDI (90 dias)', grupo: 'rf', tipo: 'pos', pct: 0.9, car: 90, liq: 'No vencimento (90 dias)', risco: 'baixo', ir: 'isento', iof: 0, desc: 'Isenta de IR para pessoa física. Rende menos que o CDB, mas sem imposto.' },
  { id: 'cri', nome: 'CRI/CRA (referência: CDI + 2,0% a.a.)', grupo: 'rf', tipo: 'pos', pct: 1, spr: 0.02, car: 180, liq: 'No vencimento (carência 180 dias)', risco: 'medio', ir: 'isento', iof: 0, ref: 1, desc: 'Título lastreado em recebíveis imobiliários/do agro. Isento de IR, sem FGC. TAXA DE REFERÊNCIA DIDÁTICA (não é oferta real).' },
  { id: 'deb', nome: 'Debênture incentivada (referência: IPCA + 7,0% a.a.)', grupo: 'rf', tipo: 'pre', spr: 0.07, car: 180, liq: 'No vencimento (carência 180 dias)', risco: 'medio', ir: 'isento', iof: 0, ref: 1, desc: 'Empresa de infraestrutura toma seu dinheiro; isenta de IR; sem FGC. TAXA DE REFERÊNCIA DIDÁTICA: IPCA de 12 meses + 7% fixados na aplicação.' },
  { id: 'prev', nome: 'Previdência VGBL (referência: 90% do CDI)', grupo: 'rf', tipo: 'pos', pct: 0.9, car: 0, liq: 'D+0 simulado (na vida real D+1 a D+60)', risco: 'medio', ir: 'prev', iof: 0, ref: 1, desc: 'Tabela regressiva de IR: 35% (até 2 anos) até 10% (acima de 10 anos). Quanto mais tempo, menos imposto. REFERÊNCIA DIDÁTICA (cotas de previdência não têm API aberta).' },
  { id: 'usd3m', nome: 'Tesouro dos EUA 3 meses (T-Bill)', grupo: 'int', tipo: 'usd', car: 90, liq: 'No vencimento (90 dias)', risco: 'baixo', ir: 'g15', iof: 0, moeda: 'USD', desc: 'Rende em dólar a taxa do T-Bill de 3 meses. Você aplica em R$, vira US$ (com spread) e volta em R$. IR 15% sobre o ganho em R$ (inclui variação do dólar).' },
  { id: 'usd10y', nome: 'Tesouro dos EUA 10 anos (T-Note)', grupo: 'int', tipo: 'usd', car: 0, liq: 'D+0 simulado (o preço real varia com os juros)', risco: 'medio', ir: 'g15', iof: 0, moeda: 'USD', desc: 'Rende em dólar a taxa de 10 anos fixada na aplicação. Na vida real o preço sobe e desce com os juros; aqui o rendimento é linear (simplificação).' }
];
var EBI_RFBY = {}; EBI_RF.forEach(function (d) { EBI_RFBY[d.id] = d; });
var EBI_IOF = [96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3];
function eb_i_iof_(d) { return d >= 30 ? 0 : EBI_IOF[Math.max(d, 1) - 1] / 100; }
function eb_i_irAliq_(t, d) {
  if (t === 'isento') return 0; if (t === 'g15' || t === 'acoes') return 0.15;
  if (t === 'prev') return d <= 730 ? 0.35 : d <= 1460 ? 0.30 : d <= 2190 ? 0.25 : d <= 2920 ? 0.20 : d <= 3650 ? 0.15 : 0.10;
  if (t === 'cp') return d <= 180 ? 0.225 : 0.20;
  return d <= 180 ? 0.225 : d <= 360 ? 0.20 : d <= 720 ? 0.175 : 0.15;
}
function eb_i_aaProd_(d, bc, us) {   // % a.a. estimada hoje
  if (d.tipo === 'pos') { var cd = bc.cdi_d; return cd == null ? null : (Math.pow(1 + cd / 100 * d.pct, 252) * (1 + (d.spr || 0)) - 1) * 100; }
  if (d.tipo === 'poup') { if (bc.selic_aa == null) return null; var rm = bc.selic_aa > 8.5 ? 0.005 + (bc.tr_m || 0) / 100 : 0.7 * (Math.pow(1 + bc.selic_aa / 100, 1 / 12) - 1) + (bc.tr_m || 0) / 100; return (Math.pow(1 + rm, 12) - 1) * 100; }
  if (d.id === 'deb') return bc.ipca_12m == null ? null : ((1 + bc.ipca_12m / 100) * (1 + d.spr) - 1) * 100;
  if (d.id === 'usd3m') return us.y3m; if (d.id === 'usd10y') return us.y10;
  return null;
}
function eb_i_rfProdutosResp_() {
  var bc = eb_i_bcbTaxas_(), us = eb_i_usa_(), tx = eb_taxas_().taxas.USD;
  var prods = EBI_RF.map(function (d) { return { id: d.id, nome: d.nome, grupo: d.grupo, tipo: d.tipo, pct: d.pct || null, car: d.car, liq: d.liq, risco: d.risco, ir: d.ir, iof: d.iof, ref: d.ref || 0, moeda: d.moeda || 'BRL', desc: d.desc, aa: eb_i_aaProd_(d, bc, us), min: 100 }; });
  return { ok: 1, taxas: bc, usa: us, usd: tx && tx.t ? tx.t : null, spread_usd: eb_spread_(eb_cfg_(), 'USD'), prods: prods, ts: Date.now() };
}

// ---------- Tesouro Direto (CSV oficial do Tesouro Transparente) ----------
var EBI_TD_URL = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv';
var EBI_TD_TIPOS = { 'Tesouro Selic': ['selic', 'Tesouro Selic (LFT)', 'baixo', 'pos'], 'Tesouro Prefixado': ['pre', 'Tesouro Prefixado (LTN)', 'medio', 'pre'], 'Tesouro Prefixado com Juros Semestrais': ['prejs', 'Tesouro Prefixado c/ juros semestrais (NTN-F)', 'medio', 'pre'], 'Tesouro IPCA+': ['ipca', 'Tesouro IPCA+ (NTN-B Principal)', 'medio', 'ipca'], 'Tesouro IPCA+ com Juros Semestrais': ['ipcajs', 'Tesouro IPCA+ c/ juros semestrais (NTN-B)', 'medio', 'ipca'] };
function eb_i_num_(x) { return Number(String(x).replace(/\./g, '').replace(',', '.')); }
function eb_i_td_() {
  var c = CacheService.getScriptCache(), s = c.get('ebi_td'), p = PropertiesService.getScriptProperties(); if (s) { try { return JSON.parse(s); } catch (e) { } }
  var out = null;
  try {
    var r = UrlFetchApp.fetch(EBI_TD_URL, { headers: EBI_UA, muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      var ls = r.getContentText().split('\n'), base = '', itens = [];
      for (var i = 1; i < ls.length; i++) {
        var f = ls[i].replace(/\r/, '').split(';'); if (f.length < 8) continue;
        if (!base) base = f[2]; if (f[2] !== base) break;
        var t = EBI_TD_TIPOS[f[0]]; if (!t) continue;
        var v = f[1].split('/'), pc = eb_i_num_(f[5]), pv = eb_i_num_(f[6]);
        if (!isFinite(pc) || !isFinite(pv) || pc <= 0 || pv <= 0) continue;
        itens.push({ id: t[0] + '_' + v[2] + v[1] + v[0], slug: t[0], nome: t[1], venc: v[2] + '-' + v[1] + '-' + v[0], taxaC: eb_i_num_(f[3]), taxaV: eb_i_num_(f[4]), puC: pc, puV: pv, risco: t[2], idx: t[3], cupom: /semestrais/.test(f[0]) ? 1 : 0 });
      }
      var b = base.split('/'); if (itens.length) out = { ok: 1, base: b[2] + '-' + b[1] + '-' + b[0], itens: itens, fonte: 'Tesouro Transparente (preço e taxa dos títulos)', ts: Date.now() };
    }
  } catch (e) { }
  if (out) { try { p.setProperty('ebi_td_ok', JSON.stringify(out)); } catch (e) { } try { c.put('ebi_td', JSON.stringify(out), 21600); } catch (e) { } }
  else { try { out = JSON.parse(p.getProperty('ebi_td_ok') || 'null'); if (out) out.fonte += ' (última leitura salva)'; } catch (e) { } }
  return out || { ok: 0, itens: [], base: '', fonte: 'indisponivel', ts: Date.now() };
}
function eb_i_tdResp_() {
  var o = eb_i_td_(); if (!o.itens.length) return eb_erro_('Dados do Tesouro Direto indisponíveis agora.');
  var bc = eb_i_bcbTaxas_(); o.selic_aa = bc.selic_aa == null ? null : bc.selic_aa; o.ipca_12m = bc.ipca_12m == null ? null : bc.ipca_12m; o.cdi_aa = bc.cdi_aa == null ? null : bc.cdi_aa;
  o.custodia = 0.2; o.minimo = 3000; o.ok = 1; return o;
}
function eb_i_tdFind_(id) { var l = eb_i_td_().itens; for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }

// ---------- Fundos (CVM Informe Diário; aba Fundos guarda a cota; atualização por gatilho) ----------
var EBI_FUNDOS = [
  ['09.215.250/0001-13', 'BTG Pactual Tesouro Selic', 'renda fixa', 'cp', 'baixo', 'D+0', 'Só Selic e títulos públicos.'],
  ['01.608.573/0001-65', 'BB Top Renda Fixa Curto Prazo', 'renda fixa', 'cp', 'baixo', 'D+0', 'Curto prazo; come-cotas em maio e novembro.'],
  ['01.630.558/0001-13', 'Santander Renda Fixa Referenciado DI', 'DI', 'cp', 'baixo', 'D+0', 'Acompanha o CDI.'],
  ['03.737.206/0001-97', 'Caixa Brasil Referenciado DI', 'DI', 'cp', 'baixo', 'D+0', 'Acompanha o CDI.'],
  ['06.175.696/0001-73', 'Itaú Soberano Renda Fixa Simples', 'renda fixa', 'cp', 'baixo', 'D+0', 'Títulos públicos federais.'],
  ['27.717.359/0001-30', 'BTG Pactual CDB Plus', 'renda fixa', 'lp', 'medio', 'D+1', 'Crédito bancário; risco de crédito maior que o Tesouro.'],
  ['06.015.368/0001-00', 'BB Multimercado Juros e Moedas', 'multimercado', 'lp', 'medio', 'D+1', 'Aposta em juros e câmbio.'],
  ['10.320.188/0001-09', 'AZ Quest Low Vol', 'multimercado', 'lp', 'medio', 'D+30', 'Multimercado de baixa volatilidade.'],
  ['51.662.749/0001-35', 'Itaú Janeiro Multimercado', 'multimercado', 'lp', 'medio', 'D+30', 'Multimercado livre.'],
  ['07.455.507/0001-89', 'Verde Master Multimercado', 'multimercado', 'lp', 'alto', 'D+30', 'Multimercado macro; oscila bastante.'],
  ['24.546.223/0001-17', 'Itaú Vértice Ibovespa Equities', 'ações', 'acoes', 'alto', 'D+3', 'Ações brasileiras; IR de 15% só no resgate (sem come-cotas).'],
  ['36.178.569/0001-99', 'BB Ações Bolsa Americana', 'ações', 'acoes', 'alto', 'D+3', 'Ações dos EUA; a variação do dólar pesa.'],
  ['29.152.373/0001-60', 'Itaú US Tech', 'ações', 'acoes', 'alto', 'D+3', 'Empresas de tecnologia dos EUA.'],
  ['17.757.958/0001-24', 'Itaú Estratégia S&P 500', 'ações', 'acoes', 'alto', 'D+3', 'Acompanha o S&P 500.']
];
var EBI_FBY = {}; EBI_FUNDOS.forEach(function (f) { EBI_FBY['f_' + f[0].replace(/\D/g, '')] = f; });
function eb_i_fundosLer_() {   // {cnpj:[[ymd,cota]...ordenado]}
  var sh = eb_aba_('Fundos'), n = sh.getLastRow(), o = {};
  if (n >= 2) sh.getRange(2, 1, n - 1, 3).getValues().forEach(function (r) { var k = String(r[0]); (o[k] = o[k] || []).push([Number(r[1]), Number(r[2])]); });
  Object.keys(o).forEach(function (k) { o[k].sort(function (a, b) { return a[0] - b[0]; }); });
  return o;
}
function eb_i_ymdMs_(y) { var s = String(y); return Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)); }
function eb_i_cotaEm_(arr, ymd) { var r = null; for (var i = 0; i < arr.length; i++) { if (arr[i][0] <= ymd) r = arr[i]; else break; } return r; }
function eb_i_fundosResp_() {
  var d = eb_i_fundosLer_(), itens = [], ult = 0;
  EBI_FUNDOS.forEach(function (f) {
    var a = d[f[0]] || [], l = a.length ? a[a.length - 1] : null, o = { cnpj: f[0], id: 'f_' + f[0].replace(/\D/g, ''), nome: f[1], cat: f[2], ir: f[3], risco: f[4], resg: f[5], desc: f[6], adm: 'ver lâmina do fundo (CVM)', min: 100, cota: l ? l[1] : null, dt: l ? l[0] : null, r1m: null, r6m: null, r12m: null, sp: a.slice(-30).map(function (x) { return x[1]; }) };
    if (l) {
      ult = Math.max(ult, l[0]);
      [['r1m', 30], ['r6m', 182], ['r12m', 365]].forEach(function (k) {
        var alvo = eb_i_ymd_(eb_i_ymdMs_(l[0]) - k[1] * 86400000), b = eb_i_cotaEm_(a, alvo);
        if (b && a[0][0] <= alvo && eb_i_ymdMs_(alvo) - eb_i_ymdMs_(b[0]) <= 7 * 86400000) o[k[0]] = Math.round((l[1] / b[1] - 1) * 10000) / 100;
      });
    }
    itens.push(o);
  });
  return { ok: 1, itens: itens, dt: ult, fonte: 'CVM — Informe Diário de Fundos (dados abertos)', ts: Date.now(), nota: 'Rentabilidade passada não garante rentabilidade futura. Taxa de administração: confira a lâmina; o prazo de resgate mostrado é o típico da categoria.' };
}
// 1 mês do Informe Diário por execução (pesado). Gatilho diário ou execução manual; mês atual primeiro, depois retroativo (13 meses).
function ebiAtualizarFundos() {
  var p = PropertiesService.getScriptProperties(), est = {}; try { est = JSON.parse(p.getProperty('ebi_fnd') || '{}'); } catch (e) { }
  var agora = new Date(), alvo = null, hoje = eb_i_ymd_(agora.getTime()), atual = Utilities.formatDate(agora, TZ, 'yyyyMM');
  for (var k = 0; k <= 13 && !alvo; k++) { var d = new Date(agora.getFullYear(), agora.getMonth() - k, 1), ym = Utilities.formatDate(d, TZ, 'yyyyMM'); if (k === 0 ? (!est[ym] || est[ym] < hoje) : !est[ym]) alvo = ym; }
  if (!alvo) return 'Fundos já atualizados.';
  var r = UrlFetchApp.fetch('https://dados.cvm.gov.br/dados/FI/DOC/INF_DIARIO/DADOS/inf_diario_fi_' + alvo + '.zip', { headers: EBI_UA, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return 'CVM indisponível (' + r.getResponseCode() + ').';
  var txt = Utilities.unzip(r.getBlob().setContentType('application/zip'))[0].getDataAsString('UTF-8'), set = {};
  EBI_FUNDOS.forEach(function (f) { set[f[0]] = 1; });
  var linhas = txt.split('\n'), achou = [], i;
  for (i = 1; i < linhas.length; i++) {
    var ln = linhas[i], a = ln.indexOf(';'); if (a < 0) continue;
    var cn = ln.substring(a + 1, a + 19); if (!set[cn]) continue;
    var f = ln.split(';'); if (f[2]) continue;
    var q = Number(f[5]); if (isFinite(q) && q > 0) achou.push([cn, Number(f[3].replace(/-/g, '')), q]);
  }
  return eb_lock_(function () {
    var sh = eb_aba_('Fundos'), n = sh.getLastRow(), have = {};
    if (n >= 2) sh.getRange(2, 1, n - 1, 2).getValues().forEach(function (x) { have[x[0] + '|' + x[1]] = 1; });
    var novo = achou.filter(function (x) { return !have[x[0] + '|' + x[1]]; });
    if (novo.length) sh.getRange(sh.getLastRow() + 1, 1, novo.length, 3).setValues(novo);
    est[alvo] = alvo === atual ? hoje : 1; p.setProperty('ebi_fnd', JSON.stringify(est));
    eb_log_('', 'fundos', alvo + ': +' + novo.length + ' cotas');
    return alvo + ': +' + novo.length + ' cotas';
  });
}

// ---------- cálculo do valor de uma aplicação ----------
function eb_i_cx_() { return { agora: Date.now(), bc: null, cdi: null, usd: null, sp: null, td: null, fund: null }; }
function eb_i_valorAp_(ap, cx) {   // ap: {prod,valor,ts,taxa,extra} -> {bruto,rend,cust,iof,ir,liq,dias,car} | {erro}
  var d = Math.max(0, Math.floor((cx.agora - ap.ts) / 86400000)), v = ap.valor, bruto = v, cust = 0, irT = 'reg', iofOn = 0, i, def, car = 0;
  if (ap.prod.indexOf('td_') === 0) {
    var t = (cx.td = cx.td || eb_i_td_()).itens.filter(function (x) { return 'td_' + x.id === ap.prod; })[0];
    if (!t) return { erro: 'Título fora do mercado agora (vencido ou sem dados).' };
    bruto = Math.floor(ap.extra * t.puV * 100); irT = 'reg'; iofOn = 1;
    cust = (t.slug === 'selic' && bruto <= 1000000) ? 0 : Math.round(bruto * 0.002 * d / 365);
  } else if (ap.prod.indexOf('f_') === 0) {
    var fd = EBI_FBY[ap.prod]; if (!fd) return { erro: 'Fundo inválido.' };
    var arr = (cx.fund = cx.fund || eb_i_fundosLer_())[fd[0]] || [], l = arr.length ? arr[arr.length - 1] : null;
    if (!l) return { erro: 'Cota do fundo indisponível.' };
    bruto = Math.floor(ap.extra * l[1] * 100); irT = fd[3]; iofOn = 1;
  } else {
    def = EBI_RFBY[ap.prod]; if (!def) return { erro: 'Produto inválido.' }; car = def.car; irT = def.ir; iofOn = def.iof;
    if (def.tipo === 'pos') {
      cx.cdi = cx.cdi || eb_i_sgs_(12); if (!cx.cdi.length) return { erro: 'Taxa do CDI indisponível agora.' };
      var f = 1, ini = eb_i_ymd_(ap.ts), fim = eb_i_ymd_(cx.agora), sd = Math.pow(1 + (def.spr || 0), 1 / 252);
      for (i = 0; i < cx.cdi.length; i++) if (cx.cdi[i][0] > ini && cx.cdi[i][0] <= fim) f *= (1 + cx.cdi[i][1] / 100 * def.pct) * sd;
      bruto = Math.floor(v * f);
    } else if (def.tipo === 'pre') bruto = Math.floor(v * Math.pow(1 + ap.taxa / 100, d / 365));
    else if (def.tipo === 'poup') {
      cx.bc = cx.bc || eb_i_bcbTaxas_(); if (cx.bc.selic_aa == null) return { erro: 'Selic indisponível agora.' };
      var a = new Date(ap.ts), b = new Date(cx.agora), meses = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0), rm = cx.bc.selic_aa > 8.5 ? 0.005 + (cx.bc.tr_m || 0) / 100 : 0.7 * (Math.pow(1 + cx.bc.selic_aa / 100, 1 / 12) - 1) + (cx.bc.tr_m || 0) / 100;
      bruto = Math.floor(v * Math.pow(1 + rm, Math.max(meses, 0)));
    } else if (def.tipo === 'usd') {
      var tx = cx.usd == null ? (cx.usd = (eb_taxas_().taxas.USD || {}).t || 0) : cx.usd; if (!tx) return { erro: 'Dólar indisponível agora.' };
      cx.sp = cx.sp == null ? eb_spread_(eb_cfg_(), 'USD') : cx.sp;
      bruto = Math.floor(ap.extra * Math.pow(1 + ap.taxa / 100, d / 365) / 100 * tx * 100 * (1 - cx.sp));
    }
  }
  var rend = bruto - cust - v, iof = 0, ir = 0;
  if (rend > 0) { if (iofOn) iof = Math.floor(rend * eb_i_iof_(d)); ir = Math.floor((rend - iof) * eb_i_irAliq_(irT, d)); }
  return { bruto: bruto, rend: rend, cust: cust, iof: iof, ir: ir, liq: bruto - cust - iof - ir, dias: d, car: car, aliq: eb_i_irAliq_(irT, d) };
}
function eb_i_apRow_(r) { return { login: String(r[0]), id: String(r[1]), prod: String(r[2]), valor: Number(r[3]), ts: Number(r[4]), taxa: Number(r[5]), status: String(r[6]), extra: Number(r[7]), fx: Number(r[8]) || 0, resg: Number(r[9]) || 0, liquido: r[10] === '' ? null : Number(r[10]) }; }
function eb_i_apLer_(login) {
  var sh = eb_aba_('Aplicacoes'), n = sh.getLastRow(), o = [];
  if (n >= 2) sh.getRange(2, 1, n - 1, 11).getValues().forEach(function (r, i) { if (String(r[0]) === login) { var a = eb_i_apRow_(r); a.row = i + 2; o.push(a); } });
  return o;
}
function eb_i_apId_(id) {   // {login,row} da aplicação com esse id
  var sh = eb_aba_('Aplicacoes'), n = sh.getLastRow(); if (n < 2) return null;
  var v = sh.getRange(2, 1, n - 1, 2).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][1]) === id) return { login: String(v[i][0]), row: i + 2 };
  return null;
}
function eb_i_credAdd_(login, id, cent, nota, ids) {   // chamar dentro de lock
  if (ids[id]) return 0;
  var agora = new Date(), nt = eb_txt_(nota);
  eb_aba_('Creditos').appendRow([agora, login, id, cent, nt, 'novo']);
  eb_aba_('Extratos').appendRow([agora, login, 'rec', 'BRL', cent, '', 'EduBank Investimentos', nt, '', id]);
  ids[id] = 1; return 1;
}
function eb_i_nomeProd_(prod) {
  if (prod.indexOf('td_') === 0) { var t = eb_i_tdFind_(prod.slice(3)); return t ? t.nome + ' ' + t.venc.slice(0, 4) : 'Tesouro Direto'; }
  if (prod.indexOf('f_') === 0) return EBI_FBY[prod] ? EBI_FBY[prod][1] : 'Fundo';
  return EBI_RFBY[prod] ? EBI_RFBY[prod].nome : prod;
}
// {acao:'rfaplicar', prod, v (centavos), cash, id}
function eb_i_aplicar_(p, login) {
  var prod = String(p.prod || ''), id = String(p.id || ''), v = eb_int_(p.v, 100, 1e9), cash = eb_int_(p.cash, 0, 1e13);
  if (isNaN(v)) return eb_erro_('Valor inválido (mínimo R$ 1,00).');
  if (isNaN(cash)) return eb_erro_('Informe seu saldo em reais.');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  if (!/^[a-z0-9_]{2,40}$/.test(prod)) return eb_erro_('Produto inválido.');
  var taxa = 0, extra = 0, fx = 0, def = null, td = null, fd = null;
  if (prod.indexOf('td_') === 0) {
    td = eb_i_tdFind_(prod.slice(3)); if (!td) return eb_erro_('Título indisponível agora.');
    if (v < 3000) return eb_erro_('Investimento mínimo no Tesouro Direto: R$ 30,00.');
    extra = Math.floor(v / (td.puC * 100) * 100) / 100; if (extra < 0.01) return eb_erro_('Valor pequeno demais para esse título.');
    v = Math.ceil(extra * td.puC * 100); taxa = td.puC; fx = td.taxaC;
  } else if (prod.indexOf('f_') === 0) {
    fd = EBI_FBY[prod]; if (!fd) return eb_erro_('Fundo inválido.');
    var arr = eb_i_fundosLer_()[fd[0]]; if (!arr || !arr.length) return eb_erro_('Cota do fundo ainda não disponível. Tente mais tarde.');
    taxa = arr[arr.length - 1][1]; extra = Math.floor(v / 100 / taxa * 1e6) / 1e6; if (extra <= 0) return eb_erro_('Valor pequeno demais.'); fx = arr[arr.length - 1][0];
  } else {
    def = EBI_RFBY[prod]; if (!def) return eb_erro_('Produto inválido.');
    var bc = eb_i_bcbTaxas_(), us = eb_i_usa_();
    if (def.tipo === 'pos') { if (bc.cdi_d == null) return eb_erro_('Taxa do CDI indisponível agora.'); taxa = def.pct * 100; }
    else if (def.id === 'deb') { if (bc.ipca_12m == null) return eb_erro_('IPCA indisponível agora.'); taxa = eb_i_aaProd_(def, bc, us); }
    else if (def.tipo === 'usd') {
      taxa = def.id === 'usd3m' ? us.y3m : us.y10; var tx = (eb_taxas_().taxas.USD || {}).t;
      if (taxa == null || !tx) return eb_erro_('Taxa dos EUA ou dólar indisponível agora.');
      fx = tx; extra = Math.floor(v / 100 / (tx * (1 + eb_spread_(eb_cfg_(), 'USD'))) * 100);
    } else if (def.tipo === 'poup') { if (bc.selic_aa == null) return eb_erro_('Selic indisponível agora.'); }
  }
  return eb_lock_(function () {
    var ex = eb_i_apId_(id);
    if (ex) { if (ex.login !== login) return eb_erro_('Identificador já usado.'); var o = eb_i_apRow_(eb_aba_('Aplicacoes').getRange(ex.row, 1, 1, 11).getValues()[0]); return { ok: 1, dup: 1, custo: o.valor, ap: o }; }
    if (cash < v) return eb_erro_('Saldo em reais insuficiente.', { custo: v });
    var ts = Date.now();
    eb_aba_('Aplicacoes').appendRow([login, id, prod, v, ts, taxa, 'ativa', extra, fx, '', '']);
    eb_aba_('Extratos').appendRow([new Date(ts), login, 'inv', 'BRL', -v, v, '', eb_txt_('Aplicação: ' + eb_i_nomeProd_(prod)), '', id]);
    eb_log_(login, 'rfaplicar', prod + ' centavos=' + v + ' id=' + id);
    return { ok: 1, custo: v, ap: { id: id, prod: prod, valor: v, ts: ts, taxa: taxa, extra: extra, status: 'ativa' } };
  });
}
function eb_i_resgatar_(p, login) {
  var id = String(p.id || ''); if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  return eb_lock_(function () {
    var ex = eb_i_apId_(id); if (!ex || ex.login !== login) return eb_erro_('Aplicação não encontrada.');
    var sh = eb_aba_('Aplicacoes'), ap = eb_i_apRow_(sh.getRange(ex.row, 1, 1, 11).getValues()[0]);
    if (ap.status === 'resgatada') return { ok: 1, dup: 1, liquido: ap.liquido };
    var r = eb_i_valorAp_(ap, eb_i_cx_()); if (r.erro) return eb_erro_(r.erro);
    if (r.dias < r.car) return eb_erro_('Este produto só pode ser resgatado após ' + r.car + ' dias (faltam ' + (r.car - r.dias) + ').', { falta: r.car - r.dias });
    if (r.liq < 1) return eb_erro_('Valor líquido muito pequeno para resgatar.');
    eb_i_credAdd_(login, ('r' + id).slice(0, 40), r.liq, 'Resgate: ' + eb_i_nomeProd_(ap.prod), eb_credIds_());
    sh.getRange(ex.row, 7).setValue('resgatada'); sh.getRange(ex.row, 10, 1, 2).setValues([[Date.now(), r.liq]]);
    eb_log_(login, 'rfresgatar', ap.prod + ' bruto=' + r.bruto + ' ir=' + r.ir + ' iof=' + r.iof + ' liq=' + r.liq + ' id=' + id);
    return { ok: 1, bruto: r.bruto, rendimento: r.rend, custodia: r.cust, iof: r.iof, ir: r.ir, liquido: r.liq, dias: r.dias, aplicado: ap.valor };
  });
}

// ---------- ações / FIIs / ETFs / cripto ----------
function eb_i_posRow_(sh, login, cod) {
  var n = sh.getLastRow(); if (n < 2) return 0;
  var v = sh.getRange(2, 1, n - 1, 2).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][0]) === login && String(v[i][1]) === cod) return i + 2;
  return 0;
}
function eb_i_ordem_(id) {
  var sh = eb_aba_('Ordens'), n = sh.getLastRow(); if (n < 2) return null;
  var ini = Math.max(2, n - 2999), v = sh.getRange(ini, 1, n - ini + 1, 9).getValues();
  for (var i = v.length - 1; i >= 0; i--) if (String(v[i][2]) === id) return v[i];
  return null;
}
function eb_i_precoBrl_(cod) {   // {at,q,fx,sp} ou {erro}
  var at = EBI_BY[cod]; if (!at || !at.comp) return { erro: 'Ativo não negociável.' };
  var q = eb_i_cot_(cod); if (!q) return { erro: 'Cotação indisponível agora. Tente de novo em alguns minutos.' };
  if (Date.now() - q.ts > 7 * 86400000) return { erro: 'Cotação desatualizada (mais de 7 dias). Negociação suspensa.' };
  var fx = 1, sp = 0;
  if (at.moeda === 'USD') { fx = (eb_taxas_().taxas.USD || {}).t; if (!fx) return { erro: 'Dólar indisponível agora.' }; sp = eb_spread_(eb_cfg_(), 'USD'); }
  return { at: at, q: q, fx: fx, sp: sp };
}
function eb_i_posObj_(r) { return { cod: String(r[1]), qtd: Number(r[2]), pm: Number(r[3]), ts: Number(r[4]), moeda: String(r[5]), custo: Number(r[6]) }; }
function eb_i_comprar_(p, login) {
  var cod = String(p.cod || '').toUpperCase(), id = String(p.id || ''), qtd = eb_int_(p.qtd, 1, 1000000), cash = eb_int_(p.cash, 0, 1e13);
  if (isNaN(qtd)) return eb_erro_('Quantidade inválida (inteiro, mínimo 1).');
  if (isNaN(cash)) return eb_erro_('Informe seu saldo em reais.');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  var pr = eb_i_precoBrl_(cod); if (pr.erro) return eb_erro_(pr.erro);
  var custo = Math.ceil(eb_r6_(qtd * pr.q.preco * pr.fx * 100 * (1 + pr.sp)));
  if (custo < 100) return eb_erro_('Valor mínimo da ordem: R$ 1,00.');
  return eb_lock_(function () {
    var o = eb_i_ordem_(id);
    if (o) { if (String(o[1]) !== login) return eb_erro_('Identificador já usado.'); return { ok: 1, dup: 1, custo: Number(o[7]) }; }
    if (cash < custo) return eb_erro_('Saldo em reais insuficiente.', { custo: custo });
    var sh = eb_aba_('Posicoes'), row = eb_i_posRow_(sh, login, cod), agora = Date.now(), pos;
    if (row) { var a = eb_i_posObj_(sh.getRange(row, 1, 1, 7).getValues()[0]), nq = a.qtd + qtd; pos = [login, cod, nq, (a.qtd * a.pm + qtd * pr.q.preco) / nq, a.ts, pr.at.moeda, a.custo + custo]; sh.getRange(row, 1, 1, 7).setValues([pos]); }
    else { pos = [login, cod, qtd, pr.q.preco, agora, pr.at.moeda, custo]; sh.appendRow(pos); }
    eb_aba_('Ordens').appendRow([agora, login, id, 'c', cod, qtd, pr.q.preco, custo, pr.at.moeda]);
    eb_aba_('Extratos').appendRow([new Date(agora), login, 'inv', 'BRL', -custo, custo, '', eb_txt_('Compra ' + qtd + ' ' + cod + ' a ' + pr.q.preco + ' ' + pr.at.moeda), '', id]);
    eb_log_(login, 'invcomprar', cod + ' x' + qtd + ' preco=' + pr.q.preco + ' custo=' + custo + ' id=' + id);
    return { ok: 1, custo: custo, preco: pr.q.preco, fonte: pr.q.fonte, ts: pr.q.ts, pos: eb_i_posObj_(pos) };
  });
}
function eb_i_vender_(p, login) {
  var cod = String(p.cod || '').toUpperCase(), id = String(p.id || ''), qtd = eb_int_(p.qtd, 1, 1000000);
  if (isNaN(qtd)) return eb_erro_('Quantidade inválida.');
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return eb_erro_('Identificador inválido.');
  var pr = eb_i_precoBrl_(cod); if (pr.erro) return eb_erro_(pr.erro);
  var rec = Math.floor(eb_r6_(qtd * pr.q.preco * pr.fx * 100 * (1 - pr.sp)));
  if (rec < 1) return eb_erro_('Valor pequeno demais para vender.');
  return eb_lock_(function () {
    var o = eb_i_ordem_(id);
    if (o) { if (String(o[1]) !== login) return eb_erro_('Identificador já usado.'); return { ok: 1, dup: 1, recebe: Number(o[7]) }; }
    var sh = eb_aba_('Posicoes'), row = eb_i_posRow_(sh, login, cod); if (!row) return eb_erro_('Você não tem esse ativo.');
    var a = eb_i_posObj_(sh.getRange(row, 1, 1, 7).getValues()[0]); if (a.qtd < qtd) return eb_erro_('Quantidade maior que a sua posição (' + a.qtd + ').');
    var custoParte = Math.round(a.custo * qtd / a.qtd), lucro = rec - custoParte, agora = Date.now(), pos = null;
    if (a.qtd === qtd) sh.deleteRow(row); else { pos = [login, cod, a.qtd - qtd, a.pm, a.ts, a.moeda, a.custo - custoParte]; sh.getRange(row, 1, 1, 7).setValues([pos]); }
    eb_aba_('Ordens').appendRow([agora, login, id, 'v', cod, qtd, pr.q.preco, rec, pr.at.moeda]);
    eb_i_credAdd_(login, ('cv' + id).slice(0, 40), rec, 'Venda ' + qtd + ' ' + cod, eb_credIds_());
    eb_log_(login, 'invvender', cod + ' x' + qtd + ' preco=' + pr.q.preco + ' recebe=' + rec + ' lucro=' + lucro + ' id=' + id);
    return { ok: 1, recebe: rec, lucro: lucro, preco: pr.q.preco, pos: pos ? eb_i_posObj_(pos) : null, ir_info: 'IR de 15% sobre o lucro em vendas de ações acima de R$ 20 mil no mês (informativo; não cobrado aqui).' };
  });
}
function eb_i_proventos_(login, poss) {   // credita proventos de ações/FIIs BR (idempotente por ativo+data); devolve centavos novos
  var cand = [], ord = null;
  poss.forEach(function (a) {
    var at = EBI_BY[a.cod]; if (!at || at.mercado !== 'br' || at.tipo === 'indice') return;
    var ds = eb_i_divs_(a.cod); if (!ds.length) return;
    if (!ord) { var sh = eb_aba_('Ordens'), n = sh.getLastRow(); ord = n >= 2 ? sh.getRange(2, 1, n - 1, 9).getValues().filter(function (r) { return String(r[1]) === login; }) : []; }
    ds.forEach(function (d) {
      var exMs = d[0] * 1000; if (exMs > Date.now() || Date.now() - exMs > 400 * 86400000) return;
      var q = 0; ord.forEach(function (r) { if (String(r[4]) === a.cod && new Date(r[0]).getTime() < exMs - 86400000 + 86399999) q += (r[3] === 'c' ? 1 : -1) * Number(r[5]); });
      var cent = Math.floor(q * d[1] * 100); if (q > 0 && cent >= 1) cand.push({ id: ('pv' + login + a.cod + eb_i_ymd_(exMs)).slice(0, 40), cent: cent, nota: 'Provento ' + a.cod });
    });
  });
  if (!cand.length) return 0;
  return eb_lock_(function () { var ids = eb_credIds_(), t = 0; cand.forEach(function (c) { if (eb_i_credAdd_(login, c.id, c.cent, c.nota, ids)) t += c.cent; }); if (t) eb_log_(login, 'proventos', t + ' centavos'); return t; }) || 0;
}
function eb_i_provTotal_(login) {
  var sh = eb_aba_('Creditos'), n = sh.getLastRow(), t = 0, pre = 'pv' + login;
  if (n >= 2) sh.getRange(2, 1, n - 1, 4).getValues().forEach(function (r) { if (String(r[1]) === login && String(r[2]).indexOf(pre) === 0) t += Number(r[3]); });
  return t;
}
function eb_i_carteira_(login) {
  var sh = eb_aba_('Posicoes'), n = sh.getLastRow(), poss = [];
  if (n >= 2) sh.getRange(2, 1, n - 1, 7).getValues().forEach(function (r) { if (String(r[0]) === login) poss.push(eb_i_posObj_(r)); });
  var novos = poss.length ? eb_i_proventos_(login, poss) : 0;
  var at = eb_i_ativos_().itens, M = {}; at.forEach(function (x) { M[x.cod] = x; });
  var usd = (eb_taxas_().taxas.USD || {}).t || 0, totAc = 0;
  var pos = poss.map(function (a) {
    var q = M[a.cod], fx = a.moeda === 'USD' ? usd : 1, d = EBI_BY[a.cod] || {};
    var val = q && fx ? Math.round(a.qtd * q.preco * fx * 100) : null, res = val == null ? null : val - a.custo;
    if (val != null) totAc += val;
    return { cod: a.cod, nome: d.nome || a.cod, tipo: d.tipo, mercado: d.mercado, moeda: a.moeda, qtd: a.qtd, pm: a.pm, preco: q ? q.preco : null, 'var': q ? q.var : null, fonte: q ? q.fonte : null, ts: q ? q.ts : null, valor: val, custo: a.custo, res: res, res_pct: res == null || !a.custo ? null : Math.round(res / a.custo * 10000) / 100 };
  });
  var cx = eb_i_cx_(), rf = [], totRf = 0;
  eb_i_apLer_(login).forEach(function (a) {
    var o = { id: a.id, prod: a.prod, nome: eb_i_nomeProd_(a.prod), valor: a.valor, ts: a.ts, status: a.status, taxa: a.taxa };
    if (a.status === 'ativa') { var r = eb_i_valorAp_(a, cx); if (r.erro) o.erro = r.erro; else { o.bruto = r.bruto; o.rend = r.rend; o.cust = r.cust; o.iof = r.iof; o.ir = r.ir; o.liq = r.liq; o.dias = r.dias; o.car = r.car; totRf += r.liq; } }
    else { o.liq = a.liquido; o.resg = a.resg; }
    rf.push(o);
  });
  var cs = eb_carteiraResp_(login), totMo = 0, mo = [];
  EB_MOEDAS.forEach(function (m) { var s = cs.saldos[m], t = cs.taxas[m]; if (s > 0 && t && t.t) { var v = Math.round(s / eb_escala_(m) * t.t * 100); totMo += v; mo.push({ moeda: m, saldo: s, brl: v }); } });
  return { ok: 1, pos: pos, rf: rf, moedas: mo, prov_novos: novos, prov_total: eb_i_provTotal_(login), patrimonio: { acoes: totAc, rf: totRf, moedas: totMo, total: totAc + totRf + totMo }, ts: Date.now() };
}

// ---- Painel: progresso de TODAS as atividades (aba Resultados) ----
function ativDash_(p) {
  if (String(p.k || '') !== RBX_KEY) return ok_('sem permissao');
  var out = { ok: 1, agora: Date.now(), alunos: [] };
  var sh = SpreadsheetApp.getActive().getSheetByName('Resultados');
  if (!sh || sh.getLastRow() < 2) return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  var nc = Math.min(17, sh.getLastColumn());
  var turma = String(p.turma || '').toUpperCase();
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, nc).getValues(), m = {};
  rows.forEach(function (r) {
    var login = String(r[1] || '').toLowerCase();
    if (!login) return;
    if (turma && eb_turma_(login) !== turma) return;
    var ts = new Date(r[0]).getTime() || 0;
    var o = m[login] || (m[login] = { login: login, ultima: 0, ativ: {} });
    var cod = String(r[5] || ''), ativ = String(r[6] || cod), disc = String(r[4] || '');
    var k = cod || ativ;
    var it = o.ativ[k] || (o.ativ[k] = { cod: cod, ativ: ativ, disc: disc, tent: 0, melhor: -1, ultima: 0, pct: null, conc: 0 });
    it.tent++;
    var pc = (r[9] === '' || r[9] == null) ? null : Number(r[9]);
    if (pc !== null && pc > it.melhor) it.melhor = pc;
    if (ts >= it.ultima) { it.ultima = ts; it.pct = pc; }
    if (Number(r[10]) === 1) it.conc = 1;
    if (ts > o.ultima) o.ultima = ts;
  });
  Object.keys(m).forEach(function (l) {
    var o = m[l], arr = [];
    Object.keys(o.ativ).forEach(function (k) { arr.push(o.ativ[k]); });
    arr.sort(function (a, b) { return b.ultima - a.ultima; });
    out.alunos.push({ login: l, ultima: o.ultima, atividades: arr });
  });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
// ---- Ranking por saldo no EduBank (todas as turmas) ----
function profSaldos_(p) {
  if (String(p.k || '') !== RBX_KEY) return ok_('sem permissao');
  var turma = String(p.turma || '').toUpperCase();
  var sh = SpreadsheetApp.getActive().getSheetByName('Carteiras');
  var out = { ok: 1, alunos: [] };
  if (!sh || sh.getLastRow() < 2) return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  var t = eb_taxas_(), tx = t.taxas || {};
  var nc = sh.getLastColumn(), head = sh.getRange(1, 1, 1, nc).getValues()[0];
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, nc).getValues();
  rows.forEach(function (r) {
    var login = String(r[0] || '').toLowerCase();
    if (!login) return;
    if (turma && eb_turma_(login) !== turma) return;
    var brl = 0, ativos = [];
    for (var i = 1; i < head.length; i++) {
      var m = String(head[i] || '').toUpperCase();
      if (!m) continue;
      var v = Number(r[i]) || 0;
      if (!v) continue;
      var esc = EB_CRIPTO.indexOf(m) >= 0 ? 1e8 : 100;
      var q = v / esc, preco = (m === 'BRL') ? 1 : (Number(tx[m]) || 0);
      brl += q * preco;
      ativos.push({ m: m, q: Math.round(q * 1e6) / 1e6 });
    }
    out.alunos.push({ login: login, num: eb_numLogin_(login), turma: eb_turma_(login), brl: Math.round(brl * 100) / 100, ativos: ativos });
  });
  out.alunos.sort(function (a, b) { return b.brl - a.brl; });
  out.ts = t.ts;
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}