import { useEffect, useState } from "react";
import {
  getTimezone, setTimezoneOverride, isTimezoneOverridden,
  subscribeTimezone, TIMEZONE_PRESETS,
} from "@/lib/timezone";
import { Globe, Check, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

/** Hook: subscribes to timezone changes and re-renders the caller. */
export function useTimezone(): string {
  const [tz, setTz] = useState(() => getTimezone());
  useEffect(() => subscribeTimezone(() => setTz(getTimezone())), []);
  return tz;
}

export function TimezonePicker({ compact = false }: { compact?: boolean } = {}) {
  const tz = useTimezone();
  const overridden = isTimezoneOverridden();
  const [open, setOpen] = useState(false);

  // Pretty short label: "BDT" from "Asia/Dhaka"
  const short = (() => {
    try {
      const parts = new Intl.DateTimeFormat(undefined, {
        timeZone: tz, timeZoneName: "short",
      }).formatToParts(new Date());
      return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
    } catch { return tz; }
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full border transition-colors
            ${overridden
              ? "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-gray-700 bg-gray-900/80 text-gray-300 hover:border-amber-500/40 hover:text-amber-200"}
            ${compact ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[11px]"}`}
          aria-label="Change timezone"
        >
          <Globe className={compact ? "size-3" : "size-3.5"} />
          <span className="font-bold uppercase tracking-wider">{short}</span>
          {overridden && (
            <span className="rounded-full bg-amber-500/30 px-1 text-[8px] font-bold">LOCKED</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-amber-400 flex items-center gap-2">
            <Globe className="size-4" /> Match Timezone
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-gray-400 -mt-1">
          Kickoff times are shown in this timezone everywhere on the site. Defaults to your device's local time.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => { setTimezoneOverride(null); setOpen(false); }}
            className="text-[11px] inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:border-amber-500/40 hover:text-amber-200 px-2.5 py-1"
          >
            <X className="size-3" /> Use device default
          </button>
          <span className="text-[10px] text-gray-500">Active: <span className="text-amber-400 font-bold">{tz}</span></span>
        </div>
        <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-800 divide-y divide-gray-800/60">
          {TIMEZONE_PRESETS.map((p) => {
            const active = p.tz === tz;
            return (
              <button
                key={p.tz}
                onClick={() => { setTimezoneOverride(p.tz); setOpen(false); }}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 text-sm transition-colors
                  ${active ? "bg-amber-500/10 text-amber-200" : "hover:bg-gray-900/80 text-gray-200"}`}
              >
                <span className="text-base">{p.flag}</span>
                <span className="flex-1">
                  <span className="block font-medium">{p.label}</span>
                  <span className="block text-[10px] text-gray-500 font-mono">{p.tz}</span>
                </span>
                {active && <Check className="size-4 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
