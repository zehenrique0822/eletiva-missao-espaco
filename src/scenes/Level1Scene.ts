import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, POINTS, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ACH } from '@/data/achievements';
import { ARQUIVO_CARDS, REFLECTION_QUESTION } from '@/data/arquivo';
import { COLLECT_PRAISE } from '@/data/feedback';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import type { ArquivoCard } from '@/types';
import { burst, floaty, popIn, shockwave } from '@/utils/anim';
import type { BackdropOptions } from '@/utils/backdrop';
import { BaseLevelScene } from './BaseLevelScene';

/** Área navegável (abaixo do HUD). */
const FIELD_TOP = 118;

/**
 * FASE 1 — PRIMEIRO CONTATO
 *
 * O jogador flutua pelo espaço coletando esferas de curiosidade. Cada esfera
 * abre um campo do ARQUIVO CONFIDENCIAL DA MISSÃO: nenhuma alternativa é
 * errada, todas são registradas e valorizadas.
 */
export class Level1Scene extends BaseLevelScene {
  private astronaut!: Phaser.Physics.Arcade.Image;
  private orbs!: Phaser.Physics.Arcade.Group;
  private bonusStars!: Phaser.Physics.Arcade.Group;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private collected = 0;
  private counterLabel!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.LEVEL_1);
  }

  protected get chapterNumber(): number {
    return 1;
  }

  protected backdropOptions(): BackdropOptions {
    return { stars: 160, nebulaColors: [C.violet, C.cyan, C.magenta] };
  }

  protected build(): void {
    this.collected = 0;
    this.physics.world.setBounds(0, FIELD_TOP, GAME_WIDTH, GAME_HEIGHT - FIELD_TOP);

    this.buildDecor();
    this.buildAstronaut();
    this.buildOrbs();
    this.buildBonusStars();
    this.buildCounter();

    this.setProgress(0, ARQUIVO_CARDS.length);
  }

  // ------------------------------------------------------------- montagem ---

  private buildDecor(): void {
    const planet = this.add.image(1130, 620, TEX.PLANET).setScale(0.55).setAlpha(0.85);
    floaty(this, planet, 10, 4200);

    const earth = this.add.image(120, 660, TEX.EARTH).setScale(0.5).setAlpha(0.8);
    this.tweens.add({ targets: earth, angle: 360, duration: 180000, repeat: -1 });
  }

  private buildAstronaut(): void {
    this.astronaut = this.physics.add
      .image(CX, CY + 80, TEX.ASTRONAUT)
      .setScale(0.42)
      .setCollideWorldBounds(true)
      .setDamping(true)
      .setDrag(0.0025);

    this.astronaut.setCircle(96, 32, 32);
    this.astronaut.setDepth(10);

    // Propulsão: partículas atrás do traje enquanto o jogador se move.
    const thruster = this.add.particles(0, 0, GEN.GLOW, {
      speed: { min: 10, max: 60 },
      scale: { start: 0.22, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 420,
      frequency: 55,
      blendMode: Phaser.BlendModes.ADD,
      tint: [C.cyanLight, C.violetLight],
      follow: this.astronaut,
      followOffset: { x: 0, y: 26 },
    });
    thruster.setDepth(9);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  private buildOrbs(): void {
    this.orbs = this.physics.add.group();

    ARQUIVO_CARDS.forEach((card, index) => {
      const angle = (index / ARQUIVO_CARDS.length) * Math.PI * 2;
      const x = Phaser.Math.Clamp(CX + Math.cos(angle) * 430, 90, GAME_WIDTH - 90);
      const y = Phaser.Math.Clamp(CY + 40 + Math.sin(angle) * 210, FIELD_TOP + 70, GAME_HEIGHT - 70);

      const orb = this.orbs.create(x, y, TEX.ORB) as Phaser.Physics.Arcade.Image;
      orb.setScale(0.42).setDepth(6);
      orb.setCircle(84, 12, 12);
      orb.setCollideWorldBounds(true);
      orb.setBounce(1);
      orb.setVelocity(Phaser.Math.Between(-46, 46), Phaser.Math.Between(-38, 38));
      orb.setData('card', card);

      this.tweens.add({
        targets: orb,
        scale: 0.48,
        duration: 1100 + index * 60,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const halo = this.add
        .image(x, y, GEN.GLOW)
        .setDisplaySize(130, 130)
        .setTint(C.cyan)
        .setAlpha(0.4)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(5);
      orb.setData('halo', halo);
    });

    this.physics.add.overlap(
      this.astronaut,
      this.orbs,
      (_astronaut, orbObject) => this.collectOrb(orbObject as Phaser.Physics.Arcade.Image),
      undefined,
      this,
    );
  }

  private buildBonusStars(): void {
    this.bonusStars = this.physics.add.group();

    for (let i = 0; i < 6; i += 1) {
      const x = Phaser.Math.Between(120, GAME_WIDTH - 120);
      const y = Phaser.Math.Between(FIELD_TOP + 60, GAME_HEIGHT - 80);
      const star = this.bonusStars.create(x, y, TEX.STAR) as Phaser.Physics.Arcade.Image;
      star.setScale(0.28).setDepth(6);
      star.setCircle(80, 16, 16);
      this.tweens.add({
        targets: star,
        angle: 360,
        duration: 9000,
        repeat: -1,
      });
      floaty(this, star, 12, 1600 + i * 120);
    }

    this.physics.add.overlap(
      this.astronaut,
      this.bonusStars,
      (_astronaut, starObject) => this.collectStar(starObject as Phaser.Physics.Arcade.Image),
      undefined,
      this,
    );
  }

  private buildCounter(): void {
    this.counterLabel = this.add
      .text(CX, 132, '', titleStyle(22, C.cyanLight))
      .setOrigin(0.5, 0)
      .setDepth(20);
    this.updateCounter();
  }

  private updateCounter(): void {
    this.counterLabel.setText(`ARQUIVO CONFIDENCIAL · ${this.collected}/${ARQUIVO_CARDS.length} registros`);
  }

  // --------------------------------------------------------------- coletas ---

  private collectOrb(orb: Phaser.Physics.Arcade.Image): void {
    if (this.locked || !orb.active) return;

    const card = orb.getData('card') as ArquivoCard;
    const halo = orb.getData('halo') as Phaser.GameObjects.Image | undefined;

    orb.disableBody(true, true);
    halo?.destroy();

    audio.play('collect');
    burst(this, orb.x, orb.y, C.cyan, 20);
    shockwave(this, orb.x, orb.y, C.cyanLight);

    this.physics.pause();
    this.openModal({
      eyebrow: 'Arquivo Confidencial da Missão',
      title: card.prompt,
      body: 'Não existe resposta certa: este registro é seu. Escolha o que combina com você.',
      accent: C.cyan,
      width: card.optionTextures ? 760 : 700,
      choices: card.options.map((label, index) => ({
        label,
        texture: card.optionTextures?.[index],
        onSelect: () => this.registerAnswer(card, label),
      })),
      onClose: () => this.physics.resume(),
    });
  }

  private registerAnswer(card: ArquivoCard, answer: string): void {
    gameState.archive[card.id] = answer;
    gameState.save();

    this.collected += 1;
    this.updateCounter();
    this.setProgress(this.collected, ARQUIVO_CARDS.length);
    this.award(POINTS.COLLECT, CX, 250, C.cyan);
    audio.play('correct');

    if (this.collected === 1) Achievements.unlock(ACH.FIRST_QUESTION);
    gameState.toast(card.reply, '📝');

    if (this.collected >= ARQUIVO_CARDS.length) {
      this.time.delayedCall(900, () => this.sealArchive());
    }
  }

  private collectStar(star: Phaser.Physics.Arcade.Image): void {
    if (this.locked || !star.active) return;

    star.disableBody(true, true);
    audio.play('star');
    burst(this, star.x, star.y, C.amber, 14);
    this.award(POINTS.BONUS_STAR, star.x, star.y - 20, C.amber);
    this.praise('⭐', COLLECT_PRAISE);
  }

  // ------------------------------------------------------ lacre do arquivo ---

  /** Animação final: o arquivo é dobrado, guardado e lacrado no envelope. */
  private sealArchive(): void {
    this.locked = true;
    this.physics.pause();
    Achievements.unlock(ACH.ARCHIVE_SEALED);

    const dim = this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.space900, 0).setDepth(500);
    this.tweens.add({ targets: dim, fillAlpha: 0.72, duration: 500 });

    const envelope = this.add.image(CX, CY + 20, TEX.ENVELOPE).setScale(0.1).setDepth(510);
    popIn(this, envelope, 250, 0.9);
    audio.play('whoosh');

    // Fichas voando para dentro do envelope
    this.time.delayedCall(700, () => {
      for (let i = 0; i < ARQUIVO_CARDS.length; i += 1) {
        const angle = (i / ARQUIVO_CARDS.length) * Math.PI * 2;
        const sheet = this.add
          .rectangle(CX + Math.cos(angle) * 420, CY + Math.sin(angle) * 260, 46, 60, C.white, 0.95)
          .setDepth(509)
          .setAngle(Phaser.Math.Between(-40, 40));

        this.tweens.add({
          targets: sheet,
          x: CX,
          y: CY + 20,
          scale: 0.2,
          angle: 0,
          duration: 620,
          delay: i * 90,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            sheet.destroy();
            audio.play('type');
            if (i === ARQUIVO_CARDS.length - 1) this.stampEnvelope(envelope);
          },
        });
      }
    });
  }

  private stampEnvelope(envelope: Phaser.GameObjects.Image): void {
    burst(this, envelope.x, envelope.y, C.amber, 26);
    audio.play('unlock');

    const stamp = this.add
      .text(CX, CY + 150, 'ABRIR SOMENTE NA ÚLTIMA MISSÃO', {
        ...titleStyle(24, C.red),
        align: 'center',
      })
      .setOrigin(0.5)
      .setAngle(-7)
      .setDepth(520)
      .setScale(3)
      .setAlpha(0);

    this.tweens.add({
      targets: stamp,
      scale: 1,
      alpha: 1,
      duration: 380,
      ease: 'Back.easeOut',
      onComplete: () => this.cameras.main.shake(160, 0.004),
    });

    this.add
      .text(CX, CY - 190, `Tripulante ${gameState.playerName}`, bodyStyle(20, C.ink))
      .setOrigin(0.5)
      .setDepth(520);

    this.time.delayedCall(1400, () =>
      this.completeLevel({
        bonus: 20,
        title: 'Arquivo lacrado!',
        body: `"${REFLECTION_QUESTION}"\n\nGuarde essa pergunta. Voltaremos a ela durante a nossa missão.`,
      }),
    );
  }

  // ------------------------------------------------------------ movimento ---

  update(): void {
    if (!this.astronaut.body) return;

    // Os halos acompanham as esferas em movimento (cópia da lista por segurança).
    const orbs = this.orbs.getChildren().slice() as Phaser.Physics.Arcade.Image[];
    for (const orb of orbs) {
      if (!orb || !orb.active) continue;
      const halo = orb.getData('halo') as Phaser.GameObjects.Image | undefined;
      halo?.setPosition(orb.x, orb.y);
    }

    if (this.locked) {
      this.astronaut.setVelocity(0, 0);
      return;
    }

    const speed = 330;
    let vx = 0;
    let vy = 0;

    if (this.cursors?.left.isDown || this.keyA?.isDown) vx -= 1;
    if (this.cursors?.right.isDown || this.keyD?.isDown) vx += 1;
    if (this.cursors?.up.isDown || this.keyW?.isDown) vy -= 1;
    if (this.cursors?.down.isDown || this.keyS?.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const vector = new Phaser.Math.Vector2(vx, vy).normalize().scale(speed);
      this.astronaut.setVelocity(vector.x, vector.y);
    } else {
      const pointer = this.input.activePointer;
      if (pointer.isDown && pointer.y > FIELD_TOP) {
        const distance = Phaser.Math.Distance.Between(
          this.astronaut.x,
          this.astronaut.y,
          pointer.worldX,
          pointer.worldY,
        );
        if (distance > 14) {
          this.physics.moveTo(this.astronaut, pointer.worldX, pointer.worldY, Math.min(speed, distance * 4));
        } else {
          this.astronaut.setVelocity(0, 0);
        }
      }
    }

    // Leve inclinação no sentido do movimento.
    const body = this.astronaut.body as Phaser.Physics.Arcade.Body;
    this.astronaut.setAngle(Phaser.Math.Clamp(body.velocity.x * 0.035, -14, 14));
  }
}
