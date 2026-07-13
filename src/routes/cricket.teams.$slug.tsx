// Phase 2.1 (cricket) — SSR-friendly team profile.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import {
  breadcrumbList,
  faqPage,
  ldScript,
  sportsTeam,
} from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import {
  getCricketTeamBySlug,
  listCricketTeams,
} from "@/lib/seo/cricket-entities";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";

export const Route = createFileRoute("/cricket/teams/$slug")({
  loader: async ({ params }) => {
    const team = getCricketTeamBySlug(params.slug);
    if (!team) throw notFound();
    const aiFaqs = await readCachedFaqs("cricket_team", params.slug);
    return { team, aiFaqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Team not found — Cricket" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { team } = loaderData;
    const url = canonical(`/cricket/teams/${params.slug}`);
    const title = team.isFranchise
      ? `${team.name} — IPL squad, captains, titles & home ground`
      : `${team.name} Cricket — ICC rankings, squad & recent form`;
    const desc = team.isFranchise && team.franchise
      ? `${team.name}: ${team.franchise.titles} IPL title${team.franchise.titles === 1 ? "" : "s"}, captained by ${team.franchise.captain}, home ground ${team.franchise.homeGround}.`
      : `${team.name} — current ICC rankings across T20I, ODI and Test formats plus recent form.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          sportsTeam({
            name: team.name,
            path: `/cricket/teams/${params.slug}`,
            sport: "Cricket",
            league: team.isFranchise ? "Indian Premier League" : "ICC",
            logo: team.logo,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Teams", path: "/cricket/teams" },
            { name: team.name, path: `/cricket/teams/${params.slug}` },
          ]),
        ),
        ldScript(faqPage(loaderData.aiFaqs && loaderData.aiFaqs.length ? loaderData.aiFaqs : loaderData.team.faqs)),
      ],
    };
  },
  component: CricketTeamProfile,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <p className="text-lg font-semibold">Couldn't load team</p>
      <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Team not found</p>
        <Link to="/cricket/teams" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">
          ← Browse all cricket teams
        </Link>
      </div>
    </div>
  ),
});

function CricketTeamProfile() {
  const { team, aiFaqs } = Route.useLoaderData() as { team: import("@/lib/seo/cricket-entities").CricketTeamEntity; aiFaqs: Array<{ q: string; a: string }> | null };
  const related = listCricketTeams()
    .filter((t) => t.slug !== team.slug && t.isFranchise === team.isFranchise)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">Cricket</Link>
          <span className="mx-1">/</span>
          <Link to="/cricket/teams" className="hover:underline">Teams</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{team.name}</span>
        </nav>

        <header className="flex items-center gap-4 mb-8">
          {team.logo ? (
            <img src={team.logo} alt="" className="w-16 h-16 rounded-lg" loading="eager" / decoding="async">
          ) : team.flag ? (
            <span className="text-5xl" aria-hidden>{team.flag}</span>
          ) : null}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {team.isFranchise ? "IPL franchise" : "International cricket team"}
              {team.code ? ` · ${team.code}` : ""}
            </p>
          </div>
        </header>

        {team.isFranchise && team.franchise ? (
          <section className="grid sm:grid-cols-2 gap-4 mb-10">
            <Info label="Home ground" value={team.franchise.homeGround} />
            <Info label="City" value={team.franchise.city} />
            <Info label="Captain" value={team.franchise.captain} />
            <Info label="Head coach" value={team.franchise.headCoach} />
            <Info label="Founded" value={String(team.franchise.founded)} />
            <Info
              label={`IPL titles (${team.franchise.titles})`}
              value={team.franchise.titleYears.join(", ") || "—"}
            />
          </section>
        ) : team.formats.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">ICC rankings</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {team.formats
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((f) => (
                  <div key={f.format} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{f.format}</p>
                    <p className="text-2xl font-bold mt-1">#{f.rank}</p>
                    <p className="text-xs text-muted-foreground mt-1">Rating {f.rating}</p>
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        <FaqSection
          title="Frequently asked"
          items={aiFaqs && aiFaqs.length ? aiFaqs : team.faqs}
        />

        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              Related {team.isFranchise ? "IPL franchises" : "cricket teams"}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/cricket/teams/$slug"
                    params={{ slug: r.slug }}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    {r.flag ?? ""} {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-medium mt-1">{value}</p>
    </div>
  );
}
