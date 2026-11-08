/* Minijogo "Xadrez 3D" (Nintendo Switch): as brancas jogam e dão xeque-mate em 1 lance. Qualquer lance que dê mate vale. */
(function(window){
 var X=window.RBX_XADREZ,R3=window.RBX3D;if(!X||!R3||!R3.chess||!window.THREE||!window.RBX_M3D)return;
 var trad=function(st,easy,W,H,mk){var MD=mk?window.RBX_XADREZ_MODOS[mk]:null;
  var s=R3.shared(W,H,{bgColor:0x2a3350,fogDensity:0,fov:44,ambientIntensity:.7,dirIntensity:.9});
  var C=R3.chess,bd=X.fen((MD?MD.PUZ:X.PUZ)[st%(MD?MD.PUZ:X.PUZ).length]),grp=new THREE.Group(),meshes={},sel=-1,targets=[],cur=60,keyUsed=false,flash={sq:-1,t:0},msg='',msgT=0,anim=null,won=0,t0=0;
  s.scene.add(grp);var sq=C.board(grp);
  var floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),R3.mat(0x1b2238,.9,0));floor.rotation.x=-Math.PI/2;floor.position.y=-.52;floor.receiveShadow=true;s.scene.add(floor);
  s.sun.position.set(-6,14,8);
  function pos(i){return [(i&7)-3.5,(i>>3)-3.5]}
  for(var i=0;i<64;i++)if(bd[i]){var m=C.piece(bd[i].toLowerCase(),X.isW(bd[i])?'w':'b'),p=pos(i);m.position.set(p[0],0,p[1]);if(!X.isW(bd[i]))m.rotation.y=Math.PI;grp.add(m);meshes[i]=m}
  var yaw=0,pitch=8.4,pend=null;function orbit(){var R=6.6;s.camera.position.set(Math.sin(yaw)*R,pitch,Math.cos(yaw)*R);s.camera.lookAt(0,0,.2)}orbit();
  var ray=new THREE.Raycaster(),pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
  function cell(px,py){ray.setFromCamera(new THREE.Vector2(px/W*2-1,-(py/H)*2+1),s.camera);if(!ray.ray.intersectPlane(pl,hit))return -1;var c=Math.round(hit.x+3.5),r=Math.round(hit.z+3.5);if(c<0||c>7||r<0||r>7)return -1;return r*8+c}
  function click(i,inp){if(i<0){sel=-1;targets=[];return}
   if(sel>=0&&targets.indexOf(i)>=0){var nb=X.apply(bd,sel,i),from=sel;sel=-1;targets=[];
     if(MD?MD.val(bd,nb,from,i):X.isMate(nb,false)){anim={from:from,to:i,t:0,cap:meshes[i]};bd=nb;won=1;inp.beep(660,.1);}
     else{flash={sq:i,t:.7};msg=MD?MD.erro:'Não é xeque-mate! Tente outro lance.';msgT=2;inp.beep(140,.3,'sawtooth')}return}
   if(bd[i]&&X.isW(bd[i])){var lg=X.legal(bd,i);if(lg.length){sel=i;targets=lg;inp.beep(520,.05)}else{sel=-1;targets=[]}}else{sel=-1;targets=[]}}
  var mech={txt:MD?MD.txt+' Arraste para girar.':'♟️ Brancas jogam: dê XEQUE-MATE em 1 lance! Toque na peça e depois na casa. Arraste para girar o tabuleiro.',p:0,
   u:function(dt,inp){t0+=dt;msgT-=dt;flash.t-=dt;if(anim){anim.t+=dt;var k=Math.min(1,anim.t/.5),a=pos(anim.from),b=pos(anim.to),m=meshes[anim.from];m.position.set(a[0]+(b[0]-a[0])*k,Math.sin(k*3.14)*.8,a[1]+(b[1]-a[1])*k);if(k>=1){if(anim.cap)grp.remove(anim.cap);inp.beep(880,.15);this.p=1;return 'win'}return}
    if(inp.l){cur=(cur&~7)|Math.max(0,(cur&7)-1);keyUsed=true}if(inp.r){cur=(cur&~7)|Math.min(7,(cur&7)+1);keyUsed=true}if(inp.up){cur=Math.max(0,(cur>>3)-1)*8+(cur&7);keyUsed=true}if(inp.dn){cur=Math.min(7,(cur>>3)+1)*8+(cur&7);keyUsed=true}
    if(inp.act){keyUsed=true;click(cur,inp)}
    else if(inp.tap&&inp.px!=null){if(!inp.down){keyUsed=false;click(cell(inp.px,inp.py),inp)}else pend={x:inp.px,y:inp.py,lx:inp.px,ly:inp.py,moved:false}}
    if(pend&&inp.down&&inp.px!=null){if(Math.abs(inp.px-pend.x)>7||Math.abs(inp.py-pend.y)>7)pend.moved=true;if(pend.moved){yaw-=(inp.px-pend.lx)*.012;pitch=Math.max(4.5,Math.min(11,pitch+(inp.py-pend.ly)*.03));pend.lx=inp.px;pend.ly=inp.py;orbit()}}
    if(pend&&!inp.down){if(!pend.moved){keyUsed=false;click(cell(pend.x,pend.y),inp)}pend=null}},
   d:function(g,t){for(var r=0;r<8;r++)for(var c=0;c<8;c++)C.reset(sq[r][c]);
    if(keyUsed&&!anim)C.highlight(sq[cur>>3][cur&7],0x54a0ff);if(sel>=0){C.highlight(sq[sel>>3][sel&7],0xf6e05e);targets.forEach(function(j){C.highlight(sq[j>>3][j&7],bd[j]?0xff7675:0x7bed9f)})}
    if(flash.t>0&&flash.sq>=0)C.highlight(sq[flash.sq>>3][flash.sq&7],0xe74c3c);
    for(var i in meshes){var m=meshes[i];if(sel==i&&!anim)m.position.y=.15+Math.sin(t*6)*.05;else if(!anim||anim.from!=i)m.position.y=0}
    s.render(g);if(msgT>0){var k=W/320;g.font='bold '+13*k+'px system-ui';var tw=g.measureText(msg).width+20*k;g.fillStyle='rgba(0,0,0,.7)';g.fillRect((W-tw)/2,H-34*k,tw,24*k);g.fillStyle='#ff9f9f';g.textAlign='center';g.fillText(msg,W/2,H-17*k);g.textAlign='left'}}};
  mech.dbg=function(){return {sel:sel,t:targets.length,anim:!!anim,pend:!!pend,bd:bd.join('').length}};
  return mech;
 };
 /* Seletor de tipo de jogo (toque ou setas+ação): 1 Tradicional (padrão), 2 Xadrez Chinês, 3 Mini-xadrez 5x5 */
 var OPS=[['♟️','Xadrez tradicional','Ocidente · 3D · mate em 1','trad']].concat((window.RBX_XADREZ_MODOS_ORDEM||[]).map(function(k){var m=window.RBX_XADREZ_MODOS[k];return [m.ico,m.nome,'Tabuleiro 3D · '+m.sub,'m:'+k]})).concat([['🀄','Xadrez Chinês (Xiangqi)','Tabuleiro 9x10 · mate em 1','xiangqi'],['♛','Mini-xadrez 5x5','Tabuleiro pequeno · mate em 1','mini']]);
 window.RBX_M3D.xadrez=function(st,easy,W,H){
  var V=window.RBX_XADREZ_VAR,sel=0,inner=null,w={txt:'♟️ Escolha o tipo de xadrez: toque numa opção (ou ↑ ↓ e ação).',p:0};
  var NO=OPS.length;function by(i){return 64+i*24}
  function start(i,inp){sel=i;if(inp)inp.beep(620,.08);inner=OPS[i][3]==='trad'?trad(st,easy,W,H):OPS[i][3].slice(0,2)==='m:'?trad(st,easy,W,H,OPS[i][3].slice(2)):V.mech2d(OPS[i][3],st,W,H);w.txt=inner.txt;w.dbg=inner.dbg;w.mode=OPS[i][3]}
  w.u=function(dt,inp){if(inner){var r=inner.u(dt,inp);w.p=inner.p;return r}
   if(inp.up)sel=(sel+NO-1)%NO;if(inp.dn)sel=(sel+1)%NO;if(inp.act){start(sel,inp);return}
   if(inp.tap&&inp.px!=null){for(var i=0;i<NO;i++)if(inp.py>=by(i)-1&&inp.py<=by(i)+21&&inp.px>=30&&inp.px<=W-30){start(i,inp);return}}};
  w.d=function(g,t){if(inner){inner.d(g,t);return}
   var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a3350');gr.addColorStop(1,'#151a2c');g.fillStyle=gr;g.fillRect(0,0,W,H);
   g.textAlign='center';g.fillStyle='#fff';g.font='bold 18px system-ui';g.fillText('Escolha o tipo de xadrez',W/2,32);g.font='11px system-ui';g.fillStyle='#9fb0e0';g.fillText('Mesmo tabuleiro 3D, objetivos diferentes',W/2,56);
   for(var i=0;i<NO;i++){var y=by(i),on=i===sel;g.fillStyle=on?'#f6e05e':'rgba(255,255,255,.12)';g.fillRect(24,y,W-48,22);g.strokeStyle=on?'#fff':'rgba(255,255,255,.3)';g.lineWidth=1.5;g.strokeRect(24,y,W-48,22);
    g.textAlign='left';g.font='15px system-ui';g.fillStyle=on?'#222':'#fff';g.fillText(OPS[i][0],30,y+16);g.font='bold 11px system-ui';g.fillText((i+1)+') '+OPS[i][1],54,y+10);g.font='9px system-ui';g.fillStyle=on?'#444':'#b9c4ee';g.fillText(OPS[i][2],54,y+19)}
   g.textAlign='left'};
  return w;
 };

})(window);
