/* RobIox — 15 minijogos estilo Game Boy Advance (tela 240x160, cores cheias, pixel art).
   Em todos: desafio rápido na tela + portão com pergunta. Acertar abre a próxima fase. */
(function(){
 window.RBX_JOGOS=window.RBX_JOGOS||{};
 var W=240,H=160,GY=128,FASES=10,VIDAS=5;
 function R(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(x|0,y|0,w,h)}
 function disc(g,c,cx,cy,r){g.fillStyle=c;for(var j=-r;j<=r;j++){var w=Math.round(Math.sqrt(r*r-j*j));g.fillRect((cx-w)|0,(cy+j)|0,w*2+1,1)}}
 function mix(a,b,t){var A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16),r=((A>>16)&255)*(1-t)+((B>>16)&255)*t,gg=((A>>8)&255)*(1-t)+((B>>8)&255)*t,bl=(A&255)*(1-t)+(B&255)*t;return 'rgb('+(r|0)+','+(gg|0)+','+(bl|0)+')'}
 /* ---- sprites 16x16 desenhados com retângulos ---- */
 var SP={
  kid:function(g,x,y,t){var s=((t*8)|0)%2;R(g,'#3b2a1a',x+4,y+14,3,2);R(g,'#3b2a1a',x+9,y+14,3,2);R(g,'#2b4c9a',x+4,y+10,3,s?3:4);R(g,'#2b4c9a',x+9,y+10,3,s?4:3);R(g,'#e23b3b',x+3,y+6,10,5);R(g,'#f2c294',x+2,y+7,2,3);R(g,'#f2c294',x+12,y+7,2,3);R(g,'#f2c294',x+4,y+1,8,6);R(g,'#5a3418',x+3,y,10,3);R(g,'#5a3418',x+3,y+3,2,3);R(g,'#111',x+10,y+4,1,2);R(g,'#111',x+7,y+4,1,2)},
  ninja:function(g,x,y,t){var s=((t*8)|0)%2;R(g,'#111',x+4,y+14,3,2);R(g,'#111',x+9,y+14,3,2);R(g,'#1d2a55',x+4,y+10,3,s?3:4);R(g,'#1d2a55',x+9,y+10,3,s?4:3);R(g,'#1d2a55',x+3,y+6,10,5);R(g,'#c0392b',x+3,y+9,10,1);R(g,'#1d2a55',x+3,y+1,10,6);R(g,'#f2c294',x+4,y+3,8,2);R(g,'#fff',x+5,y+3,2,1);R(g,'#fff',x+9,y+3,2,1);R(g,'#c0392b',x+13,y+2,3,1);R(g,'#c0392b',x+14,y+3,2,1)},
  dino:function(g,x,y,t){var s=((t*8)|0)%2;R(g,'#2e8b3a',x+1,y+6,10,6);R(g,'#2e8b3a',x+8,y+1,7,6);R(g,'#bde37a',x+3,y+9,6,3);R(g,'#fff',x+12,y+2,2,2);R(g,'#111',x+13,y+3,1,1);R(g,'#1f5f28',x+9,y+6,6,1);R(g,'#1f5f28',x+4,y+4,2,2);R(g,'#1f5f28',x+7,y+3,2,3);R(g,'#2e8b3a',x+4,y+12,3,s?3:4);R(g,'#2e8b3a',x+8,y+12,3,s?4:3);R(g,'#2e8b3a',x,y+8,2,3)},
  ship:function(g,x,y,t){var f=((t*14)|0)%2;R(g,f?'#ffb300':'#ff6d00',x+6,y+13,4,3);R(g,'#c9d1da',x+6,y+2,4,11);R(g,'#c9d1da',x+5,y+4,6,8);R(g,'#e23b3b',x+1,y+9,5,5);R(g,'#e23b3b',x+10,y+9,5,5);R(g,'#e23b3b',x+7,y,2,3);R(g,'#4fc3f7',x+6,y+5,4,3);R(g,'#fff',x+6,y+5,1,1)},
  bird:function(g,x,y,t){var s=((t*10)|0)%2;disc(g,'#ffcc33',x+8,y+9,6);R(g,'#ffdf80',x+4,y+10,6,3);R(g,'#ff8f00',x+13,y+8,3,2);R(g,'#fff',x+9,y+5,3,3);R(g,'#111',x+10,y+6,1,2);R(g,'#e68a00',x+1,s?y+5:y+9,6,3);R(g,'#e68a00',x,y+9,2,2)},
  sub:function(g,x,y,t){var s=((t*10)|0)%2;R(g,'#f2c200',x+1,y+6,13,7);R(g,'#f2c200',x+3,y+4,9,2);R(g,'#c79a00',x+1,y+11,13,2);R(g,'#8a6d00',x+8,y+1,2,4);R(g,'#8a6d00',x+8,y+1,4,1);R(g,'#bfe9ff',x+4,y+7,3,3);R(g,'#bfe9ff',x+9,y+7,3,3);R(g,'#555',x,s?y+7:y+9,2,3)},
  ghost:function(g,x,y,t){var s=((t*6)|0)%2;disc(g,'#f4f4ff',x+8,y+7,6);R(g,'#f4f4ff',x+2,y+7,12,6);for(var i=0;i<4;i++)R(g,'#f4f4ff',x+2+i*3,y+13,3,(i+s)%2?3:2);R(g,'#111',x+5,y+5,2,3);R(g,'#111',x+9,y+5,2,3);R(g,'#d6d6ee',x+3,y+9,2,2);R(g,'#8a6fd1',x+6,y+10,4,1)},
  rock:function(g,x,y){disc(g,'#6e6a66',x+8,y+8,7);disc(g,'#8f8a85',x+6,y+6,4);R(g,'#4f4b48',x+9,y+10,4,3);R(g,'#b3aea8',x+4,y+4,2,2)},
  meteor:function(g,x,y,t){var f=((t*12)|0)%2;R(g,f?'#ff9800':'#ff5722',x+5,y-3,6,5);disc(g,'#7a4a2a',x+8,y+8,7);disc(g,'#a8683a',x+6,y+6,4);R(g,'#ffcc80',x+10,y+4,2,2);R(g,'#4a2a14',x+9,y+10,4,3)},
  coin:function(g,x,y,t){var w=Math.abs(Math.sin(t*4))*6+2;disc(g,'#c98a00',x+8,y+8,7);g.fillStyle='#ffd23f';var ww=w|0;g.fillRect(x+8-ww,y+2,ww*2,12);R(g,'#fff4b0',x+6,y+4,2,3)},
  apple:function(g,x,y){disc(g,'#d32f2f',x+8,y+9,6);disc(g,'#d32f2f',x+5,y+8,4);disc(g,'#d32f2f',x+11,y+8,4);R(g,'#5d4037',x+8,y+1,1,4);R(g,'#43a047',x+9,y+2,4,2);R(g,'#ff8a80',x+4,y+6,2,2)},
  fish:function(g,x,y,t){var s=((t*8)|0)%2;disc(g,'#ff8a3d',x+7,y+8,5);R(g,'#ff8a3d',x+3,y+5,8,6);R(g,'#ff8a3d',x+11,s?y+4:y+6,4,4);R(g,'#ff8a3d',x+12,y+8,4,3);R(g,'#fff',x+3,y+6,3,3);R(g,'#111',x+3,y+7,1,1);R(g,'#ffd0a0',x+6,y+9,5,2)},
  star:function(g,x,y,t){var c=((t*6)|0)%2?'#ffe135':'#ffc400';R(g,c,x+7,y,2,16);R(g,c,x,y+7,16,2);disc(g,c,x+8,y+8,5);R(g,'#fff6a8',x+6,y+6,2,2)},
  target:function(g,x,y){disc(g,'#fff',x+8,y+8,7);disc(g,'#e23b3b',x+8,y+8,6);disc(g,'#fff',x+8,y+8,4);disc(g,'#e23b3b',x+8,y+8,3);disc(g,'#fff',x+8,y+8,1)},
  spike:function(g,x,y){for(var i=0;i<3;i++){var bx=x+i*5;for(var j=0;j<14;j++)R(g,j<9?'#c5ccd6':'#8d97a6',bx+Math.floor(j/5),y+2+j,Math.max(1,5-Math.floor(j/2.5)),1)}R(g,'#59606b',x,y+14,16,2)}
 };
 function spr(g,n,x,y,t){SP[n](g,x|0,y|0,t||0)}
 /* ---- temas visuais ---- */
 var TH={
  campo:{sky:['#3aa9f0','#bfe9ff'],far:'#8fd1a0',mid:'#4fae5d',gTop:'#58c254',gr:'#8a5a2b',gr2:'#6e4521',ui:'#1e4d2b',ui2:'#58c254',bd:'#fff6c9',tx:'#10300f',k:'hills'},
  noite:{sky:['#16113f','#7b3f8f'],far:'#3b2a6b',mid:'#251a4f',gTop:'#6a4ba8',gr:'#2b2050',gr2:'#1c1438',ui:'#1d1236',ui2:'#a77be0',bd:'#fbe8ff',tx:'#241048',k:'city'},
  deserto:{sky:['#ff9f43','#ffe9a8'],far:'#f1b866',mid:'#d98e3f',gTop:'#f0c36a',gr:'#c47a2c',gr2:'#a25f1c',ui:'#6b3410',ui2:'#f6a93b',bd:'#fff2c8',tx:'#4a2108',k:'dunes'},
  espaco:{sky:['#02020f','#1b1b5a'],far:'#2b2b7a',mid:'#3a3a8a',gTop:'#6e6e8e',gr:'#3a3a52',gr2:'#2a2a3e',ui:'#0b0b2e',ui2:'#6ea8ff',bd:'#e6efff',tx:'#0b1030',k:'space'},
  mar:{sky:['#0c6fb8','#58d3e8'],far:'#1e9bc8',mid:'#177fae',gTop:'#e6d28a',gr:'#c9b46b',gr2:'#a9964e',ui:'#06314f',ui2:'#58d3e8',bd:'#e6ffff',tx:'#04283f',k:'sea'},
  caverna:{sky:['#120a1e','#3b1f3f'],far:'#4a2a55',mid:'#352040',gTop:'#7c6a52',gr:'#4a3a2c',gr2:'#352a20',ui:'#1b0f26',ui2:'#e0a458',bd:'#f6e6d0',tx:'#2a1608',k:'cave'},
  rosa:{sky:['#ff7eb6','#ffd1e8'],far:'#f2a3cb',mid:'#d977a9',gTop:'#ff9ccb',gr:'#b24f84',gr2:'#8f3a68',ui:'#4a1033',ui2:'#ff9ccb',bd:'#fff0f7',tx:'#401030',k:'city'}
 };
 function bg(g,T,t){
  var i;for(i=0;i<GY;i+=4){R(g,mix(T.sky[0],T.sky[1],i/GY),0,i,W,4)}
  var k=T.k;
  if(k==='space'||k==='cave'){g.fillStyle=k==='space'?'#fff':'#ffcf8a';for(i=0;i<34;i++){var tw=((t*3+i)|0)%4===0;if(!tw||i%2)R(g,k==='space'?'#fff':'#ffcf8a',(i*53+17)%W,(i*29+5)%100,1+(i%3===0?1:0),1+(i%3===0?1:0))}
   if(k==='space'){disc(g,'#c85a2e',185,34,14);disc(g,'#e0824a',181,30,6);R(g,'#8a3a1c',170,38,30,3)}
   else{for(i=0;i<9;i++){var l=16+(i*23)%34;g.fillStyle=T.far;g.beginPath();g.moveTo(i*30,0);g.lineTo(i*30+15,l);g.lineTo(i*30+30,0);g.fill()}for(i=0;i<5;i++){R(g,'#7fe0ff',(i*61+30)%W,GY-14-(i*7)%12,3,8);R(g,'#c8f4ff',(i*61+31)%W,GY-14-(i*7)%12,1,5)}}}
  else if(k==='hills'){var sc=(t*4)%W;for(i=-1;i<3;i++){disc(g,'#fff',((i*120+sc*.3)%W+W)%W,22+i*4,9);disc(g,'#fff',((i*120+sc*.3)%W+W)%W+12,26+i*4,7)}
   g.fillStyle=T.far;for(i=0;i<5;i++){g.beginPath();g.arc(i*64+10,GY+10,52,Math.PI,0);g.fill()}g.fillStyle=T.mid;for(i=0;i<6;i++){g.beginPath();g.arc(i*52-10,GY+16,34,Math.PI,0);g.fill()}}
  else if(k==='dunes'){disc(g,'#fff3b0',190,32,12);g.fillStyle=T.far;for(i=0;i<4;i++){g.beginPath();g.arc(i*84,GY+22,64,Math.PI,0);g.fill()}g.fillStyle=T.mid;for(i=0;i<5;i++){g.beginPath();g.arc(i*66+20,GY+24,40,Math.PI,0);g.fill()}for(i=0;i<3;i++){var cx=((i*97+30-t*14)%W+W)%W;R(g,'#3f8f3a',cx,GY-18,3,18);R(g,'#3f8f3a',cx-4,GY-12,4,2);R(g,'#3f8f3a',cx-4,GY-16,2,6);R(g,'#3f8f3a',cx+3,GY-10,4,2);R(g,'#3f8f3a',cx+5,GY-14,2,6)}}
  else if(k==='city'){disc(g,'#fff6c8',48,28,9);for(i=0;i<12;i++){var hh=26+(i*37)%52,bx=i*21;R(g,T.far,bx,GY-hh,18,hh);R(g,T.mid,bx+10,GY-hh+6,8,hh-6);for(var j=0;j<4;j++){if(((i*7+j*3)%5)>0)R(g,'#ffe27a',bx+3,GY-hh+6+j*11,3,4)}}}
  else if(k==='sea'){g.globalAlpha=.25;for(i=0;i<6;i++){R(g,'#fff',(i*41+30)%W,0,2,GY)}g.globalAlpha=1;R(g,'#fff',0,0,W,2);for(i=0;i<14;i++){var by=(GY-((t*22+i*37)%GY)),bx2=(i*47+9)%W;disc(g,'rgba(255,255,255,.55)',bx2+Math.sin(t*2+i)*3,by,1+(i%3))}g.fillStyle=T.mid;for(i=0;i<6;i++){g.beginPath();g.arc(i*52,GY+16,30,Math.PI,0);g.fill()}for(i=0;i<5;i++){R(g,'#ff6f91',(i*53+10)%W,GY-14-(i%3)*3,3,14);R(g,'#ff6f91',(i*53+10)%W-3,GY-9,3,2)}}
  /* chão */
  R(g,T.gTop,0,GY,W,4);R(g,T.gr,0,GY+4,W,H-GY-4);for(i=0;i<W/10+2;i++){var gx=i*10-((t*30)|0)%10;R(g,T.gr2,gx,GY+10+(i%3)*5,5,2);R(g,T.gTop,gx+2,GY-2,1,2)}
 }
 function rnd(a,b){return a+Math.random()*(b-a)}
 function bar(g,T,v){R(g,'rgba(0,0,0,.45)',8,8,W-16,6);R(g,T.ui2,9,9,Math.max(0,Math.min(W-18,(W-18)*v)),4)}
 function lab(g,T,s){g.font='bold 11px monospace';g.fillStyle='rgba(0,0,0,.45)';g.fillText(s,9,23);g.fillStyle='#fff';g.fillText(s,8,22)}
 /* ---- mecânicas ---- */
 var MECH={
  runner:function(st,easy){var sp=(62+st*5)*(easy?.8:1),hy=GY-16,vy=0,ob=[],dist=0,goal=420+st*16,nx=60;
   return {move:false,txt:'Toque para PULAR os obstáculos!',
    u:function(dt,inp){if(inp.act&&hy>=GY-16){vy=-225;inp.beep(520)}vy+=640*dt;hy+=vy*dt;if(hy>GY-16){hy=GY-16;vy=0}dist+=sp*dt;nx-=sp*dt;if(nx<=0&&dist<goal-90){ob.push({x:W+4});nx=rnd(92,140)}
     ob.forEach(function(o){o.x-=sp*dt});ob=ob.filter(function(o){return o.x>-18});
     for(var i=0;i<ob.length;i++){if(ob[i].x<38&&ob[i].x+12>26&&hy>GY-16-11)return 'lose'}if(dist>=goal)return 'win'},
    d:function(g,T,t,th){ob.forEach(function(o){spr(g,th.obs,o.x,GY-16,t)});spr(g,th.hero,30,hy,t);bar(g,T,dist/goal)}}},
  catcher:function(st,easy){var hx=112,it=[],got=0,need=4,tm=.3,sp=44+st*3;
   return {move:true,txt:'Mova para PEGAR '+need+' itens!',
    u:function(dt,inp){hx+=inp.dx*130*dt;if(inp.tx!=null){var d=inp.tx-8-hx;hx+=Math.max(-170*dt,Math.min(170*dt,d))}hx=Math.max(0,Math.min(W-16,hx));tm-=dt;if(tm<=0){it.push({x:rnd(4,W-20),y:-16});tm=rnd(.6,1.05)}
     it.forEach(function(o){o.y+=sp*dt;if(o.y>GY-22&&o.y<GY+2&&Math.abs(o.x-hx)<15&&!o.g){o.g=1;got++;inp.beep(880)}});it=it.filter(function(o){return !o.g&&o.y<H});if(got>=need)return 'win'},
    d:function(g,T,t,th){it.forEach(function(o){spr(g,th.item,o.x,o.y,t)});spr(g,th.hero,hx,GY-16,t);lab(g,T,got+'/'+need)}}},
  flappy:function(st,easy){var y=60,vy=0,pp=[],gap=(easy?70:62)-Math.min(6,st),sp=48+st*2,nx=40,pass=0,need=3;
   return {move:false,txt:'Toque para VOAR pelos vãos!',
    u:function(dt,inp){if(inp.act){vy=-118;inp.beep(660)}vy+=370*dt;y+=vy*dt;nx-=sp*dt;if(nx<=0&&pass+pp.length<need+1){pp.push({x:W,gy:rnd(24,GY-gap-14)});nx=100}
     pp.forEach(function(p){p.x-=sp*dt;if(!p.p&&p.x+18<38){p.p=1;pass++}});pp=pp.filter(function(p){return p.x>-20});
     if(y<0||y>GY-14)return 'lose';for(var i=0;i<pp.length;i++){var p=pp[i];if(p.x<52&&p.x+18>38&&(y+2<p.gy||y+12>p.gy+gap))return 'lose'}if(pass>=need)return 'win'},
    d:function(g,T,t,th){pp.forEach(function(p){var c=T.k==='sea'?['#ff6f91','#d94a72']:['#43a047','#2e7d32'];R(g,c[0],p.x,0,18,p.gy);R(g,c[0],p.x,p.gy+gap,18,GY-p.gy-gap);R(g,c[1],p.x+12,0,6,p.gy);R(g,c[1],p.x+12,p.gy+gap,6,GY-p.gy-gap);R(g,c[1],p.x-2,p.gy-6,22,6);R(g,c[1],p.x-2,p.gy+gap,22,6);R(g,'rgba(255,255,255,.35)',p.x+3,0,2,p.gy-6)});spr(g,th.hero,36,y,t);lab(g,T,pass+'/'+need)}}},
  shooter:function(st,easy){var cx=112,bl=[],tg=[],hit=0,need=3,cool=0,tm=.2;
   return {move:true,txt:'Mova e TOQUE para atirar em '+need+' alvos!',
    u:function(dt,inp){cx+=inp.dx*130*dt;if(inp.tx!=null){var d=inp.tx-8-cx;cx+=Math.max(-170*dt,Math.min(170*dt,d))}cx=Math.max(0,Math.min(W-16,cx));cool-=dt;if(inp.act&&cool<=0){bl.push({x:cx+7,y:GY-18});cool=.28;inp.beep(990)}
     tm-=dt;if(tm<=0&&tg.length<2+(st>5?1:0)){tg.push({x:Math.random()<.5?-16:W,y:[26,48,70][(Math.random()*3)|0],v:(Math.random()<.5?1:-1)*(28+st*3)});tm=1}
     tg.forEach(function(o){o.x+=o.v*dt});bl.forEach(function(b){b.y-=180*dt});
     bl.forEach(function(b){tg.forEach(function(o){if(!o.h&&!b.h&&b.x>o.x&&b.x<o.x+16&&b.y>o.y&&b.y<o.y+16){o.h=1;b.h=1;hit++;inp.beep(300)}})});
     tg=tg.filter(function(o){return !o.h&&o.x>-20&&o.x<W+4});bl=bl.filter(function(b){return !b.h&&b.y>-4});if(hit>=need)return 'win'},
    d:function(g,T,t,th){tg.forEach(function(o){spr(g,th.item,o.x,o.y,t)});bl.forEach(function(b){R(g,'#fff',b.x-1,b.y,2,7);R(g,'#ffd54f',b.x-1,b.y+6,2,3)});spr(g,th.hero,cx,GY-16,t);lab(g,T,hit+'/'+need)}}},
  dodge:function(st,easy){var hx=112,rk=[],T0=5+st*.3,t0=0,tm=.4,sp=50+st*4;
   return {move:true,txt:'Mova para DESVIAR por '+Math.round(T0)+' segundos!',
    u:function(dt,inp){hx+=inp.dx*135*dt;if(inp.tx!=null){var d=inp.tx-8-hx;hx+=Math.max(-175*dt,Math.min(175*dt,d))}hx=Math.max(0,Math.min(W-16,hx));t0+=dt;tm-=dt;if(tm<=0&&t0<T0-1.4){rk.push({x:rnd(0,W-18),y:-16});tm=rnd(.5,.95)/(easy?.8:1)}
     rk.forEach(function(o){o.y+=sp*dt;if(o.y>GY-28&&o.y<GY&&Math.abs(o.x+8-(hx+8))<10)o.hit=1});if(rk.some(function(o){return o.hit}))return 'lose';rk=rk.filter(function(o){return o.y<H});if(t0>=T0)return 'win'},
    d:function(g,T,t,th){rk.forEach(function(o){spr(g,th.obs,o.x,o.y,t)});spr(g,th.hero,hx,GY-16,t);bar(g,T,t0/T0)}}}
 };
 /* id, nome, ícone, descrição, mecânica, tema, herói, obstáculo, item */
 var DEFS=[
  ['gbc-cofre','Corrida do Cofre','🏃','Pule os obstáculos e abra o portão com a resposta certa','runner','campo','kid','rock','coin'],
  ['gbc-ninja','Ninja dos Telhados','🥷','Corra pela cidade e passe pelo portão respondendo','runner','noite','ninja','spike','coin'],
  ['gbc-dino','Dino Estudioso','🦖','O dino corre; só passa quem acerta a pergunta','runner','deserto','dino','rock','apple'],
  ['gbc-moedas','Chuva de Moedas','🪙','Pegue as moedas e responda para avançar','catcher','deserto','kid','coin','coin'],
  ['gbc-pomar','Pomar Matemático','🍎','Colha as maçãs e abra o portão do pomar','catcher','campo','kid','apple','apple'],
  ['gbc-pesca','Pescaria Numérica','🎣','Pesque os peixes e responda a pergunta','catcher','mar','sub','fish','fish'],
  ['gbc-foguete','Foguete Estelar','🚀','Voe pelos vãos e responda no portão estelar','flappy','espaco','ship','rock','star'],
  ['gbc-passaro','Passarinho Sábio','🐦','Bata asas pelos canos e responda','flappy','campo','bird','rock','coin'],
  ['gbc-submarino','Submarino Veloz','🌊','Navegue pelos corais e responda','flappy','mar','sub','rock','fish'],
  ['gbc-alvo','Tiro ao Alvo','🎯','Acerte os alvos e passe de fase respondendo','shooter','rosa','kid','target','target'],
  ['gbc-nave','Defesa da Nave','🛸','Atire nos invasores e responda','shooter','espaco','ship','ghost','ghost'],
  ['gbc-fantasmas','Caça-Fantasmas','👻','Capture os fantasmas e responda','shooter','caverna','kid','ghost','ghost'],
  ['gbc-meteoros','Desvio de Meteoros','☄️','Desvie das rochas e abra o portão','dodge','espaco','ship','meteor','star'],
  ['gbc-vulcao','Fuga do Vulcão','🌋','Fuja das pedras e responda','dodge','deserto','kid','meteor','rock'],
  ['gbc-labirinto','Pedras da Caverna','⛏️','Desvie das pedras da caverna e responda','dodge','caverna','kid','rock','coin']
 ];
 function mk(d){window.RBX_JOGOS[d[0]]={nome:d[1]+' '+d[2],icone:d[2],desc:d[3],start:function(api){run(d,api)}}}
 function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
 function run(d,api){
  var th={hero:d[6],obs:d[7],item:d[8]},T=TH[d[5]],easy=api.easy&&api.easy();
  var BTN='font:900 clamp(15px,3.8vw,22px) monospace;padding:14px 6px;border:4px solid '+T.ui+';border-radius:12px;background:'+T.bd+';color:'+T.tx+';box-shadow:0 4px 0 '+T.ui;
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:linear-gradient(#000,'+T.ui+');display:flex;flex-direction:column;align-items:center;font-family:"Courier New",monospace;color:#fff;user-select:none;-webkit-user-select:none;touch-action:manipulation;overflow:auto';
  o.innerHTML='<div style="display:flex;align-items:center;gap:8px;width:min(98vw,640px);padding:6px 4px;font-weight:900"><span style="flex:1;font-size:15px">'+esc(d[1])+' '+d[2]+'</span><span id="gv" style="font-size:16px"></span><span id="gf" style="background:'+T.ui2+';color:'+T.ui+';padding:3px 8px;border-radius:6px;font-size:13px"></span><button id="gx" type="button" style="font:900 14px monospace;padding:6px 10px;border:3px solid '+T.ui2+';background:'+T.ui+';color:#fff;border-radius:8px">✕ Sair</button></div>'+
   '<div id="gw" style="position:relative;width:min(98vw,calc((100vh - 270px)*240/160),640px);aspect-ratio:240/160;flex:none"><canvas id="gc" width="240" height="160" style="width:100%;height:100%;image-rendering:pixelated;border:6px solid #111;outline:3px solid '+T.ui2+';border-radius:12px;display:block;touch-action:none;background:#000"></canvas>'+
   '<div id="gm" style="position:absolute;left:10px;right:10px;bottom:10px;display:none;justify-content:space-between;pointer-events:none"><button id="gl" type="button" style="pointer-events:auto;width:62px;height:62px;border-radius:50%;border:3px solid #fff;background:rgba(0,0,0,.45);font:900 26px monospace;color:#fff">◀</button><button id="gr" type="button" style="pointer-events:auto;width:62px;height:62px;border-radius:50%;border:3px solid #fff;background:rgba(0,0,0,.45);font:900 26px monospace;color:#fff">▶</button></div></div>'+
   '<div id="gq" style="width:min(98vw,640px);padding:8px 4px 14px;text-align:center"></div>';
  document.body.appendChild(o);
  var TL=window.RBX_TILT?RBX_TILT(o.firstChild):{dx:function(){return 0},edgeY:function(){return 0},destroy:function(){}};
  var $=function(i){return o.querySelector('#'+i)},cv=$('gc'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  var erros=0,st=1,vidas=VIDAS,fase='act',mech=null,qd=null,tt=0,last=performance.now(),raf=0,alive=true,AC=null,msg='',msgT=0,passT=0,acertos=0;
  var inp={act:false,dx:0,tx:null,beep:beep},keys={},btn={l:0,r:0},pdown=false;
  function beep(f,dur){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var os=AC.createOscillator(),v=AC.createGain();os.type='square';os.frequency.value=f;v.gain.value=.05;os.connect(v);v.connect(AC.destination);os.start();os.stop(AC.currentTime+(dur||.08))}catch(e){}}
  function hud(){$('gv').textContent=erros?'❌ '+erros:'';$('gf').textContent='FASE '+Math.min(st,FASES)+'/'+FASES}
  function novaAcao(){mech=MECH[d[4]](st,easy);fase='act';$('gm').style.display=mech.move?'flex':'none';$('gq').innerHTML='<div style="font-size:16px;font-weight:900;padding:10px;background:'+T.ui2+';color:'+T.ui+';border-radius:12px">🎮 '+esc(mech.txt)+'</div>'}
  function perg(){
   var topics=(api.topics&&api.topics())||['Geral'];var tp=topics[(Math.random()*topics.length)|0];var q;
   try{q=api.B.make(api.ANO||6,tp,api.tier?api.tier():1)}catch(e){q=null}
   if(!q||q.a==null)q={q:'Quanto é 5 + 5?',a:'10',d:['8','12','15'],e:'5 mais 5 é 10.'};
   var wr=(q.d||[]).slice().sort(function(){return Math.random()-.5}).slice(0,easy?1:3),ops=[String(q.a)].concat(wr.map(String));ops.sort(function(){return Math.random()-.5});qd={q:q,ops:ops};
   fase='ask';$('gm').style.display='none';
   $('gq').innerHTML='<div style="background:'+T.bd+';color:'+T.tx+';border:5px solid '+T.ui2+';border-radius:14px;padding:10px;font-size:clamp(15px,3.6vw,22px);font-weight:900;line-height:1.3;margin-bottom:8px">🚪 '+esc(q.q)+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+ops.map(function(x,i){return '<button type="button" data-i="'+i+'" style="'+BTN+'">'+esc(x)+'</button>'}).join('')+'</div>';
  }
  function resp(i){
   if(fase!=='ask')return;var ok=qd.ops[i]===String(qd.q.a);fase='fb';
   var bs=$('gq').querySelectorAll('button');bs.forEach(function(b,k){b.disabled=true;if(qd.ops[k]===String(qd.q.a)){b.style.background='#2e9e3e';b.style.color='#fff'}});
   try{api.log&&api.log(qd.q,ok,1)}catch(e){}
   if(ok){beep(660,.1);setTimeout(function(){beep(990,.12)},110);try{api.gain&&api.gain(10,1)}catch(e){}acertos++;passT=0;fase='pass';msg='PORTÃO ABERTO!';msgT=1}
   else{bs[i].style.background='#c0392b';bs[i].style.color='#fff';beep(140,.3);erros++;hud();var ex=qd.q.e?'<div style="margin-top:8px;font-size:14px;font-weight:700;background:'+T.bd+';color:'+T.tx+';border-radius:8px;padding:8px">💡 '+esc(qd.q.e)+'</div>':'';$('gq').insertAdjacentHTML('beforeend',ex);
    setTimeout(function(){if(!alive)return;novaAcao()},ex?2600:1300)}
  }
  function fim(win){fase='end';$('gm').style.display='none';$('gq').innerHTML='<div style="background:'+T.bd+';color:'+T.tx+';border:5px solid '+T.ui2+';border-radius:16px;padding:16px;font-weight:900"><div style="font-size:26px">'+(win?'🏆 Você zerou!':'💔 Fim de jogo')+'</div><div style="font-size:16px;margin:8px 0">Respostas certas: '+acertos+' · Fase '+Math.min(st,FASES)+'/'+FASES+'</div><button id="ga" type="button" style="'+BTN+';padding:12px 16px">↻ Jogar de novo</button> <button id="gs" type="button" style="'+BTN+';padding:12px 16px">Sair</button></div>';if(win){beep(523,.1);setTimeout(function(){beep(659,.1)},120);setTimeout(function(){beep(784,.2)},240)}}
  function sair(){alive=false;try{TL.destroy()}catch(e){}cancelAnimationFrame(raf);removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);o.remove();try{api.onClose&&api.onClose()}catch(e){}}
  function reinicia(){st=1;vidas=VIDAS;erros=0;acertos=0;hud();novaAcao()}
  function kd(e){if(!alive)return;var k=e.key;if(/^[1-4]$/.test(k)&&fase==='ask'){resp(+k-1);e.preventDefault();e.stopPropagation();return}if(k==='Escape'){sair();return}
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','w'].indexOf(k)>=0){e.preventDefault();e.stopPropagation();if(!keys[k]&&(k===' '||k==='ArrowUp'||k==='w'))inp.act=true;keys[k]=1}}
  function ku(e){if(keys[e.key]){delete keys[e.key];e.stopPropagation()}}
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  $('gx').onclick=sair;
  $('gq').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.id==='ga')return reinicia();if(b.id==='gs')return sair();if(b.dataset.i!==undefined)resp(+b.dataset.i)});
  function wx(e){var r=cv.getBoundingClientRect();return (e.clientX-r.left)/r.width*W}
  cv.addEventListener('pointerdown',function(e){pdown=true;inp.act=true;if(mech&&mech.move)inp.tx=wx(e);try{cv.setPointerCapture(e.pointerId)}catch(x){}});
  cv.addEventListener('pointermove',function(e){if(pdown&&mech&&mech.move)inp.tx=wx(e)});
  ['pointerup','pointercancel'].forEach(function(n){cv.addEventListener(n,function(){pdown=false;inp.tx=null})});
  [['gl','l'],['gr','r']].forEach(function(p){var b=$(p[0]);b.addEventListener('pointerdown',function(e){btn[p[1]]=1;e.stopPropagation()});['pointerup','pointerleave','pointercancel'].forEach(function(n){b.addEventListener(n,function(){btn[p[1]]=0})})});
  var gpPrev=false;
  function pad(){try{var gp=(navigator.getGamepads&&navigator.getGamepads()[0]);if(!gp)return 0;var x=gp.axes[0]||0;if(gp.buttons[14]&&gp.buttons[14].pressed)x=-1;if(gp.buttons[15]&&gp.buttons[15].pressed)x=1;var a=gp.buttons[0]&&gp.buttons[0].pressed;if(a&&!gpPrev)inp.act=true;gpPrev=!!a;return Math.abs(x)>.3?x:0}catch(e){return 0}}
  function loop(now){
   if(!alive)return;raf=requestAnimationFrame(loop);var dt=Math.min(.04,(now-last)/1000||0);last=now;tt+=dt;
   var px=pad();inp.dx=((keys.ArrowRight||keys.d)?1:0)-((keys.ArrowLeft||keys.a)?1:0)+btn.r-btn.l+px+TL.dx();if(inp.dx>1)inp.dx=1;if(inp.dx<-1)inp.dx=-1;
   bg(g,T,tt);
   if(fase==='act'&&mech){var r=mech.u(dt,inp);mech.d(g,T,tt,th);
    if(r==='win'){beep(784,.12);perg()}else if(r==='lose'){beep(160,.25);msg='OPS! Tente de novo';msgT=1.1;mech=MECH[d[4]](st,easy)}}
   else{
    var gx=W-52,open=fase==='pass'?Math.min(1,passT/.5):0;
    R(g,'#3b2a1a',gx-3,GY-50,34,50);R(g,'#7a5230',gx,GY-47,28,47);R(g,'#2a1c10',gx+(open?2:0)+Math.round(24*open*0),GY-44,24,44);
    if(open<1){R(g,'#a87444',gx+2,GY-45,24*(1-open),43);R(g,'#ffd23f',gx+20*(1-open),GY-26,3,3);g.font='bold 24px monospace';g.fillStyle='#fff';if(open===0)g.fillText('?',gx+9,GY-20)}
    else{R(g,'#ffe9a8',gx+2,GY-45,24,43)}
    var hx=fase==='pass'?30+Math.min(1,passT/1)*(W-100):90+Math.sin(tt*3)*4;spr(g,th.hero,hx,GY-16,tt);
    if(fase==='pass'){passT+=dt;if(passT>1.15){st++;hud();if(st>FASES)fim(true);else novaAcao()}}}
   inp.act=false;
   if(msgT>0){msgT-=dt;R(g,'rgba(0,0,0,.65)',50,60,140,30);g.fillStyle='#fff';g.font='bold 13px monospace';g.textAlign='center';g.fillText(msg,120,80);g.textAlign='left'}
  }
  hud();novaAcao();raf=requestAnimationFrame(loop);
 }
 DEFS.forEach(mk);
})();
