// ESPN cricket series/league registry.
// IDs come from ESPN's series catalog; "current/active" pages reuse last
// season's id once a new season starts.

export type CricketLeague = {
  id: string;                 // ESPN series/league id
  slug: string;               // url-safe key
  label: string;              // short label
  longName: string;           // full name
  emoji: string;
  format: "t20" | "odi" | "test" | "mixed";
  group: "international" | "franchise" | "domestic";
  accent: string;             // tailwind text color
  chipBg: string;
  ring: string;
  bgGrad: string;
  tagline: string;
};

export const CRICKET_LEAGUES: CricketLeague[] = [
  {
    id: "8048", slug: "ipl", label: "IPL", longName: "Indian Premier League",
    emoji: "🇮🇳", format: "t20", group: "franchise",
    accent: "text-amber-300", chipBg: "bg-amber-500/15", ring: "ring-amber-500/30",
    bgGrad: "from-amber-900/40 via-slate-900 to-blue-900/20",
    tagline: "The world's biggest T20 league",
  },
  {
    id: "8039", slug: "icc-world-cup", label: "ICC WC", longName: "ICC Cricket World Cup",
    emoji: "🏆", format: "odi", group: "international",
    accent: "text-yellow-300", chipBg: "bg-yellow-500/15", ring: "ring-yellow-500/30",
    bgGrad: "from-yellow-900/40 via-slate-900 to-emerald-900/20",
    tagline: "ODI World Cup — every four years",
  },
  {
    id: "8132", slug: "t20-world-cup", label: "T20 WC", longName: "ICC Men's T20 World Cup",
    emoji: "⚡", format: "t20", group: "international",
    accent: "text-fuchsia-300", chipBg: "bg-fuchsia-500/15", ring: "ring-fuchsia-500/30",
    bgGrad: "from-fuchsia-900/40 via-slate-900 to-purple-900/20",
    tagline: "20-over global championship",
  },
  {
    id: "8044", slug: "bbl", label: "BBL", longName: "Big Bash League",
    emoji: "🇦🇺", format: "t20", group: "franchise",
    accent: "text-orange-300", chipBg: "bg-orange-500/15", ring: "ring-orange-500/30",
    bgGrad: "from-orange-900/40 via-slate-900 to-yellow-900/20",
    tagline: "Australia's premier T20 league",
  },
  {
    id: "23360199", slug: "psl", label: "PSL", longName: "Pakistan Super League",
    emoji: "🇵🇰", format: "t20", group: "franchise",
    accent: "text-emerald-300", chipBg: "bg-emerald-500/15", ring: "ring-emerald-500/30",
    bgGrad: "from-emerald-900/40 via-slate-900 to-lime-900/20",
    tagline: "Pakistan's franchise T20",
  },
  {
    id: "22791243", slug: "sa20", label: "SA20", longName: "SA20 — South Africa",
    emoji: "🇿🇦", format: "t20", group: "franchise",
    accent: "text-sky-300", chipBg: "bg-sky-500/15", ring: "ring-sky-500/30",
    bgGrad: "from-sky-900/40 via-slate-900 to-cyan-900/20",
    tagline: "South Africa's premier T20",
  },
  {
    id: "19429", slug: "the-hundred", label: "The Hundred", longName: "The Hundred (England)",
    emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", format: "t20", group: "franchise",
    accent: "text-pink-300", chipBg: "bg-pink-500/15", ring: "ring-pink-500/30",
    bgGrad: "from-pink-900/40 via-slate-900 to-rose-900/20",
    tagline: "England's 100-ball format",
  },
  {
    id: "17280", slug: "cpl", label: "CPL", longName: "Caribbean Premier League",
    emoji: "🌴", format: "t20", group: "franchise",
    accent: "text-lime-300", chipBg: "bg-lime-500/15", ring: "ring-lime-500/30",
    bgGrad: "from-lime-900/40 via-slate-900 to-emerald-900/20",
    tagline: "Caribbean franchise T20",
  },
  {
    id: "8043", slug: "sheffield-shield", label: "Sheff Shield", longName: "Sheffield Shield",
    emoji: "🇦🇺", format: "test", group: "domestic",
    accent: "text-stone-300", chipBg: "bg-stone-500/15", ring: "ring-stone-500/30",
    bgGrad: "from-stone-800/50 via-slate-900 to-stone-900/30",
    tagline: "Australia's domestic first-class",
  },
];

