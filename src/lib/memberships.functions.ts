import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
async function ensureAdmin(ctx: any) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const listMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const a = admin();
    const { data: members, error } = await a
      .from("memberships")
      .select("user_id, tier, premium_until, note, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    if (!members?.length) return [];
    const ids = members.map((m) => m.user_id);
    const { data: users } = await a.auth.admin.listUsers({ page: 1, perPage: 200 });
    const byId = new Map(users?.users.map((u) => [u.id, u.email]) ?? []);
    return members.map((m) => ({ ...m, email: byId.get(m.user_id) ?? null }));
  });

export const grantMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; tier: "supporter" | "pro"; months: number; note?: string }) => {
    const email = String(d?.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    if (!["supporter", "pro"].includes(d.tier)) throw new Error("Invalid tier");
    const months = Math.min(60, Math.max(1, Math.floor(Number(d.months) || 1)));
    return { email, tier: d.tier, months, note: (d.note ?? "").slice(0, 200) };
  })
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const a = admin();
    const { data: users } = await a.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = users?.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!user) throw new Error("No account with that email — user must sign up first.");
    const until = new Date(); until.setMonth(until.getMonth() + data.months);
    const { error } = await a.from("memberships").upsert({
      user_id: user.id,
      tier: data.tier,
      premium_until: until.toISOString(),
      granted_by: context.userId,
      note: data.note || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true, until: until.toISOString() };
  });

export const revokeMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) => d)
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const a = admin();
    const { error } = await a.from("memberships").update({ tier: "free", premium_until: null }).eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
