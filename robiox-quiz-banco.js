/* RobIox — banco autoral de perguntas para Duelos de Quiz / Obby Trivia (6º–9º ano) + gerador de contas por ano + bandeiras em SVG.
   Formato de cada linha: pergunta|certa|errada1|errada2|errada3|explicação|nível(1-3). Perguntas autorais, gabarito revisado.
   API: window.RBX_QZ = { DISC, total(), pergunta(disc,nivel,rng,ano), sequencia(disc,seed,ano), mat(ano,nivel,rng), rng(seed), flagSVG(c), flagURL(c), alts(q,n,rng) } */
(function () {
  'use strict';
  var BANCO = {};
  BANCO.cie = `Qual é o maior órgão do corpo humano?|Pele|Fígado|Coração|Pulmão|A pele cobre todo o corpo e é o maior órgão.|1
Qual gás as plantas absorvem do ar para fazer a fotossíntese?|Gás carbônico|Oxigênio|Nitrogênio|Hélio|As plantas usam gás carbônico, água e luz para produzir glicose e liberar oxigênio.|1
Qual organela realiza a fotossíntese?|Cloroplasto|Mitocôndria|Ribossomo|Núcleo|O cloroplasto contém clorofila, que capta a luz.|2
Qual organela é chamada de "usina de energia" da célula?|Mitocôndria|Cloroplasto|Lisossomo|Complexo golgiense|Na mitocôndria ocorre a respiração celular.|2
Qual planeta é o mais próximo do Sol?|Mercúrio|Vênus|Terra|Marte|Mercúrio é o primeiro planeta do Sistema Solar.|1
Qual é o maior planeta do Sistema Solar?|Júpiter|Saturno|Netuno|Terra|Júpiter é um gigante gasoso, o maior de todos.|1
Qual planeta é conhecido como "planeta vermelho"?|Marte|Vênus|Júpiter|Mercúrio|O óxido de ferro deixa o solo de Marte avermelhado.|1
Quanto tempo, aproximadamente, a Terra leva para dar uma volta ao redor do Sol?|365 dias|24 horas|30 dias|7 dias|Esse movimento é a translação: cerca de 365 dias e 6 horas.|1
O movimento da Terra em torno do próprio eixo, que gera o dia e a noite, chama-se:|Rotação|Translação|Precessão|Eclipse|A rotação dura cerca de 24 horas.|1
Qual é a fórmula química da água?|H₂O|CO₂|O₂|NaCl|Dois átomos de hidrogênio e um de oxigênio.|1
Ao nível do mar, a água ferve a quantos graus Celsius?|100 °C|0 °C|50 °C|200 °C|Ao nível do mar a água entra em ebulição a 100 °C.|1
A passagem do estado sólido para o líquido chama-se:|Fusão|Solidificação|Condensação|Sublimação|Exemplo: o gelo derretendo.|1
A passagem do estado gasoso para o líquido chama-se:|Condensação|Fusão|Evaporação|Solidificação|Exemplo: gotinhas do lado de fora de um copo gelado.|2
Qual é o símbolo químico do ouro?|Au|Ag|O|Go|Vem do latim aurum.|2
Qual é o símbolo químico do sódio?|Na|S|So|Sd|Vem do latim natrium.|2
Qual é o símbolo químico do ferro?|Fe|F|Fr|I|Vem do latim ferrum.|2
Qual gás é o mais abundante na atmosfera terrestre?|Nitrogênio|Oxigênio|Gás carbônico|Argônio|O nitrogênio forma cerca de 78% do ar.|2
Qual parte da planta normalmente absorve água e sais minerais do solo?|Raiz|Folha|Flor|Fruto|A raiz fixa a planta e absorve água e nutrientes.|1
Animais que se alimentam apenas de plantas são chamados de:|Herbívoros|Carnívoros|Onívoros|Decompositores|Exemplos: boi, capivara e coelho.|1
Fungos e bactérias que transformam restos de seres vivos em nutrientes são os:|Decompositores|Produtores|Consumidores primários|Predadores|Eles devolvem nutrientes ao solo.|2
Em uma cadeia alimentar, as plantas são:|Produtoras|Consumidoras|Decompositoras|Parasitas|Elas produzem o próprio alimento pela fotossíntese.|1
Qual destes animais é um mamífero?|Baleia|Tubarão|Pinguim|Jacaré|A baleia respira por pulmões e amamenta os filhotes.|1
Qual destes animais é um anfíbio?|Sapo|Lagarto|Cobra|Tartaruga|Anfíbios vivem parte da vida na água e parte na terra.|1
Qual destes animais é um réptil?|Jacaré|Rã|Golfinho|Salamandra|Répteis têm pele com escamas e respiram por pulmões.|1
Quantos ossos tem, aproximadamente, o esqueleto de um adulto?|206|106|306|56|O esqueleto adulto tem cerca de 206 ossos.|2
Qual órgão bombeia o sangue pelo corpo?|Coração|Pulmão|Estômago|Rim|O coração é um músculo que bombeia o sangue.|1
Nos pulmões ocorre principalmente a:|Troca de gases|Digestão|Filtração do sangue|Produção de bile|O oxigênio entra no sangue e o gás carbônico sai.|1
Qual órgão filtra o sangue e produz a urina?|Rim|Fígado|Pâncreas|Baço|Os rins eliminam resíduos pela urina.|2
Onde começa a digestão dos alimentos?|Na boca|No estômago|No intestino grosso|No fígado|Na boca ocorrem a mastigação e a ação da saliva.|1
Qual sistema do corpo é formado pelo encéfalo, pela medula e pelos nervos?|Nervoso|Digestório|Circulatório|Respiratório|Ele controla e coordena o corpo.|1
Os glóbulos vermelhos (hemácias) transportam principalmente:|Oxigênio|Anticorpos|Hormônios|Gordura|A hemoglobina das hemácias carrega oxigênio.|2
Qual vitamina o corpo produz com a ajuda da luz do Sol?|Vitamina D|Vitamina C|Vitamina A|Vitamina K|A pele produz vitamina D com a luz solar.|2
A doença causada pela falta de vitamina C é o:|Escorbuto|Raquitismo|Bócio|Diabetes|O escorbuto causa sangramento nas gengivas.|3
Qual é a menor unidade que forma os seres vivos?|Célula|Átomo|Tecido|Órgão|Todos os seres vivos são formados por células.|1
Onde fica o material genético (DNA) das células eucariontes?|No núcleo|Na parede celular|No vacúolo|Na membrana|O núcleo guarda o DNA.|2
Seres formados por uma única célula são chamados de:|Unicelulares|Pluricelulares|Vertebrados|Invertebrados|Exemplos: bactérias e muitos protozoários.|1
Qual estrutura existe na célula vegetal e NÃO existe na célula animal?|Parede celular|Membrana plasmática|Núcleo|Mitocôndria|A parede de celulose dá rigidez à célula vegetal.|2
A força que puxa os objetos para o centro da Terra é a:|Gravidade|Força de atrito|Força elástica|Força magnética|É a atração gravitacional.|1
A unidade de medida de força no Sistema Internacional é o:|Newton|Joule|Watt|Metro|Homenagem a Isaac Newton.|2
A unidade de medida de energia no Sistema Internacional é o:|Joule|Newton|Volt|Pascal|O joule mede energia e trabalho.|3
Um carro percorre 120 km em 2 horas. Qual é a sua velocidade média?|60 km/h|240 km/h|120 km/h|30 km/h|Velocidade média = distância ÷ tempo = 120 ÷ 2 = 60 km/h.|2
A luz viaja mais rápido no:|Vácuo|Vidro|Água|Diamante|No vácuo a luz chega a cerca de 300 mil km por segundo.|3
O som NÃO se propaga no:|Vácuo|Ar|Água|Ferro|O som precisa de um meio material para se propagar.|2
Materiais que deixam a corrente elétrica passar facilmente são:|Condutores|Isolantes|Opacos|Transparentes|Exemplos: cobre e alumínio.|1
Qual destes materiais é um bom isolante elétrico?|Borracha|Cobre|Alumínio|Ferro|Por isso os fios são revestidos de borracha ou plástico.|1
A camada da atmosfera que filtra parte dos raios ultravioleta do Sol é a camada de:|Ozônio|Nitrogênio|Hidrogênio|Hélio|O ozônio absorve parte da radiação ultravioleta.|2
Qual destas fontes de energia é renovável?|Solar|Petróleo|Carvão mineral|Gás natural|A energia do Sol não se esgota na escala humana.|1
A maior parte da energia elétrica do Brasil vem de usinas:|Hidrelétricas|Nucleares|A carvão|Geotérmicas|A força da água dos rios gira as turbinas.|2
O aumento da temperatura média do planeta, ligado ao excesso de gases como o CO₂, é o:|Aquecimento global|Eclipse solar|Efeito dominó|Movimento de rotação|Os gases de efeito estufa retêm calor na atmosfera.|2
Qual é o satélite natural da Terra?|Lua|Sol|Marte|Estrela Polar|A Lua gira ao redor da Terra.|1
O ciclo das fases da Lua se repete a cada, aproximadamente:|29 dias|7 dias|365 dias|24 horas|O ciclo lunar dura cerca de 29,5 dias.|2
Quando a Lua passa entre o Sol e a Terra e esconde o Sol, ocorre um eclipse:|Solar|Lunar|Polar|Equatorial|No eclipse solar, a sombra da Lua atinge a Terra.|2
O Sol é uma:|Estrela|Planeta|Galáxia|Lua|É a estrela mais próxima da Terra.|1
Qual é a camada mais externa da Terra, onde vivemos?|Crosta|Manto|Núcleo externo|Núcleo interno|A crosta é fina comparada às outras camadas.|1
Rochas formadas pelo resfriamento do magma são as:|Magmáticas|Sedimentares|Metamórficas|Calcárias|Exemplos: granito e basalto.|2
Rochas formadas pelo acúmulo e compactação de sedimentos são as:|Sedimentares|Magmáticas|Metamórficas|Vulcânicas|Exemplo: arenito. Muitas guardam fósseis.|2
Quem propôs a teoria da evolução por seleção natural?|Charles Darwin|Isaac Newton|Albert Einstein|Louis Pasteur|Darwin publicou "A Origem das Espécies" em 1859.|2
Qual cientista criou a vacina contra a raiva?|Louis Pasteur|Charles Darwin|Marie Curie|Galileu Galilei|Pasteur também criou a pasteurização.|3
As vacinas ajudam o corpo a produzir:|Anticorpos|Vitaminas|Hormônios|Enzimas digestivas|Elas treinam o sistema imunológico.|2
A dengue é transmitida pelo mosquito:|Aedes aegypti|Anopheles|Barbeiro|Mosca doméstica|Evite água parada para combater o mosquito.|1
A doença de Chagas é transmitida pelo:|Barbeiro|Aedes aegypti|Caramujo|Pernilongo comum|O barbeiro transmite o protozoário Trypanosoma cruzi.|2
Os antibióticos NÃO servem para combater doenças causadas por:|Vírus|Bactérias|Infecções bacterianas na garganta|Bactérias na pele|Antibióticos agem contra bactérias, não contra vírus.|3
Qual é o pH da água pura a 25 °C?|7|0|14|1|pH 7 é neutro.|3
Uma substância com pH menor que 7 é:|Ácida|Básica|Neutra|Metálica|Exemplo: suco de limão.|2
Areia misturada com água forma uma mistura:|Heterogênea|Homogênea|Substância pura|Solução|Dá para ver as fases separadas.|2
Para separar a areia da água, um método simples é a:|Filtração|Destilação|Imantação|Fusão|O filtro retém a areia e deixa a água passar.|2
Para separar limalha de ferro da areia, usa-se:|Ímã|Peneira fina|Destilação|Evaporação|O ferro é atraído pelo ímã.|1
Os átomos são formados por prótons, nêutrons e:|Elétrons|Moléculas|Células|Cristais|Os elétrons ficam na eletrosfera.|2
A partícula do átomo com carga elétrica negativa é o:|Elétron|Próton|Nêutron|Núcleo|O próton é positivo e o nêutron não tem carga.|2
Quem organizou a tabela periódica em 1869, deixando lacunas para elementos ainda não descobertos?|Mendeleev|Newton|Darwin|Mendel|Dmitri Mendeleev ordenou os elementos pelas propriedades.|3
Quem é considerado o pai da genética por seus estudos com ervilhas?|Gregor Mendel|Charles Darwin|Robert Hooke|Louis Pasteur|Mendel estudou a herança das características.|3
A característica que aparece mesmo com apenas um alelo é chamada:|Dominante|Recessiva|Neutra|Adquirida|O alelo dominante se manifesta mesmo em heterozigose.|3
As mudanças da puberdade são controladas por hormônios do sistema:|Endócrino|Digestório|Excretor|Locomotor|O sistema endócrino produz hormônios.|3
Qual órgão produz a insulina?|Pâncreas|Fígado|Rim|Estômago|A insulina controla a quantidade de açúcar no sangue.|3
A energia associada ao movimento é a energia:|Cinética|Potencial|Química|Nuclear|Quanto maior a velocidade, maior a energia cinética.|2
Um objeto que flutua na água tem densidade:|Menor que a da água|Maior que a da água|Igual a zero|Igual à do ferro|Objetos menos densos que a água flutuam.|3
O bioma brasileiro com a maior floresta tropical do mundo é a:|Amazônia|Caatinga|Pampa|Pantanal|A Amazônia abriga milhares de espécies.|1
O bioma de clima semiárido que só existe no Brasil é a:|Caatinga|Mata Atlântica|Cerrado|Pampa|A caatinga tem plantas adaptadas à seca, como o mandacaru.|2`;

  BANCO.his = `Qual civilização construiu as pirâmides de Gizé?|Egípcia|Romana|Grega|Maia|Eram túmulos de faraós, construídos há mais de 4 mil anos.|1
Qual rio foi essencial para a civilização do Egito Antigo?|Nilo|Tigre|Amazonas|Danúbio|As cheias do Nilo fertilizavam as margens.|1
A Mesopotâmia ficava entre os rios:|Tigre e Eufrates|Nilo e Jordão|Indo e Ganges|Reno e Danúbio|Mesopotâmia quer dizer "terra entre rios".|2
Qual povo da Mesopotâmia criou a escrita cuneiforme?|Sumérios|Egípcios|Fenícios|Persas|Era feita em placas de argila com marcas em forma de cunha.|2
Os fenícios são lembrados por terem criado um:|Alfabeto|Calendário solar|Império na América|Sistema de numeração decimal|O alfabeto fenício influenciou o grego e o latino.|3
O Código de Hamurábi ficou famoso pelo princípio:|Olho por olho, dente por dente|Penso, logo existo|Liberdade, igualdade, fraternidade|Ordem e progresso|A lei de talião previa punições proporcionais ao crime.|2
Em qual cidade-estado grega surgiu a democracia?|Atenas|Esparta|Roma|Troia|Os cidadãos atenienses votavam em assembleia.|1
Qual cidade-estado grega era famosa pela educação militar rígida?|Esparta|Atenas|Corinto|Tebas|Os meninos espartanos treinavam para a guerra desde cedo.|2
Os Jogos Olímpicos surgiram na:|Grécia Antiga|Roma Antiga|China Antiga|Mesopotâmia|Eram disputados em Olímpia, em honra a Zeus.|1
Segundo a lenda, Roma foi fundada por:|Rômulo e Remo|Júlio César e Augusto|Zeus e Hera|Aquiles e Heitor|Os gêmeos teriam sido amamentados por uma loba.|2
Quem foi o primeiro imperador de Roma?|Augusto|Júlio César|Nero|Constantino|Otávio recebeu o título de Augusto em 27 a.C.|3
Em que ano caiu o Império Romano do Ocidente?|476|1453|1500|33|Em 476 o último imperador do Ocidente foi deposto.|3
O período da Europa entre os séculos V e XV é chamado de:|Idade Média|Idade Antiga|Idade Moderna|Pré-História|Vai da queda de Roma (476) à tomada de Constantinopla (1453).|1
No feudalismo, os camponeses presos à terra do senhor eram os:|Servos|Cavaleiros|Burgueses|Cardeais|Os servos pagavam tributos ao senhor feudal.|2
As expedições militares cristãs à Terra Santa na Idade Média foram as:|Cruzadas|Bandeiras|Entradas|Grandes Navegações|Aconteceram entre os séculos XI e XIII.|2
A epidemia que matou grande parte da população europeia no século XIV foi a:|Peste Negra|Gripe Espanhola|Varíola|Cólera|Era transmitida por pulgas de ratos.|2
Quem criou a prensa de tipos móveis na Europa, por volta de 1450?|Gutenberg|Galileu|Da Vinci|Lutero|A prensa barateou e espalhou os livros.|2
Quem pintou a "Mona Lisa"?|Leonardo da Vinci|Michelangelo|Rafael|Van Gogh|É uma obra do Renascimento italiano.|1
O movimento cultural que valorizou o ser humano e a razão entre os séculos XIV e XVI foi o:|Renascimento|Iluminismo|Romantismo|Modernismo|Nasceu nas cidades italianas.|2
Quem iniciou a Reforma Protestante em 1517?|Martinho Lutero|João Calvino|Henrique VIII|Galileu Galilei|Lutero publicou 95 teses criticando práticas da Igreja.|2
Em que ano Cristóvão Colombo chegou à América?|1492|1500|1822|1888|Ele navegava a serviço da Espanha.|1
Em que ano a esquadra de Pedro Álvares Cabral chegou ao Brasil?|1500|1492|1822|1889|Chegou em 22 de abril de 1500.|1
Qual foi o primeiro produto explorado pelos portugueses no Brasil?|Pau-brasil|Café|Ouro|Borracha|A madeira fornecia tinta vermelha.|1
As capitanias hereditárias foram criadas por Portugal no ano de:|1534|1500|1808|1888|Eram faixas de terra entregues a donatários.|3
Qual foi a primeira capital do Brasil?|Salvador|Rio de Janeiro|Brasília|São Paulo|Salvador foi capital de 1549 a 1763.|1
Qual era o principal produto da economia do Nordeste colonial nos séculos XVI e XVII?|Açúcar|Café|Algodão|Borracha|Os engenhos produziam açúcar para a Europa.|2
As comunidades formadas por pessoas escravizadas que conseguiam fugir eram os:|Quilombos|Engenhos|Feudos|Fortes|O mais famoso foi o Quilombo dos Palmares.|1
Qual líder do Quilombo dos Palmares é lembrado no Dia da Consciência Negra?|Zumbi|Tiradentes|Dom Pedro I|Duque de Caxias|O 20 de novembro marca a morte de Zumbi, em 1695.|2
As expedições paulistas que iam ao interior em busca de ouro e de indígenas eram as:|Bandeiras|Cruzadas|Capitanias|Sesmarias|Os bandeirantes ampliaram o território da colônia.|2
No século XVIII, a economia colonial passou a girar em torno do ouro de:|Minas Gerais|Pernambuco|Rio Grande do Sul|Amazonas|Cidades como Ouro Preto cresceram com a mineração.|2
Tiradentes participou de qual movimento?|Inconfidência Mineira|Revolução Farroupilha|Cabanagem|Balaiada|A conjuração de 1789 queria separar Minas de Portugal.|2
Em que ano a família real portuguesa chegou ao Brasil?|1808|1500|1822|1889|Ela fugia das tropas de Napoleão.|2
Quem proclamou a independência do Brasil?|Dom Pedro I|Dom Pedro II|Dom João VI|Deodoro da Fonseca|Foi em 7 de setembro de 1822.|1
Em que ano o Brasil se tornou independente de Portugal?|1822|1808|1888|1889|O grito do Ipiranga foi em 7 de setembro de 1822.|1
Qual lei aboliu a escravidão no Brasil em 1888?|Lei Áurea|Lei do Ventre Livre|Lei Eusébio de Queirós|Lei dos Sexagenários|Foi assinada em 13 de maio de 1888.|1
Quem assinou a Lei Áurea?|Princesa Isabel|Dom Pedro I|Marechal Deodoro|Getúlio Vargas|Ela era regente enquanto Dom Pedro II estava em viagem.|1
Em que ano foi proclamada a República no Brasil?|1889|1822|1888|1930|Em 15 de novembro de 1889.|1
Quem proclamou a República no Brasil?|Marechal Deodoro da Fonseca|Dom Pedro II|Getúlio Vargas|Tiradentes|Deodoro foi também o primeiro presidente.|2
Quem foi o último imperador do Brasil?|Dom Pedro II|Dom Pedro I|Dom João VI|Dom Miguel|Ele governou de 1840 a 1889.|2
A Lei do Ventre Livre (1871) declarava livres:|Os filhos de escravizadas nascidos a partir dela|Todos os idosos|Todos os escravizados|Somente os soldados|Foi uma das leis graduais antes da abolição.|3
A Revolução Farroupilha (1835–1845) aconteceu principalmente no atual estado do:|Rio Grande do Sul|Pará|Bahia|Maranhão|Foi a revolta mais longa do período imperial.|3
Na República Velha, a política do "café com leite" alternava o poder entre:|São Paulo e Minas Gerais|Rio de Janeiro e Bahia|Pernambuco e Paraíba|Paraná e Santa Catarina|São Paulo produzia café e Minas Gerais, leite.|2
Quem governou o Brasil de 1930 a 1945?|Getúlio Vargas|Juscelino Kubitschek|Dom Pedro II|Deodoro da Fonseca|O período ficou conhecido como Era Vargas.|2
A CLT, que reuniu as leis trabalhistas brasileiras, foi criada em:|1943|1888|1964|1988|Foi criada durante o governo de Getúlio Vargas.|3
Qual presidente construiu Brasília?|Juscelino Kubitschek|Getúlio Vargas|João Goulart|Dom Pedro II|Brasília foi inaugurada em 1960.|2
Em que ano Brasília foi inaugurada?|1960|1950|1889|1985|Em 21 de abril de 1960.|2
O regime militar no Brasil durou de:|1964 a 1985|1930 a 1945|1889 a 1930|1945 a 1964|Foram 21 anos de governos militares.|3
A atual Constituição do Brasil foi promulgada em:|1988|1824|1946|2000|É conhecida como "Constituição Cidadã".|2
O movimento de 1984 que pedia eleições diretas para presidente foi o:|Diretas Já|Tenentismo|Cabanagem|Balaiada|Milhões de pessoas foram às ruas pedindo o voto direto.|3
A Revolução Francesa começou em:|1789|1492|1914|1822|Com a tomada da Bastilha, em 14 de julho de 1789.|2
O lema da Revolução Francesa era:|Liberdade, Igualdade, Fraternidade|Ordem e Progresso|Paz e Amor|Deus, Pátria e Rei|O lema influenciou muitas revoluções.|2
A Revolução Industrial começou no século XVIII em qual país?|Inglaterra|França|Estados Unidos|Japão|As máquinas a vapor mudaram a produção.|2
A independência dos Estados Unidos foi declarada em:|1776|1789|1822|1492|Em 4 de julho de 1776.|2
A Primeira Guerra Mundial ocorreu entre:|1914 e 1918|1939 e 1945|1789 e 1799|1861 e 1865|Envolveu as grandes potências europeias.|2
A Segunda Guerra Mundial ocorreu entre:|1939 e 1945|1914 e 1918|1950 e 1953|1808 e 1822|Foi o conflito mais mortal da história.|1
O muro que dividia uma cidade alemã e caiu em 1989 era o Muro de:|Berlim|Paris|Moscou|Viena|Sua queda simbolizou o fim da Guerra Fria.|2
A disputa entre Estados Unidos e União Soviética depois de 1945 ficou conhecida como:|Guerra Fria|Guerra dos Cem Anos|Guerra do Paraguai|Primeira Guerra|Não houve guerra direta entre as duas potências.|2
Em que ano o ser humano pisou na Lua pela primeira vez?|1969|1957|1989|2001|A missão Apollo 11 levou os primeiros astronautas à Lua.|2
Quem foi o primeiro ser humano a pisar na Lua?|Neil Armstrong|Yuri Gagarin|Marcos Pontes|Santos Dumont|Ele desceu do módulo lunar em 1969.|2
Quem foi o primeiro ser humano a ir ao espaço, em 1961?|Yuri Gagarin|Neil Armstrong|Marcos Pontes|Albert Einstein|O cosmonauta soviético deu uma volta ao redor da Terra.|3
Na Guerra do Paraguai (1864–1870), o Paraguai lutou contra a aliança de:|Brasil, Argentina e Uruguai|Brasil, Chile e Peru|Argentina, Bolívia e Chile|Portugal e Espanha|Foi a chamada Tríplice Aliança.|3
Santos Dumont é famoso por ter voado em Paris, em 1906, com o:|14-Bis|Zepelim|Apollo 11|Concorde|O 14-Bis decolou por meios próprios diante do público.|1
Quem foram os primeiros habitantes do território que hoje é o Brasil?|Povos indígenas|Portugueses|Holandeses|Espanhóis|Eles viviam aqui milhares de anos antes de 1500.|1
O período anterior à invenção da escrita é chamado de:|Pré-História|Idade Média|Idade Moderna|Idade Contemporânea|A escrita surgiu por volta de 3500 a.C.|1
O domínio do fogo e as ferramentas de pedra lascada marcam o período:|Paleolítico|Neolítico|Idade dos Metais|Idade Média|Paleolítico quer dizer "pedra antiga".|2
A agricultura e a criação de animais se espalharam no período:|Neolítico|Paleolítico|Feudal|Renascentista|É a chamada Revolução Neolítica.|2
A Grande Muralha foi construída para proteger a:|China|Índia|Rússia|Pérsia|Ela tem milhares de quilômetros.|1
No século XVII, os holandeses ocuparam parte do Nordeste brasileiro, com destaque para:|Pernambuco|Rio Grande do Sul|São Paulo|Mato Grosso|Maurício de Nassau governou a partir de Recife.|3
Em que ano o Brasil foi elevado a Reino Unido a Portugal e Algarves?|1815|1808|1822|1500|Isso ocorreu durante a permanência de Dom João no Brasil.|3
O "Dia do Fico", em 1822, foi a decisão de Dom Pedro de:|Permanecer no Brasil|Voltar para Portugal|Abolir a escravidão|Proclamar a República|Ele contrariou as cortes portuguesas que exigiam sua volta.|3`;

  BANCO.geo = `Qual é a capital do Brasil?|Brasília|Rio de Janeiro|São Paulo|Salvador|É a capital desde 1960.|1
Quantos estados tem o Brasil, sem contar o Distrito Federal?|26|27|25|24|São 26 estados e o Distrito Federal.|1
Qual é o maior estado brasileiro em área?|Amazonas|Pará|Mato Grosso|Minas Gerais|O Amazonas tem mais de 1,5 milhão de km².|1
Qual é o menor estado brasileiro em área?|Sergipe|Alagoas|Rio de Janeiro|Espírito Santo|Sergipe fica no Nordeste.|2
Qual é a capital do Paraná?|Curitiba|Londrina|Maringá|Florianópolis|Curitiba é conhecida pelos parques.|1
Qual é a capital da Bahia?|Salvador|Recife|Fortaleza|Aracaju|Salvador foi a primeira capital do Brasil.|1
Qual é a capital de Minas Gerais?|Belo Horizonte|Ouro Preto|Uberlândia|Vitória|Belo Horizonte foi planejada no fim do século XIX.|1
Qual é a capital do Amazonas?|Manaus|Belém|Porto Velho|Boa Vista|Manaus fica às margens do Rio Negro.|1
Qual é a capital do Rio Grande do Sul?|Porto Alegre|Pelotas|Caxias do Sul|Florianópolis|Fica junto ao Lago Guaíba.|1
Qual é a capital de Santa Catarina?|Florianópolis|Joinville|Blumenau|Curitiba|Grande parte de Florianópolis fica em uma ilha.|2
Qual é a capital do Pará?|Belém|Manaus|Santarém|Macapá|Belém fica perto da foz do rio Amazonas.|2
Qual é a capital de Pernambuco?|Recife|Olinda|Natal|João Pessoa|Recife é cortada por rios e pontes.|2
Qual é a capital do Ceará?|Fortaleza|Natal|Teresina|São Luís|Fica no litoral do Nordeste.|2
Qual é a capital de Rondônia?|Porto Velho|Rio Branco|Cuiabá|Ji-Paraná|Fica às margens do rio Madeira.|2
Qual é a capital de Goiás?|Goiânia|Anápolis|Palmas|Brasília|Goiânia foi planejada nos anos 1930.|2
Qual é a capital do Tocantins?|Palmas|Araguaína|Goiânia|Teresina|O Tocantins é o estado mais novo, criado em 1988.|3
Qual é a capital de Mato Grosso do Sul?|Campo Grande|Cuiabá|Dourados|Corumbá|O estado foi criado em 1977.|2
Em quantas grandes regiões o IBGE divide o Brasil?|5|4|6|7|Norte, Nordeste, Centro-Oeste, Sudeste e Sul.|1
O Paraná pertence a qual região do Brasil?|Sul|Sudeste|Centro-Oeste|Norte|Junto com Santa Catarina e Rio Grande do Sul.|1
Qual é a região mais populosa do Brasil?|Sudeste|Nordeste|Sul|Norte|Nela ficam SP, RJ, MG e ES.|2
Qual é a maior região do Brasil em área?|Norte|Centro-Oeste|Nordeste|Sudeste|A região Norte ocupa cerca de 45% do país.|2
Qual é o maior rio do Brasil em volume de água?|Amazonas|São Francisco|Paraná|Tocantins|É também o rio mais caudaloso do mundo.|1
O rio São Francisco é conhecido como rio da:|Integração nacional|Fronteira do Sul|Amazônia|Serra do Mar|Ele liga o Sudeste ao Nordeste.|3
As Cataratas do Iguaçu ficam na fronteira do Brasil com a:|Argentina|Bolívia|Venezuela|Colômbia|Ficam no Paraná, em Foz do Iguaçu.|1
A Usina de Itaipu foi construída pelo Brasil em parceria com o:|Paraguai|Uruguai|Chile|Peru|Ela fica no rio Paraná.|2
Qual é o maior oceano do planeta?|Pacífico|Atlântico|Índico|Ártico|Cobre cerca de um terço da superfície da Terra.|1
Qual oceano banha o litoral do Brasil?|Atlântico|Pacífico|Índico|Ártico|Todo o litoral brasileiro é banhado pelo Atlântico.|1
Qual é o maior continente?|Ásia|África|América|Europa|A Ásia tem a maior área e a maior população.|1
Qual é o país mais populoso do mundo atualmente?|Índia|Estados Unidos|Brasil|Rússia|A Índia passou a China em 2023.|2
Qual é o maior país do mundo em área?|Rússia|Canadá|China|Brasil|A Rússia tem mais de 17 milhões de km².|1
Em área, o Brasil é o ____ maior país do mundo.|5º|2º|3º|10º|Fica atrás de Rússia, Canadá, China e Estados Unidos.|2
Qual é o maior deserto quente do mundo?|Saara|Atacama|Gobi|Kalahari|Fica no norte da África.|2
Qual é a montanha mais alta do mundo?|Everest|Aconcágua|Kilimanjaro|Mont Blanc|Tem cerca de 8.849 m e fica no Himalaia.|1
A linha imaginária que divide a Terra em hemisférios Norte e Sul é a Linha do:|Equador|Meridiano de Greenwich|Trópico de Câncer|Círculo Polar|O Equador tem latitude 0°.|1
O meridiano que divide a Terra em hemisférios Leste e Oeste é o de:|Greenwich|Tordesilhas|Capricórnio|Câncer|Passa por Londres e marca a longitude 0°.|2
O Trópico de Capricórnio corta qual estado do Sul do Brasil?|Paraná|Rio Grande do Sul|Santa Catarina|Bahia|Ele passa perto de Maringá, no Paraná.|3
A distância em graus de um lugar até a Linha do Equador é a:|Latitude|Longitude|Altitude|Escala|Vai de 0° a 90° Norte ou Sul.|2
Num mapa com escala 1:100.000, 1 cm representa:|1 km|100 m|10 km|100 km|100.000 cm = 1.000 m = 1 km.|3
O instrumento que aponta para o norte magnético é a:|Bússola|Luneta|Régua|Balança|A agulha imantada aponta para o norte magnético.|1
Os pontos cardeais são Norte, Sul, Leste e:|Oeste|Nordeste|Sudoeste|Centro|O Sol nasce no lado leste e se põe no oeste.|1
O Sol nasce, aproximadamente, no:|Leste|Oeste|Norte|Sul|Por isso o leste também é chamado de nascente.|1
O bioma do Centro-Oeste com árvores de troncos tortuosos e casca grossa é o:|Cerrado|Pampa|Caatinga|Manguezal|É chamado de "berço das águas".|2
A maior planície alagável do mundo, que fica no Brasil, é o:|Pantanal|Pampa|Cerrado|Sertão|Fica em Mato Grosso e Mato Grosso do Sul.|2
Os campos do sul do Rio Grande do Sul formam o bioma:|Pampa|Cerrado|Caatinga|Pantanal|São campos muito usados na pecuária.|2
A árvore símbolo do Paraná, que produz o pinhão, é a:|Araucária|Ipê-amarelo|Jequitibá|Seringueira|Também é chamada de pinheiro-do-paraná.|2
O bioma do litoral brasileiro que mais sofreu desmatamento é a:|Mata Atlântica|Amazônia|Caatinga|Pampa|Resta só uma pequena parte da cobertura original.|2
As pessoas que vivem nas cidades formam a população:|Urbana|Rural|Nômade|Ribeirinha|A maioria dos brasileiros vive em cidades.|1
A saída de grande número de pessoas do campo para as cidades é o:|Êxodo rural|Turismo|Censo|Relevo|Foi muito forte no Brasil no século XX.|2
Quem viaja todos os dias entre duas cidades para trabalhar ou estudar faz migração:|Pendular|Sazonal|Internacional|Forçada|Vai e volta todos os dias.|3
A sigla IBGE significa Instituto Brasileiro de:|Geografia e Estatística|Gestão Econômica|Governo Estadual|Geologia e Ecologia|O IBGE realiza o Censo.|2
Quando cidades vizinhas crescem e se juntam, ocorre a:|Conurbação|Erosão|Desertificação|Migração|Exemplo: São Paulo e as cidades vizinhas.|3
O Mercosul é um bloco econômico da:|América do Sul|Europa|Ásia|África|Foi criado em 1991 por Brasil, Argentina, Paraguai e Uruguai.|2
A moeda usada pela maioria dos países da União Europeia é o:|Euro|Dólar|Real|Peso|O euro circula desde 2002.|2
Qual destes países faz fronteira com o Brasil?|Peru|México|Equador|Chile|Chile e Equador são os únicos da América do Sul sem fronteira com o Brasil.|2
Quais países da América do Sul NÃO fazem fronteira com o Brasil?|Chile e Equador|Peru e Bolívia|Uruguai e Paraguai|Colômbia e Venezuela|Todos os outros países sul-americanos são vizinhos do Brasil.|3
Qual é o rio mais longo da África?|Nilo|Congo|Níger|Zambeze|Ele deságua no mar Mediterrâneo.|2
A Cordilheira dos Andes fica em qual lado da América do Sul?|Oeste|Leste|Norte|Centro|Ela acompanha o oceano Pacífico.|2
Qual é a capital da Argentina?|Buenos Aires|Montevidéu|Santiago|Assunção|Fica às margens do Rio da Prata.|1
Qual é a capital do Japão?|Tóquio|Pequim|Seul|Osaka|É uma das maiores metrópoles do mundo.|1
Qual é a capital da França?|Paris|Londres|Roma|Madri|É a cidade da Torre Eiffel.|1
Qual é a capital dos Estados Unidos?|Washington, D.C.|Nova York|Los Angeles|Chicago|Nova York é a maior cidade, mas a capital é Washington.|2
Qual é a capital do Canadá?|Ottawa|Toronto|Vancouver|Montreal|Toronto é a maior cidade, mas a capital é Ottawa.|3
Qual é a capital da Austrália?|Camberra|Sydney|Melbourne|Perth|Camberra foi planejada para ser a capital.|3
O aquecimento anormal das águas do oceano Pacífico que altera o clima é o:|El Niño|Monção|Furacão|Tsunami|Pode causar seca no Nordeste e chuva forte no Sul.|3
O movimento das placas tectônicas pode causar:|Terremotos|Eclipses|Fases da Lua|Estações do ano|As placas se chocam, se afastam ou deslizam.|2
O desgaste do solo causado pela chuva e pelo vento chama-se:|Erosão|Irrigação|Adubação|Rotação de culturas|A vegetação ajuda a segurar o solo.|2
A vegetação nas margens dos rios, que protege suas águas, é a mata:|Ciliar|De cocais|De araucárias|De restinga|Ela protege o rio como os cílios protegem os olhos.|2
Qual é o tipo de clima predominante na maior parte do Brasil?|Tropical|Polar|Temperado frio|Desértico|Quase todo o Brasil fica entre os trópicos.|1
As estações do ano acontecem principalmente por causa da:|Inclinação do eixo da Terra|Distância da Lua|Força dos ventos|Rotação da Lua|A inclinação muda a forma como a luz do Sol chega a cada hemisfério.|3`;

  BANCO.por = `Qual destas palavras é um substantivo?|Casa|Bonito|Correr|Rapidamente|O substantivo dá nome a seres, objetos e lugares.|1
Qual destas palavras é um adjetivo?|Feliz|Mesa|Pular|Ontem|O adjetivo indica uma qualidade.|1
Qual destas palavras é um verbo?|Estudar|Escola|Alegre|Muito|O verbo indica ação, estado ou fenômeno da natureza.|1
Qual é o plural de "cidadão"?|Cidadãos|Cidadões|Cidadães|Cidadans|É uma exceção: cidadão → cidadãos.|2
Qual é o plural de "pão"?|Pães|Pãos|Pões|Pans|pão → pães.|1
Qual é o plural de "animal"?|Animais|Animals|Animales|Animaus|Palavras terminadas em -al trocam por -ais.|1
Qual é o plural de "lápis"?|Lápis|Lápises|Lápizes|Lápiss|Paroxítonas terminadas em -s não mudam no plural.|2
Qual é o feminino de "ator"?|Atriz|Atora|Atoriz|Atrice|ator → atriz.|1
Qual é o feminino de "cavalo"?|Égua|Cavala|Cavalha|Potra|O feminino de cavalo é égua.|2
Qual palavra está escrita corretamente?|Exceção|Excessão|Esceção|Exeção|Exceção se escreve com xc e ç.|2
Qual palavra está escrita corretamente?|Paralisar|Paralizar|Parallisar|Paraliçar|Paralisar vem de paralisia, com S.|3
Qual palavra está escrita corretamente?|Cansaço|Cansasso|Cançaço|Kansaço|Cansaço se escreve com S e Ç.|2
Qual palavra está escrita corretamente?|Chuchu|Xuxu|Chuxu|Xuchu|Chuchu se escreve com CH.|2
Qual palavra está escrita corretamente?|Enxergar|Enchergar|Inxergar|Enxergár|Depois de "en" usa-se X, em geral.|2
Qual é o sinônimo de "alegre"?|Contente|Triste|Bravo|Cansado|Sinônimos têm sentidos parecidos.|1
Qual é o antônimo de "generoso"?|Egoísta|Bondoso|Gentil|Caridoso|Antônimos têm sentidos opostos.|1
Qual é o antônimo de "antigo"?|Moderno|Velho|Arcaico|Passado|Antigo é o oposto de moderno.|1
Qual é o sinônimo de "rápido"?|Veloz|Lento|Calmo|Pesado|Veloz e rápido têm o mesmo sentido.|1
Quantas sílabas tem a palavra "borboleta"?|4|3|5|2|bor-bo-le-ta.|1
Qual é a separação silábica correta de "pássaro"?|pás-sa-ro|pá-ssa-ro|pás-sar-o|p-ás-sa-ro|As letras do dígrafo SS ficam em sílabas diferentes.|2
Na palavra "café", a sílaba tônica é a:|Última|Penúltima|Antepenúltima|Primeira e a última|ca-FÉ é oxítona.|2
Qual destas palavras é proparoxítona?|Lâmpada|Caderno|Sofá|Mesa|LÂM-pa-da: a tônica é a antepenúltima. Toda proparoxítona é acentuada.|2
Qual destas palavras é paroxítona?|Lápis|Café|Pássaro|Jacaré|LÁ-pis: a tônica é a penúltima sílaba.|3
Na frase "Os meninos jogaram bola", o sujeito é:|Os meninos|Jogaram|Bola|Jogaram bola|O sujeito é o termo sobre o qual se declara algo.|1
Na frase "Choveu muito ontem", o sujeito é:|Inexistente|Muito|Ontem|Choveu|Verbos de fenômenos da natureza formam orações sem sujeito.|3
Na frase "Maria comprou um livro", o termo "um livro" é:|Objeto direto|Sujeito|Objeto indireto|Adjunto adverbial|Ele completa o verbo sem preposição.|3
Qual destas palavras é um advérbio?|Ontem|Mesa|Bonita|Cantar|Ontem indica circunstância de tempo.|2
Qual destas palavras é um pronome pessoal?|Nós|Nosso|Este|Quem|Pronomes pessoais: eu, tu, ele, nós, vós, eles.|2
Qual destas palavras é um artigo definido?|O|Um|Uma|Uns|Os artigos definidos são o, a, os, as.|1
Qual destas palavras é um numeral?|Terceiro|Muito|Algum|Pouco|Numerais indicam quantidade ou ordem.|2
Qual destas palavras é uma preposição?|Com|Feliz|Eles|Rápido|Exemplos de preposição: a, de, com, em, para, por.|2
Qual destas palavras é uma conjunção?|Mas|Mesa|Belo|Ali|Conjunções ligam orações: e, mas, porque...|2
Em "Ele estudou, mas não passou", a palavra "mas" indica:|Oposição|Adição|Conclusão|Tempo|"Mas" é uma conjunção adversativa.|3
Qual frase está no tempo passado?|Eu estudei ontem.|Eu estudo agora.|Eu estudarei amanhã.|Eu vou estudar.|"Estudei" está no pretérito perfeito.|1
Qual frase está no tempo futuro?|Nós viajaremos amanhã.|Nós viajamos ontem.|Nós viajávamos sempre.|Nós estamos viajando.|"Viajaremos" está no futuro do presente.|2
Qual é o aumentativo de "casa"?|Casarão|Casinha|Casebre|Caseiro|Casinha e casebre são diminutivos.|1
Qual é o diminutivo de "pé"?|Pezinho|Pezão|Pezudo|Pedal|O sufixo -zinho forma diminutivos.|1
Em qual frase "mas" ou "mais" foi usado corretamente?|Quero mais suco.|Quero mas suco.|Ele é mas alto.|Estudei, mais não passei.|"Mais" indica quantidade; "mas" indica oposição.|2
Complete: "Não sei ____ ele faltou."|por que|porque|porquê|por quê|Em perguntas indiretas, usa-se "por que" separado.|3
Complete: "Ele faltou ____ estava doente."|porque|por que|porquê|por quê|"Porque", junto e sem acento, explica uma causa.|2
Complete: "Vou ____ escola."|à|a|há|ah|Ir a + a escola = à escola (crase).|3
Complete: "____ dois anos moro aqui."|Há|A|À|Ah|"Há" indica tempo passado (verbo haver).|3
Qual destas palavras deve ter acento gráfico?|Você|Mesa|Livro|Caderno|Oxítonas terminadas em -e recebem acento: você.|2
A figura de linguagem em "Ela tem olhos de mar" é a:|Metáfora|Hipérbole|Onomatopeia|Ironia|É uma comparação sem o conectivo "como".|3
"Morri de rir!" é um exemplo de:|Hipérbole|Metáfora|Eufemismo|Personificação|É um exagero proposital.|3
"Tic-tac" e "au-au" são exemplos de:|Onomatopeia|Metáfora|Antítese|Hipérbole|São palavras que imitam sons.|2
"O vento cantava na janela" é um exemplo de:|Personificação|Hipérbole|Onomatopeia|Antítese|Dá ações humanas a seres que não são humanos.|3
O texto que conta uma história com personagens, tempo e lugar é o:|Narrativo|Instrucional|Descritivo|Argumentativo|Tem enredo, personagens e narrador.|1
Uma receita de bolo é um texto:|Instrucional|Narrativo|Poético|Argumentativo|Ensina a fazer algo passo a passo.|1
O texto que defende uma opinião com argumentos é o:|Argumentativo|Narrativo|Instrucional|Descritivo|Exemplo: artigo de opinião.|2
As fábulas geralmente terminam com uma:|Moral|Receita|Manchete|Lista de compras|Têm animais como personagens e trazem uma lição.|1
Num poema, os versos são organizados em:|Estrofes|Parágrafos|Capítulos|Colunas|Estrofe é um conjunto de versos.|1
Qual sinal se usa no fim de uma pergunta direta?|Ponto de interrogação|Ponto final|Ponto de exclamação|Travessão|Exemplo: Você vem?|1
Em diálogos, a fala de um personagem costuma ser introduzida pelo:|Travessão|Ponto e vírgula|Ponto final|Parêntese|O travessão indica a fala.|2
Quem escreveu as histórias do "Sítio do Picapau Amarelo"?|Monteiro Lobato|Machado de Assis|Cecília Meireles|Ziraldo|Personagens: Emília, Narizinho e Pedrinho.|1
Quem escreveu "Dom Casmurro"?|Machado de Assis|José de Alencar|Monteiro Lobato|Carlos Drummond de Andrade|O livro, narrado por Bentinho, é de 1899.|2
Quem criou "O Menino Maluquinho"?|Ziraldo|Monteiro Lobato|Machado de Assis|Graciliano Ramos|O livro foi publicado em 1980.|1
Quem escreveu "Iracema" e "O Guarani"?|José de Alencar|Machado de Assis|Graciliano Ramos|Jorge Amado|É um grande nome do Romantismo brasileiro.|3
Quem escreveu "Vidas Secas"?|Graciliano Ramos|Jorge Amado|Clarice Lispector|José de Alencar|Retrata uma família de retirantes no sertão.|3
A palavra "girassol" foi formada por:|Composição|Derivação|Abreviação|Onomatopeia|gira + sol: duas palavras formam uma nova.|3
A palavra "infeliz" foi formada pelo acréscimo de um:|Prefixo|Sufixo|Plural|Acento|in- é um prefixo de negação.|2
Qual frase tem a concordância correta?|Os alunos chegaram cedo.|Os alunos chegou cedo.|O aluno chegaram cedo.|Os aluno chegaram cedo.|Sujeito no plural pede verbo no plural.|1
Qual frase está correta?|Faz dois anos que viajei.|Fazem dois anos que viajei.|Fazem dois ano que viajei.|Fizeram dois anos que viajei.|"Fazer" indicando tempo fica no singular.|3
Qual destas palavras se escreve com Ç?|Açúcar|Açeite|Çapato|Açima|Não se usa Ç antes de E e I, nem no início da palavra.|1
Qual é o coletivo de abelhas?|Enxame|Cardume|Matilha|Rebanho|Cardume é de peixes; matilha, de cães.|1
Qual é o coletivo de peixes?|Cardume|Alcateia|Constelação|Enxame|Alcateia é de lobos; constelação, de estrelas.|1
Qual é o coletivo de estrelas?|Constelação|Arquipélago|Biblioteca|Frota|Arquipélago é um conjunto de ilhas.|2
Qual é o coletivo de ilhas?|Arquipélago|Constelação|Cordilheira|Pomar|Cordilheira é um conjunto de montanhas.|2
A palavra "mal" é o oposto de:|Bem|Bom|Mau|Ruim|mal ↔ bem; mau ↔ bom.|3
Qual é a língua oficial do Brasil?|Português|Espanhol|Inglês|Francês|A Libras também é reconhecida por lei como meio de comunicação.|1`;

  BANCO.ing = `Como se diz "gato" em inglês?|Cat|Dog|Bird|Fish|Dog = cachorro; bird = pássaro.|1
Como se diz "cachorro" em inglês?|Dog|Cat|Cow|Horse|Cow = vaca; horse = cavalo.|1
O que significa "red"?|Vermelho|Azul|Verde|Amarelo|Blue = azul; green = verde; yellow = amarelo.|1
O que significa "blue"?|Azul|Preto|Branco|Rosa|Black = preto; white = branco.|1
Como se diz "maçã" em inglês?|Apple|Banana|Orange|Grape|Orange = laranja; grape = uva.|1
Qual número é "twelve"?|12|20|2|11|Eleven = 11; twenty = 20.|1
Qual número é "fifteen"?|15|50|5|14|Fifty = 50.|2
Qual número é "forty"?|40|14|4|44|Fourteen = 14.|2
O que significa "Monday"?|Segunda-feira|Domingo|Sábado|Sexta-feira|Sunday = domingo; Friday = sexta-feira.|1
O que significa "Friday"?|Sexta-feira|Quinta-feira|Sábado|Segunda-feira|Thursday = quinta-feira; Saturday = sábado.|2
Qual mês é "January"?|Janeiro|Junho|Julho|Fevereiro|June = junho; July = julho.|1
Como se diz "irmão" em inglês?|Brother|Sister|Father|Mother|Sister = irmã.|1
O que significa "grandmother"?|Avó|Avô|Tia|Mãe|Grandfather = avô.|1
Complete: "I ___ a student."|am|is|are|be|Com I usamos am.|1
Complete: "She ___ my friend."|is|am|are|be|Com he, she e it usamos is.|1
Complete: "They ___ happy."|are|is|am|be|Com we, you e they usamos are.|1
Complete: "He ___ soccer every day."|plays|play|playing|played|No simple present, he/she/it recebe -s.|2
Complete: "I ___ TV yesterday."|watched|watch|watches|watching|Yesterday pede o passado: watched.|2
Qual é o passado de "go"?|went|goed|gone|going|Go é irregular: go – went – gone.|2
Qual é o passado de "eat"?|ate|eated|eaten|eats|Eat – ate – eaten.|3
Qual é o passado de "buy"?|bought|buyed|brought|buys|Buy – bought – bought.|3
Complete: "We ___ going to the beach tomorrow."|are|is|am|be|Futuro com going to: we are going to.|2
Complete: "Look! It ___ raining."|is|are|am|be|Present continuous: it is raining.|2
Qual é o plural de "child"?|children|childs|childes|childrens|É um plural irregular.|2
Qual é o plural de "mouse" (rato)?|mice|mouses|mices|meese|É um plural irregular.|3
Qual é o plural de "box"?|boxes|boxs|boxies|boxen|Palavras terminadas em x recebem -es.|2
Qual é o contrário de "big"?|small|tall|long|fat|Big = grande; small = pequeno.|1
Qual é o contrário de "hot"?|cold|warm|sunny|wet|Hot = quente; cold = frio.|1
O que significa "happy"?|Feliz|Triste|Bravo|Cansado|Sad = triste; angry = bravo.|1
O que significa "kitchen"?|Cozinha|Quarto|Banheiro|Sala|Bedroom = quarto; bathroom = banheiro.|2
O que significa "library"?|Biblioteca|Livraria|Laboratório|Lanchonete|Falso cognato! Livraria = bookstore.|3
O que significa "pretend"?|Fingir|Pretender|Prender|Preparar|Falso cognato! Pretender = intend.|3
O que significa "push"?|Empurrar|Puxar|Pular|Pegar|Pull = puxar.|3
Complete: "There ___ three books on the table."|are|is|am|be|There are para o plural.|2
Complete: "The cat is ___ the box." (dentro)|in|on|under|behind|In = dentro; on = em cima; under = embaixo.|2
Complete: "The ball is ___ the table." (embaixo)|under|on|in|between|Under = embaixo de.|2
Qual pronome substitui "Maria"?|She|He|It|They|She = ela.|1
Qual pronome substitui "the dogs"?|They|It|He|We|No plural usamos they.|2
Complete: "This is ___ book." (meu)|my|me|I|mine|Antes do substantivo usamos o possessivo my.|2
Como perguntar a idade de alguém em inglês?|How old are you?|How are you?|What is your name?|Where are you from?|How old are you? = Quantos anos você tem?|1
Qual é uma resposta adequada para "How are you?"|I am fine, thanks.|I am ten years old.|My name is Ana.|I am from Brazil.|How are you? = Como vai você?|1
Quando usamos "Good night"?|Na despedida, à noite|Ao acordar|Ao meio-dia|No almoço|Good evening é o cumprimento ao chegar à noite.|2
Que horas são em "It is half past three"?|3h30|3h15|2h30|3h45|Half past = e meia.|3
O que significa "always"?|Sempre|Nunca|Às vezes|Raramente|Never = nunca; sometimes = às vezes.|2
Complete: "She can ___ very well."|swim|swims|swimming|swam|Depois de can, o verbo fica na forma base.|2
Complete: "An elephant is ___ than a dog."|bigger|biggest|more big|big|Adjetivo curto: big → bigger.|3
Complete: "Mount Everest is the ___ mountain in the world."|highest|higher|most high|high|Superlativo: the highest.|3
Complete: "___ you like pizza?"|Do|Does|Are|Is|Com you, a pergunta no simple present usa do.|2
Complete: "___ he live in Paraná?"|Does|Do|Is|Are|Com he, she e it usamos does.|2
Complete: "I do not have ___ money."|any|some|a|many|Em frases negativas usamos any.|3
O que significa "teacher"?|Professor(a)|Aluno(a)|Diretor(a)|Médico(a)|Student = aluno(a).|1
O que significa "nurse"?|Enfermeiro(a)|Médico(a)|Advogado(a)|Cozinheiro(a)|Doctor = médico; cook = cozinheiro.|2
Como se diz "chuva" em inglês?|rain|snow|wind|sun|Snow = neve; wind = vento.|1
O que significa "weekend"?|Fim de semana|Dia útil|Feriado|Semana que vem|Saturday e Sunday.|1
Como se diz "obrigado" em inglês?|Thank you|Please|Sorry|Excuse me|Please = por favor; sorry = desculpe.|1
O que significa "breakfast"?|Café da manhã|Almoço|Jantar|Lanche|Lunch = almoço; dinner = jantar.|2
Complete: "Yesterday I ___ at home."|was|were|am|is|Passado do verbo to be com I: was.|2
Complete: "They ___ at school yesterday."|were|was|are|is|Com they: were.|2
O que significa "where"?|Onde|Quando|Quem|Por que|When = quando; who = quem; why = por que.|1
O que significa "why"?|Por que|Onde|Como|Qual|How = como; which = qual.|1
Complete: "I will ___ you tomorrow."|call|calls|called|calling|Depois de will, o verbo fica na forma base.|2
O que significa "bridge"?|Ponte|Prédio|Praia|Rua|Building = prédio; street = rua.|3
Qual destas palavras é uma fruta?|Strawberry|Carrot|Potato|Onion|Strawberry = morango.|1
O que significa "elbow"?|Cotovelo|Joelho|Ombro|Tornozelo|Knee = joelho; shoulder = ombro.|3
Complete: "My birthday is ___ May."|in|on|at|to|Com meses usamos in.|3`;

  BANCO.mat = `Ana tinha 35 figurinhas e ganhou 18. Com quantas ficou?|53|43|17|63|35 + 18 = 53.|1
Um pacote tem 12 biscoitos. Quantos biscoitos há em 7 pacotes?|84|72|19|94|12 × 7 = 84.|1
96 alunos serão divididos em equipes de 8. Quantas equipes serão formadas?|12|11|14|88|96 ÷ 8 = 12.|1
Quanto é 25% de 80?|20|25|40|8|25% é 1/4; 80 ÷ 4 = 20.|2
Quanto é 10% de 350?|35|3,5|350|10|10% é dividir por 10.|1
Um produto de R$ 200 teve 15% de desconto. Qual é o novo preço?|R$ 170|R$ 185|R$ 150|R$ 230|15% de 200 = 30; 200 − 30 = 170.|2
Qual é a metade de 3/4?|3/8|3/2|6/4|1/4|3/4 ÷ 2 = 3/8.|3
Quanto é 1/2 + 1/4?|3/4|2/6|1/6|2/4|1/2 = 2/4; 2/4 + 1/4 = 3/4.|2
Qual é o perímetro de um quadrado de lado 7 cm?|28 cm|49 cm|14 cm|21 cm|4 × 7 = 28.|1
Qual é a área de um retângulo de 8 m por 5 m?|40 m²|26 m²|13 m²|45 m²|8 × 5 = 40.|1
Qual é a área de um triângulo de base 10 cm e altura 6 cm?|30 cm²|60 cm²|16 cm²|36 cm²|(10 × 6) ÷ 2 = 30.|2
Quanto vale a soma dos ângulos internos de um triângulo?|180°|90°|360°|270°|Vale para qualquer triângulo.|2
Quantos graus tem um ângulo reto?|90°|180°|45°|360°|O ângulo reto mede 90°.|1
Quantos minutos há em 2 horas e meia?|150|130|250|120|2 × 60 + 30 = 150.|1
Quantos centímetros há em 3,5 metros?|350|35|3500|305|1 m = 100 cm.|2
Um carro faz 12 km por litro. Quantos litros ele gasta em 180 km?|15|12|18|20|180 ÷ 12 = 15.|2
Se 3 cadernos custam R$ 27, quanto custam 5 cadernos iguais?|R$ 45|R$ 35|R$ 54|R$ 40|Cada um custa R$ 9; 5 × 9 = 45.|2
Qual é a média de 6, 8 e 10?|8|24|9|7|(6 + 8 + 10) ÷ 3 = 8.|2
Qual é o valor de x em x + 9 = 23?|14|32|13|15|x = 23 − 9 = 14.|2
Qual é o valor de x em 3x = 42?|14|39|45|12|x = 42 ÷ 3 = 14.|2
Qual é o valor de x em 2x + 5 = 17?|6|11|7|8|2x = 12, então x = 6.|3
Quanto é (−3) × (−4)?|12|−12|7|−7|Sinais iguais dão resultado positivo.|3
Quanto é −8 + 5?|−3|3|−13|13|Sinais diferentes: subtrai e fica o sinal do número de maior valor absoluto.|2
Quanto é 2⁵?|32|10|25|16|2 × 2 × 2 × 2 × 2 = 32.|2
Qual é a raiz quadrada de 144?|12|14|72|11|12 × 12 = 144.|2
Qual é o MMC de 4 e 6?|12|24|2|10|Os múltiplos comuns são 12, 24, 36... o menor é 12.|3
Qual é o MDC de 18 e 24?|6|3|12|72|O maior divisor comum é 6.|3
Num dado comum, qual é a probabilidade de sair o número 5?|1/6|1/5|5/6|1/2|Um resultado favorável em seis possíveis.|2
Um triângulo retângulo tem catetos 3 e 4. Quanto mede a hipotenusa?|5|7|6|12|3² + 4² = 25 e √25 = 5.|3
Qual destes números é primo?|17|21|27|15|17 só é divisível por 1 e por ele mesmo.|2
Qual é o volume de um cubo de aresta 3 cm?|27 cm³|9 cm³|18 cm³|12 cm³|3 × 3 × 3 = 27.|2
Uma pizza foi cortada em 8 fatias e foram comidas 3. Que fração sobrou?|5/8|3/8|3/5|5/3|Sobraram 5 das 8 fatias.|1`;

  /* ---------------- Bandeiras (desenhadas em SVG, viewBox 30x20) ---------------- */
  function R(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; }
  function C(x, y, r, c, st) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + (st ? 'fill="none" stroke="' + c + '" stroke-width="' + st + '"' : 'fill="' + c + '"') + '/>'; }
  function P(pts, c) { return '<polygon points="' + pts + '" fill="' + c + '"/>'; }
  function S(x, y, r, c) { var p = [], i, a, rr; for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; rr = i % 2 ? r * 0.4 : r; p.push((x + rr * Math.cos(a)).toFixed(2) + ',' + (y + rr * Math.sin(a)).toFixed(2)); } return P(p.join(' '), c); }
  function HZ(cs) { var h = 20 / cs.length, s = '', i; for (i = 0; i < cs.length; i++) s += R(0, (i * h).toFixed(3), 30, (h + 0.05).toFixed(3), cs[i]); return s; }
  function VT(cs) { var w = 30 / cs.length, s = '', i; for (i = 0; i < cs.length; i++) s += R((i * w).toFixed(3), 0, (w + 0.05).toFixed(3), 20, cs[i]); return s; }
  function HW(cs, ws) { var t = 0, s = '', y = 0, i; ws.forEach(function (w) { t += w; }); for (i = 0; i < cs.length; i++) { var h = 20 * ws[i] / t; s += R(0, y.toFixed(3), 30, (h + 0.05).toFixed(3), cs[i]); y += h; } return s; }
  function L(x1, y1, x2, y2, c, w) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + w + '"/>'; }
  function NC(bg, cr, wide) { return R(0, 0, 30, 20, bg) + (wide ? R(8, 0, 5, 20, wide) + R(0, 7.5, 30, 5, wide) : '') + R(9, 0, 3, 20, cr) + R(0, 8.5, 30, 3, cr); }
  function STRIPES(n, a, b) { var h = 20 / n, s = '', i; for (i = 0; i < n; i++) s += R(0, (i * h).toFixed(3), 30, (h + 0.05).toFixed(3), i % 2 ? b : a); return s; }
  var FL = {
    br: ['Brasil', 'Brasília', 'am', function () { return R(0, 0, 30, 20, '#009c3b') + P('3,10 15,2 27,10 15,18', '#ffdf00') + C(15, 10, 4.6, '#002776') + '<path d="M10.6,8.9 Q15.5,7.6 19.5,11.2" stroke="#fff" stroke-width=".9" fill="none"/>' + C(13, 12, .3, '#fff') + C(16, 12.6, .3, '#fff') + C(17.5, 13, .25, '#fff'); }],
    ar: ['Argentina', 'Buenos Aires', 'am', function () { return HZ(['#74acdf', '#fff', '#74acdf']) + C(15, 10, 2, '#f6b40e'); }],
    fr: ['França', 'Paris', 'eu', function () { return VT(['#0055a4', '#fff', '#ef4135']); }],
    it: ['Itália', 'Roma', 'eu', function () { return VT(['#009246', '#fff', '#ce2b37']); }],
    ie: ['Irlanda', 'Dublin', 'eu', function () { return VT(['#169b62', '#fff', '#ff883e']); }],
    be: ['Bélgica', 'Bruxelas', 'eu', function () { return VT(['#111', '#fdda24', '#ef3340']); }],
    mx: ['México', 'Cidade do México', 'am', function () { return VT(['#006847', '#fff', '#ce1126']) + C(15, 10, 2.3, '#8c5a2b') + C(15, 10, 2.3, '#3a7d2c', .5); }],
    pe: ['Peru', 'Lima', 'am', function () { return VT(['#d91023', '#fff', '#d91023']); }],
    ng: ['Nigéria', 'Abuja', 'af', function () { return VT(['#008751', '#fff', '#008751']); }],
    ro: ['Romênia', 'Bucareste', 'eu', function () { return VT(['#002b7f', '#fcd116', '#ce1126']); }],
    ml: ['Mali', 'Bamako', 'af', function () { return VT(['#14b53a', '#fcd116', '#ce1126']); }],
    gn: ['Guiné', 'Conacri', 'af', function () { return VT(['#ce1126', '#fcd116', '#009460']); }],
    ci: ['Costa do Marfim', 'Yamoussoukro', 'af', function () { return VT(['#f77f00', '#fff', '#009e60']); }],
    de: ['Alemanha', 'Berlim', 'eu', function () { return HZ(['#111', '#dd0000', '#ffce00']); }],
    ru: ['Rússia', 'Moscou', 'eu', function () { return HZ(['#fff', '#0039a6', '#d52b1e']); }],
    nl: ['Países Baixos', 'Amsterdã', 'eu', function () { return HZ(['#ae1c28', '#fff', '#21468b']); }],
    at: ['Áustria', 'Viena', 'eu', function () { return HZ(['#ed2939', '#fff', '#ed2939']); }],
    hu: ['Hungria', 'Budapeste', 'eu', function () { return HZ(['#ce2939', '#fff', '#477050']); }],
    bg: ['Bulgária', 'Sófia', 'eu', function () { return HZ(['#fff', '#00966e', '#d62612']); }],
    ee: ['Estônia', 'Tallinn', 'eu', function () { return HZ(['#0072ce', '#111', '#fff']); }],
    lt: ['Lituânia', 'Vilnius', 'eu', function () { return HZ(['#fdb913', '#006a44', '#c1272d']); }],
    bo: ['Bolívia', null, 'am', function () { return HZ(['#d52b1e', '#f9e300', '#007934']); }],
    co: ['Colômbia', 'Bogotá', 'am', function () { return HW(['#fcd116', '#003893', '#ce1126'], [2, 1, 1]); }],
    ga: ['Gabão', 'Libreville', 'af', function () { return HZ(['#009e60', '#fcd116', '#3a75c4']); }],
    sl: ['Serra Leoa', 'Freetown', 'af', function () { return HZ(['#1eb53a', '#fff', '#0072c6']); }],
    ye: ['Iêmen', 'Saná', 'as', function () { return HZ(['#ce1126', '#fff', '#111']); }],
    am: ['Armênia', 'Erevã', 'as', function () { return HZ(['#d90012', '#0033a0', '#f2a800']); }],
    in: ['Índia', 'Nova Délhi', 'as', function () { return HZ(['#ff9933', '#fff', '#138808']) + C(15, 10, 2.4, '#000080', .5) + C(15, 10, .5, '#000080'); }],
    es: ['Espanha', 'Madri', 'eu', function () { return HW(['#aa151b', '#f1bf00', '#aa151b'], [1, 2, 1]) + R(7, 8, 2.4, 3.5, '#aa151b'); }],
    ua: ['Ucrânia', 'Kiev', 'eu', function () { return HZ(['#0057b7', '#ffd700']); }],
    pl: ['Polônia', 'Varsóvia', 'eu', function () { return HZ(['#fff', '#dc143c']); }],
    id: ['Indonésia', null, 'as', function () { return HZ(['#ce1126', '#fff']); }],
    jp: ['Japão', 'Tóquio', 'as', function () { return R(0, 0, 30, 20, '#fff') + C(15, 10, 6, '#bc002d'); }],
    bd: ['Bangladesh', 'Daca', 'as', function () { return R(0, 0, 30, 20, '#006a4e') + C(13.5, 10, 6, '#f42a41'); }],
    ch: ['Suíça', 'Berna', 'eu', function () { return R(0, 0, 30, 20, '#da291c') + R(13.2, 4, 3.6, 12, '#fff') + R(9, 8.2, 12, 3.6, '#fff'); }],
    dk: ['Dinamarca', 'Copenhague', 'eu', function () { return NC('#c8102e', '#fff'); }],
    se: ['Suécia', 'Estocolmo', 'eu', function () { return NC('#006aa7', '#fecc00'); }],
    no: ['Noruega', 'Oslo', 'eu', function () { return NC('#ba0c2f', '#00205b', '#fff'); }],
    fi: ['Finlândia', 'Helsinque', 'eu', function () { return NC('#fff', '#002f6c'); }],
    is: ['Islândia', 'Reykjavík', 'eu', function () { return NC('#02529c', '#dc1e35', '#fff'); }],
    gr: ['Grécia', 'Atenas', 'eu', function () { return STRIPES(9, '#0d5eaf', '#fff') + R(0, 0, 11.1, 11.1, '#0d5eaf') + R(4.45, 0, 2.2, 11.1, '#fff') + R(0, 4.45, 11.1, 2.2, '#fff'); }],
    us: ['Estados Unidos', 'Washington, D.C.', 'am', function () { var s = STRIPES(13, '#b22234', '#fff') + R(0, 0, 12, 10.77, '#3c3b6e'), i, j; for (i = 0; i < 5; i++) for (j = 0; j < 6; j++) s += C(1.1 + j * 1.95, 1.1 + i * 2.1, .45, '#fff'); return s; }],
    ca: ['Canadá', 'Ottawa', 'am', function () { return R(0, 0, 30, 20, '#fff') + R(0, 0, 7.5, 20, '#d52b1e') + R(22.5, 0, 7.5, 20, '#d52b1e') + P('15,3.5 16.2,5.8 17.6,5.2 17.2,8.2 19.6,6.8 20,8 21.8,7.6 21,10 22,10.6 18.6,13.4 19,14.6 15.4,14.2 15.4,17 14.6,17 14.6,14.2 11,14.6 11.4,13.4 8,10.6 9,10 8.2,7.6 10,8 10.4,6.8 12.8,8.2 12.4,5.2 13.8,5.8', '#d52b1e'); }],
    cn: ['China', 'Pequim', 'as', function () { return R(0, 0, 30, 20, '#de2910') + S(5, 5, 3, '#ffde00') + S(10, 2, 1, '#ffde00') + S(12, 4, 1, '#ffde00') + S(12, 7, 1, '#ffde00') + S(10, 9, 1, '#ffde00'); }],
    vn: ['Vietnã', 'Hanói', 'as', function () { return R(0, 0, 30, 20, '#da251d') + S(15, 10.5, 6, '#ffff00'); }],
    tr: ['Turquia', 'Ancara', 'as', function () { return R(0, 0, 30, 20, '#e30a17') + C(11, 10, 5, '#fff') + C(12.3, 10, 4, '#e30a17') + S(17.2, 10, 2.2, '#fff'); }],
    cl: ['Chile', 'Santiago', 'am', function () { return HZ(['#fff', '#d52b1e']) + R(0, 0, 10, 10, '#0039a6') + S(5, 5.3, 2.6, '#fff'); }],
    cu: ['Cuba', 'Havana', 'am', function () { return STRIPES(5, '#002a8f', '#fff') + P('0,0 13,10 0,20', '#cf142b') + S(4.5, 10.3, 2.6, '#fff'); }],
    jm: ['Jamaica', 'Kingston', 'am', function () { return R(0, 0, 30, 20, '#009b3a') + P('0,0 13,10 0,20', '#111') + P('30,0 17,10 30,20', '#111') + L(0, 0, 30, 20, '#fed100', 2.6) + L(30, 0, 0, 20, '#fed100', 2.6); }],
    pt: ['Portugal', 'Lisboa', 'eu', function () { return R(0, 0, 12, 20, '#046a38') + R(12, 0, 18, 20, '#da291c') + C(12, 10, 3.6, '#ffe900') + R(10.6, 8.2, 2.8, 3.4, '#fff') + R(11.1, 8.7, 1.8, 2.4, '#003399'); }],
    uy: ['Uruguai', 'Montevidéu', 'am', function () { return STRIPES(9, '#fff', '#0038a8') + R(0, 0, 11.1, 11.1, '#fff') + C(5.5, 5.5, 2.8, '#fcd116'); }],
    py: ['Paraguai', 'Assunção', 'am', function () { return HZ(['#d52b1e', '#fff', '#0038a8']) + C(15, 10, 2, '#1a7f2e', .5) + S(15, 10, 1, '#fcd116'); }],
    gb: ['Reino Unido', 'Londres', 'eu', function () { return R(0, 0, 30, 20, '#012169') + L(0, 0, 30, 20, '#fff', 4) + L(30, 0, 0, 20, '#fff', 4) + L(0, 0, 30, 20, '#c8102e', 1.3) + L(30, 0, 0, 20, '#c8102e', 1.3) + R(12.5, 0, 5, 20, '#fff') + R(0, 7.5, 30, 5, '#fff') + R(13.5, 0, 3, 20, '#c8102e') + R(0, 8.5, 30, 3, '#c8102e'); }],
    eg: ['Egito', 'Cairo', 'af', function () { return HZ(['#ce1126', '#fff', '#111']) + C(15, 10, 1.8, '#c09300'); }],
    ve: ['Venezuela', 'Caracas', 'am', function () { var s = HZ(['#fcd116', '#00247d', '#cf142b']), i, a; for (i = 0; i < 8; i++) { a = Math.PI * (1.1 + i * 0.8 / 7); s += S(15 + 4.6 * Math.cos(a), 12.6 + 4.6 * Math.sin(a), .7, '#fff'); } return s; }],
    pa: ['Panamá', 'Cidade do Panamá', 'am', function () { return R(0, 0, 30, 20, '#fff') + R(15, 0, 15, 10, '#da121a') + R(0, 10, 15, 10, '#072357') + S(7.5, 5, 2.4, '#072357') + S(22.5, 15, 2.4, '#da121a'); }],
    cz: ['Tchéquia', 'Praga', 'eu', function () { return HZ(['#fff', '#d7141a']) + P('0,0 15,10 0,20', '#11457e'); }],
    ph: ['Filipinas', 'Manila', 'as', function () { return HZ(['#0038a8', '#ce1126']) + P('0,0 17.3,10 0,20', '#fff') + C(6, 10, 2, '#fcd116') + S(1.6, 2.6, .7, '#fcd116') + S(1.6, 17.4, .7, '#fcd116') + S(14.3, 10, .7, '#fcd116'); }],
    bs: ['Bahamas', 'Nassau', 'am', function () { return HZ(['#00abc9', '#ffc72c', '#00abc9']) + P('0,0 13,10 0,20', '#111'); }],
    so: ['Somália', 'Mogadíscio', 'af', function () { return R(0, 0, 30, 20, '#4189dd') + S(15, 10.4, 5, '#fff'); }],
    ma: ['Marrocos', 'Rabat', 'af', function () { var p = [], i, a; for (i = 0; i < 5; i++) { a = -Math.PI / 2 + i * 4 * Math.PI / 5; p.push((15 + 5 * Math.cos(a)).toFixed(2) + ',' + (10.5 + 5 * Math.sin(a)).toFixed(2)); } return R(0, 0, 30, 20, '#c1272d') + '<polygon points="' + p.join(' ') + '" fill="none" stroke="#006233" stroke-width=".9"/>'; }],
    gh: ['Gana', 'Acra', 'af', function () { return HZ(['#ce1126', '#fcd116', '#006b3f']) + S(15, 10.3, 3.2, '#111'); }],
    sn: ['Senegal', 'Dacar', 'af', function () { return VT(['#00853f', '#fdef42', '#e31b23']) + S(15, 10.3, 2.8, '#00853f'); }],
    cm: ['Camarões', 'Iaundé', 'af', function () { return VT(['#007a5e', '#ce1126', '#fcd116']) + S(15, 10.3, 2.8, '#fcd116'); }],
    et: ['Etiópia', 'Adis Abeba', 'af', function () { return HZ(['#078930', '#fcdd09', '#da121a']) + C(15, 10, 4, '#0f47af') + S(15, 10.3, 2.8, '#fcdd09'); }],
    lb: ['Líbano', 'Beirute', 'as', function () { return HW(['#ed1c24', '#fff', '#ed1c24'], [1, 2, 1]) + P('15,5.6 19.4,13.2 10.6,13.2', '#00a651') + R(14.5, 13.2, 1, 1.4, '#00a651'); }],
    pk: ['Paquistão', 'Islamabad', 'as', function () { return R(0, 0, 7.5, 20, '#fff') + R(7.5, 0, 22.5, 20, '#01411c') + C(19, 10.5, 5, '#fff') + C(20.4, 9.2, 4.5, '#01411c') + S(21.6, 7.6, 1.6, '#fff'); }],
    la: ['Laos', 'Vientiane', 'as', function () { return HW(['#ce1126', '#002868', '#ce1126'], [1, 2, 1]) + C(15, 10, 4, '#fff'); }],
    bw: ['Botsuana', 'Gaborone', 'af', function () { return R(0, 0, 30, 20, '#75aadb') + R(0, 7.8, 30, 4.4, '#fff') + R(0, 8.6, 30, 2.8, '#111'); }],
    th: ['Tailândia', 'Bangkok', 'as', function () { return HW(['#a51931', '#f4f5f8', '#2d2a4a', '#f4f5f8', '#a51931'], [1, 1, 2, 1, 1]); }],
    cr: ['Costa Rica', 'San José', 'am', function () { return HW(['#002b7f', '#fff', '#ce1126', '#fff', '#002b7f'], [1, 1, 2, 1, 1]); }],
    hn: ['Honduras', 'Tegucigalpa', 'am', function () { return HZ(['#0073cf', '#fff', '#0073cf']) + S(15, 10, 1, '#0073cf') + S(12, 8.6, 1, '#0073cf') + S(18, 8.6, 1, '#0073cf') + S(12, 11.4, 1, '#0073cf') + S(18, 11.4, 1, '#0073cf'); }]
  };
  var FCODES = Object.keys(FL);
  function flagSVG(c) { var f = FL[c]; if (!f) return ''; return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="300" height="200" preserveAspectRatio="none">' + f[3]() + '<rect x="0" y="0" width="30" height="20" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".3"/></svg>'; }
  var URLC = {};
  function flagURL(c) { return URLC[c] || (URLC[c] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(flagSVG(c))); }

  /* ---------------- utilidades ---------------- */
  function rng(seed) { var a = (seed >>> 0) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashStr(s) { var h = 2166136261, i; for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuf(a, R) { R = R || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fm(n) { n = Math.round(n * 1000) / 1000; return String(n).replace('.', ',').replace('-', '−'); }

  var DISC = [
    { id: 'mat', nome: 'Matemática', icone: '🧮', cor: '#2563eb' },
    { id: 'cie', nome: 'Ciências', icone: '🔬', cor: '#16a34a' },
    { id: 'his', nome: 'História', icone: '📜', cor: '#b45309' },
    { id: 'geo', nome: 'Geografia', icone: '🌍', cor: '#0891b2' },
    { id: 'por', nome: 'Português', icone: '📖', cor: '#db2777' },
    { id: 'ing', nome: 'Inglês', icone: '🇬🇧', cor: '#7c3aed' },
    { id: 'ban', nome: 'Bandeiras', icone: '🚩', cor: '#dc2626' },
    { id: 'mix', nome: 'Misturado', icone: '🎲', cor: '#475569' }
  ];
  var DN = {}; DISC.forEach(function (d) { DN[d.id] = d.nome; });

  var POOL = {};
  Object.keys(BANCO).forEach(function (k) {
    POOL[k] = BANCO[k].split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var p = l.split('|');
      return { q: p[0], a: p[1], d: [p[2], p[3], p[4]], e: p[5] || '', n: +p[6] || 1, disc: k };
    });
  });
  /* bandeiras: país da bandeira + capital */
  POOL.ban = [];
  FCODES.forEach(function (c) {
    var f = FL[c], same = FCODES.filter(function (o) { return o !== c && FL[o][2] === f[2]; });
    var nm = ['Lituânia', 'Hungria', 'Bolívia', 'Gabão', 'Mali', 'Guiné', 'Costa do Marfim', 'Irlanda', 'Iêmen', 'Armênia', 'Serra Leoa', 'Estônia', 'Botsuana', 'Laos', 'Bangladesh', 'Islândia', 'Bahamas', 'Somália'].indexOf(f[0]) >= 0 ? 3 : (['Brasil', 'Argentina', 'Japão', 'Estados Unidos', 'Canadá', 'Portugal', 'Itália', 'França', 'Alemanha', 'China', 'México', 'Espanha', 'Reino Unido', 'Chile', 'Uruguai', 'Paraguai'].indexOf(f[0]) >= 0 ? 1 : 2);
    POOL.ban.push({ q: 'De qual país é esta bandeira?', a: f[0], dpool: same.map(function (o) { return FL[o][0]; }), e: 'País desta bandeira: ' + f[0] + '.', n: nm, disc: 'ban', flag: c });
    if (f[1]) {
      var caps = same.filter(function (o) { return FL[o][1]; }).map(function (o) { return FL[o][1]; });
      POOL.ban.push({ q: 'País desta bandeira: ' + f[0] + '. Qual é a capital desse país?', a: f[1], dpool: caps, e: 'Capital: ' + f[1] + ' (' + f[0] + ').', n: Math.min(3, nm + 1), disc: 'ban', flag: c });
    }
  });

  function fromItem(it, R) {
    R = R || Math.random;
    var d = it.d ? it.d.slice() : shuf(it.dpool || [], R).slice(0, 3);
    return { q: it.q, a: String(it.a), d: d.map(String), e: it.e || '', flag: it.flag || null, disc: it.disc, topic: 'Quiz: ' + (DN[it.disc] || it.disc), tier: it.n || 1 };
  }

  /* ---------------- gerador de contas por ano (6º–9º) e nível (1–5) ---------------- */
  var NOMES = ['Ana', 'Leo', 'Bia', 'Davi', 'Malu', 'Caio', 'Lia', 'Theo', 'Nina', 'Rafa', 'Duda', 'Gui'];
  var COISAS = [['figurinhas', 'figurinha'], ['bolinhas de gude', 'bolinha'], ['adesivos', 'adesivo'], ['lápis de cor', 'lápis'], ['biscoitos', 'biscoito'], ['cartas', 'carta']];
  function mat(ano, nv, R) {
    R = R || Math.random; ano = Math.max(6, Math.min(9, +ano || 7)); nv = Math.max(1, Math.min(5, +nv || 1));
    function ri(a, b) { return a + Math.floor(R() * (b - a + 1)); }
    function pk(a) { return a[Math.floor(R() * a.length)]; }
    function Q(q, c, dist, e) {
      var seen = {}, d = [], cs = fm(c); seen[cs] = 1;
      var cand = (dist || []).concat([c + 1, c - 1, c + 2, c - 2, c + 10, c - 10, c * 2, c + 5, c - 5, c + 3, c - 3]);
      if (c >= 0) cand = cand.filter(function (v) { return v >= 0; });
      for (var i = 0; i < cand.length && d.length < 3; i++) { var s = fm(cand[i]); if (!seen[s] && isFinite(cand[i])) { seen[s] = 1; d.push(s); } }
      return { q: q, a: cs, d: d, e: e || '', disc: 'mat', topic: 'Contas ' + ano + 'º ano', tier: nv };
    }
    function neg(n) { return n < 0 ? '(' + fm(n) + ')' : fm(n); }
    var a, b, c, x, k = ri(0, 2), nome = pk(NOMES), co = pk(COISAS);
    if (ano === 6) {
      if (nv === 1) { if (k) { a = ri(12, 60); b = ri(5, 39); return Q('Quanto é ' + a + ' + ' + b + '?', a + b, [a + b + 10, a + b - 1], a + ' + ' + b + ' = ' + (a + b)); } a = ri(30, 99); b = ri(5, a - 5); return Q('Quanto é ' + a + ' − ' + b + '?', a - b, [a + b - 10 > 0 ? a - b + 10 : a - b + 1], a + ' − ' + b + ' = ' + (a - b)); }
      if (nv === 2) { if (k === 2) { b = ri(2, 9); c = ri(2, 10); return Q('Quanto é ' + b * c + ' ÷ ' + b + '?', c, [c + 1, b], b * c + ' ÷ ' + b + ' = ' + c + ', pois ' + b + ' × ' + c + ' = ' + b * c); } a = ri(3, 10); b = ri(3, 10); return Q('Quanto é ' + a + ' × ' + b + '?', a * b, [a + b, a * b + a, a * b - b], a + ' × ' + b + ' = ' + a * b); }
      if (nv === 3) { if (k === 0) { a = ri(120, 499); b = ri(110, 499); return Q('Quanto é ' + a + ' + ' + b + '?', a + b, [a + b + 100, a + b - 10], a + ' + ' + b + ' = ' + (a + b)); } if (k === 1) { a = ri(12, 49); b = ri(3, 9); return Q('Quanto é ' + a + ' × ' + b + '?', a * b, [a * b + b, a * b - 10], a + ' × ' + b + ' = ' + a * b); } a = ri(4, 9); b = ri(6, 15); return Q(nome + ' tem ' + a + ' pacotes com ' + b + ' ' + co[0] + ' cada. Quantas ' + co[0] + ' ao todo?', a * b, [a + b, a * b + b], a + ' × ' + b + ' = ' + a * b); }
      if (nv === 4) { if (k === 0) { a = ri(2, 20); b = ri(2, 9); c = ri(2, 9); return Q('Quanto é ' + a + ' + ' + b + ' × ' + c + '?', a + b * c, [(a + b) * c, a + b + c], 'Primeiro a multiplicação: ' + b + ' × ' + c + ' = ' + b * c + '; depois ' + a + ' + ' + b * c + ' = ' + (a + b * c)); } if (k === 1) { b = pk([2, 3, 4, 5]); c = ri(3, 12) * b; return Q('Quanto é 1/' + b + ' de ' + c + '?', c / b, [c / b + 1, c - b, c * b], c + ' ÷ ' + b + ' = ' + c / b); } a = ri(20, 60); b = ri(5, 15); c = ri(4, 12); return Q(nome + ' tinha ' + a + ' ' + co[0] + ', ganhou ' + b + ' e deu ' + c + '. Com quantas ficou?', a + b - c, [a + b + c, a - b - c > 0 ? a - b - c : a + b - c + 2], a + ' + ' + b + ' − ' + c + ' = ' + (a + b - c)); }
      if (k === 0) { a = ri(2, 9); b = ri(2, 9); c = ri(2, 6); x = ri(1, 9); return Q('Quanto é (' + a + ' + ' + b + ') × ' + c + ' − ' + x + '?', (a + b) * c - x, [a + b * c - x, (a + b) * c + x], 'Parênteses: ' + (a + b) + '; × ' + c + ' = ' + (a + b) * c + '; − ' + x + ' = ' + ((a + b) * c - x)); }
      if (k === 1) { b = pk([10, 20, 25, 50]); c = pk([40, 60, 80, 120, 200, 300]); return Q('Quanto é ' + b + '% de ' + c + '?', c * b / 100, [c * b / 10, c - c * b / 100], b + '% de ' + c + ' = ' + c + ' × ' + b + ' ÷ 100 = ' + fm(c * b / 100)); }
      a = ri(3, 8); b = ri(12, 45); c = ri(2, 4) * 50 + (a * b > 200 ? 200 : 0); if (c <= a * b) c = a * b + ri(1, 9) * 10; return Q(nome + ' comprou ' + a + ' cadernos de R$ ' + b + ' e pagou com R$ ' + c + '. Quanto recebeu de troco (em R$)?', c - a * b, [c - b, a * b], a + ' × ' + b + ' = ' + a * b + '; ' + c + ' − ' + a * b + ' = ' + (c - a * b));
    }
    if (ano === 7) {
      if (nv === 1) { a = ri(-15, -2); b = ri(3, 20); return Q('Quanto é ' + fm(a) + ' + ' + b + '?', a + b, [-(a + b), a - b], 'Sinais diferentes: ' + b + ' − ' + (-a) + ' = ' + fm(a + b)); }
      if (nv === 2) { a = ri(2, 9) * (k ? -1 : 1); b = ri(2, 9) * -1; return Q('Quanto é ' + neg(a) + ' × ' + neg(b) + '?', a * b, [-(a * b), a + b], (a * b > 0 ? 'Sinais iguais: positivo. ' : 'Sinais diferentes: negativo. ') + fm(a) + ' × ' + fm(b) + ' = ' + fm(a * b)); }
      if (nv === 3) { if (k) { x = ri(3, 20); a = ri(2, 9); return Q('Qual é o valor de x em ' + a + 'x = ' + a * x + '?', x, [a * x - a, x + a], 'x = ' + a * x + ' ÷ ' + a + ' = ' + x); } x = ri(-9, 20); b = ri(3, 25); return Q('Qual é o valor de x em x + ' + b + ' = ' + fm(x + b) + '?', x, [x + 2 * b, -x], 'x = ' + fm(x + b) + ' − ' + b + ' = ' + fm(x)); }
      if (nv === 4) { if (k === 2) { b = pk([10, 15, 20, 30]); c = pk([80, 120, 150, 200, 240]); return Q('Uma bicicleta custa R$ ' + c + ' e teve ' + b + '% de desconto. Qual o novo preço (em R$)?', c - c * b / 100, [c * b / 100, c + c * b / 100], b + '% de ' + c + ' = ' + fm(c * b / 100) + '; ' + c + ' − ' + fm(c * b / 100) + ' = ' + fm(c - c * b / 100)); } x = ri(2, 12); a = ri(2, 7); b = ri(1, 15); return Q('Qual é o valor de x em ' + a + 'x + ' + b + ' = ' + (a * x + b) + '?', x, [x + 1, (a * x + b) / a > 0 ? Math.round((a * x + b) / a) + 2 : x + 3], a + 'x = ' + (a * x + b) + ' − ' + b + ' = ' + a * x + '; x = ' + x); }
      if (k === 0) { x = ri(-6, 9); a = ri(2, 5); b = ri(1, 6); return Q('Qual é o valor de x em ' + a + '(x + ' + b + ') = ' + fm(a * (x + b)) + '?', x, [x + b, -x], 'x + ' + b + ' = ' + fm(x + b) + '; x = ' + fm(x)); }
      a = ri(-12, -2); b = ri(2, 6); c = ri(-9, 9); return Q('Quanto é ' + fm(a) + ' × ' + b + ' − ' + neg(c) + '?', a * b - c, [a * b + c, -(a * b) - c], fm(a) + ' × ' + b + ' = ' + fm(a * b) + '; ' + fm(a * b) + ' − ' + neg(c) + ' = ' + fm(a * b - c));
    }
    if (ano === 8) {
      if (nv === 1) { if (k) { a = ri(2, 15); return Q('Quanto é ' + a + '²?', a * a, [2 * a, a * a + a], a + '² = ' + a + ' × ' + a + ' = ' + a * a); } a = ri(2, 6); return Q('Quanto é ' + a + '³?', a * a * a, [3 * a, a * a], a + '³ = ' + a + ' × ' + a + ' × ' + a + ' = ' + a * a * a); }
      if (nv === 2) { if (k) { a = ri(4, 20); return Q('Quanto é √' + a * a + '?', a, [a * 2, a + 1], a + ' × ' + a + ' = ' + a * a); } a = ri(2, 5); b = ri(2, 4); return Q('Quanto é ' + a + ' × 10' + (b === 2 ? '²' : b === 3 ? '³' : '⁴') + '?', a * Math.pow(10, b), [a * Math.pow(10, b - 1), a * Math.pow(10, b + 1)], '10' + (b === 2 ? '²' : b === 3 ? '³' : '⁴') + ' = ' + Math.pow(10, b) + '; × ' + a + ' = ' + a * Math.pow(10, b)); }
      if (nv === 3) { x = ri(-4, 5); a = ri(2, 4); b = ri(1, 9); return Q('Qual é o valor de ' + a + 'x² + ' + b + ' para x = ' + fm(x) + '?', a * x * x + b, [a * x + b, (a * x) * (a * x) + b], 'x² = ' + x * x + '; ' + a + ' × ' + x * x + ' + ' + b + ' = ' + (a * x * x + b)); }
      if (nv === 4) { x = ri(-5, 12); a = ri(3, 7); b = ri(1, a - 1); c = ri(1, 12); return Q('Qual é o valor de x em ' + a + 'x − ' + c + ' = ' + b + 'x + ' + fm((a - b) * x - c) .replace('−', '(−') + ((a - b) * x - c < 0 ? ')' : '') + '?', x, [x + c, -x], (a - b) + 'x = ' + fm((a - b) * x) + '; x = ' + fm(x)); }
      if (k) { x = ri(10, 40); b = ri(2, 15); return Q('A soma de dois números é ' + (2 * x + b) + ' e a diferença entre eles é ' + b + '. Qual é o maior número?', x + b, [x, 2 * x + b], 'Somando as equações: 2·maior = ' + (2 * x + 2 * b) + '; maior = ' + (x + b)); }
      b = pk([10, 20, 25, 50]); c = pk([40, 80, 120, 200, 400]); return Q('Um preço de R$ ' + c + ' aumentou ' + b + '%. Qual é o novo preço (em R$)?', c + c * b / 100, [c * b / 100, c - c * b / 100], b + '% de ' + c + ' = ' + fm(c * b / 100) + '; ' + c + ' + ' + fm(c * b / 100) + ' = ' + fm(c + c * b / 100));
    }
    /* 9º ano */
    if (nv === 1) { if (k) { a = ri(11, 25); return Q('Quanto é ' + a + '²?', a * a, [a * 2, a * a - a], a + ' × ' + a + ' = ' + a * a); } a = ri(6, 20); return Q('Quanto é √' + a * a + '?', a, [a + 2, a * a / 2 | 0], a + '² = ' + a * a); }
    if (nv === 2) { a = ri(2, 6); b = ri(-9, 9); x = ri(-5, 8); return Q('Se f(x) = ' + a + 'x ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + ', quanto é f(' + fm(x) + ')?', a * x + b, [a * x - b, a + x + b], a + ' × ' + neg(x) + (b < 0 ? ' − ' + (-b) : ' + ' + b) + ' = ' + fm(a * x + b)); }
    if (nv === 3) { if (k) { var tr = pk([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15], [7, 24, 25]]); return Q('Um triângulo retângulo tem catetos ' + tr[0] + ' e ' + tr[1] + '. Quanto mede a hipotenusa?', tr[2], [tr[0] + tr[1], tr[2] + 1], tr[0] + '² + ' + tr[1] + '² = ' + tr[2] * tr[2] + '; √' + tr[2] * tr[2] + ' = ' + tr[2]); } a = ri(2, 9); b = ri(1, 6); return Q('Quanto vale (' + a + ' + ' + b + ')²?', (a + b) * (a + b), [a * a + b * b, (a + b) * 2], '(' + a + ' + ' + b + ')² = ' + (a + b) + '² = ' + (a + b) * (a + b)); }
    if (nv === 4) { if (k) { a = ri(3, 15); return Q('Qual é a raiz positiva de x² = ' + a * a + '?', a, [a * a / a + 1, 2 * a], 'x = √' + a * a + ' = ' + a); } var r1 = ri(1, 7), r2 = ri(r1 + 1, 9); return Q('Qual é a maior raiz de x² − ' + (r1 + r2) + 'x + ' + r1 * r2 + ' = 0?', r2, [r1, r1 + r2], 'Soma = ' + (r1 + r2) + ' e produto = ' + r1 * r2 + ': raízes ' + r1 + ' e ' + r2 + '.'); }
    if (k) { c = pk([100, 200, 1000]); b = pk([10, 20]); return Q('R$ ' + c + ' rendem ' + b + '% ao mês, com juros compostos, por 2 meses. Qual o montante (em R$)?', Math.round(c * (1 + b / 100) * (1 + b / 100) * 100) / 100, [c + 2 * c * b / 100, c * (1 + b / 100)], c + ' × ' + fm(1 + b / 100) + ' × ' + fm(1 + b / 100) + ' = ' + fm(c * (1 + b / 100) * (1 + b / 100))); }
    a = ri(2, 9); b = ri(3, 7); return Q('Em notação científica, ' + a + ' × 10' + ['³', '⁴', '⁵', '⁶', '⁷'][b - 3] + ' é igual a:', a * Math.pow(10, b), [a * Math.pow(10, b - 1), a * Math.pow(10, b + 1)], a + ' seguido de ' + b + ' zeros.');
  }

  /* pergunta de uma disciplina. ano: 6–9 (para contas); rng opcional (para salas ao vivo com semente) */
  var USED = {};
  function pergunta(disc, nivel, R, ano) {
    nivel = Math.max(1, Math.min(5, nivel || 1));
    if (disc === 'mix') { var ds = ['mat', 'cie', 'his', 'geo', 'por', 'ing', 'ban']; disc = ds[Math.floor((R || Math.random)() * ds.length)]; }
    if (disc === 'mat' && (R || Math.random)() < 0.6) return mat(ano || 7, nivel, R);
    var pool = POOL[disc] || POOL.cie, nv = Math.min(3, Math.ceil(nivel * 3 / 5));
    var cand = pool.filter(function (x) { return x.n <= nv; });
    if (!cand.length) cand = pool;
    if (R) return fromItem(cand[Math.floor(R() * cand.length)], R);
    /* extras dos bancos já existentes do RobIox (História 11, Geografia 12, Inglês 10) */
    var ex = { his: 11, geo: 12, ing: 10 }[disc];
    if (ex && window.RBXB && RBXB.G && RBXB.G[ex] && Math.random() < 0.25) {
      try { var ks = Object.keys(RBXB.G[ex]).filter(function (k) { return typeof RBXB.G[ex][k] === 'function'; }); if (ks.length) { var kk = ks[Math.floor(Math.random() * ks.length)], o = RBXB.G[ex][kk](Math.min(3, nv)); if (o && o.q) { o.disc = disc; o.topic = 'Quiz: ' + DN[disc]; o.tier = nv; return o; } } } catch (e) {}
    }
    var u = USED[disc] = USED[disc] || {}, free = cand.filter(function (x) { return !u[x.q + x.a]; });
    if (!free.length) { USED[disc] = u = {}; free = cand; }
    var it = free[Math.floor(Math.random() * free.length)]; u[it.q + it.a] = 1;
    return fromItem(it);
  }
  /* sequência determinística (todos da sala recebem a mesma pergunta na mesma rodada) */
  function sequencia(disc, seed, ano) {
    var cache = {};
    return function (rodada) {
      if (cache[rodada]) return cache[rodada];
      var R = rng((seed ^ hashStr(disc + ':' + rodada)) >>> 0), nivel = Math.min(5, 1 + Math.floor(rodada / 3));
      var q = pergunta(disc, nivel, R, ano);
      q.alts = shuf([q.a].concat(q.d.slice(0, 3)), R);
      return (cache[rodada] = q);
    };
  }
  /* alternativas embaralhadas (n = 3 ou 4) */
  function alts(q, n, R) { return shuf([q.a].concat(shuf(q.d, R).slice(0, (n || 4) - 1)), R); }
  function total() { var t = 0; Object.keys(POOL).forEach(function (k) { t += POOL[k].length; }); return t; }

  window.RBX_QZ = { DISC: DISC, POOL: POOL, total: total, pergunta: pergunta, sequencia: sequencia, mat: mat, rng: rng, hash: hashStr, shuf: shuf, alts: alts, flagSVG: flagSVG, flagURL: flagURL, FLAGS: FCODES };
})();
