import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { Trophy, Award, Search, ChevronDown, Sparkles, GitBranch } from "lucide-react";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import {
  getIplHistory,
  getIplPlayoffs,
  IPL_SEASON_IDS,
  type IplBracketMatch,
} from "@/lib/ipl.functions";
import franchises from "@/data/cricket/ipl/franchises.json";
import auctions from "@/data/cricket/ipl/auctions.json";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
const qo = queryOptions({
  queryKey: ["ipl", "history"],
  queryFn: () => getIplHistory(),
  staleTime: 60 * 60_000,
});

const bracketQo = (year: number | "current") =>
  queryOptions({
    queryKey: ["ipl", "playoffs", year],
    queryFn: () => getIplPlayoffs({ data: { year } }),
    staleTime: 10 * 60_000,
  });

const KNOWN_BRACKET_YEARS = new Set<number | "current">(IPL_SEASON_IDS.map((s) => s.year));

type Era = { id: string; label: string; range: [number, number] };
const ERAS: Era[] = [
  { id: "all", label: "All Eras", range: [2008, 2099] },
  { id: "early", label: "2008â€“2014", range: [2008, 2014] },
  { id: "golden", label: "2015â€“2021", range: [2015, 2021] },
  { id: "modern", label: "2022â€“Now", range: [2022, 2099] },
];

type AuctionHeadline = (typeof auctions.headlines)[number];
const auctionByYear = new Map<number, AuctionHeadline>(auctions.headlines.map((a) => [a.year, a]));

export const Route = createFileRoute("/cricket/ipl/history")({
  head: () => ({
    meta: [
      { title: "IPL History â€” Champions, Finals, Awards & Auctions" },
      {
        name: "description",
        content:
          "Every IPL final, champion, runner-up, orange/purple cap winner, MoF and auction headline since 2008.",
      },
      { property: "og:title", content: "IPL â€” Complete History" },
      {
        property: "og:description",
        content: "Every IPL final and award winner with era filters and a Hall of Champions.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/history" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL History â€” Champions, Finals, Awards & Auctions" },
      {
        name: "twitter:description",
        content:
          "Every IPL final, champion, runner-up, orange/purple cap winner, MoF and auction headline since 2008.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/history" }],
    scripts: [
      ldScript(
        collectionPage({
          name: "IPL History",
          description: "Every IPL final and award winner with era filters and a Hall of Champions.",
          path: "/cricket/ipl/history",
        }),
      ),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "IPL", path: "/cricket/ipl" },
          { name: "History", path: "/cricket/ipl/history" },
        ]),
      ),
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: withHubLinks(HistoryPage, { sport: "ipl", currentPath: "/cricket/ipl/history" }),
  errorComponent: ({ error, reset }) => (
    <IplPageShell title="IPL Seasons & Champions">
      <ErrorState
        title="Could not load IPL history"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </IplPageShell>
  ),
});

