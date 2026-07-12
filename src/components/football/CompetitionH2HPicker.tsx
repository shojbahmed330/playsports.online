import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionTeams } from "@/lib/espn.functions";
import { matchupSlug } from "@/lib/matchup";
import { Swords, Loader2 } from "lucide-react";
import type { Competition } from "@/lib/competitions";

/**
 * Head-to-head picker used on `/football/$comp` landing pages. Pulls the live
 * team list for the competition from ESPN and lets a user pick any two teams
 * to jump to their scoped H2H page.
 */
export function CompetitionH2HPicker({ comp }: { comp: Competition }) {
  const navigate = useNavigate();
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");

  const q = useQuery({
    queryKey: ["comp-teams-picker", comp.slug],
    queryFn: () => getCompetitionTeams({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 6 * 60 * 60_000,
  });

  const teamNames = useMemo(() => {
    const list = q.data?.teams ?? [];
    return [...list.map((t) => t.name || t.shortName).filter(Boolean)].sort();
  }, [q.data]);

  const canGo = a && b && a !== b;

  const submit = () => {
    if (!canGo) return;
    navigate({
      to: "/football/$comp/h2h/$matchup",
      params: { comp: comp.slug, matchup: matchupSlug(a, b) },
    });
  };

  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Swords className="size-4" /> {comp.shortName} Head-to-Head
      </h3>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading {comp.shortName} teams…
          </div>
        ) : teamNames.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Team list is not available right now.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
            <TeamSelect label="Team A" value={a} onChange={setA} options={teamNames} exclude={b} />
            <span className="hidden sm:grid place-items-center text-xs uppercase tracking-widest text-muted-foreground">
              vs
            </span>
            <TeamSelect label="Team B" value={b} onChange={setB} options={teamNames} exclude={a} />
            <button
              type="button"
              onClick={submit}
              disabled={!canGo}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Compare →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function TeamSelect({
  label,
  value,
  onChange,
  options,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  exclude?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-foreground outline-none focus:border-white/25 [&>option]:bg-background [&>option]:text-foreground"
      >
        <option value="" className="bg-background text-foreground">Select team…</option>
        {options
          .filter((t) => t !== exclude)
          .map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
      </select>
    </label>
  );
}
