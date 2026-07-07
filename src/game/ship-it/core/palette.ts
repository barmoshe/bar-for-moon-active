/**
 * palette.ts — the Moon Active brand palette, the ONE source of color for the game.
 *
 * The embed contract (game-agent-convention.md) says the site passes the resolved brand
 * hexes in via a `palette` prop so the game harmonizes and hard-codes nothing. This module
 * therefore exposes:
 *   - the `MoonPalette` type (kept identical to the site's canonical declaration), and
 *   - `DEFAULT_PALETTE`, the handoff hexes, used ONLY for standalone gamestudio dev.
 *
 * At embed time the React shim calls `resolvePalette(props.palette)`; standalone dev falls
 * back to DEFAULT_PALETTE. `toInt()` converts a #hex string to the 0xRRGGBB number Phaser wants.
 */

export interface MoonPalette {
  black: string;
  navy: string;
  navyDeep: string;
  ink: string;
  gold: string;
  cyan: string;
  skyBlue: string;
  red: string;
  white: string;
}

/** Handoff palette (bar-for-moon-active site tokens, read from moonactive.com at site build). */
export const DEFAULT_PALETTE: MoonPalette = {
  black: '#000000',
  navy: '#041852',
  navyDeep: '#090821',
  ink: '#04164F',
  gold: '#FFAD00',
  cyan: '#01AFE8',
  skyBlue: '#599DE6',
  red: '#E42313',
  white: '#FFFFFF',
};

/** Fill any missing keys from DEFAULT so a partial palette from the site never crashes the game. */
export function resolvePalette(p?: Partial<MoonPalette> | null): MoonPalette {
  return { ...DEFAULT_PALETTE, ...(p ?? {}) };
}

/** '#RRGGBB' -> 0xRRGGBB for Phaser color args. Accepts with/without '#'. */
export function toInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16) & 0xffffff;
}

/**
 * A tiny derived-color helper: mix two hex colors by t in [0,1]. Used for soft-painted
 * gradients / tints (art-direction §10) without baking extra assets.
 */
export function mix(a: string, b: string, t: number): number {
  const ca = toInt(a);
  const cb = toInt(b);
  const ar = (ca >> 16) & 0xff;
  const ag = (ca >> 8) & 0xff;
  const ab = ca & 0xff;
  const br = (cb >> 16) & 0xff;
  const bg = (cb >> 8) & 0xff;
  const bb = cb & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
