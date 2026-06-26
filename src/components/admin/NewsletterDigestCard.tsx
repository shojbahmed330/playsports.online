import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { buildWeeklyDigest, listDigests, markDigestSent } from "@/lib/digest.functions";
import { toast } from "sonner";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";

export function NewsletterDigestCard() {
  const list = useServerFn(listDigests);
  const build = useServerFn(buildWeeklyDigest);
  const markSent = useServerFn(markDigestSent);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const q = useQuery({ queryKey: ["digest-runs"], queryFn: () => list() });

  async function onBuild() {
    setBusy(true);
    try {
      await build();
      toast.success("Weekly digest drafted");
      qc.invalidateQueries({ queryKey: ["digest-runs"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSend(id: string) {
    try {
      await markSent({ data: { id } });
      toast.success("Marked as sent (email delivery activates once sender domain is verified)");
      qc.invalidateQueries({ queryKey: ["digest-runs"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Mail className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Weekly Newsletter Digest</h2>
        </div>
        <button
          onClick={onBuild}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Build digest now
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Auto-compiles top stories (live football, WC 2026, cricket, MLB, hubs) into an HTML digest.
        Delivery activates once your sender email domain is verified.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="text-left">
              <th className="py-2">Subject</th>
              <th>Stories</th>
              <th>Recipients</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {q.data?.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="py-2 pr-2">{r.subject}</td>
                <td>{r.story_count}</td>
                <td>{r.recipient_count}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-xs ${r.status === "sent" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                <td className="text-right">
                  {r.status !== "sent" && (
                    <button onClick={() => onSend(r.id)} className="text-xs text-primary hover:underline">
                      Mark sent
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {q.data?.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No digests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
