// HOC that appends a HubInternalLinks block to any page component.
// Keeps existing routes untouched — one-line change on the route's
// `component:` field wires internal linking into every hub.

import type { ComponentType } from "react";
import { HubInternalLinks } from "./HubInternalLinks";

type SportKey = "nba" | "mlb" | "nhl" | "mls" | "cricket" | "football" | "ipl" | "live";

export function withHubLinks<P extends object>(
  Inner: ComponentType<P>,
  opts: { sport: SportKey; currentPath?: string; title?: string; showPopular?: boolean },
): ComponentType<P> {
  const Wrapped = (props: P) => (
    <>
      <Inner {...props} />
      <HubInternalLinks
        sport={opts.sport}
        currentPath={opts.currentPath}
        title={opts.title}
        showPopular={opts.showPopular}
      />
    </>
  );
  Wrapped.displayName = `withHubLinks(${Inner.displayName || Inner.name || "Component"})`;
  return Wrapped;
}
