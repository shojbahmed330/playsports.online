import { listTeams, listPlayers, listCountryYears, listPlayerYears } from "./src/lib/seo/programmatic";
import { listMatchSlugs, listHighlights, WC2026_STAGES } from "./src/lib/seo/entities";
import { COMPETITIONS } from "./src/lib/competitions";
import { COMPETITION_EDITIONS } from "./src/data/competition-editions";
import { WC_TOURNAMENTS } from "./src/data/wc_tournaments";

console.log("Matches:", listMatchSlugs().length);
console.log("Teams:", listTeams().length);
console.log("Players:", listPlayers().length);
console.log("PlayerYears:", listPlayerYears().length);
console.log("CountryYears:", listCountryYears().length);
console.log("Highlights:", listHighlights().length);

let compEntries = 0;
const sections = ["", "/scores", "/fixtures", "/standings", "/history", "/records", "/teams", "/players"];
const recordCats = ["top-scorers-all-time", "most-titles", "most-appearances", "records-and-firsts"];
for (const c of COMPETITIONS) {
    if (c.slug === "world-cup") continue;
    compEntries += sections.length;
    compEntries += recordCats.length;
    compEntries += (COMPETITION_EDITIONS[c.slug] ?? []).length;
}
console.log("Competition Entries:", compEntries);
