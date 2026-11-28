import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, ExternalLink, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  getCryptoPaymentConfig,
  listMyCryptoPayments,
  submitCryptoPayment,
  type CryptoPaymentRequest,
} from "@/lib/crypto-payments.functions";

const PLANS = [1, 3, 6, 12];

export function CryptoCheckout() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const configFn = useServerFn(getCryptoPaymentConfig);
  const listFn = useServerFn(listMyCryptoPayments);
  const submitFn = useServerFn(submitCryptoPayment);

  const configQ = useQuery({ queryKey: ["crypto-payments", "config"], queryFn: () => configFn() });
  const mineQ = useQuery({
    queryKey: ["crypto-payments", "mine", session?.user?.id],
    queryFn: () => listFn(),
    enabled: !!session,
  });

  const [months, setMonths] = useState(3);
  const [txHash, setTxHash] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = configQ.data;
  const price = (config?.monthlyUsd ?? 3) * months;

  async function copyWallet() {
    if (!config?.wallet) return;
    try {
      await navigator.clipboard.writeText(config.wallet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Select the address manually.");
    }
  }

  async function submit() {
    if (!session) return;
    setBusy(true);
    try {
      const res = await submitFn({ data: { planMonths: months, txHash, note } });
      toast.success(`Payment of ${res.amount} USDT submitted — awaiting admin review.`);
      setTxHash("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["crypto-payments", "mine"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit payment.");
    } finally {
      setBusy(false);
    }
  }

  if (configQ.isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />;
  }

  if (!config?.enabled || !config.wallet || !config.tableReady) {
    return (
      <section id="crypto-checkout" className="rounded-2xl border border-border bg-card/50 p-6">
        <h2 className="text-h3 text-foreground">Crypto payment</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          USDT BEP20 checkout is being set up. Please check back shortly or contact support.
        </p>
      </section>
    );
  }

  if (!session) {
    return (
      <section id="crypto-checkout" className="rounded-2xl border border-border bg-card/50 p-6">
        <h2 className="text-h3 text-foreground">Pay with USDT (BEP20)</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in first so we can attach the payment to your account.</p>
        <Link
          to="/auth"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
        >
          Sign in to continue
        </Link>
      </section>
    );
  }

  return (
    <section id="crypto-checkout" className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Wallet className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-h3 text-foreground">Pay with USDT (BEP20)</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Send the exact amount to the wallet below, then submit the transaction hash. An admin verifies it manually.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PLANS.map((m) => {
            const active = months === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                aria-pressed={active}
                className={`min-h-11 rounded-xl border px-3 text-sm font-bold transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {m} {m === 1 ? "month" : "months"}
                <span className="block text-caption font-semibold text-primary">${(config.monthlyUsd * m).toFixed(0)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-micro font-bold uppercase tracking-wider text-muted-foreground">Network</span>
            <span className="rounded-full bg-positive/15 px-2 py-1 text-micro font-bold text-positive">USDT · BEP20 (BNB Smart Chain)</span>
          </div>
          <div className="mt-3 break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-foreground">{config.wallet}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Exact amount: <strong className="text-foreground">${price.toFixed(2)} USDT</strong>
            </span>
            <button
              type="button"
              onClick={copyWallet}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold hover:bg-accent"
            >
              {copied ? <Check className="size-3.5 text-positive" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy wallet"}
            </button>
          </div>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-caption text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-positive" aria-hidden="true" />
          Send USDT on BEP20 only. Wrong network or token can permanently lose funds.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-caption font-semibold text-foreground">Transaction hash</span>
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x…"
              maxLength={66}
              className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block">
            <span className="text-caption font-semibold text-foreground">Note (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the admin should know"
              maxLength={300}
              className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={busy || txHash.trim().length < 10}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Submit for review
          </button>
        </div>
      </div>

      {(mineQ.data?.length ?? 0) > 0 && <PaymentHistory items={mineQ.data ?? []} />}
    </section>
  );
}

function PaymentHistory({ items }: { items: CryptoPaymentRequest[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your payments</h3>
      <ul className="mt-3 divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <div className="min-w-0">
              <div className="font-semibold text-foreground">
                ${Number(p.amount_usdt).toFixed(2)} USDT · {p.plan_months} {p.plan_months === 1 ? "month" : "months"}
              </div>
              <a
                href={`https://bscscan.com/tx/${p.tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-caption text-primary hover:underline"
              >
                {p.tx_hash.slice(0, 12)}… <ExternalLink className="size-3" />
              </a>
              {p.admin_note && <div className="text-caption text-muted-foreground">Admin: {p.admin_note}</div>}
            </div>
            <span
              className={`rounded-full px-2 py-1 text-micro font-bold uppercase ${
                p.status === "approved"
                  ? "bg-positive/15 text-positive"
                  : p.status === "rejected"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-gold/15 text-gold"
              }`}
            >
              {p.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
