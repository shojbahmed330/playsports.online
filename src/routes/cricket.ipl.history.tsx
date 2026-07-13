import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { Trophy, Award, Search, ChevronDown, Sparkles, GitBranch } from "lucide-react";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import { getIplHistory, getIplPlayoffs, IPL_SEASON_IDS, type IplBracketMatch } from "@/lib/ipl.functions";
import franchises from "@/data/cricket/ipl/franchises.json";
import auctions from "@/data/cricket/ipl/auctions.json";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";


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
  { id: "early", label: "2008–2014", range: [2008, 2014] },
  { id: "golden", label: "2015–2021", range: [2015, 2021] },
  { id: "modern", label: "2022–Now", range: [2022, 2099] },
];

type AuctionHeadline = (typeof auctions.headlines)[number];
const auctionByYear = new Map<number, AuctionHeadline>(
  auctions.headlines.map((a) => [a.year, a]),
);

export const Route = createFileRoute("/cricket/ipl/history")({
  head: () => ({
    meta: [
      { title: "IPL History — Champions, Finals, Awards & Auctions" },
      { name: "description", content: "Every IPL final, champion, runner-up, orange/purple cap winner, MoF and auction headline since 2008." },
      { property: "og:title", content: "IPL — Complete History" },
      { property: "og:description", content: "Every IPL final and award winner with era filters and a Hall of Champions." },
      { property: "og:url", content: "https://www.playsports.online/cricket/ipl/history" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IPL History — Champions, Finals, Awards & Auctions" },
      { name: "twitter:description", content: "Every IPL final, champion, runner-up, orange/purple cap winner, MoF and auction headline since 2008." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/ipl/history" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }, { name: "IPL", path: "/cricket/ipl" }, { name: "History", path: "/cricket/ipl/history" }]))],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: HistoryPage,
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
    data.seasons.forEach((s) => { set.add(s.champion); set.add(s.runnerUp); });
    return Array.from(set).sort();
  }, [data]);

  // Hall of Champions: count titles per franchise
  const hall = useMemo(() => {
    const counts = new Map<string, { id: string; name: string; short: string; primary: string; ink: string; titles: number; years: number[] }>();
    for (const s of data.seasons) {
      if (!s.championId) continue;
      const f = (franchises as any[]).find((x) => x.id === s.championId);
      if (!f) continue;
      let row = counts.get(f.id);
      if (!row) {
        row = { id: f.id, name: f.name, short: f.short, primary: f.primary, ink: f.ink, titles: 0, years: [] };
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
      return [String(s.year), s.champion, s.runnerUp, s.mom, s.finalVenue, s.orangeCap.player, s.purpleCap.player]
        .some((v) => v?.toLowerCase().includes(needle));
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
      <section className="mb-6 overflow-hidden rounded-2xl border border-amber-300/15 bg-gradient-to-br from-amber-950/30 via-gray-900/60 to-gray-900/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="size-4 text-amber-300" />
          <h2 className="text-sm font-black uppercase tracking-widest text-amber-200">Hall of Champions</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {hall.map((h) => (
            <Link
              key={h.id}
              to="/cricket/ipl/teams/$teamId"
              params={{ teamId: h.id }}
              className="group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-white/10 transition hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${h.primary} 0%, color-mix(in oklab, ${h.primary} 50%, #07080f) 100%)`,
                color: h.ink,
              }}
              onClick={() => setTeam(h.name)}
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{h.short}</span>
              <span className="flex items-baseline gap-0.5">
                <span className="text-lg font-black leading-none">{h.titles}</span>
                <span className="text-[10px] font-bold opacity-80">×</span>
                <Trophy className="size-3 opacity-90" />
              </span>
              <span className="hidden sm:inline text-[10px] font-semibold opacity-85">
                {h.years.sort().join(" · ")}
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
            onClick={() => setEra(e.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
              era === e.id ? "bg-amber-400 text-gray-950" : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Search + team filter */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search year, team, player, venue…"
            className="w-full rounded-lg border border-white/10 bg-gray-900/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-amber-400/40 focus:outline-none"
          />
        </div>
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="rounded-lg border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white focus:border-amber-400/40 focus:outline-none"
        >
          <option value="all">All teams</option>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-white/5 bg-gray-900/40 p-6 text-center text-sm text-white/50">No seasons match your filters.</p>
      )}

      <ul className="grid gap-4">
        {filtered.map((s) => {
          const open = openYear === s.year;
          const auction = auctionByYear.get(s.year);
          return (
            <li
              key={s.year}
              className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-amber-950/40 via-gray-900/70 to-gray-900/40 shadow-xl"
            >
              <header className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/5 px-4 py-3">
                <div className="text-2xl font-black text-amber-300">{s.year}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Trophy className="size-4 text-amber-300" />
                    <span className="truncate">{s.champion}</span>
                  </div>
                  <div className="truncate text-xs text-white/60">def. {s.runnerUp}</div>
                </div>
                <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black text-amber-200 ring-1 ring-amber-300/30">
                  CHAMPION
                </span>
              </header>

              <div className="grid gap-3 px-4 py-3 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Final</div>
                  <p className="mt-1 text-sm text-white/90">{s.finalScore}</p>
                  <p className="mt-0.5 text-[11px] text-white/50">{s.finalVenue}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/10">
                    <Award className="size-3" /> Player of the Final: <PlayerLink name={s.mom} className="font-semibold">{s.mom}</PlayerLink>
                  </p>

                </div>

                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <AwardCard label="Orange Cap" name={s.orangeCap.player} team={s.orangeCap.team} value={`${s.orangeCap.runs} runs`} className="ipl-orange-cap" />
                  <AwardCard label="Purple Cap" name={s.purpleCap.player} team={s.purpleCap.team} value={`${s.purpleCap.wickets} wkts`} className="ipl-purple-cap" />
                </dl>
              </div>

              {/* Expandable: auction headlines */}
              {auction && (
                <div className="border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setOpenYear(open ? null : s.year)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center gap-1.5"><Sparkles className="size-3.5 text-amber-300" /> Auction headlines</span>
                    <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
                      <AuctionCard tone="amber" label="Most expensive" h={auction.mostExpensive} />
                      <AuctionCard tone="violet" label="Surprise pick" h={auction.surprise} />
                    </div>
                  )}
                </div>
              )}

              {/* Expandable: playoff bracket */}
              {KNOWN_BRACKET_YEARS.has(s.year) && (
                <div className="border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setOpenBracket(openBracket === s.year ? null : s.year)}
                    className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center gap-1.5"><GitBranch className="size-3.5 text-fuchsia-300" /> Playoff bracket</span>
                    <ChevronDown className={`size-4 transition-transform ${openBracket === s.year ? "rotate-180" : ""}`} />
                  </button>
                  {openBracket === s.year && <BracketPanel year={s.year} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </IplPageShell>
  );
}

function AwardCard({ label, name, team, value, className }: { label: string; name: string; team: string; value: string; className: string }) {
  return (
    <div className={`rounded-lg p-2.5 ${className}`}>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</div>
      <PlayerLink name={name} className="mt-0.5 truncate text-sm font-bold block">{name}</PlayerLink>
      <div className="flex items-baseline justify-between text-[11px] opacity-90">
        <span>{team}</span>
        <span className="font-black">{value}</span>
      </div>
    </div>
  );
}


function AuctionCard({ tone, label, h }: { tone: "amber" | "violet"; label: string; h: { player: string; team: string; price: string; note?: string } }) {
  const ring = tone === "amber" ? "ring-amber-300/30 bg-amber-400/10" : "ring-violet-300/25 bg-violet-500/10";
  const accent = tone === "amber" ? "text-amber-200" : "text-violet-200";
  return (
    <div className={`rounded-lg p-3 ring-1 ${ring}`}>
      <div className={`text-[9px] font-black uppercase tracking-widest ${accent}`}>{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <PlayerLink name={h.player} className="truncate text-sm font-bold text-white block">{h.player}</PlayerLink>
          <div className="truncate text-[11px] text-white/55">{h.team}</div>

        </div>
        <div className={`shrink-0 text-base font-black ${accent}`}>{h.price}</div>
      </div>
      {h.note && <div className="mt-1 text-[11px] text-white/55">{h.note}</div>}
    </div>
  );
}

function BracketPanel({ year }: { year: number }) {
  const q = useQuery(bracketQo(year));
  if (q.isLoading) {
    return <div className="px-4 pb-4 text-[11px] text-white/50">Loading bracket…</div>;
  }
  const bracket = q.data?.bracket ?? [];
  const empty = bracket.every((b) => !b.match);
  if (empty) {
    return <div className="px-4 pb-4 text-[11px] text-white/50">No playoff matches available for this season.</div>;
  }
  return (
    <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
      {bracket.map((b) => <BracketCell key={b.stage} b={b} />)}
    </div>
  );
}

function BracketCell({ b }: { b: IplBracketMatch }) {
  const m = b.match;
  const stageTone =
    b.stage === "Final" ? "ring-amber-300/40 bg-amber-400/10 text-amber-100"
    : b.stage === "Eliminator" ? "ring-rose-300/30 bg-rose-500/10 text-rose-100"
    : "ring-fuchsia-300/30 bg-fuchsia-500/10 text-fuchsia-100";
  return (
    <div className={`rounded-lg p-3 ring-1 ${stageTone}`}>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-90">{b.stage}</div>
      {m ? (
        <>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs font-bold text-white">
            <span className="truncate">{m.home.shortName || m.home.name || "TBD"}</span>
            <span className="opacity-60">vs</span>
            <span className="truncate text-right">{m.away.shortName || m.away.name || "TBD"}</span>
          </div>
          <div className="mt-1 text-[10px] text-white/65">{m.shortDetail || m.statusDetail}</div>
          {m.venue && <div className="text-[10px] text-white/45">{m.venue}</div>}
        </>
      ) : (
        <div className="mt-1 text-[11px] text-white/50">Not scheduled.</div>
      )}
    </div>
  );
}


// ─── Auction spend trend ─────────────────────────────────
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
    <section className="mb-6 overflow-hidden rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-950/30 via-gray-900/60 to-gray-900/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-violet-300" />
        <h2 className="text-sm font-black uppercase tracking-widest text-violet-200">Auction spend — top buy per season</h2>
        <span className="ml-auto text-[10px] font-bold text-white/35">USD millions</span>
      </div>
      <div className="flex items-end gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.map((r) => {
          const h = Math.max(8, Math.round((r.top / max) * 100));
          return (
            <div key={r.year} className="group flex w-[34px] shrink-0 flex-col items-center gap-1">
              <div className="text-[9px] font-black tabular-nums text-violet-200/90">{r.priceLabel}</div>
              <div
                className="w-full rounded-md bg-gradient-to-t from-violet-700 via-fuchsia-500 to-amber-300 ring-1 ring-white/10 transition group-hover:from-violet-500"
                style={{ height: `${h}px` }}
                title={`${r.year} — ${r.player} (${r.team}) ${r.priceLabel}`}
              />
              <div className="text-[9px] font-bold text-white/55">{String(r.year).slice(2)}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-white/45">Hover any bar for player and franchise. Trend shows escalation across the 18 IPL auctions.</p>
    </section>
  );
}
