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

    // Defer creation by a tick so a React double-mount (StrictMode in dev, and
    // the dynamic-import/Suspense remount seen in prod) collapses to ONE game:
    // the first mount schedules, the immediate unmount cancels it, the surviving
    // mount schedules again. Destroying a Phaser game mid-Boot otherwise races
    // its async loader and can leave the survivor stuck on the Boot scene.
    const raf = requestAnimationFrame(() => {
      if (cancelled || !parent) return;
      try {
        game = createShipItGame({
          parent,
          palette,
          prefersReducedMotion: !!prefersReducedMotion,
          emitter: bus,
        });
      } catch {
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      bus.removeAllListeners();
      game?.destroy(true);
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
