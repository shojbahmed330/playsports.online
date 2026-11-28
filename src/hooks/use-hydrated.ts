import { useEffect, useState } from "react";

/**
 * False during SSR and the hydration render, true only after hydration.
 * The state flip is deferred by one macrotask: setting it directly inside the
 * effect can run before React has finished hydrating concurrent trees, which
 * produces a text/HTML mismatch for time labels and count badges.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setHydrated(true), 500);
    return () => window.clearTimeout(id);
  }, []);

  return hydrated;
}
