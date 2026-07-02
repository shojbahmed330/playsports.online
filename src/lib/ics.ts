// Tiny .ics generator for a single match event. No external deps.

function pad(n: number) { return String(n).padStart(2, "0"); }
function toIcsDate(ms: number) {
  const d = new Date(ms);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildMatchIcs(opts: {
  id: number | string;
  title: string;
  startMs: number;
  durationMinutes?: number;
  venue?: string | null;
  city?: string | null;
  url?: string | null;
  description?: string | null;
}): string {
  const dur = (opts.durationMinutes ?? 120) * 60 * 1000;
  const dtStart = toIcsDate(opts.startMs);
  const dtEnd = toIcsDate(opts.startMs + dur);
  const dtStamp = toIcsDate(Date.now());
  const loc = [opts.venue, opts.city].filter(Boolean).join(", ");
  const uid = `wc2026-${opts.id}@allsportslive`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PlaySports//WC2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${esc(opts.title)}`,
    loc ? `LOCATION:${esc(loc)}` : "",
    opts.url ? `URL:${esc(opts.url)}` : "",
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
