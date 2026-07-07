/**
 * WinScene — the HIRE screen (game-design.md §6, §14). The workbench is full: the player has
 * assembled exactly the toolkit the role asks for, every piece a true Bar proof point. Fires the
 * embed contract's `game:won` with modulesShipped so the site can reveal its own contact CTA. In
 * canvas we celebrate (star shower + fanfare) and show the four shipped proofs + a HIRE button.
 * No em dashes in any shipped string (§11).
 */

import Phaser from 'phaser';
import { ctx, GameContext } from '../core/context';
import { EVENTS } from '../core/bus';
import { Fx } from '../core/fx';
import { Background } from '../ui/Background';
import { AudioEngine } from '../core/audio';
import { Button } from '../ui/Button';
import { MODULES } from '../workbench/modules';
import { DISPLAY_FONT, BODY_FONT } from '../ui/fonts';

interface WinData {
  modulesShipped?: string[];
}

export class WinScene extends Phaser.Scene {
  private gc!: GameContext;

  constructor() {
    super('Win');
  }

  create(data: WinData): void {
    this.gc = ctx(this);
    const gc = this.gc;
    const W = this.scale.width;
    const shipped = data.modulesShipped ?? MODULES.map((m) => m.key);

    this.cameras.main.setBackgroundColor(gc.c.navyDeep);
    new Background(this, gc);

    const fx = new Fx(this, gc, 40);
    const audio = new AudioEngine();
    audio.setEnabled(gc.soundOn);

    this.add
      .text(W / 2, 96, 'SHIPPED!', {
        fontFamily: DISPLAY_FONT,
        fontSize: '58px',
        color: gc.css.gold,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(W / 2, 150, 'The toolkit is live. Every tool is a real thing I have built.', {
        fontFamily: BODY_FONT,
        fontSize: '13px',
        color: gc.css.white,
        align: 'center',
        wordWrap: { width: 320 },
      })
      .setOrigin(0.5)
      .setAlpha(0.9);

    // the four shipped proofs, in ship order
    let y = 220;
    for (const key of shipped) {
      const m = MODULES.find((mm) => mm.key === key);
      if (!m) continue;
      const row = this.add.container(W / 2, y);
      const g = this.add.graphics();
      g.fillStyle(gc.c.ink, 0.8);
      g.fillRoundedRect(-170, -30, 340, 60, 14);
      g.fillStyle(gc.c[m.tint], 1);
      g.fillRoundedRect(-170, -30, 6, 60, 3);
      const name = this.add
        .text(-150, -14, m.name, {
          fontFamily: DISPLAY_FONT,
          fontSize: '14px',
          color: gc.css.gold,
          fontStyle: 'bold',
        })
        .setOrigin(0, 0);
      const proof = this.add
        .text(-150, 4, m.proof, {
          fontFamily: BODY_FONT,
          fontSize: '10.5px',
          color: gc.css.white,
          wordWrap: { width: 300 },
        })
        .setOrigin(0, 0)
        .setAlpha(0.9);
      row.add([g, name, proof]);
      y += 70;
    }

    const hire = new Button(this, W / 2, y + 26, gc, {
      label: 'Hire Bar',
      width: 220,
      height: 58,
      fill: gc.c.gold,
      textColor: gc.css.navyDeep,
      fontSize: 22,
      onClick: () => {
        fx.starBurst(W / 2, 250);
        if (gc.soundOn) audio.fanfare();
      },
    });
    hire.setFocused(true, gc.c.gold);

    const again = this.add
      .text(W / 2, y + 72, 'spin again', {
        fontFamily: BODY_FONT,
        fontSize: '12px',
        color: gc.css.skyBlue,
      })
      .setOrigin(0.5)
      .setAlpha(0.75)
      .setInteractive({ useHandCursor: true });
    again.on('pointerdown', () => this.scene.start('Game'));

    // celebrate + fire the contract event
    this.time.delayedCall(120, () => {
      fx.starBurst(W / 2, 250);
      fx.bloomFlash(gc.c.gold, 0.3);
      if (gc.soundOn) audio.fanfare();
    });
    gc.bus.emit(EVENTS.WON, { modulesShipped: shipped });
  }
}
