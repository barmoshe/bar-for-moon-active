'use client';

import { useEffect, useRef } from 'react';
import './marketing-base.css';
import './moon.css';
import { ShipItTeaser, ShipItPlaceholder } from './ShipItMount';

/**
 * MoonApp — Bar Moshe's application page for Moon Active's Full Stack
 * Developer (R&D) role (Tel Aviv; internal tools with AI baked in, on
 * Node.js + React).
 *
 * Moon Active's REAL visual language, read live off moonactive.com
 * (2026-07-07):
 *
 *   - A black #000000 hero canvas with big white UPPERCASE display (their
 *     filson-pro -> Poppins), and a black sticky nav with a white+red
 *     wordmark ("MOON" white, "ACTIVE" red).
 *   - Chunky gold #FFAD00 game-buttons (10px radius, navy text, a springy
 *     press) and gold accent bands.
 *   - Cyan #01AFE8 section headers, deep-navy #041852 game sections, and a
 *     sky-blue #599DE6 careers close over a cartoon cityscape.
 *   - Playful rounded game-cards for the work grid.
 *
 * The centerpiece is "Ship It!", an embedded Coin Master-style mini-game
 * built separately by the game agent (see jobs/moon-active/game-*.md). Until
 * it is delivered, the game slots render a branded placeholder, and every
 * proof point the game will reveal also exists as plain text here (never a
 * gate). Every shape is drawn fresh as original SVG/CSS; no Moon Active or
 * Coin Master asset is used. Copy is Bar's plain first-person register.
 */

const EMAIL = 'mailto:1barmoshe1@gmail.com?subject=bar-for-moon-active';
const CV = '/Bar_Moshe_CV_MoonActive.pdf';
const LINKEDIN = 'https://www.linkedin.com/in/barmoshe/';
const GITHUB = 'https://github.com/barmoshe';
const WHATSAPP = 'https://wa.me/972546561465';

/* ── The plain-text proof list beside the game (never-a-gate). Mirrors the
      workbench->proof map in game-design.md §8. ──────────────────────────── */
type ProofIcon = 'codegen' | 'test' | 'rag';
const PROOFS: { icon: ProofIcon; h: string; p: string }[] = [
  {
    icon: 'codegen',
    h: 'Code-Gen Copilot',
    p: 'I build Claude Code and Codex plugins and an MCP server, published open source. AI for code generation is how I actually work.',
  },
  {
    icon: 'test',
    h: 'Auto-Test Bot',
    p: 'I ship polished MVPs in hours to days without dropping quality, because testing and evals are part of the loop, not an afterthought.',
  },
  {
    icon: 'rag',
    h: 'RAG Doc-Search',
    p: 'I build LLM apps and eval workflows; prompt engineering, embeddings, and retrieval are daily practice, not buzzwords on a slide.',
  },
];

/* ── Why-me cards: the JD mapped to Bar. ────────────────────────────────── */
type WhyIcon = 'tools' | 'ai' | 'stack' | 'ship';
const WHY: { icon: WhyIcon; h: string; p: string }[] = [
  {
    icon: 'tools',
    h: 'Internal tools, end to end',
    p: 'My whole practice is turning a rough stakeholder brief into a working internal tool, fast, then hardening it. Idea to production is the job.',
  },
  {
    icon: 'ai',
    h: 'AI baked in, not bolted on',
    p: 'Code generation, automated testing, RAG, agent workflows. I design the prompts and evals and ship the tooling, so I know where LLMs help and where they do not.',
  },
  {
    icon: 'stack',
    h: 'Your exact stack',
    p: 'Node.js, React, MongoDB, AWS is my daily stack, plus Docker, Kubernetes, and Terraform from a Wix DevOps workshop for scalable internal services.',
  },
  {
    icon: 'ship',
    h: 'Ships fast, ships solo',
    p: 'Small Joomsy team and an independent practice mean I own the whole arc when needed, from the first commit to the deploy.',
  },
];

