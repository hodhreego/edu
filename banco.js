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
function fmt(c){var n=c<0;c=Math.abs(c);return (n?'− ':'')+'R$ '+Math.floor(c/100).toLocaleString('pt-BR')+','+String(c%100).padStart(2,'0')}
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
 contas:function(L,hard){var B=[['Energia elétrica','Copel','⚡'],['Água e esgoto','Sanepar','💧'],['Internet fibra','Vivo Fibra','🌐'],['Fatura do celular','Claro','📱'],['Gás encanado','Compagas','🔥'],['Condomínio','Edifício Aurora','🏢']],b=pick(B),
   base=L===1?rnd(6,60)*500:rnd(4,40)*5000,mes=L===1?0:(L===2?1:2),multa=0,jur=0,tot,cod='8'+rnd(1000,9999)+rnd(10000,99999)+rnd(10000,99999)+rnd(10000,99999)+rnd(1000,9999),pn=pin(),venc=rnd(5,25);
   if(mes){multa=base*2/100;jur=base*mes/100;tot=base+multa+jur}else tot=base;
   var cod2=cod.replace(/(\d{5})(?=\d)/g,'$1 ').trim(),nome=b[2]+' '+b[1];
   var t='Você recebeu a conta de <b>'+b[0].toLowerCase()+'</b> ('+b[1]+'). Valor do documento: <b>'+fmt(base)+'</b>, vencimento dia <b>'+venc+'</b>.'+(mes?' A conta está <b>vencida há '+mes+' mês'+(mes>1?'es':'')+'</b>: cobra-se <b>multa de 2%</b> e <b>juros de 1% ao mês</b>. Calcule o <b>valor total a pagar</b>.':' Pague o valor do documento.')+' Abra o app do banco, vá em <b>Pagar</b>, cole o código de barras e confirme. '+pinTxt(pn);
   return {txt:t,modo:'pix',bill:{nome:nome,base:base,mes:mes},contacts:[{nome:nome,banco:'Boleto',chave:cod2}],target:{nome:nome,valor:tot},pin:pn}},
 parcela:function(L){var P,n,j,t,f=[],ch=null;
  for(var g=0;g<200;g++){
   if(L===1){P=rnd(3,15)*10000;n=pick([2,3,4,5,10]);if(P%n)continue;t='Uma geladeira custa <b>'+fmt(P)+'</b> no cartão de crédito, em <b>'+n+' parcelas iguais, sem juros</b>.';f=[{q:'Valor de cada parcela',a:P/n},{q:'Total pago no fim',a:P}];break}
   if(L===2){P=rnd(80,400)*500;n=pick([3,4,5,6,8,10]);j=pick([10,20]);var tot=P+P*j/100,pa=tot/n;if(pa!==Math.round(pa))continue;var dd=pick([5,10]);var av=P-P*dd/100;t='Uma TV custa <b>'+fmt(P)+'</b>. À vista tem <b>'+dd+'% de desconto</b>. No cartão, em <b>'+n+'x</b>, o total tem <b>'+j+'% de juros</b>.';f=[{q:'Valor de cada parcela',a:pa},{q:'Total pago no parcelado',a:tot},{q:'Preço à vista com desconto',a:av}];ch={q:'Qual é a opção mais barata?',opts:['À vista com desconto','Parcelado com juros'],a:0};break}
   P=rnd(100,400)*500;n=pick([5,10]);j=pick([2,4]);var ent=P*30/100,rest=P-ent,jt=rest*j*n/100/ (n===10?1:1),pr=(rest+jt)/n;if(pr!==Math.round(pr)||ent!==Math.round(ent)||jt!==Math.round(jt))continue;
   t='Um notebook custa <b>'+fmt(P)+'</b>. Você dá <b>30% de entrada</b> e parcela o resto em <b>'+n+'x</b>, com juros simples de <b>'+j+'% ao mês</b> sobre o valor financiado (<b>'+(j*n)+'%</b> no total).';f=[{q:'Valor da entrada',a:ent},{q:'Juros pagos no total',a:jt},{q:'Valor de cada parcela',a:pr}];break}
  if(!f.length)return GEN.parcela(L);
  return {txt:t,modo:'quiz',fields:f,choose:ch,cart:'parcelado'}},
 fatura:function(L,hard){var F=(L===1?rnd(2,10):L===2?rnd(4,16):rnd(6,20))*5000,mn=F*15/100,pn=pin(),fm=pick(['pix','boleto','debito']),
   fx={pix:'pelo <b>Pix</b> (copia e cola)',boleto:'pelo <b>boleto</b>',debito:'por <b>débito em conta</b>'}[fm],t,f=[],pay,sd,jr,tx=12,
   base='Sua fatura do cartão fechou em <b>'+fmt(F)+'</b>, com vencimento no dia <b>10</b>. O <b>pagamento mínimo</b> é <b>15%</b> da fatura. ';
  if(L===1){pay=mn;t=base+'Abra o app, vá em <b>Cartão → Fatura</b> e pague <b>só o valor mínimo</b> '+fx+'.';f=[{q:'Pagamento mínimo (15%)',a:mn}]}
  else if(L===2){pay=mn;sd=F-mn;jr=sd*tx/100;t=base+'Pague <b>só o mínimo</b> '+fx+'. O que sobra vira dívida no <b>rotativo</b>, com <b>juros de '+tx+'% ao mês</b>.';f=[{q:'Pagamento mínimo (15%)',a:mn},{q:'Saldo que fica devendo',a:sd},{q:'Juros que serão cobrados no mês que vem',a:jr},{q:'Dívida no mês que vem (saldo + juros)',a:sd+jr}]}
  else{var pc=pick([20,25,30]);pay=F*pc/100;sd=F-pay;jr=sd*tx/100;t=base+'Você decide pagar <b>'+pc+'%</b> da fatura (mais que o mínimo) '+fx+'. O restante rende <b>juros de '+tx+'% ao mês</b> no rotativo.';f=[{q:'Valor que você vai pagar ('+pc+'%)',a:pay},{q:'Saldo que fica devendo',a:sd},{q:'Juros que serão cobrados no mês que vem',a:jr},{q:'Dívida no mês que vem (saldo + juros)',a:sd+jr}]}
  return {txt:t+' '+pinTxt(pn),modo:'quiz',fields:f,cart:'fatura',F:F,min:mn,pay:pay,forma:fm,pin:pn,code:'00020126'+rnd(1000,9999)+'BR.GOV.BCB.PIX0114'+rnd(10000000,99999999)+'0001'+rnd(10,99)+'5204000053039865802BR5913CARTAO FATURA6009SAO PAULO62070503***6304'+rnd(1000,9999)}}
};

var ITENS=[['🌽','pamonha','pamonhas'],['🥟','pastel','pastéis'],['🍗','coxinha','coxinhas'],['🥤','suco','sucos'],['🍰','fatia de bolo','fatias de bolo'],['🧀','pão de queijo','pães de queijo'],['🍨','açaí','açaís'],['🍫','brigadeiro','brigadeiros'],['☕','café','cafés'],['🥖','pão francês','pães franceses'],['🥪','sanduíche','sanduíches'],['🍦','sorvete','sorvetes']];
var TIPOS=['cel','cpf','mail','ale','cnpj'];
var HB=rnd(0,30);function hora(i){var m=14*60+HB+i*3;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
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
 var nm=p.nome,cn=tp==='cnpj',B=cn?'<b>'+nm+'</b>':'<b>'+nm+'</b>',ST=[
  ['Boa tarde! Aqui é '+(cn?'da ':'')+B+'. Segue o seu pedido:',null,'Quando puder, faça o Pix, por gentileza. Muito obrigado! 🙏'],
  ['😍🛍️ Oiee! '+B+' aqui!! Olha o seu pedido:',null,'Faz o Pixzinho? 🙏🙏🙏💸✨'],
  ['Ei. Cadê o dinheiro do pedido?',null,'Paga logo, tô esperando faz tempo. 😒'],
  ['Oi, sou '+(cn?'da ':'')+B+'. Pedido fechado:',null,'<span class="stk">E O PIX?? 💸😤</span>'],
  ['pedido de hoje:',null,'pix pls 🫶'],
  ['Gente, fecha logo que eu preciso pagar o fornecedor hoje!! ⏰ '+B,null,'Manda o Pix assim que puder, é urgente 🚨'],
  ['E aí, mano! Fechou o rolê, bora acertar? 😎 ('+B+')',null,'Manda o Pix aí que tô sem grana kkkkk 😂'],
  ['Prezado cliente, '+(cn?'a ':'')+B+' agradece a preferência. Resumo do pedido:',null,'Solicitamos o pagamento via Pix, pela chave abaixo. Atenciosamente.'],
  ['Oi! 👋 Tudo bem? Aqui é '+(cn?'da ':'')+B+'. Seu pedido ficou assim:',null,'Pode mandar o Pix? 🙏 Minha chave é o <b>'+lab+'</b>:'],
  ['Bom dia, flor ☀️🌷 '+B+' falando!',null,'Quando puder, me manda o Pix, tá? Beijo 😘']],
  sx=pick(cn?[0,1,5,7,8]:[0,1,2,3,4,5,6,8,9]),sy=ST[sx],bubbles=[sy[0],linhas.join('<br>'),sy[2]];
 return {txt:'Calcule o total do pedido e envie o Pix para '+nm+'. '+pinTxt(pn),chat:{nome:nm,msgs:bubbles,chave:p.chave,calc:calc},contacts:cts(tp,p,3),target:{nome:nm,valor:v},pin:pn,modo:'pix'}}
