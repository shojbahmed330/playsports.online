import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw, CheckCircle2, AlertCircle, Newspaper } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateMatchRecapsBatch, getMatchRecapCoverage } from "@/lib/match-recaps.functions";
import { listMatchSlugs } from "@/lib/seo/entities";
import { listCricketHighlights } from "@/lib/seo/cricket-entities";
import { listWorldSeries } from "@/lib/seo/mlb-entities";
import { listNbaFinals } from "@/lib/seo/nba-entities";
import { listStanleyCups } from "@/lib/seo/nhl-entities";
import { listMlsCups } from "@/lib/seo/mls-entities";

type Preset = {
  id: string;
  label: string;
  sport: string;
  load: () => Array<{
    sport: string;
    match_key: string;
    slug: string;
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    match_date: string | null;
    tournament: string | null;
    context?: string;
  }>;
};

const PRESETS: Preset[] = [
  {
    id: "football-all",
    label: "Football — All historical WC matches",
    sport: "football",
    load: () =>
      listMatchSlugs().map((m) => ({
        sport: "football",
        match_key: m.slug,
        slug: m.slug,
        home_team: m.home_team,
        away_team: m.away_team,
        home_score: m.home_score,
        away_score: m.away_score,
        match_date: m.match_date ?? null,
        tournament: `FIFA World Cup ${m.tournament_year}${m.round ? ` — ${m.round}` : ""}`,
        context: [
          m.stadium ? `Venue: ${m.stadium}${m.city ? ", " + m.city : ""}` : null,
          m.home_score_pen != null && m.away_score_pen != null
            ? `Decided on penalties ${m.home_score_pen}-${m.away_score_pen}`
            : null,
        ]
          .filter(Boolean)
          .join(". "),
      })),
  },
  {
    id: "football-finals-only",
    label: "Football — Finals & knockout only",
    sport: "football",
    load: () =>
      listMatchSlugs()
        .filter((m) =>
          m.round
            ? /final|semi|quarter|round of/i.test(m.round)
            : false,
        )
        .map((m) => ({
          sport: "football",
          match_key: m.slug,
          slug: m.slug,
          home_team: m.home_team,
          away_team: m.away_team,
          home_score: m.home_score,
          away_score: m.away_score,
          match_date: m.match_date ?? null,
          tournament: `FIFA World Cup ${m.tournament_year} — ${m.round}`,
          context: m.stadium ? `Venue: ${m.stadium}${m.city ? ", " + m.city : ""}` : "",
        })),
        })),
  },
  {
    id: "cricket-highlights",
    label: "Cricket — Highlighted matches",
    sport: "cricket",
    load: () =>
      listCricketHighlights().map((h) => ({
        sport: "cricket",
        match_key: h.slug,
        slug: h.slug,
        home_team: h.teamA,
        away_team: h.teamB,
        home_score: null,
        away_score: null,
        match_date: h.date ?? null,
        tournament: `${h.tournament}${h.stage ? " — " + h.stage : ""} (${h.format.toUpperCase()})`,
        context: [h.venue ? `Venue: ${h.venue}` : null, h.result ? `Result: ${h.result}` : null]
          .filter(Boolean)
          .join(". "),
      })),
  },
  {
    id: "mlb-worldseries",
    label: "MLB — World Series editions",
    sport: "mlb",
    load: () =>
      listWorldSeries().map((w) => ({
        sport: "mlb",
        match_key: `world-series-${w.year}`,
        slug: `world-series-${w.year}`,
        home_team: w.champion,
        away_team: w.runnerUp,
        home_score: null,
        away_score: null,
        match_date: String(w.year),
        tournament: `MLB World Series ${w.year}`,
        context: [w.result ? `Series result: ${w.result}` : null, w.mvp ? `WS MVP: ${w.mvp}` : null]
          .filter(Boolean)
          .join(". "),
      })),
  },
  {
    id: "nba-finals",
    label: "NBA — Finals editions",
    sport: "nba",
    load: () =>
      listNbaFinals().map((f) => ({
        sport: "nba",
        match_key: `finals-${f.year}`,
        slug: `finals-${f.year}`,
        home_team: f.champion,
        away_team: f.runnerUp,
        home_score: null,
        away_score: null,
        match_date: String(f.year),
        tournament: `NBA Finals ${f.year} (${f.season})`,
        context: [f.result ? `Series result: ${f.result}` : null, f.fmvp ? `Finals MVP: ${f.fmvp}` : null]
          .filter(Boolean)
          .join(". "),
      })),
  },
  {
    id: "nhl-stanleycup",
    label: "NHL — Stanley Cup editions",
    sport: "nhl",
    load: () =>
      listStanleyCups().map((c) => ({
        sport: "nhl",
        match_key: `stanley-cup-${c.year}`,
        slug: `stanley-cup-${c.year}`,
        home_team: c.champion,
        away_team: c.runnerUp,
        home_score: null,
        away_score: null,
        match_date: String(c.year),
        tournament: `NHL Stanley Cup Final ${c.year} (${c.season})`,
        context: [c.result ? `Series result: ${c.result}` : null, c.fmvp ? `Conn Smythe: ${c.fmvp}` : null]
          .filter(Boolean)
          .join(". "),
      })),
  },
  {
    id: "mls-cup",
    label: "MLS — Cup finals",
    sport: "mls",
    load: () =>
      listMlsCups().map((c) => ({
        sport: "mls",
        match_key: `mls-cup-${c.year}`,
        slug: `mls-cup-${c.year}`,
        home_team: c.champion,
        away_team: c.runnerUp,
        home_score: null,
        away_score: null,
        match_date: String(c.year),
        tournament: `MLS Cup ${c.year}`,
        context: [c.result ? `Result: ${c.result}` : null, c.fmvp ? `MVP: ${c.fmvp}` : null]
          .filter(Boolean)
          .join(". "),
      })),
  },
];

