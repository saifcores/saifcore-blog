import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public/images/articles");

/**
 * Cover artwork is authored once against the dark palette below. The light
 * variant is derived by remapping the foreground tokens — solid brand colours
 * (#2563eb, #10b981, #f43f5e, #f59e0b) read correctly on both backgrounds and
 * are intentionally absent from this table.
 */
const LIGHT_TOKENS = {
  "#e2e8f0": "#0f172a",
  "#93c5fd": "#1d4ed8",
  "#60a5fa": "#1d4ed8",
  "#6ee7b7": "#047857",
  "#34d399": "#059669",
  "#fda4af": "#be123c",
  "#fcd34d": "#b45309",
  "#94a3b8": "#475569",
  "#64748b": "#475569",
  "rgba(255,255,255,0.2)": "rgba(15,23,42,0.22)",
  "rgba(255,255,255,0.15)": "rgba(15,23,42,0.18)",
  "rgba(255,255,255,0.12)": "rgba(15,23,42,0.15)",
  "rgba(255,255,255,0.05)": "rgba(15,23,42,0.05)",
  "rgba(255,255,255,0.04)": "rgba(15,23,42,0.04)",
};

const toLight = (markup) =>
  Object.entries(LIGHT_TOKENS).reduce(
    (out, [from, to]) => out.split(from).join(to),
    markup,
  );

const PALETTES = [
  {
    suffix: "",
    bgFrom: "#0a0d14",
    bgTo: "#111827",
    grid: "rgba(255,255,255,0.04)",
    haloBlue: "0.3",
    haloGreen: "0.26",
    glow: "9",
    wordmark: "rgba(255,255,255,0.35)",
    recolor: (markup) => markup,
  },
  {
    suffix: "-light",
    bgFrom: "#f8fafc",
    bgTo: "#e9eef5",
    grid: "rgba(15,23,42,0.05)",
    haloBlue: "0.1",
    haloGreen: "0.09",
    glow: "3",
    wordmark: "rgba(15,23,42,0.4)",
    recolor: toLight,
  },
];

const SANS = "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif";

/**
 * Splits a scene into a blurred shape layer and a crisp text layer. A filter on
 * a group applies to the composited result, so glowing the whole scene also
 * blurs its labels — the text has to be lifted out and drawn on top.
 */
function splitTextLayer(markup) {
  const texts = markup.match(/<text\b[\s\S]*?<\/text>/g) ?? [];
  return {
    shapes: markup.replace(/<text\b[\s\S]*?<\/text>/g, "").trimEnd(),
    texts: texts.join("\n    "),
  };
}

