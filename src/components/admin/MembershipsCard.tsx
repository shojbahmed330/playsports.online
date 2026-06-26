import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMembers, grantMembership, revokeMembership } from "@/lib/memberships.functions";
import { Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function MembershipsCard() {
  const list = useServerFn(listMembers);
  const grant = useServerFn(grantMembership);
  const revoke = useServerFn(revokeMembership);
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<"supporter" | "pro">("supporter");
  const [months, setMonths] = useState(12);
  const [busy, setBusy] = useState(false);

  const q = useQuery({ queryKey: ["memberships"], queryFn: () => list() });

  async function onGrant() {
    setBusy(true);
    try {
      await grant({ data: { email, tier, months } });
      toast.success("Membership granted");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["memberships"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally { setBusy(false); }
  }

  async function onRevoke(user_id: string) {
    if (!confirm("Revoke this membership?")) return;
    try {
      await revoke({ data: { user_id } });
      qc.invalidateQueries({ queryKey: ["memberships"] });
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
  }

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="size-5 text-amber-400" />
        <h2 className="text-lg font-semibold">Memberships</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@email.com"
          className="sm:col-span-2 px-3 py-2 rounded-lg bg-background border border-border text-sm"
        />
        <select value={tier} onChange={(e) => setTier(e.target.value as any)} className="px-3 py-2 rounded-lg bg-background border border-border text-sm">
          <option value="supporter">Supporter</option>
          <option value="pro">Pro</option>
        </select>
        <input
          type="number" min={1} max={60} value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
        />
      </div>
      <button onClick={onGrant} disabled={busy || !email} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
        {busy && <Loader2 className="size-4 animate-spin" />} Grant membership
      </button>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="text-left">
              <th className="py-2">Email</th><th>Tier</th><th>Until</th><th></th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
            {q.data?.map((m: any) => (
              <tr key={m.user_id} className="border-t border-border/40">
                <td className="py-2">{m.email ?? m.user_id.slice(0, 8)}</td>
                <td><span className="px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-400">{m.tier}</span></td>
                <td className="text-xs text-muted-foreground">{m.premium_until ? new Date(m.premium_until).toLocaleDateString() : "—"}</td>
                <td className="text-right">
                  {m.tier !== "free" && <button onClick={() => onRevoke(m.user_id)} className="text-xs text-destructive hover:underline">Revoke</button>}
                </td>
              </tr>
            ))}
            {q.data?.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No paid members yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
