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
var TABS=[{k:'inicio',n:'Início',i:'home',fn:function(){telaInicio()}},
 {k:'mercados',n:'Mercados',i:'store',fn:function(){telaMod('mercados')}},{k:'investir',n:'Investir',i:'trend',fn:function(){telaMod('investir')}},
 {k:'carteira',n:'Carteira',i:'wallet',fn:function(){telaMod('carteira')}},{k:'simulacoes',n:'Simulações',i:'flask',fn:function(){telaMod('simulacoes')}},
 {k:'cambio',n:'Câmbio',i:'swap',fn:function(){telaCambio()}},{k:'transferir',n:'Transferir',i:'send',fn:function(){telaTransferir()}},{k:'extrato',n:'Extrato',i:'receipt',fn:function(){telaExtrato()}}];
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

/* ---------- ícones SVG, bandeiras e moedas ---------- */
var IC={home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',swap:'<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
 receipt:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM8 8h8M8 12h8"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
 down:'<path d="M12 5v14M5 12l7 7 7-7"/>',up:'<path d="M12 19V5M5 12l7-7 7 7"/>',coin:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.7-1 1.4-2.5 1.8-2.5.8-2.5 1.8 1 1.7 2.5 1.7 2.5-.5 2.5-1.5"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',check:'<path d="M5 13l4 4L19 7"/>',alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
 inbox:'<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5"/>',back:'<path d="M15 5l-7 7 7 7"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',chart:'<path d="M4 20V4M4 20h16M8 15l4-5 3 3 5-7"/>',
 plane:'<path d="M3 11l18-8-8 18-2-8z"/>',
 store:'<path d="M3 9l2-5h14l2 5M3 9h18M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5"/>',trend:'<path d="M3 17l6-6 4 4 8-9M15 6h6v6"/>',
 wallet:'<path d="M4 7a2 2 0 0 1 2-2h12v4M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2zM16 14.5h.01"/>',flask:'<path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3M7.5 15h9"/>'};
