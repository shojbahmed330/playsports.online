import { Link } from "@tanstack/react-router";
import { Trophy, Goal, Calendar, Zap, Users, Flag } from "lucide-react";
import { copaStats, copaTitleCounts } from "@/lib/copa-history";

/** Six curated Copa fact tiles. */
export function CopaFactsGrid() {
  const stats = copaStats();
  const top = copaTitleCounts()[0];

  return (
    <section id="facts" className="mt-8 sm:mt-10 scroll-mt-24">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        <Tile
          icon={<Calendar className="size-4" />}
          value={`${stats.tournaments}`}
          label="Editions since 1916"
        />
        <Tile
          icon={<Trophy className="size-4" />}
          value={top ? `${top.team} · ${top.titles}` : "—"}
          label="Most titles"
          accent="text-amber-300"
        />
        <Tile
          icon={<Goal className="size-4" />}
          value="17"
          label="Méndez / Zizinho · all-time"
          accent="text-emerald-300"
        />
        <Tile
          icon={<Users className="size-4" />}
          value="34+"
          label="Livingstone / Romero · apps"
          accent="text-sky-300"
        />
        <Tile
          icon={<Zap className="size-4" />}
          value="7–0"
          label="BRA beat PAR · 1949 final"
          accent="text-fuchsia-300"
        />
        <Tile
          icon={<Flag className="size-4" />}
          value="2024"
          label="First US host since Centenario"
          accent="text-indigo-300"
        />
      </div>
    </section>
  );
}

function Tile({
  icon,
  value,
  label,
  accent = "text-foreground",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <Link
      to="/football/$comp/history"
      params={{ comp: "copa-america" }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition p-3 sm:p-4 min-w-0 h-full block"
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} <span className="truncate">{label.split("·")[0]}</span>
      </div>
      <div className={`mt-1 text-xl sm:text-2xl font-black tabular-nums truncate ${accent}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{label}</div>
    </Link>
  );
}
