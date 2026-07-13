import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getCompetitionLeaders } from "@/lib/espn.functions";
import type { Competition } from "@/lib/competitions";
import { Goal, Loader2 } from "lucide-react";
import { getCompetitionRecords } from "@/data/competition-records";

/**
 * Top scorers preview card.
 * Prefers ESPN live leaders (mid-season leagues like La Liga).
 * Falls back to seeded all-time top scorers for tournaments (WC/Euro/Copa)
 * where ESPN has no live leaders endpoint.
 */
export function TopScorersPreviewCard({ comp }: { comp: Competition }) {
  const q = useQuery({
    queryKey: ["comp-leaders", comp.slug],
    queryFn: () => getCompetitionLeaders({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 60 * 60_000,
  });
  const cats = q.data?.categories ?? [];
  const scoring =
    cats.find((c) => /goal|scor/i.test(c.category) || /goal|scor/i.test(c.displayName)) ??
    cats[0];

  const seededAllTime = getCompetitionRecords(comp.slug)["top-scorers-all-time"] ?? [];
  const useSeed = !q.isLoading && (!scoring || scoring.leaders.length === 0);
  const heading = useSeed ? "All-time top scorers" : "Top scorers this season";

  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Goal className="size-4" /> {heading}
      </h3>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading leaders…
          </div>
        ) : useSeed ? (
          seededAllTime.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              All-time top scorers for {comp.shortName} coming soon.
            </div>
          ) : (
            <>
              <ol className="grid gap-2 sm:grid-cols-2">
                {seededAllTime.slice(0, 8).map((r, i) => {
                  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.title)}&background=0b1220&color=fff&bold=true&size=64`;
                  return (
                    <li
                      key={`${r.title}-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                    >
                      <span className="text-xs w-5 text-center tabular-nums text-muted-foreground">
                        {r.rank ?? i + 1}
                      </span>
                      <img
                        src={r.image ?? fallbackAvatar}
                        alt={r.title}
                        loading="lazy"
                        onError={(e) = decoding="async"> {
                          const img = e.currentTarget;
                          if (img.src !== fallbackAvatar) img.src = fallbackAvatar;
                        }}
                        className="size-8 rounded-full object-cover bg-white/10 ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{r.title}</div>
                        {r.context && (
                          <div className="text-[11px] text-muted-foreground truncate">{r.context}</div>
                        )}
                      </div>
                      <span className="text-sm font-black tabular-nums">{r.value}</span>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-3 text-xs text-muted-foreground">
                <Link
                  to="/football/$comp/records/$category"
                  params={{ comp: comp.slug, category: "top-scorers-all-time" }}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  See full {comp.shortName} all-time top scorers →
                </Link>
              </div>
            </>
          )
        ) : (
          <ol className="grid gap-2 sm:grid-cols-2">
            {scoring!.leaders.slice(0, 6).map((l) => (
              <li
                key={`${l.rank}-${l.athleteId ?? l.athlete}`}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <span className="text-xs w-5 text-center tabular-nums text-muted-foreground">
                  {l.rank}
                </span>
                {l.teamLogo ? (
                  <img src={l.teamLogo} alt="" className="size-6 rounded-full object-contain" loading="lazy"  decoding="async" />
                ) : (
                  <span className="size-6 rounded-full bg-white/10" />
                )}
                <div className="min-w-0 flex-1">
                  {l.athleteId ? (
                    <Link
                      to="/football/$comp/players/$playerId"
                      params={{ comp: comp.slug, playerId: l.athleteId }}
                      className="text-sm font-semibold truncate hover:underline"
                    >
                      {l.athlete}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold truncate">{l.athlete}</span>
                  )}
                  {l.team && (
                    <div className="text-[11px] text-muted-foreground truncate">{l.team}</div>
                  )}
                </div>
                <span className="text-sm font-black tabular-nums">{l.value}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
