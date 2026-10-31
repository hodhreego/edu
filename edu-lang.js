/* Voz sempre no idioma do texto: detecta pt/en/es/fr/it pelo que está escrito; se não tiver certeza, usa o idioma padrão do jogo. */
(function(){
 var W={
  pt:'o a os as um uma de do da dos das em no na nos nas que para por com não é são está está você nós eu ele ela mais menos reais por cento qual quanto quantos escreva',
  en:'the a an of to in on at is are was were be you i he she it we they my your his her this that with for and what where how many please',
  es:'el la los las un una de del en que es son está estás con por para tu mi su yo nosotros qué dónde cómo muy encima debajo',
  fr:'le la les un une des du de en que est sont avec pour sur sous dans vous je tu il elle nous qui où comment très devant derrière',
  de:'der die das und ist sind nicht ein eine mit von zu im auf dem den ich du wir ball kiste',
  it:'il lo la gli le un una di del della in che è sono con per su sotto sopra dentro voi io tu lui lei noi dove come molto davanti dietro'};
 var L={pt:'pt-BR',en:'en-US',es:'es-ES',fr:'fr-FR',it:'it-IT',de:'de-DE'},SET={};
 Object.keys(W).forEach(function(k){SET[k]={};W[k].split(' ').forEach(function(w){SET[k][w]=1})});
 var CH={pt:/[ãõç]/,es:/[ñ¿¡]/,fr:/[àèùâêîôûœ]|ç(?!ã)/,it:/[ìò]/,de:/[äöüß]/};
 window.EDU_LANG=function(t,def){
  var d=(def||'en-US').slice(0,2).toLowerCase(),w=String(t).toLowerCase().match(/[a-zà-ÿ¿¡]+/g)||[];
  if(!w.length)return def;
  var sc={pt:0,en:0,es:0,fr:0,it:0,de:0};
  w.forEach(function(x){Object.keys(sc).forEach(function(k){if(SET[k][x])sc[k]++})});
  Object.keys(CH).forEach(function(k){if(CH[k].test(t))sc[k]+=1.5});
  var best=d,bs=sc[d]||0;
  Object.keys(sc).forEach(function(k){if(sc[k]>bs+.5){best=k;bs=sc[k]}});
  /* uma única palavra sem pista: mantém o idioma do jogo */
  return L[best]||def;
 };
 var VC={};
 window.EDU_VOICE=function(lang){
  if(VC[lang])return VC[lang];
  var vs=(window.speechSynthesis&&speechSynthesis.getVoices())||[],p=lang.slice(0,2).toLowerCase(),c=vs.filter(function(v){return v.lang&&v.lang.slice(0,2).toLowerCase()===p});
  if(!c.length)return null;
  var pref=c.filter(function(v){return v.lang.replace('_','-').toLowerCase()===lang.toLowerCase()});if(pref.length)c=pref;
  var nat=c.filter(function(v){return /natural|online|google|neural/i.test(v.name)});
  var r=(nat[0]||c[0]);VC[lang]=r;return r;
 };
 if(window.speechSynthesis)speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',function(){VC={}});
})();

