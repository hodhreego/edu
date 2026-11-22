/* EduBank - banco fictício da plataforma (câmbio e transferências em moedas estrangeiras e criptomoedas).
   Uso: EDUBANK.open({login,getCash,addCash,host,onClose}) ; EDUBANK.icone(tam) ; EDUBANK.adaptadorLocal(login).
   Valores em CENTAVOS (R$) e na MENOR UNIDADE de cada moeda (fiduciária e=100, cripto e=1e8). Cliente sem dependências. */
(function(){
'use strict';
var RE=/^\d{1,3}[a-z]{3}\d[a-z]$/;
var MOEDAS=[
 {c:'USD',f:'🇺🇸',s:'US$',n:'Dólar americano',e:100},{c:'EUR',f:'🇪🇺',s:'€',n:'Euro',e:100},{c:'GBP',f:'🇬🇧',s:'£',n:'Libra esterlina',e:100},
 {c:'JPY',f:'🇯🇵',s:'¥',n:'Iene japonês',e:100},{c:'ARS',f:'🇦🇷',s:'AR$',n:'Peso argentino',e:100},{c:'CNY',f:'🇨🇳',s:'CN¥',n:'Yuan chinês',e:100},
 {c:'BTC',f:'₿',s:'₿',n:'Bitcoin',e:1e8,x:1},{c:'ETH',f:'Ξ',s:'Ξ',n:'Ethereum',e:1e8,x:1},{c:'SOL',f:'◎',s:'◎',n:'Solana',e:1e8,x:1},
 {c:'XRP',f:'✕',s:'✕',n:'XRP',e:1e8,x:1},{c:'DOGE',f:'Ð',s:'Ð',n:'Dogecoin',e:1e8,x:1},{c:'USDT',f:'₮',s:'₮',n:'Tether',e:1e8,x:1}];
var MAP={};MOEDAS.forEach(function(m){MAP[m.c]=m});
/* abas: para a futura aba "Investir" basta acrescentar {k:'investir',n:'Investir',i:'📈',fn:telaInvestir} */
var TABS=[{k:'inicio',n:'Início',i:'🏠',fn:function(){telaInicio()}},{k:'cambio',n:'Câmbio',i:'💱',fn:function(){telaCambio()}},
 {k:'transferir',n:'Transferir',i:'💸',fn:function(){telaTransferir()}},{k:'extrato',n:'Extrato',i:'🧾',fn:function(){telaExtrato()}}];
var root=null,O=null,LOGIN='',TOKEN='',DADOS=null,aba='inicio',pend={},icn=0,pos=null;

function ep(){return window.EDU_ENDPOINT||window.RBX_ENDPOINT||''}
function turma(l){return String(l||'').replace(/^\d+/,'')}
function num(l){var m=String(l||'').match(/^\d+/);return m?m[0]:''}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function sep(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
function rs(c){c=Math.round(Number(c)||0);var neg=c<0;c=Math.abs(c);return (neg?'-':'')+'R$ '+sep(Math.floor(c/100))+','+('0'+(c%100)).slice(-2)}
function aluno(l){return 'Aluno nº '+num(l)+' · '+turma(l)}
function dt(ts){try{return new Date(Number(ts)||ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function lget(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function lset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function dec(m){return Math.round(Math.log(m.e)/Math.LN10)}
/* quantidade na menor unidade -> texto (inteiro, sem float) */
function qtd(m,v,semSig){
  v=Math.round(Number(v)||0);var neg=v<0;v=Math.abs(v);var d=dec(m),s=String(v);while(s.length<=d)s='0'+s;
  var i=s.slice(0,s.length-d),f=s.slice(s.length-d);
  var t=sep(i)+','+f;
  return (neg?'-':'')+(m.x?t+' '+m.c:(semSig?'':m.s+' ')+t);
}
/* texto digitado -> menor unidade (NaN se inválido) */
function parseQ(m,t){
  t=String(t||'').replace(/[A-Za-z$€£¥₿Ξ◎✕Ð₮\s]/g,'');if(!t)return NaN;
  if(t.indexOf(',')>-1)t=t.replace(/\./g,'').replace(',','.');
  var d=dec(m),mm=t.match(/^(\d+)(?:\.(\d*))?$/);if(!mm)return NaN;
  var f=(mm[2]||'');if(f.length>d)return NaN;while(f.length<d)f+='0';
  var r=Number(mm[1]+f);return isFinite(r)&&r<=9007199254740991?r:NaN;
}
function taxaDe(c){var t=DADOS&&DADOS.taxas&&DADOS.taxas[c];if(t==null)return 0;return Number(typeof t==='object'?t.t:t)||0}
function escalaDe(c){var t=DADOS&&DADOS.taxas&&DADOS.taxas[c];return (t&&typeof t==='object'&&Number(t.e))||MAP[c].e}
/* valor estimado em centavos de R$ (só exibição; o servidor é quem manda) */
function estim(c,v,op){var k=taxaDe(c)*(1+(op==='vender'?-0.02:0.02))*v/escalaDe(c)*100;return op==='vender'?Math.floor(k):Math.ceil(k-1e-9)}
function fmtTaxa(c){var t=taxaDe(c);if(!t)return '—';return 'R$ '+t.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:t<1?4:2})}

/* ---------- ícone ---------- */
function icone(tam){
  var u='eb'+(++icn);tam=tam||60;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="'+tam+'" height="'+tam+'" role="img" aria-label="EduBank">'+
  '<defs>'+
  '<linearGradient id="'+u+'a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f7a8a"/><stop offset=".48" stop-color="#2b4aa8"/><stop offset="1" stop-color="#5a1fa8"/></linearGradient>'+
  '<radialGradient id="'+u+'b" cx=".3" cy=".08" r=".8"><stop offset="0" stop-color="#7ff0e6" stop-opacity=".55"/><stop offset="1" stop-color="#7ff0e6" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="'+u+'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#ffd24a"/><stop offset=".75" stop-color="#e09a12"/><stop offset="1" stop-color="#a96700"/></linearGradient>'+
  '<linearGradient id="'+u+'d" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#b87400"/><stop offset="1" stop-color="#ffe27a"/></linearGradient>'+
  '<linearGradient id="'+u+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
  '<filter id="'+u+'s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3.5" stdDeviation="3.2" flood-color="#1a0a40" flood-opacity=".55"/></filter>'+
  '<filter id="'+u+'e" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/><feOffset dx="0" dy="2.2" result="o"/><feComposite in="SourceAlpha" in2="o" operator="arithmetic" k2="1" k3="-1"/><feFlood flood-color="#fff" flood-opacity=".5"/><feComposite in2="SourceAlpha" operator="in"/></filter>'+
  '<clipPath id="'+u+'k"><rect width="120" height="120" rx="27"/></clipPath>'+
  '</defs>'+
  '<g clip-path="url(#'+u+'k)"><rect width="120" height="120" fill="url(#'+u+'a)"/><rect width="120" height="120" fill="url(#'+u+'b)"/>'+
  '<circle cx="104" cy="112" r="46" fill="#a76bff" opacity=".28"/><circle cx="12" cy="8" r="36" fill="#4ff0d0" opacity=".16"/>'+
  '<path d="M0 82 Q40 66 80 78 T120 70 V120 H0Z" fill="#14083a" opacity=".22"/>'+
  '<rect width="120" height="120" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="3" rx="27" filter="url(#'+u+'e)"/></g>'+
  '<g filter="url(#'+u+'s)"><circle cx="60" cy="58" r="34" fill="url(#'+u+'d)"/><circle cx="60" cy="58" r="31.5" fill="url(#'+u+'c)"/>'+
  '<circle cx="60" cy="58" r="25.5" fill="none" stroke="#a96700" stroke-opacity=".55" stroke-width="1.4"/><circle cx="60" cy="58" r="27" fill="none" stroke="#fff6c0" stroke-opacity=".7" stroke-width=".8"/></g>'+
  '<text x="60" y="73" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="800" font-size="46" fill="#7a4400" fill-opacity=".85" transform="translate(0.9 1.3)">$</text>'+
  '<text x="60" y="73" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="800" font-size="46" fill="#fff4c2" transform="translate(-0.7 -0.9)" fill-opacity=".9">$</text>'+
  '<text x="60" y="73" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="800" font-size="46" fill="#d98e00">$</text>'+
  '<path d="M33 46 Q45 28 70 30 Q52 36 44 58 Q34 54 33 46Z" fill="#fff" opacity=".45"/>'+
  '<rect x="30" y="94" width="60" height="7" rx="3.5" fill="#fff" opacity=".9"/><rect x="38" y="104" width="44" height="3.5" rx="1.7" fill="#fff" opacity=".5"/>'+
  '<g clip-path="url(#'+u+'k)"><ellipse cx="60" cy="14" rx="62" ry="36" fill="url(#'+u+'g)"/></g></svg>';
}
function marca(tam){return icone(tam)}

/* ---------- sessão / API ---------- */
function sessao(){
  var l=window.EDU_LOGIN,t=window.EDU_TOKEN;if(typeof l==='function')l=l();if(typeof t==='function')t=t();
  if(!(l&&t)){var s=lget('edu_sess',null);if(s&&s.login&&s.t&&(!s.exp||Number(s.exp)>Date.now())){l=s.login;t=s.t}}
  l=String(l||'').toLowerCase();
  if(RE.test(l)&&t){LOGIN=l;TOKEN=String(t);return true}
  return false;
}
function api(p){
  var base=ep();
  if(!base)return Promise.reject(new Error('EduBank indisponível: servidor não configurado.'));
  p.login=LOGIN;p.t=TOKEN;
  var q=Object.keys(p).filter(function(k){return p[k]!==undefined&&p[k]!==null}).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(p[k])}).join('&');
  return fetch(base+(base.indexOf('?')>-1?'&':'?')+q).then(function(r){return r.json()}).then(function(j){
    if(!j)throw new Error('Resposta inválida do servidor.');
    if(!j.ok&&/sess|token|login/i.test(j.erro||'')&&/inv|expir|entre/i.test(j.erro||''))j.sessao=1;
    return j;
  },function(){throw new Error('Sem conexão com o banco. Tente de novo.')});
}
function hb(senha){
  if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('Este navegador não permite criar senha (precisa de https).'));
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(LOGIN+':'+senha+':bank')).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('')});
}
var TEMSENHA=null;
function statSenha(){
  if(TEMSENHA!==null)return Promise.resolve(TEMSENHA);
  return api({acao:'bancostat'}).then(function(j){
    if(!j.ok)throw new Error(msgErro(j));
    TEMSENHA=!!j.tem;return TEMSENHA;
  });
}
function msgErro(j){return (j&&j.erro)||'Não foi possível concluir.'}
function novoId(){return ('e'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)).slice(0,40)}

