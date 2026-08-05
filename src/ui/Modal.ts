import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH } from '@/config/constants';
import { C, FONT_BODY, TIMING, bodyStyle, hex, titleStyle } from '@/config/theme';
import { audio } from '@/services/AudioService';
import { Button } from './Button';
import { paintPanel } from './Panel';

export interface ModalChoice {
  label: string;
  /** Quando presente, a alternativa é ilustrada. */
  texture?: string;
  onSelect?: () => void;
}

export interface ModalOptions {
  /** Linha pequena acima do título (ex.: "ARQUIVO CONFIDENCIAL"). */
  eyebrow?: string;
  title?: string;
  body?: string;
  /** Emoji grande exibido acima do título. */
  icon?: string;
  /** Ilustração SVG exibida acima do título. */
  texture?: string;
  textureScale?: number;
  accent?: number;
  width?: number;
  choices?: ModalChoice[];
  /** Botão principal (fecha o modal ao ser tocado). */
  action?: string;
  onAction?: () => void;
  onClose?: () => void;
  /** Permite fechar tocando fora do painel. */
  dismissible?: boolean;
}

type Positionable = Phaser.GameObjects.GameObject & { y: number };

/**
 * Janela modal do jogo: usada para cartas do Arquivo, descobertas da Sala de
 * Ciências, princípios capturados e mensagens de fim de fase.
 *
 * O conteúdo é medido antes de o painel ser pintado, então a altura sempre
 * acompanha o texto — e o conjunto é reduzido se ultrapassar a altura da tela.
 */
export class Modal extends Phaser.GameObjects.Container {
  private readonly box: Phaser.GameObjects.Container;
  private readonly dim: Phaser.GameObjects.Rectangle;
  private closing = false;

  static open(scene: Phaser.Scene, options: ModalOptions): Modal {
    return new Modal(scene, options);
  }

