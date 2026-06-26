import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Save, ExternalLink, Loader2 } from "lucide-react";
import {
  useAdminAffiliates,
  useSaveAffiliate,
  useDeleteAffiliate,
  type AffiliateLink,
  type Network,
  type Placement,
} from "@/lib/affiliates";

const NETWORKS: Network[] = ["amazon", "fanatics", "sportsbook", "generic"];
const PLACEMENTS: Placement[] = [
  "inline",
  "match_footer",
  "player_footer",
  "sidebar",
  "homepage",
];
const SPORTS = ["", "all", "football", "cricket", "mlb", "nba", "nhl", "mls"];

const BLANK: Partial<AffiliateLink> = {
  network: "amazon",
  placement: "match_footer",
  cta_label: "Shop now",
  priority: 50,
  active: true,
  sport: "all",
};

export function AffiliateLinksCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useAdminAffiliates();
  const save = useSaveAffiliate();
  const del = useDeleteAffiliate();
  const [draft, setDraft] = useState<Partial<AffiliateLink>>(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);

  const reset = () => {
    setDraft(BLANK);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!draft.title || !draft.url) {
      toast.error("Title and URL required");
      return;
    }
    try {
      await save.mutateAsync({ ...draft, id: editingId ?? undefined });
      toast.success(editingId ? "Updated" : "Added");
      reset();
      qc.invalidateQueries({ queryKey: ["admin_affiliate_links"] });
      qc.invalidateQueries({ queryKey: ["affiliate_links"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this affiliate link?")) return;
    await del.mutateAsync(id);
    qc.invalidateQueries({ queryKey: ["admin_affiliate_links"] });
    qc.invalidateQueries({ queryKey: ["affiliate_links"] });
    toast.success("Deleted");
  };

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Affiliate Links</h2>
          <p className="text-xs text-muted-foreground">
            Amazon, Fanatics, Sportsbook — auto-injected on matching pages.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{data?.length ?? 0} active</span>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-background/40 p-3 grid gap-2 sm:grid-cols-2">
        <Input
          label="Title"
          value={draft.title ?? ""}
          onChange={(v) => setDraft({ ...draft, title: v })}
          placeholder="Argentina home jersey 2026"
        />
        <Input
          label="Affiliate URL"
          value={draft.url ?? ""}
          onChange={(v) => setDraft({ ...draft, url: v })}
          placeholder="https://amzn.to/..."
        />
        <Input
          label="Description"
          value={draft.description ?? ""}
          onChange={(v) => setDraft({ ...draft, description: v })}
          placeholder="Official Adidas 2026 home kit"
        />
        <Input
          label="Image URL (optional)"
          value={draft.image_url ?? ""}
          onChange={(v) => setDraft({ ...draft, image_url: v })}
          placeholder="https://..."
        />
        <Input
          label="CTA label"
          value={draft.cta_label ?? "Shop now"}
          onChange={(v) => setDraft({ ...draft, cta_label: v })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Network"
            value={draft.network ?? "amazon"}
            onChange={(v) => setDraft({ ...draft, network: v as Network })}
            options={NETWORKS}
          />
          <Select
            label="Placement"
            value={draft.placement ?? "match_footer"}
            onChange={(v) => setDraft({ ...draft, placement: v as Placement })}
            options={PLACEMENTS}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select
            label="Sport"
            value={draft.sport ?? "all"}
            onChange={(v) => setDraft({ ...draft, sport: v || null })}
            options={SPORTS}
          />
          <Input
            label="Team slug"
            value={draft.team_slug ?? ""}
            onChange={(v) => setDraft({ ...draft, team_slug: v || null })}
            placeholder="optional"
          />
          <Input
            label="Priority"
            value={String(draft.priority ?? 50)}
            onChange={(v) => setDraft({ ...draft, priority: Number(v) || 50 })}
            type="number"
          />
        </div>
        <Input
          label="Geo restrict (CSV, e.g. US,CA)"
          value={(draft.geo_restrict ?? []).join(",")}
          onChange={(v) =>
            setDraft({
              ...draft,
              geo_restrict: v
                ? v.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
                : null,
            })
          }
          placeholder="leave blank = global"
        />
        <div className="sm:col-span-2 flex items-center gap-2 justify-end pt-1">
          {editingId && (
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg text-xs bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gold text-black font-semibold hover:bg-gold/90 disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : editingId ? <Save className="size-3.5" /> : <Plus className="size-3.5" />}
            {editingId ? "Update link" : "Add link"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="text-xs text-muted-foreground p-3">Loading…</div>
        ) : (data ?? []).length === 0 ? (
          <div className="text-xs text-muted-foreground p-3 text-center">
            No affiliate links yet.
          </div>
        ) : (
          (data ?? []).map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-background/40 p-2.5 text-xs"
            >
              <span className="px-1.5 py-0.5 rounded bg-muted uppercase tracking-wide text-[10px]">
                {l.network}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">
                {l.placement}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{l.title}</div>
                <div className="text-muted-foreground truncate">
                  {l.sport ?? "any"} · pri {l.priority} {l.geo_restrict?.length ? `· ${l.geo_restrict.join(",")}` : ""}
                </div>
              </div>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
              </a>
              <button
                onClick={() => {
                  setDraft(l);
                  setEditingId(l.id);
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(l.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
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

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-2 py-1.5 rounded-lg bg-background border border-border text-sm focus:border-gold outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o || "(none)"}</option>
        ))}
      </select>
    </label>
  );
}
