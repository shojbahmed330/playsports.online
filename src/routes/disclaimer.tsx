import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://www.playsports.online/disclaimer";

const DEFAULT_BODY = `## Editorial standards
PlaySports aggregates publicly available sports data and highlights from trusted sources including ESPN, Sofascore, ESPNcricinfo Statsguru, FIFA, ICC, MLB, NBA, NHL, MLS and licensed YouTube highlight channels. We verify dates, scores and player names before publishing, but **live data can be delayed, incomplete or contain errors** — always cross-check with official sources before acting on anything you read here.

## No professional advice
Nothing on PlaySports constitutes betting, financial, medical, legal or fantasy-sports advice. Statistics, projections and bracket predictions are for **entertainment and information only**.

## Affiliate & advertising disclosure
PlaySports is supported by readers like you. Some links on this site are **affiliate links** — if you click and make a purchase or sign up, we may earn a commission **at no extra cost to you**. These partnerships never influence which scores, stats or matches we cover.

Our affiliate partners may include:
- **Amazon Associates** — books, gear, jerseys and merchandise.
- **Licensed sportsbooks** — odds, free-bet promos and welcome offers (where legally permitted).
- **Streaming services & VPN providers** — for legal access to live broadcasts.

We display **Google AdSense** ads to keep the site free. AdSense uses cookies and may show personalised ads based on your prior visits — see our **Privacy Policy** for details and opt-out instructions.

## Gambling disclosure (18+ / 21+)
Sportsbook and odds content is **strictly for adults of legal gambling age** in your jurisdiction. Gambling involves risk and can be addictive. If you or someone you know has a gambling problem, free confidential help is available:
- **GamCare** — gamcare.org.uk
- **BeGambleAware** — begambleaware.org
- **National Council on Problem Gambling (US)** — 1-800-GAMBLER

We geo-filter gambling promotions and never show them in jurisdictions where they are prohibited.

## Trademarks & rights
All team names, club crests, league logos, player likenesses, video clips and broadcast footage are the property of their respective owners. PlaySports is an independent fan platform and is **not affiliated with, endorsed by or sponsored by** FIFA, ICC, MLB, NBA, NHL, MLS, ESPN, Sofascore or any league, club, broadcaster or player.

## Takedown requests
If you are a rights holder and want content removed, email us via the **Contact** page. We respond within 48 hours.

## Corrections
Spotted a wrong score, lineup or stat? Tell us — we publish corrections quickly. Use the **Contact** form with the page URL and what's wrong.`;

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Editorial & Affiliate Disclosure — PlaySports" },
      { name: "description", content: "PlaySports's editorial standards, affiliate-link disclosure, AdSense notice and gambling-content policy." },
      { property: "og:title", content: "Editorial & Affiliate Disclosure — PlaySports" },
      { property: "og:description", content: "How PlaySports sources data, discloses affiliate links and handles advertising and gambling content." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Editorial & Affiliate Disclosure — PlaySports" },
      { name: "twitter:description", content: "PlaySports's editorial standards, affiliate-link disclosure, AdSense notice and gambling-content policy." },
    
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
      intro="How we source data, label partnerships and keep the site free."
      body={data?.body ?? ""}
      defaultBody={DEFAULT_BODY}
      loading={isLoading}
      updated="June 2026"
    />
  );
}
