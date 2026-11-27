/* PORTEIRO do aluno (Ludopédia/EduBank): login + senha ANTES de qualquer atividade, sessão por token, troca de senha,
   espelho em nuvem do localStorage. Carregado por menu.js (jogos) e por robiox.html (modo sem tela: window.EDU_AUTH_NOUI=1).
   Globais: EDU_LOGIN() / EDU_TOKEN() (funções), EDU_AUTH. Nunca grava senha em texto: só o hash SHA-256 de login:senha:edu. */
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
var SENHA_FIXA='2026.2026',DIAS30=30*864e5,ready=false,cbs=[],sess=null;

function ep(){return window.EDU_ENDPOINT||''}
function norm(u){return String(u||'').trim().toLowerCase().replace(/\s+/g,'')}
function turmaDe(l){return String(l||'').replace(/^\d+/,'')}
function numDe(l){var m=String(l||'').match(/^\d+/);return m?m[0]:''}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}return null}

/* ---------- sessão ---------- */
function rd(){try{var s=JSON.parse(localStorage.getItem('edu_sess'));return s&&RESP.test(s.login)&&s.exp>Date.now()?s:null}catch(e){return null}}
function wr(s){
 sess=s||null;
 if(s){ls('edu_sess',JSON.stringify(s));ls('edu_login',s.login)}else{ls('edu_sess',null);ls('edu_login',null)}
 try{if(s){sessionStorage.setItem('rbx_login',s.login);sessionStorage.setItem('rbx_ok','1');if(s.mestre)sessionStorage.setItem('rbx_master','1');else sessionStorage.removeItem('rbx_master')}
  else{sessionStorage.removeItem('rbx_login');sessionStorage.removeItem('rbx_ok');sessionStorage.removeItem('rbx_master');sessionStorage.removeItem('edu_idok')}}catch(e){}
}
sess=rd();
window.EDU_LOGIN=function(){return sess?sess.login:''};
window.EDU_TOKEN=function(){return sess&&sess.t||''};

/* ---------- rede ---------- */
function api(acao,p,o){
 o=o||{};var u=ep();if(!u)return Promise.resolve({ok:0,net:1,erro:'Sem endereço do servidor.'});
 var q='?acao='+encodeURIComponent(acao);
 for(var k in (p||{}))if(p[k]!==undefined&&p[k]!==null)q+='&'+encodeURIComponent(k)+'='+encodeURIComponent(p[k]);
 var ac=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ac)ac.abort()},o.timeout||10000);
 var opt={keepalive:!!o.keepalive};if(ac)opt.signal=ac.signal;
 var big=o.post||(u+q).length>7000;
 if(big){var body={acao:acao};for(var k2 in (p||{}))body[k2]=p[k2];opt.method='POST';opt.headers={'Content-Type':'text/plain'};opt.body=JSON.stringify(body);u=u}
 else u=u+q;
 return fetch(u,opt).then(function(r){return r.json()}).then(function(j){clearTimeout(tm);return j||{ok:0,erro:'Resposta vazia.'}},function(){clearTimeout(tm);return{ok:0,net:1,erro:'Sem conexão com o servidor.'}});
}
function hash(login,senha){
 if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('nocrypto'));
 return crypto.subtle.digest('SHA-256',new TextEncoder().encode(login+':'+senha+':edu')).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return('0'+x.toString(16)).slice(-2)}).join('')});
}

