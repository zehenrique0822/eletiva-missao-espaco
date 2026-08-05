/**
 * Constantes globais da Missão Espaço.
 * O jogo é desenhado em uma resolução base fixa (16:9) e escalado pelo Phaser,
 * garantindo o mesmo enquadramento em desktop, notebook, tablet e celular.
 */

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

/** Centro da tela base — usado à exaustão nos layouts. */
export const CX = GAME_WIDTH / 2;
export const CY = GAME_HEIGHT / 2;

/** Chave do save no localStorage (versionada: muda quando o schema muda). */
export const SAVE_KEY = 'missao-espaco:save:v1';

/** Identificadores de cena (evita strings soltas pelo código). */
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  INSTRUCTIONS: 'InstructionsScene',
  CREDITS: 'CreditsScene',
  ACHIEVEMENTS: 'AchievementsScene',
  CHAPTER_INTRO: 'ChapterIntroScene',
  HUD: 'HudScene',
  PAUSE: 'PauseScene',
  LEVEL_1: 'Level1Scene',
  LEVEL_2: 'Level2Scene',
  LEVEL_3: 'Level3Scene',
  LEVEL_4: 'Level4Scene',
  LEVEL_5: 'Level5Scene',
  LEVEL_6: 'Level6Scene',
  FINALE: 'FinaleScene',
} as const;

/** Cenas jogáveis, na ordem dos capítulos do documento da eletiva. */
export const LEVEL_SCENES = [
  SCENES.LEVEL_1,
  SCENES.LEVEL_2,
  SCENES.LEVEL_3,
  SCENES.LEVEL_4,
  SCENES.LEVEL_5,
  SCENES.LEVEL_6,
] as const;

export const TOTAL_CHAPTERS = LEVEL_SCENES.length;

/** Texturas carregadas de arquivos SVG. */
export const TEX = {
  ASTRONAUT: 'astronaut',
  ROCKET: 'rocket',
  PROFESSORA: 'professora',
  EARTH: 'earth',
  PLANET: 'planet-ring',
  SATELLITE: 'satellite',
  STAR: 'star',
  ORB: 'orb-question',
  GEM: 'gem',
  METEOR: 'meteor',
  COLLECTOR: 'collector',
  ENVELOPE: 'envelope',
  DOOR: 'door',
  BOARDING_PASS: 'boarding-pass',
  OBJ_LUPA: 'obj-lupa',
  OBJ_TELESCOPIO: 'obj-telescopio',
  OBJ_BUSSOLA: 'obj-bussola',
  OBJ_FOLHA: 'obj-folha',
  OBJ_MICROSCOPIO: 'obj-microscopio',
  OBJ_ROCHA: 'obj-rocha',
  SCI_LAB: 'sci-lab',
  SCI_NATUREZA: 'sci-natureza',
  SCI_ESPACO: 'sci-espaco',
  SCI_ENGENHARIA: 'sci-engenharia',
} as const;

/** Texturas geradas em tempo de execução (partículas e brilhos). */
export const GEN = {
  GLOW: 'gen-glow',
  SPARK: 'gen-spark',
  RING: 'gen-ring',
  DUST: 'gen-dust',
} as const;

/** Eventos do barramento global (GameState). */
export const EVENTS = {
  SCORE_CHANGED: 'score-changed',
  ENERGY_CHANGED: 'energy-changed',
  PROGRESS_CHANGED: 'progress-changed',
  OBJECTIVE_CHANGED: 'objective-changed',
  ACHIEVEMENT_UNLOCKED: 'achievement-unlocked',
  TOAST: 'toast',
  MUTE_CHANGED: 'mute-changed',
} as const;

/** Pontuação padronizada (estrelas). */
export const POINTS = {
  COLLECT: 10,
  BONUS_STAR: 5,
  DISCOVERY: 15,
  PRINCIPLE: 20,
  STAGE_CLEAR: 50,
  PERFECT_BONUS: 30,
} as const;

export const MAX_ENERGY = 5;
