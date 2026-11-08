/* RobIox — 5 minijogos estilo Nintendo DS: tela de cima com a cena, tela de baixo (toque) com a pergunta.
   Para avançar de fase é preciso acertar a pergunta. */
(function(){
 window.RBX_JOGOS=window.RBX_JOGOS||{};
 var W=256,H=192,FASES=10,VIDAS=5;
 function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
 function rr(g,x,y,w,h,r,c){g.fillStyle=c;g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fill()}
 function grad(g,c1,c2,y0,y1){var gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr}
 function em(g,e,x,y,s,flip){g.save();g.fillStyle='#000';g.globalAlpha=1;g.font=s+'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",serif';g.textAlign='center';g.textBaseline='middle';g.translate(x,y);if(flip)g.scale(-1,1);g.fillText(e,0,0);g.restore()}
 function shadow(g,x,y,w){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y,w,w*.28,0,0,7);g.fill()}
 function cloud(g,x,y,s){g.fillStyle='rgba(255,255,255,.9)';[[0,0,12],[12,-4,15],[26,0,12],[13,5,13]].forEach(function(c){g.beginPath();g.arc(x+c[0]*s,y+c[1]*s,c[2]*s,0,7);g.fill()})}
 /* cenas: (g,t,p,k) p = progresso suave 0..10; k = {shake,hit,wrong} */
 var SCENE={
  kart:function(g,t,p,k){
   grad(g,'#59b8ff','#d8f1ff',0,90);g.fillRect(0,0,W,90);cloud(g,((t*8)%330)-40,24,1);cloud(g,((t*5+140)%330)-40,48,.8);
   g.fillStyle='#4fae5d';g.beginPath();g.moveTo(0,90);for(var i=0;i<=W;i+=16)g.lineTo(i,70+Math.sin(i*.05)*10);g.lineTo(W,90);g.fill();
   grad(g,'#5a5a66','#3a3a44',90,H);g.fillRect(0,90,W,H-90);
   for(var l=0;l<3;l++){var y=108+l*30;g.fillStyle='#fff';for(var x=-((t*60)%40);x<W;x+=40)g.fillRect(x,y+14,20,3)}
   g.fillStyle='#fff';g.fillRect(W-26,90,6,H-90);for(var r=0;r<12;r++){g.fillStyle=r%2?'#000':'#fff';g.fillRect(W-26+(r%2)*3,90+r*8.5,3,8.5)}
   [['#2e86de',.82,0],['#27ae60',.7,2]].forEach(function(c,ix){var kx=20+Math.min(p/10*.9,c[1]*p/10*1.05)*190+Math.sin(t*3+ix)*2,ky=104+(ix?2:0)*15+ix*0;kart(g,kx,ky+(ix===0?0:30*(ix)),c[0],t)});
   var px=20+p/10*200,py=108+60;kart(g,px,py+(k.shake?Math.sin(t*60)*2:0),'#e74c3c',t,true)},
  cozinha:function(g,t,p,k){
   grad(g,'#ffe3b8','#ffc27a',0,H);g.fillRect(0,0,W,H);g.fillStyle='#c97b3a';g.fillRect(0,130,W,62);g.fillStyle='#e8a05a';g.fillRect(0,130,W,6);
   for(var i=0;i<6;i++){rr(g,10+i*40,10,32,40,4,'#fff8e6');g.fillStyle='#e0c9a0';g.fillRect(14+i*40,16,24,3)}
   shadow(g,128,164,60);rr(g,78,100,100,58,14,'#555a63');rr(g,70,96,116,12,6,'#7b818c');g.fillStyle='#e0782f';g.fillRect(84,106,88,10);
   var ing=['🥕','🍅','🧅','🥔','🌽','🍄','🧄','🥦','🌶️','🧂'];for(var j=0;j<Math.floor(p+.01);j++)em(g,ing[j],98+(j%5)*16,106+((j/5)|0)*6,18);
   var n=Math.floor(p);if(p-n>0&&n<10){em(g,ing[n],128,20+(p-n)*70,26)}
   for(var s=0;s<3;s++){var yy=88-((t*30+s*20)%50);g.fillStyle='rgba(255,255,255,'+(.5-((t*30+s*20)%50)/120)+')';g.beginPath();g.arc(100+s*28+Math.sin(t*3+s)*4,yy,7+s,0,7);g.fill()}
   em(g,'👨‍🍳',216,98+Math.sin(t*4)*3,44)},
  montanha:function(g,t,p,k){
   grad(g,'#6ec6ff','#e0f4ff',0,H);g.fillRect(0,0,W,H);cloud(g,((t*6)%330)-40,30,1);
   g.fillStyle='#8a97a8';g.beginPath();g.moveTo(-20,H);g.lineTo(90,60);g.lineTo(200,H);g.fill();g.fillStyle='#6f7b8c';g.beginPath();g.moveTo(60,H);g.lineTo(170,20);g.lineTo(290,H);g.fill();
   g.fillStyle='#fff';g.beginPath();g.moveTo(170,20);g.lineTo(150,50);g.lineTo(162,46);g.lineTo(172,56);g.lineTo(184,46);g.lineTo(194,50);g.fill();
   g.strokeStyle='#caa46a';g.lineWidth=3;g.setLineDash([6,4]);g.beginPath();g.moveTo(40,180);for(var i=1;i<=10;i++)g.lineTo(40+(i%2?i*10:i*10-26)+ (i>5?20:0),180-i*14);g.stroke();g.setLineDash([]);
   var q=Math.min(10,p),px=40+(Math.round(q)%2?q*10:q*10-26)+(q>5?20:0),py=180-q*14;em(g,'🧗',px,py-8+(k.shake?Math.sin(t*50)*2:0),26);em(g,'🚩',170,14,20);
   if(p>=10){em(g,'🎉',170,40,22)}},
  batalha:function(g,t,p,k){
   grad(g,'#3a2a5a','#9a5a8a',0,H);g.fillRect(0,0,W,H);g.fillStyle='#2c1e44';g.fillRect(0,140,W,52);for(var i=0;i<18;i++){g.fillStyle='rgba(255,255,255,.7)';g.fillRect((i*47)%W,(i*23)%110,2,2)}
   var boss=['👾','👹','🐲','🦖','🧟','👻','🦑','🤖','🐙','👿'][Math.min(9,Math.floor(p))],hp=Math.max(0,1-p/10);
   var sh=k.shake?Math.sin(t*70)*4:0;shadow(g,180,158,34);em(g,boss,180+sh,108+Math.sin(t*3)*3,64);
   rr(g,130,30,110,12,6,'rgba(0,0,0,.5)');rr(g,132,32,Math.max(2,106*hp),8,4,hp>.5?'#2ecc71':hp>.25?'#f1c40f':'#e74c3c');
   shadow(g,60,158,22);var ax=k.hit?Math.sin(Math.min(1,k.hit)*3.14)*70:0;em(g,'🦸',60+ax,116,46);if(k.hit)em(g,'💥',150,110,34);if(k.wrong)em(g,'💢',70,86,24)},
  castelo:function(g,t,p,k){
   grad(g,'#8fd3ff','#ffe9b8',0,H);g.fillRect(0,0,W,H);cloud(g,((t*5)%330)-40,26,1);g.fillStyle='#5cb85c';g.fillRect(0,150,W,42);g.fillStyle='#4aa04a';g.fillRect(0,150,W,5);
   var cols=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'],n=Math.floor(p+.01),bw=80,bh=12;
   for(var i=0;i<n;i++){var w=bw-(i>6?(i-6)*8:0),x=128-w/2+(i%2?3:-3)*(k.shake?Math.sin(t*50):0);rr(g,x,150-(i+1)*bh,w,bh-1,3,cols[i%6]);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(x+3,150-(i+1)*bh+2,w-6,2)}
   var f=p-n;if(n<10&&f>0){var yy=-20+(150-(n+1)*bh+20)*f;rr(g,128-bw/2,yy,bw,bh-1,3,cols[n%6])}
   if(n>=10){em(g,'🏰',128,150-10*bh-14,36);em(g,'🚩',128,150-10*bh-40,18)}
   em(g,'👷',48,136,34);em(g,'🧱',208,138,26)}
 };
 function kart(g,x,y,c,t,me){shadow(g,x+18,y+22,22);g.fillStyle='#222';g.beginPath();g.arc(x+6,y+20,6,0,7);g.arc(x+30,y+20,6,0,7);g.fill();rr(g,x,y+6,38,14,6,c);rr(g,x+14,y,16,12,5,'rgba(255,255,255,.85)');em(g,me?'😎':'🙂',x+22,y+6,13);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+4,y+9,26,3)}
 var DEFS=[
  ['ds-kart','Kart Matemático','🏎️','Cada resposta certa acelera o seu kart até a linha de chegada','kart','#e74c3c','#ffe0dc'],
  ['ds-cozinha','Cozinha Mestre','🍲','Acerte para colocar os ingredientes e terminar a receita','cozinha','#e67e22','#ffe9cf'],
  ['ds-montanha','Escalada da Montanha','🧗','Cada acerto sobe um degrau até a bandeira do topo','montanha','#2980b9','#dff0ff'],
  ['ds-batalha','Batalha de Monstros','👾','Acertar a pergunta é o seu golpe. Derrote 10 monstros!','batalha','#8e44ad','#f0e0ff'],
  ['ds-castelo','Construtor de Castelo','🏰','Cada resposta certa coloca um bloco no castelo','castelo','#27ae60','#e2f9e8']
 ];
 DEFS.forEach(function(d){window.RBX_JOGOS[d[0]]={nome:d[1]+' '+d[2],icone:d[2],desc:d[3],start:function(api){run(d,api)}}});
 function run(d,api){
  var C=d[5],L=d[6],easy=api.easy&&api.easy();
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#2b2b33;display:flex;flex-direction:column;align-items:center;font-family:system-ui,Arial,sans-serif;color:#fff;user-select:none;-webkit-user-select:none;touch-action:manipulation;overflow:auto';
  var sw='min(96vw,calc((100vh - 330px)*256/192),520px)';
  o.innerHTML='<div style="display:flex;align-items:center;gap:8px;width:min(98vw,540px);padding:6px 6px;font-weight:900"><span style="flex:1;font-size:15px">'+esc(d[1])+' '+d[2]+'</span><span id="dv" style="font-size:16px"></span><span id="df" style="background:'+C+';padding:3px 9px;border-radius:99px;font-size:13px"></span><button id="dx" type="button" style="font:900 14px Arial;padding:6px 10px;border:2px solid #fff;background:#444;color:#fff;border-radius:8px">✕ Sair</button></div>'+
   '<div style="background:#3a3a44;border-radius:18px 18px 8px 8px;padding:10px;box-shadow:0 6px 18px #000a"><div style="width:'+sw+';aspect-ratio:256/192;background:#000;border-radius:6px;overflow:hidden;box-shadow:inset 0 0 0 3px #111"><canvas id="dc" width="256" height="192" style="width:100%;height:100%;display:block"></canvas></div></div>'+
   '<div style="width:90px;height:12px;background:linear-gradient(#555,#222);border-radius:0 0 8px 8px;margin-bottom:-1px"></div>'+
   '<div id="dq" style="background:#3a3a44;border-radius:8px 8px 18px 18px;padding:10px;box-shadow:0 6px 18px #000a;width:'+sw+';max-width:520px;box-sizing:content-box"><div id="dqi" style="background:'+L+';color:#222;border-radius:6px;padding:10px;min-height:150px"></div></div><div style="height:16px;flex:none"></div>';
  document.body.appendChild(o);
  var $=function(i){return o.querySelector('#'+i)},cv=$('dc'),g=cv.getContext('2d');
  var st=0,vidas=VIDAS,p=0,tt=0,last=performance.now(),raf=0,alive=true,qd=null,fase='ask',k={shake:0,hit:0,wrong:0},acertos=0,AC=null,msg='',msgT=0;
  function beep(f,dur,ty){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var os=AC.createOscillator(),v=AC.createGain();os.type=ty||'triangle';os.frequency.value=f;v.gain.value=.07;os.connect(v);v.connect(AC.destination);os.start();os.stop(AC.currentTime+(dur||.1))}catch(e){}}
  function hud(){$('dv').textContent=new Array(Math.max(0,vidas)+1).join('❤️')||'💔';$('df').textContent='FASE '+Math.min(st+1,FASES)+'/'+FASES}
  function perg(){
   var topics=(api.topics&&api.topics())||['Geral'];var tp=topics[(Math.random()*topics.length)|0],q;
   try{q=api.B.make(api.ANO||6,tp,api.tier?api.tier():1)}catch(e){q=null}
   if(!q||q.a==null)q={q:'Quanto é 5 + 5?',a:'10',d:['8','12','15'],e:'5 mais 5 é 10.'};
   var wr=(q.d||[]).slice().sort(function(){return Math.random()-.5}).slice(0,easy?1:3),ops=[String(q.a)].concat(wr.map(String));ops.sort(function(){return Math.random()-.5});qd={q:q,ops:ops};fase='ask';
   $('dqi').innerHTML='<div style="font-weight:800;font-size:clamp(15px,3.5vw,21px);line-height:1.3;margin-bottom:8px">'+esc(q.q)+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+ops.map(function(x,i){return '<button type="button" data-i="'+i+'" style="font:800 clamp(15px,3.6vw,21px) system-ui;padding:12px 6px;border:0;border-radius:10px;background:#fff;color:#222;box-shadow:0 3px 0 '+C+',0 0 0 2px '+C+' inset">'+esc(x)+'</button>'}).join('')+'</div>'}
  function resp(i){
   if(fase!=='ask')return;var ok=qd.ops[i]===String(qd.q.a);fase='fb';
   var bs=$('dqi').querySelectorAll('button');bs.forEach(function(b,j){b.disabled=true;if(qd.ops[j]===String(qd.q.a)){b.style.background='#2ecc71';b.style.color='#fff'}});
   try{api.log&&api.log(qd.q,ok,1)}catch(e){}
   if(ok){beep(660,.1);setTimeout(function(){beep(990,.14)},110);try{api.gain&&api.gain(10,1)}catch(e){}acertos++;st++;k.hit=1;msg='ACERTOU!';msgT=1;setTimeout(function(){if(!alive)return;hud();if(st>=FASES)fim(true);else perg()},1250)}
   else{bs[i].style.background='#e74c3c';bs[i].style.color='#fff';beep(140,.3,'sawtooth');vidas--;k.shake=1;k.wrong=1;msg='ERROU!';msgT=1;hud();var ex=qd.q.e?'<div style="margin-top:8px;font-size:14px;font-weight:700;background:#fff;border-radius:8px;padding:8px">💡 '+esc(qd.q.e)+'</div>':'';$('dqi').insertAdjacentHTML('beforeend',ex);
    setTimeout(function(){if(!alive)return;if(vidas<=0)return fim(false);perg()},ex?2600:1300)}
  }
  function fim(win){fase='end';$('dqi').innerHTML='<div style="text-align:center;font-weight:900"><div style="font-size:26px">'+(win?'🏆 Você venceu!':'💔 Fim de jogo')+'</div><div style="font-size:16px;margin:8px 0">Respostas certas: '+acertos+' · Fase '+Math.min(st+1,FASES)+'/'+FASES+'</div><button id="da" type="button" style="font:900 18px Arial;padding:12px 16px;border:0;border-radius:10px;background:'+C+';color:#fff">↻ Jogar de novo</button> <button id="ds" type="button" style="font:900 18px Arial;padding:12px 16px;border:0;border-radius:10px;background:#555;color:#fff">Sair</button></div>';if(win){beep(523,.1);setTimeout(function(){beep(659,.1)},120);setTimeout(function(){beep(784,.25)},240)}}
  function sair(){alive=false;cancelAnimationFrame(raf);removeEventListener('keydown',kd,true);o.remove();try{api.onClose&&api.onClose()}catch(e){}}
  function kd(e){if(!alive)return;if(/^[1-4]$/.test(e.key)&&fase==='ask'){resp(+e.key-1);e.preventDefault();e.stopPropagation()}else if(e.key==='Escape')sair()}
  addEventListener('keydown',kd,true);$('dx').onclick=sair;
  $('dqi').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.id==='da'){st=0;vidas=VIDAS;p=0;acertos=0;hud();return perg()}if(b.id==='ds')return sair();if(b.dataset.i!==undefined)resp(+b.dataset.i)});
  function loop(now){if(!alive)return;raf=requestAnimationFrame(loop);var dt=Math.min(.04,(now-last)/1000||0);last=now;tt+=dt;
   p+=(st-p)*Math.min(1,dt*2.6);if(Math.abs(st-p)<.003)p=st;if(k.shake>0)k.shake=Math.max(0,k.shake-dt*1.4);else k.wrong=0;if(k.hit>0)k.hit=Math.max(0,k.hit-dt*1.1);
   g.clearRect(0,0,W,H);SCENE[d[4]](g,tt,p,{shake:k.shake>0,hit:k.hit,wrong:k.wrong});
   if(msgT>0){msgT-=dt;rr(g,64,70,128,34,10,'rgba(0,0,0,.65)');g.fillStyle='#fff';g.font='bold 16px system-ui';g.textAlign='center';g.fillText(msg,128,92);g.textAlign='left'}}
  hud();perg();raf=requestAnimationFrame(loop);
 }
})();
