import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Trophy,
  Loader2,
  LogOut,
  Search,
  ChevronDown,
  Save,
  Check,
  Filter,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Command,
} from "lucide-react";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { supabase, WC_YEARS, type WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { useAuth } from "@/hooks/use-auth";
import { detectVideoType } from "@/components/wc/VideoPlayer";
import { toast } from "sonner";
import videoSeed from "@/data/wc_video_seed.json";
import groupMatchesData from "@/data/wc_group_matches.json";
import { AdSenseAdminCard } from "@/components/admin/AdSenseAdminCard";
import { MonetizationCard } from "@/components/admin/MonetizationCard";
import { getWc2026Fixtures } from "@/lib/wc2026.functions";
import { fetch2026VideoMap, set2026Video, videoKey } from "@/lib/wc-2026-videos";
import { Wc2026HighlightsCard } from "@/components/admin/Wc2026HighlightsCard";
import { AffiliateLinksCard } from "@/components/admin/AffiliateLinksCard";
import { SponsoredSlotsCard } from "@/components/admin/SponsoredSlotsCard";
import { NewsletterDigestCard } from "@/components/admin/NewsletterDigestCard";
import { MembershipsCard } from "@/components/admin/MembershipsCard";
import { CryptoPaymentsCard } from "@/components/admin/CryptoPaymentsCard";
import { AdminSidebar, type AdminSection } from "@/components/admin/AdminSidebar";
import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { SeoAnalyticsPanel } from "@/components/admin/SeoAnalyticsPanel";
import { SeoHealthCard } from "@/components/admin/SeoHealthCard";
import { AiFaqsCard } from "@/components/admin/AiFaqsCard";
import { MatchRecapsCard } from "@/components/admin/MatchRecapsCard";
import { SectionStatusStrip } from "@/components/admin/SectionStatusStrip";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

const GROUP_MATCHES_BY_YEAR = groupMatchesData as Record<string, WCMatch[]>;
type AdminMatch = WCMatch & { _bundled?: boolean };

type SeedEntry = { year: number; teams: [string, string]; url: string; title: string };
const TEAM_ALIASES: Record<string, string[]> = {
  "South Korea": ["South Korea", "Korea Republic", "Korea, Republic of"],
  USA: ["United States", "USA", "United States of America"],
};
const teamVariants = (t: string) => TEAM_ALIASES[t] ?? [t];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — PlaySports" },
      { name: "robots", content: "noindex" },
      { property: "og:site_name", content: "PlaySports" },
    ],
  }),
  component: AdminPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Admin console error" message={errorMessage(error)} onRetry={reset} />
    </div>
  ),
});

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, roleLoading } = useAuth();

  // Track whether we've completed the initial auth+role check at least once.
  // After that, we never unmount AdminShell for transient recheck cycles
  // (e.g. Supabase USER_UPDATED events, token refreshes) — otherwise
  // in-flight AI generation loops and the current tab selection get wiped.
  const settledOnceRef = useRef(false);
  if (!loading && user && !roleLoading) settledOnceRef.current = true;

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  // Only block on the *initial* load. Subsequent rechecks keep the shell mounted.
  if (!settledOnceRef.current && (loading || (user && roleLoading))) {
    return (
      <div className="min-h-screen grid place-items-center" role="status">
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 text-gold animate-spin" aria-hidden="true" />
          Checking admin access…
        </span>
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin && settledOnceRef.current === false) return <NotAuthorized />;
  if (!isAdmin && !roleLoading) return <NotAuthorized />;

  return <AdminShell />;
}

function NotAuthorized() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-sm">
        <AlertTriangle className="size-10 text-amber-500 mx-auto mb-3" aria-hidden="true" />
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your account does not have admin access. Contact the site owner.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-muted px-4 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" /> Back to archive
        </Link>
      </div>
    </div>
  );
}

function AdminShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [year, setYear] = useState<number>(2026);
  const [search, setSearch] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [section, setSection] = useState<AdminSection>(() => {
    if (typeof window === "undefined") return "overview";
    const saved = window.localStorage.getItem("admin.section");
    return (saved as AdminSection) || "overview";
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("admin.section", section);
    } catch {
      /* ignore quota */
    }
  }, [section]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K to open quick jump.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fixturesFn = useServerFn(getWc2026Fixtures);

  const matches = useQuery({
    queryKey: ["admin_wc_matches", year],
    queryFn: async (): Promise<AdminMatch[]> => {
      const { data, error } = await supabase
        .from("wc_matches")
        .select("*")
        .eq("tournament_year", year)
        .order("match_number", { ascending: true });
      if (error) throw error;
      const db = (data ?? []) as WCMatch[];
      const seen = new Set(
        db.map((m) => `${m.home_team.toLowerCase()}|${m.away_team.toLowerCase()}`),
      );

      // 2026: pull live fixtures from ESPN's public feed as bundled rows.
      if (year === 2026) {
        const [res, videoMap] = await Promise.all([fixturesFn(), fetch2026VideoMap()]);
        const bundled: AdminMatch[] = (res.fixtures ?? [])
          .filter((f) => !seen.has(`${f.home.name.toLowerCase()}|${f.away.name.toLowerCase()}`))
          .map(
            (f, i): AdminMatch => ({
              id: 900000 + i, // synthetic; stripped on insert
              tournament_year: 2026,
              round: f.group,
              match_number: i + 1,
              home_team: f.home.name,
              away_team: f.away.name,
              home_score: f.home.goals,
              away_score: f.away.goals,
              home_score_pen: null,
              away_score_pen: null,
              match_date: f.startTs ? new Date(f.startTs * 1000).toISOString() : null,
              stadium: f.venue,
              city: f.city,
              video_url: videoMap.get(videoKey(f.home.name, f.away.name)) ?? null,
              _bundled: true,
            }),
          );
        return [...db, ...bundled].sort((a, b) =>
          (a.match_date ?? "").localeCompare(b.match_date ?? ""),
        );
      }

      const bundled = (GROUP_MATCHES_BY_YEAR[String(year)] ?? [])
        .filter((m) => !seen.has(`${m.home_team.toLowerCase()}|${m.away_team.toLowerCase()}`))
        .map((m) => ({ ...m, _bundled: true }) as AdminMatch);
      return [...db, ...bundled].sort((a, b) => (a.match_number ?? 0) - (b.match_number ?? 0));
    },
  });

  const filtered = useMemo(() => {
    const list = matches.data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((m) => {
      if (missingOnly && m.video_url) return false;
      if (!q) return true;
      return (
        m.home_team.toLowerCase().includes(q) ||
        m.away_team.toLowerCase().includes(q) ||
        m.round.toLowerCase().includes(q)
      );
    });
  }, [matches.data, search, missingOnly]);

  const stats = useMemo(() => {
    const list = matches.data ?? [];
    const withVideo = list.filter((m) => m.video_url).length;
    return { total: list.length, withVideo, missing: list.length - withVideo };
  }, [matches.data]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="size-11 rounded-xl bg-gold/15 grid place-items-center ring-1 ring-gold/30 hover:ring-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trophy className="size-5 text-gold" aria-hidden="true" />
            </Link>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide inline-flex items-center gap-1.5">
                Admin <ShieldCheck className="size-3.5 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-gold">
                PlaySports Control
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden min-h-11 sm:inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs text-muted-foreground transition hover:border-gold/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open quick jump"
            >
              <Search className="size-3.5" aria-hidden="true" />
              <span>Quick jump…</span>
              <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="size-11 sm:hidden grid place-items-center rounded-xl border border-border bg-card text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open quick jump"
            >
              <Command className="size-4" aria-hidden="true" />
            </button>
            <span className="hidden md:block text-xs text-muted-foreground truncate max-w-[200px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="size-3.5" aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onJump={(s) => setSection(s)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8 lg:flex lg:gap-8">
        <AdminSidebar active={section} onChange={setSection} />

        <main className="flex-1 min-w-0 space-y-6 mt-4 lg:mt-0">
          {section === "overview" && <OverviewPanel matchStats={stats} onJump={setSection} />}

          {section === "seo" && (
            <SectionShell
              section="seo"
              title="SEO Analytics"
              hint="Google Search Console — clicks, impressions, top queries & pages"
            >
              <SeoAnalyticsPanel />
              <SeoHealthCard />
              <AiFaqsCard />
              <MatchRecapsCard />
            </SectionShell>
          )}

          {section === "monetize" && (
            <SectionShell
              section="monetize"
              title="Monetize"
              hint="AdSense · Affiliates · Sponsored placements · Memberships"
            >
              <AdSenseAdminCard />
              <AffiliateLinksCard />
              <SponsoredSlotsCard />
              <MembershipsCard />
              <CryptoPaymentsCard />
            </SectionShell>
          )}

          {section === "audience" && (
            <SectionShell
              section="audience"
              title="Audience"
              hint="Newsletter signups & weekly digest"
            >
              <NewsletterDigestCard />
            </SectionShell>
          )}

          {section === "content" && (
            <SectionShell
              section="content"
              title="Content"
              hint="Auto-seed videos & 2026 highlights"
            >
              <SeedFromDataset />
              <Wc2026HighlightsCard />
            </SectionShell>
          )}

          {section === "settings" && (
            <SectionShell
              section="settings"
              title="Settings"
              hint="Site identity, analytics, consent, legal pages"
            >
              <MonetizationCard />
            </SectionShell>
          )}

          {section === "matches" && (
            <SectionShell
              section="matches"
              matchStats={stats}
              title="Matches"
              hint="World Cup video library — paste a YouTube/Vimeo/mp4 link per match"
            >
              {/* Tournament + search controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="admin-year"
                    className="text-[11px] uppercase tracking-widest text-muted-foreground"
                  >
                    Tournament
                  </label>
                  <div className="relative">
                    <select
                      id="admin-year"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="min-h-11 appearance-none rounded-xl border border-border bg-card pl-3 pr-9 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {WC_YEARS.slice()
                        .reverse()
                        .map((y) => (
                          <option key={y} value={y}>
                            {y} World Cup
                          </option>
                        ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-gold"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                  <div className="relative flex-1">
                    <label htmlFor="admin-search" className="sr-only">
                      Search matches by team or round
                    </label>
                    <Search
                      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="admin-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search team or round…"
                      className="min-h-11 w-full rounded-xl border border-border bg-card pl-8 pr-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMissingOnly((v) => !v)}
                    aria-pressed={missingOnly}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      missingOnly
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Filter className="size-3.5" aria-hidden="true" /> Missing only
                  </button>
                </div>
              </div>

              {/* Stat strip */}
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Total" value={stats.total} tone="default" />
                <Stat label="With video" value={stats.withVideo} tone="good" />
                <Stat label="Missing" value={stats.missing} tone="warn" />
              </div>

              {/* Match table */}
              <div className="rounded-2xl border border-border bg-card/40 overflow-hidden">
                {matches.isLoading ? (
                  <div
                    className="p-12 text-center text-sm text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2 className="size-6 mx-auto animate-spin mb-2" aria-hidden="true" />{" "}
                    Loading {year} matches…
                  </div>
                ) : matches.error ? (
                  <div className="p-6">
                    <ErrorState
                      title="Could not load matches"
                      message={errorMessage(matches.error)}
                      onRetry={() => void matches.refetch()}
                    />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      title={
                        (matches.data?.length ?? 0) === 0
                          ? `No matches in the database for ${year}`
                          : "No matches match these filters"
                      }
                      description={
                        (matches.data?.length ?? 0) === 0
                          ? "Seed or import this tournament, then refresh."
                          : "Clear the search or the missing-only filter to see all rows."
                      }
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filtered.map((m) => (
                      <MatchRow key={m.id} match={m} year={year} />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                Group-stage rows from the bundled dataset are shown alongside knockout matches.
                Saving a video URL for a bundled row inserts it into the database automatically.
              </p>
            </SectionShell>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionShell({
  title,
  hint,
  section,
  matchStats,
  children,
}: {
  title: string;
  hint: string;
  section: AdminSection;
  matchStats?: { total: number; withVideo: number; missing: number };
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{hint}</p>
        </div>
        <SectionStatusStrip section={section} matchStats={matchStats} />
      </header>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "good" | "warn";
}) {
  const colors = {
    default: "border-border bg-card/60 text-foreground",
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  }[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors}`}>
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
    </div>
  );
}

function SeedFromDataset() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    updated: number;
    skipped: number;
    missing: number;
  } | null>(null);

  const seed: SeedEntry[] = videoSeed as SeedEntry[];
  const years = Array.from(new Set(seed.map((s) => s.year)));

  const run = async (overwrite: boolean) => {
    setRunning(true);
    setResult(null);
    try {
      const { data, error } = await supabase
        .from("wc_matches")
        .select("id,tournament_year,home_team,away_team,video_url")
        .in("tournament_year", years);
      if (error) throw error;

      type Row = { id: number; home_team: string; away_team: string; video_url: string | null };
      const idx = new Map<string, Row>();
      for (const m of data ?? []) {
        const key = `${m.tournament_year}|${[m.home_team.toLowerCase(), m.away_team.toLowerCase()].sort().join("|")}`;
        idx.set(key, m);
      }

      let updated = 0,
        skipped = 0,
        missing = 0;
      for (const entry of seed) {
        let row: Row | undefined;
        outer: for (const v1 of teamVariants(entry.teams[0])) {
          for (const v2 of teamVariants(entry.teams[1])) {
            const key = `${entry.year}|${[v1.toLowerCase(), v2.toLowerCase()].sort().join("|")}`;
            const hit = idx.get(key);
            if (hit) {
              row = hit;
              break outer;
            }
          }
        }
        if (!row) {
          missing++;
          continue;
        }
        if (row.video_url && !overwrite) {
          skipped++;
          continue;
        }
        const { error: upErr } = await supabase
          .from("wc_matches")
          .update({ video_url: entry.url })
          .eq("id", row.id);
        if (upErr) {
          missing++;
          continue;
        }
        updated++;
      }

      setResult({ updated, skipped, missing });
      toast.success(`Seeded ${updated} videos`, {
        description: `${skipped} already had video, ${missing} couldn't be matched`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_wc_matches"] });
      queryClient.invalidateQueries({ queryKey: ["wc_matches"] });
    } catch (e: unknown) {
      toast.error("Seed failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-amber-500/15 grid place-items-center ring-1 ring-amber-500/30 shrink-0">
            <Sparkles className="size-4 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-semibold">Auto-seed from YouTube dataset</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {seed.length} curated full-match links (1998–2022) from{" "}
              <span className="font-mono">choucisan/fwc_games</span>.
              {result && (
                <span className="ml-2 text-foreground">
                  → <span className="text-emerald-400">{result.updated} updated</span>
                  {", "}
                  <span className="text-amber-400">{result.skipped} skipped</span>
                  {", "}
                  <span className="text-red-400">{result.missing} missing</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => run(false)}
            disabled={running}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {running ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-3.5" aria-hidden="true" />
            )}
            Seed missing
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Overwrite existing video URLs with dataset links?")) run(true);
            }}
            disabled={running}
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3 text-xs hover:bg-accent disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Overwrite all
          </button>
        </div>
      </div>
    </div>
  );
}

function MatchRow({ match, year }: { match: AdminMatch; year: number }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(match.video_url ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setValue(match.video_url ?? "");
  }, [match.video_url]);

  const dirty = value.trim() !== (match.video_url ?? "").trim();
  const detected = value.trim() ? detectVideoType(value.trim()) : null;
  const isBundled = match._bundled === true;

  const save = async () => {
    setSaving(true);
    const newUrl = value.trim() || null;
    let error: { message: string } | null = null;
    try {
      if (match.tournament_year === 2026) {
        // 2026 has no wc_tournaments parent row → store in site_settings.
        await set2026Video(match.home_team, match.away_team, newUrl);
      } else if (isBundled) {
        // Bundled row not yet in DB — insert the full row with the video URL.
        const {
          _bundled: _b,
          id: _id,
          predicted: _p,
          home_seed_label: _hs,
          away_seed_label: _as,
          status: _status,
          statusDesc: _statusDesc,
          minute: _minute,
          ...rest
        } = match;
        void _b;
        void _id;
        void _p;
        void _hs;
        void _as;
        void _status;
        void _statusDesc;
        void _minute;
        const res = await supabase.from("wc_matches").insert({ ...rest, video_url: newUrl });
        error = res.error;
      } else {
        const res = await supabase
          .from("wc_matches")
          .update({ video_url: newUrl })
          .eq("id", match.id);
        error = res.error;
      }
    } catch (e) {
      error = { message: e instanceof Error ? e.message : String(e) };
    }
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1500);
    toast.success(`${match.home_team} vs ${match.away_team} saved`);
    queryClient.invalidateQueries({ queryKey: ["admin_wc_matches", year] });
    queryClient.invalidateQueries({ queryKey: ["wc_matches", year] });
    queryClient.invalidateQueries({ queryKey: ["wc2026", "video_map"] });
  };

  return (
    <div className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 hover:bg-accent/30">
      {/* Match identity */}
      <div className="md:w-[280px] shrink-0 flex items-center gap-2 text-sm">
        <span className="text-[10px] uppercase tracking-widest bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
          {shortRound(match.round)}
        </span>
        {isBundled && (
          <span
            className="text-[9px] uppercase tracking-widest bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded px-1.5 py-0.5 shrink-0"
            title="Not in DB yet — saving will insert it"
          >
            new
          </span>
        )}
        <span className="truncate">
          <span aria-hidden="true">{flagOf(match.home_team)}</span> {match.home_team}
          <span className="mx-1.5 text-muted-foreground tabular-nums">
            {match.home_score ?? "-"}-{match.away_score ?? "-"}
          </span>
          {match.away_team} <span aria-hidden="true">{flagOf(match.away_team)}</span>
        </span>
      </div>

      {/* URL input */}
      <div className="flex-1 flex items-center gap-2">
        <label htmlFor={`video-${match.id}`} className="sr-only">
          Video URL for {match.home_team} vs {match.away_team}
        </label>
        <input
          id={`video-${match.id}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://youtube.com/watch?v=… or paste an mp4 / vimeo / fifa+ link"
          className="min-h-11 flex-1 rounded-xl border border-input bg-background px-3 font-mono text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="grid size-11 place-items-center rounded-xl border border-border bg-card hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Open URL"
            aria-label={`Open video link for ${match.home_team} vs ${match.away_team}`}
          >
            <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
          </a>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-3 text-sm font-semibold text-black hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : savedAt ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {savedAt ? "Saved" : "Save"}
        </button>
      </div>

      {/* Meta */}
      <div className="md:w-[110px] text-[10px] uppercase tracking-widest text-right">
        {value.trim() ? (
          <span className="text-emerald-400">{detected ?? "link"}</span>
        ) : (
          <span className="text-amber-500/80">no video</span>
        )}
      </div>
    </div>
  );
}

function shortRound(r: string): string {
  const lc = r.toLowerCase();
  if (
    lc.includes("final") &&
    !lc.includes("semi") &&
    !lc.includes("quarter") &&
    !lc.includes("third")
  )
    return "FIN";
  if (lc.includes("third")) return "3RD";
  if (lc.includes("semi")) return "SF";
  if (lc.includes("quarter")) return "QF";
  if (lc.includes("16")) return "R16";
  if (lc.includes("group")) {
    const m = r.match(/group\s*([A-H0-9]+)/i);
    return m ? `G${m[1]}` : "GRP";
  }
  return r.slice(0, 4).toUpperCase();
}
