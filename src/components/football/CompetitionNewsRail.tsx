import { useQuery } from "@tanstack/react-query";
import { getSportNews } from "@/lib/espn.functions";
import type { Competition } from "@/lib/competitions";
import { Newspaper, Loader2 } from "lucide-react";

/**
 * Horizontal news rail for a competition landing page.
 * Pulls the ESPN news feed for the competition's league path.
 */
export function CompetitionNewsRail({ comp }: { comp: Competition }) {
  const q = useQuery({
    queryKey: ["comp-news", comp.slug],
    queryFn: () =>
      getSportNews({ data: { sportPath: `soccer/${comp.espnLeague}`, limit: 12 } }),
    staleTime: 15 * 60_000,
  });
  const items = q.data?.items ?? [];
  if (!q.isLoading && items.length === 0) return null;

  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Newspaper className="size-4" /> {comp.shortName} News
      </h3>
      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading news…
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {items.map((n) => (
            <a
              key={n.id}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-64 sm:w-72 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition overflow-hidden"
            >
              {n.image ? (
                <img
                  src={n.image}
                  alt=""
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-white/5 to-white/[0.02]" />
              )}
              <div className="p-3">
                {n.category && (
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    {n.category}
                  </div>
                )}
                <div className="text-sm font-semibold line-clamp-3">{n.headline}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
