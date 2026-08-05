import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, POINTS, SCENES } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ACH } from '@/data/achievements';
import { NEXT_MISSION_QUESTION, ROCKET_MODULES, WHY_SPACE } from '@/data/missao';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import { Button } from '@/ui/Button';
import { paintPanel } from '@/ui/Panel';
import type { RocketModule } from '@/types';
import { burst, popIn, shake, shockwave } from '@/utils/anim';
import type { BackdropOptions } from '@/utils/backdrop';
import { BaseLevelScene } from './BaseLevelScene';

const ROCKET_X = 400;
const SLOT_WIDTH = 186;
const SLOT_HEIGHT = 52;
const SLOT_GAP = 8;
const SLOT_BOTTOM_Y = 582;

const CARD_X = 930;
const CARD_WIDTH = 330;
const CARD_HEIGHT = 66;

/**
 * FASE 6 — BRIEFING DA MISSÃO
 *
 * O percurso da eletiva vira o foguete: cada módulo é uma etapa da jornada,
 * montada de baixo para cima na ordem em que a missão acontece. Com o foguete
 * pronto, a tripulação faz o lançamento.
 */
export class Level6Scene extends BaseLevelScene {
  private slots: { x: number; y: number; graphics: Phaser.GameObjects.Graphics }[] = [];
  private cards: Phaser.GameObjects.Container[] = [];
  private rocketLayer!: Phaser.GameObjects.Container;
  private placed = 0;
  private dropArea!: Phaser.Geom.Rectangle;
  private launchButton?: Button;
  private factTimer?: Phaser.Time.TimerEvent;
  private factIndex = 0;

  constructor() {
    super(SCENES.LEVEL_6);
  }

  protected get chapterNumber(): number {
    return 6;
  }

  protected backdropOptions(): BackdropOptions {
    return { top: C.space700, stars: 140, nebulaColors: [C.violet, C.magenta, C.cyan] };
  }

  protected build(): void {
    this.slots = [];
    this.cards = [];
    this.placed = 0;
    this.dropArea = new Phaser.Geom.Rectangle(ROCKET_X - 150, 220, 300, 420);

    this.buildHeader();
    this.buildRocket();
    this.buildModuleCards();
    this.registerDragHandlers();

    this.setProgress(0, ROCKET_MODULES.length);

    this.factTimer = this.time.addEvent({
      delay: 11000,
      loop: true,
      callback: () => {
        gameState.toast(WHY_SPACE[this.factIndex % WHY_SPACE.length], '🛰️');
        this.factIndex += 1;
      },
    });
  }

  // ------------------------------------------------------------- interface ---

  private buildHeader(): void {
    this.add.text(CX, 126, 'CENTRO DE COMANDO', titleStyle(28, C.amber)).setOrigin(0.5, 0);
    this.add
      .text(CX, 162, 'Monte o foguete da missão: cada módulo é uma etapa do nosso semestre', bodyStyle(16, C.inkSoft))
      .setOrigin(0.5, 0);
    this.add
      .text(CX, GAME_HEIGHT - 24, 'Arraste os módulos até o foguete, de baixo para cima', bodyStyle(15, C.inkMuted))
      .setOrigin(0.5);
  }

