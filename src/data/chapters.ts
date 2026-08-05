import type { ChapterInfo } from '@/types';

/**
 * Os seis capítulos do documento da eletiva viram as seis fases do jogo.
 * Os textos abaixo são adaptações diretas das falas propostas no material.
 */
export const CHAPTERS: ChapterInfo[] = [
  {
    number: 1,
    title: 'PRIMEIRO CONTATO',
    subtitle: 'Acolhimento e identidade da missão',
    intro: [
      '"Toda grande descoberta começou quando alguém fez uma pergunta."',
      'Nenhum cientista nasce sabendo. Nenhum astronauta nasce preparado.',
      'Todos começam exatamente do mesmo jeito: fazendo perguntas.',
      'Hoje não é apenas o primeiro dia de uma disciplina. É o primeiro dia de uma missão — e toda missão começa conhecendo quem fará parte dela.',
    ],
    objective: 'Colete as esferas de curiosidade e preencha o Arquivo Confidencial',
    controls: 'Arraste na tela (ou use ← ↑ → ↓ / WASD) para flutuar até cada esfera',
    outro:
      'Seu arquivo foi lacrado. Ele só será aberto na última missão — para você comparar quem era hoje com quem terá se tornado.',
  },
  {
    number: 2,
    title: 'UMA ESCOLA QUE FAZ SENTIDO',
    subtitle: 'Conhecendo a Escola das Adolescências',
    intro: [
      'A escola de vocês é igual à escola dos seus pais e avós? O que mudou?',
      'A escola muda porque o mundo muda. Antes se aprendia ouvindo e copiando; hoje se aprende assistindo, jogando, pesquisando, construindo, conversando e experimentando.',
      'A Escola das Adolescências acredita que todo estudante tem direito a cinco coisas.',
      'Cinco cristais de princípio estão caindo pelo espaço. Capture todos!',
    ],
    objective: 'Capture os 5 princípios da Escola das Adolescências',
    controls: 'Mova a nave coletora com o dedo, o mouse ou as setas ← →',
    outro: 'Nem todas as aulas precisam acontecer da mesma maneira. Algumas foram criadas para aprender de formas diferentes.',
  },
  {
    number: 3,
    title: 'APRENDER DE FORMAS DIFERENTES',
    subtitle: 'Conhecendo os Componentes Curriculares Eletivos',
    intro: [
      'Se cada pessoa aprende de um jeito, será que todas as aulas precisam acontecer da mesma forma?',
      'Existem dois portais de aprendizagem. Em um deles a gente copia, responde, memoriza e resolve exercícios.',
      'No outro a gente investiga, experimenta, cria, constrói, colabora e apresenta.',
      'Envie cada carta para o portal certo. Atenção: as duas formas são importantes!',
    ],
    objective: 'Classifique todas as cartas nos portais corretos',
    controls: 'Arraste cada carta até o portal correspondente',
    outro: 'Uma nova porta se abre: CLUBE DE LETRAMENTO CIENTÍFICO.',
  },
  {
    number: 4,
    title: 'APRENDENDO A OLHAR COMO UM CIENTISTA',
    subtitle: 'Conhecendo o Clube de Letramento Científico',
    intro: [
      'Quando você escuta a palavra "cientista", quem você imagina?',
      'Ser cientista não é trabalhar em um único lugar. É investigar o mundo — nas florestas, nos oceanos, nos hospitais, nos computadores e também no céu.',
      'Todos eles têm uma coisa em comum: CURIOSIDADE.',
      'Explore a Sala de Ciências e descubra a história escondida em cada objeto.',
    ],
    objective: 'Investigue os 7 objetos e remonte o caminho do pensamento científico',
    controls: 'Toque em cada objeto para investigar. Depois toque nas etapas na ordem certa',
    outro: 'Toda missão precisa de uma equipe. E toda equipe precisa conhecer quem irá caminhar junto com ela.',
  },
  {
    number: 5,
    title: 'CONHECENDO A COMANDANTE',
    subtitle: 'Laboratório da Professora Elo',
    intro: [
      'Será que professores também têm sonhos, hobbies e curiosidades?',
      'Antes de ser professora, eu também fui estudante. Também fiquei curiosa com muitas coisas e também precisei aprender errando.',
      'Converse comigo: pergunte o que quiser sobre a missão.',
      'Depois vamos montar juntos os Combinados da Missão.',
    ],
    objective: 'Converse com a Professora Elo e monte os Combinados da Missão',
    controls: 'Toque nas perguntas para conversar e depois selecione os combinados',
    outro: 'Cartão de embarque emitido. Uma nova porta se abre: 🚀 MISSÃO ESPAÇO.',
  },
  {
    number: 6,
    title: 'BRIEFING DA MISSÃO',
    subtitle: 'Centro de Comando',
    intro: [
      'Qual foi a maior invenção da humanidade? Antes de todas elas, alguém fez uma pergunta.',
      'MISSÃO ESPAÇO — A Ciência por Trás das Grandes Descobertas.',
      'O espaço será apenas o nosso cenário. O verdadeiro objetivo é aprender como a Ciência ajuda as pessoas a resolver problemas.',
      'Monte o foguete da missão encaixando cada etapa da nossa jornada na ordem certa.',
    ],
    objective: 'Monte os 6 módulos do foguete e faça o lançamento',
    controls: 'Arraste cada módulo até o encaixe que estiver brilhando',
    outro: 'Tripulação autorizada. Nos vemos na plataforma de lançamento!',
  },
];

/** Acesso seguro por número de capítulo (1..6). */
export function getChapter(number: number): ChapterInfo {
  const chapter = CHAPTERS[number - 1];
  return chapter ?? CHAPTERS[0];
}
