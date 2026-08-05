import Phaser from 'phaser';
import { SCENES } from '@/config/constants';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import { createGeneratedTextures } from '@/utils/textures';

/**
 * Cena de arranque: prepara texturas procedurais e o estado salvo
 * antes de qualquer carregamento de arquivo.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  create(): void {
    createGeneratedTextures(this);
    gameState.loadFromStorage();
    audio.setMuted(gameState.muted);
    this.scene.start(SCENES.PRELOAD);
  }
}
