# Jogos de Pix / banco / WhatsApp (edu) — guia de referência

Atualizado em 27/10/2026. Motor: `banco.js` + `banco.css` (cache: `?v=N` nos wrappers `*-jogo.html`; hoje v=38; subir N a cada mudança com `sed -i`).

## Como funciona
- 10 bancos (`BANKS`): Nubank, BB, Itaú, Bradesco, Caixa Tem, Inter, Mercado Pago, Santander, PicPay (verde), C6 (cinza).
- Cada banco tem saldo próprio (`SAL`). Só fica **bloqueada para Pix a conta NEGATIVA** (cheque especial 8% a.m.); bancos com R$ 0,01 e R$ 0,00 também existem. Dá para pagar tudo somando bancos e transferindo (Pix → Minhas chaves, chave aleatória por banco).
- Cabeçalho: ícones dos bancos → janelinha de extrato com "Usar este banco". Painel embaixo: saldos, extrato por banco e geral.
- Copiar chave Pix exige conta de cabeça (× de 3–12, + ou −).
- WhatsApp realista: lista de conversas **intercalada** (cobranças, comprovantes recebidos, grupos), não borra; notificação aparece e some; conversa aberta deixa de ser "não lida"; **lembrete** automático (~45 s) se não pagou ("Você viu minha mensagem?").
- Cobranças com 10 estilos (educado, emoji, grosso, figurinha, formal...). Atividades CPF/celular/e-mail/golpe também viram chat.
- Depois de pagar: botão "📤 Enviar comprovante" → aparece no chat. A pessoa responde: certo / faltou diferença (aluno paga a diferença) / pagou a mais (devolve, entra no extrato) / pessoa errada.
- Pix recebidos: 3 por fase (verdadeiro, falso e/ou valor diferente) com horário; o aluno confere no extrato (comprovante + horário).
- **Missão final** (última fase de atividade com Pix): juntar todo o dinheiro numa só conta (à escolha do aluno, ou definida pelo professor com `&dest=prof`) e informar o saldo.
- **Desafio R$ 100**: mensagem `desafio` no `grupos/grupos.json` (grupo Matemática Curiosa): resposta + chave Pix → cai R$ 100 no banco da chave, com comprovante e notificação.
- QR Code com câmera real (`qrcatalogo.js`, `jsQR.js`, folha `qrcodes-pix-impressao.html` com senha do professor).

## Grupos do WhatsApp (editar sem mexer no código)
`grupos/grupos.json` → `{grupos:[{id,icone,nome,desc,prev,n,msgs:[...]}]}`. Tipos de mensagem: `txt` (h), `tab` (op,n), `pdf` (nome,arq,info), `usd`, `selic`, `space`, `hoje`, `banco`, `desafio` (id,pergunta,resp[],premio em centavos). PDFs em `downloads/`.

## Gabarito do professor
Abrir a atividade com `?imp=1` e digitar a senha da área do professor. Mostra a resposta de cada questão e o botão **📋 Gabarito completo**: saldos iniciais de cada banco por fase, Pix recebidos (verdadeiro/falso/diferente), total final esperado na missão final. O cenário é reproduzível pelo número: `?imp=1&c=NÚMERO` (o aluno recebe um número aleatório; o professor pode fixar `?c=7`). `&dest=prof` define o banco final pelo professor.

### Gabaritos imprimíveis (só professor)
Página-índice **`gabaritos-professor.html`** (pede a senha do professor): tabela de todas as atividades de Pix, contas, compra, maquininha e cartão × séries, com link direto. Escolha o(s) cenário(s) (ex.: `7` ou `1-10`, máx. 40) e clique em Gabarito.
Cada link é `<atividade>-jogo.html?imp=1&gab=1&c=N` (ou `c=A-B`): gera uma página A4 por cenário com **todas as questões das 4 fases e a resposta pronta** (Pix: valor+favorecido+senha; maquininha/compra: venda, taxa e líquido; cartão: parcela/total/opção mais barata), saldos iniciais por banco, Pix recebidos (verdadeiro/falso/diferente) e o total esperado na missão final. Imprimir com Ctrl+P. Aluno com o mesmo `?c=N` vê exatamente esse cenário.

## Códigos por série
Cada atividade de Pix/cartão/maquininha tem versão 6º, 8º, 9º, 1ª, 2ª e 3ª série EM, cada uma com código próprio (catálogo `catalogo.js`, mapa `COD`). Níveis por série: 6º [1,1,1,2], 8º [1,2,2,3], 9º [2,2,3,3], 1ª [2,3,3,4], 2ª [3,3,4,4], 3ª [3,4,4,4].
Também têm versão por série (`<jogo>-6ano|8ano|9ano|1em|2em|3em-jogo.html`, ano=6/8/9/9/9/9 fixo, seletor escondido, código próprio) os 19 jogos de dinheiro (troco, contagem, lojas, mercadinho, salários…), criados com `p49.py` (não reexecutar). Colmeias já são por série pelo nome. Ainda com 1 código para várias séries: contagem-dolares, jobs-ingles, loja-miami, loja-paraguai, soma-de-inteiros. As versões gerais antigas continuam no catálogo.

## Pendências
- Pix recebido com a chave do aluno digitada no WhatsApp (+ notificação).
- Recarga de celular (número fictício, sem crédito, Wi-Fi livre).
- Testar a câmera ao vivo no tablet (https://hodhreego.github.io/edu/).
- Erro antigo: `colmeia-his-6-ano-povos-pre-colombianos-jogo.html`.

## Cuidados
Não reexecutar scripts geradores antigos (duplicam códigos). Windows: usar `PYTHONIOENCODING=utf-8`; heredocs com aspas complexas falham no Bash — gravar scripts com a ferramenta Write.

## Layout WhatsApp
Todas as atividades de Pix (cpf, celular, e-mail, golpe, whatsapp-*, contas/boleto, QR, QR câmera) abrem conversa no WhatsApp; contas traz o código de barras (Copiar código); QR/câmera trazem a mensagem da loja sem chave.

## Jogos de dinheiro (dinheiro.js)
Moedas/cédulas ficam no canto superior esquerdo das zonas; fontes reduzidas com min(vh,px); puxador GAVETA centralizado no alto da bandeja.

## Saldos e gaveta de extratos
Saldo de cada banco não aparece mais nos cartões nem no app (mostra R$ ••••• 👁; tocar abre o extrato do banco com saldo inicial/atual). No rodapé fica só o **Total**. O painel "Seus bancos" é uma gaveta fixa embaixo com puxador "EXTRATOS DOS BANCOS" (toque abre/fecha). Caixas de aviso (.pnote/.tipx) se ajustam ao tamanho do texto.

## Gabarito só impresso
Na tela do jogo não há mais botão/caixa de gabarito. O gabarito completo só existe na página impressa `?imp=1&gab=1&c=N` (ou pelo índice gabaritos-professor.html), que exige a senha do professor.

## Extrato dentro do app
Cada app de banco tem o atalho "Extrato" (tela `extr`, com voltar) mostrando saldo e movimentações do banco; o popup de extrato tem ✕, botão Fechar e fecha clicando fora (não fecha sozinho).