  private constructor(scene: Phaser.Scene, private readonly options: ModalOptions) {
    super(scene, CX, CY);
    scene.add.existing(this);
    this.setDepth(1000);

    const accent = options.accent ?? C.violetLight;
    const width = options.width ?? 700;
    const pad = 36;
    const innerWidth = width - pad * 2;

    // Fundo escurecido: também bloqueia cliques na cena por baixo.
    this.dim = scene.add
      .rectangle(0, 0, GAME_WIDTH * 1.2, GAME_HEIGHT * 1.2, C.space900, 0.74)
      .setInteractive({ useHandCursor: false });
    this.dim.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (options.dismissible) this.close();
    });
    this.add(this.dim);

    this.box = scene.add.container(0, 0);
    this.add(this.box);

    const panel = scene.add.graphics();
    this.box.add(panel);

    // ---------------------------------------------------------- conteúdo ---
    const items: Positionable[] = [];
    let cursorY = 0;

    if (options.eyebrow) {
      const eyebrow = scene.add
        .text(0, cursorY, options.eyebrow.toUpperCase().split('').join(' '), {
          fontFamily: FONT_BODY,
          fontSize: '14px',
          color: hex(accent),
          fontStyle: 'bold',
        })
        .setOrigin(0.5, 0);
      this.box.add(eyebrow);
      items.push(eyebrow);
      cursorY += eyebrow.height + 10;
    }

    if (options.texture) {
      const image = scene.add
        .image(0, cursorY, options.texture)
        .setOrigin(0.5, 0)
        .setScale(options.textureScale ?? 0.45);
      this.box.add(image);
      items.push(image);
      cursorY += image.displayHeight + 14;
    } else if (options.icon) {
      const icon = scene.add.text(0, cursorY, options.icon, { fontSize: '58px' }).setOrigin(0.5, 0);
      this.box.add(icon);
      items.push(icon);
      cursorY += icon.height + 8;
    }

    if (options.title) {
      const title = scene.add
        .text(0, cursorY, options.title, {
          ...titleStyle(32, C.ink),
          align: 'center',
          wordWrap: { width: innerWidth },
        })
        .setOrigin(0.5, 0);
      this.box.add(title);
      items.push(title);
      cursorY += title.height + 14;
    }

    if (options.body) {
      const body = scene.add
        .text(0, cursorY, options.body, {
          ...bodyStyle(20, C.inkSoft),
          align: 'center',
          wordWrap: { width: innerWidth },
        })
        .setOrigin(0.5, 0);
      this.box.add(body);
      items.push(body);
      cursorY += body.height + 22;
    }

    if (options.choices?.length) {
      const illustrated = options.choices.some((choice) => choice.texture);
      cursorY = illustrated
        ? this.buildIllustratedChoices(scene, options.choices, cursorY, innerWidth, items, accent)
        : this.buildTextChoices(scene, options.choices, cursorY, innerWidth, items);
    }

    if (options.action) {
      const button = new Button(scene, 0, cursorY + 33, {
        label: options.action,
        width: Math.min(innerWidth, 320),
        height: 62,
        fontSize: 23,
        variant: 'primary',
        onClick: () => this.close(options.onAction),
      });
      this.box.add(button);
      items.push(button);
      cursorY += 72;
    }

    // ------------------------------------------------ centraliza e pinta ---
    const contentHeight = cursorY;
    const offset = -contentHeight / 2;
    items.forEach((item) => {
      item.y += offset;
    });

    paintPanel(panel, {
      width,
      height: contentHeight + pad * 2,
      radius: 28,
      fill: C.space700,
      border: accent,
      borderWidth: 3,
    });

    // Reduz o conjunto se ele não couber na tela (textos longos em telas baixas).
    const maxHeight = GAME_HEIGHT - 60;
    const totalHeight = contentHeight + pad * 2;
    if (totalHeight > maxHeight) this.box.setScale(maxHeight / totalHeight);

    // ------------------------------------------------------------ entrada ---
    this.dim.setAlpha(0);
    this.box.setAlpha(0);
    const targetScale = this.box.scale;
    this.box.setScale(targetScale * 0.75);

    scene.tweens.add({ targets: this.dim, alpha: 1, duration: TIMING.base });
    scene.tweens.add({
      targets: this.box,
      alpha: 1,
      scale: targetScale,
      duration: TIMING.slow,
      ease: 'Back.easeOut',
    });
    audio.play('whoosh', 0.5);
  }

  /** Alternativas em lista vertical (texto). */
  private buildTextChoices(
    scene: Phaser.Scene,
    choices: ModalChoice[],
    startY: number,
    innerWidth: number,
    items: Positionable[],
  ): number {
    let cursorY = startY;
    choices.forEach((choice) => {
      const fontSize = choice.label.length > 46 ? 17 : choice.label.length > 32 ? 19 : 22;
      const button = new Button(scene, 0, cursorY + 29, {
        label: choice.label,
        width: innerWidth,
        height: 58,
        fontSize,
        variant: 'secondary',
        onClick: () => this.close(choice.onSelect),
      });
      this.box.add(button);
      items.push(button);
      cursorY += 70;
    });
    return cursorY;
  }

  /** Alternativas ilustradas, dispostas em linha. */
  private buildIllustratedChoices(
    scene: Phaser.Scene,
    choices: ModalChoice[],
    startY: number,
    innerWidth: number,
    items: Positionable[],
    accent: number,
  ): number {
    const cardWidth = Math.min(150, innerWidth / choices.length - 10);
    const cardHeight = 168;
    const gap = 12;
    const totalWidth = choices.length * cardWidth + (choices.length - 1) * gap;

    choices.forEach((choice, index) => {
      const x = -totalWidth / 2 + cardWidth / 2 + index * (cardWidth + gap);
      const card = scene.add.container(x, startY + cardHeight / 2);

      const background = scene.add.graphics();
      paintPanel(background, {
        width: cardWidth,
        height: cardHeight,
        radius: 18,
        fill: C.space600,
        border: C.space400,
        borderWidth: 2,
        shadow: false,
      });
      card.add(background);

      if (choice.texture) {
        const image = scene.add.image(0, -26, choice.texture).setScale(0.42);
        card.add(image);
      }

      const label = scene.add
        .text(0, 46, choice.label, {
          ...bodyStyle(15, C.ink),
          align: 'center',
          wordWrap: { width: cardWidth - 16 },
        })
        .setOrigin(0.5, 0.5);
      card.add(label);

      card.setSize(cardWidth, cardHeight);
      card.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains,
      );
      card.input!.cursor = 'pointer';

      card.on(Phaser.Input.Events.POINTER_OVER, () => {
        paintPanel(background, {
          width: cardWidth,
          height: cardHeight,
          radius: 18,
          fill: C.space500,
          border: accent,
          borderWidth: 3,
          shadow: false,
        });
        scene.tweens.add({ targets: card, scale: 1.05, duration: 120 });
        audio.play('hover');
      });
      card.on(Phaser.Input.Events.POINTER_OUT, () => {
        paintPanel(background, {
          width: cardWidth,
          height: cardHeight,
          radius: 18,
          fill: C.space600,
          border: C.space400,
          borderWidth: 2,
          shadow: false,
        });
        scene.tweens.add({ targets: card, scale: 1, duration: 120 });
      });
      card.on(Phaser.Input.Events.POINTER_UP, () => {
        audio.play('click');
        this.close(choice.onSelect);
      });

      this.box.add(card);
      items.push(card);
    });

    return startY + cardHeight + 8;
  }

  /** Fecha o modal e executa o callback recebido (se houver). */
  close(callback?: () => void): void {
    if (this.closing) return;
    this.closing = true;

    this.scene.tweens.add({
      targets: this.box,
      alpha: 0,
      scale: this.box.scale * 0.85,
      duration: TIMING.base,
      ease: 'Back.easeIn',
    });
    this.scene.tweens.add({
      targets: this.dim,
      alpha: 0,
      duration: TIMING.base,
      onComplete: () => {
        this.scene.tweens.killTweensOf(this.box);
        this.destroy();
        // `onClose` primeiro: libera a fase antes da ação, que pode voltar
        // a bloqueá-la (ex.: iniciar a animação de encerramento).
        this.options.onClose?.();
        callback?.();
      },
    });
  }
}
