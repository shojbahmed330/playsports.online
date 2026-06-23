// Country → confederation lookup for World Cup nations.
// Used by /players filters.

export type Confederation =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

const MAP: Record<string, Confederation> = {
  // UEFA
  Albania: "UEFA",
  Austria: "UEFA",
  Belgium: "UEFA",
  "Bosnia and Herzegovina": "UEFA",
  Bulgaria: "UEFA",
  Croatia: "UEFA",
  Czechoslovakia: "UEFA",
  "Czech Republic": "UEFA",
  Czechia: "UEFA",
  Denmark: "UEFA",
  England: "UEFA",
  "East Germany": "UEFA",
  France: "UEFA",
  Germany: "UEFA",
  "West Germany": "UEFA",
  Greece: "UEFA",
  Hungary: "UEFA",
  Iceland: "UEFA",
  Italy: "UEFA",
  Netherlands: "UEFA",
  "Northern Ireland": "UEFA",
  Norway: "UEFA",
  Poland: "UEFA",
  Portugal: "UEFA",
  Republic_of_Ireland: "UEFA",
  "Republic of Ireland": "UEFA",
  Ireland: "UEFA",
  Romania: "UEFA",
  Russia: "UEFA",
  Scotland: "UEFA",
  "Serbia and Montenegro": "UEFA",
  Serbia: "UEFA",
  Slovakia: "UEFA",
  Slovenia: "UEFA",
  "Soviet Union": "UEFA",
  Spain: "UEFA",
  Sweden: "UEFA",
  Switzerland: "UEFA",
  Türkiye: "UEFA",
  Turkey: "UEFA",
  Ukraine: "UEFA",
  Wales: "UEFA",
  Yugoslavia: "UEFA",

  // CONMEBOL
  Argentina: "CONMEBOL",
  Bolivia: "CONMEBOL",
  Brazil: "CONMEBOL",
  Chile: "CONMEBOL",
  Colombia: "CONMEBOL",
  Ecuador: "CONMEBOL",
  Paraguay: "CONMEBOL",
  Peru: "CONMEBOL",
  Uruguay: "CONMEBOL",
  Venezuela: "CONMEBOL",

  // CONCACAF
  Canada: "CONCACAF",
  "Costa Rica": "CONCACAF",
  Cuba: "CONCACAF",
  "El Salvador": "CONCACAF",
  Haiti: "CONCACAF",
  Honduras: "CONCACAF",
  Jamaica: "CONCACAF",
  Mexico: "CONCACAF",
  "Trinidad and Tobago": "CONCACAF",
  "United States": "CONCACAF",
  USA: "CONCACAF",
  "United States of America": "CONCACAF",
  Panama: "CONCACAF",

  // CAF
  Algeria: "CAF",
  Angola: "CAF",
  Cameroon: "CAF",
  "Cape Verde": "CAF",
  "Côte d'Ivoire": "CAF",
  "Ivory Coast": "CAF",
  "DR Congo": "CAF",
  Egypt: "CAF",
  Ghana: "CAF",
  Morocco: "CAF",
  Nigeria: "CAF",
  Senegal: "CAF",
  "South Africa": "CAF",
  Togo: "CAF",
  Tunisia: "CAF",
  Zaire: "CAF",

  // AFC
  Australia: "AFC",
  China: "AFC",
  "China PR": "AFC",
  "DPR Korea": "AFC",
  "North Korea": "AFC",
  "Korea Republic": "AFC",
  "South Korea": "AFC",
  Iran: "AFC",
  "IR Iran": "AFC",
  Iraq: "AFC",
  Japan: "AFC",
  "Saudi Arabia": "AFC",
  Qatar: "AFC",
  "United Arab Emirates": "AFC",
  Kuwait: "AFC",
  "Dutch East Indies": "AFC",
  Israel: "AFC",
  Uzbekistan: "AFC",
  Jordan: "AFC",

  // OFC
  "New Zealand": "OFC",
};

export function confederationOf(country: string): Confederation | null {
  return MAP[country] ?? null;
}

export const CONFEDERATIONS: Confederation[] = [
  "UEFA",
  "CONMEBOL",
  "CONCACAF",
  "CAF",
  "AFC",
  "OFC",
];
