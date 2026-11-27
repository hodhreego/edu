/* PORTEIRO do aluno (Ludopédia/EduBank): login + senha ANTES de qualquer atividade, sessão por token, troca de senha,
   espelho em nuvem do localStorage. Carregado por menu.js (jogos) e por robiox.html (modo sem tela: window.EDU_AUTH_NOUI=1).
   Globais: EDU_LOGIN() / EDU_TOKEN() (funções), EDU_AUTH. Nunca grava senha em texto: só o hash SHA-256 de login:senha:edu.
   Sessão de aluno: 1h40 (SESS_MIN) desde o login, igual ao servidor (EB_SESSAO_MIN). Aviso 5 min antes; ao expirar salva TUDO
   na nuvem e só então mostra o login. Chamadas ao servidor: timeout 20 s + até 4 novas tentativas (1,5/3/5/8 s). */
(function(){
'use strict';
if(window.EDU_AUTH)return;
var NOUI=!!window.EDU_AUTH_NOUI;
/* Porteiro DESLIGADO por padrao: liga com window.EDU_AUTH_ON===true (config.js) ou localStorage.edu_auth_teste==='1' (?auth=1 liga, ?auth=0 desliga). */
try{var qa=(location.search.match(/[?&]auth=([01])/)||[])[1];if(qa==='1')localStorage.setItem('edu_auth_teste','1');else if(qa==='0')localStorage.removeItem('edu_auth_teste')}catch(e){}
var LIGADO=window.EDU_AUTH_ON===true;try{if(localStorage.getItem('edu_auth_teste')==='1')LIGADO=true}catch(e){}
if(!LIGADO)return;
var file=decodeURIComponent(location.pathname.split('/').pop());
function profOk(){try{return !!(window.EDU_PROF_OK&&EDU_PROF_OK())||sessionStorage.getItem('edu_prof')==='1'}catch(e){return false}}
if(!NOUI){
 if(/[?&]imp=1/.test(location.search))return;          /* impressão: imprimir.js pede a senha do professor */
 if(/^professor/i.test(file)||/gabaritos-professor/i.test(file))return;
 if(window.EDU_AUTH_OFF||profOk())return;
}
var RE=/^\d{1,3}[a-z]{3}\d[a-z]$/,RESP=/^(\d{1,3}[a-z]{3}\d[a-z]|mestre|teste|mainara)$/,MESTRA='45999699444';
var ESCOLAS={cla:'Jardim Clarito — Cascavel - PR',xus:'Marcos Claudio Schuster — Cascavel - PR'};
var SESS_MIN=100,SESS_MS=SESS_MIN*6e4,AVISO_MS=5*6e4,MESTRE_MS=12*36e5;
var MSG_FIM='Sua sessão de 1h40 terminou. Entre de novo (seu progresso e saldo estão salvos).';
var MSG_AVISO='Sua sessão termina em 5 min — seu progresso está sendo salvo';
var SENHA_FIXA='2026.2026',ready=false,cbs=[],sess=null;

function ep(){return window.EDU_ENDPOINT||''}
function norm(u){return String(u||'').trim().toLowerCase().replace(/\s+/g,'')}
function turmaDe(l){return String(l||'').replace(/^\d+/,'')}
function numDe(l){var m=String(l||'').match(/^\d+/);return m?m[0]:''}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}

/* ---------- sessão ---------- */
function rd(){try{var s=JSON.parse(localStorage.getItem('edu_sess'));if(!(s&&RESP.test(s.login)&&s.exp>Date.now()))return null;
 /* sessões antigas (30 dias) passam a valer no máximo 1h40 a partir de agora */
 if(!s.mestre&&s.exp-Date.now()>SESS_MS+6e4){s.exp=Date.now()+SESS_MS;try{localStorage.setItem('edu_sess',JSON.stringify(s))}catch(e){}}
 return s}catch(e){return null}}
function wr(s){
 sess=s||null;
 if(s){ls('edu_sess',JSON.stringify(s));ls('edu_login',s.login)}else{ls('edu_sess',null);ls('edu_login',null)}
 try{if(s){sessionStorage.setItem('rbx_login',s.login);sessionStorage.setItem('rbx_ok','1');if(s.mestre)sessionStorage.setItem('rbx_master','1');else sessionStorage.removeItem('rbx_master')}
  else{sessionStorage.removeItem('rbx_login');sessionStorage.removeItem('rbx_ok');sessionStorage.removeItem('rbx_master');sessionStorage.removeItem('edu_idok')}}catch(e){}
}
sess=rd();
window.EDU_LOGIN=function(){return sess?sess.login:''};
window.EDU_TOKEN=function(){return sess&&sess.t||''};

/* ---------- rede (timeout 20 s; até 4 novas tentativas se não vier JSON, der timeout/rede ou o servidor pedir {tentar:1}) ---------- */
var ESPERAS=[1500,3000,5000,8000];
function api1(acao,p,o){
 var u=ep();if(!u)return Promise.resolve({ok:0,erro:'Sem endereço do servidor.'});
 var q='?acao='+encodeURIComponent(acao);
 for(var k in (p||{}))if(p[k]!==undefined&&p[k]!==null)q+='&'+encodeURIComponent(k)+'='+encodeURIComponent(p[k]);
 var ac=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ac)ac.abort()},o.timeout||20000);
 var opt={keepalive:!!o.keepalive};if(ac)opt.signal=ac.signal;
 var big=o.post||(u+q).length>7000;
 if(big){var body={acao:acao};for(var k2 in (p||{}))body[k2]=p[k2];opt.method='POST';opt.headers={'Content-Type':'text/plain'};opt.body=JSON.stringify(body)}
 else u=u+q;
 return fetch(u,opt).then(function(r){return r.text()}).then(function(t){clearTimeout(tm);
   var j=null;try{j=JSON.parse(t)}catch(e){}
   return j&&typeof j==='object'?j:{ok:0,net:1,erro:'Resposta inválida do servidor.'}},
  function(){clearTimeout(tm);return{ok:0,net:1,erro:'Sem conexão com o servidor.'}});
}
function api(acao,p,o){
 o=o||{};var max=o.tentativas==null?ESPERAS.length:o.tentativas,n=0;
 function vai(){return api1(acao,p,o).then(function(j){
  if(j&&!j.ok&&(j.net||j.tentar)&&n<max){var w=ESPERAS[Math.min(n,ESPERAS.length-1)];n++;
   try{if(o.onTentativa)o.onTentativa(n+1)}catch(e){}
   return new Promise(function(r){setTimeout(r,w)}).then(vai)}
  return j})}
 return vai();
}
function aquecer(){try{if(ep())api1('taxas',{},{timeout:20000})}catch(e){}}   /* acorda o servidor enquanto o aluno digita */
function hash(login,senha){
 if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('nocrypto'));
 return crypto.subtle.digest('SHA-256',new TextEncoder().encode(login+':'+senha+':edu')).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('')});
}

