import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Loader2, ChevronDown, Users, Swords, ShieldCheck } from "lucide-react";
import { supabase, WC_YEARS, type WCTournament, type WCMatch, type WCGroup } from "@/lib/supabase";
import { TournamentInfoCard } from "@/components/wc/TournamentInfoCard";
import { GroupStage } from "@/components/wc/GroupStage";
import { MatchCard, type RoundKey } from "@/components/wc/MatchCard";
import { MatchModal } from "@/components/wc/MatchModal";
import { useAuth } from "@/hooks/use-auth";
import groupMatchesData from "@/data/wc_group_matches.json";
import { toast } from "sonner";
import { AdSlot } from "@/components/ads/AdSlot";

const GROUP_MATCHES_BY_YEAR = groupMatchesData as Record<string, WCMatch[]>;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup Archive — 1930 to 2022" },
      { name: "description", content: "Complete FIFA World Cup tournament history, brackets and match details from 1930 to 2022." },
    ],
  }),
  component: Index,
});

function classifyRound(round: string): RoundKey | "group" | null {
  const r = round.toLowerCase().trim();
  if (r.includes("group")) return "group";
  if (r.includes("third") || r.startsWith("3rd")) return "third_place";
  if (r.includes("semi")) return "semi_final";
  if (r.includes("quarter")) return "quarter_final";
  if (r.includes("16") || r.includes("round of")) return "round_of_16";
  if (r === "final" || r.endsWith("final")) return "final";
  return null;
}

const ROUND_HEADER: Record<RoundKey, { label: string; grad: string; glow: string }> = {
  round_of_16:   { label: "Round of 16",   grad: "from-blue-600 to-blue-500",   glow: "shadow-blue-500/30" },
  quarter_final: { label: "Quarter Final", grad: "from-purple-600 to-purple-500", glow: "shadow-purple-500/30" },
  semi_final:    { label: "Semi Final",    grad: "from-orange-600 to-orange-500", glow: "shadow-orange-500/30" },
  final:         { label: "Final",         grad: "from-amber-500 to-yellow-400",  glow: "shadow-amber-500/30" },
  third_place:   { label: "3rd Place",     grad: "from-zinc-600 to-zinc-500",     glow: "shadow-zinc-500/20" },
};

