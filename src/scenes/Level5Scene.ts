import Phaser from 'phaser';
import { CX, CY, GAME_HEIGHT, GAME_WIDTH, GEN, POINTS, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ACH } from '@/data/achievements';
import { AGREEMENTS, BOARDING_MESSAGE, DIALOGUE_TOPICS } from '@/data/professora';
import { audio } from '@/services/AudioService';
import { Achievements } from '@/services/AchievementService';
import { gameState } from '@/services/GameState';
import { paintPanel } from '@/ui/Panel';
import type { AgreementOption, DialogueTopic } from '@/types';
import { burst, floaty, popIn, shake, shockwave, typewrite, type Typewriter } from '@/utils/anim';
import type { BackdropOptions } from '@/utils/backdrop';
import { BaseLevelScene } from './BaseLevelScene';

interface TopicButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  check: Phaser.GameObjects.Text;
  topic: DialogueTopic;
}

/** Balão de fala: a altura é calculada a partir do texto (ver `fitBubble`). */
const BUBBLE_X = 838;
const BUBBLE_Y = 282;
const BUBBLE_WIDTH = 720;
const BUBBLE_PADDING = 30;
const BUBBLE_MIN_HEIGHT = 170;
/** 122–442 na tela: abaixo do HUD (118) e acima dos botões (460). */
const BUBBLE_MAX_HEIGHT = 320;
const BUBBLE_TEXT_WIDTH = BUBBLE_WIDTH - BUBBLE_PADDING * 2 - 8;

/** Grade de botões (perguntas e combinados), à direita da professora. */
const GRID_LEFT = 500;
const GRID_COLUMNS = 3;
const CELL_WIDTH = 240;
const CELL_GAP_X = 12;
const TOPIC_HEIGHT = 76;
const TOPIC_TOP = 498;
const AGREEMENT_HEIGHT = 64;
const AGREEMENT_TOP = 476;

/**
 * FASE 5 — CONHECENDO A COMANDANTE
 *
 * Conversa livre com a Professora Elo: o jogador escolhe o que quer perguntar.
 * Depois de conhecê-la, a turma constrói junto os Combinados da Missão —
 * acordos, e não regras impostas.
 */
export class Level5Scene extends BaseLevelScene {
  private bubble!: Phaser.GameObjects.Graphics;
  private bubbleText!: Phaser.GameObjects.Text;
  private professora!: Phaser.GameObjects.Image;
  private topicButtons: TopicButton[] = [];
  private topicsLayer!: Phaser.GameObjects.Container;
  private agreementsLayer!: Phaser.GameObjects.Container;
  private readTopics = new Set<string>();
  private chosenAgreements = new Set<string>();
  private typewriter?: Typewriter;
  private validAgreements = AGREEMENTS.filter((agreement) => agreement.valid).length;

  constructor() {
    super(SCENES.LEVEL_5);
  }

  protected get chapterNumber(): number {
    return 5;
  }

  protected backdropOptions(): BackdropOptions {
    return { top: C.space600, stars: 100, nebulaColors: [C.violet, C.magenta, C.cyan] };
  }

  protected build(): void {
    this.readTopics = new Set();
    this.chosenAgreements = new Set();
    this.topicButtons = [];

    this.buildProfessora();
    this.buildBubble();

    this.topicsLayer = this.add.container(0, 0);
    this.agreementsLayer = this.add.container(0, 0).setVisible(false);

    this.buildTopics();
    this.setProgress(0, DIALOGUE_TOPICS.length + this.validAgreements);

    this.input.on(Phaser.Input.Events.POINTER_DOWN, () => this.typewriter?.skip());

    this.say(`Oi, ${gameState.playerName}! Que bom ter você na tripulação. Pode perguntar o que quiser antes de começarmos a missão.`);
  }

  // -------------------------------------------------------------- cenário ---

