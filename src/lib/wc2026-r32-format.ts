// Predicted knockout-stage generator for FIFA World Cup 2026.
//
// The 2026 tournament structure (12 groups × 4 teams → 24 winners/runners-up +
// 8 best 3rd-placed teams = 32) is fixed. FIFA's official R32 matrix is keyed
// by match number (M73–M88), not by a simple snake order. We hard-code that
// matrix here, including the Annex C third-place lookup table, then derive
// R16, QF, SF, 3rd-place, and Final from the published bracket path.
//
// Real ESPN fixtures replace predicted rows on a per-round basis (see merger
// in Wc2026View): as soon as ESPN publishes any fixture for a given round,
// the predicted rows for that round are dropped.

import type { WCMatch } from "@/lib/supabase";
import type { Wc2026Group, Wc2026StandingRow } from "@/lib/wc2026.functions";
import r32Schedule from "@/data/wc2026_r32_schedule.json";

type ScheduleRow = {
  slot: number;
  matchNo: number;
  dateISO: string;
  stadium: string;
  city: string;
};
const SCHEDULE = r32Schedule as ScheduleRow[];
const SCHEDULE_BY_MATCH = new Map<number, ScheduleRow>(SCHEDULE.map((s) => [s.matchNo, s]));

const LATER_SCHEDULE: ScheduleRow[] = [
  { slot: 17, matchNo: 89,  dateISO: "2026-07-04T17:00:00-04:00", stadium: "Lincoln Financial Field", city: "Philadelphia, PA" },
  { slot: 18, matchNo: 90,  dateISO: "2026-07-04T12:00:00-05:00", stadium: "NRG Stadium", city: "Houston, TX" },
  { slot: 19, matchNo: 91,  dateISO: "2026-07-05T16:00:00-04:00", stadium: "MetLife Stadium", city: "East Rutherford, NJ" },
  { slot: 20, matchNo: 92,  dateISO: "2026-07-05T18:00:00-06:00", stadium: "Estadio Azteca", city: "Mexico City, MX" },
  { slot: 21, matchNo: 93,  dateISO: "2026-07-06T14:00:00-05:00", stadium: "AT&T Stadium", city: "Arlington, TX" },
  { slot: 22, matchNo: 94,  dateISO: "2026-07-06T17:00:00-07:00", stadium: "Lumen Field", city: "Seattle, WA" },
  { slot: 23, matchNo: 95,  dateISO: "2026-07-07T12:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA" },
  { slot: 24, matchNo: 96,  dateISO: "2026-07-07T13:00:00-07:00", stadium: "BC Place", city: "Vancouver, BC" },
  { slot: 25, matchNo: 97,  dateISO: "2026-07-09T16:00:00-04:00", stadium: "Gillette Stadium", city: "Foxborough, MA" },
  { slot: 26, matchNo: 98,  dateISO: "2026-07-10T12:00:00-07:00", stadium: "SoFi Stadium", city: "Inglewood, CA" },
  { slot: 27, matchNo: 99,  dateISO: "2026-07-11T17:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami Gardens, FL" },
  { slot: 28, matchNo: 100, dateISO: "2026-07-11T20:00:00-05:00", stadium: "Arrowhead Stadium", city: "Kansas City, MO" },
  { slot: 29, matchNo: 101, dateISO: "2026-07-14T14:00:00-05:00", stadium: "AT&T Stadium", city: "Arlington, TX" },
  { slot: 30, matchNo: 102, dateISO: "2026-07-15T15:00:00-04:00", stadium: "Mercedes-Benz Stadium", city: "Atlanta, GA" },
  { slot: 31, matchNo: 103, dateISO: "2026-07-18T17:00:00-04:00", stadium: "Hard Rock Stadium", city: "Miami Gardens, FL" },
  { slot: 32, matchNo: 104, dateISO: "2026-07-19T15:00:00-04:00", stadium: "MetLife Stadium", city: "East Rutherford, NJ" },
];
const LATER_SCHEDULE_BY_MATCH = new Map<number, ScheduleRow>(LATER_SCHEDULE.map((s) => [s.matchNo, s]));

