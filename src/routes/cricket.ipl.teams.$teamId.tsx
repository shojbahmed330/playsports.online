import { useMemo, useState } from "react";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { MapPin, Crown, Calendar } from "lucide-react";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { CricketPlayerSheet } from "@/components/cricket/CricketPlayerSheet";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import { toCricketMatch } from "@/components/ipl/toCricketMatch";

import { getIplTeam, getIplTeamSquad, IPL_SEASON_IDS } from "@/lib/ipl.functions";
import history from "@/data/cricket/ipl/history.json";
import captainsData from "@/data/cricket/ipl/captains.json";

type SeasonYear = number | "current";

const qo = (teamId: string, year: SeasonYear) =>
  queryOptions({
    queryKey: ["ipl", "team", teamId, year],
    queryFn: () => getIplTeam({ data: { teamId, year } }),
    staleTime: 60_000,
  });

const squadQo = (teamId: string, year: SeasonYear) =>
  queryOptions({
    queryKey: ["ipl", "team", teamId, "squad", year],
    queryFn: () => getIplTeamSquad({ data: { teamId, year } }),
    staleTime: 5 * 60_000,
  });


export const Route = createFileRoute("/cricket/ipl/teams/$teamId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(qo(params.teamId, "current"));
    if (!data.team) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.team
      ? [
          { title: `${loaderData.team.name} — IPL Franchise` },
          { name: "description", content: `${loaderData.team.name} squad, fixtures, titles and franchise stats.` },
          { property: "og:title", content: `${loaderData.team.name} — IPL` },
          { property: "og:image", content: loaderData.team.logo },
        ]
      : [{ title: "IPL Team" }],
  }),
  notFoundComponent: () => (
    <IplPageShell title="Team not found">
      <p className="text-white/60">That franchise does not exist. <Link to="/cricket/ipl/teams" className="underline">Back to teams</Link>.</p>
    </IplPageShell>
  ),
  errorComponent: ({ error }) => (
    <IplPageShell title="Could not load team">
      <p className="text-rose-300">{error.message}</p>
    </IplPageShell>
  ),
  component: TeamPage,
});

