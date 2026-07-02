import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { Search, Trophy } from "lucide-react";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import records from "@/data/cricket/ipl/records.json";
import { getIplLeaders, IPL_SEASON_IDS } from "@/lib/ipl.functions";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";


type Record = {
  label: string;
  value: string;
  context?: string;
  player?: string;
  team?: string;
};

const SECTIONS: { key: keyof typeof records; title: string; emoji: string; accent: string }[] = [
  { key: "batting",      title: "Batting Records",      emoji: "🏏", accent: "from-amber-500 to-orange-500" },
  { key: "bowling",      title: "Bowling Records",      emoji: "🎯", accent: "from-violet-500 to-purple-600" },
  { key: "partnerships", title: "Partnerships",         emoji: "🤝", accent: "from-pink-500 to-rose-500" },
  { key: "captaincy",    title: "Captaincy",            emoji: "👑", accent: "from-yellow-500 to-amber-600" },
  { key: "team",         title: "Team Records",         emoji: "🛡️", accent: "from-sky-500 to-blue-600" },
  { key: "fielding",     title: "Fielding & MVP",       emoji: "🧤", accent: "from-emerald-500 to-teal-500" },
];

type SortMode = "default" | "team" | "az";

export const Route = createFileRoute("/cricket/ipl/records")({
  head: () => ({
    meta: [
      { title: "IPL Records — Batting, Bowling, Team & Fielding" },
      { name: "description", content: "All-time IPL records: most runs, fastest century, best bowling, highest team total, most catches and more." },
      { property: "og:title", content: "IPL Records" },
      { property: "og:description", content: "Every key IPL record — batting, bowling, team and fielding." },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/records" },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/records" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }, { name: "IPL", path: "/cricket/ipl" }, { name: "Records", path: "/cricket/ipl/records" }]))],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<SortMode>("default");

  const visibleSections = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SECTIONS
      .filter((s) => cat === "all" || cat === s.key)
      .map((sec) => {
        let list = ((records[sec.key] as Record[]) ?? []).filter((r) =>
          !needle ||
          [r.label, r.player, r.team, r.value, r.context].some((v) => v?.toLowerCase().includes(needle)),
        );
        if (sort === "team") {
          list = [...list].sort((a, b) => (a.team ?? "z").localeCompare(b.team ?? "z"));
        } else if (sort === "az") {
          list = [...list].sort((a, b) => (a.player ?? a.team ?? "").localeCompare(b.player ?? b.team ?? ""));
        }
        return { sec, list };
      })
      .filter((x) => x.list.length > 0);
  }, [q, cat, sort]);

  return (
    <IplPageShell title="IPL All-Time Records" subtitle="Career and innings milestones across every season">
      <SeasonLeadersPanel />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player, team, record…"
            className="w-full rounded-lg border border-white/10 bg-gray-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="rounded-lg border border-white/10 bg-gray-900/60 px-3 py-2 text-xs font-semibold text-white focus:border-amber-400/40 focus:outline-none"
        >
          <option value="default">Sort: Featured</option>
          <option value="team">Sort: Team</option>
          <option value="az">Sort: A–Z</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {[{ key: "all", title: "All" }, ...SECTIONS].map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setCat(s.key)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
              cat === s.key ? "bg-amber-400 text-gray-950" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {visibleSections.length === 0 && (
        <p className="rounded-lg border border-white/5 bg-gray-900/40 p-6 text-center text-sm text-white/50">No records match your search.</p>
      )}

      <div className="grid gap-6">
        {visibleSections.map(({ sec, list }) => {
          return (
            <section key={sec.key}>
              <div className="mb-3 flex items-baseline gap-2 px-1">
                <span aria-hidden className="text-base">{sec.emoji}</span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">{sec.title}</h2>
                <span className={`ml-1 rounded-full bg-gradient-to-r ${sec.accent} px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white`}>IPL</span>
                <span className="ml-auto text-[10px] font-bold text-white/35">{list.length}</span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {list.map((r, i) => (
                  <li
                    key={`${sec.key}-${i}`}
                    className="rounded-xl border border-white/5 bg-gray-900/60 px-4 py-3 transition hover:-translate-y-0.5 hover:border-white/15"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{r.label}</div>
                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        {r.player ? (
                          <PlayerLink name={r.player} className="truncate text-sm font-bold text-white block">{r.player}</PlayerLink>
                        ) : (
                          <div className="truncate text-sm font-bold text-white">{r.team}</div>
                        )}
                        {r.player && r.team && <div className="truncate text-[11px] text-white/55">{r.team}</div>}
                      </div>

                      <div className="shrink-0 text-lg font-black text-amber-300">{r.value}</div>
                    </div>
                    {r.context && <div className="mt-1 truncate text-[11px] text-white/45">{r.context}</div>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-6 px-1 text-[11px] text-white/40">
        All-time records reflect publicly published IPL data through the most recent completed season. Season leaders above are derived live from per-match scorecards.
      </p>
    </IplPageShell>
  );
}

// ─── Live per-season leaders ──────────────────────────────
type Metric = "runs" | "wickets" | "sixes";
const METRICS: { id: Metric; label: string; accent: string }[] = [
  { id: "runs", label: "Orange Cap (Runs)", accent: "from-amber-500 to-orange-500" },
  { id: "wickets", label: "Purple Cap (Wickets)", accent: "from-violet-500 to-purple-600" },
  { id: "sixes", label: "Most Sixes", accent: "from-emerald-500 to-teal-500" },
];

function SeasonLeadersPanel() {
  const years = IPL_SEASON_IDS.map((s) => s.year);
  const [year, setYear] = useState<number | "current">("current");
  const [metric, setMetric] = useState<Metric>("runs");

  const q = useQuery(
    queryOptions({
      queryKey: ["ipl", "leaders", year, metric],
      queryFn: () => getIplLeaders({ data: { year, metric } }),
      staleTime: 5 * 60_000,
    }),
  );
  const leaders = q.data?.leaders?.slice(0, 10) ?? [];
  const accent = METRICS.find((m) => m.id === metric)!.accent;

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/40 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Trophy className="size-4 text-amber-300" />
        <h2 className="text-sm font-black uppercase tracking-widest text-white">Season Leaders</h2>
        <span className={`rounded-full bg-gradient-to-r ${accent} px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white`}>Live</span>
        <div className="ml-auto flex gap-1.5">
          <select
            value={String(year)}
            onChange={(e) => setYear(e.target.value === "current" ? "current" : Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-gray-950/70 px-2 py-1 text-[11px] font-bold text-white focus:outline-none"
          >
            {years.map((y) => (
              <option key={String(y)} value={String(y)}>
                {y === "current" ? "Current" : y}
              </option>
            ))}
          </select>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
            className="rounded-lg border border-white/10 bg-gray-950/70 px-2 py-1 text-[11px] font-bold text-white focus:outline-none"
          >
            {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {q.isLoading ? (
        <div className="py-6 text-center text-xs text-white/50">Crunching scorecards…</div>
      ) : leaders.length === 0 ? (
        <div className="py-6 text-center text-xs text-white/50">No data for this season yet.</div>
      ) : (
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {leaders.map((l, i) => (
            <li key={l.athleteId} className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/5">
              <span className="w-6 shrink-0 text-center text-xs font-black text-white/55">{i + 1}</span>
              {l.headshot ? (
                <img src={l.headshot} alt="" className="size-8 shrink-0 rounded-full object-cover ring-1 ring-white/10" loading="lazy" />
              ) : (
                <div className="size-8 shrink-0 rounded-full bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <PlayerLink name={l.athleteName} athleteId={l.athleteId} className="truncate text-sm font-bold text-white block">{l.athleteName}</PlayerLink>
                <div className="truncate text-[10px] uppercase tracking-wider text-white/50">{l.teamAbbr || l.teamName}</div>
              </div>

              <span className="shrink-0 font-black tabular-nums text-amber-300">{l.displayValue}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}


