import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://allsportslive.lovable.app/terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AllSportsLive" },
      { name: "description", content: "The terms that govern use of AllSportsLive." },
      { property: "og:title", content: "Terms of Service — AllSportsLive" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useLegalPage("legal_terms");
  return (
    <LegalLayout
      title="Terms of Service"
      intro="The rules for using AllSportsLive."
      body={data?.body ?? ""}
      loading={isLoading}
    />
  );
}
