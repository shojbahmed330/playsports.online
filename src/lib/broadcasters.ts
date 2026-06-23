// Official rightsholder map for FIFA World Cup 2026 (and current football
// broadcasts). LEGAL only — no IPTV / pirate aggregators. AdSense-safe.
//
// Each entry says where to legally watch in a given country. "free" means
// the broadcaster offers free streams (registration may be required).
// Deep-link templates use simple {placeholders} substituted at render time.

export type Broadcaster = {
  name: string;
  logo?: string;      // emoji or short label
  free: boolean;
  url: string;        // landing page, or per-match deep link template
  note?: string;      // "Requires free signup", "Highlights only", etc.
};

export type CountryBroadcasters = {
  country: string;    // ISO-3166-1 alpha-2
  region: string;     // display name
  broadcasters: Broadcaster[];
};

// Worldwide fallback — FIFA's own free channels.
const WORLDWIDE: Broadcaster[] = [
  { name: "FIFA+", logo: "⚽", free: true,
    url: "https://www.fifa.com/fifaplus/en/watch/live",
    note: "Free live in ~150 countries" },
  { name: "FIFA on YouTube", logo: "▶️", free: true,
    url: "https://www.youtube.com/@FIFA",
    note: "Live in select regions + full highlights" },
];

export const BROADCASTERS: Record<string, CountryBroadcasters> = {
  US: { country: "US", region: "United States", broadcasters: [
    { name: "FOX Sports", logo: "🦊", free: false, url: "https://www.foxsports.com/soccer/fifa-world-cup", note: "English commentary" },
    { name: "Telemundo", logo: "📺", free: false, url: "https://www.telemundodeportes.com/futbol/copa-mundial", note: "Spanish commentary" },
    { name: "Peacock", logo: "🦚", free: false, url: "https://www.peacocktv.com/sports/soccer", note: "Telemundo simulcast" },
    { name: "Tubi (free)", logo: "📺", free: true, url: "https://tubitv.com/sports", note: "Select FOX free streams" },
    ...WORLDWIDE,
  ]},
  GB: { country: "GB", region: "United Kingdom", broadcasters: [
    { name: "BBC iPlayer", logo: "🎬", free: true, url: "https://www.bbc.co.uk/iplayer/live/bbcone", note: "Free with TV licence" },
    { name: "BBC Sport", logo: "🟥", free: true, url: "https://www.bbc.co.uk/sport/football" },
    { name: "ITVX", logo: "📺", free: true, url: "https://www.itv.com/watch?ft=sport", note: "Free signup" },
    ...WORLDWIDE,
  ]},
  CA: { country: "CA", region: "Canada", broadcasters: [
    { name: "CBC Gem", logo: "🍁", free: true, url: "https://gem.cbc.ca/live-tv", note: "Free streaming" },
    { name: "TSN", logo: "🏒", free: false, url: "https://www.tsn.ca/soccer" },
    { name: "RDS (French)", logo: "🇫🇷", free: false, url: "https://www.rds.ca/soccer" },
    ...WORLDWIDE,
  ]},
  MX: { country: "MX", region: "Mexico", broadcasters: [
    { name: "TUDN", logo: "📺", free: true, url: "https://www.tudn.com/", note: "Free over-the-air" },
    { name: "Azteca Deportes", logo: "🦅", free: true, url: "https://www.aztecadeportes.com/" },
    { name: "ViX", logo: "▶️", free: true, url: "https://www.vix.com/es-es/sports", note: "Free tier" },
    ...WORLDWIDE,
  ]},
  BR: { country: "BR", region: "Brazil", broadcasters: [
    { name: "Globoplay", logo: "🌐", free: true, url: "https://globoplay.globo.com/", note: "Free with signup" },
    { name: "SporTV", logo: "📺", free: false, url: "https://sportv.globo.com/" },
    { name: "CazéTV (YouTube)", logo: "▶️", free: true, url: "https://www.youtube.com/@CazeTV", note: "Free live" },
    ...WORLDWIDE,
  ]},
  AR: { country: "AR", region: "Argentina", broadcasters: [
    { name: "TyC Sports", logo: "📺", free: true, url: "https://www.tycsports.com/" },
    { name: "TV Pública", logo: "🇦🇷", free: true, url: "https://www.tvpublica.com.ar/", note: "Free over-the-air" },
    { name: "DSports / DGo", logo: "📡", free: false, url: "https://www.directvgo.com/" },
    ...WORLDWIDE,
  ]},
  DE: { country: "DE", region: "Germany", broadcasters: [
    { name: "ARD Mediathek", logo: "🅰️", free: true, url: "https://www.sportschau.de/fussball/" },
    { name: "ZDF Mediathek", logo: "📺", free: true, url: "https://www.zdf.de/sport" },
    { name: "MagentaTV", logo: "🟪", free: false, url: "https://www.magentatv.de/" },
    ...WORLDWIDE,
  ]},
  AT: { country: "AT", region: "Austria", broadcasters: [
    { name: "ORF Sport", logo: "📺", free: true, url: "https://sport.orf.at/", note: "Free TV" },
    { name: "ServusTV On", logo: "🟢", free: true, url: "https://www.servustv.com/" },
    ...WORLDWIDE,
  ]},
  FR: { country: "FR", region: "France", broadcasters: [
    { name: "TF1+", logo: "1️⃣", free: true, url: "https://www.tf1.fr/tf1/direct" },
    { name: "M6+", logo: "6️⃣", free: true, url: "https://www.6play.fr/" },
    { name: "beIN SPORTS", logo: "📺", free: false, url: "https://www.beinsports.com/fr/" },
    ...WORLDWIDE,
  ]},
  ES: { country: "ES", region: "Spain", broadcasters: [
    { name: "RTVE Play", logo: "📺", free: true, url: "https://www.rtve.es/play/" },
    { name: "Movistar Plus+", logo: "🔵", free: false, url: "https://ver.movistarplus.es/" },
    ...WORLDWIDE,
  ]},
  IT: { country: "IT", region: "Italy", broadcasters: [
    { name: "RaiPlay", logo: "📺", free: true, url: "https://www.raiplay.it/dirette" },
    { name: "Sky Sport Italia", logo: "🟦", free: false, url: "https://sport.sky.it/" },
    ...WORLDWIDE,
  ]},
  PT: { country: "PT", region: "Portugal", broadcasters: [
    { name: "RTP Play", logo: "📺", free: true, url: "https://www.rtp.pt/play/direto/rtp1" },
    { name: "Sport TV", logo: "⚽", free: false, url: "https://sporttv.pt/" },
    ...WORLDWIDE,
  ]},
  NL: { country: "NL", region: "Netherlands", broadcasters: [
    { name: "NOS", logo: "🟠", free: true, url: "https://nos.nl/live", note: "Free public broadcaster" },
    { name: "NPO Start", logo: "📺", free: true, url: "https://npo.nl/start" },
    ...WORLDWIDE,
  ]},
  BE: { country: "BE", region: "Belgium", broadcasters: [
    { name: "VRT MAX", logo: "📺", free: true, url: "https://www.vrt.be/vrtmax/" },
    { name: "RTBF Auvio (FR)", logo: "🇧🇪", free: true, url: "https://auvio.rtbf.be/direct" },
    ...WORLDWIDE,
  ]},
  CH: { country: "CH", region: "Switzerland", broadcasters: [
    { name: "SRF (DE)", logo: "📺", free: true, url: "https://www.srf.ch/play/tv/live" },
    { name: "RTS (FR)", logo: "🇫🇷", free: true, url: "https://www.rts.ch/play/tv/direct" },
    ...WORLDWIDE,
  ]},
  AU: { country: "AU", region: "Australia", broadcasters: [
    { name: "SBS On Demand", logo: "📺", free: true, url: "https://www.sbs.com.au/ondemand/sport", note: "Free streaming" },
    { name: "Optus Sport", logo: "🟡", free: false, url: "https://sport.optus.com.au/" },
    ...WORLDWIDE,
  ]},
  NZ: { country: "NZ", region: "New Zealand", broadcasters: [
    { name: "Sky Sport Now", logo: "📺", free: false, url: "https://sport.skynz.co.nz/" },
    ...WORLDWIDE,
  ]},
  IN: { country: "IN", region: "India", broadcasters: [
    { name: "JioCinema", logo: "🎬", free: true, url: "https://www.jiocinema.com/sports", note: "Free with Jio number" },
    { name: "Sports18", logo: "📺", free: false, url: "https://www.jiocinema.com/" },
    ...WORLDWIDE,
  ]},
  BD: { country: "BD", region: "Bangladesh", broadcasters: [
    { name: "T Sports", logo: "📺", free: true, url: "https://www.tsports.com/", note: "Free OTT" },
    { name: "Bangladesh Television (BTV)", logo: "🇧🇩", free: true, url: "https://www.btv.gov.bd/", note: "Free terrestrial" },
    { name: "Toffee", logo: "🍬", free: true, url: "https://toffeelive.com/", note: "Banglalink free tier" },
    ...WORLDWIDE,
  ]},
  PK: { country: "PK", region: "Pakistan", broadcasters: [
    { name: "PTV Sports", logo: "📺", free: true, url: "https://www.ptvsports.tv/" },
    { name: "Tapmad", logo: "⚡", free: false, url: "https://www.tapmad.com/" },
    ...WORLDWIDE,
  ]},
  JP: { country: "JP", region: "Japan", broadcasters: [
    { name: "ABEMA", logo: "📺", free: true, url: "https://abema.tv/now-on-air/abema-news", note: "Free tier" },
    { name: "NHK Plus", logo: "📺", free: true, url: "https://plus.nhk.jp/" },
    ...WORLDWIDE,
  ]},
  KR: { country: "KR", region: "South Korea", broadcasters: [
    { name: "Coupang Play", logo: "📦", free: false, url: "https://www.coupangplay.com/" },
    { name: "KBS / SBS / MBC", logo: "📺", free: true, url: "https://www.kbs.co.kr/" },
    ...WORLDWIDE,
  ]},
  SA: { country: "SA", region: "Saudi Arabia", broadcasters: [
    { name: "SSC Sport", logo: "📺", free: false, url: "https://shahid.mbc.net/" },
    ...WORLDWIDE,
  ]},
  AE: { country: "AE", region: "UAE", broadcasters: [
    { name: "beIN SPORTS MENA", logo: "📺", free: false, url: "https://www.beinsports.com/" },
    ...WORLDWIDE,
  ]},
  QA: { country: "QA", region: "Qatar", broadcasters: [
    { name: "beIN SPORTS MENA", logo: "📺", free: false, url: "https://www.beinsports.com/" },
    ...WORLDWIDE,
  ]},
  ZA: { country: "ZA", region: "South Africa", broadcasters: [
    { name: "SABC Sport", logo: "📺", free: true, url: "https://www.sabcsport.com/" },
    { name: "SuperSport", logo: "⚽", free: false, url: "https://supersport.com/" },
    ...WORLDWIDE,
  ]},
  NG: { country: "NG", region: "Nigeria", broadcasters: [
    { name: "SuperSport", logo: "⚽", free: false, url: "https://supersport.com/" },
    { name: "NTA Sports", logo: "📺", free: true, url: "https://www.nta.ng/" },
    ...WORLDWIDE,
  ]},
  EG: { country: "EG", region: "Egypt", broadcasters: [
    { name: "beIN SPORTS MENA", logo: "📺", free: false, url: "https://www.beinsports.com/" },
    ...WORLDWIDE,
  ]},
};

export function broadcastersFor(country: string): CountryBroadcasters {
  const cc = country.toUpperCase();
  return BROADCASTERS[cc] ?? {
    country: cc,
    region: cc,
    broadcasters: WORLDWIDE,
  };
}

export function sortFreeFirst(list: Broadcaster[]): Broadcaster[] {
  return list.slice().sort((a, b) => Number(b.free) - Number(a.free));
}
