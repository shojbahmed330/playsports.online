// JSON-LD builders. Keep outputs minimal and valid — schema.org tolerates
// partial entries; placeholder/empty fields hurt more than they help.
import { SITE_URL, canonical } from "./canonical";

type Crumb = { name: string; path: string };

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
    url: canonical(opts.path),
    sport: opts.sport,
  };
  if (opts.startDate) node.startDate = opts.startDate;
  if (opts.status) node.eventStatus = statusMap[opts.status];
  if (opts.homeTeam) node.homeTeam = { "@type": "SportsTeam", name: opts.homeTeam };
  if (opts.awayTeam) node.awayTeam = { "@type": "SportsTeam", name: opts.awayTeam };
  if (opts.location) node.location = { "@type": "Place", name: opts.location };
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

export function ldScript(data: unknown) {
  return { type: "application/ld+json" as const, children: JSON.stringify(data) };
}


