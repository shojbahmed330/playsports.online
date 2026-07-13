// Standard SEO head builder for leaf routes.
// Guarantees title, description, og:*, twitter:*, canonical, and optional breadcrumb JSON-LD.
import { canonical } from "./canonical";
import { breadcrumbList, ldScript } from "./jsonld";

export type Crumb = { name: string; path: string };

export type LeafHeadInput = {
  path: string;                 // "/nba/leaders"
  title: string;
  description: string;
  image?: string;               // absolute URL preferred
  type?: "website" | "article";
  breadcrumbs?: Crumb[];
  extraMeta?: Array<Record<string, string>>;
  extraScripts?: Array<{ type: string; children: string }>;
  extraLinks?: Array<Record<string, string>>;
  noindex?: boolean;
};

export function buildLeafHead(input: LeafHeadInput) {
  const {
    path, title, description, image, type = "website",
    breadcrumbs, extraMeta = [], extraScripts = [], extraLinks = [], noindex,
  } = input;
  const url = canonical(path);
  const desc = description.length > 158 ? description.slice(0, 155) + "..." : description;

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: desc },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: "PlaySports" },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: desc },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  meta.push(...extraMeta);

  const scripts = [...extraScripts];
  if (breadcrumbs && breadcrumbs.length) {
    scripts.unshift(ldScript(breadcrumbList(breadcrumbs)));
  }

  return {
    meta,
    links: [{ rel: "canonical", href: url }, ...extraLinks],
    scripts,
  };
}
