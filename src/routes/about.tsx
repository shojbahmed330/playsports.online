import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useLegalPage } from "@/lib/site-settings";

const URL = "https://www.playsports.online/about";

const DEFAULT_BODY = `## What is PlaySports?
PlaySports is a single home for live scores, fixtures, lineups, statistics and historical archives across the world's biggest sports — football, cricket, baseball (MLB), basketball (NBA), ice hockey (NHL) and soccer (MLS). One tab, every scoreboard.

## What you'll find here
- **Live match centre** — Real-time scores, goal/wicket events, lineups and timelines that refresh automatically.
- **FIFA World Cup archive** — Curated full-match videos and metadata from 1998 through 2026, plus all-time scorer and discipline leaderboards.
- **Player profiles** — Tap any name to open career stats, recent form and tournament history — no jumps to third-party sites.
- **Today's slate** — A cross-sport agenda of what's on in your local timezone, detected automatically.
- **Predictive brackets** — Auto-generated knockout matrices for FIFA tournaments through 2034.

## Where our data comes from
We aggregate official and well-known public feeds — ESPN, Sofascore, ESPNcricinfo Statsguru, FIFA, and curated highlight channels — and normalise everything into one consistent UI. Sources are credited where applicable.

## Built for fans, on every device
PlaySports is mobile-first. Sticky controls, swipe gestures, a bottom tab bar and an optional "My Teams" shortcut keep the matches you care about one tap away.

## Independence
We are an independent fan project. We are not affiliated with FIFA, ICC, MLB, NBA, NHL, MLS or any league or broadcaster. All trademarks belong to their respective owners.

## Get in touch
Found a bug, missing fixture, or want to partner with us? Visit our **Contact** page — we read every message.`;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PlaySports — Live Scores & Sports Archive" },
      { name: "description", content: "PlaySports delivers live scores, player stats and the complete FIFA World Cup archive across football, cricket, MLB, NBA, NHL and MLS." },
      { property: "og:title", content: "About PlaySports" },
      { property: "og:description", content: "One home for live scores, fixtures, lineups and historical archives across the world's biggest sports." },
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
      title="About PlaySports"
      intro="One scoreboard for every sport — built by fans, for fans."
      body={data?.body ?? ""}
      defaultBody={DEFAULT_BODY}
      loading={isLoading}
    />
  );
}