// ───────────────────────────────────────────────────────────────────────────
// SEED PICKING
// ───────────────────────────────────────────────────────────────────────────
function cmpRow(a: Wc2026StandingRow, b: Wc2026StandingRow) {
  if (b.points !== a.points) return b.points - a.points;
  const ad = a.goalsFor - a.goalsAgainst;
  const bd = b.goalsFor - b.goalsAgainst;
  if (bd !== ad) return bd - ad;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

export type R32Seeds = {
  /** group letter → group winner */
  winners: Map<string, Wc2026StandingRow>;
  /** group letter → runner-up */
  runners: Map<string, Wc2026StandingRow>;
  /** group letter → third-placed team */
  thirds: Map<string, Wc2026StandingRow>;
  /** ordered 1..8 best 3rd-placed teams */
  bestThirds: Wc2026StandingRow[];
};

function groupLetter(name: string): string {
  const m = /Group\s+([A-Z])/i.exec(name);
  return m ? m[1].toUpperCase() : name.slice(-1).toUpperCase();
}

export function pickSeeds(groups: Wc2026Group[]): R32Seeds {
  const winners = new Map<string, Wc2026StandingRow>();
  const runners = new Map<string, Wc2026StandingRow>();
  const thirdsByGroup = new Map<string, Wc2026StandingRow>();
  const thirds: Wc2026StandingRow[] = [];
  for (const g of groups) {
    const letter = groupLetter(g.group);
    const rows = g.rows.slice().sort(cmpRow);
    if (rows[0]) winners.set(letter, rows[0]);
    if (rows[1]) runners.set(letter, rows[1]);
    if (rows[2]) {
      thirdsByGroup.set(letter, rows[2]);
      thirds.push(rows[2]);
    }
  }
  const bestThirds = thirds.slice().sort(cmpRow).slice(0, 8);
  return { winners, runners, thirds: thirdsByGroup, bestThirds };
}

// ───────────────────────────────────────────────────────────────────────────
// R32 MATRIX
// Each entry pairs two seed slots. A seed slot is one of:
//   { kind: "W"|"R", group: "A".."L" }       — group winner / runner-up
//   { kind: "T3", host: "1A".."1L" }         — third-place slot from Annex C
//
// The matrix is ordered by match number. Examples: M76 is 1C vs 2F (Brazil if
// they top Group C), and M86 is 1J vs 2H (Argentina if they top Group J).
// ───────────────────────────────────────────────────────────────────────────
type SeedSlot =
  | { kind: "W"; group: string }
  | { kind: "R"; group: string }
  | { kind: "T3"; host: "1A" | "1B" | "1D" | "1E" | "1G" | "1I" | "1K" | "1L"; possible: string };

type R32MatrixRow = { matchNo: number; home: SeedSlot; away: SeedSlot };

const R32_MATRIX: R32MatrixRow[] = [
  { matchNo: 73, home: { kind: "R", group: "A" }, away: { kind: "R", group: "B" } },
  { matchNo: 74, home: { kind: "W", group: "E" }, away: { kind: "T3", host: "1E", possible: "A/B/C/D/F" } },
  { matchNo: 75, home: { kind: "W", group: "F" }, away: { kind: "R", group: "C" } },
  { matchNo: 76, home: { kind: "W", group: "C" }, away: { kind: "R", group: "F" } },
  { matchNo: 77, home: { kind: "W", group: "I" }, away: { kind: "T3", host: "1I", possible: "C/D/F/G/H" } },
  { matchNo: 78, home: { kind: "R", group: "E" }, away: { kind: "R", group: "I" } },
  { matchNo: 79, home: { kind: "W", group: "A" }, away: { kind: "T3", host: "1A", possible: "C/E/F/H/I" } },
  { matchNo: 80, home: { kind: "W", group: "L" }, away: { kind: "T3", host: "1L", possible: "E/H/I/J/K" } },
  { matchNo: 81, home: { kind: "W", group: "D" }, away: { kind: "T3", host: "1D", possible: "B/E/F/I/J" } },
  { matchNo: 82, home: { kind: "W", group: "G" }, away: { kind: "T3", host: "1G", possible: "A/E/H/I/J" } },
  { matchNo: 83, home: { kind: "R", group: "K" }, away: { kind: "R", group: "L" } },
  { matchNo: 84, home: { kind: "W", group: "H" }, away: { kind: "R", group: "J" } },
  { matchNo: 85, home: { kind: "W", group: "B" }, away: { kind: "T3", host: "1B", possible: "E/F/G/I/J" } },
  { matchNo: 86, home: { kind: "W", group: "J" }, away: { kind: "R", group: "H" } },
  { matchNo: 87, home: { kind: "W", group: "K" }, away: { kind: "T3", host: "1K", possible: "D/E/I/J/L" } },
  { matchNo: 88, home: { kind: "R", group: "D" }, away: { kind: "R", group: "G" } },
];

// Compact Annex C lookup. Key = the eight 3rd-place groups that qualify.
// Value columns are 1A,1B,1D,1E,1G,1I,1K,1L in that order.
const THIRD_PLACE_COLUMNS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"] as const;
const THIRD_PLACE_COMPACT = "EFGHIJKL:EJIFHGLK;DFGHIJKL:HGIDJFLK;DEGHIJKL:EJIDHGLK;DEFHIJKL:EJIDHFLK;DEFGIJKL:EGIDJFLK;DEFGHJKL:EGJDHFLK;DEFGHIKL:EGIDHFLK;DEFGHIJL:EGJDHFLI;DEFGHIJK:EGJDHFIK;CFGHIJKL:HGICJFLK;CEGHIJKL:EJICHGLK;CEFHIJKL:EJICHFLK;CEFGIJKL:EGICJFLK;CEFGHJKL:EGJCHFLK;CEFGHIKL:EGICHFLK;CEFGHIJL:EGJCHFLI;CEFGHIJK:EGJCHFIK;CDGHIJKL:HGICJDLK;CDFHIJKL:CJIDHFLK;CDFGIJKL:CGIDJFLK;CDFGHJKL:CGJDHFLK;CDFGHIKL:CGIDHFLK;CDFGHIJL:CGJDHFLI;CDFGHIJK:CGJDHFIK;CDEHIJKL:EJICHDLK;CDEGIJKL:EGICJDLK;CDEGHJKL:EGJCHDLK;CDEGHIKL:EGICHDLK;CDEGHIJL:EGJCHDLI;CDEGHIJK:EGJCHDIK;CDEFIJKL:CJEDIFLK;CDEFHJKL:CJEDHFLK;CDEFHIKL:CEIDHFLK;CDEFHIJL:CJEDHFLI;CDEFHIJK:CJEDHFIK;CDEFGJKL:CGEDJFLK;CDEFGIKL:CGEDIFLK;CDEFGIJL:CGEDJFLI;CDEFGIJK:CGEDJFIK;CDEFGHKL:CGEDHFLK;CDEFGHJL:CGJDHFLE;CDEFGHJK:CGJDHFEK;CDEFGHIL:CGEDHFLI;CDEFGHIK:CGEDHFIK;CDEFGHIJ:CGJDHFEI;BFGHIJKL:HJBFIGLK;BEGHIJKL:EJIBHGLK;BEFHIJKL:EJBFIHLK;BEFGIJKL:EJBFIGLK;BEFGHJKL:EJBFHGLK;BEFGHIKL:EGBFIHLK;BEFGHIJL:EJBFHGLI;BEFGHIJK:EJBFHGIK;BDGHIJKL:HJBDIGLK;BDFHIJKL:HJBDIFLK;BDFGIJKL:IGBDJFLK;BDFGHJKL:HGBDJFLK;BDFGHIKL:HGBDIFLK;BDFGHIJL:HGBDJFLI;BDFGHIJK:HGBDJFIK;BDEHIJKL:EJBDIHLK;BDEGIJKL:EJBDIGLK;BDEGHJKL:EJBDHGLK;BDEGHIKL:EGBDIHLK;BDEGHIJL:EJBDHGLI;BDEGHIJK:EJBDHGIK;BDEFIJKL:EJBDIFLK;BDEFHJKL:EJBDHFLK;BDEFHIKL:EIBDHFLK;BDEFHIJL:EJBDHFLI;BDEFHIJK:EJBDHFIK;BDEFGJKL:EGBDJFLK;BDEFGIKL:EGBDIFLK;BDEFGIJL:EGBDJFLI;BDEFGIJK:EGBDJFIK;BDEFGHKL:EGBDHFLK;BDEFGHJL:HGBDJFLE;BDEFGHJK:HGBDJFEK;BDEFGHIL:EGBDHFLI;BDEFGHIK:EGBDHFIK;BDEFGHIJ:HGBDJFEI;BCGHIJKL:HJBCIGLK;BCFHIJKL:HJBCIFLK;BCFGIJKL:IGBCJFLK;BCFGHJKL:HGBCJFLK;BCFGHIKL:HGBCIFLK;BCFGHIJL:HGBCJFLI;BCFGHIJK:HGBCJFIK;BCEHIJKL:EJBCIHLK;BCEGIJKL:EJBCIGLK;BCEGHJKL:EJBCHGLK;BCEGHIKL:EGBCIHLK;BCEGHIJL:EJBCHGLI;BCEGHIJK:EJBCHGIK;BCEFIJKL:EJBCIFLK;BCEFHJKL:EJBCHFLK;BCEFHIKL:EIBCHFLK;BCEFHIJL:EJBCHFLI;BCEFHIJK:EJBCHFIK;BCEFGJKL:EGBCJFLK;BCEFGIKL:EGBCIFLK;BCEFGIJL:EGBCJFLI;BCEFGIJK:EGBCJFIK;BCEFGHKL:EGBCHFLK;BCEFGHJL:HGBCJFLE;BCEFGHJK:HGBCJFEK;BCEFGHIL:EGBCHFLI;BCEFGHIK:EGBCHFIK;BCEFGHIJ:HGBCJFEI;BCDHIJKL:HJBCIDLK;BCDGIJKL:IGBCJDLK;BCDGHJKL:HGBCJDLK;BCDGHIKL:HGBCIDLK;BCDGHIJL:HGBCJDLI;BCDGHIJK:HGBCJDIK;BCDFIJKL:CJBDIFLK;BCDFHJKL:CJBDHFLK;BCDFHIKL:CIBDHFLK;BCDFHIJL:CJBDHFLI;BCDFHIJK:CJBDHFIK;BCDFGJKL:CGBDJFLK;BCDFGIKL:CGBDIFLK;BCDFGIJL:CGBDJFLI;BCDFGIJK:CGBDJFIK;BCDFGHKL:CGBDHFLK;BCDFGHJL:CGBDHFLJ;BCDFGHJK:HGBCJFDK;BCDFGHIL:CGBDHFLI;BCDFGHIK:CGBDHFIK;BCDFGHIJ:HGBCJFDI;BCDEIJKL:EJBCIDLK;BCDEHJKL:EJBCHDLK;BCDEHIKL:EIBCHDLK;BCDEHIJL:EJBCHDLI;BCDEHIJK:EJBCHDIK;BCDEGJKL:EGBCJDLK;BCDEGIKL:EGBCIDLK;BCDEGIJL:EGBCJDLI;BCDEGIJK:EGBCJDIK;BCDEGHKL:EGBCHDLK;BCDEGHJL:HGBCJDLE;BCDEGHJK:HGBCJDEK;BCDEGHIL:EGBCHDLI;BCDEGHIK:EGBCHDIK;BCDEGHIJ:HGBCJDEI;BCDEFJKL:CJBDEFLK;BCDEFIKL:CEBDIFLK;BCDEFIJL:CJBDEFLI;BCDEFIJK:CJBDEFIK;BCDEFHKL:CEBDHFLK;BCDEFHJL:CJBDHFLE;BCDEFHJK:CJBDHFEK;BCDEFHIL:CEBDHFLI;BCDEFHIK:CEBDHFIK;BCDEFHIJ:CJBDHFEI;BCDEFGKL:CGBDEFLK;BCDEFGJL:CGBDJFLE;BCDEFGJK:CGBDJFEK;BCDEFGIL:CGBDEFLI;BCDEFGIK:CGBDEFIK;BCDEFGIJ:CGBDJFEI;BCDEFGHL:CGBDHFLE;BCDEFGHK:CGBDHFEK;BCDEFGHJ:HGBCJFDE;BCDEFGHI:CGBDHFEI;AFGHIJKL:HJIFAGLK;AEGHIJKL:EJIAHGLK;AEFHIJKL:EJIFAHLK;AEFGIJKL:EJIFAGLK;AEFGHJKL:EGJFAHLK;AEFGHIKL:EGIFAHLK;AEFGHIJL:EGJFAHLI;AEFGHIJK:EGJFAHIK;ADGHIJKL:HJIDAGLK;ADFHIJKL:HJIDAFLK;ADFGIJKL:IGJDAFLK;ADFGHJKL:HGJDAFLK;ADFGHIKL:HGIDAFLK;ADFGHIJL:HGJDAFLI;ADFGHIJK:HGJDAFIK;ADEHIJKL:EJIDAHLK;ADEGIJKL:EJIDAGLK;ADEGHJKL:EGJDAHLK;ADEGHIKL:EGIDAHLK;ADEGHIJL:EGJDAHLI;ADEGHIJK:EGJDAHIK;ADEFIJKL:EJIDAFLK;ADEFHJKL:HJEDAFLK;ADEFHIKL:HEIDAFLK;ADEFHIJL:HJEDAFLI;ADEFHIJK:HJEDAFIK;ADEFGJKL:EGJDAFLK;ADEFGIKL:EGIDAFLK;ADEFGIJL:EGJDAFLI;ADEFGIJK:EGJDAFIK;ADEFGHKL:HGEDAFLK;ADEFGHJL:HGJDAFLE;ADEFGHJK:HGJDAFEK;ADEFGHIL:HGEDAFLI;ADEFGHIK:HGEDAFIK;ADEFGHIJ:HGJDAFEI;ACGHIJKL:HJICAGLK;ACFHIJKL:HJICAFLK;ACFGIJKL:IGJCAFLK;ACFGHJKL:HGJCAFLK;ACFGHIKL:HGICAFLK;ACFGHIJL:HGJCAFLI;ACFGHIJK:HGJCAFIK;ACEHIJKL:EJICAHLK;ACEGIJKL:EJICAGLK;ACEGHJKL:EGJCAHLK;ACEGHIKL:EGICAHLK;ACEGHIJL:EGJCAHLI;ACEGHIJK:EGJCAHIK;ACEFIJKL:EJICAFLK;ACEFHJKL:HJECAFLK;ACEFHIKL:HEICAFLK;ACEFHIJL:HJECAFLI;ACEFHIJK:HJECAFIK;ACEFGJKL:EGJCAFLK;ACEFGIKL:EGICAFLK;ACEFGIJL:EGJCAFLI;ACEFGIJK:EGJCAFIK;ACEFGHKL:HGECAFLK;ACEFGHJL:HGJCAFLE;ACEFGHJK:HGJCAFEK;ACEFGHIL:HGECAFLI;ACEFGHIK:HGECAFIK;ACEFGHIJ:HGJCAFEI;ACDHIJKL:HJICADLK;ACDGIJKL:IGJCADLK;ACDGHJKL:HGJCADLK;ACDGHIKL:HGICADLK;ACDGHIJL:HGJCADLI;ACDGHIJK:HGJCADIK;ACDFIJKL:CJIDAFLK;ACDFHJKL:HJFCADLK;ACDFHIKL:HFICADLK;ACDFHIJL:HJFCADLI;ACDFHIJK:HJFCADIK;ACDFGJKL:CGJDAFLK;ACDFGIKL:CGIDAFLK;ACDFGIJL:CGJDAFLI;ACDFGIJK:CGJDAFIK;ACDFGHKL:HGFCADLK;ACDFGHJL:CGJDAFLH;ACDFGHJK:HGJCAFDK;ACDFGHIL:HGFCADLI;ACDFGHIK:HGFCADIK;ACDFGHIJ:HGJCAFDI;ACDEIJKL:EJICADLK;ACDEHJKL:HJECADLK;ACDEHIKL:HEICADLK;ACDEHIJL:HJECADLI;ACDEHIJK:HJECADIK;ACDEGJKL:EGJCADLK;ACDEGIKL:EGICADLK;ACDEGIJL:EGJCADLI;ACDEGIJK:EGJCADIK;ACDEGHKL:HGECADLK;ACDEGHJL:HGJCADLE;ACDEGHJK:HGJCADEK;ACDEGHIL:HGECADLI;ACDEGHIK:HGECADIK;ACDEGHIJ:HGJCADEI;ACDEFJKL:CJEDAFLK;ACDEFIKL:CEIDAFLK;ACDEFIJL:CJEDAFLI;ACDEFIJK:CJEDAFIK;ACDEFHKL:HEFCADLK;ACDEFHJL:HJFCADLE;ACDEFHJK:HJECAFDK;ACDEFHIL:HEFCADLI;ACDEFHIK:HEFCADIK;ACDEFHIJ:HJECAFDI;ACDEFGKL:CGEDAFLK;ACDEFGJL:CGJDAFLE;ACDEFGJK:CGJDAFEK;ACDEFGIL:CGEDAFLI;ACDEFGIK:CGEDAFIK;ACDEFGIJ:CGJDAFEI;ACDEFGHL:HGFCADLE;ACDEFGHK:HGECAFDK;ACDEFGHJ:HGJCAFDE;ACDEFGHI:HGECAFDI;ABGHIJKL:HJBAIGLK;ABFHIJKL:HJBAIFLK;ABFGIJKL:IJBFAGLK;ABFGHJKL:HJBFAGLK;ABFGHIKL:HGBAIFLK;ABFGHIJL:HJBFAGLI;ABFGHIJK:HJBFAGIK;ABEHIJKL:EJBAIHLK;ABEGIJKL:EJBAIGLK;ABEGHJKL:EJBAHGLK;ABEGHIKL:EGBAIHLK;ABEGHIJL:EJBAHGLI;ABEGHIJK:EJBAHGIK;ABEFIJKL:EJBAIFLK;ABEFHJKL:EJBFAHLK;ABEFHIKL:EIBFAHLK;ABEFHIJL:EJBFAHLI;ABEFHIJK:EJBFAHIK;ABEFGJKL:EJBFAGLK;ABEFGIKL:EGBAIFLK;ABEFGIJL:EJBFAGLI;ABEFGIJK:EJBFAGIK;ABEFGHKL:EGBFAHLK;ABEFGHJL:HJBFAGLE;ABEFGHJK:HJBFAGEK;ABEFGHIL:EGBFAHLI;ABEFGHIK:EGBFAHIK;ABEFGHIJ:HJBFAGEI;ABDHIJKL:IJBDAHLK;ABDGIJKL:IJBDAGLK;ABDGHJKL:HJBDAGLK;ABDGHIKL:IGBDAHLK;ABDGHIJL:HJBDAGLI;ABDGHIJK:HJBDAGIK;ABDFIJKL:IJBDAFLK;ABDFHJKL:HJBDAFLK;ABDFHIKL:HIBDAFLK;ABDFHIJL:HJBDAFLI;ABDFHIJK:HJBDAFIK;ABDFGJKL:FJBDAGLK;ABDFGIKL:IGBDAFLK;ABDFGIJL:FJBDAGLI;ABDFGIJK:FJBDAGIK;ABDFGHKL:HGBDAFLK;ABDFGHJL:HGBDAFLJ;ABDFGHJK:HGBDAFJK;ABDFGHIL:HGBDAFLI;ABDFGHIK:HGBDAFIK;ABDFGHIJ:HGBDAFIJ;ABDEIJKL:EJBAIDLK;ABDEHJKL:EJBDAHLK;ABDEHIKL:EIBDAHLK;ABDEHIJL:EJBDAHLI;ABDEHIJK:EJBDAHIK;ABDEGJKL:EJBDAGLK;ABDEGIKL:EGBAIDLK;ABDEGIJL:EJBDAGLI;ABDEGIJK:EJBDAGIK;ABDEGHKL:EGBDAHLK;ABDEGHJL:HJBDAGLE;ABDEGHJK:HJBDAGEK;ABDEGHIL:EGBDAHLI;ABDEGHIK:EGBDAHIK;ABDEGHIJ:HJBDAGEI;ABDEFJKL:EJBDAFLK;ABDEFIKL:EIBDAFLK;ABDEFIJL:EJBDAFLI;ABDEFIJK:EJBDAFIK;ABDEFHKL:HEBDAFLK;ABDEFHJL:HJBDAFLE;ABDEFHJK:HJBDAFEK;ABDEFHIL:HEBDAFLI;ABDEFHIK:HEBDAFIK;ABDEFHIJ:HJBDAFEI;ABDEFGKL:EGBDAFLK;ABDEFGJL:EGBDAFLJ;ABDEFGJK:EGBDAFJK;ABDEFGIL:EGBDAFLI;ABDEFGIK:EGBDAFIK;ABDEFGIJ:EGBDAFIJ;ABDEFGHL:HGBDAFLE;ABDEFGHK:HGBDAFEK;ABDEFGHJ:HGBDAFEJ;ABDEFGHI:HGBDAFEI;ABCHIJKL:IJBCAHLK;ABCGIJKL:IJBCAGLK;ABCGHJKL:HJBCAGLK;ABCGHIKL:IGBCAHLK;ABCGHIJL:HJBCAGLI;ABCGHIJK:HJBCAGIK;ABCFIJKL:IJBCAFLK;ABCFHJKL:HJBCAFLK;ABCFHIKL:HIBCAFLK;ABCFHIJL:HJBCAFLI;ABCFHIJK:HJBCAFIK;ABCFGJKL:CJBFAGLK;ABCFGIKL:IGBCAFLK;ABCFGIJL:CJBFAGLI;ABCFGIJK:CJBFAGIK;ABCFGHKL:HGBCAFLK;ABCFGHJL:HGBCAFLJ;ABCFGHJK:HGBCAFJK;ABCFGHIL:HGBCAFLI;ABCFGHIK:HGBCAFIK;ABCFGHIJ:HGBCAFIJ;ABCEIJKL:EJBAICLK;ABCEHJKL:EJBCAHLK;ABCEHIKL:EIBCAHLK;ABCEHIJL:EJBCAHLI;ABCEHIJK:EJBCAHIK;ABCEGJKL:EJBCAGLK;ABCEGIKL:EGBAICLK;ABCEGIJL:EJBCAGLI;ABCEGIJK:EJBCAGIK;ABCEGHKL:EGBCAHLK;ABCEGHJL:HJBCAGLE;ABCEGHJK:HJBCAGEK;ABCEGHIL:EGBCAHLI;ABCEGHIK:EGBCAHIK;ABCEGHIJ:HJBCAGEI;ABCEFJKL:EJBCAFLK;ABCEFIKL:EIBCAFLK;ABCEFIJL:EJBCAFLI;ABCEFIJK:EJBCAFIK;ABCEFHKL:HEBCAFLK;ABCEFHJL:HJBCAFLE;ABCEFHJK:HJBCAFEK;ABCEFHIL:HEBCAFLI;ABCEFHIK:HEBCAFIK;ABCEFHIJ:HJBCAFEI;ABCEFGKL:EGBCAFLK;ABCEFGJL:EGBCAFLJ;ABCEFGJK:EGBCAFJK;ABCEFGIL:EGBCAFLI;ABCEFGIK:EGBCAFIK;ABCEFGIJ:EGBCAFIJ;ABCEFGHL:HGBCAFLE;ABCEFGHK:HGBCAFEK;ABCEFGHJ:HGBCAFEJ;ABCEFGHI:HGBCAFEI;ABCDIJKL:IJBCADLK;ABCDHJKL:HJBCADLK;ABCDHIKL:HIBCADLK;ABCDHIJL:HJBCADLI;ABCDHIJK:HJBCADIK;ABCDGJKL:CJBDAGLK;ABCDGIKL:IGBCADLK;ABCDGIJL:CJBDAGLI;ABCDGIJK:CJBDAGIK;ABCDGHKL:HGBCADLK;ABCDGHJL:HGBCADLJ;ABCDGHJK:HGBCADJK;ABCDGHIL:HGBCADLI;ABCDGHIK:HGBCADIK;ABCDGHIJ:HGBCADIJ;ABCDFJKL:CJBDAFLK;ABCDFIKL:CIBDAFLK;ABCDFIJL:CJBDAFLI;ABCDFIJK:CJBDAFIK;ABCDFHKL:HFBCADLK;ABCDFHJL:CJBDAFLH;ABCDFHJK:HJBCAFDK;ABCDFHIL:HFBCADLI;ABCDFHIK:HFBCADIK;ABCDFHIJ:HJBCAFDI;ABCDFGKL:CGBDAFLK;ABCDFGJL:CGBDAFLJ;ABCDFGJK:CGBDAFJK;ABCDFGIL:CGBDAFLI;ABCDFGIK:CGBDAFIK;ABCDFGIJ:CGBDAFIJ;ABCDFGHL:CGBDAFLH;ABCDFGHK:HGBCAFDK;ABCDFGHJ:HGBCAFDJ;ABCDFGHI:HGBCAFDI;ABCDEJKL:EJBCADLK;ABCDEIKL:EIBCADLK;ABCDEIJL:EJBCADLI;ABCDEIJK:EJBCADIK;ABCDEHKL:HEBCADLK;ABCDEHJL:HJBCADLE;ABCDEHJK:HJBCADEK;ABCDEHIL:HEBCADLI;ABCDEHIK:HEBCADIK;ABCDEHIJ:HJBCADEI;ABCDEGKL:EGBCADLK;ABCDEGJL:EGBCADLJ;ABCDEGJK:EGBCADJK;ABCDEGIL:EGBCADLI;ABCDEGIK:EGBCADIK;ABCDEGIJ:EGBCADIJ;ABCDEGHL:HGBCADLE;ABCDEGHK:HGBCADEK;ABCDEGHJ:HGBCADEJ;ABCDEGHI:HGBCADEI;ABCDEFKL:CEBDAFLK;ABCDEFJL:CJBDAFLE;ABCDEFJK:CJBDAFEK;ABCDEFIL:CEBDAFLI;ABCDEFIK:CEBDAFIK;ABCDEFIJ:CJBDAFEI;ABCDEFHL:HFBCADLE;ABCDEFHK:HEBCAFDK;ABCDEFHJ:HJBCAFDE;ABCDEFHI:HEBCAFDI;ABCDEFGL:CGBDAFLE;ABCDEFGK:CGBDAFEK;ABCDEFGJ:CGBDAFEJ;ABCDEFGI:CGBDAFEI;ABCDEFGH:HGBCAFDE";

function thirdPlaceMap(): Map<string, Record<(typeof THIRD_PLACE_COLUMNS)[number], string>> {
  const map = new Map<string, Record<(typeof THIRD_PLACE_COLUMNS)[number], string>>();
  for (const row of THIRD_PLACE_COMPACT.split(";")) {
    const [key, value] = row.split(":");
    if (!key || !value || value.length !== THIRD_PLACE_COLUMNS.length) continue;
    const out = {} as Record<(typeof THIRD_PLACE_COLUMNS)[number], string>;
    THIRD_PLACE_COLUMNS.forEach((col, i) => (out[col] = value[i]));
    map.set(key, out);
  }
  return map;
}

const THIRD_PLACE_MAP = thirdPlaceMap();

function slotLabel(s: SeedSlot): string {
  if (s.kind === "W") return `Winner Group ${s.group}`;
  if (s.kind === "R") return `Runner-up Group ${s.group}`;
  return `3rd Group ${s.possible}`;
}

function resolveSeed(s: SeedSlot, seeds: R32Seeds): Wc2026StandingRow | null {
  if (s.kind === "W") return seeds.winners.get(s.group) ?? null;
  if (s.kind === "R") return seeds.runners.get(s.group) ?? null;
  const combo = seeds.bestThirds
    .map((row) => {
      for (const [group, third] of seeds.thirds) {
        if (third.team.id === row.team.id || third.team.name === row.team.name) return group;
      }
      return "";
    })
    .filter(Boolean)
    .sort()
    .join("");
  const assignedGroup = THIRD_PLACE_MAP.get(combo)?.[s.host];
  return assignedGroup ? seeds.thirds.get(assignedGroup) ?? null : null;
}

function buildMatch(
  matchNo: number,
  round: string,
  homeName: string,
  awayName: string,
  homeHint: string | null,
  awayHint: string | null,
  sched: ScheduleRow | null,
  idSeed: number,
): WCMatch {
  const startMs = sched ? new Date(sched.dateISO).getTime() : NaN;
  return {
    id: idSeed,
    tournament_year: 2026,
    round,
    match_number: matchNo,
    home_team: homeName,
    away_team: awayName,
    home_score: null,
    away_score: null,
    home_score_pen: null,
    away_score_pen: null,
    match_date: Number.isFinite(startMs) ? new Date(startMs).toISOString() : null,
    stadium: sched?.stadium ?? null,
    city: sched?.city ?? null,
    video_url: null,
    predicted: true,
    home_seed_label: homeHint,
    away_seed_label: awayHint,
  };
}

/**
 * Compute 16 predicted R32 fixtures from the official FIFA matrix.
 */
export function computeR32(groups: Wc2026Group[]): WCMatch[] {
  if (groups.length === 0) return [];
  const seeds = pickSeeds(groups);
  const out: WCMatch[] = [];
  for (let i = 0; i < R32_MATRIX.length; i++) {
    const row = R32_MATRIX[i];
    const homeTeam = resolveSeed(row.home, seeds);
    const awayTeam = resolveSeed(row.away, seeds);
    const homeHint = slotLabel(row.home);
    const awayHint = slotLabel(row.away);
    const sched = SCHEDULE_BY_MATCH.get(row.matchNo) ?? null;
    out.push(
      buildMatch(
        row.matchNo,
        "Round of 32",
        homeTeam?.team.name ?? homeHint,
        awayTeam?.team.name ?? awayHint,
        homeHint,
        awayHint,
        sched,
        -9000 - (i + 1),
      ),
    );
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// R16 → QF → SF → F → 3rd-place bracket derivation
//
// Bracket pairings (FIFA-published):
//   R16: W(M74) v W(M77), W(M73) v W(M75), W(M76) v W(M78), W(M79) v W(M80),
//        W(M83) v W(M84), W(M81) v W(M82), W(M86) v W(M88), W(M85) v W(M87)
//   QF:  W(M89) v W(M90), W(M93) v W(M94), W(M91) v W(M92), W(M95) v W(M96)
//   SF:  W(M97) v W(M98), W(M99) v W(M100)
//   3rd: L(M101) v L(M102)
//   F:   W(M101) v W(M102)
// ───────────────────────────────────────────────────────────────────────────

type Pairing = { matchNo: number; round: string; leftFrom: number; rightFrom: number };

const LATER_ROUNDS: Pairing[] = [
  // Round of 16 (M89–M96)
  { matchNo: 89,  round: "Round of 16",     leftFrom: 74, rightFrom: 77 },
  { matchNo: 90,  round: "Round of 16",     leftFrom: 73, rightFrom: 75 },
  { matchNo: 91,  round: "Round of 16",     leftFrom: 76, rightFrom: 78 },
  { matchNo: 92,  round: "Round of 16",     leftFrom: 79, rightFrom: 80 },
  { matchNo: 93,  round: "Round of 16",     leftFrom: 83, rightFrom: 84 },
  { matchNo: 94,  round: "Round of 16",     leftFrom: 81, rightFrom: 82 },
  { matchNo: 95,  round: "Round of 16",     leftFrom: 86, rightFrom: 88 },
  { matchNo: 96,  round: "Round of 16",     leftFrom: 85, rightFrom: 87 },
  // Quarterfinals (M97–M100)
  { matchNo: 97,  round: "Quarterfinal",    leftFrom: 89, rightFrom: 90 },
  { matchNo: 98,  round: "Quarterfinal",    leftFrom: 93, rightFrom: 94 },
  { matchNo: 99,  round: "Quarterfinal",    leftFrom: 91, rightFrom: 92 },
  { matchNo: 100, round: "Quarterfinal",    leftFrom: 95, rightFrom: 96 },
  // Semifinals (M101–M102)
  { matchNo: 101, round: "Semifinal",       leftFrom: 97, rightFrom: 98 },
  { matchNo: 102, round: "Semifinal",       leftFrom: 99, rightFrom: 100 },
  // 3rd-place play-off (M103) — losers of the semis
  { matchNo: 103, round: "Third-Place Play-off", leftFrom: 101, rightFrom: 102 },
  // Final (M104)
  { matchNo: 104, round: "Final",           leftFrom: 101, rightFrom: 102 },
];

/**
 * Compute predicted R16 → Final fixtures. Team labels are chain hints like
 * "Winner Match 73"; they replace as soon as ESPN publishes that round.
 */
export function computePredictedKnockout(groups: Wc2026Group[]): WCMatch[] {
  if (groups.length === 0) return [];
  const out: WCMatch[] = [];
  for (const p of LATER_ROUNDS) {
    const isThird = p.round.startsWith("Third");
    const leftHint = isThird ? `Loser Match ${p.leftFrom}` : `Winner Match ${p.leftFrom}`;
    const rightHint = isThird ? `Loser Match ${p.rightFrom}` : `Winner Match ${p.rightFrom}`;
    out.push(
      buildMatch(
        p.matchNo,
        p.round,
        leftHint,
        rightHint,
        leftHint,
        rightHint,
        LATER_SCHEDULE_BY_MATCH.get(p.matchNo) ?? null,
        -9000 - p.matchNo,
      ),
    );
  }
  return out;
}
