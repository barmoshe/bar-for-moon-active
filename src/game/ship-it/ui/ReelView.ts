/**
 * ReelView — the slot board: one payline, three reels (game-design.md §6, §7). Soft-painted cream
 * board, three navy reel windows, a gold payline frame. The reel symbols are the only art with a
 * tinted outline (§10); they're drawn that way in textures.ts.
 *
 * Spin feel (§4 slot game-feel, applied for delight only): reels stop one-by-one, each slower than
 * the last, with a near-miss hesitation on the final reel. We sell the spin with a texture-swap
 * illusion (rapid symbol cycling + a vertical bob + a landing bounce) rather than a masked strip,
 * which is cheaper and mask-free. Under reduced motion, `setLineInstant` just snaps the frame.
 */

import Phaser from 'phaser';
import { GameContext } from '../core/context';
import { SYM_TEX } from '../core/textures';
import { SYMBOL_ORDER, SymbolKey, symbol } from '../reel/symbols';

const REEL_W = 104;
const REEL_H = 116;
const GAP = 12;
const SYM_SCALE = 0.66;

export interface SpinOpts {
  reducedMotion: boolean;
  onReelStop?: (reelIndex: number, key: SymbolKey) => void;
}

export class ReelView extends Phaser.GameObjects.Container {
  private gc: GameContext;
  private symbols: Phaser.GameObjects.Image[] = [];
  private windows: Phaser.GameObjects.Graphics;
  private payline: Phaser.GameObjects.Graphics;
  private spinning = false;
  private swapTimers: Phaser.Time.TimerEvent[] = [];
  readonly boardW: number;
  readonly boardH: number;

  constructor(scene: Phaser.Scene, x: number, y: number, gc: GameContext) {
    super(scene, x, y);
    this.gc = gc;
    this.boardW = REEL_W * 3 + GAP * 2 + 28;
    this.boardH = REEL_H + 28;

    const board = scene.add.graphics();
    // cream board (warm off-white, art §10)
    const cream = this.mix(gc.css.white, gc.css.gold, 0.12);
    board.fillStyle(gc.c.black, 0.3);
    board.fillRoundedRect(-this.boardW / 2, -this.boardH / 2 + 6, this.boardW, this.boardH, 22);
    board.fillStyle(cream, 1);
    board.fillRoundedRect(-this.boardW / 2, -this.boardH / 2, this.boardW, this.boardH, 22);

    this.windows = scene.add.graphics();
    this.payline = scene.add.graphics();
    this.add([board, this.windows, this.payline]);

    const startX = -(REEL_W + GAP);
    for (let i = 0; i < 3; i++) {
      const rx = startX + i * (REEL_W + GAP);
      // reel window
      this.windows.fillStyle(gc.c.navyDeep, 1);
      this.windows.fillRoundedRect(rx - REEL_W / 2, -REEL_H / 2, REEL_W, REEL_H, 14);
      this.windows.lineStyle(3, this.mix(gc.css.navy, gc.css.white, 0.12), 1);
      this.windows.strokeRoundedRect(rx - REEL_W / 2, -REEL_H / 2, REEL_W, REEL_H, 14);
      const s = scene.add.image(rx, 0, SYM_TEX.story_point).setScale(SYM_SCALE);
      this.setSym(s, SYMBOL_ORDER[i % SYMBOL_ORDER.length]);
      this.symbols.push(s);
      this.add(s);
    }
    this.drawPayline(false);
    scene.add.existing(this);
  }

  private mix(a: string, b: string, t: number): number {
    const ca = parseInt(a.replace('#', ''), 16);
    const cb = parseInt(b.replace('#', ''), 16);
    const ar = (ca >> 16) & 255,
      ag = (ca >> 8) & 255,
      ab = ca & 255;
    const br = (cb >> 16) & 255,
      bg = (cb >> 8) & 255,
      bb = cb & 255;
    return (
      (Math.round(ar + (br - ar) * t) << 16) |
      (Math.round(ag + (bg - ag) * t) << 8) |
      Math.round(ab + (bb - ab) * t)
    );
  }

