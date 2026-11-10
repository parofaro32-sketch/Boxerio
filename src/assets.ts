import * as pc from 'playcanvas';

type AssetLoader = (app: pc.Application) => Promise<pc.Asset>;

export class AssetCache {
  private readonly app: pc.Application;
  private readonly cache = new Map<string, pc.Asset>();
  private readonly pending = new Map<string, Promise<pc.Asset>>();

  constructor(app: pc.Application) {
    this.app = app;
  }

  get<T extends pc.Asset>(name: string): T | undefined {
    return this.cache.get(name) as T | undefined;
  }

  has(name: string): boolean {
    return this.cache.has(name);
  }

  register(asset: pc.Asset): void {
    this.app.assets.add(asset);
    this.cache.set(asset.name, asset);
  }

  async load(name: string, loader: AssetLoader): Promise<pc.Asset> {
    const cached = this.cache.get(name);
    if (cached) return cached;

    const existing = this.pending.get(name);
    if (existing) return existing;

    const promise = loader(this.app).then((asset) => {
      this.register(asset);
      this.pending.delete(name);
      return asset;
    });
    this.pending.set(name, promise);
    return promise;
  }

  release(name: string): void {
    const asset = this.cache.get(name);
    if (asset) {
      this.app.assets.remove(asset);
      this.cache.delete(name);
    }
  }

  destroy(): void {
    for (const [name] of this.cache) {
      this.release(name);
    }
    this.pending.clear();
  }
}
