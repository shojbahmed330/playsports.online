// Country / team → flag emoji lookup.
// Used across WC archive, 2026 view, players page, etc.

const MAP: Record<string, string> = {
  // 2026 expanded field + historical WC teams
  Argentina: "🇦🇷", Australia: "🇦🇺", Austria: "🇦🇹", Belgium: "🇧🇪",
  Bolivia: "🇧🇴", "Bosnia and Herzegovina": "🇧🇦", "Bosnia & Herzegovina": "🇧🇦",
  Brazil: "🇧🇷", Bulgaria: "🇧🇬", Cameroon: "🇨🇲", Canada: "🇨🇦",
  "Cape Verde": "🇨🇻", "Cabo Verde": "🇨🇻", Chile: "🇨🇱",
  China: "🇨🇳", "China PR": "🇨🇳", Colombia: "🇨🇴", "Costa Rica": "🇨🇷",
  Croatia: "🇭🇷", Cuba: "🇨🇺", Curacao: "🇨🇼", "Curaçao": "🇨🇼",
  "Czech Republic": "🇨🇿", Czechoslovakia: "🇨🇿", Czechia: "🇨🇿",
  Algeria: "🇩🇿", "Türkiye": "🇹🇷", Turkiye: "🇹🇷", Turkey: "🇹🇷",
  Venezuela: "🇻🇪", Denmark: "🇩🇰", "Dutch East Indies": "🇮🇩",
  Ecuador: "🇪🇨", Egypt: "🇪🇬", "El Salvador": "🇸🇻",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", France: "🇫🇷",
  Germany: "🇩🇪", "West Germany": "🇩🇪", "East Germany": "🇩🇪",
  Ghana: "🇬🇭", Greece: "🇬🇷", Haiti: "🇭🇹", Honduras: "🇭🇳",
  Hungary: "🇭🇺", Iceland: "🇮🇸", Iran: "🇮🇷", "IR Iran": "🇮🇷",
  Iraq: "🇮🇶", Israel: "🇮🇱", Italy: "🇮🇹",
  "Ivory Coast": "🇨🇮", "Côte d'Ivoire": "🇨🇮", "Cote d'Ivoire": "🇨🇮",
  Jamaica: "🇯🇲", Japan: "🇯🇵", Jordan: "🇯🇴",
  "Korea DPR": "🇰🇵", "North Korea": "🇰🇵",
  "Korea Republic": "🇰🇷", "South Korea": "🇰🇷",
  Kuwait: "🇰🇼", Mexico: "🇲🇽", Morocco: "🇲🇦",
  Netherlands: "🇳🇱", "New Zealand": "🇳🇿", Nigeria: "🇳🇬",
  "Northern Ireland": "🇬🇧", Norway: "🇳🇴", Panama: "🇵🇦", Paraguay: "🇵🇾",
  Peru: "🇵🇪", Poland: "🇵🇱", Portugal: "🇵🇹", Qatar: "🇶🇦",
  "Republic of Ireland": "🇮🇪", Ireland: "🇮🇪", Romania: "🇷🇴",
  Russia: "🇷🇺", "Saudi Arabia": "🇸🇦", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Senegal: "🇸🇳", "Serbia and Montenegro": "🇷🇸", Serbia: "🇷🇸",
  Slovakia: "🇸🇰", Slovenia: "🇸🇮", "South Africa": "🇿🇦",
  Soviet_Union: "🇷🇺", "Soviet Union": "🇷🇺", USSR: "🇷🇺",
  Spain: "🇪🇸", Sweden: "🇸🇪", Switzerland: "🇨🇭", Togo: "🇹🇬",
  "Trinidad and Tobago": "🇹🇹", Tunisia: "🇹🇳",
  Ukraine: "🇺🇦", "United Arab Emirates": "🇦🇪", UAE: "🇦🇪",
  "United States": "🇺🇸", USA: "🇺🇸", "USMNT": "🇺🇸",
  Uruguay: "🇺🇾", Uzbekistan: "🇺🇿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Yugoslavia: "🇷🇸", "FR Yugoslavia": "🇷🇸", Zaire: "🇨🇩", DRC: "🇨🇩",
  "DR Congo": "🇨🇩", "Congo DR": "🇨🇩", Congo: "🇨🇬",
  // Additional confederation regulars / 2026 qualifying contenders
  Angola: "🇦🇴", Benin: "🇧🇯", "Burkina Faso": "🇧🇫", "Equatorial Guinea": "🇬🇶",
  Gabon: "🇬🇦", Gambia: "🇬🇲", Guinea: "🇬🇳", "Guinea-Bissau": "🇬🇼",
  Kenya: "🇰🇪", Libya: "🇱🇾", Madagascar: "🇲🇬", Mali: "🇲🇱",
  Mauritania: "🇲🇷", Mozambique: "🇲🇿", Namibia: "🇳🇦", Niger: "🇳🇪",
  Rwanda: "🇷🇼", Sudan: "🇸🇩", Tanzania: "🇹🇿", Uganda: "🇺🇬",
  Zambia: "🇿🇲", Zimbabwe: "🇿🇼", Ethiopia: "🇪🇹",
  Bahrain: "🇧🇭", Lebanon: "🇱🇧", Oman: "🇴🇲", Palestine: "🇵🇸",
  Syria: "🇸🇾", Yemen: "🇾🇪", Kyrgyzstan: "🇰🇬", Tajikistan: "🇹🇯",
  Turkmenistan: "🇹🇲", Indonesia: "🇮🇩", Malaysia: "🇲🇾", Thailand: "🇹🇭",
  Vietnam: "🇻🇳", Philippines: "🇵🇭", India: "🇮🇳", Bangladesh: "🇧🇩",
  Pakistan: "🇵🇰", "Sri Lanka": "🇱🇰", Afghanistan: "🇦🇫",
  Guatemala: "🇬🇹", Nicaragua: "🇳🇮", Suriname: "🇸🇷", Guyana: "🇬🇾",
  "Dominican Republic": "🇩🇴", "Puerto Rico": "🇵🇷",
  "Antigua and Barbuda": "🇦🇬", Barbados: "🇧🇧", Bermuda: "🇧🇲",
  Grenada: "🇬🇩", "St. Kitts and Nevis": "🇰🇳", "Saint Kitts and Nevis": "🇰🇳",
  "St. Lucia": "🇱🇨", "Saint Lucia": "🇱🇨",
  Finland: "🇫🇮", Estonia: "🇪🇪", Latvia: "🇱🇻", Lithuania: "🇱🇹",
  Belarus: "🇧🇾", Moldova: "🇲🇩", Albania: "🇦🇱", Kosovo: "🇽🇰",
  "North Macedonia": "🇲🇰", Montenegro: "🇲🇪", Cyprus: "🇨🇾",
  Malta: "🇲🇹", Luxembourg: "🇱🇺", Andorra: "🇦🇩", "San Marino": "🇸🇲",
  Liechtenstein: "🇱🇮", Georgia: "🇬🇪", Armenia: "🇦🇲", Azerbaijan: "🇦🇿",
  Kazakhstan: "🇰🇿",
  "New Caledonia": "🇳🇨", Fiji: "🇫🇯", Tahiti: "🇵🇫",
};

