/**
 * WorkbenchView — the shelf of internal-tool cards that fill as you play (game-design.md §6, §8).
 * Each card has a progress ring; completing it flips the card to a SHIPPED! state that reveals the
 * real Bar proof point. This is the resume disguised as the village. Soft-painted, drop shadow
 * under each card (art §10). No em dashes in any shipped string (§11).
 */

import Phaser from 'phaser';
import { GameContext } from '../core/context';
import { MODULES } from '../workbench/modules';
import { DISPLAY_FONT, BODY_FONT } from './fonts';

interface Card {
  root: Phaser.GameObjects.Container;
  ring: Phaser.GameObjects.Graphics;
  ringPct: Phaser.GameObjects.Text;
  title: Phaser.GameObjects.Text;
  sub: Phaser.GameObjects.Text;
  stamp: Phaser.GameObjects.Container;
  glow: Phaser.GameObjects.Graphics;
  tint: number;
  shipped: boolean;
  cx: number;
  cy: number;
}

const CARD_W = 176;
const CARD_H = 150;
const GAP = 12;
const RING_R = 26;

export class WorkbenchView extends Phaser.GameObjects.Container {
  private gc: GameContext;
  private cards: Card[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, gc: GameContext) {
    super(scene, x, y);
    this.gc = gc;

    const cols = 2;
    const totalW = cols * CARD_W + (cols - 1) * GAP;
    const startX = -totalW / 2 + CARD_W / 2;
    MODULES.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = startX + col * (CARD_W + GAP);
      const cy = row * (CARD_H + GAP);
      this.cards.push(this.buildCard(scene, m.key, cx, cy, gc.c[m.tint]));
    });
    scene.add.existing(this);
  }

  private buildCard(
    scene: Phaser.Scene,
    key: string,
    cx: number,
    cy: number,
    tint: number,
  ): Card {
    const m = MODULES.find((mm) => mm.key === key)!;
    const root = scene.add.container(cx, cy);
    const gc = this.gc;

    const glow = scene.add.graphics();
    const bg = scene.add.graphics();
    bg.fillStyle(gc.c.black, 0.3);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2 + 5, CARD_W, CARD_H, 16);
    bg.fillStyle(this.mix(gc.css.navy, gc.css.white, 0.06), 1);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16);
    bg.fillStyle(tint, 0.14);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, 6, 16);

    const ring = scene.add.graphics();
    const ringPct = scene.add
      .text(0, -CARD_H / 2 + 34, '0%', {
        fontFamily: DISPLAY_FONT,
        fontSize: '15px',
        color: gc.css.white,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const title = scene.add
      .text(0, -CARD_H / 2 + 76, m.name, {
        fontFamily: DISPLAY_FONT,
        fontSize: '15px',
        color: gc.css.white,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: CARD_W - 20 },
      })
      .setOrigin(0.5, 0);

    const sub = scene.add
      .text(0, CARD_H / 2 - 30, m.maps, {
        fontFamily: BODY_FONT,
        fontSize: '10px',
        color: gc.css.skyBlue,
        align: 'center',
        wordWrap: { width: CARD_W - 22 },
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0.85);

    // SHIPPED stamp (hidden until ship)
    const stamp = scene.add.container(0, -CARD_H / 2 + 34);
    const stampBg = scene.add.graphics();
    stampBg.fillStyle(gc.c.gold, 1);
    stampBg.fillRoundedRect(-52, -14, 104, 28, 14);
    const stampText = scene.add
      .text(0, 0, 'SHIPPED!', {
        fontFamily: DISPLAY_FONT,
        fontSize: '15px',
        color: gc.css.navyDeep,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    stamp.add([stampBg, stampText]);
    stamp.setVisible(false);

    root.add([glow, bg, ring, ringPct, title, sub, stamp]);
    this.add(root);

    const card: Card = {
      root,
      ring,
      ringPct,
      title,
      sub,
      stamp,
      glow,
      tint,
      shipped: false,
      cx,
      cy,
    };
    this.drawRing(card, 0);
    return card;
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

  private drawRing(card: Card, ratio: number): void {
    const g = card.ring;
    const cy = -CARD_H / 2 + 34;
    g.clear();
    g.lineStyle(6, this.gc.c.ink, 1);
    g.strokeCircle(0, cy, RING_R);
    if (ratio > 0) {
      g.lineStyle(6, card.tint, 1);
      g.beginPath();
      g.arc(
        0,
        cy,
        RING_R,
        Phaser.Math.DegToRad(-90),
        Phaser.Math.DegToRad(-90 + 360 * Math.min(1, ratio)),
        false,
      );
      g.strokePath();
    }
  }

  setProgress(index: number, ratio: number): void {
    const card = this.cards[index];
    if (!card || card.shipped) return;
    this.drawRing(card, ratio);
    card.ringPct.setText(`${Math.round(Math.min(1, ratio) * 100)}%`);
  }

  highlightActive(index: number): void {
    this.cards.forEach((card, i) => {
      card.glow.clear();
      if (i === index && !card.shipped) {
        card.glow.lineStyle(3, card.tint, 0.9);
        card.glow.strokeRoundedRect(
          -CARD_W / 2 - 3,
          -CARD_H / 2 - 3,
          CARD_W + 6,
          CARD_H + 6,
          18,
        );
      }
    });
  }

  /** the SHIPPED! reveal: fill the ring, stamp it, swap the subtitle to the real proof point. */
  ship(index: number, reducedMotion: boolean): Promise<void> {
    const card = this.cards[index];
    if (!card || card.shipped) return Promise.resolve();
    card.shipped = true;
    const m = MODULES[index];
    this.drawRing(card, 1);
    card.ringPct.setText('');
    card.glow.clear();

    const reveal = (): void => {
      card.stamp.setVisible(true);
      card.ringPct.setText('');
      card.sub.setText(m.proof).setColor(card === this.cards[index] ? this.gc.css.white : this.gc.css.white);
      card.sub.setFontSize(10).setAlpha(1);
    };

    return new Promise<void>((resolve) => {
      if (reducedMotion) {
        reveal();
        resolve();
        return;
      }
      // Cosmetic flip; the reveal + resolve are driven by delayedCall so the loop never depends on
      // a tween's onComplete firing.
      this.scene.tweens.add({ targets: card.root, scaleX: 0, duration: 150, ease: 'Quad.easeIn' });
      this.scene.time.delayedCall(160, () => {
        reveal();
        this.scene.tweens.add({ targets: card.root, scaleX: 1, duration: 200, ease: 'Back.easeOut' });
      });
      this.scene.time.delayedCall(380, () => resolve());
    });
  }

  /** scene-space position of a card (for particle bursts on ship) */
  cardWorld(index: number): { x: number; y: number } {
    const card = this.cards[index];
    return { x: this.x + card.cx, y: this.y + card.cy };
  }

  get cardCount(): number {
    return this.cards.length;
  }

  /** a tiny wobble on a card, instantly recovered — the cosmetic "break + hotfix" beat (never a loss) */
  wobble(index: number): void {
    const card = this.cards[index];
    if (!card) return;
    this.scene.tweens.add({
      targets: card.root,
      angle: { from: -3, to: 3 },
      duration: 60,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => (card.root.angle = 0),
    });
  }
}
