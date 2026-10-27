/* cédulas e moedas reais do Real (fotos, com tarja SEM VALOR) */
(function(){
 var st=document.createElement('style');st.textContent='.m img{display:block;height:var(--h);width:auto;filter:drop-shadow(0 .2vh .3vh #0004);pointer-events:none;-webkit-user-drag:none}';
 document.head.appendChild(st);
 var N={200:'n2',500:'n5',1000:'n10',2000:'n20',5000:'n50',10000:'n100'},C={5:'c5',10:'c10',25:'c25',50:'c50',100:'c100'};
 function im(f,e,v){return '<img src="img/din/'+f+'.'+e+'" alt="R$ '+(v>=100?v/100:v/100)+'" draggable="false" title="Imagem ilustrativa, sem valor">'}
 window.DR={bill:function(v){return im(N[v],'jpg',v)},coin:function(v){return im(C[v],'png',v)}};
})();
/* enunciado claro e direto para cada questão */
window.DRQ=function(t,fmt){
 var el=document.getElementById('inst');if(!el||!t||!t.items)return;
 var L=t.items.map(function(i){return (i.e?i.e+' ':'')+'<b>'+i.n+'</b> ('+fmt(i.p)+')'});
 var lista=L.length>1?L.slice(0,-1).join(', ')+' e '+L[L.length-1]:L[0],h;
 var P=t.paid?'<b>uma cédula de '+fmt(t.paid)+'</b>':'';
 if(t.paid){
  h=t.items.length>1
   ?'Um cliente comprou '+lista+'. Ele pagou com '+P+'. <b>Some os preços e calcule o troco.</b> Monte o troco na carteira.'
   :'Um cliente comprou '+lista+'. Ele pagou com '+P+'. <b>Qual é o troco?</b> Monte o troco na carteira.';
 }else{
  h=t.items.length>1
   ?'Você vai pagar: '+lista+'. <b>Some os preços</b> e monte o total exato na carteira.'
   :'Você vai pagar: '+lista+'. Monte <b>exatamente '+fmt(t.total)+'</b> na carteira, com moedas e cédulas.';
 }
 el.innerHTML=h;
};
/* enunciado + produto + carteira num único espaço */
document.addEventListener('DOMContentLoaded',function(){
 var i=document.getElementById('inst'),m=document.querySelector('#app>.main');
 if(!i||!m)return;m.insertBefore(i,m.firstChild);i.classList.add('inst-in');
 var st=document.createElement('style');
 st.textContent='@media screen{#app>.main>.inst-in{grid-column:1/-1;border:0!important;border-bottom:.3vh dashed #94a3b8!important;border-radius:0!important;background:transparent!important;margin:0 0 .8vh;padding:.4vh 1vw .9vh!important}}';
 document.head.appendChild(st);
});
