# EduBank — Investimentos (etapa 2; complementa EDUBANK-SPEC.md)

Pedido do professor: o EduBank também deve permitir **comprar ações e outros investimentos**, e eles **rendem o que rendem na vida real**, para os alunos aprenderem como funciona. É simulação educacional (dinheiro fictício, preços/taxas reais, atraso de cotação); não é recomendação de investimento. Tudo é cobrado do "Meu dinheiro" (R$ do RobIox, centavos) pelo mesmo mecanismo do câmbio.

## Produtos
- **Ações B3**: PETR4, VALE3, ITUB4, BBDC4, BBAS3, WEGE3, ABEV3, MGLU3, LREN3, RENT3, SUZB3, B3SA3. **FIIs**: HGLG11, KNRI11, MXRF11, XPLG11, VISC11. **ETFs**: BOVA11, IVVB11. **BDRs**: AAPL34, MSFT34, AMZO34, GOGL34, NFLX34. (Lista editável na aba Config; cotações em R$.)
- **Renda fixa**: Poupança; Tesouro Selic; CDB liquidez diária 100 % do CDI; CDB 115 % do CDI com prazo de 90 dias (só resgata no vencimento); LCI 90 % do CDI, 90 dias, isenta de IR.
- Moedas estrangeiras e criptomoedas continuam no Câmbio (etapa 1).

## Fontes de dados (consultadas pelo Apps Script com `UrlFetchApp`, em cache)
- Cotações B3: Yahoo Finance chart `https://query1.finance.yahoo.com/v8/finance/chart/PETR4.SA?range=5d&interval=1d` (sem chave; preço de mercado + fechamento anterior → variação do dia) com reserva `https://brapi.dev/api/quote/PETR4` (e a última cotação guardada). Cache 10 min. Fora do pregão (seg–sex 10h–17h, horário de Brasília) vale o último preço, com aviso “pregão fechado”.
- Histórico para gráfico (1 mês, 6 meses, 1 ano): mesma API (`range=1mo|6mo|1y&interval=1d`), cache 6 h.
- Proventos (dividendos/rendimentos de FII): `events=div` no mesmo endpoint; credita quem já tinha o ativo na data-com, de forma preguiçosa quando o aluno abre a carteira (idempotente por ativo+data).
- Taxas BCB (API SGS `https://api.bcb.gov.br/dados/serie/bcdata.sgs.NNN/dados?formato=json&dataInicial=dd/MM/yyyy`): 12 = CDI diário (% a.d.), 432 = Selic meta (% a.a.), 433 = IPCA mensal, 226 = TR. Cache 12 h; reserva: última taxa guardada.

## Regras
- **Ordens**: compra a mercado ao último preço, quantidade inteira (fracionário permitido ≥ 1 ação), sem corretagem; mínimo R$ 1,00. Venda libera o valor em R$ na hora, com preço médio, lucro/prejuízo e imposto estimado (isenção didática: mostrar “IR 15 % sobre o lucro nas vendas de ações acima de R$ 20 mil/mês” como texto informativo, não cobrar).
- **Renda fixa** rende por dias úteis com os fatores reais do CDI (série 12) desde a aplicação; **IR regressivo** sobre o rendimento (≤ 180 dias 22,5 %; 181–360 20 %; 361–720 17,5 %; > 720 15 %; LCI isenta) e **IOF regressivo** nos primeiros 30 dias (tabela oficial) cobrados no resgate; **Poupança**: aniversário mensal, 0,5 % a.m. + TR se Selic > 8,5 % a.a., senão 70 % da Selic + TR. Mostrar valor bruto, impostos e líquido. O CDB 115 % e a LCI só resgatam após o prazo.
- **Proventos e resgates** que vêm do servidor entram em R$ por **crédito pendente**: aba **Creditos** (login, id, ts, v, desc, status) e ações `receber&login&t` (lista de `novo`) e `receberack&login&t&ids` (marca `creditado`); o app credita `ST.cash` (idempotente pelo id, também guardado localmente) ao abrir o EduBank e a cada 30 s. Compras debitam `ST.cash` do cliente (o app confere saldo) com ids idempotentes.
- Toda operação registrada em **Extratos** e **Logs**. Posições na aba **Posicoes** (login, ativo, qtd, preco_medio, ts) e **Aplicacoes** (login, id, prod, valor, ts, taxa, status).
- Ações NÃO são transferíveis entre alunos; só moedas/cripto.

