/** Tipos compartilhados entre dados, serviços e cenas. */

/** Avatares que o estudante escolhe ao criar a tripulação. */
export interface AvatarOption {
  id: string;
  label: string;
  /** Chave da textura SVG correspondente. */
  texture: string;
  /** Arquivo usado na miniatura HTML da tela de criação. */
  file: string;
}

/** Carta do ARQUIVO CONFIDENCIAL DA MISSÃO (Capítulo 1). */
export interface ArquivoCard {
  id: string;
  prompt: string;
  /** Alternativas: nenhuma é "errada" — o registro é pessoal. */
  options: string[];
  /** Quando presente, as alternativas são ilustradas (texturas SVG). */
  optionTextures?: string[];
  /** Frase de valorização exibida após o registro. */
  reply: string;
}

/** Princípio da Escola das Adolescências (Capítulo 2). */
export interface Principle {
  id: string;
  title: string;
  description: string;
  color: number;
  icon: string;
}

/** Carta classificável entre "aulas tradicionais" e "eletivas" (Capítulo 3). */
export interface SortCard {
  id: string;
  label: string;
  icon: string;
  zone: 'tradicional' | 'eletiva';
  /** Explicação mostrada quando a carta é classificada corretamente. */
  insight: string;
}

/** Objeto investigável da Sala de Ciências (Capítulo 4). */
export interface LabObject {
  id: string;
  name: string;
  texture: string;
  x: number;
  y: number;
  scale: number;
  question: string;
  story: string;
}

/** Etapa do método científico (Capítulo 4). */
export interface MethodStep {
  id: string;
  label: string;
  icon: string;
  hint: string;
}

/** Tópico de conversa com a Professora Elo (Capítulo 5). */
export interface DialogueTopic {
  id: string;
  question: string;
  lines: string[];
}

/** Combinado da missão (Capítulo 5). */
export interface AgreementOption {
  id: string;
  label: string;
  icon: string;
  valid: boolean;
  feedback: string;
}

/** Módulo do foguete = etapa da missão (Capítulo 6). */
export interface RocketModule {
  id: string;
  label: string;
  detail: string;
  icon: string;
  color: number;
}

/** Metadados narrativos de cada capítulo/fase. */
export interface ChapterInfo {
  number: number;
  title: string;
  subtitle: string;
  /** Falas de abertura, exibidas na cena de introdução. */
  intro: string[];
  /** Objetivo exibido no HUD. */
  objective: string;
  /** Dica de controles específica da fase. */
  controls: string;
  /** Mensagem de encerramento da fase, ligando ao capítulo seguinte. */
  outro: string;
}

/** Conquista desbloqueável. */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

/** Estrutura persistida no localStorage. */
export interface SaveData {
  version: number;
  playerName: string;
  avatarId: string;
  score: number;
  chapter: number;
  completedChapters: number[];
  achievements: string[];
  /** Registros do Arquivo Confidencial (id da carta -> resposta escolhida). */
  archive: Record<string, string>;
  muted: boolean;
  updatedAt: number;
}
