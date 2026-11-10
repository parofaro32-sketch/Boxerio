import { Screen } from './Screen';

export interface LoadingScreenOptions {
  onComplete: () => void;
  durationMs?: number;
}

export class LoadingScreen extends Screen {
  private readonly options: LoadingScreenOptions;
  private root: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressText: HTMLElement | null = null;
  private startTime = 0;
  private rafId: number = 0;
  private completed = false;

  constructor(options: LoadingScreenOptions) {
    super();
    this.options = options;
  }

  show(): void {
    const container = this.container;
    if (!container) return;
    this.clearContainer();

    this.root = document.createElement('div');
    this.root.className = 'screen loading-screen';

    const inner = document.createElement('div');
    inner.className = 'loading-inner';

    const title = document.createElement('div');
    title.className = 'loading-title';
    title.textContent = 'PREMIUM BOXING';

    const subtitle = document.createElement('div');
    subtitle.className = 'loading-subtitle';
    subtitle.textContent = 'Initializing engine...';

    const track = document.createElement('div');
    track.className = 'progress-track';

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'progress-bar';

    this.progressText = document.createElement('div');
    this.progressText.className = 'progress-text';
    this.progressText.textContent = '0%';

    track.appendChild(this.progressBar);
    inner.appendChild(title);
    inner.appendChild(subtitle);
    inner.appendChild(track);
    inner.appendChild(this.progressText);
    this.root.appendChild(inner);
    container.appendChild(this.root);

    this.startTime = performance.now();
    this.animate();
  }

  private animate(): void {
    const duration = this.options.durationMs ?? 1200;
    const elapsed = performance.now() - this.startTime;
    let p = Math.min(elapsed / duration, 1);
    // ease out
    p = 1 - Math.pow(1 - p, 3);

    const percent = Math.round(p * 100);
    if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    if (this.progressText) this.progressText.textContent = `${percent}%`;

    if (p < 1 && !this.completed) {
      this.rafId = requestAnimationFrame(() => this.animate());
    } else if (!this.completed) {
      this.completed = true;
      this.options.onComplete();
    }
  }

  hide(): Promise<void> {
    this.completed = true;
    cancelAnimationFrame(this.rafId);
    return new Promise((resolve) => {
      if (this.root) {
        this.root.style.transition = 'opacity 0.3s ease';
        this.root.style.opacity = '0';
        setTimeout(() => {
          if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
          }
          this.root = null;
          resolve();
        }, 300);
      } else {
        resolve();
      }
    });
  }

  destroy(): void {
    this.hide();
  }
}
