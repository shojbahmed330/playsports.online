// Cross-sport "Today in your zone" strip.
// Buckets every ESPN game + WC2026 fixture by the date they fall on in the
// viewer's active timezone (with override). LIVE first, then Today, Tomorrow,
// Day-after. Each chip deep-links to its sport/match page.

import { useMemo } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { Link } from "@tanstack/react-router";
import { Globe, Flame } from "lucide-react";
import { dateKeyInTz, fmtTime, getTimezone } from "@/lib/timezone";
import { useTimezone, TimezonePicker } from "@/components/wc/TimezonePicker";
import type { SportGame } from "@/lib/espn.functions";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import type { CricketMatch } from "@/lib/cricket.functions";
import type { SportConfig } from "@/lib/sports-config";
import { flagOf } from "@/lib/flags";

type EspnTagged = { kind: "espn"; sport: SportConfig; game: SportGame };
type WcTagged = { kind: "wc"; fixture: Wc2026Fixture };
type CricketTagged = { kind: "cricket"; match: CricketMatch };
type Item = EspnTagged | WcTagged | CricketTagged;

const CHIP =
  "shrink-0 rounded-xl border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function startMs(it: Item): number {
  if (it.kind === "espn") return it.game.startTs;
  if (it.kind === "wc") return it.fixture.startTs * 1000;
  return it.match.startTs;
}
function isLive(it: Item): boolean {
  if (it.kind === "espn") return it.game.status === "in";
  if (it.kind === "wc") return it.fixture.status === "inprogress";
  return it.match.status === "in";
}

