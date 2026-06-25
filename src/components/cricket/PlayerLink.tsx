import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, X, AlertCircle } from "lucide-react";
import { CricketPlayerSheet } from "./CricketPlayerSheet";
import { findCricketAthlete } from "@/lib/cricket.functions";

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
 * Wrap any cricket player name to make it clickable. If `athleteId` is known
 * (from a live ESPN payload), the profile sheet opens directly. Otherwise
 * the component searches ESPN by name on first click.
 */
export function PlayerLink({
  name,
  athleteId,
  leagueId,
  className,
  children,
  as = "button",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const find = useServerFn(findCricketAthlete);

  const lookup = useQuery({
    enabled: open && !athleteId && !!name,
    queryKey: ["cricket", "athlete-search", (name ?? "").toLowerCase()],
    queryFn: () => find({ data: { name: name! } }),
    staleTime: 24 * 60 * 60_000,
  });

  const resolvedId = athleteId ?? lookup.data?.athleteId ?? null;
  const label = children ?? name ?? "Player";

  if (disabled || (!name && !athleteId)) {
    return <span className={className}>{label}</span>;
  }

  const baseCls =
    "inline text-left hover:underline decoration-emerald-400/70 underline-offset-2 cursor-pointer transition-colors hover:text-emerald-200";
  const merged = [baseCls, className].filter(Boolean).join(" ");

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      {as === "span" ? (
        <span role="button" tabIndex={0} onClick={handle} className={merged}>
          {label}
        </span>
      ) : (
        <button type="button" onClick={handle} className={merged}>
          {label}
        </button>
      )}

      {open && resolvedId && (
        <CricketPlayerSheet
          athleteId={resolvedId}
          leagueId={leagueId}
          onClose={() => setOpen(false)}
        />
      )}

      {open && !resolvedId && lookup.isLoading && (
        <SearchOverlay name={name ?? "player"} onClose={() => setOpen(false)} />
      )}

      {open && !resolvedId && !lookup.isLoading && (
        <NotFoundOverlay name={name ?? "player"} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function SearchOverlay({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-emerald-950 ring-1 ring-emerald-500/20 p-6 text-center">
        <Loader2 className="size-6 mx-auto animate-spin text-emerald-300" />
        <div className="mt-3 text-sm font-semibold text-emerald-100">Finding {name}…</div>
        <div className="mt-1 text-xs text-emerald-200/60">Searching ESPN cricket database</div>
      </div>
    </div>
  );
}

function NotFoundOverlay({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-emerald-950 ring-1 ring-amber-500/30 p-6 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 size-8 grid place-items-center rounded-full bg-white/5 hover:bg-white/15"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <AlertCircle className="size-8 mx-auto text-amber-400" />
        <div className="mt-3 text-sm font-semibold text-amber-100">No profile found</div>
        <div className="mt-1 text-xs text-amber-200/60">
          ESPN didn't return a cricket athlete page for <span className="font-bold">{name}</span>.
        </div>
      </div>
    </div>
  );
}
