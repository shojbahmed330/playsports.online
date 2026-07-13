import { Link } from "@tanstack/react-router";
import { Trophy, Goal, Zap, Sparkles, Star, TrendingUp } from "lucide-react";
import { getCopaEditions } from "@/lib/copa-history";
import { titleCounts } from "@/lib/competition-history";

/** Curated 6-tile Copa record book. */
export function CopaRecordBook() {
  const editions = getCopaEditions();
  const titles = titleCounts("copa-america");
  const topWinner = titles[0];
  const highestScoring = [...editions]
    .filter((e) => typeof e.goals === "number")
    .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))[0];

  const tiles: Tile[] = [
    {
      icon: <Trophy className="size-4" />,
      caption: "Most titles",
      value: `${topWinner?.team ?? "Argentina"} · ${topWinner?.titles ?? 16}`,
      note: "Sole record holder ahead of Uruguay",
      year: topWinner?.years?.[topWinner.years.length - 1] ?? 2024,
      tone: "amber",
    },
    {
      icon: <Goal className="size-4" />,
      caption: "All-time top scorers",
      value: "Méndez · Zizinho · 17",
      note: "1940s–50s icons — record still stands",
      tone: "emerald",
    },
    {
      icon: <Star className="size-4" />,
      caption: "Most appearances",
      value: "Messi · 39",
      note: "Argentina · 2007–2024",
      year: 2024,
      tone: "indigo",
    },
    {
      icon: <Zap className="size-4" />,
      caption: "Most goals · single Copa",
      value: "Jair / Maschio · 9",
      note: "1949 · 1957 — the 9-goal club",
      tone: "sky",
    },
    {
      icon: <TrendingUp className="size-4" />,
      caption: "Highest-scoring edition",
      value: highestScoring ? `${highestScoring.year} · ${highestScoring.goals}g` : "2021 · 65g",
      note: highestScoring ? `${highestScoring.matches ?? "?"} matches` : "",
      year: highestScoring?.year,
      tone: "rose",
    },
    {
      icon: <Sparkles className="size-4" />,
      caption: "Perfect run",
      value: "Colombia 2001",
      note: "Champions unbeaten & unscored-upon",
      year: 2001,
      tone: "amber",
    },
  ];

  return (
    <section className="mt-10 scroll-mt-32" id="record-book">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
          Record book
        </h2>
        <Link
          to="/football/$comp/records"
          params={{ comp: "copa-america" }}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          All records →
        </Link>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {tiles.map((t, i) => (
          <RecordTile key={i} tile={t} />
        ))}
      </ul>
    </section>
  );
}

type Tone = "amber" | "emerald" | "sky" | "rose" | "indigo";
type Tile = { icon: React.ReactNode; caption: string; value: string; note?: string; year?: number; tone: Tone };

function RecordTile({ tile }: { tile: Tile }) {
  const toneCls =
    tile.tone === "amber" ? "text-amber-300"
    : tile.tone === "emerald" ? "text-emerald-300"
    : tile.tone === "sky" ? "text-sky-300"
    : tile.tone === "rose" ? "text-rose-300"
    : "text-indigo-300";

  const body = (
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25 transition p-3 sm:p-4 min-w-0">
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${toneCls}`}>
        {tile.icon} <span className="truncate">{tile.caption}</span>
      </div>
      <div className="mt-1.5 text-sm sm:text-lg font-black text-foreground truncate">{tile.value}</div>
      {tile.note && <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{tile.note}</div>}
    </div>
  );

  return (
    <li>
      {tile.year ? (
        <Link to="/football/$comp/history/$year" params={{ comp: "copa-america", year: String(tile.year) }}>
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
