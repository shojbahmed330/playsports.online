// Static team directory used by the cross-sport FavoriteTeamPicker.
// Names must match how the data sources spell them so starred filtering works:
//   - Football → matches Wc2026Fixture.home.name (ESPN world.fifa.worldcup)
//   - Cricket  → ICC nation names (matches rankings.json)
//   - NBA/NHL/MLB/MLS → matches ESPN scoreboard team.displayName
import type { Sport } from "@/lib/starred";

export type DirectoryTeam = { name: string; flag?: string; abbr?: string };

// FIFA World Cup 2026 — 48 confirmed teams (as of qualification cutoff)
// plus every historical WC champion so classic-era stars still work.
const FOOTBALL: DirectoryTeam[] = [
  // Confirmed 2026 hosts + qualified
  "Argentina","Australia","Belgium","Brazil","Canada","Chile","Colombia","Costa Rica",
  "Croatia","Denmark","Ecuador","Egypt","England","France","Germany","Ghana","Iran",
  "Italy","Ivory Coast","Japan","Mexico","Morocco","Netherlands","New Zealand","Nigeria",
  "Norway","Paraguay","Peru","Poland","Portugal","Qatar","Saudi Arabia","Scotland","Senegal",
  "Serbia","South Africa","South Korea","Spain","Sweden","Switzerland","Tunisia","Turkey",
  "United States","Uruguay","Wales","Cape Verde","DR Congo","Bosnia and Herzegovina",
  "Austria","Cameroon",
  // Historic champions retained for classic archive matches
  "Uruguay","West Germany","Czechoslovakia","Hungary",
].map((n) => ({ name: n }));

