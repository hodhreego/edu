/* Atividades de Pix, maquininha e cartão de crédito: celular imitando o app do banco escolhido pelo aluno */
(function(){
'use strict';
var BANKS={
 nubank:{n:'Nubank',h:'#820AD1',f:'#fff',b:'#820AD1',bt:'#fff',bg:'#f4f0f8',style:'tall'},
 bb:{n:'Banco do Brasil',h:'#FAE128',f:'#0038A8',b:'#0038A8',bt:'#fff',bg:'#f3f5fb',style:'bar'},
 itau:{n:'Itaú',h:'#EC7000',f:'#fff',b:'#EC7000',bt:'#fff',bg:'#fff',style:'bar'},
 bradesco:{n:'Bradesco',h:'#CC092F',f:'#fff',b:'#CC092F',bt:'#fff',bg:'#fff',style:'bar'},
 caixa:{n:'Caixa',h:'#005CA9',f:'#fff',b:'#F39200',bt:'#fff',bg:'#eef4fa',style:'tall'},
 inter:{n:'Inter',h:'#FF7A00',f:'#fff',b:'#FF7A00',bt:'#fff',bg:'#fff',style:'tall'},
 santander:{n:'Santander',h:'#EC0000',f:'#fff',b:'#EC0000',bt:'#fff',bg:'#fff',style:'bar'}};
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
  else if(L===2){var a=rnd(4,12)*500+pick([0,50*0]),b=rnd(3,9)*500+500/2*0+pick([0,250]);v=a+b;t='Você deve a <b>'+p.nome+'</b> dois serviços: '+s+' ('+fmt(a)+') e '+pick(SERV.filter(function(x){return x!==s}))+' ('+fmt(b)+'). Pague <b>os dois de uma vez</b> no Pix para o celular <b>'+p.chave+'</b>.'}
  else{var dv=rnd(8,20)*1000,jp=rnd(2,6)*1000;v=dv-jp;t='Você deve <b>'+fmt(dv)+'</b> a <b>'+p.nome+'</b>, mas já entregou <b>'+fmt(jp)+'</b> em dinheiro. Faça o Pix do <b>que falta</b> para o celular <b>'+p.chave+'</b>.'}
  return {txt:t+' '+pinTxt(pn),contacts:cts('cel',p,3),target:{nome:p.nome,valor:v},pin:pn,modo:'pix'}},
 cpf:function(L){var p=pessoa('cpf'),pn=pin(),h=rnd(2,5),vh=rnd(4,9)*500,v,t;
  if(L===1){v=h*vh;t='<b>'+p.nome+'</b> trabalhou <b>'+h+' horas</b> na sua casa, cobrando <b>'+fmt(vh)+' por hora</b>. Pague o total no Pix pelo <b>CPF</b> <b>'+p.chave+'</b>.'}
  else if(L===2){var ds=rnd(1,4)*1000;v=h*vh+ds;t='<b>'+p.nome+'</b> trabalhou <b>'+h+' horas</b> a <b>'+fmt(vh)+'</b> a hora e cobra <b>'+fmt(ds)+'</b> de deslocamento. Pague tudo no Pix pelo <b>CPF</b> <b>'+p.chave+'</b>.'}
  else{vh=rnd(4,9)*1000;v=Math.round(h*vh*.9);t='<b>'+p.nome+'</b> cobra <b>'+fmt(vh)+' por hora</b> e trabalhou <b>'+h+' horas</b>. Como o pagamento é <b>no Pix</b>, ela dá <b>10% de desconto</b> no total. Pague pelo <b>CPF</b> <b>'+p.chave+'</b>.'}
  return {txt:t+' '+pinTxt(pn),contacts:cts('cpf',p,3),target:{nome:p.nome,valor:v},pin:pn,modo:'pix'}},
 email:function(L){var p=pessoa('mail'),pn=pin(),n=pick([3,4,5,6]),v,t;
  if(L===1){var pt=rnd(8,30)*100;t='A conta do restaurante foi <b>'+fmt(pt*n)+'</b>, dividida igualmente entre <b>'+n+' amigos</b>. <b>'+p.nome+'</b> pagou tudo no cartão. Mande no Pix a <b>sua parte</b> para o e-mail <b>'+p.chave+'</b>.';v=pt}
  else if(L===2){var b0=rnd(5,20)*500;t='A conta foi <b>'+fmt(b0*n)+'</b> mais <b>10% de gorjeta</b>, dividida igualmente entre <b>'+n+' amigos</b>. <b>'+p.nome+'</b> pagou. Mande a <b>sua parte</b> no Pix para o e-mail <b>'+p.chave+'</b>.';v=Math.round(b0*1.1)}
  else{var pc=rnd(6,16)*500,cv=pick([500,1000,1500]);t='A conta foi <b>'+fmt(pc*n)+'</b> (dividida igualmente entre <b>'+n+' amigos</b>) e cada um paga ainda um <b>couvert artístico de '+fmt(cv)+'</b>. <b>'+p.nome+'</b> pagou. Mande a <b>sua parte</b> (conta + couvert) pelo e-mail <b>'+p.chave+'</b>.';v=pc+cv}
  return {txt:t+' '+pinTxt(pn),contacts:cts('mail',p,3),target:{nome:p.nome,valor:v},pin:pn,modo:'pix'}},
 qr:function(L){var pn=pin(),loja=pick(['Padaria Pão Dourado','Livraria Estrela','Pet Shop Amigo Fiel','Papelaria Central','Mercado Bom Preço']),P,d,v,t,w1,w2;
  if(L===1){P=rnd(3,12)*2000;d=pick([10,20,25,50]);v=P-P*d/100;t='Na <b>'+loja+'</b>, um produto custa <b>'+fmt(P)+'</b> e hoje tem <b>'+d+'% de desconto</b> no Pix. Aponte a câmera para o <b>QR Code que cobra o valor certo</b>.';w1=P+P*d/100;w2=P-d*100}
  else if(L===2){var a=rnd(2,8)*2000,b=rnd(1,6)*2000;P=a+b;d=pick([10,20,25]);v=P-P*d/100;t='Na <b>'+loja+'</b>, você comprou dois produtos: <b>'+fmt(a)+'</b> e <b>'+fmt(b)+'</b>. O <b>desconto é de '+d+'%</b> sobre o total. Escaneie o <b>QR Code com o valor certo</b>.';w1=P-a*d/100;w2=P+P*d/100}
  else{P=rnd(5,20)*2000;d=pick([5,10,15,25]);var fr=rnd(1,4)*1000;v=P-P*d/100+fr;t='Na <b>'+loja+'</b>, o produto custa <b>'+fmt(P)+'</b>, com <b>'+d+'% de desconto</b>, mas a entrega custa <b>'+fmt(fr)+'</b> (sem desconto). Escaneie o <b>QR Code do valor total certo</b>.';w1=P-P*d/100;w2=P+fr}
  var vs=[v,w1,w2];if(vs.some(function(x,i){return vs.indexOf(x)!==i})||w1===v||w2===v)return GEN.qr(L);
  var qrs=shuffle([{v:v,ok:1},{v:w1},{v:w2}]).map(function(q,i){return {letra:'ABC'[i],valor:q.v,ok:q.ok,nome:loja}});
  return {txt:t+' '+pinTxt(pn),contacts:[],qrs:qrs,target:{nome:loja,valor:v},pin:pn,modo:'qr'}},
 golpe:function(L){var pn=pin(),emp=pick(['Pão Dourado Padaria','Clínica Vida Plena','Auto Peças Veloz','Escola de Idiomas Futuro','Mercado Bom Preço']),p=pessoa('cnpj',emp),v=(L===1?rnd(3,15)*1000:L===2?rnd(30,150)*500+pick([0,250]):rnd(40,300)*250+pick([0,50])),
   falso=pessoa('cnpj',pick(['Joaquim Pereira Ferreira ME','Rosana Lima Comércio','José Carlos Santos Ltda']));
  var c=p.chave,fc=c.slice(0,-2)+(String(rnd(10,99)));if(fc===c)fc=c.slice(0,-2)+'00';falso.chave=fc;
  var t='Você vai pagar a <b>'+emp+'</b> o valor de <b>'+fmt(v)+'</b>. A chave Pix é o <b>CNPJ '+c+'</b>. <b>Antes de confirmar, confira o NOME do destinatário</b> na tela: se for outro, <b>cancele</b> e confira os números da chave.';
  return {txt:t+' '+pinTxt(pn),contacts:[p,falso],target:{nome:emp,valor:v},pin:pn,modo:'pix'}},
 pos:function(L){var pn=pin(),v=rnd(2,15)*2000,forma,pc,tx,tabela='<table class="tb"><tr><th>Forma</th><th>Taxa</th></tr><tr><td>Débito</td><td>1,5%</td></tr><tr><td>Crédito à vista</td><td>3%</td></tr><tr><td>Crédito 2 a 6 vezes</td><td>4,5%</td></tr><tr><td>Crédito 7 a 12 vezes</td><td>6%</td></tr></table>';
  if(L===1){forma='debito';pc=1;tx=1.5}else if(L===2){var o=pick([[ 'credito',1,3],['credito',pick([2,3,4,5,6]),4.5],['debito',1,1.5]]);forma=o[0];pc=o[1];tx=o[2]}else{var o2=pick([['credito',rnd(7,12),6],['credito',rnd(2,6),4.5],['credito',1,3]]);forma=o2[0];pc=o2[1];tx=o2[2];v=rnd(3,25)*2000}
  var fee=Math.round(v*tx/10)/10;if(fee!==Math.round(fee))return GEN.pos(L);fee=Math.round(fee);
  var desc=forma==='debito'?'no <b>débito</b>':pc===1?'no <b>crédito à vista</b>':'no <b>crédito em '+pc+'x</b>';
  var t='Você é o lojista. Um cliente vai pagar <b>'+fmt(v)+'</b> '+desc+'. <b>Passe a venda na maquininha</b> (valor, forma de pagamento'+(forma==='credito'?' e parcelas':'')+') e depois calcule a <b>taxa</b> cobrada e o <b>valor líquido</b> que cai na sua conta.'+tabela;
  return {txt:t+' '+pinTxt(pn).replace('seu app','cartão do cliente'),modo:'pos',venda:{valor:v,forma:forma,parc:pc},pin:pn,fields:[{q:'Taxa cobrada pela maquininha',a:fee},{q:'Valor líquido que cai na sua conta',a:v-fee}]}},
 parcela:function(L){var P,n,j,t,f=[],ch=null;
  for(var g=0;g<200;g++){
   if(L===1){P=rnd(3,15)*10000;n=pick([2,3,4,5,10]);if(P%n)continue;t='Uma geladeira custa <b>'+fmt(P)+'</b> no cartão de crédito, em <b>'+n+' parcelas iguais, sem juros</b>.';f=[{q:'Valor de cada parcela',a:P/n},{q:'Total pago no fim',a:P}];break}
   if(L===2){P=rnd(4,20)*10000;n=pick([5,10]);j=pick([10,20]);var tot=P+P*j/100,pa=tot/n;if(pa!==Math.round(pa))continue;var dd=pick([5,10]);var av=P-P*dd/100;t='Uma TV custa <b>'+fmt(P)+'</b>. À vista tem <b>'+dd+'% de desconto</b>. No cartão, em <b>'+n+'x</b>, o total tem <b>'+j+'% de juros</b>.';f=[{q:'Valor de cada parcela',a:pa},{q:'Total pago no parcelado',a:tot},{q:'Preço à vista com desconto',a:av}];ch={q:'Qual é a opção mais barata?',opts:['À vista com desconto','Parcelado com juros'],a:0};break}
   P=rnd(5,20)*10000;n=pick([5,10]);j=pick([2,4]);var ent=P*30/100,rest=P-ent,jt=rest*j*n/100/ (n===10?1:1),pr=(rest+jt)/n;if(pr!==Math.round(pr)||ent!==Math.round(ent)||jt!==Math.round(jt))continue;
   t='Um notebook custa <b>'+fmt(P)+'</b>. Você dá <b>30% de entrada</b> e parcela o resto em <b>'+n+'x</b>, com juros simples de <b>'+j+'% ao mês</b> sobre o valor financiado (<b>'+(j*n)+'%</b> no total).';f=[{q:'Valor da entrada',a:ent},{q:'Juros pagos no total',a:jt},{q:'Valor de cada parcela',a:pr}];break}
  if(!f.length)return GEN.parcela(L);
  return {txt:t,modo:'quiz',fields:f,choose:ch,cart:'parcelado'}},
 fatura:function(L){var F=rnd(5,30)*10000,t,f=[],mn=F*15/100,sd=F-mn;
  if(L===1){t='Sua fatura do cartão fechou em <b>'+fmt(F)+'</b>. O <b>pagamento mínimo</b> é de <b>15%</b> da fatura.';f=[{q:'Pagamento mínimo',a:mn}]}
  else if(L===2){t='Sua fatura é <b>'+fmt(F)+'</b>. Você paga só o <b>mínimo (15%)</b>. O que sobra vira <b>dívida</b> e rende <b>juros de 12% ao mês</b> (rotativo).';var jr=sd*12/100;f=[{q:'Pagamento mínimo',a:mn},{q:'Saldo que fica devendo',a:sd},{q:'Juros do mês',a:Math.round(jr)},{q:'Dívida no mês seguinte',a:sd+Math.round(jr)}]}
  else{var pg=F*40/100,rs=F-pg,jj=Math.round(rs*12/100);t='Sua fatura é <b>'+fmt(F)+'</b>. Você paga <b>40%</b> dela. O restante rende <b>juros de 12% ao mês</b>.';f=[{q:'Valor que você pagou (40%)',a:pg},{q:'Saldo que fica devendo',a:rs},{q:'Juros do mês',a:jj},{q:'Dívida no mês seguinte',a:rs+jj}]}
  return {txt:t,modo:'quiz',fields:f,cart:'fatura'}}
};
/* ---------- jogo ---------- */
window.BANK={run:function(cfg){
 var BK=null;try{BK=localStorage.getItem('edu_banco')}catch(e){}if(!BANKS[BK])BK=null;
 var fi=0,ti=0,pts=0,tasks=[],T=null,ph={},lock=false,pt=0;
 var app=$('app');
 app.innerHTML='<div class="top"><div><h1>'+cfg.titulo+'</h1><div class="sub" id="sub"></div></div><div class="coin"><i>$</i><span id="pts">0 pontos</span></div><div class="btns"><div class="dots" id="dots"></div><select id="nivel" class="ndiv"><option value="1">6º/7º ano</option><option value="2">8º ano</option><option value="3">9º ano</option></select><button class="btn sec" id="bBanco">🏦 Banco</button></div></div><div class="inst" id="inst"></div><div class="main"><div class="card" id="ped"><h2>📋 Pedido</h2><div id="txt" class="stm"></div><div id="qrs"></div></div><div class="card" id="stage"><div class="phone" id="phone"></div><div class="msg" id="msg"></div></div></div><div class="fim" id="fim"><div class="box"><h2 id="fT"></h2><p id="fP"></p><button class="btn ok" id="fB"></button></div></div><div id="bpick"></div>';
 function theme(){var b=BANKS[BK]||BANKS.nubank,s=$('phone').style;s.setProperty('--bh',b.h);s.setProperty('--bf',b.f);s.setProperty('--bb',b.b);s.setProperty('--bt',b.bt);s.setProperty('--bg',b.bg);$('phone').dataset.st=b.style}
 function pickBank(first){var bp=$('bpick');bp.className='on';bp.innerHTML='<div class="box"><h2>🏦 Escolha o seu banco</h2><p>O app do celular vai imitar o do banco escolhido.</p><div class="bks">'+Object.keys(BANKS).map(function(k){var b=BANKS[k];return '<button data-k="'+k+'" style="background:'+b.h+';color:'+b.f+'">'+b.n+'</button>'}).join('')+'</div></div>';
  bp.onclick=function(e){var k=e.target.dataset&&e.target.dataset.k;if(!k)return;BK=k;try{localStorage.setItem('edu_banco',k)}catch(x){}bp.className='';theme();ph.s=ph.s;draw()}}
 $('bBanco').onclick=function(){pickBank()};
 function setPts(d){pts=Math.max(0,pts+d);$('pts').textContent=pts+' pontos'}
 function dots(){var d=$('dots');d.innerHTML='';tasks.forEach(function(_,i){var x=document.createElement('i');x.className=i<ti?'d':i===ti?'c':'';d.appendChild(x)})}
 function msg(t,c){$('msg').textContent=t;$('msg').className='msg '+(c||'')}
 function fase(){var L=cfg.niveis[fi];tasks=[];var seen={};for(var g=0;g<80&&tasks.length<6;g++){var t=GEN[cfg.gen](L);if(seen[t.txt])continue;seen[t.txt]=1;tasks.push(t)}ti=0;task()}
 function task(){T=tasks[ti];lock=false;ph={s:T.modo==='pos'?'pos-valor':'home',buf:'',pb:'',vals:[],sale:{}};msg('');
  $('txt').innerHTML=T.txt;var q=$('qrs');q.innerHTML='';
  if(T.qrs)q.innerHTML='<div class="qrl">'+T.qrs.map(function(x,i){return '<div class="qrc"><div class="qrimg"></div><b>QR Code '+x.letra+'</b><span>'+x.nome+'</span><span class="qv">'+fmt(x.valor)+'</span><button class="btn sec" data-qr="'+i+'">📷 Escanear</button></div>'}).join('')+'</div>';
  $('inst').innerHTML=cfg.instrucao;$('sub').textContent='Fase '+(fi+1)+'/3 · questão '+(ti+1)+'/'+tasks.length;dots();draw()}
 /* ----- desenho do celular ----- */
 function hd(t,back){var b=BANKS[BK]||BANKS.nubank;return '<div class="hd '+b.style+'">'+(back?'<button class="bk" data-a="'+back+'">‹</button>':'')+'<span>'+t+'</span></div>'}
 function toast(t){var e=$('phone').querySelector('.toast');if(e)e.remove();var d=document.createElement('div');d.className='toast';d.textContent=t;$('phone').appendChild(d);setTimeout(function(){d.remove()},2600)}
 function keypad(){return '<div class="kp">'+[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(function(k){return '<button data-k="'+k+'">'+k+'</button>'}).join('')+'</div>'}
 function dots4(n){return '<div class="pd">'+[0,1,2,3].map(function(i){return '<i class="'+(i<n?'f':'')+'"></i>'}).join('')+'</div>'}
 function draw(){var P=$('phone'),b=BANKS[BK]||BANKS.nubank,s=ph.s,h='';theme();if(!BK){pickBank(1);return}
  if(s==='home')h=hd(b.n)+'<div class="sal">Saldo disponível<b>'+fmt(125000)+'</b></div><div class="gr">'+[['💠','Pix','menu'],['📄','Pagar',''],['🔁','Transferir',''],['💳','Cartões',''],['📱','Recarga',''],['⋯','Mais','']].map(function(x){return '<button class="gb" data-a="'+(x[2]||'off')+'"><i>'+x[0]+'</i>'+x[1]+'</button>'}).join('')+'</div>';
  else if(s==='menu')h=hd('Área Pix','home')+'<div class="ls"><button data-a="chave"><i>📤</i>Transferir<small>Por chave: CPF, celular, e-mail...</small></button><button data-a="cam"><i>📷</i>Pagar com QR Code<small>Aponte a câmera</small></button><button data-a="off"><i>📥</i>Receber</button><button data-a="off"><i>🔑</i>Minhas chaves</button></div>';
  else if(s==='chave')h=hd('Transferir com Pix','menu')+'<div class="bd"><label>Para quem você quer enviar?</label><input id="inChave" type="text" autocomplete="off" placeholder="CPF/CNPJ, celular, e-mail ou chave aleatória" value="'+(ph.chave||'')+'"><button class="pb" data-a="chave-ok">Continuar</button><p class="hint">Digite a chave exatamente como está no pedido.</p></div>';
  else if(s==='valor')h=hd('Valor','chave')+'<div class="bd"><div class="who">Para <b>'+ph.c.nome+'</b></div><label>Qual valor você quer enviar?</label><input id="inVal" type="text" inputmode="decimal" autocomplete="off" placeholder="R$ 0,00"><button class="pb" data-a="valor-ok">Continuar</button></div>';
  else if(s==='cam')h=hd('Pagar com Pix','menu')+'<div class="cam"><div class="vf"></div><p>Aponte a câmera para o QR Code<br><small>Toque em <b>📷 Escanear</b> no QR Code certo (lado esquerdo).</small></p></div>';
  else if(s==='conf')h=hd('Confirme os dados','menu')+'<div class="bd"><div class="cf"><span>Valor</span><b class="big">'+fmt(ph.v)+'</b><span>Para</span><b>'+ph.c.nome+'</b><span>Instituição</span><b>'+ph.c.banco+'</b><span>Chave</span><b>'+ph.c.chave+'</b></div><button class="pb" data-a="conf-ok">Transferir agora</button><button class="pb sec" data-a="cancel">Cancelar</button></div>';
  else if(s==='pin')h=hd('Senha de 4 dígitos')+'<div class="bd c"><p>Digite a senha do app para confirmar</p>'+dots4(ph.pb.length)+keypad()+'</div>';
  else if(s==='rec')h='<div class="rc"><div class="ck">✔</div><h3>Pix enviado!</h3><b class="big">'+fmt(ph.v)+'</b><p>para <b>'+ph.c.nome+'</b><br>'+ph.c.banco+'</p><small>'+new Date().toLocaleString('pt-BR')+'</small></div>';
  else if(s==='pos-valor')h='<div class="pos"><div class="ps"><small>Digite o valor da venda</small><b class="big">'+fmt(+ph.buf||0)+'</b></div>'+keypad()+'</div>';
  else if(s==='pos-forma')h='<div class="pos"><div class="ps"><small>Valor</small><b class="big">'+fmt(ph.sale.valor)+'</b><small>Escolha a forma de pagamento</small></div><button class="pb" data-f="debito">💳 Débito</button><button class="pb" data-f="credito">💳 Crédito</button></div>';
  else if(s==='pos-parc')h='<div class="pos"><div class="ps"><small>Crédito · '+fmt(ph.sale.valor)+'</small><small>Quantas parcelas?</small></div><div class="pg">'+[1,2,3,4,5,6,7,8,9,10,11,12].map(function(n){return '<button data-p="'+n+'">'+(n===1?'À vista':n+'x')+'</button>'}).join('')+'</div></div>';
  else if(s==='pos-cartao')h='<div class="pos"><div class="ps"><small>'+(ph.sale.forma==='debito'?'Débito':'Crédito '+(ph.sale.parc>1?ph.sale.parc+'x':'à vista'))+' · '+fmt(ph.sale.valor)+'</small><small>Aproxime ou insira o cartão do cliente</small></div><button class="card3" data-a="pos-cartao">💳<br>Toque aqui para aproximar</button></div>';
  else if(s==='pos-pin')h='<div class="pos"><div class="ps"><small>Senha do cliente</small></div>'+dots4(ph.pb.length)+keypad()+'</div>';
  else if(s==='pos-ok'||s==='quiz-pos')h='<div class="pos ok"><div class="ps"><b class="big">APROVADA ✔</b><small>'+(ph.sale.forma==='debito'?'Débito':'Crédito '+(ph.sale.parc>1?ph.sale.parc+'x':'à vista'))+'</small><b class="big">'+fmt(ph.sale.valor)+'</b></div>'+fieldsHtml()+'</div>';
  else if(s==='quiz')h=hd(T.cart==='fatura'?'Fatura do cartão':'Compra no cartão')+'<div class="bd"><div class="cart">💳<div><small>'+b.n+' · final 4821</small><b>Cartão de crédito</b></div></div>'+fieldsHtml()+'</div>';
  P.innerHTML=h;var ic=P.querySelector('#inChave');if(ic)setTimeout(function(){ic.focus()},50);var iv=P.querySelector('#inVal');if(iv)setTimeout(function(){iv.focus()},50)}
 function fieldsHtml(){return '<div class="fl">'+T.fields.map(function(f,i){return '<label>'+f.q+'</label><input class="fi" data-i="'+i+'" type="text" inputmode="decimal" autocomplete="off" placeholder="R$ 0,00">'}).join('')+(T.choose?'<label>'+T.choose.q+'</label><div class="ch">'+T.choose.opts.map(function(o,i){return '<button data-ch="'+i+'">'+o+'</button>'}).join('')+'</div>':'')+'<button class="pb" data-a="quiz-ok">Conferir ✔</button></div>'}
 function go(s){ph.s=s;draw()}
 function wrong(m){if(lock)return;setPts(-10);msg(m,'bad');var P=$('phone');P.classList.add('shake');setTimeout(function(){P.classList.remove('shake');ph.s=T.modo==='pos'?'pos-valor':'home';ph.buf='';ph.pb='';ph.chave='';ph.sale={};draw()},1400)}
 function right(m){lock=true;setPts(15);msg(m,'good');setTimeout(function(){ti++;if(ti>=tasks.length)fim();else task()},1800)}
 function fim(){var f=$('fim');$('fT').textContent=fi<2?'Fase '+(fi+1)+' concluída! 🎉':'Parabéns! Terminou todas as fases! 🏆';$('fP').textContent='Você tem '+pts+' pontos.';$('fB').textContent=fi<2?'Próxima fase ▶':'Jogar de novo ↺';f.classList.add('on');$('fB').onclick=function(){f.classList.remove('on');if(fi<2)fi++;else{fi=0;pts=0;setPts(0)}$('nivel').value=cfg.niveis[fi];fase()}}
 function judge(){var ok=ph.c.nome===T.target.nome&&ph.v===T.target.valor;
  setTimeout(function(){if(ok)right('Pix certo! '+fmt(ph.v)+' para '+ph.c.nome+'.');
   else if(ph.c.nome!==T.target.nome)wrong('Você enviou o Pix para '+ph.c.nome+', a pessoa errada! Sempre confira o nome antes de confirmar.');
   else wrong('O valor enviado está errado. Refaça o cálculo do pedido.')},900)}
 function press(k,pos){
  if(ph.s==='pos-valor'){if(k==='⌫')ph.buf=ph.buf.slice(0,-1);else if(k==='OK'){var v=+ph.buf||0;if(v<=0){toast('Digite o valor');return}ph.sale.valor=v;go('pos-forma');return}else if(ph.buf.length<8)ph.buf+=k;draw();return}
  if(k==='⌫')ph.pb=ph.pb.slice(0,-1);else if(k==='OK')return;else if(ph.pb.length<4)ph.pb+=k;
  if(ph.pb.length===4){if(ph.pb===T.pin){var nx=ph.s==='pin'?'rec':'pos-ok';ph.pb='';go(nx);if(nx==='rec')judge();else ph.s='pos-ok',draw();return}else{ph.pb='';toast('Senha incorreta');}}
  draw()}
 $('phone').addEventListener('click',function(e){var t=e.target.closest('button');if(!t||lock)return;
  if(t.dataset.k!==undefined)return press(t.dataset.k);
  if(t.dataset.f){ph.sale.forma=t.dataset.f;if(t.dataset.f==='debito'){ph.sale.parc=1;go('pos-cartao')}else go('pos-parc');return}
  if(t.dataset.p){ph.sale.parc=+t.dataset.p;go('pos-cartao');return}
  if(t.dataset.ch!==undefined){ph.ch=+t.dataset.ch;[].forEach.call(t.parentNode.children,function(x){x.classList.remove('on')});t.classList.add('on');return}
  var a=t.dataset.a;if(!a)return;
  if(a==='off')return toast('Nesta atividade use o Pix 💠');
  if(a==='chave-ok'){var v=$('inChave').value;ph.chave=v;var c=T.contacts.filter(function(x){return norm(x.chave)===norm(v)})[0];if(!c)return toast('Chave Pix não encontrada. Confira os dados.');ph.c=c;go('valor');return}
  if(a==='valor-ok'){var n=parse($('inVal').value);if(!(n>0))return toast('Digite um valor válido');ph.v=n;go('conf');return}
  if(a==='conf-ok'){ph.pb='';go('pin');return}
  if(a==='cancel'){ph.c=null;toast('Pix cancelado');go('home');return}
  if(a==='pos-cartao'){if(ph.sale.forma==='debito'){ph.pb='';go('pos-pin')}else{ph.pb='';go('pos-pin')}return}
  if(a==='quiz-ok')return quiz();
  go(a)});
 function quiz(){var ins=[].slice.call($('phone').querySelectorAll('.fi')),ok=true,miss=[];
  ins.forEach(function(i,k){var v=parse(i.value);if(!(v===T.fields[k].a)){ok=false;miss.push(T.fields[k].q)}i.classList.toggle('bad',v!==T.fields[k].a)});
  if(T.modo==='pos'){var s=ph.sale,V=T.venda;if(s.valor!==V.valor||s.forma!==V.forma||(s.parc||1)!==V.parc)return wrong('A venda na maquininha não confere com o pedido (valor, forma ou parcelas).')}
  if(T.choose&&ph.ch!==T.choose.a){ok=false;miss.push(T.choose.q)}
  if(ok)right('Tudo certo! 🎉');else wrong('Confira: '+miss[0]+(miss.length>1?' (e mais '+(miss.length-1)+')':'')+'.')}
 $('qrs').addEventListener('click',function(e){var t=e.target.closest('button');if(!t||lock)return;if(ph.s!=='cam')return toast2('Abra o Pix no celular: Pix → Pagar com QR Code.');var q=T.qrs[+t.dataset.qr];ph.c={nome:q.nome,banco:'Banco da loja',chave:'QR Code '+q.letra};ph.v=q.valor;go('conf')});
 function toast2(t){msg(t,'bad');setTimeout(function(){if(!lock)msg('')},2600)}
 $('nivel').onchange=function(){fi=cfg.niveis.indexOf(+$('nivel').value);if(fi<0)fi=0;fase()};
 $('nivel').value=cfg.niveis[0];
 theme();fase();if(!BK)pickBank(1)}};
})();
