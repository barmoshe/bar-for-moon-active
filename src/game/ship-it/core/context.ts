/**
 * context.ts — the per-game shared context, stashed on the registry by the factory and read by
 * every scene. It carries the resolved brand palette (both as hex strings for canvas text and as
 * 0xRRGGBB ints for Phaser color args), the reduced-motion flag (from the embed prop or the OS),
 * the EventBus, and the live sound-on flag. Scenes ask the context, never the DOM.
 */

import Phaser from 'phaser';
import { MoonPalette, toInt } from './palette';
import { Bus } from './bus';

export type ColorInts = Record<keyof MoonPalette, number>;

export interface GameContext {
  /** brand hexes ('#RRGGBB') for canvas text color + CSS-ish use */
  css: MoonPalette;
  /** brand colors as 0xRRGGBB ints for Phaser fill/tint args */
  c: ColorInts;
  reducedMotion: boolean;
  bus: Bus;
  /** live sound-on flag (mutable; the sound toggle flips it) */
  soundOn: boolean;
}

export function buildContext(
  palette: MoonPalette,
  reducedMotion: boolean,
  bus: Bus,
  soundOn: boolean,
): GameContext {
  const c = {} as ColorInts;
  (Object.keys(palette) as (keyof MoonPalette)[]).forEach((k) => {
    c[k] = toInt(palette[k]);
  });
  return { css: palette, c, reducedMotion, bus, soundOn };
}

const KEY = 'ctx';

export function setContext(game: Phaser.Game, ctx: GameContext): void {
  game.registry.set(KEY, ctx);
}

export function ctx(scene: Phaser.Scene): GameContext {
  return scene.registry.get(KEY) as GameContext;
}
