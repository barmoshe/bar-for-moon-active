/**
 * economy.ts — the PURE workbench economy (game-design.md §6, §8). No Phaser.
 *
 * Applies a resolved SpinOutcome to the workbench state: adds Story Points to the active module
 * (overflow carries to the next unshipped module so nothing is ever wasted), banks QA shields,
 * accrues bugs toward a cosmetic "break + instant hotfix", ships completed modules, and reports a
 * win when every module is shipped. Points are only ever ADDED here — there is no code path that
 * removes earned progress (guardrail §3 / §11). A held shield absorbs a break; a break never
 * subtracts points, it only holds a beat for the scene to play the hotfix juice.
 */

import { TUNING } from '../core/tuning';
import { SpinOutcome } from '../reel/spin';
import { symbol } from '../reel/symbols';
import { MODULES, ModuleDef } from './modules';

export interface ModuleState {
  def: ModuleDef;
  progress: number; // 0..cost
  shipped: boolean;
}

export interface Workbench {
  modules: ModuleState[];
  cost: number;
  shieldCharges: number;
  bugMeter: number; // 0..BUGS_TO_BREAK-1 between breaks
  totalPoints: number; // lifetime points earned (only ever grows)
  activeIndex: number; // first unshipped module, or modules.length when all shipped
  won: boolean;
}

export interface ApplyResult {
  pointsAdded: number;
  /** module keys that reached SHIPPED! this spin (usually 0 or 1) */
  shipped: string[];
  /** a cosmetic break fired on the active module (no points lost) */
  broke: boolean;
  /** a held shield absorbed a would-be break */
  shieldAbsorbed: boolean;
  /** all modules shipped -> win screen */
  won: boolean;
}

export function createWorkbench(): Workbench {
  return {
    modules: MODULES.map((def) => ({ def, progress: 0, shipped: false })),
    cost: TUNING.MODULE_COST,
    shieldCharges: 0,
    bugMeter: 0,
    totalPoints: 0,
    activeIndex: 0,
    won: false,
  };
}

/** index of the first unshipped module, or modules.length if none remain */
function firstUnshipped(wb: Workbench): number {
  const i = wb.modules.findIndex((m) => !m.shipped);
  return i === -1 ? wb.modules.length : i;
}

/** does this spin's line carry the active module's flavor? (small bonus, never a gate) */
function lineHasFlavor(outcome: SpinOutcome, flavor: ModuleDef['flavor']): boolean {
  if (!flavor) return false;
  return outcome.line.some((k) => symbol(k).flavor === flavor);
}

export function applySpin(wb: Workbench, outcome: SpinOutcome): ApplyResult {
  const result: ApplyResult = {
    pointsAdded: 0,
    shipped: [],
    broke: false,
    shieldAbsorbed: false,
    won: false,
  };

  // 1) bank shields
  wb.shieldCharges += outcome.shieldDelta;

  // 2) compute points (base + flavor bonus if the active module matches the line flavor)
  wb.activeIndex = firstUnshipped(wb);
  let pts = outcome.points;
  const active = wb.modules[wb.activeIndex];
  if (active && lineHasFlavor(outcome, active.def.flavor)) pts += TUNING.FLAVOR_BONUS;
  wb.totalPoints += pts;
  result.pointsAdded = pts;

  // 3) pour points into the active module; overflow carries to the next unshipped one
  let carry = pts;
  while (carry > 0) {
    const idx = firstUnshipped(wb);
    if (idx >= wb.modules.length) break; // everything shipped already
    const m = wb.modules[idx];
    const need = wb.cost - m.progress;
    const add = Math.min(need, carry);
    m.progress += add;
    carry -= add;
    if (m.progress >= wb.cost && !m.shipped) {
      m.shipped = true;
      result.shipped.push(m.def.key);
    }
  }

  // 4) accrue bugs toward a cosmetic break; a held shield absorbs it
  wb.bugMeter += outcome.bugDelta;
  if (wb.bugMeter >= TUNING.BUGS_TO_BREAK) {
    wb.bugMeter -= TUNING.BUGS_TO_BREAK;
    if (wb.shieldCharges > 0) {
      wb.shieldCharges -= 1;
      result.shieldAbsorbed = true;
    } else {
      result.broke = true; // scene plays the break + instant hotfix; NO points removed
    }
  }

  // 5) win when all shipped
  wb.activeIndex = firstUnshipped(wb);
  if (wb.activeIndex >= wb.modules.length && !wb.won) {
    wb.won = true;
    result.won = true;
  }
  result.won = wb.won && result.shipped.length > 0 ? true : result.won;

  return result;
}

/** list of shipped module keys, in ship order — the `onWon` payload's modulesShipped */
export function shippedKeys(wb: Workbench): string[] {
  return wb.modules.filter((m) => m.shipped).map((m) => m.def.key);
}