/* ---------- entrar / quem / senha ---------- */
function entrar(u,p){
 u=norm(u);p=String(p||'');
 if((u==='teste'&&p==='teste')||(u==='mainara'&&p==='mainara')){wr({login:u,t:'',local:1,exp:Date.now()+DIAS30,turma:'',trocar:0});return Promise.resolve({ok:1,local:1,trocar:0})}
 if(u===MESTRA||p===MESTRA){var l=RE.test(u)?u:'mestre';wr({login:l,t:'',local:1,mestre:1,exp:Date.now()+12*36e5,turma:turmaDe(l),trocar:0});return Promise.resolve({ok:1,local:1,mestre:1,trocar:0})}
 if(!RE.test(u))return Promise.resolve({ok:0,erro:'Login inválido. Use o formato do RCO, ex.: 7cla6b.'});
 if(!p)return Promise.resolve({ok:0,erro:'Digite a senha.'});
 /* servidor fora do ar/desatualizado: a senha da turma entra direto (sessão local, sem token) */
 var semServ=function(){if(p===SENHA_FIXA){wr({login:u,t:'',local:1,exp:Date.now()+DIAS30,turma:turmaDe(u),trocar:0});return{ok:1,local:1,trocar:0}}return null};
 if(!(window.crypto&&crypto.subtle)){var r0=semServ();if(r0)return Promise.resolve(r0)}
 return hash(u,p).then(function(h){return api('entrar',{login:u,h:h}).then(function(j){
  if(j&&j.ok&&!j.token)return semServ()||{ok:0,erro:'Servidor ainda nao atualizado (login indisponivel). Fale com o professor.'};
  if(j&&!j.ok&&(j.net||!j.erro||/desconhec|a[cç][aã]o|servidor|erro interno|exception/i.test(j.erro)))return semServ()||{ok:0,net:j.net,erro:'Servidor ainda nao atualizado ou sem conexao. Somente o professor (senha mestra) consegue entrar agora.'};
  if(j&&j.ok&&j.token){j.trocar=0;wr({login:u,t:j.token,exp:Date.now()+DIAS30,turma:j.turma||turmaDe(u)})}
  return j})},function(){return{ok:0,erro:'Este navegador não permite entrar (precisa de https).'}});
}
function quem(){return sess&&!sess.local?api('quem',{login:sess.login,t:sess.t}):Promise.resolve({ok:1,local:1})}
function sair(){
 var go=function(){clearLocalMirror();wr(null);ls('edu_nuvem_login',null);ls('edu_nuvem_ts',null);try{sessionStorage.removeItem('edu_idok')}catch(e){}location.reload()};
 pushNow(true);setTimeout(go,300);
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
var EXC={edu_sess:1,edu_login:1,edu_resultados:1,edu_nuvem_ts:1,edu_nuvem_login:1,edu_nome:1,edu_turma:1,edu_escola:1,edu_data:1};
function mirrored(k){return typeof k==='string'&&!EXC[k]&&(/^(edu_|pc47_|at32_|pm37_|cr38_|apt_|colmeia|vocab_)/.test(k)||(!!sess&&k==='robiox_v2_'+sess.login))}
var merging=false,dirtyT=0,syncOn=false,pushing=false;
function snap(){
 var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(mirrored(k))o[k]=localStorage.getItem(k)}}catch(e){}
 var s=JSON.stringify(o);
 while(s.length>40000){var big=null,bl=0;for(var k2 in o)if(o[k2].length>bl){bl=o[k2].length;big=k2}if(!big)break;delete o[big];s=JSON.stringify(o)}
 return s;
}
function clearLocalMirror(){merging=true;try{var ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(mirrored(k))ks.push(k)}ks.forEach(function(k){localStorage.removeItem(k)})}catch(e){}merging=false}
function canSync(){return sess&&!sess.local&&sess.t&&syncOn}
function pushNow(fim){
 if(!canSync()||pushing&&!fim)return Promise.resolve();
 clearTimeout(dirtyT);dirtyT=0;pushing=true;var ts=Date.now();
 return api('nuvemsalvar',{login:sess.login,t:sess.t,k:'edu',ts:ts,v:snap()},{keepalive:!!fim,post:true}).then(function(j){pushing=false;if(j&&j.ok)ls('edu_nuvem_ts',String(ts));return j});
}
function mark(){if(!canSync()||merging)return;clearTimeout(dirtyT);dirtyT=setTimeout(function(){pushNow(false)},8000)}
(function hook(){
 try{var _s=Storage.prototype.setItem,_r=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(k){var r=_s.apply(this,arguments);try{if(this===localStorage&&mirrored(k))mark()}catch(e){}return r};
  Storage.prototype.removeItem=function(k){var r=_r.apply(this,arguments);try{if(this===localStorage&&mirrored(k))mark()}catch(e){}return r};
 }catch(e){}
 addEventListener('pagehide',function(){if(dirtyT)pushNow(true)});
 document.addEventListener('visibilitychange',function(){if(document.hidden&&dirtyT)pushNow(true)});
})();
function pull(){
 if(!sess||sess.local||!sess.t)return Promise.resolve(false);
 if(ls('edu_nuvem_login')!==sess.login){clearLocalMirror();ls('edu_nuvem_ts','0');ls('edu_nuvem_login',sess.login)}
 return api('nuvemcarregar',{login:sess.login,t:sess.t,k:'edu'}).then(function(j){
  syncOn=true;
  if(!j||!j.ok)return false;
  var lts=+ls('edu_nuvem_ts')||0,cts=+j.ts||0,ch=0;
  if(j.v&&cts>lts){
   var v=j.v;try{if(typeof v==='string')v=JSON.parse(v)}catch(e){v=null}
   if(v&&typeof v==='object'){merging=true;try{for(var k in v)if(mirrored(k)&&localStorage.getItem(k)!==v[k]){localStorage.setItem(k,v[k]);ch++}}catch(e){}merging=false;ls('edu_nuvem_ts',String(cts))}
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

/* ---------- interface ---------- */
var CSS='#edu-gate,#edu-gate *{box-sizing:border-box}#edu-gate{position:fixed;inset:0;z-index:2147483647;background:linear-gradient(160deg,#0b1020,#1b2a5a);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Segoe UI",Arial,sans-serif;overflow:auto}'
+'#edu-gate .gb{width:min(100%,380px);background:#fff;border-radius:18px;padding:22px 20px;box-shadow:0 10px 40px #000a;text-align:center;color:#16213a}'
+'#edu-gate .gl{font:900 28px Georgia,serif;letter-spacing:.5px}#edu-gate h2{margin:.2em 0 .1em;font-size:22px}#edu-gate p.s{margin:0 0 10px;color:#555;font-size:14px}'
+'#edu-gate label{display:block;text-align:left;font:700 13px Arial;margin:8px 0 3px}#edu-gate input{width:100%;box-sizing:border-box;font:700 18px Arial;padding:10px;border:2px solid #cbd5e1;border-radius:10px;background:#fff;color:#111}'
+'#edu-gate input:focus{outline:3px solid #93b4ff;border-color:#1f4fd8}#edu-gate .pw{position:relative}#edu-gate .pw button{position:absolute;right:4px;top:4px;height:38px;width:42px;border:0;background:transparent;font-size:18px;cursor:pointer}'
+'#edu-gate .go{width:100%;margin-top:14px;padding:12px;border:0;border-radius:12px;background:#1f4fd8;color:#fff;font:800 17px Arial;cursor:pointer}#edu-gate .go:disabled{opacity:.6;cursor:wait}'
+'#edu-gate .lk{background:none;border:0;color:#1f4fd8;font:700 13px Arial;margin-top:10px;cursor:pointer;text-decoration:underline}#edu-gate .er{color:#c62828;font:700 14px Arial;min-height:20px;margin-top:8px}'
+'#edu-conta-m{position:fixed;top:calc(var(--eh,56px) + 6px);right:12px;z-index:2147483001;background:#fff;color:#16213a;border:2px solid #1f4fd8;border-radius:16px;padding:12px 14px;box-shadow:0 12px 32px #0004;font:700 14px "Segoe UI",Arial,sans-serif;min-width:200px;display:none}'
+'#edu-conta-m.on{display:block}#edu-conta-m b{display:block;margin-bottom:8px}#edu-conta-m button{display:block;width:100%;margin-top:6px;border:2px solid #cfd8ec;background:#f4f7fc;color:#16213a;border-radius:10px;padding:8px;font:800 14px Arial;cursor:pointer}'
+'#edu-conta-f{position:fixed;left:8px;bottom:8px;z-index:2147483001;border:0;border-radius:99px;background:#16213acc;color:#fff;font:800 13px Arial;padding:6px 12px;cursor:pointer}'
+'@media print{#edu-gate,#edu-conta-m,#edu-conta-f{display:none!important}}';
function css(){if(document.getElementById('edu-gate-css'))return;var s=document.createElement('style');s.id='edu-gate-css';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}
function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
function gate(html){css();var g=document.getElementById('edu-gate');if(g)g.remove();g=el('<div id="edu-gate" role="dialog" aria-modal="true"><div class="gb">'+html+'</div></div>');
 ['keydown','keyup','keypress'].forEach(function(t){g.addEventListener(t,function(e){e.stopPropagation()})});
 document.documentElement.appendChild(g);try{if(document.body)document.body.setAttribute('inert','')}catch(e){}return g}
function fecha(){var g=document.getElementById('edu-gate');if(g)g.remove();try{if(document.body)document.body.removeAttribute('inert')}catch(e){}}
function pwf(id,lab,ac){return '<label for="'+id+'">'+lab+'</label><div class="pw"><input id="'+id+'" type="password" autocomplete="'+ac+'"><button type="button" data-ver="'+id+'" aria-label="Mostrar senha">👁</button></div>'}
function ver(g){g.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ver]');if(!b)return;var i=g.querySelector('#'+b.dataset.ver);i.type=i.type==='password'?'text':'password'})}

function telaLogin(msg){
 var g=gate('<div class="gl">Ludopédia</div><h2>Entrar</h2><p class="s">Use o login do RCO (ex.: <b>7cla6b</b>) e a sua senha. A senha é a da turma.</p>'
  +'<form id="gf" autocomplete="on"><label for="gu">Login</label><input id="gu" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ex.: 7cla6b" inputmode="text">'
  +pwf('gp','Senha','current-password')+'<button class="go" type="submit">▶ Entrar</button></form><div class="er" id="ge" aria-live="polite"></div>');
 ver(g);var $=function(i){return g.querySelector('#'+i)};$('ge').textContent=msg||'';
 var pre='';try{pre=new URLSearchParams(location.search).get('l')||ls('edu_login')||''}catch(e){}if(RE.test(pre))$('gu').value=pre;
 setTimeout(function(){($('gu').value?$('gp'):$('gu')).focus()},50);
 $('gf').onsubmit=function(e){e.preventDefault();var b=g.querySelector('.go');b.disabled=true;b.textContent='⏳ Entrando…';$('ge').textContent='';
  entrar($('gu').value,$('gp').value).then(function(j){
   if(!j||!j.ok){b.disabled=false;b.textContent='▶ Entrar';$('ge').textContent=(j&&j.erro)||'Não foi possível entrar.';if(j&&j.net)$('ge').textContent+=' Verifique a internet e tente de novo.';return}
   liberar(true)})};
}
function liberar(novo){
 fecha();preencheIdentidade();ready=true;
 if(novo&&!(sess&&sess.local)){
  var g=gate('<div class="gl">Ludopédia</div><h2>Carregando…</h2><p class="s">Buscando o seu progresso salvo.</p>');
  pull().then(function(ch){fecha();if(ch)location.reload();else fim()},function(){fecha();fim()});
  setTimeout(function(){if(document.getElementById('edu-gate')){fecha();fim()}},7000);
 }else fim();
}
function fim(){
 if(sess&&!sess.local)syncOn=true;
 if(document.body)contaBtn();else document.addEventListener('DOMContentLoaded',contaBtn);
 var l=cbs;cbs=[];l.forEach(function(f){try{f(sess)}catch(e){}});
 try{window.dispatchEvent(new CustomEvent('edu-auth-ready',{detail:{login:sess&&sess.login}}))}catch(e){}
}
function contaBtn(){
 if(NOUI||document.getElementById('edu-conta-b')||document.getElementById('edu-conta-f'))return;css();
 var t0=Date.now(),L=sess.login;
 function menu(btn){var m=document.getElementById('edu-conta-m');if(!m){m=el('<div id="edu-conta-m"><b></b><button type="button" data-a="x">🚪 Sair</button></div>');
  m.querySelector('b').textContent=(sess.mestre?'Professor':sess.login==='teste'||sess.login==='mainara'?'Conta de teste':'Conta ')+(sess.mestre||sess.local?' ('+sess.login+')':' '+sess.login);
  m.onclick=function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(a==='x')sair()};document.body.appendChild(m);
  document.addEventListener('pointerdown',function(e){if(m.classList.contains('on')&&!m.contains(e.target)&&e.target!==btn)m.classList.remove('on')},true)}
  m.classList.toggle('on')}
 (function tenta(){
  var nav=document.getElementById('edu-nav');
  if(nav){var b=el('<button type="button" class="ac" id="edu-conta-b" aria-label="Minha conta" title="Conta: '+L+'">👤</button>');var r=document.getElementById('en-r');nav.insertBefore(b,r||nav.firstChild);b.onclick=function(){menu(b)};return}
  if(Date.now()-t0<4000)return setTimeout(tenta,300);
  var f=el('<button type="button" id="edu-conta-f">👤 '+L+'</button>');document.body.appendChild(f);f.onclick=function(){menu(f)};
 })();
}

/* ---------- entrada por QR (?l=login) ---------- */
function loginQR(){try{var l=norm(new URLSearchParams(location.search).get('l'));return RE.test(l)?l:''}catch(e){return ''}}
function limpaParamL(){try{var u=new URL(location.href);if(u.searchParams.has('l')){u.searchParams.delete('l');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash)}}catch(e){}}
/* ---------- partida ---------- */
function iniciar(){
 var ql=loginQR();
 if(ql&&!(sess&&(sess.login===ql||sess.mestre))){
  if(sess){clearLocalMirror();wr(null);ls('edu_nuvem_login',null);ls('edu_nuvem_ts',null)}
  var cur=ql;limpaParamL();
  if(!NOUI)gate('<div class="gl">Ludopédia</div><h2>Entrando…</h2><p class="s">Aguarde um instante.</p>');
  entrar(cur,SENHA_FIXA).then(function(j){
   if(j&&j.ok){if(NOUI){ready=true;syncOn=false;if(!(sess&&sess.local))syncOn=true;fim();try{window.dispatchEvent(new CustomEvent('edu-auth-qr',{detail:{login:cur}}))}catch(e){}location.reload();return}liberar(true);return}
   if(NOUI){return}
   telaLogin((j&&j.erro)||'Não foi possível entrar pelo QR. Digite a senha.')});
  return;
 }
 if(ql)limpaParamL();
 if(sess){
  if(sess.local){if(!NOUI)liberar(false);else{ready=true;fim()}return}
  if(sess.trocar){sess.trocar=0;wr(sess)}
  ready=true;if(!NOUI)preencheIdentidade();
  quem().then(function(j){
   if(j&&j.ok){if(j.turma&&sess.turma!==j.turma){sess.turma=j.turma;wr(sess)}if(!NOUI)pullEReload().then(function(){});else syncOn=true;fim();return}
   if(j&&j.net){fim();return}                      /* servidor fora: modo local enquanto a sessão for válida */
   wr(null);ready=false;if(NOUI){location.reload();return}telaLogin('Sua sessão terminou. Entre de novo.')});
  return;
 }
 if(NOUI)return;
 telaLogin();
}
window.EDU_AUTH={
 onReady:function(f){if(ready)try{f(sess)}catch(e){}else cbs.push(f)},
 sessao:function(){return sess},login:function(){return sess?sess.login:''},token:function(){return sess&&sess.t||''},
 entrar:entrar,quem:quem,sair:function(){if(NOUI){wr(null);ls('edu_nuvem_login',null)}else sair()},
 api:api,hash:hash,pull:pull,push:function(){return pushNow(false)},turmaDe:turmaDe,
 trocaForcada:function(ok){if(ok)ok()},
 telaLogin:telaLogin,fecha:fecha,
 reg:RE,especial:RESP
};
if(NOUI){ready=!!sess;if(sess&&!sess.local)syncOn=false}
if(document.body||NOUI)iniciar();else document.addEventListener('DOMContentLoaded',iniciar);
})();
