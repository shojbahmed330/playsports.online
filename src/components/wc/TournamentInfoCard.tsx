import { Trophy, Medal, Award } from "lucide-react";
import type { WCTournament } from "@/lib/supabase";

export function TournamentInfoCard({ t }: { t: WCTournament }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-border pb-5">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-gold font-semibold">FIFA World Cup</div>
          <div className="text-4xl sm:text-5xl font-extrabold mt-1">{t.year}</div>
        </div>
        {t.host_country && (
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Host Nation</div>
            <div className="text-xl font-semibold">{t.host_country}</div>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <PodiumItem icon={<Trophy className="size-6 text-gold" />} label="Champion" team={t.champion} highlight />
        <PodiumItem icon={<Medal className="size-6 text-gray-300" />} label="Runner-up" team={t.runner_up} />
        <PodiumItem icon={<Award className="size-6 text-amber-700" />} label="Third Place" team={t.third_place} />
      </div>
    </div>
  );
}

function PodiumItem({
  icon, label, team, highlight,
}: { icon: React.ReactNode; label: string; team: string | null; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${highlight ? "border-gold/40 bg-gold/5" : "border-border bg-background/40"}`}>
      <div className="shrink-0 size-11 rounded-lg bg-background/60 flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`font-semibold truncate ${highlight ? "text-gold" : ""}`}>{team ?? "—"}</div>
      </div>
    </div>
  );
}
