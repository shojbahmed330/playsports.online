/**
 * FIFA World Cup 2026 host venues — 16 cities across USA, Canada, and Mexico.
 * Capacity is FIFA-configured tournament capacity where announced; falls back
 * to standard capacity. Coordinates are approximate (city-center of stadium).
 */

export type Wc2026Venue = {
  stadium: string;
  city: string;
  country: "United States" | "Canada" | "Mexico";
  countryCode: "US" | "CA" | "MX";
  capacity: number;
  opened: number;
  surface: "Grass" | "Hybrid grass" | "Artificial (grass overlay for WC)";
  clubTenant: string;
  role: string;
  flag: string;
};

export const WC2026_VENUES: Wc2026Venue[] = [
  // United States (11)
  { stadium: "MetLife Stadium", city: "East Rutherford (New York/New Jersey)", country: "United States", countryCode: "US", capacity: 82500, opened: 2010, surface: "Grass overlay for WC", clubTenant: "New York Giants, New York Jets", role: "Final — 19 July 2026", flag: "🇺🇸" } as Wc2026Venue,
  { stadium: "SoFi Stadium", city: "Inglewood (Los Angeles)", country: "United States", countryCode: "US", capacity: 70240, opened: 2020, surface: "Grass overlay for WC", clubTenant: "Los Angeles Rams, Los Angeles Chargers", role: "Group stage & Round of 32", flag: "🇺🇸" } as Wc2026Venue,
  { stadium: "AT&T Stadium", city: "Arlington (Dallas)", country: "United States", countryCode: "US", capacity: 80000, opened: 2009, surface: "Grass overlay for WC", clubTenant: "Dallas Cowboys", role: "Semi-final host", flag: "🇺🇸" },
  { stadium: "Mercedes-Benz Stadium", city: "Atlanta", country: "United States", countryCode: "US", capacity: 71000, opened: 2017, surface: "Grass overlay for WC", clubTenant: "Atlanta Falcons, Atlanta United", role: "Semi-final host", flag: "🇺🇸" },
  { stadium: "NRG Stadium", city: "Houston", country: "United States", countryCode: "US", capacity: 72220, opened: 2002, surface: "Grass overlay for WC", clubTenant: "Houston Texans", role: "Group stage & knockouts", flag: "🇺🇸" },
  { stadium: "Arrowhead Stadium", city: "Kansas City", country: "United States", countryCode: "US", capacity: 76416, opened: 1972, surface: "Grass", clubTenant: "Kansas City Chiefs", role: "Group stage & knockouts", flag: "🇺🇸" },
  { stadium: "Hard Rock Stadium", city: "Miami Gardens (Miami)", country: "United States", countryCode: "US", capacity: 65326, opened: 1987, surface: "Grass", clubTenant: "Miami Dolphins", role: "Group stage & Third-place", flag: "🇺🇸" },
  { stadium: "Gillette Stadium", city: "Foxborough (Boston)", country: "United States", countryCode: "US", capacity: 65878, opened: 2002, surface: "Grass overlay for WC", clubTenant: "New England Patriots, New England Revolution", role: "Group stage & knockouts", flag: "🇺🇸" },
  { stadium: "Lincoln Financial Field", city: "Philadelphia", country: "United States", countryCode: "US", capacity: 69796, opened: 2003, surface: "Grass", clubTenant: "Philadelphia Eagles", role: "Group stage & Round of 32", flag: "🇺🇸" },
  { stadium: "Levi's Stadium", city: "Santa Clara (San Francisco Bay Area)", country: "United States", countryCode: "US", capacity: 68500, opened: 2014, surface: "Grass", clubTenant: "San Francisco 49ers", role: "Group stage & Round of 32", flag: "🇺🇸" },
  { stadium: "Lumen Field", city: "Seattle", country: "United States", countryCode: "US", capacity: 68740, opened: 2002, surface: "Grass overlay for WC", clubTenant: "Seattle Seahawks, Seattle Sounders", role: "Group stage & Round of 16", flag: "🇺🇸" },

  // Canada (2)
  { stadium: "BMO Field", city: "Toronto", country: "Canada", countryCode: "CA", capacity: 45500, opened: 2007, surface: "Grass", clubTenant: "Toronto FC", role: "Canada's opening match — group stage", flag: "🇨🇦" },
  { stadium: "BC Place", city: "Vancouver", country: "Canada", countryCode: "CA", capacity: 54500, opened: 1983, surface: "Grass overlay for WC", clubTenant: "Vancouver Whitecaps FC, BC Lions", role: "Group stage & Round of 32", flag: "🇨🇦" },

  // Mexico (3)
  { stadium: "Estadio Azteca (Estadio Banorte)", city: "Mexico City", country: "Mexico", countryCode: "MX", capacity: 87000, opened: 1966, surface: "Grass", clubTenant: "Club América, Cruz Azul", role: "Opening match — 11 June 2026 (3rd WC hosted)", flag: "🇲🇽" },
  { stadium: "Estadio Akron", city: "Guadalajara", country: "Mexico", countryCode: "MX", capacity: 48071, opened: 2010, surface: "Grass", clubTenant: "Chivas de Guadalajara", role: "Group stage", flag: "🇲🇽" },
  { stadium: "Estadio BBVA", city: "Monterrey", country: "Mexico", countryCode: "MX", capacity: 53500, opened: 2015, surface: "Grass", clubTenant: "Monterrey (Rayados)", role: "Group stage & Round of 32", flag: "🇲🇽" },
];

export const WC2026_HOST_STATS = {
  totalVenues: WC2026_VENUES.length,
  usa: WC2026_VENUES.filter((v) => v.countryCode === "US").length,
  canada: WC2026_VENUES.filter((v) => v.countryCode === "CA").length,
  mexico: WC2026_VENUES.filter((v) => v.countryCode === "MX").length,
  totalCapacity: WC2026_VENUES.reduce((s, v) => s + v.capacity, 0),
};
