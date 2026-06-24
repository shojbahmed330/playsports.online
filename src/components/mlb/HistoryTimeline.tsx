import historyData from "@/data/mlb/history.json";

type WS = { year: number; champion: string; runnerUp: string; result: string; mvp: string };
type Award = { year: number; player: string; team: string };
type Leader = { rank: number; player: string; value: string };

const data = historyData as {
  worldSeries: WS[];
  mvp: { AL: Award[]; NL: Award[] };
  cyYoung: { AL: Award[]; NL: Award[] };
  rookieOfYear: { AL: Award[]; NL: Award[] };
  allTimeLeaders: Record<string, Leader[]>;
};

export function HistoryTimeline() {
  return (
    <div className="space-y-10">
      <section>
        <SectionHeader title="World Series Champions" subtitle="Recent 30 years" emoji="🏆" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {data.worldSeries.map((w) => (
            <article
              key={w.year}
              className="relative rounded-2xl bg-card ring-1 ring-border p-4 overflow-hidden hover:ring-[#d50032]/40 transition-all"
            >
              <div aria-hidden className="absolute -right-6 -top-6 text-7xl font-black text-white/[0.04] select-none">
                {w.year}
              </div>
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#f7e6c4] font-bold">{w.year}</div>
                <div className="text-lg font-extrabold text-white">{w.champion}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  defeated <span className="text-gray-300">{w.runnerUp}</span> · {w.result}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-[11px]">
                  <span className="text-muted-foreground">MVP · </span>
                  <span className="font-semibold text-white">{w.mvp}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AwardSection title="Most Valuable Player" emoji="⭐" al={data.mvp.AL} nl={data.mvp.NL} />
      <AwardSection title="Cy Young Award" emoji="🥎" al={data.cyYoung.AL} nl={data.cyYoung.NL} />
      <AwardSection title="Rookie of the Year" emoji="🌱" al={data.rookieOfYear.AL} nl={data.rookieOfYear.NL} />

      <section>
        <SectionHeader title="All-Time Leaders" subtitle="Career records" emoji="📊" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <LeaderCard title="Home Runs" rows={data.allTimeLeaders.homeRuns} />
          <LeaderCard title="Hits" rows={data.allTimeLeaders.hits} />
          <LeaderCard title="Batting Average" rows={data.allTimeLeaders.battingAverage} />
          <LeaderCard title="Wins" rows={data.allTimeLeaders.wins} />
          <LeaderCard title="Strikeouts (P)" rows={data.allTimeLeaders.strikeouts} />
          <LeaderCard title="Saves" rows={data.allTimeLeaders.saves} />
          <LeaderCard title="ERA (min. 1000 IP)" rows={data.allTimeLeaders.era} />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, emoji }: { title: string; subtitle?: string; emoji: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <span aria-hidden>{emoji}</span> {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function AwardSection({ title, emoji, al, nl }: { title: string; emoji: string; al: Award[]; nl: Award[] }) {
  return (
    <section>
      <SectionHeader title={title} emoji={emoji} subtitle="American League · National League" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <AwardTable league="AL" rows={al} />
        <AwardTable league="NL" rows={nl} />
      </div>
    </section>
  );
}

function AwardTable({ league, rows }: { league: "AL" | "NL"; rows: Award[] }) {
  const isAL = league === "AL";
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      <div className={`px-4 py-2.5 border-b border-border text-[11px] uppercase tracking-[0.2em] font-bold ${isAL ? "bg-[#002d72]/30 text-sky-200" : "bg-[#8c0020]/30 text-red-200"}`}>
        {isAL ? "American League" : "National League"}
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={`${league}-${r.year}`} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="w-12 text-xs font-bold tabular-nums text-muted-foreground">{r.year}</span>
            <span className="flex-1 font-semibold text-white truncate">{r.player}</span>
            <span className="text-[10px] font-bold text-[#f7e6c4]/80 tabular-nums">{r.team}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeaderCard({ title, rows }: { title: string; rows: Leader[] }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-[#002d72]/30 to-transparent">
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={`${title}-${r.rank}`} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className="w-5 text-center text-xs font-bold tabular-nums text-muted-foreground">{r.rank}</span>
            <span className="flex-1 font-semibold text-white truncate">{r.player}</span>
            <span className="font-extrabold tabular-nums text-[#f7e6c4]">{r.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