export const CRICKET_LEAGUE_BY_SLUG: Record<string, CricketLeague> = Object.fromEntries(
  CRICKET_LEAGUES.map((l) => [l.slug, l]),
);
export const CRICKET_LEAGUE_BY_ID: Record<string, CricketLeague> = Object.fromEntries(
  CRICKET_LEAGUES.map((l) => [l.id, l]),
);

export const CURATED_LEAGUE_IDS: Set<string> = new Set(CRICKET_LEAGUES.map((l) => l.id));
export function isCuratedLeague(id: string | null | undefined): boolean {
  return !!id && CURATED_LEAGUE_IDS.has(String(id));
}

// Active bilateral / international tour series IDs on ESPN.
// ESPN's global cricket scoreboard is empty and there's no public
// "all bilaterals" endpoint, so we maintain the FTP catalogue ourselves.
// Each series's per-id scoreboard returns the next/live match in that tour.
// Server fetches all in parallel, dedupes by event id, and tags league.
// Add/remove IDs as the FTP rolls forward.
export const BILATERAL_SERIES_IDS: string[] = [
  "1496488", // India tour of England 2026
  "1496489", // India in England T20I Series 2026
  "1496490", // India in England ODI Series 2026
  "1496491", // New Zealand tour of England 2026
  "1496492", // Crowe-Thorpe Trophy 2026
  "1496529", // New Zealand Women tour of England 2026
  "1496530", // New Zealand Women in England ODI Series 2026
  "1496531", // New Zealand Women in England T20I Series 2026
  "1496532", // India Women tour of England 2026
  "1496533", // India Women in England T20I Series 2026
  "1496534", // India Women in England Test Match 2026
  "1496535", // Ireland Women in England ODI Series 2026
  "1496536", // Ireland Women tour of England 2026
  "1496563", // Pakistan tour of England 2026
  "1496564", // Pakistan in England Test Series 2026
  "1496567", // Sri Lanka tour of England 2026
  "1496568", // Sri Lanka in England T20I Series 2026
  "1496569", // Sri Lanka in England ODI Series 2026
  "1517343", // President's Trophy
  "1517645", // Afghanistan tour of United Arab Emirates [Jan 2026] 2025/26
  "1517646", // Afghanistan v West Indies T20I Series 2025/26
  "1517686", // India Under-19s tour of South Africa 2025/26
  "1517687", // India Under-19s in South Africa Youth ODI Series 2025/26
  "1517705", // West Indies tour of United Arab Emirates 2025/26
  "1517955", // ICC Men's Under-19 World Cup Warm-up Matches 2025/26
  "1518377", // Indian Street Premier League
  "1518747", // Women's National Super League T20 Tournament 2025/26
  "1519006", // India Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519007", // United States of America Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519008", // Scotland Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519010", // Tanzania Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519011", // West Indies Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519013", // England Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519014", // Pakistan Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519015", // Australia Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519016", // Ireland Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519017", // Afghanistan Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519019", // South Africa Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519021", // Japan Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519022", // Sri Lanka Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519023", // New Zealand Under-19s tour of Zimbabwe and Namibia 2025/26
  "1519123", // Ireland tour of United Arab Emirates 2025/26
  "1519124", // Italy tour of United Arab Emirates 2025/26
  "1519125", // Ireland v Italy T20I Series 2025/26
  "1519126", // Ireland in United Arab Emirates T20I Series 2025/26
  "1519142", // Lotus Cup Women's Tri-Series
  "1519143", // Malaysia Women tour of Bhutan 2025/26
  "1519144", // Hong Kong Women tour of Bhutan 2025/26
  "1519312", // Hong Kong All Stars T20 Series
  "1519331", // Bangladesh Women tour of Nepal 2025/26
  "1519332", // Netherlands Women tour of Nepal 2025/26
  "1519336", // Papua New Guinea Women tour of Nepal 2025/26
  "1519338", // Zimbabwe Women tour of Nepal 2025/26
  "1519339", // Ireland Women tour of Nepal 2025/26
  "1519340", // Namibia Women tour of Nepal 2025/26
  "1519342", // Thailand Women tour of Nepal 2025/26
  "1519343", // Scotland Women tour of Nepal 2025/26
  "1519344", // United States of America Women tour of Nepal 2025/26
  "1519629", // Australia tour of Pakistan 2025/26
  "1519630", // Australia in Pakistan T20I Series 2025/26
  "1520754", // Denmark Women tour of Oman 2025/26
  "1520755", // Denmark Women in Oman T20I Series 2025/26
  "1521103", // Netherlands tour of India and Sri Lanka 2025/26
  "1521104", // Scotland tour of India and Sri Lanka 2025/26
  "1521105", // West Indies tour of India and Sri Lanka 2025/26
  "1521107", // United States of America tour of India and Sri Lanka 2025/26
  "1521108", // Afghanistan tour of India and Sri Lanka 2025/26
  "1521109", // New Zealand tour of India and Sri Lanka 2025/26
  "1521110", // England tour of India and Sri Lanka 2025/26
  "1521111", // Nepal tour of India and Sri Lanka 2025/26
  "1521112", // Ireland tour of India and Sri Lanka 2025/26
  "1521113", // Italy tour of India and Sri Lanka 2025/26
  "1521114", // Oman tour of India and Sri Lanka 2025/26
  "1521115", // Zimbabwe tour of India and Sri Lanka 2025/26
  "1521116", // Canada tour of India and Sri Lanka 2025/26
  "1521117", // South Africa tour of India and Sri Lanka 2025/26
  "1521118", // Namibia tour of India and Sri Lanka 2025/26
  "1521119", // United Arab Emirates tour of India and Sri Lanka 2025/26
  "1521120", // Australia tour of India and Sri Lanka 2025/26
  "1521122", // India tour of Sri Lanka 2025/26
  "1521123", // Pakistan tour of Sri Lanka [Feb 2026] 2025/26
  "1521126", // ICC Men's T20 World Cup Warm-up Matches 2025/26
  "1521176", // The Hundred Men's Competition
  "1521193", // The Hundred Women's Competition
  "1521645", // Hong Kong Premier League T20 Tournament
  "1521646", // Hong Kong Women's Premier League T20 Tournament 2025/26
  "1522017", // England Lions tour of United Arab Emirates 2025/26
  "1522018", // Pakistan Shaheens tour of United Arab Emirates 2025/26
  "1522019", // England Lions v Pakistan Shaheens unofficial T20I Series 2025/26
  "1522021", // England Lions v Pakistan Shaheens unofficial ODI Series 2025/26
  "1522054", // ACC Women's Asia Cup Rising Stars
  "1522055", // Nepal Women tour of Thailand 2025/26
  "1522056", // Pakistan A Women tour of Thailand 2025/26
  "1522058", // India A Women tour of Thailand 2025/26
  "1522059", // Sri Lanka A Women tour of Thailand 2025/26
  "1522060", // United Arab Emirates Women tour of Thailand [Feb 2026] 2025/26
  "1522062", // Bangladesh A Women tour of Thailand 2025/26
  "1522065", // Malaysia Women tour of Thailand [Feb 2026] 2025/26
  "1522980", // Oman Women tour of Qatar 2025/26
  "1522981", // Oman Women in Qatar T20I Series 2025/26
  "1522982", // Bahrain tour of Qatar 2025/26
  "1522983", // Bahrain in Qatar T20I Series 2025/26
  "1522989", // Quadrangular Twenty20 Series (Thailand)
  "1522990", // Japan tour of Thailand 2025/26
  "1522991", // Bahrain tour of Thailand 2025/26
  "1522992", // Bhutan tour of Thailand 2025/26
  "1523747", // National T20 Cup Qualifiers 2025/26
  "1523975", // Sri Lanka Women tour of West Indies 2025/26
  "1523976", // Sri Lanka Women in West Indies ODI Series 2025/26
  "1523977", // Sri Lanka Women in West Indies T20I Series 2025/26
  "1523984", // Jay Trophy (Men's Elite Cup)
  "1524758", // Kuwait tour of Hong Kong [Feb 2026] 2025/26
  "1524759", // Kuwait in Hong Kong T20I Series 2025/26
  "1524760", // Kuwait in Hong Kong unofficial ODI Series 2025/26
  "1525152", // ICC Men's T20 World Cup Sub Regional Americas Qualifier B
  "1525153", // Argentina tour of Cayman Islands 2025/26
  "1525154", // Mexico tour of Cayman Islands 2025/26
  "1525155", // Suriname tour of Cayman Islands 2025/26
  "1525333", // ICC Women's Championship
  "1525578", // Bangladesh Cricket League One-Day
  "1525632", // Pakistan tour of Bangladesh 2025/26
  "1525633", // Pakistan in Bangladesh ODI Series 2025/26
  "1525634", // Australia tour of South Africa 2026/27
  "1525635", // Australia in South Africa ODI Series 2026/27
  "1525636", // Australia in South Africa Test Series 2026/27
  "1525637", // Bangladesh tour of South Africa 2026/27
  "1525638", // Bangladesh in South Africa Test Series 2026/27
  "1525639", // Bangladesh in South Africa ODI Series 2026/27
  "1525640", // Bangladesh in South Africa T20I Series 2026/27
  "1525641", // England tour of South Africa 2026/27
  "1525642", // Basil D'Oliveira Trophy 2026/27
  "1525643", // England in South Africa ODI Series 2026/27
  "1525644", // Sri Lanka tour of United Arab Emirates 2025/26
  "1525645", // Afghanistan tour of United Arab Emirates [Mar 2026] 2025/26
  "1525646", // Afghanistan v Sri Lanka T20I Series 2025/26
  "1525647", // Afghanistan v Sri Lanka ODI Series 2025/26
  "1526561", // Australia Women tour of West Indies 2025/26
  "1526562", // Australia Women in West Indies T20I Series 2025/26
  "1526563", // Australia Women in West Indies ODI Series 2025/26
  "1526687", // Nigeria Invitational Women's T20I Tournament
  "1526689", // Ghana Women tour of Nigeria 2025/26
  "1526690", // Rwanda Women tour of Nigeria 2025/26
  "1526691", // Zimbabwe Women Under-19s tour of Nigeria 2025/26
  "1526692", // South Africa Women Under-19s tour of Nigeria 2025/26
  "1526726", // Ranji Trophy
  "1526833", // ICC Men's T20 World Cup Africa Sub Regional Qualifier B
  "1526835", // Malawi tour of Ghana 2025/26
  "1526836", // Tanzania tour of Ghana 2025/26
  "1526837", // Eswatini tour of Ghana 2025/26
  "1526838", // St Helena tour of Ghana 2025/26
  "1526839", // Seychelles tour of Ghana 2025/26
  "1527122", // National T20 Cup
  "1527147", // Afghanistan tour of India 2026
  "1527148", // Afghanistan in India Test Match 2026
  "1527149", // Afghanistan in India ODI Series 2026
  "1527154", // Bahrain tour of Malaysia [Mar 2026] 2025/26
  "1527155", // Bahrain in Malaysia T20I Series 2025/26
  "1527251", // India Women tour of South Africa 2026
  "1527252", // India Women in South Africa T20I Series 2026
  "1527258", // Bangladesh tour of Australia 2026
  "1527259", // Bangladesh in Australia Test Series 2026
  "1527275", // Lesotho tour of Botswana 2025/26
  "1527276", // Lesotho in Botswana T20I Series 2025/26
  "1527768", // Austria tour of Cyprus 2025/26
  "1527769", // Austria in Cyprus T20I Series 2025/26
  "1527811", // Ranji Trophy
  "1527930", // Prime Minister Cup
  "1528200", // Ranji Trophy
  "1528267", // New Zealand tour of Bangladesh 2026
  "1528268", // New Zealand in Bangladesh ODI Series 2026
  "1528269", // New Zealand in Bangladesh T20I Series 2026
  "1528270", // Sri Lanka Women tour of Bangladesh 2026
  "1528271", // Sri Lanka Women in Bangladesh ODI Series 2026
  "1528278", // Sri Lanka Women in Bangladesh T20I Series 2026
  "1528296", // Portugal T20 Tri-Series
  "1528297", // Norway tour of Portugal 2026
  "1528298", // France tour of Portugal 2026
  "1528309", // BCA Kalahari Women's T20 International Tournament
  "1528311", // Brazil Women tour of Botswana 2026
  "1528313", // Lesotho Women tour of Botswana 2026
  "1528314", // Malawi Women tour of Botswana 2026
  "1528315", // Mozambique Women tour of Botswana 2026
  "1528316", // Zambia Women tour of Botswana 2026
  "1528351", // Ranji Trophy
  "1528523", // Ireland Tri-Nation Women's T20 Series
  "1528524", // West Indies Women tour of Ireland 2026
  "1528526", // Pakistan Women tour of Ireland 2026
  "1528529", // New Zealand tour of Ireland 2026
  "1528531", // New Zealand in Ireland Test Match 2026
  "1528532", // India tour of Ireland 2026
  "1528533", // India in Ireland T20I Series 2026
  "1528534", // Afghanistan tour of Ireland 2026
  "1528535", // Afghanistan in Ireland ODI Series 2026
  "1528537", // West Indies Women in Ireland ODI Series 2026
  "1528556", // Major League Cricket
  "1528677", // England tour of Australia 2026/27
  "1528678", // England in Australia ODI Series 2026/27
  "1528679", // England in Australia T20I Series 2026/27
  "1528680", // New Zealand tour of Australia 2026/27
  "1528681", // Trans-Tasman Trophy 2026/27
  "1528683", // England tour of Australia [Mar 2027] 2026/27
  "1528684", // 150th Anniversary Test Match 2026/27
  "1528686", // Bangladesh Women tour of Australia 2026/27
  "1528687", // Bangladesh Women in Australia ODI Series 2026/27
  "1528688", // Bangladesh Women in Australia T20I Series 2026/27
  "1528690", // New Zealand Women tour of Australia 2026/27
  "1528691", // New Zealand Women in Australia T20I Series 2026/27
  "1528692", // Rose Bowl 2026/27
  "1528773", // Ranji Trophy
  "1528832", // Ranji Trophy
  "1528967", // Ranji Trophy
  "1529136", // Scotland tour of Namibia 2026
  "1529137", // Oman tour of Namibia 2026
  "1529138", // Scotland in Namibia T20I Series 2026
  "1529215", // West Indies tour of India 2026/27
  "1529216", // West Indies in India ODI Series 2026/27
  "1529218", // West Indies in India T20I Series 2026/27
  "1529220", // Sri Lanka tour of India 2026/27
  "1529221", // Sri Lanka in India ODI Series 2026/27
  "1529222", // Sri Lanka in India T20I Series 2026/27
  "1529223", // Zimbabwe tour of India 2026/27
  "1529224", // Zimbabwe in India ODI Series 2026/27
  "1529225", // Australia tour of India 2026/27
  "1529226", // Border-Gavaskar Trophy 2026/27
  "1529373", // Central American Cricket Championships
  "1529374", // Brazil tour of Mexico 2026
  "1529375", // Costa Rica tour of Mexico 2026
  "1529383", // SLC National Super League 4-Day Tournament
  "1529471", // Mirwais Nika Provincial 3-Day
  "1529483", // New Zealand A tour of Sri Lanka 2026
  "1529484", // New Zealand A in Sri Lanka unofficial ODI Series 2026
  "1529485", // New Zealand A in Sri Lanka unofficial Test Series 2026
  "1529774", // Greece Women tour of Cyprus 2026
  "1529775", // Greece Women in Cyprus T20I Series 2026
  "1529799", // Ranji Trophy
  "1529800", // Ranji Trophy
  "1530058", // India tour of Zimbabwe 2026
  "1530059", // India in Zimbabwe T20I Series 2026
  "1530201", // Australia tour of Zimbabwe 2026
  "1530202", // Australia in Zimbabwe ODI Series 2026
  "1530287", // Sweden tour of Indonesia 2026
  "1530288", // Sweden in Indonesia T20I Series 2026
  "1530873", // Ranji Trophy
  "1530878", // Ranji Trophy
  "1531142", // ICC Women's T20I Challenge Trophy
  "1531143", // Italy Women tour of Rwanda 2026
  "1531144", // Nepal Women tour of Rwanda 2026
  "1531146", // United States of America Women tour of Rwanda 2026
  "1531147", // Vanuatu Women tour of Rwanda 2026
  "1531148", // Chile Women tour of Costa Rica 2026
  "1531149", // Chile Women in Costa Rica T20I Series 2026
  "1531364", // Ranji Trophy
  "1531679", // Gibraltar tour of Malta 2026
  "1531680", // Gibraltar in Malta T20I Series 2026
  "1531686", // United Arab Emirates tour of Nepal 2026
  "1531687", // Oman tour of Nepal 2026
  "1531689", // Scotland tour of Nepal 2026
  "1531690", // United States of America tour of Nepal 2026
  "1531693", // United Arab Emirates in Nepal T20I Series 2026
  "1531708", // Ranji Trophy
  "1531952", // WICB Professional Cricket League Regional 4 Day Tournament
  "1532203", // Ranji Trophy
  "1532261", // Ranji Trophy
  "1532475", // Australia tour of Bangladesh 2026
  "1532476", // Australia in Bangladesh ODI Series 2026
  "1532477", // Australia in Bangladesh T20I Series 2026
  "1532478", // Pakistan tour of Bangladesh 2026
  "1532479", // Pakistan in Bangladesh Test Series 2026
  "1532628", // ICC Men's T20 World Cup East Asia-Pacific Qualifier
  "1532629", // Indonesia tour of Japan 2026
  "1532630", // Philippines tour of Japan 2026
  "1532631", // Fiji tour of Japan 2026
  "1532632", // Vanuatu tour of Japan 2026
  "1532633", // Cook Islands tour of Japan 2026
  "1532634", // South Korea tour of Japan 2026
  "1532635", // Samoa tour of Japan 2026
  "1532636", // Papua New Guinea tour of Japan 2026
  "1533065", // Bangladesh Cricket League
  "1533122", // Global Super League
  "1533377", // Austria tour of Germany 2026
  "1533378", // Austria in Germany T20I Series 2026
  "1533379", // Indonesia tour of Malaysia 2026
  "1533380", // Indonesia in Malaysia T20I Series 2026
  "1533381", // Isle of Man tour of Guernsey 2026
  "1533382", // Isle of Man in Guernsey T20I Series 2026
  "1533383", // Finland tour of Cyprus 2026
  "1533384", // Finland in Cyprus T20I Series 2026
  "1533629", // Ranji Trophy
  "1534022", // Zimbabwe Women tour of Pakistan 2026
  "1534023", // Zimbabwe Women in Pakistan ODI Series 2026
  "1534024", // Zimbabwe Women in Pakistan T20I Series 2026
  "1534027", // ICC Men's T20 World Cup Sub Regional Europe Qualifier Group A
  "1534028", // France tour of Cyprus 2026
  "1534029", // Guernsey tour of Cyprus 2026
  "1534030", // Sweden tour of Cyprus 2026
  "1534032", // Jersey tour of Cyprus 2026
  "1534033", // Switzerland tour of Cyprus 2026
  "1534034", // Austria tour of Cyprus 2026
  "1534035", // Malta tour of Cyprus 2026
  "1534036", // Croatia tour of Cyprus 2026
  "1534037", // Slovenia tour of Cyprus 2026
  "1534063", // Denmark Women tour of Greece 2026
  "1534064", // Denmark Women in Greece T20I Series 2026
  "1534175", // Caribbean Premier League
  "1534318", // Hong Kong Women's T20I Tri-Series
  "1534319", // China Women tour of Hong Kong 2026
  "1534320", // Malaysia Women tour of Hong Kong 2026
  "1534376", // Second Eleven Championship
  "1534377", // Second Eleven Twenty20
  "1534521", // National T20 Cup (Afghanistan)
  "1534588", // Bulgaria tour of Romania 2026
  "1534589", // Bulgaria in Romania T20I Series 2026
  "1534717", // Cricket Ireland Inter-Provincial Limited Over Cup
  "1534719", // Cricket Ireland Inter-Provincial Twenty20 Trophy
  "1534720", // Cricket Ireland Women's Super 50 Series
  "1534722", // Cricket Ireland Women's Super T20 Series 2026
  "1534991", // Dhaka Premier Division
  "1535276", // Ranji Trophy
  "1535406", // ICC Men's T20 World Cup Sub Regional Africa Qualifier Group A
  "1535407", // Cameroon tour of Botswana 2026
  "1535408", // Rwanda tour of Botswana 2026
  "1535409", // Sierra Leone tour of Botswana 2026
  "1535410", // Kenya tour of Botswana 2026
  "1535411", // Mali tour of Botswana 2026
  "1535412", // Ivory Coast tour of Botswana 2026
  "1535483", // SLC T20 League
  "1535587", // Scotland Women's T20I Tri-Series
  "1535588", // Netherlands Women tour of Scotland 2026
  "1535589", // Bangladesh Women tour of Scotland 2026
  "1535643", // Australia tour of Pakistan 2026
  "1535644", // Australia in Pakistan ODI Series 2026
  "1535648", // Zimbabwe Women tour of India 2026/27
  "1535649", // Zimbabwe Women in India T20I Series 2026/27
  "1535651", // Zimbabwe Women in India ODI Series 2026/27
  "1535659", // New Zealand A Women tour of Sri Lanka 2026
  "1535660", // New Zealand A Women in Sri Lanka unofficial ODI Series 2026
  "1535661", // New Zealand A Women in Sri Lanka unofficial T20I Series 2026
  "1535669", // Australia A tour of India 2026/27
  "1535670", // Australia A in India unofficial Test Series 2026/27
  "1535671", // Australia A in India unofficial ODI Series 2026/27
  "1535677", // Australia Under-19s tour of India 2026/27
  "1535678", // Australia Under-19s in India Youth ODI Series 2026/27
  "1535679", // Australia Under-19s in India Youth Test Series 2026/27
  "1535680", // Ranji Trophy
  "1536276", // Japan Twenty20 Tri-Series
  "1536391", // Asian Games Women's Qualifier
  "1536392", // Indonesia Women tour of Malaysia 2026
  "1536393", // Qatar Women tour of Malaysia 2026
  "1536394", // Hong Kong Women tour of Malaysia 2026
  "1536395", // Thailand Women tour of Malaysia 2026
  "1536396", // China Women tour of Malaysia 2026
  "1536398", // Nepal Women tour of Malaysia 2026
  "1536532", // Ghazi Amanullah Khan Regional One Day Tournament
  "1536549", // Emerald Challenge
  "1536581", // Asian Cricket Council Women's Premier Cup
  "1536588", // Kuwait Women tour of Malaysia 2026
  "1536589", // Saudi Arabia Women tour of Malaysia 2026
  "1536590", // United Arab Emirates Women tour of Malaysia 2026
  "1536591", // Mongolia Women tour of Malaysia 2026
  "1536592", // Japan Women tour of Malaysia 2026
  "1536595", // Bahrain Women tour of Malaysia 2026
  "1536596", // Myanmar Women tour of Malaysia 2026
  "1536599", // Oman Women tour of Malaysia 2026
  "1536602", // Singapore Women tour of Malaysia 2026
  "1536603", // Bhutan Women tour of Malaysia 2026
  "1536609", // Philippines Women tour of Malaysia 2026
  "1536970", // Indonesia Women in Malaysia T20I Series 2026
  "1537329", // Nepal Women in Malaysia T20I Series 2026
  "1537330", // Lanka Premier League
  "1537403", // Ranji Trophy
  "1537745", // Sri Lanka A-Team Tri Series (OD) 2026
  "1537746", // India A tour of Sri Lanka 2026
  "1537747", // Afghanistan A tour of Sri Lanka 2026
  "1537868", // South Africa A tour of England 2026
  "1537871", // South Africa A in England unofficial Test Series 2026
  "1537879", // South Africa A in England unofficial ODI Series 2026
  "1538207", // Eswatini T20 Tri-Series
  "1538208", // Mozambique tour of Eswatini 2026
  "1538209", // Lesotho tour of Eswatini 2026
  "1538288", // Bangladesh tour of Zimbabwe 2026
  "1538289", // Bangladesh in Zimbabwe Test Match 2026
  "1538290", // Bangladesh in Zimbabwe ODI Series 2026
  "1538291", // Bangladesh in Zimbabwe T20I Series 2026
  "1538292", // Sri Lanka tour of West Indies 2026
  "1538293", // Sri Lanka in West Indies ODI Series 2026
  "1538294", // Sri Lanka in West Indies T20I Series 2026
  "1538423", // United States of America tour of Canada 2026
  "1538424", // Netherlands tour of Canada 2026
  "1538431", // Asian Games Men's Qualifier
  "1538432", // China tour of Singapore 2026
  "1538433", // Nepal tour of Singapore 2026
  "1538434", // Malaysia tour of Singapore 2026
  "1538435", // Qatar tour of Singapore 2026
  "1538436", // Oman tour of Singapore 2026
  "1538437", // Bahrain tour of Singapore 2026
  "1538438", // Hong Kong tour of Singapore 2026
  "1538598", // ICC Women's T20 World Cup Warm-up Matches 2026
  "1538599", // Scotland Women tour of England 2026
  "1538600", // Sri Lanka Women tour of England 2026
  "1538601", // Australia Women tour of England 2026
  "1538602", // South Africa Women tour of England 2026
  "1538603", // West Indies Women tour of England 2026
  "1538604", // Bangladesh Women tour of England 2026
  "1538605", // Netherlands Women tour of England 2026
  "1538606", // Pakistan Women tour of England 2026
  "1538619", // New Zealand tour of West Indies 2026
  "1538620", // New Zealand in West Indies ODI Series 2026
  "1538621", // Pakistan tour of West Indies 2026
  "1538622", // Pakistan in West Indies Test Series 2026
  "1538632", // Kuwait Women v Myanmar Women T20I Series 2026
  "1538633", // Bahrain Women v Oman Women T20I Series 2026
  "1538708", // Ranji Trophy
  "1539229", // Ranji Trophy
  "1539421", // India tour of New Zealand 2026/27
  "1539422", // India in New Zealand T20I Series 2026/27
  "1539423", // India in New Zealand ODI Series 2026/27
  "1539424", // India in New Zealand Test Series 2026/27
  "1539425", // Sri Lanka tour of New Zealand 2026/27
  "1539426", // Sri Lanka in New Zealand ODI Series 2026/27
  "1539427", // Sri Lanka in New Zealand T20I Series 2026/27
  "1539428", // Sri Lanka in New Zealand Test Series 2026/27
  "1539455", // Viking Cup
  "1539456", // Norway tour of Sweden 2026
  "1539457", // Austria tour of Sweden 2026
  "1539458", // Finland tour of Sweden 2026
  "1539459", // Germany tour of Denmark 2026
  "1539460", // Germany in Denmark T20I Series 2026
  "1539461", // Central Europe Cup
  "1539462", // Luxembourg tour of Czech Republic 2026
  "1539463", // Serbia tour of Czech Republic 2026
  "1539482", // Kwibuka Women's Twenty20 Tournament
  "1539483", // Zimbabwe Women High Performance XI tour of Rwanda 2026
  "1539484", // Malawi Women tour of Rwanda 2026
  "1539485", // Nigeria Women tour of Rwanda 2026
  "1539486", // Brazil Women tour of Rwanda 2026
  "1539487", // Women Central Europe Cup
  "1539488", // Norway Women tour of Czech Republic 2026
  "1539489", // Luxembourg Women tour of Czech Republic 2026
  "1539518", // Bangladesh Women tour of New Zealand 2026/27
  "1539519", // Bangladesh Women in New Zealand T20I Series 2026/27
  "1539520", // Bangladesh Women in New Zealand ODI Series 2026/27
  "1539581", // Guernsey Women tour of Jersey 2026
  "1539582", // Guernsey Women in Jersey T20I Series 2026
  "1539625", // Nordic Smash T20 Cup 2026
  "1539721", // ICC World Twenty20 Americas Sub Regional Qualifier A
  "1539722", // Bahamas tour of Bermuda 2026
  "1539723", // Belize tour of Bermuda 2026
  "1539724", // Brazil tour of Bermuda 2026
  "1539725", // Panama tour of Bermuda 2026
  "1539726", // Namibia T20 Tri-Series
  "1539727", // Hong Kong tour of Namibia 2026
  "1539728", // Nigeria tour of Namibia 2026
  "1539880", // West Indies Academy tour of Sri Lanka 2026
  "1539881", // West Indies Academy in Sri Lanka unofficial Test Series 2026
  "1539882", // West Indies Academy in Sri Lanka unofficial ODI Series 2026
  "1539986", // EUT20 Belgium 2026
  "1540211", // Women's Caribbean Premier League
  "1540239", // Zimbabwe A tour of Bangladesh 2026
  "1540240", // Zimbabwe A in Bangladesh unofficial ODI Series 2026
  "1540241", // Zimbabwe A in Bangladesh unofficial Test Series 2026
  "1540302", // Continental Cup
  "1540303", // Belgium tour of Romania 2026
  "1540304", // Switzerland tour of Romania 2026
  "1540305", // Hungary tour of Romania 2026
  "1540306", // Portugal tour of Sweden 2026
  "1540307", // Portugal in Sweden T20I Series 2026
  "1540320", // Malta Women tour of Cyprus 2026
  "1540321", // Malta Women in Cyprus T20I Series 2026
  "1540535", // Jharkhand Premier League 2026
  "1540537", // Pakistan Women tour of Sri Lanka 2026
  "1540538", // Pakistan Women in Sri Lanka ODI Series 2026
  "1540539", // Pakistan Women in Sri Lanka T20I Series 2026
  "1540670", // Madhya Pradesh League T20 2026
  "1540945", // Switzerland Women tour of Denmark 2026
  "1540946", // Switzerland Women in Denmark T20I Series 2026
  "1541612", // Serbia Women tour of Bulgaria 2026
  "1541613", // Serbia Women in Bulgaria T20I Series 2026
  "1541641", // Sobers/Tissera Trophy 2026
  "1541674", // India A in Sri Lanka unofficial Test Series 2026
  "1541797", // Asia Pacific Cricket Champions Trophy
  "1541798", // Indonesia tour of Singapore 2026
  "1541799", // Thailand tour of Singapore 2026
  "1541801", // Uzbekistan tour of Singapore 2026
  "1542306", // Maharaja T20 Trophy
  "1542357", // TG20 2026
  "1542423", // India A Women tour of England 2026
  "1542424", // India A Women in England unofficial T20I Series 2026
  "1542425", // India A Women in England Unofficial ODI Series 2026
  "1542682", // Sri Lanka Women Under-19s tour of India 2026
  "1542683", // Sri Lanka Women Under-19s in India unofficial T20I Series 2026
  "1542684", // Sri Lanka Women Under-19s in India unofficial ODI Series 2026
];

export const FORMAT_META: Record<CricketLeague["format"] | "any", { label: string; color: string }> = {
  any:  { label: "All",   color: "bg-white/10 text-white" },
  t20:  { label: "T20",   color: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30" },
  odi:  { label: "ODI",   color: "bg-blue-500/15 text-blue-300 ring-blue-500/30" },
  test: { label: "Test",  color: "bg-amber-500/15 text-amber-200 ring-amber-500/30" },
  mixed:{ label: "Mixed", color: "bg-gray-500/15 text-gray-300 ring-gray-500/30" },
};

