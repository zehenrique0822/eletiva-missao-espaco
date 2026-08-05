import Phaser from 'phaser';
import { CX, EVENTS, GAME_WIDTH, MAX_ENERGY, SCENES, TOTAL_CHAPTERS } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { getAvatar } from '@/data/arquivo';
import { getChapter } from '@/data/chapters';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import { IconButton } from '@/ui/IconButton';
import { ProgressBar } from '@/ui/ProgressBar';
import type { Achievement } from '@/types';

interface HudData {
  levelKey: string;
}

/**
 * HUD sobreposto às fases.
 *
 * Escuta o `gameState` e nunca conhece as regras das fases — assim a mesma
 * interface serve para todos os seis desafios.
 */
export class HudScene extends Phaser.Scene {
  private levelKey: string = SCENES.LEVEL_1;
  private scoreLabel!: Phaser.GameObjects.Text;
  private objectiveLabel!: Phaser.GameObjects.Text;
  private chapterLabel!: Phaser.GameObjects.Text;
  private progressBar!: ProgressBar;
  private energySegments: Phaser.GameObjects.Graphics[] = [];
  private muteButton!: IconButton;
  private toastQueue: { text: string; icon: string }[] = [];
  private toastActive = false;
  private achievementQueue: Achievement[] = [];
  private achievementActive = false;

  constructor() {
    super({ key: SCENES.HUD, active: false });
  }

  init(data: HudData): void {
    this.levelKey = data.levelKey ?? SCENES.LEVEL_1;
    this.energySegments = [];
    this.toastQueue = [];
    this.achievementQueue = [];
    this.toastActive = false;
    this.achievementActive = false;
  }

  create(): void {
    this.buildBar();
    this.bindState();
    this.refreshAll();
  }

  // ------------------------------------------------------------- interface ---

  private buildBar(): void {
    const bar = this.add.graphics();
    bar.fillStyle(C.space900, 0.86);
    bar.fillRoundedRect(-10, -30, GAME_WIDTH + 20, 126, { tl: 0, tr: 0, bl: 26, br: 26 });
    bar.lineStyle(2.5, C.violet, 0.55);
    bar.strokeRoundedRect(-10, -30, GAME_WIDTH + 20, 126, { tl: 0, tr: 0, bl: 26, br: 26 });

    // Identificação da tripulação (nome truncado para não invadir o objetivo)
    const avatar = getAvatar(gameState.avatarId);
    this.add.image(46, 46, avatar.texture).setScale(0.23);

    const name =
      gameState.playerName.length > 16 ? `${gameState.playerName.slice(0, 15)}…` : gameState.playerName;
    this.add.text(84, 22, name, titleStyle(19, C.ink)).setOrigin(0, 0);
    this.chapterLabel = this.add.text(84, 48, '', bodyStyle(13, C.inkMuted)).setOrigin(0, 0);

    // Objetivo da fase
    this.add.text(300, 26, '🎯', { fontSize: '20px' }).setOrigin(0.5, 0);
    this.objectiveLabel = this.add
      .text(320, 46, '', { ...bodyStyle(15, C.inkSoft), wordWrap: { width: 340 } })
      .setOrigin(0, 0.5);

    // Progresso da fase
    this.progressBar = new ProgressBar(this, 890, 62, {
      width: 220,
      height: 14,
      color: C.cyan,
      label: 'PROGRESSO DA FASE',
    });

    // Pontuação
    this.scoreLabel = this.add.text(1150, 30, '⭐ 0', titleStyle(24, C.amber)).setOrigin(1, 0.5);

    // Energia (segmentos)
    this.add.text(1016, 62, '⚡', { fontSize: '17px' }).setOrigin(0.5);
    for (let i = 0; i < MAX_ENERGY; i += 1) {
      const segment = this.add.graphics({ x: 1032 + i * 26, y: 62 });
      this.energySegments.push(segment);
    }

    // Ações
    new IconButton(this, 1190, 46, {
      icon: '⏸',
      radius: 24,
      onClick: () => this.pauseGame(),
    });

    this.muteButton = new IconButton(this, 1242, 46, {
      icon: gameState.muted ? '🔇' : '🔊',
      radius: 24,
      onClick: () => {
        const muted = !gameState.muted;
        gameState.setMuted(muted);
        audio.setMuted(muted);
        this.muteButton.setIcon(muted ? '🔇' : '🔊');
        if (!muted) audio.startMusic();
      },
    });
  }

