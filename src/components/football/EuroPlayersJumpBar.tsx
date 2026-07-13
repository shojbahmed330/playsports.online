import { useEffect, useState } from "react";

const SECTIONS: { id: string; label: string }[] = [
  { id: "players-hero", label: "Top" },
  { id: "boards", label: "Boards" },
  { id: "golden-boot", label: "Boot" },
  { id: "legends", label: "Legends" },
  { id: "rising", label: "Rising" },
  { id: "explore", label: "Explore" },
];

export function EuroPlayersJumpBar() {
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
      aria-label="Jump between player sections"
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
                  ? "bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/40"
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
