import { Link } from "@tanstack/react-router";
import { Flame, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import type { SportGame } from "@/lib/espn.functions";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { LocalTime } from "@/components/ui/local-time";


type Tagged = { sport: SportConfig; game: SportGame };
type Item = { kind: "wc"; f: Wc2026Fixture } | { kind: "espn"; t: Tagged } | null;

type Tone = "live" | "next" | "recent";

const TONE_TEXT: Record<Tone, string> = {
  live: "text-live",
  next: "text-primary",
  recent: "text-muted-foreground",
};

/**
 * "For You" — 3 smart cards: live now / next up / just finished.
 * Quick-scan summary for users who want the headline without scrolling.
 */
export function ForYouStrip({
  liveGames,
  upcomingGames,
  finalGames,
  wcFixtures,
}: {
  liveGames: Tagged[];
  upcomingGames: Tagged[];
  finalGames: Tagged[];
  wcFixtures: Wc2026Fixture[];
}) {
  // Live: prefer WC2026 live, else first ESPN live
  const wcLive = wcFixtures.find((f) => f.status === "inprogress") ?? null;
  const live: Item = wcLive
    ? { kind: "wc", f: wcLive }
    : liveGames[0]
      ? { kind: "espn", t: liveGames[0] }
      : null;

  // Next: whichever starts sooner
  const wcNext =
    wcFixtures
      .filter((f) => f.status === "notstarted")
      .sort((a, b) => a.startTs - b.startTs)[0] ?? null;
  const espnNext = upcomingGames[0] ?? null;
  let next: Item = null;
  if (wcNext && (!espnNext || wcNext.startTs < espnNext.game.startTs)) {
    next = { kind: "wc", f: wcNext };
  } else if (espnNext) {
    next = { kind: "espn", t: espnNext };
  }

  // Recent: latest finished
  const wcRecent =
    wcFixtures
      .filter((f) => f.status === "finished")
      .sort((a, b) => b.startTs - a.startTs)[0] ?? null;
  const espnRecent = finalGames[0] ?? null;
  let recent: Item = null;
  if (wcRecent && (!espnRecent || wcRecent.startTs > espnRecent.game.startTs)) {
    recent = { kind: "wc", f: wcRecent };
  } else if (espnRecent) {
    recent = { kind: "espn", t: espnRecent };
  }

  if (!live && !next && !recent) return null;

  const slots: { tone: Tone; label: string; icon: React.ReactNode; item: Item; fallback: string }[] = [
    {
      tone: "live",
      label: "Live now",
      icon: <Flame className="size-4" aria-hidden="true" />,
      item: live,
      fallback: "No live matches",
    },
    {
      tone: "next",
      label: "Next up",
      icon: <Clock className="size-4" aria-hidden="true" />,
      item: next,
      fallback: "Nothing scheduled",
    },
    {
      tone: "recent",
      label: "Just finished",
      icon: <CheckCircle2 className="size-4" aria-hidden="true" />,
      item: recent,
      fallback: "No recent results",
    },
  ];

  return (
    <section className="space-y-3" aria-labelledby="for-you-heading">
      <h2
        id="for-you-heading"
        className="text-micro uppercase text-muted-foreground"
      >
        For you
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {slots.map((s) => (
          <Slot key={s.tone} {...s} />
        ))}
      </div>
    </section>
  );
}

function Slot({
  tone,
  icon,
  label,
  item,
  fallback,
}: {
  tone: Tone;
  icon: React.ReactNode;
  label: string;
  item: Item;
  fallback: string;
}) {
  const shell =
    "group relative flex min-h-[128px] flex-col rounded-xl border border-border bg-card/60 p-3.5 transition-transform hover:-translate-y-0.5";

  const head = (
    <div className={`inline-flex items-center gap-1.5 text-micro uppercase ${TONE_TEXT[tone]}`}>
      {icon} {label}
    </div>
  );

  if (!item) {
    return (
      <div className={shell}>
        {head}
        <div className="grid flex-1 place-items-center text-caption text-muted-foreground">
          {fallback}
        </div>
      </div>
    );
  }

  if (item.kind === "wc") {
    const f = item.f;
    const deepLink = f.id > 0;
    const body = (
      <>
        {head}
        <div className="mt-2 flex min-w-0 flex-1 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <TeamRow name={f.home.name} score={f.status === "notstarted" ? null : f.home.goals} flag />
            <TeamRow name={f.away.name} score={f.status === "notstarted" ? null : f.away.goals} flag />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-micro text-muted-foreground">
          <span className="truncate">WC2026 · {f.group}</span>
          <span className="font-semibold text-foreground">
            {f.status === "notstarted"
              ? <LocalTime ts={f.startTs * 1000} />
              : f.status === "inprogress"
                ? `${f.minute ?? ""}'`
                : "FT"}
            <ArrowRight className="ml-1 inline size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </>
    );
    return deepLink ? (
      <Link
        to="/football/match/$id"
        params={{ id: String(f.id) }}
        className={`${shell} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {body}
      </Link>
    ) : (
      <Link
        to="/football"
        search={{ year: 2026 }}
        className={`${shell} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {body}
      </Link>
    );
  }

  const { sport, game } = item.t;
  return (
    <Link
      to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
      className={`${shell} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {head}
      <div className="mt-2 flex min-w-0 flex-1 flex-col gap-1">
        <TeamRow name={game.home.name} score={game.status === "pre" ? null : game.home.score} />
        <TeamRow name={game.away.name} score={game.status === "pre" ? null : game.away.score} />
      </div>
      <div className="mt-2 flex items-center justify-between text-micro text-muted-foreground">
        <span className="truncate">
          <span aria-hidden="true">{sport.emoji}</span> {sport.label}
        </span>
        <span className="font-semibold text-foreground">
          {game.status === "pre"
            ? <LocalTime ts={game.startTs * 1000} />
            : game.statusDetail || (game.status === "in" ? "Live" : "Final")}
          <ArrowRight className="ml-1 inline size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function TeamRow({
  name,
  score,
  flag = false,
}: {
  name: string;
  score?: number | null;
  flag?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {flag && (
        <span className="shrink-0 text-base leading-none" aria-hidden="true">
          {flagOf(name)}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-caption font-bold text-foreground">{name}</span>
      {score !== null && score !== undefined && (
        <span className="shrink-0 text-caption font-black tabular-nums text-foreground">{score}</span>
      )}
    </div>
  );
}
