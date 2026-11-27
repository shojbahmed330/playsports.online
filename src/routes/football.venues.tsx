import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Users, Calendar, Trophy } from "lucide-react";
import { WC2026_VENUES, WC2026_HOST_STATS } from "@/data/wc2026_venues";
import { EmptyState } from "@/components/ui/state";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

const CANONICAL = "https://www.playsports.online/football/venues";
const TITLE = "FIFA World Cup 2026 Host Cities & Stadiums — 16 Venues Guide";
const DESC =
  "Full guide to the 16 FIFA World Cup 2026 host cities and stadiums across USA, Canada and Mexico — capacity, club tenants, opening match, final venue and history.";

export const Route = createFileRoute("/football/venues")({
  head: () => {
    const placeLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "FIFA World Cup 2026 Host Venues",
      itemListElement: WC2026_VENUES.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SportsActivityLocation",
          name: v.stadium,
          address: {
            "@type": "PostalAddress",
            addressLocality: v.city,
            addressCountry: v.countryCode,
          },
          maximumAttendeeCapacity: v.capacity,
        },
      })),
    };
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: CANONICAL },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESC },
      ],
      links: [{ rel: "canonical", href: CANONICAL }],
      scripts: [
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Host Venues", path: "/football/venues" },
          ]),
        ),
        { type: "application/ld+json", children: JSON.stringify(placeLd) },
      ],
    };
  },
  component: VenuesPage,
});

function VenuesPage() {
  const byCountry = {
    "United States": WC2026_VENUES.filter((v) => v.countryCode === "US"),
    Canada: WC2026_VENUES.filter((v) => v.countryCode === "CA"),
    Mexico: WC2026_VENUES.filter((v) => v.countryCode === "MX"),
  } as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 space-y-8">
      <header className="space-y-3">
        <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-indigo-400">
            Home
          </Link>
          <span className="mx-1.5" aria-hidden="true">
            /
          </span>
          <Link to="/football" className="hover:text-indigo-400">
            Football
          </Link>
          <span className="mx-1.5" aria-hidden="true">
            /
          </span>
          <span className="text-foreground">Host Venues</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          FIFA World Cup 2026 Host Cities & Stadiums
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
          The 2026 FIFA World Cup — the first with 48 teams and the first co-hosted by three nations
          — was played across{" "}
          <strong className="text-white">{WC2026_HOST_STATS.totalVenues} stadiums</strong> in{" "}
          <strong className="text-white">{WC2026_HOST_STATS.usa}</strong> US cities,{" "}
          <strong className="text-white">{WC2026_HOST_STATS.canada}</strong> Canadian cities and{" "}
          <strong className="text-white">{WC2026_HOST_STATS.mexico}</strong> Mexican cities. The
          opening match was at Estadio Azteca (Mexico City) on 11 June 2026 and the final was at
          MetLife Stadium (New York/New Jersey) on 19 July 2026.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Stat label="Total venues" value={String(WC2026_HOST_STATS.totalVenues)} />
          <Stat
            label="Combined capacity"
            value={WC2026_HOST_STATS.totalCapacity.toLocaleString()}
          />
          <Stat label="Host nations" value="3" />
          <Stat label="Matches" value="104" />
        </div>
      </header>

      {WC2026_VENUES.length === 0 && (
        <EmptyState
          title="No venues available"
          description="The World Cup 2026 venue guide is empty right now."
        />
      )}

      {(Object.keys(byCountry) as Array<keyof typeof byCountry>).map((country) => (
        <section key={country} className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span aria-hidden="true">{byCountry[country][0]?.flag}</span> {country}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({byCountry[country].length} venues)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byCountry[country].map((v) => (
              <article
                key={v.stadium}
                className="rounded-2xl ring-1 ring-border bg-card p-4 space-y-2 hover:ring-indigo-400/40 transition motion-reduce:transition-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-snug">{v.stadium}</h3>
                  <span className="text-lg shrink-0" aria-hidden>
                    {v.flag}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin aria-hidden="true" className="size-3.5" /> {v.city}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <MetaLine
                    icon={<Users aria-hidden="true" className="size-3.5" />}
                    label="Capacity"
                    value={v.capacity.toLocaleString()}
                  />
                  <MetaLine
                    icon={<Calendar aria-hidden="true" className="size-3.5" />}
                    label="Opened"
                    value={String(v.opened)}
                  />
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  <span className="text-white/80">Club:</span> {v.clubTenant}
                </div>
                <div className="text-xs text-indigo-300 flex items-start gap-1.5 pt-1 border-t border-border/50">
                  <Trophy aria-hidden="true" className="size-3.5 mt-0.5 shrink-0" />
                  <span>{v.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl ring-1 ring-border bg-card p-5 space-y-3">
        <h2 className="text-lg font-bold text-white">
          Practical guide — 2026 tournament logistics
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>
            All 16 venues are existing NFL, MLS or Liga MX grounds — every artificial surface was
            converted to a natural grass overlay to meet FIFA requirements.
          </li>
          <li>
            The tournament ran <strong className="text-white">11 June – 19 July 2026</strong>, 39
            days, 104 matches across 48 teams (up from 32 in 2022).
          </li>
          <li>
            Estadio Azteca became the first stadium in history to host matches in three FIFA World
            Cups (1970, 1986, 2026).
          </li>
          <li>
            Semi-finals were staged at AT&T Stadium (Arlington) and Mercedes-Benz Stadium (Atlanta);
            the third-place playoff was at Hard Rock Stadium (Miami).
          </li>
        </ul>
        <div className="pt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span>Related:</span>
          <Link
            to="/guides/$slug"
            params={{ slug: "fifa-world-cup-2026-format" }}
            className="inline-flex min-h-11 items-center text-indigo-400 hover:underline"
          >
            2026 format
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/guides/$slug"
            params={{ slug: "how-many-teams-fifa-world-cup-2026" }}
            className="inline-flex min-h-11 items-center text-indigo-400 hover:underline"
          >
            48-team expansion
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/football"
            className="inline-flex min-h-11 items-center text-indigo-400 hover:underline"
          >
            Live scores & fixtures
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg ring-1 ring-border bg-card px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function MetaLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span>
        <span className="text-white/80">{label}:</span>{" "}
        <span className="tabular-nums">{value}</span>
      </span>
    </div>
  );
}
