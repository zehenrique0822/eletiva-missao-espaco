import Phaser from 'phaser';
import { GEN } from '@/config/constants';
import { C, TIMING } from '@/config/theme';

/** Biblioteca de animações reutilizadas por todas as cenas. */

type Target = Phaser.GameObjects.GameObject & {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  setScale(value: number): unknown;
  setAlpha(value: number): unknown;
};

/** Entrada "elástica" padrão de cartas, botões e painéis. */
export function popIn(scene: Phaser.Scene, target: Target, delay = 0, finalScale = 1): Phaser.Tweens.Tween {
  target.setScale(finalScale * 0.6);
  target.setAlpha(0);
  return scene.tweens.add({
    targets: target,
    scale: finalScale,
    alpha: 1,
    duration: TIMING.slow,
    delay,
    ease: 'Back.easeOut',
  });
}

/** Saída rápida (usada antes de destruir um objeto). */
export function popOut(scene: Phaser.Scene, target: Target, onComplete?: () => void): void {
  scene.tweens.add({
    targets: target,
    scale: target.scale * 0.4,
    alpha: 0,
    duration: TIMING.base,
    ease: 'Back.easeIn',
    onComplete,
  });
}

/** Flutuação contínua: dá vida a itens coletáveis e personagens. */
export function floaty(
  scene: Phaser.Scene,
  target: Target,
  amplitude = 10,
  duration = 2000,
  delay = 0,
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    y: target.y - amplitude,
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

/** Pulsação de destaque (objetos interativos ainda não descobertos). */
export function pulse(
  scene: Phaser.Scene,
  target: Target,
  scaleTo = 1.08,
  duration = 900,
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: target,
    scale: target.scale * scaleTo,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

/** Balanço curto de negativa — nunca agressivo, só um "não é por aqui". */
export function shake(scene: Phaser.Scene, target: Target, strength = 10): void {
  const originX = target.x;
  scene.tweens.add({
    targets: target,
    x: originX - strength,
    duration: 60,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      target.x = originX;
    },
  });
}

/** Explosão de partículas coloridas: coleta, acerto e conquistas. */
export function burst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number = C.amber,
  quantity = 18,
): void {
  const emitter = scene.add.particles(x, y, GEN.GLOW, {
    speed: { min: 90, max: 300 },
    scale: { start: 0.5, end: 0 },
    alpha: { start: 0.95, end: 0 },
    lifespan: { min: 350, max: 750 },
    blendMode: Phaser.BlendModes.ADD,
    tint: color,
    quantity,
    emitting: false,
  });
  emitter.setDepth(900);
  emitter.explode(quantity);
  scene.time.delayedCall(900, () => emitter.destroy());
}

/** Onda de choque circular — reforça o feedback de uma coleta importante. */
export function shockwave(scene: Phaser.Scene, x: number, y: number, color: number = C.cyan): void {
  const ring = scene.add.image(x, y, GEN.RING).setTint(color).setDepth(880).setScale(0.2);
  ring.setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: ring,
    scale: 1.6,
    alpha: 0,
    duration: 520,
    ease: 'Cubic.easeOut',
    onComplete: () => ring.destroy(),
  });
}

/** Número flutuante de pontuação ("+10"). */
export function floatingScore(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number,
  color: number = C.amber,
): void {
  const label = scene.add
    .text(x, y, `+${amount}`, {
      fontFamily: '"Baloo 2", "Trebuchet MS", sans-serif',
      fontSize: '34px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      stroke: '#0b1026',
      strokeThickness: 6,
    })
    .setOrigin(0.5)
    .setDepth(920);

  scene.tweens.add({
    targets: label,
    y: y - 70,
    alpha: 0,
    scale: 1.25,
    duration: 900,
    ease: 'Cubic.easeOut',
    onComplete: () => label.destroy(),
  });
}

/**
 * Efeito máquina de escrever.
 * Devolve um controlador que permite completar o texto imediatamente
 * (o jogador pode tocar na tela para pular a digitação).
 */
export interface Typewriter {
  skip(): void;
  stop(): void;
  readonly done: boolean;
}

export function typewrite(
  scene: Phaser.Scene,
  label: Phaser.GameObjects.Text,
  fullText: string,
  speed = 22,
  onComplete?: () => void,
  onChar?: () => void,
): Typewriter {
  label.setText('');
  let index = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    label.setText(fullText);
    event.remove();
    onComplete?.();
  };

  const event = scene.time.addEvent({
    delay: speed,
    loop: true,
    callback: () => {
      index += 1;
      label.setText(fullText.slice(0, index));
      if (index % 2 === 0) onChar?.();
      if (index >= fullText.length) finish();
    },
  });

  return {
    skip: finish,
    stop: () => {
      finished = true;
      event.remove();
    },
    get done() {
      return finished;
    },
  };
}

/** Transição padrão entre cenas: fade-out, troca e fade-in. */
export function transitionTo(scene: Phaser.Scene, key: string, data?: object): void {
  scene.cameras.main.fadeOut(TIMING.fade, 5, 7, 15);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(key, data);
  });
}
