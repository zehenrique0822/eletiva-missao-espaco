import type { Achievement } from '@/types';

/** Identificadores das conquistas (usados pelas cenas para desbloquear). */
export const ACH = {
  FIRST_QUESTION: 'primeira-pergunta',
  ARCHIVE_SEALED: 'arquivo-lacrado',
  FIVE_PRINCIPLES: 'cinco-principios',
  NO_DAMAGE: 'voo-impecavel',
  ROOM_EXPLORER: 'explorador-da-sala',
  METHOD_MASTER: 'metodo-cientifico',
  SCIENCE_FRIEND: 'amizade-cientifica',
  AGREEMENTS: 'combinados-firmados',
  ROCKET_ENGINEER: 'engenheiro-de-foguetes',
  CREW_APPROVED: 'tripulacao-aprovada',
  STAR_COLLECTOR: 'colecionador-de-estrelas',
  FULL_MISSION: 'curiosidade-infinita',
} as const;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: ACH.FIRST_QUESTION,
    title: 'Primeira Pergunta',
    description: 'Registrou a primeira resposta do Arquivo Confidencial.',
    icon: '❓',
  },
  {
    id: ACH.ARCHIVE_SEALED,
    title: 'Arquivo Lacrado',
    description: 'Completou todo o Arquivo Confidencial da Missão.',
    icon: '✉️',
  },
  {
    id: ACH.FIVE_PRINCIPLES,
    title: 'Cinco Princípios',
    description: 'Capturou os cinco princípios da Escola das Adolescências.',
    icon: '💎',
  },
  {
    id: ACH.NO_DAMAGE,
    title: 'Voo Impecável',
    description: 'Concluiu uma fase sem perder nenhuma energia.',
    icon: '🛡️',
  },
  {
    id: ACH.ROOM_EXPLORER,
    title: 'Explorador da Sala',
    description: 'Investigou os sete objetos da Sala de Ciências.',
    icon: '🔬',
  },
  {
    id: ACH.METHOD_MASTER,
    title: 'Método Científico',
    description: 'Montou o caminho da investigação sem errar nenhuma etapa.',
    icon: '🧭',
  },
  {
    id: ACH.SCIENCE_FRIEND,
    title: 'Amizade Científica',
    description: 'Conversou sobre todos os assuntos com a Professora Elo.',
    icon: '💬',
  },
  {
    id: ACH.AGREEMENTS,
    title: 'Combinados Firmados',
    description: 'Montou todos os combinados da missão.',
    icon: '📜',
  },
  {
    id: ACH.ROCKET_ENGINEER,
    title: 'Engenheiro de Foguetes',
    description: 'Montou os seis módulos do foguete da missão.',
    icon: '🔧',
  },
  {
    id: ACH.CREW_APPROVED,
    title: 'Tripulação Aprovada',
    description: 'Concluiu o treinamento inicial da Missão Espaço.',
    icon: '🚀',
  },
  {
    id: ACH.STAR_COLLECTOR,
    title: 'Colecionador de Estrelas',
    description: 'Acumulou 400 estrelas ou mais durante a missão.',
    icon: '⭐',
  },
  {
    id: ACH.FULL_MISSION,
    title: 'Curiosidade Infinita',
    description: 'Desbloqueou todas as outras conquistas da missão.',
    icon: '🌌',
  },
];

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

/** Total exigido para a conquista final (todas menos ela mesma). */
export const ACHIEVEMENTS_FOR_COMPLETION = ACHIEVEMENTS.length - 1;
