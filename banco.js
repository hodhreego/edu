/* Atividades de Pix, maquininha e cartão de crédito: celular imitando o app do banco escolhido pelo aluno */
(function(){
'use strict';
var BANKS={
 nubank:{n:'Nubank',h:'#820AD1',f:'#fff',b:'#820AD1',bt:'#fff',bg:'#f4f0f8',style:'tall',kind:'row'},
 bb:{n:'Banco do Brasil',h:'#FAE128',f:'#0038A8',b:'#0038A8',bt:'#fff',bg:'#f3f5fb',style:'bar',kind:'grid'},
 itau:{n:'Itaú',h:'#EC7000',f:'#fff',b:'#EC7000',bt:'#fff',bg:'#fff',style:'bar',kind:'grid'},
 bradesco:{n:'Bradesco',h:'#CC092F',f:'#fff',b:'#CC092F',bt:'#fff',bg:'#fff',style:'bar',kind:'grid'},
 caixa:{n:'Caixa Tem',h:'#005CA9',f:'#fff',b:'#F39200',bt:'#fff',bg:'#eef4fa',style:'bar',kind:'caixa'},
 inter:{n:'Inter',h:'#FF7A00',f:'#fff',b:'#FF7A00',bt:'#fff',bg:'#fff',style:'tall',kind:'row'},
 mp:{n:'Mercado Pago',h:'#FFE600',f:'#2D3277',b:'#009EE3',bt:'#fff',bg:'#ededed',style:'tall',kind:'mp'},
 santander:{n:'Santander',h:'#EC0000',f:'#fff',b:'#EC0000',bt:'#fff',bg:'#fff',style:'bar',kind:'grid'}};
var $=function(i){return document.getElementById(i)};
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function pick(a){return a[rnd(0,a.length-1)]}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(0,i),t=a[i];a[i]=a[j];a[j]=t}return a}
function fmt(c){return 'R$ '+Math.floor(c/100).toLocaleString('pt-BR')+','+String(c%100).padStart(2,'0')}
function parse(s){s=String(s||'').replace(/R\$|\s/g,'');if(!s)return NaN;
 if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
 var n=Number(s);return isNaN(n)?NaN:Math.round(n*100)}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9@]/g,'')}
var SOB=['Silva','Souza','Oliveira','Santos','Lima','Pereira','Costa','Almeida','Ribeiro','Rocha','Carvalho','Gomes'];
var NOM=['Maria','João','Ana','Pedro','Lucas','Camila','Rafael','Juliana','Carlos','Fernanda','Bruno','Larissa','Paulo','Beatriz'];
var BCO=['Nubank','Banco do Brasil','Itaú','Bradesco','Caixa','Inter','Santander'];
var SERV=['corte de cabelo','conserto da bicicleta','aula de violão','bolo de aniversário','lavagem do carro','pintura do portão','aula de reforço','manutenção do notebook'];
function nome(){return pick(NOM)+' '+pick(SOB)}
function acc(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'')}
function chCel(){return '('+rnd(11,99)+') 9'+rnd(1000,9999)+'-'+rnd(1000,9999)}
function chCpf(){return rnd(100,999)+'.'+rnd(100,999)+'.'+rnd(100,999)+'-'+rnd(10,99)}
function chCnpj(){return rnd(10,99)+'.'+rnd(100,999)+'.'+rnd(100,999)+'/0001-'+rnd(10,99)}
function chMail(n){return acc(n).toLowerCase().replace(' ','.')+'@email.com'}
function chAle(){var h='0123456789abcdef',s='';for(var i=0;i<8;i++)s+=h[rnd(0,15)];return s.slice(0,4)+'-'+s.slice(4)}
function pin(){return String(rnd(1000,9999))}
function pessoa(tipo,n){n=n||nome();var c=tipo==='cel'?chCel():tipo==='cpf'?chCpf():tipo==='mail'?chMail(n):tipo==='cnpj'?chCnpj():chAle();
 return {nome:n,chave:c,tipo:({cel:'Celular',cpf:'CPF',mail:'E-mail',cnpj:'CNPJ',ale:'Chave aleatória'})[tipo],banco:pick(BCO)}}
