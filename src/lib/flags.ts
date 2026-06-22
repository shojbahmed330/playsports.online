// Best-effort country → flag emoji mapping for the WC archive.
const MAP: Record<string, string> = {
  Argentina: "🇦🇷", Australia: "🇦🇺", Austria: "🇦🇹", Belgium: "🇧🇪",
  Bolivia: "🇧🇴", "Bosnia and Herzegovina": "🇧🇦", Brazil: "🇧🇷",
  Bulgaria: "🇧🇬", Cameroon: "🇨🇲", Canada: "🇨🇦", Chile: "🇨🇱",
  China: "🇨🇳", "China PR": "🇨🇳", Colombia: "🇨🇴", "Costa Rica": "🇨🇷",
  Croatia: "🇭🇷", Cuba: "🇨🇺", "Czech Republic": "🇨🇿", Czechoslovakia: "🇨🇿",
  Czechia: "🇨🇿", Algeria: "🇩🇿", "Bosnia & Herzegovina": "🇧🇦",
  "Türkiye": "🇹🇷", Turkiye: "🇹🇷", Venezuela: "🇻🇪", Norway: "🇳🇴",
  Denmark: "🇩🇰", "Dutch East Indies": "🇮🇩", Ecuador: "🇪🇨", Egypt: "🇪🇬",
  "El Salvador": "🇸🇻", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", France: "🇫🇷",
  "Germany": "🇩🇪", "West Germany": "🇩🇪", "East Germany": "🇩🇪",
  Ghana: "🇬🇭", Greece: "🇬🇷", Haiti: "🇭🇹", Honduras: "🇭🇳",
  Hungary: "🇭🇺", Iceland: "🇮🇸", Iran: "🇮🇷", "IR Iran": "🇮🇷",
  Iraq: "🇮🇶", Israel: "🇮🇱", Italy: "🇮🇹", "Ivory Coast": "🇨🇮",
  "Côte d'Ivoire": "🇨🇮", Jamaica: "🇯🇲", Japan: "🇯🇵",
  "Korea DPR": "🇰🇵", "North Korea": "🇰🇵", "Korea Republic": "🇰🇷",
  "South Korea": "🇰🇷", Kuwait: "🇰🇼", Mexico: "🇲🇽", Morocco: "🇲🇦",
  Netherlands: "🇳🇱", "New Zealand": "🇳🇿", Nigeria: "🇳🇬",
  "Northern Ireland": "🇬🇧", Norway: "🇳🇴", Panama: "🇵🇦", Paraguay: "🇵🇾",
  Peru: "🇵🇪", Poland: "🇵🇱", Portugal: "🇵🇹", Qatar: "🇶🇦",
  "Republic of Ireland": "🇮🇪", Ireland: "🇮🇪", Romania: "🇷🇴",
  Russia: "🇷🇺", "Saudi Arabia": "🇸🇦", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Senegal: "🇸🇳", "Serbia and Montenegro": "🇷🇸", Serbia: "🇷🇸",
  Slovakia: "🇸🇰", Slovenia: "🇸🇮", "South Africa": "🇿🇦",
  Soviet_Union: "🇷🇺", "Soviet Union": "🇷🇺", USSR: "🇷🇺",
  Spain: "🇪🇸", Sweden: "🇸🇪", Switzerland: "🇨🇭", Togo: "🇹🇬",
  "Trinidad and Tobago": "🇹🇹", Tunisia: "🇹🇳", Turkey: "🇹🇷",
  Ukraine: "🇺🇦", "United Arab Emirates": "🇦🇪", "United States": "🇺🇸",
  USA: "🇺🇸", Uruguay: "🇺🇾", Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Yugoslavia: "🇷🇸", "FR Yugoslavia": "🇷🇸", Zaire: "🇨🇩", DRC: "🇨🇩",
};

export function flagOf(team: string | null | undefined): string {
  if (!team) return "⚽";
  return MAP[team] ?? MAP[team.trim()] ?? "⚽";
}
