import { TEX } from '@/config/constants';
import type { LabObject, MethodStep } from '@/types';

/**
 * Capítulo 4 — Sala de Ciências.
 * Cada objeto guarda uma pequena história mostrando que a Ciência nasce da
 * curiosidade, conforme as observações de desenvolvimento do documento.
 */
export const LAB_OBJECTS: LabObject[] = [
  {
    id: 'lupa',
    name: 'Lupa',
    texture: TEX.OBJ_LUPA,
    x: 250,
    y: 285,
    scale: 0.6,
    question: 'O que aparece quando olhamos bem de perto?',
    story:
      'Muito antes dos grandes laboratórios, alguém aproximou uma lente de uma folha comum e viu um mundo inteiro escondido ali. Observar de perto é o primeiro passo da Ciência.',
  },
  {
    id: 'telescopio',
    name: 'Telescópio',
    texture: TEX.OBJ_TELESCOPIO,
    x: 460,
    y: 275,
    scale: 0.66,
    question: 'O que existe além das estrelas?',
    story:
      'Milhares de pessoas olharam para o céu à noite. Um dia alguém apontou um tubo com lentes para cima e descobriu que Júpiter também tinha luas. O céu era o mesmo — a diferença estava em olhar com atenção.',
  },
  {
    id: 'bussola',
    name: 'Bússola',
    texture: TEX.OBJ_BUSSOLA,
    x: 670,
    y: 285,
    scale: 0.6,
    question: 'Por que a agulha aponta sempre para o mesmo lado?',
    story:
      'Uma agulha teimosa que sempre aponta para o norte. Perguntar "por quê?" levou à descoberta de que a Terra inteira funciona como um imã gigante.',
  },
  {
    id: 'folha',
    name: 'Folha',
    texture: TEX.OBJ_FOLHA,
    x: 870,
    y: 280,
    scale: 0.58,
    question: 'Como as plantas sabem para onde crescer?',
    story:
      'Por que as plantas crescem em direção à luz? Essa pergunta simples abriu um capítulo inteiro da Biologia — e ainda hoje rende novas investigações.',
  },
  {
    id: 'microscopio',
    name: 'Microscópio',
    texture: TEX.OBJ_MICROSCOPIO,
    x: 340,
    y: 480,
    scale: 0.68,
    question: 'Como uma única célula forma um organismo inteiro?',
    story:
      'Só foi possível fazer essa pergunta depois que alguém decidiu olhar muito mais de perto. Cada novo instrumento permite novas perguntas — e cada pergunta pede um novo instrumento.',
  },
  {
    id: 'rocha',
    name: 'Rocha com fóssil',
    texture: TEX.OBJ_ROCHA,
    x: 580,
    y: 490,
    scale: 0.62,
    question: 'O que uma pedra pode contar?',
    story:
      'Uma pedra comum pode guardar milhões de anos de história. Fósseis contam o que ninguém viu acontecer: a Ciência também investiga o passado.',
  },
  {
    id: 'foguete',
    name: 'Foguete em miniatura',
    texture: TEX.ROCKET,
    x: 800,
    y: 480,
    scale: 0.45,
    question: 'Como conseguimos vencer a gravidade?',
    story:
      'Imagine uma maçã caindo de uma árvore. Milhares de pessoas já viram isso. Mas um dia alguém perguntou: "por que ela sempre cai para baixo?". A diferença não estava na maçã — estava na pergunta.',
  },
];

/**
 * As cinco etapas escritas no quadro pelo documento.
 * A ordem do array É a resposta correta do desafio de sequência.
 */
export const METHOD_STEPS: MethodStep[] = [
  { id: 'observar', label: 'OBSERVAR', icon: '👀', hint: 'Tudo começa reparando em algo do mundo.' },
  { id: 'perguntar', label: 'PERGUNTAR', icon: '❓', hint: 'A observação vira uma pergunta.' },
  { id: 'imaginar', label: 'IMAGINAR', icon: '💭', hint: 'Imaginamos uma resposta possível: a hipótese.' },
  { id: 'testar', label: 'TESTAR', icon: '🧪', hint: 'Colocamos a hipótese à prova.' },
  { id: 'aprender', label: 'APRENDER', icon: '🌟', hint: 'Comparamos os resultados e aprendemos.' },
];

/** Frase que aparece na porta desbloqueada ao fim da fase. */
export const LAB_DOOR_LABEL = 'LABORATÓRIO DA PROFESSORA';

/** O que é letramento científico, na linguagem do documento. */
export const LETRAMENTO_TEXT = [
  'Ser letrado cientificamente é olhar para o mundo com curiosidade.',
  'É fazer perguntas, procurar informações confiáveis e observar antes de concluir.',
  'É testar ideias, respeitar as evidências e conversar sobre o que descobrimos.',
  'É entender que podemos mudar de opinião quando encontramos novas informações.',
];
