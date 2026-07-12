import { CalendarDays, MapPin, Users, Trophy } from "lucide-react";

/**
 * Euro 2028 identity card — real dates, hosts, format, qualifying window.
 * Renders only on /football/euro during the 2028 cycle.
 */
export function Euro2028InfoCard() {
  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-white/[0.03] to-white/[0.02] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-200/90">
          <Trophy className="size-3.5" /> UEFA Euro 2028
        </div>
        <h3 className="mt-2 text-2xl sm:text-3xl font-black">
          UK & Ireland host Europe&apos;s championship
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          The 18th edition of the UEFA European Championship, co-hosted across
          England, Scotland, Wales, Northern Ireland and the Republic of Ireland.
          24 teams, 10 host stadiums, 51 matches across a month of football.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={<CalendarDays className="size-4 text-blue-200" />} label="Dates" value="9 Jun – 9 Jul 2028" />
          <Fact icon={<MapPin className="size-4 text-blue-200" />} label="Hosts" value="UK + Ireland (5 nations)" />
          <Fact icon={<Users className="size-4 text-blue-200" />} label="Format" value="24 teams · 6 groups + KO" />
          <Fact icon={<CalendarDays className="size-4 text-blue-200" />} label="Qualifying" value="Draw Dec 2026 · Games Mar 2027" />
        </div>
      </div>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}
