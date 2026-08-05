import Phaser from 'phaser';

/**
 * Identidade visual única do jogo: paleta, tipografia e estilos de texto.
 * Qualquer cor ou fonte usada no jogo deve sair daqui.
 */

export const C = {
  space900: 0x05070f,
  space800: 0x0b1026,
  space700: 0x121a3a,
  space600: 0x1d2854,
  space500: 0x2b3a78,
  space400: 0x3c4b93,
  ink: 0xf2f6ff,
  inkSoft: 0xb9c4e8,
  inkMuted: 0x8fa0d4,
  violet: 0x7c4dff,
  violetDark: 0x4a1fd0,
  violetLight: 0xb69bff,
  cyan: 0x22d3ee,
  cyanLight: 0x7ef0ff,
  magenta: 0xff4d9d,
  magentaDark: 0xc92e72,
  amber: 0xffc94d,
  amberDark: 0xc8912a,
  green: 0x34d399,
  greenDark: 0x1f9d63,
  red: 0xe0454f,
  orange: 0xff9b3d,
  white: 0xffffff,
  black: 0x000000,
} as const;

/** Converte 0xrrggbb em '#rrggbb' (necessário para estilos de texto do Phaser). */
export const hex = (value: number): string => `#${value.toString(16).padStart(6, '0')}`;

export const FONT_TITLE = '"Baloo 2", "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
export const FONT_BODY = 'Nunito, "Segoe UI", system-ui, -apple-system, sans-serif';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** Título / destaques: fonte arredondada, com leve sombra para dar profundidade. */
export function titleStyle(size: number, color: number = C.ink, extra: TextStyle = {}): TextStyle {
  return {
    fontFamily: FONT_TITLE,
    fontSize: `${size}px`,
    color: hex(color),
    fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 3, color: '#04081c', blur: 8, fill: true },
    ...extra,
  };
}

/** Corpo de texto: legível, com boa altura de linha para leitores iniciantes. */
export function bodyStyle(size: number, color: number = C.inkSoft, extra: TextStyle = {}): TextStyle {
  return {
    fontFamily: FONT_BODY,
    fontSize: `${size}px`,
    color: hex(color),
    lineSpacing: Math.round(size * 0.45),
    ...extra,
  };
}

/** Paleta cíclica usada em partículas, gemas e cartas. */
export const ACCENTS = [C.cyan, C.magenta, C.amber, C.green, C.violetLight] as const;

/** Duração padrão das transições — o mesmo ritmo em todas as cenas. */
export const TIMING = {
  fast: 160,
  base: 260,
  slow: 420,
  fade: 500,
} as const;