/* ---------- estilo ---------- */
function css(){
  if(document.getElementById('edubank-css'))return;
  var s=document.createElement('style');s.id='edubank-css';
  s.textContent='#edubank{position:fixed;z-index:2147483000;background:#eef0fa;font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#17163a;display:flex;flex-direction:column;overflow:hidden}'+
  '#edubank.full{inset:0}'+
  '#edubank *{box-sizing:border-box}#edubank button,#edubank input,#edubank select{font-family:inherit}'+
  '#edubank .eb-top{background:linear-gradient(135deg,#0f7a8a,#2b4aa8 55%,#5a1fa8);color:#fff;padding:10px 12px;display:flex;align-items:center;gap:10px;flex:none;box-shadow:0 2px 10px #1a0a4055}'+
  '#edubank .eb-top svg{flex:none;border-radius:22%}#edubank .eb-top b{font-size:1.1em;flex:1;letter-spacing:.2px}'+
  '#edubank .eb-x,#edubank .eb-back{background:rgba(255,255,255,.18);border:0;color:#fff;font-size:1.05em;border-radius:10px;min-width:38px;height:38px;cursor:pointer}'+
  '#edubank .eb-body{flex:1;overflow:auto;padding:14px;-webkit-overflow-scrolling:touch}'+
  '#edubank .eb-w{max-width:560px;margin:0 auto}'+
  '#edubank .eb-nav{flex:none;display:flex;background:#fff;border-top:1px solid #d9dcf0}'+
  '#edubank .eb-nav button{flex:1;border:0;background:none;padding:7px 2px 6px;font-size:.78em;font-weight:700;color:#6a6c92;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px}'+
  '#edubank .eb-nav button i{font-style:normal;font-size:1.55em}#edubank .eb-nav button.on{color:#3b2bb0;box-shadow:inset 0 3px 0 #3b2bb0}'+
  '#edubank .eb-card{background:#fff;border-radius:16px;padding:14px;margin-bottom:12px;box-shadow:0 1px 6px rgba(40,30,110,.12)}'+
  '#edubank .eb-saldo{background:linear-gradient(135deg,#0f7a8a,#2b4aa8 55%,#5a1fa8);color:#fff}'+
  '#edubank .eb-saldo small{opacity:.85;display:block}#edubank .eb-saldo .v{font-size:1.9em;font-weight:800}'+
  '#edubank .eb-chave{display:flex;align-items:center;gap:8px;margin-top:10px;background:rgba(255,255,255,.18);border-radius:10px;padding:7px 10px;font-size:.92em}'+
  '#edubank .eb-chave code{flex:1;font-weight:700;word-break:break-all}'+
  '#edubank .eb-chave button{background:#fff;color:#2b4aa8;border:0;border-radius:8px;padding:7px 11px;font-weight:700;cursor:pointer}'+
  '#edubank .eb-moedas{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:9px;margin-bottom:12px}'+
  '#edubank .eb-m{background:#fff;border-radius:14px;padding:10px 11px;box-shadow:0 1px 5px rgba(40,30,110,.1);border:2px solid transparent;text-align:left;cursor:pointer;min-width:0}'+
  '#edubank .eb-m .f{font-size:1.5em;line-height:1}#edubank .eb-m small{display:block;color:#6a6c92;font-weight:700;margin-top:3px}#edubank .eb-m b{display:block;overflow-wrap:anywhere;font-size:.98em}#edubank .eb-m em{font-style:normal;color:#6a6c92;font-size:.78em}'+
  '#edubank .eb-m.zero b{color:#9a9cb8}#edubank .eb-m.cr{background:linear-gradient(160deg,#fff,#fff7e0)}'+
  '#edubank label{display:block;font-weight:700;margin:11px 0 4px}'+
  '#edubank input,#edubank select{width:100%;font-size:1.05em;padding:11px;border:2px solid #c3c8ee;border-radius:12px;background:#fff;color:#17163a}'+
  '#edubank input:focus,#edubank select:focus{outline:none;border-color:#3b2bb0}'+
  '#edubank .eb-btn{width:100%;margin-top:14px;background:linear-gradient(135deg,#2b4aa8,#5a1fa8);color:#fff;border:0;border-radius:14px;padding:13px;font-size:1.05em;font-weight:800;cursor:pointer}'+
  '#edubank .eb-btn[disabled]{opacity:.55}#edubank .eb-btn.sec{background:#fff;color:#3b2bb0;border:2px solid #3b2bb0}'+
  '#edubank .eb-seg{display:flex;gap:6px;margin-bottom:6px}#edubank .eb-seg button{flex:1;padding:10px;border-radius:12px;border:2px solid #c3c8ee;background:#fff;font-weight:800;color:#3b2bb0;cursor:pointer}#edubank .eb-seg button.on{background:#3b2bb0;color:#fff;border-color:#3b2bb0}'+
  '#edubank .eb-err{color:#b3261e;background:#fdeceb;border-radius:10px;padding:10px 12px;margin-top:12px;font-weight:600}'+
  '#edubank .eb-ok{color:#14632b;background:#e6f6ea;border-radius:10px;padding:10px 12px;margin-top:12px;font-weight:600}'+
  '#edubank .eb-est{margin-top:10px;background:#f1f2fc;border-radius:10px;padding:9px 12px;font-weight:600}'+
  '#edubank .eb-it{display:flex;gap:9px;align-items:center;padding:9px 0;border-bottom:1px solid #eceefa}#edubank .eb-it:last-child{border:0}'+
  '#edubank .eb-it div{flex:1;min-width:0}#edubank .eb-it small{color:#6a6c92;display:block;overflow-wrap:anywhere}'+
  '#edubank .eb-it .p{color:#14632b;font-weight:800;text-align:right}#edubank .eb-it .n{color:#b3261e;font-weight:800;text-align:right}#edubank .eb-it span.q{max-width:42%;overflow-wrap:anywhere}'+
  '#edubank .eb-comp{text-align:center}#edubank .eb-comp .ic{font-size:3em}#edubank .eb-comp dl{text-align:left;margin:10px 0 0}#edubank .eb-comp dt{color:#6a6c92;font-size:.82em;margin-top:7px}#edubank .eb-comp dd{margin:0;font-weight:700;overflow-wrap:anywhere}'+
  '#edubank .eb-muted{color:#6a6c92;font-size:.9em}#edubank h2{margin:0 0 6px;font-size:1.15em}'+
  '#edubank .eb-toast{position:absolute;left:50%;bottom:70px;transform:translateX(-50%);background:#17163a;color:#fff;padding:10px 16px;border-radius:12px;font-weight:700;max-width:90%;text-align:center}'+
  '@media(min-width:700px){#edubank.full{font-size:17px}}';
  document.head.appendChild(s);
}