function cts(tipo,alvo,n){var a=[alvo],g=0;while(a.length<n&&g++<50){var p=pessoa(tipo);if(p.nome!==alvo.nome&&p.chave!==alvo.chave)a.push(p)}return shuffle(a)}
function dados(p){return '<div class="dd"><span>'+p.tipo+'</span><b>'+p.chave+'</b></div>'}
function pinTxt(p){return 'A senha do seu app é <b>'+p+'</b>.'}
/* ---------- geradores de questão ---------- */
var GEN={
 celular:function(L){var p=pessoa('cel'),s=pick(SERV),v,t,pn=pin();
  if(L===1){v=rnd(2,12)*500;t='Você vai pagar <b>'+p.nome+'</b> pelo '+s+': <b>'+fmt(v)+'</b>. A chave Pix dela é o <b>celular</b> '+'<b>'+p.chave+'</b>.'}
  else if(L===2){var a=rnd(4,12)*500+pick([50,90,150,250,75]),b=rnd(3,9)*500+pick([50,90,150,250,25]);v=a+b;t='Você deve a <b>'+p.nome+'</b> dois serviços: '+s+' ('+fmt(a)+') e '+pick(SERV.filter(function(x){return x!==s}))+' ('+fmt(b)+'). Pague <b>os dois de uma vez</b> no Pix para o celular <b>'+p.chave+'</b>.'}
  else{var dv=rnd(80,200)*100+pick([50,90,25]),jp=rnd(20,60)*100+pick([50,25,75]);v=dv-jp;t='Você deve <b>'+fmt(dv)+'</b> a <b>'+p.nome+'</b>, mas já entregou <b>'+fmt(jp)+'</b> em dinheiro. Faça o Pix do <b>que falta</b> para o celular <b>'+p.chave+'</b>.'}
  return {txt:t+' '+pinTxt(pn),contacts:cts('cel',p,3),target:{nome:p.nome,valor:v},pin:pn,modo:'pix'}},
 cpf:function(L){var p=pessoa('cpf'),pn=pin(),h=rnd(2,5),vh=(L===1?rnd(4,9)*500:rnd(8,24)*250),v,t;
  if(L===1){v=h*vh;t='<b>'+p.nome+'</b> trabalhou <b>'+h+' horas</b> na sua casa, cobrando <b>'+fmt(vh)+' por hora</b>. Pague o total no Pix pelo <b>CPF</b> <b>'+p.chave+'</b>.'}
  else if(L===2){var ds=rnd(1,4)*1000+pick([50,250,500]);v=h*vh+ds;t='<b>'+p.nome+'</b> trabalhou <b>'+h+' horas</b> a <b>'+fmt(vh)+'</b> a hora e cobra <b>'+fmt(ds)+'</b> de deslocamento. Pague tudo no Pix pelo <b>CPF</b> <b>'+p.chave+'</b>.'}
  else{vh=rnd(16,40)*250;v=Math.round(h*vh*.9);t='<b>'+p.nome+'</b> cobra <b>'+fmt(vh)+' por hora</b> e trabalhou <b>'+h+' horas</b>. Como o pagamento é <b>no Pix</b>, ela dá <b>10% de desconto</b> no total. Pague pelo <b>CPF</b> <b>'+p.chave+'</b>.'}
  return {txt:t+' '+pinTxt(pn),contacts:cts('cpf',p,3),target:{nome:p.nome,valor:v},pin:pn,modo:'pix'}},
 email:function(L){var p=pessoa('mail'),pn=pin(),n=pick([3,4,5,6]),v,t;
  if(L===1){var pt=rnd(8,30)*100;t='A conta do restaurante foi <b>'+fmt(pt*n)+'</b>, dividida igualmente entre <b>'+n+' amigos</b>. <b>'+p.nome+'</b> pagou tudo no cartão. Mande no Pix a <b>sua parte</b> para o e-mail <b>'+p.chave+'</b>.';v=pt}
  else if(L===2){var b0=rnd(5,20)*500;t='A conta foi <b>'+fmt(b0*n)+'</b> mais <b>10% de gorjeta</b>, dividida igualmente entre <b>'+n+' amigos</b>. <b>'+p.nome+'</b> pagou. Mande a <b>sua parte</b> no Pix para o e-mail <b>'+p.chave+'</b>.';v=Math.round(b0*1.1)}
  else{var pc=rnd(6,16)*500,cv=pick([250,750,1250,1500]);t='A conta foi <b>'+fmt(pc*n)+'</b> (dividida igualmente entre <b>'+n+' amigos</b>) e cada um paga ainda um <b>couvert artístico de '+fmt(cv)+'</b>. <b>'+p.nome+'</b> pagou. Mande a <b>sua parte</b> (conta + couvert) pelo e-mail <b>'+p.chave+'</b>.';v=pc+cv}
  return {txt:t+' '+pinTxt(pn),contacts:cts('mail',p,3),target:{nome:p.nome,valor:v},pin:pn,modo:'pix'}},
 qr:function(L){var pn=pin(),loja=pick(['Padaria Pão Dourado','Livraria Estrela','Pet Shop Amigo Fiel','Papelaria Central','Mercado Bom Preço']),P,d,v,t,w1,w2;
  if(L===1){P=rnd(3,12)*2000;d=pick([10,20,25,50]);v=P-P*d/100;t='Na <b>'+loja+'</b>, um produto custa <b>'+fmt(P)+'</b> e hoje tem <b>'+d+'% de desconto</b> no Pix. Aponte a câmera para o <b>QR Code que cobra o valor certo</b>.';w1=P+P*d/100;w2=P-d*100}
  else if(L===2){var a=rnd(10,40)*200,b=rnd(5,20)*200;P=a+b;d=pick([5,15]);v=P-P*d/100;t='Na <b>'+loja+'</b>, você comprou dois produtos: <b>'+fmt(a)+'</b> e <b>'+fmt(b)+'</b>. O <b>desconto é de '+d+'%</b> sobre o total. Escaneie o <b>QR Code com o valor certo</b>.';w1=P-a*d/100;w2=P+P*d/100}
  else{P=rnd(25,100)*200;d=pick([5,15,25]);var fr=rnd(1,4)*1000+pick([50,250,500]);v=P-P*d/100+fr;t='Na <b>'+loja+'</b>, o produto custa <b>'+fmt(P)+'</b>, com <b>'+d+'% de desconto</b>, mas a entrega custa <b>'+fmt(fr)+'</b> (sem desconto). Escaneie o <b>QR Code do valor total certo</b>.';w1=P-P*d/100;w2=P+fr}
  var vs=[v,w1,w2];if(vs.some(function(x,i){return vs.indexOf(x)!==i})||w1===v||w2===v)return GEN.qr(L);
  var qrs=shuffle([{v:v,ok:1},{v:w1},{v:w2}]).map(function(q,i){return {letra:'ABC'[i],valor:q.v,ok:q.ok,nome:loja}});
  return {txt:t+' '+pinTxt(pn),contacts:[],qrs:qrs,target:{nome:loja,valor:v},pin:pn,modo:'qr'}},
 golpe:function(L){var pn=pin(),emp=pick(['Pão Dourado Padaria','Clínica Vida Plena','Auto Peças Veloz','Escola de Idiomas Futuro','Mercado Bom Preço']),p=pessoa('cnpj',emp),v=(L===1?rnd(3,15)*1000:L===2?rnd(30,150)*500+pick([50,250,150]):rnd(40,300)*250+pick([5,10,50,90])),
   falso=pessoa('cnpj',pick(['Joaquim Pereira Ferreira ME','Rosana Lima Comércio','José Carlos Santos Ltda']));
  var c=p.chave,fc=c.slice(0,-2)+(String(rnd(10,99)));if(fc===c)fc=c.slice(0,-2)+'00';falso.chave=fc;
  var t='Você vai pagar a <b>'+emp+'</b> o valor de <b>'+fmt(v)+'</b>. A chave Pix é o <b>CNPJ '+c+'</b>. <b>Antes de confirmar, confira o NOME do destinatário</b> na tela: se for outro, <b>cancele</b> e confira os números da chave.';
  return {txt:t+' '+pinTxt(pn),contacts:[p,falso],target:{nome:emp,valor:v},pin:pn,modo:'pix'}},
 pos:function(L){var pn=pin(),v=(L===1?rnd(2,15)*2000:rnd(10,150)*200),forma,pc,tx,tabela='<table class="tb"><tr><th>Forma</th><th>Taxa</th></tr><tr><td>Débito</td><td>1,5%</td></tr><tr><td>Crédito à vista</td><td>3%</td></tr><tr><td>Crédito 2 a 6 vezes</td><td>4,5%</td></tr><tr><td>Crédito 7 a 12 vezes</td><td>6%</td></tr></table>';
  if(L===1){forma='debito';pc=1;tx=1.5}else if(L===2){var o=pick([[ 'credito',1,3],['credito',pick([2,3,4,5,6]),4.5],['debito',1,1.5]]);forma=o[0];pc=o[1];tx=o[2]}else{var o2=pick([['credito',rnd(7,12),6],['credito',rnd(2,6),4.5],['credito',1,3]]);forma=o2[0];pc=o2[1];tx=o2[2];v=rnd(15,250)*200}
  var fee=Math.round(v*tx/10)/10;if(fee!==Math.round(fee))return GEN.pos(L);fee=Math.round(fee);
  var desc=forma==='debito'?'no <b>débito</b>':pc===1?'no <b>crédito à vista</b>':'no <b>crédito em '+pc+'x</b>';
  var t='Você é o lojista. Um cliente vai pagar <b>'+fmt(v)+'</b> '+desc+'. <b>Passe a venda na maquininha</b> (valor, forma de pagamento'+(forma==='credito'?' e parcelas':'')+') e depois calcule a <b>taxa</b> cobrada e o <b>valor líquido</b> que cai na sua conta.'+tabela;
  return {txt:t+' '+pinTxt(pn).replace('seu app','cartão do cliente'),modo:'pos',venda:{valor:v,forma:forma,parc:pc},pin:pn,fields:[{q:'Taxa cobrada pela maquininha',a:fee},{q:'Valor líquido que cai na sua conta',a:v-fee}]}},
 compra:function(L,hard){var cat=[['Caderno',1850],['Mochila',8490],['Caneta (caixa)',1290],['Tênis',15900],['Garrafa térmica',2690],['Camiseta',4290],['Fone de ouvido',3850],['Boné',2790],['Estojo',2190],['Régua',690]],
  tab='<table class="tb"><tr><th>Forma</th><th>Regra</th></tr><tr><td>Dinheiro e Pix</td><td>5% de desconto</td></tr><tr><td>Débito</td><td>taxa 1,5%</td></tr><tr><td>Crédito à vista</td><td>taxa 3%</td></tr><tr><td>Crédito 2 a 6 vezes</td><td>taxa 4,5%</td></tr><tr><td>Crédito 7 a 12 vezes</td><td>taxa 6%</td></tr></table>';
  for(var g=0;g<400;g++){
   var n=L===1?2:3,its=[],v=0,pool=cat.slice();
   for(var i=0;i<n;i++){var it=pool.splice(rnd(0,pool.length-1),1)[0];var pr=L===1?Math.round(it[1]/100)*100:it[1];its.push([it[0],pr]);v+=pr}
   var forma=pick(L===1?['dinheiro','pix','debito','credito']:['dinheiro','pix','debito','credito','credito']),pc=1,tx=0,d=0,val=v,fields,desc;
   if(forma==='dinheiro'||forma==='pix'){if(v%20)continue;d=v*5/100;val=v-d}
   else if(forma==='debito'){tx=1.5}
   else{if(L===1)pc=1;else pc=hard?rnd(7,12):pick([1,2,3,4,5,6]);tx=pc===1?3:pc<=6?4.5:6;if(v%pc)continue}
   var fee=Math.round(val*tx*10)/1000;if(tx&&(Math.round(val*tx*10)%1000))continue;
   if(forma==='dinheiro'){var nota=[5000,10000,20000].filter(function(x){return x>=val})[0];if(!nota)continue;
    fields=[{q:'Desconto de 5%',a:d},{q:'Troco que o cliente recebe',a:nota-val}];desc='em <b>dinheiro</b>, com uma nota de <b>'+fmt(nota)+'</b>'}
   else if(forma==='pix'){fields=[{q:'Desconto de 5%',a:d},{q:'Valor do Pix',a:val}];desc='no <b>Pix</b>'}
   else if(forma==='debito'){fields=[{q:'Taxa cobrada da loja',a:fee},{q:'Valor líquido que cai na sua conta',a:val-fee}];desc='no <b>débito</b>'}
   else if(pc===1){fields=[{q:'Taxa cobrada da loja',a:fee},{q:'Valor líquido que cai na sua conta',a:val-fee}];desc='no <b>crédito à vista</b>'}
   else{fields=[{q:'Valor de cada parcela',a:val/pc},{q:'Taxa cobrada da loja',a:fee}];desc='no <b>crédito em '+pc+'x</b>'}
   var lista='<ul class="lst">'+its.map(function(x){return '<li>'+x[0]+' — '+fmt(x[1])+'</li>'}).join('')+'</ul>';
   var t='Você é o lojista. O cliente levou:'+lista+'Total da compra: <b>'+fmt(v)+'</b>. Ele vai pagar '+desc+'. <b>Cobre na maquininha</b> (o valor certo, já com o desconto se houver) e <b>deixe o cliente escolher a forma de pagamento</b> na tela dele.'+tab;
   return {txt:t,modo:'pos',todos:true,venda:{valor:val,forma:forma,parc:pc},pin:'0000',fields:fields}}
  return GEN.compra(L,hard)},
 parcela:function(L){var P,n,j,t,f=[],ch=null;
  for(var g=0;g<200;g++){
   if(L===1){P=rnd(3,15)*10000;n=pick([2,3,4,5,10]);if(P%n)continue;t='Uma geladeira custa <b>'+fmt(P)+'</b> no cartão de crédito, em <b>'+n+' parcelas iguais, sem juros</b>.';f=[{q:'Valor de cada parcela',a:P/n},{q:'Total pago no fim',a:P}];break}
   if(L===2){P=rnd(80,400)*500;n=pick([3,4,5,6,8,10]);j=pick([10,20]);var tot=P+P*j/100,pa=tot/n;if(pa!==Math.round(pa))continue;var dd=pick([5,10]);var av=P-P*dd/100;t='Uma TV custa <b>'+fmt(P)+'</b>. À vista tem <b>'+dd+'% de desconto</b>. No cartão, em <b>'+n+'x</b>, o total tem <b>'+j+'% de juros</b>.';f=[{q:'Valor de cada parcela',a:pa},{q:'Total pago no parcelado',a:tot},{q:'Preço à vista com desconto',a:av}];ch={q:'Qual é a opção mais barata?',opts:['À vista com desconto','Parcelado com juros'],a:0};break}
   P=rnd(100,400)*500;n=pick([5,10]);j=pick([2,4]);var ent=P*30/100,rest=P-ent,jt=rest*j*n/100/ (n===10?1:1),pr=(rest+jt)/n;if(pr!==Math.round(pr)||ent!==Math.round(ent)||jt!==Math.round(jt))continue;
   t='Um notebook custa <b>'+fmt(P)+'</b>. Você dá <b>30% de entrada</b> e parcela o resto em <b>'+n+'x</b>, com juros simples de <b>'+j+'% ao mês</b> sobre o valor financiado (<b>'+(j*n)+'%</b> no total).';f=[{q:'Valor da entrada',a:ent},{q:'Juros pagos no total',a:jt},{q:'Valor de cada parcela',a:pr}];break}
  if(!f.length)return GEN.parcela(L);
  return {txt:t,modo:'quiz',fields:f,choose:ch,cart:'parcelado'}},
 fatura:function(L){var F=(L===1?rnd(5,30)*10000:rnd(250,1500)*200),t,f=[],mn=F*15/100,sd=F-mn;
  if(L===1){t='Sua fatura do cartão fechou em <b>'+fmt(F)+'</b>. O <b>pagamento mínimo</b> é de <b>15%</b> da fatura.';f=[{q:'Pagamento mínimo',a:mn}]}
  else if(L===2){t='Sua fatura é <b>'+fmt(F)+'</b>. Você paga só o <b>mínimo (15%)</b>. O que sobra vira <b>dívida</b> e rende <b>juros de 12% ao mês</b> (rotativo).';var jr=sd*12/100;f=[{q:'Pagamento mínimo',a:mn},{q:'Saldo que fica devendo',a:sd},{q:'Juros do mês',a:Math.round(jr)},{q:'Dívida no mês seguinte',a:sd+Math.round(jr)}]}
  else{var pg=F*40/100,rs=F-pg,jj=Math.round(rs*12/100);t='Sua fatura é <b>'+fmt(F)+'</b>. Você paga <b>40%</b> dela. O restante rende <b>juros de 12% ao mês</b>.';f=[{q:'Valor que você pagou (40%)',a:pg},{q:'Saldo que fica devendo',a:rs},{q:'Juros do mês',a:jj},{q:'Dívida no mês seguinte',a:rs+jj}]}
  return {txt:t,modo:'quiz',fields:f,cart:'fatura'}}
};

