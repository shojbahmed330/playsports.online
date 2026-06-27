import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

type Body = { kind?: "affiliate" | "sponsored"; id?: string };

export const Route = createFileRoute("/api/public/track-click")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Body;
          const id = String(body.id ?? "").trim();
          const kind = body.kind === "sponsored" ? "sponsored" : "affiliate";
          if (!id || id.length > 64) {
            return Response.json({ ok: false, error: "bad id" }, { status: 400, headers: CORS });
          }
          const admin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          if (kind === "affiliate") {
            const { data: cur } = await admin
              .from("affiliate_links")
              .select("click_count")
              .eq("id", id)
              .maybeSingle();
            const next = ((cur?.click_count as number | null) ?? 0) + 1;
            await admin.from("affiliate_links").update({ click_count: next }).eq("id", id);
          } else {
            const { data: cur } = await admin
              .from("sponsored_slots")
              .select("clicks")
              .eq("id", id)
              .maybeSingle();
            const next = ((cur?.clicks as number | null) ?? 0) + 1;
            await admin.from("sponsored_slots").update({ clicks: next }).eq("id", id);
          }
          return Response.json({ ok: true }, { headers: CORS });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          return Response.json({ ok: false, error: msg }, { status: 500, headers: CORS });
        }
      },
    },
  },
});
