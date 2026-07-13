import { useEffect, useState } from "react";

const SECTIONS: { id: string; label: string }[] = [
  { id: "teams-hero", label: "Top" },
  { id: "champions", label: "Champions" },
  { id: "grid", label: "Nations" },
  { id: "hosts", label: "Hosts" },
];

export function EuroTeamsJumpBar() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const o = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setActive(s.id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
      );
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      className="sm:hidden fixed bottom-3 left-3 right-3 z-30 rounded-full border border-white/10 bg-gray-950/90 backdrop-blur shadow-2xl"
      aria-label="Jump between team sections"
    >
      <div className="flex items-center gap-1 p-1 overflow-x-auto no-scrollbar">
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className={`tap-target shrink-0 rounded-full px-3 py-2 text-[11px] font-bold transition ${
                isActive
                  ? "bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/40"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
