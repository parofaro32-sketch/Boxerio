import { App } from '../App';

export abstract class Screen {
  protected app?: App;

  setApp(app: App): void {
    this.app = app;
  }

  abstract show(): void;
  abstract hide(): Promise<void>;
  abstract destroy(): void;

  protected clearContainer(): void {
    if (this.app) {
      this.app.container.innerHTML = '';
    }
  }

  protected get container(): HTMLElement | null {
    return this.app?.container ?? null;
  }
}
