import { useMemo, useState } from "react";
import type { NewsItem } from "@/lib/espn.functions";
import { Newspaper, Search, Clock } from "lucide-react";

function timeAgo(iso: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MlbNewsHub({ items }: { items: NewsItem[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const i of items) if (i.category) set.add(i.category);
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((i) => {
      if (cat !== "All" && i.category !== cat) return false;
      if (!qq) return true;
      return (
        i.headline.toLowerCase().includes(qq) ||
        (i.description ?? "").toLowerCase().includes(qq)
      );
    });
  }, [items, q, cat]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground">
        No MLB news available right now.
      </div>
    );
  }

  const [hero, ...rest] = filtered;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search MLB news…"
            className="w-full rounded-full bg-card ring-1 ring-border pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-[#d50032]/60"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={[
                "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 transition",
                cat === c
                  ? "bg-[#d50032] text-white ring-[#d50032]"
                  : "bg-card ring-border text-muted-foreground hover:text-white",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground">
          No stories match your filter.
        </div>
      ) : (
        <>
          {hero && <HeroCard n={hero} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((n) => (
              <StoryCard key={n.id} n={n} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HeroCard({ n }: { n: NewsItem }) {
  return (
    <a
      href={n.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl overflow-hidden ring-1 ring-border bg-card hover:ring-[#d50032]/40 transition-all"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {n.image ? (
          <div className="aspect-[16/10] md:aspect-auto overflow-hidden bg-gray-950">
            <img
              src={n.image}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            / decoding="async">
          </div>
        ) : (
          <div className="aspect-[16/10] md:aspect-auto bg-gradient-to-br from-[#002d72] to-[#d50032]" />
        )}
        <div className="p-6 sm:p-8 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-[0.2em] font-bold">
            <span className="bg-[#d50032] text-white px-2 py-0.5 rounded">Featured</span>
            {n.category && <span className="text-[#f7e6c4]">{n.category}</span>}
            {n.publishedAt && (
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Clock className="size-3" />
                {timeAgo(n.publishedAt)}
              </span>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white group-hover:text-[#f7e6c4] transition-colors">
            {n.headline}
          </h3>
          {n.description && <p className="text-sm text-gray-300 line-clamp-3">{n.description}</p>}
          {n.byline && (
            <div className="text-[11px] text-muted-foreground">By {n.byline}</div>
          )}
        </div>
      </div>
    </a>
  );
}

function StoryCard({ n }: { n: NewsItem }) {
  return (
    <a
      href={n.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-2xl ring-1 ring-border bg-card overflow-hidden hover:ring-[#d50032]/40 hover:-translate-y-0.5 transition-all"
    >
      {n.image ? (
        <div className="aspect-[16/9] overflow-hidden bg-gray-950">
          <img
            src={n.image}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          / decoding="async">
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-[#002d72]/60 to-[#d50032]/40" />
      )}
      <div className="p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold">
          {n.category && <span className="text-[#f7e6c4]">{n.category}</span>}
          {n.publishedAt && (
            <span className="text-muted-foreground">{timeAgo(n.publishedAt)}</span>
          )}
        </div>
        <h3 className="text-sm font-bold leading-snug text-white group-hover:text-[#f7e6c4] transition-colors line-clamp-3">
          {n.headline}
        </h3>
        {n.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
        )}
      </div>
    </a>
  );
}

// Re-export the section header icon for routes
export { Newspaper as MlbNewsIcon };
