/* RBX_M3D (PSP) — nave / penalti / alvo / cobra / memoria: mecânicas 3D reais (Three.js r128) com sombras, névoa e modelos compostos.
   Substituem as versões 2D de robiox-3dspsp.js (mesmas regras e metas). Interface: (st,easy,W,H)=>{txt,p,u(dt,inp)->'win',d(g,t)}. */
if(!window.RBX_M3D)window.RBX_M3D={};
(function(window){
 var R3=window.RBX3D,T=window.THREE;if(!R3||!T)return;
 var M=window.RBX_M3D;
 function rnd(a,b){return a+Math.random()*(b-a)}
 function cl(v,a,b){return v<a?a:v>b?b:v}
 var _g={},_m={},_b={},_t={};
 function geo(k,f){return _g[k]||(_g[k]=f())}
 function mt(c,r,m){r=r==null?.65:r;m=m==null?.05:m;var k=c+'|'+r+'|'+m;return _m[k]||(_m[k]=R3.mat(c,r,m))}
 function bm(c,o){var k=c+'|'+(o==null?1:o);return _b[k]||(_b[k]=new T.MeshBasicMaterial({color:c,transparent:o!=null&&o<1,opacity:o==null?1:o}))}
 function mesh(g,m,x,y,z,cast){var o=new T.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.castShadow=cast!==false;o.receiveShadow=true;return o}
 function box(w,h,d,c,x,y,z,cast){return mesh(geo('b'+w+'_'+h+'_'+d,function(){return new T.BoxGeometry(w,h,d)}),mt(c),x,y,z,cast)}
 function sph(r,c,x,y,z,cast){return mesh(geo('s'+r,function(){return new T.SphereGeometry(r,14,10)}),mt(c),x,y,z,cast)}
 function cyl(rt,rb,h,c,x,y,z,cast){return mesh(geo('c'+rt+'_'+rb+'_'+h,function(){return new T.CylinderGeometry(rt,rb,h,14)}),mt(c),x,y,z,cast)}
 function cylx(rt,rb,h,c,x,y,z,cast){return mesh(geo('cx'+rt+'_'+rb+'_'+h,function(){var q=new T.CylinderGeometry(rt,rb,h,14);q.rotateZ(Math.PI/2);return q}),mt(c),x,y,z,cast)}
 function cylz(rt,rb,h,c,x,y,z,cast){return mesh(geo('cz'+rt+'_'+rb+'_'+h,function(){var q=new T.CylinderGeometry(rt,rb,h,18);q.rotateX(Math.PI/2);return q}),mt(c),x,y,z,cast)}
 function flat(w,d,c,x,y,z,rec){var o=mesh(geo('p'+w+'_'+d,function(){var q=new T.PlaneGeometry(w,d);q.rotateX(-Math.PI/2);return q}),mt(c,.9,0),x,y,z,false);o.receiveShadow=rec!==false;return o}
 function bp(inp,f,d,w){if(inp&&inp.beep)inp.beep(f,d,w)}
 function hud(g,s){g.font='bold 14px system-ui';g.textAlign='left';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.6)';g.fillStyle='#fff';g.strokeText(s,10,26);g.fillText(s,10,26)}
 function veil(g,W,H,a){if(a>0){g.fillStyle='rgba(255,50,20,'+Math.min(.3,a)+')';g.fillRect(0,0,W,H)}}
 function cloud(x,y,z,k){var c=new T.Group();[[0,0,0,1.6],[1.5,-.2,.2,1.2],[-1.5,-.3,0,1.2],[.6,.7,0,1.1]].forEach(function(p){var o=mesh(geo('cl'+p[3],function(){return new T.SphereGeometry(p[3],10,8)}),bm(0xffffff,.92),p[0],p[1],p[2],false);o.receiveShadow=false;c.add(o)});c.position.set(x,y,z);c.scale.setScalar(k||1);return c}
 var _glass=null;function glass(c){return _glass||(_glass=new T.MeshStandardMaterial({color:c,transparent:true,opacity:.7,roughness:.15,metalness:.4}))}
 /* explosões em pool */
 function fxPool(scene,n){var a=[];for(var i=0;i<n;i++){var mm=new T.MeshBasicMaterial({color:0xffc233,transparent:true,opacity:0});var o=new T.Mesh(geo('fx',function(){return new T.SphereGeometry(1,10,8)}),mm);o.visible=false;scene.add(o);a.push({m:o,t:0,d:.4,s:1})}
  return {boom:function(x,y,z,sz,col,d){var e=null,i;for(i=0;i<a.length;i++)if(a[i].t<=0){e=a[i];break}if(!e)e=a[0];e.t=e.d=d||.4;e.s=sz||1;e.m.position.set(x,y,z);e.m.material.color.setHex(col||0xffc233);e.m.visible=true},
   u:function(dt){a.forEach(function(e){if(e.t>0){e.t-=dt;var k=1-Math.max(0,e.t)/e.d;e.m.scale.setScalar(e.s*(.3+k*1.3));e.m.material.opacity=.9*(1-k);if(e.t<=0)e.m.visible=false}})}}}
 function tex(key,w,h,draw){if(_t[key])return _t[key];var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new T.CanvasTexture(c);t.minFilter=T.LinearFilter;t.anisotropy=4;t.encoding=T.sRGBEncoding;return(_t[key]=t)}

 /* ================= NAVE ================= */
 M.nave=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x0b1040,fogDensity:.009,fov:50,ambientIntensity:.55,dirIntensity:1.05});
  s.sun.position.set(-4,22,7);s.camera.position.set(-1.5,2.8,17.5);s.camera.lookAt(.5,-.4,0);
  var sc=0,tm=.5,cool=0,flash=0,clock=0,y=0,ty=0,kills=0,need=22,spd=(70+st*4)*28/480,bl=[],en=[];
  var floor=flat(170,70,0x16225f,0,-6.6,0);floor.material=mt(0x16225f,.45,.45);s.scene.add(floor);
  var grid=new T.GridHelper(170,85,0x4de1ff,0x2b57c4);grid.position.y=-6.58;s.scene.add(grid);
  function stars(rng){var n=130,p=new Float32Array(n*3);for(var i=0;i<n;i++){p[i*3]=rnd(-50,50);p[i*3+1]=rnd(-5,26);p[i*3+2]=rnd(-70,-30)}var q=new T.BufferGeometry();q.setAttribute('position',new T.BufferAttribute(p,3));return new T.Points(q,new T.PointsMaterial({color:0xffffff,size:rng,sizeAttenuation:false,fog:false}))}
  var sA=new T.Group(),sB=new T.Group();[sA,sB].forEach(function(gp){gp.add(stars(2));var b=stars(1.3);b.position.x=100;gp.add(b);s.scene.add(gp)});
  var planet=new T.Group();planet.add(mesh(geo('pln',function(){return new T.SphereGeometry(9,24,18)}),mt(0xff9a5c,.8,0),0,0,0,false));var rg=mesh(geo('rng',function(){return new T.TorusGeometry(13.5,.7,6,48)}),bm(0xffd9a8,.8),0,0,0,false);rg.rotation.x=1.25;planet.add(rg);planet.add(mesh(geo('mn',function(){return new T.SphereGeometry(2,12,10)}),mt(0xc9d1e6,.9,0),-12,7,3,false));planet.position.set(22,8,-58);s.scene.add(planet);
  var pyl=[];for(var i=0;i<12;i++){var h=rnd(6,13),pg=new T.Group();pg.add(box(1.6,h,1.6,0x2d3a8c,0,h/2-6.6,0));pg.add(box(1.9,.35,1.9,0x4de1ff,0,h-6.6,0,false));pg.children[1].material=bm(0x4de1ff);pg.position.set(i*13-70,0,-rnd(13,22));s.scene.add(pg);pyl.push(pg)}
  /* nave do jogador */
  var sg=new T.Group(),inner=new T.Group();sg.add(inner);
  inner.add(mesh(geo('nb',function(){var c=new T.ConeGeometry(.5,3,10);c.rotateZ(-Math.PI/2);return c}),mt(0xeef3ff,.3,.45),.5,0,0));
  inner.add(cylx(.5,.58,1.3,0xc9d4ee,-1.05,0,0));inner.add(cylx(.38,.45,.35,0x2b2f45,-1.8,0,0));
  var cp=sph(.5,0x5ee7ff,.1,.32,0);cp.scale.set(1.2,.62,.75);cp.material=mt(0x5ee7ff,.15,.8);inner.add(cp);
  [-1,1].forEach(function(sd){var w=box(1.5,.08,1.5,0xdfe6f5,-.6,-.05,sd*.95);w.rotation.y=-sd*.55;inner.add(w);var tp=box(.55,.1,.3,0xe74c3c,-1.1,-.05,sd*1.6);inner.add(tp);var gun=cylx(.07,.07,.9,0x2b2f45,.6,-.1,sd*.5);inner.add(gun)});
  var fin=box(.9,.9,.08,0xe74c3c,-1.15,.55,0);fin.rotation.z=.45;inner.add(fin);
  var flame=mesh(geo('fl',function(){var c=new T.ConeGeometry(.35,1.4,8);c.rotateZ(Math.PI/2);return c}),bm(0xffa03a,.9),-2.4,0,0,false);inner.add(flame);var flame2=mesh(geo('fl2',function(){var c=new T.ConeGeometry(.2,.9,8);c.rotateZ(Math.PI/2);return c}),bm(0xfff3a0),-2.1,0,0,false);inner.add(flame2);
  sg.position.set(-9,0,0);s.scene.add(sg);
  var fx=fxPool(s.scene,10);
  function foe(k){var g=new T.Group();
   if(k===0){var a=mesh(geo('ast',function(){return new T.DodecahedronGeometry(.9,0)}),mt(0x8d7b6a,.95,0),0,0,0);a.scale.set(rnd(.95,1.25),rnd(.85,1.1),rnd(.95,1.2));g.add(a);for(var i=0;i<3;i++)g.add(mesh(geo('ast2',function(){return new T.DodecahedronGeometry(.42,0)}),mt(0x6f604f,.95,0),rnd(-.6,.6),rnd(-.6,.6),rnd(-.4,.6)))}
   else if(k===1){g.add(mesh(geo('ufo',function(){var q=new T.SphereGeometry(1.15,18,10);q.scale(1,.28,1);return q}),mt(0xb5c0d8,.25,.75),0,0,0));g.add(mesh(geo('ufod',function(){return new T.SphereGeometry(.58,14,10)}),glass(0x7dffd0),0,.28,0,false));[0,1,2,3,4].forEach(function(i){var a=i/5*6.283;g.add(mesh(geo('ufol',function(){return new T.SphereGeometry(.12,8,6)}),bm([0xff5e5e,0xffe14d,0x5effa0,0x5ec8ff,0xff7bd5][i]),Math.cos(a)*.95,-.02,Math.sin(a)*.95,false))})}
   else{g.add(sph(.78,0x9b4dff,0,0,0));var ey=sph(.4,0xffffff,-.35,.12,.5);g.add(ey);g.add(sph(.18,0x111111,-.5,.12,.82));[[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){var c=mesh(geo('sp',function(){return new T.ConeGeometry(.18,.55,6)}),mt(0xff4fa0),d[0]*.9,d[1]*.9,0);c.rotation.z=d[0]?(d[0]>0?-Math.PI/2:Math.PI/2):(d[1]>0?0:Math.PI);g.add(c)});g.add(cyl(.04,.04,.7,0x555555,.1,.95,0));g.add(sph(.12,0xffe14d,.1,1.35,0))}
   g.userData.k=k;return g}
  var mech={txt:'🚀 ARRASTE (ou ↑ ↓ / incline) para mover a nave. Ela atira sozinha: destrua 22 inimigos e desvie!',p:0,
  u:function(dt,inp){clock+=dt;sc+=dt*8;
   if(inp.px!=null&&inp.down)ty=(.5-inp.py/H)*14;if(inp.up)ty+=1.7;if(inp.dn)ty-=1.7;ty=cl(ty,-5.2,5.2);
   var old=y;y+=(ty-y)*Math.min(1,dt*9);sg.position.y=y;inner.rotation.z=cl((y-old)*8,-.5,.5);inner.rotation.x=Math.sin(clock*3)*.04;
   var fl=.8+Math.random()*.5;flame.scale.set(fl,1,1);flame2.scale.set(fl,1,1);
   cool-=dt;if(cool<=0){var bg=new T.Group();bg.add(mesh(geo('bu',function(){return new T.BoxGeometry(1,.14,.14)}),bm(0x7df9ff),0,0,.5,false));bg.add(mesh(geo('bu',function(){return new T.BoxGeometry(1,.14,.14)}),bm(0x7df9ff),0,0,-.5,false));bg.add(mesh(geo('bu2',function(){return new T.BoxGeometry(1.3,.3,1.3)}),bm(0x7df9ff,.2),0,0,0,false));bg.position.set(-7.4,y,0);s.scene.add(bg);bl.push({m:bg,x:-7.4,y:y});cool=inp.act?.18:.32;bp(inp,740,.04)}
   tm-=dt;if(tm<=0){var k=(Math.random()*3)|0,g=foe(k),ey=rnd(-5,5);g.position.set(16.5,ey,0);s.scene.add(g);en.push({m:g,x:16.5,y:ey,y0:ey,k:k,ph:rnd(0,6)});tm=rnd(.5,.95)/(easy?.9:1)}
   bl.forEach(function(b){b.x+=14*dt;b.m.position.x=b.x});
   en.forEach(function(e){e.x-=spd*dt;e.ph+=dt;if(e.k===2)e.y=e.y0+Math.sin(e.ph*3)*.8;else if(e.k===1)e.y=e.y0+Math.sin(e.ph*2)*.35;e.m.position.set(e.x,e.y,0);
    if(e.k===0){e.m.rotation.x+=dt*1.2;e.m.rotation.y+=dt*.8}else if(e.k===1){e.m.rotation.y+=dt*3;e.m.rotation.z=Math.sin(e.ph*2)*.2}else e.m.rotation.y=Math.sin(e.ph*2)*.4;
    if(!e.h&&e.x>-11&&e.x<-7&&Math.abs(e.y-y)<1.05){e.h=1;kills=Math.max(0,kills-2);flash=.5;fx.boom(e.x,e.y,0,1.3,0xff5530,.45);bp(inp,120,.25,'sawtooth')}});
   bl.forEach(function(b){en.forEach(function(e){if(!e.h&&!b.h&&Math.abs(b.x-e.x)<1.05&&Math.abs(b.y-e.y)<1.0){e.h=1;b.h=1;kills++;fx.boom(e.x,e.y,0,1.5,e.k===1?0x7dffd0:0xffc233,.35);bp(inp,520+Math.random()*200,.07)}})});
   bl=bl.filter(function(b){if(b.x>17||b.h){s.scene.remove(b.m);return false}return true});
   en=en.filter(function(e){if(e.x<-17||e.h){s.scene.remove(e.m);return false}return true});
   fx.u(dt);flash-=dt;sg.visible=!(flash>0)||(((clock*20)|0)%2===0);
   grid.position.x=-(sc%2);sA.position.x=-((sc*.5)%100);sB.position.x=-((sc*1.1)%100);planet.rotation.y+=dt*.05;
   pyl.forEach(function(p){p.position.x-=dt*9;if(p.position.x<-75)p.position.x+=156});
   mech.p=cl(kills/need,0,1);if(kills>=need)return 'win'},
  d:function(g,t){s.render(g);veil(g,W,H,flash*.5);hud(g,'💥 '+kills+'/'+need)}};
  return mech};

 /* ================= PÊNALTI ================= */
 M.penalti=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x9fdcff,fogDensity:.0055,fov:48,ambientIntensity:.68,dirIntensity:.95});
  s.sun.position.set(8,24,10);s.camera.position.set(0,2.5,8.2);s.camera.lookAt(0,1.45,-14);
  var gw=9,gh=3.4,gz=-14,bz=2.5,goals=0,need=6,sp=1.7+st*.1,shot=null,kp=0,tt=0,res='',resT=0,flash=0,kx=0,cheer=0,ax=0,ay=1.5;
  var g0=flat(220,150,0x3da24b,0,0,-30);s.scene.add(g0);
  for(var i=0;i<14;i+=2){var sp2=flat(160,4,0x46b457,0,.012,10-i*4);s.scene.add(sp2)}
  function line(w,d,x,z){s.scene.add(flat(w,d,0xffffff,x,.02,z,false))}
  line(60,.18,0,gz);line(.18,6.8,-10,gz+3.4);line(.18,6.8,10,gz+3.4);line(20.2,.18,0,gz+6.8);var spot=cyl(.22,.22,.02,0xffffff,0,.02,bz,false);s.scene.add(spot);
  var wh=0xffffff;[-1,1].forEach(function(sd){s.scene.add(cyl(.1,.1,gh,wh,sd*gw/2,gh/2,gz));s.scene.add(cyl(.07,.07,gh*.82,wh,sd*gw/2,gh*.41,gz-2.2))});
  s.scene.add(cylx(.1,.1,gw+.2,wh,0,gh,gz));s.scene.add(cylx(.07,.07,gw,wh,0,gh*.82,gz-2.2));
  var netT=tex('net',32,32,function(c,w,h){c.clearRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=2;c.strokeRect(0,0,w,h)});
  function netM(rx,ry){var t=netT.clone();t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx,ry);return new T.MeshBasicMaterial({map:t,transparent:true,side:T.DoubleSide,depthWrite:false,opacity:.8})}
  var nb=new T.Mesh(new T.PlaneGeometry(gw,gh*.82),netM(gw*2.2,gh*1.8));nb.position.set(0,gh*.41,gz-2.2);s.scene.add(nb);
  var nt=new T.Mesh(new T.PlaneGeometry(gw,2.3),netM(gw*2.2,5));nt.rotation.x=Math.PI/2-.12;nt.position.set(0,gh*.91,gz-1.1);s.scene.add(nt);
  [-1,1].forEach(function(sd){var ns=new T.Mesh(new T.PlaneGeometry(2.2,gh*.92),netM(5,gh*1.8));ns.rotation.y=Math.PI/2;ns.position.set(sd*gw/2,gh*.45,gz-1.1);s.scene.add(ns)});
  /* placas, arquibancada e torcida */
  var adc=[0xe74c3c,0x3498db,0xf1c40f,0x2ecc71,0xe67e22,0x9b59b6];
  for(i=0;i<9;i++){var ad=box(6,1.3,.3,adc[i%6],-24+i*6,.65,gz-9,false);s.scene.add(ad);s.scene.add(box(5.2,.18,.32,0xffffff,-24+i*6,.65,gz-8.97,false))}
  for(i=0;i<3;i++){s.scene.add(box(80,1.3,3.2,[0x4b4f66,0x3c405a,0x2f3248][i],0,.65+i*1.3+.65,gz-12-i*3.2,false))}
  var heads=[];for(i=0;i<3;i++)for(var j=0;j<22;j++){var hh=sph(.38,[0xffdbac,0xe0ac69,0xc68642,0x8d5524,0xf1c27d][(i+j)%5],-24+j*2.2+(i%2)*1.1,2.7+i*1.3+.65,gz-12-i*3.2+.4,false);var sh=box(.9,.8,.5,adc[(i*3+j)%6],hh.position.x,hh.position.y-.62,hh.position.z,false);s.scene.add(sh);s.scene.add(hh);heads.push({m:hh,b:hh.position.y,ph:rnd(0,6)})}
  [-1,1].forEach(function(sd){s.scene.add(cyl(.35,.5,22,0x666b80,sd*38,11,gz-8,false));s.scene.add(box(6,1.6,1.2,0xfff7c2,sd*38,22.5,gz-8,false)).material;});
  s.scene.add(cloud(-18,20,-60,2.2));s.scene.add(cloud(14,25,-70,2.6));s.scene.add(cloud(40,18,-55,1.8));
  /* goleiro */
  var kg=new T.Group(),kid=R3.kid(0xf1c40f);kid.scale.setScalar(1.15);kg.add(kid);var ud=kid.userData;
  [ud.leftArm,ud.rightArm].forEach(function(a){var gl=sph(.24,0xff7a2f,0,-.95,0);a.add(gl)});
  kg.position.set(0,0,gz+.4);s.scene.add(kg);
  /* batedor */
  var sk=R3.kid(0x2980b9);sk.scale.setScalar(1.15);sk.position.set(3.8,0,bz-1.2);s.scene.add(sk);
  /* bola */
  var ball=new T.Group();ball.add(sph(.34,0xffffff,0,0,0));[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach(function(v){ball.add(sph(.13,0x222222,v[0]*.31,v[1]*.31,v[2]*.31,false))});ball.position.set(0,.34,bz);s.scene.add(ball);
  /* mira */
  var aim=new T.Group();var ring=mesh(geo('ar',function(){return new T.RingGeometry(.38,.5,28)}),new T.MeshBasicMaterial({color:0xff3030,depthTest:false,transparent:true}),0,0,0,false);aim.add(ring);
  [[.9,.06],[.06,.9]].forEach(function(d){aim.add(mesh(geo('ac'+d[0],function(){return new T.PlaneGeometry(d[0],d[1])}),new T.MeshBasicMaterial({color:0xff3030,depthTest:false}),0,0,0,false))});
  aim.children.forEach(function(c){c.renderOrder=20});aim.position.z=gz+.2;s.scene.add(aim);
  var mech={txt:'⚽ TOQUE (ou ESPAÇO) para chutar quando a mira estiver longe do goleiro! Marque 6 gols.',p:0,
  u:function(dt,inp){tt+=dt;kp+=dt;flash-=dt;resT-=dt;cheer=Math.max(0,cheer-dt*.8);
   ax=(Math.sin(tt*sp*1.7))*(gw/2)*1.04;ay=(Math.sin(tt*sp*1.1+1)+1)/2*(gh+.1)+.04;aim.position.x=ax;aim.position.y=ay;aim.visible=!shot;aim.rotation.z=tt*2;
   if(!shot){kx+=(Math.sin(kp*1.4)*gw*.355-kx)*Math.min(1,dt*3);
    if(inp.tap||inp.act){shot={x:ax,y:ay,t:0,tx:kx,ty:rnd(.5,gh-.5),kx:0,ky:0};bp(inp,300,.1)}}
   else{shot.t+=dt;var k=Math.min(1,shot.t/.55);
    ball.position.set(shot.x*k,.34+(shot.y-.34)*k+Math.sin(k*Math.PI)*1.1,bz+(gz+.2-bz)*k);ball.rotation.x-=dt*18;
    if(shot.t>.2&&!shot.dv){shot.dv=1;shot.kx=shot.tx+rnd(-1,1)*gw*.38;shot.ky=shot.ty}
    if(shot.t>=.55){var sv=Math.abs(shot.x-shot.kx)<gw*34/180&&Math.abs(shot.y-shot.ky)<gh*30/76,out=Math.abs(shot.x)>gw/2||shot.y<0||shot.y>gh;
     if(!sv&&!out){goals++;res='GOOOL! ⚽';cheer=1.4;bp(inp,880,.2)}else{goals=Math.max(0,goals-1);res=sv?'DEFENDEU!':'PARA FORA!';flash=.5;bp(inp,130,.25,'sawtooth')}
     resT=1;shot=null;kx=0;ball.position.set(0,.34,bz);ball.rotation.set(0,0,0)}}
   /* goleiro: pose pronta ou mergulho */
   var dk=shot&&shot.dv?Math.min(1,(shot.t-.2)/.3):0,gx=shot&&shot.dv?shot.tx+(shot.kx-shot.tx)*dk:kx,dx=shot&&shot.dv?shot.kx-shot.tx:0;
   kg.position.x=gx;kg.position.y=shot&&shot.dv?Math.max(0,(shot.ky-1.15)*dk):0;kg.rotation.z=-Math.sign(dx||0)*dk*1.15;
   ud.leftArm.rotation.z=-1.0-dk*1.6;ud.rightArm.rotation.z=1.0+dk*1.6;ud.leftLeg.rotation.z=-.25;ud.rightLeg.rotation.z=.25;
   /* batedor chuta */
   ud=ud;var kick=shot?Math.sin(Math.min(1,shot.t/.3)*Math.PI):0;sk.userData.rightLeg.rotation.x=kick*1.3;sk.userData.leftLeg.rotation.x=-kick*.3;
   heads.forEach(function(h){h.m.position.y=h.b+(cheer>0?Math.abs(Math.sin(tt*9+h.ph))*.5*Math.min(1,cheer):0)});
   mech.p=cl(goals/need,0,1);if(goals>=need)return 'win'},
  d:function(g,t){s.render(g);veil(g,W,H,flash*.5);hud(g,'⚽ '+goals+'/'+need);
   if(resT>0){g.font='bold 24px system-ui';g.textAlign='center';g.lineWidth=5;g.strokeStyle='#000';g.fillStyle='#fff';g.strokeText(res,W/2,H/2);g.fillText(res,W/2,H/2);g.textAlign='left'}}};
  return mech};

 /* ================= ALVO ================= */
 M.alvo=function(st,easy,W,H){
  var FOV=52,s=R3.shared(W,H,{bgColor:0xa8dcff,fogDensity:.0065,fov:FOV,ambientIntensity:.68,dirIntensity:.95});
  s.sun.position.set(-8,26,10);s.camera.position.set(0,2.7,9);s.camera.lookAt(0,2.2,-12);
  var focal=(H/2)/Math.tan(FOV*Math.PI/360),R0=1.1,tg=[],anim=[],hits=0,need=15,tm=.4,cx=W/2,cy=H/2,flash=0,life=2.2-Math.min(.8,st*.07),clock=0;
  s.scene.add(flat(240,150,0x4fae4f,0,0,-40));s.scene.add(flat(34,70,0xb98d56,0,.012,-12));
  for(var i=0;i<6;i++)s.scene.add(flat(34,.12,0xa27a46,0,.02,6-i*7,false));
  for(i=0;i<8;i++){var hb=box(2.6,1.6,1.8,0xe5c15a,-12+i*3.4,.8,-24,true);s.scene.add(hb);s.scene.add(box(2.6,.1,.12,0xb89a38,-12+i*3.4,.8,-23.1,false));if(i%2)s.scene.add(box(2.6,1.6,1.8,0xe5c15a,-12+i*3.4-1.7,2.4,-24))}
  [-1,1].forEach(function(sd){for(var k=0;k<3;k++){var t=R3.tree();t.scale.setScalar(2.2+k*.4);t.position.set(sd*(21+k*7),0,-6-k*9);s.scene.add(t)}var r=R3.rock();r.scale.setScalar(1.6);r.position.set(sd*12,0,-4);s.scene.add(r);
   s.scene.add(cyl(.12,.12,6,0x6b4a2a,sd*14,3,-18));var fl=mesh(geo('fg',function(){return new T.PlaneGeometry(2.2,1.3)}),new T.MeshBasicMaterial({color:sd>0?0xe74c3c:0x3498db,side:T.DoubleSide}),sd*14+1.1,5.3,-18,false);s.scene.add(fl)});
  for(i=0;i<5;i++){var mn=mesh(geo('mt',function(){return new T.ConeGeometry(18,22,6)}),mt(i%2?0x7f8fa6:0x6c7a92,.9,0),-80+i*40+rnd(-5,5),9,-110,false);s.scene.add(mn)}
  s.scene.add(cloud(-20,22,-70,2.4));s.scene.add(cloud(18,26,-80,2.8));s.scene.add(cloud(45,20,-60,2));
  var fx=fxPool(s.scene,8);
  var RC=[0xffffff,0xe74c3c,0xffffff,0xe74c3c,0x1b1b1b],RR=[1,.8,.6,.4,.17];
  function mkT(){var g=new T.Group(),H0=rnd(1.5,4.2),d=new T.Group();d.position.y=H0;g.add(d);
   g.add(cyl(.09,.11,H0,0x6b4a2a,0,H0/2,0));d.add(cylz(1.08,1.08,.1,0x3b2a18,0,0,-.08));
   for(var k=0;k<5;k++)d.add(cylz(RR[k],RR[k],.1,RC[k],0,0,k*.025,false));
   var bx=rnd(-9.5,9.5),bz=rnd(-17,-3);g.position.set(bx,0,bz);g.userData.d=d;g.userData.H=H0;return g}
  function scr(o){var v=new T.Vector3();o.userData.d.getWorldPosition(v);var dist=v.distanceTo(s.camera.position);v.project(s.camera);return {x:(v.x*.5+.5)*W,y:(-v.y*.5+.5)*H,dist:dist}}
  function shoot(inp){s.camera.updateMatrixWorld();var b=null,bd=999;tg.forEach(function(o){if(o.dead)return;var p=scr(o.m),r=R0*o.sc*focal/p.dist,d=Math.hypot(p.x-cx,p.y-cy);if(d<r+3&&d<bd){bd=d;b=o}});
   if(b){b.dead=1;hits++;var w=new T.Vector3();b.m.userData.d.getWorldPosition(w);fx.boom(w.x,w.y,w.z+.3,1.4,0xffc233,.3);anim.push({m:b.m,t:.35});bp(inp,800,.08)}else bp(inp,180,.05)}
  var mech={txt:'🎯 TOQUE nos alvos (ou ← → ↑ ↓ e ESPAÇO) antes que sumam! Acerte 15; alvo que some tira 1 ponto.',p:0,
  u:function(dt,inp){clock+=dt;if(inp.tap&&inp.px!=null){cx=inp.px;cy=inp.py;shoot(inp)}cx+=inp.dx*180*dt;if(inp.up)cy-=26;if(inp.dn)cy+=26;cx=cl(cx,8,W-8);cy=cl(cy,8,H-8);if(inp.act)shoot(inp);
   tm-=dt;if(tm<=0&&tg.length<4){s.camera.updateMatrixWorld();var m=null,ok=0;for(var tr=0;tr<8&&!ok;tr++){if(m)s.scene.remove(m);m=mkT();s.scene.add(m);m.updateMatrixWorld(true);var p=scr(m);ok=1;for(var q=0;q<tg.length;q++){var pp=scr(tg[q].m);if(Math.hypot(pp.x-p.x,pp.y-p.y)<60){ok=0;break}}}
    m.scale.setScalar(.01);tg.push({m:m,t:life,l:life,age:0,sc:1});tm=rnd(.55,1)}
   tg.forEach(function(o){o.t-=dt;o.age+=dt;var sh=.52+.48*Math.min(1,o.t/o.l+.25),pop=Math.min(1,o.age/.18),pe=1+2.7*Math.pow(pop-1,3)+1.7*Math.pow(pop-1,2);o.sc=sh;o.m.scale.setScalar(Math.max(.01,sh*pe));
    if(o.t<=0&&!o.dead){o.dead=1;o.gone=1;hits=Math.max(0,hits-1);flash=.4;anim.push({m:o.m,t:.2,fade:1});bp(inp,130,.2,'sawtooth')}});
   tg=tg.filter(function(o){return !o.dead});
   anim.forEach(function(a){a.t-=dt;if(a.fade)a.m.scale.multiplyScalar(Math.max(.01,1-dt*6));else{a.m.userData.d.rotation.x=-(1-Math.max(0,a.t)/.35)*1.5}});
   anim=anim.filter(function(a){if(a.t<=0){s.scene.remove(a.m);return false}return true});
   fx.u(dt);flash-=dt;mech.p=cl(hits/need,0,1);if(hits>=need)return 'win'},
  d:function(g,t){s.render(g);veil(g,W,H,flash*.5);
   [['#fff',5],['#111',2.2]].forEach(function(c){g.strokeStyle=c[0];g.lineWidth=c[1];g.beginPath();g.arc(cx,cy,9,0,7);g.moveTo(cx-15,cy);g.lineTo(cx-4,cy);g.moveTo(cx+4,cy);g.lineTo(cx+15,cy);g.moveTo(cx,cy-15);g.lineTo(cx,cy-4);g.moveTo(cx,cy+4);g.lineTo(cx,cy+15);g.stroke()});
   hud(g,'🎯 '+hits+'/'+need)}};
  return mech};

 /* ================= COBRA ================= */
 M.cobra=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x9fe0ff,fogDensity:.006,fov:50,ambientIntensity:.7,dirIntensity:.95});
  s.sun.position.set(6,22,8);s.camera.position.set(0,13.2,9.6);s.camera.lookAt(0,0,.4);
  var cols=20,rows=12,sn,prev,dir,nd,ap,got=0,need=12,acc=0,flash=0,pulse=0,clock=0,stepT=Math.max(.085,.17-st*.008+(easy?.03:0))*1.55;
  s.scene.add(flat(120,90,0x4cae4c,0,-.12,0));
  var bt=tex('cobraB',320,192,function(c){for(var x=0;x<20;x++)for(var y=0;y<12;y++){c.fillStyle=(x+y)%2?'#3d8f4e':'#47a35a';c.fillRect(x*16,y*16,16,16)}});
  var bd=new T.Mesh(geo('cbd',function(){var q=new T.PlaneGeometry(20,12);q.rotateX(-Math.PI/2);return q}),new T.MeshStandardMaterial({map:bt,roughness:.9}));bd.receiveShadow=true;s.scene.add(bd);
  s.scene.add(box(21.2,.7,.6,0x8a5a2b,0,.1,-6.3));s.scene.add(box(21.2,.7,.6,0x8a5a2b,0,.1,6.3));s.scene.add(box(.6,.7,13.2,0x8a5a2b,-10.3,.1,0));s.scene.add(box(.6,.7,13.2,0x8a5a2b,10.3,.1,0));
  [[-12.5,-7.5],[12.5,-7.8],[-13,6.5],[13,6.2],[-16,-1],[16,1]].forEach(function(p,i){var t=R3.tree();t.scale.setScalar(1.6+(i%3)*.35);t.position.set(p[0],-.1,p[1]);s.scene.add(t)});
  [[-11.5,7.8],[11.8,-7.2],[-12,-4]].forEach(function(p){var r=R3.rock();r.scale.setScalar(1.1);r.position.set(p[0],-.1,p[1]);s.scene.add(r)});
  for(var i=0;i<22;i++){var fl=sph(.16,[0xff6b9d,0xfff06b,0xffffff,0xb48cff][i%4],rnd(-17,17),-.02,rnd(7.5,12)*(i%2?1:-1),false);if(Math.abs(fl.position.x)<11&&Math.abs(fl.position.z)<7.5)fl.position.x+=14;s.scene.add(fl)}
  s.scene.add(cloud(-14,16,-30,2));s.scene.add(cloud(16,18,-36,2.4));
  function cell(c){return [c[0]-cols/2+.5,c[1]-rows/2+.5]}
  function newap(){do{ap=[(Math.random()*cols)|0,(Math.random()*rows)|0]}while(sn.some(function(c){return c[0]===ap[0]&&c[1]===ap[1]}))}
  function reset(){sn=[[6,(rows/2)|0],[5,(rows/2)|0],[4,(rows/2)|0]];prev=sn.slice();dir=[1,0];nd=dir;acc=0;newap()}
  reset();
  var segs=[];function seg(i){while(segs.length<=i){var n=segs.length,m=sph(.44,n%2?0x35c759:0x2db84f,0,.45,0);m.scale.set(1,.9,1);s.scene.add(m);segs.push(m)}return segs[i]}
  var head=new T.Group(),hb=sph(.55,0xa6ff7a,0,0,0);hb.scale.set(1.1,.9,1);head.add(hb);
  [-1,1].forEach(function(sd){head.add(sph(.18,0xffffff,.38,.25,sd*.28,false));head.add(sph(.09,0x111111,.52,.27,sd*.3,false))});
  var tg=box(.5,.04,.1,0xe74c3c,.78,0,0,false);head.add(tg);head.add(box(.2,.04,.1,0xe74c3c,1.08,0,.1,false));head.add(box(.2,.04,.1,0xe74c3c,1.08,0,-.1,false));
  s.scene.add(head);
  var apple=new T.Group();apple.add(sph(.4,0xe53935,0,.42,0));apple.add(box(.06,.22,.06,0x6b4a2a,0,.88,0,false));var lf=sph(.14,0x2ecc71,.14,.88,0,false);lf.scale.set(1.6,.3,1);apple.add(lf);s.scene.add(apple);
  function turn(a,b){if(a!==-dir[0]||b!==-dir[1]){if(a||b)nd=[a,b]}}
  var tv=new T.Vector3();
  var mech={txt:'🐍 Use ← ↑ ↓ → (ou TOQUE para onde quer ir) e coma 12 maçãs sem bater nas bordas ou em você.',p:0,
  u:function(dt,inp){clock+=dt;if(inp.l)turn(-1,0);if(inp.r)turn(1,0);if(inp.up)turn(0,-1);if(inp.dn)turn(0,1);
   if(inp.tap&&inp.px!=null){s.camera.updateMatrixWorld();var hc=cell(sn[0]);tv.set(hc[0],.4,hc[1]).project(s.camera);var hx=(tv.x*.5+.5)*W,hy=(-tv.y*.5+.5)*H,dx=inp.px-hx,dy=inp.py-hy;if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1,0);else turn(0,dy>0?1:-1)}
   acc+=dt;flash-=dt;pulse=Math.max(0,pulse-dt*3);
   while(acc>=stepT){acc-=stepT;dir=nd;var h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];
    if(h[0]<0||h[1]<0||h[0]>=cols||h[1]>=rows||sn.some(function(c){return c[0]===h[0]&&c[1]===h[1]})){got=Math.max(0,got-3);flash=.6;bp(inp,120,.3,'sawtooth');reset();break}
    prev=sn.slice();sn.unshift(h);if(h[0]===ap[0]&&h[1]===ap[1]){got++;pulse=1;bp(inp,760,.08);newap()}else sn.pop()}
   var k=Math.min(1,acc/stepT);
   for(var i=0;i<sn.length;i++){var a=cell(prev[Math.min(i,prev.length-1)]),b=cell(sn[i]),m=seg(i);m.visible=i>0;m.position.set(a[0]+(b[0]-a[0])*k,.45,a[1]+(b[1]-a[1])*k);var f=1-i/(sn.length+4)*.35;m.scale.set(f,.9*f,f)}
   for(;i<segs.length;i++)segs[i].visible=false;
   var pa=cell(prev[0]),pb=cell(sn[0]);head.position.set(pa[0]+(pb[0]-pa[0])*k,.5,pa[1]+(pb[1]-pa[1])*k);head.rotation.y=Math.atan2(-dir[1],dir[0]);head.scale.setScalar(1+.35*pulse);tg.visible=((clock*6)|0)%2===0;
   var ac=cell(ap);apple.position.set(ac[0],Math.abs(Math.sin(clock*3))*.12,ac[1]);apple.rotation.y=clock*1.5;
   mech.p=cl(got/need,0,1);if(got>=need)return 'win'},
  d:function(g,t){s.render(g);veil(g,W,H,flash*.5);hud(g,'🍎 '+got+'/'+need)}};
  return mech};

 /* ================= MEMÓRIA ================= */
 M.memoria=function(st,easy,W,H){
  var n=st>=5?8:6,EM=['🧮','📐','📏','🧪','🌍','📚','🔭','🎨'].slice(0,n),cols=4,rows=n*2/cols,cw=2,ch=2.6,gp=.4;
  var s=R3.shared(W,H,{bgColor:0x2b1f5c,fogDensity:.008,fov:50,ambientIntensity:.72,dirIntensity:.9});
  s.sun.position.set(-5,20,8);var dist=rows===3?11.2:13.6,pit=56*Math.PI/180;s.camera.position.set(0,Math.sin(pit)*dist,Math.cos(pit)*dist+.4);s.camera.lookAt(0,0,.4);
  var tdep=rows*(ch+gp)+1.8;
  s.scene.add(flat(120,90,0x3b2f7a,0,-.9,0));s.scene.add(box(13.4,.7,tdep+.8,0x8a5a2b,0,-.5,0));s.scene.add(box(12.4,.1,tdep-.2,0x1c7a50,0,-.12,0,false));
  [[-5.8,-1,0xe74c3c],[5.8,1.2,0x3498db],[-5.3,tdep/2-.5,0xf1c40f]].forEach(function(b){var cb=box(.9,.9,.9,b[2],b[0],.35,b[1]);cb.rotation.y=b[0]*.2;s.scene.add(cb)});
  var backT=tex('memB',128,168,function(c,w,h){c.fillStyle='#4a3aa8';c.fillRect(0,0,w,h);c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=2;for(var i=-h;i<w+h;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i+h,h);c.moveTo(i,h);c.lineTo(i+h,0);c.stroke()}c.strokeStyle='#ffd23f';c.lineWidth=6;c.strokeRect(6,6,w-12,h-12);c.fillStyle='rgba(255,255,255,.85)';c.font='bold 64px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('?',w/2,h/2+4)});
  var backM=new T.MeshStandardMaterial({map:backT,roughness:.55});
  function faceM(e){var k='mem'+e;if(_m[k])return _m[k];var t=tex(k,128,168,function(c,w,h){c.fillStyle='#fff';c.fillRect(0,0,w,h);c.strokeStyle='#6a5acd';c.lineWidth=6;c.strokeRect(6,6,w-12,h-12);c.font='78px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(e,w/2,h/2+6)});return(_m[k]=new T.MeshStandardMaterial({map:t,roughness:.5}))}
  var cards=[],bodies=[],fl=[],lock=0,pairs=0,cur=0,clock=0,order=EM.concat(EM).sort(function(){return Math.random()-.5});
  var pgB=geo('mpb',function(){var q=new T.PlaneGeometry(cw*.93,ch*.93);q.rotateX(-Math.PI/2);return q}),pgF=geo('mpf',function(){var q=new T.PlaneGeometry(cw*.93,ch*.93);q.rotateX(Math.PI/2);return q});
  var glowG=geo('mgl',function(){var q=new T.PlaneGeometry(cw+.35,ch+.35);q.rotateX(-Math.PI/2);return q});
  order.forEach(function(e,i){var c=i%cols,r=(i/cols)|0,x=(c-(cols-1)/2)*(cw+gp),z=(r-(rows-1)/2)*(ch+gp)+.3,g=new T.Group();
   var body=mesh(geo('mcb',function(){return new T.BoxGeometry(cw,.12,ch)}),mt(0xf4f0e6),0,0,0);body.userData.i=i;g.add(body);bodies.push(body);
   var back=new T.Mesh(pgB,backM);back.position.y=.062;back.receiveShadow=true;g.add(back);var front=new T.Mesh(pgF,faceM(e));front.position.y=-.062;front.receiveShadow=true;g.add(front);
   g.position.set(x,.07,z);s.scene.add(g);
   var gl=new T.Mesh(glowG,new T.MeshBasicMaterial({color:0x7dffa0,transparent:true,opacity:0,depthWrite:false}));gl.position.set(x,-.05,z);s.scene.add(gl);
   cards.push({e:e,open:0,done:0,f:0,g:g,gl:gl,x:x,z:z,bn:0})});
  var cursor=new T.Mesh(glowG,new T.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.9,depthWrite:false}));cursor.position.y=-.06;s.scene.add(cursor);
  var touch=('ontouchstart' in window),rc=new T.Raycaster(),v2=new T.Vector2();
  function at(px,py){s.camera.updateMatrixWorld();v2.set(px/W*2-1,-(py/H)*2+1);rc.setFromCamera(v2,s.camera);var h=rc.intersectObjects(bodies,false);return h.length?h[0].object.userData.i:-1}
  var mech={txt:'🃏 TOQUE nas cartas (ou ← → ↑ ↓ e ESPAÇO) para virar e achar os pares iguais!',p:0,
  u:function(dt,inp){clock+=dt;
   cards.forEach(function(c){var tg=(c.open||c.done)?1:0;c.f+=cl(tg-c.f,-dt/.22,dt/.22);var e=c.f*c.f*(3-2*c.f);c.g.rotation.x=e*Math.PI;c.g.position.y=.07+Math.sin(e*Math.PI)*1.6;
    if(c.bn>0){c.bn-=dt;c.g.position.y+=Math.abs(Math.sin(c.bn*9))*.5*Math.min(1,c.bn)}
    c.gl.material.opacity=c.done?.55:0});
   var cc=cards[cur];cursor.position.x=cc.x;cursor.position.z=cc.z;cursor.visible=!touch;
   if(lock>0){lock-=dt;if(lock<=0){fl.forEach(function(i){if(!cards[i].done)cards[i].open=0});fl=[]}mech.p=cl(pairs/n,0,1);return}
   if(inp.l)cur=(cur+cards.length-1)%cards.length;if(inp.r)cur=(cur+1)%cards.length;if(inp.up)cur=(cur+cards.length-cols)%cards.length;if(inp.dn)cur=(cur+cols)%cards.length;
   var pick=-1;if(inp.tap&&inp.px!=null)pick=at(inp.px,inp.py);if(inp.act)pick=cur;
   if(pick>=0&&!cards[pick].open&&!cards[pick].done){cards[pick].open=1;fl.push(pick);bp(inp,500,.05);
    if(fl.length===2){var a=cards[fl[0]],b=cards[fl[1]];if(a.e===b.e){a.done=b.done=1;a.bn=b.bn=1;pairs++;fl=[];bp(inp,900,.12)}else{lock=.8;bp(inp,180,.15,'sawtooth')}}}
   mech.p=cl(pairs/n,0,1);if(pairs>=n)return 'win'},
  d:function(g,t){s.render(g);hud(g,'🃏 '+pairs+'/'+n)}};
  return mech};
})(window);
