import { Link } from "@tanstack/react-router";
import { Trophy, Goal, Calendar, Zap } from "lucide-react";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";
import { titleCounts } from "@/lib/competition-history";

/**
 * Four Euro stat tiles: total editions, all-time top scorer, most titles,
 * biggest final win — all pulled from the seeded data.
 */
export function EuroFactsGrid() {
  const editions = COMPETITION_EDITIONS.euro ?? [];
  const editionsCount = editions.filter((e) => e.winner && e.winner !== "TBD").length;
  const topWinner = titleCounts("euro")[0];

  return (
    <section id="facts" className="mt-8 sm:mt-10 scroll-mt-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Tile
          icon={<Calendar className="size-4" />}
          value={`${editionsCount}`}
          label="Editions since 1960"
          to="/football/$comp/history"
        />
        <Tile
          icon={<Goal className="size-4" />}
          value="14"
          label="Ronaldo · all-time top scorer"
          to="/football/$comp/records/$category"
          category="top-scorers-all-time"
          accent="text-emerald-300"
        />
        <Tile
          icon={<Trophy className="size-4" />}
          value={topWinner ? `${topWinner.team} · ${topWinner.titles}` : "—"}
          label="Most titles"
          to="/football/$comp/records/$category"
          category="most-titles"
          accent="text-amber-300"
        />
        <Tile
          icon={<Zap className="size-4" />}
          value="6–1"
          label="NED beat YUG · Euro 2000 QF"
          to="/football/$comp/records/$category"
          category="records-and-firsts"
          accent="text-sky-300"
        />
      </div>
    </section>
  );
}

function Tile({
  icon,
  value,
  label,
  to,
  category,
  accent = "text-foreground",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  to: "/football/$comp/history" | "/football/$comp/records/$category";
  category?: string;
  accent?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition p-3 sm:p-4 min-w-0 h-full">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} <span className="truncate">{label.split("·")[0]}</span>
      </div>
      <div className={`mt-1 text-xl sm:text-2xl font-black tabular-nums truncate ${accent}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{label}</div>
    </div>
  );
  return category ? (
    <Link to={to} params={{ comp: "euro", category }}>
      {inner}
    </Link>
  ) : (
    <Link to={to} params={{ comp: "euro" }}>
      {inner}
    </Link>
  );
}
