import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Save, ExternalLink, Loader2, Sparkles } from "lucide-react";
import {
  useAdminSponsored,
  useSaveSponsored,
  useDeleteSponsored,
  type SponsoredSlot,
  type SlotType,
} from "@/lib/affiliates";

const SLOT_TYPES: SlotType[] = ["banner", "match", "team", "league"];
const SPORTS = ["", "all", "football", "cricket", "mlb", "nba", "nhl", "mls"];

const BLANK: Partial<SponsoredSlot> = {
  slot_type: "banner",
  priority: 50,
  active: true,
};

export function SponsoredSlotsCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useAdminSponsored();
  const save = useSaveSponsored();
  const del = useDeleteSponsored();
  const [draft, setDraft] = useState<Partial<SponsoredSlot>>(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);

  const reset = () => {
    setDraft(BLANK);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!draft.title || !draft.sponsor_name || !draft.target_url) {
      toast.error("Title, sponsor, and target URL required");
      return;
    }
    try {
      await save.mutateAsync({ ...draft, id: editingId ?? undefined });
      toast.success(editingId ? "Updated" : "Added");
      reset();
      qc.invalidateQueries({ queryKey: ["admin_sponsored_slots"] });
      qc.invalidateQueries({ queryKey: ["sponsored_slots"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sponsored slot?")) return;
    await del.mutateAsync(id);
    qc.invalidateQueries({ queryKey: ["admin_sponsored_slots"] });
    qc.invalidateQueries({ queryKey: ["sponsored_slots"] });
    toast.success("Deleted");
  };

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-gold" />
          <div>
            <h2 className="text-base font-bold">Sponsored Slots</h2>
            <p className="text-xs text-muted-foreground">
              Boost matches, teams, leagues on homepage hero.
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{data?.length ?? 0} active</span>
      </div>

      <div className="rounded-xl border border-border bg-background/40 p-3 grid gap-2 sm:grid-cols-2">
        <Field label="Title" value={draft.title ?? ""} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Watch Argentina vs Brazil live" />
        <Field label="Sponsor name" value={draft.sponsor_name ?? ""} onChange={(v) => setDraft({ ...draft, sponsor_name: v })} placeholder="FanDuel" />
        <Field label="Target URL" value={draft.target_url ?? ""} onChange={(v) => setDraft({ ...draft, target_url: v })} placeholder="https://..." />
        <Field label="Sponsor logo URL" value={draft.sponsor_logo_url ?? ""} onChange={(v) => setDraft({ ...draft, sponsor_logo_url: v })} />
        <Field label="Description" value={draft.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} placeholder="Bet $5, get $200 in bonus bets" />
        <Field label="Image URL" value={draft.image_url ?? ""} onChange={(v) => setDraft({ ...draft, image_url: v })} />
        <div className="grid grid-cols-3 gap-2">
          <Select label="Slot type" value={draft.slot_type ?? "banner"} onChange={(v) => setDraft({ ...draft, slot_type: v as SlotType })} options={SLOT_TYPES} />
          <Select label="Sport" value={draft.sport ?? ""} onChange={(v) => setDraft({ ...draft, sport: v || null })} options={SPORTS} />
          <Field label="Priority" type="number" value={String(draft.priority ?? 50)} onChange={(v) => setDraft({ ...draft, priority: Number(v) || 50 })} />
        </div>
        <Field label="Ref ID (match/team/league)" value={draft.ref_id ?? ""} onChange={(v) => setDraft({ ...draft, ref_id: v || null })} placeholder="optional" />
        <Field label="Ends at (ISO, optional)" value={draft.ends_at ?? ""} onChange={(v) => setDraft({ ...draft, ends_at: v || null })} placeholder="2026-07-19T23:59:00Z" />

        <div className="sm:col-span-2 flex items-center gap-2 justify-end pt-1">
          {editingId && (
            <button onClick={reset} className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 hover:bg-gray-700">Cancel</button>
          )}
          <button
            onClick={handleSave}
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gold text-black font-semibold hover:bg-gold/90 disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : editingId ? <Save className="size-3.5" /> : <Plus className="size-3.5" />}
            {editingId ? "Update slot" : "Add slot"}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {isLoading ? (
          <div className="text-xs text-muted-foreground p-3">Loading…</div>
        ) : (data ?? []).length === 0 ? (
          <div className="text-xs text-muted-foreground p-3 text-center">No sponsored slots yet.</div>
        ) : (
          (data ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2.5 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-gold/20 text-gold uppercase tracking-wide text-[10px]">{s.slot_type}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.title}</div>
                <div className="text-muted-foreground truncate">
                  {s.sponsor_name} · {s.sport ?? "any"} · pri {s.priority}
                </div>
              </div>
              <a href={s.target_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="size-3.5" />
              </a>
              <button onClick={() => { setDraft(s); setEditingId(s.id); }} className="text-blue-400 hover:text-blue-300">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-sm focus:border-gold outline-none"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full px-2 py-1.5 rounded-lg bg-background border border-border text-sm focus:border-gold outline-none">
        {options.map((o) => (
          <option key={o} value={o}>{o || "(none)"}</option>
        ))}
      </select>
    </label>
  );
}
