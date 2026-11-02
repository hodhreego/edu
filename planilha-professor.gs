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
  if (d.acao === 'rbxsave') return rbxSave_(d);
  if (d.acao === 'rbxresp') return rbxResp_(d);
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
  if (e && e.parameter && e.parameter.acao === 'rbxload') return rbxLoad_(e.parameter);
  if (e && e.parameter && e.parameter.acao === 'rbxdash') return rbxDash_(e.parameter);
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
  if (!/^(\d{1,3}[a-z]{3}\d[a-z]|mestre|teste)$/.test(login)) return ok_('login inválido');
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
  var out = { ok: 0 };
  if (n > 1) {
    var v = sh.getRange(2, 1, n - 1, 3).getValues();
    for (var i = 0; i < v.length; i++) if (v[i][0] === login) { try { out = { ok: 1, ts: Number(v[i][1]), st: JSON.parse(v[i][2]) }; } catch (e) {} break; }
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}


// Registro de cada resposta dos alunos no RobIox (aba "RobIox-Respostas")
function rbxResp_(d) {
  var login = String(d.login || '').toLowerCase();
  if (!/^(\d{1,3}[a-z]{3}\d[a-z]|teste)$/.test(login)) return ok_('login inválido');
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
    v.forEach(function (r) { var l = r[1]; cnt[l] = cnt[l] || { n: 0, ok: 0 }; cnt[l].n++; if (r[10] === 'SIM') cnt[l].ok++; });
    out.recentes = v.slice(-30).reverse().map(function (r) { return { t: new Date(r[0]).getTime(), login: r[1], mat: r[2], mundo: r[3], fase: r[4], tema: r[5], q: r[7], ok: r[10] === 'SIM' }; });
  }
  if (sh && sh.getLastRow() > 1) {
    var d = sh.getRange(2, 1, sh.getLastRow() - 1, 27).getValues();
    d.forEach(function (r) {
      var s = {}; try { s = JSON.parse(r[26]); } catch (e) { }
      var c = cnt[r[0]] || { n: 0, ok: 0 };
      out.alunos.push({ login: r[0], nick: r[2], serie: r[3], nivel: r[4], xp: r[5], moedas: r[6], cofrinho: r[7], gasto: r[8], vendido: r[9], itens: r[10], ini: r[11], fim: r[12], pct: r[13], est: r[14], acertosJogo: r[15], perfeitas: r[16], combo: r[17], mundos: r[18], resp: c.n, respOk: c.ok, ultima: new Date(r[23]).getTime(), own: s.own || [], gastos: (s.gastos || []).slice(0, 8) });
    });
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
