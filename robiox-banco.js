/* RobIox — banco de fases: tópicos por ano, geradores com 5 níveis de dificuldade, mundos, skins, missões */
(function(){
var ri=function(a,b){a=Math.ceil(a);b=Math.floor(b);return a+Math.floor(Math.random()*(b-a+1))},pick=function(a){return a[ri(0,a.length-1)]},
shuf=function(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=ri(0,i),t=a[i];a[i]=a[j];a[j]=t}return a},
fm=function(n){n=Math.round(n*1000)/1000;return String(n).replace('.',',').replace('-','−')},
gcd=function(a,b){return b?gcd(b,a%b):a},M=[20,50,100,250,500],lo=function(x,m){return Math.max(m||2,Math.floor(x))};
function S(v){return typeof v==='number'?fm(v):String(v)}
function numOpts(c,k){var cand=shuf([c+1,c-1,c+2,c-2,c+10,c-10,c+5,c-5,c*2,c+3,c-3,c+ri(4,9),c-ri(4,9),c+ri(11,19),c-ri(11,19)]),o=[],i;for(i=0;i<cand.length&&o.length<k;i++){var v=Math.round(cand[i]*1000)/1000;if(v!==c&&o.indexOf(v)<0)o.push(v)}return o}
function Q(q,c,dist,e){var d=[],seen={};seen[S(c)]=1;(dist||[]).forEach(function(v){var s=S(v);if(!seen[s]){seen[s]=1;d.push(v)}});if(typeof c==='number')numOpts(c,8).forEach(function(v){var s=S(v);if(d.length<3&&!seen[s]){seen[s]=1;d.push(v)}});return {q:q,a:S(c),d:d.slice(0,3).map(S),e:e||''}}
function E(s){return s}
function eq2(r1,r2){var s=r1+r2,p=r1*r2;return 'x²'+(s>0?' − '+s+'x':s<0?' + '+(-s)+'x':'')+(p>0?' + '+p:p<0?' − '+(-p):'')+' = 0'}
function nums(t,k){var a=[],i,m=[9,12,20,30,60][t-1];for(i=0;i<k;i++)a.push(ri(2,m));return a}
var G={6:{},7:{},8:{},9:{}};
/* ===== 6º ano ===== */
G[6].ops=function(t){var m=M[t-1],k=ri(0,3),a,b,c;
 if(k===0){a=ri(lo(m/4,5),m);b=ri(lo(m/8,3),lo(m/2,4));c=a+b;return Q('Quanto é '+a+' + '+b+'?',c,[c+10,c-10,a-b],a+' + '+b+' = '+c)}
 if(k===1){a=ri(lo(m/2,10),m);b=ri(2,a-1);c=a-b;return Q('Quanto é '+a+' − '+b+'?',c,[a+b,c+10,c-1],a+' − '+b+' = '+c)}
 if(k===2){a=ri(2,4+2*t);b=ri(2,5+2*t);c=a*b;return Q('Quanto é '+a+' × '+b+'?',c,[a+b,c+a,c-b],a+' × '+b+' = '+c)}
 b=ri(2,3+2*t);c=ri(2,4+3*t);a=b*c;return Q('Quanto é '+a+' ÷ '+b+'?',c,[c+1,a-b,b],a+' ÷ '+b+' = '+c+', pois '+b+' × '+c+' = '+a)};
G[6].exp=function(t){var a=ri(2,9),b=ri(2,6),c=ri(2,9),d=ri(1,9),v,s;
 if(t<=2){v=a+b*c;s=a+' + '+b+' × '+c;return Q('Quanto é '+s+'?',v,[(a+b)*c,a+b+c,v+1],'Primeiro a multiplicação: '+b+' × '+c+' = '+b*c+'; depois a soma: '+v)}
 if(t===3){v=(a+b)*c-d;s='('+a+' + '+b+') × '+c+' − '+d;return Q('Quanto é '+s+'?',v,[a+b*c-d,(a+b)*c+d,v+c],'Parênteses primeiro: '+(a+b)+' × '+c+' = '+(a+b)*c+'; depois −'+d+' = '+v)}
 a=ri(2,6);v=a*a+b*c-d;s=a+'² + '+b+' × '+c+' − '+d;return Q('Quanto é '+s+'?',v,[a*2+b*c-d,(a*a+b)*c-d,v+d],a+'² = '+a*a+'; '+b+' × '+c+' = '+b*c+'; total '+v)};
G[6].frac=function(t){var k=ri(0,t>=3?2:t>=2?1:0),d,n,b,c,g,p,a;
 if(k===0){d=pick([2,3,4,5,10]);n=ri(1,d-1);b=d*ri(2,3+3*t);c=b/d*n;return Q(n+'/'+d+' de '+b+' é igual a…',c,[b/d,c+d,b-c],'Divida '+b+' por '+d+' ('+b/d+') e multiplique por '+n+': '+c)}
 if(k===1){d=ri(5,12);a=ri(1,d-3);b=ri(1,d-a-1);return Q('Quanto é '+a+'/'+d+' + '+b+'/'+d+'?',(a+b)+'/'+d,[(a+b)+'/'+(2*d),(a*b)+'/'+d,(a+b+1)+'/'+d,(a+b)+'/'+(d+1)],'Mesmo denominador: some só os numeradores: '+a+' + '+b+' = '+(a+b))}
 g=pick([2,3,4]);p=pick([[1,2],[2,3],[3,4],[1,3],[3,5]]);a=p[0]*g;b=p[1]*g;return Q('Simplifique ao máximo a fração '+a+'/'+b+'.',p[0]+'/'+p[1],[(a-1)+'/'+b,p[1]+'/'+p[0],a+'/'+(b-1),(a+g)+'/'+(b+g)],'Divida em cima e embaixo por '+g+': '+p[0]+'/'+p[1])};
G[6].dec=function(t){var k=ri(0,t>=2?2:1),p=t<3?10:100,a,b,c,x;
 if(k===0){a=ri(11,60+t*20)/p;b=ri(11,60+t*20)/p;c=a+b;return Q('Quanto é '+fm(a)+' + '+fm(b)+'?',c,[c+0.1,c-0.1,c+1,c-1],'Alinhe as vírgulas e some: '+fm(c))}
 if(k===1){a=ri(12,99)/10;x=pick([10,100]);c=a*x;return Q('Quanto é '+fm(a)+' × '+x+'?',c,[a*x/10,a*x*10,a+x],'Multiplicar por '+x+' anda a vírgula '+(x===10?'1 casa':'2 casas')+' para a direita')}
 a=ri(2,9)/10;b=ri(2,9+t);c=a*b;return Q('Quanto é '+fm(a)+' × '+b+'?',c,[c*10,c/10,a+b],a*10+' × '+b+' = '+a*10*b+' e depois volta a vírgula: '+fm(c))};
G[6].geo=function(t){var k=ri(0,t>=3?4:t>=2?3:2),a=ri(3,6+t*3),b=ri(2,5+t*2),x;
 if(k===0)return Q('Um retângulo mede '+a+' cm por '+b+' cm. Qual é o perímetro (cm)?',2*(a+b),[a*b,a+b,2*a+b],'Perímetro = 2 × ('+a+' + '+b+') = '+2*(a+b));
 if(k===1)return Q('Um retângulo mede '+a+' cm por '+b+' cm. Qual é a área (cm²)?',a*b,[2*(a+b),a+b,a*b+a],'Área = '+a+' × '+b+' = '+a*b);
 if(k===2)return Q('Um quadrado tem lado '+a+' cm. Qual é a área (cm²)?',a*a,[4*a,2*a,a*a+a],'Área = lado × lado = '+a*a);
 x=ri(20,80);if(k===3)return Q('Dois ângulos são complementares (somam 90°). Um mede '+x+'°. Quanto mede o outro?',90-x,[180-x,x,90+x],'90 − '+x+' = '+(90-x));
 return Q('Dois ângulos são suplementares (somam 180°). Um mede '+(x+20)+'°. Quanto mede o outro?',160-x,[90-x,x+20,180+x],'180 − '+(x+20)+' = '+(160-x))};
G[6].mmc=function(t){var a=ri(2,5+t*2),b=ri(2,5+t*2),g,m;if(a===b)b++;
 if(ri(0,1)){m=a*b/gcd(a,b);return Q('Qual é o MMC de '+a+' e '+b+'?',m,[a*b===m?m+a:a*b,gcd(a,b)===1?m+b:gcd(a,b),m+a],'O MMC é o menor número que é múltiplo dos dois: '+m)}
 g=ri(2,6);a=g*ri(2,5);b=g*ri(2,5);if(a===b)b+=g;return Q('Qual é o MDC de '+a+' e '+b+'?',gcd(a,b),[gcd(a,b)*2,a*b/gcd(a,b),gcd(a,b)+1],'O MDC é o maior número que divide os dois: '+gcd(a,b))};
/* ===== 7º ano ===== */
G[7].int=function(t){var m=[9,15,30,60,99][t-1],a=ri(2,m),b=ri(2,m),k=ri(0,2);
 if(k===0)return Q('Quanto é (−'+a+') + '+(a+b)+'?',b,[-(a+a+b),a+a+b,b-2*a],'−'+a+' + '+(a+b)+' = '+b);
 if(k===1){a=ri(2,Math.min(m,12));b=ri(2,Math.min(m,12));return Q('Quanto é (−'+a+') × '+b+'?',-a*b,[a*b,-a-b,a-b],'Sinais diferentes dão negativo: '+(-a*b))}
 return Q('Quanto é '+a+' − (−'+b+')?',a+b,[a-b,-a-b,b-a],'Menos com menos vira mais: '+a+' + '+b+' = '+(a+b))};
G[7].eq=function(t){var x=ri(2,6+t*3),a=ri(2,5),b=ri(1,9+t*2),c,d;
 if(t===1){return Q('Resolva: x + '+b+' = '+(x+b)+'. Quanto vale x?',x,[x+b,x-1,x+1],'x = '+(x+b)+' − '+b+' = '+x)}
 if(t===2)return Q('Resolva: '+a+'x = '+a*x+'. Quanto vale x?',x,[a*x,x+a,x-1],'x = '+a*x+' ÷ '+a+' = '+x);
 if(t===3)return Q('Resolva: '+a+'x + '+b+' = '+(a*x+b)+'. Quanto vale x?',x,[a*x+b,x+1,x-1],'Tire '+b+' dos dois lados e divida por '+a);
 if(t===4)return Q('Resolva: '+a+'x − '+b+' = '+(a*x-b)+'. Quanto vale x?',x,[a*x-b,x+1,x-1],'Some '+b+' dos dois lados e divida por '+a);
 c=ri(1,a-1);d=ri(1,9);return Q('Resolva: '+a+'x + '+d+' = '+c+'x + '+((a-c)*x+d)+'. Quanto vale x?',x,[x+1,x-1,x+2],'Junte os x de um lado: '+(a-c)+'x = '+(a-c)*x)};
G[7].pct=function(t){var P=[[10,50],[10,20,25,50],[5,15,30,40,75],[5,15,30,40,75],[12,35,45,60]][t-1],p=pick(P),b=pick([40,80,120,200,400]),k=ri(0,t>=3?2:1),c;
 if(k===0)return Q('Quanto é '+p+'% de '+b+'?',b*p/100,[b/p,b*p/10,b*p/100+p],p+'% de '+b+' = '+b+' × '+p+' ÷ 100 = '+b*p/100);
 if(k===1){c=b-b*p/100;return Q('Uma camiseta de R$ '+b+' tem '+p+'% de desconto. Quanto custa (R$)?',c,[b*p/100,b+b*p/100,c+p],'Desconto de '+b*p/100+'; '+b+' − '+b*p/100+' = '+c)}
 var a=b*p/100;return Q('Quantos por cento é '+a+' de '+b+'?',p,[a,b-a,p*2],a+' ÷ '+b+' = '+p/100+' = '+p+'%')};
G[7].prop=function(t){var n=ri(2,4),m=n+ri(2,5),u=ri(3,9+t*2),k=ri(0,t>=3?1:0);
 if(k===0)return Q(n+' cadernos custam R$ '+n*u+'. Quanto custam '+m+' cadernos (R$)?',u*m,[n*u+m,u*(m-1),u*m+n],'Cada um custa '+u+'; '+m+' × '+u+' = '+u*m);
 return Q('No mapa, 1 cm representa '+u+' km. Quantos km representam '+m+' cm?',u*m,[u+m,u*m/2,u*m+u],m+' × '+u+' = '+u*m)};
G[7].pot=function(t){var b=ri(2,t<2?5:6),e=ri(2,t<3?3:5),r;
 if(t===3){r=ri(4,15);return Q('Quanto é √'+r*r+'?',r,[r*2,r+1,r-1],r+' × '+r+' = '+r*r)}
 if(t===5){e=ri(2,5);return Q('Quanto é (−2)^'+e+'?',Math.pow(-2,e),[-Math.pow(-2,e),2*e,-2*e],'Expoente '+(e%2?'ímpar: negativo':'par: positivo'))}
 if(t===4){e=ri(6,10);return Q('Quanto é 2^'+e+'?',Math.pow(2,e),[2*e,Math.pow(2,e-1)+2,Math.pow(2,e)+8],'2 multiplicado '+e+' vezes: '+Math.pow(2,e))}
 return Q('Quanto é '+b+'^'+e+'?',Math.pow(b,e),[b*e,Math.pow(b,e)+b,Math.pow(b,e-1)],b+' multiplicado '+e+' vezes: '+Math.pow(b,e))};
G[7].ang=function(t){var a=ri(35,80),b=ri(30,70),n=pick([3,4,5,6,8,10]),k=ri(0,t>=4?3:t>=3?2:t>=2?1:0);
 if(k===0)return Q('Dois ângulos de um triângulo medem '+a+'° e '+b+'°. Quanto mede o terceiro (°)?',180-a-b,[360-a-b,a+b,180-a],'A soma é 180°: 180 − '+a+' − '+b+' = '+(180-a-b));
 if(k===1)return Q('Dois ângulos suplementares: um mede '+a+'°. O outro mede…',180-a,[90-a,a,360-a],'180 − '+a+' = '+(180-a));
 if(k===2)return Q('Qual é a soma dos ângulos internos de um polígono de '+n+' lados?',(n-2)*180,[n*180,(n-1)*180,n*90],'(n − 2) × 180 = '+(n-2)*180);
 return Q('Quanto mede cada ângulo interno de um polígono regular de '+n+' lados?',(n-2)*180/n,[(n-2)*180,360/n,(n-2)*90],'Soma '+(n-2)*180+' ÷ '+n+' = '+(n-2)*180/n)};
G[7].est=function(t){var k=ri(0,t>=3?2:1),a,s,l;
 if(k===0){a=nums(t,3);s=a[0]+a[1]+a[2];while(s%3){a[2]++;s++}return Q('Qual é a média de '+a.join(', ')+'?',s/3,[s/3+1,s/3-1,s/2],'Soma '+s+' ÷ 3 = '+s/3)}
 if(k===1){l=nums(t,5);var q=l.slice().sort(function(x,y){return x-y});return Q('Qual é a mediana de '+l.join(', ')+'?',q[2],[q[1],q[3],Math.round(l.reduce(function(x,y){return x+y})/5)],'Ordene: '+q.join(', ')+'. A do meio é '+q[2])}
 a=ri(3,12);return Q('Qual é a moda de '+[a,a+2,a,a+5,a,a+2].join(', ')+'?',a,[a+2,a+5,a+1],'Moda é o valor que mais aparece: '+a)};
/* ===== 8º ano ===== */
G[8].alg=function(t){var k=ri(0,t>=3?3:t>=2?2:1),x=ri(2,3+t),a=ri(1,3+t),b=ri(1,4);
 if(k===0)return Q('Qual o valor de x² + '+b+'x para x = '+x+'?',x*x+b*x,[x*x+b,x*x,(x+b)*x*2],x+'² + '+b+'·'+x+' = '+(x*x+b*x));
 if(k===1)return Q('Quanto é (a + b)² para a = '+a+' e b = '+b+'?',(a+b)*(a+b),[a*a+b*b,a*a+b*b+a*b,(a+b)*2],'(a+b)² = '+(a+b)+'² = '+(a+b)*(a+b));
 if(k===2){a=a+b+1;return Q('Quanto é (a + b)(a − b) para a = '+a+' e b = '+b+'?',a*a-b*b,[a*a+b*b,(a-b)*(a-b),a*a-b],'(a+b)(a−b) = a² − b² = '+(a*a-b*b))}
 return Q('Qual o valor de '+a+'x² − '+b+'x para x = −'+x+'?',a*x*x+b*x,[a*x*x-b*x,-a*x*x-b*x,a*x*x],'x² dá sempre positivo; −b·(−x) dá positivo: '+(a*x*x+b*x))};
G[8].eq=function(t){var x=ri(2,6+t*2),a=ri(2,5),b=ri(1,9),c,d;
 if(t===1)return Q('Resolva: '+a+'x + '+b+' = '+(a*x+b)+'. Quanto vale x?',x,[a*x+b,x+1,x-1],'x = ('+(a*x+b)+' − '+b+') ÷ '+a+' = '+x);
 if(t===2)return Q('Resolva: '+a+'x − '+b+' = '+(a*x-b)+'. Quanto vale x?',x,[a*x-b,x+1,x-1],'x = ('+(a*x-b)+' + '+b+') ÷ '+a+' = '+x);
 if(t===3){c=ri(1,a-1);d=ri(1,9);return Q('Resolva: '+a+'x + '+d+' = '+c+'x + '+((a-c)*x+d)+'. Quanto vale x?',x,[x+1,x-1,x+2],'Passe '+c+'x para o outro lado: '+(a-c)+'x = '+(a-c)*x)}
 if(t===4){b=ri(2,4);return Q('Resolva: (x + '+a+') ÷ '+b+' = '+(x+a)/b*1+' ... com x = '+x+'?',x,[x+1,x-1,x+2],'')}
 return Q('Resolva: '+a+'(x + '+b+') = '+a*(x+b)+'. Quanto vale x?',x,[x+b,x-1,a*x],'Divida por '+a+': x + '+b+' = '+(x+b))};
G[8].sis=function(t){var x=ri(4,9),y=ri(1,x-1),k=t>=3?ri(0,1):0;
 if(k===0)return Q('Se x + y = '+(x+y)+' e x − y = '+(x-y)+', quanto vale x?',x,[y,x+y,x-1],'Somando as duas: 2x = '+2*x+', então x = '+x);
 return Q('Se x + y = '+(x+y)+' e 2x + y = '+(2*x+y)+', quanto vale x?',x,[y,x+y,x+1],'Subtraindo as equações: x = '+(2*x+y)+' − '+(x+y)+' = '+x)};
G[8].raiz=function(t){var r=ri(3,8+2*t),s=ri(2,6),k=t>=4?ri(0,2):t>=3?ri(0,1):0;
 if(k===0)return Q('Quanto é √'+r*r+'?',r,[r*2,r+1,r-1],r+' × '+r+' = '+r*r);
 if(k===1){r=ri(2,6);return Q('Quanto é ∛'+r*r*r+'? (raiz cúbica)',r,[r*r,r+1,r*3],r+' × '+r+' × '+r+' = '+r*r*r)}
 return Q('Quanto é √'+r*r+' + √'+s*s+'?',r+s,[r*s,r+s+1,r+s-1],r+' + '+s+' = '+(r+s))};
G[8].area=function(t){var b=ri(2,5+t)*2,h=ri(3,8),B=b+ri(2,6),r=pick([2,5,10]),k=ri(0,t>=3?3:t>=2?2:1);
 if(k===0)return Q('Um triângulo tem base '+b+' cm e altura '+h+' cm. Qual a área (cm²)?',b*h/2,[b*h,b+h,b*h/2+h],'Área = base × altura ÷ 2 = '+b*h/2);
 if(k===1)return Q('Um paralelogramo tem base '+b+' e altura '+h+'. Qual a área?',b*h,[b*h/2,b+h,2*(b+h)],'Área = base × altura = '+b*h);
 if(k===2){h=ri(2,6)*2;return Q('Um trapézio tem bases '+B+' e '+b+' e altura '+h+'. Qual a área?',(B+b)*h/2,[(B+b)*h,B*h/2,(B+b)*h/2+h],'(B + b) × h ÷ 2 = '+(B+b)*h/2)}
 return Q('Use π = 3,14. Qual a área de um círculo de raio '+r+'?',3.14*r*r,[2*3.14*r,3.14*r,3.14*r*r+r],'Área = π × r² = 3,14 × '+r*r+' = '+fm(3.14*r*r))};
G[8].est=function(t){var k=ri(0,2),a,s;
 if(k===0){a=[ri(5,8),ri(6,9),ri(5,9),ri(7,10)];s=a[0]+a[1]+a[2]+a[3];while(s%4){a[3]++;s++}return Q('Qual é a média de '+a.join(', ')+'?',s/4,[s/4+1,s/4-1,s/4+0.5],'Soma '+s+' ÷ 4 = '+s/4)}
 if(k===1){a=ri(4,8);var b=ri(5,9);return Q('Nota '+a+' (peso 2) e nota '+b+' (peso 3). Qual a média ponderada?',(2*a+3*b)/5,[(a+b)/2,(2*a+3*b)/5+1,(2*a+3*b)/5-0.5],'('+2*a+' + '+3*b+') ÷ 5 = '+fm((2*a+3*b)/5))}
 a=nums(t,5);var q=a.slice().sort(function(x,y){return x-y});return Q('Qual é a amplitude de '+a.join(', ')+'?',q[4]-q[0],[q[4],q[0],q[4]+q[0]],'Maior − menor = '+q[4]+' − '+q[0])};
G[8].not=function(t){var a=ri(2,4),b=ri(2,4),k=ri(0,2);
 if(k===0)return Q('Quanto é 10^'+a+' × 10^'+b+'?',Math.pow(10,a+b),[Math.pow(10,a*b),Math.pow(10,a+b)/10,Math.pow(10,a+b)*10],'Some os expoentes: 10^'+(a+b)+' = '+Math.pow(10,a+b));
 if(k===1){b=ri(5,8);a=ri(2,b-1);return Q('Quanto é 10^'+b+' ÷ 10^'+a+'?',Math.pow(10,b-a),[Math.pow(10,b+a),Math.pow(10,b-a)/10,Math.pow(10,b-a)*10],'Subtraia os expoentes: 10^'+(b-a))}
 a=ri(2,9);b=ri(3,7);return Q(a*Math.pow(10,b)+' em notação científica é '+a+' × 10^? Qual o expoente?',b,[b-1,b+1,a],'Conte os zeros: '+b)};
/* ===== 9º ano ===== */
G[9].pit=function(t){var T=pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]),f=ri(1,Math.max(1,t-1)),a=T[0]*f,b=T[1]*f,c=T[2]*f,k=ri(0,t>=3?1:0);
 if(k===0)return Q('Um triângulo retângulo tem catetos '+a+' e '+b+'. Quanto mede a hipotenusa?',c,[a+b,c+1,c-1],'a² + b² = '+a*a+' + '+b*b+' = '+c*c+', então a hipotenusa é '+c);
 return Q('Num triângulo retângulo a hipotenusa mede '+c+' e um cateto mede '+a+'. Quanto mede o outro cateto?',b,[c-a,b+1,b-1],'c² − a² = '+c*c+' − '+a*a+' = '+b*b+', então '+b)};