/* ---------- entrar / quem / senha ---------- */
function entrar(u,p,prog){
 u=norm(u);p=String(p||'');
 if((u==='teste'&&p==='teste')||(u==='mainara'&&p==='mainara')){wr({login:u,t:'',local:1,exp:Date.now()+SESS_MS,ini:Date.now(),turma:'',trocar:0});return Promise.resolve({ok:1,local:1,trocar:0})}
 if(u===MESTRA||p===MESTRA){var l=RE.test(u)?u:'mestre';wr({login:l,t:'',local:1,mestre:1,exp:Date.now()+MESTRE_MS,turma:turmaDe(l),trocar:0});return Promise.resolve({ok:1,local:1,mestre:1,trocar:0})}
 if(!RE.test(u))return Promise.resolve({ok:0,erro:'Login inválido. Use o formato do RCO, ex.: 7cla6b.'});
 if(!p)return Promise.resolve({ok:0,erro:'Digite a senha.'});
  var t0=Date.now();
  /* servidor fora do ar/desatualizado: a senha da turma entra direto (sessão local, sem token) */
  var semServ=function(){if(p===SENHA_FIXA){wr({login:u,t:'',local:1,exp:Date.now()+SESS_MS,ini:Date.now(),turma:turmaDe(u),trocar:0});return{ok:1,local:1,trocar:0}}return null};
  if(!(window.crypto&&crypto.subtle)){var r0=semServ();if(r0)return Promise.resolve(r0)}
  return hash(u,p).then(function(h){return api('entrar',{login:u,h:h},{onTentativa:prog}).then(function(j){
   if(j&&j.ok&&!j.token)return semServ()||{ok:0,erro:'Servidor ainda nao atualizado (login indisponivel). Fale com o professor.'};
   if(j&&!j.ok&&(j.net||j.tentar))return semServ()||{ok:0,net:1,erro:'Não foi possível falar com o servidor agora. Espere alguns segundos e toque em Entrar de novo.'};
   if(j&&!j.ok&&(!j.erro||/desconhec|a[cç][aã]o|servidor|erro interno|exception/i.test(j.erro)))return semServ()||{ok:0,erro:'Servidor ainda nao atualizado. Somente o professor (senha mestra) consegue entrar agora.'};
   if(j&&j.ok&&j.token){j.trocar=0;var min=+j.validadeMin>0?+j.validadeMin:SESS_MIN;
    wr({login:u,t:j.token,exp:t0+min*6e4-3e4,ini:t0,turma:j.turma||turmaDe(u)});avisado=0;saindo=false}
  return j})},function(){return{ok:0,erro:'Este navegador não permite entrar (precisa de https).'}});
}
function quem(){return sess&&!sess.local?api('quem',{login:sess.login,t:sess.t},{tentativas:1,timeout:15000}):Promise.resolve({ok:1,local:1})}
function sair(){
 var go=function(){clearLocalMirror();wr(null);ls('edu_nuvem_login',null);ls('edu_nuvem_ts',null);try{sessionStorage.removeItem('edu_idok')}catch(e){}location.reload()};
 salvarTudo(true);setTimeout(go,300);
}

