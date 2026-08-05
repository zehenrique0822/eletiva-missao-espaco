import Phaser from 'phaser';
import { C } from '@/config/theme';

export interface PanelStyle {
  width: number;
  height: number;
  radius?: number;
  fill?: number;
  fillAlpha?: number;
  border?: number;
  borderWidth?: number;
  /** Sombra projetada abaixo do painel. */
  shadow?: boolean;
  /** Brilho interno no topo (dá volume sem usar imagem). */
  sheen?: boolean;
}

/**
 * Desenha um painel arredondado **centrado na origem** do Graphics recebido.
 * Centralizar na origem permite usar o mesmo painel dentro de containers,
 * modais e botões sem recalcular posições.
 */
export function paintPanel(graphics: Phaser.GameObjects.Graphics, style: PanelStyle): void {
  const {
    width,
    height,
    radius = 22,
    fill = C.space600,
    fillAlpha = 1,
    border = C.violet,
    borderWidth = 3,
    shadow = true,
    sheen = true,
  } = style;

  const left = -width / 2;
  const topEdge = -height / 2;

  graphics.clear();

  if (shadow) {
    graphics.fillStyle(C.black, 0.38);
    graphics.fillRoundedRect(left + 2, topEdge + 10, width - 4, height, radius);
  }

  graphics.fillStyle(fill, fillAlpha);
  graphics.fillRoundedRect(left, topEdge, width, height, radius);

  if (sheen) {
    graphics.fillStyle(C.white, 0.07);
    graphics.fillRoundedRect(left + 3, topEdge + 3, width - 6, height * 0.45, {
      tl: radius - 3,
      tr: radius - 3,
      bl: 6,
      br: 6,
    });
  }

  if (borderWidth > 0) {
    graphics.lineStyle(borderWidth, border, 0.9);
    graphics.strokeRoundedRect(left, topEdge, width, height, radius);
  }
}

/** Atalho: cria um Graphics já pintado como painel na posição informada. */
export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  style: PanelStyle,
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics({ x, y });
  paintPanel(graphics, style);
  return graphics;
}
