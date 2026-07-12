import type { ReactNode } from "react";
import { SportNav } from "@/components/sports/SportNav";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { FootballHubSwitcher } from "@/components/football/FootballHubSwitcher";
import { CompetitionHero } from "@/components/football/CompetitionHero";
import { CompetitionSubNav } from "@/components/football/CompetitionSubNav";
import type { Competition } from "@/lib/competitions";

/**
 * Shared chrome for every `/football/<comp>/*` route.
 * Renders SportNav, hub switcher, breadcrumbs, hero and sub-nav then children.
 */
export function CompetitionPageShell({
  comp,
  liveCount = 0,
  todayCount = 0,
  nextLabel,
  children,
}: {
  comp: Competition;
  liveCount?: number;
  todayCount?: number;
  nextLabel?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <FootballHubSwitcher activeSlug={comp.slug} />
      <Breadcrumbs />
      <CompetitionHero
        comp={comp}
        liveCount={liveCount}
        todayCount={todayCount}
        nextLabel={nextLabel}
      />
      <CompetitionSubNav comp={comp} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
