/* Teclado físico nas atividades de alfabetização (só em computador; no celular o teclado NÃO é aberto). */
(function(){
 if(!(window.matchMedia&&matchMedia('(pointer:fine)').matches))return;
 var buf='',tm=0;
 function nz(s){return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'').toUpperCase()}
 function vis(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled&&e.getAttribute('aria-hidden')!=='true'&&getComputedStyle(e).visibility!=='hidden'}
 function cands(){return [].filter.call(document.querySelectorAll('.peca:not(.fantasma),.btn-tile,.tile,.slot-opt,#appMain button,.opcoes button'),function(b){
   return vis(b)&&!b.closest('.alvo')&&!b.classList.contains('btn-backspace')&&!b.closest('header,#langbar,#dv-top')&&nz(b.textContent).length&&nz(b.textContent).length<=6&&!b.classList.contains('usada')&&b.style.visibility!=='hidden'&&b.style.opacity!=='.35'})}
 document.addEventListener('keydown',function(ev){
  var t=ev.target;if(ev.ctrlKey||ev.altKey||ev.metaKey||(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||(t&&t.isContentEditable)))return;
  var k=ev.key;
  if(k==='Backspace'){var bk=document.querySelector('.btn-backspace');if(bk&&vis(bk)){bk.click();ev.preventDefault();return}
   var pl=[].filter.call(document.querySelectorAll('.alvo .peca'),vis);if(pl.length){pl[pl.length-1].click();ev.preventDefault()}return}
  if(k.length!==1||!/\S/.test(k))return;
  clearTimeout(tm);buf+=nz(k);tm=setTimeout(function(){buf=''},1100);
  var c=cands(),ex=c.filter(function(b){return nz(b.textContent)===buf});
  if(!ex.length){var pre=c.filter(function(b){return nz(b.textContent).indexOf(buf)===0});if(pre.length){ev.preventDefault();return}buf=nz(k);ex=c.filter(function(b){return nz(b.textContent)===buf})}
  if(ex.length){ev.preventDefault();buf='';ex[0].click()}
 },true);
})();
