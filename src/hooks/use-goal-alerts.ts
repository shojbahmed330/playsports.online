// Watches a fixture score and fires a subtle toast when it changes.
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

export function useGoalAlerts(fx: Wc2026Fixture | undefined | null) {
  const last = useRef<{ h: number | null; a: number | null } | null>(null);
  useEffect(() => {
    if (!fx || fx.status !== "inprogress") return;
    const h = fx.home.goals ?? 0;
    const a = fx.away.goals ?? 0;
    const prev = last.current;
    if (prev && (prev.h !== h || prev.a !== a)) {
      const scorer = (h > (prev.h ?? 0)) ? fx.home.name : fx.away.name;
      toast(`⚽ GOAL — ${scorer}`, {
        description: `${fx.home.code || fx.home.name} ${h} – ${a} ${fx.away.code || fx.away.name}${fx.minute ? ` · ${fx.minute}'` : ""}`,
        duration: 6000,
      });
    }
    last.current = { h, a };
  }, [fx?.home.goals, fx?.away.goals, fx?.status, fx?.minute, fx?.home.name, fx?.away.name, fx?.home.code, fx?.away.code, fx]);
}
