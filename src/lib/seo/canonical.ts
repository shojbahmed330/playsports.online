// Central SEO URL helper. Single source of truth for the project's canonical origin.
export const SITE_URL = "https://www.playsports.online";

export function canonical(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return SITE_URL + path;
}
