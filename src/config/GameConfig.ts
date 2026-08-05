import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { C } from './theme';

import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MenuScene } from '@/scenes/MenuScene';
import { InstructionsScene } from '@/scenes/InstructionsScene';
import { CreditsScene } from '@/scenes/CreditsScene';
import { AchievementsScene } from '@/scenes/AchievementsScene';
import { ChapterIntroScene } from '@/scenes/ChapterIntroScene';
import { HudScene } from '@/scenes/HudScene';
import { PauseScene } from '@/scenes/PauseScene';
import { Level1Scene } from '@/scenes/Level1Scene';
import { Level2Scene } from '@/scenes/Level2Scene';
import { Level3Scene } from '@/scenes/Level3Scene';
import { Level4Scene } from '@/scenes/Level4Scene';
import { Level5Scene } from '@/scenes/Level5Scene';
import { Level6Scene } from '@/scenes/Level6Scene';
import { FinaleScene } from '@/scenes/FinaleScene';

/**
 * Configuração do Phaser.
 *
 * Resolução base 1280×720 com `Scale.FIT`: o mesmo enquadramento é preservado
 * em qualquer tela (desktop, notebook, tablet ou celular), sem quebrar layouts.
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: C.space900,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  roundPixels: false,
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    /** Limites evitam upscale exagerado em monitores muito grandes. */
    max: { width: 2560, height: 1440 },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 2,
  },
  render: {
    powerPreference: 'high-performance',
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    InstructionsScene,
    CreditsScene,
    AchievementsScene,
    ChapterIntroScene,
    Level1Scene,
    Level2Scene,
    Level3Scene,
    Level4Scene,
    Level5Scene,
    Level6Scene,
    FinaleScene,
    HudScene,
    PauseScene,
  ],
};
