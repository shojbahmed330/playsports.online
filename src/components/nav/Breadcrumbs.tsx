import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home, ChevronDown } from "lucide-react";
import { useState } from "react";

// Map known path segments to human labels + their canonical landing URL.
const LABELS: Record<string, { label: string; to: string }> = {
  "/": { label: "Hub", to: "/" },
  "/football": { label: "Football", to: "/football" },
  "/cricket": { label: "Cricket", to: "/cricket" },
  "/cricket/scores": { label: "Scores", to: "/cricket/scores" },
  "/cricket/series": { label: "Series", to: "/cricket/series" },
  "/cricket/teams": { label: "Teams", to: "/cricket/teams" },
  "/cricket/players": { label: "Players", to: "/cricket/players" },
  "/cricket/rankings": { label: "Rankings", to: "/cricket/rankings" },
  "/cricket/records": { label: "Records", to: "/cricket/records" },
  "/cricket/history": { label: "History", to: "/cricket/history" },
  "/cricket/ipl": { label: "IPL", to: "/cricket/ipl" },
  "/cricket/ipl/scores": { label: "Scores", to: "/cricket/ipl/scores" },
  "/cricket/ipl/standings": { label: "Standings", to: "/cricket/ipl/standings" },
  "/cricket/ipl/teams": { label: "Teams", to: "/cricket/ipl/teams" },
  "/cricket/ipl/players": { label: "Players", to: "/cricket/ipl/players" },
  "/cricket/ipl/history": { label: "History", to: "/cricket/ipl/history" },
  "/cricket/ipl/records": { label: "Records", to: "/cricket/ipl/records" },
  "/mlb": { label: "MLB", to: "/mlb" },
  "/nba": { label: "NBA", to: "/nba" },
  "/nhl": { label: "NHL", to: "/nhl" },
  "/mls": { label: "MLS", to: "/mls" },
  "/players": { label: "Player Stats", to: "/players" },
  "/admin": { label: "Admin", to: "/admin" },
};

type Crumb = { label: string; to: string };

function buildCrumbs(pathname: string): Crumb[] {
  // strip trailing slash
  const p = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  if (p === "/" || p === "") return [];
  const parts = p.split("/").filter(Boolean);
  const out: Crumb[] = [];
  let acc = "";
  for (const seg of parts) {
    acc += "/" + seg;
    const known = LABELS[acc];
    if (known) {
      out.push(known);
    } else {
      // dynamic segment — humanize
      const human = decodeURIComponent(seg)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      out.push({ label: human, to: acc });
    }
  }
  return out;
}

export function Breadcrumbs({ className = "" }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const crumbs = buildCrumbs(pathname);
  if (crumbs.length === 0) return null;

  const last = crumbs[crumbs.length - 1];
  const trail = crumbs.slice(0, -1);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`max-w-7xl mx-auto px-3 sm:px-6 py-1.5 text-[11px] text-white/55 ${className}`}
    >
      {/* Mobile: collapsed chip with toggle */}
      <div className="sm:hidden flex items-center gap-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-1 ring-1 ring-white/10 hover:text-white"
          aria-label="Home"
        >
          <Home className="size-3" />
        </Link>
        {trail.length > 0 && (
          <>
            <ChevronRight className="size-3 text-white/30" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.05] px-2 py-1 ring-1 ring-white/10 text-white/70"
              aria-expanded={open}
            >
              {open ? trail[0].label : "…"}
              <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </>
        )}
        <ChevronRight className="size-3 text-white/30" />
        <span className="truncate font-semibold text-white/85">{last.label}</span>
      </div>

      {/* Mobile expanded trail */}
      {open && trail.length > 1 && (
        <div className="sm:hidden mt-1 flex flex-wrap items-center gap-1">
          {trail.map((c, i) => (
            <span key={c.to} className="inline-flex items-center gap-1">
              <Link to={c.to} className="rounded-full bg-white/[0.04] px-2 py-0.5 ring-1 ring-white/10 hover:text-white">
                {c.label}
              </Link>
              {i < trail.length - 1 && <ChevronRight className="size-3 text-white/30" />}
            </span>
          ))}
        </div>
      )}

      {/* Desktop: full trail */}
      <ol className="hidden sm:flex items-center gap-1.5 min-w-0">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-white" aria-label="Home">
            <Home className="size-3" />
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.to} className="inline-flex items-center gap-1.5 min-w-0">
              <ChevronRight className="size-3 text-white/30 shrink-0" />
              {isLast ? (
                <span className="truncate font-semibold text-white/85">{c.label}</span>
              ) : (
                <Link to={c.to} className="truncate hover:text-white">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