/* ---------- identidade para o resto do site ---------- */
function preencheIdentidade(){
 if(!sess)return;var m=sess.login.match(/^(\d+)([a-z]{3})(\d)([a-z])$/);
 if(m){ls('edu_nome','Aluno nº '+m[1]);ls('edu_turma',m[3]+'º '+m[4].toUpperCase());if(ESCOLAS[m[2]])ls('edu_escola',ESCOLAS[m[2]])}
 else ls('edu_nome',sess.login==='mestre'?'Professor':'Teste');
 ls('edu_data',new Date().toLocaleDateString('pt-BR'));
 try{sessionStorage.setItem('edu_idok','1')}catch(e){}
 var o=document.getElementById('eduId');if(o)o.remove();
}

/* ---------- espelho em nuvem ---------- */
var EXC={edu_sess:1,edu_login:1,edu_resultados:1,edu_nuvem_ts:1,edu_nuvem_login:1,edu_nome:1,edu_turma:1,edu_escola:1,edu_data:1,edu_rbx_ts:1};
function mirrored(k){return typeof k==='string'&&!EXC[k]&&(/^(edu_|pc47_|at32_|pm37_|cr38_|apt_|colmeia|vocab_)/.test(k)||(!!sess&&k==='robiox_v2_'+sess.login))}
var merging=false,dirtyT=0,syncOn=false,pushing=false,dePe=false;
function snap(){
 var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(mirrored(k))o[k]=localStorage.getItem(k)}}catch(e){}
 var s=JSON.stringify(o);
 while(s.length>40000){var big=null,bl=0;for(var k2 in o)if(o[k2].length>bl&&!/^robiox_v2_/.test(k2)){bl=o[k2].length;big=k2}if(!big)for(var k3 in o){big=k3;break}if(!big)break;delete o[big];s=JSON.stringify(o)}
 return s;
}
function clearLocalMirror(){merging=true;try{var ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(mirrored(k))ks.push(k)}ks.forEach(function(k){localStorage.removeItem(k)})}catch(e){}merging=false}
function canSync(){return sess&&!sess.local&&sess.t&&syncOn}
function pushNow(fim){
 if(!canSync())return Promise.resolve();
 if(pushing&&!fim){dePe=true;return Promise.resolve()}
 clearTimeout(dirtyT);dirtyT=0;pushing=true;dePe=false;var ts=Date.now();
 return api('nuvemsalvar',{login:sess.login,t:sess.t,k:'edu',ts:ts,v:snap()},{keepalive:!!fim,post:true,tentativas:fim?0:3}).then(function(j){pushing=false;if(j&&j.ok)ls('edu_nuvem_ts',String(ts));else if(!fim)mark();if(dePe){dePe=false;pushNow(false)}return j});
}
/* cópia do RobIox (R$, cofrinho) também na chave 'rbx', com o _ts do próprio jogo (o servidor recusa ts mais antigo) */
function tsDe(v){if(typeof v!=='string'||v.indexOf('"_ts"')<0)return 0;try{var o=JSON.parse(v);return o&&typeof o==='object'?(+o._ts||0):0}catch(e){return 0}}
function pushRbx(fim){
 if(NOUI||!sess||sess.local||!sess.t)return Promise.resolve();
 var k='robiox_v2_'+sess.login,v=ls(k),ts=tsDe(v),ult=String(ls('edu_rbx_ts')||'');
 if(!ts||!v||v.length>40000||ult===sess.login+':'+ts)return Promise.resolve();
 return api('nuvemsalvar',{login:sess.login,t:sess.t,k:'rbx',ts:ts,v:v},{keepalive:!!fim,post:true,tentativas:fim?0:3}).then(function(j){if(j&&j.ok)ls('edu_rbx_ts',sess.login+':'+ts);return j});
}
function salvarTudo(fim){
 var ps=[pushNow(fim),pushRbx(fim)];
 return Promise.all(ps).then(function(){return true},function(){return false});
}
/* salvamento imediato (fim de fase/atividade, mudança de saldo): não espera o intervalo de 8 s */
function salvarJa(){if(!sess||sess.local)return Promise.resolve();if(!syncOn){mark();return pushRbx(false)}return salvarTudo(false)}
function mark(){if(!canSync()||merging)return;clearTimeout(dirtyT);dirtyT=setTimeout(function(){pushNow(false);pushRbx(false)},8000)}
(function hook(){
 try{var _s=Storage.prototype.setItem,_r=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(k){var r=_s.apply(this,arguments);try{if(this===localStorage&&mirrored(k))mark()}catch(e){}return r};
  Storage.prototype.removeItem=function(k){var r=_r.apply(this,arguments);try{if(this===localStorage&&mirrored(k))mark()}catch(e){}return r};
 }catch(e){}
 addEventListener('pagehide',function(){if(dirtyT)pushNow(true);pushRbx(true)});
 document.addEventListener('visibilitychange',function(){if(document.hidden){if(dirtyT)pushNow(true);pushRbx(true)}else tick()});
})();
/* traz a nuvem: chave a chave; valores com _ts (ex.: robiox_v2_<login>) só são trocados se a cópia da nuvem for MAIS NOVA */
function pull(semRbx){
 if(!sess||sess.local||!sess.t)return Promise.resolve(false);
 if(ls('edu_nuvem_login')!==sess.login){clearLocalMirror();ls('edu_nuvem_ts','0');ls('edu_nuvem_login',sess.login)}
 return api('nuvemcarregar',{login:sess.login,t:sess.t,k:'edu'},{tentativas:2}).then(function(j){
  if(!j||!j.ok){if(j&&j.net)syncOn=true;return false}   /* sem servidor: segue local e sincroniza depois (ts local vence) */
  syncOn=true;
  var lts=+ls('edu_nuvem_ts')||0,cts=+j.ts||0,ch=0,maisNovo=0;
  if(j.v&&cts>lts){
   var v=j.v;try{if(typeof v==='string')v=JSON.parse(v)}catch(e){v=null}
   if(v&&typeof v==='object'){merging=true;try{for(var k in v){if(!mirrored(k))continue;var loc=localStorage.getItem(k);if(loc===v[k])continue;
      if(/^robiox_v2_/.test(k)){if(semRbx)continue;var tl=tsDe(loc),tc=tsDe(v[k]);if(loc&&tl>=tc){maisNovo=1;continue}}
      localStorage.setItem(k,v[k]);ch++}}catch(e){}merging=false;ls('edu_nuvem_ts',String(cts));if(maisNovo)mark()}
  }else if(!j.v||cts<=lts){mark()}
  return ch>0;
 });
}
function pullEReload(){
 return pull().then(function(ch){
  if(ch){var ult=0;try{ult=+sessionStorage.getItem('edu_auth_rl')||0}catch(e){}
   if(Date.now()-ult>20000){try{sessionStorage.setItem('edu_auth_rl',String(Date.now()))}catch(e){}location.reload();return true}}
  return false});
}

