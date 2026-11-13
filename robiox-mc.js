/* Estilo Minecraft opcional do RobIox: botão ⛏ liga/desliga (guarda no aparelho). Tudo escopado em body.mc. */
(function(){
 var K='rbx_estilo';
 function ls(v){try{if(v===undefined)return localStorage.getItem(K)||'';localStorage.setItem(K,v)}catch(e){return ''}}
 var f=document.createElement('link');f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=VT323&family=Press+Start+2P&display=swap';document.head.appendChild(f);
 var B='body.mc ',
 BT='background:#8b8b8b!important;color:#fff!important;border:3px solid #000!important;border-radius:0!important;box-shadow:inset -4px -4px #555,inset 4px 4px #c6c6c6!important;text-shadow:2px 2px #3f3f3f;font-family:VT323,monospace!important;animation:none!important';
 var css=
 B+'*{font-family:VT323,monospace!important;letter-spacing:0!important}'+
 B+'h1,'+B+'h2,'+B+'h3,'+B+'.lgl{font-family:"Press Start 2P",monospace!important;font-size:clamp(14px,4vw,22px)!important;line-height:1.4}'+
 B+'.ov,'+B+'#lgn,'+B+'#dscm{background:linear-gradient(#0008,#0008),repeating-conic-gradient(#6b4a2b 0 25%,#5a3d22 0 50%) 0 0/48px 48px!important}'+
 B+'.box,'+B+'#rsmod .bx,'+B+'.lgb,'+B+'#dscm>div{background:#c6c6c6!important;border:4px solid #000!important;border-radius:0!important;box-shadow:inset -5px -5px #555,inset 5px 5px #fff!important;color:#222!important;font-size:19px}'+
 B+'.box p,'+B+'.how,'+B+'.lgs{color:#333!important;font-size:19px!important}'+
 B+'.box h1 b{color:#2a7a1a!important}'+
 B+'#dscm button,'+B+'.tabs button,'+B+'.anos button,'+B+'.wc,'+B+'.pill,'+B+'.it,'+B+'.st span,'+B+'.rsm,'+B+'.it button,'+B+'.sw button,'+B+'.pfg div{'+BT+';color:#fff!important;font-size:19px!important}'+
 B+'.tabs button.on,'+B+'.anos button.on,'+B+'.it.on{background:#5b8731!important;box-shadow:inset -4px -4px #3b5a1f,inset 4px 4px #8fc45a!important}'+
 B+'.tabs button[data-t="j"]{background:#c8a22a!important;box-shadow:inset -4px -4px #8a6d12,inset 4px 4px #ffe27a!important;color:#2b1d00!important;text-shadow:none}'+
 B+'.go,'+B+'.lgb button{background:#5b8731!important;color:#fff!important;border:3px solid #000!important;border-radius:0!important;box-shadow:inset -4px -4px #3b5a1f,inset 4px 4px #8fc45a!important;font-size:24px!important;text-shadow:2px 2px #1f3510}'+
 B+'.go:active{transform:none!important;filter:brightness(.85)}'+
 B+'.wc .go2{background:#a83232!important;border-radius:0!important;box-shadow:inset -3px -3px #6a1c1c,inset 3px 3px #e06a6a}'+
 B+'#bar span,'+B+'#bar button{background:#000a!important;border:3px solid #000!important;border-radius:0!important;box-shadow:inset -3px -3px #333,inset 3px 3px #777;font-size:19px!important}'+
 B+'#tp{background:#000a!important;border-radius:0!important;font-size:18px!important}'+
 B+'#msg{background:#000c!important;border:3px solid #fff4;border-radius:0!important;font-size:20px!important}'+
 B+'#qpop{background:#c6c6c6!important;border:4px solid #000!important;border-radius:0!important;box-shadow:inset -4px -4px #555,inset 4px 4px #fff;font-size:clamp(20px,4.5vw,30px)!important}'+
 B+'#cmb{font-family:"Press Start 2P",monospace!important;font-size:16px!important;color:#ffff55!important;text-shadow:3px 3px #3f3f00!important}'+
 B+'.xpb,'+B+'.bar2{background:#2b2b2b!important;border:3px solid #000!important;border-radius:0!important;height:14px}'+
 B+'.xpb i{background:#80ff20!important}'+B+'.bar2 i{background:#80ff20!important}'+
 B+'#jmp{background:#8b8b8b!important;border:4px solid #000!important;border-radius:0!important;color:#fff!important;box-shadow:inset -5px -5px #555,inset 5px 5px #c6c6c6!important}'+
 B+'#joy{border-radius:0!important;background:#0005!important;border:4px solid #000!important}'+B+'#joy i{border-radius:0!important;background:#c6c6c6!important;box-shadow:inset -4px -4px #555,inset 4px 4px #fff!important}'+
 B+'input{border-radius:0!important;background:#000!important;color:#fff!important;border:3px solid #a0a0a0!important}'+
 B+'#c{image-rendering:pixelated}'+
 '#rbxMcBtn{position:fixed;z-index:2147483600;left:10px;top:10px;width:46px;height:46px;font-size:24px;line-height:1;cursor:pointer;border:3px solid #000;background:#8b8b8b;color:#fff;box-shadow:inset -4px -4px #555,inset 4px 4px #c6c6c6;padding:0;opacity:.85}'+
 'body.rbx-jogando #rbxMcBtn{transform:scale(.45);transform-origin:left top;opacity:.55}body.rbx-jogando #rbxMcBtn:hover{transform:scale(.8);opacity:1}'+
 'body:has(#lgn.on) #rbxMcBtn{display:none}';
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 function aplica(){document.body.classList.toggle('mc',ls()==='mc');btn.title=ls()==='mc'?'Estilo: Minecraft (toque para o estilo normal)':'Estilo: normal (toque para Minecraft)';btn.textContent=ls()==='mc'?'⛏':'🎨'}
 var btn=document.createElement('button');btn.id='rbxMcBtn';btn.type='button';
 btn.onclick=function(){ls(ls()==='mc'?'normal':'mc');aplica()};
 function ini(){document.body.appendChild(btn);aplica()}
 if(document.body)ini();else addEventListener('DOMContentLoaded',ini);
})();
