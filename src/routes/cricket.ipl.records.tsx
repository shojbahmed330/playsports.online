import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import records from "@/data/cricket/ipl/records.json";

type Record = {
  label: string;
  value: string;
  context?: string;
  player?: string;
  team?: string;
};

const SECTIONS: { key: keyof typeof records; title: string; emoji: string; accent: string }[] = [
  { key: "batting",  title: "Batting Records",  emoji: "🏏", accent: "from-amber-500 to-orange-500" },
  { key: "bowling",  title: "Bowling Records",  emoji: "🎯", accent: "from-violet-500 to-purple-600" },
  { key: "team",     title: "Team Records",     emoji: "🛡️", accent: "from-sky-500 to-blue-600" },
  { key: "fielding", title: "Fielding & MVP",   emoji: "🧤", accent: "from-emerald-500 to-teal-500" },
];

export const Route = createFileRoute("/cricket/ipl/records")({
  head: () => ({
    meta: [
      { title: "IPL Records — Batting, Bowling, Team & Fielding" },
      { name: "description", content: "All-time IPL records: most runs, fastest century, best bowling, highest team total, most catches and more." },
      { property: "og:title", content: "IPL Records" },
      { property: "og:description", content: "Every key IPL record — batting, bowling, team and fielding." },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  return (
    <IplPageShell title="Records" subtitle="All-time IPL milestones and benchmarks">
      <div className="grid gap-6">
        {SECTIONS.map((sec) => {
          const list = (records[sec.key] as Record[]) ?? [];
          return (
            <section key={sec.key}>
              <div className="mb-3 flex items-baseline gap-2 px-1">
                <span aria-hidden className="text-base">{sec.emoji}</span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">{sec.title}</h2>
                <span className={`ml-1 rounded-full bg-gradient-to-r ${sec.accent} px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white`}>IPL</span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {list.map((r, i) => (
                  <li
                    key={`${sec.key}-${i}`}
                    className="rounded-xl border border-white/5 bg-gray-900/60 px-4 py-3 transition hover:-translate-y-0.5 hover:border-white/15"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{r.label}</div>
                    <div className="mt-1 flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        {r.player ? (
                          <div className="truncate text-sm font-bold text-white">{r.player}</div>
                        ) : (
                          <div className="truncate text-sm font-bold text-white">{r.team}</div>
                        )}
                        {r.player && r.team && <div className="truncate text-[11px] text-white/55">{r.team}</div>}
                      </div>
                      <div className="shrink-0 text-lg font-black text-amber-300">{r.value}</div>
                    </div>
                    {r.context && <div className="mt-1 truncate text-[11px] text-white/45">{r.context}</div>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-6 px-1 text-[11px] text-white/40">
        Records reflect publicly published IPL data through the most recent completed season.
      </p>
    </IplPageShell>
  );
}
