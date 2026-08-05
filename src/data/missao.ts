import { C } from '@/config/theme';
import type { RocketModule } from '@/types';

/**
 * Capítulo 6 — Briefing da Missão.
 * O percurso do semestre (a lista "O que faremos?") vira os módulos do foguete,
 * montados de baixo para cima na ordem em que a missão acontece.
 */
export const ROCKET_MODULES: RocketModule[] = [
  {
    id: 'investigar',
    label: 'INVESTIGAR',
    detail: 'Observar o mundo e transformar a curiosidade em boas perguntas.',
    icon: '🔍',
    color: C.cyan,
  },
  {
    id: 'registrar',
    label: 'REGISTRAR',
    detail: 'Anotar hipóteses, erros e descobertas no Diário de Bordo.',
    icon: '📖',
    color: C.violetLight,
  },
  {
    id: 'experimentar',
    label: 'EXPERIMENTAR',
    detail: 'Testar as ideias, errar, melhorar e testar de novo.',
    icon: '🧪',
    color: C.green,
  },
  {
    id: 'colaborar',
    label: 'COLABORAR',
    detail: 'As equipes não competem entre si: elas constroem juntas.',
    icon: '🤝',
    color: C.amber,
  },
  {
    id: 'construir',
    label: 'CONSTRUIR',
    detail: 'Projetar, montar, lançar e melhorar nossos próprios foguetes.',
    icon: '🚀',
    color: C.magenta,
  },
  {
    id: 'compartilhar',
    label: 'COMPARTILHAR',
    detail: 'Apresentar na culminância tudo o que a equipe descobriu.',
    icon: '🏁',
    color: C.orange,
  },
];

/** Por que estudar o espaço — usado no painel do Centro de Comando. */
export const WHY_SPACE = [
  'Satélites ajudam na previsão do tempo, na internet, no GPS e na comunicação.',
  'Do espaço observamos o planeta e estudamos as mudanças climáticas.',
  'Estudar o espaço é estudar Física, Biologia, Matemática, Engenharia e Geografia ao mesmo tempo.',
];

/** Sequência de terminal exibida na tela final (roteiro do documento). */
export const FINALE_TERMINAL: { text: string; delay: number }[] = [
  { text: 'PROCESSANDO DADOS...', delay: 1500 },
  { text: 'TREINAMENTO CONCLUÍDO.', delay: 1400 },
  { text: 'ANALISANDO PERFIL DO CANDIDATO...', delay: 1800 },
  { text: 'RESULTADO:', delay: 900 },
  { text: 'CANDIDATO APTO PARA A MISSÃO.', delay: 1600 },
];

/** Texto da tela de parabéns. */
export const FINALE_MESSAGE = [
  'Você concluiu o treinamento inicial da Missão Espaço.',
  'Hoje você conheceu uma nova forma de aprender.',
  'Descobriu que a Ciência começa com perguntas.',
  'Entendeu por que existem as eletivas e os Clubes de Letramento.',
  'E conheceu a proposta da nossa missão.',
];

export const FINALE_QUESTION = 'Você aceita embarcar nesta jornada?';

/** Pergunta que abre a próxima aula. */
export const NEXT_MISSION_QUESTION = 'Como conseguimos sair da Terra?';

/** Conteúdo integral do TERMO DE COMPROMISSO entregue impresso aos estudantes. */
export const TERMO = {
  kicker: 'TERMO DE COMPROMISSO',
  title: 'Eletiva Missão Espaço',
  subtitle: 'Convite para a Jornada Científica',
  intro: [
    'Parabéns! Ao concluir esta apresentação, você conheceu a proposta da eletiva Missão Espaço.',
    'Mais do que estudar o Universo, esta eletiva convida seus participantes a desenvolver a curiosidade, investigar problemas, construir soluções, trabalhar em equipe e descobrir como a Ciência está presente em nosso cotidiano.',
    'Caso escolha participar desta eletiva, você fará parte de uma jornada de investigação científica, na qual cada desafio representará uma oportunidade de aprender, criar, experimentar e compartilhar descobertas.',
    'Para iniciar essa caminhada, convidamos você a assumir alguns compromissos que serão importantes durante todo o semestre.',
  ],
  commitmentsTitle: 'Eu me comprometo a:',
  commitments: [
    'Participar das atividades com interesse e dedicação.',
    'Respeitar meus colegas e trabalhar de forma colaborativa.',
    'Fazer perguntas sempre que tiver curiosidade ou dúvidas.',
    'Cuidar dos materiais utilizados durante as atividades.',
    'Registrar minhas descobertas e compartilhar minhas ideias.',
    'Entender que errar faz parte do processo de aprender.',
    'Persistir diante dos desafios, buscando diferentes soluções.',
    'Contribuir para que nossa turma seja um espaço de respeito, colaboração e aprendizagem.',
    'Aproveitar esta oportunidade para desenvolver minha criatividade, autonomia e pensamento científico.',
  ],
  declarationTitle: 'Declaração',
  declaration:
    'Caso eu escolha participar da eletiva Missão Espaço, comprometo-me a contribuir de forma responsável, respeitosa e colaborativa durante todas as atividades desenvolvidas ao longo deste semestre, buscando aprender, investigar e construir conhecimentos junto aos meus colegas e à professora.',
  quote: '"Toda grande descoberta começou quando alguém aceitou o desafio de aprender algo novo."',
  farewell: 'Nos vemos na próxima missão. 🚀',
};
