import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://allsportslive.lovable.app/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AllSportsLive" },
      { name: "description", content: "AllSportsLive delivers live scores, stats, and the complete FIFA World Cup archive across major global sports." },
      { property: "og:title", content: "About AllSportsLive" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useLegalPage("legal_about");
  return (
    <LegalLayout
      title="About AllSportsLive"
      intro="Our mission, data sources, and the team behind the scores."
      body={data?.body ?? ""}
      loading={isLoading}
    />
  );
}
