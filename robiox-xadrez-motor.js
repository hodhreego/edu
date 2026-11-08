/* Motor de xadrez mínimo (sem roque/en passant/promoção) + problemas de "mate em 1". Linha 0 = 8ª fileira (pretas em cima). */
(function(root){
 var N=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],K=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],B=[[-1,-1],[-1,1],[1,-1],[1,1]],R=[[-1,0],[1,0],[0,-1],[0,1]];
 function isW(p){return p>='A'&&p<='Z'}
 function pseudo(bd,i){var p=bd[i],o=[];if(!p)return o;var w=isW(p),t=p.toLowerCase(),r=i>>3,c=i&7;
  function add(rr,cc,capOnly,noCap){if(rr<0||rr>7||cc<0||cc>7)return false;var j=rr*8+cc,q=bd[j];if(q){if(isW(q)!==w&&!noCap)o.push(j);return false}if(!capOnly)o.push(j);return true}
  if(t==='p'){var d=w?-1:1,st=w?6:1;if(r+d>=0&&r+d<8){if(!bd[(r+d)*8+c]){o.push((r+d)*8+c);if(r===st&&!bd[(r+2*d)*8+c])o.push((r+2*d)*8+c)}[-1,1].forEach(function(dc){var cc=c+dc;if(cc<0||cc>7)return;var q=bd[(r+d)*8+cc];if(q&&isW(q)!==w)o.push((r+d)*8+cc)})}return o}
  if(t==='n'){N.forEach(function(m){add(r+m[0],c+m[1])});return o}
  if(t==='k'){K.forEach(function(m){add(r+m[0],c+m[1])});return o}
  var dirs=t==='b'?B:t==='r'?R:B.concat(R);dirs.forEach(function(m){var rr=r+m[0],cc=c+m[1];while(add(rr,cc)){rr+=m[0];cc+=m[1]}});return o}
 function apply(bd,a,b){var n=bd.slice();n[b]=n[a];n[a]='';return n}
 function inCheck(bd,w){var k=bd.indexOf(w?'K':'k');if(k<0)return false;for(var i=0;i<64;i++){var p=bd[i];if(p&&isW(p)!==w&&pseudo(bd,i).indexOf(k)>=0)return true}return false}
 function legal(bd,i){var w=isW(bd[i]);return pseudo(bd,i).filter(function(j){return !inCheck(apply(bd,i,j),w)})}
 function hasMove(bd,w){for(var i=0;i<64;i++)if(bd[i]&&isW(bd[i])===w&&legal(bd,i).length)return true;return false}
 function isMate(bd,w){return inCheck(bd,w)&&!hasMove(bd,w)}
 function fen(f){var bd=[];f.split('/').forEach(function(row){for(var k=0;k<row.length;k++){var ch=row[k];if(/\d/.test(ch)){for(var z=0;z<+ch;z++)bd.push('')}else bd.push(ch)}});return bd}
 var PUZ=['6k1/5ppp/8/8/8/8/8/R3K3','7k/5Q2/6K1/8/8/8/8/8','k7/8/1K6/8/8/8/8/7R','6k1/8/6K1/8/8/8/8/Q7','6k1/5ppp/8/8/8/8/5PPP/3R2K1','6rk/6pp/8/6N1/8/8/8/6K1','r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR','7k/8/5K2/8/8/8/8/6Q1','3k4/8/3K4/8/8/8/8/R7','2k5/8/2K5/8/8/8/8/7Q'];
 root.RBX_XADREZ={pseudo:pseudo,legal:legal,apply:apply,inCheck:inCheck,isMate:isMate,fen:fen,PUZ:PUZ,isW:isW,mates:function(bd){var m=[];for(var i=0;i<64;i++)if(bd[i]&&isW(bd[i]))legal(bd,i).forEach(function(j){if(isMate(apply(bd,i,j),false))m.push([i,j])});return m}};
})(typeof window!=='undefined'?window:globalThis);
