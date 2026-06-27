import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const KEY = "age_verified_21";

export function isAgeVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function setAgeVerified(v: boolean) {
  try {
    if (v) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  // mirror to cookie so SSR can read later if needed
  try {
    document.cookie = `${KEY}=${v ? "1" : "0"}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch { /* ignore */ }
}

/** Render this only when at least one sportsbook tile is about to show.
 *  Returns `true` from the verified hook only when the user has confirmed 21+. */
export function useAgeGate(active: boolean) {
  const [verified, setVerified] = useState<boolean>(() => isAgeVerified());
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (active && !verified) setOpen(true);
    else setOpen(false);
  }, [active, verified]);

  const confirm = () => {
    setAgeVerified(true);
    setVerified(true);
    setOpen(false);
  };
  const decline = () => {
    setAgeVerified(false);
    setVerified(false);
    setOpen(false);
  };

  return { verified, open, confirm, decline };
}

export function AgeGateDialog({
  open,
  onConfirm,
  onDecline,
}: {
  open: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agegate-title"
        className="w-full max-w-sm rounded-2xl border border-amber-500/40 bg-card p-5 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="size-5 text-amber-400" />
          <h2 id="agegate-title" className="text-base font-bold">Age verification</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This page contains sportsbook partner offers. You must be of legal gambling age (21+ in the US,
          18+ in most other regions) to view them. Gamble responsibly.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onDecline}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            I'm under age — hide
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black"
          >
            I'm 21+
          </button>
        </div>
      </div>
    </div>
  );
}
