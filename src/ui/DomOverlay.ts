/**
 * Camada HTML sobreposta ao canvas.
 *
 * Usada apenas onde o DOM é claramente melhor que o canvas:
 * - entrada de texto (nome da tripulação), com teclado nativo no celular;
 * - Termo de Compromisso, que precisa ser selecionável e imprimível.
 */

function layer(): HTMLElement | null {
  return document.getElementById('ui-layer');
}

export const DomOverlay = {
  /** Abre a camada com o HTML informado e devolve o cartão criado. */
  open(html: string, cardClass = ''): HTMLElement | null {
    const root = layer();
    if (!root) return null;

    root.innerHTML = `<div class="overlay-card ${cardClass}" role="dialog" aria-modal="true">${html}</div>`;
    root.classList.add('active');
    return root.firstElementChild as HTMLElement;
  },

  close(): void {
    const root = layer();
    if (!root) return;
    root.classList.remove('active');
    root.innerHTML = '';
  },

  get isOpen(): boolean {
    return layer()?.classList.contains('active') ?? false;
  },
};
