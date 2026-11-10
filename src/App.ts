import * as pc from 'playcanvas';
import { Boot, GraphicsQuality } from './boot';
import { AssetCache } from './assets';
import { Screen } from './screens/Screen';

export type ScreenId = 'loading' | 'menu' | 'career';

export interface AppOptions {
  canvasId?: string;
}

export class App {
  readonly boot: Boot;
  readonly app: pc.Application;
  readonly assets: AssetCache;

  private readonly screens = new Map<ScreenId, Screen>();
  private activeScreen?: Screen;
  readonly container: HTMLElement;

  constructor(options: AppOptions = {}) {
    this.boot = new Boot(options.canvasId);
    this.app = this.boot.app;
    this.assets = new AssetCache(this.app);

    this.container = document.getElementById('ui') as HTMLElement;
    if (!this.container) {
      throw new Error('App: #ui container not found');
    }
  }

  registerScreen(id: ScreenId, screen: Screen): void {
    this.screens.set(id, screen);
    screen.setApp(this);
  }

  async show(id: ScreenId): Promise<void> {
    const next = this.screens.get(id);
    if (!next) {
      console.warn(`App: screen '${id}' not registered`);
      return;
    }
    if (this.activeScreen) {
      await this.activeScreen.hide();
    }
    this.activeScreen = next;
    next.show();
  }

  get activeScreenId(): ScreenId | undefined {
    return this.activeScreen ? ([...this.screens.entries()].find(([, s]) => s === this.activeScreen)?.[0] as ScreenId) : undefined;
  }

  get quality(): GraphicsQuality {
    return this.boot.qualityName;
  }

  setQuality(quality: GraphicsQuality): void {
    this.boot.setQuality(quality);
  }

  resize(): void {
    this.boot.onResize();
  }

  async destroy(): Promise<void> {
    if (this.activeScreen) {
      await this.activeScreen.hide();
    }
    for (const screen of this.screens.values()) {
      screen.destroy();
    }
    this.screens.clear();
    this.assets.destroy();
    this.boot.destroy();
  }
}
