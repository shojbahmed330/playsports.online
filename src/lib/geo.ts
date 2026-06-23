// Best-effort viewer region detection + manual override.
// Used to surface the most relevant free broadcasters for live football.

const STORAGE_KEY = "viewer_country_override";

/** ISO-3166-1 alpha-2 uppercase ("US", "GB", "BD", …). Falls back to "US". */
export function detectCountry(): string {
  if (typeof window === "undefined") return "US";
  try {
    const override = window.localStorage.getItem(STORAGE_KEY);
    if (override) return override.toUpperCase();
  } catch { /* ignore */ }
  try {
    const lang = navigator.language || (navigator.languages?.[0] ?? "en-US");
    const m = /[-_]([A-Za-z]{2})/.exec(lang);
    if (m) return m[1].toUpperCase();
  } catch { /* ignore */ }
  return "US";
}

export function setCountryOverride(cc: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (cc) window.localStorage.setItem(STORAGE_KEY, cc.toUpperCase());
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export const COMMON_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
];
