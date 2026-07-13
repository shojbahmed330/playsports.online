import { Link } from "@tanstack/react-router";
import { Trophy, Goal, Zap, Sparkles, Star, TrendingUp } from "lucide-react";
import { euroEditions } from "@/lib/euro-history";
import { titleCounts } from "@/lib/competition-history";

/**
 * Curated 6-tile record book: single-source-of-truth for "did you know"
 * facts across every Euro. Each tile deep-links to the source edition.
 */
export function EuroRecordBook() {
  const editions = euroEditions();
  const titles = titleCounts("euro");
  const topWinner = titles[0];
  const highestScoring = [...editions]
    .filter((e) => typeof e.goals === "number")
    .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))[0];

  const tiles: Tile[] = [
    {
      icon: <Trophy className="size-4" />,
      caption: "Most titles",
      value: `${topWinner?.team ?? "—"} · ${topWinner?.titles ?? 0}`,
      note: topWinner?.years.join(", ") ?? "",
      year: topWinner?.years?.[topWinner.years.length - 1],
      tone: "amber",
    },
    {
      icon: <Goal className="size-4" />,
      caption: "Most goals · single Euro",
      value: "Platini · 9",
      note: "France 1984 · 5 games",
      year: 1984,
      tone: "emerald",
    },
    {
      icon: <Zap className="size-4" />,
      caption: "Biggest final win",
      value: "Spain 4–0 Italy",
      note: "Kyiv · Euro 2012",
      year: 2012,
      tone: "sky",
    },
    {
      icon: <TrendingUp className="size-4" />,
      caption: "Highest-scoring edition",
      value: highestScoring ? `${highestScoring.year} · ${highestScoring.goals}g` : "—",
      note: highestScoring ? `${highestScoring.matches ?? "?"} matches` : "",
      year: highestScoring?.year,
      tone: "rose",
    },
    {
      icon: <Star className="size-4" />,
      caption: "Youngest breakout",
      value: "Yamal · 16y 362d",
      note: "Euro 2024 Young Player",
      year: 2024,
      tone: "indigo",
    },
    {
      icon: <Sparkles className="size-4" />,
      caption: "Greatest upset",
      value: "Greece 1–0 Portugal",
      note: "Lisbon final · Euro 2004",
      year: 2004,
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
          params={{ comp: "euro" }}
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
type Tile = {
  icon: React.ReactNode;
  caption: string;
  value: string;
  note?: string;
  year?: number;
  tone: Tone;
};

function RecordTile({ tile }: { tile: Tile }) {
  const toneCls =
    tile.tone === "amber"
      ? "text-amber-300"
      : tile.tone === "emerald"
      ? "text-emerald-300"
      : tile.tone === "sky"
      ? "text-sky-300"
      : tile.tone === "rose"
      ? "text-rose-300"
      : "text-indigo-300";

  const body = (
    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25 transition p-3 sm:p-4 min-w-0">
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${toneCls}`}>
        {tile.icon} <span className="truncate">{tile.caption}</span>
      </div>
      <div className="mt-1.5 text-sm sm:text-lg font-black text-foreground truncate">
        {tile.value}
      </div>
      {tile.note && (
        <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{tile.note}</div>
      )}
    </div>
  );

  return (
    <li>
      {tile.year ? (
        <Link to="/football/$comp/history/$year" params={{ comp: "euro", year: String(tile.year) }}>
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
