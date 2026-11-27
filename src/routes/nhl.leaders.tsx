import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getNhlLeaders } from "@/lib/nhl.functions";
import { NhlLeaderBoard } from "@/components/nhl/NhlLeaderBoard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/nhl/leaders")({
  head: () => ({
    meta: [
      { title: "NHL Leaders — Points, Assists, Rebounds, Steals, Blocks" },
      {
        name: "description",
        content:
          "NHL statistical leaders across scoring, playmaking, rebounding and defense. Updated daily from ESPN's feed.",
      },
      { property: "og:url", content: "https://www.playsports.online/nhl/leaders" },
      { property: "og:title", content: "NHL Leaders — Points, Assists, Rebounds, Steals, Blocks" },
      {
        property: "og:description",
        content:
          "NHL statistical leaders across scoring, playmaking, rebounding and defense. Updated daily from ESPN's feed.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NHL Leaders — Points, Assists, Rebounds, Steals, Blocks" },
      {
        name: "twitter:description",
        content:
          "NHL statistical leaders across scoring, playmaking, rebounding and defense. Updated daily from ESPN's feed.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nhl/leaders" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "NHL", path: "/nhl" },
          { name: "Leaders", path: "/nhl/leaders" },
        ]),
      ),
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient
      .prefetchQuery({
        queryKey: ["nhl", "ld"],
        queryFn: () => getNhlLeaders({ data: {} }),
        staleTime: 60 * 60_000,
      })
      .catch(() => null);
    return null;
  },
  component: withHubLinks(NhlLeaders, { sport: "nhl", currentPath: "/nhl/leaders" }),
});

type Group = "offensive" | "defensive" | "general";

function NhlLeaders() {
  const fn = useServerFn(getNhlLeaders);
  const q = useQuery({
    queryKey: ["nhl", "ld"],
    queryFn: () => fn({ data: {} }),
    staleTime: 60 * 60_000,
  });
  const [group, setGroup] = useState<Group>("offensive");

  if (q.isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        role="status"
        aria-label="Loading NHL leaders"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl ring-1 ring-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }
  if (q.error) {
    return (
      <ErrorState
        title="Could not load NHL leaders"
        message={errorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  }
  const cats = q.data?.[group] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-card ring-1 ring-border p-1">
          {(["offensive", "defensive", "general"] as Group[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              aria-pressed={group === g}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                group === g
                  ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {q.data?.season && (
          <div className="text-xs text-muted-foreground">
            Season: <span className="font-bold text-foreground">{q.data.season}</span>
          </div>
        )}
      </div>
      {cats.length === 0 ? (
        <EmptyState
          title="No leaders in this category"
          description="Try another group or check back later."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cats.map((c) => (
            <NhlLeaderBoard key={c.key} category={c} />
          ))}
        </div>
      )}
    </div>
  );
}
