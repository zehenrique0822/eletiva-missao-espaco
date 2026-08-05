import type { SortCard } from '@/types';

/**
 * Capítulo 3 — a comparação em duas colunas proposta no documento
 * ("Em muitas aulas..." x "Nas eletivas...") vira um jogo de classificação.
 */
export const SORT_CARDS: SortCard[] = [
  {
    id: 'copiar',
    label: 'Copiar',
    icon: '✏️',
    zone: 'tradicional',
    insight: 'Copiar ajuda a registrar e organizar o que aprendemos.',
  },
  {
    id: 'memorizar',
    label: 'Memorizar',
    icon: '🧠',
    zone: 'tradicional',
    insight: 'Memorizar é útil quando precisamos ter algo sempre à mão.',
  },
  {
    id: 'exercicios',
    label: 'Resolver exercícios',
    icon: '📄',
    zone: 'tradicional',
    insight: 'Exercícios treinam o que já foi explicado.',
  },
  {
    id: 'responder',
    label: 'Responder perguntas',
    icon: '🙋',
    zone: 'tradicional',
    insight: 'Responder mostra o que já sabemos sobre um assunto.',
  },
  {
    id: 'investigar',
    label: 'Investigar',
    icon: '🔍',
    zone: 'eletiva',
    insight: 'Na eletiva a pergunta vem antes da resposta.',
  },
  {
    id: 'experimentar',
    label: 'Experimentar',
    icon: '🧪',
    zone: 'eletiva',
    insight: 'Testar ideias é o coração do trabalho científico.',
  },
  {
    id: 'criar',
    label: 'Criar',
    icon: '💡',
    zone: 'eletiva',
    insight: 'Criar é transformar uma ideia em algo que existe de verdade.',
  },
  {
    id: 'construir',
    label: 'Construir',
    icon: '🔧',
    zone: 'eletiva',
    insight: 'Construindo, a gente aprende com as mãos e com os erros.',
  },
  {
    id: 'colaborar',
    label: 'Colaborar',
    icon: '🤝',
    zone: 'eletiva',
    insight: 'Na Ciência ninguém descobre tudo sozinho.',
  },
  {
    id: 'apresentar',
    label: 'Apresentar',
    icon: '🎤',
    zone: 'eletiva',
    insight: 'Comunicar a descoberta faz parte da investigação.',
  },
];

export const SORT_ZONES = {
  tradicional: {
    id: 'tradicional' as const,
    title: 'EM MUITAS AULAS',
    subtitle: 'o caminho de sempre',
  },
  eletiva: {
    id: 'eletiva' as const,
    title: 'NAS ELETIVAS',
    subtitle: 'o caminho da investigação',
  },
};

/** Mensagem final da fase: as duas formas de aprender têm valor. */
export const SORT_CONCLUSION =
  'Na verdade, todas são importantes. Cada uma ajuda vocês a aprender de um jeito diferente — a eletiva só acrescenta novas formas de descobrir.';