function I(n,s){s=s||22;return '<svg class="eb-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||'')+'</svg>'}
var CRI={BTC:['#f7931a','₿'],ETH:['#627eea','Ξ'],SOL:['#7b3fe4','◎'],XRP:['#23292f','✕'],DOGE:['#c2a633','Ð'],USDT:['#26a17b','₮']};
var FLG={
 USD:'<rect width="24" height="24" fill="#fff"/><g fill="#c8102e"><rect y="0" width="24" height="3.4"/><rect y="6.9" width="24" height="3.4"/><rect y="13.7" width="24" height="3.4"/><rect y="20.6" width="24" height="3.4"/></g><rect width="12" height="13.7" fill="#1f3a8a"/><g fill="#fff"><circle cx="3" cy="3" r="1"/><circle cx="7" cy="3" r="1"/><circle cx="3" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="5" cy="5" r="1"/><circle cx="5" cy="9.5" r="1"/><circle cx="9.5" cy="5" r="1"/><circle cx="9.5" cy="9.5" r="1"/></g>',
 EUR:'<rect width="24" height="24" fill="#1d4ea1"/><g fill="#ffcc00">'+(function(){var s='';for(var i=0;i<12;i++){var a=i*Math.PI/6;s+='<circle cx="'+(12+7*Math.cos(a)).toFixed(2)+'" cy="'+(12+7*Math.sin(a)).toFixed(2)+'" r="1.25"/>'}return s})()+'</g>',
 GBP:'<rect width="24" height="24" fill="#1f3a8a"/><path d="M0 0L24 24M24 0L0 24" stroke="#fff" stroke-width="5"/><path d="M0 0L24 24M24 0L0 24" stroke="#c8102e" stroke-width="2"/><path d="M12 0V24M0 12H24" stroke="#fff" stroke-width="8"/><path d="M12 0V24M0 12H24" stroke="#c8102e" stroke-width="4.5"/>',
 JPY:'<rect width="24" height="24" fill="#fff"/><circle cx="12" cy="12" r="6" fill="#bc002d"/>',
 ARS:'<rect width="24" height="24" fill="#74acdf"/><rect y="8" width="24" height="8" fill="#fff"/><circle cx="12" cy="12" r="2.2" fill="#f6b40e"/>',
 CNY:'<rect width="24" height="24" fill="#de2910"/><text x="6" y="11.5" font-size="10" text-anchor="middle" fill="#ffde00" font-family="Arial,sans-serif">★</text><g fill="#ffde00"><circle cx="12" cy="3.5" r=".9"/><circle cx="14.5" cy="6" r=".9"/><circle cx="14.5" cy="9.5" r=".9"/><circle cx="12" cy="12" r=".9"/></g>'};
var __fid=0;
function flag(c,s){
  s=s||36;var u='ef'+(++__fid),cr=CRI[c],b;
  if(cr)b='<rect width="24" height="24" fill="'+cr[0]+'"/><text x="12" y="17.2" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Arial,Segoe UI Symbol,sans-serif">'+cr[1]+'</text>';
  else b=FLG[c]||'<rect width="24" height="24" fill="#8a8dac"/>';
  return '<svg class="eb-fl" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true"><defs><clipPath id="'+u+'"><circle cx="12" cy="12" r="12"/></clipPath></defs><g clip-path="url(#'+u+')">'+b+'</g><circle cx="12" cy="12" r="11.6" fill="none" stroke="rgba(0,0,0,.18)" stroke-width=".8"/></svg>';
}
function hhmm(ts){try{return new Date(Number(ts)).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function horaTaxa(c){var t=DADOS&&DADOS.taxas&&DADOS.taxas[c];var ts=(t&&typeof t==='object'&&(t.ts||t.hora||t.at))||(DADOS&&(DADOS.ts||DADOS.hora))||(DADOS&&DADOS._em)||Date.now();if(Number(ts)>0&&Number(ts)<1e12)ts=Number(ts)*1000;return hhmm(ts)}
function varTaxa(c){var t=DADOS&&DADOS.taxas&&DADOS.taxas[c];if(!t||typeof t!=='object')return null;var v=t.v!=null?t.v:(t.var!=null?t.var:(t.pct!=null?t.pct:null));v=Number(v);return isFinite(v)&&v!==0?v:null}
function skel(n){var s='';for(var i=0;i<(n||3);i++)s+='<div class="eb-sk"><div class="eb-skc"></div><div style="flex:1"><div class="eb-skl" style="width:55%"></div><div class="eb-skl" style="width:35%;margin-top:7px"></div></div></div>';return '<div class="eb-card" aria-busy="true" aria-label="Carregando">'+s+'</div>'}
function vazio(ic,t,sub){return '<div class="eb-vz"><div class="eb-vzi">'+I(ic,34)+'</div><b>'+esc(t)+'</b>'+(sub?'<span>'+esc(sub)+'</span>':'')+'</div>'}
function dia(ts){var d=new Date(Number(ts)||ts),h=new Date(),y=new Date(Date.now()-864e5);function k(x){return x.getFullYear()+'-'+x.getMonth()+'-'+x.getDate()}
  if(k(d)===k(h))return 'Hoje';if(k(d)===k(y))return 'Ontem';return d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}

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
/* timeout 20 s + até 4 novas tentativas (1,5/3/5/8 s) se não vier JSON, der timeout/rede ou o servidor pedir {tentar:1}.
   As ações que mexem em saldo levam id (o servidor ignora repetição), então repetir é seguro. */
function api(p){
  var base=ep();
  if(!base)return Promise.reject(new Error('EduBank indisponível: servidor não configurado.'));
  p.login=LOGIN;p.t=TOKEN;
  var q=Object.keys(p).filter(function(k){return p[k]!==undefined&&p[k]!==null}).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(p[k])}).join('&');
  var url=base+(base.indexOf('?')>-1?'&':'?')+q,esp=[1500,3000,5000,8000],n=0;
  function um(){var ac=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ac)ac.abort()},20000);
    return fetch(url,ac?{signal:ac.signal}:{}).then(function(r){return r.text()}).then(function(t){clearTimeout(tm);var j=null;try{j=JSON.parse(t)}catch(e){}return j&&typeof j==='object'?j:{ok:0,net:1}},function(){clearTimeout(tm);return {ok:0,net:1}})}
  function vai(){return um().then(function(j){if(!j.ok&&(j.net||j.tentar)&&n<esp.length){var w=esp[n++];return new Promise(function(r){setTimeout(r,w)}).then(vai)}return j})}
  return vai().then(function(j){
    if(j.net)throw new Error('Sem conexão com o banco. Tente de novo.');
    if(j.relogin&&root){recPara();
      var A=window.EDU_AUTH,as=A&&A.sessao?A.sessao():null;
      if(A&&A.pedirLogin&&!(as&&(as.mestre||as.local))){A.pedirLogin('Sua sessão terminou. Entre de novo.',function(){if(root&&sessao()){telaInicio();recIniciar()}})}   /* um único lugar pede login: o porteiro */
      else setTimeout(function(){if(root)semSessao('Sua sessão expirou. Entre de novo.')},0);
      throw new Error('Sessão expirada.')}
    if(!j.ok&&/sess|token|login/i.test(j.erro||'')&&/inv|expir|entre/i.test(j.erro||''))j.sessao=1;
    return j;
  });
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
function EBCSS(){return [
'#edubank{--bg:#f2f3fa;--card:#fff;--tx:#14142b;--tx2:#4b4d6e;--bd:#e2e4f1;--pri:#3b2bb0;--pri2:#2b4aa8;--up:#0b7a3b;--dn:#c0261b;--upbg:#e2f5e9;--dnbg:#fde8e6;--chip:#eef0fb;--sh:0 2px 10px rgba(30,25,90,.09),0 1px 2px rgba(30,25,90,.06)}',
'@media(prefers-color-scheme:dark){#edubank{--bg:#0d0f1f;--card:#171a31;--tx:#f2f3fc;--tx2:#b9bcdb;--bd:#2a2d4c;--pri:#a99cff;--pri2:#8fa6ff;--up:#4ade80;--dn:#ff8f86;--upbg:#12301f;--dnbg:#3a1a1a;--chip:#222544;--sh:0 2px 10px rgba(0,0,0,.4)}}',
'#edubank{position:fixed;z-index:2147483000;background:var(--bg);font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--tx);display:flex;flex-direction:column;overflow:hidden}',
'#edubank.full{inset:0}#edubank *{box-sizing:border-box}#edubank button,#edubank input,#edubank select{font-family:inherit}',
'#edubank .eb-i{display:block;flex:none}#edubank .eb-fl{flex:none;display:block}',
'#edubank .eb-top{background:linear-gradient(135deg,#0f7a8a,#2b4aa8 55%,#5a1fa8);color:#fff;padding:10px 12px;display:flex;align-items:center;gap:10px;flex:none;min-height:56px}',
'#edubank .eb-top>svg{flex:none;border-radius:22%}#edubank .eb-top b{font-size:1.1em;flex:1;letter-spacing:.2px}',
'#edubank .eb-x,#edubank .eb-back{background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:12px;min-width:44px;height:44px;cursor:pointer;display:flex;align-items:center;justify-content:center}',
'#edubank .eb-body{flex:1;overflow:auto;padding:14px 14px 22px;-webkit-overflow-scrolling:touch}#edubank .eb-w{max-width:560px;margin:0 auto}',
'#edubank .eb-nav{flex:none;display:flex;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;background:var(--card);border-top:1px solid var(--bd)}',
'#edubank .eb-nav button{flex:1 0 auto;min-width:68px;border:0;background:none;padding:8px 2px 7px;min-height:56px;font-size:.78em;font-weight:700;color:var(--tx2);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative}',
'#edubank .eb-nav::-webkit-scrollbar{display:none}#edubank .eb-nav button.on{color:var(--pri)}#edubank .eb-nav button.on:before{content:"";position:absolute;top:0;left:30%;right:30%;height:3px;border-radius:0 0 3px 3px;background:var(--pri)}',
'#edubank .eb-card{background:var(--card);border-radius:20px;padding:16px;margin-bottom:14px;box-shadow:var(--sh)}',
'#edubank h2{margin:0 0 6px;font-size:1.12em;color:var(--tx)}#edubank h3{margin:18px 2px 10px;font-size:.82em;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2)}',
'#edubank .eb-muted{color:var(--tx2);font-size:.9em}',
'#edubank .eb-hero{background:linear-gradient(135deg,#0f7a8a,#2b4aa8 55%,#5a1fa8);color:#fff;border-radius:22px;padding:18px 18px 16px;margin-bottom:14px;box-shadow:0 8px 22px rgba(43,40,150,.35)}',
'#edubank .eb-hero small{display:block;opacity:.92;font-size:.85em}#edubank .eb-hero .eb-lb{margin-top:10px}#edubank .eb-hero .eb-v{font-size:2.15em;font-weight:800;line-height:1.1;letter-spacing:-.5px;overflow-wrap:anywhere}',
'#edubank .eb-chave{display:flex;align-items:center;gap:8px;margin-top:14px;background:rgba(255,255,255,.16);border-radius:14px;padding:6px 6px 6px 12px;font-size:.9em}',
'#edubank .eb-chave span{opacity:.92}#edubank .eb-chave code{flex:1;font-weight:800;word-break:break-all;font-size:1.05em}',
'#edubank .eb-chave button{background:#fff;color:#2b3a99;border:0;border-radius:10px;min-height:44px;padding:0 14px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:6px}',
'#edubank .eb-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}',
'#edubank .eb-act{background:var(--card);border:0;border-radius:18px;padding:12px 4px;box-shadow:var(--sh);display:flex;flex-direction:column;align-items:center;gap:7px;font-weight:700;font-size:.85em;color:var(--tx);cursor:pointer;min-height:76px}',
'#edubank .eb-act i{width:40px;height:40px;border-radius:50%;background:var(--chip);color:var(--pri);display:flex;align-items:center;justify-content:center}',
'#edubank .eb-moedas{display:flex;flex-direction:column;gap:10px;margin-bottom:6px}',
'#edubank{container-type:inline-size}@container (min-width:520px){#edubank .eb-moedas{display:grid;grid-template-columns:1fr 1fr}}',
'#edubank .eb-m{background:var(--card);border-radius:18px;padding:12px 14px;box-shadow:var(--sh);border:0;text-align:left;cursor:pointer;min-width:0;display:flex;align-items:center;gap:12px;color:var(--tx);min-height:64px}',
'#edubank .eb-m .eb-mi{flex:1;min-width:0}#edubank .eb-m .eb-mc{display:block;font-weight:800}#edubank .eb-m .eb-mn{display:block;color:var(--tx2);font-size:.82em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'#edubank .eb-m .eb-mr{text-align:right;min-width:0;max-width:52%}#edubank .eb-m .eb-mr b{display:block;overflow-wrap:anywhere;font-size:.98em}#edubank .eb-m .eb-mr em{display:block;font-style:normal;color:var(--tx2);font-size:.78em}',
'#edubank .eb-m.zero .mr b{color:var(--tx2);font-weight:600}#edubank .eb-var{font-weight:800;font-size:.8em}#edubank .eb-var.eb-pos{color:var(--up)}#edubank .eb-var.eb-neg{color:var(--dn)}',
'#edubank .eb-nota{font-size:.8em;color:var(--tx2);margin:6px 4px 14px;display:flex;gap:6px;align-items:flex-start}',
'#edubank label{display:block;font-weight:700;margin:14px 0 6px;color:var(--tx)}',
'#edubank input,#edubank select{width:100%;min-height:50px;font-size:1.05em;padding:11px 13px;border:2px solid var(--bd);border-radius:14px;background:var(--card);color:var(--tx)}',
'#edubank input::placeholder{color:var(--tx2);opacity:.75}#edubank input:focus,#edubank select:focus{outline:none;border-color:var(--pri)}',
'#edubank .eb-btn{width:100%;margin-top:16px;min-height:52px;background:linear-gradient(135deg,#2b4aa8,#5a1fa8);color:#fff;border:0;border-radius:16px;padding:13px;font-size:1.05em;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(59,43,176,.3)}',
'#edubank .eb-btn[disabled]{opacity:.55;box-shadow:none}#edubank .eb-btn.sec{background:transparent;color:var(--pri);border:2px solid var(--pri);box-shadow:none}',
'#edubank .eb-seg{display:flex;gap:4px;margin:10px 0 6px;background:var(--chip);padding:4px;border-radius:16px}',
'#edubank .eb-seg button{flex:1;min-height:46px;border-radius:12px;border:0;background:transparent;font-weight:800;color:var(--tx2);cursor:pointer;font-size:1em}#edubank .eb-seg button.on{background:var(--card);color:var(--pri);box-shadow:var(--sh)}',
'#edubank .eb-err,#edubank .eb-ok{display:flex;gap:10px;align-items:flex-start;border-radius:14px;padding:12px 14px;margin-top:14px;font-weight:600}#edubank .eb-err{color:var(--dn);background:var(--dnbg)}#edubank .eb-ok{color:var(--up);background:var(--upbg)}',
'#edubank .eb-est{margin-top:14px;background:var(--chip);border-radius:16px;padding:12px 14px}#edubank .eb-est .eb-t{font-weight:700;color:var(--tx2)}',
'#edubank .eb-est .eb-r{display:flex;justify-content:space-between;gap:10px;padding:4px 0;font-size:.92em;color:var(--tx2)}#edubank .eb-est .eb-r b{color:var(--tx);text-align:right;overflow-wrap:anywhere}',
'#edubank .eb-est .eb-big{display:flex;justify-content:space-between;gap:10px;align-items:baseline;border-top:1px dashed var(--bd);margin-top:6px;padding-top:9px;font-weight:700;color:var(--tx)}#edubank .eb-est .eb-big b{font-size:1.25em;color:var(--pri);text-align:right}',
'#edubank .eb-disp{display:inline-flex;gap:6px;margin-top:8px;padding:5px 11px;border-radius:99px;background:var(--chip);color:var(--tx);font-weight:700;font-size:.9em}',
'#edubank .eb-dg{font-weight:800;font-size:.8em;letter-spacing:.06em;text-transform:uppercase;color:var(--tx2);margin:16px 2px 4px}',
'#edubank .eb-it{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--bd)}#edubank .eb-it:last-child{border:0}',
'#edubank .eb-it .eb-ib{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}#edubank .eb-it .eb-ib.eb-pos{background:var(--upbg);color:var(--up)}#edubank .eb-it .eb-ib.eb-neg{background:var(--dnbg);color:var(--dn)}',
'#edubank .eb-it div{flex:1;min-width:0}#edubank .eb-it small{color:var(--tx2);display:block;overflow-wrap:anywhere}',
'#edubank .eb-it .eb-pos{color:var(--up);font-weight:800;text-align:right}#edubank .eb-it .eb-neg{color:var(--dn);font-weight:800;text-align:right}#edubank .eb-it span.eb-q{max-width:42%;overflow-wrap:anywhere}',
'#edubank .eb-rc{padding:0;overflow:hidden}#edubank .eb-rc .eb-rh{padding:20px 16px 14px;text-align:center;border-bottom:2px dashed var(--bd)}',
'#edubank .eb-rc .eb-okc{width:56px;height:56px;border-radius:50%;background:var(--upbg);color:var(--up);display:flex;align-items:center;justify-content:center;margin:0 auto 10px}',
'#edubank .eb-rc .eb-am{font-size:1.7em;font-weight:800;color:var(--pri);overflow-wrap:anywhere}#edubank .eb-rc dl{margin:0;padding:6px 16px 14px}',
'#edubank .eb-rc .eb-rw{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid var(--bd)}#edubank .eb-rc .eb-rw:last-child{border:0}',
'#edubank .eb-rc dt{color:var(--tx2);font-size:.88em}#edubank .eb-rc dd{margin:0;font-weight:700;text-align:right;overflow-wrap:anywhere;min-width:0}',
'#edubank .eb-sk{display:flex;gap:12px;align-items:center;padding:10px 0}#edubank .eb-skc{width:42px;height:42px;border-radius:50%}#edubank .eb-skl{height:12px;border-radius:6px}',
'#edubank .eb-skc,#edubank .eb-skl{background:linear-gradient(90deg,var(--chip) 25%,var(--bd) 50%,var(--chip) 75%);background-size:200% 100%;animation:ebsh 1.3s infinite linear}@keyframes ebsh{to{background-position:-200% 0}}',
'#edubank .eb-vz{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:26px 10px;color:var(--tx2)}#edubank .eb-vz b{color:var(--tx)}',
'#edubank .eb-vzi{width:64px;height:64px;border-radius:50%;background:var(--chip);color:var(--pri);display:flex;align-items:center;justify-content:center;margin-bottom:4px}',
'#edubank .eb-gh{display:flex;align-items:center;gap:12px}#edubank .eb-gh .eb-gp{font-size:1.7em;font-weight:800;line-height:1.1}',
'#edubank .eb-pills{display:flex;gap:8px;margin:14px 0 10px}#edubank .eb-pills button{flex:1;min-height:42px;padding:6px 4px;border-radius:99px;border:2px solid var(--bd);background:var(--card);color:var(--tx2);font-weight:800;font-size:.85em;cursor:pointer}',
'#edubank .eb-pills button.on{background:var(--pri);border-color:var(--pri);color:#fff}@media(prefers-color-scheme:dark){#edubank .eb-pills button.on{color:#14142b}}',
'#edubank .eb-tip{background:var(--chip);border-radius:12px;padding:8px 12px;font-size:.82em;color:var(--tx2);min-height:50px;display:flex;flex-wrap:wrap;gap:2px 12px;align-items:center}#edubank .eb-tip b{color:var(--tx)}#edubank .eb-tip .eb-d{flex-basis:100%;font-weight:700;color:var(--tx)}',
'#edubank canvas{width:100%;display:block;margin:8px 0;touch-action:pan-y;border-radius:12px;background:var(--card)}',
'#edubank .eb-gacts{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}#edubank .eb-gacts .eb-btn{margin-top:8px;padding:10px 6px;font-size:.95em;min-width:0}',
'#edubank .eb-toast{position:absolute;left:50%;bottom:76px;transform:translateX(-50%);background:#14142b;color:#fff;padding:12px 18px;border-radius:14px;font-weight:700;max-width:90%;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.35)}',
'@media(min-width:700px){#edubank.full{font-size:17px}}'].join('')}
function css(){
  if(document.getElementById('edubank-css'))return;
  var s=document.createElement('style');s.id='edubank-css';
  s.textContent=EBCSS();
  document.head.appendChild(s);
}

