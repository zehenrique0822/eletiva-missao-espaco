import Phaser from 'phaser';

/**
 * Serviço de áudio da missão.
 *
 * Estratégia em duas camadas:
 * 1. Se existir um arquivo carregado com a chave pedida (registrado em
 *    `AudioManifest.ts`), ele é tocado pelo gerenciador de som do Phaser.
 * 2. Caso contrário, o som é **sintetizado** em tempo real com a Web Audio API.
 *
 * Assim o jogo tem trilha e efeitos desde o primeiro segundo, sem nenhum asset,
 * e basta soltar arquivos na pasta de áudio para substituí-los.
 */

export type SoundKey =
  | 'click'
  | 'hover'
  | 'collect'
  | 'star'
  | 'correct'
  | 'wrong'
  | 'unlock'
  | 'achievement'
  | 'complete'
  | 'whoosh'
  | 'launch'
  | 'type';

interface ToneOptions {
  type?: OscillatorType;
  at?: number;
  attack?: number;
  decay?: number;
  gain?: number;
  sweepTo?: number;
}

/** Progressão harmônica suave usada na trilha ambiente (Am – F – C – G). */
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 261.63, 329.63],
  [196.0, 246.94, 293.66],
];

const BAR_SECONDS = 4;

class AudioService {
  private game?: Phaser.Game;
  private ctx?: AudioContext;
  private master?: GainNode;
  private sfxBus?: GainNode;
  private musicBus?: GainNode;
  private noiseBuffer?: AudioBuffer;

  private musicTimer?: number;
  private musicBar = 0;
  private musicWanted = false;
  private fileMusic?: Phaser.Sound.BaseSound;
  private muted = false;

  /** Guarda a instância do jogo (usada para tocar arquivos reais, quando houver). */
  init(game: Phaser.Game, muted: boolean): void {
    this.game = game;
    this.muted = muted;
    this.applyMute();
  }

