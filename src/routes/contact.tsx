import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Send, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LegalLayout } from "@/components/site/LegalLayout";
import { useContactSettings } from "@/lib/site-settings";
import { submitContactMessage } from "@/lib/contact.functions";

const URL = "https://www.playsports.online/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PlaySports" },
      { name: "description", content: "Get in touch with the PlaySports team." },
      { property: "og:title", content: "Contact — PlaySports" },
      { property: "og:url", content: URL },
      { property: "og:description", content: "Get in touch with the PlaySports team." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact — PlaySports" },
      { name: "twitter:description", content: "Get in touch with the PlaySports team." },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Page,
});

function Page() {
  const { data: settings } = useContactSettings();
  const send = useServerFn(submitContactMessage);
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "", hp: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await send({ data: form });
      setDone(true);
      setForm({ name: "", email: "", subject: "", body: "", hp: "" });
      toast.success("Message sent — thanks!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Try again later";
      setFormError(message);
      toast.error("Send failed", { description: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <LegalLayout
      title="Contact"
      intro={settings?.response_time ?? "We reply within 2 business days."}
    >
      {settings?.email && (
        <p className="text-sm">
          Prefer email? Reach us at{" "}
          <a
            href={`mailto:${settings.email}`}
            className="inline-flex min-h-11 items-center text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {settings.email}
          </a>
          .
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.hp}
          onChange={(e) => setForm({ ...form, hp: e.target.value })}
          className="hidden"
          aria-hidden
        />
        {formError && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {formError}
          </p>
        )}
        {done && !busy && (
          <p role="status" className="text-sm text-emerald-500">
            Thanks — your message has been sent.
          </p>
        )}
        <Field label="Your name">
          <input
            required
            name="name"
            autoComplete="name"
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            name="email"
            autoComplete="email"
            maxLength={255}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Subject (optional)">
          <input
            name="subject"
            maxLength={200}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Message">
          <textarea
            required
            name="body"
            maxLength={4000}
            rows={6}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : done ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          {busy ? "Sending…" : done ? "Sent" : "Send message"}
        </button>
      </form>
    </LegalLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
