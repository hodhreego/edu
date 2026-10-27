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
