import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SITE = "https://allsportslive.lovable.app";

function adminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Story = { eyebrow: string; title: string; blurb: string; href: string };

async function collectTopStories(): Promise<Story[]> {
  const stories: Story[] = [];
  // Live football
  try {
    const r = await fetch(`${SITE}/api/public/live/football`).catch(() => null);
    if (r?.ok) {
      const j: any = await r.json();
      const live = (j?.matches ?? []).slice(0, 2);
      for (const m of live) {
        stories.push({
          eyebrow: "⚽ Live",
          title: `${m.home ?? "Home"} vs ${m.away ?? "Away"}`,
          blurb: m.status ?? "Live now",
          href: `${SITE}/football`,
        });
      }
    }
  } catch {}
  // Hub picks
  stories.push(
    {
      eyebrow: "🏆 World Cup 2026",
      title: "Knockout bracket & live fixtures",
      blurb: "Group standings, R32 matrix, predicted R16→Final paths.",
      href: `${SITE}/football`,
    },
    {
      eyebrow: "🏏 Cricket",
      title: "Live series & player profiles",
      blurb: "Bilateral tours, IPL, all-format career stats from ESPNcricinfo.",
      href: `${SITE}/cricket`,
    },
    {
      eyebrow: "⚾ MLB",
      title: "Leaders, scores & postseason",
      blurb: "Batting & pitching leaderboards across 23 categories.",
      href: `${SITE}/mlb`,
    },
    {
      eyebrow: "🏀 NBA / 🏒 NHL / ⚽ MLS",
      title: "Cross-sport hubs",
      blurb: "Today's slate, standings, and player pages.",
      href: `${SITE}`,
    },
  );
  return stories.slice(0, 6);
}

function renderHtml(stories: Story[], unsubUrl: string) {
  const items = stories
    .map(
      (s) => `
    <tr><td style="padding:14px 0;border-bottom:1px solid #1f2937;">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#60a5fa;margin-bottom:4px;">${s.eyebrow}</div>
      <a href="${s.href}" style="color:#f8fafc;font-size:18px;font-weight:700;text-decoration:none;">${s.title}</a>
      <div style="color:#94a3b8;font-size:14px;margin-top:4px;">${s.blurb}</div>
    </td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#0b1220;font-family:ui-sans-serif,system-ui,Arial;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;padding:32px 24px;">
      <tr><td><h1 style="margin:0 0 4px;font-size:24px;color:#fff;">AllSportsLive — Weekly Digest</h1>
        <div style="color:#94a3b8;font-size:13px;">Top stories from across the world of sport</div></td></tr>
      ${items}
      <tr><td style="padding-top:24px;font-size:12px;color:#64748b;">
        You're receiving this because you subscribed at allsportslive.lovable.app.<br/>
        <a href="${unsubUrl}" style="color:#94a3b8;">Unsubscribe</a> · <a href="${SITE}" style="color:#94a3b8;">Visit site</a>
      </td></tr>
    </table></td></tr></table></body></html>`;
}

/** Build a digest and store as draft. Returns the digest row. */
export const buildWeeklyDigest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    const stories = await collectTopStories();
    const subject = `AllSportsLive Weekly — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const html = renderHtml(stories, `${SITE}/unsubscribe?token=PLACEHOLDER`);
    const admin = adminClient();
    const { count } = await admin
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    const { data, error } = await admin
      .from("digest_runs")
      .insert({
        subject,
        html,
        story_count: stories.length,
        recipient_count: count ?? 0,
        status: "draft",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

/** Mark a digest as sent. Email infra wiring lands when sender domain is configured. */
export const markDigestSent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    const admin = adminClient();
    const { data: row, error } = await admin
      .from("digest_runs")
      .update({ status: "sent", sent_at: new Date().toISOString(), sent_count: 0 })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listDigests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("digest_runs")
      .select("id,subject,story_count,recipient_count,sent_count,status,created_at,sent_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const unsubscribeByToken = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(d?.token ?? "")) throw new Error("Invalid token");
    return d;
  })
  .handler(async ({ data }) => {
    const admin = adminClient();
    const { data: row, error } = await admin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed" })
      .eq("unsubscribe_token", data.token)
      .select("email")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: !!row, email: row?.email ?? null };
  });
