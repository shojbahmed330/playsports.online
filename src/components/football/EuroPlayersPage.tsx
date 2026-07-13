import { requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { EuroPlayersHero } from "@/components/football/EuroPlayersHero";
import { EuroPlayerLeaderboards } from "@/components/football/EuroPlayerLeaderboards";
import { EuroGoldenBootTimeline } from "@/components/football/EuroGoldenBootTimeline";
import { EuroLegendsRail } from "@/components/football/EuroLegendsRail";
import { EuroSquadOfTournament2024 } from "@/components/football/EuroSquadOfTournament2024";
import { EuroRisingStars } from "@/components/football/EuroRisingStars";
import { EuroPlayerCategoryGrid } from "@/components/football/EuroPlayerCategoryGrid";
import { EuroPlayersJumpBar } from "@/components/football/EuroPlayersJumpBar";

export function EuroPlayersPage() {
  const comp = requireCompetition("euro");
  return (
    <CompetitionPageShell comp={comp}>
      <EuroPlayersHero />
      <EuroPlayerLeaderboards />
      <EuroGoldenBootTimeline />
      <EuroLegendsRail />
      <EuroSquadOfTournament2024 />
      <EuroRisingStars />
      <EuroPlayerCategoryGrid />
      <div className="h-16 sm:hidden" aria-hidden />
      <EuroPlayersJumpBar />
    </CompetitionPageShell>
  );
}
