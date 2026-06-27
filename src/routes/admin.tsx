import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Trophy, Loader2, LogOut, Search, ChevronDown, Save, Check,
  Filter, ExternalLink, ArrowLeft, ShieldCheck, AlertTriangle, Sparkles, Command,
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
import { AdminSidebar, type AdminSection } from "@/components/admin/AdminSidebar";
import { OverviewPanel } from "@/components/admin/OverviewPanel";


const GROUP_MATCHES_BY_YEAR = groupMatchesData as Record<string, WCMatch[]>;
type AdminMatch = WCMatch & { _bundled?: boolean };

type SeedEntry = { year: number; teams: [string, string]; url: string; title: string };
const TEAM_ALIASES: Record<string, string[]> = {
  "South Korea": ["South Korea", "Korea Republic", "Korea, Republic of"],
  "USA": ["United States", "USA", "United States of America"],
};
const teamVariants = (t: string) => TEAM_ALIASES[t] ?? [t];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — FIFA World Cup Archive" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, roleLoading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-7 text-gold animate-spin" />
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin) return <NotAuthorized />;

  return <AdminShell />;
}

function NotAuthorized() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="text-center max-w-sm">
        <AlertTriangle className="size-10 text-amber-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your account does not have admin access. Contact the site owner.
        </p>
        <Link to="/" className="inline-flex mt-5 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm">
          <ArrowLeft className="size-4 mr-1.5" /> Back to archive
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
  const [section, setSection] = useState<AdminSection>("overview");
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

      // 2026: pull live fixtures from Sofascore as bundled rows.
      if (year === 2026) {
        const [res, videoMap] = await Promise.all([fixturesFn(), fetch2026VideoMap()]);
        const bundled: AdminMatch[] = (res.fixtures ?? [])
          .filter((f) => !seen.has(`${f.home.name.toLowerCase()}|${f.away.name.toLowerCase()}`))
          .map((f, i): AdminMatch => ({
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
          }));
        return [...db, ...bundled].sort(
          (a, b) => (a.match_date ?? "").localeCompare(b.match_date ?? ""),
        );
      }

      const bundled = (GROUP_MATCHES_BY_YEAR[String(year)] ?? [])
        .filter((m) => !seen.has(`${m.home_team.toLowerCase()}|${m.away_team.toLowerCase()}`))
        .map((m) => ({ ...m, _bundled: true }) as AdminMatch);
      return [...db, ...bundled].sort(
        (a, b) => (a.match_number ?? 0) - (b.match_number ?? 0),
      );
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
            <Link to="/" className="size-9 rounded-lg bg-gold/15 grid place-items-center ring-1 ring-gold/30 hover:ring-gold/50">
              <Trophy className="size-5 text-gold" />
            </Link>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide inline-flex items-center gap-1.5">
                Admin <ShieldCheck className="size-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-gold">AllSportsLive Control</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-card border border-border hover:border-gold/40 text-muted-foreground hover:text-foreground transition"
              aria-label="Open quick jump"
            >
              <Search className="size-3.5" />
              <span>Quick jump…</span>
              <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="sm:hidden size-9 grid place-items-center rounded-md bg-card border border-border text-muted-foreground"
              aria-label="Open quick jump"
            >
              <Command className="size-4" />
            </button>
            <span className="hidden md:block text-xs text-muted-foreground truncate max-w-[200px]">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-md text-xs bg-gray-900 border border-gray-800 hover:bg-gray-800 inline-flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" /> Sign out
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

        <main id="main-content" className="flex-1 min-w-0 space-y-6 mt-4 lg:mt-0">
          {section === "overview" && (
            <OverviewPanel matchStats={stats} onJump={setSection} />
          )}

          {section === "monetize" && (
            <SectionShell title="Monetize" hint="AdSense · Affiliates · Sponsored placements · Memberships">
              <AdSenseAdminCard />
              <AffiliateLinksCard />
              <SponsoredSlotsCard />
              <MembershipsCard />
            </SectionShell>
          )}

          {section === "audience" && (
            <SectionShell title="Audience" hint="Newsletter signups & weekly digest">
              <NewsletterDigestCard />
            </SectionShell>
          )}

          {section === "content" && (
            <SectionShell title="Content" hint="Auto-seed videos & 2026 highlights">
              <SeedFromDataset />
              <Wc2026HighlightsCard />
            </SectionShell>
          )}

          {section === "settings" && (
            <SectionShell title="Settings" hint="Site identity, analytics, consent, legal pages">
              <MonetizationCard />
            </SectionShell>
          )}

          {section === "matches" && (
            <SectionShell
              title="Matches"
              hint="World Cup video library — paste a YouTube/Vimeo/mp4 link per match"
            >
              {/* Tournament + search controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Tournament</label>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="appearance-none pl-3 pr-9 py-2 rounded-lg bg-card border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      {WC_YEARS.slice().reverse().map((y) => (
                        <option key={y} value={y}>{y} World Cup</option>
                      ))}
                    </select>
                    <ChevronDown className="size-4 text-gold absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                  <div className="relative flex-1">
                    <Search className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search team or round…"
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                  <button
                    onClick={() => setMissingOnly((v) => !v)}
                    className={`px-3 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 border transition-colors ${
                      missingOnly
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Filter className="size-3.5" /> Missing only
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
                  <div className="p-12 text-center text-sm text-muted-foreground">
                    <Loader2 className="size-6 mx-auto animate-spin mb-2" /> Loading {year} matches…
                  </div>
                ) : matches.error ? (
                  <div className="p-8 text-center text-sm text-red-400">
                    Failed to load matches.
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-12 text-center text-sm text-muted-foreground">
                    {(matches.data?.length ?? 0) === 0
                      ? `No matches in DB for ${year} yet.`
                      : "No matches match your filters."}
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
  title, hint, children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      </header>
      <div className="space-y-5">{children}</div>
    </div>
  );
}


function Stat({ label, value, tone }: { label: string; value: number; tone: "default" | "good" | "warn" }) {
  const colors = {
    default: "border-border bg-card/60 text-foreground",
    good:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warn:    "border-amber-500/30 bg-amber-500/10 text-amber-300",
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
  const [result, setResult] = useState<{ updated: number; skipped: number; missing: number } | null>(null);

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

      let updated = 0, skipped = 0, missing = 0;
      for (const entry of seed) {
        let row: Row | undefined;
        outer: for (const v1 of teamVariants(entry.teams[0])) {
          for (const v2 of teamVariants(entry.teams[1])) {
            const key = `${entry.year}|${[v1.toLowerCase(), v2.toLowerCase()].sort().join("|")}`;
            const hit = idx.get(key);
            if (hit) { row = hit; break outer; }
          }
        }
        if (!row) { missing++; continue; }
        if (row.video_url && !overwrite) { skipped++; continue; }
        const { error: upErr } = await supabase
          .from("wc_matches")
          .update({ video_url: entry.url })
          .eq("id", row.id);
        if (upErr) { missing++; continue; }
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
            <Sparkles className="size-4 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-semibold">Auto-seed from YouTube dataset</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {seed.length} curated full-match links (1998–2022) from <span className="font-mono">choucisan/fwc_games</span>.
              {result && (
                <span className="ml-2 text-foreground">
                  → <span className="text-emerald-400">{result.updated} updated</span>
                  {", "}<span className="text-amber-400">{result.skipped} skipped</span>
                  {", "}<span className="text-red-400">{result.missing} missing</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => run(false)}
            disabled={running}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            Seed missing
          </button>
          <button
            onClick={() => {
              if (confirm("Overwrite existing video URLs with dataset links?")) run(true);
            }}
            disabled={running}
            className="px-3 py-2 text-xs rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-40"
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
        const { _bundled: _b, id: _id, ...rest } = match;
        void _b; void _id;
        const res = await supabase
          .from("wc_matches")
          .insert({ ...rest, video_url: newUrl });
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
        <span className="text-[10px] uppercase tracking-widest bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
          {shortRound(match.round)}
        </span>
        {isBundled && (
          <span className="text-[9px] uppercase tracking-widest bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded px-1.5 py-0.5 shrink-0" title="Not in DB yet — saving will insert it">
            new
          </span>
        )}
        <span className="truncate">
          <span>{flagOf(match.home_team)}</span> {match.home_team}
          <span className="mx-1.5 text-muted-foreground tabular-nums">
            {match.home_score ?? "-"}-{match.away_score ?? "-"}
          </span>
          {match.away_team} <span>{flagOf(match.away_team)}</span>
        </span>
      </div>

      {/* URL input */}
      <div className="flex-1 flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://youtube.com/watch?v=… or paste an mp4 / vimeo / fifa+ link"
          className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-gold focus:outline-none font-mono"
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="size-9 grid place-items-center rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800"
            title="Open URL"
          >
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
        )}
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="px-3 py-2 text-sm rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 shrink-0"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> :
            savedAt ? <Check className="size-4" /> : <Save className="size-4" />}
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
  if (lc.includes("final") && !lc.includes("semi") && !lc.includes("quarter") && !lc.includes("third")) return "FIN";
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