G[9].eq2=function(t){var r1=ri(1,3+t),r2=ri(1,3+t),r;if(t>=4)r1=-r1;if(r1===r2)r2++;var k=t<=1?0:ri(1,t>=3?3:2);
 if(k===0){r=ri(3,12);return Q('Qual é a raiz positiva de x² − '+r*r+' = 0?',r,[r*r,-r,r+1],'x² = '+r*r+', então x = '+r)}
 if(k===1)return Q('Qual é a MAIOR raiz de '+eq2(r1,r2)+'?',Math.max(r1,r2),[Math.min(r1,r2),r1+r2,r1*r2],'As raízes são '+r1+' e '+r2+' (soma '+(r1+r2)+', produto '+r1*r2+')');
 if(k===2)return Q('Qual é a MENOR raiz de '+eq2(r1,r2)+'?',Math.min(r1,r2),[Math.max(r1,r2),r1+r2,r1*r2],'As raízes são '+r1+' e '+r2);
 return Q('Qual é a SOMA das raízes de '+eq2(r1,r2)+'?',r1+r2,[r1*r2,r1-r2,-(r1+r2)],'Soma das raízes = −b/a = '+(r1+r2))};
G[9].fun=function(t){var a=ri(2,5),b=ri(1,9),x=ri(2,8),k=ri(0,t>=4?3:t>=3?2:1),x0,x1,y1,x2,y2;
 if(k===0)return Q('Se f(x) = '+a+'x + '+b+', quanto vale f('+x+')?',a*x+b,[a+x+b,a*x,a*x+b+a],a+'·'+x+' + '+b+' = '+(a*x+b));
 if(k===1)return Q('Se f(x) = x² − '+a+'x + '+b+', quanto vale f('+x+')?',x*x-a*x+b,[x*x+a*x+b,x*x-a*x,x*2-a*x+b],x+'² − '+a+'·'+x+' + '+b+' = '+(x*x-a*x+b));
 if(k===2){x0=ri(2,9);return Q('Para qual valor de x temos f(x) = '+a+'x − '+a*x0+' igual a zero?',x0,[a*x0,x0+1,-x0],a+'x = '+a*x0+', logo x = '+x0)}
 x1=ri(0,3);y1=ri(1,5);var m=ri(2,4);x2=x1+ri(1,3);y2=y1+m*(x2-x1);return Q('A reta passa por ('+x1+', '+y1+') e ('+x2+', '+y2+'). Qual é o coeficiente angular?',m,[m+1,m-1,y2-y1],'(y2 − y1) ÷ (x2 − x1) = '+(y2-y1)+' ÷ '+(x2-x1)+' = '+m)};
