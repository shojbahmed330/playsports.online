import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { getMlbSeasonLeaderSnapshot } from "@/lib/mlb.functions";

const CURRENT = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT - i);

export function MlbSeasonLeaderHistory() {
  const fetcher = useServerFn(getMlbSeasonLeaderSnapshot);
  const [season, setSeason] = useState<number>(CURRENT);
  const [group, setGroup] = useState<"batting" | "pitching">("batting");

  const { data, isLoading } = useQuery({
    queryKey: ["mlb-season-leader-snapshot", season],
    queryFn: () => fetcher({ data: { season } }),
    staleTime: 60 * 60 * 1000,
  });

  const cats = (data?.categories ?? []).filter((c) => c.group === group);

  return (
    <section>
      <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <span aria-hidden>📅</span> Season Leader History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Top 5 by season · pick a year to see who led the league
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="rounded-lg bg-card ring-1 ring-border px-3 py-1.5 text-xs font-bold text-white"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="inline-flex rounded-full ring-1 ring-border bg-card p-0.5">
            {(["batting", "pitching"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={[
                  "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition",
                  group === g ? "bg-[#d50032] text-white" : "text-muted-foreground hover:text-white",
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading {season} leaders…
        </div>
      ) : cats.length === 0 ? (
        <div className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground">
          No leader data for {season}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <div key={c.key} className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-[#002d72]/30 to-transparent">
                <h3 className="text-sm font-bold text-white">{c.label}</h3>
              </div>
              <ul className="divide-y divide-border">
                {c.top.map((p, i) => (
                  <li key={p.athleteId + i} className="flex items-center gap-3 px-4 py-2 text-sm">
                    <span className="w-5 text-center text-xs font-bold tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    {p.headshot ? (
                      <img src={p.headshot} alt="" loading="lazy" className="size-7 rounded-full bg-muted object-cover" / decoding="async">
                    ) : (
                      <div className="size-7 rounded-full bg-muted" />
                    )}
                    <Link
                      to="/mlb/player/$id"
                      params={{ id: p.athleteId }}
                      className="flex-1 font-semibold text-white truncate hover:underline"
                    >
                      {p.athleteName}
                    </Link>
                    {p.teamLogo ? (
                      <img src={p.teamLogo} alt={p.teamAbbr ?? ""} className="size-4 object-contain" loading="lazy" / decoding="async">
                    ) : null}
                    <span className="font-extrabold tabular-nums text-[#f7e6c4] w-12 text-right">{p.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
