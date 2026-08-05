import Phaser from 'phaser';
import { C, FONT_TITLE, hex } from '@/config/theme';
import { audio } from '@/services/AudioService';

export interface IconButtonOptions {
  icon: string;
  onClick: () => void;
  radius?: number;
  fill?: number;
  border?: number;
  tooltip?: string;
}

/** Botão circular compacto — usado no HUD (pausa, som) e em fechamentos. */
export class IconButton extends Phaser.GameObjects.Container {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly radius: number;
  private readonly fill: number;
  private readonly border: number;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly options: IconButtonOptions) {
    super(scene, x, y);

    this.radius = options.radius ?? 26;
    this.fill = options.fill ?? C.space600;
    this.border = options.border ?? C.violetLight;

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.label = scene.add
      .text(0, 1, options.icon, {
        fontFamily: FONT_TITLE,
        fontSize: `${Math.round(this.radius * 1.05)}px`,
        color: hex(C.ink),
      })
      .setOrigin(0.5);
    this.add(this.label);

    this.paint(false);

    // O Phaser normaliza o ponto pela origem do container (metade do tamanho),
    // por isso o círculo de contato fica centrado em (raio, raio).
    this.setSize(this.radius * 2, this.radius * 2);
    this.setInteractive(
      new Phaser.Geom.Circle(this.radius, this.radius, this.radius),
      Phaser.Geom.Circle.Contains,
    );
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.paint(true);
      audio.play('hover');
    });
    this.on(Phaser.Input.Events.POINTER_OUT, () => this.paint(false));
    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      audio.unlock();
      this.setScale(0.92);
    });
    this.on(Phaser.Input.Events.POINTER_UP, () => {
      this.setScale(1);
      audio.play('click');
      options.onClick();
    });

    scene.add.existing(this);
  }

  private paint(hover: boolean): void {
    this.graphics.clear();
    this.graphics.fillStyle(C.black, 0.35);
    this.graphics.fillCircle(0, 4, this.radius);
    this.graphics.fillStyle(hover ? C.space500 : this.fill, 1);
    this.graphics.fillCircle(0, 0, this.radius);
    this.graphics.lineStyle(2.5, this.border, hover ? 1 : 0.7);
    this.graphics.strokeCircle(0, 0, this.radius);
  }

  setIcon(icon: string): this {
    this.options.icon = icon;
    this.label.setText(icon);
    return this;
  }
}
