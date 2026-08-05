import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, POINTS, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ACH } from '@/data/achievements';
import { COLLECT_PRAISE } from '@/data/feedback';
import { PRINCIPLES, SCHOOL_FACTS } from '@/data/principios';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import type { Principle } from '@/types';
import { burst, popIn, shockwave } from '@/utils/anim';
import type { BackdropOptions } from '@/utils/backdrop';
import { BaseLevelScene } from './BaseLevelScene';

type ItemKind = 'gem' | 'star' | 'meteor';

const FIELD_TOP = 118;
const COLLECTOR_Y = 632;

/**
 * FASE 2 — UMA ESCOLA QUE FAZ SENTIDO
 *
 * Os cinco princípios da Escola das Adolescências caem pelo espaço em forma de
 * cristais. O jogador pilota a nave coletora, desvia dos meteoros e descobre o
 * significado de cada princípio ao capturá-lo.
 */
export class Level2Scene extends BaseLevelScene {
  private collector!: Phaser.Physics.Arcade.Image;
  private items!: Phaser.Physics.Arcade.Group;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private targetX = CX;
  private queue: Principle[] = [];
  private captured: Principle[] = [];
  private gemInPlay = false;
  private counterLabel!: Phaser.GameObjects.Text;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private factTimer?: Phaser.Time.TimerEvent;
  private factIndex = 0;

  constructor() {
    super(SCENES.LEVEL_2);
  }

  protected get chapterNumber(): number {
    return 2;
  }

  protected backdropOptions(): BackdropOptions {
    return { top: C.space600, stars: 120, nebulaColors: [C.cyan, C.amber, C.violet] };
  }

  protected build(): void {
    this.queue = [...PRINCIPLES];
    this.captured = [];
    this.gemInPlay = false;
    this.targetX = CX;

    this.physics.world.setBounds(0, FIELD_TOP, GAME_WIDTH, GAME_HEIGHT + 200);

    this.buildCollector();
    this.buildCounter();
    this.buildControls();

    this.items = this.physics.add.group();
    this.physics.add.overlap(
      this.collector,
      this.items,
      (_collector, itemObject) => this.catchItem(itemObject as Phaser.Physics.Arcade.Image),
      undefined,
      this,
    );

    this.spawnTimer = this.time.addEvent({
      delay: 1150,
      loop: true,
      callback: () => this.spawnItem(),
    });

    this.factTimer = this.time.addEvent({
      delay: 9000,
      loop: true,
      callback: () => {
        gameState.toast(SCHOOL_FACTS[this.factIndex % SCHOOL_FACTS.length], '🏫');
        this.factIndex += 1;
      },
    });

    this.setProgress(0, PRINCIPLES.length);
    this.time.delayedCall(400, () => this.spawnItem());
  }

  // ------------------------------------------------------------- montagem ---

