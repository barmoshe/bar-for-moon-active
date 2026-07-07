/**
 * createShipItGame.ts — THE factory (game-agent-convention.md entry shape).
 *
 * A lifecycle factory, NOT a module-level `new Phaser.Game()`: the React shim owns mount/destroy
 * so it is StrictMode-safe and can pass the resolved brand palette + reduced-motion + a shared
 * EventBus in. Standalone gamestudio dev (dev.ts) calls the exact same factory.
 *
 *   createShipItGame({ parent, palette?, prefersReducedMotion?, emitter? }) -> Phaser.Game
 *
 * The game is self-contained: it bundles Phaser, generates all art procedurally at Boot (later a
 * recolored CC0 atlas), makes zero network calls, and surfaces exactly `game:ready` / `game:won`.
 */

import Phaser from 'phaser';
import { MoonPalette, resolvePalette } from './core/palette';
import { Bus, makeBus } from './core/bus';
import { buildContext, setContext } from './core/context';
import { loadSoundPref } from './core/prefs';
import { BootScene } from './scenes/BootScene';
import { HeroScene } from './scenes/HeroScene';
import { GameScene } from './scenes/GameScene';
import { WinScene } from './scenes/WinScene';

export interface ShipItConfig {
  parent: HTMLElement | string;
  palette?: Partial<MoonPalette> | null;
  prefersReducedMotion?: boolean;
  emitter?: Bus;
}

export const LOGICAL_W = 390;
export const LOGICAL_H = 844;

export function createShipItGame(cfg: ShipItConfig): Phaser.Game {
  const palette = resolvePalette(cfg.palette);
  const bus = cfg.emitter ?? makeBus();
  const reducedMotion = !!cfg.prefersReducedMotion;
  const ctx = buildContext(palette, reducedMotion, bus, loadSoundPref());

  const game = new Phaser.Game({
    type: Phaser.AUTO, // WebGL with an automatic Canvas fallback
    parent: cfg.parent,
    backgroundColor: palette.navyDeep,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: LOGICAL_W,
      height: LOGICAL_H,
    },
    fps: { target: 60, forceSetTimeOut: false },
    scene: [BootScene, HeroScene, GameScene, WinScene],
  });

  setContext(game, ctx);
  return game;
}
