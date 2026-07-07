/**
 * symbols.ts — the six reel symbols (game-design.md §7). PURE data + classification, no Phaser.
 *
 * Each symbol carries a `key` (atlas frame + logic id), a display `name`, a `kind` that drives
 * payout/flavor, and the palette token used to tint it. The reel symbols are the ONLY things in
 * the game that get a tinted outline (the one Coin Master grammar rule we keep, §10) — that is a
 * render concern, but the outline tint token lives here so art + logic agree.
 */

export type SymbolKey =
  | 'story_point'
  | 'frontend'
  | 'backend'
  | 'ai_wild'
  | 'qa_shield'
  | 'bug';

export type SymbolKind = 'coin' | 'tech' | 'wild' | 'shield' | 'bug';

/** which module family a tech symbol favors (flavor bonus only, never a gate) */
export type Flavor = 'ui' | 'service' | null;

export interface SymbolDef {
  key: SymbolKey;
  name: string;
  kind: SymbolKind;
  flavor: Flavor;
  /** palette token name (see MoonPalette) used for the symbol's tint + outline */
  tint: 'gold' | 'cyan' | 'skyBlue' | 'white' | 'red';
}

export const SYMBOLS: readonly SymbolDef[] = [
  { key: 'story_point', name: 'Story Point', kind: 'coin', flavor: null, tint: 'gold' },
  { key: 'frontend', name: 'Frontend', kind: 'tech', flavor: 'ui', tint: 'cyan' },
  { key: 'backend', name: 'Backend', kind: 'tech', flavor: 'service', tint: 'skyBlue' },
  { key: 'ai_wild', name: 'AI Assist', kind: 'wild', flavor: null, tint: 'gold' },
  { key: 'qa_shield', name: 'Tests / QA', kind: 'shield', flavor: null, tint: 'cyan' },
  { key: 'bug', name: 'Setback', kind: 'bug', flavor: null, tint: 'red' },
] as const;

/** stable index order used by the reel weights in TUNING.WEIGHTS */
export const SYMBOL_ORDER: readonly SymbolKey[] = SYMBOLS.map((s) => s.key);

const BY_KEY: Record<SymbolKey, SymbolDef> = SYMBOLS.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<SymbolKey, SymbolDef>,
);

export function symbol(key: SymbolKey): SymbolDef {
  return BY_KEY[key];
}

/** The AI wild substitutes for any symbol when computing matches (§7). */
export function isWild(key: SymbolKey): boolean {
  return key === 'ai_wild';
}
