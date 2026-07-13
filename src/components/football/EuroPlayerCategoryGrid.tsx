import { Link } from "@tanstack/react-router";
import { Goal, Users, Award, Trophy } from "lucide-react";
import { EURO_TOP_SCORERS, EURO_MOST_APPEARANCES } from "@/lib/euro-records";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";

type Tile = {
  category: "top-scorers-all-time" | "most-appearances" | "records-and-firsts" | "most-titles";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  preview: string;
  blurb: string;
};

export function EuroPlayerCategoryGrid() {
  const top = EURO_TOP_SCORERS[0];
  const apps = EURO_MOST_APPEARANCES[0];
  const lastBoot = (COMPETITION_EDITIONS.euro ?? [])
    .filter((e) => e.topScorer && e.winner !== "TBD")
    .sort((a, b) => b.year - a.year)[0];

  const tiles: Tile[] = [
    {
      category: "top-scorers-all-time",
      icon: Goal,
      label: "Top Scorers",
      preview: top ? `${top.name} · ${top.value}g` : "",
      blurb: "Every career goal across every edition.",
    },
    {
      category: "most-appearances",
      icon: Users,
      label: "Most Appearances",
      preview: apps ? `${apps.name} · ${apps.value}` : "",
      blurb: "Players with the most tournament matches.",
    },
    {
      category: "top-scorers-all-time",
      icon: Award,
      label: "Golden Boots",
      preview: lastBoot ? `${lastBoot.year} · ${lastBoot.topScorer!.name}` : "",
      blurb: "Boot winner from every Euro since 1960.",
    },
    {
      category: "records-and-firsts",
      icon: Trophy,
      label: "Records & Firsts",
      preview: "Youngest · Fastest · Streaks",
      blurb: "Every historical first for individual players.",
    },
  ];

  return (
    <section id="explore" className="mt-10 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
          Explore player records
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          return (
            <li key={`${t.category}-${i}`}>
              <Link
                to="/football/$comp/records/$category"
                params={{ comp: "euro", category: t.category }}
                className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 size-9 shrink-0 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
                    <Icon className="size-4 text-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{t.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.blurb}</div>
                    {t.preview && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-500/15 text-rose-200 px-2 py-0.5 text-[11px] font-bold">
                        {t.preview}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground shrink-0">→</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
