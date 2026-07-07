/**
 * Background — the shared scene backdrop, styled to match the brief's reference art: a vivid navy
 * field, a warm gold "jackpot" sunburst blazing from the top-center, and gold coins + star glints
 * scattered down the LEFT and RIGHT edges while the center stays calm and dark so the reel and the
 * workbench cards read cleanly. Coins reuse the baked Story-Point symbol; glints use the FX star.
 *
 * If a hand-made / AI-generated PNG is dropped at assets/bg/bg_stage.png and embedded, swap the
 * gradient+sunburst layers for that image and keep the animated coins/glints on top for life.
 * Everything is palette-driven, so it repaints with whatever `palette` the site passes in. Under
 * reduced motion all drift/twinkle is disabled (static frame).
 */

import Phaser from 'phaser';
import { GameContext } from '../core/context';
import { SYM_TEX } from '../core/textures';

export class Background {
  constructor(scene: Phaser.Scene, gc: GameContext) {
    const W = scene.scale.width;
    const H = scene.scale.height;

    // If an embedded stage image was baked in, use it full-bleed and only add a few gentle glints
    // on top for life (the image already carries the sunburst, coins, and sparkles).
    if (scene.textures.exists('bg_stage')) {
      const img = scene.add.image(W / 2, H / 2, 'bg_stage').setDepth(-40);
      const cover = Math.max((W + 2) / img.width, (H + 2) / img.height);
      img.setScale(cover);
      this.glints(scene, gc, W, H, 10, true);
      return;
    }

    // ---- procedural fallback (no image embedded) ----
    // 1. vivid navy vertical gradient
    this.ensureGradient(scene, gc, W, H);
    scene.add.image(W / 2, H / 2, 'bg_grad').setDisplaySize(W + 2, H + 2).setDepth(-40);

    // 2. top-center jackpot sunburst — gold wedges fanning down from just above the top edge
    const rays = scene.add.graphics().setDepth(-33);
    const n = 22;
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      const spread = Math.PI * 1.1; // fan across the top, pointing down-and-out
      const a0 = Math.PI / 2 - spread / 2 + (i / n) * spread;
      const a1 = Math.PI / 2 - spread / 2 + ((i + 1) / n) * spread;
      rays.fillStyle(gc.c.gold, 0.08);
      rays.beginPath();
      rays.moveTo(0, 0);
      rays.lineTo(Math.cos(a0) * 950, Math.sin(a0) * 950);
      rays.lineTo(Math.cos(a1) * 950, Math.sin(a1) * 950);
      rays.closePath();
      rays.fillPath();
    }
    rays.setPosition(W / 2, -24);
    if (!gc.reducedMotion) {
      scene.tweens.add({ targets: rays, alpha: { from: 0.75, to: 1 }, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // 3. top glow core (additive)
    scene.add.image(W / 2, -18, 'fx_dot').setTint(gc.c.gold).setAlpha(0.5).setScale(17).setBlendMode(Phaser.BlendModes.ADD).setDepth(-32);
    scene.add.image(W / 2, 24, 'fx_dot').setTint(gc.c.white).setAlpha(0.35).setScale(7).setBlendMode(Phaser.BlendModes.ADD).setDepth(-32);

    // 4. edge coins — gold Story-Point discs down both sides, sparse in the middle
    const edgeX = (): number =>
      Math.random() < 0.5 ? Phaser.Math.Between(8, 74) : Phaser.Math.Between(W - 74, W - 8);
    for (let i = 0; i < 12; i++) {
      const x = edgeX();
      const y = Phaser.Math.Between(30, H - 30);
      const coin = scene.add
        .image(x, y, SYM_TEX.story_point)
        .setTint(gc.c.gold)
        .setScale(Phaser.Math.FloatBetween(0.2, 0.4))
        .setAngle(Phaser.Math.Between(-25, 25))
        .setAlpha(0.92)
        .setDepth(-30);
      if (gc.reducedMotion) continue;
      scene.tweens.add({
        targets: coin,
        y: y + Phaser.Math.Between(-16, 16),
        angle: coin.angle + Phaser.Math.Between(-18, 18),
        duration: Phaser.Math.Between(2400, 4200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // 5. star glints — gold / cyan / white twinkles, edge-biased
    const tints = [gc.c.gold, gc.c.cyan, gc.c.white, gc.c.skyBlue];
    for (let i = 0; i < 20; i++) {
      const x = Math.random() < 0.72 ? edgeX() : Phaser.Math.Between(90, W - 90);
      const y = Phaser.Math.Between(20, H - 20);
      const star = scene.add
        .image(x, y, 'fx_star')
        .setTint(tints[i % tints.length])
        .setScale(Phaser.Math.FloatBetween(0.4, 0.9))
        .setAlpha(0.7)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-29);
      if (gc.reducedMotion) continue;
      scene.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.95 },
        scale: star.scale * 1.25,
        duration: Phaser.Math.Between(900, 2000),
        delay: Phaser.Math.Between(0, 1800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /** a scatter of twinkling star glints for subtle life on top of a static image */
  private glints(scene: Phaser.Scene, gc: GameContext, W: number, H: number, n: number, edgeBias: boolean): void {
    const tints = [gc.c.gold, gc.c.cyan, gc.c.white, gc.c.skyBlue];
    const edgeX = (): number =>
      Math.random() < 0.5 ? Phaser.Math.Between(6, 70) : Phaser.Math.Between(W - 70, W - 6);
    for (let i = 0; i < n; i++) {
      const x = edgeBias && Math.random() < 0.7 ? edgeX() : Phaser.Math.Between(20, W - 20);
      const y = Phaser.Math.Between(16, H - 16);
      const star = scene.add
        .image(x, y, 'fx_star')
        .setTint(tints[i % tints.length])
        .setScale(Phaser.Math.FloatBetween(0.35, 0.75))
        .setAlpha(0.6)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(-29);
      if (gc.reducedMotion) continue;
      scene.tweens.add({
        targets: star,
        alpha: { from: 0.15, to: 0.85 },
        scale: star.scale * 1.3,
        duration: Phaser.Math.Between(900, 2100),
        delay: Phaser.Math.Between(0, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private ensureGradient(scene: Phaser.Scene, gc: GameContext, _W: number, H: number): void {
    if (scene.textures.exists('bg_grad')) return;
    // brighten the mid toward a vivid royal navy (mix navy -> skyBlue) to match the reference
    const vivid = this.lerpHex(gc.css.navy, gc.css.skyBlue, 0.18);
    const stops: [number, string][] = [
      [0, gc.css.navyDeep],
      [0.28, gc.css.ink],
      [0.55, vivid],
      [0.82, gc.css.navy],
      [1, gc.css.navyDeep],
    ];
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const h = Math.ceil(H);
    for (let y = 0; y < h; y++) {
      const t = y / (h - 1);
      let c = stops[0][1];
      for (let i = 1; i < stops.length; i++) {
        if (t <= stops[i][0]) {
          const [t0, c0] = stops[i - 1];
          const [t1, c1] = stops[i];
          c = this.lerpHex(c0, c1, (t - t0) / (t1 - t0));
          break;
        }
      }
      g.fillStyle(parseInt(c.replace('#', ''), 16), 1);
      g.fillRect(0, y, 8, 1);
    }
    g.generateTexture('bg_grad', 8, h);
    g.destroy();
  }

  private lerpHex(a: string, b: string, t: number): string {
    const ca = parseInt(a.replace('#', ''), 16);
    const cb = parseInt(b.replace('#', ''), 16);
    const r = Math.round(((ca >> 16) & 255) + (((cb >> 16) & 255) - ((ca >> 16) & 255)) * t);
    const g = Math.round(((ca >> 8) & 255) + (((cb >> 8) & 255) - ((ca >> 8) & 255)) * t);
    const bl = Math.round((ca & 255) + ((cb & 255) - (ca & 255)) * t);
    return '#' + ((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0');
  }
}