/* ---------- validade da sessão (1h40): aviso 5 min antes, salvar e pedir login ao expirar ---------- */
var vigT=0,avisado=0,saindo=false;
function restante(){return sess?sess.exp-Date.now():0}
function fmtRest(ms){var m=Math.max(0,Math.ceil(ms/6e4));return m>=60?Math.floor(m/60)+'h'+('0'+m%60).slice(-2):m+' min'}
function vigia(){if(vigT)return;vigT=setInterval(tick,15000);tick()}
function tick(){
 if(!sess||sess.mestre||saindo)return;
 try{var s2=JSON.parse(localStorage.getItem('edu_sess')||'null');if(s2&&s2.login===sess.login&&s2.exp>sess.exp&&s2.t){sess=s2}}catch(e){}  /* renovada em outra aba */
 var r=restante();
 if(r<=0){expirar();return}
 if(r<=AVISO_MS&&avisado!==sess.exp){avisado=sess.exp;toast(MSG_AVISO,9000);try{window.dispatchEvent(new CustomEvent('edu-sessao-aviso',{detail:{login:sess.login,restante:r}}))}catch(e){}salvarTudo(false)}
 var t=document.getElementById('edu-conta-t');if(t)t.textContent='⏱ Sessão: '+fmtRest(r)+' restantes';
}
function expirar(){
 if(saindo||!sess)return;saindo=true;var L=sess.login,done=false;
 try{window.dispatchEvent(new CustomEvent('edu-sessao-fim',{detail:{login:L}}))}catch(e){}   /* RobIox e outros salvam o que têm em memória */
 var go=function(){if(done)return;done=true;
  wr(null);ready=false;syncOn=false;clearTimeout(dirtyT);dirtyT=0;   /* dados locais ficam; a próxima entrada mescla pelo ts */
  try{sessionStorage.setItem('edu_fim',JSON.stringify({msg:MSG_FIM,login:L}))}catch(e){}
  if(NOUI){location.reload();return}
  saindo=false;telaLogin(MSG_FIM,L);
 };
 setTimeout(function(){pushing=false;salvarTudo(false).then(function(){setTimeout(go,400)},go)},700);   /* dá tempo ao jogo de gravar o estado */
 setTimeout(go,25000);
}
function toast(t,ms){
 try{css();var o=document.getElementById('edu-toast');if(o)o.remove();o=el('<div id="edu-toast" role="status" aria-live="polite"></div>');o.textContent=t;
  (document.body||document.documentElement).appendChild(o);setTimeout(function(){if(o.parentNode)o.remove()},ms||6000)}catch(e){}
}

