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
  private safetyTimer: number = 0;

  constructor(options: LoadingScreenOptions) {
    super();
    this.options = options;
  }

  show(): void {
    const container = this.container;
    if (!container) {
      // No UI container yet; force completion so the app can still proceed.
      this.forceComplete();
      return;
    }

    // Reuse the static overlay from index.html so the user never sees a blank screen.
    let existing: HTMLElement | null = null;
    try {
      existing = container.querySelector<HTMLElement>('#static-loading');
    } catch {
      existing = null;
    }

    if (existing) {
      this.root = existing;
      try {
        this.progressBar = this.root.querySelector<HTMLElement>('#static-progress-bar');
        this.progressText = this.root.querySelector<HTMLElement>('#static-progress-text');
      } catch {
        this.progressBar = null;
        this.progressText = null;
      }
    } else {
      this.buildOverlay(container);
    }

    // Guarantee we have handles to animate against.
    if (!this.progressBar || !this.progressText) {
      this.createMissing();
    }

    this.startTime = performance.now();
    this.animate();
    this.scheduleSafety();
  }

  private buildOverlay(container: HTMLElement): void {
    this.clearContainer();
    this.root = document.createElement('div');
    this.root.className = 'screen loading-screen';
    this.root.id = 'static-loading';

    const inner = document.createElement('div');
    inner.className = 'loading-inner';

    const title = document.createElement('div');
    title.className = 'loading-title';
    title.textContent = 'PREMIUM BOXING';

    const subtitle = document.createElement('div');
    subtitle.className = 'loading-subtitle';
    subtitle.textContent = 'Initializing engine…';

    const track = document.createElement('div');
    track.className = 'progress-track';

    this.progressBar = document.createElement('div');
    this.progressBar.className = 'progress-bar';
    this.progressBar.id = 'static-progress-bar';
    this.progressBar.style.width = '0%';

    this.progressText = document.createElement('div');
    this.progressText.className = 'progress-text';
    this.progressText.id = 'static-progress-text';
    this.progressText.textContent = '0%';

    track.appendChild(this.progressBar);
    inner.appendChild(title);
    inner.appendChild(subtitle);
    inner.appendChild(track);
    inner.appendChild(this.progressText);
    this.root.appendChild(inner);
    container.appendChild(this.root);
  }

  private createMissing(): void {
    if (!this.progressBar) {
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'progress-bar';
      this.progressBar.id = 'static-progress-bar';
      this.progressBar.style.width = '0%';
      if (this.root) this.root.appendChild(this.progressBar);
    }
    if (!this.progressText) {
      this.progressText = document.createElement('div');
      this.progressText.className = 'progress-text';
      this.progressText.id = 'static-progress-text';
      this.progressText.textContent = '0%';
      if (this.root) this.root.appendChild(this.progressText);
    }
  }

  private animate(): void {
    try {
      if (this.completed) return;
      const duration = this.options.durationMs ?? 1100;
      const elapsed = performance.now() - this.startTime;
      let p = Math.min(elapsed / duration, 1);
      p = 1 - Math.pow(1 - p, 3);

      const percent = Math.round(p * 100);
      if (this.progressBar) this.progressBar.style.width = `${percent}%`;
      if (this.progressText) this.progressText.textContent = `${percent}%`;

      if (p < 1) {
        this.rafId = requestAnimationFrame(() => this.animate());
      } else {
        this.complete();
      }
    } catch {
      // Never let the loading screen stall: force completion on any error.
      this.forceComplete();
    }
  }

  private complete(): void {
    if (this.completed) return;
    this.completed = true;
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.safetyTimer);
    try {
      this.options.onComplete();
    } catch {
      // ignore callback errors
    }
  }

  private scheduleSafety(): void {
    // Hard safety net: if the animation stalls for any reason, still finish loading.
    const duration = this.options.durationMs ?? 1100;
    this.safetyTimer = window.setTimeout(() => {
      if (!this.completed) this.forceComplete();
    }, duration + 1500);
  }

  private forceComplete(): void {
    this.completed = true;
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.safetyTimer);
    try {
      if (this.progressBar) this.progressBar.style.width = '100%';
      if (this.progressText) this.progressText.textContent = '100%';
    } catch {
      // ignore
    }
    try {
      this.options.onComplete();
    } catch {
      // ignore
    }
  }

  async hide(): Promise<void> {
    this.completed = true;
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.safetyTimer);
    return new Promise((resolve) => {
      if (this.root) {
        this.root.style.transition = 'opacity 0.3s ease';
        this.root.style.opacity = '0';
        setTimeout(() => {
          try {
            if (this.root && this.root.parentNode) {
              this.root.parentNode.removeChild(this.root);
            }
          } catch {
            // ignore
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
