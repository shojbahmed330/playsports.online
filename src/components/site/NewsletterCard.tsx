import { useState } from "react";
import { Loader2, Check, Mail } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useNewsletterSettings } from "@/lib/site-settings";
import { subscribeNewsletter } from "@/lib/subscribe.functions";

export function NewsletterCard({ source = "homepage" }: { source?: string }) {
  const { data } = useNewsletterSettings();
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!data?.enabled) return null;

  if (data.mode === "beehiiv" && data.beehiiv_pub_id) {
    return (
      <section className="mx-auto max-w-3xl px-4 my-8">
        <div className="rounded-2xl border border-border bg-card/40 p-4">
          <iframe
            src={`https://embeds.beehiiv.com/${data.beehiiv_pub_id}`}
            title="Subscribe"
            className="w-full"
            style={{ height: 320, border: 0, background: "transparent" }}
          />
        </div>
      </section>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await subscribe({ data: { email, source, hp } });
      if (res?.ok) {
        setDone(true);
        setEmail("");
        toast.success(res.already ? "You're already on the list" : "Subscribed — see you tomorrow!");
      }
    } catch (err) {
      toast.error("Subscribe failed", {
        description: err instanceof Error ? err.message : "Try again later",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 my-8">
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card/40 to-transparent p-5 sm:p-6">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-widest">
          <Mail className="size-3.5" /> Newsletter
        </div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold">{data.headline}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{data.sub}</p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          {/* honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            aria-hidden
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || done}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : done ? (
              <>
                <Check className="size-4" /> Subscribed
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          One email a day. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
