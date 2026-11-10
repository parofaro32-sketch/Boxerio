import * as pc from 'playcanvas';

/**
 * Placeholder boxing arena environment used while realistic assets are produced (Phase 5).
 * Built from simple geometry only for the menu/loading background; it is not a boxer character.
 */
export class Arena {
  readonly root: pc.Entity;

  constructor(app: pc.Application) {
    this.root = new pc.Entity('arena');
    app.scene.root.addChild(this.root);
    this.build();
  }

  private build(): void {
    // Floor / arena floor
    const floor = new pc.Entity('floor');
    floor.addComponent('model', { type: 'box', castShadows: true, receiveShadows: true });
    floor.setPosition(0, -1, 0);
    floor.setLocalScale(200, 1, 200);
    this.setMaterial(floor, 0.04, 0.04, 0.05, 0.1, 0.9);
    this.root.addChild(floor);

    // Ring platform
    const ring = new pc.Entity('ring');
    ring.addComponent('model', { type: 'box', castShadows: true, receiveShadows: true });
    ring.setPosition(0, 0.55, 0);
    ring.setLocalScale(6.4, 0.1, 6.4);
    this.setMaterial(ring, 0.18, 0.05, 0.05, 0.1, 0.85);
    this.root.addChild(ring);

    // Ring canvas top
    const canvasTop = new pc.Entity('ringCanvas');
    canvasTop.addComponent('model', { type: 'box', castShadows: false, receiveShadows: true });
    canvasTop.setPosition(0, 0.6, 0);
    canvasTop.setLocalScale(5.9, 0.02, 5.9);
    this.setMaterial(canvasTop, 0.62, 0.08, 0.08, 0.0, 0.9);
    this.root.addChild(canvasTop);

    // Corner posts
    const positions = [
      [2.9, 0, 2.9],
      [-2.9, 0, 2.9],
      [2.9, 0, -2.9],
      [-2.9, 0, -2.9],
    ];
    positions.forEach((p, i) => {
      const post = new pc.Entity(`post${i}`);
      post.addComponent('model', { type: 'cylinder', castShadows: true, receiveShadows: true });
      post.setPosition(p[0], 2.2, p[2]);
      post.setLocalScale(0.14, 4.4, 0.14);
      this.setMaterial(post, 0.12, 0.12, 0.14, 0.6, 0.3);
      this.root.addChild(post);

      const cap = new pc.Entity(`cap${i}`);
      cap.addComponent('model', { type: 'cylinder', castShadows: false });
      cap.setPosition(p[0], 4.55, p[2]);
      cap.setLocalScale(0.18, 0.1, 0.18);
      this.setMaterial(cap, 0.7, 0.55, 0.1, 0.8, 0.2);
      this.root.addChild(cap);
    });

    // Ropes (thin horizontal boxes between posts) - 3 levels
    const ropeLevels = [1.0, 1.75, 2.5];
    const sides = [
      { fixed: 2.9, rangeX: [-2.9, 2.9] },
      { fixed: -2.9, rangeX: [-2.9, 2.9] },
      { fixed: 2.9, rangeZ: [-2.9, 2.9] },
      { fixed: -2.9, rangeZ: [-2.9, 2.9] },
    ];
    let ropeIndex = 0;
    sides.forEach((side) => {
      ropeLevels.forEach((y) => {
        const rope = new pc.Entity(`rope${ropeIndex++}`);
        rope.addComponent('model', { type: 'box', castShadows: false, receiveShadows: false });
        if (side.rangeX) {
          rope.setPosition(0, y, side.fixed);
          rope.setLocalScale(5.8, 0.045, 0.045);
        } else {
          rope.setPosition(side.fixed, y, 0);
          rope.setLocalScale(0.045, 0.045, 5.8);
        }
        this.setMaterial(rope, 0.85, 0.85, 0.9, 0.0, 0.8);
        this.root.addChild(rope);
      });
    });

    // Lights
    const dirLight = new pc.Entity('dirLight');
    dirLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 0.92, 0.8),
      intensity: 1.2,
      castShadows: true,
    });
    dirLight.setEulerAngles(-45, 40, 0);
    this.root.addChild(dirLight);

    const spot = new pc.Entity('spot');
    spot.addComponent('light', {
      type: 'spot',
      color: new pc.Color(1, 0.95, 0.85),
      intensity: 8,
      range: 30,
      innerConeAngle: 12,
      outerConeAngle: 34,
      castShadows: true,
    });
    spot.setPosition(0, 10, 0);
    spot.setEulerAngles(-90, 0, 0);
    this.root.addChild(spot);
  }

  private setMaterial(
    entity: pc.Entity,
    r: number,
    g: number,
    b: number,
    metalness: number,
    gloss: number
  ): void {
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(r, g, b);
    mat.metalness = metalness;
    mat.gloss = gloss;
    mat.useFog = true;
    mat.useLighting = true;
    mat.update();
    const model = entity.model;
    if (!model) return;
    const meshInstances = model.meshInstances;
    if (!meshInstances || meshInstances.length === 0) return;
    meshInstances[0].material = mat;
  }

  destroy(): void {
    this.root.destroy();
  }
}
