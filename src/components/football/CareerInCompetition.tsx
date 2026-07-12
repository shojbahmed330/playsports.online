import { Link } from "@tanstack/react-router";
import type { Competition } from "@/lib/competitions";
import { formatSeasonLabel } from "@/lib/competitions";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";
import { Trophy } from "lucide-react";

type Mention = {
  year: number;
  role: string;
  detail?: string;
};

function findMentions(compSlug: string, name: string): Mention[] {
  const editions = COMPETITION_EDITIONS[compSlug] ?? [];
  const nameLower = name.toLowerCase().trim();
  if (!nameLower) return [];
  const partial = (v: string | undefined) => (v ?? "").toLowerCase().includes(nameLower);
  const out: Mention[] = [];
  for (const e of editions) {
    const hits: Mention[] = [];
    if (partial(e.topScorer?.name)) {
      hits.push({ year: e.year, role: "Top scorer", detail: e.topScorer ? `${e.topScorer.goals} goals` : undefined });
    }
    if (partial(e.bestPlayer?.name)) {
      hits.push({ year: e.year, role: e.bestPlayer?.award ?? "Best Player", detail: e.bestPlayer?.team });
    }
    if (partial(e.bestKeeper?.name)) {
      hits.push({ year: e.year, role: e.bestKeeper?.award ?? "Best Goalkeeper", detail: e.bestKeeper?.team });
    }
    if (partial(e.youngPlayer?.name)) {
      hits.push({ year: e.year, role: e.youngPlayer?.award ?? "Young Player", detail: e.youngPlayer?.team });
    }
    if (partial(e.winningCaptain)) {
      hits.push({ year: e.year, role: "Winning captain", detail: e.winner });
    }
    if (partial(e.winningCoach)) {
      hits.push({ year: e.year, role: "Winning coach", detail: e.winner });
    }
    for (const s of e.squadOfTournament ?? []) {
      if (partial(s.name)) {
        hits.push({ year: e.year, role: "Squad of the Tournament", detail: s.team ?? s.position });
      }
    }
    out.push(...hits);
  }
  return out.sort((a, b) => b.year - a.year);
}

/**
 * Career-in-competition strip. Scans the historical seed for any edition
 * where the player is credited (top scorer, best player, squad-of-tournament,
 * winning captain/coach, etc.) and links out to that edition.
 */
export function CareerInCompetition({
  comp,
  playerName,
}: {
  comp: Competition;
  playerName: string;
}) {
  const mentions = findMentions(comp.slug, playerName);
  if (mentions.length === 0) return null;

  return (
    <section className="mt-2 mb-6">
      <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
        <Trophy className="size-3.5" /> Career in {comp.shortName}
      </h2>
      <ul className="grid gap-2">
        {mentions.map((m, i) => (
          <li key={`${m.year}-${i}`}>
            <Link
              to="/football/$comp/history/$year"
              params={{ comp: comp.slug, year: String(m.year) }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] px-3 py-2"
            >
              <span className="tabular-nums font-bold text-sm w-16">
                {formatSeasonLabel(comp, m.year)}
              </span>
              <span className="text-sm flex-1">{m.role}</span>
              {m.detail && (
                <span className="text-xs text-muted-foreground">{m.detail}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
