import { EVENTS } from '@/config/constants';
import { ACH, ACHIEVEMENTS_FOR_COMPLETION, getAchievement } from '@/data/achievements';
import { gameState } from './GameState';

/**
 * Regras de conquistas.
 * As cenas apenas informam o que aconteceu; as conquistas derivadas
 * (pontuação acumulada, missão 100%) são verificadas aqui.
 */
export const Achievements = {
  /** Desbloqueia uma conquista. Devolve `true` se foi a primeira vez. */
  unlock(id: string): boolean {
    if (gameState.achievements.has(id)) return false;

    gameState.achievements.add(id);
    gameState.save();

    const achievement = getAchievement(id);
    if (achievement) gameState.emit(EVENTS.ACHIEVEMENT_UNLOCKED, achievement);

    this.checkDerived();
    return true;
  },

  has(id: string): boolean {
    return gameState.achievements.has(id);
  },

  /** Conquistas que dependem de acúmulo, avaliadas a cada desbloqueio/pontuação. */
  checkDerived(): void {
    if (gameState.score >= 400) this.unlock(ACH.STAR_COLLECTOR);

    const unlockedWithoutFinal = [...gameState.achievements].filter(
      (id) => id !== ACH.FULL_MISSION,
    ).length;
    if (unlockedWithoutFinal >= ACHIEVEMENTS_FOR_COMPLETION) this.unlock(ACH.FULL_MISSION);
  },

  get total(): number {
    return gameState.achievements.size;
  },
};

/** Reavalia conquistas por pontuação sempre que o placar muda. */
gameState.on(EVENTS.SCORE_CHANGED, () => Achievements.checkDerived());
