import type { NewsItem } from "@/lib/espn.functions";
import { Newspaper } from "lucide-react";

export function NewsRail({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Newspaper className="size-4 text-amber-400" /> Latest News
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.slice(0, 6).map((n) => (
          <a
            key={n.id}
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden hover:border-amber-500/30 transition-all hover:-translate-y-0.5"
          >
            {n.image && (
              <div className="aspect-[16/9] overflow-hidden bg-gray-950">
                <img
                  src={n.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                / decoding="async">
              </div>
            )}
            <div className="p-4 space-y-1.5">
              <h3 className="text-sm font-semibold leading-snug text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                {n.headline}
              </h3>
              {n.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{n.description}</p>
              )}
              {n.publishedAt && (
                <div className="text-[10px] text-gray-500 uppercase tracking-wider pt-1">
                  {new Date(n.publishedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
