import { Bell, BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { useMatchReminders } from "@/hooks/use-match-reminders";

export function MatchReminderBell({ fx }: { fx: Wc2026Fixture }) {
  const { has, add, remove } = useMatchReminders();
  if (fx.status !== "notstarted") return null;
  const startMs = fx.startTs * 1000;
  const leadPassed = startMs - 15 * 60_000 <= Date.now();
  const active = has(fx.id);

  const onClick = async () => {
    if (active) {
      remove(fx.id);
      toast("Reminder cleared");
      return;
    }
    if (leadPassed) {
      toast("Kickoff too soon for a 15-min reminder");
      return;
    }
    const ok = await add({
      matchId: fx.id,
      title: `${fx.home.name} v ${fx.away.name}`,
      startMs,
      url: `/football/match/${fx.id}`,
    });
    toast(ok ? "Reminder set · 15 min before kickoff" : "Notifications blocked by your browser");
  };

  const Icon = active ? BellRing : leadPassed ? BellOff : Bell;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Remove reminder" : "Remind me 15 minutes before kickoff"}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
        active
          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
          : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10"
      }`}
    >
      <Icon className="size-3" />
      {active ? "On" : "Remind"}
    </button>
  );
}
