/**
 * Canonical team lists per competition. Used as the fallback for the H2H picker
 * (and anywhere else we need a scoped team list) whenever the ESPN feed is
 * off-season or returns fewer teams than expected.
 *
 * Names match ESPN's `displayName` where possible so name→id resolution keeps
 * working on the H2H server function.
 */

export const COMPETITION_TEAMS_SEED: Record<string, readonly string[]> = {
  "world-cup": [
    "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
    "Colombia", "Croatia", "Czech Republic", "Denmark", "Ecuador", "Egypt", "England",
    "France", "Germany", "Ghana", "Greece", "Iran", "Italy", "Ivory Coast", "Japan",
    "Mexico", "Morocco", "Netherlands", "Nigeria", "Norway", "Peru", "Poland",
    "Portugal", "Qatar", "Russia", "Saudi Arabia", "Scotland", "Senegal", "Serbia",
    "Slovakia", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
    "Tunisia", "Turkey", "United States", "Uruguay", "Uzbekistan", "Wales",
  ],
  euro: [
    "Albania", "Austria", "Belgium", "Bosnia and Herzegovina", "Bulgaria",
    "Croatia", "Czech Republic", "Denmark", "England", "Finland", "France",
    "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy",
    "Netherlands", "North Macedonia", "Northern Ireland", "Norway", "Poland",
    "Portugal", "Romania", "Russia", "Scotland", "Serbia", "Slovakia", "Slovenia",
    "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine", "Wales",
  ],
  "copa-america": [
    "Argentina", "Bolivia", "Brazil", "Canada", "Chile", "Colombia", "Costa Rica",
    "Ecuador", "Jamaica", "Mexico", "Panama", "Paraguay", "Peru", "United States",
    "Uruguay", "Venezuela",
  ],
  laliga: [
    "Alavés", "Athletic Club", "Atlético Madrid", "Barcelona", "Celta Vigo",
    "Elche", "Espanyol", "Getafe", "Girona", "Levante", "Mallorca", "Osasuna",
    "Rayo Vallecano", "Real Betis", "Real Madrid", "Real Oviedo", "Real Sociedad",
    "Sevilla", "Valencia", "Villarreal",
  ],
};

export function seedTeamsFor(compSlug: string): readonly string[] {
  return COMPETITION_TEAMS_SEED[compSlug] ?? [];
}
