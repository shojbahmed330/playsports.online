import { Link } from "@tanstack/react-router";
import { CalendarClock, ArrowRight } from "lucide-react";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";

/**
 * "On this day in Euro history" — surfaces any notableMoments[] whose text
 * mentions today's month/day. Silent when nothing matches (very common),
 * so it never renders empty chrome.
 */
export function EuroOnThisDayCard() {
  const today = new Date();
  const editions = COMPETITION_EDITIONS.euro ?? [];

  type Hit = { year: number; text: string };
  const hits: Hit[] = [];
  for (const e of editions) {
    if (!e.notableMoments) continue;
    for (const m of e.notableMoments) {
      if (mentionsToday(m, today)) hits.push({ year: e.year, text: m });
    }
  }
  if (hits.length === 0) return null;

  return (
    <section id="on-this-day" className="mt-8 sm:mt-10 scroll-mt-24">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <CalendarClock className="size-4" /> On this day in Euro history
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {hits.slice(0, 4).map((h, i) => (
          <Link
            key={`${h.year}-${i}`}
            to="/football/$comp/history/$year"
            params={{ comp: "euro", year: String(h.year) }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition p-4"
          >
            <div className="text-[11px] font-bold uppercase tracking-widest text-blue-200/90">
              Euro {h.year}
            </div>
            <p className="mt-1 text-sm leading-snug">{h.text}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              Read the edition <ArrowRight className="size-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Loose MM-DD match against the moment text. Recognises "12 July", "July 12", "12/07". */
function mentionsToday(text: string, today: Date): boolean {
  const day = today.getDate();
  const monthIdx = today.getMonth();
  const monthLong = today.toLocaleString("en-GB", { month: "long" });
  const monthShort = today.toLocaleString("en-GB", { month: "short" });
  const lower = text.toLowerCase();
  const re = new RegExp(
    `\\b${day}\\s*(st|nd|rd|th)?\\s*(of\\s+)?${monthLong.toLowerCase()}|` +
      `${monthLong.toLowerCase()}\\s+${day}\\b|` +
      `${monthShort.toLowerCase()}\\s+${day}\\b|` +
      `\\b${String(day).padStart(2, "0")}[/-]${String(monthIdx + 1).padStart(2, "0")}\\b`,
  );
  return re.test(lower);
}