export function TodayInZoneStrip({
  espnByLeague,
  wcFixtures,
  cricketMatches,
  sports,
}: {
  espnByLeague: Record<string, SportGame[]>;
  wcFixtures: Wc2026Fixture[];
  cricketMatches: CricketMatch[];
  sports: SportConfig[];
}) {
  const tz = useTimezone();
  const mounted = useHydrated();

  const buckets = useMemo(() => {
    const all: Item[] = [
      ...sports.flatMap((s) =>
        (espnByLeague[s.label] ?? []).map<Item>((g) => ({ kind: "espn", sport: s, game: g })),
      ),
      ...wcFixtures.map<Item>((f) => ({ kind: "wc", fixture: f })),
      ...cricketMatches.map<Item>((m) => ({ kind: "cricket", match: m })),
    ];

    // Compute today/tomorrow/dayAfter keys in active TZ
    const now = new Date();
    const todayKey = dateKeyInTz(now);
    const tomorrowKey = dateKeyInTz(new Date(now.getTime() + 24 * 3600 * 1000));
    const dayAfterKey = dateKeyInTz(new Date(now.getTime() + 48 * 3600 * 1000));

    const live: Item[] = [];
    const today: Item[] = [];
    const tomorrow: Item[] = [];
    const dayAfter: Item[] = [];

    for (const it of all) {
      if (isLive(it)) {
        live.push(it);
        continue;
      }
      const k = dateKeyInTz(startMs(it));
      if (!k) continue;
      if (k === todayKey) today.push(it);
      else if (k === tomorrowKey) tomorrow.push(it);
      else if (k === dayAfterKey) dayAfter.push(it);
    }

    const bySt = (a: Item, b: Item) => startMs(a) - startMs(b);
    return {
      live: live.sort(bySt),
      today: today.sort(bySt),
      tomorrow: tomorrow.sort(bySt),
      dayAfter: dayAfter.sort(bySt),
      tz,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espnByLeague, wcFixtures, cricketMatches, sports, tz]);

  const total =
    buckets.live.length + buckets.today.length + buckets.tomorrow.length + buckets.dayAfter.length;
  // The buckets depend on the viewer's timezone/current date, so render after
  // mount; SSR and the first client paint must agree.
  if (!mounted || total === 0) return null;

  return (
    <section className="animate-fade-in rounded-2xl border border-border bg-card/60 p-4 motion-reduce:animate-none sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-h3 text-foreground">
          <Globe className="size-4 text-primary" aria-hidden="true" />
          In your zone
          <span className="text-micro font-normal text-muted-foreground">
            · {getTimezone().replace(/_/g, " ")}
          </span>
        </h2>
        <TimezonePicker compact />
      </div>

      <div className="space-y-3">
        {buckets.live.length > 0 && <Row label="Live" tone="live" items={buckets.live} />}
        {buckets.today.length > 0 && <Row label="Today" tone="next" items={buckets.today} />}
        {buckets.tomorrow.length > 0 && (
          <Row label="Tomorrow" tone="muted" items={buckets.tomorrow} />
        )}
        {buckets.dayAfter.length > 0 && (
          <Row label="In 2 days" tone="muted" items={buckets.dayAfter} />
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "live" | "next" | "muted";
  items: Item[];
}) {
  const toneClass =
    tone === "live"
      ? "text-live"
      : tone === "next"
        ? "text-primary"
        : "text-muted-foreground";
  return (
    <div>
      <div
        className={`mb-1.5 flex items-center gap-1.5 text-micro uppercase ${toneClass}`}
      >
        {tone === "live" && <Flame className="size-3" aria-hidden="true" />} {label}
        <span className="font-normal text-muted-foreground">· {items.length}</span>
      </div>
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {items.map((it, i) => (
          <Chip key={`${it.kind}-${i}`} item={it} />
        ))}
      </div>
    </div>
  );
}

function Chip({ item }: { item: Item }) {
  if (item.kind === "wc") {
    const f = item.fixture;
    const live = f.status === "inprogress";
    const finished = f.status === "finished";
    const deepLink = f.id > 0;
    const body = (
      <>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-micro uppercase text-[var(--color-accent-football)]">
            <span aria-hidden="true">⚽</span> FIFA {f.group ? `· ${f.group}` : ""}
          </span>
          <span className="shrink-0 whitespace-nowrap text-micro font-bold text-muted-foreground">
            {live ? (
              <span className="text-live">{f.minute ? `${f.minute}'` : "LIVE"}</span>
            ) : finished ? (
              "FT"
            ) : (
              fmtTime(f.startTs * 1000)
            )}
          </span>
        </div>
        <Team name={f.home.name} score={live || finished ? f.home.goals : null} />
        <Team name={f.away.name} score={live || finished ? f.away.goals : null} />
      </>
    );
    const cls = `${CHIP} min-w-[180px] max-w-[220px] border-[var(--color-accent-football)]/30 bg-[var(--color-accent-football)]/10 hover:border-[var(--color-accent-football)]/60 hover:bg-[var(--color-accent-football)]/15`;
    return deepLink ? (
      <Link to="/football/match/$id" params={{ id: String(f.id) }} className={cls}>
        {body}
      </Link>
    ) : (
      <Link to="/football" search={{ year: 2026 }} className={cls}>
        {body}
      </Link>
    );
  }
  if (item.kind === "cricket") {
    const m = item.match;
    const live = m.status === "in";
    const finished = m.status === "post";
    return (
      <Link
        to="/cricket/match/$id"
        params={{ id: m.id }}
        className={`${CHIP} min-w-[200px] max-w-[240px] border-[var(--color-accent-cricket)]/30 bg-[var(--color-accent-cricket)]/10 hover:border-[var(--color-accent-cricket)]/60 hover:bg-[var(--color-accent-cricket)]/15`}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="truncate text-micro uppercase text-[var(--color-accent-cricket)]">
            <span aria-hidden="true">🏏</span> {m.leagueAbbr || m.leagueName} · {m.format}
          </span>
          <span className="ml-1 shrink-0 text-micro font-bold text-muted-foreground">
            {live ? <span className="text-live">LIVE</span> : finished ? "FT" : fmtTime(m.startTs)}
          </span>
        </div>
        <Team name={m.home.shortName || m.home.name} score={m.home.scoreSummary} />
        <Team name={m.away.shortName || m.away.name} score={m.away.scoreSummary} />
      </Link>
    );
  }
  const { sport, game } = item;
  const live = game.status === "in";
  const finished = game.status === "post";
  return (
    <Link
      to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
      className={`${CHIP} min-w-[180px] max-w-[220px] border-border bg-card hover:border-foreground/20 hover:bg-accent`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className={`truncate text-micro uppercase ${sport.accent}`}>
          <span aria-hidden="true">{sport.emoji}</span> {sport.label}
        </span>
        <span className="text-micro font-bold text-muted-foreground">
          {live ? (
            <span className="text-live">{game.shortDetail || "LIVE"}</span>
          ) : finished ? (
            "Final"
          ) : (
            fmtTime(game.startTs)
          )}
        </span>
      </div>
      <Team
        name={game.away.shortName || game.away.name}
        score={live || finished ? game.away.score : null}
      />
      <Team
        name={game.home.shortName || game.home.name}
        score={live || finished ? game.home.score : null}
      />
    </Link>
  );
}

function Team({ name, score }: { name: string; score: number | string | null }) {
  const flag = flagOf(name);
  return (
    <div className="flex items-center justify-between gap-2 text-caption">
      <span className="truncate font-semibold text-foreground">
        {flag && (
          <span className="mr-1" aria-hidden="true">
            {flag}
          </span>
        )}
        {name}
      </span>
      {score !== null && score !== "" && (
        <span className="font-extrabold tabular-nums text-foreground">{score}</span>
      )}
    </div>
  );
}
