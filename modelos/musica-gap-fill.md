# Modelo: atividade de música "complete a letra" (gap-fill)

**Referência:** https://www.esolcourses.com/content/topics/songs/katy-perry/firework-gap-fill.html
(ESOL Courses · Katy Perry, "Firework")

Salvo em 03/11/2026 para fazermos **a nossa versão** no site.
A página ainda não foi analisada daqui (o site estava bloqueado na sessão em que este arquivo foi criado):
quem for construir deve abrir o link e anotar o funcionamento antes de começar.

## O que copiar e o que NÃO copiar

- ✅ Copiar a **ideia e a mecânica**: o aluno ouve/assiste à música e completa as lacunas da letra, corrige e vê a nota.
- ❌ **Não** copiar o código, o texto, as imagens nem o layout da ESOL Courses.
- ❌ **Não** publicar letras inteiras de músicas comerciais (Katy Perry etc.) no site: a letra tem direitos autorais.
  Opções seguras:
  1. músicas de **domínio público** / tradicionais (nursery rhymes, folk songs);
  2. **letras originais** feitas para a aula (podemos gerar a música com IA, como a voz da Batatinha);
  3. para música comercial: só o **vídeo oficial embutido do YouTube** + poucas linhas curtas, com o resto da letra no caderno/impresso em sala.

## Nossa versão (padrão do site)

- Arquivo `musica-<nome>-jogo.html` + entrada em `catalogo.js` (categoria inglês, série, código de acesso como as outras).
- Topo: vídeo (YouTube embutido) ou áudio próprio, com botões de voltar 5 s / repetir trecho.
- Letra por estrofes, com lacunas em palavras-chave do conteúdo da aula (verbos, vocabulário).
- Modos: **banco de palavras** (tocar/arrastar), **digitar** e **escolher na lista** (para turmas adaptadas).
- Corrigir: verde/vermelho por lacuna, nota 0–10, 2ª tentativa vale ponto (como nas outras atividades),
  moedinhas no pote, botão Prof. com a senha para mostrar o gabarito.
- Depois da música: 3 a 5 perguntas de compreensão e vocabulário.
- Impressão/PDF com Nome/Turma/Escola (padrão do site).
- Um único arquivo de dados por música (título, vídeo, estrofes com `[lacunas]`), para criar novas músicas rápido.

## Prompt para o OpenCode

```
Abra https://www.esolcourses.com/content/topics/songs/katy-perry/firework-gap-fill.html e estude como
a atividade funciona (layout, tipo de lacuna, botões, correção). Depois leia modelos/musica-gap-fill.md
e crie a NOSSA versão no padrão deste site, sem copiar código, textos ou letra da ESOL Courses.
Faça um motor reutilizável (um arquivo de dados por música) e uma primeira atividade com uma música
de domínio público ou letra original, nível 6º–8º ano. Me mostre antes de fazer commit.
```
