import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import data from "@/data/nhl/history.json";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/nhl/history")({
  head: () => ({
    meta: [
      { title: "NHL Championship History — Every Finals Winner" },
      { name: "description", content: "Complete list of NHL Finals champions, runners-up, results, and Finals MVPs across the modern era." },
      { property: "og:url", content: "https://www.playsports.online/nhl/history" },
      { property: "og:title", content: "NHL Championship History — Every Finals Winner" },
      { property: "og:description", content: "Complete list of NHL Finals champions, runners-up, results, and Finals MVPs across the modern era." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NHL Championship History — Every Finals Winner" },
      { name: "twitter:description", content: "Complete list of NHL Finals champions, runners-up, results, and Finals MVPs across the modern era." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nhl/history" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NHL", path: "/nhl" }, { name: "History", path: "/nhl/history" }]))],
  }),
  component: withHubLinks(NhlHistory, { sport: "nhl", currentPath: "/nhl/history" }),
});

function NhlHistory() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl ring-1 ring-border bg-card overflow-hidden p-6 bg-gradient-to-br from-[#041e42]/30 via-transparent to-[#c8102e]/15">
        <div className="flex items-center gap-3">
          <Trophy className="size-7 text-orange-300" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-orange-300 font-bold">Hall of Champions</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">NHL Finals History</h1>
            <p className="text-xs text-muted-foreground mt-1">Larry O'Brien Trophy winners, runners-up & Finals MVPs.</p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 pl-3 w-24">Season</th>
                <th className="text-left">Champion</th>
                <th className="text-center w-16">Result</th>
                <th className="text-left">Runner-Up</th>
                <th className="text-left">Finals MVP</th>
              </tr>
            </thead>
            <tbody>
              {data.champions.map((row: any) => (
                <tr key={row.season} className="border-b border-border/40 hover:bg-white/[0.03]">
                  <td className="py-2 pl-3 font-bold text-orange-300 tabular-nums">{row.season}</td>
                  <td className="text-white font-semibold">{row.champion}</td>
                  <td className="text-center tabular-nums text-muted-foreground">{row.result}</td>
                  <td className="text-muted-foreground">{row.runnerUp}</td>
                  <td className="text-gray-200">{row.fmvp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
