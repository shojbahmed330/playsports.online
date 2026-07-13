import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";

/**
 * "On this day" strip surfacing historical Copa América finals matching the
 * currently selected date's month/day. Silent when there's no anniversary.
 */

// Curated historic Copa América final calendar dates (MM-DD → year).
// Modern editions with `finalDate` seeded in competition-editions.ts are
// automatically merged in below.
const COPA_FINALS_MMDD: Record<string, number> = {
  "07-15": 2007, // Maracaibo, Brazil 3-0 Argentina
  "07-24": 2011, // Buenos Aires, Uruguay 3-0 Paraguay
  "07-04": 2015, // Santiago, Chile 0-0 (4-1p) Argentina
  "06-26": 2016, // MetLife, Chile 0-0 (4-2p) Argentina
  "07-07": 2019, // Maracanã, Brazil 3-1 Peru
  "07-10": 2021, // Maracanã, Argentina 1-0 Brazil
  "07-14": 2024, // Miami Gardens, Argentina 1-0 Colombia
  // Historic
  "07-17": 1949, // Rio, Brazil 7-0 Paraguay (playoff)
  "06-29": 1997, // La Paz, Brazil 3-1 Bolivia
  "07-18": 1999, // Asunción, Brazil 3-0 Uruguay
  "07-29": 2001, // Bogotá, Colombia 1-0 Mexico
  "07-25": 2004, // Lima, Brazil 2-2 (4-2p) Argentina
  "07-26": 1987, // Buenos Aires, Uruguay 1-0 Chile
};

export function CopaOnThisDayFinal({ value }: { value: Date }) {
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  const key = `${mm}-${dd}`;

  // Merge seeded finalDate hits with curated map.
  const seededYear = (COMPETITION_EDITIONS["copa-america"] ?? []).find(
    (e) => e.finalDate && e.finalDate.endsWith(`-${key}`),
  )?.year;
  const year = seededYear ?? COPA_FINALS_MMDD[key];
  if (!year) return null;

  const edition = COMPETITION_EDITIONS["copa-america"]?.find((e) => e.year === year);
  if (!edition) return null;

  return (
    <Link
      to="/football/$comp/history/$year"
      params={{ comp: "copa-america", year: String(year) }}
      className="block rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.08] via-transparent to-transparent p-3 sm:p-4 hover:border-amber-400/40 transition"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 grid place-items-center size-10 rounded-xl bg-amber-500/15 text-amber-300">
          <Trophy className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            On this day · Copa {year} final
          </div>
          <div className="text-sm sm:text-base font-bold truncate">
            {edition.winner} {edition.finalScore ?? ""} {edition.runnerUp ?? ""}
          </div>
          {edition.finalVenue && (
            <div className="text-[11px] text-muted-foreground truncate">
              {edition.finalVenue}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