/* ---------- interface ---------- */
var CSS='#edu-gate,#edu-gate *{box-sizing:border-box}#edu-gate{position:fixed;inset:0;z-index:2147483647;background:linear-gradient(160deg,#0b1020,#1b2a5a);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Segoe UI",Arial,sans-serif;overflow:auto}'
+'#edu-gate .gb{width:min(100%,380px);background:#fff;border-radius:18px;padding:22px 20px;box-shadow:0 10px 40px #000a;text-align:center;color:#16213a}'
+'#edu-gate .gl{font:900 28px Georgia,serif;letter-spacing:.5px}#edu-gate h2{margin:.2em 0 .1em;font-size:22px}#edu-gate p.s{margin:0 0 10px;color:#555;font-size:14px}'
+'#edu-gate label{display:block;text-align:left;font:700 13px Arial;margin:8px 0 3px}#edu-gate input{width:100%;box-sizing:border-box;font:700 18px Arial;padding:10px;border:2px solid #cbd5e1;border-radius:10px;background:#fff;color:#111}'
+'#edu-gate input:focus{outline:3px solid #93b4ff;border-color:#1f4fd8}#edu-gate .pw{position:relative}#edu-gate .pw button{position:absolute;right:4px;top:4px;height:38px;width:42px;border:0;background:transparent;font-size:18px;cursor:pointer}'
+'#edu-gate .go{width:100%;margin-top:14px;padding:12px;border:0;border-radius:12px;background:#1f4fd8;color:#fff;font:800 17px Arial;cursor:pointer}#edu-gate .go:disabled{opacity:.6;cursor:wait}'
+'#edu-gate .lk{background:none;border:0;color:#1f4fd8;font:700 13px Arial;margin-top:10px;cursor:pointer;text-decoration:underline}#edu-gate .er{color:#c62828;font:700 14px Arial;min-height:20px;margin-top:8px}#edu-gate .er.info{color:#1f4fd8}'
+'#edu-conta-m{position:fixed;top:calc(var(--eh,56px) + 6px);right:12px;z-index:2147483001;background:#fff;color:#16213a;border:2px solid #1f4fd8;border-radius:16px;padding:12px 14px;box-shadow:0 12px 32px #0004;font:700 14px "Segoe UI",Arial,sans-serif;min-width:200px;display:none}'
+'#edu-conta-m.on{display:block}#edu-conta-m b{display:block;margin-bottom:4px}#edu-conta-m small{display:block;color:#555;font:600 12px Arial;margin-bottom:6px}#edu-conta-m button{display:block;width:100%;margin-top:6px;border:2px solid #cfd8ec;background:#f4f7fc;color:#16213a;border-radius:10px;padding:8px;font:800 14px Arial;cursor:pointer}'
+'#edu-conta-f{position:fixed;left:8px;bottom:8px;z-index:2147483001;border:0;border-radius:99px;background:#16213acc;color:#fff;font:800 13px Arial;padding:6px 12px;cursor:pointer}'
+'#edu-toast{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483646;max-width:min(92vw,460px);background:#16213aee;color:#fff;font:700 14px "Segoe UI",Arial,sans-serif;padding:10px 16px;border-radius:12px;box-shadow:0 6px 20px #0005;text-align:center}'
+'@media print{#edu-gate,#edu-conta-m,#edu-conta-f,#edu-toast{display:none!important}}';
function css(){if(document.getElementById('edu-gate-css'))return;var s=document.createElement('style');s.id='edu-gate-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}
function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
function gate(html){css();var g=document.getElementById('edu-gate');if(g)g.remove();g=el('<div id="edu-gate" role="dialog" aria-modal="true"><div class="gb">'+html+'</div></div>');
 ['keydown','keyup','keypress'].forEach(function(t){g.addEventListener(t,function(e){e.stopPropagation()})});
 document.documentElement.appendChild(g);try{if(document.body)document.body.setAttribute('inert','')}catch(e){}return g}
function fecha(){var g=document.getElementById('edu-gate');if(g)g.remove();try{if(document.body)document.body.removeAttribute('inert')}catch(e){}}
function pwf(id,lab,ac){return '<label for="'+id+'">'+lab+'</label><div class="pw"><input id="'+id+'" type="password" autocomplete="'+ac+'"><button type="button" data-ver="'+id+'" aria-label="Mostrar senha">👁</button></div>'}
function ver(g){g.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ver]');if(!b)return;var i=g.querySelector('#'+b.dataset.ver);i.type=i.type==='password'?'text':'password'})}

function telaLogin(msg,preL){
 aquecer();
 var g=gate('<div class="gl">Ludopédia</div><h2>Entrar</h2><p class="s">Use o login do RCO (ex.: <b>7cla6b</b>) e a sua senha. A senha é a da turma.</p>'
  +'<form id="gf" autocomplete="on"><label for="gu">Login</label><input id="gu" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ex.: 7cla6b" inputmode="text">'
  +pwf('gp','Senha','current-password')+'<button class="go" type="submit">▶ Entrar</button></form><div class="er" id="ge" aria-live="polite"></div>');
 ver(g);var $=function(i){return g.querySelector('#'+i)};$('ge').textContent=msg||'';
 var pre=preL||'';try{pre=pre||new URLSearchParams(location.search).get('l')||ls('edu_login')||''}catch(e){}if(RE.test(pre))$('gu').value=pre;
 setTimeout(function(){($('gu').value?$('gp'):$('gu')).focus()},50);
 $('gf').onsubmit=function(e){e.preventDefault();var b=g.querySelector('.go');b.disabled=true;b.textContent='⏳ Entrando…';$('ge').textContent='';$('ge').className='er info';
  entrar($('gu').value,$('gp').value,function(n){$('ge').textContent='Conectando ao servidor… (tentativa '+n+')'}).then(function(j){
   $('ge').className='er';
   if(!j||!j.ok){b.disabled=false;b.textContent='▶ Entrar';$('ge').textContent=(j&&j.erro)||'Não foi possível entrar.';return}
   try{sessionStorage.removeItem('edu_fim')}catch(e){}
   liberar(true)})};
}
function liberar(novo){
 fecha();preencheIdentidade();ready=true;
 if(novo&&!(sess&&sess.local)){
  var g=gate('<div class="gl">Ludopédia</div><h2>Carregando…</h2><p class="s">Buscando o seu progresso salvo.</p>');
  pull().then(function(ch){fecha();if(ch)location.reload();else fim()},function(){fecha();fim()});
  setTimeout(function(){if(document.getElementById('edu-gate')){fecha();fim()}},12000);
 }else fim();
}
function fim(){
 if(sess&&!sess.local)syncOn=true;
 if(document.body)contaBtn();else document.addEventListener('DOMContentLoaded',contaBtn);
 vigia();
 var l=cbs;cbs=[];l.forEach(function(f){try{f(sess)}catch(e){}});
 try{window.dispatchEvent(new CustomEvent('edu-auth-ready',{detail:{login:sess&&sess.login}}))}catch(e){}
}
function contaBtn(){
 if(NOUI||!sess||document.getElementById('edu-conta-b')||document.getElementById('edu-conta-f'))return;css();
 var t0=Date.now(),L=sess.login;
 function menu(btn){var m=document.getElementById('edu-conta-m');if(!m){m=el('<div id="edu-conta-m"><b></b><small id="edu-conta-t"></small><button type="button" data-a="x">🚪 Sair</button></div>');
  m.querySelector('b').textContent=(sess.mestre?'Professor':sess.login==='teste'||sess.login==='mainara'?'Conta de teste':'Conta ')+(sess.mestre||sess.local?' ('+sess.login+')':' '+sess.login);
  m.onclick=function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(a==='x')sair()};document.body.appendChild(m);
  document.addEventListener('pointerdown',function(e){if(m.classList.contains('on')&&!m.contains(e.target)&&e.target!==btn)m.classList.remove('on')},true)}
  var t=m.querySelector('#edu-conta-t');if(t)t.textContent=sess&&!sess.mestre?'⏱ Sessão: '+fmtRest(restante())+' restantes':'';
  m.classList.toggle('on')}
 (function tenta(){
  var nav=document.getElementById('edu-nav');
  if(nav){var b=el('<button type="button" class="ac" id="edu-conta-b" aria-label="Minha conta" title="Conta: '+L+'">👤</button>');var r=document.getElementById('en-r');nav.insertBefore(b,r||nav.firstChild);b.onclick=function(){menu(b)};return}
  if(Date.now()-t0<4000)return setTimeout(tenta,300);
  var f=el('<button type="button" id="edu-conta-f">👤 '+L+'</button>');document.body.appendChild(f);f.onclick=function(){menu(f)};
 })();
}
/* Um único lugar pede login: apps (Boletim/Classificação) chamam isto quando o servidor recusa a sessão. */
function pedirLogin(msg,cb){
 if(cb)cbs.push(cb);
 if(document.getElementById('edu-gate'))return;
 var L=sess&&sess.login;if(sess&&!sess.mestre&&!sess.local){wr(null);ready=false}
 if(NOUI){try{sessionStorage.setItem('edu_fim',JSON.stringify({msg:msg||'Entre de novo para continuar.',login:L||''}))}catch(e){}location.reload();return}
 telaLogin(msg||'Entre de novo para continuar.',L);
}

