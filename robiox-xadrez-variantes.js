/* Variantes de xadrez p/ o Switch: Xiangqi (9x10) e Mini-xadrez 5x5. Maiúsculas = lado que joga (embaixo, sobe); minúsculas = adversário.
   Cada motor: pseudo/legal/apply/inCheck/isMate/mates/fen/PUZ (problemas de mate em 1 verificados em robiox-xadrez-teste.js). */
(function(root){
 function isW(p){return p>='A'&&p<='Z'}
 function mk(R,C,pseudoFn,applyFn,inCheckFn,PUZ){
  var E={R:R,C:C,N:R*C,isW:isW,PUZ:PUZ};
  E.fen=function(f){var bd=[];f.split('/').forEach(function(row){for(var k=0;k<row.length;k++){var ch=row[k];if(/\d/.test(ch)){for(var z=0;z<+ch;z++)bd.push('')}else bd.push(ch)}});return bd};
  E.pseudo=pseudoFn;E.apply=applyFn||function(bd,a,b){var n=bd.slice();n[b]=n[a];n[a]='';return n};E.inCheck=inCheckFn;
  E.legal=function(bd,i){var w=isW(bd[i]);return E.pseudo(bd,i).filter(function(j){return !E.inCheck(E.apply(bd,i,j),w)})};
  E.hasMove=function(bd,w){for(var i=0;i<E.N;i++)if(bd[i]&&isW(bd[i])===w&&E.legal(bd,i).length)return true;return false};
  E.isMate=function(bd,w){return E.inCheck(bd,w)&&!E.hasMove(bd,w)};
  E.mates=function(bd){var m=[];for(var i=0;i<E.N;i++)if(bd[i]&&isW(bd[i]))E.legal(bd,i).forEach(function(j){if(E.isMate(E.apply(bd,i,j),false))m.push([i,j])});return m};
  E.attacked=function(bd,sq,byW){for(var i=0;i<E.N;i++){var p=bd[i];if(p&&isW(p)===byW&&E.pseudo(bd,i).indexOf(sq)>=0)return true}return false};
  return E;
 }
 /* ===== Xiangqi: 9 colunas x 10 linhas, linha 0 = topo (preto), vermelho (maiúsculo) embaixo ===== */
 function xqPseudo(bd,i){var p=bd[i],o=[];if(!p)return o;var w=isW(p),t=p.toLowerCase(),r=(i/9)|0,c=i%9;
  function ok(rr,cc){if(rr<0||rr>9||cc<0||cc>8)return false;var q=bd[rr*9+cc];return !q||isW(q)!==w}
  function pal(rr,cc){return cc>=3&&cc<=5&&(w?rr>=7:rr<=2)}
  function add(rr,cc){if(ok(rr,cc))o.push(rr*9+cc)}
  var OR=[[-1,0],[1,0],[0,-1],[0,1]];
  if(t==='k'){OR.forEach(function(m){if(pal(r+m[0],c+m[1]))add(r+m[0],c+m[1])})}
  else if(t==='a'){[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(m){if(pal(r+m[0],c+m[1]))add(r+m[0],c+m[1])})}
  else if(t==='e'){[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(m){var rr=r+2*m[0],cc=c+2*m[1];if(rr<0||rr>9||cc<0||cc>8)return;if(w?rr<5:rr>4)return;if(bd[(r+m[0])*9+c+m[1]])return;add(rr,cc)})}
  else if(t==='h'){OR.forEach(function(m){if(r+m[0]<0||r+m[0]>9||c+m[1]<0||c+m[1]>8||bd[(r+m[0])*9+c+m[1]])return;
     if(m[0]){add(r+2*m[0],c-1);add(r+2*m[0],c+1)}else{add(r-1,c+2*m[1]);add(r+1,c+2*m[1])}})}
  else if(t==='r'){OR.forEach(function(m){var rr=r+m[0],cc=c+m[1];while(rr>=0&&rr<=9&&cc>=0&&cc<=8){var q=bd[rr*9+cc];if(q){if(isW(q)!==w)o.push(rr*9+cc);break}o.push(rr*9+cc);rr+=m[0];cc+=m[1]}})}
  else if(t==='c'){OR.forEach(function(m){var rr=r+m[0],cc=c+m[1],scr=false;while(rr>=0&&rr<=9&&cc>=0&&cc<=8){var q=bd[rr*9+cc];if(!scr){if(q)scr=true;else o.push(rr*9+cc)}else if(q){if(isW(q)!==w)o.push(rr*9+cc);break}rr+=m[0];cc+=m[1]}})}
  else if(t==='p'){var d=w?-1:1;add(r+d,c);if(w?r<=4:r>=5){add(r,c-1);add(r,c+1)}}
  return o}
 function xqCheck(bd,w){var k=bd.indexOf(w?'K':'k');if(k<0)return false;var ok=bd.indexOf(w?'k':'K');
  if(ok>=0&&ok%9===k%9){var a=Math.min(k,ok)+9,clear=true;for(;a<Math.max(k,ok);a+=9)if(bd[a]){clear=false;break}if(clear)return true}
  for(var i=0;i<90;i++){var p=bd[i];if(p&&isW(p)!==w&&xqPseudo(bd,i).indexOf(k)>=0)return true}return false}
 var XQ_PUZ=['4k4/R7R/9/9/9/9/9/9/9/3K5', '3k5/9/9/9/1R7/9/9/9/9/4K1E2', '5k3/9/9/2H6/9/9/9/9/4R4/4K4', '9/9/5k3/9/9/6R2/9/9/3CK4/9', '4k4/3R5/9/9/8R/9/7H1/9/3K5/9', '5k3/9/9/9/1P7/6C2/2R6/4K4/9/9', '9/3k5/9/9/9/3P5/9/8C/4K4/7C1', '7R1/9/2h2k3/H8/9/9/9/4K4/9/9', '9/9/3k5/8h/9/5R3/9/8c/4K4/6C2', '5k3/9/9/8R/1R7/9/9/4K4/7c1/9'];
 /* ===== Mini-xadrez 5x5 (sem roque/en passant; peão anda 1 e promove a dama na última linha) ===== */
 function mnPseudo(bd,i){var p=bd[i],o=[];if(!p)return o;var w=isW(p),t=p.toLowerCase(),r=(i/5)|0,c=i%5;
  function add(rr,cc,capOnly){if(rr<0||rr>4||cc<0||cc>4)return false;var q=bd[rr*5+cc];if(q){if(isW(q)!==w)o.push(rr*5+cc);return false}if(!capOnly)o.push(rr*5+cc);return true}
  if(t==='p'){var d=w?-1:1;if(r+d>=0&&r+d<5){if(!bd[(r+d)*5+c])o.push((r+d)*5+c);[-1,1].forEach(function(dc){var cc=c+dc;if(cc<0||cc>4)return;var q=bd[(r+d)*5+cc];if(q&&isW(q)!==w)o.push((r+d)*5+cc)})}return o}
  if(t==='n'){[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(function(m){add(r+m[0],c+m[1])});return o}
  var K8=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],Bd=[[-1,-1],[-1,1],[1,-1],[1,1]],Rd=[[-1,0],[1,0],[0,-1],[0,1]];
  if(t==='k'){K8.forEach(function(m){add(r+m[0],c+m[1])});return o}
  (t==='b'?Bd:t==='r'?Rd:Bd.concat(Rd)).forEach(function(m){var rr=r+m[0],cc=c+m[1];while(add(rr,cc)){rr+=m[0];cc+=m[1]}});return o}
 function mnApply(bd,a,b){var n=bd.slice(),p=n[a];n[b]=p;n[a]='';if(p==='P'&&b<5)n[b]='Q';if(p==='p'&&b>=20)n[b]='q';return n}
 function mnCheck(bd,w){var k=bd.indexOf(w?'K':'k');if(k<0)return false;for(var i=0;i<25;i++){var p=bd[i];if(p&&isW(p)!==w&&mnPseudo(bd,i).indexOf(k)>=0)return true}return false}
 var MN_PUZ=['2b2/B4/3Q1/5/1K2k', '1RK2/1R3/k4/5/4b', '1k1B1/5/K4/5/4Q', '5/K1N2/1R3/R4/3k1', '3R1/5/2K2/2R2/1k3', '3kn/RP2R/5/5/4K', 'K2kp/5/Q4/5/1Q3', '4k/5/1P2N/K2Q1/5', '1r1q1/5/2K1R/3R1/2k2', '5/1Q3/5/2B1k/2K2'];
 root.RBX_XADREZ_VAR={xiangqi:mk(10,9,xqPseudo,null,xqCheck,XQ_PUZ),mini:mk(5,5,mnPseudo,mnApply,mnCheck,MN_PUZ)};

 /* ===== Mecânica 2D (canvas) das variantes, mesma interface das demais mecânicas ===== */
 var GL={xiangqi:{K:'帥',A:'仕',E:'相',H:'傌',R:'俥',C:'炮',P:'兵',k:'將',a:'士',e:'象',h:'馬',r:'車',c:'砲',p:'卒'},mini:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
 root.RBX_XADREZ_VAR.mech2d=function(kind,st,W,H){
  var E=root.RBX_XADREZ_VAR[kind],xq=kind==='xiangqi',f0=E.PUZ[st%E.PUZ.length],bd=E.fen(f0),cs=xq?24:44,ox=xq?30:20,oy=xq?27:25,sel=-1,targets=[],cur=xq?76:12,keyUsed=false,msg='',msgT=0,won=0,wt=0,flash=-1,ft=0;
  function cellAt(px,py){var c=Math.round((px-ox)/cs-(xq?0:.5)),r=Math.round((py-oy)/cs-(xq?0:.5));if(c<0||c>=E.C||r<0||r>=E.R)return -1;return r*E.C+c}
  function xy(i){var r=(i/E.C)|0,c=i%E.C;return xq?[ox+c*cs,oy+r*cs]:[ox+c*cs+cs/2,oy+r*cs+cs/2]}
  function click(i,inp){if(i<0){sel=-1;targets=[];return}
   if(sel>=0&&targets.indexOf(i)>=0){var nb=E.apply(bd,sel,i);sel=-1;targets=[];
    if(E.isMate(nb,false)){bd=nb;won=1;wt=0;inp.beep(660,.1)}else{flash=i;ft=.7;msg='Não é xeque-mate! Tente outro lance.';msgT=2;inp.beep(140,.3,'sawtooth')}return}
   if(bd[i]&&E.isW(bd[i])){var lg=E.legal(bd,i);if(lg.length){sel=i;targets=lg;inp.beep(520,.05)}else{sel=-1;targets=[]}}else{sel=-1;targets=[]}}
  return {txt:(xq?'🀄 Xiangqi: vermelho joga, dê XEQUE-MATE em 1 lance! Toque na peça e depois na casa.':'♟️ Mini-xadrez 5x5: brancas jogam, dê XEQUE-MATE em 1 lance! Toque na peça e depois na casa.'),p:0,
   u:function(dt,inp){msgT-=dt;ft-=dt;if(won){wt+=dt;if(wt>1){inp.beep(880,.15);this.p=1;return 'win'}return}
    var r=(cur/E.C)|0,c=cur%E.C;if(inp.l){c=Math.max(0,c-1);keyUsed=true}if(inp.r){c=Math.min(E.C-1,c+1);keyUsed=true}if(inp.up){r=Math.max(0,r-1);keyUsed=true}if(inp.dn){r=Math.min(E.R-1,r+1);keyUsed=true}cur=r*E.C+c;
    if(inp.act){keyUsed=true;click(cur,inp)}else if(inp.tap&&inp.px!=null){keyUsed=false;click(cellAt(inp.px,inp.py),inp)}},
   d:function(g,t){var i,p,rad=xq?12:19;
    g.fillStyle=xq?'#2b1d12':'#1c2540';g.fillRect(0,0,W,H);
    if(xq){g.fillStyle='#e9c98a';g.fillRect(ox-16,oy-16,8*cs+32,9*cs+32);g.strokeStyle='#5a3a1a';g.lineWidth=1.2;
     for(var r=0;r<10;r++){g.beginPath();g.moveTo(ox,oy+r*cs);g.lineTo(ox+8*cs,oy+r*cs);g.stroke()}
     for(var c=0;c<9;c++){g.beginPath();if(c===0||c===8){g.moveTo(ox+c*cs,oy);g.lineTo(ox+c*cs,oy+9*cs)}else{g.moveTo(ox+c*cs,oy);g.lineTo(ox+c*cs,oy+4*cs);g.moveTo(ox+c*cs,oy+5*cs);g.lineTo(ox+c*cs,oy+9*cs)}g.stroke()}
     [0,7].forEach(function(r0){g.beginPath();g.moveTo(ox+3*cs,oy+r0*cs);g.lineTo(ox+5*cs,oy+(r0+2)*cs);g.moveTo(ox+5*cs,oy+r0*cs);g.lineTo(ox+3*cs,oy+(r0+2)*cs);g.stroke()});
     g.fillStyle='#5a3a1a';g.font='bold 12px serif';g.textAlign='center';g.textBaseline='middle';g.fillText('楚 河          漢 界',ox+4*cs,oy+4.5*cs)}
    else{for(var rr=0;rr<5;rr++)for(var cc=0;cc<5;cc++){g.fillStyle=(rr+cc)%2?'#8a5a3b':'#e8d3a8';g.fillRect(ox+cc*cs,oy+rr*cs,cs,cs)}}
    function ring(j,col){p=xy(j);g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(p[0],p[1],rad,0,6.3);g.stroke()}
    if(keyUsed&&!won)ring(cur,'#54a0ff');
    if(sel>=0){ring(sel,'#f6e05e');targets.forEach(function(j){p=xy(j);if(bd[j]){ring(j,'rgba(255,90,90,.9)')}else{g.fillStyle='rgba(70,220,120,.9)';g.beginPath();g.arc(p[0],p[1],xq?4:7,0,6.3);g.fill()}})}
    if(ft>0&&flash>=0)ring(flash,'#e74c3c');
    g.textAlign='center';g.textBaseline='middle';
    for(i=0;i<E.N;i++){var q=bd[i];if(!q)continue;p=xy(i);var w=E.isW(q),lift=(sel===i)?-2-Math.sin(t*6):0;
     if(xq){g.fillStyle='#f6dfae';g.strokeStyle=w?'#c0392b':'#222';g.lineWidth=2;g.beginPath();g.arc(p[0],p[1]+lift,10.5,0,6.3);g.fill();g.stroke();g.fillStyle=w?'#c0392b':'#222';g.font='bold 14px "Noto Serif CJK SC","Microsoft YaHei","SimSun",serif';g.fillText(GL.xiangqi[q],p[0],p[1]+lift+1)}
     else{g.font='bold 36px "Segoe UI Symbol",system-ui';g.lineWidth=3;g.strokeStyle=w?'#222':'#ddd';g.strokeText(GL.mini[q.toLowerCase()],p[0],p[1]+lift+2);g.fillStyle=w?'#fff':'#15151c';g.fillText(GL.mini[q.toLowerCase()],p[0],p[1]+lift+2)}}
    g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='bold 13px system-ui';
    var x0=xq?250:260;g.fillText(xq?'Xadrez Chinês':'Mini-xadrez 5x5',x0,50);g.font='12px system-ui';g.fillStyle='#cfd8ff';
    [xq?'Vermelho joga e dá':'Brancas jogam e dão','XEQUE-MATE em 1 lance.','','Toque na peça e','depois na casa.'].forEach(function(l,k){g.fillText(l,x0,74+k*16)});
    if(won){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,H/2-26,W,52);g.fillStyle='#7bed9f';g.font='bold 26px system-ui';g.textAlign='center';g.fillText('Xeque-mate!',W/2,H/2+9);g.textAlign='left'}
    if(msgT>0){g.font='bold 13px system-ui';var tw=g.measureText(msg).width+20;g.fillStyle='rgba(0,0,0,.7)';g.fillRect((W-tw)/2,H-34,tw,24);g.fillStyle='#ff9f9f';g.textAlign='center';g.fillText(msg,W/2,H-17);g.textAlign='left'}},
   dbg:function(){return {sel:sel,t:targets.length,won:won}}}};
})(typeof window!=='undefined'?window:globalThis);
