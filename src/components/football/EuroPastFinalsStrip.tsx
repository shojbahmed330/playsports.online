import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";

/**
 * "On this day" strip that surfaces historical Euro finals matching the
 * currently selected date's month/day. Silent when there's no anniversary.
 */

// Known Euro final calendar dates (month/day). Source: UEFA archives.
const EURO_FINALS_MMDD: Record<string, number> = {
  "07-14": 2024, // Berlin, Spain 2-1 England
  "07-11": 2021, // Wembley, Italy 1-1 (3-2p) England (Euro 2020)
  "07-10": 2016, // Paris, Portugal 1-0 France
  "07-01": 2012, // Kyiv, Spain 4-0 Italy
  "06-29": 2008, // Vienna, Spain 1-0 Germany
  "07-04": 2004, // Lisbon, Greece 1-0 Portugal
  "07-02": 2000, // Rotterdam, France 2-1 Italy
  "06-30": 1996, // Wembley, Germany 2-1 Czech Republic
  "06-26": 1988, // Munich, Netherlands 2-0 USSR
  "06-27": 1976, // Belgrade, Czechoslovakia 2-2 (5-3p) West Germany
};

export function EuroPastFinalsStrip({ value }: { value: Date }) {
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  const key = `${mm}-${dd}`;
  const year = EURO_FINALS_MMDD[key];
  if (!year) return null;

  const edition = COMPETITION_EDITIONS.euro?.find((e) => e.year === year);
  if (!edition) return null;

  return (
    <Link
      to="/football/$comp/history/$year"
      params={{ comp: "euro", year: String(year) }}
      className="block rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.08] via-transparent to-transparent p-3 sm:p-4 hover:border-amber-400/40 transition"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 grid place-items-center size-10 rounded-xl bg-amber-500/15 text-amber-300">
          <Trophy className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            On this day · Euro {year} final
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
