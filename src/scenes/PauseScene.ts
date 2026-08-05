import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, SCENES, TOTAL_CHAPTERS } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { getChapter } from '@/data/chapters';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import { Button } from '@/ui/Button';
import { createPanel } from '@/ui/Panel';
import { popIn } from '@/utils/anim';

interface PauseData {
  levelKey: string;
}

/** Menu de pausa sobreposto à fase em andamento. */
export class PauseScene extends Phaser.Scene {
  private levelKey: string = SCENES.LEVEL_1;

  constructor() {
    super({ key: SCENES.PAUSE, active: false });
  }

  init(data: PauseData): void {
    this.levelKey = data.levelKey ?? SCENES.LEVEL_1;
  }

  create(): void {
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.space900, 0.78).setInteractive();

    const panel = this.add.container(CX, CY);
    panel.add(
      createPanel(this, 0, 0, {
        width: 520,
        height: 470,
        radius: 30,
        fill: C.space700,
        border: C.violetLight,
        borderWidth: 3,
      }),
    );

    const chapter = getChapter(gameState.chapter);
    panel.add(this.add.text(0, -186, '⏸', { fontSize: '44px' }).setOrigin(0.5));
    panel.add(this.add.text(0, -136, 'MISSÃO PAUSADA', titleStyle(34, C.ink)).setOrigin(0.5));
    panel.add(
      this.add
        .text(0, -100, `Fase ${chapter.number} de ${TOTAL_CHAPTERS} · ${chapter.title}`, bodyStyle(16, C.inkSoft))
        .setOrigin(0.5),
    );
    panel.add(
      this.add.text(0, -70, `⭐ ${gameState.score} estrelas coletadas`, bodyStyle(16, C.amber)).setOrigin(0.5),
    );

    popIn(this, panel);

    new Button(this, CX, CY - 10, {
      label: 'CONTINUAR',
      icon: '▶',
      width: 380,
      height: 62,
      fontSize: 24,
      variant: 'primary',
      onClick: () => this.resumeGame(),
    });

    new Button(this, CX, CY + 62, {
      label: 'REINICIAR FASE',
      icon: '↻',
      width: 380,
      height: 58,
      fontSize: 20,
      variant: 'secondary',
      onClick: () => this.restartLevel(),
    });

    const soundButton = new Button(this, CX - 96, CY + 134, {
      label: gameState.muted ? 'SOM: OFF' : 'SOM: ON',
      width: 186,
      height: 54,
      fontSize: 17,
      variant: 'ghost',
      onClick: () => {
        const muted = !gameState.muted;
        gameState.setMuted(muted);
        audio.setMuted(muted);
        soundButton.setLabel(muted ? 'SOM: OFF' : 'SOM: ON');
        if (!muted) audio.startMusic();
      },
    });

    new Button(this, CX + 96, CY + 134, {
      label: 'MENU',
      width: 186,
      height: 54,
      fontSize: 17,
      variant: 'ghost',
      onClick: () => this.backToMenu(),
    });

    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private resumeGame(): void {
    this.scene.resume(this.levelKey);
    this.scene.resume(SCENES.HUD);
    this.scene.stop();
  }

  private restartLevel(): void {
    this.scene.resume(SCENES.HUD);
    const level = this.scene.get(this.levelKey);
    this.scene.stop();
    level.scene.restart();
  }

  private backToMenu(): void {
    gameState.save();
    this.scene.stop(SCENES.HUD);
    this.scene.stop(this.levelKey);
    this.scene.stop();
    this.scene.start(SCENES.MENU);
  }
}
