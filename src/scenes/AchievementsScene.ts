import Phaser from 'phaser';
import { CX, SCENES } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ACHIEVEMENTS } from '@/data/achievements';
import { gameState } from '@/services/GameState';
import { Button } from '@/ui/Button';
import { ProgressBar } from '@/ui/ProgressBar';
import { popIn, transitionTo } from '@/utils/anim';
import { createBackdrop } from '@/utils/backdrop';

/** Galeria de conquistas: mostra o que já foi desbloqueado na missão. */
export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ACHIEVEMENTS);
  }

  create(): void {
    this.cameras.main.fadeIn(400, 5, 7, 15);
    createBackdrop(this, { stars: 120, shootingStars: false });

    const unlocked = gameState.achievements.size;
    const total = ACHIEVEMENTS.length;

    this.add.text(CX, 40, 'CONQUISTAS', titleStyle(44, C.ink)).setOrigin(0.5, 0);
    this.add
      .text(CX, 92, `${unlocked} de ${total} desbloqueadas · ⭐ ${gameState.score} estrelas`, bodyStyle(18, C.amber))
      .setOrigin(0.5, 0);

    new ProgressBar(this, CX, 140, {
      width: 460,
      height: 14,
      color: C.amber,
    }).setValue(total > 0 ? unlocked / total : 0, false);

    this.buildGrid();

    new Button(this, CX, 664, {
      label: 'VOLTAR AO MENU',
      icon: '◀',
      width: 300,
      height: 56,
      fontSize: 20,
      variant: 'secondary',
      onClick: () => transitionTo(this, SCENES.MENU),
    });
  }

  private buildGrid(): void {
    const columns = 4;
    const cardWidth = 246;
    const cardHeight = 132;
    const gapX = 20;
    const gapY = 18;
    const startX = CX - ((columns - 1) * (cardWidth + gapX)) / 2;
    const startY = 244;

    ACHIEVEMENTS.forEach((achievement, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (cardWidth + gapX);
      const y = startY + row * (cardHeight + gapY);
      const isUnlocked = gameState.achievements.has(achievement.id);

      const card = this.add.container(x, y);

      const panel = this.add.graphics();
      panel.fillStyle(isUnlocked ? C.space600 : C.space800, isUnlocked ? 1 : 0.85);
      panel.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20);
      panel.lineStyle(2.5, isUnlocked ? C.amber : C.space500, isUnlocked ? 0.95 : 0.55);
      panel.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20);
      card.add(panel);

      const icon = this.add
        .text(0, -44, isUnlocked ? achievement.icon : '🔒', { fontSize: '32px' })
        .setOrigin(0.5);
      if (!isUnlocked) icon.setAlpha(0.5);
      card.add(icon);

      // O título pode ocupar uma ou duas linhas: a descrição é posicionada
      // a partir da altura real dele, para nunca haver sobreposição.
      const title = this.add
        .text(0, -24, achievement.title, {
          ...titleStyle(17, isUnlocked ? C.ink : C.inkMuted),
          align: 'center',
          wordWrap: { width: cardWidth - 20 },
        })
        .setOrigin(0.5, 0);
      card.add(title);

      card.add(
        this.add
          .text(0, title.y + title.height + 5, isUnlocked ? achievement.description : 'Ainda não desbloqueada', {
            ...bodyStyle(13, isUnlocked ? C.inkSoft : C.inkMuted),
            align: 'center',
            wordWrap: { width: cardWidth - 26 },
          })
          .setOrigin(0.5, 0),
      );

      popIn(this, card, index * 45);
    });
  }
}
