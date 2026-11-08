/* RobIox — 5 minijogos estilo Nintendo DS (duas telas). Tela de cima: jogo de verdade (toque/arraste/teclado).
   Tela de baixo: a pergunta aparece desde o início, mas só pode ser respondida DEPOIS de concluir a fase. */
(function(){
 window.RBX_JOGOS=window.RBX_JOGOS||{};
 var W=256,H=192,FASES=10,VIDAS=5;
 function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
 function rr(g,x,y,w,h,r,c){g.fillStyle=c;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fill()}
 function circ(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
 function grad(g,c1,c2,y0,y1){var gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr}
 function em(g,e,x,y,s,flip){g.save();g.fillStyle='#000';g.globalAlpha=1;g.font=s+'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",serif';g.textAlign='center';g.textBaseline='middle';g.translate(x,y);if(flip)g.scale(-1,1);g.fillText(e,0,0);g.restore()}
 function shadow(g,x,y,w){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,w,w*.28,0,0,7);g.fill()}
 function cloud(g,x,y,s){g.fillStyle='rgba(255,255,255,.92)';[[0,0,12],[12,-4,15],[26,0,12],[13,5,13]].forEach(function(c){g.beginPath();g.arc(x+c[0]*s,y+c[1]*s,c[2]*s,0,7);g.fill()})}
 function rnd(a,b){return a+Math.random()*(b-a)}
 function person(g,x,y,shirt,t,s){s=s||1;var w=Math.sin(t*10)*3*s;g.fillStyle='#2b3a67';g.fillRect(x-4*s,y+4*s,3*s,10*s+w);g.fillRect(x+1*s,y+4*s,3*s,10*s-w);rr(g,x-6*s,y-10*s,12*s,16*s,4*s,shirt);circ(g,x,y-16*s,6*s,'#f2c294');g.fillStyle='#5a3418';g.beginPath();g.arc(x,y-18*s,6*s,Math.PI,0);g.fill();g.fillStyle='#111';g.fillRect(x+1*s,y-17*s,2*s,2*s)}
 function kart(g,x,y,c,t,me){shadow(g,x+20,y+24,24);circ(g,x+8,y+22,6,'#222');circ(g,x+32,y+22,6,'#222');circ(g,x+8,y+22,2.5,'#aaa');circ(g,x+32,y+22,2.5,'#aaa');rr(g,x,y+8,42,15,6,c);rr(g,x+16,y,16,13,6,c);circ(g,x+24,y+3,6,me?'#f2c294':'#e8d0b0');rr(g,x+18,y-3,12,5,3,'#fff');g.fillStyle='rgba(255,255,255,.4)';g.fillRect(x+4,y+11,30,3)}
 /* ===== mecânicas: u(dt,inp) devolve 'win' ao concluir; d(g,t) desenha ===== */
 var MECH={
  kart:function(st,easy){var lanes=[104,134,164],li=1,y=lanes[1],dist=0,goal=520+st*40,sp=95+st*5,ob=[],bo=[],tm=.5,slow=0,boost=0,riv=[{x:90,l:0,c:'#2e86de',v:.84},{x:140,l:2,c:'#27ae60',v:.76}],flash=0;
   return {txt:'🏎️ TOQUE na pista (ou use ↑↓) para trocar de faixa, desvie dos cones e chegue ao fim!',
    u:function(dt,inp){if(inp.py!=null&&inp.tap){var best=0;for(var i=1;i<3;i++)if(Math.abs(lanes[i]-inp.py+10)<Math.abs(lanes[best]-inp.py+10))best=i;li=best}if(inp.up)li=Math.max(0,li-1);if(inp.dn)li=Math.min(2,li+1);y+=(lanes[li]-y)*Math.min(1,dt*12);
     var v=sp*(slow>0?.45:1)*(boost>0?1.5:1);slow-=dt;boost-=dt;flash-=dt;dist+=v*dt;tm-=dt;if(tm<=0&&dist<goal-120){var l=(Math.random()*3)|0;if(Math.random()<.22)bo.push({x:W+10,l:l});else ob.push({x:W+10,l:l});tm=rnd(.45,.9)}
     ob.forEach(function(o){o.x-=v*dt;if(!o.h&&o.x<60&&o.x>26&&o.l===li){o.h=1;slow=1;flash=.5;inp.beep(150,.2,'sawtooth')}});bo.forEach(function(o){o.x-=v*dt;if(!o.h&&o.x<66&&o.x>24&&o.l===li){o.h=1;boost=1.4;inp.beep(990,.12)}});
     ob=ob.filter(function(o){return o.x>-20});bo=bo.filter(function(o){return o.x>-20&&!o.h});riv.forEach(function(r){r.x=60+dist/goal*r.v*150+Math.sin(dist/30+r.l)*6});this.p=dist/goal;if(dist>=goal)return 'win'},
    d:function(g,t){grad(g,'#59b8ff','#d8f1ff',0,88);g.fillRect(0,0,W,88);cloud(g,((t*8)%330)-40,24,1);cloud(g,((t*5+140)%330)-40,48,.8);
     g.fillStyle='#4fae5d';g.beginPath();g.moveTo(0,88);for(var i=0;i<=W;i+=16)g.lineTo(i,68+Math.sin(i*.05+dist*.01)*10);g.lineTo(W,88);g.fill();grad(g,'#5d5d6a','#3a3a44',88,H);g.fillRect(0,88,W,H-88);
     g.fillStyle='#fff';for(var k=0;k<2;k++){var yy=119+k*30;for(var x=-((dist*1.2)%44);x<W;x+=44)g.fillRect(x,yy,22,3)}g.fillStyle='#d33';g.fillRect(0,88,W,3);
     if(dist>goal-200){var fx=W-(dist-(goal-200));for(var r=0;r<14;r++){g.fillStyle=r%2?'#000':'#fff';g.fillRect(fx,90+r*6,6,6);g.fillRect(fx+6,90+((r+1)%2)*0+r*6,6,6)}}
     riv.forEach(function(r){kart(g,r.x,lanes[r.l]-10,r.c,t)});ob.forEach(function(o){var oy=lanes[o.l]+8;g.fillStyle='#ff7a00';g.beginPath();g.moveTo(o.x,oy+10);g.lineTo(o.x+8,oy-12);g.lineTo(o.x+16,oy+10);g.fill();g.fillStyle='#fff';g.fillRect(o.x+4,oy-2,8,3)});
     bo.forEach(function(o){em(g,'⭐',o.x+8,lanes[o.l]+4,20)});if(boost>0){g.fillStyle='rgba(255,220,80,.6)';for(var s=0;s<4;s++)g.fillRect(14-s*10,y+14+s*3,10,3)}
     g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;kart(g,34,y-10,'#e74c3c',t,true);g.globalAlpha=1;rr(g,8,8,W-16,6,3,'rgba(0,0,0,.45)');rr(g,9,9,Math.max(2,(W-18)*Math.min(1,dist/goal)),4,2,'#ffd23f')}}},
  cozinha:function(st,easy){var px=128,it=[],got=0,need=6,tm=.4,sp=62+st*5,ing=['🥕','🍅','🧅','🥔','🌽','🍄'],flash=0,spills=0;
   return {txt:'🍲 ARRASTE a panela (ou use ← →) para pegar os ingredientes. Cuidado com o fogo 🔥!',
    u:function(dt,inp){if(inp.px!=null&&inp.down)px+=(inp.px-px)*Math.min(1,dt*14);px+=inp.dx*150*dt;px=Math.max(22,Math.min(W-22,px));tm-=dt;if(tm<=0){it.push({x:rnd(16,W-16),y:-16,bad:Math.random()<.22,e:ing[(Math.random()*ing.length)|0]});tm=rnd(.5,.9)}
     it.forEach(function(o){o.y+=sp*dt;if(!o.g&&o.y>128&&o.y<150&&Math.abs(o.x-px)<26){o.g=1;if(o.bad){got=Math.max(0,got-1);flash=.5;inp.beep(150,.2,'sawtooth')}else{got++;inp.beep(880)}}});it=it.filter(function(o){return !o.g&&o.y<H+10});this.p=got/need;flash-=dt;if(got>=need)return 'win'},
    d:function(g,t){grad(g,'#ffe3b8','#ffc27a',0,H);g.fillRect(0,0,W,H);for(var i=0;i<6;i++){rr(g,10+i*40,10,32,36,4,'#fff8e6');g.fillStyle='#e0c9a0';g.fillRect(14+i*40,16,24,3)}g.fillStyle='#c97b3a';g.fillRect(0,160,W,32);g.fillStyle='#e8a05a';g.fillRect(0,160,W,5);
     it.forEach(function(o){em(g,o.bad?'🔥':o.e,o.x,o.y,24)});shadow(g,px,172,32);rr(g,px-26,144,52,26,10,'#555a63');rr(g,px-30,140,60,9,4,'#7b818c');for(var j=0;j<got;j++)circ(g,px-18+j*7,147,4,['#f39c12','#e74c3c','#ecf0f1','#d4a373','#f1c40f','#a98467'][j%6]);
     for(var s=0;s<3;s++){g.fillStyle='rgba(255,255,255,'+(.5-((t*30+s*20)%50)/120)+')';g.beginPath();g.arc(px-10+s*10,138-((t*30+s*20)%50),5,0,7);g.fill()}
     if(flash>0){g.fillStyle='rgba(255,60,0,.25)';g.fillRect(0,0,W,H)}g.font='bold 14px system-ui';g.fillStyle='#4a2a10';g.fillText('🍲 '+got+'/'+need,10,26)}}},
  montanha:function(st,easy){var side=0,step=0,goal=14+Math.floor(st/2),rocks=[],tm=1.2,flash=0,cxs=[84,172];
   return {txt:'🧗 Toque ALTERNADO: esquerda, direita, esquerda… (ou ← →) para escalar! Desvie das pedras.',
    u:function(dt,inp){var want=-1;if(inp.tap&&inp.px!=null)want=inp.px<W/2?0:1;if(inp.l)want=0;if(inp.r)want=1;if(want>=0&&want!==side){side=want;step++;inp.beep(500+step*20,.06)}
     tm-=dt;if(tm<=0){rocks.push({c:Math.random()<.55?side:1-side,y:-14});tm=rnd(.9,1.6)/(easy?.8:1)}
     rocks.forEach(function(r){r.y+=(85+st*6)*dt;if(!r.h&&r.c===side&&r.y>112&&r.y<140){r.h=1;step=Math.max(0,step-3);flash=.6;inp.beep(120,.25,'sawtooth')}});rocks=rocks.filter(function(r){return r.y<H+10});flash-=dt;this.p=step/goal;if(step>=goal)return 'win'},
    d:function(g,t){var off=step*18;grad(g,'#6ec6ff','#e0f4ff',0,H);g.fillRect(0,0,W,H);cloud(g,((t*6)%330)-40,30,1);g.fillStyle='#7d8798';g.fillRect(40,0,176,H);g.fillStyle='#6a7486';for(var r=-1;r<12;r++){for(var c=0;c<4;c++){var yy=((r*26+off)%312)-26,xx=40+c*44+(r%2?22:0);g.fillRect(xx+2,yy+2,40,22)}}g.fillStyle='rgba(0,0,0,.2)';g.fillRect(40,0,4,H);g.fillRect(212,0,4,H);
     for(var k=0;k<2;k++){for(var h=0;h<8;h++)rr(g,cxs[k]-5,((h*26+off)%208)-6,10,6,3,'#caa46a')}
     if(goal-step<7){var fy=70-(goal-step)*0+((goal-step)*0);var ty=100-(7-(goal-step))*0;g.fillStyle='#fff';g.fillRect(40,Math.max(0,60-(7-(goal-step))*0),176,6);em(g,'🚩',128,Math.max(8,70-(7-(goal-step))*4),22)}
     rocks.forEach(function(r){circ(g,cxs[r.c],r.y,9,'#555');circ(g,cxs[r.c]-3,r.y-3,4,'#888')});
     g.globalAlpha=flash>0&&((t*20)|0)%2?.4:1;var cx=cxs[side];g.strokeStyle='#caa46a';g.lineWidth=3;person(g,cx+(side?-12:12),122,'#e67e22',t,.9);g.globalAlpha=1;rr(g,8,8,W-16,6,3,'rgba(0,0,0,.45)');rr(g,9,9,Math.max(2,(W-18)*Math.min(1,step/goal)),4,2,'#ffd23f')}}},
  batalha:function(st,easy){var m=0,dir=1,zc=.5,zw=Math.max(.1,.24-st*.012),hits=0,need=3,lunge=0,miss=0,boss=['👾','👹','🐲','🦖','🧟','👻','🦑','🤖','🐙','👿'][Math.min(9,st)],sp=.95+st*.07;
   function nz(){zc=rnd(zw/2+.05,1-zw/2-.05)}nz();
   return {txt:'⚔️ TOQUE (ou ESPAÇO) quando a barra passar pela ZONA VERDE para atacar! Acerte 3 golpes.',
    u:function(dt,inp){m+=dir*sp*dt;if(m>1){m=1;dir=-1}if(m<0){m=0;dir=1}lunge-=dt;miss-=dt;if(inp.tap||inp.act){if(Math.abs(m-zc)<=zw/2){hits++;lunge=.5;inp.beep(700,.1);nz()}else{miss=.4;inp.beep(150,.2,'sawtooth')}}this.p=hits/need;if(hits>=need)return 'win'},
    d:function(g,t){grad(g,'#3a2a5a','#9a5a8a',0,H);g.fillRect(0,0,W,H);for(var i=0;i<18;i++){g.fillStyle='rgba(255,255,255,.7)';g.fillRect((i*47)%W,(i*23)%90,2,2)}g.fillStyle='#2c1e44';g.fillRect(0,120,W,72);
     var hp=Math.max(0,1-hits/need),sh=lunge>.25?Math.sin(t*70)*4:0;shadow(g,186,126,34);em(g,boss,186+sh,84+Math.sin(t*3)*3,60);rr(g,130,14,112,12,6,'rgba(0,0,0,.5)');rr(g,132,16,Math.max(2,108*hp),8,4,hp>.5?'#2ecc71':hp>.25?'#f1c40f':'#e74c3c');
     var ax=lunge>0?Math.sin((.5-lunge)/.5*3.14)*90:0;shadow(g,58,126,22);em(g,'🦸',58+ax,92,44);if(lunge>.2)em(g,'💥',160,84,30);
     rr(g,20,150,216,20,10,'rgba(0,0,0,.55)');rr(g,20+216*(zc-zw/2),152,216*zw,16,8,'#2ecc71');rr(g,20+216*m-3,146,6,28,3,miss>0?'#e74c3c':'#fff');g.font='bold 12px system-ui';g.fillStyle='#fff';g.fillText('Golpes '+hits+'/'+need,10,186)}}},
  castelo:function(st,easy){var bw=104,blocks=[{x:76,w:bw}],mx=0,md=1,mw=bw,need=6,sp=70+st*7,fall=[],bh=14,flash=0,top=150;
   function fresh(){blocks=[{x:76,w:bw}];mw=bw;mx=0;md=1;fall=[]}
   return {txt:'🏰 TOQUE (ou ESPAÇO) para soltar o bloco. Empilhe 6 blocos alinhados!',
    dbg:function(){return {mx:mx,mw:mw,top:blocks[blocks.length-1]}},
    u:function(dt,inp){mx+=md*(sp+blocks.length*6)*dt;if(mx>W-mw){mx=W-mw;md=-1}if(mx<0){mx=0;md=1}flash-=dt;fall.forEach(function(f){f.y+=220*dt;f.v+=dt});fall=fall.filter(function(f){return f.y<H+20});
     if(inp.tap||inp.act){var tp=blocks[blocks.length-1],l=Math.max(mx,tp.x),r=Math.min(mx+mw,tp.x+tp.w),ov=r-l;if(ov<8){fall.push({x:mx,w:mw,y:top-(blocks.length+1)*bh,c:blocks.length});inp.beep(130,.3,'sawtooth');flash=.6;fresh()}else{if(mx<tp.x)fall.push({x:mx,w:tp.x-mx,y:top-(blocks.length+1)*bh,c:blocks.length});if(mx+mw>tp.x+tp.w)fall.push({x:tp.x+tp.w,w:mx+mw-(tp.x+tp.w),y:top-(blocks.length+1)*bh,c:blocks.length});blocks.push({x:l,w:ov});mw=ov;inp.beep(500+blocks.length*60,.08);mx=Math.max(0,Math.min(W-mw,mx))}}
     this.p=(blocks.length-1)/need;if(blocks.length-1>=need)return 'win'},
    d:function(g,t){grad(g,'#8fd3ff','#ffe9b8',0,H);g.fillRect(0,0,W,H);cloud(g,((t*5)%330)-40,26,1);g.fillStyle='#5cb85c';g.fillRect(0,top,W,H-top);g.fillStyle='#4aa04a';g.fillRect(0,top,W,5);var cols=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#e91e63'];
     blocks.forEach(function(b,i){rr(g,b.x,top-(i+1)*bh,b.w,bh-1,3,cols[i%7]);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(b.x+3,top-(i+1)*bh+2,b.w-6,2)});fall.forEach(function(f){rr(g,f.x,f.y,f.w,bh-1,3,cols[f.c%7])});
     var yy=top-(blocks.length+1)*bh-26;g.strokeStyle='#555';g.lineWidth=2;g.beginPath();g.moveTo(mx+mw/2,0);g.lineTo(mx+mw/2,yy);g.stroke();rr(g,mx,yy,mw,bh-1,3,cols[blocks.length%7]);if(flash>0){g.fillStyle='rgba(255,60,0,.25)';g.fillRect(0,0,W,H)}
     g.font='bold 14px system-ui';g.fillStyle='#4a2a10';g.fillText('🧱 '+(blocks.length-1)+'/'+need,10,22);if(blocks.length-1>=need)em(g,'🏰',128,top-(blocks.length)*bh-18,34)}}}
 };
 var DEFS=[
  ['ds-kart','Kart Matemático','🏎️','Corra de kart desviando dos cones; ao chegar, responda para a próxima pista','kart','#e74c3c','#ffe0dc'],
  ['ds-cozinha','Cozinha Mestre','🍲','Pegue os ingredientes com a panela e responda para a próxima receita','cozinha','#e67e22','#ffe9cf'],
  ['ds-montanha','Escalada da Montanha','🧗','Escale tocando alternado, desvie das pedras e responda no topo','montanha','#2980b9','#dff0ff'],
  ['ds-batalha','Batalha de Monstros','👾','Acerte o tempo dos golpes para vencer o monstro e responda','batalha','#8e44ad','#f0e0ff'],
  ['ds-castelo','Construtor de Castelo','🏰','Empilhe os blocos alinhados e responda para subir de fase','castelo','#27ae60','#e2f9e8']
 ];
 DEFS.forEach(function(d){window.RBX_JOGOS[d[0]]={nome:d[1]+' '+d[2],icone:d[2],desc:d[3],start:function(api){run(d,api)}}});
 function run(d,api){
  var C=d[5],L=d[6],easy=api.easy&&api.easy();
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#2b2b33;display:flex;flex-direction:column;align-items:center;font-family:system-ui,Arial,sans-serif;color:#fff;user-select:none;-webkit-user-select:none;touch-action:manipulation;overflow:auto';
  var sw='min(96vw,calc((100vh - 330px)*256/192),520px)';
  o.innerHTML='<div style="display:flex;align-items:center;gap:8px;width:min(98vw,540px);padding:6px 6px;font-weight:900"><span style="flex:1;font-size:15px">'+esc(d[1])+' '+d[2]+'</span><span id="dv" style="font-size:16px"></span><span id="df" style="background:'+C+';padding:3px 9px;border-radius:99px;font-size:13px"></span><button id="dx" type="button" style="font:900 14px Arial;padding:6px 10px;border:2px solid #fff;background:#444;color:#fff;border-radius:8px">✕ Sair</button></div>'+
   '<div style="background:#3a3a44;border-radius:18px 18px 8px 8px;padding:10px;box-shadow:0 6px 18px #000a"><div style="width:'+sw+';aspect-ratio:256/192;background:#000;border-radius:6px;overflow:hidden;box-shadow:inset 0 0 0 3px #111"><canvas id="dc" width="256" height="192" style="width:100%;height:100%;display:block;touch-action:none"></canvas></div></div>'+
   '<div style="width:90px;height:12px;background:linear-gradient(#555,#222);border-radius:0 0 8px 8px;margin-bottom:-1px"></div>'+
   '<div style="background:#3a3a44;border-radius:8px 8px 18px 18px;padding:10px;box-shadow:0 6px 18px #000a;width:'+sw+';max-width:520px;box-sizing:content-box"><div id="dqi" style="background:'+L+';color:#222;border-radius:6px;padding:10px;min-height:150px"></div></div><div style="height:16px;flex:none"></div>';
  document.body.appendChild(o);
  var TL=window.RBX_TILT?RBX_TILT(o.firstChild):{dx:function(){return 0},edgeY:function(){return 0},destroy:function(){}};
  var $=function(i){return o.querySelector('#'+i)},cv=$('dc'),g=cv.getContext('2d');
  var erros=0,st=0,vidas=VIDAS,tt=0,last=performance.now(),raf=0,alive=true,qd=null,fase='act',acertos=0,AC=null,msg='',msgT=0,mech=null,locked=true;
  var inp={tap:false,act:false,dx:0,up:false,dn:false,l:false,r:false,px:null,py:null,down:false,beep:beep},keys={};
  function beep(f,dur,ty){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var os=AC.createOscillator(),v=AC.createGain();os.type=ty||'triangle';os.frequency.value=f;v.gain.value=.07;os.connect(v);v.connect(AC.destination);os.start();os.stop(AC.currentTime+(dur||.1))}catch(e){}}
  function hud(){$('dv').textContent=erros?'❌ '+erros:'';$('df').textContent='FASE '+Math.min(st+1,FASES)+'/'+FASES}
  function banner(){return locked?'<div id="dbn" style="font-weight:900;font-size:13px;padding:6px 8px;margin-bottom:8px;border-radius:8px;background:#fff;color:#555">🔒 Complete a fase na tela de cima para liberar a resposta</div>':'<div id="dbn" style="font-weight:900;font-size:13px;padding:6px 8px;margin-bottom:8px;border-radius:8px;background:#2ecc71;color:#fff">✅ Fase concluída! Responda para avançar</div>'}
  function pergunta(){
   var topics=(api.topics&&api.topics())||['Geral'];var tp=topics[(Math.random()*topics.length)|0],q;
   try{q=api.B.make(api.ANO||6,tp,api.tier?api.tier():1)}catch(e){q=null}
   if(!q||q.a==null)q={q:'Quanto é 5 + 5?',a:'10',d:['8','12','15'],e:'5 mais 5 é 10.'};
   var wr=(q.d||[]).slice().sort(function(){return Math.random()-.5}).slice(0,easy?1:3),ops=[String(q.a)].concat(wr.map(String));ops.sort(function(){return Math.random()-.5});qd={q:q,ops:ops};pintaPergunta()}
  function pintaPergunta(){var q=qd.q;$('dqi').innerHTML=banner()+'<div style="font-weight:800;font-size:clamp(15px,3.5vw,21px);line-height:1.3;margin-bottom:8px">'+esc(q.q)+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+qd.ops.map(function(x,i){return '<button type="button" data-i="'+i+'" '+(locked?'disabled':'')+' style="font:800 clamp(15px,3.6vw,21px) system-ui;padding:12px 6px;border:0;border-radius:10px;background:#fff;color:#222;opacity:'+(locked?.45:1)+';box-shadow:0 3px 0 '+C+',0 0 0 2px '+C+' inset">'+esc(x)+'</button>'}).join('')+'</div>'}
  function novaFase(){locked=true;fase='act';mech=MECH[d[4]](st,easy);mech.p=0;window.__dsm=mech;pergunta();msg=mech.txt.replace(/^[^ ]+ /,'');msgT=4}
  function liberar(){locked=false;fase='ask';msg='FASE CONCLUÍDA!';msgT=1.4;beep(784,.12);setTimeout(function(){beep(1047,.16)},120);pintaPergunta()}
  function resp(i){
   if(fase!=='ask')return;var ok=qd.ops[i]===String(qd.q.a);fase='fb';
   var bs=$('dqi').querySelectorAll('button');bs.forEach(function(b,j){b.disabled=true;if(qd.ops[j]===String(qd.q.a)){b.style.background='#2ecc71';b.style.color='#fff'}});
   try{api.log&&api.log(qd.q,ok,1)}catch(e){}
   if(ok){beep(660,.1);setTimeout(function(){beep(990,.14)},110);try{api.gain&&api.gain(10,1)}catch(e){}acertos++;st++;msg='ACERTOU!';msgT=1;setTimeout(function(){if(!alive)return;hud();if(st>=FASES)fim(true);else novaFase()},1100)}
   else{bs[i].style.background='#e74c3c';bs[i].style.color='#fff';beep(140,.3,'sawtooth');erros++;msg='ERROU! A fase recomeça';msgT=1.4;hud();var ex=qd.q.e?'<div style="margin-top:8px;font-size:14px;font-weight:700;background:#fff;border-radius:8px;padding:8px">💡 '+esc(qd.q.e)+'</div>':'';$('dqi').insertAdjacentHTML('beforeend',ex);
    setTimeout(function(){if(!alive)return;novaFase()},ex?2600:1300)}
  }
  function fim(win){fase='end';$('dqi').innerHTML='<div style="text-align:center;font-weight:900"><div style="font-size:26px">'+(win?'🏆 Você venceu!':'💔 Fim de jogo')+'</div><div style="font-size:16px;margin:8px 0">Respostas certas: '+acertos+' · Fase '+Math.min(st+1,FASES)+'/'+FASES+'</div><button id="da" type="button" style="font:900 18px Arial;padding:12px 16px;border:0;border-radius:10px;background:'+C+';color:#fff">↻ Jogar de novo</button> <button id="ds" type="button" style="font:900 18px Arial;padding:12px 16px;border:0;border-radius:10px;background:#555;color:#fff">Sair</button></div>';if(win){beep(523,.1);setTimeout(function(){beep(659,.1)},120);setTimeout(function(){beep(784,.25)},240)}}
  function sair(){alive=false;try{TL.destroy()}catch(e){}cancelAnimationFrame(raf);removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);o.remove();try{api.onClose&&api.onClose()}catch(e){}}
  function kd(e){if(!alive)return;var k=e.key;if(/^[1-4]$/.test(k)&&fase==='ask'){resp(+k-1);e.preventDefault();e.stopPropagation();return}if(k==='Escape'){sair();return}
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','a','d','w','s'].indexOf(k)>=0){e.preventDefault();e.stopPropagation();if(!keys[k]){if(k===' ')inp.act=true;if(k==='ArrowUp'||k==='w')inp.up=true;if(k==='ArrowDown'||k==='s')inp.dn=true;if(k==='ArrowLeft'||k==='a')inp.l=true;if(k==='ArrowRight'||k==='d')inp.r=true}keys[k]=1}}
  function ku(e){if(keys[e.key]){delete keys[e.key];e.stopPropagation()}}
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);$('dx').onclick=sair;
  $('dqi').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.id==='da'){st=0;vidas=VIDAS;erros=0;acertos=0;hud();return novaFase()}if(b.id==='ds')return sair();if(b.dataset.i!==undefined)resp(+b.dataset.i)});
  function pos(e){var r=cv.getBoundingClientRect();inp.px=(e.clientX-r.left)/r.width*W;inp.py=(e.clientY-r.top)/r.height*H}
  cv.addEventListener('pointerdown',function(e){inp.down=true;inp.tap=true;pos(e);try{cv.setPointerCapture(e.pointerId)}catch(x){}});
  cv.addEventListener('pointermove',function(e){if(inp.down)pos(e)});
  ['pointerup','pointercancel'].forEach(function(n){cv.addEventListener(n,function(){inp.down=false})});
  function loop(now){if(!alive)return;raf=requestAnimationFrame(loop);var dt=Math.min(.04,(now-last)/1000||0);last=now;tt+=dt;
   inp.dx=((keys.ArrowRight||keys.d)?1:0)-((keys.ArrowLeft||keys.a)?1:0)+TL.dx();if(inp.dx>1)inp.dx=1;if(inp.dx<-1)inp.dx=-1;var ey=TL.edgeY();if(ey<0)inp.up=true;if(ey>0)inp.dn=true;
   g.clearRect(0,0,W,H);
   if(mech){if(fase==='act'){var r=mech.u(dt,inp);if(r==='win'){mech.d(g,tt);liberar();}}
    mech.d(g,tt)}
   inp.tap=false;inp.act=false;inp.up=inp.dn=inp.l=inp.r=false;
   if(msgT>0){msgT-=dt;var big=fase!=='act'||msgT<1.6;g.font='bold '+(msg.length>16?11:16)+'px system-ui';var tw=Math.min(W-20,g.measureText(msg).width+24);rr(g,(W-tw)/2,14,tw,28,10,'rgba(0,0,0,.65)');g.fillStyle='#fff';g.textAlign='center';g.fillText(msg,W/2,33);g.textAlign='left'}}
  hud();novaFase();raf=requestAnimationFrame(loop);
 }
})();