  private buildProfessora(): void {
    const glow = this.add
      .image(300, 430, GEN.GLOW)
      .setDisplaySize(520, 560)
      .setTint(C.violet)
      .setAlpha(0.26)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: glow,
      alpha: 0.42,
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.professora = this.add.image(300, 440, TEX.PROFESSORA).setScale(0.68);
    floaty(this, this.professora, 8, 3000);

    this.add.text(300, 662, 'Professora Elo', titleStyle(26, C.amber)).setOrigin(0.5);
    this.add
      .text(300, 692, 'Comandante da Missão Espaço', bodyStyle(15, C.inkMuted))
      .setOrigin(0.5);
  }

  private buildBubble(): void {
    this.bubble = this.add.graphics({ x: BUBBLE_X, y: BUBBLE_Y });

    // Bico do balão apontando para a professora (a altura do balão nunca é
    // menor que BUBBLE_MIN_HEIGHT, então o bico sempre encosta na borda).
    const beak = this.add.graphics();
    beak.fillStyle(C.space700, 0.96);
    beak.fillTriangle(
      BUBBLE_X - BUBBLE_WIDTH / 2 + 2,
      BUBBLE_Y - 20,
      BUBBLE_X - BUBBLE_WIDTH / 2 + 2,
      BUBBLE_Y + 40,
      BUBBLE_X - BUBBLE_WIDTH / 2 - 34,
      BUBBLE_Y + 12,
    );

    this.bubbleText = this.add
      .text(BUBBLE_X, BUBBLE_Y, '', {
        ...bodyStyle(18, C.ink),
        align: 'left',
        wordWrap: { width: BUBBLE_TEXT_WIDTH },
      })
      .setOrigin(0.5, 0);

    this.paintBubble(BUBBLE_MIN_HEIGHT);
  }

  private paintBubble(height: number): void {
    paintPanel(this.bubble, {
      width: BUBBLE_WIDTH,
      height,
      radius: 30,
      fill: C.space700,
      fillAlpha: 0.96,
      border: C.violetLight,
      borderWidth: 3,
    });
  }

  /**
   * Ajusta o balão ao texto **completo** antes de começar a digitação.
   *
   * A altura acompanha o conteúdo e, se ainda assim o texto não couber no
   * espaço disponível, o corpo diminui um ponto por vez. Assim nenhuma fala
   * vaza para fora do balão — inclusive falas que a professora venha a editar
   * depois em `src/data/professora.ts`.
   */
  private fitBubble(text: string): void {
    const maxInner = BUBBLE_MAX_HEIGHT - BUBBLE_PADDING * 2;

    let size = 18;
    const applySize = (): void => {
      this.bubbleText.setStyle({
        ...bodyStyle(size, C.ink),
        align: 'left',
        wordWrap: { width: BUBBLE_TEXT_WIDTH },
      });
      this.bubbleText.setText(text);
    };

    applySize();
    while (this.bubbleText.height > maxInner && size > 13) {
      size -= 1;
      applySize();
    }

    const height = Phaser.Math.Clamp(
      this.bubbleText.height + BUBBLE_PADDING * 2,
      BUBBLE_MIN_HEIGHT,
      BUBBLE_MAX_HEIGHT,
    );

    this.paintBubble(height);
    // Texto alinhado ao topo: não "pula" enquanto as linhas vão aparecendo.
    this.bubbleText.setPosition(BUBBLE_X, BUBBLE_Y - height / 2 + BUBBLE_PADDING);
    this.bubbleText.setText('');
  }

  /** Faz a professora "falar" com efeito de digitação. */
  private say(text: string, onComplete?: () => void): void {
    this.typewriter?.stop();
    this.fitBubble(text);
    this.typewriter = typewrite(
      this,
      this.bubbleText,
      text,
      14,
      () => {
        this.typewriter = undefined;
        onComplete?.();
      },
      () => audio.play('type'),
    );
  }

  // ------------------------------------------------------------- perguntas ---

