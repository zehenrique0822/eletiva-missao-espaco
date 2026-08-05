import Phaser from 'phaser';
import { CX, SCENES } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { CHAPTERS } from '@/data/chapters';
import { Button } from '@/ui/Button';
import { createPanel } from '@/ui/Panel';
import { popIn, transitionTo } from '@/utils/anim';
import { createBackdrop } from '@/utils/backdrop';

interface Rule {
  icon: string;
  title: string;
  text: string;
  color: number;
}

const RULES: Rule[] = [
  {
    icon: '🎯',
    title: 'O objetivo',
    text: 'Você acaba de entrar para a tripulação. Complete as 6 etapas do treinamento e descubra como será a nossa eletiva.',
    color: C.cyan,
  },
  {
    icon: '🕹️',
    title: 'Os controles',
    text: 'Tudo funciona com toque, mouse ou teclado: arraste para mover, toque para escolher e use as setas quando preferir.',
    color: C.magenta,
  },
  {
    icon: '⭐',
    title: 'Estrelas',
    text: 'Cada coleta, descoberta e acerto rende estrelas. Elas somam pontos para as conquistas da missão.',
    color: C.amber,
  },
  {
    icon: '⚡',
    title: 'Energia',
    text: 'Bater em um meteoro ou escolher um caminho errado gasta energia. Se ela acabar, a fase recomeça — errar faz parte da Ciência!',
    color: C.green,
  },
];

/** Tela de instruções: regras gerais + resumo das seis fases. */
export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.INSTRUCTIONS);
  }

  create(): void {
    this.cameras.main.fadeIn(400, 5, 7, 15);
    createBackdrop(this, { stars: 110, shootingStars: false });

    this.add.text(CX, 52, 'COMO JOGAR', titleStyle(44, C.ink)).setOrigin(0.5, 0);
    this.add
      .text(CX, 106, 'Um treinamento em seis etapas — jogando e investigando ao mesmo tempo', bodyStyle(17, C.inkSoft))
      .setOrigin(0.5, 0);

    this.buildRules();
    this.buildChapterList();

    new Button(this, CX, 660, {
      label: 'VOLTAR AO MENU',
      icon: '◀',
      width: 300,
      height: 60,
      fontSize: 20,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.MENU),
    });
  }

  /** Coluna esquerda: regras gerais em cartões. */
  private buildRules(): void {
    const startY = 178;
    const cardHeight = 104;
    const gap = 14;

    RULES.forEach((rule, index) => {
      const y = startY + index * (cardHeight + gap);
      const card = this.add.container(330, y);

      const panel = this.add.graphics();
      panel.fillStyle(C.space700, 0.94);
      panel.fillRoundedRect(-290, -cardHeight / 2, 580, cardHeight, 20);
      panel.lineStyle(2.5, rule.color, 0.7);
      panel.strokeRoundedRect(-290, -cardHeight / 2, 580, cardHeight, 20);
      card.add(panel);

      card.add(this.add.text(-248, 0, rule.icon, { fontSize: '40px' }).setOrigin(0.5));
      card.add(this.add.text(-208, -32, rule.title, titleStyle(22, rule.color)).setOrigin(0, 0));
      card.add(
        this.add
          .text(-208, -2, rule.text, { ...bodyStyle(15, C.inkSoft), wordWrap: { width: 470 } })
          .setOrigin(0, 0),
      );

      popIn(this, card, index * 80);
    });
  }

  /** Coluna direita: as seis fases da missão. */
  private buildChapterList(): void {
    const panelX = 930;
    createPanel(this, panelX, 400, {
      width: 560,
      height: 466,
      radius: 26,
      fill: C.space800,
      fillAlpha: 0.92,
      border: C.violetLight,
      borderWidth: 2.5,
    });

    this.add.text(panelX, 196, 'AS SEIS ETAPAS', titleStyle(24, C.amber)).setOrigin(0.5, 0);

    const icons = ['❓', '💎', '🌀', '🔬', '👩‍🔬', '🚀'];
    CHAPTERS.forEach((chapter, index) => {
      const y = 244 + index * 62;
      const row = this.add.container(panelX, y);

      row.add(this.add.text(-244, 0, icons[index], { fontSize: '30px' }).setOrigin(0.5));
      row.add(
        this.add.text(-212, -19, `${chapter.number}. ${chapter.title}`, titleStyle(18, C.ink)).setOrigin(0, 0),
      );
      row.add(
        this.add
          .text(-212, 3, chapter.objective, { ...bodyStyle(14, C.inkMuted), wordWrap: { width: 450 } })
          .setOrigin(0, 0),
      );

      popIn(this, row, 200 + index * 60);
    });
  }
}
