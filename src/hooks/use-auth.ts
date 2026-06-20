import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  const checkRole = useCallback(async (userId: string | undefined) => {
    if (!userId) { setIsAdmin(false); return; }
    setRoleLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setRoleLoading(false);
    if (error) { setIsAdmin(false); return; }
    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
      if (data.session?.user.id) checkRole(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(s ?? null);
      if (s?.user.id) checkRole(s.user.id);
      else setIsAdmin(false);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [checkRole]);

  return { session, user: session?.user ?? null, loading, isAdmin, roleLoading };
}
