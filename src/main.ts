import Phaser from 'phaser';
import './styles/main.css';
import { gameConfig } from '@/config/GameConfig';
import { audio } from '@/services/AudioService';
import { gameState } from '@/services/GameState';
import { installCrashGuard } from '@/utils/crashGuard';

/**
 * Ponto de entrada.
 * Espera as fontes carregarem (para o Phaser medir o texto corretamente),
 * cria o jogo e cuida do aviso de orientação em celulares.
 */

/** Aguarda as fontes com um limite de tempo — nunca trava o carregamento. */
async function waitForFonts(timeout = 2500): Promise<void> {
  if (!('fonts' in document)) return;
  await Promise.race([
    document.fonts.ready,
    new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
  ]);
}

/** Mostra o aviso "gire o aparelho" em telas estreitas em modo retrato. */
function watchOrientation(): void {
  const hint = document.getElementById('rotate-hint');
  if (!hint) return;

  const update = (): void => {
    const portrait = window.innerHeight > window.innerWidth;
    const small = Math.min(window.innerWidth, window.innerHeight) < 520;
    hint.hidden = !(portrait && small);
  };

  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', () => window.setTimeout(update, 250));
}

function hideSplash(): void {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;
  splash.classList.add('hidden');
  window.setTimeout(() => splash.remove(), 600);
}

async function bootstrap(): Promise<void> {
  installCrashGuard();
  await waitForFonts();

  const game = new Phaser.Game(gameConfig);

  // O estado é carregado aqui para que a preferência de áudio já valha no boot.
  gameState.loadFromStorage();
  audio.init(game, gameState.muted);

  // Qualquer gesto do usuário libera o áudio (política dos navegadores).
  const unlockAudio = (): void => audio.unlock();
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  game.events.once(Phaser.Core.Events.READY, hideSplash);
  // Rede de segurança: a splash nunca pode ficar presa sobre o jogo.
  window.setTimeout(hideSplash, 6000);

  watchOrientation();
}

void bootstrap();
