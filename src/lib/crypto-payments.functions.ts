import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";

export type CryptoPaymentConfig = {
  enabled: boolean;
  wallet: string;
  monthlyUsd: number;
  network: "BEP20";
  tableReady: boolean;
};

export type CryptoPaymentRequest = {
  id: string;
  user_id: string;
  plan_months: number;
  amount_usdt: number;
  network: string;
  wallet_address: string;
  tx_hash: string;
  status: "pending" | "approved" | "rejected";
  user_note: string | null;
  admin_note: string | null;
  reviewed_at: string | null;
  membership_until: string | null;
  created_at: string;
  email?: string | null;
};

const DEFAULT_CONFIG: CryptoPaymentConfig = {
  enabled: false,
  wallet: "",
  monthlyUsd: 3,
  network: "BEP20",
  tableReady: false,
};

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
const TX_RE = /^0x[a-f0-9]{64}$/;
const PLANS = [1, 3, 6, 12];

function admin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAdmin(ctx: any) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

async function readConfig(): Promise<CryptoPaymentConfig> {
  try {
    const a = admin();
    const { data } = await a
      .from("site_settings")
      .select("value")
      .eq("key", "crypto_payments")
      .maybeSingle();
    const v = (data?.value ?? {}) as Record<string, unknown>;
    const { error: tableError } = await a.from("crypto_payments").select("id").limit(1);
    const tableReady = !(
      tableError &&
      (tableError.code === "42P01" || tableError.code === "PGRST205")
    );
    return {
      enabled: v.enabled === true,
      wallet: typeof v.wallet === "string" ? v.wallet.trim() : "",
      monthlyUsd: Number(v.monthlyUsd) > 0 ? Number(v.monthlyUsd) : 3,
      network: "BEP20",
      tableReady,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export const getCryptoPaymentConfig = createServerFn({ method: "GET" }).handler(async () =>
  readConfig(),
);

export const saveCryptoPaymentConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { enabled: boolean; wallet: string }) => ({
    enabled: d.enabled === true,
    wallet: String(d.wallet ?? "").trim(),
  }))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    if (data.enabled && !WALLET_RE.test(data.wallet)) {
      throw new Error("Enter a valid BEP20 wallet address (0x + 40 hex characters).");
    }
    const a = admin();
    const value = {
      enabled: data.enabled,
      wallet: data.wallet,
      monthlyUsd: 3,
      network: "BEP20",
    };
    const { error } = await a
      .from("site_settings")
      .upsert({ key: "crypto_payments", value, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitCryptoPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planMonths: number; txHash: string; note?: string }) => ({
    planMonths: Math.floor(Number(d.planMonths) || 0),
    txHash: String(d.txHash ?? "").trim().toLowerCase(),
    note: String(d.note ?? "").trim().slice(0, 300),
  }))
  .handler(async ({ data, context }) => {
    if (!PLANS.includes(data.planMonths)) throw new Error("Choose a valid plan.");
    if (!TX_RE.test(data.txHash)) throw new Error("Enter a valid BEP20 transaction hash.");

    const cfg = await readConfig();
    if (!cfg.enabled || !cfg.wallet) {
      throw new Error("Crypto checkout is not configured yet. Please try again later.");
    }

    const a = admin();
    const { count } = await a
      .from("crypto_payments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("status", "pending");
    if ((count ?? 0) >= 5) throw new Error("You already have 5 payments awaiting review.");

    const { data: existing } = await a
      .from("crypto_payments")
      .select("id")
      .eq("tx_hash", data.txHash)
      .maybeSingle();
    if (existing) throw new Error("This transaction hash has already been submitted.");

    const amount = Math.round(data.planMonths * cfg.monthlyUsd * 100) / 100;
    const { data: row, error } = await a
      .from("crypto_payments")
      .insert({
        user_id: context.userId,
        plan_months: data.planMonths,
        amount_usdt: amount,
        network: "BEP20",
        wallet_address: cfg.wallet,
        tx_hash: data.txHash,
        status: "pending",
        user_note: data.note || null,
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("This transaction hash has already been submitted.");
      if (error.code === "42P01" || error.code === "PGRST205" || /crypto_payments/.test(error.message)) {
        throw new Error("Crypto payments are not set up yet. Ask the admin to apply migration 020.");
      }
      throw new Error(error.message);
    }
    return { ok: true, id: row?.id, amount, wallet: cfg.wallet, network: cfg.network };
  });

export const listMyCryptoPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = admin();
    const { data, error } = await a
      .from("crypto_payments")
      .select(
        "id,user_id,plan_months,amount_usdt,network,wallet_address,tx_hash,status,user_note,admin_note,reviewed_at,membership_until,created_at",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || /crypto_payments/.test(error.message)) return [];
      throw new Error(error.message);
    }
    return (data ?? []) as unknown as CryptoPaymentRequest[];
  });

export const listCryptoPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const a = admin();
    const { data, error } = await a
      .from("crypto_payments")
      .select(
        "id,user_id,plan_months,amount_usdt,network,wallet_address,tx_hash,status,user_note,admin_note,reviewed_at,membership_until,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      if (error.code === "42P01" || /crypto_payments/.test(error.message)) return [];
      throw new Error(error.message);
    }
    const { data: users } = await a.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const byId = new Map(users?.users.map((u) => [u.id, u.email]) ?? []);
    return (data ?? []).map((r) => ({
      ...(r as unknown as CryptoPaymentRequest),
      email: byId.get(r.user_id) ?? null,
    }));
  });

export const reviewCryptoPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; action: "approve" | "reject"; note?: string }) => ({
    id: String(d.id ?? ""),
    action: d.action === "approve" ? "approve" : "reject",
    note: String(d.note ?? "").trim().slice(0, 300),
  }))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const a = admin();
    const { data: payment, error } = await a
      .from("crypto_payments")
      .select("id,user_id,plan_months,status,tx_hash")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!payment) throw new Error("Payment not found.");
    if (payment.status !== "pending") throw new Error("This payment is already reviewed.");

    if (data.action === "reject") {
      const { error: rejectError } = await a
        .from("crypto_payments")
        .update({
          status: "rejected",
          admin_note: data.note || null,
          reviewed_by: context.userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
      if (rejectError) throw new Error(rejectError.message);
      return { ok: true, status: "rejected" as const };
    }

    const now = new Date();
    const { data: membership } = await a
      .from("memberships")
      .select("premium_until")
      .eq("user_id", payment.user_id)
      .maybeSingle();
    const current = membership?.premium_until ? new Date(membership.premium_until) : null;
    const base = current && current > now ? current : now;
    const until = new Date(base);
    until.setMonth(until.getMonth() + payment.plan_months);

    const { error: memberError } = await a.from("memberships").upsert({
      user_id: payment.user_id,
      tier: "supporter",
      premium_until: until.toISOString(),
      granted_by: context.userId,
      note: `USDT BEP20 payment ${payment.tx_hash.slice(0, 12)}…`,
    });
    if (memberError) throw new Error(memberError.message);

    const { error: paymentError } = await a
      .from("crypto_payments")
      .update({
        status: "approved",
        admin_note: data.note || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
        membership_until: until.toISOString(),
      })
      .eq("id", payment.id);
    if (paymentError) throw new Error(paymentError.message);

    return { ok: true, status: "approved" as const, until: until.toISOString() };
  });
