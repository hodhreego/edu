/* Registra a pontuação do aluno automaticamente: no aparelho (sempre) e na planilha do professor (se config.js tiver o endereço). */
(function(){
 var file=decodeURIComponent(location.pathname.split('/').pop()),cur=null;
 if(typeof JOGOS!=='undefined')JOGOS.forEach(function(j){if(j.href===file)cur=j});
 var sid=Date.now().toString(36)+Math.random().toString(36).slice(2,6),last=-1,max=0,t=null,t0=Date.now();
 var coin=null,ca=0,er=0,lp=0;function pts(){var m=(coin&&coin.textContent||'').match(/(-?\d+)\s*pontos/);return m?+m[1]:0}

 var ACT=[],clk=null,NL=String.fromCharCode(10);
 function mm(){var q=Math.round((Date.now()-t0)/1000);return ('0'+Math.floor(q/60)).slice(-2)+':'+('0'+q%60).slice(-2)}
 function tx(el,n){return el?(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,n||110):''}
 function first(sel,n,min){for(var i=0;i<sel.length;i++){var t=tx(document.querySelector(sel[i]),n);if(t.length>(min||0))return t}return ''}
 function quest(){return first(['#pergunta','.pergunta','#enunciado','.enunciado','#question','.question','#q','.q','#txt','#cena','.cena','#frase','.frase','#problema','.problema'],140,6)}
 function fback(){return first(['#msg','.msg','#fb','.fb','.feedback','#feedback','#res','.res','#resultado'],110,1)}
 document.addEventListener('click',function(e){var el=e.target;if(!el||!el.closest)return;var b=el.closest('button,a,label,li,td,.opt,.op,.alt,.card,[data-i],[data-a]')||el;clk={t:Date.now(),a:tx(b,50),q:quest()}},true);
 function logar(d,p){setTimeout(function(){var c=clk&&Date.now()-clk.t<3000?clk:null;ACT.push('['+mm()+'] '+(d>0?'✔ +':'✘ ')+d+' pontos (total '+p+')'+(c&&c.q?' · pergunta: '+c.q:'')+(c&&c.a?' · resposta: '+c.a:'')+(fback()?' · '+fback():''))},350)}
 function aluno(){return window.EDU_ALUNO?EDU_ALUNO():{nome:'',turma:'',data:''}}
 function dados(){var a=aluno();var ex={};try{ex=window.EDU_EXTRA?EDU_EXTRA():{certas:ca,erradas:er}}catch(e){}return{certas:ex.certas,erradas:ex.erradas,dinheiro:ex.dinheiro,gasto:ex.gasto,itens:ex.itens,senhas:ex.senhas,acoes:(ex.acoes||ACT.join(NL).slice(-3800)),cenario:ex.cenario,fase:ex.fase,sid:sid,nome:a.nome,turma:a.turma,escola:a.escola||'',tema:cur&&cur.tema?cur.tema:'',serie:cur&&cur.serie?cur.serie:'',jogo:cur?cur.titulo:file,arquivo:file,codigo:cur?cur.cod:'',aula:cur&&cur.aula?cur.aula:'',pontos:pts(),maximo:max,segundos:Math.round((Date.now()-t0)/1000),quando:new Date().toISOString(),dia:new Date().toLocaleDateString('pt-BR')}}
 function guardar(d){try{var a=JSON.parse(localStorage.getItem('edu_resultados')||'[]'),i=-1;a.forEach(function(x,k){if(x.sid===d.sid)i=k});if(i<0)a.push(d);else a[i]=d;localStorage.setItem('edu_resultados',JSON.stringify(a.slice(-300)))}catch(e){}}
 function enviar(fim){
  var p=pts();if(p>max)max=p;if(max<=0)return;var d=dados();guardar(d);
  var u=window.EDU_ENDPOINT;if(!u)return;var body=JSON.stringify(d);
  try{if(fim&&navigator.sendBeacon){navigator.sendBeacon(u,new Blob([body],{type:'text/plain'}));return}}catch(e){}
  try{fetch(u,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:body,keepalive:true})}catch(e){}
 }
 function ligar(){coin=document.querySelector('.coin,.jcoin');if(!coin)return false;
 lp=pts();new MutationObserver(function(){var p=pts();if(!window.EDU_EXTRA){if(p>lp)ca++;else if(p<lp&&!(p===0&&lp-p>10))er++}if(p!==lp&&!(p===0&&lp-p>10)&&!window.EDU_EXTRA)logar(p-lp,p);lp=p;if(p===last)return;last=p;clearTimeout(t);t=setTimeout(function(){enviar(false)},2500)}).observe(coin,{childList:true,characterData:true,subtree:true});return true}
 var tries=0,iv=setInterval(function(){if(ligar()||++tries>40)clearInterval(iv)},800);
 addEventListener('pagehide',function(){enviar(true)});
 document.addEventListener('visibilitychange',function(){if(document.hidden)enviar(true)});
})();
