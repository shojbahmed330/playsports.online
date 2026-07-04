import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Trophy, Target, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { flagOf } from "@/lib/flags";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

type PredictionRow = {
  id: string;
  home_score: number;
  away_score: number;
  points: number;
  settled: boolean;
};

type LeaderRow = PredictionRow & { handle: string | null; is_mine: boolean };

async function fetchPredictions(matchId: number): Promise<LeaderRow[]> {
  const { data } = await (supabase as any).rpc("get_match_predictions_leaderboard", {
    p_sport: "football",
    p_match_id: matchId,
  });
  return (data ?? []) as LeaderRow[];
}

async function fetchMyPrediction(matchId: number, userId: string): Promise<PredictionRow | null> {
  const { data } = await supabase
    .from("match_predictions" as any)
    .select("id,home_score,away_score,points,settled")
    .eq("sport", "football")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as unknown as PredictionRow | null) ?? null;
}


export function MatchPrediction({ fx }: { fx: Wc2026Fixture }) {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const matchId = fx.id;
  const kickoff = fx.startTs * 1000;
  const started = fx.status !== "notstarted" || Date.now() >= kickoff;

  const leaderQ = useQuery({
    queryKey: ["match-predictions", matchId],
    queryFn: () => fetchPredictions(matchId),
    refetchInterval: 60_000,
  });
  const mineQ = useQuery({
    queryKey: ["match-prediction-mine", matchId, user?.id],
    queryFn: () => fetchMyPrediction(matchId, user!.id),
    enabled: !!user,
  });

  const [h, setH] = useState(1);
  const [a, setA] = useState(1);
  useEffect(() => {
    if (mineQ.data) { setH(mineQ.data.home_score); setA(mineQ.data.away_score); }
  }, [mineQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const payload = {
        user_id: user.id,
        match_id: matchId,
        sport: "football",
        home_score: h,
        away_score: a,
      };
      const { error } = await supabase
        .from("match_predictions" as any)
        .upsert(payload, { onConflict: "user_id,match_id,sport" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match-predictions", matchId] });
      qc.invalidateQueries({ queryKey: ["match-prediction-mine", matchId, user?.id] });
    },
  });

  const total = leaderQ.data?.length ?? 0;
  const avg = total > 0
    ? {
        h: (leaderQ.data!.reduce((s, r) => s + r.home_score, 0) / total).toFixed(1),
        a: (leaderQ.data!.reduce((s, r) => s + r.away_score, 0) / total).toFixed(1),
      }
    : null;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="size-4 text-purple-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-purple-200">Predict the Score</h2>
        {total > 0 && (
          <span className="ml-auto text-[10px] text-gray-500 tabular-nums">{total} pick{total === 1 ? "" : "s"}</span>
        )}
      </div>

      {!loading && !user ? (
        <div className="text-xs text-gray-400">
          <Link to="/auth" className="text-purple-300 font-semibold hover:text-purple-200 underline">
            Sign in
          </Link>{" "}
          to submit your prediction and appear on the leaderboard.
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 sm:gap-5 py-1">
          <Picker label={fx.home.name} value={h} onChange={setH} disabled={started || save.isPending} />
          <span className="text-gray-600 text-lg font-bold">:</span>
          <Picker label={fx.away.name} value={a} onChange={setA} disabled={started || save.isPending} align="right" />
        </div>
      )}

      {user && !started && (
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="w-full rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 py-2 text-xs font-bold text-purple-100 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : mineQ.data ? <Check className="size-3.5" /> : null}
          {mineQ.data ? "Update prediction" : "Submit prediction"}
        </button>
      )}
      {started && (
        <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
          Picks locked — kickoff has passed
        </p>
      )}
      {save.error && (
        <p className="text-[11px] text-red-300">{(save.error as Error).message}</p>
      )}

      {avg && (
        <div className="rounded-lg border border-white/5 bg-black/40 p-3 flex items-center justify-between text-xs">
          <span className="text-gray-400">Community average</span>
          <span className="font-black tabular-nums text-white">
            {avg.h} <span className="text-gray-600">:</span> {avg.a}
          </span>
        </div>
      )}

      {leaderQ.data && leaderQ.data.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="size-3.5 text-amber-300" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Top predictions</h3>
          </div>
          <ul className="space-y-1">
            {leaderQ.data.slice(0, 8).map((r, i) => (
              <li key={r.id} className="flex items-center gap-2 text-xs">
                <span className="w-5 text-right tabular-nums text-gray-500">{i + 1}</span>
                <span className="truncate flex-1 text-gray-200">{r.handle ?? "anonymous"}</span>
                <span className="tabular-nums font-bold text-white">
                  {flagOf(fx.home.name)} {r.home_score}–{r.away_score} {flagOf(fx.away.name)}
                </span>
                {r.settled && (
                  <span className="text-[10px] font-bold text-amber-300 tabular-nums w-8 text-right">
                    +{r.points}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Picker({
  label, value, onChange, disabled, align = "left",
}: { label: string; value: number; onChange: (n: number) => void; disabled?: boolean; align?: "left" | "right" }) {
  return (
    <div className={`flex-1 min-w-0 flex flex-col items-${align === "right" ? "end" : "start"}`}>
      <div className={`flex items-center gap-1.5 mb-1.5 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <span className="text-base leading-none">{flagOf(label)}</span>
        <span className="truncate text-[11px] font-semibold text-gray-300 max-w-[110px]">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="size-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold disabled:opacity-30"
        >−</button>
        <span className="w-10 text-center text-2xl font-black tabular-nums text-white">{value}</span>
        <button
          type="button"
          disabled={disabled || value >= 20}
          onClick={() => onChange(Math.min(20, value + 1))}
          className="size-8 grid place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold disabled:opacity-30"
        >+</button>
      </div>
    </div>
  );
}
