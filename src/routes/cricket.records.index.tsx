import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Search } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { PlayerLink } from "@/components/cricket/PlayerLink";
import records from "@/data/cricket/records.json";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/cricket/records/")({
  head: () => ({
    meta: [
      { title: "All-time Cricket Records — Runs, Wickets & Centuries" },
      { name: "description", content: "All-time cricket records across Test, ODI and T20I." },
      { property: "og:title", content: "All-time Cricket Records" },
      {
        property: "og:description",
        content: "Runs, wickets, centuries and partnerships across formats.",
      },
      { property: "og:url", content: "https://www.playsports.online/cricket/records" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "All-time Cricket Records — Runs, Wickets & Centuries" },
      {
        name: "twitter:description",
        content: "All-time cricket records across Test, ODI and T20I.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket/records" }],
    scripts: [
      ldScript(
        collectionPage({
          name: "All-time Cricket Records",
          description:
            "Runs, wickets, centuries and partnership records across Test, ODI and T20I.",
          path: "/cricket/records",
        }),
      ),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Records", path: "/cricket/records" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(RecordsPage, { sport: "cricket", currentPath: "/cricket/records" }),
});

const FORMATS = [
  { id: "any", label: "All" },
  { id: "test", label: "Test" },
  { id: "odi", label: "ODI" },
  { id: "t20i", label: "T20I" },
  { id: "mixed", label: "Mixed" },
] as const;
type Fmt = (typeof FORMATS)[number]["id"];

type RecordRow = {
  player: string;
  team: string;
  flag: string;
  value: number;
  extra?: string;
};
type RecordCategory = {
  id: string;
  title: string;
  format: string;
  metric: string;
  rows: RecordRow[];
};
type RecordsData = { updatedAt: string; categories: RecordCategory[] };

const recordsData = records as RecordsData;

function RecordsPage() {
  const [fmt, setFmt] = useState<Fmt>("any");
  const [q, setQ] = useState("");

  const cats = useMemo(() => {
    const lc = q.trim().toLowerCase();
    return recordsData.categories.filter((c) => {
      if (fmt !== "any" && c.format !== fmt) return false;
      if (!lc) return true;
      return (
        c.title.toLowerCase().includes(lc) ||
        c.rows.some((r) => r.player.toLowerCase().includes(lc))
      );
    });
  }, [fmt, q]);

  return (
    <div className="min-h-screen">
      <SportNav />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-[var(--color-gold)]/40 via-background to-[var(--color-gold)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-[var(--color-gold)]/15 ring-1 ring-[var(--color-gold)]/30 grid place-items-center text-2xl">
              📜
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] font-bold flex items-center gap-1.5">
                <Crown className="size-3.5" /> All-time Records
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">International Cricket Records</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Test, ODI and T20I career and innings records · snapshot {recordsData.updatedAt}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search records or players…"
              type="search"
              aria-label="Search cricket records or players"
              className="min-h-11 w-full rounded-full bg-muted py-2 pl-9 pr-3 text-sm outline-none ring-1 ring-border focus:ring-[var(--color-gold)]/50"
            />
          </div>
          <div className="flex gap-1 bg-muted ring-1 ring-border rounded-full p-1">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={fmt === f.id}
                onClick={() => setFmt(f.id)}
                className={[
                  "min-h-11 rounded-full px-3 py-1 text-[11px] font-bold transition sm:min-h-8",
                  fmt === f.id ? "bg-[var(--color-gold)] text-muted-foreground" : "text-foreground hover:text-foreground",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {cats.length === 0 ? (
          <EmptyState
            title="No records match"
            description="Try a player name or clear the format filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setFmt("any");
                }}
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-gold)]/15 px-4 text-sm font-bold text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cats.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-background"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-gold)] font-bold">
                      {c.format}
                    </div>
                    <div className="truncate font-extrabold leading-tight">{c.title}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {c.metric}
                    </span>
                    <Link
                      to="/cricket/records/$category"
                      params={{ category: c.id }}
                      className="inline-flex min-h-11 items-center text-[11px] font-bold text-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    >
                      Full record →
                    </Link>
                  </div>
                </div>
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    {c.title} — top {c.metric.toLowerCase()} leaders
                  </caption>
                  <tbody className="divide-y divide-border">
                    {c.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-muted">
                        <td className="px-3 py-2 w-8 text-xs text-muted-foreground tabular-nums">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base leading-none">{r.flag}</span>
                            <div className="min-w-0">
                              <PlayerLink
                                name={r.player}
                                className="font-bold leading-tight truncate block"
                              >
                                {r.player}
                              </PlayerLink>
                              {r.extra && (
                                <div className="text-[10px] text-muted-foreground truncate">{r.extra}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums font-extrabold text-[var(--color-gold)]">
                          {r.value}
                        </td>
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
