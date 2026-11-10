import { Screen } from './Screen';

export interface MainMenuScreenOptions {
  onCareer: () => void;
  onFightNow: () => void;
  onBoxerProfile: () => void;
  onSettings: () => void;
}

export class MainMenuScreen extends Screen {
  private readonly options: MainMenuScreenOptions;
  private root: HTMLElement | null = null;

  constructor(options: MainMenuScreenOptions) {
    super();
    this.options = options;
  }

  show(): void {
    const container = this.container;
    if (!container) return;
    this.clearContainer();

    this.root = document.createElement('div');
    this.root.className = 'screen menu-screen';

    const header = document.createElement('div');
    header.className = 'menu-header';

    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'PREMIUM BOXING';

    const ring = document.createElement('div');
    ring.className = 'menu-subtitle';
    ring.textContent = 'THE RING';

    header.appendChild(title);
    header.appendChild(ring);

    const buttons = document.createElement('div');
    buttons.className = 'menu-buttons';

    const addButton = (label: string, onClick: () => void, accent = false) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `menu-btn${accent ? ' menu-btn-accent' : ''}`;
      btn.textContent = label;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        onClick();
      });
      // Support touch
      btn.addEventListener('touchstart', () => {}, { passive: true });
      buttons.appendChild(btn);
    };

    addButton('CAREER MODE', () => this.options.onCareer());
    addButton('FIGHT NOW', () => this.options.onFightNow());
    addButton('BOXER PROFILE', () => this.options.onBoxerProfile());
    addButton('SETTINGS', () => this.options.onSettings(), true);

    const footer = document.createElement('div');
    footer.className = 'menu-footer';
    footer.textContent = 'PlayCanvas  WebGL 2  PBR';

    this.root.appendChild(header);
    this.root.appendChild(buttons);
    this.root.appendChild(footer);
    container.appendChild(this.root);
  }

  hide(): Promise<void> {
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    return Promise.resolve();
  }

  destroy(): void {
    this.hide();
  }
}
