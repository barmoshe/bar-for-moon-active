/**
 * Button.ts — a rounded pill button (SHIP IT lever, Play the build, HIRE). Soft-painted, no
 * outline (art §10), with a visible focus ring for keyboard a11y (§11) and a springy press.
 * Rendering is procedural (rounded-rect graphics + text) so it recolors with the palette.
 */

import Phaser from 'phaser';
import { GameContext } from '../core/context';
import { DISPLAY_FONT } from './fonts';

export interface ButtonOpts {
  label: string;
  width: number;
  height: number;
  fill: number;
  textColor: string;
  fontSize?: number;
  onClick: () => void;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private focusRing: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private bw: number;
  private bh: number;
  private enabled = true;
  private gc: GameContext;
  private onClick: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, gc: GameContext, opts: ButtonOpts) {
    super(scene, x, y);
    this.gc = gc;
    this.bw = opts.width;
    this.bh = opts.height;
    this.onClick = opts.onClick;

    this.focusRing = scene.add.graphics();
    this.bg = scene.add.graphics();
    this.drawBg(opts.fill, false);

    this.label = scene.add
      .text(0, 0, opts.label, {
        fontFamily: DISPLAY_FONT,
        fontSize: `${opts.fontSize ?? 22}px`,
        color: opts.textColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add([this.focusRing, this.bg, this.label]);
    scene.add.existing(this);

    this.setSize(this.bw, this.bh);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.bw / 2, -this.bh / 2, this.bw, this.bh),
      Phaser.Geom.Rectangle.Contains,
    );
    this.on('pointerover', () => this.scene && this.setScale(1.03));
    this.on('pointerout', () => this.scene && this.setScale(1));
    this.on('pointerdown', () => this.press());
  }

  private drawBg(fill: number, focused: boolean): void {
    const r = this.bh / 2;
    this.bg.clear();
    // soft drop shadow
    this.bg.fillStyle(this.gc.c.black, 0.28);
    this.bg.fillRoundedRect(-this.bw / 2, -this.bh / 2 + 5, this.bw, this.bh, r);
    this.bg.fillStyle(fill, 1);
    this.bg.fillRoundedRect(-this.bw / 2, -this.bh / 2, this.bw, this.bh, r);
    // top sheen
    this.bg.fillStyle(0xffffff, 0.16);
    this.bg.fillRoundedRect(-this.bw / 2 + 6, -this.bh / 2 + 4, this.bw - 12, this.bh * 0.42, r * 0.8);

    this.focusRing.clear();
    if (focused) {
      this.focusRing.lineStyle(4, this.gc.c.white, 0.95);
      this.focusRing.strokeRoundedRect(-this.bw / 2 - 6, -this.bh / 2 - 6, this.bw + 12, this.bh + 12, r + 4);
    }
  }

  setFocused(v: boolean, fill: number): void {
    this.drawBg(fill, v);
  }

  press(): void {
    if (!this.enabled) return;
    // cosmetic bounce only — the action fires directly so it never depends on a tween completing
    this.scene.tweens.add({
      targets: this,
      scale: 0.94,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
    this.onClick();
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    this.setAlpha(v ? 1 : 0.5);
  }

  setLabel(s: string): void {
    this.label.setText(s);
  }
}
