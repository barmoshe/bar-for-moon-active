/**
 * HeroScene — the one-spin hero teaser (game-design.md §9). On load it plays ONE slow anticipatory
 * spin that lands on the AI-Assist wild jackpot, with a one-line hook, then a "Play the build"
 * button drops the player into the full loop. Under reduced motion it renders a static jackpot
 * frame (no auto-spin) and just shows the button. Three-second delight, zero commitment.
 */

import Phaser from 'phaser';
import { ctx, GameContext } from '../core/context';
import { Fx } from '../core/fx';
import { ReelView } from '../ui/ReelView';
import { Background } from '../ui/Background';
import { Button } from '../ui/Button';
import { HERO_LINE } from '../reel/spin';
import { DISPLAY_FONT, BODY_FONT } from '../ui/fonts';

export class HeroScene extends Phaser.Scene {
  private gc!: GameContext;

  constructor() {
    super('Hero');
  }

  create(): void {
    this.gc = ctx(this);
    const gc = this.gc;
    const W = this.scale.width;

    this.cameras.main.setBackgroundColor(gc.c.navyDeep);
    new Background(this, gc);

    if (this.textures.exists('logo_shipit')) {
      const logo = this.add.image(W / 2, 120, 'logo_shipit').setOrigin(0.5);
      logo.setScale(Math.min(320 / logo.width, 1));
    } else {
      this.add
        .text(W / 2, 120, 'Ship It!', {
          fontFamily: DISPLAY_FONT,
          fontSize: '54px',
          color: gc.css.gold,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }
    this.add
      .text(W / 2, 182, 'the internal AI tools that make game teams faster', {
        fontFamily: BODY_FONT,
        fontSize: '13px',
        color: gc.css.skyBlue,
        align: 'center',
        wordWrap: { width: 300 },
      })
      .setOrigin(0.5);

    const reel = new ReelView(this, W / 2, 340, gc);
    const fx = new Fx(this, gc, 40);

    const hook = this.add
      .text(W / 2, 456, 'Spin to see why I fit', {
        fontFamily: DISPLAY_FONT,
        fontSize: '20px',
        color: gc.css.white,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const play = new Button(this, W / 2, 560, gc, {
      label: 'Play the build',
      width: 220,
      height: 58,
      fill: gc.c.gold,
      textColor: gc.css.navyDeep,
      fontSize: 22,
      onClick: () => this.scene.start('Game'),
    });
    play.setFocused(true, gc.c.gold);
    play.setAlpha(0);

    const revealCta = (): void => {
      this.tweens.add({ targets: [hook, play], alpha: 1, duration: 300, ease: 'Quad.easeOut' });
      const c = reel.reelWorld(1);
      fx.coinBurst(c.x, c.y, gc.c.gold);
      fx.bloomFlash(gc.c.gold, 0.22);
    };

    // Space / tap anywhere skips straight into the build
    this.input.keyboard?.on('keydown-SPACE', (e: KeyboardEvent) => {
      e.preventDefault();
      this.scene.start('Game');
    });

    if (gc.reducedMotion) {
      reel.setLineInstant(HERO_LINE);
      hook.setAlpha(1);
      play.setAlpha(1);
      return;
    }

    this.time.delayedCall(360, () => {
      void reel.spinTo(HERO_LINE, { reducedMotion: false }).then(revealCta);
    });
  }
}
