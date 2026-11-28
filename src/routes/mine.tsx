import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Star, ChevronLeft, Plus, Bell, BellOff, X, Circle } from "lucide-react";
import { readAllStarred, useStarred, type Sport } from "@/lib/starred";
import { useMatchReminders } from "@/hooks/use-match-reminders";
import { useMyMatches, type MyMatch } from "@/hooks/use-my-matches";
import { FavoriteTeamPicker } from "@/components/common/FavoriteTeamPicker";
import { SPORT_META } from "@/data/team-directory";
import { formatLocalTime } from "@/lib/time";
import { flagOf } from "@/lib/flags";
import { toast } from "sonner";
import { EmptyState as SharedEmptyState } from "@/components/ui/state";

export const Route = createFileRoute("/mine")({
  head: () => ({
    meta: [
      { title: "My Feed â€” Favorite Teams & Reminders | PlaySports" },
      {
        name: "description",
        content:
          "Your personal cross-sport feed on PlaySports: favorite teams' live matches, upcoming fixtures with kickoff reminders and recent results â€” football, cricket, NBA, NHL, MLB, MLS.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinePage,
});

const NOTIFY_KEY = "mine:notify";
const NOTIFY_RESULTS_KEY = "mine:notify:results";
const LAST_RESULT_KEY = "mine:last-result:";

function MinePage() {
  const [snapshot, setSnapshot] = useState<Record<Sport, string[]>>({
    football: [],
    cricket: [],
    nba: [],
    nhl: [],
    mlb: [],
    mls: [],
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSport, setPickerSport] = useState<Sport>("football");
  const [notify, setNotify] = useState<boolean>(false);

  useEffect(() => {
    setSnapshot(readAllStarred());
    setNotify(typeof window !== "undefined" && window.localStorage.getItem(NOTIFY_KEY) === "on");
    const sync = () => setSnapshot(readAllStarred());
    window.addEventListener("starred:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("starred:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const {
    items: reminders,
    add: addReminder,
    has: hasReminder,
    remove: removeReminder,
  } = useMatchReminders();
  const { live, upcoming, recent, loading } = useMyMatches(snapshot);
  const totalStarred = Object.values(snapshot).reduce((s, l) => s + l.length, 0);

  // Auto-schedule reminders + fire result notifications when notify is on.
  useEffect(() => {
    if (!notify || typeof window === "undefined") return;
    // Upcoming â†’ auto-remind (football only for now; matches Reminder shape).
    upcoming.forEach((m) => {
      if (m.sport !== "football") return;
      if (typeof m.matchId !== "number") return;
      if (hasReminder(m.matchId)) return;
      if (m.startMs - 15 * 60_000 <= Date.now()) return;
      addReminder({
        matchId: m.matchId,
        title: `${m.home.name} v ${m.away.name}`,
        startMs: m.startMs,
        url: m.href,
      });
    });
    // Recent results â†’ fire once per match transition
    if (window.localStorage.getItem(NOTIFY_RESULTS_KEY) === "off") return;
    recent.forEach((m) => {
      const cacheK = LAST_RESULT_KEY + m.key;
      const prev = window.localStorage.getItem(cacheK);
      const now = `${m.home.score ?? "-"}-${m.away.score ?? "-"}`;
      if (prev === now) return;
      window.localStorage.setItem(cacheK, now);
      if (prev == null) return; // first-time seen â†’ don't notify
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          const n = new Notification("Full-time", {
            body: `${m.home.name} ${m.home.score ?? ""}â€“${m.away.score ?? ""} ${m.away.name}`,
            tag: m.key,
          });
          n.onclick = () => {
            window.focus();
            window.location.href = m.href;
          };
        }
      } catch {
        /* ignore */
      }
    });
  }, [notify, upcoming, recent, addReminder, hasReminder]);

  const toggleNotify = async () => {
    if (notify) {
      window.localStorage.setItem(NOTIFY_KEY, "off");
      setNotify(false);
      toast("Notifications paused");
      return;
    }
    if (!("Notification" in window)) {
      toast("This browser doesn't support notifications");
      return;
    }
    let p = Notification.permission;
    if (p === "default") p = await Notification.requestPermission();
    if (p !== "granted") {
      toast("Notifications blocked by your browser");
      return;
    }
    window.localStorage.setItem(NOTIFY_KEY, "on");
    setNotify(true);
    toast("Notifications on Â· we'll ping you 15 min before kickoff");
  };

  const openPicker = (s: Sport) => {
    setPickerSport(s);
    setPickerOpen(true);
  };

  return (
    <div className="min-h-dvh bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-3 py-2.5">
          <Link
            to="/"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-4" aria-hidden="true" /> Home
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-center text-sm font-bold text-foreground">
            <Star
              className="mr-1 -mt-0.5 inline size-4 fill-[var(--color-gold)] text-[var(--color-gold)]"
              aria-hidden="true"
            />
            My Feed
          </h1>
          <button
            type="button"
            onClick={toggleNotify}
            aria-pressed={notify}
            aria-label={notify ? "Turn match notifications off" : "Turn match notifications on"}
            title={notify ? "Turn notifications off" : "Turn notifications on"}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full border px-2 text-[10px] font-bold uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              notify
                ? "border-[var(--color-accent-cricket)]/40 bg-[var(--color-accent-cricket)]/15 text-[var(--color-accent-cricket)]"
                : "border-border bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {notify ? (
              <Bell className="size-3" aria-hidden="true" />
            ) : (
              <BellOff className="size-3" aria-hidden="true" />
            )}
            {notify ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={() => openPicker("football")}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/15 px-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] hover:bg-[var(--color-gold)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="size-3" aria-hidden="true" /> Add
          </button>
        </div>
        {notify && (
          <div className="text-[10px] text-center text-[var(--color-accent-cricket)]/70 pb-1.5">
            Reminders fire 15 min before kickoff Â· works only while a tab is open
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5">
        {totalStarred === 0 && (
          <SharedEmptyState
            title="Choose your favorite teams"
            description="Pick teams across sports and we'll build a personal feed â€” live matches, upcoming fixtures and recent results."
            action={
              <button
                type="button"
                onClick={() => openPicker("football")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-gold)] px-4 text-sm font-bold text-background hover:bg-[var(--color-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="size-4" aria-hidden="true" /> Add favorite teams
              </button>
            }
          />
        )}

        {loading && totalStarred > 0 && (
          <div
            className="flex items-center justify-center py-6 text-sm text-muted-foreground"
            role="status"
          >
            Loading your feedâ€¦
          </div>
        )}

        {live.length > 0 && (
          <FeedSection title="Live now" tone="text-[var(--color-live)]" pulse>
            {live.map((m) => (
              <MatchRow key={m.key} m={m} />
            ))}
          </FeedSection>
        )}
        {upcoming.length > 0 && (
          <FeedSection title="Upcoming" tone="text-[var(--color-accent-mlb)]">
            {upcoming.map((m) => (
              <MatchRow
                key={m.key}
                m={m}
                reminderNode={
                  m.sport === "football" && typeof m.matchId === "number" ? (
                    <ReminderButton
                      active={hasReminder(m.matchId)}
                      onToggle={async () => {
                        const id = m.matchId as number;
                        if (hasReminder(id)) {
                          removeReminder(id);
                          toast("Reminder cleared");
                          return;
                        }
                        const ok = await addReminder({
                          matchId: id,
                          title: `${m.home.name} v ${m.away.name}`,
                          startMs: m.startMs,
                          url: m.href,
                        });
                        toast(ok ? "Reminder set" : "Notifications blocked");
                      }}
                    />
                  ) : null
                }
              />
            ))}
          </FeedSection>
        )}
        {recent.length > 0 && (
          <FeedSection title="Recent results" tone="text-[var(--color-accent-cricket)]">
            {recent.map((m) => (
              <MatchRow key={m.key} m={m} showResult />
            ))}
          </FeedSection>
        )}
        {totalStarred > 0 &&
          live.length === 0 &&
          upcoming.length === 0 &&
          recent.length === 0 &&
          !loading && (
            <SharedEmptyState
              title="No scheduled matches yet"
              description="Check back closer to matchday for your starred teams."
            />
          )}

        {reminders.length > 0 && (
          <FeedSection title={`Active reminders (${reminders.length})`} tone="text-[var(--color-gold)]">
            {reminders.map((r) => (
              <li
                key={r.matchId}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs"
              >
                <Link
                  to="/football/match/$id"
                  params={{ id: String(r.matchId) }}
                  className="inline-flex min-h-11 min-w-0 flex-1 items-center truncate font-semibold text-foreground hover:text-[var(--color-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {r.title}
                </Link>
                <span className="mx-3 shrink-0 tabular-nums text-muted-foreground">
                  {formatLocalTime(r.startMs)}
                </span>
                <button
                  type="button"
                  onClick={() => removeReminder(r.matchId)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Clear reminder for ${r.title}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </FeedSection>
        )}

        <StarredGrid snapshot={snapshot} onPick={openPicker} />
      </main>

      <FavoriteTeamPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initialSport={pickerSport}
      />
    </div>
  );
}

function FeedSection({
  title,
  tone,
  pulse,
  children,
}: {
  title: string;
  tone: string;
  pulse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        className={`mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${tone}`}
      >
        {pulse && (
          <span className="inline-block size-1.5 rounded-full bg-[var(--color-live)]" aria-hidden="true" />
        )}
        {title}
      </div>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function MatchRow({
  m,
  showResult,
  reminderNode,
}: {
  m: MyMatch;
  showResult?: boolean;
  reminderNode?: React.ReactNode;
}) {
  const meta = SPORT_META[m.sport];
  const isTeamGame = m.sport === "football" || m.sport === "cricket";
  const teamWon =
    showResult && m.home.score != null && m.away.score != null
      ? m.home.name === m.starredTeam
        ? m.home.score > m.away.score
          ? "W"
          : m.home.score < m.away.score
            ? "L"
            : "D"
        : m.away.score > m.home.score
          ? "W"
          : m.away.score < m.home.score
            ? "L"
            : "D"
      : null;
  return (
    <li className="rounded-xl border border-border bg-card/40 transition hover:bg-accent/40">
      <Link
        to={m.href as any}
        className="flex min-h-11 items-center gap-3 px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="shrink-0 text-base leading-none" aria-hidden="true">
          {meta.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className={meta.tone}>{meta.label}</span>
            <span aria-hidden="true">Â·</span>
            <span className="truncate">{m.label}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
            {isTeamGame && (
              <span className="text-sm" aria-hidden="true">
                {flagOf(m.home.name)}
              </span>
            )}
            <span className={m.home.name === m.starredTeam ? "text-[var(--color-gold)]" : ""}>
              {m.home.name}
            </span>
            {m.home.score != null && (
              <span className="ml-1 tabular-nums text-muted-foreground">{m.home.score}</span>
            )}
            <span className="mx-1 text-muted-foreground">v</span>
            {m.away.score != null && (
              <span className="mr-1 tabular-nums text-muted-foreground">{m.away.score}</span>
            )}
            <span className={m.away.name === m.starredTeam ? "text-[var(--color-gold)]" : ""}>
              {m.away.name}
            </span>
            {isTeamGame && (
              <span className="text-sm" aria-hidden="true">
                {flagOf(m.away.name)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-right">
          {teamWon && (
            <span
              className={`inline-flex size-5 items-center justify-center rounded text-[10px] font-extrabold ${
                teamWon === "W"
                  ? "bg-[var(--color-accent-cricket)]/20 text-[var(--color-accent-cricket)]"
                  : teamWon === "L"
                    ? "bg-[var(--color-live)]/20 text-[var(--color-live)]"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {teamWon}
            </span>
          )}
          {m.status === "live" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-live)]">
              <Circle className="size-1.5 fill-[var(--color-live)] text-[var(--color-live)]" aria-hidden="true" /> Live
            </span>
          ) : (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {formatLocalTime(m.startMs)}
            </span>
          )}
          {reminderNode}
        </div>
      </Link>
    </li>
  );
}

function ReminderButton({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex min-h-11 items-center gap-1 rounded-full border px-2 text-[10px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-[var(--color-accent-cricket)]/40 bg-[var(--color-accent-cricket)]/15 text-[var(--color-accent-cricket)]"
          : "border-border bg-muted text-muted-foreground hover:bg-accent"
      }`}
    >
      <Bell className="size-3" aria-hidden="true" />
      {active ? "On" : "Remind"}
    </button>
  );
}

function StarredGrid({
  snapshot,
  onPick,
}: {
  snapshot: Record<Sport, string[]>;
  onPick: (s: Sport) => void;
}) {
  const sports: Sport[] = ["football", "cricket", "nba", "nhl", "mlb", "mls"];
  return (
    <section className="pt-2">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Your teams
      </div>
      <div className="grid gap-2">
        {sports.map((s) => (
          <SportRow key={s} sport={s} items={snapshot[s] ?? []} onAdd={() => onPick(s)} />
        ))}
      </div>
    </section>
  );
}

function SportRow({ sport, items, onAdd }: { sport: Sport; items: string[]; onAdd: () => void }) {
  const { toggle } = useStarred(sport);
  const meta = SPORT_META[sport];
  const showFlag = sport === "football" || sport === "cricket";
  return (
    <div className="rounded-xl border border-border bg-card/30 px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base" aria-hidden="true">
          {meta.emoji}
        </span>
        <span className={`text-xs font-bold uppercase tracking-widest ${meta.tone}`}>
          {meta.label}
        </span>
        <Link
          to={meta.hub as any}
          className="ml-auto inline-flex min-h-11 items-center text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-11 items-center gap-1 text-[10px] uppercase tracking-widest text-[var(--color-gold)] hover:text-[var(--color-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-3" aria-hidden="true" /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-[11px] text-muted-foreground">No teams starred yet.</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              aria-label={`Remove ${name} from favourites`}
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs text-foreground hover:border-[var(--color-live)]/40 hover:text-[var(--color-live)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title={`Unstar ${name}`}
            >
              {showFlag && (
                <span className="text-sm leading-none" aria-hidden="true">
                  {flagOf(name)}
                </span>
              )}
              <span>{name}</span>
              <X className="size-3 opacity-40 group-hover:opacity-100" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
