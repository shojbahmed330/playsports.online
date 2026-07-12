import type { Competition } from "@/lib/competitions";
import { formatSeasonLabel } from "@/lib/competitions";
import {
  breadcrumbList,
  collectionPage,
  sportsOrganization,
  ldScript,
} from "@/lib/seo/jsonld";

const BASE_URL = "https://www.playsports.online";

/**
 * Build a consistent `head()` payload for any competition sub-route.
 * Callers only need the loaded competition + a section label ("Scores").
 */
export function buildCompetitionHead({
  comp,
  section,
  path,
  descriptionOverride,
}: {
  comp: Competition;
  section: string;
  path: string;
  descriptionOverride?: string;
}) {
  const season = formatSeasonLabel(comp, comp.currentSeason);
  const title = `${comp.name} ${section} ${season} — PlaySports`;
  const description =
    descriptionOverride ??
    `${comp.name} ${section.toLowerCase()} for the ${season} season — live updates, team-by-team detail and complete archive.`;
  const url = `${BASE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      ldScript(collectionPage({ name: title, description, path })),
      ldScript(sportsOrganization({ name: comp.name, path, sport: "Football" })),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: comp.shortName, path: `/football/${comp.slug}` },
          { name: section, path },
        ]),
      ),
    ],
  };
}
