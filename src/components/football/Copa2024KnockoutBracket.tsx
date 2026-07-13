import { Trophy, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { COPA_2024_BRACKET, type Copa2024Match } from "@/lib/copa-standings";

/** Path-to-final bracket for Copa América 2024. */
export function Copa2024KnockoutBracket() {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Copa 2024 · Path to the final
        </h2>
        <Link
          to="/football/$comp/history/$year"
          params={{ comp: "copa-america", year: "2024" }}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-300 hover:text-amber-200"
        >
          See the final <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {COPA_2024_BRACKET.map((round) => (
          <div key={round.round}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 px-1 flex items-center gap-1">
              {round.round === "F" && <Trophy className="size-3 text-amber-300" />}
              {round.label}
            </div>
            <ul className="grid gap-2">
              {round.matches.map((m, i) => (
                <li key={i}>
                  <MatchCard m={m} highlight={round.round === "F"} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchCard({ m, highlight }: { m: Copa2024Match; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-2.5 transition ${
        highlight
          ? "border-amber-400/40 bg-amber-400/[0.06]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <TeamRow flag={m.homeFlag} name={m.home} winner={m.winner === m.home} />
      <TeamRow flag={m.awayFlag} name={m.away} winner={m.winner === m.away} />
      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground text-right tabular-nums">
        {m.score}
      </div>
    </div>
  );
}

function TeamRow({ flag, name, winner }: { flag: string; name: string; winner: boolean }) {
  return (
    <div className="flex items-center gap-2 min-w-0 py-0.5">
      <span className="text-base leading-none shrink-0" aria-hidden>{flag}</span>
      <span className={`truncate text-sm ${winner ? "font-black" : "text-muted-foreground"}`}>{name}</span>
      {winner && <span className="ml-auto shrink-0 text-[9px] uppercase tracking-widest text-emerald-300 font-bold">W</span>}
    </div>
  );
}
