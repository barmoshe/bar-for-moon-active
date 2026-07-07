// ShipItScene.ts — the "Ship It!" mini-game (Phaser 4), procedural art only.
// Donor: gamestudio/output/games/gem-vault (Phaser 4 bootstrap, scene lifecycle,
// mulberry32 RNG, procedural-shape rendering). Rebuilt for the Coin Master
// spin-slot -> build-the-toolkit loop in game-design.md. No atlases, no audio,
// no network: everything is drawn with Phaser shapes + text.
import Phaser from 'phaser';
import { GAME_W, GAME_H, MODULES, SYM_WEIGHTS, type Sym, type MoonPalette } from './config';

const hx = (s: string) => parseInt(s.replace('#', ''), 16);

// mulberry32 (from the gem-vault donor) — deterministic-fun payouts.
class RNG {
  private s: number;
  constructor(seed = 0x1a2b3c) { this.s = seed >>> 0; }
  next() {
    let t = (this.s += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  pickWeighted(): Sym {
    const total = SYM_WEIGHTS.reduce((a, b) => a + b.w, 0);
    let r = this.next() * total;
    for (const e of SYM_WEIGHTS) { if ((r -= e.w) <= 0) return e.sym; }
    return SYM_WEIGHTS[0].sym;
  }
}

export type ShipItOpts = {
  palette: MoonPalette;
  prefersReducedMotion: boolean;
  onReady?: () => void;
  onWon?: (payload: { modulesShipped: string[] }) => void;
};

export class ShipItScene extends Phaser.Scene {
  private p: MoonPalette;
  private rm: boolean;
  private onReady?: () => void;
  private onWon?: (payload: { modulesShipped: string[] }) => void;
  private rng = new RNG();

  private cells: Phaser.GameObjects.Container[] = [];
  private cellTimers: (Phaser.Time.TimerEvent | null)[] = [null, null, null];
  private spinning = false;
  private won = false;
  private sp = 0;

  private cur = 0; // current module index
  private progress = [0, 0, 0];
  private shipped: string[] = [];
  private modBars: Phaser.GameObjects.Rectangle[] = [];
  private modCards: Phaser.GameObjects.Container[] = [];

  private spText!: Phaser.GameObjects.Text;
  private button!: Phaser.GameObjects.Container;
  private buttonEnabled = true;

  constructor(opts: ShipItOpts) {
    super('ship-it');
    this.p = opts.palette;
    this.rm = opts.prefersReducedMotion;
    this.onReady = opts.onReady;
    this.onWon = opts.onWon;
  }

  create() {
    const P = this.p;
    // backdrop
    this.add.rectangle(0, 0, GAME_W, GAME_H, hx(P.navy)).setOrigin(0);
    this.add.rectangle(0, 0, GAME_W, GAME_H, hx('#0c2f6b'), 0.5).setOrigin(0);

    // title
    this.add.text(GAME_W / 2, 30, 'SHIP IT!', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '30px', color: P.gold, fontStyle: '800',
    }).setOrigin(0.5).setLetterSpacing(2);
    this.add.text(GAME_W / 2, 56, 'SPIN TO BUILD THE TOOLKIT', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '11px', color: P.white,
    }).setOrigin(0.5).setAlpha(0.6).setLetterSpacing(2);

    // SP counter
    this.spText = this.add.text(GAME_W - 18, 30, 'SP 0', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '13px', color: P.white, fontStyle: '700',
    }).setOrigin(1, 0.5).setAlpha(0.85);

    // reel window
    this.roundRect(26, 92, GAME_W - 52, 140, 18, hx('#00133f'), 1, hx(P.gold), 0.5, 3);
    const cellCx = [78, 200, 322];
    for (let i = 0; i < 3; i++) {
      this.roundRect(cellCx[i] - 48, 100, 96, 124, 12, hx(P.white), 1);
      const c = this.add.container(cellCx[i], 162);
      this.cells.push(c);
      this.renderSymbol(c, i === 1 ? 'wild' : i === 0 ? 'react' : 'coin');
    }

    // SHIP IT button
    this.button = this.makeButton(GAME_W / 2, 272, 'SHIP IT');
    this.button.on('pointerdown', () => this.spin());

