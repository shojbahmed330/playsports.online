import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, ExternalLink, Loader2, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import {
  getCryptoPaymentConfig,
  listCryptoPayments,
  reviewCryptoPayment,
  saveCryptoPaymentConfig,
  type CryptoPaymentRequest,
} from "@/lib/crypto-payments.functions";

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export function CryptoPaymentsCard() {
  const qc = useQueryClient();
  const configFn = useServerFn(getCryptoPaymentConfig);
  const saveFn = useServerFn(saveCryptoPaymentConfig);
  const listFn = useServerFn(listCryptoPayments);
  const reviewFn = useServerFn(reviewCryptoPayment);

  const configQ = useQuery({ queryKey: ["crypto-payments", "config"], queryFn: () => configFn() });
  const listQ = useQuery({ queryKey: ["crypto-payments", "admin"], queryFn: () => listFn() });

  const [enabled, setEnabled] = useState(false);
  const [wallet, setWallet] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!configQ.data) return;
    setEnabled(configQ.data.enabled);
    setWallet(configQ.data.wallet);
  }, [configQ.data]);

  async function saveConfig() {
    setSaving(true);
    try {
      await saveFn({ data: { enabled, wallet } });
      toast.success("Crypto payment settings saved");
      qc.invalidateQueries({ queryKey: ["crypto-payments", "config"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  }

  async function review(id: string, action: "approve" | "reject") {
    const note =
      action === "reject" ? window.prompt("Reason for rejection (optional)") ?? "" : "";
    try {
      const res = await reviewFn({ data: { id, action, note } });
      toast.success(
        action === "approve"
          ? `Approved${res.until ? ` until ${new Date(res.until).toLocaleDateString("en-GB")}` : ""}`
          : "Payment rejected",
      );
      qc.invalidateQueries({ queryKey: ["crypto-payments", "admin"] });
      qc.invalidateQueries({ queryKey: ["memberships"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Review failed");
    }
  }

  const rows = listQ.data ?? [];
  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending").slice(0, 12);

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Wallet className="size-5 text-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Crypto payments · USDT BEP20</h2>
      </div>

      {configQ.data && !configQ.data.tableReady && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Database table is missing. Apply <code>supabase/migrations/20261128190000_crypto_payments.sql</code> in the
          Supabase SQL editor, then reload this page.
        </div>
      )}

      <div className="rounded-xl border border-border bg-background/40 p-4 space-y-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-4 accent-primary"
          />
          Enable USDT BEP20 checkout
        </label>
        <label className="block">
          <span className="text-micro font-bold uppercase tracking-wider text-muted-foreground">
            BEP20 wallet address
          </span>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
            className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <p className="text-caption text-muted-foreground">
          BNB Smart Chain (BEP20) only. Use a wallet address you control; the address is public on the premium page.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={saveConfig}
            disabled={saving || (enabled && !WALLET_RE.test(wallet))}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />} Save settings
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold hover:bg-accent"
          >
            {copied ? <Check className="size-3.5 text-positive" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy address"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Pending verification ({pending.length})
        </h3>
        {listQ.isLoading ? (
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        ) : pending.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No pending crypto payments.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {pending.map((p) => (
              <li key={p.id} className="py-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 text-sm">
                    <div className="font-semibold text-foreground">
                      {p.email ?? p.user_id.slice(0, 8)} · ${Number(p.amount_usdt).toFixed(2)} USDT ·{" "}
                      {p.plan_months} {p.plan_months === 1 ? "month" : "months"}
                    </div>
                    <a
                      href={`https://bscscan.com/tx/${p.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-caption text-primary hover:underline"
                    >
                      {p.tx_hash.slice(0, 16)}… <ExternalLink className="size-3" />
                    </a>
                    <div className="text-caption text-muted-foreground">
                      {new Date(p.created_at).toLocaleString("en-GB")}
                      {p.user_note ? ` · ${p.user_note}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => review(p.id, "approve")}
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-positive/15 px-3 text-xs font-bold text-positive hover:bg-positive/25"
                    >
                      <Check className="size-3.5" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => review(p.id, "reject")}
                      className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-destructive/15 px-3 text-xs font-bold text-destructive hover:bg-destructive/25"
                    >
                      <X className="size-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent reviews</h3>
          <ul className="mt-2 divide-y divide-border text-sm">
            {history.map((p: CryptoPaymentRequest) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate">
                  {p.email ?? p.user_id.slice(0, 8)} · ${Number(p.amount_usdt).toFixed(2)} · {p.plan_months} mo
                </span>
                <span
                  className={
                    p.status === "approved"
                      ? "text-xs font-bold uppercase text-positive"
                      : "text-xs font-bold uppercase text-destructive"
                  }
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-caption text-muted-foreground">
        If the table is missing, apply <code>supabase/migrations/20261128190000_crypto_payments.sql</code> in the
        Supabase SQL editor first.
      </p>
    </div>
  );
}
