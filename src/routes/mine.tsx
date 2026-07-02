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

export const Route = createFileRoute("/mine")({
  head: () => ({
    meta: [
      { title: "My Feed — Favorite Teams & Reminders | PlaySports" },
      { name: "description", content: "Your personal cross-sport feed on PlaySports: favorite teams' live matches, upcoming fixtures with kickoff reminders and recent results — football, cricket, NBA, NHL, MLB, MLS." },
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
    football: [], cricket: [], nba: [], nhl: [], mlb: [], mls: [],
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

  const { items: reminders, add: addReminder, has: hasReminder, remove: removeReminder } = useMatchReminders();
  const { live, upcoming, recent, loading } = useMyMatches(snapshot);
  const totalStarred = Object.values(snapshot).reduce((s, l) => s + l.length, 0);

  // Auto-schedule reminders + fire result notifications when notify is on.
  useEffect(() => {
    if (!notify || typeof window === "undefined") return;
    // Upcoming → auto-remind (football only for now; matches Reminder shape).
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
    // Recent results → fire once per match transition
    if (window.localStorage.getItem(NOTIFY_RESULTS_KEY) === "off") return;
    recent.forEach((m) => {
      const cacheK = LAST_RESULT_KEY + m.key;
      const prev = window.localStorage.getItem(cacheK);
      const now = `${m.home.score ?? "-"}-${m.away.score ?? "-"}`;
      if (prev === now) return;
      window.localStorage.setItem(cacheK, now);
      if (prev == null) return; // first-time seen → don't notify
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          const n = new Notification("Full-time", {
            body: `${m.home.name} ${m.home.score ?? ""}–${m.away.score ?? ""} ${m.away.name}`,
            tag: m.key,
          });
          n.onclick = () => { window.focus(); window.location.href = m.href; };
        }
      } catch { /* ignore */ }
    });
  }, [notify, upcoming, recent, addReminder, hasReminder]);

  const toggleNotify = async () => {
    if (notify) {
      window.localStorage.setItem(NOTIFY_KEY, "off");
      setNotify(false);
      toast("Notifications paused");
      return;
    }
    if (!("Notification" in window)) { toast("This browser doesn't support notifications"); return; }
    let p = Notification.permission;
    if (p === "default") p = await Notification.requestPermission();
    if (p !== "granted") { toast("Notifications blocked by your browser"); return; }
    window.localStorage.setItem(NOTIFY_KEY, "on");
    setNotify(true);
    toast("Notifications on · we'll ping you 15 min before kickoff");
  };

  const openPicker = (s: Sport) => { setPickerSport(s); setPickerOpen(true); };

  return (
    <div className="min-h-dvh bg-black text-foreground pb-20">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-3 py-2.5 flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white shrink-0">
            <ChevronLeft className="size-4" /> Home
          </Link>
          <h1 className="flex-1 text-center text-sm font-bold text-white truncate">
            <Star className="inline size-4 text-amber-300 mr-1 -mt-0.5 fill-amber-300" />
            My Feed
          </h1>
          <button
            onClick={toggleNotify}
            title={notify ? "Turn notifications off" : "Turn notifications on"}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
              notify
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            {notify ? <Bell className="size-3" /> : <BellOff className="size-3" />}
            {notify ? "On" : "Off"}
          </button>
          <button
            onClick={() => openPicker("football")}
            className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-200 px-2 py-1 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/25"
          >
            <Plus className="size-3" /> Add
          </button>
        </div>
        {notify && (
          <div className="text-[10px] text-center text-emerald-300/70 pb-1.5">
            Reminders fire 15 min before kickoff · works only while a tab is open
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-5">
        {totalStarred === 0 && <EmptyState onPick={openPicker} />}

        {live.length > 0 && (
          <FeedSection title="Live now" tone="text-red-300" pulse>
            {live.map((m) => <MatchRow key={m.key} m={m} />)}
          </FeedSection>
        )}
        {upcoming.length > 0 && (
          <FeedSection title="Upcoming" tone="text-sky-300">
            {upcoming.map((m) => (
              <MatchRow
                key={m.key} m={m}
                reminderNode={
                  m.sport === "football" && typeof m.matchId === "number"
                    ? <ReminderButton
                        active={hasReminder(m.matchId)}
                        onToggle={async () => {
                          const id = m.matchId as number;
                          if (hasReminder(id)) { removeReminder(id); toast("Reminder cleared"); return; }
                          const ok = await addReminder({
                            matchId: id,
                            title: `${m.home.name} v ${m.away.name}`,
                            startMs: m.startMs,
                            url: m.href,
                          });
                          toast(ok ? "Reminder set" : "Notifications blocked");
                        }}
                      />
                    : null
                }
              />
            ))}
          </FeedSection>
        )}
        {recent.length > 0 && (
          <FeedSection title="Recent results" tone="text-emerald-300">
            {recent.map((m) => <MatchRow key={m.key} m={m} showResult />)}
          </FeedSection>
        )}
        {totalStarred > 0 && live.length === 0 && upcoming.length === 0 && recent.length === 0 && !loading && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center text-xs text-gray-400">
            No scheduled matches yet for your starred teams — check back closer to matchday.
          </div>
        )}

        {reminders.length > 0 && (
          <FeedSection title={`Active reminders (${reminders.length})`} tone="text-amber-300">
            {reminders.map((r) => (
              <li key={r.matchId} className="flex items-center justify-between rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs">
                <Link to="/football/match/$id" params={{ id: String(r.matchId) }} className="flex-1 min-w-0 truncate text-white font-semibold hover:text-amber-300">
                  {r.title}
                </Link>
                <span className="text-gray-500 shrink-0 tabular-nums mx-3">{formatLocalTime(r.startMs)}</span>
                <button onClick={() => removeReminder(r.matchId)} className="text-gray-500 hover:text-red-300" aria-label="Clear reminder">
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </FeedSection>
        )}

        <StarredGrid snapshot={snapshot} onPick={openPicker} />
      </main>

      <FavoriteTeamPicker open={pickerOpen} onOpenChange={setPickerOpen} initialSport={pickerSport} />
    </div>
  );
}

function FeedSection({ title, tone, pulse, children }: { title: string; tone: string; pulse?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className={`mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${tone}`}>
        {pulse && <span className="inline-block size-1.5 rounded-full bg-red-500 animate-pulse" />}
        {title}
      </div>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function MatchRow({ m, showResult, reminderNode }: { m: MyMatch; showResult?: boolean; reminderNode?: React.ReactNode }) {
  const meta = SPORT_META[m.sport];
  const isTeamGame = m.sport === "football" || m.sport === "cricket";
  const teamWon =
    showResult && m.home.score != null && m.away.score != null
      ? (m.home.name === m.starredTeam ? (m.home.score > m.away.score ? "W" : m.home.score < m.away.score ? "L" : "D")
                                       : (m.away.score > m.home.score ? "W" : m.away.score < m.home.score ? "L" : "D"))
      : null;
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition">
      <Link to={m.href as any} className="flex items-center gap-3 px-3 py-2.5">
        <span className="text-base leading-none shrink-0">{meta.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500">
            <span className={meta.tone}>{meta.label}</span>
            <span>·</span>
            <span className="truncate">{m.label}</span>
          </div>
          <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
            {isTeamGame && <span className="text-sm">{flagOf(m.home.name)}</span>}
            <span className={m.home.name === m.starredTeam ? "text-amber-200" : ""}>{m.home.name}</span>
            {m.home.score != null && (
              <span className="tabular-nums text-gray-300 ml-1">{m.home.score}</span>
            )}
            <span className="text-gray-500 mx-1">v</span>
            {m.away.score != null && (
              <span className="tabular-nums text-gray-300 mr-1">{m.away.score}</span>
            )}
            <span className={m.away.name === m.starredTeam ? "text-amber-200" : ""}>{m.away.name}</span>
            {isTeamGame && <span className="text-sm">{flagOf(m.away.name)}</span>}
          </div>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          {teamWon && (
            <span className={`inline-flex items-center justify-center size-5 rounded text-[10px] font-extrabold ${
              teamWon === "W" ? "bg-emerald-500/20 text-emerald-300" :
              teamWon === "L" ? "bg-red-500/20 text-red-300" :
              "bg-gray-500/20 text-gray-300"
            }`}>{teamWon}</span>
          )}
          {m.status === "live" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-300">
              <Circle className="size-1.5 fill-red-500 text-red-500 animate-pulse" /> Live
            </span>
          ) : (
            <span className="text-[11px] tabular-nums text-gray-400">{formatLocalTime(m.startMs)}</span>
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
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
        active
          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
          : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10"
      }`}
    >
      <Bell className="size-3" />
      {active ? "On" : "Remind"}
    </button>
  );
}

function StarredGrid({ snapshot, onPick }: { snapshot: Record<Sport, string[]>; onPick: (s: Sport) => void }) {
  const sports: Sport[] = ["football", "cricket", "nba", "nhl", "mlb", "mls"];
  return (
    <section className="pt-2">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Your teams</div>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{meta.emoji}</span>
        <span className={`text-xs font-bold uppercase tracking-widest ${meta.tone}`}>{meta.label}</span>
        <Link to={meta.hub as any} className="ml-auto text-[10px] uppercase tracking-widest text-gray-500 hover:text-white">Open</Link>
        <button onClick={onAdd} className="text-[10px] uppercase tracking-widest text-amber-300 hover:text-amber-200 inline-flex items-center gap-1">
          <Plus className="size-3" /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-[11px] text-gray-500">No teams starred yet.</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((name) => (
            <button
              key={name}
              onClick={() => toggle(name)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-gray-200 hover:border-red-400/40 hover:text-red-200"
              title={`Unstar ${name}`}
            >
              {showFlag && <span className="text-sm leading-none">{flagOf(name)}</span>}
              <span>{name}</span>
              <X className="size-3 opacity-40 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: Sport) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-8 text-center">
      <Star className="mx-auto size-10 text-amber-300 mb-3 fill-amber-300/40" />
      <h2 className="text-lg font-bold text-white mb-1">Choose your favorite teams</h2>
      <p className="text-sm text-gray-400 mb-4">
        Pick teams across sports and we'll build a personal feed — live matches, upcoming fixtures with kickoff reminders and recent results.
      </p>
      <button
        onClick={() => onPick("football")}
        className="inline-flex items-center gap-2 rounded-full bg-amber-500 text-black font-bold px-4 py-2 text-sm hover:bg-amber-400"
      >
        <Plus className="size-4" /> Add favorite teams
      </button>
    </div>
  );
}
