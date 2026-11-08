/* RBX_M3D.ritmo / defesa — mecânicas 3D reais (Three.js r128) para o 3DS. */
if(!window.RBX_M3D)window.RBX_M3D={};
(function(window){
 var R3=window.RBX3D;if(!R3||!window.THREE)return;
 var M=window.RBX_M3D,rnd=function(a,b){return a+Math.random()*(b-a)};
 function box(w,h,d,c,x,y,z){var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),R3.mat(c,.8,.05));m.position.set(x,y,z);return m}
 /* ---- Ritmo: pista 3D com 3 faixas ---- */
 M.ritmo=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x1b1040,fogDensity:.018,fov:60});
  var LX=[-2.4,0,2.4],cols=[0xe74c3c,0xf1c40f,0x3498db],HZ=0,got=0,need=16,tm=.6,sp=(95+st*5)/9,bad=0,flash=[0,0,0],notes=[],tt=0;
  var tr=box(8.4,.2,120,0x2a1a5e,0,-.1,-45);s.scene.add(tr);
  var lanes=[],pads=[],rings=[];
  for(var l=0;l<3;l++){var ln=box(2.2,.05,120,0x4b2a8a,LX[l],.02,-45);s.scene.add(ln);lanes.push(ln);
   var pd=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.25,20),new THREE.MeshStandardMaterial({color:cols[l],emissive:cols[l],emissiveIntensity:.15}));pd.position.set(LX[l],.15,HZ);s.scene.add(pd);pads.push(pd)}
  var hl=box(8,.08,.3,0xffffff,0,.08,HZ);s.scene.add(hl);
  for(var i=0;i<16;i++){var side=i%2?1:-1,t=R3.tree();t.position.set(side*rnd(6,10),0,-i*7);s.scene.add(t);rings.push(t)}
  s.camera.position.set(0,4.2,7);s.camera.lookAt(0,0,-9);
  function press(l,inp){flash[l]=.15;var best=null;notes.forEach(function(n){if(n.l===l&&!n.h&&Math.abs(n.m.position.z-HZ)<2.4&&(!best||Math.abs(n.m.position.z-HZ)<Math.abs(best.m.position.z-HZ)))best=n});
   if(best){best.h=1;best.m.visible=false;got++;inp.beep&&inp.beep(500+l*180,.09)}else{bad=.25;inp.beep&&inp.beep(140,.12,'sawtooth')}}
  function mk(){var l=(Math.random()*3)|0;var g=new THREE.Group();var c=new THREE.Mesh(new THREE.SphereGeometry(.7,14,10),new THREE.MeshStandardMaterial({color:cols[l],emissive:cols[l],emissiveIntensity:.35}));c.position.y=.7;g.add(c);g.position.set(LX[l],0,-50);s.scene.add(g);notes.push({m:g,l:l})}
  return {txt:'🎵 TOQUE na coluna (ou ← ↓ →) quando a nota chegar à linha! Acerte 16 notas.',p:0,
   u:function(dt,inp){tt+=dt;tm-=dt;if(tm<=0){mk();tm=rnd(.55,.95)}
    if(inp.tap&&inp.px!=null){press(inp.px<W/3?0:inp.px<W*2/3?1:2,inp)}
    if(inp.l)press(0,inp);if(inp.dn)press(1,inp);if(inp.r)press(2,inp);
    notes.forEach(function(n){var m=n.m;m.position.z+=sp*dt;m.rotation.y+=dt*3;
     if(!n.h&&!n.x&&m.position.z>HZ+2.6){n.x=1;got=Math.max(0,got-1);bad=.3}});
    notes=notes.filter(function(n){if(n.h||n.m.position.z>14){s.scene.remove(n.m);return false}return true});
    for(var f=0;f<3;f++){flash[f]-=dt;pads[f].material.emissiveIntensity=flash[f]>0?1:.15;pads[f].scale.setScalar(flash[f]>0?1.2:1)}
    bad-=dt;s.scene.background.setHex(bad>0?0x4a1030:0x1b1040);
    rings.forEach(function(t){t.position.z+=sp*dt;if(t.position.z>10)t.position.z-=112});
    s.camera.position.x=Math.sin(tt*.8)*.3;s.camera.lookAt(0,0,-9);
    this.p=Math.min(1,got/need);if(got>=need)return 'win'},
   d:function(g,t){s.render(g)}}};
 /* ---- Defesa: torre 3D e monstros ---- */
 M.defesa=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x9ad4ff,fogDensity:.01,fov:50});
  var kills=0,need=15,vidas=3,en=[],tm=.8,fx=[],flash=0,sp=(26+st*2.5)/9,tt=0,v=new THREE.Vector3();
  var gr=box(60,.4,24,0x6fb35f,0,-.2,0);s.scene.add(gr);
  for(var i=0;i<5;i++){var st2=box(60,.02,.15,0x5aa04a,0,.02,-8+i*4);s.scene.add(st2)}
  var tower=new THREE.Group();tower.add(box(3,5,3,0x95a5a6,0,2.5,0));tower.add(box(3.6,.7,3.6,0x7f8c8d,0,5.3,0));
  for(var i=0;i<4;i++)tower.add(box(.7,.8,.7,0x7f8c8d,(i%2?1:-1)*1.3,6,(i<2?1:-1)*1.3));
  var fl=box(.1,1.6,.1,0xffffff,0,6.8,0);tower.add(fl);tower.add(box(1,.6,.05,0xe74c3c,.55,7.3,0));
  tower.position.set(-9,0,0);s.scene.add(tower);
  for(var i=0;i<6;i++){var t=R3.tree();t.position.set(rnd(-4,16),0,i%2?-10:10);s.scene.add(t)}
  s.camera.position.set(2,11,15);s.camera.lookAt(2,0,0);s.camera.updateMatrixWorld();
  var types=[function(){return R3.ghost()},function(){return R3.kid(0x8e44ad)},function(){return R3.rock()},function(){return R3.ghost()},function(){return R3.kid(0xc0392b)}];
  var hearts=[];for(var h=0;h<3;h++){hearts.push(h)}
  function spawn(){var g=types[(Math.random()*5)|0]();g.scale.setScalar(1.3);g.position.set(18,0,rnd(-7,7));s.scene.add(g);en.push({m:g,w:rnd(0,6)})}
  function reset(){kills=0;vidas=3;en.forEach(function(e){s.scene.remove(e.m)});en=[]}
  function scr(m,y){v.set(m.position.x,y,m.position.z).project(s.camera);return [(v.x*.5+.5)*W,(-v.y*.5+.5)*H]}
  return {txt:'🏰 TOQUE nos monstros para derrotá-los antes que cheguem à torre! Derrote 15 (3 vidas).',p:0,
   u:function(dt,inp){tt+=dt;tm-=dt;if(tm<=0){spawn();tm=rnd(.7,1.2)/(easy?.9:1)}
    s.camera.updateMatrixWorld();
    if(inp.tap&&inp.px!=null){var b=null,bd=W*.11;en.forEach(function(e){var p=scr(e.m,1.2),d=Math.hypot(p[0]-inp.px,p[1]-inp.py);if(d<bd){bd=d;b=e}});
     if(b){b.dead=1;kills++;var bm=new THREE.Mesh(new THREE.SphereGeometry(.8,10,8),new THREE.MeshBasicMaterial({color:0xffdd33,transparent:true,opacity:.9}));bm.position.set(b.m.position.x,1.2,b.m.position.z);s.scene.add(bm);fx.push({m:bm,t:.3});inp.beep&&inp.beep(700,.08)}else inp.beep&&inp.beep(200,.05)}
    en.forEach(function(e){var m=e.m;m.position.x-=sp*dt;m.position.y=Math.abs(Math.sin(tt*6+e.w))*.4;m.rotation.y=Math.PI/2;
     if(m.position.x<-7.2&&!e.dead){e.dead=1;vidas--;flash=.5;inp.beep&&inp.beep(120,.25,'sawtooth')}});
    en=en.filter(function(e){if(e.dead){s.scene.remove(e.m);return false}return true});
    fx.forEach(function(f){f.t-=dt;f.m.scale.setScalar(1+(.3-f.t)*5);f.m.material.opacity=Math.max(0,f.t/.3)});
    fx=fx.filter(function(f){if(f.t<=0){s.scene.remove(f.m);return false}return true});
    flash-=dt;tower.rotation.z=flash>0?Math.sin(tt*60)*.04:0;s.scene.background.setHex(flash>0?0xffb0a0:0x9ad4ff);
    if(vidas<=0)reset();this.p=Math.min(1,kills/need);if(kills>=need)return 'win'},
   d:function(g,t){s.render(g);g.font='bold 14px system-ui';g.fillStyle='#fff';g.fillText('❤️'.repeat(Math.max(0,vidas)),W-60,22)}}};
})(window);
