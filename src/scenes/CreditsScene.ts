import Phaser from 'phaser';
import { CX, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { Button } from '@/ui/Button';
import { floaty, popIn, transitionTo } from '@/utils/anim';
import { createBackdrop } from '@/utils/backdrop';

interface CreditBlock {
  title: string;
  lines: string[];
  color: number;
}

const BLOCKS: CreditBlock[] = [
  {
    title: 'Concepção pedagógica',
    lines: [
      'Professora Elo — comandante da missão',
      'Eletiva "Missão Espaço: A Ciência por Trás das Grandes Descobertas"',
      'Componente Curricular Eletivo · Ensino Fundamental',
    ],
    color: C.amber,
  },
  {
    title: 'Base curricular',
    lines: [
      'Política Nacional Escola das Adolescências',
      'Clube de Letramento Científico',
      'Caderno de Inovação Curricular e PDT da eletiva',
    ],
    color: C.cyan,
  },
  {
    title: 'Desenvolvimento',
    lines: [
      'Phaser 3 · TypeScript · Vite',
      'Ilustrações vetoriais autorais em SVG',
      'Trilha e efeitos sintetizados com a Web Audio API',
    ],
    color: C.magenta,
  },
  {
    title: 'Tipografia',
    lines: [
      'Baloo 2 e Nunito — Google Fonts',
      'SIL Open Font License (uso livre)',
    ],
    color: C.green,
  },
];

/** Tela de créditos. */
export class CreditsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.CREDITS);
  }

  create(): void {
    this.cameras.main.fadeIn(400, 5, 7, 15);
    createBackdrop(this, { stars: 120 });

    this.add.text(CX, 46, 'CRÉDITOS DA MISSÃO', titleStyle(42, C.ink)).setOrigin(0.5, 0);

    const rocket = this.add.image(150, 360, TEX.ROCKET).setScale(0.7).setAngle(-10);
    floaty(this, rocket, 18, 2800);

    const planet = this.add.image(1140, 250, TEX.PLANET).setScale(0.5);
    floaty(this, planet, 12, 3600, 400);

    BLOCKS.forEach((block, index) => {
      const y = 150 + index * 118;
      const card = this.add.container(CX, y);

      const panel = this.add.graphics();
      panel.fillStyle(C.space700, 0.94);
      panel.fillRoundedRect(-380, -50, 760, 100, 20);
      panel.lineStyle(2.5, block.color, 0.75);
      panel.strokeRoundedRect(-380, -50, 760, 100, 20);
      card.add(panel);

      card.add(this.add.text(-352, -36, block.title.toUpperCase(), titleStyle(19, block.color)).setOrigin(0, 0));
      card.add(
        this.add
          .text(-352, -6, block.lines.join('\n'), { ...bodyStyle(15, C.inkSoft), lineSpacing: 4 })
          .setOrigin(0, 0),
      );

      popIn(this, card, index * 90);
    });

    this.add
      .text(CX, 626, '"Toda grande descoberta começou quando alguém fez uma pergunta."', {
        ...bodyStyle(18, C.amber),
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    new Button(this, CX, 672, {
      label: 'VOLTAR AO MENU',
      icon: '◀',
      width: 300,
      height: 56,
      fontSize: 20,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.MENU),
    });
  }
}
