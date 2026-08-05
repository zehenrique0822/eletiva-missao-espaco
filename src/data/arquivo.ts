import { TEX } from '@/config/constants';
import type { ArquivoCard, AvatarOption } from '@/types';

/**
 * Capítulo 1 — ARQUIVO CONFIDENCIAL DA MISSÃO.
 * Cada campo da ficha impressa vira uma esfera de curiosidade coletável.
 * Nenhuma alternativa é "certa": o registro é pessoal e sempre valorizado.
 */
export const ARQUIVO_CARDS: ArquivoCard[] = [
  {
    id: 'gosto-aprender',
    prompt: 'Algo que eu gosto muito de aprender é...',
    options: [
      'Animais e natureza',
      'Tecnologia e jogos',
      'Espaço e estrelas',
      'Artes, música e histórias',
    ],
    reply: 'Registrado! Quem gosta de aprender já tem metade do caminho de um cientista.',
  },
  {
    id: 'palavra-ciencia',
    prompt: 'Quando penso em Ciência, a primeira palavra que vem à minha cabeça é...',
    options: ['Curiosidade', 'Experimento', 'Descoberta', 'Pergunta'],
    reply: 'Anotado no arquivo. Todas essas palavras cabem dentro da Ciência.',
  },
  {
    id: 'imagino-espaco',
    prompt: 'Quando penso no espaço, eu imagino...',
    options: ['Planetas gigantes', 'Silêncio e estrelas', 'Foguetes decolando', 'Mistérios sem resposta'],
    reply: 'Imaginação é combustível de missão. Guardado!',
  },
  {
    id: 'curiosidade-antiga',
    prompt: 'Uma curiosidade que eu sempre tive...',
    options: [
      'Como os pássaros conseguem voar?',
      'Por que o céu muda de cor?',
      'Por que as plantas crescem em direção à luz?',
      'Como um foguete vence a gravidade?',
    ],
    reply: 'Essa pergunta é científica de verdade — alguém já mudou o mundo perguntando algo assim.',
  },
  {
    id: 'quero-descobrir',
    prompt: 'Algo que eu gostaria muito de descobrir...',
    options: [
      'Se existe vida em outros planetas',
      'Como o Universo começou',
      'Como funciona o corpo humano',
      'Como criar uma invenção nova',
    ],
    reply: 'Ótimo objetivo de missão. Toda descoberta começa exatamente assim.',
  },
  {
    id: 'espero-eletiva',
    prompt: 'O que eu espero aprender nesta eletiva?',
    options: [
      'Como funcionam os foguetes',
      'A trabalhar bem em equipe',
      'A fazer experimentos de verdade',
      'A investigar como um cientista',
    ],
    reply: 'Sua expectativa foi lacrada no envelope. Vamos compará-la na última aula!',
  },
  {
    id: 'pergunta-astronauta',
    prompt: 'Se eu pudesse fazer apenas uma pergunta a um astronauta, eu perguntaria...',
    options: [
      'Como é dormir sem gravidade?',
      'O que se vê pela janela da nave?',
      'Dá medo na hora de decolar?',
      'Como é comer no espaço?',
    ],
    reply: 'Excelente pergunta! Perguntas boas valem mais do que respostas prontas.',
  },
  {
    id: 'imagino-cientista',
    prompt: 'Como você imagina um cientista?',
    options: ['No laboratório', 'Na natureza', 'Observando o céu', 'Construindo coisas'],
    optionTextures: [TEX.SCI_LAB, TEX.SCI_NATUREZA, TEX.SCI_ESPACO, TEX.SCI_ENGENHARIA],
    reply: 'Guardamos seu desenho. No fim da eletiva vamos descobrir se essa imagem mudou.',
  },
];

/** Pergunta de reflexão que fecha o Capítulo 1 (fica lacrada no envelope). */
export const REFLECTION_QUESTION =
  'Aprender significa apenas decorar informações ou também pode mudar a forma como enxergamos o mundo?';

/** Avatares disponíveis na criação da tripulação. */
export const AVATARS: AvatarOption[] = [
  { id: 'lab', label: 'Laboratório', texture: TEX.SCI_LAB, file: 'sci-lab.svg' },
  { id: 'natureza', label: 'Natureza', texture: TEX.SCI_NATUREZA, file: 'sci-natureza.svg' },
  { id: 'espaco', label: 'Astronomia', texture: TEX.SCI_ESPACO, file: 'sci-espaco.svg' },
  { id: 'engenharia', label: 'Engenharia', texture: TEX.SCI_ENGENHARIA, file: 'sci-engenharia.svg' },
];

export function getAvatar(id: string): AvatarOption {
  return AVATARS.find((avatar) => avatar.id === id) ?? AVATARS[0];
}
