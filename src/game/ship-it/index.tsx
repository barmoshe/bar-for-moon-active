'use client';

/**
 * ShipItGame — the self-contained "Ship It!" Phaser mini-game, delivered to the
 * embed contract in jobs/moon-active/game-agent-convention.md. Built here from
 * the gamestudio (gem-vault) Phaser-4 donor. Client-only; loaded by
 * ShipItMount via next/dynamic({ ssr: false }).
 */
import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import type { MoonPalette } from '@/src/marketing/moon/ShipItMount';
import { GAME_W, GAME_H } from './config';

export type ShipItGameProps = {
  palette: MoonPalette;
  prefersReducedMotion: boolean;
  onReady?: () => void;
  onWon?: (payload: { modulesShipped: string[] }) => void;
};

export default function ShipItGame({ palette, prefersReducedMotion, onReady, onWon }: ShipItGameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    let disposed = false;

    (async () => {
      // Phaser touches window/document at import, so load it only on the client.
      const PhaserMod = (await import('phaser')).default;
      const { ShipItScene } = await import('./ShipItScene');
      // Wait for the page font so canvas text isn't a FOUT fallback.
      try { await (document as Document & { fonts?: FontFaceSet }).fonts?.ready; } catch { /* no-op */ }
      if (disposed || !hostRef.current) return;

      const scene = new ShipItScene({ palette, prefersReducedMotion, onReady, onWon });
      gameRef.current = new PhaserMod.Game({
        type: PhaserMod.AUTO,
        parent: hostRef.current,
        backgroundColor: palette.navy,
        transparent: false,
        scale: {
          mode: PhaserMod.Scale.FIT,
          autoCenter: PhaserMod.Scale.CENTER_BOTH,
          width: GAME_W,
          height: GAME_H,
        },
        render: { antialias: true, roundPixels: false },
        scene: [scene],
      });
    })();

    return () => {
      disposed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // Mount once; palette/callbacks are stable for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      className="ship-it-host"
      role="application"
      aria-label="Ship It! mini-game. Press Space or tap Ship It to spin. Every proof point it reveals is also listed in plain text next to it."
      tabIndex={0}
      style={{ width: '100%', aspectRatio: `${GAME_W} / ${GAME_H}`, maxWidth: 460, margin: '0 auto', borderRadius: 18, overflow: 'hidden' }}
    />
  );
}
