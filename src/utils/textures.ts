import Phaser from 'phaser';
import { GEN } from '@/config/constants';

/**
 * Texturas geradas em tempo de execução (brilhos e partículas).
 * Evitam arquivos extras e permitem colorização por `tint` em qualquer cena.
 * Todas são criadas uma única vez, no Preload.
 */
export function createGeneratedTextures(scene: Phaser.Scene): void {
  createRadialGlow(scene, GEN.GLOW, 96, 'rgba(255,255,255,0.95)');
  createRadialGlow(scene, GEN.DUST, 24, 'rgba(255,255,255,0.9)');
  createSpark(scene, GEN.SPARK, 64);
  createRing(scene, GEN.RING, 128);
}

/** Ponto luminoso com queda suave — base de quase todas as partículas. */
function createRadialGlow(scene: Phaser.Scene, key: string, size: number, core: string): void {
  if (scene.textures.exists(key)) return;

  const texture = scene.textures.createCanvas(key, size, size);
  if (!texture) return;

  const ctx = texture.getContext();
  const radius = size / 2;
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  gradient.addColorStop(0, core);
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  texture.refresh();
}

/** Cintilação de quatro pontas usada em estrelas e efeitos de acerto. */
function createSpark(scene: Phaser.Scene, key: string, size: number): void {
  if (scene.textures.exists(key)) return;

  const texture = scene.textures.createCanvas(key, size, size);
  if (!texture) return;

  const ctx = texture.getContext();
  const c = size / 2;
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(c, 0);
  ctx.quadraticCurveTo(c + 4, c - 4, size, c);
  ctx.quadraticCurveTo(c + 4, c + 4, c, size);
  ctx.quadraticCurveTo(c - 4, c + 4, 0, c);
  ctx.quadraticCurveTo(c - 4, c - 4, c, 0);
  ctx.fill();

  texture.refresh();
}

/** Anel fino usado nas ondas de choque (coletas, acertos e lançamento). */
function createRing(scene: Phaser.Scene, key: string, size: number): void {
  if (scene.textures.exists(key)) return;

  const texture = scene.textures.createCanvas(key, size, size);
  if (!texture) return;

  const ctx = texture.getContext();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
  ctx.stroke();

  texture.refresh();
}
