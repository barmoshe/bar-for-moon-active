'use client';

/**
 * index.tsx — the React embed shim (game-agent-convention.md entry shape). This is the ONE file
 * the site imports: a client-only component that mounts the Phaser game and surfaces exactly
 * `onReady` / `onWon`. It owns the game lifecycle (create on mount, destroy on unmount) so it is
 * React-StrictMode safe, and passes the site's brand palette + reduced-motion in via props.
 *
 * Loaded by the site with next/dynamic(() => import('@/src/game/ship-it'), { ssr: false }).
 * Self-contained: Phaser + all art (base64) travel with this folder; no network calls at runtime.
 */

import { useEffect, useRef, useState } from 'react';
import { createShipItGame } from './createShipItGame';
import { EVENTS, WonPayload, makeBus } from './core/bus';
import type { MoonPalette } from './core/palette';

export type { MoonPalette };

export interface ShipItGameProps {
  palette: MoonPalette;
  prefersReducedMotion?: boolean;
  onReady?: () => void;
  onWon?: (payload: { modulesShipped: string[] }) => void;
}

export default function ShipItGame({
  palette,
  prefersReducedMotion,
  onReady,
  onWon,
}: ShipItGameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;

    const bus = makeBus();
    if (onReady) bus.on(EVENTS.READY, onReady);
    if (onWon) bus.on(EVENTS.WON, (p: WonPayload) => onWon(p));

    let game: ReturnType<typeof createShipItGame> | null = null;
    let cancelled = false;

    // Defer creation one macrotask so a transient double-mount (React StrictMode
    // in dev, and the dynamic-import remount) collapses to a SINGLE game: the
    // aborted mount clears its timer before it fires, so only the surviving mount
    // builds a game. Two Phaser games in one parent otherwise stack their
    // canvases and one ends up frozen (its RAF loop never steps) -> the visible
    // canvas is dead and unclickable. setTimeout (not requestAnimationFrame) so
    // it still fires in a hidden/background tab, where rAF is throttled to ~0.
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const el = ref.current;
      // Exactly one game per page: if a canvas already exists in this host (a
      // concurrent or leftover mount built one), do NOT create a second - two
      // Phaser games stack canvases and one freezes, killing input.
      if (!el || el.querySelector('canvas')) return;
      try {
        game = createShipItGame({
          parent: el,
          palette,
          prefersReducedMotion: !!prefersReducedMotion,
          emitter: bus,
        });
        // Dev-only handle for verification; stripped from production builds.
        if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
          (window as unknown as { __shipGame?: unknown }).__shipGame = game;
        }
      } catch {
        setFailed(true);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      bus.removeAllListeners();
      const canvas = game?.canvas;
      game?.destroy(true);
      canvas?.remove();
    };
    // Mount once: palette + reduced-motion are stable for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div
        role="img"
        aria-label="Ship It! mini-game (needs WebGL). The proof points it reveals are listed on this page."
        style={fallbackStyle(palette)}
      >
        Your browser could not start the game. Everything it shows is written out on this page.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Ship It! — spin the reel to build the internal AI tools; each shipped module reveals a real proof point."
      style={{
        width: '100%',
        maxWidth: 430,
        aspectRatio: '390 / 844',
        margin: '0 auto',
        borderRadius: 18,
        overflow: 'hidden',
      }}
    />
  );
}

function fallbackStyle(p: MoonPalette): React.CSSProperties {
  return {
    width: '100%',
    maxWidth: 430,
    margin: '0 auto',
    padding: '32px 24px',
    borderRadius: 18,
    background: p.navyDeep,
    color: p.white,
    font: '15px/1.5 Poppins, system-ui, sans-serif',
    textAlign: 'center',
  };
}
