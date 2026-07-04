import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        let body = "";
        try {
          const sb = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await sb
            .from("site_settings")
            .select("value")
            .eq("key", "adsense")
            .maybeSingle();
          const v = (data?.value ?? {}) as {
            client?: string;
            ads_txt?: string;
          };
          // Manual override wins (lets user paste multi-network ads.txt from AdSense/AdX).
          if (v.ads_txt && v.ads_txt.trim()) {
            body = v.ads_txt.trim() + "\n";
          } else if (v.client && /^ca-pub-\d+$/.test(v.client.trim())) {
            const pub = v.client.trim().replace(/^ca-/, "");
            body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;
          }
        } catch {
          // fall through to empty body
        }
        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=600",
          },
        });
      },
    },
  },
});