/* ===== Voz: perfis (feminina, masculina, infantil, personagens) e correção do começo cortado ===== */
(function(){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance||window.__eduVoz)return;window.__eduVoz=1;
 var PERF={
  auto:{n:'🔊 Padrão do aparelho',p:1,r:1},
  fem:{n:'👩 Feminina',g:'f',p:1.05,r:.95},
  masc:{n:'👨 Masculina',g:'m',p:.9,r:.95},
  crianca:{n:'🧒 Infantil (menina)',g:'f',p:1.6,r:.92},
  menino:{n:'👦 Infantil (menino)',g:'m',p:1.45,r:.95},
  fada:{n:'🧚 Personagem: fada',g:'f',p:1.95,r:1.05},
  gigante:{n:'🧌 Personagem: gigante',g:'m',p:.45,r:.8},
  robo:{n:'🤖 Personagem: robô',g:'m',p:.7,r:.9}
 };
 var FEM=/maria|francisca|luciana|vit[oó]ria|helena|female|feminin|fernanda|raquel|thalita|brenda|camila|yara|giovanna|isabela|sabrina|zira|samantha|google portugu/i,
     MAS=/antonio|ant[oô]nio|daniel|felipe|male|masculin|donato|humberto|jorge|julio|valerio|leonardo|nicolau|david|mark|ricardo|paulo/i;
 function perfil(){var k='auto';try{k=localStorage.getItem('edu_voz')||'auto'}catch(e){}return PERF[k]?k:'auto'}
 function escolhe(lang,g){
  var vs=speechSynthesis.getVoices()||[],p=lang.slice(0,2).toLowerCase();
  var c=vs.filter(function(v){return v.lang&&v.lang.slice(0,2).toLowerCase()===p});
  if(!c.length)return null;
  var bl=c.filter(function(v){return v.lang.replace('_','-').toLowerCase()===lang.toLowerCase()});if(bl.length)c=bl;
  if(g){var re=g==='f'?FEM:MAS,x=c.filter(function(v){return re.test(v.name)});
   if(g==='m'&&!x.length)x=c.filter(function(v){return !FEM.test(v.name)&&c.length>1});
   if(x.length)c=x}
  var nat=c.filter(function(v){return /natural|online|neural/i.test(v.name)});
  return nat[0]||c[0];
 };
 var orig=speechSynthesis.speak.bind(speechSynthesis),origCancel=speechSynthesis.cancel.bind(speechSynthesis),ult=0;
 speechSynthesis.cancel=function(){ult=Date.now();return origCancel()};
 speechSynthesis.speak=function(u){
  if(u&&u.__edu)return orig(u);
  try{
   var P=PERF[perfil()];
   if(u&&u.text){
    /* o motor corta o início logo depois de cancelar/abrir: adiciona uma pausa curta antes do texto */
    var n=new SpeechSynthesisUtterance(' , '+u.text);
    n.__edu=1;n.lang=u.lang||'pt-BR';n.volume=u.volume;n.rate=(u.rate||1)*P.r;n.pitch=P.p;
    var v=u.voice||escolhe(n.lang,P.g);if(P.g||!u.voice){var v2=escolhe(n.lang,P.g);if(v2)v=v2}
    if(v)n.voice=v;
    ['onend','onstart','onerror','onboundary'].forEach(function(k){if(u[k])n[k]=u[k]});
    var falta=Math.max(0,180-(Date.now()-ult));
    if(falta)setTimeout(function(){orig(n)},falta);else orig(n);
    return;
   }
  }catch(e){}
  orig(u);
 };
 function ui(){
  var ac=document.getElementById('edu-ac');if(!ac||ac.querySelector('#en-voz'))return false;
  var d=document.createElement('div');d.className='r';d.style.cssText='flex-direction:column;align-items:stretch;gap:4px';
  d.innerHTML='<label for="en-voz" style="font:700 13px Arial">🗣️ Voz de leitura</label><select id="en-voz" style="font:700 15px Arial;padding:8px;border-radius:10px;border:2px solid #90A4AE;min-height:44px"></select><button type="button" id="en-voz-t">▶ Testar voz</button>';
  var s=d.querySelector('select');
  Object.keys(PERF).forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=PERF[k].n;if(k===perfil())o.selected=true;s.appendChild(o)});
  s.onchange=function(){try{localStorage.setItem('edu_voz',s.value)}catch(e){}testa()};
  d.querySelector('#en-voz-t').onclick=testa;
  function testa(){try{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance('Olá! Eu vou ler as atividades para você.'))}catch(e){}}
  ac.appendChild(d);return true;
 }
 var tent=0;(function t(){if(!ui()&&tent++<40)setTimeout(t,250)})();
})();
