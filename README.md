# 🚀 Missão Espaço — A Ciência por Trás das Grandes Descobertas

### ▶️ Jogar agora: **[zehenrique0822.github.io/eletiva-missao-espaco](https://zehenrique0822.github.io/eletiva-missao-espaco/)**

Jogo educativo em HTML5 para o **componente curricular eletivo "Missão Espaço"**, do
Ensino Fundamental. O estudante entra para a tripulação, atravessa seis etapas de
treinamento e, ao final, recebe o **Termo de Compromisso** da eletiva — pronto para
imprimir e assinar.

O jogo transforma os seis capítulos do material da professora em seis fases jogáveis:
o conteúdo pedagógico está **dentro da mecânica**, não em um questionário.

---

## Índice

- [Como executar](#como-executar)
- [As seis fases](#as-seis-fases)
- [Arquitetura](#arquitetura)
- [Personalização pedagógica](#personalização-pedagógica)
- [Áudio](#áudio)
- [Responsividade e acessibilidade](#responsividade-e-acessibilidade)
- [Qualidade](#qualidade)

---

## Como executar

Requisitos: **Node.js 18+**.

```bash
npm install     # instala as dependências (Phaser + Vite + TypeScript)
npm run dev     # ambiente de desenvolvimento em http://localhost:5173
npm run build   # gera a versão de produção na pasta dist/
npm run preview # serve a build de produção para conferência
```

A build é totalmente estática: basta copiar o conteúdo de `dist/` para qualquer
servidor, pendrive ou intranet da escola (o `base` do Vite é relativo, então funciona
mesmo em subpastas).

### Publicação automática (GitHub Pages)

Todo `push` na branch `main` dispara `.github/workflows/deploy.yml`, que instala as
dependências, roda `tsc --noEmit`, gera a build e publica em
[zehenrique0822.github.io/eletiva-missao-espaco](https://zehenrique0822.github.io/eletiva-missao-espaco/).

Se a verificação de tipos falhar, **o deploy não acontece** — o site no ar nunca fica
quebrado. Também dá para publicar manualmente pela aba *Actions → Deploy para GitHub
Pages → Run workflow*.

### Uso em sala de aula

- Projete no quadro e conduza a turma coletivamente, ou
- deixe cada estudante jogar individualmente e imprimir o próprio Termo ao final.
- O progresso é salvo automaticamente no navegador (`localStorage`): o botão
  **CONTINUAR** retoma exatamente de onde parou.

---

## As seis fases

| # | Capítulo do material | Fase no jogo | Mecânica |
|---|----------------------|--------------|----------|
| 1 | Primeiro Contato | **Coleta de curiosidade** | Pilota o traje espacial, coleta 8 esferas e preenche o *Arquivo Confidencial da Missão*, que é lacrado em envelope |
| 2 | Uma Escola que Faz Sentido | **Chuva de princípios** | Pilota a nave coletora, captura os 5 princípios da Escola das Adolescências e desvia dos meteoros |
| 3 | Aprender de Formas Diferentes | **Portais do aprender** | Arrasta cartas entre os portais "Em muitas aulas" e "Nas eletivas" — as duas formas são valorizadas |
| 4 | Clube de Letramento Científico | **Sala de Ciências** | Investiga 7 objetos e remonta o caminho da investigação: observar → perguntar → imaginar → testar → aprender |
| 5 | Conhecendo a Comandante | **Laboratório da Professora Elo** | Diálogo livre com a professora e construção coletiva dos *Combinados da Missão*; ao final, o Cartão de Embarque |
| 6 | Briefing da Missão | **Centro de Comando** | Monta os 6 módulos do foguete (as etapas do semestre) e faz a contagem regressiva do lançamento |

Ao final: sequência de terminal (*"candidato apto para a missão"*), tela de parabéns
com o resumo do treinamento e o **Termo de Compromisso** imprimível.

### Regras gerais

- **Estrelas ⭐** — recompensam coletas, descobertas e acertos.
- **Energia ⚡** — meteoros e escolhas equivocadas custam energia. Quando ela acaba,
  a fase **recomeça com uma mensagem de incentivo** — nunca há tela de "game over",
  porque errar faz parte do processo científico.
- **Conquistas 🏅** — 12 conquistas, incluindo "Voo Impecável", "Método Científico"
  e "Curiosidade Infinita".

---

## Arquitetura

```
src/
├── main.ts                  Ponto de entrada (fontes, orientação, boot)
├── config/
│   ├── constants.ts         Resolução, chaves de cena/textura, eventos, pontuação
│   ├── theme.ts             Paleta, tipografia e estilos de texto
│   ├── GameConfig.ts        Configuração do Phaser e registro das cenas
│   └── AudioManifest.ts     Registro opcional de arquivos de áudio
├── data/                    ⭐ CONTEÚDO PEDAGÓGICO (fonte da verdade)
│   ├── chapters.ts          Narrativa, objetivos e controles das 6 fases
│   ├── arquivo.ts           Cartas do Arquivo Confidencial + avatares
│   ├── principios.ts        Os 5 princípios da Escola das Adolescências
│   ├── eletivas.ts          Cartas de classificação dos dois portais
│   ├── laboratorio.ts       Objetos da Sala de Ciências + método científico
│   ├── professora.ts        Diálogos da Professora Elo + combinados
│   ├── missao.ts            Módulos do foguete, desfecho e Termo de Compromisso
│   ├── achievements.ts      Catálogo de conquistas
│   └── feedback.ts          Mensagens de incentivo
├── scenes/                  Boot, Preload, Menu, Instruções, Créditos, Conquistas,
│                            ChapterIntro, Level1–6, HUD, Pause, Finale
├── ui/                      Componentes reutilizáveis (Button, IconButton, Panel,
│                            ProgressBar, Modal) + overlays HTML (forms, DomOverlay)
├── services/                GameState (estado + barramento de eventos), SaveService,
│                            AudioService, AchievementService
├── utils/                   backdrop (cenário espacial), anim (tweens e partículas),
│                            textures (texturas procedurais)
└── types/                   Contratos TypeScript compartilhados
```

### Decisões de projeto

- **`BaseLevelScene`** concentra tudo o que se repete entre fases — cenário, HUD,
  pausa, pontuação, energia, conclusão e transições. Cada fase implementa apenas
  `build()` com a sua mecânica, o que elimina duplicação.
- **`GameState` é também o barramento de eventos.** As fases alteram o estado; o HUD
  apenas escuta. O HUD não conhece nenhuma regra de fase.
- **Conteúdo separado do código.** Toda a parte pedagógica está em `src/data/`:
  a professora pode ajustar textos sem tocar na lógica do jogo.
- **Resolução base 1280×720 com `Scale.FIT`**, preservando o enquadramento em
  qualquer tela.
- **DOM apenas onde ele é melhor que o canvas**: entrada de nome (teclado nativo do
  celular) e Termo de Compromisso (texto selecionável e imprimível).

---

## Personalização pedagógica

| Quero mudar… | Edite |
|---|---|
| As falas de abertura de uma fase | `src/data/chapters.ts` |
| As perguntas do Arquivo Confidencial | `src/data/arquivo.ts` |
| As histórias dos objetos da Sala de Ciências | `src/data/laboratorio.ts` |
| As respostas da professora | `src/data/professora.ts` |
| Os combinados da turma | `src/data/professora.ts` → `AGREEMENTS` |
| As etapas do foguete | `src/data/missao.ts` → `ROCKET_MODULES` |
| O texto do Termo de Compromisso | `src/data/missao.ts` → `TERMO` |
| Cores e fontes | `src/config/theme.ts` |
| Pontuação e energia | `src/config/constants.ts` |

> Os arrays de dados são tipados: se um campo obrigatório faltar, o `npm run build`
> avisa antes de o jogo chegar à sala de aula.

---

## Áudio

O jogo **já toca música e efeitos sem nenhum arquivo**: o `AudioService` sintetiza
tudo em tempo real com a Web Audio API (osciladores, envelopes e ruído filtrado).

Para usar arquivos reais, basta colocá-los em `public/assets/audio/` e registrá-los
em `src/config/AudioManifest.ts` — quando a chave existir, o arquivo substitui o som
sintetizado automaticamente. Detalhes e lista de chaves em
[`public/assets/audio/README.md`](public/assets/audio/README.md).

O áudio só é iniciado após o primeiro toque/clique (política dos navegadores) e pode
ser silenciado no menu, no HUD ou na tela de pausa.

---

## Responsividade e acessibilidade

- **Desktop e notebook**: mouse e teclado (setas/WASD, `ESC` para pausar,
  `Espaço` para revelar o texto, `Enter` para iniciar a etapa).
- **Tablet e celular**: todos os desafios são jogáveis apenas com o toque
  (arrastar para mover, tocar para escolher).
- Aviso automático de "gire o aparelho" em telas estreitas em modo retrato.
- Alvos de toque grandes, alto contraste, textos com quebra automática e
  redução proporcional dos painéis quando o conteúdo é longo.
- Nenhuma mecânica depende de tempo de reação apertado nem de leitura rápida.

---

## Qualidade

- `npm run build` executa `tsc --noEmit` antes do empacotamento: TypeScript em modo
  **strict**, sem variáveis, parâmetros ou imports não utilizados.
- Sem assets órfãos: todas as 25 ilustrações SVG são carregadas e utilizadas.
- Sem dependências além de Phaser (runtime) + Vite e TypeScript (desenvolvimento).
- Todas as ilustrações são vetoriais e autorais; as fontes (Baloo 2 e Nunito) são
  gratuitas sob SIL Open Font License, com fallback local caso não haja internet.

---

## Créditos

Concepção pedagógica: **Professora Elo** — eletiva *Missão Espaço: A Ciência por Trás
das Grandes Descobertas*, alinhada à Política Nacional **Escola das Adolescências** e
ao **Clube de Letramento Científico**.

> "Toda grande descoberta começou quando alguém fez uma pergunta."
