import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://allsportslive.lovable.app/disclaimer";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Editorial & Affiliate Disclosure — AllSportsLive" },
      { name: "description", content: "AllSportsLive's editorial standards and affiliate-link disclosure." },
      { property: "og:title", content: "Editorial & Affiliate Disclosure — AllSportsLive" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useLegalPage("legal_disclaimer");
  return (
    <LegalLayout
      title="Editorial & Affiliate Disclosure"
      intro="How we handle accuracy, sources, and partner links."
      body={data?.body ?? ""}
      loading={isLoading}
    />
  );
}
