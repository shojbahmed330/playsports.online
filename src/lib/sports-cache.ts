/**
 * Universal sports-data cache backed by the `sports_data_cache` Supabase table.
 *
 * Read/write path:
 *   1. Look up `cache_key` in Supabase.
 *   2. If present AND (`is_archived` OR not expired) → return payload.
 *   3. Otherwise call the provided `fetcher()` (usually ESPN), write result
 *      back to Supabase, return it.
 *   4. If `fetcher()` throws, fall back to any stale row so the site stays up.
 *
 * Archived rows are frozen historical snapshots — they NEVER expire and are
 * NEVER refetched. Use `archive_sports_cache(prefix)` (server-only RPC) to
 * archive a tournament/season when it ends.
 *
 * This module is client-safe: `supabaseAdmin` is dynamically imported inside
 * the function, so route/component bundles never pull the service-role key.
 */

export type CachedResult<T> = {
  data: T;
  fetchedAt: number;
  fromCache: boolean;
  stale: boolean;
};

export type CacheOptions = {
  /** Unique key. Convention: `<source>:<sport>:<category>:<scope>` */
  key: string;
  /** e.g. "football" | "cricket" | "mlb" | "nba" | "nhl" | "mls" | "ipl" */
  sport: string;
  /** e.g. "scorers" | "cards" | "fixtures" | "standings" | "stats" | "match" */
  category: string;
  /** TTL in milliseconds. Live match data = short (~20s), season stats = long (~1h). */
  ttlMs: number;
  /** Data source label (default "espn"). */
  source?: string;
};

const memoryFallback = new Map<
  string,
  { data: unknown; fetchedAt: number; expiresAt: number }
>();

async function getSupabaseAdmin() {
  // The generated client throws on first property access when the service
  // role key is missing. Check first so local/dev and preview environments
  // fall back to the in-memory cache instead of failing every ESPN request.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    const mod = await import("@/integrations/supabase/client.server");
    return mod.supabaseAdmin;
  } catch (err) {
    // If the admin client isn't available (e.g. missing env in some contexts),
    // we degrade to memory-only cache.
    console.warn("[sports-cache] supabaseAdmin unavailable, using memory only:", err);
    return null;
  }
}

/**
 * Read from cache; fetch + persist on miss/expiry. Falls back to stale data
 * (Supabase, then memory) if the upstream fetch fails.
 */
export async function getCachedOrFetch<T>(
  opts: CacheOptions,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T>> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const expiresIso = new Date(now + opts.ttlMs).toISOString();
  const source = opts.source ?? "espn";

  const supabaseAdmin = await getSupabaseAdmin();

  // 1) Try Supabase cache
  let stale: { payload: T; fetchedAt: number } | null = null;
  if (supabaseAdmin) {
    const { data: row, error } = await supabaseAdmin
      .from("sports_data_cache")
      .select("payload, fetched_at, expires_at, is_archived")
      .eq("cache_key", opts.key)
      .maybeSingle();

    if (!error && row) {
      const fetchedAt = new Date(row.fetched_at).getTime();
      const expiresAt = new Date(row.expires_at).getTime();
      if (row.is_archived || expiresAt > now) {
        return {
          data: row.payload as T,
          fetchedAt,
          fromCache: true,
          stale: false,
        };
      }
      stale = { payload: row.payload as T, fetchedAt };
    }
  } else {
    const mem = memoryFallback.get(opts.key);
    if (mem && mem.expiresAt > now) {
      return { data: mem.data as T, fetchedAt: mem.fetchedAt, fromCache: true, stale: false };
    }
    if (mem) stale = { payload: mem.data as T, fetchedAt: mem.fetchedAt };
  }

  // 2) Fetch fresh
  try {
    const fresh = await fetcher();

    // 3) Persist (best-effort)
    if (supabaseAdmin) {
      const { error: upsertErr } = await supabaseAdmin
        .from("sports_data_cache")
        .upsert(
          {
            cache_key: opts.key,
            sport: opts.sport,
            category: opts.category,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            payload: fresh as any,
            fetched_at: nowIso,
            expires_at: expiresIso,
            source,
          },
          { onConflict: "cache_key" },
        );
      if (upsertErr) console.warn("[sports-cache] upsert failed:", upsertErr.message);
    }
    memoryFallback.set(opts.key, { data: fresh, fetchedAt: now, expiresAt: now + opts.ttlMs });

    return { data: fresh, fetchedAt: now, fromCache: false, stale: false };
  } catch (err) {
    // 4) Upstream failed — return stale if we have it
    if (stale) {
      console.warn(
        `[sports-cache] upstream failed for ${opts.key}, serving stale (${Math.round((now - stale.fetchedAt) / 1000)}s old):`,
        err,
      );
      return { data: stale.payload, fetchedAt: stale.fetchedAt, fromCache: true, stale: true };
    }
    throw err;
  }
}

/** Convenience wrapper: returns just the data (no metadata). */
export async function cachedFetch<T>(
  opts: CacheOptions,
  fetcher: () => Promise<T>,
): Promise<T> {
  const res = await getCachedOrFetch(opts, fetcher);
  return res.data;
}
