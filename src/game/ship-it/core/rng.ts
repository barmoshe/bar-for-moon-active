/**
 * rng.ts — a small seeded PRNG (mulberry32). Phaser-free so the pure reel/workbench models
 * and the headless sanity test are fully deterministic and reproducible from a seed.
 */

export class RNG {
  private s: number;

  constructor(seed = 1) {
    // avoid a zero state
    this.s = (seed >>> 0) || 0x9e3779b9;
  }

  /** float in [0, 1) */
  next(): number {
    this.s |= 0;
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** integer in [0, n) */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }

  /** pick one element of arr */
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(arr.length)];
  }

  /**
   * Weighted pick: `weights[i]` is the relative weight of `items[i]`. Returns the chosen index.
   * Weights need not sum to 1.
   */
  weightedIndex(weights: readonly number[]): number {
    let total = 0;
    for (const w of weights) total += w;
    let roll = this.next() * total;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll < 0) return i;
    }
    return weights.length - 1;
  }
}
