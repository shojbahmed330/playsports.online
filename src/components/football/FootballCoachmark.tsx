import { useEffect, useState } from "react";
import { Sparkles, MousePointerClick, Star, Globe2, X, ChevronRight, Radio, CalendarPlus } from "lucide-react";

const STORAGE_KEY = "wc_onboarded_v2";

const STEPS = [
  {
    icon: Radio,
    title: "Today tab jumps to live action",
    body: "Today surfaces Live now, kicking off later and just-finished — all in one glance.",
  },
  {
    icon: MousePointerClick,
    title: "Tap any match card",
    body: "Opens a match popup first — highlights, score, live events and where to watch.",
  },
  {
    icon: Star,
    title: "Star ⭐ your teams",
    body: "Tap the star next to a flag, then toggle My Teams to focus your fixture list.",
  },
  {
    icon: CalendarPlus,
    title: "Add fixtures to your calendar",
    body: "On any upcoming match, tap Add to calendar to save it as an .ics event.",
  },
  {
    icon: Globe2,
    title: "Live badge follows you",
    body: "When a match is live, a red pill appears bottom-right — one tap to jump in.",
  },
];

export function FootballCoachmark({ force = false }: { force?: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (force) { setOpen(true); setStep(0); return; }
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        // Delay a tick so the page paints first.
        const t = setTimeout(() => {
          setOpen(true);
          // Mark as seen the moment we show it, so a refresh mid-tour
          // doesn't re-trigger on the next visit.
          try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
        }, 600);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, [force]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
  };

  if (!open) return null;
  const S = STEPS[step];
  const Icon = S.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-end justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-150 motion-reduce:animate-none sm:items-center">
      <div
        className="pointer-events-auto m-3 w-full overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-[var(--shadow-elevated)] animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none sm:m-0 sm:max-w-sm sm:zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-label="Quick tour"
      >
        <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-4 py-2.5">
          <div className="inline-flex items-center gap-2 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            <span className="text-micro font-bold uppercase">Quick tour · {step + 1}/{STEPS.length}</span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Skip tour"
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-body font-bold text-foreground">{S.title}</div>
              <p className="mt-1 text-caption text-muted-foreground">{S.body}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1 rounded-full transition-all ${i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-muted"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                className="min-h-11 px-2 text-micro text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => (isLast ? close() : setStep((s) => s + 1))}
                className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-3 text-caption font-bold text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isLast ? "Got it" : "Next"}
                {!isLast && <ChevronRight className="size-3.5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReplayTourButton({ onReplay }: { onReplay: () => void }) {
  return (
    <button
      type="button"
      onClick={onReplay}
      className="inline-flex min-h-11 items-center gap-1 text-micro text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Sparkles className="size-3" aria-hidden="true" /> Replay tour
    </button>
  );
}
