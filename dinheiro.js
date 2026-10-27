/* cédulas e moedas reais do Real (fotos, com tarja SEM VALOR) */
(function(){
 var st=document.createElement('style');st.textContent='.m img{display:block;height:var(--h);width:auto;filter:drop-shadow(0 .2vh .3vh #0004);pointer-events:none;-webkit-user-drag:none}';
 document.head.appendChild(st);
 var N={200:'n2',500:'n5',1000:'n10',2000:'n20',5000:'n50',10000:'n100'},C={5:'c5',10:'c10',25:'c25',50:'c50',100:'c100'};
 function im(f,e,v){return '<img src="img/din/'+f+'.'+e+'" alt="R$ '+(v>=100?v/100:v/100)+'" draggable="false" title="Imagem ilustrativa, sem valor">'}
 window.DR={bill:function(v){return im(N[v],'jpg',v)},coin:function(v){return im(C[v],'png',v)}};
})();
