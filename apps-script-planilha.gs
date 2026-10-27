/* Cole este código em script.google.com (Novo projeto), implante como "App da Web"
   (Executar como: você · Quem tem acesso: Qualquer pessoa) e copie o endereço /exec para config.js. */
var ABA='Resultados';
function aba_(){var ss=SpreadsheetApp.getActiveSpreadsheet()||SpreadsheetApp.create('Loja de Matemática - Resultados');
  var sh=ss.getSheetByName(ABA);if(!sh){sh=ss.insertSheet(ABA);sh.appendRow(['sid','data','hora','nome','turma','jogo','codigo','aula','pontos','maximo','segundos'])}return sh}
function doPost(e){
  var d=JSON.parse(e.postData.contents),sh=aba_(),ids=sh.getRange(2,1,Math.max(sh.getLastRow()-1,1),1).getValues(),row=-1;
  for(var i=0;i<ids.length;i++){if(ids[i][0]===d.sid){row=i+2;break}}
  var hora=new Date(d.quando),v=[d.sid,d.dia,Utilities.formatDate(hora,'America/Sao_Paulo','HH:mm:ss'),d.nome,d.turma,d.jogo,d.codigo,d.aula,d.pontos,d.maximo,d.segundos];
  if(row>0)sh.getRange(row,1,1,v.length).setValues([v]);else sh.appendRow(v);
  return ContentService.createTextOutput('ok');
}
function doGet(e){
  var sh=aba_(),v=sh.getDataRange().getValues(),h=v.shift(),cod=e&&e.parameter&&e.parameter.codigo,o=v.map(function(r){var x={};h.forEach(function(k,i){x[k]=r[i]});return x});
  if(cod)o=o.filter(function(x){return String(x.codigo)===String(cod)});
  o.sort(function(a,b){return b.maximo-a.maximo});
  return ContentService.createTextOutput(JSON.stringify(o.slice(0,200))).setMimeType(ContentService.MimeType.JSON);
}
