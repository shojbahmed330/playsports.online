import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMlsLeaders } from "@/lib/mls.functions";
import { MlsLeaderBoard } from "@/components/mls/MlsLeaderBoard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/mls/leaders")({
  head: () => ({
    meta: [
      { title: "MLS Leaders — Points, Assists, Rebounds, Steals, Blocks" },
      { name: "description", content: "MLS statistical leaders across scoring, playmaking, rebounding and defense. Updated daily from ESPN's feed." },
      { property: "og:url", content: "https://www.playsports.online/mls/leaders" },
      { property: "og:title", content: "MLS Leaders — Points, Assists, Rebounds, Steals, Blocks" },
      { property: "og:description", content: "MLS statistical leaders across scoring, playmaking, rebounding and defense. Updated daily from ESPN's feed." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLS Leaders — Points, Assists, Rebounds, Steals, Blocks" },
      { name: "twitter:description", content: "MLS statistical leaders across scoring, playmaking, rebounding and defense. Updated daily from ESPN's feed." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mls/leaders" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLS", path: "/mls" }, { name: "Leaders", path: "/mls/leaders" }]))],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["mls", "ld"],
      queryFn: () => getMlsLeaders({ data: {} }),
      staleTime: 60 * 60_000,
    }).catch(() => null);
    return null;
  },
  component: withHubLinks(MlsLeaders, { sport: "mls", currentPath: "/mls/leaders" }),
});

type Group = "offensive" | "defensive" | "general";

function MlsLeaders() {
  const fn = useServerFn(getMlsLeaders);
  const q = useQuery({ queryKey: ["mls", "ld"], queryFn: () => fn({ data: {} }), staleTime: 60 * 60_000 });
  const [group, setGroup] = useState<Group>("offensive");

  if (q.isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)}
      </div>
    );
  }
  const cats = (q.data?.[group] ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-card ring-1 ring-border p-1">
          {(["offensive", "defensive", "general"] as Group[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition capitalize ${
                group === g ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/40" : "text-muted-foreground hover:text-white"
              }`}
            >{g}</button>
          ))}
        </div>
        {q.data?.season && <div className="text-xs text-muted-foreground">Season: <span className="text-white font-bold">{q.data.season}</span></div>}
      </div>
      {cats.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">No leaders available for this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cats.map((c) => <MlsLeaderBoard key={c.key} category={c} />)}
        </div>
      )}
    </div>
  );
}
