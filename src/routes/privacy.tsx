import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://allsportslive.lovable.app/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AllSportsLive" },
      { name: "description", content: "How AllSportsLive collects, uses, and protects your data, including AdSense, analytics, and newsletter sign-ups." },
      { property: "og:title", content: "Privacy Policy — AllSportsLive" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useLegalPage("legal_privacy");
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="How we collect, use, and protect your data."
      body={data?.body ?? ""}
      loading={isLoading}
    />
  );
}
