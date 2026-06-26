import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; source?: string; hp?: string }) => {
    const email = String(input?.email ?? "").trim().toLowerCase();
    if (input?.hp) throw new Error("rejected");
    if (!emailRe.test(email) || email.length > 255) throw new Error("Invalid email");
    return {
      email,
      source: (input.source ?? "homepage").slice(0, 60),
    };
  })
  .handler(async ({ data }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: data.email, source: data.source, consent_marketing: true });
    if (error) {
      const msg = String(error.message ?? "");
      if (/duplicate|unique/i.test(msg)) return { ok: true, already: true };
      throw new Error(msg || "Subscribe failed");
    }
    return { ok: true, already: false };
  });
