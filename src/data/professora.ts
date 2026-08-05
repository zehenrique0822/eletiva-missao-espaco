import type { AgreementOption, DialogueTopic } from "@/types";

/**
 * Capítulo 5 — conversa com a comandante da missão, a Professora Elo.
 * As falas seguem o roteiro "Quem sou eu?" do documento.
 */
export const DIALOGUE_TOPICS: DialogueTopic[] = [
  {
    id: "quem-e",
    question: "Quem é você, professora?",
    lines: [
      "Sou Eloiny Fernanda de Souza, filha da Elenita e do Valmir e natural de Diamante do Norte. Sou formada em Ciências Biológicas e Mestre em Ensino.",
      "Sempre fui curiosa, questionadora e dedicada aos estudos, pois encontrei na educação uma forma de transformar minha realidade",
      "Escolhi ser professora porque acredito que, por meio da educação, podemos transformar pessoas — e, através delas, transformar o mundo. 💛",
    ],
  },
  {
    id: "sabe-tudo",
    question: "Professor sabe tudo?",
    lines: [
      "Não! Eu também pesquiso quando não sei alguma coisa.",
      "Também aprendo com outros professores — e aprendo muito com meus alunos.",
      "Um professor nunca para de aprender. Assim como vocês, eu descubro coisas novas todos os dias.",
    ],
  },
  {
    id: "fora-da-escola",
    question: "O que você faz fora da escola?",
    lines: [
      "Fora da escola, a professora Eloiny também tem vida! 😂 Sou mãe de pet e de plantas 🐾🌱, amo animais, gosto de ouvir podcasts de true crime e sou completamente Marvete! 🎬🦸‍♀️ Também adoro assistir séries e passar um tempo com meu namorado🥰.",
      "E uma curiosidade que talvez vocês não esperem: na adolescência, eu jogava Free Fire e Brawl Stars! 🎮😂",
      "Antes de ser professora, eu também fui — e continuo sendo — alguém que gosta de jogar, assistir, descobrir coisas novas e se divertir!",
    ],
  },
  {
    id: "curiosidade",
    question: "Qual é a sua maior curiosidade?",
    lines: [
      "Sempre me fascinou perceber que perguntas pequenas podem levar a descobertas enormes.",
      "Como uma única célula consegue formar um organismo inteiro? Como as plantas sabem para onde crescer? Como um foguete consegue vencer a gravidade?",
      "Foi essa vontade de entender o mundo que me trouxe até aqui.",
    ],
  },
  {
    id: "por-que-eletiva",
    question: "Por que você criou a Missão Espaço?",
    lines: [
      "Eu poderia simplesmente escolher um tema de Astronomia. Mas preferi fazer diferente.",
      "Primeiro conheci o Clube de Letramento Científico e observei como ele propõe que vocês aprendam. Aí pensei: e se eu criasse uma eletiva que valorizasse a curiosidade, a investigação, o trabalho em equipe e os experimentos?",
      "A Missão Espaço não nasceu apenas para ensinar sobre foguetes. Nasceu para que vocês vivam uma experiência científica.",
    ],
  },
  {
    id: "espera-turma",
    question: "O que você espera da turma?",
    lines: [
      "Não espero que vocês saibam tudo. Também não espero que acertem todas as respostas.",
      "Espero que tenham coragem de perguntar, que participem, que respeitem os colegas e que trabalhem em equipe.",
      "E que não tenham medo de errar. Porque é exatamente assim que a Ciência acontece.",
    ],
  },
];

/**
 * "Combinados da missão": construídos com a turma, não impostos como regras.
 * As opções inválidas provocam reflexão em vez de punição.
 */
export const AGREEMENTS: AgreementOption[] = [
  {
    id: "respeito",
    label: "Respeito",
    icon: "💜",
    valid: true,
    feedback: "Sem respeito nenhuma equipe funciona.",
  },
  {
    id: "escuta",
    label: "Escuta",
    icon: "👂",
    valid: true,
    feedback: "Ouvir o colega também é aprender.",
  },
  {
    id: "participacao",
    label: "Participação",
    icon: "🙋",
    valid: true,
    feedback: "A opinião de vocês importa.",
  },
  {
    id: "responsabilidade",
    label: "Responsabilidade",
    icon: "🎯",
    valid: true,
    feedback: "Cada tripulante cuida da sua parte da missão.",
  },
  {
    id: "materiais",
    label: "Cuidado com os materiais",
    icon: "🧰",
    valid: true,
    feedback: "Os materiais são de todos: cuidar deles é cuidar da turma.",
  },
  {
    id: "colaboracao",
    label: "Colaboração",
    icon: "🤝",
    valid: true,
    feedback: "Na Ciência ninguém descobre tudo sozinho.",
  },
  {
    id: "competir",
    label: "Competir com os colegas",
    icon: "⚔️",
    valid: false,
    feedback: "As equipes não existem para competir. Existem para colaborar.",
  },
  {
    id: "guardar-duvidas",
    label: "Guardar as dúvidas",
    icon: "🤐",
    valid: false,
    feedback: "Dúvida guardada não vira descoberta. Pergunte sempre!",
  },
  {
    id: "desistir",
    label: "Desistir no primeiro erro",
    icon: "🚪",
    valid: false,
    feedback:
      "Não teremos medo de errar. Teremos medo apenas de deixar de tentar.",
  },
];

/** Mensagem impressa no Cartão de Embarque entregue pela professora. */
export const BOARDING_MESSAGE =
  "Você está oficialmente preparado para conhecer a missão deste semestre.";
