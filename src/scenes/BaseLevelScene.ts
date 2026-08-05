import Phaser from 'phaser';
import { CX, GAME_WIDTH, GEN, POINTS, SCENES, TOTAL_CHAPTERS } from '@/config/constants';
import { C, TIMING } from '@/config/theme';
import { ACH } from '@/data/achievements';
import { getChapter } from '@/data/chapters';
import { ENERGY_EMPTY, ENERGY_LOW, GENTLE_MISS, PRAISE, pick } from '@/data/feedback';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import { Modal, type ModalOptions } from '@/ui/Modal';
import type { ChapterInfo } from '@/types';
import { floatingScore } from '@/utils/anim';
import { createBackdrop, type BackdropOptions } from '@/utils/backdrop';

/**
 * Base comum das seis fases.
 *
 * Centraliza tudo o que se repete — cenário, HUD, pausa, pontuação, energia,
 * feedback e conclusão — para que cada fase implemente apenas a sua mecânica.
 */
export abstract class BaseLevelScene extends Phaser.Scene {
  protected chapter!: ChapterInfo;
  /** Enquanto `true`, a fase ignora entradas (modal aberto, animação final). */
  protected locked = false;

  private lastPraiseIndex = -1;
  private lastMissIndex = -1;
  private finished = false;

  /** Número do capítulo (1..6) correspondente à fase. */
  protected abstract get chapterNumber(): number;

  /** Constrói a mecânica específica da fase. */
  protected abstract build(): void;

  /** Permite que cada fase ajuste o cenário de fundo. */
  protected backdropOptions(): BackdropOptions {
    return {};
  }

  create(): void {
    this.chapter = getChapter(this.chapterNumber);
    this.locked = false;
    this.finished = false;

    gameState.startChapter(this.chapterNumber);
    gameState.setObjective(this.chapter.objective);

    this.cameras.main.fadeIn(TIMING.fade, 5, 7, 15);
    createBackdrop(this, this.backdropOptions());

    if (!this.scene.isActive(SCENES.HUD)) {
      this.scene.launch(SCENES.HUD, { levelKey: this.scene.key });
    }

    this.input.keyboard?.on('keydown-ESC', () => this.requestPause());

    this.build();
  }

  // ------------------------------------------------------------------ pausa ---

  protected requestPause(): void {
    if (this.scene.isPaused()) return;
    this.scene.launch(SCENES.PAUSE, { levelKey: this.scene.key });
    this.scene.pause(SCENES.HUD);
    this.scene.pause();
  }

  // -------------------------------------------------------------- pontuação ---

  /** Soma pontos mostrando o valor flutuante na posição informada. */
  protected award(points: number, x = CX, y = 360, color: number = C.amber): void {
    gameState.addScore(points);
    floatingScore(this, x, y, points, color);
  }

  /** Mensagem curta de incentivo no HUD. */
  protected praise(icon = '✨', list: string[] = PRAISE): void {
    const result = pick(list, this.lastPraiseIndex);
    this.lastPraiseIndex = result.index;
    gameState.toast(result.text, icon);
  }

  /** Atualiza a barra de progresso da fase. */
  protected setProgress(done: number, total: number): void {
    gameState.setLevelProgress(total > 0 ? done / total : 0);
  }

  // ---------------------------------------------------------------- energia ---

  /**
   * Consome energia com feedback gentil.
   * Sem energia, a fase reinicia com uma mensagem de encorajamento —
   * nunca com uma tela de "game over".
   */
  protected damage(message?: string): void {
    const depleted = gameState.loseEnergy();
    audio.play('wrong');
    this.cameras.main.shake(180, 0.005);

    if (depleted) {
      this.handleEnergyDepleted();
      return;
    }

    if (message) {
      gameState.toast(message, '💡');
      return;
    }

    const result = pick(GENTLE_MISS, this.lastMissIndex);
    this.lastMissIndex = result.index;
    gameState.toast(gameState.energy <= 2 ? ENERGY_LOW : result.text, '⚡');
  }

  private handleEnergyDepleted(): void {
    this.locked = true;
    Modal.open(this, {
      eyebrow: 'Recarregando sistemas',
      icon: '⚡',
      title: 'Vamos tentar de novo!',
      body: ENERGY_EMPTY,
      accent: C.green,
      action: 'REINICIAR A FASE',
      onAction: () => this.scene.restart(),
    });
  }

  // ----------------------------------------------------------------- modais ---

  /** Abre um modal bloqueando a fase até que ele seja fechado. */
  protected openModal(options: ModalOptions): Modal {
    this.locked = true;
    return Modal.open(this, {
      ...options,
      onClose: () => {
        this.locked = false;
        options.onClose?.();
      },
    });
  }

  // -------------------------------------------------------------- conclusão ---

  /** Encerra a fase: recompensa, conquistas, celebração e transição. */
  protected completeLevel(options: { bonus?: number; title?: string; body?: string } = {}): void {
    if (this.finished) return;
    this.finished = true;
    this.locked = true;

    const bonus = options.bonus ?? 0;
    gameState.addScore(POINTS.STAGE_CLEAR + bonus);

    if (!gameState.damagedThisLevel) Achievements.unlock(ACH.NO_DAMAGE);
    gameState.completeChapter(this.chapterNumber);

    audio.play('complete');
    this.celebrate();

    this.time.delayedCall(700, () => {
      Modal.open(this, {
        eyebrow: `Etapa ${this.chapterNumber} de ${TOTAL_CHAPTERS} concluída`,
        icon: '🏅',
        title: options.title ?? 'Missão cumprida!',
        body: `${options.body ?? this.chapter.outro}\n\n⭐ +${POINTS.STAGE_CLEAR + bonus} estrelas`,
        accent: C.amber,
        action: this.chapterNumber >= TOTAL_CHAPTERS ? 'VER RESULTADO' : 'PRÓXIMA ETAPA',
        onAction: () => this.goNext(),
      });
    });
  }

  /** Chuva de confetes vindos do topo da tela. */
  protected celebrate(): void {
    const confetti = this.add.particles(0, -30, GEN.SPARK, {
      x: { min: 0, max: GAME_WIDTH },
      speedY: { min: 140, max: 320 },
      speedX: { min: -70, max: 70 },
      scale: { start: 0.42, end: 0 },
      rotate: { start: 0, end: 360 },
      alpha: { start: 1, end: 0.2 },
      lifespan: 2600,
      quantity: 3,
      frequency: 40,
      blendMode: Phaser.BlendModes.ADD,
      tint: [C.amber, C.cyan, C.magenta, C.green, C.violetLight],
    });
    confetti.setDepth(950);

    this.time.delayedCall(2200, () => confetti.stop());
    this.time.delayedCall(5200, () => confetti.destroy());
  }

  /** Avança para a próxima etapa (ou para o desfecho, na última). */
  protected goNext(): void {
    const isLast = this.chapterNumber >= TOTAL_CHAPTERS;
    const target = isLast ? SCENES.FINALE : SCENES.CHAPTER_INTRO;
    const data = isLast ? undefined : { chapter: this.chapterNumber + 1 };

    // O HUD tem câmera própria: some junto com a fase para a transição ficar limpa.
    if (this.scene.isActive(SCENES.HUD)) {
      this.scene.get(SCENES.HUD).cameras.main.fadeOut(TIMING.fade, 5, 7, 15);
    }

    this.cameras.main.fadeOut(TIMING.fade, 5, 7, 15);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop(SCENES.HUD);
      this.scene.start(target, data);
    });
  }
}