G[9].jur=function(t){var c=pick([200,400,500,1000]),i=pick([2,3,5,10]),n=ri(2,6),p=pick([200,400,500,800]),a=pick([10,15,20,25]),k=ri(0,t>=4?3:t>=2?2:1);
 if(k===0)return Q('Juros simples: R$ '+c+' a '+i+'% ao mês por '+n+' meses. Quanto rende de juros (R$)?',c*i*n/100,[c*i/100,c*i*n,c*n/100],'J = C × i × t = '+c+' × '+i/100+' × '+n+' = '+c*i*n/100);
 if(k===1)return Q('Um produto de R$ '+p+' teve aumento de '+a+'%. Qual o novo preço (R$)?',p+p*a/100,[p*a/100,p-p*a/100,p+a],'Aumento '+p*a/100+'; '+p+' + '+p*a/100+' = '+(p+p*a/100));
 if(k===2)return Q('Montante após '+n+' meses: capital R$ '+c+', juros simples de '+i+'% ao mês. Quanto é (R$)?',c+c*i*n/100,[c*i*n/100,c+c*i/100,c*n],'Montante = capital + juros = '+c+' + '+c*i*n/100);
 return Q('Um preço de R$ 100 aumenta 20% e depois cai 20%. Quanto fica (R$)?',96,[100,120,80],'Aumenta: 120. Cai 20% de 120 (= 24): 96')};
