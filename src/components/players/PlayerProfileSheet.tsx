import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Share2, ExternalLink, Plus, Check, Trophy, Flame, Target, Zap, Award } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { flagOf } from "@/lib/flags";
import {
  parsePlayerKey,
  parseComparePlayers,
  joinComparePlayers,
  playerKey,
  type PlayersSearch,
} from "@/lib/players-filters";
import cardsData from "@/data/wc_cards.json";
import { useMergedGoals } from "@/lib/use-merged-goals";
import { CareerSparkline } from "@/components/players/CareerSparkline";

type CardRow = {
  pid: string; name: string; team: string; year: number;
  type: "yellow" | "red"; pos: string;
};
const CARDS = cardsData as CardRow[];

export function PlayerProfileSheet() {
  const search = useSearch({ from: "/players" });
  const navigate = useNavigate({ from: "/players" });
  const player = parsePlayerKey(search.player);

  const close = () =>
    navigate({ search: (prev: PlayersSearch) => ({ ...prev, player: "" }), replace: true });

  const open = !!player;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && close()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-amber-500/20 bg-gradient-to-b from-[#0b0a17] via-[#0e0b1f] to-[#08070f]"
      >
        <SheetHeader className="text-left p-0">
          <SheetTitle className="sr-only">Player profile</SheetTitle>
        </SheetHeader>
        {player && <ProfileBody player={player} />}
      </SheetContent>
    </Sheet>
  );
}

