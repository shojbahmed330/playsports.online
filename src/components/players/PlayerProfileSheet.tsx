import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Share2, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { flagOf } from "@/lib/flags";
import { parsePlayerKey, playerKey, type PlayersSearch } from "@/lib/players-filters";
import cardsData from "@/data/wc_cards.json";
import { useMergedGoals } from "@/lib/use-merged-goals";

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
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">Player profile</SheetTitle>
        </SheetHeader>
        {player && <ProfileBody player={player} />}
      </SheetContent>
    </Sheet>
  );
}

function ProfileBody({ player }: { player: { name: string; country: string } }) {
  const { goals: ALL_GOALS } = useMergedGoals();
  const goals = useMemo(
    () => ALL_GOALS.filter((g) => !g.og && g.name === player.name && g.pteam === player.country),
    [player, ALL_GOALS],
  );
  const cards = useMemo(
    () => CARDS.filter((c) => c.name === player.name && c.team === player.country),
    [player],
  );

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

  const opponents = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of goals) m.set(g.team, (m.get(g.team) ?? 0) + 1);
    // g.team is player's country; we don't have opponent in dataset. Skip.
    return [] as { team: string; goals: number }[];
  }, [goals]);
  void opponents;

  const tournaments = byYear.length;
  const penalties = goals.filter((g) => g.pen).length;

  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("player", playerKey(player.name, player.country));
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // noop
    }
  };

  return (
    <div className="space-y-5 mt-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-gold mb-1">
          Player Profile
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{flagOf(player.country)}</span>
          <div>
            <h3 className="text-2xl font-bold leading-tight">{player.name}</h3>
            <div className="text-sm text-muted-foreground">{player.country}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <StatBlock label="Goals" value={goals.length} accent />
        <StatBlock label="Penalties" value={penalties} />
        <StatBlock label="WC" value={tournaments} />
        <StatBlock
          label="G/WC"
          value={tournaments ? +(goals.length / tournaments).toFixed(1) : 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <StatBlock label="🟨 Yellow" value={cards.filter((c) => c.type === "yellow").length} />
        <StatBlock label="🟥 Red" value={cards.filter((c) => c.type === "red").length} />
      </div>

      {byYear.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <div>Year</div>
            <div className="text-right">Goals</div>
            <div className="text-right">Pen</div>
            <div className="text-right">🟨</div>
            <div className="text-right">🟥</div>
          </div>
          <ul className="divide-y divide-border max-h-72 overflow-y-auto">
            {byYear.map(([y, r]) => (
              <li key={y} className="grid grid-cols-5 gap-2 px-3 py-2 text-sm tabular-nums">
                <div className="font-semibold">{y}</div>
                <div className="text-right text-gold font-bold">{r.goals || ""}</div>
                <div className="text-right text-muted-foreground">{r.pen || ""}</div>
                <div className="text-right text-yellow-400">{r.yellow || ""}</div>
                <div className="text-right text-red-400">{r.red || ""}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button onClick={share} variant="outline" size="sm" className="gap-1.5">
          <Share2 className="size-3.5" /> Copy link
        </Button>
        <a
          href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(player.name + " footballer")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Wikipedia <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-card border border-border py-2">
      <div className={`text-xl font-extrabold tabular-nums ${accent ? "text-gold" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
