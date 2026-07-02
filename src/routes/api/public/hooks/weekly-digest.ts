import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://www.playsports.online";

export const Route = createFileRoute("/api/public/hooks/weekly-digest")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const subject = `PlaySports Weekly — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
          const html = `<p>See top stories at <a href="${SITE}">${SITE}</a></p>`;
          const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { count } = await admin
            .from("newsletter_subscribers")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");
          await admin.from("digest_runs").insert({
            subject,
            html,
            story_count: 0,
            recipient_count: count ?? 0,
            status: "draft",
          });
          return Response.json({ ok: true });
        } catch (e: any) {
          return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
        }
      },
    },
  },
});
