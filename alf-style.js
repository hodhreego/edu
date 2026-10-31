/* Estilo das ilustrações (acessibilidade): cada aluno escolhe o que prefere. Usa ALF_FIG(chave, alt, px) nas atividades de alfabetização. */
(function(){
 var ES=[['padrao','🖼️ Ilustração do projeto'],['realista','📷 Realista'],['minecraft','⛏️ Minecraft'],['desenho','✏️ Desenho infantil'],['3d','🧸 3D'],['roblox','🟦 Roblox'],['aquarela','🎨 Aquarela'],['pixel','👾 Pixel art'],['massinha','🧩 Massinha'],['estatua','🗿 Estátua de mármore'],['emoji','😀 Emoji']];
 var OK=['padrao','realista','minecraft','desenho','3d','roblox','aquarela','pixel','massinha','emoji'];/* estilos com o conjunto completo de figuras */
 ES=ES.filter(function(x){return OK.indexOf(x[0])>=0});
 var EM={aviao:'✈️',balao:'🎈',bicicleta:'🚲',bola:'⚽',brinquedo:'🧸',cachorro:'🐶',carro:'🚗',casa:'🏠',cebola:'🧅',chapeu:'👒',chave:'🔑',dado:'🎲',dragao:'🐉',enxada:'⛏️',flor:'🌸',folha:'🍃',galinha:'🐔',gelo:'🧊',grama:'🌱',guitarra:'🎸',leite:'🥛',livro:'📖',lua:'🌙',maca:'🍎',ovo:'🥚',pao:'🍞',passaro:'🐦',peixe:'🐟',planta:'🪴',praia:'🏖️',queijo:'🧀',rato:'🐭',sapo:'🐸',sol:'☀️',trem:'🚂',uva:'🍇',zebra:'🦓'};
 var cur='padrao';try{cur=localStorage.getItem('edu_estilo')||'padrao'}catch(e){}
 if(!ES.some(function(x){return x[0]===cur}))cur='padrao';
 var st=document.createElement('style');
 st.textContent='.emo{display:block;text-align:center;line-height:1.15;font-family:"Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif}';
 document.head.appendChild(st);
 window.ALF_ESTILO=function(){return cur};
 window.ALF_EMOJI=function(k){return EM[k]||'❓'};
 /* k = chave da figura (ex.: "bola"); px = lado em pixels (ou null = só o emoji/inline 1.15em); cls = classe da <img> */
 window.ALF_FIG=function(k,alt,px,cls){
  alt=alt||'';
  if(cur==='emoji'){
   if(px==null)return EM[k]||'';
   return '<span class="emo '+(cls||'')+'" role="img" aria-label="'+alt+'" style="font-size:'+Math.round(px*.78)+'px">'+(EM[k]||'❓')+'</span>';
  }
  var base='img32/'+k+'.png',src=cur==='padrao'?base:'img32/'+cur+'/'+k+'.png';
  var sz=px==null?'width:1.15em;height:1.15em;vertical-align:middle;object-fit:contain':'width:'+px+'px;height:'+px+'px;object-fit:contain';
  return '<img'+(cls?' class="'+cls+'"':'')+' src="'+src+'" alt="'+alt+'" style="'+sz+'" onerror="this.onerror=null;this.src=\''+base+'\'">';
 };
 function ui(){
  var ac=document.getElementById('edu-ac');if(!ac||ac.querySelector('#en-estilo'))return false;
  var d=document.createElement('div');d.className='r';d.id='en-estilo';d.style.cssText='flex-direction:column;align-items:stretch;gap:4px';
  d.innerHTML='<label for="en-estilo-s" style="font:700 13px Arial">🎨 Estilo das ilustrações</label><select id="en-estilo-s" style="font:700 15px Arial;padding:8px;border-radius:10px;border:2px solid #90A4AE;min-height:44px"></select>';
  var s=d.querySelector('select');
  ES.forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];if(x[0]===cur)o.selected=true;s.appendChild(o)});
  s.onchange=function(){try{localStorage.setItem('edu_estilo',s.value)}catch(e){}location.reload()};
  ac.appendChild(d);return true}
 var n=0;(function u(){if(!ui()&&n++<40)setTimeout(u,250)})();
})();