/* ---------- entrada por QR (?l=login) ---------- */
function loginQR(){try{var l=norm(new URLSearchParams(location.search).get('l'));return RE.test(l)?l:''}catch(e){return ''}}
function limpaParamL(){try{var u=new URL(location.href);if(u.searchParams.has('l')){u.searchParams.delete('l');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash)}}catch(e){}}
/* ---------- partida ---------- */
function iniciar(){
 var ql=loginQR();
 if(ql&&!(sess&&(sess.login===ql||sess.mestre))){
  if(sess){salvarTudo(true);clearLocalMirror();wr(null);ls('edu_nuvem_login',null);ls('edu_nuvem_ts',null)}
  var cur=ql;limpaParamL();
  var gq=NOUI?null:gate('<div class="gl">Ludopédia</div><h2>Entrando…</h2><p class="s" id="gqs">Aguarde um instante.</p>');
  entrar(cur,SENHA_FIXA,function(n){var s=gq&&gq.querySelector('#gqs');if(s)s.textContent='Conectando ao servidor… (tentativa '+n+')'}).then(function(j){
   if(j&&j.ok){if(NOUI){ready=true;syncOn=false;if(!(sess&&sess.local))syncOn=true;fim();try{window.dispatchEvent(new CustomEvent('edu-auth-qr',{detail:{login:cur}}))}catch(e){}location.reload();return}liberar(true);return}
   if(NOUI){return}
   telaLogin((j&&j.erro)||'Não foi possível entrar pelo QR. Digite a senha.',cur)});
  return;
 }
 if(ql)limpaParamL();
 if(sess){
  if(sess.local){if(!NOUI)liberar(false);else{ready=true;fim()}return}
  if(sess.trocar){sess.trocar=0;wr(sess)}
  ready=true;if(!NOUI)preencheIdentidade();
  quem().then(function(j){
   if(j&&j.ok){if(j.turma&&sess&&sess.turma!==j.turma){sess.turma=j.turma;wr(sess)}
    if(!NOUI)pullEReload().then(function(){});else pull(true);fim();return}
   if(!(j&&j.relogin)){syncOn=true;fim();return}     /* servidor fora/ocupado: modo local enquanto a sessão for válida (não pede login) */
   var L=sess&&sess.login;wr(null);ready=false;if(NOUI){location.reload();return}telaLogin('Sua sessão terminou. Entre de novo.',L)});
  return;
 }
 aquecer();
 if(NOUI)return;
 var fm=null;try{fm=JSON.parse(sessionStorage.getItem('edu_fim')||'null')}catch(e){}
 telaLogin(fm&&fm.msg||'',fm&&fm.login||'');
}
window.EDU_AUTH={
 onReady:function(f){if(ready)try{f(sess)}catch(e){}else cbs.push(f)},
 sessao:function(){return sess},login:function(){return sess?sess.login:''},token:function(){return sess&&sess.t||''},
 entrar:entrar,quem:quem,sair:function(){if(NOUI){salvarTudo(true);wr(null);ls('edu_nuvem_login',null)}else sair()},
 api:api,hash:hash,pull:pull,push:function(){return pushNow(false)},turmaDe:turmaDe,
 salvarJa:salvarJa,salvarTudo:salvarTudo,restante:restante,validadeMin:SESS_MIN,aquecer:aquecer,pedirLogin:pedirLogin,
 trocaForcada:function(ok){if(ok)ok()},
 telaLogin:telaLogin,fecha:fecha,
 reg:RE,especial:RESP
};
if(NOUI){ready=!!sess;if(sess&&!sess.local)syncOn=false;if(sess)vigia()}
if(document.body||NOUI)iniciar();else document.addEventListener('DOMContentLoaded',iniciar);
})();