var ITENS=[['🌽','pamonha','pamonhas'],['🥟','pastel','pastéis'],['🍗','coxinha','coxinhas'],['🥤','suco','sucos'],['🍰','fatia de bolo','fatias de bolo'],['🧀','pão de queijo','pães de queijo'],['🍨','açaí','açaís'],['🍫','brigadeiro','brigadeiros'],['☕','café','cafés'],['🥖','pão francês','pães franceses'],['🥪','sanduíche','sanduíches'],['🍦','sorvete','sorvetes']];
var TIPOS=['cel','cpf','mail','ale','cnpj'];
function hora(i){var m=14*60+rnd(0,30)+i;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function zap(L,modo){
 var tp=pick(TIPOS),p=pessoa(tp),pn=pin(),its=shuffle(ITENS),l=[],v=0,calc;
 var m=modo==='mix'?pick(['soma','mult']):modo;
 if(m==='soma'){var n=L===1?2:L===2?3:4;
  for(var i=0;i<n;i++){var pr=L===1?rnd(3,15)*100:L===2?rnd(6,30)*50:rnd(40,240)*5;l.push({i:its[i],q:1,p:pr});v+=pr}
  calc='Some os preços'}
 else{
  if(L===1){var q=rnd(2,6),pr1=rnd(3,12)*100;l.push({i:its[0],q:q,p:pr1});v=q*pr1}
  else if(L===2){for(var k=0;k<2;k++){var q2=rnd(2,5),pr2=rnd(3,12)*50;l.push({i:its[k],q:q2,p:pr2});v+=q2*pr2}}
  else{var q3=rnd(3,8),pr3=rnd(8,40)*25;l.push({i:its[0],q:q3,p:pr3});v=q3*pr3;var fr=rnd(2,6)*100;l.push({i:['🛵','entrega','entregas'],q:1,p:fr});v+=fr}
  calc='Multiplique e some'}
 var linhas=l.map(function(x){return x.i[0]+' '+(x.q>1?x.q+' '+x.i[2]+' de '+fmt(x.p)+' cada':x.i[1].charAt(0).toUpperCase()+x.i[1].slice(1)+' — '+fmt(x.p))});
 var lab=({cel:'celular',cpf:'CPF',mail:'e-mail',ale:'chave aleatória',cnpj:'CNPJ'})[tp];
 var nm=p.nome,bubbles=['Oi! 👋 Aqui é '+(tp==='cnpj'?'da <b>'+nm+'</b>':'a <b>'+nm+'</b>')+'. Seu pedido ficou assim:',linhas.join('<br>'),'Faz o Pix pra mim? 🙏 Minha chave Pix é o <b>'+lab+'</b>:'];
 return {txt:'Calcule o total do pedido e envie o Pix para '+nm+'. '+pinTxt(pn),chat:{nome:nm,msgs:bubbles,chave:p.chave,calc:calc},contacts:cts(tp,p,3),target:{nome:nm,valor:v},pin:pn,modo:'pix'}}
GEN.zapsoma=function(L){return zap(L,'soma')};GEN.zapmult=function(L){return zap(L,'mult')};GEN.zapmix=function(L){return zap(L,'mix')};
/* ---------- jogo ---------- */
window.BANK={run:function(cfg){
 var BK=null;try{BK=localStorage.getItem('edu_banco')}catch(e){}if(!BANKS[BK])BK=null;
 var fi=0,ti=0,pts=0,tasks=[],T=null,ph={},lock=false,pt=0,SALDO=125000,LEDGER=[],L0=0,AC=null;
 var app=$('app');
 app.innerHTML='<div class="top"><div><h1>'+cfg.titulo+'</h1><div class="sub" id="sub"></div></div><div class="coin"><i>$</i><span id="pts">0 pontos</span></div><div class="btns"><div class="dots" id="dots"></div><select id="nivel" class="ndiv"><option value="1">6º ano</option><option value="2">7º ano</option><option value="3">8º ano</option><option value="4">9º ano</option></select><button class="btn sec" id="bBanco">🏦 Banco</button></div></div><div class="inst" id="inst"></div><div class="main"><div class="card" id="ped"><h2>📋 Pedido</h2><div id="txt" class="stm"></div><div id="qrs"></div></div><div class="card" id="stage"><div class="phone" id="phone"></div><div class="msg" id="msg"></div></div></div><div class="fim" id="fim"><div class="box"><h2 id="fT"></h2><p id="fP"></p><div id="ext"></div><button class="btn ok" id="fB"></button></div></div><div id="bpick"></div><div id="notif"></div>';
 function theme(){var b=BANKS[BK]||BANKS.nubank,s=$('phone').style;s.setProperty('--bh',b.h);s.setProperty('--bf',b.f);s.setProperty('--bb',b.b);s.setProperty('--bt',b.bt);s.setProperty('--bg',b.bg);$('phone').dataset.st=b.style}
 function pickBank(first){var bp=$('bpick');bp.className='on';bp.innerHTML='<div class="box"><h2>🏦 Escolha o seu banco</h2><p>O app do celular vai imitar o do banco escolhido.</p><div class="bks">'+Object.keys(BANKS).map(function(k){var b=BANKS[k];return '<button data-k="'+k+'" style="background:'+b.h+';color:'+b.f+'">'+b.n+'</button>'}).join('')+'</div></div>';
  bp.onclick=function(e){var k=e.target.dataset&&e.target.dataset.k;if(!k)return;BK=k;try{localStorage.setItem('edu_banco',k)}catch(x){}bp.className='';theme();ph.s=ph.s;draw()}}
 $('bBanco').onclick=function(){pickBank()};
 function setPts(d){pts=Math.max(0,pts+d);$('pts').textContent=pts+' pontos'}
 function dots(){var d=$('dots');d.innerHTML='';tasks.forEach(function(_,i){var x=document.createElement('i');x.className=i<ti?'d':i===ti?'c':'';d.appendChild(x)})}
 function msg(t,c){$('msg').textContent=t;$('msg').className='msg '+(c||'')}
 function fase(){var L=cfg.niveis[fi];var hard=L>3;if(hard)L=3;tasks=[];var seen={};for(var g=0;g<80&&tasks.length<6;g++){var t=GEN[cfg.gen](L,hard);if(seen[t.txt])continue;seen[t.txt]=1;tasks.push(t)}ti=0;task()}
 function isTab(){try{return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)>=600}catch(e){return false}}
 function ftxt(x){return x.forma==='debito'?'Débito':x.forma==='pix'?'Pix':x.forma==='dinheiro'?'Dinheiro':'Crédito '+(x.parc>1?x.parc+'x':'à vista')}
 function task(){T=tasks[ti];lock=false;ph={s:T.modo==='pos'?'pos-valor':'home',buf:'',pb:'',vals:[],sale:{},rot:isTab()};msg('');
  $('txt').innerHTML=T.chat?chatHtml(T.chat)+'<div class="pnote">🔐 '+pinTxt(T.pin)+' <b>'+T.chat.calc+'</b> e envie o Pix.</div>':T.txt;$('ped').querySelector('h2').textContent=T.chat?'💬 WhatsApp':'📋 Pedido';var q=$('qrs');q.innerHTML='';
  if(T.qrs)q.innerHTML='<div class="qrl">'+T.qrs.map(function(x,i){return '<div class="qrc"><div class="qrimg"></div><b>QR Code '+x.letra+'</b><span>'+x.nome+'</span><span class="qv">'+fmt(x.valor)+'</span><button class="btn sec" data-qr="'+i+'">📷 Escanear</button></div>'}).join('')+'</div>';
  notify();$('inst').innerHTML=cfg.instrucao;$('sub').textContent='Fase '+(fi+1)+'/4 · questão '+(ti+1)+'/'+tasks.length;dots();draw()}
 /* ----- desenho do celular ----- */

 var clip='',sel=null;
 function chatHtml(c){var h='<div class="wa"><div class="wh"><i>‹</i><span class="av">'+c.nome.charAt(0)+'</span><div><b>'+c.nome+'</b><small>online</small></div></div><div class="wbar" id="wbar"><button data-w="x">✕</button><span>1 selecionada</span><button data-w="copy">📋 Copiar</button></div><div class="wb">';
  c.msgs.forEach(function(m,i){h+='<div class="bub"><span>'+m+'</span><small>'+hora(i)+'</small></div>'});
  h+='<div class="bub key" data-chave="1"><span>'+c.chave+'</span><button class="cp" data-w="copykey" type="button">📋 Copiar chave</button><small>'+hora(5)+'</small></div></div><div class="wf"><span>Mensagem</span> 🎤</div></div>';return h}

 function backFor(x){var k=(BANKS[BK]||BANKS.nubank).kind;if(k==='caixa')return x==='chave'?'cx-conta':'cx-pix';if(k==='mp')return x==='chave'?'mp-transf':'mp-pagar';return 'menu'}

 function beep2(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=180;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+.35);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.4)}catch(e){}}
 function beep(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime;[880,1175].forEach(function(f,i){var o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.15,t+i*.14);g.gain.exponentialRampToValueAtTime(.0001,t+i*.14+.25);o.connect(g);g.connect(AC.destination);o.start(t+i*.14);o.stop(t+i*.14+.3)})}catch(e){}}
 function notify(){var n=$('notif'),pd=$('ped');if(!T||(T.modo!=='pix'&&T.modo!=='qr')){n.className='';pd.classList.remove('lock');return}
  var nm=(T.chat&&T.chat.nome)||T.target.nome,tx=pick(['Oi! Você ainda não me pagou 😅','Ei, lembra do Pix que ficou pendente? 🙏','Você esqueceu de me pagar! 😬','Oi, tudo bem? Cadê o meu Pix? 💸','Preciso que você me pague, por favor 🙏']);
  n.innerHTML='<div class="nt"><span class="ni">💬</span><div><small>WHATSAPP · agora</small><b>'+nm+'</b><span>'+tx+'</span></div></div>';n.className='on';pd.classList.add('lock');beep()}
 $('notif').addEventListener('click',function(){$('notif').className='';$('ped').classList.remove('lock')});
 function extrato(){var L=LEDGER.slice(L0),ok=L.filter(function(x){return x.ok}).length,pago=L.reduce(function(a,x){return a+x.v},0);
  return '<div class="ex"><h3>🧾 Extrato Pix</h3>'+(L.length?'<table>'+L.map(function(x){return '<tr class="'+(x.ok?'o':'e')+'"><td>'+x.h+'</td><td>Pix para '+x.n+'<small>'+x.b+'</small></td><td>− '+fmt(x.v)+'</td><td>'+(x.ok?'✔':'✘')+'</td></tr>'}).join('')+'</table>':'<p>Nenhum Pix nesta fase.</p>')+'<div class="sm"><span>Pix certos: <b>'+ok+'/'+L.length+'</b></span><span>Total enviado: <b>'+fmt(pago)+'</b></span><span>Saldo na conta: <b>'+fmt(SALDO)+'</b></span></div></div>'}
 function hd(t,back){var b=BANKS[BK]||BANKS.nubank;return '<div class="hd '+b.style+'">'+(back?'<button class="bk" data-a="'+back+'">‹</button>':'')+'<span>'+t+'</span></div>'}
 function toast(t){var e=$('phone').querySelector('.toast');if(e)e.remove();var d=document.createElement('div');d.className='toast';d.textContent=t;$('phone').appendChild(d);setTimeout(function(){d.remove()},2600)}
 function keypad(){return '<div class="kp">'+[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(function(k){return '<button data-k="'+k+'">'+k+'</button>'}).join('')+'</div>'}
 function dots4(n){return '<div class="pd">'+[0,1,2,3].map(function(i){return '<i class="'+(i<n?'f':'')+'"></i>'}).join('')+'</div>'}
 function draw(){var P=$('phone'),b=BANKS[BK]||BANKS.nubank,s=ph.s,h='';theme();if(!BK){pickBank(1);return}
  if(s==='load')h='<div class="ld"><div class="sp"></div><p>Aguarde...</p></div>';
  else if(s==='home'&&b.kind==='row')h=hd('Olá, Aluno')+'<div class="sal">Conta<b>'+fmt(SALDO)+'</b></div><div class="rw">'+[['💠','Pix','menu',1],['📄','Pagar','off'],['🔁','Transferir','off'],['💳','Cartão','off'],['📱','Recarga','off']].map(function(x){return '<button data-a="'+(x[2]||'off')+'" class="'+(x[3]?'hot':'')+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div><div class="ls"><button data-a="off"><i>💰</i>Rendimento<small>Seu dinheiro rende todo dia</small></button><button data-a="off"><i>🧾</i>Fatura atual<small>R$ 482,10</small></button></div>';
  else if(s==='home'&&b.kind==='grid')h=hd(b.n)+'<div class="sal">Saldo disponível<b>'+fmt(SALDO)+'</b></div><div class="gr">'+[['🏠','Início','off'],['📄','Pagar','off'],['🔁','Transferir','off'],['💳','Cartões','off'],['💠','Pix','menu'],['⋯','Mais','off']].map(function(x){return '<button class="gb" data-a="'+x[2]+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div>';
  else if(s==='home'&&b.kind==='caixa')h=hd('Caixa Tem')+'<div class="sal">Poupança Social Digital<b>'+fmt(SALDO)+'</b></div><div class="ls">'+[['👤','Meu perfil','off'],['🧾','Pagar contas e boletos','off'],['💳','Cartão de débito virtual','off'],['🏦','Poupança Social Digital','off'],['🎁','Benefícios','off'],['💠','Pix','cx-pix'],['❓','Ajuda','off']].map(function(x){return '<button data-a="'+x[2]+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div>';
  else if(s==='home'&&b.kind==='mp')h=hd('Mercado Pago')+'<div class="mpc"><small>Dinheiro disponível</small><b>'+fmt(SALDO)+'</b><span>Rendendo 100% do CDI</span></div><div class="rw mpr">'+[['⬆️','Transferir','mp-transf'],['🧾','Pagar serviços','mp-pagar'],['📱','Recarga','off'],['💸','Cobrar','off'],['🛍️','Mercado Livre','off']].map(function(x){return '<button data-a="'+x[2]+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div><div class="ls"><button data-a="off"><i>🎁</i>Promoções<small>Cupons e descontos</small></button></div>';
  else if(s==='cx-pix')h=hd('Pix','home')+'<div class="ls"><button data-a="cx-aviso:q"><i>📷</i>Pagar com QR Code</button><button data-a="cx-aviso:t"><i>📤</i>Pagar / Transferir com chave</button><button data-a="off"><i>📥</i>Receber</button><button data-a="off"><i>🔑</i>Minhas chaves</button><button data-a="off"><i>⚙️</i>Limites</button></div>';
  else if(s==='cx-aviso')h=hd('Atenção','cx-pix')+'<div class="bd"><div class="av2">⚠️<b>Cuidado com golpes!</b><p>A Caixa nunca pede sua senha por telefone, mensagem ou aplicativo. Confira sempre o nome de quem vai receber.</p></div><button class="pb" data-a="cx-next">Entendi, continuar</button></div>';
  else if(s==='cx-conta')h=hd('Conta de origem','cx-aviso')+'<div class="bd"><label>De qual conta sai o dinheiro?</label><button class="pb sec" data-a="chave">Poupança Social Digital<br><small>Ag 0001 · Conta ••••4821</small></button></div>';
  else if(s==='cx-rev')h=hd('Revisar e aceitar','conf')+'<div class="bd"><div class="cf"><span>Você está transferindo</span><b class="big">'+fmt(ph.v)+'</b><span>Para</span><b>'+ph.c.nome+'</b><span>Conta de origem</span><b>Poupança Social ••••4821</b></div><p class="hint">Ao continuar você aceita os termos do Pix.</p><button class="pb" data-a="cx-ok">Aceitar e continuar</button></div>';
  else if(s==='mp-transf')h=hd('Transferir','home')+'<div class="ls"><button data-a="off"><i>🟦</i>Para uma conta do Mercado Pago</button><button data-a="off"><i>🏦</i>Para uma conta bancária (TED)</button><button data-a="chave"><i>💠</i>Pix<small>Com CPF, celular, e-mail ou chave</small></button></div>';
  else if(s==='mp-pagar')h=hd('Pagar serviços','home')+'<div class="ls"><button data-a="off"><i>🧾</i>Boleto ou conta de consumo</button><button data-a="off"><i>🚌</i>Transporte</button><button data-a="cam"><i>📷</i>Escanear QR Code<small>Pix e outros pagamentos</small></button></div>';
  else if(s==='home')h=hd(b.n)+'<div class="sal">Saldo</div>';
  else if(s==='menu')h=hd('Área Pix','home')+'<div class="ls"><button data-a="chave"><i>📤</i>Transferir<small>Por chave: CPF, celular, e-mail...</small></button><button data-a="cam"><i>📷</i>Pagar com QR Code<small>Aponte a câmera</small></button><button data-a="off"><i>📥</i>Receber</button><button data-a="off"><i>🔑</i>Minhas chaves</button></div>';
  else if(s==='chave')h=hd('Transferir com Pix',backFor('chave'))+'<div class="bd"><label>Para quem você quer enviar?</label><input id="inChave" type="text" autocomplete="off" placeholder="CPF/CNPJ, celular, e-mail ou chave aleatória" value="'+(ph.chave||'')+'"><button class="pb sec" data-a="colar">📋 Colar</button><button class="pb" data-a="chave-ok">Continuar</button><p class="hint">Digite a chave exatamente como está no pedido.</p></div>';
  else if(s==='valor')h=hd('Valor','chave')+'<div class="bd"><div class="who">Para <b>'+ph.c.nome+'</b></div><label>Qual valor você quer enviar?</label><input id="inVal" type="text" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00"><button class="pb" data-a="valor-ok">Continuar</button></div>';
  else if(s==='cam')h=hd('Pagar com Pix',backFor('cam'))+'<div class="cam"><div class="vf"></div><p>Aponte a câmera para o QR Code<br><small>Toque em <b>📷 Escanear</b> no QR Code certo (lado esquerdo).</small></p></div>';
  else if(s==='conf')h=hd('Confirme os dados','menu')+'<div class="bd"><div class="cf"><span>Valor</span><b class="big">'+fmt(ph.v)+'</b><span>Para</span><b>'+ph.c.nome+'</b><span>Instituição</span><b>'+ph.c.banco+'</b><span>Chave</span><b>'+ph.c.chave+'</b></div><button class="pb" data-a="conf-ok">Transferir agora</button><button class="pb sec" data-a="cancel">Cancelar</button></div>';
  else if(s==='pin')h=hd('Senha de 4 dígitos')+'<div class="bd c"><p>Digite a senha do app para confirmar</p>'+dots4(ph.pb.length)+keypad()+'</div>';
  else if(s==='rec')h='<div class="rc"><div class="ck">✔</div><h3>Pix enviado!</h3><b class="big">'+fmt(ph.v)+'</b><p>para <b>'+ph.c.nome+'</b><br>'+ph.c.banco+'</p><small>'+new Date().toLocaleString('pt-BR')+'</small></div>';
  else if(s==='pos-valor')h='<div class="pos lj'+(ph.back?' back'+(ph.rot?' rot':''):'')+'"><div class="ps"><small>🏪 LOJISTA · valor da venda</small><b class="big">'+fmt(+ph.buf||0)+'</b></div>'+keypad()+'</div>';
  else if(s==='pos-cobrar')h='<div class="pos lj"><div class="ps"><small>Cobrança</small><b class="big">'+fmt(ph.sale.valor)+'</b><small>Entregue a maquininha ao cliente</small></div><button class="card3" data-a="pos-vira">🔄<br>Virar a maquininha<br>para o cliente</button>'+(ph.rot?'<small class="aut">Girando automaticamente…</small>':'')+'</div>';
  else if(s==='pos-c-forma')h='<div class="pos cli '+(ph.rot?'rot':'flip')+'"><div class="ps"><small>👤 CLIENTE · confira o valor</small><b class="big">'+fmt(ph.sale.valor)+'</b><small>Como você quer pagar?</small></div><button class="pb" data-f="debito">💳 Débito</button><button class="pb" data-f="credito">💳 Crédito</button><button class="pb" data-f="pix">💠 Pix</button>'+(T.todos?'<button class="pb" data-f="dinheiro">💵 Dinheiro</button>':'')+'<button class="gir" data-a="pos-rot">🔄 Girar tela</button></div>';
  else if(s==='pos-c-parc')h='<div class="pos cli '+(ph.rot?'rot':'')+'"><div class="ps"><small>Crédito · '+fmt(ph.sale.valor)+'</small><small>Em quantas parcelas?</small></div><div class="pg">'+[1,2,3,4,5,6,7,8,9,10,11,12].map(function(n){return '<button data-p="'+n+'">'+(n===1?'À vista':n+'x')+'</button>'}).join('')+'</div></div>';
  else if(s==='pos-c-cartao')h='<div class="pos cli '+(ph.rot?'rot':'')+'"><div class="ps"><small>'+ftxt(ph.sale)+' · '+fmt(ph.sale.valor)+'</small><small>Aproxime ou insira o seu cartão</small></div><button class="card3" data-a="pos-cartao">💳<br>Toque aqui para aproximar</button></div>';
  else if(s==='pos-c-pin')h='<div class="pos cli '+(ph.rot?'rot':'')+(ph.perr?' shake':'')+'"><div class="ps"><small>'+ftxt(ph.sale)+' · '+fmt(ph.sale.valor)+'</small><small>'+(ph.perr?'❌ SENHA INCORRETA — tente de novo':'Digite a senha do cartão')+'</small></div>'+dots4(ph.pb.length)+keypad()+'</div>';
  else if(s==='pos-c-pix')h='<div class="pos cli '+(ph.rot?'rot':'')+'"><div class="ps"><small>Pix · '+fmt(ph.sale.valor)+'</small><small>Leia o QR Code com o app do seu banco</small></div><div class="qrimg qrbig"></div><button class="pb" data-a="pos-pixpago">Já paguei no app ✔</button></div>';
  else if(s==='pos-ok'||s==='quiz-pos')h='<div class="pos lj ok'+(ph.back?' back'+(ph.rot?' rot':''):'')+'"><div class="ps"><b class="big">'+(ph.sale.forma==='dinheiro'?'DINHEIRO RECEBIDO ✔':ph.sale.forma==='pix'?'PIX RECEBIDO ✔':'APROVADA ✔')+'</b><small>'+ftxt(ph.sale)+'</small><b class="big">'+fmt(ph.sale.valor)+'</b></div>'+fieldsHtml()+'</div>';
  else if(s==='quiz')h=hd(T.cart==='fatura'?'Fatura do cartão':'Compra no cartão')+'<div class="bd"><div class="cart">💳<div><small>'+b.n+' · final 4821</small><b>Cartão de crédito</b></div></div>'+fieldsHtml()+'</div>';
  P.innerHTML=h;var ic=P.querySelector('#inChave');if(ic)setTimeout(function(){ic.focus()},50);var iv=P.querySelector('#inVal');if(iv)setTimeout(function(){iv.focus()},50)}
 function fieldsHtml(){return '<div class="fl">'+T.fields.map(function(f,i){return '<label>'+f.q+'</label><input class="fi" data-i="'+i+'" type="text" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00">'}).join('')+(T.choose?'<label>'+T.choose.q+'</label><div class="ch">'+T.choose.opts.map(function(o,i){return '<button data-ch="'+i+'">'+o+'</button>'}).join('')+'</div>':'')+'<button class="pb" data-a="quiz-ok">Conferir ✔</button></div>'}
 var LENTO=['cx-pix','cx-aviso','cx-conta','chave','valor','conf','cx-rev','cam'];
 function fimCli(){ph.back=true;ph.perr=false;ph.pb='';go('pos-ok')}
 function go(s){var k=(BANKS[BK]||{}).kind;if(k==='caixa'&&LENTO.indexOf(s)>=0&&!ph.fast){ph.s='load';draw();setTimeout(function(){ph.s=s;draw()},1000);return}ph.s=s;draw()}
 function wrong(m){if(lock)return;setPts(-10);msg(m,'bad');var P=$('phone');P.classList.add('shake');setTimeout(function(){P.classList.remove('shake');ph.s=T.modo==='pos'?'pos-valor':'home';ph.buf='';ph.pb='';ph.chave='';ph.sale={};ph.back=false;ph.perr=false;draw()},1400)}
 function right(m){lock=true;setPts(15);msg(m,'good');setTimeout(function(){ti++;if(ti>=tasks.length)fim();else task()},1800)}
 function fim(){var f=$('fim');$('fT').textContent=fi<3?'Fase '+(fi+1)+' concluída! 🎉':'Parabéns! Terminou todas as fases! 🏆';$('fP').textContent='Você tem '+pts+' pontos.';$('fB').textContent=fi<3?'Próxima fase ▶':'Jogar de novo ↺';f.classList.add('on');$('ext').innerHTML=LEDGER.length>L0?extrato():'';$('fB').onclick=function(){f.classList.remove('on');L0=LEDGER.length;if(fi<3)fi++;else{fi=0;pts=0;setPts(0);SALDO=125000;LEDGER=[];L0=0}$('nivel').value=cfg.niveis[fi];fase()}}
 function judge(){var ok=ph.c.nome===T.target.nome&&ph.v===T.target.valor;SALDO-=ph.v;LEDGER.push({n:ph.c.nome,b:ph.c.banco,v:ph.v,ok:ok,h:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})});
  setTimeout(function(){if(ok)right('Pix certo! '+fmt(ph.v)+' para '+ph.c.nome+'.');
   else if(ph.c.nome!==T.target.nome)wrong('Você enviou o Pix para '+ph.c.nome+', a pessoa errada! Sempre confira o nome antes de confirmar.');
   else wrong('O valor enviado está errado. Refaça o cálculo do pedido.')},900)}
 function press(k,pos){
  if(ph.s==='pos-valor'){if(k==='⌫')ph.buf=ph.buf.slice(0,-1);else if(k==='OK'){var v=+ph.buf||0;if(v<=0){toast('Digite o valor');return}ph.sale.valor=v;go('pos-cobrar');if(ph.rot)setTimeout(function(){if(ph.s==='pos-cobrar')go('pos-c-forma')},1600);return}else if(ph.buf.length<8)ph.buf+=k;draw();return}
  if(ph.s==='pos-c-pin'){ph.perr=false;if(k==='⌫')ph.pb=ph.pb.slice(0,-1);else if(k==='OK')return;else if(ph.pb.length<4)ph.pb+=k;
   if(ph.pb.length===4){if(+ph.pb%2===0){fimCli();return}ph.pb='';ph.perr=true;beep2()}draw();return}
  if(k==='⌫')ph.pb=ph.pb.slice(0,-1);else if(k==='OK')return;else if(ph.pb.length<4)ph.pb+=k;
  if(ph.pb.length===4){if(ph.pb===T.pin){var nx=ph.s==='pin'?'rec':'pos-ok';ph.pb='';go(nx);if(nx==='rec')judge();else ph.s='pos-ok',draw();return}else{ph.pb='';toast('Senha incorreta');}}
  draw()}
 $('phone').addEventListener('click',function(e){var t=e.target.closest('button');if(!t||lock||ph.s==='load')return;
  if(t.dataset.k!==undefined)return press(t.dataset.k);
  if(t.dataset.f){var f=t.dataset.f;ph.sale.forma=f;ph.sale.parc=1;if(f==='debito')go('pos-c-cartao');else if(f==='credito')go('pos-c-parc');else if(f==='pix')go('pos-c-pix');else fimCli();return}
  if(t.dataset.p){ph.sale.parc=+t.dataset.p;go('pos-c-cartao');return}
  if(t.dataset.ch!==undefined){ph.ch=+t.dataset.ch;[].forEach.call(t.parentNode.children,function(x){x.classList.remove('on')});t.classList.add('on');return}
  var a=t.dataset.a,par=null;if(!a)return;if(a.indexOf(':')>0){par=a.split(':')[1];a=a.split(':')[0]}
  if(a==='cx-aviso'){ph.dest=par;return go('cx-aviso')}
  if(a==='cx-next')return go(ph.dest==='q'?'cam':'cx-conta');
  if(a==='cx-ok'){ph.pb='';ph.s='pin';return draw()}
  if(a==='off')return toast('Nesta atividade use o Pix 💠');
  if(a==='colar'){if(!clip)return toast('Nada copiado. Copie a chave no WhatsApp.');$('inChave').value=clip;ph.chave=clip;return}
  if(a==='chave-ok'){var v=$('inChave').value;ph.chave=v;var c=T.contacts.filter(function(x){return norm(x.chave)===norm(v)})[0];if(!c)return toast('Chave Pix não encontrada. Confira os dados.');ph.c=c;go('valor');return}
  if(a==='valor-ok'){var n=parse($('inVal').value);if(!(n>0))return toast('Digite um valor válido');if(n>SALDO)return toast('Saldo insuficiente');ph.v=n;go('conf');return}
  if(a==='conf-ok'){ph.pb='';if((BANKS[BK]||{}).kind==='caixa'){go('cx-rev');return}go('pin');return}
  if(a==='cancel'){ph.c=null;toast('Pix cancelado');go('home');return}
  if(a==='pos-vira'){go('pos-c-forma');return}
  if(a==='pos-rot'){ph.rot=!ph.rot;draw();return}
  if(a==='pos-pixpago'){fimCli();return}
  if(a==='pos-cartao'){ph.pb='';ph.perr=false;go('pos-c-pin');return}
  if(a==='quiz-ok')return quiz();
  go(a)});
 function quiz(){var ins=[].slice.call($('phone').querySelectorAll('.fi')),ok=true,miss=[];
  ins.forEach(function(i,k){var v=parse(i.value);if(!(v===T.fields[k].a)){ok=false;miss.push(T.fields[k].q)}i.classList.toggle('bad',v!==T.fields[k].a)});
  if(T.modo==='pos'){var s=ph.sale,V=T.venda;if(s.valor!==V.valor||s.forma!==V.forma||(s.parc||1)!==V.parc)return wrong('A venda na maquininha não confere com o pedido (valor, forma ou parcelas).')}
  if(T.choose&&ph.ch!==T.choose.a){ok=false;miss.push(T.choose.q)}
  if(ok)right('Tudo certo! 🎉');else wrong('Confira: '+miss[0]+(miss.length>1?' (e mais '+(miss.length-1)+')':'')+'.')}

 function mask(v){var d=String(v).replace(/\D/g,'').replace(/^0+/,'');if(!d)return '';while(d.length<3)d='0'+d;var c=d.slice(-2),r=d.slice(0,-2).replace(/\B(?=(\d{3})+(?!\d))/g,'.');return r+','+c}
 $('phone').addEventListener('input',function(e){var t=e.target;if(t.id==='inVal'||t.classList.contains('fi')){t.value=mask(t.value);try{t.setSelectionRange(t.value.length,t.value.length)}catch(x){}}});
 $('qrs').addEventListener('click',function(e){var t=e.target.closest('button');if(!t||lock)return;if(ph.s!=='cam')return toast2('Abra o Pix no celular: Pix → Pagar com QR Code.');var q=T.qrs[+t.dataset.qr];ph.c={nome:q.nome,banco:'Banco da loja',chave:'QR Code '+q.letra};ph.v=q.valor;go('conf')});
 function toast2(t){msg(t,'bad');setTimeout(function(){if(!lock)msg('')},2600)}

 $('txt').addEventListener('contextmenu',function(e){e.preventDefault()});
 $('txt').addEventListener('click',function(e){var bb=e.target.closest('.bub'),w=e.target.closest('[data-w]');var bar=$('wbar');if(w&&w.dataset.w==='copykey'){sel=w.parentNode.querySelector('span').innerText;clip=sel;try{navigator.clipboard.writeText(sel)}catch(x){}msg('Chave copiada! Agora cole no Pix 📋','good');setTimeout(function(){if(!lock)msg('')},2600);return}
  if(w){if(w.dataset.w==='copy'&&sel){clip=sel;try{navigator.clipboard.writeText(sel)}catch(x){}msg('Chave copiada! Agora cole no Pix 📋','good');setTimeout(function(){if(!lock)msg('')},2600)}if(bar)bar.classList.remove('on');[].forEach.call(document.querySelectorAll('.bub.sel'),function(x){x.classList.remove('sel')});return}
  if(bb){[].forEach.call(document.querySelectorAll('.bub.sel'),function(x){x.classList.remove('sel')});bb.classList.add('sel');sel=bb.querySelector('span').innerText;if(bar)bar.classList.add('on')}});
 $('nivel').onchange=function(){fi=cfg.niveis.indexOf(+$('nivel').value);if(fi<0)fi=0;fase()};
 $('nivel').value=cfg.niveis[0];
 theme();fase();if(!BK)pickBank(1)}};
})();
