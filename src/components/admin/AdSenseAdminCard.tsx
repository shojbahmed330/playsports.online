import { useEffect, useState } from "react";
import { Loader2, Save, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  useAdSenseSettings,
  saveAdSenseSettings,
  DEFAULT_ADSENSE,
  type AdSenseSettings,
  type AdSenseSlotKey,
} from "@/lib/site-settings";
import { useQueryClient } from "@tanstack/react-query";

const SLOTS: { key: AdSenseSlotKey; label: string; where: string }[] = [
  { key: "header",     label: "Header banner",  where: "Top of every page" },
  { key: "in_content", label: "In-content",     where: "Between tabs & bracket on home (and any future page using <AdSlot slot=\"in_content\" />)" },
  { key: "sidebar",    label: "Sidebar",        where: "Available for future pages — <AdSlot slot=\"sidebar\" />" },
  { key: "footer",     label: "Footer banner",  where: "Bottom of every page" },
];

export function AdSenseAdminCard() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdSenseSettings();
  const [form, setForm] = useState<AdSenseSettings>(DEFAULT_ADSENSE);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const clientValid = /^ca-pub-\d{10,20}$/.test(form.client.trim());

  const save = async () => {
    if (form.enabled && !clientValid) {
      toast.error("Invalid publisher ID", { description: "Must look like ca-pub-1234567890123456" });
      return;
    }
    setSaving(true);
    try {
      await saveAdSenseSettings({
        ...form,
        client: form.client.trim(),
        slots: Object.fromEntries(
          Object.entries(form.slots).map(([k, v]) => [k, (v ?? "").trim()]),
        ) as AdSenseSettings["slots"],
      });
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 1500);
      toast.success("AdSense settings saved");
      queryClient.invalidateQueries({ queryKey: ["site_settings", "adsense"] });
    } catch (e: unknown) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-lg bg-emerald-500/15 grid place-items-center ring-1 ring-emerald-500/30 shrink-0">
          <Sparkles className="size-4 text-emerald-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Google AdSense</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Paste your publisher ID + slot IDs once. Ads then appear on every page automatically — including any page you add later that uses{" "}
            <code className="text-foreground">&lt;AdSlot /&gt;</code>.
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-xs cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="size-4 accent-emerald-500"
          />
          <span className={form.enabled ? "text-emerald-300" : "text-muted-foreground"}>
            {form.enabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {isLoading ? (
        <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
          <Loader2 className="size-3.5 animate-spin" /> Loading settings…
        </div>
      ) : (
        <>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Publisher ID (data-ad-client)
            </label>
            <input
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="ca-pub-1234567890123456"
              className={`mt-1 w-full px-3 py-2 text-sm rounded-lg bg-background border focus:outline-none font-mono ${
                form.client && !clientValid
                  ? "border-red-500/60 focus:border-red-500"
                  : "border-input focus:border-emerald-500"
              }`}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Find this in AdSense → Account → Account information.
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={form.auto_ads}
              onChange={(e) => setForm({ ...form, auto_ads: e.target.checked })}
              className="size-4 accent-emerald-500"
            />
            <span>Also enable <strong>Auto Ads</strong> (Google places extra ads automatically)</span>
          </label>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Ad slot IDs
            </div>
            {SLOTS.map((s) => (
              <div key={s.key} className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 items-start">
                <div className="text-xs">
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground">{s.where}</div>
                </div>
                <input
                  value={form.slots[s.key] ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, slots: { ...form.slots, [s.key]: e.target.value } })
                  }
                  placeholder="e.g. 1234567890"
                  className="px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-muted-foreground">
              Tip: leave a slot blank to hide that placement without disabling AdSense globally.
            </p>
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 inline-flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> :
                savedAt ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
              {savedAt ? "Saved" : "Save settings"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
