// Cross-sport "Today in your zone" strip.
// Buckets every ESPN game + WC2026 fixture by the date they fall on in the
// viewer's active timezone (with override). LIVE first, then Today, Tomorrow,
// Day-after. Each chip deep-links to its sport/match page.

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Globe, Flame } from "lucide-react";
import {
  dateKeyInTz, fmtTime, getTimezone,
} from "@/lib/timezone";
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
      if (isLive(it)) { live.push(it); continue; }
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

  const total = buckets.live.length + buckets.today.length + buckets.tomorrow.length + buckets.dayAfter.length;
  if (total === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950/80 p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
          <Globe className="size-4 text-emerald-400" />
          In your zone
          <span className="text-[10px] sm:text-xs font-normal text-gray-500">
            · {getTimezone().replace(/_/g, " ")}
          </span>
        </h2>
        <TimezonePicker compact />
      </div>

      <div className="space-y-3">
        {buckets.live.length > 0 && (
          <Row label="🔴 Live" tone="red" items={buckets.live} />
        )}
        {buckets.today.length > 0 && (
          <Row label="Today" tone="amber" items={buckets.today} />
        )}
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
  label, tone, items,
}: { label: string; tone: "red" | "amber" | "muted"; items: Item[] }) {
  const toneClass =
    tone === "red" ? "text-red-300"
      : tone === "amber" ? "text-amber-300"
      : "text-gray-400";
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5 flex items-center gap-1.5 ${toneClass}`}>
        {tone === "red" && <Flame className="size-3" />} {label}
        <span className="text-gray-600 font-normal">· {items.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-800 -mx-1 px-1">
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
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300 truncate min-w-0">⚽ FIFA {f.group ? `· ${f.group}` : ""}</span>
          <span className="text-[10px] font-bold text-gray-400 shrink-0 whitespace-nowrap">
            {live ? <span className="text-red-300">{f.minute ? `${f.minute}'` : "LIVE"}</span>
              : finished ? "FT"
              : fmtTime(f.startTs * 1000)}
          </span>
        </div>
        <Team name={f.home.name} score={live || finished ? f.home.goals : null} />
        <Team name={f.away.name} score={live || finished ? f.away.goals : null} />
      </>
    );
    const cls = "shrink-0 min-w-[180px] max-w-[220px] rounded-xl border border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] hover:border-amber-400/60 transition-colors px-3 py-2";
    return deepLink ? (
      <Link to="/football/match/$id" params={{ id: String(f.id) }} className={cls}>{body}</Link>
    ) : (
      <Link to="/football" search={{ year: 2026 }} className={cls}>{body}</Link>
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
        className="shrink-0 min-w-[200px] max-w-[240px] rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] hover:border-emerald-400/60 transition-colors px-3 py-2"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-300 truncate">
            🏏 {m.leagueAbbr || m.leagueName} · {m.format}
          </span>
          <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-1">
            {live ? <span className="text-red-300">LIVE</span>
              : finished ? "FT"
              : fmtTime(m.startTs)}
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
      className={`shrink-0 min-w-[180px] max-w-[220px] rounded-xl border border-gray-800 bg-gray-900/60 hover:bg-gray-900 hover:border-gray-700 transition-colors px-3 py-2`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[9px] uppercase tracking-wider font-bold ${sport.accent}`}>
          {sport.emoji} {sport.label}
        </span>
        <span className="text-[10px] font-bold text-gray-400">
          {live ? <span className="text-red-300">{game.shortDetail || "LIVE"}</span>
            : finished ? "Final"
            : fmtTime(game.startTs)}
        </span>
      </div>
      <Team name={game.away.shortName || game.away.name} score={live || finished ? game.away.score : null} />
      <Team name={game.home.shortName || game.home.name} score={live || finished ? game.home.score : null} />
    </Link>
  );
}

function Team({ name, score }: { name: string; score: number | string | null }) {
  const flag = flagOf(name);
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="truncate font-semibold text-gray-200">
        {flag && <span className="mr-1">{flag}</span>}{name}
      </span>
      {score !== null && score !== "" && (
        <span className="font-extrabold tabular-nums text-white">{score}</span>
      )}
    </div>
  );
}
