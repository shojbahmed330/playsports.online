import { Link } from "@tanstack/react-router";
import { Goal, Trophy, Users, Award, CalendarRange } from "lucide-react";
import { EURO_TOP_SCORERS, EURO_MOST_TITLES, EURO_MOST_APPEARANCES } from "@/lib/euro-records";
import { latestCompletedEdition } from "@/lib/competition-history";

type Tile = {
  category: "top-scorers-all-time" | "most-titles" | "most-appearances" | "records-and-firsts";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  preview: string;
  blurb: string;
};

export function EuroRecordsCategoryGrid() {
  const top = EURO_TOP_SCORERS[0];
  const titles = EURO_MOST_TITLES[0];
  const apps = EURO_MOST_APPEARANCES[0];
  const last = latestCompletedEdition("euro");

  const tiles: Tile[] = [
    {
      category: "top-scorers-all-time",
      icon: Goal,
      label: "Top Scorers (All-Time)",
      preview: top ? `${top.name} · ${top.value}g` : "",
      blurb: "Career goals across every edition.",
    },
    {
      category: "most-titles",
      icon: Trophy,
      label: "Most Titles",
      preview: titles ? `${titles.name} · ×${titles.value}` : "",
      blurb: "Nations ranked by Euro trophies won.",
    },
    {
      category: "most-appearances",
      icon: Users,
      label: "Most Appearances",
      preview: apps ? `${apps.name} · ${apps.value}` : "",
      blurb: "Players with the most tournament matches.",
    },
    {
      category: "records-and-firsts",
      icon: Award,
      label: "Records & Firsts",
      preview: "Youngest · Biggest win · Streaks",
      blurb: "Every historical first and outlier.",
    },
  ];

  return (
    <section id="categories" className="mt-10 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
          Explore by category
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <li key={t.category}>
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
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                        {t.preview}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground shrink-0">
                    →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        <li className="sm:col-span-2">
          <Link
            to="/football/$comp/records/decades"
            params={{ comp: "euro" }}
            className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.06] transition"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 size-9 shrink-0 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
                <CalendarRange className="size-4 text-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">Records by Decade</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  Champions and roll-ups grouped by 10-year periods.
                </div>
                {last && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[11px] font-bold">
                    2020s · {last.winner}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground shrink-0">
                →
              </span>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  );
}
