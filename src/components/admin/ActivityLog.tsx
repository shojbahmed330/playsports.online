import { useQuery } from "@tanstack/react-query";
import { Activity, Mail, Link2, FileEdit, MessageSquare, Send, type LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminSection } from "./AdminSidebar";

type Event = {
  id: string;
  kind: "subscriber" | "affiliate" | "contact" | "digest" | "sponsored";
  title: string;
  detail: string;
  at: string;          // ISO timestamp
  section: AdminSection;
};

const ICONS: Record<Event["kind"], LucideIcon> = {
  subscriber: Mail,
  affiliate: Link2,
  contact: MessageSquare,
  digest: Send,
  sponsored: FileEdit,
};

const TONE: Record<Event["kind"], string> = {
  subscriber: "text-sky-300 bg-sky-500/10 ring-sky-500/30",
  affiliate:  "text-emerald-300 bg-emerald-500/10 ring-emerald-500/30",
  contact:    "text-violet-300 bg-violet-500/10 ring-violet-500/30",
  digest:     "text-amber-300 bg-amber-500/10 ring-amber-500/30",
  sponsored:  "text-rose-300 bg-rose-500/10 ring-rose-500/30",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ActivityLog({ onJump }: { onJump: (s: AdminSection) => void }) {
  const q = useQuery({
    queryKey: ["admin", "activity_log"],
    refetchInterval: 60_000,
    staleTime: 30_000,
    queryFn: async (): Promise<Event[]> => {
      // Pull recent rows from each table in parallel; ignore individual failures
      // so a single permission/missing-table issue doesn't blank the panel.
      const [subs, aff, contact, digest, spons] = await Promise.all([
        supabase
          .from("newsletter_subscribers")
          .select("id, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
          .then((r) => r.data ?? []),
        supabase
          .from("affiliate_links")
          .select("id, title, network, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then((r) => r.data ?? []),
        supabase
          .from("contact_messages")
          .select("id, name, subject, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
          .then((r) => r.data ?? []),
        supabase
          .from("digest_runs")
          .select("id, subject, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
          .then((r) => r.data ?? []),
        supabase
          .from("sponsored_slots")
          .select("id, title, slot_type, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5)
          .then((r) => r.data ?? []),
      ]);

      const events: Event[] = [
        ...subs.map((s): Event => ({
          id: `sub-${s.id}`, kind: "subscriber",
          title: "Newsletter signup", detail: s.email ?? "",
          at: s.created_at, section: "audience",
        })),
        ...aff.map((a): Event => ({
          id: `aff-${a.id}`, kind: "affiliate",
          title: `Affiliate updated · ${a.network}`,
          detail: a.title ?? "",
          at: a.updated_at, section: "monetize",
        })),
        ...contact.map((c): Event => ({
          id: `cm-${c.id}`, kind: "contact",
          title: `Contact: ${c.subject ?? "Message"}`,
          detail: c.name ?? "",
          at: c.created_at, section: "audience",
        })),
        ...digest.map((d): Event => ({
          id: `dg-${d.id}`, kind: "digest",
          title: `Digest · ${d.status ?? "draft"}`,
          detail: d.subject ?? "",
          at: d.created_at, section: "audience",
        })),
        ...spons.map((s): Event => ({
          id: `sp-${s.id}`, kind: "sponsored",
          title: `Sponsored · ${s.slot_type}`,
          detail: s.title ?? "",
          at: s.updated_at, section: "monetize",
        })),
      ];

      return events
        .filter((e) => !!e.at)
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 12);
    },
  });

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-gold" />
          <h3 className="text-sm font-semibold">Recent activity</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Auto-refresh · 60s
        </span>
      </div>

      {q.isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading activity…</div>
      ) : (q.data?.length ?? 0) === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Nothing yet. Subscribers, contact messages and admin edits will appear here.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {q.data!.map((e) => {
            const Icon = ICONS[e.kind];
            return (
              <li key={e.id}>
                <button
                  onClick={() => onJump(e.section)}
                  className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/30 rounded-lg px-2 -mx-2 transition"
                >
                  <span className={`size-7 grid place-items-center rounded-md ring-1 shrink-0 ${TONE[e.kind]}`}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{e.title}</div>
                    {e.detail && (
                      <div className="text-[11px] text-muted-foreground truncate">{e.detail}</div>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                    {timeAgo(e.at)}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