G[9].vol=function(t){var a=ri(2,4+t),b=ri(2,5),c=ri(2,4),r=ri(1,4),h=ri(2,6),k=ri(0,t>=4?3:t>=2?2:1);
 if(k===0)return Q('Qual é o volume de um cubo de aresta '+a+' cm? (cm³)',a*a*a,[3*a,a*a,6*a*a],a+' × '+a+' × '+a+' = '+a*a*a);
 if(k===1)return Q('Qual é o volume de um bloco '+a+' × '+b+' × '+c+' (cm³)?',a*b*c,[a+b+c,2*(a*b+b*c+a*c),a*b*c+a],a+' × '+b+' × '+c+' = '+a*b*c);
 if(k===2)return Q('Qual é a área total de um cubo de aresta '+a+' cm? (cm²)',6*a*a,[a*a*a,4*a*a,6*a],'São 6 faces de '+a*a+': '+6*a*a);
 return Q('Use π = 3. Volume de um cilindro com raio '+r+' e altura '+h+'?',3*r*r*h,[3*r*h,r*r*h,3*r*r*h+r],'V = π × r² × h = 3 × '+r*r+' × '+h+' = '+3*r*r*h)};
G[9].rad=function(t){var r=ri(3,9),s=ri(2,7),k=ri(0,t>=3?2:1),f=pick([2,3,5,6]),q=pick([2,3,5]);
 if(k===0)return Q('Quanto é √'+r*r+' + √'+r*r+'?',2*r,[r,r*r,2*r+2],'√'+r*r+' = '+r+', e '+r+' + '+r+' = '+2*r);
 if(k===1)return Q('Quanto é √'+r*r+' × √'+s*s+'?',r*s,[r+s,r*s+r,r*s-s],r+' × '+s+' = '+r*s);
 return Q('Simplificando √'+f*f*q+', obtemos…',f+'√'+q,[q+'√'+f,(f*q)+'√'+q,f+'√'+(q+1),(f+1)+'√'+q],f*f*q+' = '+f*f+' × '+q+'; tirando '+f+'² da raiz: '+f+'√'+q)};
