import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, ChevronLeft, ExternalLink, X } from "lucide-react";
import { readAllStarred, useStarred, type Sport } from "@/lib/starred";
import { useMatchReminders } from "@/hooks/use-match-reminders";
import { formatLocalTime } from "@/lib/time";
import { flagOf } from "@/lib/flags";

export const Route = createFileRoute("/mine")({
  head: () => ({
    meta: [
      { title: "My Feed — All Starred Teams" },
      { name: "description", content: "Your personal feed across football, cricket, NBA, NHL, MLB and MLS: starred teams and active match reminders in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinePage,
});

const SPORTS: { key: Sport; label: string; href: string; tone: string }[] = [
  { key: "football", label: "Football", href: "/football", tone: "text-amber-300 border-amber-400/40 bg-amber-500/10" },
  { key: "cricket",  label: "Cricket",  href: "/cricket",  tone: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10" },
  { key: "nba",      label: "NBA",      href: "/nba",      tone: "text-orange-300 border-orange-400/40 bg-orange-500/10" },
  { key: "nhl",      label: "NHL",      href: "/nhl",      tone: "text-sky-300 border-sky-400/40 bg-sky-500/10" },
  { key: "mlb",      label: "MLB",      href: "/mlb",      tone: "text-red-300 border-red-400/40 bg-red-500/10" },
  { key: "mls",      label: "MLS",      href: "/mls",      tone: "text-purple-300 border-purple-400/40 bg-purple-500/10" },
];

function MinePage() {
  const [snapshot, setSnapshot] = useState<Record<Sport, string[]>>({
    football: [], cricket: [], nba: [], nhl: [], mlb: [], mls: [],
  });
  useEffect(() => {
    setSnapshot(readAllStarred());
    const sync = () => setSnapshot(readAllStarred());
    window.addEventListener("starred:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("starred:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const { items: reminders, remove } = useMatchReminders();
  const totalStarred = Object.values(snapshot).reduce((s, l) => s + l.length, 0);

  return (
    <div className="min-h-dvh bg-black text-foreground pb-20">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-3 py-2.5 flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white">
            <ChevronLeft className="size-4" /> Home
          </Link>
          <h1 className="flex-1 text-center text-sm font-bold text-white">
            <Star className="inline size-4 text-amber-300 mr-1 -mt-0.5 fill-amber-300" />
            My Feed
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 tabular-nums">
            {totalStarred} starred
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5">
        {totalStarred === 0 && reminders.length === 0 && <EmptyState />}

        {reminders.length > 0 && (
          <section>
            <SectionHeader label={`Active reminders (${reminders.length})`} tone="text-sky-300" />
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.matchId} className="flex items-center justify-between rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs">
                  <Link
                    to="/football/match/$id"
                    params={{ id: String(r.matchId) }}
                    className="flex-1 min-w-0 truncate text-white font-semibold hover:text-amber-300"
                  >
                    {r.title}
                  </Link>
                  <span className="text-gray-500 shrink-0 tabular-nums mx-3">
                    {formatLocalTime(r.startMs)}
                  </span>
                  <button
                    onClick={() => remove(r.matchId)}
                    className="text-gray-500 hover:text-red-300"
                    aria-label="Clear reminder"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {SPORTS.map((s) => (
          <SportBlock key={s.key} sport={s.key} label={s.label} href={s.href} tone={s.tone} items={snapshot[s.key] ?? []} />
        ))}
      </main>
    </div>
  );
}

function SportBlock({
  sport, label, href, tone, items,
}: { sport: Sport; label: string; href: string; tone: string; items: string[] }) {
  const { toggle } = useStarred(sport);
  if (items.length === 0) return null;
  const showFlag = sport === "football" || sport === "cricket";
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <SectionHeader label={label} tone={tone.split(" ")[0]} />
        <Link
          to={href}
          className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white"
        >
          Open <ExternalLink className="size-3" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((name) => (
          <button
            key={name}
            onClick={() => toggle(name)}
            className={`group inline-flex items-center gap-1.5 rounded-full border text-xs font-bold px-3 py-1.5 ${tone}`}
            title={`Unstar ${name}`}
          >
            {showFlag && <span className="text-base leading-none">{flagOf(name)}</span>}
            <span>{name}</span>
            <X className="size-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ label, tone }: { label: string; tone: string }) {
  return (
    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${tone}`}>{label}</div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8 text-center">
      <Star className="mx-auto size-10 text-amber-300 mb-3" />
      <h2 className="text-lg font-bold text-white mb-1">Your feed is empty</h2>
      <p className="text-sm text-gray-400 mb-4">
        Tap the ⭐ on any team, player, or match across the site to build your personal feed.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SPORTS.map((s) => (
          <Link
            key={s.key}
            to={s.href}
            className={`inline-flex items-center gap-1 rounded-full border text-[11px] font-bold px-3 py-1.5 ${s.tone}`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
