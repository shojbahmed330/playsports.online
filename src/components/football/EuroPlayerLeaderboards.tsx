import { Link } from "@tanstack/react-router";
import { Goal, Users, Award } from "lucide-react";
import { EURO_TOP_SCORERS, EURO_MOST_APPEARANCES, flag, type LeaderRow } from "@/lib/euro-records";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";
import { flagFor } from "@/lib/euro-history";

type Board = {
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  rows: BoardRow[];
  categoryLink: "top-scorers-all-time" | "most-appearances" | "records-and-firsts";
  suffix: string;
};

type BoardRow = {
  rank: number;
  name: string;
  nation: string;
  value: number;
  note?: string;
};

function rowFromLeader(l: LeaderRow): BoardRow {
  return { rank: l.rank, name: l.name, nation: l.nation, value: l.value, note: l.note };
}

function goldenBootRows(): BoardRow[] {
  const rows = (COMPETITION_EDITIONS.euro ?? [])
    .filter((e) => e.topScorer && e.winner !== "TBD")
    .sort((a, b) => b.year - a.year)
    .slice(0, 3)
    .map((e, i) => ({
      rank: i + 1,
      name: e.topScorer!.name,
      nation: e.winner,
      value: e.topScorer!.goals,
      note: `Euro ${e.year}`,
    }));
  return rows;
}

export function EuroPlayerLeaderboards() {
  const boards: Board[] = [
    {
      key: "top-scorers",
      title: "Top scorers · all-time",
      icon: Goal,
      rows: EURO_TOP_SCORERS.slice(0, 3).map(rowFromLeader),
      categoryLink: "top-scorers-all-time",
      suffix: "g",
    },
    {
      key: "most-appearances",
      title: "Most appearances",
      icon: Users,
      rows: EURO_MOST_APPEARANCES.slice(0, 3).map(rowFromLeader),
      categoryLink: "most-appearances",
      suffix: "m",
    },
    {
      key: "golden-boots",
      title: "Golden Boots · recent",
      icon: Award,
      rows: goldenBootRows(),
      categoryLink: "top-scorers-all-time",
      suffix: "g",
    },
  ];

  return (
    <section id="boards" className="mt-8 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
          Leaderboards
        </h2>
      </div>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <ul className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[33.33%] gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {boards.map((b) => (
            <li key={b.key} className="snap-start">
              <MiniBoard board={b} />
            </li>
          ))}
        </ul>
      </div>
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
        {board.rows.map((r) => {
          const anchorId = `player-${r.name.replace(/\s+/g, "-").toLowerCase()}`;
          return (
            <li
              key={`${board.key}-${r.rank}-${r.name}`}
              id={anchorId}
              className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-2 min-w-0"
            >
              <span className="size-6 shrink-0 rounded-full bg-white/5 grid place-items-center text-[11px] font-bold tabular-nums">
                {r.rank}
              </span>
              <span className="text-base shrink-0" aria-hidden>
                {flag(r.nation) || flagFor(r.nation)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold truncate">{r.name}</span>
                {r.note && (
                  <span className="block text-[10px] text-muted-foreground truncate">{r.note}</span>
                )}
              </span>
              <span className="shrink-0 rounded-full bg-emerald-500/15 text-emerald-200 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                {r.value}{board.suffix}
              </span>
            </li>
          );
        })}
      </ol>
      <Link
        to="/football/$comp/records/$category"
        params={{ comp: "euro", category: board.categoryLink }}
        className="mt-3 inline-flex items-center justify-center gap-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] px-3 py-2 text-xs font-bold text-foreground"
      >
        See full ranking →
      </Link>
    </div>
  );
}
