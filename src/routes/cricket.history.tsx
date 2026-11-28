import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Award, Target } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import { EmptyState } from "@/components/ui/state";
import history from "@/data/cricket/history.json";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
type Champ = {
  year: number;
  champion: string;
  runnerUp: string;
  host?: string;
  venue?: string;
  result?: string;
};
type Stat = {
  player: string;
  country: string;
  matches: number;
  runs?: number;
  wickets?: number;
  avg: number;
  hundreds?: number;
};
type Tournament = {
  label: string;
  format: string;
  emoji: string;
  champions: Champ[];
  topRuns: Stat[];
  topWickets: Stat[];
};

const DATA = history as Record<string, Tournament>;
const SLUGS = Object.keys(DATA);

export const Route = createFileRoute("/cricket/history")({
  head: () => ({
    meta: [
      { title: "Cricket History & Records â€” World Cup, IPL, BBL, PSL" },
      {
        name: "description",
        content:
          "Champions, runs and wickets records for the ICC World Cup, T20 World Cup, IPL, BBL and PSL â€” full hall of fame.",
      },
      { property: "og:title", content: "Cricket History & Records" },
      {
        property: "og:description",
        content: "Champions and records across the ICC World Cup, IPL, BBL and PSL.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/history" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cricket History & Records â€” World Cup, IPL, BBL, PSL" },
      {
        name: "twitter:description",
        content:
          "Champions, runs and wickets records for the ICC World Cup, T20 World Cup, IPL, BBL and PSL â€” full hall of fame.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/history" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "History", path: "/cricket/history" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(HistoryPage, { sport: "cricket", currentPath: "/cricket/history" }),
});

function HistoryPage() {
  const [active, setActive] = useState<string>(SLUGS[0] ?? "");
  const t = DATA[active];

  const lastChamp = useMemo(() => {
    if (!t) return undefined;
    const sorted = [...t.champions].sort((a, b) => b.year - a.year);
    return sorted[0];
  }, [t]);

  if (!t) {
    return (
      <div className="min-h-screen">
        <SportNav />
        <CricketSubNav />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="No cricket history available"
            description="The history archive is empty right now."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      {/* Tournament selector â€” horizontal snap rail */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {SLUGS.map((s) => {
              const x = DATA[s];
              const on = active === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(s)}
                  className={[
                    "snap-start shrink-0 inline-flex min-h-11 items-center gap-1.5 px-3 rounded-full text-xs font-bold ring-1 transition-all",
                    on
                      ? "bg-gradient-to-r from-[var(--color-accent-cricket)] to-[var(--color-gold)] text-background ring-[var(--color-gold)]"
                      : "bg-muted hover:bg-muted ring-border text-foreground",
                  ].join(" ")}
                >
                  <span aria-hidden>{x.emoji}</span>
                  {x.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-accent-cricket)]/20 bg-gradient-to-br from-[var(--color-accent-cricket)] via-background to-[var(--color-gold)] p-5 sm:p-8">
          <div className="flex items-start gap-3 mb-3">
            <div
              className="size-12 sm:size-14 rounded-2xl bg-[var(--color-gold)]/15 ring-1 ring-[var(--color-gold)]/40 grid place-items-center text-2xl shrink-0"
              aria-hidden="true"
            >
              {t.emoji}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-gold)]">
                {t.format} Championship
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{t.label}</h1>
              <p className="text-sm text-[var(--color-accent-cricket)]/80 mt-1">
                {t.champions.length} editions Â· {new Set(t.champions.map((c) => c.champion)).size}{" "}
                different winners
              </p>
            </div>
          </div>
          {lastChamp && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <Mini
                icon={<Trophy aria-hidden="true" className="size-4 text-[var(--color-gold)]" />}
                label="Reigning champion"
                value={lastChamp.champion}
                sub={`Won ${lastChamp.year}`}
              />
              <Mini
                icon={<Award aria-hidden="true" className="size-4 text-[var(--color-accent-mlb)]" />}
                label="Most recent runner-up"
                value={lastChamp.runnerUp}
                sub={lastChamp.venue ?? "â€”"}
              />
              <Mini
                icon={<Target aria-hidden="true" className="size-4 text-[var(--color-accent-cricket)]" />}
                label="Editions held"
                value={String(t.champions.length)}
                sub={`${t.champions[0].year} â†’ ${lastChamp.year}`}
              />
            </div>
          )}
        </section>

        {/* Champions */}
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Trophy aria-hidden="true" className="size-5 text-[var(--color-gold)]" /> All-time champions
          </h2>
          {t.champions.length === 0 ? (
            <EmptyState
              title="No champions recorded"
              description="Winners will appear once this tournament has completed editions."
            />
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <caption className="sr-only">{t.label} champions by year</caption>
                <thead className="bg-background text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th scope="col" className="w-[16.6%] px-3 py-2 text-left">
                      Year
                    </th>
                    <th scope="col" className="w-[41.7%] px-3 py-2 text-left">
                      Champion
                    </th>
                    <th scope="col" className="px-3 py-2 text-left">
                      Runner-up Â· Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...t.champions]
                    .sort((a, b) => b.year - a.year)
                    .map((c) => (
                      <tr key={c.year} className="hover:bg-accent/30">
                        <td className="px-3 py-2.5 font-bold tabular-nums text-[var(--color-gold)]">
                          {c.year}
                        </td>
                        <td className="px-3 py-2.5 font-semibold">{c.champion}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          <span className="text-foreground/80">{c.runnerUp}</span>
                          {c.result && (
                            <span className="text-[11px] ml-2 opacity-70">Â· {c.result}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Leaders */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Leaderboard title="Most runs" data={t.topRuns} kind="runs" />
          <Leaderboard title="Most wickets" data={t.topWickets} kind="wickets" />
        </section>

        <p className="text-center text-[11px] text-muted-foreground">
          Records are compiled from public archives and updated each season.{" "}
          <Link
            to="/cricket"
            className="inline-flex min-h-11 items-center text-[var(--color-accent-cricket)] hover:underline"
          >
            Back to live scores â†’
          </Link>
        </p>
      </main>
    </div>
  );
}

function Mini({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-foreground">
        {icon} {label}
      </div>
      <div className="text-lg font-bold mt-1 truncate">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Leaderboard({
  title,
  data,
  kind,
}: {
  title: string;
  data: Stat[];
  kind: "runs" | "wickets";
}) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card/40">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-[var(--color-accent-cricket)]/10 to-[var(--color-gold)]/5">
        <h3 className="text-sm font-bold inline-flex items-center gap-1.5">
          {kind === "runs" ? (
            <Target aria-hidden="true" className="size-4 text-[var(--color-accent-cricket)]" />
          ) : (
            <Award aria-hidden="true" className="size-4 text-[var(--color-gold)]" />
          )}
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {data.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No leaderboard data recorded yet.
          </p>
        )}
        {data.map((p, i) => (
          <div key={p.player} className="px-3 py-2.5 flex items-center gap-3 text-sm">
            <div
              className={`size-7 rounded-full grid place-items-center text-[11px] font-bold shrink-0 ${
                i === 0
                  ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40"
                  : i === 1
                    ? "bg-muted text-foreground ring-1 ring-border"
                    : i === 2
                      ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/40"
                      : "bg-card text-foreground"
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <PlayerLink name={p.player} className="font-semibold truncate block">
                {p.player}
              </PlayerLink>
              <div className="text-[11px] text-muted-foreground truncate">
                {p.country} Â· {p.matches} matches Â· avg {p.avg}
              </div>
            </div>
            <div className="text-right tabular-nums shrink-0">
              <div className="text-base font-extrabold">{kind === "runs" ? p.runs : p.wickets}</div>
              {kind === "runs" && p.hundreds != null && (
                <div className="text-[10px] text-muted-foreground">{p.hundreds} Ã— 100</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