  /**
   * Cria/retoma o AudioContext. Navegadores só permitem áudio depois de um
   * gesto do usuário, então isto é chamado no primeiro toque/clique.
   */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;

      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.85;
      this.sfxBus.connect(this.master);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.5;
      this.musicBus.connect(this.master);

      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
    }

    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.musicWanted) this.startMusic();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMute();
  }

  get isMuted(): boolean {
    return this.muted;
  }

  private applyMute(): void {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.05);
    }
    if (this.game) this.game.sound.mute = this.muted;
  }

  // ------------------------------------------------------------------ SFX ---

  play(key: SoundKey, volume = 1): void {
    if (this.muted) return;

    // 1) arquivo real, se disponível
    if (this.game?.cache.audio.exists(key)) {
      this.game.sound.play(key, { volume: 0.6 * volume });
      return;
    }

    // 2) síntese
    if (!this.ctx || !this.sfxBus) return;

    switch (key) {
      case 'click':
        this.tone(660, { type: 'square', gain: 0.14 * volume, decay: 0.07, sweepTo: 760 });
        break;

      case 'hover':
        this.tone(920, { type: 'sine', gain: 0.05 * volume, decay: 0.05 });
        break;

      case 'collect':
        this.tone(523.25, { type: 'sine', gain: 0.16 * volume, decay: 0.14, sweepTo: 1046.5 });
        this.tone(1318.5, { type: 'triangle', gain: 0.09 * volume, decay: 0.16, at: 0.07 });
        break;

      case 'star':
        this.tone(1318.5, { type: 'triangle', gain: 0.1 * volume, decay: 0.1 });
        this.tone(1760, { type: 'triangle', gain: 0.08 * volume, decay: 0.12, at: 0.06 });
        break;

      case 'correct':
        [523.25, 659.25, 783.99].forEach((freq, index) =>
          this.tone(freq, { type: 'sine', gain: 0.14 * volume, decay: 0.2, at: index * 0.075 }),
        );
        break;

      case 'wrong':
        this.tone(300, { type: 'triangle', gain: 0.12 * volume, decay: 0.28, sweepTo: 190 });
        break;

      case 'unlock':
        [392, 523.25, 659.25, 783.99].forEach((freq, index) =>
          this.tone(freq, { type: 'triangle', gain: 0.12 * volume, decay: 0.3, at: index * 0.08 }),
        );
        break;

      case 'achievement':
        this.tone(880, { type: 'sine', gain: 0.16 * volume, decay: 0.7 });
        this.tone(1320, { type: 'sine', gain: 0.09 * volume, decay: 0.6, at: 0.04 });
        this.tone(1760, { type: 'triangle', gain: 0.07 * volume, decay: 0.5, at: 0.18 });
        break;

      case 'complete':
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) =>
          this.tone(freq, { type: 'triangle', gain: 0.15 * volume, decay: 0.32, at: index * 0.11 }),
        );
        [523.25, 659.25, 783.99, 1046.5].forEach((freq) =>
          this.tone(freq, { type: 'sine', gain: 0.08 * volume, decay: 1.1, at: 0.46 }),
        );
        break;

      case 'whoosh':
        this.noise({ at: 0, duration: 0.36, gain: 0.16 * volume, from: 320, to: 2400 });
        break;

      case 'launch':
        this.noise({ at: 0, duration: 1.8, gain: 0.28 * volume, from: 180, to: 900, type: 'lowpass' });
        this.tone(72, { type: 'sawtooth', gain: 0.22 * volume, decay: 1.9, attack: 0.35 });
        this.tone(110, { type: 'triangle', gain: 0.12 * volume, decay: 1.6, attack: 0.5 });
        break;

      case 'type':
        this.tone(1150 + Math.random() * 220, { type: 'square', gain: 0.035 * volume, decay: 0.025 });
        break;
    }
  }

  // --------------------------------------------------------------- música ---

  startMusic(): void {
    this.musicWanted = true;

    if (this.game?.cache.audio.exists('music')) {
      if (!this.fileMusic) {
        this.fileMusic = this.game.sound.add('music', { loop: true, volume: 0.35 });
      }
      if (!this.fileMusic.isPlaying) this.fileMusic.play();
      return;
    }

    if (!this.ctx || this.musicTimer !== undefined) return;

    this.scheduleBar();
    this.musicTimer = window.setInterval(() => this.scheduleBar(), BAR_SECONDS * 1000);
  }

  stopMusic(): void {
    this.musicWanted = false;

    if (this.fileMusic?.isPlaying) this.fileMusic.stop();

    if (this.musicTimer !== undefined) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
  }

  /** Agenda um compasso da trilha: um acorde longo + um arpejo cintilante. */
  private scheduleBar(): void {
    if (!this.ctx || !this.musicBus || this.muted) return;

    const chord = CHORDS[this.musicBar % CHORDS.length];
    this.musicBar += 1;

    chord.forEach((freq, index) => {
      this.tone(freq, {
        type: 'triangle',
        gain: 0.05,
        attack: 1.1,
        decay: 2.9,
        at: index * 0.06,
      }, this.musicBus);
    });

    for (let step = 0; step < 4; step += 1) {
      const freq = chord[(step + this.musicBar) % chord.length] * 2;
      this.tone(freq, {
        type: 'sine',
        gain: 0.035,
        attack: 0.02,
        decay: 0.6,
        at: step * (BAR_SECONDS / 4) + 0.25,
      }, this.musicBus);
    }
  }

  // ------------------------------------------------------------- síntese ---

  /** Uma nota com envelope ADSR simplificado (ataque + decaimento exponencial). */
  private tone(freq: number, options: ToneOptions = {}, bus?: GainNode): void {
    if (!this.ctx) return;
    const dest = bus ?? this.sfxBus;
    if (!dest) return;

    const { type = 'sine', at = 0, attack = 0.008, decay = 0.25, gain = 0.15, sweepTo } = options;
    const start = this.ctx.currentTime + at;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (sweepTo !== undefined) osc.frequency.exponentialRampToValueAtTime(sweepTo, start + decay);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), start + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);

    osc.connect(env);
    env.connect(dest);
    osc.start(start);
    osc.stop(start + attack + decay + 0.05);
  }

  /** Ruído filtrado: base dos sons de vento, transição e propulsão. */
  private noise(options: {
    at: number;
    duration: number;
    gain: number;
    from: number;
    to: number;
    type?: BiquadFilterType;
  }): void {
    if (!this.ctx || !this.sfxBus || !this.noiseBuffer) return;

    const start = this.ctx.currentTime + options.at;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = options.type ?? 'bandpass';
    filter.Q.value = options.type === 'lowpass' ? 1 : 2.5;
    filter.frequency.setValueAtTime(options.from, start);
    filter.frequency.exponentialRampToValueAtTime(options.to, start + options.duration);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(options.gain, start + options.duration * 0.25);
    env.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);

    source.connect(filter);
    filter.connect(env);
    env.connect(this.sfxBus);
    source.start(start);
    source.stop(start + options.duration + 0.05);
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 1.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) channel[i] = Math.random() * 2 - 1;
    return buffer;
  }
}

/** Instância única usada por todas as cenas. */
export const audio = new AudioService();
