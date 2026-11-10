import { Screen } from './Screen';
import { WEIGHT_CLASSES, findWeightClass } from '../data/weight-classes';
import { createFighter, FighterProfile, fighterDisplayName, fighterRecord } from '../data/fighter';
import { loadFighter, saveFighter } from '../data/storage';

export interface CareerScreenOptions {
  onBack: () => void;
  onContinue: () => void;
}

type CareerView = 'create' | 'dashboard' | 'profile';

export class CareerScreen extends Screen {
  private readonly options: CareerScreenOptions;
  private root: HTMLElement | null = null;
  private view: CareerView = 'create';

  // Form elements
  private inputFirstName: HTMLInputElement | null = null;
  private inputLastName: HTMLInputElement | null = null;
  private inputHeight: HTMLInputElement | null = null;
  private selectWeight: HTMLSelectElement | null = null;
  private errorEl: HTMLElement | null = null;

  constructor(options: CareerScreenOptions) {
    super();
    this.options = options;
  }

  show(): void {
    const container = this.container;
    if (!container) return;
    this.clearContainer();

    // If a fighter already exists, open the dashboard; otherwise the creator.
    const existing = loadFighter();
    this.view = existing ? 'dashboard' : 'create';
    this.render(container, existing);
  }

  private render(container: HTMLElement, existing?: FighterProfile | null): void {
    this.root = document.createElement('div');
    this.root.className = 'screen career-screen';

    const header = document.createElement('div');
    header.className = 'career-header';
    const title = document.createElement('div');
    title.className = 'career-title';
    title.textContent = this.view === 'create' ? 'CREATE FIGHTER' : 'CAREER';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'career-back';
    back.textContent = 'BACK';
    back.addEventListener('click', () => this.options.onBack());
    header.appendChild(title);
    header.appendChild(back);

    const content = document.createElement('div');
    content.className = 'career-content';

    if (this.view === 'create') {
      content.appendChild(this.buildCreateForm());
    } else if (this.view === 'dashboard' && existing) {
      content.appendChild(this.buildDashboard(existing));
    } else {
      content.appendChild(this.buildProfile(existing!));
    }

    this.root.appendChild(header);
    this.root.appendChild(content);
    container.appendChild(this.root);
  }

