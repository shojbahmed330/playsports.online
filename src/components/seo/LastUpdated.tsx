// Small visible freshness badge. Renders "Last updated <date>" so both
// users and crawlers see a fresh timestamp on hub / archive pages.
import { BUILD_ISO, formatFreshDate } from "@/lib/seo/freshness";

export function LastUpdated({
  iso = BUILD_ISO,
  label = "Last updated",
  className = "",
}: {
  iso?: string;
  label?: string;
  className?: string;
}) {
  const pretty = formatFreshDate(iso);
  return (
    <p
      className={`text-xs text-muted-foreground ${className}`}
      data-testid="last-updated"
    >
      {label}{" "}
      <time dateTime={iso} itemProp="dateModified">
        {pretty}
      </time>
    </p>
  );
}
