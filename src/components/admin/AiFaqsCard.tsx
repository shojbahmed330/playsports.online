import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateAiFaqsBatch, getAiFaqCoverage } from "@/lib/ai-faqs.functions";
import { listTeams, listPlayers } from "@/lib/seo/programmatic";
import { listCricketTeams, listCricketPlayers } from "@/lib/seo/cricket-entities";
import { listMlbTeams, listMlbPlayers } from "@/lib/seo/mlb-entities";
import { listNbaTeams, listNbaPlayers } from "@/lib/seo/nba-entities";
import { listNhlTeams, listNhlPlayers } from "@/lib/seo/nhl-entities";
import { listMlsTeams, listMlsPlayers } from "@/lib/seo/mls-entities";

type Preset = {
  id: string;
  label: string;
  entity_type: string;
  sport: string;
  load: () => Array<{ entity_slug: string; entity_name: string; context?: string }>;
};

const PRESETS: Preset[] = [
  {
    id: "football-teams",
    label: "Football Teams (World Cup)",
    entity_type: "football_team",
    sport: "Football",
    load: () =>
      listTeams().map((t) => ({
        entity_slug: t.slug,
        entity_name: t.name,
        context: `${t.name} is a men's national football team competing at the FIFA World Cup.`,
      })),
  },
  {
    id: "football-players",
    label: "Football Players (WC Legends)",
    entity_type: "football_player",
    sport: "Football",
    load: () =>
      listPlayers().slice(0, 100).map((p) => ({
        entity_slug: p.slug,
        entity_name: p.name,
        context: `${p.name} is a footballer with FIFA World Cup history.`,
      })),
  },
  {
    id: "cricket-teams",
    label: "Cricket Teams (National)",
    entity_type: "cricket_team",
    sport: "Cricket",
    load: () =>
      listCricketTeams().map((t) => ({
        entity_slug: t.slug,
        entity_name: t.name,
        context: `${t.name} is a national cricket team.`,
      })),
  },
  {
    id: "cricket-players",
    label: "Cricket Players (Legends)",
    entity_type: "cricket_player",
    sport: "Cricket",
    load: () =>
      listCricketPlayers().map((p) => ({
        entity_slug: p.slug,
        entity_name: p.name,
        context: `${p.name} is a professional cricketer.`,
      })),
  },
  {
    id: "mlb-teams",
    label: "MLB Teams",
    entity_type: "mlb_team",
    sport: "Baseball",
    load: () =>
      listMlbTeams().map((t) => ({
        entity_slug: t.slug,
        entity_name: t.name,
        context: `${t.name} is a Major League Baseball franchise (${t.abbr}).`,
      })),
  },
  {
    id: "mlb-players",
    label: "MLB Players (Legends)",
    entity_type: "mlb_player",
    sport: "Baseball",
    load: () =>
      listMlbPlayers().map((p) => ({
        entity_slug: p.slug,
        entity_name: p.name,
        context: `${p.name} is a Major League Baseball player with career honors.`,
      })),
  },
  {
    id: "nba-teams",
    label: "NBA Teams",
    entity_type: "nba_team",
    sport: "Basketball",
    load: () =>
      listNbaTeams().map((t) => ({
        entity_slug: t.slug,
        entity_name: t.name,
        context: `${t.name} is an NBA franchise.`,
      })),
  },
  {
    id: "nba-players",
    label: "NBA Players (Legends)",
    entity_type: "nba_player",
    sport: "Basketball",
    load: () =>
      listNbaPlayers().map((p) => ({
        entity_slug: p.slug,
        entity_name: p.name,
        context: `${p.name} is an NBA player with career honors.`,
      })),
  },
  {
    id: "nhl-teams",
    label: "NHL Teams",
    entity_type: "nhl_team",
    sport: "Ice Hockey",
    load: () =>
      listNhlTeams().map((t) => ({
        entity_slug: t.slug,
        entity_name: t.name,
        context: `${t.name} is an NHL franchise.`,
      })),
  },
  {
    id: "nhl-players",
    label: "NHL Players (Legends)",
    entity_type: "nhl_player",
    sport: "Ice Hockey",
    load: () =>
      listNhlPlayers().map((p) => ({
        entity_slug: p.slug,
        entity_name: p.name,
        context: `${p.name} is an NHL player with career honors.`,
      })),
  },
  {
    id: "mls-teams",
    label: "MLS Teams",
    entity_type: "mls_team",
    sport: "Soccer",
    load: () =>
      listMlsTeams().map((t) => ({
        entity_slug: t.slug,
        entity_name: t.name,
        context: `${t.name} is a Major League Soccer club.`,
      })),
  },
  {
    id: "mls-players",
    label: "MLS Players",
    entity_type: "mls_player",
    sport: "Soccer",
    load: () =>
      listMlsPlayers().map((p) => ({
        entity_slug: p.slug,
        entity_name: p.name,
        context: `${p.name} is a Major League Soccer player.`,
      })),
  },
];

