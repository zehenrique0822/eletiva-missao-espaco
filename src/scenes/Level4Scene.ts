import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, POINTS, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ACH } from '@/data/achievements';
import { LAB_DOOR_LABEL, LAB_OBJECTS, LETRAMENTO_TEXT, METHOD_STEPS } from '@/data/laboratorio';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import { paintPanel } from '@/ui/Panel';
import type { LabObject, MethodStep } from '@/types';
import { burst, popIn, pulse, shake, shockwave } from '@/utils/anim';
import type { BackdropOptions } from '@/utils/backdrop';
import { BaseLevelScene } from './BaseLevelScene';

/**
 * FASE 4 — APRENDENDO A OLHAR COMO UM CIENTISTA
 *
 * Primeiro o jogador explora a Sala de Ciências: cada objeto guarda uma
 * história que mostra a curiosidade como origem da Ciência. Depois monta,
 * na ordem certa, o caminho do pensamento científico escrito no quadro:
 * observar → perguntar → imaginar → testar → aprender.
 */
export class Level4Scene extends BaseLevelScene {
  private roomLayer!: Phaser.GameObjects.Container;
  private puzzleLayer!: Phaser.GameObjects.Container;
  private discovered = new Set<string>();
  private counterLabel!: Phaser.GameObjects.Text;
  private letramentoLines: Phaser.GameObjects.Text[] = [];
  private methodIndex = 0;
  private methodMistakes = 0;
  private slots: Phaser.GameObjects.Container[] = [];

  constructor() {
    super(SCENES.LEVEL_4);
  }

  protected get chapterNumber(): number {
    return 4;
  }

  protected backdropOptions(): BackdropOptions {
    return { top: C.space600, stars: 90, nebulaColors: [C.green, C.cyan, C.violet] };
  }

  protected build(): void {
    this.discovered = new Set();
    this.letramentoLines = [];
    this.methodIndex = 0;
    this.methodMistakes = 0;
    this.slots = [];

    this.roomLayer = this.add.container(0, 0);
    this.puzzleLayer = this.add.container(0, 0).setVisible(false);

    this.buildRoom();
    this.buildObjects();
    this.buildLetramentoPanel();
    this.buildCounter();

    this.setProgress(0, LAB_OBJECTS.length + METHOD_STEPS.length);
  }

  // ------------------------------------------------------- sala de ciências ---

  private buildRoom(): void {
    const shelves = this.add.graphics();
    // As prateleiras ficam logo abaixo de cada fileira de objetos.
    [366, 562].forEach((y) => {
      shelves.fillStyle(C.black, 0.3);
      shelves.fillRoundedRect(140, y + 6, 830, 20, 10);
      shelves.fillStyle(C.space500, 1);
      shelves.fillRoundedRect(140, y, 830, 20, 10);
      shelves.fillStyle(C.white, 0.12);
      shelves.fillRoundedRect(146, y + 3, 818, 7, 4);
    });
    this.roomLayer.add(shelves);

    const title = this.add.text(555, 168, 'SALA DE CIÊNCIAS', titleStyle(24, C.cyanLight)).setOrigin(0.5);
    this.roomLayer.add(title);

    const hint = this.add
      .text(555, 196, 'Toque em cada objeto para descobrir a pergunta que existe por trás dele', bodyStyle(15, C.inkMuted))
      .setOrigin(0.5);
    this.roomLayer.add(hint);
  }

