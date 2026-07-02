import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

/**
 * Ensures the signed-in user has a public handle before their name appears on
 * social surfaces. Renders inline only when a handle is missing.
 */
export function HandleSetup() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [value, setValue] = useState("");

  const q = useQuery({
    queryKey: ["public-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("public_profiles" as never)
        .select("handle")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data as { handle: string } | null) ?? null;
    },
  });

  useEffect(() => {
    if (user && !q.data && !value) {
      const seed = (user.email ?? "").split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
      setValue(seed);
    }
  }, [user, q.data, value]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const handle = value.trim();
      if (handle.length < 2 || handle.length > 24) throw new Error("2–24 characters");
      const { error } = await supabase
        .from("public_profiles" as never)
        .upsert({ user_id: user.id, handle });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["public-profile", user?.id] }),
  });

  if (!user || q.isLoading || q.data?.handle) return null;

  return (
    <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/[0.05] p-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-200 mb-2">
        Choose a public handle
      </p>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 24))}
          placeholder="your-nickname"
          className="flex-1 text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-yellow-500/50"
        />
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 px-3 py-1.5 text-xs font-bold text-yellow-100 disabled:opacity-50"
        >
          Save
        </button>
      </div>
      {save.error && <p className="mt-1 text-[11px] text-red-300">{(save.error as Error).message}</p>}
      <p className="mt-1 text-[10px] text-gray-500">Shown on predictions & comments instead of your email.</p>
    </section>
  );
}
