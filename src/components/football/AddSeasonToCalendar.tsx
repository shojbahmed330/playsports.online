import { CalendarPlus } from "lucide-react";
import { downloadIcs } from "@/lib/ics";

type Milestone = {
  id: string;
  title: string;
  startIso: string;
  durationMinutes: number;
  location?: string;
  description?: string;
};

const EURO_2028_SEASON: Milestone[] = [
  {
    id: "euro2028-quals-start",
    title: "UEFA Euro 2028 qualifying begins",
    startIso: "2027-03-24T19:00:00Z",
    durationMinutes: 120,
    description: "Euro 2028 qualifying campaign gets under way.",
  },
  {
    id: "euro2028-playoffs",
    title: "UEFA Euro 2028 play-offs",
    startIso: "2028-03-23T19:00:00Z",
    durationMinutes: 120,
    description: "Final qualifying play-off matches to complete the 24-team field.",
  },
  {
    id: "euro2028-opener",
    title: "UEFA Euro 2028 · Opening match",
    startIso: "2028-06-09T19:00:00Z",
    durationMinutes: 150,
    location: "Principality Stadium, Cardiff",
    description: "Opening match of UEFA Euro 2028 — hosted across the UK and Ireland.",
  },
  {
    id: "euro2028-final",
    title: "UEFA Euro 2028 · Final",
    startIso: "2028-07-09T19:00:00Z",
    durationMinutes: 180,
    location: "Wembley Stadium, London",
    description: "The Euro 2028 Final at Wembley.",
  },
];

/** Download button that builds a multi-event ICS for the Euro 2028 season. */
export function AddSeasonToCalendar() {
  const onClick = () => {
    const dt = (ms: number) => {
      const d = new Date(ms);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };
    const esc = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

    const events = EURO_2028_SEASON.map((m) => {
      const start = new Date(m.startIso).getTime();
      const end = start + m.durationMinutes * 60_000;
      return [
        "BEGIN:VEVENT",
        `UID:${m.id}@playsports.online`,
        `DTSTAMP:${dt(Date.now())}`,
        `DTSTART:${dt(start)}`,
        `DTEND:${dt(end)}`,
        `SUMMARY:${esc(m.title)}`,
        m.location ? `LOCATION:${esc(m.location)}` : "",
        m.description ? `DESCRIPTION:${esc(m.description)}` : "",
        "URL:https://www.playsports.online/football/euro/fixtures",
        "END:VEVENT",
      ].filter(Boolean).join("\r\n");
    }).join("\r\n");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PlaySports//Euro2028//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      events,
      "END:VCALENDAR",
    ].join("\r\n");

    downloadIcs("euro-2028-season", ics);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20 active:scale-95 transition text-xs font-bold px-3.5 py-2 min-h-[44px]"
    >
      <CalendarPlus className="size-3.5" />
      Add Euro 2028 to calendar
    </button>
  );
}
