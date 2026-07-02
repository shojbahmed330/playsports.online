import { Zap, Users, Swords, Trophy, Star, ChevronDown, Circle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type SubNavTab = "today" | "groups" | "knockout" | "scorers";

const TABS: {
  id: SubNavTab;
  label: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;      // gradient (active pill / trigger)
  chip: string;        // small icon chip background
}[] = [
  { id: "today",    label: "Today",    hint: "Live & scheduled",  icon: <Zap className="size-4" />,    accent: "from-red-500 to-orange-400",   chip: "bg-red-500/15 text-red-300 ring-red-500/30" },
  { id: "groups",   label: "Groups",   hint: "Group stage table", icon: <Users className="size-4" />,  accent: "from-blue-500 to-cyan-400",    chip: "bg-blue-500/15 text-blue-300 ring-blue-500/30" },
  { id: "knockout", label: "Knockout", hint: "Bracket & rounds",  icon: <Swords className="size-4" />, accent: "from-rose-500 to-amber-400",   chip: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  { id: "scorers",  label: "Scorers",  hint: "Top goal scorers",  icon: <Trophy className="size-4" />, accent: "from-amber-400 to-yellow-300", chip: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
];

export interface SubNavBadges {
  today?: { count: number; live?: boolean; label?: string };
  groups?: { count: number; live?: boolean; label?: string };
  knockout?: { count: number; live?: boolean; label?: string };
  scorers?: { count: number; label?: string };
}

export function FootballSubNav({
  active,
  onChange,
  badges,
}: {
  active: SubNavTab;
  onChange: (t: SubNavTab) => void;
  badges?: SubNavBadges;
}) {
  const current = TABS.find((t) => t.id === active) ?? TABS[0];
  const anyLive = Object.values(badges ?? {}).some(
    (b) => b && "live" in b && (b as { live?: boolean }).live,
  );

  return (
    <div className="sticky top-16 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 backdrop-blur bg-background/85 border-b border-border/60 sm:border-0 sm:bg-transparent sm:backdrop-blur-0">
      <div className="flex items-center justify-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`group relative inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-black shadow-lg shadow-black/40 ring-1 ring-white/20 transition-all hover:brightness-110 active:scale-[0.98] bg-gradient-to-r ${current.accent}`}
            aria-label="Match schedule menu"
          >
            {anyLive && (
              <span className="relative inline-flex items-center justify-center">
                <span className="absolute size-3 rounded-full bg-red-500/60 animate-ping" />
                <span className="relative size-1.5 rounded-full bg-red-500 ring-2 ring-white/80" />
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              {current.icon}
              {current.label}
            </span>
            {(() => {
              const b = badges?.[current.id];
              return b && b.count > 0 ? (
                <span className="inline-flex items-center rounded-full bg-black/25 px-1.5 text-[10px] font-black tabular-nums leading-none py-0.5">
                  {b.count}
                </span>
              ) : null;
            })()}
            <ChevronDown className="size-4 opacity-80 transition-transform group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="center"
            sideOffset={8}
            className="w-72 border-white/10 bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-1.5"
          >
            <div className="px-2 py-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Match schedule
              </span>
              {anyLive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-300">
                  <Circle className="size-1.5 fill-red-500 text-red-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {TABS.map((t) => {
              const isActive = active === t.id;
              const badge = badges?.[t.id];
              const isLive = !!(badge && "live" in badge && (badge as { live?: boolean }).live);
              return (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => onChange(t.id)}
                  className={`group flex items-center gap-3 rounded-lg px-2.5 py-2.5 cursor-pointer focus:bg-white/10 ${
                    isActive ? "bg-white/[0.06]" : ""
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center size-8 rounded-lg ring-1 ${t.chip} ${
                      isActive ? `bg-gradient-to-br ${t.accent} !text-black !ring-white/30` : ""
                    }`}
                  >
                    {t.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold ${isActive ? "text-white" : "text-gray-200"}`}>
                        {t.label}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">
                          On
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-gray-500 leading-tight">{t.hint}</span>
                  </span>
                  {badge && badge.count > 0 && (
                    <span
                      title={badge.label}
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 text-[10px] font-bold tabular-nums leading-none py-1 ${
                        isLive
                          ? "bg-red-500/15 text-red-300 ring-1 ring-red-500/40"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {isLive && (
                        <span className="relative inline-flex items-center justify-center">
                          <span className="absolute size-2 rounded-full bg-red-500/60 animate-ping" />
                          <span className="relative size-1 rounded-full bg-red-500" />
                        </span>
                      )}
                      {badge.count}
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="my-1 bg-white/10" />
            <Link
              to="/football/mine"
              className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-white/10 text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span className="inline-flex items-center justify-center size-8 rounded-lg bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                <Star className="size-4 fill-amber-300" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold">My Feed</span>
                <span className="block text-[11px] text-gray-500 leading-tight">Starred teams & reminders</span>
              </span>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
