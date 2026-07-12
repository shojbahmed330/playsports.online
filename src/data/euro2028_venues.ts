/**
 * UEFA Euro 2028 host venues (UK + Ireland co-hosted).
 * Capacity is Euros-configured capacity where available; falls back to
 * standard capacity. Cities listed as UEFA-branded.
 */

export type Euro2028Venue = {
  stadium: string;
  city: string;
  country: "England" | "Scotland" | "Wales" | "Northern Ireland" | "Republic of Ireland";
  capacity: number;
  flag: string; // emoji
};

export const EURO_2028_VENUES: Euro2028Venue[] = [
  { stadium: "Wembley Stadium", city: "London", country: "England", capacity: 90000, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { stadium: "Tottenham Hotspur Stadium", city: "London", country: "England", capacity: 62850, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { stadium: "Etihad Stadium", city: "Manchester", country: "England", capacity: 61000, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { stadium: "Everton Stadium", city: "Liverpool", country: "England", capacity: 52888, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { stadium: "St James' Park", city: "Newcastle", country: "England", capacity: 52305, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { stadium: "Villa Park", city: "Birmingham", country: "England", capacity: 52190, flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { stadium: "Principality Stadium", city: "Cardiff", country: "Wales", capacity: 73952, flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { stadium: "Hampden Park", city: "Glasgow", country: "Scotland", capacity: 51866, flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { stadium: "Casement Park", city: "Belfast", country: "Northern Ireland", capacity: 34500, flag: "🇬🇧" },
  { stadium: "Aviva Stadium", city: "Dublin", country: "Republic of Ireland", capacity: 51711, flag: "🇮🇪" },
];