  private buildCollector(): void {
    this.collector = this.physics.add.image(CX, COLLECTOR_Y, TEX.COLLECTOR).setScale(0.5).setDepth(10);
    this.collector.setImmovable(true);
    (this.collector.body as Phaser.Physics.Arcade.Body).setSize(330, 90).setOffset(35, 24);

    const glow = this.add
      .image(CX, COLLECTOR_Y + 10, GEN.GLOW)
      .setDisplaySize(280, 160)
      .setTint(C.cyan)
      .setAlpha(0.3)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(9);
    this.collector.setData('glow', glow);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      this.targetX = pointer.worldX;
    });
  }

  private buildCounter(): void {
    this.counterLabel = this.add
      .text(CX, 132, '', titleStyle(22, C.amber))
      .setOrigin(0.5, 0)
      .setDepth(20);
    this.updateCounter();
  }

  private buildControls(): void {
    this.add
      .text(CX, GAME_HEIGHT - 26, 'Arraste na tela ou use ← → para mover a nave coletora', bodyStyle(15, C.inkMuted))
      .setOrigin(0.5)
      .setDepth(20);
  }

  private updateCounter(): void {
    this.counterLabel.setText(`PRINCÍPIOS CAPTURADOS · ${this.captured.length}/${PRINCIPLES.length}`);
  }

  // -------------------------------------------------------------- spawner ---

  private spawnItem(): void {
    if (this.locked) return;

    const wantsGem = !this.gemInPlay && this.queue.length > 0 && Phaser.Math.FloatBetween(0, 1) < 0.55;
    if (wantsGem) {
      this.spawnGem();
      return;
    }

    if (Phaser.Math.FloatBetween(0, 1) < 0.58) this.spawnDecoration('star');
    else this.spawnDecoration('meteor');
  }

  private spawnGem(): void {
    const principle = this.queue.shift();
    if (!principle) return;

    this.gemInPlay = true;

    const x = Phaser.Math.Between(140, GAME_WIDTH - 140);
    const gem = this.items.create(x, FIELD_TOP - 40, TEX.GEM) as Phaser.Physics.Arcade.Image;
    gem.setScale(0.36).setDepth(8).setTint(principle.color);
    gem.setCircle(84, 12, 12);
    gem.setVelocityY(Phaser.Math.Between(115, 150));
    gem.setData('kind', 'gem' as ItemKind);
    gem.setData('principle', principle);

    const halo = this.add
      .image(x, gem.y, GEN.GLOW)
      .setDisplaySize(150, 150)
      .setTint(principle.color)
      .setAlpha(0.55)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(7);
    gem.setData('halo', halo);

    const icon = this.add.text(x, gem.y, principle.icon, { fontSize: '26px' }).setOrigin(0.5).setDepth(9);
    gem.setData('icon', icon);

    this.tweens.add({ targets: gem, angle: 360, duration: 4200, repeat: -1 });
  }

  private spawnDecoration(kind: 'star' | 'meteor'): void {
    const x = Phaser.Math.Between(90, GAME_WIDTH - 90);
    const texture = kind === 'star' ? TEX.STAR : TEX.METEOR;
    const item = this.items.create(x, FIELD_TOP - 40, texture) as Phaser.Physics.Arcade.Image;

    item.setScale(kind === 'star' ? 0.26 : 0.32).setDepth(8);
    item.setCircle(80, 16, 16);
    item.setVelocityY(kind === 'star' ? Phaser.Math.Between(140, 190) : Phaser.Math.Between(170, 235));
    item.setData('kind', kind);

    this.tweens.add({
      targets: item,
      angle: kind === 'star' ? 360 : -360,
      duration: kind === 'star' ? 6000 : 3400,
      repeat: -1,
    });

    if (kind === 'meteor') {
      const trail = this.add
        .image(x, item.y, GEN.GLOW)
        .setDisplaySize(90, 90)
        .setTint(C.orange)
        .setAlpha(0.5)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(7);
      item.setData('halo', trail);
    }
  }

  // -------------------------------------------------------------- coletas ---

  private catchItem(item: Phaser.Physics.Arcade.Image): void {
    if (this.locked || !item.active) return;

    const kind = item.getData('kind') as ItemKind;
    const x = item.x;
    const y = item.y;

    if (kind === 'gem') {
      const principle = item.getData('principle') as Principle;
      this.destroyItem(item);
      this.gemInPlay = false;
      this.capturePrinciple(principle, x, y);
      return;
    }

    if (kind === 'star') {
      this.destroyItem(item);
      audio.play('star');
      burst(this, x, y, C.amber, 12);
      this.award(POINTS.BONUS_STAR, x, y - 20, C.amber);
      this.praise('⭐', COLLECT_PRAISE);
      return;
    }

    // Meteoro: custa energia, mas nunca encerra a partida.
    this.destroyItem(item);
    burst(this, x, y, C.orange, 16);
    this.damage();
  }

  private capturePrinciple(principle: Principle, x: number, y: number): void {
    this.captured.push(principle);
    this.updateCounter();
    this.setProgress(this.captured.length, PRINCIPLES.length);

    audio.play('collect');
    burst(this, x, y, principle.color, 24);
    shockwave(this, x, y, principle.color);
    this.award(POINTS.PRINCIPLE, x, y - 30, principle.color);

    this.physics.pause();
    this.openModal({
      eyebrow: 'Princípio capturado',
      icon: principle.icon,
      title: principle.title,
      body: principle.description,
      accent: principle.color,
      action: 'CONTINUAR',
      onAction: () => {
        if (this.captured.length >= PRINCIPLES.length) this.showConstellation();
      },
      onClose: () => {
        if (this.captured.length < PRINCIPLES.length) this.physics.resume();
      },
    });
  }

  /**
   * Retira o item do jogo com segurança.
   *
   * O `destroy()` é adiado em um tique porque este método é chamado de dentro
   * de laços do Phaser (callback de overlap e varredura do grupo). Destruir na
   * hora removeria o item do grupo no meio da iteração — o `Set.iterate` do
   * Phaser guarda o tamanho antes de começar e passaria a ler `undefined`,
   * derrubando o loop principal do jogo.
   */
  private destroyItem(item: Phaser.Physics.Arcade.Image): void {
    (item.getData('halo') as Phaser.GameObjects.Image | undefined)?.destroy();
    (item.getData('icon') as Phaser.GameObjects.Text | undefined)?.destroy();

    item.disableBody(true, true);
    this.time.delayedCall(0, () => item.destroy());
  }

  // ---------------------------------------------------------- encerramento ---

  /** Os cinco princípios formam uma constelação antes do fim da fase. */
  private showConstellation(): void {
    this.locked = true;
    this.spawnTimer?.remove();
    this.factTimer?.remove();
    Achievements.unlock(ACH.FIVE_PRINCIPLES);

    const dim = this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.space900, 0).setDepth(500);
    this.tweens.add({ targets: dim, fillAlpha: 0.78, duration: 420 });

    this.add
      .text(CX, 150, 'A ESCOLA DAS ADOLESCÊNCIAS', titleStyle(30, C.amber))
      .setOrigin(0.5)
      .setDepth(520);
    this.add
      .text(CX, 190, 'Todo estudante tem direito a:', bodyStyle(18, C.inkSoft))
      .setOrigin(0.5)
      .setDepth(520);

    const lines = this.add.graphics().setDepth(505);
    const points: Phaser.Math.Vector2[] = [];
    const radius = 172;

    PRINCIPLES.forEach((principle, index) => {
      const angle = -Math.PI / 2 + (index / PRINCIPLES.length) * Math.PI * 2;
      const x = CX + Math.cos(angle) * radius * 1.55;
      const y = CY + 60 + Math.sin(angle) * radius;
      points.push(new Phaser.Math.Vector2(x, y));

      const node = this.add.container(x, y).setDepth(510);
      const gem = this.add.image(0, 0, TEX.GEM).setScale(0.3).setTint(principle.color);
      const icon = this.add.text(0, 0, principle.icon, { fontSize: '22px' }).setOrigin(0.5);
      const title = this.add.text(0, 52, principle.title, titleStyle(18, principle.color)).setOrigin(0.5);
      node.add([gem, icon, title]);

      popIn(this, node, 200 + index * 200);

      this.time.delayedCall(200 + index * 200, () => {
        audio.play('star');
        burst(this, x, y, principle.color, 12);

        if (index > 0) {
          lines.lineStyle(2.5, C.cyanLight, 0.55);
          lines.lineBetween(points[index - 1].x, points[index - 1].y, x, y);
        }
        if (index === PRINCIPLES.length - 1) {
          lines.lineStyle(2.5, C.cyanLight, 0.55);
          lines.lineBetween(x, y, points[0].x, points[0].y);
        }
      });
    });

    this.time.delayedCall(200 + PRINCIPLES.length * 200 + 900, () =>
      this.completeLevel({
        bonus: 20,
        title: 'Constelação completa!',
        body: 'Aprender, participar, colaborar, criar e descobrir: é assim que a escola faz sentido para quem vive as adolescências.',
      }),
    );
  }

  // ------------------------------------------------------------- movimento ---

  update(): void {
    if (this.locked) return;

    const speed = 9;
    if (this.cursors?.left.isDown) this.targetX -= speed;
    if (this.cursors?.right.isDown) this.targetX += speed;
    this.targetX = Phaser.Math.Clamp(this.targetX, 110, GAME_WIDTH - 110);

    this.collector.x = Phaser.Math.Linear(this.collector.x, this.targetX, 0.2);
    const glow = this.collector.getData('glow') as Phaser.GameObjects.Image | undefined;
    glow?.setPosition(this.collector.x, this.collector.y + 10);

    // Acompanha halos/ícones e recicla o que sai da tela.
    // A varredura usa uma cópia da lista: o grupo pode ser alterado aqui dentro.
    const items = this.items.getChildren().slice() as Phaser.Physics.Arcade.Image[];
    for (const item of items) {
      if (!item || !item.active) continue;

      const halo = item.getData('halo') as Phaser.GameObjects.Image | undefined;
      halo?.setPosition(item.x, item.y);
      const icon = item.getData('icon') as Phaser.GameObjects.Text | undefined;
      icon?.setPosition(item.x, item.y);

      if (item.y > GAME_HEIGHT + 80) {
        if ((item.getData('kind') as ItemKind) === 'gem') {
          // Princípio perdido volta para a fila: ninguém fica sem descobrir.
          const principle = item.getData('principle') as Principle;
          this.queue.unshift(principle);
          this.gemInPlay = false;
        }
        this.destroyItem(item);
      }
    }
  }
}
