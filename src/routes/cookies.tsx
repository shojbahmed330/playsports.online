import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://www.playsports.online/cookies";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — PlaySports" },
      { name: "description", content: "What cookies PlaySports uses and how to manage them." },
      { property: "og:title", content: "Cookie Policy — PlaySports" },
      { property: "og:url", content: URL },
      { property: "og:description", content: "What cookies PlaySports uses and how to manage them." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cookie Policy — PlaySports" },
      { name: "twitter:description", content: "What cookies PlaySports uses and how to manage them." },
    
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useLegalPage("legal_cookies");
  const openConsent = () => window.dispatchEvent(new CustomEvent("asl:consent-open"));
  return (
    <LegalLayout
      title="Cookie Policy"
      intro="What cookies we use, why we use them, and how to manage your choices."
      body={data?.body ?? ""}
      loading={isLoading}
    >
      <div className="mt-6">
        <button
          onClick={openConsent}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400"
        >
          Manage cookie preferences
        </button>
      </div>
    </LegalLayout>
  );
}
