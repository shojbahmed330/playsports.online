// JSON-LD builders. Keep outputs minimal and valid — schema.org tolerates
// partial entries; placeholder/empty fields hurt more than they help.
import { SITE_URL, canonical } from "./canonical";

type Crumb = { name: string; path: string };

const DEFAULT_EVENT_LOCATION = "Venue to be announced";
const DEFAULT_EVENT_IMAGE = canonical("/og/default/play-sports-event.svg");

function eventOrganizerName(sport: string) {
  if (/soccer|football/i.test(sport)) return "FIFA World Cup";
  if (/baseball/i.test(sport)) return "Major League Baseball";
  if (/basketball/i.test(sport)) return "National Basketball Association";
  if (/hockey/i.test(sport)) return "National Hockey League";
  if (/cricket/i.test(sport)) return "International Cricket";
  return "PlaySports";
}

function eventDescription(opts: {
  name: string;
  sport: string;
  startDate?: string;
  homeTeam?: string;
  awayTeam?: string;
  location?: string;
  status?: "scheduled" | "live" | "ended";
}) {
  const matchup = opts.homeTeam && opts.awayTeam ? `${opts.homeTeam} vs ${opts.awayTeam}` : opts.name;
  const statusText = opts.status === "ended" ? "final result and match details" : opts.status === "live" ? "live score and match details" : "schedule, live score and match details";
  const dateText = opts.startDate ? ` on ${opts.startDate.slice(0, 10)}` : "";
  const venueText = opts.location ? ` at ${opts.location}` : "";
  return `${matchup} ${statusText} for this ${opts.sport} event${dateText}${venueText} on PlaySports.`;
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: canonical(c.path),
    })),
  };
}

export function collectionPage(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: canonical(opts.path),
    isPartOf: { "@type": "WebSite", name: "PlaySports", url: SITE_URL },
  };
}

export function sportsEvent(opts: {
  name: string;
  path: string;
  sport: string;
  startDate?: string;
  homeTeam?: string;
  awayTeam?: string;
  location?: string;
  description?: string;
  status?: "scheduled" | "live" | "ended";
}) {
  const statusMap = {
    scheduled: "https://schema.org/EventScheduled",
    live: "https://schema.org/EventScheduled",
    ended: "https://schema.org/EventScheduled",
  } as const;
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: opts.name,
    description: opts.description ?? eventDescription(opts),
    url: canonical(opts.path),
    sport: opts.sport,
    image: DEFAULT_EVENT_IMAGE,
    location: {
      "@type": "Place",
      name: opts.location ?? DEFAULT_EVENT_LOCATION,
      address: opts.location ?? DEFAULT_EVENT_LOCATION,
    },
    organizer: {
      "@type": "SportsOrganization",
      name: eventOrganizerName(opts.sport),
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url: canonical(opts.path),
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: opts.startDate ?? new Date().toISOString(),
    },
  };
  if (opts.startDate) {
    node.startDate = opts.startDate;
    node.endDate = opts.startDate;
  }
  if (opts.status) node.eventStatus = statusMap[opts.status];
  if (opts.homeTeam) node.homeTeam = { "@type": "SportsTeam", name: opts.homeTeam };
  if (opts.awayTeam) node.awayTeam = { "@type": "SportsTeam", name: opts.awayTeam };
  const performers = [opts.homeTeam, opts.awayTeam]
    .filter((team): team is string => Boolean(team))
    .map((team) => ({ "@type": "SportsTeam", name: team }));
  node.performer = performers.length
    ? performers
    : { "@type": "SportsOrganization", name: eventOrganizerName(opts.sport) };
  return node;
}

export function athlete(opts: { name: string; path: string; sport: string; team?: string; image?: string }) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    additionalType: "https://schema.org/SportsPerson",
    name: opts.name,
    url: canonical(opts.path),
    knowsAbout: opts.sport,
  };
  if (opts.image) node.image = opts.image;
  if (opts.team) node.memberOf = { "@type": "SportsTeam", name: opts.team };
  return node;
}

export function sportsTeam(opts: { name: string; path: string; sport: string; league?: string; logo?: string }) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: opts.name,
    url: canonical(opts.path),
    sport: opts.sport,
  };
  if (opts.logo) node.logo = opts.logo;
  if (opts.league) node.memberOf = { "@type": "SportsOrganization", name: opts.league };
  return node;
}

export function faqPage(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function itemList(opts: { name: string; path: string; items: Array<{ name: string; path: string }> }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    url: canonical(opts.path),
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: canonical(it.path),
    })),
  };
}

export function sportsOrganization(opts: { name: string; path: string; sport: string; logo?: string }) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: opts.name,
    url: canonical(opts.path),
    sport: opts.sport,
  };
  if (opts.logo) node.logo = opts.logo;
  return node;
}

export function videoObject(opts: {
  name: string;
  description: string;
  path: string;
  thumbnailUrl: string;
  uploadDate: string;
  embedUrl?: string;
  contentUrl?: string;
  duration?: string;
}) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: opts.thumbnailUrl,
    uploadDate: opts.uploadDate,
    url: canonical(opts.path),
  };
  if (opts.embedUrl) node.embedUrl = opts.embedUrl;
  if (opts.contentUrl) node.contentUrl = opts.contentUrl;
  if (opts.duration) node.duration = opts.duration;
  return node;
}

// Article + Speakable — optimized for Google AI Overviews / ChatGPT citations.
// Speakable marks the passages voice assistants read aloud; Article carries the
// citation-friendly metadata (author, dates, publisher).
export function articlePage(opts: {
  headline: string;
  description: string;
  path: string;
  type?: "Article" | "NewsArticle";
  datePublished?: string;
  dateModified?: string;
  image?: string;
  author?: string;
  wordCount?: number;
  articleSection?: string;
  keywords?: string[];
  speakableSelectors?: string[];
}) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": opts.type ?? "Article",
    headline: opts.headline.slice(0, 110),
    description: opts.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical(opts.path) },
    url: canonical(opts.path),
    inLanguage: "en",
    author: { "@type": "Organization", name: opts.author ?? "PlaySports Editorial" },
    publisher: {
      "@type": "Organization",
      name: "PlaySports",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    },
  };
  if (opts.datePublished) node.datePublished = opts.datePublished;
  if (opts.dateModified) node.dateModified = opts.dateModified;
  if (opts.image) node.image = opts.image;
  if (opts.wordCount) node.wordCount = opts.wordCount;
  if (opts.articleSection) node.articleSection = opts.articleSection;
  if (opts.keywords?.length) node.keywords = opts.keywords.join(", ");
  const selectors = opts.speakableSelectors ?? ["h1", "[data-speakable]"];
  node.speakable = {
    "@type": "SpeakableSpecification",
    cssSelector: selectors,
  };
  return node;
}

export function howTo(opts: {
  name: string;
  description: string;
  path: string;
  steps: Array<{ name: string; text: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: canonical(opts.path),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function ldScript(data: unknown) {
  return { type: "application/ld+json" as const, children: JSON.stringify(data) };
}



