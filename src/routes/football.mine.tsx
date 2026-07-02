import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star, ChevronLeft, Calendar, Loader2 } from "lucide-react";
import { useMyTeams } from "@/lib/football-filters";
import { useMatchReminders } from "@/hooks/use-match-reminders";
import { getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { formatLocalTime } from "@/lib/time";

export const Route = createFileRoute("/football/mine")({
  head: () => ({
    meta: [
      { title: "My Football — Starred Teams & Reminders" },
      { name: "description", content: "Your personalized football feed: starred teams' next fixtures, recent results, and active reminders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinePage,
});

function MinePage() {
  const { teams, toggle } = useMyTeams();
  const { items: reminders, remove } = useMatchReminders();
  const fixturesFn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: 60_000,
  });
  const fixtures = q.data?.fixtures ?? [];
  const set = new Set(teams.map((t) => t.toLowerCase()));
  const mine = fixtures.filter(
    (f) => set.has(f.home.name.toLowerCase()) || set.has(f.away.name.toLowerCase()),
  );
  const upcoming = mine.filter((f) => f.status === "notstarted").sort((a, b) => a.startTs - b.startTs);
  const recent = mine.filter((f) => f.status === "finished").sort((a, b) => b.startTs - a.startTs).slice(0, 6);
  const live = mine.filter((f) => f.status === "inprogress");

  return (
    <div className="min-h-dvh bg-black text-foreground pb-20">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center gap-2">
          <Link to="/football" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white">
            <ChevronLeft className="size-4" /> Football
          </Link>
          <h1 className="flex-1 text-center text-sm font-bold text-white">
            <Star className="inline size-4 text-amber-300 mr-1 -mt-0.5" />
            My Football
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-gray-500">2026</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {q.isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="size-4 animate-spin mr-2" /> Loading…
          </div>
        )}

        {teams.length === 0 && !q.isLoading && (
          <EmptyState />
        )}

        {teams.length > 0 && (
          <>
            <Section title="Starred teams">
              <div className="flex flex-wrap gap-2">
                {teams.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggle(t)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 text-xs font-bold px-3 py-1.5"
                    aria-label={`Unstar ${t}`}
                  >
                    <span className="text-base leading-none">{flagOf(t)}</span> {t}
                    <Star className="size-3 fill-amber-300 text-amber-300" />
                  </button>
                ))}
              </div>
            </Section>

            {live.length > 0 && (
              <Section title="Live now" tone="red">
                <MatchList list={live} />
              </Section>
            )}
            {upcoming.length > 0 && (
              <Section title="Upcoming">
                <MatchList list={upcoming.slice(0, 8)} />
              </Section>
            )}
            {recent.length > 0 && (
              <Section title="Recent results">
                <MatchList list={recent} />
              </Section>
            )}
            {live.length === 0 && upcoming.length === 0 && recent.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-gray-900/50 p-6 text-center text-sm text-gray-400">
                No fixtures for your starred teams yet.
              </div>
            )}
          </>
        )}

        {reminders.length > 0 && (
          <Section title={`Reminders (${reminders.length})`}>
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.matchId} className="flex items-center justify-between rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs">
                  <Link to="/football/match/$id" params={{ id: String(r.matchId) }} className="flex-1 min-w-0 truncate text-white font-semibold hover:text-amber-300">
                    {r.title}
                  </Link>
                  <span className="text-gray-500 shrink-0 tabular-nums mx-3">
                    {formatLocalTime(r.startMs)}
                  </span>
                  <button onClick={() => remove(r.matchId)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-300">
                    Clear
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8 text-center">
      <Star className="mx-auto size-10 text-amber-300 mb-3" />
      <h2 className="text-lg font-bold text-white mb-1">No starred teams yet</h2>
      <p className="text-sm text-gray-400 mb-4">
        Tap the ⭐ on any team in the fixture list to build your personal feed.
      </p>
      <Link
        to="/football"
        search={(p: Record<string, unknown>) => ({ ...p, tab: "groups" })}
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-black font-bold text-xs px-4 py-2 hover:bg-amber-400"
      >
        Browse teams
      </Link>
    </div>
  );
}

function Section({ title, tone = "default", children }: { title: string; tone?: "default" | "red"; children: React.ReactNode }) {
  return (
    <section>
      <div className={`mb-2 text-[11px] font-bold uppercase tracking-[0.18em] ${tone === "red" ? "text-red-300" : "text-gray-400"}`}>
        {title}
      </div>
      {children}
    </section>
  );
}

function MatchList({ list }: { list: Wc2026Fixture[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {list.map((f) => (
        <Link
          key={f.id}
          to="/football/match/$id"
          params={{ id: String(f.id) }}
          className="rounded-xl border border-white/10 bg-black/30 p-3 hover:border-amber-500/40 hover:-translate-y-0.5 transition"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-300/80 truncate">{f.group}</span>
            <span className="text-[10px] font-bold text-gray-400">
              {f.status === "inprogress" ? (f.minute ? `${f.minute}'` : "LIVE") : f.status === "finished" ? "FT" : (<><Calendar className="inline size-2.5 mr-0.5" />{formatLocalTime(f.startTs * 1000)}</>)}
            </span>
          </div>
          <Row name={f.home.name} score={f.home.goals} />
          <Row name={f.away.name} score={f.away.goals} />
        </Link>
      ))}
    </div>
  );
}

function Row({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-base leading-none">{flagOf(name)}</span>
      <span className="flex-1 truncate text-xs font-semibold text-gray-200">{name}</span>
      <span className="text-xs font-black tabular-nums text-white">{score ?? "-"}</span>
    </div>
  );
}
