import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Goal, Trophy, Users, Flame } from "lucide-react";
import {
  COPA_TOP_SCORERS_LB,
  COPA_MOST_TITLES_LB,
  COPA_MOST_APPS_LB,
  COPA_SINGLE_EDITION_GOALS_LB,
  flag,
  type LeaderRow,
} from "@/lib/copa-records";

type Facet = "all" | "players" | "nations" | "matches" | "editions";

type Board = {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  rows: LeaderRow[];
  facet: Exclude<Facet, "all">;
  suffix?: string;
  category: "top-scorers-all-time" | "most-titles" | "most-appearances" | "records-and-firsts";
};

const BOARDS: Board[] = [
  { key: "top-scorers", title: "Top scorers · all-time", icon: Goal, rows: COPA_TOP_SCORERS_LB.slice(0, 3), facet: "players", suffix: "goals", category: "top-scorers-all-time" },
  { key: "most-titles", title: "Most titles · nations", icon: Trophy, rows: COPA_MOST_TITLES_LB.slice(0, 3), facet: "nations", suffix: "titles", category: "most-titles" },
  { key: "most-appearances", title: "Most appearances", icon: Users, rows: COPA_MOST_APPS_LB.slice(0, 3), facet: "matches", suffix: "matches", category: "most-appearances" },
  { key: "single-edition", title: "Most goals · single Copa", icon: Flame, rows: COPA_SINGLE_EDITION_GOALS_LB.slice(0, 3), facet: "editions", suffix: "goals", category: "records-and-firsts" },
];

const CHIPS: { id: Facet; label: string }[] = [
  { id: "all", label: "All" },
  { id: "players", label: "Players" },
  { id: "nations", label: "Nations" },
  { id: "matches", label: "Matches" },
  { id: "editions", label: "Editions" },
];

export function CopaRecordsLeaderboardTeaser() {
  const [facet, setFacet] = useState<Facet>("all");
  const boards = BOARDS.filter((b) => facet === "all" || b.facet === facet);

  return (
    <section id="leaderboards" className="mt-8 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
          Leaderboards
        </h2>
      </div>

      <div className="mb-3 flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {CHIPS.map((c) => {
          const active = c.id === facet;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setFacet(c.id)}
              className={`tap-target shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                active
                  ? "bg-white text-gray-950 ring-white"
                  : "bg-white/[0.04] text-muted-foreground ring-white/10 hover:text-foreground hover:ring-white/20"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {boards.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1">No leaderboards match this filter.</p>
      ) : (
        <div className="edge-fade-x -mx-4 sm:mx-0">
          <ul className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[50%] lg:auto-cols-[25%] gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
            {boards.map((b) => (
              <li key={b.key} className="snap-start">
                <MiniBoard board={b} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function MiniBoard({ board }: { board: Board }) {
  const Icon = board.icon;
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-8 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
          <Icon className="size-4" />
        </span>
        <div className="font-bold text-sm sm:text-base truncate">{board.title}</div>
      </div>
      <ol className="space-y-1.5 flex-1">
        {board.rows.map((r) => (
          <li
            key={`${r.rank}-${r.name}`}
            className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-2 min-w-0"
          >
            <span className="size-6 shrink-0 rounded-full bg-white/5 grid place-items-center text-[11px] font-bold tabular-nums">
              {r.rank}
            </span>
            <span className="text-base shrink-0" aria-hidden>{flag(r.nation)}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold truncate">{r.name}</span>
              {r.note && (
                <span className="block text-[10px] text-muted-foreground truncate">{r.note}</span>
              )}
            </span>
            <span className="shrink-0 rounded-full bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[11px] font-bold tabular-nums">
              {r.value}
              {board.suffix ? ` ${board.suffix.charAt(0)}` : ""}
            </span>
          </li>
        ))}
      </ol>
      <Link
        to="/football/$comp/records/$category"
        params={{ comp: "copa-america", category: board.category }}
        className="mt-3 inline-flex items-center justify-center gap-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] px-3 py-2 text-xs font-bold text-foreground"
      >
        See full ranking →
      </Link>
    </div>
  );
}