  private buildRocket(): void {
    this.rocketLayer = this.add.container(0, 0);

    const hull = this.add.graphics();
    // Bico
    hull.fillStyle(C.magentaDark, 1);
    hull.fillTriangle(ROCKET_X, 176, ROCKET_X - 108, 268, ROCKET_X + 108, 268);
    hull.fillStyle(C.magenta, 1);
    hull.fillTriangle(ROCKET_X, 186, ROCKET_X - 92, 268, ROCKET_X + 92, 268);
    // Corpo
    hull.fillStyle(C.black, 0.35);
    hull.fillRoundedRect(ROCKET_X - 116, 258, 232, 372, 26);
    hull.fillStyle(C.space600, 1);
    hull.fillRoundedRect(ROCKET_X - 120, 252, 240, 372, 26);
    hull.lineStyle(3, C.violetLight, 0.8);
    hull.strokeRoundedRect(ROCKET_X - 120, 252, 240, 372, 26);
    // Aletas
    hull.fillStyle(C.magentaDark, 1);
    hull.fillTriangle(ROCKET_X - 120, 540, ROCKET_X - 190, 640, ROCKET_X - 120, 624);
    hull.fillTriangle(ROCKET_X + 120, 540, ROCKET_X + 190, 640, ROCKET_X + 120, 624);
    // Base
    hull.fillStyle(C.space500, 1);
    hull.fillRoundedRect(ROCKET_X - 96, 620, 192, 26, 12);
    this.rocketLayer.add(hull);

    // Encaixes vazios (de baixo para cima)
    ROCKET_MODULES.forEach((_module, index) => {
      const y = SLOT_BOTTOM_Y - index * (SLOT_HEIGHT + SLOT_GAP);
      const graphics = this.add.graphics();
      this.rocketLayer.add(graphics);
      this.slots.push({ x: ROCKET_X, y, graphics });
    });

    this.paintSlots();
  }

  /** Redesenha os encaixes destacando o próximo da sequência. */
  private paintSlots(): void {
    this.slots.forEach((slot, index) => {
      const isNext = index === this.placed;
      const isFilled = index < this.placed;
      slot.graphics.clear();
      if (isFilled) return;

      slot.graphics.fillStyle(C.space800, 0.7);
      slot.graphics.fillRoundedRect(slot.x - SLOT_WIDTH / 2, slot.y - SLOT_HEIGHT / 2, SLOT_WIDTH, SLOT_HEIGHT, 14);
      slot.graphics.lineStyle(isNext ? 3.5 : 2, isNext ? C.amber : C.space400, isNext ? 1 : 0.6);
      slot.graphics.strokeRoundedRect(
        slot.x - SLOT_WIDTH / 2,
        slot.y - SLOT_HEIGHT / 2,
        SLOT_WIDTH,
        SLOT_HEIGHT,
        14,
      );

      if (isNext) {
        slot.graphics.fillStyle(C.amber, 0.12);
        slot.graphics.fillRoundedRect(
          slot.x - SLOT_WIDTH / 2,
          slot.y - SLOT_HEIGHT / 2,
          SLOT_WIDTH,
          SLOT_HEIGHT,
          14,
        );
      }
    });
  }

  private buildModuleCards(): void {
    const shuffled = Phaser.Utils.Array.Shuffle([...ROCKET_MODULES]);

    shuffled.forEach((module, index) => {
      const y = 210 + index * (CARD_HEIGHT + 14);
      const card = this.add.container(CARD_X, y).setDepth(30);

      const background = this.add.graphics();
      paintPanel(background, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        radius: 18,
        fill: C.space600,
        border: module.color,
        borderWidth: 2.5,
      });
      card.add(background);
      card.add(this.add.text(-CARD_WIDTH / 2 + 34, 0, module.icon, { fontSize: '28px' }).setOrigin(0.5));
      card.add(
        this.add.text(-CARD_WIDTH / 2 + 62, -16, module.label, titleStyle(20, C.ink)).setOrigin(0, 0.5),
      );
      card.add(
        this.add
          .text(-CARD_WIDTH / 2 + 62, 11, module.detail, {
            ...bodyStyle(12, C.inkMuted),
            wordWrap: { width: CARD_WIDTH - 80 },
          })
          .setOrigin(0, 0.5),
      );

      card.setSize(CARD_WIDTH, CARD_HEIGHT);
      card.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT),
        Phaser.Geom.Rectangle.Contains,
      );
      card.input!.cursor = 'grab';
      card.setData('module', module);
      card.setData('homeX', CARD_X);
      card.setData('homeY', y);

