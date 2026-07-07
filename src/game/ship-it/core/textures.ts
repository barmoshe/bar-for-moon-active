/**
 * textures.ts — the FX textures (soft radial dot + 4-point star) generated procedurally at Boot,
 * used by the particle/bloom layer. The six REEL SYMBOLS are NOT drawn here: they are baked CC0
 * glyphs (recolored to grayscale by scripts/build-assets.py, embedded as base64 in symbolData.ts)
 * and loaded in BootScene, then tinted live from the brand palette at render time. This keeps the
 * downloaded art harmonized with whatever `palette` the site passes in.
 */

import Phaser from 'phaser';

function star(cx: number, cy: number, spikes: number, outer: number, inner: number): number[] {
  const pts: number[] = [];
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  for (let i = 0; i < spikes; i++) {
    pts.push(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    rot += step;
    pts.push(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
    rot += step;
  }
  return pts;
}

function polyPath(g: Phaser.GameObjects.Graphics, pts: number[]): void {
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
}

/** generate the white FX textures (tinted at use). Called once in BootScene.create(). */
export function generateFxTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists('fx_dot')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    for (let r = 32; r > 0; r--) {
      g.fillStyle(0xffffff, 0.05);
      g.fillCircle(32, 32, r);
    }
    g.fillStyle(0xffffff, 1);
    g.fillCircle(32, 32, 6);
    g.generateTexture('fx_dot', 64, 64);
    g.destroy();
  }
  if (!scene.textures.exists('fx_star')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    polyPath(g, star(16, 16, 4, 15, 5));
    g.fillPath();
    g.generateTexture('fx_star', 32, 32);
    g.destroy();
  }
}

/** the six reel symbol texture keys (loaded from base64 in BootScene) */
export const SYM_TEX: Record<string, string> = {
  story_point: 'sym_story_point',
  frontend: 'sym_frontend',
  backend: 'sym_backend',
  ai_wild: 'sym_ai_wild',
  qa_shield: 'sym_qa_shield',
  bug: 'sym_bug',
};
