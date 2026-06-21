import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, ShieldCheck, RefreshCw, Loader2, Calendar, BarChart3, Goal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  getWc2026Fixtures,
  getWc2026Standings,
  getWc2026TopScorers,
  clearWc2026Cache,
  type Wc2026Fixture,
} from "@/lib/wc2026.functions";

export const Route = createFileRoute("/worldcup-2026")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup 2026 — Live Fixtures, Standings & Top Scorers" },
      {
        name: "description",
        content:
          "Live FIFA World Cup 2026 fixtures, results, group standings and top scorers. Auto-updated from official data.",
      },
      { property: "og:title", content: "FIFA World Cup 2026 — Live Hub" },
      { property: "og:description", content: "Fixtures, results, standings and scorers for WC 2026 (USA/Canada/Mexico)." },
    ],
  }),
  component: Wc2026Page,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Error loading World Cup 2026</h1>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
});

type Tab = "fixtures" | "standings" | "scorers";

function Wc2026Page() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("fixtures");

  const fixturesFn = useServerFn(getWc2026Fixtures);
  const standingsFn = useServerFn(getWc2026Standings);
  const scorersFn = useServerFn(getWc2026TopScorers);
  const clearFn = useServerFn(clearWc2026Cache);

  const fixturesQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: 60 * 60 * 1000,
  });
  const standingsQ = useQuery({
    queryKey: ["wc2026", "standings"],
    queryFn: () => standingsFn(),
    staleTime: 60 * 60 * 1000,
    enabled: tab === "standings",
  });
  const scorersQ = useQuery({
    queryKey: ["wc2026", "scorers"],
    queryFn: () => scorersFn(),
    staleTime: 60 * 60 * 1000,
    enabled: tab === "scorers",
  });

  const [syncing, setSyncing] = useState(false);
  async function handleSync() {
    setSyncing(true);
    try {
      await clearFn();
      await qc.invalidateQueries({ queryKey: ["wc2026"] });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 grid place-items-center rounded-md bg-gradient-to-br from-amber-600/20 to-amber-400/10 ring-1 ring-amber-500/30">
              <Trophy className="size-5 text-amber-400" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">FIFA World Cup</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400">Archive</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            <Link to="/" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Home</Link>
            <Link to="/players" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Players</Link>
            <span className="px-3 py-1.5 rounded-md text-foreground bg-accent/40">WC 2026</span>
            {isAdmin && (
              <Link to="/admin" className="ml-1 px-3 py-1.5 rounded-md text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* HERO */}
        <section className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">
            🏆 FIFA World Cup 2026
          </h1>
          <p className="text-muted-foreground">
            USA · Canada · Mexico · 48 teams · 104 matches · Live data updated hourly
          </p>
          {isAdmin && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600/20 border border-emerald-500/40 text-emerald-200 text-sm hover:bg-emerald-600/30 disabled:opacity-50"
            >
              {syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              {syncing ? "Syncing…" : "Sync now (clear cache)"}
            </button>
          )}
        </section>

        <AdSlot slot="in_content" className="my-2" />

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-800">
          {[
            { k: "fixtures" as Tab, label: "Fixtures & Results", icon: Calendar },
            { k: "standings" as Tab, label: "Standings", icon: BarChart3 },
            { k: "scorers" as Tab, label: "Top Scorers", icon: Goal },
          ].map(({ k, label, icon: Icon }) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px inline-flex items-center gap-2 transition-colors ${
                tab === k
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>

        {tab === "fixtures" && <FixturesView q={fixturesQ} />}
        {tab === "standings" && <StandingsView q={standingsQ} />}
        {tab === "scorers" && <ScorersView q={scorersQ} />}
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Live data via API-Football (RapidAPI). Cached hourly to stay within free tier limits.
      </footer>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-10 text-center text-muted-foreground">
      <Trophy className="size-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{msg}</p>
      <p className="text-xs mt-2 opacity-70">
        WC 2026 fixtures will appear here as API-Football publishes them (qualifiers ongoing).
      </p>
    </div>
  );
}

function FixturesView({ q }: { q: ReturnType<typeof useQuery<{ fixtures: Wc2026Fixture[]; error: string | null }>> }) {
  if (q.isLoading) return <Loading />;
  if (q.data?.error) return <ErrorBox msg={q.data.error} />;
  const fixtures = q.data?.fixtures ?? [];
  const grouped = useMemo(() => {
    const m = new Map<string, Wc2026Fixture[]>();
    for (const f of fixtures) {
      const key = f.round || "Other";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(f);
    }
    return Array.from(m.entries());
  }, [fixtures]);

  if (fixtures.length === 0) return <EmptyState msg="No fixtures published yet." />;

  return (
    <div className="space-y-6">
      {grouped.map(([round, list]) => (
        <section key={round} className="space-y-3">
          <h2 className="text-lg font-bold text-amber-400">{round}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((f) => <FixtureCard key={f.id} f={f} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function FixtureCard({ f }: { f: Wc2026Fixture }) {
  const isLive = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(f.status);
  const isFinished = ["FT", "AET", "PEN"].includes(f.status);
  const isUpcoming = f.status === "NS" || f.status === "TBD";
  const d = new Date(f.date);
  const dateStr = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeStr = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-amber-500/30 transition-colors">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{dateStr} · {timeStr}</span>
        {isLive && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold animate-pulse">
            🔴 {f.statusLong} {f.elapsed ? `· ${f.elapsed}'` : ""}
          </span>
        )}
        {isFinished && <span className="px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300">{f.status}</span>}
        {isUpcoming && <span className="text-gray-500">Upcoming</span>}
      </div>
      <div className="space-y-2">
        <TeamRow name={f.home.name} logo={f.home.logo} goals={f.home.goals} highlight={isFinished && (f.home.goals ?? 0) > (f.away.goals ?? 0)} />
        <TeamRow name={f.away.name} logo={f.away.logo} goals={f.away.goals} highlight={isFinished && (f.away.goals ?? 0) > (f.home.goals ?? 0)} />
      </div>
      {f.venue && (
        <div className="mt-3 text-[11px] text-muted-foreground border-t border-gray-800 pt-2">
          📍 {f.venue}{f.city ? `, ${f.city}` : ""}
        </div>
      )}
    </div>
  );
}

function TeamRow({ name, logo, goals, highlight }: { name: string; logo: string; goals: number | null; highlight: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${highlight ? "text-white font-bold" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        {logo && <img src={logo} alt="" className="size-6 object-contain" loading="lazy" />}
        <span className="truncate">{name}</span>
      </div>
      <span className="text-xl tabular-nums">{goals ?? "–"}</span>
    </div>
  );
}

function StandingsView({ q }: { q: ReturnType<typeof useQuery<{ standings: any[]; error: string | null }>> }) {
  if (q.isLoading) return <Loading />;
  if (q.data?.error) return <ErrorBox msg={q.data.error} />;
  const rows = q.data?.standings ?? [];
  if (rows.length === 0) return <EmptyState msg="Group standings will appear once the tournament begins." />;
  const byGroup = useMemo(() => {
    const m = new Map<string, typeof rows>();
    for (const r of rows) {
      const k = r.group || "—";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return Array.from(m.entries());
  }, [rows]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {byGroup.map(([group, list]) => (
        <div key={group} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold mb-3 text-amber-400">{group}</h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-gray-800">
              <tr><th className="text-left py-1.5">#</th><th className="text-left">Team</th><th className="text-center">P</th><th className="text-center">W</th><th className="text-center">D</th><th className="text-center">L</th><th className="text-center">GD</th><th className="text-right">Pts</th></tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.team.id} className="border-b border-gray-800/50">
                  <td className="py-1.5 text-muted-foreground">{r.rank}</td>
                  <td className="flex items-center gap-2 py-1.5"><img src={r.team.logo} alt="" className="size-5 object-contain" loading="lazy" /><span className="truncate">{r.team.name}</span></td>
                  <td className="text-center">{r.played}</td><td className="text-center">{r.win}</td><td className="text-center">{r.draw}</td><td className="text-center">{r.lose}</td>
                  <td className="text-center">{r.goalsDiff > 0 ? `+${r.goalsDiff}` : r.goalsDiff}</td>
                  <td className="text-right font-bold text-amber-400">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ScorersView({ q }: { q: ReturnType<typeof useQuery<{ scorers: any[]; error: string | null }>> }) {
  if (q.isLoading) return <Loading />;
  if (q.data?.error) return <ErrorBox msg={q.data.error} />;
  const scorers = q.data?.scorers ?? [];
  if (scorers.length === 0) return <EmptyState msg="Top scorers will be tracked once matches are played." />;
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-gray-900/80 border-b border-gray-800">
          <tr><th className="text-left p-3">Rank</th><th className="text-left p-3">Player</th><th className="text-left p-3">Team</th><th className="text-right p-3">Goals</th><th className="text-right p-3">Assists</th></tr>
        </thead>
        <tbody>
          {scorers.map((s) => (
            <tr key={`${s.rank}-${s.name}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="p-3 text-muted-foreground">#{s.rank}</td>
              <td className="p-3 flex items-center gap-2">
                {s.photo && <img src={s.photo} alt="" className="size-8 rounded-full object-cover" loading="lazy" />}
                <span className="font-medium">{s.name}</span>
              </td>
              <td className="p-3"><div className="flex items-center gap-2"><img src={s.team.logo} alt="" className="size-5 object-contain" loading="lazy" /><span>{s.team.name}</span></div></td>
              <td className="p-3 text-right font-bold text-amber-400 text-base">{s.goals}</td>
              <td className="p-3 text-right text-muted-foreground">{s.assists}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      ⚠️ {msg}
    </div>
  );
}
