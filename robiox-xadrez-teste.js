/* Teste automatizado: node robiox-xadrez-teste.js — todo problema precisa ter >=1 lance legal que dê mate, sem o adversário estar em xeque no início. */
global.window=undefined;
require('./robiox-xadrez-motor.js');require('./robiox-xadrez-variantes.js');require('./robiox-xadrez-modos.js');
var X=globalThis.RBX_XADREZ,V=globalThis.RBX_XADREZ_VAR,MD=globalThis.RBX_XADREZ_MODOS,bad=0;
function chk(nome,E,puz){puz.forEach(function(f,n){var bd=E.fen(f),m=E.mates(bd),ok=m.length>=1&&!E.inCheck(bd,false)&&!E.inCheck(bd,true)&&bd.length===(E.N||64);
 if(!ok)bad++;console.log((ok?'OK  ':'FALHA ')+nome+' #'+n+' mates='+m.length)})}
chk('tradicional',{fen:X.fen,mates:X.mates,inCheck:X.inCheck,N:64},X.PUZ);
chk('xiangqi',V.xiangqi,V.xiangqi.PUZ);chk('mini5x5',V.mini,V.mini.PUZ);
globalThis.RBX_XADREZ_MODOS_ORDEM.forEach(function(k){var M=MD[k];if(M.PUZ.length<8)bad++;M.PUZ.forEach(function(f,n){var ok=M.has(X.fen(f));if(!ok)bad++;console.log((ok?'OK  ':'FALHA ')+'modo '+k+' #'+n)})});
console.log(bad?bad+' falhas':'TODOS OK');process.exit(bad?1:0);
