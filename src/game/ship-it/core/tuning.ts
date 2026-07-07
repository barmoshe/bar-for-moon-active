/**
 * tuning.ts — every gameplay/feel magic number, in one place (studio "feel-tunables"
 * convention). The pure models and the scenes both read from here; nothing hard-codes a
 * number it could read from TUNING. Changing balance = editing this file only.
 *
 * Design anchors (game-design.md):
 *   §3  always-progress, never-gamble: every spin awards >= SPIN_FLOOR points; points are
 *       only ever ADDED, never removed. There is no losable stake.
 *   §7  six symbols, AI wild substitutes + doubles, three bugs = a cosmetic setback.
 *   §8  four tool modules (full scope); each is a real Bar proof point.
 */

export const TUNING = {
  // ---- reel shape ----
  REELS: 3, // three columns, one payline (design §6: "three reels roll, stop one by one")

  // ---- payout (Story Points) ----
  SPIN_FLOOR: 6, // every spin yields at least this — the workbench always advances (§3)
  COIN_VALUE: 10, // each Story-Point coin symbol on the line
  TECH_VALUE: 8, // each Frontend/Backend symbol contributes this to the pool
  SHIELD_VALUE: 5, // a shield still pays a little
  MATCH2_BONUS: 14, // two-of-a-kind (wild-completed counts)
  MATCH3_BONUS: 46, // three-of-a-kind jackpot
  WILD_MULT: 2, // AI wild DOUBLES the resolved payout (§7)

  // ---- reel weights (relative; rigged to trend up and make the wild feel powerful, §7) ----
  // order: [storyPoint, frontend, backend, aiWild, qaShield, bug]
  WEIGHTS: [26, 20, 20, 14, 12, 8] as const,

  // ---- setback / shield (playful, never a real loss, §7) ----
  BUGS_TO_BREAK: 3, // three accrued bugs trigger one cosmetic "break + instant hotfix"
  BREAK_POINT_HOLD: 0, // a break holds progress for a beat; it NEVER subtracts points

  // ---- workbench economy (§6, §8) ----
  MODULE_COST: 120, // Story Points to fill one module ring -> SHIPPED!
  // frontend-flavored spins nudge UI modules, backend nudges service modules, but every
  // point always lands somewhere: the active module. Flavor is a small bonus, not a gate.
  FLAVOR_BONUS: 6,

  // ---- hero teaser (§9) ----
  HERO_SPIN_MS: 2200, // one slow anticipatory spin, lands on the AI wild
} as const;

export type Tuning = typeof TUNING;