function TeamPage() {
  const { teamId } = Route.useParams();
  const [seasonYear, setSeasonYear] = useState<SeasonYear>("current");
  const { data } = useSuspenseQuery(qo(teamId, seasonYear));
  const squadQ = useQuery(squadQo(teamId, seasonYear));
  const t = data.team!;
  const [activeAthlete, setActiveAthlete] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "squad" | "fixtures" | "h2h" | "titles">("overview");
  const captainTimeline = (captainsData as Record<string, Array<{ name: string; years: string; titles: number }>>)[teamId] ?? [];
  const titleSeasons = (history as Array<{ year: number; championId: string | null; mom: string }>)
    .filter((s) => s.championId === t.id)
    .sort((a, b) => b.year - a.year);

  // Head-to-head this season: aggregate W / L / NR against each opponent
  // by walking finished fixtures.
  const h2h = useMemo(() => {
    const map = new Map<string, { id: string; name: string; abbr: string; logo: string | null; color: string | null; w: number; l: number; nr: number; last: typeof data.fixtures[number] | null }>();
    for (const m of data.fixtures) {
      const us = m.home.id === t.espnId ? m.home : m.away;
      const them = m.home.id === t.espnId ? m.away : m.home;
      if (!them.id) continue;
      let row = map.get(them.id);
      if (!row) {
        row = { id: them.id, name: them.name, abbr: them.abbr, logo: them.logo, color: them.color, w: 0, l: 0, nr: 0, last: null };
        map.set(them.id, row);
      }
      if (m.status === "post") {
        if (us.winner === true) row.w++;
        else if (them.winner === true) row.l++;
        else row.nr++;
        if (!row.last || m.startTs > row.last.startTs) row.last = m;
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.w + b.l + b.nr) - (a.w + a.l + a.nr));
  }, [data.fixtures, t.espnId]);

  return (
    <IplPageShell
      title={t.name}
      subtitle={`${t.city} · founded ${t.founded}`}
      right={
        <Link to="/cricket/ipl/teams" className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/[0.12]">
          ← All teams
        </Link>
      }
    >
      {/* Animated franchise hero */}
      <section
        className="relative overflow-hidden rounded-2xl p-5 sm:p-7 ring-1 ring-white/10"
        style={{
          background: `
            radial-gradient(110% 140% at 0% 0%, ${t.primary} 0%, transparent 55%),
            radial-gradient(120% 140% at 100% 100%, ${t.secondary} 0%, transparent 60%),
            linear-gradient(140deg, color-mix(in oklab, ${t.primary} 60%, #07080f) 0%, #07080f 100%)
          `,
          color: t.ink,
        }}
      >
        {/* shine sweep */}
        <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full animate-[iplShine_3.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ring-1 ring-white/15">
              <span className="size-1.5 rounded-full bg-white animate-pulse" /> {t.short} · IPL Franchise
            </div>
            <h2 className="mt-2 truncate text-2xl sm:text-4xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">{t.name}</h2>
            <p className="mt-1 text-sm opacity-85">{t.homeGround}</p>
          </div>
          {t.logo && (
            <img src={t.logo} alt="" className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-2xl bg-black/30 object-contain p-2 ring-1 ring-white/25 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7)]" />
          )}
        </div>
        <dl className="relative mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Stat label="Captain" value={t.captain} />
          <Stat label="Head coach" value={t.headCoach} />
          <Stat label="Owner" value={t.owner} />
          <Stat label="Titles" value={String(t.titles)} highlight />
        </dl>
      </section>

      {/* Season selector */}
      <div className="mt-6 flex items-center gap-2">
        <Calendar className="size-3.5 text-white/40" />
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Season</label>
        <select
          value={String(seasonYear)}
          onChange={(e) => setSeasonYear(e.target.value === "current" ? "current" : Number(e.target.value))}
          className="rounded-md border border-white/10 bg-gray-900/70 px-2.5 py-1 text-xs font-bold text-white focus:border-white/30 focus:outline-none"
        >
          {IPL_SEASON_IDS.map((s) => (
            <option key={String(s.year)} value={String(s.year)}>
              {s.year === "current" ? "Current season" : s.year}
            </option>
          ))}
        </select>
        {squadQ.isFetching && <span className="text-[10px] text-white/40">Loading…</span>}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {([
          { id: "overview", label: "Overview" },
          { id: "squad", label: `Squad${squadQ.data ? ` · ${squadQ.data.players.length}` : ""}` },
          { id: "fixtures", label: `Fixtures · ${data.fixtures.length}` },
          { id: "h2h", label: "Head-to-head" },
          { id: "titles", label: `Titles · ${titleSeasons.length}` },
        ] as const).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTab(opt.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
              tab === opt.id
                ? "bg-white text-gray-950 shadow-sm"
                : "text-white/65 hover:text-white"
            }`}
            style={tab === opt.id ? { background: t.primary, color: t.ink } : undefined}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {tab === "overview" && (
        <>
          <section className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-gray-900/60 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <MapPin className="size-3.5" /> Home venue
              </div>
              <h3 className="mt-2 text-base font-black text-white">{t.homeGround}</h3>
              <p className="mt-1 text-xs text-white/55">{t.city}</p>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(t.homeGround + ", " + t.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/[0.12]"
              >
                Open in Maps ↗
              </a>
            </div>
            <div className="rounded-2xl border border-white/5 bg-gray-900/60 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <Crown className="size-3.5" /> Captain timeline
              </div>
              {captainTimeline.length === 0 ? (
                <p className="mt-3 text-sm text-white/55">Captain timeline coming soon.</p>
              ) : (
                <ol className="mt-3 grid gap-1.5">
                  {captainTimeline.map((c, i) => (
                    <li
                      key={`${c.name}-${i}`}
                      className="flex items-baseline justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-xs ring-1 ring-white/5"
                    >
                      <PlayerLink name={c.name} className="truncate font-semibold text-white">{c.name}</PlayerLink>
                      <span className="shrink-0 text-[11px] text-white/55">
                        {c.years}{c.titles > 0 ? ` · 🏆${c.titles}` : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </>
      )}

      {/* ===== SQUAD ===== */}
      {tab === "squad" && (
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between px-1">
          <h3 className="text-base font-black tracking-tight text-white">Squad</h3>
          <span className="text-[11px] text-white/50">
            {squadQ.isLoading ? "Loading…" : `${squadQ.data?.players.length ?? 0} players this season`}
          </span>
        </div>
        {squadQ.isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.04] ring-1 ring-white/10" />
            ))}
          </div>
        ) : (squadQ.data?.players.length ?? 0) === 0 ? (
          <p className="px-1 text-sm text-white/60">Squad data will appear once this season has completed matches.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {squadQ.data!.players.map((p) => (
              <li key={p.athleteId}>
                <button
                  type="button"
                  onClick={() => setActiveAthlete(p.athleteId)}
                  className="group relative w-full overflow-hidden rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.08] hover:ring-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, ${t.primary}, ${t.secondary})` }}
                  />
                  <div className="flex flex-col items-center text-center">
                    {p.headshot ? (
                      <img src={p.headshot} alt="" loading="lazy" className="size-14 rounded-full bg-black/30 object-cover ring-1 ring-white/15" />
                    ) : (
                      <div className="grid size-14 place-items-center rounded-full bg-black/30 text-sm font-black text-white/60 ring-1 ring-white/15">
                        {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div className="mt-2 line-clamp-2 text-[12px] font-bold text-white">{p.name}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/50">
                      {p.position ?? "Player"}{p.jersey ? ` · #${p.jersey}` : ""}
                    </div>
                    <div className="mt-1 text-[10px] text-amber-300/80">{p.appearances} match{p.appearances === 1 ? "" : "es"}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {/* ===== TITLES ===== */}
      {tab === "titles" && (
      <section className="mt-6">
        <h3 className="mb-3 px-1 text-base font-black tracking-tight text-white">Title-winning seasons</h3>
        {titleSeasons.length === 0 ? (
          <p className="px-1 text-sm text-white/60">No championships yet — every season is a fresh shot.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {titleSeasons.map((s) => (
              <li key={s.year} className="rounded-xl border border-amber-300/20 bg-amber-400/5 px-3 py-2.5 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="font-black text-amber-200">{s.year}</span>
                  <span className="text-[11px] text-white/60">MoF · {s.mom}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      {/* ===== FIXTURES ===== */}
      {tab === "fixtures" && (
      <section className="mt-6">
        <h3 className="mb-3 px-1 text-base font-black tracking-tight text-white">
          This season's fixtures
        </h3>
        {data.fixtures.length === 0 ? (
          <p className="px-1 text-sm text-white/60">No fixtures published yet for the current season.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.fixtures.map((m) => (
              <CricketMatchCard key={m.id} match={toCricketMatch(m, "8048", "IPL")} />
            ))}
          </div>
        )}
      </section>
      )}

      {/* ===== HEAD-TO-HEAD ===== */}
      {tab === "h2h" && (
      <section className="mt-6">
        <h3 className="mb-3 px-1 text-base font-black tracking-tight text-white">
          Head-to-head this season
        </h3>
        {h2h.length === 0 ? (
          <p className="px-1 text-sm text-white/60">No opponents tracked yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {h2h.map((o) => {
              const total = o.w + o.l + o.nr;
              const winPct = total ? Math.round((o.w / total) * 100) : 0;
              return (
                <li
                  key={o.id}
                  className="overflow-hidden rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10"
                >
                  <div className="flex items-center gap-3">
                    <TeamCrest src={o.logo} abbr={o.abbr} name={o.name} className="size-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-white">vs {o.name}</div>
                      <div className="text-[11px] text-white/55">
                        {total} meeting{total === 1 ? "" : "s"} · {winPct}% win rate
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-[11px] font-black">
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">{o.w}W</span>
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-rose-300">{o.l}L</span>
                      {o.nr > 0 && <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">{o.nr}NR</span>}
                    </div>
                  </div>
                  {/* Win rate bar */}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full"
                      style={{
                        width: `${winPct}%`,
                        background: `linear-gradient(90deg, ${t.primary}, ${t.secondary})`,
                      }}
                    />
                  </div>
                  {o.last && (
                    <div className="mt-1.5 text-[10px] text-white/50">
                      Last: {o.last.shortDetail || o.last.statusDetail}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      )}


      <CricketPlayerSheet
        athleteId={activeAthlete}
        leagueId="8048"
        onClose={() => setActiveAthlete(null)}
      />
    </IplPageShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md bg-black/25 px-2 py-1.5 ring-1 ring-white/15 backdrop-blur-sm">
      <dt className="text-[9px] font-black uppercase tracking-widest opacity-75">{label}</dt>
      <dd className={`mt-0.5 truncate ${highlight ? "text-base font-black" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}
