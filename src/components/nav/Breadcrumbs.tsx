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
  "/news": { label: "News", to: "/news" },
  "/live/today": { label: "Live", to: "/live/today" },
  "/guides": { label: "Guides", to: "/guides" },
  "/highlights": { label: "Highlights", to: "/highlights" },
  "/premium": { label: "Premium", to: "/premium" },
  "/mine": { label: "My Feed", to: "/mine" },
  "/archive": { label: "Archive", to: "/archive/football_wc/2022" },
  "/team": { label: "Teams", to: "/football" },
  "/player": { label: "Players", to: "/football" },
  "/vs": { label: "Head to head", to: "/football" },
  "/tournaments": { label: "Tournaments", to: "/football" },
  "/football/world-cup": { label: "World Cup", to: "/football/world-cup" },
};

type Crumb = { label: string; to: string; linkable: boolean };

function buildCrumbs(pathname: string): Crumb[] {
  // strip trailing slash
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (p === "/" || p === "") return [];
  const parts = p.split("/").filter(Boolean);
  const out: Crumb[] = [];
  let acc = "";
  for (const seg of parts) {
    acc += "/" + seg;
    const known = LABELS[acc];
    if (known) {
      out.push({ ...known, linkable: true });
    } else {
      // dynamic segment — humanize, but do not link: a guessed parent path
      // can point at a route that does not exist.
      const human = decodeURIComponent(seg)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      out.push({ label: human, to: acc, linkable: false });
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
      className={`mx-auto max-w-7xl px-3 py-1.5 text-[11px] text-muted-foreground sm:px-6 ${className}`}
    >
      {/* Mobile: collapsed chip with toggle */}
      <div className="flex items-center gap-1 sm:hidden">
        <Link
          to="/"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full bg-muted px-2 ring-1 ring-border transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Home"
        >
          <Home className="size-3.5" aria-hidden="true" />
        </Link>
        {trail.length > 0 && (
          <>
            <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex min-h-11 items-center gap-0.5 rounded-full bg-muted px-2 text-muted-foreground ring-1 ring-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={open}
              aria-label={open ? "Hide breadcrumb levels" : "Show all breadcrumb levels"}
            >
              {open ? trail[0].label : "…"}
              <ChevronDown
                className={`size-3 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
          </>
        )}
        <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="truncate font-semibold text-foreground" aria-current="page">
          {last.label}
        </span>
      </div>

      {/* Mobile expanded trail */}
      {open && trail.length > 1 && (
        <div className="mt-1 flex flex-wrap items-center gap-1 sm:hidden">
          {trail.map((c, i) => (
            <span key={`${c.to}-${i}`} className="inline-flex items-center gap-1">
              {c.linkable ? (
                <Link
                  to={c.to}
                  className="inline-flex min-h-11 items-center rounded-full bg-muted px-2 ring-1 ring-border transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center px-1">{c.label}</span>
              )}
              {i < trail.length - 1 && (
                <ChevronRight className="size-3 text-muted-foreground" aria-hidden="true" />
              )}
            </span>
          ))}
        </div>
      )}

      {/* Desktop: full trail */}
      <ol className="hidden min-w-0 items-center gap-1.5 sm:flex">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Home"
          >
            <Home className="size-3.5" aria-hidden="true" />
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${c.to}-${i}`} className="inline-flex min-w-0 items-center gap-1.5">
              <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
              {isLast ? (
                <span className="truncate font-semibold text-foreground" aria-current="page">
                  {c.label}
                </span>
              ) : c.linkable ? (
                <Link
                  to={c.to}
                  className="inline-flex min-h-11 items-center truncate transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="truncate">{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
