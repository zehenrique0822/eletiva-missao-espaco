import Phaser from 'phaser';
import { EVENTS, MAX_ENERGY, TOTAL_CHAPTERS } from '@/config/constants';
import { SaveService } from './SaveService';

/**
 * Estado global da partida.
 *
 * É também o barramento de eventos entre a fase em execução e o HUD:
 * as cenas alteram o estado, o HUD apenas escuta. Isso mantém a interface
 * desacoplada das regras de cada fase.
 */
class GameState extends Phaser.Events.EventEmitter {
  playerName = 'Tripulante';
  avatarId = 'lab';
  score = 0;
  energy = MAX_ENERGY;
  chapter = 1;
  muted = false;

  readonly completedChapters = new Set<number>();
  readonly achievements = new Set<string>();
  /** Respostas registradas no Arquivo Confidencial (Capítulo 1). */
  archive: Record<string, string> = {};

  /** Texto do objetivo atual, exibido no HUD. */
  objective = '';
  /** Progresso da fase atual (0..1). */
  levelProgress = 0;
  /** Marca se o jogador perdeu energia na fase atual (conquista "Voo Impecável"). */
  damagedThisLevel = false;

  private loadedFromSave = false;

  // ----------------------------------------------------------------- save ---

  /** Carrega o save; devolve `true` quando existe partida para continuar. */
  loadFromStorage(): boolean {
    const data = SaveService.load();
    if (!data) return false;

    this.playerName = data.playerName;
    this.avatarId = data.avatarId;
    this.score = data.score;
    this.chapter = Phaser.Math.Clamp(data.chapter, 1, TOTAL_CHAPTERS);
    this.completedChapters.clear();
    data.completedChapters.forEach((chapter) => this.completedChapters.add(chapter));
    this.achievements.clear();
    data.achievements.forEach((id) => this.achievements.add(id));
    this.archive = { ...data.archive };
    this.muted = data.muted;
    this.energy = MAX_ENERGY;
    this.loadedFromSave = true;
    return true;
  }

  get hasSave(): boolean {
    return this.loadedFromSave || this.completedChapters.size > 0;
  }

  save(): void {
    SaveService.save({
      playerName: this.playerName,
      avatarId: this.avatarId,
      score: this.score,
      chapter: this.chapter,
      completedChapters: [...this.completedChapters],
      achievements: [...this.achievements],
      archive: this.archive,
      muted: this.muted,
    });
    this.loadedFromSave = true;
  }

  /** Zera a partida mantendo apenas as preferências (áudio). */
  resetProgress(): void {
    this.score = 0;
    this.energy = MAX_ENERGY;
    this.chapter = 1;
    this.completedChapters.clear();
    this.achievements.clear();
    this.archive = {};
    this.objective = '';
    this.levelProgress = 0;
    this.damagedThisLevel = false;
    this.loadedFromSave = false;
    SaveService.clear();
    this.emit(EVENTS.SCORE_CHANGED, this.score);
    this.emit(EVENTS.ENERGY_CHANGED, this.energy);
    this.emit(EVENTS.PROGRESS_CHANGED, this.levelProgress);
  }

  // ---------------------------------------------------------------- score ---

  addScore(amount: number): void {
    this.score = Math.max(0, this.score + amount);
    this.emit(EVENTS.SCORE_CHANGED, this.score, amount);
  }

  // --------------------------------------------------------------- energia ---

  /** Consome energia. Devolve `true` quando a energia acabou. */
  loseEnergy(amount = 1): boolean {
    this.energy = Math.max(0, this.energy - amount);
    this.damagedThisLevel = true;
    this.emit(EVENTS.ENERGY_CHANGED, this.energy, -amount);
    return this.energy <= 0;
  }

  gainEnergy(amount = 1): void {
    if (this.energy >= MAX_ENERGY) return;
    this.energy = Math.min(MAX_ENERGY, this.energy + amount);
    this.emit(EVENTS.ENERGY_CHANGED, this.energy, amount);
  }

  refillEnergy(): void {
    this.energy = MAX_ENERGY;
    this.emit(EVENTS.ENERGY_CHANGED, this.energy, MAX_ENERGY);
  }

  // -------------------------------------------------------------- progresso ---

  startChapter(chapter: number): void {
    this.chapter = chapter;
    this.levelProgress = 0;
    this.damagedThisLevel = false;
    this.refillEnergy();
    this.emit(EVENTS.PROGRESS_CHANGED, 0);
  }

  setObjective(text: string): void {
    this.objective = text;
    this.emit(EVENTS.OBJECTIVE_CHANGED, text);
  }

  setLevelProgress(value: number): void {
    this.levelProgress = Phaser.Math.Clamp(value, 0, 1);
    this.emit(EVENTS.PROGRESS_CHANGED, this.levelProgress);
  }

  completeChapter(chapter: number): void {
    this.completedChapters.add(chapter);
    this.chapter = Math.min(chapter + 1, TOTAL_CHAPTERS);
    this.setLevelProgress(1);
    this.save();
  }

  /** Progresso geral da missão (0..1), usado na barra do HUD e no menu. */
  get missionProgress(): number {
    return this.completedChapters.size / TOTAL_CHAPTERS;
  }

  get isMissionComplete(): boolean {
    return this.completedChapters.size >= TOTAL_CHAPTERS;
  }

  // ------------------------------------------------------------------ áudio ---

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.emit(EVENTS.MUTE_CHANGED, muted);
    this.save();
  }

  // ------------------------------------------------------------------ toast ---

  /** Mensagem flutuante de incentivo (o HudScene desenha). */
  toast(text: string, icon = '✨'): void {
    this.emit(EVENTS.TOAST, text, icon);
  }
}

/** Instância única compartilhada por todas as cenas. */
export const gameState = new GameState();
