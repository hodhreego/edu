/* RBX_M3D.skate / pesca / voo — mecânicas 3D reais (Three.js) para o 3DS. */
(function(window){
 var R3=window.RBX3D;if(!R3||!window.THREE||!window.RBX_M3D)return;
 var M=window.RBX_M3D,rnd=function(a,b){return a+Math.random()*(b-a)};
 function box(w,h,d,c,x,y,z){var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),R3.mat(c,.8,.05));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
 /* ---- Skate ---- */
 M.skate=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x9bd6ff,fogDensity:.008,fov:50});
  var goal=2100+st*110,spd=(2100+st*110)/(easy?38:30),dist=0,hit=0,vy=0,y=0,got=0,tm=0;
  var road=box(300,.2,7,0x3b4658,0,-.1,0);s.scene.add(road);
  var curb=box(300,.3,.4,0xdfe6e9,0,0,-3.7);s.scene.add(curb);
  var cols=[0xe17055,0x74b9ff,0xfdcb6e,0x55efc4,0xa29bfe,0xff7675],bl=[];
  for(var i=0;i<14;i++){var h=rnd(5,13),b=box(rnd(3,6),h,rnd(3,5),cols[i%6],i*7-10,h/2,-9-rnd(0,6));s.scene.add(b);bl.push(b)}
  var ds=[];for(var i=0;i<12;i++){var d=box(1.2,.05,.25,0xffffff,i*4-20,.02,0);s.scene.add(d);ds.push(d)}
  var kid=R3.kid(0xe74c3c);kid.rotation.y=Math.PI/2;kid.scale.setScalar(.8);var pl=new THREE.Group();pl.add(kid);kid.position.y=.35;
  var bd=box(1.6,.12,.5,0x2d3436,0,.2,0);pl.add(bd);[-.55,.55].forEach(function(x){[-.18,.18].forEach(function(z){var w=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,8),R3.mat(0xffeaa7));w.rotation.x=Math.PI/2;w.position.set(x,.1,z);pl.add(w)})});
  pl.position.set(0,0,0);s.scene.add(pl);
  s.camera.position.set(-1.5,3,8.5);s.camera.lookAt(2.5,1.4,0);
  var obs=[],gap=0;function mk(x){var c=Math.random()<.55?R3.crate():R3.cone();c.position.set(x,0,0);s.scene.add(c);return {m:c,a:true,crate:c.userData&&0}}
  for(var i=0;i<5;i++)obs.push(mk(16+i*22));
  var coins=[];for(var i=0;i<8;i++){var c=R3.coin();c.position.set(10+i*2,1.6,0);s.scene.add(c);coins.push({m:c,a:true})}
  var flag=new THREE.Group();flag.add(box(.15,4,.15,0xffffff,0,2,0));flag.add(box(1.6,1,.1,0xe74c3c,.8,3.4,0));flag.position.set(200,0,-3);s.scene.add(flag);
  var mech={txt:'🛹 Toque para pular os obstáculos e chegar ao fim da rua!',p:0,
  u:function(dt,inp){tm+=dt;if(hit>0)hit-=dt;
   var sp=spd*(hit>0?.55:1);dist+=sp*dt;
   if((inp.tap||inp.act||inp.up)&&y<=.01){vy=8.2;inp.beep&&inp.beep(520,.06)}
   vy-=22*dt;y+=vy*dt;if(y<0){y=0;vy=0}pl.position.y=y;pl.rotation.z=vy*.02;pl.visible=hit>0?(Math.floor(tm*14)%2===0):true;
   var k=sp/ (goal/ (easy?38:30))*12;var mv=k*dt;
   bl.forEach(function(b){b.position.x-=mv*.35;if(b.position.x<-30)b.position.x+=100});
   ds.forEach(function(d){d.position.x-=mv;if(d.position.x<-22)d.position.x+=48});
   obs.forEach(function(o){o.m.position.x-=mv;if(o.m.position.x<-12){o.m.position.x+=110+rnd(0,8);o.a=true;o.m.visible=true}
    if(o.a&&Math.abs(o.m.position.x)<.7&&y<.8){o.a=false;o.m.visible=false;hit=1.1;dist=Math.max(0,dist-100);inp.beep&&inp.beep(130,.25,'sawtooth')}});
   coins.forEach(function(c,i){c.m.position.x-=mv;c.m.rotation.y+=dt*4;c.m.position.y=1.4+Math.sin((c.m.position.x)*.5)*.9;if(c.m.position.x<-12){c.m.position.x+=40;c.a=true;c.m.visible=true}
    if(c.a&&Math.abs(c.m.position.x)<.8&&Math.abs(c.m.position.y-(y+.9))<1){c.a=false;c.m.visible=false;inp.beep&&inp.beep(900,.07)}});
   var left=goal-dist;flag.position.x=left<260?left*.18:200;
   this.p=Math.max(0,Math.min(1,dist/goal));if(dist>=goal)return 'win'},
  d:function(g,t){s.render(g)}};return mech};
 /* ---- Pesca ---- */
 M.pesca=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0x8fd3f4,fogDensity:.004,fov:48});
  s.camera.position.set(0,1.2,15);s.camera.lookAt(0,-1.8,0);
  var water=new THREE.Mesh(new THREE.BoxGeometry(40,7,10),new THREE.MeshStandardMaterial({color:0x1e90ff,transparent:true,opacity:.55,roughness:.3}));water.position.set(0,-3.5,0);s.scene.add(water);
  var floor=box(40,.4,10,0xe8d3a8,0,-7.2,0);s.scene.add(floor);
  var sun=new THREE.Mesh(new THREE.SphereGeometry(1.6,12,10),new THREE.MeshBasicMaterial({color:0xffeaa7}));sun.position.set(-9,5,-8);s.scene.add(sun);
  var boat=new THREE.Group();boat.add(box(3,.7,1.4,0xb5651d,0,.1,0));boat.add(box(.12,2.2,.12,0xdfe6e9,-.4,1.4,0));boat.add(box(1.2,1.2,.05,0xffffff,.2,1.6,0));
  var fm=R3.kid(0xf39c12);fm.scale.setScalar(.7);fm.position.set(.8,.5,0);boat.add(fm);boat.position.set(0,.2,0);s.scene.add(boat);
  var line=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1,4),new THREE.MeshBasicMaterial({color:0xffffff}));s.scene.add(line);
  var hook=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),R3.mat(0xd63031));s.scene.add(hook);
  var bx=0,hy=0,state=0,caught=0,need=9,tm=0,hx=0,bub=[],fh=[],tgt=null,flash=0,pen=0;
  var cols=[0xff7675,0xfdcb6e,0x55efc4,0xa29bfe,0xfab1a0];
  function mkf(i){var f=R3.fish();f.scale.setScalar(rnd(.8,1.3));var o={m:f,boot:false,v:rnd(1.2,2.6)*(Math.random()<.5?-1:1)*(1+st*.04),y:-1.6-rnd(0,4.2),a:true};f.position.set(rnd(-9,9),o.y,0);f.rotation.y=o.v>0?0:Math.PI;s.scene.add(f);return o}
  for(var i=0;i<6;i++)fh.push(mkf(i));
  for(var i=0;i<2;i++){var b=box(.9,.5,.5,0x6d4c2b,0,0,0);b.add(box(.45,.9,.5,0x6d4c2b,-.2,.5,0));var o={m:b,boot:true,v:rnd(1,1.8)*(i?1:-1),y:-2.5-i*2.2,a:true};b.position.set(rnd(-8,8),o.y,0);s.scene.add(b);fh.push(o)}
  for(var i=0;i<10;i++){var bu=new THREE.Mesh(new THREE.SphereGeometry(.12,6,5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}));bu.position.set(rnd(-10,10),rnd(-7,0),1);s.scene.add(bu);bub.push(bu)}
  var mech={txt:'🎣 Arraste o barco e toque para lançar o anzol. Pegue 9 peixes (evite as botas)!',p:0,
  u:function(dt,inp){tm+=dt;flash-=dt;
   if(inp.dx)bx+=inp.dx*8*dt;if(inp.l)bx-=1.4;if(inp.r)bx+=1.4;
   if(inp.down&&inp.px!=null&&state===0)bx+=((inp.px/W*2-1)*10-bx)*Math.min(1,dt*8);
   bx=Math.max(-9,Math.min(9,bx));boat.position.x=bx;boat.position.y=.2+Math.sin(tm*2)*.12;boat.rotation.z=Math.sin(tm*1.6)*.05;
   if(state===0){hx=bx+1.2;hy=0;if(inp.act||inp.dn||(inp.tap&&inp.px!=null&&!inp.down)){state=1;tgt=null;inp.beep&&inp.beep(400,.05)}}
   else if(state===1){hy-=7*dt;if(hy<-6.6)state=2}
   else{hy+=(tgt?6.5:9)*dt;if(hy>=0){hy=0;state=0;if(tgt){if(tgt.boot){caught=Math.max(0,caught-1);inp.beep&&inp.beep(140,.25,'sawtooth')}else{caught++;inp.beep&&inp.beep(900,.12)}tgt.m.visible=false;tgt.a=false;setTimeout(function(){},0);var o=tgt;o.m.position.x=(o.v>0?-11:11);o.m.visible=true;o.a=true;tgt=null}}}
   hook.position.set(hx+(state?Math.sin(tm*3)*.05:0),hy+.2,0);var top=.9;line.position.set(hx,(top+hy)/2+.1,0);line.scale.y=Math.max(.01,top-hy);
   fh.forEach(function(o){if(!o.a)return;if(o.m===(tgt&&tgt.m)){o.m.position.set(hx,hy-.2,0);return}
    o.m.position.x+=o.v*dt;o.m.position.y=o.y+Math.sin(tm*2+o.y)*.18;if(o.m.position.x>11)o.m.position.x=-11;if(o.m.position.x<-11)o.m.position.x=11;
    if(!o.boot)o.m.rotation.y=o.v>0?0:Math.PI;
    if(state===1&&!tgt&&Math.abs(o.m.position.x-hx)<.8&&Math.abs(o.m.position.y-hy)<.7){tgt=o;state=2}});
   bub.forEach(function(b){b.position.y+=dt*1.2;if(b.position.y>0){b.position.y=-7;b.position.x=rnd(-10,10)}});
   this.p=Math.min(1,caught/need);if(caught>=need)return 'win'},
  d:function(g,t){s.render(g)}};return mech};
 /* ---- Voo ---- */
 M.voo=function(st,easy,W,H){
  var s=R3.shared(W,H,{bgColor:0xff9a62,fogDensity:.012,fov:60});
  var dx=0,dy=0,tx=0,ty=0,got=0,need=11,tm=0,hit=0,sp=14+st*.6,sc=1;if(easy)sp*=.85;
  var sky=new THREE.Mesh(new THREE.SphereGeometry(80,12,8),new THREE.MeshBasicMaterial({color:0xffb26b,side:THREE.BackSide}));s.scene.add(sky);
  var sun=new THREE.Mesh(new THREE.SphereGeometry(7,14,10),new THREE.MeshBasicMaterial({color:0xfff3b0}));sun.position.set(-20,10,-70);s.scene.add(sun);
  var isl=[];for(var i=0;i<8;i++){var g=new THREE.Group();g.add(box(rnd(4,8),1.4,rnd(4,8),0x6ab04c,0,0,0));var c=new THREE.Mesh(new THREE.ConeGeometry(2,2.6,5),R3.mat(0x8d6e63));c.rotation.x=Math.PI;c.position.y=-1.8;g.add(c);var t=R3.tree();t.position.y=.7;g.add(t);g.position.set(rnd(-26,26),rnd(-8,9),-20-i*8);if(Math.abs(g.position.x)<8)g.position.x+=g.position.x<0?-9:9;s.scene.add(g);isl.push(g)}
  var dr=new THREE.Group(),bm=R3.mat(0x8e44ad,.5,.1);
  var body=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,1.8,10),bm);body.rotation.x=Math.PI/2;body.castShadow=true;dr.add(body);
  var head=new THREE.Mesh(new THREE.SphereGeometry(.4,10,8),R3.mat(0xa569bd));head.position.set(0,.15,-1.2);dr.add(head);
  [-.15,.15].forEach(function(x){var e=new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),R3.mat(0xffffff));e.position.set(x,.3,-1.5);dr.add(e)});
  var tail=new THREE.Mesh(new THREE.ConeGeometry(.3,1.6,6),bm);tail.rotation.x=-Math.PI/2;tail.position.set(0,0,1.7);dr.add(tail);
  var wm=new THREE.MeshStandardMaterial({color:0xf39c12,side:THREE.DoubleSide,flatShading:true}),wl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),wm),wr=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.2),wm);
  var wL=new THREE.Group(),wR=new THREE.Group();wl.position.x=-1.2;wr.position.x=1.2;wL.add(wl);wR.add(wr);wl.rotation.x=wr.rotation.x=-Math.PI/2;dr.add(wL);dr.add(wR);s.scene.add(dr);
  var items=[];function spawn(it,z){var storm=Math.random()<.25;if(it.m)s.scene.remove(it.m);var m=storm?new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),R3.mat(0x636e72,.9,0)):new THREE.Mesh(new THREE.TorusGeometry(1.1,.17,8,18),R3.mat(0xf1c40f,.25,.8));
   it.m=m;it.storm=storm;it.a=true;m.position.set(rnd(-4,4),rnd(-2.2,2.2),z);s.scene.add(m)}
  for(var i=0;i<6;i++){var it={};spawn(it,-25-i*18);items.push(it)}
  s.camera.position.set(0,2.6,7);
  var mech={txt:'🐉 Arraste para guiar o dragão e atravesse 11 anéis dourados. Fuja das nuvens escuras!',p:0,
  u:function(dt,inp){tm+=dt;if(hit>0)hit-=dt;
   if(inp.down&&inp.px!=null){tx=(inp.px/W*2-1)*4.4;ty=-(inp.py/H*2-1)*2.6}
   if(inp.l)tx-=1.4;if(inp.r)tx+=1.4;if(inp.up)ty+=1.2;if(inp.dn)ty-=1.2;if(inp.dx)tx+=inp.dx*5*dt;
   tx=Math.max(-4.4,Math.min(4.4,tx));ty=Math.max(-2.6,Math.min(2.6,ty));
   dx+=(tx-dx)*Math.min(1,dt*5);dy+=(ty-dy)*Math.min(1,dt*5);dr.position.set(dx,dy,0);dr.rotation.z=-(tx-dx)*.15;dr.rotation.x=(ty-dy)*.1;
   var fl=Math.sin(tm*9)*.55;wL.rotation.z=fl;wR.rotation.z=-fl;dr.visible=hit>0?(Math.floor(tm*14)%2===0):true;
   s.camera.position.set(dx*.5,dy*.5+2.6,7);s.camera.lookAt(dx*.4,dy*.4,-6);
   isl.forEach(function(g){g.position.z+=sp*.5*dt;g.position.y+=Math.sin(tm+g.position.x)*.004;if(g.position.z>10){g.position.z=-80;g.position.x=rnd(-26,26);if(Math.abs(g.position.x)<8)g.position.x+=g.position.x<0?-9:9}});
   items.forEach(function(it){var m=it.m,pz=m.position.z;m.position.z+=sp*dt;if(!it.storm)m.rotation.y+=dt*2;else m.rotation.y+=dt;
    if(it.a&&pz<0&&m.position.z>=0){var d=Math.hypot(m.position.x-dx,m.position.y-dy);
     if(it.storm){if(d<1.5){it.a=false;m.visible=false;hit=1;got=Math.max(0,got-2);inp.beep&&inp.beep(130,.3,'sawtooth')}}
     else{it.a=false;if(d<1.5){got++;m.visible=false;inp.beep&&inp.beep(800+got*40,.12)}else if(!easy){}}}
    if(m.position.z>10)spawn(it,-100-rnd(0,10))});
   this.p=Math.min(1,got/need);if(got>=need)return 'win'},
  d:function(g,t){s.render(g)}};return mech};
})(window);