    // workbench
    this.add.text(GAME_W / 2, 320, 'THE WORKBENCH', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '11px', color: P.gold, fontStyle: '700',
    }).setOrigin(0.5).setAlpha(0.75).setLetterSpacing(2);
    const cardCx = [76, 200, 324];
    for (let i = 0; i < 3; i++) {
      this.modCards.push(this.makeModuleCard(cardCx[i], 420, i));
    }

    // keyboard: Space to spin
    this.input.keyboard?.on('keydown-SPACE', () => this.spin());

    this.onReady?.();
  }

  // ── input / loop ─────────────────────────────────────────────────────────
  private spin() {
    if (this.spinning || this.won || !this.buttonEnabled) return;
    this.spinning = true;
    this.setButtonEnabled(false);

    const results: Sym[] = [this.rng.pickWeighted(), this.rng.pickWeighted(), this.rng.pickWeighted()];

    if (this.rm) {
      results.forEach((s, i) => this.renderSymbol(this.cells[i], s));
      this.resolve(results);
      return;
    }

    // each reel spins, stops one-by-one (slowest last) — anticipation, not gambling.
    const settle = [420, 700, 1000];
    results.forEach((res, i) => {
      const timer = this.time.addEvent({
        delay: 60, loop: true,
        callback: () => this.renderSymbol(this.cells[i], this.rng.pickWeighted()),
      });
      this.cellTimers[i] = timer;
      this.time.delayedCall(settle[i], () => {
        timer.remove();
        this.cellTimers[i] = null;
        this.renderSymbol(this.cells[i], res);
        this.pop(this.cells[i]);
        if (i === 2) this.resolve(results);
      });
    });
  }

  private resolve(results: Sym[]) {
    // deterministic-fun payout: base + wild bonuses, floored so it always progresses.
    const wilds = results.filter((s) => s === 'wild').length;
    const productive = results.filter((s) => s === 'coin' || s === 'react' || s === 'node' || s === 'wild').length;
    let gain = 0.32 + productive * 0.06 + wilds * 0.12;
    gain = Math.max(0.3, Math.min(0.7, gain));

    this.sp += Math.round(gain * 260);
    this.spText.setText('SP ' + this.sp);

    this.progress[this.cur] = Math.min(1, this.progress[this.cur] + gain);
    this.tweenBar(this.cur);

    if (this.progress[this.cur] >= 1) {
      this.shipModule(this.cur);
    } else {
      this.spinning = false;
      this.setButtonEnabled(true);
    }
  }

  private shipModule(i: number) {
    this.shipped.push(MODULES[i].key);
    this.flipCard(i);
    this.coinBurst();
    this.shippedBanner(() => {
      this.cur = i + 1;
      if (this.cur >= MODULES.length) {
        this.win();
      } else {
        this.spinning = false;
        this.setButtonEnabled(true);
      }
    });
  }

  private win() {
    this.won = true;
    const P = this.p;
    const layer = this.add.container(0, 0).setDepth(50);
    layer.add(this.add.rectangle(0, 0, GAME_W, GAME_H, hx(P.navyDeep), 0.9).setOrigin(0).setInteractive());
    layer.add(this.add.text(GAME_W / 2, 190, 'SHIPPED IT!', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '40px', color: P.gold, fontStyle: '800',
    }).setOrigin(0.5).setLetterSpacing(1));
    layer.add(this.add.text(GAME_W / 2, 244, 'You just built the exact toolkit\nthis role is about.', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '15px', color: P.white, align: 'center',
    }).setOrigin(0.5).setLineSpacing(6).setAlpha(0.85));
    const btn = this.makeButton(GAME_W / 2, 330, "LET'S TALK", layer);
    btn.on('pointerdown', () => this.onWon?.({ modulesShipped: this.shipped }));
    this.add.text(GAME_W / 2, 380, 'or spin-proof is already on the page', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '11px', color: P.white,
    }).setOrigin(0.5).setAlpha(0.5).setDepth(51);
    if (!this.rm) {
      layer.setAlpha(0);
      this.tweens.add({ targets: layer, alpha: 1, duration: 300 });
      this.coinBurst();
    }
    this.onWon?.({ modulesShipped: this.shipped });
  }

  // ── rendering helpers ─────────────────────────────────────────────────────
  private roundRect(
    x: number, y: number, w: number, h: number, r: number,
    fill: number, fillA = 1, stroke?: number, strokeA = 1, strokeW = 2,
  ) {
    const g = this.add.graphics();
    g.fillStyle(fill, fillA);
    g.fillRoundedRect(x, y, w, h, r);
    if (stroke !== undefined) { g.lineStyle(strokeW, stroke, strokeA); g.strokeRoundedRect(x, y, w, h, r); }
    return g;
  }

  private renderSymbol(c: Phaser.GameObjects.Container, sym: Sym) {
    c.removeAll(true);
    const P = this.p;
    switch (sym) {
      case 'coin': {
        c.add(this.add.circle(0, 0, 30, hx('#ffcf4d')).setStrokeStyle(3, hx('#e59a00')));
        c.add(this.add.circle(0, 0, 21, hx('#ffcf4d')).setStrokeStyle(2, hx('#e59a00'), 0.6));
        c.add(this.add.text(0, 0, 'SP', { fontFamily: 'Poppins, sans-serif', fontSize: '18px', color: '#b47700', fontStyle: '800' }).setOrigin(0.5));
        break;
      }
      case 'react': {
        for (let a = 0; a < 3; a++) c.add(this.add.ellipse(0, 0, 66, 26, 0, 0).setStrokeStyle(3, hx(P.cyan)).setAngle(a * 60));
        c.add(this.add.circle(0, 0, 5, hx(P.cyan)));
        break;
      }
      case 'node': {
        c.add(this.add.polygon(0, 0, this.hexPts(30), hx('#0c6b3f')).setStrokeStyle(3, hx('#3fae6d')));
        c.add(this.add.text(0, 1, 'JS', { fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#9be3b6', fontStyle: '800' }).setOrigin(0.5));
        break;
      }
      case 'wild': {
        c.add(this.add.star(0, 0, 5, 14, 31, hx(P.gold)).setStrokeStyle(3, hx('#b47700')));
        c.add(this.add.circle(0, 1, 6, hx('#fff6df')));
        break;
      }
      case 'shield': {
        c.add(this.add.polygon(0, -2, this.shieldPts(28), hx('#1b6fd0')).setStrokeStyle(3, hx('#7fb6ee')));
        const g = this.add.graphics();
        g.lineStyle(3, hx(P.white), 1);
        g.beginPath(); g.moveTo(-8, 0); g.lineTo(-2, 7); g.lineTo(9, -6); g.strokePath();
        c.add(g);
        break;
      }
      case 'bug': {
        c.add(this.add.ellipse(0, 3, 34, 40, hx('#e14a3b')).setStrokeStyle(3, hx('#a52a1f')));
        c.add(this.add.circle(0, -14, 7, hx('#e14a3b')).setStrokeStyle(3, hx('#a52a1f')));
        const g = this.add.graphics();
        g.lineStyle(2.5, hx('#a52a1f'), 1);
        [-14, 0, 14].forEach((yy) => { g.beginPath(); g.moveTo(-17, yy); g.lineTo(-30, yy - 6); g.moveTo(17, yy); g.lineTo(30, yy - 6); g.strokePath(); });
        c.add(g);
        break;
      }
    }
  }

  private hexPts(r: number): number[] {
    const pts: number[] = [];
    for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 2; pts.push(Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)); }
    return pts;
  }
  private shieldPts(r: number): number[] {
    return [0, -r, r, -r * 0.6, r, r * 0.35, 0, r, -r, r * 0.35, -r, -r * 0.6];
  }

  private makeButton(x: number, y: number, label: string, parent?: Phaser.GameObjects.Container) {
    const P = this.p;
    const c = this.add.container(x, y);
    const w = 200, h = 52;
    const shadow = this.add.graphics();
    shadow.fillStyle(hx('#e59a00'), 1); shadow.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 14);
    const face = this.add.graphics();
    face.fillStyle(hx(P.gold), 1); face.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    const txt = this.add.text(0, 0, label, { fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '18px', color: P.navyDeep, fontStyle: '800' }).setOrigin(0.5).setLetterSpacing(1);
    c.add([shadow, face, txt]);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    if (parent) { parent.add(c); c.setDepth(52); }
    return c;
  }

  private makeModuleCard(x: number, y: number, i: number) {
    const P = this.p;
    const c = this.add.container(x, y);
    const w = 112, h = 168;
    const bg = this.add.graphics();
    bg.fillStyle(hx('#0a2450'), 1); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(1.5, hx(P.white), 0.14); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    c.add(bg);
    // icon chip
    c.add(this.add.circle(0, -h / 2 + 30, 18, hx(P.cyan), 0.16).setStrokeStyle(1.5, hx(P.cyan), 0.5));
    c.add(this.add.text(0, -h / 2 + 30, String(i + 1), { fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: P.cyan, fontStyle: '800' }).setOrigin(0.5));
    // name
    c.add(this.add.text(0, -h / 2 + 60, MODULES[i].name, { fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: P.white, fontStyle: '700', align: 'center', wordWrap: { width: w - 16 } }).setOrigin(0.5, 0));
    // progress bar
    const barY = h / 2 - 22, barW = w - 28;
    const track = this.add.graphics(); track.fillStyle(hx(P.white), 0.14); track.fillRoundedRect(-barW / 2, barY, barW, 7, 4); c.add(track);
    const bar = this.add.rectangle(-barW / 2, barY, 1, 7, hx(P.gold)).setOrigin(0, 0);
    (bar as unknown as { _barW: number })._barW = barW;
    this.modBars[i] = bar;
    c.add(bar);
    return c;
  }

  private tweenBar(i: number) {
    const bar = this.modBars[i];
    const barW = (bar as unknown as { _barW: number })._barW;
    const target = Math.max(1, barW * this.progress[i]);
    if (this.rm) { bar.width = target; return; }
    this.tweens.add({ targets: bar, width: target, duration: 320, ease: 'Cubic.Out' });
  }

  private flipCard(i: number) {
    const P = this.p;
    const c = this.modCards[i];
    const reveal = () => {
      c.removeAll(true);
      const w = 112, h = 168;
      const bg = this.add.graphics();
      bg.fillStyle(hx('#0c6b3f'), 1); bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      bg.lineStyle(1.5, hx('#3fae6d'), 0.8); bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
      c.add(bg);
      const g = this.add.graphics(); g.lineStyle(3, hx(P.white), 1);
      g.beginPath(); g.moveTo(-7, -h / 2 + 26); g.lineTo(-1, -h / 2 + 33); g.lineTo(10, -h / 2 + 20); g.strokePath();
      c.add(g);
      c.add(this.add.text(0, -h / 2 + 46, 'SHIPPED', { fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#9be3b6', fontStyle: '800' }).setOrigin(0.5).setLetterSpacing(1));
      c.add(this.add.text(0, -6, MODULES[i].proof, { fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: P.white, align: 'center', wordWrap: { width: w - 18 }, lineSpacing: 3 }).setOrigin(0.5));
    };
    if (this.rm) { reveal(); return; }
    this.tweens.add({
      targets: c, scaleX: 0, duration: 160, ease: 'Cubic.In',
      onComplete: () => { reveal(); this.tweens.add({ targets: c, scaleX: 1, duration: 200, ease: 'Cubic.Out' }); },
    });
  }

  private pop(c: Phaser.GameObjects.Container) {
    if (this.rm) return;
    this.tweens.add({ targets: c, scale: 1.12, duration: 90, yoyo: true, ease: 'Quad.Out' });
  }

  private coinBurst() {
    if (this.rm) return;
    const cx = GAME_W / 2, cy = 200;
    for (let i = 0; i < 16; i++) {
      const coin = this.add.circle(cx, cy, 7, hx('#ffcf4d')).setStrokeStyle(2, hx('#e59a00')).setDepth(60);
      const ang = (Math.PI * 2 * i) / 16 + this.rng.next();
      const dist = 90 + this.rng.next() * 70;
      this.tweens.add({
        targets: coin, x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist - 20, alpha: 0, scale: 0.4,
        duration: 620 + this.rng.next() * 220, ease: 'Cubic.Out', onComplete: () => coin.destroy(),
      });
    }
  }

  private shippedBanner(after: () => void) {
    const P = this.p;
    if (this.rm) { after(); return; }
    const t = this.add.text(GAME_W / 2, 200, 'SHIPPED!', {
      fontFamily: 'Poppins, system-ui, sans-serif', fontSize: '44px', color: P.gold, fontStyle: '800',
    }).setOrigin(0.5).setDepth(61).setScale(0).setLetterSpacing(1);
    this.tweens.add({
      targets: t, scale: 1, duration: 260, ease: 'Back.Out',
      onComplete: () => this.time.delayedCall(520, () => this.tweens.add({
        targets: t, alpha: 0, y: 176, duration: 260, onComplete: () => { t.destroy(); after(); },
      })),
    });
  }

  private setButtonEnabled(on: boolean) {
    this.buttonEnabled = on;
    this.button.setAlpha(on ? 1 : 0.55);
    if (on) this.button.setInteractive({ useHandCursor: true }); else this.button.disableInteractive();
  }
}
