import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Goal, Trophy, Users, Award } from "lucide-react";

const CATEGORIES = [
  { slug: "top-scorers-all-time", label: "Top Scorers (All-Time)", icon: Goal, blurb: "Career goals across every edition." },
  { slug: "most-titles", label: "Most Titles", icon: Trophy, blurb: "Nations & clubs ranked by trophies won." },
  { slug: "most-appearances", label: "Most Appearances", icon: Users, blurb: "Players with the most matches played." },
  { slug: "records-and-firsts", label: "Records & Firsts", icon: Award, blurb: "Youngest scorer, biggest win, longest streaks." },
];

export const Route = createFileRoute("/football/$comp/records")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Records" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Records",
      path: `/football/${comp.slug}/records`,
      descriptionOverride: `${comp.name} all-time records — top scorers, most titles, longest streaks and every historical first.`,
    });
  },
  component: RecordsPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function RecordsPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} Records</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Every stat scoped to {comp.shortName} only — no cross-competition mixing.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <li key={cat.slug}>
              <Link
                to="/football/records/$category"
                params={{ category: cat.slug }}
                search={{ comp: comp.slug }}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 size-9 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10">
                    <Icon className="size-4 text-foreground" />
                  </span>
                  <div>
                    <div className="font-semibold group-hover:text-foreground">{cat.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.blurb}</div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </CompetitionPageShell>
  );
}