/* ---------- estrutura ---------- */
function shell(titulo,voltar,semNav){
  root.innerHTML='<div class="eb-top">'+(voltar?'<button class="eb-back" aria-label="Voltar" data-a="voltar">←</button>':marca(32))+'<b>'+esc(titulo)+'</b><button class="eb-x" aria-label="Fechar" data-a="fechar">✕</button></div><div class="eb-body"><div class="eb-w" id="eb-c"></div></div>'+
   (semNav?'':'<nav class="eb-nav">'+TABS.map(function(t){return '<button data-a="aba" data-k="'+t.k+'" class="'+(t.k===aba?'on':'')+'"><i>'+t.i+'</i>'+esc(t.n)+'</button>'}).join('')+'</nav>');
  return root.querySelector('#eb-c');
}
function $(s){return root.querySelector(s)}
function toast(t){var d=document.createElement('div');d.className='eb-toast';d.textContent=t;root.appendChild(d);setTimeout(function(){d.remove()},2300)}
function setErr(el,t,ok){var e=el.querySelector('.eb-err,.eb-ok');if(e)e.remove();if(!t)return;var d=document.createElement('div');d.className=ok?'eb-ok':'eb-err';d.setAttribute('role','alert');d.textContent=t;el.appendChild(d)}
function getCash(){try{return Math.round(Number(O.getCash())||0)}catch(e){return 0}}
function saldoDe(c){return Math.round(Number(DADOS&&DADOS.saldos&&DADOS.saldos[c])||0)}
function opcoes(sel,soComSaldo){return MOEDAS.filter(function(m){return !soComSaldo||saldoDe(m.c)>0}).map(function(m){return '<option value="'+m.c+'"'+(m.c===sel?' selected':'')+'>'+m.f+' '+m.c+' · '+esc(m.n)+'</option>'}).join('')}

