// Lightweight country → confederation mapping for accent gradients.
// Used by mobile MatchCard / GroupDeck.

export type Confederation = "uefa" | "conmebol" | "concacaf" | "caf" | "afc" | "ofc" | "none";

const M: Record<string, Confederation> = {
  // CONMEBOL
  Argentina: "conmebol", Brazil: "conmebol", Uruguay: "conmebol", Colombia: "conmebol",
  Chile: "conmebol", Peru: "conmebol", Ecuador: "conmebol", Paraguay: "conmebol",
  Bolivia: "conmebol", Venezuela: "conmebol",
  // CONCACAF
  "United States": "concacaf", USA: "concacaf", Mexico: "concacaf", Canada: "concacaf",
  "Costa Rica": "concacaf", Panama: "concacaf", Honduras: "concacaf", Jamaica: "concacaf",
  "Trinidad and Tobago": "concacaf", "El Salvador": "concacaf", Cuba: "concacaf", Haiti: "concacaf",
  // CAF
  Morocco: "caf", Senegal: "caf", Tunisia: "caf", Cameroon: "caf", Ghana: "caf",
  Nigeria: "caf", Algeria: "caf", Egypt: "caf", "Ivory Coast": "caf", "Côte d'Ivoire": "caf",
  "South Africa": "caf", "DR Congo": "caf", Mali: "caf", "Cape Verde": "caf",
  // AFC
  Japan: "afc", "South Korea": "afc", Australia: "afc", "Saudi Arabia": "afc",
  Iran: "afc", Iraq: "afc", Qatar: "afc", "United Arab Emirates": "afc", UAE: "afc",
  Uzbekistan: "afc", Jordan: "afc", China: "afc", "North Korea": "afc",
  // OFC
  "New Zealand": "ofc", "Solomon Islands": "ofc", Fiji: "ofc", Tahiti: "ofc",
};

const UEFA = new Set<string>([
  "England","France","Germany","Italy","Spain","Portugal","Netherlands","Belgium","Croatia",
  "Switzerland","Denmark","Sweden","Norway","Poland","Serbia","Russia","Ukraine","Turkey",
  "Wales","Scotland","Northern Ireland","Republic of Ireland","Ireland","Iceland","Czech Republic",
  "Czechia","Slovakia","Slovenia","Hungary","Romania","Bulgaria","Greece","Albania","Austria",
  "Bosnia and Herzegovina","North Macedonia","Montenegro","Kosovo","Israel","Georgia","Armenia",
  "Azerbaijan","Belarus","Estonia","Latvia","Lithuania","Finland","Luxembourg","Cyprus","Malta",
  "Moldova","Andorra","San Marino","Liechtenstein","Faroe Islands","Gibraltar","Yugoslavia",
  "West Germany","East Germany","Soviet Union","Czechoslovakia",
]);

export function confederationOf(team: string): Confederation {
  if (!team) return "none";
  if (M[team]) return M[team];
  if (UEFA.has(team)) return "uefa";
  return "none";
}

export function confClass(team: string): string {
  return `conf-${confederationOf(team)}`;
}

/** Display labels (uppercase) used by Players filter chips. */
export const CONFEDERATIONS = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"] as const;
export type ConfederationLabel = typeof CONFEDERATIONS[number];

/** Returns the uppercase confederation label (or null) for a team. */
export function confederationLabel(team: string): ConfederationLabel | null {
  const c = confederationOf(team);
  if (c === "none") return null;
  return c.toUpperCase() as ConfederationLabel;
}

