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
    body: "Opens the full match centre — lineups, live events, stats and where to watch.",
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
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-sm m-3 sm:m-0 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-gray-950 to-gray-900 shadow-[0_20px_60px_rgba(245,158,11,0.25)] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-label="Quick tour"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/5">
          <div className="inline-flex items-center gap-2 text-amber-300">
            <Sparkles className="size-4" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase">Quick tour · {step + 1}/{STEPS.length}</span>
          </div>
          <button onClick={close} aria-label="Skip tour" className="rounded-full p-1 text-gray-400 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30 text-amber-300">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold text-white">{S.title}</div>
              <p className="text-xs text-gray-400 mt-1">{S.body}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1 rounded-full transition-all ${i === step ? "w-6 bg-amber-400" : i < step ? "w-3 bg-amber-500/40" : "w-3 bg-white/10"}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={close} className="text-[11px] text-gray-400 hover:text-white px-2 py-1">
                Skip
              </button>
              <button
                onClick={() => (isLast ? close() : setStep((s) => s + 1))}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs px-3 py-1.5 active:scale-95"
              >
                {isLast ? "Got it" : "Next"}
                {!isLast && <ChevronRight className="size-3.5" />}
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
      onClick={onReplay}
      className="text-[11px] text-gray-500 hover:text-amber-300 inline-flex items-center gap-1"
    >
      <Sparkles className="size-3" /> Replay tour
    </button>
  );
}
