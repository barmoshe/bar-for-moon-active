/**
 * GameScene — the core loop (game-design.md §6): spin -> resolve -> build -> ship -> repeat until
 * the workbench is full, then Win. The pure models (resolveSpin, applySpin) decide everything; this
 * scene only renders and juices. Guardrails live in the models: every spin advances, nothing is
 * ever lost, the setback is cosmetic. Space or tap spins; the SHIP IT button shows a focus ring.
 */

import Phaser from 'phaser';
import { ctx, GameContext } from '../core/context';
import { RNG } from '../core/rng';
import { TUNING } from '../core/tuning';
import { resolveSpin } from '../reel/spin';
import { symbol } from '../reel/symbols';
import { createWorkbench, applySpin, shippedKeys, Workbench } from '../workbench/economy';
import { MODULES } from '../workbench/modules';
import { Fx } from '../core/fx';
import { AudioEngine } from '../core/audio';
import { ReelView } from '../ui/ReelView';
import { WorkbenchView } from '../ui/WorkbenchView';
import { Background } from '../ui/Background';
import { Button } from '../ui/Button';
import { SoundToggle } from '../ui/SoundToggle';
import { DISPLAY_FONT, BODY_FONT } from '../ui/fonts';

export class GameScene extends Phaser.Scene {
  private gc!: GameContext;
  private rng!: RNG;
  private wb!: Workbench;
  private reel!: ReelView;
  private bench!: WorkbenchView;
  private button!: Button;
  private fx!: Fx;
  private audio!: AudioEngine;
  private pointsText!: Phaser.GameObjects.Text;
  private shownPoints = 0;
  private toast!: Phaser.GameObjects.Text;
  private shieldText!: Phaser.GameObjects.Text;
  private busy = false;

  constructor() {
    super('Game');
  }

