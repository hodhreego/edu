/* Catálogo dos QR Codes de Pix das atividades (valores até R$ 900). Usado pelo jogo e pela folha de impressão. */
window.QRCAT=[
 {id:'01',nome:'Padaria Pão Dourado',valor:1000},
 {id:'02',nome:'Papelaria Central',valor:3650},
 {id:'03',nome:'Lanchonete Sabor',valor:2800},
 {id:'04',nome:'Farmácia Saúde',valor:2375},
 {id:'05',nome:'Cinema Cine Max',valor:4500},
 {id:'06',nome:'Livraria Estrela',valor:5990},
 {id:'07',nome:'Fatura do celular Claro',valor:6490},
 {id:'08',nome:'Conta de água Sanepar',valor:7420},
 {id:'09',nome:'Mercado Bom Preço',valor:8745},
 {id:'10',nome:'Internet fibra Vivo',valor:9990},
 {id:'11',nome:'Academia Corpo em Forma',valor:11900},
 {id:'12',nome:'Restaurante Sabor Caseiro',valor:13550},
 {id:'13',nome:'Pet Shop Amigo Fiel',valor:14200},
 {id:'14',nome:'Parcela do celular 3/10',valor:18900},
 {id:'15',nome:'Conta de luz Copel',valor:21836},
 {id:'16',nome:'Loja de roupas Estilo',valor:27990},
 {id:'17',nome:'Curso de inglês (mensalidade)',valor:35000},
 {id:'18',nome:'Oficina do Zé',valor:48000},
 {id:'19',nome:'Parcela da moto 5/12',valor:89900},
 {id:'20',nome:'Material escolar',valor:1200}
];
window.QRPAY=function(it){return 'EDUPIX|'+it.id+'|'+it.valor};
window.QRPARSE=function(t){var m=/^EDUPIX\|(\d{2})\|(\d+)$/.exec(String(t||'').trim());if(!m)return null;var it=window.QRCAT.filter(function(x){return x.id===m[1]})[0];return it&&String(it.valor)===m[2]?it:null};
