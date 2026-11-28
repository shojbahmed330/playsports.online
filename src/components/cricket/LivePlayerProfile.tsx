import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Shield, User } from "lucide-react";
import type { CricketPlayerProfile } from "@/lib/cricket.functions";
import { EmptyState } from "@/components/ui/state";

/**
 * Server-rendered profile for a player resolved from ESPN by name. Unlike the
 * historical registry pages, this covers current internationals and league
 * players, and gives every click a real, indexable URL.
 */
export function LivePlayerProfile({
  profile,
  slug,
}: {
  profile: CricketPlayerProfile;
  slug: string;
}) {
  const career = profile.career ?? [];
  const facts = [
    profile.position && { icon: Shield, label: profile.position },
    profile.batStyle && { icon: User, label: profile.batStyle },
    profile.bowlStyle && { icon: User, label: profile.bowlStyle },
    profile.age != null && { icon: CalendarDays, label: `${profile.age} years` },
    profile.birthPlace && { icon: MapPin, label: profile.birthPlace },
  ].filter(Boolean) as { icon: typeof Shield; label: string }[];

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center text-caption text-muted-foreground"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span className="mx-1" aria-hidden="true">
          /
        </span>
        <Link
          to="/cricket"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Cricket
        </Link>
        <span className="mx-1" aria-hidden="true">
          /
        </span>
        <Link
          to="/cricket/players"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Players
        </Link>
        <span className="mx-1" aria-hidden="true">
          /
        </span>
        <span className="text-foreground" aria-current="page">
          {profile.name}
        </span>
      </nav>

      <header className="mb-8 flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
          {profile.headshot ? (
            <img
              src={profile.headshot}
              alt=""
              className="size-full object-cover"
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <User className="size-7 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-h1 text-foreground">{profile.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
            {profile.flag &&
              (/^https?:\/\//.test(profile.flag) ? (
                <img
                  src={profile.flag}
                  alt=""
                  className="h-4 w-6 rounded-sm object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <span aria-hidden="true">{profile.flag}</span>
              ))}
            {profile.team ?? profile.country ?? "Cricket"}
            {profile.jersey && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-micro font-bold">
                #{profile.jersey}
              </span>
            )}
          </p>
        </div>
      </header>

      {profile.description && (
        <p className="mb-8 max-w-3xl text-body leading-relaxed text-muted-foreground">
          {profile.description}
        </p>
      )}

      {facts.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-h3 text-foreground">Player facts</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {facts.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-caption"
              >
                <f.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{f.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-h3 text-foreground">Career statistics</h2>
        {career.length === 0 ? (
          <EmptyState
            title="Career stats unavailable"
            description="ESPN has no career splits for this player yet. Match scorecards still list their performances."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-caption">
              <caption className="sr-only">Career statistics for {profile.name}</caption>
              <thead className="bg-muted/50 text-micro uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left">
                    Format
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    M
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Runs
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Avg
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    SR
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    100
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    50
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Wkts
                  </th>
                  <th scope="col" className="px-3 py-2 text-right">
                    Econ
                  </th>
                </tr>
              </thead>
              <tbody>
                {career.map((c) => (
                  <tr key={c.format} className="border-t border-border">
                    <th scope="row" className="px-3 py-2 text-left font-semibold text-foreground">
                      {c.format}
                    </th>
                    <td className="px-3 py-2 text-right tabular-nums">{c.matches ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.runs ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.battingAvg ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.strikeRate ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.hundreds ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.fifties ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.wickets ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{c.economy ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-h3 text-foreground">Explore cricket</h2>
        <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Explore cricket">
          {[
            { to: "/cricket/players" as const, label: "All players" },
            { to: "/cricket/rankings" as const, label: "ICC rankings" },
            { to: "/cricket/records" as const, label: "All-time records" },
            { to: "/cricket/teams" as const, label: "Team profiles" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-caption font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {l.label} →
            </Link>
          ))}
        </nav>
      </section>

      <p className="text-micro text-muted-foreground">
        Profile data from ESPN. Canonical URL: /cricket/players/{slug}
      </p>
    </main>
  );
}