function semSessao(){
  aba='';var c=shell('EduBank',false,true);
  c.innerHTML='<div class="eb-card"><h2>Entre para usar o EduBank</h2><p class="eb-muted">Você precisa entrar com seu login e sua senha antes de abrir o banco.</p><button class="eb-btn" id="eb-ent">Entrar</button></div>';
  $('#eb-ent').onclick=function(){
    var ok=false;try{if(window.EDU_AUTH&&EDU_AUTH.exigir){EDU_AUTH.exigir();ok=true}}catch(e){}
    if(!ok)setErr(c.firstChild,'Volte à tela inicial da atividade e entre com seu login e senha.');
    else fechar();
  };
}
function carregar(){
  return api({acao:'carteira'}).then(function(j){
    if(!j.ok){if(j.sessao)throw new Error('Sua sessão expirou. Entre de novo pelo início da atividade.');throw new Error(msgErro(j))}
    DADOS=j;return j;
  });
}
function comDados(fn,titulo,voltar){
  var c=shell(titulo,voltar);
  if(DADOS){fn(c);return}
  c.innerHTML='<div class="eb-card eb-muted">Conectando ao banco…</div>';
  carregar().then(function(){if(root)fn(shell(titulo,voltar))},function(e){
    if(!root)return;var c2=shell(titulo,voltar);
    c2.innerHTML='<div class="eb-card"><h2>Não deu para abrir</h2><div class="eb-err">'+esc(e.message)+'</div><button class="eb-btn" id="eb-re">Tentar de novo</button></div>';
    $('#eb-re').onclick=function(){irAba(aba)};
  });
}
function irAba(k){
  aba=k;for(var i=0;i<TABS.length;i++)if(TABS[i].k===k){TABS[i].fn();return}telaInicio();
}