      this.input.setDraggable(card);
      this.cards.push(card);
      popIn(this, card, index * 80);
    });
  }

  private registerDragHandlers(): void {
    this.input.on(
      Phaser.Input.Events.DRAG,
      (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
        if (this.locked) return;
        const card = object as Phaser.GameObjects.Container;
        card.setPosition(dragX, dragY);
        card.setDepth(60);
      },
    );

    this.input.on(
      Phaser.Input.Events.DRAG_END,
      (_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject) => {
        if (this.locked) return;
        this.dropModule(object as Phaser.GameObjects.Container);
      },
    );
  }

  // -------------------------------------------------------------- montagem ---

  private dropModule(card: Phaser.GameObjects.Container): void {
    const module = card.getData('module') as RocketModule;
    const insideRocket = Phaser.Geom.Rectangle.Contains(this.dropArea, card.x, card.y);

    if (!insideRocket) {
      this.returnCard(card);
      return;
    }

    const expected = ROCKET_MODULES[this.placed];
    if (module.id !== expected.id) {
      const position = ROCKET_MODULES.findIndex((item) => item.id === module.id) + 1;
      shake(this, card);
      this.returnCard(card);
      this.damage(`${module.label} é a etapa ${position}. Agora precisamos da etapa ${this.placed + 1}: ${expected.label}.`);
      return;
    }

    this.attachModule(card, module);
  }

  private returnCard(card: Phaser.GameObjects.Container): void {
    this.tweens.add({
      targets: card,
      x: card.getData('homeX') as number,
      y: card.getData('homeY') as number,
      duration: 320,
      ease: 'Back.easeOut',
      onComplete: () => card.setDepth(30),
    });
  }

  private attachModule(card: Phaser.GameObjects.Container, module: RocketModule): void {
    const slot = this.slots[this.placed];
    card.disableInteractive();
    this.input.setDraggable(card, false);
    this.placed += 1;

    audio.play('correct');
    this.award(POINTS.PRINCIPLE, card.x, card.y - 40, module.color);
    gameState.toast(module.detail, module.icon);
    this.setProgress(this.placed, ROCKET_MODULES.length);

    this.tweens.add({
      targets: card,
      x: slot.x,
      y: slot.y,
      duration: 420,
      ease: 'Back.easeOut',
      onComplete: () => {
        card.setDepth(20);
        this.morphCardIntoModule(card, module);
        shockwave(this, slot.x, slot.y, module.color);
        burst(this, slot.x, slot.y, module.color, 16);
        this.paintSlots();

        if (this.placed >= ROCKET_MODULES.length) this.readyToLaunch();
      },
    });
  }

  /** A carta encolhe e vira uma peça do foguete. */
  private morphCardIntoModule(card: Phaser.GameObjects.Container, module: RocketModule): void {
    card.removeAll(true);

    const background = this.add.graphics();
    background.fillStyle(module.color, 0.9);
    background.fillRoundedRect(-SLOT_WIDTH / 2, -SLOT_HEIGHT / 2, SLOT_WIDTH, SLOT_HEIGHT, 14);
    background.fillStyle(C.white, 0.2);
    background.fillRoundedRect(-SLOT_WIDTH / 2 + 4, -SLOT_HEIGHT / 2 + 4, SLOT_WIDTH - 8, 16, 8);
    background.lineStyle(2.5, C.white, 0.65);
    background.strokeRoundedRect(-SLOT_WIDTH / 2, -SLOT_HEIGHT / 2, SLOT_WIDTH, SLOT_HEIGHT, 14);
    card.add(background);

    card.add(this.add.text(-SLOT_WIDTH / 2 + 26, 0, module.icon, { fontSize: '22px' }).setOrigin(0.5));
    card.add(
      this.add.text(-SLOT_WIDTH / 2 + 46, 0, module.label, titleStyle(17, 0x10142c)).setOrigin(0, 0.5),
    );

    this.rocketLayer.add(card);
  }

  // ------------------------------------------------------------ lançamento ---

  private readyToLaunch(): void {
    Achievements.unlock(ACH.ROCKET_ENGINEER);
    this.factTimer?.remove();
    gameState.setObjective('Foguete montado! Faça a contagem regressiva');

    this.launchButton = new Button(this, CARD_X, 420, {
      label: 'LANÇAR!',
      icon: '🚀',
      width: 300,
      height: 76,
      fontSize: 30,
      variant: 'primary',
      onClick: () => this.launch(),
    });
    popIn(this, this.launchButton);

    this.add
      .text(CARD_X, 320, 'Tripulação pronta.\nTodos os sistemas verificados.', {
        ...bodyStyle(18, C.green),
        align: 'center',
      })
      .setOrigin(0.5);
  }

  private launch(): void {
    this.locked = true;
    this.launchButton?.setEnabled(false);
    this.launchButton?.setVisible(false);

    const countdown = this.add
      .text(CARD_X, 400, '', titleStyle(120, C.amber))
      .setOrigin(0.5)
      .setDepth(600);

    const steps = ['3', '2', '1', 'JÁ!'];
    steps.forEach((step, index) => {
      this.time.delayedCall(index * 800, () => {
        countdown.setText(step);
        countdown.setScale(1.8);
        countdown.setAlpha(1);
        audio.play(step === 'JÁ!' ? 'unlock' : 'click');
        this.tweens.add({ targets: countdown, scale: 1, duration: 380, ease: 'Back.easeOut' });
        if (index < steps.length - 1) {
          this.tweens.add({ targets: countdown, alpha: 0, duration: 260, delay: 500 });
        }
      });
    });

    this.time.delayedCall(steps.length * 800, () => this.liftOff(countdown));
  }

  private liftOff(countdown: Phaser.GameObjects.Text): void {
    countdown.destroy();
    audio.play('launch');
    this.cameras.main.shake(2200, 0.008);

    const flames = this.add.particles(ROCKET_X, 650, GEN.GLOW, {
      speed: { min: 120, max: 320 },
      angle: { min: 70, max: 110 },
      scale: { start: 0.75, end: 0 },
      alpha: { start: 0.95, end: 0 },
      lifespan: 700,
      quantity: 5,
      frequency: 18,
      blendMode: Phaser.BlendModes.ADD,
      tint: [C.amber, C.orange, C.magenta, C.white],
    });
    flames.setDepth(15);
    this.rocketLayer.add(flames);

    const smoke = this.add.particles(ROCKET_X, 660, GEN.DUST, {
      speed: { min: 60, max: 220 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.6, end: 4 },
      alpha: { start: 0.35, end: 0 },
      lifespan: 1400,
      quantity: 3,
      frequency: 30,
      tint: C.inkSoft,
    });
    smoke.setDepth(14);

    this.tweens.add({
      targets: this.rocketLayer,
      y: -1000,
      duration: 2600,
      delay: 500,
      ease: 'Cubic.easeIn',
    });

    // Riscos de velocidade
    this.time.addEvent({
      delay: 60,
      repeat: 28,
      callback: () => {
        const streak = this.add
          .rectangle(
            Phaser.Math.Between(0, GAME_WIDTH),
            Phaser.Math.Between(-50, GAME_HEIGHT),
            3,
            Phaser.Math.Between(60, 180),
            C.cyanLight,
            0.7,
          )
          .setDepth(5);
        this.tweens.add({
          targets: streak,
          y: streak.y + 700,
          alpha: 0,
          duration: 700,
          onComplete: () => streak.destroy(),
        });
      },
    });

    this.time.delayedCall(2400, () => {
      const flash = this.add
        .rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.white, 0)
        .setDepth(700);
      this.tweens.add({ targets: flash, fillAlpha: 0.9, duration: 240, yoyo: true });

      smoke.stop();
      flames.stop();

      const question = this.add
        .text(CX, CY, NEXT_MISSION_QUESTION, { ...titleStyle(42, C.ink), align: 'center' })
        .setOrigin(0.5)
        .setDepth(710)
        .setAlpha(0);
      this.tweens.add({ targets: question, alpha: 1, duration: 700, delay: 300 });
    });

    this.time.delayedCall(4400, () =>
      this.completeLevel({
        bonus: 40,
        title: 'Lançamento realizado!',
        body: 'Essa será a nossa primeira investigação. Tripulação autorizada — nos vemos na plataforma de lançamento!',
      }),
    );
  }
}
