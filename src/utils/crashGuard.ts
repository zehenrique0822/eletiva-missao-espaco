import { DomOverlay } from '@/ui/DomOverlay';

/**
 * Rede de segurança contra travamentos.
 *
 * O laço principal do Phaser reagenda o `requestAnimationFrame` **depois** de
 * executar o `update` das cenas. Se algum erro escapar dali, o agendamento não
 * acontece e o jogo congela em silêncio — cenário péssimo em sala de aula.
 *
 * Em vez da tela morta, mostramos um aviso claro com a opção de recarregar
 * (o progresso das fases concluídas já está salvo no navegador).
 */

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function installCrashGuard(): void {
  let reported = false;

  const report = (detail: string): void => {
    if (reported) return;
    reported = true;

    console.error('[Missão Espaço] erro não tratado:', detail);

    const card = DomOverlay.open(
      `
      <h2>🛠️ A missão precisou parar</h2>
      <p>Um problema inesperado interrompeu o jogo. <strong>As fases já concluídas continuam salvas</strong> —
      é só recarregar e usar o botão CONTINUAR no menu.</p>
      <p class="hint">Detalhe técnico: ${escapeHtml(detail).slice(0, 300)}</p>
      <div class="overlay-actions">
        <button class="btn" id="crash-reload">🔄 RECARREGAR O JOGO</button>
      </div>
    `,
    );

    card?.querySelector('#crash-reload')?.addEventListener('click', () => window.location.reload());
  };

  window.addEventListener('error', (event) => report(event.message || 'erro desconhecido'));
  window.addEventListener('unhandledrejection', (event) => report(String(event.reason)));
}
