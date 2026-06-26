// Dynamic OG share image — 1200x630 SVG. Lightweight, edge-friendly, no WASM.
// URL: /og/{type}/{slug}.svg  where type ∈ team | player | vs | archive | match | default
// Slug may contain extra context after a `--` separator (e.g. `argentina--football_wc`).
import { createFileRoute } from "@tanstack/react-router";

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function titleCase(s: string): string {
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Params = { type: string; slug: string };

function buildLabels({ type, slug }: Params): { eyebrow: string; title: string; subtitle: string; accent: string } {
  const [rawSlug, ctx] = slug.split("--");
  const pretty = titleCase(decodeURIComponent(rawSlug ?? ""));
  switch (type) {
    case "team":
      return { eyebrow: "TEAM PROFILE", title: pretty, subtitle: "Fixtures · Top scorers · Tournament history", accent: "#22d3ee" };
    case "player":
      return { eyebrow: "PLAYER STATS", title: pretty, subtitle: "Career goals · Tournaments · Records", accent: "#f59e0b" };
    case "vs": {
      const parts = (rawSlug ?? "").split("-vs-");
      const a = titleCase(parts[0] ?? "Team A");
      const b = titleCase(parts[1] ?? "Team B");
      return { eyebrow: "HEAD TO HEAD", title: `${a}  vs  ${b}`, subtitle: "Historical record · Last meetings · Goals", accent: "#a78bfa" };
    }
    case "archive":
      return { eyebrow: `ARCHIVE ${ctx ? "· " + ctx.toUpperCase() : ""}`, title: `World Cup ${pretty}`, subtitle: "Champion · Top scorers · Full results", accent: "#34d399" };
    case "match":
      return { eyebrow: "MATCH CENTRE", title: pretty || "Live Match", subtitle: "Lineups · Live commentary · Stats", accent: "#ef4444" };
    default:
      return { eyebrow: "ALLSPORTSLIVE", title: pretty || "All Sports, One Place", subtitle: "Football · Cricket · MLB · NBA · NHL · MLS", accent: "#22d3ee" };
  }
}

function render({ type, slug }: Params): string {
  const { eyebrow, title, subtitle, accent } = buildLabels({ type, slug });
  const safeTitle = esc(truncate(title, 38));
  const safeSub = esc(truncate(subtitle, 70));
  const safeEye = esc(eyebrow);
  // Two-line wrap for long titles
  const titleSize = safeTitle.length > 22 ? 78 : 102;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1220"/>
      <stop offset="55%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <!-- accent bar -->
  <rect x="80" y="120" width="6" height="80" fill="${accent}" rx="3"/>
  <!-- eyebrow -->
  <text x="110" y="160" font-family="-apple-system, Segoe UI, Roboto, Inter, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${accent}">${safeEye}</text>
  <!-- title -->
  <text x="80" y="320" font-family="-apple-system, Segoe UI, Roboto, Inter, sans-serif" font-size="${titleSize}" font-weight="900" fill="#f8fafc">${safeTitle}</text>
  <!-- subtitle -->
  <text x="80" y="400" font-family="-apple-system, Segoe UI, Roboto, Inter, sans-serif" font-size="30" font-weight="500" fill="#cbd5e1">${safeSub}</text>
  <!-- footer brand -->
  <g transform="translate(80, 530)">
    <circle cx="22" cy="22" r="22" fill="${accent}"/>
    <text x="14" y="30" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-size="24" font-weight="900" fill="#0b1220">AS</text>
    <text x="62" y="22" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="800" fill="#f1f5f9">allsportslive</text>
    <text x="62" y="48" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-size="18" font-weight="500" fill="#94a3b8">Live scores · Stats · Archives</text>
  </g>
  <!-- corner decorative -->
  <g opacity="0.5" transform="translate(1020, 460)">
    <circle cx="60" cy="60" r="60" fill="none" stroke="${accent}" stroke-width="2"/>
    <circle cx="60" cy="60" r="40" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6"/>
    <circle cx="60" cy="60" r="20" fill="${accent}" opacity="0.3"/>
  </g>
</svg>`;
}

export const Route = createFileRoute("/og/$type/$slug.svg")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const svg = render(params as Params);
        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
          },
        });
      },
    },
  },
});
