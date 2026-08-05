import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, GEN } from '@/config/constants';
import { C } from '@/config/theme';

export interface BackdropOptions {
  /** Cor do topo do gradiente. */
  top?: number;
  /** Cor da base do gradiente. */
  bottom?: number;
  /** Quantidade de estrelas fixas. */
  stars?: number;
  /** Nebulosas coloridas ao fundo. */
  nebula?: boolean;
  /** Estrelas cadentes ocasionais. */
  shootingStars?: boolean;
  /** Cores das nebulosas. */
  nebulaColors?: [number, number, number];
}

/**
 * Cenário espacial compartilhado por todas as cenas.
 *
 * Combina gradiente, nebulosas em blend aditivo, campo de estrelas e
 * cintilações animadas — leve o bastante para rodar bem em celulares
 * (tudo é desenhado uma vez; só as cintilações usam tweens).
 */
export function createBackdrop(scene: Phaser.Scene, options: BackdropOptions = {}): Phaser.GameObjects.Container {
  const {
    top = C.space700,
    bottom = C.space900,
    stars = 130,
    nebula = true,
    shootingStars = true,
    nebulaColors = [C.violet, C.cyan, C.magenta],
  } = options;

  const layer = scene.add.container(0, 0).setDepth(-100);

  // --- gradiente de fundo -------------------------------------------------
  const sky = scene.add.graphics();
  sky.fillGradientStyle(top, top, bottom, bottom, 1);
  sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  layer.add(sky);

  // --- nebulosas ----------------------------------------------------------
  if (nebula) {
    const blobs: { x: number; y: number; rx: number; ry: number; color: number }[] = [
      { x: GAME_WIDTH * 0.18, y: GAME_HEIGHT * 0.22, rx: 340, ry: 220, color: nebulaColors[0] },
      { x: GAME_WIDTH * 0.82, y: GAME_HEIGHT * 0.3, rx: 300, ry: 190, color: nebulaColors[1] },
      { x: GAME_WIDTH * 0.5, y: GAME_HEIGHT * 0.92, rx: 460, ry: 200, color: nebulaColors[2] },
    ];

    blobs.forEach((blob, index) => {
      const cloud = scene.add.image(blob.x, blob.y, GEN.GLOW);
      cloud.setDisplaySize(blob.rx * 2, blob.ry * 2);
      cloud.setTint(blob.color);
      cloud.setAlpha(0.16);
      cloud.setBlendMode(Phaser.BlendModes.ADD);
      layer.add(cloud);

      scene.tweens.add({
        targets: cloud,
        alpha: 0.26,
        scaleX: cloud.scaleX * 1.12,
        scaleY: cloud.scaleY * 1.08,
        duration: 6000 + index * 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  // --- campo de estrelas --------------------------------------------------
  const field = scene.add.graphics();
  for (let i = 0; i < stars; i += 1) {
    const x = Phaser.Math.Between(0, GAME_WIDTH);
    const y = Phaser.Math.Between(0, GAME_HEIGHT);
    const radius = Phaser.Math.FloatBetween(0.6, 2.1);
    const alpha = Phaser.Math.FloatBetween(0.25, 0.95);
    field.fillStyle(C.white, alpha);
    field.fillCircle(x, y, radius);
  }
  layer.add(field);

  // --- cintilações --------------------------------------------------------
  const twinkleColors = [C.white, C.cyanLight, C.amber, C.violetLight];
  for (let i = 0; i < 16; i += 1) {
    const spark = scene.add
      .image(Phaser.Math.Between(40, GAME_WIDTH - 40), Phaser.Math.Between(30, GAME_HEIGHT - 30), GEN.SPARK)
      .setScale(Phaser.Math.FloatBetween(0.12, 0.3))
      .setTint(Phaser.Utils.Array.GetRandom(twinkleColors))
      .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6))
      .setBlendMode(Phaser.BlendModes.ADD);
    layer.add(spark);

    scene.tweens.add({
      targets: spark,
      alpha: 0.05,
      scale: spark.scale * 0.5,
      duration: Phaser.Math.Between(1200, 3200),
      delay: Phaser.Math.Between(0, 2000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // --- estrelas cadentes --------------------------------------------------
  if (shootingStars) {
    const spawn = () => {
      const startX = Phaser.Math.Between(-100, GAME_WIDTH * 0.6);
      const startY = Phaser.Math.Between(-60, GAME_HEIGHT * 0.45);
      const trail = scene.add
        .image(startX, startY, GEN.DUST)
        .setScale(1.6, 0.3)
        .setAngle(28)
        .setAlpha(0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(C.cyanLight);
      layer.add(trail);

      scene.tweens.add({
        targets: trail,
        x: startX + 620,
        y: startY + 330,
        alpha: { from: 0.9, to: 0 },
        scaleX: 5,
        duration: 900,
        ease: 'Cubic.easeIn',
        onComplete: () => trail.destroy(),
      });
    };

    scene.time.addEvent({
      delay: Phaser.Math.Between(5000, 9000),
      loop: true,
      callback: spawn,
    });
  }

  return layer;
}