// ICC full members + top associates
const CRICKET: DirectoryTeam[] = [
  { name: "India",        flag: "🇮🇳", abbr: "IND" },
  { name: "Australia",    flag: "🇦🇺", abbr: "AUS" },
  { name: "England",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", abbr: "ENG" },
  { name: "Pakistan",     flag: "🇵🇰", abbr: "PAK" },
  { name: "South Africa", flag: "🇿🇦", abbr: "RSA" },
  { name: "New Zealand",  flag: "🇳🇿", abbr: "NZL" },
  { name: "Sri Lanka",    flag: "🇱🇰", abbr: "SRL" },
  { name: "Bangladesh",   flag: "🇧🇩", abbr: "BAN" },
  { name: "West Indies",  flag: "🌴", abbr: "WIN" },
  { name: "Afghanistan",  flag: "🇦🇫", abbr: "AFG" },
  { name: "Zimbabwe",     flag: "🇿🇼", abbr: "ZIM" },
  { name: "Ireland",      flag: "🇮🇪", abbr: "IRE" },
  { name: "Netherlands",  flag: "🇳🇱", abbr: "NED" },
  { name: "Scotland",     flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", abbr: "SCO" },
  { name: "Namibia",      flag: "🇳🇦", abbr: "NAM" },
  { name: "Nepal",        flag: "🇳🇵", abbr: "NEP" },
  { name: "UAE",          flag: "🇦🇪", abbr: "UAE" },
  { name: "USA",          flag: "🇺🇸", abbr: "USA" },
];

// NBA — 30 clubs (ESPN displayName)
const NBA: DirectoryTeam[] = [
  "Atlanta Hawks","Boston Celtics","Brooklyn Nets","Charlotte Hornets","Chicago Bulls",
  "Cleveland Cavaliers","Dallas Mavericks","Denver Nuggets","Detroit Pistons",
  "Golden State Warriors","Houston Rockets","Indiana Pacers","LA Clippers",
  "Los Angeles Lakers","Memphis Grizzlies","Miami Heat","Milwaukee Bucks",
  "Minnesota Timberwolves","New Orleans Pelicans","New York Knicks","Oklahoma City Thunder",
  "Orlando Magic","Philadelphia 76ers","Phoenix Suns","Portland Trail Blazers",
  "Sacramento Kings","San Antonio Spurs","Toronto Raptors","Utah Jazz","Washington Wizards",
].map((n) => ({ name: n }));

// NHL — 32 clubs
const NHL: DirectoryTeam[] = [
  "Anaheim Ducks","Arizona Coyotes","Boston Bruins","Buffalo Sabres","Calgary Flames",
  "Carolina Hurricanes","Chicago Blackhawks","Colorado Avalanche","Columbus Blue Jackets",
  "Dallas Stars","Detroit Red Wings","Edmonton Oilers","Florida Panthers","Los Angeles Kings",
  "Minnesota Wild","Montreal Canadiens","Nashville Predators","New Jersey Devils",
  "New York Islanders","New York Rangers","Ottawa Senators","Philadelphia Flyers",
  "Pittsburgh Penguins","San Jose Sharks","Seattle Kraken","St. Louis Blues",
  "Tampa Bay Lightning","Toronto Maple Leafs","Utah Hockey Club","Vancouver Canucks",
  "Vegas Golden Knights","Washington Capitals","Winnipeg Jets",
].map((n) => ({ name: n }));

// MLB — 30 clubs
const MLB: DirectoryTeam[] = [
  "Arizona Diamondbacks","Atlanta Braves","Baltimore Orioles","Boston Red Sox","Chicago Cubs",
  "Chicago White Sox","Cincinnati Reds","Cleveland Guardians","Colorado Rockies","Detroit Tigers",
  "Houston Astros","Kansas City Royals","Los Angeles Angels","Los Angeles Dodgers","Miami Marlins",
  "Milwaukee Brewers","Minnesota Twins","New York Mets","New York Yankees","Oakland Athletics",
  "Philadelphia Phillies","Pittsburgh Pirates","San Diego Padres","San Francisco Giants",
  "Seattle Mariners","St. Louis Cardinals","Tampa Bay Rays","Texas Rangers","Toronto Blue Jays",
  "Washington Nationals",
].map((n) => ({ name: n }));

// MLS — 29 clubs
const MLS: DirectoryTeam[] = [
  "Atlanta United FC","Austin FC","CF Montréal","Charlotte FC","Chicago Fire FC",
  "Colorado Rapids","Columbus Crew","D.C. United","FC Cincinnati","FC Dallas",
  "Houston Dynamo FC","Inter Miami CF","LA Galaxy","Los Angeles FC","Minnesota United FC",
  "Nashville SC","New England Revolution","New York City FC","New York Red Bulls",
  "Orlando City SC","Philadelphia Union","Portland Timbers","Real Salt Lake",
  "San Jose Earthquakes","Seattle Sounders FC","Sporting Kansas City","St. Louis City SC",
  "Toronto FC","Vancouver Whitecaps FC",
].map((n) => ({ name: n }));

export const TEAM_DIRECTORY: Record<Sport, DirectoryTeam[]> = {
  football: FOOTBALL,
  cricket:  CRICKET,
  nba:      NBA,
  nhl:      NHL,
  mlb:      MLB,
  mls:      MLS,
};

export const SPORT_META: Record<Sport, { label: string; emoji: string; hub: string; tone: string }> = {
  football: { label: "Football", emoji: "⚽", hub: "/football", tone: "text-emerald-300" },
  cricket:  { label: "Cricket",  emoji: "🏏", hub: "/cricket",  tone: "text-amber-300"   },
  nba:      { label: "NBA",      emoji: "🏀", hub: "/nba",      tone: "text-orange-300"  },
  nhl:      { label: "NHL",      emoji: "🏒", hub: "/nhl",      tone: "text-cyan-300"    },
  mlb:      { label: "MLB",      emoji: "⚾", hub: "/mlb",      tone: "text-sky-300"     },
  mls:      { label: "MLS",      emoji: "⚽", hub: "/mls",      tone: "text-purple-300"  },
};
