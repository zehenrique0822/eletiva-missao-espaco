import Phaser from 'phaser';
import { C, FONT_BODY, hex } from '@/config/theme';

export interface ProgressBarOptions {
  width: number;
  height?: number;
  color?: number;
  trackColor?: number;
  label?: string;
  showPercent?: boolean;
}

/** Barra de progresso animada, usada no HUD e nas telas de resultado. */
export class ProgressBar extends Phaser.GameObjects.Container {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly caption?: Phaser.GameObjects.Text;
  private readonly barWidth: number;
  private readonly barHeight: number;
  private readonly color: number;
  private readonly trackColor: number;
  private readonly showPercent: boolean;
  private value = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, options: ProgressBarOptions) {
    super(scene, x, y);

    this.barWidth = options.width;
    this.barHeight = options.height ?? 16;
    this.color = options.color ?? C.cyan;
    this.trackColor = options.trackColor ?? C.space700;
    this.showPercent = options.showPercent ?? false;

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    if (options.label || this.showPercent) {
      this.caption = scene.add
        .text(0, -this.barHeight - 10, options.label ?? '', {
          fontFamily: FONT_BODY,
          fontSize: '15px',
          color: hex(C.inkSoft),
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 1);
      this.add(this.caption);
    }

    this.redraw();
    scene.add.existing(this);
  }

  private redraw(): void {
    const w = this.barWidth;
    const h = this.barHeight;
    const r = h / 2;

    this.graphics.clear();
    this.graphics.fillStyle(this.trackColor, 0.95);
    this.graphics.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.graphics.lineStyle(2, C.space500, 0.8);
    this.graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

    const filled = Math.max(0, Math.min(1, this.value)) * (w - 6);
    if (filled > 2) {
      this.graphics.fillStyle(this.color, 1);
      this.graphics.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, filled, h - 6, (h - 6) / 2);
      this.graphics.fillStyle(C.white, 0.28);
      this.graphics.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, Math.max(0, filled - 4), (h - 6) * 0.4, 4);
    }
  }

  /** Define o progresso (0..1). Anima por padrão. */
  setValue(value: number, animate = true): this {
    const target = Phaser.Math.Clamp(value, 0, 1);

    if (!animate) {
      this.value = target;
      this.updateCaption();
      this.redraw();
      return this;
    }

    this.scene.tweens.addCounter({
      from: this.value,
      to: target,
      duration: 420,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        this.value = tween.getValue() ?? target;
        this.redraw();
      },
      onComplete: () => {
        this.value = target;
        this.updateCaption();
        this.redraw();
      },
    });
    return this;
  }

  setLabel(text: string): this {
    this.caption?.setText(text);
    return this;
  }

  private updateCaption(): void {
    if (this.showPercent && this.caption) {
      this.caption.setText(`${Math.round(this.value * 100)}%`);
    }
  }
}
