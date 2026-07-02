import classicVideos from "@/data/wc_video_seed.json";

type ClassicVideo = {
  year: number;
  teams: [string, string] | string[];
  url: string;
  title?: string;
};

function teamKey(team: string): string {
  const key = team
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const aliases: Record<string, string> = {
    usa: "united states",
    us: "united states",
    "u s a": "united states",
    "united states of america": "united states",
    korea: "south korea",
    "korea republic": "south korea",
    "republic of korea": "south korea",
    "cote d ivoire": "ivory coast",
    "cote divoire": "ivory coast",
    turkiye: "turkey",
  };
  return aliases[key] ?? key;
}

export function wcVideoPairKey(home: string, away: string): string {
  return [teamKey(home), teamKey(away)].sort().join("|");
}

const byYearAndPair = new Map<string, string>();
for (const item of classicVideos as ClassicVideo[]) {
  const [a, b] = item.teams;
  if (!item.year || !a || !b || !item.url) continue;
  byYearAndPair.set(`${item.year}:${wcVideoPairKey(a, b)}`, item.url);
}

export function findClassicWcVideoUrl(year: number, home: string, away: string): string | null {
  return byYearAndPair.get(`${year}:${wcVideoPairKey(home, away)}`) ?? null;
}