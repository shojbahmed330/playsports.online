import { useQuery } from "@tanstack/react-query";
import { Flag, Users } from "lucide-react";
import { getWc2026MatchOfficials } from "@/lib/wc2026.functions";

const RefIcon = Flag;

export function OfficialsCard({ matchId }: { matchId: number }) {
  const q = useQuery({
    queryKey: ["wc2026-officials", matchId],
    queryFn: () => getWc2026MatchOfficials({ data: { matchId } }),
    staleTime: 10 * 60_000,
  });
  const officials = q.data?.officials ?? [];
  const attendance = q.data?.attendance ?? null;
  if (officials.length === 0 && attendance == null) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <RefIcon className="size-4 text-yellow-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-200">Match Officials</h2>
      </div>

      {officials.length > 0 && (
        <ul className="space-y-1.5">
          {officials.map((o, i) => (
            <li key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{o.role}</span>
              <span className="text-white font-semibold truncate ml-2">{o.name}</span>
            </li>
          ))}
        </ul>
      )}

      {attendance != null && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 inline-flex items-center gap-1.5">
            <Users className="size-3.5" /> Attendance
          </span>
          <span className="text-white font-bold tabular-nums">{attendance.toLocaleString()}</span>
        </div>
      )}
    </section>
  );
}
