import * as pc from 'playcanvas';
import { FOG_LINEAR } from 'playcanvas';

export enum GraphicsQuality {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface QualityConfig {
  pixelRatio: number;
  antiAliasing: boolean;
}

const QUALITY_PRESETS: Record<GraphicsQuality, QualityConfig> = {
  [GraphicsQuality.Low]: {
    pixelRatio: 1,
    antiAliasing: false,
  },
  [GraphicsQuality.Medium]: {
    pixelRatio: 1,
    antiAliasing: true,
  },
  [GraphicsQuality.High]: {
    pixelRatio: 2,
    antiAliasing: true,
  },
};

export class Boot {
  readonly app: pc.Application;
  readonly canvas: HTMLCanvasElement;

  private quality: GraphicsQuality = GraphicsQuality.Medium;
  private boundOnResize = () => this.onResize();
  private boundOnVisibilityChange = () => this.onVisibilityChange();
  private boundOnDeviceLost = () => this.onDeviceLost();
  private boundOnDeviceRestored = () => this.onDeviceRestored();
  private resizeObserver?: ResizeObserver;
  private destroyed = false;

  constructor(canvasId = 'graphics-canvas') {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Boot: canvas #${canvasId} not found`);
    }

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    this.app = new pc.Application(this.canvas, {
      graphicsDeviceOptions: {
        depth: true,
        stencil: false,
        antialias: true,
        alpha: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      },
    });

    this.app.start();
    this.configureScene();
    this.applyQuality(this.quality);

    window.addEventListener('resize', this.boundOnResize, { passive: true });
    window.addEventListener('orientationchange', this.boundOnResize, { passive: true });
    document.addEventListener('visibilitychange', this.boundOnVisibilityChange);
    this.app.graphicsDevice.on(pc.GraphicsDevice.EVENT_DEVICELOST, this.boundOnDeviceLost);
    this.app.graphicsDevice.on(pc.GraphicsDevice.EVENT_DEVICERESTORED, this.boundOnDeviceRestored);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.boundOnResize);
      this.resizeObserver.observe(this.canvas);
    }

    this.onResize();
  }

  get isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  get qualityName(): GraphicsQuality {
    return this.quality;
  }

  setQuality(quality: GraphicsQuality): void {
    this.quality = quality;
    this.applyQuality(quality);
    this.onResize();
  }

  private applyQuality(quality: GraphicsQuality): void {
    const preset = QUALITY_PRESETS[quality];
    this.app.graphicsDevice.maxPixelRatio = preset.pixelRatio;
    (this.app as any)._qualityAntiAliasing = preset.antiAliasing;
  }

  private configureScene(): void {
    const scene = this.app.scene;
    scene.ambientLight = new pc.Color(0.05, 0.05, 0.07);
    scene.exposure = 1.2;
    const fog = scene.fog;
    fog.type = FOG_LINEAR;
    fog.color = new pc.Color(0.02, 0.02, 0.03);
    fog.start = 8;
    fog.end = 140;
    fog.density = 0.035;
  }

  public onResize(): void {
    if (this.destroyed) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.resizeCanvas(width, height);
  }

  private onVisibilityChange(): void {
    // Visibility is tracked by the engine; no public pause/resume API exists on AppBase.
    // Rendering continues; gameplay systems should gate on document.visibilityState where needed.
  }

  private onDeviceLost(): void {
    // Rendering pauses while the device is lost; GPU resources may need recreation on restore.
  }

  private onDeviceRestored(): void {
    this.applyQuality(this.quality);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('orientationchange', this.boundOnResize);
    document.removeEventListener('visibilitychange', this.boundOnVisibilityChange);
    this.app.graphicsDevice.off(pc.GraphicsDevice.EVENT_DEVICELOST, this.boundOnDeviceLost);
    this.app.graphicsDevice.off(pc.GraphicsDevice.EVENT_DEVICERESTORED, this.boundOnDeviceRestored);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    this.app.destroy();
    this.destroyed = true;
  }
}
