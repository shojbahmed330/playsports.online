import { requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { EuroRecordsHero } from "@/components/football/EuroRecordsHero";
import { EuroRecordsLeaderboardTeaser } from "@/components/football/EuroRecordsLeaderboardTeaser";
import { EuroGoldenBootTimeline } from "@/components/football/EuroGoldenBootTimeline";
import { EuroRecordBook } from "@/components/football/EuroRecordBook";
import { EuroTitleRace } from "@/components/football/EuroTitleRace";
import { EuroRecordsCategoryGrid } from "@/components/football/EuroRecordsCategoryGrid";
import { EuroOnThisDayRecord } from "@/components/football/EuroOnThisDayRecord";
import { EuroRecordsJumpBar } from "@/components/football/EuroRecordsJumpBar";

/** Composition root for /football/euro/records. */
export function EuroRecordsPage() {
  const comp = requireCompetition("euro");
  return (
    <CompetitionPageShell comp={comp}>
      <EuroRecordsHero />
      <EuroRecordsLeaderboardTeaser />
      <EuroGoldenBootTimeline />
      <EuroRecordBook />
      <EuroTitleRace />
      <EuroRecordsCategoryGrid />
      <EuroOnThisDayRecord />
      <div className="h-16 sm:hidden" aria-hidden />
      <EuroRecordsJumpBar />
    </CompetitionPageShell>
  );
}