  private buildTopics(): void {
    const columns = GRID_COLUMNS;
    const width = CELL_WIDTH;
    const height = TOPIC_HEIGHT;
    const gapX = CELL_GAP_X;
    const gapY = 12;
    const startX = GRID_LEFT + width / 2;
    const startY = TOPIC_TOP;

    DIALOGUE_TOPICS.forEach((topic, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (width + gapX);
      const y = startY + row * (height + gapY);

      const container = this.add.container(x, y);
      const background = this.add.graphics();
      this.paintTopic(background, width, height, false);
      container.add(background);

      const label = this.add
        .text(0, 0, topic.question, {
          ...bodyStyle(16, C.ink, { fontStyle: 'bold' }),
          align: 'center',
          wordWrap: { width: width - 46 },
        })
        .setOrigin(0.5);
      container.add(label);

      const check = this.add.text(width / 2 - 20, -height / 2 + 18, '✓', titleStyle(20, C.green)).setOrigin(0.5).setVisible(false);
      container.add(check);

      container.setSize(width, height);
      container.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
      container.input!.cursor = 'pointer';

      container.on(Phaser.Input.Events.POINTER_OVER, () => {
        if (this.locked) return;
        this.paintTopic(background, width, height, true);
        audio.play('hover');
      });
      container.on(Phaser.Input.Events.POINTER_OUT, () => {
        this.paintTopic(background, width, height, false, this.readTopics.has(topic.id));
      });
      container.on(Phaser.Input.Events.POINTER_UP, () => this.askTopic(topic));

      this.topicsLayer.add(container);
      this.topicButtons.push({ container, background, check, topic });
      popIn(this, container, index * 70);
    });
  }

  private paintTopic(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    hover: boolean,
    read = false,
  ): void {
    paintPanel(graphics, {
      width,
      height,
      radius: 18,
      fill: hover ? C.space500 : read ? C.space800 : C.space600,
      border: read ? C.green : hover ? C.amber : C.violetLight,
      borderWidth: hover ? 3 : 2.5,
      shadow: false,
    });
  }

  private askTopic(topic: DialogueTopic): void {
    if (this.locked || this.typewriter) return;

    audio.play('click');
    const wasNew = !this.readTopics.has(topic.id);
    this.readTopics.add(topic.id);

    const button = this.topicButtons.find((item) => item.topic.id === topic.id);
    if (button) {
      button.check.setVisible(true);
      this.paintTopic(button.background, CELL_WIDTH, TOPIC_HEIGHT, false, true);
    }

    if (wasNew) {
      this.award(POINTS.COLLECT, 300, 300, C.violetLight);
      this.setProgress(this.readTopics.size, DIALOGUE_TOPICS.length + this.validAgreements);
    }

    this.say(topic.lines.join('\n\n'), () => {
      if (wasNew && this.readTopics.size >= DIALOGUE_TOPICS.length) {
        Achievements.unlock(ACH.SCIENCE_FRIEND);
        this.time.delayedCall(600, () => this.startAgreements());
      }
    });
  }

  // ------------------------------------------------------------ combinados ---

  private startAgreements(): void {
    gameState.setObjective('Monte os Combinados da Missão com a turma');

    this.tweens.add({
      targets: this.topicsLayer,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.topicsLayer.setVisible(false);
        this.buildAgreements();
      },
    });

