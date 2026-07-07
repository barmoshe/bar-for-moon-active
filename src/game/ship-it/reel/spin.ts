/**
 * spin.ts — the PURE spin resolver (game-design.md §7). No Phaser, fully deterministic from an RNG.
 *
 * THE GUARDRAIL, IN CODE (§3, §11 "no gambling feel"):
 *   - every spin returns `points >= TUNING.SPIN_FLOOR` (> 0), so the workbench always advances;
 *   - points are only ever ADDED by the caller, never subtracted anywhere;
 *   - "setback" (three bugs) is a cosmetic break + instant hotfix — it holds a beat, costs nothing;
 *   - there is no stake, no bet, and no reachable "you lost your points" outcome.
 *
 * The AI wild substitutes for any symbol AND doubles the resolved payout (the role's AI hook made
 * literal: "AI makes everything ship faster"). The reel weights (TUNING.WEIGHTS) are rigged so the
 * wild shows up often and progress trends up; near-misses exist only to make wins feel earned.
 */

import { RNG } from '../core/rng';
import { TUNING } from '../core/tuning';
import { SYMBOL_ORDER, SymbolKey, symbol, isWild } from './symbols';

export type MatchTier = 'setback' | 'single' | 'match2' | 'jackpot';

export interface SpinOutcome {
  /** the three landed symbols, left to right (one per reel) */
  line: [SymbolKey, SymbolKey, SymbolKey];
  /** Story Points awarded this spin (always >= SPIN_FLOOR) */
  points: number;
  tier: MatchTier;
  wildCount: number;
  /** QA shield charges granted this spin (one per shield symbol) */
  shieldDelta: number;
  /** bug symbols this spin (accrue toward a cosmetic break) */
  bugDelta: number;
  /** true when this spin's bug accrual should trigger the break beat (decided by economy) */
  /** short human label for the payout toast */
  label: string;
}

function baseValue(key: SymbolKey): number {
  const k = symbol(key).kind;
  if (k === 'coin' || k === 'wild') return TUNING.COIN_VALUE;
  if (k === 'tech') return TUNING.TECH_VALUE;
  if (k === 'shield') return TUNING.SHIELD_VALUE;
  return 0; // bug
}

/** Draw one reel symbol from the weighted table. */
function drawSymbol(rng: RNG): SymbolKey {
  return SYMBOL_ORDER[rng.weightedIndex(TUNING.WEIGHTS as unknown as number[])];
}

/** Resolve a full three-reel spin into a payout outcome. Deterministic given `rng`. */
export function resolveSpin(rng: RNG): SpinOutcome {
  const line: [SymbolKey, SymbolKey, SymbolKey] = [
    drawSymbol(rng),
    drawSymbol(rng),
    drawSymbol(rng),
  ];

  let wildCount = 0;
  let bugCount = 0;
  let shieldDelta = 0;
  const payableCounts = new Map<SymbolKey, number>();
  let basePool = 0;

  for (const key of line) {
    basePool += baseValue(key);
    const kind = symbol(key).kind;
    if (isWild(key)) wildCount++;
    else if (kind === 'bug') bugCount++;
    else {
      if (kind === 'shield') shieldDelta++;
      payableCounts.set(key, (payableCounts.get(key) ?? 0) + 1);
    }
  }

  // Best line match: the biggest single-key group among payables, completed by wilds.
  // Wild substitutes for ANY symbol, so it always joins the strongest group.
  let topPayable = 0;
  for (const n of payableCounts.values()) topPayable = Math.max(topPayable, n);
  const lineMatch = Math.min(3, topPayable + wildCount); // 0..3

  let tier: MatchTier;
  let matchBonus = 0;
  if (bugCount === TUNING.REELS) {
    tier = 'setback'; // three bugs — the playful setback beat
  } else if (lineMatch >= 3) {
    tier = 'jackpot';
    matchBonus = TUNING.MATCH3_BONUS;
  } else if (lineMatch === 2) {
    tier = 'match2';
    matchBonus = TUNING.MATCH2_BONUS;
  } else {
    tier = 'single';
  }

  let points = basePool + matchBonus;
  if (wildCount > 0) points *= TUNING.WILD_MULT; // AI doubles (§7)
  points = Math.max(TUNING.SPIN_FLOOR, Math.round(points)); // floor — always advances (§3)

  return {
    line,
    points,
    tier,
    wildCount,
    shieldDelta,
    bugDelta: bugCount,
    label: labelFor(tier, wildCount, line),
  };
}

function labelFor(tier: MatchTier, wildCount: number, line: readonly SymbolKey[]): string {
  if (tier === 'jackpot') return wildCount > 0 ? 'AI jackpot!' : 'Three of a kind!';
  if (tier === 'match2') return wildCount > 0 ? 'AI assist combo' : 'Nice match';
  if (tier === 'setback') return 'Bug swarm, hotfixing';
  // single: name the most valuable symbol on the line for a bit of flavor
  const best = [...line].sort((a, b) => baseValue(b) - baseValue(a))[0];
  return symbol(best).name;
}

/** A fixed jackpot line used by the hero teaser (§9): lands on the AI wild. */
export const HERO_LINE: [SymbolKey, SymbolKey, SymbolKey] = ['ai_wild', 'ai_wild', 'ai_wild'];
