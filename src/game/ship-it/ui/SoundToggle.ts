/**
 * SoundToggle — a small top-corner speaker button. Sound OFF by default (§11); click toggles the
 * AudioEngine and persists the choice. Keyboard reachable via the scene's focus order too.
 */

import Phaser from 'phaser';
import { GameContext } from '../core/context';
import { AudioEngine } from '../core/audio';
import { saveSoundPref } from '../core/prefs';

export class SoundToggle extends Phaser.GameObjects.Container {
  private gc: GameContext;
  private audio: AudioEngine;
  private g: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, gc: GameContext, audio: AudioEngine) {
    super(scene, x, y);
    this.gc = gc;
    this.audio = audio;
    this.g = scene.add.graphics();
    this.add(this.g);
    this.draw();
    scene.add.existing(this);

    this.setSize(40, 40);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-20, -20, 40, 40),
      Phaser.Geom.Rectangle.Contains,
    );
    this.on('pointerdown', () => this.toggle());
  }

  toggle(): void {
    const on = !this.gc.soundOn;
    this.gc.soundOn = on;
    this.audio.setEnabled(on);
    saveSoundPref(on);
    if (on) this.audio.coin();
    this.draw();
  }

  private draw(): void {
    const c = this.gc;
    const on = c.soundOn;
    this.g.clear();
    this.g.fillStyle(c.c.ink, 0.7);
    this.g.fillCircle(0, 0, 18);
    const col = on ? c.c.gold : c.c.skyBlue;
    // speaker body
    this.g.fillStyle(col, 1);
    this.g.fillRect(-9, -5, 5, 10);
    this.g.fillTriangle(-4, -8, -4, 8, 5, 0);
    if (on) {
      this.g.lineStyle(2, col, 1);
      this.g.beginPath();
      this.g.arc(4, 0, 7, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
      this.g.strokePath();
      this.g.beginPath();
      this.g.arc(4, 0, 11, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45), false);
      this.g.strokePath();
    } else {
      // mute slash
      this.g.lineStyle(2.5, c.c.red, 1);
      this.g.lineBetween(2, -8, 12, 8);
    }
  }
}