function ProfileBody({ player }: { player: { name: string; country: string } }) {
  const { goals: ALL_GOALS } = useMergedGoals();
  const search = useSearch({ from: "/players" });
  const navigate = useNavigate({ from: "/players" });

  const goals = useMemo(
    () => ALL_GOALS.filter((g) => !g.og && g.name === player.name && g.pteam === player.country),
    [player, ALL_GOALS],
  );
  const cards = useMemo(
    () => CARDS.filter((c) => c.name === player.name && c.team === player.country),
    [player],
  );

  const compareList = parseComparePlayers(search.compare);
  const inCompare = compareList.some(
    (p) => p.name === player.name && p.country === player.country,
  );
  const toggleCompare = () => {
    const next = inCompare
      ? compareList.filter((p) => !(p.name === player.name && p.country === player.country))
      : [...compareList, { name: player.name, country: player.country }].slice(0, 4);
    navigate({
      search: (prev: PlayersSearch) => ({ ...prev, compare: joinComparePlayers(next), tab: "compare" }),
      replace: true,
    });
  };

  const byYear = useMemo(() => {
    const m = new Map<number, { goals: number; pen: number; yellow: number; red: number }>();
    for (const g of goals) {
      const r = m.get(g.year) ?? { goals: 0, pen: 0, yellow: 0, red: 0 };
      r.goals++;
      if (g.pen) r.pen++;
      m.set(g.year, r);
    }
    for (const c of cards) {
      const r = m.get(c.year) ?? { goals: 0, pen: 0, yellow: 0, red: 0 };
      if (c.type === "yellow") r.yellow++;
      else r.red++;
      m.set(c.year, r);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a - b);
  }, [goals, cards]);

  const tournaments = byYear.length;
  const penalties = goals.filter((g) => g.pen).length;
  const yellow = cards.filter((c) => c.type === "yellow").length;
  const red = cards.filter((c) => c.type === "red").length;
  const live2026 = goals.filter((g) => g.year === 2026).length;
  const bestYear = byYear.reduce<{ year: number; goals: number } | null>(
    (acc, [y, r]) => (!acc || r.goals > acc.goals ? { year: y, goals: r.goals } : acc),
    null,
  );
  const gpt = tournaments ? +(goals.length / tournaments).toFixed(2) : 0;

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("player", playerKey(player.name, player.country));
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch { /* noop */ }
  };

  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="pb-8">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* animated gradient wash */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, oklch(0.62 0.22 30 / 0.55), transparent 60%), radial-gradient(120% 80% at 100% 20%, oklch(0.65 0.22 300 / 0.5), transparent 55%), linear-gradient(180deg, oklch(0.22 0.05 280) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 12px)",
          }}
        />
        {live2026 > 0 && (
          <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 backdrop-blur px-2.5 py-1 ring-1 ring-emerald-400/50 text-emerald-200 text-[10px] font-bold uppercase tracking-widest">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · WC 2026
          </div>
        )}

        <div className="relative px-6 pt-8 pb-6">
          <div className="text-[10px] uppercase tracking-[0.24em] text-amber-300/90 font-bold mb-3">
            Player Profile
          </div>

          <div className="flex items-center gap-4">
            {/* Big flag disc */}
            <div className="relative">
              <div className="size-20 rounded-full grid place-items-center text-5xl bg-white/10 backdrop-blur-xl ring-2 ring-white/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
                {flagOf(player.country)}
              </div>
              <div className="absolute -bottom-1 -right-1 size-8 rounded-full grid place-items-center text-[10px] font-black text-black bg-gradient-to-br from-amber-300 to-yellow-500 ring-2 ring-[#0b0a17] shadow-lg">
                {initials}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                {player.name}
              </h3>
              <div className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                <span className="font-semibold">{player.country}</span>
                {tournaments > 0 && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="text-amber-300/90">{tournaments} WC{tournaments === 1 ? "" : "s"}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hero KPI ribbon */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            <HeroKpi
              icon={<Target className="size-3.5" />}
              value={goals.length}
              label="Goals"
              tone="amber"
            />
            <HeroKpi
              icon={<Trophy className="size-3.5" />}
              value={tournaments}
              label="World Cups"
              tone="violet"
            />
            <HeroKpi
              icon={<Zap className="size-3.5" />}
              value={gpt}
              label="G / WC"
              tone="rose"
            />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div className="px-6 space-y-5 mt-5">
        {/* Secondary stat grid */}
        <div className="grid grid-cols-4 gap-2">
          <MiniStat label="Penalty" value={penalties} tint="text-orange-300" bg="from-orange-500/15" />
          <MiniStat label="🟨" value={yellow} tint="text-yellow-300" bg="from-yellow-500/15" />
          <MiniStat label="🟥" value={red} tint="text-red-400" bg="from-red-500/15" />
          <MiniStat label="Best yr" value={bestYear?.goals ?? 0} sub={bestYear ? String(bestYear.year) : ""} tint="text-emerald-300" bg="from-emerald-500/15" />
        </div>

        {byYear.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-amber-300/80 font-bold mb-2">
              <Flame className="size-3" /> Career arc
            </div>
            <CareerSparkline data={byYear.map(([year, r]) => ({ year, goals: r.goals }))} />
          </div>
        )}

        {byYear.length > 0 && (
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold flex items-center gap-1.5">
                <Award className="size-3 text-amber-300" /> Tournament breakdown
              </div>
              <div className="text-[10px] text-white/40">{byYear.length} entries</div>
            </div>
            <div className="grid grid-cols-[minmax(60px,80px)_1fr_36px_28px_28px] gap-2 px-4 py-2 text-[9px] uppercase tracking-wider text-white/40 font-semibold">
              <div>Year</div>
              <div>Output</div>
              <div className="text-right">Pen</div>
              <div className="text-right">🟨</div>
              <div className="text-right">🟥</div>
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {byYear.map(([y, r]) => {
                const maxG = Math.max(1, ...byYear.map(([, x]) => x.goals));
                const pct = Math.round((r.goals / maxG) * 100);
                const isLive = y === 2026;
                return (
                  <li
                    key={y}
                    className={`grid grid-cols-[minmax(60px,80px)_1fr_36px_28px_28px] gap-2 items-center px-4 py-2.5 text-sm tabular-nums border-t border-white/5 ${
                      isLive ? "bg-emerald-500/[0.06]" : ""
                    }`}
                  >
                    <div className="font-black flex items-center gap-1.5 text-white">
                      {y}
                      {isLive && (
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLive
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                              : "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
                          } transition-all duration-700`}
                          style={{ width: r.goals ? `${Math.max(6, pct)}%` : "0%" }}
                        />
                      </div>
                      <span className={`w-6 text-right font-black ${isLive ? "text-emerald-300" : "text-amber-300"}`}>
                        {r.goals || "·"}
                      </span>
                    </div>
                    <div className="text-right text-white/60">{r.pen || ""}</div>
                    <div className="text-right text-yellow-400">{r.yellow || ""}</div>
                    <div className="text-right text-red-400">{r.red || ""}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            onClick={toggleCompare}
            size="sm"
            className={`gap-1.5 font-bold ${
              inCompare
                ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black"
            }`}
          >
            {inCompare ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {inCompare ? "In Compare" : "Add to Compare"}
          </Button>
          <Button
            onClick={share}
            size="sm"
            variant="outline"
            className="gap-1.5 border-white/15 bg-white/5 hover:bg-white/10 text-white"
          >
            <Share2 className="size-3.5" /> Share
          </Button>
          <a
            href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(player.name + " footballer")}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-amber-300 transition-colors"
          >
            Wikipedia <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function HeroKpi({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  tone: "amber" | "violet" | "rose";
}) {
  const styles = {
    amber: "from-amber-400/25 to-amber-500/5 ring-amber-300/30 text-amber-200",
    violet: "from-violet-400/25 to-fuchsia-500/5 ring-violet-300/30 text-violet-200",
    rose: "from-rose-400/25 to-pink-500/5 ring-rose-300/30 text-rose-200",
  }[tone];
  return (
    <div className={`rounded-xl bg-gradient-to-br ${styles} ring-1 backdrop-blur px-3 py-2.5`}>
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest opacity-80">
        {icon} {label}
      </div>
      <div className="text-2xl font-black tabular-nums text-white mt-0.5 leading-none">
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tint,
  bg,
}: {
  label: string;
  value: number | string;
  sub?: string;
  tint: string;
  bg: string;
}) {
  return (
    <div className={`rounded-lg bg-gradient-to-b ${bg} to-transparent border border-white/5 py-2 text-center`}>
      <div className={`text-lg font-extrabold tabular-nums leading-none ${tint}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-white/50 mt-1">{label}</div>
      {sub && <div className="text-[9px] text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}