  private buildCreateForm(): HTMLElement {
    const form = document.createElement('form');
    form.className = 'fighter-form';
    form.noValidate = true;

    const grid = document.createElement('div');
    grid.className = 'form-grid';

    const field = (label: string, input: HTMLElement, hint?: string) => {
      const wrap = document.createElement('div');
      wrap.className = 'form-field';
      const lab = document.createElement('label');
      lab.className = 'form-label';
      lab.textContent = label;
      wrap.appendChild(lab);
      wrap.appendChild(input);
      if (hint) {
        const h = document.createElement('div');
        h.className = 'form-hint';
        h.textContent = hint;
        wrap.appendChild(h);
      }
      grid.appendChild(wrap);
    };

    this.inputFirstName = document.createElement('input');
    this.inputFirstName.type = 'text';
    this.inputFirstName.placeholder = 'e.g. Muhammad';
    this.inputFirstName.maxLength = 24;

    this.inputLastName = document.createElement('input');
    this.inputLastName.type = 'text';
    this.inputLastName.placeholder = 'e.g. Ali';
    this.inputLastName.maxLength = 24;

    this.inputHeight = document.createElement('input');
    this.inputHeight.type = 'number';
    this.inputHeight.min = '150';
    this.inputHeight.max = '220';
    this.inputHeight.value = '185';

    this.selectWeight = document.createElement('select');
    this.selectWeight.className = 'form-select';
    for (const wc of WEIGHT_CLASSES) {
      const opt = document.createElement('option');
      opt.value = wc.id;
      opt.textContent = `${wc.name} (${wc.maxWeightKg === Infinity ? '200+' : wc.maxWeightKg} kg)`;
      this.selectWeight.appendChild(opt);
    }

    this.errorEl = document.createElement('div');
    this.errorEl.className = 'form-error';
    this.errorEl.style.display = 'none';

    field('First Name', this.inputFirstName);
    field('Last Name', this.inputLastName);
    field('Height (cm)', this.inputHeight, '150 - 220 cm');
    field('Weight Class', this.selectWeight, 'Official professional class');

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'form-submit';
    submit.textContent = 'CREATE FIGHTER';

    form.appendChild(grid);
    form.appendChild(this.errorEl);
    form.appendChild(submit);

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      this.handleCreate();
    });

    return form;
  }

  private handleCreate(): void {
    if (!this.errorEl) return;
    this.errorEl.style.display = 'none';

    const firstName = this.inputFirstName?.value.trim() ?? '';
    const lastName = this.inputLastName?.value.trim() ?? '';
    const heightCm = parseFloat(this.inputHeight?.value ?? '');
    const weightClassId = this.selectWeight?.value ?? '';

    if (!firstName || !lastName) {
      this.showError('First and last name are required.');
      return;
    }
    if (!heightCm || heightCm < 150 || heightCm > 220) {
      this.showError('Height must be between 150 and 220 cm.');
      return;
    }
    if (!weightClassId) {
      this.showError('Please select a weight class.');
      return;
    }

    const wc = findWeightClass(weightClassId);
    if (!wc) {
      this.showError('Invalid weight class.');
      return;
    }

    const weightKg = wc.maxWeightKg === Infinity ? 110 : wc.maxWeightKg;

    const fighter = createFighter({
      firstName,
      lastName,
      heightCm,
      weightClassId,
      weightKg,
    });

    saveFighter(fighter);
    this.view = 'dashboard';
    const container = this.container;
    if (container) this.render(container, fighter);
  }

  private showError(msg: string): void {
    if (!this.errorEl) return;
    this.errorEl.textContent = msg;
    this.errorEl.style.display = 'block';
  }

  private buildDashboard(fighter: FighterProfile): HTMLElement {
    const dash = document.createElement('div');
    dash.className = 'career-dashboard';

    const card = document.createElement('div');
    card.className = 'fighter-card';

    const name = document.createElement('div');
    name.className = 'fighter-name';
    name.textContent = fighterDisplayName(fighter);

    const record = document.createElement('div');
    record.className = 'fighter-record';
    record.textContent = `Record: ${fighterRecord(fighter)}  |  Rank: #${fighter.rank}`;

    const stats = document.createElement('div');
    stats.className = 'fighter-stats';
    const wc = findWeightClass(fighter.weightClassId);
    stats.innerHTML = `
      <div class="stat"><div class="stat-value">${fighter.heightCm} cm</div><div class="stat-label">Height</div></div>
      <div class="stat"><div class="stat-value">${fighter.weightKg} kg</div><div class="stat-label">Weight</div></div>
      <div class="stat"><div class="stat-value">${wc ? wc.name : '—'}</div><div class="stat-label">Class</div></div>
      <div class="stat"><div class="stat-value">${fighter.knockoutWins}</div><div class="stat-label">KOs</div></div>
    `;

    const actions = document.createElement('div');
    actions.className = 'career-actions';

    const viewProfile = document.createElement('button');
    viewProfile.type = 'button';
    viewProfile.className = 'career-btn';
    viewProfile.textContent = 'VIEW PROFILE';
    viewProfile.addEventListener('click', () => {
      this.view = 'profile';
      const container = this.container;
      if (container) this.render(container, fighter);
    });

    const continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'career-btn career-btn-accent';
    continueBtn.textContent = 'CONTINUE';
    continueBtn.addEventListener('click', () => {
      this.options.onContinue();
    });

    const newFighter = document.createElement('button');
    newFighter.type = 'button';
    newFighter.className = 'career-btn career-btn-ghost';
    newFighter.textContent = 'CREATE NEW FIGHTER';
    newFighter.addEventListener('click', () => {
      this.view = 'create';
      const container = this.container;
      if (container) this.render(container);
    });

    actions.appendChild(viewProfile);
    actions.appendChild(continueBtn);
    actions.appendChild(newFighter);

    card.appendChild(name);
    card.appendChild(record);
    card.appendChild(stats);
    card.appendChild(actions);
    dash.appendChild(card);

    return dash;
  }

  private buildProfile(fighter: FighterProfile): HTMLElement {
    const profile = document.createElement('div');
    profile.className = 'career-profile';

    const card = document.createElement('div');
    card.className = 'fighter-card';

    const name = document.createElement('div');
    name.className = 'fighter-name';
    name.textContent = fighterDisplayName(fighter);

    const record = document.createElement('div');
    record.className = 'fighter-record';
    record.textContent = `Record: ${fighterRecord(fighter)}  |  Rank: #${fighter.rank}  |  KOs: ${fighter.knockoutWins}`;

    const details = document.createElement('div');
    details.className = 'profile-details';
    const wc = findWeightClass(fighter.weightClassId);
    details.innerHTML = `
      <div><div class="detail-label">First Name</div><div class="detail-value">${fighter.firstName}</div></div>
      <div><div class="detail-label">Last Name</div><div class="detail-value">${fighter.lastName}</div></div>
      <div><div class="detail-label">Height</div><div class="detail-value">${fighter.heightCm} cm</div></div>
      <div><div class="detail-label">Weight</div><div class="detail-value">${fighter.weightKg} kg</div></div>
      <div><div class="detail-label">Weight Class</div><div class="detail-value">${wc ? wc.name : '—'}</div></div>
      <div><div class="detail-label">Wins</div><div class="detail-value">${fighter.wins}</div></div>
      <div><div class="detail-label">Losses</div><div class="detail-value">${fighter.losses}</div></div>
      <div><div class="detail-label">Draws</div><div class="detail-value">${fighter.draws}</div></div>
      <div><div class="detail-label">Created</div><div class="detail-value">${new Date(fighter.createdAt).toLocaleDateString()}</div></div>
    `;

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'career-btn career-btn-ghost';
    back.textContent = 'BACK TO DASHBOARD';
    back.addEventListener('click', () => {
      this.view = 'dashboard';
      const container = this.container;
      if (container) this.render(container, fighter);
    });

    card.appendChild(name);
    card.appendChild(record);
    card.appendChild(details);
    card.appendChild(back);
    profile.appendChild(card);

    return profile;
  }

  hide(): Promise<void> {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.inputFirstName = null;
    this.inputLastName = null;
    this.inputHeight = null;
    this.selectWeight = null;
    this.errorEl = null;
    return Promise.resolve();
  }

  destroy(): void {
    this.hide();
  }
}
