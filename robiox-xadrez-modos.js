/* Modos extras no tabuleiro 3D ocidental (primeira versao do esqueleto gerada com Gemini; motor RBX_XADREZ). Cada modo: nome,ico,sub,txt,erro,ok,PUZ (FEN), val(bd,nb,a,b)->bool (lance escolhido vale?), has(bd)->bool (problema tem solucao e e valido). */
(function(root){
 var X=root.RBX_XADREZ;if(!X)return;
 var VAL={p:1,n:3,b:3,r:5,q:9,k:100};
 function v(p){return VAL[p.toLowerCase()]||0}
 function wLegal(bd,w){var o=[];for(var i=0;i<64;i++)if(bd[i]&&X.isW(bd[i])===w)X.legal(bd,i).forEach(function(j){o.push([i,j])});return o}
 /* peca na casa s pode ser capturada de graca pelo lado oposto (captura legal sem recaptura legal, ou capturando valor maior que o atacante) */
 function hanging(bd,s){var w=X.isW(bd[s]),h=false;wLegal(bd,!w).forEach(function(m){if(m[1]!==s)return;var nb=X.apply(bd,m[0],s);var rec=wLegal(nb,w).some(function(r){return r[1]===s});if(!rec||v(bd[s])>v(bd[m[0]]))h=true});return h}
 function nHang(bd,w){var n=0;for(var i=0;i<64;i++)if(bd[i]&&X.isW(bd[i])===w&&bd[i].toLowerCase()!=='k'&&hanging(bd,i))n++;return n}
 function ok0(bd){return bd.length===64&&bd.indexOf('K')>=0&&bd.indexOf('k')>=0}
 var M={
  xeque1:{nome:'Dê xeque em 1 lance',ico:'🎯',sub:'Qualquer lance que dê xeque',txt:'🎯 Brancas jogam: dê XEQUE em 1 lance (qualquer lance que ataque o rei preto)! Toque na peça e depois na casa.',erro:'Esse lance não dá xeque. Tente outro.',ok:'Xeque!',
   PUZ:["8/4p3/3k1p2/8/8/1K1P4/4p3/R7","8/8/Q7/8/5k2/1N1P4/8/2b4K","K6Q/8/8/8/6k1/4p3/1Q6/8","2b5/8/8/3K4/5Q2/k7/1N6/8","3R2q1/8/2P1b3/8/1k6/3K4/6q1/8","3b4/1Q6/8/1p2pk2/8/8/8/2K5","6k1/q7/8/2P5/8/1p2rQ2/6K1/8","8/8/7p/7k/2N1Q3/1K6/p7/8","8/1k6/8/1B4Kp/8/8/3B4/8"],
   val:function(bd,nb){return X.inCheck(nb,false)},
   has:function(bd){return ok0(bd)&&!X.inCheck(bd,false)&&!X.inCheck(bd,true)&&wLegal(bd,true).some(function(m){return X.inCheck(X.apply(bd,m[0],m[1]),false)})}},
  capsegura:{nome:'Capture sem perder',ico:'⚔️',sub:'Capture sem poder ser recapturado',txt:'⚔️ Brancas jogam: capture uma peça preta SEM que ela possa ser capturada de volta! Toque na peça e depois na casa.',erro:'Não vale: ou não captura, ou a peça pode ser capturada de volta.',ok:'Captura segura!',
   PUZ:["8/3N4/kr6/6Kn/5R2/8/8/r7","8/5b1K/4k3/5n2/1N3P2/1B6/8/3q4","8/1K6/1B1r4/8/2p5/4p2P/8/3k2Q1","8/1r6/8/1kQ3p1/8/K7/8/5R2","K7/8/8/6b1/8/4Q1k1/5nn1/8","b3bR2/6n1/2kN4/8/3B4/1K6/8/8","7k/8/8/8/K7/8/1q5R/8","5r2/8/R7/8/8/K1Q2k2/2b5/8","6K1/1qk3BR/1P5p/8/8/8/4r3/8"],
   val:function(bd,nb,a,b){if(!bd[b]||X.isW(bd[b]))return false;return !wLegal(nb,false).some(function(m){return m[1]===b})},
   has:function(bd){return ok0(bd)&&!X.inCheck(bd,true)&&wLegal(bd,true).some(function(m){return M.capsegura.val(bd,X.apply(bd,m[0],m[1]),m[0],m[1])})&&wLegal(bd,true).some(function(m){return bd[m[1]]&&!M.capsegura.val(bd,X.apply(bd,m[0],m[1]),m[0],m[1])})}},
  escape:{nome:'Escape do xeque',ico:'🛡️',sub:'Seu rei está em xeque: saia dele',txt:'🛡️ Seu rei branco está em XEQUE! Faça um lance legal que tire o rei do xeque (mover, bloquear ou capturar).',erro:'Esse lance não é permitido: o rei continua em xeque.',ok:'Rei salvo!',
   PUZ:["8/8/6PK/8/7q/8/8/1k6","3b4/3k1K2/8/7b/8/8/8/N7","8/3qK3/8/8/2N1k2r/8/Nr3P2/8","8/8/4kP2/6n1/8/7K/8/8","5r2/8/3p4/8/k7/r3K3/P7/8","8/5K2/8/8/6p1/Bq6/6k1/6b1","8/2p3n1/k5P1/7K/8/7n/8/1Q6","8/7k/8/2Q1n3/2r5/3K4/6p1/8","8/6K1/7Q/2k5/8/8/6rq/8"],
   val:function(bd,nb){return !X.inCheck(nb,true)},
   has:function(bd){return ok0(bd)&&X.inCheck(bd,true)&&!X.inCheck(bd,false)&&!X.isMate(bd,true)&&wLegal(bd,true).length>0}},
  capmax:{nome:'Captura obrigatória',ico:'🍽️',sub:'Capture a peça de maior valor',txt:'🍽️ Captura obrigatória: capture a peça preta de MAIOR valor que estiver ao alcance (dama 9, torre 5, bispo/cavalo 3, peão 1).',erro:'Não é a melhor captura: procure a peça de maior valor ao alcance.',ok:'Maior captura!',
   PUZ:["8/P2P3n/6K1/8/7p/6Pk/8/r7","4kr2/8/2r5/BK3Q2/8/6P1/3q4/8","2K5/k7/8/8/6n1/8/b7/3Qr3","7k/8/8/5R2/8/2bQr3/6N1/7K","5N2/8/5R2/6k1/3p2p1/8/r3Q3/3K4","6B1/5p2/Q7/6p1/3K4/1B6/2b5/6k1","5N2/2k1q3/8/1K1P4/1Q5r/7p/8/8","8/8/8/1B6/3k4/1K6/1p2n3/R7","6k1/6B1/8/8/8/4p3/2n1Q3/1K6"],
   val:function(bd,nb,a,b){if(!bd[b]||X.isW(bd[b]))return false;var mx=0;wLegal(bd,true).forEach(function(m){if(bd[m[1]]&&!X.isW(bd[m[1]]))mx=Math.max(mx,v(bd[m[1]]))});return v(bd[b])===mx},
   has:function(bd){if(!ok0(bd)||X.inCheck(bd,true)||X.inCheck(bd,false))return false;var vs=[];wLegal(bd,true).forEach(function(m){if(bd[m[1]]&&!X.isW(bd[m[1]]))vs.push(v(bd[m[1]]))});return vs.length>=2&&Math.max.apply(null,vs)>Math.min.apply(null,vs)}},
  defenda:{nome:'Defenda sua peça',ico:'🏰',sub:'Salve a peça ameaçada',txt:'🏰 Uma peça branca está AMEAÇADA de ser capturada de graça! Mova-a, proteja-a ou capture o atacante, para que nenhuma fique em perigo.',erro:'Ainda há uma peça sua que pode ser capturada de graça. Tente outro lance.',ok:'Defesa certa!',
   PUZ:["8/8/K7/3q2B1/1k6/8/8/8","8/5r2/8/k7/3K4/8/5B2/8","6R1/k7/6K1/4B3/8/8/2P3n1/2r5","K7/8/8/3r4/N4r2/2R5/3p3k/8","3n4/8/3k4/p1N5/8/8/2K5/8","8/5P2/1K1n4/8/5p2/4p3/k7/8","8/5PK1/5B2/2P5/8/8/4k3/2r5","8/1P6/8/4n3/4K3/5R2/8/7k","1q5k/5K2/6p1/8/1P6/8/6P1/qQ6"],
   val:function(bd,nb){return nHang(nb,true)===0},
   has:function(bd){return ok0(bd)&&!X.inCheck(bd,true)&&!X.inCheck(bd,false)&&nHang(bd,true)>=1&&wLegal(bd,true).some(function(m){return nHang(X.apply(bd,m[0],m[1]),true)===0})&&wLegal(bd,true).some(function(m){return nHang(X.apply(bd,m[0],m[1]),true)>0})}}
 };
 root.RBX_XADREZ_MODOS=M;root.RBX_XADREZ_MODOS_ORDEM=['xeque1','capsegura','escape','capmax','defenda'];
})(typeof window!=='undefined'?window:globalThis);
