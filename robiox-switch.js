/* RobIox — 2 minijogos estilo Nintendo Switch: gráficos em pseudo-3D de verdade (estrada em perspectiva e ilha isométrica com blocos).
   Mesmo executor do robiox-ds.js: a pergunta aparece desde o início, mas só é respondível DEPOIS de concluir a fase. */
(function(){
 var K=window.RBX_DSKIT;if(!K)return;
 window.RBX_JOGOS=window.RBX_JOGOS||{};
 var rr=K.rr,circ=K.circ,grad=K.grad,em=K.em,shadow=K.shadow,rnd=K.rnd;
 function bar(g,W,p){rr(g,8,8,W-16,6,3,'rgba(0,0,0,.45)');rr(g,9,9,Math.max(2,(W-18)*Math.min(1,p)),4,2,'#ffd23f')}
 var M={};
 /* ===== Corrida 3D: estrada em perspectiva com curvas ===== */
 M.estrada=function(st,easy,W,H){var hy=Math.floor(H*.38),s=0,px=0,goal=1500+st*90,sp=62+st*3,ob=[],tm=.4,flash=0,boost=0,slow=0,gotS=0,F=H-hy;
  function curv(a){return Math.sin(a/240)*1.0+Math.sin(a/97)*.35}
  function rh(k){return 150*k+6}
  function cxk(k,cv,pxx){return W/2+cv*(1-k)*(1-k)*130-pxx*rh(k)}
  return {txt:'🏎️ ARRASTE (ou ← →, ou incline) para guiar o carro na estrada. Desvie dos cones, pegue estrelas ⭐!',
   u:function(dt,inp){if(inp.px!=null&&inp.down){var tg=(inp.px-W/2)/(W/2)*1.05;px+=(tg-px)*Math.min(1,dt*7)}px+=inp.dx*1.7*dt;if(inp.l)px-=.38;if(inp.r)px+=.38;px+=curv(s)*.35*dt*(1+st*.03);px=Math.max(-.95,Math.min(.95,px));
    var v=sp*(slow>0?.5:1)*(boost>0?1.6:1);s+=v*dt;slow-=dt;boost-=dt;flash-=dt;tm-=dt;
    if(tm<=0&&s<goal-130){ob.push({s:s+170,x:rnd(-.85,.85),star:Math.random()<.2});tm=rnd(.38,.8)/(easy?.9:1)}
    ob.forEach(function(o){var dz=o.s-s;if(!o.h&&dz<3&&dz>-3&&Math.abs(o.x-px)<.27){o.h=1;if(o.star){boost=1.4;inp.beep(1000,.1)}else{slow=1;flash=.6;inp.beep(130,.25,'sawtooth')}}});
    ob=ob.filter(function(o){return o.s-s>-6&&!o.h});this.p=s/goal;if(s>=goal)return 'win'},
   d:function(g,t){var cv0=curv(s);grad(g,'#4aa8ff','#cfeeff',0,hy+4);g.fillRect(0,0,W,hy+4);
    g.fillStyle='#8fb4d8';g.beginPath();g.moveTo(0,hy);for(var x=0;x<=W;x+=10)g.lineTo(x,hy-12-Math.sin(x*.04+cv0*2)*8-Math.sin(x*.11)*3);g.lineTo(W,hy);g.fill();
    g.fillStyle='#6d9bc9';g.beginPath();g.moveTo(0,hy);for(x=0;x<=W;x+=10)g.lineTo(x,hy-5-Math.sin(x*.07+cv0*4+2)*5);g.lineTo(W,hy);g.fill();
    for(var y=hy;y<H;y+=2){var k=(y-hy)/F;if(k<.004)continue;var dz=25*(1/Math.max(.02,k)-1),band=Math.floor((s+dz)/7)%2,c=cxk(k,cv0,px),r=rh(k);
     g.fillStyle=band?'#3f9e4b':'#46ad55';g.fillRect(0,y,W,2);g.fillStyle=band?'#d33':'#fff';g.fillRect(c-r*1.18,y,r*.18,2);g.fillRect(c+r,y,r*.18,2);g.fillStyle=band?'#5d5d6c':'#666677';g.fillRect(c-r,y,r*2,2);
     if(Math.floor((s+dz)/14)%2===0){g.fillStyle='rgba(255,255,255,.85)';g.fillRect(c-r*.02,y,r*.04+1,2)}}
    var list=ob.slice().sort(function(a,b){return b.s-a.s});list.forEach(function(o){var dz=o.s-s;if(dz<0.5)dz=.5;var k=1/(1+dz/25),y2=hy+F*k,c=cxk(k,cv0,px),ox=c+o.x*rh(k),sc=k*1.35+.08;
     if(o.star){em(g,'⭐',ox,y2-12*sc,26*sc)}else{shadow(g,ox+3*sc,y2,12*sc);g.fillStyle='#ff7a00';g.beginPath();g.moveTo(ox-10*sc,y2);g.lineTo(ox,y2-26*sc);g.lineTo(ox+10*sc,y2);g.fill();g.fillStyle='#fff';g.fillRect(ox-6*sc,y2-12*sc,12*sc,4*sc)}});
    var kx=W/2-21+(px*0);g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;K.kart(g,kx,H-46,'#e74c3c',t,true);g.globalAlpha=1;
    if(boost>0){g.fillStyle='rgba(255,220,80,.7)';for(var q=0;q<5;q++)g.fillRect(W/2-6+(Math.random()-.5)*10,H-18+q*3,6,3)}
    if(flash>0){g.fillStyle='rgba(255,60,0,.22)';g.fillRect(0,0,W,H)}bar(g,W,s/goal)}}};
 /* ===== Ilha isométrica: blocos 3D, joias e slimes ===== */
 M.ilha=function(st,easy,W,H){var N=8,tw=20,th=10,y0=22,hgt=7,gx=3.5,gy=3.5,tx=3.5,ty=3.5,gems=[],sl=[],got=0,need=12,flash=0,sp=3.1,hs=.85+st*.06,fx=[];
  function sx(a,b){return W/2+(a-b)*tw}function sy(a,b){return y0+(a+b)*th}
  function inv(x,y){var u=(x-W/2)/tw,v=(y-y0)/th;return [(u+v)/2,(v-u)/2]}
  function gem(){gems.push({x:rnd(.6,N-.6),y:rnd(.6,N-.6),p:rnd(0,6)})}
  for(var i=0;i<4;i++)gem();for(i=0;i<2+Math.min(3,Math.floor(st/3));i++)sl.push({x:rnd(0,N),y:rnd(0,N),v:rnd(.7,1.1)});
  function cl(v){return Math.max(.3,Math.min(N-.3,v))}
  function tile(g,a,b,top,l,r){var X=sx(a,b),Y=sy(a,b);g.fillStyle=top;g.beginPath();g.moveTo(X,Y);g.lineTo(X+tw,Y+th);g.lineTo(X,Y+2*th);g.lineTo(X-tw,Y+th);g.fill();g.fillStyle=l;g.beginPath();g.moveTo(X-tw,Y+th);g.lineTo(X,Y+2*th);g.lineTo(X,Y+2*th+hgt);g.lineTo(X-tw,Y+th+hgt);g.fill();g.fillStyle=r;g.beginPath();g.moveTo(X+tw,Y+th);g.lineTo(X,Y+2*th);g.lineTo(X,Y+2*th+hgt);g.lineTo(X+tw,Y+th+hgt);g.fill()}
  return {txt:'💎 TOQUE onde quer ir (ou use ← → ↑ ↓) para coletar 12 joias. Fuja dos slimes verdes!',
   u:function(dt,inp){if(inp.tap&&inp.px!=null){var q=inv(inp.px,inp.py-6);tx=cl(q[0]);ty=cl(q[1])}if(inp.down&&inp.px!=null){q=inv(inp.px,inp.py-6);tx=cl(q[0]);ty=cl(q[1])}
    tx=cl(tx+inp.dx*sp*dt*.7);ty=cl(ty-inp.dx*sp*dt*.7);if(inp.l){tx=cl(tx-1.1);ty=cl(ty+1.1)}if(inp.r){tx=cl(tx+1.1);ty=cl(ty-1.1)}if(inp.up){tx=cl(tx-1.1);ty=cl(ty-1.1)}if(inp.dn){tx=cl(tx+1.1);ty=cl(ty+1.1)}
    var dx=tx-gx,dy=ty-gy,d=Math.hypot(dx,dy);if(d>.05){var m=Math.min(d,sp*dt);gx+=dx/d*m;gy+=dy/d*m}
    gems.forEach(function(e){if(!e.g&&Math.hypot(e.x-gx,e.y-gy)<.6){e.g=1;got++;fx.push({x:e.x,y:e.y,t:.3});inp.beep(900,.1)}});gems=gems.filter(function(e){return !e.g});while(gems.length<4)gem();
    sl.forEach(function(s2){var ex=gx-s2.x,ey=gy-s2.y,dd=Math.hypot(ex,ey)||1;s2.x+=ex/dd*hs*s2.v*dt*(easy?.8:1);s2.y+=ey/dd*hs*s2.v*dt*(easy?.8:1);if(dd<.55&&flash<=0){got=Math.max(0,got-2);flash=.7;inp.beep(120,.3,'sawtooth');s2.x=rnd(0,N);s2.y=rnd(0,N)}});
    flash-=dt;fx.forEach(function(f){f.t-=dt});fx=fx.filter(function(f){return f.t>0});this.p=got/need;if(got>=need)return 'win'},
   d:function(g,t){grad(g,'#6ec6ff','#d8f4ff',0,H);g.fillRect(0,0,W,H);
    for(var a=0;a<N;a++)for(var b=0;b<N;b++)tile(g,a,b,(a+b)%2?'#6fd16f':'#5cc25c','#3d8f3d','#2f7a2f');
    var E=[];E.push({k:gx+gy,f:function(){var X=sx(gx,gy),Y=sy(gx,gy)+th;shadow(g,X,Y+1,9);g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;em(g,'🧙',X,Y-10-Math.abs(Math.sin(t*8))*(Math.hypot(tx-gx,ty-gy)>.1?3:0),26);g.globalAlpha=1}});
    gems.forEach(function(e){E.push({k:e.x+e.y,f:function(){var X=sx(e.x,e.y),Y=sy(e.x,e.y)+th;shadow(g,X,Y+1,7);em(g,'💎',X,Y-10+Math.sin(t*4+e.p)*2,20)}})});
    sl.forEach(function(s2){E.push({k:s2.x+s2.y,f:function(){var X=sx(s2.x,s2.y),Y=sy(s2.x,s2.y)+th;shadow(g,X,Y+1,9);em(g,'🟢',X,Y-7+Math.sin(t*6)*2,22)}})});
    E.sort(function(p,q){return p.k-q.k}).forEach(function(e){e.f()});fx.forEach(function(f){em(g,'✨',sx(f.x,f.y),sy(f.x,f.y),22)});
    if(flash>0){g.fillStyle='rgba(255,60,0,.22)';g.fillRect(0,0,W,H)}bar(g,W,got/need);g.font='bold 14px system-ui';g.fillStyle='#134';g.fillText('💎 '+got+'/'+need,10,32)}}};
 if(window.RBX_M3D){M.estrada=window.RBX_M3D.estrada;M.ilha=window.RBX_M3D.ilha;if(window.RBX_M3D.xadrez)M.xadrez=window.RBX_M3D.xadrez}
 var D=[['sw-estrada','Estrada Turbo 3D','🏎️','Guie o carro numa estrada em 3D e responda para a próxima pista','estrada','#e74c3c','#ffe0dc'],
  ['sw-ilha','Ilha dos Cristais 3D','💎','Explore a ilha em blocos 3D, colete joias e responda','ilha','#16a085','#d9f7f0']];
 if(M.xadrez)D.push(['sw-xadrez','Xadrez 3D','♟️','Dê xeque-mate em 1 lance no tabuleiro 3D e responda','xadrez','#34495e','#e6ebf5']);
 D.forEach(function(d){window.RBX_JOGOS[d[0]]={nome:d[1]+' '+d[2],icone:d[2],desc:d[3],console:'switch',start:function(api){K.run(d,api,{W:480,H:270,con:'switch',conn:'Nintendo Switch',mech:M,one:1,maxw:620})}}});
})();