function Index() {
  const { isAdmin } = useAuth();
  const [year, setYear] = useState<number>(2022);
  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);
  const [tab, setTab] = useState<"groups" | "knockout">("knockout");
  const [hintSeen, setHintSeen] = useState(true);

  useEffect(() => {
    try {
      setHintSeen(localStorage.getItem("wc_hint_seen") === "1");
    } catch { /* ignore */ }
  }, []);

  const TEN_MIN = 10 * 60 * 1000;
  const THIRTY_MIN = 30 * 60 * 1000;

  const tournament = useQuery({
    queryKey: ["wc_tournament", year],
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    queryFn: async (): Promise<WCTournament | null> => {
      const { data, error } = await supabase
        .from("wc_tournaments").select("*").eq("year", year).maybeSingle();
      if (error) throw error;
      return data as WCTournament | null;
    },
  });

  const matches = useQuery({
    queryKey: ["wc_matches", year],
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    queryFn: async (): Promise<WCMatch[]> => {
      const { data, error } = await supabase
        .from("wc_matches").select("*").eq("tournament_year", year)
        .order("match_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as WCMatch[];
    },
  });

  const groups = useQuery({
    queryKey: ["wc_groups", year],
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    queryFn: async (): Promise<WCGroup[]> => {
      const { data, error } = await supabase
        .from("wc_groups").select("*").eq("tournament_year", year);
      if (error) throw error;
      return (data ?? []) as WCGroup[];
    },
  });


  // Merge group-stage fixtures from bundled dataset (DB only has knockout rows).
  const allMatches = useMemo<WCMatch[]>(() => {
    const dbMatches = matches.data ?? [];
    const seen = new Set(
      dbMatches.map((m) => `${m.home_team}|${m.away_team}|${m.round}`),
    );
    const groupRows = (GROUP_MATCHES_BY_YEAR[String(year)] ?? []).filter(
      (m) => !seen.has(`${m.home_team}|${m.away_team}|${m.round}`),
    );
    return [...dbMatches, ...groupRows];
  }, [matches.data, year]);

  // Build the bracket backwards from the final so each visual slot follows the
  // actual winner path instead of chronological match_number order.
  const grouped = useMemo(() => {
    const buckets: Record<string, WCMatch[]> = {};
    for (const m of matches.data ?? []) {
      const k = classifyRound(m.round);
      if (!k || k === "group") continue;
      (buckets[k] ||= []).push(m);
    }
    const sortByNum = (a: WCMatch, b: WCMatch) =>
      (a.match_number ?? 0) - (b.match_number ?? 0);

    const normalizeTeam = (team: string) => team.trim().toLowerCase();
    const winnerTeam = (m: WCMatch): string | null => {
      if (m.home_score_pen != null && m.away_score_pen != null) {
        return m.home_score_pen > m.away_score_pen ? m.home_team : m.away_team;
      }
      if ((m.home_score ?? 0) > (m.away_score ?? 0)) return m.home_team;
      if ((m.away_score ?? 0) > (m.home_score ?? 0)) return m.away_team;
      return null;
    };
    const containsTeam = (m: WCMatch, team: string) =>
      normalizeTeam(m.home_team) === team || normalizeTeam(m.away_team) === team;

    const orderFeeders = (nextRound: WCMatch[], feederRound: WCMatch[]): WCMatch[] => {
      if (nextRound.length === 0 || feederRound.length === 0) return feederRound;
      const remaining = feederRound.slice();
      const ordered: WCMatch[] = [];

      const takeFeederFor = (teamName: string) => {
        const team = normalizeTeam(teamName);
        let idx = remaining.findIndex((m) => normalizeTeam(winnerTeam(m) ?? "") === team);
        if (idx === -1) idx = remaining.findIndex((m) => containsTeam(m, team));
        if (idx === -1) return null;
        const [match] = remaining.splice(idx, 1);
        return match;
      };

      for (const nextMatch of nextRound) {
        const homeFeeder = takeFeederFor(nextMatch.home_team);
        const awayFeeder = takeFeederFor(nextMatch.away_team);
        if (homeFeeder) ordered.push(homeFeeder);
        if (awayFeeder) ordered.push(awayFeeder);
      }

      return [...ordered, ...remaining];
    };

    const fn = (buckets.final ?? []).slice().sort(sortByNum);
    const sf = fn.length
      ? orderFeeders(fn, (buckets.semi_final ?? []).slice().sort(sortByNum))
      : (buckets.semi_final ?? []).slice().sort(sortByNum);
    const qf = sf.length
      ? orderFeeders(sf, (buckets.quarter_final ?? []).slice().sort(sortByNum))
      : (buckets.quarter_final ?? []).slice().sort(sortByNum);
    const r16 = qf.length
      ? orderFeeders(qf, (buckets.round_of_16 ?? []).slice().sort(sortByNum))
      : (buckets.round_of_16 ?? []).slice().sort(sortByNum);

    return {
      round_of_16: r16,
      quarter_final: qf,
      semi_final: sf,
      final: fn,
      third_place: (buckets.third_place ?? []).slice().sort(sortByNum),
    } as Partial<Record<RoundKey, WCMatch[]>>;
  }, [matches.data]);

  const knockoutRounds: RoundKey[] = useMemo(() => {
    const order: RoundKey[] = ["round_of_16", "quarter_final", "semi_final", "final"];
    return order.filter((r) => (grouped[r]?.length ?? 0) > 0);
  }, [grouped]);

  const loading = tournament.isLoading || matches.isLoading || groups.isLoading;

  const teamCount = useMemo(() => {
    const s = new Set<string>();
    allMatches.forEach((m) => { s.add(m.home_team); s.add(m.away_team); });
    return s.size;
  }, [allMatches]);

  const dismissHint = () => {
    try { localStorage.setItem("wc_hint_seen", "1"); } catch { /* ignore */ }
    setHintSeen(true);
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-gold/15 grid place-items-center ring-1 ring-gold/30">
              <Trophy className="size-5 text-gold" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">FIFA World Cup</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-gold">Archive</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            <a href="#" className="px-3 py-1.5 rounded-md text-foreground bg-accent/40 transition-colors">
              Home
            </a>
            <Link
              to="/players"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Players
            </Link>
            <Link
              to="/worldcup-2026"
              className="px-3 py-1.5 rounded-md text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors font-medium"
            >
              WC 2026 🔴
            </Link>
            {["History", "About"].map((l) => (
              <a key={l} href="#" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                {l}
              </a>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="ml-1 px-3 py-1.5 rounded-md text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="size-3.5" /> Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 0%, oklch(0.78 0.16 75 / 0.18), transparent 60%), radial-gradient(40% 60% at 80% 100%, oklch(0.62 0.22 27 / 0.12), transparent 60%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="size-20 rounded-full bg-gradient-to-br from-gold/40 to-destructive/20 grid place-items-center ring-1 ring-gold/30 animate-spin-slow">
              <Trophy className="size-9 text-gold" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            FIFA World Cup <span className="text-gold">Archive</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Complete tournament history from <span className="text-foreground font-semibold">1930</span> to{" "}
            <span className="text-foreground font-semibold">2022</span>. Every match, every champion.
          </p>

          <div className="mt-10 inline-flex flex-col items-center gap-2">
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Select Tournament</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setYear(y);
                  toast(`Viewing ${y} World Cup`, { duration: 2000 });
                }}
                className="appearance-none pl-6 pr-12 py-3.5 text-lg font-semibold rounded-xl bg-card border border-border ring-1 ring-gold/20 hover:ring-gold/50 focus:outline-none focus:ring-2 focus:ring-gold transition cursor-pointer min-w-[260px]"
              >
                {WC_YEARS.slice().reverse().map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="size-5 text-gold absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {loading ? (
          <BracketSkeleton year={year} />
        ) : !tournament.data && allMatches.length === 0 ? (
          <EmptyState year={year} />
        ) : (
          <>
            {tournament.data && <TournamentInfoCard t={tournament.data} />}

            {/* Info banner */}
            <div className="flex justify-center">
              <div className="bg-gray-800/50 rounded-full px-4 py-1 text-xs text-gray-400">
                {year} World Cup
                {teamCount ? ` • ${teamCount} teams` : ""}
                {tournament.data?.host_country ? ` • ${tournament.data.host_country}` : ""}
              </div>
            </div>

            {/* TABS */}
            <div className="flex justify-center">
              <div className="bg-gray-900 rounded-2xl p-1 inline-flex gap-1 border border-gray-800">
                <TabBtn active={tab === "groups"} onClick={() => setTab("groups")} icon={<Users className="size-4" />}>
                  Group Stage
                </TabBtn>
                <TabBtn active={tab === "knockout"} onClick={() => setTab("knockout")} icon={<Swords className="size-4" />}>
                  Knockout Bracket
                </TabBtn>
              </div>
            </div>

            {/* In-content ad slot between tabs and bracket/groups. */}
            <AdSlot slot="in_content" layout="in-article" />

            {tab === "groups" ? (
              <section key="groups" className="wc-tab-content">
                <GroupStage groups={groups.data ?? []} matches={allMatches} year={year} onPick={setActiveMatch} />
              </section>
            ) : (
              <section key="knockout" className="wc-tab-content">
                {knockoutRounds.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-sm text-gray-500 bg-gray-900/40">
                    Knockout bracket data coming soon for {year}.
                  </div>
                ) : (
                  <>
                    {/* Desktop symmetric bracket — full viewport, no horizontal scroll */}
                    <div className="hidden md:block relative left-1/2 -translate-x-1/2 w-screen px-4 lg:px-8">
                      <SymmetricBracket
                        grouped={grouped}
                        onPick={setActiveMatch}
                        showHint={!hintSeen}
                        onDismissHint={dismissHint}
                      />
                    </div>

                    {/* Mobile accordion */}
                    <div className="md:hidden space-y-3">
                      {knockoutRounds.map((r) => (
                        <MobileRound
                          key={r}
                          round={r}
                          matches={grouped[r] ?? []}
                          defaultOpen={r === "final" || r === "semi_final"}
                          onPick={setActiveMatch}
                        />
                      ))}
                      {(grouped.third_place?.length ?? 0) > 0 && (
                        <MobileRound
                          round="third_place"
                          matches={grouped.third_place ?? []}
                          defaultOpen={false}
                          onPick={setActiveMatch}
                        />
                      )}
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        FIFA World Cup Archive — Historical data 1930–2022
      </footer>

      <MatchModal match={activeMatch} onClose={() => setActiveMatch(null)} />
    </div>
  );
}

function TabBtn({
  active, onClick, children, icon,
}: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2
        ${active
          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20"
          : "text-gray-400 hover:text-gray-200"}`}
    >
      {icon}
      {children}
    </button>
  );
}

function BracketColumn({
  round, matches, extra, onPick, colIndex, showHint, onDismissHint,
}: {
  round: RoundKey;
  matches: WCMatch[];
  extra: WCMatch[];
  onPick: (m: WCMatch) => void;
  colIndex: number;
  showHint?: boolean;
  onDismissHint?: () => void;
}) {
  const meta = ROUND_HEADER[round];
  const isFinal = round === "final";
  const width = isFinal ? "w-[240px]" : "w-[210px]";

  return (
    <div
      className={`wc-col shrink-0 ${width} flex flex-col`}
      style={{ animationDelay: `${colIndex * 150}ms` }}
    >
      <div className="flex justify-center mb-4">
        <span
          className={`bg-gradient-to-r ${meta.grad} text-white font-bold text-[11px] uppercase tracking-widest
            rounded-full px-4 py-1.5 shadow-lg ${meta.glow}`}
        >
          {isFinal ? "🏆 World Cup Final" : meta.label}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-around gap-3">
        {matches.map((m, i) => (
          <div
            key={m.id}
            onClick={() => { if (showHint) onDismissHint?.(); }}
          >
            <MatchCard match={m} round={round} isFinal={isFinal} index={i} onClick={() => onPick(m)} />
            {showHint && i === 0 && (
              <div className="text-[10px] text-gray-600 italic mt-1 text-center">
                tap any match for details
              </div>
            )}
          </div>
        ))}
      </div>

      {extra.length > 0 && (
        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-2 text-center">
            3rd Place Play-off
          </div>
          {extra.map((m, i) => (
            <MatchCard
              key={m.id}
              match={m}
              round="third_place"
              index={i}
              onClick={() => onPick(m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileRound({
  round, matches, defaultOpen, onPick,
}: {
  round: RoundKey;
  matches: WCMatch[];
  defaultOpen: boolean;
  onPick: (m: WCMatch) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = ROUND_HEADER[round];
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <span
          className={`bg-gradient-to-r ${meta.grad} text-white font-bold text-[11px] uppercase tracking-widest rounded-full px-3 py-1`}
        >
          {meta.label}
        </span>
        <ChevronDown className={`size-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 wc-tab-content">
          {matches.map((m, i) => (
            <MatchCard
              key={m.id}
              match={m}
              round={round}
              isFinal={round === "final"}
              index={i}
              onClick={() => onPick(m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ year }: { year: number }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
      <div className="text-6xl mb-3">⚽</div>
      <div className="text-lg font-semibold">Tournament data coming soon for {year}</div>
      <div className="text-sm text-muted-foreground mt-1">
        We're still digitizing this edition of the archive.
      </div>
    </div>
  );
}

function BracketSkeleton({ year }: { year: number }) {
  return (
    <div className="relative">
      <div className="flex justify-center mb-6">
        <div className="h-9 w-40 rounded-2xl bg-gray-900/80 animate-pulse" />
      </div>
      <div className="flex items-stretch justify-center gap-3" style={{ minHeight: 540 }}>
        {[8, 4, 2, 1, 2, 4, 8].map((n, ci) => (
          <div key={ci} className="flex-1 max-w-[200px] flex flex-col gap-3 justify-around">
            <div className="h-5 w-24 mx-auto rounded-full bg-gray-900/80 animate-pulse mb-2" />
            {Array.from({ length: n }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-gray-900/70 border border-gray-800 animate-pulse"
                style={{ animationDelay: `${(ci * 80 + i * 40)}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="flex flex-col items-center gap-2 bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4">
          <Loader2 className="size-7 text-gold animate-spin" />
          <div className="text-xs text-muted-foreground">Loading {year} tournament…</div>
        </div>
      </div>
    </div>
  );
}

function RoundLabel({ round }: { round: RoundKey }) {
  const meta = ROUND_HEADER[round];
  const isFinal = round === "final";
  return (
    <div className="flex justify-center mb-4">
      <span
        className={`bg-gradient-to-r ${meta.grad} text-white font-bold text-[11px] uppercase tracking-widest
          rounded-full px-4 py-1.5 shadow-lg ${meta.glow}`}
      >
        {isFinal ? "🏆 World Cup Final" : meta.label}
      </span>
    </div>
  );
}

function BracketSideColumn({
  round, matches, onPick, showHint, onDismissHint, side,
}: {
  round: RoundKey;
  matches: WCMatch[];
  onPick: (m: WCMatch) => void;
  showHint?: boolean;
  onDismissHint?: () => void;
  side?: "left" | "right";
}) {
  return (
    <div className="wc-col flex-1 min-w-0 max-w-[200px] flex flex-col">
      <RoundLabel round={round} />
      <div className="flex-1 flex flex-col justify-around gap-4">
        {matches.map((m, i) => (
          <div
            key={m.id}
            className="wc-connect"
            data-side={side}
            onClick={() => { if (showHint) onDismissHint?.(); }}
          >
            <MatchCard match={m} round={round} index={i} onClick={() => onPick(m)} />
            {showHint && i === 0 && (
              <div className="text-[10px] text-gray-600 italic mt-1 text-center">
                tap any match for details
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SymmetricBracket({
  grouped, onPick, showHint, onDismissHint,
}: {
  grouped: Partial<Record<RoundKey, WCMatch[]>>;
  onPick: (m: WCMatch) => void;
  showHint?: boolean;
  onDismissHint?: () => void;
}) {
  const r16 = grouped.round_of_16 ?? [];
  const qf = grouped.quarter_final ?? [];
  const sf = grouped.semi_final ?? [];
  const fn = grouped.final ?? [];
  const third = grouped.third_place ?? [];

  const half = (arr: WCMatch[]) => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)] as const;
  };
  const [r16L, r16R] = half(r16);
  const [qfL, qfR] = half(qf);
  const [sfL, sfR] = half(sf);

  return (
    <div
      className="flex items-stretch justify-center gap-2 lg:gap-3 w-full mx-auto"
      style={{ minHeight: 760 }}
    >
      {r16L.length > 0 && (
        <BracketSideColumn
          round="round_of_16"
          matches={r16L}
          onPick={onPick}
          showHint={showHint}
          onDismissHint={onDismissHint}
          side="left"
        />
      )}
      {qfL.length > 0 && (
        <BracketSideColumn round="quarter_final" matches={qfL} onPick={onPick} side="left" />
      )}
      {sfL.length > 0 && (
        <BracketSideColumn round="semi_final" matches={sfL} onPick={onPick} side="left" />
      )}

      <div className="wc-col flex-1 min-w-0 max-w-[240px] flex flex-col items-center">
        <RoundLabel round="final" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="grid place-items-center">
            <div className="size-14 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 grid place-items-center ring-1 ring-amber-400/40 mb-3">
              <Trophy className="size-7 text-amber-400" />
            </div>
            {fn.map((m, i) => (
              <MatchCard
                key={m.id}
                match={m}
                round="final"
                isFinal
                index={i}
                onClick={() => onPick(m)}
              />
            ))}
          </div>
          {third.length > 0 && (
            <div className="w-full">
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-2 text-center">
                3rd Place Play-off
              </div>
              {third.map((m, i) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  round="third_place"
                  index={i}
                  onClick={() => onPick(m)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {sfR.length > 0 && (
        <BracketSideColumn round="semi_final" matches={sfR} onPick={onPick} side="right" />
      )}
      {qfR.length > 0 && (
        <BracketSideColumn round="quarter_final" matches={qfR} onPick={onPick} side="right" />
      )}
      {r16R.length > 0 && (
        <BracketSideColumn round="round_of_16" matches={r16R} onPick={onPick} side="right" />
      )}
    </div>
  );
}