/* ── Experience + education, from the canonical CV digest. ─────────────── */
const EXPERIENCE: { role: string; period: string; note: string }[] = [
  {
    role: 'Freelance AI Builder',
    period: '2026 – present',
    note: 'Independent practice building internal tools and LLM/agentic products: scope a brief, wire AI in, and ship an MVP from intake to deploy, including a production video-rendering pipeline.',
  },
  {
    role: 'Software Developer, Joomsy',
    period: '2025 – present',
    note: 'Primary developer at an early-stage startup, team of five. Full-stack and DevOps on Node/React, with real ownership across engineering and product.',
  },
  {
    role: 'Customer Support Engineer, Wochit',
    period: '2021 – present',
    note: 'Technical work for a cloud video editor at scale: reproduce and resolve real users’ issues, and feed fixes back to the development teams.',
  },
];

const EDUCATION: { name: string; note: string }[] = [
  {
    name: 'B.Sc. Computer Science, Afeka College of Engineering',
    note: 'Breadth from low-level assembly to .NET, plus operating systems, data structures, and algorithms.',
  },
  {
    name: 'DevOps workshop, Wix (Tel Aviv)',
    note: 'Hands-on Amazon EKS, Kubernetes, Terraform, and microservices.',
  },
  {
    name: 'Full-Stack Bootcamp, Coding Academy',
    note: 'Intensive Node.js, React, and MongoDB.',
  },
];

/* ── The work grid: the standard roster, as playful game-cards. ─────────── */
type Glyph =
  | 'deck'
  | 'flow'
  | 'logic'
  | 'harness'
  | 'home'
  | 'plane'
  | 'flower'
  | 'wave'
  | 'silk'
  | 'film';

const REPORTS: { name: string; tag: string; href: string; glyph: Glyph; tint: string }[] = [
  { name: 'MDP', tag: 'Compiler · AI tooling', href: 'https://barmoshe.github.io/mdp/', glyph: 'deck', tint: '#01afe8' },
  { name: 'Temporal Data Service', tag: 'Durable workflows', href: 'https://temporal.io/code-exchange/cross-language-data-processing-service-with-temporal', glyph: 'flow', tint: '#0c6b3f' },
  { name: 'Entailer', tag: 'AI + formal logic', href: 'https://barmoshe.github.io/entailer/', glyph: 'logic', tint: '#7c4dd6' },
  { name: 'Creative Harness', tag: 'AI agents · Systems', href: 'https://github.com/barmoshe/claude-creative-stack', glyph: 'harness', tint: '#e59a00' },
  { name: 'Catalogue Orchestrator', tag: 'AI video · Orchestration', href: 'https://barmoshe.github.io/catalogue-orchestrator/', glyph: 'film', tint: '#e14a3b' },
  { name: 'Apartment Hunter', tag: 'Product · Web app', href: 'https://apartment-hunter-one.vercel.app', glyph: 'home', tint: '#1b6fd0' },
  { name: 'Trip Planner', tag: 'Product · Web app', href: 'https://trip-planner-six-iota.vercel.app', glyph: 'plane', tint: '#01afe8' },
  { name: 'Bloom Garden', tag: 'Computer vision · Game', href: 'https://bloom-garden-five.vercel.app', glyph: 'flower', tint: '#c94f8a' },
  { name: 'Biome Synth', tag: 'Generative · Audio', href: 'https://biome-synth.lovable.app', glyph: 'wave', tint: '#0c6b3f' },
  { name: 'Aurora', tag: 'WebGL · Graphics', href: 'https://aurora-eight-iota.vercel.app', glyph: 'silk', tint: '#7c4dd6' },
];

/* ── Scroll reveal. ─────────────────────────────────────────────────────── */
function useReveal(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/* ── Nav mark: an original crescent-moon + spark glyph. ─────────────────── */
function MarkGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M22 5a12 12 0 1 0 5 9.5A9 9 0 0 1 22 5Z" fill="currentColor" />
      <path d="M25 4l1.1 3L29 8l-2.9 1L25 12l-1.1-3L21 8l2.9-1L25 4Z" fill="currentColor" />
    </svg>
  );
}

