/* Cole este código em script.google.com (Novo projeto), implante como "App da Web"
   (Executar como: você · Quem tem acesso: Qualquer pessoa) e copie o endereço /exec para config.js. */
var ABA='Resultados';
function aba_(){var ss=SpreadsheetApp.getActiveSpreadsheet()||SpreadsheetApp.create('Ludopédia - Resultados');
  var sh=ss.getSheetByName(ABA);if(!sh){sh=ss.insertSheet(ABA);sh.appendRow(['sid','data','hora','nome','turma','jogo','codigo','aula','pontos','maximo','segundos'])}return sh}
function doPost(e){
  var d=JSON.parse(e.postData.contents);
  if(d.acao==='pontos')return rkPontos_(d);
  var sh=aba_(),ids=sh.getRange(2,1,Math.max(sh.getLastRow()-1,1),1).getValues(),row=-1;
  for(var i=0;i<ids.length;i++){if(ids[i][0]===d.sid){row=i+2;break}}
  var hora=new Date(d.quando),v=[d.sid,d.dia,Utilities.formatDate(hora,'America/Sao_Paulo','HH:mm:ss'),d.nome,d.turma,d.jogo,d.codigo,d.aula,d.pontos,d.maximo,d.segundos];
  if(row>0)sh.getRange(row,1,1,v.length).setValues([v]);else sh.appendRow(v);
  return ContentService.createTextOutput('ok');
}
function doGet(e){
  if(e&&e.parameter&&e.parameter.acao==='ranking')return rkTop_(e.parameter);
  var sh=aba_(),v=sh.getDataRange().getValues(),h=v.shift(),cod=e&&e.parameter&&e.parameter.codigo,o=v.map(function(r){var x={};h.forEach(function(k,i){x[k]=r[i]});return x});
  if(cod)o=o.filter(function(x){return String(x.codigo)===String(cod)});
  o.sort(function(a,b){return b.maximo-a.maximo});
  return ContentService.createTextOutput(JSON.stringify(o.slice(0,200))).setMimeType(ContentService.MimeType.JSON);
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
  var lock=LockService.getScriptLock();lock.waitLock(5000);
  try{var sh=rkAba_(),n=sh.getLastRow()-1,ids=n>0?sh.getRange(2,1,n,1).getValues():[],row=-1;
    for(var i=0;i<ids.length;i++){if(ids[i][0]===sid){row=i+2;break}}
    if(row>0){var ant=Number(sh.getRange(row,5).getValue());if(pts<ant)pts=ant}
    var v=[sid,turma,cod,nome,pts,new Date()];
    if(row>0)sh.getRange(row,1,1,6).setValues([v]);else sh.appendRow(v);
    if(sh.getLastRow()>3000)sh.deleteRows(2,1000);
  }finally{lock.releaseLock()}
  return ContentService.createTextOutput('ok');
}
function rkTop_(p){
  var turma=rkLimpa_(p.turma,12).toUpperCase(),cod=rkLimpa_(p.codigo,8),sh=rkAba_(),v=sh.getDataRange().getValues();v.shift();
  var lim=Date.now()-RK_HORAS*3600000;
  var o=v.filter(function(r){return String(r[1]).toUpperCase()===turma&&String(r[2])===cod&&new Date(r[5]).getTime()>=lim}).map(function(r){return{sid:r[0],nome:r[3],pontos:Number(r[4])}});
  o.sort(function(a,b){return b.pontos-a.pontos});
  return ContentService.createTextOutput(JSON.stringify({ranking:o.slice(0,10)})).setMimeType(ContentService.MimeType.JSON);
}
