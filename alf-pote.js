/* Potinho de moedas das atividades de alfabetização (compartilhado: 9999, 9998, 9997). Moedas = div32_moedas */
(function(){
 var MI=['m1','m50','m25','m10','m5'],tot=0;
 try{tot=parseInt(localStorage.getItem('div32_moedas'))||0}catch(e){}
 var w=document.createElement('div');w.id='alf-pote-w';w.style.cssText='position:relative;height:0;z-index:60';
 w.innerHTML='<style>#alf-pote{position:fixed;right:8px;top:62px;width:78px;height:92px;z-index:60;pointer-events:none;filter:drop-shadow(0 3px 5px #0004)}#alf-pote svg{position:absolute;inset:0;width:100%;height:100%}#alf-pote .cs{position:absolute;left:12px;right:12px;bottom:10px;height:44px;overflow:hidden}#alf-pote .cs i{position:absolute;width:24px;height:24px;border-radius:50%;background-size:cover;border:1px solid #0005}#alf-pote .n{position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);background:#ffd24d;color:#16213a;border:2px solid #b07a00;border-radius:99px;padding:0 9px;font:900 17px Arial,sans-serif;white-space:nowrap}#alf-pote.pop{animation:alfpop .5s}@keyframes alfpop{40%{transform:scale(1.25) rotate(-6deg)}}.alf-fc{position:fixed;left:0;top:0;width:64px;height:64px;border-radius:50%;background-size:cover;border:2px solid #0006;box-shadow:0 3px 8px #0005;pointer-events:none;z-index:70}</style><div id="alf-pote" aria-label="Potinho de moedas"><svg viewBox="0 0 60 70"><rect x="12" y="2" width="36" height="9" rx="3" fill="#8b5e34" stroke="#5a3a1a" stroke-width="1.5"/><path d="M14 11h32l5 8v40q0 8-8 8H17q-8 0-8-8V19z" fill="#dff3ff" fill-opacity=".55" stroke="#5a86a8" stroke-width="2"/></svg><div class="cs"></div><span class="n">0</span></div>';
 function ins(){document.body.insertBefore(w,document.body.firstChild);fill()}
 function fill(){var cs=w.querySelector('.cs'),n=Math.min(18,Math.floor(tot/2)),h='';for(var i=0;i<n;i++)h+='<i style="left:'+((i*13)%34)+'px;bottom:'+(Math.floor(i/3)*5)+'px;transform:rotate('+((i*37)%50-25)+'deg);background-image:url(img/aula47/'+MI[(i*7+2)%5]+'.webp)"></i>';var nn=Math.min(3,Math.floor(tot/20)),ND=[5,10,20];for(i=0;i<nn;i++)h+='<i style="width:34px;height:16px;border-radius:2px;left:'+(i*9)+'px;bottom:'+(2+i*7)+'px;transform:rotate('+(i*23-20)+'deg);background-image:url(img/din/n'+ND[i]+'.jpg)"></i>';cs.innerHTML=h;w.querySelector('.n').textContent=tot}
 function pop(){var p=document.getElementById('alf-pote');p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop')}
 function voar(n,x0,y0){
  var p=document.getElementById('alf-pote');if(!p)return;var r=p.getBoundingClientRect(),tx=r.left+r.width/2-32,ty=r.top+r.height/2-32;
  x0=x0==null?innerWidth/2-32:x0-32;y0=y0==null?innerHeight/2-32:y0-32;var done=0;n=Math.min(8,Math.max(1,n));
  for(var i=0;i<n;i++)(function(i){var el=document.createElement('div');el.className='alf-fc';el.style.backgroundImage='url(img/aula47/'+MI[Math.floor(Math.random()*5)]+'.webp)';w.appendChild(el);
   var ox=x0+(Math.random()*160-80),oy=y0+(Math.random()*60-30);
   var a=el.animate([{transform:'translate('+ox+'px,'+(oy+30)+'px) scale(.2)',opacity:0},{transform:'translate('+ox+'px,'+oy+'px) scale(1.2) rotate(200deg)',opacity:1,offset:.3},{transform:'translate('+ox+'px,'+oy+'px) scale(1.2) rotate(360deg)',opacity:1,offset:.5},{transform:'translate('+tx+'px,'+ty+'px) scale(.35) rotate(720deg)',opacity:.95}],{duration:1300,delay:i*110,easing:'ease-in-out',fill:'both'});
   a.onfinish=function(){el.remove();done++;if(done===n){fill();pop()}}})(i)}
 window.ALF_POTE={sync:function(t){tot=t;fill()},voar:voar,
  ganhar:function(n,x,y){tot=Math.max(0,tot+n);try{localStorage.setItem('div32_moedas',tot)}catch(e){}voar(n,x,y)}};
 if(document.body)ins();else addEventListener('DOMContentLoaded',ins);
})();