/* ---------- início ---------- */
function telaInicio(){
  aba='inicio';
  comDados(function(c){
    c.innerHTML='<div class="eb-card eb-saldo"><small>'+esc(aluno(LOGIN))+'</small><small>Saldo em reais</small><div class="v" id="eb-sal">'+rs(getCash())+'</div>'+
    '<div class="eb-chave">Chave Pix: <code>'+esc(LOGIN)+'</code><button data-a="copiar">Copiar</button></div></div>'+
    '<h2>Moedas estrangeiras</h2><div class="eb-moedas">'+MOEDAS.filter(function(m){return !m.x}).map(cartao).join('')+'</div>'+
    '<h2>Criptomoedas</h2><div class="eb-moedas">'+MOEDAS.filter(function(m){return m.x}).map(cartao).join('')+'</div>'+
    '<button class="eb-btn sec" data-a="trocasenha">🔑 Trocar senha do EduBank</button><div class="eb-card eb-muted" style="margin-top:12px">Transferências só entre alunos da mesma turma ('+esc(turma(LOGIN))+') e só em moedas estrangeiras e criptomoedas. Para ter moeda, compre no Câmbio.</div>';
  },'EduBank');
}
function cartao(m){
  var v=saldoDe(m.c);
  return '<button class="eb-m'+(v?'':' zero')+(m.x?' cr':'')+'" data-a="moeda" data-c="'+m.c+'"><span class="f">'+m.f+'</span><small>'+m.c+' · '+esc(m.n)+'</small><b>'+qtd(m,v)+'</b><em>1 = '+fmtTaxa(m.c)+'</em></button>';
}

/* ---------- câmbio ---------- */
function telaCambio(pre){
  aba='cambio';
  comDados(function(c){
    var op='comprar',moeda=(pre&&MAP[pre])?pre:'USD';
    c.innerHTML='<div class="eb-card"><h2>Câmbio</h2><p class="eb-muted">Seu saldo: <b id="eb-sr">'+rs(getCash())+'</b> · taxa do dia, com spread de 2%.</p>'+
    '<div class="eb-seg"><button data-op="comprar" class="on">Comprar</button><button data-op="vender">Vender</button></div>'+
    '<label for="eb-mo">Moeda</label><select id="eb-mo">'+opcoes(moeda)+'</select><div class="eb-muted" id="eb-tx"></div>'+
    '<label for="eb-q" id="eb-ql">Quantidade que quero comprar</label><input id="eb-q" inputmode="decimal" autocomplete="off" placeholder="0,00">'+
    '<div class="eb-est" id="eb-es">—</div><button class="eb-btn" id="eb-go">Comprar</button></div>';
    var box=c.firstChild;
    function atual(){
      moeda=$('#eb-mo').value;var m=MAP[moeda];
      $('#eb-tx').innerHTML='Taxa: 1 '+m.c+' = <b>'+fmtTaxa(moeda)+'</b> · você tem '+qtd(m,saldoDe(moeda));
      var v=parseQ(m,$('#eb-q').value);
      $('#eb-es').textContent=(v>0)?((op==='comprar'?'Você paga cerca de ':'Você recebe cerca de ')+rs(estim(moeda,v,op))):'Digite a quantidade'+(m.x?' (até 8 casas, ex.: 0,001523)':'');
      $('#eb-ql').textContent='Quantidade que quero '+(op==='comprar'?'comprar':'vender');
      $('#eb-go').textContent=op==='comprar'?'Comprar '+m.c:'Vender '+m.c;
    }
    box.querySelectorAll('[data-op]').forEach(function(b){b.onclick=function(){op=b.getAttribute('data-op');box.querySelectorAll('[data-op]').forEach(function(x){x.classList.toggle('on',x===b)});setErr(box,'');atual()}});
    $('#eb-mo').onchange=atual;$('#eb-q').oninput=atual;atual();
    $('#eb-go').onclick=function(){
      var m=MAP[moeda],v=parseQ(m,$('#eb-q').value);
      if(!(v>=1))return setErr(box,'Digite uma quantidade válida'+(m.x?' (até 8 casas decimais).':', ex.: 10,50.'));
      if(!taxaDe(moeda))return setErr(box,'Taxa indisponível agora. Tente de novo em instantes.');
      if(op==='comprar'&&estim(moeda,v,op)>getCash())return setErr(box,'Saldo em reais insuficiente. Você tem '+rs(getCash())+'.');
      if(op==='vender'&&v>saldoDe(moeda))return setErr(box,'Você só tem '+qtd(m,saldoDe(moeda))+'.');
      var chave=op+moeda+v;if(!pend[chave])pend[chave]=novoId();
      var btn=this;btn.disabled=true;setErr(box,'');
      api({acao:'cambio',op:op,moeda:moeda,v:v,cash:getCash(),id:pend[chave]}).then(function(j){
        btn.disabled=false;
        if(!j.ok)return setErr(box,msgErro(j));
        delete pend[chave];
        if(!j.dup){try{if(op==='comprar')O.addCash(-Math.round(j.custo),'EduBank: compra de '+qtd(m,v));else O.addCash(Math.round(j.recebe),'EduBank: venda de '+qtd(m,v))}catch(e){}}
        if(j.saldos){DADOS.saldos=j.saldos}else{DADOS.saldos[moeda]=saldoDe(moeda)+(op==='comprar'?v:-v)}
        var rr=$('#eb-sr');if(rr)rr.textContent=rs(getCash());
        $('#eb-q').value='';atual();
        setErr(box,(op==='comprar'?'Comprou ':'Vendeu ')+qtd(m,v)+' por '+rs(op==='comprar'?j.custo:j.recebe)+'.',true);
      }).catch(function(e){btn.disabled=false;setErr(box,e.message+' Se tentar de novo, a operação não será duplicada.')});
    };
  },'Câmbio');
}

