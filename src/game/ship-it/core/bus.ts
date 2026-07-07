/**
 * bus.ts — the React<->Phaser EventBus contract (game-agent-convention.md "Events").
 *
 * The game surfaces EXACTLY two events to the host site:
 *   - EVENTS.READY  ('game:ready') — fired once when Boot completes  -> React onReady
 *   - EVENTS.WON    ('game:won', { modulesShipped }) — win screen reached -> React onWon
 *
 * Everything else stays internal. The emitter is a plain Phaser.Events.EventEmitter created by
 * the factory (or injected by the React shim) and stashed on the game registry so any scene can
 * reach it via the game context. No shared globals, no DOM reach into the site.
 */

import Phaser from 'phaser';

export const EVENTS = {
  READY: 'game:ready',
  WON: 'game:won',
} as const;

export interface WonPayload {
  modulesShipped: string[];
}

export type Bus = Phaser.Events.EventEmitter;

export function makeBus(): Bus {
  return new Phaser.Events.EventEmitter();
}
