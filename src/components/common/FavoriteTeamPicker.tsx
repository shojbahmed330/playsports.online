import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Star, Search, Check } from "lucide-react";
import { useStarred, type Sport } from "@/lib/starred";
import { TEAM_DIRECTORY, SPORT_META } from "@/data/team-directory";
import { flagOf } from "@/lib/flags";

const SPORTS: Sport[] = ["football", "cricket", "nba", "nhl", "mlb", "mls"];

export function FavoriteTeamPicker({
  open,
  onOpenChange,
  initialSport = "football",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialSport?: Sport;
}) {
  const [sport, setSport] = useState<Sport>(initialSport);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black border-white/10 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-white/10">
          <DialogTitle className="text-white flex items-center gap-2">
            <Star className="size-4 text-amber-300 fill-amber-300" />
            Choose your favorite teams
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-1">
            Star teams across every sport. They power your <span className="text-amber-300">My Feed</span> and reminders.
          </p>
        </DialogHeader>
        <Tabs value={sport} onValueChange={(v) => setSport(v as Sport)}>
          <TabsList className="w-full justify-start rounded-none bg-black border-b border-white/10 px-2 h-auto flex-wrap">
            {SPORTS.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 text-xs font-bold uppercase tracking-wider px-3 py-2"
              >
                <span className="mr-1">{SPORT_META[s].emoji}</span>
                {SPORT_META[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
          {SPORTS.map((s) => (
            <TabsContent key={s} value={s} className="mt-0">
              <TeamGrid sport={s} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function TeamGrid({ sport }: { sport: Sport }) {
  const [q, setQ] = useState("");
  const { has, toggle, items } = useStarred(sport);
  const teams = TEAM_DIRECTORY[sport];
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(query) || t.abbr?.toLowerCase().includes(query));
  }, [q, teams]);
  return (
    <div className="max-h-[60vh] flex flex-col">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${SPORT_META[sport].label} teams…`}
            className="pl-8 h-9 bg-white/5 border-white/10 text-sm text-white placeholder:text-gray-500"
          />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 tabular-nums shrink-0">
          {items.length} starred
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3 overflow-y-auto">
        {filtered.map((t) => {
          const active = has(t.name);
          const flag = t.flag ?? (["football", "cricket"].includes(sport) ? flagOf(t.name) : "");
          return (
            <button
              key={t.name}
              onClick={() => toggle(t.name)}
              className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition ${
                active
                  ? "bg-amber-500/15 border-amber-400/50 text-amber-100"
                  : "bg-white/[0.03] border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {flag && <span className="text-base leading-none shrink-0">{flag}</span>}
              <span className="truncate flex-1">{t.name}</span>
              {active ? (
                <Check className="size-3.5 text-amber-300 shrink-0" />
              ) : (
                <Star className="size-3.5 text-gray-500 group-hover:text-amber-300 shrink-0" />
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-xs text-gray-500 py-8">
            No teams match "{q}".
          </div>
        )}
      </div>
    </div>
  );
}
