/**
 * modules.ts — the workbench: internal-tool cards that fill as you play (game-design.md §8).
 * This is the pitch payload: each card maps a Moon Active JD requirement to a REAL Bar proof
 * point. Every `proof` string is a true, verifiable claim cross-checked against role.md / fit.md.
 * No em dashes in shipped strings (guardrail §11 / ADR 0042).
 *
 * Order is the ship order. The 4th module (Pipeline Orchestrator) is the design's stretch item,
 * included here because Bar chose full scope. Cutting back to MVP = slicing this array to 3.
 */

import { Flavor } from '../reel/symbols';

export interface ModuleDef {
  key: string;
  /** the tool the player builds */
  name: string;
  /** the JD requirement it answers (card subtitle) */
  maps: string;
  /** the real Bar proof point revealed on SHIPPED! (also plain text in the site, never a gate) */
  proof: string;
  /** which reel flavor nudges this module (small bonus only, never a gate) */
  flavor: Flavor;
  /** palette token for the card accent */
  tint: 'cyan' | 'skyBlue' | 'gold';
}

export const MODULES: readonly ModuleDef[] = [
  {
    key: 'codegen',
    name: 'Code-Gen Copilot',
    maps: 'AI for code generation',
    proof: 'Builds Claude Code and Codex plugins plus an open-source MCP server.',
    flavor: 'ui',
    tint: 'cyan',
  },
  {
    key: 'autotest',
    name: 'Auto-Test Bot',
    maps: 'automated testing',
    proof: 'Ships polished MVPs in hours to days without dropping quality.',
    flavor: 'service',
    tint: 'skyBlue',
  },
  {
    key: 'ragsearch',
    name: 'RAG Doc-Search',
    maps: 'embeddings, RAG, prompt engineering',
    proof: 'Builds LLM apps and eval workflows; prompt engineering is daily practice.',
    flavor: 'ui',
    tint: 'cyan',
  },
  {
    key: 'pipeline',
    name: 'Pipeline Orchestrator',
    maps: 'AI in production data pipelines',
    proof: "Cross-language Temporal service, featured on Temporal's Code Exchange.",
    flavor: 'service',
    tint: 'gold',
  },
] as const;
