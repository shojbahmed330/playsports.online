import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { ADMIN_ITEMS, type AdminSection } from "./AdminSidebar";

type Entry = {
  id: string;
  label: string;
  section: AdminSection;
  group: string;
  keywords: string;
};

// Curated index of every card/feature available in the admin.
// Anything searchable lives here — keep labels short & natural.
const ENTRIES: Entry[] = [
  // Overview
  { id: "kpi",          label: "Overview & KPIs",        section: "overview", group: "Dashboard",    keywords: "stats health summary home" },
  // Monetize
  { id: "adsense",      label: "Google AdSense",         section: "monetize", group: "Monetize",     keywords: "ads adsense publisher slot" },
  { id: "affiliates",   label: "Affiliate links",        section: "monetize", group: "Monetize",     keywords: "amazon gambling commission link tracking" },
  { id: "sponsored",    label: "Sponsored slots",        section: "monetize", group: "Monetize",     keywords: "sponsor placement promo banner" },
  { id: "memberships",  label: "Memberships",            section: "monetize", group: "Monetize",     keywords: "subscription paid tier supporter" },
  // Audience
  { id: "newsletter",   label: "Newsletter & digest",    section: "audience", group: "Audience",     keywords: "subscribers email resend digest weekly" },
  // Content
  { id: "seed",         label: "Auto-seed match videos", section: "content",  group: "Content",      keywords: "youtube seed dataset bulk import" },
  { id: "highlights",   label: "WC 2026 highlights",     section: "content",  group: "Content",      keywords: "robi axiata video clip world cup 2026" },
  // Matches
  { id: "matches",      label: "World Cup match library", section: "matches", group: "Matches",      keywords: "wc world cup video url paste edit" },
  // Settings
  { id: "settings",     label: "Site settings & analytics", section: "settings", group: "Settings",  keywords: "ga4 google analytics consent identity legal monetization" },
];

export function CommandPalette({
  open,
  onClose,
  onJump,
}: {
  open: boolean;
  onClose: () => void;
  onJump: (section: AdminSection) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pin sections (from sidebar) above feature entries for quick jumps.
  const filtered = useMemo(() => {
    const sectionEntries: Entry[] = ADMIN_ITEMS.map((it) => ({
      id: `sec-${it.key}`,
      label: it.label,
      section: it.key,
      group: "Sections",
      keywords: it.hint,
    }));
    const all = [...sectionEntries, ...ENTRIES];
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((e) =>
      (e.label + " " + e.group + " " + e.keywords).toLowerCase().includes(needle),
    );
  }, [q]);

  // Group results, preserving order.
  const grouped = useMemo(() => {
    const out: { group: string; items: Entry[] }[] = [];
    for (const e of filtered) {
      const last = out[out.length - 1];
      if (last && last.group === e.group) last.items.push(e);
      else out.push({ group: e.group, items: [e] });
    }
    return out;
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      // focus on next tick to avoid Radix focus traps fighting us
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = filtered[active];
        if (hit) {
          onJump(hit.section);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, onClose, onJump]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick jump"
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections, cards, settings…"
            className="flex-1 bg-transparent py-3.5 text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No matches for “{q}”.
            </div>
          ) : (
            grouped.map((g) => (
              <div key={g.group} className="mb-2 last:mb-0">
                <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {g.group}
                </div>
                {g.items.map((it) => {
                  runningIndex++;
                  const isActive = runningIndex === active;
                  return (
                    <button
                      key={it.id}
                      onMouseEnter={() => setActive(runningIndex)}
                      onClick={() => { onJump(it.section); onClose(); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition ${
                        isActive ? "bg-gold/15 text-gold" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-sm font-medium">{it.label}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {it.section}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><ArrowUp className="size-3" /><ArrowDown className="size-3" /> navigate</span>
            <span className="inline-flex items-center gap-1"><CornerDownLeft className="size-3" /> open</span>
          </div>
          <span>Quick jump</span>
        </div>
      </div>
    </div>
  );
}
