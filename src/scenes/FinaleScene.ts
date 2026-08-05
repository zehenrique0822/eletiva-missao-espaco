import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, SCENES, TEX, TOTAL_CHAPTERS } from '@/config/constants';
import { C, FONT_BODY, bodyStyle, hex, titleStyle } from '@/config/theme';
import { ACH, ACHIEVEMENTS } from '@/data/achievements';
import { FINALE_MESSAGE, FINALE_QUESTION, FINALE_TERMINAL } from '@/data/missao';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import { Button } from '@/ui/Button';
import { createPanel } from '@/ui/Panel';
import { openTermo } from '@/ui/forms';
import { burst, floaty, popIn, transitionTo, typewrite } from '@/utils/anim';
import { createBackdrop } from '@/utils/backdrop';

interface FinaleData {
  /** Quando `true`, pula a sequência de terminal (revisita pelo menu). */
  replay?: boolean;
}

/**
 * DESFECHO — análise do candidato, tela de parabéns e Termo de Compromisso.
 * Segue exatamente o roteiro final proposto no material da eletiva.
 */
export class FinaleScene extends Phaser.Scene {
  private replay = false;

  constructor() {
    super(SCENES.FINALE);
  }

  init(data: FinaleData): void {
    this.replay = data.replay ?? false;
  }

  create(): void {
    this.cameras.main.fadeIn(600, 0, 0, 0);

    Achievements.unlock(ACH.CREW_APPROVED);
    gameState.save();

    if (this.replay) {
      this.showCongratulations();
      return;
    }

    this.runTerminal();
  }

  // ------------------------------------------------- análise do candidato ---

  /** Tela preta, música baixando e o relatório do treinamento. */
  private runTerminal(): void {
    audio.stopMusic();
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.black).setDepth(-1);

    const cursorStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '26px',
      color: hex(C.green),
    };

    let y = 210;
    let delay = 600;

    FINALE_TERMINAL.forEach((entry, index) => {
      const isResult = index === FINALE_TERMINAL.length - 1;
      const label = this.add
        .text(240, y, '', isResult ? { ...cursorStyle, fontSize: '34px', color: hex(C.amber) } : cursorStyle)
        .setOrigin(0, 0);

      this.time.delayedCall(delay, () => {
        typewrite(this, label, `> ${entry.text}`, 42, undefined, () => audio.play('type'));
      });

      delay += entry.delay;
      y += isResult ? 66 : 52;
    });

    this.time.delayedCall(delay + 900, () => {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.restart({ replay: true });
      });
    });
  }

  // -------------------------------------------------------------- parabéns ---

  private showCongratulations(): void {
    createBackdrop(this, { stars: 180 });
    audio.startMusic();
    audio.play('complete');

    const rocket = this.add.image(150, 300, TEX.ROCKET).setScale(0.75).setAngle(-14);
    floaty(this, rocket, 20, 2600);

    const earth = this.add.image(1140, 560, TEX.EARTH).setScale(0.6).setAlpha(0.9);
    this.tweens.add({ targets: earth, angle: 360, duration: 200000, repeat: -1 });

    const celebration = this.add.particles(CX, -20, GEN.SPARK, {
      x: { min: 0, max: GAME_WIDTH },
      speedY: { min: 90, max: 240 },
      speedX: { min: -60, max: 60 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.9, end: 0 },
      rotate: { start: 0, end: 360 },
      lifespan: 3200,
      frequency: 90,
      quantity: 2,
      blendMode: Phaser.BlendModes.ADD,
      tint: [C.amber, C.cyan, C.magenta, C.green],
    });
    celebration.setDepth(-1);

    const panel = createPanel(this, CX, 356, {
      width: 860,
      height: 470,
      radius: 34,
      fill: C.space800,
      fillAlpha: 0.94,
      border: C.amber,
      borderWidth: 3,
    });
    popIn(this, panel);

    this.add.text(CX, 152, '🏆', { fontSize: '52px' }).setOrigin(0.5);
    this.add.text(CX, 214, 'PARABÉNS!', titleStyle(52, C.amber)).setOrigin(0.5);
    this.add
      .text(CX, 254, `Tripulante ${gameState.playerName} · CANDIDATO APTO PARA A MISSÃO`, {
        ...bodyStyle(17, C.green, { fontStyle: 'bold' }),
        align: 'center',
      })
      .setOrigin(0.5, 0);

    this.add
      .text(CX, 296, FINALE_MESSAGE.join('\n'), {
        ...bodyStyle(18, C.inkSoft),
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5, 0);

    this.buildStats();

    this.add
      .text(CX, 508, FINALE_QUESTION, titleStyle(26, C.ink))
      .setOrigin(0.5, 0);

    // Logo abaixo do painel (que termina em y=591), sem sobrepor a borda.
    new Button(this, CX, 612, {
      label: 'INICIAR MISSÃO',
      icon: '🚀',
      width: 400,
      height: 72,
      fontSize: 28,
      variant: 'primary',
      onClick: () => this.openCommitment(),
    });

    new Button(this, 190, 662, {
      label: 'CONQUISTAS',
      width: 220,
      height: 54,
      fontSize: 17,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.ACHIEVEMENTS),
    });

    new Button(this, GAME_WIDTH - 190, 662, {
      label: 'MENU PRINCIPAL',
      width: 220,
      height: 54,
      fontSize: 17,
      variant: 'ghost',
      onClick: () => transitionTo(this, SCENES.MENU),
    });

    this.time.delayedCall(400, () => burst(this, CX, 220, C.amber, 28));
  }

  /** Resumo numérico do treinamento. */
  private buildStats(): void {
    const stats = [
      { icon: '⭐', value: `${gameState.score}`, label: 'estrelas' },
      { icon: '🏅', value: `${gameState.achievements.size}/${ACHIEVEMENTS.length}`, label: 'conquistas' },
      { icon: '🚀', value: `${gameState.completedChapters.size}/${TOTAL_CHAPTERS}`, label: 'etapas' },
    ];

    const spacing = 240;
    const startX = CX - spacing;

    stats.forEach((stat, index) => {
      const x = startX + index * spacing;
      const group = this.add.container(x, 452);

      const background = this.add.graphics();
      background.fillStyle(C.space700, 0.9);
      background.fillRoundedRect(-100, -30, 200, 60, 18);
      background.lineStyle(2, C.violetLight, 0.7);
      background.strokeRoundedRect(-100, -30, 200, 60, 18);
      group.add(background);

      group.add(this.add.text(-72, 0, stat.icon, { fontSize: '26px' }).setOrigin(0.5));
      group.add(this.add.text(-48, -12, stat.value, titleStyle(22, C.amber)).setOrigin(0, 0.5));
      group.add(
        this.add
          .text(-48, 12, stat.label, { fontFamily: FONT_BODY, fontSize: '13px', color: hex(C.inkMuted) })
          .setOrigin(0, 0.5),
      );

      popIn(this, group, 200 + index * 120);
    });
  }

  /** Abre o Termo de Compromisso (documento HTML imprimível). */
  private openCommitment(): void {
    audio.play('unlock');
    openTermo(gameState.playerName, () => {
      transitionTo(this, SCENES.MENU);
    });
  }
}
