import Phaser from 'phaser';
import { GAME_HEIGHT, GEN, SCENES, TEX, TOTAL_CHAPTERS } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { getAvatar } from '@/data/arquivo';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import { Button } from '@/ui/Button';
import { IconButton } from '@/ui/IconButton';
import { Modal } from '@/ui/Modal';
import { ProgressBar } from '@/ui/ProgressBar';
import { createPanel } from '@/ui/Panel';
import { openCrewForm } from '@/ui/forms';
import { floaty, transitionTo } from '@/utils/anim';
import { createBackdrop } from '@/utils/backdrop';

/** Menu principal: porta de entrada da missão. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create(): void {
    this.cameras.main.fadeIn(400, 5, 7, 15);
    createBackdrop(this, { stars: 150 });

    this.buildStage();
    this.buildMenuPanel();
    this.buildAudioToggle();

    audio.startMusic();
  }

  /** Lado esquerdo: cena ilustrada com Terra, foguete e satélite. */
  private buildStage(): void {
    const earth = this.add.image(220, GAME_HEIGHT + 60, TEX.EARTH).setScale(0.95).setAlpha(0.95);
    this.tweens.add({ targets: earth, angle: 360, duration: 220000, repeat: -1 });

    const glow = this.add
      .image(390, 350, GEN.GLOW)
      .setDisplaySize(560, 560)
      .setTint(C.violet)
      .setAlpha(0.28)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: glow,
      alpha: 0.45,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const rocket = this.add.image(390, 330, TEX.ROCKET).setScale(0.95).setAngle(-12);
    floaty(this, rocket, 22, 2600);

    // Rastro de propulsão do foguete
    const trail = this.add.particles(0, 0, GEN.GLOW, {
      speed: { min: 30, max: 110 },
      angle: { min: 80, max: 130 },
      scale: { start: 0.34, end: 0 },
      alpha: { start: 0.75, end: 0 },
      lifespan: 700,
      frequency: 60,
      blendMode: Phaser.BlendModes.ADD,
      tint: [C.amber, C.orange, C.magenta],
      follow: rocket,
      followOffset: { x: 24, y: 96 },
    });
    trail.setDepth(-1);

    const satellite = this.add.image(150, 170, TEX.SATELLITE).setScale(0.42).setAngle(-8);
    floaty(this, satellite, 14, 3400, 300);

    this.add
      .text(390, 566, 'Escola das Adolescências', bodyStyle(16, C.inkMuted))
      .setOrigin(0.5)
      .setAlpha(0.9);
    this.add
      .text(390, 592, 'Clube de Letramento Científico', bodyStyle(16, C.inkMuted))
      .setOrigin(0.5)
      .setAlpha(0.9);
  }

  /** Lado direito: painel com o título e as ações principais. */
  private buildMenuPanel(): void {
    const panelX = 920;
    const panelY = 360;

    createPanel(this, panelX, panelY, {
      width: 500,
      height: 540,
      radius: 32,
      fill: C.space700,
      fillAlpha: 0.94,
      border: C.violet,
      borderWidth: 3,
    });

    this.add
      .text(panelX, panelY - 226, 'MISSÃO ESPAÇO', titleStyle(46, C.amber))
      .setOrigin(0.5, 0);

    this.add
      .text(panelX, panelY - 172, 'A Ciência por Trás das Grandes Descobertas', {
        ...bodyStyle(17, C.inkSoft),
        align: 'center',
        wordWrap: { width: 420 },
      })
      .setOrigin(0.5, 0);

    const hasSave = gameState.hasSave;

    new Button(this, panelX, panelY - 92, {
      label: hasSave ? 'NOVA MISSÃO' : 'JOGAR',
      icon: '🚀',
      width: 380,
      height: 68,
      fontSize: 26,
      variant: 'primary',
      onClick: () => this.startNewGame(),
    });

    new Button(this, panelX, panelY - 8, {
      label: 'CONTINUAR',
      icon: '▶',
      width: 380,
      height: 68,
      fontSize: 26,
      variant: 'success',
      onClick: () => this.continueGame(),
    }).setEnabled(hasSave);

    const smallWidth = 152;
    const smallY = panelY + 76;
    new Button(this, panelX - smallWidth - 8, smallY, {
      label: 'COMO JOGAR',
      width: smallWidth,
      height: 56,
      fontSize: 15,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.INSTRUCTIONS),
    });
    new Button(this, panelX, smallY, {
      label: 'CONQUISTAS',
      width: smallWidth,
      height: 56,
      fontSize: 15,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.ACHIEVEMENTS),
    });
    new Button(this, panelX + smallWidth + 8, smallY, {
      label: 'CRÉDITOS',
      width: smallWidth,
      height: 56,
      fontSize: 15,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.CREDITS),
    });

    // Progresso da missão salva
    const completed = gameState.completedChapters.size;
    new ProgressBar(this, panelX, panelY + 168, {
      width: 380,
      height: 16,
      color: C.cyan,
      label: `Progresso da missão · ${completed}/${TOTAL_CHAPTERS} fases`,
    }).setValue(gameState.missionProgress, false);

    if (hasSave) {
      const avatar = getAvatar(gameState.avatarId);
      this.add.image(panelX - 150, panelY + 220, avatar.texture).setScale(0.2);
      this.add
        .text(panelX - 118, panelY + 220, `Tripulante ${gameState.playerName}`, bodyStyle(17, C.ink))
        .setOrigin(0, 0.5);
      this.add
        .text(panelX + 190, panelY + 220, `⭐ ${gameState.score}`, bodyStyle(17, C.amber))
        .setOrigin(1, 0.5);
    }
  }

  private buildAudioToggle(): void {
    const button = new IconButton(this, 1224, 52, {
      icon: gameState.muted ? '🔇' : '🔊',
      radius: 26,
      onClick: () => {
        const muted = !gameState.muted;
        gameState.setMuted(muted);
        audio.setMuted(muted);
        button.setIcon(muted ? '🔇' : '🔊');
        if (!muted) audio.startMusic();
      },
    });
  }

  // --------------------------------------------------------------- ações ---

  private startNewGame(): void {
    const begin = (): void => {
      openCrewForm(
        { name: gameState.playerName, avatarId: gameState.avatarId },
        (result) => {
          gameState.resetProgress();
          gameState.playerName = result.name;
          gameState.avatarId = result.avatarId;
          gameState.save();
          audio.play('unlock');
          transitionTo(this, SCENES.CHAPTER_INTRO, { chapter: 1 });
        },
      );
    };

    if (!gameState.hasSave) {
      begin();
      return;
    }

    Modal.open(this, {
      eyebrow: 'Atenção, tripulante',
      icon: '🛰️',
      title: 'Começar uma nova missão?',
      body: 'O progresso salvo será substituído por um novo registro de tripulação.',
      accent: C.amber,
      choices: [
        { label: 'Sim, começar do zero', onSelect: begin },
        { label: 'Não, voltar ao menu' },
      ],
    });
  }

  private continueGame(): void {
    if (gameState.isMissionComplete) {
      transitionTo(this, SCENES.FINALE, { replay: true });
      return;
    }
    transitionTo(this, SCENES.CHAPTER_INTRO, { chapter: gameState.chapter });
  }
}