// One item per server call — fits inside Vercel's 60s serverless timeout
// even if the AI call needs a retry. Client paces between calls.
const BATCH_SIZE = 1;
const INTER_CALL_MS = 1200;

export function AiFaqsCard() {
  const runBatch = useServerFn(generateAiFaqsBatch);
  const readCoverage = useServerFn(getAiFaqCoverage);

  const [coverage, setCoverage] = useState<Array<{ entity_type: string; count: number; latest: string | null }>>([]);
  const [selected, setSelected] = useState<string>(PRESETS[0].id);
  const [force, setForce] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; generated: number; skipped: number; errors: number }>({
    done: 0, total: 0, generated: 0, skipped: 0, errors: 0,
  });
  const [lastError, setLastError] = useState<string | null>(null);

  async function loadCoverage() {
    try {
      const rows = await readCoverage();
      setCoverage(rows);
    } catch {
      // silent
    }
  }
  useEffect(() => {
    loadCoverage();
  }, []);

  const preset = PRESETS.find((p) => p.id === selected)!;
  const cov = coverage.find((c) => c.entity_type === preset.entity_type);

  async function handleGenerate() {
    setLastError(null);
    setRunning(true);
    const all = preset.load();
    setProgress({ done: 0, total: all.length, generated: 0, skipped: 0, errors: 0 });

    let done = 0, gen = 0, skip = 0, err = 0;
    for (let i = 0; i < all.length; i += BATCH_SIZE) {
      const chunk = all.slice(i, i + BATCH_SIZE);
      try {
        const res = await runBatch({
          data: {
            entity_type: preset.entity_type,
            sport: preset.sport,
            items: chunk,
            force,
          },
        });
        gen += res.generated;
        skip += res.skipped;
        err += res.errors.length;
        if (res.errors.length) {
          setLastError(res.errors[0].error);
        }
      } catch (e) {
        err += chunk.length;
        setLastError(e instanceof Error ? e.message : String(e));
      }
      done += chunk.length;
      setProgress({ done, total: all.length, generated: gen, skipped: skip, errors: err });
    }
    setRunning(false);
    loadCoverage();
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <header className="flex items-center gap-2 mb-3">
        <Sparkles className="size-5 text-gold" />
        <h3 className="text-lg font-bold">AI-generated FAQs</h3>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Phase 3</span>
      </header>
      <p className="text-xs text-muted-foreground mb-4">
        Generate unique, long-tail FAQ blocks for landing pages using Lovable AI. Cached in the database and rendered
        as both visible content and <code>FAQPage</code> JSON-LD.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="text-xs">
          <span className="block mb-1 font-medium">Entity group</span>
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
          Cached for this group: <strong>{cov?.count ?? 0}</strong> entities
          {cov?.latest && <> · last updated {new Date(cov.latest).toLocaleDateString()}</>}
        </span>
      </div>

      <button
        onClick={handleGenerate}
        disabled={running}
        className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-black hover:bg-gold/90 disabled:opacity-60"
      >
        {running ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        {running ? `Generating… ${progress.done}/${progress.total}` : "Generate FAQs"}
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
    </section>
  );
}