/* ---------- estrutura ---------- */
function shell(titulo,voltar,semNav){
  root.innerHTML='<div class="eb-top">'+(voltar?'<button class="eb-back" aria-label="Voltar" data-a="voltar">'+I('back',22)+'</button>':marca(32))+'<b>'+esc(titulo)+'</b><button class="eb-x" aria-label="Fechar" data-a="fechar">'+I('close',22)+'</button></div><div class="eb-body"><div class="eb-w" id="eb-c"></div></div>'+
   (semNav?'':'<nav class="eb-nav">'+TABS.map(function(t){return '<button data-a="aba" data-k="'+t.k+'" class="'+(t.k===aba?'on':'')+'"><i>'+I(t.i,24)+'</i>'+esc(t.n)+'</button>'}).join('')+'</nav>');
  return root.querySelector('#eb-c');
}
function $(s){return root.querySelector(s)}
function toast(t){var d=document.createElement('div');d.className='eb-toast';d.textContent=t;root.appendChild(d);setTimeout(function(){d.remove()},2300)}
function setErr(el,t,ok){var e=el.querySelector('.eb-err,.eb-ok');if(e)e.remove();if(!t)return;var d=document.createElement('div');d.className=ok?'eb-ok':'eb-err';d.setAttribute('role','alert');d.innerHTML=I(ok?'check':'alert',20)+'<span>'+esc(t)+'</span>';el.appendChild(d)}
function getCash(){try{return Math.round(Number(O.getCash())||0)}catch(e){return 0}}
function saldoDe(c){return Math.round(Number(DADOS&&DADOS.saldos&&DADOS.saldos[c])||0)}
function opcoes(sel,soComSaldo){return MOEDAS.filter(function(m){return !soComSaldo||saldoDe(m.c)>0}).map(function(m){return '<option value="'+m.c+'"'+(m.c===sel?' selected':'')+'>'+m.c+' · '+esc(m.n)+'</option>'}).join('')}

