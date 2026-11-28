import { formatLocalDateTime, formatLocalTime, relativeDay } from "@/lib/time";
import { useHydrated } from "@/hooks/use-hydrated";

type Mode = "time" | "day" | "datetime";

/**
 * Renders a time label after mount so SSR (UTC) and the browser (viewer zone)
 * never disagree during hydration. The em dash placeholder is identical on
 * both sides; the real label appears after the first effect.
 */
export function LocalTime({
  ts,
  mode = "time",
  className,
}: {
  ts: number;
  mode?: Mode;
  className?: string;
}) {
  const mounted = useHydrated();

  if (!mounted) return null;

  const text =
    mode === "day"
      ? relativeDay(ts)
      : mode === "datetime"
        ? formatLocalDateTime(ts)
        : formatLocalTime(ts);

  return (
    <time dateTime={new Date(ts).toISOString()} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}
