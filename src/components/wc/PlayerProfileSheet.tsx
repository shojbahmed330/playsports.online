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

  if (!player) return null;
  const data = q.data?.profile;
  const err = q.data?.error || (q.error instanceof Error ? q.error.message : null);

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center sm:justify-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[88vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-amber-500/30 bg-gray-950 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start gap-3 p-4 border-b border-gray-800 bg-gradient-to-r from-amber-500/10 via-gray-900 to-gray-950 backdrop-blur">
          <div className="shrink-0 size-16 rounded-full overflow-hidden bg-gray-800 ring-2 ring-amber-500/40 grid place-items-center">
            {data?.headshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.headshot}
                alt={data.name}
                className="size-full object-cover"
                onError={(e) = decoding="async" loading="lazy"> ((e.currentTarget.style.display = "none"))}
              />
            ) : (
              <User className="size-7 text-gray-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400 font-bold">
              Player Profile
            </div>
            <div className="text-lg font-black text-white truncate leading-tight">
              {data?.name || player.name}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
              {player.team && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-sm">{flagOf(player.team)}</span>
                  {player.team}
                </span>
              )}
              {(data?.position || player.position) && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="uppercase tracking-wider text-[10px] font-bold text-gray-300">
                    {data?.position || player.position}
                  </span>
                </>
              )}
              {(data?.jersey || player.shirt != null) && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="font-mono text-[10px] text-gray-300">
                    #{data?.jersey || player.shirt}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white active:scale-95"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {q.isLoading && (
            <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
              <Loader2 className="size-4 animate-spin mr-2" /> Loading profile…
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

              {data.stats.length > 0 ? (
                data.stats.map((g) => (
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
              ) : (
                !err && (
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-xs text-gray-400">
                    No aggregated career stats available for this player yet.
                  </div>
                )
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
