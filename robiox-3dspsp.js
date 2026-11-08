/* RobIox — 5 minijogos estilo Nintendo 3DS (profundidade em camadas/paralaxe) e 5 estilo PSP (tela larga).
   Usam o mesmo executor do robiox-ds.js: a pergunta aparece desde o início, mas só pode ser respondida DEPOIS de concluir a fase.
   Fases longas (~20-40 s). Errar a pergunta recomeça só a fase atual. */
(function(){
 var K=window.RBX_DSKIT;if(!K)return;
 window.RBX_JOGOS=window.RBX_JOGOS||{};
 var rr=K.rr,circ=K.circ,grad=K.grad,em=K.em,shadow=K.shadow,cloud=K.cloud,rnd=K.rnd,person=K.person;
 function hit(a,b,r){return Math.abs(a-b)<r}
 /* 3D falso: sombra projetada + camadas com deslocamento (paralaxe) */
 function layer(g,t,W,y,h,col,sp,amp,per,off){g.fillStyle=col;g.beginPath();g.moveTo(0,y+h);for(var x=0;x<=W;x+=8)g.lineTo(x,y+Math.sin((x+off*sp)*per)*amp);g.lineTo(W,y+h);g.fill()}
 function bar(g,W,p){rr(g,8,8,W-16,6,3,'rgba(0,0,0,.45)');rr(g,9,9,Math.max(2,(W-18)*Math.min(1,p)),4,2,'#ffd23f')}
 function flashFx(g,W,H,f){if(f>0){g.fillStyle='rgba(255,60,0,.25)';g.fillRect(0,0,W,H)}}
 var M={};
 /* ===== 3DS ===== */
 M.skate=function(st,easy,W,H){var gy=H-38,y=0,vy=0,dist=0,goal=2100+st*110,sp=125+st*5,ob=[],tm=1,flash=0,coins=[],ct=.6;
  return {txt:'🛹 TOQUE na tela (ou ↑ / ESPAÇO) para PULAR os obstáculos até a linha de chegada!',
   u:function(dt,inp){var ground=y<=0;if((inp.tap||inp.act||inp.up)&&ground){vy=235;inp.beep(620,.08)}vy-=620*dt;y+=vy*dt;if(y<0){y=0;vy=0}
    var v=sp*(flash>0?.5:1);dist+=v*dt;flash-=dt;tm-=dt;ct-=dt;if(tm<=0&&dist<goal-160){ob.push({x:W+10,w:rnd(16,24),h:rnd(20,34)});tm=rnd(1,1.7)*(easy?1.15:1)}
    if(ct<=0){coins.push({x:W+10,y:rnd(40,90)});ct=rnd(.5,1.1)}
    ob.forEach(function(o){o.x-=v*dt;if(!o.h2&&o.x<74&&o.x+o.w>48&&y<o.h-4){o.h2=1;dist=Math.max(0,dist-170);flash=.7;inp.beep(120,.25,'sawtooth')}});
    coins.forEach(function(c){c.x-=v*dt});ob=ob.filter(function(o){return o.x>-40});coins=coins.filter(function(c){return c.x>-20});this.p=dist/goal;if(dist>=goal)return 'win'},
   d:function(g,t){grad(g,'#6fc3ff','#e6f6ff',0,gy);g.fillRect(0,0,W,gy);cloud(g,((t*6)%(W+80))-40,26,1);layer(g,t,W,gy-52,60,'#7fbf7f',.25,9,.03,dist);layer(g,t,W,gy-34,50,'#4fa35a',.55,7,.045,dist);
    g.fillStyle='#8a6a3c';g.fillRect(0,gy,W,H-gy);g.fillStyle='#5cb85c';g.fillRect(0,gy,W,6);g.fillStyle='rgba(0,0,0,.18)';for(var x=-((dist*1.1)%30);x<W;x+=30)g.fillRect(x,gy+14,16,3);
    coins.forEach(function(c){em(g,'🪙',c.x,c.y,18)});
    ob.forEach(function(o){shadow(g,o.x+o.w/2+6,gy+2,o.w*.9);rr(g,o.x+4,gy-o.h-4,o.w,o.h,3,'#6b4a2a');rr(g,o.x,gy-o.h,o.w,o.h,3,'#c0392b');g.fillStyle='rgba(255,255,255,.3)';g.fillRect(o.x+3,gy-o.h+3,o.w-6,3)});
    if(dist>goal-200){var fx=W-(dist-(goal-200))*1.0;g.fillStyle='#fff';g.fillRect(fx,gy-70,5,70);for(var r=0;r<6;r++){g.fillStyle=r%2?'#000':'#fff';g.fillRect(fx+5,gy-70+r*5,14,5)}}
    shadow(g,60,gy+2,14+Math.max(0,8-y/10));g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;rr(g,38,gy-y-6,32,5,2,'#444');circ(g,44,gy-y-1,3,'#111');circ(g,64,gy-y-1,3,'#111');person(g,54,gy-y-22,'#e67e22',t*.6,1.1);g.globalAlpha=1;bar(g,W,dist/goal)}}};
 M.pesca=function(st,easy,W,H){var bx=W/2,tx=bx,hy=50,state=0,got=0,need=9,fish=[],flash=0,att=null,wy=70,sp=70+st*4;
  function mk(){var d=Math.random()<.5?1:-1;fish.push({x:d>0?-20:W+20,y:rnd(wy+30,H-22),v:rnd(35,75)*d*(1+st*.03),bad:Math.random()<.2,e:['🐟','🐠','🐡','🦈'][(Math.random()*4)|0]})}
  for(var i=0;i<6;i++){mk();fish[i].x=rnd(20,W-20)}
  return {txt:'🎣 TOQUE no lugar do mar (ou ← → e ESPAÇO) para lançar o anzol. Pegue 9 peixes, fuja das botas 👢!',
   u:function(dt,inp){if(inp.px!=null&&(inp.down||inp.tap))tx=inp.px;tx+=inp.dx*160*dt;tx=Math.max(20,Math.min(W-20,tx));bx+=(tx-bx)*Math.min(1,dt*8);
    if(state===0&&(inp.tap||inp.act||inp.dn)){state=1;inp.beep(420,.08)}
    if(state===1){hy+=170*dt;if(hy>=H-14)state=2}else if(state===2){hy-=190*dt;if(hy<=50){hy=50;state=0;if(att){if(att.bad){got=Math.max(0,got-1);flash=.5;inp.beep(130,.25,'sawtooth')}else{got++;inp.beep(900,.1)}fish=fish.filter(function(f){return f!==att});att=null;mk()}}}
    fish.forEach(function(f){if(f!==att){f.x+=f.v*dt;if(f.x<-40)f.x=W+30;if(f.x>W+40)f.x=-30}else{f.x=bx;f.y=hy}});
    if(state===1&&!att)fish.forEach(function(f){if(!att&&Math.abs(f.x-bx)<14&&Math.abs(f.y-hy)<14){att=f;state=2;inp.beep(600,.06)}});
    flash-=dt;this.p=got/need;if(got>=need)return 'win'},
   d:function(g,t){grad(g,'#8fd8ff','#e9f9ff',0,wy);g.fillRect(0,0,W,wy);cloud(g,((t*5)%(W+80))-40,18,.9);grad(g,'#1d86c9','#0a3c6e',wy,H);g.fillRect(0,wy,W,H-wy);g.fillStyle='rgba(255,255,255,.18)';for(var i=0;i<W;i+=22)g.fillRect(i+((t*14)%22),wy+2+Math.sin(i+t*2)*2,12,2);
    g.fillStyle='#d9c27a';g.fillRect(0,H-8,W,8);fish.forEach(function(f){shadow(g,f.x+4,f.y+14,10);em(g,f.bad?'👢':f.e,f.x,f.y,22,f.v>0)});
    g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(bx,wy-14);g.lineTo(bx,hy);g.stroke();circ(g,bx,hy,3,'#ffd23f');em(g,'🛶',bx,wy-8,34);flashFx(g,W,H,flash);g.font='bold 14px system-ui';g.fillStyle='#fff';g.fillText('🐟 '+got+'/'+need,10,26)}}};
 M.voo=function(st,easy,W,H){var y=H/2,ty=y,got=0,need=11,ob=[],tm=.5,flash=0,sp=105+st*5;
  return {txt:'🐉 ARRASTE para subir/descer (ou ↑ ↓ / incline o aparelho). Passe pelos anéis ⭕ e fuja das tempestades ⛈️!',
   u:function(dt,inp){if(inp.px!=null&&inp.down)ty=inp.py;if(inp.up)ty-=34;if(inp.dn)ty+=34;ty=Math.max(24,Math.min(H-24,ty));y+=(ty-y)*Math.min(1,dt*7);
    tm-=dt;if(tm<=0){ob.push({x:W+20,y:rnd(30,H-30),ring:Math.random()<.65});tm=rnd(.7,1.2)}
    ob.forEach(function(o){o.x-=sp*dt;if(!o.h&&hit(o.x,56,16)&&hit(o.y,y,o.ring?20:22)){o.h=1;if(o.ring){got++;inp.beep(880,.1)}else{got=Math.max(0,got-2);flash=.6;inp.beep(120,.25,'sawtooth')}}});
    ob=ob.filter(function(o){return o.x>-30&&!o.h});flash-=dt;this.p=got/need;if(got>=need)return 'win'},
   d:function(g,t){grad(g,'#ff9a6b','#ffe9a8',0,H);g.fillRect(0,0,W,H);circ(g,W-50,40,22,'#fff3b0');layer(g,t,W,H-60,70,'#7d5aa6',.3,10,.025,t*40);layer(g,t,W,H-36,50,'#4a3578',.7,8,.04,t*70);cloud(g,((t*14)%(W+80))-40,34,.9);cloud(g,((t*28+120)%(W+80))-40,H-70,.7);
    ob.forEach(function(o){if(o.ring){g.strokeStyle='#ffd23f';g.lineWidth=5;g.beginPath();g.ellipse(o.x,o.y,9,20,0,0,7);g.stroke();g.strokeStyle='#fff7c2';g.lineWidth=1.5;g.stroke()}else em(g,'⛈️',o.x,o.y,30)});
    shadow(g,56,H-12,16);g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;em(g,'🐉',56,y+Math.sin(t*8)*2,38,true);g.globalAlpha=1;flashFx(g,W,H,flash);bar(g,W,got/need);g.font='bold 14px system-ui';g.fillStyle='#4a2a10';g.fillText('⭕ '+got+'/'+need,10,32)}}};
 M.ritmo=function(st,easy,W,H){var xs=[W/2-70,W/2,W/2+70],ly=H-42,notes=[],got=0,need=16,tm=.6,sp=95+st*5,flash=[0,0,0],bad=0,ci=['#e74c3c','#f1c40f','#3498db'];
  function press(l,inp){flash[l]=.15;var best=null;notes.forEach(function(n){if(n.l===l&&!n.h&&Math.abs(n.y-ly)<24&&(!best||Math.abs(n.y-ly)<Math.abs(best.y-ly)))best=n});if(best){best.h=1;got++;inp.beep(500+l*180,.09)}else{bad=.25;inp.beep(140,.12,'sawtooth')}}
  return {txt:'🎵 TOQUE na coluna (ou ← ↓ →) quando a nota chegar à linha! Acerte 16 notas.',
   u:function(dt,inp){tm-=dt;if(tm<=0){notes.push({l:(Math.random()*3)|0,y:-10});tm=rnd(.55,.95)}
    if(inp.tap&&inp.px!=null){var b=0;for(var i=1;i<3;i++)if(Math.abs(xs[i]-inp.px)<Math.abs(xs[b]-inp.px))b=i;press(b,inp)}if(inp.l)press(0,inp);if(inp.dn)press(1,inp);if(inp.r)press(2,inp);
    notes.forEach(function(n){n.y+=sp*dt;if(!n.h&&!n.m&&n.y>ly+28){n.m=1;got=Math.max(0,got-1);bad=.3}});notes=notes.filter(function(n){return n.y<H+10&&!n.h});for(var f=0;f<3;f++)flash[f]-=dt;bad-=dt;this.p=got/need;if(got>=need)return 'win'},
   d:function(g,t){grad(g,'#1b1040','#5b2a86',0,H);g.fillRect(0,0,W,H);for(var i=0;i<20;i++){g.fillStyle='rgba(255,255,255,.6)';g.fillRect((i*53)%W,(i*29+t*10)%H,2,2)}
    for(var l=0;l<3;l++){g.fillStyle='rgba(255,255,255,'+(flash[l]>0?.25:.08)+')';g.beginPath();g.moveTo(xs[l]-26+(l-1)*-8,0);g.lineTo(xs[l]+26+(l-1)*-8,0);g.lineTo(xs[l]+30,H);g.lineTo(xs[l]-30,H);g.fill()}
    g.fillStyle='rgba(255,255,255,.7)';g.fillRect(0,ly,W,3);for(l=0;l<3;l++){circ(g,xs[l],ly+1,13,flash[l]>0?'#fff':'rgba(255,255,255,.25)');g.strokeStyle=ci[l];g.lineWidth=3;g.beginPath();g.arc(xs[l],ly+1,13,0,7);g.stroke()}
    notes.forEach(function(n){var s=.5+Math.min(1,n.y/ly)*.5;shadow(g,xs[n.l]+3,n.y+8,10*s);circ(g,xs[n.l],n.y,11*s,ci[n.l]);circ(g,xs[n.l]-3*s,n.y-3*s,3.5*s,'rgba(255,255,255,.7)')});
    if(bad>0){g.fillStyle='rgba(255,40,40,.18)';g.fillRect(0,0,W,H)}bar(g,W,got/need);g.font='bold 14px system-ui';g.fillStyle='#fff';g.fillText('🎵 '+got+'/'+need,10,32)}}};
 M.defesa=function(st,easy,W,H){var kills=0,need=15,vidas=3,en=[],tm=.8,fx=[],flash=0,sp=26+st*2.5,R=['👹','🧟','👾','🦇','👻'];
  function reset(){kills=0;vidas=3;en=[]}
  return {txt:'🏰 TOQUE nos monstros para derrotá-los antes que cheguem à torre! Derrote 15 (3 vidas).',
   u:function(dt,inp){tm-=dt;if(tm<=0){en.push({x:W+14,y:rnd(60,H-26),e:R[(Math.random()*5)|0],w:rnd(0,6)});tm=rnd(.7,1.2)/(easy?.9:1)}
    if(inp.tap&&inp.px!=null){var b=null,bd=26;en.forEach(function(e){var d=Math.hypot(e.x-inp.px,e.y-inp.py);if(d<bd){bd=d;b=e}});if(b){b.dead=1;kills++;fx.push({x:b.x,y:b.y,t:.3});inp.beep(700,.08)}else inp.beep(200,.05)}
    en.forEach(function(e){e.x-=sp*dt;if(e.x<46&&!e.dead){e.dead=1;vidas--;flash=.5;inp.beep(120,.25,'sawtooth')}});en=en.filter(function(e){return !e.dead});fx.forEach(function(f){f.t-=dt});fx=fx.filter(function(f){return f.t>0});flash-=dt;
    if(vidas<=0)reset();this.p=kills/need;if(kills>=need)return 'win'},
   d:function(g,t){grad(g,'#9ad4ff','#e6f7d0',0,H);g.fillRect(0,0,W,H);layer(g,t,W,60,70,'#86c47a',.2,6,.03,0);g.fillStyle='#6fb35f';g.fillRect(0,76,W,H-76);g.fillStyle='rgba(0,0,0,.08)';for(var i=0;i<6;i++)g.fillRect(0,86+i*20,W,2);
    shadow(g,26,H-16,28);em(g,'🏰',28,H/2+10,64);en.forEach(function(e){shadow(g,e.x,e.y+14,12);em(g,e.e,e.x,e.y+Math.sin(t*6+e.w)*3,28,true)});fx.forEach(function(f){em(g,'💥',f.x,f.y,30)});
    for(var v=0;v<3;v++)g.globalAlpha=v<vidas?1:.25,em(g,'❤️',W-22-v*20,24,16);g.globalAlpha=1;flashFx(g,W,H,flash);bar(g,W,kills/need);g.font='bold 14px system-ui';g.fillStyle='#234';g.fillText('👹 '+kills+'/'+need,10,32)}}};
 /* ===== PSP ===== */
 M.nave=function(st,easy,W,H){var y=H/2,ty=y,bl=[],en=[],kills=0,need=22,tm=.5,cool=0,flash=0,sp=70+st*4,stars=[];for(var i=0;i<40;i++)stars.push([rnd(0,W),rnd(0,H),rnd(.3,1.4)]);
  return {txt:'🚀 ARRASTE (ou ↑ ↓ / incline) para mover a nave. Ela atira sozinha: destrua 22 inimigos e desvie!',
   u:function(dt,inp){if(inp.px!=null&&inp.down)ty=inp.py;if(inp.up)ty-=30;if(inp.dn)ty+=30;ty=Math.max(18,Math.min(H-18,ty));y+=(ty-y)*Math.min(1,dt*9);
    cool-=dt;if(cool<=0){bl.push({x:70,y:y});cool=.32;if(inp.act)cool=.18}tm-=dt;if(tm<=0){en.push({x:W+16,y:rnd(24,H-24),e:['☄️','👾','🛸'][(Math.random()*3)|0]});tm=rnd(.5,.95)/(easy?.9:1)}
    bl.forEach(function(b){b.x+=240*dt});en.forEach(function(e){e.x-=sp*dt;if(!e.h&&hit(e.x,60,16)&&hit(e.y,y,16)){e.h=1;kills=Math.max(0,kills-2);flash=.5;inp.beep(120,.25,'sawtooth')}});
    bl.forEach(function(b){en.forEach(function(e){if(!e.h&&!b.h&&hit(b.x,e.x,14)&&hit(b.y,e.y,15)){e.h=1;b.h=1;kills++;e.boom=.25;inp.beep(520+Math.random()*200,.07)}})});
    bl=bl.filter(function(b){return b.x<W+10&&!b.h});en=en.filter(function(e){return e.x>-24&&!e.h});flash-=dt;this.p=kills/need;if(kills>=need)return 'win'},
   d:function(g,t){grad(g,'#04061a','#1a1450',0,H);g.fillRect(0,0,W,H);stars.forEach(function(s){g.fillStyle='rgba(255,255,255,'+(.3+s[2]/2)+')';g.fillRect(((s[0]-t*30*s[2])%W+W)%W,s[1],s[2]+.6,s[2]+.6)});
    bl.forEach(function(b){g.fillStyle='#7df9ff';g.fillRect(b.x,b.y-1.5,12,3);g.fillStyle='rgba(125,249,255,.35)';g.fillRect(b.x-10,b.y-1,10,2)});en.forEach(function(e){em(g,e.e,e.x,e.y,28,true)});
    g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;g.fillStyle='rgba(255,140,40,.8)';g.fillRect(34-Math.random()*6,y-2,12,4);em(g,'🚀',56,y,34);g.globalAlpha=1;flashFx(g,W,H,flash);bar(g,W,kills/need);g.font='bold 14px system-ui';g.fillStyle='#fff';g.fillText('💥 '+kills+'/'+need,10,32)}}};
 M.penalti=function(st,easy,W,H){var gx=70,gw=180,gt=36,gh=76,goals=0,need=6,shot=null,kp=0,res='',resT=0,ax=0,ay=0,flash=0,kx=W/2,ky=gt+gh/2,sp=1.7+st*.1;
  return {txt:'⚽ TOQUE (ou ESPAÇO) para chutar quando a mira estiver longe do goleiro! Marque 6 gols.',
   u:function(dt,inp){var t=performance.now()/1000;ax=gx+(Math.sin(t*sp*1.7)+1)/2*gw;ay=gt+(Math.sin(t*sp*1.1+1)+1)/2*gh;kp+=dt;flash-=dt;resT-=dt;
    if(!shot){kx+=(W/2+Math.sin(kp*1.4)*(gw/2-26)-kx)*Math.min(1,dt*3);if(inp.tap||inp.act){shot={x:ax,y:ay,t:0,tx:kx,ty:rnd(gt+14,gt+gh-14),kx:0,ky:0};inp.beep(300,.1)}}
    else{shot.t+=dt;var k=Math.min(1,shot.t/.55);shot.bx=W/2+(shot.x-W/2)*k;shot.by=H-34+(shot.y-(H-34))*k;if(shot.t>.2&&!shot.dv){shot.dv=1;shot.kx=shot.tx+rnd(-1,1)*gw*.38;shot.ky=shot.ty}
     if(shot.t>=.55){var sv=Math.abs(shot.x-shot.kx)<34&&Math.abs(shot.y-shot.ky)<30,out=shot.x<gx||shot.x>gx+gw||shot.y<gt||shot.y>gt+gh;if(!sv&&!out){goals++;res='GOOOL! ⚽';inp.beep(880,.2)}else{goals=Math.max(0,goals-1);res=sv?'DEFENDEU!':'PARA FORA!';flash=.5;inp.beep(130,.25,'sawtooth')}resT=1;shot=null;kx=W/2}}
    this.p=goals/need;if(goals>=need)return 'win'},
   d:function(g,t){grad(g,'#8fd8ff','#d8f1ff',0,gt+gh);g.fillRect(0,0,W,gt+gh);g.fillStyle='#3e9b4a';g.fillRect(0,gt+gh,W,H-gt-gh);g.fillStyle='#48ad56';for(var i=0;i<6;i++)g.fillRect(0,gt+gh+i*16,W,8);
    g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(gx,gt,gw,gh);g.lineWidth=1;g.strokeStyle='rgba(255,255,255,.4)';for(var x=gx;x<=gx+gw;x+=12){g.beginPath();g.moveTo(x,gt);g.lineTo(x,gt+gh);g.stroke()}for(var y2=gt;y2<=gt+gh;y2+=12){g.beginPath();g.moveTo(gx,y2);g.lineTo(gx+gw,y2);g.stroke()}
    var kxx=shot&&shot.dv?Math.min(1,(shot.t-.2)/.3)*(shot.kx-shot.tx)+shot.tx:kx,kyy=shot&&shot.dv?Math.min(1,(shot.t-.2)/.3)*(shot.ky-(gt+gh/2))+gt+gh/2:ky;shadow(g,kxx,gt+gh-2,18);em(g,'🧤',kxx,kyy,34);
    if(!shot){g.strokeStyle='#ff3030';g.lineWidth=2;g.beginPath();g.arc(ax,ay,10,0,7);g.moveTo(ax-15,ay);g.lineTo(ax+15,ay);g.moveTo(ax,ay-15);g.lineTo(ax,ay+15);g.stroke()}
    var bx=shot?shot.bx:W/2,by=shot?shot.by:H-34,bs=shot?1-Math.min(1,shot.t/.55)*.5:1;shadow(g,bx,H-26,10*bs);em(g,'⚽',bx,by,26*bs);
    if(resT>0){g.font='bold 22px system-ui';g.textAlign='center';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=4;g.strokeText(res,W/2,H/2+10);g.fillText(res,W/2,H/2+10);g.textAlign='left'}
    flashFx(g,W,H,flash);bar(g,W,goals/need);g.font='bold 14px system-ui';g.fillStyle='#fff';g.fillText('⚽ '+goals+'/'+need,10,32)}}};
 M.alvo=function(st,easy,W,H){var tg=[],hits=0,need=15,tm=.4,cx=W/2,cy=H/2,flash=0,life=2.2-Math.min(.8,st*.07),fx=[];
  function shoot(inp){var b=null,bd=999;tg.forEach(function(t){var d=Math.hypot(t.x-cx,t.y-cy);if(d<t.r+3&&d<bd){bd=d;b=t}});if(b){b.dead=1;hits++;fx.push({x:b.x,y:b.y,t:.25});inp.beep(800,.08)}else inp.beep(180,.05)}
  return {txt:'🎯 TOQUE nos alvos (ou ← → ↑ ↓ e ESPAÇO) antes que sumam! Acerte 15; alvo que some tira 1 ponto.',
   u:function(dt,inp){if(inp.tap&&inp.px!=null){cx=inp.px;cy=inp.py;shoot(inp)}cx+=inp.dx*180*dt;if(inp.up)cy-=26;if(inp.dn)cy+=26;cx=Math.max(8,Math.min(W-8,cx));cy=Math.max(8,Math.min(H-8,cy));if(inp.act)shoot(inp);
    tm-=dt;if(tm<=0&&tg.length<4){tg.push({x:rnd(30,W-30),y:rnd(36,H-24),r:22,t:life,l:life});tm=rnd(.55,1)}
    tg.forEach(function(t){t.t-=dt;t.r=8+14*Math.min(1,t.t/t.l+.25);if(t.t<=0&&!t.dead){t.dead=1;hits=Math.max(0,hits-1);flash=.4;inp.beep(130,.2,'sawtooth')}});tg=tg.filter(function(t){return !t.dead});fx.forEach(function(f){f.t-=dt});fx=fx.filter(function(f){return f.t>0});flash-=dt;this.p=hits/need;if(hits>=need)return 'win'},
   d:function(g,t){grad(g,'#d9c9a3','#a98f5a',0,H);g.fillRect(0,0,W,H);g.fillStyle='rgba(0,0,0,.08)';for(var i=0;i<W;i+=26)g.fillRect(i,0,2,H);
    tg.forEach(function(o){shadow(g,o.x+3,o.y+o.r*.9,o.r);['#fff','#e74c3c','#fff','#e74c3c'].forEach(function(c,k){circ(g,o.x,o.y,o.r*(1-k*.25),c)});circ(g,o.x,o.y,2,'#111')});
    fx.forEach(function(f){em(g,'💥',f.x,f.y,28)});g.strokeStyle='#111';g.lineWidth=2;g.beginPath();g.arc(cx,cy,9,0,7);g.moveTo(cx-14,cy);g.lineTo(cx+14,cy);g.moveTo(cx,cy-14);g.lineTo(cx,cy+14);g.stroke();flashFx(g,W,H,flash);bar(g,W,hits/need);g.font='bold 14px system-ui';g.fillStyle='#3a2a10';g.fillText('🎯 '+hits+'/'+need,10,32)}}};
 M.cobra=function(st,easy,W,H){var cs=12,cols=Math.floor(W/cs),rows=Math.floor((H-16)/cs),oy=16,sn,dir,nd,ap,got=0,need=12,acc=0,step=Math.max(.085,.17-st*.008-(easy?-.03:0)),flash=0;
  function reset(){sn=[[6,(rows/2)|0],[5,(rows/2)|0],[4,(rows/2)|0]];dir=[1,0];nd=dir;newap()}
  function newap(){do{ap=[(Math.random()*cols)|0,(Math.random()*rows)|0]}while(sn.some(function(c){return c[0]===ap[0]&&c[1]===ap[1]}))}reset();
  function turn(a,b){if(a!==-dir[0]||b!==-dir[1]){if(a||b)nd=[a,b]}}
  return {txt:'🐍 Use ← ↑ ↓ → (ou TOQUE para onde quer ir) e coma 12 maçãs sem bater nas bordas ou em você.',
   u:function(dt,inp){if(inp.l)turn(-1,0);if(inp.r)turn(1,0);if(inp.up)turn(0,-1);if(inp.dn)turn(0,1);
    if(inp.tap&&inp.px!=null){var hx=sn[0][0]*cs+cs/2,hy=oy+sn[0][1]*cs+cs/2,dx=inp.px-hx,dy=inp.py-hy;if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1,0);else turn(0,dy>0?1:-1)}
    acc+=dt;flash-=dt;while(acc>=step){acc-=step;dir=nd;var h=[sn[0][0]+dir[0],sn[0][1]+dir[1]];if(h[0]<0||h[1]<0||h[0]>=cols||h[1]>=rows||sn.some(function(c){return c[0]===h[0]&&c[1]===h[1]})){got=Math.max(0,got-3);flash=.6;inp.beep(120,.3,'sawtooth');reset();break}
     sn.unshift(h);if(h[0]===ap[0]&&h[1]===ap[1]){got++;inp.beep(760,.08);newap()}else sn.pop()}this.p=got/need;if(got>=need)return 'win'},
   d:function(g,t){g.fillStyle='#223';g.fillRect(0,0,W,H);for(var x=0;x<cols;x++)for(var y=0;y<rows;y++){g.fillStyle=(x+y)%2?'#2f4a35':'#35553b';g.fillRect(x*cs,oy+y*cs,cs,cs)}
    em(g,'🍎',ap[0]*cs+cs/2,oy+ap[1]*cs+cs/2,cs+2);sn.forEach(function(c,i){rr(g,c[0]*cs+2+1,oy+c[1]*cs+3,cs-3,cs-3,4,'rgba(0,0,0,.3)');rr(g,c[0]*cs+1,oy+c[1]*cs+1,cs-2,cs-2,4,i?'#4cd964':'#a6ff7a')});
    var h=sn[0];g.fillStyle='#111';g.fillRect(h[0]*cs+3+dir[0]*2,oy+h[1]*cs+3+dir[1]*2,2,2);g.fillRect(h[0]*cs+7+dir[0]*2,oy+h[1]*cs+3+dir[1]*2,2,2);flashFx(g,W,H,flash);bar(g,W,got/need);g.font='bold 12px system-ui';g.fillStyle='#fff';g.fillText('🍎 '+got+'/'+need,10,32)}}};
 M.memoria=function(st,easy,W,H){var n=st>=5?8:6,E=['🧮','📐','📏','🧪','🌍','📚','🔭','🎨'].slice(0,n),cards=[],fl=[],lock=0,pairs=0,flash=0,cols=4,rows=n*2/cols,cw=64,gap=10,ch=Math.floor((H-48-(rows-1)*gap)/rows),ox=(W-(cols*cw+(cols-1)*gap))/2,oy2=34,tries=0;
  E.concat(E).sort(function(){return Math.random()-.5}).forEach(function(e,i){cards.push({e:e,open:0,done:0})});
  function at(px,py){for(var i=0;i<cards.length;i++){var c=i%cols,r=(i/cols)|0,x=ox+c*(cw+gap),y=oy2+r*(ch+gap);if(px>=x&&px<=x+cw&&py>=y&&py<=y+ch)return i}return -1}
  var cur=0;
  return {txt:'🃏 TOQUE nas cartas (ou ← → ↑ ↓ e ESPAÇO) para virar e achar os pares iguais!',
   u:function(dt,inp){flash-=dt;if(lock>0){lock-=dt;if(lock<=0){fl.forEach(function(i){if(!cards[i].done)cards[i].open=0});fl=[]}this.p=pairs/n;return}
    if(inp.l)cur=(cur+cards.length-1)%cards.length;if(inp.r)cur=(cur+1)%cards.length;if(inp.up)cur=(cur+cards.length-cols)%cards.length;if(inp.dn)cur=(cur+cols)%cards.length;
    var pick=-1;if(inp.tap&&inp.px!=null)pick=at(inp.px,inp.py);if(inp.act)pick=cur;
    if(pick>=0&&!cards[pick].open&&!cards[pick].done){cards[pick].open=1;fl.push(pick);inp.beep(500,.05);if(fl.length===2){tries++;var a=cards[fl[0]],b=cards[fl[1]];if(a.e===b.e){a.done=b.done=1;pairs++;fl=[];inp.beep(900,.12)}else{lock=.8;flash=.2;inp.beep(180,.15,'sawtooth')}}}
    this.p=pairs/n;if(pairs>=n)return 'win'},
   d:function(g,t){grad(g,'#2b1f5c','#4b3a96',0,H);g.fillRect(0,0,W,H);cards.forEach(function(c,i){var cc=i%cols,r=(i/cols)|0,x=ox+cc*(cw+gap),y=oy2+r*(ch+gap);rr(g,x+3,y+4,cw,ch,8,'rgba(0,0,0,.35)');rr(g,x,y,cw,ch,8,c.open||c.done?(c.done?'#bff5c8':'#fff'):'#6a5acd');
     if(c.open||c.done)em(g,c.e,x+cw/2,y+ch/2,Math.min(ch-10,34));else{g.fillStyle='rgba(255,255,255,.35)';g.font='bold 22px system-ui';g.textAlign='center';g.fillText('?',x+cw/2,y+ch/2+8);g.textAlign='left'}
     if(i===cur&&!('ontouchstart' in window)){g.strokeStyle='#ffd23f';g.lineWidth=3;g.strokeRect(x-2,y-2,cw+4,ch+4)}});flashFx(g,W,H,0);bar(g,W,pairs/n);g.font='bold 14px system-ui';g.fillStyle='#fff';g.fillText('🃏 '+pairs+'/'+n,10,28)}}};
 var D3=[['3ds-skate','Skate Radical','🛹','Pule os obstáculos até a linha de chegada e responda','skate','#e67e22','#ffe9cf'],
  ['3ds-pesca','Pesca Mestre','🎣','Lance o anzol, pegue os peixes e responda','pesca','#2980b9','#dff0ff'],
  ['3ds-voo','Voo do Dragão','🐉','Voe pelos anéis, fuja das tempestades e responda','voo','#8e44ad','#f0e0ff'],
  ['3ds-ritmo','Ritmo Musical','🎵','Acerte as notas no tempo certo e responda','ritmo','#c0392b','#ffe0e0'],
  ['3ds-defesa','Defesa da Torre','🏰','Derrote os monstros antes de chegarem à torre e responda','defesa','#27ae60','#e2f9e8']];
 var DP=[['psp-nave','Nave Espacial','🚀','Destrua os inimigos no espaço e responda','nave','#2c3e9e','#e0e6ff'],
  ['psp-penalti','Pênalti Decisivo','⚽','Marque os gols driblando o goleiro e responda','penalti','#27ae60','#e2f9e8'],
  ['psp-alvo','Tiro ao Alvo','🎯','Acerte os alvos antes que sumam e responda','alvo','#c0392b','#ffe0e0'],
  ['psp-cobra','Cobrinha Faminta','🐍','Coma as maçãs sem bater e responda','cobra','#16a085','#d9f7f0'],
  ['psp-memoria','Memória dos Pares','🃏','Ache os pares de cartas e responda','memoria','#6a5acd','#ebe6ff']];
 D3.forEach(function(d){window.RBX_JOGOS[d[0]]={nome:d[1]+' '+d[2],icone:d[2],desc:d[3],console:'3ds',start:function(api){var X=window.RBX_M3D,t3=X&&X[d[4]]&&window.THREE;K.run(d,api,t3?{W:480,H:270,con:'3ds',conn:'Nintendo 3DS',mech:X,maxw:620}:{W:320,H:192,con:'3ds',conn:'Nintendo 3DS',mech:M,maxw:560})}}});
 DP.forEach(function(d){window.RBX_JOGOS[d[0]]={nome:d[1]+' '+d[2],icone:d[2],desc:d[3],console:'psp',start:function(api){K.run(d,api,{W:320,H:180,con:'psp',conn:'PSP',mech:M,one:1,maxw:600})}}});
})();
