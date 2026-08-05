import { AVATARS } from '@/data/arquivo';
import { TERMO } from '@/data/missao';
import { DomOverlay } from './DomOverlay';

/** Impede que texto digitado pelo estudante seja interpretado como HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface CrewFormResult {
  name: string;
  avatarId: string;
}

/**
 * Formulário de criação da tripulação (nome + avatar).
 * Corresponde aos campos "Nome" e "Desenhe como você imagina um cientista"
 * do Arquivo Confidencial da Missão.
 */
export function openCrewForm(
  defaults: CrewFormResult,
  onConfirm: (result: CrewFormResult) => void,
  onCancel?: () => void,
): void {
  const avatarsHtml = AVATARS.map(
    (avatar) => `
      <div class="avatar-option${avatar.id === defaults.avatarId ? ' selected' : ''}" data-avatar="${avatar.id}">
        <img src="assets/svg/${avatar.file}" alt="${avatar.label}" />
        <span>${avatar.label}</span>
      </div>`,
  ).join('');

  const card = DomOverlay.open(
    `
    <h2>🚀 REGISTRO DA TRIPULAÇÃO</h2>
    <p>Toda missão começa conhecendo quem fará parte dela. Preencha seu registro para embarcar.</p>

    <div class="field">
      <label for="crew-name">Nome do(a) tripulante</label>
      <input id="crew-name" type="text" maxlength="24" autocomplete="off" spellcheck="false"
             value="${escapeHtml(defaults.name === 'Tripulante' ? '' : defaults.name)}"
             placeholder="Digite seu nome" />
      <p class="hint">Se preferir, pode usar apenas o primeiro nome.</p>
    </div>

    <div class="field">
      <label>Como você imagina um cientista?</label>
      <div class="avatar-grid">${avatarsHtml}</div>
    </div>

    <div class="overlay-actions">
      <button class="btn" id="crew-confirm">EMBARCAR NA MISSÃO</button>
      <button class="btn secondary" id="crew-cancel">Voltar</button>
    </div>
  `,
  );

  if (!card) {
    onConfirm(defaults);
    return;
  }

  let avatarId = defaults.avatarId;
  const input = card.querySelector<HTMLInputElement>('#crew-name');

  card.querySelectorAll<HTMLElement>('.avatar-option').forEach((option) => {
    option.addEventListener('click', () => {
      card.querySelectorAll('.avatar-option').forEach((other) => other.classList.remove('selected'));
      option.classList.add('selected');
      avatarId = option.dataset.avatar ?? avatarId;
    });
  });

  const confirm = () => {
    const name = (input?.value ?? '').trim().slice(0, 24) || 'Tripulante';
    DomOverlay.close();
    onConfirm({ name, avatarId });
  };

  card.querySelector('#crew-confirm')?.addEventListener('click', confirm);
  card.querySelector('#crew-cancel')?.addEventListener('click', () => {
    DomOverlay.close();
    onCancel?.();
  });

  input?.addEventListener('keydown', (event) => {
    if ((event as KeyboardEvent).key === 'Enter') confirm();
  });

  window.setTimeout(() => input?.focus(), 120);
}

/**
 * Termo de Compromisso — documento final, idêntico ao impresso entregue
 * aos estudantes, com marcação dos compromissos e opção de impressão/PDF.
 */
export function openTermo(playerName: string, onClose: () => void): void {
  const today = new Date();
  const date = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const commitments = TERMO.commitments
    .map(
      (text, index) => `
      <li data-index="${index}">
        <input type="checkbox" id="commit-${index}" />
        <label for="commit-${index}">${text}</label>
      </li>`,
    )
    .join('');

  const card = DomOverlay.open(
    `
    <div class="termo-head">
      <p class="kicker">${TERMO.kicker}</p>
      <h2>${TERMO.title}</h2>
      <p><strong>${TERMO.subtitle}</strong></p>
    </div>

    ${TERMO.intro.map((paragraph) => `<p>${paragraph}</p>`).join('')}

    <h3>${TERMO.commitmentsTitle}</h3>
    <ul class="commitments">${commitments}</ul>

    <h3>${TERMO.declarationTitle}</h3>
    <p>${TERMO.declaration}</p>

    <div class="signature">
      <div class="line">${escapeHtml(playerName)}<small>Nome</small></div>
      <div class="line">&nbsp;<small>Turma</small></div>
      <div class="line">${date}<small>Data</small></div>
      <div class="line">&nbsp;<small>Assinatura</small></div>
    </div>

    <div class="quote">${TERMO.quote}<br /><strong>${TERMO.farewell}</strong></div>

    <div class="overlay-actions no-print">
      <button class="btn" id="termo-print">🖨️ IMPRIMIR / SALVAR PDF</button>
      <button class="btn secondary" id="termo-close">Voltar ao menu</button>
    </div>
  `,
    'termo',
  );

  if (!card) {
    onClose();
    return;
  }

  card.querySelectorAll<HTMLLIElement>('.commitments li').forEach((item) => {
    const checkbox = item.querySelector<HTMLInputElement>('input');
    const sync = () => item.classList.toggle('checked', Boolean(checkbox?.checked));
    checkbox?.addEventListener('change', sync);
  });

  card.querySelector('#termo-print')?.addEventListener('click', () => window.print());
  card.querySelector('#termo-close')?.addEventListener('click', () => {
    DomOverlay.close();
    onClose();
  });
}
