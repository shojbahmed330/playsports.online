import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Loader2, ChevronDown } from "lucide-react";
import { supabase, WC_YEARS, type WCTournament, type WCMatch, type WCGroup } from "@/lib/supabase";
import { TournamentInfoCard } from "@/components/wc/TournamentInfoCard";
import { GroupStage } from "@/components/wc/GroupStage";
import { MatchCard } from "@/components/wc/MatchCard";
import { MatchModal } from "@/components/wc/MatchModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIFA World Cup Archive — 1930 to 2022" },
      { name: "description", content: "Complete FIFA World Cup tournament history, brackets and match details from 1930 to 2022." },
      { property: "og:title", content: "FIFA World Cup Archive" },
      { property: "og:description", content: "Complete FIFA World Cup tournament history from 1930 to 2022." },
    ],
  }),
  component: Index,
});

const ROUND_KEYS = [
  { key: "round_of_16", label: "Round of 16", match: ["round of 16", "r16"] },
  { key: "quarter_final", label: "Quarter Final", match: ["quarter", "qf"] },
  { key: "semi_final", label: "Semi Final", match: ["semi", "sf"] },
  { key: "third_place", label: "3rd Place Play-off", match: ["third", "3rd"] },
  { key: "final", label: "Final", match: ["^final$", "final"] },
] as const;

function classifyRound(round: string): string | null {
  const r = round.toLowerCase().trim();
  if (r.includes("group")) return "group";
  if (r.includes("third") || r.startsWith("3rd")) return "third_place";
  if (r === "final" || r.endsWith(" final") && !r.includes("semi") && !r.includes("quarter")) {
    // careful: "Semi Final" / "Quarter Final" also end with final
  }
  if (r.includes("semi")) return "semi_final";
  if (r.includes("quarter")) return "quarter_final";
  if (r.includes("16") || r.includes("round of")) return "round_of_16";
  if (r === "final") return "final";
  return null;
}

function Index() {
  const [year, setYear] = useState<number>(2022);
  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);

  const tournament = useQuery({
    queryKey: ["wc_tournament", year],
    queryFn: async (): Promise<WCTournament | null> => {
      const { data, error } = await supabase
        .from("wc_tournaments").select("*").eq("year", year).maybeSingle();
      if (error) throw error;
      return data as WCTournament | null;
    },
  });

  const matches = useQuery({
    queryKey: ["wc_matches", year],
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
    queryFn: async (): Promise<WCGroup[]> => {
      const { data, error } = await supabase
        .from("wc_groups").select("*").eq("tournament_year", year);
      if (error) throw error;
      return (data ?? []) as WCGroup[];
    },
  });

  const grouped: Record<string, WCMatch[]> = {};
  for (const m of matches.data ?? []) {
    const k = classifyRound(m.round);
    if (!k || k === "group") continue;
    (grouped[k] ||= []).push(m);
  }

  const loading = tournament.isLoading || matches.isLoading || groups.isLoading;

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
            {["Home", "History", "About"].map((l) => (
              <a key={l} href="#" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                {l}
              </a>
            ))}
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
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="size-20 rounded-full bg-gradient-to-br from-gold/40 to-destructive/20 grid place-items-center ring-1 ring-gold/30 animate-spin-slow">
                <Trophy className="size-9 text-gold" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            FIFA World Cup <span className="text-gold">Archive</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Complete tournament history from <span className="text-foreground font-semibold">1930</span> to{" "}
            <span className="text-foreground font-semibold">2022</span>. Every match, every champion.
          </p>

          {/* Year selector */}
          <div className="mt-10 inline-flex flex-col items-center gap-2">
            <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Select Tournament</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="appearance-none pl-6 pr-12 py-3.5 text-lg font-semibold rounded-xl bg-card border border-border ring-1 ring-gold/20 hover:ring-gold/50 focus:outline-none focus:ring-2 focus:ring-gold transition cursor-pointer min-w-[260px]"
              >
                {WC_YEARS.slice().reverse().map((y) => (
                  <option key={y} value={y}>
                    {y}
                    {tournament.data && y === year && tournament.data.host_country
                      ? ` — ${tournament.data.host_country}`
                      : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-5 text-gold absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="size-8 text-gold animate-spin" />
            <div className="mt-3 text-sm">Loading {year} tournament…</div>
          </div>
        ) : !tournament.data && (matches.data ?? []).length === 0 ? (
          <EmptyState year={year} />
        ) : (
          <>
            {tournament.data && <TournamentInfoCard t={tournament.data} />}

            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-5">
                <span className="text-gold">⚽</span> Tournament Bracket
              </h2>

              <div className="overflow-x-auto scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-5 min-w-max lg:min-w-0 lg:grid lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(180px,1fr))]">
                  <BracketColumn title="Group Stage" width="w-[340px] lg:w-auto">
                    <GroupStage groups={groups.data ?? []} year={year} />
                  </BracketColumn>

                  <BracketColumn title="Round of 16">
                    <Stack matches={grouped.round_of_16} onPick={setActiveMatch} />
                  </BracketColumn>

                  <BracketColumn title="Quarter Final">
                    <Stack matches={grouped.quarter_final} onPick={setActiveMatch} />
                  </BracketColumn>

                  <BracketColumn title="Semi Final">
                    <Stack matches={grouped.semi_final} onPick={setActiveMatch} />
                  </BracketColumn>

                  <BracketColumn title="Final">
                    {(grouped.final ?? []).map((m) => (
                      <MatchCard key={m.id} match={m} large onClick={() => setActiveMatch(m)} />
                    ))}
                    {(grouped.final ?? []).length === 0 && <EmptyRound />}
                    {(grouped.third_place ?? []).length > 0 && (
                      <div className="mt-6">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                          3rd Place Play-off
                        </div>
                        {grouped.third_place.map((m) => (
                          <MatchCard key={m.id} match={m} onClick={() => setActiveMatch(m)} />
                        ))}
                      </div>
                    )}
                  </BracketColumn>
                </div>
              </div>
            </section>
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

function BracketColumn({
  title, children, width,
}: { title: string; children: React.ReactNode; width?: string }) {
  return (
    <div className={`shrink-0 ${width ?? "w-[240px] lg:w-auto"}`}>
      <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-gold mb-3 px-1">
        {title}
      </div>
      <div className="flex flex-col gap-3 justify-around h-full">{children}</div>
    </div>
  );
}

function Stack({ matches, onPick }: { matches?: WCMatch[]; onPick: (m: WCMatch) => void }) {
  if (!matches || matches.length === 0) return <EmptyRound />;
  return (
    <>
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} onClick={() => onPick(m)} />
      ))}
    </>
  );
}

function EmptyRound() {
  return (
    <div className="rounded-lg border border-dashed border-border/70 p-4 text-center text-[11px] text-muted-foreground">
      Not played
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
