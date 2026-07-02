import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Loader2, Trash2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  hidden: boolean;
  created_at: string;
};
type CommentWithHandle = CommentRow & { handle: string | null };

async function fetchComments(matchId: number): Promise<CommentWithHandle[]> {
  const { data } = await supabase
    .from("match_comments" as never)
    .select("id,user_id,body,hidden,created_at")
    .eq("sport", "football")
    .eq("match_id", matchId)
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as CommentRow[];
  if (rows.length === 0) return [];
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = await supabase
    .from("public_profiles" as never)
    .select("user_id,handle")
    .in("user_id", ids);
  const map = new Map<string, string>();
  for (const p of (profiles ?? []) as { user_id: string; handle: string }[]) {
    map.set(p.user_id, p.handle);
  }
  return rows.map((r) => ({ ...r, handle: map.get(r.user_id) ?? null }));
}

function relTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function MatchComments({ matchId }: { matchId: number }) {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const q = useQuery({
    queryKey: ["match-comments", matchId],
    queryFn: () => fetchComments(matchId),
    refetchInterval: 45_000,
  });

  const post = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const text = body.trim();
      if (text.length === 0 || text.length > 500) throw new Error("1–500 characters required");
      const { error } = await supabase.from("match_comments" as never).insert({
        user_id: user.id,
        match_id: matchId,
        sport: "football",
        body: text,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["match-comments", matchId] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("match_comments" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["match-comments", matchId] }),
  });

  const comments = q.data ?? [];

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-4 text-cyan-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Fan Talk</h2>
        <span className="ml-auto text-[10px] text-gray-500 tabular-nums">{comments.length}</span>
      </div>

      {user ? (
        <div className="space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 500))}
            placeholder="Say something about the match…"
            rows={2}
            className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 tabular-nums">{body.length}/500</span>
            <button
              onClick={() => post.mutate()}
              disabled={post.isPending || body.trim().length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 px-3 py-1.5 text-xs font-bold text-cyan-100 disabled:opacity-50"
            >
              {post.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              Post
            </button>
          </div>
          {post.error && <p className="text-[11px] text-red-300">{(post.error as Error).message}</p>}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          <Link to="/auth" className="text-cyan-300 font-semibold hover:text-cyan-200 underline">Sign in</Link>{" "}
          to join the conversation.
        </p>
      )}

      {q.isLoading ? (
        <p className="text-[11px] text-gray-500">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-[11px] text-gray-500 italic">Be the first to comment.</p>
      ) : (
        <ul className="space-y-2 pt-1">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-black/30 border border-white/5 p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-cyan-200">{c.handle ?? "anonymous"}</span>
                <span className="text-[10px] text-gray-600">· {relTime(c.created_at)}</span>
                {(user?.id === c.user_id || isAdmin) && (
                  <button
                    onClick={() => del.mutate(c.id)}
                    className="ml-auto text-gray-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-200 whitespace-pre-wrap break-words">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
