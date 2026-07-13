import { Link } from "@tanstack/react-router";
import type { MlbPostseasonSeries, MlbPostseasonGame } from "@/lib/mlb.functions";

const ROUND_ORDER: MlbPostseasonSeries["round"][] = [
  "Wild Card",
  "Division Series",
  "League Championship",
  "World Series",
  "Other",
];

export function MlbPostseasonBracket({ series }: { series: MlbPostseasonSeries[] }) {
  if (!series.length) {
    return (
      <div className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground">
        No postseason games for this year yet.
      </div>
    );
  }

  const byRound = new Map<string, MlbPostseasonSeries[]>();
  for (const s of series) {
    const arr = byRound.get(s.round) ?? [];
    arr.push(s);
    byRound.set(s.round, arr);
  }

  return (
    <div className="space-y-8">
      {ROUND_ORDER.filter((r) => byRound.has(r)).map((round) => (
        <section key={round}>
          <h2 className="text-xs uppercase tracking-[0.25em] font-bold text-[#f7e6c4] mb-3">
            {round}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(byRound.get(round) ?? []).map((s) => (
              <SeriesCard key={s.key} series={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SeriesCard({ series }: { series: MlbPostseasonSeries }) {
  const aLed = series.teamA.wins > series.teamB.wins;
  const bLed = series.teamB.wins > series.teamA.wins;
  return (
    <article className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
      <header className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-[#002d72]/30 to-[#d50032]/20">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          {series.league} · {series.round}
        </div>
        <div className="text-sm font-bold text-white truncate mt-0.5">{series.title}</div>
      </header>

      <div className="px-4 py-3 space-y-2">
        <TeamRow t={series.teamA} oppWins={series.teamB.wins} led={aLed} />
        <TeamRow t={series.teamB} oppWins={series.teamA.wins} led={bLed} />
      </div>

      {series.summary && (
        <div className="px-4 pb-2 text-[11px] font-bold text-[#f7e6c4]">{series.summary}</div>
      )}

      <details className="border-t border-border">
        <summary className="px-4 py-2 text-[11px] font-bold text-muted-foreground hover:text-white cursor-pointer select-none">
          {series.games.length} game{series.games.length === 1 ? "" : "s"} ▾
        </summary>
        <ul className="divide-y divide-border">
          {series.games.map((g, i) => (
            <GameRow key={g.id} g={g} index={i + 1} />
          ))}
        </ul>
      </details>
    </article>
  );
}

function TeamRow({
  t,
  oppWins,
  led,
}: {
  t: MlbPostseasonSeries["teamA"];
  oppWins: number;
  led: boolean;
}) {
  const eliminated = oppWins >= 4 || (oppWins > t.wins && t.wins + oppWins >= 5);
  return (
    <div
      className={[
        "flex items-center gap-3 px-2 py-1.5 rounded-lg",
        led ? "bg-emerald-500/10 ring-1 ring-emerald-500/30" : "bg-white/[0.02]",
      ].join(" ")}
    >
      {t.logo ? (
        <img src={t.logo} alt={t.abbr} className="size-7 object-contain" loading="lazy" / decoding="async">
      ) : (
        <div className="size-7 rounded bg-muted text-[10px] font-bold grid place-items-center">
          {t.abbr || "?"}
        </div>
      )}
      <Link
        to="/mlb/team/$id"
        params={{ id: t.id }}
        className={[
          "flex-1 text-sm font-semibold truncate hover:underline",
          eliminated ? "text-muted-foreground line-through" : "text-white",
        ].join(" ")}
      >
        {t.name || t.abbr}
      </Link>
      <span className="text-lg font-extrabold tabular-nums text-white w-6 text-right">{t.wins}</span>
    </div>
  );
}

function GameRow({ g, index }: { g: MlbPostseasonGame; index: number }) {
  const dt = g.startTs ? new Date(g.startTs) : null;
  return (
    <li className="px-4 py-2 flex items-center gap-3 text-xs">
      <span className="w-10 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
        G{index}
      </span>
      <span className="w-20 text-muted-foreground tabular-nums">
        {dt ? dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
      </span>
      <span className="flex-1 truncate text-gray-200">
        {g.away.abbr} {g.away.score ?? "—"} @ {g.home.abbr} {g.home.score ?? "—"}
      </span>
      <Link
        to="/mlb/game/$id"
        params={{ id: g.id }}
        className={[
          "px-2 py-0.5 rounded-full text-[10px] font-bold ring-1",
          g.status === "in"
            ? "bg-red-500/20 ring-red-500/40 text-red-300 animate-pulse"
            : g.status === "post"
            ? "bg-white/5 ring-white/10 text-gray-300"
            : "bg-white/5 ring-white/10 text-muted-foreground",
        ].join(" ")}
      >
        {g.status === "post" ? "Final" : g.status === "in" ? "Live" : g.statusDetail || "Sched"}
      </Link>
    </li>
  );
}
