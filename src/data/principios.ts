import { C } from '@/config/theme';
import type { Principle } from '@/types';

/**
 * Capítulo 2 — os cinco princípios da Escola das Adolescências,
 * traduzidos na linguagem acessível proposta pelo documento.
 */
export const PRINCIPLES: Principle[] = [
  {
    id: 'aprender',
    title: 'APRENDER',
    description: 'Todos são capazes de aprender, cada um no seu ritmo.',
    color: C.cyan,
    icon: '📘',
  },
  {
    id: 'participar',
    title: 'PARTICIPAR',
    description: 'A opinião dos estudantes importa.',
    color: C.magenta,
    icon: '🙋',
  },
  {
    id: 'colaborar',
    title: 'COLABORAR',
    description: 'Aprendemos melhor quando trabalhamos juntos.',
    color: C.amber,
    icon: '🤝',
  },
  {
    id: 'criar',
    title: 'CRIAR',
    description: 'A escola deve incentivar novas ideias.',
    color: C.green,
    icon: '💡',
  },
  {
    id: 'descobrir',
    title: 'DESCOBRIR',
    description: 'Aprender também significa investigar, experimentar e fazer perguntas.',
    color: C.violetLight,
    icon: '🔍',
  },
];

/** Curiosidades exibidas durante a fase 2, entre uma captura e outra. */
export const SCHOOL_FACTS: string[] = [
  'A escola muda porque o mundo muda.',
  'Aprender não é só decorar: é descobrir quem somos.',
  'Cada pessoa vive a adolescência de um jeito diferente. E está tudo bem.',
  'Ninguém precisa ser igual ao outro para aprender junto.',
  'Vocês fazem parte de uma geração que ajuda a construir uma nova forma de aprender.',
];