/* ---------- transferir ---------- */
function telaTransferir(pre){
  aba='transferir';
  comDados(function(c){
    c.innerHTML='<div class="eb-card eb-muted">Verificando sua senha do EduBank…</div>';
    statSenha().then(function(tem){
      if(!root)return;
      if(!tem)return telaSenha(false,function(){telaTransferir(pre)});
      formTransferir(shell('Transferir'),pre);
    },function(e){if(!root)return;setErr(c,e.message)});
  },'Transferir');
}
function formTransferir(c,pre){
  {
    var tem=MOEDAS.filter(function(m){return saldoDe(m.c)>0});
    if(!tem.length){c.innerHTML='<div class="eb-card"><h2>Transferir</h2><p>Você ainda não tem moeda estrangeira nem criptomoeda para transferir.</p><p class="eb-muted">Compre no Câmbio com seus reais.</p><button class="eb-btn" data-a="aba" data-k="cambio">Ir para o Câmbio</button></div>';return}
    var sel=(pre&&saldoDe(pre)>0)?pre:tem[0].c;
    c.innerHTML='<div class="eb-card"><h2>Transferir</h2><p class="eb-muted">Só para alunos da turma '+esc(turma(LOGIN))+', em moedas estrangeiras e criptomoedas.</p>'+
    '<label for="eb-pa">Chave Pix do colega</label><input id="eb-pa" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="ex.: 7'+esc(turma(LOGIN))+'">'+
    '<label for="eb-mo">Moeda</label><select id="eb-mo">'+opcoes(sel,true)+'</select><div class="eb-muted" id="eb-sd"></div>'+
    '<label for="eb-v">Valor</label><input id="eb-v" inputmode="decimal" autocomplete="off" placeholder="0,00">'+
    '<label for="eb-n">Mensagem (opcional)</label><input id="eb-n" maxlength="40" autocomplete="off">'+
    '<button class="eb-btn" id="eb-rev">Revisar transferência</button></div>';
    var box=c.firstChild;
    function sd(){var m=MAP[$('#eb-mo').value];$('#eb-sd').textContent='Disponível: '+qtd(m,saldoDe(m.c))}
    $('#eb-mo').onchange=sd;sd();
    $('#eb-rev').onclick=function(){
      var para=$('#eb-pa').value.trim().toLowerCase().replace(/\s+/g,''),m=MAP[$('#eb-mo').value],v=parseQ(m,$('#eb-v').value),nota=$('#eb-n').value.replace(/[<>]/g,'').slice(0,40);
      if(!RE.test(para))return setErr(box,'Chave inválida. Use o login do colega, ex.: 7'+turma(LOGIN)+'.');
      if(para===LOGIN)return setErr(box,'Você não pode transferir para você mesmo.');
      if(turma(para)!==turma(LOGIN))return setErr(box,'Só é possível transferir para alunos da sua turma ('+turma(LOGIN)+').');
      if(!(v>=1))return setErr(box,'Digite um valor válido'+(m.x?' (até 8 casas decimais).':', ex.: 5,50.'));
      if(v>saldoDe(m.c))return setErr(box,'Saldo insuficiente. Você tem '+qtd(m,saldoDe(m.c))+'.');
      telaConfirmar({id:novoId(),para:para,moeda:m.c,v:v,nota:nota});
    };
    var tr=document.createElement('button');tr.className='eb-btn sec';tr.textContent='🔑 Trocar senha do EduBank';tr.onclick=function(){telaSenha(true,function(){telaTransferir(pre)})};c.appendChild(tr);
  }
}
function pwIn(id,lab,ac){return '<label for="'+id+'">'+lab+'</label><input id="'+id+'" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]*" placeholder="4 números" autocomplete="'+ac+'">'}
function telaSenha(troca,ok){
  var c=shell(troca?'Trocar senha do EduBank':'Crie sua senha do EduBank',true);
  c.innerHTML='<div class="eb-card"><h2>'+(troca?'Trocar senha do EduBank':'Crie sua senha do EduBank')+'</h2>'+
  '<p class="eb-muted">'+(troca?'Esta senha só serve para transferir dinheiro. Ela é diferente da senha de login.':'Para sua segurança, crie uma senha só sua para transferir: 4 números, o dia e o mês do seu aniversário (ex.: 0401 para 4 de janeiro). Ela não é a senha de login. Guarde bem: sem ela ninguém transfere do seu EduBank.')+'</p>'+
  (troca?pwIn('eb-sa','Senha atual do EduBank','current-password'):'')+pwIn('eb-sn','Senha nova','new-password')+pwIn('eb-sc','Repita a senha nova','new-password')+
  '<button class="eb-btn" id="eb-ss">Salvar senha</button><button class="eb-btn sec" id="eb-sv">Cancelar</button></div>';
  var box=c.firstChild;
  $('#eb-sv').onclick=function(){irAba(aba&&aba!=='transferir'?aba:'inicio')};
  $('#eb-ss').onclick=function(){
    var a=troca?$('#eb-sa').value:'',n=$('#eb-sn').value,r=$('#eb-sc').value,btn=this;
    if(troca&&!a)return setErr(box,'Digite a senha atual do EduBank.');
    if(!/^\d{4}$/.test(n))return setErr(box,'A senha tem 4 números: dia e mês do seu aniversário (ex.: 0401).');
    if(n!==r)return setErr(box,'As duas senhas novas não são iguais.');
    if(troca&&n===a)return setErr(box,'A senha nova precisa ser diferente da atual.');
    if(n==='2026.2026')return setErr(box,'Escolha uma senha diferente da senha de login.');
    btn.disabled=true;setErr(box,'');
    Promise.all([hb(n),troca?hb(a):Promise.resolve(undefined)]).then(function(h){
      var p={acao:'bancosenha',h_novo:h[0]};if(troca)p.h_atual=h[1];
      return api(p)}).then(function(j){
      btn.disabled=false;
      if(!j.ok)return setErr(box,msgErro(j)||'Não foi possível salvar a senha.');
      TEMSENHA=true;toast('Senha do EduBank salva!');setTimeout(function(){if(root&&ok)ok()},600);
    }).catch(function(e){btn.disabled=false;setErr(box,e.message)});
  };
}
function telaConfirmar(p){
  var m=MAP[p.moeda],c=shell('Confirmar',true);
  c.innerHTML='<div class="eb-card eb-comp"><h2>Confirme a transferência</h2><div style="font-size:1.7em;font-weight:800;color:#3b2bb0;overflow-wrap:anywhere">'+esc(qtd(m,p.v))+'</div>'+
  '<dl><dt>Para</dt><dd>'+esc(aluno(p.para))+'</dd><dt>Chave</dt><dd>'+esc(p.para)+'</dd>'+(p.nota?'<dt>Mensagem</dt><dd>'+esc(p.nota)+'</dd>':'')+'</dl>'+
  '<label for="eb-pw">Senha do EduBank</label><input id="eb-pw" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="4 números (dia e mês)">'+
  '<button class="eb-btn" id="eb-ok">Confirmar e transferir</button><button class="eb-btn sec" id="eb-no">Voltar</button></div>';
  var box=c.firstChild;
  $('#eb-no').onclick=function(){telaTransferir(p.moeda)};
  $('#eb-ok').onclick=function(){
    var btn=this,pw=$('#eb-pw').value;setErr(box,'');
    if(!pw)return setErr(box,'Digite a senha do EduBank para confirmar.');
    btn.disabled=true;
    hb(pw).then(function(h){return api({acao:'transferir',para:p.para,moeda:p.moeda,v:p.v,id:p.id,nota:p.nota,hb:h})}).then(function(j){
      btn.disabled=false;
      if(!j.ok){var m0=msgErro(j);if(/senha/i.test(m0)&&!/EduBank|bloq|tentativas/i.test(m0))m0='Senha do EduBank incorreta. '+m0;return setErr(box,m0)}
      if(j.saldos)DADOS.saldos=j.saldos;else DADOS.saldos[p.moeda]=saldoDe(p.moeda)-p.v;
      telaComprovante({id:p.id,para:p.para,moeda:p.moeda,v:p.v,nota:p.nota,ts:Date.now()});
    }).catch(function(e){btn.disabled=false;setErr(box,e.message+' Pode tentar de novo: a transferência não será duplicada.')});
  };
}
function telaComprovante(r){
  var m=MAP[r.moeda],c=shell('Comprovante',false);
  c.innerHTML='<div class="eb-card eb-comp"><div class="ic">✅</div><h2>Transferência feita!</h2><div style="font-size:1.6em;font-weight:800;color:#3b2bb0;overflow-wrap:anywhere">'+esc(qtd(m,r.v))+'</div>'+
  '<dl><dt>Para</dt><dd>'+esc(aluno(r.para))+'</dd><dt>Chave</dt><dd>'+esc(r.para)+'</dd><dt>De</dt><dd>'+esc(aluno(LOGIN))+'</dd>'+(r.nota?'<dt>Mensagem</dt><dd>'+esc(r.nota)+'</dd>':'')+
  '<dt>Data</dt><dd>'+esc(dt(r.ts))+'</dd><dt>Protocolo</dt><dd>'+esc(r.id)+'</dd></dl></div><button class="eb-btn" data-a="aba" data-k="inicio">Voltar ao início</button>';
}

