import Phaser from 'phaser';
import { C, FONT_TITLE, hex } from '@/config/theme';
import { audio } from '@/services/AudioService';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';

export interface ButtonOptions {
  label: string;
  onClick: () => void;
  icon?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  variant?: ButtonVariant;
}

interface VariantColors {
  face: number;
  edge: number;
  text: number;
  border: number;
}

const VARIANTS: Record<ButtonVariant, VariantColors> = {
  primary: { face: C.amber, edge: C.amberDark, text: 0x10142c, border: 0xffe6a8 },
  secondary: { face: C.space400, edge: 0x1a2150, text: C.ink, border: C.violetLight },
  ghost: { face: C.space700, edge: 0x0a0f28, text: C.inkSoft, border: C.space500 },
  success: { face: C.green, edge: C.greenDark, text: 0x06301f, border: 0xa9f5d4 },
  danger: { face: C.red, edge: 0x8f2229, text: C.white, border: 0xffb3b7 },
};

/**
 * Botão com profundidade "3D": uma face colorida sobre uma borda escura.
 * Ao pressionar, a face desce até a borda — leitura imediata para crianças,
 * funcionando igualmente com mouse e toque.
 */
export class Button extends Phaser.GameObjects.Container {
  private readonly face: Phaser.GameObjects.Container;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly colors: VariantColors;
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly depthOffset = 6;

  private enabled = true;
  private pressed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly options: ButtonOptions) {
    super(scene, x, y);

    const {
      label,
      icon,
      width = 260,
      height = 66,
      fontSize = 24,
      variant = 'primary',
    } = options;

    this.buttonWidth = width;
    this.buttonHeight = height;
    this.colors = VARIANTS[variant];

    // Borda inferior (parte fixa, dá o efeito de relevo)
    const edge = scene.add.graphics();
    edge.fillStyle(this.colors.edge, 1);
    edge.fillRoundedRect(-width / 2, -height / 2 + this.depthOffset, width, height, 18);
    this.add(edge);

    this.face = scene.add.container(0, 0);
    this.graphics = scene.add.graphics();
    this.face.add(this.graphics);

    this.labelText = scene.add
      .text(0, 0, icon ? `${icon}  ${label}` : label, {
        fontFamily: FONT_TITLE,
        fontSize: `${fontSize}px`,
        color: hex(this.colors.text),
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5);
    this.face.add(this.labelText);
    this.add(this.face);

    this.paint();

    this.setSize(width, height + this.depthOffset);
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height + this.depthOffset),
      Phaser.Geom.Rectangle.Contains,
    );
    this.input!.cursor = 'pointer';

    this.on(Phaser.Input.Events.POINTER_OVER, this.handleOver, this);
    this.on(Phaser.Input.Events.POINTER_OUT, this.handleOut, this);
    this.on(Phaser.Input.Events.POINTER_DOWN, this.handleDown, this);
    this.on(Phaser.Input.Events.POINTER_UP, this.handleUp, this);

    scene.add.existing(this);
  }

  private paint(highlight = false): void {
    const { buttonWidth: width, buttonHeight: height } = this;
    const face = highlight
      ? Phaser.Display.Color.IntegerToColor(this.colors.face).brighten(12).color
      : this.colors.face;

    this.graphics.clear();
    this.graphics.fillStyle(face, 1);
    this.graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
    this.graphics.fillStyle(C.white, 0.18);
    this.graphics.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height * 0.42, {
      tl: 14,
      tr: 14,
      bl: 6,
      br: 6,
    });
    this.graphics.lineStyle(2.5, this.colors.border, 0.85);
    this.graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);
  }

  private handleOver(): void {
    if (!this.enabled) return;
    this.paint(true);
    audio.play('hover');
    this.scene.tweens.add({ targets: this, scale: 1.04, duration: 120, ease: 'Sine.easeOut' });
  }

  private handleOut(): void {
    if (!this.enabled) return;
    this.paint(false);
    this.releaseFace();
    this.scene.tweens.add({ targets: this, scale: 1, duration: 120, ease: 'Sine.easeOut' });
  }

  private handleDown(): void {
    if (!this.enabled) return;
    this.pressed = true;
    this.face.y = this.depthOffset;
    audio.unlock();
  }

  private handleUp(): void {
    if (!this.enabled || !this.pressed) return;
    this.releaseFace();
    audio.play('click');
    this.options.onClick();
  }

  private releaseFace(): void {
    this.pressed = false;
    this.face.y = 0;
  }

  setLabel(label: string): this {
    this.labelText.setText(this.options.icon ? `${this.options.icon}  ${label}` : label);
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.45);
    if (enabled) this.setInteractive();
    else this.disableInteractive();
    return this;
  }
}
