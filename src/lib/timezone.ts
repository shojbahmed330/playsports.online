// Viewer timezone with localStorage override + lightweight subscribe API.
//
// Default is the browser's auto-detected zone (Intl). Users can lock to a
// preset (e.g. Asia/Dhaka for a Bangladesh audience) and every formatter that
// uses `fmtTime` / `fmtDate` / `fmtDateTime` immediately re-renders.

const STORAGE_KEY = "viewer_timezone_override";
const listeners = new Set<() => void>();

function browserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

let cached: string | null = null;
function load(): string {
  if (typeof window === "undefined") return browserTz();
  if (cached) return cached;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    cached = v && v.length > 0 ? v : browserTz();
  } catch {
    cached = browserTz();
  }
  return cached;
}

export function getTimezone(): string {
  return load();
}

export function isTimezoneOverridden(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(STORAGE_KEY);
  } catch { return false; }
}

export function setTimezoneOverride(tz: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (tz) window.localStorage.setItem(STORAGE_KEY, tz);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
  cached = tz ?? browserTz();
  listeners.forEach((fn) => fn());
}

export function subscribeTimezone(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function fmtTime(iso: string | number | Date | null | undefined): string {
  if (iso == null) return "";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit", timeZone: getTimezone(),
  });
}

export function fmtDateChip(iso: string | number | Date | null | undefined): {
  weekday: string; day: string; month: string;
} | null {
  if (iso == null) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const tz = getTimezone();
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short", timeZone: tz }).toUpperCase(),
    day: d.toLocaleDateString(undefined, { day: "numeric", timeZone: tz }),
    month: d.toLocaleDateString(undefined, { month: "short", timeZone: tz }).toUpperCase(),
  };
}

export function fmtDateShort(iso: string | number | Date | null | undefined): string {
  if (iso == null) return "";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", timeZone: getTimezone(),
  });
}

/** YYYY-MM-DD in the active timezone — used to bucket matches by date. */
export function dateKeyInTz(iso: string | number | Date | null | undefined): string | null {
  if (iso == null) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // en-CA gives YYYY-MM-DD reliably across browsers.
  return d.toLocaleDateString("en-CA", { timeZone: getTimezone() });
}

export const TIMEZONE_PRESETS: { tz: string; label: string; flag: string }[] = [
  { tz: "Asia/Dhaka", label: "Bangladesh (BDT)", flag: "🇧🇩" },
  { tz: "Asia/Kolkata", label: "India (IST)", flag: "🇮🇳" },
  { tz: "Asia/Karachi", label: "Pakistan (PKT)", flag: "🇵🇰" },
  { tz: "Asia/Riyadh", label: "Saudi Arabia (AST)", flag: "🇸🇦" },
  { tz: "Asia/Dubai", label: "UAE / Gulf (GST)", flag: "🇦🇪" },
  { tz: "Asia/Singapore", label: "Singapore (SGT)", flag: "🇸🇬" },
  { tz: "Asia/Tokyo", label: "Japan (JST)", flag: "🇯🇵" },
  { tz: "Australia/Sydney", label: "Sydney (AEDT)", flag: "🇦🇺" },
  { tz: "Europe/London", label: "UK (GMT/BST)", flag: "🇬🇧" },
  { tz: "Europe/Paris", label: "Central Europe (CET)", flag: "🇪🇺" },
  { tz: "Europe/Istanbul", label: "Türkiye (TRT)", flag: "🇹🇷" },
  { tz: "Africa/Lagos", label: "West Africa (WAT)", flag: "🇳🇬" },
  { tz: "Africa/Johannesburg", label: "South Africa (SAST)", flag: "🇿🇦" },
  { tz: "America/Sao_Paulo", label: "Brazil (BRT)", flag: "🇧🇷" },
  { tz: "America/Argentina/Buenos_Aires", label: "Argentina (ART)", flag: "🇦🇷" },
  { tz: "America/New_York", label: "US East (ET)", flag: "🇺🇸" },
  { tz: "America/Chicago", label: "US Central (CT)", flag: "🇺🇸" },
  { tz: "America/Denver", label: "US Mountain (MT)", flag: "🇺🇸" },
  { tz: "America/Los_Angeles", label: "US Pacific (PT)", flag: "🇺🇸" },
  { tz: "America/Mexico_City", label: "Mexico (CST)", flag: "🇲🇽" },
  { tz: "America/Toronto", label: "Toronto (ET)", flag: "🇨🇦" },
  { tz: "UTC", label: "Coordinated Universal Time", flag: "🌐" },
];
