'use client';

/**
 * ShipItMount — the ONE boundary where the "Ship It!" mini-game meets the
 * site. See jobs/moon-active/game-agent-convention.md for the full contract.
 *
 * Today this renders `ShipItPlaceholder` (a static, branded slot + workbench
 * frame). When the game agent delivers the game to `src/game/ship-it/`, this
 * file is the ONLY site change: swap the placeholder for
 *
 *   const ShipItGame = dynamic(() => import('@/src/game/ship-it'), { ssr: false });
 *   return <ShipItGame palette={MOON_PALETTE} prefersReducedMotion={rm}
 *                       onReady={onReady} onWon={onWon} />;
 *
 * The `MoonPalette` type below is canonical; the game entry re-declares it
 * identically (or imports it) so the two stay in sync.
 */

/* The brand palette the site passes into the game so it harmonizes. */
export type MoonPalette = {
  black: string;
  navy: string;
  navyDeep: string;
  ink: string;
  gold: string;
  cyan: string;
  skyBlue: string;
  red: string;
  white: string;
};

export const MOON_PALETTE: MoonPalette = {
  black: '#000000',
  navy: '#041852',
  navyDeep: '#090821',
  ink: '#04164f',
  gold: '#ffad00',
  cyan: '#01afe8',
  skyBlue: '#599de6',
  red: '#e42313',
  white: '#ffffff',
};

/* ── Reel symbol glyphs (original art, Coin Master grammar). ─────────────── */
type ReelSym = 'coin' | 'react' | 'node' | 'wild' | 'shield' | 'bug';

function ReelGlyph({ s }: { s: ReelSym }) {
  switch (s) {
    case 'coin':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="15" fill="#ffcf4d" stroke="#e59a00" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="10" fill="none" stroke="#e59a00" strokeWidth="2" opacity="0.6" />
          <text x="20" y="26" fontSize="15" fontWeight="800" fill="#b47700" textAnchor="middle" fontFamily="Poppins, sans-serif">
            SP
          </text>
        </svg>
      );
    case 'react':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <g fill="none" stroke="#01afe8" strokeWidth="2.4">
            <ellipse cx="20" cy="20" rx="15" ry="6" />
            <ellipse cx="20" cy="20" rx="15" ry="6" transform="rotate(60 20 20)" />
            <ellipse cx="20" cy="20" rx="15" ry="6" transform="rotate(120 20 20)" />
          </g>
          <circle cx="20" cy="20" r="3" fill="#01afe8" />
        </svg>
      );
    case 'node':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 5 33 12.5v15L20 35 7 27.5v-15L20 5Z" fill="#0c6b3f" stroke="#3fae6d" strokeWidth="2.4" strokeLinejoin="round" />
          <text x="20" y="26" fontSize="13" fontWeight="800" fill="#9be3b6" textAnchor="middle" fontFamily="Poppins, sans-serif">
            JS
          </text>
        </svg>
      );
    case 'wild':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 4l3.6 9.5L33 15l-7.4 6 2.6 10L20 35l-8.2 6 2.6-10L7 15l9.4-1.5L20 4Z" fill="#ffad00" stroke="#b47700" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="20" cy="21" r="4.5" fill="#fff6df" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 5l12 4v9c0 8-5.4 13.3-12 16-6.6-2.7-12-8-12-16V9l12-4Z" fill="#1b6fd0" stroke="#7fb6ee" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M14.5 20l4 4 7-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bug':
      return (
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <ellipse cx="20" cy="22" rx="9" ry="10" fill="#e14a3b" stroke="#a52a1f" strokeWidth="2.2" />
          <path d="M20 12v18M11 22h18" stroke="#a52a1f" strokeWidth="2" />
          <path d="M11 15l-4-3M29 15l4-3M9 22H4M31 22h5M11 29l-4 3M29 29l4 3" stroke="#a52a1f" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="10" r="3.5" fill="#e14a3b" stroke="#a52a1f" strokeWidth="2" />
        </svg>
      );
  }
}