// Build a normalized lookup so "USA" matches "u s a", "South Korea" matches
// "korea republic" via alias chain, etc.
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ALIAS: Record<string, string> = {
  "us": "United States",
  "usa": "United States",
  "u s a": "United States",
  "united states of america": "United States",
  "usmnt": "United States",
  "korea republic": "South Korea",
  "korea": "South Korea",
  "ir iran": "Iran",
  "cote d ivoire": "Ivory Coast",
  "cote divoire": "Ivory Coast",
  "cabo verde": "Cape Verde",
  "czechia": "Czech Republic",
  "turkiye": "Turkey",
  "congo dr": "DR Congo",
  "democratic republic of congo": "DR Congo",
  "dr congo": "DR Congo",
  "uae": "United Arab Emirates",
};

const NORM_MAP = new Map<string, string>();
for (const [k, v] of Object.entries(MAP)) NORM_MAP.set(norm(k), v);

export function flagOf(team: string | null | undefined): string {
  if (!team) return "⚽";
  if (MAP[team]) return MAP[team];
  const trimmed = team.trim();
  if (MAP[trimmed]) return MAP[trimmed];
  const n = norm(trimmed);
  const direct = NORM_MAP.get(n);
  if (direct) return direct;
  const aliased = ALIAS[n];
  if (aliased && MAP[aliased]) return MAP[aliased];
  return "⚽";
}