  private bindState(): void {
    const onScore = (score: number, delta: number) => this.updateScore(score, delta);
    const onEnergy = () => this.updateEnergy();
    const onProgress = (value: number) => this.progressBar.setValue(value);
    const onObjective = (text: string) => this.objectiveLabel.setText(text);
    const onToast = (text: string, icon: string) => this.enqueueToast(text, icon);
    const onAchievement = (achievement: Achievement) => this.enqueueAchievement(achievement);

    gameState.on(EVENTS.SCORE_CHANGED, onScore);
    gameState.on(EVENTS.ENERGY_CHANGED, onEnergy);
    gameState.on(EVENTS.PROGRESS_CHANGED, onProgress);
    gameState.on(EVENTS.OBJECTIVE_CHANGED, onObjective);
    gameState.on(EVENTS.TOAST, onToast);
    gameState.on(EVENTS.ACHIEVEMENT_UNLOCKED, onAchievement);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameState.off(EVENTS.SCORE_CHANGED, onScore);
      gameState.off(EVENTS.ENERGY_CHANGED, onEnergy);
      gameState.off(EVENTS.PROGRESS_CHANGED, onProgress);
      gameState.off(EVENTS.OBJECTIVE_CHANGED, onObjective);
      gameState.off(EVENTS.TOAST, onToast);
      gameState.off(EVENTS.ACHIEVEMENT_UNLOCKED, onAchievement);
    });
  }

  private refreshAll(): void {
    const chapter = getChapter(gameState.chapter);
    this.chapterLabel.setText(`FASE ${chapter.number} DE ${TOTAL_CHAPTERS}`);
    this.objectiveLabel.setText(gameState.objective || chapter.objective);
    this.scoreLabel.setText(`⭐ ${gameState.score}`);
    this.progressBar.setValue(gameState.levelProgress, false);
    this.updateEnergy();
  }

  // --------------------------------------------------------------- updates ---

  private updateScore(score: number, delta: number): void {
    this.scoreLabel.setText(`⭐ ${score}`);
    if (delta <= 0) return;

    this.tweens.add({
      targets: this.scoreLabel,
      scale: 1.22,
      duration: 130,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  private updateEnergy(): void {
    this.energySegments.forEach((segment, index) => {
      const filled = index < gameState.energy;
      segment.clear();
      segment.fillStyle(filled ? (gameState.energy <= 2 ? C.red : C.green) : C.space600, filled ? 1 : 0.65);
      segment.fillRoundedRect(-11, -8, 22, 16, 6);
      segment.lineStyle(2, filled ? C.white : C.space500, filled ? 0.5 : 0.7);
      segment.strokeRoundedRect(-11, -8, 22, 16, 6);
    });
  }

  // ---------------------------------------------------------------- toasts ---

  private enqueueToast(text: string, icon: string): void {
    this.toastQueue.push({ text, icon });
    if (!this.toastActive) this.showNextToast();
  }

  private showNextToast(): void {
    const next = this.toastQueue.shift();
    if (!next) {
      this.toastActive = false;
      return;
    }

    this.toastActive = true;
    const container = this.add.container(CX, 150).setDepth(50);

    const label = this.add
      .text(18, 0, next.text, { ...bodyStyle(19, C.ink, { fontStyle: 'bold' }) })
      .setOrigin(0, 0.5);
    const iconLabel = this.add.text(-12, 0, next.icon, { fontSize: '26px' }).setOrigin(0.5);

    const width = label.width + 90;
    const panel = this.add.graphics();
    panel.fillStyle(C.space700, 0.96);
    panel.fillRoundedRect(-width / 2, -28, width, 56, 28);
    panel.lineStyle(2.5, C.amber, 0.85);
    panel.strokeRoundedRect(-width / 2, -28, width, 56, 28);

    label.x = -width / 2 + 60;
    iconLabel.x = -width / 2 + 32;

    container.add([panel, iconLabel, label]);
    container.setScale(0.7).setAlpha(0);

    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      y: 138,
      duration: 320,
      ease: 'Back.easeOut',
    });

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: container,
        alpha: 0,
        y: 108,
        duration: 300,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          container.destroy();
          this.showNextToast();
        },
      });
    });
  }

  // ----------------------------------------------------------- conquistas ---

  private enqueueAchievement(achievement: Achievement): void {
    this.achievementQueue.push(achievement);
    if (!this.achievementActive) this.showNextAchievement();
  }

  private showNextAchievement(): void {
    const next = this.achievementQueue.shift();
    if (!next) {
      this.achievementActive = false;
      return;
    }

    this.achievementActive = true;
    audio.play('achievement');

    const container = this.add.container(GAME_WIDTH + 220, 180).setDepth(60);

    const panel = this.add.graphics();
    panel.fillStyle(C.space700, 0.97);
    panel.fillRoundedRect(-190, -46, 380, 92, 22);
    panel.lineStyle(3, C.amber, 0.95);
    panel.strokeRoundedRect(-190, -46, 380, 92, 22);
    container.add(panel);

    container.add(this.add.text(-150, 0, next.icon, { fontSize: '38px' }).setOrigin(0.5));
    container.add(
      this.add.text(-116, -28, 'CONQUISTA DESBLOQUEADA', bodyStyle(12, C.amber, { fontStyle: 'bold' })).setOrigin(0, 0),
    );
    container.add(this.add.text(-116, -8, next.title, titleStyle(20, C.ink)).setOrigin(0, 0));
    container.add(
      this.add
        .text(-116, 18, next.description, { ...bodyStyle(12, C.inkMuted), wordWrap: { width: 290 } })
        .setOrigin(0, 0),
    );

    this.tweens.add({
      targets: container,
      x: GAME_WIDTH - 210,
      duration: 460,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2600, () => {
          this.tweens.add({
            targets: container,
            x: GAME_WIDTH + 240,
            duration: 380,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              container.destroy();
              this.showNextAchievement();
            },
          });
        });
      },
    });
  }

  // ------------------------------------------------------------------ pausa ---

  private pauseGame(): void {
    if (this.scene.isPaused(this.levelKey)) return;
    // A cena de pausa é iniciada antes de congelarmos fase e HUD.
    this.scene.launch(SCENES.PAUSE, { levelKey: this.levelKey });
    this.scene.pause(this.levelKey);
    this.scene.pause();
  }
}
