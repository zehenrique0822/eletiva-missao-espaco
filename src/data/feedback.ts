/**
 * Mensagens de incentivo.
 * O documento pede que nenhuma resposta seja corrigida com dureza:
 * o erro faz parte do processo e é sempre devolvido como convite a tentar de novo.
 */

export const PRAISE: string[] = [
  'Isso mesmo!',
  'Boa, tripulante!',
  'Excelente observação!',
  'Você está pensando como cientista!',
  'Perfeito!',
  'Muito bem!',
  'Que raciocínio!',
  'Missão avançando!',
];

export const COLLECT_PRAISE: string[] = [
  'Toda pergunta tem valor!',
  'Curiosidade registrada!',
  'Mais uma descoberta!',
  'Anotado no Diário de Bordo!',
  'Ótima escolha!',
];

export const GENTLE_MISS: string[] = [
  'Quase! Vamos tentar de novo?',
  'Errar faz parte da Ciência. Tente outra vez!',
  'Hmm... e se pensarmos por outro caminho?',
  'Sem problema: cientistas testam várias vezes.',
  'Não é bem por aqui. Observe de novo!',
];

export const ENERGY_LOW = 'Cuidado com a energia da nave, tripulante!';

export const ENERGY_EMPTY = 'Energia recarregada! Nenhum cientista desiste na primeira tentativa.';

/** Sorteia uma frase sem repetir a última usada (evita repetição perceptível). */
export function pick(list: string[], lastIndex = -1): { text: string; index: number } {
  if (list.length === 1) return { text: list[0], index: 0 };
  let index = Math.floor(Math.random() * list.length);
  if (index === lastIndex) index = (index + 1) % list.length;
  return { text: list[index], index };
}
