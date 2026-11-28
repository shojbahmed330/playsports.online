import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { CricketInningsDetail } from "@/lib/cricket.functions";
import { cricketPlayerSlug } from "@/lib/cricket-player-slug";

export function InningsCard({
  inn,
  accentColor,
}: {
  inn: CricketInningsDetail;
  accentColor?: string | null;
}) {
  const PlayerLinkName = ({
    name,
    athleteId,
    children,
  }: {
    name: string;
    athleteId?: string;
    children?: ReactNode;
  }) => {
    const slug = cricketPlayerSlug(name);
    if (!slug)
      return (
        <span className="truncate">
          {name}
          {children}
        </span>
      );
    return (
      <Link
        to="/cricket/players/$slug"
        params={{ slug }}
        search={{ athlete: athleteId || undefined }}
        className="inline-flex min-h-11 max-w-full items-center truncate py-1 text-left underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {name}
        {children}
      </Link>
    );
  };

  const headerStyle = accentColor
    ? { background: `linear-gradient(90deg, ${accentColor}30, transparent 70%)` }
    : undefined;

  return (
    <section className="rounded-2xl border border-border overflow-hidden">
      <header
        className="sticky top-[80px] z-10 flex items-center justify-between gap-2 px-4 py-3 bg-background backdrop-blur border-b border-border"
        style={headerStyle}
      >
        <h3 className="text-sm font-bold truncate">
          {inn.battingTeamName}{" "}
          <span className="text-muted-foreground font-normal">— Innings {inn.period}</span>
        </h3>
        <span className="text-base font-extrabold tabular-nums shrink-0">
          {inn.runs}
          <span className="text-muted-foreground font-bold">/{inn.wickets}</span>
          {inn.overs > 0 && (
            <span className="text-xs text-muted-foreground font-normal ml-2 tabular-nums">
              ({inn.overs} ov)
            </span>
          )}
        </span>
      </header>

      {inn.batters.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-wider text-foreground">
              <tr>
                <th className="text-left px-3 py-2">Batter</th>
                <th className="text-right px-3 py-2">R</th>
                <th className="text-right px-3 py-2">B</th>
                <th className="text-right px-3 py-2 hidden xs:table-cell">4s</th>
                <th className="text-right px-3 py-2 hidden xs:table-cell">6s</th>
                <th className="text-right px-3 py-2">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inn.batters.map((b) => (
                <tr key={b.id || b.name} className="hover:bg-background align-top">
                  <td className="px-3 py-2 font-medium">
                    <div className="min-w-0">
                      <PlayerLinkName name={b.name} athleteId={b.id}>
                        {b.notOut && <span className="ml-1 text-positive">*</span>}
                      </PlayerLinkName>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {b.dismissal || (b.notOut ? "not out" : "—")}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold whitespace-nowrap">
                    {b.runs}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{b.balls}</td>
                  <td className="px-3 py-2 text-right tabular-nums hidden xs:table-cell whitespace-nowrap">
                    {b.fours}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums hidden xs:table-cell whitespace-nowrap">
                    {b.sixes}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground whitespace-nowrap">
                    {b.strikeRate || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inn.extras != null && inn.extras > 0 && (
        <div className="px-4 py-2 text-[11px] text-foreground border-t border-border bg-background">
          <span className="font-semibold text-foreground">Extras</span> {inn.extras}
        </div>
      )}

      {inn.fallOfWickets.length > 0 && (
        <div className="px-4 py-3 text-[11px] text-foreground border-t border-border bg-background">
          <div className="font-semibold text-foreground mb-1">Fall of wickets</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 tabular-nums">
            {inn.fallOfWickets.map((f) => (
              <span key={`${f.wicket}-${f.player}`} className="whitespace-nowrap">
                {f.score}/{f.wicket}{" "}
                <span className="text-muted-foreground">
                  ({f.player}
                  {f.over != null ? `, ${f.over}` : ""})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {inn.bowlers.length > 0 && (
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-wider text-foreground">
              <tr>
                <th className="text-left px-3 py-2">Bowler</th>
                <th className="text-right px-3 py-2">O</th>
                <th className="text-right px-3 py-2 hidden xs:table-cell">M</th>
                <th className="text-right px-3 py-2">R</th>
                <th className="text-right px-3 py-2">W</th>
                <th className="text-right px-3 py-2">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inn.bowlers.map((b) => (
                <tr key={b.id || b.name} className="hover:bg-background">
                  <td className="px-3 py-2 font-medium">
                    <PlayerLinkName name={b.name} athleteId={b.id} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{b.overs}</td>
                  <td className="px-3 py-2 text-right tabular-nums hidden xs:table-cell whitespace-nowrap">
                    {b.maidens}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{b.runs}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-[var(--color-accent-cricket)] whitespace-nowrap">
                    {b.wickets}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground whitespace-nowrap">
                    {b.economy || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
