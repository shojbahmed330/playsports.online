import { Link } from "@tanstack/react-router";
import { Goal, Trophy, Users, Award, CalendarRange, Star } from "lucide-react";
import { COPA_TOP_SCORERS_LB, COPA_MOST_TITLES_LB, COPA_MOST_APPS_LB } from "@/lib/copa-records";
import { latestCompletedEdition } from "@/lib/competition-history";

type Category = "top-scorers-all-time" | "most-titles" | "most-appearances" | "records-and-firsts";

type Tile = {
  category: Category;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  preview: string;
  blurb: string;
};

export function CopaRecordsCategoryGrid() {
  const top = COPA_TOP_SCORERS_LB[0];
  const titles = COPA_MOST_TITLES_LB[0];
  const apps = COPA_MOST_APPS_LB[0];
  const last = latestCompletedEdition("copa-america");

  const tiles: Tile[] = [
    {
      category: "top-scorers-all-time",
      icon: Goal,
      label: "Top Scorers (All-Time)",
      preview: top ? `${top.name} · ${top.value}g` : "",
      blurb: "Career goals across every Copa.",
    },
    {
      category: "most-titles",
      icon: Trophy,
      label: "Most Titles",
      preview: titles ? `${titles.name} · ×${titles.value}` : "",
      blurb: "Nations ranked by Copa América trophies won.",
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
      preview: "Oldest Copa · 1916 · Perfect run · 2001",
      blurb: "Founding year, streaks and every historical first.",
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
                params={{ comp: "copa-america", category: t.category }}
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
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[11px] font-bold">
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
        <li>
          <Link
            to="/football/$comp/history"
            params={{ comp: "copa-america" }}
            hash="champions-timeline"
            className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 hover:bg-white/[0.06] transition"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 size-9 shrink-0 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
                <Star className="size-4 text-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">Golden Boot by edition</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  Top scorer of every Copa — jump to the timeline.
                </div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground shrink-0">→</span>
            </div>
          </Link>
        </li>
        <li>
          <Link
            to="/football/$comp/records/decades"
            params={{ comp: "copa-america" }}
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
              <span className="text-xs text-muted-foreground group-hover:text-foreground shrink-0">→</span>
            </div>
          </Link>
        </li>
      </ul>
    </section>
  );
}
