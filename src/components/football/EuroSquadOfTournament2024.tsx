import { Link } from "@tanstack/react-router";
import { Users, ArrowRight } from "lucide-react";
import { getEdition } from "@/data/competition-editions";

/** UEFA's XI from Euro 2024 — reuses the seeded squad list. */
export function EuroSquadOfTournament2024() {
  const e = getEdition("euro", 2024);
  const squad = e?.squadOfTournament ?? [];
  if (!squad.length) return null;

  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Users className="size-4" /> UEFA Squad of Euro 2024
      </h3>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {squad.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                {p.team && (
                  <div className="text-[11px] text-muted-foreground truncate">{p.team}</div>
                )}
              </div>
              {p.position && (
                <span className="text-[10px] uppercase tracking-widest rounded-full bg-white/10 px-2 py-0.5 shrink-0">
                  {p.position}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Link
            to="/football/$comp/history/$year"
            params={{ comp: "euro", year: "2024" }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Full Euro 2024 recap <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
