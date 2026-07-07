/**
 * fx.ts — the juice layer (art-direction §10). Coin-burst particles on payout, a Bloom flash on
 * SHIPPED!, a star shower on win, and a light focus vignette. Built on additive particles + an
 * additive full-screen quad (the reliable Phaser-4 path monkey-bananas proved) rather than the
 * newer Filter pipeline, so it renders identically on WebGL and the Canvas fallback.
 *
 * Every burst is bounded and duration-capped. Reduced motion (§11) cuts particle counts hard and
 * replaces the flash pulse with a brief static tint. Restrained screen-pop, never a jarring shake.
 */

import Phaser from 'phaser';
import { GameContext } from './context';

export class Fx {
  private scene: Phaser.Scene;
  private gc: GameContext;
  private coin!: Phaser.GameObjects.Particles.ParticleEmitter;
  private stars!: Phaser.GameObjects.Particles.ParticleEmitter;
  private flash!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, gc: GameContext, depth: number) {
    this.scene = scene;
    this.gc = gc;

    this.coin = scene.add.particles(0, 0, 'fx_dot', {
      lifespan: 520,
      speed: { min: 60, max: 220 },
      angle: { min: 200, max: 340 },
      gravityY: 520,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: gc.c.gold,
      blendMode: 'ADD',
      emitting: false,
    });
    this.coin.setDepth(depth);

    this.stars = scene.add.particles(0, 0, 'fx_star', {
      lifespan: { min: 700, max: 1400 },
      speed: { min: 140, max: 420 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      rotate: { start: 0, end: 360 },
      alpha: { start: 1, end: 0 },
      tint: [gc.c.gold, gc.c.cyan, gc.c.white],
      blendMode: 'ADD',
      emitting: false,
    });
    this.stars.setDepth(depth + 2);

    this.flash = scene.add
      .rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width, scene.scale.height, gc.c.gold, 1)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(depth + 1)
      .setScrollFactor(0)
      .setAlpha(0);
  }

  private get rm(): boolean {
    return this.gc.reducedMotion;
  }

  coinBurst(x: number, y: number, tint?: number): void {
    if (tint !== undefined) this.coin.setParticleTint(tint);
    this.coin.explode(this.rm ? 4 : 12, x, y);
  }

  starBurst(x: number, y: number): void {
    this.stars.explode(this.rm ? 10 : 48, x, y);
  }

  /** the SHIPPED! bloom flash */
  bloomFlash(color: number, peak = 0.34): void {
    this.flash.setFillStyle(color, 1);
    if (this.rm) {
      this.flash.setAlpha(peak * 0.5);
      this.scene.time.delayedCall(260, () => this.flash.setAlpha(0));
      return;
    }
    this.scene.tweens.add({
      targets: this.flash,
      alpha: { from: 0, to: peak },
      duration: 130,
      yoyo: true,
      hold: 90,
      ease: 'Sine.easeOut',
      onComplete: () => this.flash.setAlpha(0),
    });
  }

  /** a restrained camera pop (never a jarring shake, §10) */
  pop(): void {
    if (this.rm) return;
    this.scene.cameras.main.zoomTo(1.02, 90, 'Sine.easeInOut', true, (_cam, prog) => {
      if (prog === 1) this.scene.cameras.main.zoomTo(1, 120, 'Sine.easeInOut');
    });
  }
}
