import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://allsportslive.lovable.app/terms";

const DEFAULT_BODY = `## Acceptance
By accessing or using AllSportsLive (the "Service"), you agree to these Terms of Service. If you don't agree, please don't use the Service.

## What we provide
AllSportsLive is a free, ad-supported aggregator of publicly available sports data, video highlights and editorial content. The Service is provided **"as is"** without warranties of any kind, express or implied.

## Acceptable use
You agree **not** to:
- Scrape, crawl or harvest the site at a rate that disrupts service for others.
- Reverse engineer, decompile or attempt to extract source code.
- Use the Service for any unlawful purpose or to infringe any third party's rights.
- Republish full data feeds, leaderboards or video metadata as your own without attribution.

## Third-party content
Scores, lineups, statistics, video clips and channel logos belong to their respective owners (FIFA, ICC, MLB, NBA, NHL, MLS, ESPN, Sofascore, official broadcasters, and others). AllSportsLive displays this content under fair-use, public-API and embed-permission terms. If you are a rights holder and want content removed, contact us — we respond within 48 hours.

## Accounts
Most features require no account. Newsletter sign-ups require a valid email address. You are responsible for keeping any credentials safe.

## Advertising & affiliate links
The Service is supported by Google AdSense and affiliate partnerships (including Amazon Associates and licensed sportsbook/gambling partners where legally permitted). Outbound affiliate links may earn us a commission at no extra cost to you. See our **Disclaimer**.

## Gambling content
Where shown, sportsbook and odds-related content is **18+ only** (21+ in some jurisdictions) and is filtered by region to comply with local law. Gamble responsibly — visit **begambleaware.org** for help.

## Intellectual property
The AllSportsLive name, logo, original editorial text, code and UI design are owned by AllSportsLive. You may share short excerpts with credit and a link back, but bulk reproduction requires written permission.

## Disclaimers & limitation of liability
The Service may contain errors, omissions or delays. To the maximum extent permitted by law, AllSportsLive is **not liable** for any direct, indirect, incidental or consequential damages arising from your use of the Service — including financial losses based on scores, odds or stats shown here.

## Termination
We may suspend or terminate access for any user who violates these Terms or applicable law.

## Changes
We may update these Terms as the platform evolves. Continued use after changes constitutes acceptance.

## Governing law
These Terms are governed by the laws of the country in which the Service is operated, without regard to conflict-of-law principles.

## Contact
Questions about these Terms? Reach us via the **Contact** page.`;

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AllSportsLive" },
      { name: "description", content: "The terms that govern use of AllSportsLive — acceptable use, third-party content, advertising, gambling content and liability." },
      { property: "og:title", content: "Terms of Service — AllSportsLive" },
      { property: "og:description", content: "Plain-language terms for using AllSportsLive's scores, archive and editorial content." },
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
      intro="The rules for using AllSportsLive — written in plain language."
      body={data?.body ?? ""}
      defaultBody={DEFAULT_BODY}
      loading={isLoading}
      updated="June 2026"
    />
  );
}