function semSessao(msg){
  aba='';DADOS=null;TEMSENHA=null;var c=shell('EduBank',false,true);
  var pre='';try{pre=String((window.EDU_AUTH&&EDU_AUTH.login&&EDU_AUTH.login())||lget('edu_login','')||'')}catch(e){}
  var prof=null;try{var ss=(window.EDU_AUTH&&EDU_AUTH.sessao&&EDU_AUTH.sessao())||lget('edu_sess',null);if(ss&&ss.login&&(ss.mestre||ss.local||!ss.t))prof=ss}catch(e){}
  c.innerHTML=(prof?'<div class="eb-card"><h2>Você está como professor</h2><p class="eb-muted" style="margin:0 0 10px">O EduBank é para alunos — entre com um login de aluno abaixo.</p><a href="professor.html" target="_blank" rel="noopener" class="eb-btn sec" style="text-decoration:none;margin-top:6px;min-height:46px">Painel do professor</a></div>':'')+'<div class="eb-card"><div class="eb-gh">'+I('key',34)+'<div><h2 style="margin:0">Entrar no EduBank</h2><div class="eb-muted">Use o mesmo login e senha do site.</div></div></div>'+
   '<form id="eb-lf" autocomplete="on" novalidate><label for="eb-lu">Login</label><input id="eb-lu" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ex.: 12cla6b" value="'+esc(RE.test(pre)?pre:'')+'">'+
   '<label for="eb-lp">Senha</label><div style="position:relative"><input id="eb-lp" type="password" autocomplete="current-password" style="padding-right:84px"><button type="button" id="eb-lv" aria-label="Mostrar senha" style="position:absolute;right:6px;top:5px;min-height:40px;border:0;background:var(--chip);color:var(--pri);font-weight:800;border-radius:10px;padding:0 12px;cursor:pointer">Mostrar</button></div>'+
   '<button class="eb-btn" id="eb-ent" type="submit">Entrar</button></form></div>';
  var box=c.lastChild;if(msg)setErr(box,msg);
  $('#eb-lv').onclick=function(){var p=$('#eb-lp'),h=p.type==='password';p.type=h?'text':'password';this.textContent=h?'Ocultar':'Mostrar'};
  setTimeout(function(){var e=$('#eb-lu');if(e)(e.value?$('#eb-lp'):e).focus()},50);
  $('#eb-lf').onsubmit=function(ev){
    ev.preventDefault();var u=$('#eb-lu').value.trim().toLowerCase().replace(/\s+/g,''),p=$('#eb-lp').value,b=$('#eb-ent');
    if(!RE.test(u))return setErr(box,'Login inválido. Use o formato do RCO, ex.: 12cla6b.');
    if(!p)return setErr(box,'Digite a senha.');
    if(!(window.EDU_AUTH&&EDU_AUTH.entrar))return setErr(box,'Entrada indisponível nesta página. Volte à tela inicial da atividade.');
    b.disabled=true;b.textContent='Entrando…';setErr(box,'');
    (function tenta(n){EDU_AUTH.entrar(u,p).then(function(j){
      if(!root)return;
      if(j&&!j.ok&&(j.net||/servidor|conex/i.test(j.erro||''))&&n<3){setErr(box,'Servidor acordando… tentando de novo ('+(n+1)+'/3)');return setTimeout(function(){if(root)tenta(n+1)},2500)}
      if(!j||!j.ok){b.disabled=false;b.textContent='Entrar';var er=(j&&j.erro)||'';if(!er)er='Não foi possível entrar.';else if(/senha/i.test(er)&&!/digite/i.test(er)&&!/incorret/i.test(er))er='Senha incorreta. '+er;return setErr(box,er+(j&&j.net?' Verifique a internet e tente de novo.':''))}
      if(!sessao()){b.disabled=false;b.textContent='Entrar';return setErr(box,'Esta conta não tem EduBank. Entre com login e senha de aluno.')}
      DADOS=null;TEMSENHA=null;
      if(!ep()){var c2=shell('EduBank',false,true);c2.innerHTML='<div class="eb-card">'+vazio('alert','Banco indisponível','O EduBank não está configurado nesta página.')+'</div>';return}
      telaInicio();recIniciar();
    }).catch(function(e){b.disabled=false;b.textContent='Entrar';setErr(box,e&&e.message||'Não foi possível entrar.')})})(0);
  };
}
function carregar(){
  return api({acao:'carteira'}).then(function(j){
    if(!j.ok){if(j.sessao)throw new Error('Sua sessão expirou. Entre de novo pelo início da atividade.');throw new Error(msgErro(j))}
    DADOS=j;DADOS._em=Date.now();return j;
  });
}
function comDados(fn,titulo,voltar){
  var c=shell(titulo,voltar);
  if(DADOS){fn(c);return}
  c.innerHTML=skel(3);
  carregar().then(function(){if(root)fn(shell(titulo,voltar))},function(e){
    if(!root)return;var c2=shell(titulo,voltar);
    c2.innerHTML='<div class="eb-card">'+vazio('alert','Não deu para abrir',e.message)+'<button class="eb-btn" id="eb-re">Tentar de novo</button></div>';
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
    c.innerHTML='<div class="eb-hero"><small>'+esc(aluno(LOGIN))+'</small><small class="eb-lb">Saldo em reais</small><div class="eb-v" id="eb-sal">'+rs(getCash())+'</div>'+
    '<div class="eb-chave"><span>Chave Pix</span><code>'+esc(LOGIN)+'</code><button data-a="copiar" aria-label="Copiar chave Pix">'+I('copy',18)+'Copiar</button></div></div>'+
    '<div class="eb-acts"><button class="eb-act" data-a="aba" data-k="cambio"><i>'+I('swap',22)+'</i>Câmbio</button><button class="eb-act" data-a="aba" data-k="transferir"><i>'+I('send',22)+'</i>Transferir</button><button class="eb-act" data-a="aba" data-k="extrato"><i>'+I('receipt',22)+'</i>Extrato</button></div>'+
    '<div class="eb-card" id="eb-moe"><h2>Moedas</h2>'+skel(1).replace('eb-card','eb-sk0')+'</div>'+
    '<h3>Moedas estrangeiras</h3><div class="eb-moedas">'+MOEDAS.filter(function(m){return !m.x}).map(cartao).join('')+'</div>'+
    '<h3>Criptomoedas</h3><div class="eb-moedas">'+MOEDAS.filter(function(m){return m.x}).map(cartao).join('')+'</div>'+
    '<div class="eb-nota">'+I('alert',16)+'<span>Cotações do dia, atualizadas às '+esc(horaTaxa('USD'))+'. Toque numa moeda para ver o gráfico de velas. Compra e venda têm spread de 2%.</span></div>'+
    '<button class="eb-btn sec" data-a="trocasenha">'+I('key',20)+'Trocar senha do EduBank</button><button class="eb-btn sec" data-a="sair" style="min-height:44px;margin-top:8px;border-color:var(--bd);color:var(--tx2);font-weight:600">Sair da conta</button><div class="eb-card eb-muted" style="margin-top:14px">Transferências só entre alunos da mesma turma ('+esc(turma(LOGIN))+') e só em moedas estrangeiras e criptomoedas. Para ter moeda, compre no Câmbio.</div>';
    moedasCard();
},'EduBank');
}
/* ---------- moedas (ganhas em atividades) ---------- */
function moedasCard(){
  var el=$('#eb-moe');if(!el)return;
  api({acao:'moedas'}).then(function(j){
    el=$('#eb-moe');if(!el)return;
    if(!j||!j.ok){el.innerHTML='<h2>Moedas</h2><p class="eb-muted">Faça atividades e melhore suas notas para ganhar moedas.</p>';return}
    var s=Math.max(0,Math.floor(Number(j.saldo)||0)),cm=Number(j.centavosPorMoeda)||0;
    DADOS.moedas={saldo:s,cpm:cm};
    el.innerHTML='<div class="eb-gh">'+I('coin',36)+'<div><h2 style="margin:0">Moedas</h2><div class="eb-gp">'+s+' moeda'+(s===1?'':'s')+'</div></div></div>'+
      '<p class="eb-muted">Cada moeda vale '+rs(cm)+'. Ganhe mais refazendo atividades para melhorar sua nota.</p>'+
      '<button class="eb-btn" data-a="trocamoedas"'+(s>0?'':' disabled')+'>Trocar por reais</button>'+
      '<p class="eb-muted" style="margin-top:8px">Depois de trocar, o dinheiro cai no seu saldo em reais e você pode comprar moedas estrangeiras e criptomoedas no Câmbio.</p>';
  }).catch(function(){el=$('#eb-moe');if(el)el.innerHTML='<h2>Moedas</h2><p class="eb-muted">Não foi possível carregar agora.</p>'});
}
function idMoeda(q){
  var k='eb_trocamoedas_'+LOGIN+'_'+q;
  try{var v=localStorage.getItem(k);if(v)return v;v=novoId();localStorage.setItem(k,v);return v}catch(e){return novoId()}
}
function limpaIdMoeda(q){try{localStorage.removeItem('eb_trocamoedas_'+LOGIN+'_'+q)}catch(e){}}
function telaTrocaMoedas(){
  var c=shell('Trocar moedas',true);
  var M=(DADOS&&DADOS.moedas)||{saldo:0,cpm:0};
  c.innerHTML='<div class="eb-card"><h2>Trocar moedas por reais</h2><p class="eb-muted">Você tem <b>'+M.saldo+'</b> moeda'+(M.saldo===1?'':'s')+' · 1 moeda = <b>'+rs(M.cpm)+'</b></p>'+
    '<label for="eb-mq">Quantas moedas quer trocar?</label><input id="eb-mq" inputmode="numeric" autocomplete="off" placeholder="0">'+
    '<div class="eb-est" id="eb-me">Digite a quantidade</div><button class="eb-btn" id="eb-mgo">Trocar</button>'+
    '<p class="eb-muted" style="margin-top:10px">O valor entra no seu saldo em reais. Depois você pode trocar esse dinheiro por moedas estrangeiras ou criptomoedas no Câmbio.</p></div>';
  var box=c.firstChild;
  function q(){var n=parseInt(String($('#eb-mq').value).replace(/\D/g,''),10);return n>0?n:0}
  $('#eb-mq').oninput=function(){var n=q();$('#eb-me').textContent=n>0?('Você recebe '+rs(n*M.cpm)):'Digite a quantidade'};
  $('#eb-mgo').onclick=function(){
    var n=q();
    if(!(n>=1))return setErr(box,'Digite uma quantidade válida.');
    if(n>M.saldo)return setErr(box,'Você só tem '+M.saldo+' moeda'+(M.saldo===1?'':'s')+'.');
    var btn=this;btn.disabled=true;setErr(box,'');
    api({acao:'trocarmoedas',q:n,id:idMoeda(n)}).then(function(j){
      btn.disabled=false;
      if(!j.ok)return setErr(box,msgErro(j));
      limpaIdMoeda(n);
      if(!j.dup){try{O.addCash(Math.round(j.centavos),'EduBank: troca de '+n+' moeda'+(n===1?'':'s'))}catch(e){}}
      if(j.saldo!=null)M.saldo=Math.max(0,Math.floor(Number(j.saldo)||0));else M.saldo-=n;
      DADOS.moedas=M;
      $('#eb-mq').value='';$('#eb-me').textContent='Digite a quantidade';
      setErr(box,j.dup?'Essa troca já tinha sido feita. Nada foi cobrado de novo.':('Você trocou '+n+' moeda'+(n===1?'':'s')+' por '+rs(j.centavos)+'. Agora você tem '+rs(getCash())+'.'),true);
    }).catch(function(e){btn.disabled=false;setErr(box,e.message+' Se tentar de novo, a troca não será duplicada.')});
  };
}
function cartao(m){
  var v=saldoDe(m.c),vr=varTaxa(m.c);
  return '<button class="eb-m'+(v?'':' zero')+'" data-a="grafico" data-c="'+m.c+'" aria-label="'+esc(m.n)+', gráfico">'+flag(m.c,40)+'<span class="eb-mi"><span class="eb-mc">'+m.c+'</span><span class="eb-mn">'+esc(m.n)+'</span></span>'+
   '<span class="eb-mr"><b>'+qtd(m,v)+'</b><em>1 = '+fmtTaxa(m.c)+(vr!=null?' <span class="eb-var '+(vr>0?'eb-pos':'eb-neg')+'">'+(vr>0?'▲ +':'▼ ')+vr.toFixed(2).replace('.',',')+'%</span>':'')+'</em></span></button>';
}

