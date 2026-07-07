/**
 * BootScene — generate all procedural art + a short progress beat, then hand off to Hero.
 * Fires the embed contract's `game:ready` once, when Boot completes (React onReady).
 *
 * There is nothing to network-load (art is procedural, fonts come from the host page / system),
 * so Boot is a single synchronous texture-gen phase with a brief branded splash so the handoff
 * does not flash. Under reduced motion the splash is static.
 */

import Phaser from 'phaser';
import { ctx } from '../core/context';
import { EVENTS } from '../core/bus';
import { generateFxTextures, SYM_TEX } from '../core/textures';
import { SYMBOL_PNG } from '../core/symbolData';
import { BG_STAGE } from '../core/bgData';
import { LOGO_SHIPIT } from '../core/logoData';
import { DISPLAY_FONT, BODY_FONT } from '../ui/fonts';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // the six baked CC0 symbols, embedded as base64 (self-contained, no network)
    for (const key of Object.keys(SYMBOL_PNG)) {
      this.load.image(SYM_TEX[key], SYMBOL_PNG[key]);
    }
    // the embedded stage background + logo (if baked in)
    if (BG_STAGE) this.load.image('bg_stage', BG_STAGE);
    if (LOGO_SHIPIT) this.load.image('logo_shipit', LOGO_SHIPIT);
  }

  create(): void {
    const gc = ctx(this);
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(gc.c.navyDeep);

    generateFxTextures(this);

    // brief branded splash — the logo image if present, else the plain wordmark
    let splash: Phaser.GameObjects.GameObject;
    if (this.textures.exists('logo_shipit')) {
      const logo = this.add.image(width / 2, height / 2 - 6, 'logo_shipit').setOrigin(0.5);
      logo.setScale(Math.min(300 / logo.width, 1));
      splash = logo;
    } else {
      splash = this.add
        .text(width / 2, height / 2 - 12, 'Ship It!', {
          fontFamily: DISPLAY_FONT,
          fontSize: '46px',
          color: gc.css.gold,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }
    const sub = this.add
      .text(width / 2, height / 2 + 96, 'loading the workbench', {
        fontFamily: BODY_FONT,
        fontSize: '14px',
        color: gc.css.skyBlue,
      })
      .setOrigin(0.5)
      .setAlpha(0.85);

    // fire onReady as soon as art is ready (Boot is effectively done)
    gc.bus.emit(EVENTS.READY);

    // Robust hand-off to Hero: scheduled unconditionally (never gated on a tween completing),
    // with a purely cosmetic fade-in on top.
    if (!gc.reducedMotion) {
      this.tweens.add({ targets: [splash, sub], alpha: { from: 0, to: 1 }, duration: 380, ease: 'Sine.easeOut' });
    }
    this.time.delayedCall(gc.reducedMotion ? 350 : 850, () => this.scene.start('Hero'));
  }
}
