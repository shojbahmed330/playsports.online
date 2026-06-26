import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: {
    name: string;
    email: string;
    subject?: string;
    body: string;
    hp?: string;
  }) => {
    if (input?.hp) throw new Error("rejected");
    const name = String(input?.name ?? "").trim();
    const email = String(input?.email ?? "").trim().toLowerCase();
    const subject = String(input?.subject ?? "").trim().slice(0, 200);
    const body = String(input?.body ?? "").trim();
    if (name.length < 1 || name.length > 100) throw new Error("Name required (max 100)");
    if (!emailRe.test(email) || email.length > 255) throw new Error("Valid email required");
    if (body.length < 1 || body.length > 4000) throw new Error("Message required (max 4000)");
    return { name, email, subject, body };
  })
  .handler(async ({ data }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      body: data.body,
    });
    if (error) throw new Error(error.message || "Send failed");
    return { ok: true };
  });
