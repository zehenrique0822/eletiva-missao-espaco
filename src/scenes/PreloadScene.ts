import Phaser from 'phaser';
import { AUDIO_MANIFEST } from '@/config/AudioManifest';
import { CX, CY, GEN, SCENES, TEX } from '@/config/constants';
import { C, bodyStyle, titleStyle } from '@/config/theme';
import { ProgressBar } from '@/ui/ProgressBar';

interface SvgAsset {
  key: string;
  file: string;
  width: number;
  height: number;
}

/**
 * Ilustrações vetoriais do jogo.
 * São rasterizadas no dobro do tamanho de exibição, o que mantém as bordas
 * nítidas em telas de alta densidade (tablets e celulares).
 */
const SVG_ASSETS: SvgAsset[] = [
  { key: TEX.ASTRONAUT, file: 'astronaut.svg', width: 256, height: 256 },
  { key: TEX.ROCKET, file: 'rocket.svg', width: 256, height: 360 },
  { key: TEX.PROFESSORA, file: 'professora.svg', width: 400, height: 520 },
  { key: TEX.EARTH, file: 'earth.svg', width: 448, height: 448 },
  { key: TEX.PLANET, file: 'planet-ring.svg', width: 440, height: 300 },
  { key: TEX.SATELLITE, file: 'satellite.svg', width: 400, height: 240 },
  { key: TEX.STAR, file: 'star.svg', width: 192, height: 192 },
  { key: TEX.ORB, file: 'orb-question.svg', width: 192, height: 192 },
  { key: TEX.GEM, file: 'gem.svg', width: 192, height: 192 },
  { key: TEX.METEOR, file: 'meteor.svg', width: 192, height: 192 },
  { key: TEX.COLLECTOR, file: 'collector.svg', width: 400, height: 220 },
  { key: TEX.ENVELOPE, file: 'envelope.svg', width: 480, height: 320 },
  { key: TEX.DOOR, file: 'door.svg', width: 360, height: 520 },
  { key: TEX.BOARDING_PASS, file: 'boarding-pass.svg', width: 840, height: 440 },
  { key: TEX.OBJ_LUPA, file: 'obj-lupa.svg', width: 240, height: 240 },
  { key: TEX.OBJ_TELESCOPIO, file: 'obj-telescopio.svg', width: 240, height: 240 },
  { key: TEX.OBJ_BUSSOLA, file: 'obj-bussola.svg', width: 240, height: 240 },
  { key: TEX.OBJ_FOLHA, file: 'obj-folha.svg', width: 240, height: 240 },
  { key: TEX.OBJ_MICROSCOPIO, file: 'obj-microscopio.svg', width: 240, height: 240 },
  { key: TEX.OBJ_ROCHA, file: 'obj-rocha.svg', width: 240, height: 240 },
  { key: TEX.SCI_LAB, file: 'sci-lab.svg', width: 240, height: 240 },
  { key: TEX.SCI_NATUREZA, file: 'sci-natureza.svg', width: 240, height: 240 },
  { key: TEX.SCI_ESPACO, file: 'sci-espaco.svg', width: 240, height: 240 },
  { key: TEX.SCI_ENGENHARIA, file: 'sci-engenharia.svg', width: 240, height: 240 },
];

/** Carrega os assets exibindo uma barra de progresso temática. */
export class PreloadScene extends Phaser.Scene {
  private bar?: ProgressBar;

  constructor() {
    super(SCENES.PRELOAD);
  }

  preload(): void {
    this.buildLoadingScreen();

    SVG_ASSETS.forEach((asset) => {
      this.load.svg(asset.key, `assets/svg/${asset.file}`, {
        width: asset.width,
        height: asset.height,
      });
    });

    AUDIO_MANIFEST.forEach((entry) => this.load.audio(entry.key, entry.urls));

    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      this.bar?.setValue(value, false);
    });

    // Um asset ausente não pode derrubar a aula: apenas registramos o aviso.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      console.warn(`[Missão Espaço] Não foi possível carregar: ${file.key}`);
    });
  }

  create(): void {
    this.scene.start(SCENES.MENU);
  }

  private buildLoadingScreen(): void {
    this.add.rectangle(CX, CY, this.scale.width, this.scale.height, C.space900);

    const halo = this.add
      .image(CX, CY - 40, GEN.GLOW)
      .setDisplaySize(520, 520)
      .setTint(C.violet)
      .setAlpha(0.35)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: halo,
      alpha: 0.6,
      scale: halo.scale * 1.1,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const rocket = this.add.text(CX, CY - 70, '🚀', { fontSize: '72px' }).setOrigin(0.5);
    this.tweens.add({
      targets: rocket,
      y: rocket.y - 18,
      angle: 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(CX, CY + 30, 'MISSÃO ESPAÇO', titleStyle(38, C.ink)).setOrigin(0.5);
    this.add
      .text(CX, CY + 70, 'preparando os instrumentos científicos…', bodyStyle(17, C.inkMuted))
      .setOrigin(0.5);

    this.bar = new ProgressBar(this, CX, CY + 120, {
      width: 420,
      height: 18,
      color: C.cyan,
    });
  }
}
