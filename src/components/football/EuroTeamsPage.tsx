import { useState } from "react";
import { requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { EuroTeamsHero } from "@/components/football/EuroTeamsHero";
import { EuroChampionsRail } from "@/components/football/EuroChampionsRail";
import { EuroConfederationFilter } from "@/components/football/EuroConfederationFilter";
import { EuroNationsGrid } from "@/components/football/EuroNationsGrid";
import { EuroHostsMap } from "@/components/football/EuroHostsMap";
import { EuroTeamsJumpBar } from "@/components/football/EuroTeamsJumpBar";
import type { EuroTeamsFilter } from "@/lib/euro-teams";

export function EuroTeamsPage() {
  const comp = requireCompetition("euro");
  const [filter, setFilter] = useState<EuroTeamsFilter>("all");

  return (
    <CompetitionPageShell comp={comp}>
      <EuroTeamsHero />
      <EuroChampionsRail />
      <EuroConfederationFilter value={filter} onChange={setFilter} />
      <EuroNationsGrid filter={filter} />
      <EuroHostsMap />
      <div className="h-16 sm:hidden" aria-hidden />
      <EuroTeamsJumpBar />
    </CompetitionPageShell>
  );
}