GEN.zapsoma=function(L){return zap(L,'soma')};GEN.zapmult=function(L){return zap(L,'mult')};GEN.zapmix=function(L){return zap(L,'mix')};
/* ---------- jogo ---------- */
window.BANK={run:function(cfg){
 var BK=null;try{BK=localStorage.getItem('edu_banco')}catch(e){}if(!BANKS[BK])BK=null;
 var fi=0,ti=0,pts=0,tasks=[],T=null,ph={},lock=false,pt=0,SAL={},SAL0={},LEDGER=[],L0=0,AC=null,INC=null,CHESP=null,BLOQ={},GRUPOS=[],LIVE={};
 var app=$('app');
 app.innerHTML='<div class="top"><div><h1>'+cfg.titulo+'</h1><div class="sub" id="sub"></div></div><div class="coin"><i>$</i><span id="pts">0 pontos</span></div><div class="btns"><div class="dots" id="dots"></div><select id="nivel" class="ndiv"><option value="1">6º ano</option><option value="2">7º ano</option><option value="3">8º ano</option><option value="4">9º ano</option></select><button class="btn sec" id="bBanco">🏦 Banco</button></div></div><div class="inst" id="inst"></div><div id="bkbar"></div><div class="main"><div class="card" id="ped"><h2>📋 Pedido</h2><div id="txt" class="stm"></div><div id="qrs"></div></div><div class="card" id="stage"><div class="phone" id="phone"></div><div class="msg" id="msg"></div></div></div><div class="card" id="dash"></div><div class="fim" id="fim"><div class="box"><h2 id="fT"></h2><p id="fP"></p><div id="ext"></div><button class="btn ok" id="fB"></button></div></div><div id="bpick"></div><div id="notif"></div><div id="exm"></div>';
 function iniSal(){BLOQ={};var v=[125000,98050,210075,56030,342010,87500,150025,73540];Object.keys(BANKS).forEach(function(k,i){SAL[k]=v[i%v.length];SAL0[k]=SAL[k]})}
 var OKEY={};
 function uu(){var h='0123456789abcdef',o='';for(var i=0;i<32;i++){o+=h[rnd(0,15)];if(i===7||i===11||i===15||i===19)o+='-'}return o}
 function iniKeys(){Object.keys(BANKS).forEach(function(k){OKEY[k]=uu()})}
 iniKeys();
 function ownC(k){return {nome:'Você (Aluno)',banco:BANKS[k].n,chave:OKEY[k],own:k}}
 function scarce(){var need=0,pix=false;tasks.forEach(function(t){if(t.target&&t.modo!=='pos'){need+=t.target.valor;pix=true}});if(!pix){iniSal();return}
  var tot=Math.ceil(need*1.6/10000)*10000,w=[.03,.05,.08,.12,.15,.17,.2,.2],ks=Object.keys(BANKS),i,a=[],sum=0;
  for(i=w.length-1;i>0;i--){var j=rnd(0,i),t=w[i];w[i]=w[j];w[j]=t}
  for(i=0;i<ks.length;i++){var v=Math.round(tot*w[i%w.length]/500)*500;a.push(v);sum+=v}
  var mx=0;a.forEach(function(v,i){if(v>a[mx])mx=i});a[mx]+=tot-sum;var ng=(mx+1+rnd(0,ks.length-2))%ks.length,dv=rnd(3,12)*1000,exc=a[ng]+dv;a[ng]=-dv;a[mx]+=exc;CHESP={bk:ks[ng],dv:dv};BLOQ={};var ot=[];ks.forEach(function(k,i){if(i!==mx&&i!==ng)ot.push(i)});for(var q=ot.length-1;q>0;q--){var r2=rnd(0,q),t2=ot[q];ot[q]=ot[r2];ot[r2]=t2}
  var z1=ot[0],z2=ot[1],bl=ot[2];[[z1,1],[z2,0],[bl,rnd(8,40)*1000]].forEach(function(p2){a[mx]+=a[p2[0]]-p2[1];a[p2[0]]=p2[1]});BLOQ[ks[bl]]=true;
  ks.forEach(function(k,i){SAL[k]=a[i];SAL0[k]=a[i]});
  var rb=ks[rnd(0,ks.length-1)],iv=rnd(2,20)*1000,real=Math.random()<.6;INC={nome:pick(['Tia Marta','Seu João','Carla (colega)','Dona Rosa','Pedro (primo)']),v:iv,real:real,bk:rb,ans:null,id:eid(),h:nowS()};
  if(real){SAL[rb]+=iv;LEDGER.push({f:fi,bk:rb,cr:1,n:INC.nome,b:'recebido',v:iv,ok:true,h:INC.h,id:INC.id})}}
 function nowS(){return new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
 function eid(){var h='0123456789ABCDEF',o='E18236120';for(var i=0;i<23;i++)o+=h[rnd(0,15)];return o}
 function sal(){return BLOQ[BK]?0:(SAL[BK]||0)}
 function sdo(){return BLOQ[BK]?'🔒 Bloqueado':fmt(sal())}
 iniSal();
 var MONO={nubank:'Nu',bb:'BB',itau:'itaú',bradesco:'B',caixa:'✕',inter:'inter',mp:'mp',santander:'S'};
 function bicon(k,sz){var b=BANKS[k];return '<span class="bi" style="--c:'+b.h+';--t:'+b.f+(sz?';--z:'+sz+'px':'')+'"><i>'+(MONO[k]||b.n.charAt(0))+'</i></span>'}
 function bkbar(){var bb=$('bkbar');if(!bb)return;if(cfg.appswitch){bb.style.display='none';return}bb.innerHTML='<span class="bkt">🏦 Seu banco:</span>'+Object.keys(BANKS).map(function(k){return '<button type="button" class="bkb'+(k===BK?' on':'')+'" data-bk="'+k+'" title="'+BANKS[k].n+'">'+bicon(k)+'<small>'+BANKS[k].n+'</small></button>'}).join('')}
 function setBank(k){if(!BANKS[k])return;BK=k;try{localStorage.setItem('edu_banco',k)}catch(x){}ph.chave='';theme();bkbar();draw()}
 function swOn(){return !!(cfg.appswitch&&T&&T.chat)}
 function dockAdd(){var P=$('phone'),o=document.getElementById('dock');if(o)o.remove();
  P.insertAdjacentHTML('beforeend','<div id="dock"><small>Trocar de aplicativo</small><div class="dk"><button type="button" class="'+(ph.app==='wa'?'on':'')+'" data-d="wa"><span class="bi wa"><i>💬</i></span><em>WhatsApp</em></button>'+Object.keys(BANKS).map(function(k){return '<button type="button" class="'+(ph.app==='bank'&&k===BK?'on':'')+'" data-d="'+k+'">'+bicon(k)+'<em>'+BANKS[k].n.split(' ')[0]+'</em></button>'}).join('')+'</div></div>')}
 function swapTo(app,k){var P=$('phone');P.classList.remove('appsw');void P.offsetWidth;P.classList.add('appsw');if(app==='wa'){ph.app='wa'}else{if(k!==BK){BK=k;try{localStorage.setItem('edu_banco',k)}catch(x){}ph.s='home';ph.chave='';ph.c=null}ph.app='bank'}theme();draw()}
 function theme(){var b=BANKS[BK]||BANKS.nubank,s=$('phone').style;s.setProperty('--bh',b.h);s.setProperty('--bf',b.f);s.setProperty('--bb',b.b);s.setProperty('--bt',b.bt);s.setProperty('--bg',b.bg);$('phone').dataset.st=b.style}
 function pickBank(first){var bp=$('bpick');bp.className='on';bp.innerHTML='<div class="box"><h2>🏦 Escolha o seu banco</h2><p>O app do celular vai imitar o do banco escolhido.</p><div class="bks">'+Object.keys(BANKS).map(function(k){var b=BANKS[k];return '<button data-k="'+k+'" class="pk">'+bicon(k,52)+'<span>'+b.n+'</span></button>'}).join('')+'</div></div>';
  bp.onclick=function(e){var bt=e.target.closest('[data-k]');var k=bt&&bt.dataset.k;if(!k)return;BK=k;try{localStorage.setItem('edu_banco',k)}catch(x){}bp.className='';theme();bkbar();ph.s=ph.s;draw()}}
 $('bBanco').onclick=function(){if(ph.s&&ph.s!=='home'&&ph.s!=='pos-valor'&&ph.s!=='load')return toast('Termine este Pix antes de trocar de banco. Cada banco tem o seu saldo.');pickBank()};
 function setPts(d){pts=Math.max(0,pts+d);$('pts').textContent=pts+' pontos'}
 function dots(){var d=$('dots');d.innerHTML='';tasks.forEach(function(_,i){var x=document.createElement('i');x.className=i<ti?'d':i===ti?'c':'';d.appendChild(x)})}
 function msg(t,c){$('msg').textContent=t;$('msg').className='msg '+(c||'')}
 function fase(){var L=cfg.niveis[fi];var hard=L>3;if(hard)L=3;tasks=[];var seen={};for(var g=0;g<80&&tasks.length<6;g++){var t=GEN[cfg.gen](L,hard);if(seen[t.txt])continue;seen[t.txt]=1;tasks.push(t)}ti=0;scarce();task()}
 function isTab(){try{return matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)>=600}catch(e){return false}}
 function ftxt(x){return x.forma==='debito'?'Débito':x.forma==='pix'?'Pix':x.forma==='dinheiro'?'Dinheiro':'Crédito '+(x.parc>1?x.parc+'x':'à vista')}
 var GN=[1,2,3,4,5,6,7,8,9,10,11,12];
 function tabHtml(op,n){var l=[];for(var i=1;i<=10;i++)l.push('<span>'+n+' '+op+' '+i+' = <b>'+(op==='×'?n*i:n+i)+'</b></span>');return '<div class="tbl2 '+(op==='×'?'tx':'tp')+'">'+l.join('')+'</div>'}
 function tabCard(op,n){return '<div class="tcard" data-op="'+op+'"><b>📸 Tabuada '+(op==='×'?'da multiplicação':'da adição')+' do <u>'+n+'</u></b><div class="tch">'+GN.map(function(k){return '<button type="button" data-w="tab" data-op="'+op+'" data-n="'+k+'" class="'+(k===n?'on':'')+'">'+k+'</button>'}).join('')+'</div>'+tabHtml(op,n)+'<small>Toque num número para ver a tabuada dele</small></div>'}
 function loadGrupos(){fetch('grupos/grupos.json?v='+Date.now()).then(function(r){return r.json()}).then(function(j){GRUPOS=j.grupos||[]}).catch(function(){GRUPOS=[{id:'z',icone:'📚',nome:'Matemática no Zap 📚',desc:'Grupo',prev:'',n:0,msgs:[{t:'txt',h:'Sem conexão com o repositório de grupos. Tente de novo mais tarde.'}]}]});
  fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL').then(function(r){return r.json()}).then(function(j){LIVE.usd=j.USDBRL}).catch(function(){});
  fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/12?formato=json').then(function(r){return r.json()}).then(function(j){LIVE.selic=j}).catch(function(){});
  var d=new Date();fetch('https://pt.wikipedia.org/api/rest_v1/feed/onthisday/events/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0')).then(function(r){return r.json()}).then(function(j){LIVE.hoje=(j.events||[]).filter(function(e){return e.text&&e.text.length<170}).slice(0,3)}).catch(function(){})}
 loadGrupos();
 function vbr(x){return Number(x).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
 function liveMsg(t){
  if(t==='usd'){var u=LIVE.usd;return u?'💵 <b>Dólar hoje</b><br>1 dólar = <b>R$ '+vbr(u.bid)+'</b><br>'+(+u.pctChange>=0?'🔺 subiu ':'🔻 caiu ')+vbr(Math.abs(u.pctChange))+'% hoje (variação de R$ '+vbr(Math.abs(u.varBid))+')<br><small>Fonte: AwesomeAPI · agora</small><br>🧮 US$ 50 hoje custam ≈ <b>R$ '+vbr(50*u.bid)+'</b>.':'💵 <b>Dólar hoje</b>: cotação indisponível sem internet.'}
  if(t==='selic'){var a=LIVE.selic;if(!a||!a.length)return '🏛️ <b>Taxa Selic</b>: indisponível sem internet.';var c=a[a.length-1],q=null,i;for(i=a.length-2;i>=0;i--)if(a[i].valor!==c.valor){q=a[i];break}
   return '🏛️ <b>Taxa Selic (meta)</b><br>Hoje: <b>'+String(c.valor).replace('.',',')+'% ao ano</b>'+(q?'<br>Antes: '+String(q.valor).replace('.',',')+'% ('+(+c.valor>+q.valor?'🔺 subiu':'🔻 caiu')+' '+vbr(Math.abs(c.valor-q.valor))+' ponto'+(Math.abs(c.valor-q.valor)>1?'s':'')+')':'')+'<br><small>Fonte: Banco Central · desde '+c.data+'</small>'}
  if(t==='hoje'){var e=LIVE.hoje;return e&&e.length?'📰 <b>Hoje na história</b><br>'+e.map(function(x){return '• <b>'+x.year+':</b> '+x.text}).join('<br>')+'<br><small>Fonte: Wikipédia</small>':'📰 <b>Hoje na história</b>: indisponível sem internet.'}
  if(t==='banco'){var h=[],neg=Object.keys(SAL).filter(function(k){return SAL[k]<0});
   neg.forEach(function(k){var d=-SAL[k],j=Math.round(d*8/100);h.push('🔔 <b>'+BANKS[k].n+' · Aviso de saldo</b><br>Sua conta está <b>negativa em '+fmt(d)+'</b>. Você está usando o <b>cheque especial</b>.<br>Juros: <b>8% ao mês</b>. Se ficar 30 dias assim, os juros serão <b>'+fmt(j)+'</b> e a dívida vai para <b>'+fmt(d+j)+'</b>.<br>💡 Faça um Pix de outro banco seu para cobrir.')});
   h.push('💳 <b>Cartão · Juros do rotativo</b><br>Se você pagar só o mínimo da fatura, o restante entra no <b>rotativo</b>, com juros de cerca de <b>14% ao mês</b>. Fatura de R$ 1.000 pagando R$ 150 → sobra R$ 850 × 14% = <b>R$ 119</b> de juros no mês seguinte.');
   h.push('📈 <b>Dica do banco</b><br>Juros do cheque especial (até 8% a.m.) e do rotativo (≈ 14% a.m.) são os mais caros. Evite ficar no negativo e pague a fatura inteira!');return h.join('<div class="bsep"></div>')}
  return ''}
 function msgHtml(m,i){var x='',cls='bub'+(i===0?' first':'');
  if(m.t==='txt')x=m.h;else if(m.t==='tab'){x=tabCard(m.op,m.n);cls+=' img'}
  else if(m.t==='pdf'){x='<div class="pdfc"><div class="pdfi">PDF</div><div class="pdft"><b>'+m.nome+'</b><small>'+m.info+'</small></div></div><div class="pdfb"><a href="'+m.arq+'" target="_blank" rel="noopener" data-nodl>👁 Abrir</a><a href="'+m.arq+'" download>⬇ Baixar</a></div>';cls+=' img'}
  else x=liveMsg(m.t);return '<div class="'+cls+'"><span>'+x+'</span><small>'+hora(i)+'</small></div>'}
 function groupHtml(id){var g=GRUPOS.filter(function(z){return z.id===id})[0];if(!g)return chatList();
  var h='<div class="wa wg"><div class="wst"><span>'+hora(0)+'</span><span>▂▄▆ 5G 🔋</span></div><div class="wh"><i data-w="list" class="wbk">‹</i><span class="av gp'+(g.oficial?' of':'')+'">'+g.icone+'</span><div class="wn"><b>'+g.nome+'</b><small>'+g.desc+'</small></div><span class="wi">⋮</span></div><div class="wb"><div class="wd">HOJE</div>';
  g.msgs.forEach(function(m,i){h+=msgHtml(m,i)});
  return h+'</div><div class="wf wro">Somente administradores podem enviar mensagens</div></div>'}
 function incHtml(){var I=INC;var x={bk:I.bk,cr:1,n:I.nome,v:I.v,h:I.h,id:I.id};
  return '<div class="wa wg"><div class="wst"><span>'+hora(0)+'</span><span>▂▄▆ 5G 🔋</span></div><div class="wh"><i data-w="list" class="wbk">‹</i><span class="av">'+I.nome.charAt(0)+'</span><div class="wn"><b>'+I.nome+'</b><small>online</small></div><span class="wi">⋮</span></div><div class="wb"><div class="wd">HOJE</div><div class="bub first"><span>Oi! Acabei de te mandar <b>'+fmt(I.v)+'</b> por Pix. Olha o comprovante 👇</span><small>'+hora(0)+'</small></div><div class="bub img"><span>'+recHtml({bk:I.bk,cr:0,n:'Você (Aluno)',b:BANKS[I.bk].n,v:I.v,h:I.h,id:I.id}).replace('Você (Aluno)','Você (Aluno)').replace('<dt>Quem pagou</dt><dd>Você (Aluno)<small>'+BANKS[I.bk].n+'</small></dd>','<dt>Quem pagou</dt><dd>'+I.nome+'</dd>')+'</span><small>'+hora(1)+'</small></div><div class="bub"><span>⚠️ <b>Confira no extrato</b> do seu banco ('+BANKS[I.bk].n+') se o dinheiro chegou. Comprovante sozinho não prova nada!<div class="ians"><button type="button" data-w="ia" data-v="1">✅ O Pix caiu no extrato</button><button type="button" data-w="ia" data-v="0">❌ Não apareceu no extrato</button></div><div class="iares">'+(I.ans===null?'':incRes())+'</div></span><small>'+hora(2)+'</small></div></div><div class="wf wro">Abra o extrato (painel embaixo) e confira.</div></div>'}
 function incRes(){var ok=(INC.ans===INC.real);return (ok?'🎉 <b>Certo!</b> ':'⚠️ <b>Confira de novo.</b> ')+(INC.real?'Esse Pix era verdadeiro: aparece <b>+ '+fmt(INC.v)+'</b> no extrato do '+BANKS[INC.bk].n+'.':'Esse comprovante era <b>falso</b>: nada entrou no extrato. Esse é o <b>golpe do comprovante falso</b>!')}
 var noNot=false;
 function waShow(h){if(swOn()){$('phone').innerHTML=h;dockAdd()}else $('txt').innerHTML=h}
 function txtHtml(){if(swOn())return '<p class="swp">📱 Leia a conversa no <b>WhatsApp</b> do celular ao lado, <b>copie a chave</b> e depois toque no ícone do <b>seu banco</b> (embaixo do celular) para fazer o Pix.</p><div class="pnote">🔐 '+pinTxt(T.pin)+' <b>'+T.chat.calc+'</b> e envie o Pix.</div>';return T.chat?chatHtml(T.chat)+'<div class="pnote">🔐 '+pinTxt(T.pin)+' <b>'+T.chat.calc+'</b> e envie o Pix.</div>':T.txt+chaveBtn()}
 function chatList(){var h='<div class="wa wl"><div class="wst"><span>'+hora(0)+'</span><span>▂▄▆ 5G 🔋</span></div><div class="wh"><b class="wt">WhatsApp</b><span class="wi">📷 ⋮</span></div><div class="wsr">🔍 Pesquisar</div><div class="wab"><span>Todas</span><span>Não lidas</span><span>Cobranças</span></div><div class="wlst">',n=0;
  if(INC)h+='<button type="button" class="wch" data-w="inc"><span class="av">'+INC.nome.charAt(0)+'</span><span class="wcb"><b>'+INC.nome+'</b><em>🧾 Comprovante de Pix</em></span><span class="wct"><small>agora</small>'+(INC.ans===null?'<i>1</i>':'')+'</span></button>';
  GRUPOS.forEach(function(g){h+='<button type="button" class="wch grp" data-w="group" data-g="'+g.id+'"><span class="av gp'+(g.oficial?' of':'')+'">'+g.icone+'</span><span class="wcb"><b>'+g.nome+'</b><em>'+(g.prev||'')+'</em></span><span class="wct"><small>hoje</small>'+(g.n?'<i>'+g.n+'</i>':'')+'</span></button>'});
  tasks.forEach(function(t,k){if(k<ti||!t.chat)return;n++;var c=t.chat,last=String(c.msgs[c.msgs.length-1]).replace(/<[^>]+>/g,'');h+='<button type="button" class="wch" data-w="open" data-i="'+k+'"><span class="av">'+c.nome.charAt(0)+'</span><span class="wcb"><b>'+c.nome+'</b><em>'+last+'</em></span><span class="wct"><small>'+hora(k)+'</small><i>1</i></span></button>'});
  if(!n)h+='<p class="wem">Nenhuma cobrança pendente. 🎉</p>';return h+'</div></div><div class="pnote">💰 Cobranças pendentes: <b>'+n+'</b> · saldo do banco: <b>'+fmt(sal())+'</b></div>'}
 function task(){T=tasks[ti];lock=false;ph={s:T.modo==='pos'?'pos-valor':'home',buf:'',pb:'',vals:[],sale:{},rot:isTab(),app:(cfg.appswitch&&T.chat)?'wa':'bank'};msg('');
  $('txt').innerHTML=txtHtml();$('ped').querySelector('h2').textContent=T.chat?'💬 WhatsApp':'📋 Pedido';var q=$('qrs');q.innerHTML='';
  if(T.qrs)q.innerHTML='<div class="qrl">'+T.qrs.map(function(x,i){return '<div class="qrc"><div class="qrimg"></div><b>QR Code '+x.letra+'</b><span>'+x.nome+'</span><span class="qv">'+fmt(x.valor)+'</span><button class="btn sec" data-qr="'+i+'">📷 Escanear</button></div>'}).join('')+'</div>';
  if(!noNot)notify();noNot=false;$('inst').innerHTML=cfg.instrucao+((T.target&&T.modo!=='pos')?'<div class="tipx">💡 <b>Atenção:</b> nem todo banco tem saldo para todos os pagamentos. Se faltar, transfira dinheiro de <b>outro banco seu</b>: no app do banco que vai receber, abra <b>Pix → Minhas chaves</b>, copie a chave e cole no app do banco que vai enviar.</div>':'');$('sub').textContent='Fase '+(fi+1)+'/4 · questão '+(ti+1)+'/'+tasks.length;dots();draw()}
 /* ----- desenho do celular ----- */

 var clip='',sel=null;
 function chatHtml(c){var ic='<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M15 8v8H5V8h10m1-2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4V7a1 1 0 0 0-1-1z"/></svg>',
   ph='<svg viewBox="0 0 24 24" width="21" height="21" fill="#fff"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z"/></svg>',
   dots='<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
   tk='<svg class="tk" viewBox="0 0 16 11" width="16" height="11"><path d="M1 6l3 3L11 1M6 9l1 1L14 1" fill="none" stroke="#53bdeb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var h='<div class="wa"><div class="wst"><span>'+hora(0)+'</span><span>▂▄▆ 5G 🔋</span></div><div class="wh"><i data-w="list" class="wbk" title="Voltar às conversas">‹</i><span class="av">'+c.nome.charAt(0)+'</span><div class="wn"><b>'+c.nome+'</b><small>online</small></div><span class="wi">'+ic+ph+dots+'</span></div><div class="wbar" id="wbar"><button data-w="x">✕</button><span>1 selecionada</span><button data-w="copy">📋 Copiar</button></div><div class="wb"><div class="wd">HOJE</div><div class="wlock">🔒 As mensagens são protegidas com a criptografia de ponta a ponta.</div>';
  c.msgs.forEach(function(m,i){h+='<div class="bub'+(i===0?' first':'')+'"><span>'+m+'</span><small>'+hora(i)+'</small></div>'});
  h+='<div class="bub key" data-chave="1"><span>'+c.chave+'</span><button class="cp" data-w="copykey" type="button">📋 Copiar chave</button><small>'+hora(5)+'</small></div></div><div class="wf"><span class="wif"><i>😊</i><em>Mensagem</em><i>📎</i><i>📷</i></span><span class="wmic">🎤</span></div></div>';return h}

 function doCopy(k){clip=k;try{navigator.clipboard.writeText(k)}catch(x){}msg('Chave copiada! Agora cole no Pix 📋','good');setTimeout(function(){if(!lock)msg('')},2600)}
 function tq(){var k=rnd(0,2),a,b;if(k===0){a=rnd(3,12);b=rnd(3,12);return {t:a+' × '+b,r:a*b}}if(k===1){a=rnd(6,19);b=rnd(4,15);return {t:a+' + '+b,r:a+b}}a=rnd(15,40);b=rnd(6,15);return {t:a+' − '+b,r:a-b}}
 function tabu(ok){var o=document.getElementById('tabu');if(o)o.remove();var Q=tq();o=document.createElement('div');o.id='tabu';
  o.innerHTML='<div class="tbx"><b>🔐 Para copiar a chave, resolva a conta:</b><div class="tq">'+Q.t+' = ?</div><input id="tabuIn" type="text" inputmode="numeric" autocomplete="off" placeholder="resposta"><div class="tbm" id="tabuM"></div><button type="button" class="pb" id="tabuOk">Confirmar</button><button type="button" class="pb sec" id="tabuNo">Prefiro digitar a chave à mão</button></div>';
  document.body.appendChild(o);var inp=o.querySelector('#tabuIn');setTimeout(function(){inp.focus()},50);
  function conf(){if(+inp.value.replace(/\D/g,'')===Q.r){o.remove();ok()}else{o.querySelector('#tabuM').textContent='❌ Errou! Tente outra conta.';Q=tq();o.querySelector('.tq').textContent=Q.t+' = ?';inp.value='';inp.focus()}}
  o.querySelector('#tabuOk').onclick=conf;inp.onkeydown=function(e){if(e.key==='Enter')conf()};o.querySelector('#tabuNo').onclick=function(){o.remove()}}
 function chaveBtn(){if(T.modo!=='pix'||!T.contacts||!T.target)return '';var c=T.contacts.filter(function(x){return x.nome===T.target.nome})[0];if(!c||!c.chave)return '';return '<div class="cpbox"><span>'+(T.bill?'Código de barras':'Chave Pix')+': <b>'+c.chave+'</b></span><button class="cp" data-w="copykey2" data-k="'+String(c.chave).replace(/"/g,'')+'" type="button">📋 Copiar</button></div>'}
 function backFor(x){var k=(BANKS[BK]||BANKS.nubank).kind;if(x==='minhas')return k==='caixa'?'cx-pix':k==='mp'?'mp-transf':'menu';if(k==='caixa')return x==='chave'?'cx-conta':'cx-pix';if(k==='mp')return x==='chave'?'mp-transf':'mp-pagar';return 'menu'}

 function beep2(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=180;g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+.35);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.4)}catch(e){}}
 function beep(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var t=AC.currentTime;[880,1175].forEach(function(f,i){var o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.15,t+i*.14);g.gain.exponentialRampToValueAtTime(.0001,t+i*.14+.25);o.connect(g);g.connect(AC.destination);o.start(t+i*.14);o.stop(t+i*.14+.3)})}catch(e){}}
 function notify(){var n=$('notif'),pd=$('ped');if(!T||(T.modo!=='pix'&&T.modo!=='qr')){n.className='';pd.classList.remove('lock');return}
  var nm=(T.chat&&T.chat.nome)||T.target.nome,tx=pick(['Oi! Você ainda não me pagou 😅','Ei, lembra do Pix que ficou pendente? 🙏','Você esqueceu de me pagar! 😬','Oi, tudo bem? Cadê o meu Pix? 💸','Preciso que você me pague, por favor 🙏']);
  n.innerHTML='<div class="nt"><span class="ni">💬</span><div><small>WHATSAPP · agora</small><b>'+nm+'</b><span>'+tx+'</span></div></div>';n.className='on';pd.classList.add('lock');beep()}
 $('notif').addEventListener('click',function(){$('notif').className='';$('ped').classList.remove('lock')});
 function extrato(){var L=LEDGER.slice(L0).filter(function(x){return !x.tr&&!x.cr}),ok=L.filter(function(x){return x.ok}).length,pago=L.reduce(function(a,x){return a+x.v},0);
  return '<div class="ex"><h3>🧾 Extrato Pix</h3>'+(L.length?'<table>'+L.map(function(x){return '<tr class="'+(x.ok?'o':'e')+'"><td>'+x.h+'</td><td>'+(x.bl?'Conta paga: ':'Pix para ')+x.n+'<small>'+x.b+' · via '+(BANKS[x.bk]||{n:''}).n+'</small></td><td>− '+fmt(x.v)+'</td><td>'+(x.ok?'✔':'✘')+'</td></tr>'}).join('')+'</table>':'<p>Nenhum Pix nesta fase.</p>')+'<div class="sm"><span>Pix certos: <b>'+ok+'/'+L.length+'</b></span><span>Total enviado: <b>'+fmt(pago)+'</b></span><span>Saldo na conta: <b>'+fmt(sal())+'</b></span></div></div>'}
 function recHtml(x){x.id=x.id||eid();var cr=!!x.cr,de=cr?x.n:'Você (Aluno)',pa=cr?'Você (Aluno)':x.n,bo=cr?'—':BANKS[x.bk].n,bd=cr?BANKS[x.bk].n:x.b;
  return '<div class="rec"><div class="rh">'+bicon(x.bk,38)+'<div><b>Comprovante de Pix</b><small>'+(cr?'Você recebeu':'Transferência realizada')+'</small></div></div><div class="rv">'+fmt(x.v)+'</div><dl><dt>Data e hora</dt><dd>'+x.h+'</dd><dt>Quem pagou</dt><dd>'+de+(cr?'':'<small>'+BANKS[x.bk].n+'</small>')+'</dd><dt>Quem recebeu</dt><dd>'+pa+'<small>'+(cr?BANKS[x.bk].n:bd)+'</small></dd><dt>ID da transação</dt><dd class="mk">'+x.id+'</dd></dl><p class="rn">Guarde este comprovante e confira se o valor aparece no <b>extrato</b>.</p></div>'}
 function cpOpen(i){var x=LEDGER[i];if(!x)return;var m=$('exm');m.innerHTML='<div class="box ex">'+recHtml(x)+'<button class="btn" type="button" id="cpD">⬇ Baixar comprovante</button> <button class="btn ok" type="button" id="exX">Fechar</button></div>';m.className='on';$('exX').onclick=function(){m.className=''};$('cpD').onclick=function(){cpDown(x)}}
 function cpDown(x){var css=document.querySelector('link[href*="banco.css"]'),h='<!doctype html><meta charset="utf-8"><title>Comprovante Pix</title><style>body{font-family:Arial;background:#eee;padding:20px}.rec{max-width:360px;margin:auto;background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 10px #0003}.rh{display:flex;gap:10px;align-items:center}.rh small,dd small{display:block;color:#667}.rv{font:800 30px Arial;margin:12px 0;color:#0a7a3d}dt{font-size:12px;color:#667;margin-top:8px}dd{margin:0;font-weight:700}.mk{font:700 12px monospace;word-break:break-all}.rn{font-size:12px;color:#556}.bi{display:inline-flex;width:38px;height:38px;border-radius:10px;background:var(--c);color:var(--t);align-items:center;justify-content:center;font-weight:900}</style>'+recHtml(x),b=new Blob([h],{type:'text/html'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='comprovante-pix-'+(x.id||'').slice(-6)+'.html';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)}
 function dash(){var d=$('dash');if(!d)return;var tot=0;
  d.innerHTML='<h2>📊 Painel — saldo de cada banco</h2><div class="dg">'+Object.keys(BANKS).map(function(k){var b=BANKS[k];tot+=SAL[k];var n=LEDGER.filter(function(x){return x.bk===k&&!x.tr&&!x.cr}).length;
   return '<div class="db'+(k===BK?' cur':'')+'" style="--c:'+b.h+';--t:'+b.f+'"><b>'+b.n+'</b><span class="'+(SAL[k]<0||BLOQ[k]?'neg':'')+'">'+fmt(SAL[k])+'</span><small>'+(BLOQ[k]?'<em class="chq">🔒 bloqueado</em>':SAL[k]<0?'<em class="chq">cheque especial</em>':SAL[k]<100?'<em class="chq">sem saldo</em>':'')+'</small><small>'+n+' Pix</small><button type="button" data-ex="'+k+'">🧾 Extrato</button></div>'}).join('')+'</div><div class="dt"><span>Total em todos os bancos: <b>'+fmt(tot)+'</b></span><button type="button" class="btn sec" data-ex="*">🧾 Extrato geral (pago e não pago)</button></div>'}
 function cpBtn(x){return ' <button type="button" class="cpb" data-cp="'+LEDGER.indexOf(x)+'">🧾 Comprovante</button>'}
 function exRows(L,kk){return L.map(function(x){if(x.cr)return '<tr class="o cr"><td>'+x.h+'</td><td>Pix recebido de '+x.n+'<small>via '+BANKS[x.bk].n+'</small>'+cpBtn(x)+'</td><td>+ '+fmt(x.v)+'</td><td>⬇ Recebido</td></tr>';if(x.tr)return '<tr class="o"><td>'+x.h+'</td><td>Transferência entre seus bancos<small>'+BANKS[x.bk].n+' → '+BANKS[x.tr].n+'</small></td><td>'+(kk===x.tr?'+ ':'− ')+fmt(x.v)+'</td><td>↔ Própria</td></tr>';return '<tr class="'+(x.ok?'o':'e')+'"><td>'+x.h+'</td><td>'+(x.bl?'Conta paga: ':'Pix para ')+x.n+'<small>'+x.b+' · via '+(BANKS[x.bk]||{n:''}).n+'</small>'+cpBtn(x)+'</td><td>− '+fmt(x.v)+'</td><td>'+(x.ok?'✔ Pago certo':'✘ Pago errado')+'</td></tr>'}).join('')}
 function exOpen(k){var m=$('exm'),h;
  if(k==='*'){var pend=tasks.length-ti-(lock?0:0);pend=Math.max(0,tasks.length-LEDGER.filter(function(x){return x.f===fi}).length);
   var LT=LEDGER.filter(function(x){return !x.tr&&!x.cr}),ok=LT.filter(function(x){return x.ok}).length;
   h='<h3>🧾 Extrato geral — todos os bancos</h3>'+(LEDGER.length?'<table>'+exRows(LEDGER,'*')+'</table>':'<p>Nenhum Pix feito ainda.</p>')
    +'<div class="sm"><span>✔ Pagos certos: <b>'+ok+'</b></span><span>✘ Pagos errados: <b>'+(LT.length-ok)+'</b></span><span>⏳ Ainda não pagos (nesta fase): <b>'+(T&&T.modo!=='pos'?Math.max(0,tasks.length-ti-(ph.s==='rec'?1:0)):0)+'</b></span></div>'}
  else{var b=BANKS[k],L=LEDGER.filter(function(x){return x.bk===k||x.tr===k}),gasto=L.filter(function(x){return x.bk===k&&!x.cr}).reduce(function(a,x){return a+x.v},0);
   h='<h3>🧾 Extrato — '+b.n+'</h3><div class="sm"><span>Saldo inicial: <b>'+fmt(SAL0[k])+'</b></span></div>'+(L.length?'<table>'+exRows(L,k)+'</table>':'<p>Nenhum Pix feito por este banco.</p>')+'<div class="sm"><span>Total enviado: <b>'+fmt(gasto)+'</b></span><span>Saldo atual: <b>'+fmt(SAL[k])+'</b></span></div>'}
  m.innerHTML='<div class="box ex">'+h+'<button class="btn ok" type="button" id="exX">Fechar</button></div>';m.className='on';$('exX').onclick=function(){m.className=''}}
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ex]');if(b&&$('dash')&&$('dash').contains(b))exOpen(b.dataset.ex);var c=e.target.closest&&e.target.closest('[data-cp]');if(c)cpOpen(+c.dataset.cp)});
 function hd(t,back){var b=BANKS[BK]||BANKS.nubank;return '<div class="hd '+b.style+'">'+(back?'<button class="bk" data-a="'+back+'">‹</button>':'')+'<span>'+t+'</span></div>'}
 function toast(t){var e=$('phone').querySelector('.toast');if(e)e.remove();var d=document.createElement('div');d.className='toast';d.textContent=t;$('phone').appendChild(d);setTimeout(function(){d.remove()},2600)}
 function keypad(){return '<div class="kp">'+[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(function(k){return '<button data-k="'+k+'">'+k+'</button>'}).join('')+'</div>'}
 function dots4(n){return '<div class="pd">'+[0,1,2,3].map(function(i){return '<i class="'+(i<n?'f':'')+'"></i>'}).join('')+'</div>'}
 function draw(){var P=$('phone'),b=BANKS[BK]||BANKS.nubank,s=ph.s,h='';theme();if(!BK){pickBank(1);return}
  if(swOn()&&ph.app==='wa'){P.innerHTML=chatHtml(T.chat);dockAdd();dash();return}
  if(s==='load')h='<div class="ld"><div class="sp"></div><p>Aguarde...</p></div>';
  else if(s==='home'&&b.kind==='row')h=hd('Olá, Aluno')+'<div class="sal">Conta<b>'+fmt(sal())+'</b></div><div class="rw">'+[['💠','Pix','menu',1],['📄','Pagar','boleto'],['🔁','Transferir','off'],['💳','Cartão','cartao'],['📱','Recarga','off']].map(function(x){return '<button data-a="'+(x[2]||'off')+'" class="'+(x[3]?'hot':'')+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div><div class="ls"><button data-a="off"><i>💰</i>Rendimento<small>Seu dinheiro rende todo dia</small></button><button data-a="cartao"><i>🧾</i>Fatura atual<small>Ver fatura do cartão</small></button></div>';
  else if(s==='home'&&b.kind==='grid')h=hd(b.n)+'<div class="sal">Saldo disponível<b>'+sdo()+'</b></div><div class="gr">'+[['🏠','Início','off'],['📄','Pagar','boleto'],['🔁','Transferir','off'],['💳','Cartões','cartao'],['💠','Pix','menu'],['⋯','Mais','off']].map(function(x){return '<button class="gb" data-a="'+x[2]+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div>';
  else if(s==='home'&&b.kind==='caixa')h=hd('Caixa Tem')+'<div class="sal">Poupança Social Digital<b>'+fmt(sal())+'</b></div><div class="ls">'+[['👤','Meu perfil','off'],['🧾','Pagar contas e boletos','boleto'],['💳','Cartão de crédito','cartao'],['🏦','Poupança Social Digital','off'],['🎁','Benefícios','off'],['💠','Pix','cx-pix'],['❓','Ajuda','off']].map(function(x){return '<button data-a="'+x[2]+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div>';
  else if(s==='home'&&b.kind==='mp')h=hd('Mercado Pago')+'<div class="mpc"><small>Dinheiro disponível</small><b>'+fmt(sal())+'</b><span>Rendendo 100% do CDI</span></div><div class="rw mpr">'+[['⬆️','Transferir','mp-transf'],['🧾','Pagar serviços','mp-pagar'],['💳','Cartão','cartao'],['💸','Cobrar','off'],['🛍️','Mercado Livre','off']].map(function(x){return '<button data-a="'+x[2]+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div><div class="ls"><button data-a="off"><i>🎁</i>Promoções<small>Cupons e descontos</small></button></div>';
  else if(s==='cx-pix')h=hd('Pix','home')+'<div class="ls"><button data-a="cx-aviso:q"><i>📷</i>Pagar com QR Code</button><button data-a="cx-aviso:t"><i>📤</i>Pagar / Transferir com chave</button><button data-a="off"><i>📥</i>Receber</button><button data-a="minhas"><i>🔑</i>Minhas chaves</button><button data-a="off"><i>⚙️</i>Limites</button></div>';
  else if(s==='cx-aviso')h=hd('Atenção','cx-pix')+'<div class="bd"><div class="av2">⚠️<b>Cuidado com golpes!</b><p>A Caixa nunca pede sua senha por telefone, mensagem ou aplicativo. Confira sempre o nome de quem vai receber.</p></div><button class="pb" data-a="cx-next">Entendi, continuar</button></div>';
  else if(s==='cx-conta')h=hd('Conta de origem','cx-aviso')+'<div class="bd"><label>De qual conta sai o dinheiro?</label><button class="pb sec" data-a="chave">Poupança Social Digital<br><small>Ag 0001 · Conta ••••4821</small></button></div>';
  else if(s==='cx-rev')h=hd('Revisar e aceitar','conf')+'<div class="bd"><div class="cf"><span>Você está transferindo</span><b class="big">'+fmt(ph.v)+'</b><span>Para</span><b>'+ph.c.nome+'</b><span>Conta de origem</span><b>Poupança Social ••••4821</b></div><p class="hint">Ao continuar você aceita os termos do Pix.</p><button class="pb" data-a="cx-ok">Aceitar e continuar</button></div>';
  else if(s==='mp-transf')h=hd('Transferir','home')+'<div class="ls"><button data-a="off"><i>🟦</i>Para uma conta do Mercado Pago</button><button data-a="off"><i>🏦</i>Para uma conta bancária (TED)</button><button data-a="chave"><i>💠</i>Pix<small>Com CPF, celular, e-mail ou chave</small></button><button data-a="minhas"><i>🔑</i>Minhas chaves Pix</button></div>';
  else if(s==='mp-pagar')h=hd('Pagar serviços','home')+'<div class="ls"><button data-a="boleto"><i>🧾</i>Boleto ou conta de consumo</button><button data-a="off"><i>🚌</i>Transporte</button><button data-a="cam"><i>📷</i>Escanear QR Code<small>Pix e outros pagamentos</small></button></div>';
  else if(s==='home')h=hd(b.n)+'<div class="sal">Saldo</div>';
  else if(s==='boleto')h=hd('Pagar conta','home')+'<div class="bd"><label>Código de barras do boleto</label><input id="inChave" type="text" autocomplete="off" placeholder="Digite ou cole o código" value="'+(ph.chave||'')+'"><button class="pb sec" data-a="colar">📋 Colar</button><button class="pb" data-a="bol-ok">Continuar</button><p class="hint">Copie o código de barras da conta (na tela do pedido).</p></div>';
  else if(s==='bol-val')h=hd('Dados da conta','boleto')+'<div class="bd"><div class="cf"><span>Beneficiário</span><b>'+ph.c.nome+'</b><span>Valor do documento</span><b class="big">'+fmt(T.bill.base)+'</b>'+(T.bill.mes?'<span>Situação</span><b>⚠️ Vencida há '+T.bill.mes+' mês'+(T.bill.mes>1?'es':'')+'</b>':'<span>Situação</span><b>No prazo</b>')+'</div><label>'+(T.bill.mes?'Valor a pagar (com multa e juros)':'Valor a pagar')+'</label><input id="inVal" type="text" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00" value="'+(T.bill.mes?'':fmt(T.bill.base).replace('R$ ',''))+'"><button class="pb" data-a="bol-val-ok">Continuar</button></div>';
  else if(s==='minhas')h=hd('Minhas chaves',backFor('minhas'))+'<div class="bd"><div class="cf"><span>Banco</span><b>'+b.n+'</b><span>Chave aleatória</span><b class="mk">'+OKEY[BK]+'</b></div><button class="pb" data-a="mykey">📋 Copiar chave</button><p class="hint">Use esta chave para receber dinheiro de outro banco seu.</p></div>';
  else if(s==='menu')h=hd('Área Pix','home')+'<div class="ls"><button data-a="chave"><i>📤</i>Transferir<small>Por chave: CPF, celular, e-mail...</small></button><button data-a="cam"><i>📷</i>Pagar com QR Code<small>Aponte a câmera</small></button><button data-a="off"><i>📥</i>Receber</button><button data-a="minhas"><i>🔑</i>Minhas chaves</button></div>';
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
  else if(s==='fat')h=hd('Cartão de crédito','home')+'<div class="bd"><div class="cart">💳<div><small>'+b.n+' · final 4821</small><b>Fatura fechada</b></div></div><div class="cf"><span>Valor da fatura</span><b class="big">'+fmt(T.F)+'</b><span>Vencimento</span><b>dia 10</b><span>Pagamento mínimo</span><b>15% da fatura</b></div><button class="pb" data-a="fat-op">Pagar fatura</button></div>';
  else if(s==='fat-op')h=hd('Quanto pagar?','fat')+'<div class="ls"><button data-a="fat-opt:total"><i>💰</i>Valor total<small>Paga toda a fatura, sem juros</small></button><button data-a="fat-opt:min"><i>⬇️</i>Valor mínimo<small>O restante vai para o rotativo, com juros</small></button><button data-a="fat-opt:outro"><i>✏️</i>Outro valor<small>Você escolhe quanto pagar</small></button></div>';
  else if(s==='fat-val')h=hd('Valor do pagamento','fat-op')+'<div class="bd"><div class="who">Fatura: <b>'+fmt(T.F)+'</b> · Saldo: <b>'+fmt(sal())+'</b></div><label>'+(ph.fat.op==='total'?'Valor total':ph.fat.op==='min'?'Digite o valor do pagamento mínimo':'Digite o valor que quer pagar')+'</label><input id="inVal" type="text" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00" value="'+(ph.fat.op==='total'?fmt(T.F).replace('R$ ',''):'')+'"><button class="pb" data-a="fat-val-ok">Continuar</button></div>';
  else if(s==='fat-forma')h=hd('Como pagar?','fat-val')+'<div class="ls"><button data-a="fat-forma:pix"><i>💠</i>Pix<small>Copia e cola · cai na hora</small></button><button data-a="fat-forma:boleto"><i>📄</i>Boleto<small>Linha digitável · até 3 dias úteis</small></button><button data-a="fat-forma:debito"><i>🏦</i>Débito em conta<small>Sai do saldo agora</small></button></div>';
  else if(s==='fat-conf')h=hd('Confirmar pagamento','fat-forma')+'<div class="bd"><div class="cf"><span>Pagando</span><b class="big">'+fmt(ph.fat.v)+'</b><span>Fatura do cartão</span><b>'+b.n+' final 4821</b><span>Forma</span><b>'+({pix:'Pix',boleto:'Boleto',debito:'Débito em conta'})[ph.fat.forma]+'</b></div>'+(ph.fat.forma==='debito'?'':'<div class="pcode"><small>'+(ph.fat.forma==='pix'?'Pix copia e cola':'Linha digitável')+'</small><code>'+(ph.fat.forma==='pix'?T.code:T.code.replace(/\D/g,'').slice(0,40))+'</code><button class="pb sec" data-a="fat-copy">📋 Copiar</button></div>')+'<button class="pb" data-a="fat-conf-ok">Confirmar pagamento</button></div>';
  else if(s==='fat-pin')h=hd('Senha de 4 dígitos')+'<div class="bd c"><p>Digite a senha do app para pagar a fatura</p>'+dots4(ph.pb.length)+keypad()+'</div>';
  else if(s==='fat-ok')h='<div class="rc"><div class="ck">✔</div><h3>Fatura paga!</h3><b class="big">'+fmt(ph.fat.v)+'</b><p>'+({pix:'Pix',boleto:'Boleto',debito:'Débito em conta'})[ph.fat.forma]+'<br>Saldo agora: '+fmt(sal())+'</p><button class="pb" data-a="fat-next">Responder as perguntas ▶</button></div>';
  else if(s==='quiz')h=hd(T.cart==='fatura'?'Fatura do cartão':'Compra no cartão')+'<div class="bd"><div class="cart">💳<div><small>'+b.n+' · final 4821</small><b>Cartão de crédito</b></div></div>'+fieldsHtml()+'</div>';
  P.innerHTML=h;dash();if(swOn())dockAdd();var ic=P.querySelector('#inChave');if(ic)setTimeout(function(){ic.focus()},50);var iv=P.querySelector('#inVal');if(iv)setTimeout(function(){iv.focus()},50)}
 function fieldsHtml(){return '<div class="fl">'+T.fields.map(function(f,i){return '<label>'+f.q+'</label><input class="fi" data-i="'+i+'" type="text" inputmode="numeric" autocomplete="off" placeholder="R$ 0,00">'}).join('')+(T.choose?'<label>'+T.choose.q+'</label><div class="ch">'+T.choose.opts.map(function(o,i){return '<button data-ch="'+i+'">'+o+'</button>'}).join('')+'</div>':'')+'<button class="pb" data-a="quiz-ok">Conferir ✔</button></div>'}
 var LENTO=['cx-pix','cx-aviso','cx-conta','chave','valor','conf','cx-rev','cam'];
 function fimCli(){ph.back=true;ph.perr=false;ph.pb='';go('pos-ok')}
 function go(s){var k=(BANKS[BK]||{}).kind;if(k==='caixa'&&LENTO.indexOf(s)>=0&&!ph.fast){ph.s='load';draw();setTimeout(function(){ph.s=s;draw()},1000);return}ph.s=s;draw()}
 function wrong(m,keep){if(lock)return;setPts(-10);msg(m,'bad');var P=$('phone');P.classList.add('shake');setTimeout(function(){P.classList.remove('shake');if(keep){ph.s='quiz'}else{if(ph.fat&&ph.fat.paid){SAL[BK]+=ph.fat.v;LEDGER.pop();dash()}ph.fat=null;ph.s=T.modo==='pos'?'pos-valor':'home'}ph.buf='';ph.pb='';ph.chave='';ph.sale={};ph.back=false;ph.perr=false;draw()},1400)}
 function right(m){lock=true;setPts(15);msg(m,'good');setTimeout(function(){ti++;if(ti>=tasks.length)fim();else task()},1800)}
 function fim(){var f=$('fim');$('fT').textContent=fi<3?'Fase '+(fi+1)+' concluída! 🎉':'Parabéns! Terminou todas as fases! 🏆';$('fP').textContent='Você tem '+pts+' pontos.';$('fB').textContent=fi<3?'Próxima fase ▶':'Jogar de novo ↺';f.classList.add('on');$('ext').innerHTML=LEDGER.length>L0?extrato():'';$('fB').onclick=function(){f.classList.remove('on');L0=LEDGER.length;if(fi<3)fi++;else{fi=0;pts=0;setPts(0);iniSal();LEDGER=[];L0=0}$('nivel').value=cfg.niveis[fi];fase()}}
 function xfer(){var d=ph.c.own;SAL[BK]-=ph.v;SAL[d]+=ph.v;LEDGER.push({f:fi,bk:BK,tr:d,n:'Você (Aluno)',b:BANKS[d].n,v:ph.v,ok:true,h:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})});dash();
  setTimeout(function(){msg('Transferência feita! O saldo do '+BANKS[d].n+' aumentou.','good');setTimeout(function(){if(!lock)msg('')},2600);ph.s='home';ph.c=null;ph.chave='';draw()},1700)}
 function judge(){var ok=ph.c.nome===T.target.nome&&ph.v===T.target.valor;SAL[BK]-=ph.v;LEDGER.push({f:fi,bk:BK,bl:!!T.bill,dep:fmt(SAL[BK]),n:ph.c.nome,b:ph.c.banco,v:ph.v,ok:ok,h:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})});
  dash();setTimeout(function(){if(ok)right('Pix certo! '+fmt(ph.v)+' para '+ph.c.nome+'.');
   else if(ph.c.nome!==T.target.nome)wrong(T.bill?'Você pagou a conta errada!':'Você enviou o Pix para '+ph.c.nome+', a pessoa errada! Sempre confira o nome antes de confirmar.');
   else wrong(T.bill?'O valor pago está errado. Confira o valor do documento e calcule a multa (2%) e os juros (1% ao mês).':'O valor enviado está errado. Refaça o cálculo do pedido.')},900)}
 function press(k,pos){
  if(ph.s==='pos-valor'){if(k==='⌫')ph.buf=ph.buf.slice(0,-1);else if(k==='OK'){var v=+ph.buf||0;if(v<=0){toast('Digite o valor');return}ph.sale.valor=v;go('pos-cobrar');if(ph.rot)setTimeout(function(){if(ph.s==='pos-cobrar')go('pos-c-forma')},1600);return}else if(ph.buf.length<8)ph.buf+=k;draw();return}
  if(ph.s==='fat-pin'){if(k==='⌫')ph.pb=ph.pb.slice(0,-1);else if(k==='OK')return;else if(ph.pb.length<4)ph.pb+=k;
   if(ph.pb.length===4){if(ph.pb===T.pin){ph.pb='';SAL[BK]-=ph.fat.v;ph.fat.paid=1;LEDGER.push({f:fi,bk:BK,n:'Fatura do cartão',b:'pago por '+({pix:'Pix',boleto:'boleto',debito:'débito em conta'})[ph.fat.forma],v:ph.fat.v,ok:true,h:new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})});dash();go('fat-ok');return}ph.pb='';toast('Senha incorreta')}
   draw();return}
  if(ph.s==='pos-c-pin'){ph.perr=false;if(k==='⌫')ph.pb=ph.pb.slice(0,-1);else if(k==='OK')return;else if(ph.pb.length<4)ph.pb+=k;
   if(ph.pb.length===4){if(+ph.pb%2===0){fimCli();return}ph.pb='';ph.perr=true;beep2()}draw();return}
  if(k==='⌫')ph.pb=ph.pb.slice(0,-1);else if(k==='OK')return;else if(ph.pb.length<4)ph.pb+=k;
  if(ph.pb.length===4){if(ph.pb===T.pin){var nx=ph.s==='pin'?'rec':'pos-ok';ph.pb='';go(nx);if(nx==='rec'){if(ph.c&&ph.c.own)xfer();else judge()}else ph.s='pos-ok',draw();return}else{ph.pb='';toast('Senha incorreta');}}
  draw()}
 $('phone').addEventListener('click',function(e){var t=e.target.closest('button');if(!t||lock||ph.s==='load')return;
  if(t.dataset.d){if(t.dataset.d==='wa')swapTo('wa');else swapTo('bank',t.dataset.d);return}
  if(t.dataset.k!==undefined)return press(t.dataset.k);
  if(t.dataset.f){var f=t.dataset.f;ph.sale.forma=f;ph.sale.parc=1;if(f==='debito')go('pos-c-cartao');else if(f==='credito')go('pos-c-parc');else if(f==='pix')go('pos-c-pix');else fimCli();return}
  if(t.dataset.p){ph.sale.parc=+t.dataset.p;go('pos-c-cartao');return}
  if(t.dataset.ch!==undefined){ph.ch=+t.dataset.ch;[].forEach.call(t.parentNode.children,function(x){x.classList.remove('on')});t.classList.add('on');return}
  var a=t.dataset.a,par=null;if(!a)return;if(a.indexOf(':')>0){par=a.split(':')[1];a=a.split(':')[0]}
  if(a==='cx-aviso'){ph.dest=par;return go('cx-aviso')}
  if(a==='cx-next')return go(ph.dest==='q'?'cam':'cx-conta');
  if(a==='cx-ok'){ph.pb='';ph.s='pin';return draw()}
  if(a==='cartao'){if(T.modo==='quiz'){return go(T.cart==='fatura'?'fat':'quiz')}return toast('Nesta atividade use o Pix 💠')}
  if(a==='fat-op')return go('fat-op');
  if(a==='fat-opt'){ph.fat={op:par};return go('fat-val')}
  if(a==='fat-val-ok'){var n=parse($('inVal').value);if(!(n>0))return toast('Digite um valor válido');if(n>T.F)return toast('O valor é maior que a fatura');if(n<T.min)return toast('Valor abaixo do pagamento mínimo da fatura');if(n>sal())return toast(BLOQ[BK]?'🔒 O saldo deste banco está bloqueado. Use outro banco.':'Saldo insuficiente neste banco. Transfira de outro banco seu.');ph.fat.v=n;return go('fat-forma')}
  if(a==='fat-forma'){ph.fat.forma=par;return go('fat-conf')}
  if(a==='fat-copy'){var cc=ph.fat.forma==='pix'?T.code:T.code.replace(/\D/g,'').slice(0,40);return tabu(function(){doCopy(cc)})}
  if(a==='fat-conf-ok'){ph.pb='';return go('fat-pin')}
  if(a==='fat-next')return go('quiz');
  if(a==='off')return toast('Nesta atividade use o Pix 💠');
  if(a==='colar'){if(!clip)return toast('Nada copiado. Copie a chave no WhatsApp.');$('inChave').value=clip;ph.chave=clip;return}
  if(a==='boleto'){if(!T.bill)return toast('Nesta atividade use o Pix 💠');ph.chave='';return go('boleto')}
  if(a==='bol-ok'){var vv=$('inChave').value;ph.chave=vv;var bc=(T.contacts||[]).filter(function(x){return norm(x.chave)===norm(vv)})[0];if(!bc)return toast('Código de barras não encontrado. Confira os números.');ph.c=bc;return go('bol-val')}
  if(a==='bol-val-ok'){var nb=parse($('inVal').value);if(!(nb>0))return toast('Digite o valor a pagar');if(nb>sal())return toast(BLOQ[BK]?'🔒 O saldo deste banco está bloqueado. Use outro banco.':'Saldo insuficiente neste banco. Transfira dinheiro de outro banco seu.');ph.v=nb;return go('conf')}
  if(a==='minhas')return go('minhas');
  if(a==='mykey'){var mk=OKEY[BK];return tabu(function(){doCopy(mk)})}
  if(a==='chave-ok'){var v=$('inChave').value;ph.chave=v;var c=null;Object.keys(BANKS).forEach(function(k){if(norm(OKEY[k])===norm(v)){if(k===BK)c='mesmo';else c=ownC(k)}});if(c==='mesmo')return toast('Esta chave é deste mesmo banco. Use a chave do OUTRO banco.');if(!c)c=T.contacts.filter(function(x){return norm(x.chave)===norm(v)})[0];if(!c)return toast('Chave Pix não encontrada. Confira os dados.');ph.c=c;go('valor');return}
  if(a==='valor-ok'){var n=parse($('inVal').value);if(!(n>0))return toast('Digite um valor válido');if(n>sal())return toast(BLOQ[BK]?'🔒 O saldo deste banco está bloqueado. Use outro banco.':'Saldo insuficiente neste banco. Transfira dinheiro de outro banco seu.');ph.v=n;go('conf');return}
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
  if(T.cart==='fatura'&&(!ph.fat||ph.fat.v!==T.pay||ph.fat.forma!==T.forma))return wrong('O pagamento feito no app não confere com o pedido (valor ou forma de pagamento). O valor foi devolvido: refaça pelo app.');
  if(T.choose&&ph.ch!==T.choose.a){ok=false;miss.push(T.choose.q)}
  if(ok)right('Tudo certo! 🎉');else wrong('Confira: '+miss[0]+(miss.length>1?' (e mais '+(miss.length-1)+')':'')+'.',T.cart==='fatura')}

 function mask(v){var d=String(v).replace(/\D/g,'').replace(/^0+/,'');if(!d)return '';while(d.length<3)d='0'+d;var c=d.slice(-2),r=d.slice(0,-2).replace(/\B(?=(\d{3})+(?!\d))/g,'.');return r+','+c}
 $('phone').addEventListener('input',function(e){var t=e.target;if(t.id==='inVal'||t.classList.contains('fi')){t.value=mask(t.value);try{t.setSelectionRange(t.value.length,t.value.length)}catch(x){}}});
 $('qrs').addEventListener('click',function(e){var t=e.target.closest('button');if(!t||lock)return;if(ph.s!=='cam')return toast2('Abra o Pix no celular: Pix → Pagar com QR Code.');var q=T.qrs[+t.dataset.qr];ph.c={nome:q.nome,banco:'Banco da loja',chave:'QR Code '+q.letra};ph.v=q.valor;go('conf')});
 function toast2(t){msg(t,'bad');setTimeout(function(){if(!lock)msg('')},2600)}

 $('txt').addEventListener('contextmenu',function(e){e.preventDefault()});
 var waH=function(e){var bb=e.target.closest('.bub'),w=e.target.closest('[data-w]');var bar=$('wbar');if(w&&w.dataset.w==='list'){waShow(chatList());return}if(w&&w.dataset.w==='group'){waShow(groupHtml(w.dataset.g));var wb=document.querySelector('.wg .wb');if(wb)wb.scrollTop=0;return}if(w&&w.dataset.w==='inc'){waShow(incHtml());return}if(w&&w.dataset.w==='ia'){INC.ans=w.dataset.v==='1';var rs=document.querySelector('.iares');if(rs)rs.innerHTML=incRes();if(INC.ans===INC.real)setPts(5);return}if(w&&w.dataset.w==='tab'){var cd=w.closest('.tcard'),op=w.dataset.op,nn=+w.dataset.n;cd.outerHTML=tabCard(op,nn);return}if(w&&w.dataset.w==='open'){var k=+w.dataset.i;if(k!==ti){var tmp=tasks[ti];tasks[ti]=tasks[k];tasks[k]=tmp;noNot=true;task()}else{waShow(swOn()?chatHtml(T.chat):txtHtml())}return}if(w&&w.dataset.w==='copykey2'){var kk=w.dataset.k;tabu(function(){doCopy(kk)});return}if(w&&w.dataset.w==='copykey'){sel=w.parentNode.querySelector('span').innerText;var k2=sel;tabu(function(){doCopy(k2)});return}
  if(w){if(w.dataset.w==='copy'&&sel){var k3=sel;tabu(function(){doCopy(k3)})}if(bar)bar.classList.remove('on');[].forEach.call(document.querySelectorAll('.bub.sel'),function(x){x.classList.remove('sel')});return}
  if(bb){[].forEach.call(document.querySelectorAll('.bub.sel'),function(x){x.classList.remove('sel')});bb.classList.add('sel');sel=bb.querySelector('span').innerText;if(bar)bar.classList.add('on')}};
 $('txt').addEventListener('click',waH);$('phone').addEventListener('click',function(e){if(swOn()&&ph.app==='wa'&&e.target.closest('.wa'))waH(e)});
 $('bkbar').addEventListener('click',function(e){var b=e.target.closest('[data-bk]');if(!b||b.dataset.bk===BK)return;if(ph.s&&ph.s!=='home'&&ph.s!=='pos-valor'&&ph.s!=='load')return toast('Termine este Pix antes de trocar de banco. Cada banco tem o seu saldo.');setBank(b.dataset.bk)});
 $('nivel').onchange=function(){fi=cfg.niveis.indexOf(+$('nivel').value);if(fi<0)fi=0;fase()};
 $('nivel').value=cfg.niveis[0];
 theme();bkbar();fase();if(!BK)pickBank(1)}};
})();