/* ---------- extrato ---------- */
var TIPO={env:['📤','Enviado para '],rec:['📥','Recebido de '],compra:['🛒','Compra de '],venda:['💰','Venda de ']};
function telaExtrato(){
  aba='extrato';
  var c=shell('Extrato',false);
  c.innerHTML='<div class="eb-card"><h2>Extrato</h2><div id="eb-lista" class="eb-muted">Carregando…</div></div>';
  api({acao:'extrato'}).then(function(j){
    var l=$('#eb-lista');if(!l)return;
    if(!j.ok)return l.innerHTML='<div class="eb-err">'+esc(msgErro(j))+'</div>';
    var it=(j.itens||j.extrato||[]).slice().sort(function(a,b){return (Number(b.ts)||0)-(Number(a.ts)||0)});
    if(!it.length)return l.textContent='Nenhuma movimentação ainda.';
    l.innerHTML=it.map(function(x){
      var m=MAP[x.moeda]||{c:x.moeda,s:'',e:100,f:'💱'},t=TIPO[x.tipo]||['💱',''],pos=(x.tipo==='rec'||x.tipo==='compra');
      var tit=(x.tipo==='env'||x.tipo==='rec')?t[1]+aluno(x.outro):t[1]+m.c;
      return '<div class="eb-it"><span style="font-size:1.4em">'+t[0]+'</span><div><b>'+esc(tit)+'</b><small>'+esc(dt(x.ts))+(x.nota?' · '+esc(x.nota):'')+(x.saldo_apos!=null?' · saldo '+esc(qtd(m,x.saldo_apos)):'')+'</small></div><span class="q '+(pos?'p':'n')+'">'+(pos?'+':'-')+esc(qtd(m,x.v))+'</span></div>';
    }).join('');
  }).catch(function(e){var l=$('#eb-lista');if(l)l.innerHTML='<div class="eb-err">'+esc(e.message)+'</div>'});
}

