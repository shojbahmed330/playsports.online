import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export type Membership = {
  tier: "free" | "supporter" | "pro";
  premium_until: string | null;
  active: boolean;
};

export function useMembership(): { membership: Membership; loading: boolean } {
  const { session, loading: authLoading } = useAuth();
  const [m, setM] = useState<Membership>({ tier: "free", premium_until: null, active: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user.id) { setLoading(false); return; }
    let alive = true;
    supabase
      .from("memberships")
      .select("tier, premium_until")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        const tier = (data?.tier as Membership["tier"]) ?? "free";
        const until = data?.premium_until ?? null;
        const active = tier !== "free" && (!until || new Date(until) > new Date());
        setM({ tier, premium_until: until, active });
        setLoading(false);
      });
    return () => { alive = false; };
  }, [session?.user.id, authLoading]);

  return { membership: m, loading };
}
