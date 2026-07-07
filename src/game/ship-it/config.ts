// config.ts — content + dimensions for the "Ship It!" mini-game.
// Palette type is canonical in ShipItMount.tsx (the embed contract); import it
// so the two never drift.
import type { MoonPalette } from '@/src/marketing/moon/ShipItMount';

export type { MoonPalette };

// Logical canvas (portrait-friendly). The Scale Manager FITs this into the
// container, so these are reference units, not pixels.
export const GAME_W = 400;
export const GAME_H = 560;

export type Sym = 'coin' | 'react' | 'node' | 'wild' | 'shield' | 'bug';

// Reel weights. Rigged toward productive symbols so progress always trends up
// (guardrail: always-progress, never-gamble). The wild appears often enough to
// feel powerful — the role's "AI makes everything ship faster" made literal.
export const SYM_WEIGHTS: { sym: Sym; w: number }[] = [
  { sym: 'wild', w: 20 },
  { sym: 'coin', w: 22 },
  { sym: 'react', w: 18 },
  { sym: 'node', w: 18 },
  { sym: 'shield', w: 14 },
  { sym: 'bug', w: 8 },
];

// The workbench: three internal-tool modules. Each maps a Moon Active job
// requirement to a real Bar proof point revealed on SHIPPED! (game-design §8).
export type Module = { key: string; name: string; maps: string; proof: string };
export const MODULES: Module[] = [
  {
    key: 'codegen',
    name: 'Code-Gen Copilot',
    maps: 'AI for code generation',
    proof: 'I build Claude Code and Codex plugins and an open-source MCP server.',
  },
  {
    key: 'autotest',
    name: 'Auto-Test Bot',
    maps: 'Automated testing',
    proof: 'I ship polished MVPs in hours to days without dropping quality.',
  },
  {
    key: 'rag',
    name: 'RAG Doc-Search',
    maps: 'Embeddings, RAG, prompt engineering',
    proof: 'I build LLM apps and eval workflows; prompt engineering is daily work.',
  },
];
