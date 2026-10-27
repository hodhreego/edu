/* Registra a pontuação do aluno automaticamente: no aparelho (sempre) e na planilha do professor (se config.js tiver o endereço). */
(function(){
 var file=decodeURIComponent(location.pathname.split('/').pop()),cur=null;
 if(typeof JOGOS!=='undefined')JOGOS.forEach(function(j){if(j.href===file)cur=j});
 var sid=Date.now().toString(36)+Math.random().toString(36).slice(2,6),last=-1,max=0,t=null,t0=Date.now();
 var coin=null;function pts(){var m=(coin&&coin.textContent||'').match(/(-?\d+)\s*pontos/);return m?+m[1]:0}
 function aluno(){return window.EDU_ALUNO?EDU_ALUNO():{nome:'',turma:'',data:''}}
 function dados(){var a=aluno();return{sid:sid,nome:a.nome,turma:a.turma,escola:a.escola||'',tema:cur&&cur.tema?cur.tema:'',serie:cur&&cur.serie?cur.serie:'',jogo:cur?cur.titulo:file,arquivo:file,codigo:cur?cur.cod:'',aula:cur&&cur.aula?cur.aula:'',pontos:pts(),maximo:max,segundos:Math.round((Date.now()-t0)/1000),quando:new Date().toISOString(),dia:new Date().toLocaleDateString('pt-BR')}}
 function guardar(d){try{var a=JSON.parse(localStorage.getItem('edu_resultados')||'[]'),i=-1;a.forEach(function(x,k){if(x.sid===d.sid)i=k});if(i<0)a.push(d);else a[i]=d;localStorage.setItem('edu_resultados',JSON.stringify(a.slice(-300)))}catch(e){}}
 function enviar(fim){
  var p=pts();if(p>max)max=p;if(max<=0)return;var d=dados();guardar(d);
  var u=window.EDU_ENDPOINT;if(!u)return;var body=JSON.stringify(d);
  try{if(fim&&navigator.sendBeacon){navigator.sendBeacon(u,new Blob([body],{type:'text/plain'}));return}}catch(e){}
  try{fetch(u,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:body,keepalive:true})}catch(e){}
 }
 function ligar(){coin=document.querySelector('.coin,.jcoin');if(!coin)return false;
 new MutationObserver(function(){var p=pts();if(p===last)return;last=p;clearTimeout(t);t=setTimeout(function(){enviar(false)},2500)}).observe(coin,{childList:true,characterData:true,subtree:true});return true}
 var tries=0,iv=setInterval(function(){if(ligar()||++tries>40)clearInterval(iv)},800);
 addEventListener('pagehide',function(){enviar(true)});
 document.addEventListener('visibilitychange',function(){if(document.hidden)enviar(true)});
})();
