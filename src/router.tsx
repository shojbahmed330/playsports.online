import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

// TanStack's default search serialiser JSON-encodes every value, which turns
// `?leagueId=8043` into `?leagueId=%228043%22`. Parse both forms (old links keep
// working) and write plain scalar values for clean, shareable URLs.
function parseSearch(search: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (value === "true" || value === "false") {
      result[key] = value === "true";
    } else if (value.startsWith("[") || value.startsWith("{") || value.startsWith('"')) {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    } else {
      // Keep plain values as strings; schemas that need numbers use coerce.
      result[key] = value;
    }
  }
  return result;
}

function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    parseSearch,
    stringifySearch,
  });

  // Dehydrate loader-prefetched queries on the server and hydrate them on the
  // client so the first client render matches the SSR HTML.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