/* ── Hero star/coin specks (static, hydration-safe). ────────────────────── */
const SPECKS = [
  [6, 18], [14, 42], [9, 74], [22, 12], [31, 60], [38, 30],
  [52, 20], [61, 68], [70, 14], [78, 48], [86, 26], [93, 62],
  [46, 80], [67, 40], [88, 82], [18, 88],
];
function HeroStars() {
  return (
    <div className="ma-hero-stars" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {SPECKS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 0.5 : 0.3} fill={i % 4 === 0 ? '#ffad00' : '#ffffff'} opacity={i % 2 ? 0.6 : 0.35} />
        ))}
      </svg>
    </div>
  );
}

/* ── MEET section illustration: an original workbench-under-the-moon. ───── */
function MeetArt() {
  return (
    <svg viewBox="0 0 560 440" role="img" aria-label="A stylized night workbench: a big moon, a bench of internal tools taking shape, and coins arcing up.">
      <defs>
        <linearGradient id="ma-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c2f6b" />
          <stop offset="1" stopColor="#041852" />
        </linearGradient>
      </defs>
      <rect width="560" height="440" fill="url(#ma-sky)" />
      {/* moon */}
      <circle cx="440" cy="110" r="66" fill="#ffe6a6" />
      <circle cx="462" cy="96" r="66" fill="#0c2f6b" />
      <circle cx="410" cy="130" r="8" fill="#f2cf7a" opacity="0.5" />
      <circle cx="430" cy="150" r="5" fill="#f2cf7a" opacity="0.4" />
      {/* stars */}
      {[[60, 60], [120, 40], [200, 80], [90, 120], [260, 50], [320, 100]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 5}l1.4 3.6L${x + 5} ${y}l-3.6 1.4L${x} ${y + 5}l-1.4-3.6L${x - 5} ${y}l3.6-1.4L${x} ${y - 5}Z`} fill="#ffffff" opacity="0.7" />
      ))}
      {/* bench */}
      <rect x="60" y="300" width="440" height="20" rx="6" fill="#123a7e" />
      <rect x="80" y="320" width="16" height="70" fill="#0c2f6b" />
      <rect x="464" y="320" width="16" height="70" fill="#0c2f6b" />
      {/* tool "windows" on the bench */}
      <rect x="96" y="232" width="150" height="68" rx="10" fill="#0a2a5f" stroke="#01afe8" strokeOpacity="0.5" strokeWidth="2" />
      <rect x="110" y="248" width="70" height="8" rx="4" fill="#01afe8" opacity="0.8" />
      <rect x="110" y="264" width="110" height="6" rx="3" fill="#ffffff" opacity="0.25" />
      <rect x="110" y="278" width="90" height="6" rx="3" fill="#ffffff" opacity="0.25" />

      <rect x="266" y="220" width="150" height="80" rx="10" fill="#0a2a5f" stroke="#ffad00" strokeOpacity="0.55" strokeWidth="2" />
      <rect x="280" y="236" width="60" height="8" rx="4" fill="#ffad00" opacity="0.9" />
      <rect x="280" y="252" width="118" height="6" rx="3" fill="#ffffff" opacity="0.25" />
      <rect x="280" y="266" width="96" height="6" rx="3" fill="#ffffff" opacity="0.25" />
      <rect x="280" y="282" width="46" height="12" rx="6" fill="#01afe8" />
      {/* coins arcing */}
      {[[150, 210], [190, 180], [232, 168], [276, 176], [316, 198]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="12" fill="#ffcf4d" stroke="#e59a00" strokeWidth="2" />
          <circle cx={x} cy={y} r="7" fill="none" stroke="#e59a00" strokeWidth="1.5" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

/* ── Close-section cartoon cityscape (original). ────────────────────────── */
function CloseCity() {
  return (
    <div className="ma-close-city" aria-hidden="true">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice">
        <g fill="#3f7ec9" opacity="0.5">
          <rect x="40" y="80" width="70" height="140" rx="6" />
          <rect x="150" y="40" width="60" height="180" rx="6" />
          <rect x="1230" y="60" width="80" height="160" rx="6" />
          <rect x="1330" y="100" width="60" height="120" rx="6" />
        </g>
        <g fill="#2f6bb0">
          <rect x="230" y="110" width="90" height="110" rx="8" />
          <rect x="340" y="70" width="70" height="150" rx="8" />
          <rect x="1120" y="90" width="90" height="130" rx="8" />
        </g>
        {/* palms */}
        <g stroke="#1f8a5b" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M470 220v-70" />
          <path d="M470 152c-16-10-34-6-44 6M470 152c16-10 34-6 44 6M470 150c-8-16-4-30 6-40M470 150c8-16 24-20 36-14" />
        </g>
        <g stroke="#1f8a5b" strokeWidth="8" fill="none" strokeLinecap="round">
          <path d="M980 220v-64" />
          <path d="M980 158c-14-9-30-5-40 6M980 158c14-9 30-5 40 6M980 156c-7-14-3-28 6-36" />
        </g>
        {/* rooftops */}
        <path d="M540 220l90-46 90 46Z" fill="#c98b5a" />
        <path d="M760 220l70-36 70 36Z" fill="#b87a4c" />
      </svg>
    </div>
  );
}

/* ── Why-me icons. ──────────────────────────────────────────────────────── */
function WhyGlyph({ g }: { g: WhyIcon }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (g) {
    case 'tools':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M20 6a5 5 0 0 0-6.5 6.5L6 20l6 6 7.5-7.5A5 5 0 0 0 26 12l-4 4-2-2 4-4a5 5 0 0 0-4-4Z" {...s} />
        </svg>
      );
    case 'ai':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <rect x="9" y="10" width="14" height="12" rx="3" {...s} />
          <path d="M16 4v6M11 22v4M21 22v4M4 14h5M4 18h5M23 14h5M23 18h5" {...s} />
          <circle cx="13" cy="16" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="19" cy="16" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'stack':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 5 28 11 16 17 4 11 16 5Z" {...s} />
          <path d="M4 16l12 6 12-6M4 21l12 6 12-6" {...s} />
        </svg>
      );
    case 'ship':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M5 18h22l-3 7H8l-3-7Z" {...s} />
          <path d="M9 18V8h9l5 5v5" {...s} />
          <path d="M18 8v5h5" {...s} />
        </svg>
      );
  }
}
function ProofGlyph({ g }: { g: ProofIcon }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (g) {
    case 'codegen':
      return (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M12 11 6 16l6 5M20 11l6 5-6 5M18 7l-4 18" {...s} />
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
          <path d="M20 20l6 6M14 10v8M10 14h8" {...s} />
        </svg>
      );
  }
}

/* ── Work-card glyphs. ──────────────────────────────────────────────────── */
function ReportGlyph({ g }: { g: Glyph }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (g) {
    case 'deck':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="7" width="22" height="15" rx="2.5" {...s} /><path d="M11 27h10M13 13h10M13 17h6" {...s} /></svg>);
    case 'flow':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="8" cy="8" r="4" {...s} /><circle cx="24" cy="16" r="4" {...s} /><circle cx="8" cy="24" r="4" {...s} /><path d="M12 9.5 20 14M12 22.5 20 18" {...s} /></svg>);
    case 'logic':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 10h8l4 6-4 6H6M18 16h8" {...s} /><path d="M23 12l4 4-4 4" {...s} /></svg>);
    case 'harness':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="10" y="10" width="12" height="12" rx="3" {...s} /><path d="M16 4v6M16 22v6M4 16h6M22 16h6" {...s} /></svg>);
    case 'film':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="8" width="22" height="16" rx="3" {...s} /><path d="M5 13h22M10 8v16M22 8v16" {...s} /></svg>);
    case 'home':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 15 16 6l10 9M9 13v12h14V13" {...s} /><path d="M13 25v-7h6v7" {...s} /></svg>);
    case 'plane':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 18 28 8l-7 18-5-7-8 4 5-6Z" {...s} /></svg>);
    case 'flower':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="13" r="3.5" {...s} /><path d="M16 5v4M16 17v10M9 10l4 2M23 10l-4 2M10 26c2-4 4-5 6-5s4 1 6 5" {...s} /></svg>);
    case 'wave':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 16c3-7 6-7 8 0s5 7 8 0 5-7 8 0" {...s} /></svg>);
    case 'silk':
      return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 22c6-3 8-9 6-14 7 1 11 6 11 12M9 27c8-1 14-6 16-13" {...s} /></svg>);
  }
}

/* ── Contact tile icons. ────────────────────────────────────────────────── */
function MailIcon() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="8" width="22" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="m6 10 10 8 10-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function ChatIcon() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 6c7 0 12 4.6 12 10.3S23 26.6 16 26.6c-1.4 0-2.7-.15-3.9-.45L6 28l1.6-5.4C6 20.7 4 18.7 4 16.3 4 10.6 9 6 16 6Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>);
}
function DocIcon() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 4h10l5 5v19H9V4Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><path d="M19 4v5h5M13 16h8M13 20h8M13 24h5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>);
}
function CodeIcon() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 10 5 16l7 6M20 10l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function MoonApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  const wordmark = (
    <>
      <span className="ma-wm-pre">bar for</span> moon<span className="ma-wm-active">active</span>
    </>
  );

  return (
    <div className="mp-root ma-root" ref={rootRef}>
      <a className="skip-link" href="#ma-main">
        Skip to content
      </a>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="ma-nav">
        <div className="ma-nav-inner">
          <a className="ma-mark" href="#ma-main" aria-label="bar for moon active, back to top">
            <span className="ma-mark-glyph" aria-hidden="true">
              <MarkGlyph />
            </span>
            <span className="ma-wordmark">{wordmark}</span>
          </a>
          <nav className="ma-nav-links" aria-label="Page sections">
            <a href="#ma-build">The build</a>
            <a href="#ma-why">Why me</a>
            <a href="#ma-work">The work</a>
            <a href="#ma-contact">Contact</a>
          </nav>
          <div className="ma-nav-cta">
            <a className="ma-btn" href={EMAIL}>
              Say hi <span aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </header>

      <main id="ma-main">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="ma-hero" aria-labelledby="ma-hero-h">
          <HeroStars />
          <div className="ma-hero-inner">
            <div className="ma-hero-copy">
              <p className="ma-hero-pill">
                <span className="ma-pill-dot" aria-hidden="true" />
                Applying · Full Stack Developer · Tel Aviv
              </p>
              <h1 id="ma-hero-h">
                I build the tools that <span className="ma-hero-gold">ship the fun.</span>
              </h1>
              <p className="ma-hero-sub">
                I&apos;m Bar Moshe. I build internal tools with AI baked in, idea
                to production, on Node.js and React. This whole page is the
                application, and its centerpiece is a game I built to prove it.
              </p>
              <div className="ma-hero-cta">
                <a className="ma-btn ma-btn-lg" href="#ma-build">
                  Play the build <span aria-hidden="true">›</span>
                </a>
                <a className="ma-btn-ghost ma-btn-lg" href={CV} target="_blank" rel="noreferrer">
                  Download CV <span aria-hidden="true">›</span>
                </a>
              </div>
            </div>
            <ShipItTeaser />
          </div>
        </section>

        {/* ── MEET ──────────────────────────────────────────────────────── */}
        <section className="ma-meet" aria-labelledby="ma-meet-h">
          <div className="ma-meet-grid">
            <div className="ma-meet-copy" data-reveal>
              <span className="ma-eyebrow">Meet Bar Moshe</span>
              <h2 id="ma-meet-h" className="ma-h-cyan">
                A builder for the R&amp;D tools team
              </h2>
              <p>
                Moon Active&apos;s R&amp;D group builds the internal tools that let
                the game studios move fast without breaking quality. That is
                exactly the work I do: I take a rough pain point from ops,
                monetization, or engineering and turn it into a working tool,
                fast, with AI wired into how it is built and how it runs.
              </p>
              <p>
                I am not from the gaming world, and I am upfront about that. The
                customer here is engineers and operators, which is squarely where
                I work, and I pick up a new domain quickly.
              </p>
            </div>
            <div className="ma-meet-art" data-reveal>
              <MeetArt />
            </div>
          </div>
        </section>

        {/* ── THE BUILD (game centerpiece + plain-text proof) ───────────── */}
        <section className="ma-build" id="ma-build" aria-labelledby="ma-build-h">
          <div className="ma-build-grid">
            <div className="ma-build-stage" data-reveal>
              <ShipItPlaceholder />
            </div>
            <div className="ma-build-proof" data-reveal>
              <span className="ma-eyebrow">The build</span>
              <h2 id="ma-build-h">Spin to assemble the toolkit</h2>
              <p className="ma-build-lead">
                Ship It! is a Coin Master-style spin-slot I built for this
                application. You spin to gather resources and assemble the
                internal AI tools this role is about. Every module you ship
                reveals a real proof point, so here they are in plain text too,
                no game required.
              </p>
              <div className="ma-proof-list">
                {PROOFS.map((p) => (
                  <div className="ma-proof-item" key={p.h}>
                    <span className="ma-proof-badge">
                      <ProofGlyph g={p.icon} />
                    </span>
                    <div className="ma-proof-body">
                      <h3>{p.h}</h3>
                      <p>{p.p}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE WORK ──────────────────────────────────────────────────── */}
        <section className="ma-work" id="ma-work" aria-labelledby="ma-work-h">
          <div className="ma-work-band">
            <div className="ma-work-band-inner">
              <h2 id="ma-work-h">The work</h2>
              <p>Ten builds, all live. Open one, it runs.</p>
            </div>
          </div>
          <div className="ma-work-grid">
            {REPORTS.map((r, i) => (
              <a
                className="ma-work-card"
                key={r.name}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 0.05}s` }}
              >
                <span className="ma-work-thumb" style={{ background: r.tint }}>
                  <ReportGlyph g={r.glyph} />
                </span>
                <span className="ma-work-tag">{r.tag}</span>
                <h3>{r.name}</h3>
                <span className="ma-link-chevron">
                  See it live <span aria-hidden="true">›</span>
                </span>
              </a>
            ))}
          </div>
          <p className="ma-work-note" data-reveal>
            Day job: Joomsy, where I am the primary full-stack and DevOps
            engineer on a team of five. Their code stays theirs, so it is named
            here, not linked.
          </p>
        </section>

        {/* ── WHY ME ────────────────────────────────────────────────────── */}
        <section className="ma-why" id="ma-why" aria-labelledby="ma-why-h">
          <div className="ma-section-head ma-center" data-reveal>
            <span className="ma-eyebrow">Why me</span>
            <h2 id="ma-why-h" className="ma-h-white">
              What the role asks for, matched with proof
            </h2>
          </div>
          <div className="ma-why-grid">
            {WHY.map((w, i) => (
              <article className="ma-why-card" key={w.h} data-reveal style={{ transitionDelay: `${(i % 4) * 0.05}s` }}>
                <span className="ma-why-icon">
                  <WhyGlyph g={w.icon} />
                </span>
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── CV ────────────────────────────────────────────────────────── */}
        <section className="ma-cv" aria-labelledby="ma-cv-h">
          <div className="ma-section-head" data-reveal>
            <span className="ma-eyebrow">Background</span>
            <h2 id="ma-cv-h" className="ma-h-navy">
              Building now, the rest is on the CV
            </h2>
          </div>
          <div className="ma-cv-grid">
            <div className="ma-cv-col" data-reveal>
              <h3 className="ma-cv-title">Experience</h3>
              <div className="ma-cv-list">
                {EXPERIENCE.map((e) => (
                  <div className="ma-cv-item" key={e.role}>
                    <div className="ma-cv-role">
                      <b>{e.role}</b>
                      <span className="ma-cv-period">{e.period}</span>
                    </div>
                    <p>{e.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="ma-cv-col" data-reveal style={{ transitionDelay: '0.08s' }}>
              <h3 className="ma-cv-title">Education &amp; training</h3>
              <div className="ma-cv-list">
                {EDUCATION.map((e) => (
                  <div className="ma-cv-item" key={e.name}>
                    <span className="ma-cv-edu">{e.name}</span>
                    <p>{e.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Honest beat ───────────────────────────────────────────────── */}
        <section className="ma-note" aria-label="A note on background">
          <div className="ma-note-inner" data-reveal>
            <span className="ma-eyebrow">On the record</span>
            <p>
              I have not shipped a mobile game, and I am not pretending to. What I
              have shipped is exactly this role: <span className="ma-em">internal
              tools with AI wired into how they are built,</span> from idea to
              production. The game on this page is me proving I can build polished
              product, fast.
            </p>
          </div>
        </section>

        {/* ── Close ─────────────────────────────────────────────────────── */}
        <section className="ma-close" id="ma-contact" aria-labelledby="ma-close-h">
          <CloseCity />
          <div className="ma-close-head" data-reveal>
            <h2 id="ma-close-h">Let&apos;s build something fun</h2>
            <p>Four ways to reach me, no forms.</p>
            <div className="ma-close-cta">
              <a className="ma-btn ma-btn-lg" href={EMAIL}>
                Say hi <span aria-hidden="true">›</span>
              </a>
              <a className="ma-btn-ghost ma-btn-lg" href={CV} target="_blank" rel="noreferrer">
                Download CV <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>
          <div className="ma-tiles">
            <a className="ma-tile" href={EMAIL} data-reveal>
              <span className="ma-tile-icon"><MailIcon /></span>
              <span className="ma-tile-label">Email <span aria-hidden="true">›</span></span>
            </a>
            <a className="ma-tile" href={WHATSAPP} target="_blank" rel="noreferrer" data-reveal style={{ transitionDelay: '0.06s' }}>
              <span className="ma-tile-icon"><ChatIcon /></span>
              <span className="ma-tile-label">WhatsApp <span aria-hidden="true">›</span></span>
            </a>
            <a className="ma-tile" href={CV} target="_blank" rel="noreferrer" data-reveal style={{ transitionDelay: '0.12s' }}>
              <span className="ma-tile-icon"><DocIcon /></span>
              <span className="ma-tile-label">CV <span aria-hidden="true">›</span></span>
            </a>
            <a className="ma-tile" href={GITHUB} target="_blank" rel="noreferrer" data-reveal style={{ transitionDelay: '0.18s' }}>
              <span className="ma-tile-icon"><CodeIcon /></span>
              <span className="ma-tile-label">GitHub <span aria-hidden="true">›</span></span>
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="ma-footer">
        <div className="ma-footer-top">
          <span className="ma-footer-mark">
            bar for moon<span className="ma-wm-active">active</span>
          </span>
          <div className="ma-footer-cols">
            <nav aria-label="Work links">
              <span className="ma-footer-col-title">Work</span>
              <a href="#ma-work">The work</a>
              <a href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn</a>
            </nav>
            <nav aria-label="Contact links">
              <span className="ma-footer-col-title">Contact</span>
              <a href={EMAIL}>Email</a>
              <a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={CV} target="_blank" rel="noreferrer">CV</a>
            </nav>
            <nav aria-label="Page sections">
              <span className="ma-footer-col-title">Page</span>
              <a href="#ma-main">Top</a>
              <a href="#ma-build">The build</a>
              <a href="#ma-contact">Contact</a>
            </nav>
          </div>
        </div>
        <p>
          Bar Moshe © 2026. A personal application page, not an official Moon
          Active page; Moon Active, Coin Master, and their brands belong to Moon
          Active. Every drawing here is original.
        </p>
      </footer>
    </div>
  );
}