## API (mesmas regras de autenticação: `login` + `t`)
- `ativos` → `[{cod,nome,tipo:'acao'|'fii'|'etf'|'bdr',preco,var,fonte,ts,aberto}]`.
- `historico&cod&p=1m|6m|1a` → `{ok:1,pts:[[ts,preco],...]}`.
- `invcomprar&login&t&cod&qtd&cash&id` → `{ok:1,custo,pos}` (cliente debita `custo`).
- `invvender&login&t&cod&qtd&id` → `{ok:1,recebe,lucro,pos}` (vira crédito pendente e também retorna `recebe` para exibição; o cliente NÃO credita direto, só via `receber`).
- `rfprodutos` → produtos com taxa vigente, prazo, IR e liquidez; `rfaplicar&login&t&prod&v&cash&id`; `rfresgatar&login&t&id` (crédito pendente pelo líquido; recusa antes do prazo nos produtos com carência).
- `invcarteira&login&t` → posições com preço atual, valor, resultado R$/%, renda fixa com valor bruto/IR/IOF/líquido, proventos recebidos, patrimônio total (R$ + moedas/cripto convertidas + investimentos).
- `receber` / `receberack` como acima.

## App (aba “Investir” do EduBank + resumo no Início)
Lista de ativos com cotação, variação do dia (verde/vermelho), pesquisa, gráfico de linha 1m/6m/1a (SVG simples), tela do ativo (comprar/vender, preço médio, resultado), Renda fixa (cartões com rentabilidade, prazo, IR; simulador “quanto rende em X meses” com a taxa atual), Carteira (patrimônio total e distribuição em rosca, rendimentos), mini-lições curtas (risco x retorno, diversificação, inflação, juros compostos) e aviso fixo “simulação educacional, não é recomendação de investimento”.

## Estrutura do EduBank (estilo Binance) — decisão de 21/11/2026
Barra de abas: **Início** · **Mercados** · **Investir** · **Carteira** · **Simulações** · **Extrato**. Dentro de Mercados/Investir há um seletor **🇧🇷 Brasil | 🌎 Internacional**: Brasil vem primeiro e é o padrão.
- **🇧🇷 Brasil**: ações B3, FIIs, ETFs, BDRs, renda fixa (poupança, Tesouro Selic, CDB, LCI), índices Ibovespa (^BVSP) e IFIX; dólar/euro (câmbio).
- **🌎 Internacional**: índices S&P 500 (^GSPC), Nasdaq (^IXIC), Dow Jones (^DJI), DAX (^GDAXI), FTSE 100 (^FTSE), Nikkei 225 (^N225), MSCI via ETFs (IVV, VOO, QQQ, VT, EEM); ações EUA (AAPL, MSFT, AMZN, GOOGL, NVDA, TSLA, KO, DIS); criptomoedas (BTC, ETH, SOL, XRP, DOGE, USDT) e moedas estrangeiras. Preços em dólar/euro etc. e também convertidos em R$ pelo câmbio do dia; a compra é debitada em R$ (com spread de 0,6 % + IOF 3,5 % didático informativo) e a posição fica na moeda do ativo. Índices (^GSPC etc.) não se compram direto: oferecer o ETF correspondente (IVVB11 no Brasil, IVV/VOO no exterior) e mostrar o índice só como referência com gráfico.
- Cotações internacionais: mesmo Yahoo Finance chart (símbolos sem `.SA`), cache 10 min; câmbio USD/BRL da AwesomeAPI.

## Simulações (aba própria; usa taxas/cotações reais, não gasta dinheiro)
1. **Juros compostos**: aporte inicial, aporte mensal, prazo, taxa (preenchida com CDI/Selic/poupança atuais) → gráfico de evolução e comparação com inflação (IPCA).
2. **Comparador de investimentos**: poupança × Tesouro Selic × CDB × LCI × ação/FII/índice no mesmo valor e prazo, líquido de IR/IOF.
3. **Máquina do tempo**: “e se eu tivesse investido R$ 1.000 há 1/3/5 anos em X?” usando o histórico real do ativo (gráfico + valor final + comparação com CDI e inflação).
4. **Carteira simulada (paper trading)**: capital virtual separado (R$ 10.000) para treinar compras e vendas com cotações reais, sem mexer no dinheiro real do jogo; ranking opcional da turma só por login (sem nomes).
5. **Financiamento / parcelas** (Price × SAC) e **Aposentadoria** (quanto poupar por mês para chegar a R$ X).
6. **Risco x retorno**: sorteia cenários (simulação de Monte Carlo simples) para mostrar volatilidade de renda variável vs renda fixa.
Toda simulação tem botão “salvar” (nuvem do aluno) e aparece no Boletim como atividade concluída de Educação Financeira.