// One item per server call to stay inside Vercel's 60s serverless timeout.
const BATCH_SIZE = 1;
const INTER_CALL_MS = 1200;

export function MatchRecapsCard() {
  const runBatch = useServerFn(generateMatchRecapsBatch);
  const readCoverage = useServerFn(getMatchRecapCoverage);

  const [coverage, setCoverage] = useState<Array<{ sport: string; count: number; latest: string | null }>>([]);
  const [selected, setSelected] = useState<string>(PRESETS[0].id);
  const [force, setForce] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, generated: 0, skipped: 0, errors: 0 });
  const [lastError, setLastError] = useState<string | null>(null);

  async function loadCoverage() {
    try {
      const rows = await readCoverage();
      setCoverage(rows);
    } catch {
      /* silent */
    }
  }
  useEffect(() => {
    loadCoverage();
  }, []);

  const preset = PRESETS.find((p) => p.id === selected)!;
  const cov = coverage.find((c) => c.sport === preset.sport);

  async function handleGenerate() {
    setLastError(null);
    setRunning(true);
    const all = preset.load();
    setProgress({ done: 0, total: all.length, generated: 0, skipped: 0, errors: 0 });

    let done = 0, gen = 0, skip = 0, err = 0;
    for (let i = 0; i < all.length; i += BATCH_SIZE) {
      const chunk = all.slice(i, i + BATCH_SIZE);
      try {
        const res = await runBatch({ data: { items: chunk, force } });
        gen += res.generated;
        skip += res.skipped;
        err += res.errors.length;
        if (res.errors.length) setLastError(res.errors[0].error);
      } catch (e) {
        err += chunk.length;
        setLastError(e instanceof Error ? e.message : String(e));
      }
      done += chunk.length;
      setProgress({ done, total: all.length, generated: gen, skipped: skip, errors: err });
      if (i + BATCH_SIZE < all.length) {
        await new Promise((r) => setTimeout(r, INTER_CALL_MS));
      }
    }
    setRunning(false);
    loadCoverage();
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <header className="flex items-center gap-2 mb-3">
        <Newspaper className="size-5 text-gold" />
        <h3 className="text-lg font-bold">AI Match Recaps</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Phase 3</span>
      </header>
      <p className="text-xs text-muted-foreground mb-4">
        Generate long-form (700–1100 word) SEO recap articles for finished matches. Cached in the database and
        rendered on <code>/football/matches/[slug]</code>.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="text-xs">
          <span className="block mb-1 font-medium">Match group</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={running}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
        <label className="text-xs flex items-end gap-2">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={running}
            className="mt-0.5"
          />
          <span>Force regenerate (overwrite existing)</span>
        </label>
      </div>

      <div className="rounded-lg bg-muted/40 p-3 mb-3 text-xs flex items-center gap-3">
        <CheckCircle2 className="size-4 text-emerald-500" />
        <span>
          Cached for <strong>{preset.sport}</strong>: <strong>{cov?.count ?? 0}</strong> recaps
          {cov?.latest && <> · last updated {new Date(cov.latest).toLocaleDateString()}</>}
        </span>
      </div>

      <button
        onClick={handleGenerate}
        disabled={running}
        className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-black hover:bg-gold/90 disabled:opacity-60"
      >
        {running ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {running ? `Generating… ${progress.done}/${progress.total}` : "Generate recaps"}
      </button>

      {running && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {progress.generated} generated · {progress.skipped} skipped · {progress.errors} errors
          </div>
        </div>
      )}
      {!running && progress.total > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          Done: {progress.generated} generated · {progress.skipped} skipped · {progress.errors} errors
        </div>
      )}

      {lastError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs">
          <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
          <div><strong>Latest error:</strong> {lastError}</div>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
        <RefreshCw className="size-3 mt-0.5" />
        One recap per server call ({INTER_CALL_MS}ms client pacing) — stays inside Vercel's 60s serverless timeout.
      </p>
    </section>
  );
}
