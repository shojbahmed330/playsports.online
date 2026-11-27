import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X, ExternalLink, User } from "lucide-react";
import { getWc2026PlayerProfile } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";

export interface PlayerSheetTarget {
  id: number;
  name: string;
  team?: string | null;
  shirt?: number | null;
  position?: string | null;
}

export function PlayerProfileSheet({
  player,
  onClose,
}: {
  player: PlayerSheetTarget | null;
  onClose: () => void;
}) {
  const enabled = !!player?.id;
  const q = useQuery({
    queryKey: ["wc2026-player", player?.id],
    queryFn: () => getWc2026PlayerProfile({ data: { playerId: player!.id } }),
    enabled,
    staleTime: 10 * 60_000,
  });

  // Close on Escape; lock background scroll while the sheet is open.
  useEffect(() => {
    if (!player) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [player, onClose]);

  if (!player) return null;
  const data = q.data?.profile;
  const err = q.data?.error || (q.error instanceof Error ? q.error.message : null);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none sm:items-center sm:justify-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${player.name} player profile`}
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-background animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-border bg-gradient-to-r from-primary/10 via-background to-background p-4 backdrop-blur">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-muted ring-2 ring-primary/40">
            {data?.headshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.headshot}
                alt={data.name}
                className="size-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <User className="size-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Player Profile
            </div>
            <div className="truncate text-lg font-black leading-tight text-foreground">
              {data?.name || player.name}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {player.team && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-sm" aria-hidden="true">
                    {flagOf(player.team)}
                  </span>
                  {player.team}
                </span>
              )}
              {(data?.position || player.position) && (
                <>
                  <span className="opacity-40" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {data?.position || player.position}
                  </span>
                </>
              )}
              {(data?.jersey || player.shirt != null) && (
                <>
                  <span className="opacity-40" aria-hidden="true">
                    ·
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    #{data?.jersey || player.shirt}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close player profile"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          {q.isLoading && (
            <div
              className="flex items-center justify-center py-10 text-sm text-muted-foreground"
              role="status"
            >
              <Loader2
                className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />{" "}
              Loading profile…
            </div>
          )}

          {err && !q.isLoading && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-200">
              Full profile not available for this player on ESPN. Showing lineup info only.
            </div>
          )}

          {data && (
            <>
              {data.bio.length > 0 && (
                <section>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 mb-2">
                    Bio
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {data.bio.map((b) => (
                      <div
                        key={b.label}
                        className="rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2"
                      >
                        <div className="text-[9px] uppercase tracking-wider text-gray-500">
                          {b.label}
                        </div>
                        <div className="text-sm font-medium text-white truncate">{b.value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.stats.length > 0
                ? data.stats.map((g) => (
                    <section key={g.group}>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 mb-2">
                        {g.group}
                      </div>
                      <div className="rounded-xl border border-gray-800 bg-gray-900/60 divide-y divide-gray-800">
                        {g.rows.map((r) => (
                          <div
                            key={r.name}
                            className="flex items-center justify-between px-3 py-2 text-xs"
                          >
                            <span className="text-gray-400 truncate pr-2">{r.name}</span>
                            <span className="font-bold tabular-nums text-white">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))
                : !err && (
                    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-xs text-gray-400">
                      No aggregated career stats available for this player yet.
                    </div>
                  )}

              {data.espnUrl && (
                <a
                  href={data.espnUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
                >
                  <ExternalLink className="size-3.5" /> Open full profile on ESPN
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
