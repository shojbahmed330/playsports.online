import { requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CopaRecordsHero } from "@/components/football/CopaRecordsHero";
import { CopaRecordsLeaderboardTeaser } from "@/components/football/CopaRecordsLeaderboardTeaser";
import { CopaRecordBook } from "@/components/football/CopaRecordBook";
import { CopaTitleRace } from "@/components/football/CopaTitleRace";
import { CopaRecordsCategoryGrid } from "@/components/football/CopaRecordsCategoryGrid";
import { CopaOnThisDayRecord } from "@/components/football/CopaOnThisDayRecord";
import { CopaLegendsStrip } from "@/components/football/CopaLegendsStrip";
import { CopaRecordsJumpBar } from "@/components/football/CopaRecordsJumpBar";

/** Composition root for /football/copa-america/records. */
export function CopaRecordsPage() {
  const comp = requireCompetition("copa-america");
  return (
    <CompetitionPageShell comp={comp}>
      <CopaRecordsHero />
      <CopaRecordsLeaderboardTeaser />
      <CopaRecordBook />
      <CopaTitleRace />
      <CopaRecordsCategoryGrid />
      <CopaOnThisDayRecord />
      <CopaLegendsStrip />
      <div className="h-16 sm:hidden" aria-hidden />
      <CopaRecordsJumpBar />
    </CompetitionPageShell>
  );
}