/* ---------- controle ---------- */
function copiar(){
  var t=LOGIN;
  function ok(){toast('Chave copiada: '+t)}
  function fb(){var i=document.createElement('input');i.value=t;i.style.cssText='position:fixed;opacity:0';root.appendChild(i);i.select();try{document.execCommand('copy')}catch(e){}i.remove();ok()}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb();
}
function fechar(){
  window.removeEventListener('resize',encaixa);
  if(root){root.remove();root=null}
  var cb=O&&O.onClose;O=null;DADOS=null;TEMSENHA=null;
  if(typeof cb==='function'){try{cb()}catch(e){}}
}
function aoClicar(e){
  var b=e.target.closest&&e.target.closest('[data-a]');if(!b)return;
  var a=b.getAttribute('data-a');
  if(a==='fechar')fechar();
  else if(a==='voltar')irAba(aba||'inicio');
  else if(a==='copiar')copiar();
  else if(a==='trocasenha')statSenha().then(function(t){telaSenha(t,function(){irAba('inicio')})},function(e){toast(e.message)});
  else if(a==='aba')irAba(b.getAttribute('data-k'));
  else if(a==='moeda'){var c=b.getAttribute('data-c');if(saldoDe(c)>0)telaTransferir(c);else telaCambio(c)}
}
/* dentro do celular simulado: cobre exatamente a tela do aparelho */
function encaixa(){
  if(!root)return;
  var h=O&&O.host;
  if(h&&h.getBoundingClientRect){
    var r=h.getBoundingClientRect(),bw=parseFloat(getComputedStyle(h).borderLeftWidth)||0;
    root.classList.remove('full');
    var S=root.style;S.setProperty('left',(r.left+bw)+'px','important');S.setProperty('top',(r.top+bw)+'px','important');S.setProperty('width',(r.width-2*bw)+'px','important');S.setProperty('height',(r.height-2*bw)+'px','important');S.setProperty('right','auto','important');S.setProperty('bottom','auto','important');
    root.style.fontSize=Math.max(11,Math.min(17,r.width/24))+'px';root.style.borderRadius=(getComputedStyle(h).borderRadius||'0');
  }else{root.classList.add('full');root.style.cssText=''}
}
function open(opts){
  O=opts||{};
  if(typeof O.getCash!=='function')O.getCash=function(){return adaptadorLocal(LOGIN).getCash()};
  if(typeof O.addCash!=='function')O.addCash=function(d,x){return adaptadorLocal(LOGIN).addCash(d,x)};
  if(root)root.remove();
  css();DADOS=null;aba='inicio';
  root=document.createElement('div');root.id='edubank';root.setAttribute('role','dialog');root.setAttribute('aria-label','EduBank');
  root.addEventListener('click',aoClicar);
  ((O.host&&O.host.parentNode)||document.body).appendChild(root);encaixa();window.addEventListener('resize',encaixa);
  if(!sessao())semSessao();
  else if(!ep()){var c=shell('EduBank',false,true);c.innerHTML='<div class="eb-card"><h2>Banco indisponível</h2><div class="eb-err">O EduBank ainda não está configurado nesta página (servidor não encontrado). Avise o professor.</div></div>'}
  else telaInicio();
  return {close:fechar};
}

function adaptadorLocal(login){
  var k='robiox_v2_'+login;
  function ler(){return lget(k,null)||{}}
  return {
    getCash:function(){return Math.round(Number(ler().cash)||0)},
    addCash:function(d){
      var st=ler();st.cash=Math.round((Number(st.cash)||0)+Number(d||0));
      if(st.cash<0)st.cash=0;
      st._ts=Date.now();
      lset(k,st);return st.cash;
    }
  };
}

window.EDUBANK={open:open,close:fechar,icone:icone,adaptadorLocal:adaptadorLocal,fmt:rs,qtd:qtd,moedas:MOEDAS,version:2,versao:'2'};
})();