  create(): void {
    this.gc = ctx(this);
    const gc = this.gc;
    const W = this.scale.width;
    this.rng = new RNG((Date.now() & 0x7fffffff) || 1);
    this.wb = createWorkbench();
    this.audio = new AudioEngine();
    this.audio.setEnabled(gc.soundOn);

    this.cameras.main.setBackgroundColor(gc.c.navyDeep);
    new Background(this, gc);

    // ---- HUD ----
    this.buildPointsPill(W / 2, 46);
    this.shieldText = this.add
      .text(14, 40, '', { fontFamily: BODY_FONT, fontSize: '12px', color: gc.css.cyan })
      .setOrigin(0, 0.5)
      .setAlpha(0.9);
    new SoundToggle(this, W - 26, 42, gc, this.audio);

    this.add
      .text(W / 2, 92, 'Spin to build the AI toolkit', {
        fontFamily: BODY_FONT,
        fontSize: '13px',
        color: gc.css.skyBlue,
      })
      .setOrigin(0.5)
      .setAlpha(0.8);

    // ---- reel + workbench + button ----
    this.reel = new ReelView(this, W / 2, 190, gc);
    this.bench = new WorkbenchView(this, W / 2, 392, gc);
    this.toast = this.add
      .text(W / 2, 274, '', {
        fontFamily: DISPLAY_FONT,
        fontSize: '18px',
        color: gc.css.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setAlpha(0);

    this.fx = new Fx(this, gc, 40);

    this.button = new Button(this, W / 2, 782, gc, {
      label: 'SHIP IT',
      width: 240,
      height: 62,
      fill: gc.c.gold,
      textColor: gc.css.navyDeep,
      fontSize: 26,
      onClick: () => this.spin(),
    });
    this.button.setDepth(60);
    this.button.setFocused(true, gc.c.gold); // visible keyboard affordance (a11y §11)

    this.input.keyboard?.on('keydown-SPACE', (e: KeyboardEvent) => {
      e.preventDefault();
      this.button.press();
    });

    this.refreshRings();
    this.bench.highlightActive(0);
    this.updateShieldHud();
  }

  private buildPointsPill(x: number, y: number): void {
    const gc = this.gc;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(gc.c.ink, 0.85);
    g.fillRoundedRect(x - 86, y - 18, 172, 36, 18);
    g.fillStyle(gc.c.gold, 1);
    g.fillCircle(x - 66, y, 11);
    this.add
      .text(x - 66, y, 'SP', {
        fontFamily: DISPLAY_FONT,
        fontSize: '11px',
        color: gc.css.navyDeep,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(21);
    this.pointsText = this.add
      .text(x - 46, y, '0', {
        fontFamily: DISPLAY_FONT,
        fontSize: '20px',
        color: gc.css.white,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5)
      .setDepth(21);
  }

  private refreshRings(): void {
    this.wb.modules.forEach((m, i) => {
      if (m.shipped) return;
      this.bench.setProgress(i, m.progress / this.wb.cost);
    });
  }

  private updateShieldHud(): void {
    const s = this.wb.shieldCharges;
    const bugs = this.wb.bugMeter;
    const dots = '•'.repeat(bugs) + '◦'.repeat(Math.max(0, TUNING.BUGS_TO_BREAK - bugs));
    this.shieldText.setText(`QA ${s}   bugs ${dots}`);
  }

  private flashToast(msg: string, color: string): void {
    this.toast.setText(msg).setColor(color).setAlpha(1).setScale(0.8).setY(274);
    if (this.gc.reducedMotion) {
      this.time.delayedCall(900, () => this.toast.setAlpha(0));
      return;
    }
    this.tweens.add({ targets: this.toast, scale: 1, duration: 180, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: this.toast,
      y: 250,
      alpha: 0,
      delay: 700,
      duration: 400,
      ease: 'Quad.easeIn',
    });
  }

  private countUp(target: number): void {
    if (this.gc.reducedMotion) {
      this.shownPoints = target;
      this.pointsText.setText(String(target));
      return;
    }
    this.tweens.addCounter({
      from: this.shownPoints,
      to: target,
      duration: 420,
      ease: 'Cubic.easeOut',
      onUpdate: (t) => {
        const v = Math.round(t.getValue() ?? 0);
        this.pointsText.setText(String(v));
      },
      onComplete: () => (this.shownPoints = target),
    });
  }

  private async spin(): Promise<void> {
    if (this.busy || this.wb.won) return;
    this.busy = true;
    this.button.setEnabled(false);

    const outcome = resolveSpin(this.rng);
    await this.reel.spinTo(outcome.line, {
      reducedMotion: this.gc.reducedMotion,
      onReelStop: (i, key) => {
        if (this.gc.soundOn) this.audio.tick();
        const k = symbol(key).kind;
        if (k === 'coin' || k === 'wild') {
          const p = this.reel.reelWorld(i);
          this.fx.coinBurst(p.x, p.y, this.gc.c.gold);
        }
      },
    });

    // resolve into the workbench
    const activeBefore = this.wb.activeIndex;
    const result = applySpin(this.wb, outcome);
    this.countUp(this.wb.totalPoints);
    this.refreshRings();
    this.updateShieldHud();

    const tierColor =
      outcome.tier === 'jackpot'
        ? this.gc.css.gold
        : outcome.tier === 'setback'
          ? this.gc.css.red
          : this.gc.css.cyan;
    this.flashToast(`${outcome.label}  +${result.pointsAdded}`, tierColor);
    if (this.gc.soundOn) this.audio.coin();
    const rp = this.reel.reelWorld(1);
    this.fx.coinBurst(rp.x, rp.y, this.gc.c.gold);

    // setback beat (cosmetic, no points lost)
    if (result.broke) this.playBreak(activeBefore);
    if (result.shieldAbsorbed) this.flashToast('QA shield held', this.gc.css.cyan);

    // ships
    for (const key of result.shipped) {
      const idx = MODULES.findIndex((m) => m.key === key);
      await this.playShip(idx);
    }

    this.bench.highlightActive(this.wb.activeIndex);

    if (result.won) {
      this.time.delayedCall(700, () => {
        // win handoff happens in WinScene
        this.scene.start('Win', { modulesShipped: shippedKeys(this.wb) });
      });
      return;
    }

    this.busy = false;
    this.button.setEnabled(true);
  }

  private playShip(idx: number): Promise<void> {
    const m = MODULES[idx];
    const p = this.bench.cardWorld(idx);
    this.fx.bloomFlash(this.gc.c[m.tint]);
    this.fx.starBurst(p.x, p.y);
    this.fx.pop();
    if (this.gc.soundOn) this.audio.chime();
    this.flashToast('SHIPPED!', this.gc.css.gold);
    return this.bench.ship(idx, this.gc.reducedMotion);
  }

  private playBreak(idx: number): void {
    if (idx >= this.bench.cardCount) return;
    this.flashToast('Bug swarm, hotfixing', this.gc.css.red);
    const p = this.bench.cardWorld(idx);
    this.fx.coinBurst(p.x, p.y, this.gc.c.red);
    if (this.gc.reducedMotion) return;
    // a tiny wobble on the active card, instantly recovered (never a real loss)
    this.bench.wobble(idx);
  }
}
