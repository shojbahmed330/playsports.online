// Floating "Live now" pill mounted globally. Only renders when a WC 2026
// match is in progress and the user is NOT already inside the football
// section (so we don't distract from the page they're already on).
import { Link, useRouterState } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { useWc2026Pulse } from "@/lib/use-wc2026-pulse";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWc2026Fixtures } from "@/lib/wc2026.functions";

export function FootballLiveBadge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide on football pages entirely (redundant with in-page cues).
  if (pathname.startsWith("/football")) return null;

  return <LiveBadgeInner />;
}

function LiveBadgeInner() {
  const pulse = useWc2026Pulse();
  const fn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fn(),
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 1,
    enabled: pulse.liveCount > 0,
  });

  if (pulse.loading || pulse.liveCount === 0) return null;

  const live = (q.data?.fixtures ?? []).find((f) => f.status === "inprogress");
  if (!live) return null;

  const label = `${live.home.code || live.home.name.slice(0, 3).toUpperCase()} v ${live.away.code || live.away.name.slice(0, 3).toUpperCase()}`;
  const score = `${live.home.goals ?? 0}–${live.away.goals ?? 0}`;

  return (
    <Link
      to="/football/match/$id"
      params={{ id: String(live.id) }}
      className="fixed bottom-20 sm:bottom-4 right-3 sm:right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-500 pl-2 pr-3 py-1.5 shadow-[0_10px_30px_rgba(239,68,68,0.4)] ring-1 ring-red-400/40 hover:scale-[1.03] transition-transform"
      aria-label={`Watch live: ${label}`}
    >
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
        <span className="relative inline-flex size-2 rounded-full bg-white" />
      </span>
      <Radio className="size-3.5 text-white shrink-0" />
      <span className="text-[11px] font-bold text-white leading-none whitespace-nowrap">
        <span className="hidden sm:inline">WC · </span>
        {label}
        <span className="ml-1.5 tabular-nums font-black">{score}</span>
        {live.minute != null && (
          <span className="ml-1 opacity-80">·{live.minute}'</span>
        )}
        {pulse.liveCount > 1 && (
          <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">
            +{pulse.liveCount - 1}
          </span>
        )}
      </span>
    </Link>
  );
}
