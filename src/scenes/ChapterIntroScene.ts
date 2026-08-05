import Phaser from 'phaser';
import { CX, LEVEL_SCENES, SCENES, TOTAL_CHAPTERS } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { getChapter } from '@/data/chapters';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import { Button } from '@/ui/Button';
import { paintPanel } from '@/ui/Panel';
import { transitionTo } from '@/utils/anim';
import { createBackdrop } from '@/utils/backdrop';

const CHAPTER_ICONS = ['❓', '💎', '🌀', '🔬', '👩‍🔬', '🚀'];

interface ChapterIntroData {
  chapter?: number;
}

/**
 * Introdução narrativa de cada fase.
 * Apresenta as falas do capítulo, o objetivo e os controles antes do jogo começar.
 */
export class ChapterIntroScene extends Phaser.Scene {
  private chapterNumber = 1;
  private revealTweens: Phaser.Tweens.Tween[] = [];
  private lines: Phaser.GameObjects.Text[] = [];

  constructor() {
    super(SCENES.CHAPTER_INTRO);
  }

  init(data: ChapterIntroData): void {
    this.chapterNumber = Phaser.Math.Clamp(data.chapter ?? gameState.chapter, 1, TOTAL_CHAPTERS);
    this.revealTweens = [];
    this.lines = [];
  }

  create(): void {
    // O HUD não deve aparecer sobre a introdução.
    if (this.scene.isActive(SCENES.HUD)) this.scene.stop(SCENES.HUD);

    this.cameras.main.fadeIn(400, 5, 7, 15);
    createBackdrop(this, { stars: 140 });

    const chapter = getChapter(this.chapterNumber);

    this.add
      .text(CX, 56, `ETAPA ${chapter.number} DE ${TOTAL_CHAPTERS}`.split('').join(' '), bodyStyle(15, C.cyan, { fontStyle: 'bold' }))
      .setOrigin(0.5, 0);

    this.add.text(CX, 84, CHAPTER_ICONS[this.chapterNumber - 1], { fontSize: '52px' }).setOrigin(0.5, 0);
    this.add.text(CX, 146, chapter.title, { ...titleStyle(44, C.amber), align: 'center' }).setOrigin(0.5, 0);
    this.add.text(CX, 198, chapter.subtitle, bodyStyle(19, C.inkSoft)).setOrigin(0.5, 0);

    const panel = this.add.graphics({ x: CX, y: 0 });

    // As falas do capítulo entram em sequência (o toque revela todas de uma vez).
    let cursorY = 262;
    chapter.intro.forEach((line, index) => {
      const text = this.add
        .text(CX, cursorY, line, {
          ...bodyStyle(19, index === 0 ? C.ink : C.inkSoft),
          align: 'center',
          wordWrap: { width: 880 },
        })
        .setOrigin(0.5, 0)
        .setAlpha(0);

      this.lines.push(text);
      cursorY += text.height + 16;

      this.revealTweens.push(
        this.tweens.add({
          targets: text,
          alpha: 1,
          y: text.y - 8,
          duration: 520,
          delay: 260 + index * 620,
          ease: 'Cubic.easeOut',
        }),
      );
    });

    const panelTop = 236;
    const panelBottom = cursorY + 12;
    panel.y = (panelTop + panelBottom) / 2;
    paintPanel(panel, {
      width: 980,
      height: panelBottom - panelTop,
      radius: 28,
      fill: C.space800,
      fillAlpha: 0.82,
      border: C.violet,
      borderWidth: 2.5,
    });

    this.add
      .text(CX, panelBottom + 26, `🎯  ${chapter.objective}`, bodyStyle(19, C.amber, { fontStyle: 'bold' }))
      .setOrigin(0.5, 0);
    this.add
      .text(CX, panelBottom + 56, `🕹️  ${chapter.controls}`, bodyStyle(16, C.inkMuted))
      .setOrigin(0.5, 0);

    new Button(this, CX, 664, {
      label: 'INICIAR ETAPA',
      icon: '▶',
      width: 340,
      height: 66,
      fontSize: 25,
      variant: 'primary',
      onClick: () => this.startLevel(),
    });

    new Button(this, 130, 664, {
      label: 'MENU',
      width: 160,
      height: 52,
      fontSize: 17,
      variant: 'ghost',
      onClick: () => transitionTo(this, SCENES.MENU),
    });

    // Toque em qualquer lugar revela o texto imediatamente.
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.revealAll, this);
    this.input.keyboard?.on('keydown-SPACE', this.revealAll, this);
    this.input.keyboard?.once('keydown-ENTER', () => this.startLevel());

    audio.startMusic();
  }

  private revealAll(): void {
    this.revealTweens.forEach((tween) => tween.remove());
    this.revealTweens = [];
    this.lines.forEach((line) => line.setAlpha(1));
  }

  private startLevel(): void {
    const key = LEVEL_SCENES[this.chapterNumber - 1];
    audio.play('whoosh');
    transitionTo(this, key);
  }
}