    this.say(
      'Agora me digam: o que uma equipe precisa fazer para que uma missão dê certo? Escolham apenas o que ajuda a nossa tripulação.',
    );
  }

  private buildAgreements(): void {
    this.agreementsLayer.setVisible(true).setAlpha(0);

    const options = Phaser.Utils.Array.Shuffle([...AGREEMENTS]);
    const columns = GRID_COLUMNS;
    const width = CELL_WIDTH;
    const height = AGREEMENT_HEIGHT;
    const gapX = CELL_GAP_X;
    const gapY = 10;
    const startX = GRID_LEFT + width / 2;
    const startY = AGREEMENT_TOP;

    options.forEach((option, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * (width + gapX);
      const y = startY + row * (height + gapY);

      const container = this.add.container(x, y);
      const background = this.add.graphics();
      paintPanel(background, {
        width,
        height,
        radius: 16,
        fill: C.space600,
        border: C.violetLight,
        borderWidth: 2.5,
        shadow: false,
      });
      container.add(background);
      container.add(this.add.text(-width / 2 + 28, 0, option.icon, { fontSize: '24px' }).setOrigin(0.5));
      container.add(
        this.add
          .text(-width / 2 + 50, 0, option.label, {
            ...bodyStyle(15, C.ink, { fontStyle: 'bold' }),
            wordWrap: { width: width - 66 },
          })
          .setOrigin(0, 0.5),
      );

      container.setSize(width, height);
      container.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
      container.input!.cursor = 'pointer';

      container.on(Phaser.Input.Events.POINTER_OVER, () => {
        if (this.locked || this.chosenAgreements.has(option.id)) return;
        this.tweens.add({ targets: container, scale: 1.04, duration: 120 });
        audio.play('hover');
      });
      container.on(Phaser.Input.Events.POINTER_OUT, () => {
        this.tweens.add({ targets: container, scale: 1, duration: 120 });
      });
      container.on(Phaser.Input.Events.POINTER_UP, () =>
        this.chooseAgreement(option, container, background, width, height),
      );

      this.agreementsLayer.add(container);
    });

    this.tweens.add({ targets: this.agreementsLayer, alpha: 1, duration: 420 });
  }

  private chooseAgreement(
    option: AgreementOption,
    container: Phaser.GameObjects.Container,
    background: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
  ): void {
    if (this.locked || this.chosenAgreements.has(option.id)) return;

    if (!option.valid) {
      // Sem punição: apenas provoca a reflexão proposta no material.
      audio.play('wrong');
      shake(this, container);
      this.say(option.feedback);
      gameState.toast('Será que isso ajuda a equipe?', '🤔');
      return;
    }

    this.chosenAgreements.add(option.id);
    container.disableInteractive();

    paintPanel(background, {
      width,
      height,
      radius: 16,
      fill: C.greenDark,
      border: C.green,
      borderWidth: 3,
      shadow: false,
    });

    audio.play('correct');
    burst(this, container.x, container.y, C.green, 14);
    this.award(POINTS.DISCOVERY, container.x, container.y - 40, C.green);
    this.say(option.feedback);
    this.setProgress(
      DIALOGUE_TOPICS.length + this.chosenAgreements.size,
      DIALOGUE_TOPICS.length + this.validAgreements,
    );

    if (this.chosenAgreements.size >= this.validAgreements) {
      Achievements.unlock(ACH.AGREEMENTS);
      this.time.delayedCall(900, () => this.giveBoardingPass());
    }
  }

  // ------------------------------------------------------ cartão de embarque ---

  private giveBoardingPass(): void {
    this.locked = true;
    this.typewriter?.stop();

    const dim = this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, C.space900, 0).setDepth(500);
    this.tweens.add({ targets: dim, fillAlpha: 0.85, duration: 420 });

    const pass = this.add.image(CX, CY - 20, TEX.BOARDING_PASS).setScale(0.05).setAngle(-14).setDepth(510);
    this.tweens.add({
      targets: pass,
      scale: 0.62,
      angle: 0,
      duration: 700,
      ease: 'Back.easeOut',
      onComplete: () => {
        audio.play('unlock');
        shockwave(this, CX, CY - 20, C.amber);
        burst(this, CX, CY - 20, C.amber, 26);
      },
    });

    this.time.delayedCall(760, () => {
      const name = this.add
        .text(CX - 44, CY - 62, gameState.playerName.toUpperCase(), titleStyle(26, 0x23306b))
        .setOrigin(0.5)
        .setDepth(520)
        .setAlpha(0);
      const role = this.add
        .text(CX - 44, CY - 32, 'TRIPULAÇÃO AUTORIZADA', bodyStyle(15, 0x6d76a3, { fontStyle: 'bold' }))
        .setOrigin(0.5)
        .setDepth(520)
        .setAlpha(0);
      this.tweens.add({ targets: [name, role], alpha: 1, duration: 420 });

      const message = this.add
        .text(CX, CY + 190, BOARDING_MESSAGE, {
          ...titleStyle(24, C.amber),
          align: 'center',
          wordWrap: { width: 760 },
        })
        .setOrigin(0.5)
        .setDepth(520);
      popIn(this, message);
    });

    this.time.delayedCall(2400, () =>
      this.completeLevel({
        bonus: 25,
        title: 'Cartão de embarque emitido!',
        body: 'Parabéns! Você está oficialmente preparado para conhecer a missão deste semestre. Uma nova porta se abre: 🚀 MISSÃO ESPAÇO.',
      }),
    );
  }
}
