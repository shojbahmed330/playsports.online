import { LayoutDashboard, DollarSign, Mail, Video, Trophy, Settings2, type LucideIcon } from "lucide-react";

export type AdminSection = "overview" | "monetize" | "audience" | "content" | "matches" | "settings";

type Item = { key: AdminSection; label: string; Icon: LucideIcon; hint: string };

const ITEMS: Item[] = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard, hint: "At-a-glance health" },
  { key: "monetize", label: "Monetize", Icon: DollarSign,     hint: "Ads · affiliates · memberships" },
  { key: "audience", label: "Audience", Icon: Mail,           hint: "Newsletter & digest" },
  { key: "content",  label: "Content",  Icon: Video,          hint: "Videos & highlights" },
  { key: "matches",  label: "Matches",  Icon: Trophy,         hint: "World Cup video table" },
  { key: "settings", label: "Settings", Icon: Settings2,      hint: "Identity & legal" },
];

export function AdminSidebar({
  active,
  onChange,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
}) {
  return (
    <>
      {/* ===== Desktop left rail ===== */}
      <aside className="hidden lg:block w-56 shrink-0">
        <nav className="sticky top-20 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground px-3 pb-2">
            Dashboard
          </div>
          {ITEMS.map((it) => {
            const on = active === it.key;
            return (
              <button
                key={it.key}
                onClick={() => onChange(it.key)}
                className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  on
                    ? "bg-gold/15 ring-1 ring-gold/40 text-gold"
                    : "hover:bg-card text-muted-foreground hover:text-foreground ring-1 ring-transparent"
                }`}
                aria-current={on ? "page" : undefined}
              >
                <it.Icon className="size-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">{it.label}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                    {it.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ===== Mobile sticky pill scroller ===== */}
      <div className="lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 sticky top-16 z-20 bg-background/85 backdrop-blur py-2 border-b border-border">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {ITEMS.map((it) => {
            const on = active === it.key;
            return (
              <button
                key={it.key}
                onClick={() => onChange(it.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
                  on
                    ? "bg-gold/20 ring-gold/50 text-gold"
                    : "bg-card ring-border text-muted-foreground"
                }`}
              >
                <it.Icon className="size-3.5" />
                {it.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const ADMIN_ITEMS = ITEMS;
