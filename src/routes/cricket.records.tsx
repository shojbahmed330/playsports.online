import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Search } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import records from "@/data/cricket/records.json";

export const Route = createFileRoute("/cricket/records")({
  head: () => ({
    meta: [
      { title: "All-time Cricket Records — Runs, Wickets & Centuries" },
      { name: "description", content: "All-time cricket records across Test, ODI and T20I." },
    ],
  }),
  component: RecordsPage,
});

const FORMATS = [
  { id: "any", label: "All" },
  { id: "test", label: "Test" },
  { id: "odi", label: "ODI" },
  { id: "t20i", label: "T20I" },
  { id: "mixed", label: "Mixed" },
] as const;
type Fmt = typeof FORMATS[number]["id"];

function RecordsPage() {
  const [fmt, setFmt] = useState<Fmt>("any");
  const [q, setQ] = useState("");

  const cats = useMemo(() => {
    const lc = q.trim().toLowerCase();
    return (records as any).categories.filter((c: any) => {
      if (fmt !== "any" && c.format !== fmt) return false;
      if (!lc) return true;
      return c.title.toLowerCase().includes(lc) || c.rows.some((r: any) => String(r.player).toLowerCase().includes(lc));
    });
  }, [fmt, q]);

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-yellow-950/40 via-background to-amber-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-yellow-500/15 ring-1 ring-yellow-500/30 grid place-items-center text-2xl">📜</div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-yellow-300 font-bold flex items-center gap-1.5">
                <Crown className="size-3.5" /> All-time Records
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Cricket Records</h1>
              <p className="text-xs text-muted-foreground mt-1">Career and innings records across formats.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search records or players…"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-white/5 ring-1 ring-white/10 focus:ring-yellow-500/50 outline-none text-sm"
            />
          </div>
          <div className="flex gap-1 bg-white/5 ring-1 ring-white/10 rounded-full p-1">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFmt(f.id)}
                className={[
                  "px-3 py-1 rounded-full text-[11px] font-bold transition",
                  fmt === f.id ? "bg-yellow-500 text-slate-900" : "text-gray-300 hover:text-white",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {cats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-sm text-muted-foreground">
            No records match.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cats.map((c: any) => (
              <div key={c.id} className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-yellow-300 font-bold">{c.format}</div>
                    <div className="font-extrabold leading-tight">{c.title}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">{c.metric}</span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-800/60">
                    {c.rows.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.03]">
                        <td className="px-3 py-2 w-8 text-xs text-gray-500 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base leading-none">{r.flag}</span>
                            <div className="min-w-0">
                              <div className="font-bold leading-tight truncate">{r.player}</div>
                              {r.extra && <div className="text-[10px] text-gray-500 truncate">{r.extra}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-extrabold text-yellow-300">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
