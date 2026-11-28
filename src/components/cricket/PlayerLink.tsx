import { Link } from "@tanstack/react-router";
import { cricketPlayerSlug } from "@/lib/cricket-player-slug";

type Props = {
  name?: string | null;
  athleteId?: string | null;
  leagueId?: string;
  className?: string;
  children?: React.ReactNode;
  as?: "button" | "span";
  /** disable the link entirely (no click handler). */
  disabled?: boolean;
};

/**
 * Cricket player name → real, indexable profile URL.
 *
 * The profile route resolves historical players from the registry and current
 * players through ESPN, so links are name-based (`/cricket/players/shai-hope`)
 * instead of opening a client-only sheet with an opaque athlete id.
 */
export function PlayerLink({ name, athleteId, className, children, disabled }: Props) {
  const label = children ?? name ?? "Player";
  const slug = name ? cricketPlayerSlug(name) : "";

  if (disabled || !slug) {
    return <span className={className}>{label}</span>;
  }

  const merged = [
    "inline text-left underline-offset-2 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      to="/cricket/players/$slug"
      params={{ slug }}
      search={{ athlete: athleteId ?? undefined }}
      className={merged}
      title={`${name ?? "Player"} — cricket profile`}
    >
      {label}
    </Link>
  );
}