function HistoryPage() {
  const { data } = useSuspenseQuery(qo);
  const [q, setQ] = useState("");
  const [team, setTeam] = useState<string>("all");
  const [era, setEra] = useState<string>("all");
  const [openYear, setOpenYear] = useState<number | null>(null);
  const [openBracket, setOpenBracket] = useState<number | null>(null);

  const teams = useMemo(() => {
    const set = new Set<string>();
    data.seasons.forEach((s) => {
      set.add(s.champion);
      set.add(s.runnerUp);
    });
    return Array.from(set).sort();
  }, [data]);

  // Hall of Champions: count titles per franchise
  const hall = useMemo(() => {
    const counts = new Map<
      string,
      {
        id: string;
        name: string;
        short: string;
        primary: string;
        ink: string;
        titles: number;
        years: number[];
      }
    >();
    for (const s of data.seasons) {
      if (!s.championId) continue;
      const f = (franchises as any[]).find((x) => x.id === s.championId);
      if (!f) continue;
      let row = counts.get(f.id);
      if (!row) {
        row = {
          id: f.id,
          name: f.name,
          short: f.short,
          primary: f.primary,
          ink: f.ink,
          titles: 0,
          years: [],
        };
        counts.set(f.id, row);
      }
      row.titles++;
      row.years.push(s.year);
    }
    return Array.from(counts.values()).sort((a, b) => b.titles - a.titles);
  }, [data]);

  const eraDef = ERAS.find((e) => e.id === era)!;
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.seasons.filter((s) => {
      if (s.year < eraDef.range[0] || s.year > eraDef.range[1]) return false;
      if (team !== "all" && s.champion !== team && s.runnerUp !== team) return false;
      if (!needle) return true;
      return [
        String(s.year),
        s.champion,
        s.runnerUp,
        s.mom,
        s.finalVenue,
        s.orangeCap.player,
        s.purpleCap.player,
      ].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [data, q, team, eraDef]);

  return (
    <IplPageShell
      title="IPL Seasons & Champions"
      subtitle={`${filtered.length} / ${data.seasons.length} seasons`}
    >
      {/* Auction spend trend */}
      <AuctionSpendChart />

      {/* Hall of Champions */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--color-gold)]/15 bg-gradient-to-br from-[var(--color-gold)]/30 via-background to-background p-4">
        <div className="mb-3 flex items-center gap-2">
          <Trophy aria-hidden="true" className="size-4 text-[var(--color-gold)]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--color-gold)]">
            Hall of Champions
          </h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hall.map((h) => (
            <Link
              key={h.id}
              to="/cricket/ipl/teams/$teamId"
              params={{ teamId: h.id }}
              className="group flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-border transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{
                background: `linear-gradient(135deg, ${h.primary} 0%, color-mix(in oklab, ${h.primary} 50%, #07080f) 100%)`,
                color: h.ink,
              }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {h.short}
              </span>
              <span className="flex items-baseline gap-0.5">
                <span className="text-lg font-black leading-none">{h.titles}</span>
                <span className="text-[10px] font-bold opacity-80" aria-hidden="true">
                  Ã—
                </span>
                <Trophy aria-hidden="true" className="size-3 opacity-90" />
                <span className="sr-only">titles</span>
              </span>
              <span className="hidden sm:inline text-[10px] font-semibold opacity-85">
                {[...h.years].sort().join(" Â· ")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Era tabs */}
      <div className="mb-3 flex flex-wrap gap-1">
        {ERAS.map((e) => (
          <button
            key={e.id}
            type="button"
            aria-pressed={era === e.id}
            onClick={() => setEra(e.id)}
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wider transition ${
              era === e.id
                ? "bg-[var(--color-gold)] text-muted-foreground"
                : "bg-muted text-foreground hover:bg-muted"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Search + team filter */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search IPL history"
            placeholder="Search year, team, player, venueâ€¦"
            className="min-h-11 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-foreground focus:border-[var(--color-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
          />
        </div>
        <select
          aria-label="Filter by team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="min-h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-[var(--color-gold)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/30"
        >
          <option value="all">All teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title="No seasons match your filters"
          description="Try another era, team or search term."
          action={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setTeam("all");
                setEra("all");
              }}
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-gold)]/15 px-4 text-sm font-bold text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30"
            >
              Clear filters
            </button>
          }
        />
      )}

      <ul className="grid gap-4">
        {filtered.map((s) => {
          const open = openYear === s.year;
          const auction = auctionByYear.get(s.year);
          return (
            <li
              key={s.year}
              className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[var(--color-gold)]/40 via-background to-background shadow-xl"
            >
              <header className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
                <div className="text-2xl font-black text-[var(--color-gold)]">{s.year}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Trophy aria-hidden="true" className="size-4 text-[var(--color-gold)]" />
                    <span className="truncate">{s.champion}</span>
                  </div>
                  <div className="truncate text-xs text-foreground">def. {s.runnerUp}</div>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--color-gold)]/15 px-2.5 py-1 text-[10px] font-black text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30">
                  CHAMPION
                </span>
              </header>

              <div className="grid gap-3 px-4 py-3 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    Final
                  </div>
                  <p className="mt-1 text-sm text-foreground">{s.finalScore}</p>
                  <p className="mt-0.5 text-[11px] text-foreground">{s.finalVenue}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-border">
                    <Award aria-hidden="true" className="size-3" /> Player of the Final:{" "}
                    <PlayerLink name={s.mom} className="font-semibold">
                      {s.mom}
                    </PlayerLink>
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <AwardCard
                    label="Orange Cap"
                    name={s.orangeCap.player}
                    team={s.orangeCap.team}
                    value={`${s.orangeCap.runs} runs`}
                    className="ipl-orange-cap"
                  />
                  <AwardCard
                    label="Purple Cap"
                    name={s.purpleCap.player}
                    team={s.purpleCap.team}
                    value={`${s.purpleCap.wickets} wkts`}
                    className="ipl-purple-cap"
                  />
                </dl>
              </div>

              {/* Expandable: auction headlines */}
              {auction && (
                <div className="border-t border-border">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`auction-${s.year}`}
                    onClick={() => setOpenYear(open ? null : s.year)}
                    className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles aria-hidden="true" className="size-3.5 text-[var(--color-gold)]" /> Auction
                      headlines
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div id={`auction-${s.year}`} className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
                      <AuctionCard tone="amber" label="Most expensive" h={auction.mostExpensive} />
                      <AuctionCard tone="violet" label="Surprise pick" h={auction.surprise} />
                    </div>
                  )}
                </div>
              )}

              {/* Expandable: playoff bracket */}
              {KNOWN_BRACKET_YEARS.has(s.year) && (
                <div className="border-t border-border">
                  <button
                    type="button"
                    aria-expanded={openBracket === s.year}
                    aria-controls={`bracket-${s.year}`}
                    onClick={() => setOpenBracket(openBracket === s.year ? null : s.year)}
                    className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-muted"
                  >
                    <span className="flex items-center gap-1.5">
                      <GitBranch aria-hidden="true" className="size-3.5 text-[var(--color-accent-nhl)]" /> Playoff
                      bracket
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`size-4 transition-transform ${openBracket === s.year ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openBracket === s.year && (
                    <div id={`bracket-${s.year}`}>
                      <BracketPanel year={s.year} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </IplPageShell>
  );
}

function AwardCard({
  label,
  name,
  team,
  value,
  className,
}: {
  label: string;
  name: string;
  team: string;
  value: string;
  className: string;
}) {
  return (
    <div className={`rounded-lg p-2.5 ${className}`}>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</div>
      <PlayerLink name={name} className="mt-0.5 truncate text-sm font-bold block">
        {name}
      </PlayerLink>
      <div className="flex items-baseline justify-between text-[11px] opacity-90">
        <span>{team}</span>
        <span className="font-black">{value}</span>
      </div>
    </div>
  );
}

function AuctionCard({
  tone,
  label,
  h,
}: {
  tone: "amber" | "violet";
  label: string;
  h: { player: string; team: string; price: string; note?: string };
}) {
  const ring =
    tone === "amber" ? "ring-[var(--color-gold)]/30 bg-[var(--color-gold)]/10" : "ring-[var(--color-accent-nhl)]/25 bg-[var(--color-accent-nhl)]/10";
  const accent = tone === "amber" ? "text-[var(--color-gold)]" : "text-[var(--color-accent-nhl)]";
  return (
    <div className={`rounded-lg p-3 ring-1 ${ring}`}>
      <div className={`text-[9px] font-black uppercase tracking-widest ${accent}`}>{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <PlayerLink name={h.player} className="truncate text-sm font-bold text-foreground block">
            {h.player}
          </PlayerLink>
          <div className="truncate text-[11px] text-foreground">{h.team}</div>
        </div>
        <div className={`shrink-0 text-base font-black ${accent}`}>{h.price}</div>
      </div>
      {h.note && <div className="mt-1 text-[11px] text-foreground">{h.note}</div>}
    </div>
  );
}

function BracketPanel({ year }: { year: number }) {
  const q = useQuery(bracketQo(year));
  if (q.isError) {
    return (
      <div className="px-4 pb-4">
        <ErrorState
          title="Could not load the bracket"
          message={errorMessage(q.error)}
          onRetry={() => void q.refetch()}
          className="border-border bg-muted"
        />
      </div>
    );
  }
  if (q.isLoading) {
    return (
      <div role="status" className="px-4 pb-4 text-[11px] text-foreground">
        Loading bracketâ€¦
      </div>
    );
  }
  const bracket = q.data?.bracket ?? [];
  const empty = bracket.every((b) => !b.match);
  if (empty) {
    return (
      <div className="px-4 pb-4">
        <EmptyState
          title="No playoff matches available"
          description="The bracket appears once this season's playoffs are scheduled."
          className="border-border bg-muted"
        />
      </div>
    );
  }
  return (
    <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
      {bracket.map((b) => (
        <BracketCell key={b.stage} b={b} />
      ))}
    </div>
  );
}

function BracketCell({ b }: { b: IplBracketMatch }) {
  const m = b.match;
  const stageTone =
    b.stage === "Final"
      ? "ring-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
      : b.stage === "Eliminator"
        ? "ring-[var(--color-live)]/30 bg-[var(--color-live)]/10 text-[var(--color-live)]"
        : "ring-[var(--color-accent-nhl)]/30 bg-[var(--color-accent-nhl)]/10 text-[var(--color-accent-nhl)]";
  return (
    <div className={`rounded-lg p-3 ring-1 ${stageTone}`}>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-90">{b.stage}</div>
      {m ? (
        <>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs font-bold text-foreground">
            <span className="truncate">{m.home.shortName || m.home.name || "TBD"}</span>
            <span className="opacity-60">vs</span>
            <span className="truncate text-right">{m.away.shortName || m.away.name || "TBD"}</span>
          </div>
          <div className="mt-1 text-[10px] text-foreground">{m.shortDetail || m.statusDetail}</div>
          {m.venue && <div className="text-[10px] text-foreground">{m.venue}</div>}
        </>
      ) : (
        <div className="mt-1 text-[11px] text-foreground">Not scheduled.</div>
      )}
    </div>
  );
}

// â”€â”€â”€ Auction spend trend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parsePrice(s: string): number {
  // returns USD in millions
  const m = s.replace(/[$,]/g, "").trim();
  if (/m/i.test(m)) return parseFloat(m);
  if (/k/i.test(m)) return parseFloat(m) / 1000;
  const n = parseFloat(m);
  return Number.isFinite(n) ? n : 0;
}

function AuctionSpendChart() {
  const rows = useMemo(
    () =>
      auctions.headlines
        .slice()
        .sort((a, b) => a.year - b.year)
        .map((h) => ({
          year: h.year,
          top: parsePrice(h.mostExpensive.price),
          player: h.mostExpensive.player,
          team: h.mostExpensive.team,
          priceLabel: h.mostExpensive.price,
        })),
    [],
  );
  const max = Math.max(...rows.map((r) => r.top), 1);
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--color-accent-nhl)]/15 bg-gradient-to-br from-[var(--color-accent-nhl)]/30 via-background to-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles aria-hidden="true" className="size-4 text-[var(--color-accent-nhl)]" />
        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--color-accent-nhl)]">
          Auction spend â€” top buy per season
        </h2>
        <span className="ml-auto text-[10px] font-bold text-foreground">USD millions</span>
      </div>
      <div className="flex items-end gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.map((r) => {
          const h = Math.max(8, Math.round((r.top / max) * 100));
          return (
            <div key={r.year} className="group flex w-[34px] shrink-0 flex-col items-center gap-1">
              <div className="text-[9px] font-black tabular-nums text-[var(--color-accent-nhl)]/90">
                {r.priceLabel}
              </div>
              <div
                className="w-full rounded-md bg-gradient-to-t from-[var(--color-accent-nhl)] via-[var(--color-accent-nhl)] to-[var(--color-gold)] ring-1 ring-border transition group-hover:from-[var(--color-accent-nhl)]"
                style={{ height: `${h}px` }}
                title={`${r.year} â€” ${r.player} (${r.team}) ${r.priceLabel}`}
              />
              <span className="sr-only">
                {r.year}: {r.player}, {r.team}, {r.priceLabel}
              </span>
              <div className="text-[9px] font-bold text-foreground">{String(r.year).slice(2)}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-foreground">
        Hover any bar for player and franchise. Trend shows escalation across the {rows.length} IPL
        auctions.
      </p>
    </section>
  );
}