  private drawPayline(hot: boolean): void {
    this.payline.clear();
    const w = this.boardW - 10;
    this.payline.lineStyle(hot ? 4 : 2, this.gc.c.gold, hot ? 0.9 : 0.4);
    this.payline.lineBetween(-w / 2, 0, w / 2, 0);
  }

  /** set a reel sprite's texture AND tint it live from the palette (per-symbol tint token) */
  private setSym(sprite: Phaser.GameObjects.Image, key: SymbolKey): void {
    sprite.setTexture(SYM_TEX[key]);
    sprite.setTint(this.gc.c[symbol(key).tint]);
  }

  setLineInstant(line: readonly SymbolKey[]): void {
    for (let i = 0; i < 3; i++) this.setSym(this.symbols[i], line[i]);
  }

  private randKey(): SymbolKey {
    return SYMBOL_ORDER[Math.floor(Math.random() * SYMBOL_ORDER.length)];
  }

  /** Animate the three reels to `line`, stopping one-by-one, slowest last, near-miss on the last. */
  spinTo(line: readonly SymbolKey[], opts: SpinOpts): Promise<void> {
    if (this.spinning) return Promise.resolve();
    if (opts.reducedMotion) {
      this.setLineInstant(line);
      for (let i = 0; i < 3; i++) opts.onReelStop?.(i, line[i]);
      this.drawPayline(true);
      this.scene.time.delayedCall(300, () => this.drawPayline(false));
      return Promise.resolve();
    }

    this.spinning = true;
    const stopAt = [560, 820, 1180]; // slowest last (§4)
    const scene = this.scene;

    return new Promise<void>((resolve) => {
      for (let i = 0; i < 3; i++) {
        const sprite = this.symbols[i];
        // vertical bob to sell motion
        scene.tweens.add({
          targets: sprite,
          y: { from: -6, to: 6 },
          duration: 90,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        // rapid texture cycling
        const timer = scene.time.addEvent({
          delay: 55,
          loop: true,
          callback: () => this.setSym(sprite, this.randKey()),
        });
        this.swapTimers.push(timer);

        const land = (): void => {
          timer.remove();
          scene.tweens.killTweensOf(sprite);
          sprite.setY(0);
          this.setSym(sprite, line[i]);
          // landing bounce
          scene.tweens.add({
            targets: sprite,
            scale: { from: SYM_SCALE * 1.18, to: SYM_SCALE },
            duration: 220,
            ease: 'Back.easeOut',
          });
          opts.onReelStop?.(i, line[i]);
          if (i === 2) {
            this.drawPayline(true);
            scene.time.delayedCall(420, () => {
              this.drawPayline(false);
              this.spinning = false;
              resolve();
            });
          }
        };

        if (i === 2) {
          // near-miss beat: at ~80% show a tease symbol, hesitate, then land (§4)
          scene.time.delayedCall(stopAt[i] - 200, () => {
            timer.paused = true;
            this.setSym(sprite, this.teaseFor(line[2]));
          });
          scene.time.delayedCall(stopAt[i], land);
        } else {
          scene.time.delayedCall(stopAt[i], land);
        }
      }
    });
  }

  /** a "near but not it" symbol for the final-reel hesitation */
  private teaseFor(target: SymbolKey): SymbolKey {
    const idx = SYMBOL_ORDER.indexOf(target);
    return SYMBOL_ORDER[(idx + 1) % SYMBOL_ORDER.length];
  }

  /** world position (in scene space) of a reel window, for spawning particles at a stop */
  reelWorld(i: number): { x: number; y: number } {
    const startX = -(REEL_W + GAP);
    return { x: this.x + startX + i * (REEL_W + GAP), y: this.y };
  }
}