const base = (inner, p) => {
  const { shapes, texts } = splitTextLayer(p.recolor(inner));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-hidden="true" font-family="${SANS}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bgFrom}"/>
      <stop offset="100%" stop-color="${p.bgTo}"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <radialGradient id="haloBlue">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="${p.haloBlue}"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="haloGreen">
      <stop offset="0%" stop-color="#10b981" stop-opacity="${p.haloGreen}"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="${p.grid}" stroke-width="1"/>
    </pattern>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${p.glow}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <ellipse cx="180" cy="90" rx="380" ry="300" fill="url(#haloBlue)"/>
  <ellipse cx="1030" cy="600" rx="420" ry="320" fill="url(#haloGreen)"/>
  ${shapes}
  <g>
    ${texts}
  </g>
  <rect x="48" y="600" width="26" height="3" rx="1.5" fill="url(#brand)"/>
  <text x="48" y="632" fill="${p.wordmark}" font-size="13" font-weight="700" letter-spacing="0.22em">SAIFCORE</text>
</svg>`;
};

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

  "reflection-subjects": `
  <g filter="url(#glow)">
    <circle cx="600" cy="320" r="120" fill="none" stroke="url(#brand)" stroke-width="2" opacity="0.5"/>
    <circle cx="600" cy="320" r="80" fill="rgba(244,63,94,0.12)" stroke="#f43f5e" stroke-width="2"/>
    <text x="600" y="310" text-anchor="middle" fill="#fda4af" font-size="20" font-weight="700">REFLECT</text>
    <text x="600" y="340" text-anchor="middle" fill="#94a3b8" font-size="13">craft · context · lessons</text>
    <text x="420" y="200" fill="#64748b" font-size="12">Africa</text>
    <text x="780" y="200" fill="#64748b" font-size="12">Leadership</text>
    <text x="400" y="440" fill="#64748b" font-size="12">Money ethics</text>
    <text x="760" y="440" fill="#64748b" font-size="12">Delivery</text>
  </g>`,

  "loneliness-of-the-payment-engineer": `
  <g filter="url(#glow)">
    <circle cx="420" cy="280" r="36" fill="rgba(37,99,235,0.2)" stroke="#2563eb" stroke-width="2"/>
    <text x="420" y="286" text-anchor="middle" fill="#93c5fd" font-size="11">LEDGER</text>
    <circle cx="600" cy="240" r="44" fill="rgba(244,63,94,0.15)" stroke="#f43f5e" stroke-width="2"/>
    <text x="600" y="246" text-anchor="middle" fill="#fda4af" font-size="12" font-weight="700">YOU</text>
    <circle cx="780" cy="280" r="36" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <text x="780" y="286" text-anchor="middle" fill="#6ee7b7" font-size="11">CALLBACK</text>
    <path d="M456 280 H564 M636 280 H744" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="6 4"/>
    <rect x="480" y="380" width="240" height="80" rx="10" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1"/>
    <text x="600" y="418" text-anchor="middle" fill="#fcd34d" font-size="13">TICKET · 02:14</text>
    <text x="600" y="520" text-anchor="middle" fill="#94a3b8" font-size="14">ONE THREAD · THREE AUDIENCES</text>
  </g>`,

  "when-success-is-not-settled": `
  <g filter="url(#glow)">
    <text x="600" y="168" text-anchor="middle" fill="#60a5fa" font-family="ui-monospace,monospace" font-size="22">{ status: "SUCCESS" }</text>
    <rect x="160" y="220" width="340" height="200" rx="16" fill="rgba(16,185,129,0.16)" stroke="#10b981" stroke-width="2"/>
    <circle cx="330" cy="285" r="30" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="2"/>
    <path d="M316 285 L326 295 L348 271" stroke="#34d399" stroke-width="3.5" fill="none"/>
    <text x="330" y="350" text-anchor="middle" fill="#6ee7b7" font-size="26" font-weight="700">PAID</text>
    <text x="330" y="382" text-anchor="middle" fill="#94a3b8" font-size="13">FRI 16:43</text>
    <text x="600" y="330" text-anchor="middle" fill="#64748b" font-size="40">≠</text>
    <rect x="700" y="220" width="340" height="200" rx="16" fill="rgba(244,63,94,0.12)" stroke="#f43f5e" stroke-width="2" stroke-dasharray="10 7"/>
    <text x="870" y="278" text-anchor="middle" fill="#fda4af" font-family="ui-monospace,monospace" font-size="16">OM-88421</text>
    <line x1="780" y1="310" x2="960" y2="310" stroke="#f43f5e" stroke-width="2" opacity="0.55"/>
    <text x="870" y="360" text-anchor="middle" fill="#fda4af" font-size="26" font-weight="700">MISSING</text>
    <text x="870" y="392" text-anchor="middle" fill="#94a3b8" font-size="13">MON 09:12</text>
    <text x="600" y="500" text-anchor="middle" fill="#94a3b8" font-size="14">CALLBACK LIE · SETTLEMENT TRUTH</text>
  </g>`,

  "centralized-baas-multi-subsidiary-branches": `
  <g filter="url(#glow)">
    <rect x="480" y="160" width="240" height="80" rx="14" fill="rgba(37,99,235,0.25)" stroke="url(#brand)" stroke-width="2"/>
    <text x="600" y="208" text-anchor="middle" fill="#e2e8f0" font-size="18" font-weight="700">PLATFORM</text>
    <rect x="220" y="320" width="160" height="70" rx="12" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="2"/>
    <rect x="520" y="320" width="160" height="70" rx="12" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="2"/>
    <rect x="820" y="320" width="160" height="70" rx="12" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="2"/>
    <text x="300" y="362" text-anchor="middle" fill="#94a3b8" font-size="14">FILIALE</text>
    <text x="600" y="362" text-anchor="middle" fill="#94a3b8" font-size="14">FILIALE</text>
    <text x="900" y="362" text-anchor="middle" fill="#94a3b8" font-size="14">FILIALE</text>
    <circle cx="260" cy="480" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="340" cy="480" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="560" cy="480" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="640" cy="480" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="860" cy="480" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="940" cy="480" r="22" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M600 240 V300 M300 320 V280 H600 M900 320 V280 H600 M300 390 V450 M600 390 V450 M900 390 V450" stroke="url(#brand)" stroke-width="2" opacity="0.6"/>
    <text x="600" y="560" text-anchor="middle" fill="#94a3b8" font-size="14">GROUP · SUBSIDIARY · BRANCH</text>
  </g>`,

  "eleven-subsidiaries-eleven-ways-to-break-a-webhook": `
  <g filter="url(#glow)">
    <rect x="480" y="180" width="240" height="90" rx="14" fill="rgba(37,99,235,0.25)" stroke="#2563eb" stroke-width="2"/>
    <text x="600" y="235" text-anchor="middle" fill="#e2e8f0" font-size="16" font-weight="700">WEBHOOK</text>
    <path d="M600 270 L280 400 M600 270 L420 420 M600 270 L560 430 M600 270 L740 430 M600 270 L880 420 M600 270 L980 400" stroke="url(#brand)" stroke-width="2" opacity="0.55"/>
    <circle cx="280" cy="420" r="28" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <circle cx="420" cy="440" r="28" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="560" cy="450" r="28" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" stroke-width="2"/>
    <circle cx="740" cy="450" r="28" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <circle cx="880" cy="440" r="28" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="980" cy="420" r="28" fill="rgba(244,63,94,0.2)" stroke="#f43f5e" stroke-width="2"/>
    <text x="600" y="540" text-anchor="middle" fill="#94a3b8" font-size="14">1 CONTRACT · 11 OPERATING REALITIES</text>
  </g>`,

  "retry-storm-double-payout": `
  <g filter="url(#glow)">
    <rect x="200" y="260" width="160" height="70" rx="10" fill="rgba(37,99,235,0.2)" stroke="#2563eb" stroke-width="2"/>
    <text x="280" y="302" text-anchor="middle" fill="#e2e8f0" font-size="14">PAYOUT #1</text>
    <rect x="420" y="260" width="160" height="70" rx="10" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="2"/>
    <text x="500" y="302" text-anchor="middle" fill="#e2e8f0" font-size="14">RETRY #2</text>
    <rect x="640" y="260" width="160" height="70" rx="10" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="2"/>
    <text x="720" y="302" text-anchor="middle" fill="#e2e8f0" font-size="14">RETRY #3</text>
    <rect x="860" y="260" width="160" height="70" rx="10" fill="rgba(16,185,129,0.25)" stroke="#10b981" stroke-width="2"/>
    <text x="940" y="302" text-anchor="middle" fill="#6ee7b7" font-size="13">SAME KEY</text>
    <path d="M360 295 H420 M580 295 H640 M800 295 H860" stroke="url(#brand)" stroke-width="3"/>
    <text x="600" y="200" text-anchor="middle" fill="#60a5fa" font-family="ui-monospace,monospace" font-size="18">idempotency-key: merch|order|amt</text>
    <text x="600" y="420" text-anchor="middle" fill="#94a3b8" font-size="14">3 REQUESTS · 1 TRANSFER</text>
  </g>`,

  "stop-microservices-first-west-africa": `
  <g filter="url(#glow)">
    <rect x="280" y="200" width="280" height="280" rx="16" fill="rgba(37,99,235,0.18)" stroke="#2563eb" stroke-width="2"/>
    <line x1="280" y1="295" x2="560" y2="295" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
    <line x1="280" y1="380" x2="560" y2="380" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
    <text x="420" y="260" text-anchor="middle" fill="#93c5fd" font-size="16" font-weight="700">AUTH</text>
    <text x="420" y="345" text-anchor="middle" fill="#93c5fd" font-size="16" font-weight="700">PAYMENTS</text>
    <text x="420" y="430" text-anchor="middle" fill="#93c5fd" font-size="16" font-weight="700">NOTIFY</text>
    <text x="420" y="520" text-anchor="middle" fill="#34d399" font-size="14">MODULAR MONOLITH</text>
    <g opacity="0.45">
      <rect x="700" y="210" width="100" height="60" rx="8" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
      <rect x="840" y="210" width="100" height="60" rx="8" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
      <rect x="700" y="300" width="100" height="60" rx="8" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
      <rect x="840" y="300" width="100" height="60" rx="8" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
      <rect x="770" y="390" width="100" height="60" rx="8" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="820" y="500" text-anchor="middle" fill="#64748b" font-size="13">12 SERVICES · 2 OPS</text>
    </g>
  </g>`,

  "payment-gateway-system-design": `
  <g filter="url(#glow)">
    <rect x="140" y="250" width="140" height="70" rx="12" fill="rgba(37,99,235,0.22)" stroke="#2563eb" stroke-width="2"/>
    <text x="210" y="292" text-anchor="middle" fill="#e2e8f0" font-size="14" font-weight="700">AUTH</text>
    <rect x="360" y="250" width="140" height="70" rx="12" fill="rgba(37,99,235,0.22)" stroke="#2563eb" stroke-width="2"/>
    <text x="430" y="292" text-anchor="middle" fill="#e2e8f0" font-size="14" font-weight="700">CAPTURE</text>
    <rect x="580" y="250" width="140" height="70" rx="12" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <text x="650" y="292" text-anchor="middle" fill="#6ee7b7" font-size="14" font-weight="700">SETTLE</text>
    <rect x="800" y="250" width="200" height="70" rx="12" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="2"/>
    <text x="900" y="292" text-anchor="middle" fill="#fcd34d" font-size="14" font-weight="700">PAYOUT</text>
    <path d="M280 285 H360 M500 285 H580 M720 285 H800" stroke="url(#brand)" stroke-width="3"/>
    <rect x="400" y="400" width="400" height="64" rx="12" fill="rgba(37,99,235,0.15)" stroke="url(#brand)" stroke-width="2"/>
    <text x="600" y="440" text-anchor="middle" fill="#93c5fd" font-family="ui-monospace,monospace" font-size="16">LEDGER Σ = 0</text>
    <text x="600" y="180" text-anchor="middle" fill="#94a3b8" font-size="14">CARD → NETWORK → ACQUIRER → MERCHANT</text>
    <text x="600" y="540" text-anchor="middle" fill="#94a3b8" font-size="14">STATE MACHINE · AUDIT · AT-LEAST-ONCE</text>
  </g>`,

  "stop-shipping-is-paid-true": `
  <g filter="url(#glow)">
    <rect x="180" y="220" width="280" height="120" rx="14" fill="rgba(244,63,94,0.18)" stroke="#f43f5e" stroke-width="2"/>
    <text x="320" y="275" text-anchor="middle" fill="#fda4af" font-family="ui-monospace,monospace" font-size="22">isPaid: true</text>
    <text x="320" y="310" text-anchor="middle" fill="#94a3b8" font-size="13">ONE BIT · THREE LIES</text>
    <path d="M480 280 H560" stroke="url(#brand)" stroke-width="3"/>
    <rect x="560" y="160" width="220" height="70" rx="12" fill="rgba(37,99,235,0.22)" stroke="#2563eb" stroke-width="2"/>
    <text x="670" y="202" text-anchor="middle" fill="#93c5fd" font-size="16" font-weight="700">ACCEPTED</text>
    <rect x="560" y="260" width="220" height="70" rx="12" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="2"/>
    <text x="670" y="302" text-anchor="middle" fill="#fcd34d" font-size="16" font-weight="700">CONFIRMED</text>
    <rect x="560" y="360" width="220" height="70" rx="12" fill="rgba(16,185,129,0.22)" stroke="#10b981" stroke-width="2"/>
    <text x="670" y="402" text-anchor="middle" fill="#6ee7b7" font-size="16" font-weight="700">SETTLED</text>
    <text x="600" y="520" text-anchor="middle" fill="#94a3b8" font-size="14">UI ≠ PROVIDER ≠ LEDGER ≠ BANK</text>
  </g>`,

  "why-saifcore": `
  <g filter="url(#glow)">
    <text x="600" y="200" text-anchor="middle" fill="#e2e8f0" font-size="36" font-weight="700" letter-spacing="0.12em">SAIFCORE</text>
    <text x="600" y="245" text-anchor="middle" fill="#94a3b8" font-size="16">DAKAR · AFRICA × GLOBAL</text>
    <rect x="200" y="300" width="200" height="64" rx="12" fill="rgba(37,99,235,0.22)" stroke="#2563eb" stroke-width="2"/>
    <text x="300" y="340" text-anchor="middle" fill="#93c5fd" font-size="14" font-weight="700">BACKEND</text>
    <rect x="440" y="300" width="200" height="64" rx="12" fill="rgba(37,99,235,0.22)" stroke="#2563eb" stroke-width="2"/>
    <text x="540" y="340" text-anchor="middle" fill="#93c5fd" font-size="14" font-weight="700">DISTRIBUTED</text>
    <rect x="680" y="300" width="200" height="64" rx="12" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2"/>
    <text x="780" y="340" text-anchor="middle" fill="#6ee7b7" font-size="14" font-weight="700">PAYMENTS</text>
    <rect x="320" y="400" width="560" height="70" rx="12" fill="rgba(37,99,235,0.12)" stroke="url(#brand)" stroke-width="2"/>
    <text x="600" y="443" text-anchor="middle" fill="#e2e8f0" font-size="16">RELIABLE · OBSERVABLE · RECONCILABLE</text>
    <text x="600" y="530" text-anchor="middle" fill="#94a3b8" font-size="14">PLATFORMS FOR BUSINESS-CRITICAL SYSTEMS</text>
  </g>`,
};

fs.mkdirSync(OUT, { recursive: true });

let written = 0;
for (const [slug, inner] of Object.entries(covers)) {
  for (const palette of PALETTES) {
    fs.writeFileSync(
      path.join(OUT, `${slug}${palette.suffix}.svg`),
      base(inner, palette),
    );
    written += 1;
  }
}

const slugs = Object.keys(covers).sort();
fs.writeFileSync(
  path.join(process.cwd(), "src/lib/generated-covers.ts"),
  `// Generated by scripts/generate-covers.mjs — do not edit by hand.\n` +
    `export const GENERATED_COVER_SLUGS = new Set([\n` +
    slugs.map((slug) => `  "${slug}",\n`).join("") +
    `]);\n`,
);

console.log(
  `Generated ${written} cover illustrations (${slugs.length} slugs × ${PALETTES.length} themes).`,
);
