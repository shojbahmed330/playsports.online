// Phase 2.1 (cricket) — SSR-friendly player profile.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@/lib/zod-validator";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { getCricketPlayerBySlug, listCricketPlayers } from "@/lib/seo/cricket-entities";
import { fetchCricketPlayer, findCricketAthleteByName } from "@/lib/cricket.functions";
import { cricketPlayerAliasId, cricketPlayerNameFromSlug } from "@/lib/cricket-player-slug";
import { LivePlayerProfile } from "@/components/cricket/LivePlayerProfile";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForCricketPlayer } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";

export const Route = createFileRoute("/cricket/players/$slug")({
  validateSearch: zodValidator(z.object({ athlete: z.string().optional() })),
  loaderDeps: ({ search }) => ({ athlete: search.athlete }),
  loader: async ({ params, deps }) => {
    const player = getCricketPlayerBySlug(params.slug);
    if (player) {
      const aiFaqs = await readCachedFaqs("cricket_player", params.slug);
      return { kind: "static" as const, player, aiFaqs };
    }

    // Current players are not in the historical registry. Prefer the athlete
    // id carried by scorecard links; fall back to a name search. Clean URLs
    // are canonical only when they actually resolve.
    const name = cricketPlayerNameFromSlug(params.slug);
    const aliasId = cricketPlayerAliasId(params.slug);
    let lastError: string | null = null;

    const resolveDirect = async (id: string, canonicalClean: boolean) => {
      const res = await fetchCricketPlayer(id, { awaitCareer: false });
      if (res.profile) {
        return {
          kind: "live" as const,
          profile: res.profile,
          slug: params.slug,
          athleteId: id,
          canonicalClean,
        };
      }
      lastError = res.error ?? lastError;
      return null;
    };

    if (aliasId) {
      const hit = await resolveDirect(aliasId, true);
      if (hit) return hit;
    }

    if (deps.athlete) {
      const [direct, searched] = await Promise.all([
        fetchCricketPlayer(deps.athlete, { awaitCareer: false }),
        name ? findCricketAthleteByName(name) : Promise.resolve(null),
      ]);
      if (direct.profile) {
        return {
          kind: "live" as const,
          profile: direct.profile,
          slug: params.slug,
          athleteId: deps.athlete,
          canonicalClean: searched === deps.athlete,
        };
      }
      lastError = direct.error ?? lastError;
      if (searched && searched !== deps.athlete) {
        const hit = await resolveDirect(searched, true);
        if (hit) return hit;
      }
      if (direct.error && !direct.error.includes("404")) {
        throw new Error(direct.error);
      }
    }

    if (!name) throw notFound();
    const athleteId = await findCricketAthleteByName(name);
    if (!athleteId) {
      if (lastError && !lastError.includes("404")) throw new Error(lastError);
      throw notFound();
    }
    const res = await fetchCricketPlayer(athleteId, { awaitCareer: false });
    if (!res.profile) {
      // A transient ESPN failure is not a missing player: surface a retryable
      // error instead of telling search engines the profile does not exist.
      if (res.error && !res.error.includes("404") && lastError !== "ESPN 404") {
        throw new Error(res.error || lastError || "Player data unavailable");
      }
      throw notFound();
    }
    return {
      kind: "live" as const,
      profile: res.profile,
      slug: params.slug,
      athleteId,
      canonicalClean: true,
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Player not found — Cricket" }, { name: "robots", content: "noindex" }],
      };
    }
    const live = loaderData.kind === "live";
    const name = live ? loaderData.profile.name : loaderData.player.name;
    const country = live
      ? (loaderData.profile.country ?? loaderData.profile.team)
      : loaderData.player.country;
    const cleanPath = `/cricket/players/${params.slug}`;
    const profilePath =
      loaderData.kind === "live" && !loaderData.canonicalClean
        ? `${cleanPath}?athlete=${loaderData.athleteId}`
        : cleanPath;
    const url = canonical(profilePath);
    const image = "https://www.playsports.online/og-default.png";
    const title = `${name} — cricket profile, stats & career`;
    const summary = !live
      ? loaderData.player.records
          .slice(0, 2)
          .map((r) => `${r.category} (${r.value})`)
          .join("; ")
      : "";
    const desc = live
      ? `${name}${country ? ` (${country})` : ""} — cricket bio, career statistics and match records.`
      : `${name}${country ? ` (${country})` : ""} — records: ${summary || "career cricket profile"}.`;

    const scripts = [
      ldScript(
        athlete({
          name,
          path: profilePath,
          sport: "Cricket",
          team: country ?? undefined,
        }),
      ),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Players", path: "/cricket/players" },
          { name: name, path: profilePath },
        ]),
      ),
    ];
    if (!live) {
      const faqs =
        loaderData.aiFaqs && loaderData.aiFaqs.length ? loaderData.aiFaqs : loaderData.player.faqs;
      scripts.push(ldScript(faqPage(faqs)));
    }

    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: CricketPlayerProfile,
  errorComponent: ({ reset }) => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Player data is temporarily unavailable"
          message="We could not reach the live cricket feed. Please try again in a moment."
          onRetry={reset}
        />
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Player not found"
          description="This player is not in the cricket registry yet."
          action={
            <>
              <Link
                to="/cricket/players"
                className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-sm font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30"
              >
                Browse players
              </Link>
              <Link
                to="/cricket"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground"
              >
                Cricket hub
              </Link>
            </>
          }
        />
      </div>
    </div>
  ),
});

