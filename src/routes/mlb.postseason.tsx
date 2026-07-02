import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlbPostseason } from "@/lib/mlb.functions";
import { currentSeason } from "@/lib/tournament-config";
import { MlbPostseasonBracket } from "@/components/mlb/MlbPostseasonBracket";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mlb/postseason")({
  head: () => ({
    meta: [
      { title: "MLB Postseason Bracket — Wild Card, ALDS/NLDS, ALCS/NLCS, World Series" },
      { name: "description", content: "Live MLB playoff bracket: Wild Card, Division Series, League Championship, and World Series with series scores and game-by-game results." },
      { property: "og:title", content: "MLB Postseason Bracket" },
      { property: "og:description", content: "Wild Card → Division Series → LCS → World Series with live updates." },
      { property: "og:url", content: "https://www.playsports.online/mlb/postseason" },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/postseason" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLB", path: "/mlb" }, { name: "Postseason", path: "/mlb/postseason" }]))],
  }),
  component: PostseasonPage,
});

const CURRENT = currentSeason("mlb");
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT - i);

function PostseasonPage() {
  const fetcher = useServerFn(getMlbPostseason);
  const [year, setYear] = useState<number>(CURRENT);

  const { data, isLoading } = useQuery({
    queryKey: ["mlb-postseason", year],
    queryFn: () => fetcher({ data: { year } }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Postseason Bracket</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wild Card → Division Series → LCS → World Series
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg bg-card ring-1 ring-border px-3 py-2 text-sm font-bold text-white"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </header>

      {isLoading ? (
        <div className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading {year} postseason…
        </div>
      ) : (
        <MlbPostseasonBracket series={data?.series ?? []} />
      )}
    </div>
  );
}