  private buildObjects(): void {
    LAB_OBJECTS.forEach((data, index) => {
      const container = this.add.container(data.x, data.y);

      const glow = this.add
        .image(0, 0, GEN.GLOW)
        .setDisplaySize(180, 180)
        .setTint(C.amber)
        .setAlpha(0.32)
        .setBlendMode(Phaser.BlendModes.ADD);
      container.add(glow);

      const sprite = this.add.image(0, 0, data.texture).setScale(data.scale);
      container.add(sprite);

      const check = this.add
        .text(46, -46, '✓', titleStyle(28, C.green))
        .setOrigin(0.5)
        .setVisible(false);
      container.add(check);

      // A etiqueta fica sobre a borda da prateleira, como em um museu.
      const label = this.add
        .text(0, 88, data.name, bodyStyle(15, C.ink, { fontStyle: 'bold' }))
        .setOrigin(0.5);
      container.add(label);

      const hitWidth = 150;
      const hitHeight = 200;
      container.setSize(hitWidth, hitHeight);
      container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, hitWidth, hitHeight),
        Phaser.Geom.Rectangle.Contains,
      );
      container.input!.cursor = 'pointer';

      const idle = pulse(this, sprite, 1.08, 1100 + index * 90);

      container.on(Phaser.Input.Events.POINTER_OVER, () => {
        if (this.discovered.has(data.id)) return;
        glow.setAlpha(0.6);
        audio.play('hover');
      });
      container.on(Phaser.Input.Events.POINTER_OUT, () => {
        glow.setAlpha(this.discovered.has(data.id) ? 0.14 : 0.32);
      });
      container.on(Phaser.Input.Events.POINTER_UP, () => {
        this.investigate(data, container, glow, check, idle);
      });

      this.roomLayer.add(container);
      popIn(this, container, index * 90);
    });
  }

  private buildLetramentoPanel(): void {
    const panel = this.add.graphics({ x: 1105, y: 400 });
    paintPanel(panel, {
      width: 300,
      height: 420,
      radius: 26,
      fill: C.space800,
      fillAlpha: 0.92,
      border: C.cyan,
      borderWidth: 2.5,
    });
    this.roomLayer.add(panel);

    const title = this.add
      .text(1105, 226, 'LETRAMENTO\nCIENTÍFICO', { ...titleStyle(21, C.cyan), align: 'center' })
      .setOrigin(0.5, 0);
    this.roomLayer.add(title);

    let y = 300;
    LETRAMENTO_TEXT.forEach((line) => {
      const text = this.add
        .text(1105, y, line, { ...bodyStyle(15, C.inkSoft), align: 'center', wordWrap: { width: 250 } })
        .setOrigin(0.5, 0)
        .setAlpha(0.12);
      this.roomLayer.add(text);
      this.letramentoLines.push(text);
      y += text.height + 18;
    });
  }

  private buildCounter(): void {
    // Fica no layer da sala: some junto com ela quando o desafio começa.
    this.counterLabel = this.add.text(CX, 128, '', titleStyle(22, C.amber)).setOrigin(0.5, 0);
    this.roomLayer.add(this.counterLabel);
    this.updateCounter();
  }

  private updateCounter(): void {
    this.counterLabel.setText(`OBJETOS INVESTIGADOS · ${this.discovered.size}/${LAB_OBJECTS.length}`);
  }

  // ------------------------------------------------------------ descoberta ---

  private investigate(
    data: LabObject,
    container: Phaser.GameObjects.Container,
    glow: Phaser.GameObjects.Image,
    check: Phaser.GameObjects.Text,
    idle: Phaser.Tweens.Tween,
  ): void {
    if (this.locked || this.discovered.has(data.id)) return;

    this.discovered.add(data.id);
    idle.remove();
    check.setVisible(true);
    popIn(this, check, 0);
    glow.setAlpha(0.14).setTint(C.green);

    audio.play('collect');
    shockwave(this, container.x, container.y, C.cyanLight);
    burst(this, container.x, container.y, C.cyan, 16);
    this.award(POINTS.DISCOVERY, container.x, container.y - 60, C.cyan);

    this.updateCounter();
    this.setProgress(this.discovered.size, LAB_OBJECTS.length + METHOD_STEPS.length);
    this.revealLetramento();

    this.openModal({
      eyebrow: data.name,
      texture: data.texture,
      textureScale: data.scale * 0.9,
      title: data.question,
      body: data.story,
      accent: C.cyan,
      action: 'ANOTAR NO DIÁRIO',
      onAction: () => {
        if (this.discovered.size >= LAB_OBJECTS.length) this.startMethodChallenge();
      },
    });
  }

  /** Cada par de descobertas revela uma linha da definição de letramento. */
  private revealLetramento(): void {
    const target = Math.ceil((this.discovered.size / LAB_OBJECTS.length) * this.letramentoLines.length);
    this.letramentoLines.forEach((line, index) => {
      if (index < target && line.alpha < 1) {
        this.tweens.add({ targets: line, alpha: 1, duration: 420, ease: 'Cubic.easeOut' });
      }
    });
  }

  // ------------------------------------------------- desafio do método ---

  private startMethodChallenge(): void {
    Achievements.unlock(ACH.ROOM_EXPLORER);
    this.locked = true;

    this.tweens.add({
      targets: this.roomLayer,
      alpha: 0,
      duration: 520,
      onComplete: () => {
        this.roomLayer.setVisible(false);
        this.buildMethodPuzzle();
      },
    });
  }

  private buildMethodPuzzle(): void {
    this.puzzleLayer.setVisible(true).setAlpha(0);
    gameState.setObjective('Monte o caminho do pensamento científico na ordem certa');

    const title = this.add
      .text(CX, 150, 'O CAMINHO DA INVESTIGAÇÃO', titleStyle(32, C.amber))
      .setOrigin(0.5, 0);
    const hint = this.add
      .text(CX, 192, 'Toque nas etapas na ordem em que a Ciência acontece', bodyStyle(17, C.inkSoft))
      .setOrigin(0.5, 0);
    this.puzzleLayer.add([title, hint]);

    // Encaixes vazios
    const slotWidth = 192;
    const gap = 16;
    const totalWidth = METHOD_STEPS.length * slotWidth + (METHOD_STEPS.length - 1) * gap;
    const startX = CX - totalWidth / 2 + slotWidth / 2;

    METHOD_STEPS.forEach((_step, index) => {
      const x = startX + index * (slotWidth + gap);
      const slot = this.add.container(x, 330);

      const frame = this.add.graphics();
      frame.lineStyle(3, C.space400, 0.9);
      frame.strokeRoundedRect(-slotWidth / 2, -66, slotWidth, 132, 20);
      frame.fillStyle(C.space800, 0.55);
      frame.fillRoundedRect(-slotWidth / 2, -66, slotWidth, 132, 20);
      slot.add(frame);
      slot.add(this.add.text(0, 0, `${index + 1}`, titleStyle(40, C.space400)).setOrigin(0.5));

      this.puzzleLayer.add(slot);
      this.slots.push(slot);

      if (index < METHOD_STEPS.length - 1) {
        const arrow = this.add
          .text(x + slotWidth / 2 + gap / 2, 330, '➜', titleStyle(26, C.violetLight))
          .setOrigin(0.5);
        this.puzzleLayer.add(arrow);
      }
    });

    // Cartas embaralhadas
    const shuffled = Phaser.Utils.Array.Shuffle([...METHOD_STEPS]);
    shuffled.forEach((step, index) => {
      const x = startX + index * (slotWidth + gap);
      const card = this.createStepCard(step, x, 540);
      this.puzzleLayer.add(card);
    });

    this.tweens.add({ targets: this.puzzleLayer, alpha: 1, duration: 420 });
    this.time.delayedCall(450, () => {
      this.locked = false;
    });
    this.highlightNextSlot();
  }

  private createStepCard(step: MethodStep, x: number, y: number): Phaser.GameObjects.Container {
    const width = 186;
    const height = 116;
    const card = this.add.container(x, y);

    const background = this.add.graphics();
    paintPanel(background, {
      width,
      height,
      radius: 20,
      fill: C.space600,
      border: C.cyan,
      borderWidth: 2.5,
    });
    card.add(background);
    card.add(this.add.text(0, -26, step.icon, { fontSize: '30px' }).setOrigin(0.5));
    card.add(this.add.text(0, 22, step.label, titleStyle(20, C.ink)).setOrigin(0.5));

    card.setSize(width, height);
    card.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    card.input!.cursor = 'pointer';
    card.setData('step', step);

    card.on(Phaser.Input.Events.POINTER_OVER, () => {
      if (this.locked) return;
      this.tweens.add({ targets: card, scale: 1.06, duration: 120 });
      audio.play('hover');
    });
    card.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.tweens.add({ targets: card, scale: 1, duration: 120 });
    });
    card.on(Phaser.Input.Events.POINTER_UP, () => this.placeStep(card, step));

    popIn(this, card, 200);
    return card;
  }

  /** Marca visualmente o próximo encaixe a ser preenchido. */
  private highlightNextSlot(): void {
    this.slots.forEach((slot, index) => {
      const isNext = index === this.methodIndex;
      slot.setScale(isNext ? 1.04 : 1);
      slot.setAlpha(index < this.methodIndex ? 1 : isNext ? 1 : 0.65);
    });
  }

  private placeStep(card: Phaser.GameObjects.Container, step: MethodStep): void {
    if (this.locked) return;

    const expected = METHOD_STEPS[this.methodIndex];
    if (step.id !== expected.id) {
      this.methodMistakes += 1;
      shake(this, card);
      this.damage(`${step.label} vem depois. ${expected.hint}`);
      return;
    }

    card.disableInteractive();
    const slot = this.slots[this.methodIndex];
    this.methodIndex += 1;

    audio.play('correct');
    this.award(POINTS.DISCOVERY, card.x, card.y - 50, C.green);
    gameState.toast(step.hint, step.icon);
    this.setProgress(LAB_OBJECTS.length + this.methodIndex, LAB_OBJECTS.length + METHOD_STEPS.length);

    this.tweens.add({
      targets: card,
      x: slot.x,
      y: slot.y,
      duration: 380,
      ease: 'Back.easeOut',
      onComplete: () => {
        burst(this, slot.x, slot.y, C.green, 14);
        this.highlightNextSlot();
        if (this.methodIndex >= METHOD_STEPS.length) this.finishMethod();
      },
    });
  }

  private finishMethod(): void {
    this.locked = true;
    if (this.methodMistakes === 0) Achievements.unlock(ACH.METHOD_MASTER);

    this.time.delayedCall(500, () => this.revealDoor());
  }

  // ---------------------------------------------------------- encerramento ---

  private revealDoor(): void {
    const dim = this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.space900, 0).setDepth(500);
    this.tweens.add({ targets: dim, fillAlpha: 0.84, duration: 420 });

    const door = this.add.image(CX, CY + 40, TEX.DOOR).setScale(0.1).setDepth(510);
    popIn(this, door, 180, 0.95);

    this.time.delayedCall(680, () => {
      audio.play('unlock');
      burst(this, CX, CY - 160, C.amber, 24);
      const label = this.add
        .text(CX, CY - 180, LAB_DOOR_LABEL, { ...titleStyle(30, C.amber), align: 'center' })
        .setOrigin(0.5)
        .setDepth(520);
      popIn(this, label);
    });

    this.time.delayedCall(1900, () =>
      this.completeLevel({
        bonus: 25,
        title: 'Você pensa como cientista!',
        body: 'Observar, perguntar, imaginar, testar e aprender. É assim que toda descoberta começa — e é isso que o Clube de Letramento Científico desenvolve.',
      }),
    );
  }
}