function CricketPlayerProfile() {
  const data = Route.useLoaderData();

  if (data.kind === "live") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SportNav />
        <CricketSubNav />
        <LivePlayerProfile profile={data.profile} slug={data.slug} />
      </div>
    );
  }

  const { player, aiFaqs } = data;
  const related = listCricketPlayers()
    .filter((p) => p.slug !== player.slug && (!player.country || p.country === player.country))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">
            Cricket
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket/players" className="hover:underline">
            Players
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{player.name}</span>
        </nav>

        <header className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-cricket)] to-[var(--color-accent-mlb)] grid place-items-center text-2xl font-bold"
            aria-hidden
          >
            {player.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{player.name}</h1>
            {player.country && (
              <p className="text-sm text-muted-foreground mt-1">
                {player.flag ?? ""} {player.country}
              </p>
            )}
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Career records ({player.records.length})</h2>
          {player.records.length === 0 ? (
            <EmptyState
              title="No career records yet"
              description="Records for this player are being compiled. Check back soon."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">Career records for {player.name}</caption>
                <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                  <tr>
                    <th scope="col" className="text-left px-3 py-2">
                      Record
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Value
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Context
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {player.records.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2">{r.category}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{r.value}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.extra ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">Explore cricket</h2>
          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Explore cricket">
            <Link
              to="/cricket/rankings"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              ICC rankings →
            </Link>
            <Link
              to="/cricket/records"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              All-time records →
            </Link>
            <Link
              to="/cricket/teams"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              Team profiles →
            </Link>
            <Link
              to="/cricket/players"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-[var(--color-accent-cricket)]/40 hover:bg-muted"
            >
              All players →
            </Link>
          </nav>
        </section>

        <FaqSection
          title={`Frequently asked about ${player.name}`}
          items={
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  ...player.faqs,
                  {
                    q: `What are ${player.name}'s best cricket records?`,
                    a: player.records.length
                      ? `${player.name}'s top records include ${player.records
                          .slice(0, 2)
                          .map((r) => `${r.category} with ${r.value}`)
                          .join(" and ")}.`
                      : "Records are currently being updated.",
                  },
                  {
                    q: `Which country does ${player.name} play for?`,
                    a: player.country
                      ? `${player.name} represents ${player.country} in international cricket.`
                      : `${player.name}'s international team is not recorded in this profile.`,
                  },
                ]
          }
        />

        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Related players</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/cricket/players/$slug"
                    params={{ slug: r.slug }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    {r.flag ?? ""} {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RelatedLinks
          title={`More cricket player pages`}
          links={relatedForCricketPlayer(player.slug, 12)}
        />
      </main>
    </div>
  );
}
