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
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${overridden
              ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"}
            ${compact ? "px-2 text-micro" : "px-2.5 text-micro"}`}
          aria-label="Change timezone"
        >
          <Globe className={compact ? "size-3" : "size-3.5"} aria-hidden="true" />
          <span className="font-bold uppercase">{short}</span>
          {overridden && (
            <span className="rounded-full bg-primary/20 px-1 text-micro font-bold">LOCKED</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-border bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Globe className="size-4" aria-hidden="true" /> Match Timezone
          </DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-caption text-muted-foreground">
          Kickoff times are shown in this timezone everywhere on the site. Defaults to your device's local time.
        </p>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setTimezoneOverride(null); setOpen(false); }}
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-micro text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3" aria-hidden="true" /> Use device default
          </button>
          <span className="text-micro text-muted-foreground">
            Active: <span className="font-bold text-primary">{tz}</span>
          </span>
        </div>
        <div className="max-h-80 divide-y divide-border/60 overflow-y-auto rounded-lg border border-border">
          {TIMEZONE_PRESETS.map((p) => {
            const active = p.tz === tz;
            return (
              <button
                key={p.tz}
                type="button"
                onClick={() => { setTimezoneOverride(p.tz); setOpen(false); }}
                className={`flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-caption transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-accent"
                }`}
              >
                <span className="text-base" aria-hidden="true">{p.flag}</span>
                <span className="flex-1">
                  <span className="block font-medium">{p.label}</span>
                  <span className="block font-mono text-micro text-muted-foreground">{p.tz}</span>
                </span>
                {active && <Check className="size-4 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