/* ===== mundos ===== */
var W={
6:[{n:'Ilha das Contas',em:'🏝️',t:['ops','exp']},{n:'Floresta das Frações',em:'🌲',t:['frac','dec']},{n:'Cidade das Formas',em:'🏙️',t:['geo','mmc']},{n:'Vulcão Misto',em:'🌋',t:['ops','frac','geo','dec']},{n:'Castelo Final',em:'🏰',t:['ops','exp','frac','dec','geo','mmc']}],
7:[{n:'Vale dos Negativos',em:'🏔️',t:['int','eq']},{n:'Mercado Maluco',em:'🛒',t:['pct','prop']},{n:'Torre das Potências',em:'🗼',t:['pot','ang']},{n:'Laboratório Misto',em:'🧪',t:['eq','est','pct','int']},{n:'Castelo Final',em:'🏰',t:['int','eq','pct','prop','pot','ang','est']}],
8:[{n:'Reino das Letras',em:'🔤',t:['alg','eq']},{n:'Ponte dos Sistemas',em:'🌉',t:['sis','raiz']},{n:'Campo das Áreas',em:'🌾',t:['area','est']},{n:'Oficina Científica',em:'🔬',t:['not','alg','raiz']},{n:'Castelo Final',em:'🏰',t:['alg','eq','sis','raiz','area','est','not']}],
9:[{n:'Templo de Pitágoras',em:'📐',t:['pit','eq2']},{n:'Banco Central',em:'🏦',t:['fun','jur']},{n:'Fábrica de Sólidos',em:'🏭',t:['vol','rad']},{n:'Arena dos Chefes',em:'🥊',t:['eq2','fun','pit','jur']},{n:'Castelo Final',em:'🏰',t:['pit','eq2','fun','jur','vol','rad']}]};
var TN={ops:'Operações',exp:'Expressões',frac:'Frações',dec:'Decimais',geo:'Geometria',mmc:'MMC e MDC',int:'Inteiros',eq:'Equações',pct:'Porcentagem',prop:'Proporção',pot:'Potências',ang:'Ângulos',est:'Estatística',alg:'Álgebra',sis:'Sistemas',raiz:'Raízes',area:'Áreas',not:'Notação científica',pit:'Pitágoras',eq2:'Equação do 2º grau',fun:'Funções',jur:'Juros',vol:'Volumes',rad:'Radicais'};
var SK=[
{id:'red',n:'Vermelho',c:0,col:0xe11d48,hat:''},{id:'blue',n:'Azul',c:25,col:0x2563eb,hat:''},{id:'green',n:'Verde',c:25,col:0x16a34a,hat:''},
{id:'cap',n:'Boné ciano',c:60,col:0x0891b2,hat:'cap'},{id:'gold',n:'Rei dourado',c:90,col:0xf5b800,hat:'crown'},{id:'wiz',n:'Mago',c:120,col:0x6d28d9,hat:'cone'},
{id:'ninja',n:'Ninja',c:150,col:0x1f2937,hat:'band'},{id:'pink',n:'Estrela rosa',c:180,col:0xec4899,hat:'crown'}];
var MIS=[{id:'ac',t:'Acerte {n} perguntas',n:[6,8,10]},{id:'cb',t:'Faça um combo de {n} acertos seguidos',n:[3,4,5]},{id:'fs',t:'Complete {n} fases',n:[3,4,5]},{id:'es',t:'Ganhe {n} estrelas',n:[5,7,9]},{id:'mo',t:'Colete {n} moedas',n:[10,15,20]},{id:'pf',t:'Complete {n} fases sem errar',n:[1,2,3]}];
window.RBXB={G:G,W:W,TN:TN,SK:SK,MIS:MIS,ri:ri,pick:pick,shuf:shuf,fm:fm,
 make:function(ano,topic,tier){var f=G[ano][topic],r;try{r=f(Math.max(1,Math.min(5,tier)))}catch(e){r=null}return r||G[ano][Object.keys(G[ano])[0]](1)}};
})();
