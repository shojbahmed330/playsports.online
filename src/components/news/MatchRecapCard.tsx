import { Link } from "@tanstack/react-router";
import { ChevronRight, Newspaper } from "lucide-react";
import type { RecapLink } from "@/lib/news.server";

/** Compact promo for a generated recap. The full article lives on /news. */
export function MatchRecapCard({ recap }: { recap: RecapLink }) {
  return (
    <section
      className="my-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5"
      aria-label="Match recap"
    >
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">
        <Newspaper className="size-3.5" /> Match recap
      </div>
      <h2 className="mt-2 text-lg font-extrabold leading-snug">{recap.headline}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{recap.summary}</p>
      <Link
        to="/news/$slug"
        params={{ slug: recap.slug }}
        className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-300 hover:text-sky-200"
      >
        Read the full recap <ChevronRight className="size-4" />
      </Link>
    </section>
  );
}
