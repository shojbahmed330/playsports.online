import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Award, Target } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import history from "@/data/cricket/history.json";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";


type Champ = { year: number; champion: string; runnerUp: string; host?: string; venue?: string; result?: string };
type Stat = { player: string; country: string; matches: number; runs?: number; wickets?: number; avg: number; hundreds?: number };
type Tournament = {
  label: string;
  format: string;
  emoji: string;
  champions: Champ[];
  topRuns: Stat[];
  topWickets: Stat[];
};

const DATA = history as Record<string, Tournament>;
const SLUGS = Object.keys(DATA);

export const Route = createFileRoute("/cricket/history")({
  head: () => ({
    meta: [
      { title: "Cricket History & Records — World Cup, IPL, BBL, PSL" },
      { name: "description", content: "Champions, runs and wickets records for the ICC World Cup, T20 World Cup, IPL, BBL and PSL — full hall of fame." },
      { property: "og:title", content: "Cricket History & Records" },
      { property: "og:description", content: "Champions and records across the ICC World Cup, IPL, BBL and PSL." },
      { property: "og:url", content: "https://www.playsports.online/cricket/history" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cricket History & Records — World Cup, IPL, BBL, PSL" },
      { name: "twitter:description", content: "Champions, runs and wickets records for the ICC World Cup, T20 World Cup, IPL, BBL and PSL — full hall of fame." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/history" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }, { name: "History", path: "/cricket/history" }]))],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [active, setActive] = useState<string>(SLUGS[0]);
  const t = DATA[active];

  const lastChamp = useMemo(() => {
    const sorted = [...t.champions].sort((a, b) => b.year - a.year);
    return sorted[0];
  }, [t]);

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      {/* Tournament selector — horizontal snap rail */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {SLUGS.map((s) => {
              const x = DATA[s];
              const on = active === s;
              return (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={[
                    "snap-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition-all",
                    on
                      ? "bg-gradient-to-r from-emerald-500 to-amber-500 text-black ring-amber-300"
                      : "bg-white/[0.04] hover:bg-white/[0.09] ring-white/10 text-gray-200",
                  ].join(" ")}
                >
                  <span aria-hidden>{x.emoji}</span>
                  {x.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 p-5 sm:p-8">
          <div className="flex items-start gap-3 mb-3">
            <div className="size-12 sm:size-14 rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/40 grid place-items-center text-2xl shrink-0">
              {t.emoji}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-300">{t.format} Championship</div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{t.label}</h1>
              <p className="text-sm text-emerald-100/80 mt-1">{t.champions.length} editions · {new Set(t.champions.map((c) => c.champion)).size} different winners</p>
            </div>
          </div>
          {lastChamp && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <Mini icon={<Trophy className="size-4 text-amber-300" />} label="Reigning champion" value={lastChamp.champion} sub={`Won ${lastChamp.year}`} />
              <Mini icon={<Award className="size-4 text-sky-300" />} label="Most recent runner-up" value={lastChamp.runnerUp} sub={lastChamp.venue ?? "—"} />
              <Mini icon={<Target className="size-4 text-emerald-300" />} label="Editions held" value={String(t.champions.length)} sub={`${t.champions[0].year} → ${lastChamp.year}`} />
            </div>
          )}
        </section>

        {/* Champions */}
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Trophy className="size-5 text-amber-400" /> All-time champions</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-12 text-[10px] uppercase tracking-widest text-muted-foreground bg-gray-900/60 px-3 py-2">
              <div className="col-span-2">Year</div>
              <div className="col-span-5">Champion</div>
              <div className="col-span-5">Runner-up · Result</div>
            </div>
            <div className="divide-y divide-border">
              {[...t.champions].sort((a, b) => b.year - a.year).map((c) => (
                <div key={c.year} className="grid grid-cols-12 px-3 py-2.5 text-sm hover:bg-accent/30">
                  <div className="col-span-2 font-bold tabular-nums text-amber-300">{c.year}</div>
                  <div className="col-span-5 font-semibold">{c.champion}</div>
                  <div className="col-span-5 text-muted-foreground">
                    <span className="text-foreground/80">{c.runnerUp}</span>
                    {c.result && <span className="text-[11px] ml-2 opacity-70">· {c.result}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaders */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Leaderboard title="Most runs" data={t.topRuns} kind="runs" />
          <Leaderboard title="Most wickets" data={t.topWickets} kind="wickets" />
        </section>

        <p className="text-center text-[11px] text-muted-foreground">
          Records are compiled from public archives and updated each season. <Link to="/cricket" className="text-emerald-400 hover:underline">Back to live scores →</Link>
        </p>
      </main>
    </div>
  );
}

function Mini({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400">
        {icon} {label}
      </div>
      <div className="text-lg font-bold mt-1 truncate">{value}</div>
      <div className="text-[11px] text-gray-500">{sub}</div>
    </div>
  );
}

function Leaderboard({ title, data, kind }: { title: string; data: Stat[]; kind: "runs" | "wickets" }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card/40">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-500/10 to-amber-500/5">
        <h3 className="text-sm font-bold inline-flex items-center gap-1.5">
          {kind === "runs" ? <Target className="size-4 text-emerald-400" /> : <Award className="size-4 text-amber-400" />}
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {data.map((p, i) => (
          <div key={p.player} className="px-3 py-2.5 flex items-center gap-3 text-sm">
            <div className={`size-7 rounded-full grid place-items-center text-[11px] font-bold shrink-0 ${
              i === 0 ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40" :
              i === 1 ? "bg-zinc-400/20 text-zinc-200 ring-1 ring-zinc-400/40" :
              i === 2 ? "bg-orange-700/20 text-orange-300 ring-1 ring-orange-700/40" :
              "bg-gray-800 text-gray-400"
            }`}>{i + 1}</div>
            <div className="flex-1 min-w-0">
              <PlayerLink name={p.player} className="font-semibold truncate block">{p.player}</PlayerLink>
              <div className="text-[11px] text-muted-foreground truncate">{p.country} · {p.matches} matches · avg {p.avg}</div>
            </div>
            <div className="text-right tabular-nums shrink-0">
              <div className="text-base font-extrabold">{kind === "runs" ? p.runs : p.wickets}</div>
              {kind === "runs" && p.hundreds != null && (
                <div className="text-[10px] text-muted-foreground">{p.hundreds} × 100</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
