import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, POINTS, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { SORT_CARDS, SORT_CONCLUSION, SORT_ZONES } from '@/data/eletivas';
import { LAB_DOOR_LABEL } from '@/data/laboratorio';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import type { SortCard } from '@/types';
import { burst, popIn, shake, shockwave } from '@/utils/anim';
import { paintPanel } from '@/ui/Panel';
import type { BackdropOptions } from '@/utils/backdrop';
import { BaseLevelScene } from './BaseLevelScene';

interface PortalZone {
  id: 'tradicional' | 'eletiva';
  x: number;
  y: number;
  color: number;
  rect: Phaser.Geom.Rectangle;
  chips: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Image;
}

const CARD_WIDTH = 250;
const CARD_HEIGHT = 132;
const CARD_HOME_X = CX;
const CARD_HOME_Y = 556;

/**
 * FASE 3 — APRENDER DE FORMAS DIFERENTES
 *
 * As duas colunas propostas no material ("Em muitas aulas..." / "Nas eletivas...")
 * viram dois portais. O jogador arrasta cada carta para o portal correspondente
 * e descobre que as duas formas de aprender são importantes.
 */
export class Level3Scene extends BaseLevelScene {
  private portals: PortalZone[] = [];
  private deck: SortCard[] = [];
  private sorted = 0;
  private counterLabel!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.LEVEL_3);
  }

  protected get chapterNumber(): number {
    return 3;
  }

  protected backdropOptions(): BackdropOptions {
    return { stars: 110, nebulaColors: [C.magenta, C.cyan, C.violet] };
  }

  protected build(): void {
    this.portals = [];
    this.sorted = 0;
    this.deck = Phaser.Utils.Array.Shuffle([...SORT_CARDS]);

    this.buildPortals();
    this.buildCounter();
    this.registerDragHandlers();

    this.setProgress(0, SORT_CARDS.length);
    this.time.delayedCall(300, () => this.drawNextCard());
  }

  // -------------------------------------------------------------- portais ---

  private buildPortals(): void {
    const definitions = [
      { zone: SORT_ZONES.tradicional, x: 290, color: C.violetLight, icon: '📚' },
      { zone: SORT_ZONES.eletiva, x: 990, color: C.cyan, icon: '🧪' },
    ];

    definitions.forEach((definition) => {
      const y = 330;
      const container = this.add.container(definition.x, y).setDepth(5);

      const frame = this.add.graphics();
      paintPanel(frame, {
        width: 330,
        height: 300,
        radius: 28,
        fill: C.space800,
        fillAlpha: 0.9,
        border: definition.color,
        borderWidth: 3,
      });
      container.add(frame);

      const glow = this.add
        .image(0, 20, GEN.GLOW)
        .setDisplaySize(260, 260)
        .setTint(definition.color)
        .setAlpha(0.28)
        .setBlendMode(Phaser.BlendModes.ADD);
      container.add(glow);

      const ring = this.add
        .image(0, 20, GEN.RING)
        .setDisplaySize(190, 190)
        .setTint(definition.color)
        .setAlpha(0.75)
        .setBlendMode(Phaser.BlendModes.ADD);
      container.add(ring);
      this.tweens.add({ targets: ring, angle: 360, duration: 12000, repeat: -1 });
      this.tweens.add({
        targets: ring,
        scale: ring.scale * 1.12,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      container.add(this.add.text(0, 18, definition.icon, { fontSize: '54px' }).setOrigin(0.5));
      container.add(
        this.add
          .text(0, -118, definition.zone.title, {
            ...titleStyle(23, definition.color),
            align: 'center',
            wordWrap: { width: 290 },
          })
          .setOrigin(0.5),
      );
      container.add(
        this.add.text(0, -86, definition.zone.subtitle, bodyStyle(15, C.inkMuted)).setOrigin(0.5),
      );

      const chips = this.add.container(definition.x, 520).setDepth(6);

      this.portals.push({
        id: definition.zone.id,
        x: definition.x,
        y,
        color: definition.color,
        rect: new Phaser.Geom.Rectangle(definition.x - 175, y - 160, 350, 320),
        chips,
        ring,
      });
    });
  }

  private buildCounter(): void {
    this.counterLabel = this.add.text(CX, 132, '', titleStyle(22, C.amber)).setOrigin(0.5, 0).setDepth(20);
    this.updateCounter();

    this.add
      .text(CX, GAME_HEIGHT - 24, 'Arraste a carta até o portal correspondente', bodyStyle(15, C.inkMuted))
      .setOrigin(0.5)
      .setDepth(20);
  }

  private updateCounter(): void {
    this.counterLabel.setText(`CARTAS CLASSIFICADAS · ${this.sorted}/${SORT_CARDS.length}`);
  }

  // ---------------------------------------------------------------- cartas ---

  private drawNextCard(): void {
    const data = this.deck.shift();
    if (!data) {
      this.finishSorting();
      return;
    }

    const card = this.add.container(CARD_HOME_X, CARD_HOME_Y).setDepth(30);

    const background = this.add.graphics();
    paintPanel(background, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      radius: 22,
      fill: C.space600,
      border: C.amber,
      borderWidth: 3,
    });
    card.add(background);
    card.add(this.add.text(0, -32, data.icon, { fontSize: '38px' }).setOrigin(0.5));
    card.add(
      this.add
        .text(0, 26, data.label, {
          ...titleStyle(22, C.ink),
          align: 'center',
          wordWrap: { width: CARD_WIDTH - 28 },
        })
        .setOrigin(0.5),
    );

    card.setSize(CARD_WIDTH, CARD_HEIGHT);
    card.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT),
      Phaser.Geom.Rectangle.Contains,
    );
    card.input!.cursor = 'grab';
    card.setData('card', data);

    this.input.setDraggable(card);
    popIn(this, card);
    audio.play('whoosh', 0.4);
  }

  private registerDragHandlers(): void {
    this.input.on(
      Phaser.Input.Events.DRAG,
      (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
        if (this.locked) return;
        const card = object as Phaser.GameObjects.Container;
        card.setPosition(dragX, dragY);
        card.setAngle(Phaser.Math.Clamp((dragX - CARD_HOME_X) * 0.02, -10, 10));
        this.highlightPortals(dragX, dragY);
      },
    );

    this.input.on(
      Phaser.Input.Events.DRAG_END,
      (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject) => {
        if (this.locked) return;
        this.dropCard(object as Phaser.GameObjects.Container);
      },
    );
  }

  /** Destaca o portal sob a carta enquanto ela é arrastada. */
  private highlightPortals(x: number, y: number): void {
    this.portals.forEach((portal) => {
      const inside = Phaser.Geom.Rectangle.Contains(portal.rect, x, y);
      portal.ring.setAlpha(inside ? 1 : 0.75);
      portal.ring.setTint(inside ? C.amber : portal.color);
    });
  }

  private dropCard(card: Phaser.GameObjects.Container): void {
    const data = card.getData('card') as SortCard;
    const target = this.portals.find((portal) => Phaser.Geom.Rectangle.Contains(portal.rect, card.x, card.y));

    this.portals.forEach((portal) => {
      portal.ring.setAlpha(0.75).setTint(portal.color);
    });

    if (!target) {
      this.returnCard(card);
      return;
    }

    if (target.id !== data.zone) {
      audio.play('wrong');
      shake(this, card);
      this.returnCard(card);
      this.damage(`${data.label}… será que combina mais com o outro portal?`);
      return;
    }

    this.acceptCard(card, data, target);
  }

  private returnCard(card: Phaser.GameObjects.Container): void {
    this.tweens.add({
      targets: card,
      x: CARD_HOME_X,
      y: CARD_HOME_Y,
      angle: 0,
      duration: 320,
      ease: 'Back.easeOut',
    });
  }

  private acceptCard(card: Phaser.GameObjects.Container, data: SortCard, portal: PortalZone): void {
    card.disableInteractive();
    this.sorted += 1;

    audio.play('correct');
    shockwave(this, portal.x, portal.y + 20, portal.color);
    burst(this, card.x, card.y, portal.color, 18);
    this.award(POINTS.DISCOVERY, card.x, card.y - 40, portal.color);
    gameState.toast(data.insight, '💡');

    this.updateCounter();
    this.setProgress(this.sorted, SORT_CARDS.length);

    this.tweens.add({
      targets: card,
      x: portal.x,
      y: portal.y + 20,
      scale: 0.1,
      angle: 180,
      alpha: 0.2,
      duration: 420,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        card.destroy();
        this.addChip(portal, data);
        this.drawNextCard();
      },
    });
  }

  /** Fichas acumuladas embaixo de cada portal. */
  private addChip(portal: PortalZone, data: SortCard): void {
    const index = portal.chips.length;
    const column = index % 5;
    const row = Math.floor(index / 5);
    const chip = this.add.container(-124 + column * 62, row * 62);

    const background = this.add.graphics();
    background.fillStyle(portal.color, 0.24);
    background.fillRoundedRect(-26, -26, 52, 52, 14);
    background.lineStyle(2, portal.color, 0.8);
    background.strokeRoundedRect(-26, -26, 52, 52, 14);
    chip.add(background);
    chip.add(this.add.text(0, 0, data.icon, { fontSize: '24px' }).setOrigin(0.5));

    portal.chips.add(chip);
    popIn(this, chip);
  }

  // ---------------------------------------------------------- encerramento ---

  /** Todas as cartas classificadas: abre-se a porta do Clube de Letramento. */
  private finishSorting(): void {
    this.locked = true;

    this.openModal({
      eyebrow: 'Descoberta',
      icon: '⚖️',
      title: 'As duas formas importam',
      body: SORT_CONCLUSION,
      accent: C.amber,
      action: 'ABRIR A PRÓXIMA PORTA',
      onAction: () => this.revealDoor(),
    });
  }

  private revealDoor(): void {
    this.locked = true;

    const dim = this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.space900, 0).setDepth(500);
    this.tweens.add({ targets: dim, fillAlpha: 0.82, duration: 400 });

    const door = this.add.image(CX, CY + 30, TEX.DOOR).setScale(0.1).setDepth(510);
    popIn(this, door, 200, 0.95);

    const glow = this.add
      .image(CX, CY + 30, GEN.GLOW)
      .setDisplaySize(60, 60)
      .setTint(C.cyanLight)
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(509);

    this.time.delayedCall(700, () => {
      audio.play('unlock');
      this.tweens.add({
        targets: glow,
        displayWidth: 620,
        displayHeight: 620,
        alpha: 0.65,
        duration: 900,
        ease: 'Cubic.easeOut',
      });

      const label = this.add
        .text(CX, CY - 190, LAB_DOOR_LABEL, { ...titleStyle(30, C.cyanLight), align: 'center' })
        .setOrigin(0.5)
        .setDepth(520);
      popIn(this, label);
      burst(this, CX, CY - 190, C.cyan, 22);
    });

    this.time.delayedCall(2100, () =>
      this.completeLevel({
        bonus: 20,
        title: 'Portais dominados!',
        body: 'Uma nova porta se abre: CLUBE DE LETRAMENTO CIENTÍFICO. Os grandes cientistas não aprendem apenas conteúdos — eles aprendem a observar, questionar e investigar.',
      }),
    );
  }
}
