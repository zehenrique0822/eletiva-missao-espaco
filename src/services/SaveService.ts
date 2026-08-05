import { SAVE_KEY } from '@/config/constants';
import type { SaveData } from '@/types';

const SAVE_VERSION = 1;

/**
 * Persistência em localStorage.
 * Todo acesso é protegido: em navegadores com armazenamento bloqueado
 * (modo privado, quiosque escolar) o jogo continua funcionando sem salvar.
 */
export const SaveService = {
  available(): boolean {
    try {
      const probe = '__missao_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  },

  load(): SaveData | null {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as Partial<SaveData>;
      if (data.version !== SAVE_VERSION) return null;
      return {
        version: SAVE_VERSION,
        playerName: data.playerName ?? 'Tripulante',
        avatarId: data.avatarId ?? 'lab',
        score: data.score ?? 0,
        chapter: data.chapter ?? 1,
        completedChapters: data.completedChapters ?? [],
        achievements: data.achievements ?? [],
        archive: data.archive ?? {},
        muted: data.muted ?? false,
        updatedAt: data.updatedAt ?? Date.now(),
      };
    } catch {
      return null;
    }
  },

  save(data: Omit<SaveData, 'version' | 'updatedAt'>): void {
    try {
      const payload: SaveData = { ...data, version: SAVE_VERSION, updatedAt: Date.now() };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {
      /* armazenamento indisponível: a partida segue apenas em memória */
    }
  },

  clear(): void {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* nada a fazer */
    }
  },
};
