import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public/images/articles");

const base = (inner) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <ellipse cx="200" cy="120" rx="180" ry="120" fill="#2563eb" opacity="0.12"/>
  <ellipse cx="1000" cy="560" rx="220" ry="140" fill="#10b981" opacity="0.1"/>
  ${inner}
  <text x="48" y="628" fill="rgba(255,255,255,0.35)" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" font-weight="600" letter-spacing="0.2em">SAIFCORE</text>
</svg>`;

const covers = {
  "banking-middleware-multi-subsidiary": `
  <g filter="url(#glow)">
    <rect x="520" y="250" width="160" height="100" rx="16" fill="rgba(37,99,235,0.25)" stroke="url(#brand)" stroke-width="2"/>
    <text x="600" y="310" text-anchor="middle" fill="#e2e8f0" font-family="ui-monospace,monospace" font-size="18">API GW</text>
    <circle cx="320" cy="200" r="44" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <circle cx="880" cy="200" r="44" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <circle cx="280" cy="420" r="44" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <circle cx="920" cy="420" r="44" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <path d="M364 220 L516 280 M836 220 L684 280 M324 400 L516 340 M876 400 L684 340" stroke="url(#brand)" stroke-width="2" opacity="0.7"/>
    <text x="320" y="206" text-anchor="middle" fill="#94a3b8" font-size="12">FIL</text>
    <text x="880" y="206" text-anchor="middle" fill="#94a3b8" font-size="12">FIL</text>
  </g>`,

  "adr-double-entry-ledger-payments": `
  <g filter="url(#glow)">
    <rect x="340" y="180" width="220" height="300" rx="12" fill="rgba(37,99,235,0.15)" stroke="#2563eb" stroke-width="2"/>
    <rect x="640" y="180" width="220" height="300" rx="12" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2"/>
    <text x="450" y="230" text-anchor="middle" fill="#60a5fa" font-size="22" font-weight="700">DEBIT</text>
    <text x="750" y="230" text-anchor="middle" fill="#34d399" font-size="22" font-weight="700">CREDIT</text>
    <line x1="380" y1="280" x2="520" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <line x1="380" y1="330" x2="500" y2="330" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <line x1="680" y1="280" x2="820" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <line x1="680" y1="330" x2="800" y2="330" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <text x="600" y="520" text-anchor="middle" fill="#94a3b8" font-size="16">APPEND-ONLY JOURNAL</text>
  </g>`,

  "scalable-fintech-systems": `
  <g filter="url(#glow)">
    <rect x="200" y="280" width="140" height="70" rx="10" fill="rgba(37,99,235,0.2)" stroke="#2563eb" stroke-width="2"/>
    <text x="270" y="322" text-anchor="middle" fill="#e2e8f0" font-size="14">INIT</text>
    <rect x="420" y="280" width="140" height="70" rx="10" fill="rgba(37,99,235,0.2)" stroke="#2563eb" stroke-width="2"/>
    <text x="490" y="322" text-anchor="middle" fill="#e2e8f0" font-size="14">AUTH</text>
    <rect x="640" y="280" width="140" height="70" rx="10" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <text x="710" y="322" text-anchor="middle" fill="#e2e8f0" font-size="14">LEDGER</text>
    <rect x="860" y="280" width="140" height="70" rx="10" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <text x="930" y="322" text-anchor="middle" fill="#e2e8f0" font-size="14">RECON</text>
    <path d="M340 315 H420 M560 315 H640 M780 315 H860" stroke="url(#brand)" stroke-width="3"/>
    <text x="600" y="220" text-anchor="middle" fill="#60a5fa" font-family="ui-monospace,monospace" font-size="20">idempotency-key: pay_7f3a…</text>
  </g>`,

  "why-saas-fail-africa": `
  <g filter="url(#glow)">
    <path d="M520 160 C580 140 640 150 700 180 C760 210 800 260 820 320 C840 380 820 440 760 480 C700 520 620 530 540 510 C460 490 400 450 380 390 C360 330 380 270 440 220 C480 190 500 170 520 160 Z" fill="rgba(16,185,129,0.12)" stroke="url(#brand)" stroke-width="2"/>
    <rect x="480" y="360" width="90" height="150" rx="14" fill="rgba(37,99,235,0.25)" stroke="#2563eb" stroke-width="2"/>
    <rect x="630" y="360" width="90" height="150" rx="14" fill="rgba(37,99,235,0.25)" stroke="#2563eb" stroke-width="2"/>
    <circle cx="525" cy="400" r="18" fill="#10b981" opacity="0.8"/>
    <circle cx="675" cy="400" r="18" fill="#f59e0b" opacity="0.8"/>
    <text x="600" y="560" text-anchor="middle" fill="#94a3b8" font-size="15">MOBILE MONEY · TRUST · DISTRIBUTION</text>
  </g>`,

  "architecture-reviews-that-help": `
  <g filter="url(#glow)">
    <rect x="380" y="150" width="440" height="380" rx="16" fill="rgba(255,255,255,0.04)" stroke="url(#brand)" stroke-width="2"/>
    <text x="420" y="210" fill="#f59e0b" font-size="28" font-weight="700">ADR</text>
    <text x="420" y="270" fill="#94a3b8" font-size="16">Context</text>
    <line x1="420" y1="290" x2="760" y2="290" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <text x="420" y="340" fill="#94a3b8" font-size="16">Decision</text>
    <line x1="420" y1="360" x2="760" y2="360" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <text x="420" y="410" fill="#94a3b8" font-size="16">Consequences</text>
    <line x1="420" y1="430" x2="720" y2="430" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <circle cx="760" cy="470" r="28" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
    <path d="M748 470 L756 478 L774 458" stroke="#34d399" stroke-width="3" fill="none"/>
  </g>`,

  "design-tokens-boundaries": `
  <g filter="url(#glow)">
    <rect x="280" y="200" width="100" height="100" rx="12" fill="#2563eb" opacity="0.7"/>
    <rect x="400" y="200" width="100" height="100" rx="12" fill="#3b82f6" opacity="0.7"/>
    <rect x="520" y="200" width="100" height="100" rx="12" fill="#10b981" opacity="0.7"/>
    <rect x="640" y="200" width="100" height="100" rx="12" fill="#34d399" opacity="0.7"/>
    <rect x="760" y="200" width="100" height="100" rx="12" fill="#6366f1" opacity="0.7"/>
    <rect x="340" y="340" width="520" height="120" rx="16" fill="none" stroke="url(#brand)" stroke-width="2" stroke-dasharray="8 6"/>
    <text x="600" y="410" text-anchor="middle" fill="#94a3b8" font-size="16">SEMANTIC TOKENS → PRODUCT LAYER</text>
  </g>`,

  "mobile-money-integration-patterns": `
  <g filter="url(#glow)">
    <rect x="360" y="200" width="120" height="220" rx="20" fill="rgba(37,99,235,0.2)" stroke="#2563eb" stroke-width="2"/>
    <rect x="540" y="200" width="120" height="220" rx="20" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <rect x="720" y="200" width="120" height="220" rx="20" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="2"/>
    <text x="420" y="340" text-anchor="middle" fill="#e2e8f0" font-size="13">WAVE</text>
    <text x="600" y="340" text-anchor="middle" fill="#e2e8f0" font-size="13">OM</text>
    <text x="780" y="340" text-anchor="middle" fill="#e2e8f0" font-size="13">MTN</text>
    <path d="M300 320 Q450 260 600 320 T900 320" fill="none" stroke="url(#brand)" stroke-width="2" opacity="0.6"/>
    <text x="600" y="500" text-anchor="middle" fill="#94a3b8" font-size="15">CALLBACK · HMAC · RECONCILIATION</text>
  </g>`,

  "product-brief-template": `
  <g filter="url(#glow)">
    <rect x="400" y="140" width="400" height="400" rx="12" fill="rgba(255,255,255,0.05)" stroke="url(#brand)" stroke-width="2"/>
    <text x="440" y="200" fill="#60a5fa" font-size="22" font-weight="700">PRODUCT BRIEF</text>
    <text x="440" y="250" fill="#94a3b8" font-size="14">1. Problem</text>
    <text x="440" y="290" fill="#94a3b8" font-size="14">2. Users</text>
    <text x="440" y="330" fill="#94a3b8" font-size="14">3. Metrics</text>
    <text x="440" y="370" fill="#94a3b8" font-size="14">4. Constraints</text>
    <text x="440" y="410" fill="#94a3b8" font-size="14">5. Non-goals</text>
    <text x="440" y="450" fill="#94a3b8" font-size="14">6. Risks</text>
    <rect x="440" y="470" width="300" height="40" rx="8" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="1"/>
    <text x="590" y="496" text-anchor="middle" fill="#34d399" font-size="13">ONE PAGE · BEFORE DIAGRAMS</text>
  </g>`,
};

fs.mkdirSync(OUT, { recursive: true });

for (const [slug, inner] of Object.entries(covers)) {
  fs.writeFileSync(path.join(OUT, `${slug}.svg`), base(inner));
}

console.log(`Generated ${Object.keys(covers).length} cover illustrations.`);