/* ---------- gráfico de velas ---------- */
var GRAF_TF=[['5m','5 min'],['30m','30 min'],['1h','1 hora'],['1d','1 dia']];
/* Velas REAIS em R$: Binance (pares em BRL) para cripto e dólar; euro e peso argentino compostos com o dólar;
   demais moedas: fechamento diário real da AwesomeAPI (abertura = fechamento − variação do dia). */
function bnKl(sym,tf,lim){
  return fetch('https://api.binance.com/api/v3/klines?symbol='+sym+'&interval='+tf+'&limit='+lim)
    .then(function(r){if(!r.ok)throw new Error('cotação indisponível');return r.json()})
    .then(function(a){if(!Array.isArray(a)||!a.length)throw new Error('sem dados');return a.map(function(k){return {t:+k[0],o:+k[1],h:+k[2],l:+k[3],c:+k[4]}})});
}
function compoe(a,b,div){ /* a = moeda em USDT (ou USDT em ARS), b = USDT em BRL; combina por horário */
  var mb={};b.forEach(function(k){mb[k.t]=k});var out=[];
  a.forEach(function(k){var u=mb[k.t];if(!u)return;
    var o,c,h,l;
    if(div){o=u.o/k.o;c=u.c/k.c;h=Math.max(o,c,u.h/k.l);l=Math.min(o,c,u.l/k.h)}
    else{o=k.o*u.o;c=k.c*u.c;h=Math.max(o,c,k.h*u.c,k.c*u.h);l=Math.min(o,c,k.l*u.c,k.c*u.l)}
    out.push({t:k.t,o:o,h:h,l:l,c:c})});
  if(!out.length)throw new Error('sem dados');return out;
}
function grafFonte(c){
  if(MAP[c].x)return 'Binance (ao vivo, em R$)';
  return 'AwesomeAPI (fechamento diário, em R$)';
}
function grafSoDiario(c){return !MAP[c].x}
function grafSerie(c,tf){
  var m=MAP[c];
  if(m.x)return bnKl(c+'BRL',tf,120);
  return fetch('https://economia.awesomeapi.com.br/json/daily/'+c+'-BRL/60')
    .then(function(r){if(!r.ok)throw new Error('cotação indisponível');return r.json()})
    .then(function(a){
      a=a.slice().reverse();
      return a.map(function(x){var cl=Number(x.bid),vb=Number(x.varBid)||0;return {t:Number(x.timestamp)*1000,o:cl-vb,h:Number(x.high),l:Number(x.low),c:cl}});
    });
}
function cv_(n){return getComputedStyle(root).getPropertyValue(n).trim()}
function fmtP(v){var d=v>=1000?0:v>=10?2:v>=1?3:4;return v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function grafDesenha(cv,serie,tf,sel){
  var dpr=window.devicePixelRatio||1,W=Math.max(240,cv.clientWidth||320),H=Math.round(Math.max(210,Math.min(320,W*.7)));
  cv.style.height=H+'px';cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  var ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  if(!serie||!serie.length)return;
  var up=cv_('--up')||'#0b7a3b',dn=cv_('--dn')||'#c0261b',tx2=cv_('--tx2')||'#4b4d6e',bd=cv_('--bd')||'#e2e4f1',tx=cv_('--tx')||'#14142b',card=cv_('--card')||'#fff';
  var pl=8,pr=64,pt=12,pb=26;
  var lo=Math.min.apply(null,serie.map(function(k){return k.l})),hi=Math.max.apply(null,serie.map(function(k){return k.h}));
  var mg=(hi-lo)*.06||hi*.001;lo-=mg;hi+=mg;
  var faixa=(hi-lo)||1,n=serie.length,cw=(W-pl-pr)/n,bw=Math.max(2,Math.min(11,cw*.66));
  function Y(v){return pt+(hi-v)/faixa*(H-pt-pb)}
  cv._L={pl:pl,pr:pr,cw:cw,n:n};
  ctx.font='11px system-ui,sans-serif';ctx.lineWidth=1;
  for(var g=0;g<=4;g++){var y=pt+(H-pt-pb)*g/4;ctx.strokeStyle=bd;ctx.beginPath();ctx.moveTo(pl,y+.5);ctx.lineTo(W-pr,y+.5);ctx.stroke();
    ctx.fillStyle=tx2;ctx.textAlign='left';ctx.fillText(fmtP(hi-faixa*g/4),W-pr+6,y+4)}
  var passo=Math.max(1,Math.round(n/4));
  serie.forEach(function(k,i){
    var x=pl+i*cw+cw/2,sobe=k.c>=k.o,cor=sobe?up:dn;
    ctx.strokeStyle=cor;ctx.fillStyle=cor;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(x,Y(k.h));ctx.lineTo(x,Y(k.l));ctx.stroke();
    var y1=Y(Math.max(k.o,k.c)),y2=Y(Math.min(k.o,k.c));
    ctx.fillRect(x-bw/2,y1,bw,Math.max(1.5,y2-y1));
    if(i%passo===0){var d=new Date(k.t),t=(tf==='1d'||!tf)?d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      ctx.fillStyle=tx2;ctx.textAlign='center';ctx.fillText(t,Math.min(W-pr-14,Math.max(pl+14,x)),H-8)}
  });
  ctx.textAlign='left';
  var ult=serie[serie.length-1],yu=Y(ult.c),cu=ult.c>=ult.o?up:dn;
  ctx.setLineDash([4,4]);ctx.strokeStyle=cu;ctx.beginPath();ctx.moveTo(pl,yu);ctx.lineTo(W-pr,yu);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=cu;ctx.fillRect(W-pr+2,yu-9,pr-3,18);ctx.fillStyle=card;ctx.font='bold 11px system-ui,sans-serif';ctx.fillText(fmtP(ult.c),W-pr+6,yu+4);
  if(sel!=null&&serie[sel]){var xs=pl+sel*cw+cw/2;ctx.strokeStyle=tx;ctx.globalAlpha=.55;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(xs,pt);ctx.lineTo(xs,H-pb);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
}
function telaGrafico(c){
  aba='inicio';
  comDados(function(cx){
    var m=MAP[c],vr=varTaxa(c);
    cx.innerHTML='<div class="eb-card eb-graf"><div class="eb-gh">'+flag(c,44)+'<div><h2 style="margin:0">'+esc(m.n)+'</h2><div class="eb-gp">'+fmtTaxa(c)+'</div></div></div>'+
      '<p class="eb-muted" style="margin:8px 0 0">Seu saldo: <b style="color:var(--tx)">'+qtd(m,saldoDe(c))+'</b> · cotação às '+esc(horaTaxa(c))+'</p>'+
      '<div class="eb-pills" id="eb-tf">'+GRAF_TF.map(function(t,i){return '<button type="button" data-tf="'+t[0]+'" class="'+(i===GRAF_TF.length-1?'on':'')+'">'+t[1]+'</button>'}).join('')+'</div>'+
      '<div class="eb-tip" id="eb-tip">Toque ou arraste no gráfico para ver os valores.</div>'+
      '<canvas id="eb-cv" role="img" aria-label="Gráfico de velas de '+esc(m.n)+'"></canvas><div class="eb-muted" id="eb-gmsg"></div>'+
      '<div class="eb-gacts"><button class="eb-btn" data-a="aba" data-k="cambio">'+I('swap',20)+'Câmbio</button>'+
      '<button class="eb-btn sec" data-a="traf" data-c="'+c+'">'+I('send',20)+'Transferir</button></div></div>';
    var cv=cx.querySelector('#eb-cv'),msg=cx.querySelector('#eb-gmsg'),tip=cx.querySelector('#eb-tip'),tf='1d',SER=null,SEL=null;
    function tipo(i){
      var k=SER[i];if(!k)return;SEL=i;grafDesenha(cv,SER,tf,i);
      var d=new Date(k.t),dd=d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})+((tf==='1d')?'':' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}));
      var cor=k.c>=k.o?'var(--up)':'var(--dn)';
      tip.innerHTML='<span class="eb-d">'+esc(dd)+'</span><span>Abertura <b>'+fmtP(k.o)+'</b></span><span>Máx. <b>'+fmtP(k.h)+'</b></span><span>Mín. <b>'+fmtP(k.l)+'</b></span><span>Fech. <b style="color:'+cor+'">'+fmtP(k.c)+'</b></span>';
    }
    function pos(e){var L=cv._L;if(!L||!SER)return;var r=cv.getBoundingClientRect(),x=e.clientX-r.left,i=Math.floor((x-L.pl)/L.cw);tipo(Math.max(0,Math.min(L.n-1,i)))}
    cv.addEventListener('pointerdown',pos);cv.addEventListener('pointermove',function(e){if(e.buttons||e.pointerType==='mouse')pos(e)});
    function carrega(){
      msg.textContent='Carregando velas…';SER=null;SEL=null;
      grafSerie(c,tf).then(function(s){SER=s;grafDesenha(cv,s,tf);tipo(s.length-1);var u=s[s.length-1],p0=s[0].o,v=((u.c-p0)/p0*100);
        msg.innerHTML='Fonte: '+grafFonte(c)+' · '+s.length+' velas · variação no período: <b style="color:'+(v>=0?'var(--up)':'var(--dn)')+'">'+(v>=0?'+':'')+v.toFixed(2).replace('.',',')+'%</b>';})
        .catch(function(e){msg.textContent='Não consegui carregar o gráfico agora ('+e.message+'). Tente outro período.'});
    }
    cx.querySelector('#eb-tf').onclick=function(e){
      var b=e.target.closest('[data-tf]');if(!b)return;
      tf=b.getAttribute('data-tf');
      [].forEach.call(this.querySelectorAll('[data-tf]'),function(x){x.classList.toggle('on',x===b)});
      if(grafSoDiario(c)&&tf!=='1d'){msg.textContent='Para esta moeda só há velas diárias (últimos 60 dias).';return}
      carrega();
    };
    carrega();
  },'Gráfico',true);
}

/* ---------- câmbio ---------- */
function estimaUI(m,v,op){
  var el=$('#eb-es');if(!el)return;
  if(!(v>0)){el.innerHTML='<div class="eb-t">Digite a quantidade'+(m.x?' (até 8 casas, ex.: 0,001523)':'')+' para ver a estimativa.</div><div class="eb-r"><span>Taxa de referência</span><b>1 '+m.c+' = '+fmtTaxa(m.c)+'</b></div><div class="eb-r"><span>Cotação das</span><b>'+esc(horaTaxa(m.c))+'</b></div>';return}
  var base=Math.round(taxaDe(m.c)*v/escalaDe(m.c)*100),tot=estim(m.c,v,op),spr=Math.abs(tot-base);
  el.innerHTML='<div class="eb-r"><span>Taxa de referência</span><b>1 '+m.c+' = '+fmtTaxa(m.c)+'</b></div><div class="eb-r"><span>Valor sem taxa</span><b>'+rs(base)+'</b></div><div class="eb-r"><span>Spread de 2%</span><b>'+(op==='comprar'?'+ ':'− ')+rs(spr)+'</b></div><div class="eb-r"><span>Cotação das</span><b>'+esc(horaTaxa(m.c))+'</b></div>'+
   '<div class="eb-big"><span>'+(op==='comprar'?'Você paga cerca de':'Você recebe cerca de')+'</span><b>'+rs(tot)+'</b></div>';
}
function telaCambio(pre){
  aba='cambio';
  comDados(function(c){
    var op='comprar',moeda=(pre&&MAP[pre])?pre:'USD';
    c.innerHTML='<div class="eb-card"><h2>Câmbio</h2><p class="eb-muted">Seu saldo em reais: <b id="eb-sr" style="color:var(--tx)">'+rs(getCash())+'</b></p>'+
    '<div class="eb-seg"><button data-op="comprar" class="on">Comprar</button><button data-op="vender">Vender</button></div>'+
    '<label for="eb-mo">Moeda</label><select id="eb-mo">'+opcoes(moeda)+'</select><div class="eb-disp" id="eb-tx"></div>'+
    '<label for="eb-q" id="eb-ql">Quantidade que quero comprar</label><input id="eb-q" inputmode="decimal" autocomplete="off" placeholder="0,00">'+
    '<div class="eb-est" id="eb-es"></div><button class="eb-btn" id="eb-go">Comprar</button></div>';
    var box=c.firstChild;
    function atual(){
      moeda=$('#eb-mo').value;var m=MAP[moeda];
      $('#eb-tx').innerHTML=flag(m.c,20)+'<span>Você tem '+qtd(m,saldoDe(moeda))+'</span>';
      var v=parseQ(m,$('#eb-q').value);
      estimaUI(m,v,op);
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
    c.innerHTML=''+skel(2)+'';
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
    if(!tem.length){c.innerHTML='<div class="eb-card">'+vazio('send','Nada para transferir ainda','Compre moeda estrangeira ou criptomoeda no Câmbio com seus reais.')+'<button class="eb-btn" data-a="aba" data-k="cambio">Ir para o Câmbio</button></div>';return}
    var sel=(pre&&saldoDe(pre)>0)?pre:tem[0].c;
    c.innerHTML='<div class="eb-card"><h2>Transferir</h2><p class="eb-muted">Só para alunos da turma '+esc(turma(LOGIN))+', em moedas estrangeiras e criptomoedas.</p>'+
    '<label for="eb-pa">Chave Pix do colega</label><input id="eb-pa" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="ex.: 7'+esc(turma(LOGIN))+'">'+
    '<label for="eb-mo">Moeda</label><select id="eb-mo">'+opcoes(sel,true)+'</select><div class="eb-muted" id="eb-sd"></div>'+
    '<label for="eb-v">Valor</label><input id="eb-v" inputmode="decimal" autocomplete="off" placeholder="0,00"><div class="eb-muted" id="eb-rs" style="margin-top:6px"></div>'+
    '<label for="eb-n">Mensagem (opcional)</label><input id="eb-n" maxlength="40" autocomplete="off">'+
    '<button class="eb-btn" id="eb-rev">'+I('send',20)+'Revisar transferência</button></div>';
    var box=c.firstChild;
    function sd(){var m=MAP[$('#eb-mo').value];$('#eb-sd').innerHTML='<span class="eb-disp">'+flag(m.c,20)+'Disponível: '+qtd(m,saldoDe(m.c))+'</span>'}
    $('#eb-mo').onchange=sd;sd();
    var vin=$('#eb-v');
    function rsPrev(){
      var m=MAP[$('#eb-mo').value],v=parseQ(m,vin.value||''),el=$('#eb-rs');
      if(!el)return;
      if(!(v>=1)||!taxaDe(m.c)){el.textContent='';return}
      el.innerHTML='O colega recebe o equivalente a <b>'+rs(estim(m.c,v,'vender'))+'</b> se converter na hora (spread de 2%).';
    }
    vin.oninput=rsPrev;
    $('#eb-rev').onclick=function(){
      var para=$('#eb-pa').value.trim().toLowerCase().replace(/\s+/g,''),m=MAP[$('#eb-mo').value],v=parseQ(m,$('#eb-v').value),nota=$('#eb-n').value.replace(/[<>]/g,'').slice(0,40);
      if(!RE.test(para))return setErr(box,'Chave inválida. Use o login do colega, ex.: 7'+turma(LOGIN)+'.');
      if(para===LOGIN)return setErr(box,'Você não pode transferir para você mesmo.');
      if(turma(para)!==turma(LOGIN))return setErr(box,'Só é possível transferir para alunos da sua turma ('+turma(LOGIN)+').');
      if(!(v>=1))return setErr(box,'Digite um valor válido'+(m.x?' (até 8 casas decimais).':', ex.: 5,50.'));
      if(v>saldoDe(m.c))return setErr(box,'Saldo insuficiente. Você tem '+qtd(m,saldoDe(m.c))+'.');
      telaConfirmar({id:novoId(),para:para,moeda:m.c,v:v,nota:nota});
    };
    var tr=document.createElement('button');tr.className='eb-btn sec';tr.innerHTML=I('key',20)+'Trocar senha do EduBank';tr.onclick=function(){telaSenha(true,function(){telaTransferir(pre)})};c.appendChild(tr);
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
  c.innerHTML='<div class="eb-card eb-rc"><div class="eb-rh"><div class="eb-muted">Você vai enviar</div><div class="eb-am">'+esc(qtd(m,p.v))+'</div></div>'+
  '<dl><div class="eb-rw"><dt>Para</dt><dd>'+esc(aluno(p.para))+'</dd></div><div class="eb-rw"><dt>Chave</dt><dd>'+esc(p.para)+'</dd></div>'+(p.nota?'<div class="eb-rw"><dt>Mensagem</dt><dd>'+esc(p.nota)+'</dd></div>':'')+'</dl>'+
  '<div style="padding:0 16px 16px"><label for="eb-pw">Senha do EduBank</label><input id="eb-pw" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="4 números (dia e mês)">'+
  '<button class="eb-btn" id="eb-ok">'+I('check',20)+'Confirmar e transferir</button><button class="eb-btn sec" id="eb-no">Voltar</button></div></div>';
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
  c.innerHTML='<div class="eb-card eb-rc"><div class="eb-rh"><div class="eb-okc">'+I('check',30)+'</div><h2>Transferência feita!</h2><div class="eb-am">'+esc(qtd(m,r.v))+'</div></div>'+
  '<dl><div class="eb-rw"><dt>Para</dt><dd>'+esc(aluno(r.para))+'</dd></div><div class="eb-rw"><dt>Chave</dt><dd>'+esc(r.para)+'</dd></div><div class="eb-rw"><dt>De</dt><dd>'+esc(aluno(LOGIN))+'</dd></div>'+(r.nota?'<div class="eb-rw"><dt>Mensagem</dt><dd>'+esc(r.nota)+'</dd></div>':'')+
  '<div class="eb-rw"><dt>Data</dt><dd>'+esc(dt(r.ts))+'</dd></div><div class="eb-rw"><dt>Protocolo</dt><dd>'+esc(r.id)+'</dd></div></dl></div><button class="eb-btn" data-a="aba" data-k="inicio">Voltar ao início</button>';
}

/* ---------- módulos de investimento (carregados sob demanda) ---------- */
var MODS={mercados:['edubank-investir.js?v=1','EDUBANK_INV','mercados'],investir:['edubank-investir.js?v=1','EDUBANK_INV',null],carteira:['edubank-investir.js?v=1','EDUBANK_INV','carteira'],simulacoes:['edubank-simula.js?v=1','EDUBANK_SIM',null]};
var NOMES={mercados:'Mercados',investir:'Investir',carteira:'Carteira',simulacoes:'Simulações'};
function carregaMod(src,g){
  return new Promise(function(ok,err){
    if(window[g])return ok(window[g]);
    var s=document.createElement('script');s.src=src;s.onload=function(){window[g]?ok(window[g]):err(new Error('Módulo indisponível.'))};s.onerror=function(){err(new Error('Não foi possível carregar este módulo. Verifique a conexão.'))};
    document.head.appendChild(s);
  });
}
function fmtUS(c){c=Math.round(Number(c)||0);var neg=c<0;c=Math.abs(c);return (neg?'-':'')+'US$ '+sep(Math.floor(c/100))+','+('0'+(c%100)).slice(-2)}
function mkCtx(k){
  return {
    api:function(acao,extra){var p={acao:acao},x=extra||{};Object.keys(x).forEach(function(q){p[q]=x[q]});return api(p)},
    login:LOGIN,
    getCash:function(){return getCash()},
    addCash:function(d){d=Math.round(Number(d)||0);return O.addCash(d,d<0?'Investimento':'Resgate de investimento')},
    fmtR:rs,fmtUS:fmtUS,esc:esc,
    voltar:function(){irAba('inicio')},
    receber:function(){recBusy=false;receber()}
  };
}
function telaMod(k){
  aba=k;var m=MODS[k],nome=NOMES[k];
  var c=shell(nome,false);
  c.innerHTML=skel(3);
  var nav=$('.eb-nav'),on=nav&&nav.querySelector('button.on');if(on&&on.scrollIntoView){try{nav.scrollLeft=Math.max(0,on.offsetLeft-nav.clientWidth/2+on.offsetWidth/2)}catch(e){}}
  carregaMod(m[0],m[1]).then(function(M){
    if(!root||aba!==k)return;
    var sub=m[2]?M[m[2]]:M;
    var c2=shell(nome,false);c2.innerHTML='';
    var nav2=$('.eb-nav'),on2=nav2&&nav2.querySelector('button.on');if(on2){try{nav2.scrollLeft=Math.max(0,on2.offsetLeft-nav2.clientWidth/2+on2.offsetWidth/2)}catch(e){}}
    sub.render(c2,mkCtx(k));
  }).catch(function(e){
    if(!root||aba!==k)return;
    var c2=shell(nome,false);
    c2.innerHTML='<div class="eb-card">'+vazio('alert','Não deu para abrir',e.message)+'<button class="eb-btn" id="eb-re">Tentar de novo</button></div>';
    $('#eb-re').onclick=function(){irAba(k)};
  });
}

/* ---------- extrato ---------- */
var TIPO={env:['','Enviado para '],rec:['','Recebido de '],compra:['','Compra de '],venda:['','Venda de '],inv:['','Aplicação: ']};
function telaExtrato(){
  aba='extrato';
  var c=shell('Extrato',false);
  c.innerHTML='<h2 style="margin:0 2px 8px">Extrato</h2><div class="eb-card" id="eb-lista">'+skel(4).replace('eb-card','eb-sk0')+'</div>';
  api({acao:'extrato'}).then(function(j){
    var l=$('#eb-lista');if(!l)return;
    if(!j.ok)return l.innerHTML=vazio('alert','Não deu para carregar o extrato',msgErro(j));
    var it=(j.itens||j.extrato||[]).slice().sort(function(a,b){return (Number(b.ts)||0)-(Number(a.ts)||0)});
    if(!it.length)return l.innerHTML=vazio('inbox','Nenhuma movimentação ainda','Compre moedas no Câmbio e elas aparecem aqui.');
    var ult='';
    l.innerHTML=it.map(function(x){
      var m=MAP[x.moeda]||{c:x.moeda,s:'',e:100,f:'💱'},t=TIPO[x.tipo]||['💱',''],pos=(x.tipo==='rec'||x.tipo==='compra'),brl=x.moeda==='BRL';
      var tit=brl&&x.outro==='Professor'?'Recebido do professor':(x.tipo==='env'||x.tipo==='rec')?t[1]+(RE.test(String(x.outro||''))?aluno(x.outro):(x.outro||'')):x.tipo==='inv'?(x.outro||x.nota||'Aplicação'):t[1]+m.c;
      var Q=function(v){v=Math.abs(Number(v)||0);return brl?rs(v):qtd(m,v)},g=dia(x.ts),h=(g!==ult)?'<div class="eb-dg">'+esc(g)+'</div>':'';ult=g;
      return h+'<div class="eb-it"><span class="eb-ib '+(pos?'eb-pos':'eb-neg')+'">'+I(x.tipo==='inv'?'trend':pos?'down':'up',20)+'</span><div><b>'+esc(tit)+'</b><small>'+esc(hhmm(x.ts))+(x.nota&&x.tipo!=='inv'?' · '+esc(x.nota):'')+(x.saldo_apos!=null?' · saldo '+esc(Q(x.saldo_apos)):'')+'</small></div><span class="eb-q '+(pos?'eb-pos':'eb-neg')+'">'+(pos?'+':'−')+esc(Q(x.v))+'</span></div>';
    }).join('');
  }).catch(function(e){var l=$('#eb-lista');if(l)l.innerHTML='<div class="eb-err">'+esc(e.message)+'</div>'});
}

/* ---------- créditos do professor (servidor guarda pendente; o R$ vive no aparelho) ---------- */
var recTimer=0,recBusy=false;
function credFeitos(){return lget('eb_cred_'+LOGIN,[])}
function receber(){
  if(recBusy||!root||!O||!sessao()||!ep())return;
  recBusy=true;
  api({acao:'receber'}).then(function(j){
    if(!j||!j.ok){recBusy=false;return}
    var feitos=credFeitos(),tot=0,ids=[],nota='';
    (j.itens||[]).forEach(function(x){
      var id=String(x.id||''),c=Math.round(Number(x.centavos)||0);
      if(!/^[A-Za-z0-9]{1,40}$/.test(id)||c<1)return;
      if(feitos.indexOf(id)<0&&O){
        try{O.addCash(c,'Recebido do professor');feitos.push(id);tot+=c;if(x.nota)nota=x.nota}catch(e){return}
      }
      ids.push(id);
    });
    if(feitos.length>300)feitos=feitos.slice(-300);
    lset('eb_cred_'+LOGIN,feitos);
    if(tot>0&&root){if(aba==='inicio'||aba==='extrato')irAba(aba);toast('Você recebeu '+rs(tot)+' do professor'+(nota?': '+nota:''))}
    if(!ids.length){recBusy=false;return}
    return api({acao:'receberack',ids:ids.join(',')}).then(function(){recBusy=false},function(){recBusy=false});
  }).catch(function(){recBusy=false});
}
function recIniciar(){recPara();receber();recTimer=setInterval(receber,30000)}
function recPara(){if(recTimer){clearInterval(recTimer);recTimer=0}recBusy=false}

/* ---------- controle ---------- */
function copiar(){
  var t=LOGIN;
  function ok(){toast('Chave copiada: '+t)}
  function fb(){var i=document.createElement('input');i.value=t;i.style.cssText='position:fixed;opacity:0';root.appendChild(i);i.select();try{document.execCommand('copy')}catch(e){}i.remove();ok()}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb();
}
function fechar(){
  recPara();
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
  else if(a==='trocamoedas')telaTrocaMoedas();
  else if(a==='trocasenha')statSenha().then(function(t){telaSenha(t,function(){irAba('inicio')})},function(e){toast(e.message)});
  else if(a==='sair'){try{if(window.EDU_AUTH&&EDU_AUTH.sair){EDU_AUTH.sair();return}}catch(e){}toast('Não foi possível sair agora.')}
  else if(a==='aba')irAba(b.getAttribute('data-k'));
  else if(a==='moeda'){var c=b.getAttribute('data-c');if(saldoDe(c)>0)telaTransferir(c);else telaCambio(c)}
  else if(a==='grafico'){telaGrafico(b.getAttribute('data-c'))}
  else if(a==='traf'){telaTransferir(b.getAttribute('data-c'))}
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
  else{telaInicio();recIniciar()}
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
      lset(k,st);
      try{if(window.EDU_AUTH&&EDU_AUTH.salvarJa)EDU_AUTH.salvarJa()}catch(e){}   /* saldo mudou: salva na nuvem já, sem esperar 8 s */
      return st.cash;
    }
  };
}

window.EDUBANK={open:open,close:fechar,icone:icone,adaptadorLocal:adaptadorLocal,fmt:rs,qtd:qtd,moedas:MOEDAS,version:16,versao:'16'};
})();
