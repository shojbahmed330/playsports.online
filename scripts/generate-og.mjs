import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

const wasm = readFileSync(resolve("node_modules/@resvg/resvg-wasm/index_bg.wasm"));
await initWasm(wasm);

const font = readFileSync(
  resolve("node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2"),
);

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="amber" cx="20%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="emerald" cx="92%" cy="100%" r="60%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#080c11"/>
  <rect width="1200" height="630" fill="url(#amber)"/>
  <rect width="1200" height="630" fill="url(#emerald)"/>
  <g opacity="0.06" stroke="#ffffff" stroke-width="1">
    <path d="M0 105H1200M0 210H1200M0 315H1200M0 420H1200M0 525H1200"/>
    <path d="M120 0V630M240 0V630M360 0V630M480 0V630M600 0V630M720 0V630M840 0V630M960 0V630M1080 0V630"/>
  </g>
  <rect x="72" y="72" width="88" height="88" rx="20" fill="url(#brand)"/>
  <text x="116" y="130" text-anchor="middle" font-family="Sora" font-size="48" font-weight="800" fill="#0b0f14">P</text>
  <text x="72" y="330" font-family="Sora" font-size="88" font-weight="800" fill="#ffffff">Play<tspan fill="#fbbf24">Sports</tspan></text>
  <text x="76" y="390" font-family="Sora" font-size="30" font-weight="500" fill="#cbd5e1">Live cricket &amp; football scores, tables, stats &amp; history</text>
  <g font-family="Sora" font-size="21" font-weight="600">
    <rect x="72" y="450" width="132" height="46" rx="23" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-opacity="0.4"/>
    <text x="138" y="480" text-anchor="middle" fill="#6ee7b7">Cricket</text>
    <rect x="216" y="450" width="152" height="46" rx="23" fill="#38bdf8" fill-opacity="0.15" stroke="#38bdf8" stroke-opacity="0.4"/>
    <text x="292" y="480" text-anchor="middle" fill="#7dd3fc">Football</text>
    <rect x="380" y="450" width="96" height="46" rx="23" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-opacity="0.4"/>
    <text x="428" y="480" text-anchor="middle" fill="#fcd34d">IPL</text>
    <rect x="488" y="450" width="224" height="46" rx="23" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-opacity="0.4"/>
    <text x="600" y="480" text-anchor="middle" fill="#fcd34d">Premier League</text>
  </g>
  <text x="1128" y="560" text-anchor="end" font-family="Sora" font-size="24" font-weight="600" fill="#94a3b8">playsports.online</text>
</svg>
`;

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { fontBuffers: [font], defaultFontFamily: "Sora", loadSystemFonts: false },
}).render().asPng();

writeFileSync(resolve("public/og-default.png"), png);
console.log(`Wrote public/og-default.png (${png.length} bytes)`);