/* ── Workbench module icons. ─────────────────────────────────────────────── */
type ModIcon = 'codegen' | 'test' | 'rag';
function ModuleGlyph({ g }: { g: ModIcon }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (g) {
    case 'codegen':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M12 11 6 16l6 5M20 11l6 5-6 5" {...s} />
          <path d="M18 7l-4 18" {...s} />
        </svg>
      );
    case 'test':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <rect x="6" y="6" width="20" height="20" rx="4" {...s} />
          <path d="M11 16l3.5 3.5L22 12" {...s} />
        </svg>
      );
    case 'rag':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="14" cy="14" r="8" {...s} />
          <path d="M20 20l6 6" {...s} />
          <path d="M14 10v8M10 14h8" {...s} />
        </svg>
      );
  }
}

const REELS: ReelSym[] = ['react', 'wild', 'coin'];
const MODULES: { icon: ModIcon; name: string; pct: number }[] = [
  { icon: 'codegen', name: 'Code-Gen', pct: 70 },
  { icon: 'test', name: 'Auto-Test', pct: 45 },
  { icon: 'rag', name: 'RAG Search', pct: 25 },
];

/* ── The placeholder that stands in for the game until it is delivered. ──── */
export function ShipItPlaceholder() {
  return (
    <div className="ma-mount" role="img" aria-label="Ship It! mini-game — a slot reel above a workbench of internal-tool modules. The playable version is in the studio; the proof points it reveals are listed beside it.">
      <div className="ma-mount-head">
        <span className="ma-slot-badge">Ship It!</span>
        <span className="ma-slot-title">The build</span>
      </div>

      <div className="ma-mount-reels">
        <div className="ma-reels">
          {REELS.map((s, i) => (
            <div className={`ma-reel${s === 'wild' ? ' ma-reel-wild' : ''}`} key={i}>
              <ReelGlyph s={s} />
            </div>
          ))}
        </div>
      </div>

      <div className="ma-mount-workbench">
        {MODULES.map((m) => (
          <div className="ma-wb-card" key={m.name}>
            <span className="ma-wb-icon">
              <ModuleGlyph g={m.icon} />
            </span>
            <span className="ma-wb-name">{m.name}</span>
            <span className="ma-wb-ring" aria-hidden="true">
              <i style={{ width: `${m.pct}%` }} />
            </span>
          </div>
        ))}
      </div>

      <div className="ma-mount-lever">
        <button className="ma-btn" type="button" disabled aria-disabled="true">
          Ship it <span aria-hidden="true">›</span>
        </button>
      </div>

      <p className="ma-mount-note">
        Playable build in the studio
        <span className="ma-dim">
          A Coin Master-style spin-slot: spin to assemble the internal AI tools
          this role builds. Every shipped module reveals a real proof point,
          all listed here already.
        </span>
      </p>
    </div>
  );
}

/* ── The compact hero teaser (a static jackpot frame placeholder). ──────── */
export function ShipItTeaser() {
  return (
    <div className="ma-teaser">
      <div className="ma-slot" role="img" aria-label="Ship It! — a slot reel landed on the AI-Assist wild. The playable build is further down the page.">
        <div className="ma-slot-top">
          <span className="ma-slot-badge">Ship It!</span>
          <span className="ma-slot-title">Spin to see the fit</span>
        </div>
        <div className="ma-reels">
          {REELS.map((s, i) => (
            <div className={`ma-reel${s === 'wild' ? ' ma-reel-wild' : ''}`} key={i}>
              <ReelGlyph s={s} />
            </div>
          ))}
        </div>
        <div className="ma-slot-lever">
          <a className="ma-btn" href="#ma-build">
            Play the build <span aria-hidden="true">›</span>
          </a>
        </div>
        <p className="ma-slot-note">
          Jackpot: AI-assist
          <span className="ma-dim">The full spin-slot is one scroll down.</span>
        </p>
      </div>
    </div>
  );
}

/* ── The mount: the swap point. Today, the placeholder. ─────────────────── */
export default function ShipItMount() {
  return <ShipItPlaceholder />;
}
